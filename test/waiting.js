/*
 The waiting line (the owner, 2026-09-29), for any GameNest room server of the common shape.
 Copied into each server's test/ as waiting.js; TAKEOVER below says whether a seat left mid-game
 goes to the line (1) or the line waits for the next game (0, secret roles).
 Proves: an older app still hears "started"; an app with caps ["waitList"] waits in line, watching
 (no seat, its place in line, seen by everyone); a player who leaves mid-game gives their seat to
 the first in line (or not, where roles are secret); a watcher who leaves the line is gone from it.
*/
const fs = require("fs");
const path = require("path");
const { io } = require("socket.io-client");
const PORT = Number(process.env.TEST_PORT || 3611);   // run.js serves on TEST_PORT, default 3611: the two defaults agree, so a plain `npm test` needs no env
const BASE = process.env.BASE_PATH || "";
const TAKEOVER = /* TAKEOVER */ true;
const src = fs.readFileSync(path.join(__dirname, "..", "server.js"), "utf8");
const MIN = Number((src.match(/const MIN_PLAYERS = (\d+)/) || [0, 2])[1]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failed = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL: ") + m); if (!c) failed++; };
function mk() {
  const s = io("http://localhost:" + PORT, { path: BASE + "/socket.io", transports: ["websocket"] });
  s.st = null; s.seat = -1; s.refused = null; s.joined = null;
  s.on("state", ({ room, mySeat }) => { s.st = room; s.seat = mySeat; });
  s.on("refusal", (r) => { s.refused = r; });
  // An older server's refusal is a plain "err" message.
  s.on("err", (m) => { if (!s.refused && /already started/.test(String(m))) s.refused = { code: "started", message: m }; });
  s.on("joined", (j) => { s.joined = j; });
  return s;
}
const until = async (fn, ms = 5000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await sleep(10); } return false; };
const uid = (p) => p + Math.random().toString(36).slice(2, 9);

(async () => {
  // A room of MIN people (MIN_PLAYERS of this game, three at least), started.
  const people = [];
  const n = Math.max(3, MIN);
  for (let i = 0; i < n; i++) { const s = mk(); people.push(s); }
  await until(() => people.every((s) => s.connected));
  const [A] = people;
  A.emit("create", { name: "Ann", playerId: uid("wA"), avatar: "🦊" });
  await until(() => A.st && A.st.code);
  const code = A.st.code;
  for (let i = 1; i < n; i++) people[i].emit("join", { code, name: "P" + i, playerId: uid("wP" + i), avatar: "🐼" });
  await until(() => A.st.players.length === n);
  A.emit("start");
  const started = await until(() => A.st.status && A.st.status !== "lobby", 8000);
  ok(started, `the game starts with ${n} (status ${A.st.status})`);

  // 1. An older app: refused as before.
  const Old = mk(); await until(() => Old.connected);
  Old.emit("join", { code, name: "Old", playerId: uid("wO"), avatar: "🐸" });
  await until(() => Old.refused);
  ok(Old.refused && Old.refused.code === "started", "an app without waitList still hears the game has started");
  Old.close();

  // 2. A new app waits in line, watching.
  const C = mk(); await until(() => C.connected);
  C.emit("join", { code, name: "Cy", playerId: uid("wC"), avatar: "🐯", caps: ["waitList"] });
  await until(() => C.st && C.st.waitPos);
  ok(C.joined && C.joined.waiting === true, "a late app is told it is waiting");
  ok(C.seat === -1 && C.st.waitPos === 1, `and watches from the line: no seat, first in it (seat ${C.seat}, place ${C.st && C.st.waitPos})`);
  ok(A.st.waiting && A.st.waiting.length === 1 && A.st.waiting[0].name === "Cy", "and everyone sees who is waiting");

  // 3. Someone leaves mid-game.
  const B = people[1], bSeat = B.seat;
  B.emit("leave");
  if (TAKEOVER) {
    await until(() => C.seat >= 0);
    ok(C.seat === bSeat, `the first in line takes the seat that was left (${C.seat} of ${bSeat})`);
    ok(C.st.waitPos === 0 && C.st.waiting.length === 0, "and the line is empty");
    ok(/took .*seat/.test(A.st.log || ""), `the table is told ("${A.st.log}")`);
  } else {
    await sleep(400);
    ok(C.seat === -1 && C.st.waitPos === 1, "secret roles: the line waits for the next game, not a seat mid-game");
  }

  // 4. A watcher who leaves the line is gone from it.
  const D = mk(); await until(() => D.connected);
  D.emit("join", { code, name: "Di", playerId: uid("wD"), avatar: "🐨", caps: ["waitList"] });
  const want = TAKEOVER ? 1 : 2;
  await until(() => A.st.waiting && A.st.waiting.length === want);
  D.emit("leave");
  await until(() => A.st.waiting.length === want - 1);
  ok(A.st.waiting.length === want - 1, "a watcher who leaves the line is gone from it");

  [...people, C, D].forEach((s) => s.close());
  console.log(failed ? `\n${failed} WAITING TEST(S) FAILED` : "\nALL WAITING TESTS PASS");
  process.exit(failed ? 1 : 0);
})();
