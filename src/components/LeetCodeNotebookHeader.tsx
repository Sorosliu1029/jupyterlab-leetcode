import React, { useEffect, useState } from 'react';
import { NotebookPanel, NotebookActions } from '@jupyterlab/notebook';
import { ICellModel } from '@jupyterlab/cells';
import { submitNotebook } from '../services/notebook';
import { makeWebSocket } from '../services/handler';
import {
  LeetCodeSubmissionResult,
  LeetCodeWebSocketMessage
} from '../types/leetcode';

const status2Emoji = (status: string) => {
  switch (status) {
    case 'Accepted':
      return '😃';
    case 'Wrong Answer':
      return '😕';
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

const LeetCodeNotebookHeader: React.FC<{ notebook: NotebookPanel }> = ({
  notebook
}) => {
  const [submissionId, setSubmissionId] = useState(0);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [wsRetries, setWsRetries] = useState(0);
  const [result, setResult] = useState<LeetCodeSubmissionResult | null>(null);

  const submit = () => {
    notebook.context.save().then(() => {
      const path = notebook.context.path;
      submitNotebook(path)
        .then(({ submission_id }) => {
          setSubmissionId(submission_id);
        })
        .catch(console.error);
    });
  };

  const makeWs = (submissionId: number) => {
    const ws = makeWebSocket(`submit?submission_id=${submissionId}`);
    ws.onmessage = event => {
      console.log('WebSocket message received:', event.data);
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
          console.error('Error from WebSocket:', data.error);
          break;
        }
      }
    };
    return ws;
  };

  const getResultCell = () => {
    let resultCellModel: ICellModel | null = null;
    const cells = notebook.content.model?.cells ?? [];
    for (const cell of cells) {
      if (cell.metadata['id'] === 'result') {
        resultCellModel = cell;
      }
    }
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

  // one websocket per submission
  useEffect(() => {
    if (!submissionId) {
      return;
    }
    setWs(makeWs(submissionId));
    setWsRetries(0);
    setResult(null);
  }, [submissionId]);

  // reconnect websocket
  useEffect(() => {
    if (!ws) {
      return;
    }
    if (ws.readyState === WebSocket.CLOSED && wsRetries < 10) {
      setTimeout(() => {
        console.log('Reconnecting WebSocket...');
        setWs(makeWs(submissionId));
      }, 1000);
      setWsRetries(wsRetries + 1);
    }
  }, [ws, ws?.readyState]);

  // render result cell to notebook
  useEffect(() => {
    if (result?.state !== 'SUCCESS') {
      return;
    }
    const resultCellModel = getResultCell();
    if (resultCellModel) {
      populateResultCell(resultCellModel, result);
      NotebookActions.changeCellType(notebook.content, 'markdown');
      NotebookActions.run(notebook.content);
      notebook.context.save();
    }
  }, [result?.state]);

  return (
    <div>
      <button onClick={submit}>Submit</button>
      <span>Result: {result ? JSON.stringify(result) : 'No result yet'}</span>
    </div>
  );
};

export default LeetCodeNotebookHeader;
