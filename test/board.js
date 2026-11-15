/*
 Snakebite boards — unit suite (no server needed).
 Run:  node test/board.js
 Since 2026-11-07 a game is dealt one of the SHORT layouts (layouts.json, made by tools/make-short-layouts.js and planned by the app's Tools/snakes_layouts.py: eight ladders and eight serpents, each
 across two or three rows, nothing touching anything, as the owner's approved pictures A and C draw them), or its left-right mirror where the layout says so. The traditional boards (Victorian, Vaikunthapali,
 Jnana Bagi: serpents of four to six rows and long diagonal ladders that crossed serpents, heads and numbers) are gone. Proves:
 - every layout, and its mirror where that is dealt, is a board a game can be played on: each end a square used once, ladders going up and serpents down, no serpent from 100,
   nothing chaining; the mirror keeps every end in its row and its place in the zigzag, and mirroring twice is the layout itself;
 - every layout, and every mirror it is dealt in, keeps short_rules.js: eight and eight, every piece across two or three rows and leaning at most a column, five to seven of the ladders leaning (at least two each
   way: the picture's ladders mostly lean), every line clear of every other (serpents 1.15 of a cell, a serpent and a ladder 0.95, ladders 0.95), no other line inside the 2.2 x 1.4 box round a head (so every head
   is clear of every ladder's rails whatever way its S swings), every ladder's end 0.70 clear, no more than two heads in a row of squares, no hole in the spread;
 - the boards are the authored ones, square for square (the app plans each by its squares), no two share more than six pieces, and none is a copy of a modern product's board (Milton Bradley's
   Chutes and Ladders);
 - a seed is dealt its board at once and the same seed the same board; 3,000 seeds reach every board, each layout about as often as the others;
 - the server chases ladders and serpents on every board as the rules say (from each square: where a roll that lands there ends up);
 - the game's length is a good one on every board and is today's: a lone player's mean turns (the server's own rules: a six rolls again, the third passes the turn, reach 100
   wins) and four bots' winner turns, within the band the traditional boards had (lone player 29 to 36 turns; four bots' winner median 14, 90th 23);
 - and what is left of the old generator's geometry still holds (the web's cells and bends, the app's sleek S: the golden fixtures the app reads), and names (GN-30).
*/
"use strict";
const B = require("../board.js");
const S = require("../server.js");
const Layouts = require("../layouts.js");
const Short = require("../short_rules.js");

let failures = 0;
function assert(cond, msg) { if (!cond) { failures++; console.error("FAIL: " + msg); } }
const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.max(0, Math.ceil(p * s.length) - 1))]; };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const rowOf = (n) => Math.floor((n - 1) / 10);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const pairs = (o) => Object.entries(o).map(([k, v]) => [+k, v]);

