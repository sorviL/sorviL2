import "../../assets/css/profile/profile-settings.scss";
import { useState } from "react";
import { useAuth } from "../../contexts/auth.context";
import { useAlert } from "../alert/useAlert";
import { updateProfile as apiUpdateProfile, uploadAvatar as apiUploadAvatar } from "../../services/profile.service";

type ProfileSettingsProps = {
    onClose: () => void;
};

export function ProfileSettings({ onClose }: ProfileSettingsProps) {
    const { user, setUser } = useAuth();
    const { showAlert } = useAlert();

    const [nickname, setNickname] = useState(user?.nickname ?? "");
    const [bio, setBio] = useState(user?.bio ?? "");
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!user) return null;

    async function handleAvatarFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingAvatar(true);
        setError(null);

        const result = await apiUploadAvatar(file);

        setIsUploadingAvatar(false);

        if (!result.success) {
            setError(result.error || "Erro ao fazer upload da foto.");
            showAlert("danger", "Erro ao fazer upload da foto.");
            return;
        }

        showAlert("success", "Foto de perfil atualizada!");
        setUser(result.data);
        setAvatarUrl(result.data.avatarUrl ?? "");
    }

    async function handleSave() {
        setIsSaving(true);
        setError(null);

        const payload: Record<string, unknown> = {
            nickname: nickname?.trim() || undefined,
            bio: bio?.trim() || undefined,
        };

        const result = await apiUpdateProfile(payload);

        setIsSaving(false);

        if (!result.success) {
            setError(result.error || "Erro ao salvar perfil.");
            showAlert("danger", "Erro ao atualizar perfil.");
            return;
        }

        showAlert("success", "Perfil atualizado!");
        setUser(result.data);
        onClose();
    }

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
                    <form className="profile-settings-sections" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                        <div className="profile-settings-section">
                            <h3 className="profile-settings-section-title">Foto de Perfil</h3>
                            <div className="profile-settings-photo-section">
                                <div className="profile-settings-avatar-wrap">
                                    <img
                                        className="profile-settings-avatar"
                                        src={avatarUrl || "/src/assets/images/navbar/no-photo.png"}
                                        alt={`Foto de perfil de ${nickname}`}
                                    />
                                </div>
                                <div className="profile-settings-avatar-controls">
                                    <input
                                        id="avatar-file-input"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        onChange={handleAvatarFileSelect}
                                        disabled={isUploadingAvatar}
                                        style={{ display: "none" }}
                                    />
                                    <button
                                        type="button"
                                        className="profile-settings-upload-button"
                                        onClick={() => document.getElementById("avatar-file-input")?.click()}
                                        disabled={isUploadingAvatar}
                                    >
                                        {isUploadingAvatar ? "Enviando..." : "Selecionar arquivo"}
                                    </button>
                                    <p className="profile-settings-avatar-hint">JPG, PNG, WebP ou GIF (máximo 5MB)</p>
                                </div>
                            </div>
                        </div>

                        <div className="profile-settings-section">
                            <label className="profile-settings-field">
                                <span className="profile-settings-label">Nome de usuário</span>
                                <input
                                    className="profile-settings-input"
                                    type="text"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                />
                            </label>
                        </div>

                        <div className="profile-settings-section">
                            <h3 className="profile-settings-section-title">Bio</h3>
                            <label className="profile-settings-field">
                                <textarea
                                    className="profile-settings-textarea"
                                    rows={5}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                />
                            </label>
                        </div>

                        {error && <div className="profile-settings-error">{error}</div>}

                        <div className="profile-settings-actions">
                            <button type="button" className="profile-settings-cancel" onClick={onClose} disabled={isSaving || isUploadingAvatar}>
                                Cancelar
                            </button>
                            <button type="submit" className="profile-settings-save" disabled={isSaving || isUploadingAvatar}>
                                {isSaving ? "Salvando..." : "Salvar alterações"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
