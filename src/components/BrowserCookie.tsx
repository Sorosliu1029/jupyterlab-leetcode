import React, { useEffect, useState } from 'react';
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

const BROWSERS = [
  {
    name: 'Chrome',
    icon: (color: string) => (
      <IconBrandChrome size={16} color={color} stroke={1.5} />
    )
  },
  {
    name: 'Firefox',
    icon: (color: string) => (
      <IconBrandFirefox size={16} color={color} stroke={1.5} />
    )
  },
  {
    name: 'Safari',
    icon: (color: string) => (
      <IconBrandSafari size={16} color={color} stroke={1.5} />
    )
  },
  {
    name: 'Edge',
    icon: (color: string) => (
      <IconBrandEdge size={16} color={color} stroke={1.5} />
    )
  },
  {
    name: 'Opera',
    icon: (color: string) => (
      <IconBrandOpera size={16} color={color} stroke={1.5} />
    )
  },
  {
    name: 'Brave',
    icon: (color: string) => (
      <IconWorldWww size={16} color={color} stroke={1.5} />
    )
  },
  {
    name: 'Vivaldi',
    icon: (color: string) => (
      <IconBrandVivaldi size={16} color={color} stroke={1.5} />
    )
  },
  {
    name: 'Chromium',
    icon: (color: string) => (
      <IconBrandChrome size={16} color={color} stroke={1.5} />
    )
  },
  {
    name: 'Arc',
    icon: (color: string) => (
      <IconBrandArc size={16} color={color} stroke={1.5} />
    )
  },
  {
    name: 'LibreWolf',
    icon: (color: string) => (
      <IconWorldWww size={16} color={color} stroke={1.5} />
    )
  },
  {
    name: 'Opera GX',
    icon: (color: string) => (
      <IconBrandOpera size={16} color={color} stroke={1.5} />
    )
  }
];

const normalizeBrowserName = (name: string) =>
  name.toLowerCase().replace(/\s+/g, '_');

const BrowserCookie: React.FC<{
  className?: string;
  setCookieLoggedIn: (b: string) => void;
}> = ({ className, setCookieLoggedIn }) => {
  const [browser, setBrowser] = useState('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!browser) {
      return;
    }
    if (browser === 'safari') {
      Notification.error(
        'Safari does not support getting cookies from the browser. Please use another browser.',
        { autoClose: 3000 }
      );
      return;
    }

    getCookie(browser)
      .then(resp => {
        if (!resp['checked']) {
          Notification.error(
            `Failed to check cookie for ${browser}. Please ensure you are logged in to LeetCode in this browser.`,
            { autoClose: 3000 }
          );
        }
        setChecked(resp['checked']);
      })
      .catch(e => Notification.error(e.message, { autoClose: 3000 }));
  }, [browser]);

  useEffect(() => {
    if (checked) {
      setCookieLoggedIn(browser);
    }
  }, [checked]);

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
          rightSection={<IconChevronDown size={18} stroke={1.5} />}
          pr={12}
          radius="md"
          size="md"
          className={className}
        >
          Load from browser
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>With LeetCode logged in</Menu.Label>
        {BROWSERS.map(({ name, icon }, i) => (
          <Menu.Item
            key={name}
            leftSection={icon(theme.colors.blue[6])}
            onClick={() => setBrowser(normalizeBrowserName(name))}
          >
            {name}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
};

export default BrowserCookie;
