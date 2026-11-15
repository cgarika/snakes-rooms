/* Reactions (the owner, 2026-10-15: "the funny reaction that user can react in the game for all the games we have";
   cartoon stickers, bots react, on by default). The same file in every GameNest room server.

   A seated player throws one of KINDS; it lands in the room's reactions (the last MAX, { id, seat, kind, at }) for
   everyone, and the app springs the sticker out of that seat's card with its sound. The host may turn them off for the
   room. Bots throw their own at big moments (event) and answer a human's (answer), now and then, never in a flood.
   One per player per REACT_MS, at most ROOM_MAX a room in any ROOM_MS; anything else is dropped without a word. */
"use strict";

const KINDS = Object.freeze([
  "haha", "nooo", "grrr", "what", "tooeasy", "hurry", "gg", "loser",
  "lol", "ouch", "lucky", "byebye", "oops", "nice", "revenge", "slow",
]);
/* GameNest Plus's own eight (2026-10-16): thrown only in a Plus room, one where a player owns Plus (the same test
   as plus.js's isPlusRoom, here so a server without plus.js can take this file as it is). Bots keep to KINDS. */
const PLUS_KINDS = Object.freeze(["bowdown", "legendary", "onfire", "flawless", "calculated", "gotcha", "toogood", "sneaky"]);
function isPlusRoom(room) { return !!(room && Array.isArray(room.players) && room.players.some((p) => p && p.plus && !p.bot)); }
const REACT_MS = Math.max(0, Number(process.env.REACT_MS || 1500));
const BOT_REACT_MS = 3500;
const ROOM_MAX = 6, ROOM_MS = 3000, MAX = 8;
const DEFAULT_ON = !/^(0|off|false|no)$/i.test(process.env.REACTIONS_DEFAULT || "on");
const BOTS_ALWAYS = process.env.REACT_BOTS_ALWAYS === "1";   // tests: a bot's every chance comes up

const MOODS = {
  bad: { self: ["nooo", "grrr", "ouch", "oops"], others: ["haha", "lol", "loser", "byebye"] },
  good: { self: ["tooeasy", "lucky", "nice", "haha"], others: ["what", "grrr", "lucky", "nooo"] },
  win: { self: ["tooeasy", "gg", "haha"], others: ["gg", "nooo", "revenge", "what"] },
};
const ANSWERS = {
  haha: ["grrr", "revenge", "what"], lol: ["grrr", "revenge", "nooo"], loser: ["grrr", "revenge", "what"],
  tooeasy: ["what", "revenge", "grrr"], byebye: ["revenge", "nooo"], nooo: ["haha", "lol", "loser"],
  ouch: ["haha", "lol"], oops: ["haha", "lol", "loser"], grrr: ["haha", "tooeasy"], gg: ["gg", "nice"],
  nice: ["gg", "tooeasy"], hurry: ["slow", "grrr"], slow: ["hurry", "grrr"], what: ["haha", "tooeasy"],
  lucky: ["grrr", "what"], revenge: ["lol", "tooeasy"],
};

function ensure(room) {
  if (!room) return room;
  if (typeof room.reactionsOn !== "boolean") room.reactionsOn = DEFAULT_ON;
  if (!Array.isArray(room.reactions)) room.reactions = [];
  if (!room._react) room._react = { seq: 0, times: [], last: {} };
  return room;
}

/* What the state carries: put it with the room's other fields (the app reads it from the room object or the top). */
function view(room) {
  ensure(room);
  return { reactionsOn: room.reactionsOn, reactions: room.reactions };
}

/* A game may forbid a seat a sticker for now (Word Spies: a spymaster while their own team guesses, as any sign would
   be a hint); wire's allow sets it, for people and bots alike. */
let ALLOW = null;

function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

/* Lands one, if the limits allow; true when it did. */
function push(room, seat, kind, gapMs) {
  ensure(room);
  if (!room.reactionsOn || !(KINDS.includes(kind) || (PLUS_KINDS.includes(kind) && isPlusRoom(room)))) return false;
  const p = room.players && room.players[seat];
  if (!p || p.left || (ALLOW && !ALLOW(room, seat))) return false;
  const now = Date.now(), r = room._react;
  if (r.last[seat] && now - r.last[seat] < gapMs) return false;
  r.times = r.times.filter((t) => now - t < ROOM_MS);
  if (r.times.length >= ROOM_MAX) return false;
  r.last[seat] = now; r.times.push(now);
  r.seq += 1;
  room.reactions = room.reactions.concat({ id: r.seq, seat, kind, at: now }).slice(-MAX);
  return true;
}

function isBot(room, seat) { const p = room.players && room.players[seat]; return !!(p && p.bot && !p.left); }

/* A bot throws one of kinds, with chance, after a beat (a person needs a moment too), and after afterMs more: the time
   the app takes to show what it reacts to (a ball rolling in, a pawn walking to the snake), so it never gives it away. */
function botSay(room, seat, kinds, chance, bump, afterMs) {
  if (!isBot(room, seat) || (!BOTS_ALWAYS && Math.random() >= chance)) return;
  const t = setTimeout(() => {
    if (isBot(room, seat) && push(room, seat, pick(kinds), BOT_REACT_MS)) bump(room);
  }, (afterMs || 0) + 450 + Math.floor(Math.random() * 900));
  if (t.unref) t.unref();
}

/* Something happened to seat: "bad" (bitten, captured, a gutter), "good" (a ladder, a capture made, a strike) or "win".
   That seat's bot reacts, often; one other bot, now and then; afterMs once the app has shown it. */
function event(room, seat, mood, bump, afterMs) {
  ensure(room);
  const m = MOODS[mood]; if (!m || !room.reactionsOn || !room.players) return;
  botSay(room, seat, m.self, mood === "win" ? 0.8 : 0.55, bump, afterMs);
  const others = room.players.map((_, i) => i).filter((i) => i !== seat && isBot(room, i));
  if (mood === "win") { for (const i of others.slice(0, 2)) botSay(room, i, m.others, 0.5, bump, afterMs); return; }
  if (others.length) botSay(room, pick(others), m.others, 0.3, bump, afterMs);
}

/* A person threw one: a bot answers it, sometimes. */
function answer(room, seat, kind, bump) {
  const bots = (room.players || []).map((_, i) => i).filter((i) => i !== seat && isBot(room, i));
  if (bots.length && ANSWERS[kind]) botSay(room, pick(bots), ANSWERS[kind], 0.4, bump);
}

/* The two messages, wired once per socket: on is the server's guarded on(); room() the socket's room now; me() its
   player id; isHost(room) whether that player hosts it; bump(room) sends everyone the new state; allow(room, seat),
   if given, whether that seat may throw one now. */
function wire({ on, room, me, isHost, bump, allow }) {
  if (allow) ALLOW = allow;
  on("react", ({ kind } = {}) => {
    const r = room(); if (!r || !r.players) return;
    const seat = r.players.findIndex((p) => p.id === me());
    const p = r.players[seat];
    if (!p || p.left || p.bot || typeof kind !== "string") return;
    if (!push(r, seat, kind, REACT_MS)) return;
    bump(r);
    answer(r, seat, kind, bump);
  });
  on("reactionsOn", ({ on: want } = {}) => {
    const r = room(); if (!r || typeof want !== "boolean" || !isHost(r)) return;
    ensure(r);
    if (r.reactionsOn === want) return;
    r.reactionsOn = want;
    if (!want) r.reactions = [];
    bump(r);
  });
}

module.exports = { KINDS, PLUS_KINDS, ensure, view, push, event, answer, wire, DEFAULT_ON };
