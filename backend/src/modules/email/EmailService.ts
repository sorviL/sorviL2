import { Resend } from "resend";
import { buildWelcomeHtml } from "./templates/welcome.js";

const RESEND_API_KEY = process.env["RESEND_API_KEY"] || "";

const resend = new Resend(RESEND_API_KEY);

export class EmailService {
	async sendWelcomeEmail(nickname: string, email: string): Promise<void> {
		if (!RESEND_API_KEY) {
			console.warn("RESEND_API_KEY não configurada, email de boas-vindas não enviado.");
			return;
		}

		const { error } = await resend.emails.send({
			from: "sorviL <onboarding@resend.dev>",
			to: email,
			subject: "Bem-vindo(a) ao sorviL! 📚",
			html: buildWelcomeHtml(nickname)
		});

		if (error) {
			console.error("Erro ao enviar email de boas-vindas:", error);
		}
	}
}

export const emailService = new EmailService();
