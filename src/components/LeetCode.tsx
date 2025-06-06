import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/leetcode';
import { LeetCodeProfile } from '../types/leetcode';
import Profile from './Profile';
import Statistics from './Statistics';
import QuestionList from './QuestionList';

const LeetCode: React.FC = () => {
  const [profile, setProfile] = useState<LeetCodeProfile | null>(null);

  useEffect(() => {
    getProfile().then(profile => {
      if (!profile || !profile.isSignedIn) {
        alert('Please sign in to LeetCode.');
        return;
      }
      setProfile(profile);
    });
  }, []);

  return profile ? (
    <div>
      <Profile profile={profile} />
      <Statistics username={profile.username} />
      <QuestionList />
    </div>
  ) : null;
};

export default LeetCode;
