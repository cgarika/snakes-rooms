# Snakes & Ladders
The classic for 2-8 players, one token each, squares 0-100 on the standard
board map. Exact landing on 100 wins; overshooting bounces back. Sixes grant
an extra roll (three in a row passes the turn). Snakes and ladders apply as
teleports (chained, capped). Bots, chat, voice, rejoin, rematch, 30s auto-roll.
Every move is broadcast as lastMove {seat, roll, from, landed, to, bounced,
via} so clients can animate and tests can independently recompute the physics.

Run: npm install && node server.js  (PORT, TURN_MS, BOT_MS, BASE_PATH)
Deployed at needasix.com/snakes behind the arcade proxy (BASE_PATH=/snakes).

Boards (2026-11-07): a game is dealt one of the SHORT layouts in layouts.json (eight ladders and eight serpents, each across two or three rows, nothing touching anything, as the owner's approved pictures
draw them; a layout also in its left-right mirror where its game stays a good length), by its seed (layouts.js, board.js genBoard). short_rules.js says what a layout must be (five to seven of the eight ladders lean a column; no other line enters the box round a head, so a serpent's S can swing 0.30 to 0.45 of a square) and
tools/make-short-layouts.js makes candidates that keep it. The same file is what the app plans its serpents' paths and numbers' corners from (gamenest-unreal Tools/snakes_layouts.py).
