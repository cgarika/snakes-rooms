/* Snakebite's boards: the SHORT layouts (2026-11-07, snakes-short).

   The owner approved two pictures (Work/ref/snakes_looks/A_palace.png, C_pharaoh.png) in which every serpent and every ladder is short (two or three rows), spread over the whole board, and nothing crosses
   anything; the traditional boards this file held from 2026-11-04 to 2026-11-07 (an English moral board of about 1900, a Vaikunthapali print, a Jnana Bagi board: serpents of four to six rows and long
   diagonal ladders that crossed serpents, heads and numbers) are gone. A game is dealt one of the layouts of layouts.json (each as likely as the others) and, where the layout says so, its left-right mirror
   one game in two (the mirror keeps every end in its row and its place in the zigzag, so it keeps the board's character and every distance; it changes the squares' jumps, so a layout is mirrored only where
   its game stays a good length). Each layout keeps short_rules.js (eight ladders, five to seven of them leaning a column, and eight serpents, two or three rows each, nothing within a gap of anything, every head clear of every
   ladder) and was made by tools/make-short-layouts.js; the app plans every serpent's S-curve (the picture's: a swing of 0.30 to 0.45 of a square, the neck rising straight from the head) and every
   number's place for each board ahead of time (Tools/snakes_layouts.py), which holds the curves to the same clearances.

   Squares are 1 to 100 on the zigzag (1 at the bottom left, 10 at the bottom right, 11 above 10, 100 at the top left). A layout lists its ladders as
   [foot, top] and its serpents as [head, tail]. deal(seed) is the same board for the same seed (the room keeps the seed, so a rejoin and the tests see
   the board that was dealt); a board is { ladders: { foot: top }, snakes: { head: tail } }, the shape the state has always had.

   The client (the app's SnakesLayouts.inl, made by Tools/snakes_layouts.py from the same layouts.json) knows each of these boards by its squares and draws
   its serpents along the paths made for it; QA.Parity.snakes holds the client to every board this deals. */
"use strict";
const crypto = require("crypto");
const DATA = require("./layouts.json");

const rowOf = (n) => Math.floor((n - 1) / 10);
/* the square across the board in the same row: 1 and 10, 2 and 9 ... 11 and 20 ... (a left-right mirror) */
const flip = (n) => 20 * rowOf(n) + 11 - n;

const asBoard = (ladders, snakes) => {
  const L = {}, S = {};
  for (const [f, t] of ladders.slice().sort((a, b) => a[0] - b[0])) L[f] = t;
  for (const [h, t] of snakes.slice().sort((a, b) => a[0] - b[0])) S[h] = t;
  return { ladders: L, snakes: S };
};

/* The mirror of a layout. A piece whose two ends lie in one row (a serpent three squares along a row, say) comes out with its ends the wrong way round, so it
   is turned about: its head is at the end the mirror put it, which is the other end of the same three squares. */
function mirror(layout) {
  const ladders = layout.ladders.map(([f, t]) => (flip(f) < flip(t) ? [flip(f), flip(t)] : [flip(t), flip(f)]));
  const snakes = layout.snakes.map(([h, t]) => (flip(h) > flip(t) ? [flip(h), flip(t)] : [flip(t), flip(h)]));
  return { ...layout, mirrored: true, ladders, snakes };
}

/* Why a board is not one a game can be played on, or null. Every end is a square from 1 to 100 used once; a ladder goes up and a serpent down; a serpent
   never starts on 100 (the game would be won there); no piece ends where another begins (a roll would chain through them: the server follows at most five). */
function problem(layout) {
  const L = layout.ladders, S = layout.snakes, used = new Set();
  const take = (n, what) => {
    if (!Number.isInteger(n) || n < 1 || n > 100) return `${what} ${n} is not a square`;
    if (used.has(n)) return `square ${n} is the end of two pieces`;
    used.add(n);
    return null;
  };
  for (const [f, t] of L) {
    const bad = take(f, "a ladder's foot") || take(t, "a ladder's top");
    if (bad) return bad;
    if (!(t > f)) return `ladder ${f}-${t} does not go up`;
    if (f === 100) return `a ladder starts on 100`;
  }
  for (const [h, t] of S) {
    const bad = take(h, "a serpent's head") || take(t, "a serpent's tail");
    if (bad) return bad;
    if (!(t < h)) return `serpent ${h}-${t} does not go down`;
    if (h === 100) return `a serpent starts on 100`;
  }
  const starts = new Set([...L.map((p) => p[0]), ...S.map((p) => p[0])]);
  for (const [, t] of L) if (starts.has(t)) return `a ladder's top ${t} is another piece's start`;
  for (const [, t] of S) if (starts.has(t)) return `a serpent's tail ${t} is another piece's start`;
  if (L.length < 5 || L.length > 10 || S.length < 5 || S.length > 13) return `${L.length} ladders and ${S.length} serpents`;
  return null;
}

/* every board a game can be dealt, in a fixed order: each layout, then its mirror where the layout says its mirror is dealt too (a mirror changes the squares' jumps: a layout that
   plays a good length of game one way can play a short or a long one the other) */
const BOARDS = [];
for (const layout of DATA.layouts) {
  for (const l of layout.mirror ? [{ ...layout, mirrored: false }, mirror(layout)] : [{ ...layout, mirrored: false }]) {
    const why = problem(l);
    if (why) throw new Error(`layouts.json: ${layout.id}${l.mirrored ? " (mirrored)" : ""}: ${why}`);
    BOARDS.push({ id: layout.id, mirrored: l.mirrored, name: layout.name, ...asBoard(l.ladders, l.snakes) });
  }
}

/* The board a seed deals, with which layout it is: the same seed always gives the same one. Every LAYOUT is as likely as the others (a layout that is dealt in its mirror too is dealt in it one game in two). */
function pick(seed) {
  const h = crypto.createHash("sha256").update(String(seed) + ":layout").digest();
  const layout = DATA.layouts[h.readUInt32BE(0) % DATA.layouts.length];
  const flipped = !!layout.mirror && (h[4] & 1) === 1;
  return BOARDS.find((b) => b.id === layout.id && b.mirrored === flipped);
}
function deal(seed) {
  const b = pick(seed);
  return { ladders: { ...b.ladders }, snakes: { ...b.snakes } };
}

module.exports = { LAYOUTS: DATA.layouts, BOARDS, deal, pick, mirror, flip, problem, rowOf };
