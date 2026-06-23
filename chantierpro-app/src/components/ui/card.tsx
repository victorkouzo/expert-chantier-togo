import { HTMLAttributes } from "react";

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-900 p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
