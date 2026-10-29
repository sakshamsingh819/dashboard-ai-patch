import {getState,setJ,getJ,rd,json,verify} from "./_lib.mjs";
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export default async function handler(req,res){
  const tok=(req.headers.authorization||"").replace(/^Bearer /,"");
  if(!verify(tok))return json(res,401,{error:"Not logged in"});
  try{
    const b=req.body||{},s=await getState(),now=Date.now(),T=s.timer;
    const ev=(type,p)=>{s.seq++;s.evt=[...s.evt,{id:s.seq,type,p}].slice(-12)};
    const left=()=>T.running?Math.max(0,Math.ceil((T.endAt-now)/1000)):T.left;
    const idx=clamp(+b.i|0,0,4);
    switch(b.a){
      case "get":{const seen=+(await rd(["GET","p2p:seen"]))||0;return json(res,200,{s,scores:await getJ("p2p:scores")||[],seen,now})}
      case "scene":s.scene=["wait","lamp","event","off"].includes(b.v)?b.v:"off";s.timerVisible=s.scene==="event";break;
      case "mood":s.mood=["focus","groove","hype"].includes(b.v)?b.v:"groove";break;
      case "lampSit":s.lampSit=["flute","drone","sitar"].includes(b.v)?b.v:"flute";break;
      case "timerVis":s.timerVisible=!!b.v;break;
      case "tset":{const t=clamp(+b.sec|0,1,86399);s.timer={total:t,left:t,running:false,endAt:0,ver:T.ver+1};break}
      case "tstart":if(!T.running&&T.left>0)s.timer={...T,running:true,endAt:now+T.left*1000,ver:T.ver+1};break;
      case "tpause":if(T.running)s.timer={...T,running:false,left:left(),endAt:0,ver:T.ver+1};break;
      case "treset":s.timer={...T,running:false,left:T.total,endAt:0,ver:T.ver+1};break;
      case "tadj":{const l=Math.max(0,left()+(+b.min||0)*60);s.timer={...T,left:l,total:Math.max(T.total,l),endAt:T.running?now+l*1000:0,ver:T.ver+1};break}
      case "hintPut":{const d=String(b.data||"");
        if(!/^data:image\/(jpeg|png|webp);base64,/.test(d)||d.length>900000)return json(res,400,{error:"Image too large or wrong type"});
        await rd(["SET","p2p:img:"+idx,d]);s.hints[idx]={caption:String(b.caption||"").slice(0,140),v:now};s.hintVer++;break}
      case "hintCap":if(s.hints[idx]){s.hints[idx]={...s.hints[idx],caption:String(b.caption||"").slice(0,140)};s.hintVer++}break;
      case "hintDel":await rd(["DEL","p2p:img:"+idx]);s.hints[idx]=null;s.hintVer++;break;
      case "hintSecs":s.hintSecs=clamp(+b.v|0,5,120);break;
      case "hintNow":ev("hint",{i:idx});break;
      case "scores":{const t=(Array.isArray(b.teams)?b.teams:[]).slice(0,30).map(x=>({name:String(x.name||"").slice(0,40),score:+x.score||0})).filter(x=>x.name);await setJ("p2p:scores",t);return json(res,200,{ok:true})}
      case "teaser":ev("teaser",{});break;
      case "reveal":{const t=(await getJ("p2p:scores")||[]).sort((x,y)=>y.score-x.score||x.name.localeCompare(y.name));ev("reveal",{teams:t});break}
      case "lbhide":ev("lbhide",{});break;
      default:return json(res,400,{error:"Unknown action"});
    }
    await setJ("p2p:state",s);json(res,200,{ok:true,s,now});
  }catch(e){json(res,500,{error:String(e.message)})}
}
