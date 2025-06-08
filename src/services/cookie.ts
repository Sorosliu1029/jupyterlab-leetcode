import { requestAPI } from './handler';

export async function getCookie(
  browser: string
): Promise<{ [key: string]: boolean }> {
  return requestAPI<{ [key: string]: boolean }>(`/cookies?browser=${browser}`);
}
