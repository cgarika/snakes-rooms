/* How long a game lasts on a set of boards: bots playing the server's own rules (one die, a six rolls again, the third six
   passes the turn, "reach" finish), N seats, a winner's turns counted. node tools/length-sim.js [games=100000] [seats=4] */
"use strict";
const B = require("../board.js");
const games = +(process.argv[2] || 100000), seats = +(process.argv[3] || 4);
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function play(board, rnd) {
  const pos = new Array(seats).fill(0), turns = new Array(seats).fill(0);
  let events = 0, snakeHits = 0, ladderHits = 0;
  for (let seat = 0, guard = 0; guard < 20000; seat = (seat + 1) % seats, guard++) {
    turns[seat]++;
    for (let sixes = 0; ;) {
      const roll = 1 + Math.floor(rnd() * 6);
      let n = pos[seat] + roll; if (n > 100) n = 100;
      let hops = 0;
      while (hops++ < 5) {
        if (board.ladders[n] !== undefined) { n = board.ladders[n]; ladderHits++; events++; }
        else if (board.snakes[n] !== undefined) { n = board.snakes[n]; snakeHits++; events++; }
        else break;
      }
      pos[seat] = n;
      if (n === 100) return { rounds: turns[seat], events, snakeHits, ladderHits };
      if (roll === 6 && ++sixes < 3) continue;
      break;
    }
  }
  return { rounds: 9999, events, snakeHits, ladderHits };
}
function run(label, rule) {
  const per = 50, boards = Math.ceil(games / per), rounds = [], ev = [], sn = [], ld = [];
  const rnd = rng(12345);
  let spans = { l: [], s: [] };
  for (let b = 0; b < boards; b++) {
    const board = B.genBoard("sim-" + label + "-" + b, rule);
    for (const [f, t] of Object.entries(board.ladders)) spans.l.push(t - f);
    for (const [f, t] of Object.entries(board.snakes)) spans.s.push(f - t);
    for (let g = 0; g < per; g++) { const r = play(board, rnd); rounds.push(r.rounds); ev.push(r.events); sn.push(r.snakeHits); ld.push(r.ladderHits); }
  }
  const q = (a, p) => { const x = a.slice().sort((u, v) => u - v); return x[Math.min(x.length - 1, Math.ceil(p * x.length) - 1)]; };
  const mean = (a) => a.reduce((u, v) => u + v, 0) / a.length;
  console.log(`${label.padEnd(5)} ${seats} seats, ${rounds.length} games on ${boards} boards: rounds mean ${mean(rounds).toFixed(2)} median ${q(rounds, .5)} p90 ${q(rounds, .9)}; events/game mean ${mean(ev).toFixed(2)} (snakes ${mean(sn).toFixed(2)}, ladders ${mean(ld).toFixed(2)}); ladder span mean ${mean(spans.l).toFixed(1)}, snake span mean ${mean(spans.s).toFixed(1)}`);
  return { m: mean(rounds), p90: q(rounds, .9), e: mean(ev) };
}
const OLD = { LADDERS: 6, SERPENTS: 12, LADDER_SPAN: [8, 50], SERPENT_SPAN: [8, 30] };   // the boards the live servers deal today
const old = run("old", OLD), nw = run("new", null);   // null: the current RULE
console.log(`new vs old: mean ${((nw.m / old.m - 1) * 100).toFixed(1)}%, p90 ${((nw.p90 / old.p90 - 1) * 100).toFixed(1)}%, events ${((nw.e / old.e - 1) * 100).toFixed(1)}%`);
