"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "size-9 text-[13px]",
  md: "size-12 text-base",
  lg: "size-20 text-2xl",
  xl: "size-28 text-4xl",
};

const imageSizes = {
  sm: "36px",
  md: "48px",
  lg: "80px",
  xl: "112px",
};

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ||
  "http://localhost:3001";

function resolveAvatarUrl(url?: string | null): string | null {
  if (!url) return null;
  // Relative path from backend -> prepend backend origin.
  if (url.startsWith("/uploads/")) return `${BACKEND_ORIGIN}${url}`;
  return url;
}

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

const UserAvatar = ({
  name,
  avatarUrl,
  size = "md",
  className,
}: UserAvatarProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const resolvedUrl = resolveAvatarUrl(avatarUrl);
  const shouldShowImage = Boolean(resolvedUrl && !hasImageError);
  const isLocalAvatar =
    resolvedUrl?.startsWith("http://localhost:") ||
    resolvedUrl?.startsWith("http://127.0.0.1:");

  const initials = useMemo(() => getInitials(name), [name]);

  return (
    <div
      aria-label={`${name || "User"} avatar`}
      className={cn(
        "group/avatar relative isolate overflow-hidden rounded-full border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(202,197,254,0.26),transparent_34%),linear-gradient(135deg,#2b3140_0%,#151a23_48%,#090c11_100%)] text-primary-100 shadow-[0_10px_28px_rgba(0,0,0,0.28)] ring-1 ring-white/[0.04] transition-all duration-200",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-[linear-gradient(135deg,rgba(255,255,255,0.18),transparent_35%,rgba(255,255,255,0.05))] after:opacity-80",
        sizeClasses[size],
        className,
      )}
    >
      {shouldShowImage ? (
        <Image
          src={resolvedUrl!}
          alt={name}
          fill
          unoptimized={isLocalAvatar}
          className="object-cover transition-transform duration-300 group-hover/avatar:scale-[1.04]"
          sizes={imageSizes[size]}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-extrabold tracking-[-0.04em]">
          <span className="drop-shadow-[0_2px_10px_rgba(202,197,254,0.35)]">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
