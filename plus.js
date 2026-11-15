/* GameNest Plus in the room (the owner, 2026-10-16: "add all of them"). The same file in every GameNest room server,
   like reactions.js; this copy in gamenest-unreal's Tools/servers is the one the others are copied from.

   A player says on create and join that they own Plus, and what they picked in the app's look locker: { ball, trail,
   frame, cheer }. Each player's view carries both back (seat), so every app can draw everyone's ball and frame; the app
   shows a pick only in a Plus room (UGameNestRoom::GetSeatLook), so nothing here changes how a game plays.
   A room is a Plus room while any human player in it owns Plus (the Jackbox way: the host's Plus is the room's). One
   who left still counts, as they do in the app (their seat stays in players): a game that began Plus ends Plus.
   Plus-only room options go through gate(): what was asked for in a Plus room, the free choice anywhere else.
   Who owns Plus is no longer the client's word (Nest Wallet, 2026-11): the app sends the signed entitlement it holds, `entitlement`, an EdDSA token the wallet
   makes from Apple's own records; this file checks it against the wallet's public key(s) and takes the account id from it (`acct`, which Treat the room needs
   from every seat, Plus or not). One choke point does it: guarded() calls vouch(payload, socket) first, so no handler ever sees a `plus` that was not checked.
   The old way still works while no key is configured (WALLET_PUBKEYS / WALLET_PUBKEYS_FILE), so this file can ship ahead of the wallet; with keys but not
   WALLET_ENFORCE=1 a bare `plus: true` is still taken and counted (stats()); with WALLET_ENFORCE=1 only a valid token makes Plus. */
"use strict";

const crypto = require("crypto");
const fs = require("fs");

const LOOKS = Object.freeze({
  ball: Object.freeze(["classic", "galaxy", "lava", "disco", "gold", "watermelon", "ice"]),
  trail: Object.freeze(["none", "neon", "spark", "rainbow", "fire"]),
  frame: Object.freeze(["none", "gold", "neon", "flame", "crown"]),
  cheer: Object.freeze(["classic", "confetti", "fireworks", "goldrain"]),
  // The owner's "yes to all four" (2026-10-17, ref/plus2): chess piece sets, card backs and felts, dice. A table draws
  // one of each, the host's pick (else the first player's who made one), in a Plus room.
  chess: Object.freeze(["toy", "wizard", "crystal", "gold"]),
  cards: Object.freeze(["classic", "royal", "galaxy", "neon", "paisley"]),
  felt: Object.freeze(["classic", "emerald", "midnight", "rose"]),
  dice: Object.freeze(["classic", "gold", "galaxy", "lava", "candy", "crystal", "wooden"]),
  // The owner's "yes to the more looks" (2026-10-18, ref/plus2/more_looks.png): each its own game's, drawn for the table.
  pawns: Object.freeze(["classic", "knights", "gems", "robots", "royals"]),
  // The owner's "build exactly the pictures" (2026-11-05): Snakebite's two boards (the Maharaja's Palace free, Pharaoh's Gold Plus; the old classic, candy and space boards are gone: a stale pick is the Palace) and Drop Four's two rooms.
  snakes: Object.freeze(["palace", "pharaoh"]),
  mafia: Object.freeze(["classic", "noir", "royal", "neon"]),
  spies: Object.freeze(["classic", "ocean", "midnight"]),
  four: Object.freeze(["zen", "crystal"]),
});
const DEFAULT_LOOK = Object.freeze(Object.fromEntries(Object.entries(LOOKS).map(([k, ids]) => [k, ids[0]])));

/* Any look in, a clean one out: every slot present, an unknown id (or anything that isn't a string) the default. */
function cleanLook(look) {
  const src = look && typeof look === "object" ? look : {};
  const out = {};
  for (const [k, ids] of Object.entries(LOOKS)) out[k] = ids.includes(src[k]) ? src[k] : ids[0];
  return out;
}

/* The host's pick of the table's look in the lobby (the owner, 2026-11-05: Drop Four's Zen Garden or Crystal Atrium, Snakebite's Palace or Pharaoh's Gold). Only a table's slot (the ones a table
   draws as one: not a player's ball or frame), only the host's own, only in a Plus room, only before the game starts. It sets the host's look (the table draws the host's), so every app
   redraws the table from the state it gets next. True when something changed. */
