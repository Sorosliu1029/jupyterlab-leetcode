import React from 'react';
import { Avatar, Paper, Text } from '@mantine/core';
import { LeetCodeProfile } from '../types/leetcode';

const Profile: React.FC<{
  profile: LeetCodeProfile;
}> = ({ profile }) => {
  return (
    <Paper
      shadow="md"
      radius="md"
      withBorder
      p="sm"
      miw="20%"
      maw="40%"
      bg="var(--mantine-color-body)"
    >
      <Avatar src={profile.avatar} size={60} radius={60} mx="auto" />
      <Text ta="center" fz="md" fw={500} mt="xs">
        {profile.realName}
      </Text>
      <Text ta="center" c="dimmed" fz="xs">
        {profile.username}
      </Text>
    </Paper>
  );
};

export default Profile;
