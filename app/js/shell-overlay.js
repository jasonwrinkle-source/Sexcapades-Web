(function(){
  var overlay=document.getElementById("mapLoadOverlay");
  if(!overlay){window.__sxLoad=function(){};window.__sxNodesStart=function(){};window.__sxNodeTick=function(){};return;}
  var pctEl=document.getElementById("mapLoadPct"),barEl=document.getElementById("mapLoadBarFill"),handEl=overlay.querySelector(".map-load-hand"),labelEl=overlay.querySelector(".map-load-label");
  var visible=false,done=false,nodesTotal=0,nodesDone=0;
  var sessionBoot=true,sessionMsg=null,sessionOnDone=null;
  var revealTimer=0;
  function armReveal(ms){
    clearTimeout(revealTimer);
    revealTimer=setTimeout(function(){
      if(done)return;
      visible=true;
      overlay.hidden=false;
      void overlay.offsetWidth;
      overlay.classList.add("is-visible");
    },ms);
  }
  armReveal(1000);
  var widget=window.__sxProgressWidget({pct:pctEl,bar:barEl,hand:handEl,label:labelEl,onPaint:function(v){
    if(sessionBoot&&window.__sxBootProgress)window.__sxBootProgress(v);
  }});
  function show(p){
    widget.show(p);
    if(finishing||typeof p!=="number"||p<0||p>=100||!labelEl||typeof window.__sxBootStageLabel!=="function")return;
    var text=window.__sxBootStageLabel(p);
    if(labelEl.textContent!==text)labelEl.textContent=text;
  }
  var finishing=false,finishTimer=0,expectedGroups=0,lastGroups=-1,stablePolls=0;
  var gateStartedAt=0,gatePollCount=0,gateUnlanded=false;
  window.__sxGateLastDismiss=null;
  function liveGroupCount(){
    var svg=document.getElementById("mapSvg");
    if(!svg)return 0;
    var groups=svg.querySelectorAll(".node-group[data-layout-key]:not(.layout-exit-clone)"),n=0,i,el;
    for(i=0;i<groups.length;i++){el=groups[i];if(!(el.closest&&el.closest(".sx-blit-vault")))n++;}
    return n;
  }
  function blitSettlePending(){
    try{
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.deknotter;
      if(!dk||typeof dk.blitSessionActive!=="function")return false;
      return !!dk.blitSessionActive();
    }catch(e){return false;}
  }
  function dismissOverlay(holdMs){
    overlay.classList.add("is-done");
    setTimeout(function(){overlay.hidden=true;},holdMs);
  }
  function gatePoll(){
    var count=liveGroupCount(),pending=blitSettlePending();
    if(!pending&&count>=expectedGroups){endFinish();return;}
    var raster=document.querySelector("#mapSvg .sx-blit-raster");
    if(!pending&&!raster&&count===lastGroups){stablePolls++;}else{stablePolls=0;}
    lastGroups=count;
    if(!pending&&!raster&&stablePolls>=12){endFinish();return;}
    gatePollCount++;
    if(gateStartedAt&&Date.now()-gateStartedAt>=120000){gateUnlanded=true;endFinish();}
  }
  function endFinish(){
    if(finishTimer){clearInterval(finishTimer);finishTimer=0;}
    finishing=false;
    var unlanded=gateUnlanded;
    window.__sxGateLastDismiss=unlanded?"failsafe-unlanded":"landed";
    gateStartedAt=0;gatePollCount=0;gateUnlanded=false;
    if(unlanded){
      if(labelEl)labelEl.textContent="Dismissed over an unlanded settle — the map may not have finished settling.";
    }else if(sessionMsg&&labelEl)labelEl.textContent=sessionMsg;
    var cb=sessionOnDone;sessionOnDone=null;
    if(cb)cb();
    if(unlanded&&typeof window.__sxAutofitOnGateDismiss==="function"){try{window.__sxAutofitOnGateDismiss()}catch(e){}}
    dismissOverlay(unlanded?3200:(sessionMsg?1600:380));
  }
  function finish(abort){
    if(done)return;
    done=true;
    clearTimeout(revealTimer);
    if(sessionBoot&&window.__sxBootFinish)window.__sxBootFinish(abort);
    if(!abort&&!sessionBoot&&visible){
      widget.show(100);
      finishing=true;
      expectedGroups=liveGroupCount();
      lastGroups=-1;stablePolls=0;
      gateStartedAt=Date.now();gatePollCount=0;gateUnlanded=false;
      if(labelEl)labelEl.textContent="Finishing…";
      if(finishTimer)clearInterval(finishTimer);
      finishTimer=setInterval(gatePoll,250);
      return;
    }
    if(!abort&&!sessionBoot&&sessionMsg&&labelEl)labelEl.textContent=sessionMsg;
    var cb=sessionOnDone;sessionOnDone=null;
    if(cb)cb();
    if(!visible)return;
    if(!abort)widget.show(100);
    dismissOverlay(abort?60:((!sessionBoot&&sessionMsg)?1600:380));
  }
  window.__sxLoad=function(p){
    if(done||typeof p!=="number")return;
    if(p<0){finish(true);return;}
    if(p>=100){finish(false);return;}
    show(p);
  };
  window.__sxNodesStart=function(total){
    if(done)return;
    if(typeof total==="number"&&total>0){nodesTotal=total;nodesDone=0;}
    show(12);
  };
  window.__sxNodeTick=function(){
    if(done||!nodesTotal)return;
    nodesDone++;
    show(12+76*(nodesDone/nodesTotal));
  };
  window.__sxLoadSessionStart=function(opts){
    if(!done)return false;
    sessionBoot=false;
    done=false;
    visible=false;
    nodesTotal=0;
    nodesDone=0;
    sessionMsg=(opts&&typeof opts.msg==="string"&&opts.msg)?opts.msg:null;
    sessionOnDone=(opts&&typeof opts.onDone==="function")?opts.onDone:null;
    if(finishTimer){clearInterval(finishTimer);finishTimer=0;}
    finishing=false;lastGroups=-1;stablePolls=0;
    gateStartedAt=0;gatePollCount=0;gateUnlanded=false;
    if(labelEl)labelEl.textContent=(opts&&typeof opts.label==="string"&&opts.label)?opts.label:(opts&&typeof opts.msg==="string"&&opts.msg)?opts.msg:"Building your map…";
    overlay.classList.remove("is-done");
    widget.reset();
    visible=true;
    overlay.hidden=false;
    void overlay.offsetWidth;
    overlay.classList.add("is-visible");
    return true;
  };
})();

