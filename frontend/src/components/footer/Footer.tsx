import logoSorvil from "../../assets/images/logo-sorvil.png";
import "./Footer.scss";

const DEVELOPERS = [
    "Ágatha Cristie Corrêa Duarte",
    "Guilherme Soares dos Santos Silva",
    "Diego Sato Covo",
    "Pedro Henrique Ganancin"
];

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-brand">
                    <img className="footer-logo" src={logoSorvil} alt="Logo sorviL" />
                    <span className="footer-site-name">sorviL</span>
                </div>

                <p className="footer-description">
                    Sua estante virtual para organizar, avaliar e acompanhar suas leituras.
                </p>

                <div className="footer-developers">
                    <h4 className="footer-developers-title">Desenvolvedores</h4>
                    <ul className="footer-developers-list">
                        {DEVELOPERS.map((name) => (
                            <li key={name}>{name}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
}
