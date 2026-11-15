/* Snakebite: the host picks the table's look in the lobby of a Plus room (the owner, 2026-11-05: the Maharaja's Palace or Pharaoh's Gold), over real sockets. */
const assert = require("assert");
const { spawn } = require("child_process");
const path = require("path");
const { io } = require("socket.io-client");

const PORT = Number(process.env.TEST_PORT || 3295);
const URL = `http://127.0.0.1:${PORT}`;
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
let passed = 0;
const ok = (name) => { passed++; console.log("  ok " + name); };

async function main() {
  const srv = spawn(process.execPath, [path.join(__dirname, "..", "server.js")], { env: { ...process.env, PORT, BOT_MS: "5" }, stdio: "ignore" });
  const socks = [];
  const client = () => { const s = io(URL, { transports: ["websocket"], forceNew: true }); socks.push(s); return s; };
  await pause(700);
  try {
    const last = new Map();   // the newest state each socket has been sent
    const watch = (s) => s.on("state", (st) => last.set(s, st));
    const tableOf = (s) => { const st = last.get(s); const h = st && st.room.players[st.room.hostSeat]; return h && h.look ? h.look.snakes : undefined; };

    // A Plus room: the host owns Plus, the guest does not.
    const a = client(), c = client();
    watch(a); watch(c);
    a.emit("create", { name: "Ava", playerId: "p_ava" + Date.now(), plus: true });
    await pause(300);
    const code = last.get(a).room.code;
    c.emit("join", { code, name: "Cal", playerId: "p_cal" + Date.now() });
    await pause(300);
    assert.strictEqual(tableOf(a), "palace", "the Maharaja's Palace to begin with");
    ok("a Plus room begins at the Palace");

    c.emit("look", { slot: "snakes", id: "pharaoh" });
    await pause(300);
    assert.strictEqual(tableOf(a), "palace", "a guest's pick is not the table's");
    ok("only the host picks the table");

    a.emit("look", { slot: "snakes", id: "pharaoh" });
    await pause(300);
    assert.strictEqual(tableOf(a), "pharaoh");
    assert.strictEqual(tableOf(c), "pharaoh", "the guest's app is told too");
    ok("the host's pick reaches every app: Pharaoh's Gold");

    a.emit("look", { slot: "snakes", id: "classic" });
    a.emit("look", { slot: "ball", id: "gold" });
    await pause(300);
    assert.strictEqual(tableOf(a), "pharaoh");
    assert.strictEqual(last.get(a).room.players[last.get(a).room.hostSeat].look.ball, "classic", "a ball is not a table's slot");
    ok("an old id (the retired classic board) or a slot outside the lists changes nothing");

    a.emit("look", { slot: "snakes", id: "palace" });
    await pause(300);
    assert.strictEqual(tableOf(a), "palace", "and back again");
    a.emit("look", { slot: "snakes", id: "pharaoh" });
    await pause(300);
    a.emit("start");
    await pause(400);
    assert.strictEqual(last.get(a).room.status, "playing");
    a.emit("look", { slot: "snakes", id: "palace" });
    await pause(300);
    assert.strictEqual(tableOf(a), "pharaoh", "not once the game has started");
    ok("the table is set when the game starts");

    // A room without Plus has one table.
    const f = client();
    watch(f);
    f.emit("create", { name: "Fay", playerId: "p_fay" + Date.now() });
    await pause(300);
    f.emit("look", { slot: "snakes", id: "pharaoh" });
    await pause(300);
    assert.strictEqual(tableOf(f), "palace", "no Plus, no second table");
    ok("a room without Plus has one table");
  } finally {
    for (const s of socks) s.close();
    srv.kill();
  }
  console.log(`plus look: ${passed} ok`);
}
main().catch((e) => { console.error(e); process.exit(1); });
