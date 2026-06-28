"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Brain, Cpu, Key, Eye, EyeOff, Save, CheckCircle2, Sparkles, BrainCircuit, Layers } from "lucide-react";
import { UserProfile } from "@/types";
import { updateAIPreferences } from "@/lib/actions/user.actions";
import SelectFilter from "@/components/filters/SelectFilter";

interface AIPreferencesTabProps {
  profile: UserProfile;
}

const PROVIDERS = [
  {
    id: "local-qwen",
    name: "Local Qwen (Free)",
    description: "Runs on our local GPU server. Free to use, no API key required.",
    icon: <Cpu className="size-5 text-primary-100" />,
    models: [
      { id: "qwen-3b", name: "Qwen 2.5 3B Instruct" }
    ]
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Requires your own Google AI API Key. Highly optimized and accurate.",
    icon: <Sparkles className="size-5 text-indigo-400" />,
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
    icon: <BrainCircuit className="size-5 text-emerald-400" />,
    models: [
      { id: "gpt-4o-mini", name: "GPT-4o Mini (Fast & Cheap)" },
      { id: "gpt-4o", name: "GPT-4o (Deep Evaluation)" }
    ]
  },
  {
    id: "anthropic",
    name: "Anthropic Claude",
    description: "Requires your own Anthropic API Key. Superior coding and reasoning ability.",
    icon: <Layers className="size-5 text-amber-400" />,
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
      [keyField]: "" // Passing empty string to clear key
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
            <SelectFilter
              label="AI Provider"
              value={questionProvider}
              options={PROVIDERS.map((p) => ({ value: p.id, label: p.name }))}
              onChange={(val) => handleProviderChange("question", val)}
              className="w-full"
            />

            <SelectFilter
              label="Model Version"
              value={questionModel}
              options={getModels(questionProvider).map((m) => ({ value: m.id, label: m.name }))}
              onChange={(val) => setQuestionModel(val)}
              className="w-full"
            />
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
            <SelectFilter
              label="AI Provider"
              value={feedbackProvider}
              options={PROVIDERS.map((p) => ({ value: p.id, label: p.name }))}
              onChange={(val) => handleProviderChange("feedback", val)}
              className="w-full"
            />

            <SelectFilter
              label="Model Version"
              value={feedbackModel}
              options={getModels(feedbackProvider).map((m) => ({ value: m.id, label: m.name }))}
              onChange={(val) => setFeedbackModel(val)}
              className="w-full"
            />
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
                <p className="text-xs text-muted-foreground mt-0.5">Keys are stored securely and used only for model calls.</p>
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
                      className="w-full rounded-xl border border-[var(--surface-border)] bg-foreground/[0.03] py-3 pl-3 pr-10 text-sm text-white focus:border-primary-100 focus:outline-none"
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
                      className="w-full rounded-xl border border-[var(--surface-border)] bg-foreground/[0.03] py-3 pl-3 pr-10 text-sm text-white focus:border-primary-100 focus:outline-none"
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
                      className="w-full rounded-xl border border-[var(--surface-border)] bg-foreground/[0.03] py-3 pl-3 pr-10 text-sm text-white focus:border-primary-100 focus:outline-none"
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
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground/[0.04]">
                  {p.icon}
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
