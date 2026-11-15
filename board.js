/* Snakebite boards: the layouts a game is dealt, and the geometry the generator that used to deal them was judged by.

   genBoard(seed) deals a game one of the layouts (layouts.js, layouts.json: since 2026-11-07 the SHORT boards of the owner's approved pictures, eight ladders and eight serpents of two or three rows each and nothing
   touching anything, made by tools/make-short-layouts.js; from 2026-11-04 to 2026-11-07 the traditional boards, which the owner had asked for: "refer to any available ones online like vaikuntapali") or its left-right mirror, where a layout says its mirror is dealt too. The same seed always
   gives the same board. That replaces the generator and its pool of boards (boards-pool.json, tools/make-pool.js), which dealt eight short serpents and eight leaning
   ladders packed into the top rows; the generator's code below (genBoardLive, the clear rule, the geometry) stays only because tools and the app's golden fixtures
   read it (the sleek S, `_geo.sleekShape`, is what the app draws for a board it does not know), and because genBoard(seed, rule) with a rule still runs it.

   The generator, for the record (round 2 of the Snakebite redesign, 2026-11-01: "snakes and ladders never cross", all four outside reviewers): it kept T12's board
   contract (the same ranges and basic rules; the same seed always gave the same board) and one rule above the rest: NOTHING TOUCHES. Every piece is held against every piece
   already on the board:

   1. no two pieces cross (two snakes, two ladders, a snake and a ladder), and the centre lines of any two stay at least
      GAP_SS / GAP_SL / GAP_LL cells apart (the bodies are about half a cell broad: they never overlap);
   2. no piece lies over another's end squares: a serpent's head and tail, a ladder's foot and top stay END_HEAD / END_TAIL /
      END_LADDER cells from every other piece's centre line, so each end can be read and each number printed on it seen;
   3. a serpent stays on the board (EDGE cells in from its edge).

   All of it was judged on the bends the clients ACTUALLY draw: the web client's quadratic bend (index.html snakeCtrl) and the iPhone app's sleek S
   (SnakesBoardLayout.cpp SnakeCurve, bSleek), each bent to the side its rank among the heads gives it. The search went on until a board passed, and a pool of such boards
   was made ahead of time (tools/make-pool.js) so a game was dealt one at once.

   All geometry is in cells, in the web client's frame (index.html cellXY): square 1 at the bottom left, y down, a cell 1 wide. */
"use strict";
const crypto = require("crypto");
const Layouts = require("./layouts");

const CLASSIC = {   // T12's fallback, kept for genBoardT12 only
  ladders: { 4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91 },
  snakes: { 17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78 },
};

const RULE = Object.freeze({
  NEAR: 0.5,                // "within half a cell": the old critique's measure (still reported by measureBoard)
  /* The clearances, in cells, centre line to centre line, between any two pieces on the bends every client draws. The printed board's snakes are SLIM
     (snakebite r3, 2026-11-01): a body 0.22 of a cell across (0.27 with its outline), a head 0.46 (0.5), a ladder 0.51 over all, so these leave a gap
     of a couple of hairs between any two and none of one over another. */
  GAP_SS: 0.50,             // serpent to serpent
  GAP_SL: 0.54,             // serpent to ladder
  GAP_LL: 0.62,             // ladder to ladder
  /* And the ends: how far every other piece's centre line stays from a serpent's head (the head is the broadest part, 0.5 wide and 0.62 long), its tail
     (a thin tip), and a ladder's foot and top (the posts). */
  END_HEAD: 0.60,
  END_TAIL: 0.45,
  END_LADDER: 0.60,
  EDGE: 0.35,               // a serpent's centre line stays this far in from the board's edge (the app keeps its bodies on the plate)
  SOFT: 1.0,                // the share of a clearance the search holds a PARTIAL board to on the worse of both sides of each bend
  ATTEMPTS: 3000,           // sets of spans the search may try before it deals the fixed clear board (never seen; the painted snakes' winding bends leave fewer clear places, so more than the 600 that were enough)
  BUDGET: 2400,             // checks the search may spend on one set of spans before new spans are drawn
  DRAMA: 30,                // the longest serpent falls at least this far
  /* The shapes of the pieces (the owner's "A Royal", 2026-11-02, ref/snakes_target/TARGET_royal.png: the approved picture's ladders span one to three rows and are short
     chunky things, its serpents two to five rows; the first Royal board dealt long diagonals over half the squares): a ladder rises two or three rows, leans one or two cells
     sideways (LADDER_DX) and is at most LADDER_LEN cells long, a serpent falls two to five rows, is at most SERPENT_LEN cells long and SERPENT_DX sideways. The spans in squares are as they were (the
     numbers of rows and the lengths are how far a piece runs across the squares, not how many squares it skips), so a game is as long as it was. */
  LADDER_ROWS: [2, 3],
  LADDER_LEN: [2.2, 3.7],
  /* The spans a leaning ladder can have (the approved picture's ladders lean 30 to 40 degrees off the vertical: two or three rows up and one or two columns over): on the boustrophedon
     numbering that is a rise of 18, 19, 21 or 22 squares for two rows (18 and 22 lean two columns, 19 and 21 one) or 29 to 31 for three. Drawn from this list (a span repeated is
     likelier; three rows in five), as the ladders' were drawn from 15 to 28: the mean rise is 22 against 20, so a game is as long as it was, within a few per cent. */
  LADDER_SPANS: [18, 18, 19, 19, 19, 21, 21, 21, 22, 22, 22, 22, 29, 30, 31],
  LADDER_DX: [1, 2],        // and leans: one or two columns sideways, never straight up and never along (the picture's ladders all lean)
  SERPENT_ROWS: [2, 5],
  SERPENT_LEN: [2.0, 6.4],
  SERPENT_DX: 4.5,          // a serpent sweeps at most this far sideways
  LADDERS: 8,               // pieces of each kind: eight ladders and eight snakes, as in the classic printed board (the owner, 2026-11-01)
  SERPENTS: 8,
  /* the spans each kind is drawn from (T12's: ladders 8 to 50, serpents 8 to 45); the drama serpent may still fall
     DRAMA or more, the rest as drawn */
  DRAMA_SPAN: [30, 50],      // the first serpent drawn, the sweeping one every board has (an S-curve over up to five rows: the owner's approved picture, 2026-11-02)
  LADDER_SPAN: [15, 28],
  SERPENT_SPAN: [22, 45],    // the owner, 2026-10-14 (after the reviewers): with reach-100, games at a median 17 rounds of four and 34 at the 90th (were 25 and 59)
  /* spread (the owner, 2026-10-14, from the phone: the short serpents bunched up): at most HEADS_PER_ROW serpent
     heads in a row, heads from SERPENT_FROM up (T12's 20), and each serpent tries the least crowded places first:
     by the most serpent body any 3x3 patch of squares would hold with it, in steps of SPREAD_STEP cells (0 tries
     them in plain random order). */
  HEADS_PER_ROW: 2,
  SERPENT_FROM: 15,
  SPREAD_STEP: 1,
  CROWD_STEP: 0.5,          // cells squared of box overlap that make one step of crowding
});
const WEB_CELL = 72, WEB_SWING_MAX = 120;   // index.html: 72 units a square, a bend swings at most 120

