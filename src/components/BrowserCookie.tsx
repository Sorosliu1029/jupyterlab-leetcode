import React from 'react';

const BrowserCookie = () => {
  const loadCookies = () => {
    console.log('Loading cookies from leetcode.com');
  };

  return (
    <div>
      <button onClick={loadCookies}>Load</button>
    </div>
  );
};

export default BrowserCookie;
