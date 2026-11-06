const API = "https://discord.com/api/v10";
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || "1564080256590020698";
const SITE = process.env.SITE_URL || "https://dt990pro.netlify.app";
const REDIRECT_URI = process.env.REDIRECT_URI || SITE + "/api/callback";

const go = (status) => ({
  statusCode: 302,
  headers: {
    Location: SITE + "/verified.html?status=" + status,
    "Set-Cookie": "dt990_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0",
    "Cache-Control": "no-store"
  },
  body: ""
});

exports.handler = async (event) => {
  try {
    const params = event.queryStringParameters || {};
    const code = params.code;
    const state = params.state;
    const cookies = event.headers.cookie || "";
    const match = cookies.split(";").map((c) => c.trim()).find((c) => c.startsWith("dt990_state="));
    const saved = match ? match.slice("dt990_state=".length) : null;

    if (params.error) return go("denied");
    if (!code || !state || !saved || state !== saved) return go("expired");

    const tokenRes = await fetch(API + "/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET || "",
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI
      })
    });
    if (!tokenRes.ok) return go("error");

    const token = await tokenRes.json();

    const putRes = await fetch(API + "/users/@me/applications/" + CLIENT_ID + "/role-connection", {
      method: "PUT",
      headers: {
        Authorization: "Bearer " + token.access_token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        platform_name: "DT 990 Pro",
        metadata: { verified: true }
      })
    });
    if (!putRes.ok) return go("error");

    return go("ok");
  } catch (e) {
    return go("error");
  }
};
