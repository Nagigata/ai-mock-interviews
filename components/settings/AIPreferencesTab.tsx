"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Brain, Cpu, Key, Eye, EyeOff, Save, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import { UserProfile } from "@/types";
import { updateAIPreferences } from "@/lib/actions/user.actions";

interface AIPreferencesTabProps {
  profile: UserProfile;
}

const PROVIDERS = [
  {
    id: "local-qwen",
    name: "Local Qwen (Free)",
    description: "Runs on our local GPU server. Free to use, no API key required.",
    models: [
      { id: "qwen-3b", name: "Qwen 2.5 3B Instruct" }
    ]
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Requires your own Google AI API Key. Highly optimized and accurate.",
    models: [
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (Recommended)" },
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro" },
      { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash" }
    ]
  },
  {
    id: "openai",
    name: "OpenAI GPT",
    description: "Requires your own OpenAI API Key. Standard performance and depth.",
    models: [
      { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast & Cheap)" },
      { id: "gpt-4o", name: "GPT-4o (Deep Evaluation)" }
    ]
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    description: "Requires your own Anthropic API Key. Superior coding and reasoning ability.",
    models: [
      { id: "claude-3-5-haiku-20241022", name: "Claude 3.5 Haiku" },
      { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet (State-of-the-Art)" }
    ]
  }
];

export default function AIPreferencesTab({ profile }: AIPreferencesTabProps) {
  const [isPending, setIsPending] = useState(false);

  // States for Question Generation config
  const [questionProvider, setQuestionProvider] = useState(profile.aiQuestionProvider || "local-qwen");
  const [questionModel, setQuestionModel] = useState(profile.aiQuestionModel || "qwen-3b");

  // States for Feedback Generation config
  const [feedbackProvider, setFeedbackProvider] = useState(profile.aiFeedbackProvider || "local-qwen");
  const [feedbackModel, setFeedbackModel] = useState(profile.aiFeedbackModel || "qwen-3b");

  // States for API Keys
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [anthropicApiKey, setAnthropicApiKey] = useState("");

  // Visual visibility states
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);

  // Has keys config status from profile
  const [hasGemini, setHasGemini] = useState(profile.hasGeminiKey || false);
  const [hasOpenai, setHasOpenai] = useState(profile.hasOpenaiKey || false);
  const [hasAnthropic, setHasAnthropic] = useState(profile.hasAnthropicKey || false);

  const getModels = (providerId: string) => {
    return PROVIDERS.find((p) => p.id === providerId)?.models || [];
  };

  const handleProviderChange = (type: "question" | "feedback", providerId: string) => {
    const defaultModel = getModels(providerId)[0]?.id || "";
    if (type === "question") {
      setQuestionProvider(providerId);
      setQuestionModel(defaultModel);
    } else {
      setFeedbackProvider(providerId);
      setFeedbackModel(defaultModel);
    }
  };

  const handleSave = async () => {
    setIsPending(true);

    const payload: Record<string, string> = {
      aiQuestionProvider: questionProvider,
      aiQuestionModel: questionModel,
      aiFeedbackProvider: feedbackProvider,
      aiFeedbackModel: feedbackModel,
    };

    // Only update keys if user typed something new, or if they explicitly want to clear it (not covered here, but we default to preserving unless changed)
    if (geminiApiKey.trim()) {
      payload.aiGeminiApiKey = geminiApiKey.trim();
    }
    if (openaiApiKey.trim()) {
      payload.aiOpenaiApiKey = openaiApiKey.trim();
    }
    if (anthropicApiKey.trim()) {
      payload.aiAnthropicApiKey = anthropicApiKey.trim();
    }

    const res = await updateAIPreferences(payload);

    setIsPending(false);

    if (res.success) {
      toast.success("AI Preferences updated successfully!");
      if (payload.aiGeminiApiKey) setHasGemini(true);
      if (payload.aiOpenaiApiKey) setHasOpenai(true);
      if (payload.aiAnthropicApiKey) setHasAnthropic(true);
      
      // Clear key inputs
      setGeminiApiKey("");
      setOpenaiApiKey("");
      setAnthropicApiKey("");
    } else {
      toast.error(res.message || "Failed to update preferences");
    }
  };

  const handleRemoveKey = async (provider: "gemini" | "openai" | "anthropic") => {
    const confirmRemove = window.confirm(`Are you sure you want to remove your stored ${provider.toUpperCase()} API key?`);
    if (!confirmRemove) return;

    setIsPending(true);
    const keyField = provider === "gemini"
      ? "aiGeminiApiKey"
      : provider === "openai"
      ? "aiOpenaiApiKey"
      : "aiAnthropicApiKey";

    const res = await updateAIPreferences({
      [keyField]: "" // Passing empty string to clear the key on backend
    });

    setIsPending(false);

    if (res.success) {
      toast.success(`Removed ${provider.toUpperCase()} API Key`);
      if (provider === "gemini") setHasGemini(false);
      if (provider === "openai") setHasOpenai(false);
      if (provider === "anthropic") setHasAnthropic(false);
    } else {
      toast.error(res.message || "Failed to remove API key");
    }
  };

  const needsApiKey = questionProvider !== "local-qwen" || feedbackProvider !== "local-qwen";

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] animate-fadeIn">
      {/* Configuration Column */}
      <div className="flex flex-col gap-6">
        {/* Section 1: Question Generation */}
        <section className="rounded-[28px] border border-foreground/[0.08] bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary-200/10 text-primary-100">
              <Brain className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Interview Question Model</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Choose the model that generates your interview questions.</p>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="question-provider" className="text-sm font-semibold text-foreground/90">AI Provider</label>
              <select
                id="question-provider"
                value={questionProvider}
                onChange={(e) => handleProviderChange("question", e.target.value)}
                className="w-full rounded-xl border border-foreground/[0.1] bg-foreground/[0.03] p-3 text-sm text-white focus:border-primary-100 focus:outline-none"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-dark-100 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="question-model" className="text-sm font-semibold text-foreground/90">Model Version</label>
              <select
                id="question-model"
                value={questionModel}
                onChange={(e) => setQuestionModel(e.target.value)}
                className="w-full rounded-xl border border-foreground/[0.1] bg-foreground/[0.03] p-3 text-sm text-white focus:border-primary-100 focus:outline-none"
              >
                {getModels(questionProvider).map((m) => (
                  <option key={m.id} value={m.id} className="bg-dark-100 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section 2: Feedback Generation */}
        <section className="rounded-[28px] border border-foreground/[0.08] bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <Cpu className="size-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Evaluation & Feedback Model</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Select the model that grades your interview transcript.</p>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="feedback-provider" className="text-sm font-semibold text-foreground/90">AI Provider</label>
              <select
                id="feedback-provider"
                value={feedbackProvider}
                onChange={(e) => handleProviderChange("feedback", e.target.value)}
                className="w-full rounded-xl border border-foreground/[0.1] bg-foreground/[0.03] p-3 text-sm text-white focus:border-primary-100 focus:outline-none"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-dark-100 text-white">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="feedback-model" className="text-sm font-semibold text-foreground/90">Model Version</label>
              <select
                id="feedback-model"
                value={feedbackModel}
                onChange={(e) => setFeedbackModel(e.target.value)}
                className="w-full rounded-xl border border-foreground/[0.1] bg-foreground/[0.03] p-3 text-sm text-white focus:border-primary-100 focus:outline-none"
              >
                {getModels(feedbackProvider).map((m) => (
                  <option key={m.id} value={m.id} className="bg-dark-100 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section 3: API Keys Configuration */}
        {needsApiKey && (
          <section className="rounded-[28px] border border-foreground/[0.08] bg-card p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Key className="size-5" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">API Keys</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Your credentials are encrypted using AES-256-GCM before database write.</p>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Gemini API Key */}
              {(questionProvider === "gemini" || feedbackProvider === "gemini") && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="gemini-key" className="text-sm font-semibold text-foreground/90">Google AI API Key</label>
                    {hasGemini && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="size-3" /> Stored
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKey("gemini")}
                          className="text-xs font-bold text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="gemini-key"
                      type={showGemini ? "text" : "password"}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder={hasGemini ? "••••••••••••••••••••••••••••••••" : "Enter Google AI Studio API Key..."}
                      className="w-full rounded-xl border border-foreground/[0.1] bg-foreground/[0.03] py-3 pl-3 pr-10 text-sm text-white focus:border-primary-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowGemini(!showGemini)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                    >
                      {showGemini ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* OpenAI API Key */}
              {(questionProvider === "openai" || feedbackProvider === "openai") && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="openai-key" className="text-sm font-semibold text-foreground/90">OpenAI API Key</label>
                    {hasOpenai && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="size-3" /> Stored
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKey("openai")}
                          className="text-xs font-bold text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="openai-key"
                      type={showOpenai ? "text" : "password"}
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder={hasOpenai ? "••••••••••••••••••••••••••••••••" : "Enter OpenAI API Key (sk-...)"}
                      className="w-full rounded-xl border border-foreground/[0.1] bg-foreground/[0.03] py-3 pl-3 pr-10 text-sm text-white focus:border-primary-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenai(!showOpenai)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                    >
                      {showOpenai ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Anthropic API Key */}
              {(questionProvider === "anthropic" || feedbackProvider === "anthropic") && (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="anthropic-key" className="text-sm font-semibold text-foreground/90">Anthropic API Key</label>
                    {hasAnthropic && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                          <CheckCircle2 className="size-3" /> Stored
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKey("anthropic")}
                          className="text-xs font-bold text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="anthropic-key"
                      type={showAnthropic ? "text" : "password"}
                      value={anthropicApiKey}
                      onChange={(e) => setAnthropicApiKey(e.target.value)}
                      placeholder={hasAnthropic ? "••••••••••••••••••••••••••••••••" : "Enter Anthropic Console API Key..."}
                      className="w-full rounded-xl border border-foreground/[0.1] bg-foreground/[0.03] py-3 pl-3 pr-10 text-sm text-white focus:border-primary-100 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnthropic(!showAnthropic)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                    >
                      {showAnthropic ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-200 py-3.5 text-sm font-extrabold text-dark-100 transition-all hover:bg-primary-200/90 active:scale-[0.98] disabled:opacity-50"
        >
          <Save className="size-4" />
          {isPending ? "Saving AI Preferences..." : "Save AI Preferences"}
        </button>
      </div>

      {/* Info Column */}
      <div className="flex flex-col gap-6">
        <section className="rounded-[28px] border border-foreground/[0.08] bg-card p-6 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-4">AI Service Options</h3>
          <div className="flex flex-col gap-6">
            {PROVIDERS.map((p) => (
              <div key={p.id} className="flex gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground/[0.04] text-primary-200 text-sm font-bold">
                  {p.name.charAt(0)}
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-primary-200/10 bg-primary-200/[0.02] p-6">
          <div className="flex gap-3 text-primary-200">
            <ShieldCheck className="size-5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Privacy & Encryption</h3>
              <p className="text-xs text-foreground/80 mt-1.5 leading-relaxed">
                Your API keys are encrypted immediately using AES-256-GCM. We never store raw keys in databases or log files. Keys are decrypted in memory only when calling models to generate questions or evaluate your responses.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-amber-500/10 bg-amber-500/[0.02] p-6">
          <div className="flex gap-3 text-amber-400">
            <AlertTriangle className="size-5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold">Important Notice</h3>
              <p className="text-xs text-foreground/80 mt-1.5 leading-relaxed">
                Make sure your API key has sufficient credit/quota before starting a session. If a model call fails due to invalid keys or limit issues, your phỏng vấn mock sẽ không thể sinh ra hoặc không thể chấm điểm.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
