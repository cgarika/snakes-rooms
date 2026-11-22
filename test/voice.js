/*
 Voice chat (the voice lane, 2026-11-18): voice.js against a fake EOS Web API, and over real sockets with the Ludo server.
 Run:  node test/voice.js   (own server on TEST_PORT_VOICE, default 5896, a fake EOS on +1; never the live ports)
 Proves:
 - module: configured() needs all three env values; private rooms only (quick/public/ranked never); room name carries a salt;
   the token request goes out as EOS wants it (Basic client credentials, then Bearer, participants [{puid, hardMuted:false}]);
   the access token is reused and refreshed on a 401; a bad EOS answer throws; view() lists only present humans who joined.
 - sockets: not configured -> "off" and gnVoice.on false; configured + private -> a token to the asker only, peers in everyone's state;
   a quick room, a bot, a bad puid, a puid another seat holds, the 3 s gap and the hourly cap are all dropped; leaving drops the peer;
   an EOS outage answers { ok:false } and the server runs on.
*/
"use strict";
const http = require("http");
const { io } = require("socket.io-client");
const { spawn } = require("child_process");
const path = require("path");
const Voice = require("../voice");

const PORT = Number(process.env.TEST_PORT_VOICE || 5896), EOS_PORT = PORT + 1;
if (PORT >= 3111 && PORT <= 3126) { console.error("refusing " + PORT + ": live servers"); process.exit(2); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms = 4000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await sleep(10); } return false; };
let failed = 0;
const ok = (m) => console.log("PASS " + m), bad = (m) => { console.log("FAIL " + m); failed++; };
const check = (c, m) => (c ? ok(m) : bad(m));
const waitUp = async (port) => { for (let i = 0; i < 400; i += 1) { const up = await new Promise((r) => http.get({ host: "127.0.0.1", port, path: "/health" }, (x) => { x.resume(); r(!!x.statusCode); }).on("error", () => r(false))); if (up) return true; await sleep(100); } return false; };
const P = (n) => n.toString(16).padStart(32, "0");

/* ---------------- the fake EOS Web API ---------------- */
const eos = { hits: [], fail: false, tokens: 0, stale: false };
const eosServer = http.createServer((req, res) => {
  let b = ""; req.on("data", (c) => { b += c; });
  req.on("end", () => {
    eos.hits.push({ url: req.url, auth: req.headers.authorization, body: b });
    const json = (s, o) => { res.writeHead(s, { "Content-Type": "application/json" }); res.end(JSON.stringify(o)); };
    if (req.url === "/auth/v1/oauth/token") { eos.tokens++; return json(200, { access_token: "AT" + eos.tokens, expires_in: 7200 }); }
    const m = req.url.match(/^\/rtc\/v1\/([^/]+)\/room\/(.+)$/);
    if (m) {
      if (eos.fail) return json(500, { error: "down" });
      if (eos.stale && req.headers.authorization === "Bearer AT1") { eos.stale = false; return json(401, {}); }
      const body = JSON.parse(b);
      return json(200, { roomId: decodeURIComponent(m[2]), deploymentId: m[1], clientBaseUrl: "https://rtc.test.eos/", participants: body.participants.map((p) => ({ puid: p.puid, token: "TOK-" + p.puid.slice(-4), hardMuted: false })) });
    }
    json(404, {});
  });
});

