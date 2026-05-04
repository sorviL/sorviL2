export function buildWelcomeHtml(nickname: string): string {
	return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0; padding:0; background-color:#f4f4f5; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
	<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5; padding:40px 0;">
		<tr>
			<td align="center">
				<table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08);">
					<tr>
						<td style="background:linear-gradient(135deg,#7c3aed,#a855f7); padding:32px 40px; text-align:center;">
							<h1 style="margin:0; color:#ffffff; font-size:28px; font-weight:700;">sorviL</h1>
							<p style="margin:8px 0 0; color:rgba(255,255,255,0.85); font-size:14px;">Sua plataforma de leitores</p>
						</td>
					</tr>
					<tr>
						<td style="padding:32px 40px;">
							<h2 style="margin:0 0 16px; color:#1a1a2e; font-size:20px; font-weight:600;">
								Bem-vindo(a), ${nickname}! 📚
							</h2>
							<p style="margin:0 0 16px; color:#4a4a68; font-size:15px; line-height:1.6;">
								Sua conta no <strong>sorviL</strong> foi criada com sucesso! Agora você pode:
							</p>
							<ul style="margin:0 0 24px; padding-left:20px; color:#4a4a68; font-size:15px; line-height:1.8;">
								<li>Montar sua estante virtual de livros</li>
								<li>Escrever e ler resenhas</li>
								<li>Conversar com a <strong>Lia</strong>, nossa assistente de livros</li>
								<li>Descobrir novas leituras</li>
							</ul>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`.trim();
}
