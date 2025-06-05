import { ReactWidget } from '@jupyterlab/ui-components';
import React, { StrictMode, useState } from 'react';
import LandingPage from './components/LandingPage';

const LeetCodeComponent = (): JSX.Element => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  return isLoggedIn ? (
    <div></div>
  ) : (
    <LandingPage onLoginSuccess={() => setIsLoggedIn(true)} />
  );
};

class LeetCodeWidget extends ReactWidget {
  constructor() {
    super();
    this.id = 'JupyterlabLeetcodeWidget';
    this.addClass('jupyterlab-leetcode-widget');
  }

  protected render(): JSX.Element {
    return (
      <StrictMode>
        <LeetCodeComponent />
      </StrictMode>
    );
  }
}

export default LeetCodeWidget;
