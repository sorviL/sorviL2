import nodemailer from "nodemailer";
import { buildWelcomeHtml } from "./templates/welcome.js";

const GMAIL_USER = process.env["GMAIL_USER"] || "";
const GMAIL_APP_PASSWORD = process.env["GMAIL_APP_PASSWORD"] || "";

console.log(`[EmailService] GMAIL_USER=${GMAIL_USER ? "definido" : "VAZIO"}, GMAIL_APP_PASSWORD=${GMAIL_APP_PASSWORD ? "definido" : "VAZIO"}`);

const transporter = GMAIL_USER && GMAIL_APP_PASSWORD
	? nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: GMAIL_USER,
				pass: GMAIL_APP_PASSWORD,
			},
		})
	: null;

export class EmailService {
	async sendWelcomeEmail(nickname: string, email: string): Promise<void> {
		if (!transporter) {
			console.warn("[EmailService] Gmail não configurado, email de boas-vindas não enviado.");
			return;
		}

		console.log(`[EmailService] Enviando email de boas-vindas para ${email}...`);

		try {
			const info = await transporter.sendMail({
				from: `sorviL <${GMAIL_USER}>`,
				to: email,
				subject: "Bem-vindo(a) ao sorviL!",
				html: buildWelcomeHtml(nickname),
			});
			console.log(`[EmailService] Email enviado com sucesso: ${info.messageId}`);
		} catch (error) {
			console.error("[EmailService] Erro ao enviar email de boas-vindas:", error);
		}
	}
}

export const emailService = new EmailService();
