import nodemailer from "nodemailer";
import { buildWelcomeHtml } from "./templates/welcome.js";

let _transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter(): typeof _transporter {
	if (_transporter) return _transporter;

	const user = process.env["GMAIL_USER"] || "";
	const pass = process.env["GMAIL_APP_PASSWORD"] || "";

	if (!user || !pass) return null;

	_transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: { user, pass },
		connectionTimeout: 10_000,
		greetingTimeout: 10_000,
		socketTimeout: 15_000,
	});

	return _transporter;
}

export class EmailService {
	async sendWelcomeEmail(nickname: string, email: string): Promise<void> {
		const transporter = getTransporter();

		if (!transporter) {
			console.warn("[EmailService] Gmail não configurado (GMAIL_USER ou GMAIL_APP_PASSWORD vazio).");
			return;
		}

		const from = `sorviL <${process.env["GMAIL_USER"]}>`;
		console.log(`[EmailService] Enviando email de boas-vindas para ${email}...`);

		const info = await transporter.sendMail({
			from,
			to: email,
			subject: "Bem-vindo(a) ao sorviL!",
			html: buildWelcomeHtml(nickname),
		});

		console.log(`[EmailService] Email enviado: ${info.messageId}`);
	}
}

export const emailService = new EmailService();
