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

    // ---- Test 3 (T1 AFK policy): own fast-clock server on 3621 ----
    {
      const { spawn } = require("child_process");
      const TURN=700, AFK=250, P=3621, URL2="http://localhost:"+P;
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
      const P=3631, URL2="http://localhost:"+P;
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
    console.log("ALL SNAKES TESTS PASS");
    process.exit(0);
  }catch(e){ console.error("FAIL:", e.message); process.exit(1); }
})();
