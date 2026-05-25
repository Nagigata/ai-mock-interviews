export interface Feedback {
  id: string;
  attemptId: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  createdAt: string;
}

export interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  language: string;
  finalized: boolean;
  isStarred?: boolean;
}

export type InterviewGenerationStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface InterviewGenerationJob {
  id: string;
  status: InterviewGenerationStatus;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
  language: string;
  provider?: string | null;
  interviewId?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export type NotificationType =
  | "INTERVIEW_GENERATION_PROCESSING"
  | "INTERVIEW_GENERATION_COMPLETED"
  | "INTERVIEW_GENERATION_FAILED"
  | "FEEDBACK_GENERATION_PROCESSING"
  | "FEEDBACK_GENERATION_COMPLETED"
  | "FEEDBACK_GENERATION_FAILED"
  | "CHALLENGE_NEW_COMMENT"
  | "CHALLENGE_COMMENT_REPLY"
  | "CHALLENGE_COMMENT_MENTION"
  | "SYSTEM";

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export interface UserNotificationPreferences {
  notifyInterviewActivity: boolean;
  notifyComments: boolean;
  notifySound: boolean;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string | null;
  metadata?: {
    jobId?: string;
    attemptId?: string;
    interviewId?: string;
    feedbackId?: string;
    [key: string]: unknown;
  } | null;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationsResponse extends PaginatedResponse<NotificationItem> {
  unreadCount: number;
}

export type InterviewAttemptStatus =
  | "IN_PROGRESS"
  | "FEEDBACK_PROCESSING"
  | "COMPLETED"
  | "TOO_SHORT"
  | "FAILED";

export interface CreateFeedbackParams {
  attemptId: string;
  transcript: { role: string; content: string }[];
}

export interface FeedbackGenerationStartResult {
  attemptId: string;
  status: "FEEDBACK_PROCESSING" | "TOO_SHORT";
  message?: string;
}

export interface Transcript {
  id: string;
  attemptId: string;
  role: string;
  content: string;
  sequence: number;
  createdAt: string;
}

export interface InterviewAttempt {
  id: string;
  interviewId: string;
  userId: string;
  status?: InterviewAttemptStatus;
  endedAt?: string | null;
  completedAt?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
  transcriptCount?: number;
  feedback?: Feedback | null;
}

export interface InterviewAttemptDetail extends InterviewAttempt {
  interview: Interview;
  transcripts: Transcript[];
}

export type OAuthProvider = "GOOGLE" | "GITHUB";

export interface User {
  name: string;
  email: string;
  id: string;
  role?: string;
  isActive?: boolean;
  avatarUrl?: string | null;
  createdAt?: string;
  provider?: string | null;
  hasPassword?: boolean;
  linkedProviders?: OAuthProvider[];
  gender?: Gender | null;
  birthday?: string | null;
  location?: string | null;
  readme?: string | null;
  notifyInterviewActivity?: boolean;
  notifyComments?: boolean;
  notifySound?: boolean;
  deletedAt?: string | null;
}

export interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  level?: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  language?: string;
  isStarred?: boolean;
}

export interface AgentProps {
  userName: string;
  userId?: string;
  userAvatarUrl?: string | null;
  interviewId?: string;
  initialAttemptId?: string | null;
  type: "generate" | "interview";
  language?: string;
  questions?: string[];
  dictionary?: {
    [key: string]: unknown;
    agent?: Record<string, string>;
  };
}

export interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

export interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

export interface GetFeedbackByAttemptIdParams {
  attemptId: string;
  userId: string;
}

export interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  password: string;
}

interface SignUpParams {
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

interface InterviewFormProps {
  interviewId: string;
  role: string;
  level: string;
  type: string;
  techstack: string[];
  amount: number;
}

interface TechIconProps {
  techStack: string[];
}

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface Skill {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  challenges?: Challenge[];
  _count?: {
    challenges: number;
  };
}

export interface LeetCodeExample {
  example_num: number;
  example_text: string;
  images: string[];
  input?: string;
  output?: string;
  explanation?: string;
}

export interface Challenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  topics: string;
  examples?: LeetCodeExample[];
  constraints?: string[];
  hints?: string[];
  solution?: string | null;
  followUps?: string[];
  isSolved: boolean;
  isStarred: boolean;
  templateCode: Record<string, string>;
  testCases: Array<{ input: string; output: string }>;
  skillId: string;
  skill?: Skill;
}

export interface DifficultyProgressItem {
  solved: number;
  total: number;
}

export interface ActivityDay {
  date: string;
  count: number;
  level: number;
}

export interface RecentActivityItem {
  id: string;
  activityType?: "CHALLENGE_SUBMISSION" | "INTERVIEW_ATTEMPT";
  challengeId?: string;
  challengeTitle?: string;
  difficulty?: Difficulty;
  skillSlug?: string;
  language?: string;
  interviewId?: string;
  interviewRole?: string;
  interviewLevel?: string;
  interviewType?: string;
  status: string;
  score?: number | null;
  runtime?: number | null;
  memory?: number | null;
  submittedAt: string;
}

