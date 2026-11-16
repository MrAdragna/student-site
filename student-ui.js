/* student-ui.js (Student site v1, X97, 16 Nov 2026, c12). Loaded AFTER NoteID.js. Student identity (locked to the Chromebook's owner, borrowing),
   session timer, the "show my session" screen, today's focus message, and the teacher-only controls blocked. */
(function(){
  "use strict";
  var P = window.SS_PREFIX || "ss:"; window.SS_BUILD = "X97";
  function lg(k){ try { return localStorage.getItem(P + k); } catch (e) { return null; } }
  function ls(k, v){ try { localStorage.setItem(P + k, v); } catch (e) {} }
  function jget(k, d){ try { var v = JSON.parse(lg(k)); return v == null ? d : v; } catch (e) { return d; } }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function pad(n){ return ("0" + n).slice(-2); }
  function dstr(d){ d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function hm(d){ return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
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

  // ---- session timer: counts seconds while the page is visible and something was touched in the last minute ----
  var sess = null, lastAct = Date.now(), tick = null;
  function startSession(){
    if (!me) return;
    var all = jget("sessions", []), d = dstr(), found = null;
    var per0 = period(), ps0 = per0 ? periodStartMs(per0) : 0;   // X97: the session starts over at the beginning of each class period
    all.forEach(function(s){ if (s.date === d && s.name === me.name && s.owner === me.owner && !s.closed && Date.now() - s.last < 20 * 60 * 1000 && s.start >= ps0) found = s; });
    sess = found || { id: Date.now().toString(36), name: me.name, owner: me.owner, borrowed: me.borrowed, date: d, start: Date.now(), last: Date.now(), activeSec: 0, closed: false };
    if (!found) { all.push(sess); ls("sessions", JSON.stringify(all.slice(-200))); }
  }
  function saveSession(){ if (!sess) return; sess.last = Date.now(); var all = jget("sessions", []), i = all.map(function(s){ return s.id; }).indexOf(sess.id); if (i >= 0) all[i] = sess; else all.push(sess); ls("sessions", JSON.stringify(all.slice(-200))); }
  function endSession(){ if (sess) { sess.closed = true; saveSession(); sess = null; } }
  ["pointerdown", "keydown", "pointermove", "touchstart"].forEach(function(n){ window.addEventListener(n, function(){ lastAct = Date.now(); }, true); });
  // X96/X97: the minutes count ONLY while a game is being played: the page is visible, the window is focused and in full screen (not in the teacher's preview), a real game
  // (not a demo / the menu) is on screen, the round is not over, something was touched in the last 45 seconds AND a question was shown or answered in the last 90 seconds.
  var curKey = null, curQ = 0, qAct = 0, gShown = 0, lastQ = 0, fsSince = 0, fsWas = false, fsGone = 0, rollN = 0;
  function fsOk(){
    if (document.visibilityState !== "visible") return false;
    if (PREVIEWISH) return true;
    return !!(document.fullscreenElement || document.webkitFullscreenElement) && document.hasFocus();
  }
  function playing(){
    if (!sess || !curKey || !fsOk()) return false;
    if (Date.now() - lastAct > 45000 || Date.now() - lastQ > 90000) return false;
    var sc = document.getElementById("stageCard");
    if (!sc || !sc.classList.contains("playing") || !document.getElementById("gameRoot")) return false;
    if (document.querySelector(".lost-overlay")) return false;
    return true;
  }
  function gameRec(key, title, mode){ sess.games = sess.games || {}; return sess.games[key] || (sess.games[key] = { title: title, mode: mode, right: 0, wrong: 0, qsec: 0, qn: 0, sec: 0 }); }
  window.addEventListener("ss-question", function(ev){
    var d = ev.detail || {}; qAct = 0; lastQ = Date.now();
    curKey = d.demo ? null : (d.title + "|" + d.mode); curQ = { title: d.title, mode: d.mode };
  });
  window.addEventListener("ss-attempt", function(ev){
    var d = ev.detail || {}; if (!sess) return;
    var g = gameRec(d.title + "|" + d.mode, d.title, d.mode);
    if (d.ok) g.right++; else g.wrong++;
    g.qsec += Math.min(qAct, 120); g.qn++; qAct = 0; lastQ = Date.now(); saveSession();
  });
  function todayStats(){
    var d = dstr(), t = { sec: 0, right: 0, wrong: 0, qsec: 0, qn: 0, games: {}, exits: 0 };
    jget("sessions", []).forEach(function(x){
      if (x.date !== d || !me || x.name !== me.name) return;
      t.sec += x.activeSec || 0; t.exits += x.fsExits || 0;
      Object.keys(x.games || {}).forEach(function(k){
        var g = x.games[k], a = t.games[k] || (t.games[k] = { title: g.title, mode: g.mode, right: 0, wrong: 0, qsec: 0, qn: 0, sec: 0 });
        a.right += g.right; a.wrong += g.wrong; a.qsec += g.qsec; a.qn += g.qn; a.sec += g.sec;
        t.right += g.right; t.wrong += g.wrong; t.qsec += g.qsec; t.qn += g.qn;
      });
    });
    return t;
  }
  function refresh(full){
    var m = document.getElementById("ssMin"); if (m && sess) m.textContent = fmt(sess.activeSec);
    var st = document.getElementById("ssState"); if (st) { var on = playing(); st.textContent = on ? "counting: a game is being played" : "not counting"; st.className = "ss-pst" + (on ? " on" : ""); }
    var fb = document.getElementById("ssFs");
    if (fb) {
      var inFs = fsSince > 0;
      fb.className = "ss-fs" + (inFs ? "" : " out");
      fb.innerHTML = inFs ? '<span>In full screen, unbroken</span><b>' + fmt((Date.now() - fsSince) / 1000) + '</b>' + (sess && sess.fsExits ? '<small>Left full screen ' + sess.fsExits + (sess.fsExits === 1 ? " time" : " times") + ' this session (last at ' + hm(new Date(sess.fsLast)) + ')</small>' : '<small>Has not left full screen this session</small>')
        : '<span>NOT in full screen' + (fsGone ? ' for' : '') + '</span><b>' + (fsGone ? fmt((Date.now() - fsGone) / 1000) : "-") + '</b>' + (sess && sess.fsExits ? '<small>Left full screen ' + sess.fsExits + (sess.fsExits === 1 ? " time" : " times") + ' this session</small>' : '<small>Waiting to start</small>');
    }
    if (full) {
      var mo = document.getElementById("ssMore");
      if (mo) { var t = todayStats(); mo.innerHTML = 'Total active today: <b>' + fmt(t.sec) + '</b><br>' + t.right + ' right &middot; ' + t.wrong + ' wrong' + (t.qn ? '<br>Avg. Question Time: <b>' + Math.round(t.qsec / t.qn) + ' s</b>' : ""); }
      var tb = document.getElementById("ssTbl");
      if (tb) {
        var T = todayStats(), keys = Object.keys(T.games).sort(function(x, y){ return T.games[y].sec - T.games[x].sec; }).slice(0, 8);
        tb.innerHTML = keys.length ? '<table class="ss-tbl"><tr><th>Game</th><th>Right</th><th>Wrong</th><th>Avg. Question Time</th><th>Active</th></tr>' + keys.map(function(k){ var g = T.games[k]; return '<tr><td>' + esc(g.title) + ' <small>(' + esc(g.mode) + ')</small></td><td>' + g.right + '</td><td>' + g.wrong + '</td><td>' + (g.qn ? Math.round(g.qsec / g.qn) + ' s' : "-") + '</td><td>' + fmt(g.sec) + '</td></tr>'; }).join("") + '</table>' : '<div class="ss-quiet">No questions answered yet today.</div>';
      }
    }
  }
  function startTick(){
    if (tick) return;
    tick = setInterval(function(){
      if (!sess) return;
      var inNow = fsOk();   // unbroken full screen: resets the moment it is left (or the tab is hidden / another window is focused)
      if (inNow && !fsSince) { fsSince = Date.now(); fsGone = 0; fsWas = true; }
      else if (!inNow && fsSince) { fsSince = 0; fsGone = Date.now(); sess.fsExits = (sess.fsExits || 0) + 1; sess.fsLast = Date.now(); saveSession(); }
      if (playing()) { sess.activeSec++; qAct++; if (curKey) gameRec(curKey, curQ.title, curQ.mode).sec++; }
      if (sess.activeSec % 10 === 0 && playing()) saveSession();
      if (++rollN % 30 === 0) { var per = period(); if (per && sess.start < periodStartMs(per)) { endSession(); startSession(); fsSince = fsSince; chip(); } }
      gShown++; refresh(gShown % 5 === 0);
    }, 1000);
  }
  window.addEventListener("pagehide", function(){ saveSession(); });

  // ---- UI ----
  function toast(msg){
    var t = document.createElement("div"); t.className = "ss-toast"; t.textContent = msg; document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 4500);
  }
  function periodStartMs(per){ var p = per.start.split(":"), d = new Date(); d.setHours(+p[0], +p[1], 0, 0); return d.getTime(); }
  function fmt(sec){ sec = Math.max(0, Math.round(sec || 0)); return Math.floor(sec / 60) + ":" + pad(sec % 60); }
  function period(){
    var now = hm(new Date()), list = (cfg.schedule || []);
    for (var i = 0; i < list.length; i++) if (list[i].start <= now && now < list[i].end) return list[i];
    return null;
  }
  function chip(){
    var host = document.getElementById("ssBar"); if (!host) return;
    if (!me) { host.innerHTML = ""; return; }
    var per = period(), code = cfg.secret ? window.ssDailyCode(cfg.secret, dstr()) : "";
    host.innerHTML = '<div class="ss-side"><div><div class="ss-pname">' + esc(me.name) + '</div><div class="ss-psub">' + (me.borrowed ? "Borrowing " + esc(me.owner) + "'s Chromebook" : "") + (per ? (me.borrowed ? " &middot; " : "") + '<span style="color:#3a2f8f">' + esc(per.name) + '</span>' : "") + '</div></div>' +
      '<div class="ss-pmin"><b id="ssMin">' + fmt(sess && sess.activeSec) + '</b><span>active time this session</span><span class="ss-pst" id="ssState">not counting</span></div>' +
      '<div class="ss-fs out" id="ssFs"></div><div class="ss-pmore" id="ssMore"></div><div id="ssTbl"></div>' +
      (code ? '<div class="ss-code">Code of the day <b>' + code + '</b></div>' : "") +
      '<button type="button" class="ss-pb" id="ssTeach" title="teacher">teacher &middot; site X97</button></div>';
    document.getElementById("ssTeach").onclick = function(){ teacherGate(whoMenu); };
    refresh(true);
  }
  // the name is not something a student can change: any change goes through the teacher PIN
  function teacherGate(next){
    var ov = overlay('<h2>Teacher PIN</h2><input type="password" id="ssPin0" maxlength="20" autocomplete="off"><div class="ss-err" id="ssPinErr0"></div><div class="ss-btns"><button type="button" class="ss-btn" id="ssPinX0">Cancel</button><button type="button" class="ss-btn primary" id="ssPinOk0">Go</button></div>');
    var pi = ov.querySelector("#ssPin0"); pi.focus();
    function go(){ hashPin(pi.value).then(function(h){ if (cfg.pinHash && h === cfg.pinHash) { ov.remove(); next(); } else ov.querySelector("#ssPinErr0").textContent = cfg.pinHash ? "That PIN is not right." : "No teacher PIN has been set for this site yet."; }); }
    ov.querySelector("#ssPinOk0").onclick = go; pi.onkeydown = function(e){ if (e.key === "Enter") go(); };
    ov.querySelector("#ssPinX0").onclick = function(){ ov.remove(); };
  }
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
      // X88b: no prompt() / alert() (some frames block them silently): the PIN is typed in the card itself
      var pc = ov.querySelector(".ss-card"); pc.innerHTML = '<h2>Teacher PIN</h2><input type="password" id="ssPin" maxlength="20" autocomplete="off"><div class="ss-err" id="ssPinErr"></div><div class="ss-btns"><button type="button" class="ss-btn" id="ssPinX">Cancel</button><button type="button" class="ss-btn primary" id="ssPinOk">Go</button></div>';
      var pi = pc.querySelector("#ssPin"); pi.focus();
      function tryPin(){
        hashPin(pi.value).then(function(h){
          if (cfg.pinHash && h === cfg.pinHash) { ov.remove(); ls("owner", "null"); ls("current", "null"); endSession(); me = null; chip(); askName(true); }
          else pc.querySelector("#ssPinErr").textContent = cfg.pinHash ? "That PIN is not right." : "No teacher PIN has been set for this site yet.";
        });
      }
      pc.querySelector("#ssPinOk").onclick = tryPin; pi.onkeydown = function(e){ if (e.key === "Enter") tryPin(); };
      pc.querySelector("#ssPinX").onclick = function(){ ov.remove(); };
    };
  }
  function hashPin(p){
    var data = new TextEncoder().encode("ss-pin|" + p);
    return crypto.subtle.digest("SHA-256", data).then(function(b){ return Array.prototype.map.call(new Uint8Array(b), function(x){ return ("0" + x.toString(16)).slice(-2); }).join(""); });
  }
  function init(c){
    cfg = c || {};
    var bar = document.createElement("div"); bar.id = "ssBar"; bar.className = "ss-bar";
    document.body.appendChild(bar); if (!PREVIEWISH || /[?&]preview=1/.test(location.search)) document.body.classList.add("ss-on");
    if (cfg.today) { var f = document.createElement("div"); f.className = "ss-focus"; f.innerHTML = '<i class="ti ti-target" aria-hidden="true"></i> ' + esc(cfg.today); var body = document.getElementById("body"); if (body) body.parentNode.insertBefore(f, body); }
    if (cfg.paused) { overlay('<h2>The games are paused</h2><p>' + esc(cfg.pausedMsg || "Your teacher has paused the site. Look at the classroom screen for what to do.") + '</p>', "gate"); return; }
    if (/[?&]class=1/.test(location.search)) { me = { name: "Class", owner: "Class", borrowed: false, since: Date.now() }; applyStudent(); return; }   // X88b: the teacher's docked class view: no name prompt, practice is logged for "Class"
    loadMe();
    if (!me) askName(true); else { startSession(); chip(); applyStudent(); }
    startTick();
    setInterval(chip, 60000);
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
  function need(){ return !(document.fullscreenElement || document.webkitFullscreenElement); }
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
  document.addEventListener("fullscreenchange", check);
  document.addEventListener("webkitfullscreenchange", check);
  document.addEventListener("keydown", function(ev){
    var k = (ev.key || "").toLowerCase(), m = ev.ctrlKey || ev.metaKey;
    if (ev.key === "F12" || (m && ev.shiftKey && (k === "i" || k === "j" || k === "c")) || (m && ev.altKey && k === "i") || (m && k === "u")) { ev.preventDefault(); ev.stopPropagation(); }
  }, true);
  document.addEventListener("contextmenu", function(ev){ ev.preventDefault(); }, true);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", check); else check();
})();
