/* Snakebite's short boards: what a layout must be (snakes-short, 2026-11-07).

   The owner's approved pictures (Work/ref/snakes_looks/A_palace.png, C_pharaoh.png) draw eight ladders and eight serpents, every one SHORT (two or three rows), spread over the whole board, and
   nothing crosses anything. The three traditional boards the game was dealt before (Victorian, Vaikunthapali, Jnana Bagi) had serpents of four to six rows and long diagonal ladders that crossed
   serpents, heads and numbers; they are gone, and every layout of layouts.json is held to these rules (test/board.js; tools/make-short-layouts.js makes layouts that keep them).

   A piece is a straight line between two square centres (cells; x right, y UP, square 1 at (0.5, 0.5), the app's frame; the serpents' S-curves are the app's, planned for each board by
   Tools/snakes_layouts.py, which holds the CURVES to their own clearances; these straight-line ones leave a curve room to bend). The rules:

     * eight ladders and eight serpents, each end a square from 2 to 99 and not a corner (1, 10, 91 and 100 stay plain: the left-right mirror of a board is then a board of the same rules), none used twice;
     * every piece spans two or three rows and leans at most one column ("upright or leaning slightly": the longest line is 3.16 of a cell);
     * a serpent's head is on a square from 20 up, in a column from the second to the ninth (the painted head is a card nearly a square across: it needs the room);
     * no piece comes within GAP of another's line (serpents 1.15 of a cell, serpent and ladder 0.95, ladders 0.95: no fence of parallel leaning ladders) and every end keeps its RADIUS from every other line (a head 1.0: the painted card
       reaches 0.58 of a cell either side of its joint; a tail 0.65; a ladder's foot and top 0.70), so nothing touches and every head is clear of every ladder's rails;
     * the picture's ladders mostly lean (the lead, 2026-11-07, against picture A): five to seven of the eight lean one column, at least two each way across the board;
     * no other piece's line enters the box round a head (1.1 of a cell either side, 1.05 below its middle, 0.33 above: the painted card's silhouette and a ladder's or a body's half width, and the
       sideways way the serpent's S carries its neck), so a head is clear of every ladder's rails and every other body whatever way its S swings;
     * no two heads closer than two cells, no more than two heads in a row of squares, and no hole: every square's middle is within HOLE_MAX of some piece's line (the pieces are spread over the board as the pictures' are). */
"use strict";

const rowOf = (n) => Math.floor((n - 1) / 10);
const colOf = (n) => { const r = rowOf(n), c = (n - 1) % 10; return r % 2 ? 9 - c : c; };
const xy = (n) => ({ x: colOf(n) + 0.5, y: rowOf(n) + 0.5 });

const RULES = Object.freeze({
  LADDERS: 8, SNAKES: 8,
  ROWS: [2, 3],
  LEAN: Object.freeze({ 2: 1, 3: 1 }),      // the columns a piece may lean over two rows, over three (the longest line is 3.2 of a cell: no long diagonals)
  HEAD_COLS: [1, 8], HEAD_FROM: 20,
  GAP_SS: 1.15, GAP_SL: 0.95, GAP_LL: 0.95,
  END_HEAD: 1.00, END_TAIL: 0.65, END_LADDER: 0.70,
  HEADS_PER_ROW: 2, HEAD_APART: 2.0,
  LEAN_LADDERS: Object.freeze([5, 7]), LEAN_EACH_WAY: 2,
  HEAD_BOX: Object.freeze({ half: 1.1, below: 1.05, above: 0.33 }),
  CORNERS: Object.freeze([1, 10, 91, 100]),
  HOLE_MAX: 1.3,
});

