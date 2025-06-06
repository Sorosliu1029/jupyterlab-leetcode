import React from 'react';
import { LeetCodeStatistics } from '../types/leetcode';

const Statistics = ({ statisitcs }: { statisitcs: LeetCodeStatistics }) => {
  return (
    <div>
      <p>rank: {statisitcs.userPublicProfile.matchedUser.profile.ranking}</p>
    </div>
  );
};

export default Statistics;
