import type { ReactNode } from "react";
import "./AuthCard.scss";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="auth-card">
      <div className="auth-card-header">
        <h2 className="auth-card-title">{title}</h2>
        <p className="auth-card-subtitle">{subtitle}</p>
      </div>
      <div className="auth-card-body">{children}</div>
    </div>
  );
}
