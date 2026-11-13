import React, { useEffect, useState } from 'react';

import { Container, Group, Text, Anchor, Paper, Loader } from '@mantine/core';
import classes from '../styles/LandingPage.module.css';
import Footer from './Footer';
import BrowserMenu from './BrowserMenu';
import { getCookie } from '../services/cookie';
import {
  currentBrowserSignals,
  detectBrowserCandidates,
  IBrowserCandidate
} from '../services/browserDetect';

export const LeetCodeMainColor = '#FEA512';
export const LeetCodeSecondColor = '#FFDB01';
const LeetCdoeGradient = { from: LeetCodeMainColor, to: LeetCodeSecondColor };

// Try each candidate in order, resolve with the first one holding a valid LeetCode login
const loadCookieFromCandidates = async (
  candidates: IBrowserCandidate[]
): Promise<boolean> => {
  for (const { key } of candidates) {
    try {
      const resp = await getCookie(key);
      if (resp['checked']) {
        return true;
      }
    } catch {
      // browser not installed or cookies unreadable, try the next one
    }
  }
  return false;
};

const LandingPage: React.FC<{
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setIsLoggedIn }) => {
  const [candidates] = useState(() =>
    detectBrowserCandidates(currentBrowserSignals())
  );
  const [detecting, setDetecting] = useState(candidates.length > 0);

  useEffect(() => {
    if (!candidates.length) {
      return;
    }
    let cancelled = false;
    loadCookieFromCandidates(candidates).then(found => {
      if (cancelled) {
        return;
      }
      if (found) {
        setIsLoggedIn(true);
      } else {
        setDetecting(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [candidates]);

  const browserNames = candidates.map(c => c.name).join(' / ');

  return (
    <Paper>
      <Container size={700} pt={200}>
        <h1 className={classes.title}>
          Welcome to{' '}
          <Text
            component="span"
            variant="gradient"
            gradient={LeetCdoeGradient}
            inherit
          >
            JupyterLab LeetCode
          </Text>{' '}
          plugin
        </h1>

        {detecting ? (
          <Group className={classes.controls}>
            <Loader size="sm" color={LeetCodeMainColor} />
            <Text c="dimmed">
              Looking for your LeetCode login in {browserNames}...
            </Text>
          </Group>
        ) : (
          <>
            <Text className={classes.description} c="dimmed">
              {candidates.length
                ? `No LeetCode login found in ${browserNames}. `
                : ''}
              Please{' '}
              <Anchor
                href="https://leetcode.com/accounts/login/"
                target="_blank"
                variant="gradient"
                gradient={LeetCdoeGradient}
                className={classes.description}
              >
                log into LeetCode
              </Anchor>
              <sup>*</sup> in a browser, then load the login from it.
            </Text>

            <Group className={classes.controls}>
              <BrowserMenu onCheckSuccess={() => setIsLoggedIn(true)} />
            </Group>
          </>
        )}

        <Text
          size="sm"
          c="dimmed"
          mt="calc(var(--mantine-spacing-xl) * 2)"
          mb="sm"
        >
          * leetcode.cn not supported yet.
        </Text>

        <Footer />
      </Container>
    </Paper>
  );
};

export default LandingPage;
