(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],sleep=ms=>new Promise(r=>setTimeout(r,ms));
const css=`body.notimer #clock,body.notimer .bar,body.notimer #label{visibility:hidden}
body.lamp::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:2;box-shadow:inset 0 0 160px 40px rgba(255,170,40,.45);animation:fl 2.2s ease-in-out infinite alternate}
@keyframes fl{to{box-shadow:inset 0 0 230px 70px rgba(255,140,20,.7)}}
#hint,#lb{position:fixed;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;z-index:3;background:rgba(5,3,12,.93)}
#hint.on,#lb.on{display:flex}
.hc{max-width:88vw;text-align:center;animation:pop .6s cubic-bezier(.2,1.6,.4,1)}
.ht{font-family:Impact,"Arial Black",sans-serif;font-size:min(6vw,9vh);line-height:1;color:#fff;-webkit-text-stroke:2px #000;text-shadow:0 5px 0 #000;text-transform:uppercase}
.hc img{max-height:58vh;max-width:84vw;margin:2vh auto;display:block;border-radius:12px;border:4px solid var(--a);animation:kb 25s ease-out forwards}
@keyframes kb{to{transform:scale(1.04)}}
.hb{font-family:Impact,"Arial Black",sans-serif;font-size:min(3.6vw,5.4vh);line-height:1.2;color:#fff;-webkit-text-stroke:1.2px #000;text-shadow:0 3px 0 #000}
.hbar{display:block;height:8px;margin:3vh auto 0;width:60%;background:var(--a);border-radius:6px;transform-origin:left;animation:hb linear forwards}
@keyframes hb{to{transform:scaleX(0)}}@keyframes pop{from{transform:scale(.3) rotate(-6deg);opacity:0}}
.lt{font-size:min(5vw,7vh);font-weight:800;color:var(--a2);letter-spacing:.08em;text-shadow:0 0 24px rgba(255,138,31,.7);margin-bottom:3vh;text-align:center;animation:pop .8s}
.sub{font-size:min(2.4vw,3.4vh);color:#ddd;animation:qp 1.6s ease-in-out infinite}@keyframes qp{50%{opacity:.4}}
#arena{position:relative;width:86vw;height:58vh}
.tc{position:absolute;box-sizing:border-box;padding:.8vh .7vw;transition:left .45s cubic-bezier(.6,0,.2,1),top .45s cubic-bezier(.6,0,.2,1),width .9s,height .9s,opacity .8s,transform .6s}
.tc>div{height:100%;border-radius:16px;background:linear-gradient(#1b1430,#0d0a18);border:2px solid var(--line);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.8vh;text-align:center;box-shadow:0 0 30px rgba(255,138,31,.18);transition:box-shadow .3s,border-color .3s,transform .3s}
.tc i{font-style:normal;font-size:min(4vw,6vh)}.tc b{font-size:min(2.6vw,4.2vh);padding:0 .5vw;word-break:break-word}
.tc em{font-style:normal;font-size:min(3.4vw,5.6vh);color:var(--a2);font-weight:800;min-height:1.2em}
.tc.flash>div{box-shadow:0 0 60px #ffd54a;border-color:#ffd54a;transform:scale(1.06)}
.tc.out{opacity:0;transform:scale(.6)}.tc.in>div{animation:pop .6s}
.tc.win>div{border-color:#ffd54a;box-shadow:0 0 120px #ffd54a}
#gate{position:fixed;left:12px;bottom:12px;z-index:6;background:rgba(16,12,26,.9);border:1px solid var(--line);border-radius:10px;padding:6px 12px;font-size:13px}
#net{position:fixed;right:10px;bottom:10px;width:9px;height:9px;border-radius:50%;background:#888;opacity:.45;z-index:6}`;
document.head.appendChild(Object.assign(document.createElement("style"),{textContent:css}));
document.body.insertAdjacentHTML("beforeend",'<div id="hint"></div><div id="lb"></div><div id="net" title="Connection to admin"></div><div id="gate">🔈 Click anywhere once to enable sound</div>');
$("ctrl").querySelector(".hint").insertAdjacentHTML("beforebegin",'<div class="row"><button data-s="wait">🎬 Waiting</button><button data-s="lamp">🪔 Lamp lighting</button><button data-s="event">⚡ Event music</button><button data-s="off">⏹ Silence</button><button id="tmr">⏱ Timer: On</button><button id="demo">🎭 Demo reveal</button></div>');

