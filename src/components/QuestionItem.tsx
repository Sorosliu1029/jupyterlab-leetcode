import React from 'react';
import { Notification } from '@jupyterlab/apputils';
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
          generateNotebook(question.titleSlug)
            .then(({ filePath }) => {
              onGenerateSuccess(filePath);
            })
            .catch(e => Notification.error(e.message, { autoClose: 3000 }));
        }}
      >
        C
      </button>
    </div>
  );
};

export default QuestionItem;
