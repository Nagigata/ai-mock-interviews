import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface UnderlineTabItem<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon?: LucideIcon;
  href?: string;
}

interface UnderlineTabsProps<T extends string> {
  tabs: UnderlineTabItem<T>[];
  activeTab: T;
  onChange?: (tab: T) => void;
}

const tabClassName = (isActive: boolean) =>
  `relative -mb-px flex w-36 items-center justify-center gap-2 pb-3 text-sm font-semibold transition-colors ${
    isActive ? "text-white" : "text-light-400 hover:text-light-100"
  }`;

const TabContent = <T extends string>({
  tab,
  isActive,
}: {
  tab: UnderlineTabItem<T>;
  isActive: boolean;
}) => {
  const Icon = tab.icon;

  return (
    <>
      {Icon && <Icon className="size-4" />}
      <span>{tab.label}</span>
      {typeof tab.count === "number" && (
        <span
          className={`flex size-5 items-center justify-center rounded-full text-[11px] font-bold ${
            isActive
              ? "bg-primary-200 text-dark-100"
              : "bg-white/[0.08] text-light-400"
          }`}
        >
          {tab.count}
        </span>
      )}
      {isActive && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-white" />
      )}
    </>
  );
};

const UnderlineTabs = <T extends string>({
  tabs,
  activeTab,
  onChange,
}: UnderlineTabsProps<T>) => {
  return (
    <div className="flex gap-3 border-b border-white/[0.08]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (tab.href) {
          return (
            <Link
              key={tab.id}
              href={tab.href}
              scroll={false}
              className={tabClassName(isActive)}
            >
              <TabContent tab={tab} isActive={isActive} />
            </Link>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange?.(tab.id)}
            className={tabClassName(isActive)}
          >
            <TabContent tab={tab} isActive={isActive} />
          </button>
        );
      })}
    </div>
  );
};

export default UnderlineTabs;
