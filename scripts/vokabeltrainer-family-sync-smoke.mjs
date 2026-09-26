import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const core=read('js/core.js');
const sync=read('js/family-sync.js');
const storage=read('js/storage.js');
const pairing=read('js/device-pairing.js');
const ui=read('js/ui.js');
const css=read('css/app.css');
const app=read('js/app.js');
const html=read('index.html');
const sw=read('sw.js');
const sql=read('supabase/vt_family_sync_v1.sql');
const sqlV2=read('supabase/vt_family_sync_v2_parent_invites.sql');
const sqlV3=read('supabase/migrations/20260925205453_harden_vt_device_context_boundary.sql');
const architecture=read('SYNC_ARCHITECTURE.md');

const passed=[];
const assert=(value,name)=>{if(!value)throw new Error('Family sync smoke failed: '+name);passed.push(name)};
const version=core.match(/const VERSION\s*=\s*'([^']+)'/)?.[1]||'';

assert(html.includes('js/family-sync.js?v='+version),'family sync module is loaded with current app version');
assert(sw.includes("'./js/family-sync.js?v="+version+"'"),'family sync module is cached in the offline shell');
assert(sw.includes("'./js/device-pairing.js?v="+version+"'"),'device pairing module is cached in the offline shell');
assert(html.includes("connect-src 'self' https://ilfblkqxbldkzmqczbgo.supabase.co"),'CSP allows only the configured Supabase endpoint in addition to self');
assert(sync.includes("sb_publishable_")&&!sync.includes('sb_secret_')&&!sync.includes('service_role'),'browser code contains only a publishable Supabase key');
assert(storage.includes("if(ok)window.VTFamilySync?.markLocalChange?.()"),'every successful local persistence marks changed learning progress for family sync');

