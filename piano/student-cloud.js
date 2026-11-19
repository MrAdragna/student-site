/* student-cloud.js (X111: test computers stay marked; X110: the first check-in comes about a second after the page opens; a test computer marks its build with a "t" so the teacher's list can hide it; the "paired" memory carries a time; X109: no check-ins while the tab is hidden, the screen is locked, the window is not focused or nothing was touched for 5 minutes; X106: the ping answer carries paired / hold, passed on as the page event ss-live; pings every 30 s; X104, c13, 17 Nov 2026). OPTIONAL cloud link, loaded after student-ui.js. Does NOTHING unless the published settings contain cloud.url.
   - Only during class: every ~45 s (random +/- 5 s) one small status ping (random device code, state, game, right / wrong, active seconds). NO name unless
     cfg.cloud.names is true AND the service allows it. Outside class: no network at all.
   - Auto offline mode: a ping that fails or takes longer than 3 s marks this Chromebook "offline" (the site works exactly as before, everything stays on the device);
     it retries every 30 s (flat, X103), and goes back "online" by itself at the first answer. The browser's "online" event and coming back to the tab retry at once.
   - Live settings: the service's reply carries a version. When the teacher pushes new settings, this page downloads them, saves a copy (read by student-shim.js) and
     reloads itself when no game is being played. */
