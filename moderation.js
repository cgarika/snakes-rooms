/* What players type, kept friendly (2026-10-18; the same file in every GameNest server, as reactions.js is): chat,
   names, answers and custom words. Two layers:
   - words: LDNOOBW's English list (CC-BY-4.0, github.com/LDNOOBW) with ours, matched as whole words after the usual
     disguises (f4gg0t, shiiit, f.u.c.k); a match is starred out.
   - the model: unitary's toxic-bert (Apache-2.0; Xenova's int8 ONNX from Hugging Face, 110 MB, ~4 ms a message) in a
     worker thread, loaded on the first message and let go after IDLE_MS. It reads six things; a message is held back
     if it is strongly obscene or insulting, a threat, aimed at a group, or severe. Game talk ("who should we kill
     tonight?", "checkmate, sucker") stays: 0 of 70 such lines were held back in testing.
   The model's files: $MODERATION_MODEL_DIR, else ~/Library/GameNest/Cache/moderation/toxic-bert (tools/moderation_model.sh
   fetches them). Without them, or with onnxruntime-node missing, only the words layer runs.
   check(text) answers a promise of { text, held, reason }: text starred where it must be, or null if held back;
   chat(text) the text to show; clean(text) and name(n) are the words alone, on the spot (names, clues, custom words). */
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");
const { Worker, isMainThread, parentPort } = require("worker_threads");

const DIR = process.env.MODERATION_MODEL_DIR || path.join(os.homedir(), "Library", "GameNest", "Cache", "moderation", "toxic-bert");
const MODEL = path.join(DIR, "model_quantized.onnx");
const VOCAB = path.join(DIR, "vocab.txt");
// onnxruntime-node: the server's own, else the one copy the Mac keeps for every server (Mac arm64 only, ~45 MB).
const SHARED_ORT = path.join(os.homedir(), "Library", "GameNest", "Cache", "ort", "node_modules", "onnxruntime-node");
function ortPath() {
  try { return require.resolve("onnxruntime-node"); } catch (e) { /* not the server's own */ }
  try { return require.resolve(SHARED_ORT); } catch (e) { return null; }
}
const IDLE_MS = Math.max(10000, Number(process.env.MODERATION_IDLE_MS || 10 * 60 * 1000));

/* The model's six readings (0-1) and where each holds a message back. */
const LABELS = ["toxic", "severe_toxic", "obscene", "threat", "insult", "identity_hate"];
// Obscene alone never holds one back: the model reads "this game sucks" as obscene (0.92); swearing is starred instead.
const HOLD = { severe_toxic: 0.3, threat: 0.75, insult: 0.9, identity_hate: 0.4 };
// A threat to a piece, a role or a card is the game: the bar for one naming them is higher ("my knight is going to kill
// your bishop" reads 0.81; "I will kill you", 0.90).
const GAME_THREAT = 0.93;
const GAME_WORDS = new Set(["knight", "knights", "bishop", "bishops", "rook", "rooks", "queen", "queens", "king", "kings",
  "pawn", "pawns", "piece", "pieces", "mafia", "doctor", "detective", "wolf", "wolves", "werewolf", "werewolves", "villager",
  "villagers", "mayor", "baker", "bodyguard", "sheriff", "vampire", "bot", "bots", "card", "cards", "disc", "discs", "token",
  "tile", "tiles", "snake", "snakes", "ladder", "spy", "spies", "agent", "agents", "ball", "pins", "hole", "level", "round"]);

/* ---------- the words ---------- */
const LIST = path.join(__dirname, "moderation_words.txt");
// LDNOOBW's that are everyday words at our tables (snatch the queen, this sucks, xx at the end, poof, a sexy move).
const NOT_BAD = new Set(["suck", "sucks", "snatch", "xx", "poof", "sexy", "butt", "escort", "scat", "twinkie", "eunuch",
  "playboy", "hard core", "hardcore", "how to kill", "sexual", "erotism", "nutten", "dommes"]);
// Ours: the list lacks these, or they come disguised this way most.
const MORE = ["kys", "stfu", "nudes", "nude pics", "mongoloid", "subhuman", "fuk", "fck",
  "fcuk", "phuck", "fuq", "fucker", "fuckers", "fucked", "fucktard", "motherfucker", "dyke", "wanker", "dumbass",
  "retard", "retarded", "jackass", "bullshit", "shithead", "dickhead", "cocksucker", "nazi", "hitler", "kkk", "slutty",
  "hoe", "thot", "cuck", "incel", "rapey", "molest", "pedo", "pedophile", "niga", "nigguh", "faggit", "fagot"];