// ---- 1. the layouts and their mirrors
const L = Layouts.LAYOUTS, BOARDS = Layouts.BOARDS;
assert(L.length >= 8, `at least eight layouts (${L.length})`);
assert(BOARDS.length === L.length + L.filter((l) => l.mirror).length, `every layout is a board, and two where it says its mirror is dealt too (${BOARDS.length})`);
assert(new Set(L.map((l) => l.id)).size === L.length, "every layout has an id of its own");
assert(L.every((l) => l.name && l.sub && l.method), "every layout names itself, says what it is and how it was made");
for (const l of L) {
  assert(Layouts.problem(l) === null, `layout ${l.id} is playable: ${Layouts.problem(l)}`);
  const m = Layouts.mirror(l);
  assert(Layouts.problem(m) === null, `the mirror of ${l.id} is playable: ${Layouts.problem(m)}`);
  const mm = Layouts.mirror({ ...m, mirrored: false });
  const key = (p) => JSON.stringify(p.slice().sort((a, b) => a[0] - b[0]));
  assert(key(mm.ladders) === key(l.ladders) && key(mm.snakes) === key(l.snakes), `mirroring ${l.id} twice is ${l.id}`);
  // every end stays in its row, and a mirrored end is its row's other side
  const rows = (lay) => lay.ladders.concat(lay.snakes).flatMap((p) => [rowOf(p[0]), rowOf(p[1])]).sort((a, b) => a - b).join();
  assert(rows(l) === rows(m), `the mirror of ${l.id} has every end in the row it was in`);
  assert(l.ladders.length === m.ladders.length && l.snakes.length === m.snakes.length, `the mirror of ${l.id} has as many pieces`);
  for (const [f, t] of l.ladders) assert(m.ladders.some(([a, b]) => a === Layouts.flip(f) && b === Layouts.flip(t)) || m.ladders.some(([a, b]) => a === Layouts.flip(t) && b === Layouts.flip(f)), `ladder ${f}-${t} of ${l.id} is in its mirror`);
  // a short board, and so is its mirror (a left-right flip keeps every row, every lean and every distance)
  assert(Short.problem(l) === null, `layout ${l.id} is a short board: ${Short.problem(l)}`);
  assert(!l.mirror || Short.problem(m) === null, `the mirror of ${l.id} is a short board: ${Short.problem(m)}`);
}
assert(Layouts.flip(1) === 10 && Layouts.flip(10) === 1 && Layouts.flip(11) === 20 && Layouts.flip(100) === 91 && Layouts.flip(55) === 56, "flip is the square across its row (1 and 10, 11 and 20, 91 and 100)");
{
  /* short_rules.js refuses what it should: a layout with a ladder less, a piece edited into four rows or one row, and pieces that cross, share a square or lie over a head */
  const good = L[0];
  const edit = (f) => { const x = { ladders: good.ladders.map((p) => p.slice()), snakes: good.snakes.map((p) => p.slice()) }; f(x); return Short.problem(x); };
  assert(Short.problem({ ladders: good.ladders.map((p) => p.slice()), snakes: good.snakes.map((p) => p.slice()) }) === null, "the layout, copied, is a short board");
  assert(edit((x) => x.ladders.pop()), "seven ladders are no short board");
  assert(edit((x) => { x.ladders[0][1] = Math.min(99, x.ladders[0][0] + 40); }), "a ladder of four rows is no short board");
  assert(edit((x) => { x.snakes[x.snakes.length - 1][1] = x.snakes[x.snakes.length - 1][0] - 5; }), "a serpent of one row is no short board");
  assert(edit((x) => { x.ladders[0][0] = 1; }), "a ladder from square 1 is no short board");
  const pc = (type, a, b) => ({ type, a, b, p: Short.xy(a), q: Short.xy(b) });
  assert(Short.pairProblem(pc("L", 12, 35), pc("L", 15, 32)), "two ladders that cross are refused");
  assert(Short.pairProblem(pc("L", 12, 32), pc("S", 29, 9)), "a serpent whose head stands on a ladder's rails is refused");
  assert(Short.pairProblem(pc("L", 12, 32), pc("S", 52, 32)), "pieces that share a square are refused");
  assert(Short.pairProblem(pc("L", 12, 32), pc("S", 58, 33)) === null, "a ladder and a serpent well apart are accepted");
  assert(Short.pairProblem(pc("S", 58, 38), pc("L", 43, 62)), "a ladder through the box round a head is refused");
}