/* ---- timer show / hide ---- */
function timerShow(on){document.body.classList.toggle("notimer",!on);$("tmr").textContent="⏱ Timer: "+(on?"On":"Off")}
$("tmr").onclick=()=>timerShow(document.body.classList.contains("notimer"));
timerShow(false);

/* ---- scenes: waiting BGM -> lamp lighting -> event music ---- */
let A=null,lampStop=null,order=[],oi=0,errs=0,pending=null,armed=false,curScene="off",curMood="groove";
function sync(){if(A){A.volume=Math.min(1,+$("vol").value/100);A.muted=Music.isMuted()}}
$("vol").addEventListener("input",sync);$("mute").addEventListener("click",()=>setTimeout(sync));
addEventListener("pointerdown",()=>{armed=true;$("gate").style.display="none";if(pending){const p=pending;pending=null;scene(p[0],p[1])}});
function stopAll(){Music.stop();Music.setExt(false);if(lampStop){lampStop();lampStop=null}if(A){A.pause();A=null}document.body.classList.remove("lamp");$("music").textContent="♪ Music: Off"}
function scene(s,mood){
  stopAll();curScene=s;if(mood)curMood=mood;if(!armed&&s!=="off")pending=[s,mood];
  document.querySelectorAll("[data-s]").forEach(b=>b.style.outline=b.dataset.s===s&&s!=="off"?"2px solid var(--a2)":"");
  if(s==="event"){Music.setMood(curMood);Music.start();$("music").textContent="♪ Music: On"}
  else if(s==="wait")wait();else if(s==="lamp")lamp();
}
document.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{scene(b.dataset.s);timerShow(b.dataset.s==="event")});
function wait(){
  const L=window.PLAYLIST||[];errs=0;
  if(L.length){order=[];oi=0;next();return}
  Music.setMood("focus");Music.start();$("music").textContent="♪ Music: On"; // soft cinematic-style BGM (generated)
}
function next(){
  const L=window.PLAYLIST;if(errs>=L.length){$("now").textContent="Could not load any track";return}
  if(oi>=order.length){order=L.map((_,i)=>i).sort(()=>Math.random()-.5);oi=0}
  const t=L[order[oi++]];A=new Audio(t.src);A.onended=next;A.onerror=()=>{errs++;next()};sync();
  A.play().catch(()=>{});$("now").textContent="🎬 "+(t.title||t.src);
}
function lamp(){ // Bhoopali-style devotional ambience: tanpura drone + temple bells + soft flute
  const {ctx,out}=Music.audio();Music.setExt(true);document.body.classList.add("lamp");
  const sa=146.83,T=[],R=[1,9/8,5/4,3/2,5/3,2,9/4,5/2];let alive=true,k=0,di=2;
  const bus=ctx.createGain();bus.connect(out);
  const dl=ctx.createDelay(1),fb=ctx.createGain();dl.delayTime.value=.42;fb.gain.value=.35;dl.connect(fb);fb.connect(dl);dl.connect(bus);
  const env=(g,t,a,p,d)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(p,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d)};
  const wire=g=>{g.connect(bus);g.connect(dl)};
  function pluck(f,t){const o=ctx.createOscillator(),o2=ctx.createOscillator(),g=ctx.createGain(),lp=ctx.createBiquadFilter();
    o.type="sawtooth";o2.type="sine";o.frequency.value=f;o2.frequency.value=f*2;lp.type="lowpass";lp.frequency.value=900;
    o.connect(lp);o2.connect(lp);lp.connect(g);env(g,t,.02,.06,2.6);wire(g);o.start(t);o2.start(t);o.stop(t+2.8);o2.stop(t+2.8)}
  function bl(f,t,p){[1,2.4,4.1].forEach((m,i)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type="sine";o.frequency.value=f*m;env(g,t,.005,p/(i+1),2.8-i*.6);wire(g);o.start(t);o.stop(t+3)})}
  function fl(f,t,d){const o=ctx.createOscillator(),l=ctx.createOscillator(),lg=ctx.createGain(),g=ctx.createGain();
    o.type="sine";o.frequency.value=f;l.frequency.value=5;lg.gain.value=f*.012;l.connect(lg);lg.connect(o.frequency);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09,t+.35);g.gain.setValueAtTime(.09,t+d);g.gain.linearRampToValueAtTime(0,t+d+.9);
    o.connect(g);wire(g);o.start(t);l.start(t);o.stop(t+d+1);l.stop(t+d+1)}
  const later=(fn,ms)=>T.push(setTimeout(fn,ms));
  const S=[sa*.75,sa,sa,sa/2];
  (function tp(){if(!alive)return;pluck(S[k++%4],ctx.currentTime+.05);later(tp,1000)})();
  (function bells(){if(!alive)return;const t=ctx.currentTime+.05;bl(sa*6,t,.1);if(Math.random()<.5)bl(sa*8,t+.35,.07);later(bells,rnd(5000,9000))})();
  later(function mel(){if(!alive)return;di=Math.max(0,Math.min(7,di+pick([-2,-1,-1,1,1,2])));fl(sa*2*R[di],ctx.currentTime+.05,rnd(1.5,3));later(mel,rnd(2500,4800))},2500);
  lampStop=()=>{alive=false;T.forEach(clearTimeout);setTimeout(()=>bus.disconnect(),3500)};
  $("now").textContent="🪔 Lamp lighting";
}


