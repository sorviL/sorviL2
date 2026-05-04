import "../../assets/css/profile/index.scss";
import { ProfileHeader } from "../../components/profile/ProfileHeader";
import { ProfileRecentBooks } from "../../components/profile/ProfileRecentBooks";
import { ProfileRecentReviews } from "../../components/profile/ProfileRecentReviews";
import { ProfileSettings } from "../../components/profile/ProfileSettings";
import { useState } from "react";

export function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);

    if (isEditing) {
        return <ProfileSettings onClose={() => setIsEditing(false)} />;
    }

    return (
        <div className="profile-page">
            <ProfileHeader onOpenSettings={() => setIsEditing(true)} />
            <ProfileRecentBooks />
            <ProfileRecentReviews />
        </div>
    );
}