/* ---------------------------------------------------------------- geometry */
function cellXY(n) {
  const r = Math.floor((n - 1) / 10);
  let c = (n - 1) % 10;
  if (r % 2 === 1) c = 9 - c;
  return { x: c + 0.5, y: 9.5 - r };
}
const rowOf = (n) => Math.floor((n - 1) / 10);

/* index.html snakeCtrl in cells; side is +1 for an even rank among the heads, -1 for an odd one */
function snakeCtrl(p, q, side, frac) {
  const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy) || 1;
  const s = side * Math.min((frac || 0.32) * len, WEB_SWING_MAX / WEB_CELL);
  return { x: mx - dy / len * s, y: my + dx / len * s };
}

/* A piece as a polyline with its bounding box: side 0 is a ladder (straight), +1 or -1 a serpent's bend. A serpent
   gets about five pieces a cell (8 to 32) unless segs says otherwise. */
function shape(from, to, side, segs, frac) {
  const p = cellXY(from), q = cellXY(to);
  const pts = [];
  if (!side) pts.push(p, q);
  else {
    const c = snakeCtrl(p, q, side, frac);
    const n = segs || Math.max(8, Math.min(32, Math.ceil(Math.hypot(q.x - p.x, q.y - p.y) * 5)));
    for (let k = 0; k <= n; k++) {
      const t = k / n, u = 1 - t;
      pts.push({ x: u * u * p.x + 2 * u * t * c.x + t * t * q.x, y: u * u * p.y + 2 * u * t * c.y + t * t * q.y });
    }
  }
  return finishShape(from, to, side, pts);
}
function finishShape(from, to, side, pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, len = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    if (a.x < x0) x0 = a.x; if (a.x > x1) x1 = a.x; if (a.y < y0) y0 = a.y; if (a.y > y1) y1 = a.y;
    if (i) len += Math.hypot(a.x - pts[i - 1].x, a.y - pts[i - 1].y);
  }
  return { from, to, side, pts, box: { x0, y0, x1, y1 }, len };
}
/* The iPhone app's serpent (SnakesBoardLayout.cpp SnakeCurve, bSleek): the straight line from head to tail with a sine laid on it. Since the painted snakes (Snakebite r6, 2026-11-02) it winds as the
   approved picture's do: Waves half-waves (one every 1.3 cells of the run, rounded, kept between 2 and 4) of SLEEK_AMP cells (0.5, or 0.2 of the run on a short one: the approved picture's snakes swing 0.45 to 0.5 of a square), to the side the rank gives
   it (odd ranks one way, even the other), nothing at either end. odd is the serpent's rank among the heads, odd or even. */
