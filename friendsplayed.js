/* "Last played with" for the Friends service (launch lane, 2026-11-19). The same file in every GameNest room server (like reactions.js and voice.js).

   When a game in a room ends, the server tells the friends service which accounts sat in it, so a friends list can say "last played Ludo".
   The service only touches pairs that are ALREADY friends (UPDATE friendships ...); it learns nothing about strangers and stores no room code.

     room server --POST {FRIENDS_INTERNAL_URL}/internal/played  { game, accounts:[uuid...] }  X-GN-Internal: <secret>--> friends service

   - Off unless FRIENDS_INTERNAL_URL and a secret (FRIENDS_INTERNAL_SECRET, else GN_INTERNAL_SECRET: 16+ characters) are set: then nothing is sent and
     the server behaves exactly as before.
   - Counted: the humans who sat in the game (one who left mid-game still played it), each account once, at least two of them (bots have no account). One report per finished game:
     view() is called every time the room's state is built; the first time it sees room.status === "over" it reports, and it re-arms when the room leaves "over"
     (a rematch). It only ever returns {} so it can sit in the state spread.
   - Fire and forget, 3 s timeout, never throws, never blocks a state: a friends outage costs nothing but the "last played" line.
   - The game names are the friends service's own: ludo snakes eights rummy four chess mafia wordspies punchlines golf bowling brawl soccer carrom pool. */
"use strict";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cfg = { fetch: null, env: null };
function env(name) { return String((cfg.env ? cfg.env[name] : process.env[name]) || "").trim(); }
function secret() { const s = env("FRIENDS_INTERNAL_SECRET") || env("GN_INTERNAL_SECRET"); return s.length >= 16 ? s : ""; }
function base() { return env("FRIENDS_INTERNAL_URL").replace(/\/$/, ""); }
function configured() { return !!(base() && secret()); }

/* The distinct accounts of the humans seated in the room (a bot has none). */
function accounts(room) {
  const seen = new Set();
  for (const p of (room && room.players) || []) {
    if (!p || p.bot || typeof p.acct !== "string" || !UUID_RE.test(p.acct)) continue;
    seen.add(p.acct.toLowerCase());
    if (seen.size >= 12) break;
  }
  return [...seen];
}

/* Sends one report; resolves to true when the friends service took it. Never rejects. */
async function report(game, room) {
  try {
    if (!configured()) return false;
    const ids = accounts(room);
    if (ids.length < 2) return false;
    const res = await (cfg.fetch || globalThis.fetch)(`${base()}/internal/played`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-GN-Internal": secret() },
      body: JSON.stringify({ game, accounts: ids }),
      signal: AbortSignal.timeout(3000),
    });
    return !!(res && res.ok);
  } catch { return false; }
}

/* In the state builder, beside Voice.view: ...Played.view(room, "ludo"). */
function view(room, game) {
  try {
    if (!room) return {};
    if (room.status === "over") {
      if (!room._played) { room._played = true; report(game, room); }
    } else if (room._played) room._played = false;
  } catch { /* never in the way of a state */ }
  return {};
}

/* Tests: swap the network and the environment. */
function configure(o) { cfg.fetch = (o && o.fetch) || null; cfg.env = (o && o.env) || null; }

module.exports = { configured, accounts, report, view, configure };
