/* Voice chat in private rooms (the voice lane, 2026-11-18). The same file in every GameNest room server (like reactions.js and plus.js).

   Voice is Epic Online Services (EOS) RTC, free. The app logs in to EOS with a device id (no Epic account) and gets a ProductUserId (PUID).
   To talk in a room it needs a room token, and only THIS server hands one out (the client never holds a secret):

     app  --"gnVoiceJoin" { puid }-->  server  (the socket must be a seated human in a PRIVATE room, voice must be configured)
     server --POST /auth/v1/oauth/token (client credentials)--> EOS      (the access token is kept until it nearly expires)
     server --POST /rtc/v1/{deploymentId}/room/{roomId} { participants: [{ puid, hardMuted: false }] }--> EOS
     server --"gnVoiceToken" { ok, roomName, clientBaseUrl, token }--> that socket only

   The EOS room name is "gn-<room code>-<salt>", the salt a random per-room string made here, so a code alone never names a voice room.
   Never issued for quick match / public / ranked rooms (room.quick), never for a spectator, a bot or a seat that left, never when the
   env below is missing (the app then hides its mic key).

   The state carries  gnVoice: { on, peers: [{ seat, puid }] }  (after every older field): on = this room may use voice; peers = the seats
   that joined it and their PUID, which is how the app knows whose ring to light when EOS says a PUID is talking. A seat that left or
   disconnected drops out of peers by itself (view() filters), so no hook is needed on leave.

   Env: EOS_SERVER_CLIENT_ID, EOS_SERVER_CLIENT_SECRET, EOS_DEPLOYMENT_ID (all three, else voice is off). EOS_API_BASE overrides
   https://api.epicgames.dev for tests. One request per player per 3 s and 30 per hour per player; anything else is dropped without a word. */
"use strict";

const crypto = require("crypto");

const PUID_RE = /^[0-9a-f]{32}$/;
const GAP_MS = 3000, HOUR_MAX = 30, HOUR_MS = 3600e3;
const PEERS_MAX = 12;

const cfg = { fetch: null, env: null, now: null };
function env(name) { return String((cfg.env ? cfg.env[name] : process.env[name]) || "").trim(); }
function now() { return cfg.now ? cfg.now() : Date.now(); }
function doFetch(...a) { return (cfg.fetch || globalThis.fetch)(...a); }
function apiBase() { return (env("EOS_API_BASE") || "https://api.epicgames.dev").replace(/\/$/, ""); }

/* Whether the three keys are set: the one switch. */
function configured() { return !!(env("EOS_SERVER_CLIENT_ID") && env("EOS_SERVER_CLIENT_SECRET") && env("EOS_DEPLOYMENT_ID")); }

/* Voice only in a room friends made by themselves: a quick match or ranked room is a public one (room.quick), and a room a game marks public/ranked is too. */
function isPrivate(room) { return !!room && !room.quick && !room.public && !room.ranked; }
function mayUse(room) { return configured() && isPrivate(room); }

function ensure(room) {
  if (!room) return room;
  if (!room._voice) room._voice = { salt: crypto.randomBytes(6).toString("hex"), puid: new Map(), asked: new Map() };
  return room;
}

function roomName(room) {
  ensure(room);
  return `gn-${String(room.code || room.roomCode || "").toUpperCase()}-${room._voice.salt}`;
}

function seatOfPlayer(room, id) {
  const players = (room && room.players) || [];
  return players.findIndex((p) => p && p.id === id);
}

/* What the state carries. Peers: the seats whose player is a connected, present human who joined voice. */
function view(room) {
  if (!room) return { gnVoice: { on: false, peers: [] } };
  const on = mayUse(room);
  const peers = [];
  if (on && room._voice) {
    const players = room.players || [];
    for (const [id, puid] of room._voice.puid) {
      const seat = seatOfPlayer(room, id);
      const p = players[seat];
      if (seat < 0 || !p || p.bot || p.left || p.connected === false) continue;
      peers.push({ seat, puid });
      if (peers.length >= PEERS_MAX) break;
    }
  }
  return { gnVoice: { on, peers } };
}

/* ---------- EOS Web API ---------- */
let tokenCache = null;   // { token, until }

