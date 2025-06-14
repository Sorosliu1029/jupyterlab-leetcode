import React, { useEffect, useState } from 'react';
import { Notification } from '@jupyterlab/apputils';
import { NotebookPanel, NotebookActions } from '@jupyterlab/notebook';
import { ToolbarButtonComponent } from '@jupyterlab/ui-components';
import { ICellModel } from '@jupyterlab/cells';
import { PromiseDelegate, ReadonlyJSONValue } from '@lumino/coreutils';
import { submitNotebook } from '../services/notebook';
import { makeWebSocket } from '../services/handler';
import { LeetCodeIcon } from '../icons/leetcode';
import {
  LeetCodeSubmissionResult,
  LeetCodeWebSocketMessage
} from '../types/leetcode';

const status2Emoji = (status: string) => {
  switch (status) {
    case 'Accepted':
      return '😃';
    case 'Wrong Answer':
      return '🐛';
    case 'Time Limit Exceeded':
      return '⏳';
    case 'Memory Limit Exceeded':
      return '💾';
    case 'Runtime Error':
      return '🚨';
    case 'Internal Error':
      return '⚠️';
    default:
      return '❓';
  }
};

const formatMarkdown = (text: string) => {
  return text.replace(/\n/g, '  \n');
};

const LeetCodeNotebookToolbar: React.FC<{ notebook: NotebookPanel }> = ({
  notebook
}) => {
  const [submissionId, setSubmissionId] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsRetries, setWsRetries] = useState(0);
  const [result, setResult] = useState<LeetCodeSubmissionResult | null>(null);
  const [submitPromise, setSubmitPromise] =
    useState<PromiseDelegate<ReadonlyJSONValue> | null>(null);

  const submit = () => {
    notebook.context.save().then(() => {
      const path = notebook.context.path;
      submitNotebook(path)
        .then(({ submission_id }) => {
          setSubmissionId(submission_id);
        })
        .catch(e => Notification.error(e.message, { autoClose: 3000 }));
    });
  };

  const makeWs = (submissionId: number) => {
    const ws = makeWebSocket(`submit?submission_id=${submissionId}`);
    ws.onmessage = event => {
      console.debug('WebSocket message received:', event.data);
      const data = JSON.parse(event.data) as LeetCodeWebSocketMessage;
      if (data.submissionId !== submissionId) {
        return;
      }
      switch (data.type) {
        case 'submissionResult': {
          setResult(data.result);
          break;
        }
        case 'error': {
          Notification.error(data.error, { autoClose: 3000 });
          break;
        }
      }
    };
    return ws;
  };

  const getResultCell = () => {
    const cells = notebook.content.model?.cells ?? [];
    let resultCellModel = Array.from(cells).find(
      c => c.metadata['id'] === 'result'
    );
    if (!resultCellModel) {
      const activeCellIdx = cells.length ? cells.length - 1 : 0;
      notebook.content.activeCellIndex = activeCellIdx;
      NotebookActions.insertBelow(notebook.content);
      const activeCell = notebook.content.activeCell;
      if (activeCell) {
        resultCellModel = activeCell.model;
        resultCellModel.setMetadata('id', 'result');
      }
    }
    return resultCellModel;
  };

  const populateResultCell = (
    cellModel: ICellModel,
    result: Extract<LeetCodeSubmissionResult, { state: 'SUCCESS' }>
  ) => {
    let source = '';
    switch (result.status_msg) {
      case 'Accepted': {
        source =
          formatMarkdown(`${status2Emoji(result.status_msg)} Result: ${result.status_msg}
💯 Passed Test Case: ${result.total_correct} / ${result.total_testcases}
🚀 Runtime: ${result.status_runtime}, Memory: ${result.status_memory}
🉑 Runtime Percentile: better than ${result.runtime_percentile?.toFixed(2)}%, Memory Percentile: better than ${result.memory_percentile?.toFixed(2)}%
📆 Finished At: ${new Date(result.task_finish_time).toUTCString()}`);
        break;
      }
      case 'Wrong Answer':
      case 'Time Limit Exceeded':
      case 'Memory Limit Exceeded':
      case 'Runtime Error':
      case 'Internal Error': {
        source =
          formatMarkdown(`${status2Emoji(result.status_msg)} Result: ${result.status_msg}
📥 Input: \`${result.input_formatted}\`
📤 Output: \`${result.code_output}\`
✅ Expected: \`${result.expected_output}\`
💯 Passed Test Case: ${result.total_correct} / ${result.total_testcases}`);
        break;
      }
    }
    cellModel.sharedModel.setSource(source);
  };

  const saveResult = (
    result: Extract<LeetCodeSubmissionResult, { state: 'SUCCESS' }>
  ) => {
    notebook.content.model?.setMetadata('leetcode_submission_result', result);
  };

  // one websocket per submission
  useEffect(() => {
    if (!submissionId) {
      return;
    }
    setWs(makeWs(submissionId));
    setWsRetries(0);
    setResult(null);
    setSubmitPromise(new PromiseDelegate<ReadonlyJSONValue>());
  }, [submissionId]);

  // reconnect websocket
  useEffect(() => {
    if (!ws) {
      return;
    }
    if (ws.readyState === WebSocket.CLOSED) {
      if (wsRetries < 10) {
        setTimeout(() => {
          console.log('Reconnecting WebSocket...');
          setWs(makeWs(submissionId));
        }, 1000);
        setWsRetries(wsRetries + 1);
      } else {
        submitPromise?.reject({
          error: '🔴 Error: WebSocket connection failed after 10 retries.'
        });
      }
    }
  }, [ws, ws?.readyState]);

  // notification after submit
  useEffect(() => {
    if (!submitPromise) {
      return;
    }

    Notification.promise(submitPromise.promise, {
      pending: { message: '⏳ Pending...', options: { autoClose: false } },
      success: {
        message: (result: any) => result.message,
        options: { autoClose: 3000 }
      },
      error: {
        message: (result: any) => result.error,
        options: { autoClose: 3000 }
      }
    });
  }, [submitPromise]);

  // render result cell to notebook
  useEffect(() => {
    if (result?.state !== 'SUCCESS') {
      return;
    }
    const msg = `${status2Emoji(result.status_msg)} Result: ${result.status_msg}`;
    if (result.status_msg === 'Accepted') {
      submitPromise?.resolve({ message: msg });
    } else {
      submitPromise?.reject({ error: msg });
    }
    const resultCellModel = getResultCell();
    if (resultCellModel) {
      populateResultCell(resultCellModel, result);
      NotebookActions.changeCellType(notebook.content, 'markdown');
      NotebookActions.run(notebook.content);
      saveResult(result);
      notebook.context.save();
    }
  }, [result?.state]);

  return (
    <ToolbarButtonComponent
      onClick={submit}
      tooltip="Submit to LeetCode"
      icon={LeetCodeIcon}
    />
  );
};

export default LeetCodeNotebookToolbar;
