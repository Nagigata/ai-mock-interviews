"use client";

import type { ComponentType, ReactNode } from "react";

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  metrics?: string[];
  actions?: ReactNode;
}

export default function AdminPageHeader({
  eyebrow = "Admin workspace",
  title,
  description,
  icon: Icon,
  metrics,
  actions,
}: AdminPageHeaderProps) {
  return (
    <section className="rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(202,197,254,0.16),transparent_34%),linear-gradient(135deg,rgba(24,27,34,0.92),rgba(11,13,18,0.95))] p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex min-w-0 gap-4">
          {Icon && (
            <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary-200 sm:flex">
              <Icon className="size-6" />
            </div>
          )}

          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary-200">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-white">{title}</h1>
            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-light-400">
                {description}
              </p>
            )}
            {metrics?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {metrics.map((metric) => (
                  <span
                    key={metric}
                    className="rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1 text-xs font-semibold text-primary-100"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {actions && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
