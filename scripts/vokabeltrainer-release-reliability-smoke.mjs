import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const ci=read('.github/workflows/ci.yml');
const pages=read('.github/workflows/pages.yml');
const app=read('js/app.js');
const migrationV2=read('supabase/migrations/20260924203104_vt_family_sync_v2_parent_invites.sql');
const rateLimit=read('supabase/migrations/20260925041851_rate_limit_vt_parent_invites.sql');

const passed=[];
const assert=(v,m)=>{if(!v)throw new Error('Release reliability smoke failed: '+m);passed.push(m)};

for(const job of ['preflight:','browser-core:','browser-data:','browser-game:','test:']){
  assert(ci.includes(job),'CI contains '+job.replace(':','')+' job');
}
assert(ci.includes('ready_for_review')&&ci.includes('github.event.pull_request.draft == false'),'full browser CI is deferred until a PR is ready for review');
assert(ci.includes('needs: [preflight, browser-core, browser-data, browser-game]'),'required test check aggregates all release gates');
assert(ci.includes('name: test'),'required branch-protection context remains named test');
assert(app.includes("window.__VT_APP_READY__=true")&&app.includes("dispatchEvent(new Event('vt-app-ready'))"),'app exposes a deterministic local bootstrap boundary');
assert(pages.includes('Verify live deployment')&&pages.includes('EXPECTED_VERSION')&&pages.includes('APP_VERSION'),'Pages workflow verifies the live version after deployment');
assert(migrationV2.includes('private.vt_parent_invites')&&migrationV2.includes("interval '15 minutes'"),'deployed parent-invite migration is timestamped in the repository');
assert(rateLimit.includes("rpc/vt_create_parent_invite")&&rateLimit.includes("rpc/vt_claim_parent_invite"),'parent-invite RPCs are covered by the rate-limit migration');
assert(rateLimit.includes("v_scope := 'vt_claim_parent'")&&rateLimit.includes("v_limit := 30"),'parent-invite claim has an explicit bounded rate-limit scope');

console.log('Vokabeltrainer release reliability smoke: '+passed.length+' checks passed');
for(const name of passed)console.log('✓ '+name);
