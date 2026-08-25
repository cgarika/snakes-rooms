/*
 Snakes & Ladders — physics & rules suite (proven against v1)
 Run:  BOT_MS=5 PORT=3611 node server.js   then:  node test/rules.js
 Proves: every single move's bounce math and snake/ladder teleport is
 independently recomputed and must match the server, extra roll on six,
 winner lands exactly on 100, standings ordered winner-first, and full
 bot games complete twice via rematch.
*/
const { io } = require("socket.io-client");
const URL = "http://localhost:3611";
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
const LADDERS={4:14,9:31,20:38,28:84,40:59,51:67,63:81,71:91};
const SNAKES={17:7,54:34,62:19,64:60,87:24,93:73,95:75,99:78};
const chase=(n)=>{ let g=0; while(g++<5){ if(LADDERS[n]!==undefined)n=LADDERS[n]; else if(SNAKES[n]!==undefined)n=SNAKES[n]; else break;} return n; };

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
      if (landed>100){ landed=200-lm.from-lm.roll; b=true; }
      if (landed!==lm.landed || b!==lm.bounced) s.mvErrors.push(`bounce math: ${lm.from}+${lm.roll}`);
      if (chase(landed)!==lm.to) s.mvErrors.push(`teleport math: landed ${landed} -> ${lm.to}`);
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
    console.log("PASS 2p physics — every move audited: bounce math ✓ teleports ✓ extra-roll-on-6 ✓ winner on 100, bounce seen:", A.sawBounce);
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
    console.log("ALL SNAKES TESTS PASS");
    process.exit(0);
  }catch(e){ console.error("FAIL:", e.message); process.exit(1); }
})();
