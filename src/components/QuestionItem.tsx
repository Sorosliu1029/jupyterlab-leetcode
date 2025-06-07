import React from 'react';
import { LeetCodeQuestion } from '../types/leetcode';
import { generateNotebook } from '../services/notebook';

const QuestionItem: React.FC<{
  question: LeetCodeQuestion;
  onGenerateSuccess: (p: string) => void;
}> = ({ question, onGenerateSuccess }) => {
  return (
    <div>
      <a
        target="_blank"
        href={`https://leetcode.com/problems/${question.titleSlug}`}
      >
        {question.title}
      </a>
      <button
        onClick={() => {
          generateNotebook(question.titleSlug).then(r => {
            console.log('generateNotebook', r);
            if (r) {
              const { filePath } = r;
              onGenerateSuccess(filePath);
            }
          });
        }}
      >
        C
      </button>
    </div>
  );
};

export default QuestionItem;
