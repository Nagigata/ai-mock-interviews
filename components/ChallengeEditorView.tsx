"use client";

import { useState } from "react";
import { Challenge } from "@/types";
import {
  Panel,
  Group,
  Separator
} from "react-resizable-panels";
import ProblemDescription from "@/components/ProblemDescription";
import CodeEditor from "@/components/CodeEditor";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { runCode, submitChallenge } from "@/lib/actions/submissions.action";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Send,
  RotateCcw,
} from "lucide-react";

interface ChallengeEditorViewProps {
  challenge: Challenge;
  skillSlug: string;
  currentUserId?: string;
}

interface JudgeStatus {
  id: number;
  description: string;
}

interface TestCaseResult {
  status: JudgeStatus;
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  time?: string | null;
}

interface ExecutionResult {
  allPassed?: boolean;
  testCaseResults: TestCaseResult[];
  passedTestCases?: number;
  totalTestCases?: number;
}

const ChallengeEditorView = ({ challenge, skillSlug, currentUserId }: ChallengeEditorViewProps) => {
  const templateCode = challenge.templateCode as Record<string, string>;
  const availableLangs = Object.keys(templateCode);

  // States for user interaction
  const [language, setLanguage] = useState<string>(
    availableLangs.includes("python") ? "python" : availableLangs[0]
  );
  const [code, setCode] = useState<string>(templateCode[language] || "");
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] =
    useState<ExecutionResult | null>(null);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const handleRunCode = async () => {
    setIsExecuting(true);
    setIsConsoleOpen(true);
    setExecutionResult(null);

    const result = await runCode({
      challengeId: challenge.id,
      code,
      language
    });

    if (result.success) {
      const data = result.data as ExecutionResult;
      setExecutionResult(data);
      if (data.testCaseResults?.[0]?.status?.id === 3) {
        toast.success("Test case passed!");
      } else {
        toast.error("Test case failed");
      }
    } else {
      toast.error(result.error);
    }
    setIsExecuting(false);
  };

  const handleSubmit = async () => {
    setIsExecuting(true);
    setIsConsoleOpen(true);
    setExecutionResult(null);

    const result = await submitChallenge({
      challengeId: challenge.id,
      code,
      language
    });

    if (result.success) {
      const data = result.data as ExecutionResult;
      setExecutionResult(data);
      if (data.allPassed) {
        toast.success("Congratulations! All test cases passed.", {
          duration: 5000,
        });
      } else {
        toast.error("Some test cases failed. Keep trying!");
      }
    } else {
      toast.error(result.error);
    }
    setIsExecuting(false);
  };

  const handleResetCode = () => {
    setCode(templateCode[language] || "");
    setExecutionResult(null);
    toast.info("Code has been reset to template");
  };

  return (
    <div className="flex h-full flex-col">
      {/* Top Header/Toolbar */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-dark-300 px-6 py-3 shadow-lg">
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href={`/preparation/${skillSlug}`}
            className="p-2 hover:bg-dark-200 rounded-lg transition-colors text-light-400 hover:text-white"
            aria-label="Back to skill"
          >
            <ChevronLeft size={20} />
          </Link>

          <div className="min-w-0">
            <nav
              aria-label="Breadcrumb"
              className="mb-1 flex min-w-0 items-center gap-1.5 text-[11px] font-semibold"
            >
              <Link
                href="/preparation"
                className="shrink-0 text-light-500 transition-colors hover:text-primary-100"
              >
                Preparation
              </Link>
              <ChevronRight className="size-3.5 shrink-0 text-light-600" />
              <Link
                href={`/preparation/${skillSlug}`}
                className="max-w-[140px] truncate text-light-400 transition-colors hover:text-primary-100"
              >
                {skillSlug}
              </Link>
              <ChevronRight className="size-3.5 shrink-0 text-light-600" />
              <span className="truncate text-primary-100">{challenge.title}</span>
            </nav>
            <h2 className="truncate text-sm font-bold leading-none text-white">
              {challenge.title}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={language}
            disabled={isExecuting}
            onChange={(e) => {
              const newLang = e.target.value;
              setLanguage(newLang);
              setCode(templateCode[newLang] || "");
              setExecutionResult(null);
            }}
            className="bg-dark-200 text-light-100 text-xs font-bold border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary-200 cursor-pointer disabled:opacity-50 h-9"
          >
            {availableLangs.map((lang) => (
              <option key={lang} value={lang} className="capitalize">{lang}</option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            disabled={isExecuting}
            onClick={handleResetCode}
            className="bg-dark-200 border-white/10 text-light-100 hover:bg-dark-100 hover:text-white h-9 gap-2"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </Button>

          <div className="h-6 w-px bg-white/5 mx-1" />

          <Button
            size="sm"
            disabled={isExecuting}
            onClick={handleRunCode}
            className="bg-primary-200 text-dark-100 hover:bg-primary-200/80 font-bold px-6 min-w-[80px] h-9 gap-2"
          >
            {isExecuting ? (
              <div className="size-4 border-2 border-dark-100/30 border-t-dark-100 rounded-full animate-spin" />
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Run</span>
              </>
            )}
          </Button>

          <Button
            size="sm"
            disabled={isExecuting}
            onClick={handleSubmit}
            className="bg-success-100 text-white hover:bg-success-200 font-bold px-6 min-w-[100px] h-9 gap-2"
          >
            {isExecuting ? (
              <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={14} />
                <span>Submit</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Resizable Layout */}
      <div className="relative flex-1 overflow-hidden border-b border-white/5 bg-dark-400 shadow-2xl">
        <Group orientation="horizontal">
          {/* Left: Problem Description */}
          <Panel defaultSize={40} minSize={30}>
            <ProblemDescription
              challenge={challenge}
              currentUserId={currentUserId}
            />
          </Panel>

          <Separator className="w-1 bg-white/5 hover:bg-primary-200/30 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="h-8 w-[2px] bg-light-600/30 rounded-full" />
          </Separator>

          {/* Right: Code Editor & Console */}
          <Panel defaultSize={60} minSize={30}>
            <Group orientation="vertical">
              <Panel defaultSize={70} minSize={20}>
                <div className="flex h-full flex-col bg-[#08090D]">
                  <div className="min-h-0 flex-1">
                    <CodeEditor
                      key={`editor-${language}`}
                      value={code}
                      onChange={(val) => setCode(val || "")}
                      language={language}
                      onRun={handleRunCode}
                    />
                  </div>
                </div>
              </Panel>

              {isConsoleOpen && (
                <>
                  <Separator className="h-1 bg-white/5 hover:bg-primary-200/30 transition-colors cursor-row-resize flex items-center justify-center">
                    <div className="w-8 h-[2px] bg-light-600/30 rounded-full" />
                  </Separator>
                  <Panel defaultSize={30} minSize={10}>
                    <div className="h-full bg-[#0d0e12] flex flex-col">
                      <div className="flex items-center justify-between px-4 py-2 bg-dark-300 border-b border-white/5">
                        <span className="text-[10px] font-bold text-light-600 uppercase tracking-widest leading-none">Console Output</span>
                        <button
                          onClick={() => setIsConsoleOpen(false)}
                          aria-label="Close console"
                          className="text-light-600 hover:text-white transition-colors p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
                        {isExecuting ? (
                          <div className="flex items-center gap-3 text-light-400">
                            <div className="size-3 border-2 border-primary-200/30 border-t-primary-200 rounded-full animate-spin" />
                            <span>Executing code...</span>
                          </div>
                        ) : executionResult ? (
                          <div className="space-y-4">
                            {executionResult.testCaseResults.map((res, idx) => (
                              <div key={idx} className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                    res.status.id === 3 ? "bg-success-100/10 text-success-100" : "bg-destructive-100/10 text-destructive-100"
                                  )}>
                                    {res.status.description}
                                  </span>
                                  <span className="text-light-600">Test Case {idx + 1}</span>
                                  {res.time && <span className="text-[10px] text-light-600">({Math.round(parseFloat(res.time) * 1000)}ms)</span>}
                                </div>

                                {res.stdout && (
                                  <div className="bg-black/30 p-2 rounded border border-white/5">
                                    <div className="text-[10px] text-light-600 mb-1 uppercase tracking-tighter">Output:</div>
                                    <pre className="text-success-100 whitespace-pre-wrap">{res.stdout}</pre>
                                  </div>
                                )}

                                {res.compile_output && (
                                  <div className="bg-destructive-100/5 p-2 rounded border border-destructive-100/10">
                                    <div className="text-[10px] text-destructive-100/60 mb-1 uppercase tracking-tighter">Compile Error:</div>
                                    <pre className="text-destructive-100 whitespace-pre-wrap">{res.compile_output}</pre>
                                  </div>
                                )}

                                {res.stderr && (
                                  <div className="bg-destructive-100/5 p-2 rounded border border-destructive-100/10">
                                    <div className="text-[10px] text-destructive-100/60 mb-1 uppercase tracking-tighter">Runtime Error:</div>
                                    <pre className="text-destructive-100 whitespace-pre-wrap">{res.stderr}</pre>
                                  </div>
                                )}

                                {res.status.id !== 3 && !res.compile_output && !res.stderr && (
                                  <div className="bg-destructive-100/5 p-2 rounded border border-destructive-100/10">
                                    <div className="text-[10px] text-destructive-100/60 mb-1 uppercase tracking-tighter">Expected Output:</div>
                                    <pre className="text-light-400 whitespace-pre-wrap">{challenge.testCases[idx]?.output || "N/A"}</pre>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-light-600 italic">Click &quot;Run&quot; to see execution results.</div>
                        )}
                      </div>
                    </div>
                  </Panel>
                </>
              )}
            </Group>
          </Panel>
        </Group>
      </div>

      {/* Shortcuts Help Bar */}
      <footer className="hidden items-center justify-between bg-[#08090D] px-6 py-2 text-[10px] font-medium text-light-600 md:flex">
        <div className="flex gap-4">
          <span>Shortcuts: <kbd className="bg-dark-300 px-1 rounded">Ctrl</kbd> + <kbd className="bg-dark-300 px-1 rounded">Enter</kbd> to Run</span>
        </div>
        <div>
          Powered by Judge0 & PrepWise
        </div>
      </footer>
    </div>
  );
};

export default ChallengeEditorView;
