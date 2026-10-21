import React from 'react';
import { Avatar, Group, Skeleton, Stack, Text } from '@mantine/core';
import { LeetCodeProfile } from '../types/leetcode';
import classes from '../styles/LeetCodeMain.module.css';

const Profile: React.FC<{ profile: LeetCodeProfile | null }> = ({
  profile
}) => {
  return (
    <Group className={classes.profile} gap="sm" wrap="nowrap">
      <Avatar src={profile?.avatar} size="lg" radius="xl" />
      <Stack gap={2}>
        {profile ? (
          <>
            <Text fz="sm" fw={600} lh={1.3}>
              {profile.realName || profile.username}
            </Text>
            <Text className={classes.mono} lh={1.3}>
              {profile.username}
            </Text>
          </>
        ) : (
          <Stack gap={6} py={4}>
            <Skeleton height={10} width="7rem" />
            <Skeleton height={8} width="5rem" />
          </Stack>
        )}
      </Stack>
    </Group>
  );
};

export default Profile;
