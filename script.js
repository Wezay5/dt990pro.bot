const INVITE_URL = "https://discord.com/oauth2/authorize?client_id=1564080256590020698&permissions=8&integration_type=0&scope=bot";

const COMMANDS = [
  { name: "/musique recherche", desc: "Joue une musique par son nom ou un lien YouTube." },
  { name: "/pause", desc: "Met la musique en pause." },
  { name: "/reprendre", desc: "Reprend la musique." },
  { name: "/skip", desc: "Passe à la musique suivante." },
  { name: "/stop", desc: "Arrête la musique et quitte le vocal (sauf si verrouillé)." },
  { name: "/volume niveau", desc: "Règle le volume global de 1 à 100." },
  { name: "/loop mode", desc: "Répète la musique en cours ou toute la file." },
  { name: "/paroles", desc: "Active ou désactive les paroles synchronisées en direct." },

  { name: "/tdah son", desc: "Bruit de fond (brun, rose, blanc, binaural), pitch et vitesse." },

  { name: "/playliste creer nom", desc: "Crée une nouvelle playliste." },
  { name: "/playliste ajouter nom recherche", desc: "Ajoute une musique à une playliste." },
  { name: "/playliste ajouter_en_cours nom", desc: "Ajoute la musique en cours de lecture." },
  { name: "/playliste lancer nom", desc: "Lance une playliste dans l'ordre exact ou en aléatoire." },
  { name: "/playliste voir nom", desc: "Affiche le contenu d'une playliste." },
  { name: "/playliste liste", desc: "Affiche toutes tes playlistes." },
  { name: "/playliste retirer nom position", desc: "Retire une musique d'une playliste." },
  { name: "/playliste deplacer nom de vers", desc: "Change la position d'une musique dans une playliste." },
  { name: "/playliste melanger nom", desc: "Mélange définitivement l'ordre de la playliste." },
  { name: "/playliste vider nom", desc: "Retire toutes les musiques d'une playliste." },
  { name: "/playliste renommer nom nouveau_nom", desc: "Renomme une playliste." },
  { name: "/playliste supprimer nom", desc: "Supprime une playliste." },

  { name: "/staff verrouiller salon", desc: "Verrouille le bot dans un salon vocal : il le rejoint à chaque démarrage." },
  { name: "/staff deverrouiller", desc: "Libère le bot : il peut de nouveau suivre les membres." },
  { name: "/staff deconnecter membre", desc: "Déconnecte un membre de son salon vocal." }
];

document.querySelectorAll("[data-invite]").forEach(a => {
  a.href = INVITE_URL;
  a.target = "_blank";
  a.rel = "noopener";
});
document.getElementById("year").textContent = new Date().getFullYear();

const list = document.getElementById("cmd-list");
const status = document.getElementById("copy-status");
COMMANDS.forEach(c => {
  const li = document.createElement("li");
  const btn = document.createElement("button");
  btn.type = "button";
  btn.innerHTML = '<span class="cmd-name"></span><span class="cmd-desc"></span><span class="cmd-state">Copier</span>';
  btn.querySelector(".cmd-name").textContent = c.name;
  btn.querySelector(".cmd-desc").textContent = c.desc;
  btn.addEventListener("click", async () => {
    const state = btn.querySelector(".cmd-state");
    try {
      await navigator.clipboard.writeText(c.name);
      state.textContent = "Copié";
      status.textContent = c.name + " copié";
    } catch {
      state.textContent = "Échec";
    }
    btn.classList.add("copied");
    setTimeout(() => { state.textContent = "Copier"; btn.classList.remove("copied"); }, 1500);
  });
  li.appendChild(btn);
  list.appendChild(li);
});

const canvas = document.getElementById("viz");
const ctx = canvas.getContext("2d");
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const BARS = 28;
let w, h, t = 0, pointerX = 0.5, energy = 0.35;

