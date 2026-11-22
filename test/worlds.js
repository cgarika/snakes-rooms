/*
 Snakebite — the worlds lane's server changes, over real sockets.
 Run:  node test/worlds.js   (starts its own server on TEST_PORT2, default 3621; TURN_MS 1500)
 Proves:
 - GN-05 refusals carry a machine reason: a "refusal" event { code, message, op }, and err keeps its English first
   argument and adds { code, op } (not_found, started, full, name_required, not_enough_players);
 - GN-20 a socket that sits down in a second room leaves the first: it hears no more of the first room's states,
   and the first room shows that player away; a rejoin on a new socket is not marked away when the old socket
   finally drops;
 - GN-30 names are capped at 18 UTF-16 units between whole characters; avatars are one whole sticker;
 - GN-48 every state carries serverNow, the server's clock, and features; every old field is unchanged and first;
 - GN-10 every state after a turn ends already carries the new turn's deadline (phaseEndsAt - serverNow = TURN_MS);
 - the board every game gets is the layouts' deal for its seed and is never T12's fixed board;
 - today's client flow (create, join, start, roll, rematch) is unchanged.
*/
"use strict";
const { io } = require("socket.io-client");
const { spawn } = require("child_process");
const path = require("path");
const B = require("../board.js");

const PORT = Number(process.env.TEST_PORT2 || 3621), URL = "http://localhost:" + PORT, TURN = 1500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms = 4000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await sleep(10); } return false; };
let n = 0;
function mk(tag) {
  const c = io(URL, { transports: ["websocket"], reconnection: false, forceNew: true });
  c.tag = tag; c.st = null; c.seat = -1; c.frames = []; c.errs = []; c.refusals = []; c.codes = []; c.joined = null;
  c.on("refusal", (r) => c.refusals.push(r));
  c.on("state", (f) => { c.frames.push(f); c.st = f.room; c.seat = f.mySeat; });
  c.on("err", (text, meta) => c.errs.push({ text, meta }));
  c.on("joined", (j) => { c.joined = j.code; c.codes.push(j.code); });
  return c;
}
const pid = () => "w" + (++n) + "_" + Math.random().toString(36).slice(2, 8);
function assert(cond, msg) { if (!cond) throw new Error(msg); }

