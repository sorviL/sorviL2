import { useState } from "react";
import "../../assets/css/auth/index.scss";
import { AuthLoginForm } from "../../components/auth/form/LoginForm";
import { AuthSignInForm } from "../../components/auth/form/SignInForm";

export function AuthPage() {
    const [activeForm, setActiveForm] = useState<"login" | "signin">("login");

    return (
        <div className="auth-page">
            {activeForm === "login" ? (
                <AuthLoginForm onShowSignIn={() => setActiveForm("signin")} />
            ) : (
                <AuthSignInForm onShowLogin={() => setActiveForm("login")} />
            )}
        </div>
    );
}
