import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignInForm.scss";
import { registerUser } from "../../../services/auth.service";

type AuthSignInFormProps = {
    onShowLogin: () => void;
};

export function AuthSignInForm({ onShowLogin }: AuthSignInFormProps) {
    const [nickname, setNickname] = useState("");
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
            const result = await registerUser({ nickname, email, password });

            if (!result.success) {
                setError(result.error);
                return;
            }

            navigate("/index");
        } catch {
            setError("Nao foi possivel concluir o cadastro. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form className="auth-signin-form" onSubmit={handleSubmit}>
            <div className="auth-signin-form-left">
                <h1 className="auth-signin-form-title">[CADASTRO!] Bem-vindo ao sorviL</h1>
                <h2 className="auth-signin-form-subtitle">Comece sua jogada literária no sorviL</h2>
            </div>
            <div className="auth-signin-form-right">

                <div className="auth-signin-form-continue-with">
                    <button type="button" className="auth-signin-form-continue-with" disabled={isLoading}>Google</button>
                </div>

                <hr className="auth-signin-form-hr" />

                {error && <div style={{ color: "red", marginBottom: "16px", fontSize: "14px" }}>{error}</div>}

                <label htmlFor="txtUsername" className="auth-signin-form-label">Nome de usuário</label>
                <input 
                    type="text"
                    className="auth-signin-form-input"
                    id="txtUsername"
                    name="txtUsername"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    required
                    disabled={isLoading}
                />
                
                <label htmlFor="txtEmail" className="auth-signin-form-label">Email</label>
                <input 
                    type="email"
                    className="auth-signin-form-input"
                    id="txtEmail"
                    name="txtEmail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />

                <label htmlFor="txtPassword" className="auth-signin-form-label">Senha</label>
                <input 
                    type="password"
                    className="auth-signin-form-input"
                    id="txtPassword"
                    name="txtPassword"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />

                <button type="submit" className="auth-signin-form-submit" disabled={isLoading}>
                    {isLoading ? "Cadastrando..." : "Cadastrar"}
                </button>

                <span className="auth-signin-form-signup">Ja possui uma conta? <button type="button" onClick={onShowLogin} disabled={isLoading}>Entrar</button></span>
            </div>
        </form>
    );
}
