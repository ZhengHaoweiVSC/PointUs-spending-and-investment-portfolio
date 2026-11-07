import { AlertCircle } from "lucide-react";
import type { InputHTMLAttributes, ReactNode } from "react";

export function FieldError({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return <p id={id} className="h-error" role="alert"><AlertCircle aria-hidden="true" size={16} />{msg}</p>;
}

export function TextField({ id, label, error, hint, children, ...rest }: InputHTMLAttributes<HTMLInputElement> & { id: string; label: string; error?: string; hint?: ReactNode; children?: ReactNode }) {
  const desc = [hint ? `${id}-hint` : "", error ? `${id}-err` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="h-label">{label}</label>
      <input id={id} name={id} className="h-input" aria-invalid={error ? true : undefined} aria-describedby={desc} {...rest} />
      {hint && <div id={`${id}-hint`} className="h-hint">{hint}</div>}
      {children}
      <FieldError id={`${id}-err`} msg={error} />
    </div>
  );
}
