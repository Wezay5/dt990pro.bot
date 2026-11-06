const CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1564080256590020698";
const SETUP_KEY = process.env.SETUP_KEY || "dt990-m7Kq29xPz41";

const text = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  body
});

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};

  if (params.key !== SETUP_KEY) {
    return { statusCode: 302, headers: { Location: "/" }, body: "" };
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return text(500, "DISCORD_BOT_TOKEN est manquant dans les variables Netlify. Ajoute-le puis redéploie le site.");
  }

  const res = await fetch("https://discord.com/api/v10/applications/" + CLIENT_ID + "/role-connections/metadata", {
    method: "PUT",
    headers: {
      Authorization: "Bot " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([
      {
        key: "verified",
        name: "Utilisateur vérifié",
        description: "A autorisé DT 990 Pro",
        type: 7
      }
    ])
  });

  if (res.ok) {
    return text(200, "Rôles liés installés : la condition « Utilisateur vérifié » est prête.");
  }

  const detail = await res.text();
  return text(res.status, "Discord a refusé la demande (" + res.status + ") : " + detail);
};
