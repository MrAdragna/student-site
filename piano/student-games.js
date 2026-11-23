/* student-games.js (X121: judging bands + credit per band, extra-tap cap, "Not tried" for count-in exits, calibration saved once per computer; X112: Songs are drawn by the Workbook's own renderer (extracted from Workbook.js 4.67), home-row piano, due/current badges, locked extras (teacher PIN), last-5 dots, follower line per level, live tap bars, teacher "count as right / wrong"; X111, c13, 19 Nov 2026; X111 = games sit under the game bar, Songs grouped by unit with a keyboard that fits the song + MIDI, Rhythm: 4 measures at tempo 60, count-in above the music, results hidden until you finish, optional follower line, levels unlock in order, timing numbers from the teacher panel). Two extra games for the student site, loaded by student-ui.js:
   RHYTHM  = tap the rhythm on the keyboard (Space or any key; key down AND key up are judged). The rhythms come from the teacher's RhythmRandomizer levels
             (published in the site settings as `rhythm`; without them the 13 built-in RhythmRandomizer levels are used). The generator below is copied from
             RhythmRandomizer.js v29 (registries, level model, fits / fillMeasure / generateOnce); nothing else of that app is used.
   SONGS   = a song from the teacher's Workbook (published in the site settings as `songs`) drawn with VexFlow, and a virtual keyboard
             (mouse / touch / computer keys) that makes sound. Step-by-step help, MIDI and checking come later.
   Both add a button to the game bar of the student page, run inside a panel that covers the games area (the right-hand sidebar stays), tell student-ui.js when they are on screen
   (window.ssExtGame.on) and report questions / attempts with the same events NoteID uses (ss-question / ss-attempt), so active time and the teacher's chart work as usual. */
