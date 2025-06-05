import { ReactWidget } from '@jupyterlab/ui-components';
import React from 'react';
import BrowserCookie from './components/BrowserCookie';

const LeetCodeComponent = (): JSX.Element => {
  const options: JSX.Element[] = [<BrowserCookie />];
  return (
    <div>
      <p>Welcome to JupyterLab LeetCode Widget.</p>
      <p>
        For this plugin to work, you may choose one of these {options.length}{' '}
        methods to allow this plugin to log into LeetCode.
      </p>
      {...options}
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
