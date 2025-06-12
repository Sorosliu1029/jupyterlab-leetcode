import React from 'react';
import { LeetCodeTopicTag } from '../types/leetcode';
import { Badge, Group, HoverCard, List, ThemeIcon } from '@mantine/core';
import { IconHash } from '@tabler/icons-react';
import { LeetCodeSecondColor } from './LandingPage';

const QuestionTopics: React.FC<{ topics: LeetCodeTopicTag[] }> = ({
  topics
}) => {
  return (
    <Group
      justify="flex-start"
      wrap="nowrap"
      style={{ overflow: 'scroll', scrollbarWidth: 'none' }}
    >
      <HoverCard shadow="md" openDelay={200} position="bottom-start">
        <HoverCard.Target>
          <Group style={{ flexShrink: 0 }}>
            {topics.map(t => (
              <Badge variant="light" key={t.name}>
                {t.name}
              </Badge>
            ))}
          </Group>
        </HoverCard.Target>
        <HoverCard.Dropdown>
          {/* TODO: group and color topics by skills */}
          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color={LeetCodeSecondColor} size="xs" radius="xl">
                <IconHash size={16} />
              </ThemeIcon>
            }
          >
            {topics.map(t => (
              <List.Item key={t.name}>{t.name}</List.Item>
            ))}
          </List>
        </HoverCard.Dropdown>
      </HoverCard>
    </Group>
  );
};

export default QuestionTopics;
