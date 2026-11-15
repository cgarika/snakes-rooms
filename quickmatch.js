/* Quick play and ranked (2026-10-24). The same file (with ranked.js and rating_vendor.js) in every GameNest room server.

   QUICK PLAY. A client sends "quick" with what it would send on create/join (name, playerId, avatar, plus, look,
   caps). The server puts it into an open public quick room for this game, or makes one. The room is a normal lobby
   room (it has a code, a host and chat); room.quick = { seats, fillAt, searching } marks it. When fillAt comes (about
   QUICK_FILL_MS, 2.5 s, after the first player), the empty seats fill with the game's own bots and the host's "start" runs.
   A room that fills with humans starts at once. "quickCancel" (or the existing "leave") takes a player out.
   It works by calling the server's own create/join/addBot/start handlers, recorded by hook(), so every game's rules
   stay where they were; nothing here knows a game.

   RANKED. After a game ends (room.status "over") the finished game is settled once into ranked.js (Glicko-2 for
   two-player games, OpenSkill for three or more) and room.rated carries each human's before/after for the clients.
   GET <base>/rank/:player and GET <base>/leaderboard?player=<id> serve the ladder.

   Wiring in a server (three lines): init() once before io.on("connection"), hook() and connection() first thing in the
   connection handler, ...view(room) in the state sent to clients. tools/apply_quick.py does it. */
"use strict";

const { Ratings, tierOf } = require("./ranked");

/* Pacing round 1 (2026-11-01): a solo player who taps QUICK PLAY is in a game within five seconds. The wait for people was
   7 s (and the phone's log put the first move 11 s after the tap); it is 2.5 s now, the time the app's countdown shows,
   and a person who arrives during it adds 1 s to it (never past 4.5 s from the first player's tap). A full room starts in
   0.6 s. QUICK_FILL_MS and the others still set these per server. */
const FILL_MS = Math.max(300, Number(process.env.QUICK_FILL_MS || 2500));
const FILL_MAX_MS = Math.max(FILL_MS, Number(process.env.QUICK_FILL_MAX_MS || 4500));
const JOIN_BUMP_MS = Math.max(0, Number(process.env.QUICK_JOIN_BUMP_MS || 1000));
const FULL_START_MS = Math.max(0, Number(process.env.QUICK_FULL_START_MS || 600));

let cfg = null;
let ratings = null;
const fillTimers = new Map();

/** Remember every handler the server registers on this socket, so create/join/addBot/start can be called later on that
    socket's behalf. Call first thing in io.on("connection"), before the server registers its own events. */
function hook(socket) {
  socket.data = socket.data || {};
  const h = (socket.data.__h = {});
  const orig = socket.on.bind(socket);
  socket.on = (event, fn) => { if (typeof fn === "function") h[event] = fn; return orig(event, fn); };
}
const codeOf = (socket) => socket.data[cfg.codeKey || "roomCode"];

function defaultWinners(room) {
  if (Array.isArray(room.winners)) return room.winners.filter((s) => Number.isInteger(s) && s >= 0 && s < room.players.length);
  const w = room.winner;
  return Number.isInteger(w) && w >= 0 && w < room.players.length ? [w] : [];
}

/** Is this finished room one that counts? */
function ratable(room) {
  const live = room.players.filter((p) => !p.left || p.bot);
  const humans = room.players.filter((p) => !p.bot);
  if (!humans.length) return false;
  if (cfg.model === "glicko") return room.players.length === 2;
  if (room.players.length < 2) return false;
  void live;
  return true;
}

function init(opts) {
  cfg = Object.assign({ model: "openskill", seats: 2, winners: defaultWinners, rated: null }, opts);
  ratings = new Ratings({ game: cfg.game, model: cfg.model, dir: opts.dir });
  const { app, base } = cfg;
  const b = base || "";
  if (app) {
    const cors = (res) => res.set("Access-Control-Allow-Origin", "*");
    app.get(b + "/rank/:player", (req, res) => { cors(res); const id = Ratings.cleanId(req.params.player); res.json(ratings.profile(id || "none")); });
    app.get(b + "/leaderboard", (req, res) => { cors(res); const id = Ratings.cleanId(String(req.query.player || "")); res.json(ratings.leaderboard(id)); });
  }
  const scan = setInterval(settleScan, 500);
  if (scan.unref) scan.unref();
  return module.exports;
}

function settleScan() {
  for (const room of cfg.rooms.values()) {
    if (room.status !== "over") { if (room._rated) room._rated = false; continue; }
    if (room._rated) continue;
    room._rated = true;
    try { settleRoom(room); } catch (e) { console.error("settle failed:", (e && e.stack) || e); }
  }
}

function settleRoom(room) {
  if (room.rated) room.rated = null;
  if (!ratable(room) || (cfg.rated && !cfg.rated(room))) return;
  const winners = cfg.winners(room);
  const seats = room.players.map((p) => ({ id: p.id, bot: !!p.bot, name: p.name, avatar: typeof p.avatar === "string" ? p.avatar : "" }));
  const res = ratings.settle(seats, { winners }, {});
  if (!res.length) return;
  room.rated = { v: (room.v || 0) + 1, at: Date.now(), results: res.map((r) => ({ seat: r.seat, before: r.before, after: r.after, delta: r.delta, tier: r.tier, division: r.division, label: r.label, tierUp: r.tierUp, tierBefore: r.tierBefore, provisional: r.provisional })) };
  room.v = (room.v || 0) + 1;
  if (cfg.broadcast) cfg.broadcast(room.code);
}

