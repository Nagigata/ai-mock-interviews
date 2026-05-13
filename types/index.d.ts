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

export type InterviewAttemptStatus =
  | "IN_PROGRESS"
  | "COMPLETED"
  | "TOO_SHORT"
  | "FAILED";

export interface CreateFeedbackParams {
  attemptId: string;
  transcript: { role: string; content: string }[];
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

export interface User {
  name: string;
  email: string;
  id: string;
  role?: string;
  isActive?: boolean;
  avatarUrl?: string | null;
  createdAt?: string;
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
}

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
