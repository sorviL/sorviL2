import "./LoginForm.scss";

type AuthLoginFormProps = {
    onShowSignIn: () => void;
};

export function AuthLoginForm({ onShowSignIn }: AuthLoginFormProps) {
    return (
        <form className="auth-login-form">
            <div className="auth-login-form-left">
                <h1 className="auth-login-form__title">[LOGIN!] Bem-vindo de volta</h1>
                <h2 className="auth-login-form__subtitle">Continue sua jogada literária no sorviL</h2>
            </div>
            <div className="auth-login-form-right">

                <div className="auth-login-form__continue_with">
                    <button className="auth-login-form__continue_with">Google</button>
                </div>

                <hr className="auth-login-form__hr" />
                
                <label htmlFor="txtEmail" className="auth-login-form__label">Email</label>
                <input 
                    type="email"
                    className="auth-login-form__input"
                    id="txtEmail"
                    name="txtEmail"
                    placeholder="usuario@sorvil.com"
                />

                <label htmlFor="txtPassword" className="auth-login-form__label">Senha</label>
                <input 
                    type="password"
                    className="auth-login-form__input"
                    id="txtPassword"
                    name="txtPassword"
                    placeholder="********"
                />

                <button type="submit" className="auth-login-form__submit">Entrar</button>

                <span className="auth-login-form__signup">Novo no sorviL? <button type="button" onClick={onShowSignIn}>Cadastre-se</button></span>
            </div>
        </form>
    );
}
