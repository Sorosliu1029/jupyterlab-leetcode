import {
  DEFAULT_QUESTION_QUERY,
  parseQuestionQuery
} from '../services/questionQuery';

describe('persisted question query', () => {
  it('restores every filter from valid JSON', () => {
    const query = {
      keyword: 'array',
      difficulties: ['HARD'],
      statuses: ['SOLVED'],
      topics: ['dynamic-programming'],
      companies: ['google']
    };

    expect(parseQuestionQuery(JSON.stringify(query))).toEqual(query);
  });

  it('uses empty defaults for missing or invalid fields', () => {
    expect(
      parseQuestionQuery(JSON.stringify({ keyword: 1, statuses: ['SOLVED'] }))
    ).toEqual({ ...DEFAULT_QUESTION_QUERY, statuses: ['SOLVED'] });
  });

  it('falls back to the default query for malformed JSON', () => {
    expect(parseQuestionQuery('{')).toEqual(DEFAULT_QUESTION_QUERY);
  });
});
