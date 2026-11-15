/*
 Snakebite — one guard for every client event (junk payloads), over real sockets.
 Run:  node test/guard.js   (starts its own server on TEST_PORT3, default 3631; never 3111-3118)
 Proves:
 - a payload that is not an object (null, a number, a string, an array, true) on every event leaves the server
   running: 42["join",null] used to throw inside the handler's destructuring and stop the whole process, every
   room with it; the room in play still plays, and a new room can still be made;
 - today's flow is untouched (create, join, a bot, start, a real turn).
*/
"use strict";
const { io } = require("socket.io-client");
const { spawn } = require("child_process");
const path = require("path");

const PORT = Number(process.env.TEST_PORT3 || 3631), URL = "http://localhost:" + PORT;
if (PORT >= 3111 && PORT <= 3118) { console.error("refusing " + PORT + ": 3111-3118 are the live servers"); process.exit(2); }
const EVENTS = ["addBot", "chat", "create", "join", "leave", "pick", "presence", "pushToken", "react", "reactionsOn", "rematch", "removeBot", "roll", "settings", "start", "takeSeat", "voice"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms = 4000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await sleep(10); } return false; };
let n = 0;
const pid = () => "g" + (++n) + "_" + Math.random().toString(36).slice(2, 10);
function mk() {
  const c = io(URL, { transports: ["websocket"], reconnection: false, forceNew: true });
  c.st = null; c.seat = -1; c.states = 0; c.joined = null; c.voice = 0;
  c.on("state", (f) => { c.states++; c.st = f.room; c.seat = f.mySeat; });
  c.on("joined", (j) => { c.joined = j.code; });
  c.on("voice", () => { c.voice++; });
  return c;
}
let failed = 0;
const ok = (m) => console.log("PASS " + m), bad = (m) => { console.log("FAIL " + m); failed++; };

(async () => {
  let exited = null;
  const srv = spawn(process.execPath, ["server.js"], { cwd: path.join(__dirname, ".."), env: { ...process.env, PORT: String(PORT), BOT_MS: "300" }, stdio: ["ignore", "ignore", "pipe"] });
  let stderr = ""; srv.stderr.on("data", (b) => { stderr += b; });
  srv.on("exit", (code, sig) => { exited = code != null ? "code " + code : sig; });
  const socks = [];
  const open = () => { const c = mk(); socks.push(c); return c; };
  try {
    await sleep(700);
    // a room in play: a host, a guest, a bot
    const A = open(), B = open();
    await until(() => A.connected && B.connected);
    A.emit("create", { name: "Host", playerId: pid() });
    await until(() => A.joined && A.st);
    B.emit("join", { code: A.joined, name: "Guest", playerId: pid() });
    await until(() => B.st && B.st.players && B.st.players.length === 2);
    A.emit("addBot");
    await until(() => A.st.players.length === 3);
    A.emit("start");
    await until(() => A.st.status === "playing");
    if (A.st.status !== "playing") throw new Error("the room did not start: " + JSON.stringify(A.st).slice(0, 200));

    // 1. junk payloads on every event, from both seats and from a socket in no room
    const C = open(); await until(() => C.connected);
    const junk = [null, 7, "x", [1, 2], true];
    for (const ev of EVENTS) for (const j of junk) { if (ev !== "leave") { A.emit(ev, j); B.emit(ev, j); } C.emit(ev, j); await sleep(5); }
    await sleep(400);
    if (exited) bad(`junk payloads: the server stopped (${exited}); ${stderr.split("\n").find((l) => /Error/.test(l)) || ""}`);
    else ok(`junk payloads: null, a number, a string, an array and true on all ${EVENTS.length} events leave the server running`);

    // the room still plays, and a new room can still be made
    const D = open(); await until(() => D.connected);
    D.emit("create", { name: "After", playerId: pid() });
    const made = await until(() => D.joined && D.st, 3000);
    const before = A.states;
    B.emit("chat", { text: "still here", t: "still here" });
    const heard = await until(() => A.states > before, 3000);
    if (!exited && made && heard) ok("after the junk: a new room is made and the room in play still hears its players");
    else bad(`after the junk: made ${made}, heard ${heard}, exited ${exited}`);

    if (exited) bad("the server stopped during the suite: " + exited);
  } catch (e) { bad("suite error: " + (e && e.stack || e)); }
  finally { socks.forEach((c) => c.close()); srv.kill(); }
  console.log(failed ? `\n${failed} GUARD TEST(S) FAILED` : "\nALL GUARD TESTS PASS");
  process.exit(failed ? 1 : 0);
})();
