export interface IBrowserSignals {
  userAgent: string;
  isBrave?: boolean;
  isArc?: boolean;
}

export interface IBrowserCandidate {
  // display name, matches `BrowserMenu`
  name: string;
  // server-side key, see `BROWSER_COOKIE_METHOD_MAP`
  key: string;
}

const candidate = (name: string, key: string): IBrowserCandidate => ({
  name,
  key
});

/**
 * Guess which browsers the page may be running in, most likely first.
 *
 * Several browsers share a user agent with their upstream (Zen and LibreWolf
 * look exactly like Firefox), so this returns every plausible match and the
 * caller tries each one until LeetCode cookies are found.
 */
export const detectBrowserCandidates = ({
  userAgent,
  isBrave,
  isArc
}: IBrowserSignals): IBrowserCandidate[] => {
  const ua = userAgent;

  if (/Firefox\//.test(ua)) {
    return [
      candidate('Zen', 'zen'),
      candidate('Firefox', 'firefox'),
      candidate('LibreWolf', 'librewolf')
    ];
  }
  if (/Edg\//.test(ua)) {
    return [candidate('Edge', 'edge')];
  }
  if (/OPR\//.test(ua)) {
    return [candidate('Opera', 'opera'), candidate('Opera GX', 'opera_gx')];
  }
  if (/Vivaldi\//.test(ua)) {
    return [candidate('Vivaldi', 'vivaldi')];
  }
  if (isBrave) {
    return [candidate('Brave', 'brave')];
  }
  if (isArc) {
    return [candidate('Arc', 'arc')];
  }
  if (/Chrome\//.test(ua)) {
    return [candidate('Chrome', 'chrome'), candidate('Chromium', 'chromium')];
  }
  // Safari cookies can't be read, other browsers are unknown
  return [];
};

export const currentBrowserSignals = (): IBrowserSignals => ({
  userAgent: navigator.userAgent,
  isBrave: 'brave' in navigator,
  isArc: !!getComputedStyle(document.documentElement).getPropertyValue(
    '--arc-palette-title'
  )
});
