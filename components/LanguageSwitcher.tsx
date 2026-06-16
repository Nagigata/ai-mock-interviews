"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronDown } from "lucide-react";

interface LanguageSwitcherProps {
  currentLocale: string;
}

const LanguageSwitcher = ({ currentLocale }: LanguageSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const languages = [
    { code: "en", label: "EN", flag: "https://flagcdn.com/gb.svg" },
    { code: "vi", label: "VI", flag: "https://flagcdn.com/vn.svg" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === currentLocale) || languages[0];

  const handleLanguageChange = (locale: string) => {
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    setIsOpen(false);
    router.refresh();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-50" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-white hover:border-primary-200 transition-all shadow-md min-w-[150px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Image src={currentLanguage.flag} alt={currentLanguage.label} width={20} height={14} />
          <span className="font-bold">{currentLanguage.label}</span>
        </div>
        <ChevronDown className={`size-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-full min-w-[100px] bg-card border border-border rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${currentLocale === lang.code ? "bg-muted text-primary-200 font-bold" : "text-white"
                }`}
            >
              <Image src={lang.flag} alt={lang.label} width={20} height={14} />
              <span>{lang.label === "VI" ? "Tiếng Việt" : "English"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
