import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

if (!process.env.ADMIN_PASSWORD) {
  process.env.ADMIN_PASSWORD = "admin123";
}

const URL_=process.env.KV_REST_API_URL||process.env.UPSTASH_REDIS_REST_URL;
const TOK=process.env.KV_REST_API_TOKEN||process.env.UPSTASH_REDIS_REST_TOKEN;

// Local persistent/in-memory store fallback when cloud Redis is not configured
const memStore = new Map();
const DB_FILE = path.resolve(process.cwd(), ".local-db.json");
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    for (const [k, v] of Object.entries(raw)) memStore.set(k, v);
  }
} catch (e) {}

function saveLocal() {
  try {
    const obj = {};
    for (const [k, v] of memStore.entries()) obj[k] = v;
    fs.writeFileSync(DB_FILE, JSON.stringify(obj, null, 2), "utf-8");
  } catch (e) {}
}

export async function rd(cmd){
  if(URL_ && TOK){
    const r=await fetch(URL_,{method:"POST",headers:{Authorization:"Bearer "+TOK,"Content-Type":"application/json"},body:JSON.stringify(cmd)});
    const j=await r.json();if(j.error)throw new Error(j.error);return j.result;
  }
  const op = String(cmd[0]).toUpperCase();
  if (op === "GET") return memStore.has(cmd[1]) ? memStore.get(cmd[1]) : null;
  if (op === "SET") {
    memStore.set(cmd[1], String(cmd[2]));
    saveLocal();
    return "OK";
  }
  if (op === "DEL") {
    const had = memStore.delete(cmd[1]);
    if (had) saveLocal();
    return had ? 1 : 0;
  }
  return null;
}
export const getJ=async k=>{const v=await rd(["GET",k]);return v?JSON.parse(v):null};
export const setJ=(k,o)=>rd(["SET",k,JSON.stringify(o)]);
export const DEFAULT={scene:"wait",mood:"groove",timerVisible:false,timer:{total:8100,left:8100,running:false,endAt:0,ver:0},hints:[null,null,null,null,null],hintSecs:25,hintVer:0,evt:[],seq:0};
export async function getState(){return {...DEFAULT,...(await getJ("p2p:state")||{})}}
const secret=()=>crypto.createHash("sha256").update("p2p|"+(process.env.ADMIN_PASSWORD||"")).digest("hex");
export const sign=()=>{const exp=Date.now()+12*3600e3;return exp+"."+crypto.createHmac("sha256",secret()).update(String(exp)).digest("hex")};
export function verify(tok){
  if(!process.env.ADMIN_PASSWORD||!tok)return false;
  const [exp,sig]=String(tok).split(".");if(!(+exp>Date.now())||!sig)return false;
  const good=crypto.createHmac("sha256",secret()).update(exp).digest("hex");
  return sig.length===good.length&&crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(good));
}
export const json=(res,code,obj)=>{res.setHeader("Cache-Control","no-store");res.status(code).json(obj)};
