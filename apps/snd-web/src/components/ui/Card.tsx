import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200/90 bg-white shadow-card transition-shadow duration-300 ease-out hover:shadow-lift ${padding ? "p-6" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
