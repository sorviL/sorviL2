import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.scss";
import { useAuth } from "../../contexts/auth.context";

export function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState<string | null>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement | null>(null);

    const isActive = (path: string) => location.pathname === path;

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            if (!profileMenuRef.current?.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsProfileMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    async function handleLogout() {
        setLogoutError(null);
        setIsLoggingOut(true);
        setIsProfileMenuOpen(false);

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
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    sorviL
                </Link>

                <ul className="navbar-menu">
                    <li>
                        <Link
                            to="/"
                            className={`navbar-link ${isActive("/") ? "active" : ""}`}
                        >
                            Inicial
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/bookshelf"
                            className={`navbar-link ${isActive("/bookshelf") ? "active" : ""}`}
                        >
                            Estante
                        </Link>
                    </li>
                    <li>
                        <button className="navbar-link navbar-button">
                            Sugestão IA
                        </button>
                    </li>
                </ul>

                <div className="navbar-profile-group" ref={profileMenuRef}>
                    <button
                        type="button"
                        className="navbar-profile"
                        aria-label="Abrir menu do perfil"
                        aria-expanded={isProfileMenuOpen}
                        aria-haspopup="menu"
                        onClick={() => setIsProfileMenuOpen((currentValue) => !currentValue)}
                    >
                        <img
                            src="/src/assets/images/navbar/no-photo.png"
                            alt={user?.nickname ? `Perfil de ${user.nickname}` : "Perfil do usuário"}
                            className="profile-image"
                        />
                    </button>

                    {isProfileMenuOpen && (
                        <div className="navbar-profile-dropdown" role="menu" aria-label="Menu do perfil">
                            <Link
                                to="/profile"
                                className="navbar-profile-dropdown-item"
                                role="menuitem"
                                onClick={() => setIsProfileMenuOpen(false)}
                            >
                                Meu perfil
                            </Link>

                            <button
                                type="button"
                                className="navbar-profile-dropdown-item navbar-profile-dropdown-logout"
                                role="menuitem"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? "Desconectando..." : "Desconectar"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {logoutError && <p className="navbar-error">{logoutError}</p>}
        </nav>
    );
}
