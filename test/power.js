/* Power mode (2026-11-13): every rule of it, proved twice over.
   Part 1 is in-process (scripted tables on a board of its own, no port): the antidote, the ladder boost, the re-roll, the
   caps, Classic, the bots, a timeout.
   Part 2 starts its own server (TEST_HOOKS=1, fast clocks) and talks to it as the app does: who may host, the stock and who
   sees it, the one message and the one broadcast, old apps, a reconnect, a timeout, bots, quick play.
   Run from the repo root: node test/power.js   (TEST_PORT2 picks the port) */
const assert = require("assert");
const { spawn } = require("child_process");
const { io } = require("socket.io-client");
process.env.BOT_MS = "5";
const S = require("../server.js");
const PORT = Number(process.env.TEST_PORT2 || 3622), BASE = `http://localhost:${PORT}`;
if (PORT >= 3111 && PORT <= 3126) { console.error("refusing " + PORT + ": a live server's port"); process.exit(2); }
const TURN_MS = 2500;
let passed = 0, failed = 0;
const ok = async (name, fn) => { try { await fn(); passed++; console.log("  ok " + name); } catch (e) { failed++; console.log("  FAIL " + name + "\n      " + ((e && e.message) || e)); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms = 4000, step = 15) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await sleep(step); } return false; };

/* ---------- part 1: scripted tables ----------
   The board of these tables: ladders 10>30 and 12>50 (both one square from 11, the taller is 12's), 82>92 and 84>94 (the
   same height either side of 83), 40>60; serpents 25>5, 70>55, 98>78. */
const LADDERS = { 10: 30, 12: 50, 40: 60, 82: 92, 84: 94 }, SNAKES = { 25: 5, 70: 55, 98: 78 };
let nTable = 0;
function table(o = {}) {
  const seat = (id, stock, bot) => Object.assign({ id, name: id, avatar: "x", left: false, connected: true, pw: S.Power.seat(bot ? null : ["power"], stock || null) }, bot ? { bot: true } : { bot: false });
  const room = { code: "PWT" + (++nTable), mode: o.mode || "power", status: "playing", host: "Ava", chat: [], log: "", v: 1, touched: Date.now(), voice: new Set(),
    players: [seat("Ava", o.a, o.aBot), seat("Ben", o.b, o.bBot)], ladders: LADDERS, snakes: SNAKES, dice: null, diceMode: o.diceMode || "one", finish: o.finish,
    pos: (o.pos || [0, 0]).slice(), turn: o.turn || 0, sixes: 0, lastMove: null, winner: null, standings: null, testDice: (o.dice || []).slice() };
  S.setupPower(room);
  S.rooms.set(room.code, room);
  return room;
}
const quiet = () => { for (const m of [S.timers, S.botTimers]) { for (const t of m.values()) clearTimeout(t); m.clear(); } };
const FULL = { antidote: 5, ladder: 5, reroll: 5 };
const NONE = { antidote: 0, ladder: 0, reroll: 0 };

