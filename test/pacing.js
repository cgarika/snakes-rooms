/*
 Snakes & Ladders — bot pacing (2026-11-01). How long a bot thinks before it rolls:
   a live server (no BOT_MS) thinks 0.4 to 1.1 s, each bot at its own pace of 0.85 to 1.15 of that, so the three bots of a one-person
   table think about 2.3 s between that person's turns (it was 0.9 to 1.8 s, about 4), and the wait varies;
   a server given BOT_MS (these tests, the dev servers) keeps the old rule, BOT_MS plus up to as much again.
 It starts no server: botThinkMs is read straight from the module, in a child process per environment.
*/
"use strict";
const { spawnSync } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..");
let failed = 0;
const check = (ok, what) => { if (!ok) { failed++; console.error("FAIL: " + what); } else console.log("ok: " + what); };

/** n samples of botThinkMs(bot) for a bot at pace, in a process whose environment is env. */
function samples(env, pace, n = 4000) {
  const code = `const { botThinkMs } = require(${JSON.stringify(path.join(ROOT, "server.js"))}); const out = []; for (let i = 0; i < ${n}; i++) out.push(botThinkMs(${pace === undefined ? "undefined" : `{ pace: ${pace} }`})); console.log(JSON.stringify(out)); process.exit(0);`;
  const e = { ...process.env };
  delete e.BOT_MS;
  Object.assign(e, env);
  const r = spawnSync(process.execPath, ["-e", code], { cwd: ROOT, env: e, encoding: "utf8", timeout: 60000 });
  if (r.status !== 0) throw new Error("child failed: " + r.stderr);
  return JSON.parse(r.stdout.trim().split("\n").pop());
}
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;

// A live server: no BOT_MS.
{
  const a = samples({}, undefined);
  check(Math.min(...a) >= 400 && Math.max(...a) <= 1100, `a bot without a pace thinks 0.4 to 1.1 s (${Math.min(...a)} to ${Math.max(...a)} ms)`);
  check(Math.abs(mean(a) - 750) < 50, `its mean is about 0.75 s (${Math.round(mean(a))} ms)`);
  check(new Set(a).size > 200, `the waits vary (${new Set(a).size} different values in ${a.length})`);
  const quick = samples({}, 0.85), slow = samples({}, 1.15);
  check(Math.min(...quick) >= 340 && Math.max(...slow) <= 1265, `a bot's pace scales it: 0.85 gives from ${Math.min(...quick)} ms, 1.15 up to ${Math.max(...slow)} ms`);
  check(mean(slow) > mean(quick) * 1.25, `a slow bot is slower than a quick one (${Math.round(mean(slow))} against ${Math.round(mean(quick))} ms)`);
  // Three bots between a person's turns, at the pace of the whole range: about 2.3 s of thinking.
  check(3 * mean(a) < 2500, `three bots think about ${(3 * mean(a) / 1000).toFixed(1)} s between a person's turns`);
}

// A server given BOT_MS keeps its rule.
{
  const a = samples({ BOT_MS: "50" }, 1.15);
  check(Math.min(...a) >= 50 && Math.max(...a) < 100, `BOT_MS=50 thinks 50 to 99 ms whatever the pace (${Math.min(...a)} to ${Math.max(...a)} ms)`);
  const b = samples({ BOT_MS: "5" }, undefined);
  check(Math.min(...b) >= 5 && Math.max(...b) < 10, `BOT_MS=5 (the test servers) thinks 5 to 9 ms (${Math.min(...b)} to ${Math.max(...b)} ms)`);
}

console.log(failed ? `\n${failed} FAILED` : "\nALL PACING CHECKS PASS");
process.exit(failed ? 1 : 0);
