import { requestAPI } from './handler';

export async function generateNotebook(titleSlug: string) {
  return requestAPI<{ filePath: string }>('/notebook/create', {
    method: 'POST',
    body: JSON.stringify({ titleSlug })
  }).catch(() => null);
}