const SLEEK_AMP = 0.50;
function sleekShape(from, to, odd, segs) {
  const p = cellXY(from), q = cellXY(to);
  const dx = q.x - p.x, dy = q.y - p.y, len = Math.hypot(dx, dy) || 1;
  const waves = Math.max(2, Math.min(4, Math.round(len / 1.3)));
  const amp = Math.min(SLEEK_AMP, 0.2 * len) * (odd ? 1 : -1);
  const n = segs || Math.max(16, Math.min(48, Math.ceil(len * 8)));
  const pts = [];
  for (let k = 0; k <= n; k++) {
    const t = k / n, off = amp * Math.sin(Math.PI * waves * t);
    pts.push({ x: p.x + dx * t - dy / len * off, y: p.y + dy * t + dx / len * off });
  }
  return finishShape(from, to, odd ? 1 : -1, pts);
}
function boxesNear(a, b, pad) {
  return !(a.box.x1 + pad < b.box.x0 || b.box.x1 + pad < a.box.x0 || a.box.y1 + pad < b.box.y0 || b.box.y1 + pad < a.box.y0);
}
const cross = (ax, ay, bx, by) => ax * by - ay * bx;
/* do segments ab and cd cross? (a hit exactly at b or d is left to the next segment, so a vertex counts once) */
function segHit(a, b, c, d) {
  const rx = b.x - a.x, ry = b.y - a.y, sx = d.x - c.x, sy = d.y - c.y;
  const den = cross(rx, ry, sx, sy);
  if (Math.abs(den) < 1e-12) return false;   // parallel: nearness, not a crossing, is what measures these
  const qx = c.x - a.x, qy = c.y - a.y;
  const t = cross(qx, qy, sx, sy) / den, u = cross(qx, qy, rx, ry) / den;
  return t >= 0 && t < 1 && u >= 0 && u < 1;
}
function ptSegDist(p, a, b) {
  const vx = b.x - a.x, vy = b.y - a.y, wx = p.x - a.x, wy = p.y - a.y;
  const L = vx * vx + vy * vy;
  let t = L ? (wx * vx + wy * vy) / L : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(wx - t * vx, wy - t * vy);
}
function segSegDist(a, b, c, d) {
  if (segHit(a, b, c, d)) return 0;
  return Math.min(ptSegDist(a, c, d), ptSegDist(b, c, d), ptSegDist(c, a, b), ptSegDist(d, a, b));
}
/* how many times piece A's centre line crosses piece B's */
function crossings(A, B) {
  if (!boxesNear(A, B, 0)) return 0;
  const bx = B.box;
  let n = 0;
  for (let i = 1; i < A.pts.length; i++) {
    const a = A.pts[i - 1], b = A.pts[i];
    if (Math.max(a.x, b.x) < bx.x0 || Math.min(a.x, b.x) > bx.x1 || Math.max(a.y, b.y) < bx.y0 || Math.min(a.y, b.y) > bx.y1) continue;
    for (let j = 1; j < B.pts.length; j++) if (segHit(a, b, B.pts[j - 1], B.pts[j])) n++;
  }
  return n;
}
/* the length of A's centre line within `near` of B's (judged at each piece's midpoint) */
function nearLength(A, B, near) {
  near = near || RULE.NEAR;
  if (!boxesNear(A, B, near)) return 0;
  const bx = B.box;
  let len = 0;
  for (let i = 1; i < A.pts.length; i++) {
    const a = A.pts[i - 1], b = A.pts[i];
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    if (m.x < bx.x0 - near || m.x > bx.x1 + near || m.y < bx.y0 - near || m.y > bx.y1 + near) continue;
    let best = Infinity;
    for (let j = 1; j < B.pts.length && best >= near; j++) best = Math.min(best, ptSegDist(m, B.pts[j - 1], B.pts[j]));
    if (best < near) len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len;
}
function minDistance(A, B, near) {
  if (!boxesNear(A, B, near || RULE.NEAR)) return Infinity;
  let best = Infinity;
  for (let i = 1; i < A.pts.length; i++) for (let j = 1; j < B.pts.length; j++) {
    const d = segSegDist(A.pts[i - 1], A.pts[i], B.pts[j - 1], B.pts[j]);
    if (d < best) best = d;
  }
  return best;
}
/* ---------------------------------------------------------------- the clear rule */
/* Do two centre lines come within d of each other (a crossing is a distance of 0)? Stops at the first pair of segments that do. */
function closerThan(A, B, d) {
  if (!boxesNear(A, B, d)) return false;
  const bx0 = B.box.x0 - d, bx1 = B.box.x1 + d, by0 = B.box.y0 - d, by1 = B.box.y1 + d;
  for (let i = 1; i < A.pts.length; i++) {
    const a = A.pts[i - 1], b = A.pts[i];
    const ax0 = Math.min(a.x, b.x), ax1 = Math.max(a.x, b.x), ay0 = Math.min(a.y, b.y), ay1 = Math.max(a.y, b.y);
    if (ax1 < bx0 || ax0 > bx1 || ay1 < by0 || ay0 > by1) continue;
    for (let j = 1; j < B.pts.length; j++) {
      const c = B.pts[j - 1], e = B.pts[j];
      if (Math.max(c.x, e.x) < ax0 - d || Math.min(c.x, e.x) > ax1 + d || Math.max(c.y, e.y) < ay0 - d || Math.min(c.y, e.y) > ay1 + d) continue;
      if (segSegDist(a, b, c, e) < d) return true;
    }
  }
  return false;
}
/* the least distance between two centre lines (0 for a crossing), up to `cap` (farther reports cap) */
function polyDist(A, B, cap) {
  cap = cap || 3;
  if (!boxesNear(A, B, cap)) return cap;
  let best = cap;
  for (let i = 1; i < A.pts.length; i++) for (let j = 1; j < B.pts.length; j++) {
    const d = segSegDist(A.pts[i - 1], A.pts[i], B.pts[j - 1], B.pts[j]);
    if (d < best) best = d;
  }
  return best;
}
function pointCloserThan(p, S, d) {
  const bx = S.box;
  if (p.x < bx.x0 - d || p.x > bx.x1 + d || p.y < bx.y0 - d || p.y > bx.y1 + d) return false;
  for (let j = 1; j < S.pts.length; j++) if (ptSegDist(p, S.pts[j - 1], S.pts[j]) < d) return true;
  return false;
}
function pointDist(p, S, cap) {
  cap = cap || 3;
  const bx = S.box;
  if (p.x < bx.x0 - cap || p.x > bx.x1 + cap || p.y < bx.y0 - cap || p.y > bx.y1 + cap) return cap;
  let best = cap;
  for (let j = 1; j < S.pts.length; j++) { const d = ptSegDist(p, S.pts[j - 1], S.pts[j]); if (d < best) best = d; }
  return best;
}

/* A piece on the board: a ladder is one straight shape; a serpent is four, the bends of the two families, each to the side of
   an even rank and of an odd one, at v[family * 2 + parity] (family 0: the web client's bend, 1: the iPhone app's sleek S;
   parity 0: an even rank among the heads, side +1 for the web, 1: an odd one, side -1). ends are the squares nothing may lie
   over, each with how far every other centre line must stay. ub is the box round every variant. */
function makePiece(isLadder, from, to, R, segs) {
  const a = cellXY(from), b = cellXY(to);
  let v, ends;
  if (isLadder) {
    v = [shape(from, to, 0)];
    ends = [{ p: a, r: R.END_LADDER }, { p: b, r: R.END_LADDER }];
  } else {
    v = [shape(from, to, 1, segs), shape(from, to, -1, segs), sleekShape(from, to, false, segs), sleekShape(from, to, true, segs)];
    ends = [{ p: a, r: R.END_HEAD }, { p: b, r: R.END_TAIL }];
    for (const s of v) if (s.box.x0 < R.EDGE || s.box.y0 < R.EDGE || s.box.x1 > 10 - R.EDGE || s.box.y1 > 10 - R.EDGE) return null;   // kept on the board
  }
  const ub = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
  for (const s of v) { ub.x0 = Math.min(ub.x0, s.box.x0); ub.y0 = Math.min(ub.y0, s.box.y0); ub.x1 = Math.max(ub.x1, s.box.x1); ub.y1 = Math.max(ub.y1, s.box.y1); }
  return { isLadder, from, to, v, ends, ub, id: 0 };
}
const gapOf = (A, B, R) => (A.isLadder && B.isLadder ? R.GAP_LL : A.isLadder || B.isLadder ? R.GAP_SL : R.GAP_SS);
const farApart = (A, B, pad) => A.ub.x1 + pad < B.ub.x0 || B.ub.x1 + pad < A.ub.x0 || A.ub.y1 + pad < B.ub.y0 || B.ub.y1 + pad < A.ub.y0;
const MAX_REACH = 0.8;   // no clearance is wider: pieces whose boxes are farther apart than this need no check

/* Two pieces, each in every bend it may be drawn with (a serpent's rank is not yet known), held to k of each clearance. */
function pairClear(A, B, R, k) {
  if (farApart(A, B, MAX_REACH)) return true;
  const g = gapOf(A, B, R) * k;
  if (A.isLadder || B.isLadder) {
    for (const s of A.v) for (const t of B.v) if (closerThan(s, t, g)) return false;
  } else {
    for (let f = 0; f < 2; f++) for (let pa = 0; pa < 2; pa++) for (let pb = 0; pb < 2; pb++) if (closerThan(A.v[f * 2 + pa], B.v[f * 2 + pb], g)) return false;
  }
  for (const e of A.ends) for (const s of B.v) if (pointCloserThan(e.p, s, e.r * k)) return false;
  for (const e of B.ends) for (const s of A.v) if (pointCloserThan(e.p, s, e.r * k)) return false;
  return true;
}
/* May this piece join the board (the pieces so far)? Returns { commit, undo } or null. pieceOf lets the search reuse pieces. */
function clearAdd(board, isLadder, from, to, R, pieceOf) {
  R = R || RULE;
  const P = pieceOf ? pieceOf(isLadder, from, to) : makePiece(isLadder, from, to, R);
  if (!P) return null;
  for (const Q of board.pieces) {
    /* the search meets the same two pieces again and again as it backtracks: each pair is judged once (board.memo, by the pieces' ids) */
    if (board.memo && P.id && Q.id) {
      const k = P.id < Q.id ? P.id * 65536 + Q.id : Q.id * 65536 + P.id;
      let ok = board.memo.get(k);
      if (ok === undefined) board.memo.set(k, ok = pairClear(P, Q, R, R.SOFT));
      if (!ok) return null;
    } else if (!pairClear(P, Q, R, R.SOFT)) return null;
  }
  return { commit: () => { board.pieces.push(P); }, undo: () => { board.pieces.pop(); } };
}
function emptyBoard() { return { pieces: [] }; }

/* The finished board, judged once on the bends it will be drawn with: each serpent's rank among the heads (ascending) gives its
   side, in each family. Returns null when every clearance holds, else what failed. The curves are fine (48 pieces a serpent). */
function finalCheck(list, R) {
  R = R || RULE;
  const heads = list.filter((p) => !p.isLadder).map((p) => p.from).sort((x, y) => x - y);
  const rank = new Map(heads.map((h, i) => [h, i]));
  const pcs = list.map((p) => makePiece(p.isLadder, p.from, p.to, R, 48));
  if (pcs.some((p) => !p)) return "a serpent leaves the board";
  for (let f = 0; f < 2; f++) {
    const cv = pcs.map((p) => (p.isLadder ? p.v[0] : p.v[f * 2 + (rank.get(p.from) % 2)]));
    for (let i = 0; i < pcs.length; i++) for (let j = i + 1; j < pcs.length; j++) {
      const A = pcs[i], B = pcs[j];
      if (farApart(A, B, MAX_REACH)) continue;
      const g = gapOf(A, B, R);
      if (closerThan(cv[i], cv[j], g)) return `${A.from}-${A.to} and ${B.from}-${B.to} come within ${g} (family ${f})`;
      for (const e of A.ends) if (pointCloserThan(e.p, cv[j], e.r)) return `${B.from}-${B.to} lies over the end ${e.p.x},${e.p.y} of ${A.from}-${A.to} (family ${f})`;
      for (const e of B.ends) if (pointCloserThan(e.p, cv[i], e.r)) return `${A.from}-${A.to} lies over the end ${e.p.x},${e.p.y} of ${B.from}-${B.to} (family ${f})`;
    }
  }
  return null;
}
/* the board's pieces as a list, the order of the generator's: ladders then serpents, each by its first square */
function piecesOf(board) {
  return Object.entries(board.ladders).map(([f, t]) => ({ isLadder: true, from: +f, to: t }))
    .concat(Object.entries(board.snakes).map(([f, t]) => ({ isLadder: false, from: +f, to: t })));
}

/* ---------------------------------------------------------------- generators */
/* T12's stream: one sha256 per draw */
function stream(seed) {
  let ctr = 0;
  const next = () => { const h = crypto.createHash("sha256").update(seed + ":" + ctr++).digest(); return h.readUInt32BE(0) / 0x100000000; };
  return { between: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)) };
}
/* a fast seeded stream for the search's places (sfc32 keyed by the seed's hash): it draws thousands */
function fastStream(seed) {
  const h = crypto.createHash("sha256").update(seed + ":places").digest();
  let a = h.readUInt32BE(0), b = h.readUInt32BE(4), c = h.readUInt32BE(8), d = h.readUInt32BE(12);
  const next = () => {
    let t = (a + b) | 0;
    a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); d = (d + 1) | 0;
    t = (t + d) | 0; c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  return { between: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)) };
}
/* T12's basic rules, unchanged: no snake from 100, a ladder reaches 100 only from 60 up, every cell the end of at
   most one piece, 1 and 100 stay plain, and a piece spans at least one row so it reads on the board */
