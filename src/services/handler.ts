import { URLExt } from '@jupyterlab/coreutils';

import { ServerConnection } from '@jupyterlab/services';
import { getLeetCodeBrowserCookie } from '../utils';

/**
 * Call the API extension
 *
 * @param endPoint API REST end point for the extension
 * @param init Initial values for the request
 * @returns The response body interpreted as JSON
 */
export async function requestAPI<T>(
  endPoint = '',
  init: RequestInit = {}
): Promise<T> {
  // Make request to Jupyter API
  const settings = ServerConnection.makeSettings();
  const requestUrl = URLExt.join(
    settings.baseUrl,
    'jupyterlab-leetcode', // API Namespace
    endPoint
  );
  init.headers = new Headers({ Cookie: getLeetCodeBrowserCookie() || '' });

  let response: Response;
  try {
    response = await ServerConnection.makeRequest(requestUrl, init, settings);
  } catch (error) {
    throw new ServerConnection.NetworkError(error as any);
  }

  let data: any = await response.text();

  if (data.length > 0) {
    try {
      data = JSON.parse(data);
    } catch (error) {
      console.log('Not a JSON response body.', response);
    }
  }

  if (!response.ok) {
    throw new ServerConnection.ResponseError(response, data.message || data);
  }

  return data;
}

export function makeWebSocket(endPoint: string) {
  const settings = ServerConnection.makeSettings();
  const requestUrl = URLExt.join(
    settings.wsUrl,
    'jupyterlab-leetcode', // API Namespace
    'websocket', // WebSocket endpoint
    endPoint
  );
  const ws = new WebSocket(requestUrl);
  ws.onopen = () => {
    console.debug(`WebSocket connection to ${requestUrl} opened`);
  };
  ws.onclose = () => {
    console.debug(`WebSocket connection to ${requestUrl} closed`);
  };
  ws.onerror = error => {
    console.error(`WebSocket to ${requestUrl} error:`, error);
  };
  return ws;
}
