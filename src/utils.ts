export const getLeetCodeBrowserCookie = () =>
  document.cookie
    .split('; ')
    .find(cookie => cookie.startsWith('leetcode_browser='));
