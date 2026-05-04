import "../../assets/css/profile/profile-header.scss";

const MOCK_PROFILE = {
    username: "guisoares",
    bio: "Leitor de fantasia, ficção científica e histórias que deixam marca. Gosta de alternar entre clássicos e descobertas novas.",
    photoUrl: "/src/assets/images/navbar/no-photo.png",
};

type ProfileHeaderProps = {
    onOpenSettings: () => void;
};

export function ProfileHeader({ onOpenSettings }: ProfileHeaderProps) {
    return (
        <div className="profile-header-wrapper">
            <section className="profile-header" aria-label="Cabeçalho do perfil">
                <div className="profile-header-avatar-wrap">
                    <img
                        className="profile-header-avatar"
                        src={MOCK_PROFILE.photoUrl}
                        alt={`Foto de perfil de ${MOCK_PROFILE.username}`}
                    />
                </div>

                <div className="profile-header-content">
                    <div className="profile-header-top">
                        <h1 className="profile-header-name">@{MOCK_PROFILE.username}</h1>
                        <button type="button" className="profile-header-settings-button" onClick={onOpenSettings} aria-label="Configurações do perfil">
                            <span className="material-icons">settings</span>
                        </button>
                    </div>
                    <p className="profile-header-bio">{MOCK_PROFILE.bio}</p>
                </div>
            </section>
        </div>
    );
}
