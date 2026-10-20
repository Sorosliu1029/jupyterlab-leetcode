import { expect, test } from '@jupyterlab/galata';

test('should register the LeetCode widget command', async ({ page }) => {
  const hasCommand = await page.evaluate(() =>
    (window as any).jupyterapp.commands.hasCommand('leetcode-widget:open')
  );

  expect(hasCommand).toBe(true);
});
