#!/usr/bin/env node
/**
 * Walk every skin: Autofit the whole map, Anneal all, save one layout
 * file per skin, then write that layout into the skin's defaultLayout
 * so a fresh visit paints it.
 *
 * Diagnostic pause toggles stay off (they are unchecked in the page).
 * Anneal all is the same button a visitor presses.
 *
 * Lives in packaging-scripts/ so git keeps it. Playwright and
 * serve-local.py stay in the gitignored sexcapades-playwright-fleet/.
 *
 *   node packaging-scripts/bake-skin-layouts.js
 *   WORKERS=2 node packaging-scripts/bake-skin-layouts.js
 *   ONLY=fastcapades,philoscapades node packaging-scripts/bake-skin-layouts.js
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const REPO = path.resolve(__dirname, "..");
const FLEET_DIR = path.join(REPO, "sexcapades-playwright-fleet");
const { chromium } = require(path.join(FLEET_DIR, "node_modules", "playwright"));
const APP_DIR = path.join(REPO, "app");
const OUT_DIR = path.join(REPO, "layout-bakes");
const PROGRESS = path.join(OUT_DIR, "progress.jsonl");
const SKIN_DIRS = [
  path.join(APP_DIR, "data", "skins"),
  path.join(REPO, "site-tree", "public_html", "hosted", "data", "skins")
];
const PORT = Number(process.env.PORT || 8766);
const WORKERS = Math.max(1, Number(process.env.WORKERS || 2));
const ONLY = (process.env.ONLY || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const SKINS = [
  "aesthcapades", "biocapades", "chemcapades", "dancecapades", "dharmacapades",
  "expericapades", "fastcapades", "flexcapades", "forescapades", "linguacapades",
  "mattercapades", "nouscapades", "philoscapades", "poliscapades", "praxicapades",
  "quantacapades", "questcapades", "sexcapades", "simulcapades", "techcapades",
  "theoricapades", "vocapades"
];

function logEvent(event, extra) {
  const row = Object.assign({ event, at: new Date().toISOString() }, extra || {});
  const line = JSON.stringify(row);
  fs.appendFileSync(PROGRESS, line + "\n");
  console.log(line);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jsonValueEnd(text, i) {
  const open = text[i];
  if (open === "{" || open === "[") {
    const close = open === "{" ? "}" : "]";
    let depth = 0;
    let inStr = false;
    for (; i < text.length; i++) {
      const ch = text[i];
      if (inStr) {
        if (ch === "\\") { i += 1; continue; }
        if (ch === '"') inStr = false;
        continue;
      }
      if (ch === '"') { inStr = true; continue; }
      if (ch === open) depth += 1;
      else if (ch === close) {
        depth -= 1;
        if (depth === 0) return i + 1;
      }
    }
    throw new Error("unterminated JSON value");
  }
  if (open === '"') {
    i += 1;
    while (i < text.length) {
      if (text[i] === "\\") { i += 2; continue; }
      if (text[i] === '"') return i + 1;
      i += 1;
    }
    throw new Error("unterminated JSON string");
  }
  const m = /^(?:true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/.exec(text.slice(i));
  if (!m) throw new Error("bad JSON value at " + i);
  return i + m[0].length;
}

function writeDefaultLayout(filePath, layout) {
  const text = fs.readFileSync(filePath, "utf8");
  const pretty = text.includes("\n");
  const encoded = pretty ? JSON.stringify(layout, null, 2) : JSON.stringify(layout);
  const key = '"defaultLayout"';
  const idx = text.indexOf(key);
  let next;
  if (idx < 0) {
    const end = text.lastIndexOf("}");
    if (end < 0) throw new Error("no root object in " + filePath);
    const head = text.slice(0, end).replace(/\s*$/, "");
    const needsComma = !head.endsWith("{");
    const gap = pretty ? "\n  " : "";
    next = head + (needsComma ? "," : "") + gap + '"defaultLayout": ' + encoded + (pretty ? "\n" : "") + "}";
  } else {
    const colon = text.indexOf(":", idx + key.length);
    let valStart = colon + 1;
    while (valStart < text.length && /\s/.test(text[valStart])) valStart += 1;
    const valEnd = jsonValueEnd(text, valStart);
    next = text.slice(0, valStart) + encoded + text.slice(valEnd);
  }
  const parsed = JSON.parse(next);
  if (!parsed.defaultLayout || !parsed.defaultLayout.settings) {
    throw new Error("bake did not land settings in " + filePath);
  }
  fs.writeFileSync(filePath, next);
}

function bakeLayout(skin, layout) {
  const saved = path.join(OUT_DIR, skin + ".layout.json");
  fs.writeFileSync(saved, JSON.stringify(layout, null, 2) + "\n");
  const written = [];
  for (const dir of SKIN_DIRS) {
    const file = path.join(dir, skin + ".json");
    if (!fs.existsSync(file)) continue;
    writeDefaultLayout(file, layout);
    written.push(file);
  }
  if (!written.length) throw new Error("no skin file for " + skin);
  return { saved, written };
}

function startServer() {
  const child = spawn("python3", ["-u", path.join(FLEET_DIR, "serve-local.py"), String(PORT), APP_DIR], {
    cwd: FLEET_DIR,
    stdio: ["ignore", "pipe", "pipe"]
  });
  let ready = false;
  const buf = [];
  function onData(chunk) {
    const text = String(chunk);
    buf.push(text);
    if (text.includes("Serving ")) ready = true;
  }
  child.stdout.on("data", onData);
  child.stderr.on("data", onData);
  return {
    child,
    waitReady() {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("server did not start: " + buf.join(""))), 15000);
        (function poll() {
          if (child.exitCode != null) {
            clearTimeout(timer);
            reject(new Error("server exited " + child.exitCode + ": " + buf.join("")));
            return;
          }
          if (ready) { clearTimeout(timer); resolve(); return; }
          setTimeout(poll, 50);
        })();
      });
    }
  };
}

async function dismissPauses(page) {
  await page.evaluate(() => {
    function clickIfShown(wrapId, buttonId) {
      const wrap = document.getElementById(wrapId);
      const btn = document.getElementById(buttonId);
      if (!wrap || wrap.hidden || !btn) return;
      btn.click();
    }
    clickIfShown("layoutDiagGate", "layoutDiagStripContinue");
    clickIfShown("layoutDiagGate", "layoutDiagGateContinue");
    clickIfShown("layoutBackoutGate", "layoutBackoutGateStripAccept");
    clickIfShown("layoutBackoutGate", "layoutBackoutGateAccept");
    const anyway = document.getElementById("layoutDeknotterRunAnyway");
    if (anyway) anyway.click();
  }).catch(() => {});
}

async function prepare(page, skin) {
  const url = "http://127.0.0.1:" + PORT + "/sexcapades-5.0.html?verified=1&utm_source=fleet&skin=" + encodeURIComponent(skin);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 120000 });
  const boot = page.locator("#sxBootDialog");
  if (await boot.count()) {
    await boot.waitFor({ state: "hidden", timeout: 120000 });
  }
  await page.waitForFunction((expected) => {
    const api = window.__SEXCAPADES_LAYOUT_API;
    const branches = api && api.branches ? api.branches() : [];
    const nodes = document.querySelectorAll("#mapSvg .node-group").length;
    return window.__SX_ACTIVE_SKIN === expected && branches.length > 0 && nodes > 0 && window.__SEXCAPADES_LAYOUT_TEST;
  }, skin, { timeout: 180000 });
  await page.evaluate(() => {
    ["layoutDiagToggle", "layoutThrowBracketToggle", "layoutBackoutGateToggle", "layoutOnDemandPaintToggle"].forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.checked) {
        el.checked = false;
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    if (window.__SEXCAPADES_LAYOUT_UI && window.__SEXCAPADES_LAYOUT_UI.open) window.__SEXCAPADES_LAYOUT_UI.open();
    ["layoutBranch", "layoutSubcat", "layoutKink"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = "";
    });
    const clear = document.getElementById("layoutClearSelection");
    if (clear) clear.click();
    const clearChecks = document.getElementById("layoutAnnealCheckClear");
    if (clearChecks) clearChecks.click();
  });
  await page.waitForFunction(() => {
    const label = document.getElementById("layoutAnnealBtnLabel");
    const btn = document.getElementById("layoutAnnealBtn");
    const fit = document.getElementById("layoutAutofitBtn");
    return label && label.textContent === "Anneal all" && btn && !btn.disabled && fit && !fit.disabled;
  }, { timeout: 60000 });
}

async function runAutofit(page) {
  await page.evaluate(() => document.getElementById("layoutAutofitBtn").click());
  const deadline = Date.now() + 180000;
  let last = "";
  while (Date.now() < deadline) {
    const snap = await page.evaluate(() => {
      const status = document.getElementById("layoutAutofitStatus");
      const btn = document.getElementById("layoutAutofitBtn");
      const text = status ? (status.textContent || "") : "";
      const busy = !!(btn && (btn.classList.contains("is-busy") || btn.getAttribute("aria-busy") === "true"));
      const lastFit = window.__sxAutofitLast || null;
      const checking = /Checking|re-fitting|re-fit/i.test(text);
      return { text, busy, checking, hasLast: !!lastFit };
    });
    last = snap.text;
    if (snap.hasLast && !snap.busy && !snap.checking && snap.text) return snap.text;
    if (/could not run|unavailable|Nothing to fit|hit an error/i.test(snap.text)) {
      throw new Error("autofit failed: " + snap.text);
    }
    await sleep(500);
  }
  throw new Error("autofit timed out: " + last);
}

async function runAnnealAll(page, skin) {
  await page.evaluate(() => document.getElementById("layoutAnnealBtn").click());
  const deadline = Date.now() + 6 * 60 * 60 * 1000;
  let sawRun = false;
  let lastBeat = 0;
  let last = "";
  while (Date.now() < deadline) {
    await dismissPauses(page);
    const snap = await page.evaluate(() => {
      const label = document.getElementById("layoutAnnealBtnLabel");
      const status = document.getElementById("layoutDeknotterStatus");
      const text = status ? (status.innerText || "") : "";
      return {
        label: label ? label.textContent : "",
        text: text.slice(0, 500),
        running: !!window.__sxAnnealRunning
      };
    });
    last = snap.label + " | " + snap.text.slice(0, 180);
    if (/Annealing|Anneal all —|Anneal all -/.test(snap.label) || snap.running || /running every branch|Annealing /.test(snap.text)) {
      sawRun = true;
    }
    if (Date.now() - lastBeat > 60000) {
      lastBeat = Date.now();
      logEvent("anneal_tick", { skin, label: snap.label, status: snap.text.slice(0, 220) });
    }
    const finished = sawRun && !snap.running && /branches run/.test(snap.text) && snap.label === "Anneal all";
    if (finished) return snap.text.slice(0, 400);
    if (/DeKnotter driver is unavailable|no branches have rendered/.test(snap.text)) {
      throw new Error("anneal did not start: " + snap.text.slice(0, 300));
    }
    await sleep(1000);
  }
  throw new Error("anneal timed out: " + last);
}

async function captureLayout(page, skin) {
  await sleep(3000);
  return page.evaluate((skinName) => {
    const test = window.__SEXCAPADES_LAYOUT_TEST;
    const settings = test.get();
    const hash = test.hash();
    const positions = (typeof window.__sxCaptureBakedGeometry === "function") ? window.__sxCaptureBakedGeometry() : null;
    const build = (document.querySelector('meta[name="sexcapades-build"]') || {}).content || "";
    let crossings = null;
    try {
      const m = (typeof window.__sxCrossingMeasure === "function") ? window.__sxCrossingMeasure() : null;
      crossings = m && m.crossing != null ? m.crossing : null;
    } catch (e) { crossings = null; }
    return {
      app: "sexcapades",
      kind: "layout-settings",
      version: 3,
      build: build,
      exportedAt: new Date().toISOString(),
      skin: skinName,
      settings: settings,
      hash: hash,
      positions: positions,
      crossings: crossings
    };
  }, skin);
}

async function runSkin(browser, skin) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => {
    try {
      localStorage.removeItem("sexcapades-layout-savedDefaults");
      localStorage.removeItem("sexcapades-layout-liveSettings");
      localStorage.removeItem("sexcapades-layout-branchOrder");
    } catch (e) {}
  });
  const page = await context.newPage();
  page.setDefaultTimeout(0);
  const crashes = [];
  page.on("crash", () => crashes.push("page crashed"));
  page.on("pageerror", (err) => crashes.push(String(err && err.message || err)));
  logEvent("skin_start", { skin });
  try {
    await prepare(page, skin);
    logEvent("skin_ready", { skin });
    const autofit = await runAutofit(page);
    logEvent("autofit_done", { skin, status: autofit.slice(0, 300) });
    const anneal = await runAnnealAll(page, skin);
    logEvent("anneal_done", { skin, status: anneal.slice(0, 300) });
    const layout = await captureLayout(page, skin);
    if (!layout.settings) throw new Error("capture returned no settings");
    if (!layout.positions || !Array.isArray(layout.positions.branches) || !layout.positions.branches.length) {
      throw new Error("capture returned no baked positions");
    }
    const stored = {
      app: layout.app,
      kind: layout.kind,
      version: layout.version,
      build: layout.build,
      exportedAt: layout.exportedAt,
      settings: layout.settings,
      hash: layout.hash,
      positions: layout.positions
    };
    const baked = bakeLayout(skin, stored);
    logEvent("skin_ok", {
      skin,
      crossings: layout.crossings,
      branches: layout.positions.branches.length,
      saved: baked.saved,
      files: baked.written.length
    });
    return { skin, ok: true, crossings: layout.crossings };
  } catch (err) {
    logEvent("skin_fail", { skin, error: String(err && err.stack || err), crashes: crashes.slice(0, 5) });
    return { skin, ok: false, error: String(err && err.message || err) };
  } finally {
    await context.close().catch(() => {});
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const skins = ONLY.length ? ONLY : SKINS.slice();
  for (const skin of skins) {
    const file = path.join(SKIN_DIRS[0], skin + ".json");
    if (!fs.existsSync(file)) throw new Error("missing skin file " + file);
  }
  const server = startServer();
  let browser = null;
  try {
    await server.waitReady();
    logEvent("server_up", { port: PORT, skins: skins.length, workers: WORKERS });
    browser = await chromium.launch({
      headless: true,
      args: ["--disable-dev-shm-usage", "--js-flags=--max-old-space-size=4096"]
    });
    const queue = skins.slice();
    const results = [];
    async function worker() {
      while (queue.length) {
        const skin = queue.shift();
        results.push(await runSkin(browser, skin));
      }
    }
    await Promise.all(Array.from({ length: Math.min(WORKERS, skins.length) }, () => worker()));
    const failed = results.filter((r) => !r.ok);
    logEvent("all_done", {
      ok: results.length - failed.length,
      failed: failed.map((r) => r.skin)
    });
    if (failed.length) process.exitCode = 1;
  } finally {
    if (browser) await browser.close().catch(() => {});
    server.child.kill("SIGTERM");
  }
}

main().catch((err) => {
  try { logEvent("all_fail", { error: String(err && err.stack || err) }); } catch (e) {}
  console.error(err);
  process.exit(1);
});
