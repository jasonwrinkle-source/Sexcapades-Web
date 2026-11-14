
(function(){
  function ready(){
    var panel=document.getElementById("layoutEditor"),close=document.getElementById("layoutEditorClose"),lastCollision="grow";if(!panel)return;document.body.prepend(panel);
    // ============================================================
    // LAYOUT EDITOR - SURFACE INDEX (F5, layout-editor refactor)
    // ------------------------------------------------------------
    // This ready() closure is the layout editor's whole home: the
    // panel that tunes spacing, sizes and per-branch / per-topic
    // overrides, runs the Anneal, and draws the on-map measurement
    // numbers. Its full surface:
    //
    // STATE (flat variables - see NAMESPACE DIRECTION below)
    //   panel / close .......... the #layoutEditor element + close btn
    //   ids .................... element-id map for global controls
    //   lastCollision .......... last non-off collision mode
    //   customSpacing .......... stashed Custom spacing values (G4-7)
    //   metricOn, metricId, metricOverlayOn, metricTimer,
    //   metricRun, metricGlobalRun
    //                          ... measurement picker state, the
    //                              500 ms debounce timer, run guards
    //   settlePending, settleTimer, settleArmDeadline, dkReceipt
    //                          ... Anneal settle-watch state + receipt
    //   deknotterRunning, deknotterCancelRequested,
    //   deknotterBusyStart, deknotterBusyTimer ... Anneal run state
    //   editorSyncGuard, liveSyncMuted, liveSyncTimer
    //                          ... cross-window live-sync guards/timer
    //   applyBusyBtn ........... button an in-flight apply marks busy
    //
    // FUNCTIONS, BY JOB
    //   Settings core: config(), collect(), apply(),
    //     stableSettingsString(), sync(), spacingNameFor(),
    //     spacingValuesOf(), copyOverrides()
    //   Single-item actuators: lrActuate() over the LR_ACT table;
    //     the applyBranch* / applyKink* / applySubcat* /
    //     applySpokeAngle wrappers all delegate to it
    //   Apply-to-all arming: lrG3Armed(), lrG3Divert(),
    //     bindForAll(), forallApply() over lrG3ForAllFns
    //   Metrics: the LayoutMetrics registry (register / get),
    //     scheduleMetric(), measureLocals(), calculateGlobal()
    //   Anneal driver: onDeknotterClick(), runDeknotterCascade(),
    //     renderDkReceipt() + the dkFmt* formatters, and the settle
    //     watch (noteSettlePending / settleTick / onSettleLanded)
    //   Cross-window live sync: scheduleLiveSync(),
    //     collectEditorState(), applyEditorState(); exposed to the
    //     shell as window.__SEXCAPADES_LAYOUT_UI, with the test hook
    //     window.__SEXCAPADES_LAYOUT_TEST at the end of this script
    //   Panel chrome: open(), shut(), setLayoutFullscreen(), the
    //     branch-order / collision menus, le-capsule + tilt-drawer
    //     controls, coalesceSlider()
    //
    // NAMED MODULES - the editor's newer homes
    //   LR_ACT ............... table-driven actuator rows (Edit 1):
    //                          one row per single-item control,
    //                          carrying its element ids, override
    //                          store, scope and divert level
    //   MetricNumbersView .... on-map numbers: state + the single
    //                          render path (Edit 2)
    //   MetricGeometry ....... shared map-geometry helpers (Edit 2):
    //                          world frame, node positions, boxes
    //   lrG3ForAllFns ........ apply-to-all batch closures keyed by
    //                          group|level|control (Edit 1, F2)
    //
    // NAMESPACE DIRECTION: new editor machinery goes in named
    // modules like the three above. The legacy flat globals stay
    // flat until a separately-authorized migration: cross-window
    // live sync and other shell code reach these variables and
    // functions by name (applyEditorState replays a received state
    // into them; __SEXCAPADES_LAYOUT_UI / __SEXCAPADES_LAYOUT_TEST
    // expose them), so moving them is high-churn. F5 is therefore
    // PARTIAL by design: this index + direction only; the full
    // migration is deferred, not done.
    // ============================================================
    var ids={stagger:"layoutStagger",expandAll:"layoutExpandAll",crossmin:"layoutCrossmin",nudge:"layoutNudge",showRelations:"layoutShowRelations",propFan:"layoutPropFan",subcatOrder:"layoutSubcatOrder",staggerDensity:"layoutStaggerDensity",spokeLen:"layoutSpokeLen",subLen:"layoutSubLen",pad:"layoutPad",repulsion:"layoutRepulsion",fontScale:"layoutFontScale",centerRingScale:"layoutCenterRingScale",leafOvergrowth:"layoutLeafOvergrowth",autoShrinkFactor:"layoutAutoShrinkFactor",subcatCloudShrinkFactor:"layoutSubcatCloudShrinkFactor",repulsionEnabled:"layoutRepulsionEnabled",staticMap:"layoutStaticMap",animations:"layoutAnimations",mapSliders:"layoutMapSliders",collisionEnabled:"layoutCollisionEnabled"},bundles=window.__SEXCAPADES_LAYOUT_BUNDLES||{compact:{spokeLen:2.34,subLen:1.02,pad:1.19,repulsion:0},airy:{spokeLen:2.6,subLen:1.2,pad:1.4,repulsion:0},print:{spokeLen:2.08,subLen:0.9,pad:0.91,repulsion:0}};
    // config(): window.__SEXCAPADES_LAYOUT_API is the primary
    // settings source. The window.__SEXCAPADES_LAYOUT fallback in
    // the next line exists for legacy callers that boot without
    // the API object - documented here (F8); do not remove the
    // fallback without retiring those callers.
    function config(){var c=window.__SEXCAPADES_LAYOUT_API?window.__SEXCAPADES_LAYOUT_API.get():Object.assign({},window.__SEXCAPADES_LAYOUT);if(c.animations===undefined)c.animations=!!(window.__SEXCAPADES_LAYOUT&&window.__SEXCAPADES_LAYOUT.animations);if(c.mapSliders===undefined)c.mapSliders=!!(window.__SEXCAPADES_LAYOUT&&window.__SEXCAPADES_LAYOUT.mapSliders);return c}
    function copyOverrides(value){var out={};Object.keys(value||{}).forEach(function(key){out[key]=Object.assign({},value[key])});return out}
    // Override-entry shapes (Rank 8): ONE definition per store, shared by
    // all three apply-entry paths — the single-item actuators (LR_ACT),
    // the apply-to-all batch closures (bindForAll), and the tilt
    // reset/restore handlers. A shape change lands here once and reaches
    // all three; no path re-spells an entry. Branch entries carry length
    // + angle and preserve any other field already on the entry
    // (subScale/kinkScale); a missing or non-positive length falls back
    // to the baked tuned length for the branch, the same fallback the
    // sync readouts use. Kink entries are length-only replacements.
    // Subcategory entries preserve the previous entry and take the
    // patched field. Angle offsets are set-or-delete: zero removes.
    function branchOverrideEntry(prev,patch,name){var entry=Object.assign({},prev||{},patch||{});if(!(Number(entry.length)>0))entry.length=bakedBranchBase(name);if(entry.angle===undefined||entry.angle===null||!patch||!Object.prototype.hasOwnProperty.call(patch,"angle"))entry.angle=Number(prev&&prev.angle)||0;return entry}
    function kinkOverrideEntry(length){return{length:length}}
    function subcatOverrideEntry(prev,patch){return Object.assign({},prev||{},patch||{})}
    function setAngleOffset(store,key,value){if(value)store[key]={angle:value};else delete store[key]}
    // Spacing presets + Custom (Group 4, G4-7): a preset's name is
    // shown only when the four spacing values match that preset's
    // bundle exactly; anything else is Custom. The shipped tuned
    // values (spokeLen 2.6, subLen 1.2, pad 1.4, repulsion 0) are exactly
    // the Airy bundle, so a fresh map boots as Airy. customSpacing stashes
    // the user's tuned values: flipping to a preset never overwrites
    // them, and flipping back to Custom restores them exactly.
    var customSpacing=null;
    function spacingValuesOf(s){if(!s)return null;var v={spokeLen:Number(s.spokeLen),subLen:Number(s.subLen),pad:Number(s.pad),repulsion:Number(s.repulsion)};return (isFinite(v.spokeLen)&&isFinite(v.subLen)&&isFinite(v.pad)&&isFinite(v.repulsion))?v:null}
    function spacingNameFor(v){if(!v)return "custom";var names=Object.keys(bundles);for(var i=0;i<names.length;i++){var b=bundles[names[i]];if(b&&Math.abs(v.spokeLen-b.spokeLen)<1e-9&&Math.abs(v.subLen-b.subLen)<1e-9&&Math.abs(v.pad-b.pad)<1e-9&&Math.abs(v.repulsion-b.repulsion)<1e-9)return names[i]}return "custom"}
    function populateBranches(){var select=document.getElementById("layoutBranch");if(!select||select.options.length>1||!window.__SEXCAPADES_LAYOUT_API||!window.__SEXCAPADES_LAYOUT_API.branches)return;window.__SEXCAPADES_LAYOUT_API.branches().forEach(function(name){var option=document.createElement("option");option.value=name;option.textContent=name;select.appendChild(option)})}
    function populateTargetNodes(){
      var select=document.getElementById("layoutTargetNode");
      var treeMenu=document.getElementById("layoutTargetNodeMenu");
      var tax=taxonomy();
      if(!tax||!tax.categories)return;
      if(select&&select.options.length<=1){
        tax.categories.forEach(function(cat){
          var hasChildren=(cat.topics&&cat.topics.length>0)||(cat.subcategories&&cat.subcategories.length>0);
          if(!hasChildren)return;
          var optgroup=document.createElement("optgroup");
          optgroup.label="Category: "+cat.name;
          var bOpt=document.createElement("option");
          bOpt.value="branch:"+cat.name;
          bOpt.textContent=cat.name+" (Branch)";
          optgroup.appendChild(bOpt);
          (cat.subcategories||[]).forEach(function(sub){
            if(sub.topics&&sub.topics.length>0){
              var sOpt=document.createElement("option");
              sOpt.value="subcat:"+sub.name;
              sOpt.textContent="  └── "+sub.name+" (Sub-group)";
              optgroup.appendChild(sOpt);
            }
          });
          select.appendChild(optgroup);
        });
      }
      if(treeMenu&&!treeMenu.children.length){
        var noneRow=document.createElement("div");
        noneRow.className="le-tree-branch-row";
        var noneBtn=document.createElement("button");
        noneBtn.type="button";
        noneBtn.className="le-tree-node-btn";
        noneBtn.setAttribute("data-node-val","");
        noneBtn.textContent="None (whole map)";
        noneRow.appendChild(noneBtn);
        treeMenu.appendChild(noneRow);

        tax.categories.forEach(function(cat){
          var subs=(cat.subcategories||[]).filter(function(s){return s.topics&&s.topics.length>0});
          var hasChildren=(cat.topics&&cat.topics.length>0)||subs.length>0;
          if(!hasChildren)return;

          var bRow=document.createElement("div");
          bRow.className="le-tree-branch-row";

          if(subs.length>0){
            var tog=document.createElement("button");
            tog.type="button";
            tog.className="le-tree-toggle";
            tog.setAttribute("aria-label","Toggle "+cat.name+" subcategories");
            tog.setAttribute("aria-expanded","false");
            tog.innerHTML='<span class="le-tree-triangle">▶</span>';
            bRow.appendChild(tog);
          } else {
            var sp=document.createElement("span");
            sp.style.cssText="width:28px;flex-shrink:0;";
            bRow.appendChild(sp);
          }

          var bBtn=document.createElement("button");
          bBtn.type="button";
          bBtn.className="le-tree-node-btn";
          bBtn.setAttribute("data-node-val","branch:"+cat.name);
          bBtn.textContent=cat.name;
          bRow.appendChild(bBtn);
          treeMenu.appendChild(bRow);

          if(subs.length>0){
            var cWrap=document.createElement("div");
            cWrap.className="le-tree-children";
            cWrap.hidden=true;
            subs.forEach(function(sub){
              var sRow=document.createElement("div");
              sRow.className="le-tree-branch-row";
              var sBtn=document.createElement("button");
              sBtn.type="button";
              sBtn.className="le-tree-node-btn le-tree-child-btn";
              sBtn.setAttribute("data-node-val","subcat:"+sub.name);
              sBtn.innerHTML='<span style="opacity:0.5;margin-right:2px;">└──</span> '+sub.name;
              sRow.appendChild(sBtn);
              cWrap.appendChild(sRow);
            });
            treeMenu.appendChild(cWrap);

            if(tog){
              tog.addEventListener("click",function(ev){
                ev.stopPropagation();
                var isOpen=!cWrap.hidden;
                cWrap.hidden=isOpen;
                tog.setAttribute("aria-expanded",String(!isOpen));
                var tri=tog.querySelector(".le-tree-triangle");
                if(tri)tri.textContent=isOpen?"▶":"▼";
              });
            }
          }
        });

        treeMenu.addEventListener("click",function(ev){
          var btn=ev.target.closest(".le-tree-node-btn");
          if(!btn)return;
          var val=btn.getAttribute("data-node-val")||"";
          var select=document.getElementById("layoutTargetNode");
          if(select){
            select.value=val;
            select.dispatchEvent(new Event("change"));
          }
          if(typeof closeTargetNodeMenu==="function")closeTargetNodeMenu();
          if(val.indexOf("branch:")===0){
            var bName=val.slice(7);
            if(window.__sxFocusBranch)window.__sxFocusBranch(bName);
          } else if(val.indexOf("subcat:")===0){
            var sName=val.slice(7);
            if(window.__sxFocusNode)window.__sxFocusNode(sName, "");
          }
        });
      }
    }
    function populateKinks(){var select=document.getElementById("layoutKink");if(select.options.length>1||!window.__SEXCAPADES_LAYOUT_API||!window.__SEXCAPADES_LAYOUT_API.topics)return;window.__SEXCAPADES_LAYOUT_API.topics().forEach(function(t){var option=document.createElement("option");option.value=t.id;option.textContent=t.label;select.appendChild(option)})}
    // Spoke angle offsets (Build 2026-10-17_1450): one slider + numeric input
    // per category branch (18). The value is the branch's angular deviation
    // in degrees from its default equispaced position (360/18 = 20 degrees
    // between neighbouring spokes): 0 keeps the default spot, positive
    // rotates the spoke clockwise, negative counterclockwise. It is stored
    // as branchOverrides[name].angle — the same store the per-branch "Fine
    // angle" slider above uses — so both controls stay in sync, the map
    // geometry (which adds the offset to that spoke's base angle only)
    // rotates just that spoke, and the offset rides along in the copied
    // layout-settings hash like every other branch override.
    function spokeSlug(name){return name.replace(/[^a-z0-9]+/gi,"-").replace(/^-+|-+$/g,"")}
    function buildSpokeAngles(){var wrap=document.getElementById("layoutSpokeAngles");if(!wrap||wrap.children.length||!window.__SEXCAPADES_LAYOUT_API||!window.__SEXCAPADES_LAYOUT_API.branches)return;window.__SEXCAPADES_LAYOUT_API.branches().forEach(function(name){var slug=spokeSlug(name),row=document.createElement("div");row.className="layout-editor-spoke-row";row.setAttribute("data-spoke-angle-name",name);var label=document.createElement("label");label.textContent=name;label.htmlFor="layoutSpokeAngle-"+slug;var out=document.createElement("output");out.id="layoutSpokeAngleValue-"+slug;out.setAttribute("for","layoutSpokeAngle-"+slug);out.textContent="0°";var controls=document.createElement("div");controls.className="layout-editor-spoke-controls";var range=document.createElement("input");range.type="range";range.id="layoutSpokeAngle-"+slug;range.min="-20";range.max="20";range.step="1";range.value="0";range.setAttribute("data-spoke-angle-range","");range.setAttribute("data-ui-tooltip","Rotate just this spoke from its default evenly-spaced spot. 0 degrees is default; positive turns clockwise, negative counterclockwise.");range.setAttribute("aria-label",name+" angle offset");var num=document.createElement("input");num.type="number";num.id="layoutSpokeAngleNum-"+slug;num.min="-20";num.max="20";num.step="1";num.value="0";num.setAttribute("data-spoke-angle-number","");num.setAttribute("aria-label",name+" angle offset in degrees");controls.appendChild(range);controls.appendChild(num);row.appendChild(label);row.appendChild(out);row.appendChild(controls);wrap.appendChild(row)})}
    function syncSpokeAngles(c){buildSpokeAngles();var wrap=document.getElementById("layoutSpokeAngles");if(!wrap)return;Array.prototype.forEach.call(wrap.children,function(row){var name=row.getAttribute("data-spoke-angle-name"),entry=name&&c.branchOverrides?c.branchOverrides[name]:null,value=Math.max(-20,Math.min(20,Number(entry&&entry.angle)||0)),range=row.querySelector("[data-spoke-angle-range]"),num=row.querySelector("[data-spoke-angle-number]"),out=row.querySelector("output");if(range&&document.activeElement!==range)range.value=String(value);if(num&&document.activeElement!==num)num.value=String(value);if(out)out.textContent=value.toFixed(0)+"°"})}
    function applySpokeAngle(name,value){lrActuate(LR_ACT.spokeAngle,name,value)}
    // Per-branch spoke scales: the Subcategory spokes and Kink spokes
    // sliders in Per-branch override store their multiplier on the branch's
    // branchOverrides entry (subScale / kinkScale — the layout engine reads
    // only .length/.angle there and ignores the rest) and expand it over the
    // branch's members relative to the baked tuned lengths in
    // __SEXCAPADES_LAYOUT_DEFAULTS, so dragging back to 1.00x restores the
    // tuned per-item lengths exactly. The two sliders write disjoint
    // stores — subcatOverrides[name].length for subcategory spokes;
    // kinkOverrides[id].length for direct kinks plus
    // subcatOverrides[name].cloud (the child-cloud radius) for kinks inside
    // subcategories — so moving one can never affect the other.
    function branchMembers(name){var subs=[],kinks=[],tax=taxonomy(),i;if(tax&&tax.categories)for(i=0;i<tax.categories.length;i++)if(tax.categories[i].name===name){(tax.categories[i].subcategories||[]).forEach(function(s){subs.push(s.name)});break}if(tax&&tax.flatList)tax.flatList.forEach(function(e){if(e.category===name&&e.id)kinks.push(e)});return{subs:subs,kinks:kinks}}
    function bakedSubBase(subName,field){var d=window.__SEXCAPADES_LAYOUT_DEFAULTS,e=d&&d.subcatOverrides?d.subcatOverrides[subName]:null,v=e?Number(e[field]):NaN;return v>0?v:1}
    function bakedKinkBase(id){var d=window.__SEXCAPADES_LAYOUT_DEFAULTS,e=d&&d.kinkOverrides?d.kinkOverrides[id]:null,v=e?Number(e.length):NaN;return v>0?v:1}
    // Relative length sliders (Batch A fix, Build 2026-10-19_2334): the
    // global "Branch line length", per-branch and per-topic line-length
    // sliders carry a MULTIPLIER of the shipped tuned length (1.00x =
    // tuned, range 0.25x-2x of tuned) instead of an absolute value, so a
    // tuned length above the old 2x ceiling (global 2.6x, branches to
    // 4.86x, topics to 9x) can never be silently clamped or overwritten.
    // Stored lengths stay absolute everywhere; readouts always show the
    // true absolute value.
    function bakedBranchBase(name){var d=window.__SEXCAPADES_LAYOUT_DEFAULTS,e=d&&d.branchOverrides?d.branchOverrides[name]:null,v=e?Number(e.length):NaN;return v>0?v:1}
    function bakedSpokeBase(){var d=window.__SEXCAPADES_LAYOUT_DEFAULTS,v=d?Number(d.spokeLen):NaN;return v>0?v:1}
    function relClamp(v){v=Number(v);return Number.isFinite(v)?Math.max(.25,Math.min(2,v)):1}
    function fmtLen(v){return String(Math.round((Number(v)||0)*100)/100)+"×"}
    // Per-branch spoke honesty readout (display only; no solver input):
    // "Requested" is the multiplier on the branch-length control — the
    // same relClamp'd value syncBranch writes into #layoutBranchLen.
    // "Effective" is the multiplier actually in force in the applied
    // layout state: the stored absolute length behind the
    // #layoutBranchLenValue button readout (config() via the layout
    // API), divided by the branch's shipped tuned length WITHOUT the
    // control's 0.25x-2x clamp, so a stored length the slider cannot
    // reach is shown rather than hidden, and the effective value is
    // highlighted whenever the two disagree. The overrider lines name
    // what else can move this branch's spoke, each shown only while
    // active: stagger density; this branch's spoke auto-shrink, read
    // from the same stored branchSpokeAutoShrink value the checkbox
    // shows so the two can never disagree; and a collision mode whose
    // base factor re-bases spoke lengths (grow x1.3 / shrink x0.76 /
    // off x0.62 in the solver; "both" applies no base factor).
    function syncBranchHonesty(c){
      var wrap=document.getElementById("layoutBranchHonesty");if(!wrap)return;
      var name=document.getElementById("layoutBranch").value;
      if(!name){wrap.hidden=true;return}
      var base=bakedBranchBase(name),entry=c.branchOverrides?c.branchOverrides[name]:null,stored=(entry&&Number(entry.length))||base;
      var reqOut=document.getElementById("layoutBranchLenRequested"),effOut=document.getElementById("layoutBranchLenEffective");
      var req=relClamp(stored/base),eff=stored/base;
      if(reqOut)reqOut.textContent=req.toFixed(2)+"×";
      if(effOut){effOut.textContent=eff.toFixed(2)+"×";effOut.classList.toggle("is-diverged",Math.abs(eff-req)>0.004)}
      var density=document.getElementById("layoutBranchHonestyDensity");
      if(density)density.hidden=!(c.staggerDensity===undefined?false:Boolean(c.staggerDensity));
      var shrink=document.getElementById("layoutBranchHonestyShrink");
      if(shrink)shrink.hidden=!(c.branchSpokeAutoShrink&&c.branchSpokeAutoShrink[name]===true);
      var colNote=document.getElementById("layoutBranchHonestyCollision"),colMode=document.getElementById("layoutBranchHonestyCollisionMode");
      if(colNote){var mode=String(c.collision||""),rebases=mode==="grow"||mode==="shrink"||mode==="off";colNote.hidden=!rebases;if(rebases&&colMode){var label=mode,colBtn=document.querySelector("[data-collision-mode='"+mode+"']");/* LR-G5: the mode label used to be read from the hidden select's option texts; the visible mode buttons carry the identical label texts */if(colBtn)label=colBtn.textContent;colMode.textContent=label}}
      wrap.hidden=false;
    }
    // DeKnotter button (E6): the One-branch group's compound action.
    // Fires the bundle driver's deknotter.run() for the branch picked
    // in #layoutBranch. The shell never routes the run through
    // collect()/apply(): the driver applies through the bundle API
    // directly, and the editor UI is refreshed with sync() at each
    // phase boundary (via opts.onPhase) so the auto-shrink checkboxes
    // and the honesty readout show the driven arm state truthfully
    // while the run is in flight.
    var deknotterRunning=false,deknotterBusyTimer=null,deknotterBusyStart=0;
    // BACK-OUT CONFIRMATION GATE (ruled 2026-11-01, Jason): ON by
    // default. The toggle (layoutBackoutGateToggle, beside the Anneal
    // status) is a session-only option — it is never written into a
    // saved layout or profile, and every fresh page load starts with
    // it on. When on, runDeknotterCascade hands the bundle
    // opts.onBackoutGate; the bundle calls it only when the category
    // (branch) shrink ladder's per-phase gate trips, BEFORE
    // restoreKept reverts any geometry, and the run waits on the
    // promise below — no timeout — until Jason accepts or rejects.
    // When off, no callback is passed and back-outs behave exactly
    // as they did before the gate existed.
    var annealBackoutGateOn=true,annealBackoutGateResolver=null;
    // SLIM-STRIP PRESENTATION (ruled 2026-11-02, Jason): the gate
    // confirmation opens by default as the same slim bottom-right
    // strip as the ANNEAL-DIAG pauses - code, branch, phase, one
    // short summary line (before -> tripped crossing + tolerance,
    // derived only from the readout values above), Accept and Reject
    // in the strip, transparent backdrop so the map and the tripped
    // cloud stay fully visible. Expand restores the full gate card
    // with every value intact; Minimise folds back. Expand/collapse
    // never resolve the pause promise and change no values; both the
    // strip's and the card's Accept/Reject resolve the gate exactly
    // as before via annealBackoutGateDone.
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
    // focusEditorOn; checking is additive, a map tap never unchecks
    // a row or clears other picks), and checking a row here selects
    // that branch on the map (the checklist click handler below).
    function buildAnnealChecklist(){var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap||wrap.children.length||!window.__SEXCAPADES_LAYOUT_API||!window.__SEXCAPADES_LAYOUT_API.branches)return;branchNames().forEach(function(name){var row=document.createElement("button");row.type="button";row.className="le-anneal-opt";row.setAttribute("data-anneal-check","");row.setAttribute("data-value",name);row.setAttribute("aria-selected","false");row.setAttribute("aria-label","Anneal "+name);var nm=document.createElement("span");nm.className="le-anneal-name";nm.textContent=name;row.appendChild(nm);var cr=document.createElement("span");cr.className="le-anneal-cross";cr.setAttribute("data-anneal-cross","");cr.textContent="crossing —";row.appendChild(cr);wrap.appendChild(row)})}
    function refreshAnnealCrossings(){var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap||!wrap.children.length)return;var clouds=null;try{var m=typeof window.__sxCrossingMeasure==="function"?window.__sxCrossingMeasure():null;clouds=m&&m.clouds?m.clouds:null}catch(e){clouds=null}Array.prototype.forEach.call(wrap.querySelectorAll("[data-anneal-check]"),function(opt){var name=opt.getAttribute("data-value"),v=clouds?Number(clouds[name]):NaN,el=opt.querySelector("[data-anneal-cross]");if(el)el.textContent=Number.isFinite(v)?("crossing "+dkFmtLead(v)):"crossing —";opt.setAttribute("aria-label","Anneal "+name+(Number.isFinite(v)?(", crossing "+dkFmtLead(v)):""))})}
    function checkAnnealBranchFromMap(branch){if(!branch)return;buildAnnealChecklist();var wrap=document.getElementById("layoutAnnealChecklistRows");if(!wrap)return;var changed=false;Array.prototype.forEach.call(wrap.querySelectorAll("[data-anneal-check]"),function(opt){if(opt.getAttribute("data-value")===branch&&opt.getAttribute("aria-selected")!=="true"){opt.setAttribute("aria-selected","true");changed=true}});if(changed)syncAnnealChecklist()}
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
        try{preCloud=await dk.measureCloud(name);preOk=preCloud!=null&&Number.isFinite(Number(preCloud))}catch(e){preOk=false}
        if(preOk&&Number(preCloud)===0){
          dkReceipt=null;dkPhaseLines=[];
          if(statusEl){
            statusEl.innerHTML="<p><b>"+dkEsc(name)+"</b> is already at its floor — its crossing number is 0, so the DeKnotter has nothing to untie in this cloud. A run would take several seconds and change nothing.</p><p><button class=\"le-anneal-choice\" id=\"layoutDeknotterRunAnyway\" type=\"button\">Run anyway</button><button class=\"le-anneal-choice\" id=\"layoutDeknotterSkip\" type=\"button\">Stop</button></p>";
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
      deknotterRunning=true;deknotterCancelRequested=false;
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
        for(var mi=0;mi<names.length;mi++){if(startCrossing[names[mi]]==null&&typeof dk.measureCloud==="function"){try{var mvCross=await dk.measureCloud(names[mi]);startCrossing[names[mi]]=(mvCross!=null&&Number.isFinite(Number(mvCross)))?Number(mvCross):null}catch(e){startCrossing[names[mi]]=null}}}
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
    function syncBranch(c){var select=document.getElementById("layoutBranch"),name=select.value,entry=name&&c.branchOverrides?c.branchOverrides[name]:null,len=document.getElementById("layoutBranchLen"),angle=document.getElementById("layoutBranchAngle");len.disabled=angle.disabled=!name;var curBranchLen=(entry&&Number(entry.length))||bakedBranchBase(name);if(len!==document.activeElement)len.value=String(relClamp(curBranchLen/bakedBranchBase(name)));if(angle!==document.activeElement)angle.value=String(entry&&Number(entry.angle)||0);document.getElementById("layoutBranchLenValue").textContent=fmtLen(curBranchLen);document.getElementById("layoutBranchAngleValue").textContent=Number(angle.value).toFixed(0)+"°";var subLenEl=document.getElementById("layoutBranchSubLen"),kinkLenEl=document.getElementById("layoutBranchKinkLen"),members=name?branchMembers(name):{subs:[],kinks:[]};subLenEl.disabled=!name||!members.subs.length;kinkLenEl.disabled=!name||!members.kinks.length;if(subLenEl!==document.activeElement)subLenEl.value=String(entry&&Number(entry.subScale)||1);if(kinkLenEl!==document.activeElement)kinkLenEl.value=String(entry&&Number(entry.kinkScale)||1);document.getElementById("layoutBranchSubLenValue").textContent=Number(subLenEl.value).toFixed(2)+"×";document.getElementById("layoutBranchKinkLenValue").textContent=Number(kinkLenEl.value).toFixed(2)+"×";/* AUTOFIT (Group 3d): the branch kink-lines control is now the one-shot Autofit button — it has no checked/disabled state to sync and is never disabled for lack of a selection (no selection = whole map). */var branchSpoke=document.getElementById("layoutBranchSpokeAutoShrink");branchSpoke.disabled=!name;branchSpoke.checked=!!(c.branchSpokeAutoShrink&&c.branchSpokeAutoShrink[name]===true);var bph=document.getElementById("layoutBranchPickHint");if(bph)bph.hidden=!!name;var bph2=document.getElementById("layoutBranchPickHint2");if(bph2)bph2.hidden=!!name;var nsh=document.getElementById("layoutBranchNoSubcatsHint");if(nsh)nsh.hidden=!name||!!members.subs.length;syncBranchHonesty(c);syncDeknotterBtn();syncTargetNode(c)}function syncKink(c){var select=document.getElementById("layoutKink"),id=select.value,entry=id&&c.kinkOverrides?c.kinkOverrides[id]:null,aentry=id&&c.kinkAngleOffsets?c.kinkAngleOffsets[id]:null,len=document.getElementById("layoutKinkLen"),ang=document.getElementById("layoutKinkAngle");len.disabled=!id;ang.disabled=!id;var curKinkLen=(entry&&Number(entry.length))||bakedKinkBase(id);if(len!==document.activeElement)len.value=String(relClamp(curKinkLen/bakedKinkBase(id)));document.getElementById("layoutKinkLenValue").textContent=fmtLen(curKinkLen);if(ang!==document.activeElement)ang.value=String(aentry&&Number(aentry.angle)||0);document.getElementById("layoutKinkAngleValue").textContent=Number(ang.value).toFixed(1)+"°";var kph=document.getElementById("layoutKinkPickHint");if(kph)kph.hidden=!!id}
    function populateSubcats(){var select=document.getElementById("layoutSubcat");if(!select||select.options.length>1||!window.__SEXCAPADES_LAYOUT_API||!window.__SEXCAPADES_LAYOUT_API.subcategories)return;try{window.__SEXCAPADES_LAYOUT_API.subcategories().forEach(function(name){var option=document.createElement("option");option.value=name;option.textContent=name;select.appendChild(option)})}catch (e) { __sxErrLog("taxonomy-select", e); }}
    function syncTargetNode(c){
      populateTargetNodes();
      var bSel=document.getElementById("layoutBranch"),sSel=document.getElementById("layoutSubcat"),tn=document.getElementById("layoutTargetNode");
      if(!tn)return;
      var bVal=bSel?bSel.value:"",sVal=sSel?sSel.value:"";
      var pickHint=document.getElementById("layoutNodePickHint");
      var tiltRow=document.getElementById("layoutNodeTiltRow");
      var linesRow=document.getElementById("layoutLinesToChildrenRow");
      var lenLabel=document.getElementById("layoutNodeLenLabel");
      var shrinkLabel=document.getElementById("layoutNodeSpokeAutoShrinkLabel");
      var factorLabel=document.getElementById("layoutNodeShrinkFactorLabel");
      var armSubsLabel=document.getElementById("layoutArmSubsLabel");
      var nodeLen=document.getElementById("layoutNodeLen"),nodeLenNum=document.getElementById("layoutNodeLenNum");
      var nodeSpoke=document.getElementById("layoutNodeSpokeAutoShrink");
      var nodeFactor=document.getElementById("layoutNodeShrinkFactor"),nodeFactorNum=document.getElementById("layoutNodeShrinkFactorNum");
      var targetNodeCurrent=document.getElementById("layoutTargetNodeCurrent");

      if(bVal){
        if(tn!==document.activeElement)tn.value="branch:"+bVal;
        if(targetNodeCurrent)targetNodeCurrent.textContent=bVal;
        if(pickHint)pickHint.hidden=true;
        if(tiltRow)tiltRow.hidden=true;
        if(linesRow)linesRow.hidden=false;
        if(lenLabel)lenLabel.textContent="This branch's line length";
        if(shrinkLabel)shrinkLabel.textContent="Auto-shrink branch spoke";
        if(factorLabel)factorLabel.textContent="Auto-shrink factor — branch spokes";
        if(armSubsLabel)armSubsLabel.textContent="For all subcategories";
        var bLen=document.getElementById("layoutBranchLen");
        if(nodeLen&&bLen&&nodeLen!==document.activeElement){nodeLen.value=bLen.value;nodeLen.disabled=false;}
        if(nodeLenNum&&bLen&&nodeLenNum!==document.activeElement){nodeLenNum.value=bLen.value;nodeLenNum.disabled=false;}
        var bSpoke=document.getElementById("layoutBranchSpokeAutoShrink");
        if(nodeSpoke&&bSpoke){nodeSpoke.checked=bSpoke.checked;nodeSpoke.disabled=false;}
        var bFac=document.getElementById("layoutAutoShrinkFactor");
        if(nodeFactor&&bFac&&nodeFactor!==document.activeElement){nodeFactor.value=bFac.value;}
        if(nodeFactorNum&&bFac&&nodeFactorNum!==document.activeElement){nodeFactorNum.value=bFac.value;}
      }else if(sVal){
        if(tn!==document.activeElement)tn.value="subcat:"+sVal;
        var tax=taxonomy(),pName="";
        if(tax&&tax.categories){
          for(var i=0;i<tax.categories.length;i++){
            var cat=tax.categories[i];
            if(cat.subcategories&&cat.subcategories.some(function(s){return s.name===sVal})){pName=cat.name;break}
          }
        }
        if(targetNodeCurrent)targetNodeCurrent.textContent=pName?(pName+" > "+sVal):sVal;
        if(pickHint)pickHint.hidden=true;
        if(tiltRow)tiltRow.hidden=false;
        if(linesRow)linesRow.hidden=true;
        if(lenLabel)lenLabel.textContent="This sub-group's line length";
        if(shrinkLabel)shrinkLabel.textContent="Auto-shrink sub-group line";
        if(factorLabel)factorLabel.textContent="Sub-group cloud shrink factor";
        if(armSubsLabel)armSubsLabel.textContent="For all subcategories";
        var sLen=document.getElementById("layoutSubcatLen");
        if(nodeLen&&sLen&&nodeLen!==document.activeElement){nodeLen.value=sLen.value;nodeLen.disabled=false;}
        if(nodeLenNum&&sLen&&nodeLenNum!==document.activeElement){nodeLenNum.value=sLen.value;nodeLenNum.disabled=false;}
        var sSpoke=document.getElementById("layoutSubcatSpokeAutoShrink");
        if(nodeSpoke&&sSpoke){nodeSpoke.checked=sSpoke.checked;nodeSpoke.disabled=false;}
        var sFac=document.getElementById("layoutSubcatCloudShrinkFactor");
        if(nodeFactor&&sFac&&nodeFactor!==document.activeElement){nodeFactor.value=sFac.value;}
        if(nodeFactorNum&&sFac&&nodeFactorNum!==document.activeElement){nodeFactorNum.value=sFac.value;}
      }else{
        if(tn!==document.activeElement)tn.value="";
        if(targetNodeCurrent)targetNodeCurrent.textContent="Select a node";
        if(pickHint)pickHint.hidden=false;
        if(nodeLen)nodeLen.disabled=true;
        if(nodeLenNum)nodeLenNum.disabled=true;
        if(nodeSpoke)nodeSpoke.disabled=true;
      }
      var activeVal=tn.value||"";
      var treeMenu=document.getElementById("layoutTargetNodeMenu");
      if(treeMenu){
        treeMenu.querySelectorAll(".le-tree-node-btn").forEach(function(b){
          var isSel=(b.getAttribute("data-node-val")||"")===activeVal;
          b.setAttribute("aria-selected",String(isSel));
          if(isSel&&activeVal.indexOf("subcat:")===0){
            var parentWrap=b.closest(".le-tree-children");
            if(parentWrap){
              parentWrap.hidden=false;
              var row=parentWrap.previousElementSibling;
              if(row){
                var tog=row.querySelector(".le-tree-toggle");
                if(tog){
                  tog.setAttribute("aria-expanded","true");
                  var tri=tog.querySelector(".le-tree-triangle");
                  if(tri)tri.textContent="▼";
                }
              }
            }
          }
        });
      }
    }
    function bindTargetNode(){
      var tn=document.getElementById("layoutTargetNode");
      if(tn&&!tn.dataset.bound){
        tn.dataset.bound="1";
        tn.addEventListener("change",function(){
          var val=this.value;
          var bSel=document.getElementById("layoutBranch"),sSel=document.getElementById("layoutSubcat");
          if(val.indexOf("branch:")===0){
            var bName=val.slice(7);
            if(bSel)bSel.value=bName;
            if(sSel)sSel.value="";
            syncBranch(config());
            syncSubcatAngle(config());
            setFocusKey("branch:"+bName);
            if(window.__sxFocusBranch)window.__sxFocusBranch(bName);
          }else if(val.indexOf("subcat:")===0){
            var sName=val.slice(7);
            if(sSel)sSel.value=sName;
            if(bSel)bSel.value="";
            syncSubcatAngle(config());
            syncBranch(config());
            setFocusKey("subcat:"+sName);
            if(window.__sxFocusNode)window.__sxFocusNode(sName, "");
          }else{
            if(bSel)bSel.value="";
            if(sSel)sSel.value="";
            syncBranch(config());
            syncSubcatAngle(config());
            clearSelectionUI();
          }
        });
      }
      var targetNodeBtn=document.getElementById("layoutTargetNodeBtn");
      var targetNodeMenu=document.getElementById("layoutTargetNodeMenu");
      if(targetNodeBtn&&targetNodeMenu&&!targetNodeBtn.dataset.bound){
        targetNodeBtn.dataset.bound="1";
        targetNodeBtn.addEventListener("click",function(){
          if(targetNodeMenu.hidden){
            openLeMenu(targetNodeBtn,targetNodeMenu,function(){
              closeBranchOrderMenu();
              closeCollisionMenu();
              closeSolverModeMenu();
            });
          }else{
            closeTargetNodeMenu();
          }
        });
        document.addEventListener("pointerdown",function(event){
          if(!targetNodeMenu.hidden&&!targetNodeMenu.contains(event.target)&&event.target!==targetNodeBtn&&!targetNodeBtn.contains(event.target)){
            closeTargetNodeMenu();
          }
        });
        document.addEventListener("keydown",function(event){
          if(event.key==="Escape"&&!targetNodeMenu.hidden){
            closeTargetNodeMenu();
            targetNodeBtn.focus();
          }
        });
      }
      var nodeLen=document.getElementById("layoutNodeLen");
      if(nodeLen&&!nodeLen.dataset.bound){
        nodeLen.dataset.bound="1";
        nodeLen.addEventListener("input",function(){
          var tnVal=document.getElementById("layoutTargetNode")?document.getElementById("layoutTargetNode").value:"";
          if(tnVal.indexOf("branch:")===0){
            var bLen=document.getElementById("layoutBranchLen");
            if(bLen){bLen.value=this.value;applyBranchLen();}
          }else if(tnVal.indexOf("subcat:")===0){
            var sLen=document.getElementById("layoutSubcatLen");
            if(sLen){sLen.value=this.value;applySubcatLen();}
          }
        });
      }
      var nodeSpoke=document.getElementById("layoutNodeSpokeAutoShrink");
      if(nodeSpoke&&!nodeSpoke.dataset.bound){
        nodeSpoke.dataset.bound="1";
        nodeSpoke.addEventListener("change",function(){
          var tnVal=document.getElementById("layoutTargetNode")?document.getElementById("layoutTargetNode").value:"";
          if(tnVal.indexOf("branch:")===0){
            var bSp=document.getElementById("layoutBranchSpokeAutoShrink");
            if(bSp){bSp.checked=this.checked;bSp.dispatchEvent(new Event("change"));}
          }else if(tnVal.indexOf("subcat:")===0){
            var sSp=document.getElementById("layoutSubcatSpokeAutoShrink");
            if(sSp){sSp.checked=this.checked;sSp.dispatchEvent(new Event("change"));}
          }
        });
      }
      var nodeFactor=document.getElementById("layoutNodeShrinkFactor");
      if(nodeFactor&&!nodeFactor.dataset.bound){
        nodeFactor.dataset.bound="1";
        nodeFactor.addEventListener("input",function(){
          var tnVal=document.getElementById("layoutTargetNode")?document.getElementById("layoutTargetNode").value:"";
          if(tnVal.indexOf("branch:")===0){
            var bFac=document.getElementById("layoutAutoShrinkFactor");
            if(bFac){bFac.value=this.value;bFac.dispatchEvent(new Event("input"));bFac.dispatchEvent(new Event("change"));}
          }else if(tnVal.indexOf("subcat:")===0){
            var sFac=document.getElementById("layoutSubcatCloudShrinkFactor");
            if(sFac){sFac.value=this.value;sFac.dispatchEvent(new Event("input"));sFac.dispatchEvent(new Event("change"));}
          }
        });
      }
    }
    function syncSubcatAngle(c){var select=document.getElementById("layoutSubcat"),name=select.value,lentry=name&&c.subcatOverrides?c.subcatOverrides[name]:null,slen=document.getElementById("layoutSubcatLen");slen.disabled=!name;var curSubLen=(lentry&&Number(lentry.length))||bakedSubBase(name,"length");if(slen!==document.activeElement)slen.value=String(relClamp(curSubLen/bakedSubBase(name,"length")));document.getElementById("layoutSubcatLenValue").textContent=fmtLen(curSubLen);var entry=name&&c.subcatAngleOffsets?c.subcatAngleOffsets[name]:null,ang=document.getElementById("layoutSubcatAngle");ang.disabled=!name;if(ang!==document.activeElement)ang.value=String(entry&&Number(entry.angle)||0);document.getElementById("layoutSubcatAngleValue").textContent=Number(ang.value).toFixed(1)+"°";/* AUTOFIT (Group 3d, Q2): the sub-group kink-lines checkbox is removed — its function is covered by the Autofit button, which runs the selected sub-group's owning branch. */var subcatSpoke=document.getElementById("layoutSubcatSpokeAutoShrink");subcatSpoke.disabled=!name;subcatSpoke.checked=!!(c.subcatSpokeAutoShrink&&c.subcatSpokeAutoShrink[name]===true);var armHint=document.getElementById("layoutSubcatShrinkHint");if(armHint)armHint.hidden=!!name;syncTargetNode(c)}
    function sync(){var c=config();populateBranches();populateKinks();populateSubcats();populateTargetNodes();bindTargetNode();syncSubcatAngle(c);["stagger","expandAll","crossmin","nudge","showRelations","propFan","subcatOrder","staggerDensity","repulsionEnabled","staticMap","animations","mapSliders"].forEach(function(key){var el=document.getElementById(ids[key]);if(el)el.checked=c[key]===undefined?false:Boolean(c[key])});if(c.collision&&c.collision!=="off")lastCollision=c.collision;document.getElementById(ids.collisionEnabled).checked=c.collision!=="off";/* LR-G5: no hidden collision select to write — the aria-pressed group write that follows IS the mode state now */document.querySelectorAll("[data-collision-mode]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.collisionMode===(c.collision||"grow")))});syncCollisionAnchor();setSolverMode(c.solverMidline);["subLen","pad","repulsion"].forEach(function(key){var input=document.getElementById(ids[key]),value=Number(c[key]);if(input!==document.activeElement)input.value=String(value);document.getElementById(ids[key]+"Value").textContent=value.toFixed(1)+"×"});var spokeInput=document.getElementById(ids.spokeLen),spokeAbs=Number(c.spokeLen);if(!Number.isFinite(spokeAbs)||spokeAbs<=0)spokeAbs=bakedSpokeBase();if(spokeInput!==document.activeElement)spokeInput.value=String(relClamp(spokeAbs/bakedSpokeBase()));document.getElementById(ids.spokeLen+"Value").textContent=fmtLen(spokeAbs);var fontScaleInput=document.getElementById(ids.fontScale),fontScaleValue=Number(c.fontScale);if(fontScaleInput!==document.activeElement)fontScaleInput.value=String(Number.isFinite(fontScaleValue)?fontScaleValue:1);var fontScaleNumSync=document.getElementById("layoutFontScaleNum");if(fontScaleNumSync&&document.activeElement!==fontScaleNumSync)fontScaleNumSync.value=String(Number.isFinite(fontScaleValue)?fontScaleValue:1);document.getElementById(ids.fontScale+"Value").textContent=(Number.isFinite(fontScaleValue)?fontScaleValue:1).toFixed(2)+"×";var centerRingScaleInput=document.getElementById(ids.centerRingScale),centerRingScaleValue=Number(c.centerRingScale);if(centerRingScaleInput!==document.activeElement)centerRingScaleInput.value=String(Number.isFinite(centerRingScaleValue)?centerRingScaleValue:1);var centerRingScaleNumSync=document.getElementById("layoutCenterRingScaleNum");if(centerRingScaleNumSync&&document.activeElement!==centerRingScaleNumSync)centerRingScaleNumSync.value=String(Number.isFinite(centerRingScaleValue)?centerRingScaleValue:1);document.getElementById(ids.centerRingScale+"Value").textContent=(Number.isFinite(centerRingScaleValue)?centerRingScaleValue:1).toFixed(2)+"×";var leafOvergrowthInput=document.getElementById(ids.leafOvergrowth),leafOvergrowthValue=Number(c.leafOvergrowth);if(!Number.isFinite(leafOvergrowthValue)||leafOvergrowthValue<=0)leafOvergrowthValue=100;if(leafOvergrowthInput&&leafOvergrowthInput!==document.activeElement)leafOvergrowthInput.value=String(leafOvergrowthValue);var leafOvergrowthNumSync=document.getElementById("layoutLeafOvergrowthNum");if(leafOvergrowthNumSync&&document.activeElement!==leafOvergrowthNumSync)leafOvergrowthNumSync.value=String(leafOvergrowthValue);var leafOvergrowthOut=document.getElementById(ids.leafOvergrowth+"Value");if(leafOvergrowthOut)leafOvergrowthOut.textContent=String(Math.round(leafOvergrowthValue))+"%";["autoShrinkFactor","subcatCloudShrinkFactor"].forEach(function(key){var input=document.getElementById(ids[key]),value=Number(c[key]);if(!Number.isFinite(value)||value<=0||value>1)value=.76;if(input&&input!==document.activeElement)input.value=String(value);var out=document.getElementById(ids[key]+"Value");if(out)out.textContent=value.toFixed(2)+"×"});var syncSpacingName=spacingNameFor(spacingValuesOf(c));document.querySelectorAll("[data-layout-spacing]").forEach(function(input){input.checked=input.dataset.layoutSpacing===syncSpacingName});/* LR-G5: the rating used to be read from the hidden mirror button's textContent; it is now read from the checked layoutRating radio itself (same value domain) */var ratingChecked=document.querySelector("[data-layout-rating]:checked"),rating=(ratingChecked&&(ratingChecked.dataset.layoutRating==="rated"||ratingChecked.dataset.layoutRating==="unrated"||ratingChecked.dataset.layoutRating==="all"))?ratingChecked.dataset.layoutRating:"all";document.querySelectorAll("[data-layout-rating]").forEach(function(input){input.checked=input.dataset.layoutRating===rating});document.querySelectorAll("[data-branch-order]").forEach(function(btn){btn.setAttribute("aria-pressed",String(btn.dataset.branchOrder===(c.branchOrder||"landscape-antipodal")))});syncBranchOrderAnchor();document.querySelectorAll(".le-ms-radio").forEach(function(box){Array.prototype.forEach.call(box.querySelectorAll(".le-ms-opt"),function(l){var i=l.querySelector("input");l.classList.toggle("is-current",!!(i&&i.checked))})});document.documentElement.classList.toggle("le-anim-off",!c.animations);syncBranch(c);syncKink(c);syncSpokeAngles(c)}
    function branchOrderSelection(){var pressed=document.querySelector("[data-branch-order][aria-pressed='true']");return pressed?pressed.dataset.branchOrder:(config().branchOrder||"landscape-antipodal")}
    /* LR-G5: collision mode state used to live in a hidden select (former id layoutCollisionMode); it now lives in the visible #layoutCollisionMs button group — the pressed button is the mode. collisionModeValue reads it, setCollisionMode presses a mode, and applyCollisionMode carries the former select change handler's effects verbatim (lastCollision bookkeeping, master-switch sync, apply path). */
    function collisionModeValue(){var b=document.querySelector("[data-collision-mode][aria-pressed='true']");return b?b.dataset.collisionMode:"grow"}
    function setCollisionMode(v){document.querySelectorAll("[data-collision-mode]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.collisionMode===v))})}
    function applyCollisionMode(v){if(v!=="off")lastCollision=v;document.getElementById(ids.collisionEnabled).checked=v!=="off";apply(collect())}
    /* Solver-mode toggle: mirrors the collision pair above. The mode state lives in the live layout model (collect() carries it from config()); setSolverMode presses one option and updates the button label. Hash-only modes (shadow, off, anything not settle/full/legacy/repulsion) show their raw name with a "(hash only)" marker and nothing pressed, so the control never lies about a mode it cannot set. */
    function setSolverMode(v){var norm=v==="repulsion"?"repulsion":(v==="settle"||v==="full"||v==="legacy")?"settle":null;document.querySelectorAll("[data-solver-mode]").forEach(function(b){b.setAttribute("aria-pressed",String(norm!==null&&b.dataset.solverMode===norm))});var cur=document.getElementById("layoutSolverModeCurrent");if(!cur)return;if(norm){var opt=document.querySelector("[data-solver-mode='"+norm+"']");cur.textContent=opt?opt.textContent:norm}else cur.textContent=String(v==null?"":v)+" (hash only)"}
    function writeSolverModeHash(v){try{var hash=window.location.hash||"",body=hash.charAt(0)==="#"?hash.slice(1):hash,tokens=body?body.split("&"):[],found=false;tokens=tokens.map(function(t){if(t.indexOf("layout-solverMidline=")===0){found=true;return "layout-solverMidline="+v}return t});if(!found)tokens.push("layout-solverMidline="+v);history.replaceState(null,"","#"+tokens.join("&"))}catch (error) { __sxErrLog("layout-solver-mode-hash", error); }}
    function applySolverMode(v){var next=collect();next.solverMidline=v;apply(next);writeSolverModeHash(v)}
    function collect(){var c=config(),enabled=document.getElementById(ids.collisionEnabled).checked,mode=collisionModeValue();return{spacing:spacingNameFor({spokeLen:(Number(document.getElementById(ids.spokeLen).value)||1)*bakedSpokeBase(),subLen:Number(document.getElementById(ids.subLen).value),pad:Number(document.getElementById(ids.pad).value),repulsion:Number(document.getElementById(ids.repulsion).value)}),branchOrder:branchOrderSelection(),propFan:document.getElementById(ids.propFan).checked,subcatOrder:document.getElementById(ids.subcatOrder).checked,staggerDensity:document.getElementById(ids.staggerDensity).checked,stagger:document.getElementById(ids.stagger).checked,expandAll:document.getElementById(ids.expandAll).checked,crossmin:document.getElementById(ids.crossmin).checked,nudge:document.getElementById(ids.nudge).checked,showRelations:document.getElementById(ids.showRelations).checked,repulsionEnabled:document.getElementById(ids.repulsionEnabled).checked,staticMap:document.getElementById(ids.staticMap).checked,animations:document.getElementById(ids.animations).checked,mapSliders:Boolean(document.getElementById(ids.mapSliders)&&document.getElementById(ids.mapSliders).checked),collision:enabled?(mode==="off"?lastCollision:mode):"off",spokeLen:(Number(document.getElementById(ids.spokeLen).value)||1)*bakedSpokeBase(),subLen:Number(document.getElementById(ids.subLen).value),pad:Number(document.getElementById(ids.pad).value),repulsion:Number(document.getElementById(ids.repulsion).value),fontScale:Number(document.getElementById(ids.fontScale).value),centerRingScale:Number(document.getElementById(ids.centerRingScale).value),leafOvergrowth:Number(document.getElementById(ids.leafOvergrowth).value),autoShrinkFactor:Number(document.getElementById(ids.autoShrinkFactor).value),subcatCloudShrinkFactor:Number(document.getElementById(ids.subcatCloudShrinkFactor).value),branchOverrides:copyOverrides(c.branchOverrides),subcatOverrides:copyOverrides(c.subcatOverrides||{}),kinkOverrides:copyOverrides(c.kinkOverrides||{}),subcatAngleOffsets:copyOverrides(c.subcatAngleOffsets||{}),kinkAngleOffsets:copyOverrides(c.kinkAngleOffsets||{}),branchSpokeAutoShrink:Object.assign({},c.branchSpokeAutoShrink||{}),subcatSpokeAutoShrink:Object.assign({},c.subcatSpokeAutoShrink||{}),solverMidline:c.solverMidline||(window.__SEXCAPADES_LAYOUT&&window.__SEXCAPADES_LAYOUT.solverMidline)||"off"}}
    // Cross-tab live sync (Build 2026-10-19_1742): every change made in
    // this editor is written (debounced, ~300ms) to localStorage, where
    // other open tabs/windows pick it up via the storage event and
    // update their map live — tune here in one window while the full
    // map follows along in another. The reset path mutes the writer so
    // restoring defaults never broadcasts as a live change.
    var liveSyncTimer=null,liveSyncMuted=false;
    function scheduleLiveSync(){if(liveSyncMuted)return;if(liveSyncTimer)clearTimeout(liveSyncTimer);liveSyncTimer=setTimeout(function(){liveSyncTimer=null;try{window.localStorage&&window.localStorage.setItem("sexcapades-layout-liveSettings",JSON.stringify({build:(document.querySelector('meta[name="sexcapades-build"]') || {}).content || "",exportedAt:new Date().toISOString(),settings:collect(),editor:collectEditorState()}))}catch (error) { __sxErrLog("layout-live-sync", error); }},300)}
    // Editor chrome/metric state (Batch C, Build 2026-10-20_0023): the
    // metric overlay toggle, the metric dropdown selection, the
    // power-user toggle and the fullscreen state ride in the same
    // live-sync payload as the geometry keys, on the same ~300ms
    // debounce, so a change in either window reaches the other.
    // applyEditorState replays a received state into this window's
    // controls: programmatic .checked/.value sets fire no change
    // events, and editorSyncGuard stops setLayoutFullscreen from
    // re-broadcasting a state it just received — no echo loop. Reset
    // to defaults stays muted via liveSyncMuted exactly as before.
    var editorSyncGuard=false;
    function collectEditorState(){var pT=document.getElementById("layoutPowerUser");return{metricOverlayOn:Boolean(metricOverlayOn&&metricId!=="off"),metricId:typeof metricId==="string"?metricId:"off",powerUser:pT?!!pT.checked:panel.classList.contains("le-power"),fullscreen:panel.classList.contains("layout-fullscreen"),customSpacing:customSpacing?spacingValuesOf(customSpacing):null,armScope:(typeof lrG3CollectArmScope==="function"?lrG3CollectArmScope():null)}}
    function applyEditorState(st){if(!st||typeof st!=="object")return;editorSyncGuard=true;try{
      if(typeof st.metricId==="string"&&(st.metricId==="off"||LayoutMetrics.get(st.metricId))){metricId=st.metricId;metricOn=metricId!=="off";if(metricSelect)metricSelect.value=metricId;if(metricButton)metricButton.disabled=!metricOn;stopMetricBusy();clearMetricGlobal();if(metricOn)scheduleMetric();else{metricRun++;metricGlobalRun++;if(metricTimer)clearTimeout(metricTimer);clearMetricOverlay()}}
      if(typeof st.metricOverlayOn==="boolean"){metricOverlayOn=Boolean(st.metricOverlayOn&&metricId!=="off");if(metricOverlayToggle)metricOverlayToggle.checked=metricOverlayOn;if(metricOverlayOn){renderMetricOverlayCache();if(metricOn&&metricId!=="off")scheduleMetric()}else clearMetricOverlay()}
      if(st.customSpacing&&typeof st.customSpacing==="object"){var csv=spacingValuesOf(st.customSpacing);if(csv)customSpacing=csv}
      if(typeof st.powerUser==="boolean"){var pT=document.getElementById("layoutPowerUser");if(pT)pT.checked=st.powerUser;panel.classList.toggle("le-power",st.powerUser);panel.querySelectorAll(".le-adv").forEach(function(d){d.open=st.powerUser})}
      if(st.armScope&&typeof lrG3ApplyArmScope==="function")lrG3ApplyArmScope(st.armScope);
      if(typeof st.fullscreen==="boolean")setLayoutFullscreen(st.fullscreen);
    }catch(error){__sxErrLog("layout-editor-sync",error)}editorSyncGuard=false}
    // No-op apply short-circuit (Group 4, G4-2): a layout apply whose
    // settings are identical to the current ones still paid for a
    // full bundle re-solve + repaint — the ~12.9s main-thread block
    // measured for a no-op apply on build 0459. The comparison uses a
    // stable stringify (object keys sorted at every level) over the
    // exact key set collect() produces and config() reports, so
    // override-map key order cannot cause false misses. Identical
    // settings skip only the bundle apply; the font/ring side
    // effects, the editor sync, and every scheduler still run, so
    // nothing observable changes. Any doubt (exception, shape drift)
    // falls back to the full apply.
    function stableSettingsString(value){if(value===null||typeof value!=="object")return JSON.stringify(value);if(Array.isArray(value))return "["+value.map(stableSettingsString).join(",")+"]";return "{"+Object.keys(value).sort().map(function(k){return JSON.stringify(k)+":"+stableSettingsString(value[k])}).join(",")+"}"}
    // Scoped routing (Stage 3, T5): apply() takes an optional
    // scope as its third argument. The eleven per-branch /
    // per-subcategory / per-topic handlers pass one (see
    // scopedScope, defined just above those handlers); every other caller
    // passes none and takes exactly the path this function has
    // always taken. With a scope, the bundle commit goes through
    // API.applyScoped instead of API.apply — the no-op
    // short-circuit above still runs first, so an unchanged
    // commit performs no solve at all, and the font/ring side
    // effects, sync(), and every scheduler below (scores,
    // metric, cross-window live sync) run identically either
    // way. If the bundle has no applyScoped, the commit falls
    // back to the ordinary API.apply.
    // BOOTLOAD-FIX (Q6): Reset busy bookkeeping. The Reset handler names
    // its button here just before calling apply; apply consumes the
    // reference, paints .is-busy when it arms a progress session, and
    // the session completion callback clears it. Other applies name
    // no button; they arm the map stopwatch alone.
    // TIMING CHAIN (F6, layout-editor refactor - documentation
    // only; every name and value below verified against this code):
    //
    //   actuator (lrActuate, or a panel control)
    //     -> apply(next, msg, scope) ......... the central apply
    //          No-op short-circuit: when stableSettingsString(next)
    //          equals stableSettingsString(config()), the bundle
    //          commit is skipped; font/ring side effects, sync()
    //          and every scheduler below still run.
    //          Chunked commit: when a load session is armed via
    //          __sxLoadSessionStart (progress checkpoints), the
    //          commit goes through API.applyChunked(next, scope)
    //          and postApply runs when it resolves; otherwise
    //          API.apply / API.applyScoped runs it synchronously.
    //          postApply(): side effects, sync(), scheduleScores(),
    //          scheduleMetric(), scheduleLiveSync()
    //     -> scheduleMetric() ................ 500 ms debounce
    //          (metricTimer; each new call clearTimeout()s the
    //          pending one, cancelling the older measure)
    //     -> measureLocals() ................. runs ONLY the picked
    //          metric's clouds() walk; stamps run = ++metricRun
    //     -> renderMetricOverlay(clouds) ..... MetricNumbersView.render
    //     -> positionMetricOverlay() ......... MetricNumbersView.position
    //          scheduleOverlayPosition() defers re-positioning to
    //          the next animation frame (MetricNumbersView.raf guard)
    //
    //   Settle path (an Anneal run handing back):
    //     noteSettlePending() arms settleArmDeadline = now + 3000 ms
    //     and starts settleTick on a 400 ms interval -> settleTick()
    //     polls blitSessionActive() (the driver log's blit-session
    //     start/end entries, read through api.anneal) -> when the
    //     session lands, onSettleLanded() calls scheduleMetric()
    //     and re-reads the cloud fresh via dk.measureCloud for the
    //     receipt -> stopSettleWatch() clears the interval.
    //
    //   Slider input: coalesceSlider() coalesces input events to
    //   one handler call per animation frame; a change event cancels
    //   the pending frame and runs the handler immediately.
    //
    //   WHO CANCELS WHOM
    //     - measureLocals' cancelled() guard: a run whose stamp no
    //       longer equals metricRun - or metrics switched off, or
    //       the picker changed - drops its result. Last writer wins.
    //     - metricGlobalRun does the same for Calculate-now runs.
    //     - settleTick stops the settle watch when the blit session
    //       lands, or when now passes settleArmDeadline (3000 ms)
    //       with no landing; a stale dkReceipt is marked not-fresh.
    //     - A pending measureLocals is cancelled by any newer
    //       settings change, via scheduleMetric's clearTimeout.
    var applyBusyBtn=null;
    function apply(next,msg,scope){var btnForApply=applyBusyBtn;applyBusyBtn=null;var skipBundleApply=false;if(next&&window.__SEXCAPADES_LAYOUT_API){try{skipBundleApply=stableSettingsString(next)===stableSettingsString(config())}catch (e) { __sxErrLog("layout-apply-compare", e); }}var mutedAtCall=liveSyncMuted;var chunkArmed=false;/* #9: arm the paintbrush pill for this apply, wired EXPLICITLY to the button this caller named via applyBusyBtn (btnForApply) — never assumed populated. The pill finishes on the SAME signal that clears the button today: the overlay session's onDone on the armed path (so it spans the settle tail through the map-complete gate), or runApply()'s return on the unarmed synchronous path. */var pillToken=null;if(!skipBundleApply&&next&&window.__SEXCAPADES_LAYOUT_API&&typeof window.__sxPillSessionStart==="function"){try{pillToken=window.__sxPillSessionStart({button:btnForApply||null})}catch(e){__sxErrLog("layout-apply-pill-arm",e)}}function pillDone(){if(!pillToken)return;var t=pillToken;pillToken=null;try{window.__sxPillSessionFinish(t)}catch(e){__sxErrLog("layout-apply-pill-finish",e)}}function runApply(){var prevMute=liveSyncMuted;liveSyncMuted=mutedAtCall;function postApply(){if(window.__sxSyncMapFontBase)window.__sxSyncMapFontBase();var ecr=document.querySelector(".empty-center-ring");if(ecr)ecr.setAttribute("r",String(133*(Number(next&&next.centerRingScale)||1)));sync();scheduleScores();scheduleMetric();scheduleLiveSync();liveSyncMuted=prevMute;}if(!skipBundleApply){var layoutApi=window.__SEXCAPADES_LAYOUT_API;if(layoutApi){if(chunkArmed&&layoutApi.applyChunked){layoutApi.applyChunked(next,scope).then(postApply,function(e){__sxErrLog("layout-apply-chunked",e);postApply();});return;}if(scope&&layoutApi.applyScoped)layoutApi.applyScoped(next,scope);else layoutApi.apply(next)}else Object.assign(window.__SEXCAPADES_LAYOUT,next)}postApply();}if(!skipBundleApply&&window.__SEXCAPADES_LAYOUT_API&&typeof window.__sxLoadSessionStart==="function"){var armed=false;try{armed=window.__sxLoadSessionStart({msg:(typeof msg==="string"&&msg)?msg:null,onDone:function(){pillDone();if(btnForApply){btnForApply.classList.remove("is-busy");btnForApply.removeAttribute("aria-busy");}}})}catch(e){__sxErrLog("layout-apply-arm",e)}if(armed){chunkArmed=true;if(btnForApply){btnForApply.classList.add("is-busy");btnForApply.setAttribute("aria-busy","true")}if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(runApply,0)})});else setTimeout(runApply,0);return;}}runApply();pillDone();}
    // Selectable layout metric framework. window.LayoutMetrics is a registry:
    // adding a future metric = LayoutMetrics.register('id',{label,tooltip,compute}).
    // compute(ctx, done, isCancelled): ctx={svg}; done({value,text}) when finished.
    // Heavy metrics MUST chunk via requestIdleCallback and check isCancelled() between chunks.
    // SOLVER-METRICS REFACTOR (F7): MEASUREMENT SUBSTRATES. Every
    // registry entry (and its defs.*.clouds walk) names its substrate:
    // "as rendered" reads the LIVE DRAWING (DOM/SVG geometry) and is
    // only meaningful after a paint; "as last solved" reads the
    // bundle's delivered-geometry registry (dkLastBranches, via
    // window.__sxCrossingMeasure) and reflects the last solve whether
    // or not it has painted. The two can disagree mid-interaction.
    // They are deliberately NOT converged: the drawing metrics need
    // the drawing itself, and the crossing number must not take a
    // repaint dependency — so the substrate is documented per entry
    // instead, on the line above each register() call.
    var LayoutMetrics={defs:{},order:[],register:function(id,def){if(!id||!def||typeof def.compute!=='function')return;def.id=id;if(!this.defs[id])this.order.push(id);this.defs[id]=def;},get:function(id){return this.defs[id]||null;},ids:function(){return this.order.slice();}};
    window.LayoutMetrics=LayoutMetrics;
    // F7 substrate: AS RENDERED — live tap-target boxes in the drawing.
    LayoutMetrics.register('z90',{label:'Zoom needed for tappable buttons',tooltip:'How far you would need to zoom in before almost all of the give/receive buttons are big enough to tap comfortably. Lower is better. At the baked defaults (text 120, centre 90) the measured whole-map reading is 12.6×.',compute:function(ctx,done,isCancelled){var els=document.querySelectorAll(z90Selector()),inv=metricWorldFrame(),fitScale=metricFitScale(),needs=[],i=0;function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}function chunk(){if(isCancelled())return;var end=Math.min(els.length,i+120);for(;i<end;i++){var box=metricTagWorldBox(inv,els[i]);if(!box)continue;needs.push(44/(fitScale*Math.min(box.width,box.height)))}if(i<els.length)defer();else{var v=z90Percentile(needs);done({value:v,text:v.toFixed(1)+'×'})}}defer()}});
    // Spoke collision area (xAreaCross), ported from tune-measure-area.js:
    // sum over proper spoke-spoke crossings of salience =
    // min(t,1-t)*lenA * min(u,1-u)*lenB * sin(theta) — 0 at segment
    // endpoints (root/tip nicks vanish), maximal for mid-segment
    // perpendicular crossings of long spokes. Crossings whose two spokes
    // belong to the same top-level branch are excluded: this is the
    // CROSS-branch clutter number. Sub-threshold salience (< 1 px²) is
    // ignored, matching MIN_X_AREA in the headless tool. Metrics
    // rebuild, Edit 2: measured in WORLD coordinates (the world node
    // walk below), so the px² are world px²; endpoint exclusion is
    // structural (segments sharing an endpoint node never pair).
    function topBranchKey(key){
      if(!key)return null;
      var branches=branchNames(),i,b,bs;
      if(key.indexOf("cat-")===0){var slug=key.slice(4);for(i=0;i<branches.length;i++)if(slugify(branches[i])===slug)return branches[i];return null}
      if(key.indexOf("subcategory-")===0){var rest=key.slice(12);for(i=0;i<branches.length;i++){bs=slugify(branches[i]);if(rest===bs||rest.indexOf(bs+"-")===0)return branches[i]}return null}
      var entry=topicEntry(key);
      if(entry&&entry.category)return entry.category;
      if(key.indexOf("topic-")===0){var trest=key.slice(6);for(i=0;i<branches.length;i++){bs=slugify(branches[i]);if(trest.indexOf(bs+"-")===0)return branches[i]}}
      return null;
    }
    function segMetrics(ax1,ay1,ax2,ay2,bx1,by1,bx2,by2){
      var dxA=ax2-ax1,dyA=ay2-ay1,dxB=bx2-bx1,dyB=by2-by1;
      var lenA=Math.hypot(dxA,dyA),lenB=Math.hypot(dxB,dyB);
      if(lenA<1e-9||lenB<1e-9)return null;
      var d=dxA*dyB-dyA*dxB;
      if(Math.abs(d)<1e-9*lenA*lenB)return null;
      var t=((bx1-ax1)*dyB-(by1-ay1)*dxB)/d;
      var u=((bx1-ax1)*dyA-(by1-ay1)*dxA)/d;
      return{t:t,u:u,lenA:lenA,lenB:lenB,sinTheta:Math.abs(d)/(lenA*lenB)};
    }
    // RESTORED (2026-10-29): the xAreaCross area metric registration is
    // live again per Jason's ruling reversing the dropdown part of #4.
    // Observation only — nothing is decided on this metric; every gate
    // still runs on the crossing number. The graze term inside E is a
    // separate, decision-side use of area and stays untouched.
    // F7 substrate: AS RENDERED — live line geometry in the drawing.
    LayoutMetrics.register('xareacross',{label:'Area where lines cross',tooltip:'Total area covered by lines from different branches crossing over each other. Lower looks cleaner.',compute:function(ctx,done,isCancelled){
      var svg=(ctx&&ctx.svg)||document.getElementById("mapSvg");
      if(!svg){done({value:0,text:"0 px²"});return}
      var np=metricNodePositionsWorld(svg),segs=cloudSegs(np);
      var sum=0,i=0;
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(segs.length,i+16);
        for(;i<end;i++){
          var s=segs[i];
          for(var j=i+1;j<segs.length;j++){
            var t=segs[j];
            if(metricSegsShareNode(s,t))continue;
            var mm=segMetrics(s.a.x,s.a.y,s.b.x,s.b.y,t.a.x,t.a.y,t.b.x,t.b.y);
            if(!mm||mm.t<=0||mm.t>=1||mm.u<=0||mm.u>=1)continue;
            var sal=Math.min(mm.t,1-mm.t)*mm.lenA*Math.min(mm.u,1-mm.u)*mm.lenB*mm.sinTheta;
            if(sal<1)continue;
            if(s.branch!=null&&s.branch===t.branch)continue;
            sum+=sal;
          }
        }
        if(i<segs.length)defer();
        else done({value:sum,text:String(Math.round(sum)).replace(/\B(?=(\d{3})+(?!\d))/g,",")+" px²"});
      }
      defer();
    }});
    // Shared node-position walk for the three metrics added in Build
    // 2026-10-19_1152 (same geometry source as updateScores / xareacross):
    // visible node-group icons in screen space, plus the map center
    // resolved through the layer CTM with a category-centroid fallback.
    function metricNodePositions(svg){return MetricGeometry.nodePositions(svg,false)}
    // World-frame twin of metricNodePositions (Metrics rebuild,
    // Edit 2): the same node enumeration — visible node-group icons,
    // with NO screen-size gate: a node is included whenever its icon
    // element exists — but every position is the icon rect center
    // converted to WORLD coordinates through the inverse layer CTM
    // captured once per call (metricWorldFrame / metricWorldPoint),
    // and the center is the layer-space center itself, exactly
    // {x:900, y:620}. If the CTM is unavailable the positions fall
    // back to the raw icon centers and the center to the category
    // centroid of those positions. metricNodePositions itself stays
    // in screen space: metricCloudCenters' overlay anchors use it.
    function metricNodePositionsWorld(svg){return MetricGeometry.nodePositions(svg,true)}
    function metricSegs(np){
      var segs=[];
      np.keys.forEach(function(k){var pk=parentKeyFor(k),a=pk?np.pos[pk]:(k.indexOf("cat-")===0?np.center:null);if(a&&np.pos[k])segs.push({key:k,parent:pk||null,a:a,b:np.pos[k]})});
      return segs;
    }
    // Structural endpoint sharing between two metric segments: they
    // share an endpoint NODE when their child keys are equal, when
    // one's child key is the other's parent key, or when their
    // parent keys are equal (two null parents are both the world
    // center, so category segments share it). Replaces the old
    // 0.6px same-point epsilon tests in the world-frame metrics.
    function metricSegsShareNode(s,t){return s.key===t.key||s.key===t.parent||t.key===s.parent||s.parent===t.parent}
    // Actual rendered stroke width, in layer/user units, of the
    // spoke drawn for a segment's child key (Metrics rebuild,
    // Edit 2): the child node-group's .topic-stem — the path whose
    // geometry the renderer maintains as exactly this segment, and
    // the element the app itself flags as the spoke — falling back
    // to the .hanky-midline carried by the child's spoke underlay
    // item (or by the group itself when the underlay move did not
    // run). The width is the element's stroke-width VALUE in user
    // units (the stroke-width attribute first, then the computed
    // style) — never a screen-px measurement. 0 when no stroked
    // spoke element is found for the key.
    function metricSpokeWidth(svg,key){
      if(!svg||!key)return 0;
      var el=null,g=svg.querySelector('.node-group[data-layout-key="'+key+'"]');
      if(g)el=g.querySelector(":scope > .topic-stem");
      if(!el){
        var u=svg.querySelector('.spoke-underlay-item[data-spoke-for="'+key+'"]');
        var host=u||g;
        if(host)el=host.querySelector(".hanky-midline");
      }
      if(!el)return 0;
      var w=parseFloat(el.getAttribute("stroke-width"));
      if(!(w>0)){try{w=parseFloat(window.getComputedStyle(el).strokeWidth)}catch(e){w=0}}
      return w>0?w:0;
    }
    function metricPxText(v){return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,",")+" px²"}
    // Length of the part of segment a-b that lies inside rect r
    // (Liang–Barsky parametric clip), in screen pixels.
    function segLenInRect(ax,ay,bx,by,r){
      var dx=bx-ax,dy=by-ay,t0=0,t1=1,i,t;
      var p=[-dx,dx,-dy,dy],q=[ax-r.left,r.right-ax,ay-r.top,r.bottom-ay];
      for(i=0;i<4;i++){
        if(Math.abs(p[i])<1e-9){if(q[i]<0)return 0;continue}
        t=q[i]/p[i];
        if(p[i]<0){if(t>t1)return 0;if(t>t0)t0=t}else{if(t<t0)return 0;if(t<t1)t1=t}
      }
      return t1>t0?(t1-t0)*Math.hypot(dx,dy):0;
    }
    // Label crowding area (Metrics rebuild, Edit 2 — measured in
    // WORLD coordinates): total label-label overlap area (rect-rect
    // intersection of world boxes, pair terms under 0.5 world px²
    // discarded) plus label-spoke overlap (length of spoke inside a
    // label's world box, times that spoke's ACTUAL rendered stroke
    // width in world units; terms under 0.5 world px² discarded).
    // Labels are ALL rendered labels whose id is a visible node key
    // from the world walk — no screen-size admission gate. A label's
    // own spoke (segment child key === label id) is excluded.
    // Chunked over labels via requestIdleCallback.
    // RESTORED (2026-10-29): the labelcrowd registration is live again
    // per Jason's ruling reversing the dropdown part of #4.
    // Observation only — nothing decided on it.
    // F7 substrate: AS RENDERED — live label boxes in the drawing.
    LayoutMetrics.register('labelcrowd',{label:'Crowded labels area',tooltip:'Total area where labels overlap each other or sit on top of lines. Lower is easier to read.',compute:function(ctx,done,isCancelled){
      var svg=(ctx&&ctx.svg)||document.getElementById("mapSvg");
      if(!svg){done({value:0,text:"0 px²"});return}
      var np=metricNodePositionsWorld(svg),segs=metricSegs(np);
      segs.forEach(function(sg){sg.w=metricSpokeWidth(svg,sg.key)});
      var visibleKeys={};np.keys.forEach(function(k){visibleKeys[k]=true});
      var inv=metricWorldFrame(),labels=[],seenLabel={};
      Array.prototype.forEach.call(svg.querySelectorAll(".category-label,.map-label"),function(el){
        var id=el.getAttribute("data-id")||el.getAttribute("data-topic-id");
        if(!id||!visibleKeys[id]||seenLabel[id])return;
        var box=metricWorldBox(inv,el.getBoundingClientRect());if(!box)return;
        seenLabel[id]=true;labels.push({id:id,rect:box});
      });
      var sum=0,li=0;
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(labels.length,li+20),i,j;
        for(i=li;i<end;i++){
          var ra=labels[i].rect;
          for(j=i+1;j<labels.length;j++){
            var rb=labels[j].rect;
            var iw=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left);
            var ih=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);
            if(iw>0&&ih>0){var area=iw*ih;if(area>=0.5)sum+=area}
          }
          for(j=0;j<segs.length;j++){
            var sg=segs[j];if(sg.key===labels[i].id)continue;
            var term=segLenInRect(sg.a.x,sg.a.y,sg.b.x,sg.b.y,ra)*sg.w;
            if(term>=0.5)sum+=term;
          }
        }
        li=end;
        if(li<labels.length)defer();
        else done({value:sum,text:metricPxText(sum)});
      }
      defer();
    }});
    // Overlapping buttons (Metrics rebuild, Edit 1): count pairs of
    // direction controls whose VISIBLE tag boxes (.direction-tag-bg)
    // intersect with positive area in world coordinates — touching
    // edges do not count. A topic's own give and receive are designed
    // adjacency and never count: a pair qualifies only when the two
    // controls' topic ids (data-id) differ. Cross-branch pairs count
    // toward this global total. Chunked over rows via
    // requestIdleCallback.
    // F7 substrate: AS RENDERED — live button boxes in the drawing.
    LayoutMetrics.register('slideroverlap',{label:'Overlapping buttons',tooltip:'How many pairs of give/receive buttons are overlapping right now. Lower is better.',compute:function(ctx,done,isCancelled){
      var items=metricDirectionItems(),count=0,row=0;
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(items.length,row+40),i,j;
        for(i=row;i<end;i++)for(j=i+1;j<items.length;j++){
          if(items[i].id!==items[j].id&&metricBoxesOverlap(items[i].box,items[j].box))count++;
        }
        row=end;
        if(row<items.length)defer();
        else done({value:count,text:String(count).replace(/\B(?=(\d{3})+(?!\d))/g,",")+" pairs"});
      }
      defer();
    }});
    // Minimum arc separation (Metrics rebuild, Edit 3 — replaces the
    // old angle-based 'angulargap'; the registry id stays 'angulargap'
    // because persisted editor state stores it): the tightest spacing
    // between two neighbouring give/receive controls on the same ring,
    // measured along the ring in world (map) units. Population: the
    // direction controls from z90Selector(), each positioned at the
    // center of its visible tag box (.direction-tag-bg) in world
    // coordinates (metricDirectionItems). Each control's hub is its
    // topic's PARENT NODE — the subcategory node when the topic sits
    // under a subcategory, else the category node — resolved through
    // parentKeyFor (the same linkage metricSegs uses); if the parent
    // cannot be resolved, fall back to the topic's category node; if
    // that also fails, skip the control. Hub center = the hub node's
    // world icon center from the world node walk. Per hub: order the
    // controls by bearing atan2(dy,dx) around the hub center; for each
    // cyclically adjacent pair, s = r̄ · Δθ with Δθ the wrap-aware
    // bearing difference in (0, 2π) and r̄ the pair's mean distance
    // from the hub center; the hub's value is the minimum s. Hubs
    // with fewer than 2 controls contribute nothing. Shared by the
    // global compute() and the per-branch clouds() below; returns
    // {hubKey: minArcSep} for qualifying hubs only.
    function metricArcHubMins(items,np){
      var byHub={};
      items.forEach(function(it){
        if(!it.id)return;
        var hubKey=parentKeyFor(it.id);
        if(!hubKey||!np.pos[hubKey]){var br=topBranchKey(it.id);hubKey=br?"cat-"+slugify(br):null}
        if(!hubKey||!np.pos[hubKey])return;
        var cx=(it.box.left+it.box.right)/2,cy=(it.box.top+it.box.bottom)/2;
        (byHub[hubKey]=byHub[hubKey]||[]).push({x:cx,y:cy});
      });
      var mins={};
      Object.keys(byHub).forEach(function(hk){
        var pts=byHub[hk];if(pts.length<2)return;
        var hc=np.pos[hk];
        var arr=pts.map(function(p){var dx=p.x-hc.x,dy=p.y-hc.y;return{a:Math.atan2(dy,dx),r:Math.hypot(dx,dy)}});
        arr.sort(function(x,y){return x.a-y.a});
        var best=null;
        for(var i=0;i<arr.length;i++){
          var q=arr[(i+1)%arr.length];
          var dth=(i+1<arr.length)?q.a-arr[i].a:q.a+2*Math.PI-arr[i].a;
          var s=(arr[i].r+q.r)/2*dth;
          if(best===null||s<best)best=s;
        }
        if(best!==null)mins[hk]=best;
      });
      return mins;
    }
    // F7 substrate: AS RENDERED — live button positions in the drawing.
    LayoutMetrics.register('angulargap',{label:'Tightest control spacing',tooltip:'The tightest spacing between two neighbouring give/receive buttons on the same ring, measured along the ring in map units. Bigger means roomier.',compute:function(ctx,done,isCancelled){
      var svg=(ctx&&ctx.svg)||document.getElementById("mapSvg");
      var np=svg?metricNodePositionsWorld(svg):{pos:{},keys:[],center:null};
      var items=metricDirectionItems();
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var mins=metricArcHubMins(items,np),best=null;
        Object.keys(mins).forEach(function(hk){if(best===null||mins[hk]<best)best=mins[hk]});
        if(best===null)done({value:0,text:"–"});
        else{var v=Math.round(best*10)/10;done({value:v,text:v.toFixed(1)+" px"})}
      }
      defer();
    }});
    // Per-cloud (local) metric layer (Build 2026-10-19 — header
    // three-layer readout): each metric may define clouds(ctx, done,
    // isCancelled) returning {cloudName:{value,text}} plus agg
    // ('avg'|'sum'|'min') and aggFmt(v). A cloud is one top-level
    // branch's kink cloud. Locals count within-cloud evidence;
    // cross-cloud crossings/pairs split half/half between the two
    // clouds involved, so the aggregate of locals is its own number,
    // distinct from the true global score in the metric's compute().
    function cloudSegs(np){var segs=metricSegs(np);segs.forEach(function(s){s.branch=topBranchKey(s.key)});return segs}
    // Direction controls (the give/receive sliders) are NOT nested in a
    // .node-group — they render in a flat overlay layer — so resolve a
    // slider's cloud from its own data-id (a topic id) first, falling
    // back to an ancestor node-group key when there is one.
    function cloudOfEl(el){var key=el.getAttribute("data-id");if(key)return topBranchKey(key);var g=el.closest?el.closest(".node-group[data-layout-key]"):null;return g?topBranchKey(g.getAttribute("data-layout-key")):null}
    LayoutMetrics.defs.z90.clouds=function(ctx,done,isCancelled){
      var els=document.querySelectorAll(z90Selector()),inv=metricWorldFrame(),fitScale=metricFitScale(),byCloud={},i=0;
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(els.length,i+120);
        for(;i<end;i++){
          var box=metricTagWorldBox(inv,els[i]);if(!box)continue;
          var c=cloudOfEl(els[i]);
          if(!c)continue;
          (byCloud[c]=byCloud[c]||[]).push(44/(fitScale*Math.min(box.width,box.height)));
        }
        if(i<els.length)defer();
        else{var out={};Object.keys(byCloud).forEach(function(c){var v=z90Percentile(byCloud[c].slice());out[c]={value:v,text:v.toFixed(1)+"×"}});done(out)}
      }
      defer();
    };
    // RESTORED (2026-10-29): the per-cloud xAreaCross walk is live again
    // per Jason's ruling reversing the dropdown part of #4. (The cascade
    // report's secondary readout and deknotter.measureCloudArea in the
    // bundle remain retired — #4 stands there.)
    LayoutMetrics.defs.xareacross.clouds=function(ctx,done,isCancelled){
      var svg=(ctx&&ctx.svg)||document.getElementById("mapSvg");
      if(!svg){done({});return}
      var np=metricNodePositionsWorld(svg),segs=cloudSegs(np),tot={};
      branchNames().forEach(function(name){tot[name]=0});
      function add(c,v){if(c)tot[c]=(tot[c]||0)+v}
      var i=0;
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(segs.length,i+16);
        for(;i<end;i++){
          var s=segs[i];
          for(var j=i+1;j<segs.length;j++){
            var t=segs[j];
            if(metricSegsShareNode(s,t))continue;
            var mm=segMetrics(s.a.x,s.a.y,s.b.x,s.b.y,t.a.x,t.a.y,t.b.x,t.b.y);
            if(!mm||mm.t<=0||mm.t>=1||mm.u<=0||mm.u>=1)continue;
            var sal=Math.min(mm.t,1-mm.t)*mm.lenA*Math.min(mm.u,1-mm.u)*mm.lenB*mm.sinTheta;
            if(sal<1)continue;
            if(s.branch!=null&&s.branch===t.branch)continue;
            if(s.branch&&t.branch){add(s.branch,sal/2);add(t.branch,sal/2)}
            else if(s.branch||t.branch)add(s.branch||t.branch,sal);
          }
        }
        if(i<segs.length)defer();
        else{var out={};Object.keys(tot).forEach(function(c){out[c]={value:tot[c],text:metricPxText(tot[c])}});done(out)}
      }
      defer();
    };
    // RESTORED (2026-10-29): the per-cloud label-crowding walk is live
    // again per Jason's ruling reversing the dropdown part of #4.
    LayoutMetrics.defs.labelcrowd.clouds=function(ctx,done,isCancelled){
      var svg=(ctx&&ctx.svg)||document.getElementById("mapSvg");
      if(!svg){done({});return}
      var np=metricNodePositionsWorld(svg),segs=metricSegs(np);
      segs.forEach(function(sg){sg.w=metricSpokeWidth(svg,sg.key)});
      var visibleKeys={};np.keys.forEach(function(k){visibleKeys[k]=true});
      var inv=metricWorldFrame(),labels=[],seenLabel={};
      Array.prototype.forEach.call(svg.querySelectorAll(".category-label,.map-label"),function(el){
        var id=el.getAttribute("data-id")||el.getAttribute("data-topic-id");
        if(!id||!visibleKeys[id]||seenLabel[id])return;
        var box=metricWorldBox(inv,el.getBoundingClientRect());if(!box)return;
        seenLabel[id]=true;labels.push({id:id,cloud:topBranchKey(id),rect:box});
      });
      var tot={};
      branchNames().forEach(function(name){tot[name]=0});
      function add(c,v){if(c)tot[c]=(tot[c]||0)+v}
      var li=0;
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(labels.length,li+20),i,j;
        for(i=li;i<end;i++){
          var ra=labels[i].rect,ca=labels[i].cloud;
          for(j=i+1;j<labels.length;j++){
            var rb=labels[j].rect;
            var iw=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left);
            var ih=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);
            if(iw>0&&ih>0){var area=iw*ih;if(area>=0.5&&ca&&ca===labels[j].cloud)add(ca,area)}
          }
          for(j=0;j<segs.length;j++){
            var sg=segs[j];if(sg.key===labels[i].id)continue;
            var term=segLenInRect(sg.a.x,sg.a.y,sg.b.x,sg.b.y,ra)*sg.w;
            if(term>=0.5)add(ca,term);
          }
        }
        li=end;
        if(li<labels.length)defer();
        else{var out={};Object.keys(tot).forEach(function(c){out[c]={value:tot[c],text:metricPxText(tot[c])}});done(out)}
      }
      defer();
    };
    LayoutMetrics.defs.slideroverlap.clouds=function(ctx,done,isCancelled){
      var items=metricDirectionItems(),tot={},row=0;
      branchNames().forEach(function(name){tot[name]=0});
      items.forEach(function(p){if(p.branch&&tot[p.branch]===undefined)tot[p.branch]=0});
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var end=Math.min(items.length,row+40),i,j;
        for(i=row;i<end;i++)for(j=i+1;j<items.length;j++){
          if(items[i].branch&&items[i].branch===items[j].branch&&items[i].id!==items[j].id&&metricBoxesOverlap(items[i].box,items[j].box))tot[items[i].branch]++;
        }
        row=end;
        if(row<items.length)defer();
        else{var out={};Object.keys(tot).forEach(function(c){out[c]={value:tot[c],text:String(tot[c])}});done(out)}
      }
      defer();
    };
    // Per-branch minimum arc separation: the minimum over the
    // branch's hubs (a hub's branch = topBranchKey of the hub's
    // layout key). A branch with no qualifying hub emits nothing.
    LayoutMetrics.defs.angulargap.clouds=function(ctx,done,isCancelled){
      var svg=(ctx&&ctx.svg)||document.getElementById("mapSvg");
      var np=svg?metricNodePositionsWorld(svg):{pos:{},keys:[],center:null};
      var items=metricDirectionItems();
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){
        if(isCancelled())return;
        var mins=metricArcHubMins(items,np),out={};
        Object.keys(mins).forEach(function(hk){
          var br=topBranchKey(hk);if(!br)return;
          if(!out[br]||mins[hk]<out[br].value){var v=Math.round(mins[hk]*10)/10;out[br]={value:mins[hk],text:v.toFixed(1)+" px"}}
        });
        done(out);
      }
      defer();
    };
    // Crossing number (Fleet2 Item2): the SCC v2 hybrid energy E from
    // the Stage 1 anneal port — the crossing term (the chord of a
    // foreign midline inside a topic's Spoke Crossing Capsule, in
    // font-size units) plus the graze term (capsule-overlap area over
    // font squared, for pairs 1–2 font sizes apart) plus the
    // inner-intersection count. The geometry and predicates live in
    // the port; this registration only calls the port's read-only
    // readout (window.__sxCrossingMeasure), which builds the current
    // solved state with the port's own sxSccBuild + sxFullEval and
    // aggregates the port's pair maps per cloud: crossing to the
    // victim topic's cloud, graze split half/half, an inner crossing
    // attributed to both participants' clouds — so the per-cloud
    // values sum to the global E plus the inner count. Dropdown
    // placement: directly after z90 — overlap stays first (and the
    // default selection), z90 second, and this newly designated
    // judged metric ranks ahead of the remaining readability counts.
    function crossingText(v){return String(Math.round(v*100)/100)}
    function crossingReadout(){try{return typeof window.__sxCrossingMeasure==="function"?window.__sxCrossingMeasure():null}catch(e){return null}}
    // F7 substrate: AS LAST SOLVED — delivered-geometry registry via window.__sxCrossingMeasure; no drawing read, no repaint dependency.
    LayoutMetrics.register('crossingnumber',{label:'Crossing number',tooltip:'The hybrid crossing number the map is judged by: foreign lines cutting through each topic\u2019s spoke capsule, plus near-miss graze overlap, plus inner line intersections — all on the SCC v2 geometry, in font-size units. Lower is better.',compute:function(ctx,done,isCancelled){
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){if(isCancelled())return;var m=crossingReadout();if(!m){done({value:0,text:"–"});return}done({value:m.E,text:crossingText(m.E)})}
      defer();
    }});
    LayoutMetrics.defs.crossingnumber.clouds=function(ctx,done,isCancelled){
      function defer(){if(window.requestIdleCallback)window.requestIdleCallback(chunk,{timeout:250});else setTimeout(chunk,0)}
      function chunk(){if(isCancelled())return;var m=crossingReadout();if(!m){done({});return}var out={};Object.keys(m.clouds).forEach(function(c){out[c]={value:m.clouds[c],text:crossingText(m.clouds[c])}});done(out)}
      defer();
    };
    // World-frame helpers (Metrics rebuild, Edit 1): the rebuilt
    // metrics measure in map (world) coordinates, never raw screen
    // pixels, so a reading cannot depend on the camera at measure
    // time. metricWorldFrame() captures the inverse of #mapLayer's
    // screen CTM ONCE per measurement run (guarded null like
    // metricScreenToWorld below); metricWorldBox() converts a
    // getBoundingClientRect into a world axis-aligned box by pushing
    // its (left,top) and (right,bottom) corners through that inverse
    // with DOMPoint and taking min/max per axis; metricWorldPoint()
    // is the rect-center point version.
    // F4 (layout-editor refactor): ONE geometry helper set,
    // MetricGeometry, is now the shared home of the world-frame
    // helpers. inverseFrame() is the single #mapLayer screen-transform
    // accessor: the inverse of the layer's screen CTM, or null when
    // the layer is absent, has no CTM, or reading it throws — the
    // guarded-null contract metricWorldFrame and metricScreenToWorld
    // each had. screenToWorld() converts one screen point through
    // that same accessor (its former body fetched and inverted the
    // transform itself; the values in every case, nulls included, are
    // the ones it returned). worldBox / worldPoint / tagWorldBox are
    // the rect converters, directionItems() is the direction-control
    // walk, and nodePositions() is the ONE node-position walk,
    // parameterized by coordinate space: world=false reproduces
    // metricNodePositions (screen space, the icon-size gate, the CTM
    // center with the category-centroid fallback); world=true
    // reproduces metricNodePositionsWorld (no size gate, positions
    // converted through the inverse frame captured once per call with
    // a raw-center fallback, and the layer center {x:900, y:620}
    // itself when the frame exists). No coordinate math changed —
    // only its organization. The pre-refactor global names stay
    // callable as the wrappers beneath the module.
    var MetricGeometry={
      inverseFrame:function(){var layer=document.getElementById("mapLayer");try{var m=layer?layer.getScreenCTM():null;if(m)return m.inverse()}catch(e){}return null},
      screenToWorld:function(x,y){var inv=MetricGeometry.inverseFrame();if(!inv)return null;try{return new DOMPoint(x,y).matrixTransform(inv)}catch(e){}return null},
      worldBox:function(inv,rect){if(!inv||!rect)return null;try{var p1=new DOMPoint(rect.left,rect.top).matrixTransform(inv),p2=new DOMPoint(rect.right,rect.bottom).matrixTransform(inv);var left=Math.min(p1.x,p2.x),right=Math.max(p1.x,p2.x),top=Math.min(p1.y,p2.y),bottom=Math.max(p1.y,p2.y);return{left:left,top:top,right:right,bottom:bottom,width:right-left,height:bottom-top}}catch(e){return null}},
      worldPoint:function(inv,rect){if(!inv||!rect)return null;try{return new DOMPoint(rect.left+rect.width/2,rect.top+rect.height/2).matrixTransform(inv)}catch(e){return null}},
      tagWorldBox:function(inv,el){var tag=el&&el.querySelector?el.querySelector(".direction-tag-bg"):null;if(!tag)return null;var box=MetricGeometry.worldBox(inv,tag.getBoundingClientRect());if(!box||!(box.width>0)||!(box.height>0))return null;return box},
      directionItems:function(){var els=document.querySelectorAll(z90Selector()),inv=MetricGeometry.inverseFrame(),items=[],i;for(i=0;i<els.length;i++){var box=MetricGeometry.tagWorldBox(inv,els[i]);if(!box)continue;items.push({box:box,id:els[i].getAttribute("data-id"),branch:cloudOfEl(els[i])})}return items},
      nodePositions:function(svg,world){
        var inv=world?MetricGeometry.inverseFrame():null,pos={},keys=[];
        Array.prototype.forEach.call(svg.querySelectorAll(".node-group[data-layout-key]:not(.is-hidden)"),function(g){
          var key=g.getAttribute("data-layout-key");if(!key||pos[key])return;
          var icon=g.querySelector(":scope > .branch-icon, :scope > .topic-icon");if(!icon)return;
          var r=icon.getBoundingClientRect();
          if(world){
            var p=inv?MetricGeometry.worldPoint(inv,r):null;
            if(p)pos[key]={x:p.x,y:p.y};
            else pos[key]={x:r.left+r.width/2,y:r.top+r.height/2};
          }else{
            if(!r.width&&!r.height)return;
            pos[key]={x:r.left+r.width/2,y:r.top+r.height/2};
          }
          keys.push(key);
        });
        var center=null;
        if(world){center=inv?{x:900,y:620}:null}
        else{var layer=document.getElementById("mapLayer");try{var m=(layer||svg).getScreenCTM();if(m){var pt=new DOMPoint(900,620).matrixTransform(m);center={x:pt.x,y:pt.y}}}catch(e){}}
        if(!center){var sx=0,sy=0,n=0;keys.forEach(function(k){if(k.indexOf("cat-")===0){sx+=pos[k].x;sy+=pos[k].y;n++}});if(n)center={x:sx/n,y:sy/n}}
        return{pos:pos,keys:keys,center:center};
      }
    };
    function metricWorldFrame(){return MetricGeometry.inverseFrame()}
    function metricWorldBox(inv,rect){return MetricGeometry.worldBox(inv,rect)}
    function metricWorldPoint(inv,rect){return MetricGeometry.worldPoint(inv,rect)}
    // Visible tap surface of a direction control: the world box of
    // its .direction-tag-bg child, or null when the control has no
    // tag element or the box has zero width or height.
    function metricTagWorldBox(inv,el){return MetricGeometry.tagWorldBox(inv,el)}
    // One measurement run over the direction controls (z90Selector):
    // each surviving control's tag world box, its topic id (the
    // data-id attribute cloudOfEl reads) and its branch (cloudOfEl).
    // The world frame is captured once for the whole run.
    function metricDirectionItems(){return MetricGeometry.directionItems()}
    // Positive-area intersection of two world boxes: touching edges
    // (zero overlap width or height) do not count.
    function metricBoxesOverlap(a,b){var iw=Math.min(a.right,b.right)-Math.max(a.left,b.left),ih=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);return iw>0&&ih>0}
    // fitScale: screen px per world px at the camera's FIT, not the
    // current camera. Pure read of Ih()'s fit and lh()'s screen
    // factor. Does not call Ih() — that writes the camera and arms a
    // refit. g uses Ih's inputs: #mapLayer bboxes (In), floored at the
    // center disc (900,620, radius 1200 — pr.centerRadius /
    // ea.outerRadius, assigned once), +20 margin, padding 90 at
    // innerWidth<=620 else 44, the 3200x3200 frame (nh), cap 2.18 at
    // innerWidth<=620 else 2.3, and #mapSvg clientWidth/clientHeight
    // (Cn) with innerWidth/innerHeight fallback. Floor is the
    // camera's 1e-9, not 0.05 (census ruled to the true fit,
    // 2026-11-04). The 620 is the bundle's literal, not
    // __sxSmallScreenMax. Screen px per world px then multiplies by
    // lh()'s factor: min(cardWidth/3200, cardHeight/3200) on
    // #mapScene's parent, the map card.
    function metricFitScale(){
      var svg=document.getElementById("mapSvg");
      var layer=document.getElementById("mapLayer");
      var scene=document.getElementById("mapScene");
      var card=scene?scene.parentElement:null;
      var CX=900,CY=620,CR=1200,VBW=3200,VBH=3200;
      var narrow=window.innerWidth<=620;
      var minX=CX-CR,minY=CY-CR,maxX=CX+CR,maxY=CY+CR;
      function acc(el){if(!el)return;try{var b=el.getBBox();if(!Number.isFinite(b.x)||!Number.isFinite(b.y)||!(b.width>0)||!(b.height>0))return;if(b.x<minX)minX=b.x;if(b.y<minY)minY=b.y;if(b.x+b.width>maxX)maxX=b.x+b.width;if(b.y+b.height>maxY)maxY=b.y+b.height}catch(e){}}
      if(layer){Array.prototype.forEach.call(layer.querySelectorAll(".node-group:not(.is-hidden)"),acc);acc(layer.querySelector(".center-glance-rings"))}
      var d=Math.max(CR,CX-minX,maxX-CX)+20;
      var u=Math.max(CR,CY-minY,maxY-CY)+20;
      var pad=narrow?90:44;
      var sw=svg&&svg.clientWidth?svg.clientWidth:window.innerWidth;
      var sh=svg&&svg.clientHeight?svg.clientHeight:window.innerHeight;
      var asp=sw>0&&sh>0?sw/sh:1;
      var hw=VBW/2*Math.max(1,asp),hh=VBH/2*Math.max(1,1/asp);
      var g=Math.min((hw-pad)/d,(hh-pad)/u);
      var cam=Math.max(1e-9,Math.min(narrow?2.18:2.3,g));
      var rect=card?card.getBoundingClientRect():null;
      var cw=rect&&rect.width?rect.width:0,chh=rect&&rect.height?rect.height:0;
      var vb=cw>0&&chh>0?Math.min(cw/VBW,chh/VBH):0;
      return cam*vb;
    }
    // z90 population and reading (Metrics rebuild, Edit 1): the
    // give/receive direction controls; per control the need is
    // 44 / (fitScale * min(tag world width, tag world height)) with
    // no clamping, and the reading is the nearest-rank 90th
    // percentile of the needs (1 when there are no needs).
    function z90Selector(){return "#mapSvg .direction-control[data-direction=\"give\"],#mapSvg .direction-control[data-direction=\"receive\"]"}
    function z90Percentile(needs){if(!needs.length)return 1;needs.sort(function(a,b){return a-b});return needs[Math.min(needs.length-1,Math.ceil(needs.length*0.9)-1)]}
    // Metric engine (Batch B, Build 2026-10-19_2353): metrics are OFF by
    // default. The live path is per-branch ("locals") only:
    // scheduleMetric() debounces 500ms after any settings change and
    // runs ONLY the selected metric's clouds() walk, feeding
    // renderMetricOverlay — it never runs the whole-map compute. The
    // whole-map ("global") total runs ONLY from the Calculate now
    // button (calculateGlobal) and is shown at the center node; any
    // later settings change dims it as stale until recalculated.
    var metricOn=false,metricId='off',metricTimer=null,metricRun=0,metricGlobalRun=0;
    function selectedMetricDef(){return metricId==='off'?null:LayoutMetrics.get(metricId)}
    function scheduleMetric(){if(!metricOn||metricId==='off')return;markMetricGlobalStale();if(metricTimer)clearTimeout(metricTimer);metricTimer=setTimeout(measureLocals,500)}
    function measureLocals(){var def=selectedMetricDef();if(!def){clearMetricOverlay();return}var run=++metricRun,cancelled=function(){return run!==metricRun||!metricOn||metricId==='off'};if(typeof def.clouds==="function"){try{def.clouds({svg:document.getElementById("mapSvg")},function(clouds){if(cancelled())return;renderMetricOverlay(clouds||{})},cancelled)}catch(e){clearMetricOverlay()}}else clearMetricOverlay()}
    // Calculate-now busy state (Metrics rebuild, Edit 3): while a
    // global computation is in flight the button shows a spinner
    // (.is-busy CSS), aria-busy="true", and an elapsed-time readout
    // ("Calculating… 0.4s") refreshed every 100ms. Started in
    // calculateGlobal() before def.compute runs; cleared when that
    // run's done callback delivers the result, and on every
    // invalidation path that bumps metricGlobalRun (metric switched,
    // metrics turned off, a newer Calculate now superseding) — those
    // callers invoke stopMetricBusy() themselves.
    var metricBusyTimer=null,metricBusyLabel=null,metricBusyStart=0;
    function startMetricBusy(){
      var btn=document.getElementById("layoutMetricMeasure");if(!btn)return;
      if(metricBusyTimer===null)metricBusyLabel=btn.textContent;
      metricBusyStart=Date.now();
      btn.classList.add("is-busy");btn.setAttribute("aria-busy","true");
      function tick(){btn.textContent="Calculating… "+((Date.now()-metricBusyStart)/1000).toFixed(1)+"s"}
      tick();
      if(metricBusyTimer!==null)clearInterval(metricBusyTimer);
      metricBusyTimer=setInterval(tick,100);
    }
    function stopMetricBusy(){
      if(metricBusyTimer!==null){clearInterval(metricBusyTimer);metricBusyTimer=null}
      var btn=document.getElementById("layoutMetricMeasure");if(!btn)return;
      btn.classList.remove("is-busy");btn.removeAttribute("aria-busy");
      if(metricBusyLabel!==null){btn.textContent=metricBusyLabel;metricBusyLabel=null}
    }
    function calculateGlobal(){var def=selectedMetricDef();if(!def||!metricOn)return;var run=++metricGlobalRun,cancelled=function(){return run!==metricGlobalRun||!metricOn||metricId==='off'};startMetricBusy();try{def.compute({svg:document.getElementById("mapSvg")},function(res){if(cancelled())return;stopMetricBusy();showMetricGlobal(res&&res.text!=null?res.text:"–")},cancelled)}catch(e){stopMetricBusy()}}
    var metricSelect=document.getElementById("layoutMetricSelect"),metricButton=document.getElementById("layoutMetricMeasure");
    if(metricSelect)metricSelect.addEventListener("change",function(){metricId=metricSelect.value;metricOn=metricId!=='off';if(metricButton)metricButton.disabled=!metricOn;stopMetricBusy();clearMetricGlobal();if(metricOn){scheduleMetric();if(metricOverlayOn)calculateGlobal()}else{metricRun++;metricGlobalRun++;if(metricTimer)clearTimeout(metricTimer);clearMetricOverlay()}scheduleLiveSync()});
    if(metricButton)metricButton.addEventListener("click",function(){if(!metricOn)return;calculateGlobal()});
    // "Show numbers on map" (Build 2026-10-19_1706): a display-only
    // overlay layer inside #mapScene draws each cloud's current metric
    // value as a yellow number centered on the cloud — the annotated-PNG
    // look, live. Cloud centers use the same attribution as the metric
    // walks: direction controls resolved through cloudOfEl (their own
    // data-id), with the cloud's visible node icons (topBranchKey over
    // metricNodePositions) as fallback for clouds with no sliders on
    // screen. Values refresh from measureLocals (which scheduleMetric
    // already drives after every layout change). Anchors are stored in
    // map-layer world coordinates, so pan/zoom — viewBox and transform
    // mutations — repositions the numbers through the layer CTM without
    // re-measuring. The layer is pointer-events:none, so map tap, pan
    // and pinch-zoom are untouched.
    // Q11 AS AMENDED (Layout groups Phase 3): the overlay's shipped
    // default is OFF — the checkbox in the panel markup starts
    // unchecked to match — superseding the printed Q11 (a) and the
    // 2026-10-19 default-ON addendum. Reset to defaults also returns
    // it to OFF (see the layoutReset handler).
    // F3 (layout-editor refactor): the on-map numbers lifecycle now
    // lives in ONE module, MetricNumbersView. It holds the view state
    // — overlay layer element, per-cloud label/anchor records, the
    // center-node total element with its text and stale flag, and the
    // per-cloud cache — and every show / hide / stale / clear /
    // visibility change flows through its single render path (render,
    // renderCache, clear, showGlobal, markStale, clearGlobal and
    // syncGlobal). The scalar editor state it renders from stays in
    // the existing editor variables (metricOn, metricId, metricOverlayOn
    // — still written directly by the picker, the toggle, the Fastest
    // and Reset paths and the cross-window sync, exactly as before);
    // the accessors defined under the module read and write those same
    // variables, so each value still exists exactly once. The 500 ms
    // debounce (scheduleMetric), the metricRun / metricGlobalRun run
    // guards and the settle path's calls into scheduleMetric are
    // unchanged; they reach the view through the wrappers below.
    var metricOverlayOn=false;
    var MetricNumbersView={
      layerEl:null,labels:{},anchors:{},raf:0,
      globalEl:null,totalText:null,stale:false,
    // Last computed per-cloud values (Group 4, G4-1/G4-4): kept so
    // re-enabling the overlay — locally, from another window's sync,
    // or in a late-joining window — repaints instantly from cache and
    // refreshes in the background, instead of waiting on a full
    // re-measure. Keyed by metric id so a stale metric's numbers are
    // never shown for a different one.
      cacheClouds:null,cacheId:null,
      layer:function(){
        var scene=document.getElementById("mapScene");if(!scene)return null;
        if(!MetricNumbersView.layerEl||!MetricNumbersView.layerEl.isConnected){MetricNumbersView.layerEl=document.createElement("div");MetricNumbersView.layerEl.className="metric-map-overlay";MetricNumbersView.layerEl.id="metricMapOverlay";MetricNumbersView.layerEl.setAttribute("aria-hidden","true");scene.appendChild(MetricNumbersView.layerEl);MetricNumbersView.labels={};MetricNumbersView.anchors={}}
        return MetricNumbersView.layerEl;
      },
      cloudCenters:function(){
        var sums={},counts={};
        function add(c,x,y){if(!c)return;(sums[c]=sums[c]||{x:0,y:0});sums[c].x+=x;sums[c].y+=y;counts[c]=(counts[c]||0)+1}
        var els=document.querySelectorAll(z90Selector()),i;
        for(i=0;i<els.length;i++){var r=els[i].getBoundingClientRect();if(!(r.width>0||r.height>0))continue;add(cloudOfEl(els[i]),r.left+r.width/2,r.top+r.height/2)}
        var svg=document.getElementById("mapSvg");
        if(svg){var np=metricNodePositions(svg);np.keys.forEach(function(k){var c=topBranchKey(k);if(c&&!sums[c])add(c,np.pos[k].x,np.pos[k].y)})}
        var out={};Object.keys(sums).forEach(function(c){out[c]={x:sums[c].x/counts[c],y:sums[c].y/counts[c]}});
        return out;
      },
      position:function(){
        if(!MetricNumbersView.layerEl||!MetricNumbersView.layerEl.isConnected)return;
        var layer=document.getElementById("mapLayer");if(!layer)return;
        var m=null;try{m=layer.getScreenCTM()}catch(e){}
        if(!m)return;
        var orect=MetricNumbersView.layerEl.getBoundingClientRect();
        Object.keys(MetricNumbersView.labels).forEach(function(c){
          var a=MetricNumbersView.anchors[c],el=MetricNumbersView.labels[c];if(!a||!el)return;
          var p;try{p=new DOMPoint(a.x,a.y).matrixTransform(m)}catch(e){return}
          el.style.left=(p.x-orect.left)+"px";el.style.top=(p.y-orect.top)+"px";
        });
        if(MetricNumbersView.globalEl&&MetricNumbersView.globalEl.isConnected){try{var gp=new DOMPoint(900,620).matrixTransform(m);MetricNumbersView.globalEl.style.left=(gp.x-orect.left)+"px";MetricNumbersView.globalEl.style.top=(gp.y-orect.top)+"px"}catch(e){}}
      },
      schedulePosition:function(){
        if(MetricNumbersView.raf)return;
        MetricNumbersView.raf=requestAnimationFrame(function(){MetricNumbersView.raf=0;MetricNumbersView.position()});
      },
      clearLabels:function(){
        Object.keys(MetricNumbersView.labels).forEach(function(c){if(MetricNumbersView.labels[c])MetricNumbersView.labels[c].remove()});
        MetricNumbersView.labels={};MetricNumbersView.anchors={};
      },
      render:function(clouds){
        if(clouds&&Object.keys(clouds).length){MetricNumbersView.cacheClouds=clouds;MetricNumbersView.cacheId=metricId}
        var layer=MetricNumbersView.layer();if(!layer)return;
        if(!metricOverlayOn){MetricNumbersView.clearLabels();MetricNumbersView.syncGlobal();return}
        var centers=MetricNumbersView.cloudCenters(),seen={};
        Object.keys(clouds||{}).forEach(function(c){
          var ctr=centers[c];if(!ctr)return;
          var w=MetricGeometry.screenToWorld(ctr.x,ctr.y);if(!w)return;
          seen[c]=true;MetricNumbersView.anchors[c]={x:w.x,y:w.y};
          var el=MetricNumbersView.labels[c];
          if(!el||!el.isConnected){el=document.createElement("span");el.className="metric-map-num";MetricNumbersView.labels[c]=el;layer.appendChild(el)}
          el.textContent=clouds[c].text;
        });
        Object.keys(MetricNumbersView.labels).forEach(function(c){if(!seen[c]){MetricNumbersView.labels[c].remove();delete MetricNumbersView.labels[c];delete MetricNumbersView.anchors[c]}});
        MetricNumbersView.syncGlobal();
        MetricNumbersView.position();
      },
      renderCache:function(){
        if(MetricNumbersView.cacheClouds&&MetricNumbersView.cacheId===metricId){MetricNumbersView.render(MetricNumbersView.cacheClouds)}
        else if(metricOn&&metricId!=="off"){scheduleMetric()}
        else{MetricNumbersView.render({})}
      },
      clear:function(){
        MetricNumbersView.clearLabels();
        if(MetricNumbersView.globalEl)MetricNumbersView.globalEl.style.display="none";
      },
      showGlobal:function(text){
        var layer=MetricNumbersView.layer();if(!layer)return;
        if(!MetricNumbersView.globalEl||!MetricNumbersView.globalEl.isConnected){MetricNumbersView.globalEl=document.createElement("span");MetricNumbersView.globalEl.className="metric-map-global";MetricNumbersView.globalEl.id="metricMapGlobal";layer.appendChild(MetricNumbersView.globalEl)}
        MetricNumbersView.totalText=text;
        MetricNumbersView.globalEl.textContent=text;
        MetricNumbersView.stale=false;
        MetricNumbersView.globalEl.classList.remove("is-stale");
        MetricNumbersView.syncGlobal();
        MetricNumbersView.position();
      },
      markStale:function(){
        if(MetricNumbersView.globalEl&&MetricNumbersView.globalEl.isConnected&&MetricNumbersView.globalEl.textContent){MetricNumbersView.globalEl.classList.add("is-stale");MetricNumbersView.stale=true}
      },
      clearGlobal:function(){
        if(MetricNumbersView.globalEl&&MetricNumbersView.globalEl.isConnected)MetricNumbersView.globalEl.remove();
        MetricNumbersView.globalEl=null;MetricNumbersView.totalText=null;MetricNumbersView.stale=false;
      },
      syncGlobal:function(){
        if(!MetricNumbersView.globalEl)return;
        MetricNumbersView.globalEl.style.display=(metricOverlayOn&&MetricNumbersView.totalText)?"":"none";
      }
    };
    Object.defineProperties(MetricNumbersView,{
      on:{get:function(){return metricOverlayOn},set:function(v){metricOverlayOn=!!v}},
      metricId:{get:function(){return metricId}},
      metricOn:{get:function(){return metricOn}},
      clouds:{get:function(){return MetricNumbersView.cacheClouds}}
    });
    // Thin wrappers: every pre-refactor global name stays callable for
    // its existing call sites (the metric engine, the picker and toggle
    // handlers, the cross-window sync, the Fastest and Reset paths);
    // each one delegates to the module's single render path above.
    function renderMetricOverlayCache(){MetricNumbersView.renderCache()}
    function metricScreenToWorld(x,y){return MetricGeometry.screenToWorld(x,y)}
    function positionMetricOverlay(){MetricNumbersView.position()}
    function scheduleOverlayPosition(){MetricNumbersView.schedulePosition()}
    function renderMetricOverlay(clouds){MetricNumbersView.render(clouds)}
    function clearMetricOverlay(){MetricNumbersView.clear()}
    // Whole-map total at the center node (Batch B): a cyan label in the
    // same overlay layer, anchored at the map's center (world 900,620 —
    // the same center metricNodePositions uses) and positioned by
    // positionMetricOverlay, so it tracks pan/zoom like the per-branch
    // numbers and is pointer-events:none with the layer. It appears
    // after Calculate now runs def.compute, or after the measurement
    // selection changes while the overlay is on; any later settings
    // change adds .is-stale (dimmed to 0.45) until the next
    // calculation. Turning metrics off removes it entirely, so a total
    // from another metric never shows as current.
    // OWNERSHIP (map-render refactor, finding 15): this shell inline
    // script is the sole owner of the center-node global total
    // (#metricMapGlobal). The app bundle
    // deliberately does not compute or update it — its render entry
    // (Mr) carries a matching note. The split is documented rather
    // than moved because the display is driven by shell-side overlay
    // state (metricOverlayLabels, metricScreenToWorld, DOMPoint
    // transforms) that the bundle does not own.
    function showMetricGlobal(text){MetricNumbersView.showGlobal(text)}
    function markMetricGlobalStale(){MetricNumbersView.markStale()}
    function clearMetricGlobal(){MetricNumbersView.clearGlobal()}
    var metricOverlayToggle=document.getElementById("layoutMetricOverlay");
    if(metricOverlayToggle)metricOverlayToggle.addEventListener("change",function(){metricOverlayOn=!!metricOverlayToggle.checked;if(metricOverlayOn){renderMetricOverlayCache();if(metricOn&&metricId!=="off")scheduleMetric()}else clearMetricOverlay();scheduleLiveSync()});
    try{var metricOverlayObserver=new MutationObserver(function(){if(metricOverlayOn)scheduleOverlayPosition()});var moSvg=document.getElementById("mapSvg");if(moSvg)metricOverlayObserver.observe(moSvg,{attributes:true,attributeFilter:["viewBox"]});["viewport","mapLayer"].forEach(function(id){var n=document.getElementById(id);if(n)metricOverlayObserver.observe(n,{attributes:true,attributeFilter:["transform"]})})}catch(e){}
    window.addEventListener("resize",function(){if(metricOverlayOn)scheduleOverlayPosition()});
    // Scene-resize tracking (repair, 2026-11-01): the attribute
    // observer above and the window-resize listener cover pan/zoom
    // and browser-window resizes, but the map scene also changes
    // size with NO attribute and NO window resize — the layout
    // panel docking, minimising or going fullscreen, the match
    // stage opening, route changes. The numbers' pixel positions
    // are projected from their stored world anchors through the
    // scene's current fit, so a scene resize left them standing
    // where the clouds used to be (the offset in the report: the
    // panel was minimised between the two screenshots and the
    // numbers never followed the map into its wider frame). A
    // ResizeObserver on the scene re-projects both number layers
    // — the per-cloud metric numbers and the Anneal live number —
    // from their world anchors through the current transform
    // whenever the scene's box changes, so the numbers shift with
    // the map under every mechanism that moves it.
    try{
      if(typeof ResizeObserver==="function"){
        var sxSceneEl=document.getElementById("mapScene");
        if(sxSceneEl){var sxSceneResizeObserver=new ResizeObserver(function(){if(metricOverlayOn)scheduleOverlayPosition();if(AnnealCloudOverlay.branch)AnnealCloudOverlay.schedulePosition()});sxSceneResizeObserver.observe(sxSceneEl)}
      }
    }catch(e){}
    // Metric option tooltips (Build 2026-10-19_1152): one floating tip
    // explains the metric under the pointer — definition first, then
    // intended use (the registry's tooltip strings). The tip is
    // pointer-events:none, hugs the cursor with a 14px offset, flips at
    // viewport edges, follows mousemove, and while an option of the open
    // dropdown is hovered it is pushed clear of the menu zone (the
    // select's rect expanded by the option list's extent) so every
    // option stays visible and clickable/tappable. On touch devices it
    // appears after a 500ms long-press on the select and hides on the
    // next tap elsewhere or when an option is selected.
    var metricTip=document.createElement("div");
    metricTip.className="layout-metric-tip";metricTip.hidden=true;metricTip.setAttribute("role","tooltip");
    document.body.appendChild(metricTip);
    var metricTipFor=null,metricTipX=0,metricTipY=0,metricTipOnOption=false,metricPressTimer=null;
    function metricTipDef(id){return id&&id!=="off"?LayoutMetrics.get(id):null}
    function metricMenuZone(){
      var sr=metricSelect.getBoundingClientRect(),w=sr.width;
      try{var mc=document.createElement("canvas").getContext("2d");mc.font=getComputedStyle(metricSelect).font;Array.prototype.forEach.call(metricSelect.options,function(o){w=Math.max(w,mc.measureText(o.textContent).width+56)})}catch(e){}
      var rows=metricSelect.options.length,rh=34;
      return{left:sr.left-6,right:sr.left+w+6,top:sr.top-rows*rh-6,bottom:sr.bottom+rows*rh+6};
    }
    function placeMetricTip(){
      if(metricTip.hidden||!metricSelect)return;
      var pad=8,tw=metricTip.offsetWidth,th=metricTip.offsetHeight;
      var x=metricTipX+14,y=metricTipY+14;
      if(metricTipOnOption){
        var z=metricMenuZone();
        if(x<z.right&&x+tw>z.left&&y<z.bottom&&y+th>z.top){
          if(z.right+10+tw<=window.innerWidth-pad)x=z.right+10;
          else if(z.left-10-tw>=pad)x=z.left-10-tw;
        }
      }
      var sr2=metricSelect.getBoundingClientRect();
      if(x<sr2.right&&x+tw>sr2.left&&y<sr2.bottom&&y+th>sr2.top){
        if(sr2.bottom+6+th<=window.innerHeight-pad)y=sr2.bottom+6;
        else if(sr2.top-6-th>=pad)y=sr2.top-6-th;
      }
      if(x+tw>window.innerWidth-pad)x=metricTipX-tw-14;
      if(y+th>window.innerHeight-pad)y=metricTipY-th-14;
      x=Math.max(pad,Math.min(x,Math.max(pad,window.innerWidth-tw-pad)));
      y=Math.max(pad,Math.min(y,Math.max(pad,window.innerHeight-th-pad)));
      metricTip.style.left=x+"px";metricTip.style.top=y+"px";
    }
    function showMetricTip(id,x,y,onOption){
      var def=metricTipDef(id);if(!def||!def.tooltip){hideMetricTip();return}
      metricTipFor=id;metricTipX=x;metricTipY=y;metricTipOnOption=!!onOption;
      metricTip.textContent=def.tooltip.replace(" Intended use: ","\nIntended use: ");
      metricTip.hidden=false;placeMetricTip();
    }
    function hideMetricTip(){metricTip.hidden=true;metricTipFor=null;metricTipOnOption=false;if(metricPressTimer){clearTimeout(metricPressTimer);metricPressTimer=null}}
    if(metricSelect){
      metricSelect.addEventListener("mouseover",function(e){var t=e.target,v=(t&&t.tagName==="OPTION")?t.value:metricSelect.value;showMetricTip(v,e.clientX,e.clientY,t&&t.tagName==="OPTION")});
      metricSelect.addEventListener("mousemove",function(e){if(metricTip.hidden)return;metricTipX=e.clientX;metricTipY=e.clientY;var t=e.target;if(t&&t.tagName==="OPTION"){metricTipOnOption=true;if(t.value!==metricTipFor){showMetricTip(t.value,e.clientX,e.clientY,true);return}}placeMetricTip()});
      metricSelect.addEventListener("mouseleave",hideMetricTip);
      metricSelect.addEventListener("change",hideMetricTip);
      metricSelect.addEventListener("blur",hideMetricTip);
      metricSelect.addEventListener("touchstart",function(e){if(metricPressTimer)clearTimeout(metricPressTimer);var tt=e.touches&&e.touches[0];if(!tt)return;var x=tt.clientX,y=tt.clientY;metricPressTimer=setTimeout(function(){metricPressTimer=null;showMetricTip(metricSelect.value,x,y,false)},500)},{passive:true});
      metricSelect.addEventListener("touchend",function(){if(metricPressTimer){clearTimeout(metricPressTimer);metricPressTimer=null}});
      metricSelect.addEventListener("touchmove",function(){if(metricPressTimer){clearTimeout(metricPressTimer);metricPressTimer=null}},{passive:true});
      document.addEventListener("touchstart",function(e){if(!metricTip.hidden&&e.target!==metricSelect)hideMetricTip()},{passive:true});
      document.addEventListener("pointerdown",function(e){if(!metricTip.hidden&&e.target!==metricSelect&&!(e.target&&e.target.tagName==="OPTION"))hideMetricTip()});
    }
    var scoresToggle=document.getElementById("layoutScoresEnabled");
    if(scoresToggle)scoresToggle.addEventListener("change",function(){scoresOn=!!scoresToggle.checked;if(scoresOn){scheduleScores()}else{var cEl=document.getElementById("layoutScoreC"),xEl=document.getElementById("layoutScoreX"),covEl=document.getElementById("layoutScoreCov"),strip=document.getElementById("layoutScores");if(cEl)cEl.textContent="–";if(xEl)xEl.textContent="–";if(covEl)covEl.textContent="–";if(strip)strip.classList.remove("is-clean")}});
    // Context-aware open + live layout scores (Build 2026-10-18_1314).
    // The editor follows the map's current selection: the focused node
    // (is-preview from the topic finder, else the deepest node on the
    // selected-spoke chain) is resolved through the taxonomy to its
    // category / subcategory / kink, and the matching Advanced selects,
    // sliders, and spoke-angle row are pre-set whenever the editor opens
    // or the selection changes while it is open (map spoke taps call
    // selectNode via __SEXCAPADES_LAYOUT_UI).
    function slugify(name){return String(name||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")}
    var taxonomyCache=null;
    function taxonomy(){if(taxonomyCache)return taxonomyCache;try{if(window.TaxonomyLoader&&window.TaxonomyLoader.loadTaxonomy)taxonomyCache=window.TaxonomyLoader.loadTaxonomy()}catch (e) { __sxErrLog("taxonomy-loader", e); }return taxonomyCache}
    function topicEntry(id){var tax=taxonomy();if(!tax||!tax.topicById)return null;try{return tax.topicById.get?tax.topicById.get(id):tax.topicById[id]}catch(e){return null}}
    function branchNames(){return (window.__SEXCAPADES_LAYOUT_API&&window.__SEXCAPADES_LAYOUT_API.branches)?window.__SEXCAPADES_LAYOUT_API.branches():[]}
    function selectedNodeKey(svg){
      var prev=svg.querySelector(".node-group.is-preview");
      if(prev&&prev.getAttribute("data-layout-key"))return prev.getAttribute("data-layout-key");
      var best=null,bestLevel=-1;
      Array.prototype.forEach.call(svg.querySelectorAll(".node-group[data-layout-key]"),function(g){
        if(!g.querySelector(".selected-spoke"))return;
        var key=g.getAttribute("data-layout-key"),level=key.indexOf("cat-")===0?0:key.indexOf("subcategory-")===0?1:2;
        if(level>bestLevel){bestLevel=level;best=key}
      });
      // Q3: a branch's selection mark is stamped into its spoke
      // underlay item, never into the hub node group (see the
      // bundle's applySelectionMarking), so a branch-only selection
      // is invisible to the group scan above. Read it from the
      // underlay instead — level 0, so a deeper mark (a selected
      // topic also stamps its branch's underlay) still wins.
      Array.prototype.forEach.call(svg.querySelectorAll(".spoke-underlay-item[data-spoke-for]"),function(u){
        if(bestLevel>=0||!u.querySelector(".selected-spoke"))return;
        best=u.getAttribute("data-spoke-for");bestLevel=0;
      });
      return best;
    }
    function resolveFocus(key){
      if(!key)return null;
      var branches=branchNames(),i,b,bs;
      if(key.indexOf("cat-")===0){var slug=key.slice(4);for(i=0;i<branches.length;i++)if(slugify(branches[i])===slug)return{branch:branches[i]};return null}
      if(key.indexOf("subcategory-")===0){
        var tax=taxonomy();
        if(tax&&tax.categories)for(var c=0;c<tax.categories.length;c++){var cat=tax.categories[c],subs=cat.subcategories||[];for(var s=0;s<subs.length;s++)if("subcategory-"+slugify(cat.name)+"-"+slugify(subs[s].name)===key)return{branch:cat.name,subcat:subs[s].name}}
        var rest=key.slice(12),sel=document.getElementById("layoutSubcat");
        for(b=0;b<branches.length;b++){bs=slugify(branches[b]);if(rest.indexOf(bs+"-")===0&&sel){var subSlug=rest.slice(bs.length+1);for(var o=0;o<sel.options.length;o++)if(slugify(sel.options[o].value)===subSlug)return{branch:branches[b],subcat:sel.options[o].value}}}
        return null;
      }
      var entry=topicEntry(key);
      if(entry)return{branch:entry.category,subcat:entry.subcategory||null,kink:key};
      if(key.indexOf("topic-")===0){var trest=key.slice(6);for(b=0;b<branches.length;b++){bs=slugify(branches[b]);if(trest.indexOf(bs+"-")===0)return{branch:branches[b]}}}
      var ksel=document.getElementById("layoutKink");
      if(ksel)for(var k=0;k<ksel.options.length;k++)if(ksel.options[k].value===key)return{kink:key};
      return null;
    }
    function setSelectValue(id,value){var sel=document.getElementById(id);if(!sel||!value)return false;for(var i=0;i<sel.options.length;i++)if(sel.options[i].value===value){sel.value=value;return true}return false}
    var lastFocusKey=null,pendingFocusKey=null;
    function focusEditorOn(key){
      var f=resolveFocus(key);if(!f)return false;
      var c=config(),touched=false;
      if(f.branch){try{checkAnnealBranchFromMap(f.branch)}catch(e){__sxErrLog("layout-anneal-map-sync",e)}}
      if(f.branch&&setSelectValue("layoutBranch",f.branch)){syncBranch(c);touched=true}
      if(f.subcat&&setSelectValue("layoutSubcat",f.subcat)){syncSubcatAngle(c);touched=true}
      if(f.kink&&setSelectValue("layoutKink",f.kink)){syncKink(c);touched=true}
      if(touched){
        var sec=document.getElementById("layoutSectionSelection");if(sec)sec.open=true;var sev=document.getElementById("layoutSectionEveryday");if(sev&&f.subcat)sev.open=true;
        if(f.branch){var wrap=document.getElementById("layoutSpokeAngles");if(wrap)Array.prototype.forEach.call(wrap.children,function(row){if(row.getAttribute("data-spoke-angle-name")===f.branch){row.classList.add("layout-editor-row-flash");setTimeout(function(){row.classList.remove("layout-editor-row-flash")},1900);setTimeout(function(){try{row.scrollIntoView({block:"nearest"})}catch (e) { __sxErrLog("scroll-into-view", e); }},80)}})}
      }
      return touched;
    }
    function detectAndFocus(){
      var svg=document.getElementById("mapSvg");if(!svg)return;
      var key=selectedNodeKey(svg);
      if(!key){
        // A selection notification that arrived before the selects
        // had their options (the editor had never been opened, so
        // focusEditorOn could not land it) is retried here — by the
        // time the editor opens, the options exist.
        if(pendingFocusKey){var pk=pendingFocusKey;if(focusEditorOn(pk)){lastFocusKey=pk;pendingFocusKey=null}return}
        // Q3 clear sync: a map-side clear that bypasses the shared
        // clear path (e.g. a topic tap whose toggle collapses the
        // selection away) removes every .selected-spoke mark without
        // calling clearSelectionUI. When the editor was following a
        // map selection, mirror the clear into the three selects so
        // map and editor never disagree. Only the selects are
        // cleared here — the map is already clear, so the API clear
        // path inside clearSelectionUI is not re-entered.
        if(lastFocusKey!==null){lastFocusKey=null;["layoutBranch","layoutSubcat","layoutKink"].forEach(function(id){var sel=document.getElementById(id);if(sel)sel.value=""});var c=config();syncBranch(c);syncKink(c);syncSubcatAngle(c)}
        return;
      }
      if(key===lastFocusKey)return;
      if(focusEditorOn(key)){lastFocusKey=key;pendingFocusKey=null}else pendingFocusKey=key;
    }
    // Q3: a map-side selection is followed even while the panel is
    // closed (the panel.hidden gate that used to sit here is gone),
    // so the next editor open lands on the selected branch. Setting
    // the selects on a hidden panel is inert until it opens.
    function selectNode(key){if(!key)return;if(focusEditorOn(key)){lastFocusKey=key;pendingFocusKey=null}else pendingFocusKey=key}
    // Live scores, computed from the rendered SVG in screen space with the
    // documented methodology: C = label-label overlaps + label-spoke hits
    // (a label's own spoke excluded) + proper spoke-spoke crossings;
    // X = the spoke-spoke crossings alone; Coverage = the content
    // bounding box's share of the viewport area.
    var scoreTimer=0,scoresOn=false;
    function scheduleScores(){if(!scoresOn)return;if(panel.hidden)return;if(scoreTimer)return;scoreTimer=setTimeout(function(){scoreTimer=0;updateScores()},140)}
    function segSeg(p1,p2,p3,p4,proper){
      var d1=(p4.x-p3.x)*(p1.y-p3.y)-(p4.y-p3.y)*(p1.x-p3.x),d2=(p4.x-p3.x)*(p2.y-p3.y)-(p4.y-p3.y)*(p2.x-p3.x),d3=(p2.x-p1.x)*(p3.y-p1.y)-(p2.y-p1.y)*(p3.x-p1.x),d4=(p2.x-p1.x)*(p4.y-p1.y)-(p2.y-p1.y)*(p4.x-p1.x);
      var crossed=((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0));
      if(proper)return crossed;
      if(crossed)return true;
      function onSeg(a,b,c){return b.x>=Math.min(a.x,c.x)-0.01&&b.x<=Math.max(a.x,c.x)+0.01&&b.y>=Math.min(a.y,c.y)-0.01&&b.y<=Math.max(a.y,c.y)+0.01}
      return (Math.abs(d1)<0.01&&onSeg(p3,p1,p4))||(Math.abs(d2)<0.01&&onSeg(p3,p2,p4))||(Math.abs(d3)<0.01&&onSeg(p1,p3,p2))||(Math.abs(d4)<0.01&&onSeg(p1,p4,p2));
    }
    function segRect(s,r){
      function inside(p){return p.x>=r.left&&p.x<=r.right&&p.y>=r.top&&p.y<=r.bottom}
      if(inside(s.a)||inside(s.b))return true;
      var tl={x:r.left,y:r.top},tr={x:r.right,y:r.top},br={x:r.right,y:r.bottom},bl={x:r.left,y:r.bottom};
      return segSeg(s.a,s.b,tl,tr,false)||segSeg(s.a,s.b,tr,br,false)||segSeg(s.a,s.b,br,bl,false)||segSeg(s.a,s.b,bl,tl,false);
    }
    function parentKeyFor(key){
      var branches=branchNames(),b,bs;
      if(key.indexOf("cat-")===0)return null;
      if(key.indexOf("subcategory-")===0){var rest=key.slice(12);for(b=0;b<branches.length;b++){bs=slugify(branches[b]);if(rest.indexOf(bs+"-")===0)return "cat-"+bs}return null}
      var entry=topicEntry(key);
      if(entry){if(entry.subcategory)return "subcategory-"+slugify(entry.category)+"-"+slugify(entry.subcategory);return "cat-"+slugify(entry.category)}
      if(key.indexOf("topic-")===0){var trest=key.slice(6);for(b=0;b<branches.length;b++){bs=slugify(branches[b]);if(trest.indexOf(bs+"-")===0)return "cat-"+bs}}
      return null;
    }
    function updateScores(){
      var cEl=document.getElementById("layoutScoreC"),xEl=document.getElementById("layoutScoreX"),covEl=document.getElementById("layoutScoreCov"),strip=document.getElementById("layoutScores");
      if(!cEl||!xEl||!covEl)return;
      var svg=document.getElementById("mapSvg");
      if(!svg){cEl.textContent=xEl.textContent=covEl.textContent="–";return}
      try{
        var pos={},keys=[];
        Array.prototype.forEach.call(svg.querySelectorAll(".node-group[data-layout-key]:not(.is-hidden)"),function(g){
          var key=g.getAttribute("data-layout-key");if(!key||pos[key])return;
          var icon=g.querySelector(":scope > .branch-icon, :scope > .topic-icon");if(!icon)return;
          var r=icon.getBoundingClientRect();if(!r.width&&!r.height)return;
          pos[key]={x:r.left+r.width/2,y:r.top+r.height/2};keys.push(key);
        });
        var center=null,layer=document.getElementById("mapLayer");
        try{var m=(layer||svg).getScreenCTM();if(m){var pt=new DOMPoint(900,620).matrixTransform(m);center={x:pt.x,y:pt.y}}}catch (e) { __sxErrLog("screen-ctm", e); }
        if(!center){var sx=0,sy=0,n=0;keys.forEach(function(k){if(k.indexOf("cat-")===0){sx+=pos[k].x;sy+=pos[k].y;n++}});if(n)center={x:sx/n,y:sy/n}}
        var segs=[];
        keys.forEach(function(k){var pk=parentKeyFor(k),a=pk?pos[pk]:(k.indexOf("cat-")===0?center:null);if(a&&pos[k])segs.push({key:k,a:a,b:pos[k]})});
        function samePt(p,q){return Math.abs(p.x-q.x)<0.6&&Math.abs(p.y-q.y)<0.6}
        var X=0,i,j,s,t;
        for(i=0;i<segs.length;i++)for(j=i+1;j<segs.length;j++){s=segs[i];t=segs[j];if(samePt(s.a,t.a)||samePt(s.a,t.b)||samePt(s.b,t.a)||samePt(s.b,t.b))continue;if(segSeg(s.a,s.b,t.a,t.b,true))X++}
        var visibleKeys={};keys.forEach(function(k){visibleKeys[k]=true});
        var labels=[],seenLabel={};
        Array.prototype.forEach.call(svg.querySelectorAll(".category-label,.map-label"),function(el){
          var id=el.getAttribute("data-id")||el.getAttribute("data-topic-id");
          if(!id||!visibleKeys[id]||seenLabel[id])return;
          var r=el.getBoundingClientRect();if(r.width<2||r.height<2)return;
          seenLabel[id]=true;labels.push({id:id,rect:{left:r.left,top:r.top,right:r.right,bottom:r.bottom}});
        });
        var LL=0,LS=0,a2,b2;
        for(a2=0;a2<labels.length;a2++)for(b2=a2+1;b2<labels.length;b2++){var ra=labels[a2].rect,rb=labels[b2].rect;if(ra.left+1<rb.right-1&&rb.left+1<ra.right-1&&ra.top+1<rb.bottom-1&&rb.top+1<ra.bottom-1)LL++}
        labels.forEach(function(l){segs.forEach(function(sg){if(sg.key!==l.id&&segRect(sg,l.rect))LS++})});
        var C=LL+LS+X,cov=null,sr=svg.getBoundingClientRect();
        if(sr.width>0&&sr.height>0&&(keys.length||labels.length)){
          var minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
          keys.forEach(function(k){var p=pos[k];if(p.x<minX)minX=p.x;if(p.y<minY)minY=p.y;if(p.x>maxX)maxX=p.x;if(p.y>maxY)maxY=p.y});
          labels.forEach(function(l){if(l.rect.left<minX)minX=l.rect.left;if(l.rect.top<minY)minY=l.rect.top;if(l.rect.right>maxX)maxX=l.rect.right;if(l.rect.bottom>maxY)maxY=l.rect.bottom});
          if(isFinite(minX))cov=Math.max(0,Math.min(100,(maxX-minX)*(maxY-minY)/(sr.width*sr.height)*100));
        }
        cEl.textContent=String(C);xEl.textContent=String(X);covEl.textContent=cov===null?"–":cov.toFixed(1)+"%";
        if(strip)strip.classList.toggle("is-clean",C===0&&X===0);
      }catch(err){cEl.textContent=xEl.textContent=covEl.textContent="–"}
    }
    var mapObserver=null;
    function watchMap(){
      var svg=document.getElementById("mapSvg");if(!svg||mapObserver)return;
      try{mapObserver=new MutationObserver(function(){if(!panel.hidden)scheduleScores();detectAndFocus()});mapObserver.observe(svg,{childList:true,subtree:true,attributes:true,attributeFilter:["class","viewBox","transform"]})}catch (e) { __sxErrLog("observer", e); }
    }
    function open(){sync();lastFocusKey=null;panel.hidden=false;setLayoutMinimised(false);detectAndFocus();scheduleScores();scheduleMetric();SexcapadesRuntime.TimerManager.requestAnimationFrame(function(){close.focus({preventScroll:true})})}function shut(){panel.hidden=true;if(stripTimer!==null){SexcapadesRuntime.TimerManager.clear(stripTimer);stripTimer=null}syncPanelDock()}
    // Tooltip card dismissal (Group 4, G4-3): the shared #uiTooltip
    // card is shown by the app on hover/focus and could park over
    // this panel — its trigger keeps focus after a click, so the card
    // stayed up and swallowed later taps (the prime suspect for dead
    // editor toggles after pop-slider use). Now: any completed click
    // inside the editor dismisses it, Escape dismisses it, and while
    // the editor is open it auto-dismisses after ~3.4s even if left
    // alone. Together with the pointer-events:none style rule, the
    // card can never park over the panel or block a control.
    function dismissUiTooltip(){var tip=document.getElementById("uiTooltip");if(tip&&!tip.hidden){tip.hidden=true;var described=document.querySelector("[aria-describedby='uiTooltip']");if(described)described.removeAttribute("aria-describedby")}}
    panel.addEventListener("click",function(){dismissUiTooltip()},true);
    document.addEventListener("keydown",function(event){if(event.key==="Escape")dismissUiTooltip()});
    try{var uiTipEl=document.getElementById("uiTooltip");if(uiTipEl){var uiTipTimer=null;new MutationObserver(function(){if(uiTipTimer){clearTimeout(uiTipTimer);uiTipTimer=null}if(!uiTipEl.hidden&&!panel.hidden)uiTipTimer=setTimeout(dismissUiTooltip,3400)}).observe(uiTipEl,{attributes:true,attributeFilter:["hidden","class","style"]})}}catch (e) { __sxErrLog("ui-tooltip-dismiss", e); }
    window.__SEXCAPADES_LAYOUT_UI={open:open,close:shut,selectNode:selectNode,clearSelection:clearSelectionUI,applyEditorState:applyEditorState,sync:sync};close.addEventListener("click",shut);
    document.addEventListener("keydown",function(event){var k=(event.key||"").toLowerCase();if(event.ctrlKey&&event.shiftKey&&(k==="l"||(event.code&&event.code==="KeyL"))){event.preventDefault();panel.hidden?open():shut()}else if(event.ctrlKey&&event.shiftKey&&(k==="s"||(event.code&&event.code==="KeyS"))){var t=event.target;if(t){var tg=t.tagName;if(tg==="TEXTAREA"||tg==="SELECT"||t.isContentEditable)return;if(tg==="INPUT"){var ty=(t.type||"text").toLowerCase();if(ty==="text"||ty==="search"||ty==="url"||ty==="email"||ty==="password"||ty==="number"||ty==="tel"||ty==="date"||ty==="time"||ty==="datetime-local"||ty==="month"||ty==="week")return}}event.preventDefault();var ms=document.getElementById(ids.mapSliders);if(!ms)return;ms.click()}else if(event.key==="Escape"&&!panel.hidden){event.preventDefault();if(!clearSelectionUI())shut()}});
    document.querySelectorAll("[data-layout-spacing]").forEach(function(input){input.addEventListener("change",function(){if(!input.checked)return;var name=input.dataset.layoutSpacing,next=collect();if(name==="custom"){if(customSpacing)Object.assign(next,customSpacing);next.spacing="custom"}else{if(spacingNameFor(spacingValuesOf(config()))==="custom")customSpacing=spacingValuesOf(config());Object.assign(next,bundles[name],{spacing:name})}apply(next)})});
    document.querySelectorAll("[data-layout-rating]").forEach(function(input){input.addEventListener("change",function(){if(!input.checked)return;/* LR-G5: this handler used to click the hidden mirror button (former id layoutRatedToggle) in a loop until its text matched the chosen value; the bundle now drives global visibility from the radios' own change events and the checked radio IS the rating state — nothing is clicked or read here beyond the editor sync */sync()})});
    // Layout groups Phase 2 (Q8/Q10): selector-button + pop-up menu
    // overlay mechanics, shared by Branch order and Collision mode. Each
    // control is one anchor button at rest showing the current mode; its
    // menu is a fixed-position overlay anchored to the button and
    // viewport-clamped (the capsule positioning precedent), floating
    // above the layout — never in flow, so no option can hide behind a
    // tooltip or read as a static label. The mode state itself is
    // unchanged: the menu options keep their aria-pressed contract, read
    // by branchOrderSelection()/collisionModeValue() and written by
    // sync(), exactly as the retired segmented rows were.
    function positionLeMenu(anchor,menu){
      var r=anchor.getBoundingClientRect(),w=menu.offsetWidth,h=menu.offsetHeight;
      var left=Math.min(Math.max(r.left,8),Math.max(8,window.innerWidth-w-8));
      var top=r.bottom+6;
      if(top+h>window.innerHeight-8)top=r.top-h-6;
      if(top<8)top=Math.max(8,window.innerHeight-h-8);
      menu.style.left=left+"px";menu.style.top=top+"px";
    }
    function syncBranchOrderAnchor(){var cur=document.getElementById("layoutBranchOrderCurrent");if(!cur)return;var pressed=document.querySelector("[data-branch-order][aria-pressed='true']");if(pressed)cur.textContent=pressed.textContent}
    function syncCollisionAnchor(){var cur=document.getElementById("layoutCollisionCurrent");if(!cur)return;var pressed=document.querySelector("[data-collision-mode][aria-pressed='true']");if(pressed)cur.textContent=pressed.textContent}
    function closeBranchOrderMenu(){var menu=document.getElementById("layoutBranchOrderMenu"),btn=document.getElementById("layoutBranchOrderBtn");if(menu){menu.hidden=true;menu.style.left="";menu.style.top=""}if(btn)btn.setAttribute("aria-expanded","false")}
    function closeCollisionMenu(){var menu=document.getElementById("layoutCollisionMs"),btn=document.getElementById("layoutCollisionBtn");if(menu){menu.hidden=true;menu.style.left="";menu.style.top=""}if(btn)btn.setAttribute("aria-expanded","false")}
    function closeSolverModeMenu(){var menu=document.getElementById("layoutSolverModeMenu"),btn=document.getElementById("layoutSolverModeBtn");if(menu){menu.hidden=true;menu.style.left="";menu.style.top=""}if(btn)btn.setAttribute("aria-expanded","false")}
    function closeTargetNodeMenu(){var menu=document.getElementById("layoutTargetNodeMenu"),btn=document.getElementById("layoutTargetNodeBtn");if(menu){menu.hidden=true;menu.style.left="";menu.style.top=""}if(btn)btn.setAttribute("aria-expanded","false")}
    function openLeMenu(anchor,menu,closeOther){
      if(typeof closeOther==="function")closeOther();
      closeTargetNodeMenu();
      if(typeof closeLePopups==="function")closeLePopups(null);
      menu.hidden=false;
      anchor.setAttribute("aria-expanded","true");
      positionLeMenu(anchor,menu);
    }
    var branchOrderControl=document.querySelector(".branch-order-control");
    var branchOrderBtn=document.getElementById("layoutBranchOrderBtn");
    if(branchOrderControl&&branchOrderBtn){var branchOrderButtons=Array.prototype.slice.call(document.querySelectorAll("[data-branch-order]"));branchOrderButtons.forEach(function(btn){btn.addEventListener("click",function(){branchOrderButtons.forEach(function(b){b.setAttribute("aria-pressed",String(b===btn))});syncBranchOrderAnchor();apply(collect());closeBranchOrderMenu();branchOrderBtn.focus()})});branchOrderBtn.addEventListener("click",function(){if(branchOrderControl.hidden)openLeMenu(branchOrderBtn,branchOrderControl,closeCollisionMenu);else closeBranchOrderMenu()});document.addEventListener("pointerdown",function(event){if(!branchOrderControl.hidden&&!branchOrderControl.contains(event.target)&&event.target!==branchOrderBtn&&!branchOrderBtn.contains(event.target))closeBranchOrderMenu()});document.addEventListener("keydown",function(event){if(event.key==="Escape"&&!branchOrderControl.hidden){closeBranchOrderMenu();branchOrderBtn.focus()}});syncBranchOrderAnchor()}
    // Light path for the two display-only toggles (Group 1): Freeze
    // (staticMap) and relation lines (showRelations) change nothing
    // about geometry, so they must not pay for a full layout apply —
    // one apply of unchanged settings blocked the main thread ~13s and
    // snapped the camera back to fit. Assign the collected settings
    // straight into window.__SEXCAPADES_LAYOUT (the object the app's
    // relations overlay reads), flip the one CSS class each toggle
    // owns on #mapSvg, and run the editor's usual sync/schedulers so
    // scores, metrics, and cross-window live sync still follow. If the
    // layout object is somehow missing, fall back to the full apply.
    function applyDisplayToggle(next,key){
      if(!window.__SEXCAPADES_LAYOUT){apply(next);return}
      Object.assign(window.__SEXCAPADES_LAYOUT,next);
      var svg=document.getElementById("mapSvg");
      if(svg){
        if(key==="staticMap")svg.classList.toggle("is-static",!!next.staticMap);
        else if(key==="showRelations")svg.classList.toggle("relations-off",!next.showRelations);
      }
      sync();scheduleScores();scheduleMetric();scheduleLiveSync();
    }
    ["stagger","expandAll","crossmin","nudge","showRelations","propFan","subcatOrder","staggerDensity","repulsionEnabled","staticMap","animations","mapSliders"].forEach(function(key){var el=document.getElementById(ids[key]);if(el)el.addEventListener("change",function(){if(key==="showRelations"||key==="staticMap")applyDisplayToggle(collect(),key);else apply(collect())})});
    document.getElementById(ids.collisionEnabled).addEventListener("change",function(){var next=collect();if(this.checked&&next.collision==="off")next.collision=lastCollision;apply(next)});
    /* LR-G5: the hidden collision select's change handler (lastCollision bookkeeping, master-switch sync, apply) now lives in applyCollisionMode() beside collect(); the visible mode buttons call it directly — see the #layoutCollisionMs wiring below. */
    // Drag coalescing (Refactor Batch 4): a range slider's input
    // events run their handler at most once per animation frame -
    // the latest event wins, so the final value is what gets
    // applied - instead of one full apply() per input event. A
    // change event on the same slider flushes immediately (pending
    // frame cancelled, handler run once with the final value), so
    // every drag ends in exactly the state the un-coalesced code
    // produced. Discrete controls keep their direct bindings.
    function coalesceSlider(el,handler){if(!el)return;var frame=0,lastEvent=null;el.addEventListener("input",function(event){lastEvent=event;if(frame)return;frame=requestAnimationFrame(function(){frame=0;var e=lastEvent;lastEvent=null;if(e)handler.call(el,e)})});el.addEventListener("change",function(event){if(!frame)return;cancelAnimationFrame(frame);frame=0;lastEvent=null;handler.call(el,event)})}
    ["subLen","pad","repulsion"].forEach(function(key){coalesceSlider(document.getElementById(ids[key]),function(){var out=document.getElementById(ids[key]+"Value");if(out)out.textContent=Number(this.value).toFixed(1)+"×";var next=collect();next.spacing="custom";customSpacing=spacingValuesOf(next);apply(next);this.value=String(next[key]);if(out)out.textContent=Number(this.value).toFixed(1)+"×";scheduleMetric()})});coalesceSlider(document.getElementById(ids.spokeLen),function(){var out=document.getElementById(ids.spokeLen+"Value");if(out)out.textContent=fmtLen(relClamp(this.value)*bakedSpokeBase());var next=collect();next.spacing="custom";customSpacing=spacingValuesOf(next);apply(next);this.value=String(relClamp(next.spokeLen/bakedSpokeBase()));if(out)out.textContent=fmtLen(next.spokeLen);scheduleMetric()});
    /* Armed auto-shrink factors (Build 2026-10-31_1329): the two
       sliders write the EXISTING engine factors — mn.autoShrinkFactor
       (the branch radius chain's armed shrinkFactor) and
       mn.subcatCloudShrinkFactor (the armed subcategory cloud-radius
       factor in the collision passes) — through the ordinary
       collect/apply path, like every other global slider. Shipped
       value 0.76 for both; the engine falls back to 0.76 whenever a
       settings object carries no valid value. They are not spacing
       values, so they never touch the spacing preset state. */
    ["autoShrinkFactor","subcatCloudShrinkFactor"].forEach(function(key){coalesceSlider(document.getElementById(ids[key]),function(){var out=document.getElementById(ids[key]+"Value");if(out)out.textContent=Number(this.value).toFixed(2)+"×";var next=collect();apply(next);this.value=String(next[key]);if(out)out.textContent=Number(this.value).toFixed(2)+"×";scheduleMetric()})});
    /* Q7 — transform-only preview for the Text size (font) knob.
       The knob used to run a full synchronous apply on every drag
       step (~535 ms per step on the 28-topic Alex map; ~6.6 s per
       apply on the general path). Now a drag runs NO apply: each
       step re-scales the map's icon glyphs and labels with transforms
       only — an icon <g> gets an in-place scale composed into its
       baked transform attribute, around the icon's own center (from
       its translate + data-diameter), and each label <text> gets a
       CSS scale about its own box. Nothing else is touched: ratings,
       spokes, positions, anchors, frame and data all stay at the
       baked state, and metrics (xAreaCross, z90) are NOT recomputed
       until the commit apply — the on-map metric overlay deliberately
       keeps showing the baked numbers during preview.
       Divergence from the baked result, exactly: positions do not
       move in preview, while the commit re-solve feeds the new icon
       radius (hub radius = icon diameter x fontScale / 2) into its
       spacing/collision fit, so bigger icons push siblings apart,
       change fan angles and move clouds where the preview simply
       overlaps them. Label and rating-control anchors stay stale
       (the bake re-anchors them to the new hub radius). The frame
       stays stale (the bake re-fits; a large preview can overflow
       the viewport the bake would have re-fitted). What IS exact in
       preview is the icon glyph diameter itself — it scales by
       precisely the font ratio — which is the quantity the icon-law
       trial judges. Spoke starts do not move in preview and do not
       move on a font bake either: spoke start radius scales with
       the CENTER knob, not font.
       On release (the range's change event, also fired by the
       number input's explicit commit) the preview clears and ONE
       commit runs the existing apply() path untouched, Q6 overlay
       and map-complete gate included. Commits coalesce: a commit
       requested while one is in flight only records the latest
       value, and runs when the in-flight commit's overlay session
       ends — applies never stack.
       Icon-law trial: the pop's "Scale icons by: Font | Center"
       toggle steers the preview's icon factor only (Font: icons
       track this knob — the ruled law; Center: icons track the
       center knob, i.e. hold their size while this knob moves).
       It writes no setting and no data; the commit always applies
       the ruled (font) law through the existing path. */
    var fontPv={active:false,base:3,centerBase:3,source:"center",icons:[],labels:[],inFlight:false,pending:null,watchTimer:0,watchTicks:0};
    function fontPvBadge(show){var b=document.getElementById("layoutFontPreviewBadge");if(b)b.hidden=!show}
    function fontPvCapture(){
      fontPv.icons=[];fontPv.labels=[];
      var svg=document.getElementById("mapSvg");if(!svg)return;
      Array.prototype.forEach.call(svg.querySelectorAll(".node-group > .branch-icon, .node-group > .topic-icon"),function(el){
        var dia=Number(el.getAttribute("data-diameter")),orig=el.getAttribute("transform");
        if(!(dia>0)||!orig)return;
        var m=/^translate\(\s*(-?[\d.]+)[ ,]\s*(-?[\d.]+)\s*\)$/.exec(orig);
        if(!m)return;
        var r=dia/2;
        fontPv.icons.push({el:el,orig:orig,cx:Number(m[1])+r,cy:Number(m[2])+r,r:r});
      });
      Array.prototype.forEach.call(svg.querySelectorAll(".category-label, .map-label"),function(el){
        fontPv.labels.push({el:el,t:el.style.transform||"",b:el.style.transformBox||"",o:el.style.transformOrigin||""});
        el.style.transformBox="fill-box";el.style.transformOrigin="center";
      });
    }
    function fontPvPaint(v){
      var ratio=v/fontPv.base,i,it;
      var iconK=fontPv.source==="center"?(Number(config().centerRingScale)||fontPv.centerBase)/fontPv.centerBase:ratio;
      for(i=0;i<fontPv.icons.length;i++){it=fontPv.icons[i];it.el.setAttribute("transform","translate("+(it.cx-iconK*it.r).toFixed(2)+" "+(it.cy-iconK*it.r).toFixed(2)+") scale("+iconK+")")}
      for(i=0;i<fontPv.labels.length;i++)fontPv.labels[i].el.style.transform="scale("+ratio+")";
    }
    function fontPvClear(){
      var i,it;
      for(i=0;i<fontPv.icons.length;i++){it=fontPv.icons[i];try{it.el.setAttribute("transform",it.orig)}catch(e){}}
      for(i=0;i<fontPv.labels.length;i++){it=fontPv.labels[i];it.el.style.transform=it.t;it.el.style.transformBox=it.b;it.el.style.transformOrigin=it.o}
      fontPv.icons=[];fontPv.labels=[];fontPv.active=false;fontPvBadge(false);
    }
    function fontPvStep(v){
      if(!fontPv.active){fontPv.base=Number(config().fontScale)||3;fontPv.centerBase=Number(config().centerRingScale)||3;fontPvCapture();fontPv.active=true;fontPvBadge(true)}
      fontPvPaint(v);
    }
    function fontCommitDone(){
      fontPv.inFlight=false;
      if(fontPv.watchTimer){clearInterval(fontPv.watchTimer);fontPv.watchTimer=0}
      var p=fontPv.pending;fontPv.pending=null;
      if(p===null)return;
      var range=document.getElementById(ids.fontScale);
      if(range)range.value=String(p);
      fontCommitRun();
    }
    function fontCommitWatch(){
      // In flight until the commit's Q6 overlay session ends
      // (overlay hidden again — dismissal is gated on map-complete).
      // An apply that never armed finished synchronously inside
      // apply(), so the first tick already sees the overlay hidden.
      // The 120 s cap keeps a stuck session from wedging the knob.
      if(fontPv.watchTimer)clearInterval(fontPv.watchTimer);
      fontPv.watchTicks=0;
      fontPv.watchTimer=setInterval(function(){
        fontPv.watchTicks++;
        var ov=document.getElementById("mapLoadOverlay");
        if(!ov||ov.hidden||fontPv.watchTicks>480)fontCommitDone();
      },250);
    }
    function fontCommitRun(){
      fontPv.inFlight=true;
      try{apply(collect())}catch(e){__sxErrLog("layout-font-preview-commit",e)}
      fontCommitWatch();
    }
    function fontCommit(v){
      if(fontPv.active)fontPvClear();
      if(fontPv.inFlight){fontPv.pending=v;return}
      fontCommitRun();
    }
    (function(){
      var range=document.getElementById(ids.fontScale);if(!range)return;
      var frame=0,lastV=null;
      range.addEventListener("input",function(){
        lastV=Number(range.value)||1;
        var out=document.getElementById("layoutFontScaleValue");
        if(out)out.textContent=lastV.toFixed(2)+"×";
        var num=document.getElementById("layoutFontScaleNum");
        if(num&&document.activeElement!==num)num.value=String(lastV);
        if(frame)return;
        frame=requestAnimationFrame(function(){frame=0;if(lastV!==null)fontPvStep(lastV)});
      });
      range.addEventListener("change",function(){
        if(frame){cancelAnimationFrame(frame);frame=0}
        lastV=null;
        var out=document.getElementById("layoutFontScaleValue");
        if(out)out.textContent=(Number(range.value)||1).toFixed(2)+"×";
        fontCommit(Number(range.value)||1);
      });
      Array.prototype.forEach.call(document.querySelectorAll("[data-font-icon-law]"),function(btn){
        btn.addEventListener("click",function(){
          var src=btn.getAttribute("data-font-icon-law")==="center"?"center":"font";
          if(src===fontPv.source)return;
          fontPv.source=src;
          Array.prototype.forEach.call(document.querySelectorAll("[data-font-icon-law]"),function(b){var on=b===btn;b.classList.toggle("is-on",on);b.setAttribute("aria-pressed",String(on))});
          if(fontPv.active){var v=Number(range.value);if(Number.isFinite(v))fontPvPaint(v)}
        });
      });
    })();
    var layoutFontScaleNumEl=document.getElementById("layoutFontScaleNum");if(layoutFontScaleNumEl){var commitFontScaleNum=function(){var range=document.getElementById(ids.fontScale);if(!range)return;var v=Number(layoutFontScaleNumEl.value);if(!Number.isFinite(v)){layoutFontScaleNumEl.value=range.value;return}v=Math.min(Number(range.max)||3,Math.max(Number(range.min)||.5,v));range.value=String(v);layoutFontScaleNumEl.value=String(v);range.dispatchEvent(new Event("input",{bubbles:true}));range.dispatchEvent(new Event("change",{bubbles:true}))};layoutFontScaleNumEl.addEventListener("change",commitFontScaleNum);layoutFontScaleNumEl.addEventListener("keydown",function(event){if(event.key==="Enter"){event.preventDefault();commitFontScaleNum()}})}
    coalesceSlider(document.getElementById(ids.centerRingScale),function(){var v=Number(this.value)||1,out=document.getElementById("layoutCenterRingScaleValue");if(out)out.textContent=v.toFixed(2)+"×";apply(collect());this.value=String(v);if(out)out.textContent=v.toFixed(2)+"×";scheduleMetric()});
    // % kink leaf overgrowth (ruled 2026-11-03, Jason): one percent of
    // the full fit target drives BOTH the Anneal throw's leaf length
    // (which is also the leaf minimum — leaves have no shrink ladder of
    // their own) and what Autofit delivers. The value applies live into
    // the layout settings on every slider move (apply(collect())), rides
    // the share hash / export / saved defaults like every other dial,
    // and is part of the bundle's crossing-score fingerprint, so scores
    // recompute the moment it moves.
    coalesceSlider(document.getElementById(ids.leafOvergrowth),function(){var v=Number(this.value)||100,out=document.getElementById("layoutLeafOvergrowthValue");if(out)out.textContent=Math.round(v)+"%";var num=document.getElementById("layoutLeafOvergrowthNum");if(num&&document.activeElement!==num)num.value=String(v);apply(collect());this.value=String(v);if(out)out.textContent=Math.round(v)+"%";scheduleMetric()});
    var layoutLeafOvergrowthNumEl=document.getElementById("layoutLeafOvergrowthNum");if(layoutLeafOvergrowthNumEl){var commitLeafOvergrowthNum=function(){var range=document.getElementById(ids.leafOvergrowth);if(!range)return;var v=Number(layoutLeafOvergrowthNumEl.value);if(!Number.isFinite(v)){layoutLeafOvergrowthNumEl.value=range.value;return}v=Math.min(Number(range.max)||500,Math.max(Number(range.min)||100,v));range.value=String(v);layoutLeafOvergrowthNumEl.value=String(v);range.dispatchEvent(new Event("input",{bubbles:true}));range.dispatchEvent(new Event("change",{bubbles:true}))};layoutLeafOvergrowthNumEl.addEventListener("change",commitLeafOvergrowthNum);layoutLeafOvergrowthNumEl.addEventListener("keydown",function(event){if(event.key==="Enter"){event.preventDefault();commitLeafOvergrowthNum()}})}
    // Bidirectional selection sync (Build 2026-10-18_1401): picking a
    // branch, subcategory, or kink in the Advanced selects also selects
    // that branch on the map (the reverse of map spoke taps following
    // into these selects via selectNode). Programmatic pre-selection
    // from the map sets .value directly and fires no change event, so
    // this cannot loop.
    // Deselect/back (Build 2026-10-19_0543): the one clear path for the
    // editor side. Resets the three Advanced selects (which disables
    // their sliders via the sync functions), forgets the focused node so
    // re-selecting the same spoke re-focuses, and clears the map's
    // selection through the API. Returns whether anything was selected,
    // so Escape can act as Back: clear first, close only when clear.
    // The bundle calls this (via __SEXCAPADES_LAYOUT_UI.clearSelection)
    // when an empty-space tap on the map deselects, keeping both sides
    // in the same state.
    function clearSelectionUI(){var had=lastFocusKey!==null||pendingFocusKey!==null;pendingFocusKey=null;["layoutBranch","layoutSubcat","layoutKink"].forEach(function(id){var sel=document.getElementById(id);if(sel&&sel.value){sel.value="";had=true}});var c=config();syncBranch(c);syncKink(c);syncSubcatAngle(c);lastFocusKey=null;try{var api=window.__SEXCAPADES_LAYOUT_API;if(api&&api.clearSelection&&api.clearSelection())had=true}catch(e){__sxErrLog("layout-clear-selection",e)}return had}
    function selectOnMap(value){try{var api=window.__SEXCAPADES_LAYOUT_API;if(!api)return;if(!value){if(api.clearSelection)api.clearSelection();return}if(api.selectNode)api.selectNode(value)}catch (e) { __sxErrLog("layout-select", e); }}
    document.getElementById("layoutBranch").addEventListener("change",function(){syncBranch(config());setAnnealChecklistBranch(this.value);selectOnMap(this.value)});
    // Scoped routing helpers (Stage 3, T5): the eleven handlers
    // below commit through API.applyScoped with target = the
    // single branch the op belongs to (the scoped solve's
    // granularity is the branch, so subcategory and topic ops
    // resolve their containing branch), policy "contained", and opClass = the
    // handler's own name. (Ring retired, ruled 2026-11-01
    // 01:52, Jason: the bundle's scoped solve no longer
    // computes or honours a ring — every branch but the target,
    // nearest neighbours included, is frozen; the ring code is
    // commented out in the bundle, not deleted.)
    // The state patch each handler builds is
    // unchanged — identical keys and values to the pre-T5 write
    // set. If a branch cannot be resolved, scopedScope returns
    // null and apply() takes the ordinary full path, exactly as
    // before T5.
    function scopedScope(opClass,branch){return branch?{target:[branch],policy:"contained",opClass:opClass}:null}
    function branchOfSubcat(label){var tax=taxonomy();if(tax&&tax.categories)for(var i=0;i<tax.categories.length;i++){var subs=tax.categories[i].subcategories||[];for(var j=0;j<subs.length;j++)if(subs[j].name===label)return tax.categories[i].name}return null}
    function branchOfKink(id){var e=topicEntry(id);return e&&e.category?e.category:null}
    // F1 (layout-editor refactor): ONE table-driven actuator for all 13
    // single-item controls. Each LR_ACT row carries that control's own
    // selection element, value element, readout element, override store,
    // scope resolution, divert level (F2) and its own prepare/mutate/
    // resync steps, copied verbatim from the per-control functions this
    // table replaces — value transforms, clamping and readout formats
    // are deliberately NOT unified across controls. The old function
    // names survive below and at their original sites as thin wrappers
    // delegating here, so every existing call site is untouched.
    // SOLVER-METRICS REFACTOR (F6): ONE parameterized actuator factory
    // for all four self-shrink switch kinds (kind x scope). Every
    // shrink switch writes the ONE tri-state type — explicit true =
    // armed, explicit false = veto, absent = follow the global
    // collision mode — which the bundle reads through its single
    // reader (sxShrinkState). The four LR_ACT shrink entries below
    // are generated by this factory; they were four near-identical
    // hand-written entries. Behavior-preserving unification only:
    // the known flip-but-move-nothing switch defect is a SEPARATE
    // fix job (Group 3d), not diagnosed or fixed here — this
    // unification exists so that fix lands in one place.
    function lrShrinkActuator(kind){
      var branchKind=kind.scope==="branch";
      return {divert:kind.divert,
        guard:function(){var name=document.getElementById(branchKind?"layoutBranch":"layoutSubcat").value;if(!name)return null;return{name:name}},
        prepStores:function(next){next[kind.map]=Object.assign({},next[kind.map]||{})},
        mutate:function(next,c){if(document.getElementById(kind.checkbox).checked){next[kind.map][c.name]=true}else{next[kind.map][c.name]=false}},
        applyMsg:kind.msg,
        scope:function(c){return scopedScope(kind.scopeName,branchKind?c.name:branchOfSubcat(c.name))},
        metric:false};
    }
    var LR_ACT={
      spokeAngle:{divert:null,
        guard:function(a,b){if(!a)return null;return{name:a,value:b}},
        read:function(c){var sOut=document.getElementById("layoutSpokeAngleValue-"+spokeSlug(c.name));if(sOut)sOut.textContent=Math.max(-20,Math.min(20,Number(c.value)||0)).toFixed(0)+"°";c.sOut=sOut},
        prepStores:function(next){next.branchOverrides=copyOverrides(next.branchOverrides)},
        mutate:function(next,c){next.branchOverrides[c.name]=branchOverrideEntry(next.branchOverrides[c.name],{angle:Math.max(-20,Math.min(20,Number(c.value)||0))},c.name)},
        applyMsg:"Branch override updated",
        scope:function(c){return scopedScope("applySpokeAngle",c.name)},
        resync:function(next,c){var sRange=document.getElementById("layoutSpokeAngle-"+spokeSlug(c.name));if(sRange)sRange.value=String(next.branchOverrides[c.name].angle);if(c.sOut)c.sOut.textContent=Number(next.branchOverrides[c.name].angle).toFixed(0)+"°"},
        metric:true},
      branchLen:{divert:null,
        guard:function(){var name=document.getElementById("layoutBranch").value;if(!name)return null;return{name:name}},
        read:function(c){var base=bakedBranchBase(c.name),abs=relClamp(document.getElementById("layoutBranchLen").value)*base,lenOut=document.getElementById("layoutBranchLenValue");if(lenOut)lenOut.textContent=fmtLen(abs);c.base=base;c.abs=abs;c.lenOut=lenOut},
        prepStores:function(next){next.branchOverrides=copyOverrides(next.branchOverrides)},
        mutate:function(next,c){next.branchOverrides[c.name]=branchOverrideEntry(next.branchOverrides[c.name],{length:c.abs},c.name)},
        applyMsg:"Branch override updated",
        scope:function(c){return scopedScope("applyBranchLen",c.name)},
        resync:function(next,c){var lenEl=document.getElementById("layoutBranchLen");if(lenEl)lenEl.value=String(relClamp(next.branchOverrides[c.name].length/c.base));if(c.lenOut)c.lenOut.textContent=fmtLen(next.branchOverrides[c.name].length)},
        metric:true},
      branchAngle:{divert:null,
        guard:function(){var name=document.getElementById("layoutBranch").value;if(!name)return null;return{name:name}},
        read:function(c){var angOut=document.getElementById("layoutBranchAngleValue");if(angOut)angOut.textContent=Number(document.getElementById("layoutBranchAngle").value).toFixed(0)+"°";c.angOut=angOut},
        prepStores:function(next){next.branchOverrides=copyOverrides(next.branchOverrides)},
        mutate:function(next,c){next.branchOverrides[c.name]=branchOverrideEntry(next.branchOverrides[c.name],{angle:Number(document.getElementById("layoutBranchAngle").value)},c.name)},
        applyMsg:"Branch override updated",
        scope:function(c){return scopedScope("applyBranchAngle",c.name)},
        resync:function(next,c){var angEl=document.getElementById("layoutBranchAngle");if(angEl)angEl.value=String(next.branchOverrides[c.name].angle);if(c.angOut)c.angOut.textContent=Number(next.branchOverrides[c.name].angle).toFixed(0)+"°"},
        metric:true},
      branchSpokeAutoShrink:lrShrinkActuator({scope:"branch",map:"branchSpokeAutoShrink",checkbox:"layoutBranchSpokeAutoShrink",divert:null,msg:"Branch spoke auto-shrink updated",scopeName:"applyBranchSpokeAutoShrink"}),
      branchSubLen:{divert:["branch","subs","branchSubLen"],
        guard:function(){var name=document.getElementById("layoutBranch").value;if(!name)return null;return{name:name}},
        read:function(c){var v=Number(document.getElementById("layoutBranchSubLen").value)||1,out=document.getElementById("layoutBranchSubLenValue");if(out)out.textContent=v.toFixed(2)+"×";c.v=v;c.out=out},
        prepStores:function(next){next.branchOverrides=copyOverrides(next.branchOverrides);next.subcatOverrides=copyOverrides(next.subcatOverrides)},
        mutate:function(next,c){next.branchOverrides[c.name]=branchOverrideEntry(next.branchOverrides[c.name],{subScale:c.v},c.name);branchMembers(c.name).subs.forEach(function(s){next.subcatOverrides[s]=subcatOverrideEntry(next.subcatOverrides[s],{length:bakedSubBase(s,"length")*c.v})})},
        applyMsg:"Branch subcategory spokes updated",
        scope:function(c){return scopedScope("applyBranchSubLen",c.name)},
        resync:function(next,c){var el=document.getElementById("layoutBranchSubLen");if(el)el.value=String(c.v);if(c.out)c.out.textContent=c.v.toFixed(2)+"×"},
        metric:true},
      branchKinkLen:{divert:["branch","kinks","branchKinkLen"],
        guard:function(){var name=document.getElementById("layoutBranch").value;if(!name)return null;return{name:name}},
        read:function(c){var v=Number(document.getElementById("layoutBranchKinkLen").value)||1,out=document.getElementById("layoutBranchKinkLenValue");if(out)out.textContent=v.toFixed(2)+"×";c.v=v;c.out=out},
        prepStores:function(next){next.branchOverrides=copyOverrides(next.branchOverrides);next.kinkOverrides=copyOverrides(next.kinkOverrides);next.subcatOverrides=copyOverrides(next.subcatOverrides)},
        mutate:function(next,c){next.branchOverrides[c.name]=branchOverrideEntry(next.branchOverrides[c.name],{kinkScale:c.v},c.name);var members=branchMembers(c.name),cloudSubs={};members.kinks.forEach(function(e){if(e.subcategory){cloudSubs[e.subcategory]=true}else{next.kinkOverrides[e.id]=kinkOverrideEntry(bakedKinkBase(e.id)*c.v)}});Object.keys(cloudSubs).forEach(function(s){next.subcatOverrides[s]=subcatOverrideEntry(next.subcatOverrides[s],{cloud:bakedSubBase(s,"cloud")*c.v})})},
        applyMsg:"Branch kink spokes updated",
        scope:function(c){return scopedScope("applyBranchKinkLen",c.name)},
        resync:function(next,c){var el=document.getElementById("layoutBranchKinkLen");if(el)el.value=String(c.v);if(c.out)c.out.textContent=c.v.toFixed(2)+"×"},
        metric:true},
      kinkLen:{divert:["kink","kinks","kinkLen"],
        guard:function(){var id=document.getElementById("layoutKink").value;if(!id)return null;return{id:id}},
        read:function(c){var base=bakedKinkBase(c.id),abs=relClamp(document.getElementById("layoutKinkLen").value)*base,lenOut=document.getElementById("layoutKinkLenValue");if(lenOut)lenOut.textContent=fmtLen(abs);c.base=base;c.abs=abs;c.lenOut=lenOut},
        prepStores:function(next){next.kinkOverrides=copyOverrides(next.kinkOverrides)},
        mutate:function(next,c){next.kinkOverrides[c.id]=kinkOverrideEntry(c.abs)},
        applyMsg:"Topic override updated",
        scope:function(c){return scopedScope("applyKink",branchOfKink(c.id))},
        resync:function(next,c){var lenEl=document.getElementById("layoutKinkLen");if(lenEl)lenEl.value=String(relClamp(next.kinkOverrides[c.id].length/c.base));if(c.lenOut)c.lenOut.textContent=fmtLen(next.kinkOverrides[c.id].length)},
        metric:true},
      kinkAngle:{divert:["kink","kinks","kinkAngle"],
        guard:function(){var id=document.getElementById("layoutKink").value;if(!id)return null;return{id:id}},
        read:function(c){var angOut=document.getElementById("layoutKinkAngleValue");if(angOut)angOut.textContent=Number(document.getElementById("layoutKinkAngle").value).toFixed(1)+"°";c.angOut=angOut},
        prepStores:function(next){next.kinkAngleOffsets=copyOverrides(next.kinkAngleOffsets)},
        mutate:function(next,c){var av=Number(document.getElementById("layoutKinkAngle").value);c.av=av;setAngleOffset(next.kinkAngleOffsets,c.id,av)},
        applyMsg:"Topic angle updated",
        scope:function(c){return scopedScope("applyKinkAngle",branchOfKink(c.id))},
        resync:function(next,c){var angEl=document.getElementById("layoutKinkAngle");if(angEl)angEl.value=String(c.av);if(c.angOut)c.angOut.textContent=Number(c.av).toFixed(1)+"°"},
        metric:true},
      subcatLen:{divert:["subcat","subs","subcatLen"],
        guard:function(){var name=document.getElementById("layoutSubcat").value;if(!name)return null;return{name:name}},
        read:function(c){var base=bakedSubBase(c.name,"length"),abs=relClamp(document.getElementById("layoutSubcatLen").value)*base,lenOut=document.getElementById("layoutSubcatLenValue");if(lenOut)lenOut.textContent=fmtLen(abs);c.base=base;c.abs=abs;c.lenOut=lenOut},
        prepStores:function(next){next.subcatOverrides=copyOverrides(next.subcatOverrides)},
        mutate:function(next,c){next.subcatOverrides[c.name]=subcatOverrideEntry(next.subcatOverrides[c.name],{length:c.abs})},
        applyMsg:"Subcategory override updated",
        scope:function(c){return scopedScope("applySubcatLen",branchOfSubcat(c.name))},
        resync:function(next,c){var lenEl=document.getElementById("layoutSubcatLen");if(lenEl)lenEl.value=String(relClamp(next.subcatOverrides[c.name].length/c.base));if(c.lenOut)c.lenOut.textContent=fmtLen(next.subcatOverrides[c.name].length)},
        metric:true},
      subcatAngle:{divert:["subcat","subs","subcatAngle"],
        guard:function(){var name=document.getElementById("layoutSubcat").value;if(!name)return null;return{name:name}},
        read:function(c){var angOut=document.getElementById("layoutSubcatAngleValue");if(angOut)angOut.textContent=Number(document.getElementById("layoutSubcatAngle").value).toFixed(1)+"°";c.angOut=angOut},
        prepStores:function(next){next.subcatAngleOffsets=copyOverrides(next.subcatAngleOffsets)},
        mutate:function(next,c){var av=Number(document.getElementById("layoutSubcatAngle").value);c.av=av;setAngleOffset(next.subcatAngleOffsets,c.name,av)},
        applyMsg:"Subcategory angle updated",
        scope:function(c){return scopedScope("applySubcatAngle",branchOfSubcat(c.name))},
        resync:function(next,c){var angEl=document.getElementById("layoutSubcatAngle");if(angEl)angEl.value=String(c.av);if(c.angOut)c.angOut.textContent=Number(c.av).toFixed(1)+"°"},
        metric:true},
      subcatSpokeAutoShrink:lrShrinkActuator({scope:"subcat",map:"subcatSpokeAutoShrink",checkbox:"layoutSubcatSpokeAutoShrink",divert:["subcat","subs","subcatSpokeAutoShrink"],msg:"Subcategory spoke auto-shrink updated",scopeName:"applySubcatSpokeAutoShrink"})
    };
    // The one actuator: guard on selection, consult live level state
    // for the apply-to-all divert (F2), read + preview the value, then
    // collect, copy the control's stores, mutate one field, run the
    // central apply(), re-sync the control, and re-measure where the
    // original control did.
    function lrActuate(d,a,b){
      var c=d.guard(a,b);if(!c)return;
      if(d.divert&&lrG3Divert(d.divert[0],d.divert[1],d.divert[2]))return;
      if(d.read)d.read(c);
      var next=collect();d.prepStores(next);d.mutate(next,c);
      apply(next,d.applyMsg,d.scope(c));
      if(d.resync)d.resync(next,c);
      if(d.metric)scheduleMetric();
    }
    function applyBranchLen(){lrActuate(LR_ACT.branchLen)}
    function applyBranchAngle(){lrActuate(LR_ACT.branchAngle)}
    // G3d completion (Group 4): the four auto-shrink toggles now
    // DISPLAY armed state only — checked exactly when the group's
    // map value is explicit true. A group whose saved state lacks
    // the key (or holds false) shows unticked, so the FIRST click to
    // ON writes explicit true and engages the shrink in one click;
    // previously absence displayed as ticked, so the first click
    // only wrote false and a second OFF->ON flip was needed to arm.
    // Boot geometry is unchanged: no state is written until a click.
    // Auto-shrink arming (Group 3d, Build 2026-10-20_0814; compaction
    // factors added Build 2026-10-20_0853): switching a group's
    // auto-shrink ON now stores an explicit true instead of deleting
    // the entry. The layout engine treats an explicit true as armed:
    // the layout stage applies the shrink-mode compaction factor to
    // that group (clouds 0.74x, spokes 0.76x) in ANY collision mode —
    // so switching on visibly shrinks that cloud on the spot — and the
    // group's shrink moves also stay available in Grow-only mode,
    // whose candidate filter otherwise discards every shrink move
    // before the per-group gates are consulted (which left all four
    // auto-shrink toggles inert at the shipped defaults). false still
    // forbids shrink outright and drops the factor; an untouched
    // group (no entry) keeps following the global collision mode
    // exactly as before.
    // Shrink-cluster busy signal (S3): a click in this cluster used
    // to block for seconds in the synchronous scoped solve with no
    // feedback at all — the check painted only when the handler
    // finally returned. shrinkBusy paints the busy state FIRST:
    // aria-busy="true" on the layout editor region, a progress
    // cursor, and a working state on the toggled control, with the
    // control's pre-click face restored so the new check lands with
    // the work, not with the click. It then yields two animation
    // frames so that state actually renders, and only then runs the
    // unchanged handler; the busy state clears when the solve
    // completes. The solve itself and its results are untouched.
    function shrinkBusy(inputEl,fn){
      return new Promise(function(resolve){
        var region=document.getElementById("layoutEditor");
        var label=inputEl&&inputEl.closest?inputEl.closest("label"):null;
        var target=inputEl?inputEl.checked:null;
        if(inputEl)inputEl.checked=!target;
        if(region)region.setAttribute("aria-busy","true");
        document.documentElement.classList.add("shrink-busy");
        if(label)label.classList.add("is-busy");
        function run(){
          if(inputEl)inputEl.checked=target;
          try{fn()}catch(e){__sxErrLog("shrink-busy",e)}
          if(region)region.removeAttribute("aria-busy");
          document.documentElement.classList.remove("shrink-busy");
          if(label)label.classList.remove("is-busy");
          resolve();
        }
        if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(run,0)})});
        else setTimeout(run,0);
      });
    }
    // Settle honesty (S6): a scoped apply paints at once, but the
    // deferred whole-map settle lands ~20 s later, when the
    // bundle's blit rest-timer ends the session and forces a full
    // repaint — after which displayed values can change. This is
    // presentation only: the shell watches the bundle's own
    // blit-session log entries (a "start" means a settle is owed,
    // the matching "end" means it has landed) and shows
    // "settling…" in the layout status area until it lands. The
    // settle itself is never retimed, triggered, or skipped here.
    var settlePending=false,settleTimer=null,settleArmDeadline=0,dkReceipt=null;
    function blitSessionActive(){
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.anneal;
      if(!dk||typeof dk.log!=="function")return null;
      var log;try{log=dk.log()}catch(e){return null}
      var active=null;
      for(var i=0;i<log.length;i++){var en=log[i];if(en&&en.type==="blit-session")active=en.event==="start"}
      return active;
    }
    function renderSettleUI(){
      var el=document.getElementById("layoutSettleStatus");
      if(el){el.hidden=!settlePending;if(settlePending)el.textContent="settling…"}
      if(dkReceipt)renderDkReceipt();
    }
    function onSettleLanded(){
      scheduleMetric();
      autofitOnSettleLanded();
      if(dkReceipt&&dkReceipt.awaitingSettle){
        dkReceipt.awaitingSettle=false;
        var rc=dkReceipt,api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.anneal;
        try{var lg=dk&&typeof dk.log==="function"?dk.log():null;if(lg)for(var li=lg.length-1;li>=0;li--){var le=lg[li];if(le&&le.type==="anneal-settle"){rc.anneal={E_start:le.E_start,E_end:le.E_end,sweeps:le.sweeps,uphill_count:le.uphill_count};break}}}catch(e){}
        if(dk&&typeof dk.measureCloud==="function"&&rc.before!=null){
          dk.measureCloud(rc.name).then(function(v){
            if(dkReceipt!==rc)return;
            if(v!=null&&Number.isFinite(Number(v))){rc.after=Number(v);rc.delta=rc.after-rc.before}
            // (The post-settle area re-measure was removed with the
            // area observation, M1 2026-10-29; its commented-out copy
            // was deleted 2026-10-30 — see the bundle's removal record
            // at measureCloud. The receipt below re-renders from the
            // crossing values only.)
            if (rc.startedAtMs) rc.elapsed = ((Date.now()-rc.startedAtMs)/1000).toFixed(1)+" s";
            renderDkReceipt();
          },function(){renderDkReceipt()});
        }else renderDkReceipt();
      }
    }
    function settleTick(){
      var active=blitSessionActive();
      if(active===true){
        if(dkReceipt&&dkReceipt.fresh){dkReceipt.awaitingSettle=true;dkReceipt.fresh=false}
        if(!settlePending){settlePending=true;renderSettleUI()}
        return;
      }
      if(settlePending){settlePending=false;renderSettleUI();onSettleLanded();stopSettleWatch();return}
      if(Date.now()>settleArmDeadline){if(dkReceipt)dkReceipt.fresh=false;autofitDismissUnlanded();stopSettleWatch()}
    }
    function stopSettleWatch(){if(settleTimer){clearInterval(settleTimer);settleTimer=null}}
    function noteSettlePending(){
      settleArmDeadline=Date.now()+3000;
      if(!settleTimer)settleTimer=setInterval(settleTick,400);
      settleTick();
    }
    // F6: ONE parameterized change handler for the four self-shrink
    // switches — kind x scope is carried by each call's actuator.
    function bindShrinkSwitch(checkboxId,applyFn){var el=document.getElementById(checkboxId);if(el)el.addEventListener("change",function(){shrinkBusy(this,applyFn).then(noteSettlePending)})}
    function applyBranchSpokeAutoShrink(){lrActuate(LR_ACT.branchSpokeAutoShrink)}
    coalesceSlider(document.getElementById("layoutBranchLen"),applyBranchLen);coalesceSlider(document.getElementById("layoutBranchAngle"),applyBranchAngle);
    function applyBranchSubLen(){lrActuate(LR_ACT.branchSubLen)}
    function applyBranchKinkLen(){lrActuate(LR_ACT.branchKinkLen)}
    coalesceSlider(document.getElementById("layoutBranchSubLen"),applyBranchSubLen);coalesceSlider(document.getElementById("layoutBranchKinkLen"),applyBranchKinkLen);bindShrinkSwitch("layoutBranchSpokeAutoShrink",applyBranchSpokeAutoShrink);document.getElementById("layoutKink").addEventListener("change",function(){syncKink(config());selectOnMap(this.value)});function applyKink(){lrActuate(LR_ACT.kinkLen)}
    function applyKinkAngle(){lrActuate(LR_ACT.kinkAngle)}
    function applySubcatAngle(){lrActuate(LR_ACT.subcatAngle)}
    // Per-subcategory line length (Batch F, Build 2026-10-20_0135):
    // the same relative pattern Batch A set for per-topic length —
    // the slider carries a multiple of the subcategory's shipped
    // tuned length (1.00x = tuned, range 0.25x-2x), the stored value
    // in subcatOverrides[name].length stays absolute, the readout
    // shows the true absolute value, and the entry's other fields
    // (e.g. cloud) are preserved.
    function applySubcatLen(){lrActuate(LR_ACT.subcatLen)}
    coalesceSlider(document.getElementById("layoutSubcatLen"),applySubcatLen);
    coalesceSlider(document.getElementById("layoutKinkLen"),applyKink);
    coalesceSlider(document.getElementById("layoutKinkAngle"),applyKinkAngle);
    function applySubcatSpokeAutoShrink(){lrActuate(LR_ACT.subcatSpokeAutoShrink)}
    coalesceSlider(document.getElementById("layoutSubcatAngle"),applySubcatAngle);bindShrinkSwitch("layoutSubcatSpokeAutoShrink",applySubcatSpokeAutoShrink);
    // AUTOFIT (Group 3d — ruled 2026-10-28: one-shot BUTTON named
    // Autofit, never a toggle; FITS both directions; scope = the
    // selected branch, else the owning branch of the selected
    // sub-group (Q1 — never a surprise whole-map run), else the
    // whole map). The fit itself is computed by the bundle driver
    // (deknotter.computeAutofitPatch — the shrinkKinksToLabel driver
    // pattern, both directions), accumulated as ONE kink-overrides
    // map and landed through the central apply() exactly once, with
    // applyBusyBtn set so the #9 paintbrush pill and the button mark
    // ride the apply. NO armed flag is read or written (the toggle
    // machinery is not used), NO arm box diverts the press, and
    // nothing re-runs on later builds: a re-press is a fresh press
    // that recomputes from the current rendered state. Settle
    // survival is MEASURED, not assumed: when the deferred settle
    // lands, the fitted spokes are re-measured; drift beyond the fit
    // epsilon earns exactly ONE re-fit computed from the settled
    // state, and the second landing only reports.
    var autofitRunning=false,autofitSettleJob=null,autofitBusyTimer=null,autofitJobWatchTimer=null;
    function autofitStatus(msg){var el=document.getElementById("layoutAutofitStatus");if(!el)return;el.hidden=!msg;el.textContent=msg||""}
    // SETTLING ORPHAN — Shape A (ruled 2026-10-29, one job with the
    // overlay gate failsafe): when a settle wait dismisses WITHOUT a
    // landing — the shell watch expiring at its unchanged 3000 ms
    // deadline with no blit session seen active-then-inactive, or
    // the overlay gate's 120 s failsafe — the pending Autofit job is
    // CLOSED here: the job is dropped, the status is rewritten to
    // say the settle did not land (never cleared as if a landing had
    // happened, never "held through the settle"), and no stale
    // re-fit can run later, because autofitOnSettleLanded() returns
    // at once when no job is open. Drift stays drifted until the
    // user presses Autofit again.
    function autofitDismissUnlanded(){
      if(!autofitSettleJob)return false;
      // Only a job actually awaiting a re-check has a pending
      // status to rewrite: a nothing-moved press already reported
      // its completed "already fits" verdict at press time, and
      // overwriting that with a did-not-land message would be its
      // own false claim. Such a job still closes here, silently.
      var awaiting=!!(autofitSettleJob.awaitingRecheck||autofitSettleJob.refitUsed);
      autofitSettleJob=null;
      if(window.__sxAutofitLast)window.__sxAutofitLast.settled={checked:0,drifted:0,unlanded:true};
      if(awaiting)autofitStatus("Autofit: the settle did not land, so the fit was not re-checked. Press Autofit again to re-check the fit.");
      return true;
    }
    // Gate-failsafe entry point: the overlay gate calls this hook
    // from endFinish() on a failsafe dismiss (see the gate's
    // SETTLING FAILSAFE note). The Autofit BUTTON needs no change
    // for that path, by design: the press rides the central apply()
    // with applyBusyBtn set, so the gate's sessionOnDone clears the
    // button's busy mark (and finishes the #9 pill) on ANY
    // endFinish() dismiss, failsafe included; and autofitWatchBusy
    // independently clears the busy mark once the overlay hides
    // (its 250 ms poll, with its own unchanged 480-tick / 120 s
    // cap). Only the job + status surface needed this hook.
    window.__sxAutofitOnGateDismiss=function(){autofitDismissUnlanded()};
    // JOB WATCHDOG (same job, same Shape A, the brief's 120 s
    // bound): the two dismiss paths above still leave one live
    // configuration uncovered — observed twice in probe drives
    // (2026-10-29): the shell watch SEES a blit session and waits
    // for it to end, but in Repulsion a session ends only on a
    // later paint, while the overlay gate's separate session
    // signal has already landed, so neither the shell expiry
    // (unreachable while a session is pending) nor the gate
    // failsafe (gate not stuck) ever fires, and "Checking…" hangs
    // past 130 s. This watchdog belongs to the Autofit job alone:
    // if the job is still open 120 s after the press — the bound
    // ruling 4 sets for this job's surfaces — it closes under
    // Shape A via autofitDismissUnlanded(). It does not touch the
    // shared shell watch (metrics and the anneal receipt keep
    // their exact behaviour), no settling threshold, and no
    // session mechanism; it only stops polling once the job has
    // closed by any path.
    function autofitArmJobWatch(job){
      if(autofitJobWatchTimer)clearInterval(autofitJobWatchTimer);
      autofitJobWatchTimer=setInterval(function(){
        if(autofitSettleJob!==job){clearInterval(autofitJobWatchTimer);autofitJobWatchTimer=null;return}
        if(Date.now()-(job.createdAt||0)>=120000){clearInterval(autofitJobWatchTimer);autofitJobWatchTimer=null;autofitDismissUnlanded()}
      },400);
    }
    function autofitScopeBranches(){
      var b=document.getElementById("layoutBranch"),bv=b?b.value:"";
      if(bv)return{branches:[bv],scoped:true,label:bv};
      var s=document.getElementById("layoutSubcat"),sv=s?s.value:"";
      if(sv){var ob=branchOfSubcat(sv);if(ob)return{branches:[ob],scoped:true,label:ob+" (the branch that owns "+sv+")"}}
      return{branches:branchNames(),scoped:false,label:"the whole map"};
    }
    function autofitClearBusy(btn){
      if(autofitBusyTimer){clearInterval(autofitBusyTimer);autofitBusyTimer=null}
      if(btn){btn.classList.remove("is-busy");btn.removeAttribute("aria-busy")}
      var region=document.getElementById("layoutEditor");if(region)region.removeAttribute("aria-busy");
      document.documentElement.classList.remove("shrink-busy");
      autofitRunning=false;
    }
    function autofitWatchBusy(btn){
      if(autofitBusyTimer)clearInterval(autofitBusyTimer);
      var ticks=0;
      autofitBusyTimer=setInterval(function(){
        ticks++;
        var ov=document.getElementById("mapLoadOverlay");
        if(!ov||ov.hidden||ticks>480)autofitClearBusy(btn);
      },250);
    }
    function autofitMeasureDrift(dk,branches,fittedKeys){
      var m=dk.autofitMeasure(branches),drifted=0,checked=0,maxDev=0;
      if(!m||!m.ok)return null;
      m.items.forEach(function(it){
        if(!fittedKeys[it.key])return;
        if(null==it.delivered||null==it.target||!(it.target>0))return;
        checked++;
        var dev=Math.abs(it.delivered-it.target)/it.target;
        if(dev>maxDev)maxDev=dev;
        if(dev>0.01)drifted++;
      });
      return{checked:checked,drifted:drifted,maxDev:maxDev};
    }
    function autofitApplyOnce(scope){
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.deknotter;
      var res=dk.computeAutofitPatch(scope.branches);
      if(!res||!res.ok){
        autofitStatus("Autofit could not run for "+scope.label+": "+((res&&res.reason)||"the fit driver is unavailable")+". Nothing was changed.");
        return null;
      }
      var next=collect();
      next.kinkOverrides=res.kinkOverrides;
      applyBusyBtn=document.getElementById("layoutAutofitBtn");
      apply(next,"Autofit: kink spokes fitted",scope.scoped?scopedScope("applyAutofit",scope.branches[0]):null);
      noteSettlePending();
      var fitted={};
      res.items.forEach(function(it){if(!it.held)fitted[it.key]=true});
      return{res:res,fitted:fitted};
    }
    function runAutofit(){
      if(autofitRunning)return;
      var btn=document.getElementById("layoutAutofitBtn");
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.deknotter;
      if(!dk||typeof dk.computeAutofitPatch!=="function"||typeof dk.autofitMeasure!=="function"){autofitStatus("Autofit is unavailable in this build — the fit driver did not load. Nothing was changed.");return}
      if(typeof dk.active==="function"&&dk.active()){autofitStatus("Autofit cannot run while an Anneal run is active. Nothing was changed.");return}
      var scope=autofitScopeBranches();
      if(!scope.branches.length){autofitStatus("Nothing to fit yet — no branches have rendered. Open the map first, then press Autofit.");return}
      autofitRunning=true;
      if(btn){btn.classList.add("is-busy");btn.setAttribute("aria-busy","true")}
      var region=document.getElementById("layoutEditor");if(region)region.setAttribute("aria-busy","true");
      document.documentElement.classList.add("shrink-busy");
      autofitStatus("");
      function run(){
        var started=Date.now(),out=null;
        try{out=autofitApplyOnce(scope)}catch(e){__sxErrLog("autofit",e);autofitStatus("Autofit hit an error while fitting — check the error log. The press was reported, not hidden.")}
        if(!out){autofitClearBusy(btn);return}
        var res=out.res,pressMs=Date.now()-started;
        autofitSettleJob={scope:scope,fitted:out.fitted,refitUsed:false,awaitingRecheck:(res.changed>0||Object.keys(out.fitted).length>0),createdAt:Date.now()};
        autofitArmJobWatch(autofitSettleJob);
        window.__sxAutofitLast={scope:scope.label,branches:scope.branches.slice(),changed:res.changed,shortened:res.shortened,lengthened:res.lengthened,held:res.held,skipped:res.skipped,items:res.items,pressMs:pressMs,settled:null};
        autofitStatus(res.changed?("Autofit fitted "+res.changed+" of "+(res.changed+res.held+res.skipped)+" kink spokes in "+scope.label+" — "+res.shortened+" shortened, "+res.lengthened+" lengthened. Checking the fit again once the map settles…"):("Autofit: every kink spoke in "+scope.label+" already fits ("+res.held+" checked). Nothing moved."));
        autofitWatchBusy(btn);
      }
      if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(run,0)})});
      else setTimeout(run,0);
    }
    // A landing whose re-measure yields no verdict (driver gone,
    // measure failed, or no fitted spoke could be re-measured —
    // observed live 2026-10-29: a whole-map press's job closed
    // silently here and the "Checking…" status hung past 130 s)
    // must not close silently either: a job that was awaiting a
    // re-check gets an honest no-verdict status, never a fake
    // "held" and never a hanging "Checking…".
    function autofitCloseUnverified(job){
      autofitSettleJob=null;
      if(job&&(job.awaitingRecheck||job.refitUsed))autofitStatus("Autofit: the map settled, but the fit could not be re-checked — no fitted spokes could be re-measured. Press Autofit again to re-check the fit.");
    }
    function autofitOnSettleLanded(){
      var job=autofitSettleJob;if(!job)return;
      var api=window.__SEXCAPADES_LAYOUT_API,dk=api&&api.deknotter;
      if(!dk||typeof dk.autofitMeasure!=="function"){autofitCloseUnverified(job);return}
      var drift=null;
      try{drift=autofitMeasureDrift(dk,job.scope.branches,job.fitted)}catch(e){__sxErrLog("autofit-settle-measure",e)}
      if(window.__sxAutofitLast)window.__sxAutofitLast.settled=drift;
      if(!drift||!drift.checked){autofitCloseUnverified(job);return}
      if(drift.drifted&&!job.refitUsed){
        job.refitUsed=true;job.awaitingRecheck=true;
        autofitStatus("Autofit: the settle moved "+drift.drifted+" fitted spoke"+(drift.drifted===1?"":"s")+" off their fit lengths — re-fitting once from the settled map…");
        setTimeout(function(){
          if(autofitSettleJob!==job)return;
          var out=null;
          try{out=autofitApplyOnce(job.scope)}catch(e){__sxErrLog("autofit-refit",e)}
          if(out)job.fitted=out.fitted;else autofitCloseUnverified(job);
        },50);
        return;
      }
      autofitSettleJob=null;
      if(drift.drifted)autofitStatus("Autofit: after settling, "+drift.drifted+" of "+drift.checked+" fitted spokes sit off their fit lengths (worst "+(drift.maxDev*100).toFixed(1)+"% off). One automatic re-fit already ran; press Autofit again to re-fit from the current map.");
      else autofitStatus("Autofit held through the settle: all "+drift.checked+" fitted spokes in "+job.scope.label+" are still at their fit lengths.");
    }
    var autofitBtnEl=document.getElementById("layoutAutofitBtn");
    if(autofitBtnEl)autofitBtnEl.addEventListener("click",runAutofit);
    document.getElementById("layoutSubcat").addEventListener("change",function(){syncSubcatAngle(config());selectOnMap(this.value)});
    var spokeAnglesWrap=document.getElementById("layoutSpokeAngles");if(spokeAnglesWrap){var spokeFrame=0,spokePending=null;spokeAnglesWrap.addEventListener("input",function(event){var target=event.target;if(!target||(!target.hasAttribute("data-spoke-angle-range")&&!target.hasAttribute("data-spoke-angle-number")))return;var row=target.closest?target.closest("[data-spoke-angle-name]"):null;if(!row)return;spokePending={name:row.getAttribute("data-spoke-angle-name"),value:target.value};if(spokeFrame)return;spokeFrame=requestAnimationFrame(function(){spokeFrame=0;var p=spokePending;spokePending=null;if(p)applySpokeAngle(p.name,p.value)})});spokeAnglesWrap.addEventListener("change",function(event){var target=event.target;if(!target)return;var isRange=target.hasAttribute("data-spoke-angle-range"),isNum=target.hasAttribute("data-spoke-angle-number");if(!isRange&&!isNum)return;var row=target.closest?target.closest("[data-spoke-angle-name]"):null;if(!row)return;var name=row.getAttribute("data-spoke-angle-name"),had=!!(spokePending&&spokePending.name===name);if(had){spokePending=null;if(spokeFrame){cancelAnimationFrame(spokeFrame);spokeFrame=0}}if(had||isNum)applySpokeAngle(name,target.value)})}
    var spokeAnglesReset=document.getElementById("layoutSpokeAnglesReset");if(spokeAnglesReset)spokeAnglesReset.addEventListener("click",function(){var next=collect();next.branchOverrides=copyOverrides(next.branchOverrides);Object.keys(next.branchOverrides).forEach(function(key){next.branchOverrides[key]=branchOverrideEntry(next.branchOverrides[key],{angle:0},key)});apply(next)});
    // Restore shipped tilts (Group 4, G4-9): "Reset all tilts" zeroes
    // every tilt with no way back; this companion restores the baked
    // tilts from __SEXCAPADES_LAYOUT_DEFAULTS exactly — branch tilt
    // angles (preserving each branch's current length), plus the
    // shipped sub-group and per-topic tilt offset maps wholesale.
    var spokeAnglesRestore=document.getElementById("layoutSpokeAnglesRestore");if(spokeAnglesRestore)spokeAnglesRestore.addEventListener("click",function(){var defaults=window.__SEXCAPADES_LAYOUT_DEFAULTS||{},next=collect();next.branchOverrides=copyOverrides(next.branchOverrides);var shippedAngles={};Object.keys(defaults.branchOverrides||{}).forEach(function(k){var a=defaults.branchOverrides[k]?Number(defaults.branchOverrides[k].angle):NaN;shippedAngles[k]=Number.isFinite(a)?a:0});Object.keys(next.branchOverrides).forEach(function(key){next.branchOverrides[key]=branchOverrideEntry(next.branchOverrides[key],{angle:shippedAngles[key]||0},key)});Object.keys(shippedAngles).forEach(function(key){if(!next.branchOverrides[key])next.branchOverrides[key]=branchOverrideEntry(null,{angle:shippedAngles[key]},key)});next.subcatAngleOffsets=copyOverrides(defaults.subcatAngleOffsets||{});next.kinkAngleOffsets=copyOverrides(defaults.kinkAngleOffsets||{});apply(next)});
    document.getElementById("layoutClearSelection").addEventListener("click",function(){clearSelectionUI()});
    // Fastest performance preset (Batch F, Build 2026-10-20_0135):
    // one click sets the cheapest settings combination — Animations
    // off, the push-apart gate off, Push-apart strength 0, overlap
    // fixing on Grow only, and Measurements off. Grow only is the
    // cheapest collision mode that stays correct for the tuned map:
    // Grow + Shrink runs two adjustment passes, and Off re-bases
    // every spoke length (x0.56-0.62 per its own tooltip), which
    // would redraw the tuned layout — a geometry change, not a
    // setting. The preset goes through collect(), so every override,
    // length, tilt and angle is carried over verbatim; metrics are
    // switched off through the same state the Measurements dropdown
    // and the cross-window replay use, so the change rides the
    // Batch C live-sync payload (collectEditorState reads metricId)
    // like any other editor change.
    var fastestBtn=document.getElementById("layoutFastest");
    if(fastestBtn)fastestBtn.addEventListener("click",function(){
      metricId="off";metricOn=false;if(metricSelect)metricSelect.value="off";if(metricButton)metricButton.disabled=true;stopMetricBusy();clearMetricGlobal();metricRun++;metricGlobalRun++;if(metricTimer)clearTimeout(metricTimer);clearMetricOverlay();
      var animEl=document.getElementById(ids.animations);if(animEl)animEl.checked=false;
      var repGate=document.getElementById(ids.repulsionEnabled);if(repGate)repGate.checked=false;
      var repEl=document.getElementById(ids.repulsion);if(repEl)repEl.value="0";
      var colGate=document.getElementById(ids.collisionEnabled);if(colGate)colGate.checked=true;
      setCollisionMode("grow");/* LR-G5: Fastest used to set the hidden select to Grow only; it now presses Grow in the visible group before collect() reads the mode from it */
      lastCollision="grow";
      apply(collect(),"Fastest settings applied");
    });
    document.getElementById("layoutReset").addEventListener("click",function(){var defaults=Object.assign({},window.__SEXCAPADES_LAYOUT_DEFAULTS,{branchOverrides:copyOverrides(window.__SEXCAPADES_LAYOUT_DEFAULTS.branchOverrides||{}),subcatOverrides:copyOverrides(window.__SEXCAPADES_LAYOUT_DEFAULTS.subcatOverrides||{}),kinkOverrides:copyOverrides(window.__SEXCAPADES_LAYOUT_DEFAULTS.kinkOverrides||{})});lastCollision="grow";try{window.localStorage&&window.localStorage.removeItem("sexcapades-layout-branchOrder");window.localStorage&&window.localStorage.removeItem("sexcapades-layout-savedDefaults");window.localStorage&&window.localStorage.removeItem("sexcapades-layout-liveSettings")}catch (error) { __sxErrLog("layout-storage", error); }/* Q11 AS AMENDED (Layout groups Phase 3): Reset also returns Measurements to Off and the on-map numbers overlay to OFF — the same off sequence the Fastest preset and the cross-window replay use, so the dropdown, the Calculate button, the strip's chip state and the overlay checkbox all land together. This supersedes the printed Q11 (a) (overlay to ON). Power user is deliberately not touched: whatever state it is in survives Reset. */metricId="off";metricOn=false;if(metricSelect)metricSelect.value="off";if(metricButton)metricButton.disabled=true;stopMetricBusy();clearMetricGlobal();metricRun++;metricGlobalRun++;if(metricTimer)clearTimeout(metricTimer);clearMetricOverlay();syncMetricStrip();metricOverlayOn=false;if(metricOverlayToggle)metricOverlayToggle.checked=false;clearMetricOverlay();applyBusyBtn=document.getElementById("layoutReset");liveSyncMuted=true;apply(defaults,"Defaults restored");liveSyncMuted=false});
    function settingsHash(){var c=collect(),parts=[(bundles[c.spacing]?"layout-spacing="+c.spacing:""),"layout-branchOrder="+(c.branchOrder||"landscape-antipodal"),"layout-propFan="+(c.propFan?1:0),"layout-subcatOrder="+(c.subcatOrder?1:0),"layout-staggerDensity="+(c.staggerDensity?1:0),"layout-stagger="+(c.stagger?1:0),"layout-expandAll="+(c.expandAll?1:0),"layout-collision="+c.collision,"layout-crossmin="+(c.crossmin?1:0),"layout-nudge="+(c.nudge?1:0),"layout-showRelations="+(c.showRelations?1:0),"layout-spokeLen="+c.spokeLen.toFixed(2),"layout-subLen="+c.subLen.toFixed(2),"layout-pad="+c.pad.toFixed(2),"layout-repulsion="+c.repulsion.toFixed(2),"layout-repulsionEnabled="+(c.repulsionEnabled===false?0:1),"layout-staticMap="+(c.staticMap?1:0),"layout-animations="+(c.animations?1:0),"layout-mapSliders="+(c.mapSliders?1:0),"layout-fontScale="+(Number(c.fontScale)||1).toFixed(2),"layout-centerRingScale="+(Number(c.centerRingScale)||1).toFixed(2),"layout-leafOvergrowth="+(Number(c.leafOvergrowth)||300),"layout-autoShrinkFactor="+(Number(c.autoShrinkFactor)||.76).toFixed(2),"layout-subcatCloudShrinkFactor="+(Number(c.subcatCloudShrinkFactor)||.76).toFixed(2)],overrides=c.branchOverrides||{};if(Object.keys(overrides).length){var packed=btoa(unescape(encodeURIComponent(JSON.stringify(overrides)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");parts.push("layout-branches="+packed)}var extraGroups=[["layout-subcatOverrides",c.subcatOverrides],["layout-kinkOverrides",c.kinkOverrides],["layout-subcatAngleOffsets",c.subcatAngleOffsets],["layout-kinkAngleOffsets",c.kinkAngleOffsets],["layout-branchSpokeAutoShrink",c.branchSpokeAutoShrink],["layout-subcatSpokeAutoShrink",c.subcatSpokeAutoShrink]];extraGroups.forEach(function(pair){var obj=pair[1]||{};if(Object.keys(obj).length){parts.push(pair[0]+"="+btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,""))}});return "#"+parts.join("&")}
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
    function forallApply(mutator){var next=collect();mutator(next);apply(next);scheduleMetric()}
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
    var leMapKeys=["branchOverrides","subcatOverrides","kinkOverrides","subcatAngleOffsets","kinkAngleOffsets","branchSpokeAutoShrink","subcatSpokeAutoShrink"];
    function lePlainObject(v){return !!v&&typeof v==="object"&&!Array.isArray(v)}
    function leValidateMap(map){if(!lePlainObject(map))return false;var keys=Object.keys(map);for(var i=0;i<keys.length;i++){var entry=map[keys[i]];if(typeof entry==="boolean")continue;if(typeof entry==="number"){if(!Number.isFinite(entry))return false;continue}if(!lePlainObject(entry))return false;var sub=Object.keys(entry);for(var j=0;j<sub.length;j++){var val=entry[sub[j]];if(typeof val==="boolean")continue;if(typeof val==="number"&&Number.isFinite(val))continue;return false}}return true}
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
      var next=collect();
      Object.keys(picked).forEach(function(k){next[k]=picked[k]});
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
      var groups=[["layout-branches","branchOverrides"],["layout-subcatOverrides","subcatOverrides"],["layout-kinkOverrides","kinkOverrides"],["layout-subcatAngleOffsets","subcatAngleOffsets"],["layout-kinkAngleOffsets","kinkAngleOffsets"],["layout-branchSpokeAutoShrink","branchSpokeAutoShrink"],["layout-subcatSpokeAutoShrink","subcatSpokeAutoShrink"]];
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
