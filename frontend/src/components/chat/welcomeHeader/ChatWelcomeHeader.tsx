import { GradientText } from "../../gradientText/GradientText";
import "./ChatWelcomeHeader.scss";

type ChatWelcomeHeaderProps = {
	iaName: string;
	description: string;
};

export function ChatWelcomeHeader({ iaName, description }: ChatWelcomeHeaderProps) {
	return (
		<header className="chat-welcome-header">
			<h1 className="chat-welcome-header-title">
				Olá! Bem-vindo(a) à <GradientText>{iaName}</GradientText>
			</h1>

			<p className="chat-welcome-header-subtitle">{description}</p>
		</header>
	);
}
