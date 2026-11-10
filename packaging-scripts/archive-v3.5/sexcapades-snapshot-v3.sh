#!/bin/bash
# Sexcapades Snapshot v3 - Hardened + Complete
# v2 + fixes: api sync, changelog path, remember-profile patch, gate verification
# All patches NON-FATAL (warn and continue).

set -u

export TZ="America/Chicago"
BUILD=$(date +%Y-%m-%d_%H%M)
export BUILD
YOUR_FILES="$HOME/workspace/your_files"
HOSTED="$YOUR_FILES/sexcapades-io"
HOSTED_DIR="$HOSTED/hosted"
GOALS_HOSTED="$HOME/workspace/goals/sexcapades-io-hosting-upload/files/sexcapades-io"
GOALS_HOSTED_DIR="$GOALS_HOSTED/hosted"
DRIVE_PARENT_ID="1eEo97XoRiwHLiFloTof0IFYTHumB8gi5"

echo "=== Sexcapades Snapshot v3: $BUILD ==="

# 1. Copy 5 exported artifacts to hosted/ subdirectory
# NOTE (2026-10-16): v3.0 is the current line. app.html is the v3.0 ARTIFACT (sexcapades-v3-0).
# (Was 2.0 beta-2 per Jason 2026-10-14; superseded by v3.0 migration.)
echo "--- Copying exports ---"
mkdir -p "$HOSTED_DIR"
declare -A COPIES=(
    ["$YOUR_FILES/sexcapades-v3-0/sexcapades-v3-0.html"]="$HOSTED_DIR/app.html"
    ["$YOUR_FILES/syncing-sexcapades-guide/syncing-sexcapades-guide.html"]="$HOSTED_DIR/guide.html"
    ["$YOUR_FILES/sexcapades-18-gate/sexcapades-18-gate.html"]="$HOSTED_DIR/gate.html"
    ["$YOUR_FILES/sexcapades-quick-start/sexcapades-quick-start.html"]="$HOSTED_DIR/quickstart.html"
    ["$YOUR_FILES/sexcapades-faq/sexcapades-faq.html"]="$HOSTED_DIR/faq.html"
)

for src in "${!COPIES[@]}"; do
    dest="${COPIES[$src]}"
    if [ -f "$src" ]; then
        cp "$src" "$dest" && echo "OK: $(basename $src) -> $(basename $dest)" || echo "WARN: copy failed for $src"
    else
        echo "WARN: source not found: $src (skipping)"
    fi
done

# 1b. VERIFY BUILD MARKER - warn if export looks stale (added 2026-10-17)
# Checks both build number AND file freshness to avoid false positives on intentional re-syncs.
echo "--- Verifying build marker ---"
APP_BUILD=$(grep -o "Build [0-9_-]*" "$HOSTED_DIR/app.html" 2>/dev/null | head -1 | awk '{print $2}')
if [ -z "$APP_BUILD" ]; then
    echo "ERROR: No build marker found in app.html - aborting sync"
    exit 1
fi
echo "Found build marker: $APP_BUILD"
# Check if source file was recently modified (indicates fresh export)
SRC_FILE="$YOUR_FILES/sexcapades-v3-0/sexcapades-v3-0.html"
SRC_AGE_MIN=$(( ($(date +%s) - $(stat -c %Y "$SRC_FILE" 2>/dev/null || echo 0)) / 60 ))
LAST_SYNC_FILE="$HOME/workspace/.last-sync-build"
if [ -f "$LAST_SYNC_FILE" ]; then
    LAST_BUILD=$(cat "$LAST_SYNC_FILE")
    if [ "$APP_BUILD" = "$LAST_BUILD" ] && [ "$SRC_AGE_MIN" -gt 60 ]; then
        echo "WARNING: Build $APP_BUILD unchanged since last sync AND source file is ${SRC_AGE_MIN}min old."
        echo "WARNING: Artifact export may have failed silently."
        echo "WARNING: Continuing in 5 seconds... (Ctrl+C to abort)"
        sleep 5
    elif [ "$APP_BUILD" = "$LAST_BUILD" ]; then
        echo "OK: Same build as last sync, but source was recently exported (${SRC_AGE_MIN}min ago) - no new changes, proceeding."
    else
        echo "OK: New build detected ($LAST_BUILD -> $APP_BUILD)"
    fi
