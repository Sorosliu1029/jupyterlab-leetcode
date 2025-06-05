import React, { useEffect, useState } from 'react';
import { getCookie } from '../services/cookie';
import Bowser from 'bowser';

const BrowserCookie = ({
  setCookieLoggedIn
}: {
  setCookieLoggedIn: (b: string) => void;
}) => {
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

  const normalizeBrowserName = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '_');

  const [browser, setBrowser] = useState('');
  const [checked, setChecked] = useState(false);

  // set browser value by detecting current browser
  useEffect(() => {
    const browserName = Bowser.getParser(
      window.navigator.userAgent
    ).getBrowserName(true);
    if (browserName) {
      const firstMatch = browsers.find(b =>
        new RegExp(b, 'i').test(browserName)
      );
      if (firstMatch) {
        setBrowser(normalizeBrowserName(firstMatch));
      }
    }
  }, []);

  useEffect(() => {
    if (checked) {
      setCookieLoggedIn(browser);
    }
  }, [checked, setCookieLoggedIn]);

  const checkCookie = () => {
    // TODO: change alert
    if (!browser) {
      alert('Please select a browser.');
      return;
    }
    if (browser === 'safari') {
      alert(
        'Safari does not support getting cookies from the browser. Please use another browser.'
      );
      return;
    }

    getCookie(browser).then(resp => {
      setChecked(resp['checked']);
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
            value={normalizeBrowserName(browser)}
          >
            {browser}
          </option>
        ))}
      </select>
      <button onClick={checkCookie}>Check</button>
      <p>Checked: {checked ? 'Yes' : 'No'}</p>
    </div>
  );
};

export default BrowserCookie;