(function(){
  "use strict";
  var P = window.SS_PREFIX || "ss:", TIMEOUT = 3000, EVERY = 30000, BACKOFF = [30000], TEST = /[?&]cloudtest=1(&|$)/.test(location.search);   // X103b: open the student page with ?cloudtest=1 to ping outside class (for your own testing)
  function lg(k){ try { return localStorage.getItem(P + k); } catch (e) { return null; } }
  function ls(k, v){ try { localStorage.setItem(P + k, v); } catch (e) {} }
  var QUIET_MS = 5 * 60000, TEST_NOQUIET = false;
  var cfg = null, url = "", fails = 0, timer = null, busy = false, reloadWait = null;
  var C = window.__ssCloud = { online: null, lastOk: 0, lastTry: 0, fails: 0, pings: 0 };
  function device(){ var d = lg("device"); if (!d || !/^[a-z0-9]{8,32}$/.test(d)) { d = ""; var a = new Uint8Array(12); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function(_, i){ a[i] = Math.random() * 256; }); for (var i = 0; i < a.length; i++) d += (a[i] % 36).toString(36); ls("device", d); } return d; }
  window.ssDeviceCode = function(){ return device().slice(0, 6); };   // X108: the page shows the code at once when it opens
  function testerNow(){ return lg("tester") === "1"; }
  function st(){ try { return window.ssStatus ? window.ssStatus() : null; } catch (e) { return null; } }
  function later(ms){ clearTimeout(timer); timer = setTimeout(tick, ms); }
  function jitter(ms){ return ms + (Math.random() * 10000 - 5000); }
  function call(path, opts){
    var ctl = typeof AbortController === "function" ? new AbortController() : null, t = ctl && setTimeout(function(){ ctl.abort(); }, TIMEOUT);
    opts = opts || {}; if (ctl) opts.signal = ctl.signal; opts.cache = "no-store";
    return fetch(url + path, opts).then(function(r){ if (t) clearTimeout(t); if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }, function(e){ if (t) clearTimeout(t); throw e; });
  }
  function goOnline(){ if (C.online === false) { try { window.dispatchEvent(new CustomEvent("ss-cloud", { detail: { online: true } })); } catch (e) {} } C.online = true; C.lastOk = Date.now(); fails = 0; C.fails = 0; }
  function goOffline(){ if (C.online !== false) { try { window.dispatchEvent(new CustomEvent("ss-cloud", { detail: { online: false } })); } catch (e) {} } C.online = false; fails++; C.fails = fails; }
  function tick(){
    var s = st();
    if (!s || s.preview || (!s.inClass && !TEST)) { later(5000); return; }   // outside class (or preview): no network, just look again in 5 s
    // X109: no request at all while this Chromebook is not really in use (tab hidden, screen locked, another window focused, or no mouse / keyboard for 5 minutes). The teacher's side simply stops hearing from it; the first sign of life sends a check-in at once.
    var quiet = document.visibilityState !== "visible" || (typeof document.hasFocus === "function" && !document.hasFocus()) || (s.act && Date.now() - s.act > QUIET_MS);
    if (quiet && !TEST_NOQUIET) { C.quiet = true; later(5000); return; }
    C.quiet = false;
    if (busy) { later(2000); return; }
    busy = true; C.lastTry = Date.now();
    var body = { id: device(), state: s.state || "off", game: s.game, mode: s.mode, right: s.right, wrong: s.wrong, active: s.active, inClass: !!s.inClass, build: (window.SS_BUILD || "") + (testerNow() ? "t" : "") };
    if (cfg.cloud && cfg.cloud.names === true && s.name) body.name = s.name;
    call("/api/hb", { method: "POST", headers: { "content-type": "text/plain" }, body: JSON.stringify(body) }).then(function(r){
      busy = false; goOnline(); C.pings++; if (r && r.v) versionSeen(r.v); live(r); later(jitter(EVERY));
    }, function(){ busy = false; goOffline(); live(null); later(BACKOFF[Math.min(fails - 1, BACKOFF.length - 1)]); });
  }
  // X106: what the teacher's side says about THIS device: paired or not (a random code, no names), and the live "hold" (learning / review is up, or bell-work is off). No answer = no gate (offline mode is the old behavior).
  function live(r){
    var d = r ? { paired: r.paired, hold: !!r.hold, why: r.why || "", code: device().slice(0, 6) } : { offline: true, code: device().slice(0, 6) };
    C.code = d.code; C.paired = d.paired; C.hold = !!d.hold;
    if (r) { try { localStorage.setItem(P + "pairedlast", r.paired ? "1:" + Date.now() : "0"); } catch (e) {} }   // X108: a device already paired does not flash its code on the next visit
    try { window.dispatchEvent(new CustomEvent("ss-live", { detail: d })); } catch (e) {}
  }
  function versionSeen(v){
    if (!v || String(v) === (lg("cloudver") || "0")) return;   // v = 0: the teacher has pushed nothing yet
    call("/api/config").then(function(r){
      if (!r || !r.config) return;
      ls("livecfg", JSON.stringify({ version: r.v, config: r.config })); ls("cloudver", String(r.v));
      try { window.dispatchEvent(new CustomEvent("ss-livecfg", { detail: r.config })); } catch (e) {}   // X104: lets the page react at once (pause)
      var have = window.STUDENT_CONFIG && window.STUDENT_CONFIG.builtAt || "";
      if (String(r.config.builtAt || "") > String(have)) reloadWhenIdle();   // only reload when the pushed copy is really newer than what this page is showing
    }, function(){});
  }
  function reloadWhenIdle(){
    clearInterval(reloadWait);
    reloadWait = setInterval(function(){ var s = st(); if (!s || !s.playing) { clearInterval(reloadWait); location.reload(); } }, 4000);   // never in the middle of a question
  }
  function retryNow(){ if (cfg && url && C.online === false) later(Math.random() * 2000); }
  function wake(){ if (cfg && url && C.quiet) { C.quiet = false; later(300 + Math.random() * 700); } }   // X109: back in use after a quiet spell: check in right away
  window.addEventListener("focus", wake); ["pointerdown", "keydown"].forEach(function(n){ window.addEventListener(n, wake, true); });
  window.addEventListener("online", retryNow);
  document.addEventListener("visibilitychange", function(){ if (document.visibilityState === "visible") { retryNow(); wake(); } });
  window.STUDENT_READY.then(function(c){
    cfg = c || {}; url = String((cfg.cloud && cfg.cloud.url) || "").replace(/\/+$/, "");
    if (!/^https:\/\/[a-z0-9.-]+$/i.test(url) && !/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(url)) return;   // no address = no cloud, exactly like before
    later(300 + Math.random() * 700);   // X110: check in about a second after the page opens (it used to wait up to 10 s)
  });
})();