/* The Royal board's piece shapes (RULE.LADDER_ROWS, LADDER_LEN, SERPENT_ROWS, SERPENT_LEN): how many rows a piece runs across and how long its straight line is in cells. */
function shapeOk(isLadder, from, to, R) {
  R = R || RULE;
  const rows = Math.abs(rowOf(to) - rowOf(from)), a = cellXY(from), b = cellXY(to), len = Math.hypot(b.x - a.x, b.y - a.y), dx = Math.abs(b.x - a.x);
  const [rMin, rMax] = isLadder ? R.LADDER_ROWS : R.SERPENT_ROWS, [lMin, lMax] = isLadder ? R.LADDER_LEN : R.SERPENT_LEN;
  const dxOk = isLadder ? dx >= R.LADDER_DX[0] - 1e-9 && dx <= R.LADDER_DX[1] + 1e-9 : dx <= R.SERPENT_DX + 1e-9;
  return rows >= rMin && rows <= rMax && len >= lMin - 1e-9 && len <= lMax + 1e-9 && dxOk;
}
function basicOk(isLadder, from, to, used) {
  if (to < 2 || to > 100) return false;
  if (isLadder && to === 100 && from < 60) return false;
  if (used.has(from) || used.has(to)) return false;
  if (rowOf(from) === rowOf(to)) return false;
  return true;
}

/* T12's generator exactly as it shipped (the "before" of tools/board-stats.js and test/board.js). */
function genBoardT12(seed) {
  const { between } = stream(seed);
  for (let attempt = 0; attempt < 200; attempt++) {
    const used = new Set([1, 100]);
    const ladders = {}, snakes = {};
    let ok = true;
    const place = (isLadder) => {
      for (let t = 0; t < 400; t++) {
        const from = isLadder ? between(2, 90) : between(20, 99);
        const span = between(8, isLadder ? 50 : 45);
        const to = isLadder ? from + span : from - span;
        if (!basicOk(isLadder, from, to, used)) continue;
        used.add(from); used.add(to);
        (isLadder ? ladders : snakes)[from] = to;
        return true;
      }
      return false;
    };
    for (let i = 0; i < 8 && ok; i++) ok = place(true);
    for (let i = 0; i < 8 && ok; i++) ok = place(false);
    if (ok) return { ladders, snakes, fallback: false };
  }
  return { ladders: { ...CLASSIC.ladders }, snakes: { ...CLASSIC.snakes }, fallback: true };
}

