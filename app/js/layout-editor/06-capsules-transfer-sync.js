    function settingsHash(){var c=collect(),parts=[(bundles[c.spacing]?"layout-spacing="+c.spacing:""),"layout-branchOrder="+(c.branchOrder||"landscape-antipodal"),"layout-propFan="+(c.propFan?1:0),"layout-subcatOrder="+(c.subcatOrder?1:0),"layout-staggerDensity="+(c.staggerDensity?1:0),"layout-stagger="+(c.stagger?1:0),"layout-expandAll="+(c.expandAll?1:0),"layout-collision="+c.collision,"layout-crossmin="+(c.crossmin?1:0),"layout-nudge="+(c.nudge?1:0),"layout-showRelations="+(c.showRelations?1:0),"layout-spokeLen="+c.spokeLen.toFixed(2),"layout-subLen="+c.subLen.toFixed(2),"layout-pad="+c.pad.toFixed(2),"layout-repulsion="+c.repulsion.toFixed(2),"layout-repulsionEnabled="+(c.repulsionEnabled===false?0:1),"layout-staticMap="+(c.staticMap?1:0),"layout-animations="+(c.animations?1:0),"layout-mapSliders="+(c.mapSliders?1:0),"layout-fontScale="+(Number(c.fontScale)||1).toFixed(2),"layout-centerRingScale="+(Number(c.centerRingScale)||1).toFixed(2),"layout-leafOvergrowth="+(Number(c.leafOvergrowth)||300),"layout-autoShrinkFactor="+(Number(c.autoShrinkFactor)||.76).toFixed(2),"layout-subcatCloudShrinkFactor="+(Number(c.subcatCloudShrinkFactor)||.76).toFixed(2)],overrides=c.branchOverrides||{};if(Object.keys(overrides).length){var packed=btoa(unescape(encodeURIComponent(JSON.stringify(overrides)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");parts.push("layout-branches="+packed)}var extraGroups=[["layout-subcatOverrides",c.subcatOverrides],["layout-kinkOverrides",c.kinkOverrides],["layout-nodeOverrides",c.nodeOverrides],["layout-subcatAngleOffsets",c.subcatAngleOffsets],["layout-kinkAngleOffsets",c.kinkAngleOffsets],["layout-branchSpokeAutoShrink",c.branchSpokeAutoShrink],["layout-subcatSpokeAutoShrink",c.subcatSpokeAutoShrink]];extraGroups.forEach(function(pair){var obj=pair[1]||{};if(Object.keys(obj).length){parts.push(pair[0]+"="+btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,""))}});return "#"+parts.join("&")}
    var layoutCopyStatusTimer=null;function showLayoutCopied(){var status=document.getElementById("layoutCopyStatus");if(!status)return;status.textContent="Link copied";if(layoutCopyStatusTimer)clearTimeout(layoutCopyStatusTimer);layoutCopyStatusTimer=setTimeout(function(){layoutCopyStatusTimer=null;status.textContent=""},2500)}
    function showLayoutCopyFailed(){var status=document.getElementById("layoutCopyStatus");if(!status)return;status.textContent="Couldn't copy — use Export settings instead";if(layoutCopyStatusTimer)clearTimeout(layoutCopyStatusTimer);layoutCopyStatusTimer=setTimeout(function(){layoutCopyStatusTimer=null;status.textContent=""},4000)}
    // Copy layout settings (Group 4, G4-5): the copy must work in ANY
    // editor state, so building the link is guarded (a hashing error
    // reports instead of dying silently), the async clipboard API is
    // attempted first with a synchronous-selection fallback, and every
    // outcome — success or failure — shows feedback in the status span.
    document.getElementById("layoutCopy").addEventListener("click",function(){var settings;try{settings=window.location.href.split("#")[0]+settingsHash()}catch (error) { __sxErrLog("layout-copy-hash", error);showLayoutCopyFailed();return }function fallback(){var area=document.createElement("textarea");area.value=settings;area.setAttribute("readonly","");area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();var ok=false;try{ok=!!document.execCommand("copy")}catch (error) { __sxErrLog("clipboard", error); }area.remove();if(ok)showLayoutCopied();else showLayoutCopyFailed()}if(navigator.clipboard&&navigator.clipboard.writeText){var pending=null;try{pending=navigator.clipboard.writeText(settings)}catch (error) { __sxErrLog("clipboard-write", error); }if(pending&&typeof pending.then==="function")pending.then(showLayoutCopied).catch(function(){fallback()});else fallback()}else fallback()});
    // Reorganization wiring (Build 2026-10-19_1636): popup sliders, popup
    // multi-state toggles, the power-user reveal, For All buttons, and
    // the settings export. A popup slider's button row shows the name
    // and current value; tapping opens the slider inline (closing any
    // other open popup in the editor). A multi-state toggle (.le-ms)
    // shows only its current state until tapped open, like the
    // branch-order picker.
    // LR-G2: capsule sliders (Pattern 2) — a .le-capsule popslider shows
    // only its button (label + value output) at rest; on open, its pop is
    // a fixed-position overlay anchored to the capsule (positionLeCapsule,
    // viewport-clamped), never in layout flow, so the editor's scroll
    // height never changes. Close triggers: range pointer-up/cancel (the
    // gesture ends on release, like the rating sliders — no confirm step),
    // Escape, pointerdown outside the open capsule, re-clicking the
    // capsule, or another popup opening (closeLePopups one-at-a-time).
    // The range inputs, their ids, and the coalesceSlider input wiring
    // are unchanged — this layer is presentation only.
    function positionLeCapsule(wrap,pop){
      var btn=wrap.querySelector(".le-popslider-btn");if(!btn)return;
      var r=btn.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
      var left=Math.min(Math.max(r.left,8),Math.max(8,window.innerWidth-w-8));
      var top=r.bottom+6;
      if(top+h>window.innerHeight-8)top=r.top-h-6;
      if(top<8)top=Math.max(8,window.innerHeight-h-8);
      pop.style.left=left+"px";pop.style.top=top+"px";
    }
    function closeLeCapsule(wrap){
      var pop=wrap.querySelector(".le-popslider-pop"),btn=wrap.querySelector(".le-popslider-btn");
      wrap.classList.remove("is-open");
      if(pop){pop.hidden=true;pop.style.left="";pop.style.top=""}
      if(btn)btn.setAttribute("aria-expanded","false");
    }
    function closeLePopups(except){
      panel.querySelectorAll(".le-popslider.is-open").forEach(function(p){if(p===except)return;if(p.classList.contains("le-capsule")){closeLeCapsule(p);return}p.classList.remove("is-open");var pop=p.querySelector(".le-popslider-pop"),btn=p.querySelector(".le-popslider-btn");if(pop)pop.hidden=true;if(btn)btn.setAttribute("aria-expanded","false")});
      panel.querySelectorAll(".le-ms.is-open").forEach(function(m){if(m!==except)m.classList.remove("is-open")});
    }
    panel.querySelectorAll(".le-popslider-btn").forEach(function(btn){
      btn.addEventListener("click",function(){
        var wrap=btn.closest(".le-popslider");if(!wrap)return;
        var pop=wrap.querySelector(".le-popslider-pop"),willOpen=pop&&pop.hidden;
        closeLePopups(wrap);
        if(pop){pop.hidden=!willOpen;wrap.classList.toggle("is-open",!!willOpen);btn.setAttribute("aria-expanded",String(!!willOpen))}
        // LR-G2: anchor the capsule's overlay to it on open; clear the
        // anchor again on close so no stale fixed position survives.
        if(pop&&wrap.classList.contains("le-capsule")){if(willOpen)positionLeCapsule(wrap,pop);else{pop.style.left="";pop.style.top=""}}
        // Focus the pop's range input on open so arrow keys drive it.
        // The synchronous focus covers the common case; the deferred
        // retry (next frame, once the just-unhidden pop has laid out)
        // re-asserts it if that first call was dropped, but only while
        // the pop is still open and the input is enabled — and never
        // when focus already landed, so the controls that already
        // worked are untouched.
        if(willOpen&&pop){var popRange=pop.querySelector("input[type=range]");if(popRange){popRange.focus();SexcapadesRuntime.TimerManager.requestAnimationFrame(function(){if(!pop.hidden&&wrap.classList.contains("is-open")&&!popRange.disabled&&document.activeElement!==popRange)popRange.focus()})}}
      });
    });
    // LR-G2: capsule close triggers beyond the shared toggle above —
    // releasing the pointer after interacting with the overlay's range
    // ends the gesture and collapses the capsule (live commit already
    // happened through the range's input events during the drag);
    // pointerdown anywhere outside the open capsule dismisses it; and
    // Escape (captured, so it closes the capsule instead of falling
    // through to the editor-level Escape that clears the selection or
    // closes the editor) dismisses it and returns focus to the capsule.
    // Release is observed in the CAPTURE phase at document level, armed
    // by pointerdown on the range: during a range drag this app stops
    // pointerup before the target/bubble phases ever see it (observed
    // live — only window/document capture listeners fire), so a
    // target-phase pointerup listener on the range would never run.
    var leCapsuleGesture=null;
    panel.querySelectorAll(".le-popslider.le-capsule").forEach(function(wrap){
      var pop=wrap.querySelector(".le-popslider-pop");if(!pop)return;
      var range=pop.querySelector("input[type=range]");if(!range)return;
      range.addEventListener("pointerdown",function(){leCapsuleGesture=wrap});
    });
    document.addEventListener("pointerup",function(){
      var wrap=leCapsuleGesture;leCapsuleGesture=null;
      if(wrap&&wrap.classList.contains("is-open"))closeLeCapsule(wrap);
    },true);
    document.addEventListener("pointercancel",function(){
      var wrap=leCapsuleGesture;leCapsuleGesture=null;
      if(wrap&&wrap.classList.contains("is-open"))closeLeCapsule(wrap);
    },true);
    document.addEventListener("pointerdown",function(event){
      var open=panel.querySelector(".le-popslider.le-capsule.is-open");
      if(open&&!open.contains(event.target))closeLeCapsule(open);
    });
    document.addEventListener("keydown",function(event){
      if(event.key!=="Escape")return;
      var open=panel.querySelector(".le-popslider.le-capsule.is-open");
      if(!open)return;
      event.preventDefault();event.stopImmediatePropagation();
      var btn=open.querySelector(".le-popslider-btn");
      closeLeCapsule(open);
      if(btn)btn.focus();
    },true);
    panel.querySelectorAll(".le-ms").forEach(function(box){
      // Layout groups Phase 2 (Q10): the Collision mode group is no
      // longer a .le-ms at all — it is a selector-button + menu overlay
      // wired with the Phase 2 block below — so it never reaches this
      // loop; the id guard stays as a harmless belt-and-braces check.
      if(box.id==="layoutCollisionMs")return;
      box.addEventListener("click",function(){
        if(!box.classList.contains("is-open")){closeLePopups(box);box.classList.add("is-open");return}
        box.classList.remove("is-open");
      });
    });
    document.addEventListener("pointerdown",function(event){if(!panel.contains(event.target))closeLePopups(null)});
    // LR-G5: the collision-mode state lives in the mode group (collect()
    // reads the pressed button as the mode) and applyCollisionMode()
    // carries the former hidden select change handler's effects
    // — lastCollision, the master Collision avoidance switch, and
    // apply() — exactly as before.
    // Layout groups Phase 2 (Q10): the group is now the pop-up menu of a
    // selector-button — the four-pill segmented row is retired. At rest
    // only #layoutCollisionBtn shows, carrying the current mode; tapping
    // it opens the #layoutCollisionMs menu overlay; picking a mode
    // presses it, runs applyCollisionMode(), closes the menu, and
    // returns focus to the button.
    var collisionMs=document.getElementById("layoutCollisionMs");
    var collisionBtn=document.getElementById("layoutCollisionBtn");
    if(collisionMs&&collisionBtn){
      collisionMs.querySelectorAll("[data-collision-mode]").forEach(function(btn){
        btn.addEventListener("click",function(){
          setCollisionMode(btn.dataset.collisionMode);
          syncCollisionAnchor();
          applyCollisionMode(btn.dataset.collisionMode);
          closeCollisionMenu();
          collisionBtn.focus();
        });
      });
      collisionBtn.addEventListener("click",function(){if(collisionMs.hidden)openLeMenu(collisionBtn,collisionMs,closeBranchOrderMenu);else closeCollisionMenu()});
      document.addEventListener("pointerdown",function(event){if(!collisionMs.hidden&&!collisionMs.contains(event.target)&&event.target!==collisionBtn&&!collisionBtn.contains(event.target))closeCollisionMenu()});
      document.addEventListener("keydown",function(event){if(event.key==="Escape"&&!collisionMs.hidden){closeCollisionMenu();collisionBtn.focus()}});
      syncCollisionAnchor();
    }
    // Solver-mode toggle wiring: mirrors the collision selector above.
    // Picking a mode presses it, runs the plain full apply with the
    // picked mode (live model update + repaint under the new mode +
    // cross-tab broadcast), then upserts the layout-solverMidline hash
    // token so a reload keeps the choice. No branch selection is
    // required, and the control sits outside .layout-editor-branch, so
    // it stays live during Anneal runs.
    var solverModeMenu=document.getElementById("layoutSolverModeMenu");
    var solverModeBtn=document.getElementById("layoutSolverModeBtn");
    if(solverModeMenu&&solverModeBtn){
      solverModeMenu.querySelectorAll("[data-solver-mode]").forEach(function(btn){
        btn.addEventListener("click",function(){
          setSolverMode(btn.dataset.solverMode);
          applySolverMode(btn.dataset.solverMode);
          closeSolverModeMenu();
          solverModeBtn.focus();
        });
      });
      solverModeBtn.addEventListener("click",function(){if(solverModeMenu.hidden)openLeMenu(solverModeBtn,solverModeMenu,closeCollisionMenu);else closeSolverModeMenu()});
      document.addEventListener("pointerdown",function(event){if(!solverModeMenu.hidden&&!solverModeMenu.contains(event.target)&&event.target!==solverModeBtn&&!solverModeBtn.contains(event.target))closeSolverModeMenu()});
      document.addEventListener("keydown",function(event){if(event.key==="Escape"&&!solverModeMenu.hidden){closeSolverModeMenu();solverModeBtn.focus()}});
      setSolverMode(config().solverMidline);
    }
    // Layout groups Phase 2 (Q9): every capsule overlay carries an
    // editable number field beside its range, so precision entry
    // survives inside the overlay — range-only would be a capability
    // regression. The field mirrors the range (the value the slider
    // itself holds, in the slider's own units); committing it (change
    // or Enter) clamps to the range's min/max, writes the range, and
    // dispatches input+change so the existing coalesceSlider wiring
    // applies it exactly as a drag would — the layoutFontScaleNum
    // precedent. While the range moves, the field follows it; on
    // capsule open it refreshes value and disabled state from the range.
    panel.querySelectorAll(".le-popslider.le-capsule").forEach(function(wrap){
      var pop=wrap.querySelector(".le-popslider-pop");if(!pop)return;
      var range=pop.querySelector("input[type=range]"),num=pop.querySelector("input.le-capsule-num");if(!range||!num)return;
      function refreshCapsuleNum(){if(document.activeElement!==num)num.value=range.value;num.disabled=range.disabled}
      function commitCapsuleNum(){var v=Number(num.value);if(!Number.isFinite(v)){num.value=range.value;return}var min=Number(range.min),max=Number(range.max);if(Number.isFinite(min))v=Math.max(min,v);if(Number.isFinite(max))v=Math.min(max,v);range.value=String(v);num.value=range.value;range.dispatchEvent(new Event("input",{bubbles:true}));range.dispatchEvent(new Event("change",{bubbles:true}));refreshCapsuleNum()}
      range.addEventListener("input",refreshCapsuleNum);
      range.addEventListener("change",refreshCapsuleNum);
      num.addEventListener("change",commitCapsuleNum);
      num.addEventListener("keydown",function(event){if(event.key==="Enter"){event.preventDefault();commitCapsuleNum()}});
      var capsuleBtn=wrap.querySelector(".le-popslider-btn");if(capsuleBtn)capsuleBtn.addEventListener("click",refreshCapsuleNum);
      refreshCapsuleNum();
    });
    // Power-user toggle: reveal (or collapse) every section's Advanced
    // block at once. Individual Advanced blocks still open on their own.
    var powerToggle=document.getElementById("layoutPowerUser");
    if(powerToggle)powerToggle.addEventListener("change",function(){
      panel.classList.toggle("le-power",!!powerToggle.checked);
      panel.querySelectorAll(".le-adv").forEach(function(d){d.open=!!powerToggle.checked});
      scheduleLiveSync();
    });
    // Fullscreen mode (Build 2026-10-19_1742): the Fullscreen button
    // fills the screen with the editor and switches it to a dense
    // multi-column tuning console (see the .layout-fullscreen styles).
    // It pairs with cross-tab live sync: keep this editor fullscreen in
    // one window and watch the map update live in another. Escape
    // leaves fullscreen; the close button works exactly as before.
    var fullscreenBtn=document.getElementById("layoutFullscreen");
    function setLayoutFullscreen(on){if(on&&panel.classList.contains("layout-minimised"))setLayoutMinimised(false);panel.classList.toggle("layout-fullscreen",!!on);if(fullscreenBtn){fullscreenBtn.setAttribute("aria-label",on?"Exit fullscreen":"Fullscreen");fullscreenBtn.setAttribute("aria-pressed",String(!!on))}if(!editorSyncGuard)scheduleLiveSync();syncPanelDock()}
    if(fullscreenBtn)fullscreenBtn.addEventListener("click",function(){setLayoutFullscreen(!panel.classList.contains("layout-fullscreen"))});
    document.addEventListener("keydown",function(event){if(event.key==="Escape"&&panel.classList.contains("layout-fullscreen")){event.preventDefault();event.stopPropagation();setLayoutFullscreen(false)}},true);
    // Panel minimise + map reframe (repair for the panel blocking the
    // kink cloud mid-Anneal): Minimise collapses the panel to the
    // status strip (#layoutEditorStrip) — display-only; the body is
    // hidden, never rebuilt, so a run in flight is untouched and every
    // receipt is still there on Expand. The strip mirrors the run's
    // own live state (AnnealCloudOverlay branch/value, the busy clock)
    // on a light timer that runs only while minimised, and its Cancel
    // button clicks the run's real Cancel control, so single-branch
    // and Anneal-all cancels behave exactly as from the full panel.
    // syncPanelDock drives the html.le-panel-docked reservation that
    // keeps the working cloud in the open map area while the full
    // panel is up (see the CSS note).
    var minimiseBtn=document.getElementById("layoutEditorMinimise"),expandBtn=document.getElementById("layoutEditorExpand"),stripStatus=document.getElementById("layoutStripStatus"),stripCancel=document.getElementById("layoutStripCancel"),stripTimer=null;
    function syncPanelDock(){var docked=!panel.hidden&&!panel.classList.contains("layout-minimised")&&!panel.classList.contains("layout-fullscreen");document.documentElement.classList.toggle("le-panel-docked",docked)}
    function paintStrip(){
      if(!stripStatus)return;
      var running=deknotterRunning||deknotterLoopRunning;
      if(running){
        var cross=AnnealCloudOverlay.value;
        var secs=deknotterBusyStart?((Date.now()-deknotterBusyStart)/1000).toFixed(1)+"s":"";
        stripStatus.innerHTML="<b>"+dkEsc(AnnealCloudOverlay.branch||"Anneal")+"</b>"+(cross!=null&&Number.isFinite(Number(cross))?" · crossing <span class=\"le-strip-cross\">"+dkEsc(dkFmtLead(Number(cross)))+"</span>":"")+(secs?" · <span class=\"le-strip-elapsed\">"+secs+"</span>":"");
      }else{
        stripStatus.textContent="Layout editor — minimised";
      }
      if(stripCancel){var real=document.getElementById("layoutDeknotterCancel");stripCancel.hidden=!running;if(running&&real){stripCancel.disabled=!!real.disabled;stripCancel.textContent=real.disabled?"Cancelling…":"Cancel anneal"}}
    }
    function setLayoutMinimised(on){
      panel.classList.toggle("layout-minimised",!!on);
      if(minimiseBtn)minimiseBtn.setAttribute("aria-expanded",String(!on));
      if(on){paintStrip();if(stripTimer===null)stripTimer=SexcapadesRuntime.TimerManager.setInterval(paintStrip,250)}
      else if(stripTimer!==null){SexcapadesRuntime.TimerManager.clear(stripTimer);stripTimer=null}
      syncPanelDock();
    }
    if(minimiseBtn)minimiseBtn.addEventListener("click",function(){if(panel.classList.contains("layout-fullscreen"))setLayoutFullscreen(false);setLayoutMinimised(true);if(expandBtn)expandBtn.focus({preventScroll:true})});
    if(expandBtn)expandBtn.addEventListener("click",function(){setLayoutMinimised(false);if(minimiseBtn)minimiseBtn.focus({preventScroll:true})});
    if(stripCancel)stripCancel.addEventListener("click",function(){var real=document.getElementById("layoutDeknotterCancel");if(real&&!real.disabled)real.click()});
    // Layout groups Phase 1 (Q3/Q5): the Tilt-each-branch drawer under
    // the rails, and the Measurements strip's chip state. The tilt
    // block lives in the drawer; its trigger button sits in the
    // Selection section's Advanced area where the block used to live.
    // The strip collapses to a chip (label + picker only) while the
    // measurement is Off, via the le-metric-off class.
    var tiltDrawer=document.getElementById("layoutTiltDrawer");
    var tiltDrawerBtn=document.getElementById("layoutTiltDrawerBtn");
    function setTiltDrawer(open){if(!tiltDrawer)return;tiltDrawer.hidden=!open;if(tiltDrawerBtn)tiltDrawerBtn.setAttribute("aria-expanded",String(!!open))}
    if(tiltDrawerBtn&&tiltDrawer)tiltDrawerBtn.addEventListener("click",function(){setTiltDrawer(tiltDrawer.hidden)});
    var tiltDrawerClose=document.getElementById("layoutTiltDrawerClose");
    if(tiltDrawerClose)tiltDrawerClose.addEventListener("click",function(){setTiltDrawer(false);if(tiltDrawerBtn)tiltDrawerBtn.focus()});
    var metricSection=document.getElementById("layoutMeasureGroup");
    var metricSelect=document.getElementById("layoutMetricSelect");
    function syncMetricStrip(){if(!metricSection||!metricSelect)return;metricSection.classList.toggle("le-metric-off",metricSelect.value==="off");if(panel.classList.contains("layout-fullscreen")){var evSec=document.getElementById("layoutSectionEveryday");if(evSec)evSec.open=true}}
    if(metricSelect)metricSelect.addEventListener("change",syncMetricStrip);
    if(fullscreenBtn)fullscreenBtn.addEventListener("click",syncMetricStrip);
    syncMetricStrip();
    // LR-G3: two-box level-scoped arming. The 12 per-row for-all
    // checkboxes are replaced by level boxes per selection group:
    // branch group and sub-group group carry "For all subcategories"
    // and "For all kinks"; the topic group carries "For all kinks"
    // only. An actuator applies globally at its own level iff the box
    // naming its level is armed in its group; the batch it then runs
    // is the SAME closure the old per-row box drove (bindForAll
    // registers each into lrG3ForAllFns) over the untouched
    // forallApply below. Branch-level actuators (branch line length,
    // Tilt, Auto-shrink branch spoke) have no box in this first pass
    // and always apply to the selected branch only.
    var lrG3ForAllFns={};
    var lrG3ArmBoxes={branch:{subs:"layoutBranchArmSubs",kinks:"layoutBranchArmKinks"},kink:{kinks:"layoutKinkArmKinks"},subcat:{subs:"layoutSubcatArmSubs"}};
    var lrG3EchoRows=[["layoutBranchKinkLen","branch","kinks","· all kinks"],["layoutBranchSubLen","branch","subs","· all subcategories"],["layoutKinkLen","kink","kinks","· all kinks"],["layoutKinkAngle","kink","kinks","· all kinks"],["layoutSubcatLen","subcat","subs","· all subcategories"],["layoutSubcatAngle","subcat","subs","· all subcategories"],["layoutSubcatSpokeAutoShrink","subcat","subs","· all subcategories"]];
    function lrG3Armed(group,level){var g=lrG3ArmBoxes[group],id=g&&g[level],b=id&&document.getElementById(id);return !!(b&&b.checked)}
    // F2: actuators consult live level state directly — no per-row
    // id translation layer. The batch closure is keyed by
    // group|level|control in lrG3ForAllFns (see bindForAll).
    function lrG3Divert(group,level,ctrl){if(!lrG3Armed(group,level))return false;var fn=lrG3ForAllFns[group+"|"+level+"|"+ctrl];if(!fn)return false;function done(){showAppliedAll(group==="branch"?"Applied to all branches.":group==="kink"?"Applied to all topics.":"Applied to all sub-groups.")}var r;try{r=fn()}catch(e){__sxErrLog("layout-forall",e);return true}if(r&&typeof r.then==="function")r.then(done,function(){});else done();return true}
    function lrG3SyncEcho(){lrG3EchoRows.forEach(function(row){var el=document.getElementById(row[0]);if(!el)return;var host=el.closest?el.closest(".le-sel-control"):null;if(!host)return;var echo=host.querySelector(".le-arm-echo");if(!echo){echo=document.createElement("span");echo.className="le-arm-echo";host.appendChild(echo)}echo.textContent=row[3];echo.hidden=!lrG3Armed(row[1],row[2])})}
    function lrG3CollectArmScope(){var out={};Object.keys(lrG3ArmBoxes).forEach(function(g){out[g]={};Object.keys(lrG3ArmBoxes[g]).forEach(function(l){var b=document.getElementById(lrG3ArmBoxes[g][l]);out[g][l]=!!(b&&b.checked)})});return out}
    function lrG3ApplyArmScope(sc){if(!sc||typeof sc!=="object")return;Object.keys(lrG3ArmBoxes).forEach(function(g){var gv=sc[g];if(!gv||typeof gv!=="object")return;Object.keys(lrG3ArmBoxes[g]).forEach(function(l){if(typeof gv[l]==="boolean"){var b=document.getElementById(lrG3ArmBoxes[g][l]);if(b)b.checked=gv[l]}})});lrG3SyncEcho()}
    Object.keys(lrG3ArmBoxes).forEach(function(g){Object.keys(lrG3ArmBoxes[g]).forEach(function(l){var b=document.getElementById(lrG3ArmBoxes[g][l]);if(b)b.addEventListener("change",function(){lrG3SyncEcho();if(!editorSyncGuard)scheduleLiveSync()})})});
    lrG3SyncEcho();
    // For All buttons: push the paired control's current value to every
    // branch / subcategory / topic at once, writing the same override
    // shapes the per-selection handlers write.
    function forallApply(mutator){var next=collect();mutator(next);syncNodeOverrides(next);apply(next);scheduleMetric()}
    function allSubcatNames(){var api=window.__SEXCAPADES_LAYOUT_API;return (api&&api.subcategories)?api.subcategories():[]}
    function allTopicIds(){var api=window.__SEXCAPADES_LAYOUT_API;return ((api&&api.topics)?api.topics():[]).map(function(t){return t.id})}
    var layoutAllStatusTimer=null;function showAppliedAll(message){var status=document.querySelector(".layout-editor-status")||document.getElementById("layoutCopyStatus");if(!status)return;status.textContent=message;if(layoutAllStatusTimer)clearTimeout(layoutAllStatusTimer);layoutAllStatusTimer=setTimeout(function(){layoutAllStatusTimer=null;status.textContent=""},2500)}
    // Apply-to-all display truth (Group 4, G4-10): checking a For-All
    // box propagates the paired control's value to every group AND
    // the box stays ticked — the tick is the record that this value
    // is the one applied to all, so displayed state equals actual
    // state after every click. (The old code unticked the box inside
    // the same task, before the browser could paint it, so clicks
    // engaged propagation while the box never showed checked.)
    // Unticking by hand just clears the record. (F2: arm state lives
    // only in the level boxes — lrG3ArmBoxes, mirrored across windows
    // by lrG3CollectArmScope / lrG3ApplyArmScope. The old per-row
    // disarm calls targeted boxes already removed from the markup,
    // so they never unticked anything; they are deleted, not moved.)
    // F2: bindForAll only registers the batch closure under its
    // group|level|control key. The change-listener attach it used to
    // perform targeted the removed per-row boxes (it found no
    // element) and is deleted with them.
    function bindForAll(group,level,ctrl,fn){lrG3ForAllFns[group+"|"+level+"|"+ctrl]=fn}
    // Rank 8: the branch|branch|branchLen, branch|branch|branchAngle and
    // branch|branch|branchSpokeAutoShrink batch closures are REMOVED, not
    // rewired. Evidence they could never fire: no LR_ACT entry diverts to
    // a branch|branch key, lrG3ArmBoxes has no branch-level box so
    // lrG3Armed("branch","branch") can never be true, bindForAll no
    // longer attaches listeners, and the LR-G3 note above states
    // branch-level actuators always apply to the selected branch only.
    // The seven batches below are the ones a divert can reach.
    bindForAll("branch","subs","branchSubLen",function(){var v=Number(document.getElementById("layoutBranchSubLen").value)||1;forallApply(function(next){next.branchOverrides=copyOverrides(next.branchOverrides);next.subcatOverrides=copyOverrides(next.subcatOverrides);branchNames().forEach(function(name){next.branchOverrides[name]=branchOverrideEntry(next.branchOverrides[name],{subScale:v},name);branchMembers(name).subs.forEach(function(s){next.subcatOverrides[s]=subcatOverrideEntry(next.subcatOverrides[s],{length:bakedSubBase(s,"length")*v})})})})});
    bindForAll("branch","kinks","branchKinkLen",function(){var v=Number(document.getElementById("layoutBranchKinkLen").value)||1;forallApply(function(next){next.branchOverrides=copyOverrides(next.branchOverrides);next.kinkOverrides=copyOverrides(next.kinkOverrides);next.subcatOverrides=copyOverrides(next.subcatOverrides);branchNames().forEach(function(name){next.branchOverrides[name]=branchOverrideEntry(next.branchOverrides[name],{kinkScale:v},name);var members=branchMembers(name),cloudSubs={};members.kinks.forEach(function(e){if(e.subcategory){cloudSubs[e.subcategory]=true}else{next.kinkOverrides[e.id]=kinkOverrideEntry(bakedKinkBase(e.id)*v)}});Object.keys(cloudSubs).forEach(function(s){next.subcatOverrides[s]=subcatOverrideEntry(next.subcatOverrides[s],{cloud:bakedSubBase(s,"cloud")*v})})})})});
    // F6: ONE parameterized for-all handler for the shrink switches
    // (kind x scope x names source). Writes the tri-state type for
    // every name in scope: checked -> explicit true (armed) for all,
    // unchecked -> explicit false (veto) for all.
    function shrinkForAll(kind,level,key,checkboxId,mapKey,namesFn){bindForAll(kind,level,key,function(){var on=document.getElementById(checkboxId).checked;return shrinkBusy(null,function(){forallApply(function(next){next[mapKey]=Object.assign({},next[mapKey]||{});namesFn().forEach(function(name){if(on)next[mapKey][name]=true;else next[mapKey][name]=false})})})})}
    // Rank 8: branch|branch|branchSpokeAutoShrink batch removed — see the
    // note above the live batches; the subcat batch below stays live.
    bindForAll("kink","kinks","kinkLen",function(){var rel=relClamp(document.getElementById("layoutKinkLen").value);forallApply(function(next){next.kinkOverrides=copyOverrides(next.kinkOverrides);allTopicIds().forEach(function(id){next.kinkOverrides[id]=kinkOverrideEntry(rel*bakedKinkBase(id))})})});
    bindForAll("kink","kinks","kinkAngle",function(){var v=Number(document.getElementById("layoutKinkAngle").value);forallApply(function(next){next.kinkAngleOffsets=copyOverrides(next.kinkAngleOffsets);allTopicIds().forEach(function(id){setAngleOffset(next.kinkAngleOffsets,id,v)})})});
    bindForAll("subcat","subs","subcatAngle",function(){var v=Number(document.getElementById("layoutSubcatAngle").value);forallApply(function(next){next.subcatAngleOffsets=copyOverrides(next.subcatAngleOffsets);allSubcatNames().forEach(function(name){setAngleOffset(next.subcatAngleOffsets,name,v)})})});
    bindForAll("subcat","subs","subcatLen",function(){var rel=relClamp(document.getElementById("layoutSubcatLen").value);forallApply(function(next){next.subcatOverrides=copyOverrides(next.subcatOverrides);allSubcatNames().forEach(function(name){next.subcatOverrides[name]=subcatOverrideEntry(next.subcatOverrides[name],{length:rel*bakedSubBase(name,"length")})})})});
    shrinkForAll("subcat","subs","subcatSpokeAutoShrink","layoutSubcatSpokeAutoShrink","subcatSpokeAutoShrink",allSubcatNames);
    // Export settings: download the Layout Editor's current settings
    // (the same object Copy layout settings encodes, plus the hash
    // form) as a JSON file for sharing or safekeeping.
    var exportBtn=document.getElementById("layoutExport");
    if(exportBtn)exportBtn.addEventListener("click",function(){
      var liveBuild=(document.querySelector('meta[name="sexcapades-build"]') || {}).content || "";
      var clickDate=new Date(),pad2=function(n){return (n<10?"0":"")+n},clickStamp=clickDate.getFullYear()+"-"+pad2(clickDate.getMonth()+1)+"-"+pad2(clickDate.getDate())+"_"+pad2(clickDate.getHours())+pad2(clickDate.getMinutes());
      var payload={app:"sexcapades",kind:"layout-settings",version:3,build:liveBuild,exportedAt:new Date().toISOString(),settings:collect(),hash:settingsHash()};
      var blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
      var url=URL.createObjectURL(blob),a=document.createElement("a");
      a.href=url;a.download="sexcapades-layout-settings-"+clickStamp+".json";
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(function(){URL.revokeObjectURL(url)},1500);
    });
    // Load + Paste layout settings: the inbound half of Copy/Export.
    // Load reads a settings JSON file made by Export; Paste takes the
    // same JSON — or the link the Copy button puts on the clipboard —
    // from a dialog. Both routes share one parser/validator:
    // leImportSettingsText returns {ok:true} or {ok:false,error}, and
    // on ANY error nothing is applied, so the current settings are
    // never half-replaced. A valid import is rebuilt key by key (only
    // the keys collect() itself writes are taken, each type-checked —
    // the same allowlist rule the boot saved-defaults merge uses) on
    // top of the current settings, then handed to the ordinary
    // apply(), which repaints the map and re-syncs every control.
    var leBoolKeys=["propFan","subcatOrder","staggerDensity","stagger","expandAll","crossmin","nudge","showRelations","repulsionEnabled","staticMap","animations","mapSliders"];
    var leNumKeys=["spokeLen","subLen","pad","repulsion","fontScale","centerRingScale","leafOvergrowth","autoShrinkFactor","subcatCloudShrinkFactor"];
    var leMapKeys=["branchOverrides","subcatOverrides","kinkOverrides","nodeOverrides","subcatAngleOffsets","kinkAngleOffsets","branchSpokeAutoShrink","subcatSpokeAutoShrink"];
    function lePlainObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v)}
    function leValidateMap(map){if(!lePlainObject(map))return false;var keys=Object.keys(map);for(var i=0;i<keys.length;i++){var entry=map[keys[i]];if(typeof entry==="boolean")continue;if(typeof entry==="number"){if(!Number.isFinite(entry))return false;continue}if(!lePlainObject(entry))return false;var sub=Object.keys(entry);for(var j=0;j<sub.length;j++){var val=entry[sub[j]];if(typeof val==="boolean")continue;if(typeof val==="number"&&Number.isFinite(val))continue;if(sub[j]==="kind"&&(val==="branch"||val==="subcat"||val==="kink"))continue;if(sub[j]==="nodeId"&&typeof val==="string")continue;return false}}return true}
    function leBuildImportedSettings(raw){
      var settings=raw;
      if(lePlainObject(raw)&&lePlainObject(raw.settings)){
        if(raw.app!==undefined&&raw.app!=="sexcapades")return{error:"That isn't a Sexcapades layout-settings export — nothing was applied."};
        if(raw.kind!==undefined&&raw.kind!=="layout-settings")return{error:"That export isn't layout settings — nothing was applied."};
        settings=raw.settings;
      }
      if(!lePlainObject(settings))return{error:"No layout settings found — nothing was applied."};
      var picked={},found=0,key,i;
      for(i=0;i<leBoolKeys.length;i++){key=leBoolKeys[i];if(settings[key]===undefined)continue;if(typeof settings[key]!=="boolean")return{error:"A layout setting has the wrong kind of value — nothing was applied."};picked[key]=settings[key];found++}
      for(i=0;i<leNumKeys.length;i++){key=leNumKeys[i];if(settings[key]===undefined)continue;if(typeof settings[key]!=="number"||!Number.isFinite(settings[key]))return{error:"A layout setting has the wrong kind of value — nothing was applied."};picked[key]=settings[key];found++}
      if(settings.spacing!==undefined){if(typeof settings.spacing!=="string"||!(bundles[settings.spacing]||settings.spacing==="custom"))return{error:"Those settings name a spacing this build doesn't know — nothing was applied."};picked.spacing=settings.spacing;found++}
      if(settings.branchOrder!==undefined){if(typeof settings.branchOrder!=="string"||!settings.branchOrder)return{error:"Those settings are missing their branch order — nothing was applied."};var orderOk=false;document.querySelectorAll("[data-branch-order]").forEach(function(b){if(b.dataset.branchOrder===settings.branchOrder)orderOk=true});if(!orderOk)return{error:"Those settings name a branch order this build doesn't know — nothing was applied."};picked.branchOrder=settings.branchOrder;found++}
      if(settings.collision!==undefined){if(["grow","shrink","both","off"].indexOf(settings.collision)<0)return{error:"Those settings name a collision mode this build doesn't know — nothing was applied."};picked.collision=settings.collision;found++}
      if(settings.solverMidline!==undefined){if(["off","repulsion","settle","full","legacy"].indexOf(settings.solverMidline)<0)return{error:"Those settings name a settle method this build doesn't know — nothing was applied."};picked.solverMidline=settings.solverMidline;found++}
      for(i=0;i<leMapKeys.length;i++){key=leMapKeys[i];if(settings[key]===undefined)continue;if(!leValidateMap(settings[key]))return{error:"A layout setting has the wrong kind of value — nothing was applied."};picked[key]=copyOverrides(settings[key]);found++}
      if(!found)return{error:"No layout settings found — nothing was applied."};
      if(picked.nodeOverrides)unpackNodeOverrides(picked);
      var next=collect();
      Object.keys(picked).forEach(function(k){next[k]=picked[k]});
      syncNodeOverrides(next);
      return{settings:next,solverPicked:picked.solverMidline};
    }
    // Inverse of settingsHash() for the Paste route: a copied share
    // link (or a bare #layout-… fragment) decodes back into the same
    // settings object the JSON routes carry. settingsHash() semantics
    // are untouched; this only reads what it writes.
    function leSettingsFromLink(text){
      var hashAt=text.indexOf("#"),hash=hashAt>=0?text.slice(hashAt+1):(text.indexOf("layout-")===0?text:"");
      if(!hash)return null;
      try{hash=decodeURIComponent(hash)}catch (error) { __sxErrLog("layout-import-link-decode", error); }
      var params={};hash.split("&").forEach(function(item){var at=item.indexOf("=");if(at>0)params[item.slice(0,at)]=item.slice(at+1)});
      if(!Object.keys(params).some(function(k){return k.indexOf("layout-")===0}))return null;
      var out={};
      function flag(name,key){if(params[name]!==undefined)out[key]=params[name]==="1"}
      function num(name,key){if(params[name]!==undefined){var v=Number(params[name]);if(!Number.isFinite(v))throw new Error("bad layout number");out[key]=v}}
      if(params["layout-spacing"]!==undefined)out.spacing=params["layout-spacing"];
      if(params["layout-branchOrder"]!==undefined)out.branchOrder=params["layout-branchOrder"];
      if(params["layout-collision"]!==undefined)out.collision=params["layout-collision"];
      if(params["layout-solverMidline"]!==undefined)out.solverMidline=params["layout-solverMidline"];
      flag("layout-propFan","propFan");flag("layout-subcatOrder","subcatOrder");flag("layout-staggerDensity","staggerDensity");flag("layout-stagger","stagger");flag("layout-expandAll","expandAll");flag("layout-crossmin","crossmin");flag("layout-nudge","nudge");flag("layout-showRelations","showRelations");flag("layout-repulsionEnabled","repulsionEnabled");flag("layout-staticMap","staticMap");flag("layout-animations","animations");flag("layout-mapSliders","mapSliders");
      num("layout-spokeLen","spokeLen");num("layout-subLen","subLen");num("layout-pad","pad");num("layout-repulsion","repulsion");num("layout-fontScale","fontScale");num("layout-centerRingScale","centerRingScale");num("layout-leafOvergrowth","leafOvergrowth");num("layout-autoShrinkFactor","autoShrinkFactor");num("layout-subcatCloudShrinkFactor","subcatCloudShrinkFactor");
      var groups=[["layout-branches","branchOverrides"],["layout-subcatOverrides","subcatOverrides"],["layout-kinkOverrides","kinkOverrides"],["layout-nodeOverrides","nodeOverrides"],["layout-subcatAngleOffsets","subcatAngleOffsets"],["layout-kinkAngleOffsets","kinkAngleOffsets"],["layout-branchSpokeAutoShrink","branchSpokeAutoShrink"],["layout-subcatSpokeAutoShrink","subcatSpokeAutoShrink"]];
      groups.forEach(function(pair){if(params[pair[0]]===undefined)return;var packed=params[pair[0]].replace(/-/g,"+").replace(/_/g,"/");while(packed.length%4)packed+="=";out[pair[1]]=JSON.parse(decodeURIComponent(escape(atob(packed))))});
      return out;
    }
    function leImportSettingsText(text,sourceLabel){
      var trimmed=String(text==null?"":text).trim();
      if(!trimmed)return{ok:false,error:"Nothing to apply yet — paste or load the settings first."};
      var built=null;
      try{
        if(trimmed.charAt(0)==="{")built=leBuildImportedSettings(JSON.parse(trimmed));
        else{var fromLink=leSettingsFromLink(trimmed);built=fromLink?leBuildImportedSettings(fromLink):{error:"That doesn't look like layout settings — nothing was applied."}}
      }catch (error) { __sxErrLog("layout-import", error);built={error:"Those settings couldn't be read — nothing was applied."} }
      if(!built||built.error)return{ok:false,error:(built&&built.error)||"Those settings couldn't be read — nothing was applied."};
      apply(built.settings,sourceLabel==="file"?"Settings loaded":"Settings applied");
      if(built.solverPicked!==undefined){try{setSolverMode(built.solverPicked);writeSolverModeHash(built.solverPicked)}catch (error) { __sxErrLog("layout-import-solver", error); }}
      return{ok:true};
    }
    var layoutImportStatusTimer=null;
    function showLayoutImportStatus(message,ms){var status=document.getElementById("layoutCopyStatus");if(!status)return;status.textContent=message;if(layoutImportStatusTimer)clearTimeout(layoutImportStatusTimer);layoutImportStatusTimer=setTimeout(function(){layoutImportStatusTimer=null;status.textContent=""},ms||3500)}
    var loadBtn=document.getElementById("layoutLoad"),loadFile=document.getElementById("layoutLoadFile");
    if(loadBtn&&loadFile){
      loadBtn.addEventListener("click",function(){loadFile.click()});
      loadFile.addEventListener("change",function(){
        var file=loadFile.files&&loadFile.files[0];loadFile.value="";
        if(!file)return;
        function done(text){var r=leImportSettingsText(text,"file");if(r.ok)showLayoutImportStatus("Settings loaded from file");else showLayoutImportStatus(r.error,5000)}
        function readFailed(){showLayoutImportStatus("That file couldn't be read — nothing was applied.",5000)}
        if(typeof file.text==="function")file.text().then(done,readFailed);
        else{var reader=new FileReader();reader.onload=function(){done(String(reader.result||""))};reader.onerror=readFailed;reader.readAsText(file)}
      });
    }
    var pasteBtn=document.getElementById("layoutPaste"),pasteDialog=document.getElementById("layoutPasteDialog"),pasteText=document.getElementById("layoutPasteText"),pasteError=document.getElementById("layoutPasteError");
    function leClosePaste(){if(!pasteDialog)return;if(typeof pasteDialog.close==="function"&&pasteDialog.open)pasteDialog.close();else pasteDialog.removeAttribute("open")}
    if(pasteBtn&&pasteDialog&&pasteText){
      pasteBtn.addEventListener("click",function(){if(pasteError){pasteError.hidden=true;pasteError.textContent=""}if(typeof pasteDialog.showModal==="function"){if(!pasteDialog.open)pasteDialog.showModal()}else pasteDialog.setAttribute("open","");setTimeout(function(){pasteText.focus()},0)});
      var pasteApplyBtn=document.getElementById("layoutPasteApply");
      if(pasteApplyBtn)pasteApplyBtn.addEventListener("click",function(){
        var r=leImportSettingsText(pasteText.value,"paste");
        if(r.ok){leClosePaste();showLayoutImportStatus("Settings pasted and applied")}
        else if(pasteError){pasteError.textContent=r.error;pasteError.hidden=false}
      });
      var pasteCancelBtn=document.getElementById("layoutPasteCancel"),pasteCloseBtn=document.getElementById("layoutPasteClose");
      if(pasteCancelBtn)pasteCancelBtn.addEventListener("click",leClosePaste);
      if(pasteCloseBtn)pasteCloseBtn.addEventListener("click",leClosePaste);
    }
    // Save as defaults (Build 2026-10-19_1742): store the current
    // settings in this browser as the personal defaults; they load
    // automatically on the next visit (see the layout init script).
    // Same payload shape as Export settings. "Reset to defaults"
    // clears the saved copy and returns to the shipped defaults.
    var saveDefaultsBtn=document.getElementById("layoutSaveDefaults");
    if(saveDefaultsBtn)saveDefaultsBtn.addEventListener("click",function(){
      var payload={app:"sexcapades",kind:"layout-settings",version:3,build:(document.querySelector('meta[name="sexcapades-build"]') || {}).content || "",exportedAt:new Date().toISOString(),settings:collect(),hash:settingsHash()};
      var saved=false;
      // Deliberate save (Group 4, G4-6): this button is the ONLY path
      // that persists layout edits across reloads. The write is
      // verified by reading it back before "Saved!" is shown, and the
      // legacy branch-order key is aligned to the saved value so the
      // boot-time branch-order lookup cannot resurrect a different,
      // unsaved pick over the saved layout.
      try{var payloadJson=JSON.stringify(payload);window.localStorage&&window.localStorage.setItem("sexcapades-layout-savedDefaults",payloadJson);window.localStorage&&window.localStorage.setItem("sexcapades-layout-branchOrder",(payload.settings&&payload.settings.branchOrder)||"landscape-antipodal");saved=!!(window.localStorage&&window.localStorage.getItem("sexcapades-layout-savedDefaults")===payloadJson)}catch (error) { __sxErrLog("layout-saved-defaults", error); }
      var original=saveDefaultsBtn.textContent;saveDefaultsBtn.textContent=saved?"Saved!":"Couldn't save";
      setTimeout(function(){saveDefaultsBtn.textContent=original},1600);
    });
    sync();
    (function bootDisplayClasses() {
      var svg = document.getElementById("mapSvg"), c = config();
      if (!svg || !c) return;
      svg.classList.toggle("relations-off", !c.showRelations);
      svg.classList.toggle("is-static", !!c.staticMap);
    })();
    watchMap();
    if(!customSpacing)customSpacing=spacingValuesOf(config());
    // Late-joiner handover (Group 4, G4-1): a window that opens after
    // another window has been tuning adopts the current editor chrome
    // state — metric selection, overlay visibility, power-user,
    // fullscreen, and the Custom spacing stash — from the live-sync
    // key, so overlay state is handed over instead of booting factory
    // editor state. Geometry is NOT taken from the live key: it still
    // comes from the URL hash / saved defaults / shipped defaults
    // exactly as before (Group 4, G4-6 deliberate-save shape).
    try{var liveRaw=window.localStorage&&window.localStorage.getItem("sexcapades-layout-liveSettings");if(liveRaw){var liveParsed=JSON.parse(liveRaw);if(liveParsed&&liveParsed.editor)applyEditorState(liveParsed.editor)}}catch (error) { __sxErrLog("layout-editor-handover", error); }
    window.addEventListener("resize",scheduleScores);
    window.__SEXCAPADES_LAYOUT_TEST={get:function(){return config()},set:function(next){apply(next||{});return config()},defaults:function(){document.getElementById("layoutReset").click();return config()},hash:settingsHash,importText:function(text){return leImportSettingsText(text,"test")},open:open,scores:updateScores,focusNode:focusEditorOn};
  }
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ready):ready();
})();


