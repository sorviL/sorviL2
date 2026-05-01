import "./AuthHero.scss";
import RotatingText from "../../../components/rotatingText/RotatingText";

type AuthHeroProps = {
    title: string;
    description: string;
};

export function AuthHero({ title, description }: AuthHeroProps) {
    return (
        <div className="auth-hero">
            <h1 className="auth-hero-title">{title}</h1>
            <p className="auth-hero-rotating">
                <span className="auth-hero-rotating-prefix">Leia e</span>
                <RotatingText
                    texts={["resenhe", "poste", "se conecte", "descubra", "compartilhe", "inspire-se"]}
                    mainClassName="auth-hero-rotating-text"
                    staggerFrom="last"
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-120%" }}
                    staggerDuration={0.025}
                    splitLevelClassName="auth-hero-rotating-split"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                    rotationInterval={2500}
                    splitBy="characters"
                    auto
                    loop
                />
            </p>
            <p className="auth-hero-subtitle">{description}</p>
        </div>
    );
}
