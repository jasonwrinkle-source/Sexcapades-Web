    function dismissUiTooltip(){var tip=document.getElementById("uiTooltip");if(tip&&!tip.hidden){tip.hidden=true;var described=document.querySelector("[aria-describedby='uiTooltip']");if(described)described.removeAttribute("aria-describedby")}}
    panel.addEventListener("click",function(){dismissUiTooltip()},true);
    document.addEventListener("keydown",function(event){if(event.key==="Escape")dismissUiTooltip()});
    try{var uiTipEl=document.getElementById("uiTooltip");if(uiTipEl){var uiTipTimer=null;new MutationObserver(function(){if(uiTipTimer){clearTimeout(uiTipTimer);uiTipTimer=null}if(!uiTipEl.hidden&&!panel.hidden)uiTipTimer=setTimeout(dismissUiTooltip,3400)}).observe(uiTipEl,{attributes:true,attributeFilter:["hidden","class","style"]})}}catch (e) { __sxErrLog("ui-tooltip-dismiss", e); }
    window.__SEXCAPADES_LAYOUT_UI={open:open,close:shut,selectNode:selectNode,clearSelection:clearSelectionUI,applyEditorState:applyEditorState,sync:sync,toggleAnnealFromNode:toggleAnnealFromNode};close.addEventListener("click",shut);
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
    // % spoke length of node name (was % kink leaf overgrowth):
    // one percent of the node name's length drives BOTH the Anneal
    // throw's leaf length and what Autofit delivers. 100% is the minimum
    // and default, framing the node label cleanly with standard hub and
    // leaf badge clearance.
    coalesceSlider(document.getElementById(ids.leafOvergrowth),function(){var v=Math.max(100,Number(this.value)||100),out=document.getElementById("layoutLeafOvergrowthValue");if(out)out.textContent=Math.round(v)+"%";var num=document.getElementById("layoutLeafOvergrowthNum");if(num&&document.activeElement!==num)num.value=String(v);apply(collect());this.value=String(v);if(out)out.textContent=Math.round(v)+"%";scheduleMetric()});
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
      syncNodeOverrides(next);
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
      syncNodeOverrides(next);
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
    document.getElementById("layoutReset").addEventListener("click",function(){var defaults=Object.assign({},window.__SEXCAPADES_LAYOUT_DEFAULTS,{branchOverrides:copyOverrides(window.__SEXCAPADES_LAYOUT_DEFAULTS.branchOverrides||{}),subcatOverrides:copyOverrides(window.__SEXCAPADES_LAYOUT_DEFAULTS.subcatOverrides||{}),kinkOverrides:copyOverrides(window.__SEXCAPADES_LAYOUT_DEFAULTS.kinkOverrides||{}),nodeOverrides:copyOverrides(window.__SEXCAPADES_LAYOUT_DEFAULTS.nodeOverrides||{})});lastCollision="grow";try{window.localStorage&&window.localStorage.removeItem("sexcapades-layout-branchOrder");window.localStorage&&window.localStorage.removeItem("sexcapades-layout-savedDefaults");window.localStorage&&window.localStorage.removeItem("sexcapades-layout-liveSettings")}catch (error) { __sxErrLog("layout-storage", error); }/* Q11 AS AMENDED (Layout groups Phase 3): Reset also returns Measurements to Off and the on-map numbers overlay to OFF — the same off sequence the Fastest preset and the cross-window replay use, so the dropdown, the Calculate button, the strip's chip state and the overlay checkbox all land together. This supersedes the printed Q11 (a) (overlay to ON). Power user is deliberately not touched: whatever state it is in survives Reset. */metricId="off";metricOn=false;if(metricSelect)metricSelect.value="off";if(metricButton)metricButton.disabled=true;stopMetricBusy();clearMetricGlobal();metricRun++;metricGlobalRun++;if(metricTimer)clearTimeout(metricTimer);clearMetricOverlay();syncMetricStrip();metricOverlayOn=false;if(metricOverlayToggle)metricOverlayToggle.checked=false;clearMetricOverlay();applyBusyBtn=document.getElementById("layoutReset");liveSyncMuted=true;apply(defaults,"Defaults restored");liveSyncMuted=false});