// the boards are the authored ones, square for square (the app plans each by its squares); no two boards share more than six of their sixteen pieces; none is a modern product's board
{
  const want = {
    s01: { ladders: [[2, 21], [3, 23], [9, 30], [35, 56], [64, 98], [69, 90], [74, 95], [79, 99]], snakes: [[26, 5], [33, 7], [44, 17], [52, 31], [62, 40], [67, 47], [85, 65], [93, 73]] },
    s02: { ladders: [[5, 26], [7, 27], [32, 51], [37, 57], [42, 61], [43, 63], [73, 94], [78, 97]], snakes: [[24, 4], [29, 9], [39, 2], [66, 36], [68, 34], [85, 64], [92, 71], [99, 80]] },
    s03: { ladders: [[6, 26], [8, 27], [11, 31], [40, 59], [45, 66], [61, 81], [70, 92], [75, 94]], snakes: [[22, 2], [37, 4], [52, 29], [54, 35], [64, 43], [88, 68], [96, 76], [98, 62]] },
    s04: { ladders: [[2, 21], [9, 28], [11, 31], [36, 55], [62, 83], [68, 92], [70, 90], [80, 99]], snakes: [[25, 6], [38, 3], [47, 27], [52, 32], [59, 40], [77, 44], [94, 74], [96, 66]] },
    s05: { ladders: [[2, 23], [9, 30], [31, 51], [34, 55], [62, 81], [73, 94], [77, 97], [78, 98]], snakes: [[26, 6], [28, 8], [45, 17], [59, 21], [64, 38], [68, 32], [86, 66], [92, 70]] },
    s06: { ladders: [[2, 21], [6, 26], [8, 27], [32, 51], [40, 60], [66, 87], [78, 98], [80, 99]], snakes: [[23, 4], [29, 9], [44, 16], [55, 35], [63, 39], [73, 48], [92, 70], [96, 65]] },
    s07: { ladders: [[5, 37], [9, 30], [33, 54], [58, 79], [61, 81], [68, 92], [70, 90], [76, 96]], snakes: [[23, 2], [28, 8], [42, 20], [46, 15], [52, 31], [65, 44], [94, 67], [98, 77]] },
    s08: { ladders: [[2, 21], [34, 53], [38, 64], [45, 66], [50, 70], [62, 81], [76, 95], [78, 99]], snakes: [[23, 3], [27, 7], [32, 9], [36, 5], [59, 40], [87, 67], [92, 69], [97, 77]] },
    s09: { ladders: [[2, 23], [9, 30], [20, 40], [42, 61], [46, 66], [47, 67], [56, 84], [70, 92]], snakes: [[33, 8], [35, 6], [44, 17], [52, 31], [78, 58], [88, 68], [95, 75], [99, 80]] },
    s10: { ladders: [[2, 21], [4, 25], [9, 30], [36, 55], [40, 60], [71, 92], [73, 93], [78, 97]], snakes: [[23, 3], [28, 7], [47, 15], [63, 39], [69, 32], [76, 44], [95, 67], [99, 80]] },
    s11: { ladders: [[3, 24], [9, 30], [31, 51], [35, 54], [39, 60], [61, 81], [70, 92], [78, 99]], snakes: [[22, 2], [26, 5], [33, 7], [63, 38], [65, 36], [88, 52], [95, 67], [97, 77]] },
    s12: { ladders: [[2, 21], [9, 28], [18, 39], [45, 66], [69, 90], [74, 95], [76, 96], [78, 97]], snakes: [[35, 6], [37, 4], [52, 30], [54, 33], [62, 41], [64, 43], [93, 68], [99, 80]] },
  };
  assert(same(L.map((l) => l.id), Object.keys(want)), `the pool is the layouts ${Object.keys(want).join(", ")} (${L.map((l) => l.id).join(", ")})`);
  for (const [id, w] of Object.entries(want)) {
    const l = L.find((x) => x.id === id);
    assert(l && same(l.ladders, w.ladders) && same(l.snakes, w.snakes), `the ${id} layout is as it was authored`);
  }
  assert(same(BOARDS[0].ladders, S.LADDERS) && same(BOARDS[0].snakes, S.SNAKES), "the lobby's picture is the first layout");
  const pieceKeys = (b) => new Set(pairs(b.ladders).map((p) => "L" + p.join("-")).concat(pairs(b.snakes).map((p) => "S" + p.join("-"))));
  for (let i = 0; i < BOARDS.length; i++) for (let j = i + 1; j < BOARDS.length; j++) {
    const a = pieceKeys(BOARDS[i]), c = pieceKeys(BOARDS[j]);
    const shared = [...a].filter((k) => c.has(k)).length;
    assert(shared <= 6, `${BOARDS[i].id}${BOARDS[i].mirrored ? "~" : ""} and ${BOARDS[j].id}${BOARDS[j].mirrored ? "~" : ""} are different boards (${shared} of 16 pieces in common, at most 6)`);
  }
  // Milton Bradley's Chutes and Ladders board (1943 on) is a commercial product's: no board of the pool shares more than two of its pieces
  const mb = JSON.stringify([[1, 38], [4, 14], [9, 31], [21, 42], [28, 84], [36, 44], [51, 67], [71, 91], [80, 100], [16, 6], [47, 26], [49, 11], [56, 53], [62, 19], [64, 60], [87, 24], [93, 73], [95, 75], [98, 78]]);
  const mbPieces = new Set(JSON.parse(mb).map((p) => p.join("-")));
  for (const b of BOARDS) {
    const shared = pairs(b.ladders).concat(pairs(b.snakes)).filter((p) => mbPieces.has(p.join("-"))).length;
    assert(shared <= 2, `${b.id}${b.mirrored ? " (mirrored)" : ""} is no copy of a modern board (${shared} pieces in common with Chutes and Ladders)`);
  }
}