const TABLE_SLOTS = Object.freeze(["four", "snakes"]);
function pickLook(room, playerId, slot, id) {
  if (!room || room.status !== "lobby" || !room.host || room.host !== playerId || !isPlusRoom(room)) return false;
  if (typeof slot !== "string" || !TABLE_SLOTS.includes(slot) || !LOOKS[slot].includes(id)) return false;
  const p = (room.players || []).find((q) => q && q.id === playerId && !q.bot);
  if (!p) return false;
  const now = cleanLook(p.look);
  if (now[slot] === id) return false;
  p.look = { ...now, [slot]: id };
  return true;
}

/* A create, join or rejoin's payload onto its player (or waiting-line entry). A payload that went through vouch() carries its checked claim; any other is
   checked here (its `entitlement`, else, while the wallet is not enforced, its bare `plus`). */
function stamp(p, payload) {
  if (!p) return p;
  const src = payload && typeof payload === "object" ? payload : {};
  return applyClaim(p, src[VOUCHED] || claimOf(src), src.look);
}

/* The same for a server that rebuilds the payload before it stamps ({ plus, look }): the checked claim is on the socket, put there by vouch(). With no claim on
   the socket (vouch never ran for it) the payload is checked like any other, so the safe answer is the default. */
function stampFor(p, said, socket) {
  if (!p) return p;
  const src = said && typeof said === "object" ? said : {};
  const d = (socket && socket.data) || {};
  const claim = d.plusVia ? { plus: d.plus === true, acct: d.acct || null, via: d.plusVia } : src[VOUCHED] || claimOf(src);
  return applyClaim(p, claim, src.look);
}

/* Puts a checked claim on a player. A seat that proved Plus with a token keeps it when a later rejoin brings no proof at all (the token had run out while the
   game went on): a game that began Plus ends Plus. A token that says no Plus does take it away. */
function applyClaim(p, claim, look) {
  const keep = claim.via === "none" && p.plus === true && p.plusVia === "token";
  p.plus = keep ? true : claim.plus === true;
  if (claim.via === "token") {
    p.acct = claim.acct;
    p.plusVia = "token";
  } else if (!keep) {
    p.plusVia = claim.via;
  }
  p.look = cleanLook(look);
  return p;
}

/* What a player's view carries: spread into it ({ ...Plus.seat(p) }). A bot never owns Plus. */
function seat(p) {
  return { plus: !!(p && p.plus && !p.bot), look: p && p.look ? p.look : DEFAULT_LOOK };
}

function isPlusRoom(room) {
  return !!(room && Array.isArray(room.players) && room.players.some((p) => p && p.plus && !p.bot));
}

/* A Plus-only option: what was asked for in a Plus room, the free value anywhere else. */
function gate(room, wanted, free) {
  return isPlusRoom(room) ? wanted : free;
}

/* GameNest Plus's crew code (2026-10-17): a Plus player's own room code, the same every time they host, so their
   friends always join with it. Six of the codes' letters (no 0, O, 1, I). Theirs when they create a room and no room
   has it now; else the room takes a code of its own as ever (fallback()). */
const CREW = /^[A-HJ-NP-Z2-9]{6}$/;
function crewCode({ plus, crew } = {}, rooms, fallback) {
  const want = typeof crew === "string" ? crew.trim().toUpperCase() : "";
  if (plus === true && CREW.test(want) && !(rooms && rooms.has(want))) return want;
  return fallback();
}

/* The room's own flag, for the state (the app also works it out from the players). */
function view(room) {
  return { plusRoom: isPlusRoom(room) };
}

/* ---- The Nest Wallet's signed entitlement ---------------------------------------------------------------------------------------------------------
   Token (compact, three dot-separated base64url parts): header { alg: "EdDSA", typ: "GNE", kid } . claims { v: 1, acct, plus: 0|1, iat, exp } . signature.
   The wallet holds the private key; a room server holds only public keys, several at once by kid so a key can be rotated with no downtime:
     WALLET_PUBKEYS_FILE=/path/to/wallet_pubkeys.json     { "<kid>": "-----BEGIN PUBLIC KEY-----..." }   (re-read when it changes, at most once a minute)
     WALLET_PUBKEYS='{"<kid>":"<pem>"}'                   the same inline (tests, containers)
     WALLET_ENFORCE=1                                     only a valid token makes Plus; without it a bare `plus: true` is still taken (and counted)
     GN_INTERNAL_SECRET=<16+ characters>                  the shared secret of the wallet's roster call (rosterHandler); unset: the route answers 404
   Only EdDSA is accepted: never "none", never a shared secret. */
