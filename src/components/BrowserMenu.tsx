import React from 'react';
import { Notification } from '@jupyterlab/apputils';
import {
  IconChevronDown,
  IconBrandChrome,
  IconBrandFirefox,
  IconBrandEdge,
  IconBrandSafari,
  IconBrandOpera,
  IconBrandVivaldi,
  IconBrandArc,
  IconWorldWww
} from '@tabler/icons-react';
import { Button, Menu, useMantineTheme } from '@mantine/core';
import { getCookie } from '../services/cookie';

const BrowserIconProps = { size: 16, stroke: 1.5 };

const Browsers = [
  {
    name: 'Chrome',
    icon: (color: string) => (
      <IconBrandChrome color={color} {...BrowserIconProps} />
    )
  },
  {
    name: 'Firefox',
    icon: (color: string) => (
      <IconBrandFirefox color={color} {...BrowserIconProps} />
    )
  },
  {
    name: 'Safari',
    icon: (color: string) => (
      <IconBrandSafari color={color} {...BrowserIconProps} />
    )
  },
  {
    name: 'Edge',
    icon: (color: string) => (
      <IconBrandEdge color={color} {...BrowserIconProps} />
    )
  },
  {
    name: 'Opera',
    icon: (color: string) => (
      <IconBrandOpera color={color} {...BrowserIconProps} />
    )
  },
  {
    name: 'Brave',
    icon: (color: string) => (
      <IconWorldWww color={color} {...BrowserIconProps} />
    )
  },
  {
    name: 'Vivaldi',
    icon: (color: string) => (
      <IconBrandVivaldi color={color} {...BrowserIconProps} />
    )
  },
  {
    name: 'Chromium',
    icon: (color: string) => (
      <IconBrandChrome color={color} {...BrowserIconProps} />
    )
  },
  {
    name: 'Arc',
    icon: (color: string) => (
      <IconBrandArc color={color} {...BrowserIconProps} />
    )
  },
  {
    name: 'LibreWolf',
    icon: (color: string) => (
      <IconWorldWww color={color} {...BrowserIconProps} />
    )
  },
  {
    name: 'Opera GX',
    icon: (color: string) => (
      <IconBrandOpera color={color} {...BrowserIconProps} />
    )
  }
];

const BrowserMenu: React.FC<{
  onCheckSuccess: () => void;
}> = ({ onCheckSuccess }) => {
  const checkBrowser = (browser: string) => {
    if (!browser) {
      return;
    }
    if (browser === 'Safari') {
      Notification.error(
        'Safari does not support getting cookies from the browser. Please use another browser.',
        { autoClose: 3000 }
      );
      return;
    }

    getCookie(browser.toLowerCase().replace(/\s+/g, '_'))
      .then(resp => {
        if (!resp['checked']) {
          Notification.error(
            `Failed to check cookie for ${browser}. Have you logged in LeetCode in ${browser}?`,
            { autoClose: 5000 }
          );
          return;
        }
        onCheckSuccess();
      })
      .catch(e => Notification.error(e.message, { autoClose: 3000 }));
  };

  const theme = useMantineTheme();
  return (
    <Menu
      transitionProps={{ transition: 'pop-top-right' }}
      position="bottom-end"
      width={220}
      withinPortal
      radius="md"
    >
      <Menu.Target>
        <Button
          rightSection=<IconChevronDown size={18} stroke={1.5} />
          pr={12}
          radius="md"
          size="md"
        >
          Load from browser
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Where LeetCode logged in:</Menu.Label>
        {Browsers.map(({ name, icon }) => (
          <Menu.Item
            key={name}
            leftSection={icon(theme.colors.blue[6])}
            onClick={() => checkBrowser(name)}
          >
            {name}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default BrowserMenu;
