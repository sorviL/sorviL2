import "./LoginForm.scss";

type AuthLoginFormProps = {
    onShowSignIn: () => void;
};

export function AuthLoginForm({ onShowSignIn }: AuthLoginFormProps) {
    return (
        <form className="auth-login-form">
            <div className="auth-login-form-left">
                <h1 className="auth-login-form-title">[LOGIN!] Bem-vindo de volta</h1>
                <h2 className="auth-login-form-subtitle">Continue sua jogada literária no sorviL</h2>
            </div>
            <div className="auth-login-form-right">

                <div className="auth-login-form-continue-with">
                    <button className="auth-login-form-continue-with">Google</button>
                </div>

                <hr className="auth-login-form-hr" />
                
                <label htmlFor="txtEmail" className="auth-login-form-label">Email</label>
                <input 
                    type="email"
                    className="auth-login-form-input"
                    id="txtEmail"
                    name="txtEmail"
                    placeholder="usuario@sorvil.com"
                />

                <label htmlFor="txtPassword" className="auth-login-form-label">Senha</label>
                <input 
                    type="password"
                    className="auth-login-form-input"
                    id="txtPassword"
                    name="txtPassword"
                    placeholder="********"
                />

                <button type="submit" className="auth-login-form-submit">Entrar</button>

                <span className="auth-login-form-signup">Novo no sorviL? <button type="button" onClick={onShowSignIn}>Cadastre-se</button></span>
            </div>
        </form>
    );
}
