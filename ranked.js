/* Ranked ratings (2026-10-24). The same file in every GameNest room server.

   Two-player games (chess, Drop Four, carrom, table soccer, bowling 1v1) use Glicko-2; games of three or more
   (Ludo, golf, rummy, Plus Four, snakes) use OpenSkill (Weng-Lin). Every number shown to a player is one
   "display rating": it starts at START (1200) in both models and maps to a tier.

   Ratings are kept per game, keyed by the player's playerId (the id the app mints once and sends on create/join),
   in <RANK_DIR>/<game>.json. Bots never get a rating. They play at BOT_RATING (fixed); and a rating earned only
   against bots cannot climb past BOT_CEILING, so Gold and above need real opponents. */
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const V = require("./rating_vendor.js");

const START = 1200;
const BOT_RATING = Math.max(600, Number(process.env.RANK_BOT_RATING || 1100));
const BOT_CEILING = Math.max(START, Number(process.env.RANK_BOT_CEILING || 1299));
const OS_SCALE = 15;       // display points per OpenSkill ordinal point
const G_RD = 140, G_VOL = 0.06, G_TAU = 0.5;

const TIERS = Object.freeze([
  { name: "Bronze", floor: -Infinity, base: 900 },
  { name: "Silver", floor: 1100 },
  { name: "Gold", floor: 1300 },
  { name: "Platinum", floor: 1500 },
  { name: "Diamond", floor: 1700 },
  { name: "Champion", floor: 1900 },
]);

/** { tier, division (3 lowest .. 1 highest, 0 for Champion), label, index, floor, next } for a display rating. */
function tierOf(rating) {
  const r = Math.round(Number(rating) || 0);
  let i = 0;
  for (let k = 0; k < TIERS.length; k++) if (r >= TIERS[k].floor) i = k;
  const t = TIERS[i];
  if (t.name === "Champion") return { tier: t.name, division: 0, label: "Champion", index: i, floor: t.floor, next: null };
  const lo = t.floor === -Infinity ? t.base : t.floor;
  const hi = TIERS[i + 1].floor;
  const step = (hi - lo) / 3;
  const third = Math.max(0, Math.min(2, Math.floor((r - lo) / step)));   // 0 lowest
  const division = 3 - third;
  return { tier: t.name, division, label: `${t.name} ${["", "I", "II", "III"][division]}`, index: i, floor: lo, next: hi };
}

const GLICKO = { glicko: true };

function modelOf(game, cfg) { return cfg.model === "glicko" ? "glicko" : "openskill"; }

function newRec(model, name, avatar) {
  return model === "glicko"
    ? { m: "g", r: START, rd: G_RD, vol: G_VOL, games: 0, wins: 0, draws: 0, peak: START, name: name || "Player", avatar: avatar || "", at: 0 }
    : { m: "o", mu: 25, sigma: 25 / 3, games: 0, wins: 0, draws: 0, peak: START, name: name || "Player", avatar: avatar || "", at: 0 };
}
function displayOf(rec) {
  if (rec.m === "g") return Math.round(rec.r);
  return Math.round(START + OS_SCALE * (rec.mu - 3 * rec.sigma));
}
function osMuFor(display, sigma) { return (display - START) / OS_SCALE + 3 * sigma; }

