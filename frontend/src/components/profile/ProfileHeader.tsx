import "../../assets/css/profile/profile-header.scss";
import { useAuth } from "../../contexts/auth.context";

type ProfileHeaderProps = {
    onOpenSettings: () => void;
};

export function ProfileHeader({ onOpenSettings }: ProfileHeaderProps) {
    const { user } = useAuth();

    if (!user) {
        return null;
    }

    const photoUrl = user.avatarUrl || "/images/no-photo.png";

    return (
        <div className="profile-header-wrapper">
            <section className="profile-header" aria-label="Cabeçalho do perfil">
                <div className="profile-header-avatar-wrap">
                    <img
                        className="profile-header-avatar"
                        src={photoUrl}
                        alt={`Foto de perfil de ${user.nickname}`}
                    />
                </div>

                <div className="profile-header-content">
                    <div className="profile-header-top">
                        <h1 className="profile-header-name">@{user.nickname}</h1>
                        <button type="button" className="profile-header-settings-button" onClick={onOpenSettings} aria-label="Configurações do perfil">
                            <span className="material-icons">settings</span>
                        </button>
                    </div>
                    <p className="profile-header-bio">{user.bio}</p>
                </div>
            </section>
        </div>
    );
}
