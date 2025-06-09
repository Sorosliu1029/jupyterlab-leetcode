import React, { useEffect, useState } from 'react';
import { NotebookPanel, NotebookActions } from '@jupyterlab/notebook';
import { ICellModel } from '@jupyterlab/cells';
import { submitNotebook } from '../services/notebook';
import { makeWebSocket } from '../services/handler';
import {
  LeetCodeSubmissionResult,
  LeetCodeWebSocketMessage
} from '../types/leetcode';

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
        source = `# Accepted\n\nRuntime: ${result.display_runtime}\nMemory: ${result.status_memory}\n\nOutput:\n\`\`\`\n${result.code_output}\n\`\`\``;
        break;
      }
      case 'Wrong Answer': {
        source = `# Wrong Answer\n\nExpected: ${result.expected_output}\nGot: ${result.code_output}\n\nInput:\n\`\`\`\n${result.input_formatted}\n\`\`\``;
        break;
      }
      case 'Time Limit Exceeded': {
        source = `# Time Limit Exceeded\n\nRuntime: ${result.display_runtime}\nMemory: ${result.status_memory}\n\nInput:\n\`\`\`\n${result.input_formatted}\n\`\`\``;
        break;
      }
      case 'Memory Limit Exceeded': {
        source = `# Memory Limit Exceeded\n\nRuntime: ${result.display_runtime}\nMemory: ${result.status_memory}\n\nInput:\n\`\`\`\n${result.input_formatted}\n\`\`\``;
        break;
      }
      case 'Runtime Error': {
        source = `# Runtime Error\n\nRuntime: ${result.display_runtime}\nMemory: ${result.status_memory}\n\nOutput:\n\`\`\`\n${result.code_output}\n\`\`\`\n\nInput:\n\`\`\`\n${result.input_formatted}\n\`\`\``;
        break;
      }
      case 'Internal Error': {
        source = `# Internal Error\n\nRuntime: ${result.display_runtime}\nMemory: ${result.status_memory}\n\nOutput:\n\`\`\`\n${result.code_output}\n\`\`\`\n\nInput:\n\`\`\`\n${result.input_formatted}\n\`\`\``;
        break;
      }
    }
    cellModel.sharedModel.setSource(source);
  };

  useEffect(() => {
    if (!submissionId) {
      return;
    }
    setWs(makeWs(submissionId));
    setWsRetries(0);
    setResult(null);
  }, [submissionId]);

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

  useEffect(() => {
    if (result?.state !== 'SUCCESS') {
      return;
    }
    const resultCellModel = getResultCell();
    if (resultCellModel) {
      populateResultCell(resultCellModel, result);
      NotebookActions.changeCellType(notebook.content, 'markdown');
      NotebookActions.run(notebook.content);
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
