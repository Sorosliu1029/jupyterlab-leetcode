export type LeetCodeProfile = {
  avatar: string;
  isSignedIn: boolean;
  realName: string;
  username: string;
};

export type LeetCodePublicProfile = {
  matchedUser: {
    profile: {
      ranking: number;
    };
    username: string;
  };
};

export type LeetCodeQuestionStatistic = {
  count: number;
  difficulty: string;
};

export type LeetCodeBeatsPercentage = {
  percentage: number;
  difficulty: string;
};

export type LeetCodeQuestionProgress = {
  totalQuestionBeatsPercentage: number;
  numAcceptedQuestions: LeetCodeQuestionStatistic[];
  numFailedQuestions: LeetCodeQuestionStatistic[];
  numUntouchedQuestions: LeetCodeQuestionStatistic[];
  userSessionBeatsPercentage: LeetCodeBeatsPercentage[];
};

export type LeetCodeSessionProgress = {
  allQuestionsCount: LeetCodeQuestionStatistic[];
  matchedUser: {
    submitStats: {
      acSubmissionNum: LeetCodeQuestionStatistic[];
      totalSubmissionNum: LeetCodeQuestionStatistic[];
    };
  };
};

export type LeetCodeStatistics = {
  userPublicProfile: LeetCodePublicProfile;
  userSessionProgress: LeetCodeSessionProgress;
  userProfileUserQuestionProgressV2: {
    userProfileUserQuestionProgressV2: LeetCodeQuestionProgress;
  };
};

export type LeetCodeTopicTag = {
  name: string;
  slug: string;
};

export type LeetCodeQuestion = {
  acRate: number;
  difficulty: string;
  id: number;
  isInMyFavorites: boolean;
  paidOnly: boolean;
  questionFrontendId: string;
  status: string;
  title: string;
  titleSlug: string;
  topicTags: LeetCodeTopicTag[];
};
