import { Anchor } from '@mantine/core';
import React from 'react';
import classes from '../styles/LeetCodeMain.module.css';

const Repo = 'https://github.com/Sorosliu1029/jupyterlab-leetcode';

const Links = [
  { label: 'Report an issue', href: `${Repo}/issues/new/choose` },
  { label: 'Star on GitHub', href: Repo },
  { label: 'Contribute', href: `${Repo}/blob/master/CONTRIBUTING.md` },
  { label: 'Sponsor', href: 'https://github.com/Sorosliu1029' }
];

// links about this extension, kept apart from the user's own stats
const ProjectLinks: React.FC = () => {
  return (
    <footer className={classes.footer}>
      <Anchor
        href="https://jupyterlab-leetcode.sorosliu.xyz/"
        target="_blank"
        className={classes.footer_name}
      >
        jupyterlab-leetcode
      </Anchor>
      <nav className={classes.footer_links} aria-label="About this extension">
        {Links.map(l => (
          <Anchor key={l.label} href={l.href} target="_blank">
            {l.label}
          </Anchor>
        ))}
      </nav>
    </footer>
  );
};

export default ProjectLinks;
