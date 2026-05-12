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
        <article className="relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-[28px] border border-white/[0.07] bg-[linear-gradient(180deg,_rgba(29,32,41,0.94),_rgba(15,17,23,0.98))] p-5 shadow-[0_12px_34px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-200/20 hover:shadow-[0_16px_44px_rgba(0,0,0,0.24)]">
          <div className="relative flex flex-1 flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              {skill.icon ? (
                <div className="flex size-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04] p-3 transition-colors group-hover:border-primary-200/20 group-hover:bg-primary-200/10">
                  <Image
                    src={skill.icon}
                    alt={skill.name}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex size-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.04] p-3 transition-colors group-hover:border-primary-200/20 group-hover:bg-primary-200/10">
                  <BookOpen className="size-6 text-light-400" />
                </div>
              )}

              <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200/20 bg-primary-200/10 px-2.5 py-1 text-[11px] font-semibold text-primary-100">
                <Layers3 className="size-3.5" />
                {skill._count?.challenges || 0} {t.preparation.challenges}
              </span>
            </div>

            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-light-400">
                <Code2 className="size-3.5 text-primary-100/70" />
                {skill.slug}
              </div>

              <h3 className="text-xl font-bold leading-tight text-white transition-colors group-hover:text-primary-100">
                {skill.name}
              </h3>
              <p className="line-clamp-3 min-h-[63px] text-sm leading-relaxed text-light-400">
                {skill.description || descriptionFallback}
              </p>
            </div>
          </div>

          <div className="relative mt-6 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-3">
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