assert(sync.includes("shared:{")&&sync.includes("'/setup'")&&sync.includes("'/progress'"),'state is split into shared, setup and progress documents');
assert(sync.includes("return key==='profile/'+cfg.profileId+'/progress'"),'child devices can write only their own progress document');
assert(sync.includes("vt_create_child_invite")&&sync.includes("vt_claim_child_invite"),'one-time child-device enrollment is implemented');
assert(sync.includes("vt_create_parent_invite")&&sync.includes("vt_claim_parent_invite"),'one-time parent-device enrollment is implemented without sharing the reusable family PIN');
assert(sync.includes('function documentRank(key)')&&sync.includes("k==='shared'?0:k.endsWith('/setup')?1:k.endsWith('/progress')?2:3"),'sync has one canonical shared → setup → progress document order');
assert((sync.match(/documentRank\(a\.key\)-documentRank\(b\.key\)/g)||[]).length>=2,'initial child claim and recurring sync both load shared vocabulary before profile documents');
assert(ui.includes('Weiteres Eltern-Gerät verbinden')&&ui.includes('VTFamilySync.joinParent(id,pin'), 'parent UI can join an existing family instead of creating a duplicate family');
assert(ui.includes('familyParentJoinInvite')&&ui.includes('parentInviteTokenFromInput')&&ui.includes('VTFamilySync.claimParentInvite(invite'), 'installed parent app can consume a copied one-time QR/link invite without reusing the family PIN');
assert(ui.includes('Familie wechseln')&&ui.includes("$('#familySwitchJoinBtn').onclick=()=>openFamilySyncJoin()")&&!ui.includes("familySwitchJoinBtn').onclick=()=>{VTFamilySync.disconnectLocal()"), 'family switch preserves the existing local connection until the new join succeeds');
assert(ui.includes('familyChildBackupBtn')&&ui.includes('familyParentJoinBackupBtn'), 'child and parent pairing offer a backup before remote family data can replace local data');
assert(ui.includes('familySyncChildJoinChoiceBtn')&&ui.includes('VTFamilySync.claimChildInvite(token'), 'unpaired devices have an explicit child-device enrollment path instead of being forced through parent credentials');
assert(ui.includes('Einmal-Link oder Gerätecode')&&ui.includes('Stattdessen Familien-ID und PIN verwenden')&&ui.includes('VTFamilySync.joinParent(id,pin'), 'parent device enrollment is QR/link-first with family ID and PIN as explicit fallback');
assert(!ui.includes('function openChildDeviceInvite(){')&&ui.includes('window.openChildDeviceInvite?window.openChildDeviceInvite()'), 'guided share-link pairing from device-pairing.js is not shadowed by the obsolete raw-token UI');
assert(!ui.includes('QR-/Übernahmeschritt für die Kinder-App folgt'), 'obsolete unfinished child-pairing message is removed');
assert(css.includes('overflow-y:auto')&&css.includes('100dvh')&&css.includes('.modal-actions.stack-mobile'), 'family setup dialogs remain scrollable and actionable on compact mobile viewports');
assert(ui.includes('if(!dialog.open){')&&ui.includes("try{dialog.showModal()}catch(_e){dialog.setAttribute('open','')}" )&&ui.includes('prepareModalAccessibility(dialog)'), 'modal lifecycle tolerates already-open and fallback dialogs with accessible focus handling');
assert(css.includes('-webkit-overflow-scrolling:auto')&&css.includes('max-height:calc(100vh - 16px)'), 'iOS 15 modal scrolling and viewport fallback are present');
assert(pairing.includes("QR-Code erstellen")&&pairing.includes('familyChildQr')&&pairing.includes('shareInviteLink'),'parent UI offers QR-first child pairing with share/copy fallback');
assert(pairing.includes("claimChildInvite(token")&&pairing.includes("Dieses Gerät verbinden"),'child device can consume the invite link in one guided step');
assert(html.includes('id="iosStandaloneSyncCard"')&&html.includes('id="iosStandaloneSyncBtn"'),'iOS standalone app exposes a direct family-pairing recovery path');
assert(ui.includes('renderStandaloneSyncNotice')&&ui.includes("$('#iosStandaloneSyncBtn').onclick=openFamilySyncChildJoin"),'iOS standalone pairing notice is driven by actual sync status');
assert(pairing.includes('isIOSBrowserOutsideStandalone')&&pairing.includes('Den Link nicht in Safari verbrauchen.')&&pairing.includes('copyIosHomeInviteBtn'),'iOS Safari preserves a fresh child invite for the Home Screen app instead of consuming it in Safari');
assert(ui.includes("if(isPairedChildDevice()){toast('Dieses Kindergerät ist fest mit einem Lernprofil verbunden.'")&&ui.includes("profileBtn.disabled=lockedChild")&&ui.includes("profile-locked"),'paired child devices are locked to their assigned learner profile in both logic and UI');
assert(pairing.includes("location.hash")&&!pairing.includes("searchParams.set('childInvite'"),'invite secret is transported in the URL fragment, not the query string');
assert(app.includes('handleDeviceInviteFromUrl')&&app.includes('handleDuelInviteFromUrl'),'bootstrap detects device and duel QR deep links');
assert(sync.includes("sha256Hex(familyId+'|'")&&!/pin\s*:/.test(sync),'family PIN is derived locally and not persisted as a config field');
assert(sync.includes("p_base_revision")&&sync.includes("pushed?.conflict"),'client uses optimistic revisions and detects conflicts');
assert(sync.includes('async function resolveConflict')&&sync.includes("strategy==='local'?'local':'remote'"), 'sync exposes explicit local/cloud conflict resolution without silent overwrite');
assert(sync.includes('conflictKeys')&&ui.includes('openFamilySyncConflictResolver')&&ui.includes('Cloud übernehmen')&&ui.includes('Dieses Gerät behalten'), 'conflicts are surfaced as specific data areas with explicit resolution choices');
assert(sync.includes("code==='unauthorized'")&&sync.includes('markRevoked(cfg)')&&ui.includes('Dieses Gerät wurde aus dem Familienverbund entfernt.'), 'revoked devices stop syncing and surface a clear local warning');
assert((sync.match(/remoteFailure\(cfg,/g)||[]).length>=7, 'revoked-device handling covers sync, conflict, recovery and device-admin RPC paths');
assert(ui.includes('familyChildBackupBtn')&&ui.includes('familyParentJoinBackupBtn')&&ui.includes('familyConflictBackupBtn'), 'manual destructive family-data transitions offer an explicit backup action');
assert(pairing.includes('claimChildBackupBtn')&&pairing.includes('claimParentBackupBtn')&&pairing.includes("onclick=()=>backup()"), 'direct QR/link takeover offers backup before replacing local data');
assert(sync.includes("'avatarStyle'")&&sync.includes("'autoSpeakCorrection'"), 'profile appearance and speech-correction settings are part of synchronized setup');
assert(sync.includes('installConnectionDocuments')&&sync.includes('previousConfigRaw')&&sync.includes('restoreRawConfig(previousConfigRaw)'), 'family takeover has an explicit local state/config rollback path');
assert(sync.includes("const pulled=await rpc('vt_pull_documents'")&&!sync.includes("saveConfig(cfg);initSnapshots();await syncNow(true)"), 'manual family switch validates the new remote state before committing the new connection');
assert(sync.includes('markAllLocalDocumentsDirty'), 'full local restore can explicitly mark all writable sync documents dirty');
assert(sync.includes('snapshotsBeforeRemote=new Map(runtime.snapshots)')&&sync.includes('runtime.snapshots=snapshotsBeforeRemote'), 'failed remote persistence restores sync snapshots together with local state');
assert(ui.includes('Die aktuelle Sync-Version kann Profil-Löschungen noch nicht als Löschvorgang an alle Geräte übertragen.'), 'profile deletion is blocked instead of silently diverging while family sync is active');
assert(sqlV2.includes('private.vt_parent_invites')&&sqlV2.includes("interval '15 minutes'"),'parent invite tokens are server-side, one-time and short-lived');
assert(sqlV2.includes("role','parent'")&&sqlV2.includes('vt_claim_parent_invite_impl'),'parent invite claim creates a parent device without exposing the family PIN');
assert(pairing.includes('familyParentQr')&&pairing.includes('openParentDeviceInvite'),'connected parents can create a QR code for another parent device');
assert(html.includes('id="familySyncParentBtn"'),'settings expose the additional parent-device QR action');
assert(html.includes('js/vendor/qrcode.js?v='+version)&&html.includes('js/qr-ui.js?v='+version),'local QR generator and helper are versioned app assets');
assert(sw.includes("'./js/vendor/qrcode.js?v="+version+"'")&&sw.includes("'./js/qr-ui.js?v="+version+"'"),'QR support is cached for offline use');


for(const table of ['vt_families','vt_devices','vt_documents','vt_invites']){
  assert(sql.includes('alter table private.'+table+' enable row level security'),'RLS enabled for '+table);
}
assert(sql.includes("extensions.crypt")&&sql.includes("extensions.gen_salt('bf',12)"),'server credentials are bcrypt protected');
assert(sql.includes("interval '15 minutes'"),'child invite lifetime is limited to 15 minutes');
assert(sql.includes("if v_ctx->>'role'='child'")&&sql.includes("'/progress'"),'server enforces child write scope');
assert(!/create or replace function public\.vt_[\s\S]{0,250}security definer/i.test(sql),'public RPC wrappers are not SECURITY DEFINER');
assert(sqlV3.includes('revoke execute on function private.vt_device_context(text,text,text) from anon, authenticated, public'),'internal device-context helper is not directly executable by browser roles');
assert(architecture.includes('Kinderoberfläche')&&architecture.includes('Elternoberfläche'),'architecture records the separate child/parent target model');

console.log('Vokabeltrainer family sync smoke: '+passed.length+' checks passed');
for(const name of passed)console.log('✓ '+name);
