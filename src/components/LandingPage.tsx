import React from 'react';

import {
  Button,
  Container,
  Group,
  Text,
  Tooltip,
  Anchor,
  Paper
} from '@mantine/core';
import { IconBrandGithub, IconBrandLinkedin } from '@tabler/icons-react';
import classes from '../styles/LandingPage.module.css';
import Footer from './Footer';
import BrowserMenu from './BrowserMenu';

export const LeetCodeMainColor = '#FEA512';
export const LeetCodeSecondColor = '#FFDB01';
const LeetCdoeGradient = { from: LeetCodeMainColor, to: LeetCodeSecondColor };

const LandingPage: React.FC<{
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setIsLoggedIn }) => {
  const options: JSX.Element[] = [
    <BrowserMenu onCheckSuccess={() => setIsLoggedIn(true)} />,
    <Tooltip label="Not implemented yet, contributions are welcome!">
      <Button
        size="md"
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
          <sup>*</sup>
        </Text>

        <Group className={classes.controls}>{...options}</Group>

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
