import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/auth.context";
import { useAlert } from "../alert/useAlert";
import { useNavbarSearch } from "./useNavbarSearch";
import { NavbarSearchDropdown } from "./NavbarSearchDropdown";
import "./Navbar.scss";

export function Navbar() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { showAlert } = useAlert();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement | null>(null);
    const searchMenuRef = useRef<HTMLDivElement | null>(null);

    const {
        searchQuery,
        searchResults,
        isSearching,
        searchError,
        isSearchOpen,
        setSearchQuery,
        setIsSearchOpen,
        handleBookSelect
    } = useNavbarSearch();

    const isActive = (path: string) => location.pathname === path;
    const hasSearchText = searchQuery.trim().length > 0;

    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            const target = event.target as Node;

            if (!profileMenuRef.current?.contains(target)) {
                setIsProfileMenuOpen(false);
            }

            if (!searchMenuRef.current?.contains(target)) {
                setIsSearchOpen(false);
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsProfileMenuOpen(false);
                setIsSearchOpen(false);
            }
        }

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [setIsSearchOpen]);

    async function handleLogout() {
        setIsLoggingOut(true);
        setIsProfileMenuOpen(false);

        try {
            await logout();
            showAlert("success", "Logout realizado com sucesso!");
        } catch {
            showAlert("danger", "Não foi possível sair agora. Tente novamente.");
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand-group">
                    <Link to="/" className="navbar-logo">
                        <img
                            src="/src/assets/images/logo-sorvil.png"
                            alt="sorviL"
                            className="navbar-logo-image"
                        />
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
                            <Link
                                to="/chat"
                                className={`navbar-link ${isActive("/suggestion") ? "active" : ""}`}
                            >
                                Sugestão IA
                            </Link>
                        </li>
                    </ul>
                </div>

                <div className="navbar-search-group" ref={searchMenuRef}>
                    <label className="navbar-search-field" htmlFor="navbar-book-search">
                        <span className="material-icons navbar-search-icon" aria-hidden="true">
                            search
                        </span>
                        <input
                            id="navbar-book-search"
                            type="search"
                            className="navbar-search-input"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            onFocus={() => {
                                if (hasSearchText) {
                                    setIsSearchOpen(true);
                                }
                            }}
                            placeholder="Buscar livros"
                            aria-label="Buscar livros"
                            autoComplete="off"
                            spellCheck={false}
                            role="combobox"
                            aria-expanded={isSearchOpen && hasSearchText}
                            aria-autocomplete="list"
                        />
                    </label>

                    {hasSearchText && (
                        <NavbarSearchDropdown
                            isVisible={isSearchOpen}
                            isSearching={isSearching}
                            searchError={searchError}
                            searchResults={searchResults}
                            onBookSelect={handleBookSelect}
                        />
                    )}
                </div>

                <div className="navbar-profile-group" ref={profileMenuRef}>
                    {user?.nickname && <span className="navbar-user-name">{user.nickname}</span>}
                    <button
                        type="button"
                        className="navbar-profile"
                        aria-label="Abrir menu do perfil"
                        aria-expanded={isProfileMenuOpen}
                        aria-haspopup="menu"
                        onClick={() => setIsProfileMenuOpen((currentValue) => !currentValue)}
                    >
                        <img
                            src={user?.avatarUrl || "/src/assets/images/navbar/no-photo.png"}
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

        </nav>
    );
}
