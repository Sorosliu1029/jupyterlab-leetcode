import React from 'react';
import { NotebookPanel } from '@jupyterlab/notebook';
import { submitNotebook } from '../services/notebook';

const LeetCodeNotebookHeader: React.FC<{ notebook: NotebookPanel }> = ({
  notebook
}) => {
  const submit = () => {
    notebook.context.save().then(() => {
      const path = notebook.context.path;
      submitNotebook(path).then(() => {
        console.log('Notebook submitted successfully');
      });
    });
  };

  return (
    <div>
      <button onClick={submit}>Submit</button>
    </div>
  );
};

export default LeetCodeNotebookHeader;
