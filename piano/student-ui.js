/* student-ui.js (X110, c13: device code stays at the bottom of the side panel; teacher PIN test-computer option on the pairing box; stale "paired" memory no longer hides the code; loads student-games.js (Rhythm and Songs games); X109: device code box; quiet check-ins) (Student site v1, X99, 16 Nov 2026, c12). Loaded AFTER NoteID.js. Student identity (locked to the Chromebook's owner, borrowing),
   session timer, the "show my session" screen, today's focus message, and the teacher-only controls blocked. */
(function(){
  "use strict";
  var P = window.SS_PREFIX || "ss:"; window.SS_BUILD = "X110";   // X101 (c13): failing class tests need no PIN; a test cut off by the end of class is saved as a practice test with the score so far
  function lg(k){ try { return localStorage.getItem(P + k); } catch (e) { return null; } }
  function ls(k, v){ try { localStorage.setItem(P + k, v); } catch (e) {} }
  function jget(k, d){ try { var v = JSON.parse(lg(k)); return v == null ? d : v; } catch (e) { return d; } }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function pad(n){ return ("0" + n).slice(-2); }
  function dstr(d){ d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function hm(d){ var h = d.getHours(); return ((h % 12) || 12) + ":" + pad(d.getMinutes()) + " " + (h < 12 ? "AM" : "PM"); }   // always 12-hour AM/PM
  function slug(n){ return "s-" + String(n).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  var cfg = {}, me = null;   // me = { name, owner, borrowed, since }
  var PREVIEWISH = /[?&](preview|class)=1/.test(location.search);

  // X96: the student view has no Note ID title, no Practice / History tabs, no name chip and no per-game full-screen button (the page's own full screen is used instead)
  (function(){
    var st = document.createElement("style");
    st.textContent = ".topbar { display: none !important; } #maxBtn { display: none !important; }" +
      "body.ss-on { padding: 8px 360px 8px 8px; }" +
      "body.ss-on #app { height: auto; min-height: calc(100vh - 16px); }" +
      "body.ss-on .stagecard { max-width: calc((100vh - 135px) * 1.25 + 20px); }" +
      "body.ss-on .lcol { max-height: calc(100vh - 110px); overflow-y: auto; }" +
      ".hud { padding-right: 0 !important; } .hud-stats { flex: 1 1 auto; } .hud-stat.hearts { flex: 1 1 auto; justify-content: space-evenly; } .hud-stat .hearts-row { gap: 10px; } .hud-stat .heart { font-size: 32px; }" +
      ".ss-bar { position: fixed; top: 8px; right: 8px; bottom: 8px; width: 340px; z-index: 100; display: block; margin: 0; }" +
      ".ss-side { height: 100%; box-sizing: border-box; overflow: hidden; background: #fff; border: 3px solid #3a2f8f; border-radius: 16px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }" +
      ".ss-pname { font-size: 30px; font-weight: 800; color: #2a2170; line-height: 1.1; }" +
      ".ss-psub:empty { display: none; } .ss-psub { font-size: 13px; font-weight: 700; color: #7a4b00; }" +
      ".ss-pmin { text-align: center; line-height: 1; background: #f4f2ff; border-radius: 12px; padding: 8px 4px 6px; }" +
      ".ss-pmin b { display: block; font-size: 58px; font-weight: 800; color: #3a2f8f; letter-spacing: -1px; }" +
      ".ss-pmin span { font-size: 13px; font-weight: 700; color: #555; }" +
      ".ss-pst { display: block; font-size: 12px; font-weight: 800; margin-top: 3px; color: #999; } .ss-pst.on { color: #1a8a4a; }" +
      ".ss-fs { border-radius: 12px; padding: 8px 10px; text-align: center; line-height: 1.1; color: #fff; background: #1a8a4a; } .ss-fs.out { background: #c0392b; }" +
      ".ss-fs b { display: block; font-size: 34px; font-weight: 800; } .ss-fs span { font-size: 12px; font-weight: 700; opacity: .95; } .ss-fs small { display: block; margin-top: 3px; font-size: 11px; opacity: .85; }" +
      ".ss-pmore { font-size: 12.5px; color: #444; line-height: 1.5; } .ss-pmore b { color: #2a2170; }" +
      ".ss-side .ss-tbl { font-size: 12px; margin: 0; } .ss-side .ss-tbl th { font-size: 10.5px; line-height: 1.1; } .ss-side .ss-tbl th, .ss-side .ss-tbl td { padding: 3px 3px; }" +
      ".ss-side .ss-code { flex: 0 0 auto; margin: 0; padding: 5px; text-align: center; border: 3px dashed #3a2f8f; border-radius: 12px; background: #fff; } .ss-side .ss-code b { font-size: 26px; letter-spacing: 4px; margin-left: 6px; }" +
      ".ss-pb { align-self: flex-end; font: inherit; font-size: 11px; font-weight: 700; border: 0; background: none; color: #aaa; cursor: pointer; padding: 0; }" +
      ".ss-qs { display: block; font-size: 12px; font-weight: 700; color: #555; margin-top: 2px; } .ss-qs.slow { color: #b7791f; }" +
      ".ss-seg { display: flex; height: 10px; border-radius: 6px; overflow: hidden; background: #eee; } .ss-seg i { display: block; height: 100%; } .ss-seg .a, .dot.a { background: #3a2f8f; } .ss-seg .i, .dot.i { background: #e6a817; } .ss-seg .o, .dot.o { background: #c0392b; }" +
      ".dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 5px; }" +
      ".ss-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; } .ss-tile { background: #f6f6fa; border-radius: 10px; padding: 5px 8px; } .ss-tile.wide { grid-column: 1 / span 2; } .ss-tile span { display: block; font-size: 11px; color: #555; } .ss-tile b { font-size: 20px; color: #2a2170; }" +
      "#ssLast { font-size: 15px; line-height: 1.5; }" +
      ".ss-sec { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: #666; border-top: 1px solid #ddd; padding-top: 6px; margin-top: 2px; }" +
      ".ss-test { background: #fff1d6; border-left: 5px solid #e6a817; border-radius: 6px; padding: 4px 8px; margin-bottom: 4px; font-size: 12.5px; } .ss-test b, .ss-tb { background: #e6a817; color: #3d2a00; border-radius: 4px; padding: 0 5px; font-size: 10.5px; font-weight: 800; }" +
      ".ss-tbl tr.tst td { background: #fff1d6; } .ss-warn { background: #fde2e0; color: #8a1c14; border-radius: 6px; padding: 3px 8px; font-size: 12px; font-weight: 700; margin-bottom: 4px; } .ss-warn2 { color: #8a1c14; font-weight: 700; }" +
      ".ss-h { border: 1px solid #ddd; border-radius: 8px; margin-bottom: 5px; padding: 3px 8px; font-size: 12.5px; } .ss-h summary { cursor: pointer; } .ss-hl { color: #555; font-size: 11.5px; margin: 4px 0; }" +
      ".ss-top { flex: 0 0 auto; display: flex; flex-direction: column; gap: 8px; } .ss-scroll { flex: 1 1 auto; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding-right: 2px; }" +
      ".ss-ov.pair .ss-card { width: auto; max-width: 92vw; min-height: 40vh; padding: 5vh min(7vh, 4vw); display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; } .ss-ov.pair .ss-card * { text-align: center; } .ss-ov.pair h2 { font-size: 4.2vh; margin: 0; } .ss-ov.pair .ss-pc { font: 800 min(15vh, 14vw)/1.1 ui-monospace, Menlo, monospace; letter-spacing: .04em; white-space: nowrap; margin: 1.5vh 0; } .ss-ov.pair p { font-size: 3vh; margin: 0; }" +
      ".ss-pvx { position: absolute; top: 8px; right: 8px; font: 12px system-ui; border: 1px dashed #888; background: #fff; color: #444; border-radius: 6px; padding: 2px 8px; cursor: pointer; } @keyframes ssPulse { 0%, 100% { outline-color: rgba(233,163,26,0); } 50% { outline-color: #e9a31a; } } .ss-pulse { outline: 5px solid #e9a31a; outline-offset: 3px; animation: ssPulse .7s ease-in-out 4; border-radius: 10px; }" +
      ".ss-ov.still .ss-card, .ss-ov.still .ss-card * { text-align: center; } .ss-ov.still .ss-btns { justify-content: center; } .ss-ov.still .ss-card { display: flex; flex-direction: column; align-items: center; }" +
      ".ss-who { text-align: center; } .ss-psub { text-align: center; }" +
      ".ss-pmin b.g { color: #1a8a4a; } .ss-pmin b.y { color: #c98a00; } .ss-pmin b.r { color: #c0392b; } .ss-pst.g { color: #1a8a4a; } .ss-pst.y { color: #c98a00; } .ss-pst.r { color: #c0392b; }" +
      "#hudScore:empty { display: none !important; } .ss-nocls .ho, .ss-nocls #ssSeg, .ss-nocls #ssFs { display: none !important; } .ss-tile b.y { color: #c98a00; } .ss-tile b.r { color: #c0392b; }" +
      ".ss-end { position: fixed; top: 10px; left: 50%; transform: translateX(-50%); z-index: 100000; background: #c0392b; color: #fff; font-weight: 800; padding: 10px 22px; border-radius: 12px; font-size: 18px; box-shadow: 0 4px 16px rgba(0,0,0,.35); }" +
      ".ss-msgs { flex: 1 1 240px; min-width: 200px; display: flex; flex-wrap: wrap; gap: 8px; align-items: stretch; justify-content: space-evenly; } .ss-msg { flex: 1 1 160px; max-width: 340px; display: flex; align-items: center; justify-content: center; text-align: center; border: 3px solid var(--mc); background: color-mix(in srgb, var(--mc) 14%, #fff); border-radius: 12px; padding: 4px 10px; font-weight: 600; font-size: 15px; color: #1d1b2e; line-height: 1.25; } .gamebar .spacer { display: none; }" +
      ".ss-q2 { font-size: 12px; color: #444; line-height: 1.5; margin-bottom: 3px; } .ss-q2 b { color: #2a2170; }" +
      ".ss-strip { display: flex; align-items: flex-end; gap: 2px; height: 32px; margin: 3px 0 6px; overflow: hidden; } .ss-strip i { display: block; width: 6px; flex: 0 0 6px; border-radius: 2px 2px 0 0; } .ss-strip i.ok { background: #2fb067; } .ss-strip i.no { background: #d64545; } .ss-strip i.long { outline: 2px solid #e6a817; }" +
      ".ss-test.practice { background: #dff4f4; border-left-color: #1a9ea0; } .ss-test.practice b { background: #1a9ea0; color: #fff; } .ss-tb.pt { background: #1a9ea0; color: #fff; } .ss-tbl tr.pt td { background: #dff4f4; }" +
      ".ss-dayh { display: flex; justify-content: space-between; font-size: 12.5px; background: #ece9ff; border-radius: 6px; padding: 3px 8px; margin: 4px 0; color: #2a2170; } .ss-dayh span { font-weight: 700; }" +
      ".ss-bd { font-size: 10.5px; font-weight: 800; border-radius: 4px; padding: 0 5px; } .ss-bd.cls { background: #1a8a4a; color: #fff; } .ss-bd.out { background: #bbb; color: #333; }" +
      ".ss-h.cls { border-left: 5px solid #1a8a4a; background: #f1faf4; } .ss-h.out { border-left: 5px solid #bbb; }" +
      "@media (max-height: 760px) { .ss-pname { font-size: 24px; } .ss-pmin b { font-size: 56px; } .ss-tile { padding: 3px 8px; } .ss-tile b { font-size: 17px; } .ss-top, .ss-side { gap: 4px; } .ss-fs b { font-size: 24px; } .ss-fs small { display: none; } }" +
      "@media (max-width: 900px) { body.ss-on { padding: 8px; } .ss-bar { position: static; width: auto; margin-bottom: 8px; } .ss-side { height: auto; } .ss-pname { font-size: 22px; } .ss-pmin b { font-size: 40px; } .ss-side .ss-tbl, .ss-pb { display: none; } }";
    (document.head || document.documentElement).appendChild(st);
  })();

  // ---- teacher-only actions never run here (the buttons are hidden too) ----
  var BLOCK = /^(add-type|edit-type|delete-type|save-type|close-type|type-default|edit-level|add-level|add-after|save-level|delete-level.*|edit-states|close-states|arrange-games|close-arrange|group-on|group-off|mg-.*|open-lesson|cycle-state|hist-toggle|hist-del|clear-history|clear-class.*|clear-practice.*|reset-score|score-toggle|unlink-level|auto-link|refresh-curriculum|suggest-name|plan-type|clear-student|st-reset|add-chelper|del-chelper|helper-up|helper-down|helper-toggle)$/;
  function blocker(ev){
    var t = ev.target && ev.target.closest ? ev.target.closest("[data-action]") : null; if (!t) return;
    var a = t.getAttribute("data-action");
    if (BLOCK.test(a) || (a === "show-view" && t.getAttribute("data-view") === "plan")) { ev.preventDefault(); ev.stopImmediatePropagation(); }
  }
  ["click", "dblclick", "contextmenu", "mousedown"].forEach(function(n){ window.addEventListener(n, blocker, true); });

  // ---- who is playing ----
  function owner(){ return jget("owner", null); }
  function loadMe(){
    var o = owner(), cur = jget("current", null);
    if (!o) { me = null; return; }
    if (cur && cur.name && cur.until > Date.now()) me = { name: cur.name, owner: o.name, borrowed: cur.name !== o.name, since: cur.since };
    else me = { name: o.name, owner: o.name, borrowed: false, since: Date.now() };
  }
  function applyStudent(){
    if (!me) return;
    window.postMessage({ type: "note-id-open-student", studentId: slug(me.name), studentName: me.name }, "*");
  }
  function until(){ return Date.now() + 100 * 60 * 1000; }   // a borrowed name lasts one class period at most
  function setCurrent(name){
    var o = owner();
    ls("current", JSON.stringify({ name: name, until: until(), since: Date.now() }));
    endSession(); loadMe(); startSession(); chip(); applyStudent();
    if (me && me.borrowed) toast(name + " is playing on " + o.name + "'s Chromebook");
  }

  // ---- session timer (X99). Every second of an open page goes into ONE of three buckets:
  //      ACTIVE = a real game is on screen and being played; IDLE = on screen (full screen + focused during class) but not playing; OFF = off screen.
  //      A session belongs to ONE bucket of the day: the class period (from the Schedule app) or "outside class". It ends when class ends and a new one starts. ----
  var sess = null, lastAct = Date.now(), tick = null, schedKnown = false;
  var SFIELDS = ["openSec", "idleSec", "offSec", "lastOffSec", "lastOffAt", "fsExits", "fsLast", "synth", "stills"];
  function hasSched(){ return schedKnown; }
  var TESTCLASS = /[?&]cloudtest=1(&|$)/.test(location.search);   // X105: a page opened with ?cloudtest=1 behaves as if class is in session (cover, full screen, PIN tests, sidebar, check-ins)
  window.ssTestClass = TESTCLASS;
  function inClass(){ return TESTCLASS || (schedKnown && !!period()); }   // X99b: no class times published = never "class" (no full-screen force, no PIN for tests)
  function bucketNow(){ var per = period(); return dstr() + ":" + (inClass() ? "c" + (per ? per.start : "") : "o"); }
  function newSess(){
    var per = period(), o = { id: Date.now().toString(36), name: me.name, owner: me.owner, borrowed: me.borrowed, date: dstr(), start: Date.now(), last: Date.now(), activeSec: 0, closed: false, games: {}, tests: [], qlog: [], inClass: inClass(), pname: per ? per.name : "", bucket: bucketNow() };
    SFIELDS.forEach(function(f){ o[f] = 0; }); return o;
  }
  function startSession(){
    if (!me) return;
    var all = jget("sessions", []), found = null, bk = bucketNow();
    all.forEach(function(s){ if (s.bucket === bk && s.name === me.name && s.owner === me.owner && !s.closed && (s.inClass || Date.now() - s.last < 20 * 60 * 1000)) found = s; });
    sess = found || newSess();
    SFIELDS.forEach(function(f){ if (sess[f] == null) sess[f] = 0; }); sess.games = sess.games || {}; sess.tests = sess.tests || []; sess.qlog = sess.qlog || [];
    if (!found) { all.push(sess); ls("sessions", JSON.stringify(all.slice(-400))); }
    prevState = "off"; prevKey = null; lastTickT = Date.now(); pausedSince = 0;
  }
  function saveSession(){ if (!sess) return; sess.last = Date.now(); var all = jget("sessions", []), i = all.map(function(s){ return s.id; }).indexOf(sess.id); if (i >= 0) all[i] = sess; else all.push(sess); ls("sessions", JSON.stringify(all.slice(-400))); }
  function endSession(){ if (sess) { account(); sess.closed = true; saveSession(); sess = null; } }
  ["pointerdown", "keydown", "pointermove", "touchstart"].forEach(function(n){ window.addEventListener(n, function(ev){ lastAct = Date.now(); if (needTap && ev.isTrusted !== false && fsOk() && (n === "pointerdown" || n === "keydown" || n === "touchstart")) { needTap = false; account(); } }, true); });
  // clicks that no finger made (a script / console injecting clicks while a real game is on screen) are counted and shown to the teacher
  window.addEventListener("click", function(ev){
    if (ev.isTrusted || window.__ssSelf || !sess) return;
    var sc = document.getElementById("stageCard"); if (sc && sc.classList.contains("playing")) sess.synth = (sess.synth || 0) + 1;
  }, true);

  var curKey = null, curQ = { title: "", mode: "" }, qWall = 0, gShown = 0, fsSince = 0, fsGone = 0, lastTickT = Date.now(), prevState = "off", prevKey = null, cfgReady = false, pausedSince = 0, needTap = false, roundOk = 0, roundN = 0;   // roundOk / roundN: this test round so far (for a test cut off by the end of class)
  window.ssInClass = function(){ return cfgReady && inClass(); };
  function fsOk(){
    if (document.visibilityState !== "visible") return false;
    if (PREVIEWISH) return true;
    if (!document.hasFocus()) return false;
    if (!inClass()) return true;   // outside class the page does not have to be in full screen
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }
  function gameOnScreen(){
    if (window.ssExtGame && window.ssExtGame.on) return true;   // X110: the Rhythm / Songs games (student-games.js)
    var sc = document.getElementById("stageCard");
    return !!(sc && sc.classList.contains("playing") && document.getElementById("gameRoot") && !document.querySelector(".lost-overlay"));
  }
  function playing(){
    if (!sess || !curKey || !fsOk() || !gameOnScreen()) return false;
    if (needTap) return false;   // the student left the screen (or full screen): nothing counts until they touch the page again
    if (document.querySelector(".ss-ov")) return false;   // a PIN box or the "Still practicing?" box is open
    return true;
  }
  function gameRec(key, title, mode){ sess.games = sess.games || {}; return sess.games[key] || (sess.games[key] = { title: title, mode: mode, right: 0, wrong: 0, qsec: 0, qn: 0, sec: 0, rapid: 0, last: 0 }); }
  function modeName(m){ return (m === "test" && window.__ssTestKind === "practice") ? "practice test" : m; }
  // account(): puts the time since the last call into the bucket the page was in UNTIL NOW, then works out the bucket it is in from now on
  function account(){
    var now = Date.now(), dt = (now - lastTickT) / 1000; lastTickT = now;
    if (!sess) return;
    if (dt > 1200) { prevState = "off"; return; }
    var rest = 0; if (dt > 20) { rest = dt - 2; dt = 2; }   // the page was frozen (lid shut, sleep): only the last two seconds can have been what it was doing before
    sess.openSec += dt + rest; sess.offSec += rest;
    if (prevState === "play") { sess.activeSec += dt; if (prevKey) { var g = sess.games[prevKey]; if (g) g.sec += dt; } }
    else if (prevState === "idle") sess.idleSec += dt; else sess.offSec += dt;
    var inNow = fsOk(); if (!inNow && curKey) needTap = true;
    var pl = playing();
    prevState = pl ? "play" : (inNow ? "idle" : "off"); prevKey = pl ? curKey : null;
    if (pl) pausedSince = 0; else if (!pausedSince) pausedSince = now;
    if (inNow && !fsSince) { fsSince = now; if (fsGone) { sess.lastOffSec = (now - fsGone) / 1000; sess.lastOffAt = fsGone; } fsGone = 0; }
    else if (!inNow && fsSince) {
      fsSince = 0; fsGone = now; sess.fsExits++; sess.fsLast = now; saveSession();
      // a TEST that leaves full screen (or the window) during class is stopped, not paused
      if (!PREVIEWISH && inClass() && curQ && curQ.mode === "test" && gameOnScreen() && !document.querySelector(".ss-ov")) stopTestLeft("left full screen");
    }
  }
  ["visibilitychange", "fullscreenchange", "webkitfullscreenchange"].forEach(function(n){ document.addEventListener(n, function(){ account(); }); });
  window.addEventListener("blur", function(){ account(); }); window.addEventListener("focus", function(){ account(); });
  window.addEventListener("ss-question", function(ev){
    var d = ev.detail || {}, m = modeName(d.mode);
    curKey = d.demo ? null : (d.title + "|" + m); curQ = { title: d.title, mode: d.mode };
    qWall = Date.now(); account();
  });
  window.addEventListener("ss-attempt", function(ev){
    var d = ev.detail || {}; if (!sess) return;
    var m = modeName(d.mode), g = gameRec(d.title + "|" + m, d.title, m), wall = Math.min(7200, (Date.now() - (qWall || Date.now())) / 1000);   // how long the question was ON SCREEN, active or not
    if (m === "test") { roundN++; if (d.ok) roundOk++; }
    if (d.ok) g.right++; else g.wrong++;
    g.qsec += wall; g.qn++; if (wall < 1.2) g.rapid = (g.rapid || 0) + 1; g.last = Date.now();
    sess.qlog.push([Math.round(wall * 10) / 10, d.ok ? 1 : 0, m === "test" ? 1 : 0]); if (sess.qlog.length > 400) sess.qlog = sess.qlog.slice(-400);
    qWall = Date.now(); saveSession();
  });
  window.addEventListener("pagehide", function(){ account(); saveSession(); });
  // X102: what the optional cloud ping (student-cloud.js) may report: no name, just the state of this device
  window.ssStatus = function(){
    var g = (sess && sess.games) || {}, r = 0, w = 0, a = 0; Object.keys(g).forEach(function(k){ r += g[k].right || 0; w += g[k].wrong || 0; a += g[k].sec || 0; });
    return { inClass: inClass(), preview: PREVIEWISH, playing: playing(), state: prevState, game: curQ && curQ.title || "", mode: curQ && curQ.mode || "", right: r, wrong: w, active: Math.round(a), act: lastAct, name: me ? me.name : "" };
  };

  // "Still practicing?" after a stretch with no mouse / keyboard: the timer is paused until the student taps the button
  function showStill(){
    var test = curQ && /test/.test(curQ.mode || ""), w = test ? "testing" : "practicing";
    var ov = overlay('<h2>Still ' + w + '?</h2><p>Tap the button to keep going. Your active time is paused until you do.</p><div class="ss-btns"><button type="button" class="ss-btn primary" id="ssStillOk">Yes, I\'m still ' + w + '</button></div>', "still");
    if (sess) { sess.stills = (sess.stills || 0) + 1; saveSession(); }
    ov.querySelector("#ssStillOk").onclick = function(){ ov.remove(); lastAct = Date.now(); account(); };
  }
  function stopTestLeft(reason){
    if (!sess) return;
    var cut = reason === "class ended";   // X101: class ended mid-test -> a PRACTICE test, never counted, with the score up to the last answered question
    sess.tests.push({ t: Date.now(), title: curQ.title, correct: roundOk, total: roundN, passed: false, accepted: cut ? true : false, stopped: reason, practice: cut });
    roundOk = roundN = 0;
    saveSession(); curKey = null; stopGame(); refresh(true);
  }
  // class ends: a warning for the last 10 seconds, then the session closes and a new "outside class" one starts (a class starting opens a new class session straight away)
  function classWarn(){
    var per = period(), box = document.getElementById("ssEnd");
    if (sess && sess.inClass && schedKnown && per) {
      var e = new Date(), p = per.end.split(":"); e.setHours(+p[0], +p[1], 0, 0);
      var left = Math.ceil((e - Date.now()) / 1000);
      if (left <= 10 && left > 0) { if (!box) { box = document.createElement("div"); box.id = "ssEnd"; box.className = "ss-end"; document.body.appendChild(box); } box.textContent = "Class is ending. This session closes in " + left + " s."; return; }
    }
    if (box) box.remove();
  }
  function rollSession(){
    if (curQ && curQ.mode === "test" && gameOnScreen() && !document.querySelector(".ss-ov") && sess && sess.inClass) stopTestLeft("class ended");
    var box = document.getElementById("ssEnd"); if (box) box.remove();
    endSession(); startSession(); chip();
  }

  function mySessions(){ return jget("sessions", []).filter(function(x){ return me && x.name === me.name; }); }
  function fmtDur(sec){ return sec < 60 ? Math.round(sec) + " s" : fmt(sec); }
  function qStats(log){
    var ts = (log || []).map(function(q){ return q[0]; }).sort(function(a, b){ return a - b; }), n = ts.length; if (!n) return null;
    return { n: n, med: n % 2 ? ts[(n - 1) / 2] : (ts[n / 2 - 1] + ts[n / 2]) / 2, max: ts[n - 1], quick: ts.filter(function(t){ return t < 2; }).length, stall: ts.filter(function(t){ return t > 120; }).length };
  }
  function qStatsHtml(log, strip){
    var q = qStats(log); if (!q) return "";
    var h = '<div class="ss-q2">Median question <b>' + fmtDur(q.med) + '</b> &middot; Longest <b>' + fmtDur(q.max) + '</b><br>Quick (under 2 s): <b>' + q.quick + '</b> &middot; Stalled (over 2 min): <b>' + q.stall + '</b> &middot; Answered: ' + q.n + '</div>';
    if (strip) h += '<div class="ss-strip" title="Newest question on the left. Height = time on screen. Red = wrong. Amber outline = over 2 minutes.">' + (log || []).slice(-40).reverse().map(function(a){ var t = a[0], hgt = Math.round(Math.min(30, 4 + 6 * Math.log(1 + t) / Math.LN2)); return '<i class="' + (a[1] ? "ok" : "no") + (t > 120 ? " long" : "") + '" style="height:' + hgt + 'px" title="' + fmtDur(t) + (a[1] ? "" : " (wrong)") + '"></i>'; }).join("") + '</div>';
    return h;
  }
  function todayStats(){
    var d = dstr(), t = { sec: 0, right: 0, wrong: 0, qsec: 0, qn: 0, rapid: 0, qlog: [] };
    mySessions().forEach(function(x){
      if (x.date !== d) return;
      t.sec += x.activeSec || 0; t.qlog = t.qlog.concat(x.qlog || []);
      Object.keys(x.games || {}).forEach(function(k){ var g = x.games[k]; t.right += g.right; t.wrong += g.wrong; t.qsec += g.qsec; t.qn += g.qn; t.rapid += g.rapid || 0; });
    });
    return t;
  }
  function testLine(t){
    var kind = t.practice ? "practice" : "class";
    var st = t.stopped ? "stopped: " + esc(t.stopped) : (t.practice ? "practice test, not counted" : (t.accepted === true ? "score kept" : t.accepted === false ? "score cleared" : "waiting for the PIN"));
    return '<div class="ss-test ' + kind + '"><b>' + (t.practice ? "PRACTICE TEST" : "TEST") + '</b> ' + esc(t.title) + ((t.stopped && !t.total) ? "" : ' &middot; ' + t.correct + '/' + t.total + ' &middot; ' + (t.passed ? "Passed" : "Not passed")) + ' &middot; <span>' + st + '</span> <small>' + hm(new Date(t.t)) + '</small></div>';
  }
  function sessBody(x, cur){
    var gs = Object.keys(x.games || {}).map(function(k){ return x.games[k]; }).sort(function(a, b){ return (b.last || 0) - (a.last || 0); });   // newest first
    var ts = (x.tests || []).slice().reverse(), h = "";
    if (x.synth) h += '<div class="ss-warn">Clicks made by a script during games: ' + x.synth + '</div>';
    if (x.stills) h += '<div class="ss-hl">"Still practicing?" boxes shown: ' + x.stills + '</div>';
    h += qStatsHtml(x.qlog, true);
    h += ts.map(testLine).join("");
    h += gs.length ? '<table class="ss-tbl"><tr><th>Game</th><th>Right</th><th>Wrong</th><th>Avg. Question Time</th><th>Active</th></tr>' + gs.map(function(g){
      var tc = g.mode === "test" ? "tst" : (g.mode === "practice test" ? "pt" : ""), badge = g.mode === "test" ? '<b class="ss-tb">TEST</b> ' : (g.mode === "practice test" ? '<b class="ss-tb pt">PRACTICE TEST</b> ' : "");
      return '<tr class="' + tc + '"><td>' + badge + esc(g.title) + (tc ? "" : ' <small>(' + esc(g.mode) + ')</small>') + '</td><td>' + g.right + '</td><td>' + g.wrong + '</td><td>' + (g.qn ? fmtDur(g.qsec / g.qn) : "-") + '</td><td>' + fmt(g.sec) + '</td></tr>'; }).join("") + '</table>' : '<div class="ss-quiet">No questions answered yet.</div>';
    return h;
  }
  function badge(x){ return x.inClass ? '<span class="ss-bd cls">CLASS' + (x.pname ? " &middot; " + esc(x.pname) : "") + '</span>' : '<span class="ss-bd out">OUTSIDE CLASS</span>'; }
  function histHtml(){
    var cur = sess && sess.id, list = mySessions().filter(function(x){ return x.id !== cur; }).sort(function(a, b){ return b.start - a.start; });
    if (!list.length) return '<div class="ss-quiet">No earlier sessions on this Chromebook yet.</div>';
    var days = [], by = {};
    list.forEach(function(x){ if (!by[x.date]) { by[x.date] = []; days.push(x.date); } by[x.date].push(x); });
    return days.map(function(d){
      var tot = 0; by[d].forEach(function(x){ tot += x.activeSec || 0; });
      return '<div class="ss-day"><div class="ss-dayh"><b>' + esc(new Date(by[d][0].start).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })) + '</b><span>active ' + fmt(tot) + '</span></div>' + by[d].map(function(x){
        var R = 0, W = 0; Object.keys(x.games || {}).forEach(function(k){ R += x.games[k].right; W += x.games[k].wrong; });
        var nt = (x.tests || []).length;
        return '<details class="ss-h ' + (x.inClass ? "cls" : "out") + '" data-sid="' + esc(x.id) + '"><summary>' + badge(x) + ' ' + hm(new Date(x.start)) + ' &middot; active ' + fmt(x.activeSec) + ' &middot; ' + R + '/' + (R + W) + (nt ? ' &middot; <span class="ss-tb">' + nt + ' test' + (nt > 1 ? "s" : "") + '</span>' : "") + '</summary>' +
          '<div class="ss-hl">' + hm(new Date(x.start)) + ' to ' + hm(new Date(x.last)) + (x.inClass ? ' &middot; open ' + fmt(x.openSec) + ' &middot; on screen, not playing ' + fmt(x.idleSec) + ' &middot; off screen ' + fmt(x.offSec) + ' &middot; left full screen ' + (x.fsExits || 0) + 'x' : ' &middot; active ' + fmt(x.activeSec)) + '</div>' + sessBody(x) + '</details>'; }).join("") + '</div>';
    }).join("");
  }
  function refresh(full){
    if (!sess) return;
    function set(id, v){ var e = document.getElementById(id); if (e && e.textContent !== v) e.textContent = v; }
    set("ssMin", fmt(sess.activeSec)); set("ssOpen", fmt(sess.openSec)); set("ssIdle", fmt(sess.idleSec)); set("ssOff", fmt(sess.offSec));
    var pl = playing(), pf = pl ? 0 : (pausedSince ? (Date.now() - pausedSince) / 1000 : 0), cls = pl ? "g" : (pf < 30 ? "y" : "r");
    var mn = document.getElementById("ssMin"); if (mn && mn.className !== cls) mn.className = cls;
    var st = document.getElementById("ssState");
    if (st) {
      var why = pl ? "counting: a game is being played" : (!fsOk() ? (inClass() ? "not counting: not in full screen" : "not counting: window not on screen") : ((needTap || document.querySelector(".ss-ov")) ? "not counting: tap the game to continue" : "not counting: no game is running"));
      if (st.textContent !== why) st.textContent = why; st.className = "ss-pst " + cls;
    }
    var qq = document.getElementById("ssQcur");
    if (qq) { var qsec = qWall && curKey && gameOnScreen() ? (Date.now() - qWall) / 1000 : -1; qq.textContent = qsec < 0 ? "-" : fmt(qsec); qq.className = qsec > 120 ? "r" : (qsec > 60 ? "y" : ""); }
    var hostB = document.getElementById("ssBar"); if (hostB) hostB.classList.toggle("ss-nocls", !inClass());   // X104: outside class only the active-game time matters
    var tot = Math.max(1, sess.openSec), seg = document.getElementById("ssSeg");
    if (seg && seg.children.length === 3) { seg.children[0].style.width = (100 * sess.activeSec / tot) + "%"; seg.children[1].style.width = (100 * sess.idleSec / tot) + "%"; seg.children[2].style.width = (100 * sess.offSec / tot) + "%"; }
    var la = document.getElementById("ssLast");
    if (la) { var cu = !fsSince && fsGone ? (Date.now() - fsGone) / 1000 : 0; la.textContent = cu ? fmt(cu) + " (now)" : (sess.lastOffAt ? fmt(sess.lastOffSec) + " at " + hm(new Date(sess.lastOffAt)) : "none yet"); }
    var fb = document.getElementById("ssFs");
    if (fb) {
      var inFs = fsSince > 0, ex = sess.fsExits || 0, exTxt = ex ? "Left full screen " + ex + (ex === 1 ? " time" : " times") + " this session (last at " + hm(new Date(sess.fsLast)) + ")" : "Has not left full screen this session";
      fb.className = "ss-fs" + (inFs ? "" : " out");
      fb.innerHTML = inFs ? '<span>On screen, unbroken</span><b>' + fmt((Date.now() - fsSince) / 1000) + '</b><small>' + exTxt + '</small>' : '<span>OFF SCREEN' + (fsGone ? ' for' : '') + '</span><b>' + (fsGone ? fmt((Date.now() - fsGone) / 1000) : "-") + '</b><small>' + (ex ? exTxt : "Waiting to start") + '</small>';
    }
    var per = period(), ps = document.getElementById("ssPsub2"); if (ps) { var t = per ? per.name + " (" + ampm24(per.start) + " - " + ampm24(per.end) + ")" : (TESTCLASS ? "Class time (test page)" : "Outside class time"); if (ps.textContent !== t) ps.textContent = t; }
    if (full) {
      var mo = document.getElementById("ssMore");
      if (mo) { var T = todayStats(), q = qStats(T.qlog); mo.innerHTML = 'Total active today: <b>' + fmt(T.sec) + '</b><br>' + T.right + ' right &middot; ' + T.wrong + ' wrong' + (T.qn ? '<br>Avg. Question Time: <b>' + fmtDur(T.qsec / T.qn) + '</b>' : "") + (q ? '<br>Median question: <b>' + fmtDur(q.med) + '</b> &middot; Longest: <b>' + fmtDur(q.max) + '</b><br>Quick (under 2 s): ' + q.quick + ' &middot; Stalled (over 2 min): ' + q.stall : "") + (T.rapid >= 3 ? '<br><span class="ss-warn2">Rapid answers (under 1.2 s): ' + T.rapid + '</span>' : ""); }
      var cb = document.getElementById("ssCurBadge"); if (cb) cb.innerHTML = badge(sess);
      var cu2 = document.getElementById("ssCur"); if (cu2) { var h = sessBody(sess, true); if (cu2.getAttribute("data-h") !== h) { cu2.setAttribute("data-h", h); cu2.innerHTML = h; } }
    }
  }
  function startTick(){
    if (tick) return; lastTickT = Date.now();
    tick = setInterval(function(){
      if (!sess) return;
      account();
      if (Math.floor(sess.openSec) % 10 === 0) saveSession();
      if (schedKnown) { classWarn(); if (sess.bucket !== bucketNow()) rollSession(); }
      var now = Date.now();
      if (!PREVIEWISH && curKey && fsOk() && gameOnScreen() && !document.querySelector(".ss-ov") && now - lastAct > (+cfg.stillSec || 120) * 1000) showStill();
      gShown++; refresh(gShown % 5 === 0);
    }, 1000);
  }

  // ---- today's messages: colored boxes beside the game buttons ----
  function cleanHtml(h){
    var d = new DOMParser().parseFromString("<body>" + String(h || "") + "</body>", "text/html"), out = "";
    (function walk(n){ n.childNodes.forEach(function(c){
      if (c.nodeType === 3) out += esc(c.nodeValue);
      else if (c.nodeType === 1) { var t = c.tagName.toLowerCase();
        if (t === "b" || t === "strong") { out += "<b>"; walk(c); out += "</b>"; } else if (t === "u") { out += "<u>"; walk(c); out += "</u>"; }
        else if (t === "br") out += "<br>"; else if (t === "div" || t === "p") { if (out && !/<br>$/.test(out)) out += "<br>"; walk(c); } else walk(c); }
    }); })(d.body);
    return out;
  }
  window.ssMsgsHtml = function(){
    var list = cfg.messages && cfg.messages.length ? cfg.messages : (cfg.today ? [{ html: esc(cfg.today), color: "#2fb067" }] : []);
    return list.map(function(m, ix){ var c = /^#[0-9a-f]{6}$/i.test(m.color) ? m.color : "#3a2f8f"; return '<div class="ss-msg" data-mi="' + (m.i != null ? m.i : ix) + '" style="--mc:' + c + '"><div class="ss-mi">' + cleanHtml(m.html) + '</div></div>'; }).join("");
  };
  function fillMsgs(){ var e = document.getElementById("ssMsgs"); if (e) e.innerHTML = window.ssMsgsHtml(); }
  // ---- if the game would push off the screen, the whole page is scaled down to fit (no scrolling) ----
  var fitT = 0;
  function fit(){
    var app = document.getElementById("app"); if (!app || !document.body.classList.contains("ss-on")) return;
    app.style.zoom = "";
    var H = window.innerHeight, z = 1;
    for (var i = 0; i < 4; i++) { var sh = document.documentElement.scrollHeight; if (sh <= H + 1) break; z = Math.max(0.45, z * H / sh); app.style.zoom = String(z); }
  }
  function fitSoon(){ clearTimeout(fitT); fitT = setTimeout(fit, 120); }
  window.addEventListener("resize", fitSoon); setInterval(fitSoon, 3000);

  // ---- UI ----
  function toast(msg){
    var t = document.createElement("div"); t.className = "ss-toast"; t.textContent = msg; document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 4500);
  }
  function periodStartMs(per){ var p = per.start.split(":"), d = new Date(); d.setHours(+p[0], +p[1], 0, 0); return d.getTime(); }
  function fmt(sec){ sec = Math.max(0, Math.round(sec || 0)); if (sec >= 3600) return Math.floor(sec / 3600) + ":" + pad(Math.floor(sec % 3600 / 60)) + ":" + pad(sec % 60); return Math.floor(sec / 60) + ":" + pad(sec % 60); }   // X104: 57355 s shows 15:55:55, not 955:55
  function ampm24(hhmm){ var p = String(hhmm).split(":"), d = new Date(); d.setHours(+p[0], +p[1], 0, 0); return hm(d); }
  function dayOk(p, d){ if (p.dates && p.dates.length) return p.dates.indexOf(dstr(d)) >= 0; if (p.days && p.days.length) return p.days.indexOf(d.getDay()) >= 0; return true; }
  function period(){
    var d = new Date(), now = pad(d.getHours()) + ":" + pad(d.getMinutes()), cd = cfg.classDays && cfg.classDays[dstr(d)];
    if (cd && cd[0] <= now && now < cd[1]) return { name: cfg.classLabel ? "Period " + cfg.classLabel : "Class", start: cd[0], end: cd[1] };
    var list = (cfg.schedule || []);
    for (var i = 0; i < list.length; i++) if (dayOk(list[i], d) && list[i].start <= now && now < list[i].end) return list[i];
    return null;
  }
  function chip(){
    var host = document.getElementById("ssBar"); if (!host) return;
    if (!me) { host.innerHTML = ""; return; }
    var side = host.querySelector(".ss-scroll"), keep = side ? side.scrollTop : 0, openIds = [].map.call(host.querySelectorAll("details[open]"), function(e){ return e.getAttribute("data-sid"); });
    var dcode = window.ssDeviceCode ? window.ssDeviceCode() : "";   // X109: the sidebar shows this Chromebook's device code where the code of the day used to be
    host.innerHTML = '<div class="ss-side"><div class="ss-top"><div class="ss-who"><div class="ss-pname">' + esc(me.name) + '</div><div class="ss-psub">' + (me.borrowed ? "Borrowing " + esc(me.owner) + "'s Chromebook<br>" : "") + '<span id="ssPsub2" style="color:#3a2f8f"></span></div></div>' +
      '<div class="ss-pmin"><b id="ssMin" class="y">0:00</b><span><i class="dot a"></i>active in games this session</span><span class="ss-pst" id="ssState">not counting</span></div>' +
      '<div class="ss-seg" id="ssSeg"><i class="a"></i><i class="i"></i><i class="o"></i></div>' +
      '<div class="ss-tiles"><div class="ss-tile"><span>This question on screen</span><b id="ssQcur">-</b></div><div class="ss-tile ho"><span>Total time open</span><b id="ssOpen">0:00</b></div>' +
      '<div class="ss-tile ho"><span><i class="dot i"></i>On screen, not playing</span><b id="ssIdle">0:00</b></div><div class="ss-tile ho"><span><i class="dot o"></i>Off screen</span><b id="ssOff">0:00</b></div>' +
      '<div class="ss-tile wide ho"><span>Most recent time off screen</span><b id="ssLast">none yet</b></div></div>' +
      '<div class="ss-fs out" id="ssFs"></div></div>' +
      '<div class="ss-scroll"><div class="ss-sec">This session <span id="ssCurBadge"></span></div><div class="ss-pmore" id="ssMore"></div><div id="ssCur"></div>' +
      '<div class="ss-sec">Earlier sessions</div><div id="ssHist">' + histHtml() + '</div>' +
      '<button type="button" class="ss-pb" id="ssTeach" title="teacher">teacher &middot; site ' + window.SS_BUILD + '</button></div>' +
      (dcode ? '<div class="ss-code" id="ssDevCode">Device code <b>' + dcode + '</b></div>' : "") + '</div>';
    [].forEach.call(host.querySelectorAll("details"), function(e){ if (openIds.indexOf(e.getAttribute("data-sid")) >= 0) e.open = true; });
    document.getElementById("ssTeach").onclick = function(){ teacherGate(whoMenu); };
    var ns = host.querySelector(".ss-scroll"); if (ns) ns.scrollTop = keep;
    refresh(true);
  }

  // ---- the teacher PIN (checked here; the site's config only holds a hash of it) ----
  function enc(s){ return new TextEncoder().encode(s); }
  function hex(b){ return Array.prototype.map.call(new Uint8Array(b), function(x){ return ("0" + x.toString(16)).slice(-2); }).join(""); }
  function hashPin(p){
    if (/^v2:/.test(cfg.pinHash || "")) {   // v2: slow PBKDF2 hash (150,000 rounds, salted), so the hash in the public config file is hard to guess offline
      return crypto.subtle.importKey("raw", enc(p), "PBKDF2", false, ["deriveBits"]).then(function(k){ return crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc("ss-v2|" + cfg.secret), iterations: 150000, hash: "SHA-256" }, k, 256); }).then(function(b){ return "v2:" + hex(b); });
    }
    return crypto.subtle.digest("SHA-256", enc("ss-pin|" + p)).then(hex);
  }
  function verifyPin(p){
    var lk = jget("pinlock", null);
    if (lk && lk.until > Date.now()) return Promise.resolve({ ok: false, wait: Math.ceil((lk.until - Date.now()) / 1000) });
    if (!cfg.pinHash) return Promise.resolve({ ok: false, none: true });
    return hashPin(p).then(function(h){
      if (h === cfg.pinHash) { ls("pinlock", "null"); return { ok: true }; }
      var f = ((lk && lk.n) || 0) + 1; ls("pinlock", JSON.stringify(f >= 3 ? { n: 0, until: Date.now() + 120000 } : { n: f, until: 0 }));
      return { ok: false, left: Math.max(0, 3 - f), wait: f >= 3 ? 120 : 0 };
    });
  }
  function pinMsg(r){ return r.none ? "No teacher PIN has been set for this site yet." : (r.wait ? "Too many wrong tries. Wait " + r.wait + " seconds." : "That PIN is not right (" + r.left + (r.left === 1 ? " try" : " tries") + " left)."); }
  // o: { title, sub, okLabel, cancelLabel, onOk(), onCancel() }
  function pinPrompt(o){
    var ov = overlay('<h2>' + esc(o.title) + '</h2>' + (o.sub ? '<p>' + o.sub + '</p>' : "") + '<input type="text" id="ssPinP" maxlength="40" name="ssp-x" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" data-lpignore="true" data-1p-ignore="true" data-form-type="other" style="-webkit-text-security:disc;text-security:disc"><div class="ss-err" id="ssPinPE"></div><div class="ss-btns"><button type="button" class="ss-btn" id="ssPinPX">' + esc(o.cancelLabel || "Cancel") + '</button><button type="button" class="ss-btn primary" id="ssPinPOk">' + esc(o.okLabel || "Go") + '</button></div>');
    var pi = ov.querySelector("#ssPinP"); pi.value = ""; pi.focus(); setTimeout(function(){ if (pi.value && !pi.__typed) pi.value = ""; }, 60); pi.addEventListener("keydown", function(){ pi.__typed = true; });   // X107: a browser that fills the box by itself gets it emptied again
    function go(){ verifyPin(pi.value).then(function(r){ if (r.ok) { ov.remove(); if (o.onOk) o.onOk(); } else { ov.querySelector("#ssPinPE").textContent = pinMsg(r); pi.value = ""; pi.focus(); } }); }
    ov.querySelector("#ssPinPOk").onclick = go; pi.onkeydown = function(e){ if (e.key === "Enter") go(); };
    ov.querySelector("#ssPinPX").onclick = function(){ ov.remove(); if (o.onCancel) o.onCancel(); };
    return ov;
  }
  function teacherGate(next){ pinPrompt({ title: "Teacher PIN", okLabel: "Go", cancelLabel: "Cancel", onOk: next }); }

  // ---- tests. DURING CLASS: the teacher's PIN starts a test, and at the end only the PIN can KEEP or CLEAR the score. OUTSIDE CLASS: no PIN; it is a "practice test" that never counts. ----
  window.ssGateTest = function(opts, retry){
    if (PREVIEWISH) return true;
    var isTest = opts && ((opts.student && !opts.studentPractice) || opts.mode === "test");
    if (!isTest) { window.__ssTestKind = null; return true; }
    roundOk = roundN = 0;
    if (!inClass()) { window.__ssTestKind = "practice"; return true; }
    if (window.__ssAllow) { window.__ssAllow = false; window.__ssTestKind = "class"; return true; }
    pinPrompt({ title: "Teacher PIN to start a test", sub: "Ask your teacher. Practice does not need a PIN.", okLabel: "Start test", cancelLabel: "Cancel", onOk: function(){ window.__ssAllow = true; retry(); } });
    return false;
  };
  function stopGame(){ var b = document.querySelector('[data-action="end-practice"]'); if (b) { window.__ssSelf = true; b.click(); window.__ssSelf = false; } }
  function markTest(rec, accepted){
    ls("pendingTest", "null");
    var all = jget("sessions", []), hit = false;
    all.forEach(function(x){ (x.tests || []).forEach(function(t){ if (t.t === rec.t) { t.accepted = accepted; hit = true; } }); });
    if (hit) ls("sessions", JSON.stringify(all));
    if (sess) (sess.tests || []).forEach(function(t){ if (t.t === rec.t) t.accepted = accepted; });
    if (!hit && sess) { sess.tests.push({ t: rec.t, title: rec.title, correct: rec.correct, total: rec.total, passed: rec.passed, accepted: accepted }); saveSession(); }
    refresh(true);
  }
  function testEnd(rec){
    var ov = overlay('<h2>Test finished: ' + rec.correct + '/' + rec.total + (rec.passed ? " (passed)" : "") + '</h2><p>Show your teacher. Only the teacher\'s PIN can keep or clear this score.</p><input type="password" id="ssTEp" maxlength="40" autocomplete="off"><div class="ss-err" id="ssTEe"></div><div class="ss-btns"><button type="button" class="ss-btn" id="ssTEclear">Clear score</button><button type="button" class="ss-btn primary" id="ssTEkeep">Keep score</button></div>');
    var pi = ov.querySelector("#ssTEp"); pi.focus();
    function act(keep){
      verifyPin(pi.value).then(function(r){
        if (!r.ok) { ov.querySelector("#ssTEe").textContent = pinMsg(r); pi.value = ""; pi.focus(); return; }
        ov.remove();
        if (!keep) { try { window.ssRejectTest && window.ssRejectTest(rec.undo); } catch (e) {} }
        markTest(rec, keep); stopGame();
      });
    }
    ov.querySelector("#ssTEkeep").onclick = function(){ act(true); }; ov.querySelector("#ssTEclear").onclick = function(){ act(false); };
    pi.onkeydown = function(e){ if (e.key === "Enter") act(true); };
  }
  window.addEventListener("ss-finish", function(ev){
    var d = ev.detail || {}; if (PREVIEWISH || !d.test) return;
    var practice = window.__ssTestKind === "practice"; roundOk = roundN = 0;
    var rec = { t: Date.now(), title: d.title, correct: d.correct, total: d.total, passed: !!d.passed, accepted: null, undo: d.undo };
    if (practice) {   // outside class: a practice test. Its score does not count (results put back as they were); the history line stays, marked as practice
      try { window.ssRejectTest && window.ssRejectTest(d.undo, true); } catch (e) {}
      if (sess) { sess.tests.push({ t: rec.t, title: rec.title, correct: rec.correct, total: rec.total, passed: rec.passed, accepted: true, practice: true }); saveSession(); }
      refresh(true); return;
    }
    if (!rec.passed) {   // X101: a test that was NOT passed needs no PIN; the score is simply kept, the student just sees it and continues
      if (sess) { sess.tests.push({ t: rec.t, title: rec.title, correct: rec.correct, total: rec.total, passed: false, accepted: true }); saveSession(); }
      var ov = overlay('<h2>Test finished: ' + rec.correct + '/' + rec.total + '</h2><p>Not passed this time. Your score was saved. Practice, then try again.</p><div class="ss-btns"><button type="button" class="ss-btn primary" id="ssFailOk">OK</button></div>', "fail");
      ov.querySelector("#ssFailOk").onclick = function(){ ov.remove(); stopGame(); refresh(true); }; return;
    }
    ls("pendingTest", JSON.stringify(rec));
    if (sess) { sess.tests.push({ t: rec.t, title: rec.title, correct: rec.correct, total: rec.total, passed: rec.passed, accepted: null }); saveSession(); }
    testEnd(rec);
  });

  function overlay(html, cls){
    var o = document.createElement("div"); o.className = "ss-ov " + (cls || ""); o.innerHTML = '<div class="ss-card">' + html + '</div>'; document.body.appendChild(o);
    if (PREVIEWISH) { var xb = document.createElement("button"); xb.type = "button"; xb.className = "ss-pvx"; xb.textContent = "Close (preview only)"; xb.onclick = function(){ o.remove(); }; o.appendChild(xb); }   // X109: in the teacher's preview every box can be closed; the real student page never gets this button
    return o;
  }
  function askName(first){
    var o = overlay('<h2>' + (first ? "Who is this Chromebook for?" : "Who is using this Chromebook?") + '</h2>' +
      '<p>' + (first ? "Type your first and last name the way your teacher knows you, then press Go. This Chromebook will remember it, and only your teacher can change it." : "Type YOUR name. Your work counts for you only, and this shows on your session screen.") + '</p>' +
      '<input type="text" id="ssName" maxlength="40" placeholder="First and last name" autocomplete="off"><div class="ss-err" id="ssErr"></div>' +
      '<div class="ss-btns">' + (first ? "" : '<button type="button" class="ss-btn" id="ssCancel">Cancel</button>') + '<button type="button" class="ss-btn primary" id="ssOk">' + (first ? "Go" : "Start") + '</button></div>', "gate");
    var inp = o.querySelector("#ssName"); inp.focus();
    function go(){
      var n = inp.value.replace(/\s+/g, " ").trim();
      if (n.split(" ").length < 2 || n.length < 4) { o.querySelector("#ssErr").textContent = "Please type your first and last name."; return; }
      o.remove();
      if (first) { ls("owner", JSON.stringify({ name: n, at: Date.now() })); loadMe(); startSession(); chip(); applyStudent(); }
      else setCurrent(n);
    }
    o.querySelector("#ssOk").onclick = go; inp.onkeydown = function(e){ if (e.key === "Enter") go(); };
    var c = o.querySelector("#ssCancel"); if (c) c.onclick = function(){ o.remove(); };
  }
  function whoMenu(){
    var o = owner(), items = [];
    items.push('<button type="button" class="ss-btn" id="ssBorrow">Someone else is using this Chromebook</button>');
    if (me && me.borrowed) items.push('<button type="button" class="ss-btn" id="ssBack">Back to ' + esc(o.name) + '</button>');
    items.push('<button type="button" class="ss-btn quiet" id="ssChange">Change this Chromebook\'s owner (teacher only)</button>');
    items.push('<button type="button" class="ss-btn quiet" id="ssTester">' + (isTester() ? "Stop being a test computer (show the device code again)" : "Use as my test computer today (no pairing needed)") + '</button>');
    var ov = overlay('<h2>' + esc(me.name) + '</h2><p>' + (me.borrowed ? "Borrowing " + esc(o.name) + "'s Chromebook." : "This is " + esc(o.name) + "'s Chromebook.") + '</p><div class="ss-col">' + items.join("") + '</div><div class="ss-btns"><button type="button" class="ss-btn" id="ssX">Close</button></div>');
    ov.querySelector("#ssX").onclick = function(){ ov.remove(); };
    ov.querySelector("#ssBorrow").onclick = function(){ ov.remove(); askName(false); };
    var b = ov.querySelector("#ssBack"); if (b) b.onclick = function(){ ov.remove(); ls("current", "null"); endSession(); loadMe(); startSession(); chip(); applyStudent(); };
    ov.querySelector("#ssTester").onclick = function(){ ov.remove(); if (isTester()) { ls("tester", "0"); try { localStorage.removeItem(P + "nopair:" + dstr()); localStorage.removeItem(P + "pairedlast"); } catch (e) {} } else ls("tester", String(Date.now())); if (pairOv) { pairOv.remove(); pairOv = null; } pairAtOpen(); };
    ov.querySelector("#ssChange").onclick = function(){
      ov.remove();
      pinPrompt({ title: "Teacher PIN", okLabel: "Go", cancelLabel: "Cancel", onOk: function(){ ls("owner", "null"); ls("current", "null"); endSession(); me = null; chip(); askName(true); } });
    };
  }
  function loadGames(){   // X110: the Rhythm and Songs games live in their own file
    try { if (window.ssGamesLoaded) return; window.ssGamesLoaded = true; var sc = document.createElement("script"); sc.src = "student-games.js?b=" + encodeURIComponent(window.SS_BUILD || ""); document.head.appendChild(sc); } catch (e) {}
  }
  function init(c){
    cfg = c || {}; schedKnown = !!((cfg.classDays && Object.keys(cfg.classDays).length) || (cfg.schedule && cfg.schedule.length)); cfgReady = true; pairAtOpen(); try { window.ssCoverCheck && window.ssCoverCheck(); } catch (e) {}   // X104: schedKnown first, else the class cover waited for the next 5 s check
    var bar = document.createElement("div"); bar.id = "ssBar"; bar.className = "ss-bar";
    document.body.appendChild(bar); if (!PREVIEWISH || /[?&]preview=1/.test(location.search)) document.body.classList.add("ss-on");
    schedKnown = !!((cfg.classDays && Object.keys(cfg.classDays).length) || (cfg.schedule && cfg.schedule.length));
    fillMsgs(); fitSoon(); loadGames();
    if (cfg.paused) { overlay('<h2>The games are paused</h2><p>' + esc(cfg.pausedMsg || "Your teacher has paused the site. Look at the classroom screen for what to do.") + '</p>', "gate"); return; }
    if (/[?&]class=1/.test(location.search)) { me = { name: "Class", owner: "Class", borrowed: false, since: Date.now() }; applyStudent(); return; }   // X88b: the teacher's docked class view: no name prompt, practice is logged for "Class"
    loadMe();
    if (!me) askName(true); else { startSession(); chip(); applyStudent(); }
    startTick();
    try { var pend = jget("pendingTest", null); if (pend && pend.t && !PREVIEWISH) setTimeout(function(){ testEnd(pend); }, 1500); } catch (e) {}   // a test ended but the PIN was not given yet (page reloaded): ask again
  }
  // X104: a settings push that PAUSES the site covers the page at once (even in the middle of a question); un-pausing / other changes reload the page when it is idle (student-cloud.js)
  // X106: live answers from the cloud service (student-cloud.js): HOLD (learning / review is up or bell-work is off: the page is covered and counts nothing) and PAIRING (the page shows its device code until the teacher pairs it to a student on his own computer).
  var holdOv = null, pairOv = null;
  function isTester(){ var t = Number(lg("tester") || 0); return !!t && new Date(t).toDateString() === new Date().toDateString(); }   // X110: the teacher's own test computer (PIN), valid for today
  function skipPair(){ return !!jget("nopair:" + dstr(), false) || isTester(); }
  function showPair(code){   // X108: the code is large, and it is shown by the page itself the moment it opens (no wait for the first answer from the service)
    if (pairOv && pairOv.isConnected) return;
    pairOv = overlay('<h2>Your device code</h2><div class="ss-pc">' + esc(String(code || "")) + '</div><p>Show this code to your teacher.</p>' +
      ((cfg.pairing && cfg.pairing.skip === false) ? "" : '<div style="margin-top:26px"><a href="#" id="ssNoPair" style="font-size:12px;color:#888;text-decoration:underline;opacity:.7">Start without pairing</a></div>') +
      (PREVIEWISH ? "" : '<div style="margin-top:10px"><a href="#" id="ssTestPc" style="font-size:11px;color:#aaa;text-decoration:underline;opacity:.6">Teacher</a></div>'), "gate pair");
    var np = pairOv.querySelector("#ssNoPair"); if (np) np.onclick = function(e){ e.preventDefault(); ls("nopair:" + dstr(), "true"); if (pairOv) { pairOv.remove(); pairOv = null; } };
    var tp = pairOv.querySelector("#ssTestPc"); if (tp) tp.onclick = function(e){ e.preventDefault(); teacherGate(function(){ ls("tester", String(Date.now())); if (pairOv) { pairOv.remove(); pairOv = null; } }); };   // X110: the teacher PIN makes this computer a test computer for today (no pairing needed; students never get this)
  }
  window.ssPairNeeded = function(){   // X110: the device code, when this Chromebook still has to be paired (the full-screen cover shows it too, so it is never hidden behind the cover)
    try {
      if (PREVIEWISH || !cfgReady || !(cfg.pairing && cfg.pairing.on) || !inClass() || skipPair() || /[?&]class=1/.test(location.search)) return "";
      var cl = window.__ssCloud || {}; if (cl.paired === true) return "";
      if (cl.paired !== false) { var pl = /^1:(\d+)$/.exec(localStorage.getItem(P + "pairedlast") || ""); if (pl && Date.now() - Number(pl[1]) < 20 * 60000) return ""; }
      return (window.ssDeviceCode && window.ssDeviceCode()) || "";
    } catch (e) { return ""; }
  };
  function pairAtOpen(){
    try { if (PREVIEWISH || /[?&]class=1/.test(location.search) || !(cfg.pairing && cfg.pairing.on) || !inClass() || skipPair()) return; var pl = /^1:(\d+)$/.exec(localStorage.getItem(P + "pairedlast") || ""); if (pl && Date.now() - Number(pl[1]) < 20 * 60000) return;   /* X110: only a "paired" answer from the last 20 minutes hides the code at once; an older one waits for the first answer from the service (about a second) */ var c = window.ssDeviceCode && window.ssDeviceCode(); if (c) showPair(c); } catch (e) {}
  }
  window.addEventListener("ss-live", function(ev){
    var d = ev.detail || {}; if (!cfgReady || PREVIEWISH || /[?&]class=1/.test(location.search)) return;
    if (d.hold && !d.offline) {
      var msg = d.why === "review" ? "Learning / review time. Your screen is paused. Look at the classroom screen." : (d.why === "bell" ? "Bell-work is paused. Look at the classroom screen for what to do." : "Your teacher has paused the site. Look at the classroom screen for what to do.");
      if (!holdOv) holdOv = overlay('<h2>Eyes up</h2><p>' + esc(msg) + '</p>', "gate hold");
      else { var pp = holdOv.querySelector("p"); if (pp && pp.textContent !== msg) pp.textContent = msg; }
    } else if (holdOv) { holdOv.remove(); holdOv = null; }
    var need = !!(cfg.pairing && cfg.pairing.on) && !d.offline && d.paired === false && inClass() && !skipPair();
    if (need && !pairOv) showPair(d.code);
    else if (!need && pairOv) { pairOv.remove(); pairOv = null; }
  });
  window.addEventListener("ss-livecfg", function(ev){
    var n = ev.detail || {}; if (!cfgReady || !n.paused || cfg.paused) return;
    cfg.paused = true; cfg.pausedMsg = n.pausedMsg;
    overlay('<h2>The games are paused</h2><p>' + esc(n.pausedMsg || "Your teacher has paused the site. Look at the classroom screen for what to do.") + '</p>', "gate");
  });
  // X109: click-to-inspect. Only inside the teacher's preview (the panel's iframe): a click on a game button, a message or a box tells the panel what was clicked, and the panel can ask this page to pulse-highlight something or show a box.
  if (PREVIEWISH && window.parent && window.parent !== window) {
    var tell = function(o){ try { window.parent.postMessage(Object.assign({ type: "ss-inspect" }, o), "*"); } catch (e) {} };
    document.addEventListener("click", function(ev){
      var t = ev.target; if (!t || !t.closest) return;
      var ovl = t.closest(".ss-ov");
      if (ovl) { if (t.closest(".ss-pvx")) return; var h = (ovl.querySelector("h2") || {}).textContent || ""; tell({ kind: "page", id: /pair/.test(ovl.className) ? "pair" : /still/.test(ovl.className) ? "still" : /paused/i.test(h) ? "paused" : /PIN/.test(h) ? "pin" : /Chromebook/.test(h) ? "name" : "" }); return; }
      var g = t.closest('[data-action="hub-type"]'); if (g) { tell({ kind: "game", id: g.getAttribute("data-type") }); return; }
      var g2 = t.closest("[data-ssg]"); if (g2) { tell({ kind: "game", id: g2.getAttribute("data-ssg") }); return; }
      var m = t.closest(".ss-msg"); if (m) { tell({ kind: "msg", i: +m.getAttribute("data-mi") }); return; }
      if (t.closest(".ss-msgs")) tell({ kind: "msgs" });
    }, true);
    window.addEventListener("message", function(ev){
      var d = ev.data; if (!d || ev.source !== window.parent) return;
      if (d.type === "ss-focus") {
        var el = d.kind === "game" ? (document.querySelector('[data-action="hub-type"][data-type="' + String(d.id).replace(/"/g, "") + '"]') || document.querySelector('[data-ssg="' + String(d.id).replace(/"/g, "") + '"]')) : d.kind === "msg" ? document.querySelector('.ss-msg[data-mi="' + (+d.i) + '"]') : d.kind === "msgs" ? document.querySelector(".ss-msgs") : null;
        if (!el) return; try { el.scrollIntoView({ block: "center", behavior: "smooth" }); } catch (e) {}
        el.classList.remove("ss-pulse"); void el.offsetWidth; el.classList.add("ss-pulse"); setTimeout(function(){ el.classList.remove("ss-pulse"); }, 3200);
      } else if (d.type === "ss-show") {
        [].forEach.call(document.querySelectorAll(".ss-ov"), function(o){ o.remove(); }); pairOv = null;
        try {
          if (d.page === "pair") showPair((window.ssDeviceCode && window.ssDeviceCode()) || "a1b2c3");
          else if (d.page === "paused") overlay('<h2>The games are paused</h2><p>' + esc(d.msg || "Your teacher has paused the site. Look at the classroom screen for what to do.") + '</p>', "gate");
          else if (d.page === "name") askName(true);
          else if (d.page === "still") showStill();
          else if (d.page === "pin") pinPrompt({ title: "Teacher PIN", okLabel: "Go", cancelLabel: "Cancel" });
        } catch (e) {}
      }
    });
  }
  window.STUDENT_READY.then(function(c){ if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ init(c); }); else init(c); });
})();

