import {
  LeetCodeProfile,
  LeetCodeQuestion,
  LeetCodeStatistics
} from '../types/leetcode';
import { requestAPI } from './handler';

export async function getProfile() {
  return requestAPI<{ data: { userStatus: LeetCodeProfile } }>(
    '/leetcode/profile'
  )
    .then(d => d.data.userStatus)
    .catch(() => null);
}

export async function getStatistics(username: string) {
  return requestAPI<LeetCodeStatistics>(
    `/leetcode/statistics?username=${username}`
  ).catch(() => null);
}

export async function listQuestions(
  keyword: string,
  skip: number,
  limit: number
) {
  return requestAPI<{
    data: {
      problemsetQuestionListV2: {
        finishedLength: number;
        hasMore: boolean;
        totalLength: number;
        questions: LeetCodeQuestion[];
      };
    };
  }>('/leetcode/questions', {
    method: 'POST',
    body: JSON.stringify({ skip, limit, keyword })
  })
    .then(d => d.data)
    .catch(() => null);
}