async function accessToken() {
  if (tokenCache && tokenCache.until > now() + 60e3) return tokenCache.token;
  const basic = Buffer.from(`${env("EOS_SERVER_CLIENT_ID")}:${env("EOS_SERVER_CLIENT_SECRET")}`).toString("base64");
  const res = await doFetch(`${apiBase()}/auth/v1/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${basic}` },
    body: new URLSearchParams({ grant_type: "client_credentials", deployment_id: env("EOS_DEPLOYMENT_ID") }).toString(),
  });
  if (!res.ok) throw new Error("eos auth " + res.status);
  const j = await res.json();
  if (!j || typeof j.access_token !== "string") throw new Error("eos auth: no token");
  tokenCache = { token: j.access_token, until: now() + Math.max(120, Number(j.expires_in) || 3600) * 1000 };
  return tokenCache.token;
}

/* One participant's token for one room: { roomName, clientBaseUrl, token }. Throws on any failure (the caller says "off"). */
async function requestToken(name, puid) {
  const post = async () => {
    const access = await accessToken();
    return doFetch(`${apiBase()}/rtc/v1/${encodeURIComponent(env("EOS_DEPLOYMENT_ID"))}/room/${encodeURIComponent(name)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
      body: JSON.stringify({ participants: [{ puid, hardMuted: false }] }),
    });
  };
  let res = await post();
  if (res.status === 401) { tokenCache = null; res = await post(); }   // the access token went stale
  if (!res.ok) throw new Error("eos room " + res.status);
  const j = await res.json();
  const part = j && Array.isArray(j.participants) ? j.participants.find((p) => p && p.puid === puid) : null;
  if (!part || typeof part.token !== "string" || typeof j.clientBaseUrl !== "string") throw new Error("eos room: bad answer");
  return { roomName: typeof j.roomId === "string" && j.roomId ? j.roomId : name, clientBaseUrl: j.clientBaseUrl, token: part.token };
}

/* A seated human in this room may ask: the seat's player and the limits. Returns the player or null. */
function asker(room, playerId) {
  const p = (room.players || []).find((q) => q && q.id === playerId);
  if (!p || p.bot || p.left) return null;
  return p;
}

function limited(room, playerId) {
  const a = room._voice.asked, t = now();
  const rec = a.get(playerId) || { last: 0, times: [] };
  rec.times = rec.times.filter((x) => t - x < HOUR_MS);
  if (rec.last && t - rec.last < GAP_MS) return true;
  if (rec.times.length >= HOUR_MAX) return true;
  rec.last = t; rec.times.push(t);
  a.set(playerId, rec);
  return false;
}

/* The two messages, wired once per socket:  on  the server's guarded on(); room()  the socket's room now; me()  its player id; bump(room)  everyone's new state;
   emit(event, payload)  to this socket only. */
function wire({ on, room, me, bump, emit }) {
  on("gnVoiceJoin", async ({ puid } = {}) => { try {   // async: the guard cannot catch what is thrown after an await, so everything is inside this try
    const r = room(); if (!r) return;
    if (!mayUse(r)) { emit("gnVoiceToken", { ok: false, off: true }); return; }
    const id = me();
    if (!asker(r, id) || typeof puid !== "string" || !PUID_RE.test(puid)) return;
    ensure(r);
    // One PUID, one seat: a PUID another player of this room already holds is refused.
    for (const [other, p] of r._voice.puid) { if (p === puid && other !== id) return; }
    if (limited(r, id)) return;
    let got;
    try { got = await requestToken(roomName(r), puid); }
    catch (e) { console.error(`[${new Date().toISOString()}] voice token failed: ${e && e.message}`); emit("gnVoiceToken", { ok: false }); return; }
    if (!room() || room() !== r || !asker(r, id)) return;   // left while EOS answered
    r._voice.puid.set(id, puid);
    emit("gnVoiceToken", { ok: true, roomName: got.roomName, clientBaseUrl: got.clientBaseUrl, token: got.token });
    if (bump) bump(r);
  } catch (e) { console.error(`[${new Date().toISOString()}] gnVoiceJoin failed:`, (e && e.stack) || e); } });
  on("gnVoiceLeave", () => {
    const r = room(); if (!r || !r._voice) return;
    if (r._voice.puid.delete(me()) && bump) bump(r);
  });
}

/* Tests: swap the network, the environment and the clock. */
function configure(o) { cfg.fetch = (o && o.fetch) || null; cfg.env = (o && o.env) || null; cfg.now = (o && o.now) || null; tokenCache = null; }

module.exports = { configured, isPrivate, mayUse, ensure, roomName, view, wire, requestToken, configure, PUID_RE };