else
    echo "OK: First sync with build tracking (no prior build recorded)"
fi
echo "$APP_BUILD" > "$LAST_SYNC_FILE"

# 2. Sync to goals hosted folder (FileZilla source) - FIXED: mkdir -p for api/
echo "--- Syncing to FileZilla source ---"
mkdir -p "$GOALS_HOSTED_DIR/api"
# Auto-create redirect folders with UTM tracking - per-person per-platform
# Structure: /shel/reddit, /shel/fetlife, /shel/forum, /shel/share, /jason/reddit, etc.
for who in shel jason; do
    for where in reddit fetlife forum share; do
        rdir="$GOALS_HOSTED/$who/$where"
        mkdir -p "$rdir"
        if [ ! -f "$rdir/index.html" ]; then
            if [ "$where" = "share" ]; then
                UTM="utm_source=$who"
            else
                UTM="utm_source=$who&utm_medium=$where"
            fi
            cat > "$rdir/index.html" << REDIRECT_EOF
<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Redirecting…</title>
<meta http-equiv="refresh" content="0;url=https://sexcapades.io/?$UTM">
<script>window.location.replace("https://sexcapades.io/?$UTM");</script>
</head><body><p>Redirecting… <a href="https://sexcapades.io/?$UTM">click here</a>.</p></body></html>
REDIRECT_EOF
            echo "OK: created $who/$where redirect ($UTM)"
        fi
    done
done
for f in glossary.html api/collect.php; do
    if [ -f "$HOSTED_DIR/$f" ]; then
        cp "$HOSTED_DIR/$f" "$GOALS_HOSTED_DIR/$f" && echo "OK: synced $f" || echo "WARN: sync failed for $f"
    else
        echo "WARN: $HOSTED_DIR/$f not found (skipping)"
    fi
done
# Sync the 5 main files too
for f in app.html guide.html gate.html quickstart.html faq.html; do
    if [ -f "$HOSTED_DIR/$f" ]; then
        cp "$HOSTED_DIR/$f" "$GOALS_HOSTED_DIR/$f" && echo "OK: synced $f" || echo "WARN: sync failed for $f"
    fi
done

# 3. Patches (NON-FATAL)
echo "--- Applying patches (non-fatal) ---"

# 3a. Gate destinations to absolute URLs
python3 << 'PYEOF' || echo "WARN: gate destination patch failed (continuing)"
import re
p = '/home/hatch/workspace/your_files/sexcapades-io/hosted/gate.html'
with open(p, encoding='utf-8') as f: html = f.read()
orig = html
html = re.sub(r'href="(?!https?://)(app\.html|guide\.html|quickstart\.html|faq\.html|flyer\.pdf)"',
              r'href="https://sexcapades.io/hosted/\1"', html)
if html != orig:
    with open(p, 'w', encoding='utf-8') as f: f.write(html)
    print("gate destinations patched")
else:
    print("gate destinations already absolute")
PYEOF

# 3g. Age gate persistence (localStorage, hardened)
python3 << 'PYEOF2' || echo "WARN: age persistence patch failed (continuing)"
import re
p = '/home/hatch/workspace/your_files/sexcapades-io/hosted/gate.html'
try:
    with open(p, encoding='utf-8') as f: html = f.read()
except FileNotFoundError:
    print("WARN: gate.html not found for persistence patch")
