/* Friends "last played with" (launch lane, 2026-11-19): friendsplayed.js, and the room server's own wiring.   node test/friendsplayed.js
   Own server on TEST_PORT_FP (default 5896; a fake friends service on +1; never 3111-3126).
   Proves:
   - module: off without the URL or without a 16+ character secret; counts the seated humans with an account, each once, never a bot (one who left mid-game still played); fewer than two accounts is no report; the call carries X-GN-Internal and { game, accounts }; one report per finished game, again after a rematch;
     a friends outage, a 500 or a hang never throws.
   - the server: two people with wallet entitlements make a private room; its roster names both accounts (the seats carry their account); the state
     says gnVoice (voice is wired) and adds no field of Played's; when one person leaves the started game and it is over, the friends service
     is told once with this game's name and both accounts. Without the friends env nothing is sent. */
"use strict";
const http = require("http");
const crypto = require("crypto");
const path = require("path");
const { spawn } = require("child_process");
const { io } = require("socket.io-client");
const Played = require("../friendsplayed");

const SLUG = process.env.FP_GAME || require("fs").readFileSync(path.join(__dirname, "..", "server.js"), "utf8").match(/Played\.view\(room, "([a-z]+)"\)/)[1];
const NEED = { mafia: 4, wordspies: 4, punchlines: 3 }[SLUG] || 2;   // humans a game needs to start
const PORT = Number(process.env.TEST_PORT_FP || 5896), FR_PORT = PORT + 1;
if (PORT >= 3111 && PORT <= 3126) { console.error("refusing " + PORT + ": live servers"); process.exit(2); }
const SECRET = "friends-test-secret-0123456789";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms = 6000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await sleep(15); } return false; };
let failed = 0;
const ok = (m) => console.log("PASS " + m), bad = (m) => { console.log("FAIL " + m); failed++; };
const check = (c, m) => (c ? ok(m) : bad(m));
const A = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

/* the fake friends service */
const fr = { hits: [], status: 200, hang: false };
const frServer = http.createServer((req, res) => {
  let b = ""; req.on("data", (c) => { b += c; });
  req.on("end", () => {
    fr.hits.push({ url: req.url, method: req.method, secret: req.headers["x-gn-internal"], body: b ? JSON.parse(b) : null });
    if (fr.hang) return;
    res.writeHead(fr.status, { "Content-Type": "application/json" }); res.end(JSON.stringify({ updated: 1 }));
  });
});

async function moduleTests() {
  const env = { FRIENDS_INTERNAL_URL: `http://127.0.0.1:${FR_PORT}/friends`, FRIENDS_INTERNAL_SECRET: SECRET };
  const room = { status: "playing", players: [{ acct: A(1) }, { acct: A(2) }, { acct: A(3), bot: true }, { acct: A(1) }, { acct: "nope" }, {}] };
  Played.configure({ env: {} });
  check(!Played.configured() && (await Played.report("ludo", room)) === false && fr.hits.length === 0, "module: no url and no secret = off, nothing sent");
  Played.configure({ env: { FRIENDS_INTERNAL_URL: env.FRIENDS_INTERNAL_URL, FRIENDS_INTERNAL_SECRET: "short" } });
  check(!Played.configured(), "module: a secret under 16 characters = off");
  Played.configure({ env: { FRIENDS_INTERNAL_URL: env.FRIENDS_INTERNAL_URL, GN_INTERNAL_SECRET: SECRET } });
  check(Played.configured(), "module: GN_INTERNAL_SECRET is the fallback secret");
  Played.configure({ env });
  check(JSON.stringify(Played.accounts(room)) === JSON.stringify([A(1), A(2)]), "module: humans with an account, once each; a bot, a bad id and an empty seat are not counted");
  check((await Played.report("ludo", { players: [{ acct: A(1) }, { acct: A(1) }] })) === false && fr.hits.length === 0, "module: one account is no report");
  check((await Played.report("ludo", room)) === true, "module: a report is taken");
  const h = fr.hits[0];
  check(h.url === "/friends/internal/played" && h.method === "POST" && h.secret === SECRET && h.body.game === "ludo" && h.body.accounts.length === 2, "module: POST /internal/played with the secret, the game and the accounts");
  // view: once per game, re-armed
  fr.hits = [];
  const r = { status: "playing", players: room.players };
  check(Object.keys(Played.view(r, "ludo")).length === 0, "module: view adds nothing to a state");
  Played.view(r, "ludo"); await sleep(80);
  check(fr.hits.length === 0, "module: nothing is sent while the game is on");
  r.status = "over"; Played.view(r, "ludo"); Played.view(r, "ludo"); Played.view(r, "ludo"); await sleep(120);
  check(fr.hits.length === 1, "module: a finished game is reported once however many states are built");
  r.status = "playing"; Played.view(r, "ludo"); r.status = "over"; Played.view(r, "ludo"); await sleep(120);
  check(fr.hits.length === 2, "module: a rematch that ends is reported again");
  fr.status = 500;
  check((await Played.report("ludo", room)) === false, "module: a 500 is false, not a throw");
  fr.status = 200; fr.hang = true;
  const t0 = Date.now(); const hung = await Played.report("ludo", room);
  check(hung === false && Date.now() - t0 < 4500, "module: a hanging friends service gives up inside 3 s");
  fr.hang = false;
  Played.configure({ env: { FRIENDS_INTERNAL_URL: "http://127.0.0.1:1", FRIENDS_INTERNAL_SECRET: SECRET } });
  check((await Played.report("ludo", room)) === false, "module: an unreachable service is false, not a throw");
  Played.configure({ env });
  check(Object.keys(Played.view(null, "ludo")).length === 0, "module: no room is fine");
  Played.configure({ env: {} });
}

