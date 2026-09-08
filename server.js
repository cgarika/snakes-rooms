const http = require("http");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const { Server } = require("socket.io");

const app = express();
const BASE = (process.env.BASE_PATH || "").replace(/\/$/, "");
if (BASE) app.use((req, res, next) => { if (req.path === BASE) return res.redirect(301, BASE + "/"); next(); });
app.use(BASE || "/", express.static(path.join(__dirname, "public")));
const server = http.createServer(app);
const io = new Server(server, { path: BASE + "/socket.io", cors: { origin: true } });

const PORT = process.env.PORT || 3000;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const TURN_MS = Number(process.env.TURN_MS || 30000);
const AFK_MS = Math.max(200, Number(process.env.AFK_MS || 5000));   // T1: turn clock while the current player is disconnected
const TIMEOUTS_TO_BOT = 3;                                              // consecutive timeouts before a bot takes the seat
const BOT_MS = Math.max(1, Number(process.env.BOT_MS || 900));

const LADDERS = { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 };   // classic board (fallback)
const SNAKES = { 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78 };

/* T12: seeded board generator. The seed is drawn with crypto at game start and kept on the room, so a rejoin
   (and the tests) rebuild the identical board. 8 snakes + 8 ladders; no snake from 100; a ladder reaches 100
   only from 60 or above; every cell is the end of at most one feature and never both an end and a start. */
function genBoard(seed) {
  let ctr = 0;
  const next = () => { const h = crypto.createHash("sha256").update(seed + ":" + ctr++).digest(); return h.readUInt32BE(0) / 0x100000000; };
  const between = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
  for (let attempt = 0; attempt < 200; attempt++) {
    const used = new Set([1, 100]);   // cells taken by any endpoint (100 stays a plain finish, 1 stays the start)
    const ladders = {}, snakes = {};
    let ok = true;
    const place = (isLadder) => {
      for (let t = 0; t < 400; t++) {
        const from = isLadder ? between(2, 90) : between(20, 99);
        const span = between(8, isLadder ? 50 : 45);
        const to = isLadder ? from + span : from - span;
        if (to < 2 || to > 100) continue;
        if (isLadder && to === 100 && from < 60) continue;
        if (used.has(from) || used.has(to)) continue;
        const rowOf = (n) => Math.floor((n - 1) / 10);
        if (rowOf(from) === rowOf(to)) continue;   // a feature spans at least one row so it reads on the board
        used.add(from); used.add(to);
        (isLadder ? ladders : snakes)[from] = to;
        return true;
      }
      return false;
    };
    for (let i = 0; i < 8 && ok; i++) ok = place(true);
    for (let i = 0; i < 8 && ok; i++) ok = place(false);
    if (ok) return { ladders, snakes };
  }
  return { ladders: { ...LADDERS }, snakes: { ...SNAKES } };
}
function boardOf(room) { return { ladders: room.ladders || LADDERS, snakes: room.snakes || SNAKES }; }
const COLORS = ["#ff5757", "#33d17a", "#ffc233", "#5b8cff", "#a78bfa", "#ff8c42", "#2dd4bf", "#f472b6"];
const BOT_NAMES = ["Robo", "Chip", "Bolt", "Dicey", "Turbo", "Pixel", "Gizmo", "Widget"];

const rooms = new Map();
const roomSockets = new Map();
const timers = new Map();
const botTimers = new Map();

const newId = () => crypto.randomBytes(8).toString("hex");
const newCode = () => {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += A[crypto.randomInt(A.length)];
  return rooms.has(c) ? newCode() : c;
};
const clean = (s, n) => String(s || "").replace(/[<>]/g, "").trim().slice(0, n);
function clearT(map, code) { const t = map.get(code); if (t) { clearTimeout(t); map.delete(code); } }
function deleteRoom(code) { clearT(timers, code); clearT(botTimers, code); rooms.delete(code); roomSockets.delete(code); }
function activeSeats(room) { return room.players.map((p, i) => (!p.left ? i : -1)).filter((i) => i >= 0); }

