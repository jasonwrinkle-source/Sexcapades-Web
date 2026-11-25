
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
    // copyOverrides: shallow-copy each entry. Object-valued entries
    // (branch/subcat/kink overrides, angle offsets) are copied;
    // scalar leaves (the shrink-flag maps are boolean-valued) pass
    // through verbatim — Object.assign({}, true) is {}, which used
    // to fold every armed shrink flag to an empty object on import.
    function copyOverrides(value){var out={};Object.keys(value||{}).forEach(function(key){var v=value[key];out[key]=(v&&typeof v==="object")?Object.assign({},v):v});return out}
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
    function nodeOverrideEntry(prev,patch,nodeId,depth){var entry=Object.assign({},prev||{},patch||{});if(depth!==undefined&&entry.depth===undefined)entry.depth=depth;if(nodeId&&entry.nodeId===undefined)entry.nodeId=nodeId;return entry}
    function syncNodeOverrides(target){
      if(!target||typeof target!=="object")return;
      if(!target.nodeOverrides||typeof target.nodeOverrides!=="object")target.nodeOverrides={};
      var no=target.nodeOverrides;
      if(target.branchOverrides&&typeof target.branchOverrides==="object"){
        Object.keys(target.branchOverrides).forEach(function(name){
          var bo=target.branchOverrides[name];
          if(bo&&typeof bo==="object")no[name]=Object.assign({},no[name]||{},bo,{depth:1,kind:"branch"});
        });
      }
      if(target.subcatOverrides&&typeof target.subcatOverrides==="object"){
        Object.keys(target.subcatOverrides).forEach(function(name){
          var so=target.subcatOverrides[name];
          if(so&&typeof so==="object")no[name]=Object.assign({},no[name]||{},so,{depth:2,kind:"subcat"});
        });
      }
      if(target.kinkOverrides&&typeof target.kinkOverrides==="object"){
        Object.keys(target.kinkOverrides).forEach(function(id){
          var ko=target.kinkOverrides[id];
          if(ko&&typeof ko==="object")no[id]=Object.assign({},no[id]||{},ko,{depth:3,kind:"kink"});
        });
      }
    }
    function unpackNodeOverrides(target){
      if(!target||!target.nodeOverrides||typeof target.nodeOverrides!=="object")return;
      if(!target.branchOverrides)target.branchOverrides={};
      if(!target.subcatOverrides)target.subcatOverrides={};
      if(!target.kinkOverrides)target.kinkOverrides={};
      Object.keys(target.nodeOverrides).forEach(function(key){
        var entry=target.nodeOverrides[key];
        if(!entry||typeof entry!=="object")return;
        if(entry.kind==="branch"||(entry.depth===1&&entry.length!==undefined)||(target.branchOverrides&&target.branchOverrides[key]!==undefined)){
          target.branchOverrides[key]=branchOverrideEntry(target.branchOverrides[key],entry,key);
        }else if(entry.kind==="subcat"||entry.cloud!==undefined||(target.subcatOverrides&&target.subcatOverrides[key]!==undefined)){
          target.subcatOverrides[key]=subcatOverrideEntry(target.subcatOverrides[key],entry);
        }else if(entry.kind==="kink"||key.charAt(0)==="t"||(target.kinkOverrides&&target.kinkOverrides[key]!==undefined)){
          if(!target.kinkOverrides[key]||target.kinkOverrides[key].length===undefined)target.kinkOverrides[key]=kinkOverrideEntry(entry.length);
        }
      });
    }
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
    function bakedNodeBase(id,field){var d=window.__SEXCAPADES_LAYOUT_DEFAULTS;if(d&&d.nodeOverrides&&d.nodeOverrides[id]){var v=Number(d.nodeOverrides[id][field||"length"]);if(v>0)return v}if(field==="cloud"||bakedSubBase(id,field)>0)return bakedSubBase(id,field);if(bakedKinkBase(id)>0)return bakedKinkBase(id);if(bakedBranchBase(id)>0)return bakedBranchBase(id);return 1}
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
