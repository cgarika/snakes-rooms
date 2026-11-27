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
/* Every client event goes through one guard (as in Nightfall and Word Spies, less their flood limit). A payload that
   is not an object (null, a number, a string, an array) arrives as {}: 42["join",null] used to throw inside the
   handler's destructuring and stop the whole process, every room with it. A handler that still throws is logged and
   the server carries on. */
function guarded(socket) {
  return (event, fn) => socket.on(event, (payload, ...rest) => {
    try { fn(payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {}, ...rest); }
    catch (e) { console.error(`[${new Date().toISOString()}] ${event} failed:`, (e && e.stack) || e); }
  });
}

const PORT = process.env.PORT || 3000;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 8;
const TURN_MS = Number(process.env.TURN_MS || 30000);
const AFK_MS = Math.max(200, Number(process.env.AFK_MS || 5000));   // T1: turn clock while the current player is disconnected
const TIMEOUTS_TO_BOT = 3;                                              // consecutive timeouts before a bot takes the seat
const BOT_MS = Math.max(1, Number(process.env.BOT_MS || 900));
/* How long a bot "thinks" before it rolls. A server given BOT_MS (the tests and the dev servers, which want bots quick or slow on purpose)
   keeps its old rule: BOT_MS plus up to as much again. A live server has none, and a bot there thinks 0.4 to 1.1 s, each bot at its own
   pace (0.85 to 1.15 of that, set when it sits down): a person's three bots take about 2.3 s of thinking between their turns, where the
   old 0.9 to 1.8 s took 4 (the benchmark, 2026-11-01: 5 s between a person's turns; the target is a p50 under 3 s, and a table of three
   bots cannot make it with thinking of 0.95 s each, the first try, which measured p50 3.3 s). Only the wait changes; the dice are as fair as ever. */
const BOT_FIXED = process.env.BOT_MS !== undefined && process.env.BOT_MS !== "";
const BOT_THINK_MIN = Math.max(1, Number(process.env.BOT_THINK_MIN_MS || 400));
const BOT_THINK_SPAN = Math.max(0, Number(process.env.BOT_THINK_SPAN_MS || 700));
function botThinkMs(p) {
  if (BOT_FIXED) return BOT_MS + crypto.randomInt(BOT_MS);
  return Math.round((BOT_THINK_MIN + crypto.randomInt(BOT_THINK_SPAN + 1)) * (p && p.pace ? p.pace : 1));
}

/* The lobby's picture (what a table with nobody playing yet shows): the first layout (layouts.json). A game gets the board its seed deals. */
const Layouts = require("./layouts");
const LAYOUT_ONE = Layouts.BOARDS[0];
const LADDERS = { ...LAYOUT_ONE.ladders };
const SNAKES = { ...LAYOUT_ONE.snakes };

/* T12: seeded boards; the seed is drawn with crypto at game start and kept on the room, so a rejoin (and the tests)
   see the identical board. Since 2026-11-07 the board is one of the short layouts of layouts.json (board.js genBoard): eight ladders and eight serpents, each across two or three rows, nothing crossing
   anything, as the owner's approved pictures draw them, or the left-right mirror of one where its layout says so (from 2026-11-04 to 2026-11-07 it was one of three traditional boards, with serpents of
   four to six rows and long diagonal ladders). LADDERS/SNAKES above are only what the lobby shows before a game has a board. */
const { genBoard } = require("./board");
const Reactions = require("./reactions");   // the cartoon stickers (2026-10-15)
const Voice = require("./voice");   // voice chat in private rooms, EOS (2026-11-18; the file every server shares)
const Played = require("./friendsplayed");   // Friends: "last played with" when a game ends (2026-11-19; the file every server shares)
const Quick = require("./quickmatch");   // quick play and ranked (2026-10-24)
const Moderation = require("./moderation");   // what players type, kept friendly (2026-10-18)
const Plus = require("./plus");   // GameNest Plus: the room's flag and each player's look (2026-10-16)
const Power = require("./power").make(["antidote", "ladder", "reroll"]);   // Power mode: the one-use power-ups (2026-11-13)
function boardOf(room) { return { ladders: room.ladders || LADDERS, snakes: room.snakes || SNAKES }; }
const COLORS = ["#ff5757", "#33d17a", "#ffc233", "#5b8cff", "#a78bfa", "#ff8c42", "#2dd4bf", "#f472b6"];
const BOT_NAMES = ["Robo", "Chip", "Bolt", "Dicey", "Turbo", "Pixel", "Gizmo", "Widget"];

const rooms = new Map();
app.get("/internal/roster/:code", Plus.rosterHandler((code) => rooms.get(code)));   // who is at a table, for the wallet's Treat the room (404 without GN_INTERNAL_SECRET)
/* GameNest Plus: a player says on create and join that they own Plus; a room
   whose host owns it is a Plus room, and every client shows its extras.
   The client's word is taken for now (checking Apple's receipt is a later step). */
function stampPlus(code, socket, said) {
  const room = rooms.get(code);
  const p = room && socket && socket.data && room.players.find((q) => q.id === socket.data.playerId);
  if (p) { Plus.stampFor(p, said, socket); Plus.dedupe(room, p); }
}
const roomSockets = new Map();
const timers = new Map();
const botTimers = new Map();

