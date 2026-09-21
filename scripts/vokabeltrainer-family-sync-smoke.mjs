import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const core=read('js/core.js');
const sync=read('js/family-sync.js');
const html=read('index.html');
const sw=read('sw.js');
const sql=read('supabase/vt_family_sync_v1.sql');
const architecture=read('SYNC_ARCHITECTURE.md');

const passed=[];
const assert=(value,name)=>{if(!value)throw new Error('Family sync smoke failed: '+name);passed.push(name)};
const version=core.match(/const VERSION\s*=\s*'([^']+)'/)?.[1]||'';

assert(html.includes('js/family-sync.js?v='+version),'family sync module is loaded with current app version');
assert(sw.includes("'./js/family-sync.js?v="+version+"'"),'family sync module is cached in the offline shell');
assert(html.includes("connect-src 'self' https://ilfblkqxbldkzmqczbgo.supabase.co"),'CSP allows only the configured Supabase endpoint in addition to self');
assert(sync.includes("sb_publishable_")&&!sync.includes('sb_secret_')&&!sync.includes('service_role'),'browser code contains only a publishable Supabase key');

assert(sync.includes("shared:{")&&sync.includes("'/setup'")&&sync.includes("'/progress'"),'state is split into shared, setup and progress documents');
assert(sync.includes("return key==='profile/'+cfg.profileId+'/progress'"),'child devices can write only their own progress document');
assert(sync.includes("vt_create_child_invite")&&sync.includes("vt_claim_child_invite"),'one-time child-device enrollment is implemented');
assert(sync.includes("sha256Hex(familyId+'|'")&&!/pin\s*:/.test(sync),'family PIN is derived locally and not persisted as a config field');
assert(sync.includes("p_base_revision")&&sync.includes("pushed?.conflict"),'client uses optimistic revisions and detects conflicts');

for(const table of ['vt_families','vt_devices','vt_documents','vt_invites']){
  assert(sql.includes('alter table private.'+table+' enable row level security'),'RLS enabled for '+table);
}
assert(sql.includes("extensions.crypt")&&sql.includes("extensions.gen_salt('bf',12)"),'server credentials are bcrypt protected');
assert(sql.includes("interval '15 minutes'"),'child invite lifetime is limited to 15 minutes');
assert(sql.includes("if v_ctx->>'role'='child'")&&sql.includes("'/progress'"),'server enforces child write scope');
assert(!/create or replace function public\.vt_[\s\S]{0,250}security definer/i.test(sql),'public RPC wrappers are not SECURITY DEFINER');
assert(architecture.includes('Kinderoberfläche')&&architecture.includes('Elternoberfläche'),'architecture records the separate child/parent target model');

console.log('Vokabeltrainer family sync smoke: '+passed.length+' checks passed');
for(const name of passed)console.log('✓ '+name);
