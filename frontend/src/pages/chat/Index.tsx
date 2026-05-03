import { useState, useEffect, useCallback, useRef } from "react";
import SoftAurora from "../../components/softAurora/SoftAurora";
import { Button } from "../../components/button/Button";
import { ChatWelcomeHeader } from "../../components/chat/welcomeHeader/ChatWelcomeHeader";
import { ChatInputBar } from "../../components/chat/inputBar/ChatInputBar";
import { ChatSidebar } from "../../components/chat/sidebar/ChatSidebar";
import { ChatConversationView } from "../../components/chat/conversationView/ChatConversationView";
import { WELCOME_SUGGESTIONS } from "../../components/chat/suggestionChips/suggestions";
import { useChat } from "../../hooks/useChat";
import "../../assets/css/chat/index.scss";

const LIA_DESCRIPTION =
	"Sua companheira literária inteligente. Conta o que você anda lendo, peça indicações pra próxima aventura, descubra autores parecidos com seus favoritos ou só desabafa sobre aquele final que te quebrou.";

export function ChatPage() {
	const [message, setMessage] = useState("");

	function handleSubmit(_value: string) {
	}

	return (
		<div className="chat-page">
			<SoftAurora
				speed={0.6}
				scale={1.5}
				brightness={1}
				color1="--color-primary"
				color2="--color-footer-developers-background"
				noiseFrequency={2.5}
				noiseAmplitude={1}
				bandHeight={0.5}
				bandSpread={1}
				octaveDecay={0.1}
				layerOffset={0}
				colorSpeed={1}
				enableMouseInteraction
				mouseInfluence={0.25}
			/>

			<div className="chat-page-content">
				<ChatWelcomeHeader iaName="Lia" description={LIA_DESCRIPTION} />

				<div className="chat-page-form">
					<ChatInputBar
						value={message}
						onChange={setMessage}
						onSubmit={handleSubmit}
						placeholder="Iniciar chat..."
						autoFocus
					/>

					<div className="chat-suggestion-chips">
						{WELCOME_SUGGESTIONS.map((s) => (
							<Button
								key={s.label}
								icon={s.icon}
								label={s.label}
								onClick={() => setMessage(s.label)}
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