else:
    orig = html
    # Correct localStorage persistence using actual gate IDs and classes
    persistence_js = """
<script>
(function() {
  var KEY = 'sexcapades_age_verified';
  function isVerified() {
    try { return localStorage.getItem(KEY) === 'true'; } catch (e) { return false; }
  }
  function setVerified() {
    try { localStorage.setItem(KEY, 'true'); } catch (e) {}
  }
  document.addEventListener('DOMContentLoaded', function() {
    if (isVerified()) {
      var hash = window.location.hash;
      if (hash && hash.indexOf('#app/') === 0) {
        window.location.assign('https://sexcapades.io/hosted/app.html' + hash);
        return;
      }
      var ageGate = document.getElementById('ageGate');
      var destMenu = document.getElementById('destinationMenu');
      var enterBtn = document.getElementById('enterButton');
      if (ageGate) {
        ageGate.classList.add('is-confirmed');
        ageGate.setAttribute('aria-label', 'Sexcapades destinations');
      }
      if (destMenu) {
        destMenu.classList.add('is-visible');
        destMenu.setAttribute('aria-hidden', 'false');
      }
      if (enterBtn) enterBtn.setAttribute('aria-expanded', 'true');
    }
    var eb = document.getElementById('enterButton');
    if (eb) eb.addEventListener('click', setVerified, {capture: true});
  });
})();
</script>
"""
    # Inject before </body> if not already present
    if 'sexcapades_age_verified' not in html:
        html = html.replace('</body>', persistence_js + '\n</body>')
    if html != orig:
        with open(p, 'w', encoding='utf-8') as f: f.write(html)
        print("age persistence patch applied (hardened)")
    else:
        print("age persistence already present")
PYEOF2

# 3h. App About dialog visitor counter (hardened, via v3 - builder refuses live API)
python3 << 'PYEOF3' || echo "WARN: app about counter patch failed (continuing)"
import re
p = '/home/hatch/workspace/your_files/sexcapades-io/hosted/app.html'
try:
    with open(p, encoding='utf-8') as f: html = f.read()
except FileNotFoundError:
    print("WARN: app.html not found for counter patch")
else:
    orig = html
    counter_js = """
<script>
(function() {
  function fetchCount() {
    try {
      fetch('https://sexcapades.io/hosted/api/collect.php?action=get_stats', {mode: 'cors'})
        .then(function(r) { return r.json(); })
        .then(function(d) {
          var n = (d && d.unique_visitors) || 0;
          var els = document.querySelectorAll('.about-visitor-count');
          els.forEach(function(el) {
            // Odometer-style: pad to 6 digits, wrap each in span
            var s = String(n).padStart(6, '0');
            el.innerHTML = s.split('').map(function(ch) {
              return '<span class="odo-digit">' + ch + '</span>';
            }).join('');
          });
        })
        .catch(function() {});
    } catch (e) {}
  }
  // Inject counter into About dialog when it opens
  document.addEventListener('DOMContentLoaded', function() {
    var obs = new MutationObserver(function() {
      var about = document.querySelector('.about-dialog, #about-dialog, [role="dialog"]');
      if (about && !about.querySelector('.about-visitor-count')) {
        var div = document.createElement('div');
        div.className = 'about-counter-wrap';
        div.innerHTML = '<div class="about-counter-label">Site visitors</div><div class="about-visitor-count"><span class="odo-digit">0</span><span class="odo-digit">0</span><span class="odo-digit">0</span><span class="odo-digit">0</span><span class="odo-digit">0</span><span class="odo-digit">0</span></div>';
        about.appendChild(div);
        fetchCount();
      }
    });
    try { obs.observe(document.body, {childList: true, subtree: true}); } catch (e) {}
  });
})();
</script>
"""
    if 'about-visitor-count' not in html:
        html = html.replace('</body>', counter_js + '\n</body>')
    if html != orig:
        with open(p, 'w', encoding='utf-8') as f: f.write(html)
        print("app about counter patch applied")
    else:
        print("app about counter already present")
PYEOF3