function setupGame(room) {
  room.seed = crypto.randomBytes(8).toString("hex");
  const board = genBoard(room.seed);
  room.ladders = board.ladders; room.snakes = board.snakes;
  room.dice = null;
  room.pos = room.players.map(() => 0);
  room.turn = activeSeats(room)[crypto.randomInt(activeSeats(room).length)];
  room.sixes = 0;
  room.lastMove = null;
  room.winner = null;
  room.standings = null;
  room.status = "playing";
  room.log = `${room.players[room.turn].name} rolls first. First to square 100 wins.`;
  armTimer(room.code);
}

function chase(room, n) {
  const { ladders, snakes } = boardOf(room);
  let hops = 0;
  let kind = null;
  let from = null;
  while (hops++ < 5) {
    if (ladders[n] !== undefined) { kind = "ladder"; from = n; n = ladders[n]; }
    else if (snakes[n] !== undefined) { kind = "snake"; from = n; n = snakes[n]; }
    else break;
  }
  return { end: n, kind, from };
}

function nextTurn(room) {
  const act = activeSeats(room);
  const i = act.indexOf(room.turn);
  room.turn = act[(i + 1) % act.length];
  room.sixes = 0;
}

/* one die (classic) or two dice with a pick (T12). In two-dice mode the roll parks the pair on room.dice and the
   player (or the bot/timeout heuristic) chooses which die moves; a six on either die keeps the extra-roll rule. */
function performRoll(room) {
  if (room.dice) return;   // a pick is pending
  const seat = room.turn;
  if (room.diceMode === "two") {
    const dice = [crypto.randomInt(1, 7), crypto.randomInt(1, 7)];
    if (dice[0] === dice[1]) return applyMove(room, dice, 0);   // doubles: nothing to choose
    room.dice = dice;
    room.log = `${room.players[seat].name} rolled ${dice[0]} and ${dice[1]} — pick a die.`;
    return;
  }
  applyMove(room, [crypto.randomInt(1, 7)], 0);
}
/* the die a bot would choose: exact 100 > ladder > plain > snake, then the bigger die */
function botPickDie(room, seat, dice) {
  const from = room.pos[seat];
  const score = (roll) => {
    let landed = from + roll; if (landed > 100) landed = 200 - from - roll;
    const t = chase(room, landed);
    if (t.end === 100) return 1000;
    return (t.kind === "ladder" ? 200 : t.kind === "snake" ? -200 : 0) + t.end;
  };
  return score(dice[1]) > score(dice[0]) ? 1 : 0;
}
function pickDie(room, i) {
  if (!room.dice) return false;
  const dice = room.dice; room.dice = null;
  applyMove(room, dice, i === 1 ? 1 : 0);
  return true;
}
function applyMove(room, dice, pick) {
  const seat = room.turn;
  const pl = room.players[seat];
  const roll = dice[pick];
  const from = room.pos[seat];
  let landed = from + roll;
  let bounced = false;
  if (landed > 100) { landed = 200 - from - roll; bounced = true; }
  const t = chase(room, landed);
  room.pos[seat] = t.end;
  room.lastMove = { seat, roll, dice: dice.length > 1 ? dice.slice() : undefined, pick: dice.length > 1 ? pick : undefined, from, landed, to: t.end, bounced, via: t.kind ? { kind: t.kind, from: t.from, to: t.end } : null, mv: (room.lastMove ? room.lastMove.mv : 0) + 1 };
  const rolled = dice.length > 1 ? `rolled ${dice[0]} and ${dice[1]}, used the ${roll}` : `rolled ${roll}`;
  let msg = `${pl.name} ${rolled}` + (bounced ? " — too far! Bounced back" : "") + `.`;
  if (t.kind === "ladder") msg = `${pl.name} ${rolled} and climbed a ladder ${t.from} → ${t.end}! 🪜`;
  if (t.kind === "snake") msg = `${pl.name} ${rolled}… and slid down a snake ${t.from} → ${t.end} 🐍`;
  if (t.end === 100) {
    room.winner = seat;
    room.status = "over";
    room.standings = room.players.map((q, i) => ({ seat: i, pos: room.pos[i], left: q.left }))
      .sort((a, b) => (a.seat === seat ? -1 : b.seat === seat ? 1 : b.pos - a.pos));
    room.log = `${pl.name} lands EXACTLY on 100 — ${pl.name.toUpperCase()} WINS! 🏆`;
    clearT(timers, room.code); clearT(botTimers, room.code);
    return;
  }
  if (dice.includes(6)) {
    room.sixes++;
    if (room.sixes >= 3) { msg += " Three sixes — turn passes."; nextTurn(room); }
    else msg += " Six! Roll again.";
  } else nextTurn(room);
  room.log = msg;
}

