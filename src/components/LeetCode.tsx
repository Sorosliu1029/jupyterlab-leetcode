import React, { useEffect, useState } from 'react';
import { getProfile, getStatistics } from '../services/leetcode';
import { LeetCodeProfile, LeetCodeStatistics } from '../types/leetcode';
import Profile from './Profile';
import Statistics from './Statistics';

const LeetCode = () => {
  const [profile, setProfile] = useState<LeetCodeProfile | null>(null);
  const [statistics, setStatistics] = useState<LeetCodeStatistics | null>(null);

  useEffect(() => {
    getProfile().then(profile => {
      if (!profile || !profile.isSignedIn) {
        alert('Please sign in to LeetCode.');
        return;
      }
      setProfile(profile);
    });
  }, []);

  useEffect(() => {
    if (!profile) {
      return;
    }
    getStatistics(profile.username).then(d => {
      setStatistics(d);
    });
  }, [profile]);

  return profile ? (
    <div>
      <Profile profile={profile} />
      {statistics ? <Statistics statisitcs={statistics} /> : null}
    </div>
  ) : null;
};

export default LeetCode;