(function(){
  /* #9 MID-SESSION PILL SESSION API */
  var pill=null,elapsedEl=null;
  function pillEls(){
    if(!pill){pill=document.getElementById("sxPill");elapsedEl=document.getElementById("sxPillElapsed");}
    return pill;
  }
  var current=null,seq=0,tickTimer=0,startedAt=0;
  function clearBtn(btn){
    if(!btn)return;
    btn.classList.remove("is-busy");
    btn.classList.remove("sx-pill-btn-busy");
    btn.removeAttribute("aria-busy");
  }
  function stopTick(){if(tickTimer){clearInterval(tickTimer);tickTimer=0;}}
  function tick(){
    var secs=(Date.now()-startedAt)/1000;
    if(secs>=1&&elapsedEl){elapsedEl.hidden=false;elapsedEl.textContent=secs.toFixed(1)+"s";}
  }
  window.__sxPillSessionStart=function(opts){
    if(!pillEls())return null;
    if(current)clearBtn(current.button);
    stopTick();
    seq+=1;
    var token={id:seq,button:(opts&&opts.button)?opts.button:null};
    current=token;
    startedAt=Date.now();
    if(elapsedEl){elapsedEl.hidden=true;elapsedEl.textContent="";}
    if(token.button){
      token.button.classList.add("is-busy");
      token.button.classList.add("sx-pill-btn-busy");
      token.button.setAttribute("aria-busy","true");
    }
    pill.hidden=false;
    void pill.offsetWidth;
    pill.classList.add("is-visible");
    tickTimer=setInterval(tick,100);
    return token;
  };
  window.__sxPillSessionFinish=function(token){
    if(!current||token!==current)return;
    var btn=current.button;
    current=null;
    stopTick();
    clearBtn(btn);
    if(pill){pill.classList.remove("is-visible");pill.hidden=true;}
    if(elapsedEl){elapsedEl.hidden=true;elapsedEl.textContent="";}
  };
})();
