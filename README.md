# Snakes & Ladders
The classic for 2-8 players, one token each, squares 0-100 on the standard
board map. Exact landing on 100 wins; overshooting bounces back. Sixes grant
an extra roll (three in a row passes the turn). Snakes and ladders apply as
teleports (chained, capped). Bots, chat, voice, rejoin, rematch, 30s auto-roll.
Every move is broadcast as lastMove {seat, roll, from, landed, to, bounced,
via} so clients can animate and tests can independently recompute the physics.

Run: npm install && node server.js  (PORT, TURN_MS, BOT_MS, BASE_PATH)
Deployed at needasix.com/snakes behind the arcade proxy (BASE_PATH=/snakes).
