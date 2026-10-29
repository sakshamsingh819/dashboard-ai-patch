import {rd} from "./_lib.mjs";
export default async function handler(req,res){
  try{
    const i=+(req.query&&req.query.i);if(!(i>=0&&i<5))return res.status(400).end();
    const d=await rd(["GET","p2p:img:"+i]);if(!d)return res.status(404).end();
    const m=/^data:(image\/[a-z+.-]+);base64,(.+)$/i.exec(d);if(!m)return res.status(500).end();
    res.setHeader("Content-Type",m[1]);res.setHeader("Cache-Control","public, max-age=31536000, immutable");
    res.status(200).send(Buffer.from(m[2],"base64"));
  }catch(e){res.status(500).end()}
}