# 3i. Update build number in app About dialog to current $BUILD
python3 << 'PYEOF4' || echo "WARN: build number update failed (continuing)"
import re
p = '/home/hatch/workspace/your_files/sexcapades-io/hosted/app.html'
try:
    with open(p, encoding='utf-8') as f: html = f.read()
except FileNotFoundError:
    print("WARN: app.html not found for build number update")
else:
    orig = html
    # Replace any 2026-10-11_HHMM pattern with current BUILD
    import os
    build = os.environ.get('BUILD', '')
    if build:
        html = re.sub(r'2026-10-11_\d{4}', build, html)
    if html != orig:
        with open(p, 'w', encoding='utf-8') as f: f.write(html)
        print(f"build number updated to {build}")
    else:
        print("build number already current")
PYEOF4




# 3b. SVG re-embed + caption fix
python3 << 'PYEOF' || echo "WARN: SVG re-embed failed (continuing)"
import re, base64, os
base = os.path.expanduser('~/workspace/your_files/sexcapades-io')
svg_path = base + '/hosted/sync-map-preview.svg'
if not os.path.exists(svg_path):
    print("WARN: canonical SVG not found, skipping")
else:
    svg = open(svg_path, encoding='utf-8').read()
    uri = 'data:image/svg+xml;base64,' + base64.b64encode(svg.encode('utf-8')).decode('ascii')
    pat = re.compile(r'data:image/svg\+xml;base64,[A-Za-z0-9+/=]+')
    for f, cap_old, cap_new in [
        (base + '/gate.html', 'A sample sync map \u2014 Rowan', 'A sample sync map'),
        (base + '/guide.html', 'Rowan\u2019s sample sync map.', 'Sample sync map.'),
    ]:
        if os.path.exists(f):
            with open(f, encoding='utf-8') as fh: html = fh.read()
            html, n = pat.subn(uri, html)
            html = html.replace(cap_old, cap_new)
            with open(f, 'w', encoding='utf-8') as fh: fh.write(html)
            print(f"{os.path.basename(f)}: svg x{n}, caption fixed")
PYEOF

# 3c. Gate age-memory (flexible, non-fatal)
python3 << 'PYEOF' || echo "WARN: age-memory patch failed (continuing)"
import re
p = '/home/hatch/workspace/your_files/sexcapades-io/hosted/gate.html'
with open(p, encoding='utf-8') as f: html = f.read()
if 'sexcapades_age_verified' in html:
    print("age-memory already present")
else:
    m = re.search(r"enterButton\.addEventListener\('click',\s*function\s*\(\)\s*\{", html)
    if m:
        inject = """        // Age-memory (snapshot v3)
        try {
          if (window.localStorage.getItem('sexcapades_age_verified') === 'true') {
            document.dispatchEvent(new Event('age-verified-skip'));
          }
        } catch (e) {}
        
"""
        html = html[:m.start()] + inject + html[m.start():]
        html = html.replace(
            "enterButton.addEventListener('click', function () {",
            "enterButton.addEventListener('click', function () {\n          try { window.localStorage.setItem('sexcapades_age_verified', 'true'); } catch (e) {}",
            1
        )
        with open(p, 'w', encoding='utf-8') as f: f.write(html)
        print("age-memory injected")
    else:
        print("WARN: enterButton handler not found (gate still functional)")
PYEOF

# 3d. Guide visitor counter
python3 << 'PYEOF' || echo "WARN: visitor counter failed (continuing)"
p = '/home/hatch/workspace/your_files/sexcapades-io/hosted/guide.html'
with open(p, encoding='utf-8') as f: html = f.read()
if 'visitor-counter' in html or 'sexcapades_visitor_uuid' in html:
    print("visitor counter already present")