// what the owner's pictures draw: eight ladders and eight serpents, every one across two or three rows, spread over the whole board
for (const b of BOARDS) {
  const tag = `${b.id}${b.mirrored ? " (mirrored)" : ""}`;
  const sr = pairs(b.snakes).map(([h, t]) => rowOf(h) - rowOf(t)), lr = pairs(b.ladders).map(([f, t]) => rowOf(t) - rowOf(f));
  assert(sr.length === 8 && lr.length === 8, `${tag}: eight ladders and eight serpents (${lr.length} and ${sr.length})`);
  assert(sr.concat(lr).every((r) => r === 2 || r === 3), `${tag}: every piece spans two or three rows (serpents ${sr.join("/")}, ladders ${lr.join("/")})`);
  assert(lr.filter((r) => r === 2).length >= 5, `${tag}: most ladders are two rows (${lr.join("/")})`);
  const leans = pairs(b.ladders).map(([f, t]) => Short.colOf(t) - Short.colOf(f));
  assert(leans.filter((x) => x !== 0).length >= 5 && leans.filter((x) => x !== 0).length <= 7, `${tag}: five to seven ladders lean a column (${leans.join("/")})`);
  assert(leans.filter((x) => x > 0).length >= 2 && leans.filter((x) => x < 0).length >= 2, `${tag}: at least two ladders lean each way (${leans.join("/")})`);
  const ends = pairs(b.ladders).concat(pairs(b.snakes)).flat();
  const perRow = new Array(10).fill(0);
  for (const n of ends) perRow[rowOf(n)]++;
  for (let band = 0; band < 3; band++) assert(perRow.slice(band * 3, band * 3 + 3).reduce((x, y) => x + y, 0) > 0, `${tag}: every band of three rows has an end in it`);
  assert(perRow.slice(7).reduce((x, y) => x + y, 0) / ends.length <= 0.40, `${tag}: no more than 40% of the ends are in the top three rows (${perRow.slice(7).join("/")} of ${ends.length})`);
  assert(Math.max(...perRow) <= 7, `${tag}: no row of squares holds more than seven ends (${perRow.join("/")})`);
}