/* ---- hint images (up to 5, shown at equal intervals while the timer runs) ---- */
let ht,metaHints=[],hintSecs=25;
function hideHint(){clearTimeout(ht);$("hint").classList.remove("on")}
function showHint(i,k,n){
  const m=metaHints[i];if(!m)return;
  $("hint").innerHTML='<div class="hc"><div class="ht">'+(k?"Hint "+k+" of "+n:"Hint")+'</div><img src="/api/img?i='+i+'&v='+m.v+'" alt="" style="animation-duration:'+hintSecs+'s"><div class="hb">'+esc(m.caption||"")+'</div><i class="hbar" style="animation-duration:'+hintSecs+'s"></i></div>';
  $("hint").classList.add("on");Music.sting();clearTimeout(ht);ht=setTimeout(hideHint,hintSecs*1000);
}
let shown=new Set();
setInterval(()=>{
  if(!window.TimerAPI)return;const T=TimerAPI.get();if(!T.running||curScene!=="event")return;
  const idx=metaHints.map((h,i)=>h?i:-1).filter(i=>i>=0),n=idx.length;if(!n)return;
  const el=T.total-T.left;
  idx.forEach((i,k)=>{const at=(k+1)*T.total/(n+1),key=i+":"+metaHints[i].v;
    if(el>=at&&el<at+hintSecs&&!shown.has(key)){shown.add(key);showHint(i,k+1,n)}});
},1000);