/** Fields to spread into the state sent to clients. */
function view(room) {
  const out = {};
  if (room.quick) out.quick = { searching: room.status === "lobby" && !room.quick.done, seats: room.quick.seats, fillAt: room.quick.fillAt || 0, now: Date.now() };
  if (ratings) {
    out.ranked = room.players.map((p) => (p.bot ? null : ratings.brief(p.id)));
    out.rankedModel = cfg.model;
    out.rankedOn = ratable(room) && !(cfg.rated && !cfg.rated(room));   // this room's result will count
    if (room.rated) out.rated = room.rated;
  }
  return out;
}

function humansOf(room) { return room.players.filter((p) => !p.bot && !p.left); }

function findOpen(playerId, payload) {
  let best = null;
  for (const room of cfg.rooms.values()) {
    if (!room.quick || room.quick.done || room.status !== "lobby") continue;
    const humans = humansOf(room);
    if (humans.length >= room.quick.seats || room.players.length >= room.quick.seats) continue;
    if (playerId && room.players.some((p) => p.id === playerId)) continue;
    if (cfg.accept && !cfg.accept(room, payload || {})) continue;   // the game's own say (gear bands, 2026-11-08); a server without `accept` is unchanged
    if (!best || (room.quick.at || 0) < (best.quick.at || 0)) best = room;
  }
  return best;
}

function hostCtx(room) {
  for (const s of cfg.io.sockets.sockets.values()) {
    if (s.data && s.data.__h && s.data.playerId === room.host && codeOf(s) === room.code) return s;
  }
  return null;
}

function armFill(room) {
  clearTimeout(fillTimers.get(room.code));
  const t = setTimeout(() => fill(room.code), Math.max(0, room.quick.fillAt - Date.now()));
  fillTimers.set(room.code, t);
}

/** Fill the empty seats with bots and start. Runs as the host's socket, through the game's own handlers. */
function fill(code) {
  fillTimers.delete(code);
  const room = cfg.rooms.get(code);
  if (!room || !room.quick || room.quick.done || room.status !== "lobby") return;
  const s = hostCtx(room);
  if (!s) {   // the host's socket is gone; try again shortly, or give the room up
    if (!humansOf(room).length) return;
    room.quick.fillAt = Date.now() + 500; return armFill(room);
  }
  const h = s.data.__h;
  let guard = 0;
  while (room.players.length < room.quick.seats && guard++ < 12) {
    const n = room.players.length;
    h.addBot({});
    if (room.players.length === n) break;
  }
  room.quick.done = true;
  h.start({});
  if (room.status === "lobby") { room.quick.done = false; room.quick.fillAt = Date.now() + 1500; if (humansOf(room).length) armFill(room); return; }
  if (cfg.broadcast) cfg.broadcast(code);
}

function connection(socket) {
  const on = (event, fn) => socket.on(event, (payload) => {
    try { fn(payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {}); }
    catch (e) { console.error(`[${new Date().toISOString()}] ${event} failed:`, (e && e.stack) || e); }
  });
  on("quick", (payload) => {
    if (codeOf(socket) && cfg.rooms.get(codeOf(socket))) return;   // already in a room
    const h = socket.data.__h;
    if (!h || !h.create || !h.join) return;
    delete payload.crew;   // a Plus crew code is for a room a friend is waiting to join, not a public one
    const playerId = typeof payload.playerId === "string" ? payload.playerId : null;
    const open = findOpen(playerId, payload);
    if (open) {
      h.join(Object.assign({}, payload, { code: open.code }));
      const room = cfg.rooms.get(codeOf(socket));
      if (!room || room !== open) return;
      const humans = humansOf(room).length;
      if (humans >= room.quick.seats || room.players.length >= room.quick.seats) {
        room.quick.fillAt = Date.now() + FULL_START_MS;
      } else {
        room.quick.fillAt = Math.min(Math.max(room.quick.fillAt, Date.now() + JOIN_BUMP_MS), (room.quick.at || Date.now()) + FILL_MAX_MS);
      }
      armFill(room);
    } else {
      h.create(payload);
      const room = cfg.rooms.get(codeOf(socket));
      if (!room) return;
      room.quick = { at: Date.now(), seats: cfg.seats, fillAt: Date.now() + FILL_MS, done: false };
      room.log = "Finding players…";
      armFill(room);
    }
    const room = cfg.rooms.get(codeOf(socket));
    if (room) { room.v = (room.v || 0) + 1; if (cfg.broadcast) cfg.broadcast(room.code); }
  });
  on("quickCancel", () => {
    const room = cfg.rooms.get(codeOf(socket));
    if (!room || !room.quick || room.status !== "lobby") return;
    const h = socket.data.__h;
    if (h && h.leave) h.leave({});
  });
}

function stop() { for (const t of fillTimers.values()) clearTimeout(t); fillTimers.clear(); }

module.exports = { init, hook, connection, view, defaultWinners, ratable, stop, tierOf, get ratings() { return ratings; }, _settleScan: settleScan };