/* The spans (RULE.LADDERS and RULE.SERPENTS of them), each drawn as T12 draws a piece (a place and a span together, redrawn until the piece fits on
   the board and spans a row), so each kind's spread of spans is T12's. Only the spans are kept. */
function drawSpans(between, drama, ladders, serpentCount, ladderSpan, serpentSpan, serpentFrom, dramaSpan, ladderSpans) {
  const [lMin, lMax] = ladderSpan || [8, 50], [sMin, sMax] = serpentSpan || [8, 45];
  const pieces = [];
  while (pieces.length < (ladders || 8)) {
    const from = between(2, 90), span = ladderSpans && ladderSpans.length ? ladderSpans[between(0, ladderSpans.length - 1)] : between(lMin, lMax), to = from + span;
    if (to > 100 || (to === 100 && from < 60) || rowOf(from) === rowOf(to)) continue;
    pieces.push({ isLadder: true, span });
  }
  for (;;) {
    const serpents = [];
    while (serpents.length < (serpentCount || 8)) {
      /* the first serpent drawn is the drama one, from T12's whole range; the rest from SERPENT_SPAN */
      const from = between(serpentFrom || 20, 99), span = serpents.length === 0 ? between((dramaSpan || [sMin, 45])[0], (dramaSpan || [sMin, 45])[1]) : between(sMin, sMax), to = from - span;
      if (to < 2 || rowOf(from) === rowOf(to)) continue;
      serpents.push({ isLadder: false, span });
    }
    if (Math.max(...serpents.map((x) => x.span)) >= (drama || 0)) return pieces.concat(serpents);   // the drama rule
  }
}

/* The clear generator: { ladders, snakes } as T12 returned (with non-enumerable stats for the tools).

   The search (snakebite r3, 2026-11-01: eight serpents and eight ladders, still nothing touching): the spans are drawn first (drawSpans), longest first as
   before; then every piece's places are listed (every square it may start from) and the pieces are placed by forward checking. Each place taken strikes, from
   the lists of every piece still to place, every place that would touch it (the clearances), use one of its two squares, or put a third head in its row; the
   piece with the fewest places left goes next; and a piece with none left sends the search back at once. The plain depth-first search this replaces (the
   same clearances, one piece after another) found a dead end only deep in the tree, which was fast enough for six pieces of each kind and failed for eight
   (most boards ran out of attempts). A piece's places are still tried least crowded first, so a board is spread over the squares as it always was, and a
   finished board is judged once exactly on the bends it will be drawn with. */
