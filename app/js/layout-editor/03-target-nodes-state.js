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
    function collect(){var c=config(),enabled=document.getElementById(ids.collisionEnabled).checked,mode=collisionModeValue();var res={spacing:spacingNameFor({spokeLen:(Number(document.getElementById(ids.spokeLen).value)||1)*bakedSpokeBase(),subLen:Number(document.getElementById(ids.subLen).value),pad:Number(document.getElementById(ids.pad).value),repulsion:Number(document.getElementById(ids.repulsion).value)}),branchOrder:branchOrderSelection(),propFan:document.getElementById(ids.propFan).checked,subcatOrder:document.getElementById(ids.subcatOrder).checked,staggerDensity:document.getElementById(ids.staggerDensity).checked,stagger:document.getElementById(ids.stagger).checked,expandAll:document.getElementById(ids.expandAll).checked,crossmin:document.getElementById(ids.crossmin).checked,nudge:document.getElementById(ids.nudge).checked,showRelations:document.getElementById(ids.showRelations).checked,repulsionEnabled:document.getElementById(ids.repulsionEnabled).checked,staticMap:document.getElementById(ids.staticMap).checked,animations:document.getElementById(ids.animations).checked,mapSliders:Boolean(document.getElementById(ids.mapSliders)&&document.getElementById(ids.mapSliders).checked),collision:enabled?(mode==="off"?lastCollision:mode):"off",spokeLen:(Number(document.getElementById(ids.spokeLen).value)||1)*bakedSpokeBase(),subLen:Number(document.getElementById(ids.subLen).value),pad:Number(document.getElementById(ids.pad).value),repulsion:Number(document.getElementById(ids.repulsion).value),fontScale:Number(document.getElementById(ids.fontScale).value),centerRingScale:Number(document.getElementById(ids.centerRingScale).value),leafOvergrowth:Number(document.getElementById(ids.leafOvergrowth).value),autoShrinkFactor:Number(document.getElementById(ids.autoShrinkFactor).value),subcatCloudShrinkFactor:Number(document.getElementById(ids.subcatCloudShrinkFactor).value),branchOverrides:copyOverrides(c.branchOverrides),subcatOverrides:copyOverrides(c.subcatOverrides||{}),kinkOverrides:copyOverrides(c.kinkOverrides||{}),nodeOverrides:copyOverrides(c.nodeOverrides||{}),subcatAngleOffsets:copyOverrides(c.subcatAngleOffsets||{}),kinkAngleOffsets:copyOverrides(c.kinkAngleOffsets||{}),branchSpokeAutoShrink:Object.assign({},c.branchSpokeAutoShrink||{}),subcatSpokeAutoShrink:Object.assign({},c.subcatSpokeAutoShrink||{}),solverMidline:c.solverMidline||(window.__SEXCAPADES_LAYOUT&&window.__SEXCAPADES_LAYOUT.solverMidline)||"off"};syncNodeOverrides(res);return res}
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
    function apply(next,msg,scope){if(next&&typeof next==="object"){unpackNodeOverrides(next);syncNodeOverrides(next)}var btnForApply=applyBusyBtn;applyBusyBtn=null;var skipBundleApply=false;if(next&&window.__SEXCAPADES_LAYOUT_API){try{skipBundleApply=stableSettingsString(next)===stableSettingsString(config())}catch (e) { __sxErrLog("layout-apply-compare", e); }}var mutedAtCall=liveSyncMuted;var chunkArmed=false;/* #9: arm the paintbrush pill for this apply, wired EXPLICITLY to the button this caller named via applyBusyBtn (btnForApply) — never assumed populated. The pill finishes on the SAME signal that clears the button today: the overlay session's onDone on the armed path (so it spans the settle tail through the map-complete gate), or runApply()'s return on the unarmed synchronous path. */var pillToken=null;if(!skipBundleApply&&next&&window.__SEXCAPADES_LAYOUT_API&&typeof window.__sxPillSessionStart==="function"){try{pillToken=window.__sxPillSessionStart({button:btnForApply||null})}catch(e){__sxErrLog("layout-apply-pill-arm",e)}}function pillDone(){if(!pillToken)return;var t=pillToken;pillToken=null;try{window.__sxPillSessionFinish(t)}catch(e){__sxErrLog("layout-apply-pill-finish",e)}}function runApply(){var prevMute=liveSyncMuted;liveSyncMuted=mutedAtCall;function postApply(){if(window.__sxSyncMapFontBase)window.__sxSyncMapFontBase();var ecr=document.querySelector(".empty-center-ring");if(ecr)ecr.setAttribute("r",String(133*(Number(next&&next.centerRingScale)||1)));sync();scheduleScores();scheduleMetric();scheduleLiveSync();liveSyncMuted=prevMute;}if(!skipBundleApply){var layoutApi=window.__SEXCAPADES_LAYOUT_API;if(layoutApi){if(chunkArmed&&layoutApi.applyChunked){layoutApi.applyChunked(next,scope).then(postApply,function(e){__sxErrLog("layout-apply-chunked",e);postApply();});return;}if(scope&&layoutApi.applyScoped)layoutApi.applyScoped(next,scope);else layoutApi.apply(next)}else Object.assign(window.__SEXCAPADES_LAYOUT,next)}postApply();}if(!skipBundleApply&&window.__SEXCAPADES_LAYOUT_API&&typeof window.__sxLoadSessionStart==="function"){var armed=false;try{armed=window.__sxLoadSessionStart({msg:(typeof msg==="string"&&msg)?msg:null,onDone:function(){pillDone();if(btnForApply){btnForApply.classList.remove("is-busy");btnForApply.removeAttribute("aria-busy");}}})}catch(e){__sxErrLog("layout-apply-arm",e)}if(armed){chunkArmed=true;if(btnForApply){btnForApply.classList.add("is-busy");btnForApply.setAttribute("aria-busy","true")}if(window.requestAnimationFrame)requestAnimationFrame(function(){requestAnimationFrame(function(){setTimeout(runApply,0)})});else setTimeout(runApply,0);return;}}runApply();pillDone();}
    // Selectable layout metric framework. window.LayoutMetrics is a registry:
    // adding a future metric = LayoutMetrics.register('id',{label,tooltip,compute}).
    // compute(ctx, done, isCancelled): ctx={svg}; done({value,text}) when finished.
    // Heavy metrics MUST chunk via requestIdleCallback and check isCancelled() between chunks.
    // SOLVER-METRICS REFACTOR (F7): MEASUREMENT SUBSTRATES. Every
    // registry entry (and its defs.*.clouds walk) names its substrate:
