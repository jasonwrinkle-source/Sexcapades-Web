/* BOOTLOAD-FIX (F1): __sxErrLog queue stub. The P0 shell block that defines
the real logger now sits just after the boot dialog in the body, so the dialog can
paint in the first kilobytes; the small head scripts call __sxErrLog from parse-time
catch blocks, so this stub queues their early calls and the real logger drains the
queue the moment it lands. Same adoption pattern as the __sxInit queue stub. */
window.__sxErrQueue=window.__sxErrQueue||[];
if(typeof window.__sxErrLog!=="function"){window.__sxErrLog=function(where,err){window.__sxErrQueue.push([where,err]);};}

// Age-gate enforcement with a private-browsing fallback. The gate may
// return ?verified=1 when persistent storage is unavailable.
(function () {
  var host = '';
  try { host = window.location.hostname.toLowerCase(); } catch (e) { __sxErrLog("host-check", e); }
  // Gate runs only on the Sexcapades hosts: the legacy domain and
  // the sex subdomain (2026-11-16 — the gate follows the Sexcapades
  // skin). Every other host (vanilla subdomains, flex/capades.io,
  // localhost) skips the gate at boot; switching to Sexcapades
  // in-app gates via the loader instead.
  if (host !== 'sexcapades.io' && host !== 'www.sexcapades.io' && host !== 'sex.capades.io' && host !== 'www.sex.capades.io') return;
  var params = new URLSearchParams(window.location.search || '');
  var queryVerified = params.get('verified') === '1';
  var storedVerified = false;

  function storageWorks() {
    try {
      var testKey = 'sexcapades_storage_test';
      window.localStorage.setItem(testKey, '1');
      var available = window.localStorage.getItem(testKey) === '1';
      window.localStorage.removeItem(testKey);
      return available;
    } catch (e) {
      return false;
    }
  }

  function cleanGateParams() {
    params.delete('verified');
    params.delete('gate_attempt');
    var clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '') + (window.location.hash || '');
    try { window.history.replaceState(null, '', clean); } catch (e) { __sxErrLog("history-replace", e); }
  }

  function continueWithoutSaving() {
    window.__SEXCAPADES_MEMORY_ONLY = true;
    window.__SEXCAPADES_AGE_BLOCKED = false;
    document.documentElement.classList.remove('age-gate-blocked');
    var box = document.getElementById('ageGateStorageError');
    if (box) box.remove();
    cleanGateParams();
  }

  function showStorageError() {
    if (!document.body || document.getElementById('ageGateStorageError')) return;
    var box = document.createElement('main');
    box.id = 'ageGateStorageError';
    box.setAttribute('role', 'alert');
    box.style.cssText = 'min-height:100dvh;place-items:center;padding:24px;background:#151816;color:#eff2ec;font:18px/1.5 system-ui,sans-serif;text-align:center';
    box.innerHTML = '<div style="max-width:620px"><h1 style="font-size:30px;margin:0 0 12px">Age verification could not be saved</h1><p style="margin:0 0 12px">Your browser is blocking site storage, so Sexcapades cannot confirm that the age gate was completed.</p><p style="margin:0 0 20px">Allow site storage for sexcapades.io, leave private browsing, or continue for this visit without saving profiles.</p><div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><button id="ageGateRetry" type="button" style="border:1px solid #63c2c8;border-radius:8px;padding:11px 16px;background:transparent;color:#eff2ec;font:inherit;font-weight:700;cursor:pointer">Retry storage</button><button id="ageGateContinue" type="button" style="border:0;border-radius:8px;padding:11px 16px;background:#63c2c8;color:#102022;font:inherit;font-weight:700;cursor:pointer">Continue without saving</button></div><p id="ageGateRetryStatus" aria-live="polite" style="min-height:1.5em;margin:14px 0 0"></p><p style="margin:8px 0 0"><a href="/hosted/gate.html" rel="noopener" style="color:#63c2c8;font-weight:700" target="_blank">Return to age verification</a></p></div>';
    document.body.appendChild(box);
    document.getElementById('ageGateContinue').addEventListener('click', continueWithoutSaving);
    document.getElementById('ageGateRetry').addEventListener('click', function () {
      if (storageWorks()) {
        try { window.localStorage.setItem('sexcapades_age_verified', 'true'); } catch (e) { __sxErrLog("age-gate-storage", e); }
        continueWithoutSaving();
        window.__SEXCAPADES_MEMORY_ONLY = false;
      } else {
        document.getElementById('ageGateRetryStatus').textContent = 'Storage is still blocked. You can continue without saving profiles.';
      }
    });
  }

  var storageAvailable = storageWorks();
  if (storageAvailable) {
    try { storedVerified = window.localStorage.getItem('sexcapades_age_verified') === 'true'; } catch (e) { __sxErrLog("age-gate-storage", e); }
  }
  if (queryVerified) {
    if (storageAvailable) {
      try { window.localStorage.setItem('sexcapades_age_verified', 'true'); } catch (e) { __sxErrLog("age-gate-storage", e); }
    } else {
      window.__SEXCAPADES_MEMORY_ONLY = true;
    }
    cleanGateParams();
    return;
  }
  if (storedVerified) return;

  // The explicit return marker, not document.referrer, identifies a gate
  // return. Empty or stripped referrers are therefore safe for direct visits.
  var returnedFromGate = params.get('gate_attempt') === '1';
  if (!storageAvailable && returnedFromGate) {
    window.__SEXCAPADES_AGE_BLOCKED = true;
    document.documentElement.classList.add('age-gate-blocked');
    var style = document.createElement('style');
    style.textContent = 'html.age-gate-blocked body>*{display:none!important}html.age-gate-blocked #ageGateStorageError{display:grid!important}';
    document.head.appendChild(style);
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', showStorageError, { once: true });
    } else {
      showStorageError();
    }
    return;
  }
  var returnParams = new URLSearchParams(window.location.search || '');
  returnParams.set('verified', '1');
  returnParams.set('gate_attempt', '1');
  var returnUrl = window.location.pathname + '?' + returnParams.toString() + (window.location.hash || '');
  window.location.replace('/hosted/gate.html?return=' + encodeURIComponent(returnUrl));
})();

