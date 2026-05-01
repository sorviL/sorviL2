import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/auth.context";
import { useNavbarSearch } from "./useNavbarSearch";
import { NavbarSearchDropdown } from "./NavbarSearchDropdown";
import "./Navbar.scss";

export function Navbar() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState<string | null>(null);
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
        setLogoutError(null);
        setIsLoggingOut(true);
        setIsProfileMenuOpen(false);

        try {
            await logout();
        } catch {
            setLogoutError("Não foi possivel sair agora. Tente novamente.");
        } finally {
            setIsLoggingOut(false);
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand-group">
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
                            <button type="button" className="navbar-link navbar-button">
                                Sugestão IA
                            </button>
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
