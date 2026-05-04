import { useState, useEffect, useCallback, useRef } from "react";
import SoftAurora from "../../components/softAurora/SoftAurora";
import { Button } from "../../components/button/Button";
import { ChatWelcomeHeader } from "../../components/chat/welcomeHeader/ChatWelcomeHeader";
import { ChatInputBar } from "../../components/chat/inputBar/ChatInputBar";
import { ChatSidebar } from "../../components/chat/sidebar/ChatSidebar";
import { ChatConversationView } from "../../components/chat/conversationView/ChatConversationView";
import { WELCOME_SUGGESTIONS } from "../../components/chat/suggestionChips/suggestions";
import { useChat } from "../../hooks/useChat";
import { useAlert } from "../../components/alert/useAlert";
import "../../assets/css/chat/index.scss";

const LIA_DESCRIPTION =
	"Sua companheira literária inteligente. Conta o que você anda lendo, peça indicações pra próxima aventura, descubra autores parecidos com seus favoritos ou só desabafa sobre aquele final que te quebrou.";

const MOBILE_BREAKPOINT = 768;
const COOKIE_NAME = "chat_visited";
const COOKIE_MAX_AGE = 3600;

function setChatCookie() {
	document.cookie = `${COOKIE_NAME}=1; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function hasChatCookie(): boolean {
	return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE_NAME}=`));
}

function useIsMobile() {
	const [isMobile, setIsMobile] = useState(
		() => typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
	);

	useEffect(() => {
		function handleResize() {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		}
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return isMobile;
}

export function ChatPage() {
	const [welcomeInput, setWelcomeInput] = useState("");
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [showWelcome, setShowWelcome] = useState(() => !hasChatCookie());
	const isMobile = useIsMobile();
	const { showAlert } = useAlert();
	const layoutRef = useRef<HTMLDivElement>(null);

	const {
		conversations,
		activeConversationId,
		messages,
		isLoading,
		lastNewMessageId,
		loadConversations,
		selectConversation,
		createConversation,
		sendMessage,
		deleteConversation,
		startNewConversation
	} = useChat();

	useEffect(() => {
		setChatCookie();
		loadConversations();
	}, [loadConversations]);

	useEffect(() => {
		function updateHeight() {
			if (layoutRef.current) {
				const top = layoutRef.current.getBoundingClientRect().top;
				layoutRef.current.style.height = `${window.innerHeight - top}px`;
			}
		}
		updateHeight();
		window.addEventListener("resize", updateHeight);
		return () => window.removeEventListener("resize", updateHeight);
	}, [showWelcome]);

	const enterChat = useCallback(() => {
		setShowWelcome(false);
		setChatCookie();
	}, []);

	function handleWelcomeSubmit(value: string) {
		enterChat();
		createConversation(value);
		setWelcomeInput("");
	}

	function handleEmptySend(content: string) {
		createConversation(content);
	}

	function handleSend(content: string) {
		sendMessage(content);
	}

	async function handleDelete(id: string) {
		const success = await deleteConversation(id);
		if (success) {
			showAlert("success", "Conversa excluída.");
		} else {
			showAlert("danger", "Erro ao excluir conversa.");
		}
	}

	if (showWelcome && !activeConversationId) {
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
							value={welcomeInput}
							onChange={setWelcomeInput}
							onSubmit={handleWelcomeSubmit}
							placeholder="Iniciar chat..."
							autoFocus
							disabled={isLoading}
							loading={isLoading}
						/>

						<div className="chat-suggestion-chips">
							{WELCOME_SUGGESTIONS.map((s) => (
								<Button
									key={s.label}
									icon={s.icon}
									label={s.label}
									onClick={() => setWelcomeInput(s.label)}
								/>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="chat-page-layout" ref={layoutRef}>
			<ChatSidebar
				conversations={conversations}
				activeId={activeConversationId}
				onSelect={selectConversation}
				onDelete={handleDelete}
				onNewConversation={startNewConversation}
				isMobile={isMobile}
				isOpen={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
			/>

			<ChatConversationView
				messages={messages}
				lastNewMessageId={lastNewMessageId}
				onSend={activeConversationId ? handleSend : handleEmptySend}
				onOpenSidebar={() => setSidebarOpen(true)}
				isMobile={isMobile}
			/>
		</div>
	);
}
