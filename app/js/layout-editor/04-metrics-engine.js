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
      var branches=branchNames(),i;
      for(i=0;i<branches.length;i++)if(branches[i]===key)return branches[i];
      if(key.indexOf("cat-")===0){var slug=key.slice(4);for(i=0;i<branches.length;i++)if(slugify(branches[i])===slug)return branches[i];}
      if(key.indexOf("subcategory-")===0){var rest=key.slice(12);for(i=0;i<branches.length;i++){var bs=slugify(branches[i]);if(rest===bs||rest.indexOf(bs+"-")===0)return branches[i]}}
      var tax=taxonomy();
      if(tax&&tax.categories){
        for(i=0;i<tax.categories.length;i++){
          var cat=tax.categories[i];
          if(cat.id===key||cat.name===key||slugify(cat.name)===key)return cat.name;
          var subs=cat.subcategories||[];
          for(var j=0;j<subs.length;j++){
            if(subs[j].id===key||subs[j].name===key||slugify(subs[j].name)===key)return cat.name;
          }
        }
      }
      var entry=topicEntry(key);
      if(entry&&entry.category)return entry.category;
      if(key.indexOf("topic-")===0){var trest=key.slice(6);for(i=0;i<branches.length;i++){var bs2=slugify(branches[i]);if(trest.indexOf(bs2+"-")===0)return branches[i]}}
      return null;
    }
    function subcloudKey(key){
      if(!key)return null;
      var tax=taxonomy(),i,j;
      if(tax&&tax.categories){
        for(i=0;i<tax.categories.length;i++){
          var subs=tax.categories[i].subcategories||[];
          for(j=0;j<subs.length;j++){
            if(subs[j].id===key||subs[j].name===key||slugify(subs[j].name)===key)return subs[j].name;
            if(key.indexOf("subcategory-")===0&&key.slice(12)===slugify(subs[j].name))return subs[j].name;
          }
        }
      }
      var entry=topicEntry(key);
      if(entry&&entry.subcategory)return entry.subcategory;
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
    function subcloudOfEl(el){var key=el.getAttribute("data-id");if(key)return subcloudKey(key);var g=el.closest?el.closest(".node-group[data-layout-key]"):null;return g?subcloudKey(g.getAttribute("data-layout-key")):null}
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
      function chunk(){
        if(isCancelled())return;
        var m=crossingReadout();
        if(!m){done({});return}
        var out={};
        Object.keys(m.clouds||{}).forEach(function(c){out[c]={value:m.clouds[c],text:crossingText(m.clouds[c])}});
        if(m.subclouds){
          Object.keys(m.subclouds).forEach(function(sc){
            if(m.subclouds[sc]>0){out[sc]={value:m.subclouds[sc],text:crossingText(m.subclouds[sc])}}
          });
        }
        done(out)
      }
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
          var icon=g.querySelector(".branch-icon, .topic-icon");if(!icon)return;
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
    function calculateGlobal(){var def=selectedMetricDef();if(!def||!metricOn)return;var run=++metricGlobalRun,cancelled=function(){return run!==metricGlobalRun||!metricOn||metricId==='off'};startMetricBusy();if(metricOverlayOn)measureLocals();try{def.compute({svg:document.getElementById("mapSvg")},function(res){if(cancelled())return;stopMetricBusy();showMetricGlobal(res&&res.text!=null?res.text:"–")},cancelled)}catch(e){stopMetricBusy()}}
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
        var parent=scene.parentElement||scene;
        if(!MetricNumbersView.layerEl||!MetricNumbersView.layerEl.isConnected){MetricNumbersView.layerEl=document.createElement("div");MetricNumbersView.layerEl.className="metric-map-overlay";MetricNumbersView.layerEl.id="metricMapOverlay";MetricNumbersView.layerEl.setAttribute("aria-hidden","true");parent.appendChild(MetricNumbersView.layerEl);MetricNumbersView.labels={};MetricNumbersView.anchors={}}
        return MetricNumbersView.layerEl;
      },
      cloudCenters:function(){
        var sums={},counts={};
        function add(c,x,y){if(!c)return;(sums[c]=sums[c]||{x:0,y:0});sums[c].x+=x;sums[c].y+=y;counts[c]=(counts[c]||0)+1}
        var els=document.querySelectorAll(z90Selector()),i;
        for(i=0;i<els.length;i++){
          var r=els[i].getBoundingClientRect();
          if(!(r.width>0||r.height>0))continue;
          var cEl=cloudOfEl(els[i]);
          if(cEl)add(cEl,r.left+r.width/2,r.top+r.height/2);
          var scEl=subcloudOfEl(els[i]);
          if(scEl)add(scEl,r.left+r.width/2,r.top+r.height/2);
        }
        var svg=document.getElementById("mapSvg");
        if(svg){
          var np=metricNodePositions(svg);
          np.keys.forEach(function(k){
            var c=topBranchKey(k);
            if(c)add(c,np.pos[k].x,np.pos[k].y);
            var sc=subcloudKey(k);
            if(sc)add(sc,np.pos[k].x,np.pos[k].y);
          });
        }
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
    window.__sxGetActiveNodeKey=function(){
      var svg=document.getElementById("mapSvg");
      return (svg?selectedNodeKey(svg):null)||lastFocusKey||null;
    };
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