const VOUCHED = Symbol.for("gamenest.plus.vouched");   // a checked claim rides on a payload under this key; JSON from a client can never carry a symbol
const KEY_REFRESH_MS = 60 * 1000;
const ACCT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const stats = { token: 0, legacy: 0, none: 0, badToken: 0 };
let override = null;                          // configure() for tests: { keys, enforce, now }
let keyCache = { at: 0, sig: "", keys: [] };

const b64uDecode = (s) => Buffer.from(String(s).replace(/-/g, "+").replace(/_/g, "/"), "base64");

function parseKeys(raw) {
  let map;
  try { map = typeof raw === "string" ? JSON.parse(raw) : raw; } catch { return []; }
  if (!map || typeof map !== "object") return [];
  const out = [];
  for (const [kid, pem] of Object.entries(map)) {
    try { out.push({ kid, key: typeof pem === "string" ? crypto.createPublicKey(pem) : pem }); } catch { /* a bad key is no key */ }
  }
  return out;
}

/* The public keys now in force: [{ kid, key }], [] when none is configured (the old way). */
function walletKeys(force) {
  if (override && override.keys) return override.keys;
  const t = Date.now();
  if (!force && keyCache.at && t - keyCache.at < KEY_REFRESH_MS) return keyCache.keys;
  let raw = process.env.WALLET_PUBKEYS || "";
  if (!raw && process.env.WALLET_PUBKEYS_FILE) {
    try { raw = fs.readFileSync(process.env.WALLET_PUBKEYS_FILE, "utf8"); } catch { raw = ""; }
  }
  if (raw !== keyCache.sig) keyCache = { at: t, sig: raw, keys: raw ? parseKeys(raw) : [] };
  else keyCache.at = t;
  return keyCache.keys;
}

const enforced = () => (override && override.enforce !== undefined ? !!override.enforce : process.env.WALLET_ENFORCE === "1");
const nowSec = () => Math.floor(((override && override.now ? override.now() : Date.now())) / 1000);

/* The claims of a valid token, else null (any reason: malformed, wrong algorithm, unknown key, bad signature, expired, from the future). Never throws. */
function verifyEntitlement(token, keys, atSec) {
  if (typeof token !== "string" || token.length > 2048) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  let header;
  let claims;
  let sig;
  try {
    header = JSON.parse(b64uDecode(parts[0]).toString("utf8"));
    claims = JSON.parse(b64uDecode(parts[1]).toString("utf8"));
    sig = b64uDecode(parts[2]);
  } catch { return null; }
  if (!header || header.alg !== "EdDSA" || typeof header.kid !== "string") return null;
  const hit = (keys || walletKeys()).find((k) => k.kid === header.kid);
  if (!hit) return null;
  let ok = false;
  try { ok = crypto.verify(null, Buffer.from(parts[0] + "." + parts[1]), hit.key, sig); } catch { ok = false; }
  if (!ok) return null;
  const at = atSec === undefined ? nowSec() : atSec;
  if (!claims || claims.v !== 1 || typeof claims.acct !== "string" || !ACCT.test(claims.acct)) return null;
  if (!Number.isFinite(claims.exp) || at > claims.exp) return null;
  if (Number.isFinite(claims.iat) && claims.iat > at + 60) return null;
  return { acct: claims.acct, plus: claims.plus === 1, exp: claims.exp };
}

/* What a payload proves: { plus, acct, via }. via: "token" (a valid entitlement), "legacy" (the client's bare word, taken while the wallet is not enforced),
   "none" (nothing proved, and it is enforced). */
function claimOf(payload) {
  const src = payload && typeof payload === "object" ? payload : {};
  const keys = walletKeys();
  if (typeof src.entitlement === "string" && keys.length) {
    const c = verifyEntitlement(src.entitlement, keys);
    if (c) { stats.token += 1; return { plus: c.plus, acct: c.acct, via: "token" }; }
    stats.badToken += 1;
  }
  if (!keys.length || !enforced()) { stats.legacy += 1; return { plus: src.plus === true, acct: null, via: "legacy" }; }
  stats.none += 1;
  return { plus: false, acct: null, via: "none" };
}

/* True when this payload owns Plus (checked), for a place that has only the raw payload. */
function entitled(payload) {
  return claimOf(payload).plus;
}

