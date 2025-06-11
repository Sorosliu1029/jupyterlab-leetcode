import React, { useEffect, useState } from 'react';
import { IDocumentManager } from '@jupyterlab/docmanager';
import LandingPage from './LandingPage';
import LeetCodeMain from './LeetCodeMain';
import { getCookie } from '../services/cookie';
import { Notification } from '@jupyterlab/apputils';

const JupyterMainArea: React.FC<{ docManager: IDocumentManager }> = ({
  docManager
}) => {
  const [cookieLoggedIn, setCookieLoggedIn] = useState('');

  useEffect(() => {
    const leetcode_browser = document.cookie
      .split('; ')
      .find(cookie => cookie.startsWith('leetcode_browser='))
      ?.split('=')[1];
    if (leetcode_browser) {
      getCookie(leetcode_browser)
        .then(resp => {
          if (resp['checked']) {
            setCookieLoggedIn(leetcode_browser);
          }
        })
        .catch(e => Notification.error(e.message, { autoClose: 3000 }));
    }
  });

  // FIXME: flash when refresh
  return cookieLoggedIn ? (
    <LeetCodeMain docManager={docManager} />
  ) : (
    <LandingPage setCookieLoggedIn={b => setCookieLoggedIn(b)} />
  );
};

export default JupyterMainArea;
