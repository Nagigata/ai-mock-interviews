"use client";

import Link from "next/link";
import Image from "next/image";
import type { getDictionary } from "@/lib/i18n";
import { Skill } from "@/types";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Code2, Layers3 } from "lucide-react";

interface SkillCardProps {
  skill: Skill;
  dictionary: ReturnType<typeof getDictionary>;
  index: number;
  locale?: string;
}

const SkillCard = ({ skill, dictionary, index, locale = "en" }: SkillCardProps) => {
  const t = dictionary;
  const descriptionFallback =
    locale === "vi"
      ? "Luyện tập các challenge theo chủ đề này."
      : "Practice focused challenges in this track.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="w-full"
    >
      <Link href={`/preparation/${skill.slug}`} className="group block h-full">
        <article
          className="relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-[28px] border border-[var(--surface-border)] p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200/20"
          style={{
            background: `linear-gradient(180deg, var(--surface-card-gradient-from), var(--surface-card-gradient-to))`,
            boxShadow: `0 12px 34px var(--shadow-color)`,
          }}
        >
          <div className="relative flex flex-1 flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              {skill.icon ? (
                <div className="flex size-14 items-center justify-center rounded-2xl border border-[var(--surface-border)] p-3 transition-colors group-hover:border-primary-200/20 group-hover:bg-primary-200/10" style={{ background: "var(--surface-overlay)" }}>
                  <Image
                    src={skill.icon}
                    alt={skill.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex size-14 items-center justify-center rounded-2xl border border-[var(--surface-border)] p-3 transition-colors group-hover:border-primary-200/20 group-hover:bg-primary-200/10" style={{ background: "var(--surface-overlay)" }}>
                  <BookOpen className="size-6" style={{ color: "var(--text-muted)" }} />
                </div>
              )}

              <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200/20 bg-primary-200/10 px-2.5 py-1 text-[11px] font-semibold text-primary-100">
                <Layers3 className="size-3.5" />
                {skill._count?.challenges || 0} {t.preparation.challenges}
              </span>
            </div>

            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[var(--surface-border)] px-2.5 py-1 text-[11px] font-semibold" style={{ background: "var(--surface-overlay)", color: "var(--text-muted)" }}>
                <Code2 className="size-3.5 text-primary-100/70" />
                {skill.slug}
              </div>

              <h3 className="text-xl font-bold leading-tight transition-colors group-hover:text-primary-100" style={{ color: "var(--text-heading)" }}>
                {skill.name}
              </h3>
              <p className="line-clamp-3 min-h-[63px] text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {skill.description || descriptionFallback}
              </p>
            </div>
          </div>

          <div className="relative mt-6 flex items-center justify-between rounded-2xl border border-[var(--surface-border)] px-4 py-3" style={{ background: "var(--surface-overlay)" }}>
            <span className="text-sm font-bold text-primary-100">
              {t.preparation.startBtn}
            </span>
            <ChevronRight className="size-4 text-primary-100 transition-transform group-hover:translate-x-1" />
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

export default SkillCard;