// Runtime-only layout settings. Hash values are parsed before app geometry is created.
// Spacing presets (fixed 2026-10-31): each bundle is the shipped tuning scaled by the
// factor its tooltip claims — Airy is the shipped tuning itself (spokeLen 2.6, subLen 1.2,
// pad 1.4, repulsion 0); Compact scales it ×0.9 / ×0.85 / ×0.85; Print ×0.8 / ×0.75 / ×0.65.
(function () {
  var bundles={compact:{spokeLen:2.34,subLen:1.02,pad:1.19,repulsion:0},airy:{spokeLen:2.6,subLen:1.2,pad:1.4,repulsion:0},print:{spokeLen:2.08,subLen:0.9,pad:0.91,repulsion:0}};
  var defaults={"spacing":"airy","branchOrder":"landscape-antipodal","propFan":true,"subcatOrder":true,"staggerDensity":false,"stagger":true,"expandAll":true,"crossmin":false,"nudge":false,"showRelations":false,"repulsionEnabled":false,"staticMap":false,"animations":false,"mapSliders":false,"collision":"grow","spokeLen":2.6,"subLen":1.2,"pad":1.4,"repulsion":0,"fontScale":30,"centerRingScale":10,"leafOvergrowth":100,"autoShrinkFactor":0.76,"subcatCloudShrinkFactor":0.76,"branchOverrides":{},"subcatOverrides":{},"kinkOverrides":{},"subcatAngleOffsets":{},"kinkAngleOffsets":{},"branchSpokeAutoShrink":{},"subcatSpokeAutoShrink":{},"solverMidline":"repulsion"};
  var effectiveDefaults=defaults;
  try{var savedDefaultsRaw=window.localStorage?window.localStorage.getItem("sexcapades-layout-savedDefaults"):"";if(savedDefaultsRaw){var savedDefaultsParsed=JSON.parse(savedDefaultsRaw),savedSettings=savedDefaultsParsed&&savedDefaultsParsed.settings;if(savedSettings&&typeof savedSettings==="object"){effectiveDefaults=Object.assign({},defaults);Object.keys(savedSettings).forEach(function(key){if(Object.prototype.hasOwnProperty.call(defaults,key))effectiveDefaults[key]=savedSettings[key]})}}}catch (error) { __sxErrLog("layout-saved-defaults", error); }
  var allowed={grow:1,shrink:1,both:1,off:1};
  function tokens(hash){var raw=String(hash||"").replace(/^#/,"");try{raw=decodeURIComponent(raw)}catch (error) { __sxErrLog("hash-decode", error); }return raw?raw.split("&").filter(Boolean):[]}
  function route(hash){var part=tokens(hash).find(function(item){return !/^layout-/i.test(item)});return part?"#"+part.split("?")[0]:""}
  var params={};tokens(window.location.hash).forEach(function(item){var at=item.indexOf("=");if(at<0)return;params[item.slice(0,at)]=item.slice(at+1)});
  var spacing=bundles[params["layout-spacing"]]?params["layout-spacing"]:effectiveDefaults.spacing,base=bundles[spacing];
  var numericBase=params["layout-spacing"]?base:effectiveDefaults;
  function pick(name,min,max,fallback){if(params[name]===undefined)return fallback;var value=Number(params[name]);return Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback}
  var collision=allowed[params["layout-collision"]]?params["layout-collision"]:effectiveDefaults.collision;
  var branchOrderModes={popularity:1,relations:1,"landscape-antipodal":1,stagger:1,alternate:1,subbranches:1,antipodal:1,quadrant:1,branching:1,"complexity-antipodal":1};
  var branchOrder=branchOrderModes[params["layout-branchOrder"]]?params["layout-branchOrder"]:"";
  if(!branchOrder){try{var storedBranchOrder=window.localStorage?window.localStorage.getItem("sexcapades-layout-branchOrder"):"";if(branchOrderModes[storedBranchOrder])branchOrder=storedBranchOrder}catch (error) { __sxErrLog("layout-storage", error); }}
  if(!branchOrder)branchOrder=effectiveDefaults.branchOrder;if(branchOrder==="stagger")branchOrder="landscape-antipodal";
  var branchOverrides=effectiveDefaults.branchOverrides;try{var packed=params["layout-branches"]||"";if(packed){packed=packed.replace(/-/g,"+").replace(/_/g,"/");while(packed.length%4)packed+="=";branchOverrides=JSON.parse(decodeURIComponent(escape(atob(packed))))||{}}}catch(error){branchOverrides={}}function unpackLayoutGroup(token){try{var raw=params[token]||"";if(!raw)return null;raw=raw.replace(/-/g,"+").replace(/_/g,"/");while(raw.length%4)raw+="=";var parsed=JSON.parse(decodeURIComponent(escape(atob(raw))));return parsed&&typeof parsed==="object"?parsed:null}catch(error){return null}}var subcatOverridesPacked=unpackLayoutGroup("layout-subcatOverrides"),kinkOverridesPacked=unpackLayoutGroup("layout-kinkOverrides"),subcatAngleOffsetsPacked=unpackLayoutGroup("layout-subcatAngleOffsets"),kinkAngleOffsetsPacked=unpackLayoutGroup("layout-kinkAngleOffsets"),branchSpokeAutoShrinkPacked=unpackLayoutGroup("layout-branchSpokeAutoShrink"),subcatSpokeAutoShrinkPacked=unpackLayoutGroup("layout-subcatSpokeAutoShrink");window.__SEXCAPADES_LAYOUT={spacing:spacing,stagger:params["layout-stagger"]===undefined?effectiveDefaults.stagger:params["layout-stagger"]==="1",expandAll:params["layout-expandAll"]===undefined?effectiveDefaults.expandAll:params["layout-expandAll"]==="1",collision:collision,crossmin:params["layout-crossmin"]===undefined?effectiveDefaults.crossmin:params["layout-crossmin"]==="1",solverMidline:params["layout-solverMidline"]===undefined?effectiveDefaults.solverMidline:params["layout-solverMidline"],nudge:params["layout-nudge"]===undefined?effectiveDefaults.nudge:params["layout-nudge"]==="1",showRelations:params["layout-showRelations"]===undefined?effectiveDefaults.showRelations:params["layout-showRelations"]==="1",spokeLen:pick("layout-spokeLen",.65,5.2,numericBase.spokeLen),subLen:pick("layout-subLen",.5,2,numericBase.subLen),pad:pick("layout-pad",0,2,numericBase.pad),repulsion:pick("layout-repulsion",0,2,numericBase.repulsion),fontScale:pick("layout-fontScale",1,500,effectiveDefaults.fontScale),centerRingScale:pick("layout-centerRingScale",3,500,effectiveDefaults.centerRingScale),leafOvergrowth:pick("layout-leafOvergrowth",100,500,effectiveDefaults.leafOvergrowth),autoShrinkFactor:pick("layout-autoShrinkFactor",.25,1,effectiveDefaults.autoShrinkFactor),subcatCloudShrinkFactor:pick("layout-subcatCloudShrinkFactor",.25,1,effectiveDefaults.subcatCloudShrinkFactor),repulsionEnabled:params["layout-repulsionEnabled"]===undefined?effectiveDefaults.repulsionEnabled:params["layout-repulsionEnabled"]!=="0",staticMap:params["layout-staticMap"]===undefined?effectiveDefaults.staticMap:params["layout-staticMap"]==="1",animations:params["layout-animations"]===undefined?effectiveDefaults.animations:params["layout-animations"]==="1",branchOrder:branchOrder,propFan:params["layout-propFan"]===undefined?effectiveDefaults.propFan:params["layout-propFan"]==="1",subcatOrder:params["layout-subcatOrder"]===undefined?effectiveDefaults.subcatOrder:params["layout-subcatOrder"]==="1",staggerDensity:params["layout-staggerDensity"]===undefined?effectiveDefaults.staggerDensity:params["layout-staggerDensity"]!=="0",branchOverrides:branchOverrides,subcatOverrides:subcatOverridesPacked!==null?subcatOverridesPacked:(effectiveDefaults.subcatOverrides||{}),kinkOverrides:kinkOverridesPacked!==null?kinkOverridesPacked:(effectiveDefaults.kinkOverrides||{}),subcatAngleOffsets:subcatAngleOffsetsPacked!==null?subcatAngleOffsetsPacked:(effectiveDefaults.subcatAngleOffsets||{}),kinkAngleOffsets:kinkAngleOffsetsPacked!==null?kinkAngleOffsetsPacked:(effectiveDefaults.kinkAngleOffsets||{}),branchSpokeAutoShrink:branchSpokeAutoShrinkPacked!==null?branchSpokeAutoShrinkPacked:(effectiveDefaults.branchSpokeAutoShrink||{}),subcatSpokeAutoShrink:subcatSpokeAutoShrinkPacked!==null?subcatSpokeAutoShrinkPacked:(effectiveDefaults.subcatSpokeAutoShrink||{})};
  var hasLayoutParams=Object.keys(params).some(function(key){return /^layout-/i.test(key)});
  window.__SEXCAPADES_LAYOUT_FROM_URL=hasLayoutParams;
  if(!hasLayoutParams){window.__SEXCAPADES_LAYOUT.spacing=effectiveDefaults.spacing;window.__SEXCAPADES_LAYOUT.stagger=effectiveDefaults.stagger;window.__SEXCAPADES_LAYOUT.expandAll=effectiveDefaults.expandAll;window.__SEXCAPADES_LAYOUT.spokeLen=effectiveDefaults.spokeLen;window.__SEXCAPADES_LAYOUT.subLen=effectiveDefaults.subLen;window.__SEXCAPADES_LAYOUT.pad=effectiveDefaults.pad;window.__SEXCAPADES_LAYOUT.repulsion=effectiveDefaults.repulsion;window.__SEXCAPADES_LAYOUT.repulsionEnabled=effectiveDefaults.repulsionEnabled;window.__SEXCAPADES_LAYOUT.fontScale=effectiveDefaults.fontScale;window.__SEXCAPADES_LAYOUT.centerRingScale=effectiveDefaults.centerRingScale;window.__SEXCAPADES_LAYOUT.leafOvergrowth=effectiveDefaults.leafOvergrowth;window.__SEXCAPADES_LAYOUT.subcatOverrides=effectiveDefaults.subcatOverrides||{};window.__SEXCAPADES_LAYOUT.kinkOverrides=effectiveDefaults.kinkOverrides||{};window.__SEXCAPADES_LAYOUT.subcatAngleOffsets=effectiveDefaults.subcatAngleOffsets||{};window.__SEXCAPADES_LAYOUT.kinkAngleOffsets=effectiveDefaults.kinkAngleOffsets||{}}
  window.__SEXCAPADES_LAYOUT_DEFAULTS=defaults;
  if(!window.__SEXCAPADES_LAYOUT.animations)document.documentElement.classList.add("le-anim-off");
  window.__SEXCAPADES_LAYOUT_BUNDLES=bundles;
  window.__SEXCAPADES_LAYOUT_ROUTE=route;
  if(window.__sxSyncMapFontBase)window.__sxSyncMapFontBase();
  if(window.__SEXCAPADES_LAYOUT.centerRingScale&&window.__SEXCAPADES_LAYOUT.centerRingScale!==1)document.addEventListener("DOMContentLoaded",function(){var ecr=document.querySelector(".empty-center-ring");if(ecr)ecr.setAttribute("r",String(133*window.__SEXCAPADES_LAYOUT.centerRingScale))});
})();

// Resolve supported deep links before the document can paint.
window.__SEXCAPADES_START_ROUTE=(function(){
  var fragment=String(window.__SEXCAPADES_LAYOUT_ROUTE?window.__SEXCAPADES_LAYOUT_ROUTE(window.location.hash):window.location.hash||'');
  try{fragment=decodeURIComponent(fragment)}catch (error) { __sxErrLog("hash-decode", error); }
  if(fragment&&!/^#\/?app\/?$/i.test(fragment)&&!/^#\/?(app\/)?(?:list|listview)\/?$/i.test(fragment)&&!/^#\/?app\/(?:map|mapview)\/?$/i.test(fragment)&&!/^#\/?(?:app\/)?(?:import(?:\/scan)?|scan)\/?$/i.test(fragment))return '';
  if(/^#\/?(app\/)?(?:list|listview)\/?$/i.test(fragment))document.documentElement.classList.add('route-listview-pending');
  return fragment||'#app';
})();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function (e) { __sxErrLog("service-worker", e); });
  });
}
