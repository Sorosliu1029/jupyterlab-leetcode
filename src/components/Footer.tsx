import React from 'react';
import { Anchor, Container, Group } from '@mantine/core';
import classes from '../styles/Footer.module.css';
import { IconBrandLeetcode } from '@tabler/icons-react';

const Links = [
  {
    link: 'https://github.com/Sorosliu1029/jupyterlab-leetcode',
    label: 'GitHub'
  },
  { link: 'https://pypi.org/project/jupyterlab-leetcode/', label: 'PyPi' },
  { link: 'https://www.npmjs.com/package/jupyterlab-leetcode', label: 'NPM' }
];

const Footer = () => {
  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <IconBrandLeetcode size={28} />
        <Group className={classes.links}>
          {Links.map(link => (
            <Anchor<'a'>
              c="dimmed"
              key={link.label}
              href={link.link}
              target="_blank"
              size="sm"
            >
              {link.label}
            </Anchor>
          ))}
        </Group>
      </Container>
    </div>
  );
};

export default Footer;