else:
    counter = '''
  <script>
    (function () {
      try {
        var k = 'sexcapades_visitor_uuid';
        var uuid = localStorage.getItem(k);
        if (!uuid) {
          uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c=='x'?r:(r&0x3|0x8);
            return v.toString(16);
          });
          localStorage.setItem(k, uuid);
        }
      } catch (e) {}
    })();
  </script>
'''
    html = html.replace('</body>', counter + '\n</body>')
    with open(p, 'w', encoding='utf-8') as f: f.write(html)
    print("visitor counter injected")
PYEOF

# 3e. Remember-profile patch (2.0, regex-based, no bs4 needed) - UPDATED 2026-10-14 for 2.0
echo "--- Remember-profile patch (2.0) ---"
if [ -f "$HOME/workspace/remember-profile-patch-2.0.py" ]; then
    python3 "$HOME/workspace/remember-profile-patch-2.0.py" 2>&1 | head -5 || echo "WARN: remember-profile 2.0 patch failed (continuing)"
else
    echo "WARN: remember-profile-patch-2.0.py not found (skipping)"
fi

# 3f. Verify gate patches - FIXED in v3
echo "--- Verifying gate patches ---"
if [ -f "$HOME/workspace/verify-gate-patches.py" ]; then
    python3 "$HOME/workspace/verify-gate-patches.py" 2>&1 | head -10 || echo "WARN: gate verification failed (continuing)"
else
    echo "WARN: verify-gate-patches.py not found (skipping)"
fi

# 4. Changelog - in hosted/ subdirectory
echo "--- Updating changelog ---"
CHANGELOG="$GOALS_HOSTED/public_html/hosted/CHANGELOG.md"
if [ -f "$CHANGELOG" ]; then
    echo "" >> "$CHANGELOG"
    echo "## $BUILD" >> "$CHANGELOG"
    if [ -n "${CHANGELOG_MSG:-}" ]; then
        # Use provided message (can be multi-line)
        echo "$CHANGELOG_MSG" >> "$CHANGELOG"
    else
        echo "- (no changelog message provided - set CHANGELOG_MSG env var)" >> "$CHANGELOG"
    fi
    echo "OK: changelog updated"
else
    echo "WARN: changelog not found at $CHANGELOG"
fi

# 5. Build number
echo "$BUILD" > "$HOSTED/.build-number"
echo "$BUILD" > "$GOALS_HOSTED/.build-number"
echo "Build: $BUILD"

# 5.4. Fix asset paths and links (artifacts have broken relative paths)
echo "--- Fixing asset paths and links ---"
export GOALS_HOSTED_DIR="$GOALS_HOSTED"
python3 << 'FIXEOF'
import os, re
hosted = os.environ.get('GOALS_HOSTED_DIR', '')
if hosted:
    # Examples: fix relative asset paths
    p = os.path.join(hosted, 'hosted', 'examples.html')
    if os.path.exists(p):
        with open(p, encoding='utf-8') as f: c = f.read()
        orig = c
        c = c.replace('src="examples/', 'src="/hosted/examples/')
        c = c.replace('href="examples/', 'href="/hosted/examples/')
        if c != orig:
            with open(p, 'w', encoding='utf-8') as f: f.write(c)
            print("  OK: examples.html paths fixed")
    # Compare: fix og:url and dead links
    p = os.path.join(hosted, 'hosted', 'compare.html')
    if os.path.exists(p):
        with open(p, encoding='utf-8') as f: c = f.read()
        orig = c
        c = c.replace('<meta property="og:url" content="https://sexcapades.io/" />',
                      '<meta property="og:url" content="https://sexcapades.io/compare" />')
        c = c.replace('http://old.mojoupgrade.com/', 'https://mojoupgrade.com/')
        if c != orig:
            with open(p, 'w', encoding='utf-8') as f: f.write(c)
            print("  OK: compare.html links fixed")
    # Quickstart: fix FAQ link
    p = os.path.join(hosted, 'hosted', 'quickstart.html')
    if os.path.exists(p):
        with open(p, encoding='utf-8') as f: c = f.read()
        orig = c
        c = c.replace('href="faq.html"', 'href="/faq"')
        if c != orig:
            with open(p, 'w', encoding='utf-8') as f: f.write(c)
            print("  OK: quickstart.html FAQ link fixed")
