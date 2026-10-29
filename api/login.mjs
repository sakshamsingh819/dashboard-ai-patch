import crypto from "node:crypto";
import {sign,json} from "./_lib.mjs";
const h=s=>crypto.createHash("sha256").update(String(s)).digest();
export default function handler(req,res){
  if(req.method!=="POST")return json(res,405,{error:"POST only"});
  const pw=(req.body&&req.body.password)||"",real=process.env.ADMIN_PASSWORD||"";
  if(real&&crypto.timingSafeEqual(h(pw),h(real)))return json(res,200,{token:sign()});
  setTimeout(()=>json(res,401,{error:"Wrong password"}),700);
}
