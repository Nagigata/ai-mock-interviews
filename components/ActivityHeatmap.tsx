"use client";

import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { ActivityCalendar } from "react-activity-calendar";
import { Activity } from "lucide-react";
import { ActivityDay } from "@/types";

dayjs.extend(advancedFormat);

interface ActivityHeatmapProps {
  activity: ActivityDay[];
  activeDays: number;
  maxStreak: number;
}

const ActivityHeatmap = ({
  activity,
}: ActivityHeatmapProps) => {
  return (
    <section className="rounded-[32px] border border-white/[0.08] bg-[#101318] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:p-7">
      <style jsx global>{`
        .react-activity-calendar__tooltip {
          padding: 6px 10px !important;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px !important;
          background: rgba(18, 21, 27, 0.96) !important;
          color: #f5f7ff !important;
          font-size: 11px !important;
          line-height: 1.4;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(12px);
        }

        .react-activity-calendar__tooltip[data-color-scheme='dark'] {
          background: rgba(18, 21, 27, 0.96) !important;
          color: #f5f7ff !important;
        }

        .react-activity-calendar__tooltip-arrow,
        .react-activity-calendar__tooltip[data-color-scheme='dark'] .react-activity-calendar__tooltip-arrow {
          fill: rgba(18, 21, 27, 0.96) !important;
        }
      `}</style>

      <div className="flex items-start gap-3">
        <div className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-300">
          <Activity className="size-5" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
            Activity
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Practice Calendar
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-light-100/75">
            Daily submission rhythm across the past year.
          </p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-[26px] border border-white/[0.08] bg-white/[0.035] p-4">
        <div className="flex min-w-max justify-center">
          <div className="[&_.react-activity-calendar__count]:hidden [&_.react-activity-calendar__legend-colors]:gap-1.5 [&_.react-activity-calendar__legend-month]:text-light-400 [&_.react-activity-calendar__month-label]:fill-[#d6e0ff] [&_.react-activity-calendar__svg]:mx-auto [&_.react-activity-calendar__svg]:w-auto">
          <ActivityCalendar
            data={activity}
            colorScheme="dark"
            blockSize={12}
            blockMargin={5}
            blockRadius={3}
            fontSize={13}
            showWeekdayLabels={true}
            weekStart={0}
            theme={{
              dark: ["#2b2d31", "#0e5e54", "#148f67", "#20b36f", "#49de50"],
            }}
            labels={{
              weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
              totalCount: "",
              legend: {
                less: "Less",
                more: "More",
              },
            }}
            tooltips={{
              activity: {
                text: (activityDay) =>
                  `${activityDay.count} ${activityDay.count === 1 ? "submission" : "submissions"} on ${dayjs(activityDay.date).format("dddd, Do MMMM YYYY")}`,
              },
            }}
          />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActivityHeatmap;
