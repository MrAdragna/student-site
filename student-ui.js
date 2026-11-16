/* student-ui.js (Student site v1, X98, 16 Nov 2026, c12). Loaded AFTER NoteID.js. Student identity (locked to the Chromebook's owner, borrowing),
   session timer, the "show my session" screen, today's focus message, and the teacher-only controls blocked. */
(function(){
  "use strict";
  var P = window.SS_PREFIX || "ss:"; window.SS_BUILD = "X98";
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
      ".ss-side { height: 100%; box-sizing: border-box; overflow-y: auto; background: #fff; border: 3px solid #3a2f8f; border-radius: 16px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }" +
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
      ".ss-side .ss-code { margin-top: auto; padding: 5px; text-align: center; } .ss-side .ss-code b { font-size: 26px; letter-spacing: 4px; }" +
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

  // ---- session timer (X98): every second of an open page goes into ONE of three buckets:
  //      ACTIVE = a real game is on screen and being played; IDLE = on screen (full screen + focused during class) but not playing; OFF = off screen. ----
  var sess = null, lastAct = Date.now(), tick = null;
  var SFIELDS = ["openSec", "idleSec", "offSec", "lastOffSec", "lastOffAt", "fsExits", "fsLast", "synth"];
  function newSess(){ var o = { id: Date.now().toString(36), name: me.name, owner: me.owner, borrowed: me.borrowed, date: dstr(), start: Date.now(), last: Date.now(), activeSec: 0, closed: false, games: {}, tests: [] }; SFIELDS.forEach(function(f){ o[f] = 0; }); return o; }
  function startSession(){
    if (!me) return;
    var all = jget("sessions", []), d = dstr(), found = null;
    var per0 = period(), ps0 = per0 ? periodStartMs(per0) : 0;   // the session starts over at the beginning of each class period
    all.forEach(function(s){ if (s.date === d && s.name === me.name && s.owner === me.owner && !s.closed && Date.now() - s.last < 20 * 60 * 1000 && s.start >= ps0) found = s; });
    sess = found || newSess();
    SFIELDS.forEach(function(f){ if (sess[f] == null) sess[f] = 0; }); sess.games = sess.games || {}; sess.tests = sess.tests || [];
    if (!found) { all.push(sess); ls("sessions", JSON.stringify(all.slice(-400))); }
    prevState = "off"; prevKey = null; lastTickT = Date.now();
  }
  function saveSession(){ if (!sess) return; sess.last = Date.now(); var all = jget("sessions", []), i = all.map(function(s){ return s.id; }).indexOf(sess.id); if (i >= 0) all[i] = sess; else all.push(sess); ls("sessions", JSON.stringify(all.slice(-400))); }
  function endSession(){ if (sess) { account(); sess.closed = true; saveSession(); sess = null; } }
  ["pointerdown", "keydown", "pointermove", "touchstart"].forEach(function(n){ window.addEventListener(n, function(){ lastAct = Date.now(); }, true); });
  // clicks that no finger made (a script / console injecting clicks while a real game is on screen) are counted and shown to the teacher
  window.addEventListener("click", function(ev){
    if (ev.isTrusted || window.__ssSelf || !sess) return;
    var sc = document.getElementById("stageCard"); if (sc && sc.classList.contains("playing")) sess.synth = (sess.synth || 0) + 1;
  }, true);

  var curKey = null, curQ = { title: "", mode: "" }, qWall = 0, gShown = 0, lastQ = 0, fsSince = 0, fsGone = 0, rollN = 0, lastTickT = Date.now(), prevState = "off", prevKey = null, cfgReady = false;
  function inClass(){ return !cfg.schedule || !cfg.schedule.length || !!period(); }   // no schedule typed into the panel = always counts as class
  window.ssInClass = function(){ return cfgReady && inClass(); };
  function fsOk(){
    if (document.visibilityState !== "visible") return false;
    if (PREVIEWISH) return true;
    if (!document.hasFocus()) return false;
    if (!inClass()) return true;   // outside class the page does not have to be in full screen
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }
  function gameOnScreen(){
    var sc = document.getElementById("stageCard");
    return !!(sc && sc.classList.contains("playing") && document.getElementById("gameRoot") && !document.querySelector(".lost-overlay"));
  }
  function playing(){
    if (!sess || !curKey || !fsOk() || !gameOnScreen()) return false;
    if (document.querySelector(".ss-ov")) return false;   // a PIN box is open
    if (Date.now() - lastAct > 45000 || Date.now() - lastQ > 90000) return false;
    return true;
  }
  function gameRec(key, title, mode){ sess.games = sess.games || {}; return sess.games[key] || (sess.games[key] = { title: title, mode: mode, right: 0, wrong: 0, qsec: 0, qn: 0, sec: 0, rapid: 0, last: 0 }); }
  // account(): puts the time since the last call into the bucket the page was in UNTIL NOW, then works out the bucket it is in from now on
  function account(){
    var now = Date.now(), dt = (now - lastTickT) / 1000; lastTickT = now;
    if (!sess) return;
    if (dt > 1200) { prevState = "off"; return; }
    var rest = 0; if (dt > 20) { rest = dt - 2; dt = 2; }   // the page was frozen (lid shut, sleep): only the last two seconds can have been what it was doing before
    sess.openSec += dt + rest; sess.offSec += rest;
    if (prevState === "play") { sess.activeSec += dt; if (prevKey) { var g = sess.games[prevKey]; if (g) g.sec += dt; } }
    else if (prevState === "idle") sess.idleSec += dt; else sess.offSec += dt;
    var inNow = fsOk(), pl = playing();
    prevState = pl ? "play" : (inNow ? "idle" : "off"); prevKey = pl ? curKey : null;
    if (inNow && !fsSince) { fsSince = now; if (fsGone) { sess.lastOffSec = (now - fsGone) / 1000; sess.lastOffAt = fsGone; } fsGone = 0; }
    else if (!inNow && fsSince) { fsSince = 0; fsGone = now; sess.fsExits++; sess.fsLast = now; saveSession(); }
    else if (!inNow && !fsGone && !sess.fsExits) fsGone = 0;
  }
  ["visibilitychange", "fullscreenchange", "webkitfullscreenchange"].forEach(function(n){ document.addEventListener(n, function(){ account(); }); });
  window.addEventListener("blur", function(){ account(); }); window.addEventListener("focus", function(){ account(); });
  window.addEventListener("ss-question", function(ev){
    var d = ev.detail || {};
    curKey = d.demo ? null : (d.title + "|" + d.mode); curQ = { title: d.title, mode: d.mode };
    qWall = Date.now(); lastQ = qWall; account();
  });
  window.addEventListener("ss-attempt", function(ev){
    var d = ev.detail || {}; if (!sess) return;
    var g = gameRec(d.title + "|" + d.mode, d.title, d.mode), wall = Math.min(7200, (Date.now() - (qWall || Date.now())) / 1000);   // how long the question was ON SCREEN, active or not
    if (d.ok) g.right++; else g.wrong++;
    g.qsec += wall; g.qn++; if (wall < 1.2) g.rapid = (g.rapid || 0) + 1; g.last = Date.now();
    qWall = Date.now(); lastQ = qWall; saveSession();
  });
  window.addEventListener("pagehide", function(){ account(); saveSession(); });

  function mySessions(){ return jget("sessions", []).filter(function(x){ return me && x.name === me.name; }); }
  function todayStats(){
    var d = dstr(), t = { sec: 0, right: 0, wrong: 0, qsec: 0, qn: 0, rapid: 0 };
    mySessions().forEach(function(x){
      if (x.date !== d) return;
      t.sec += x.activeSec || 0;
      Object.keys(x.games || {}).forEach(function(k){ var g = x.games[k]; t.right += g.right; t.wrong += g.wrong; t.qsec += g.qsec; t.qn += g.qn; t.rapid += g.rapid || 0; });
    });
    return t;
  }
  function sessBody(x){
    var gs = Object.keys(x.games || {}).map(function(k){ return x.games[k]; }).sort(function(a, b){ return (b.last || 0) - (a.last || 0); });   // newest first
    var ts = (x.tests || []).slice().reverse(), h = "";
    if (x.synth) h += '<div class="ss-warn">Clicks made by a script during games: ' + x.synth + '</div>';
    h += ts.map(function(t){ return '<div class="ss-test"><b>TEST</b> ' + esc(t.title) + ' &middot; ' + t.correct + '/' + t.total + ' &middot; ' + (t.passed ? "Passed" : "Not passed") + ' &middot; <span>' + (t.accepted === true ? "score kept" : t.accepted === false ? "score cleared" : "waiting for the PIN") + '</span> <small>' + hm(new Date(t.t)) + '</small></div>'; }).join("");
    h += gs.length ? '<table class="ss-tbl"><tr><th>Game</th><th>Right</th><th>Wrong</th><th>Avg. Question Time</th><th>Active</th></tr>' + gs.map(function(g){ return '<tr class="' + (g.mode === "test" ? "tst" : "") + '"><td>' + (g.mode === "test" ? '<b class="ss-tb">TEST</b> ' : "") + esc(g.title) + (g.mode === "test" ? "" : ' <small>(' + esc(g.mode) + ')</small>') + '</td><td>' + g.right + '</td><td>' + g.wrong + '</td><td>' + (g.qn ? Math.round(g.qsec / g.qn) + ' s' : "-") + '</td><td>' + fmt(g.sec) + '</td></tr>'; }).join("") + '</table>' : '<div class="ss-quiet">No questions answered yet.</div>';
    return h;
  }
  function histHtml(){
    var cur = sess && sess.id, list = mySessions().filter(function(x){ return x.id !== cur; }).sort(function(a, b){ return b.start - a.start; });
    if (!list.length) return '<div class="ss-quiet">No earlier sessions on this Chromebook yet.</div>';
    return list.map(function(x){
      var R = 0, W = 0; Object.keys(x.games || {}).forEach(function(k){ R += x.games[k].right; W += x.games[k].wrong; });
      var nt = (x.tests || []).length;
      return '<details class="ss-h" data-sid="' + esc(x.id) + '"><summary><b>' + esc(new Date(x.start).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })) + '</b> ' + hm(new Date(x.start)) + ' &middot; active ' + fmt(x.activeSec) + ' &middot; ' + R + '/' + (R + W) + (nt ? ' &middot; <span class="ss-tb">' + nt + ' test' + (nt > 1 ? "s" : "") + '</span>' : "") + '</summary>' +
        '<div class="ss-hl">Open ' + fmt(x.openSec) + ' &middot; on screen, not playing ' + fmt(x.idleSec) + ' &middot; off screen ' + fmt(x.offSec) + ' &middot; left full screen ' + (x.fsExits || 0) + 'x</div>' + sessBody(x) + '</details>';
    }).join("");
  }
  function refresh(full){
    if (!sess) return;
    function set(id, v){ var e = document.getElementById(id); if (e && e.textContent !== v) e.textContent = v; }
    set("ssMin", fmt(sess.activeSec)); set("ssOpen", fmt(sess.openSec)); set("ssIdle", fmt(sess.idleSec)); set("ssOff", fmt(sess.offSec));
    var pl = playing(), st = document.getElementById("ssState"); if (st) { st.textContent = pl ? "counting: a game is being played" : "not counting"; st.className = "ss-pst" + (pl ? " on" : ""); }
    var qs = document.getElementById("ssQs"); if (qs) { var qsec = qWall && curKey && gameOnScreen() ? (Date.now() - qWall) / 1000 : 0; qs.textContent = qsec ? "Question on screen: " + fmt(qsec) : ""; qs.className = "ss-qs" + (qsec > 60 ? " slow" : ""); }
    var tot = Math.max(1, sess.openSec), seg = document.getElementById("ssSeg");
    if (seg && seg.children.length === 3) { seg.children[0].style.width = (100 * sess.activeSec / tot) + "%"; seg.children[1].style.width = (100 * sess.idleSec / tot) + "%"; seg.children[2].style.width = (100 * sess.offSec / tot) + "%"; }
    var la = document.getElementById("ssLast");
    if (la) { var cur = !fsSince && fsGone ? (Date.now() - fsGone) / 1000 : 0; la.textContent = cur ? fmt(cur) + " (now)" : (sess.lastOffAt ? fmt(sess.lastOffSec) + " at " + hm(new Date(sess.lastOffAt)) : "none yet"); }
    var fb = document.getElementById("ssFs");
    if (fb) {
      var inFs = fsSince > 0, ex = sess.fsExits || 0, exTxt = ex ? "Left full screen " + ex + (ex === 1 ? " time" : " times") + " this session (last at " + hm(new Date(sess.fsLast)) + ")" : "Has not left full screen this session";
      fb.className = "ss-fs" + (inFs ? "" : " out");
      fb.innerHTML = inFs ? '<span>On screen, unbroken</span><b>' + fmt((Date.now() - fsSince) / 1000) + '</b><small>' + exTxt + '</small>' : '<span>OFF SCREEN' + (fsGone ? ' for' : '') + '</span><b>' + (fsGone ? fmt((Date.now() - fsGone) / 1000) : "-") + '</b><small>' + (ex ? exTxt : "Waiting to start") + '</small>';
    }
    var per = period(), ps = document.getElementById("ssPsub2"); if (ps) { var t = per ? per.name + " (" + ampm24(per.start) + " - " + ampm24(per.end) + ")" : "Outside class time"; if (ps.textContent !== t) ps.textContent = t; }
    if (full) {
      var mo = document.getElementById("ssMore");
      if (mo) { var T = todayStats(); mo.innerHTML = 'Total active today: <b>' + fmt(T.sec) + '</b><br>' + T.right + ' right &middot; ' + T.wrong + ' wrong' + (T.qn ? '<br>Avg. Question Time: <b>' + Math.round(T.qsec / T.qn) + ' s</b>' : "") + (T.rapid >= 3 ? '<br><span class="ss-warn2">Rapid answers (under 1.2 s): ' + T.rapid + '</span>' : ""); }
      var cu = document.getElementById("ssCur"); if (cu) { var h = sessBody(sess); if (cu.getAttribute("data-h") !== h) { cu.setAttribute("data-h", h); cu.innerHTML = h; } }
    }
  }
  function startTick(){
    if (tick) return; lastTickT = Date.now();
    tick = setInterval(function(){
      if (!sess) return;
      account();
      if (Math.floor(sess.openSec) % 10 === 0) saveSession();
      if (++rollN % 30 === 0) { var per = period(); if (per && sess.start < periodStartMs(per)) { endSession(); startSession(); chip(); } }
      gShown++; refresh(gShown % 5 === 0);
    }, 1000);
  }

  // ---- UI ----
  function toast(msg){
    var t = document.createElement("div"); t.className = "ss-toast"; t.textContent = msg; document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 4500);
  }
  function periodStartMs(per){ var p = per.start.split(":"), d = new Date(); d.setHours(+p[0], +p[1], 0, 0); return d.getTime(); }
  function fmt(sec){ sec = Math.max(0, Math.round(sec || 0)); return Math.floor(sec / 60) + ":" + pad(sec % 60); }
  function ampm24(hhmm){ var p = String(hhmm).split(":"), d = new Date(); d.setHours(+p[0], +p[1], 0, 0); return hm(d); }
  function dayOk(p, d){ if (p.dates && p.dates.length) return p.dates.indexOf(dstr(d)) >= 0; if (p.days && p.days.length) return p.days.indexOf(d.getDay()) >= 0; return true; }
  function period(){
    var d = new Date(), now = pad(d.getHours()) + ":" + pad(d.getMinutes()), list = (cfg.schedule || []);
    for (var i = 0; i < list.length; i++) if (dayOk(list[i], d) && list[i].start <= now && now < list[i].end) return list[i];
    return null;
  }
  function chip(){
    var host = document.getElementById("ssBar"); if (!host) return;
    if (!me) { host.innerHTML = ""; return; }
    var side = host.querySelector(".ss-side"), keep = side ? side.scrollTop : 0, openIds = [].map.call(host.querySelectorAll("details[open]"), function(e){ return e.getAttribute("data-sid"); });
    var code = cfg.secret ? window.ssDailyCode(cfg.secret, dstr()) : "";
    host.innerHTML = '<div class="ss-side"><div><div class="ss-pname">' + esc(me.name) + '</div><div class="ss-psub">' + (me.borrowed ? "Borrowing " + esc(me.owner) + "'s Chromebook<br>" : "") + '<span id="ssPsub2" style="color:#3a2f8f"></span></div></div>' +
      '<div class="ss-pmin"><b id="ssMin">0:00</b><span><i class="dot a"></i>active in games this session</span><span class="ss-pst" id="ssState">not counting</span><span class="ss-qs" id="ssQs"></span></div>' +
      '<div class="ss-seg" id="ssSeg"><i class="a"></i><i class="i"></i><i class="o"></i></div>' +
      '<div class="ss-tiles"><div class="ss-tile"><span>Total time open</span><b id="ssOpen">0:00</b></div>' +
      '<div class="ss-tile"><span><i class="dot i"></i>On screen, not playing</span><b id="ssIdle">0:00</b></div><div class="ss-tile"><span><i class="dot o"></i>Off screen</span><b id="ssOff">0:00</b></div>' +
      '<div class="ss-tile"><span>Most recent time off screen</span><b id="ssLast">none yet</b></div></div>' +
      '<div class="ss-fs out" id="ssFs"></div><div class="ss-pmore" id="ssMore"></div>' +
      '<div class="ss-sec">This session</div><div id="ssCur"></div>' +
      '<div class="ss-sec">Earlier sessions</div><div id="ssHist">' + histHtml() + '</div>' +
      (code ? '<div class="ss-code">Code of the day <b>' + code + '</b></div>' : "") +
      '<button type="button" class="ss-pb" id="ssTeach" title="teacher">teacher &middot; site X98</button></div>';
    [].forEach.call(host.querySelectorAll("details"), function(e){ if (openIds.indexOf(e.getAttribute("data-sid")) >= 0) e.open = true; });
    document.getElementById("ssTeach").onclick = function(){ teacherGate(whoMenu); };
    var ns = host.querySelector(".ss-side"); if (ns) ns.scrollTop = keep;
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
    var ov = overlay('<h2>' + esc(o.title) + '</h2>' + (o.sub ? '<p>' + o.sub + '</p>' : "") + '<input type="password" id="ssPinP" maxlength="40" autocomplete="off"><div class="ss-err" id="ssPinPE"></div><div class="ss-btns"><button type="button" class="ss-btn" id="ssPinPX">' + esc(o.cancelLabel || "Cancel") + '</button><button type="button" class="ss-btn primary" id="ssPinPOk">' + esc(o.okLabel || "Go") + '</button></div>');
    var pi = ov.querySelector("#ssPinP"); pi.focus();
    function go(){ verifyPin(pi.value).then(function(r){ if (r.ok) { ov.remove(); if (o.onOk) o.onOk(); } else { ov.querySelector("#ssPinPE").textContent = pinMsg(r); pi.value = ""; pi.focus(); } }); }
    ov.querySelector("#ssPinPOk").onclick = go; pi.onkeydown = function(e){ if (e.key === "Enter") go(); };
    ov.querySelector("#ssPinPX").onclick = function(){ ov.remove(); if (o.onCancel) o.onCancel(); };
    return ov;
  }
  function teacherGate(next){ pinPrompt({ title: "Teacher PIN", okLabel: "Go", cancelLabel: "Cancel", onOk: next }); }

  // ---- tests: the teacher's PIN is needed to START one and to KEEP the score at the end (without it the score is cleared) ----
  window.ssGateTest = function(opts, retry){
    if (PREVIEWISH) return true;
    var isTest = opts && ((opts.student && !opts.studentPractice) || opts.mode === "test");
    if (!isTest) return true;
    if (window.__ssAllow) { window.__ssAllow = false; return true; }
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
    pinPrompt({ title: "Test finished: " + rec.correct + "/" + rec.total + (rec.passed ? " (passed)" : ""), sub: "Show your teacher. The teacher's PIN keeps this score. Without it the score is cleared.", okLabel: "Keep score", cancelLabel: "Clear score",
      onOk: function(){ markTest(rec, true); stopGame(); },
      onCancel: function(){ try { window.ssRejectTest && window.ssRejectTest(rec.undo); } catch (e) {} markTest(rec, false); stopGame(); } });
  }
  window.addEventListener("ss-finish", function(ev){
    var d = ev.detail || {}; if (PREVIEWISH || !d.test) return;
    var rec = { t: Date.now(), title: d.title, correct: d.correct, total: d.total, passed: !!d.passed, accepted: null, undo: d.undo };
    ls("pendingTest", JSON.stringify(rec));
    if (sess) { sess.tests.push({ t: rec.t, title: rec.title, correct: rec.correct, total: rec.total, passed: rec.passed, accepted: null }); saveSession(); }
    testEnd(rec);
  });

  function overlay(html, cls){
    var o = document.createElement("div"); o.className = "ss-ov " + (cls || ""); o.innerHTML = '<div class="ss-card">' + html + '</div>'; document.body.appendChild(o);
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
    var ov = overlay('<h2>' + esc(me.name) + '</h2><p>' + (me.borrowed ? "Borrowing " + esc(o.name) + "'s Chromebook." : "This is " + esc(o.name) + "'s Chromebook.") + '</p><div class="ss-col">' + items.join("") + '</div><div class="ss-btns"><button type="button" class="ss-btn" id="ssX">Close</button></div>');
    ov.querySelector("#ssX").onclick = function(){ ov.remove(); };
    ov.querySelector("#ssBorrow").onclick = function(){ ov.remove(); askName(false); };
    var b = ov.querySelector("#ssBack"); if (b) b.onclick = function(){ ov.remove(); ls("current", "null"); endSession(); loadMe(); startSession(); chip(); applyStudent(); };
    ov.querySelector("#ssChange").onclick = function(){
      ov.remove();
      pinPrompt({ title: "Teacher PIN", okLabel: "Go", cancelLabel: "Cancel", onOk: function(){ ls("owner", "null"); ls("current", "null"); endSession(); me = null; chip(); askName(true); } });
    };
  }
  function init(c){
    cfg = c || {}; cfgReady = true; try { window.ssCoverCheck && window.ssCoverCheck(); } catch (e) {}
    var bar = document.createElement("div"); bar.id = "ssBar"; bar.className = "ss-bar";
    document.body.appendChild(bar); if (!PREVIEWISH || /[?&]preview=1/.test(location.search)) document.body.classList.add("ss-on");
    if (cfg.today) { var f = document.createElement("div"); f.className = "ss-focus"; f.innerHTML = '<i class="ti ti-target" aria-hidden="true"></i> ' + esc(cfg.today); var body = document.getElementById("body"); if (body) body.parentNode.insertBefore(f, body); }
    if (cfg.paused) { overlay('<h2>The games are paused</h2><p>' + esc(cfg.pausedMsg || "Your teacher has paused the site. Look at the classroom screen for what to do.") + '</p>', "gate"); return; }
    if (/[?&]class=1/.test(location.search)) { me = { name: "Class", owner: "Class", borrowed: false, since: Date.now() }; applyStudent(); return; }   // X88b: the teacher's docked class view: no name prompt, practice is logged for "Class"
    loadMe();
    if (!me) askName(true); else { startSession(); chip(); applyStudent(); }
    startTick();
    try { var pend = jget("pendingTest", null); if (pend && pend.t && !PREVIEWISH) setTimeout(function(){ testEnd(pend); }, 1500); } catch (e) {}   // a test ended but the PIN was not given yet (page reloaded): ask again
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
  function show(){
    if (ov || !need()) return;
    ov = document.createElement("div");
    ov.setAttribute("style", "position:fixed;inset:0;z-index:2147483647;background:#1d1b3a;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;font:600 18px system-ui,sans-serif;text-align:center;padding:20px");
    ov.innerHTML = '<div style="font-size:26px;max-width:520px">Only Available in Full Screen During Class</div><button type="button" style="font:700 18px system-ui;padding:12px 26px;border-radius:12px;border:0;background:#7c5cf5;color:#fff;cursor:pointer">Start (Full Screen)</button>';
    ov.querySelector("button").addEventListener("click", function(){ enter(); });
    document.body.appendChild(ov);
  }
  function hide(){ if (ov && !need()) { ov.remove(); ov = null; } }   // X95: the cover is taken away once full screen is on (it used to stay)
  function check(){ if (need()) show(); else hide(); }
  window.ssCoverCheck = check;
  document.addEventListener("fullscreenchange", check);
  document.addEventListener("webkitfullscreenchange", check);
  document.addEventListener("keydown", function(ev){
    var k = (ev.key || "").toLowerCase(), m = ev.ctrlKey || ev.metaKey;
    if (ev.key === "F12" || (m && ev.shiftKey && (k === "i" || k === "j" || k === "c")) || (m && ev.altKey && k === "i") || (m && k === "u")) { ev.preventDefault(); ev.stopPropagation(); }
  }, true);
  document.addEventListener("contextmenu", function(ev){ ev.preventDefault(); }, true);
  setInterval(check, 5000);   // class starts / ends while the page is open
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", check); else check();
})();
