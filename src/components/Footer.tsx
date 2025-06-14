import React from 'react';
import { Anchor, Group } from '@mantine/core';
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
    <Group
      justify="space-between"
      pt="md"
      style={{
        borderTop:
          '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))'
      }}
    >
      <IconBrandLeetcode size={28} />
      <Group>
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
    </Group>
  );
};

export default Footer;