function genBoardLive(seed, rule) {
  const R = rule ? Object.assign({}, RULE, rule) : RULE;
  const draws = stream(seed), places = fastStream(seed);
  const shapes = new Map();   // the search tries a place many times over; its shapes are made once per board
  const shapeOf = (from, to, side) => { const k = (from * 128 + to) * 4 + side + 1; let sh = shapes.get(k); if (!sh) shapes.set(k, sh = shape(from, to, side)); return sh; };
  const made = new Map();     // and its pieces (all the bends a serpent may be drawn with) too
  let ids = 0;
  const pieceOf = (isLadder, from, to) => { const k = (from * 128 + to) * 2 + (isLadder ? 1 : 0); let p = made.get(k); if (p === undefined) { p = makePiece(isLadder, from, to, R, 16); if (p) p.id = ++ids; made.set(k, p); } return p; };
  const memo = new Map();     // each pair of places is judged once per board (by the pieces' ids)
  const compat = (A, B) => {
    const k = A.id < B.id ? A.id * 65536 + B.id : B.id * 65536 + A.id;
    let ok = memo.get(k);
    if (ok === undefined) memo.set(k, ok = pairClear(A, B, R, R.SOFT));
    return ok;
  };
  const plain = new Set([1, 100]);
  let checks = 0, leaves = 0;
  const bodyCache = new Map();
  const bodyOf = (from, to) => {   // [patch, length] pairs: what this serpent adds to each 3x3 patch of squares
    const key = from * 128 + to;
    let adds = bodyCache.get(key);
    if (adds) return adds;
    const cells = new Map(), S = shapeOf(from, to, 1);
    for (let i = 1; i < S.pts.length; i++) {
      const a = S.pts[i - 1], c = S.pts[i];
      const k = Math.min(9, Math.floor((a.y + c.y) / 2)) * 10 + Math.min(9, Math.floor((a.x + c.x) / 2));
      cells.set(k, (cells.get(k) || 0) + Math.hypot(c.x - a.x, c.y - a.y));
    }
    const per = new Map();
    for (const [k, l] of cells) {
      const y = Math.floor(k / 10), x = k % 10;
      for (let wy = Math.max(0, y - 2); wy <= Math.min(7, y); wy++) for (let wx = Math.max(0, x - 2); wx <= Math.min(7, x); wx++) per.set(wy * 8 + wx, (per.get(wy * 8 + wx) || 0) + l);
    }
    bodyCache.set(key, adds = [...per]);
    return adds;
  };
  for (let attempt = 0; attempt < R.ATTEMPTS; attempt++) {
    /* longest first, ladders and serpents together (a long piece has the fewest clear places) */
    const pieces = drawSpans(draws.between, R.DRAMA, R.LADDERS, R.SERPENTS, R.LADDER_SPAN, R.SERPENT_SPAN, R.SERPENT_FROM, R.DRAMA_SPAN, R.LADDER_SPANS).sort((x, y) => y.span - x.span || (x.isLadder === y.isLadder ? 0 : x.isLadder ? -1 : 1));
    const n = pieces.length;
    /* every piece's places: each square it may start from that T12's basic rules and the board's edge allow */
    const domains = [];
    let empty = false;
    for (let k = 0; k < n && !empty; k++) {
      const { isLadder, span } = pieces[k];
      const list = [];
      for (let f = isLadder ? 2 : R.SERPENT_FROM; f <= (isLadder ? 90 : 99); f++) {
        const t = isLadder ? f + span : f - span;
        if (!basicOk(isLadder, f, t, plain) || !shapeOk(isLadder, f, t, R)) continue;
        const P = pieceOf(isLadder, f, t);
        if (P) list.push({ f, t, P });
      }
      empty = list.length === 0;
      domains.push(list);
    }
    if (empty) continue;
    const at = new Array(n).fill(null), order = [];
    const headRows = new Array(10).fill(0);
    const win = new Float64Array(64);   // serpent body in each 3x3 patch (its top left square y * 8 + x)
    const placed = [];
    const crowdOf = (adds) => { let most = 0; for (const [w, l] of adds) if (win[w] + l > most) most = win[w] + l; return most; };   // the most body any patch would hold with it
    let budget = R.BUDGET;
    const search = (doms, left) => {
      if (left === 0) {
        leaves++;
        return !finalCheck(pieces.map((pc, i) => ({ isLadder: pc.isLadder, from: at[i].f, to: at[i].t })), R);
      }
      // the piece with the fewest places left (the longest of them when they tie)
      let k = -1, fewest = Infinity;
      for (let j = 0; j < n; j++) {
        if (at[j]) continue;
        const size = doms[j].length;
        if (size < fewest || (size === fewest && pieces[j].span > pieces[k].span)) { fewest = size; k = j; }
      }
      if (fewest === 0) return false;
      const isLadder = pieces[k].isLadder;
      const cands = doms[k].slice();
      /* the places shuffled whole, then the least crowded tried first (the shuffle keeps ties random): a serpent by the most serpent body any 3x3
         patch of squares would hold with it, either kind by how much of the board already placed pieces fill round it (the boxes of every bend a
         piece may be drawn with, a third of a cell out), in steps */
      if (R.SPREAD_STEP > 0) {
        for (let m = cands.length; m > 1; m--) { const j = places.between(0, m - 1), t = cands[j]; cands[j] = cands[m - 1]; cands[m - 1] = t; }
        const rank = new Map();
        for (const c of cands) {
          let crowd = 0;
          for (const Q of placed) {
            const w = Math.min(c.P.ub.x1 + 0.35, Q.ub.x1) - Math.max(c.P.ub.x0 - 0.35, Q.ub.x0), h = Math.min(c.P.ub.y1 + 0.35, Q.ub.y1) - Math.max(c.P.ub.y0 - 0.35, Q.ub.y0);
            if (w > 0 && h > 0) crowd += w * h;
          }
          let r = Math.floor(crowd / R.CROWD_STEP);
          if (!isLadder) r += Math.floor(crowdOf(bodyOf(c.f, c.t)) / R.SPREAD_STEP);
          rank.set(c, r);
        }
        cands.sort((a, b) => rank.get(a) - rank.get(b));   // stable: the least crowded first, ties as shuffled
      } else {
        for (let m = cands.length; m > 1; m--) { const j = places.between(0, m - 1), t = cands[j]; cands[j] = cands[m - 1]; cands[m - 1] = t; }
      }
      for (const c of cands) {
        if (budget-- <= 0) return false;
        checks++;
        // the places this one strikes from every other piece's list
        const fullRow = !isLadder && headRows[rowOf(c.f)] + 1 >= R.HEADS_PER_ROW ? rowOf(c.f) : -1;
        const next = doms.slice();
        let dead = false;
        for (let j = 0; j < n; j++) {
          if (at[j] || j === k) continue;
          const keep = [];
          for (const d of doms[j]) {
            if (d.f === c.f || d.f === c.t || d.t === c.f || d.t === c.t) continue;
            if (fullRow >= 0 && !pieces[j].isLadder && rowOf(d.f) === fullRow) continue;
            if (!compat(c.P, d.P)) continue;
            keep.push(d);
          }
          if (keep.length === 0) { dead = true; break; }
          next[j] = keep;
        }
        if (dead) continue;
        at[k] = c; order.push({ isLadder, from: c.f }); placed.push(c.P);
        if (!isLadder) { headRows[rowOf(c.f)]++; for (const [w, l] of bodyOf(c.f, c.t)) win[w] += l; }
        if (search(next, left - 1)) return true;
        at[k] = null; order.pop(); placed.pop();
        if (!isLadder) { headRows[rowOf(c.f)]--; for (const [w, l] of bodyOf(c.f, c.t)) win[w] -= l; }
        if (budget <= 0) return false;
      }
      return false;
    };
    if (search(domains, n)) {
      const ladders = {}, snakes = {};
      pieces.forEach((pc, k) => { (pc.isLadder ? ladders : snakes)[at[k].f] = at[k].t; });
      const out = { ladders: sortKeys(ladders), snakes: sortKeys(snakes) };
      Object.defineProperty(out, "stats", { value: { attempt, checks, leaves, order }, enumerable: false });
      return out;
    }
  }
  /* Unreachable in practice (tools/board-stats.js, test/board.js: no seed of thousands needed the last attempts). The
     attempts spent, the seed gets a board that is still clear, never T12's: the one fixed board that passes the whole rule. */
  return { ladders: { ...CLEAR_FALLBACK.ladders }, snakes: { ...CLEAR_FALLBACK.snakes } };
}
/* The boards a game is dealt (snakebite r3, 2026-11-01): the search above takes eight serpents and eight ladders that touch nothing from a fraction of a second
   to a few seconds a board, far too long for the one process every room shares, so the boards it finds are found ahead of time (tools/make-pool.js) and kept in
   boards-pool.json, and genBoard(seed) deals the one the seed picks. The same seed always gives the same board; every board in the file passed the whole rule
   (clear, drama, spread, the game's length) when it was made, and test/board.js judges them all again against the rule as it stands, so a rule changed without
   the pool made again fails the gate. A rule passed in (the tools do) or a missing pool goes to the search itself. */
/* What a board must be besides clear to join the pool: serpents that sweep (the printed board's long S-curves over three to seven rows), pieces spread over
   the squares, and a game of today's length. All three are measured on the board itself. */
