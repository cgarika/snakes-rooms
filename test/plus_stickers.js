/* GameNest Plus's stickers (2026-10-16), in every room server as test/plus_stickers.js: node test/plus_stickers.js */
"use strict";
const assert = require("assert");
const R = require(process.argv[2] || "../reactions");

const room = { players: [{ id: "a", name: "Ann" }, { id: "b", name: "Bo" }, { id: "r", name: "Robo", bot: true, plus: true }] };
R.ensure(room);
room.reactionsOn = true;
assert.strictEqual(R.PLUS_KINDS.length, 8);
assert.ok(R.PLUS_KINDS.every((k) => !R.KINDS.includes(k)), "the Plus eight are their own");
assert.strictEqual(R.push(room, 0, "bowdown", 0), false, "an ordinary room: no Plus sticker");
assert.strictEqual(R.push(room, 0, "haha", 0), true, "the free ones as ever");
room.players[1].plus = true;
assert.strictEqual(R.push(room, 0, "legendary", 0), true, "someone owns Plus: everyone throws them");
assert.strictEqual(room.reactions[room.reactions.length - 1].kind, "legendary");
assert.strictEqual(R.push(room, 0, "unicorns", 0), false, "an unknown kind, still dropped");
room.players[1].plus = false;
assert.strictEqual(R.push(room, 0, "gotcha", 0), false, "a bot's flag makes no Plus room");
console.log("plus stickers: ok");
