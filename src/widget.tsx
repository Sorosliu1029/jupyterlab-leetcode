import { ReactWidget } from '@jupyterlab/ui-components';
import React from 'react';

const LeetCodeComponent = (): JSX.Element => {
  return (
    <div>
      <p>Welcome to JupyterLab LeetCode Widget.</p>
    </div>
  );
};

class LeetCodeWidget extends ReactWidget {
  constructor() {
    super();
    this.id = 'JupyterlabLeetcodeWidget';
    this.addClass('jupyterlab-leetcode-widget');
  }

  protected render(): JSX.Element {
    return <LeetCodeComponent />;
  }
}

export default LeetCodeWidget;
