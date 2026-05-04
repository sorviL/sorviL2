import nodemailer from "nodemailer";
import { buildWelcomeHtml } from "./templates/welcome.js";

const GMAIL_USER = process.env["GMAIL_USER"] || "";
const GMAIL_APP_PASSWORD = process.env["GMAIL_APP_PASSWORD"] || "";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: GMAIL_USER,
		pass: GMAIL_APP_PASSWORD,
	},
});

export class EmailService {
	async sendWelcomeEmail(nickname: string, email: string): Promise<void> {
		if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
			console.warn("Gmail não configurado, email de boas-vindas não enviado.");
			return;
		}

		try {
			await transporter.sendMail({
				from: `sorviL 📚 <${GMAIL_USER}>`,
				to: email,
				subject: "Bem-vindo(a) ao sorviL! 📚",
				html: buildWelcomeHtml(nickname),
			});
		} catch (error) {
			console.error("Erro ao enviar email de boas-vindas:", error);
		}
	}
}

export const emailService = new EmailService();
