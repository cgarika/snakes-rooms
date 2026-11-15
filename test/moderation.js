/* What players type, kept friendly (moderation.js; the same test in every GameNest server): the words on their own,
   names, and, with the model there (tools/moderation_model.sh), what it holds back and what it lets be. */
const assert = require("assert");
const M = require("../moderation");

let passed = 0;
const ok = async (name, fn) => { await fn(); passed++; console.log("  ok " + name); };

(async () => {
  console.log("moderation: the words");
  await ok("plain swearing is starred, the first letter kept, and the message goes", () => {
    assert.strictEqual(M.clean("what the fuck"), "what the f***");
    assert.strictEqual(M.clean("sh1t happens"), "s*** happens");
    assert.strictEqual(M.clean("shiiiiit"), "s*******");
  });
  await ok("sexual words and slurs, and the phrases (self-harm, finding someone), hold it back", () => {
    for (const t of ["slut", "you f4gg0t", "kys", "kill yourself", "send nudes", "I know where you live", "drink bleach"]) assert.strictEqual(M.clean(t), null, t);
  });
  await ok("game talk and ordinary words are left as they are", () => {
    for (const t of ["who should we kill tonight?", "Snatch the queen!", "this game sucks", "assassin class", "Scunthorpe United",
      "pass the glass", "good game xx", "damn, nice move", "cocoon", "the doctor is dead"]) assert.strictEqual(M.clean(t), t, t);
  });
  await ok("names: any bad word, or a strong one hidden inside, and it is Player", () => {
    for (const n of ["xXsh1tXx", "FuCkBoi99", "N1GGAlord", "slut"]) assert.strictEqual(M.name(n), "Player", n);
    for (const n of ["Ava", "Scunthorpe", "Hancock", "Charles Dickens", "Grape Ape", "Pedro"]) assert.strictEqual(M.name(n), n, n);
  });

  if (!M.available()) {
    console.log("  (the model's tests skipped: no model; tools/moderation_model.sh fetches it)");
    console.log(`moderation: all ${passed} passed`);
    process.exit(0);
  }
  console.log("moderation: the model");
  await ok("abuse with no bad word in it is held back; the chat shows (message removed)", async () => {
    for (const t of ["gay people are disgusting", "I hope you get cancer", "I will find where you live and hurt you", "you retard"]) {
      const r = await M.check(t);
      assert.ok(r.held && r.text === null, t + " " + JSON.stringify(r.scores));
      assert.strictEqual(await M.chat(t), M.REMOVED);
    }
  });
  await ok("the game's own threats and teasing stay (Mafia's nights, chess's captures)", async () => {
    for (const t of ["who should we kill tonight?", "I'm going to shoot the detective", "my knight is going to kill your bishop",
      "checkmate, sucker", "you sneaky little rat", "I'll destroy you at chess", "the wolf will kill the doctor"]) {
      const r = await M.check(t);
      assert.ok(!r.held && r.text === t, t + " " + JSON.stringify(r.scores));
    }
  });
  await ok("a message is checked in well under 50 ms", async () => {
    await M.check("warm up");
    const t = Date.now();
    for (let i = 0; i < 20; i++) await M.check("nice move, you got me there " + i);
    assert.ok((Date.now() - t) / 20 < 50, `${(Date.now() - t) / 20} ms`);
  });
  console.log(`moderation: all ${passed} passed`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