// Plain swearing: starred, the message still goes. Every other word on the lists (sexual, slurs) holds it back.
const SWEARS = new Set(["fuck", "fucking", "fuckin", "fucked", "fucker", "fuckers", "fuk", "fck", "fcuk", "phuck", "fuq",
  "shit", "shitty", "bullshit", "shithead", "piss", "pissing", "ass", "asshole", "bastard", "bitch",
  "bitches", "dumbass", "jackass", "stfu", "wanker", "tosser", "dickhead", "motherfucker"]);
// Held back whatever the model reads: pushes to self-harm, finding someone, asking for pictures.
const HOLD_PHRASES = ["kill yourself", "kill urself", "kill your self", "hang yourself", "go hang", "drink bleach",
  "end your life", "end ur life", "slit your wrists", "jump off a bridge", "nobody would miss you", "no one would miss you",
  "quit life", "i know your address", "i know where you live", "whats your address", "where do you live",
  "send pics", "send me pics", "send nudes", "pics of your body", "show me your", "bend over", "go back to your country"];
let WORDS = null, PHRASES = null;
function words() {
  if (WORDS) return;
  const raw = fs.existsSync(LIST) ? fs.readFileSync(LIST, "utf8").split("\n").filter((l) => !l.startsWith("#")) : [];
  WORDS = new Set(); PHRASES = [];
  for (const w of raw.concat(MORE, HOLD_PHRASES, [...SWEARS])) {
    const t = norm(w.trim());
    if (!t || NOT_BAD.has(w.trim().toLowerCase())) continue;
    if (t.includes(" ")) PHRASES.push(t); else WORDS.add(t);
  }
}
const LEET = { 0: "o", 1: "i", 3: "e", 4: "a", 5: "s", 7: "t", 8: "b", "@": "a", $: "s", "!": "i", "|": "i", "+": "t" };
/* A word with its disguise off: lower case, accents off, l33t letters back, the dots and stars inside it out. */
function norm(w) {
  return w.toLowerCase().normalize("NFKD").replace(/\p{Mn}/gu, "")
    .replace(/[013457@$!|+8]/g, (c) => LEET[c] || c)
    .replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
}
const squeeze = (w, n) => w.replace(/(.)\1+/g, n === 1 ? "$1" : "$1$1");   // shiiiit: shiit, shit
/* The list's word a token is (disguise off), or null. */
function badWord(token) {
  const t = norm(token);
  if (!t) return null;
  return [t, squeeze(t, 2), squeeze(t, 1)].find((v) => WORDS.has(v)) || null;
}
/* The text with each bad word starred (its first letter kept): hit, any was; worst, one that is not plain swearing;
   phrase, a phrase that holds it back. Words spelled out with dots or spaces between letters (f.u.c.k, f u c k) count. */
function starWords(text) {
  words();
  let hit = false, worst = null;
  const star = (w, word) => { hit = true; if (word && !SWEARS.has(word)) worst = word; return w[0] + "*".repeat(Math.max(2, [...w].length - 1)); };
  let out = text.replace(/\u{1F595}/gu, () => { hit = true; return "*"; }).replace(/[\p{L}\p{N}@$!|+*.]+/gu, (tok) => {
    const core = tok.replace(/^[.!*]+|[.!*]+$/g, "");
    const word = core && badWord(core);
    if (word) return tok.replace(core, star(core, word));
    // f.u.c.k: letters with dots between
    const dotted = /^(\p{L}[.*]){2,}\p{L}?$/u.test(core) && badWord(core.replace(/[.*]/g, ""));
    if (dotted) return star(core, dotted);
    return tok;
  });
  // f u c k: single letters with spaces between
  out = out.replace(/\b(?:\p{L} ){2,}\p{L}\b/gu, (run) => { const w = badWord(run.replace(/ /g, "")); return w ? star(run.replace(/ /g, ""), w) : run; });
  const flat = " " + norm(text) + " ";
  const phrase = PHRASES.find((p) => flat.includes(" " + p + " ") || flat.includes(" " + squeeze(p, 1) + " "));
  return { text: out, hit, worst, phrase: phrase || null };
}

/* ---------- the model, in its worker ---------- */
function available() {
  return fs.existsSync(MODEL) && fs.existsSync(VOCAB) && !!ortPath();
}

