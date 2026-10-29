import {getState,json,rd} from "./_lib.mjs";
export default async function handler(req,res){
  try{
    const s=await getState();
    if(req.query&&req.query.p)await rd(["SET","p2p:seen",String(Date.now()),"EX","90"]);
    json(res,200,{now:Date.now(),s});
  }catch(e){json(res,500,{error:String(e.message)})}
}