// ---- 2. dealing: the same seed the same board, every board reached about equally, at once
{
  const seeds = Array.from({ length: 3000 }, (_, i) => "seed-" + i);
  const count = new Map(), ms = [];
  for (const seed of seeds) {
    const t0 = process.hrtime.bigint();
    const b = B.genBoard(seed);
    ms.push(Number(process.hrtime.bigint() - t0) / 1e6);
    const k = JSON.stringify(b);
    count.set(k, (count.get(k) || 0) + 1);
    if (seed.endsWith("-7")) assert(same(B.genBoard(seed), b), "the same seed gave a different board (" + seed + ")");
  }
  const all = new Set(BOARDS.map((b) => JSON.stringify({ ladders: b.ladders, snakes: b.snakes })));
  assert([...count.keys()].every((k) => all.has(k)), "every dealt board is one of the layouts or a mirror");
  assert(count.size === BOARDS.length, `3,000 seeds reach every board (${count.size} of ${BOARDS.length})`);
  // every LAYOUT is as likely as the others, and a layout dealt in its mirror too is dealt in it one game in two
  const perLayout = new Map(), perBoard = new Map();
  for (const seed of seeds) { const p = Layouts.pick(seed); perLayout.set(p.id, (perLayout.get(p.id) || 0) + 1); perBoard.set(p.id + (p.mirrored ? "~" : ""), (perBoard.get(p.id + (p.mirrored ? "~" : "")) || 0) + 1); }
  const want = seeds.length / L.length;
  assert(L.every((l) => (perLayout.get(l.id) || 0) >= 0.85 * want && perLayout.get(l.id) <= 1.15 * want), `each layout is dealt about as often as the others (${[...perLayout.entries()].map(([k, v]) => k + " " + v).join(", ")} of ${seeds.length})`);
  for (const l of L.filter((x) => x.mirror)) { const a = perBoard.get(l.id) || 0, b = perBoard.get(l.id + "~") || 0; assert(a >= 0.4 * (a + b) && b >= 0.4 * (a + b), `${l.id} is dealt plain and mirrored about equally (${a} and ${b})`); }
  assert(same(S.genBoard("seed-3"), B.genBoard("seed-3")), "the server deals with board.js");
  for (const seed of seeds.slice(0, 60)) {
    const who = S.layoutOf(seed), b = B.genBoard(seed), known = BOARDS.find((x) => x.id === who.id && x.mirrored === who.mirrored);
    assert(known && same({ ladders: known.ladders, snakes: known.snakes }, b), `layoutOf says which layout a seed deals (${seed}: ${who.id}${who.mirrored ? " mirrored" : ""})`);
  }
  assert(!same(B.genBoard("seed-1"), B.genBoard("seed-2")) || !same(B.genBoard("seed-2"), B.genBoard("seed-3")), "different seeds, different boards");
  const p99 = q(ms, 0.99);
  assert(p99 < 1 && Math.max(...ms) < 20, `a seed is dealt its board at once: p99 ${p99.toFixed(3)} ms, max ${Math.max(...ms).toFixed(2)} ms`);
  console.log(`PASS dealing — ${count.size} boards over ${seeds.length} seeds (${[...count.values()].join("/")}), deterministic, p99 ${p99.toFixed(3)} ms`);
}

// ---- 3. the server's rules on every board: from every square, where a landing ends up
{
  const chase = (board, n) => { let hops = 0, kind = null, from = null; while (hops++ < 5) { if (board.ladders[n] !== undefined) { kind = "ladder"; from = n; n = board.ladders[n]; } else if (board.snakes[n] !== undefined) { kind = "snake"; from = n; n = board.snakes[n]; } else break; } return { end: n, kind, from }; };
  let checked = 0;
  for (const b of BOARDS) {
    const room = { ladders: b.ladders, snakes: b.snakes, pos: [0, 0, 0, 0] };
    for (let sq = 1; sq <= 100; sq++) {
      const got = S.chase(room, sq), want = chase(b, sq);
      assert(got.end === want.end && (got.kind || null) === want.kind && (got.from || null) === want.from, `${b.id}${b.mirrored ? "~" : ""}: from ${sq} the server chases to ${got.end}, the rules say ${want.end}`);
      const onFoot = b.ladders[sq] !== undefined, onHead = b.snakes[sq] !== undefined;
      assert((onFoot && want.end === b.ladders[sq]) || (onHead && want.end === b.snakes[sq]) || (!onFoot && !onHead && want.end === sq), `${b.id}${b.mirrored ? "~" : ""}: square ${sq} ends where its piece says`);
      checked++;
    }
  }
  console.log(`PASS the rules — ${checked} squares over ${BOARDS.length} boards chase as the board says`);
}