async function part1() {
  console.log("snakes power: the rules (scripted tables)");

  await ok("antidote: tapped before the roll, the ring is in the state and one use is gone", () => {
    const room = table({ a: FULL, pos: [20, 0] });
    assert.deepStrictEqual(S.powerCan(room, 0), { antidote: true, ladder: true, reroll: true });
    assert.deepStrictEqual(S.powerCan(room, 1), { antidote: false, ladder: false, reroll: false }, "not Ben's turn");
    assert.strictEqual(S.usePower(room, "antidote"), null);
    const view = S.powerView(room);
    assert.deepStrictEqual(view.seats[0], { used: 1, antidote: true, ladder: false });
    assert.deepStrictEqual(view.seats[1], { used: 0, antidote: false, ladder: false });
    assert.deepStrictEqual(view.last, { id: 1, seat: 0, kind: "antidote" });
    assert.strictEqual(view.max, 3);
    assert.strictEqual(room.players[0].pw.stock.antidote, 4);
    assert.strictEqual(room.players[0].pw.left, 2);
    assert.deepStrictEqual(S.powerMe(room, 0).can, { antidote: false, ladder: false, reroll: false }, "one a turn");
  });
  await ok("antidote: one bite does nothing (the pawn stays on the head, the ring pops), and the next bite is real", () => {
    const room = table({ a: FULL, pos: [20, 0], dice: [5] });
    assert.strictEqual(S.usePower(room, "antidote"), null);
    S.performRoll(room);
    assert.strictEqual(room.pos[0], 25, "on the snake's head");
    assert.strictEqual(room.lastMove.noBite, 25);
    assert.strictEqual(room.lastMove.via, null);
    assert.strictEqual(room.lastMove.to, 25);
    assert.strictEqual(room.lastMove.landed, 25);
    assert.strictEqual(room.pw.marks[0].antidote, false, "the ring pops");
    assert.ok(/No bite/.test(room.log));
    assert.strictEqual(room.turn, 1);
    // the next bite is real
    room.turn = 0; room.pos[0] = 64; room.testDice = [6, 1];
    S.performRoll(room);
    assert.strictEqual(room.pos[0], 55);
    assert.strictEqual(room.lastMove.noBite, undefined);
    assert.deepStrictEqual(room.lastMove.via, { kind: "snake", from: 70, to: 55 });
  });
  await ok("antidote: it waits through moves that meet no snake, and one ring at a time", () => {
    const room = table({ a: FULL, pos: [1, 0], dice: [2, 3] });
    assert.strictEqual(S.usePower(room, "antidote"), null);
    S.performRoll(room);
    assert.strictEqual(room.pos[0], 3);
    assert.strictEqual(room.pw.marks[0].antidote, true);
    room.turn = 0; room.pw.turnUsed = false;   // their next turn
    assert.strictEqual(S.powerCan(room, 0).antidote, false);
    assert.strictEqual(S.usePower(room, "antidote"), "Your pawn has an antidote already.");
    assert.strictEqual(room.players[0].pw.spent.antidote, 1, "a refused use spends nothing");
    assert.strictEqual(room.players[0].pw.left, 2);
  });
  await ok("ladder boost: a move that ends one square before a ladder's foot hops to the foot and climbs", () => {
    const room = table({ a: FULL, pos: [36, 0], dice: [3] });
    assert.strictEqual(S.usePower(room, "ladder"), null);
    assert.strictEqual(S.powerView(room).seats[0].ladder, true);
    S.performRoll(room);
    assert.strictEqual(room.pos[0], 60);
    assert.deepStrictEqual(room.lastMove.boost, { from: 39, foot: 40 });
    assert.deepStrictEqual(room.lastMove.via, { kind: "ladder", from: 40, to: 60 });
    assert.strictEqual(room.lastMove.landed, 39);
    assert.strictEqual(room.lastMove.to, 60);
    assert.strictEqual(room.pw.marks[0].ladder, false, "the mark is used");
    assert.ok(/hopped to the ladder at 40 and climbed to 60/.test(room.log));
  });
  await ok("ladder boost: one square after the foot likewise", () => {
    const room = table({ a: FULL, pos: [37, 0], dice: [4] });
    assert.strictEqual(S.usePower(room, "ladder"), null);
    S.performRoll(room);
    assert.strictEqual(room.pos[0], 60);
    assert.deepStrictEqual(room.lastMove.boost, { from: 41, foot: 40 });
  });
  await ok("ladder boost: two ladders in reach, the taller climb; the same height, the one ahead", () => {
    const room = table({ a: FULL, pos: [8, 0], dice: [3] });
    assert.strictEqual(S.usePower(room, "ladder"), null);
    S.performRoll(room);
    assert.deepStrictEqual(room.lastMove.boost, { from: 11, foot: 12 });
    assert.strictEqual(room.pos[0], 50);
    const even = table({ a: FULL, pos: [80, 0], dice: [3] });
    assert.strictEqual(S.usePower(even, "ladder"), null);
    S.performRoll(even);
    assert.deepStrictEqual(even.lastMove.boost, { from: 83, foot: 84 });
    assert.strictEqual(even.pos[0], 94);
  });
  await ok("ladder boost: it waits through a move nowhere near a foot, a move onto a foot (a plain climb) and a move onto a head (a bite)", () => {
    const room = table({ a: FULL, pos: [1, 0], dice: [1, 1, 5] });
    assert.strictEqual(S.usePower(room, "ladder"), null);
    S.performRoll(room);   // 2: nothing near
    assert.strictEqual(room.pos[0], 2);
    assert.strictEqual(room.lastMove.boost, undefined);
    assert.strictEqual(room.pw.marks[0].ladder, true);
    room.turn = 0; room.pos[0] = 39;
    S.performRoll(room);   // onto the foot at 40
    assert.strictEqual(room.pos[0], 60);
    assert.strictEqual(room.lastMove.boost, undefined);
    assert.strictEqual(room.pw.marks[0].ladder, true, "a plain climb keeps the mark");
    room.turn = 0; room.pos[0] = 20;
    S.performRoll(room);   // onto the head at 25
    assert.strictEqual(room.pos[0], 5);
    assert.strictEqual(room.pw.marks[0].ladder, true, "a bite keeps the mark");
    room.turn = 0; room.pw.turnUsed = false;
    assert.strictEqual(S.usePower(room, "ladder"), "Your pawn has a ladder boost already.");
  });
  await ok("the antidote and the ladder boost on one pawn: each waits for its own moment", () => {
    const room = table({ a: FULL, pos: [20, 0], dice: [5, 2] });
    assert.strictEqual(S.usePower(room, "antidote"), null);
    room.pw.turnUsed = false;   // as on their next turn
    assert.strictEqual(S.usePower(room, "ladder"), null);
    S.performRoll(room);   // the head at 25: no bite, the ladder mark stays
    assert.strictEqual(room.pos[0], 25);
    assert.strictEqual(room.lastMove.noBite, 25);
    assert.deepStrictEqual(room.pw.marks[0], { antidote: false, ladder: true });
    room.turn = 0; room.pos[0] = 37;
    S.performRoll(room);   // 39: the hop
    assert.strictEqual(room.pos[0], 60);
    assert.deepStrictEqual(room.pw.marks[0], { antidote: false, ladder: false });
  });
  await ok("ladder boost after the exact finish's bounce: the square the move ends on is what counts", () => {
    const room = table({ a: FULL, pos: [99, 0], dice: [6], finish: "exact" });
    room.ladders = Object.assign({}, LADDERS, { 94: 96 });
    assert.strictEqual(S.usePower(room, "ladder"), null);
    S.performRoll(room);   // 99 + 6 bounces to 95: one after the foot at 94
    assert.strictEqual(room.lastMove.bounced, true);
    assert.strictEqual(room.lastMove.landed, 95);
    assert.deepStrictEqual(room.lastMove.boost, { from: 95, foot: 94 });
    assert.strictEqual(room.pos[0], 96);
  });
  await ok("re-roll: tapped before the roll, the player rolls twice this turn, and the second roll is marked", () => {
    const room = table({ a: FULL, pos: [1, 1], dice: [2, 3, 4] });
    assert.strictEqual(S.usePower(room, "reroll"), null);
    assert.strictEqual(S.powerView(room).reroll, "armed");
    S.performRoll(room);
    assert.strictEqual(room.pos[0], 3);
    assert.strictEqual(room.turn, 0, "the turn did not pass");
    assert.strictEqual(room.lastMove.reroll, undefined, "the first roll is a plain one");
    assert.strictEqual(S.powerView(room).reroll, "now");
    assert.ok(/Re-roll: roll again\./.test(room.log));
    assert.deepStrictEqual(S.powerCan(room, 0), { antidote: false, ladder: false, reroll: false }, "one a turn");
    S.performRoll(room);
    assert.strictEqual(room.pos[0], 6);
    assert.strictEqual(room.lastMove.reroll, true);
    assert.strictEqual(room.turn, 1, "then the turn passes");
    assert.strictEqual(S.powerView(room).reroll, null);
    S.performRoll(room);
    assert.strictEqual(room.lastMove.seat, 1);
    assert.strictEqual(room.lastMove.reroll, undefined);
    assert.strictEqual(room.turn, 0);
  });
  await ok("re-roll: a first move that wins ends the game", () => {
    const room = table({ a: FULL, pos: [97, 0], dice: [3, 2] });
    assert.strictEqual(S.usePower(room, "reroll"), null);
    S.performRoll(room);
    assert.strictEqual(room.status, "over");
    assert.strictEqual(room.winner, 0);
    assert.strictEqual(room.testDice.length, 1, "no second roll");
  });
  await ok("re-roll and sixes: a six rolls again as ever and the re-roll waits; a third six keeps the turn once", () => {
    const room = table({ a: FULL, pos: [1, 1], dice: [6, 2, 3] });
    assert.strictEqual(S.usePower(room, "reroll"), null);
    S.performRoll(room);   // the six: roll again by the die's own rule
    assert.strictEqual(room.turn, 0);
    assert.strictEqual(S.powerView(room).reroll, "armed", "still waiting");
    S.performRoll(room);   // 2: the turn would pass; the re-roll keeps it
    assert.strictEqual(room.turn, 0);
    assert.strictEqual(S.powerView(room).reroll, "now");
    S.performRoll(room);
    assert.strictEqual(room.lastMove.reroll, true);
    assert.strictEqual(room.turn, 1);
    const three = table({ a: FULL, pos: [1, 1], dice: [6, 6, 6, 1] });
    assert.strictEqual(S.usePower(three, "reroll"), null);
    S.performRoll(three); S.performRoll(three); S.performRoll(three);
    assert.strictEqual(three.turn, 0, "three sixes would pass the turn; the re-roll keeps it once");
    assert.strictEqual(three.sixes, 0);
    S.performRoll(three);
    assert.strictEqual(three.turn, 1);
  });
  await ok("two dice: no power-up while a pick is pending, and the re-roll works with the pick", () => {
    const room = table({ a: FULL, pos: [1, 1], dice: [2, 3, 4, 5], diceMode: "two" });
    assert.strictEqual(S.usePower(room, "reroll"), null);
    S.performRoll(room);
    assert.deepStrictEqual(room.dice, [2, 3]);
    room.pw.turnUsed = false;   // even were this another turn
    assert.strictEqual(S.usePower(room, "antidote"), "Pick a die first.");
    assert.deepStrictEqual(S.powerCan(room, 0), { antidote: false, ladder: false, reroll: false });
    room.pw.turnUsed = true;
    S.pickDie(room, 1);
    assert.strictEqual(room.pos[0], 4);
    assert.strictEqual(room.turn, 0);
    S.performRoll(room);
    assert.deepStrictEqual(room.dice, [4, 5]);
    S.pickDie(room, 0);
    assert.strictEqual(room.pos[0], 8);
    assert.strictEqual(room.lastMove.reroll, true);
    assert.strictEqual(room.turn, 1);
  });
  await ok("the caps: three uses a game, one a turn (a six's extra roll is the same turn), and none without stock", () => {
    const room = table({ a: { antidote: 5, ladder: 5, reroll: 0 }, pos: [1, 1], dice: [6] });
    assert.strictEqual(S.usePower(room, "reroll"), "You have none of those.");
    assert.strictEqual(S.usePower(room, "sword"), "No such power-up.");
    assert.strictEqual(S.usePower(room, "antidote"), null);
    assert.strictEqual(S.usePower(room, "ladder"), "One power-up a turn.");
    S.performRoll(room);   // a six: the same turn goes on
    assert.strictEqual(room.turn, 0);
    assert.strictEqual(S.usePower(room, "ladder"), "One power-up a turn.");
    room.turn = 1; S.nextTurn(room);   // round to Ava again
    assert.strictEqual(room.turn, 0);
    assert.strictEqual(S.usePower(room, "ladder"), null);
    S.nextTurn(room); S.nextTurn(room);
    room.pw.marks[0].antidote = false;   // the antidote was used up on a bite
    assert.strictEqual(S.usePower(room, "antidote"), null);
    assert.strictEqual(room.players[0].pw.left, 0);
    S.nextTurn(room); S.nextTurn(room);
    room.pw.marks[0].ladder = false;
    assert.strictEqual(S.usePower(room, "ladder"), "No uses left this game.");
    assert.deepStrictEqual(S.powerCan(room, 0), { antidote: false, ladder: false, reroll: false });
    assert.strictEqual(S.powerView(room).seats[0].used, 3);
    assert.deepStrictEqual(room.players[0].pw.stock, { antidote: 3, ladder: 4, reroll: 0 });
  });
  await ok("Classic: no power-up, no Power state, and a move is what it always was", () => {
    const room = table({ mode: "classic", a: FULL, pos: [20, 0], dice: [5] });
    assert.strictEqual(room.pw, null);
    assert.strictEqual(S.usePower(room, "antidote"), "Power-ups are for Power rooms.");
    assert.deepStrictEqual(S.powerCan(room, 0), { antidote: false, ladder: false, reroll: false });
    assert.strictEqual(S.botPower(room), false);
    S.performRoll(room);
    assert.strictEqual(room.pos[0], 5, "bitten as ever");
    assert.deepStrictEqual(Object.keys(room.lastMove), ["seat", "roll", "dice", "pick", "from", "landed", "to", "bounced", "via", "mv"]);
    assert.deepStrictEqual(room.players[0].pw.stock, FULL);
  });
  await ok("a Power room's move with no power-up in play has the same fields as a Classic one", () => {
    const room = table({ a: FULL, pos: [20, 0], dice: [5] });
    S.performRoll(room);
    assert.strictEqual(room.pos[0], 5);
    assert.deepStrictEqual(Object.keys(room.lastMove), ["seat", "roll", "dice", "pick", "from", "landed", "to", "bounced", "via", "mv"]);
  });
  await ok("bots: each gets the rounded mean of the humans' usable counts, and none when no human owns any", () => {
    const P = S.Power;
    const pw = (stock) => P.seat(["power"], stock);
    assert.strictEqual(P.botUses([pw({ antidote: 1, ladder: 0, reroll: 0 })]), 1);
    assert.strictEqual(P.botUses([pw(FULL)]), 3, "the smaller of 3 and what they own");
    assert.strictEqual(P.botUses([pw(FULL), pw(NONE)]), 2, "3 and 0: 1.5 rounds to 2");
    assert.strictEqual(P.botUses([pw({ antidote: 1, ladder: 0, reroll: 0 }), pw(NONE), pw(NONE)]), 0, "a third of one rounds to none");
    assert.strictEqual(P.botUses([pw(NONE), pw(NONE)]), 0);
    assert.strictEqual(P.botUses([P.seat(["waitList"], FULL)]), 0, "an old app owns nothing here");
    const room = table({ a: { antidote: 1, ladder: 1, reroll: 0 }, bBot: true });
    assert.strictEqual(room.players[1].pw.left, 2);
    assert.deepStrictEqual(room.players[1].pw.stock, { antidote: 2, ladder: 2, reroll: 2 });
  });
  await ok("bots: the antidote and the ladder boost at the start, then the re-roll, one a turn, and never more than their uses", () => {
    const room = table({ a: FULL, bBot: true, turn: 1, pos: [1, 1], dice: [1, 1, 1, 1, 1, 1, 1, 1] });
    assert.strictEqual(room.players[1].pw.left, 3);
    const kinds = [];
    for (let k = 0; k < 4; k++) {
      const used = S.botPower(room);
      if (used) kinds.push(room.pw.last.kind);
      assert.strictEqual(S.botPower(room), false, "one a turn");
      S.performRoll(room);
      if (room.turn === 1) S.performRoll(room);   // the re-roll's second roll
      assert.strictEqual(room.turn, 0);
      room.testDice.unshift(1); S.performRoll(room);   // Ava's turn
      assert.strictEqual(room.turn, 1);
    }
    assert.deepStrictEqual(kinds, ["antidote", "ladder", "reroll"]);
    assert.strictEqual(room.players[1].pw.left, 0);
    assert.strictEqual(S.powerView(room).seats[1].used, 3);
  });
  await ok("bots: none when no human owns any; and a seat a bot minds for a timed-out person never spends that person's", () => {
    const none = table({ a: NONE, bBot: true, turn: 1 });
    assert.strictEqual(none.players[1].pw.left, 0);
    assert.strictEqual(S.botPower(none), false);
    const room = table({ a: FULL, b: FULL });
    room.players[0].botControlled = true;
    assert.strictEqual(S.botPower(room), false);
    assert.deepStrictEqual(room.players[0].pw.stock, FULL);
  });
  await ok("a timeout: the roll is made for them and no power-up is spent", () => {
    const room = table({ a: FULL, b: FULL, pos: [1, 1], dice: [2] });
    S.onTurnTimeout(room.code);
    quiet();
    assert.strictEqual(room.pos[0], 3);
    assert.strictEqual(room.turn, 1);
    assert.deepStrictEqual(room.players[0].pw.stock, FULL);
    assert.strictEqual(room.players[0].pw.left, 3);
    assert.strictEqual(room.pw.last, null);
  });
  await ok("a new game: every use back, no ring, a new game id; the stock stays what was left", () => {
    const room = table({ a: FULL, pos: [1, 1] });
    assert.strictEqual(S.usePower(room, "antidote"), null);
    const first = room.pw.game;
    S.setupPower(room);
    assert.notStrictEqual(room.pw.game, first);
    assert.strictEqual(room.players[0].pw.left, 3);
    assert.deepStrictEqual(room.players[0].pw.spent, NONE);
    assert.deepStrictEqual(room.players[0].pw.stock, { antidote: 4, ladder: 5, reroll: 5 });
    assert.deepStrictEqual(room.pw.marks, [{ antidote: false, ladder: false }, { antidote: false, ladder: false }]);
    assert.strictEqual(room.pw.seq, 1, "the uses' ids keep counting");
    assert.strictEqual(room.pw.last, null);
  });
  await ok("the stock an app sends: clamped 0..99, whole numbers only, and a use it has not counted yet is not counted twice", () => {
    const P = S.Power;
    assert.deepStrictEqual(P.clean({ antidote: 500, ladder: -2, reroll: 1.5, shield: 9 }), { antidote: 99, ladder: 0, reroll: 0 });
    assert.deepStrictEqual(P.clean("lots"), NONE);
    const pw = P.seat(["power"], { antidote: 3, ladder: 0, reroll: 0 });
    P.spend(pw, "antidote");
    P.take(pw, { antidote: 3, ladder: 0, reroll: 0 }, "g1");   // the phone had not counted the use
    assert.strictEqual(pw.stock.antidote, 2);
    P.take(pw, { antidote: 2, ladder: 0, reroll: 0, seen: { game: "g1", antidote: 1 } }, "g1");   // now it has
    assert.strictEqual(pw.stock.antidote, 2);
    P.take(pw, { antidote: 7, ladder: 0, reroll: 0, seen: { game: "g1", antidote: 1 } }, "g1");   // and bought a pack
    assert.strictEqual(pw.stock.antidote, 7);
  });
  quiet();
  for (const code of [...S.rooms.keys()]) if (code.startsWith("PWT")) S.rooms.delete(code);
}

