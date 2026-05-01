import "../../assets/css/index/index.scss";
import { useAuth } from "../../contexts/auth.context";

export function IndexPage() {
    const { user } = useAuth();

    return (
        <div className="index-page">
            <div className="index-page-content">
                <h1 className="index-page-title">Minha página</h1>
                {user && <p className="index-page-greeting">Ola, {user.nickname}</p>}
            </div>
        </div>
    );
}
