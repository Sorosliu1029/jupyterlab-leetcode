import { LeetCodeQuestionQuery } from '../types/leetcode';

export const QUESTION_QUERY_STORAGE_KEY = 'jupyterlab-leetcode:question-query';

export const DEFAULT_QUESTION_QUERY: LeetCodeQuestionQuery = {
  keyword: '',
  difficulties: [],
  statuses: [],
  topics: [],
  companies: []
};

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(item => typeof item === 'string');

export const parseQuestionQuery = (
  serializedQuery: string | null
): LeetCodeQuestionQuery => {
  if (!serializedQuery) {
    return DEFAULT_QUESTION_QUERY;
  }

  try {
    const query: unknown = JSON.parse(serializedQuery);
    if (typeof query !== 'object' || query === null) {
      return DEFAULT_QUESTION_QUERY;
    }

    const candidate = query as Record<string, unknown>;
    return {
      keyword: typeof candidate.keyword === 'string' ? candidate.keyword : '',
      difficulties: isStringArray(candidate.difficulties)
        ? candidate.difficulties
        : [],
      statuses: isStringArray(candidate.statuses) ? candidate.statuses : [],
      topics: isStringArray(candidate.topics) ? candidate.topics : [],
      companies: isStringArray(candidate.companies) ? candidate.companies : []
    };
  } catch {
    return DEFAULT_QUESTION_QUERY;
  }
};

export const loadQuestionQuery = (): LeetCodeQuestionQuery => {
  try {
    return parseQuestionQuery(
      window.localStorage.getItem(QUESTION_QUERY_STORAGE_KEY)
    );
  } catch {
    return DEFAULT_QUESTION_QUERY;
  }
};

export const saveQuestionQuery = (query: LeetCodeQuestionQuery): void => {
  try {
    window.localStorage.setItem(
      QUESTION_QUERY_STORAGE_KEY,
      JSON.stringify(query)
    );
  } catch {
    // Filtering should continue to work when browser storage is unavailable.
  }
};