function armTimer(code) {
  const room = rooms.get(code);
  clearT(timers, code);
  scheduleBot(code);
  if (!room || room.status !== "playing") { if (room) room.phaseEndsAt = null; return; }
  const cur = room.players[room.turn];
  const ms = cur && !cur.bot && !cur.botControlled && !cur.connected ? AFK_MS : TURN_MS;
  room.phaseEndsAt = Date.now() + ms;
  timers.set(code, setTimeout(() => onTurnTimeout(code), ms));
}

/* T1 AFK policy: a timed-out turn is rolled for the player (the bot heuristic here is the roll itself);
   three consecutive timeouts hand the seat to the bot until the human acts or reconnects. */
function onTurnTimeout(code) {
  const r = rooms.get(code);
  if (!r || r.status !== "playing") return;
  const pl = r.players[r.turn];
  if (!pl) return;
  let note = "";
  if (!pl.bot && !pl.botControlled) {
    pl.timeouts = (pl.timeouts || 0) + 1;
    if (pl.timeouts >= TIMEOUTS_TO_BOT) { pl.botControlled = true; note = `A bot is playing for ${pl.name} (timed out ${TIMEOUTS_TO_BOT} times).`; }
    else note = `${pl.name} ran out of time; the turn was played for them.`;
  }
  if (r.dice) pickDie(r, botPickDie(r, r.turn, r.dice)); else performRoll(r);
  if (note) r.log = `${note} ${r.log || ""}`.trim();
  bump(r);
  if (r.status === "playing") armTimer(code);
}

/* The human acts (or reconnects): take the seat back from the bot and reset the timeout streak. */
function humanIsBack(room, p, reason) {
  const wasBot = !!p.botControlled;
  p.timeouts = 0;
  if (!wasBot) return false;
  p.botControlled = false;
  room.log = `${p.name} is back at the table${reason ? " (" + reason + ")" : ""}.`;
  if (room.status === "playing" && room.players[room.turn] === p) { clearT(botTimers, room.code); armTimer(room.code); }
  return true;
}

function addBotTo(room) {
  if (room.players.length >= MAX_PLAYERS) return null;
  const used = room.players.map((q) => q.name);
  const name = BOT_NAMES.find((n) => !used.includes(n)) || "Bot" + (room.players.length + 1);
  const p = { id: "bot_" + newId(), name, avatar: "\u{1F916}", bot: true, left: false, connected: true };
  room.players.push(p);
  return p;
}
function scheduleBot(code) {
  clearT(botTimers, code);
  const room = rooms.get(code);
  if (!room || room.status !== "playing") return;
  const p = room.players[room.turn];
  if (!p || !(p.bot || p.botControlled)) return;
  botTimers.set(code, setTimeout(() => {
    const r = rooms.get(code);
    if (!r || r.status !== "playing") return;
    const cur = r.players[r.turn];
    if (!cur || !(cur.bot || cur.botControlled)) return;
    performRoll(r);
    if (r.dice) pickDie(r, botPickDie(r, r.turn, r.dice));
    bump(r);
    if (r.status === "playing") armTimer(code);
  }, BOT_MS + crypto.randomInt(BOT_MS)));
}

function stateFor(room) {
  return {
    code: room.code, status: room.status, phase: room.status === "playing" ? (room.dice ? "pick" : "roll") : room.status,
    turn: room.turn, sixes: room.sixes || 0,
    diceMode: room.diceMode === "two" ? "two" : "one", dice: room.dice || null, seed: room.seed || null,
    pos: room.pos || null, lastMove: room.lastMove, winner: room.winner,
    standings: room.standings, log: room.log, phaseEndsAt: room.phaseEndsAt || null,
    hostSeat: room.players.findIndex((p) => p.id === room.host),
    minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS,
    ladders: boardOf(room).ladders, snakes: boardOf(room).snakes,
    players: room.players.map((p, s) => ({
      name: p.name, avatar: p.avatar, bot: !!p.bot, botControlled: !!p.botControlled, left: p.left, connected: p.connected,
      color: COLORS[s % COLORS.length],
    })),
    voice: room.voice ? Array.from(room.voice) : [],
    chat: (room.chat || []).slice(-60),
  };
}
function bump(room) { room.v = (room.v || 0) + 1; room.touched = Date.now(); sendState(room.code); }

