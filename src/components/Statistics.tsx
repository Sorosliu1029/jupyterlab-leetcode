import React, { useEffect, useState } from 'react';
import { Notification } from '@jupyterlab/apputils';
import { getStatistics } from '../services/leetcode';
import { LeetCodeStatistics } from '../types/leetcode';

const Statistics: React.FC<{ username: string }> = ({ username }) => {
  const [statistics, setStatistics] = useState<LeetCodeStatistics | null>(null);

  useEffect(() => {
    getStatistics(username)
      .then(d => {
        setStatistics(d);
      })
      .catch(e => Notification.error(e.message, { autoClose: 3000 }));
  }, []);

  return statistics ? (
    <div>
      <p>rank: {statistics.userPublicProfile.matchedUser.profile.ranking}</p>
    </div>
  ) : null;
};

export default Statistics;
