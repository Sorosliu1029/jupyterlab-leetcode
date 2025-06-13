import React from 'react';
import { Avatar, Center, Paper, PaperProps, Stack, Text } from '@mantine/core';
import { LeetCodeProfile } from '../types/leetcode';

const Profile: React.FC<{
  profile: LeetCodeProfile | null;
  paperProps: PaperProps;
}> = ({ profile, paperProps }) => {
  return (
    <Paper {...paperProps} style={{ alignContent: 'center' }}>
      <Center>
        <Stack gap={0}>
          <Avatar src={profile?.avatar} size="lg" radius="xl" mx="auto" />
          <Text ta="center" fz="md" fw={500} mt="xs">
            {profile?.realName}
          </Text>
          <Text ta="center" c="dimmed" fz="xs">
            {profile?.username}
          </Text>
        </Stack>
      </Center>
    </Paper>
  );
};

export default Profile;
