import { requestAPI } from './handler';

export async function generateNotebook(titleSlug: string) {
  return requestAPI<{ ok: boolean }>('/notebook/create', {
    method: 'POST',
    body: JSON.stringify({ titleSlug })
  }).catch(() => ({ ok: false }));
}
