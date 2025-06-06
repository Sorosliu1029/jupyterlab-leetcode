import React from 'react';
import { LeetCodeProfile } from '../types/leetcode';

const Profile: React.FC<{ profile: LeetCodeProfile }> = ({ profile }) => {
  return (
    <div>
      <p>Welcome {profile.username}</p>
      <img
        src={profile.avatar}
        alt="Avatar"
        style={{ width: '100px', height: '100px' }}
      />
    </div>
  );
};

export default Profile;
