/* X89: class mode (?class=1) shows every game even if switched off for students. student-shim.js (Student site v1, 13 Nov 2026, c12). Loaded BEFORE NoteID.js on the student site.
   Gives NoteID a read-only "published" copy of the teacher's levels / config / lessons (from site-config.json) and keeps everything the
   student does (scores, history) in this Chromebook's own localStorage. Nothing here talks to a server. */
(function(){
  "use strict";
  window.STUDENT_SITE = true;
  window.DataStore = { supported: function(){ return false; }, reconnectSilently: function(){ return Promise.resolve(null); } };   // NoteID's folder storage is never used here
  var PREVIEW = !!window.STUDENT_PREVIEW || /[?&]preview=1/.test(location.search);
  var CLASS_MODE = /[?&]class=1/.test(location.search);
  var PREFIX = "ss:" + (PREVIEW ? "p:" : "");
  window.SS_PREFIX = PREFIX;
  var PUBLISHED = { "noteid-levels-v1": "levels", "noteid-config-v1": "config", "noteid-lessons-v1": "lessons" };
  var cfg = null, resolveReady;
  window.STUDENT_READY = new Promise(function(r){ resolveReady = r; });
  function setConfig(c){ cfg = c || { v: 1, empty: true }; window.STUDENT_CONFIG = cfg; resolveReady(cfg); }
  if (window.STUDENT_CONFIG_INLINE) setConfig(window.STUDENT_CONFIG_INLINE);
  else if (PREVIEW) {   // the teacher's panel hands over the settings it is previewing
    window.addEventListener("message", function(ev){ if (ev.data && ev.data.type === "site-config-preview" && !cfg) setConfig(ev.data.config); });
    var askTimer = setInterval(function(){ if (cfg) { clearInterval(askTimer); return; } try { window.parent.postMessage({ type: "student-site-ready" }, "*"); } catch (e) {} }, 300);
  }
  else fetch("site-config.json?t=" + Date.now(), { cache: "no-store" }).then(function(r){ return r.ok ? r.json() : null; }).then(setConfig).catch(function(){ setConfig(null); });

  function filterConfig(conf, c){
    var o = JSON.parse(JSON.stringify(conf || {})), games = CLASS_MODE ? {} : (c.games || {});   // X89: the teacher's class view shows every game, switched off or not
    o.mode = null;   // students pick their own mode (Practice or Test)
    if (Array.isArray(o.types)) o.types = o.types.filter(function(t){ return games[t.id] !== false; });
    else {   // the default games: spell them out so the ones switched off can be removed
      var off = Object.keys(games).filter(function(id){ return games[id] === false; });
      if (off.length) { o.types = (c.gameList || []).filter(function(g){ return games[g.id] !== false; }).map(function(g){ return { id: g.id }; }); }
    }
    return o;
  }
  function lsGet(k){ try { return localStorage.getItem(PREFIX + k); } catch (e) { return null; } }
  function lsSet(k, v){ try { localStorage.setItem(PREFIX + k, v); return true; } catch (e) { return false; } }
  window.StudentBackend = {
    get: function(key){
      return window.STUDENT_READY.then(function(c){
        var f = PUBLISHED[key];
        if (f) { var v = c[f]; if (v == null) return null; if (f === "config") v = filterConfig(v, c); return JSON.stringify(v); }
        return lsGet(key);
      });
    },
    set: function(key, value){ if (PUBLISHED[key]) return Promise.resolve(true); return lsSet(key, value) ? Promise.resolve(true) : Promise.reject(new Error("This Chromebook's storage is full")); }
  };

  // Practice answers per student and level (all time, capped at 400): the student practice screen shows all-time vs last-10 accuracy.
  window.ssAttempts = {
    _get: function(){ try { return JSON.parse(lsGet("practice-attempts-v1")) || {}; } catch (e) { return {}; } },
    push: function(sid, key, ok){ var all = this._get(), k = String(sid) + "|" + key, a = all[k] || ""; a = (a + (ok ? "1" : "0")).slice(-400); all[k] = a; lsSet("practice-attempts-v1", JSON.stringify(all)); },
    stats: function(sid, key){
      var a = this._get()[String(sid) + "|" + key] || "", c = function(s){ var n = 0; for (var i = 0; i < s.length; i++) if (s[i] === "1") n++; return n; }, l = a.slice(-10);
      return { nAll: a.length, pctAll: a.length ? Math.round(100 * c(a) / a.length) : 0, n10: l.length, pct10: l.length ? Math.round(100 * c(l) / l.length) : 0 };
    }
  };
  window.ssLsGet = lsGet; window.ssLsSet = lsSet;
  // The code of the day: the classroom screen (teacher side) computes the same number from the shared secret, so a student can only show a valid code during class.
  window.ssDailyCode = function(secret, date){
    var s = String(secret || "") + "|" + date, h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return ("0000" + (h % 10000)).slice(-4);
  };
})();
