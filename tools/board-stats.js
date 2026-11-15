#!/usr/bin/env node
/* Before-and-after statistics for Snakebite's calm boards.

     node tools/board-stats.js [seeds=300] [--json out.json] [--prefix seed-]

   "Before" is T12's generator exactly as it shipped (board.js genBoardT12);
   "after" is the calm generator (board.js genBoard). Both are measured with the
   serpents bent as today's web and iPhone clients bend them (index.html
   snakeCtrl, sides alternating by the heads' order), 96 pieces a serpent:

   - crossings: centre lines crossing (ladder x ladder, serpent x ladder, serpent x serpent);
   - near: cells of serpent within half a cell of a ladder, at any angle (the critique's measure, R4);
   - along: the part of "near" running within 35 degrees of the ladder (round 3's measure);
   - the worst serpent's share of its length near / along a ladder, and the boards where one lies over half;
   - spans: each ladder's climb and each serpent's fall, and the longest fall on each board;
   - the generator's time per board, and how often T12 fell back to the fixed classic board.
   The last two columns measure the same boards bent by the Unreal bend chooser of snakes/WORLD.md 3.3 (not in the
   app yet), which the client's GameNest.Snakes.CalmBoardsAreCalm targets are written against. */
"use strict";
const fs = require("fs");
const path = require("path");
const { genBoard, genBoardT12, measureBoard } = require(path.join(__dirname, "..", "board.js"));

const N = Number(process.argv.find((a, i) => i > 1 && /^\d+$/.test(a)) || 300);
const argOf = (k) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : null; };
const PREFIX = argOf("prefix") || "seed-";

const q = (arr, p) => { const s = arr.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.max(0, Math.ceil(p * s.length) - 1))]; };
const med = (a) => q(a, 0.5), p90 = (a) => q(a, 0.9), p10 = (a) => q(a, 0.1), p99 = (a) => q(a, 0.99);
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const r1 = (x) => Math.round(x * 10) / 10, r2 = (x) => Math.round(x * 100) / 100;

function run(gen, label, bends) {
  const rows = [], ms = [];
  let fallbacks = 0, rerounds = 0;
  for (let i = 0; i < N; i++) {
    const seed = PREFIX + i;
    const t0 = process.hrtime.bigint();
    const b = gen(seed);
    ms.push(Number(process.hrtime.bigint() - t0) / 1e6);
    if (b.fallback) fallbacks++;
    if (b.stats && b.stats.attempt) rerounds++;
    rows.push(measureBoard(b, 96, bends));
  }
  const col = (k) => rows.map((r) => r[k]);
  const rises = rows.flatMap((r) => r.rises), falls = rows.flatMap((r) => r.falls);
  return {
    label, seeds: N, fallbacks, rerounds,
    crossings: { median: med(col("crossings")), p90: p90(col("crossings")), mean: r2(mean(col("crossings"))), max: Math.max(...col("crossings")) },
    ladderXladder: { median: med(col("ll")), p90: p90(col("ll")), max: Math.max(...col("ll")) },
    serpentXladder: { median: med(col("sl")), p90: p90(col("sl")) },
    serpentXserpent: { median: med(col("ss")), p90: p90(col("ss")) },
    near: { median: r1(med(col("near"))), p90: r1(p90(col("near"))), mean: r2(mean(col("near"))) },
    along: { median: r1(med(col("along"))), p90: r1(p90(col("along"))), mean: r2(mean(col("along"))) },
    nearSerpents: { median: r1(med(col("nearSerpents"))), p90: r1(p90(col("nearSerpents"))) },
    worstShareNear: { median: r2(med(col("worstShareNear"))), p90: r2(p90(col("worstShareNear"))) },
    worstShareAlong: { median: r2(med(col("worstShareAlong"))), p90: r2(p90(col("worstShareAlong"))) },
    boardsHalfNear: rows.filter((r) => r.worstShareNear > 0.5).length,
    boardsHalfAlong: rows.filter((r) => r.worstShareAlong > 0.5).length,
    rise: { p10: p10(rises), median: med(rises), p90: p90(rises), mean: r1(mean(rises)) },
    fall: { p10: p10(falls), median: med(falls), p90: p90(falls), mean: r1(mean(falls)) },
    longestFall: { p10: p10(col("longestFall")), median: med(col("longestFall")), min: Math.min(...col("longestFall")) },
    longestRise: { median: med(col("longestRise")) },
    genMs: { median: r2(med(ms)), p99: r2(p99(ms)), max: r2(Math.max(...ms)) },
  };
}

