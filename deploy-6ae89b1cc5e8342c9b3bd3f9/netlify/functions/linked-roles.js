const crypto = require("crypto");

const CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1564080256590020698";
const SITE = process.env.SITE_URL || "https://dt990pro.netlify.app";
const REDIRECT_URI = process.env.REDIRECT_URI || SITE + "/api/callback";

exports.handler = async () => {
  const state = crypto.randomUUID();
  const url = new URL("https://discord.com/oauth2/authorize");
  url.search = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    state,
    scope: "role_connections.write identify",
    prompt: "consent"
  }).toString();

  return {
    statusCode: 302,
    headers: {
      Location: url.toString(),
      "Set-Cookie": "dt990_state=" + state + "; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600",
      "Cache-Control": "no-store"
    },
    body: ""
  };
};
