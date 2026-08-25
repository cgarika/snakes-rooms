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
const BOT_MS = Math.max(1, Number(process.env.BOT_MS || 900));

const LADDERS = { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 };
const SNAKES = { 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78 };
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

function chase(n) {
  let hops = 0;
  let kind = null;
  let from = null;
  while (hops++ < 5) {
    if (LADDERS[n] !== undefined) { kind = "ladder"; from = n; n = LADDERS[n]; }
    else if (SNAKES[n] !== undefined) { kind = "snake"; from = n; n = SNAKES[n]; }
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

function performRoll(room) {
  const seat = room.turn;
  const pl = room.players[seat];
  const roll = crypto.randomInt(1, 7);
  const from = room.pos[seat];
  let landed = from + roll;
  let bounced = false;
  if (landed > 100) { landed = 200 - from - roll; bounced = true; }
  const t = chase(landed);
  room.pos[seat] = t.end;
  room.lastMove = { seat, roll, from, landed, to: t.end, bounced, via: t.kind ? { kind: t.kind, from: t.from, to: t.end } : null, mv: (room.lastMove ? room.lastMove.mv : 0) + 1 };
  let msg = `${pl.name} rolled ${roll}` + (bounced ? " — too far! Bounced back" : "") + `.`;
  if (t.kind === "ladder") msg = `${pl.name} rolled ${roll} and climbed a ladder ${t.from} → ${t.end}! 🪜`;
  if (t.kind === "snake") msg = `${pl.name} rolled ${roll}… and slid down a snake ${t.from} → ${t.end} 🐍`;
  if (t.end === 100) {
    room.winner = seat;
    room.status = "over";
    room.standings = room.players.map((q, i) => ({ seat: i, pos: room.pos[i], left: q.left }))
      .sort((a, b) => (a.seat === seat ? -1 : b.seat === seat ? 1 : b.pos - a.pos));
    room.log = `${pl.name} lands EXACTLY on 100 — ${pl.name.toUpperCase()} WINS! 🏆`;
    clearT(timers, room.code); clearT(botTimers, room.code);
    return;
  }
  if (roll === 6) {
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
  room.phaseEndsAt = Date.now() + TURN_MS;
  timers.set(code, setTimeout(() => {
    const r = rooms.get(code);
    if (!r || r.status !== "playing") return;
    performRoll(r);
    bump(r);
    if (r.status === "playing") armTimer(code);
  }, TURN_MS));
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
  if (!p || !p.bot) return;
  botTimers.set(code, setTimeout(() => {
    const r = rooms.get(code);
    if (!r || r.status !== "playing") return;
    const cur = r.players[r.turn];
    if (!cur || !cur.bot) return;
    performRoll(r);
    bump(r);
    if (r.status === "playing") armTimer(code);
  }, BOT_MS + crypto.randomInt(BOT_MS)));
}

function stateFor(room) {
  return {
    code: room.code, status: room.status, phase: room.status === "playing" ? "roll" : room.status,
    turn: room.turn, sixes: room.sixes || 0,
    pos: room.pos || null, lastMove: room.lastMove, winner: room.winner,
    standings: room.standings, log: room.log, phaseEndsAt: room.phaseEndsAt || null,
    hostSeat: room.players.findIndex((p) => p.id === room.host),
    minPlayers: MIN_PLAYERS, maxPlayers: MAX_PLAYERS,
    ladders: LADDERS, snakes: SNAKES,
    players: room.players.map((p, s) => ({
      name: p.name, avatar: p.avatar, bot: !!p.bot, left: p.left, connected: p.connected,
      color: COLORS[s % COLORS.length],
    })),
    voice: room.voice ? Array.from(room.voice) : [],
    chat: (room.chat || []).slice(-60),
  };
}
function bump(room) { room.v = (room.v || 0) + 1; room.touched = Date.now(); sendState(room.code); }
function sendState(code) {
  const room = rooms.get(code);
  const socks = roomSockets.get(code);
  if (!room || !socks) return;
  for (const s of socks) {
    const seat = room.players.findIndex((p) => p.id === s.data.playerId);
    s.emit("state", { room: stateFor(room), mySeat: seat, v: room.v });
  }
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
    if (existing) { existing.connected = true; existing.left = false; attach(code); socket.emit("joined", { code }); bump(room); return; }
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

  socket.on("roll", () => {
    const room = currentRoom();
    if (!room || room.status !== "playing") return;
    const seat = room.players.findIndex((p) => p.id === socket.data.playerId);
    if (seat !== room.turn) return;
    performRoll(room);
    bump(room);
    if (room.status === "playing") armTimer(room.code);
  });

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
    room.chat.push({ n: me.name, a: me.avatar, t });
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
    if (p) { p.connected = false; if (room.voice) room.voice.delete(room.players.indexOf(p)); room.v++; }
    detach();
    if (rooms.has(room.code)) sendState(room.code);
  });
});

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) if (now - room.touched > 2 * 60 * 60 * 1000) deleteRoom(code);
}, 10 * 60 * 1000);

server.listen(PORT, () => console.log("Snakes & Ladders running on port " + PORT));