const before = run(genBoardT12, "T12 (today)");
const RULE = argOf("rule") ? JSON.parse(argOf("rule")) : undefined;   // for exploring the rule's constants
const after = run((seed) => genBoard(seed, RULE), "calm");
const beforeC = run(genBoardT12, "T12, chooser bends", "chooser");
const afterC = run((seed) => genBoard(seed, RULE), "calm, chooser bends", "chooser");
const out = { seeds: N, prefix: PREFIX, measuredWith: "web bends (index.html snakeCtrl), 96 pieces a serpent; *Chooser: the bends of the Unreal bend chooser (WORLD.md 3.3)", before, after, beforeChooser: beforeC, afterChooser: afterC };

const line = (k, f) => `| ${k} | ${f(before)} | ${f(after)} | ${f(beforeC)} | ${f(afterC)} |`;
const mp = (o) => `${o.median} (${o.p90})`;
console.log(`\nSnakebite boards over ${N} seeds (${PREFIX}0..${PREFIX}${N - 1}), median (90th percentile)\n`);
console.log("| measure | T12 (today), today's bends | calm, today's bends | T12, chooser bends | calm, chooser bends |\n|---|---|---|---|---|");
console.log(line("crossings a board", (s) => `${mp(s.crossings)}, max ${s.crossings.max}`));
console.log(line("  ladder x ladder", (s) => `${mp(s.ladderXladder)}, max ${s.ladderXladder.max}`));
console.log(line("  serpent x ladder", (s) => mp(s.serpentXladder)));
console.log(line("  serpent x serpent", (s) => mp(s.serpentXserpent)));
console.log(line("cells of serpent within 1/2 cell of a ladder (near, any angle)", (s) => mp(s.near)));
console.log(line("  of which lying along (within 35 deg)", (s) => mp(s.along)));
console.log(line("cells of serpent within 1/2 cell of another serpent", (s) => mp(s.nearSerpents)));
console.log(line("worst serpent's share near / along a ladder", (s) => `${mp(s.worstShareNear)} / ${mp(s.worstShareAlong)}`));
console.log(line("boards with a serpent over half near / along a ladder", (s) => `${s.boardsHalfNear} / ${s.boardsHalfAlong}`));
console.log(line("ladder climb p10 / median / p90 (mean)", (s) => `${s.rise.p10} / ${s.rise.median} / ${s.rise.p90} (${s.rise.mean})`));
console.log(line("serpent fall p10 / median / p90 (mean)", (s) => `${s.fall.p10} / ${s.fall.median} / ${s.fall.p90} (${s.fall.mean})`));
console.log(line("longest fall p10 / median (min)", (s) => `${s.longestFall.p10} / ${s.longestFall.median} (${s.longestFall.min})`));
console.log(line("generator ms median / p99 / max", (s) => `${s.genMs.median} / ${s.genMs.p99} / ${s.genMs.max}`));
console.log(line("fallback boards", (s) => `${s.fallbacks}${s.rerounds ? ` (boards whose first spans were drawn again: ${s.rerounds})` : ""}`));
const J = argOf("json");
if (J) { fs.writeFileSync(J, JSON.stringify(out, null, 2)); console.log("\nwrote " + J); }

/* round 2 (2026-11-01): the clear rule, judged exactly on both client families' bends (the web's bend and the iPhone app's sleek S) */
{
  const B = require(path.join(__dirname, "..", "board.js"));
  const rows = [];
  for (let i = 0; i < N; i++) rows.push(B.clearance(B.genBoard(PREFIX + i)));
  const least = (k) => Math.min(...rows.map((r) => r[k])).toFixed(2), med2 = (k) => q(rows.map((r) => r[k]), 0.5).toFixed(2);
  console.log(`\nThe clear rule over ${N} seeds, both families, centre-line distances in cells (least over all boards, median of each board's least):`);
  console.log(`  crossings of any kind: ${rows.reduce((s, r) => s + r.crossings, 0)}; serpent-serpent ${least("ss")} (${med2("ss")}); serpent-ladder ${least("sl")} (${med2("sl")}); ladder-ladder ${least("ll")} (${med2("ll")}); from a head ${least("head")}, a tail ${least("tail")}, a ladder end ${least("ladderEnd")}; in from the edge ${least("edge")}`);
}
