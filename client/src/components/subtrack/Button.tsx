import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  kind?: "primary" | "light" | "plain" | "danger";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function Button({
  children,
  onClick,
  kind = "primary",
  className = "",
  type = "button",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`btn btn-${kind} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
