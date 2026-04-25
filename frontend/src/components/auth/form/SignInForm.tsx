import "./SignInForm.scss";

type AuthSignInFormProps = {
    onShowLogin: () => void;
};

export function AuthSignInForm({ onShowLogin }: AuthSignInFormProps) {
    return (
        <form className="auth-signin-form">
            <div className="auth-signin-form-left">
                <h1 className="auth-signin-form-title">[CADASTRO!] Bem-vindo ao sorviL</h1>
                <h2 className="auth-signin-form-subtitle">Comece sua jogada literária no sorviL</h2>
            </div>
            <div className="auth-signin-form-right">

                <div className="auth-signin-form-continue-with">
                    <button className="auth-signin-form-continue-with">Google</button>
                </div>

                <hr className="auth-signin-form-hr" />

                <label htmlFor="txtUsername" className="auth-signin-form-label">Nome de usuário</label>
                <input 
                    type="text"
                    className="auth-signin-form-input"
                    id="txtUsername"
                    name="txtUsername"
                />
                
                <label htmlFor="txtEmail" className="auth-signin-form-label">Email</label>
                <input 
                    type="email"
                    className="auth-signin-form-input"
                    id="txtEmail"
                    name="txtEmail"
                />

                <label htmlFor="txtPassword" className="auth-signin-form-label">Senha</label>
                <input 
                    type="password"
                    className="auth-signin-form-input"
                    id="txtPassword"
                    name="txtPassword"
                />

                <button type="submit" className="auth-signin-form-submit">Cadastrar</button>

                <span className="auth-signin-form-signup">Ja possui uma conta? <button type="button" onClick={onShowLogin}>Cadastre-se</button></span>
            </div>
        </form>
    );
}
