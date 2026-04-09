import type { ButtonHTMLAttributes } from "react";

const variants = {
  primary:
    "bg-primary text-white shadow-sm hover:bg-primary-hover active:translate-y-px disabled:opacity-45 disabled:pointer-events-none",
  secondary:
    "bg-white text-navy border border-slate-200 hover:border-primary hover:text-primary active:translate-y-px",
  ghost: "text-ink-secondary hover:bg-slate-100 active:bg-slate-200",
} as const;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
};

export function Button({ variant = "primary", className = "", ...p }: Props) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${variants[variant]} ${className}`}
      {...p}
    />
  );
}
