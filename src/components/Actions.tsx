import {
  Anchor,
  Center,
  Paper,
  PaperProps,
  Stack,
  ThemeIcon,
  Tooltip
} from '@mantine/core';
import {
  IconCircleDot,
  IconGitPullRequest,
  IconHeart,
  IconStar
} from '@tabler/icons-react';
import React from 'react';

const IconStyle = { width: '70%', height: '70%' };

const Data = [
  {
    label: 'Issue!',
    href: 'https://github.com/Sorosliu1029/jupyterlab-leetcode/issues/new/choose',
    icon: <IconCircleDot style={IconStyle} />
  },
  {
    label: 'Star!',
    href: 'https://github.com/Sorosliu1029/jupyterlab-leetcode',
    icon: <IconStar style={IconStyle} />
  },
  {
    label: 'Contribute!',
    href: 'https://github.com/Sorosliu1029/jupyterlab-leetcode/blob/master/CONTRIBUTING.md',
    icon: <IconGitPullRequest style={IconStyle} />
  },
  {
    label: 'Sponsor!',
    href: 'https://github.com/Sorosliu1029',
    icon: <IconHeart style={IconStyle} />
  }
];

const Actions: React.FC<{
  paperProps: PaperProps;
}> = ({ paperProps }) => {
  return (
    <Paper {...paperProps} style={{ alignContent: 'center' }}>
      <Center>
        <Stack gap="xs">
          {Data.map(item => (
            <Tooltip label={item.label} key={item.label}>
              <Anchor
                size="sm"
                target="_blank"
                underline="never"
                href={item.href}
              >
                <ThemeIcon size="sm" variant="white">
                  {item.icon}
                </ThemeIcon>
              </Anchor>
            </Tooltip>
          ))}
        </Stack>
      </Center>
    </Paper>
  );
};

export default Actions;