const newId = () => crypto.randomBytes(8).toString("hex");
const newCode = () => {
  const A = "ABCDEFGHJKMNPRTWXYZ";   // six letters, never a digit, none of I L O Q S U V (2026-11-13)
  let c = "";
  for (let i = 0; i < 6; i++) c += A[crypto.randomInt(A.length)];
  return rooms.has(c) ? newCode() : c;
};
const clean = (s, n) => String(s || "").replace(/[<>]/g, "").trim().slice(0, n);
/* GN-30: one name cap for every game, 18 UTF-16 units (as the app counts), cut only between whole characters as a
   reader sees them (grapheme clusters), so a name never ends in half an emoji or a flag's lone letter. An avatar is
   one such character (a sticker; a family with skin tones is about 20 units). */
const NAME_MAX = 18, AVATAR_MAX = 24;
const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });
function capText(s, max, oneOnly) {
  s = String(s == null ? "" : s).slice(0, 4096).replace(/[<>]/g, "").trim();
  let out = "";
  for (const { segment } of graphemes.segment(s)) {
    if (out.length + segment.length > max) break;
    out += segment;
    if (oneOnly) break;
  }
  return out.trim();
}
const capName = (s) => capText(s, NAME_MAX);
const capAvatar = (s) => capText(s, AVATAR_MAX, true);
/* GN-05: every refusal names its reason for machines as well as people: a "refusal" event { code, message, op }
   first, then "err" as today with the English first and { code, op } after it (codes: not_found, started, full,
   name_required, not_enough_players; the same names as the other GameNest servers). */
function refuse(socket, code, message, op) { socket.emit("refusal", { code, message, op }); socket.emit("err", message, { code, op }); }
/* What this server can do beyond what today's app knows, so a newer client can tell before it relies on it. */
const FEATURES = Object.freeze(["calmBoards", "refusalCodes", "serverNow", "waitList", "finishRule", "reactions", "power", "sixRule"]);
/* How a game ends (the owner, 2026-10-14, after the reviewers: the bounce at the end dragged on, half of games four
   turns or more of it): "reach", the default, wins on any roll that reaches or passes 100; "exact", the classic, must
   land on 100 exactly and bounces back off it. The host picks in the lobby. */
const isExact = (room) => room.finish === "exact";
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
  setupPower(room);
  armTimer(room.code);
}

/* ---------- Power mode (2026-11-13; power.js has the rules that never bend) ----------
   All three are tapped on your turn, before you roll. Antidote: your pawn wears it until one bite does nothing (the pawn
   stays on the snake's head). Ladder boost: your pawn wears it until a move of yours ends one square from a ladder's foot
   BY NUMBER, the square numbered one before or one after it (fix365, the lead's rule, 2026-11-26: the banner says "CLIMB
   FROM 1 SQUARE AWAY" and a player counts squares by number; the qa1126 rule also reached a foot touching the square from
   the row above or below, which on the board reads as a jump of up to 19 squares back or ahead, the "didn't work as
   expected" the owner had; a snake's head one square from a foot still hops before the bite, as qa1126 made it), on a
   square that is not a ladder's foot itself; the pawn then hops to the
   foot and climbs, the taller climb when two are in reach, and a boost on a snake's head hops off it before the bite. Only a
   ladder that takes the pawn higher than it stands. Re-roll: one more roll this turn: the first time the turn would pass,
   it does not (a first move that wins ends the game); that roll is the turn's last, a six on it included. One of each mark
   at a time for a player; the marks belong to the seat's pawn.

   The turn (qa1126, 2026-11-25, the owner: "sometimes the user gets 3 turns"): one roll; a six rolls again; the third six
   in a row is void (the pawn stays where it is) and the turn passes, the classic rule (until then the third six moved the
   pawn too). With two dice the six that rolls again is the die the pawn moves by (doubles included); a six on the die left
   unused gave a free roll before. So a turn is at most three rolls, and one more with a Re-roll. A table where every person's
   app says "sixRule" in its caps plays it; one with an older app (which walks a third six's pawn before it hears of a void
   move) keeps the rule it was built for, every six rolling again and the third one moving and passing. */
const POWER_NAMES = { antidote: "an Antidote", ladder: "a Ladder boost", reroll: "a Re-roll" };

function setupPower(room) {
  if (room.mode !== "power") { room.pw = null; return; }
  const seq = (room.pw && room.pw.seq) || 0;   // the uses' ids keep counting through a rematch
  room.pw = { game: crypto.randomBytes(4).toString("hex"), seq, last: null, turnUsed: false, again: false, now: false,
    marks: room.players.map(() => ({ antidote: false, ladder: false })) };
  const uses = Power.botUses(room.players.filter((p) => !p.bot).map((p) => p.pw));
  for (const p of room.players) {
    if (!p.pw) p.pw = Power.seat(null, null);
    Power.fresh(p.pw);
    if (p.bot) Power.bot(p.pw, uses);
  }
}

/* What the seat could use right now, by the rules alone (its turn, before the roll, a use left, none used this turn, the
   mark not worn already); whether it owns one is the stock's business. */
function powerCan(room, seat) {
  const can = { antidote: false, ladder: false, reroll: false };
  const p = room.players[seat];
  if (room.status !== "playing" || !room.pw || room.turn !== seat || room.dice || !p || !p.pw || p.pw.left <= 0 || room.pw.turnUsed) return can;
  const marks = room.pw.marks[seat] || {};
  can.antidote = !marks.antidote;
  can.ladder = !marks.ladder;
  can.reroll = !room.pw.again && !room.pw.now;
  return can;
}

