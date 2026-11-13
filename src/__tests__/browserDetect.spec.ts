import { detectBrowserCandidates } from '../services/browserDetect';

const keys = (userAgent: string, extra = {}) =>
  detectBrowserCandidates({ userAgent, ...extra }).map(c => c.key);

const CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';

describe('detectBrowserCandidates', () => {
  it('tries Zen and other Firefox forks for a Firefox user agent', () => {
    // Zen sends a plain Firefox user agent
    expect(
      keys(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:144.0) Gecko/20100101 Firefox/144.0'
      )
    ).toEqual(['zen', 'firefox', 'librewolf']);
  });

  it('detects Edge, Opera and Vivaldi from their tokens', () => {
    expect(keys(`${CHROME_UA} Edg/141.0.0.0`)).toEqual(['edge']);
    expect(keys(`${CHROME_UA} OPR/120.0.0.0`)).toEqual(['opera', 'opera_gx']);
    expect(keys(`${CHROME_UA} Vivaldi/7.6`)).toEqual(['vivaldi']);
  });

  it('uses JS signals for Brave and Arc', () => {
    expect(keys(CHROME_UA, { isBrave: true })).toEqual(['brave']);
    expect(keys(CHROME_UA, { isArc: true })).toEqual(['arc']);
  });

  it('falls back to Chrome for a plain Chromium user agent', () => {
    expect(keys(CHROME_UA)).toEqual(['chrome', 'chromium']);
  });

  it('returns nothing for Safari', () => {
    expect(
      keys(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15'
      )
    ).toEqual([]);
  });
});
