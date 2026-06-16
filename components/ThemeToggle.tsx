"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";

const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex size-9 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.04]">
        <div className="size-4" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative flex size-9 items-center justify-center rounded-xl border border-border bg-card/60 backdrop-blur-sm transition-all duration-300 hover:border-primary-200/30 hover:bg-primary-200/10"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Moon className="size-[18px] text-primary-100 transition-colors group-hover:text-primary-200" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Sun className="size-[18px] text-amber-800 dark:text-amber-500 transition-colors group-hover:text-amber-400" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;
