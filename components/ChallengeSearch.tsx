"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

const ChallengeSearch = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [globalSearch, setGlobalSearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      let shouldUpdate = false;

      if (globalSearch) {
        if (params.get("search") !== globalSearch) {
          params.set("search", globalSearch);
          shouldUpdate = true;
        }
      } else {
        if (params.has("search")) {
          params.delete("search");
          shouldUpdate = true;
        }
      }

      if (shouldUpdate) {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [globalSearch, pathname, router, searchParams]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search for an algorithm, question, or keyword..."
        value={globalSearch}
        onChange={(e) => setGlobalSearch(e.target.value)}
        className="w-full bg-card/50 backdrop-blur-sm border border-foreground/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:border-primary-200/30 focus:ring-primary-200/30 transition-all font-medium"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground size-5 pointer-events-none" />
    </div>
  );
};

export default ChallengeSearch;