export interface ChallengeSubmissionHistoryItem {
  id: string;
  language: string;
  status: string;
  runtime?: number | null;
  memory?: number | null;
  passedTestCases?: number | null;
  totalTestCases?: number | null;
  errorMessage?: string | null;
  note?: string | null;
  noteColor?: string | null;
  createdAt: string;
}

export interface ChallengeSubmissionDetail
  extends ChallengeSubmissionHistoryItem {
  challengeId: string;
  code: string;
}

export type ChallengeSubmissionHistoryResponse =
  PaginatedResponse<ChallengeSubmissionHistoryItem> & {
    filters?: {
      statuses: string[];
      languages: string[];
    };
  };

export interface UpdateSubmissionNoteResult {
  id: string;
  note?: string | null;
  noteColor?: string | null;
}

export type PracticeActivityType = "all" | "challenges" | "interviews";

export interface PracticeActivitySummary {
  total: number;
  challengeSubmissions: number;
  interviewAttempts: number;
}

export interface PracticeActivityResponse
  extends PaginatedResponse<RecentActivityItem> {
  summary: PracticeActivitySummary;
}

export interface UserDashboardStats {
  totalStarredChallenges: number;
  totalSolvedChallenges: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  totalInterviews: number;
  attemptedChallenges: number;
  attemptingChallenges: number;
  activeDays: number;
  currentStreak: number;
  maxStreak: number;
  difficultyProgress: {
    easy: DifficultyProgressItem;
    medium: DifficultyProgressItem;
    hard: DifficultyProgressItem;
  };
}

export interface UserProfile extends User {
  stats: UserDashboardStats;
  activityCalendar: ActivityDay[];
  recentActivity: RecentActivityItem[];
  solutionCount?: number;
  discussCount?: number;
}

export interface UserHoverCardData {
  id: string;
  name: string;
  avatarUrl?: string | null;
  solutionCount: number;
  discussCount: number;
}

export type ProfileActivityItem =
  | {
      activityType: "CHALLENGE_SUBMISSION";
      id: string;
      createdAt: string;
      challengeId: string;
      challengeTitle: string;
      skillSlug: string;
      difficulty: string;
      language: string;
      status: string;
      runtime: number | null;
      memory: number | null;
    }
  | {
      activityType: "INTERVIEW_ATTEMPT";
      id: string;
      createdAt: string;
      interviewId: string;
      interviewRole: string;
      interviewLevel: string;
      interviewType: string;
      status: string;
      score: number | null;
    };

export type ProfileActivityResponse = {
  items: ProfileActivityItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProfileSolutionItem = {
  id: string;
  title: string;
  language: string;
  upvoteCount: number;
  viewCount: number;
  commentCount: number;
  createdAt: string;
  challengeId: string;
  challengeTitle: string;
  skillSlug: string;
};

export type ProfileSolutionsResponse = {
  items: ProfileSolutionItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProfileDiscussItem = {
  id: string;
  content: string;
  createdAt: string;
  solutionId: string;
  solutionTitle: string;
  challengeId: string;
  skillSlug: string;
};

export type ProfileDiscussResponse = {
  items: ProfileDiscussItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export interface StarredChallengeItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  topics: string;
  skillSlug: string;
  skillName: string;
  isSolved: boolean;
  isStarred: boolean;
  starredAt: string;
}

export interface StarredInterviewItem extends Interview {
  isStarred: true;
  starredAt: string;
  attemptCount: number;
  feedback?: Feedback | null;
}

export interface SolvedChallengeItem {
  challengeId: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  topics: string;
  skillSlug: string;
  skillName: string;
  language: string;
  solvedAt: string;
  status: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ===== Admin Content Moderation Shared Types =====

export interface AdminUserSummary {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
}

export interface AdminSkillSummary {
  id?: string;
  name: string;
  slug: string;
}

export interface AdminChallengeSummary {
  id: string;
  title: string;
  slug?: string;
  difficulty?: string;
  skill?: AdminSkillSummary;
}

export interface AdminSolutionItem {
  id: string;
  title: string;
  language: string;
  createdAt: string;
  challengeId: string;
  author: AdminUserSummary;
  challenge: AdminChallengeSummary;
  upvoteCount: number;
  commentCount: number;
  viewCount: number;
}

export interface AdminSolutionDetail extends AdminSolutionItem {
  description?: string | null;
  code: string;
  updatedAt: string;
  submission?: {
    id: string;
    status: string;
    runtime?: number | null;
    memory?: number | null;
    createdAt: string;
  } | null;
}

export type AdminSolutionsResponse = PaginatedResponse<AdminSolutionItem>;

export interface AdminCommentItem {
  id: string;
  content: string;
  isEdited: boolean;
  createdAt: string;
  solutionId: string;
  parentId?: string | null;
  author: AdminUserSummary;
  solution: {
    id: string;
    title: string;
    challengeId: string;
    challenge: AdminChallengeSummary;
  };
  replyCount: number;
  upvoteCount: number;
}

export interface AdminCommentDetail extends AdminCommentItem {
  updatedAt: string;
  parent?: {
    id: string;
    content: string;
    user: AdminUserSummary;
  } | null;
  replies: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: AdminUserSummary;
  }>;
}

export type AdminCommentsResponse = PaginatedResponse<AdminCommentItem>;

export interface AdminDeleteContentPayload {
  reason?: string;
}
