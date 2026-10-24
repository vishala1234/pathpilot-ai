import { AlertCircleIcon } from "lucide-react";

import type { FieldErrors } from "@/lib/onboarding";

export function StepIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1.5">
      <h2 className="font-display text-2xl leading-tight tracking-tight md:text-3xl">
        {title}
      </h2>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

/** One accessible summary so keyboard/screen-reader users hear what blocked them. */
export function StepErrorSummary({
  errors,
  stepId,
}: {
  errors: FieldErrors;
  stepId: string;
}) {
  const messages = [...new Set(Object.values(errors))];
  if (messages.length === 0) return null;

  return (
    <div
      id={`${stepId}-errors`}
      role="alert"
      className="flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3.5 py-3 text-sm text-destructive"
    >
      <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-medium">Please fix the highlighted fields.</p>
        <ul className="mt-1 list-inside list-disc text-xs">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function FieldHint({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <p id={id} className="text-xs leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}
