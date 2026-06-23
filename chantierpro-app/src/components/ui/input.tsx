import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-zinc-300">{label}</label>}
      <input
        ref={ref}
        className={`w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
          error ? "border-red-500" : "border-zinc-700"
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";