FIXEOF

# 5.5. Inject visitor counters into hosted HTML files (artifacts can't do live fetches, so we add post-export)
echo "--- Injecting visitor counters ---"
export GOALS_HOSTED_DIR="$GOALS_HOSTED"
python3 << 'COUNTER_EOF'
import os, re

# Counter snippet template (ID varies per page to avoid conflicts)
# FIXED: No d.ok requirement, uses (d&&d.unique_visitors)||0
def counter_snippet(page_id):
    return f'''
<div class="visitor-odometer-wrap" style="text-align:center;margin:20px 0;">
  <div class="visitor-odometer" title="Unique visitors to Sexcapades" style="display:inline-flex;align-items:center;gap:8px;font-size:0.85rem;color:#a6bbb7;">
    <div class="odometer-digits" id="odometer-digits-{page_id}" style="display:inline-flex;gap:2px;"></div>
    <span style="opacity:0.7;">explorers</span>
  </div>
</div>
<style>
.visitor-odometer-wrap .odometer-digit{{width:22px;height:32px;background:#0c191a;border:1px solid #253839;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;color:#55dc9a;}}
</style>
<script>
(function(){{var c=document.getElementById('odometer-digits-{page_id}');if(!c)return;
function render(n){{try{{var s=String(n).padStart(6,'0');c.innerHTML='';for(var i=0;i<s.length;i++){{var d=document.createElement('div');d.className='odometer-digit';d.textContent=s[i];c.appendChild(d);}}}}catch(e){{}}}}
try{{
fetch('https://sexcapades.io/hosted/api/collect.php',{{method:'POST',headers:{{'Content-Type':'application/json'}},body:JSON.stringify({{action:'get_stats'}})}}).then(function(r){{return r.json();}}).then(function(d){{render((d&&d.unique_visitors)||0);}}).catch(function(){{render(0);}});
}}catch(e){{render(0);}}}})();
</script>
'''

hosted_dir = os.environ.get('GOALS_HOSTED_DIR', '')
if hosted_dir:
    pages = {
        'gate.html': 'GATE',
        'guide.html': 'GUIDE',
        'guides.html': 'GUIDES',
        'quickstart.html': 'QS',
        'examples.html': 'EX',
        'glossary.html': 'GLOSS',
        'compare.html': 'COMPARE',
    }
    for filename, pid in pages.items():
        path = os.path.join(hosted_dir, 'hosted', filename)
        if os.path.exists(path):
            with open(path, encoding='utf-8') as f:
                content = f.read()
            orig = content
            # Remove ALL existing counters (prevent duplication)
            content = re.sub(r'<div class="visitor-odometer-wrap".*?</script>', '', content, flags=re.DOTALL)
            content = re.sub(r'<div[^>]*id="odometer-digits[^"]*"[^>]*>.*?</div>\s*<span[^>]*>explorers</span>', '', content, flags=re.DOTALL)
            # Remove old plain-text counters entirely
            content = re.sub(r'<div class="site-counter".*?</div>', '', content, flags=re.DOTALL)
            content = re.sub(r'<span class="site-counter-number".*?</span>', '', content, flags=re.DOTALL)
            # Add fresh counter
            snippet = counter_snippet(pid)
            if '</body>' in content:
                content = content.replace('</body>', snippet + '\n</body>', 1)
            if content != orig:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"  OK: {filename} (cleaned + injected)")
            else:
                print(f"  SKIP: {filename} (no change)")
        else:
            print(f"  WARN: {filename} not found")
else:
    print("  WARN: GOALS_HOSTED_DIR not set")
COUNTER_EOF

