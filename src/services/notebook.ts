import { requestAPI } from './handler';

export async function generateNotebook(titleSlug: string) {
  return requestAPI<{ filePath: string }>('/notebook/create', {
    method: 'POST',
    body: JSON.stringify({ titleSlug })
  });
}

export async function submitNotebook(path: string) {
  return requestAPI<{ submission_id: number }>('/notebook/submit', {
    method: 'POST',
    body: JSON.stringify({ filePath: path })
  });
}
