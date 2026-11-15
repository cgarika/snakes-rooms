#!/usr/bin/env node
/* Makes candidate layouts for Snakebite's short boards (snakes-short, 2026-11-07): node tools/make-short-layouts.js [--seed 21] [--tries 400000] [--n 18] [--k 1.0] [--out candidates.json]

   The rules are short_rules.js's: eight ladders and eight serpents, each across two or three rows and leaning slightly, nothing within a gap of anything, every head clear of every ladder's rails,
   the pieces spread over the board with no hole. A candidate here is a ladder (foot, top) or a serpent (head, tail) on squares 2 to 99 that spans two or three rows; two candidates are COMPATIBLE when
   they share no square and keep the rules' gaps and end radii (scaled by --k: the larger the k a board still exists at, the more evenly it is spread; 1.0 is the rule itself). A board is a clique of eight
   ladders and eight serpents in that graph, found by a randomized best-candidate search (of a few, the one whose line's middle is farthest from the pieces already placed) over bitsets: tens of thousands
   of boards a second.

   The boards found are kept if they pass the whole rule (short_rules.js problem), do not hug the edge, put ends in every band of rows, and play a game of today's length (a lone player's mean turns,
   the server's own rules, within 28.5 to 36.5: today's boards are 29 to 36), and so, where it is to be dealt, does the board's left-right mirror. Of those, --n are picked, best spread first and each as unlike the ones before as it can be (13 of 16 pieces different).

   The picks are CANDIDATES: the app plans each one's serpents' curves and numbers (the app repo's Tools/snakes_layouts.py --candidates), which drops the few it cannot keep clear, and layouts.json
   is the ones that passed. Same seed, same candidates. */
"use strict";
const fs = require("fs");
const path = require("path");
const S = require("../short_rules.js");
const B = require("../board.js");
const Layouts = require("../layouts.js");
const LONE = [28.5, 36.5];   // a lone player's mean turns (today's boards: 29.0, 29.5 and 35.7)

const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
const { RULES, rowOf, colOf, xy, ptSeg, segDist } = S;

function candidates() {
  const out = [];
  for (let lo = 2; lo <= 99; lo++) for (let hi = lo + 1; hi <= 99; hi++) {
    if (RULES.CORNERS.includes(lo) || RULES.CORNERS.includes(hi)) continue;
    const R = rowOf(hi) - rowOf(lo);
    if (R < RULES.ROWS[0] || R > RULES.ROWS[1]) continue;
    if (Math.abs(colOf(hi) - colOf(lo)) > RULES.LEAN[R]) continue;
    out.push({ type: "L", a: lo, b: hi, kind: colOf(hi) === colOf(lo) ? "LV" : colOf(hi) > colOf(lo) ? "LR" : "LF" });   // a ladder rises from lo to hi (LV upright, LR leaning right across the screen, LF left)
    const hc = colOf(hi);
    if (hc >= RULES.HEAD_COLS[0] && hc <= RULES.HEAD_COLS[1] && hi >= RULES.HEAD_FROM) out.push({ type: "S", a: hi, b: lo, kind: "S" });   // a serpent falls from hi to lo
  }
  for (const c of out) { c.p = xy(c.a); c.q = xy(c.b); c.mid = { x: (c.p.x + c.q.x) / 2, y: (c.p.y + c.q.y) / 2 }; c.rows = Math.abs(rowOf(c.a) - rowOf(c.b)); }
  return out;
}

const scaled = (k) => { const R = {}; for (const key of Object.keys(RULES)) R[key] = typeof RULES[key] === "number" && /^(GAP|END)_/.test(key) ? RULES[key] * k : RULES[key]; return R; };

