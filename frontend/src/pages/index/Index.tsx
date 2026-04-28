import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/navbar/Index";
import "../../assets/css/index/index.scss";
import { useAuth } from "../../contexts/auth.context";

export function IndexPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState<string | null>(null);

    async function handleLogout() {
        setLogoutError(null);
        setIsLoggingOut(true);

        try {
            await logout();
            navigate("/auth");
        } catch {
            setLogoutError("Nao foi possivel sair agora. Tente novamente.");
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <div className="index-page">
            <Navbar />
            <div className="index-page-content">
                <h1 className="index-page-title">Minha pagina</h1>
                {user && <p className="index-page-greeting">Ola, {user.nickname}</p>}
                <button className="index-page-logout" onClick={handleLogout} disabled={isLoggingOut}>
                    {isLoggingOut ? "Saindo..." : "Sair"}
                </button>
                {logoutError && <p className="index-page-error">{logoutError}</p>}
            </div>
        </div>
    );
}
