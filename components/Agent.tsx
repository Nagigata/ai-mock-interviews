"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer_en, interviewer_vi } from "@/constants";
import { createInterviewAttempt, startFeedbackGeneration } from "@/lib/actions/general.action";
import UserAvatar from "./UserAvatar";
import { AlertTriangle, ChevronDown, Mic, Phone, PhoneOff, Settings, Volume2, X } from "lucide-react";
import { AgentProps } from "@/types";


enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface Message {
  type: string;
  transcriptType?: string;
  role: "user" | "assistant";
  transcript: string;
}


const Agent = ({
  userName,
  userId,
  userAvatarUrl,
  interviewId,
  initialAttemptId,
  type,
  questions,
  language,
  dictionary: t,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(initialAttemptId ?? null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const feedbackRequestedRef = useRef(false);
  const lastMessage = messages[messages.length - 1]?.content || "";

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      console.log("speech start");
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      console.log("speech end");
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      const message = error?.message || "";

      if (
        message.includes("Meeting has ended") ||
        message.includes("ejection")
      ) {
        return;
      }

      console.error("Vapi error:", error);
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      vapi.stop();
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");
      if (feedbackRequestedRef.current) {
        return;
      }

      if (!attemptId) {
        console.log("Missing interview attempt");
        router.push("/");
        return;
      }

      feedbackRequestedRef.current = true;
      setIsGenerating(true);
      const { success, message } = await startFeedbackGeneration({
        attemptId,
        transcript: messages,
      });

      if (success) {
        router.push("/interview");
      } else {
        toast.warning("Feedback was not generated", {
          description:
            message ||
            "This interview was too short. Please answer at least 2 questions before ending.",
        });
        setIsGenerating(false);
        router.push("/interview");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        toast.info("Your interview is being generated", {
          description:
            "You can keep using the app. We'll notify you when it is ready.",
        });
        router.push("/interview");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [attemptId, messages, callStatus, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);
    feedbackRequestedRef.current = false;

    if (type === "generate") {
      const assistantId = selectedLanguage === "vi"
        ? process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_VI!
        : process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID_EN!;

      await vapi.start(assistantId, {
        variableValues: {
          username: userName,
          userid: userId,
          language: selectedLanguage,
        },
      });
    } else {
      const nextAttempt = await createInterviewAttempt(interviewId!);
      if (!nextAttempt) {
        setCallStatus(CallStatus.INACTIVE);
        return;
      }

      setAttemptId(nextAttempt.id);
      const activeInterviewer = language === "vi" ? interviewer_vi : interviewer_en;

      let formattedQuestions = "";
      if (questions) {
        formattedQuestions = questions
          .map((question) => `- ${question}`)
          .join("\n");
      }

      await vapi.start(activeInterviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
      });
    }
  };

  const handleDisconnect = () => {
    if (type === "interview" && callStatus === CallStatus.ACTIVE) {
      setIsEndConfirmOpen(true);
      return;
    }

    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  const confirmEndInterview = () => {
    setIsEndConfirmOpen(false);
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <div className="w-full flex justify-center mt-6 px-6 ">
      {type === "generate" ? (
        <div className="w-full max-w-lg bg-dark-200/50 backdrop-blur-sm border border-dark-300 rounded-3xl p-8 flex flex-col items-center gap-6 shadow-2xl">
          <div className="bg-primary-200/10 p-4 rounded-full border border-primary-200/30">
            <Settings className="size-10 text-primary-200" />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">{t?.agent?.aiInterviewer || "AI Interviewer Setup"}</h2>
            <p className="text-light-100 text-sm">
              {t?.agent?.setupInstruction || "Please select your preferred language before we proceed."}
            </p>
          </div>

          <div className="w-full bg-dark-300/50 rounded-xl p-4 flex justify-between items-center border border-dark-300 gap-4">
            <span className="font-semibold text-light-100 flex items-center gap-2">
              <Mic className="size-5" />
              {t?.agent?.selectLanguage || "Select Language"}
            </span>
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                disabled={callStatus !== "INACTIVE"}
                className="bg-dark-100 border border-primary-200/50 rounded-lg px-4 py-2 flex items-center gap-3 text-white hover:border-primary-200 transition-all cursor-pointer disabled:opacity-50 min-w-[160px] justify-between shadow-md"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={selectedLanguage === "vi" ? "https://flagcdn.com/vn.svg" : "https://flagcdn.com/gb.svg"}
                    alt={selectedLanguage}
                    width={24}
                    height={16}
                  />
                  <span className="font-medium">
                    {selectedLanguage === "vi" ? "Tiếng Việt" : "English"}
                  </span>
                </div>
                <ChevronDown className={`size-4 transition-transform ${isLangMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isLangMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-full bg-dark-100 border border-primary-200/30 rounded-xl shadow-2xl overflow-hidden z-100 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => { setSelectedLanguage("en"); setIsLangMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-300 transition-colors ${selectedLanguage === "en" ? "bg-dark-300 text-primary-200 font-bold" : "text-white"}`}
                  >
                    <Image src="https://flagcdn.com/gb.svg" alt="English" width={24} height={16} />
                    <span>English</span>
                  </button>
                  <button
                    onClick={() => { setSelectedLanguage("vi"); setIsLangMenuOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-dark-300 transition-colors ${selectedLanguage === "vi" ? "bg-dark-300 text-primary-200 font-bold" : "text-white"}`}
                  >
                    <Image src="https://flagcdn.com/vn.svg" alt="Tiếng Việt" width={24} height={14} />
                    <span>Tiếng Việt</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {callStatus !== "ACTIVE" ? (
            <button
              className="w-full mt-4 bg-primary-200 text-dark-100 font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-primary-200/80 transition-all disabled:opacity-50 relative overflow-hidden"
              onClick={handleCall}
              disabled={callStatus === "CONNECTING"}
            >
              {callStatus === "CONNECTING" && <span className="absolute inset-0 bg-white/20 animate-pulse" />}
              <Phone className="size-5" />
              {callStatus === "CONNECTING" ? "Connecting..." : (t?.agent?.callBtn || "Begin Setup")}
            </button>
          ) : (
            <button
              className="w-full mt-4 bg-destructive-100 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-destructive-200 transition-all shadow-lg shadow-destructive-100/20"
              onClick={handleDisconnect}
            >
              <PhoneOff className="size-5" />
              {t?.agent?.endBtn || "End Call"}
            </button>
          )}

          {isSpeaking && (
            <div className="flex items-center gap-2 text-primary-200 mt-2 animate-pulse">
              <Volume2 className="size-4" />
              <span className="text-sm font-medium">Assistant is speaking...</span>
            </div>
          )}

          {messages.length > 0 && (
            <div className="border border-dark-300 bg-dark-200/50 p-4 rounded-xl w-full mx-auto shadow-inner min-h-[80px] flex items-center justify-center mt-2">
              <p
                key={lastMessage}
                className={cn(
                  "transition-opacity duration-500 opacity-0 text-md text-center text-white/90 font-medium leading-relaxed",
                  "animate-fadeIn opacity-100",
                )}
              >
                {lastMessage}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-6xl flex flex-col gap-10">
          <div className="flex sm:flex-row flex-col gap-6 lg:gap-10 items-stretch justify-between w-full relative">
            {/* Connection Status line between cards (visual only on large screens) */}
            <div className="hidden sm:block absolute top-1/2 left-1/4 right-1/4 h-1 border-t-2 border-dashed border-dark-300 z-0"></div>

            {/* AI Interviewer Card */}
            <div className="flex flex-col gap-6 justify-center items-center p-10 bg-dark-200 border border-primary-200/20 rounded-3xl shadow-2xl flex-1 min-h-[450px] z-10 relative">
              <div className="relative p-2 rounded-full border-2 border-dashed border-primary-200/50">
                <div className={cn("absolute inset-[-10px] rounded-full bg-primary-200/20", isSpeaking ? "animate-ping opacity-75" : "opacity-0")}></div>
                <div className="rounded-full w-[140px] h-[140px] relative z-10 bg-[#eef0ff] flex items-center justify-center shadow-inner border border-white">
                  <Image
                    src="/ai-avatar.png"
                    alt="AI Logo"
                    width={80}
                    height={80}
                    className="opacity-90"
                  />
                </div>
              </div>
              <h3 className="mt-4 text-primary-100 truncate w-full text-center px-4" title={t?.agent?.aiInterviewer || "AI Interviewer"}>
                {t?.agent?.aiInterviewer || "AI Interviewer"}
              </h3>
              <div className="mt-2 flex items-center gap-2 bg-dark-300 py-1.5 px-3 rounded-full border border-dark-100">
                <div className={cn("size-2.5 rounded-full shadow-[0_0_8px_rgba(73,222,80,0.8)]", isSpeaking ? "bg-success-100" : "bg-light-600")}></div>
                <span className="text-xs text-light-100 font-bold tracking-widest uppercase">
                  {isSpeaking ? "Speaking" : "Listening"}
                </span>
              </div>
            </div>

            {/* User Profile Card */}
            <div className="flex flex-col gap-6 justify-center items-center p-10 bg-dark-200 border border-dark-300 rounded-3xl shadow-2xl flex-1 min-h-[450px] z-10 relative">
              <div className="relative p-2 rounded-full border-2 border-dashed border-light-600">
                <UserAvatar
                  name={userName || "User"}
                  avatarUrl={userAvatarUrl}
                  size="xl"
                  className="border border-light-400"
                />
              </div>
              <h3 className="mt-4 truncate w-full text-center px-4" title={userName}>
                {userName}
              </h3>
              <div className="mt-2 flex items-center gap-2 bg-dark-300 py-1.5 px-3 rounded-full border border-dark-100">
                <div className="size-2.5 rounded-full bg-success-100 shadow-[0_0_8px_rgba(73,222,80,0.8)] flex items-center justify-center">
                  {!isSpeaking && callStatus === "ACTIVE" && <span className="size-full animate-ping rounded-full bg-success-100 opacity-75"></span>}
                </div>
                <span className="text-xs text-light-100 font-bold tracking-widest uppercase">
                  Ready
                </span>
              </div>
            </div>
          </div>

          {messages.length > 0 && (
            <div className="border border-dark-300 bg-dark-200/50 p-6 rounded-2xl w-full mx-auto shadow-inner min-h-[100px] flex items-center justify-center">
              <p
                key={lastMessage}
                className={cn(
                  "transition-opacity duration-500 opacity-0 text-xl text-center text-white/90 font-medium leading-relaxed",
                  "animate-fadeIn opacity-100",
                )}
              >
                {lastMessage}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center mt-4">
            {callStatus !== "ACTIVE" ? (
              <button
                className="bg-primary-200 text-dark-100 font-bold py-4 px-12 rounded-full flex items-center justify-center gap-3 hover:bg-primary-200/80 transition-all disabled:opacity-50 relative overflow-hidden"
                onClick={handleCall}
                disabled={callStatus === "CONNECTING" || isGenerating}
              >
                {(callStatus === "CONNECTING" || isGenerating) && <span className="absolute inset-0 bg-white/20 animate-pulse" />}
                <Phone className={cn("size-5", isGenerating && "animate-spin")} />
                {isGenerating
                  ? (language === "vi" ? "Đang tạo đánh giá..." : "Generating Feedback...")
                  : callStatus === "CONNECTING"
                    ? "Connecting..."
                    : (t?.agent?.callBtn || "Start Interview")
                }
              </button>
            ) : (
              <button
                className="bg-destructive-100 text-white font-bold py-4 px-12 rounded-full flex items-center justify-center gap-3 hover:bg-destructive-200 transition-all shadow-lg shadow-destructive-100/20"
                onClick={handleDisconnect}
              >
                <PhoneOff className="size-5" />
                {t?.agent?.endBtn || "End Interview"}
              </button>
            )}
          </div>
        </div>
      )}

      {isEndConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#151922] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEndConfirmOpen(false)}
              className="absolute right-4 top-4 text-light-400 transition-colors hover:text-white"
              aria-label="Close end interview confirmation"
            >
              <X className="size-5" />
            </button>

            <div className="mb-5 flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10 text-amber-300">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  End this interview?
                </h3>
                <p className="mt-2 text-sm leading-6 text-light-100/75">
                  Feedback will only be generated if you answered at least 2
                  questions with enough detail. If the interview is too short,
                  we will save the attempt as too short and return you to the
                  interview page.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-light-100">
              Make sure you are ready to finish before ending the call.
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setIsEndConfirmOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-light-100 transition hover:bg-white/[0.08]"
              >
                Continue Interview
              </button>
              <button
                onClick={confirmEndInterview}
                className="rounded-2xl bg-destructive-100 px-5 py-3 text-sm font-bold text-white transition hover:bg-destructive-200"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agent;
