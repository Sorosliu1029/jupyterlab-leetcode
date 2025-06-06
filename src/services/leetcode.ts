import { LeetCodeProfile, LeetCodeStatistics } from '../types/leetcode';
import { requestAPI } from './handler';

export async function getProfile(): Promise<LeetCodeProfile | null> {
  return requestAPI<{ data: { userStatus: LeetCodeProfile } }>(
    '/leetcode/profile'
  )
    .then(d => d.data.userStatus)
    .catch(() => null);
}

export async function getStatistics(
  username: string
): Promise<LeetCodeStatistics | null> {
  return requestAPI<LeetCodeStatistics>(
    `/leetcode/statistics?username=${username}`
  ).catch(() => null);
}