// ---- 4. the game's length: a lone player's mean turns on each board, and four bots' winners, on the server's own rules (reach 100 wins)
{
  let a = 0x9e3779b9;
  const rnd = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const winner = [], table = [], lone = [];
  for (const b of BOARDS) {
    const m = B.meanTurns({ ladders: b.ladders, snakes: b.snakes }, 4000);
    lone.push(m);
    assert(m >= 28 && m <= 37, `${b.id}${b.mirrored ? " (mirrored)" : ""}: a lone player needs ${m.toFixed(1)} turns (28 to 37: today's boards needed 29 to 36)`);
    const lad = new Int16Array(101), snk = new Int16Array(101);
    for (const [f, t] of Object.entries(b.ladders)) lad[f] = t;
    for (const [f, t] of Object.entries(b.snakes)) snk[f] = t;
    for (let g = 0; g < 4000; g++) {
      const pos = [0, 0, 0, 0], own = [0, 0, 0, 0];
      let seat = Math.floor(rnd() * 4), turns = 0;
      for (let guard = 0; guard < 100000; guard++) {
        turns++; own[seat]++;
        let won = false;
        for (let sixes = 0; ;) {
          const roll = 1 + Math.floor(rnd() * 6);
          let n = Math.min(100, pos[seat] + roll);
          for (let hops = 0; hops < 5; hops++) { if (lad[n]) n = lad[n]; else if (snk[n]) n = snk[n]; else break; }
          pos[seat] = n;
          if (n === 100) { won = true; break; }
          if (roll === 6 && ++sixes < 3) continue;
          break;
        }
        if (won) { winner.push(own[seat]); table.push(turns); break; }
        seat = (seat + 1) % 4;
      }
    }
  }
  const wm = q(winner, 0.5), w9 = q(winner, 0.9), tm = q(table, 0.5), t9 = q(table, 0.9);
  assert(wm >= 16 * 0.75 && wm <= 16 * 1.25 && w9 >= 25 * 0.75 && w9 <= 25 * 1.25, `the winner's own turns: median ${wm} (16 +-25%), p90 ${w9} (25 +-25%)`);
  assert(tm >= 64 * 0.75 && tm <= 64 * 1.25 && t9 >= 100 * 0.75 && t9 <= 100 * 1.25, `every seat's turns together: median ${tm} (64 +-25%), p90 ${t9} (100 +-25%)`);
  console.log(`PASS game length — ${winner.length} games of four bots on the ${BOARDS.length} boards: winner's turns median ${wm} (was 16), p90 ${w9} (was 25); table turns median ${tm} (was 64), p90 ${t9} (was 100); a lone player ${lone.map((x) => x.toFixed(0)).join("/")} turns`);
}

