// Gabarit HTML simple et cohérent avec le thème de l'app
export function emailLayout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;color:#e4e4e7;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="font-size:22px;font-weight:bold;color:#ffffff;margin-bottom:24px;">
      Chantier<span style="color:#22c55e;">Pro</span>
    </div>
    <div style="background:#18181b;border:1px solid #27272a;border-radius:12px;padding:24px;">
      <h1 style="font-size:18px;color:#ffffff;margin:0 0 16px;">${title}</h1>
      <div style="font-size:14px;line-height:1.6;color:#a1a1aa;">${body}</div>
    </div>
    <p style="font-size:12px;color:#52525b;margin-top:24px;text-align:center;">
      ChantierPro BTP — Gestion de chantiers au Togo
    </p>
  </div>
</body>
</html>`;
}

export function invitationEmail(companyName: string, inviterName: string, link: string): { subject: string; html: string } {
  return {
    subject: `Invitation à rejoindre ${companyName} sur ChantierPro`,
    html: emailLayout(
      "Vous êtes invité(e) !",
      `<p>${inviterName} vous invite à rejoindre l'équipe <strong>${companyName}</strong> sur ChantierPro.</p>
       <p style="margin:24px 0;">
         <a href="${link}" style="background:#22c55e;color:#000;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;display:inline-block;">Rejoindre l'équipe</a>
       </p>
       <p style="font-size:12px;color:#71717a;">Ou copiez ce lien : ${link}</p>`
    ),
  };
}

export function alertEmail(companyName: string, alerts: { title: string; detail: string; chantier?: string }[]): { subject: string; html: string } {
  const items = alerts
    .map(
      (a) =>
        `<li style="margin-bottom:12px;"><strong style="color:#fff;">${a.title}</strong>${a.chantier ? ` <span style="color:#71717a;">— ${a.chantier}</span>` : ""}<br>${a.detail}</li>`
    )
    .join("");
  return {
    subject: `${alerts.length} alerte(s) sur vos chantiers — ${companyName}`,
    html: emailLayout(
      "Alertes sur vos chantiers",
      `<p>Voici les points nécessitant votre attention :</p><ul style="padding-left:18px;">${items}</ul>`
    ),
  };
}