function popcount(x) { x = x - ((x >>> 1) & 0x55555555); x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function build(k) {
  const R = scaled(k), C = candidates(), n = C.length, W = Math.ceil(n / 32);
  const adj = [];
  for (let i = 0; i < n; i++) adj.push(new Uint32Array(W));
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (!S.pairProblem(C[i], C[j], R)) { adj[i][j >>> 5] |= 1 << (j & 31); adj[j][i >>> 5] |= 1 << (i & 31); }
  const masks = { LR: new Uint32Array(W), LF: new Uint32Array(W), LV: new Uint32Array(W), S2: new Uint32Array(W), S3: new Uint32Array(W) };
  const headRow = []; for (let r = 0; r < 10; r++) headRow.push(new Uint32Array(W));
  const l3 = new Uint32Array(W);
  C.forEach((c, i) => {
    masks[c.type === "S" ? "S" + c.rows : c.kind][i >>> 5] |= 1 << (i & 31);
    if (c.type === "S") headRow[rowOf(c.a)][i >>> 5] |= 1 << (i & 31);
    else if (c.rows === 3) l3[i >>> 5] |= 1 << (i & 31);
  });
  return { C, n, W, adj, masks, headRow, l3 };
}
function countAnd(a, b, W) { let s = 0; for (let w = 0; w < W; w++) s += popcount(a[w] & b[w]); return s; }
function pickRandom(dom, W, rnd) {
  let total = 0;
  for (let w = 0; w < W; w++) total += popcount(dom[w]);
  if (!total) return -1;
  let r = Math.floor(rnd() * total);
  for (let w = 0; w < W; w++) {
    const pc = popcount(dom[w]);
    if (r >= pc) { r -= pc; continue; }
    for (let b = 0; b < 32; b++) if ((dom[w] >>> b) & 1 && r-- === 0) return w * 32 + b;
  }
  return -1;
}
/* One search: a depth-first walk over the compatible candidates (kind by kind, the kind with the fewest spare places first; each place tried best spread first, with noise, at most K of them), with a budget of
   nodes. Five to seven ladders lean (at least two each way), no more than two heads in a row of squares. Returns the pieces or null. */
function attempt(G, rnd, K, budget) {
  const { C, W, adj, masks, headRow, l3 } = G;
  K = K || 6; budget = budget || 400;
  const lean = [5, 6, 6, 7][Math.floor(rnd() * 4)];
  const right = 2 + Math.floor(rnd() * (lean - 3));   // 2 .. lean-2
  // three to five of the serpents run three rows and at most two ladders do: the games stay as long as today's (the longer a serpent's fall and the shorter a ladder's rise, the longer the game)
  const s3 = 3 + Math.floor(rnd() * 3), l3max = 2;
  const left = { LR: right, LF: lean - right, LV: RULES.LADDERS - lean, S2: RULES.SNAKES - s3, S3: s3 };
  const dom0 = new Uint32Array(W);
  for (let w = 0; w < W; w++) dom0[w] = masks.LR[w] | masks.LF[w] | masks.LV[w] | masks.S2[w] | masks.S3[w];
  const chosen = [], rows = new Array(10).fill(0);
  let nodes = 0, threeRowLadders = 0;
  const rec = (dom) => {
    let kind = null, slackBest = 1e9;
    for (const k of ["LR", "LF", "LV", "S2", "S3"]) {
      if (left[k] <= 0) continue;
      const slack = countAnd(dom, masks[k], W) - left[k];
      if (slack < 0) return false;
      if (slack < slackBest) { slackBest = slack; kind = k; }
    }
    if (kind === null) return true;
    if (++nodes > budget) return false;
    // this kind's places in the domain, scored by how far each is from the pieces already placed
    const idx = [];
    for (let w = 0; w < W; w++) { let x = dom[w] & masks[kind][w]; while (x) { const b = 31 - Math.clz32(x & -x); idx.push(w * 32 + b); x &= x - 1; } }
    const scored = idx.map((i) => {
      let sc = 9;
      for (const j of chosen) sc = Math.min(sc, Math.hypot(C[i].mid.x - C[j].mid.x, C[i].mid.y - C[j].mid.y));
      return { i, sc: sc + rnd() * 1.2 };
    }).sort((a, b) => b.sc - a.sc).slice(0, K);
    for (const { i } of scored) {
      const nd = new Uint32Array(W);
      for (let w = 0; w < W; w++) nd[w] = dom[w] & adj[i][w];
      const hr = C[i].type === "S" ? rowOf(C[i].a) : -1;
      if (hr >= 0) { rows[hr]++; if (rows[hr] >= RULES.HEADS_PER_ROW) for (let w = 0; w < W; w++) nd[w] &= ~headRow[hr][w]; }
      const three = C[i].type === "L" && C[i].rows === 3;
      if (three) { threeRowLadders++; if (threeRowLadders >= l3max) for (let w = 0; w < W; w++) nd[w] &= ~l3[w]; }
      chosen.push(i); left[kind]--;
      if (rec(nd)) return true;
      chosen.pop(); left[kind]++;
      if (hr >= 0) rows[hr]--;
      if (three) threeRowLadders--;
      if (nodes > budget) return false;
    }
    return false;
  };
  return rec(dom0) ? chosen.map((i) => C[i]) : null;
}
const toLayout = (pieces) => ({
  ladders: pieces.filter((p) => p.type === "L").map((p) => [p.a, p.b]).sort((x, y) => x[0] - y[0]),
  snakes: pieces.filter((p) => p.type === "S").map((p) => [p.a, p.b]).sort((x, y) => x[0] - y[0]),
});
const asBoard = (l) => { const L = {}, Sn = {}; for (const [f, t] of l.ladders) L[f] = t; for (const [h, t] of l.snakes) Sn[h] = t; return { ladders: L, snakes: Sn }; };

/* what a candidate must also be: not hugging the edge, ends in every band of rows, a game of today's length */
function measures(l) {
  const pcs = S.piecesOf(l), perRow = new Array(10).fill(0);
  let edgePieces = 0;
  for (const c of pcs) { perRow[rowOf(c.a)]++; perRow[rowOf(c.b)]++; const ca = colOf(c.a), cb = colOf(c.b); if ((ca === 0 || ca === 9) && (cb === 0 || cb === 9)) edgePieces++; }
  const bands = [0, 3, 6].map((r0) => perRow.slice(r0, r0 + (r0 === 6 ? 4 : 3)).reduce((x, y) => x + y, 0));
  const hl = S.holes(pcs);
  const l3 = l.ladders.filter(([a, c]) => Math.abs(rowOf(a) - rowOf(c)) === 3).length, s3 = l.snakes.filter(([a, c]) => Math.abs(rowOf(a) - rowOf(c)) === 3).length;
  const lean = pcs.reduce((s, c) => s + Math.abs(colOf(c.a) - colOf(c.b)) / Math.abs(rowOf(c.a) - rowOf(c.b)), 0) / pcs.length;
  const cols = {};
  for (const [h] of l.snakes) cols[colOf(h)] = (cols[colOf(h)] || 0) + 1;
  return { edgePieces, bands, holeMax: hl.max, holeMean: hl.mean, l3, s3, lean, headColMax: Math.max(...Object.values(cols)) };
}

if (require.main === module) {
  const seed = +arg("seed", 21), tries = +arg("tries", 400000), N = +arg("n", 18), k = +arg("k", 1.0), m = +arg("m", 4), BUDGET = +arg("budget", 20000), out = arg("out", null);
  const G = build(k), rnd = rng(seed);
  const seen = new Set(), pool = [];
  let made = 0;
  for (let i = 0; i < tries; i++) {
    const p = attempt(G, rnd, m, BUDGET);
    if (!p) continue;
    const l = toLayout(p), key = JSON.stringify(l);
    if (seen.has(key)) continue;
    seen.add(key); made++;
    if (S.problem(l)) continue;
    const ms = measures(l);
    if (ms.edgePieces > 3 || Math.min(...ms.bands) < 8) continue;
    const turns = B.meanTurns(asBoard(l), 3000);
    if (turns < LONE[0] || turns > LONE[1]) continue;
    // the layout is dealt in its left-right mirror too where the mirror keeps the rules and plays a good game (the mirror changes the squares' jumps: a three-row piece's rise changes by up to 18)
    const mir = Layouts.mirror(l);
    let mirrorOk = !S.problem(mir) && !Layouts.problem(mir), mirrorTurns = null;
    if (mirrorOk) { mirrorTurns = B.meanTurns(asBoard(mir), 3000); mirrorOk = mirrorTurns >= LONE[0] && mirrorTurns <= LONE[1]; }
    pool.push({ ...l, turns, mirrorTurns, mirrorOk, ...ms });
  }
  console.log(`${made} distinct boards, ${pool.length} keep the whole rule and a game of today's length`);
  const keys = (b) => b.ladders.map(([f, t]) => "L" + f + "-" + t).concat(b.snakes.map(([h, t]) => "S" + h + "-" + t));
  for (const b of pool) { b.keys = keys(b); b.score = -(b.holeMean * 2 + b.holeMax) - Math.abs(b.turns - 32) * 0.03 - b.lean * 0.5 + (b.mirrorOk ? 0.4 : 0); }
  const ok = pool.filter((b) => b.l3 <= 3 && b.s3 >= 2 && b.s3 <= 6 && b.headColMax <= 2 && b.holeMax <= 1.3 && b.turns >= 29.5 && b.turns <= 35.5).sort((a, b) => b.score - a.score);
  console.log(`${ok.length} of them have at most three three-row ladders, two to six three-row serpents, no column of three heads`);
  const top = ok.slice(0, 600), picked = top.length ? [top[0]] : [];
  while (picked.length < N && picked.length < top.length) {
    let best = null, bestS = -Infinity;
    for (const b of top) {
      if (picked.includes(b)) continue;
      let dmin = 99;
      for (const p of picked) dmin = Math.min(dmin, 16 - b.keys.filter((x) => p.keys.includes(x)).length);
      if (dmin >= 13 && dmin * 10 + b.score > bestS) { bestS = dmin * 10 + b.score; best = b; }
    }
    if (!best) break;
    picked.push(best);
  }
  picked.forEach((b, i) => console.log(`${String(i).padStart(2)}: ${b.turns.toFixed(1)} / ${b.mirrorOk ? b.mirrorTurns.toFixed(1) : "no"} (mirror) turns, holes ${b.holeMax.toFixed(2)}/${b.holeMean.toFixed(2)}, lean ${b.lean.toFixed(2)}, ladders ${JSON.stringify(b.ladders)}, serpents ${JSON.stringify(b.snakes)}`));
  if (out) fs.writeFileSync(out, JSON.stringify({ seed, tries, k, boards: picked.map((b) => ({ ladders: b.ladders, snakes: b.snakes, turns: b.turns, mirrorTurns: b.mirrorTurns, mirrorOk: b.mirrorOk })) }));
}
module.exports = { candidates, build, attempt, toLayout, measures, asBoard, rng };