(function(){
  "use strict";
  var P = window.SS_PREFIX || "ss:";
  function lg(k){ try { return localStorage.getItem(P + k); } catch (e) { return null; } }
  function ls(k, v){ try { localStorage.setItem(P + k, v); } catch (e) {} }
  function jget(k, d){ try { var v = lg(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function SC(){ return window.STUDENT_CONFIG || {}; }
  var PREVIEWISH = /[?&](preview|class)=1/.test(location.search);

  // =====================================================================
  // Generator copied from RhythmRandomizer.js v29 (see make_core.py in the build notes)
  // =====================================================================
  var levels = [], cfg = { weights: {}, shapeRules: {}, profiles: [] };
  var TS_DEFS = [
    { id: "ts_44", num: 4, den: 4, ticks: 16, beat: 4, compound: false },
    { id: "ts_34", num: 3, den: 4, ticks: 12, beat: 4, compound: false },
    { id: "ts_68", num: 6, den: 8, ticks: 12, beat: 6, compound: true }
  ];

  var NOTE_SHAPES = [
    { key: "whole",   name: "Whole note",                  parts: [16] },
    { key: "dhalf",   name: "Dotted half note",            parts: [12] },
    { key: "half",    name: "Half note",                   parts: [8] },
    { key: "dq_e",    name: "Dotted quarter + eighth",     parts: [6, 2] },
    { key: "quarter", name: "Quarter note",                parts: [4], offbeatOK: true },
    { key: "de_s",    name: "Dotted eighth + sixteenth",   parts: [3, 1] },
    { key: "s_de",    name: "Sixteenth + dotted eighth",   parts: [1, 3] },
    { key: "ee",      name: "Two eighths (beamed pair)",   parts: [2, 2], glyph: "♫" },
    { key: "e",       name: "Single eighth",               parts: [2] },
    { key: "ssss",    name: "Four sixteenths",             parts: [1, 1, 1, 1], glyph: "♬♬" },
    { key: "ses",     name: "Sixteenth, eighth, sixteenth", parts: [1, 2, 1] },
    { key: "ess",     name: "Eighth, two sixteenths",      parts: [2, 1, 1] },
    { key: "sse",     name: "Two sixteenths, eighth",      parts: [1, 1, 2] },
    { key: "dq",      name: "Dotted quarter (6/8 beat)",   parts: [6], compoundOnly: true },
    { key: "qe",      name: "Quarter + eighth (6/8)",      parts: [4, 2], compoundOnly: true },
    { key: "eq",      name: "Eighth + quarter (6/8)",      parts: [2, 4], compoundOnly: true },
    { key: "eee",     name: "Three eighths (6/8)",         parts: [2, 2, 2], compoundOnly: true, glyph: "♫♪" }
  ];

  var OTHER_DEFS = [
    { id: "o_tie",     name: "Ties (inside a measure)",   glyph: "♩⁀♩" },
    { id: "o_tie_bar", name: "Ties over the bar line",    glyph: "♩⁀|♩" },
    { id: "o_sync",    name: "Syncopation (off-beat long notes)", glyph: "♪♩♪" }
  ];

  var NOTE_GLYPH = { 16: "𝅝", 12: "𝅗𝅥·", 8: "𝅗𝅥", 6: "♩·", 4: "♩", 3: "♪·", 2: "♪", 1: "𝅘𝅥𝅯" };
  var REST_GLYPH = { 16: "𝄻", 12: "𝄼·", 8: "𝄼", 6: "𝄽·", 4: "𝄽", 3: "𝄾·", 2: "𝄾", 1: "𝄿" };
  var DUR = { 16: { d: "w", dots: 0 }, 12: { d: "h", dots: 1 }, 8: { d: "h", dots: 0 }, 6: { d: "q", dots: 1 }, 4: { d: "q", dots: 0 }, 3: { d: "8", dots: 1 }, 2: { d: "8", dots: 0 }, 1: { d: "16", dots: 0 } };

  var ELEMENTS = {};
  var ELEMENT_ORDER = { ts: [], notes: [], rests: [], other: [] };
  TS_DEFS.forEach(function(t){
    ELEMENTS[t.id] = { id: t.id, cat: "ts", name: t.num + "/" + t.den, ts: t };
    ELEMENT_ORDER.ts.push(t.id);
  });
  function sum(a){ return a.reduce(function(x, y){ return x + y; }, 0); }
  NOTE_SHAPES.forEach(function(s){
    var noteGlyph = s.glyph || s.parts.map(function(t){ return NOTE_GLYPH[t]; }).join("");
    var restGlyph = s.parts.map(function(t){ return REST_GLYPH[t]; }).join("");
    ELEMENTS["n_" + s.key] = { id: "n_" + s.key, key: s.key, cat: "notes", name: s.name, parts: s.parts, total: sum(s.parts), glyph: noteGlyph, rest: false, compoundOnly: !!s.compoundOnly, offbeatOK: !!s.offbeatOK };
    ELEMENTS["r_" + s.key] = { id: "r_" + s.key, key: s.key, cat: "rests", name: s.parts.length > 1 ? s.name + " (with a rest)" : s.name.replace(/ note$/, "") + " rest", parts: s.parts, total: sum(s.parts), glyph: restGlyph, rest: true, compoundOnly: !!s.compoundOnly, offbeatOK: false };
    ELEMENT_ORDER.notes.push("n_" + s.key);
    ELEMENT_ORDER.rests.push("r_" + s.key);
  });
  OTHER_DEFS.forEach(function(o){
    ELEMENTS[o.id] = { id: o.id, cat: "other", name: o.name, glyph: o.glyph };
    ELEMENT_ORDER.other.push(o.id);
  });
  var CAT_LABEL = { ts: "Time signatures", notes: "Notes", rests: "Rests", other: "Other" };
  var CATS = ["ts", "notes", "rests", "other"];
  function tsById(id){ return ELEMENTS[id] && ELEMENTS[id].ts; }
  var SIMPLE_FILLER = { n_quarter: 1, r_quarter: 1, n_half: 1, r_half: 1 };

  // How likely each element is, before any per-level / per-profile override.
  // 1 = normal. Whole notes, long rests and rests inside sixteenth groups are rare.
  function defaultWeight(id){
    var e = ELEMENTS[id];
    if (!e || e.cat === "ts") return 1;
    if (e.cat === "other") return 1;
    if (id === "n_whole") return 0.12;
    if (id === "n_dhalf") return 0.5;
    var hasS = e.parts.indexOf(1) !== -1;
    if (e.rest) {
      if (e.parts.length === 1) return e.total >= 12 ? 0.1 : (e.total >= 8 ? 0.35 : 0.55);
      return hasS ? 0.13 : 0.3;
    }
    if (id === "n_ssss") return 0.8;
    if (hasS) return 0.55;
    return 1;
  }

  function uid(){ return "L" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function rnd(){ return Math.random(); }
  function clone(o){ return JSON.parse(JSON.stringify(o)); }
  function addIds(level){
    var a = level.add || {};
    return [].concat(a.ts || [], a.notes || [], a.rests || [], a.other || []);
  }
  function shapeRule(key){
    var r = cfg.shapeRules[key] || {};
    return { allRest: !!r.allRest, maskAllow: r.maskAllow || null, pitch: r.pitch || "free" };
  }
  function defaultNewMode(){ return { minPerMeasure: 1, ignoreCaps: true, filler: "simple" }; }
  function seedLevels(){
    function L(name, teach, add, caps, extra){
      var lv = { id: uid(), name: name, milestone: "", teach: teach || "", measures: 4, tempo: 72,
        rule: { need: 4, of: 5 },
        add: { ts: add.ts || [], notes: add.notes || [], rests: add.rests || [], other: add.other || [] },
        caps: caps || {} };
      if (extra) Object.keys(extra).forEach(function(k){ lv[k] = extra[k]; });
      return lv;
    }
    return [
      L("Counting quarter notes", "A measure is the space between two bar lines. In 4/4 each measure holds four beats — count 1 2 3 4, then start again.", { ts: ["ts_44"], notes: ["n_quarter"] }, {}, { measures: 2, tempo: 60 }),
      L("Quarter rests", "A rest is a beat of silence. Keep counting; just don't make a sound.", { rests: ["r_quarter"] }, {}, { measures: 2, tempo: 60 }),
      L("Half notes", "A half note lasts two beats.", { notes: ["n_half"], rests: ["r_half"] }, {}, { measures: 4 }),
      L("Eighth-note pairs", "Two eighth notes share one beat: 1 & 2 & ...", { notes: ["n_ee"] }, { n_ee: 2 }),
      L("Whole notes, dotted halves, and 3/4", "A dot adds half the note's value. 3/4 has three beats per measure.", { ts: ["ts_34"], notes: ["n_whole", "n_dhalf"], rests: ["r_whole", "r_dhalf"] }, { n_ee: null }),
      L("Single eighths and eighth rests", "", { notes: ["n_e"], rests: ["r_e", "r_ee"] }, { n_e: 2 }),
      L("Dotted quarter + eighth", "", { notes: ["n_dq_e"], rests: ["r_dq_e"] }, { n_dq_e: 1 }),
      L("Four sixteenths", "", { notes: ["n_ssss"], rests: ["r_ssss"] }, { n_ssss: 1 }),
      L("Mixed sixteenth patterns", "", { notes: ["n_ses", "n_ess", "n_sse"], rests: ["r_ses", "r_ess", "r_sse"] }, { n_ssss: 2, n_ses: 1, n_ess: 1, n_sse: 1 }),
      L("Dotted eighth + sixteenth", "", { notes: ["n_de_s", "n_s_de"], rests: ["r_de_s", "r_s_de"] }, { n_de_s: 1, n_s_de: 1 }),
      L("Ties", "A tie joins two notes into one longer sound: hold, don't re-sing.", { other: ["o_tie", "o_tie_bar"] }, { o_tie: 2, o_tie_bar: 1 }),
      L("Syncopation", "Long notes that start between the beats.", { other: ["o_sync"] }, {}),
      L("6/8", "Two big beats, each divided in three. Count 1 + a 2 + a.", { ts: ["ts_68"], notes: ["n_dq", "n_qe", "n_eq", "n_eee"], rests: ["r_dq", "r_qe", "r_eq", "r_eee"] }, {})
    ];
  }
  function normalizeLevel(lv){
    lv.id = lv.id || uid();
    lv.name = lv.name || "Level";
    lv.milestone = lv.milestone || "";
    lv.teach = lv.teach || "";
    lv.measures = Number(lv.measures) || 4;
    lv.tempo = Number(lv.tempo) || 72;
    if (lv.teach === "Two big beats, each divided in three. Count 1 la li 2 la li.") lv.teach = "Two big beats, each divided in three. Count 1 + a 2 + a.";
    lv.add = lv.add || {};
    CATS.forEach(function(c){
      lv.add[c] = (lv.add[c] || []).filter(function(id){ return ELEMENTS[id] && ELEMENTS[id].cat === c; });
    });
    lv.caps = lv.caps || {};
    lv.weights = lv.weights || {};
    var nm = defaultNewMode();
    lv.newMode = lv.newMode || {};
    lv.newMode.minPerMeasure = Math.max(0, Number(lv.newMode.minPerMeasure == null ? nm.minPerMeasure : lv.newMode.minPerMeasure));
    lv.newMode.ignoreCaps = lv.newMode.ignoreCaps == null ? nm.ignoreCaps : !!lv.newMode.ignoreCaps;
    lv.newMode.filler = lv.newMode.filler === "any" ? "any" : "simple";
    lv.ladder = (lv.ladder || []).map(function(s){
      return { id: s.id || uid(), name: s.name || "Step", kind: s.kind === "generate" ? "generate" : "pattern", text: s.text || "", ts: s.ts || "", measures: Number(s.measures) || 2 };
    });
    return lv;
  }
  function levelIdx(id){ for (var i = 0; i < levels.length; i++) if (levels[i].id === id) return i; return -1; }

  function cumulative(idx){
    var set = {};
    for (var i = 0; i <= idx && i < levels.length; i++) addIds(levels[i]).forEach(function(id){ set[id] = true; });
    return set;
  }
  function introducedAt(id){
    for (var i = 0; i < levels.length; i++) if (addIds(levels[i]).indexOf(id) !== -1) return i;
    return -1;
  }
  function effectiveCap(id, idx){
    for (var i = Math.min(idx, levels.length - 1); i >= 0; i--) {
      if (Object.prototype.hasOwnProperty.call(levels[i].caps, id)) {
        var v = levels[i].caps[id];
        return v == null ? undefined : v;
      }
    }
    return undefined;
  }
  function effectiveWeight(id, idx){
    for (var i = Math.min(idx, levels.length - 1); i >= 0; i--) {
      if (Object.prototype.hasOwnProperty.call(levels[i].weights, id)) return Number(levels[i].weights[id]);
    }
    if (cfg && Object.prototype.hasOwnProperty.call(cfg.weights, id)) return Number(cfg.weights[id]);
    return defaultWeight(id);
  }
  function fits(el, pos, T, sync){
    var tot = el.total;
    if (pos + tot > T.ticks) return false;
    if (el.compoundOnly && !T.compound) return false;
    if (T.compound) {
      if (tot >= 6) return tot % 6 === 0 && pos % 6 === 0;
      return (pos % 6) + tot <= 6;
    }
    if (tot === 16) return pos === 0;
    if (tot >= 8) {
      if (pos % 4 !== 0) return false;
      if (pos % 8 === 0) return true;
      return sync || T.ticks === 12;
    }
    if (tot === 4) {
      if (pos % 4 === 0) return true;
      return sync && el.offbeatOK && pos % 2 === 0;
    }
    if (tot === 6) return false;
    return (pos % 4) + tot <= 4;
  }
  function weightedOrder(list, wfn){
    return list.map(function(x){ return { x: x, k: Math.pow(rnd(), 1 / Math.max(0.0001, wfn(x))) }; })
      .sort(function(a, b){ return b.k - a.k; })
      .map(function(o){ return o.x; });
  }

  // g: {T, pool, newSet, weightOf(id), caps, counts, sync, focus, fillerAny, usedNow}
  function fillMeasure(g){
    var T = g.T, out = [], budget = { n: 4000 };
    function cands(pos, prev){
      var fit = g.pool.filter(function(el){
        if (!fits(el, pos, T, g.sync)) return false;
        var cap = g.caps[el.id];
        if (cap != null && (g.counts[el.id] || 0) >= cap) return false;
        if (g.focus && !g.newSet[el.id] && !(g.fillLevel >= 2) && !(g.fillLevel === 1 && SIMPLE_FILLER[el.id])) return false;
        return true;
      });
      function w(el){
        var wt = g.weightOf(el.id);
        if (g.newSet[el.id]) {
          if (!(g.usedNow[el.id] || g.counts[el.id])) wt *= 10;      // new thing not seen yet in this exercise
          else wt *= g.focus ? 6 : 1.8;
        }
        if (prev && prev.id === el.id) wt *= 0.45;
        if (g.sync && pos % 4 !== 0 && el.total >= 4) wt *= 1.7;
        if (g.sync && pos % 4 === 0 && el.total === 2 && !el.rest) wt *= 1.6;
        return wt;
      }
      return weightedOrder(fit, w);
    }
    function rec(pos, prev){
      if (pos === T.ticks) return true;
      if (budget.n-- <= 0) return false;
      var cs = cands(pos, prev);
      for (var i = 0; i < cs.length; i++) {
        var c = cs[i];
        out.push({ el: c, pos: pos });
        g.counts[c.id] = (g.counts[c.id] || 0) + 1;
        if (rec(pos + c.total, c)) return true;
        out.pop();
        g.counts[c.id]--;
      }
      return false;
    }
    return rec(0, g.prevEl || null) ? out : null;
  }

  function assignBeams(parts, T, mIndex){
    var bid = 0, run = [];
    function flush(){
      if (run.length >= 2) { bid++; run.forEach(function(r){ r.beam = mIndex + "_" + bid; }); }
      run = [];
    }
    parts.forEach(function(p){
      var beatIdx = Math.floor(p.pos / T.beat);
      if (!p.rest && p.ticks <= 3) {
        if (run.length && Math.floor(run[0].pos / T.beat) !== beatIdx) flush();
        run.push(p);
      } else flush();
    });
    flush();
  }

  // Shape rules decide which parts of a multi-part rest-shape may be silent.
  function restMask(el){
    var n = el.parts.length, mask = [], i;
    if (!el.rest) { for (i = 0; i < n; i++) mask.push(false); return mask; }
    if (n === 1) return [true];
    var rule = shapeRule(el.key), allowed = [];
    for (i = 0; i < n; i++) { mask.push(false); if (!rule.maskAllow || rule.maskAllow[i] !== false) allowed.push(i); }
    var maxK = Math.min(allowed.length, rule.allRest ? n : n - 1);
    if (maxK < 1) return mask;
    var ks = [], k;
    for (k = 1; k <= maxK; k++) ks.push(k);
    var kk = weightedOrder(ks, function(x){ return Math.pow(0.35, x - 1); })[0];   // usually just one silent part
    weightedOrder(allowed, function(){ return 1; }).slice(0, kk).forEach(function(ix){ mask[ix] = true; });
    return mask;
  }
  function restUsable(el){
    if (!el.rest || el.parts.length === 1) return true;
    var rule = shapeRule(el.key);
    if (!rule.maskAllow) return true;
    return rule.maskAllow.some(function(v){ return v !== false; });
  }

  function expandMeasure(placed, T, mIndex){
    var parts = [];
    placed.forEach(function(p, gi){
      var el = p.el, mask = restMask(el), pos = p.pos;
      el.parts.forEach(function(t, pi){
        parts.push({ m: mIndex, pos: pos, ticks: t, rest: mask[pi], eid: el.id, gi: gi, tiedNext: false, tiedPrev: false, beam: null });
        pos += t;
      });
    });
    assignBeams(parts, T, mIndex);
    return parts;
  }

  function isSyncopated(p, T){
    if (p.rest) return false;
    var inBeat = p.pos % T.beat;
    return inBeat !== 0 && (inBeat + p.ticks > T.beat);
  }

  // ---- generator configs: where an exercise's rules come from -------------
  function cfgForLevel(idx, o){
    var lv = levels[idx], cum = cumulative(idx), newSet = {};
    addIds(lv).forEach(function(id){ if (ELEMENTS[id].cat !== "ts") newSet[id] = true; });
    var newTs = lv.add.ts.slice();
    var focus = !!o.focus, nm = lv.newMode;
    var caps = {}, pool = [];
    Object.keys(cum).forEach(function(id){
      var e = ELEMENTS[id];
      if (!e || (e.cat !== "notes" && e.cat !== "rests") || !restUsable(e)) return;
      var c = effectiveCap(id, idx);
      if (focus && newSet[id]) c = undefined;          // "show only new stuff" may exceed a cap so every new thing appears
      if (c === 0) return;
      if (c != null) caps[id] = c;
      pool.push(e);
    });
    return { key: lv.id, levelId: lv.id, tsIds: ELEMENT_ORDER.ts.filter(function(id){ return cum[id]; }), newTs: newTs, pool: pool, newSet: newSet,
      weightOf: function(id){ return effectiveWeight(id, idx); }, caps: caps, sync: !!cum.o_sync, tieIds: { o_tie: !!cum.o_tie, o_tie_bar: !!cum.o_tie_bar },
      tieCap: function(id){ return effectiveCap(id, idx); }, focus: focus, minPerMeasure: nm.minPerMeasure, filler: nm.filler,
      measures: lv.measures, label: "this level" };
  }
  function cfgForProfile(prof, cid, o){
    var ids = {}, excluded = [];
    prof.ids.forEach(function(id){
      if (o.forceUntaught || !cid || ELEMENTS[id].cat === "ts" || isTaught(cid, id)) ids[id] = true;
      else excluded.push(id);
    });
    var caps = {}, pool = [];
    Object.keys(ids).forEach(function(id){
      var e = ELEMENTS[id];
      if (!e || (e.cat !== "notes" && e.cat !== "rests") || !restUsable(e)) return;
      var c = prof.caps[id];
      if (c === 0) return;
      if (c != null) caps[id] = c;
      pool.push(e);
    });
    return { key: "p_" + prof.id, levelId: null, profile: prof, excluded: excluded, tsIds: ELEMENT_ORDER.ts.filter(function(id){ return ids[id]; }), newTs: [], pool: pool, newSet: {},
      weightOf: function(id){ return Object.prototype.hasOwnProperty.call(prof.weights, id) ? Number(prof.weights[id]) : (cfg.weights[id] != null ? Number(cfg.weights[id]) : defaultWeight(id)); },
      caps: caps, sync: !!ids.o_sync, tieIds: { o_tie: !!ids.o_tie, o_tie_bar: !!ids.o_tie_bar },
      tieCap: function(id){ return prof.caps[id]; }, focus: false, minPerMeasure: 0, filler: "any", measures: prof.measures, label: prof.name };
  }

  function elFitsTs(el, T, sync){
    if (!el || !el.parts) return true;           // ties / syncopation are handled elsewhere
    for (var pos = 0; pos + el.total <= T.ticks; pos++) if (fits(el, pos, T, sync)) return true;
    return false;
  }
  function generateOnce(gc, o){
    if (!gc.tsIds.length) return { error: "No time signature is available here yet." };
    var T;
    if (o.tsChoice && o.tsChoice !== "auto" && gc.tsIds.indexOf(o.tsChoice) >= 0) T = tsById(o.tsChoice);
    else {
      var src = (gc.focus && gc.newTs.length) ? gc.newTs : gc.tsIds;
      T = tsById(weightedOrder(src, function(id){
        var tt = tsById(id), fitN = Object.keys(gc.newSet).filter(function(k){ return elFitsTs(ELEMENTS[k], tt, gc.sync); }).length;
        return (gc.newTs.indexOf(id) >= 0 ? 2 : 1) * (1 + fitN);
      })[0]);
    }
    if (!gc.pool.some(function(e){ return !e.rest; })) return { error: "No notes are available here yet." };
    var nMeasures = o.measures || gc.measures || 4;
    var g = { T: T, pool: gc.pool, newSet: gc.newSet, weightOf: gc.weightOf, caps: gc.caps, counts: {}, sync: gc.sync, focus: gc.focus, fillLevel: 2, usedNow: {}, prevEl: null };
    var hasNew = Object.keys(gc.newSet).some(function(id){ return gc.pool.indexOf(ELEMENTS[id]) >= 0; });
    var needSync = !!(gc.focus && gc.newSet.o_sync && gc.sync);       // syncopation is new: measures must contain some, which needs eighths etc.
    var measures = [], fullRests = 0;
    for (var m = 0; m < nMeasures; m++) {
      var parts = null;
      for (var attempt = 0; attempt < 30 && !parts; attempt++) {
        // focus mode: fill with new things only; use something not new only when a measure can't be filled otherwise
        if (gc.focus) g.fillLevel = Math.max(gc.filler === "any" ? 1 : 0, needSync ? 2 : 0, attempt < 10 ? 0 : attempt < 20 ? 1 : 2);
        var snapshot = clone(g.counts);
        var tryPlaced = fillMeasure(g);
        if (!tryPlaced) { g.counts = snapshot; continue; }
        var tryParts = expandMeasure(tryPlaced, T, m);
        var hasSound = tryParts.some(function(p){ return !p.rest; });
        if (!hasSound && (m === 0 || fullRests >= 1)) { g.counts = snapshot; continue; }
        if (gc.focus && (hasNew || needSync) && gc.minPerMeasure > 0) {
          var nNew = tryPlaced.filter(function(pl){ return gc.newSet[pl.el.id]; }).length + (needSync ? tryParts.filter(function(p){ return isSyncopated(p, T); }).length : 0);
          // a measure can't hold more new things than fit; accept fewer after many tries
          if (nNew < Math.min(gc.minPerMeasure, attempt < 24 ? 99 : 1)) { g.counts = snapshot; continue; }
        }
        parts = tryParts;
        g.prevEl = tryPlaced[tryPlaced.length - 1].el;
        tryPlaced.forEach(function(pl){ g.usedNow[pl.el.id] = true; });
        if (!hasSound) fullRests++;
      }
      if (!parts) return { error: "Couldn’t fill a " + T.num + "/" + T.den + " measure with " + gc.label + "’s notes, rests and limits. Check the limits." };
      measures.push(parts);
    }
    var flat = [];
    measures.forEach(function(ms){ ms.forEach(function(p){ flat.push(p); }); });
    var tieCounts = { o_tie: 0, o_tie_bar: 0 };
    ["o_tie", "o_tie_bar"].forEach(function(tid){
      if (!gc.tieIds[tid]) return;
      var cap = gc.tieCap(tid);
      var maxN = cap == null ? 2 : cap;
      if (maxN <= 0) return;
      var cand = [];
      for (var i = 0; i < flat.length - 1; i++) {
        var p = flat[i], q = flat[i + 1];
        if (p.rest || q.rest || p.tiedNext || p.tiedPrev || q.tiedNext || q.tiedPrev) continue;
        if (p.eid === q.eid && p.gi === q.gi && p.m === q.m) continue;
        var cross = p.m !== q.m;
        if ((tid === "o_tie_bar") !== cross) continue;
        cand.push(i);
      }
      var want = Math.min(cand.length, Math.max(gc.newSet[tid] ? 1 : 0, Math.floor(rnd() * (maxN + 1))));
      weightedOrder(cand, function(){ return 1; }).forEach(function(i){
        if (tieCounts[tid] >= want) return;
        var p = flat[i], q = flat[i + 1];
        if (p.tiedNext || p.tiedPrev || q.tiedNext || q.tiedPrev) return;
        p.tiedNext = true; q.tiedPrev = true; tieCounts[tid]++;
      });
    });
    var used = {};
    measures.forEach(function(ms){
      var seenGi = {};
      ms.forEach(function(p){ var k = p.m + "_" + p.gi; if (!seenGi[k]) { seenGi[k] = 1; used[p.eid] = (used[p.eid] || 0) + 1; } });
    });
    if (tieCounts.o_tie) used.o_tie = tieCounts.o_tie;
    if (tieCounts.o_tie_bar) used.o_tie_bar = tieCounts.o_tie_bar;
    var syncN = flat.filter(function(p){ return isSyncopated(p, T); }).length;
    if (syncN) used.o_sync = syncN;
    // Everything a level introduces should appear. When it introduces more than fit in the
    // measures, only the new notes / ties / syncopation are required (new rests are best-effort).
    var wanted = Object.keys(gc.newSet).filter(function(id){
      if (id === "o_tie" || id === "o_tie_bar" || id === "o_sync") return true;
      return gc.pool.indexOf(ELEMENTS[id]) >= 0 && elFitsTs(ELEMENTS[id], T, gc.sync);     // e.g. no whole note in 3/4
    });
    var reqAll = wanted.length < nMeasures;
    var score = 0, total = 0, hit = 0;
    wanted.forEach(function(id){
      var essential = reqAll || !ELEMENTS[id].rest;
      if (essential) { total++; if (used[id]) hit++; }
      if (used[id]) score += essential ? 1 : 0.25;
    });
    var soundCount = flat.filter(function(p){ return !p.rest; }).length;
    return { ex: { ts: T, measures: measures, used: used, levelId: gc.levelId, profileId: gc.profile ? gc.profile.id : null, focus: gc.focus, excluded: gc.excluded || [] }, score: score - (soundCount < nMeasures ? 5 : 0), complete: hit >= total, total: total };
  }

  function generateFrom(gc, o){
    var best = null, lastErr = "";
    for (var i = 0; i < 60; i++) {
      var r = generateOnce(gc, o);
      if (r.error) { lastErr = r.error; if (i > 3) break; continue; }
      if (!best || (r.complete && !best.complete) || (r.complete === best.complete && r.score > best.score)) best = r;
      if (r.complete) break;
    }
    return best ? { ex: best.ex, complete: !!best.complete } : { error: lastErr || "Couldn’t build an exercise." };
  }
  // Compatibility entry point (tests / old callers): level index + {newOnly, tsChoice, measures}
  function generateExercise(lvIdx, o){
    o = o || {};
    var gc = cfgForLevel(lvIdx, { focus: !!o.newOnly });
    return generateFrom(gc, { tsChoice: o.tsChoice, measures: o.measures });
  }
  // ===== Workbook score renderer, extracted from Workbook.js 4.67 (renderScore and what it needs): the student site draws music exactly like the printed worksheet =====
  var WBX = (function(){
  var settings = { title: "Piano Workbook", numbering: true, studentId: "", unitIds: null, hideDone: false };
  var over = {};      // "studentId|itemId" -> true/false include override (session only)
  var breaks = {};    // "studentId|itemId" -> true: page break before (session only)
  // activeAid = the item being edited on the page ("" = none); sel/anchor = selected note range inside it
  function $(id){ return document.getElementById(id); }
  var LET = ["c", "d", "e", "f", "g", "a", "b"];
  var SEMI = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  var ACC_OFF = { "bb": -2, "b": -1, "": 0, "#": 1, "##": 2 };
  var DUR_BEATS = { w: 4, h: 2, q: 1, "8": 0.5, "16": 0.25 };
  var KEY_COUNT = { C: 0, G: 1, D: 2, A: 3, E: 4, B: 5, "F#": 6, "C#": 7, F: -1, Bb: -2, Eb: -3, Ab: -4, Db: -5, Gb: -6, Cb: -7,
    Am: 0, Em: 1, Bm: 2, "F#m": 3, "C#m": 4, "G#m": 5, "D#m": 6, "A#m": 7, Dm: -1, Gm: -2, Cm: -3, Fm: -4, Bbm: -5, Ebm: -6, Abm: -7 };
  function timeOf(ex){ var t = ex.time || "4/4"; return t === "free" ? "4/4" : t; }
  function isFree(ex){ return ex.time === "free"; }
  // X61 (item 5): free time can be chosen per kind of picture: ex.freeIn = {staff, cells, icons} (true / false). Free time on the time picker = all three unless one is switched off.
  // Default for a worksheet with a time signature: the staves keep their measures and bar lines, note names ("cells") and icon blocks are free (settings.freeDefault === false turns that default off).
  function isFreeV(ex, kind){
    var fi = ex.freeIn || {};
    if (fi[kind] != null) return !!fi[kind];
    if (ex.time === "free") return true;
    return kind !== "staff" && !(settings && settings.freeDefault === false);
  }
  var SHARPS = ["f", "c", "g", "d", "a", "e", "b"], FLATS = ["b", "e", "a", "d", "g", "c", "f"];

  function keyAccFor(key){
    var n = KEY_COUNT[key]; if (n == null) n = 0;
    var m = {};
    if (n > 0) for (var i = 0; i < n; i++) m[SHARPS[i]] = "#";
    if (n < 0) for (var j = 0; j < -n; j++) m[FLATS[j]] = "b";
    return m;
  }
  function parseKey(k){ var m = /^([a-g])(bb|b|##|#)?\/(\d)$/.exec(k || "c/4"); return { l: m ? m[1] : "c", acc: m && m[2] ? m[2] : "", oct: m ? +m[3] : 4 }; }
  function stepOf(k){ var p = parseKey(k); return p.oct * 7 + LET.indexOf(p.l); }
  function midiOf(k){ var p = parseKey(k); return 12 * (p.oct + 1) + SEMI[p.l] + ACC_OFF[p.acc]; }
  function beatsPerMeasure(time){ var p = String(time || "4/4").split("/"); return (parseInt(p[0], 10) || 4) * 4 / (parseInt(p[1], 10) || 4); }
  function noteBeats(n){ return (DUR_BEATS[n.d] || 1) * (n.dot ? 1.5 : 1) * (n.tp ? 2 / 3 : 1); }   // X60: n.tp = a triplet note (3 in the time of 2)
  function restKey(clef){ return clef === "bass" ? "d/3" : "b/4"; }
  function splitMeasures(notes, time, pickup){
    var cap = beatsPerMeasure(time), ms = [], pk = pickup > 0 && pickup < cap ? pickup : 0, cur = { idx: [], beats: 0, cap: pk || cap };
    notes.forEach(function(n, i){
      cur.idx.push(i); cur.beats += noteBeats(n);
      if (cur.beats >= cur.cap - 1e-6) { ms.push(cur); cur = { idx: [], beats: 0, cap: cap }; }
    });
    if (cur.idx.length) ms.push(cur);
    return { cap: cap, pickup: pk, measures: ms };
  }

  function isRhythm(ex){ return ex.layout === "rhythm"; }
  function staffList(ex){ return ex.layout === "treble" || ex.layout === "rhythm" ? ["R"] : ex.layout === "bass" ? ["L"] : ["R", "L"]; }
  function notesOf(ex, st){ if (st === "L") { if (!ex.notesL) ex.notesL = []; return ex.notesL; } return ex.notes || (ex.notes = []); }
  function clefOfStaff(st){ return st === "L" ? "bass" : "treble"; }
  function octShift(ex, st){ var first = staffList(ex)[0]; return st === first ? (ex.clefOct === "8va" ? 12 : ex.clefOct === "8vb" ? -12 : 0) : 0; }
  function noteName(n){ var p = parseKey(n.k); return p.l.toUpperCase() + p.acc.replace(/b/g, "♭").replace(/#/g, "♯"); }
  // Hand-position segments: a note flagged hp (not the first) starts a new hand position.
  function segStarts(notes){ var s = [0]; for (var i = 1; i < notes.length; i++) if (notes[i].hp) s.push(i); return s; }
  function segEnd(notes, s){ for (var i = s + 1; i < notes.length; i++) if (notes[i].hp) return i; return notes.length; }
  // Teacher's system: within a hand position the lowest note is 1 ... the highest is 5. A finger typed on a note wins.
  function fingersFor(ex, st){
    var notes = notesOf(ex, st), out = [], starts = segStarts(notes);
    starts.forEach(function(s, k){
      var e = k + 1 < starts.length ? starts[k + 1] : notes.length, lo = 1e9, i;
      for (i = s; i < e; i++) if (!notes[i].rest) lo = Math.min(lo, stepOf(notes[i].k));
      for (i = s; i < e; i++) {
        var n = notes[i];
        if (n.rest) { out[i] = 0; continue; }
        if (n.fing) { out[i] = n.fing; continue; }
        var f = stepOf(n.k) - lo + 1; out[i] = f >= 1 && f <= 5 ? f : 0;
      }
    });
    return out;
  }
  // greedy list of note values that add up to a number of beats (for filling empty / short measures)
  function beatDurs(beats){
    var vals = [[4, "w", 0], [3, "h", 1], [2, "h", 0], [1.5, "q", 1], [1, "q", 0], [0.75, "8", 1], [0.5, "8", 0], [0.25, "16", 0]], out = [];
    while (beats > 1e-6) {
      var v = null; for (var i = 0; i < vals.length; i++) if (vals[i][0] <= beats + 1e-6) { v = vals[i]; break; }
      if (!v) break; out.push({ d: v[1], dot: v[2] }); beats -= v[0];
    }
    return out;
  }

  // =====================================================================
  //  Hand position diagram (white keys, black keys, numbered circles)
  // =====================================================================
  var WHITE_PC = [0, 2, 4, 5, 7, 9, 11];
  function whiteIdxOf(m){ var pc = ((m % 12) + 12) % 12, oct = Math.floor(m / 12), j = 0; for (var i = 0; i < 7; i++) if (WHITE_PC[i] <= pc) j = i; return oct * 7 + j; }
  function whiteMidi(idx){ return Math.floor(idx / 7) * 12 + WHITE_PC[((idx % 7) + 7) % 7]; }
  function isBlackMidi(m){ return WHITE_PC.indexOf(((m % 12) + 12) % 12) === -1; }
  // where a segment's saved diagram settings live: first position -> ex.handPos / ex.handPosL, later ones -> on the note that starts them
  function hpGet(ex, st, s){ return s === 0 ? (st === "L" ? ex.handPosL : ex.handPos) : notesOf(ex, st)[s] && notesOf(ex, st)[s].hpd; }
  function hpChanges(ex, st){ return staffList(ex).some(function(s2){ return notesOf(ex, s2).some(function(n, i){ return i > 0 && n.hp; }); }); }   // any hand changing position puts every hand's diagrams inside the score
  // each position's diagram hangs on the first PLAYED note of its stretch (rests before it don't count); a stretch with no played notes gets none
  function hpAnchors(ex, st){
    var out = {}; if (!hpChanges(ex, st)) return out;
    var notes = notesOf(ex, st);
    segStarts(notes).forEach(function(s){ var e = segEnd(notes, s); for (var i = s; i < e; i++) if (!notes[i].rest) { out[i] = s; break; } });
    return out;
  }
  function handPosModel(ex, st, s){
    var notes = notesOf(ex, st), f = fingersFor(ex, st), e = segEnd(notes, s), sh = octShift(ex, st), used = {}, lo = 1e9, hi = -1e9;
    for (var i = s; i < e; i++) {
      var n = notes[i]; if (n.rest) continue;
      var m = midiOf(n.k) + sh; lo = Math.min(lo, m); hi = Math.max(hi, m);
      if (f[i] && !used[m]) used[m] = f[i];
    }
    var hp = hpGet(ex, st, s) || {}, count = hp.count || (hpChanges(ex, st) ? 9 : 11);
    if (lo > hi) { lo = st === "L" ? 48 : 60; hi = lo + 4; }
    var loW = whiteIdxOf(lo), hiW = whiteIdxOf(hi), span = hiW - loW + 1;
    var start = hp.start != null ? hp.start : loW - Math.max(0, Math.floor((count - span) / 2));
    return { start: start, count: count, marks: hp.marks || used, manual: !!(hp.marks || hp.start != null || hp.count), mode: hp.mode || (hp.hide ? "none" : "graphic"), hide: (hp.mode || (hp.hide ? "none" : "graphic")) !== "graphic", blank: !!hp.blank };
  }
  // The diagram's drawing (no outer <svg>). o.edit = clickable keys + yellow duplicates + selected-key outline.
  function handInner(ex, st, s, o){
    o = o || {};
    var md = handPosModel(ex, st, s);
    if (md.hide) return { svg: "", w: 0, h: 0, hidden: true };   // X22 (item 4): "Nothing" makes the diagram disappear (no ghost while editing); pick it again from the Hand positions list
    if (md.mode === "text" && !o.edit) return { svg: "", w: 0, h: 0, hidden: true };
    var WK = 26, BK = 15, HT = 72, BH = 43, out = "", whites = [], x = {};
    for (var i = 0; i < md.count; i++) { var m = whiteMidi(md.start + i); whites.push(m); x[m] = 1 + i * WK; }
    var attr = function(m){ return o.edit ? ' data-action="hp-key" data-st="' + st + '" data-seg="' + s + '" data-m="' + m + '" style="cursor:pointer"' : ""; };
    whites.forEach(function(m){ out += '<rect x="' + x[m] + '" y="1" width="' + WK + '" height="' + HT + '" fill="#fff" stroke="#000" stroke-width="1"' + attr(m) + '/>'; });
    var blacks = [];
    whites.forEach(function(m){ var b = m + 1; if (isBlackMidi(b) && x[m + 2] != null) blacks.push(b); });
    blacks.forEach(function(b){ var bx = x[b - 1] + WK - BK / 2; out += '<rect x="' + bx + '" y="1" width="' + BK + '" height="' + BH + '" fill="#000" stroke="#000"' + attr(b) + '/>'; });
    var counts = {}; Object.keys(md.marks).forEach(function(k){ var v = md.marks[k]; if (v) counts[v] = (counts[v] || 0) + 1; });
    var showNums = !md.blank || o.edit, R = 8, sel = o.sel && o.sel.st === st && o.sel.s === s ? o.sel.m : null;
    Object.keys(md.marks).forEach(function(k){
      var m = +k, v = md.marks[k]; if (!v || !showNums) return;
      var cx, cy;
      if (isBlackMidi(m)) { if (x[m - 1] == null || x[m + 1] == null) return; cx = x[m - 1] + WK; cy = BH - R - 3; }
      else { if (x[m] == null) return; cx = x[m] + WK / 2; cy = BH + R + 7; }
      var dup = o.edit && md.manual && counts[v] > 1;   // only hand-made numbers are checked for duplicates
      var faint = md.blank && o.edit ? ' opacity="0.35"' : "";
      out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="' + (dup ? "#fde047" : "#fff") + '" stroke="#000" stroke-width="1.6"' + faint + attr(m) + '/>' +
        '<text x="' + cx + '" y="' + (cy + 3.6) + '" font-size="10" font-weight="bold" fill="#000" text-anchor="middle" pointer-events="none"' + faint + '>' + v + '</text>';
    });
    if (md.blank && !o.edit) Object.keys(md.marks).forEach(function(k){
      var m = +k; if (!md.marks[k]) return; var cx, cy;
      if (isBlackMidi(m)) { if (x[m - 1] == null || x[m + 1] == null) return; cx = x[m - 1] + WK; cy = BH - R - 3; }
      else { if (x[m] == null) return; cx = x[m] + WK / 2; cy = BH + R + 7; }
      out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#fff" stroke="#000" stroke-width="1.6"/>';
    });
    if (o.edit && sel != null) {
      var sx, sy, sw, sh;
      if (isBlackMidi(sel)) { if (x[sel - 1] != null) { sx = x[sel - 1] + WK - BK / 2; sy = 1; sw = BK; sh = BH; } }
      else if (x[sel] != null) { sx = x[sel]; sy = 1; sw = WK; sh = HT; }
      if (sx != null) out += '<rect x="' + sx + '" y="' + sy + '" width="' + sw + '" height="' + sh + '" fill="none" stroke="#2f6bb3" stroke-width="3" pointer-events="none"/>';
    }
    if (md.hide && o.edit) out = '<g opacity="0.3">' + out + '</g>';
    return { svg: out, w: md.count * WK + 2, h: HT + 2 };
  }
  function hpRoom(ex, st, s, o){
    var md = handPosModel(ex, st, s);
    return md.mode === "graphic" ? Math.round(74 * MINI) + 8 : md.mode === "text" ? 20 : 0;
  }
  // Accidentals the way a score reads them: the key signature applies to every octave; a sharp/flat/natural that is not in it
  // is shown once, holds for the rest of that measure (same pitch), and is forgotten at the bar line. A note tied across the bar keeps its sign without repeating it.
  function addAccidentals(Sx, measures, keySig){
    var VF = window.VexFlow;
    var keyAcc = keyAccFor(keySig);
    measures.forEach(function(m, k){
      if (!m) return;
      var state = {};
      m.idx.forEach(function(i, pos){
        var n = Sx.notes[i]; if (n.rest) return;
        var p = parseKey(n.k), id = p.l + p.oct, cur = state[id] != null ? state[id] : (keyAcc[p.l] || "");
        var prev = i > 0 ? Sx.notes[i - 1] : null;
        var carried = pos === 0 && prev && prev.tie && !prev.rest && prev.k === n.k;      // tied over the bar line
        if (carried) { state[id] = p.acc; return; }
        if (p.acc !== cur) { Sx.sn[i].addModifier(new VF.Accidental(p.acc === "" ? "n" : p.acc), 0); }
        state[id] = p.acc;
      });
    });
  }
  // beaming: which notes can carry a beam, and how long a default beam group is (in quarter-note beats)
  function beamableNote(n){ return !!n && (!n.rest || !!n.snap) && (n.d === "8" || n.d === "16"); }   // X60: a snap (X note head) beams like a note
  // X60: triplets - consecutive tp notes in a measure are grouped three at a time (a group is one bracket / "3"); returns {noteIndex: groupNumber}
  function tupGroups(notes, idx){
    var out = {}, g = 0, c = 0;
    idx.forEach(function(i){ if (notes[i].tp) { if (c === 3) { g++; c = 0; } out[i] = g; c++; } else { if (c) { g++; c = 0; } } });
    return out;
  }
  function beamGroupLen(time){
    var p = String(time || "4/4").split("/"), num = +p[0] || 4, den = +p[1] || 4;
    return den === 8 && num % 3 === 0 ? 1.5 : den === 2 ? 2 : 1;
  }
  var NOTE_W = { w: 56, h: 44, q: 31, "8": 24, "16": 20 };
  var MINI = 0.78;      // size of a position-change diagram inside the score
  // X26 (item 8.3): notes that do not fit the pickup measure. The PREVIEW (editing, o.edit) draws them red; print, save and the read-only views never do.
  function pickupOverflow(ex){
    var out = { R: {}, L: {} };
    try {
      if (isFree(ex) || !(+ex.pickup > 0)) return out;
      var tm = timeOf(ex), cap = beatsPerMeasure(tm); if (!(ex.pickup < cap)) return out;
      [["R", ex.notes], ["L", ex.notesL]].forEach(function(p){
        var nt = p[1] || [], m0 = splitMeasures(nt, tm, ex.pickup).measures[0]; if (!m0) return;
        var t = 0;
        m0.idx.forEach(function(i){ if (t + 1e-6 >= ex.pickup) out[p[0]][i] = true; else if (t + noteBeats(nt[i]) > ex.pickup + 1e-6) out[p[0]][i] = true; t += noteBeats(nt[i]); });
      });
    } catch (e) {}
    return out;
  }
  function renderScore(host, ex, o){
    o = o || {};
    var VF = window.VexFlow, W = o.width || 720;
    var rh = isRhythm(ex), helpers = ex.helpers || {}, staffFing = !rh && !!helpers.fingers, staffNames = !rh && !!helpers.names;
    host.innerHTML = "";
    var keySig = rh ? "C" : (ex.key || "C"), time = timeOf(ex), free = isFreeV(ex, "staff"), showTime = !ex.timeHidden && !free && ex.time !== "free", cap = beatsPerMeasure(time), pickup = ex.pickup > 0 && ex.pickup < cap ? ex.pickup : 0, capOf = function(mi){ return mi === 0 && pickup ? pickup : cap; };
    var stl = staffList(ex), grand = stl.length === 2, S = {};
    // v4.37 (round X15, item 8): FREE TIME has no measures at all. Each line is ONE measure that holds exactly the notes that fit it (no beat counting, no gaps for bar lines); the last line ends with the double bar.
    var freeInfo = function(nt){
      var limit = W - 4 - (rh ? 38 : 46) - Math.abs(KEY_COUNT[keySig] || 0) * 10 - (grand ? 6 : 0) - 12 - 18, ms = [], cur = { idx: [], beats: 0, cap: cap }, w = 0;
      nt.forEach(function(n, i){
        var nw = (NOTE_W[n.d] || 40) + (n.dot ? 8 : 0) + (!n.rest && parseKey(n.k).acc ? 10 : 0);
        if (cur.idx.length && (w + nw > limit || (ex.perLine > 0 && cur.idx.length >= ex.perLine * 4))) { ms.push(cur); cur = { idx: [], beats: 0, cap: cap }; w = 0; }
        cur.idx.push(i); cur.beats += noteBeats(n); w += nw;
      });
      if (cur.idx.length) ms.push(cur);
      return { cap: cap, pickup: 0, measures: ms };
    };
    stl.forEach(function(st){
      var nt = notesOf(ex, st);
      S[st] = { st: st, clef: rh ? "percussion" : clefOfStaff(st), notes: nt, info: free ? freeInfo(nt) : splitMeasures(nt, time, ex.pickup), fing: staffFing ? fingersFor(ex, st) : null, sn: [] };
    });
    var M = 0; stl.forEach(function(st){ M = Math.max(M, S[st].info.measures.length); });
    var meas = function(st, mi){ return S[st].info.measures[mi] || null; };
    // beams that cross between the staves (n.bx): a note is joined to the note that starts when it ends, on the other staff
    var crossOf = {}, chains = [];
    if (stl.length === 2 && !rh) {
      var cmod = crossModel(ex), nextOf = {}, hasPrev = {};
      stl.forEach(function(st){
        S[st].notes.forEach(function(n, i){
          if (!n.bx) return;
          var tg = crossTargetOf(cmod, st, i, true);
          if (tg) { nextOf[st + ":" + i] = tg.st + ":" + tg.i; hasPrev[tg.st + ":" + tg.i] = true; }
        });
      });
      Object.keys(nextOf).forEach(function(k0){
        if (hasPrev[k0]) return;
        var ch = [], k = k0, sts = {};
        while (k) { var pp = k.split(":"); ch.push({ st: pp[0], i: +pp[1] }); sts[pp[0]] = true; k = nextOf[k]; }
        if (ch.length > 1 && sts.R && sts.L) { chains.push(ch); ch.forEach(function(c){ crossOf[c.st + ":" + c.i] = true; }); }
      });
    }
    var isChg = function(st, i){ return !!(o.chg && o.chg[st] && o.chg[st][i]); };
    var ovfP = o.edit ? pickupOverflow(ex) : null, isOvf = function(st, i){ return !!(ovfP && ovfP[st] && ovfP[st][i]); };
    var isSel = function(st, i){ return selIn(o, st, i); };

    // measure flags are shared by both staves: either staff's note can carry them
    var mbr = [], mnb = [], mrs = [], mre = [];
    for (var mi0 = 0; mi0 < M; mi0++) {
      var br = false, nb = false, rs = false, re = false;
      stl.forEach(function(st){ var m = meas(st, mi0); if (!m) return; var nt = S[st].notes; if (nt[m.idx[0]].br) br = true; if (nt[m.idx[0]].nb) nb = true; if (nt[m.idx[0]].rs) rs = true; if (nt[m.idx[m.idx.length - 1]].re) re = true; });
      mbr.push(br); mnb.push(nb && !br); mrs.push(rs); mre.push(re);
    }
    // every measure takes the same time on both staves: the longest of the two (or the nominal length). A staff that is shorter is padded
    // with invisible rests, so the bar lines of the two staves can never drift apart (even when the beats of the two hands do not add up).
    var mlen = [];
    for (var mi3 = 0; mi3 < M; mi3++) {
      var ml0 = capOf(mi3);
      stl.forEach(function(st){ var m = meas(st, mi3); if (!m) return; var u = 0; m.idx.forEach(function(i){ u += noteBeats(S[st].notes[i]); }); ml0 = Math.max(ml0, u); });
      mlen.push(ml0);
    }
    var keyOver = Math.abs(KEY_COUNT[keySig] || 0) * 10;
    var sysOverhead = function(si){ return (rh ? 38 : 46) + keyOver + (si === 0 && showTime ? 30 : 0) + (grand ? 6 : 0); };

    // pack measures into systems (a measure is as wide as its wider staff)
    var mw = [];
    for (var mi1 = 0; mi1 < M; mi1++) {
      var wmax = 72;
      stl.forEach(function(st){
        var m = meas(st, mi1); if (!m) return; var nt = S[st].notes, w = 18;
        m.idx.forEach(function(i){ w += (NOTE_W[nt[i].d] || 40) + (nt[i].dot ? 8 : 0) + (!nt[i].rest && parseKey(nt[i].k).acc ? 10 : 0); });
        wmax = Math.max(wmax, w);
      });
      if (mrs[mi1]) wmax += 10; if (mre[mi1]) wmax += 10;
      mw.push(wmax);
    }
    var systems = [], cur = [], curW = 0, lsS = (!free && ex.lineGroups && ex.lineGroups.length) ? lineStarts(ex, M) : null;   // X23 (item 9.6): forced groups win over everything else
    if (!M) systems = [[]];
    else {
      for (var mi2 = 0; mi2 < M; mi2++) {
        var avail0 = W - 4 - sysOverhead(systems.length) - 12;
        if (cur.length && (free || (lsS ? lsS[mi2] : (mbr[mi2] || (ex.perLine > 0 ? (cur.length >= ex.perLine && !mnb[mi2]) : (curW + mw[mi2] > avail0 && !mnb[mi2])))))) { systems.push(cur); cur = []; curW = 0; }
        cur.push(mi2); curW += mw[mi2];
      }
      if (cur.length) systems.push(cur);
    }

    // each line gets the height its notes need: ledger lines, and room for hand-position diagrams
    var first = stl[0], second = stl[1], lay = [], cumY = 0, nm = staffNames ? 16 : 0;
    var anc = {}; stl.forEach(function(st){ anc[st] = hpAnchors(ex, st); });
    systems.forEach(function(sysM){
      var need = {};
      stl.forEach(function(st){
        var nd = { hi: 0, lo: 0, hp: 0 }, nt = S[st].notes, top = stepOf(st === "L" ? "a/3" : "f/5"), bot = stepOf(st === "L" ? "g/2" : "e/4");
        sysM.forEach(function(mi){ var m = meas(st, mi); if (!m) return; m.idx.forEach(function(i){ var n = nt[i]; if (anc[st][i] != null) nd.hp = Math.max(nd.hp, hpRoom(ex, st, anc[st][i], o)); if (n.rest || rh) return; var sp = stepOf(n.k); nd.hi = Math.max(nd.hi, sp - top); nd.lo = Math.max(nd.lo, bot - sp); }); });
        need[st] = nd;
      });
      var tr = rh ? 24 : Math.max(28, need[first].hi * 5 + 22) + need[first].hp, gap = 0, bot2;
      if (grand) { gap = Math.max(chains.length ? 64 : 50, need.R.lo * 5 + 20 + need.L.hi * 5 + 20 + nm); bot2 = Math.max(26 + nm, need.L.lo * 5 + 22 + nm) + need.L.hp; }
      else bot2 = rh ? 16 : Math.max(26 + nm, need[first].lo * 5 + 22 + nm);
      var y1 = cumY + tr - 40, h = tr + 40 + (grand ? gap + 40 : 0) + bot2;
      lay.push({ top: cumY, y1: y1, y2: y1 + 40 + gap, h: h });
      cumY += h;
    });
    var H = cumY + 4;

    var renderer = new VF.Renderer(host, VF.Renderer.Backends.SVG);
    renderer.resize(W, H);
    var ctx = renderer.getContext();
    var extraSvg = "";

    // StaveNotes for every note (indices stay aligned with each staff's note list)
    stl.forEach(function(st){
      var Sx = S[st];
      Sx.sn = Sx.notes.map(function(n, i){
        var key = rh ? "b/4" : (n.rest ? restKey(Sx.clef) : n.k);
        if (n.snap) key = (rh ? "b/4" : restKey(Sx.clef)) + "/x";   // X60: a snap is an X note head on the middle line (stored as rest + snap)
        // stem direction: automatic, unless the teacher set it (n.stem "u"/"d"); rhythm lines default to stems up (= right hand)
        var forced = crossOf[st + ":" + i] ? (st === "R" ? VF.Stem.DOWN : VF.Stem.UP) : n.stem === "u" ? VF.Stem.UP : n.stem === "d" ? VF.Stem.DOWN : (rh ? VF.Stem.UP : 0);
        var so = { keys: [key], duration: n.d + (n.dot ? "d" : "") + (n.rest && !n.snap ? "r" : ""), clef: Sx.clef === "percussion" ? "treble" : Sx.clef, autoStem: !forced };
        if (forced) so.stemDirection = forced;
        var s = new VF.StaveNote(so);
        if (n.dot) VF.Dot.buildAndAttach([s], { all: true });
        if (n.snap) { try { var sa = new VF.Annotation("(snap)"); sa.setFont("Arial, sans-serif", 10, "italic"); sa.setVerticalJustification(VF.Annotation.VerticalJustify.TOP); s.addModifier(sa, 0); } catch (e) { /* label is best-effort */ } }
        if (isOvf(st, i)) s.setStyle({ fillStyle: "#d22", strokeStyle: "#d22" });   // X26 (item 8.3): does not fit the pickup (preview only)
        else if (isSel(st, i)) s.setStyle({ fillStyle: "#2f6bb3", strokeStyle: "#2f6bb3" });
        else if (isChg(st, i)) s.setStyle({ fillStyle: "#e8590c", strokeStyle: "#e8590c" });
        return s;
      });
    });
    // cross-staff chains: a beam object (never drawn) only so the notes show no flags of their own
    chains.forEach(function(ch){ try { new VF.Beam(ch.map(function(c){ return S[c.st].sn[c.i]; }), false); } catch (e) { /* skip */ } });
    // a short tie running off one side of a note (line break / repeat sign): drawn by hand so it never stretches across the stave
    var halfTie = function(note, dirOut, stave, startBarX){
      try {
        var up = note.getStemDirection() === VF.Stem.UP, sg = up ? 1 : -1, y = note.getYs()[0] + sg * 6, MINL = 22, xa, xb;
        if (dirOut) { xa = note.getTieRightX() + 2; xb = Math.max(xa + MINL, stave.getNoteEndX() - 4); }
        else { xb = note.getTieLeftX() - 4; xa = Math.min(xb - MINL, Math.max(startBarX != null ? startBarX : -1e9, stave.getNoteStartX() + 4)); if (xa > xb - MINL) xa = xb - MINL; }
        var len = xb - xa, xm = (xa + xb) / 2, c1 = Math.min(18, 8 + len / 10), c2 = c1 - 4;
        ctx.beginPath(); ctx.moveTo(xa, y); ctx.quadraticCurveTo(xm, y + sg * c1, xb, y); ctx.quadraticCurveTo(xm, y + sg * c2, xa, y); ctx.closePath(); ctx.fill();
      } catch (e) { /* skip */ }
    };
    // thin + thick bar lines for a repeat sign, in the same places VexFlow draws them on a stave
    var gapBar = function(kind, x, y0, y1){
      var h = y1 - y0; if (h <= 0) return;
      if (kind === "begin" || kind === "both") { ctx.fillRect(x - 2, y0, 3, h); ctx.fillRect(x + 3, y0, 1, h); }
      if (kind === "end" || kind === "both") { ctx.fillRect(x - 2, y0, 3, h); ctx.fillRect(x - 5, y0, 1, h); }
    };
    var CT = VF.StaveConnector.type || {};
    var conn = function(a, b, type, lit){ try { new VF.StaveConnector(a, b).setType(CT[type] != null ? CT[type] : lit).setContext(ctx).draw(); } catch (e) { console.error("connector", e.message); } };
    // a tie on the last note before a repeat sign ties back to the first note of the repeat
    var repTie = {}, repTarget = {};
    stl.forEach(function(st){ repTie[st] = {}; repTarget[st] = {}; });
    stl.forEach(function(st){
      for (var mi = 0; mi < M; mi++) {
        var m = meas(st, mi); if (!m || !mre[mi]) continue;
        var nt = S[st].notes, li = m.idx[m.idx.length - 1]; if (!nt[li].tie || nt[li].rest) continue;
        var mj = mi; while (mj > 0 && !mrs[mj]) mj--;
        var mm = meas(st, mj); if (!mm) continue; var t = mm.idx[0]; if (nt[t].rest) continue;
        repTie[st][li] = true; repTarget[st][t] = true;
      }
    });

    // beams inside one measure: automatic groups (by beat), plus the teacher's "join" / "split" flags (n.bm on the first note of a pair)
    var makeBeams = function(st, mi, m){
      var Sx = S[st], out = [], t = (mi === 0 && pickup) ? cap - pickup : 0, gl = beamGroupLen(time), links = [], runs = [], cur = [], k;
      var info = m.idx.map(function(i){ var n = Sx.notes[i], s0 = t; t += noteBeats(n); return { i: i, n: n, s: s0, ok: beamableNote(n) && !crossOf[st + ":" + i] }; });
      var dirOf = function(n){ return n.stem || (rh ? "u" : ""); };
      var tpg = tupGroups(Sx.notes, m.idx);
      for (k = 0; k + 1 < info.length; k++) {
        var a = info[k], b = info[k + 1], join = false;
        if (a.ok && b.ok) {
          if (a.n.bm === "j") join = true;
          else if (a.n.bm === "s") join = false;
          else if (a.n.tp && b.n.tp) join = tpg[a.i] === tpg[b.i] && !(dirOf(a.n) && dirOf(b.n) && dirOf(a.n) !== dirOf(b.n));   // X60: beamed triplets join inside their group of three
          else join = Math.floor(a.s / gl + 1e-6) === Math.floor(b.s / gl + 1e-6) && !(dirOf(a.n) && dirOf(b.n) && dirOf(a.n) !== dirOf(b.n));
        }
        links.push(join);
      }
      for (k = 0; k < info.length; k++) {
        if (!info[k].ok) { if (cur.length > 1) runs.push(cur); cur = []; continue; }
        cur.push(info[k]);
        if (!(k < links.length && links[k])) { if (cur.length > 1) runs.push(cur); cur = []; }
      }
      if (cur.length > 1) runs.push(cur);
      runs.forEach(function(run){
        var sns = run.map(function(r){ return Sx.sn[r.i]; }), man = null;
        run.forEach(function(r){ if (!man && dirOf(r.n)) man = dirOf(r.n); });
        if (man) { sns.forEach(function(s){ s.setStemDirection(man === "d" ? VF.Stem.DOWN : VF.Stem.UP); }); out.push(new VF.Beam(sns, false)); }
        else out.push(new VF.Beam(sns, true));
      });
      return out;
    };

    var drawChains = function(stv, sysMeasures){
      chains.forEach(function(ch){
        var mset = {}; sysMeasures.forEach(function(mi){ mset[mi] = true; });
        var f0 = ch[0], mi0 = null; S[f0.st].info.measures.forEach(function(m, k){ if (m.idx.indexOf(f0.i) >= 0) mi0 = k; });
        if (mi0 == null || !mset[mi0]) return;
        var mem = ch.map(function(c){ var sn = S[c.st].sn[c.i], ext = sn.getStemExtents(); return { c: c, sn: sn, x: sn.getStemX(), y: ext.baseY, n: S[c.st].notes[c.i], sel: isSel(c.st, c.i) }; });
        var lowR = -1e9, upL = 1e9; mem.forEach(function(q){ if (q.c.st === "R") lowR = Math.max(lowR, q.y); else upL = Math.min(upL, q.y); });
        var mid = (stv.R.getYForLine(4) + stv.L.getYForLine(0)) / 2, lo = lowR + 24, hi = upL - 24, yb = lo <= hi ? Math.max(lo, Math.min(hi, mid)) : (lowR + upL) / 2;
        mem.forEach(function(q){ try { var el = q.sn.getSVGElement && q.sn.getSVGElement(); var s0 = el && el.querySelector(".vf-stem"); if (s0 && s0.parentNode) s0.parentNode.removeChild(s0); } catch (e) { /* skip */ } });
        var col = function(sel){ try { ctx.setFillStyle(sel ? "#2f6bb3" : "#000000"); } catch (e) { /* skip */ } };
        mem.forEach(function(q){ col(q.sel); ctx.fillRect(q.x - 0.75, Math.min(q.y, yb), 1.5, Math.abs(yb - q.y)); });
        var allSel = mem.every(function(q){ return q.sel; }); col(allSel);
        var xa = mem[0].x - 0.75, xb = mem[mem.length - 1].x + 0.75;
        ctx.fillRect(xa, yb - 2.5, xb - xa, 5);
        mem.forEach(function(q, k){
          if (q.n.d !== "16") return;
          var nx = mem[k + 1], pv = mem[k - 1];
          if (nx && nx.n.d === "16") ctx.fillRect(q.x - 0.75, yb + 5.5, nx.x - q.x + 1.5, 5);
          else if (!(pv && pv.n.d === "16")) { if (nx || !pv) ctx.fillRect(q.x - 0.75, yb + 5.5, 10, 5); else ctx.fillRect(q.x - 9.25, yb + 5.5, 10, 5); }
        });
        col(false);
      });
    };

    systems.forEach(function(sysMeasures, si){
      var sumW = 0; sysMeasures.forEach(function(mi){ sumW += mw[mi]; });
      var avail = W - 4, isLast = si === systems.length - 1;
      // lines of more than 2 measures fill the whole width; 1-2 measure lines keep their natural width
      var staveW = avail;   // every line fills the width (v4.38: also the last line of free time)
      var firstM = sysMeasures[0], lastM = sysMeasures[sysMeasures.length - 1];
      var stv = {};
      stl.forEach(function(st, k){
        var stave = new VF.Stave(grand ? 16 : 2, k === 0 ? lay[si].y1 : lay[si].y2, grand ? staveW - 14 : staveW);
        if (rh) { stave.setConfigForLines([{ visible: false }, { visible: false }, { visible: true }, { visible: false }, { visible: false }]); stave.addClef("percussion"); try { stave.setMeasure(sysMeasures[0] + 1); } catch (e) { /* number is cosmetic */ } }
        else if (st === first && (ex.clefOct === "8va" || ex.clefOct === "8vb")) stave.addClef(S[st].clef, undefined, ex.clefOct); else stave.addClef(S[st].clef);
        if (!rh) stave.addKeySignature(keySig);
        if (si === 0 && showTime) stave.addTimeSignature(time);
        if (lastM != null && mre[lastM]) stave.setEndBarType(VF.Barline.type.REPEAT_END);
        else if (isLast) stave.setEndBarType(VF.Barline.type.END);
        else if (free) stave.setEndBarType(VF.Barline.type.NONE);   // free time: lines wrap without bar lines
        stv[st] = stave;
      });
      // a tie coming in from the previous line (or from the end of a repeat) needs room between the clef/key/time signature and the first note
      var inTie = 0;
      stl.forEach(function(st){ var m0 = meas(st, firstM); if (!m0) return; var f0 = m0.idx[0], nt0 = S[st].notes; if (nt0[f0] && !nt0[f0].rest && ((f0 > 0 && nt0[f0 - 1].tie && !nt0[f0 - 1].rest && !repTie[st][f0 - 1]) || repTarget[st][f0])) inTie = 22; });
      if (grand) { var nsx = Math.max(stv.R.getNoteStartX(), stv.L.getNoteStartX()) + inTie; stv.R.setNoteStartX(nsx); stv.L.setNoteStartX(nsx); }
      else if (inTie) stv[first].setNoteStartX(stv[first].getNoteStartX() + inTie);
      stl.forEach(function(st){ stv[st].setContext(ctx).draw(); });
      if (grand) {
        conn(stv.R, stv.L, "BRACE", "brace"); conn(stv.R, stv.L, "SINGLE_LEFT", "singleLeft");
        var endRep = lastM != null && mre[lastM];
        if (!endRep && (isLast || !free)) conn(stv.R, stv.L, isLast ? "BOLD_DOUBLE_RIGHT" : "SINGLE_RIGHT", isLast ? "boldDoubleRight" : "singleRight");
        // repeat signs: the thick/thin lines continue through the gap between the staves (the dots stay on the staves)
        var gy0 = stv.R.getYForLine(4), gy1 = stv.L.getYForLine(0);
        if (endRep) gapBar("end", stv.R.getX() + stv.R.getWidth(), gy0, gy1);
      }
      if (!sysMeasures.length) return;

      var V = {}, beamsBy = {}, tupsBy = {}, inSys = {}, bars = [], centerRests = {}, startBar = null;
      stl.forEach(function(st){ centerRests[st] = []; });
      stl.forEach(function(st){
        var Sx = S[st], tick = [], beams = [];
        inSys[st] = {};
        // a repeat sign at the start of a line sits after the clef / key / time signature (no extra bar at the far left)
        if (firstM != null && mrs[firstM]) { var sbn = new VF.BarNote(VF.Barline.type.REPEAT_BEGIN); tick.push(sbn); if (st === first) startBar = sbn; }
        sysMeasures.forEach(function(mi, k){
          var m = meas(st, mi), mn = [], used = 0;
          if (m) {
            m.idx.forEach(function(i){ tick.push(Sx.sn[i]); mn.push(Sx.sn[i]); inSys[st][i] = true; used += noteBeats(Sx.notes[i]); });
            if (m.idx.length === 1 && Sx.notes[m.idx[0]].rest && Math.abs(noteBeats(Sx.notes[m.idx[0]]) - capOf(mi)) < 1e-6 && Math.abs(mlen[mi] - capOf(mi)) < 1e-6) centerRests[st].push({ note: Sx.sn[m.idx[0]], mi: mi });
            try { beams = beams.concat(makeBeams(st, mi, m)); } catch (e) { console.error("beams", e.message); }
          }
          if (!m) {        // this staff has no notes in this measure: a visible rest of the full measure
            var rd = beatDurs(capOf(mi));
            rd.forEach(function(r){ var rn = new VF.StaveNote({ keys: [rh ? "b/4" : restKey(Sx.clef)], duration: r.d + (r.dot ? "d" : "") + "r", clef: Sx.clef === "percussion" ? "treble" : Sx.clef }); if (r.dot) VF.Dot.buildAndAttach([rn], { all: true }); tick.push(rn); if (rd.length === 1 && Math.abs(mlen[mi] - capOf(mi)) < 1e-6) centerRests[st].push({ note: rn, mi: mi }); });
            if (mlen[mi] > capOf(mi) + 1e-6) beatDurs(mlen[mi] - capOf(mi)).forEach(function(r){ try { tick.push(new VF.GhostNote({ duration: r.d + (r.dot ? "d" : "") })); } catch (e) { /* skip */ } });
          } else if (used < mlen[mi] - 1e-6) {     // short measure: invisible filler keeps the staves lined up
            beatDurs(mlen[mi] - used).forEach(function(r){ try { tick.push(new VF.GhostNote({ duration: r.d + (r.dot ? "d" : "") })); } catch (e) { /* skip */ } });
          }
          if (k < sysMeasures.length - 1) {
            var nx = sysMeasures[k + 1], bt = mre[mi] && mrs[nx] ? VF.Barline.type.REPEAT_BOTH : mre[mi] ? VF.Barline.type.REPEAT_END : mrs[nx] ? VF.Barline.type.REPEAT_BEGIN : (free ? VF.Barline.type.NONE : VF.Barline.type.SINGLE);
            var bn = new VF.BarNote(bt); tick.push(bn); if (st === first) bars.push({ bn: bn, kind: mre[mi] && mrs[nx] ? "both" : mre[mi] ? "end" : mrs[nx] ? "begin" : "single" });
          }
        });
        // helpers (finger numbers, note names): placed after beams so the final stem direction is known
        sysMeasures.forEach(function(mi){
          var m = meas(st, mi); if (!m) return;
          m.idx.forEach(function(i){
            var n = Sx.notes[i]; if (n.rest) return;
            if (Sx.fing && Sx.fing[i]) {
              var f = new VF.FretHandFinger(String(Sx.fing[i]));
              f.setPosition(Sx.sn[i].getStemDirection() === VF.Stem.UP ? VF.Modifier.Position.BELOW : VF.Modifier.Position.ABOVE);
              f.setFont("Arial, sans-serif", 11, "bold");
              Sx.sn[i].addModifier(f, 0);
            }
            if (staffNames) {
              try {
                var a = new VF.Annotation(noteName(n));
                a.setFont("Arial, sans-serif", 11, "bold");
                a.setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM);
                Sx.sn[i].addModifier(a, 0);
              } catch (e) { /* name labels are best-effort */ }
            }
          });
        });
        var tups = [];   // X60: one bracket / "3" per group of three triplet notes (made before the voice is formatted so the notes take 2/3 of their time)
        sysMeasures.forEach(function(mi){
          var m = meas(st, mi); if (!m) return;
          var tg = tupGroups(Sx.notes, m.idx), by = {};
          m.idx.forEach(function(i){ if (Sx.notes[i].tp) (by[tg[i]] = by[tg[i]] || []).push(Sx.sn[i]); });
          Object.keys(by).forEach(function(g){ try { tups.push(new VF.Tuplet(by[g], { numNotes: 3, notesOccupied: 2 })); } catch (e) { console.error("tuplet", e.message); } });
        });
        tupsBy[st] = tups;
        var voice = new VF.Voice({ numBeats: Math.max(1, Math.ceil(sysMeasures.reduce(function(t, mi){ return t + mlen[mi]; }, 0))), beatValue: 4 }).setMode(VF.Voice.Mode.SOFT);
        voice.addTickables(tick);
        try { if (!rh) addAccidentals(Sx, sysMeasures.map(function(mi){ return meas(st, mi); }), keySig); } catch (e) { console.error("accidentals", e.message); }
        V[st] = voice; beamsBy[st] = beams;
      });
      var fm = new VF.Formatter();
      stl.forEach(function(st){ fm.joinVoices([V[st]]); });
      var fw = stv[first].getNoteEndX() - stv[first].getNoteStartX() - 14 - (lastM != null && mre[lastM] ? 18 : 0);   // an end-repeat sign at the line end takes room too
      fm.format(stl.map(function(st){ return V[st]; }), fw);
      // a rest and a note that sound at the same moment line up by their centres (a rest glyph is narrower than a note head)
      try {
        var isCR = function(nn){ var f0 = false; stl.forEach(function(st){ centerRests[st].forEach(function(c){ if (c.note === nn) f0 = true; }); }); return f0; };
        var ctxs = [];
        stl.forEach(function(st){ V[st].getTickables().forEach(function(t){
          if (!t.getCategory || t.getCategory() !== "StaveNote" || !t.getTickContext) return;
          var c = t.getTickContext(), e = null; ctxs.forEach(function(x){ if (x.c === c) e = x; });
          if (!e) { e = { c: c, items: [] }; ctxs.push(e); }
          e.items.push(t);
        }); });
        ctxs.forEach(function(e){
          var heads = e.items.filter(function(t){ return !t.isRest(); }), rests = e.items.filter(function(t){ return t.isRest() && !isCR(t); });
          if (!heads.length || !rests.length) return;
          var ref = (heads[0].getNoteHeadBeginX() + heads[0].getNoteHeadEndX()) / 2;
          rests.forEach(function(r){ r.setXShift((r.getXShift ? r.getXShift() : 0) + (ref - r.getCenterGlyphX())); });
        });
      } catch (e) { console.error("rest alignment", e.message); }
      // a rest that fills a whole measure sits in the middle of that measure
      try {
        var bx = [stv[first].getNoteStartX()]; bars.forEach(function(b0){ b0.bn.setStave(stv[first]); bx.push(b0.bn.getAbsoluteX()); }); bx.push(stv[first].getNoteEndX());
        stl.forEach(function(st){ centerRests[st].forEach(function(cr){
          var k = sysMeasures.indexOf(cr.mi); if (k < 0) return;
          cr.note.setStave(stv[st]);
          var mid = (bx[k] + bx[k + 1]) / 2, here = cr.note.getAbsoluteX() + 5;
          cr.note.setXShift((cr.note.getXShift ? cr.note.getXShift() : 0) + (mid - here));
        }); });
      } catch (e) { console.error("rest centering", e.message); }
      stl.forEach(function(st){
        V[st].draw(ctx, stv[st]);
        beamsBy[st].forEach(function(b){ b.setContext(ctx).draw(); });
        (tupsBy[st] || []).forEach(function(tp){ try { tp.setContext(ctx).draw(); } catch (e) { console.error("tuplet draw", e.message); } });
        var Sx = S[st];
        // ties inside this system, half-ties at line breaks / repeat signs
        var fI = meas(st, firstM) ? meas(st, firstM).idx[0] : -1;
        if (fI > 0 && Sx.notes[fI - 1].tie && !repTie[st][fI - 1] && !Sx.notes[fI - 1].rest && !Sx.notes[fI].rest) halfTie(Sx.sn[fI], false, stv[st], (function(){ try { if (!startBar) return null; startBar.setStave(stv[first]); return startBar.getAbsoluteX() + 12; } catch (e) { return null; } })());
        sysMeasures.forEach(function(mi){
          var m = meas(st, mi); if (!m) return;
          m.idx.forEach(function(i){
            // a note that already has a visible incoming tie from the note before it does not also get the repeat's incoming tie
            var seenIn = i > 0 && Sx.notes[i - 1].tie && !Sx.notes[i - 1].rest && !repTie[st][i - 1] && !Sx.notes[i].rest;
            if (repTarget[st][i] && !seenIn) halfTie(Sx.sn[i], false, stv[st], null);
            if (repTie[st][i]) { halfTie(Sx.sn[i], true, stv[st]); return; }
            if (!Sx.notes[i].tie || Sx.notes[i].rest || i + 1 >= Sx.notes.length || Sx.notes[i + 1].rest) return;
            if (!inSys[st][i + 1]) { halfTie(Sx.sn[i], true, stv[st]); return; }
            try { new VF.StaveTie({ firstNote: Sx.sn[i], lastNote: Sx.sn[i + 1], firstIndexes: [0], lastIndexes: [0] }).setContext(ctx).draw(); } catch (e) { /* skip */ }
          });
        });
      });
      // cross-staff beams: stems and beam drawn by hand between the staves
      try { drawChains(stv, sysMeasures); } catch (e) { console.error("cross beams", e.message); }
      if (grand && startBar) { try { startBar.setStave(stv[first]); gapBar("begin", startBar.getAbsoluteX(), stv.R.getYForLine(4), stv.L.getYForLine(0)); } catch (e) { /* skip */ } }
      // bar lines run through both staves of a grand staff
      if (grand) bars.forEach(function(b0){
        try {
          var bx = b0.bn.getAbsoluteX(), y0 = stv.R.getYForLine(4), y1 = stv.L.getYForLine(0);
          if (b0.kind === "single") ctx.fillRect(bx, y0, 1, y1 - y0); else gapBar(b0.kind, bx, y0, y1);
        } catch (e) { /* skip */ }
      });
      // editing aids (never printed): line-break / keep-together flags, and clickable measure areas
      if (o.edit) {
        var xs = [stv[first].getX()];
        bars.forEach(function(b0){ try { xs.push(b0.bn.getAbsoluteX()); } catch (e) { xs.push(xs[xs.length - 1]); } });
        xs.push(stv[first].getX() + stv[first].getWidth());
        var sysTop = lay[si].top, sysBot = lay[si].top + lay[si].h, midY = grand ? (stv.R.getYForLine(4) + stv.L.getYForLine(0)) / 2 : sysBot;
        stl.forEach(function(st){
          var yA = st === first ? sysTop : midY, yB = grand && st === first ? midY : sysBot;
          sysMeasures.forEach(function(mi, k){
            var m = meas(st, mi);
            if (!m) {      // nothing on this staff in this measure: clicking it still chooses the staff (typing then starts here)
              var prevIdx = -1, jj; for (jj = mi - 1; jj >= 0; jj--) { var pm = meas(st, jj); if (pm) { prevIdx = pm.idx[pm.idx.length - 1]; break; } }
              extraSvg += '<rect class="wb-mrect" data-s="' + st + '" data-a="-1" data-b="-1" data-prev="' + prevIdx + '" x="' + xs[k] + '" y="' + yA + '" width="' + Math.max(1, xs[k + 1] - xs[k]) + '" height="' + Math.max(1, yB - yA) + '" fill="none" stroke="none" pointer-events="none"/>';
              return;
            }
            var fullySel = !o.selSet && o.selLo != null && (o.selStaff || "R") === st && m.idx[0] >= o.selLo && m.idx[m.idx.length - 1] <= o.selHi && (o.selHi > o.selLo);
            extraSvg += '<rect class="wb-mrect' + (fullySel ? " wb-msel" : "") + '" data-s="' + st + '" data-a="' + m.idx[0] + '" data-b="' + m.idx[m.idx.length - 1] + '" x="' + xs[k] + '" y="' + yA + '" width="' + Math.max(1, xs[k + 1] - xs[k]) + '" height="' + Math.max(1, yB - yA) + '" fill="none" stroke="none" pointer-events="none"/>';
          });
        });
        if (grand) stl.forEach(function(st){ if (st === (o.selStaff || "R")) extraSvg += '<rect x="5" y="' + (stv[st].getYForLine(0) - 2) + '" width="4" height="' + (stv[st].getYForLine(4) - stv[st].getYForLine(0) + 4) + '" fill="#2f6bb3" stroke="none" opacity="0.75"/>'; });
        if (o.markers) sysMeasures.forEach(function(mi, k){
          var fy = stv[first].getYForLine(0) - 16, fx = k === 0 ? 4 : xs[k] + 2;
          if (k === 0 && mi > 0 && mbr[mi]) extraSvg += '<text x="' + fx + '" y="' + (fy) + '" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#2f6bb3" stroke="none">\u23CE line break</text>';
          if (k > 0 && mnb[mi]) extraSvg += '<text x="' + fx + '" y="' + fy + '" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#2f6bb3" stroke="none">\u21C4 kept together</text>';
        });
      }
      // hand positions (only when a hand changes position): a keyboard above (right hand / single staff) or below (left hand) the line, with a dotted line to the note where it starts
      stl.forEach(function(st){
        var Sx = S[st], rowEnd = 0, ancs = anc[st];
        sysMeasures.forEach(function(mi){
          var m = meas(st, mi); if (!m) return;
          m.idx.forEach(function(i){
            if (ancs[i] == null) return;
            var seg = ancs[i], md0 = handPosModel(ex, st, seg), d, dw, dh, label = null;
            if (md0.mode === "graphic") { d = handInner(ex, st, seg, { edit: !!o.edit, sel: o.hpSel }); dw = d.w * MINI; dh = d.h * MINI; }
            else if (md0.mode === "text") { label = "New hand position"; dw = 100; dh = 14; }
            else if (o.edit && o.markers) { label = "(position hidden)"; dw = 92; dh = 14; }
            else return;
            var nx = 0;
            try { nx = (Sx.sn[i].getNoteHeadBeginX() + Sx.sn[i].getNoteHeadEndX()) / 2; } catch (e) { try { nx = Sx.sn[i].getAbsoluteX(); } catch (e2) { nx = 60; } }
            var gx = Math.max(2, Math.min(W - dw - 2, nx - 4)); if (gx < rowEnd) gx = Math.min(rowEnd, W - dw - 2); rowEnd = gx + dw + 6;
            var above = st === first, gy, ly0, ly1;
            if (above) { gy = lay[si].top + 4; ly0 = gy + dh; ly1 = stv[st].getYForLine(0) - 6; }
            else { gy = lay[si].top + lay[si].h - dh - 4; ly0 = stv[st].getYForLine(4) + 6; ly1 = gy; }
            var dash = md0.mode === "none" ? "#9aa" : "#000";
            extraSvg += '<line x1="' + nx + '" y1="' + ly0 + '" x2="' + nx + '" y2="' + ly1 + '" stroke="' + dash + '" stroke-width="0.9" stroke-dasharray="3 2"/>';
            if (label) extraSvg += '<g pointer-events="auto"' + (o.edit ? ' data-action="hp-key" data-st="' + st + '" data-seg="' + seg + '" data-m="-1" style="cursor:pointer"' : "") + '><rect x="' + gx + '" y="' + gy + '" width="' + dw + '" height="' + dh + '" fill="' + (o.edit ? "#fff" : "none") + '" stroke="' + (o.edit && o.hpSel && o.hpSel.st === st && o.hpSel.s === seg ? "#2f6bb3" : "none") + '" stroke-width="2"/><text x="' + (gx + 2) + '" y="' + (gy + 11) + '" font-family="Arial, sans-serif" font-size="11" font-weight="' + (md0.mode === "none" ? "normal" : "bold") + '" font-style="' + (md0.mode === "none" ? "italic" : "normal") + '" fill="' + dash + '" stroke="none">' + label + '</text></g>';
            else extraSvg += '<g pointer-events="auto" transform="translate(' + gx + ',' + gy + ') scale(' + MINI + ')">' + d.svg + '</g>';
          });
        });
      });
    });

    var svg = host.querySelector("svg");
    if (svg) {
      svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.removeAttribute("style"); if (o.edit) svg.style.pointerEvents = "auto"; svg.setAttribute("width", W); svg.setAttribute("height", H); svg.style.overflow = "visible";
      // tag every note with its staff + index so clicks can find it
      stl.forEach(function(st){ S[st].sn.forEach(function(n, i){ try { var el = n.getSVGElement(); if (el) { el.setAttribute("data-i", i); el.setAttribute("data-s", st); } } catch (e) { /* skip */ } }); });
      if (extraSvg) svg.insertAdjacentHTML("beforeend", extraSvg);
    }
    return { cap: cap, measures: S[first].info.measures, systems: systems.length, height: H, M: M };
  }

  // notation size: the item's own percentage (ex.size "85"; old "s" = 85, "l" = 120) times the workbook-wide percentage (settings.sizeAll)
  function selIn(o, st, i){ o = o || {}; if (o.selSet) return (o.selStaff || "R") === st && !!o.selSet[i]; return o.selLo != null && (o.selStaff || "R") === st && i >= o.selLo && i <= o.selHi; }
  // =====================================================================
  //  Icon notation (v4.37, round X15, item 9): every note is a plain outlined block. Its WIDTH is its length (a half note is twice a quarter),
  //  its HEIGHT POSITION is its pitch (one row per step of the scale), so a scale climbs like stairs. Black outline, white fill, light grey grid: prints on any
  //  printer. Names (or finger numbers) sit inside the block or under it, or are left off (ex.iconLabel: "in" | "under" | "fing" | "none").
  // =====================================================================
  // X23 (item 9.6): FORCED line groups. ex.lineGroups = [2,2,3] puts exactly that many measures on each line (the last number repeats), however tight; a plain "measures per line" (ex.perLine) is the same idea with one number
  function lineSizes(ex){ var g = (ex.lineGroups || []).map(Number).filter(function(x){ return x >= 1; }); return g.length ? g : (+ex.perLine > 0 ? [+ex.perLine] : null); }
  function lineStarts(ex, M){
    var sizes = lineSizes(ex); if (!sizes) return null;
    var st = [], gi = 0, left = 0;
    for (var m = 0; m < M; m++) { if (left <= 0) { st[m] = true; left = sizes[Math.min(gi, sizes.length - 1)]; gi++; } else st[m] = false; left--; }
    return st;
  }  function crossModel(ex){
    var model = { tm: {}, mOf: {}, nt: { R: ex.notes || [], L: ex.notesL || [] } };
    ["R", "L"].forEach(function(st){
      var nt = model.nt[st], t = 0, arr = [], mm = {};
      nt.forEach(function(n){ var b = noteBeats(n); arr.push({ s: t, e: t + b }); t += b; });
      splitMeasures(nt, timeOf(ex), ex.pickup).measures.forEach(function(m, k){ m.idx.forEach(function(i){ mm[i] = k; }); });
      model.tm[st] = arr; model.mOf[st] = mm;
    });
    return model;
  }
  // the note a beam from (st, i) would run to: the note on the other staff that starts when this one ends (else, optionally, the next note of the same staff)
  function crossTargetOf(model, st, i, allowSame){
    var oth = st === "R" ? "L" : "R", A = model.nt[oth], j;
    if (!beamableData(model.nt[st][i])) return null;
    for (j = 0; j < A.length; j++) if (Math.abs(model.tm[oth][j].s - model.tm[st][i].e) < 1e-6 && beamableData(A[j]) && model.mOf[oth][j] === model.mOf[st][i]) return { st: oth, i: j };
    if (allowSame && beamableData(model.nt[st][i + 1]) && model.mOf[st][i + 1] === model.mOf[st][i]) return { st: st, i: i + 1 };
    return null;
  }
  // the note on the other staff that ends when this one starts (a beam from it would run to this note)
  function beamableData(n){ return !!n && (!n.rest || n.snap) && (n.d === "8" || n.d === "16"); }

  // ===== X117: the note-name / finger-number / picture layouts (cellsHtml, iconsHtml) =====
  function selIn(){ return false; }
  function pickupOverflow(){ return null; }
  var SPACE_KEYS = { padTop: { n: 1, max: 80, label: "Space above the notation", tip: "Between the title line and the first line of notation", out: "padTopOut", col: "#2e7bd6" },
    sysGapN: { n: 2, max: 120, label: "Space between lines", tip: "The empty space between one line of the worksheet and the next", out: "sysGapOut", col: "#6b4bb3" },
    padBot: { n: 3, max: 80, label: "Space below the notation", tip: "Between the last line of notation and the bottom of the box", out: "padBotOut", col: "#c0407a" } };
  function accHtml(t){ return String(t).replace(/([\u266f\u266d])/g, '<span class="wb-acc">$1</span>'); }
  function cellRowsOf(ex){
    var h = ex.helpers || {};
    if (Array.isArray(ex.cellRows) && ex.cellRows[0]) return [ex.cellRows[0], ex.cellRows[1] && ex.cellRows[1] !== ex.cellRows[0] ? ex.cellRows[1] : ""];
    if (ex.display === "fingers") return ["fingers", h.names ? "names" : ""];
    return ["names", h.fingers ? "fingers" : ""];
  }
  function cellsHtml(ex, o){
    o = o || {};
    var ovfC = o.edit ? pickupOverflow(ex) : null;
    var sts = staffList(ex).filter(function(st){ return hasNotes(ex, st); }), h = ex.helpers || {}, rows = cellRowsOf(ex), out = '<div class="wb-cells' + (isFreeV(ex, "cells") ? ' wb-free' : '') + '">';
    if (!sts.length) return out + '<div class="wb-empty">Empty</div></div>';
    sts.forEach(function(st){
      var notes = notesOf(ex, st), info = splitMeasures(notes, timeOf(ex), ex.pickup), f = fingersFor(ex, st), CW = 50, AVAIL = Math.round(700 / (scaleOf(ex) || 1)), lines = [], cur = [], curW = 0;   // X24 (item 2.1): the page is 700 / zoom 'pixels' wide inside the zoomed box, so a smaller notation size no longer wraps early or sits on the left
      var cellSpan = function(i){
        var n = notes[i], sel = selIn(o, st, i), big, small = "";
        if (n.rest && !n.snap && ex.restStyle === "none") return "";   // X23 (item 9.11): "no rests": rests are left out of a note-name worksheet
        var val = function(kind){ return kind === "fingers" ? (f[i] || "\u00b7") : kind === "names" ? noteName(n) : ""; };
        if (n.snap) big = "\u0001SNAP\u0001";
        else if (n.rest) big = "\u0001REST\u0001";
        else { big = val(rows[0]); small = rows[1] ? val(rows[1]) : ""; }
        var flags = "", isNm = (ex.display === "names" || ex.display === "fingers");
        if (o.edit && o.act && isNm && i > 0) {   // X24: flags only on the SELECTED worksheet; X23 (item 9.10.2): hover a letter to flag where a GROUP (blue g) or a LINE (purple l) starts; a new line is a new group by definition
          if (!n.br) flags += '<span class="wb-fl g' + (n.gs ? " on" : "") + '" data-flag="g" data-i="' + i + '" data-s="' + st + '" title="A new group starts here (light blue)">g</span>';
          flags += '<span class="wb-fl l' + (n.br ? " on solo" : "") + '" data-flag="l" data-i="' + i + '" data-s="' + st + '" title="A new line starts here (light purple)">l</span>';
        }
        return '<span class="wb-cell' + (ovfC && ovfC[st] && ovfC[st][i] ? " wb-cover" : "") + (sel ? " wb-csel" : "") + (o.chg && o.chg[st] && o.chg[st][i] ? " wb-cchg" : "") + (hasAccN(n) || n.snap ? " wb-ac" : "") + (o.edit && o.act && isNm && i > 0 && n.br ? " wb-ls" : (o.edit && o.act && isNm && n.gs ? " wb-gs" : "")) + '"' + (isFreeV(ex, "cells") ? ' style="flex:' + Math.max(0.25, noteBeats(n)) + ' 1 46px;width:auto;"' : '') + ' data-i="' + i + '" data-s="' + st + '">' + flags + '<b>' + (big === "\u0001REST\u0001" ? restCellHtml(n, ex) : big === "\u0001SNAP\u0001" ? '<span style="font-size:.6em;font-weight:800;letter-spacing:.02em;">(snap)</span>' : accHtml(esc(big))) + '</b><i>' + esc(small) + '</i></span>';
      };
      if (isFreeV(ex, "cells")) {   // X17 (item 12): free time has no measures, so no note takes extra room because it ended up alone in a "4/4 measure": every note is the same width, lines of up to 14 notes (or your own line breaks)
        var fg = [], fcur = null;
        notes.forEach(function(n, i){ if (n.rest && !n.snap && ex.restStyle === "none") return; if (!fcur || fcur.idx.length >= Math.max(4, Math.floor(AVAIL / 50)) || (n.br && i > 0)) { fcur = { idx: [] }; fg.push(fcur); } fcur.idx.push(i); });
        info = { measures: fg };
      }
      var cst = isFreeV(ex, "cells") ? null : lineStarts(ex, info.measures.length);
      info.measures.forEach(function(m, mi){
        var w = m.idx.reduce(function(a3, i3){ return a3 + (hasAccN(notes[i3]) || notes[i3].snap ? CW + 12 : CW); }, 0) + 12, forced = mi > 0 && (!!notes[m.idx[0]].br || !!notes[m.idx[0]].hp);
        if (cur.length && (forced || (cst ? cst[mi] : curW + w > AVAIL))) { lines.push(cur); cur = []; curW = 0; }
        cur.push(mi); curW += w;
      });
      if (cur.length) lines.push(cur);
      if (isFreeV(ex, "cells")) lines = info.measures.map(function(g, k){ return [k]; });
      if (sts.length > 1) out += '<div class="wb-hl">' + (st === "L" ? "Left hand" : "Right hand") + '</div>';
      var ngs = nameGroupSizes(ex), gsOn = (ex.display === "names" || ex.display === "fingers") && ex.ngMode !== "even" && notes.some(function(n){ return n.gs; });
      if (ngs || gsOn) {   // X21 (item 2) / X22 (item 11.4): the letters are grouped the way this song reads (sizes like "3 3 2", or a "group starts here" mark on any note), with a gap between groups and no barlines. The notation itself is not touched.
        var gl = [], gcur = [], gw = 0, gi2 = 0, gk = 0, groups = [];
        var hideR = function(i){ return notes[i].rest && !notes[i].snap && ex.restStyle === "none"; };
        if (gsOn) { var cg = null; notes.forEach(function(n, i){ if (hideR(i)) return; if (!cg || n.gs || (n.br && i > 0)) { cg = []; groups.push(cg); } cg.push(i); }); }
        else while (gi2 < notes.length) {
          var sz = ngs[Math.min(gk, ngs.length - 1)], idx0 = [];
          for (var q = 0; q < sz && gi2 < notes.length; ) { if (hideR(gi2)) { gi2++; continue; } if (q > 0 && notes[gi2].br) break; idx0.push(gi2); gi2++; q++; }
          gk++; if (idx0.length) groups.push(idx0);
        }
        var NW = 40, NWA = 56, MING = 30, MAXG = 96, wOf = function(i){ return hasAccN(notes[i]) || notes[i].snap ? NWA : NW; }, W = Math.floor(680 / (scaleOf(ex) || 1));   // X25 (item 9.2): fixed 40-unit letters (a little air), at least 30 between groups, the whole line centred
        groups.forEach(function(idx){
          var ww = idx.reduce(function(a4, i4){ return a4 + wOf(i4); }, 0);
          if (gcur.length && (notes[idx[0]].br || gw + ww + gcur.length * MING > W || (+ex.ngPerLine > 0 && gcur.length >= +ex.ngPerLine))) { gl.push(gcur); gcur = []; gw = 0; }
          gcur.push(idx); gw += ww;
        });
        if (gcur.length) gl.push(gcur);
        var gapPrev = 0;
        gl.forEach(function(ln, gli){   // the groups spread with equal space between them (up to MAXG), the line sits in the middle; a short last line keeps the gap of the line above
          var tot = 0; ln.forEach(function(idx){ tot += idx.reduce(function(a5, i5){ return a5 + wOf(i5); }, 0); });
          var gap = ln.length > 1 ? Math.min(MAXG, Math.max(MING, (W - tot) / (ln.length + 1))) : 0;
          if (gli === gl.length - 1 && gli > 0 && ln.length < gl[gli - 1].length) gap = gapPrev || gap;
          gapPrev = gap;
          out += '<div class="wb-cline wb-ngl" style="gap:' + Math.round(gap) + 'px;">';
          ln.forEach(function(idx){
            out += '<span class="wb-ng">';
            idx.forEach(function(i){ out += cellSpan(i); });
            out += '</span>';
          });
          out += '</div>';
        });
        return;
      }
      lines.forEach(function(ln, li){
        var firstIdx = info.measures[ln[0]].idx[0];
        var dch = hpChanges(ex, st); if (dch && (firstIdx > 0 ? notes[firstIdx].hp : true)) { var d = handInner(ex, st, firstIdx, { edit: !!o.edit, sel: o.hpSel }); if (!d.hidden) out += '<div class="wb-hpm"><svg xmlns="http://www.w3.org/2000/svg" width="' + Math.round(d.w * MINI) + '" height="' + Math.round(d.h * MINI) + '" viewBox="0 0 ' + d.w + ' ' + d.h + '">' + d.svg + '</svg></div>'; }
        var full = ln.length > 2 || (cst && ln.reduce(function(a2, mi9){ return a2 + info.measures[mi9].idx.length * CW + 12 + info.measures[mi9].idx.filter(function(i9){ return hasAccN(notes[i9]); }).length * 12; }, 0) > AVAIL);
        out += '<div class="wb-cline' + (full ? " wb-full" : "") + '">';
        ln.forEach(function(mi, k){
          var last = li === lines.length - 1 && k === ln.length - 1;
          out += '<span class="wb-mg' + (last ? " wb-end" : "") + '"' + (isFreeV(ex, "cells") ? ' style="flex:0 1 auto;width:min(100%,' + (info.measures[mi].idx.length * 120) + 'px);margin:0 auto;"' : '') + '>';   // X19 (item 14): free time fills the width (up to ~120px a note, centred), each note's share proportional to its duration
          info.measures[mi].idx.forEach(function(i){ out += cellSpan(i); });
          out += '</span>';
        });
        out += '</div>';
      });
    });
    return out + '</div>';
  }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function hasAccN(n){ return !!n && !n.rest && !!parseKey(n.k).acc; }
  function hasNotes(ex, st){ return notesOf(ex, st).length > 0; }
  function iconsHtml(ex, o){
    o = o || {};
    var sts = staffList(ex).filter(function(st){ return hasNotes(ex, st); }), mode = ex.iconLabel || "in", out = '<div class="wb-icons">';
    var U0 = 52, RH = 26, LW = 720, free = isFreeV(ex, "icons"), showFing = !!(ex.helpers && ex.helpers.fingers), PAD = 5;
    if (mode === "fing") mode = "in";
    sts.forEach(function(st){
      var notes = notesOf(ex, st), f = fingersFor(ex, st), info = splitMeasures(notes, timeOf(ex), ex.pickup), lines = [], cur = null, curW = 0;
      var nw0 = function(n){ return Math.max(14, noteBeats(n) * U0); };
      if (free) {
        notes.forEach(function(n, i){ var w = nw0(n); if (!cur || (curW + w > LW - 12) || (n.br && i > 0)) { cur = { idx: [], bars: [], w: 0 }; lines.push(cur); curW = 0; } cur.idx.push(i); curW += w; cur.w = curW; });
      } else {
        var starts = lineStarts(ex, info.measures.length);
        info.measures.forEach(function(m, mi){
          var w = 0; m.idx.forEach(function(i){ w += nw0(notes[i]); });
          var forced = mi > 0 && !!notes[m.idx[0]].br;
          if (!cur || forced || (starts ? starts[mi] : curW + w > LW - 12)) { cur = { idx: [], bars: [], w: 0 }; lines.push(cur); curW = 0; }
          cur.idx = cur.idx.concat(m.idx); curW += w; cur.w = curW; cur.bars.push(curW);
        });
      }
      // one scale for the whole exercise: the fullest line fills the width, the notes keep their proportions on every line (never narrower than 1x)
      var fill = 1e9; lines.forEach(function(l, li){ fill = Math.min(fill, (LW - 12) / Math.max(1, l.w)); });   // X23 (item 9.5): EVERY line limits the scale (the last line used to be left out, so a full last line ran off the page); forced groups may shrink it below 1
      var K = Math.max(0.5, Math.min(1.7, fill === 1e9 ? 1 : fill)), U = U0 * K;
      var nw = function(n){ return Math.max(14 * Math.min(1, K), noteBeats(n) * U); };
      if (sts.length > 1) out += '<div class="wb-hl">' + (st === "L" ? "Left hand" : "Right hand") + '</div>';
      lines.forEach(function(ln, li){
        var steps = ln.idx.filter(function(i){ return !notes[i].rest; }).map(function(i){ return stepOf(notes[i].k); });
        var lo = steps.length ? Math.min.apply(null, steps) : 0, hi = steps.length ? Math.max.apply(null, steps) : 3;
        if (hi - lo < 3) hi = lo + 3;
        var rows = hi - lo + 1, gridH = rows * RH, tail = (mode === "under" ? 16 : 0) + (mode === "rows" ? 30 : 0) + (showFing ? 18 : 0), H = gridH + tail + 6, x = 4, svg = '';
        // X18/X19 (item 11): the anchor pitch (default C) is the darker gray; going up from it the rows run white, light gray, white, light gray, white, light gray, so a 7-note scale has light gray on E, G, B and two grays can meet at ti -> do
        var zi = LET.indexOf(String(ex.zebra || "c").toLowerCase()), zA = zi >= 0 ? zi : 0, zD = String(ex.zebraEmph || "") !== "0";
        for (var r = 0; r < rows; r++) {
          var dA = (((hi - r) - zA) % 7 + 7) % 7, fillC = dA === 0 ? (zD ? "#d4d4d4" : "#efefef") : (dA % 2 === 0 ? "#efefef" : "#ffffff");
          svg += '<rect x="4" y="' + (2 + r * RH) + '" width="' + (LW - 8) + '" height="' + RH + '" fill="' + fillC + '"/>';
        }   // X17 (item 9): rows alternate gray / white (by pitch) instead of lines between the notes
        var rowY = gridH + 26, fingY = gridH + (mode === "rows" ? 30 : mode === "under" ? 16 : 0) + 15;   // X17 (item 10): more room between the icons and the one row of names
        ln.idx.forEach(function(i){
          var n = notes[i], w = nw(n), bx = x + PAD, bw = Math.max(10, w - 2 * PAD), sel = selIn(o, st, i), by, g;
          if (n.rest) {
            by = 2 + Math.floor((rows - 1) / 2) * RH + 4;
            g = '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + (RH - 8) + '" rx="3" fill="' + (sel ? "#cfe0f5" : "#fff") + '" stroke="#777" stroke-width="1" stroke-dasharray="3 3"/>';
          } else {
            by = 2 + (hi - stepOf(n.k)) * RH + 2;
            g = '<rect x="' + bx + '" y="' + by + '" width="' + bw + '" height="' + (RH - 4) + '" rx="4" fill="' + (sel ? "#cfe0f5" : (o.chg && o.chg[st] && o.chg[st][i] ? "#ffe3cc" : "#fff")) + '" stroke="#000" stroke-width="1.8"/>';
            var nm = noteName(n), tx = bx + bw / 2;
            if (mode === "in") g += '<text x="' + tx + '" y="' + (by + (RH - 4) / 2 + 4.5) + '" text-anchor="middle" font-size="14" font-weight="bold" font-family="Arial,Helvetica,sans-serif" fill="#000">' + esc(nm) + '</text>';
            else if (mode === "under") g += '<text x="' + tx + '" y="' + (by + RH + 10) + '" text-anchor="middle" font-size="12" font-weight="bold" font-family="Arial,Helvetica,sans-serif" fill="#000">' + esc(nm) + '</text>';
            else if (mode === "rows") g += '<text x="' + tx + '" y="' + rowY + '" text-anchor="middle" font-size="13" font-weight="bold" font-family="Arial,Helvetica,sans-serif" fill="#000">' + esc(nm) + '</text>';
            if (showFing && f[i]) g += '<text x="' + tx + '" y="' + fingY + '" text-anchor="middle" font-size="12" font-family="Arial,Helvetica,sans-serif" fill="#333">' + esc(f[i]) + '</text>';
          }
          svg += '<g data-i="' + i + '" data-s="' + st + '" class="wb-ic" style="cursor:pointer">' + g + '</g>';
          x += w;
        });
        // X24 (item 2.4): every line (system) starts with a bracket on the left and ends with a bar on the right, so you can see which system is which
        svg += '<path d="M9 ' + (2) + ' H3 V' + (2 + gridH) + ' H9" fill="none" stroke="#000" stroke-width="2.6"/><line x1="' + (LW - 3) + '" x2="' + (LW - 3) + '" y1="2" y2="' + (2 + gridH) + '" stroke="#000" stroke-width="2.6"/>';
        if (!free) (ln.bars || []).forEach(function(bw0, bi){ var last = li === lines.length - 1 && bi === ln.bars.length - 1, bxx = 4 + bw0 * K; svg += '<line x1="' + bxx + '" x2="' + bxx + '" y1="2" y2="' + (2 + gridH) + '" stroke="#000" stroke-width="' + (last ? 3 : 1.2) + '"/>'; });
        out += '<svg class="wb-iconline" viewBox="0 0 ' + LW + ' ' + H + '" width="100%" style="display:block;margin:0 0 calc(34px + var(--sysgap,0px));" preserveAspectRatio="xMinYMin meet">' + svg + '</svg>';
      });
    });
    return out + '</div>';
  }
  function nameGroupSizes(ex){
    if (!ex || (ex.display !== "names" && ex.display !== "fingers") || ex.ngMode === "even") return null;
    var m = String(ex.nameGroups || "").match(/\d+/g); if (!m) return null;
    var a = m.map(Number).filter(function(x){ return x >= 1 && x <= 32; });
    return a.length ? a : null;
  }
  function padPx(ex, k){ return spaceVal(ex, k); }
  function padStyle(ex, zm){ var a = padPx(ex, "padTop"), b = padPx(ex, "padBot"), z = zm || 1; return (a ? 'padding-top:' + (a / z).toFixed(1) + 'px;' : '') + (b ? 'padding-bottom:' + (b / z).toFixed(1) + 'px;' : ''); }
  function restCellHtml(n, ex){
    var st = (ex && ex.restStyle) || "dash"; if (st === "dash") return '<span class="wb-restdash"></span>';
    if (st === "word") return '<span style="font-size:.78em;font-weight:800;letter-spacing:.02em;">rest</span>';
    var d = n.d || "q", p = '<path d="M7 3 L12 9 L8 13 L13 19 C9 18 7 20 9 24" stroke="#111" stroke-width="3.2" fill="none" stroke-linejoin="round"/>', body;
    if (d === "w") body = '<line x1="3" x2="19" y1="9" y2="9" stroke="#111" stroke-width="2"/><rect x="7" y="9" width="8" height="4.2" fill="#111"/>';
    else if (d === "h") body = '<line x1="3" x2="19" y1="14" y2="14" stroke="#111" stroke-width="2"/><rect x="7" y="9.8" width="8" height="4.2" fill="#111"/>';
    else if (d === "8") body = '<circle cx="8" cy="10" r="2.3" fill="#111"/><path d="M8.6 11.5 L5.5 24 M8 10.6 C11.5 11.6 12.4 9.6 13.2 7.4" stroke="#111" stroke-width="2.8" fill="none" stroke-linecap="round"/>';
    else if (d === "16") body = '<circle cx="8.5" cy="7" r="2.1" fill="#111"/><circle cx="6.8" cy="13.5" r="2.1" fill="#111"/><path d="M7.2 14.8 L4 26 M8.8 8.2 L7.2 13 M9 7.2 C12 8.2 13 6.4 13.6 4.4 M7.3 13.7 C10.3 14.7 11.3 12.9 12 10.9" stroke="#111" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    else body = p;
    return '<svg viewBox="0 0 22 28" width="28" height="38" style="vertical-align:middle" aria-label="rest">' + body + '</svg>';
  }
  function findItem(aid){ return null; }   /* X120: the student site has no assignment tree; sizes fall back to the exercise/global size (this was the "findItem is not defined" that stopped the Songs letters) */
  function scaleOf(ex){ var q = scaleParts(ex); return q.ex * q.cat * q.unit * q.all / 1e8; }
  function scaleParts(ex){
    var it = ex && ex.assignmentId ? findItem(ex.assignmentId) : null, u = it ? it.unit.id : "", t = it && it.a ? (it.a.typeId || "") : "";
    return { ex: sizePct(ex.size), cat: sizePct((settings.catSize || {})[u + "|" + t]), unit: sizePct((settings.unitSize || {})[u]), all: sizePct(settings.sizeAll), unitId: u, typeId: t, it: it };
  }
  function sizePct(v){ if (v === "s") v = 85; else if (v === "l") v = 120; v = +v; return v >= 40 && v <= 200 ? v : 100; }
  function spaceDef(ex, k, lv){ var id = spaceId(ex, lv), m = settings.spaceDef && settings.spaceDef[lv]; var o = id && m ? m[id] : null; return o && o[k] != null && o[k] !== "" ? +o[k] : null; }
  function spaceId(ex, lv){ var q = scaleParts(ex); return lv === "unit" ? q.unitId : lv === "type" ? q.typeId : (q.unitId && q.typeId ? q.unitId + "|" + q.typeId : ""); }
  function spaceLv(ex, k){   // which default this worksheet follows right now: "own", "unit" | "type" | "ut", or "" (none set)
    if (ex[k] != null && ex[k] !== "") return "own";
    var f = ex.spaceFrom && ex.spaceFrom[k]; if (f) return f;
    var o = ["ut", "type", "unit"]; for (var i = 0; i < o.length; i++) if (spaceDef(ex, k, o[i]) != null) return o[i];
    return "";
  }
  function spaceVal(ex, k){
    var mx = SPACE_KEYS[k].max, lv = spaceLv(ex, k), v = 0;
    if (lv === "own") v = +ex[k] || 0; else if (lv) v = spaceDef(ex, k, lv) || 0;
    else if (k === "sysGapN") v = { roomy: 14, wide: 28, xwide: 44 }[ex.sysGap || ""] || 0;
    return Math.max(0, Math.min(mx, Math.round(v)));
  }
  function sysGapPx(ex){ return spaceVal(ex, "sysGapN"); }
  function drawCells(host, ex){ var zm = scaleOf(ex), gp = sysGapPx(ex), so = { edit: false, act: false, markers: false }; host.innerHTML = '<div class="wb-zoomed" style="' + (zm !== 1 ? "zoom:" + zm.toFixed(3) + ";" : "") + padStyle(ex, zm) + (gp ? "--sysgap:" + gp + "px;" : "") + '">' + (ex.display === "icons" ? iconsHtml(ex, so) : cellsHtml(ex, so)) + "</div>"; }
  return { renderScore: renderScore, midiOf: midiOf, notesOf: notesOf, staffList: staffList, drawCells: drawCells };
  })();

  // =====================================================================
  // Shared: sound, the games panel, the buttons on the game bar
  // =====================================================================
  window.ssExtGame = window.ssExtGame || { on: false, id: "" };
  var AC = null;
  function audio(){
    if (!AC) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; try { AC = new C({ latencyHint: "interactive" }); } catch (e) { try { AC = new C(); } catch (e2) { return null; } } }
    if (AC.state === "suspended") { try { AC.resume(); } catch (e) {} }
    return AC;
  }
  function gv(){ var v = Number((SC().rjudge || {}).volume); return isFinite(v) && (SC().rjudge || {}).volume != null ? Math.max(0, Math.min(100, v)) / 100 : 1; }   // the teacher's volume setting
  var sched = [];   // scheduled metronome clicks, so a stopped try can silence them
  function stopSched(){ sched.forEach(function(o){ try { o.stop(0); o.disconnect(); } catch (e) {} }); sched = []; }
  function blip(t, freq, dur, vol, type){
    var c = audio(); if (!c) return; vol = Math.max(0.0002, vol * gv());
    var o = c.createOscillator(), g = c.createGain(); o.type = type || "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03); sched.push(o); if (sched.length > 400) sched.shift();
  }
  var tones = {};   // id -> {o, g}: a tone that lasts as long as the key is down
  function toneOn(id, freq, vol, kind){
    var c = audio(); if (!c || tones[id]) return; vol = Math.max(0.0002, vol * gv());
    var o = c.createOscillator(), o2 = null, g = c.createGain(), t = c.currentTime;
    o.type = kind === "piano" ? "triangle" : kind === "mellow" ? "sine" : "square"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
    if (kind === "mellow") { g.gain.exponentialRampToValueAtTime(vol * 0.55, t + 0.5); o2 = c.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 3; var g3 = c.createGain(); g3.gain.setValueAtTime(0.15, t); g3.gain.exponentialRampToValueAtTime(0.001, t + 0.25); o2.connect(g3); g3.connect(g); o2.start(t); }
    if (kind === "piano") { g.gain.exponentialRampToValueAtTime(vol * 0.35, t + 1.6); o2 = c.createOscillator(); o2.type = "sine"; o2.frequency.value = freq * 2; var g2 = c.createGain(); g2.gain.value = 0.22; o2.connect(g2); g2.connect(g); o2.start(t); }
    o.connect(g); g.connect(c.destination); o.start(t);
    tones[id] = { o: o, o2: o2, g: g };
  }
  function toneOff(id){
    var T = tones[id], c = AC; if (!T || !c) return; delete tones[id];
    var t = c.currentTime;
    try { T.g.gain.cancelScheduledValues(t); T.g.gain.setValueAtTime(Math.max(0.0002, T.g.gain.value), t); T.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); T.o.stop(t + 0.15); if (T.o2) T.o2.stop(t + 0.15); } catch (e) {}
  }
  function toneAll(){ Object.keys(tones).forEach(toneOff); }
  function evt(name, detail){ try { window.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) {} }

  var CSS = ".ssg { position: fixed; top: var(--ssg-top, 8px); left: 8px; right: 8px; bottom: 8px; z-index: 90; background: #fff; border: 3px solid #3a2f8f; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; color: #1d1b2e; font-family: inherit; }" +
    "body.ss-on .ssg { right: 360px; }" +
    ".ssg-h { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 8px 12px; background: #f4f2ff; border-bottom: 2px solid #d9d4ff; } .ssg-h b.t { font-size: 20px; color: #2a2170; } .ssg-h .sp { flex: 1; } .ssg-h label, .ssg-h .ctl { font-size: 13px; font-weight: 700; color: #3a2f8f; display: inline-flex; gap: 4px; align-items: center; }" +
    ".ssg-b { flex: 1; min-height: 0; display: flex; } .ssg-side { width: 210px; flex: none; overflow-y: auto; border-right: 2px solid #eee; padding: 8px; display: flex; flex-direction: column; gap: 5px; }" +
    ".ssg-main { flex: 1; min-width: 0; overflow-y: auto; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px; }" +
    ".ssg-btn { font: inherit; font-weight: 700; border: 2px solid #3a2f8f; background: #fff; color: #3a2f8f; border-radius: 10px; padding: 6px 14px; cursor: pointer; border-bottom-width: 4px; } .ssg-btn.primary { background: #3a2f8f; color: #fff; } .ssg-btn.sm { padding: 1px 8px; border-bottom-width: 2px; } .ssg-btn:disabled { opacity: .45; cursor: default; }" +
    ".ssg-item { text-align: left; font: inherit; font-weight: 700; font-size: 14px; border: 2px solid #ddd; background: #fff; border-radius: 10px; padding: 6px 9px; cursor: pointer; color: #2a2170; } .ssg-item.on { border-color: #3a2f8f; background: #f4f2ff; } .ssg-item small { display: block; font-weight: 600; color: #777; } .ssg-item .ok { color: #1a8a4a; }" +
    ".ssg-staff { border: 2px solid #eee; border-radius: 12px; padding: 4px 8px; background: #fff; position: relative; } .ssg-staff svg { display: block; width: 100%; height: auto; max-height: 460px; }" +
    ".ssg-count { min-height: 54px; display: flex; gap: 14px; align-items: center; justify-content: center; font-size: 40px; font-weight: 800; color: #bbb; } .ssg-count span.on { color: #3a2f8f; transform: scale(1.25); } .ssg-count span { transition: transform .08s; } .ssg-count small { font-size: 15px; color: #777; font-weight: 700; }" +
    ".ssg-lane { position: relative; height: 112px; border: 2px solid #eee; border-radius: 12px; background: #fafafa; overflow: hidden; } .ssg-lane .cin { position: absolute; top: 0; bottom: 0; background: #eceaff; } .ssg-lane .bl { position: absolute; top: 0; bottom: 0; width: 1px; background: #e2e2e2; } .ssg-lane .ml { background: #bbb; width: 2px; }" +
    ".ssg-lane .ex { position: absolute; top: 10px; height: 34px; border: 2px solid #8a85c0; background: #fff; border-radius: 6px; box-sizing: border-box; font-size: 11px; font-weight: 800; text-align: center; line-height: 30px; overflow: hidden; white-space: nowrap; } .ssg-lane .ex.rest { top: 20px; height: 14px; border: 1px dashed #ccc; background: none; }" +
    ".ssg-lane .ex.good { border-color: #1a8a4a; background: #d9f3e3; } .ssg-lane .ex.close { border-color: #d89a00; background: #fff1c7; } .ssg-lane .ex.miss { border-color: #c0392b; background: #fbdcd8; }" +
    ".ssg-lane .ac { position: absolute; top: 56px; height: 30px; border-radius: 6px; background: #2fa866; opacity: .85; box-sizing: border-box; } .ssg-lane .ac.extra { background: #c0392b; } .ssg-lane .ph { position: absolute; top: 0; bottom: 0; width: 3px; background: #e9a31a; z-index: 3; }" +
    ".ssg-lane .lab { position: absolute; bottom: 3px; font-size: 11px; font-weight: 700; color: #555; transform: translateX(-50%); white-space: nowrap; }" +
    ".ssg-msg { font-size: 17px; font-weight: 700; min-height: 26px; } .ssg-msg .big { font-size: 28px; } .ssg-msg .okc { color: #1a8a4a; } .ssg-msg .no { color: #c0392b; } .ssg-sub { font-size: 14px; color: #555; font-weight: 600; line-height: 1.5; }" +
    ".ssg-pad { border: 3px dashed #3a2f8f; border-radius: 14px; padding: 14px; text-align: center; font-weight: 800; color: #3a2f8f; background: #f4f2ff; cursor: pointer; user-select: none; touch-action: none; } .ssg-pad.down { background: #3a2f8f; color: #fff; }" +
    "#rStart, #rAgain { display: none !important; } .ssg-btn[disabled] { opacity: .35; cursor: not-allowed; } .ssg-lane .nowbox { position: absolute; left: 10px; right: 10px; top: 16px; height: 64px; border: 3px solid #cfcbe8; background: #fff; border-radius: 12px; font-weight: 800; font-size: 20px; text-align: center; line-height: 58px; color: #b9b5d8; transition: background .06s; } .ssg-lane .nowbox.on { background: #2fa866; border-color: #2a5aa8; color: #fff; } .nocount { margin-top: 8px; padding: 10px 14px; border-radius: 12px; background: #fff0c7; border: 3px solid #e9a31a; font-size: 20px; font-weight: 800; color: #8a4b00; } .ssg-btns { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }" +
    ".ssg-kb { position: relative; height: 170px; user-select: none; touch-action: none; margin-top: auto; flex: none; } .ssg-kb .wk { position: absolute; top: 0; bottom: 0; border: 1px solid #555; background: #fff; border-radius: 0 0 6px 6px; box-sizing: border-box; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 6px; font-size: 12px; font-weight: 800; color: #3a2f8f; } .ssg-kb .bk { position: absolute; top: 0; height: 62%; background: #222; border-radius: 0 0 5px 5px; z-index: 2; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px; font-size: 11px; font-weight: 800; color: #fff; box-sizing: border-box; } .ssg-kb .wk.down { background: #cfe3ff; } .ssg-kb .bk.down { background: #2fa866; } .ssg-kb .c4 { background: #f7f4ff; } .ssg-kb { margin-bottom: 22px; } .ssg-kb .wk .nm { position: absolute; top: 5px; left: 0; right: 0; text-align: center; font-size: 11px; font-style: normal; text-decoration: none; color: #9a9ab0; font-weight: 700; } .ssg-kb .wk.c3 .nm, .ssg-kb .wk.c4 .nm, .ssg-kb .wk.c5 .nm, .ssg-kb .wk.c2 .nm, .ssg-kb .wk.c6 .nm { color: #3a2f8f; }" +
    ".ssg-count span { display: inline-block; min-width: 84px; text-align: center; padding: 4px 10px 6px; border-radius: 14px; border: 2px solid transparent; } .ssg-count span.on { background: #3a2f8f; color: #fff; border-color: #3a2f8f; transform: none; } .ssg-count span.on small { color: #d9d4ff; } .ssg-dots { display: inline-flex; gap: 3px; vertical-align: middle; } .ssg-dots i { width: 10px; height: 10px; border-radius: 50%; background: #ddd; display: inline-block; } .ssg-dots i.y { background: #1a8a4a; } .ssg-dots i.n { background: #c0392b; } .ssg-dots i.o { background: #e9b320; } .bdg { display: inline-block; font-size: 10px; font-weight: 800; border-radius: 8px; padding: 0 6px; margin-right: 3px; text-transform: uppercase; } .bdg.late { background: #fbdcd8; color: #a3281a; } .bdg.now { background: #d9f3e3; color: #14683a; } .ssg-item.lk { opacity: .5; } .nocount { margin-top: 4px; font-size: 14px; font-weight: 700; color: #a35a00; } .ssg-ver { font-size: 11px; color: #999; font-weight: 600; } " +
    ".ssg-grp { font-size: 12px; font-weight: 800; color: #6b64a8; text-transform: uppercase; letter-spacing: .04em; margin: 8px 2px 0; } .ssg-item[disabled] { opacity: .45; cursor: not-allowed; } [data-ssg].on { outline: 3px solid #3a2f8f; }" +
    "@media (max-width: 900px) { .ssg-side { width: 150px; } }";
  function ensureCss(){ if (document.getElementById("ssgCss")) return; var st = document.createElement("style"); st.id = "ssgCss"; st.textContent = CSS; document.head.appendChild(st); }

  var host = null, cleanup = null, closeCb = null;
  function openHost(id, title, extraHead){
    closeHost();
    ensureCss();
    host = document.createElement("div"); host.className = "ssg"; host.id = "ssgHost"; host.setAttribute("data-game", id);
    host.innerHTML = '<div class="ssg-h"><b class="t">' + esc(title) + '</b><span class="sp"></span>' + (extraHead || "") + '</div><div class="ssg-b" id="ssgBody"></div>';
    document.body.appendChild(host);
    window.ssExtGame.on = true; window.ssExtGame.id = id;
    placeHost(); markCards(id);
    return host.querySelector("#ssgBody");
  }
  function closeHost(){
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    toneAll();
    if (host) { host.remove(); host = null; }
    window.ssExtGame.on = false; window.ssExtGame.id = ""; markCards("");
  }
  function placeHost(){
    if (!host) return; var bar = document.querySelector(".gamebar"), top = 8;
    if (bar) { var r = bar.getBoundingClientRect(); if (r.height > 0) top = Math.round(r.bottom + 6); }
    host.style.setProperty("--ssg-top", top + "px");
  }
  function markCards(id){ [].forEach.call(document.querySelectorAll("[data-ssg]"), function(b){ b.classList.toggle("on", b.getAttribute("data-ssg") === id); b.classList.toggle("idle", b.getAttribute("data-ssg") !== id); }); }
  window.addEventListener("resize", placeHost);
  document.addEventListener("click", function(ev){ if (host && ev.target && ev.target.closest && ev.target.closest("[data-action=hub-type]")) closeHost(); }, true);
  window.ssCloseExtGame = closeHost;
  var GAMES = [{ id: "rhythm", name: "Rhythm" }, { id: "songs", name: "Songs" }];
  function enabled(id){
    var g = SC().games; if (g && g[id] === false) return false;
    if (id === "songs") return !!(SC().songs && SC().songs.length);
    return true;
  }
  function injectCards(){
    var bar = document.querySelector(".gamebar"); if (!bar) return;
    GAMES.forEach(function(g){
      var have = bar.querySelector('[data-ssg="' + g.id + '"]');
      if (!enabled(g.id)) { if (have) have.remove(); return; }
      if (have) return;
      var b = document.createElement("button"); b.type = "button"; b.className = "gcard idle"; b.setAttribute("data-ssg", g.id); b.title = g.name;
      b.innerHTML = '<span class="gname">' + (g.id === "rhythm" ? "♩ " : "♫ ") + esc(g.name) + '</span>';
      var sp = bar.querySelector(".spacer"); if (sp) bar.insertBefore(b, sp); else bar.appendChild(b);
    });
  }
  var obsT = 0;
  function watch(){
    injectCards();
    try { new MutationObserver(function(){ injectCards(); })   /* X116: put the Rhythm / Songs buttons back at once (no flicker when NoteID redraws its bar) */.observe(document.body, { childList: true, subtree: true }); } catch (e) {}
    setInterval(placeHost, 700);
    document.addEventListener("click", function(ev){
      var b = ev.target && ev.target.closest && ev.target.closest("[data-ssg]"); if (!b) return;
      ev.preventDefault(); ev.stopPropagation();
      var id = b.getAttribute("data-ssg"); if (PREVIEWISH && window.parent !== window) { /* the inspector in student-ui.js tells the panel; the game still opens */ }
      if (id === "rhythm") openRhythm(); else if (id === "songs") openSongs();
    }, true);
  }

  // =====================================================================
  // RHYTHM
  // =====================================================================
  var R = null, raf = 0;
  function loadLevels(){
    var rr = SC().rhythm, list = rr && Array.isArray(rr.levels) && rr.levels.length ? rr.levels : null;
    var c = rr && rr.cfg || {}; cfg = { weights: c.weights || {}, shapeRules: c.shapeRules || {}, profiles: [] };
    try { levels = (list ? JSON.parse(JSON.stringify(list)) : seedLevels()).map(normalizeLevel); } catch (e) { levels = seedLevels().map(normalizeLevel); }
  }
  function J(){ var j = SC().rjudge || {}; function g(k, d){ var v = Number(j[k]); return isFinite(v) && j[k] != null && j[k] !== "" ? v : d; }
    // X118: the teacher's bands (ms from the written note start, after calibration) and how much each one is worth. Beyond tReal a tap is "wrong entirely": a missed note plus an extra tap.
    return { tOn: g("tOn", 90), tLit: g("tLit", 150), tEar: g("tEar", 250), tReal: g("tReal", 400), cOn: g("cOn", 100) / 100, cLit: g("cLit", 80) / 100, cEar: g("cEar", 50) / 100, cReal: g("cReal", 20) / 100, extraPen: g("extraPen", 50) / 100, extraCap: g("extraCap", 95) / 100,
      holdMin: g("holdMin", 8), holdTolMs: g("holdTolMs", 150), holdTolPct: g("holdTolPct", 20), gapPct: g("gapPct", 50), pass: g("pass", 85) / 100, need: g("need", 4), yellow: g("yellow", 70) / 100, of: g("of", 5) }; }
  var COUNTOFF = { "4/4": "0:1 4:2 8:rea-/3 10:dy/+ 12:and/4", "3/4": "0:1 4:rea-/2 6:dy/+ 8:and/3", "6/8": "0:1 2:+ 4:a 6:2 8:+ 10:a" };
  function countTokens(T){
    var key = "ts_" + T.num + T.den, c = (SC().rhythm && SC().rhythm.cfg || {}), txt = (c.countOff && c.countOff[key]) || COUNTOFF[T.num + "/" + T.den] || COUNTOFF["4/4"];
    return String(txt).split(/\s+/).filter(Boolean).map(function(t){ var m = /^(\d+):([^\/]*)(?:\/(.*))?$/.exec(t); return m ? { tick: +m[1], word: m[2], sub: m[3] || "" } : null; }).filter(Boolean);
  }
  function rResults(){ return jget("rhythm-results", {}); }
  function cleared(lv){ var r = rResults()[lv.id], j = J(); if (!r || !r.h2) return false; var h = r.h2.slice(-j.of); if (h.length < j.of) return false; var g = 0; for (var k = 0; k < h.length; k++) { if (h[k] === 0) return false; if (h[k] === 2) g++; } return g >= j.need && h[h.length - 1] === 2; }   // like RhythmRandomizer: no reds, enough greens (default 4 of the last 5), the newest one green
  function isTeacher(){ return !!(PREVIEWISH || (window.ssIsTester && window.ssIsTester())); }
  function allowedLevel(i){ if (i <= 1 || (isTeacher() && lg("rhythm-openall") === "1")) return true; for (var k = 0; k < i; k++) if (!cleared(levels[k])) return false; return true; }   // levels 1 and 2 are always open; a level opens when every level before it is cleared (teacher test computers see all)
  var NAMES_SIMPLE = { 4: ["1", "2", "3", "4"], 3: ["1", "2", "3"] }, NAMES_68 = ["1", "+", "a", "2", "+", "a"];
  function tickMsOf(T, bpm){ return 60000 / (bpm * T.beat); }

  window.ssGameBusy = function(){ return !!(R && (R.phase === "count" || R.phase === "run")); };
  var CAL = { done: false, offset: 0, fails: 0 };   /* X118: saved once per computer (ss:rcal); the warm-up only runs the first time, or when the teacher re-runs it */
  (function(){ try { var c = JSON.parse(lg("rcal") || "null"); if (c && c.done && isFinite(c.offset)) { CAL.done = true; CAL.offset = c.offset; } } catch (e) {} })();
  function calSave(){ try { ls("rcal", JSON.stringify({ done: true, offset: CAL.offset, at: Date.now() })); } catch (e) {} }   // X116: lives only until the page is refreshed; every refresh starts with a one-measure warm-up
  function openRhythm(){
    if (!window.VexFlow) { alert("The music drawing code did not load. Reload the page."); return; }
    if (!levels.length) loadLevels();
    var body = openHost("rhythm", "Rhythm", '<span class="ssg-ver">games X121</span>' + '<span class="ctl">Tempo <button type="button" class="ssg-btn sm" id="rSlow">&minus;</button><b id="rTempo"></b><button type="button" class="ssg-btn sm" id="rFast">+</button></span>' + '<span class="ctl"><label><input type="checkbox" id="rFollow"> Follow notes</label></span>' +
      '<span class="ctl" id="rTeach" style="display:none" title="Teacher only">Teacher: <span id="rCal"></span> <button type="button" class="ssg-btn sm" id="rRewarm">Redo warm-up</button> <label><input type="checkbox" id="rOpenAll"> open every level</label> <button type="button" class="ssg-btn sm" id="rResetLv" title="Forget every level\'s tries on this computer">Reset all levels</button> <button type="button" class="ssg-btn sm" id="rResetOne" title="Forget the tries of this level">Reset this level</button> <button type="button" class="ssg-btn sm" id="rClearOne" title="Count this level as cleared">Clear this level</button></span>');
    body.innerHTML = '<div class="ssg-side" id="rLevels"></div><div class="ssg-main"><div class="ssg-sub" id="rTitle"></div><div class="ssg-count" id="rCount"></div><div class="ssg-staff" id="rStaff"></div><div class="ssg-lane" id="rLane"></div>' +
      '<div class="ssg-msg" id="rMsg"></div><div class="ssg-sub" id="rDet"></div><div class="ssg-btns"><button type="button" class="ssg-btn primary" id="rStart">Start</button><button type="button" class="ssg-btn" id="rAgain" style="display:none">Try again</button><button type="button" class="ssg-btn" id="rStop" disabled>Backspace to stop</button><button type="button" class="ssg-btn" id="rNew">N for new rhythm</button><button type="button" class="ssg-btn" id="rNext" style="display:none">Next level</button></div>' +
      '<div class="ssg-pad" id="rPad">Click here or press any key to start</div></div></div>';
    var last = Number(lg("rhythm-level") || 0); if (!(last >= 0 && last < levels.length) || !allowedLevel(last)) last = 0;
    R = { lv: last, tempo: 0, phase: "ready", taps: [], sync: 0, click: true, follow: false, held: {}, ex: null };
    var h = host;
    function $(id){ return h.querySelector("#" + id); }
    $("rFollow").onchange = function(){ R.followOn = this.checked; if (!R.followOn && R.geo) R.geo.ph.setAttribute("visibility", "hidden"); };   // X120: a moving bar over the written notes, off by default
    $("rSlow").onclick = function(){ R.tempo = Math.max(36, R.tempo - 4); $("rTempo").textContent = R.tempo; if (R.phase === "ready" || R.phase === "done") { R.phase = "ready"; showReady(); } };
    $("rFast").onclick = function(){ R.tempo = Math.min(140, R.tempo + 4); $("rTempo").textContent = R.tempo; if (R.phase === "ready" || R.phase === "done") { R.phase = "ready"; showReady(); } };
    $("rStart").onclick = function(){ startRun(); this.blur(); };
    $("rAgain").onclick = function(){ tryAgain(); this.blur(); };
    $("rNew").onclick = function(){ if (R.lv > 0) newExercise(); this.blur(); };
    $("rStop").onclick = function(){ if (R.phase === "count" || R.phase === "run") abortRun(); this.blur(); };
    $("rNext").onclick = function(){ setLevel(Math.min(levels.length - 1, R.lv + 1)); this.blur(); };
    var pad = $("rPad");
    pad.addEventListener("pointerdown", function(ev){ ev.preventDefault(); try { pad.setPointerCapture(ev.pointerId); } catch (e) {} pad.classList.add("down"); if (R.phase === "ready") startRun(); else if (R.phase === "done") { if (performance.now() - (R.doneAt || 0) > 1200) tryAgain(); } else tapDown("pointer", ev.timeStamp > 0 ? ev.timeStamp : performance.now()); });
    var padUp = function(ev){ pad.classList.remove("down"); tapUp("pointer", ev && ev.timeStamp > 0 ? ev.timeStamp : performance.now()); };
    pad.addEventListener("pointerup", padUp); pad.addEventListener("pointercancel", padUp);
    var kd = function(ev){
      if (!host || host.getAttribute("data-game") !== "rhythm") return;
      var k = ev.key;
      if (ev.metaKey || ev.ctrlKey || ev.altKey || k === "Shift" || k === "Control" || k === "Alt" || k === "Meta" || k === "Tab" || /^F\d+$/.test(k) || k === "CapsLock") return;
      if (ev.target && /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName) && k !== " ") return;
      ev.preventDefault(); ev.stopPropagation();
      if (k === "Escape") { if (R.phase === "count" || R.phase === "run") failRun("You pressed Escape."); return; }   // X118: during the count-in this is "Not tried" (no attempt counted)   // X115: Escape (it also leaves full screen) fails the try
      if (k === "Backspace") { if (R.phase === "count" || R.phase === "run") abortRun(); return; }
      if (k === "n" || k === "N") { if (!ev.repeat && (R.phase === "ready" || R.phase === "done") && R.lv > 0) newExercise(); return; }
      if (ev.repeat) return;
      var t = ev.timeStamp > 0 ? ev.timeStamp : performance.now();
      if (R.phase === "ready") { startRun(); return; }
      if (R.phase === "done") { if (performance.now() - (R.doneAt || 0) > 1200) tryAgain(); return; }
      tapDown(ev.code || k, t);
    };
    var ku = function(ev){ if (!host || host.getAttribute("data-game") !== "rhythm") return; ev.preventDefault(); ev.stopPropagation(); tapUp(ev.code || ev.key, ev.timeStamp > 0 ? ev.timeStamp : performance.now()); };
    window.addEventListener("keydown", kd, true); window.addEventListener("keyup", ku, true);
    cleanup = function(){ window.removeEventListener("keydown", kd, true); window.removeEventListener("keyup", ku, true); cancelAnimationFrame(raf); R = null; };
    if (isTeacher()) { h.querySelector("#rTeach").style.display = ""; h.querySelector("#rRewarm").onclick = function(){ if (R.phase === "count" || R.phase === "run") abortRun(); CAL.done = false; try { localStorage.removeItem("ss:rcal"); } catch (e) {} startWarm(); this.blur(); }; var oa = h.querySelector("#rOpenAll"); oa.checked = lg("rhythm-openall") === "1"; oa.onchange = function(){ ls("rhythm-openall", this.checked ? "1" : "0"); drawLevels(); }; h.querySelector("#rResetLv").onclick = function(){ ls("rhythm-results", "{}"); drawLevels(); }; h.querySelector("#rResetOne").onclick = function(){ var rs = rResults(); delete rs[levels[R.lv].id]; ls("rhythm-results", JSON.stringify(rs)); drawLevels(); }; h.querySelector("#rClearOne").onclick = function(){ var rs = rResults(), id = levels[R.lv].id, r = rs[id] || (rs[id] = { tries: 0, passes: 0, best: null }); r.h2 = [2, 2, 2, 2, 2]; ls("rhythm-results", JSON.stringify(rs)); drawLevels(); }; }
    var fsw = function(){ if (R && R.fs && !document.fullscreenElement && (R.phase === "count" || R.phase === "run")) failRun("You left full screen."); };
    document.addEventListener("fullscreenchange", fsw);
    var cl0 = cleanup; cleanup = function(){ document.removeEventListener("fullscreenchange", fsw); if (cl0) cl0(); };
    drawLevels(); setLevel(last, true); if (!CAL.done) startWarm();
  }
  function dotsHtml(lv){ var r = rResults()[lv.id], h = (r && r.h2 || []).slice(-5), o = '<span class="ssg-dots" title="Last 5 tries">'; for (var k = 0; k < 5; k++) { var v = h[k]; o += '<i class="' + (v === 2 ? "y" : v === 1 ? "o" : v === 0 ? "n" : "") + '"></i>'; } return o + '</span>'; }
  function curLevel(){ for (var k = 0; k < levels.length; k++) if (!cleared(levels[k])) return k; return -1; }
  function drawLevels(){
    var res = rResults(), el = host.querySelector("#rLevels");
    el.innerHTML = levels.map(function(lv, i){
      var r = res[lv.id] || {}, ok = allowedLevel(i), cl = cleared(lv);
      return '<button type="button" class="ssg-item' + (i === R.lv ? " on" : "") + '" data-i="' + i + '"' + (ok ? "" : " disabled") + '>' + (i + 1) + '. ' + esc(lv.name) + '<small>' + (cl ? '<span class="ok">✓ cleared</span> &middot; ' : "") + (!ok ? '&#128274; ' : "") + (i === curLevel() ? '<span class="bdg now">current</span> ' : "") + (r.best != null ? "best " + Math.round(r.best * 100) + "%" : "not tried") + '<br>Last 5: ' + dotsHtml(lv) + '</small></button>';
    }).join("");
    [].forEach.call(el.querySelectorAll("[data-i]"), function(b){ b.onclick = function(){ if (b.disabled) return; if (R.phase === "count" || R.phase === "run") abortRun(); setLevel(+b.getAttribute("data-i")); }; });
  }
  function setLevel(i, first){
    R.warm = false; R.afterWarm = false; R.lv = i; ls("rhythm-level", String(i)); R.follow = false; R.tempo = levels[i].tempo || 72;
    host.querySelector("#rTempo").textContent = R.tempo;
    if (!first) drawLevels(); else drawLevels();
    newExercise();
  }
  function setBtns(){ if (!host || !R) return; var act = R.phase === "count" || R.phase === "run"; host.querySelector("#rStop").disabled = !act; var nb = host.querySelector("#rNew"); nb.disabled = act; nb.style.display = R.lv > 0 ? "" : "none"; }
  function newExercise(){
    if (R.phase === "count" || R.phase === "run") abortRun();
    var lv = levels[R.lv], r = generateExercise(R.lv, { measures: Math.max(4, Number(lv.measures) || 4) });
    R.ex = r && r.ex ? r.ex : null; R.err = r && r.error || ""; if (R.ex && R.ex.ts && R.ex.ts.num === 4 && R.ex.ts.den === 4) { R.tempo = 60; host.querySelector("#rTempo").textContent = 60; } else { R.tempo = lv.tempo || 72; host.querySelector("#rTempo").textContent = R.tempo; }
    R.phase = "ready"; R.taps = []; R.held = {}; R.tries = 0;
    host.querySelector("#rTitle").innerHTML = '<b>Level ' + (R.lv + 1) + ': ' + esc(lv.name) + '</b>' + "";
    if (!R.ex) { host.querySelector("#rStaff").innerHTML = '<div class="ssg-sub">Could not make a rhythm for this level (' + esc(R.err) + ').</div>'; return; }
    evt("ss-question", { title: "Rhythm: " + lv.name, mode: "practice" });
    R.colors = null; R.restColors = null; R.reveal = false; R.score = null; drawStaff(); showReady(); setBtns();
  }
  function showReady(){
    var h = host; if (!h || !R || !R.ex) return;
    R.tickMs = tickMsOf(R.ex.ts, R.tempo); R.reveal = false; R.score = null;
    drawLane(); drawCount(-1);
    h.querySelector("#rMsg").innerHTML = R.tries ? "" : "Get ready: you hear one measure of counting, then play the rhythm.";
    h.querySelector("#rDet").textContent = ""; h.querySelector("#rStart").style.display = ""; h.querySelector("#rAgain").style.display = "none"; h.querySelector("#rNext").style.display = "none";
    var T = R.ex.ts; h.querySelector("#rTempo").textContent = R.tempo;
    var ph = h.querySelector("#rStaff .ssgph"); if (ph) ph.setAttribute("visibility", "hidden");
  }
  function drawCount(cur){
    var T = R.ex.ts, toks = countTokens(T);
    host.querySelector("#rCount").innerHTML = toks.map(function(t, i){ return '<span class="' + (i === cur ? "on" : "") + '">' + esc(t.word) + (t.sub ? '<small style="display:block;font-size:14px;line-height:1">' + esc(t.sub) + '</small>' : "") + '</span>'; }).join("");
  }

  // ---- the staff (VexFlow), with a moving marker ----
  var DURV = { 16: { d: "w", dots: 0 }, 12: { d: "h", dots: 1 }, 8: { d: "h", dots: 0 }, 6: { d: "q", dots: 1 }, 4: { d: "q", dots: 0 }, 3: { d: "8", dots: 1 }, 2: { d: "8", dots: 0 }, 1: { d: "16", dots: 0 } };
  function drawStaff(){
    var VF = window.VexFlow, hostEl = host.querySelector("#rStaff"), ex = R.ex, T = ex.ts; hostEl.innerHTML = "";
    var maxPerRow = 4, rowAvail = 1100, clefW = 52, tsW = 38 + 46;   /* X119: 46 extra px between the time signature and the first note: taps in the last count-in beat are drawn there */
    function wt(ms){ var w = 70; ms.forEach(function(p){ w += (p.ticks <= 1 ? 24 : p.ticks <= 3 ? 32 : 44) + (p.ticks === 3 || p.ticks === 6 || p.ticks === 12 ? 10 : 0); }); return Math.max(w, 150); }
    var weights = ex.measures.map(wt), rows = [], cur = [];
    ex.measures.forEach(function(ms, i){ if (cur.length >= maxPerRow) { rows.push(cur); cur = []; } cur.push(i); });
    if (cur.length) rows.push(cur);
    var rowH = R.reveal ? 175 : 120, topPad = 40, layout = [], maxRowW = 0;
    rows.forEach(function(row, r){
      var extra = clefW + (r === 0 ? tsW : 0), sumW = row.reduce(function(a, i){ return a + weights[i]; }, 0), rowW = Math.min(rowAvail, sumW * 1.5 + extra), x = 20;
      row.forEach(function(i, k){ var w = (weights[i] / sumW) * (rowW - extra) + (k === 0 ? extra : 0); layout[i] = { row: r, x: x, w: w, first: k === 0 }; x += w; });
      maxRowW = Math.max(maxRowW, x + 20);
    });
    var W = Math.max(maxRowW, 360) + 70, H = rows.length * rowH + topPad - 10;   // X119: room at the right for taps played after the exercise ended
    var renderer = new VF.Renderer(hostEl, VF.Renderer.Backends.SVG); renderer.resize(W, H);
    var ctx = renderer.getContext(), svg = hostEl.querySelector("svg");
    if (svg) { svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.removeAttribute("width"); svg.removeAttribute("height"); svg.style.width = "100%"; svg.style.height = "auto"; }
    var refs = [], mEnd = [], mStart = [], absBase = 0, lastCc = null;
    ex.measures.forEach(function(ms, mi){
      var lay = layout[mi], y = topPad + lay.row * rowH, stave = new VF.Stave(lay.x, y, lay.w);
      stave.setConfigForLines([{ visible: false }, { visible: false }, { visible: true }, { visible: false }, { visible: false }]);
      if (lay.first) stave.addClef("percussion");
      if (mi === 0) { stave.addTimeSignature(T.num + "/" + T.den); try { stave.setNoteStartX(stave.getNoteStartX() + 46); } catch (e) {} }
      if (mi === ex.measures.length - 1) stave.setEndBarType(VF.BarlineType.END);
      stave.setContext(ctx).draw();
      var notes = [], fullRest = (ms.length === 1 && ms[0].rest && ms[0].ticks === T.ticks);
      ms.forEach(function(p){
        var d = DURV[p.ticks], note;
        if (fullRest) note = new VF.StaveNote({ keys: ["b/4"], duration: "wr", alignCenter: true });
        else { note = new VF.StaveNote({ keys: ["b/4"], duration: d.d + (p.rest ? "r" : ""), dots: d.dots, stemDirection: 1 }); if (d.dots) VF.Dot.buildAndAttach([note], { all: true }); }
        var cc = p.rest ? (R.restColors && R.restColors[absBase + p.pos]) : (p.tiedPrev && lastCc ? lastCc : (R.colors && R.colors[absBase + p.pos])); if (!p.rest) lastCc = cc;   // X121: the second half of a tie takes the colour of the note it continues if (cc) { try { note.setStyle({ fillStyle: cc, strokeStyle: cc }); if (note.setStemStyle) note.setStemStyle({ fillStyle: cc, strokeStyle: cc }); if (note.setFlagStyle) note.setFlagStyle({ fillStyle: cc, strokeStyle: cc }); } catch (e) {} }
        notes.push(note); refs.push({ part: p, note: note, abs: absBase + p.pos, y: y, m: mi, cx: 0 });
      });
      var voice = new VF.Voice({ numBeats: T.num, beatValue: T.den }).setMode(VF.Voice.Mode.SOFT); voice.addTickables(notes);
      var bg = {}; ms.forEach(function(p, k){ if (p.beam) (bg[p.beam] = bg[p.beam] || []).push(notes[k]); });
      var beams = Object.keys(bg).map(function(k){ return new VF.Beam(bg[k]); });
      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave); voice.draw(ctx, stave); beams.forEach(function(b){ b.setContext(ctx).draw(); });
      var base = refs.length - ms.length;
      notes.forEach(function(n, k){ var cx; try { cx = (n.getNoteHeadBeginX() + n.getNoteHeadEndX()) / 2; } catch (e) { cx = n.getAbsoluteX() + 6; } refs[base + k].cx = cx; if (fullRest) { try { var rel = n.getSVGElement(); if (rel) rel.setAttribute("transform", "translate(0,1.5)"); } catch (e) {} } });
      mEnd[mi] = stave.getNoteEndX(); mStart[mi] = (!lay.first && mi > 0) ? stave.getX() : null; absBase += T.ticks;
    });
    for (var i = 0; i < refs.length - 1; i++) {
      var a = refs[i], b = refs[i + 1]; if (!a.part.tiedNext) continue;
      try {
        if (layout[a.part.m].row === layout[b.part.m].row) new VF.StaveTie({ firstNote: a.note, lastNote: b.note, firstIndexes: [0], lastIndexes: [0] }).setContext(ctx).draw();
        else { new VF.StaveTie({ firstNote: a.note, lastNote: null, firstIndexes: [0], lastIndexes: [0] }).setContext(ctx).draw(); new VF.StaveTie({ firstNote: null, lastNote: b.note, firstIndexes: [0], lastIndexes: [0] }).setContext(ctx).draw(); }
      } catch (e) {}
    }
    function posAt(abs){
      var k = 0; for (var q = 0; q < refs.length; q++) if (refs[q].abs <= abs) k = q; else break;
      var r = refs[k], nxt = refs[k + 1];
      if (r.abs === abs) return { x: r.cx, y: r.y };
      var endTick = (nxt && nxt.m === r.m) ? nxt.abs : (r.m + 1) * T.ticks, endX = (nxt && nxt.m === r.m) ? nxt.cx : (nxt && layout[nxt.m].row === layout[r.m].row) ? nxt.cx : mEnd[r.m] - 8, f = (abs - r.abs) / Math.max(1, endTick - r.abs);
      return { x: r.cx + (endX - r.cx) * f, y: r.y };
    }
    var ns = "http://www.w3.org/2000/svg", ph = document.createElementNS(ns, "line"); ph.setAttribute("class", "ssgph"); ph.setAttribute("stroke", "#e9a31a"); ph.setAttribute("stroke-width", "4"); ph.setAttribute("stroke-linecap", "round"); ph.setAttribute("visibility", "hidden"); svg.appendChild(ph);
    R.geo = { posAt: posAt, ph: ph, total: T.ticks * ex.measures.length, layout: layout, mEnd: mEnd, mStart: mStart, rowH: rowH, topPad: topPad, svg: svg, ns: ns, W: W };
    if (R.reveal && R.score) drawUnder();
  }

  // ---- X115: after a try, "what you should have played" boxes and "what you played" bars sit directly under the written notes, lined up with them
  function segs(a0, a1){   // a tick range -> pieces (one per measure it touches) with x0, x1 and the row's y
    var G = R.geo, T = R.ex.ts, out = [], total = G.total; a0 = Math.max(0, a0); a1 = Math.min(total, a1); if (a1 <= a0) return out;
    for (var m = Math.floor(a0 / T.ticks); m * T.ticks < a1 && m < R.ex.measures.length; m++) {
      var lo = Math.max(a0, m * T.ticks), hi = Math.min(a1, (m + 1) * T.ticks), y = G.topPad + G.layout[m].row * G.rowH;
      var SH = 10, x0 = G.posAt(lo).x - SH, x1 = hi >= (m + 1) * T.ticks ? G.mEnd[m] - 4 : G.posAt(hi).x - SH;
      if (lo === m * T.ticks && G.mStart && G.mStart[m] != null && x0 > G.mStart[m] + 6) x0 -= 0.65 * (x0 - (G.mStart[m] + 4));   // X120: the first box of a measure reaches back toward the bar line so its width is closer to its real length   // X116: posAt gives the middle of a note head; boxes start at its left edge
      out.push({ x0: x0, x1: Math.max(x0 + 3, x1), y: y });
    }
    return out;
  }
  function svgEl(name, at, parent){ var e = document.createElementNS(R.geo.ns, name); Object.keys(at).forEach(function(k){ e.setAttribute(k, at[k]); }); (parent || R.geo.svg).appendChild(e); return e; }
  function drawUnder(){
    var S = R.score, E = R.E, T = R.ex.ts, teacher = isTeacher();
    var FILL = FILL5, EDGE = COL5;
    E.rests.forEach(function(rs){ var rc = R.restColors && R.restColors[rs.abs], bad = rc === "#c0392b", na = rc === "#8a8a8a"; segs(rs.abs, rs.abs + rs.ticks).forEach(function(g, gi){ svgEl("rect", { x: g.x0, y: g.y + 96, width: g.x1 - g.x0, height: 26, rx: 5, fill: bad ? "#fbdcd8" : na ? "#eeeeee" : "#e3f4e9", stroke: bad ? "#c0392b" : na ? "#999" : "#1a8a4a", "stroke-dasharray": "4 3", "stroke-width": 1.5 }); if (gi === 0 && !na) { var rt = svgEl("text", { x: g.x0 + (g.x1 - g.x0) / 2, y: g.y + 113, "text-anchor": "middle", "font-size": 12, "font-weight": 800, fill: bad ? "#c0392b" : "#1a8a4a", "pointer-events": "none" }); rt.textContent = bad ? "\u2717" : "\u2713"; } }); });
    S.res.forEach(function(r){
      var e = E.evs[r.i], early = r.dt != null && r.dt < 0, words = r.split && r.onset === "good" ? ["played twice"] : r.onset === "miss" ? ["missed"] : r.onset === "real" ? [early ? "way too early" : "way too late"] : r.onset === "ear" ? [early ? "too early" : "too late"] : [r.onset === "lit" ? (early ? "a bit early" : "a bit late") : "", r.hold === "short" ? "let go early" : r.hold === "long" ? "held long" : ""].filter(Boolean);
      var full = teacher && r.dt != null ? "start " + (r.dt > 0 ? "+" : "") + r.dt + " end " + (r.de > 0 ? "+" : "") + r.de : (words.length ? words.join(", ") : "\u2713");
      var title = "Start: " + (r.dt == null ? "missed" : (r.dt > 0 ? r.dt + " ms late" : (-r.dt) + " ms early")) + (r.hold === "na" ? "" : "; end: " + (r.hold === "good" ? "good" : r.hold === "short" ? "you let go too early" : "you held too long"));
      segs(e.abs, e.abs + e.ticks).forEach(function(g, gi){
        var w = g.x1 - g.x0, k = r.k;
        svgEl("rect", { x: g.x0, y: g.y + 96, width: w, height: 26, rx: 5, fill: FILL[k], stroke: EDGE[k], "stroke-width": 2 }).appendChild(document.createElementNS(R.geo.ns, "title")).textContent = title;
        if (gi > 0) return;
        var sh = r.onset === "miss" ? "miss" : r.hold === "short" ? "short" : r.hold === "long" ? "long" : (r.dt < 0 ? "early" : "late"), txt = full; if (txt.length * 5.6 > w - 6) txt = words.length ? words[0] : "\u2713"; if (txt.length * 5.6 > w - 6) txt = k === "good" ? "\u2713" : sh; if (txt.length * 5.6 > w - 6) txt = k === "good" ? "\u2713" : k === "miss" ? "\u2717" : (r.dt < 0 ? "\u25c0" : "\u25b6");
        var t = svgEl("text", { x: g.x0 + w / 2, y: g.y + 113, "text-anchor": "middle", "font-size": 11, "font-weight": 800, fill: EDGE[k], "pointer-events": "none" }); t.textContent = txt;
      });
    });
    var preT = [], postT = [], totalT = R.geo.total;
    R.taps.forEach(function(tp){
      var t0 = (tp.down - R.w0) / R.tickMs, t1 = ((tp.up == null ? tp.down + 80 : tp.up) - R.w0) / R.tickMs;
      if (tp.extra && t0 < 0) { preT.push(tp); return; }          // X119: taps in the last beat of the count-in sit in the space before the first note
      if (tp.extra && t0 >= totalT) { postT.push(tp); return; }   // X119: taps after the exercise ended sit in the space after the last measure
      segs(t0, Math.max(t1, t0 + 0.12)).forEach(function(g){ svgEl("rect", { x: g.x0, y: g.y + 128, width: Math.max(5, g.x1 - g.x0), height: 22, rx: 5, fill: tp.extra ? "#c0392b" : "#2fa866", opacity: .95, stroke: tp.extra ? "#7a1f16" : "none", "stroke-width": tp.extra ? 2 : 0 }).appendChild(document.createElementNS(R.geo.ns, "title")).textContent = tp.extra ? "An extra note: nothing was written here" : "What you played"; });
    });
    function zone(list, xa, xb, y, what, t0z, t1z){   // X120: the gap stands for the whole beat before (or after) the exercise: each tap sits where it fell in time, as wide as it was held
      if (!list.length || xb - xa < 8) return;
      var span = t1z - t0z;
      list.forEach(function(tp){ var a0 = (tp.down - R.w0) / R.tickMs, a1 = ((tp.up == null ? tp.down + 80 : tp.up) - R.w0) / R.tickMs;
        var x0 = xa + Math.max(0, (a0 - t0z) / span) * (xb - xa), x1 = xa + Math.min(1, (a1 - t0z) / span) * (xb - xa);
        svgEl("rect", { x: x0, y: y + 128, width: Math.max(4, x1 - x0), height: 22, rx: 5, fill: "#c0392b", opacity: .95, stroke: "#7a1f16", "stroke-width": 2 }).appendChild(document.createElementNS(R.geo.ns, "title")).textContent = "An extra note " + what; });
    }
    var G0 = R.geo, lastM = R.ex.measures.length - 1;
    zone(preT, 70, G0.posAt(0).x - 18, G0.topPad + G0.layout[0].row * G0.rowH, "before the exercise began", -T.beat, 0);
    zone(postT, G0.mEnd[lastM] + 6, G0.W - 6, G0.topPad + G0.layout[lastM].row * G0.rowH, "after the exercise ended", R.geo.total, R.endTick);
    var lg2 = svgEl("text", { x: 6, y: R.geo.topPad + 113, "font-size": 10, fill: "#777" }); lg2.textContent = "answer";
    var lg3 = svgEl("text", { x: 6, y: R.geo.topPad + 143, "font-size": 10, fill: "#777" }); lg3.textContent = "you played";
  }

  // ---- the lane under the staff: what you should play (boxes) and what you played (blue bars) ----
  function laneSpan(){ var T = R.ex.ts; return { min: -T.ticks, max: R.ex.measures.length * T.ticks + T.beat }; }
  function lx(tick){ var s = laneSpan(); return ((tick - s.min) / (s.max - s.min) * 100); }
  function expectedEvents(){
    var T = R.ex.ts, evs = [], rests = [], last = null;
    R.ex.measures.forEach(function(ms, mi){ ms.forEach(function(p){
      var abs = mi * T.ticks + p.pos;
      if (p.rest) { rests.push({ abs: abs, ticks: p.ticks }); last = null; return; }
      if (p.tiedPrev && last) { last.ticks += p.ticks; return; }
      last = { abs: abs, ticks: p.ticks }; evs.push(last);
    }); });
    evs.forEach(function(e, i){ var n = evs[i + 1]; if (n && n.abs === e.abs + e.ticks) e.gapNext = 1; });
    return { evs: evs, rests: rests };
  }
  function drawLane(){
    var lane = host.querySelector("#rLane"), T = R.ex.ts, s = laneSpan(), E = expectedEvents(); R.E = E;
    var h = "";
    if (!R.reveal) h += '<div class="nowbox" id="rNow">playing</div>';
    lane.style.display = R.reveal ? "none" : "";
    lane.innerHTML = h; lane.querySelectorAll(".ex:not(.rest)");
  }

  // ---- the run ----
  function startRun(){
    if (!R || !R.ex || R.phase === "count" || R.phase === "run") return;
    if (R.needNew && R.lv > 0) { R.needNew = false; newExercise(); } else R.needNew = false;   // you got the last one: a fresh rhythm
    var c = audio(); if (!c) { host.querySelector("#rMsg").textContent = "This computer cannot play sound here."; return; }
    if (R.warm) CAL.offset = 0; var T = R.ex.ts; R.tickMs = tickMsOf(T, R.tempo); R.taps = []; R.held = {}; R.tries++; R.reveal = false; R.score = null; R.fs = !!document.fullscreenElement; R.followUsed = false; R.colors = null; R.restColors = null;
    if (R.hadResult) { drawStaff(); R.hadResult = false; }
    drawLane();
    var a0 = c.currentTime + 0.25, perfA0;
    R.a0 = a0; R.amap = []; R.lastMap = 0;
    perfA0 = performance.now() + (a0 - c.currentTime) * 1000 + ((c.outputLatency || 0) + (c.baseLatency || 0)) * 1000;   // first guess only; sampleMap() replaces it with the median of many audio-clock readings during the count-in
    R.w0 = perfA0 + T.ticks * R.tickMs;   // when tick 0 (the first note) is heard
    sampleMap();
    var total = R.ex.measures.length * T.ticks, cstep = T.compound ? 2 : 4, bstep = T.beat, ms = R.tickMs / 1000;
    R.tokens = countTokens(T);
    R.tokens.forEach(function(t, k){ blip(a0 + t.tick * ms, (k === 0 || (T.compound && t.tick % 6 === 0)) ? 1500 : 1000, 0.07, 0.6, "square"); });
    for (var y = 0; y < total; y += bstep) blip(a0 + (y + T.ticks) * ms, (y % T.ticks === 0) ? 1500 : 1000, 0.06, 0.45, "square");
    R.endTick = total + T.beat + Math.round(T.beat / 2); R.phase = "count"; R.lastCount = -2;   // X119: keeps listening half a beat past the click beat after the last measure
    var h = host; h.querySelector("#rMsg").textContent = ""; h.querySelector("#rDet").textContent = "";
    h.querySelector("#rStart").style.display = "none"; h.querySelector("#rAgain").style.display = "none"; h.querySelector("#rNext").style.display = "none";
    var ph = R.geo.ph; ph.setAttribute("visibility", "hidden"); 
    setBtns(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  // X117: where the audio clock sits on the page clock is read many times (every ~60 ms through the count-in and the try) and the MIDDLE reading is used, so one noisy
  // reading (or the browser switching between ways of estimating the speaker delay) can no longer move every note's expected time by tens of milliseconds.
  function sampleMap(){
    if (!R || !AC || R.a0 == null) return;
    try {
      var ts = AC.getOutputTimestamp && AC.getOutputTimestamp();
      if (ts && ts.contextTime > 0 && ts.performanceTime > 0) {
        R.amap.push(ts.performanceTime - ts.contextTime * 1000); if (R.amap.length > 90) R.amap.shift();
        var a = R.amap.slice().sort(function(x, y){ return x - y; }), P0 = a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2;
        R.w0 = P0 + R.a0 * 1000 + R.ex.ts.ticks * R.tickMs; R.mapN = a.length;
      }
    } catch (e) {}
  }
  function frame(){
    if (!R || (R.phase !== "count" && R.phase !== "run")) return;
    var now = performance.now(); if (now - R.lastMap > 60) { R.lastMap = now; sampleMap(); }
    var T = R.ex.ts, tick = (now - R.w0) / R.tickMs;
    if (R.phase === "count" && tick >= 0) R.phase = "run";
    var cstep = T.compound ? 2 : 4;
    if (tick < 0) { var ci = -1, el0 = tick + T.ticks; R.tokens.forEach(function(t, k){ if (el0 >= t.tick) ci = k; }); if (ci !== R.lastCount && ci >= 0) { R.lastCount = ci; drawCount(ci); } }
    else if (R.lastCount !== -1) { R.lastCount = -1; drawCount(-1); }
    if (R.followOn && R.geo) { var G = R.geo, ph = G.ph; if (tick >= 0 && tick < G.total) { var pp = G.posAt(tick); ph.setAttribute("x1", pp.x); ph.setAttribute("x2", pp.x); ph.setAttribute("y1", pp.y + 25); ph.setAttribute("y2", pp.y + 92); ph.setAttribute("visibility", "visible"); } else ph.setAttribute("visibility", "hidden"); }
    if (tick >= R.endTick) { finishRun(); return; }
    raf = requestAnimationFrame(frame);
  }
  function tapDown(code, t){
    if (!R || (R.phase !== "count" && R.phase !== "run")) return;
    if (R.held[code]) return;
    t -= CAL.offset; var T = R.ex.ts, tick = (t - R.w0) / R.tickMs, tp = { down: t, up: null, code: code, tick: tick };
    toneOn("r:" + code, 261.63, 0.5, "mellow");
    R.held[code] = tp; var nb = host.querySelector("#rNow"); if (nb) nb.classList.add("on");
    if (R.phase === "run" || tick > -T.beat) R.taps.push(tp); else { tp.count = true; }   // X119: taps in the last beat of the count-in are kept (shown before the first note)
  }
  function tapUp(code, t){
    toneOff("r:" + code);
    if (!R) return; var tp = R.held[code]; if (!tp) return;
    delete R.held[code]; tp.up = t - CAL.offset;
    if (!Object.keys(R.held).length) { var nb = host.querySelector("#rNow"); if (nb) nb.classList.remove("on"); }
  }
  function abortRun(noScore){   // Backspace: stop here, what you played so far is scored as it is. Leaving full screen: just stop.
    if (!R) return; var wasCount = R.phase === "count";
    cancelAnimationFrame(raf); toneAll(); stopSched();
    if (!noScore && R.phase === "run" && R.taps.length) { finishRun(); return; }
    R.phase = "ready"; R.held = {}; var h = host; if (h) { showReady(); h.querySelector("#rMsg").innerHTML = noScore ? "The try ended because the screen left full screen." : (wasCount ? '<span class="big no">Not tried.</span> Backspace during the count-in: the same rhythm is ready again.' : "Stopped."); setBtns(); }
  }
  function failRun(why){   // X115: leaving full screen / Escape: the try is over, it counts as failed, and this rhythm is not offered again (a new one comes next). X117: once the rhythm itself had begun, the boxes of that try are shown
    if (!R || (R.phase !== "count" && R.phase !== "run")) return;
    var wasRun = R.phase === "run" && !R.warm, wasCount = R.phase === "count" && !R.warm;   // X118: leaving during the count-in is "Not tried": no attempt, no progress dot
    cancelAnimationFrame(raf); toneAll(); stopSched(); Object.keys(R.held).forEach(function(k){ tapUp(k, performance.now()); }); R.held = {};
    if (R.warm) { R.phase = "ready"; R.taps = []; R.held = {}; drawLane(); drawCount(-1); host.querySelector("#rMsg").innerHTML = "The warm-up stopped (" + esc(why) + ") Press any key to try it again."; setBtns(); return; }
    var lv = levels[R.lv], res = rResults(), r = res[lv.id] || (res[lv.id] = { tries: 0, passes: 0, best: null });
    if (!wasCount) { r.tries++; r.h2 = (r.h2 || []).concat(0).slice(-20); if (r.best == null) r.best = 0; ls("rhythm-results", JSON.stringify(res));
    evt("ss-attempt", { title: "Rhythm: " + lv.name, mode: "practice", ok: false }); }
    var S = null; if (wasRun) { try { S = score(); applyColors(S); R.score = S; R.reveal = true; R.hadResult = true; } catch (e) { S = null; } }
    R.phase = "ready"; R.needNew = R.lv > 0; R.tries = 1; if (!S) { R.colors = null; R.restColors = null; }
    drawLane(); drawCount(-1); if (S) drawStaff(); var h = host; h.querySelector("#rMsg").innerHTML = '<span class="big no">' + (wasCount ? "Not tried." : "Try failed.") + '</span> ' + esc(why) + (R.lv > 0 ? " You get a new rhythm next." : ""); h.querySelector("#rDet").textContent = "";
    h.querySelector("#rStart").style.display = R.lv > 0 ? "" : "none"; h.querySelector("#rAgain").style.display = R.lv > 0 ? "none" : ""; h.querySelector("#rNext").style.display = "none";
    var ph = R.geo && R.geo.ph; if (ph) ph.setAttribute("visibility", "hidden"); setBtns(); drawLevels();
  }
  function tryAgain(){ if (!R || !R.ex) return; if (R.afterWarm) { R.afterWarm = false; setLevel(R.lv); return; } if (R.warm && !R.ex) return; R.phase = "ready"; startRun(); }
  function startWarm(){   // one measure of four quarter notes, once per page load: it measures how far this keyboard / speaker is from the clicks
    var r = generateExercise(0, { measures: 4 }); if (!r || !r.ex) { CAL.done = true; return; }
    r.ex.measures = r.ex.measures.slice(0, 1); R.ex = r.ex; R.warm = true; R.afterWarm = false; R.tempo = 60; host.querySelector("#rTempo").textContent = 60; R.phase = "ready"; R.taps = []; R.held = {}; R.tries = 0; CAL.offset = 0;
    host.querySelector("#rTitle").innerHTML = '<b>Warm-up</b> &middot; play the four quarter notes with the clicks (this happens once on this computer)';
    R.colors = null; R.restColors = null; R.reveal = false; R.score = null; drawStaff(); showReady(); host.querySelector("#rMsg").innerHTML = 'Warm-up: you hear one measure of counting, then play the four notes. The game uses it to line up with your keyboard.'; setBtns(); drawLevels();
    var tc = host.querySelector("#rCal"); if (tc) tc.textContent = "";
  }
  function finishWarm(S){
    var h = host, d = S.res.filter(function(r){ return r.dt != null; }).map(function(r){ return r.dt; }).sort(function(a, b){ return a - b; });
    var uneven = false, med = 0;
    if (d.length >= 3) {
      med = d.length % 2 ? d[(d.length - 1) / 2] : (d[d.length / 2 - 1] + d[d.length / 2]) / 2;   // X117: the real middle (with 4 taps the old pick always took the later of the two middle ones)
      var mid = d.length >= 4 ? d.slice(1, -1) : d; uneven = (mid[mid.length - 1] - mid[0] > 110) && CAL.fails < 2;   // taps that wander by more than ~0.1 s say more about the player than the keyboard: ask once or twice more
    }
    if (d.length >= 3 && !uneven) {
      CAL.offset = Math.max(-250, Math.min(250, Math.round(med))); CAL.done = true; calSave(); R.warm = false; R.afterWarm = true;
      h.querySelector("#rMsg").innerHTML = '<span class="big okc">Warm-up done.</span> Press any key to start level ' + (R.lv + 1) + '.';
      h.querySelector("#rDet").textContent = isTeacher() ? "Teacher: your taps ran " + CAL.offset + " ms " + (CAL.offset >= 0 ? "late" : "early") + " on the warm-up; every later try is shifted by that." : "";
    } else if (uneven) {
      CAL.fails++; CAL.offset = 0; h.querySelector("#rMsg").innerHTML = 'Those four taps were uneven. Listen to the clicks and tap right with each one. Press any key to try the warm-up again.'; h.querySelector("#rDet").textContent = isTeacher() ? "Teacher: the middle taps were " + (d.length >= 4 ? d.slice(1, -1)[d.length - 3] - d[1] : 0) + " ms apart." : "";
    } else {
      CAL.fails++; CAL.offset = 0;
      if (CAL.fails >= 3) { CAL.done = true; R.warm = false; R.afterWarm = true; h.querySelector("#rMsg").innerHTML = "The warm-up could not hear enough taps, so it is skipped. Press any key to start."; }
      else h.querySelector("#rMsg").innerHTML = 'I only heard ' + d.length + ' of the 4 notes. Press any key to try the warm-up again.';
      h.querySelector("#rDet").textContent = "";
    }
    var tc = h.querySelector("#rCal"); if (tc) tc.textContent = CAL.done ? " calibration: " + (CAL.offset >= 0 ? "+" : "") + CAL.offset + " ms" : "";
    setBtns();
  }

  // ---- scoring: key DOWN against the expected note start, key UP against the expected note end ----
  // X116: which tap belongs to which note is decided for the whole try at once (the cheapest fit overall), not note by note.
  // A tap far from every note is an extra. If one tap is exactly as far from two notes, it is counted as LATE for the earlier note (students drift late far more often than early).
  function matchTaps(evs, taps, tm, close, T){
    var n = evs.length, m = taps.length, K = close, MISS = K, EX = K, INF = 1e12, i, j;
    var J1 = J(), W = evs.map(function(e, k){ var pg = k > 0 ? (e.abs - evs[k - 1].abs) * tm : (e.abs > 0 ? e.abs * tm : 2 * T.beat * tm), ng = evs[k + 1] ? (evs[k + 1].abs - e.abs) * tm : 2 * T.beat * tm; return Math.max(J1.tLit, Math.min(J1.tReal, 0.48 * Math.min(pg, ng))); });
    function cost(a, b){ var d = taps[b].down - (R.w0 + evs[a].abs * tm), ad = Math.abs(d); return ad <= W[a] ? ad + (d < 0 ? 0.5 : 0) : INF; }
    var dp = [], k2; for (i = 0; i <= n; i++) { dp.push(new Array(m + 1)); }
    for (i = 0; i <= n; i++) for (j = 0; j <= m; j++) {
      if (i === 0) { dp[i][j] = j * EX; continue; } if (j === 0) { dp[i][j] = i * MISS; continue; }
      var c = cost(i - 1, j - 1), best = dp[i - 1][j] + MISS; if (dp[i][j - 1] + EX < best) best = dp[i][j - 1] + EX; if (c < INF && dp[i - 1][j - 1] + c <= best) best = dp[i - 1][j - 1] + c; dp[i][j] = best;
    }
    var out = []; for (k2 = 0; k2 < n; k2++) out.push(-1);
    i = n; j = m;
    while (i > 0 && j > 0) {
      var cc = cost(i - 1, j - 1);
      if (cc < INF && Math.abs(dp[i][j] - (dp[i - 1][j - 1] + cc)) < 1e-6) { out[i - 1] = j - 1; i--; j--; }
      else if (Math.abs(dp[i][j] - (dp[i - 1][j] + MISS)) < 1e-6) i--;
      else j--;
    }
    return out;
  }
  function score(){
    var T = R.ex.ts, E = R.E, tm = R.tickMs, J0 = J(), close = J0.tEar, used = {}, res = [];
    var taps = R.taps.filter(function(t){ return !t.count; });
    var pts = 0, total = 0, holdN = 0, holdOk = 0, onN = 0, onOk = 0, dts = [];
    taps.sort(function(a, b){ return a.down - b.down; });
    var asg = matchTaps(E.evs, taps, tm, close, T);
    E.evs.forEach(function(e, i){
      var exp = R.w0 + e.abs * tm, best = -1, bd = 1e9;
      best = asg[i]; if (best >= 0) bd = Math.abs(taps[best].down - exp);
      var r = { i: i, onset: "miss", hold: "na", dt: null };
      total += 1; onN++;
      if (best >= 0) {
        used[best] = true; var tp = taps[best]; r.tp = tp; var dt = tp.down - exp; r.dt = Math.round(dt); tp.mi = i; dts.push(dt);
        r.de = Math.round((tp.up == null ? (R.w0 + R.endTick * tm) : tp.up) - (exp + e.ticks * tm));
        if (bd <= J0.tOn) { r.onset = "good"; pts += J0.cOn; onOk++; } else if (bd <= J0.tLit) { r.onset = "lit"; pts += J0.cLit; } else if (bd <= J0.tEar) { r.onset = "ear"; pts += J0.cEar; } else { r.onset = "real"; pts += J0.cReal; }
        if (e.ticks >= J0.holdMin || e.gapNext) {
          total += 1; holdN++;
          var up = tp.up == null ? (R.w0 + R.endTick * tm) : tp.up, expEnd = exp + e.ticks * tm, tol = Math.max(J0.holdTolMs, J0.holdTolPct / 100 * e.ticks * tm), dd = up - expEnd, ok2 = Math.abs(dd) <= tol;
          if (e.gapNext && e.ticks < J0.holdMin) ok2 = (up - exp) >= e.ticks * tm * J0.gapPct / 100 && up <= exp + e.ticks * tm + tol;
          if (ok2) { r.hold = "good"; pts += 1; holdOk++; } else r.hold = dd < 0 ? "short" : "long";
          r.dh = Math.round(dd);
        } else if (e.ticks >= J0.holdMin || e.gapNext) total += 1;
      } else if (e.ticks >= J0.holdMin || e.gapNext) total += 1;
      res.push(r);
    });
    var extra = 0; taps.forEach(function(tp, j){ if (!used[j]) { extra++; tp.extra = true; if (tp.el) tp.el.classList.add("extra"); } });
    res.forEach(function(r){ if (!r.tp) return; var e = E.evs[r.i], s0 = R.w0 + e.abs * tm + J0.tLit, s1 = R.w0 + (e.abs + e.ticks) * tm - 60;   // X120: another (extra) tap inside this note's own length: you played two notes, so it is not "correct"
      taps.forEach(function(x){ if (x.extra && x !== r.tp && x.down > s0 && x.down < s1) r.split = true; });
      if (r.split && r.onset === "good") pts -= (J0.cOn - J0.cLit); });
    pts -= extra * J0.extraPen; var ratio = total ? Math.max(0, Math.min(1, pts / total)) : 0; if (extra && ratio > J0.extraCap) ratio = J0.extraCap;   // X118: with any extra tap you can not reach 100%
    var avg = dts.length ? dts.reduce(function(a, b){ return a + b; }, 0) / dts.length : 0;
    return { res: res, ratio: ratio, pass: ratio >= J0.pass, onN: onN, onOk: onOk, holdN: holdN, holdOk: holdOk, extra: extra, avg: Math.round(avg), matched: dts.length };
  }
  var COL5 = { good: "#1a8a4a", lit: "#d89a00", ear: "#e07b00", real: "#c0392b", miss: "#c0392b" };
  var FILL5 = { good: "#d9f3e3", lit: "#fff1c7", ear: "#ffe1c2", real: "#fbdcd8", miss: "#fbdcd8" };
  function noteKind(r){ var k = r.onset; if (r.split && k === "good") k = "lit"; if (k === "good" && r.hold !== "good" && r.hold !== "na") k = "lit"; return k; }   // a good start with a wrong length is "a little off"
  function applyColors(S){
    R.colors = {}; R.restColors = {};
    S.res.forEach(function(r){ var e = R.E.evs[r.i]; r.k = noteKind(r); R.colors[e.abs] = COL5[r.k]; });
    var nowT = (performance.now() - R.w0) / R.tickMs, okN = function(i){ return S.res[i] && S.res[i].onset !== "miss"; };
    R.E.rests.forEach(function(rs){ var lo = rs.abs === 0 ? -99 : rs.abs - 0.5, endT = rs.abs + rs.ticks, bad = R.taps.some(function(tp){ if (tp.count) return false; var tk = (tp.down - R.w0) / R.tickMs; return tp.extra && tk >= lo && tk < endT - 0.5; });   // X117: a stray tap before the very first beat counts against a rest on beat 1
      var bi = -1, ai = -1; R.E.evs.forEach(function(e, i){ if (e.abs < rs.abs) bi = i; else if (e.abs >= endT && ai < 0) ai = i; });
      var ok = nowT >= endT - 0.01 && (bi >= 0 || ai >= 0) && (bi < 0 || okN(bi)) && (ai < 0 || okN(ai));   // X120: a rest is "correct" only if the exercise got that far and the notes on both sides were at least partly right; otherwise it is left grey
      R.restColors[rs.abs] = bad ? COL5.miss : (ok ? COL5.good : "#8a8a8a"); });
  }
  function finishRun(){
    cancelAnimationFrame(raf); toneAll(); stopSched(); if (!R) return;
    Object.keys(R.held).forEach(function(k){ tapUp(k, performance.now()); });
    R.phase = "done"; R.doneAt = performance.now(); var S = score(), h = host, lv = levels[R.lv]; R.needNew = !!S.pass;
    var teacher = isTeacher();
    applyColors(S);
    R.hadResult = true; R.score = S; R.reveal = true; drawLane(); drawStaff();
    if (R.warm || R.afterWarm) { finishWarm(S); h.querySelector("#rStart").style.display = "none"; h.querySelector("#rAgain").style.display = "none"; h.querySelector("#rNext").style.display = "none"; var ph0 = h.querySelector("#rPh"); if (ph0) ph0.style.display = "none"; R.geo.ph.setAttribute("visibility", "hidden"); drawCount(-1); R.needNew = false; return; }   // the warm-up is not a scored try
    // the written notes turn green / yellow / red, and the boxes (should play) and bars (you played) sit directly under them
    var pct = S.ratio >= 1 ? 100 : Math.min(99, Math.floor(S.ratio * 100));   // X118: 100% only when nothing is off
    h.querySelector("#rMsg").innerHTML = S.pass ? '<span class="big okc">Got it! ' + pct + '%</span>' + (cleared(lv) ? ' <b>Level cleared!</b>' : "") : '<span class="big no">Not yet. ' + pct + '%</span>';
    var bits = [];   // X120: the three count lines were removed
    if (S.matched >= 3 && Math.abs(S.avg) >= 40) { var aa = Math.abs(S.avg); bits.push("You were <b>" + (aa < 80 ? "a little" : aa < 150 ? "a bit" : "quite") + " " + (S.avg > 0 ? "late" : "early") + "</b> on average."); }   // X121: plain words instead of milliseconds
    h.querySelector("#rDet").innerHTML = bits.join("<br>");
    var res = rResults(), r = res[lv.id] || (res[lv.id] = { tries: 0, passes: 0, best: null });
    r.tries++; if (S.pass) r.passes++; { r.h2 = (r.h2 || []).concat(S.pass ? 2 : (S.ratio >= J().yellow ? 1 : 0)).slice(-20); } if (r.best == null || S.ratio > r.best) r.best = S.ratio; ls("rhythm-results", JSON.stringify(res));
    evt("ss-attempt", { title: "Rhythm: " + lv.name, mode: "practice", ok: S.pass });
    h.querySelector("#rStart").style.display = "none"; h.querySelector("#rAgain").style.display = ""; h.querySelector("#rNext").style.display = (R.lv < levels.length - 1 && allowedLevel(R.lv + 1)) ? "" : "none";
    setBtns();
    drawLevels();
    var ph = h.querySelector("#rPh"); if (ph) ph.style.display = "none"; R.geo.ph.setAttribute("visibility", "hidden"); drawCount(-1);
  }
  window.ssRhythmTest = { score: function(){ return R && R.ex ? score() : null; }, state: function(){ return R; }, levels: function(){ return levels; }, setLevel: function(i){ setLevel(i); }, newExercise: function(){ newExercise(); } };

  // =====================================================================
  // SONGS: the teacher's Workbook song drawn with VexFlow + a virtual keyboard (mouse, touch, computer keys)
  // =====================================================================
  var NOTE_NAMES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
  var WHITE_IN_OCT = [0, 2, 4, 5, 7, 9, 11], BLACK_AFTER = { 0: 1, 2: 3, 5: 6, 7: 8, 9: 10 };   // semitone offsets in an octave
  // the home row plays the WHITE keys (A S D F G H J K L ; '), the row above plays the black keys that sit between them (W E R T Y U I O P [ ])
  var WH_CODES = ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote"], WH_LAB = ["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"];
  var BL_CODES = ["KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight"], BL_LAB = ["W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"];
  function midiOfKey(k){   // "f#/4" -> 66 ; "bb/3" -> 58
    var m = /^([a-g])(#{1,2}|b{1,2}|n)?\/(-?\d+)$/.exec(String(k || "").toLowerCase()); if (!m) return null;
    var base = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[m[1]], acc = m[2] ? (m[2][0] === "#" ? m[2].length : m[2][0] === "b" ? -m[2].length : 0) : 0;
    return 12 * (Number(m[3]) + 1) + base + acc;
  }
  function freqOf(midi){ return 440 * Math.pow(2, (midi - 69) / 12); }
  var SG = null;
  function songBeats(n){ var b = { w: 4, h: 2, q: 1, "8": 0.5, "16": 0.25 }[String(n.d)] || 1; return n.dot ? b * 1.5 : b; }
  // X117: piano note names are a helper that is OFF everywhere (students and test computers). Only the teacher preview in the panel has a checkbox for it.
  function nmOn(){ return !!(PREVIEWISH && lg("songs-names") === "1"); }
  function songList(){ return (SC().songs || []).filter(function(s){ return s && s.notes && s.notes.length; }); }

  function todayStr(){ var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function dstr(v){ var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v || "")); return m ? m[0] : ""; }
  function songStatus(s, today){ var due = dstr(s.due), st = dstr(s.start); if (due && due < today) return { cls: "late", txt: "past due" }; if (due && (!st || st <= today)) return { cls: "now", txt: "current" }; if (!due && st && st <= today && s.ui === SC().songsCur) return { cls: "now", txt: "current" }; return null; }
  // the current unit's extra songs are greyed out until the teacher PIN unlocks them (for today); extras of earlier units are open
  function songLocked(s){ return !!s.extra && s.ui === SC().songsCur && lg("songs-unlock") !== todayStr(); }
  function openSongs(){
    var list = songList(); if (!list.length) return;
    var body = openHost("songs", "Songs", '<span class="ctl" id="sMidi"></span>' + (PREVIEWISH ? '<label class="ctl" title="Teacher preview only: students and test computers never show note names"><input type="checkbox" id="sNm"> Show note names on the keys (helper)</label>' : ""));
    body.innerHTML = '<div class="ssg-side" id="sList"></div><div class="ssg-main" style="padding-bottom:6px"><div class="ssg-sub" id="sTitle"></div><div class="ssg-staff" id="sStaff"></div><div class="ssg-sub" id="sHelp">Use your keyboard, a touch-screen, or a connected digital piano to play</div><div class="ssg-sub" id="sHelp2" style="color:#a35a00"></div><div class="ssg-kb" id="sKb"></div></div>';
    SG = { song: null, down: {}, ptr: {}, keys: {}, midi: null, map: {}, win: 0, whites: [] };
    var h = host;
    var nmBox = h.querySelector("#sNm"); if (nmBox) { nmBox.checked = nmOn(); nmBox.onchange = function(){ ls("songs-names", this.checked ? "1" : "0"); if (SG && SG.song) { drawKeyboard(); markKeys(); try { sizeKb(); } catch (e) {} } }; }
    var lastUnit = null, today = todayStr();
    h.querySelector("#sList").innerHTML = list.map(function(s, i){ var hd = ""; if (s.unitId !== lastUnit) { lastUnit = s.unitId; hd = '<div class="ssg-grp">' + esc(s.unit || "Songs") + '</div>'; }
      var st = songStatus(s, today), lk = songLocked(s);
      return hd + '<button type="button" class="ssg-item' + (lk ? " lk" : "") + '" data-i="' + i + '">' + (lk ? '&#128274; ' : "") + esc(s.title || ("Song " + (i + 1))) + '<small>' + (st ? '<span class="bdg ' + st.cls + '">' + st.txt + '</span> ' : "") + (s.extra ? "extra &middot; " : "") + esc(s.time || "") + (s.key ? " &middot; key of " + esc(s.key) : "") + '</small></button>'; }).join("");
    [].forEach.call(h.querySelectorAll("#sList [data-i]"), function(b){ b.onclick = function(){ var sg = list[+b.getAttribute("data-i")]; if (songLocked(sg)) { if (window.ssTeacherGate) window.ssTeacherGate(function(){ ls("songs-unlock", todayStr()); openSongs(); }); return; } pickSong(sg, +b.getAttribute("data-i")); }; });
    var kd = function(ev){
      if (!host || host.getAttribute("data-game") !== "songs") return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (SG.whites && SG.whites.length > 11 && (ev.code === "ArrowLeft" || ev.code === "ArrowRight")) { ev.preventDefault(); ev.stopPropagation(); if (!ev.repeat) { SG.win = Math.max(0, Math.min(SG.whites.length - 11, SG.win + (ev.code === "ArrowRight" ? 1 : -1))); markKeys(); } return; }
      var midi = SG.map && SG.map[ev.code]; if (midi == null) return;
      ev.preventDefault(); ev.stopPropagation(); if (ev.repeat) return;
      SG.down[ev.code] = midi; press(midi, "k:" + ev.code);
    };
    var ku = function(ev){ if (!host || host.getAttribute("data-game") !== "songs") return; var m = SG.down[ev.code]; if (m == null) return; ev.preventDefault(); ev.stopPropagation(); delete SG.down[ev.code]; release(m, "k:" + ev.code); };
    window.addEventListener("keydown", kd, true); window.addEventListener("keyup", ku, true);
    var rz = function(){ try { sizeKb(); } catch (e) {} }; window.addEventListener("resize", rz); try { var kbm = host.querySelector("#sKb").parentNode; var ro = new ResizeObserver(rz); ro.observe(kbm); ro.observe(host.querySelector("#sStaff")); var cl1 = cleanup; } catch (e) {}
    cleanup = function(){ window.removeEventListener("resize", rz); window.removeEventListener("keydown", kd, true); window.removeEventListener("keyup", ku, true); try { if (SG && SG.midi) SG.midi.inputs.forEach(function(i){ i.onmidimessage = null; }); } catch (e) {} SG = null; };
    // MIDI is off for now (no permission pop-up for students); setupMidi() is kept for later
    var last = Number(lg("songs-last") || 0); if (!(last >= 0 && last < list.length)) last = 0;
    pickSong(list[last], last);
  }
  function setupMidi(){
    var el = host.querySelector("#sMidi"), my = SG;
    if (!navigator.requestMIDIAccess) return;
    navigator.requestMIDIAccess().then(function(acc){
      if (SG !== my) return; my.midi = acc;
      function wire(){ var n = 0; acc.inputs.forEach(function(inp){ n++; inp.onmidimessage = function(ev){
        var d = ev.data; if (!d || d.length < 2 || !SG) return; var st = d[0] & 0xf0, note = d[1], vel = d.length > 2 ? d[2] : 0;
        if (st === 0x90 && vel > 0) { if (SG.keys[note]) press(note, "m:" + note); else toneOn("s:m:" + note, freqOf(note), 0.5, "mellow"); }
        else if (st === 0x80 || (st === 0x90 && vel === 0)) { release(note, "m:" + note); }
      }; }); if (el) el.textContent = n ? "\u266B Piano connected" : ""; }
      wire(); acc.onstatechange = wire;
    }).catch(function(){});
  }
  function press(midi, id){
    toneOn("s:" + id, freqOf(midi), 0.5, "mellow");
    var el = host && host.querySelector('#sKb [data-m="' + midi + '"]'); if (el) el.classList.add("down");
  }
  function release(midi, id){
    toneOff("s:" + id);
    var el = host && host.querySelector('#sKb [data-m="' + midi + '"]'); if (el) el.classList.remove("down");
  }
  function pickSong(s, i){
    SG.song = s; ls("songs-last", String(i));
    [].forEach.call(host.querySelectorAll("#sList [data-i]"), function(b){ b.classList.toggle("on", +b.getAttribute("data-i") === i); });
    host.querySelector("#sTitle").innerHTML = '<b style="font-size:20px;color:#2a2170">' + esc(s.title || "Song") + '</b>';
    evt("ss-question", { title: "Song: " + (s.title || "song"), mode: "practice" });
    var lo = 200, hi = 0, allN = (s.ex ? (s.ex.notes || []).concat(s.ex.notesL || []) : s.notes); allN.forEach(function(n){ if (n.rest) return; var m = midiOfKey(Array.isArray(n.k) ? n.k[0] : n.k); if (m != null) { lo = Math.min(lo, m); hi = Math.max(hi, m); } });
    if (lo > hi) { lo = 60; hi = 72; }
    var isBlack = function(m){ return [1, 3, 6, 8, 10].indexOf(((m % 12) + 12) % 12) >= 0; };
    var kLo = lo - 4, kHi = hi + 4; while (kLo % 12 !== 0) kLo--; while (kHi % 12 !== 11) kHi++;   // X115: the song's range plus a generous cushion, from a C up to a B, so you can see where each key sits in the pattern of the piano
    while (kHi - kLo < 23) kHi += 12;
    SG.kbLo = kLo; SG.kbHi = kHi; SG.lo = lo; SG.hi = hi;
    SG.win = 0; (function(){ var wl = []; for (var q = kLo; q <= kHi; q++) if (!isBlack(q)) wl.push(q); var first = 0; for (var z = 0; z < wl.length; z++) if (wl[z] >= lo) { first = z; break; } SG.win = Math.max(0, Math.min(wl.length - 11, first - 1)); })();
    SG.keys = {}; for (var mm = kLo; mm <= kHi; mm++) SG.keys[mm] = true;
    drawScore(s); drawKeyboard(); markKeys(); setTimeout(function(){ try { sizeKb(); } catch (e) {} }, 60);
  }
  function drawKeyboard(){
    var kb = host.querySelector("#sKb"), whites = [], i, h = "";
    for (var m0 = SG.kbLo; m0 <= SG.kbHi; m0++) if (WHITE_IN_OCT.indexOf(((m0 % 12) + 12) % 12) >= 0) whites.push(m0);
    SG.whites = whites; var n = whites.length, w = 100 / n;
    whites.forEach(function(m, i){ h += '<div class="wk' + (m % 12 === 0 ? " c" + (Math.floor(m / 12) - 1) : "") + '" data-m="' + m + '" style="left:' + (i * w) + '%;width:' + w + '%"><u class="nm">' + (nmOn() ? "CDEFGAB"[[0, 2, 4, 5, 7, 9, 11].indexOf(((m % 12) + 12) % 12)] + (m % 12 === 0 ? (Math.floor(m / 12) - 1) : "") : "") + '</u><span></span></div>'; });
    whites.forEach(function(m, i){ var off = m % 12; if (BLACK_AFTER[off] != null && i < n - 1 && whites[i + 1] === m + 2) h += '<div class="bk" data-m="' + (m + 1) + '" style="left:' + ((i + 1) * w - w * 0.3) + '%;width:' + (w * 0.6) + '%"><span></span></div>'; });
    kb.innerHTML = h; sizeKb();
    var down = function(ev){ var k = ev.target.closest && ev.target.closest("[data-m]"); if (!k) return; ev.preventDefault(); var m = +k.getAttribute("data-m"), id = "p:" + ev.pointerId; SG.ptr[ev.pointerId] = m; press(m, id); try { kb.setPointerCapture(ev.pointerId); } catch (e) {} };
    var up = function(ev){ var m = SG.ptr[ev.pointerId]; if (m == null) return; delete SG.ptr[ev.pointerId]; release(m, "p:" + ev.pointerId); };
    kb.addEventListener("pointerdown", down); kb.addEventListener("pointerup", up); kb.addEventListener("pointercancel", up);
    kb.addEventListener("pointermove", function(ev){   // sliding a finger or the mouse over keys plays them
      var m0 = SG.ptr[ev.pointerId]; if (m0 == null) return;
      var el = document.elementFromPoint(ev.clientX, ev.clientY), k = el && el.closest && el.closest("#sKb [data-m]"); if (!k) return; var m = +k.getAttribute("data-m");
      if (m !== m0) { release(m0, "p:" + ev.pointerId); SG.ptr[ev.pointerId] = m; press(m, "p:" + ev.pointerId); }
    });
  }
  function sizeKb(){   // X115: as tall as fits, up to the height of a real piano key (about 6.4 times its width)
    if (!host) return; var kb = host.querySelector("#sKb"), main = kb && kb.parentNode; if (!kb || !main || !SG) return;
    var kw = kb.clientWidth / Math.max(1, kb.querySelectorAll(".wk").length), ideal = Math.round(kw * 6.4), used = 0;
    [].forEach.call(main.children, function(c){ if (c !== kb) used += c.offsetHeight + 8; });
    var avail = main.clientHeight - used - 34;   /* X116: leaves a little room under the keys */
    kb.style.height = Math.max(150, Math.min(ideal, avail)) + "px";
  }
  function markKeys(){   // the letters that play each key right now
    if (!host) return; var kb = host.querySelector("#sKb"); if (!kb) return;
    [].forEach.call(kb.querySelectorAll("[data-m] > span"), function(s){ s.textContent = ""; });
    SG.map = {}; var W = SG.whites, k;
    for (k = 0; k < 11; k++) { var wm = W[SG.win + k]; if (wm == null) break; var lab = kb.querySelector('[data-m="' + wm + '"] > span'); SG.map[WH_CODES[k]] = wm; if (lab) lab.textContent = WH_LAB[k];
      var nx = W[SG.win + k + 1]; if (k < 10 && nx === wm + 2) { var bm = wm + 1; SG.map[BL_CODES[k]] = bm; var bl = kb.querySelector('[data-m="' + bm + '"] > span'); if (bl) bl.textContent = BL_LAB[k]; } }
    var hp = host.querySelector("#sHelp2"); if (hp) var span = 0; W.forEach(function(m){ if (m >= SG.lo && m <= SG.hi) span++; }); hp.textContent = W.length > 11 ? (span > 11 ? "This song is wider than the letter keys: press the left and right arrow keys to slide the letters along the piano." : "Left and right arrow keys move the letters along the piano.") : ""; hp.style.color = span > 11 ? "#a35a00" : "#8a8aa0";
    var c4 = kb.querySelector('[data-m="60"]'); if (c4) c4.title = "middle C";
  }
  function wbCss(){
    if (document.getElementById("ssgWbCss")) return; var st = document.createElement("style"); st.id = "ssgWbCss";
    st.textContent = ".ssg-wbl{zoom:1.55;width:700px;max-width:100%;margin:6px auto 0;color:#000;font-family:Arial,Helvetica,sans-serif}.ssg-wbl .wb-inst{font-size:12px;font-style:italic;text-align:center;margin:0 0 6px}" +
      ".wb-cells{margin-top:8px;}.wb-free .wb-mg,.wb-free .wb-mg.wb-end{border-right:none;padding-right:0;margin-right:0;}.wb-icons{margin-top:8px;}.wb-icons svg{overflow:visible;}.wb-restdash{display:inline-block;width:26px;height:0;border-top:6px solid #111;border-radius:3px;vertical-align:middle;}" +
      ".wb-cell{position:relative;flex:0 0 46px;width:46px;height:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;}.wb-cline{display:flex;margin:0 0 calc(14px + var(--sysgap,0px));}.wb-icons>svg{margin-bottom:var(--sysgap,0px);}" +
      ".wb-ngl{justify-content:center;flex-wrap:nowrap;}.wb-ng{display:flex;margin-right:0;flex:0 0 auto;}.wb-ngl .wb-cell{flex:0 0 40px !important;width:40px !important;}.wb-cells .wb-cline:last-child{margin-bottom:0;}" +
      ".wb-mg{display:flex;border-right:1.5px solid #000;padding-right:4px;margin-right:4px;}.wb-mg.wb-end{border-right:4px double #000;}.wb-full .wb-mg{flex:1 1 0;}.wb-full .wb-cell{flex:1 1 0;}" +
      ".wb-cell b{font-size:26px;line-height:1;font-weight:bold;white-space:nowrap;}.wb-cell.wb-ac{flex:0 0 58px;width:58px;}.wb-ngl .wb-cell.wb-ac{flex:0 0 56px !important;width:56px !important;}.wb-full .wb-cell.wb-ac{flex:1.3 1 0;}" +
      ".wb-acc{font-family:'Segoe UI Symbol','Arial Unicode MS','Apple Symbols',Arial,sans-serif;font-weight:bold;font-size:.78em;margin-left:3px;position:relative;top:-.08em;}.wb-cell i{font-style:normal;font-size:11px;min-height:13px;color:#222;}";
    document.head.appendChild(st);
  }
  function drawScore(s){ window.__wbFail = ""; try { drawScore0(s); } finally { songDiag(s); } }
  function songDiag(s){ var el0 = host.querySelector("#sStaff"); if (!el0) return;
    try { var dg = host.querySelector("#sDiag"); if (!dg) { dg = document.createElement("div"); dg.id = "sDiag"; dg.style.cssText = "font:11px sans-serif;color:#8a5a08;margin:2px 0;"; el0.parentNode.insertBefore(dg, el0.nextSibling); }
      var e = s.ex, nc = el0.querySelectorAll(".wb-cell").length;
      dg.textContent = isTeacher() ? "Teacher note: display = " + (e ? (e.display || "(none)") : "(no worksheet published)") + ", layout = " + (e ? (e.layout || "(none)") : "-") + ", cellRows = " + (e && e.cellRows ? JSON.stringify(e.cellRows) : "(none)") + ", notes " + (e && e.notes ? e.notes.length : 0) + "/" + (e && e.notesL ? e.notesL.length : 0) + ", letter cells drawn = " + nc + (window.__wbFail ? ", problem: " + window.__wbFail : "") + (typeof WBX === "undefined" ? ", drawing code missing" : (WBX.drawCells ? "" : ", letters drawing NOT in this site file")) : ""; } catch (e0) {} }
  function drawScore0(s){
    var el0 = host.querySelector("#sStaff");

    if (s.ex && typeof WBX !== "undefined" && WBX.drawCells && (s.ex.display === "names" || s.ex.display === "fingers" || s.ex.display === "icons")) {   // X117: a worksheet shown as letters / finger numbers / pictures looks the same here
      try {
        wbCss(); el0.innerHTML = ""; var wrap = document.createElement("div"); wrap.className = "ssg-wbl"; var inner = document.createElement("div"); inner.className = "wbpage"; wrap.appendChild(inner); el0.appendChild(wrap);
        WBX.drawCells(inner, JSON.parse(JSON.stringify(s.ex)));
        var ins = s.ex.hideInst ? "" : String(s.ex.instructions || ""); if (ins) { var di = document.createElement("div"); di.className = "wb-inst"; di.textContent = ins; wrap.insertBefore(di, inner); }
        if (inner.querySelector(".wb-cell, svg")) return;
      } catch (e) { console.warn("Workbook letters layout failed, using the staff", e); window.__wbFail = "the Workbook letters drawing failed: " + String(e && e.message || e).slice(0, 120); }
    }
    if (s.ex && window.VexFlow && typeof WBX !== "undefined") {
      try { el0.innerHTML = ""; var res = WBX.renderScore(el0, JSON.parse(JSON.stringify(s.ex)), { width: 720 }); var sv = el0.querySelector("svg"); if (sv) { sv.style.maxWidth = "100%"; sv.style.height = "auto"; } if (el0.querySelector("svg")) return; } catch (e) { console.warn("Workbook renderer failed, using the simple one", e); window.__wbFail = "the Workbook drawing code failed: " + String(e && e.message || e).slice(0, 120); }
    }
    var why = !s.ex ? "this song has no worksheet data in the published settings" : typeof WBX === "undefined" ? "student-games.js on the site is older than the Workbook drawing code" : (window.__wbFail || "the Workbook drawing code reported a problem");
    var VF = window.VexFlow, el = host.querySelector("#sStaff"); el.innerHTML = "";
    if (!VF) { el.textContent = "The music drawing code did not load."; return; }
    var parts = String(s.time || "4/4").split("/"), free = s.time === "free" || parts.length < 2, num = free ? 4 : (+parts[0] || 4), den = free ? 4 : (+parts[1] || 4), cap = num * 4 / den;
    var clef = s.clef === "bass" ? "bass" : "treble", keySig = s.key || "C", rows = [], measures = [], cur = [], beats = 0;
    s.notes.forEach(function(n){
      var b = songBeats(n); if (beats + b > cap + 0.001 && cur.length) { measures.push(cur); cur = []; beats = 0; }
      if (n.br && cur.length) { measures.push(cur); cur = []; beats = 0; }
      cur.push(n); beats += b; if (beats >= cap - 0.001) { measures.push(cur); cur = []; beats = 0; }
    });
    if (cur.length) measures.push(cur);
    var per = 4; for (var i = 0; i < measures.length; i += per) rows.push(measures.slice(i, i + per));
    var rowH = 150, W = 1000, H = rows.length * rowH + 20;
    var renderer = new VF.Renderer(el, VF.Renderer.Backends.SVG); renderer.resize(W, H); var ctx = renderer.getContext(), svg = el.querySelector("svg");
    if (svg) { svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.removeAttribute("width"); svg.removeAttribute("height"); svg.style.width = "100%"; svg.style.height = "auto"; }
    var all = [];
    rows.forEach(function(row, r){
      var x = 10, y = 20 + r * rowH, widths = row.map(function(m){ return Math.max(110, m.length * 46); }), extra = 60 + (r === 0 ? 40 : 0) + (keySig !== "C" ? 28 : 0), sum = widths.reduce(function(a, b){ return a + b; }, 0), scale = (W - 20 - extra) / sum;
      row.forEach(function(ms, mi){
        var w = widths[mi] * scale + (mi === 0 ? extra : 0), stave = new VF.Stave(x, y, w);
        if (mi === 0) { stave.addClef(clef); try { if (keySig !== "C") stave.addKeySignature(keySig); } catch (e) {} if (r === 0 && !free) stave.addTimeSignature(num + "/" + den); }
        stave.setContext(ctx).draw(); x += w;
        var notes = ms.map(function(n){
          var rest = !!n.rest, dur = String(n.d || "q"), key = rest ? (clef === "bass" ? "d/3" : "b/4") : (n.k || "c/4");
          var sn; try { sn = new VF.StaveNote({ clef: clef, keys: [key], duration: dur + (rest ? "r" : ""), dots: n.dot ? 1 : 0 }); } catch (e) { sn = new VF.StaveNote({ clef: clef, keys: ["b/4"], duration: dur + "r" }); }
          if (n.dot) { try { VF.Dot.buildAndAttach([sn], { all: true }); } catch (e) {} }
          if (n.fing && !rest) { try { sn.addModifier(new VF.FretHandFinger(String(n.fing)).setPosition(VF.Modifier.Position.ABOVE), 0); } catch (e) {} }
          if (n.lyric) { try { var an = new VF.Annotation(String(n.lyric)); an.setVerticalJustification(VF.Annotation.VerticalJustify.BOTTOM); sn.addModifier(an, 0); } catch (e) {} }
          all.push({ n: n, sn: sn }); return sn;
        });
        try {
          var voice = new VF.Voice({ numBeats: num, beatValue: den }).setMode(VF.Voice.Mode.SOFT); voice.addTickables(notes);
          try { VF.Accidental.applyAccidentals([voice], keySig); } catch (e) {}
          var beams = []; try { beams = VF.Beam.generateBeams(notes); } catch (e) {}
          new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave); voice.draw(ctx, stave); beams.forEach(function(b){ b.setContext(ctx).draw(); });
        } catch (e) { console.warn("song bar failed", e); }
      });
    });
    if (isTeacher()) { var nt = document.createElement("div"); nt.className = "ssg-sub"; nt.style.cssText = "color:#a35a00;font-size:12px"; nt.textContent = "Teacher note: the simple music view is showing because " + why + "."; el.appendChild(nt); }
    for (var k = 0; k < all.length - 1; k++) if (all[k].n.tie && !all[k].n.rest) { try { new VF.StaveTie({ firstNote: all[k].sn, lastNote: all[k + 1].sn, firstIndexes: [0], lastIndexes: [0] }).setContext(ctx).draw(); } catch (e) {} }
  }
  window.ssSongsTest = { midiOfKey: midiOfKey };

  // =====================================================================
  window.STUDENT_READY.then(function(){ try { loadLevels(); } catch (e) { console.warn("rhythm levels", e); } watch(); });
})();
