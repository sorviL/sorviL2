import "./AuthHero.scss";

type AuthHeroProps = {
  title: string;
  description: string;
};

export function AuthHero({ title, description }: AuthHeroProps) {
  return (
    <div className="auth-hero">
      <h1 className="auth-hero-title">{title}</h1>
      <p className="auth-hero-subtitle">{description}</p>
    </div>
  );
}
