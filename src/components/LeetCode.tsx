import React, { useEffect, useState } from 'react';
import { getProfile, getStatistics } from '../services/leetcode';
import { LeetCodeProfile } from '../types/leetcode';

const LeetCode = () => {
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

  useEffect(() => {
    if (!profile) {
      return;
    }
    getStatistics(profile.username).then(d => {
      console.log('LeetCode Statistics:', d);
    });
  }, [profile]);

  return profile ? (
    <div>
      <p>Welcome {profile.username}</p>
      <img
        src={profile.avatar}
        alt="Avatar"
        style={{ width: '100px', height: '100px' }}
      />
    </div>
  ) : null;
};

export default LeetCode;