/* X90 deterrent (NOT security): on the real student page (not the teacher preview / class view) the page asks for full screen, covers itself when full screen
   is left, and swallows F12, Ctrl/Cmd+Shift+I / J / C, Ctrl/Cmd+U and the right-click menu. A determined student can get around all of this (Esc, the browser menu,
   other tools). Real protection = the school disabling DevTools, or keeping scores in a cloud service. */
(function(){
  "use strict";
  if (/[?&](preview|class)=1/.test(location.search)) return;
  var ov = null;
  function need(){ return !!(window.ssInClass && window.ssInClass()) && !(document.fullscreenElement || document.webkitFullscreenElement); }   // X98: only during a class period (the panel's schedule)
  function enter(){ var e = document.documentElement, f = e.requestFullscreen || e.webkitRequestFullscreen; try { var r = f && f.call(e); if (r && r.catch) r.catch(function(){}); } catch (x) {} }
  function codeHtml(){ var c = window.ssPairNeeded && window.ssPairNeeded(); return c ? '<div style="font-size:20px;opacity:.85">Your device code</div><div style="font:800 min(15vh,14vw) system-ui,sans-serif;letter-spacing:.04em;white-space:nowrap;line-height:1.1">' + c.replace(/[^a-z0-9]/gi, "") + '</div><div style="font-size:18px;margin-bottom:10px">Show this code to your teacher.</div>' : ""; }
  function show(){
    if (ov || !need()) return;
    ov = document.createElement("div");
    ov.setAttribute("style", "position:fixed;inset:0;z-index:2147483647;background:#1d1b3a;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;font:600 18px system-ui,sans-serif;text-align:center;padding:20px");
    ov.innerHTML = '<div class="cvc" style="display:flex;flex-direction:column;align-items:center">' + codeHtml() + '</div><div style="font-size:26px;max-width:520px">Only Available in Full Screen During Class</div><button type="button" style="font:700 18px system-ui;padding:12px 26px;border-radius:12px;border:0;background:#7c5cf5;color:#fff;cursor:pointer">Start (Full Screen)</button>';
    ov.querySelector("button").addEventListener("click", function(){ enter(); });
    document.body.appendChild(ov);
  }
  function hide(){ if (ov && !need()) { ov.remove(); ov = null; } }   // X95: the cover is taken away once full screen is on (it used to stay)
  function check(){ if (need()) { show(); var cv = ov && ov.querySelector(".cvc"); if (cv) { var h = codeHtml(); if (cv.getAttribute("data-h") !== h) { cv.innerHTML = h; cv.setAttribute("data-h", h); } } } else hide(); }
  window.ssCoverCheck = check;
  document.addEventListener("fullscreenchange", check);
  document.addEventListener("webkitfullscreenchange", check);
  document.addEventListener("keydown", function(ev){
    var k = (ev.key || "").toLowerCase(), m = ev.ctrlKey || ev.metaKey;
    if (ev.key === "F12" || (m && ev.shiftKey && (k === "i" || k === "j" || k === "c")) || (m && ev.altKey && k === "i") || (m && k === "u")) { ev.preventDefault(); ev.stopPropagation(); }
  }, true);
  document.addEventListener("contextmenu", function(ev){ ev.preventDefault(); }, true);
  setInterval(check, 1000);   // class starts / ends while the page is open (X104: every second, was 5 s)
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", check); else check();
})();
