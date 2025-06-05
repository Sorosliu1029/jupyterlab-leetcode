import React, { useState } from 'react';
import { getCookie } from '../services/cookie';

const BrowserCookie = () => {
  const browsers = [
    'Chrome',
    'Firefox',
    'Safari',
    'Edge',
    'Opera',
    'Brave',
    'Vivaldi',
    'Chromium',
    'Arc',
    'LibreWolf',
    'Opera GX'
  ];

  const [browser, setBrowser] = useState('');
  const [checked, setChecked] = useState(false);

  const loadCookies = () => {
    if (!browser) {
      alert('Please select a browser.');
      return;
    }
    if (browser === 'safari') {
      alert(
        'Safari does not support loading cookies from the browser. Please use another browser.'
      );
      return;
    }

    getCookie('all', browser).then(cookies => {
      if (cookies && cookies['LEETCODE_SESSION'] && cookies['csrftoken']) {
        setChecked(true);
      }
    });
  };

  return (
    <div>
      <label htmlFor="browser-selector">
        Choose your browser that has LeetCode logged in:
      </label>
      <select
        id="browser-selector"
        required
        value={browser}
        onChange={e => setBrowser(e.target.value)}
      >
        <option value="" disabled>
          Select a browser
        </option>
        {browsers.map(browser => (
          <option
            key={browser.toLowerCase()}
            value={browser.toLowerCase().replace(/\s+/g, '_')}
          >
            {browser}
          </option>
        ))}
      </select>
      <button onClick={loadCookies}>Load</button>
      <p>Checked: {checked ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default BrowserCookie;