# 6. Build tar.gz with correct structure (UPDATED 2026-10-14 per Jason)
# Tar structure:
#   sexcapades.io/sexcapades-snapshot-v3.sh, get_stats.sh (scripts at top level)
#   sexcapades.io/public_html/ (site files: index.html, hosted/, etc.)
# Extraction: from ~/domains, run `tar -xzf archives/<name>.tar.gz` — extracts sexcapades.io/
# into ~/domains/sexcapades.io/ (never extract into ~/domains root directly).
echo "--- Building archive ---"
# Copy scripts into sexcapades.io/ folder (per Jason 2026-10-14)
if [ -f "$HOME/workspace/sexcapades-snapshot-v3.sh" ]; then
    cp "$HOME/workspace/sexcapades-snapshot-v3.sh" "$GOALS_HOSTED/sexcapades-snapshot-v3.sh" && echo "OK: snapshot script copied into sexcapades.io/" || echo "WARN: failed to copy snapshot script"
fi
if [ -f "$HOME/workspace/get_stats.sh" ]; then
    cp "$HOME/workspace/get_stats.sh" "$GOALS_HOSTED/get_stats.sh" && echo "OK: get_stats.sh copied into sexcapades.io/" || echo "WARN: failed to copy get_stats.sh"
fi
# Release pipeline bundle (2026-10-20, Jason): every sync-all also carries
# the full pipeline that builds the site — optimizer, packaging scripts,
# README, handover doc — under sexcapades.io/pipeline/ (top level, beside
# the scripts above; the restructure below must NOT move it into
# public_html). A missing source is a failed snapshot, never a silent
# omission.
PIPELINE_DIR="$GOALS_HOSTED/pipeline"
mkdir -p "$PIPELINE_DIR"
for src in "$HOME/workspace/sexcapades-3.5-optimize.py" \
           "$HOME/workspace/package-deploy-app-v3.5.sh" \
           "$HOME/workspace/package-deploy-all-v3.5-fixed.sh" \
           "$HOME/workspace/package-deploy-gate-v3.5.sh" \
           "$HOME/workspace/package-deploy-guide-v3.5.sh" \
           "$HOME/workspace/package-deploy-quickstart-v3.5.sh" \
           "$HOME/workspace/sexcapades-snapshot-v3.sh" \
           "$HOME/workspace/get_stats.sh" \
           "$HOME/workspace/your_files/sexcapades-site-handover.md"; do
    if [ ! -f "$src" ]; then
        echo "ERROR: Missing pipeline source: $src"
        exit 1
    fi
    cp "$src" "$PIPELINE_DIR/" || { echo "ERROR: failed to copy pipeline source: $src"; exit 1; }
done
if [ ! -f "$HOME/workspace/your_files/pipeline-bundle-readme.md" ]; then
    echo "ERROR: Missing pipeline source: pipeline-bundle-readme.md"
    exit 1
