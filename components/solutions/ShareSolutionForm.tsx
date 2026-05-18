"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Code2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createSolution } from "@/lib/actions/solutions.actions";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface Props {
  challengeId: string;
  skillSlug: string;
  submissionId: string;
  language: string;
  code: string;
}

const PLACEHOLDER = `## Intuition
Briefly explain your initial thought process.

## Approach
Describe the algorithm step-by-step.

## Complexity
- Time complexity: O(n)
- Space complexity: O(1)

## Code
The code is shown below. You can add additional explanations here.
`;

export function ShareSolutionForm({
  challengeId,
  skillSlug,
  submissionId,
  language,
  code,
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    setLoading(true);
    try {
      const res = (await createSolution(challengeId, {
        submissionId,
        title: title.trim(),
        description: description.trim() || undefined,
      })) as { id: string };
      toast.success("Solution published!");
      router.replace(
        `/preparation/${skillSlug}/${challengeId}?tab=solutions&solutionId=${res.id}`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to publish solution";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-light-100">
      <div className="sticky top-0 z-10 border-b border-white/5 bg-[#08090D]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-white">Share Solution</h1>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            size="sm"
            className="gap-2"
          >
            <Send className="size-3.5" />
            {loading ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6 px-6 py-6">
        <div className="space-y-2">
          <Label htmlFor="sol-title" className="text-light-300">
            Title
          </Label>
          <Input
            id="sol-title"
            placeholder="e.g. Two-pointer O(n) approach with detailed explanation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="border-white/10 bg-white/[0.03] text-base text-white placeholder:text-light-600 focus-visible:border-primary-200/40"
          />
          <div className="flex justify-end text-xs text-light-600">
            {title.length} / 200
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-light-300">Write-up (Markdown)</Label>
          <div data-color-mode="dark">
            <MDEditor
              value={description}
              onChange={(val) => setDescription(val ?? "")}
              preview="live"
              height={480}
              placeholder={PLACEHOLDER}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-light-300">
              <span className="inline-flex items-center gap-2">
                <Code2 className="size-4" />
                Your accepted solution
              </span>
            </Label>
            <Badge variant="outline" className="border-white/10 text-light-300">
              {language}
            </Badge>
          </div>
          <div className="overflow-hidden rounded-md border border-white/10 text-sm">
            <SyntaxHighlighter
              language={language}
              style={oneDark}
              showLineNumbers
              customStyle={{ margin: 0, background: "#0b0c10" }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
          <p className="text-xs text-light-600">
            This is your accepted submission and will be included with your post.
          </p>
        </div>
      </div>
    </div>
  );
}