(function(){
  // Cross-tab live sync receiver (Build 2026-10-19_1742): the Layout
  // Editor writes its settings to localStorage as they change; the
  // storage event fires in every OTHER open tab or window (never in
  // the one that wrote), and the map here applies them live — tune in
  // one window, watch the map follow in the other. This key is never
  // read on page load: live updates only. (Saved personal defaults
  // live under the separate "sexcapades-layout-savedDefaults" key.)
  window.addEventListener("storage",function(e){
    if(!e||e.key!=="sexcapades-layout-liveSettings"||!e.newValue)return;
    try{
      var parsed=JSON.parse(e.newValue),settings=parsed&&parsed.settings;
      if(!settings||typeof settings!=="object")return;
      if(window.__SEXCAPADES_LAYOUT_API&&window.__SEXCAPADES_LAYOUT_API.apply)window.__SEXCAPADES_LAYOUT_API.apply(settings);
      else if(window.__SEXCAPADES_LAYOUT)Object.assign(window.__SEXCAPADES_LAYOUT,settings);
      var lePanel=document.getElementById("layoutEditor");
      if(lePanel&&!lePanel.hidden&&window.__SEXCAPADES_LAYOUT_UI&&window.__SEXCAPADES_LAYOUT_UI.sync)window.__SEXCAPADES_LAYOUT_UI.sync();
      var editorState=parsed&&parsed.editor;
      if(editorState&&typeof editorState==="object"&&window.__SEXCAPADES_LAYOUT_UI&&window.__SEXCAPADES_LAYOUT_UI.applyEditorState)window.__SEXCAPADES_LAYOUT_UI.applyEditorState(editorState);
    }catch (error) { __sxErrLog("layout-live-sync", error); }
  });
})();