/* The Power part of a state, for a Power room only: a Classic room's state is what it always was. */
function powerView(room) {
  const pw = room.status === "lobby" ? null : room.pw;
  return {
    game: pw ? pw.game : null,
    max: Power.MAX_USES,
    seats: room.players.map((p, s) => ({ used: pw ? Power.used(p.pw) : 0, antidote: !!(pw && pw.marks[s] && pw.marks[s].antidote), ladder: !!(pw && pw.marks[s] && pw.marks[s].ladder) })),
    reroll: pw && pw.again ? "armed" : pw && pw.now ? "now" : null,   // armed: the turn will not pass once; now: the roll to come is the re-roll's
    last: pw ? pw.last : null,
  };
}
function powerMe(room, seat) {
  const p = room.players[seat];
  if (!p || !p.pw) return null;
  return Object.assign(Power.me(p.pw), { can: powerCan(room, seat) });
}

/* One power-up, for the seat whose turn it is. It is spent the moment it is used. Returns nothing when it was used, or the
   words for why it was not. */
function usePower(room, kind) {
  if (room.mode !== "power" || !room.pw || room.status !== "playing") return "Power-ups are for Power rooms.";
  const seat = room.turn, pl = room.players[seat], pw = pl && pl.pw;
  if (!pw || !Power.kinds.includes(kind)) return "No such power-up.";
  if (pw.left <= 0) return "No uses left this game.";
  if (room.pw.turnUsed) return "One power-up a turn.";
  if (pw.stock[kind] <= 0) return "You have none of those.";
  if (room.dice) return "Pick a die first.";
  const marks = room.pw.marks[seat];
  if (kind === "antidote" && marks.antidote) return "Your pawn has an antidote already.";
  if (kind === "ladder" && marks.ladder) return "Your pawn has a ladder boost already.";
  if (!powerCan(room, seat)[kind]) return "Not now.";
  Power.spend(pw, kind);
  room.pw.turnUsed = true;
  room.pw.last = { id: ++room.pw.seq, seat, kind };
  room.log = `${pl.name} used ${POWER_NAMES[kind]}.`;
  if (kind === "reroll") room.pw.again = true; else marks[kind] = true;
  for (const s of roomSockets.get(room.code) || []) s.emit("powerUsed", room.pw.last);   // the one broadcast; the state carries it too (power.last) for whoever was away
  return null;
}

/* A bot's power-up, by plain sense: the antidote and the ladder boost at the start, then the re-roll, one a turn.
   True when it used one: that is the bot's action for now, and its roll follows. */
function botPower(r) {
  const pl = r.players[r.turn];
  if (!r.pw || !pl || !pl.bot || !pl.pw || pl.pw.left <= 0 || r.pw.turnUsed || r.dice) return false;
  const can = powerCan(r, r.turn), own = pl.pw.stock;
  for (const kind of Power.kinds) if (can[kind] && own[kind] > 0) return !usePower(r, kind);
  return false;
}

/* Where a move that ends on `landed` leaves the seat's pawn in a Power game: the ladder boost's hop, then the board, with
   one bite stopped by the antidote. As chase() for a pawn that wears nothing. */
function landOn(room, seat, landed) {
  const marks = room.pw && room.pw.marks[seat];
  if (!marks || (!marks.antidote && !marks.ladder)) return chase(room, landed);
  const { ladders, snakes } = boardOf(room);
  const out = { end: landed, kind: null, from: null };
  let n = landed;
  if (marks.ladder && n < 100 && ladders[n] === undefined) {
    const feet = boostReach(n).filter((f) => ladders[f] !== undefined && ladders[f] > n);
    if (feet.length) {
      const foot = feet.reduce((a, b) => (ladders[b] - b >= ladders[a] - a ? b : a));   // the taller climb; the same height, the one ahead
      out.boost = { from: n, foot };
      marks.ladder = false;
      n = foot;
    }
  }
  let hops = 0;
  while (hops++ < 5) {
    if (ladders[n] !== undefined) { out.kind = "ladder"; out.from = n; n = ladders[n]; }
    else if (snakes[n] !== undefined) {
      if (marks.antidote) { marks.antidote = false; out.noBite = n; break; }
      out.kind = "snake"; out.from = n; n = snakes[n];
    } else break;
  }
  out.end = n;
  return out;
}

/* The squares a ladder boost reaches from square n (fix365): one before and one after it by number, on the board. */
function boostReach(n) {
  return [n - 1, n + 1].filter((q) => q >= 1 && q <= 100);
}

/* The squares touching square n on the board (beside it in its row, and above and below it): the boustrophedon board's
   rows run left to right from 1, then right to left, and so on. n - 1 and n + 1 are always among them. */
function touching(n) {
  const row = Math.floor((n - 1) / 10), off = (n - 1) % 10, col = row % 2 ? 9 - off : off;
  const at = (r, c) => (r < 0 || r > 9 || c < 0 || c > 9 ? 0 : r * 10 + (r % 2 ? 9 - c : c) + 1);
  return [at(row, col - 1), at(row, col + 1), at(row - 1, col), at(row + 1, col)].filter((q) => q >= 1 && q <= 100);
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
  if (room.pw) { room.pw.turnUsed = false; room.pw.again = false; room.pw.now = false; }
}
/* The turn's rule (qa1126): the classic one where every person at the table has an app that knows it ("sixRule" in its caps). */
const saysSixRule = (caps) => Array.isArray(caps) && caps.includes("sixRule");
function sixRule(room) { return room.players.every((p) => p.bot || p.left || p.sixRule); }
/* a die: the tests' next one (TEST_HOOKS), or a fair one */
function rollDie(room) { return room.testDice && room.testDice.length ? room.testDice.shift() : crypto.randomInt(1, 7); }

/* one die (classic) or two dice with a pick (T12). In two-dice mode the roll parks the pair on room.dice and the
   player (or the bot/timeout heuristic) chooses which die moves; a six on either die keeps the extra-roll rule. */
