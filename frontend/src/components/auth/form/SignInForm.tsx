import "./SignInForm.scss";

type AuthSignInFormProps = {
    onShowLogin: () => void;
};

export function AuthSignInForm({ onShowLogin }: AuthSignInFormProps) {
    return (
        <form className="auth-signin-form">
            <div className="auth-signin-form-left">
                <h1 className="auth-signin-form__title">[CADASTRO!] Bem-vindo ao sorviL</h1>
                <h2 className="auth-signin-form__subtitle">Comece sua jogada literária no sorviL</h2>
            </div>
            <div className="auth-signin-form-right">

                <div className="auth-signin-form__continue_with">
                    <button className="auth-signin-form__continue_with">Google</button>
                </div>

                <hr className="auth-signin-form__hr" />

                <label htmlFor="txtUsername" className="auth-signin-form__label">Nome de usuário</label>
                <input 
                    type="text"
                    className="auth-signin-form__input"
                    id="txtUsername"
                    name="txtUsername"
                />
                
                <label htmlFor="txtEmail" className="auth-signin-form__label">Email</label>
                <input 
                    type="email"
                    className="auth-signin-form__input"
                    id="txtEmail"
                    name="txtEmail"
                />

                <label htmlFor="txtPassword" className="auth-signin-form__label">Senha</label>
                <input 
                    type="password"
                    className="auth-signin-form__input"
                    id="txtPassword"
                    name="txtPassword"
                />

                <button type="submit" className="auth-signin-form__submit">Cadastrar</button>

                <span className="auth-signin-form__signup">Ja possui uma conta? <button type="button" onClick={onShowLogin}>Cadastre-se</button></span>
            </div>
        </form>
    );
}
