import {
  LeetCodeCompanyTag,
  LeetCodeProfile,
  LeetCodeQuestion,
  LeetCodeQuestionQuery,
  LeetCodeStatistics,
  LeetCodeSubmissionCalendar,
  LeetCodeTopicTag
} from '../types/leetcode';
import { requestAPI } from './handler';

export async function getProfile() {
  return requestAPI<{ data: { userStatus: LeetCodeProfile } }>(
    '/leetcode/profile'
  ).then(d => d.data.userStatus);
}

export async function getStatistics(username: string) {
  return requestAPI<LeetCodeStatistics>(
    `/leetcode/statistics?username=${username}`
  );
}

export async function listQuestions(
  query: LeetCodeQuestionQuery,
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
    body: JSON.stringify({ query, skip, limit })
  }).then(d => d.data);
}

export async function getSubmissionCalendar(username: string) {
  return requestAPI<{
    data: { matchedUser: { userCalendar: LeetCodeSubmissionCalendar } };
  }>(`/leetcode/submission?username=${username}`).then(
    d => d.data.matchedUser.userCalendar
  );
}

export async function getAllTopics() {
  return requestAPI<{
    data: { questionTopicTags: { edges: { node: LeetCodeTopicTag }[] } };
  }>('/leetcode/topics').then(d =>
    d.data.questionTopicTags.edges.map(e => e.node)
  );
}

export async function getAllCompanies() {
  return requestAPI<{
    data: { companyTags: LeetCodeCompanyTag[] };
  }>('/leetcode/companies').then(d => d.data.companyTags);
}
