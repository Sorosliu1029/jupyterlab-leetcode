import React, { useEffect, useState } from 'react';
import { NotebookPanel } from '@jupyterlab/notebook';
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

  return (
    <div>
      <button onClick={submit}>Submit</button>
      <span>Result: {result ? JSON.stringify(result) : 'No result yet'}</span>
    </div>
  );
};

export default LeetCodeNotebookHeader;