/* ---- results reveal: names shuffle to confuse, then podium, then the winner ---- */
let run=0;
function lbHide(){run++;$("lb").classList.remove("on")}
function lbIntro(){run++;$("lb").innerHTML='<div class="lt">🏆 THE RESULTS ARE IN…</div><div class="sub">Who will take the crown?</div>';$("lb").classList.add("on");Music.sting()}
function countUp(el,v){const t0=performance.now();(function f(n){const p=Math.min(1,(n-t0)/1400);el.textContent=Math.round(v*p)+" pts";if(p<1)requestAnimationFrame(f)})(t0)}
async function reveal(teams){
  const id=++run,ok=()=>id===run,n=teams.length;if(!n){lbHide();return}
  stopAll();const L=$("lb");L.classList.add("on");
  L.innerHTML='<div class="lt" id="lt">🏆 WHO WILL WIN?</div><div id="arena"></div>';
  const ar=$("arena"),cols=Math.min(n,4),rows=Math.ceil(n/cols);
  const C=teams.map(t=>{const d=document.createElement("div");d.className="tc";d.innerHTML="<div><i></i><b></b><em></em></div>";d.querySelector("b").textContent=t.name;ar.appendChild(d);return{t,d,slot:0}});
  const grid=(c,s)=>{c.slot=s;const st=c.d.style;st.left=(s%cols)*100/cols+"%";st.top=Math.floor(s/cols)*100/rows+"%";st.width=100/cols+"%";st.height=100/rows+"%"};
  const sl=[...Array(n).keys()].sort(()=>Math.random()-.5);
  C.forEach((c,i)=>{c.d.style.transition="none";c.d.style.opacity=0;grid(c,sl[i])});
  void ar.offsetWidth;C.forEach(c=>c.d.style.transition="");Music.sting();
  C.forEach((c,i)=>setTimeout(()=>{c.d.style.opacity=1;c.d.classList.add("in")},i*120));
  await sleep(n*120+1500);if(!ok())return;
  /* shuffle, with the suspense track timed to it */
  const DUR=11;Music.tension(DUR+1.5);$("lt").textContent="🤔 WHO IS LEADING?";const t0=Date.now();
  while(Date.now()-t0<DUR*1000){
    if(!ok())return;
    const p=(Date.now()-t0)/(DUR*1000),gap=p<.65?700-520*(p/.65):180+420*((p-.65)/.35);
    if(n>1){const a=pick(C);let b=pick(C);while(b===a)b=pick(C);const sa=a.slot;grid(a,b.slot);grid(b,sa)}
    const f=pick(C);f.d.classList.add("flash");setTimeout(()=>f.d.classList.remove("flash"),gap*.8);
    await sleep(gap);
  }
  if(!ok())return;
  $("lt").textContent="🔒 LOCKING THE RESULTS…";await sleep(800);if(!ok())return;
  const top=Math.min(3,n);
  C.slice(top).forEach((c,k)=>setTimeout(()=>c.d.classList.add("out"),k*150));
  await sleep(1300);if(!ok())return;
  const P={1:[35,0,30,100],2:[3,22,30,78],3:[67,38,30,62]};
  C.slice(0,top).forEach((c,i)=>{const [l,tp,w,h]=P[i+1],s=c.d.style;s.left=l+"%";s.top=tp+"%";s.width=w+"%";s.height=h+"%";
    c.d.querySelector("i").textContent=["🥇","🥈","🥉"][i];c.d.querySelector("b").textContent="???"});
  $("lt").textContent="🥁 DRUMROLL…";await sleep(1500);
  for(let r=top;r>=1;r--){
    if(!ok())return;const c=C[r-1];
    if(r===1){await sleep(900);$("lt").textContent="AND THE WINNER IS…";Music.tension(4);await sleep(4350)}
    else{Music.roll();await sleep(1850)}
    if(!ok())return;
    c.d.querySelector("b").textContent=c.t.name;countUp(c.d.querySelector("em"),+c.t.score||0);c.d.classList.add("in");
    if(r===1){c.d.classList.add("win");Music.chime();if(window.party)window.party();$("lt").textContent="🏆 CONGRATULATIONS!"}
    else await sleep(2300);
  }
}
$("demo").onclick=()=>reveal([["Team Alpha",92],["Team Bravo",88],["Team Charlie",85],["Team Delta",77],["Team Echo",70],["Team Foxtrot",64]].map(([name,score])=>({name,score})));

/* ---- sync with the admin dashboard (polls the server every 3 s) ---- */
let off=0,lastSeq=null,tv=null,tver=-1,hv=-1,cs=null,cm=null,pn=0;
const net=ok=>{$("net").style.background=ok?"#3c6":"#f44"};
function handle(e){
  if(e.type==="hint")showHint(e.p.i);else if(e.type==="teaser")lbIntro();
  else if(e.type==="reveal")reveal(e.p.teams||[]);else if(e.type==="lbhide")lbHide();
}
function apply(s){
  if(s.scene!==cs||(s.scene==="event"&&s.mood!==cm)){cs=s.scene;cm=s.mood;scene(s.scene,s.mood)}
  if(s.timerVisible!==tv){tv=s.timerVisible;timerShow(tv)}
  if(s.timer.ver!==tver){tver=s.timer.ver;shown.clear();TimerAPI.apply(s.timer,off)}
  if(s.hintVer!==hv){hv=s.hintVer;metaHints=s.hints;shown.clear();metaHints.forEach((h,i)=>{if(h)new Image().src="/api/img?i="+i+"&v="+h.v})}
  hintSecs=s.hintSecs||25;
  if(lastSeq!==null)s.evt.filter(e=>e.id>lastSeq).forEach(handle);
  lastSeq=s.seq;
}
async function poll(){
  try{const r=await fetch("/api/state"+(pn++%5===0?"?p=1":""),{cache:"no-store"});if(!r.ok)throw 0;const j=await r.json();off=j.now-Date.now();apply(j.s);net(true)}
  catch(e){net(false)}
}
setInterval(poll,3000);poll();
document.addEventListener("keydown",e=>{if(e.target.type==="number")return;const k=e.key.toLowerCase();
  if(k==="t")$("tmr").click();else if(e.key==="Escape"){hideHint();lbHide()}});
})();
