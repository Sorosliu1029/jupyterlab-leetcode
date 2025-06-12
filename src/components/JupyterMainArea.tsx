import React, { useState } from 'react';
import { IDocumentManager } from '@jupyterlab/docmanager';
import LandingPage from './LandingPage';
import LeetCodeMain from './LeetCodeMain';
import { getLeetCodeBrowserCookie } from '../utils';

const JupyterMainArea: React.FC<{ docManager: IDocumentManager }> = ({
  docManager
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const leetcodeBrowser = getLeetCodeBrowserCookie()?.split('=')[1];

  return leetcodeBrowser || isLoggedIn ? (
    <LeetCodeMain docManager={docManager} />
  ) : (
    <LandingPage setIsLoggedIn={setIsLoggedIn} />
  );
};

export default JupyterMainArea;
