"use client";

import type { ComponentType, ReactNode } from "react";
import { useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  CheckCircle2,
  Code2,
  FileCheck,
  Layers,
  MessageSquare,
  RefreshCw,
  ScrollText,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSelectFilter from "@/components/admin/AdminSelectFilter";
import AdminStatePanel from "@/components/admin/AdminStatePanel";
import UserAvatar from "@/components/UserAvatar";

interface DashboardProps {
  dashboard: any;
  stats: any;
  currentRange: string;
}

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon: ComponentType<{ className?: string }>;
  iconTone?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

interface ActivityItemProps {
  href?: string;
  title: string;
  meta: string;
  time?: string;
  badge?: string;
  badgeTone?: string;
  side?: ReactNode;
  avatar?: ReactNode;
}

const TIME_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "6m", label: "Last 6 months" },
  { value: "12m", label: "Last 12 months" },
];

const statCards = [
  {
    key: "totalUsers",
    label: "Total Users",
    icon: Users,
    color: "from-indigo-500/20 to-indigo-600/5",
    iconColor: "text-indigo-400",
    summary: (dashboard: any) => `+${dashboard.usersToday ?? 0} today`,
  },
  {
    key: "totalInterviews",
    label: "Interviews",
    icon: MessageSquare,
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
    summary: (dashboard: any) => `+${dashboard.interviewsToday ?? 0} today`,
  },
  {
    key: "totalChallenges",
    label: "Challenges",
    icon: Code2,
    color: "from-amber-500/20 to-amber-600/5",
    iconColor: "text-amber-400",
    summary: (dashboard: any) =>
      `${dashboard.activeChallenges ?? 0} active / ${
        dashboard.disabledChallenges ?? 0
      } disabled`,
  },
  {
    key: "totalSubmissions",
    label: "Submissions",
    icon: FileCheck,
    color: "from-rose-500/20 to-rose-600/5",
    iconColor: "text-rose-400",
    summary: (dashboard: any) => `+${dashboard.submissionsToday ?? 0} today`,
  },
  {
    key: "totalAttempts",
    label: "Attempts",
    icon: TrendingUp,
    color: "from-cyan-500/20 to-cyan-600/5",
    iconColor: "text-cyan-400",
    summary: (dashboard: any) => `+${dashboard.attemptsToday ?? 0} today`,
  },
  {
    key: "totalSkills",
    label: "Skills",
    icon: Layers,
    color: "from-violet-500/20 to-violet-600/5",
    iconColor: "text-violet-400",
    summary: (dashboard: any) =>
      `${dashboard.activeSkills ?? 0} active / ${
        dashboard.disabledSkills ?? 0
      } disabled`,
  },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-dark-200 px-4 py-2.5 shadow-xl">
      <p className="mb-1 text-xs text-light-400">{label}</p>
      {payload.map((entry: any, index: number) => (
        <p
          key={index}
          className="text-sm font-semibold"
          style={{ color: entry.color }}
        >
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatAuditAction = (action: string) =>
  action
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const getStatusTone = (status: string) => {
  if (status === "ACCEPTED" || status === "Active") {
    return "bg-emerald-500/15 text-emerald-400";
  }

  if (status === "WRONG_ANSWER" || status.includes("ERROR")) {
    return "bg-red-500/15 text-red-400";
  }

  if (status === "Archived") {
    return "bg-slate-500/15 text-slate-300";
  }

  return "bg-amber-500/15 text-amber-400";
};

const getAuditActionTone = (action: string) => {
  if (action.startsWith("CREATE") || action.startsWith("ENABLE")) {
    return "bg-emerald-500/15 text-emerald-400";
  }

  if (action.startsWith("DISABLE")) {
    return "bg-red-500/15 text-red-400";
  }

  if (action.startsWith("ARCHIVE")) {
    return "bg-amber-500/15 text-amber-400";
  }

  if (action.startsWith("RESTORE")) {
    return "bg-cyan-500/15 text-cyan-300";
  }

  return "bg-primary-200/15 text-primary-200";
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-light-400">
    {message}
  </div>
);

const SectionCard = ({
  title,
  subtitle,
  icon: Icon,
  iconTone = "bg-primary-200/10 text-primary-200",
  action,
  children,
  className = "",
}: SectionCardProps) => (
  <section
    className={`rounded-2xl border border-white/5 bg-dark-200/50 p-6 ${className}`}
  >
    <div className="mb-5 flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`rounded-xl p-2 ${iconTone}`}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          {subtitle && (
            <p className="mt-1 text-xs leading-relaxed text-light-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
    {children}
  </section>
);

const ActivityItem = ({
  href,
  title,
  meta,
  time,
  badge,
  badgeTone = "bg-primary-200/15 text-primary-200",
  side,
  avatar,
}: ActivityItemProps) => {
  const content = (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.08]">
      <div className="flex min-w-0 gap-3">
        {avatar}
        <div className="min-w-0">
          {badge && (
            <span
              className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeTone}`}
            >
              {badge}
            </span>
          )}
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 truncate text-xs text-light-400">{meta}</p>
          {time && <p className="mt-2 text-[11px] text-light-500">{time}</p>}
        </div>
      </div>
      {side}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
};

const GrowthBadge = ({ value }: { value: number }) => {
  const isPositive = value >= 0;

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isPositive
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-red-500/15 text-red-400"
      }`}
    >
      {isPositive ? "+" : ""}
      {value}% growth
    </span>
  );
};

const SectionLink = ({ href, label }: { href: string; label: string }) => (
  <Link
    href={href}
    className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-light-300 transition-colors hover:border-primary-200/40 hover:text-white"
  >
    {label}
    <ArrowUpRight className="size-3.5" />
  </Link>
);

const RankItem = ({
  index,
  title,
  meta,
  value,
  href,
  valueTone = "text-primary-200",
}: {
  index: number;
  title: string;
  meta: string;
  value: number;
  href?: string;
  valueTone?: string;
}) => {
  const content = (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.04] px-3 py-2.5 transition-colors hover:bg-white/[0.08]">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-light-300">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="truncate text-[11px] text-light-500">{meta}</p>
        </div>
      </div>
      <p className={`ml-3 text-sm font-bold ${valueTone}`}>
        {value.toLocaleString()}
      </p>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block">
      {content}
    </Link>
  );
};

export default function AdminDashboardClient({
  dashboard,
  stats,
  currentRange,
}: DashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRefreshing, startTransition] = useTransition();
  const selectedRange = TIME_RANGE_OPTIONS.some(
    (option) => option.value === currentRange,
  )
    ? currentRange
    : "6m";
  const selectedRangeLabel =
    TIME_RANGE_OPTIONS.find((option) => option.value === selectedRange)?.label ??
    "Last 6 months";

  const handleRangeChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  if (!dashboard) {
    return (
      <AdminStatePanel
        title="Failed to load dashboard data"
        description="The admin overview could not be loaded. Please refresh the page or try again later."
        tone="danger"
        className="h-[60vh]"
      />
    );
  }

  return (
    <div className="space-y-7 animate-fadeIn">
      <AdminPageHeader
        eyebrow="Admin command center"
        title="Dashboard Overview"
        description="A unified view of platform health, recent activity, and content performance."
        icon={TrendingUp}
        actions={
          <>
            <AdminSelectFilter
              label="Time range"
              value={selectedRange}
              options={TIME_RANGE_OPTIONS}
              onChange={handleRangeChange}
              className="w-full sm:w-48"
            />
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-light-100 transition-colors hover:border-primary-200/40 hover:bg-primary-200/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`size-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = dashboard[card.key] ?? 0;

          return (
            <div
              key={card.key}
              className={`relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br ${card.color} p-5 transition-all hover:-translate-y-0.5 hover:border-white/10 hover:shadow-lg`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="mb-1 text-sm text-light-400">{card.label}</p>
                  <p className="text-3xl font-bold text-white">
                    {value.toLocaleString()}
                  </p>
                  <p className="mt-2 text-xs font-medium text-light-300">
                    {card.summary(dashboard)}
                  </p>
                </div>
                <div className={`rounded-xl bg-white/5 p-3 ${card.iconColor}`}>
                  <Icon className="size-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {stats && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard
            title={`User Growth (${selectedRangeLabel})`}
            subtitle="New user accounts created in the selected range."
            icon={Users}
            iconTone="bg-indigo-500/10 text-indigo-400"
            action={<GrowthBadge value={stats.growth?.users ?? 0} />}
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6870a6", fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#6870a6", fontSize: 12 }}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Users"
                  stroke="#818cf8"
                  fill="url(#colorUsers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard
            title={`Submissions Trend (${selectedRangeLabel})`}
            subtitle="Challenge submissions sent by learners."
            icon={FileCheck}
            iconTone="bg-emerald-500/10 text-emerald-400"
            action={<GrowthBadge value={stats.growth?.submissions ?? 0} />}
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.submissionTrend}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6870a6", fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#6870a6", fontSize: 12 }}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(34, 197, 94, 0.08)" }}
                />
                <Bar
                  dataKey="count"
                  name="Submissions"
                  fill="#22c55e"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard
            title={`Interview Trend (${selectedRangeLabel})`}
            subtitle="Mock interviews generated during the selected range."
            icon={MessageSquare}
            iconTone="bg-amber-500/10 text-amber-400"
            action={<GrowthBadge value={stats.growth?.interviews ?? 0} />}
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={stats.interviewTrend}>
                <defs>
                  <linearGradient
                    id="colorInterviews"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6870a6", fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#6870a6", fontSize: 12 }}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Interviews"
                  stroke="#f59e0b"
                  fill="url(#colorInterviews)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard
            title={`Submission Success Rate (${selectedRangeLabel})`}
            subtitle="Accepted submissions over all challenge submissions."
            icon={CheckCircle2}
            iconTone="bg-emerald-500/10 text-emerald-400"
          >
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-5xl font-bold text-white">
                    {stats.submissionSuccessRate?.rate ?? 0}%
                  </p>
                  <p className="mt-2 text-sm text-light-400">
                    {stats.submissionSuccessRate?.accepted ?? 0} accepted of{" "}
                    {stats.submissionSuccessRate?.total ?? 0} submissions
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400">
                  Success
                </span>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300"
                  style={{
                    width: `${Math.min(
                      stats.submissionSuccessRate?.rate ?? 0,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {stats.submissionSuccessRate?.breakdown?.length ? (
                stats.submissionSuccessRate.breakdown.map((item: any) => (
                  <span
                    key={item.status}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
                      item.status,
                    )}`}
                  >
                    {item.status}: {item.count}
                  </span>
                ))
              ) : (
                <p className="text-sm text-light-400">No submissions yet.</p>
              )}
            </div>
          </SectionCard>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard
          title="Recent Users"
          subtitle="Newest accounts created on the platform."
          icon={Users}
          iconTone="bg-indigo-500/10 text-indigo-400"
          action={<SectionLink href="/admin/users" label="Manage" />}
        >
          <div className="space-y-3">
            {dashboard.recentUsers?.length ? (
              dashboard.recentUsers.map((user: any) => (
                <ActivityItem
                  key={user.id}
                  href={`/admin/users?search=${encodeURIComponent(
                    user.email || user.name || "",
                  )}&page=1`}
                  title={user.name}
                  meta={user.email}
                  time={formatDateTime(user.createdAt)}
                  badge={user.role}
                  badgeTone={
                    user.role === "ADMIN"
                      ? "bg-amber-500/15 text-amber-400"
                      : "bg-white/10 text-light-300"
                  }
                  avatar={
                    <UserAvatar
                      name={user.name || "User"}
                      avatarUrl={user.avatarUrl}
                      size="sm"
                    />
                  }
                />
              ))
            ) : (
              <EmptyState message="No recent users yet." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent Submissions"
          subtitle="Latest coding challenge submissions."
          icon={FileCheck}
          iconTone="bg-emerald-500/10 text-emerald-400"
        >
          <div className="space-y-3">
            {dashboard.recentSubmissions?.length ? (
              dashboard.recentSubmissions.map((submission: any) => (
                <ActivityItem
                  key={submission.id}
                  title={submission.challengeTitle}
                  meta={`by ${submission.userName} | ${submission.language}`}
                  time={formatDateTime(submission.createdAt)}
                  badge={submission.status}
                  badgeTone={getStatusTone(submission.status)}
                />
              ))
            ) : (
              <EmptyState message="No recent submissions yet." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Recent Interviews"
          subtitle="Latest generated interviews and attempt activity."
          icon={MessageSquare}
          iconTone="bg-amber-500/10 text-amber-400"
          action={<SectionLink href="/admin/interviews" label="View all" />}
        >
          <div className="space-y-3">
            {dashboard.recentInterviews?.length ? (
              dashboard.recentInterviews.map((interview: any) => (
                <ActivityItem
                  key={interview.id}
                  href={`/admin/interviews/${interview.id}`}
                  title={interview.role}
                  meta={`${interview.userName} | ${interview.level} | ${
                    interview.type
                  } | ${interview.techstack?.join(", ") || "No tech stack"}`}
                  time={formatDateTime(interview.createdAt)}
                  badge={interview.status}
                  badgeTone={getStatusTone(interview.status)}
                  side={
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-primary-200">
                        {interview.attempts}
                      </p>
                      <p className="text-[11px] text-light-500">attempts</p>
                    </div>
                  }
                />
              ))
            ) : (
              <EmptyState message="No recent interviews yet." />
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <SectionCard
          title="Recent Admin Actions"
          subtitle="Latest tracked changes made by admins."
          icon={ScrollText}
          iconTone="bg-primary-200/10 text-primary-200"
          action={<SectionLink href="/admin/audit-logs" label="View logs" />}
        >
          <div className="space-y-3">
            {dashboard.recentAuditLogs?.length ? (
              dashboard.recentAuditLogs.map((log: any) => (
                <ActivityItem
                  key={log.id}
                  href={`/admin/audit-logs?search=${encodeURIComponent(
                    log.entityName || log.action,
                  )}`}
                  title={log.entityName || log.entityId || "Unknown entity"}
                  meta={`${log.entityType} by ${
                    log.admin?.name || "Unknown admin"
                  }`}
                  time={formatDateTime(log.createdAt)}
                  badge={formatAuditAction(log.action)}
                  badgeTone={getAuditActionTone(log.action)}
                />
              ))
            ) : (
              <EmptyState message="No admin actions have been logged yet." />
            )}
          </div>
        </SectionCard>

        <SectionCard
          title={`Top Content (${selectedRangeLabel})`}
          subtitle="Skills and challenges ranked by submissions in the selected range."
          icon={Trophy}
          iconTone="bg-amber-500/10 text-amber-400"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-light-500">
                  Top Skills
                </p>
                <Link
                  href="/admin/skills"
                  className="text-xs font-semibold text-primary-200 hover:text-primary-100"
                >
                  Manage
                </Link>
              </div>
              <div className="space-y-2">
                {dashboard.topSkills?.length ? (
                  dashboard.topSkills.map((skill: any, index: number) => (
                    <RankItem
                      key={skill.id}
                      index={index}
                      title={skill.name}
                      meta={skill.isActive ? "Active" : "Disabled"}
                      value={skill.submissionCount}
                      valueTone="text-amber-300"
                    />
                  ))
                ) : (
                  <EmptyState message="No skill submissions in this range." />
                )}
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-light-500">
                  Top Challenges
                </p>
                <Link
                  href="/admin/challenges"
                  className="text-xs font-semibold text-primary-200 hover:text-primary-100"
                >
                  Manage
                </Link>
              </div>
              <div className="space-y-2">
                {dashboard.topChallenges?.length ? (
                  dashboard.topChallenges.map((challenge: any, index: number) => (
                    <RankItem
                      key={challenge.id}
                      index={index}
                      title={challenge.title}
                      meta={`${challenge.skillName} | ${challenge.difficulty}`}
                      value={challenge.submissionCount}
                      valueTone="text-emerald-300"
                      href={`/admin/challenges?search=${encodeURIComponent(
                        challenge.title,
                      )}`}
                    />
                  ))
                ) : (
                  <EmptyState message="No challenge submissions in this range." />
                )}
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