/* ---------- part 2: the app's side of the wire ---------- */
function client(name, extra) {
  const s = io(BASE, { transports: ["websocket"], reconnection: false });
  const p = { name, s, seat: -1, state: null, v: 0, id: name + "-" + Math.random().toString(36).slice(2, 8), joinedCode: null, refusals: [], errs: [], used: [], extra: extra || {} };
  s.on("state", ({ room, mySeat, v }) => { p.seat = mySeat; p.state = room; p.v = v; });
  s.on("joined", (j) => { p.joinedCode = j.code; });
  s.on("refusal", (r) => p.refusals.push(r));
  s.on("err", (e) => p.errs.push(e));
  s.on("powerUsed", (u) => p.used.push(u));
  return p;
}
const connected = (p) => new Promise((r) => (p.s.connected ? r() : p.s.once("connect", r)));
const NEW = { caps: ["waitList", "power"] }, OLD = { caps: ["waitList"] };
const ident = (p) => Object.assign({ name: p.name, playerId: p.id, avatar: "\u{1F98A}" }, p.extra);

/* A started two-seat game: A hosts (seat 0), B is the guest. */
async function game(aExtra, bExtra, mode = "power") {
  const A = client("Ava", aExtra), B = client("Ben", bExtra); await connected(A); await connected(B);
  A.s.emit("create", ident(A)); await until(() => A.joinedCode);
  B.s.emit("join", Object.assign({ code: A.joinedCode }, ident(B))); await until(() => B.state && B.state.players.length === 2);
  if (mode === "power") { A.s.emit("settings", { mode }); await until(() => A.state.mode === "power" && B.state.mode === "power"); }
  A.s.emit("start"); await until(() => A.state && A.state.status === "playing" && B.state.status === "playing");
  return { A, B, code: A.joinedCode };
}
const stage = async (p, o) => { const v = p.v; p.s.emit("__test", o); await until(() => p.v > v); };
const bye = (...ps) => ps.forEach((p) => p.s.disconnect());
/* a square with nothing on it or beside it: no head, no foot, no foot one square away */
const plain = (st, lo, hi) => { for (let n = lo; n <= hi; n++) if ([n - 1, n, n + 1].every((q) => st.ladders[q] === undefined && st.snakes[q] === undefined)) return n; throw new Error("no plain square"); };
const mine = (o) => Object.assign({ antidote: 0, ladder: 0, reroll: 0 }, o);

