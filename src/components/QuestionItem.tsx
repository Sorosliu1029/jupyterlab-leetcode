import React from 'react';
import { LeetCodeQuestion } from '../types/leetcode';
const QuestionItem: React.FC<{ question: LeetCodeQuestion }> = ({
  question
}) => {
  return (
    <div>
      <p>{question.title}</p>
    </div>
  );
};

export default QuestionItem;