function resize() {
  const r = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  w = r.width; h = r.height;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", () => { resize(); draw(); });
canvas.addEventListener("pointermove", e => {
  const r = canvas.getBoundingClientRect();
  pointerX = (e.clientX - r.left) / r.width;
  energy = 1;
});

function draw() {
  ctx.clearRect(0, 0, w, h);
  const gap = w / BARS, bw = gap * 0.58, mid = h / 2;
  for (let i = 0; i < BARS; i++) {
    const x = (i + 0.5) / BARS;
    const wave = Math.sin(t * 1.6 + i * 0.55) * 0.5 + Math.sin(t * 0.9 + i * 0.23) * 0.5;
    const near = Math.exp(-Math.pow((x - pointerX) * 4, 2));
    const amp = (0.18 + 0.22 * (wave * 0.5 + 0.5)) + near * 0.5 * energy;
    const bh = Math.max(6, amp * h);
    ctx.fillStyle = near * energy > 0.35 ? "#ff5a36" : "#eeeaff";
    ctx.globalAlpha = 0.35 + 0.65 * Math.min(1, amp * 1.6);
    const r = bw / 2;
    ctx.beginPath();
    ctx.roundRect(i * gap + (gap - bw) / 2, mid - bh / 2, bw, bh, r);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function loop() {
  t += 0.016;
  energy += (0.35 - energy) * 0.02;
  draw();
  requestAnimationFrame(loop);
}
resize();
reduce ? draw() : loop();

(function () {
  const KONAMI = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  const N = 20, SIZE = 400, CELL = SIZE / N, SPEED = 105;
  const DIRS = {
    ArrowUp:[0,-1], w:[0,-1], ArrowDown:[0,1], s:[0,1],
    ArrowLeft:[-1,0], a:[-1,0], ArrowRight:[1,0], d:[1,0]
  };
  let pos = 0, overlay = null, cv, cx, scoreEl, bestEl;
  let snake, dir, queue, food, score, alive, timer, best = 0;
  try { best = +localStorage.getItem("snake-best") || 0; } catch {}

  document.addEventListener("keydown", e => {
    if (overlay) return gameKey(e);
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === KONAMI[pos]) {
      if (++pos === KONAMI.length) { pos = 0; open(); }
    } else {
      pos = k === KONAMI[0] ? 1 : 0;
    }
  });

  function open() {
    overlay = document.createElement("div");
    overlay.className = "snake-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-label", "Snake");
    overlay.innerHTML =
      '<div class="snake-box">' +
      '<div class="snake-head"><span>Score <b id="sn-score">0</b></span><span>Record <b id="sn-best">0</b></span></div>' +
      '<canvas width="' + SIZE + '" height="' + SIZE + '"></canvas>' +
      '<p class="snake-hint">Flèches ou ZQSD pour bouger. Échap pour quitter.</p></div>';
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    cv = overlay.querySelector("canvas");
    cx = cv.getContext("2d");
    scoreEl = overlay.querySelector("#sn-score");
    bestEl = overlay.querySelector("#sn-best");
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
    let sx, sy;
    cv.addEventListener("touchstart", e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    cv.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) { if (!alive) start(); return; }
      turn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
    });
    start();
  }

  function close() {
    clearInterval(timer);
    overlay.remove();
    overlay = null;
    document.body.style.overflow = "";
  }

  function start() {
    snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    dir = [1, 0]; queue = []; score = 0; alive = true;
    placeFood(); updateScore();
    clearInterval(timer);
    timer = setInterval(tick, SPEED);
    draw();
  }

  function placeFood() {
    do { food = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }; }
    while (snake.some(s => s.x === food.x && s.y === food.y));
  }

  function turn(d) {
    const last = queue.length ? queue[queue.length - 1] : dir;
    if (d[0] === -last[0] && d[1] === -last[1]) return;
    if (d[0] === last[0] && d[1] === last[1]) return;
    if (queue.length < 2) queue.push(d);
  }

  function gameKey(e) {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (k === "Escape") return close();
    const map = { z: "w", q: "a" };
    const d = DIRS[map[k] || k];
    if (d) { e.preventDefault(); turn(d); }
    else if ((k === "Enter" || k === " ") && !alive) { e.preventDefault(); start(); }
  }

  function tick() {
    if (queue.length) dir = queue.shift();
    const head = { x: snake[0].x + dir[0], y: snake[0].y + dir[1] };
    const hitWall = head.x < 0 || head.y < 0 || head.x >= N || head.y >= N;
    const hitSelf = snake.some((s, i) => i < snake.length - 1 && s.x === head.x && s.y === head.y);
    if (hitWall || hitSelf) return end();
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { score++; placeFood(); updateScore(); }
    else snake.pop();
    draw();
  }

  function end() {
    alive = false;
    clearInterval(timer);
    if (score > best) {
      best = score;
      try { localStorage.setItem("snake-best", best); } catch {}
    }
    updateScore();
    draw();
    cx.fillStyle = "rgba(22,20,51,.78)";
    cx.fillRect(0, 0, SIZE, SIZE);
    cx.fillStyle = "#eeeaff";
    cx.textAlign = "center";
    cx.font = "800 34px 'Bricolage Grotesque', sans-serif";
    cx.fillText("Perdu !", SIZE / 2, SIZE / 2 - 8);
    cx.font = "500 16px 'DM Sans', sans-serif";
    cx.fillText("Entrée ou toucher pour rejouer", SIZE / 2, SIZE / 2 + 24);
  }

  function updateScore() { scoreEl.textContent = score; bestEl.textContent = best; }

  function draw() {
    cx.fillStyle = "#221f4a";
    cx.fillRect(0, 0, SIZE, SIZE);
    cx.fillStyle = "#ff5a36";
    cx.beginPath();
    cx.arc((food.x + .5) * CELL, (food.y + .5) * CELL, CELL * .36, 0, Math.PI * 2);
    cx.fill();
    snake.forEach((s, i) => {
      cx.fillStyle = i === 0 ? "#ffffff" : "#eeeaff";
      cx.globalAlpha = i === 0 ? 1 : Math.max(.45, 1 - i * .02);
      cx.beginPath();
      cx.roundRect(s.x * CELL + 1.5, s.y * CELL + 1.5, CELL - 3, CELL - 3, 5);
      cx.fill();
    });
    cx.globalAlpha = 1;
  }
})();
