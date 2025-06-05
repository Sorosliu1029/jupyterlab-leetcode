import { ReactWidget } from '@jupyterlab/ui-components';
import React from 'react';
import BrowserCookie from './components/BrowserCookie';

const LeetCodeComponent = (): JSX.Element => {
  return (
    <div>
      <p>Welcome to JupyterLab LeetCode Widget.</p>
      <BrowserCookie />
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
