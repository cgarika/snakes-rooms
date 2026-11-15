/* Room codes are six letters and never a digit (the lead, 2026-11-13): node test/roomcode.js
   The 19 letters are ABCDEFGHJKMNPRTWXYZ: no digits, and none of I L O Q S U V, which get misread or misheard.
   Starts its own server on TEST_PORT (default 5592; never 3111-3126), with its ratings and other records in a folder of its own that it
   removes at the end (never the live servers' ~/Library/GameNest/Data), and checks, over real sockets, the way the app does it:
   (1) 200 rooms, each made by a new socket's "create", get codes that all match ^[A-HJKMNPRTWXYZ]{6}$, and between them the codes use
       every one of the 19 letters (so the set is the whole of it, not a part);
   (2) a second socket that joins with the code typed in lower case lands in that room: it is told the code in capitals, and the host
       sees its name at the table. */
"use strict";
const assert = require("assert");
const fs = require("fs");
const http = require("http");
const net = require("net");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const { io } = require("socket.io-client");

const PORT = Number(process.env.TEST_PORT || 5592);
if (PORT >= 3111 && PORT <= 3126) { console.error("refusing " + PORT + ": 3111-3126 are the live servers"); process.exit(2); }
const LETTERS = "ABCDEFGHJKMNPRTWXYZ";
const SHAPE = /^[A-HJKMNPRTWXYZ]{6}$/;
const ROOMS = 200;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const wait = (fn, what, ms = 20000) => new Promise((res, rej) => {
  const t0 = Date.now();
  const tick = () => { const v = fn(); if (v) return res(v); if (Date.now() - t0 > ms) return rej(new Error("timed out waiting for " + what)); setTimeout(tick, 10); };
  tick();
});
const get = (p) => new Promise((res, rej) => {
  const req = http.get({ host: "127.0.0.1", port: PORT, path: p }, (r) => { r.resume(); r.on("end", () => res(r.statusCode)); });
  req.on("error", rej);
});
const pid = () => "p" + Math.random().toString(36).slice(2, 10);
/* Nothing listens on the test port: a connection to it is turned away. (The suite before this one in npm test stops its server as it ends; this
   test must talk to the server it starts itself, never to one that is still going away.) */
const portFree = () => new Promise((res) => {
  const c = net.connect({ host: "127.0.0.1", port: PORT });
  c.once("connect", () => { c.destroy(); res(false); });
  c.once("error", () => res(true));
});

/* The seat list a state carries, wherever the game keeps it: the first array called players (or seats) whose entries have a name. */
function seatsOf(x, depth = 0) {
  if (!x || typeof x !== "object" || depth > 3) return null;
  for (const k of ["players", "seats"]) if (Array.isArray(x[k]) && x[k].some((p) => p && typeof p === "object" && "name" in p)) return x[k];
  for (const v of Object.values(x)) { const r = seatsOf(v, depth + 1); if (r) return r; }
  return null;
}

async function main() {
  let free = false;
  for (let i = 0; i < 100 && !free; i++) { free = await portFree(); if (!free) await sleep(100); }
  assert(free, "port " + PORT + " is in use: another server is listening on it");
  const data = fs.mkdtempSync(path.join(os.tmpdir(), "roomcode-test-"));
  const srv = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], { env: { ...process.env, PORT: String(PORT), RANK_DIR: data, STATS_DIR: data, DATA_DIR: data }, stdio: "ignore" });
  let gone = false;
  srv.on("exit", () => { gone = true; });
  const socks = [];
  let passed = 0;
  const ok = (m) => { passed++; console.log("  ok " + m); };
  const open = async () => {
    const s = io(`http://127.0.0.1:${PORT}`, { transports: ["websocket"], forceNew: true, reconnection: false });
    socks.push(s);
    s.seen = []; s.refusals = [];
    s.onAny((ev, ...args) => { if (ev === "err") s.refusals.push(args[0]); for (const a of args) if (a && typeof a === "object") s.seen.push(a); });
    s.on("joined", (j) => { s.joined = j; });
    await wait(() => s.connected, "a socket to connect");
    return s;
  };
  const sees = (s, name) => s.seen.some((m) => { const seats = seatsOf(m); return seats && seats.some((p) => p && p.name === name); });
  try {
    let up = false;
    for (let i = 0; i < 300 && !up && !gone; i++) { try { await get("/"); up = true; } catch { await sleep(100); } }
    assert(up && !gone, "the server did not come up");

    // 1. 200 rooms: every code is six of the 19 letters, and all 19 turn up.
    const codes = [];
    let host = null;
    for (let i = 0; i < ROOMS; i++) {
      const s = await open();
      s.emit("create", { name: "Hosta", playerId: pid(), avatar: "x" });
      await wait(() => s.joined || s.refusals.length, "the reply to create number " + (i + 1));
      assert(s.joined && typeof s.joined.code === "string", "create number " + (i + 1) + " was refused: " + JSON.stringify(s.refusals));
      codes.push(s.joined.code);
      if (i < ROOMS - 1) { s.close(); socks.pop(); } else host = s;
    }
    const bad = codes.filter((c) => !SHAPE.test(c));
    assert.strictEqual(bad.length, 0, "codes outside ^[A-HJKMNPRTWXYZ]{6}$: " + bad.slice(0, 10).join(" "));
    const used = new Set(codes.join(""));
    const missing = [...LETTERS].filter((ch) => !used.has(ch));
    assert.strictEqual(missing.length, 0, "letters that never turned up in " + ROOMS + " codes: " + missing.join(""));
    ok(ROOMS + " new rooms: every code is six letters from " + LETTERS + ", no digits, and all 19 letters turn up (the last: " + codes[ROOMS - 1] + ")");

    // 2. The code typed in lower case finds the room.
    const code = host.joined.code;
    await wait(() => sees(host, "Hosta"), "the host's own table");
    const guest = await open();
    guest.emit("join", { code: code.toLowerCase(), name: "Lowerb", playerId: pid(), avatar: "x" });
    await wait(() => guest.joined || guest.refusals.length, "the reply to the lower-case join");
    assert(guest.joined, "joining " + code.toLowerCase() + " was refused: " + JSON.stringify(guest.refusals));
    assert.strictEqual(guest.joined.code, code, "the joiner is told the code in capitals");
    assert(!guest.joined.waiting, "the joiner is seated, not put in a waiting line");
    await wait(() => sees(host, "Lowerb"), "the host to see the joiner at the table");
    ok("joining with " + code.toLowerCase() + " (lower case) lands in room " + code + ": the host sees the joiner at the table");
  } finally {
    socks.forEach((s) => s.close());
    await new Promise((done) => { if (gone) return done(); srv.once("exit", done); srv.kill(); setTimeout(done, 3000); });   // the port is free again before the next suite
    fs.rmSync(data, { recursive: true, force: true });
  }
  console.log(`room codes: all ${passed} passed`);
}
main().then(() => process.exit(0), (e) => { console.error("FAIL " + (e && e.message)); process.exit(1); });
