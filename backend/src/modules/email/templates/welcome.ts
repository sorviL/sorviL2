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
				</table>
			</td>
		</tr>
	</table>
</body>
</html>`.trim();
}
