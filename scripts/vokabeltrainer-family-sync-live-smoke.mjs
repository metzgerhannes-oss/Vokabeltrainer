import fs from "node:fs";
import crypto from "node:crypto";

const source=fs.readFileSync("js/family-sync.js","utf8");
const url=(source.match(/const SUPABASE_URL='([^']+)'/)||[])[1];
const key=(source.match(/const SUPABASE_KEY='([^']+)'/)||[])[1];
if(!url||!key) throw new Error("Supabase-Konfiguration nicht gefunden");

const run=String(process.env.GITHUB_RUN_ID||Date.now());
const familyId=("audit_"+run).slice(0,80);
const profileId="kid001";
const parentId=("parent_"+run).slice(0,120);
const childId=("child_"+run).slice(0,120);
const parentSecret=crypto.randomBytes(32).toString("hex");
const childSecret=crypto.randomBytes(32).toString("hex");
const pin="audit-pin-2026";
const familySecretHash=crypto.createHash("sha256").update(familyId+"|"+pin).digest("hex");

function assert(cond,msg,detail){
  if(!cond) throw new Error(msg+(detail!==undefined?" :: "+JSON.stringify(detail):""));
}
async function rpc(name,args){
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),15000);
  try{
    const res=await fetch(url+"/rest/v1/rpc/"+name,{
      method:"POST",
      headers:{apikey:key,"Content-Type":"application/json"},
      body:JSON.stringify(args),
      signal:ctrl.signal
    });
    const text=await res.text();
    let data=null;
    try{data=text?JSON.parse(text):null}catch{data=text}
    if(!res.ok) throw new Error(name+" HTTP "+res.status+" :: "+JSON.stringify(data));
    if(Array.isArray(data)&&data.length===1)data=data[0];
    return data;
  } finally {
    clearTimeout(timer);
  }
}

const docs={
  shared:{schema:1,vocabulary:[{id:"audit_word",term:"amo",meaning:"lieben"}],books:[],bookVocabulary:[]},
  ["profile/"+profileId+"/setup"]:{schema:1,learner:{id:profileId,name:"Audit Kid",gradeLevel:4,activeSubjects:["latin"]},sets:[],setVocabulary:[],learnerBooks:[],grades:[]},
  ["profile/"+profileId+"/progress"]:{schema:1,learner:{id:profileId,xp:1},learnerVocabulary:[],practiceTests:[],activity:[]}
};

console.log("LIVE_FAMILY_ID="+familyId);

let r=await rpc("vt_create_family",{
  p_family_id:familyId,p_family_secret_hash:familySecretHash,p_device_id:parentId,
  p_device_secret:parentSecret,p_label:"Audit Parent",p_documents:docs
});
assert(r?.ok===true,"create family failed",r);

r=await rpc("vt_join_parent",{
  p_family_id:familyId,p_family_secret_hash:"b".repeat(64),p_device_id:"wrongdev_"+run,
  p_device_secret:crypto.randomBytes(32).toString("hex"),p_label:"Wrong Parent"
});
assert(r?.ok===false&&r?.error==="not_found","wrong family secret accepted",r);

r=await rpc("vt_create_child_invite",{
  p_family_id:familyId,p_device_id:parentId,p_device_secret:parentSecret,p_profile_id:profileId
});
assert(r?.ok===true&&typeof r?.token==="string"&&r.token.length>=32,"child invite failed",r);
const invite=r.token;

r=await rpc("vt_claim_child_invite",{
  p_invite_token:invite,p_device_id:childId,p_device_secret:childSecret,p_label:"Audit Child"
});
assert(r?.ok===true&&r?.role==="child"&&r?.profile_id===profileId,"child claim failed",r);

r=await rpc("vt_claim_child_invite",{
  p_invite_token:invite,p_device_id:"replay_"+run,p_device_secret:crypto.randomBytes(32).toString("hex"),p_label:"Replay"
});
assert(r?.ok===false&&r?.error==="invite_invalid","invite replay accepted",r);

r=await rpc("vt_pull_documents",{p_family_id:familyId,p_device_id:childId,p_device_secret:childSecret});
assert(r?.ok===true&&r?.role==="child","child pull failed",r);
const childKeys=(r.documents||[]).map(x=>x.key).sort();
assert(JSON.stringify(childKeys)===JSON.stringify([
  "profile/"+profileId+"/progress","profile/"+profileId+"/setup","shared"
].sort()),"child document scope wrong",childKeys);

r=await rpc("vt_push_document",{
  p_family_id:familyId,p_device_id:childId,p_device_secret:childSecret,
  p_doc_key:"shared",p_payload:{bad:true},p_base_revision:1
});
assert(r?.ok===false&&r?.error==="forbidden","child wrote shared doc",r);

r=await rpc("vt_push_document",{
  p_family_id:familyId,p_device_id:childId,p_device_secret:childSecret,
  p_doc_key:"profile/"+profileId+"/setup",p_payload:{bad:true},p_base_revision:1
});
assert(r?.ok===false&&r?.error==="forbidden","child wrote setup doc",r);

const updatedProgress={schema:1,learner:{id:profileId,xp:7},learnerVocabulary:[{learnerId:profileId,vocabularyId:"audit_word",mastery:1}],practiceTests:[],activity:[{kind:"audit"}]};
r=await rpc("vt_push_document",{
  p_family_id:familyId,p_device_id:childId,p_device_secret:childSecret,
  p_doc_key:"profile/"+profileId+"/progress",p_payload:updatedProgress,p_base_revision:1
});
assert(r?.ok===true&&r?.revision===2,"child progress write failed",r);

r=await rpc("vt_push_document",{
  p_family_id:familyId,p_device_id:childId,p_device_secret:childSecret,
  p_doc_key:"profile/"+profileId+"/progress",p_payload:{stale:true},p_base_revision:1
});
assert(r?.ok===false&&r?.conflict===true&&r?.revision===2,"stale revision not rejected",r);

r=await rpc("vt_pull_documents",{p_family_id:familyId,p_device_id:parentId,p_device_secret:parentSecret});
assert(r?.ok===true&&r?.role==="parent","parent pull failed",r);
const progress=(r.documents||[]).find(x=>x.key==="profile/"+profileId+"/progress");
assert(progress?.revision===2&&progress?.payload?.learner?.xp===7,"parent did not receive child progress",progress);

r=await rpc("vt_list_devices",{p_family_id:familyId,p_device_id:parentId,p_device_secret:parentSecret});
assert(r?.ok===true&&Array.isArray(r.devices)&&r.devices.length===2,"device list wrong",r);

r=await rpc("vt_revoke_device",{
  p_family_id:familyId,p_device_id:parentId,p_device_secret:parentSecret,p_target_device_id:childId
});
assert(r?.ok===true,"child revoke failed",r);

r=await rpc("vt_pull_documents",{p_family_id:familyId,p_device_id:childId,p_device_secret:childSecret});
assert(r?.ok===false,"revoked child still authorized",r);

r=await rpc("vt_pull_documents",{p_family_id:familyId,p_device_id:parentId,p_device_secret:parentSecret});
assert(r?.ok===true,"parent lost access after revoke",r);

console.log("LIVE_FAMILY_SYNC_OK familyId="+familyId);
