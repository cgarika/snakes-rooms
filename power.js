/* Power mode (2026-11-13): the part every Power game's server shares. The same file in ludo-rooms and snakes-rooms.

   Power mode is a room's second mode (settings.mode, "classic" by default): one-use power-ups a player bought with coins.
   The rules that never bend, and that this file and its server own (the app is never trusted with them):
     - a Classic room never takes a power-up, whatever the app sends;
     - at most MAX_USES uses a game for each player, and at most one power-up a turn;
     - no stake, no entry fee, no prize: a Power room is never rated (quickmatch's `rated`), and the app pays the flat
       "played" amount.

   The stock lives on the player's phone (where the boosters live). The app says what it owns on create, join and quick
   (`power: { <kind>: n, ..., seen: { game, <kind>: n } }`) and again when it buys (`powerStock`, the same payload); the
   server clamps each count to 0..STOCK_MAX, counts every use itself, and tells each player alone what it holds for them
   (state.power.me). `seen` is how many of THIS game's uses the app has already taken off its own count, so a stock sent
   in the same moment as a use (a reconnect) is not counted twice.

   An app says it knows the mode with "power" in its caps. One that does not (today's App Store app and every build
   before this one) cannot host a Power room; joining one by code it is seated and plays without power-ups, and every
   field it is sent is one more after the fields it already reads. */

const CAP = "power";
const MAX_USES = 3;
const STOCK_MAX = 99;

function make(kinds) {
  const zero = () => Object.fromEntries(kinds.map((k) => [k, 0]));
  const clean = (x) => {
    const o = zero();
    if (x && typeof x === "object") for (const k of kinds) if (Number.isInteger(x[k])) o[k] = Math.min(STOCK_MAX, Math.max(0, x[k]));
    return o;
  };
  const knows = (caps) => Array.isArray(caps) && caps.includes(CAP);

  /* What the app says it owns. Its count is the truth, less the uses of this game it has not counted yet. An app that does
     not know the mode owns nothing here. True when the stock was taken. */
  function take(pw, sent, game) {
    if (!pw || !pw.knows || !sent || typeof sent !== "object" || Array.isArray(sent)) return false;
    const st = clean(sent);
    const seen = sent.seen && typeof sent.seen === "object" && game && sent.seen.game === game ? clean(sent.seen) : zero();
    for (const k of kinds) pw.stock[k] = Math.max(0, st[k] - Math.max(0, pw.spent[k] - seen[k]));
    return true;
  }

  /* A seat's Power state: whether its app knows the mode, its stock as the app last said it, what it has spent this game
     and the uses it has left. */
  function seat(caps, sent) {
    const pw = { knows: knows(caps), stock: zero(), spent: zero(), left: MAX_USES };
    take(pw, sent, null);
    return pw;
  }

  /* A new game: nothing spent, every use back. */
  function fresh(pw) { pw.spent = zero(); pw.left = MAX_USES; return pw; }

  /* How many uses each bot gets: the rounded mean of the humans' usable counts (the smaller of MAX_USES and what they own).
     No human owns any: none. */
  function botUses(humanPws) {
    const usable = humanPws.map((pw) => (pw && pw.knows ? Math.min(MAX_USES, kinds.reduce((n, k) => n + pw.stock[k], 0)) : 0));
    if (!usable.length || usable.every((n) => n === 0)) return 0;
    return Math.round(usable.reduce((a, b) => a + b, 0) / usable.length);
  }
  function bot(pw, uses) { pw.knows = true; pw.left = uses; for (const k of kinds) pw.stock[k] = uses; return pw; }

  /* One use: off the stock, onto this game's count, one use fewer. */
  function spend(pw, kind) { pw.stock[kind]--; pw.spent[kind]++; pw.left--; }
  const used = (pw) => (pw ? kinds.reduce((n, k) => n + pw.spent[k], 0) : 0);

  /* What a player alone is told about their own seat. */
  const me = (pw) => ({ stock: Object.assign({}, pw.stock), spent: Object.assign({}, pw.spent), left: pw.left });

  return { CAP, MAX_USES, STOCK_MAX, kinds, zero, clean, knows, take, seat, fresh, botUses, bot, spend, used, me };
}

module.exports = { CAP, MAX_USES, STOCK_MAX, make };