if (isMainThread) {
  let worker = null, seq = 0, idle = null;
  const waiting = new Map();
  function start() {
    if (worker) return worker;
    if (!available()) return null;
    worker = new Worker(__filename);
    worker.unref();   // it never keeps the server up on its own
    worker.on("message", ({ id, scores }) => { const w = waiting.get(id); if (w) { waiting.delete(id); w(scores); } });
    const lost = () => { worker = null; for (const w of waiting.values()) w(null); waiting.clear(); };
    worker.on("error", lost);
    worker.on("exit", lost);
    return worker;
  }
  // Let the model go once nobody has typed for a while (each server keeps ~150 MB less).
  function rest() {
    clearTimeout(idle);
    idle = setTimeout(() => { if (worker && !waiting.size) { const w = worker; worker = null; w.terminate(); } }, IDLE_MS);
    idle.unref();
  }
  /* The model's six readings for text ({ toxic, ... }), or null. */
  function scores(text, timeoutMs = 3000) {
    const w = start();
    if (!w) return Promise.resolve(null);
    rest();
    const id = ++seq;
    return new Promise((resolve) => {
      const t = setTimeout(() => { if (waiting.delete(id)) resolve(null); }, timeoutMs);
      waiting.set(id, (s) => { clearTimeout(t); resolve(s); });
      w.postMessage({ id, text });
    });
  }
  /* A message as it may be shown: { text, held, reason }. text is null when held back (reason: the reading, or
     "phrase"); else the text with any bad word starred (reason "words") or as it was (reason null). */
  async function check(text) {
    text = String(text == null ? "" : text);
    if (!text.trim()) return { text, held: false, reason: null };
    const w = starWords(text);
    if (w.phrase) return { text: null, held: true, reason: "phrase" };
    if (w.worst) return { text: null, held: true, reason: "words" };
    const s = await scores(text);
    const game = norm(text).split(" ").some((t) => GAME_WORDS.has(t));
    if (s) for (const [k, at] of Object.entries(HOLD)) {
      if (s[k] >= (k === "threat" && game ? GAME_THREAT : at)) return { text: null, held: true, reason: k, scores: s };
    }
    return { text: w.text, held: false, reason: w.hit ? "starred" : null, scores: s };
  }
  /* A name may be used as it is (no bad word, nothing the model would hold back, no starring needed). */
  async function nameOk(name) {
    const r = await check(name);
    return !r.held && r.reason !== "starred";
  }
  const REMOVED = "(message removed)";
  /* Chat as it may be shown: the text starred where it must be, or "(message removed)". */
  async function chat(text) {
    const r = await check(text);
    return r.held ? REMOVED : r.text;
  }
  /* Short things on the spot, with the words alone (no model): a name, a clue, a custom word. clean(text): null if it
     has a word that is not plain swearing or a phrase that holds a message back, else the text starred. */
  function clean(text) {
    const w = starWords(String(text == null ? "" : text));
    return w.phrase || w.worst ? null : w.text;
  }
  // Inside a name with no spaces (xXsh1tXx), the strongest only: none that hides in an ordinary name (Scunthorpe,
  // Hancock, Dickens, Grape).
  const IN_NAMES = ["fuck", "shit", "nigg", "fagg", "faggot", "whore", "slut", "bitch", "kike", "retard", "nazi", "hitler", "rapist", "pedo"];
  /* A player's name: the name, or fallback if it has any bad word at all. */
  function name(n, fallback = "Player") {
    const w = starWords(String(n == null ? "" : n));
    if (w.hit || w.phrase) return fallback;
    const flat = norm(String(n == null ? "" : n)).replace(/ /g, "");
    const squeezed = flat.replace(/(.)\1+/g, "$1");
    return IN_NAMES.some((b) => flat.includes(b) || squeezed.includes(b)) ? fallback : n;
  }
  module.exports = { check, chat, clean, name, nameOk, starWords, scores, available, HOLD, norm, REMOVED };
} else {
  const ort = require(ortPath());
  const tok = require(path.join(__dirname, "moderation_tok.js")).load(VOCAB);
  let session = null;
  let queue = Promise.resolve();
  parentPort.on("message", ({ id, text }) => {
    queue = queue.then(async () => {
      try {
        if (!session) session = await ort.InferenceSession.create(MODEL);
        const ids = tok.encode(text, 128), n = ids.length;
        const t = (a) => new ort.Tensor("int64", BigInt64Array.from(a.map(BigInt)), [1, n]);
        const out = await session.run({ input_ids: t(ids), attention_mask: t(ids.map(() => 1)), token_type_ids: t(ids.map(() => 0)) });
        const lg = Object.values(out)[0].data;
        parentPort.postMessage({ id, scores: Object.fromEntries(LABELS.map((l, i) => [l, 1 / (1 + Math.exp(-lg[i]))])) });
      } catch (e) {
        parentPort.postMessage({ id, scores: null });
      }
    });
  });
}