// ---- 4. the geometry: the web's cells and bends, the iPhone app's sleek S, and the rule sees what it should
{
  const G = B._geo, R = B.RULE;
  const c1 = G.cellXY(1), c10 = G.cellXY(10), c11 = G.cellXY(11), c100 = G.cellXY(100);
  assert(c1.x === 0.5 && c1.y === 9.5 && c10.x === 9.5 && c11.x === 9.5 && c11.y === 8.5 && c100.x === 0.5 && c100.y === 0.5, "cellXY is the web's zigzag, y down");
  const ctl = G.snakeCtrl({ x: 0, y: 0 }, { x: 0, y: 10 }, 1);   // 10 cells long: the swing caps at 120/72
  assert(Math.abs(ctl.x + 120 / 72) < 1e-9 && ctl.y === 5, "snakeCtrl swings 0.32 of the length, capped at 120 web units");

  /* the app's sleek S (SnakesBoardLayout.cpp SnakeCurve, bSleek): from the head to the tail along the straight line, a sine of 0.5 cells (0.2 of the run on a short one) in 2 to 4 half-waves (one every 1.3 cells of the run),
     odd and even ranks mirror images, nothing at the ends. The app's own test (GameNest.Snakes.SleekIsTheServers) holds the C++ to points taken from here. */
  {
    const p = G.cellXY(99), q = G.cellXY(60);   // a run of 3.9 cells: 3 half-waves (the rounded run / 1.3, kept between 2 and 4)
    const even = G.sleekShape(99, 60, false, 96), odd = G.sleekShape(99, 60, true, 96);
    assert(Math.hypot(even.pts[0].x - p.x, even.pts[0].y - p.y) < 1e-9 && Math.hypot(even.pts[96].x - q.x, even.pts[96].y - q.y) < 1e-9, "a sleek serpent runs from its head to its tail");
    let worst = 0;
    for (let k = 0; k <= 96; k++) {
      const m = { x: (even.pts[k].x + odd.pts[k].x) / 2, y: (even.pts[k].y + odd.pts[k].y) / 2 }, t = k / 96;
      worst = Math.max(worst, Math.hypot(m.x - (p.x + (q.x - p.x) * t), m.y - (p.y + (q.y - p.y) * t)));
    }
    assert(worst < 1e-9, "odd and even ranks are mirror images about the straight line from head to tail");
    let amp = 0;
    for (const s of even.pts) { const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy); amp = Math.max(amp, Math.abs(((s.x - p.x) * -dy + (s.y - p.y) * dx) / len)); }
    assert(Math.abs(amp - 0.50) < 0.01, `a sleek serpent swings 0.50 cells off its line (${amp.toFixed(3)})`);
    const short = G.sleekShape(46, 15, false, 96);   // 3 rows down: a run under 1.95 x 1.3 = 2.6 .. 3.25 cells has the one whole S (2 half-waves): it crosses its line once, in the middle
    let crossings = 0;
    const a0 = G.cellXY(46), b0 = G.cellXY(15), dx0 = b0.x - a0.x, dy0 = b0.y - a0.y;
    const side = (s) => (s.x - a0.x) * -dy0 + (s.y - a0.y) * dx0;
    for (let k = 2; k <= 94; k++) if (Math.sign(side(short.pts[k])) !== Math.sign(side(short.pts[k - 1])) && Math.abs(side(short.pts[k])) > 1e-6) crossings++;
    assert(crossings === 1, `a short sleek serpent is one whole S (${crossings} crossing of its line)`);
  }

  /* the rule on single pieces: a ladder 12 -> 35 on the board, then what is let in beside it */
  const b0 = G.emptyBoard();
  G.clearAdd(b0, true, 12, 35, R).commit();
  assert(!G.clearAdd(b0, true, 15, 32, R), "a ladder crossing a ladder is refused");
  assert(!G.clearAdd(b0, true, 13, 34, R), "a ladder running beside a ladder within its clearance is refused");
  assert(!!G.clearAdd(b0, true, 5, 19, R), "a ladder clear of the others is accepted");
  assert(!G.clearAdd(b0, true, 35 + 0, 55, R), "a ladder starting on another's top square is refused");
  /* serpents against that ladder: the rule's yes or no is the exact distances' (every bend of both families against the ladder's centre line, and the ends) */
  const L = G.makePiece(true, 12, 35, R);
  let asked = 0, refused = 0, mismatches = 0;
  for (let f = 20; f <= 99; f++) for (let t = 2; t <= f - 8; t++) {
    if (Math.floor((f - 1) / 10) === Math.floor((t - 1) / 10) || [f, t].some((n) => n === 12 || n === 35)) continue;
    const S = G.makePiece(false, f, t, R);
    if (!S) continue;
    asked++;
    let want = true;
    for (const v of S.v) if (G.polyDist(v, L.v[0]) < R.GAP_SL) want = false;
    for (const e of S.ends) if (G.polyDist({ pts: [e.p, e.p], box: { x0: e.p.x, y0: e.p.y, x1: e.p.x, y1: e.p.y } }, L.v[0]) < e.r) want = false;
    for (const e of L.ends) for (const v of S.v) { let d = 9; for (let j = 1; j < v.pts.length; j++) d = Math.min(d, ptd(e.p, v.pts[j - 1], v.pts[j])); if (d < e.r) want = false; }
    const got = !!G.clearAdd(b0, false, f, t, R);
    if (!got) refused++;
    if (got !== want) mismatches++;
  }
  assert(asked > 800 && refused > 100 && refused < asked - 100, `the rule refuses some serpents and lets others by (${refused} of ${asked} refused)`);
  assert(mismatches === 0, `the rule's answer is the exact distances' for every serpent against a ladder (${mismatches} of ${asked} differ)`);
  function ptd(p, a, c) { const vx = c.x - a.x, vy = c.y - a.y, wx = p.x - a.x, wy = p.y - a.y, l = vx * vx + vy * vy; let t = l ? (wx * vx + wy * vy) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(wx - t * vx, wy - t * vy); }
  /* a serpent whose bend leaves the board is no piece at all */
  assert(G.makePiece(false, 91, 12, R) === null || G.makePiece(false, 91, 12, R).v.every((s) => s.box.x0 >= R.EDGE), "a serpent along the board's edge stays inside it or is refused");
  /* the finished-board check names a crossing: a ladder laid across a serpent */
  const bad = { ladders: { 2: 25, 31: 53, 36: 57, 41: 60, 50: 70, 64: 83, 76: 98, 83: 98 }, snakes: { 34: 7, 42: 19, 48: 10, 58: 24, 65: 35, 82: 59, 87: 54, 91: 68 } };
  assert(!B.checkCalm(bad).ok, "a board with a ladder over a serpent's head is not clear");
}
console.log("PASS geometry — the web's cells and bends, the app's sleek S; crossing, nearness and ends are refused exactly");

