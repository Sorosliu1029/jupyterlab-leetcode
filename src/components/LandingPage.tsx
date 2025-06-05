import React from 'react';
import BrowserCookie from './BrowserCookie';

const LandingPage = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const options: JSX.Element[] = [<BrowserCookie onSuccess={onLoginSuccess} />];
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

export default LandingPage;
