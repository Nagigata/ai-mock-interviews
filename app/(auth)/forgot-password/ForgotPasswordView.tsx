"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Mail, KeyRound, ShieldCheck } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const ForgotPasswordView = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  // Step 1: Send OTP
  const handleSendCode = async () => {
    if (!email) return toast.error("Please enter your email.");
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(data, "Failed to send code."));
      toast.success("Verification code sent to your email!");
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to send code."));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyCode = async () => {
    const codeStr = code.join("");
    if (codeStr.length !== 6) return toast.error("Please enter the 6-digit code.");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeStr }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(data, "Invalid code."));
      setResetToken(data.data?.resetToken || data.resetToken);
      toast.success("Code verified! Set your new password.");
      setStep(3);
    } catch (err) {
      toast.error(getErrorMessage(err, "Invalid code."));
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async () => {
    if (newPassword.length < 6) return toast.error("Password must be at least 6 characters.");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match.");
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(getErrorMessage(data, "Failed to reset password."));
      toast.success("Password reset successfully! Please sign in.");
      router.push("/sign-in");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reset password."));
    } finally {
      setIsLoading(false);
    }
  };

  // OTP input handlers
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const stepIcons = [
    <Mail key="mail" className="size-8 text-primary-200" />,
    <ShieldCheck key="shield" className="size-8 text-primary-200" />,
    <KeyRound key="key" className="size-8 text-primary-200" />,
  ];

  const stepTitles = ["Enter your email", "Verify your code", "Set new password"];
  const stepDescriptions = [
    "We'll send a 6-digit verification code to your email.",
    "Enter the code we sent to your email address.",
    "Choose a strong password for your account.",
  ];

  return (
    <div className="flex justify-center items-center h-full">
      <div className="card-border lg:min-w-120">
        <div className="flex flex-col gap-6 card py-14 px-10">
          {/* Logo */}
          <div className="flex flex-row gap-2 justify-center">
            <Image src="/logo.svg" alt="logo" height={32} width={38} />
            <h2 className="text-primary-100">PrepWise</h2>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`size-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s
                      ? "bg-primary-200 text-dark-100"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-10 h-0.5 transition-all ${
                      step > s ? "bg-primary-200" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Icon + Title */}
          <div className="flex flex-col items-center gap-3">
            <div className="size-16 rounded-2xl bg-muted/50 border border-foreground/5 flex items-center justify-center">
              {stepIcons[step - 1]}
            </div>
            <h3 className="text-lg font-bold text-white">{stepTitles[step - 1]}</h3>
            <p className="text-sm text-muted-foreground text-center">{stepDescriptions[step - 1]}</p>
          </div>

          {/* Step 1: Email */}
          {step === 1 && (
            <div className="flex flex-col gap-4 mt-2">
              <input
                type="email"
                aria-label="Email address"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                className="w-full bg-card border border-border rounded-xl py-3.5 px-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary-200/50 text-sm"
              />
              <Button
                className="btn w-full"
                onClick={handleSendCode}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </div>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <div className="flex flex-col gap-4 mt-2">
              <p className="text-xs text-muted-foreground text-center">
                Code sent to <span className="text-primary-200 font-semibold">{email}</span>
              </p>
              <div className="flex justify-center gap-3" onPaste={handleCodePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`Digit ${i + 1} of verification code`}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-card border border-border rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-200/50 focus:border-primary-200 transition-all"
                  />
                ))}
              </div>
              <Button
                className="btn w-full"
                onClick={handleVerifyCode}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-muted-foreground"
                onClick={handleSendCode}
                disabled={isLoading || resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Didn't receive the code? Resend"}
              </button>
            </div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <div className="flex flex-col gap-4 mt-2">
              <input
                type="password"
                aria-label="New password"
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-card border border-border rounded-xl py-3.5 px-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary-200/50 text-sm"
              />
              <input
                type="password"
                aria-label="Confirm new password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                className="w-full bg-card border border-border rounded-xl py-3.5 px-4 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary-200/50 text-sm"
              />
              <Button
                className="btn w-full"
                onClick={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          )}

          {/* Back to Sign In */}
          <Link
            href="/sign-in"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary-200 transition-colors mt-2"
          >
            <ArrowLeft className="size-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordView;