// ---- 5. names (GN-30): 18 UTF-16 units, cut between whole characters
{
  const fam = "\u{1F468}‍\u{1F469}‍\u{1F467}‍\u{1F466}";   // 11 units, one character
  assert(S.capName("ABCDEFGHIJKLMNOPQRSTUVWXYZ") === "ABCDEFGHIJKLMNOPQR", "plain names cut at 18");
  assert(S.capName("Seventeen chars!!" + fam) === "Seventeen chars!!", "an emoji that would cross 18 units is dropped whole");
  assert(S.capName("Pip " + fam) === "Pip " + fam, "a whole family emoji inside 18 units is kept");
  assert(S.capName("\u{1F1EE}\u{1F1F3}".repeat(5)) === "\u{1F1EE}\u{1F1F3}".repeat(4), "flags are never split (16 units kept, not 18)");
  assert(S.capName("  <b>Ann</b>  ") === "bAnn/b", "angle brackets are stripped and spaces trimmed as before");
  assert(S.capName("x".repeat(100000)).length === 18, "a 100 KB name is cut cheaply");
  assert(S.capAvatar(fam) === fam && S.capAvatar("\u{1F98A}\u{1F43C}") === "\u{1F98A}", "an avatar is one whole sticker");
}
console.log("PASS names — 18 units at a grapheme boundary; avatars one whole sticker");

if (failures) { console.error(`${failures} FAILED`); process.exit(1); }
console.log("ALL BOARD TESTS PASS");
process.exit(0);
