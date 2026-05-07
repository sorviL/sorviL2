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
		port: 587,
		secure: false,
		auth: { user, pass },
		family: 4,
		connectionTimeout: 10_000,
		greetingTimeout: 10_000,
		socketTimeout: 15_000,
	});

	return _transporter;
}

export class EmailService {
	async sendWelcomeEmail(nickname: string, email: string): Promise<void> {
		const gmailUser = process.env["GMAIL_USER"] || "";
		const gmailPass = process.env["GMAIL_APP_PASSWORD"] || "";
		const transporter = getTransporter();

		if (!transporter) {
			throw new Error(
				`Gmail não configurado. GMAIL_USER=${gmailUser ? "OK" : "VAZIO"}, GMAIL_APP_PASSWORD=${gmailPass ? "OK" : "VAZIO"}`
			);
		}

		const from = `sorviL <${gmailUser}>`;
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
