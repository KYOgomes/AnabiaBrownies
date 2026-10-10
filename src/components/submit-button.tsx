"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  className = "btn-primary",
  pendingText,
  confirmMessage,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { pendingText?: string; confirmMessage?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={confirmMessage ? (e) => !window.confirm(confirmMessage) && e.preventDefault() : undefined}
      {...props}
    >
      {pending && pendingText ? pendingText : children}
    </button>
  );
}