(async () => {
  const srv = spawn(process.execPath, ["server.js"], { cwd: path.join(__dirname, ".."), env: { ...process.env, PORT: String(PORT), TURN_MS: String(TURN), BOT_MS: "5" }, stdio: "ignore" });
  const socks = [];
  const open = (tag) => { const c = mk(tag); socks.push(c); return c; };
  try {
    await sleep(700);
    // ---- GN-05: refusals with reasons
    {
      const A = open("A"); await until(() => A.connected);
      A.emit("join", { code: "ZZZZZZ", name: "A", playerId: pid() });
      await until(() => A.errs.length === 1);
      assert(A.errs[0].text === "No room with that code." && A.errs[0].meta && A.errs[0].meta.code === "not_found" && A.errs[0].meta.op === "join", "not_found: " + JSON.stringify(A.errs[0]));
      assert(A.refusals.length === 1 && A.refusals[0].code === "not_found" && A.refusals[0].message === "No room with that code." && A.refusals[0].op === "join", "the refusal event: " + JSON.stringify(A.refusals));
      A.emit("create", { name: "   ", playerId: pid() });
      await until(() => A.errs.length === 2);
      assert(A.errs[1].text === "Pick a name first." && A.errs[1].meta.code === "name_required" && A.errs[1].meta.op === "create", "name: " + JSON.stringify(A.errs[1]));
      A.emit("create", { name: "Host", playerId: pid(), avatar: "\u{1F98A}" });
      await until(() => A.joined && A.st);
      A.emit("start");
      await until(() => A.errs.length === 3);
      assert(A.errs[2].meta.code === "not_enough_players" && A.errs[2].meta.op === "start", "not_enough_players: " + JSON.stringify(A.errs[2]));
      for (let i = 0; i < 7; i++) A.emit("addBot");
      await until(() => A.st.players.length === 8);
      const F = open("F"); await until(() => F.connected);
      F.emit("join", { code: A.joined, name: "Late", playerId: pid() });
      await until(() => F.errs.length === 1);
      assert(F.errs[0].text === "Room is full (8)." && F.errs[0].meta.code === "full", "full: " + JSON.stringify(F.errs[0]));
      A.emit("removeBot"); await until(() => A.st.players.length === 7);
      A.emit("start"); await until(() => A.st.status === "playing");
      F.emit("join", { code: A.joined, name: "Late", playerId: pid() });
      await until(() => F.errs.length === 2);
      assert(F.errs[1].text === "That game already started." && F.errs[1].meta.code === "started", "started: " + JSON.stringify(F.errs[1]));
      console.log("PASS GN-05 refusals — a refusal event and err's second argument: not_found, name_required, not_enough_players, full, started; the English is unchanged");
    }
    // ---- GN-30 names, GN-48 serverNow, and the calm board
    {
      const fam = "\u{1F468}‍\u{1F469}‍\u{1F467}‍\u{1F466}";
      const A = open("N"); await until(() => A.connected);
      A.emit("create", { name: "Seventeen chars!!" + fam, playerId: pid(), avatar: fam + fam });
      await until(() => A.st);
      assert(A.st.players[0].name === "Seventeen chars!!", "name cut between whole characters: " + JSON.stringify(A.st.players[0].name));
      assert(A.st.players[0].avatar === fam, "avatar is one whole sticker");
      assert(typeof A.st.serverNow === "number" && Math.abs(A.st.serverNow - Date.now()) < 2000, "serverNow is the server's clock");
      const OLD = ["code", "status", "phase", "turn", "sixes", "diceMode", "dice", "seed", "pos", "lastMove", "winner", "standings", "log", "phaseEndsAt", "hostSeat", "minPlayers", "maxPlayers", "ladders", "snakes", "players", "voice", "chat"];
      const keys = Object.keys(A.st), head = keys.slice(0, -11);   // a lobby leaves turn, lastMove, winner and standings unset, as before
      assert(keys.slice(-11).join() === "features,serverNow,finish,reactionsOn,reactions,ranked,rankedModel,rankedOn,gnVoice,waiting,waitPos" && head.join() === OLD.filter((k) => head.includes(k)).join() && head.every((k) => OLD.includes(k)), "old fields unchanged and first, new ones after: " + keys);
      assert(A.st.features.includes("calmBoards") && A.st.features.includes("refusalCodes"), "features");
      A.emit("addBot"); A.emit("start");
      await until(() => A.st.status === "playing");
      const board = { ladders: A.st.ladders, snakes: A.st.snakes };
      assert(A.st.seed && Object.keys(board.ladders).length >= 5 && Object.keys(board.snakes).length >= 5, "a seeded board of a real layout");
      assert(JSON.stringify(board) === JSON.stringify(B.genBoard(A.st.seed)), "the board is the layouts' deal for the room's seed");
      assert(B.measureBoard(board).ll === 0, "no ladder crosses a ladder");
      assert(JSON.stringify(board.ladders) !== JSON.stringify(B.CLASSIC.ladders), "not T12's fixed board");
      console.log("PASS GN-30 / GN-48 / real layout — name " + JSON.stringify(A.st.players[0].name) + ", serverNow in every state, the room's board is a real layout's");
    }
    // ---- GN-10: every state after a turn ends carries the new deadline
    {
      const A = open("T1"), Bs = open("T2");
      await until(() => A.connected && Bs.connected);
      A.emit("create", { name: "T1", playerId: pid() });
      await until(() => A.joined);
      Bs.emit("join", { code: A.joined, name: "T2", playerId: pid() });
      await until(() => A.st && A.st.players.length === 2);
      A.emit("start");
      await until(() => A.st.status === "playing");
      let checked = 0, stale = 0;
      for (let k = 0; k < 8 && A.st.status === "playing"; k++) {
        await sleep(250);   // time passes on the old deadline, so a stale one would show
        const me = A.st.turn === A.seat ? A : Bs;
        const mv = A.st.lastMove ? A.st.lastMove.mv : 0;
        const nFrames = A.frames.length;
        me.emit("roll");
        await until(() => A.st.lastMove && A.st.lastMove.mv > mv);
        const f = A.frames.slice(nFrames).find((x) => x.room.lastMove && x.room.lastMove.mv > mv).room;
        if (f.status !== "playing") break;
        const left = f.phaseEndsAt - f.serverNow;
        checked++;
        if (left < TURN - 100 || left > TURN + 5) stale++;
      }
      assert(checked >= 4 && stale === 0, `GN-10: ${stale} of ${checked} states after a roll carried an old deadline`);
      console.log(`PASS GN-10 — ${checked} rolls, each state already carried the new turn's full ${TURN} ms`);
    }
    // ---- GN-20: one room per socket
    {
      const A = open("R1"), Bs = open("R2");
      await until(() => A.connected && Bs.connected);
      const pa = pid();
      A.emit("create", { name: "Ann", playerId: pa });
      await until(() => A.joined);
      const first = A.joined;
      Bs.emit("join", { code: first, name: "Bo", playerId: pid() });
      await until(() => Bs.st && Bs.st.players.length === 2);
      A.emit("create", { name: "Ann", playerId: pa });   // sits down in a second room without leaving
      await until(() => A.codes.length === 2);
      const second = A.codes[1];
      assert(second !== first, "a second room");
      await until(() => Bs.st.players[0].connected === false);
      assert(Bs.st.players[0].connected === false, "the first room shows Ann away");
      const heard = A.frames.length;
      Bs.emit("chat", { t: "anyone?" });
      await until(() => Bs.st.chat.length === 1);
      await sleep(200);
      assert(A.frames.slice(heard).every((f) => f.room.code === second), "Ann's socket hears no more of the first room");
      // a rejoin on a new socket, then the old socket drops: still connected
      const C = open("R3"), pc = pid();
      await until(() => C.connected);
      C.emit("join", { code: second, name: "Cy", playerId: pc });
      await until(() => C.st && C.st.players.length === 2);
      const C2 = open("R3b");
      await until(() => C2.connected);
      C2.emit("join", { code: second, name: "Cy", playerId: pc });
      await until(() => C2.st && C2.st.code === second);
      C.disconnect();
      await sleep(300);
      assert(C2.st.players[1].connected === true, "a rejoin is not marked away when the old socket drops");
      console.log("PASS GN-20 — a second room takes the socket out of the first (seat shown away, no more of its states); a rejoin survives its old socket");
    }
    // ---- today's flow, as the app plays it: bots, a full game, rematch
    {
      const H = open("H"); await until(() => H.connected);
      H.emit("create", { name: "H", playerId: pid() }); await until(() => H.st);
      H.emit("addBot"); H.emit("addBot"); await until(() => H.st.players.length === 3);
      for (let g = 0; g < 2; g++) {
        H.emit(g ? "rematch" : "start");
        await until(() => H.st.status === "playing");
        const t0 = Date.now();
        while (H.st.status === "playing" && Date.now() - t0 < 60000) { if (H.st.turn === H.seat && H.st.phase === "roll") H.emit("roll"); await sleep(8); }
        assert(H.st.status === "over" && H.st.pos[H.st.winner] === 100, "game " + g + " finished on 100");
      }
      console.log("PASS today's flow — two bot games with rematch on calm boards");
    }
    console.log("ALL WORLDS TESTS PASS");
    process.exitCode = 0;
  } catch (e) {
    console.error("FAIL:", e.message);
    process.exitCode = 1;
  } finally {
    socks.forEach((c) => c.close());
    srv.kill();
    setTimeout(() => process.exit(process.exitCode), 100);
  }
})();
