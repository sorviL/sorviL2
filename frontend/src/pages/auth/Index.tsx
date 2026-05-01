import { useState } from "react";
import "../../assets/css/auth/index.scss";
import { AuthLoginForm } from "../../components/auth/form/LoginForm";
import { AuthSignInForm } from "../../components/auth/form/SignInForm";
import { AuthHero } from "../../components/auth/hero/AuthHero";
import { AuthCard } from "../../components/auth/card/AuthCard";

export function AuthPage() {
  const [activeForm, setActiveForm] = useState<"login" | "signin">("login");

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-container-left">
          <AuthHero
            title="sorviL"
            description="Compartilhe suas opiniões sobre livros, descubra novas leituras e conecte-se com outros leitores!"
          />
        </div>

        <div className="auth-container-right">
          <AuthCard
            title="Bem-vindo(a),"
            subtitle="realize a autenticação para acessar o sorviL e se juntar a comunidade de leitores!"
          >
            {activeForm === "login" ? (
              <AuthLoginForm onShowSignIn={() => setActiveForm("signin")} />
            ) : (
              <AuthSignInForm onShowLogin={() => setActiveForm("login")} />
            )}
          </AuthCard>
        </div>
      </div>
    </div>
  );
}

