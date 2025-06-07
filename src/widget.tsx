import { ReactWidget } from '@jupyterlab/ui-components';
import { IDocumentManager } from '@jupyterlab/docmanager';
import React, { StrictMode, useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import LeetCode from './components/LeetCode';
import { getCookie } from './services/cookie';

const LeetCodeComponent: React.FC<{ docManager: IDocumentManager }> = ({
  docManager
}) => {
  const [cookieLoggedIn, setCookieLoggedIn] = useState('');

  useEffect(() => {
    const leetcode_browser = document.cookie
      .split('; ')
      .find(cookie => cookie.startsWith('leetcode_browser='))
      ?.split('=')[1];
    if (leetcode_browser) {
      getCookie(leetcode_browser).then(resp => {
        if (resp['checked']) {
          setCookieLoggedIn(leetcode_browser);
        }
      });
    }
  });

  return cookieLoggedIn ? (
    <LeetCode docManager={docManager} />
  ) : (
    <LandingPage setCookieLoggedIn={b => setCookieLoggedIn(b)} />
  );
};

class LeetCodeWidget extends ReactWidget {
  docManager: IDocumentManager;

  constructor(docManager: IDocumentManager) {
    super();
    this.id = 'JupyterlabLeetcodeWidget';
    this.addClass('jupyterlab-leetcode-widget');
    this.docManager = docManager;
  }

  render(): JSX.Element {
    return (
      <StrictMode>
        <LeetCodeComponent docManager={this.docManager} />
      </StrictMode>
    );
  }
}

export default LeetCodeWidget;