// Clear-selection chip wiring: visibility tracks the map's selection
// render state (a .selected-spoke under a node group, or an is-preview
// focus group) through a MutationObserver, independent of the Layout
// Editor panel. Clicking runs the same clear path as the panel's Clear
// selection button (__SEXCAPADES_LAYOUT_UI.clearSelection, which also
// resets the editor selects), falling back to the bundle API.
(function () {
  function boot() {
    var btn = document.getElementById("mapClearSelection");
    var svg = document.getElementById("mapSvg");
    if (!btn || !svg) return;
    function hasSelection() {
      return Boolean(svg.querySelector(".selected-spoke") || svg.querySelector(".node-group.is-preview"));
    }
    var queued = false;
    function sync() {
      if (queued) return;
      queued = true;
      var tm = window.SexcapadesRuntime && window.SexcapadesRuntime.TimerManager;
      var schedule = (tm && typeof tm.requestAnimationFrame === "function")
        ? function (cb) { tm.requestAnimationFrame(cb); }
        : function (cb) { window.requestAnimationFrame(cb); };
      schedule(function () { queued = false; btn.hidden = !hasSelection(); });
    }
    btn.addEventListener("click", function () {
      var done = false;
      try {
        if (window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.clearSelection) done = Boolean(window.__SEXCAPADES_LAYOUT_UI.clearSelection());
      } catch (e) { try { __sxErrLog("map-clear-selection", e); } catch (_) {} }
      if (!done) {
        try {
          if (window.__SEXCAPADES_LAYOUT_API && window.__SEXCAPADES_LAYOUT_API.clearSelection) window.__SEXCAPADES_LAYOUT_API.clearSelection();
        } catch (e) { try { __sxErrLog("map-clear-selection-api", e); } catch (_) {} }
      }
      sync();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (document.querySelector("dialog[open]")) return;
      var panel = document.getElementById("layoutEditor");
      if (panel && !panel.hidden) return;
      var menu = document.getElementById("viewNavMenu");
      if (menu && !menu.hidden) return;
      if (!hasSelection()) return;
      e.preventDefault();
      btn.click();
    });
    if (window.MutationObserver) {
      new MutationObserver(sync).observe(svg, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
    }
    sync();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();


// Triple-tap the center node opens the Layout Editor (Build 2026-10-19 —
// restored for touch screens, where Ctrl+Shift+L is unavailable). Three
// taps on the center node's hit area within 1000ms of each other, without
// drifting, trigger the same open() as the keyboard shortcut.
(function () {
  var taps = 0, lastAt = 0, lastX = 0, lastY = 0;
  document.addEventListener("pointerdown", function (e) {
    var t = e.target;
    if (!t || !t.closest || !t.closest(".center-hit,.center-photo,.center-label")) { taps = 0; return; }
    var now = performance.now();
    if (now - lastAt > 1000 || Math.hypot(e.clientX - lastX, e.clientY - lastY) > 32) taps = 0;
    taps++; lastAt = now; lastX = e.clientX; lastY = e.clientY;
    if (taps >= 3) {
      taps = 0;
      try {
        var cardClose = document.getElementById("closeCenterProfileCard");
        if (cardClose && cardClose.offsetParent !== null) cardClose.click();
      } catch (err) { try { __sxErrLog("triple-tap-card", err); } catch (_) {} }
      try {
        if (window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.open) window.__SEXCAPADES_LAYOUT_UI.open();
      } catch (err) { try { __sxErrLog("triple-tap-layout", err); } catch (_) {} }
    }
  }, true);
})();