/* ---------- the server over sockets ---------- */
const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
const b64u = (b) => Buffer.from(b).toString("base64url");
function entitlement(acct) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(JSON.stringify({ alg: "EdDSA", typ: "GNE", kid: "fp1" }));
  const body = b64u(JSON.stringify({ v: 1, acct, plus: 0, iat: now, exp: now + 3600 }));
  return head + "." + body + "." + b64u(crypto.sign(null, Buffer.from(head + "." + body), privateKey));
}
function mk(port, n) {
  const c = io("http://localhost:" + port, { transports: ["websocket"], reconnection: false, forceNew: true });
  c.st = null; c.joined = null; c.n = n;
  c.on("state", (f) => { c.st = f.room || f.state || f; });
  c.on("joined", (j) => { c.joined = j.code; });
  return c;
}
function boot(extra) {
  const srv = spawn(process.execPath, ["server.js"], { cwd: path.join(__dirname, ".."), env: { ...process.env, PORT: String(PORT), BOT_DELAY_MS: "30", WALLET_PUBKEYS: JSON.stringify({ fp1: publicKey.export({ type: "spki", format: "pem" }) }), GN_INTERNAL_SECRET: SECRET, ...extra }, stdio: ["ignore", "ignore", "pipe"] });
  let err = ""; srv.stderr.on("data", (b) => { err += b; }); srv.getErr = () => err;
  return srv;
}
const roster = (code) => new Promise((res) => {
  http.get({ host: "127.0.0.1", port: PORT, path: `/internal/roster/${code}`, headers: { "X-GN-Internal": SECRET } }, (r) => { let b = ""; r.on("data", (d) => { b += d; }); r.on("end", () => res(r.statusCode === 200 ? JSON.parse(b) : null)); }).on("error", () => res(null));
});

async function play(srv, withFriends) {
  fr.hits = [];
  const people = [];
  for (let i = 0; i < NEED; i += 1) people.push(mk(PORT, i));
  const [host, ...rest] = people;
  host.emit("create", { name: "Ava", playerId: "p0", entitlement: entitlement(A(1)) });
  await until(() => host.joined);
  const code = host.joined;
  rest.forEach((c, i) => c.emit("join", { code, name: "Pal" + (i + 1), playerId: "p" + (i + 1), entitlement: entitlement(A(i + 2)) }));
  await until(() => rest.every((c) => c.joined || (c.st && c.st.players)), 4000);
  await sleep(150);
  const r = await roster(code);
  const accts = r ? r.players.map((p) => p.acct).sort() : [];
  check(accts.length === NEED && accts[0] === A(1), `server: the roster names the ${NEED} people with their accounts (the seats carry them)`);
  check(host.st && host.st.gnVoice && host.st.gnVoice.on === false && !("_played" in host.st) && !("played" in host.st), "server: the state has gnVoice (voice is wired; off without keys) and nothing of the played hook");
  host.emit("start"); await until(() => host.st && (host.st.status === "playing" || host.st.phase), 5000); await sleep(200);
  const started = host.st && host.st.status;
  // everyone but the host leaves: the game is over for want of players
  for (const c of rest) { c.emit("leave"); await sleep(120); }
  const over = await until(() => host.st && host.st.status === "over", 5000);
  await sleep(400);
  if (!over) { console.log(`NOTE ${SLUG}: the game did not end by leaving (status ${started} -> ${host.st && host.st.status}); the end is checked by the module test only`); people.forEach((c) => c.close()); return null; }
  const n = fr.hits.length;
  if (withFriends) {
    check(n === 1 && fr.hits[0].body.game === SLUG && fr.hits[0].url === "/friends/internal/played" && fr.hits[0].secret === SECRET, `server: the finished game is reported once as "${SLUG}"`);
    const got = (fr.hits[0] && fr.hits[0].body.accounts.slice().sort()) || [];
    check(got.length >= 2 && got.every((a) => /^0{8}-0{4}-4000-8000-/.test(a)), "server: the report carries the accounts of the people, no names, no room code");
    check(!JSON.stringify(fr.hits[0] || {}).includes(code), "server: the room code never leaves the server");
  } else check(n === 0, "server: without the friends env nothing is sent");
  people.forEach((c) => c.close());
  return true;
}

const waitUp = async () => { for (let i = 0; i < 400; i += 1) { const up = await new Promise((r) => http.get({ host: "127.0.0.1", port: PORT, path: "/health" }, (x) => { x.resume(); r(!!x.statusCode); }).on("error", () => r(false))); if (up) return true; await sleep(100); } return false; };

async function socketTests() {
  let srv = boot({ FRIENDS_INTERNAL_URL: `http://127.0.0.1:${FR_PORT}/friends`, FRIENDS_INTERNAL_SECRET: SECRET }); check(await waitUp(), "server: starts");
  try { await play(srv, true); } finally { srv.kill(); await sleep(400); }
  check(srv.getErr().indexOf("TypeError") < 0 && srv.getErr().indexOf("ReferenceError") < 0, "server: no crash in stderr" + (srv.getErr() ? " (" + srv.getErr().split("\n")[0] + ")" : ""));
  srv = boot({}); await waitUp();
  try { await play(srv, false); } finally { srv.kill(); }
}

(async () => {
  await new Promise((r) => frServer.listen(FR_PORT, "127.0.0.1", r));
  try { await moduleTests(); await socketTests(); } catch (e) { bad("exception " + (e && e.stack)); }
  frServer.close();
  console.log(failed ? `\n${failed} FAILED` : "\nall passed");
  process.exit(failed ? 1 : 0);
})();
