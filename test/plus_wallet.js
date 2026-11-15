/* Snakebite: the Nest Wallet's signed entitlement over real sockets (money v2, 2026-11-06): node test/plus_wallet.js
   Starts its own server on TEST_PORT (default 5592; never 3111-3125) with WALLET_PUBKEYS, WALLET_ENFORCE=1 and GN_INTERNAL_SECRET set, and checks
   (1) a create that says plus: true with no entitlement seats a player whose state says plus: false;
   (2) a create carrying an entitlement the wallet's key signed for Plus seats a Plus player, and no state the server sent holds the account id;
   (3) GET /internal/roster/<code> is 404 without the shared secret and names the humans, with their accounts, with it. */
"use strict";
const assert = require("assert");
const crypto = require("crypto");
const http = require("http");
const path = require("path");
const { spawn } = require("child_process");
const { io } = require("socket.io-client");

const PORT = Number(process.env.TEST_PORT || 5592);
if (PORT >= 3111 && PORT <= 3125) { console.error("refusing " + PORT + ": 3111-3125 are the live servers"); process.exit(2); }
const SECRET = "wallet-test-internal-secret-0123";
const ACCT = "0f3e2d1c-4b5a-4678-8a9b-c0d1e2f3a4b5";
const KID = "testkey1";
const { privateKey, publicKey } = crypto.generateKeyPairSync("ed25519");
const b64u = (b) => Buffer.from(b).toString("base64url");
function token(acct, plus) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(JSON.stringify({ alg: "EdDSA", typ: "GNE", kid: KID }));
  const body = b64u(JSON.stringify({ v: 1, acct, plus: plus ? 1 : 0, iat: now, exp: now + 3600 }));
  return head + "." + body + "." + b64u(crypto.sign(null, Buffer.from(head + "." + body), privateKey));
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const wait = (fn, ms = 8000) => new Promise((res, rej) => {
  const t0 = Date.now();
  const tick = () => { const v = fn(); if (v) return res(v); if (Date.now() - t0 > ms) return rej(new Error("timeout")); setTimeout(tick, 15); };
  tick();
});
const get = (p, headers = {}) => new Promise((res, rej) => {
  const req = http.get({ host: "127.0.0.1", port: PORT, path: p, headers }, (r) => { let b = ""; r.on("data", (d) => (b += d)); r.on("end", () => res({ status: r.statusCode, body: b })); });
  req.on("error", rej);
});

/* The seat list a state carries, wherever the game keeps it: the first array called players (or seats) whose entries have a name. */
function seatsOf(x, depth = 0) {
  if (!x || typeof x !== "object" || depth > 3) return null;
  for (const k of ["players", "seats"]) if (Array.isArray(x[k]) && x[k].some((p) => p && typeof p === "object" && "name" in p)) return x[k];
  for (const v of Object.values(x)) { const r = seatsOf(v, depth + 1); if (r) return r; }
  return null;
}
function codeOf(x, depth = 0) {
  if (!x || typeof x !== "object" || depth > 3) return null;
  for (const k of ["code", "roomCode"]) if (typeof x[k] === "string" && /^[A-Za-z0-9]{3,12}$/.test(x[k])) return x[k];
  for (const v of Object.values(x)) { const r = codeOf(v, depth + 1); if (r) return r; }
  return null;
}

async function main() {
  const srv = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], {
    env: { ...process.env, PORT: String(PORT), WALLET_PUBKEYS: JSON.stringify({ [KID]: publicKey.export({ type: "spki", format: "pem" }) }), WALLET_ENFORCE: "1", GN_INTERNAL_SECRET: SECRET },
    stdio: "ignore",
  });
  const socks = [];
  let passed = 0;
  const ok = (m) => { passed++; console.log("  ok " + m); };
  try {
    let up = false;
    for (let i = 0; i < 80 && !up; i++) { try { await get("/"); up = true; } catch { await sleep(100); } }
    assert(up, "the server did not come up");
    const host = async (name, extra) => {
      const s = io(`http://127.0.0.1:${PORT}`, { transports: ["websocket"], forceNew: true });
      socks.push(s);
      s.seen = [];
      s.onAny((ev, ...args) => { for (const a of args) if (a && typeof a === "object") s.seen.push(a); });
      await wait(() => s.connected);
      s.emit("create", { name, playerId: "p" + Math.random().toString(36).slice(2, 10), avatar: "x", ...extra });
      const find = () => { for (let i = s.seen.length - 1; i >= 0; i--) { const seats = seatsOf(s.seen[i]); if (seats && seats.some((p) => p.name === name)) return { seats, code: codeOf(s.seen[i]) || s.code, me: seats.find((p) => p.name === name) }; } return null; };
      s.last = await wait(find);
      return s;
    };

    // 1. A bare plus: true, no entitlement: not Plus.
    const plain = await host("Plain", { plus: true });
    assert.strictEqual(plain.last.me.plus, false, "a bare plus: true must not seat a Plus player when the wallet is enforced");
    ok("a create saying plus: true with no entitlement seats a player whose state says plus: false");

    // 2. An entitlement the wallet's key signed: Plus, and the account id stays off the wire.
    const paid = await host("Paid", { plus: false, entitlement: token(ACCT, true) });
    assert.strictEqual(paid.last.me.plus, true, "a valid Plus entitlement seats a Plus player");
    assert(!JSON.stringify(paid.seen).includes(ACCT), "no state the server sent may carry the account id");
    ok("a create carrying a signed Plus entitlement seats plus: true, and no state holds the account id");

    // 3. The roster: 404 without the secret, the humans and their accounts with it.
    const code = paid.last.code;
    assert(code, "the room's code");
    assert.strictEqual((await get("/internal/roster/" + code)).status, 404, "no secret: 404");
    assert.strictEqual((await get("/internal/roster/" + code, { "X-GN-Internal": "wrong-secret-wrong-secret-0123" })).status, 404, "a wrong secret: 404");
    const r = await get("/internal/roster/" + code, { "X-GN-Internal": SECRET });
    assert.strictEqual(r.status, 200, "the secret: 200");
    const roster = JSON.parse(r.body);
    assert(Array.isArray(roster.players) && roster.players.some((p) => p.acct === ACCT && p.name === "Paid" && p.bot === false), "the roster names the Plus human with their account: " + r.body);
    ok("/internal/roster/<code> is 404 without the secret and names the humans, with their accounts, with it");
  } finally {
    socks.forEach((s) => s.close());
    srv.kill();
  }
  console.log(`plus wallet: all ${passed} passed`);
}
main().then(() => process.exit(0), (e) => { console.error("FAIL " + (e && e.message)); process.exit(1); });
