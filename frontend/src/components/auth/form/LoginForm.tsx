import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginForm.scss";
import { loginUser } from "../../../services/auth.service";

type AuthLoginFormProps = {
    onShowSignIn: () => void;
};

export function AuthLoginForm({ onShowSignIn }: AuthLoginFormProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await loginUser({ email, password });

            if (!result.success) {
                setError(result.error);
                return;
            }

            navigate("/index");
        } catch {
            setError("Nao foi possivel concluir o login. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form className="auth-login-form" onSubmit={handleSubmit}>
            <div className="auth-login-form-left">
                <h1 className="auth-login-form-title">[LOGIN!] Bem-vindo de volta</h1>
                <h2 className="auth-login-form-subtitle">Continue sua jogada literária no sorviL</h2>
            </div>
            <div className="auth-login-form-right">

                <div className="auth-login-form-continue-with">
                    <button type="button" className="auth-login-form-continue-with" disabled={isLoading}>Google</button>
                </div>

                <hr className="auth-login-form-hr" />

                {error && <div style={{ color: "red", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}
                
                <label htmlFor="txtEmail" className="auth-login-form-label">Email</label>
                <input 
                    type="email"
                    className="auth-login-form-input"
                    id="txtEmail"
                    name="txtEmail"
                    placeholder="usuario@sorvil.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />

                <label htmlFor="txtPassword" className="auth-login-form-label">Senha</label>
                <input 
                    type="password"
                    className="auth-login-form-input"
                    id="txtPassword"
                    name="txtPassword"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />

                <button type="submit" className="auth-login-form-submit" disabled={isLoading}>
                    {isLoading ? "Entrando..." : "Entrar"}
                </button>

                <span className="auth-login-form-signup">Novo no sorviL? <button type="button" onClick={onShowSignIn} disabled={isLoading}>Cadastre-se</button></span>
            </div>
        </form>
    );
}
