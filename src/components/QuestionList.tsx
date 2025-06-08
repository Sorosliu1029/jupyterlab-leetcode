import React, { useEffect, useState } from 'react';
import { listQuestions } from '../services/leetcode';
import { LeetCodeQuestion } from '../types/leetcode';
import QuestionItem from './QuestionItem';

const QuestionList: React.FC<{ openNotebook: (p: string) => void }> = ({
  openNotebook
}) => {
  const [skip, setSkip] = useState(0);
  const limit = 100;
  const [keyword, setKeyword] = useState('');
  const [questions, setQuestions] = useState<LeetCodeQuestion[]>([]);
  const [_hasMore, setHasMore] = useState(true);
  const [_finishedLength, setFinishedLength] = useState(0);
  const [_totalLength, setTotalLength] = useState(0);

  useEffect(() => setSkip(0), [keyword]);

  useEffect(() => {
    listQuestions(keyword, skip, limit)
      .then(({ problemsetQuestionListV2 }) => {
        const {
          questions: fetchedQuestions,
          hasMore: fetchedHasMore,
          finishedLength: fetchedFinishedLength,
          totalLength: fetchedTotalLength
        } = problemsetQuestionListV2;
        setQuestions(fetchedQuestions);
        setHasMore(fetchedHasMore);
        setFinishedLength(fetchedFinishedLength);
        setTotalLength(fetchedTotalLength);
      })
      .catch(console.error);
  }, [keyword, skip]);

  return (
    <div>
      <label htmlFor="keyword">Keyword:</label>
      <input
        type="text"
        id="keyword"
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
      />
      {questions.length > 0 ? (
        <div>
          {questions.map(q => (
            <QuestionItem
              key={q.id}
              question={q}
              onGenerateSuccess={(path: string) => openNotebook(path)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default QuestionList;
