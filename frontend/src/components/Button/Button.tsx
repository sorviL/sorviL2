import type { AnchorHTMLAttributes } from "react";
import "./Button.css";

interface ButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: "primary" | "outline";
}

export function Button({
  variant = "primary",
  children,
  ...rest
}: ButtonProps) {
  return (
    <a className={`btn btn--${variant}`} {...rest}>
      {children}
    </a>
  );
}