function ptSeg(p, a, b) {
  const vx = b.x - a.x, vy = b.y - a.y, wx = p.x - a.x, wy = p.y - a.y, l = vx * vx + vy * vy;
  let t = l ? (wx * vx + wy * vy) / l : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(wx - t * vx, wy - t * vy);
}
const cr = (ax, ay, bx, by) => ax * by - ay * bx;
function segCross(a, b, c, d) {
  const d1 = cr(b.x - a.x, b.y - a.y, c.x - a.x, c.y - a.y), d2 = cr(b.x - a.x, b.y - a.y, d.x - a.x, d.y - a.y);
  const d3 = cr(d.x - c.x, d.y - c.y, a.x - c.x, a.y - c.y), d4 = cr(d.x - c.x, d.y - c.y, b.x - c.x, b.y - c.y);
  return d1 * d2 < 0 && d3 * d4 < 0;
}
/* does the segment pq enter the box [x0, x1] x [y0, y1]? (Liang and Barsky) */
function segHitsBox(p, q, x0, y0, x1, y1) {
  let t0 = 0, t1 = 1;
  const dx = q.x - p.x, dy = q.y - p.y;
  const clip = (pp, qq) => {
    if (pp === 0) return qq >= 0;
    const r = qq / pp;
    if (pp < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
    return true;
  };
  return clip(-dx, p.x - x0) && clip(dx, x1 - p.x) && clip(-dy, p.y - y0) && clip(dy, y1 - p.y);
}
function segDist(a, b, c, d) {
  if (segCross(a, b, c, d)) return 0;
  return Math.min(ptSeg(a, c, d), ptSeg(b, c, d), ptSeg(c, a, b), ptSeg(d, a, b));
}

/* the pieces of a layout as lines: { type: "L" | "S", a, b (the squares: foot and top, head and tail), p, q (their centres) } */
function piecesOf(layout) {
  return layout.ladders.map(([a, b]) => ({ type: "L", a, b })).concat(layout.snakes.map(([a, b]) => ({ type: "S", a, b }))).map((c) => ({ ...c, p: xy(c.a), q: xy(c.b) }));
}

/* Are two pieces clear of each other? null, or the reason. R is the rule (RULES unless the generator scales it). */
function pairProblem(c1, c2, R) {
  R = R || RULES;
  if (c1.a === c2.a || c1.a === c2.b || c1.b === c2.a || c1.b === c2.b) return `${c1.a}-${c1.b} and ${c2.a}-${c2.b} share a square`;
  const gap = c1.type === "L" && c2.type === "L" ? R.GAP_LL : c1.type === "S" && c2.type === "S" ? R.GAP_SS : R.GAP_SL;
  const d = segDist(c1.p, c1.q, c2.p, c2.q);
  if (d < gap) return `${c1.a}-${c1.b} and ${c2.a}-${c2.b} come within ${d.toFixed(2)} of each other (least ${gap})`;
  // no line in the box round a head
  const B = R.HEAD_BOX;
  for (const [c, o] of [[c1, c2], [c2, c1]]) {
    if (c.type === "S" && segHitsBox(o.p, o.q, c.p.x - B.half, c.p.y - B.below, c.p.x + B.half, c.p.y + B.above)) return `${o.a}-${o.b} runs through the box round the head ${c.a} of ${c.a}-${c.b}`;
  }
  const rad = (c, atA) => (c.type === "L" ? R.END_LADDER : atA ? R.END_HEAD : R.END_TAIL);
  for (const [c, o] of [[c1, c2], [c2, c1]]) {
    for (const atA of [true, false]) {
      const e = atA ? c.p : c.q, de = ptSeg(e, o.p, o.q);
      if (de < rad(c, atA)) return `${o.a}-${o.b} passes ${de.toFixed(2)} from the ${c.type === "L" ? (atA ? "foot" : "top") : atA ? "head" : "tail"} ${atA ? c.a : c.b} of ${c.a}-${c.b} (least ${rad(c, atA)})`;
    }
  }
  return null;
}

/* How far every square's middle is from the nearest piece's line: the largest, and the mean. */
function holes(pieces) {
  let max = 0, sum = 0;
  for (let n = 1; n <= 100; n++) {
    const p = xy(n);
    let d = 9;
    for (const c of pieces) d = Math.min(d, ptSeg(p, c.p, c.q));
    if (d > max) max = d;
    sum += d;
  }
  return { max, mean: sum / 100 };
}

/* Why a layout is no short board, or null. A layout is { ladders: [[foot, top]], snakes: [[head, tail]] } (layouts.js's shape). */
function problem(layout, R) {
  R = R || RULES;
  if (layout.ladders.length !== R.LADDERS || layout.snakes.length !== R.SNAKES) return `${layout.ladders.length} ladders and ${layout.snakes.length} serpents (want ${R.LADDERS} and ${R.SNAKES})`;
  const pcs = piecesOf(layout);
  for (const c of pcs) {
    for (const n of [c.a, c.b]) if (!Number.isInteger(n) || n < 2 || n > 99 || R.CORNERS.includes(n)) return `${n} is not a square a piece may end on (2 to 99, not a corner)`;
    const rows = Math.abs(rowOf(c.a) - rowOf(c.b)), lean = Math.abs(colOf(c.a) - colOf(c.b));
    if (rows < R.ROWS[0] || rows > R.ROWS[1]) return `${c.type === "L" ? "ladder" : "serpent"} ${c.a}-${c.b} spans ${rows} rows (want ${R.ROWS.join(" or ")})`;
    if (lean > R.LEAN[rows]) return `${c.type === "L" ? "ladder" : "serpent"} ${c.a}-${c.b} leans ${lean} columns over ${rows} rows (at most ${R.LEAN[rows]})`;
    if (c.type === "S") {
      if (c.a < R.HEAD_FROM) return `serpent ${c.a}-${c.b}: a head on ${c.a} is too low (from ${R.HEAD_FROM})`;
      const hc = colOf(c.a);
      if (hc < R.HEAD_COLS[0] || hc > R.HEAD_COLS[1]) return `serpent ${c.a}-${c.b}: the head is in an edge column (${hc})`;
    }
  }
  for (let i = 0; i < pcs.length; i++) for (let j = i + 1; j < pcs.length; j++) {
    const why = pairProblem(pcs[i], pcs[j], R);
    if (why) return why;
  }
  const leans = layout.ladders.map(([f, t]) => colOf(t) - colOf(f));
  const leaning = leans.filter((x) => x !== 0).length, right = leans.filter((x) => x > 0).length, left = leans.filter((x) => x < 0).length;
  if (leaning < R.LEAN_LADDERS[0] || leaning > R.LEAN_LADDERS[1]) return `${leaning} of the ladders lean (${R.LEAN_LADDERS.join(" to ")} do)`;
  if (right < R.LEAN_EACH_WAY || left < R.LEAN_EACH_WAY) return `the ladders lean ${right} one way and ${left} the other (at least ${R.LEAN_EACH_WAY} each way)`;
  for (let i = 0; i < layout.snakes.length; i++) for (let j = i + 1; j < layout.snakes.length; j++) {
    const a = xy(layout.snakes[i][0]), b = xy(layout.snakes[j][0]), d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < R.HEAD_APART) return `heads ${layout.snakes[i][0]} and ${layout.snakes[j][0]} are ${d.toFixed(2)} apart (at least ${R.HEAD_APART})`;
  }
  const headRows = new Array(10).fill(0);
  for (const [h] of layout.snakes) headRows[rowOf(h)]++;
  if (Math.max(...headRows) > R.HEADS_PER_ROW) return `${Math.max(...headRows)} heads in one row of squares (at most ${R.HEADS_PER_ROW}: ${headRows.join("/")})`;
  const hl = holes(pcs);
  if (hl.max > R.HOLE_MAX) return `a hole: a square's middle is ${hl.max.toFixed(2)} from every piece (at most ${R.HOLE_MAX})`;
  return null;
}

module.exports = { RULES, rowOf, colOf, xy, ptSeg, segDist, segCross, segHitsBox, piecesOf, pairProblem, holes, problem };
