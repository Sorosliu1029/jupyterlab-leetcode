import React, { useRef } from 'react';
import { LeetCodeTopicTag } from '../types/leetcode';
import { Group, HoverCard, List, Text, ThemeIcon } from '@mantine/core';
import { IconHash } from '@tabler/icons-react';
import { LeetCodeSecondColor } from './LandingPage';

const TopicAbbreviationMaxLength = 12;

const QuestionTopics: React.FC<{ topics: LeetCodeTopicTag[] }> = ({
  topics
}) => {
  const myRef = useRef<HTMLParagraphElement>(null);

  const getQuestionTopicAbbreviation = () => {
    const tags = topics.map(t => t.name);
    if (!tags.length) {
      return '';
    }
    const abb =
      tags.length === 1
        ? tags[0]
        : [...tags].sort((a, b) => a.length - b.length).join(' / ');
    if (abb.length < TopicAbbreviationMaxLength) {
      return abb;
    }
    return abb.slice(0, TopicAbbreviationMaxLength) + '...';
  };

  return (
    <Group justify="center">
      <HoverCard shadow="md" openDelay={200}>
        <HoverCard.Target>
          <Text ref={myRef} fz="sm">
            {getQuestionTopicAbbreviation()}
          </Text>
        </HoverCard.Target>
        <HoverCard.Dropdown>
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
