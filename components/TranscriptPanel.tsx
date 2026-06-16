"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";

interface TranscriptMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface TranscriptPanelProps {
  messages: TranscriptMessage[];
  userName: string;
  userAvatarUrl?: string | null;
  aiName: string;
  title: string;
  emptyText: string;
  className?: string;
}

const TranscriptPanel = ({
  messages,
  userName,
  userAvatarUrl,
  aiName,
  title,
  emptyText,
  className,
}: TranscriptPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the newest message whenever one is appended.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages.length]);

  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-3xl border border-border bg-card/60 shadow-2xl",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <span className="size-2 rounded-full bg-primary-200" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
          {title}
        </h3>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">{emptyText}</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.role === "user";
            const isLatest = index === messages.length - 1;

            return (
              <div
                key={index}
                className={cn(
                  "flex items-end gap-3",
                  isUser ? "flex-row-reverse" : "flex-row",
                )}
              >
                {isUser ? (
                  <UserAvatar
                    name={userName || "User"}
                    avatarUrl={userAvatarUrl}
                    size="sm"
                    className="shrink-0"
                  />
                ) : (
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-[#eef0ff]">
                    <Image
                      src="/ai-avatar.png"
                      alt={aiName}
                      width={20}
                      height={20}
                      className="opacity-90"
                    />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    isUser
                      ? "rounded-br-sm bg-primary-200/20 text-white"
                      : "rounded-bl-sm bg-muted text-foreground/90",
                    isLatest && "animate-fadeIn ring-1 ring-primary-200/40",
                  )}
                >
                  {message.content}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TranscriptPanel;