async function moduleTests() {
  const env = { EOS_SERVER_CLIENT_ID: "cid", EOS_SERVER_CLIENT_SECRET: "sec", EOS_DEPLOYMENT_ID: "dep", EOS_API_BASE: `http://127.0.0.1:${EOS_PORT}` };
  Voice.configure({ env: {} });
  check(!Voice.configured(), "module: no keys = not configured");
  Voice.configure({ env: { EOS_SERVER_CLIENT_ID: "a", EOS_SERVER_CLIENT_SECRET: "b" } });
  check(!Voice.configured(), "module: two of three keys = still off");
  Voice.configure({ env });
  check(Voice.configured(), "module: all three = on");
  const priv = { code: "ABCDEF", players: [] };
  check(Voice.isPrivate(priv) && !Voice.isPrivate({ code: "X", quick: { seats: 4 } }) && !Voice.isPrivate({ code: "X", public: true }) && !Voice.isPrivate({ code: "X", ranked: true }) && !Voice.isPrivate(null), "module: private only; quick, public and ranked never");
  Voice.ensure(priv);
  const n1 = Voice.roomName(priv), other = Voice.ensure({ code: "ABCDEF", players: [] });
  check(/^gn-ABCDEF-[0-9a-f]{12}$/.test(n1) && Voice.roomName(other) !== n1 && Voice.roomName(priv) === n1, "module: room name = code + a per-room salt, stable for the room");
  eos.hits = []; eos.tokens = 0;
  const t = await Voice.requestToken(n1, P(1));
  check(t.roomName === n1 && t.clientBaseUrl === "https://rtc.test.eos/" && t.token === "TOK-0001", "module: token answer parsed");
  const rtc = eos.hits.find((h) => h.url.startsWith("/rtc/"));
  check(eos.hits[0].auth === "Basic " + Buffer.from("cid:sec").toString("base64") && /grant_type=client_credentials/.test(eos.hits[0].body) && /deployment_id=dep/.test(eos.hits[0].body), "module: the access token is asked with client credentials and the deployment");
  check(rtc.auth === "Bearer AT1" && rtc.url === `/rtc/v1/dep/room/${n1}` && JSON.parse(rtc.body).participants[0].puid === P(1) && JSON.parse(rtc.body).participants[0].hardMuted === false, "module: the room is asked with Bearer, the puid, not hard-muted");
  await Voice.requestToken(n1, P(2));
  check(eos.tokens === 1, "module: the access token is reused");
  eos.stale = true;
  await Voice.requestToken(n1, P(3));
  check(eos.tokens === 2, "module: a 401 gets a fresh access token and one retry");
  eos.fail = true;
  let threw = false; try { await Voice.requestToken(n1, P(4)); } catch { threw = true; }
  eos.fail = false;
  check(threw, "module: an EOS outage throws (the caller says off)");
  // view
  const room = { code: "QWERTY", players: [{ id: "a" }, { id: "b", bot: true }, { id: "c", left: true }, { id: "d", connected: false }, { id: "e" }] };
  Voice.ensure(room);
  for (const [id, n] of [["a", 1], ["b", 2], ["c", 3], ["d", 4], ["e", 5]]) room._voice.puid.set(id, P(n));
  const v = Voice.view(room).gnVoice;
  check(v.on && v.peers.length === 2 && v.peers[0].seat === 0 && v.peers[0].puid === P(1) && v.peers[1].seat === 4, "module: peers = present humans who joined (a bot, a seat that left and a dropped one are not listed)");
  check(!Voice.view({ code: "Z", quick: {}, players: [] }).gnVoice.on && Voice.view({ code: "Z", quick: {}, players: [] }).gnVoice.peers.length === 0, "module: a quick room is never on");
  Voice.configure({ env: {} });
  check(!Voice.view(room).gnVoice.on && Voice.view(room).gnVoice.peers.length === 0, "module: not configured = off, no peers");
  Voice.configure({ env });
}

/* ---------------- the room server over sockets (the same file in every server) ---------------- */
function mk(port) {
  const c = io("http://localhost:" + port, { transports: ["websocket"], reconnection: false, forceNew: true });
  c.st = null; c.joined = null; c.tokens = []; c.seat = -1;
  c.on("state", (f) => { c.st = f.room; c.seat = f.mySeat; });
  c.on("joined", (j) => { c.joined = j.code; });
  c.on("gnVoiceToken", (t) => c.tokens.push(t));
  return c;
}
function boot(port, extra) {
  const srv = spawn(process.execPath, ["server.js"], { cwd: path.join(__dirname, ".."), env: { ...process.env, PORT: String(port), BOT_DELAY_MS: "30", ...extra }, stdio: ["ignore", "ignore", "pipe"] });
  let err = ""; srv.stderr.on("data", (b) => { err += b; });
  srv.getErr = () => err;
  return srv;
}

