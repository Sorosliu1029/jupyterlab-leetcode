export type LeetCodeProfile = {
  avatar: string;
  isSignedIn: boolean;
  realName: string;
  username: string;
  isPremium: boolean;
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
  userSessionProgress: LeetCodeSessionProgress;
  userProfileUserQuestionProgressV2: {
    userProfileUserQuestionProgressV2: LeetCodeQuestionProgress;
  };
};

export type LeetCodeTopicTag = {
  name: string;
  slug: string;
};

export type LeetCodeCompanyTag = {
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

export type LeetCodeWebSocketMessage = {
  submissionId: number;
} & (
  | {
      type: 'error';
      error: string;
    }
  | {
      type: 'submissionResult';
      result: LeetCodeSubmissionResult;
    }
);

export type LeetCodeSubmissionResult =
  | {
      state: 'PENDING' | 'STARTED';
    }
  | {
      state: 'SUCCESS';
      status_code: number;
      run_success: boolean;
      status_runtime: string;
      memory: number;
      display_runtime: string;
      elapsed_time: number;
      compare_result: string;
      code_output: string;
      std_output: string;
      last_testcase: string;
      expected_output: string;
      task_finish_time: number;
      task_name: string;
      finished: boolean;
      total_correct: number;
      total_testcases: number;
      runtime_percentile: number | null;
      status_memory: string;
      memory_percentile: number | null;
      input_formatted: string;
      input: string;
      status_msg: 'Accepted' | 'Wrong Answer' | string;
    };

export type LeetCodeQuestionQuery = {
  keyword: string;
  difficulties: string[];
  statuses: string[];
  topics: string[];
  companies: string[];
};

export type LeetCodeDccBadge = {
  timestamp: number;
  badge: { name: string; icon: string };
};

export type LeetCodeSubmissionCalendar = {
  activeYears: number[];
  dccBadges: LeetCodeDccBadge[];
  streak: number;
  totalActiveDays: number;
  submissionCalendar: string;
};
