import "../../assets/css/profile/profile-settings.scss";

const MOCK_SETTINGS = {
    username: "guisoares",
    bio: "Leitor de fantasia, ficção científica e histórias que deixam marca. Gosta de alternar entre clássicos e descobertas novas.",
    photoUrl: "/src/assets/images/navbar/no-photo.png",
};

type ProfileSettingsProps = {
    onClose: () => void;
};

export function ProfileSettings({ onClose }: ProfileSettingsProps) {
    return (
        <div className="profile-settings-page">
            <div className="profile-settings-wrapper">
                <div className="profile-settings-header">
                    <button
                        type="button"
                        className="profile-settings-back-button"
                        onClick={onClose}
                        aria-label="Voltar para perfil"
                    >
                        <span className="material-icons">arrow_back</span>
                    </button>
                    <h2 className="profile-settings-title">Editar perfil</h2>
                    <div />
                </div>

                <div className="profile-settings-card">
                    <form className="profile-settings-sections">
                        <div className="profile-settings-section">
                            <h3 className="profile-settings-section-title">Foto de Perfil</h3>
                            <div className="profile-settings-photo-section">
                                <div className="profile-settings-avatar-wrap">
                                    <img
                                        className="profile-settings-avatar"
                                        src={MOCK_SETTINGS.photoUrl}
                                        alt={`Foto de perfil de ${MOCK_SETTINGS.username}`}
                                    />
                                </div>
                                <button type="button" className="profile-settings-avatar-button">
                                    Alterar foto
                                </button>
                            </div>
                        </div>

                        <div className="profile-settings-section">
                            <label className="profile-settings-field">
                                <span className="profile-settings-label">Nome de usuário</span>
                                <input
                                    className="profile-settings-input"
                                    type="text"
                                    defaultValue={MOCK_SETTINGS.username}
                                />
                            </label>
                        </div>

                        <div className="profile-settings-section">
                            <h3 className="profile-settings-section-title">Bio</h3>
                            <label className="profile-settings-field">
                                <textarea
                                    className="profile-settings-textarea"
                                    rows={5}
                                    defaultValue={MOCK_SETTINGS.bio}
                                />
                            </label>
                        </div>

                        <div className="profile-settings-actions">
                            <button type="button" className="profile-settings-cancel" onClick={onClose}>
                                Cancelar
                            </button>
                            <button type="button" className="profile-settings-save">
                                Salvar alterações
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
