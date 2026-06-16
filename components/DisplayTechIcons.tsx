"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { mappings } from "@/constants";

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

const normalizeTechName = (tech: string) => {
  const key = tech.toLowerCase().replace(/\.js$/, "").replace(/\s+/g, "");
  return mappings[key as keyof typeof mappings];
};

interface DisplayTechIconsProps {
  techStack: string[];
}

const DisplayTechIcons = ({ techStack }: DisplayTechIconsProps) => {
  const techIcons = techStack.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: normalized
        ? `${techIconBaseURL}/${normalized}/${normalized}-original.svg`
        : "/tech.svg",
    };
  });

  return (
    <div className="flex flex-row">
      {techIcons.slice(0, 3).map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-muted rounded-full p-2 flex flex-center",
            index >= 1 && "-ml-3",
          )}
        >
          <span className="tech-tooltip">{tech}</span>
          <Image
            src={url}
            alt={tech}
            width={100}
            height={100}
            className="size-5"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/tech.svg";
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default DisplayTechIcons;
