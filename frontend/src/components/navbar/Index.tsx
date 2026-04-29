import { Link, useLocation } from "react-router-dom";
import "./Navbar.scss";

export function Navbar() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

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

                <Link to="/profile" className="navbar-profile">
                    <img
                        src="/src/assets/images/navbar/no-photo.png"
                        alt="Perfil do usuário"
                        className="profile-image"
                    />
                </Link>
            </div>
        </nav>
    );
}