/* ---------- GameNest push (optional; no-op without PUSH_URL) ----------
   The app registers a device token per socket and reports presence; players who are away or disconnected
   get a push when it becomes their turn / a new phase starts, and when someone writes in chat. */
const PUSH_URL = process.env.PUSH_URL || "";
const PUSH_TITLE = 'Snakebite';
function pushTo(p, body, data, collapse) {
  if (!PUSH_URL || !p || !p.pushToken || p.bot || p.left) return;
  if (!(p.away || !p.connected)) return;
  const now = Date.now(); if (p._lastPush && now - p._lastPush < 4000) return; p._lastPush = now;
  fetch(PUSH_URL + "/notify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: p.pushToken, title: PUSH_TITLE, body, data: data || {}, collapse: collapse || undefined }) }).catch(() => {});
}
function pushTurn(room) {   // called after every state broadcast; only fires when the situation changes
  const key = room.status + "|" + room.turn;
  if (room._pushKey === key) return; room._pushKey = key;
  if (room.status !== "playing") return;
  const p = room.players[room.turn]; if (!p) return;
  pushTo(p, "Your turn in " + PUSH_TITLE + " — room " + room.code, { code: room.code, game: PUSH_TITLE }, room.code + "-turn");
}

function sendState(code) {
  const room = rooms.get(code);
  const socks = roomSockets.get(code);
  if (!room || !socks) return;
  for (const s of socks) {
    const seat = room.players.findIndex((p) => p.id === s.data.playerId);
    s.emit("state", { room: stateFor(room), mySeat: seat, v: room.v });
    try { pushTurn(room); } catch (_) {}
  }
}


/* T3: the host seat follows the humans — first connected human, else first human still seated, else unchanged. */
function ensureHost(room) {
  const cur = room.players.find((p) => p.id === room.host);
  if (cur && !cur.bot && !cur.left && cur.connected) return false;
  const next = room.players.find((p) => !p.bot && !p.left && p.connected) || room.players.find((p) => !p.bot && !p.left);
  if (!next || next.id === room.host) return false;
  room.host = next.id;
  room.log = `${next.name} is now the host.`;
  return true;
}

io.on("connection", (socket) => {
  socket.data.playerId = null;
  socket.data.code = null;
  const currentRoom = () => rooms.get(socket.data.code);
  const attach = (code) => { socket.data.code = code; if (!roomSockets.has(code)) roomSockets.set(code, new Set()); roomSockets.get(code).add(socket); };
  const detach = () => { const set = roomSockets.get(socket.data.code); if (set) set.delete(socket); socket.data.code = null; };

  socket.on("create", ({ name, playerId, avatar } = {}) => {
    name = clean(name, 18); if (!name) return socket.emit("err", "Pick a name first.");
    const code = newCode();
    const room = { code, status: "lobby", host: playerId, players: [], chat: [], log: "", v: 1, touched: Date.now(), voice: new Set() };
    room.players.push({ id: playerId, name, avatar: clean(avatar, 4) || "\u{1F40D}", bot: false, left: false, connected: true });
    rooms.set(code, room);
    socket.data.playerId = playerId;
    attach(code);
    socket.emit("joined", { code });
    bump(room);
  });

  socket.on("join", ({ code, name, playerId, avatar } = {}) => {
    code = clean(code, 6).toUpperCase();
    const room = rooms.get(code);
    if (!room) return socket.emit("err", "No room with that code.");
    socket.data.playerId = playerId;
    const existing = room.players.find((p) => p.id === playerId);
    if (existing) { existing.connected = true; existing.left = false; humanIsBack(room, existing, "reconnected"); attach(code); socket.emit("joined", { code }); bump(room); if (room.status === "playing" && room.players[room.turn] === existing) armTimer(code); return; }
    if (room.status !== "lobby") return socket.emit("err", "That game already started.");
    if (room.players.length >= MAX_PLAYERS) return socket.emit("err", "Room is full (8).");
    name = clean(name, 18); if (!name) return socket.emit("err", "Pick a name first.");
    room.players.push({ id: playerId, name, avatar: clean(avatar, 4) || "\u{1F40D}", bot: false, left: false, connected: true });
    attach(code);
    socket.emit("joined", { code });
    room.log = `${name} joined.`;
    bump(room);
  });

  socket.on("addBot", () => {
    const room = currentRoom();
    if (!room || room.status !== "lobby" || room.host !== socket.data.playerId) return;
    const b = addBotTo(room);
    if (b) { room.log = `${b.name} (bot) joined.`; bump(room); }
  });
  socket.on("removeBot", () => {
    const room = currentRoom();
    if (!room || room.status !== "lobby" || room.host !== socket.data.playerId) return;
    for (let i = room.players.length - 1; i >= 0; i--) if (room.players[i].bot) { room.players.splice(i, 1); break; }
    bump(room);
  });

  socket.on("start", () => {
    const room = currentRoom();
    if (!room || room.status !== "lobby" || room.host !== socket.data.playerId) return;
    if (room.players.filter((p) => !p.left).length < MIN_PLAYERS) return socket.emit("err", "Need at least 2 players — add a bot.");
    setupGame(room);
    bump(room);
  });

  socket.on("settings", ({ diceMode } = {}) => {   // T12: host picks one die or two-with-a-choice (lobby only)
    const room = currentRoom();
    if (!room || room.status !== "lobby" || room.host !== socket.data.playerId) return;
    if (diceMode !== "one" && diceMode !== "two") return;
    room.diceMode = diceMode;
    room.log = diceMode === "two" ? "Dice: roll two, pick the one you use." : "Dice: one die, classic.";
    bump(room);
  });
  socket.on("roll", () => {
    const room = currentRoom();
    if (!room || room.status !== "playing") return;
    const seat = room.players.findIndex((p) => p.id === socket.data.playerId);
    if (seat >= 0 && humanIsBack(room, room.players[seat], "took the seat back")) bump(room);   // any action reclaims a bot-controlled seat
    if (seat !== room.turn || room.dice) return;
    performRoll(room);
    bump(room);
    if (room.status === "playing") armTimer(room.code);
  });
  socket.on("pick", ({ i } = {}) => {   // T12: choose which of the two dice to use
    const room = currentRoom();
    if (!room || room.status !== "playing" || !room.dice) return;
    const seat = room.players.findIndex((p) => p.id === socket.data.playerId);
    if (seat >= 0 && humanIsBack(room, room.players[seat], "took the seat back")) bump(room);
    if (seat !== room.turn || (i !== 0 && i !== 1)) return;
    pickDie(room, i);
    bump(room);
    if (room.status === "playing") armTimer(room.code);
  });
  socket.on("takeSeat", () => {
    const room = currentRoom(); if (!room) return;
    const self = room.players.find((q) => q.id === socket.data.playerId);
    if (self && humanIsBack(room, self, "took the seat back")) bump(room);
  });
  socket.on("pushToken", ({ token } = {}) => { const room = currentRoom(); if (!room) return; const p = room.players.find((q) => q.id === socket.data.playerId); if (p && typeof token === "string" && /^[0-9a-f]{32,200}$/i.test(token)) p.pushToken = token; });
  socket.on("presence", ({ away } = {}) => { const room = currentRoom(); if (!room) return; const p = room.players.find((q) => q.id === socket.data.playerId); if (p) p.away = !!away; });


  socket.on("chat", ({ t } = {}) => {
    const room = currentRoom();
    if (!room) return;
    const seat = room.players.findIndex((p) => p.id === socket.data.playerId);
    const me = room.players[seat];
    if (!me || me.left) return;
    const now = Date.now();
    if (me._lastChat && now - me._lastChat < 700) return;
    me._lastChat = now;
    t = clean(t, 140); if (!t) return;
    room.chat.push({ n: me.name, a: me.avatar, t }); for (const q of room.players) if (q !== me) pushTo(q, me.name + ": " + t, { code: room.code, game: PUSH_TITLE }, room.code + "-chat");
    if (room.chat.length > 200) room.chat.splice(0, room.chat.length - 200);
    bump(room);
  });

  socket.on("voice", ({ kind, to, data } = {}) => {
    const room = currentRoom();
    if (!room) return;
    const seat = room.players.findIndex((p) => p.id === socket.data.playerId);
    if (seat < 0) return;
    if (kind === "join" || kind === "leave") {
      if (!room.voice) room.voice = new Set();
      if (kind === "join") room.voice.add(seat); else room.voice.delete(seat);
      bump(room); return;
    }
    if (kind === "signal" && Number.isInteger(to) && data) {
      let size = 0; try { size = JSON.stringify(data).length; } catch (e) { return; }
      if (size > 20000) return;
      const socks = roomSockets.get(room.code);
      if (!socks) return;
      for (const s of socks) {
        const sSeat = room.players.findIndex((p) => p.id === s.data.playerId);
        if (sSeat === to) s.emit("voice", { kind: "signal", from: seat, data });
      }
    }
  });

  socket.on("rematch", () => {
    const room = currentRoom();
    if (!room || room.status !== "over" || room.host !== socket.data.playerId) return;
    room.players = room.players.filter((p) => !p.left);
    if (room.players.filter((p) => !p.bot).length === 0) { deleteRoom(room.code); return; }
    if (room.players.length < MIN_PLAYERS) { room.status = "lobby"; room.log = "Back to the lobby."; bump(room); return; }
    setupGame(room);
    bump(room);
  });

  function handleLeave() {
    const room = currentRoom();
    if (!room) return detach();
    const p = room.players.find((q) => q.id === socket.data.playerId);
    if (!p) return detach();
    if (room.voice) room.voice.delete(room.players.indexOf(p));
    if (room.status === "lobby") {
      room.players = room.players.filter((q) => q.id !== p.id);
      if (room.players.length === 0 || room.players.every((q) => q.bot)) { detach(); deleteRoom(room.code); return; }
      if (room.host === p.id) room.host = (room.players.find((q) => !q.bot) || room.players[0]).id;
      room.log = `${p.name} left.`;
    } else {
      const seat = room.players.indexOf(p);
      p.left = true; p.connected = false;
      if (room.players.every((q) => q.bot || q.left)) { detach(); deleteRoom(room.code); return; }
      if (room.host === p.id) room.host = (room.players.find((q) => !q.bot && !q.left) || room.players[0]).id;
      room.log = `${p.name} left the game.`;
      if (room.status === "playing") {
        const act = activeSeats(room);
        if (act.length === 1) {
          room.winner = act[0];
          room.status = "over";
          room.standings = room.players.map((q, i) => ({ seat: i, pos: room.pos[i], left: q.left }))
            .sort((a, b) => (a.seat === act[0] ? -1 : b.seat === act[0] ? 1 : b.pos - a.pos));
          room.log = `${room.players[act[0]].name} is the last one on the board — they win!`;
          clearT(timers, room.code); clearT(botTimers, room.code);
        } else if (room.turn === seat) { nextTurn(room); armTimer(room.code); }
      }
    }
    detach();
    bump(room);
  }
  socket.on("leave", () => handleLeave());
  socket.on("disconnect", () => {
    const room = currentRoom();
    if (!room) return;
    const p = room.players.find((q) => q.id === socket.data.playerId);
    if (p) { p.connected = false; if (room.voice) room.voice.delete(room.players.indexOf(p)); ensureHost(room); room.v++; }
    detach();
    if (rooms.has(room.code)) sendState(room.code);
    if (p && rooms.has(room.code) && room.status === "playing" && room.players[room.turn] === p) armTimer(room.code);   // 5 s clock while they are away
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) if (now - room.touched > 2 * 60 * 60 * 1000) deleteRoom(code);
}, 10 * 60 * 1000);

if (require.main === module) server.listen(PORT, () => console.log("Snakes & Ladders running on port " + PORT));
module.exports = { genBoard, botPickDie, chase };
