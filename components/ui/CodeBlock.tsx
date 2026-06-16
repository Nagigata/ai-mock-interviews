"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props {
  code: string;
  language: string;
  showCopy?: boolean;
  showLineNumbers?: boolean;
}

export function CodeBlock({ code, language, showCopy = true, showLineNumbers = true }: Props) {
  const [copied, setCopied] = useState(false);
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-md text-sm">
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code"
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-md border border-foreground/10 bg-foreground/[0.06] px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      )}
      <SyntaxHighlighter
        language={language}
        style={isLight ? oneLight : oneDark}
        showLineNumbers={showLineNumbers}
        customStyle={{ margin: 0, background: isLight ? "#f5f6fc" : "#0b0c10" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
