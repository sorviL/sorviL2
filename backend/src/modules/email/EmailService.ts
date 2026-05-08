import { buildWelcomeHtml } from "./templates/welcome.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

type BrevoSendInput = {
	to: string;
	subject: string;
	html: string;
};

async function sendViaBrevo(input: BrevoSendInput): Promise<void> {
	const apiKey = process.env["BREVO_API_KEY"] || "";
	const senderEmail = process.env["BREVO_SENDER_EMAIL"] || process.env["GMAIL_USER"] || "";
	const senderName = process.env["BREVO_SENDER_NAME"] || "sorviL";

	if (!apiKey) throw new Error("BREVO_API_KEY não configurada.");
	if (!senderEmail) throw new Error("BREVO_SENDER_EMAIL (ou GMAIL_USER) não configurado.");

	const response = await fetch(BREVO_API_URL, {
		method: "POST",
		headers: {
			"api-key": apiKey,
			"content-type": "application/json",
			accept: "application/json",
		},
		body: JSON.stringify({
			sender: { email: senderEmail, name: senderName },
			to: [{ email: input.to }],
			subject: input.subject,
			htmlContent: input.html,
		}),
	});

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new Error(`Brevo HTTP ${response.status}: ${text || response.statusText}`);
	}
}

export class EmailService {
	async sendWelcomeEmail(nickname: string, email: string): Promise<void> {
		console.log(`[EmailService] Enviando email de boas-vindas para ${email}...`);
		await sendViaBrevo({
			to: email,
			subject: "Bem-vindo(a) ao sorviL!",
			html: buildWelcomeHtml(nickname),
		});
		console.log(`[EmailService] Email enviado para ${email}`);
	}
}

export const emailService = new EmailService();