function performRoll(room) {
  if (room.dice) return;   // a pick is pending
  const seat = room.turn;
  if (room.diceMode === "two") {
    const dice = [rollDie(room), rollDie(room)];
    if (dice[0] === dice[1]) return applyMove(room, dice, 0);   // doubles: nothing to choose
    room.dice = dice;
    room.log = `${room.players[seat].name} rolled ${dice[0]} and ${dice[1]} — pick a die.`;
    return;
  }
  applyMove(room, [rollDie(room)], 0);
}
/* the die a bot would choose: exact 100 > ladder > plain > snake, then the bigger die */
function botPickDie(room, seat, dice) {
  const from = room.pos[seat];
  const score = (roll) => {
    let landed = from + roll; if (landed > 100) landed = isExact(room) ? 200 - from - roll : 100;
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
  const rerolled = !!(room.pw && room.pw.now);   // the Re-roll's roll: the turn's last
  const rule = sixRule(room);
  if (room.pw) room.pw.now = false;
  /* Power mode's re-roll: the first time the turn would pass, it does not; the roll to come is the re-roll's */
  const again = () => { if (!room.pw || !room.pw.again) return false; room.pw.again = false; room.pw.now = true; return true; };
  if (rule && roll === 6 && !rerolled && (room.sixes || 0) >= 2) {
    /* the third six in a row is void: the pawn stays, the turn passes ("Three sixes" is what every app looks for) */
    room.sixes = 3;
    room.lastMove = { seat, roll, dice: dice.length > 1 ? dice.slice() : undefined, pick: dice.length > 1 ? pick : undefined, from, landed: from, to: from, bounced: false, via: null, voided: true, mv: (room.lastMove ? room.lastMove.mv : 0) + 1 };
    const rolled = dice.length > 1 ? `rolled ${dice[0]} and ${dice[1]}, the third 6` : "rolled a third 6";
    if (again()) room.log = `${pl.name} ${rolled}. Three sixes: no move. Re-roll: roll again.`;
    else { room.log = `${pl.name} ${rolled}. Three sixes — turn passes.`; nextTurn(room); }
    return;
  }
  let landed = from + roll;
  let bounced = false;
  if (landed > 100) { if (isExact(room)) { landed = 200 - from - roll; bounced = true; } else landed = 100; }
  const t = room.pw ? landOn(room, seat, landed) : chase(room, landed);
  room.pos[seat] = t.end;
  room.lastMove = { seat, roll, dice: dice.length > 1 ? dice.slice() : undefined, pick: dice.length > 1 ? pick : undefined, from, landed, to: t.end, bounced, via: t.kind ? { kind: t.kind, from: t.from, to: t.end } : null, mv: (room.lastMove ? room.lastMove.mv : 0) + 1 };
  /* Power mode, only when it happens (a Classic move is what it always was): the boost's hop, the bite that did nothing, the re-roll's roll */
  if (t.boost) room.lastMove.boost = t.boost;
  if (t.noBite !== undefined) room.lastMove.noBite = t.noBite;
  if (rerolled) room.lastMove.reroll = true;
  const rolled = dice.length > 1 ? `rolled ${dice[0]} and ${dice[1]}, used the ${roll}` : `rolled ${roll}`;
  let msg = `${pl.name} ${rolled}` + (bounced ? " — too far! Bounced back" : "") + `.`;
  if (t.kind === "ladder") msg = `${pl.name} ${rolled} and climbed a ladder ${t.from} → ${t.end}! 🪜`;
  if (t.kind === "snake") msg = `${pl.name} ${rolled}… and slid down a snake ${t.from} → ${t.end} 🐍`;
  if (t.boost) msg = `${pl.name} ${rolled}, hopped to the ladder at ${t.boost.foot} and climbed to ${t.end}! 🪜`;
  if (t.noBite !== undefined) msg = `${pl.name} ${rolled} and landed on a snake at ${t.noBite}. No bite: the antidote held.`;
  // The bots' reactions (2026-10-15): bitten, up a ladder, the win, once the app has walked the pawn there (the die
  // settles, then a tenth of a second a square, then the slide).
  const shown = 1500 + 100 * Math.abs(landed - from) + (t.kind ? 900 : 0);
  if (t.end === 100) Reactions.event(room, seat, "win", bump, shown);
  else if (t.noBite !== undefined) Reactions.event(room, seat, "good", bump, shown);
  else if (t.kind === "snake") Reactions.event(room, seat, "bad", bump, shown);
  else if (t.kind === "ladder") Reactions.event(room, seat, "good", bump, shown);
  if (t.end === 100) {
    room.winner = seat;
    room.status = "over";
    room.standings = room.players.map((q, i) => ({ seat: i, pos: room.pos[i], left: q.left }))
      .sort((a, b) => (a.seat === seat ? -1 : b.seat === seat ? 1 : b.pos - a.pos));
    room.log = isExact(room) ? `${pl.name} lands EXACTLY on 100 — ${pl.name.toUpperCase()} WINS! 🏆` : `${pl.name} reaches 100 — ${pl.name.toUpperCase()} WINS! 🏆`;
    clearT(timers, room.code); clearT(botTimers, room.code);
    return;
  }
  /* a six rolls again (the die the pawn moved by; never the re-roll's roll, the turn's last); anything else ends the turn, unless a re-roll is waiting */
  if (!rule) {   // an older app at the table: the rule it was built for (any die's six rolls again; the third moves, then passes; the re-roll keeps the turn once more)
    if (dice.includes(6)) {
      room.sixes++;
      if (room.sixes >= 3) { if (again()) { room.sixes = 0; msg += " Re-roll: roll again."; } else { msg += " Three sixes — turn passes."; nextTurn(room); } }
      else msg += " Six! Roll again.";
    } else if (again()) { room.sixes = 0; msg += " Re-roll: roll again."; } else nextTurn(room);
    room.log = msg;
    return;
  }
  room.sixes = roll === 6 ? (room.sixes || 0) + 1 : 0;
  if (roll === 6 && !rerolled) msg += " Six! Roll again.";
  else if (again()) msg += " Re-roll: roll again.";
  else nextTurn(room);
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
  if (r.status === "playing") armTimer(code);   // GN-10: the deadline is set before the state that shows it
  bump(r);
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
  const p = { id: "bot_" + newId(), name, avatar: "\u{1F916}", bot: true, left: false, connected: true, pace: 0.85 + crypto.randomInt(31) / 100 };
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
    if (botPower(r)) { armTimer(code); bump(r); return; }   // Power mode: a power-up is an action of its own; the roll follows it (never for a person's seat a bot is minding)
    performRoll(r);
    if (r.dice) pickDie(r, botPickDie(r, r.turn, r.dice));
    if (r.status === "playing") armTimer(code);   // GN-10
    bump(r);
  }, botThinkMs(p)));
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
      name: p.name, avatar: p.avatar, ...Plus.seat(p), bot: !!p.bot, botControlled: !!p.botControlled, left: p.left, connected: p.connected,
      color: COLORS[s % COLORS.length],
    })),
    voice: room.voice ? Array.from(room.voice) : [],
    chat: (room.chat || []).slice(-60),
    /* new, after every old field (today's app ignores them) */
    features: FEATURES,
    serverNow: Date.now(),   // GN-48: the server's clock, so a phone whose clock is off can correct phaseEndsAt
    finish: isExact(room) ? "exact" : "reach",
    ...Reactions.view(room),   // 2026-10-15: reactionsOn and the last reactions   // 2026-10-14: how a game ends; a client from before plays the exact finish's words
    ...Quick.view(room),   // quick play and ranked (2026-10-24)
    ...Voice.view(room),   // voice chat (2026-11-18): gnVoice { on, peers }
    ...Played.view(room, "snakes"),   // Friends (2026-11-19): reports a finished game once; adds no field
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

