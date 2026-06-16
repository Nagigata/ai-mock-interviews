"use client";

import { ReactNode, useCallback, useRef, useState } from "react";
import Link from "next/link";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
import { Code2, MessageSquare } from "lucide-react";

import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { getUserProfileById } from "@/lib/actions/user.actions";

interface UserHoverCardProps {
  userId: string;
  children: ReactNode;
  defaultName?: string;
  defaultAvatarUrl?: string | null;
}

type HoverData = {
  name: string;
  avatarUrl: string | null;
  solutionCount: number;
  discussCount: number;
};

const UserHoverCard = ({
  userId,
  children,
  defaultName = "User",
  defaultAvatarUrl = null,
}: UserHoverCardProps) => {
  const [data, setData] = useState<HoverData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const fetchedRef = useRef(false);

  const handleOpenChange = useCallback(
    async (open: boolean) => {
      if (!open || fetchedRef.current || loading) return;
      fetchedRef.current = true;
      setLoading(true);
      setError(false);
      try {
        const profile = await getUserProfileById(userId);
        if (!profile) {
          setError(true);
          return;
        }
        setData({
          name: profile.name,
          avatarUrl: profile.avatarUrl ?? null,
          solutionCount: profile.solutionCount ?? 0,
          discussCount: profile.discussCount ?? 0,
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [userId, loading],
  );

  const display = {
    name: data?.name ?? defaultName,
    avatarUrl: data?.avatarUrl ?? defaultAvatarUrl,
  };

  return (
    <HoverCardPrimitive.Root
      openDelay={250}
      closeDelay={120}
      onOpenChange={handleOpenChange}
    >
      <HoverCardPrimitive.Trigger asChild>
        <Link
          href={`/profile/${userId}`}
          onClick={(event) => event.stopPropagation()}
          className="inline-flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-primary-200/40 rounded-full"
        >
          {children}
        </Link>
      </HoverCardPrimitive.Trigger>
      <HoverCardPrimitive.Portal>
        <HoverCardPrimitive.Content
          align="start"
          sideOffset={8}
          className="z-50 w-72 rounded-2xl border border-foreground/[0.08] bg-card p-4 text-foreground shadow-[0_24px_60px_rgba(0,0,0,0.45)] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center gap-3">
            <UserAvatar
              name={display.name}
              avatarUrl={display.avatarUrl}
              size="md"
              className="border-foreground/15"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-white">
                {display.name}
              </p>
              <p className="text-xs text-foreground/55">
                {loading ? "Loading…" : error ? "Profile unavailable" : "Member"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Stat
              icon={<Code2 className="size-4 text-primary-100" />}
              label="Solutions"
              value={data?.solutionCount ?? 0}
              loading={loading && !data}
            />
            <Stat
              icon={<MessageSquare className="size-4 text-cyan-700 dark:text-cyan-300" />}
              label="Discuss"
              value={data?.discussCount ?? 0}
              loading={loading && !data}
            />
          </div>

          <div className="mt-4">
            <Link href={`/profile/${userId}`} className="block">
              <Button className="w-full" size="sm" variant="outline">
                View profile
              </Button>
            </Link>
          </div>

          <HoverCardPrimitive.Arrow className="fill-[#101318]" />
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Portal>
    </HoverCardPrimitive.Root>
  );
};

const Stat = ({
  icon,
  label,
  value,
  loading,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  loading: boolean;
}) => (
  <div className="rounded-xl border border-foreground/[0.06] bg-foreground/[0.03] px-3 py-2">
    <div className="flex items-center gap-2 text-xs font-semibold text-foreground/70">
      {icon}
      {label}
    </div>
    <p className="mt-1 text-lg font-bold text-white">
      {loading ? "—" : value}
    </p>
  </div>
);

export default UserHoverCard;