async function part2() {
  console.log("snakes power: the wire (its own server)");
  const srv = spawn(process.execPath, ["server.js"], { env: { ...process.env, PORT: String(PORT), TEST_HOOKS: "1", TURN_MS: String(TURN_MS), BOT_MS: "5", QUICK_FILL_MS: "4000", QUICK_FILL_MAX_MS: "6000" }, stdio: "ignore" });
  await sleep(700);
  try {
    await ok("hosting: an app that does not know Power mode cannot host one; one that does can, and the guest sees it", async () => {
      const A = client("Ava", OLD), B = client("Ben", NEW); await connected(A); await connected(B);
      A.s.emit("create", ident(A)); await until(() => A.joinedCode);
      B.s.emit("join", Object.assign({ code: A.joinedCode }, ident(B))); await until(() => B.state && B.state.players.length === 2);
      assert.ok(A.state.features.includes("power"), "the server says it knows Power mode");
      assert.strictEqual(A.state.mode, undefined, "a Classic room's state is what it always was");
      A.s.emit("settings", { mode: "power" });
      assert.ok(await until(() => A.refusals.length === 1), "refused");
      assert.deepStrictEqual(A.refusals[0], { code: "power", message: "Update GameNest to play Power mode.", op: "settings" });
      assert.strictEqual(A.state.mode, undefined);
      B.s.emit("settings", { mode: "power" });   // the guest is not the host
      await sleep(120);
      assert.strictEqual(B.state.mode, undefined);
      bye(A, B);
      const H = client("Hal", NEW), G = client("Gus", OLD); await connected(H); await connected(G);
      H.s.emit("create", ident(H)); await until(() => H.joinedCode);
      G.s.emit("join", Object.assign({ code: H.joinedCode }, ident(G))); await until(() => G.state && G.state.players.length === 2);
      H.s.emit("settings", { mode: "power" });
      assert.ok(await until(() => G.state.mode === "power" && H.state.mode === "power"));
      assert.strictEqual(H.state.power.max, 3);
      assert.strictEqual(H.state.power.game, null, "no game yet");
      assert.strictEqual(H.state.log, "Power mode: power-ups on. No coin tables.");
      H.s.emit("settings", { mode: "nonsense" }); await sleep(80);
      assert.strictEqual(H.state.mode, "power");
      H.s.emit("settings", { finish: "exact" });   // the other settings as ever, the mode untouched
      assert.ok(await until(() => H.state.finish === "exact" && H.state.mode === "power"));
      H.s.emit("settings", { mode: "classic" });
      assert.ok(await until(() => G.state.mode === undefined && G.state.power === undefined));
      // a Power lobby whose host leaves it to an older app is a Classic lobby again
      H.s.emit("settings", { mode: "power" }); await until(() => G.state.mode === "power");
      H.s.emit("leave");
      assert.ok(await until(() => G.state.players.length === 1 && G.state.mode === undefined), "the older app never hosts a Power room");
      bye(H, G);
    });

    await ok("the mode is the lobby's: it cannot change once the game is on", async () => {
      const { A, B } = await game(NEW, NEW, "classic");
      A.s.emit("settings", { mode: "power" }); await sleep(150);
      assert.strictEqual(A.state.mode, undefined);
      assert.strictEqual(A.state.power, undefined);
      bye(A, B);
    });

    await ok("a Classic room refuses a power-up, whatever the app sends, and its state has no new field but the feature's name", async () => {
      const { A, B } = await game({ caps: NEW.caps, power: { antidote: 5, ladder: 5, reroll: 5 } }, NEW, "classic");
      const head = Object.keys(A.state.snakes).map(Number)[0];
      await stage(A, { turn: 0, pos: [head - 2, 0], dice: [2, 1] });
      for (const kind of ["antidote", "ladder", "reroll"]) A.s.emit("power", { kind });
      assert.ok(await until(() => A.refusals.length === 3));
      assert.deepStrictEqual(A.refusals[0], { code: "power", message: "Power-ups are for Power rooms.", op: "power" });
      assert.strictEqual(A.errs.length, 0);
      A.s.emit("roll");
      assert.ok(await until(() => A.state.lastMove && A.state.lastMove.seat === 0));
      assert.strictEqual(A.state.pos[0], A.state.snakes[head], "bitten as ever");
      assert.strictEqual(A.state.turn, 1, "one roll as ever");
      assert.deepStrictEqual(Object.keys(A.state.lastMove).sort(), ["bounced", "from", "landed", "mv", "roll", "seat", "to", "via"]);
      assert.strictEqual(A.used.length + B.used.length, 0);
      assert.deepStrictEqual(Object.keys(A.state).slice(-10), ["features", "serverNow", "finish", "reactionsOn", "reactions", "ranked", "rankedModel", "rankedOn", "waiting", "waitPos"], "the state ends as it always did");
      bye(A, B);
    });

    await ok("the stock: clamped, and each player is told their own alone", async () => {
      const { A, B } = await game({ caps: NEW.caps, power: { antidote: 500, ladder: -3, reroll: 2 } }, { caps: NEW.caps, power: { antidote: 1, ladder: 1, reroll: 1 } });
      assert.deepStrictEqual(A.state.power.me.stock, { antidote: 99, ladder: 0, reroll: 2 });
      assert.deepStrictEqual(B.state.power.me.stock, { antidote: 1, ladder: 1, reroll: 1 });
      assert.strictEqual(A.state.power.me.left, 3);
      assert.ok(/^[0-9a-f]{8}$/.test(A.state.power.game));
      for (const seat of A.state.power.seats) assert.deepStrictEqual(Object.keys(seat).sort(), ["antidote", "ladder", "used"], "a seat shows its marks and its uses, never a stock");
      const others = JSON.stringify(Object.assign({}, B.state, { power: Object.assign({}, B.state.power, { me: null }) }));
      assert.ok(!others.includes("stock") && !others.includes("spent") && !others.includes('"left":3'), "nothing of Ava's stock reaches Ben");
      assert.ok(!JSON.stringify(A.state.players).includes("stock"));
      const keys = Object.keys(A.state);
      assert.deepStrictEqual(keys.slice(-2), ["mode", "power"], "the new fields come after every older one");
      bye(A, B);
    });

    await ok("a use end to end: one message, one broadcast to everyone, the ring and the uses in everyone's state; then no bite", async () => {
      const { A, B } = await game({ caps: NEW.caps, power: mine({ antidote: 3 }) }, NEW);
      const head = Object.keys(A.state.snakes).map(Number).find((h) => h > 8);
      await stage(A, { turn: 0, pos: [head - 3, 0], dice: [3] });
      assert.deepStrictEqual(A.state.power.me.can, { antidote: true, ladder: true, reroll: true });
      assert.deepStrictEqual(B.state.power.me.can, { antidote: false, ladder: false, reroll: false });
      B.s.emit("power", { kind: "antidote" });
      assert.ok(await until(() => B.refusals.length === 1));
      assert.strictEqual(B.refusals[0].message, "Wait for your turn.");
      A.s.emit("power", { kind: "antidote" });
      assert.ok(await until(() => A.used.length === 1 && B.used.length === 1), "everyone hears it");
      assert.deepStrictEqual(B.used[0], { id: 1, seat: 0, kind: "antidote" });
      assert.ok(await until(() => B.state.power.seats[0].antidote === true && B.state.power.seats[0].used === 1));
      assert.deepStrictEqual(B.state.power.last, { id: 1, seat: 0, kind: "antidote" });
      assert.strictEqual(B.state.log, "Ava used an Antidote.");
      assert.deepStrictEqual(A.state.power.me.stock, mine({ antidote: 2 }));
      assert.deepStrictEqual(A.state.power.me.spent, mine({ antidote: 1 }));
      assert.strictEqual(A.state.power.me.left, 2);
      A.s.emit("power", { kind: "antidote" });
      assert.ok(await until(() => A.refusals.length === 1));
      assert.strictEqual(A.refusals[0].message, "One power-up a turn.");
      assert.strictEqual(A.errs.length, 0, "a refused power-up is a refusal alone, never the old err");
      A.s.emit("roll");
      assert.ok(await until(() => B.state.lastMove && B.state.lastMove.seat === 0));
      assert.strictEqual(B.state.lastMove.noBite, head);
      assert.strictEqual(B.state.lastMove.via, null);
      assert.strictEqual(B.state.pos[0], head, "the pawn stays on the snake's head");
      assert.strictEqual(B.state.power.seats[0].antidote, false, "the ring pops");
      assert.strictEqual(B.state.power.seats[0].used, 1);
      bye(A, B);
    });

    await ok("the ladder boost and the re-roll over the wire, and a pack bought in the middle of the game is usable in it", async () => {
      const { A, B } = await game({ caps: NEW.caps, power: mine({ ladder: 1 }) }, NEW);
      const feet = Object.keys(A.state.ladders).map(Number);
      const foot = feet.find((f) => f > 8 && A.state.ladders[f - 1] === undefined && A.state.snakes[f - 1] === undefined && A.state.ladders[f - 2] === undefined);
      await stage(A, { turn: 0, pos: [foot - 3, 0], dice: [2] });
      A.s.emit("power", { kind: "ladder" });
      assert.ok(await until(() => B.state.power.seats[0].ladder === true));
      A.s.emit("roll");
      assert.ok(await until(() => B.state.lastMove && B.state.lastMove.seat === 0));
      assert.deepStrictEqual(B.state.lastMove.boost, { from: foot - 1, foot });
      assert.deepStrictEqual(B.state.lastMove.via, { kind: "ladder", from: foot, to: A.state.ladders[foot] });
      assert.strictEqual(B.state.pos[0], A.state.ladders[foot]);
      assert.strictEqual(B.state.power.seats[0].ladder, false);
      // Ava has no re-roll: she buys a pack and uses one in this game
      const at = plain(A.state, 2, 60);
      await stage(A, { turn: 0, pos: [at, 0], dice: [] });
      A.s.emit("power", { kind: "reroll" });
      assert.ok(await until(() => A.refusals.length === 1));
      assert.strictEqual(A.refusals[0].message, "You have none of those.");
      A.s.emit("powerStock", { antidote: 0, ladder: 0, reroll: 5, seen: { game: A.state.power.game, ladder: 1 } });
      assert.ok(await until(() => A.state.power.me.stock.reroll === 5));
      A.s.emit("power", { kind: "reroll" });
      assert.ok(await until(() => A.state.power.reroll === "armed" && B.state.power.reroll === "armed"));
      assert.strictEqual(B.used[B.used.length - 1].kind, "reroll");
      assert.deepStrictEqual(A.state.power.me.stock, mine({ reroll: 4 }));
      assert.strictEqual(A.state.power.me.left, 1);
      const mv = A.state.lastMove.mv;
      await stage(A, { dice: [1, 1] });   // the next two dice (neither a six), nothing else touched
      A.s.emit("roll");
      assert.ok(await until(() => A.state.lastMove.mv === mv + 1));
      assert.strictEqual(A.state.turn, 0, "the turn did not pass");
      assert.strictEqual(A.state.power.reroll, "now");
      A.s.emit("roll");
      assert.ok(await until(() => A.state.lastMove.mv === mv + 2));
      assert.strictEqual(A.state.lastMove.reroll, true);
      assert.strictEqual(A.state.turn, 1);
      assert.strictEqual(A.state.power.reroll, null);
      bye(A, B);
    });

    await ok("an old app joining a Power room by code is seated and plays without power-ups, and nothing it is sent is missing", async () => {
      const { A, B } = await game({ caps: NEW.caps, power: { antidote: 2, ladder: 2, reroll: 2 } }, { power: { antidote: 9, ladder: 9, reroll: 9 } });   // Ben's app sends no caps at all
      assert.strictEqual(B.seat, 1);
      assert.strictEqual(B.state.mode, "power");
      assert.deepStrictEqual(B.state.power.me.stock, { antidote: 0, ladder: 0, reroll: 0 }, "it owns nothing here, whatever it sends");
      const OLDKEYS = ["code", "status", "phase", "turn", "sixes", "diceMode", "dice", "seed", "pos", "lastMove", "winner", "standings", "log", "phaseEndsAt", "hostSeat", "minPlayers", "maxPlayers", "ladders", "snakes", "players", "voice", "chat",
        "features", "serverNow", "finish", "reactionsOn", "reactions", "ranked", "rankedModel", "rankedOn", "waiting", "waitPos"];
      const keys = Object.keys(B.state);
      assert.deepStrictEqual(keys.slice(0, -2), OLDKEYS.filter((k) => keys.includes(k)), "every older field, in its old order");
      assert.deepStrictEqual(keys.slice(-2), ["mode", "power"], "the new fields come after every older one");
      const at = plain(B.state, 2, 60);
      await stage(A, { turn: 1, pos: [0, at], dice: [1] });
      B.s.emit("power", { kind: "antidote" });
      assert.ok(await until(() => B.refusals.length === 1));
      assert.strictEqual(B.refusals[0].message, "You have none of those.");
      B.s.emit("powerStock", { antidote: 9, ladder: 9, reroll: 9 }); await sleep(100);
      assert.deepStrictEqual(B.state.power.me.stock, { antidote: 0, ladder: 0, reroll: 0 });
      B.s.emit("roll");
      assert.ok(await until(() => B.state.lastMove && B.state.lastMove.seat === 1), "it plays its turn as ever");
      assert.strictEqual(B.state.lastMove.from, at);
      assert.deepStrictEqual(Object.keys(B.state.lastMove).sort(), ["bounced", "from", "landed", "mv", "roll", "seat", "to", "via"]);
      bye(A, B);
    });

    await ok("a reconnect shows the ring and the uses left, and the stock is exact whether or not the phone had counted the use", async () => {
      const { A, B, code } = await game({ caps: NEW.caps, power: mine({ antidote: 3 }) }, NEW);
      await stage(A, { turn: 0, pos: [plain(A.state, 2, 60), 0] });
      A.s.emit("power", { kind: "antidote" });
      await until(() => A.state.power.me.left === 2);
      const gameId = A.state.power.game;
      A.s.disconnect(); await sleep(80);
      const A2 = client("Ava", {}); A2.id = A.id; await connected(A2);
      A2.s.emit("join", { code, name: "Ava", playerId: A.id, caps: NEW.caps, power: mine({ antidote: 3 }) });   // the phone had not counted it
      assert.ok(await until(() => A2.state && A2.state.status === "playing"));
      assert.strictEqual(A2.seat, 0);
      assert.strictEqual(A2.state.power.seats[0].antidote, true, "the ring");
      assert.strictEqual(A2.state.power.seats[0].used, 1);
      assert.strictEqual(A2.state.power.me.left, 2, "the uses left");
      assert.deepStrictEqual(A2.state.power.me.spent, mine({ antidote: 1 }));
      assert.strictEqual(A2.state.power.me.stock.antidote, 2);
      assert.strictEqual(A2.state.power.game, gameId);
      assert.deepStrictEqual(A2.state.power.last, { id: 1, seat: 0, kind: "antidote" });
      A2.s.disconnect(); await sleep(80);
      const A3 = client("Ava", {}); A3.id = A.id; await connected(A3);
      A3.s.emit("join", { code, name: "Ava", playerId: A.id, caps: NEW.caps, power: mine({ antidote: 2, seen: { game: gameId, antidote: 1 } }) });   // now it had
      assert.ok(await until(() => A3.state && A3.state.status === "playing"));
      assert.strictEqual(A3.state.power.me.stock.antidote, 2);
      assert.strictEqual(A3.state.power.me.left, 2);
      bye(A3, B);
    });

    await ok("a timeout: the turn is played for them and never spends a power-up", async () => {
      const { A, B } = await game({ caps: NEW.caps, power: { antidote: 3, ladder: 3, reroll: 3 } }, NEW);
      const at = plain(A.state, 2, 60);
      await stage(A, { turn: 0, pos: [at - 1, 0], dice: [1] });
      assert.ok(await until(() => B.state.turn === 1, TURN_MS + 1500), "the turn was played for them");
      assert.strictEqual(B.state.pos[0], at);
      assert.deepStrictEqual(A.state.power.me.stock, { antidote: 3, ladder: 3, reroll: 3 });
      assert.deepStrictEqual(A.state.power.me.spent, { antidote: 0, ladder: 0, reroll: 0 });
      assert.strictEqual(A.state.power.seats[0].used, 0);
      assert.strictEqual(A.used.length, 0);
      bye(A, B);
    });

    await ok("bots at the table: they use theirs when a human owns some, and none when nobody does", async () => {
      const run = async (power) => {
        const A = client("Ava", { caps: NEW.caps, power }); await connected(A);
        A.s.emit("create", ident(A)); await until(() => A.joinedCode);
        A.s.emit("addBot"); await until(() => A.state && A.state.players.length === 2);
        A.s.emit("settings", { mode: "power" }); await until(() => A.state.mode === "power");
        A.s.emit("start"); await until(() => A.state.status === "playing");
        await stage(A, { turn: 1, pos: [0, 0], dice: [1] });
        await until(() => A.state.turn === 0 && A.state.lastMove && A.state.lastMove.seat === 1, 3000);
        return A;
      };
      const A = await run({ antidote: 3, ladder: 3, reroll: 3 });
      // the bot may have had the first turn before the table was staged: one use, or two (its antidote, then its ladder boost)
      assert.ok(A.state.power.seats[1].used >= 1 && A.state.power.seats[1].used <= 2, "the bot took its antidote at the start");
      assert.strictEqual(A.used.length, A.state.power.seats[1].used, "one broadcast a use");
      assert.deepStrictEqual(A.used[0], { id: 1, seat: 1, kind: "antidote" });
      assert.ok(A.used.every((u) => u.seat === 1));
      assert.strictEqual(A.state.players[1].bot, true);
      const N = await run({ antidote: 0, ladder: 0, reroll: 0 });
      assert.strictEqual(N.state.power.seats[1].used, 0, "no human owns any: the bot uses none");
      assert.strictEqual(N.used.length, 0);
      bye(A, N);
    });

    await ok("quick play matches Power only with Power, and a Power game is never rated", async () => {
      const P1 = client("Pia", NEW), C1 = client("Cal", NEW), P2 = client("Pam", NEW), O1 = client("Old", OLD);
      for (const p of [P1, C1, P2, O1]) await connected(p);
      P1.s.emit("quick", Object.assign({ mode: "power" }, ident(P1)));
      assert.ok(await until(() => P1.state && P1.state.quick));
      assert.strictEqual(P1.state.mode, "power");
      C1.s.emit("quick", ident(C1));
      assert.ok(await until(() => C1.state && C1.state.quick));
      assert.strictEqual(C1.state.mode, undefined);
      assert.notStrictEqual(C1.state.code, P1.state.code, "Classic did not join the Power room");
      O1.s.emit("quick", Object.assign({ mode: "power" }, ident(O1)));   // an old app cannot ask for Power: it is matched as Classic
      assert.ok(await until(() => O1.state && O1.state.quick));
      assert.strictEqual(O1.state.code, C1.state.code);
      assert.strictEqual(O1.state.mode, undefined);
      assert.strictEqual(C1.state.rankedOn, true, "Classic quick play is rated as ever");
      P2.s.emit("quick", Object.assign({ mode: "power" }, ident(P2)));
      assert.ok(await until(() => P2.state && P2.state.quick));
      assert.strictEqual(P2.state.code, P1.state.code, "Power joined Power");
      assert.ok(await until(() => P1.state.players.length === 2));
      assert.strictEqual(P1.state.rankedOn, false, "a Power room's result never counts");
      P1.s.emit("settings", { mode: "classic" }); await sleep(120);
      assert.strictEqual(P1.state.mode, "power", "a quick room keeps the mode it was matched on");
      bye(P1, C1, P2, O1);
    });
  } finally {
    srv.kill();
  }
}

(async () => {
  await part1();
  await part2();
  console.log(`\nsnakes power: ${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