/* ---------- the waiting line (the owner, 2026-09-29) ----------
   Someone who joins a game already under way (and whose app says "waitList") waits in line,
   watching. A seat someone leaves mid-game goes to the first in line at once, keeping the seat's game. The rest are seated at the next game, bots making room if the table is full. */
function takeLeftSeats(room) {
  if (!true || !room.waiting || !room.waiting.length || room.status === "lobby" || room.status === "over") return false;
  let seated = false;
  for (let seat = 0; seat < room.players.length && room.waiting.length; seat++) {
    const old = room.players[seat];
    if (!old.left) continue;
    const w = room.waiting.shift();
    // The seat keeps its game (its place, its cards, its score); only who sits in it changes.
    room.players[seat] = Object.assign({}, old, { id: w.id, name: w.name, avatar: w.avatar, bot: false, botControlled: false,
      left: false, connected: true, plus: w.plus, acct: w.acct, look: w.look, timeouts: 0, pw: w.pw || Power.seat(null, null), sixRule: !!w.sixRule });
    room.log = `${w.name} took ${old.name}'s seat.`;
    seated = true;
  }
  return seated;
}
function seatTheLine(room) {
  while (room.waiting && room.waiting.length) {
    if (room.players.length >= MAX_PLAYERS) {
      const bot = room.players.findIndex((p) => p.bot);
      if (bot < 0) break;
      room.players.splice(bot, 1);
    }
    const w = room.waiting.shift();
    room.players.push({ id: w.id, name: w.name, avatar: w.avatar, bot: false, left: false, connected: true, plus: w.plus, acct: w.acct, look: w.look, pw: w.pw || Power.seat(null, null), sixRule: !!w.sixRule });
  }
}
function lineState(room, st, playerId, seat) {
  st.waiting = (room.waiting || []).map((w) => ({ name: w.name, avatar: w.avatar }));
  st.waitPos = seat < 0 ? (room.waiting || []).findIndex((w) => w.id === playerId) + 1 : 0;
  return st;
}

