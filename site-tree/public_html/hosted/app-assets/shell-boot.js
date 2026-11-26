/* F5: ONE progress-widget component paints both progress instances (the
   boot dialog below and the map loading overlay). */
window.__sxProgressWidget=function(refs){
  var shown=0;
  function render(){
    if(refs.pct)refs.pct.textContent=shown+"%";
    if(refs.bar)refs.bar.style.width=shown+"%";
    if(refs.hand)refs.hand.style.transform="rotate("+(shown*3.6)+"deg)";
    if(refs.onPaint)refs.onPaint(shown);
  }
  return {
    show:function(p){p=Math.round(p);if(p>shown){shown=p;render();}},
    render:render,
    reset:function(){shown=0;render();},
    value:function(){return shown;}
  };
};

(function(){
  var dialog=document.getElementById("sxBootDialog");
  if(!dialog)return;
  var pctEl=document.getElementById("sxBootPct"),barEl=document.getElementById("sxBootBarFill"),labelEl=document.getElementById("sxBootLabel"),handEl=dialog.querySelector(".sx-boot-hand");
  var t0=(window.performance&&typeof performance.now==="function")?performance.now():Date.now();
  var dismissed=false,finishing=false,engineReported=false;
  var reduced=!!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches);
  function nowMs(){return (window.performance&&typeof performance.now==="function")?performance.now():Date.now();}
  var SX_BOOT_DOWNLOAD_END=40;
  function sxBootComposeEngine(p){return SX_BOOT_DOWNLOAD_END+(100-SX_BOOT_DOWNLOAD_END)/100*p;}
  function sxSetBootLabel(text){if(labelEl)labelEl.textContent=text;}
  function sxBootStageLabel(p){
    if(p>=98)return "Opening the hypermap";
    if(p>=96)return "Framing the map and writing the summary";
    if(p>=93)return "Installing topic controls and name labels";
    if(p>=90)return "Drawing the branches and settling the spokes";
    if(p>=12)return "Placing each topic on the hypermap";
    return "Reading the topic index";
  }
  window.__sxBootStageLabel=sxBootStageLabel;
  var SX_BOOT_CHUNK_BUDGET=50;
  window.__sxBootChunkPaint=SX_BOOT_CHUNK_BUDGET;
  var widget=window.__sxProgressWidget({pct:pctEl,bar:barEl,hand:handEl,label:labelEl});
  window.__sxBootProgress=function(p){
    if(dismissed||finishing||typeof p!=="number")return;
    armFailTimer();
    engineReported=true;
    sxSetBootLabel(sxBootStageLabel(p));
    raise(sxBootComposeEngine(p));
  };
  function raise(v){
    if(dismissed||finishing)return;
    widget.show(Math.min(100,v));
  }
  function setBusyFalse(){
    var main=document.querySelector("main.shell");
    if(main)main.setAttribute("aria-busy","false");
  }
  function hideNow(){
    dismissed = true;
    dialog.classList.add("is-done");
    dialog.hidden = true;
  }
  function revealFallback(){
    if(document.querySelectorAll(".node-group").length>0)return;
    var fb=document.getElementById("mapSafeFallback");
    if(fb){fb.hidden=false;return;}
    document.addEventListener("DOMContentLoaded",function(){revealFallback();});
  }
  var sxFbObs=null;
  function sxHideStaleFallback(){
    if(!document.querySelector(".node-group"))return;
    var fb=document.getElementById("mapSafeFallback");
    if(fb&&!fb.hidden)fb.hidden=true;
    if(sxFbObs){sxFbObs.disconnect();sxFbObs=null;}
  }
  if(window.MutationObserver){
    sxFbObs=new MutationObserver(sxHideStaleFallback);
    sxFbObs.observe(document.documentElement,{childList:true,subtree:true});
  }
  document.addEventListener("DOMContentLoaded",sxHideStaleFallback);
  function dismiss(abort){
    if(dismissed||finishing)return;
    finishing=true;
    clearTimeout(failTimer);
    widget.show(100);
    if (abort) {
      revealFallback();
      hideNow();
      return;
    }
    hideNow();
  }
  window.__sxBootFinish=function(abort){dismiss(!!abort);};
  function fail(){
    if(dismissed||finishing)return;
    dismiss(true);
  }
  var failTimer=null;
  function armFailTimer(){
    if(dismissed||finishing)return;
    clearTimeout(failTimer);
    failTimer=setTimeout(fail,12000);
  }
  document.addEventListener("DOMContentLoaded",armFailTimer);
  var SX_BOOT_FILES={
    bootstrap:{patterns:[/\/data-bootstrap\.js(\?|#|$)/,/\/app-data\.embedded\.js(\?|#|$)/],stream:true},
    appjs:{patterns:[/\/app\.js(\?|#|$)/],stream:true},
    css:{patterns:[/\/app\.css(\?|#|$)/],stream:false},
    qrcode:{patterns:[/\/qrcode\.min\.js(\?|#|$)/,/\/qrcode\.bundle\.js(\?|#|$)/],stream:false}
  };
  var SX_BOOT_FILE_ORDER=["bootstrap","appjs","css","qrcode"];
  function sxBootFileKey(src){
    if(!src)return null;
    for(var i=0;i<SX_BOOT_FILE_ORDER.length;i++){
      var entry=SX_BOOT_FILES[SX_BOOT_FILE_ORDER[i]],pats=entry.patterns;
      for(var j=0;j<pats.length;j++)if(pats[j].test(src))return SX_BOOT_FILE_ORDER[i];
    }
    return null;
  }
  function sxBootIsStreamKey(key){return !!(key&&SX_BOOT_FILES[key]&&SX_BOOT_FILES[key].stream);}
  window.__sxBootFileKey=sxBootFileKey;
  window.__sxBootStreamKey=function(key){return sxBootIsStreamKey(key);};
  window.__sxBootStreamKeys=function(){return SX_BOOT_FILE_ORDER.filter(sxBootIsStreamKey);};
  var SX_BUNDLE_BYTES={html:2710219,css:288122,appjs:410465,qrcode:25766,bootstrap:1802650};/* BOOTLOAD-FIX size table: stamped at build close */
  var SX_BUNDLE_TOTAL=0;for(var sxBk in SX_BUNDLE_BYTES)SX_BUNDLE_TOTAL+=SX_BUNDLE_BYTES[sxBk];
  var sxDlBytes=0,sxDlFired={};
  var sxStream={};
  function sxStreamOwned(key){
    return !!(sxBootIsStreamKey(key)&&window.__sxBootStreamActive&&window.__sxBootStreamActive[key]);
  }
  function sxAllDownloadsDone(){
    for(var sxAk in SX_BUNDLE_BYTES){
      if(sxAk==="html")continue;
      if(sxDlFired[sxAk])continue;
      if(sxStream[sxAk]&&sxStream[sxAk].done)continue;
      return false;
    }
    return true;
  }
  function sxBootDownloadLabel(key){
    if(key==="bootstrap")return "Downloading the topic catalog";
    if(key==="appjs")return "Downloading the map program";
    if(key==="css")return "Downloading the styling";
    if(key==="qrcode")return "Downloading the QR code tool";
    if(key==="html")return "Downloading the page";
    return "Downloading the page files";
  }
  function sxNoteDownload(key){
    if(dismissed||finishing||engineReported||!key)return;
    sxSetBootLabel(sxBootDownloadLabel(key));
  }
  function sxDlRaise(){
    var bytes=sxDlBytes;
    for(var sxSk in sxStream){
      var sxSs=sxStream[sxSk],sxSw=SX_BUNDLE_BYTES[sxSk]||0;
      if(sxSs.done)bytes+=sxSw;
      else if(sxSs.total>0&&sxSs.loaded>0)bytes+=sxSw*Math.min(sxSs.loaded,sxSs.total)/sxSs.total;
    }
    if(SX_BUNDLE_TOTAL>0)raise(bytes/SX_BUNDLE_TOTAL*SX_BOOT_DOWNLOAD_END);
    if(!dismissed&&!finishing&&!engineReported&&labelEl&&document.readyState==="loading"&&sxAllDownloadsDone())sxSetBootLabel("Opening the page and the verse book");
  }
  function sxMilestone(key){
    if(!key||sxDlFired[key])return;
    if(sxStreamOwned(key))return;
    sxDlFired[key]=true;
    sxDlBytes+=SX_BUNDLE_BYTES[key]||0;
    sxNoteDownload(key);
    sxDlRaise();
  }
  window.__sxBootStreamProgress=function(key,loaded,total){
    if(dismissed||finishing)return;
    if(!sxBootIsStreamKey(key))return;
    var s=sxStream[key]||(sxStream[key]={loaded:0,total:0,done:false});
    if(typeof loaded==="number"&&loaded>s.loaded)s.loaded=loaded;
    if(typeof total==="number"&&total>0)s.total=total;
    if(s.total>0&&s.loaded>=s.total)s.done=true;
    sxNoteDownload(key);
    sxDlRaise();
  };
  window.__sxBootStreamDone=function(key){
    if(!sxBootIsStreamKey(key))return;
    var s=sxStream[key]||(sxStream[key]={loaded:0,total:0,done:false});
    s.done=true;
    if(!dismissed&&!finishing)sxDlRaise();
  };
  function sxResKey(src){
    return sxBootFileKey(src);
  }
  if(window.PerformanceObserver){
    try{
      var sxPo=new PerformanceObserver(function(list){var es=list.getEntries();for(var i=0;i<es.length;i++)sxMilestone(sxResKey(es[i].name));});
      sxPo.observe({type:"resource",buffered:true});
    }catch(sxPoErr){}
  }
  document.addEventListener("DOMContentLoaded",function(){
    if(document.querySelector("script[src*=\"app-assets/\"]")){sxMilestone("html");}
    else{for(var sxDk in SX_BUNDLE_BYTES)sxMilestone(sxDk);}
  });
  sxSetBootLabel("Downloading the page");
  var SX_BENIGN_ERROR_MESSAGES=[
    "ResizeObserver loop completed with undelivered notifications",
    "ResizeObserver loop limit exceeded",
    "Script error."
  ];
  window.addEventListener("error",function(ev){
    var target=ev&&ev.target;
    if(target&&(target.src||target.href)){
      sxMilestone(sxResKey(target.src||target.href));
      if(dismissed||finishing)return;
      if(target.tagName==="SCRIPT"){
        var src=target.src||target.getAttribute&&target.getAttribute("src")||"";
        if(sxBootIsStreamKey(sxBootFileKey(src)))fail();
      }
      return;
    }
    if(dismissed||finishing)return;
    if(ev&&typeof ev.message==="string"&&ev.message&&SX_BENIGN_ERROR_MESSAGES.indexOf(ev.message)===-1)fail();
  },true);
})();

/* OPTION-A BOOT STREAM LOADER */
(function(){
  if(typeof window.fetch!=="function"||typeof window.Promise!=="function"||typeof window.TextDecoder!=="function"||typeof window.MutationObserver!=="function")return;
  var targets={
    appjs:{url:null,resolve:null,textP:null},
    bootstrap:{url:null,resolve:null,textP:null}
  };
  var failed=false;
  function arm(key){
    var t=targets[key];
    t.textP=new Promise(function(res){t.resolve=res;});
  }
  arm("appjs");arm("bootstrap");
  function fetchText(url,key){
    return fetch(url,{credentials:"same-origin"}).then(function(res){
      if(!res.ok)throw new Error("HTTP "+res.status);
      var total=parseInt(res.headers.get("content-length")||"0",10)||0;
      if(window.__sxBootStreamProgress)window.__sxBootStreamProgress(key,0,total);
      if(!res.body||typeof res.body.getReader!=="function"){
        return res.text().then(function(text){
          if(window.__sxBootStreamDone)window.__sxBootStreamDone(key);
          return text;
        });
      }
      var reader=res.body.getReader();
      var chunks=[],loaded=0;
      function pump(){
        return reader.read().then(function(r){
          if(r.done){
            var all=new Uint8Array(loaded),off=0;
            for(var c=0;c<chunks.length;c++){all.set(chunks[c],off);off+=chunks[c].byteLength;}
            if(window.__sxBootStreamDone)window.__sxBootStreamDone(key);
            return new TextDecoder().decode(all);
          }
          chunks.push(r.value);
          loaded+=r.value.byteLength;
          if(window.__sxBootStreamProgress)window.__sxBootStreamProgress(key,loaded,total);
          return pump();
        });
      }
      return pump();
    });
  }
  function keyFor(el){
    var src=el.getAttribute("src")||"";
    if(!src||/^data:/i.test(src))return null;
    var k=(typeof window.__sxBootFileKey==="function")?window.__sxBootFileKey(src):null;
    return (k&&(typeof window.__sxBootStreamKey==="function")&&window.__sxBootStreamKey(k))?k:null;
  }
  function neutralize(el){
    var key=keyFor(el);
    if(!key)return;
    var t=targets[key];
    if(t.url)return;
    t.url=el.src;
    window.__sxBootStreamActive=window.__sxBootStreamActive||{};
    window.__sxBootStreamActive[key]=true;
    el.type="text/plain";
    if(el.parentNode)el.parentNode.removeChild(el);
    fetchText(t.url,key).then(function(text){t.resolve(text);},function(){failed=true;t.resolve(null);});
  }
  var obs=new MutationObserver(function(muts){
    for(var i=0;i<muts.length;i++){
      var added=muts[i].addedNodes;
      for(var j=0;j<added.length;j++){
        var n=added[j];
        if(n.nodeType!==1)continue;
        if(n.tagName==="SCRIPT")neutralize(n);
        else if(n.querySelectorAll){
          var ss=n.querySelectorAll("script");
          for(var k=0;k<ss.length;k++)neutralize(ss[k]);
        }
      }
    }
  });
  obs.observe(document,{childList:true,subtree:true});
  var existing=document.getElementsByTagName("script");
  for(var e=0;e<existing.length;e++)neutralize(existing[e]);
  var parseDone=new Promise(function(res){
    if(document.readyState!=="loading")res();
    else document.addEventListener("DOMContentLoaded",res,{once:true});
  });
  parseDone.then(function(){
    obs.disconnect();
    if(!targets.appjs.url)targets.appjs.resolve(null);
    if(!targets.bootstrap.url)targets.bootstrap.resolve(null);
  });
  function insertSrc(url){
    if(!url)return;
    var el=document.createElement("script");
    el.src=url;
    el.async=false;
    (document.body||document.documentElement).appendChild(el);
  }
  Promise.all([targets.appjs.textP,targets.bootstrap.textP,parseDone]).then(function(vals){
    if(failed){
      if(window.__sxBootStreamActive){
        var sxStreamKeys=(typeof window.__sxBootStreamKeys==="function")?window.__sxBootStreamKeys():["appjs","bootstrap"];
        for(var sxKi=0;sxKi<sxStreamKeys.length;sxKi++){
          if(targets[sxStreamKeys[sxKi]]&&targets[sxStreamKeys[sxKi]].url)delete window.__sxBootStreamActive[sxStreamKeys[sxKi]];
        }
      }
      insertSrc(targets.appjs.url);
      insertSrc(targets.bootstrap.url);
      return;
    }
    if(vals[0]!=null){
      var appEl=document.createElement("script");
      appEl.textContent=vals[0];
      document.body.appendChild(appEl);
    }
    if(vals[1]!=null){
      var bootEl=document.createElement("script");
      bootEl.textContent=vals[1];
      document.body.appendChild(bootEl);
    }
  });
})();

// P0 refactor (Build 2026-10-18_2210): shared error logger for the shell scripts
window.__sxErrLog = function (where, err) { if (window.console && typeof window.console.warn === "function") { window.console.warn("[Sexcapades] Recovered error (" + where + "):", err); } };
if (window.__sxErrQueue && window.__sxErrQueue.length) { var __sxDrain = window.__sxErrQueue.splice(0, window.__sxErrQueue.length); for (var __sxQi = 0; __sxQi < __sxDrain.length; __sxQi++) { window.__sxErrLog(__sxDrain[__sxQi][0], __sxDrain[__sxQi][1]); } }
try { if ("scrollRestoration" in history) history.scrollRestoration = "manual"; } catch (e) { __sxErrLog("scroll-restoration", e); }
document.addEventListener('DOMContentLoaded', function () {
  var m = document.querySelector('meta[name="sexcapades-build"]');
  var t = document.querySelector('meta[name="sexcapades-build-tag"]');
  var tag = t ? t.getAttribute('content') : '';
  if (m) {
    var build = m.getAttribute('content');
    var span = document.querySelector('.app-about-version');
    if (build && span) span.textContent = 'Version 5.0 · ' + (tag && tag.indexOf('qa-') === 0 ? 'QA Build ' : 'Build ') + build;
  }
  if (t) {
    var tagSpan = document.querySelector('.app-about-buildtag');
    if (tag && tagSpan) tagSpan.textContent = tag;
  }
});