fi
cp "$HOME/workspace/your_files/pipeline-bundle-readme.md" "$PIPELINE_DIR/README-pipeline.md" && echo "OK: release pipeline bundled into sexcapades.io/pipeline/" || { echo "ERROR: failed to copy pipeline README"; exit 1; }
# Restructure: move site files into public_html/, keep scripts at top level
# (per Jason 2026-10-14: site goes to ~/domains/sexcapades.io/public_html/)
PUBHTML="$GOALS_HOSTED/public_html"
mkdir -p "$PUBHTML"
# Move all site files/dirs into public_html, excluding the scripts and public_html itself
# Idempotent: if the dir already exists in public_html (re-run), merge over it instead of failing (Jason 2026-10-15)
for item in "$GOALS_HOSTED"/*; do
    base=$(basename "$item")
    if [ "$base" != "public_html" ] && [ "$base" != "sexcapades-snapshot-v3.sh" ] && [ "$base" != "get_stats.sh" ] && [ "$base" != "pipeline" ]; then
        if [ -d "$item" ] && [ -d "$PUBHTML/$base" ]; then
            cp -rf "$item/." "$PUBHTML/$base/" && rm -rf "$item" && echo "  merged $base -> public_html/" || echo "WARN: failed to merge $base"
        else
            mv "$item" "$PUBHTML/" 2>/dev/null && echo "  moved $base -> public_html/" || echo "WARN: failed to move $base"
        fi
    fi
done
# Fix permissions (untar strips read/execute bits)
(cd "$GOALS_HOSTED" && find . -type d -exec chmod 755 {} \; && find . -type f -exec chmod 644 {} \;) && echo "OK: permissions fixed" || echo "WARN: chmod failed"
# Restore executable bit on scripts (Jason 2026-10-14 — tar must unpack ready-to-run)
chmod 755 "$GOALS_HOSTED/sexcapades-snapshot-v3.sh" "$GOALS_HOSTED/get_stats.sh" 2>/dev/null && echo "OK: scripts executable" || echo "WARN: chmod scripts failed"
[ -d "$GOALS_HOSTED/pipeline" ] && chmod 755 "$GOALS_HOSTED"/pipeline/*.sh "$GOALS_HOSTED"/pipeline/*.py 2>/dev/null && echo "OK: pipeline scripts executable" || echo "WARN: chmod pipeline failed"
# Build tar from files/ dir with sexcapades.io as top-level (transform hyphen to dot)
# NOTE: --transform renames sexcapades-io -> sexcapades.io in the archive
FILES_SRC="/home/hatch/workspace/goals/sexcapades-io-hosting-upload/files/sexcapades-io"
TAR_PATH="$HOME/workspace/sexcapades-${BUILD}.tar.gz"
rm -f "$TAR_PATH"
# Exclude data files from tar — they live outside public_html on the server (~/domains/sexcapades-data/)
# and must NOT be overwritten by deploys (Jason 2026-10-14)
tar -czf "$TAR_PATH" --transform='s,^home/hatch/workspace/goals/sexcapades-io-hosting-upload/files/sexcapades-io,sexcapades.io,' --exclude='*.db' --exclude='sexcapades_data.db' "$FILES_SRC" 2>/dev/null && echo "OK: tar built at $TAR_PATH" || echo "WARN: tar build failed"
ls -lh "$TAR_PATH" 2>/dev/null || echo "WARN: tar not found at $TAR_PATH"
# Verify the tar's own bytes carry the pipeline bundle (2026-10-20)
TAR_LIST=$(tar -tzf "$TAR_PATH" 2>/dev/null)
pipe_ok=1
for req in sexcapades.io/pipeline/sexcapades-3.5-optimize.py \
           sexcapades.io/pipeline/package-deploy-all-v3.5-fixed.sh \
           sexcapades.io/pipeline/sexcapades-snapshot-v3.sh \
           sexcapades.io/pipeline/README-pipeline.md \
           sexcapades.io/pipeline/sexcapades-site-handover.md; do
    echo "$TAR_LIST" | grep -qx "$req" || { echo "ERROR: tar missing pipeline entry: $req"; pipe_ok=0; }
done
if [ "$pipe_ok" = 1 ]; then echo "OK: pipeline bundle verified in tar"; else echo "ERROR: pipeline verification failed — do not ship this snapshot"; exit 1; fi
if echo "$TAR_LIST" | grep -q 'public_html/pipeline'; then echo "ERROR: pipeline leaked into public_html (web-accessible) — do not ship"; exit 1; fi

echo ""
echo "=== Snapshot v3 complete: $BUILD ==="
echo "FileZilla source: $GOALS_HOSTED"
echo "Tar: $HOME/workspace/sexcapades-${BUILD}.tar.gz"
echo "Next: Upload tar to Drive (Sexcapades snapshots), download on server to ~/domains/archives/,"
echo "      then from ~/domains run: tar -xzf archives/sexcapades-${BUILD}.tar.gz"
echo "      (extracts sexcapades.io/ into ~/domains/sexcapades.io/; never extract into ~/domains root)"
echo ""
