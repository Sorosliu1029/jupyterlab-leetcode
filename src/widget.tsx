import { ReactWidget } from '@jupyterlab/ui-components';
import React, { StrictMode, useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import LeetCode from './components/LeetCode';
import { getCookie } from './services/cookie';

const LeetCodeComponent = (): JSX.Element => {
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
    <LeetCode />
  ) : (
    <LandingPage setCookieLoggedIn={b => setCookieLoggedIn(b)} />
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
