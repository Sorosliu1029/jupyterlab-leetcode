import React from 'react';
import BrowserCookie from './BrowserCookie';

import { Button, Container, Group, Text, Tooltip, Anchor } from '@mantine/core';
import { IconBrandGithub, IconBrandLinkedin } from '@tabler/icons-react';
import classes from '../styles/LandingPage.module.css';
import Footer from './Footer';

const LeetCdoeGradient = { from: '#FEA512', to: '#FFDB01' };

const LandingPage: React.FC<{
  setCookieLoggedIn: (b: string) => void;
}> = ({ setCookieLoggedIn }) => {
  const options: JSX.Element[] = [
    <BrowserCookie
      setCookieLoggedIn={setCookieLoggedIn}
      className={classes.control}
    />,
    <Tooltip label="Not implemented yet, contributions are welcome!">
      <Button
        size="md"
        className={classes.control}
        variant="filled"
        data-disabled
        onClick={e => e.preventDefault()}
        leftSection={<IconBrandGithub size={20} />}
      >
        GitHub Login
      </Button>
    </Tooltip>,
    <Tooltip label="Not implemented yet, contributions are welcome!">
      <Button
        size="md"
        className={classes.control}
        variant="filled"
        data-disabled
        onClick={e => e.preventDefault()}
        leftSection={<IconBrandLinkedin size={20} />}
      >
        LinkedIn Login
      </Button>
    </Tooltip>
  ];

  return (
    <div className={classes.wrapper}>
      <Container size={700} className={classes.inner}>
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

        <Text className={classes.description} c="dimmed">
          For this plugin to work, you may choose one of these {options.length}{' '}
          methods to allow this plugin to{' '}
          <Anchor
            href="https://leetcode.com/accounts/login/"
            target="_blank"
            variant="gradient"
            gradient={LeetCdoeGradient}
            className={classes.description}
          >
            log into LeetCode
          </Anchor>
          .
        </Text>

        <Group className={classes.controls}>{...options}</Group>

        <Footer />
      </Container>
    </div>
  );
};

export default LandingPage;
