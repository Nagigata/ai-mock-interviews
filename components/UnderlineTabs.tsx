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
    isActive ? "text-[var(--text-heading)]" : "text-[var(--text-muted)] hover:text-[var(--text-body)]"
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
              : "bg-[var(--surface-overlay)] text-[var(--text-muted)]"
          }`}
        >
          {tab.count}
        </span>
      )}
      {isActive && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary-200" />
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
    <div className="flex gap-3 border-b border-[var(--surface-border)]">
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
