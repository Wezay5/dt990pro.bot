const CONTACT_EMAIL = "ton-email@exemple.com";
const INVITE_URL = "https://discord.com/oauth2/authorize?client_id=1564080256590020698&permissions=8&integration_type=0&scope=bot";

document.querySelectorAll("[data-contact]").forEach((el) => {
  const a = document.createElement("a");
  a.href = "mailto:" + CONTACT_EMAIL;
  a.textContent = CONTACT_EMAIL;
  el.replaceWith(a);
});

document.querySelectorAll("[data-invite]").forEach((a) => {
  a.href = INVITE_URL;
  a.target = "_blank";
  a.rel = "noopener";
});

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const title = document.getElementById("status-title");
const text = document.getElementById("status-text");
if (title && text) {
  const messages = {
    ok: ["Vérifié !", "Ton profil est lié à DT 990 Pro. Tu peux retourner sur Discord."],
    denied: ["Autorisation annulée", "Tu as refusé la demande. Relance la vérification depuis Discord si tu veux réessayer."],
    expired: ["Lien expiré", "La vérification a expiré. Relance-la depuis Discord."],
    error: ["Une erreur est survenue", "La vérification n’a pas abouti. Réessaie dans quelques minutes."]
  };
  const status = new URLSearchParams(location.search).get("status");
  const m = messages[status] || messages.error;
  title.textContent = m[0];
  text.textContent = m[1];
}
