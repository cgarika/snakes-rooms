/*
 Reactions (the owner, 2026-10-15: the cartoon stickers, in every game), over real sockets.
 Run:  node test/reactions.js   (starts its own server on TEST_PORT3, default 3631; never 3111-3120)
 Proves:
 - a new room has them on, and an empty list, in its state;
 - a seated player's sticker lands for everyone ({ id, seat, kind }), a second within REACT_MS does not, and one
   after it does; an unknown kind or a junk payload is dropped and the server runs on;
 - only the host turns them off (which empties the list, and nothing lands) and on again;
 - a bot answers a person's sticker, and throws its own at a big moment of the game;
 - the list keeps the last eight.
*/
"use strict";
const { io } = require("socket.io-client");
const { spawn } = require("child_process");
const path = require("path");

const PORT = Number(process.env.TEST_PORT3 || 3631), URL = "http://localhost:" + PORT;
if (PORT >= 3111 && PORT <= 3120) { console.error("refusing " + PORT + ": 3111-3120 are the live servers"); process.exit(2); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms = 4000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await sleep(10); } return false; };
let n = 0;
const pid = () => "r" + (++n) + "_" + Math.random().toString(36).slice(2, 10);
let failed = 0;
const ok = (m) => console.log("PASS " + m), bad = (m) => { console.log("FAIL " + m); failed++; };
const check = (c, m) => (c ? ok(m) : bad(m));

/* ---- the game's own: how a client sees its room, makes one, joins one, adds a bot, starts, and plays on ---- */
function mk() {
  const c = io(URL, { transports: ["websocket"], reconnection: false, forceNew: true });
  c.st = null; c.seat = -1; c.joined = null;
  c.on("state", (f) => { c.st = f.room; c.seat = f.mySeat; });
  c.on("joined", (j) => { c.joined = j.code; });
  return c;
}
const GAME = {
  env: { BOT_MS: "60" },
  room: (c) => c.st,
  seatOf: (c) => c.seat,
  create: async (c, name, id) => { c.emit("create", { name, playerId: id }); await until(() => c.joined && c.st); return c.joined; },
  join: async (c, code, name, id) => { c.emit("join", { code, name, playerId: id }); await until(() => c.st && c.st.players.length >= 2); },
  addBot: async (c) => { const k = c.st.players.length; c.emit("addBot"); await until(() => c.st.players.length > k); },
  botSeat: (c) => c.st.players.findIndex((p) => p.bot),
  start: async (c) => { c.emit("start"); await until(() => c.st.status === "playing"); },
  play: async (cs) => {
    for (const c of cs) {
      const s = c.st;
      if (s.status === "over") { c.emit("rematch"); continue; }
      if (s.status !== "playing" || s.turn !== c.seat) continue;
      if (s.phase === "roll") c.emit("roll"); else if (s.phase === "pick") c.emit("pick", { i: 0 });
    }
  },
};


(async () => {
  let exited = null;
  const srv = spawn(process.execPath, ["server.js"], { cwd: path.join(__dirname, ".."), env: { ...process.env, PORT: String(PORT), REACT_BOTS_ALWAYS: "1", ...GAME.env }, stdio: ["ignore", "ignore", "pipe"] });
  let stderr = ""; srv.stderr.on("data", (b) => { stderr += b; });
  srv.on("exit", (code, sig) => { exited = code != null ? "code " + code : sig; });
  const socks = [];
  const open = () => { const c = mk(); socks.push(c); return c; };
  try {
    await sleep(GAME.boot || 700);   // how long the server takes to listen
    const A = open(), B = open();
    await until(() => A.connected && B.connected);
    const code = await GAME.create(A, "Host", pid());
    await GAME.join(B, code, "Guest", pid());
    const R = () => GAME.room(A), RB = () => GAME.room(B);
    check(R() && R().reactionsOn === true && Array.isArray(R().reactions) && R().reactions.length === 0, "a new room has reactions on, and none yet");

    A.emit("react", { kind: "haha" });
    await until(() => RB().reactions.length === 1);
    const r1 = RB().reactions[0];
    check(r1 && r1.kind === "haha" && r1.seat === GAME.seatOf(A) && typeof r1.id === "number", "a sticker lands for everyone, with its seat and kind");
    A.emit("react", { kind: "lol" });
    await sleep(300);
    check(RB().reactions.length === 1, "a second one inside REACT_MS is dropped");
    for (const j of [null, 7, "x", [1], true, { kind: "nope" }, { kind: 5 }]) { A.emit("react", j); B.emit("react", j); B.emit("reactionsOn", j); }
    await sleep(300);
    check(!exited && RB().reactions.length === 1, "junk and unknown kinds are dropped, and the server runs on");
    await sleep(1300);
    A.emit("react", { kind: "lol" });
    await until(() => RB().reactions.length === 2);
    check(RB().reactions.length === 2 && RB().reactions[1].kind === "lol" && RB().reactions[1].id > r1.id, "one after REACT_MS lands, with a newer id");

    B.emit("reactionsOn", { on: false });
    await sleep(300);
    check(R().reactionsOn === true, "a guest cannot turn them off");
    A.emit("reactionsOn", { on: false });
    await until(() => RB().reactionsOn === false);
    check(RB().reactionsOn === false && RB().reactions.length === 0, "the host turns them off, and the list empties");
    await sleep(1600);
    B.emit("react", { kind: "gg" });
    await sleep(300);
    check(RB().reactions.length === 0, "nothing lands while they are off");
    A.emit("reactionsOn", { on: true });
    await until(() => RB().reactionsOn === true);
    check(RB().reactionsOn === true, "the host turns them back on");

    if (GAME.extra) await GAME.extra({ open, check, ok, bad, pid, sleep, until });
    if (GAME.noBots) ok("no bots at this table: nothing of theirs to check here");
    else {
      // A bot answers a person.
      await GAME.addBot(A);
      const botSeat = GAME.botSeat(A);
      await sleep(1600);
      B.emit("react", { kind: "loser" });
      await until(() => RB().reactions.some((x) => x.seat === botSeat), 4000);
      check(RB().reactions.some((x) => x.seat === botSeat), "a bot answers a person's sticker");

      // A bot throws its own at a big moment (its seat looked up again: a game may seat everyone afresh at the start).
      await GAME.start(A);
      await sleep(200);
      const bots = new Set(RB().players.map((p, i) => (p.bot ? i : -1)).filter((i) => i >= 0));
      const seen = new Set(RB().reactions.map((x) => x.id));
      const fresh = () => RB().reactions.filter((x) => bots.has(x.seat) && !seen.has(x.id)).length;
      const t0 = Date.now();
      while (Date.now() - t0 < (GAME.momentMs || 60000) && fresh() === 0) { await GAME.play([A, B]); await sleep(40); }
      check(fresh() > 0, "a bot throws its own at a big moment of the game");

    }

    // The list keeps the last eight (A and B alternate past the gap).
    for (let i = 0; i < 6; i++) { (i % 2 ? A : B).emit("react", { kind: "gg" }); await sleep(800); }
    await sleep(400);
    check(RB().reactions.length <= 8, "the list keeps the last eight (" + RB().reactions.length + ")");
    check(!exited, "the server ran throughout" + (exited ? " (" + exited + "): " + stderr.slice(-300) : ""));
  } catch (e) {
    bad("threw: " + (e && e.stack || e));
  } finally {
    for (const c of socks) c.close();
    srv.kill();
  }
  console.log(failed ? failed + " FAILED" : "all reactions tests pass");
  process.exit(failed ? 1 : 0);
})();
