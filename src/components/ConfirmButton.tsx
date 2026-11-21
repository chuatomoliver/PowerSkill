"use client";
export function ConfirmButton({ message, children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { message: string }) {
  return <button {...rest} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>{children}</button>;
}
