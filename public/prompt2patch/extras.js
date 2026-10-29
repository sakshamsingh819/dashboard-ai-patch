(function(){
"use strict";
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],sleep=ms=>new Promise(r=>setTimeout(r,ms));
const css=`body.notimer #clock,body.notimer .bar,body.notimer #label{visibility:hidden}
body.lamp::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:2;background:radial-gradient(ellipse at 50% 100%,rgba(255,140,20,.25) 0%,rgba(255,90,0,.08) 45%,transparent 75%);box-shadow:inset 0 0 160px 40px rgba(255,160,30,.4);animation:fl 3.2s ease-in-out infinite alternate}
@keyframes fl{0%{box-shadow:inset 0 0 140px 30px rgba(255,150,20,.35);opacity:.92}100%{box-shadow:inset 0 0 220px 65px rgba(255,180,40,.55);opacity:1}}
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
$("ctrl").querySelector(".hint").insertAdjacentHTML("beforebegin",`
<div class="row">
  <button data-s="wait">🎬 Waiting</button>
  <button data-s="lamp">🪔 Lamp lighting</button>
  <button data-s="event">⚡ Event music</button>
  <button data-s="off">⏹ Silence</button>
  <button id="tmr">⏱ Timer: On</button>
  <button id="demo">🎭 Demo reveal</button>
</div>
<div class="row" id="lampControls" style="display:none;align-items:center;gap:6px;flex-wrap:wrap;background:rgba(255,140,20,.14);border:1px solid rgba(255,140,20,.4);border-radius:10px;padding:6px 12px;margin:4px 0">
  <span style="color:#ffb347;font-weight:700;font-size:12px;margin-right:2px">🪔 Situation:</span>
  <button class="sit-btn active" data-sit="flute" style="background:#ff8a1f;color:#100600;font-weight:700">🌿 Soft Flute</button>
  <button class="sit-btn" data-sit="drone">🕉️ Deep Drone & Bowls</button>
  <button class="sit-btn" data-sit="sitar">✨ Sitar & Harp</button>
  <button class="sit-btn" data-sit="custom" id="btnUploadLamp" style="border:1px dashed #ffd54a">📂 Upload / Pick MP3...</button>
  <input type="file" id="lampFilePicker" accept="audio/*" style="display:none">
</div>
`);

// Add quick MP3 upload button directly beside Mood button
if($("moodBtn") && !$("btnAnyUpload")){
  $("moodBtn").insertAdjacentHTML("afterend",`
    <button id="btnAnyUpload" title="Load and play any MP3 file from your laptop">📂 Upload MP3</button>
    <input type="file" id="anyFilePicker" accept="audio/*" style="display:none">
  `);
}

/* ---- timer show / hide ---- */
function timerShow(on){document.body.classList.toggle("notimer",!on);$("tmr").textContent="⏱ Timer: "+(on?"On":"Off")}
$("tmr").onclick=()=>timerShow(document.body.classList.contains("notimer"));
timerShow(false);

/* ---- scenes: waiting BGM -> lamp lighting -> event music ---- */
let A=null,lampStop=null,order=[],oi=0,errs=0,pending=null,armed=false,curScene="off",curMood="groove";
let curLampSit="flute",customLampAudio=null,customLampName="",customGlobalAudio=null;

function sync(){
  if(A){
    A.volume=Math.min(1,+$("vol").value/100);
    A.muted=Music.isMuted();
  }
}
$("vol").addEventListener("input",sync);
$("mute").addEventListener("click",()=>setTimeout(sync));

addEventListener("pointerdown",()=>{
  armed=true;
  $("gate").style.display="none";
  if(pending){const p=pending;pending=null;scene(p[0],p[1])}
});

function stopAll(){
  Music.stop();
  Music.setExt(false);
  if(lampStop){lampStop();lampStop=null}
  if(A){A.pause();A=null}
  document.body.classList.remove("lamp");
  $("music").textContent="♪ Music: Off";
  updateMoodBtnLabel();
}

function updateMoodBtnLabel(){
  const mb=$("moodBtn");
  if(!mb)return;
  if(curScene==="lamp"){
    const labels={flute:"Lamp: Soft Flute",drone:"Lamp: Deep Drone",sitar:"Lamp: Sitar",custom:"Lamp: Custom MP3"};
    mb.textContent=labels[curLampSit]||"Lamp: Music";
    mb.style.background="#ff8a1f";
    mb.style.color="#100600";
    mb.style.borderColor="#ffd54a";
  }else{
    mb.textContent="Mood: "+(curMood?curMood.charAt(0).toUpperCase()+curMood.slice(1):"Groove");
    mb.style.background="";
    mb.style.color="";
    mb.style.borderColor="";
  }
}

function updateLampButtons(){
  document.querySelectorAll("[data-sit]").forEach(b=>{
    const isAct=b.dataset.sit===curLampSit;
    b.style.background=isAct?"#ff8a1f":"rgba(255,138,31,.18)";
    b.style.color=isAct?"#100600":"#fff";
    b.style.borderColor=isAct?"#ffd54a":"var(--line)";
    b.style.fontWeight=isAct?"700":"600";
  });
  updateMoodBtnLabel();
}

function scene(s,mood){
  stopAll();
  curScene=s;
  if(mood)curMood=mood;
  if(!armed&&s!=="off")pending=[s,mood];
  document.querySelectorAll("[data-s]").forEach(b=>b.style.outline=b.dataset.s===s&&s!=="off"?"2px solid var(--a2)":"");
  const lc=$("lampControls");
  if(lc)lc.style.display=s==="lamp"?"flex":"none";
  if(s==="event"){Music.setMood(curMood);Music.start();$("music").textContent="♪ Music: On"}
  else if(s==="wait")wait();
  else if(s==="lamp")lamp(curLampSit);
  updateMoodBtnLabel();
}

document.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{scene(b.dataset.s);timerShow(b.dataset.s==="event")});

// Robust audio player with preloading and error/buffer tracking
function playAudioSource(src, title, isLoop){
  stopAll();
  const aud=new Audio();
  aud.src=src;
  aud.preload="auto";
  aud.loop=isLoop!==false;
  A=aud;
  sync();

  $("now").textContent="⏳ Loading "+title+"…";

  let started=false;
  const start=()=>{
    if(started||A!==aud)return;
    started=true;
    aud.play().then(()=>{
      $("now").textContent="🎵 Playing: "+title;
      $("music").textContent="♪ Music: On";
    }).catch(err=>{
      console.warn("Autoplay blocked or play error:", err);
      $("now").textContent="🔈 Click anywhere once to play: "+title;
      const onUserGesture=()=>{
        if(A===aud)aud.play().catch(()=>{});
        window.removeEventListener("pointerdown", onUserGesture);
      };
      window.addEventListener("pointerdown", onUserGesture);
    });
  };

  aud.addEventListener("canplay", start, {once:true});
  aud.addEventListener("loadeddata", start, {once:true});
  setTimeout(start, 200);

  aud.addEventListener("waiting", ()=>{
    if(A===aud)$("now").textContent="⏳ Buffering: "+title;
  });
  aud.addEventListener("playing", ()=>{
    if(A===aud)$("now").textContent="🎵 Playing: "+title;
  });
  aud.addEventListener("error", ()=>{
    if(A===aud){
      console.error("Audio playback error for", title);
      $("now").textContent="⚠ Audio format error (try standard MP3/WAV)";
    }
  });

  lampStop=()=>{
    if(A===aud){
      try{aud.pause()}catch(e){}
      A=null;
    }
  };

  return aud;
}

let customLampAudioUrl=null;

// Quick upload buttons handling
if($("btnAnyUpload")){
  $("btnAnyUpload").onclick=()=>$("anyFilePicker").click();
  $("anyFilePicker").onchange=e=>{
    const f=e.target.files&&e.target.files[0];
    if(!f)return;
    const url=URL.createObjectURL(f);
    customLampAudioUrl=url;
    customLampName=f.name;
    playAudioSource(url, f.name, true);
  };
}

if($("btnUploadLamp")){
  $("btnUploadLamp").onclick=()=>{
    if(customLampAudioUrl){
      lamp("custom");
    }else{
      $("lampFilePicker").click();
    }
  };
  $("lampFilePicker").onchange=e=>{
    const f=e.target.files&&e.target.files[0];
    if(!f)return;
    customLampAudioUrl=URL.createObjectURL(f);
    customLampName=f.name;
    $("btnUploadLamp").textContent="📂 "+(f.name.length>18?f.name.slice(0,16)+"…":f.name);
    lamp("custom");
  };
}

document.querySelectorAll("[data-sit]").forEach(b=>{
  b.onclick=()=>{
    if(b.dataset.sit==="custom"&&!customLampAudio&&!window.LAMP_TRACK){
      $("lampFilePicker").click();
      return;
    }
    lamp(b.dataset.sit);
  };
});

// Allow Mood button to cycle through lamp situations when in Lamp Lighting
const origMoodClick=$("moodBtn")?$("moodBtn").onclick:null;
if($("moodBtn")){
  $("moodBtn").onclick=()=>{
    if(curScene==="lamp"){
      const sits=["flute","drone","sitar"];
      if(customLampAudio||window.LAMP_TRACK)sits.push("custom");
      const nextSit=sits[(sits.indexOf(curLampSit)+1)%sits.length];
      lamp(nextSit);
    }else if(origMoodClick){
      origMoodClick();
      updateMoodBtnLabel();
    }
  };
}

function wait(){
  const L=window.PLAYLIST||[];errs=0;
  if(L.length){order=[];oi=0;next();return}
  Music.setMood("focus");Music.start();$("music").textContent="♪ Music: On";
}
function next(){
  const L=window.PLAYLIST;if(errs>=L.length){$("now").textContent="Could not load any track";return}
  if(oi>=order.length){order=L.map((_,i)=>i).sort(()=>Math.random()-.5);oi=0}
  const t=L[order[oi++]];A=new Audio(t.src);A.onended=next;A.onerror=()=>{errs++;next()};sync();
  A.play().catch(()=>{});$("now").textContent="🎬 "+(t.title||t.src);
}

function lamp(sit){
  if(sit)curLampSit=sit;
  stopAll();
  curScene="lamp";
  document.body.classList.add("lamp");
  const lc=$("lampControls");
  if(lc)lc.style.display="flex";
  updateLampButtons();

  // 1. If custom MP3 requested or loaded
  if(curLampSit==="custom"){
    const trackSrc=customLampAudioUrl||window.LAMP_TRACK;
    const trackName=customLampName||(window.LAMP_TRACK?window.LAMP_TRACK.split("/").pop():"Custom MP3");
    if(trackSrc){
      playAudioSource(trackSrc, trackName, true);
      $("now").textContent="🪔 Playing: "+trackName;
      $("music").textContent="♪ Music: On";
      return;
    }else{
      $("lampFilePicker").click();
      curLampSit="flute";
      updateLampButtons();
    }
  }

  // 2. Generative Indian classical raga soundscape tailored to situation
  const {ctx, out} = Music.audio();
  Music.setExt(true);

  const T = [];
  let alive = true;
  const later = (fn, ms) => T.push(setTimeout(fn, ms));

  // Master bus with warm acoustic contouring & gentle fade-in
  const bus = ctx.createGain();
  bus.gain.setValueAtTime(0.0001, ctx.currentTime);
  bus.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 1.6);

  // Warm low-pass filter to eliminate any digital treble/harshness
  const warmFilter = ctx.createBiquadFilter();
  warmFilter.type = "lowpass";
  warmFilter.frequency.value = curLampSit==="drone" ? 1800 : 2400;
  warmFilter.Q.value = 0.5;
  bus.connect(warmFilter);
  warmFilter.connect(out);

  // Lush multi-tap temple hall diffusion delay
  const dl1 = ctx.createDelay(2), dl2 = ctx.createDelay(2);
  const fb1 = ctx.createGain(), fb2 = ctx.createGain();
  const dlp1 = ctx.createBiquadFilter(), dlp2 = ctx.createBiquadFilter();

  dl1.delayTime.value = 0.46;
  dl2.delayTime.value = 0.69;
  fb1.gain.value = 0.38;
  fb2.gain.value = 0.32;
  dlp1.type = "lowpass"; dlp1.frequency.value = 1600;
  dlp2.type = "lowpass"; dlp2.frequency.value = 1300;

  dl1.connect(dlp1); dlp1.connect(fb1); fb1.connect(dl1); dlp1.connect(bus);
  dl2.connect(dlp2); dlp2.connect(fb2); fb2.connect(dl2); dlp2.connect(bus);
  fb1.connect(dl2); fb2.connect(dl1);

  const wire = g => { g.connect(bus); g.connect(dl1); g.connect(dl2); };

  // Auspicious Raga Bhupali (Bhoopali) frequencies: Sa, Re, Ga, Pa, Dha
  const sa = 146.83;
  const R = [1, 9/8, 5/4, 3/2, 5/3, 2, 9/4, 5/2];

  // --- A. Continuous Warm Ambient Tanpura Bed (Shree Drone) ---
  const droneGens = [];
  [
    { f: sa * 0.5, type: "sine", g: curLampSit==="drone" ? 0.07 : 0.05 },
    { f: sa * 0.75, type: "triangle", g: curLampSit==="drone" ? 0.045 : 0.035 },
    { f: sa, type: "sine", g: 0.045 },
    { f: sa * 1.003, type: "sine", g: 0.04 }
  ].forEach(d => {
    const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = d.type; o.frequency.value = d.f;
    lp.type = "lowpass"; lp.frequency.value = 420;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.linearRampToValueAtTime(d.g, ctx.currentTime + 2.5);
    o.connect(lp); lp.connect(g); g.connect(bus);
    o.start();
    droneGens.push({ o, g });
  });

  // --- B. Acoustic Tanpura Plucks (4 strings: Pa -> Sa -> Sa -> Low Sa) ---
  const strings = [sa * 0.75, sa, sa * 1.004, sa * 0.5];
  let sIdx = 0;
  function pluckTanpura(f, t){
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
    const g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o1.type = "sine"; o1.frequency.value = f;
    o2.type = "triangle"; o2.frequency.value = f * 2;
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(650, t);
    lp.exponentialRampToValueAtTime(220, t + 4.5);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 5.2);

    o1.connect(lp); o2.connect(lp); lp.connect(g); wire(g);
    o1.start(t); o2.start(t);
    o1.stop(t + 5.5); o2.stop(t + 5.5);
  }

  (function loopTanpura(){
    if(!alive) return;
    pluckTanpura(strings[sIdx % 4], ctx.currentTime + 0.05);
    sIdx++;
    later(loopTanpura, 2200);
  })();

  // --- C. Meditative Bansuri (Indian Bamboo Flute) - Active in "flute" mode ---
  if(curLampSit === "flute"){
    const phrases = [
      [0, 1, 2, 1, 0],
      [2, 3, 4, 3, 2],
      [3, 4, 5, 4, 3],
      [5, 4, 3, 2, 0],
      [2, 1, 0, -1, 0]
    ];
    let pIdx = 0;

    function playFluteNote(f, t, dur, nextF){
      const o = ctx.createOscillator(), oSub = ctx.createOscillator();
      const g = ctx.createGain(), lp = ctx.createBiquadFilter();
      const vib = ctx.createOscillator(), vibGain = ctx.createGain();

      o.type = "sine"; o.frequency.setValueAtTime(f, t);
      oSub.type = "sine"; oSub.frequency.setValueAtTime(f * 0.5, t);

      if(nextF){
        o.frequency.setValueAtTime(f, t + dur * 0.7);
        o.frequency.linearRampToValueAtTime(nextF, t + dur);
      }

      vib.frequency.value = 4.2;
      vibGain.gain.setValueAtTime(0, t);
      vibGain.gain.linearRampToValueAtTime(f * 0.012, t + dur * 0.8);
      vib.connect(vibGain);
      vibGain.connect(o.frequency);

      lp.type = "lowpass"; lp.frequency.value = 1750;

      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.055, t + 0.75);
      g.gain.setValueAtTime(0.055, t + dur * 0.85);
      g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.6);

      o.connect(lp); oSub.connect(lp); lp.connect(g); wire(g);
      o.start(t); oSub.start(t); vib.start(t);
      o.stop(t + dur + 0.8); oSub.stop(t + dur + 0.8); vib.stop(t + dur + 0.8);
    }

    function playFlutePhrase(){
      if(!alive) return;
      const phrase = phrases[pIdx % phrases.length];
      pIdx++;
      let noteTime = ctx.currentTime + 0.1;

      for(let i = 0; i < phrase.length; i++){
        const deg = phrase[i];
        const freq = deg < 0 ? sa * (5/6) : sa * 2 * (R[deg] || 1);
        const nextDeg = phrase[i + 1];
        const nextFreq = nextDeg !== undefined ? (nextDeg < 0 ? sa * (5/6) : sa * 2 * (R[nextDeg] || 1)) : 0;
        const noteDur = rnd(2.2, 3.2);

        playFluteNote(freq, noteTime, noteDur, nextFreq);
        noteTime += noteDur * 0.85;
      }

      const pauseMs = rnd(4500, 7500);
      later(playFlutePhrase, (noteTime - ctx.currentTime) * 1000 + pauseMs);
    }

    later(playFlutePhrase, 2600);
  }

  // --- D. Auspicious Temple Singing Bowl / Bronze Diya Bell ---
  function bellBowl(f, t){
    [1, 2.76, 5.4].forEach((m, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = "sine"; o.frequency.value = f * m;
      lp.type = "lowpass"; lp.frequency.value = 1150;

      const peak = (curLampSit==="drone" ? 0.045 : 0.035) / (i + 1);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 6.5 - i * 0.8);

      o.connect(lp); lp.connect(g); wire(g);
      o.start(t); o.stop(t + 7.0);
    });
  }

  (function loopBells(){
    if(!alive) return;
    bellBowl(sa * 2.5, ctx.currentTime + 0.1);
    later(loopBells, curLampSit==="drone" ? rnd(7000, 12000) : rnd(11000, 18000));
  })();

  // --- E. Sitar & Swarmandal Harp ---
  function sitarPluck(f, t){
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
    o.type = "triangle"; o2.type = "sine";
    o.frequency.value = f; o2.frequency.value = f * 2;
    lp.type = "lowpass"; lp.frequency.setValueAtTime(1400, t);
    lp.exponentialRampToValueAtTime(450, t + 1.8);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.035, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
    o.connect(lp); o2.connect(lp); lp.connect(g); wire(g);
    o.start(t); o2.start(t); o.stop(t + 2.4); o2.stop(t + 2.4);
  }

  function swarmandalSweep(t){
    const sweep = [0, 1, 2, 3, 4, 5];
    sweep.forEach((deg, i) => {
      const f = sa * (R[deg] || 1);
      const noteT = t + i * 0.12;
      const o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = "sine"; o.frequency.value = f * 2;
      lp.type = "lowpass"; lp.frequency.value = 1400;
      g.gain.setValueAtTime(0.0001, noteT);
      g.gain.linearRampToValueAtTime(0.025, noteT + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, noteT + 2.4);
      o.connect(lp); lp.connect(g); wire(g);
      o.start(noteT); o.stop(noteT + 2.6);
    });
  }

  if(curLampSit === "sitar"){
    const sitarNotes = [0, 2, 3, 4, 5, 4, 3, 2];
    let si = 0;
    (function loopSitar(){
      if(!alive) return;
      const deg = sitarNotes[si++ % sitarNotes.length];
      sitarPluck(sa * (R[deg] || 1) * 2, ctx.currentTime + 0.05);
      if(Math.random() < 0.35) swarmandalSweep(ctx.currentTime + 0.4);
      later(loopSitar, rnd(1800, 3200));
    })();
  } else if(curLampSit === "flute"){
    (function loopSwarmandal(){
      if(!alive) return;
      swarmandalSweep(ctx.currentTime + 0.2);
      later(loopSwarmandal, rnd(16000, 26000));
    })();
  }

  // --- F. Graceful Stop Handler ---
  lampStop = () => {
    alive = false;
    T.forEach(clearTimeout);

    try {
      bus.gain.setValueAtTime(bus.gain.value, ctx.currentTime);
      bus.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 2.0);
      droneGens.forEach(d => {
        d.g.gain.setValueAtTime(d.g.gain.value, ctx.currentTime);
        d.g.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 2.0);
        setTimeout(() => { try { d.o.stop(); } catch(e){} }, 2200);
      });
      setTimeout(() => { try { bus.disconnect(); } catch(e){} }, 2500);
    } catch(e){}
  };

  const sitLabels = {
    flute: "🪔 Lamp: Soft Flute & Tanpura",
    drone: "🕉️ Lamp: Deep Drone & Bowls (Quiet)",
    sitar: "✨ Lamp: Sitar & Swarmandal"
  };
  $("now").textContent = sitLabels[curLampSit] || "🪔 Lamp lighting";
  $("music").textContent = "♪ Music: On";
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
let lastServerScene=null,lastServerLampSit=null;
const net=ok=>{$("net").style.background=ok?"#3c6":"#f44"};
function handle(e){
  if(e.type==="hint")showHint(e.p.i);else if(e.type==="teaser")lbIntro();
  else if(e.type==="reveal")reveal(e.p.teams||[]);else if(e.type==="lbhide")lbHide();
}
function apply(s){
  // Only change scene if server scene actually changed from previous server poll!
  if(lastServerScene===null){
    lastServerScene=s.scene;
    cs=s.scene;cm=s.mood;
    scene(s.scene,s.mood);
  } else if(s.scene!==lastServerScene||(s.scene==="event"&&s.mood!==cm)){
    lastServerScene=s.scene;
    cs=s.scene;cm=s.mood;
    scene(s.scene,s.mood);
  }

  // Only change lampSit if server lampSit actually changed from previous poll (admin explicit change)!
  if(lastServerLampSit===null){
    lastServerLampSit=s.lampSit||"flute";
  } else if(s.lampSit && s.lampSit!==lastServerLampSit && curScene==="lamp"){
    lastServerLampSit=s.lampSit;
    lamp(s.lampSit);
  }

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
