import React, { useEffect, useState } from 'react';
import { IDocumentManager } from '@jupyterlab/docmanager';
import { JupyterFrontEnd } from '@jupyterlab/application';
import LandingPage from './LandingPage';
import LeetCode from './LeetCode';
import { getCookie } from '../services/cookie';

const LeetCodeMainArea: React.FC<{
  app: JupyterFrontEnd;
  docManager: IDocumentManager;
}> = ({ app, docManager }) => {
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
    <LeetCode app={app} docManager={docManager} />
  ) : (
    <LandingPage setCookieLoggedIn={b => setCookieLoggedIn(b)} />
  );
};

export default LeetCodeMainArea;