const POOL_RULE = Object.freeze({
  LONG: 30, LONG_COUNT: 4,    // at least LONG_COUNT serpents fall LONG squares or more
  ROWS: 3, ROWS_COUNT: 5,     // at least ROWS_COUNT serpents run across ROWS rows or more
  SPREAD_MAX: 14,             // the most the pieces' coverage of the squares may vary (the variance of the pieces over a square, see spreadOf)
  TURNS: [27, 42],            // a lone player's mean turns to finish (meanTurns): the unfiltered boards' own mean is 34 (the middle two thirds 29 to 46), so only the longest games are left out
});
/* the pieces over the squares: every piece sampled along its straight line, a count for each square it passes; its variance over the hundred squares */
function spreadOf(board) {
  const cnt = new Float64Array(100);
  const at = (n) => { const r = rowOf(n); let c = (n - 1) % 10; if (r % 2) c = 9 - c; return { x: c, y: r }; };
  for (const g of [board.ladders, board.snakes]) for (const [f, t] of Object.entries(g)) {
    const a = at(+f), b = at(t);
    for (let k = 0; k <= 20; k++) {
      const u = k / 20, x = Math.min(9, Math.max(0, Math.round(a.x + (b.x - a.x) * u))), y = Math.min(9, Math.max(0, Math.round(a.y + (b.y - a.y) * u)));
      cnt[y * 10 + x]++;
    }
  }
  const mean = cnt.reduce((x, y) => x + y, 0) / 100;
  return cnt.reduce((x, y) => x + (y - mean) * (y - mean), 0) / 100;
}
/* a lone player's mean turns to finish: the game's own rules (a throw of six is a throw again, up to three in a turn; reaching or passing 100 wins), a fixed stream of throws */
function meanTurns(board, games) {
  games = games || 600;
  const lad = new Int16Array(101), snk = new Int16Array(101);
  for (const [f, t] of Object.entries(board.ladders)) lad[f] = t;
  for (const [f, t] of Object.entries(board.snakes)) snk[f] = t;
  let a = 0x9e3779b9, total = 0;
  const rnd = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let g = 0; g < games; g++) {
    let pos = 0, turns = 0;
    while (pos < 100 && turns < 5000) {
      turns++;
      for (let sixes = 0; ;) {
        const roll = 1 + Math.floor(rnd() * 6);
        let n = Math.min(100, pos + roll);
        for (let hops = 0; hops < 5; hops++) { if (lad[n]) n = lad[n]; else if (snk[n]) n = snk[n]; else break; }
        pos = n;
        if (n === 100) break;
        if (roll === 6 && ++sixes < 3) continue;
        break;
      }
    }
    total += turns;
  }
  return total / games;
}
/* null when the board joins the pool, else why not */
function poolQuality(board, P) {
  P = P || POOL_RULE;
  const falls = Object.entries(board.snakes).map(([f, t]) => f - t);
  for (const [f, t] of Object.entries(board.ladders)) if (!shapeOk(true, +f, t)) return "a ladder out of shape";
  for (const [f, t] of Object.entries(board.snakes)) if (!shapeOk(false, +f, t)) return "a serpent out of shape";
  if (falls.filter((x) => x >= P.LONG).length < P.LONG_COUNT) return "too few long serpents";
  if (Object.entries(board.snakes).filter(([f, t]) => rowOf(+f) - rowOf(t) >= P.ROWS).length < P.ROWS_COUNT) return "too few serpents over three rows";
  if (spreadOf(board) > P.SPREAD_MAX) return "pieces bunched up";
  const m = meanTurns(board);
  if (m < P.TURNS[0] || m > P.TURNS[1]) return "a game of " + m.toFixed(1) + " turns";
  return null;
}
const POOL_FILE = require("path").join(__dirname, "boards-pool.json");
let pool = null;
function loadPool() {
  if (pool) return pool;
  try {
    const raw = JSON.parse(require("fs").readFileSync(POOL_FILE, "utf8"));
    const toObj = (a) => { const o = {}; for (let i = 0; i < a.length; i += 2) o[a[i]] = a[i + 1]; return o; };
    pool = { rule: raw.rule, boards: raw.boards.map((b) => ({ ladders: toObj(b[0]), snakes: toObj(b[1]) })) };
  } catch (e) { pool = { rule: null, boards: [] }; }
  return pool;
}
/* The board a game is dealt (2026-11-04): a real layout or its mirror (layouts.js). A rule passed in (the old tools) runs the generator's own search instead. */
function genBoard(seed, rule) {
  if (!rule) return Layouts.deal(seed);
  return genBoardLive(seed, rule);
}
/* integer keys enumerate ascending anyway; this only makes the intent plain */
function sortKeys(o) { const r = {}; for (const k of Object.keys(o).map(Number).sort((a, b) => a - b)) r[k] = o[k]; return r; }

/* ---------------------------------------------------------------- measures (the tools and tests) */
/* the bends as the web and iPhone clients draw them today: sides alternate by the heads' ascending order */
function webPieces(board, segs) {
  const L = Object.entries(board.ladders).map(([a, b]) => shape(Number(a), Number(b), 0));
  const heads = Object.keys(board.snakes).map(Number).sort((a, b) => a - b);
  const S = heads.map((h, i) => shape(h, board.snakes[h], i % 2 ? -1 : 1, segs || 96));
  return { L, S };
}
/* the bends the Unreal bend chooser would draw (snakes/WORLD.md 3.3, not in the app yet): for each serpent in the
   heads' order, of six bends (either side, 0.12, 0.22 or 0.32 of its length, the swing capped at 120 web units, the
   curve kept on the board) the one with the least 2 x crossings of ladders + crossings of serpents already bent
   + 2 x cells along a ladder + cells along another serpent; ties keep today's bend. For the stats only. */
function alongLength(A, B) {
  if (!boxesNear(A, B, RULE.NEAR)) return 0;
  const cos35 = Math.cos(35 * Math.PI / 180);
  let len = 0;
  for (let i = 1; i < A.pts.length; i++) {
    const a = A.pts[i - 1], b = A.pts[i], m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, sl = Math.hypot(b.x - a.x, b.y - a.y);
    let best = Infinity, bj = -1;
    for (let j = 1; j < B.pts.length; j++) { const d = ptSegDist(m, B.pts[j - 1], B.pts[j]); if (d < best) { best = d; bj = j; } }
    if (best >= RULE.NEAR) continue;
    const c = B.pts[bj - 1], e = B.pts[bj], bl = Math.hypot(e.x - c.x, e.y - c.y) || 1;
    if (Math.abs(((b.x - a.x) * (e.x - c.x) + (b.y - a.y) * (e.y - c.y)) / ((sl || 1) * bl)) >= cos35) len += sl;
  }
  return len;
}
function chooserPieces(board, segs) {
  const L = Object.entries(board.ladders).map(([a, b]) => shape(Number(a), Number(b), 0));
  const heads = Object.keys(board.snakes).map(Number).sort((a, b) => a - b);
  const S = [];
  heads.forEach((h, i) => {
    const today = i % 2 ? -1 : 1;
    const options = [[today, 0.32], [-today, 0.32], [today, 0.22], [-today, 0.22], [today, 0.12], [-today, 0.12]];
    let best = null, bestCost = Infinity;
    for (const [side, frac] of options) {
      const sh = shape(h, board.snakes[h], side, segs || 96, frac);
      if (sh.box.x0 < 0 || sh.box.y0 < 0 || sh.box.x1 > 10 || sh.box.y1 > 10) continue;   // kept on the board
      let cost = 0;
      for (const Ld of L) cost += 2 * crossings(sh, Ld) + 2 * alongLength(sh, Ld);
      for (const T of S) cost += crossings(sh, T) + alongLength(sh, T);
      if (cost < bestCost - 1e-9) { bestCost = cost; best = sh; }
    }
    S.push(best || shape(h, board.snakes[h], today, segs || 96));
  });
  return { L, S };
}
/* crossings, near (any angle, the critique's measure), along (within 35 degrees, round 3's), shares and spans;
   bends "web" (today's clients) or "chooser" (the Unreal bend chooser of WORLD.md 3.3) */
