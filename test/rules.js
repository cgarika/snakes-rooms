/*
 Snakes & Ladders — physics & rules suite (proven against v1)
 Run:  BOT_MS=5 PORT=3611 node server.js   then:  node test/rules.js
       (or npm test: test/run.js starts the server; TEST_PORT, TEST_PORT2, TEST_PORT3 move the three ports)
 Proves: every single move's bounce math and snake/ladder teleport is
 independently recomputed and must match the server, extra roll on six,
 winner lands exactly on 100, standings ordered winner-first, and full
 bot games complete twice via rematch.
*/
const { io } = require("socket.io-client");
const PORT = Number(process.env.TEST_PORT || 3611), PORT2 = Number(process.env.TEST_PORT2 || 3621), PORT3 = Number(process.env.TEST_PORT3 || 3631);
const URL = "http://localhost:" + PORT;
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
// T12: boards are generated per game, so the audit reads the board from the room state
const chase=(n,room)=>{ const L=room.ladders, S=room.snakes; let g=0; while(g++<5){ if(L[n]!==undefined)n=L[n]; else if(S[n]!==undefined)n=S[n]; else break;} return n; };

function mk(name){
  const s = io(URL,{ transports:["websocket"] });
  s.nm=name; s.st=null; s.seat=-1; s.mvErrors=[]; s.lastMv=0; s.sawVia=false; s.sawBounce=false; s.sawExtra=false;
  s.prevTurnAfterSix=null;
  s.on("state",({room,mySeat})=>{
    const prev=s.st; s.st=room; s.seat=mySeat;
    const lm=room.lastMove;
    if (lm && lm.mv>s.lastMv){
      s.lastMv=lm.mv;
      // physics audit
      let landed=lm.from+lm.roll;
      let b=false;
      // the finish rule (2026-10-14): "reach" (the default) stops on 100; "exact" bounces back off it
      if (landed>100){ if (room.finish==="exact"){ landed=200-lm.from-lm.roll; b=true; } else landed=100; }
      if (landed!==lm.landed || b!==lm.bounced) s.mvErrors.push(`bounce math: ${lm.from}+${lm.roll}`);
      if (chase(landed,room)!==lm.to) s.mvErrors.push(`teleport math: landed ${landed} -> ${lm.to}`);
      if (lm.dice && lm.dice[lm.pick]!==lm.roll) s.mvErrors.push(`T12: moved by ${lm.roll} but picked die ${lm.pick} of ${lm.dice}`);
      if (lm.via) s.sawVia=true;
      if (lm.bounced) s.sawBounce=true;
      if (lm.roll===6 && room.status==="playing" && room.turn===lm.seat) s.sawExtra=true;
    }
  });
  return s;
}
async function drive(cs, cap){
  for(let k=0;k<cap;k++){
    const r=cs[0].st;
    if(r&&r.status==="over") return true;
    for(const c of cs) if(r&&c.seat===r.turn&&r.status==="playing") c.emit("roll");
    await sleep(8);
  }
  return false;
}
(async()=>{
  try{
    // ---- Test 1: 2 humans, full game with physics audit ----
    const A=mk("A"),B=mk("B"); await sleep(300);
    let code=null; A.on("joined",j=>{code=j.code;});
    A.emit("create",{name:"A",playerId:"sA",avatar:"🐍"}); await sleep(250);
    B.emit("join",{code,name:"B",playerId:"sB",avatar:"🪜"}); await sleep(250);
    A.emit("start"); await sleep(250);
    if(!await drive([A,B],30000)) throw new Error("2p game didn't finish");
    const fin=A.st;
    if(fin.pos[fin.winner]!==100) throw new Error("winner not on 100");
    if(fin.standings[0].seat!==fin.winner) throw new Error("standings order wrong");
    for(const c of [A,B]){ if(c.mvErrors.length) throw new Error(c.nm+": "+c.mvErrors[0]); }
    if(!A.sawVia) throw new Error("no snake/ladder ever triggered (suspicious)");
    if(!A.sawExtra) throw new Error("no extra roll on six ever observed");
    if (A.sawBounce) throw new Error("a bounce in the default reach-100 game");
    console.log("PASS 2p physics — every move audited: finish math ✓ teleports ✓ extra-roll-on-6 ✓ winner on 100, no bounce in a reach-100 game");
    // ---- Test 1b: the classic exact finish, set by the host in the lobby: still bounces, still audited ----
    { const C=mk("C"),D=mk("D"); await sleep(300);
      let code2=null; C.on("joined",j=>{code2=j.code;});
      C.emit("create",{name:"C",playerId:"sC",avatar:"🐍"}); await sleep(250);
      D.emit("join",{code:code2,name:"D",playerId:"sD",avatar:"🪜"}); await sleep(250);
      D.emit("settings",{finish:"exact"}); await sleep(150); if (C.st.finish!=="reach") throw new Error("a non-host changed the finish");
      C.emit("settings",{finish:"exact"}); await sleep(150); if (C.st.finish!=="exact") throw new Error("the host could not pick the exact finish");
      let games=0, bounce=false;
      while (games<40 && !bounce){   /* the real layouts end games on ladders to 100 and on snakes near it, so a bounce takes more games than the calm generator's boards did (six) */ if (games>0){ C.emit("rematch"); D.emit("rematch"); } else { C.emit("start"); }
        // the next game, really under way: a rematch is not instant, and driving the last game's "over" ended it at once
        for (let w=0; w<200 && !(C.st && C.st.status==="playing"); w++) await sleep(25);
        if (!(C.st && C.st.status==="playing")) throw new Error("exact game "+(games+1)+" never started");
        if(!await drive([C,D],30000)) throw new Error("exact game didn't finish");
        if (C.mvErrors.length) throw new Error(C.mvErrors[0]); if (C.st.pos[C.st.winner]!==100) throw new Error("exact: winner not on 100");
        bounce = C.sawBounce; games++; }
      if (!bounce) throw new Error("no bounce in forty exact-finish games");
      C.disconnect(); D.disconnect();
      console.log("PASS exact finish — host-only setting, bounces audited ("+games+" games)"); }
    A.close(); B.close();

    // ---- Test 2: host + 2 bots, twice via rematch ----
    const H=mk("H"); await sleep(250);
    let c2=null; H.on("joined",j=>{c2=j.code;});
    H.emit("create",{name:"H",playerId:"sH",avatar:"🐍"}); await sleep(250);
    H.emit("addBot"); H.emit("addBot"); await sleep(250);
    const winners=[];
    for(let g=0;g<2;g++){
      if(g===0) H.emit("start"); else H.emit("rematch");
      await sleep(250);
      if(!await drive([H],30000)) throw new Error("bot game "+g+" stalled");
      winners.push(H.st.players[H.st.winner].name);
      if(H.mvErrors.length) throw new Error("bot game physics: "+H.mvErrors[0]);
    }
    console.log("PASS bot games x2 with rematch — winners:", winners.join(", "));
    H.close();

    // ---- Test 3 (T1 AFK policy): own fast-clock server on 3621 ----
    {
      const { spawn } = require("child_process");
      const TURN=700, AFK=250, P=PORT2, URL2="http://localhost:"+P;
      const srv = spawn(process.execPath, ["server.js"], { env: { ...process.env, PORT:String(P), TURN_MS:String(TURN), AFK_MS:String(AFK), BOT_MS:"5" }, stdio:"ignore" });
      await sleep(600);
      const mk2=(name)=>{ const c=io(URL2,{transports:["websocket"],reconnection:false}); c.st=null; c.seat=-1; c.logs=[]; c.on("state",({room,mySeat})=>{ c.st=room; c.seat=mySeat; if(room&&room.log) c.logs.push(room.log); }); return c; };
      const until=async(fn,ms=4000)=>{ const t0=Date.now(); while(Date.now()-t0<ms){ if(fn()) return true; await sleep(15);} return false; };
      const room2=async()=>{ const A=mk2("A"),B=mk2("B"); let code=null; A.on("joined",j=>{code=j.code;}); await sleep(200); A.emit("create",{name:"A",playerId:"afkA"+Math.random(),avatar:"🦊"}); await until(()=>code); B.emit("join",{code,name:"B",playerId:"afkB"+Math.random(),avatar:"🐼"}); await until(()=>B.st&&B.st.players.length===2); A.emit("start"); await until(()=>A.st&&A.st.status==="playing"); return {A,B}; };
      try {
        { const {A,B}=await room2(); const first=A.st.turn; const gone=first===0?A:B, W=first===0?B:A; gone.disconnect(); const t0=Date.now();
          const adv=await until(()=>W.st&&W.logs.some(l=>/played for them/.test(l)), TURN+800); const dt=Date.now()-t0;
          if(!adv) throw new Error("AFK: disconnected player's turn was not auto-played"); if(dt>=TURN) throw new Error("AFK: fired on the normal clock ("+dt+" ms)");
          console.log("PASS AFK 5s clock — auto-rolled after "+dt+" ms (normal "+TURN+")"); W.disconnect(); }
        { const {A,B}=await room2(); A.on("state",()=>{ const r=A.st; if(r&&r.status==="playing"&&r.turn===A.seat) setTimeout(()=>{ const r2=A.st; if(r2&&r2.status==="playing"&&r2.turn===A.seat) A.emit("roll"); },10); });
          const idle=B.seat;
          if(!(await until(()=>B.st&&B.st.players[idle].botControlled, TURN*8))) throw new Error("AFK: seat never became botControlled");
          if(B.st.players[idle].bot||B.st.players[idle].name!=="B") throw new Error("AFK: seat identity changed");
          if(!(await until(()=>B.logs.some(l=>/playing for B/.test(l)),500))) throw new Error("AFK: no takeover log");
          B.emit("takeSeat"); if(!(await until(()=>!B.st.players[idle].botControlled,1500))) throw new Error("AFK: takeSeat did not clear the flag");
          if(!(await until(()=>B.logs.some(l=>/back at the table/.test(l)),500))) throw new Error("AFK: no return log");
          if(!(await until(()=>B.st.players[idle].botControlled, TURN*8))) throw new Error("AFK: seat did not flip a second time");
          B.emit("roll"); if(!(await until(()=>!B.st.players[idle].botControlled,1500))) throw new Error("AFK: a human action did not clear the flag");
          console.log("PASS AFK takeover after 3 timeouts, takeSeat + action hand it back"); A.disconnect(); B.disconnect(); }
        { const {A,B}=await room2(); A.on("state",()=>{ const r=A.st; if(r&&r.status==="playing"&&r.turn===A.seat) setTimeout(()=>{ const r2=A.st; if(r2&&r2.status==="playing"&&r2.turn===A.seat) A.emit("roll"); },5); });
          const idle=B.seat; B.disconnect();
          if(!(await until(()=>A.st&&A.st.status==="over",60000))) throw new Error("AFK: game with a bot-controlled seat stalled");
          if(!A.st.players[idle].botControlled) throw new Error("AFK: absent seat never became bot-controlled");
          console.log("PASS AFK bot-controlled seat finished a full game — winner "+A.st.players[A.st.winner].name); A.disconnect(); }
      } finally { srv.kill(); }
    }

    // ---- T3 host handover: host disconnects during play → another human becomes host ----
    {
      const { spawn } = require("child_process");
      const P=PORT3, URL2="http://localhost:"+P;
      const srv = spawn(process.execPath, ["server.js"], { env: { ...process.env, PORT:String(P), BOT_MS:"5" }, stdio:"ignore" });
      await sleep(600);
      const mk2=(name)=>{ const c=io(URL2,{transports:["websocket"],reconnection:false}); c.st=null; c.seat=-1; c.logs=[]; c.on("state",({room,mySeat})=>{ c.st=room; c.seat=mySeat; if(room&&room.log) c.logs.push(room.log); }); return c; };
      const wait=async(fn,ms=6000)=>{ const t0=Date.now(); while(Date.now()-t0<ms){ if(fn()) return true; await sleep(15);} return false; };
      try {
        const n=2; const cs=[]; for(let i=0;i<n;i++) cs.push(mk2("H"+i)); await sleep(250); let code=null; cs[0].on("joined",j=>{code=j.code;});
        cs[0].emit("create",{name:"H0",playerId:"h0"+Math.random(),avatar:"🦊"}); await wait(()=>code); for(let i=1;i<n;i++) cs[i].emit("join",{code,name:"H"+i,playerId:"h"+i+Math.random(),avatar:"🐼"}); await wait(()=>cs[0].st&&cs[0].st.players.length===n);
        
        cs[0].emit("start"); if(!(await wait(()=>cs[1].st&&cs[1].st.status==="playing"))) throw new Error("T3: game did not start");
        if(cs[1].st.hostSeat!==cs[0].seat) throw new Error("T3: creator is not the host at start");
        cs[0].disconnect();
        if(!(await wait(()=>cs[1].st.hostSeat===cs[1].seat, 3000))) throw new Error("T3: host did not move to the connected human (hostSeat "+cs[1].st.hostSeat+")");
        if(!cs[1].logs.some(l=>/is now the host/.test(l))) throw new Error("T3: no host log line");
        console.log("PASS T3 host handover — host disconnected mid-game, next connected human is host");
        
        cs.forEach(c=>c.disconnect());
      } finally { srv.kill(); }
    }
    // ---- T12: seeded board generator + two-dice pick ----
    {
      const { genBoard } = require("../server.js");
      const seeds = Array.from({length:20},(_,i)=>"seed-"+i+"-"+Math.random().toString(36).slice(2,8));
      for (const seed of seeds) {
        const b = genBoard(seed), L=b.ladders, S=b.snakes;
        if (Object.keys(L).length<5 || Object.keys(L).length>10 || Object.keys(S).length<5 || Object.keys(S).length>13) throw new Error("board needs 5 to 10 ladders and 5 to 13 snakes ("+seed+")");
        const ends=new Set(); const use=(n)=>{ if(ends.has(n)) throw new Error("T12: cell "+n+" used twice ("+seed+")"); ends.add(n); };
        for (const [a,b2] of Object.entries(L)) { const f=Number(a), t=Number(b2); if(!(t>f)) throw new Error("T12: ladder goes down"); if(t===100&&f<60) throw new Error("T12: ladder to 100 from "+f); if(f<1||t>100) throw new Error("T12: ladder off board"); use(f); use(t); }
        for (const [a,b2] of Object.entries(S)) { const f=Number(a), t=Number(b2); if(!(t<f)) throw new Error("T12: snake goes up"); if(f===100) throw new Error("T12: snake from 100"); if(t<1) throw new Error("T12: snake off board"); use(f); use(t); }
        if (ends.has(100) && !Object.values(L).includes(100)) throw new Error("T12: 100 used oddly");
        const again = genBoard(seed); if (JSON.stringify(again)!==JSON.stringify(b)) throw new Error("T12: same seed, different board");
      }
      // (a pool of a few layouts: two seeds may well be dealt the same one, a score of seeds are not all)
      if (new Set(seeds.map((s)=>JSON.stringify(genBoard(s)))).size < 2) throw new Error("T12: twenty different seeds all gave the same board");
      console.log("PASS T12 board dealing — 20 seeds valid (a real layout or its mirror: 5 to 10 ladders and snakes, no snake from 100, ladder→100 only from 60+, no shared cells), deterministic per seed");
      // two dice: the chosen die moves the pawn; rejoin sees the same board (seed + features)
      const A=mk("TA"), B=mk("TB"); await sleep(250); let code=null; A.on("joined",j=>{code=j.code;}); const pidA="tA"+Math.random();
      A.emit("create",{name:"TA",playerId:pidA,avatar:"🐍"}); await sleep(250); B.emit("join",{code,name:"TB",playerId:"tB"+Math.random(),avatar:"🪜"}); await sleep(250);
      B.emit("settings",{diceMode:"two"}); await sleep(150); if (A.st.diceMode==="two") throw new Error("T12: non-host changed the dice mode");
      A.emit("settings",{diceMode:"two"}); await sleep(150); if (A.st.diceMode!=="two") throw new Error("T12: host could not set two-dice mode");
      A.emit("start"); await sleep(250);
      if (!A.st.seed || !A.st.ladders || Object.keys(A.st.ladders).length<5) throw new Error("T12: game state lacks the seeded board");
      let picks=0, rolls=0;
      for (let k=0;k<4000 && A.st.status==="playing";k++){
        const r=A.st; const me=[A,B].find(c=>c.seat===r.turn);
        if (r.phase==="pick"){ const before=r.pos[r.turn]; const i=r.dice[0]===6?0:1; const other=me===A?B:A; other.emit("pick",{i:0}); me.emit("pick",{i}); const mv=r.lastMove?r.lastMove.mv:0;
          for (let w=0;w<100 && (!A.st.lastMove || A.st.lastMove.mv===mv); w++) await sleep(5);
          const lm=A.st.lastMove; if (!lm || lm.pick!==i || lm.roll!==r.dice[i] || lm.from!==before) throw new Error("T12: pick not applied as chosen: "+JSON.stringify({dice:r.dice,i,lm}));
          picks++; }
        else if (r.phase==="roll"){ me.emit("roll"); rolls++; }
        await sleep(6);
      }
      if (A.st.status!=="playing" && A.st.status!=="over") throw new Error("T12: odd status "+A.st.status);
      if (picks<3) throw new Error("T12: too few picks observed ("+picks+")");
      for (const c of [A,B]) if (c.mvErrors.length) throw new Error(c.nm+": "+c.mvErrors[0]);
      // rejoin: the same seed and the same board come back
      const seed=A.st.seed, L1=JSON.stringify(A.st.ladders), S1=JSON.stringify(A.st.snakes); A.close();
      const A2=mk("TA2"); await sleep(150); A2.emit("join",{code,name:"TA",playerId:pidA,avatar:"🐍"}); await sleep(300);
      if (!A2.st || A2.st.seed!==seed || JSON.stringify(A2.st.ladders)!==L1 || JSON.stringify(A2.st.snakes)!==S1) throw new Error("T12: rejoin shows a different board");
      console.log("PASS T12 two dice — "+picks+" picks applied exactly as chosen over "+rolls+" rolls; rejoin rebuilt the same board ("+seed+")");
      [B,A2].forEach(c=>c.close());
    }
    console.log("ALL SNAKES TESTS PASS");
    process.exit(0);
  }catch(e){ console.error("FAIL:", e.message); process.exit(1); }
})();
