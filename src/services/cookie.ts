import { requestAPI } from './handler';

export async function getCookie(
  name: string,
  browser: string
): Promise<{ [key: string]: any }> {
  return requestAPI<{ [key: string]: any }>(
    `/cookies/${name}?browser=${browser}`
  ).catch(() => ({}));
}
