const crypto = require("crypto");

const SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");

const reply = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body)
});

const isValid = (raw, signature, timestamp, publicKeyHex) => {
  try {
    const key = crypto.createPublicKey({
      key: Buffer.concat([SPKI_PREFIX, Buffer.from(publicKeyHex, "hex")]),
      format: "der",
      type: "spki"
    });
    return crypto.verify(
      null,
      Buffer.concat([Buffer.from(timestamp), raw]),
      key,
      Buffer.from(signature, "hex")
    );
  } catch (e) {
    return false;
  }
};

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 302, headers: { Location: "/" }, body: "" };
  }

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64")
    : Buffer.from(event.body || "", "utf8");

  const signature = event.headers["x-signature-ed25519"];
  const timestamp = event.headers["x-signature-timestamp"];
  const publicKey = process.env.DISCORD_PUBLIC_KEY || "17f16f20d0f6bd2077c25c1f36a4cee952c02fe94a68e1b8042b99aaf6974dd5";

  if (!signature || !timestamp || !publicKey || !isValid(raw, signature, timestamp, publicKey)) {
    return { statusCode: 401, body: "Invalid request signature" };
  }

  let interaction;
  try {
    interaction = JSON.parse(raw.toString("utf8"));
  } catch (e) {
    return { statusCode: 400, body: "Bad request" };
  }

  if (interaction.type === 1) {
    return reply(200, { type: 1 });
  }

  return reply(200, {
    type: 4,
    data: { content: "Cette commande est gérée par DT 990 Pro.", flags: 64 }
  });
};
