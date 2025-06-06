import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/leetcode';

const LeetCode = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    getProfile().then(profile => {
      if (!profile || !profile.isSignedIn) {
        alert('Please sign in to LeetCode.');
        return;
      }
      setUsername(profile.username);
    });
  }, []);

  return (
    <div>
      <p>Welcome {username}</p>
    </div>
  );
};

export default LeetCode;