function measureBoard(board, segs, bends) {
  const { L, S } = bends === "chooser" ? chooserPieces(board, segs) : webPieces(board, segs);
  const cos35 = Math.cos(35 * Math.PI / 180);
  let ll = 0, sl = 0, ss = 0, near = 0, along = 0, nearS = 0, worstNear = 0, worstAlong = 0;
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) ll += crossings(L[i], L[j]);
  for (let i = 0; i < S.length; i++) {
    for (let j = i + 1; j < S.length; j++) ss += crossings(S[i], S[j]);
    for (const Ld of L) sl += crossings(S[i], Ld);
    for (let j = 0; j < S.length; j++) if (j !== i) nearS += nearLength(S[i], S[j]) / 2;
    /* a piece of serpent near two ladders counts once */
    let n = 0, a = 0;
    const pts = S[i].pts;
    for (let k = 1; k < pts.length; k++) {
      const p = pts[k - 1], q = pts[k], m = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }, sl2 = Math.hypot(q.x - p.x, q.y - p.y);
      let isNear = false, isAlong = false;
      for (const Ld of L) {
        if (ptSegDist(m, Ld.pts[0], Ld.pts[1]) >= RULE.NEAR) continue;
        isNear = true;
        const c = Ld.pts[0], e = Ld.pts[1], bl = Math.hypot(e.x - c.x, e.y - c.y) || 1;
        if (Math.abs(((q.x - p.x) * (e.x - c.x) + (q.y - p.y) * (e.y - c.y)) / ((sl2 || 1) * bl)) >= cos35) isAlong = true;
      }
      if (isNear) n += sl2;
      if (isAlong) a += sl2;
    }
    near += n; along += a;
    worstNear = Math.max(worstNear, n / S[i].len); worstAlong = Math.max(worstAlong, a / S[i].len);
  }
  const rises = Object.entries(board.ladders).map(([f, t]) => t - f);
  const falls = Object.entries(board.snakes).map(([f, t]) => f - t);
  return {
    crossings: ll + sl + ss, ll, sl, ss,
    near, along, nearSerpents: nearS, worstShareNear: worstNear, worstShareAlong: worstAlong,
    rises, falls, longestFall: Math.max(...falls), longestRise: Math.max(...rises),
  };
}
/* Does a finished board keep the clear rule, on the bends each client family draws it with? { ok: true } or { ok: false, why }.
   (order is what the old calm replay took; the clear rule judges the whole board at once.) For the tests. */
function checkCalm(board) {
  const why = finalCheck(piecesOf(board), RULE);
  return why ? { ok: false, why } : { ok: true };
}

/* The board as each family draws it, exactly (48 pieces a serpent): the least centre-line distances between serpents,
   between a serpent and a ladder, between ladders, and the least distance of any other centre line from a head, a tail,
   a ladder end; crossings of all kinds (a distance of 0). The worst over both families. For the tests and tools/board-stats. */
function clearance(board) {
  const list = piecesOf(board), heads = list.filter((p) => !p.isLadder).map((p) => p.from).sort((x, y) => x - y);
  const rank = new Map(heads.map((h, i) => [h, i]));
  const pcs = list.map((p) => makePiece(p.isLadder, p.from, p.to, Object.assign({}, RULE, { EDGE: -1 }), 48));
  const out = { ss: 3, sl: 3, ll: 3, head: 3, tail: 3, ladderEnd: 3, crossings: 0, edge: 3 };
  for (let f = 0; f < 2; f++) {
    const cv = pcs.map((p) => (p.isLadder ? p.v[0] : p.v[f * 2 + (rank.get(p.from) % 2)]));
    for (let i = 0; i < pcs.length; i++) {
      const b = cv[i].box;
      if (!pcs[i].isLadder) out.edge = Math.min(out.edge, b.x0, b.y0, 10 - b.x1, 10 - b.y1);
      for (let j = i + 1; j < pcs.length; j++) {
        const A = pcs[i], B = pcs[j];
        const d = polyDist(cv[i], cv[j]);
        const key = A.isLadder && B.isLadder ? "ll" : A.isLadder || B.isLadder ? "sl" : "ss";
        out[key] = Math.min(out[key], d);
        out.crossings += crossings(cv[i], cv[j]);
        for (const [P, Q, qc] of [[A, B, cv[j]], [B, A, cv[i]]]) {
          for (let e = 0; e < 2; e++) {
            const dd = pointDist(P.ends[e].p, qc);
            const k2 = P.isLadder ? "ladderEnd" : e === 0 ? "head" : "tail";
            out[k2] = Math.min(out[k2], dd);
          }
        }
      }
    }
  }
  return out;
}

/* one board the whole rule passes (a seed the generator dealt, kept here): what a seed gets if every attempt failed, which never happens */
const CLEAR_FALLBACK = { ladders: { 3: 21, 9: 31, 18: 40, 50: 69, 71: 92, 78: 96, 79: 97, 80: 98 }, snakes: { 35: 5, 44: 17, 49: 7, 63: 39, 67: 34, 77: 46, 93: 68, 95: 66 } };   // a pool board (2026-11-02): clear on the painted snakes' bends

module.exports = {
  genBoard, genBoardLive, loadPool, POOL_FILE, POOL_RULE, poolQuality, spreadOf, meanTurns, shapeOk, genBoardT12, measureBoard, checkCalm, clearance, CLASSIC, RULE, CLEAR_FALLBACK,
  _geo: { cellXY, snakeCtrl, shape, sleekShape, crossings, nearLength, minDistance, closerThan, polyDist, makePiece, pairClear, clearAdd, finalCheck, piecesOf, emptyBoard, webPieces, chooserPieces },
};