/* The one choke point. Called with every client event's payload (the servers' guarded() already makes it a plain object): when it carries a Plus claim
   (`plus`, `entitlement` or `acct`) the claim is checked, `plus` is replaced by the checked answer, the client's own `acct` and the token are removed, and the
   result is kept on the socket (socket.data.plus / acct / plusVia) for stampFor and for the waiting line. Returns the same object. */
function vouch(payload, socket) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
  if (!("plus" in payload) && !("entitlement" in payload) && !("acct" in payload)) return payload;
  const claim = claimOf(payload);
  Object.defineProperty(payload, VOUCHED, { value: claim, enumerable: false, configurable: true });
  payload.plus = claim.plus;
  delete payload.acct;
  delete payload.entitlement;
  if (socket && socket.data) {
    socket.data.plus = claim.plus;
    socket.data.acct = claim.acct;
    socket.data.plusVia = claim.via;
  }
  return payload;
}

/* One line per server instead of one per handler: a socket.io packet middleware that vouches the payload of every incoming event, in place, before any
   handler (or the server's own guarded() wrapper) sees it. Call it first thing in io.on("connection", (socket) => { ... }). */
function guardSocket(socket) {
  socket.use((packet, next) => {
    try { vouch(packet && packet[1], socket); } catch { /* a payload that cannot be checked is left as it came: the handlers see no Plus (enforced) or the old word (not) */ }
    next();
  });
  return socket;
}

/* The checked account id on a socket, for a waiting-line entry (null when nothing was proved). */
function acctOf(socket) {
  return (socket && socket.data && socket.data.acct) || null;
}

/* One Plus account lights one seat: a second seat in a room that carries the same account is an ordinary seat (a token handed to friends gives them nothing). */
function dedupe(room, p) {
  if (!room || !p || !p.acct || !Array.isArray(room.players)) return p;
  if (room.players.some((q) => q && q !== p && q.id !== p.id && !q.bot && !q.left && q.acct === p.acct && q.plus)) p.plus = false;
  return p;
}

/* Who is at a table, for the wallet's Treat the room: GET /internal/roster/:code with the shared secret in X-GN-Internal.
   getRoom(code) -> the room or undefined. For express: app.get("/internal/roster/:code", Plus.rosterHandler((code) => rooms.get(code))).
   Without the secret (unset, short, or wrong) the route answers 404 as if it were not there; it names no one who has left, and no bot has an account. */
function rosterHandler(getRoom) {
  return (req, res) => {
    const secret = process.env.GN_INTERNAL_SECRET || "";
    const sent = String((req.headers && (req.headers["x-gn-internal"] || req.headers["X-GN-Internal"])) || "");
    const a = Buffer.from(sent);
    const b = Buffer.from(secret);
    if (secret.length < 16 || a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(404).end();
    const code = String((req.params && req.params.code) || "").toUpperCase();
    const room = /^[A-Z0-9]{3,12}$/.test(code) ? getRoom(code) : undefined;
    if (!room || !Array.isArray(room.players)) return res.status(404).json({ error: "room_not_found" });
    return res.json({
      players: room.players.filter((p) => p && !p.left).slice(0, 64).map((p) => ({ acct: p.bot ? null : p.acct || null, name: String(p.name || "").slice(0, 24), bot: !!p.bot })),
    });
  };
}

/* Counters for the server's own log line: how many claims were token, legacy, none, and how many tokens were bad. */
function walletStats() {
  return { ...stats, enforced: enforced(), keys: walletKeys().map((k) => k.kid) };
}

/* Tests: configure({ keys: { kid: pem }, enforce: true, now: () => ms }); configure() puts the environment back in charge. reloadKeys() re-reads the file now. */
function configure(o) {
  override = o ? { ...o, keys: o.keys ? parseKeys(o.keys) : undefined } : null;
  keyCache = { at: 0, sig: "", keys: [] };
  for (const k of Object.keys(stats)) stats[k] = 0;
}
function reloadKeys() {
  return walletKeys(true).map((k) => k.kid);
}

module.exports = {
  LOOKS, DEFAULT_LOOK, TABLE_SLOTS, cleanLook, pickLook, stamp, seat, isPlusRoom, gate, view, crewCode,
  // the wallet's entitlement
  stampFor, vouch, guardSocket, claimOf, entitled, acctOf, dedupe, rosterHandler, verifyEntitlement, walletStats, configure, reloadKeys, VOUCHED,
};
