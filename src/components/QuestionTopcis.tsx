import React from 'react';
import { LeetCodeTopicTag } from '../types/leetcode';
import classes from '../styles/LeetCodeMain.module.css';

const QuestionTopics: React.FC<{ topics: LeetCodeTopicTag[] }> = ({
  topics
}) => {
  if (!topics.length) {
    return null;
  }
  const text = topics.map(t => t.name).join(', ');
  return (
    <div className={classes.topics} title={text}>
      {text}
    </div>
  );
};

export default QuestionTopics;
