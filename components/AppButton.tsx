"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type AppButtonVariant = "primary" | "outline" | "destructive";
type AppButtonSize = "sm" | "md" | "lg";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  icon?: ReactNode;
}

const variantClass: Record<AppButtonVariant, string> = {
  primary: "bg-primary-200 text-dark-100 hover:bg-primary-200/80",
  outline:
    "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
  destructive: "bg-red-500/90 text-white hover:bg-red-500",
};

const sizeClass: Record<AppButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm",
};

const AppButton = ({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  type = "button",
  className,
  children,
  ...rest
}: AppButtonProps) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${variantClass[variant]} ${sizeClass[size]} ${className ?? ""}`}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </button>
  );
};

export default AppButton;
