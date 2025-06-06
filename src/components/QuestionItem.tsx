import React from 'react';
import { LeetCodeQuestion } from '../types/leetcode';
import { generateNotebook } from '../services/notebook';

const QuestionItem: React.FC<{ question: LeetCodeQuestion }> = ({
  question
}) => {
  return (
    <div>
      <a
        target="_blank"
        href={`https://leetcode.com/problems/${question.titleSlug}`}
      >
        {question.title}
      </a>
      <button onClick={() => generateNotebook(question.titleSlug)}>C</button>
    </div>
  );
};

export default QuestionItem;