function sendState(code) {
  const room = rooms.get(code);
  const socks = roomSockets.get(code);
  if (!room || !socks) return;
  for (const s of socks) {
    const seat = room.players.findIndex((p) => p.id === s.data.playerId);
    const st = lineState(room, stateFor(room), s.data.playerId, seat);
    if (room.mode === "power") {   // Power mode (2026-11-13): after every older field; a Classic room's state has neither
      st.mode = "power";
      st.power = powerView(room);
      const mine = seat >= 0 ? powerMe(room, seat) : null;
      if (mine) st.power.me = mine;   // their own stock, to them alone
    }
    s.emit("state", { room: st, mySeat: seat, v: room.v });
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
  modeFollowsHost(room);
  return true;
}
/* Power mode is hosted only by an app that knows it: a lobby whose host is now an older app is a Classic one again. */
function modeFollowsHost(room) {
  if (room.status !== "lobby" || room.mode !== "power") return;
  const host = room.players.find((p) => p.id === room.host);
  if (host && host.pw && host.pw.knows) return;
  room.mode = "classic";
}

Quick.init({ game: 'snakes', model: 'openskill', seats: 4, codeKey: 'code', app, io, rooms, base: BASE, broadcast: sendState,
  rated: (r) => r.mode !== "power",   // a Power game is never rated: money never moves a rating
  accept: (room, payload) => (room.mode === "power") === (payload.mode === "power" && Power.knows(payload.caps)) });   // quick play matches Power only with Power
io.on("connection", (socket) => {
  Plus.guardSocket(socket);   // the wallet's signed entitlement: every event's `plus` is the checked answer (the Nest Wallet repo, contrib/ROLLOUT.md)
  Quick.hook(socket); Quick.connection(socket);   // before the server's own events
  const on = guarded(socket);   // every client event below goes through the guard
  socket.data.playerId = null;
  socket.data.code = null;
  const currentRoom = () => rooms.get(socket.data.code);
  Voice.wire({ on: on, room: currentRoom, me: () => socket.data.playerId, bump: bump, emit: (ev, d) => socket.emit(ev, d) });   // voice chat in private rooms (2026-11-18)
  Reactions.wire({ on, room: currentRoom, me: () => socket.data.playerId, isHost: (r) => r.host === socket.data.playerId, bump });
  /* GN-20: a socket sits in one room at a time. Seating it in another first takes it out of the one it was in, as a
     disconnect would, so it never hears two rooms' states. socket.data.as is the player it sits as. */
  const attach = (code) => {
    if (socket.data.code && socket.data.code !== code) awayFromRoom();
    socket.data.code = code; socket.data.as = socket.data.playerId;
    if (!roomSockets.has(code)) roomSockets.set(code, new Set());
    roomSockets.get(code).add(socket);
  };
  const detach = () => { const set = roomSockets.get(socket.data.code); if (set) set.delete(socket); socket.data.code = null; };
  /* This socket stops being in its room (it disconnected, or it sat down in another room). Its player shows away,
     with the AFK clock if it is their turn, unless another socket of theirs is still in the room (a rejoin that
     beat the old socket's timeout). */
  function awayFromRoom() {
    const room = currentRoom();
    const as = socket.data.as || socket.data.playerId;
    detach();
    if (!room || !rooms.has(room.code)) return;
    const p = room.players.find((q) => q.id === as);
    // A watcher in the waiting line who goes away leaves the line (they can join again).
    if (!p && room.waiting && room.waiting.some((w) => w.id === as)) { room.waiting = room.waiting.filter((w) => w.id !== as); bump(room); return; }
    const still = p && [...(roomSockets.get(room.code) || [])].some((s) => (s.data.as || s.data.playerId) === as);
    if (p && !still) { p.connected = false; if (room.voice) room.voice.delete(room.players.indexOf(p)); ensureHost(room); }
    if (p && !still && room.status === "playing" && room.players[room.turn] === p) armTimer(room.code);   // 5 s clock while they are away (GN-10: before the state)
    room.v++;
    sendState(room.code);
  }

  on("create", ({ name, playerId, avatar, plus, look, crew, caps, power, mode } = {}) => {
    name = capName(name); if (!name) return refuse(socket, "name_required", "Pick a name first.", "create"); name = Moderation.name(name);
    const code = Plus.crewCode({ plus, crew }, rooms, newCode);   // GameNest Plus's crew code (2026-10-17)
    const room = { code, status: "lobby", host: playerId, players: [], chat: [], log: "", v: 1, touched: Date.now(), voice: new Set() };
    if (mode === "power" && Power.knows(caps)) room.mode = "power";   // Power mode from the start is quick play's; a private room's host picks it in the lobby (settings)
    room.players.push({ id: playerId, name, avatar: capAvatar(avatar) || "\u{1F40D}", bot: false, left: false, connected: true, pw: Power.seat(caps, power), sixRule: saysSixRule(caps) });
    rooms.set(code, room);
    socket.data.playerId = playerId;
    attach(code);
    stampPlus(code, socket, { plus, look }); socket.emit("joined", { code });
    bump(room);
  });

  on("join", ({ code, name, playerId, avatar, plus, look, caps, power } = {}) => {
    code = clean(code, 6).toUpperCase();
    const room = rooms.get(code);
    if (!room) return refuse(socket, "not_found", "No room with that code.", "join");
    socket.data.playerId = playerId;
    const existing = room.players.find((p) => p.id === playerId);
    if (existing) {
      if (!existing.pw) existing.pw = Power.seat(caps, null);
      if (caps !== undefined) { existing.pw.knows = Power.knows(caps); existing.sixRule = saysSixRule(caps); }
      Power.take(existing.pw, power, room.pw && room.pw.game);   // back with their stock as their phone has it
      existing.connected = true; existing.left = false; humanIsBack(room, existing, "reconnected"); attach(code); stampPlus(code, socket, { plus, look }); socket.emit("joined", { code });
      if (room.status === "playing" && room.players[room.turn] === existing) armTimer(code);   // GN-10: the deadline before the state
      bump(room);
      return;
    }
    if (room.status !== "lobby") {
      // An app that knows the line waits in it; an older one hears the game has started.
      if (!(Array.isArray(caps) && caps.includes("waitList"))) return refuse(socket, "started", "That game already started.", "join");
      room.waiting = room.waiting || [];
      let w = room.waiting.find((q) => q.id === playerId);
      if (!w) {
        if (room.players.filter((p) => !p.left).length + room.waiting.length >= MAX_PLAYERS * 2) return refuse(socket, "full", "Room is full.", "join");
        name = capName(name); if (!name) return refuse(socket, "name_required", "Pick a name first.", "join"); name = Moderation.name(name);
        w = { id: playerId, name, avatar: capAvatar(avatar) || "\u{1F40D}", plus: plus === true, acct: Plus.acctOf(socket), look: Plus.cleanLook(look), pw: Power.seat(caps, power), sixRule: saysSixRule(caps) };
        room.waiting.push(w);
        room.log = `${name} is waiting for a seat.`;
      }
      attach(code);
      socket.emit("joined", { code, waiting: true });
      takeLeftSeats(room);
      bump(room);
      return;
    }
    if (room.players.length >= MAX_PLAYERS) return refuse(socket, "full", "Room is full (8).", "join");
    name = capName(name); if (!name) return refuse(socket, "name_required", "Pick a name first.", "join"); name = Moderation.name(name);
    room.players.push({ id: playerId, name, avatar: capAvatar(avatar) || "\u{1F40D}", bot: false, left: false, connected: true, pw: Power.seat(caps, power), sixRule: saysSixRule(caps) });
    attach(code);
    stampPlus(code, socket, { plus, look }); socket.emit("joined", { code });
    room.log = `${name} joined.`;
    bump(room);
  });

  on("addBot", () => {
    const room = currentRoom();
    if (!room || room.status !== "lobby" || room.host !== socket.data.playerId) return;
    const b = addBotTo(room);
    if (b) { room.log = `${b.name} (bot) joined.`; bump(room); }
  });
  on("removeBot", () => {
    const room = currentRoom();
    if (!room || room.status !== "lobby" || room.host !== socket.data.playerId) return;
    for (let i = room.players.length - 1; i >= 0; i--) if (room.players[i].bot) { room.players.splice(i, 1); break; }
    bump(room);
  });

  on("start", () => {
    const room = currentRoom();
    if (!room || room.status !== "lobby" || room.host !== socket.data.playerId) return;
    if (room.players.filter((p) => !p.left).length < MIN_PLAYERS) return refuse(socket, "not_enough_players", "Need at least 2 players — add a bot.", "start");
    modeFollowsHost(room);
    setupGame(room);
    bump(room);
  });

  on("settings", ({ diceMode, finish, mode } = {}) => {   // T12: host picks one die or two-with-a-choice; and the finish (lobby only); and the mode (2026-11-13)
    const room = currentRoom();
    if (!room || room.status !== "lobby" || room.host !== socket.data.playerId) return;
    const dOk = diceMode === "one" || diceMode === "two", fOk = finish === "reach" || finish === "exact";
    const mOk = (mode === "classic" || mode === "power") && mode !== (room.mode || "classic") && !room.quick;   // a quick room keeps the mode it was matched on
    if (!dOk && !fOk && !mOk) return;
    if (mOk) {
      const host = room.players.find((p) => p.id === socket.data.playerId);
      if (mode === "power" && !(host && host.pw && host.pw.knows)) return socket.emit("refusal", { code: "power", message: "Update GameNest to play Power mode.", op: "settings" });
      room.mode = mode;
      room.log = mode === "power" ? "Power mode: power-ups on. No coin tables." : "Classic mode.";
    }
    if (dOk) {
      room.diceMode = diceMode;
      room.log = diceMode === "two" ? "Dice: roll two, pick the one you use." : "Dice: one die, classic.";
    }
    if (fOk) {
      room.finish = finish;
      room.log = finish === "exact" ? "Finish: land exactly on 100; too far bounces back." : "Finish: reach 100 to win.";
    }
    bump(room);
  });
  /* The host's pick of the table's look in a Plus room's lobby (the Maharaja's Palace or Pharaoh's Gold): plus.js decides who may; every app redraws it from the state. */
  on("look", ({ slot, id } = {}) => {
    const room = currentRoom();
    if (room && Plus.pickLook(room, socket.data.playerId, slot, id)) bump(room);
  });
  on("roll", () => {
    const room = currentRoom();
    if (!room || room.status !== "playing") return;
    const seat = room.players.findIndex((p) => p.id === socket.data.playerId);
    if (seat >= 0 && humanIsBack(room, room.players[seat], "took the seat back")) bump(room);   // any action reclaims a bot-controlled seat
    if (seat !== room.turn || room.dice) return;
    performRoll(room);
    if (room.status === "playing") armTimer(room.code);   // GN-10
    bump(room);
  });
  on("pick", ({ i } = {}) => {   // T12: choose which of the two dice to use
    const room = currentRoom();
    if (!room || room.status !== "playing" || !room.dice) return;
    const seat = room.players.findIndex((p) => p.id === socket.data.playerId);
    if (seat >= 0 && humanIsBack(room, room.players[seat], "took the seat back")) bump(room);
    if (seat !== room.turn || (i !== 0 && i !== 1)) return;
    pickDie(room, i);
    if (room.status === "playing") armTimer(room.code);   // GN-10
    bump(room);
  });
  /* Power mode: one message to use a power-up ({ kind }), on your turn, before you roll. */
  on("power", ({ kind } = {}) => {
    const room = currentRoom();
    if (!room || room.status !== "playing") return;
    const no = (message) => socket.emit("refusal", { code: "power", message, op: "power" });
    if (room.mode !== "power") return no("Power-ups are for Power rooms.");   // a Classic room never takes one, whatever the app sends
    const seat = room.players.findIndex((p) => p.id === socket.data.playerId);
    if (seat < 0) return;
    if (humanIsBack(room, room.players[seat], "took the seat back")) bump(room);   // any action reclaims a bot-controlled seat
    if (seat !== room.turn) return no("Wait for your turn.");
    const why = usePower(room, kind);
    if (why) return no(why);
    bump(room);
  });
  /* What the player owns now (they bought a pack, or the starter gift arrived): the same payload as on join. */
  on("powerStock", (payload) => {
    const room = currentRoom();
    if (!room) return;
    const self = room.players.find((p) => p.id === socket.data.playerId) || (room.waiting || []).find((w) => w.id === socket.data.playerId);   // someone waiting in line keeps theirs up to date too
    if (!self || !self.pw || !Power.take(self.pw, payload, room.pw && room.pw.game)) return;
    bump(room);
  });
  if (process.env.TEST_HOOKS === "1") on("__test", ({ dice, pos, turn } = {}) => {   // test-only: the next rolls, a staged position, whose turn it is
    const room = currentRoom();
    if (!room || room.status !== "playing") return;
    if (Array.isArray(dice)) room.testDice = dice.filter((d) => Number.isInteger(d) && d >= 1 && d <= 6).slice(0, 200);
    if (Array.isArray(pos) && pos.length === room.pos.length) room.pos = pos.map((n) => Math.min(99, Math.max(0, Number(n) || 0)));
    if (Number.isInteger(turn) && room.players[turn] && !room.players[turn].left) { room.dice = null; room.turn = turn; room.sixes = 0; if (room.pw) { room.pw.turnUsed = false; room.pw.again = false; room.pw.now = false; } }
    armTimer(room.code);
    bump(room);
  });
  on("takeSeat", () => {
    const room = currentRoom(); if (!room) return;
    const self = room.players.find((q) => q.id === socket.data.playerId);
    if (self && humanIsBack(room, self, "took the seat back")) bump(room);
  });
  on("pushToken", ({ token } = {}) => { const room = currentRoom(); if (!room) return; const p = room.players.find((q) => q.id === socket.data.playerId); if (p && typeof token === "string" && /^[0-9a-f]{32,200}$/i.test(token)) p.pushToken = token; });
  on("presence", ({ away } = {}) => { const room = currentRoom(); if (!room) return; const p = room.players.find((q) => q.id === socket.data.playerId); if (p) p.away = !!away; });


  on("chat", ({ t } = {}) => {
    const room = currentRoom();
    if (!room) return;
    const seat = room.players.findIndex((p) => p.id === socket.data.playerId);
    const me = room.players[seat];
    if (!me || me.left) return;
    const now = Date.now();
    if (me._lastChat && now - me._lastChat < 700) return;
    me._lastChat = now;
    t = clean(t, 140); if (!t) return;
    const code = room.code, pid = me.id;
    Moderation.chat(t).then((shown) => {
      const room = rooms.get(code), me = room && room.players.find((q) => q.id === pid);   // gone while it was read
      if (!me || me.left) return;
      room.chat.push({ n: me.name, a: me.avatar, t: shown }); for (const q of room.players) if (q !== me) pushTo(q, me.name + ": " + shown, { code: room.code, game: PUSH_TITLE }, room.code + "-chat");
      if (room.chat.length > 200) room.chat.splice(0, room.chat.length - 200);
      bump(room);
    });
  });

  on("voice", ({ kind, to, data } = {}) => {
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

  on("rematch", () => {
    const room = currentRoom();
    if (!room || room.status !== "over" || room.host !== socket.data.playerId) return;
    room.players = room.players.filter((p) => !p.left);
    seatTheLine(room);
    if (room.players.filter((p) => !p.bot).length === 0) { deleteRoom(room.code); return; }
    if (room.players.length < MIN_PLAYERS) { room.status = "lobby"; room.log = "Back to the lobby."; bump(room); return; }
    setupGame(room);
    bump(room);
  });

  function handleLeave() {
    const room = currentRoom();
    if (!room) return detach();
    const p = room.players.find((q) => q.id === (socket.data.as || socket.data.playerId));
    if (!p) {
      // Out of the waiting line.
      const before = (room.waiting || []).length;
      room.waiting = (room.waiting || []).filter((w) => w.id !== socket.data.playerId);
      detach();
      if (room.waiting.length !== before) bump(room);
      return;
    }
    if (room.voice) room.voice.delete(room.players.indexOf(p));
    if (room.status === "lobby") {
      room.players = room.players.filter((q) => q.id !== p.id);
      if (room.players.length === 0 || room.players.every((q) => q.bot)) { detach(); deleteRoom(room.code); return; }
      if (room.host === p.id) { room.host = (room.players.find((q) => !q.bot) || room.players[0]).id; modeFollowsHost(room); }
      room.log = `${p.name} left.`;
    } else {
      const seat = room.players.indexOf(p);
      p.left = true; p.connected = false;
      // The first in line takes the seat before anything is decided for want of players.
      const taken = takeLeftSeats(room);
      if (room.players.every((q) => q.bot || q.left)) { detach(); deleteRoom(room.code); return; }
      if (room.host === p.id) room.host = (room.players.find((q) => !q.bot && !q.left) || room.players[0]).id;
      if (!taken) room.log = `${p.name} left the game.`;
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
  on("leave", () => handleLeave());
  socket.on("disconnect", () => { if (currentRoom()) awayFromRoom(); });
});

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) if (now - room.touched > 2 * 60 * 60 * 1000) deleteRoom(code);
}, 10 * 60 * 1000).unref();   // the listening server keeps the process up; a test that only requires this file can exit

if (require.main === module) server.listen(PORT, () => console.log("Snakes & Ladders running on port " + PORT));
/* which layout (and whether its mirror) a seed deals: for the app's parity test (Tools/qa/parity.js), which holds the app to knowing every board the server can deal */
function layoutOf(seed) { const b = Layouts.pick(seed); return { id: b.id, mirrored: b.mirrored }; }

module.exports = { genBoard, layoutOf, botPickDie, chase, capName, capAvatar, FEATURES, botThinkMs, LADDERS, SNAKES,
  Power, rooms, roomSockets, timers, botTimers, setupGame, setupPower, powerCan, powerView, powerMe, usePower, botPower, landOn, touching, boostReach, sixRule, performRoll, applyMove, pickDie, nextTurn, onTurnTimeout };
