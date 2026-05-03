import type { ChatConversation, ChatMessage } from "../types/chat";

let nextId = 1;
function uid(): string {
	return String(nextId++);
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_RESPONSES = [
	"Que ótima escolha! Esse livro tem uma narrativa envolvente e personagens muito bem construídos. Se você gostou desse estilo, posso recomendar outros títulos parecidos. O que mais te chamou atenção na história?",
	"Baseado no que você me contou, acho que você ia adorar **'O Nome do Vento'** de Patrick Rothfuss. É uma fantasia épica com uma prosa linda e um protagonista carismático. Quer saber mais sobre ele?",
	"Clarice Lispector tem um estilo muito único! Autores com uma escrita introspectiva parecida incluem:\n\n- **Virginia Woolf** — fluxo de consciência poético\n- **Hilda Hilst** — intensidade e experimentação\n- **Lygia Fagundes Telles** — sutileza psicológica\n\nQual desses te interessa mais?",
	"Duna é uma obra-prima! Depois dele, recomendo seguir com **'O Messias de Duna'** (a sequência direta) ou, se quiser algo diferente mas igualmente épico, **'Fundação'** de Isaac Asimov. Ambos exploram política, poder e civilizações em escala galáctica.",
	"⚠️ **Cuidado, spoiler a seguir!**\n\nSobre o final: sim, a decisão do protagonista é controversa. Muitos leitores ficam divididos, mas eu acho que faz total sentido considerando o arco de desenvolvimento dele ao longo da história. O que você achou?"
];

const conversations: ChatConversation[] = [];
const messagesByConversation: Record<string, ChatMessage[]> = {};

export async function getConversations(): Promise<ChatConversation[]> {
	await delay(300);
	return [...conversations].sort(
		(a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
	);
}
