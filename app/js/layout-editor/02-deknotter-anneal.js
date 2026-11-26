    function annealBackoutGateSetExpanded(exp){
      var wrap=document.getElementById("layoutBackoutGate");if(!wrap)return;
      wrap.classList.toggle("le-bo-expanded",!!exp);
      if(exp){var card=wrap.querySelector(".le-backout-gate-card");if(card)card.focus()}
      else{var sa=document.getElementById("layoutBackoutGateStripAccept");if(sa)sa.focus()}
    }
    function annealBackoutGateConfirm(info){
      return new Promise(function(resolve){
        var wrap=document.getElementById("layoutBackoutGate"),codeEl=document.getElementById("layoutBackoutGateCode"),factsEl=document.getElementById("layoutBackoutGateFacts");
        if(!wrap||!codeEl||!factsEl){resolve("accept");return}
        annealBackoutGateResolver=resolve;
        codeEl.textContent=String(info&&info.code||"ANNEAL-BO-01");
        factsEl.innerHTML="Branch <b>"+dkEsc(info&&info.branch||"")+"</b> · phase <b>"+dkEsc(info&&info.phase||"")+"</b><br/>Crossing before (last kept) <b>"+dkFmtLead(info?info.crossingBefore:null)+"</b> → after (tripped trial) <b>"+dkFmtLead(info?info.crossingAfter:null)+"</b>"+(info&&Number.isFinite(Number(info.tolerance))?(" · gate tolerance "+dkFmtLead(Number(info.tolerance))):"");
        var sCode=document.getElementById("layoutBackoutGateStripCode");if(sCode)sCode.textContent=String(info&&info.code||"ANNEAL-BO-01");
        var sPhase=document.getElementById("layoutBackoutGateStripPhase");if(sPhase)sPhase.textContent=String(info&&info.branch||"")+(info&&info.phase?(" · "+String(info.phase)):"");
        var sSum=document.getElementById("layoutBackoutGateStripSummary");if(sSum)sSum.textContent="Crossing "+dkFmtLead(info?info.crossingBefore:null)+" → "+dkFmtLead(info?info.crossingAfter:null)+(info&&Number.isFinite(Number(info.tolerance))?(" · tol "+dkFmtLead(Number(info.tolerance))):"");
        wrap.classList.remove("le-bo-expanded");
        wrap.hidden=false;
        document.documentElement.classList.add("le-diag-docked");
        var accB=document.getElementById("layoutBackoutGateAccept"),rejB=document.getElementById("layoutBackoutGateReject");
        if(accB)accB.disabled=false;if(rejB)rejB.disabled=false;
        var sAcc=document.getElementById("layoutBackoutGateStripAccept"),sRej=document.getElementById("layoutBackoutGateStripReject");
        if(sAcc){sAcc.disabled=false;sAcc.focus()}if(sRej)sRej.disabled=false;
      });
    }
    function annealBackoutGateDone(decision){
      var wrap=document.getElementById("layoutBackoutGate");if(wrap){wrap.hidden=true;wrap.classList.remove("le-bo-expanded")}
      document.documentElement.classList.remove("le-diag-docked");
      var res=annealBackoutGateResolver;annealBackoutGateResolver=null;
      if(res)res(decision);
    }
    // ACCEPT-PATH STEP-THROUGH DIAGNOSTICS (ruled 2026-11-01, Jason):
    // session-only toggle (layoutDiagToggle, beside the gate toggle),
    // never written into a saved layout or profile, on by default.
    // When on, runDeknotterCascade hands the bundle opts.onDiagPause;
    // the bundle calls it only on the back-out gate Accept path, at
    // ANNEAL-DIAG-01 (Accept -> restoreKept), ANNEAL-DIAG-02
    // (restoreKept -> closing full paint) and ANNEAL-DIAG-03 (closing
    // full paint -> settle). Each call opens the slim strip below
    // (bottom-right, map fully visible; Expand shows the full readout
    // card, Minimise returns to the strip) and waits on its promise -
    // no timeout can fire while it waits - until Continue is pressed.
    // The strip and card only display the bundle's
    // read-only snapshot; it changes no geometry. When off, no
    // callback is passed and the Accept path runs exactly as before.
    var annealDiagOn=true,annealDiagResolver=null;
    // ON-DEMAND FULL PAINT (ruled 2026-11-01, Jason): session-only
    // toggle (layoutOnDemandPaintToggle, beside the step-through
    // toggle), never written into a saved layout or profile, OFF by
    // default. When on, runDeknotterCascade hands the bundle
    // opts.onDemandFullPaint; the bundle then takes one freeze-replay
    // full paint at the 3rd fit-subcats runPhase commit and every 5th
    // runPhase commit thereafter, logging a stage-stamped snapshot.
    // When off, no flag is passed and runs behave exactly as before.
    var annealOnDemandPaintOn=false;
    // THROW-BRACKET PAINTS (ruled 2026-11-01 23:57 CST, Jason):
    // session-only toggle (layoutThrowBracketToggle, beside the
    // on-demand paint toggle), never written into a saved layout or
    // profile, ON by default for this diagnostic build. When on,
    // runDeknotterCascade hands the bundle opts.throwBracket and
    // opts.onThrowBracketPause (the same slim-strip pause as the
    // step-through diagnostics: the strip opens slim only at the
    // bottom-right, the map stays fully visible behind it, Expand
    // shows the full readout and Minimise folds it back, and neither
    // resolves the pause); the bundle then takes one full paint +
    // painted-geometry snapshot before the first throw
    // (THROW-BEFORE) and one after it (THROW-AFTER). When off, no
    // bracket options are passed and the run is exactly as before.
    var annealThrowBracketOn=true;
    // Slim-strip summary (presentation only): a short derivation of
    // the snapshot's own readout - branch delivered radius and the
    // painted bounding-box size against the viewBox width. It reads
    // the snapshot the bundle already took; it measures nothing new
    // and never replaces the full readout, which still goes to the
    // card, the console and the receipt unchanged.
    function annealDiagSummary(info){
      function num(v){var n=Number(v);return Number.isFinite(n)?String(Math.round(n)):"\u2014"}
      var branch=(info&&null!=info.storedBranchRadius)?num(info.storedBranchRadius):"\u2014";
      var bbox=(info&&info.view&&info.view.bbox)?info.view.bbox:null;
      var vb=(info&&info.view&&info.view.viewBox)?String(info.view.viewBox).trim().split(/\s+/):null;
      var vbW=(vb&&4===vb.length)?vb[2]:null;
      var s="branch "+branch+" \u00b7 bbox "+(bbox?(num(bbox.width)+"\u00d7"+num(bbox.height)):"\u2014");
      if(vbW)s+=" in "+vbW+" viewBox";
      return s;
    }
    function annealDiagSetExpanded(exp){
      var wrap=document.getElementById("layoutDiagGate");if(!wrap)return;
      wrap.classList.toggle("le-diag-expanded",!!exp);
      if(exp){var card=wrap.querySelector(".le-backout-gate-card");if(card)card.focus()}
      else{var sc=document.getElementById("layoutDiagStripContinue");if(sc)sc.focus()}
    }
    function annealDiagPause(info){
      return new Promise(function(resolve){
        var wrap=document.getElementById("layoutDiagGate"),codeEl=document.getElementById("layoutDiagGateCode"),factsEl=document.getElementById("layoutDiagGateFacts");
        if(!wrap||!codeEl||!factsEl){resolve();return}
        annealDiagResolver=resolve;
        codeEl.textContent=String(info&&info.code||"")+" \u00b7 "+String(info&&info.label||"");
        factsEl.textContent=String(info&&info.text||"");
        var sCode=document.getElementById("layoutDiagStripCode");if(sCode)sCode.textContent=String(info&&info.code||"");
        var sPhase=document.getElementById("layoutDiagStripPhase");if(sPhase)sPhase.textContent=String(info&&info.label||"")+(info&&info.phase?(" \u00b7 "+String(info.phase)):"");
        var sSum=document.getElementById("layoutDiagSummary");if(sSum)sSum.textContent=annealDiagSummary(info||{});
        try{console.log("["+String(info&&info.code||"")+"] "+String(info&&info.text||""),info)}catch(e){}
        wrap.classList.remove("le-diag-expanded");
        wrap.hidden=false;
        document.documentElement.classList.add("le-diag-docked");
        var cont=document.getElementById("layoutDiagGateContinue");if(cont)cont.disabled=false;
        var sCont=document.getElementById("layoutDiagStripContinue");if(sCont){sCont.disabled=false;sCont.focus()}
      });
    }
    function annealDiagDone(){
      var wrap=document.getElementById("layoutDiagGate");if(wrap){wrap.hidden=true;wrap.classList.remove("le-diag-expanded")}
      document.documentElement.classList.remove("le-diag-docked");
      var res=annealDiagResolver;annealDiagResolver=null;
      if(res)res();
    }
    (function(){
      var tog=document.getElementById("layoutOnDemandPaintToggle");
      if(tog){annealOnDemandPaintOn=!!tog.checked;tog.addEventListener("change",function(){annealOnDemandPaintOn=!!tog.checked})}
    })();
    (function(){
      var tog=document.getElementById("layoutThrowBracketToggle");
      if(tog){annealThrowBracketOn=!!tog.checked;tog.addEventListener("change",function(){annealThrowBracketOn=!!tog.checked})}
    })();
    (function(){
      var tog=document.getElementById("layoutDiagToggle");
      if(tog){annealDiagOn=!!tog.checked;tog.addEventListener("change",function(){annealDiagOn=!!tog.checked})}
      var cont=document.getElementById("layoutDiagGateContinue");
      if(cont)cont.addEventListener("click",function(){annealDiagDone()});
      var sCont=document.getElementById("layoutDiagStripContinue");
      if(sCont)sCont.addEventListener("click",function(){annealDiagDone()});
      var expBtn=document.getElementById("layoutDiagExpand");
      if(expBtn)expBtn.addEventListener("click",function(){annealDiagSetExpanded(true)});
      var colBtn=document.getElementById("layoutDiagCollapse");
      if(colBtn)colBtn.addEventListener("click",function(){annealDiagSetExpanded(false)});
    })();
    (function(){
      var tog=document.getElementById("layoutBackoutGateToggle");
      if(tog){annealBackoutGateOn=!!tog.checked;tog.addEventListener("change",function(){annealBackoutGateOn=!!tog.checked})}
      var acc=document.getElementById("layoutBackoutGateAccept"),rej=document.getElementById("layoutBackoutGateReject");
      if(acc)acc.addEventListener("click",function(){annealBackoutGateDone("accept")});
      if(rej)rej.addEventListener("click",function(){annealBackoutGateDone("reject")});
      var sAcc=document.getElementById("layoutBackoutGateStripAccept"),sRej=document.getElementById("layoutBackoutGateStripReject");
      if(sAcc)sAcc.addEventListener("click",function(){annealBackoutGateDone("accept")});
      if(sRej)sRej.addEventListener("click",function(){annealBackoutGateDone("reject")});
      var gExp=document.getElementById("layoutBackoutGateExpand");
      if(gExp)gExp.addEventListener("click",function(){annealBackoutGateSetExpanded(true)});
      var gCol=document.getElementById("layoutBackoutGateCollapse");
      if(gCol)gCol.addEventListener("click",function(){annealBackoutGateSetExpanded(false)});
    })();
    // Anneal-all loop state (shell only): the loop driver below runs
    // the existing single-branch cascade once per branch; these two
    // flags let the busy state and the Cancel control span the whole
    // loop instead of a single branch run.
    var deknotterLoopRunning=false,deknotterLoopCancelRequested=false;
    // Q1: mid-phase cancel flag for the running cascade. The Cancel
    // control below sets it; runDeknotterCascade hands the driver a
    // shouldCancel reader over it, and the solver's per-iteration
    // poll (dkSolvePoll in the bundle) stops the phase on it.
    var deknotterCancelRequested=false;
    var dkPhaseLines=[];
    // Receipt disclosure hierarchy (ruled 2026-11-01, Jason): the
    // Anneal receipts render as a pull-down tree of <details> nodes —
    // the run's lead line is the top node's summary (its disclosure
    // triangle), branches and phase lists nest one level under it,
    // each with its own triangle. Open state is kept per node key in
    // dkReceiptOpen so the settle re-render (renderDkReceipt again
    // from onSettleLanded) restores the tree as the reader left it
    // instead of snapping it shut.
    var dkReceiptOpen={};
    function dkReceiptDetails(key,cls,summaryHtml,bodyHtml,defaultOpen){
      var open=Object.prototype.hasOwnProperty.call(dkReceiptOpen,key)?!!dkReceiptOpen[key]:!!defaultOpen;
      return "<details class=\"le-receipt-node "+cls+"\" data-receipt-key=\""+dkEsc(key)+"\""+(open?" open":"")+"><summary><span>"+summaryHtml+"</span></summary><div class=\"le-receipt-body\">"+bodyHtml+"</div></details>";
    }
    function dkReceiptSummaryInner(leadHtml){return String(leadHtml||"").replace(/^<p>/,"").replace(/<\/p>$/,"")}
    (function(){var se=document.getElementById("layoutDeknotterStatus");if(se)se.addEventListener("toggle",function(ev){var d=ev.target;if(d&&d.classList&&d.classList.contains("le-receipt-node")){var k=d.getAttribute("data-receipt-key");if(k)dkReceiptOpen[k]=!!d.open}},true)})();
    function deknotterYield(){return new Promise(function(res){var done=false;function fin(){if(!done){done=true;res()}}if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(fin)});setTimeout(fin,60)})}
    function deknotterGroupEl(){var sec=document.getElementById("layoutSectionSelection");return sec?sec.querySelector(".layout-editor-branch"):null}
    function setDeknotterGroupDisabled(dis){var g=deknotterGroupEl();if(g)Array.prototype.forEach.call(g.querySelectorAll("input,select,button"),function(el){if(el.id==="layoutAnnealBtn"||el.id==="layoutDeknotterCancel")return;el.disabled=!!dis});var btn=document.getElementById("layoutAnnealBtn");if(btn)btn.disabled=true}
    // Anneal scope helpers (shell only): the owning-branch lookups
    // the pickers fall back to when the checklist is empty. The
    // scope resolution itself lives at annealScope() below.
    function annealBranchForSubcat(subName){var tax=taxonomy();if(!tax)return "";var i,j;if(tax.categories)for(i=0;i<tax.categories.length;i++){var subs=tax.categories[i].subcategories||[];for(j=0;j<subs.length;j++)if(subs[j]&&subs[j].name===subName)return tax.categories[i].name}if(tax.flatList)for(i=0;i<tax.flatList.length;i++)if(tax.flatList[i]&&tax.flatList[i].subcategory===subName&&tax.flatList[i].category)return tax.flatList[i].category;return ""}
    function annealBranchForKink(kinkId){var tax=taxonomy();if(!tax)return "";var i;if(tax.flatList)for(i=0;i<tax.flatList.length;i++)if(tax.flatList[i]&&tax.flatList[i].id===kinkId&&tax.flatList[i].category)return tax.flatList[i].category;if(tax.topicById){var en=null;try{en=tax.topicById.get?tax.topicById.get(kinkId):tax.topicById[kinkId]}catch(e){en=null}if(en&&(en.category||en.branch))return en.category||en.branch}return ""}
    // Anneal branch checklist (selections editor): one checkbox row
    // per branch, built once from the branch list (buildSpokeAngles
    // guard pattern — rows are built only while the container is
    // empty, and retried on later syncs until the branch list is
    // available). State lives in the checkboxes themselves: no new
    // persistence, a run never clears it; it survives the panel
    // hiding (DOM hidden, not destroyed) and resets on reload, like
    // the picker value. CROSSING NUMBERS + MAP SYNC (ruled
    // 2026-11-01, Jason): each row also lists its branch's CURRENT
    // crossing number (refreshAnnealCrossings, re-read at every
    // checklist sync from the same __sxCrossingMeasure readout the
    // onset rule and the run-order list use), and selection is in
    // sync with the map both ways — a branch selected on the map
    // is checked off here (checkAnnealBranchFromMap, called from
    // focusEditorOn; checking is additive, a plain map tap never
    // unchecks a row or clears other picks), and checking a row
    // here selects that branch on the map (the checklist click
    // handler below). Ctrl/Cmd-click without Shift or Alt is the
    // multi-select (ruled 2026-11-25, Jason):
    // toggleAnnealBranchFromMap flips that one branch and the map
    // tap does not select the spoke.
    function buildAnnealChecklist(){var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap||wrap.children.length||!window.__SEXCAPADES_LAYOUT_API||!window.__SEXCAPADES_LAYOUT_API.branches)return;branchNames().forEach(function(name){var row=document.createElement("button");row.type="button";row.className="le-anneal-opt";row.setAttribute("data-anneal-check","");row.setAttribute("data-value",name);row.setAttribute("aria-selected","false");row.setAttribute("aria-label","Anneal "+name);var nm=document.createElement("span");nm.className="le-anneal-name";nm.textContent=name;row.appendChild(nm);var cr=document.createElement("span");cr.className="le-anneal-cross";cr.setAttribute("data-anneal-cross","");cr.textContent="crossing —";row.appendChild(cr);wrap.appendChild(row)})}
    function refreshAnnealCrossings(){var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap||!wrap.children.length)return;var clouds=null;try{var m=typeof window.__sxCrossingMeasure==="function"?window.__sxCrossingMeasure():null;clouds=m&&m.clouds?m.clouds:null}catch(e){clouds=null}Array.prototype.forEach.call(wrap.querySelectorAll("[data-anneal-check]"),function(opt){var name=opt.getAttribute("data-value"),v=clouds?Number(clouds[name]):NaN,el=opt.querySelector("[data-anneal-cross]");if(el)el.textContent=Number.isFinite(v)?("crossing "+dkFmtLead(v)):"crossing —";opt.setAttribute("aria-label","Anneal "+name+(Number.isFinite(v)?(", crossing "+dkFmtLead(v)):""))})}
    function checkAnnealBranchFromMap(branch){if(!branch)return;buildAnnealChecklist();var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap)return;var changed=false;Array.prototype.forEach.call(wrap.querySelectorAll("[data-anneal-check]"),function(opt){if(opt.getAttribute("data-value")===branch&&opt.getAttribute("aria-selected")!=="true"){opt.setAttribute("aria-selected","true");changed=true}});if(changed)syncAnnealChecklist()}
    function toggleAnnealBranchFromMap(branch){if(!branch)return;buildAnnealChecklist();var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap)return;Array.prototype.forEach.call(wrap.querySelectorAll("[data-anneal-check]"),function(opt){if(opt.getAttribute("data-value")===branch)opt.setAttribute("aria-selected",opt.getAttribute("aria-selected")==="true"?"false":"true")});syncDeknotterBtn()}
    function annealCheckedBranches(){var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap)return[];var checked={};Array.prototype.forEach.call(wrap.querySelectorAll("[data-anneal-check]"),function(opt){if(opt.getAttribute("aria-selected")==="true")checked[opt.getAttribute("data-value")]=true});return branchNames().filter(function(name){return !!checked[name]})}
    function syncAnnealChecklist(){buildAnnealChecklist();refreshAnnealCrossings();var picked=annealCheckedBranches(),trig=document.getElementById("layoutAnnealTriggerLabel"),note=document.getElementById("layoutAnnealScopeNote");if(trig)trig.textContent=!picked.length?"All branches — whole map":(picked.length===1?picked[0]:picked.length+" branches picked");if(note)note.textContent=!picked.length?"Nothing picked — Anneal runs on the whole map.":(picked.length===1?"Anneal will run on "+picked[0]+" only.":"Anneal will run on the "+picked.length+" picked branches only, in decreasing crossing order, highest crossing first.")}
    function setAnnealChecklist(on){var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap)return;Array.prototype.forEach.call(wrap.querySelectorAll("[data-anneal-check]"),function(opt){opt.setAttribute("aria-selected",String(!!on))});syncDeknotterBtn()}
    // PICKER → CHECKLIST MIRROR (ruled 2026-11-13, Jason): picking a
    // branch in the branch picker checks just that branch in the
    // "Branches to anneal" checklist (all others unchecked), so the
    // list shows what Anneal will run on. Clearing the picker
    // unchecks every row. Scope is unchanged: a one-branch checked
    // list ("selected") runs exactly the same branch the picker
    // alone would ("branch") — annealScope's precedence (a picked
    // list wins over the picker) is untouched.
    function setAnnealChecklistBranch(name){buildAnnealChecklist();var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap)return;Array.prototype.forEach.call(wrap.querySelectorAll("[data-anneal-check]"),function(opt){opt.setAttribute("aria-selected",String(!!name&&opt.getAttribute("data-value")===name))});syncDeknotterBtn()}
    // Anneal scope resolution (shell only): a non-empty checklist
    // wins EXACTLY — the checked set, in branch-list order, is the
    // loop list and the pickers are ignored for scope (they still
    // drive the branch controls). With the checklist empty, a
    // picked branch wins; with the branch picker empty, a picked
    // sub-group or topic runs its OWNING branch; only when every
    // picker is empty does the whole-map loop run (branch list in
    // taxonomy order, unreordered).
    function annealScope(){var checked=annealCheckedBranches();if(checked.length)return{kind:"selected",branches:checked};var b=document.getElementById("layoutBranch"),bv=b?b.value:"";if(bv)return{kind:"branch",branches:[bv]};var sc=document.getElementById("layoutSubcat"),sv=sc?sc.value:"";if(sv)return{kind:"owning",branches:[annealBranchForSubcat(sv)]};var k=document.getElementById("layoutKink"),kv=k?k.value:"";if(kv)return{kind:"owning",branches:[annealBranchForKink(kv)]};return{kind:"all",branches:branchNames().slice()}}
    function syncDeknotterBtn(){var btn=document.getElementById("layoutAnnealBtn");if(!btn)return;syncAnnealChecklist();var label=document.getElementById("layoutAnnealBtnLabel");if(deknotterRunning||deknotterLoopRunning){btn.disabled=true;return}btn.disabled=false;var scope=annealScope();if(label)label.textContent=scope.kind==="selected"?("Anneal selected ("+scope.branches.length+")"):(scope.kind==="all"?"Anneal all":"Anneal");btn.setAttribute("data-ui-tooltip",scope.kind==="selected"?("Run the Nested Nodal Anneal on the "+scope.branches.length+" picked branch"+(scope.branches.length===1?"":"es")+", one branch at a time"+(scope.branches.length===1?"":", in decreasing crossing order, highest crossing first")+": throw it out on the square-root ladder, shrink it to fit, then settle it back (a branch whose crossing number is below 5 skips the throw and shrinks from its current lengths instead) — each branch kept only if its crossing number improves or holds."):(scope.kind==="all"?"Run the Nested Nodal Anneal on every branch, one branch at a time in decreasing crossing order, highest crossing first: throw it out on the square-root ladder, shrink it to fit, then settle it back (a branch whose crossing number is below 5 skips the throw and shrinks from its current lengths instead) — each branch kept only if its crossing number improves or holds.":(scope.kind==="owning"?"Run the Nested Nodal Anneal on the branch that owns the current selection: throw it out on the square-root ladder, shrink it to fit, then settle it back (a branch whose crossing number is below 5 skips the throw and shrinks from its current lengths instead) — kept only if the branch's crossing area improves or holds.":"Run the Nested Nodal Anneal on the selected branch: throw it out on the square-root ladder, shrink it to fit, then settle it back (a branch whose crossing number is below 5 skips the throw and shrinks from its current lengths instead) — kept only if the branch's crossing area improves or holds.")))}
    function startDeknotterBusy(){deknotterBusyStart=Date.now();var btn=document.getElementById("layoutAnnealBtn");if(btn){btn.classList.add("is-busy");btn.setAttribute("aria-busy","true")}document.documentElement.classList.add("deknotter-busy");var el=document.getElementById("layoutDeknotterElapsed");if(el)el.hidden=false;function tick(){if(el)el.textContent=((Date.now()-deknotterBusyStart)/1000).toFixed(1)+"s"}tick();if(deknotterBusyTimer!==null)clearInterval(deknotterBusyTimer);deknotterBusyTimer=setInterval(tick,100)}
    function stopDeknotterBusy(){if(deknotterBusyTimer!==null){clearInterval(deknotterBusyTimer);deknotterBusyTimer=null}var btn=document.getElementById("layoutAnnealBtn");if(btn){btn.classList.remove("is-busy");btn.removeAttribute("aria-busy")}document.documentElement.classList.remove("deknotter-busy");var el=document.getElementById("layoutDeknotterElapsed");if(el)el.hidden=true}
    function dkEsc(s){return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
    function dkFmtRatio(v){return v==null||!Number.isFinite(Number(v))?"\u2014":(Math.round(Number(v)*100)/100)+"\u00d7"}
    function dkFmtRange(r){return !r||r.length<2?"\u2014":dkFmtRatio(r[0])+"\u2013"+dkFmtRatio(r[1])}
    function dkFmtCloud(v){return v==null||!Number.isFinite(Number(v))?"\u2014":Number(v).toFixed(1)}
    function dkFmtDelta(v){return v==null||!Number.isFinite(Number(v))?"\u2014":((Number(v)>0?"+":"")+Number(v).toFixed(1))}
    function dkHitSummary(hits){if(!hits||!hits.length)return "no limiter hits";var types={},order=[];hits.forEach(function(h){var ty=h&&h.type?String(h.type):"hit";if(!types[ty])order.push(ty);types[ty]=(types[ty]||0)+1});var parts=order.map(function(ty){return types[ty]>1?(ty+" \u00d7"+types[ty]):ty});return hits.length+" limiter hit"+(hits.length===1?"":"s")+" ("+parts.join(", ")+")"}
    // DeKnotter receipt (S5): the run's end summary is rendered by
    // renderDkReceipt as ONE lead line — cloud name, the crossing
    // number (Q4 decider) before → after with thousands separators,
    // Δ, the word KEPT or REVERTED, elapsed seconds, with the
    // xAreaCross area riding as a labeled secondary — ahead of the
    // per-phase narration lines (dkPhaseLines), which follow after
    // it and never precede it. (M1, 2026-10-29: the xAreaCross area no
    // longer rides as a secondary — area is removed from observation;
    // its receipt segment is commented out in renderDkReceipt below.)
    // While the deferred whole-map settle
    // is still owed (S6), the lead line carries a "settling…" mark
    // instead of presenting its numbers as final; when the settle
    // lands, onSettleLanded re-measures the cloud and the lead
    // line's numbers become the post-settle values.
    function dkFmtLead(v){return v==null||!Number.isFinite(Number(v))?"—":Number(v).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2})}
    function dkFmtLeadDelta(v){if(v==null||!Number.isFinite(Number(v)))return "—";var n=Number(v);if(n===0)return "0";return (n<0?"−":"+")+Math.abs(n).toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:2})}
    function dkFmtAnneal(v){return v==null||!Number.isFinite(Number(v))?"\u2014":String(Math.round(Number(v)*1000)/1000)}
    // Anneal live crossing overlay (2026-10-28; plain-number form
    // 2026-11-01): while a cascade run is active, the annealed cloud's
    // CURRENT crossing number rides on the cloud itself — just the
    // number, in the normal per-cloud numbers-overlay style
    // (.metric-map-num: same size, weight, colour and outline, no box,
    // no label, no phase line), in its own layer inside
    // #mapScene, built on the MetricNumbersView pattern (world anchor
    // via MetricGeometry / the layer CTM, pointer-events:none layer so
    // map taps, drags and the panel's Cancel control are untouched,
    // transform/viewBox observer for pan/zoom). It only ever READS:
    // phase summaries hand it their committed cloud value, and the
    // heartbeat plus the run's own 1 s heartbeat timer hand it a fresh
    // read of window.__sxCrossingMeasure — the same read-only readout
    // behind the crossing metric and the cascade's onset check, keyed
    // by the annealed branch, so the number shown is the same metric
    // the phase lines and the receipt report. It writes no layout
    // state and touches neither the cascade, its phases, its gates,
    // nor its termination; it is removed on the cascade's finally
    // exit path, next to stopDeknotterBusy.
    var AnnealCloudOverlay={
      branch:null,value:null,phase:null,layerEl:null,badgeEl:null,anchor:null,raf:0,observer:null,
      layer:function(){
        var scene=document.getElementById("mapScene");if(!scene)return null;
        if(!AnnealCloudOverlay.layerEl||!AnnealCloudOverlay.layerEl.isConnected){AnnealCloudOverlay.layerEl=document.createElement("div");AnnealCloudOverlay.layerEl.className="anneal-cloud-overlay";AnnealCloudOverlay.layerEl.id="annealCloudOverlay";AnnealCloudOverlay.layerEl.setAttribute("aria-hidden","true");scene.appendChild(AnnealCloudOverlay.layerEl);AnnealCloudOverlay.badgeEl=null}
        return AnnealCloudOverlay.layerEl;
      },
      badge:function(){
        var layer=AnnealCloudOverlay.layer();if(!layer)return null;
        if(!AnnealCloudOverlay.badgeEl||!AnnealCloudOverlay.badgeEl.isConnected){
          var b=document.createElement("span");b.className="metric-map-num anneal-cloud-num";b.id="annealCloudValue";
          b.textContent="\u2014";
          AnnealCloudOverlay.badgeEl=b;layer.appendChild(b);
        }
        return AnnealCloudOverlay.badgeEl;
      },
      readLive:function(){
        try{var m=typeof window.__sxCrossingMeasure==="function"?window.__sxCrossingMeasure():null;var v=m&&m.clouds?Number(m.clouds[AnnealCloudOverlay.branch]):NaN;return Number.isFinite(v)?v:null}catch(e){return null}
      },
      recenter:function(){
        try{
          // While a run is live, the bundle paints the worked
          // branch's SCC capsule approximation from the current
          // solve and publishes its centroid as
          // window.__sxInterimAnchor (world coordinates): the live
          // number rides on THAT — the intermediary stage actually
          // being shown — not on the frozen pre-run DOM cloud,
          // whose centre the fallback below reads.
          var ia=window.__sxInterimAnchor;
          if(ia&&ia.branch===AnnealCloudOverlay.branch&&Number.isFinite(Number(ia.x))&&Number.isFinite(Number(ia.y))){AnnealCloudOverlay.anchor={x:Number(ia.x),y:Number(ia.y)};return}
          var centers=(typeof MetricNumbersView!=="undefined"&&MetricNumbersView&&typeof MetricNumbersView.cloudCenters==="function")?MetricNumbersView.cloudCenters():null;
          var ctr=centers?centers[AnnealCloudOverlay.branch]:null;if(!ctr)return;
          var w=MetricGeometry.screenToWorld(ctr.x,ctr.y);if(w)AnnealCloudOverlay.anchor={x:w.x,y:w.y};
        }catch(e){}
      },
      position:function(){
        var badge=AnnealCloudOverlay.badgeEl,layer=AnnealCloudOverlay.layerEl;
        if(!badge||!badge.isConnected||!layer||!layer.isConnected)return;
        var rect=layer.getBoundingClientRect();if(!(rect.width>0))return;
        var x=rect.width/2,y=46;
        var ml=document.getElementById("mapLayer"),m=null;try{m=ml?ml.getScreenCTM():null}catch(e){}
        if(m&&AnnealCloudOverlay.anchor){try{var p=new DOMPoint(AnnealCloudOverlay.anchor.x,AnnealCloudOverlay.anchor.y).matrixTransform(m);x=p.x-rect.left;y=p.y-rect.top}catch(e){}}
        // Clamp inside the scene: a cloud thrown far out (the throw
        // phase scales the branch 100x) or panned away must never
        // carry its number off-screen — the count stays visible at
        // the scene edge nearest the cloud and follows it back in.
        x=Math.max(28,Math.min(x,Math.max(28,rect.width-28)));
        y=Math.max(14,Math.min(y,Math.max(14,rect.height-14)));
        badge.style.left=x+"px";badge.style.top=y+"px";
      },
      schedulePosition:function(){
        if(AnnealCloudOverlay.raf)return;
        if(typeof requestAnimationFrame!=="function"){AnnealCloudOverlay.position();return}
        AnnealCloudOverlay.raf=requestAnimationFrame(function(){AnnealCloudOverlay.raf=0;AnnealCloudOverlay.position()});
      },
      render:function(){
        var badge=AnnealCloudOverlay.badge();if(!badge)return;
        badge.textContent=AnnealCloudOverlay.value==null?"\u2014":dkFmtLead(AnnealCloudOverlay.value);
        AnnealCloudOverlay.position();
      },
      update:function(value,recenter){
        if(!AnnealCloudOverlay.branch)return;
        if(value!=null&&Number.isFinite(Number(value)))AnnealCloudOverlay.value=Number(value);
        if(recenter)AnnealCloudOverlay.recenter();
        AnnealCloudOverlay.render();
      },
      tick:function(){
        // The run's 1 s cadence (the hbTimer interval): a fresh live
        // read plus a recenter, so the number follows the moving
        // cloud between phase commits without polling any faster
        // than the run already reports its own heartbeat.
        if(!AnnealCloudOverlay.branch)return;
        AnnealCloudOverlay.update(AnnealCloudOverlay.readLive(),true);
      },
      heartbeat:function(){
        // Fired from the solver's per-iteration poll through
        // onHeartbeat, synchronously with a solve on the main
        // thread: refresh the VALUE from the live readout and
        // reposition from the stored anchor only — no DOM geometry
        // walk (cloudCenters) while a solve is running.
        if(!AnnealCloudOverlay.branch)return;
        var v=AnnealCloudOverlay.readLive();
        if(v!=null)AnnealCloudOverlay.value=v;
        AnnealCloudOverlay.render();
      },
      setPhase:function(phase){if(phase)AnnealCloudOverlay.phase=String(phase)}, // phase is tracked for the run only — never shown on the cloud; the overlay is the number alone
      start:function(branch,value){
        AnnealCloudOverlay.branch=branch;AnnealCloudOverlay.value=(value!=null&&Number.isFinite(Number(value)))?Number(value):null;AnnealCloudOverlay.phase=null;AnnealCloudOverlay.anchor=null;
        if(!AnnealCloudOverlay.badge())return;
        AnnealCloudOverlay.recenter();
        AnnealCloudOverlay.render();
        // Pan/zoom tracking: the same observer contract as the
        // metric numbers overlay — viewBox on the svg, transform on
        // the viewport and map layer.
        try{
          AnnealCloudOverlay.stopWatching();
          var obs=new MutationObserver(function(){AnnealCloudOverlay.schedulePosition()});
          AnnealCloudOverlay.observer=obs;
          var svg=document.getElementById("mapSvg");if(svg)obs.observe(svg,{attributes:true,attributeFilter:["viewBox"]});
          ["viewport","mapLayer"].forEach(function(id){var n=document.getElementById(id);if(n)obs.observe(n,{attributes:true,attributeFilter:["transform"]})});
        }catch(e){}
      },
      stopWatching:function(){if(AnnealCloudOverlay.observer){try{AnnealCloudOverlay.observer.disconnect()}catch(e){}AnnealCloudOverlay.observer=null}if(AnnealCloudOverlay.raf){try{cancelAnimationFrame(AnnealCloudOverlay.raf)}catch(e){}AnnealCloudOverlay.raf=0}},
      stop:function(){
        AnnealCloudOverlay.stopWatching();
        AnnealCloudOverlay.branch=null;AnnealCloudOverlay.value=null;AnnealCloudOverlay.phase=null;AnnealCloudOverlay.anchor=null;
        if(AnnealCloudOverlay.badgeEl){AnnealCloudOverlay.badgeEl.remove();AnnealCloudOverlay.badgeEl=null}
        if(AnnealCloudOverlay.layerEl){AnnealCloudOverlay.layerEl.remove();AnnealCloudOverlay.layerEl=null}
      }
    };
    function renderDkReceipt(){
      var statusEl=document.getElementById("layoutDeknotterStatus");
      if(!statusEl||!dkReceipt)return;
      var rc=dkReceipt,lead;
      if(rc.error){
        lead="<p><b>"+dkEsc(rc.name)+" · failed</b> — "+dkEsc(rc.error)+" · controls restored · "+rc.elapsed+"</p>";
      }else if(rc.noreport){
        lead="<p><b>"+dkEsc(rc.name)+" · finished</b> — no run report was returned · "+rc.elapsed+"</p>";
      }else{
        lead="<p><b>"+dkEsc(rc.name)+": crossing "+dkFmtLead(rc.before)+" → "+dkFmtLead(rc.after)+" (Δ "+dkFmtLeadDelta(rc.delta)+") — "+(rc.gate==="kept"?"KEPT":(rc.gate==="ended-at-category-backout"?"ENDED AT CATEGORY BACK-OUT — backed-out state stands":"REVERTED"))+" in "+rc.elapsed+"</b>"+(rc.reason?(" — "+dkEsc(rc.reason)):"")+(rc.coverage?(" · coverage "+rc.coverage):"")+(rc.fitdev!=null?(" · fit deviations "+rc.fitdev):"")+((rc.awaitingSettle&&settlePending)?" — settling…":"")+"</p>";
      }
      var receiptBody="";
      if(rc.diagLines&&rc.diagLines.length)rc.diagLines.forEach(function(t){receiptBody+="<p>Diagnostic step-through: "+dkEsc(t)+"</p>"});
      if(rc.backoutGate)receiptBody+="<p>Back-out gate: <b>REJECTED</b> — code "+dkEsc(rc.backoutGate.code)+" · branch "+dkEsc(rc.backoutGate.branch)+" · phase "+dkEsc(rc.backoutGate.phase||"")+" · crossing before (last kept) "+dkFmtLead(rc.backoutGate.crossingBefore)+" → tripped "+dkFmtLead(rc.backoutGate.crossingAfter)+". The tripped geometry was left standing; the run ended with no growth, final patch, or final gate.</p>";
      if(rc.skipThrow)receiptBody+="<p>Throw skipped — crossing "+dkFmtLead(rc.skipThrow.baseline)+" is below "+dkFmtLead(rc.skipThrow.below)+", so this run shrank the subcategories first and then the category, from the branch's current lengths, instead of throwing.</p>";
      if(rc.throwInfo)receiptBody+="<p>Throw: "+rc.throwInfo+"</p>";
      if(rc.subcatShrink)receiptBody+="<p>Subcategory shrink: "+rc.subcatShrink+"</p>";
      if(rc.witness)receiptBody+="<p>Witness check: "+rc.witness+"</p>";
      if(rc.finalWitness)receiptBody+="<p>Final-step witness: "+rc.finalWitness+"</p>";
      if(rc.paintedWitness)receiptBody+="<p>Painted-geometry witness: "+rc.paintedWitness+"</p>";
      if(rc.anneal)receiptBody+="<p>Anneal settle: E "+dkFmtAnneal(rc.anneal.E_start)+" \u2192 "+dkFmtAnneal(rc.anneal.E_end)+" \u00b7 "+rc.anneal.sweeps+" sweeps \u00b7 "+rc.anneal.uphill_count+" uphill</p>";
      var receiptPhases=dkPhaseLines||[];
      if(receiptPhases.length)receiptBody+=dkReceiptDetails("phases:"+rc.name,"le-receipt-l2","<b>Phases ("+receiptPhases.length+")</b>",receiptPhases.join(""),false);
      if(receiptBody){
        statusEl.innerHTML=dkReceiptDetails("run:"+rc.name,"le-receipt-l1",dkReceiptSummaryInner(lead),receiptBody,true);
      }else{
        statusEl.innerHTML=lead;
      }
    }
    // F8 NAME MAPPING (do not rename the button): the layout editor's
    // "Anneal" BUTTON fires the deep untangler's driver —
    // __SEXCAPADES_LAYOUT_API.deknotter.run(), i.e. the bundle's
    // SX_SOLVER_FACADE.untangle(). The paint-stage annealer is a
    // DIFFERENT engine (the tidier, SX_SOLVER_FACADE.tidy) that runs
    // on every paint with no button involved. Button -> untangler
    // driver; paint -> tidier.
    async function onDeknotterClick(){
      if(deknotterRunning||deknotterLoopRunning)return;
      var scope=annealScope();
      if(scope.kind==="selected"){runAnnealLoop(scope.branches,true);return}
      if(scope.kind==="all"){runAnnealAllLoop(scope.branches);return}
      var name=scope.branches[0];if(!name)return;
      var statusEl=document.getElementById("layoutDeknotterStatus");
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.anneal;
      if(!dk||typeof dk.run!=="function"){if(statusEl)statusEl.innerHTML="<p><b>"+dkEsc(name)+"</b> — the DeKnotter driver is unavailable in this build.</p>";return}
      // Zero-cloud pre-flight (S4): when this cloud's crossing
      // number (Q4: the decider measureCloud reads) is already 0,
      // the cascade has nothing to untie.
      // Say so BEFORE starting it — naming the cloud and that it is
      // already at its floor — and offer the choice: running anyway
      // proceeds with the normal cascade; stopping costs nothing
      // (no state change, no cascade).
      if(typeof dk.measureCloud==="function"){
        var preCloud=null,preOk=false;
        try{
          var ownCross = await dk.measureCloud(name);
          var adjCross = typeof window.__sxCrossingStagedCloud === "function" ? window.__sxCrossingStagedCloud(name, true) : null;
          preCloud = (adjCross != null && Number.isFinite(adjCross)) ? Math.max(Number(ownCross||0), Number(adjCross)) : ownCross;
          preOk=preCloud!=null&&Number.isFinite(Number(preCloud));
        }catch(e){preOk=false}
        if(preOk&&Number(preCloud)===0){
          dkReceipt=null;dkPhaseLines=[];
          if(statusEl){
            statusEl.innerHTML="<p><b>"+dkEsc(name)+"</b> is already at its floor — its crossing number is 0 (both own-cloud and with nearest neighbors), so the DeKnotter has nothing to untie in this cloud. A run would take several seconds and change nothing.</p><p><button class=\"le-anneal-choice\" id=\"layoutDeknotterRunAnyway\" type=\"button\">Run anyway</button><button class=\"le-anneal-choice\" id=\"layoutDeknotterSkip\" type=\"button\">Stop</button></p>";
            var runBtn=document.getElementById("layoutDeknotterRunAnyway"),skipBtn=document.getElementById("layoutDeknotterSkip");
            if(skipBtn)skipBtn.addEventListener("click",function(){if(statusEl)statusEl.innerHTML="<p><b>"+dkEsc(name)+"</b> — DeKnotter stopped: the cloud is already at its floor, and nothing was changed.</p>"});
            if(runBtn)runBtn.addEventListener("click",function(){runDeknotterCascade(name)});
          }
          return;
        }
      }
      runDeknotterCascade(name);
    }
    async function runDeknotterCascade(name,btnProgressLabel){
      if(deknotterRunning)return;
      var statusEl=document.getElementById("layoutDeknotterStatus");
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.anneal;
      if(!dk||typeof dk.run!=="function"){if(statusEl)statusEl.innerHTML="<p><b>"+dkEsc(name)+"</b> \u2014 the DeKnotter driver is unavailable in this build.</p>";return}
      deknotterRunning=true;window.__sxAnnealRunning=true;deknotterCancelRequested=false;
      var startedAt=Date.now(),lines=[],lastCloud=null,beforeCloud=null,report=null,runError=null;
      // Q1 heartbeat state: the phase currently solving (fed by the
      // driver's onHeartbeat hook, driven from the solver's own
      // iteration poll) plus the watchdog that keeps the heartbeat
      // line present and fresh between phase commits, so a slow
      // phase never again reads as a stuck one.
      var hbPhase=null,hbIterations=0,hbTimer=null;
      var cancelBtn=document.getElementById("layoutDeknotterCancel");
      function paintHeartbeat(){
        if(!statusEl)return;
        var p=document.getElementById("layoutDeknotterHeartbeat");
        if(!p){p=document.createElement("p");p.id="layoutDeknotterHeartbeat";statusEl.appendChild(p)}
        var secs=((Date.now()-startedAt)/1000).toFixed(0);
        p.innerHTML="<b>"+dkEsc(name)+" · "+dkEsc(hbPhase||"starting")+"</b> — solving… "+secs+" s elapsed"+(hbIterations?" · "+hbIterations+" iterations":"");
      }
      dkPhaseLines=lines;dkReceipt=null;
      setDeknotterGroupDisabled(true);
      startDeknotterBusy();
      // Run-status label (2026-11-03): while this branch runs, the
      // Anneal button names it — the loop passes a counted label
      // ("Annealing <Branch> · n of total"); a standalone run names
      // the branch alone. Set here, in the synchronous prefix, so
      // the deknotterYield() below paints it before the first phase
      // solve blocks the main thread. syncDeknotterBtn() leaves the
      // label untouched while a run flag is set and restores the
      // idle label when the run ends, so nothing else changes it.
      var annealBtnLabelEl=document.getElementById("layoutAnnealBtnLabel");
      if(annealBtnLabelEl)annealBtnLabelEl.textContent=btnProgressLabel||("Annealing "+name);
      if(cancelBtn){cancelBtn.hidden=false;cancelBtn.disabled=false;cancelBtn.textContent="Cancel anneal"}
      AnnealCloudOverlay.start(name);
      paintHeartbeat();
      hbTimer=setInterval(function(){paintHeartbeat();AnnealCloudOverlay.tick()},1000);
      if(statusEl)statusEl.innerHTML="<p>Running the Nested Nodal DeKnotter on <b>"+dkEsc(name)+"</b>\u2026</p>";
      function renderPhase(summary){
        var req=summary.requestedRatios||{},del=summary.deliveredRatios||{},ranges=summary.deliveredRanges||{},cloudPart="";
        if(summary.cloud!=null&&Number.isFinite(Number(summary.cloud))){
          if(lastCloud!=null)cloudPart=" \u00b7 crossing "+dkFmtCloud(lastCloud)+" \u2192 "+dkFmtCloud(summary.cloud)+" (\u0394 "+dkFmtDelta(Number(summary.cloud)-lastCloud)+")";
          else cloudPart=" \u00b7 crossing "+dkFmtCloud(summary.cloud);
          lastCloud=Number(summary.cloud);
        }
        lines.push("<p><b>"+dkEsc(name)+" \u00b7 "+dkEsc(summary.phase||summary.name||"phase")+"</b> \u2014 requested \u2192 delivered: branch "+dkFmtRatio(req.branch)+" \u2192 "+dkFmtRatio(del.branch)+"; sub-groups "+dkFmtRatio(req.subcatMedian)+" \u2192 "+dkFmtRatio(del.subcatMedian)+" (range "+dkFmtRange(ranges.subcat)+"); topics "+dkFmtRatio(req.kinkMedian)+" \u2192 "+dkFmtRatio(del.kinkMedian)+" (range "+dkFmtRange(ranges.kink)+") \u00b7 "+dkEsc(dkHitSummary(summary.limiterHits))+(summary.fitDeviationCount?(" · fit deviations "+summary.fitDeviationCount):"")+(summary.scoped?(" · scoped: ring "+(Array.isArray(summary.scoped.ring)?summary.scoped.ring.length:0)+" · frozen "+summary.scoped.frozenCount+(summary.scoped.fallback?(" · FALLBACK "+dkEsc(summary.scoped.fallback)):"")):"")+cloudPart+" \u00b7 "+((Date.now()-startedAt)/1000).toFixed(1)+"s</p>");
        if(statusEl)statusEl.innerHTML=lines.join("");
        AnnealCloudOverlay.setPhase(summary.phase||summary.name||null);AnnealCloudOverlay.update(summary.cloud,true);
      }
      try{
        // Yield after setting the busy state and BEFORE calling run(),
        // so the spinner and progress cursor actually paint before the
        // first synchronous phase solve blocks the main thread.
        await deknotterYield();
        try{beforeCloud=await dk.measureCloud(name)}catch(e){beforeCloud=null;__sxErrLog("deknotter-baseline",e)}
        if(beforeCloud!=null&&Number.isFinite(Number(beforeCloud))){lastCloud=Number(beforeCloud);AnnealCloudOverlay.update(beforeCloud,true)}
        report=await dk.run(name,{onBackoutGate:annealBackoutGateOn?function(info){return annealBackoutGateConfirm(info)}:null,onDiagPause:annealDiagOn?function(info){return annealDiagPause(info)}:null,diag00:annealDiagOn,onDemandFullPaint:annealOnDemandPaintOn,throwBracket:annealThrowBracketOn,onThrowBracketPause:annealThrowBracketOn?function(info){return annealDiagPause(info)}:null,onPhase:function(summary){
          try{sync()}catch(e){__sxErrLog("deknotter-phase-sync",e)}
          setDeknotterGroupDisabled(true);
          renderPhase(summary);
        },onHeartbeat:function(hb){
          // Q1: fed from the solver's per-iteration poll while a
          // phase is solving (and once at each phase's start).
          if(hb&&hb.phase)hbPhase=String(hb.phase);
          if(hb&&Number.isFinite(Number(hb.iterations)))hbIterations=Number(hb.iterations);
          paintHeartbeat();
          AnnealCloudOverlay.setPhase(hbPhase);AnnealCloudOverlay.heartbeat();
        },shouldCancel:function(){return deknotterCancelRequested}});
      }catch(e){
        runError=e;__sxErrLog("deknotter-run",e);
      }finally{
        // Busy state, cursor class, aria-busy and the group's disabled
        // states clear on EVERY exit path — success, gate revert, and
        // exception alike.
        deknotterRunning=false;
        window.__sxAnnealRunning=false;
        if(hbTimer){clearInterval(hbTimer);hbTimer=null}
        if(cancelBtn)cancelBtn.hidden=true;
        stopDeknotterBusy();
        AnnealCloudOverlay.stop();
        setDeknotterGroupDisabled(false);
        try{sync()}catch(e){__sxErrLog("deknotter-end-sync",e)}
      }
      // Completion readout: gate result (with reason when reverted)
      // and the branch's crossing number (decider) before \u2192 after \u2192 delta,
      // area labeled secondary alongside. (M1, 2026-10-29: the area
      // fields are commented out below — area leaves observation.)
      // No raw value stands without its delta.
      var elapsed=((Date.now()-startedAt)/1000).toFixed(1)+" s";
      // Receipt (S5): the end summary LEADS with a single result
      // line — cloud name, before \u2192 after, \u0394, KEPT or
      // REVERTED, elapsed — rendered by renderDkReceipt ahead of
      // the per-phase narration, never buried after it.
      if(runError){
        dkReceipt={name:name,error:String(runError&&runError.message||runError),elapsed:elapsed,startedAtMs:startedAt,fresh:true,awaitingSettle:false};
      }else if(report){
        var before=(report.baseline&&report.baseline.first!=null)?Number(report.baseline.first):beforeCloud;
        var after=report.finalCloud!=null?Number(report.finalCloud):null;
        var delta=report.delta!=null?Number(report.delta):(before!=null&&after!=null?after-before:null);
        var subShrinkTxt="";if(report.subcatShrink&&report.subcatShrink.length){var subReached=report.subcatShrink.filter(function(s){return s.outcome==="reached-3x-floor"}),subHeld=report.subcatShrink.filter(function(s){return s.outcome!=="reached-3x-floor"});subShrinkTxt=subReached.length+" of "+report.subcatShrink.length+" subcategories shrunk to the 3× length floor"+(subHeld.length?(" · held: "+subHeld.map(function(s){return dkEsc(s.label)+" ("+dkEsc(String(s.outcome).replace(/-/g," "))+(s.standing!=null?(" at "+Math.round(s.standing)):"")+"; "+(s.from!=null?Math.round(s.from):"—")+" → "+(s.floor!=null?Math.round(s.floor):"—")+")"}).join(", ")):"")}
        var witnessTxt="";if(report.witness){var wv=report.witness;if(wv.verdict==="proven"&&wv.culprit)witnessTxt="PROVEN — the "+dkEsc(wv.culprit.event)+" at "+dkEsc(wv.culprit.phase||"")+" returned "+wv.culprit.subcats.map(function(s){return dkEsc(s)}).join(", ")+" to thrown length all at once, not one step ("+wv.frames.length+" frames, "+wv.events.length+" back-outs checked)";else if(wv.verdict==="ruled-out")witnessTxt="ruled out — "+wv.events.length+" back-out(s) checked frame by frame and none returned a subcategory to its thrown length ("+wv.frames.length+" frames)";else if(wv.verdict==="no-backout-observed")witnessTxt="not settled — no back-out fired in this run ("+wv.frames.length+" frames captured)";else witnessTxt="check did not run"}
        var finalWitnessTxt="";if(report.witness&&report.witness.finalStep){var fs=report.witness.finalStep,fsTr=function(nm){return (fs.transitions||[]).filter(function(t){return t.transition===nm})[0]||null},fsFmt=function(t){return t?t.flung.map(function(f){return dkEsc(f.label)+" "+Math.round(f.before)+" → "+Math.round(f.after)+(f.toThrown?" (thrown "+Math.round(f.thrown)+")":"")}).join(", "):""};if(fs.verdict==="proven"&&fs.culprit){var ct=fsTr(fs.culprit.transition);finalWitnessTxt="PROVEN — the "+dkEsc(fs.culprit.transition==="closing-full-paint"?"closing full paint":"final patch commit")+" flung "+fsFmt(ct)+" back out all at once, past one step — operation: "+dkEsc(fs.operation)}else if(fs.verdict==="held")finalWitnessTxt="held — the final step ("+dkEsc(fs.operation)+") kept every subcategory within one step of its last kept length, through the closing full paint";else if(fs.verdict==="moved-not-wholesale"){var mt=(fs.transitions||[]).filter(function(t){return t.flung.length})[0];finalWitnessTxt="moved, not wholesale — the "+dkEsc(mt?mt.transition:"")+" moved "+fsFmt(mt)+" past one step, but no wholesale fling (operation: "+dkEsc(fs.operation)+")"}else finalWitnessTxt="not observed — the final step ("+dkEsc(fs.operation||"unknown")+") could not be framed in this run"}
        var paintedWitnessTxt="";if(report.witness&&report.witness.painted){var pw=report.witness.painted,pwTr=function(nm){return (pw.transitions||[]).filter(function(t){return t.transition===nm})[0]||null},pwFmt=function(t){return t?t.flung.map(function(f){return dkEsc(f.label)+" "+dkEsc(f.metric)+" "+Math.round(f.before)+" → "+Math.round(f.after)+(f.toThrown?" (thrown "+Math.round(f.thrown)+")":"")}).join(", "):""},pwPair=pw.capturePair?(" · capture pair: "+dkEsc(pw.capturePair.beforeClosingPaint||"—")+" → "+dkEsc(pw.capturePair.afterClosingPaint||"—")+" → "+dkEsc(pw.capturePair.afterSettle||"—")):"",pwDiv=pw.divergence?" · MEASUREMENT DIVERGENCE — painted segment past one step beyond the bookkeeping delivered radius after the same paint; the witness now reads painted geometry":"";if(pw.verdict==="proven"&&pw.culprit){var pct=pwTr(pw.culprit.transition);paintedWitnessTxt="PROVEN — the "+dkEsc(pw.culprit.transition)+" flung "+pwFmt(pct)+" back out all at once, past one step — operation: "+dkEsc(pw.culprit.operation||pw.operation||"")+pwPair+pwDiv}else if(pw.verdict==="held")paintedWitnessTxt="held — painted branch radius, segment and absolute radius kept every subcategory within one step of its last kept length, through the closing full paint and after settle (capture pair spanning the closing paint)"+pwPair+pwDiv;else if(pw.verdict==="moved-not-wholesale"){var pmt=(pw.transitions||[]).filter(function(t){return t.flung.length})[0];paintedWitnessTxt="moved, not wholesale — the "+dkEsc(pmt?pmt.transition:"")+" moved "+pwFmt(pmt)+" past one step, but no wholesale fling — operation: "+dkEsc(pmt?pmt.operation||"":"")+pwPair+pwDiv}else paintedWitnessTxt="not observed — the painted frames could not be captured in this run"+pwPair+pwDiv}
        var throwTxt="";if(report.throwRadii){var tr=report.throwRadii;throwTxt="branch thrown to "+Math.round(tr.branchTarget)+" — "+tr.branchFactor+" × the center avatar radius ("+Math.round(tr.centerRadius)+") from the center · subcategories thrown to a "+Math.round(tr.subcatTarget)+" segment — "+tr.subcatFactor+" × that radius out from the branch node";if(tr.branchLength==null)throwTxt+=" · branch not converted (no pre-run delivered radius — left at its current length)";if(tr.subcatNotConverted&&tr.subcatNotConverted.length)throwTxt+=" · not converted (left at current length): "+tr.subcatNotConverted.map(function(s){return dkEsc(s)}).join(", ")}if(report.throwRepeat&&report.throwRepeat.throws>1){var twr=report.throwRepeat;throwTxt+=" · throw repeated "+(twr.throws-1)+" extra time"+(twr.throws>2?"s":"")+" — crossing "+(twr.before!=null?Math.round(twr.before):"?")+" → "+(twr.finalAfter!=null?Math.round(twr.finalAfter):"?")+(twr.substantial?" (substantial >75% drop reached)":" (still no >75% drop)")}
        dkReceipt={name:name,before:before,after:after,delta:delta,subcatShrink:subShrinkTxt||null,witness:witnessTxt||null,finalWitness:finalWitnessTxt||null,paintedWitness:paintedWitnessTxt||null,throwInfo:throwTxt||null,skipThrow:(report.fineTune&&report.fineTune.active)?{baseline:report.fineTune.baseline,below:report.fineTune.below}:null,gate:report.gate==="kept"?"kept":(report.gate==="ended-at-category-backout"?"ended-at-category-backout":"reverted"),backoutGate:(report.backoutGate&&report.backoutGate.decision==="rejected")?{code:String(report.backoutGate.code||"ANNEAL-BO-01"),branch:report.backoutGate.branch!=null?String(report.backoutGate.branch):name,phase:report.backoutGate.phase!=null?String(report.backoutGate.phase):null,crossingBefore:report.backoutGate.crossingBefore!=null?Number(report.backoutGate.crossingBefore):null,crossingAfter:report.backoutGate.crossingAfter!=null?Number(report.backoutGate.crossingAfter):null}:null,diagLines:(report.diag&&report.diag.length)?report.diag.map(function(d){return String(d&&d.text||d&&d.code||"")}):null,reason:report.reason?String(report.reason):"",aborted:(report.aborted&&report.aborted.kind)?{kind:String(report.aborted.kind),phase:report.aborted.phase!=null?String(report.aborted.phase):null,iterations:report.aborted.iterations||0}:null,coverage:report.coverage?(report.coverage.actedOn+"/"+report.coverage.totalInBranch+" items"):"",fitdev:(report.fitDeviationTotal!=null&&Number.isFinite(Number(report.fitDeviationTotal)))?Number(report.fitDeviationTotal):null,elapsed:elapsed,startedAtMs:startedAt,fresh:true,awaitingSettle:false};
      }else{
        dkReceipt={name:name,noreport:true,elapsed:elapsed,startedAtMs:startedAt,fresh:true,awaitingSettle:false};
      }
      // Q1: an aborted (budget) or cancelled run names itself ahead
      // of the receipt, with the phase's iteration count — the
      // cascade has already restored the pre-run snapshot.
      if(report&&report.aborted){
        if(report.aborted.kind==="budget")lines.push("<p><b>"+dkEsc(name)+" · aborted: phase "+dkEsc(report.aborted.phase||"")+" exceeded budget</b> — 180 s cap · "+report.aborted.iterations+" iterations · snapshot restored</p>");
        else lines.push("<p><b>"+dkEsc(name)+" · cancelled</b> — stopped during phase "+dkEsc(report.aborted.phase||"")+" · "+report.aborted.iterations+" iterations · snapshot restored</p>");
      }
      renderDkReceipt();
      noteSettlePending();
    }
    // Anneal loop driver (shell only, shared by Anneal all and by
    // the checklist subset loop): calls the existing
    // single-branch cascade verbatim once per branch. For a
    // multi-branch run the branches run in decreasing crossing
    // number, highest first: every branch's crossing number is
    // measured ONCE on the layout as it stands at run start, the
    // order is fixed from that snapshot and is never re-sorted
    // mid-run, so later branches see earlier branches' changes but
    // keep their start order. The run order, with each branch's
    // starting crossing number, is shown in the status log at run
    // start and again in the aggregate receipt. A single-branch
    // run keeps the branch-list order and shows no run-order list.
    // Snapshot, baseline, gate, receipt,
    // termination and disarm all stay inside the cascade per branch;
    // the loop adds no whole-map gate on top — each branch is judged
    // on its own gate only. A category back-out or a 180 s budget
    // abort inside a branch CONTINUES to the next branch and is
    // listed in the aggregate receipt; Cancel STOPS the whole loop.
    // The cascade's own busy helpers restart per branch, so the loop
    // re-pins the busy start to the loop's start after each branch
    // begins — the elapsed readout spans the loop, not one branch.
    async function runAnnealLoop(names,subset){
      if(deknotterRunning||deknotterLoopRunning)return;
      var statusEl=document.getElementById("layoutDeknotterStatus");
      var loopTitle=subset?("Anneal selected ("+(names?names.length:0)+")"):"Anneal all";
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.anneal;
      if(!dk||typeof dk.run!=="function"){if(statusEl)statusEl.innerHTML="<p><b>"+dkEsc(loopTitle)+"</b> — the DeKnotter driver is unavailable in this build.</p>";return}
      if(!names||!names.length){if(statusEl)statusEl.innerHTML="<p><b>"+dkEsc(loopTitle)+"</b> — no branches have rendered yet. Open the map first, then press "+dkEsc(loopTitle)+".</p>";return}
      deknotterLoopRunning=true;deknotterLoopCancelRequested=false;
      var loopStartedAt=Date.now(),results=[],allLines=[],stoppedByCancel=false;
      var isMultiAnneal=names.length>1,startCrossing={},runOrder=names.slice();
      if(isMultiAnneal){try{var snapCross=typeof window.__sxCrossingMeasure==="function"?window.__sxCrossingMeasure():null;if(snapCross&&snapCross.clouds)names.forEach(function(n){var vCross=Number(snapCross.clouds[n]);startCrossing[n]=Number.isFinite(vCross)?vCross:null})}catch(e){startCrossing={}}}
      function annealRunOrderHtml(){if(!isMultiAnneal)return "";var h="<p><b>Run order \u2014 highest crossing first (crossing measured at run start):</b></p>";runOrder.forEach(function(n,idx){h+="<p>"+(idx+1)+". "+dkEsc(n)+" \u2014 crossing "+dkFmtLead(startCrossing[n])+"</p>"});return h}
      function annealRunOrderDetailsHtml(){if(!isMultiAnneal)return "";var items=runOrder.map(function(n,idx){return "<p>"+(idx+1)+". "+dkEsc(n)+" \u2014 crossing "+dkFmtLead(startCrossing[n])+"</p>"}).join("");return dkReceiptDetails("loop:order","le-receipt-l2","<b>Run order \u2014 highest crossing first ("+runOrder.length+")</b>",items,false)}
      if(isMultiAnneal){
        for(var mi=0;mi<names.length;mi++){
          if(startCrossing[names[mi]]==null&&typeof dk.measureCloud==="function"){
            try{
              var mvCross=await dk.measureCloud(names[mi]);
              var mvAdj=typeof window.__sxCrossingStagedCloud==="function"?window.__sxCrossingStagedCloud(names[mi],true):null;
              var effCross=(mvAdj!=null&&Number.isFinite(mvAdj))?Math.max(Number(mvCross||0),Number(mvAdj)):mvCross;
              startCrossing[names[mi]]=(effCross!=null&&Number.isFinite(Number(effCross)))?Number(effCross):null;
            }catch(e){startCrossing[names[mi]]=null}
          }
        }
        runOrder=names.map(function(n,idx){return{name:n,idx:idx,val:startCrossing[n]}}).sort(function(a,b){var av=a.val==null?-Infinity:a.val,bv=b.val==null?-Infinity:b.val;return bv!==av?bv-av:a.idx-b.idx}).map(function(o){return o.name});
      }
      var loopIntro=isMultiAnneal?(subset?("<p><b>"+dkEsc(loopTitle)+"</b> \u2014 running the "+names.length+" picked branches in decreasing crossing order, highest first. Cancel stops the whole loop.</p>"):("<p><b>Anneal all</b> \u2014 running every branch in decreasing crossing order, highest first ("+names.length+" branches). Cancel stops the whole loop.</p>")):(subset?("<p><b>"+dkEsc(loopTitle)+"</b> — running the "+names.length+" picked branch"+(names.length===1?"":"es")+" in branch order: "+names.map(function(n){return dkEsc(n)}).join(", ")+". Cancel stops the whole loop.</p>"):("<p><b>Anneal all</b> — running every branch in order ("+names.length+" branches). Cancel stops the whole loop.</p>"));
      if(statusEl)statusEl.innerHTML=loopIntro+annealRunOrderHtml();
      for(var i=0;i<runOrder.length;i++){
        if(deknotterLoopCancelRequested){stoppedByCancel=true;break}
        var name=runOrder[i];
        var pending=runDeknotterCascade(name,runOrder.length>1?("Annealing "+name+" \u00b7 "+(i+1)+" of "+runOrder.length):null);
        deknotterBusyStart=loopStartedAt;
        await pending;
        var rc=dkReceipt?{name:dkReceipt.name,before:dkReceipt.before,after:dkReceipt.after,delta:dkReceipt.delta,gate:dkReceipt.gate,backoutGate:dkReceipt.backoutGate||null,reason:dkReceipt.reason,error:dkReceipt.error,noreport:dkReceipt.noreport,aborted:dkReceipt.aborted||null,subcatShrink:dkReceipt.subcatShrink||null,witness:dkReceipt.witness||null,finalWitness:dkReceipt.finalWitness||null,paintedWitness:dkReceipt.paintedWitness||null,throwInfo:dkReceipt.throwInfo||null,skipThrow:dkReceipt.skipThrow||null}:null;
        var linesCopy=(dkPhaseLines||[]).slice();
        for(var li=0;li<linesCopy.length;li++)allLines.push(linesCopy[li]);
        // Cancel/timeout detection reads the cascade's structured
        // abort record (report.aborted, carried onto the receipt
        // above) — never the receipt's display wording, so a
        // rewording of the phase lines cannot misclassify a run.
        var wasCancelled=!!(rc&&rc.aborted&&rc.aborted.kind==="cancel");
        var wasBudget=!!(rc&&rc.aborted&&rc.aborted.kind==="budget");
        results.push({name:name,receipt:rc,cancelled:wasCancelled,budget:wasBudget,lines:linesCopy});
        if(wasCancelled||deknotterLoopCancelRequested){stoppedByCancel=true;break}
      }
      deknotterLoopRunning=false;
      dkReceipt=null;dkPhaseLines=allLines;
      var elapsedTotal=((Date.now()-loopStartedAt)/1000).toFixed(1)+" s";
      var sumB=0,sumA=0,sumD=0,haveSum=false,keptN=0,revertedN=0,backedN=0,budgetN=0,cancelledN=0,failedN=0,branchNodes=[];
      results.forEach(function(r){
        var rc2=r.receipt,gateLabel;
        if(r.cancelled){gateLabel="CANCELLED — snapshot restored";cancelledN++}
        else if(r.budget){gateLabel="BUDGET ABORTED — snapshot restored";budgetN++}
        else if(!rc2){gateLabel="NO REPORT";failedN++}
        else if(rc2.error){gateLabel="FAILED";failedN++}
        else if(rc2.noreport){gateLabel="FINISHED — NO REPORT";failedN++}
        else if(rc2.gate==="kept"){gateLabel="KEPT";keptN++}
        else if(rc2.gate==="ended-at-category-backout"){gateLabel="ENDED AT CATEGORY BACK-OUT — backed-out state stands";backedN++}
        else{gateLabel="REVERTED";revertedN++}
        if(rc2&&Number.isFinite(Number(rc2.before))&&Number.isFinite(Number(rc2.after))){haveSum=true;sumB+=Number(rc2.before);sumA+=Number(rc2.after);sumD+=Number(rc2.delta!=null?rc2.delta:(Number(rc2.after)-Number(rc2.before)))}
        var branchSummary="<b>"+dkEsc(r.name)+": crossing "+dkFmtLead(rc2?rc2.before:null)+" \u2192 "+dkFmtLead(rc2?rc2.after:null)+" (\u0394 "+dkFmtLeadDelta(rc2?rc2.delta:null)+") — "+gateLabel+"</b>"+(rc2&&rc2.backoutGate?(" — back-out gate REJECTED ["+dkEsc(rc2.backoutGate.code)+"] at "+dkEsc(rc2.backoutGate.phase||"")+": crossing "+dkFmtLead(rc2.backoutGate.crossingBefore)+" → tripped "+dkFmtLead(rc2.backoutGate.crossingAfter)+", tripped geometry left standing"):"")+(rc2&&rc2.reason?(" — "+dkEsc(rc2.reason)):"")+(rc2&&rc2.error?(" — "+dkEsc(rc2.error)):"")+(rc2&&rc2.skipThrow?(" · throw skipped (crossing below "+dkFmtLead(rc2.skipThrow.below)+") — shrank the subcategories first, then the category, from current lengths"):"")+(rc2&&rc2.throwInfo?(" · throw: "+rc2.throwInfo):"")+(rc2&&rc2.subcatShrink?(" · subcategory shrink: "+rc2.subcatShrink):"")+(rc2&&rc2.witness?(" · witness: "+rc2.witness):"")+(rc2&&rc2.finalWitness?(" · final-step witness: "+rc2.finalWitness):"")+(rc2&&rc2.paintedWitness?(" · painted-geometry witness: "+rc2.paintedWitness):"");
        var branchBody=(r.lines&&r.lines.length)?r.lines.join(""):"<p>No phase lines were recorded for this branch.</p>";
        branchNodes.push(dkReceiptDetails("loop:branch:"+r.name,"le-receipt-l2",branchSummary,branchBody,false));
      });
      var lead="<p><b>"+dkEsc(loopTitle)+" — "+results.length+" of "+names.length+" branches run · crossing "+(haveSum?(dkFmtLead(sumB)+" \u2192 "+dkFmtLead(sumA)+" (\u0394 "+dkFmtLeadDelta(sumD)+")"):"—")+" · kept "+keptN+" · reverted "+revertedN+" · backed out "+backedN+" · budget-aborted "+budgetN+(cancelledN?(" · cancelled "+cancelledN):"")+(failedN?(" · failed "+failedN):"")+" · "+elapsedTotal+" total</b>"+(stoppedByCancel?" — Cancel stopped the whole loop; branches not yet run were left untouched.":"")+"</p>";
      var loopNote="<p>Loop totals are the sum of the per-branch results; each branch was kept or reverted on its own gate.</p>";
      if(statusEl)statusEl.innerHTML=dkReceiptDetails("loop:"+loopTitle,"le-receipt-l1",dkReceiptSummaryInner(lead),loopNote+annealRunOrderDetailsHtml()+branchNodes.join(""),true);
      try{sync()}catch(e){__sxErrLog("anneal-all-end-sync",e)}
    }
    // Whole-map press entry point: the shared loop driver over the
    // full branch list. The checklist subset press calls
    // runAnnealLoop(names,true) directly, with subset totals only.
    function runAnnealAllLoop(names){return runAnnealLoop(names,false)}
    var deknotterBtnEl=document.getElementById("layoutAnnealBtn");
    if(deknotterBtnEl)deknotterBtnEl.addEventListener("click",function(){onDeknotterClick()});
    // Checklist bindings: ticking a row re-syncs the Anneal button's
    // scope label/tooltip; Select all / Clear set every row at once.
    // Nothing here is cleared by a run (S5). MAP SYNC (ruled
    // 2026-11-01, Jason): checking a row also selects that branch
    // on the map (selectOnMap, the branch picker's own path), so
    // list and map stay in sync both ways — the map-to-list half
    // is checkAnnealBranchFromMap at focusEditorOn above.
    var annealCheckRowsEl=document.getElementById("layoutAnnealChecklistRows");
    if(annealCheckRowsEl)annealCheckRowsEl.addEventListener("click",function(event){var opt=event.target&&event.target.closest?event.target.closest("[data-anneal-check]"):null;if(!opt)return;var nowOn=opt.getAttribute("aria-selected")!=="true";opt.setAttribute("aria-selected",String(nowOn));syncDeknotterBtn();if(nowOn)selectOnMap(opt.getAttribute("data-value"))});
    var annealTriggerEl=document.getElementById("layoutAnnealTrigger"),annealMenuEl=document.getElementById("layoutAnnealMenu");
    function closeAnnealMenu(){if(annealMenuEl){annealMenuEl.hidden=true;annealMenuEl.style.left="";annealMenuEl.style.top=""}if(annealTriggerEl)annealTriggerEl.setAttribute("aria-expanded","false")}
    if(annealTriggerEl&&annealMenuEl){annealTriggerEl.addEventListener("click",function(){if(annealMenuEl.hidden){buildAnnealChecklist();refreshAnnealCrossings();openLeMenu(annealTriggerEl,annealMenuEl,closeBranchOrderMenu)}else closeAnnealMenu()});document.addEventListener("pointerdown",function(event){if(!annealMenuEl.hidden&&!annealMenuEl.contains(event.target)&&event.target!==annealTriggerEl&&!annealTriggerEl.contains(event.target))closeAnnealMenu()});document.addEventListener("keydown",function(event){if(event.key==="Escape"&&!annealMenuEl.hidden){closeAnnealMenu();annealTriggerEl.focus()}})}
    var annealCheckAllEl=document.getElementById("layoutAnnealCheckAll");
    if(annealCheckAllEl)annealCheckAllEl.addEventListener("click",function(){buildAnnealChecklist();setAnnealChecklist(true)});
    var annealCheckClearEl=document.getElementById("layoutAnnealCheckClear");
    if(annealCheckClearEl)annealCheckClearEl.addEventListener("click",function(){setAnnealChecklist(false)});
    // Q1: the busy state's Cancel control — sets the flag the
    // solver's per-iteration poll reads; the run stops mid-phase,
    // restores the snapshot, and reports the cancel.
    var deknotterCancelEl=document.getElementById("layoutDeknotterCancel");
    if(deknotterCancelEl)deknotterCancelEl.addEventListener("click",function(){
      if(!deknotterRunning&&!deknotterLoopRunning)return;
      if(deknotterLoopRunning)deknotterLoopCancelRequested=true;
      deknotterCancelRequested=true;
      deknotterCancelEl.disabled=true;
      deknotterCancelEl.textContent="Cancelling…";
    });