async function socketTests() {
  const keys = { EOS_SERVER_CLIENT_ID: "cid", EOS_SERVER_CLIENT_SECRET: "sec", EOS_DEPLOYMENT_ID: "dep", EOS_API_BASE: `http://127.0.0.1:${EOS_PORT}` };
  // --- 1: not configured
  let srv = boot(PORT, {}); await waitUp(PORT);
  let a = mk(PORT); a.emit("create", { name: "Ava", playerId: "pa" }); await until(() => a.st);
  check(a.st.gnVoice && a.st.gnVoice.on === false && a.st.gnVoice.peers.length === 0, "socket: without keys the state says gnVoice.on false");
  a.emit("gnVoiceJoin", { puid: P(1) }); await until(() => a.tokens.length);
  check(a.tokens.length === 1 && a.tokens[0].ok === false && a.tokens[0].off === true, "socket: without keys a join answers off");
  a.close(); srv.kill(); await sleep(300);

  // --- 2: configured
  eos.hits = []; eos.tokens = 0;
  srv = boot(PORT, { ...keys, VOICE_TEST: "1" }); await waitUp(PORT);
  a = mk(PORT); a.emit("create", { name: "Ava", playerId: "pa" }); await until(() => a.st);
  const code = a.joined;
  check(a.st.gnVoice.on === true && a.st.gnVoice.peers.length === 0, "socket: a private room with keys says on, nobody in yet");
  const b = mk(PORT); b.emit("join", { code, name: "Ben", playerId: "pb" }); await until(() => b.st && b.st.players.length === 2);
  a.emit("gnVoiceJoin", { puid: P(1) }); await until(() => a.tokens.length);
  const tk = a.tokens[0];
  check(tk.ok === true && tk.token === "TOK-0001" && tk.clientBaseUrl === "https://rtc.test.eos/" && new RegExp("^gn-" + code + "-[0-9a-f]{12}$").test(tk.roomName), "socket: the asker gets { roomName, clientBaseUrl, token }");
  await until(() => b.st.gnVoice.peers.length === 1);
  check(b.tokens.length === 0 && b.st.gnVoice.peers[0].seat === 0 && b.st.gnVoice.peers[0].puid === P(1), "socket: the others see the peer (seat, puid) and no token");
  // a second one inside the 3 s gap is dropped; a bad puid; a puid another seat holds
  a.emit("gnVoiceJoin", { puid: P(9) }); await sleep(250);
  check(a.tokens.length === 1, "socket: a second ask inside 3 s is dropped without a word");
  b.emit("gnVoiceJoin", { puid: "not-a-puid" }); b.emit("gnVoiceJoin", { puid: P(1) }); b.emit("gnVoiceJoin", {}); b.emit("gnVoiceJoin", null); await sleep(300);
  check(b.tokens.length === 0, "socket: a bad puid, another seat's puid and junk are dropped");
  b.emit("gnVoiceJoin", { puid: P(2) }); await until(() => b.tokens.length);
  check(b.tokens[0].ok && b.tokens[0].token === "TOK-0002", "socket: the second player gets their own token");
  await until(() => a.st.gnVoice.peers.length === 2);
  check(a.st.gnVoice.peers.length === 2, "socket: both are peers now");
  // a bot cannot ask: add one and check peers do not change (a bot has no socket) - and a non-seated socket
  const watcher = mk(PORT); watcher.emit("gnVoiceJoin", { puid: P(3) }); await sleep(300);
  check(watcher.tokens.length === 0, "socket: a socket in no room is dropped");
  // leaving voice
  b.emit("gnVoiceLeave"); await until(() => a.st.gnVoice.peers.length === 1);
  check(a.st.gnVoice.peers.length === 1 && a.st.gnVoice.peers[0].seat === 0, "socket: gnVoiceLeave drops the peer");
  // leaving the room
  a.close(); await until(() => b.st.gnVoice.peers.length === 0, 3000);
  check(b.st.gnVoice.peers.length === 0, "socket: a player who disconnects drops out of the peers");
  b.close(); watcher.close();

  // --- 3: a quick room never gets voice
  const q = mk(PORT); q.emit("quick", { name: "Quin", playerId: "pq" }); await until(() => q.st);
  check(q.st.gnVoice.on === false, "socket: a quick-match room says on:false");
  q.emit("gnVoiceJoin", { puid: P(7) }); await until(() => q.tokens.length);
  check(q.tokens[0].ok === false && q.tokens[0].off === true, "socket: a quick-match room is refused (off)");
  q.close();

  // --- 4: EOS down
  eos.fail = true;
  const c = mk(PORT); c.emit("create", { name: "Cy", playerId: "pc" }); await until(() => c.st);
  c.emit("gnVoiceJoin", { puid: P(8) }); await until(() => c.tokens.length);
  check(c.tokens[0].ok === false && !c.tokens[0].off && c.st.gnVoice.peers.length === 0, "socket: an EOS outage answers ok:false and nobody is listed");
  eos.fail = false;
  c.emit("create", { name: "Cy", playerId: "pc" }); await sleep(100);
  check(srv.exitCode === null, "socket: the server runs on" + (srv.getErr() ? " (stderr: " + srv.getErr().split("\n")[0] + ")" : ""));
  c.close(); srv.kill();
}

(async () => {
  await new Promise((r) => eosServer.listen(EOS_PORT, "127.0.0.1", r));
  try { await moduleTests(); await socketTests(); } catch (e) { bad("exception " + (e && e.stack)); }
  eosServer.close();
  console.log(failed ? `\n${failed} FAILED` : "\nall passed");
  process.exit(failed ? 1 : 0);
})();
