"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
  type SelectHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils/cn";

const fieldBase =
  "w-full bg-white border-[1.5px] rounded-md px-[14px] py-3 font-body text-[0.9rem] " +
  "text-text transition placeholder:text-muted-2 focus:outline-none focus:ring-4";
const fieldOk = "border-border focus:border-primary focus:ring-[rgba(76,124,89,0.12)]";
const fieldError = "border-error focus:border-error focus:ring-[rgba(185,28,28,0.12)]";

const labelCls =
  "block font-heading text-[0.72rem] font-semibold tracking-[0.04em] uppercase text-text mb-2";

function fieldClass(error?: string) {
  return cn(fieldBase, error ? fieldError : fieldOk);
}

type Shell = {
  id: string;
  label?: ReactNode;
  error?: string;
  hint?: string;
  children: ReactNode;
};

function FieldShell({ id, label, error, hint, children }: Shell) {
  return (
    <div>
      {label ? (
        <label htmlFor={id} className={labelCls}>
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 font-body text-[0.78rem] text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 font-body text-[0.78rem] text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  error?: string;
  hint?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id: idProp, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(fieldClass(error), className)}
        {...rest}
      />
    </FieldShell>
  );
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
  error?: string;
  hint?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id: idProp, rows = 4, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(fieldClass(error), "resize-y", className)}
        {...rest}
      />
    </FieldShell>
  );
});

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  error?: string;
  hint?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, className, id: idProp, children, ...rest },
  ref,
) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <select
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(fieldClass(error), "appearance-none bg-white", className)}
        {...rest}
      >
        {children}
      </select>
    </FieldShell>
  );
});
