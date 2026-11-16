/* student-ui.js (Student site v1, X96, 16 Nov 2026, c12). Loaded AFTER NoteID.js. Student identity (locked to the Chromebook's owner, borrowing),
   session timer, the "show my session" screen, today's focus message, and the teacher-only controls blocked. */
(function(){
  "use strict";
  var P = window.SS_PREFIX || "ss:"; window.SS_BUILD = "X96";
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
    st.textContent = ".topbar h1, #viewTabs, #studentChipWrap, #scoreChipWrap, #storageModeLabel, #maxBtn { display: none !important; }" +
      ".topbar { justify-content: flex-end; } .topbar .spacer { display: none; }" +
      ".ss-bar { margin-left: auto; }" +
      "body.maxed .ss-bar { position: fixed; top: 6px; right: 10px; z-index: 100; }" +
      ".ss-panel { display: grid; grid-template-columns: auto auto; gap: 2px 22px; align-items: center; background: #fff; border: 3px solid #3a2f8f; border-radius: 16px; padding: 6px 16px; box-shadow: 0 2px 8px rgba(40,30,120,.15); }" +
      ".ss-pname { font-size: 28px; font-weight: 800; color: #2a2170; line-height: 1.1; }" +
      ".ss-psub:empty { display: none; } .ss-psub { font-size: 13px; font-weight: 700; color: #7a4b00; }" +
      ".ss-pmin { grid-row: 1 / span 2; grid-column: 2; text-align: center; line-height: 1; }" +
      ".ss-pmin b { display: block; font-size: 54px; font-weight: 800; color: #3a2f8f; }" +
      ".ss-pmin span { font-size: 13px; font-weight: 700; color: #555; }" +
      ".ss-pst { display: block; font-size: 12px; font-weight: 800; margin-top: 2px; color: #999; } .ss-pst.on { color: #1a8a4a; }" +
      ".ss-pmore { grid-column: 1; font-size: 12px; color: #555; }" +
      ".ss-pbtns { grid-column: 1 / span 2; display: flex; gap: 8px; justify-content: flex-end; }" +
      ".ss-pb { font: inherit; font-size: 12px; font-weight: 700; border: 1px solid #b9b3e8; background: #f4f2ff; color: #3a2f8f; border-radius: 999px; padding: 2px 10px; cursor: pointer; } .ss-pb.quiet { background: none; border-color: transparent; color: #999; }" +
      "@media (max-width: 760px) { .ss-pmore, .ss-pb.quiet { display: none; } .ss-pname { font-size: 20px; } .ss-pmin b { font-size: 36px; } }";
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
    all.forEach(function(s){ if (s.date === d && s.name === me.name && s.owner === me.owner && !s.closed && Date.now() - s.last < 20 * 60 * 1000) found = s; });
    sess = found || { id: Date.now().toString(36), name: me.name, owner: me.owner, borrowed: me.borrowed, date: d, start: Date.now(), last: Date.now(), activeSec: 0, closed: false };
    if (!found) { all.push(sess); ls("sessions", JSON.stringify(all.slice(-200))); }
  }
  function saveSession(){ if (!sess) return; sess.last = Date.now(); var all = jget("sessions", []), i = all.map(function(s){ return s.id; }).indexOf(sess.id); if (i >= 0) all[i] = sess; else all.push(sess); ls("sessions", JSON.stringify(all.slice(-200))); }
  function endSession(){ if (sess) { sess.closed = true; saveSession(); sess = null; } }
  ["pointerdown", "keydown", "pointermove", "touchstart"].forEach(function(n){ window.addEventListener(n, function(){ lastAct = Date.now(); }, true); });
  // X96: the minutes count ONLY while a game is being played: the page is visible, in full screen (not in the teacher's preview), a real game (not a demo / the menu) is on screen,
  // the round is not over, and something was touched in the last 45 seconds.
  var curKey = null, curQ = 0, qAct = 0, gShown = 0;
  function playing(){
    if (!sess || !curKey) return false;
    if (document.visibilityState !== "visible") return false;
    if (!PREVIEWISH && !(document.fullscreenElement || document.webkitFullscreenElement)) return false;
    if (Date.now() - lastAct > 45000) return false;
    var sc = document.getElementById("stageCard");
    if (!sc || !sc.classList.contains("playing") || !document.getElementById("gameRoot")) return false;
    if (document.querySelector(".lost-overlay")) return false;
    return true;
  }
  function gameRec(key, title, mode){ sess.games = sess.games || {}; return sess.games[key] || (sess.games[key] = { title: title, mode: mode, right: 0, wrong: 0, qsec: 0, qn: 0, sec: 0 }); }
  window.addEventListener("ss-question", function(ev){
    var d = ev.detail || {}; qAct = 0;
    curKey = d.demo ? null : (d.title + "|" + d.mode); curQ = { title: d.title, mode: d.mode };
  });
  window.addEventListener("ss-attempt", function(ev){
    var d = ev.detail || {}; if (!sess) return;
    var g = gameRec(d.title + "|" + d.mode, d.title, d.mode);
    if (d.ok) g.right++; else g.wrong++;
    g.qsec += Math.min(qAct, 120); g.qn++; qAct = 0; saveSession();
  });
  function todayStats(){
    var d = dstr(), t = { sec: 0, right: 0, wrong: 0, qsec: 0, qn: 0, games: {} };
    jget("sessions", []).forEach(function(x){
      if (x.date !== d || !me || x.name !== me.name) return;
      t.sec += x.activeSec || 0;
      Object.keys(x.games || {}).forEach(function(k){
        var g = x.games[k], a = t.games[k] || (t.games[k] = { title: g.title, mode: g.mode, right: 0, wrong: 0, qsec: 0, qn: 0, sec: 0 });
        a.right += g.right; a.wrong += g.wrong; a.qsec += g.qsec; a.qn += g.qn; a.sec += g.sec;
        t.right += g.right; t.wrong += g.wrong; t.qsec += g.qsec; t.qn += g.qn;
      });
    });
    return t;
  }
  function refresh(full){
    var m = document.getElementById("ssMin"); if (m && sess) m.textContent = Math.floor(sess.activeSec / 60);
    var st = document.getElementById("ssState"); if (st) { var on = playing(); st.textContent = on ? "counting" : "paused"; st.className = "ss-pst" + (on ? " on" : ""); }
    if (full) {
      var mo = document.getElementById("ssMore");
      if (mo) { var t = todayStats(); mo.textContent = "Today: " + Math.floor(t.sec / 60) + " min \u00b7 " + t.right + " right \u00b7 " + t.wrong + " wrong" + (t.qn ? " \u00b7 " + Math.round(t.qsec / t.qn) + " s per question" : ""); }
    }
  }
  function startTick(){
    if (tick) return;
    tick = setInterval(function(){
      if (!sess) return;
      if (playing()) { sess.activeSec++; qAct++; if (curKey) gameRec(curKey, curQ.title, curQ.mode).sec++; }
      if (sess.activeSec % 10 === 0 && playing()) saveSession();
      gShown++; refresh(gShown % 5 === 0);
    }, 1000);
  }
  window.addEventListener("pagehide", function(){ saveSession(); });

  // ---- UI ----
  function toast(msg){
    var t = document.createElement("div"); t.className = "ss-toast"; t.textContent = msg; document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 4500);
  }
  function period(){
    var now = hm(new Date()), list = (cfg.schedule || []);
    for (var i = 0; i < list.length; i++) if (list[i].start <= now && now < list[i].end) return list[i];
    return null;
  }
  function chip(){
    var host = document.getElementById("ssBar"); if (!host) return;
    if (!me) { host.innerHTML = ""; return; }
    var per = period();
    host.innerHTML = '<div class="ss-panel"><div><div class="ss-pname">' + esc(me.name) + '</div><div class="ss-psub">' + (me.borrowed ? "Borrowing " + esc(me.owner) + "'s Chromebook" : "") + (per ? (me.borrowed ? " &middot; " : "") + '<span style="color:#3a2f8f">' + esc(per.name) + '</span>' : "") + '</div></div>' +
      '<div class="ss-pmin"><b id="ssMin">' + Math.floor(((sess && sess.activeSec) || 0) / 60) + '</b><span>active min this session</span><span class="ss-pst" id="ssState">paused</span></div>' +
      '<div class="ss-pmore" id="ssMore"></div>' +
      '<div class="ss-pbtns"><button type="button" class="ss-pb" id="ssShow">Details</button><button type="button" class="ss-pb quiet" id="ssTeach">teacher</button></div></div>';
    document.getElementById("ssShow").onclick = showSession;
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
  function showSession(){
    saveSession();
    var d = dstr(), per = period(), code = window.ssDailyCode(cfg.secret, d);
    var T = todayStats(), tot = T.sec, keys = Object.keys(T.games).sort(function(x, y){ return T.games[y].sec - T.games[x].sec; }).slice(0, 12);
    var table = keys.length ? '<table class="ss-tbl"><tr><th>Game</th><th>Mode</th><th>Right</th><th>Wrong</th><th>s / question</th><th>Active</th></tr>' + keys.map(function(k){ var g = T.games[k]; return '<tr><td>' + esc(g.title) + '</td><td>' + esc(g.mode) + '</td><td>' + g.right + '</td><td>' + g.wrong + '</td><td>' + (g.qn ? Math.round(g.qsec / g.qn) : "-") + '</td><td>' + Math.floor(g.sec / 60) + ":" + pad(g.sec % 60) + '</td></tr>'; }).join("") + '</table>' : '<p class="ss-quiet">No questions answered yet today.</p>';
    var ov = overlay('<div class="ss-conf"><div class="ss-name">' + esc(me.name) + '</div>' + (me.borrowed ? '<div class="ss-tag">Borrowed: ' + esc(me.owner) + '\'s Chromebook</div>' : "") +
      '<div class="ss-line">' + new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) + (per ? " &middot; " + esc(per.name) + " (" + per.start + "-" + per.end + ")" : " &middot; outside class time") + '</div>' +
      '<div class="ss-big"><span>' + Math.floor(((sess && sess.activeSec) || 0) / 60) + '</span> min active this session<br><small>' + Math.floor(tot / 60) + ' min today</small></div>' + table +
      (cfg.secret ? '<div class="ss-code">Code of the day <b>' + code + '</b><small>Your teacher checks this matches the one on the classroom screen.</small></div>' : "") +
      '<div class="ss-line small">Started ' + (sess ? hm(new Date(sess.start)) : "") + ' &middot; shown ' + hm(new Date()) + ' &middot; site version X96</div></div><div class="ss-btns"><button type="button" class="ss-btn primary" id="ssClose">Close</button></div>', "conf");
    ov.querySelector("#ssClose").onclick = function(){ ov.remove(); };
  }

  function init(c){
    cfg = c || {};
    var bar = document.createElement("div"); bar.id = "ssBar"; bar.className = "ss-bar";
    var top = document.querySelector(".topbar"); if (top) top.insertBefore(bar, top.querySelector(".spacer")); else document.body.appendChild(bar);
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
    ov.innerHTML = '<div>Note ID works in full screen.</div><button type="button" style="font:700 18px system-ui;padding:12px 26px;border-radius:12px;border:0;background:#7c5cf5;color:#fff;cursor:pointer">Start (full screen)</button>';
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
