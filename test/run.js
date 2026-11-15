/*
 npm test: starts server.js on TEST_PORT (default 3611) with BOT_MS=5, runs every suite, stops the server.
   TEST_PORT=3274 TEST_PORT2=3275 TEST_PORT3=3276 npm test
 The suites that start servers of their own use TEST_PORT2 and TEST_PORT3 (defaults 3621 and 3631).
*/
"use strict";
const { spawn, spawnSync } = require("child_process");
const path = require("path");
const net = require("net");

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.TEST_PORT || 3611);
const SUITES = (process.argv.slice(2).length ? process.argv.slice(2) : ["board.js", "rules.js", "worlds.js", "guard.js", "waiting.js", "reactions.js", "pacing.js"]);
if (PORT >= 3111 && PORT <= 3118) { console.error("refusing " + PORT + ": 3111-3118 are the live servers"); process.exit(2); }

const free = (port) => new Promise((res) => { const s = net.createServer(); s.once("error", () => res(false)); s.once("listening", () => s.close(() => res(true))); s.listen(port, "127.0.0.1"); });

(async () => {
  for (const p of [PORT, Number(process.env.TEST_PORT2 || 3621), Number(process.env.TEST_PORT3 || 3631)]) {
    if (!(await free(p))) { console.error("port " + p + " is busy; set TEST_PORT / TEST_PORT2 / TEST_PORT3"); process.exit(2); }
  }
  const srv = spawn(process.execPath, ["server.js"], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), BOT_MS: "5", TEST_HOOKS: "1" }, stdio: "ignore" });
  await new Promise((r) => setTimeout(r, 700));
  let failed = 0;
  try {
    for (const suite of SUITES) {
      console.log(`\n== test/${suite}`);
      const r = spawnSync(process.execPath, [path.join("test", suite)], { cwd: ROOT, env: process.env, stdio: "inherit", timeout: 10 * 60 * 1000 });
      if (r.status !== 0) { failed++; console.error(`== test/${suite} FAILED (${r.status === null ? r.signal : r.status})`); }
    }
  } finally { srv.kill(); }
  console.log(failed ? `\n${failed} suite(s) FAILED` : "\nALL SUITES PASS");
  process.exit(failed ? 1 : 0);
})();