class Ratings {
  /** opts: { game, model: "glicko" | "openskill", dir } */
  constructor(opts) {
    this.game = opts.game;
    this.model = modelOf(opts.game, opts);
    this.dir = opts.dir || process.env.RANK_DIR || path.join(os.homedir(), "Library", "GameNest", "Data", "ratings");
    this.file = path.join(this.dir, `${this.game}.json`);
    this.players = Object.create(null);
    this.sorted = null; this.sortedAt = 0;
    this.saveTimer = null;
    this.load();
  }
  load() {
    try { this.players = Object.assign(Object.create(null), JSON.parse(fs.readFileSync(this.file, "utf8")).players || {}); }
    catch (e) { if (e.code !== "ENOENT") console.error("ratings load failed:", e.message); }
  }
  save() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => { this.saveTimer = null; this.saveNow(); }, 300);
    if (this.saveTimer.unref) this.saveTimer.unref();
  }
  saveNow() {
    try {
      fs.mkdirSync(this.dir, { recursive: true });
      const tmp = this.file + "." + process.pid + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify({ game: this.game, players: this.players }));
      fs.renameSync(tmp, this.file);
    } catch (e) { console.error("ratings save failed:", e.message); }
  }
  static cleanId(id) { return typeof id === "string" && /^[A-Za-z0-9_.:-]{6,80}$/.test(id) ? id : null; }
  get(id) { return this.players[id] || null; }
  rating(id) { const r = this.get(id); return r ? displayOf(r) : START; }
  /** The small card the lobby / VS screen shows for a seated human. */
  brief(id) {
    const r = this.get(id);
    const rating = r ? displayOf(r) : START;
    const t = tierOf(rating);
    return { rating, tier: t.tier, division: t.division, label: t.label, games: r ? r.games : 0, provisional: !r || r.games < 5 };
  }
  _ranking() {
    const now = Date.now();
    if (this.sorted && now - this.sortedAt < 3000) return this.sorted;
    this.sorted = Object.entries(this.players)
      .filter(([, r]) => r.games > 0)
      .map(([id, r]) => ({ id, rating: displayOf(r), r }))
      .sort((a, b) => b.rating - a.rating || b.r.wins - a.r.wins || a.r.at - b.r.at);
    this.sortedAt = now;
    return this.sorted;
  }
  /** 1-based place on the ladder, or null if the player has no game yet. */
  place(id) {
    const i = this._ranking().findIndex((e) => e.id === id);
    return i < 0 ? null : i + 1;
  }
  static pub(id) { return crypto.createHash("sha256").update("gn:" + id).digest("hex").slice(0, 12); }
  /** GET /rank/:player */
  profile(id) {
    const b = this.brief(id);
    const r = this.get(id);
    const t = tierOf(b.rating);
    return Object.assign({ game: this.game, player: Ratings.pub(id), place: this.place(id), peak: r ? r.peak : START, wins: r ? r.wins : 0, draws: r ? r.draws : 0,
      losses: r ? Math.max(0, r.games - r.wins - r.draws) : 0, next: t.next, unrated: !r || r.games === 0 }, b);
  }
  /** GET /leaderboard: the top N, plus the asker's own place and neighbours. */
  leaderboard(you, n = 100) {
    const all = this._ranking();
    const row = (e, i) => ({ place: i + 1, player: Ratings.pub(e.id), name: e.r.name, avatar: e.r.avatar, rating: e.rating, games: e.r.games, wins: e.r.wins, ...tierSlim(e.rating), you: e.id === you });
    const top = all.slice(0, n).map(row);
    const out = { game: this.game, total: all.length, top };
    if (you) {
      const i = all.findIndex((e) => e.id === you);
      out.you = i < 0 ? null : row(all[i], i);
    }
    return out;
  }

  /**
   * Settle one finished game. seats: [{ id, bot, name, avatar }], result: { winners: [seatIndex...] } (empty = draw).
   * Returns [{ seat, id, before, after, delta, ...tier, tierUp, tierBefore }] for the humans, in seat order.
   */
  settle(seats, result, opts = {}) {
    const winners = (result && result.winners) || [];
    const humans = seats.map((s, i) => ({ s, i })).filter((x) => !x.s.bot && Ratings.cleanId(x.s.id));
    if (!humans.length) return [];
    const humanCount = humans.length;
    const recs = new Map();
    for (const { s } of humans) {
      if (!this.players[s.id]) this.players[s.id] = newRec(this.model, s.name, s.avatar);
      recs.set(s.id, this.players[s.id]);
    }
    const before = new Map(humans.map(({ s }) => [s.id, displayOf(recs.get(s.id))]));
    if (this.model === "glicko") this._glicko(seats, humans, recs, winners);
    else this._openskill(seats, humans, recs, winners);
    const out = [];
    for (const { s, i } of humans) {
      const rec = recs.get(s.id);
      // Only bots to beat: the climb stops at the ceiling.
      if (humanCount < 2) this._cap(rec, Math.max(before.get(s.id), BOT_CEILING));
      rec.games++;
      if (winners.includes(i)) rec.wins++; else if (!winners.length) rec.draws++;
      if (s.name) rec.name = s.name;
      if (s.avatar != null) rec.avatar = s.avatar;
      rec.at = Date.now();
      const after = displayOf(rec);
      rec.peak = Math.max(rec.peak || START, after);
      const tb = tierOf(before.get(s.id)), ta = tierOf(after);
      out.push({ seat: i, id: s.id, before: before.get(s.id), after, delta: after - before.get(s.id), tierBefore: tb.label,
        tierUp: ta.index > tb.index, ...tierSlim(after), provisional: rec.games < 5 });
    }
    this.sorted = null;
    this.save();
    return out;
  }
  _cap(rec, limit) {
    if (displayOf(rec) <= limit) return;
    if (rec.m === "g") rec.r = limit;
    else rec.mu = osMuFor(limit, rec.sigma);
  }
  _glicko(seats, humans, recs, winners) {
    const g = new V.Glicko2.Glicko2({ tau: G_TAU, rating: START, rd: G_RD, vol: G_VOL });
    // Everyone is rated against the opponent's rating from before this game.
    const ps = seats.map((s, i) => {
      const hum = humans.find((h) => h.i === i);
      if (!hum) return g.makePlayer(BOT_RATING, 80, G_VOL);
      const r = recs.get(s.id);
      return g.makePlayer(r.r, r.rd, r.vol);
    });
    const matches = [];
    for (let a = 0; a < seats.length; a++) for (let b = a + 1; b < seats.length; b++) {
      const sc = !winners.length ? 0.5 : winners.includes(a) && !winners.includes(b) ? 1 : winners.includes(b) && !winners.includes(a) ? 0 : 0.5;
      matches.push([ps[a], ps[b], sc]);
    }
    g.updateRatings(matches);
    for (const { s, i } of humans) {
      const r = recs.get(s.id);
      r.r = ps[i].getRating(); r.rd = Math.max(40, ps[i].getRd()); r.vol = ps[i].getVol();
    }
  }
  _openskill(seats, humans, recs, winners) {
    const O = V.openskill;
    const botMu = osMuFor(BOT_RATING, 2);
    const teams = seats.map((s, i) => {
      const hum = humans.find((h) => h.i === i);
      return [hum ? O.rating({ mu: recs.get(s.id).mu, sigma: recs.get(s.id).sigma }) : O.rating({ mu: botMu, sigma: 2 })];
    });
    const rank = seats.map((s, i) => (!winners.length || winners.includes(i) ? 1 : 2));
    const rated = O.rate(teams, { rank });
    for (const { s, i } of humans) {
      const r = recs.get(s.id);
      r.mu = rated[i][0].mu; r.sigma = Math.max(1.5, rated[i][0].sigma);
    }
  }
}

function tierSlim(rating) { const t = tierOf(rating); return { tier: t.tier, division: t.division, label: t.label }; }

module.exports = { Ratings, tierOf, displayOf, START, BOT_RATING, BOT_CEILING, TIERS, GLICKO };
