/* student-games.js (X110, c13, 19 Nov 2026). Two extra games for the student site, loaded by student-ui.js:
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
  function blip(t, freq, dur, vol, type){
    var c = audio(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain(); o.type = type || "sine"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.03);
  }
  var tones = {};   // id -> {o, g}: a tone that lasts as long as the key is down
  function toneOn(id, freq, vol, kind){
    var c = audio(); if (!c || tones[id]) return;
    var o = c.createOscillator(), o2 = null, g = c.createGain(), t = c.currentTime;
    o.type = kind === "piano" ? "triangle" : "square"; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
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

  var CSS = ".ssg { position: fixed; top: 8px; left: 8px; right: 8px; bottom: 8px; z-index: 90; background: #fff; border: 3px solid #3a2f8f; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; color: #1d1b2e; font-family: inherit; }" +
    "body.ss-on .ssg { right: 360px; }" +
    ".ssg-h { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 8px 12px; background: #f4f2ff; border-bottom: 2px solid #d9d4ff; } .ssg-h b.t { font-size: 20px; color: #2a2170; } .ssg-h .sp { flex: 1; } .ssg-h label, .ssg-h .ctl { font-size: 13px; font-weight: 700; color: #3a2f8f; display: inline-flex; gap: 4px; align-items: center; }" +
    ".ssg-b { flex: 1; min-height: 0; display: flex; } .ssg-side { width: 210px; flex: none; overflow-y: auto; border-right: 2px solid #eee; padding: 8px; display: flex; flex-direction: column; gap: 5px; }" +
    ".ssg-main { flex: 1; min-width: 0; overflow-y: auto; padding: 10px 14px; display: flex; flex-direction: column; gap: 8px; }" +
    ".ssg-btn { font: inherit; font-weight: 700; border: 2px solid #3a2f8f; background: #fff; color: #3a2f8f; border-radius: 10px; padding: 6px 14px; cursor: pointer; border-bottom-width: 4px; } .ssg-btn.primary { background: #3a2f8f; color: #fff; } .ssg-btn.sm { padding: 1px 8px; border-bottom-width: 2px; } .ssg-btn:disabled { opacity: .45; cursor: default; }" +
    ".ssg-item { text-align: left; font: inherit; font-weight: 700; font-size: 14px; border: 2px solid #ddd; background: #fff; border-radius: 10px; padding: 6px 9px; cursor: pointer; color: #2a2170; } .ssg-item.on { border-color: #3a2f8f; background: #f4f2ff; } .ssg-item small { display: block; font-weight: 600; color: #777; } .ssg-item .ok { color: #1a8a4a; }" +
    ".ssg-staff { border: 2px solid #eee; border-radius: 12px; padding: 4px 8px; background: #fff; position: relative; } .ssg-staff svg { display: block; width: 100%; height: auto; max-height: 300px; }" +
    ".ssg-count { min-height: 54px; display: flex; gap: 14px; align-items: center; justify-content: center; font-size: 40px; font-weight: 800; color: #bbb; } .ssg-count span.on { color: #3a2f8f; transform: scale(1.25); } .ssg-count span { transition: transform .08s; } .ssg-count small { font-size: 15px; color: #777; font-weight: 700; }" +
    ".ssg-lane { position: relative; height: 112px; border: 2px solid #eee; border-radius: 12px; background: #fafafa; overflow: hidden; } .ssg-lane .cin { position: absolute; top: 0; bottom: 0; background: #eceaff; } .ssg-lane .bl { position: absolute; top: 0; bottom: 0; width: 1px; background: #e2e2e2; } .ssg-lane .ml { background: #bbb; width: 2px; }" +
    ".ssg-lane .ex { position: absolute; top: 10px; height: 34px; border: 2px solid #8a85c0; background: #fff; border-radius: 6px; box-sizing: border-box; font-size: 11px; font-weight: 800; text-align: center; line-height: 30px; overflow: hidden; white-space: nowrap; } .ssg-lane .ex.rest { top: 20px; height: 14px; border: 1px dashed #ccc; background: none; }" +
    ".ssg-lane .ex.good { border-color: #1a8a4a; background: #d9f3e3; } .ssg-lane .ex.close { border-color: #d89a00; background: #fff1c7; } .ssg-lane .ex.miss { border-color: #c0392b; background: #fbdcd8; }" +
    ".ssg-lane .ac { position: absolute; top: 56px; height: 30px; border-radius: 6px; background: #3a7bd5; opacity: .85; box-sizing: border-box; } .ssg-lane .ac.extra { background: #c0392b; } .ssg-lane .ph { position: absolute; top: 0; bottom: 0; width: 3px; background: #e9a31a; z-index: 3; }" +
    ".ssg-lane .lab { position: absolute; bottom: 3px; font-size: 11px; font-weight: 700; color: #555; transform: translateX(-50%); white-space: nowrap; }" +
    ".ssg-msg { font-size: 17px; font-weight: 700; min-height: 26px; } .ssg-msg .big { font-size: 28px; } .ssg-msg .okc { color: #1a8a4a; } .ssg-msg .no { color: #c0392b; } .ssg-sub { font-size: 14px; color: #555; font-weight: 600; line-height: 1.5; }" +
    ".ssg-pad { border: 3px dashed #3a2f8f; border-radius: 14px; padding: 14px; text-align: center; font-weight: 800; color: #3a2f8f; background: #f4f2ff; cursor: pointer; user-select: none; touch-action: none; } .ssg-pad.down { background: #3a2f8f; color: #fff; }" +
    ".ssg-btns { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }" +
    ".ssg-kb { position: relative; height: 170px; user-select: none; touch-action: none; margin-top: auto; flex: none; } .ssg-kb .wk { position: absolute; top: 0; bottom: 0; border: 1px solid #555; background: #fff; border-radius: 0 0 6px 6px; box-sizing: border-box; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 6px; font-size: 12px; font-weight: 800; color: #3a2f8f; } .ssg-kb .bk { position: absolute; top: 0; height: 62%; background: #222; border-radius: 0 0 5px 5px; z-index: 2; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 5px; font-size: 11px; font-weight: 800; color: #fff; box-sizing: border-box; } .ssg-kb .wk.down { background: #cfe3ff; } .ssg-kb .bk.down { background: #3a7bd5; } .ssg-kb .c4 { background: #f7f4ff; }" +
    "@media (max-width: 900px) { .ssg-side { width: 150px; } }";
  function ensureCss(){ if (document.getElementById("ssgCss")) return; var st = document.createElement("style"); st.id = "ssgCss"; st.textContent = CSS; document.head.appendChild(st); }

  var host = null, cleanup = null, closeCb = null;
  function openHost(id, title, extraHead){
    closeHost();
    ensureCss();
    host = document.createElement("div"); host.className = "ssg"; host.id = "ssgHost"; host.setAttribute("data-game", id);
    host.innerHTML = '<div class="ssg-h"><button type="button" class="ssg-btn sm" id="ssgBack">&larr; Back to games</button><b class="t">' + esc(title) + '</b><span class="sp"></span>' + (extraHead || "") + '</div><div class="ssg-b" id="ssgBody"></div>';
    document.body.appendChild(host);
    window.ssExtGame.on = true; window.ssExtGame.id = id;
    host.querySelector("#ssgBack").onclick = closeHost;
    return host.querySelector("#ssgBody");
  }
  function closeHost(){
    if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
    toneAll();
    if (host) { host.remove(); host = null; }
    window.ssExtGame.on = false; window.ssExtGame.id = "";
  }
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
    try { new MutationObserver(function(){ clearTimeout(obsT); obsT = setTimeout(injectCards, 30); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
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
  function rResults(){ return jget("rhythm-results", {}); }
  function allowedLevel(i){ return true; }   // later: the teacher's computer can send each paired Chromebook the levels it may use
  var NAMES_SIMPLE = { 4: ["1", "2", "3", "4"], 3: ["1", "2", "3"] }, NAMES_68 = ["1", "+", "a", "2", "+", "a"];
  function tickMsOf(T, bpm){ return 60000 / (bpm * T.beat); }

  function openRhythm(){
    if (!window.VexFlow) { alert("The music drawing code did not load. Reload the page."); return; }
    if (!levels.length) loadLevels();
    var body = openHost("rhythm", "Rhythm", '<label title="A click on every beat while you play (the count-in always clicks)"><input type="checkbox" id="rClick" ' + (lg("rhythm-click") === "0" ? "" : "checked") + '> Click while I play</label>' +
      '<span class="ctl">Tempo <button type="button" class="ssg-btn sm" id="rSlow">&minus;</button><b id="rTempo"></b><button type="button" class="ssg-btn sm" id="rFast">+</button></span>' +
      '<span class="ctl" title="If you always tap late, press + ; if early, press &minus;">Sync <button type="button" class="ssg-btn sm" id="rSyncM">&minus;</button><b id="rSync"></b> ms <button type="button" class="ssg-btn sm" id="rSyncP">+</button></span>');
    body.innerHTML = '<div class="ssg-side" id="rLevels"></div><div class="ssg-main"><div class="ssg-sub" id="rTitle"></div><div class="ssg-staff" id="rStaff"></div><div class="ssg-count" id="rCount"></div><div class="ssg-lane" id="rLane"></div>' +
      '<div class="ssg-msg" id="rMsg"></div><div class="ssg-sub" id="rDet"></div><div class="ssg-btns"><button type="button" class="ssg-btn primary" id="rStart">Start (Space)</button><button type="button" class="ssg-btn" id="rAgain" style="display:none">Try again (Space)</button><button type="button" class="ssg-btn" id="rNew">New rhythm (N)</button><button type="button" class="ssg-btn" id="rNext" style="display:none">Next level</button></div>' +
      '<div class="ssg-pad" id="rPad">Tap here, or press Space (any key works). Hold the key down for half notes and longer, and let go when the note ends.</div></div>';
    var last = Number(lg("rhythm-level") || 0); if (!(last >= 0 && last < levels.length) || !allowedLevel(last)) last = 0;
    R = { lv: last, tempo: 0, phase: "ready", taps: [], sync: Number(lg("rhythm-sync") || 0) || 0, click: lg("rhythm-click") !== "0", held: {}, ex: null };
    var h = host;
    function $(id){ return h.querySelector("#" + id); }
    $("rClick").onchange = function(){ R.click = this.checked; ls("rhythm-click", this.checked ? "1" : "0"); };
    $("rSlow").onclick = function(){ R.tempo = Math.max(36, R.tempo - 4); $("rTempo").textContent = R.tempo; if (R.phase === "ready" || R.phase === "done") { R.phase = "ready"; showReady(); } };
    $("rFast").onclick = function(){ R.tempo = Math.min(140, R.tempo + 4); $("rTempo").textContent = R.tempo; if (R.phase === "ready" || R.phase === "done") { R.phase = "ready"; showReady(); } };
    function sy(d){ R.sync = Math.max(-300, Math.min(300, R.sync + d)); ls("rhythm-sync", String(R.sync)); $("rSync").textContent = (R.sync > 0 ? "+" : "") + R.sync; }
    $("rSyncM").onclick = function(){ sy(-10); }; $("rSyncP").onclick = function(){ sy(10); }; sy(0);
    $("rStart").onclick = function(){ startRun(); this.blur(); };
    $("rAgain").onclick = function(){ tryAgain(); this.blur(); };
    $("rNew").onclick = function(){ newExercise(); this.blur(); };
    $("rNext").onclick = function(){ setLevel(Math.min(levels.length - 1, R.lv + 1)); this.blur(); };
    var pad = $("rPad");
    pad.addEventListener("pointerdown", function(ev){ ev.preventDefault(); try { pad.setPointerCapture(ev.pointerId); } catch (e) {} pad.classList.add("down"); if (R.phase === "ready") startRun(); else if (R.phase === "done") tryAgain(); else tapDown("pointer", ev.timeStamp > 0 ? ev.timeStamp : performance.now()); });
    var padUp = function(ev){ pad.classList.remove("down"); tapUp("pointer", ev && ev.timeStamp > 0 ? ev.timeStamp : performance.now()); };
    pad.addEventListener("pointerup", padUp); pad.addEventListener("pointercancel", padUp);
    var kd = function(ev){
      if (!host || host.getAttribute("data-game") !== "rhythm") return;
      var k = ev.key;
      if (ev.metaKey || ev.ctrlKey || ev.altKey || k === "Shift" || k === "Control" || k === "Alt" || k === "Meta" || k === "Tab" || /^F\d+$/.test(k) || k === "CapsLock") return;
      if (ev.target && /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName) && k !== " ") return;
      ev.preventDefault(); ev.stopPropagation();
      if (k === "Escape") { if (R.phase === "count" || R.phase === "run") abortRun(); return; }
      if (ev.repeat) return;
      var t = ev.timeStamp > 0 ? ev.timeStamp : performance.now();
      if (R.phase === "ready") { if (k === " " || k === "Enter") startRun(); else if (k === "n" || k === "N") newExercise(); return; }
      if (R.phase === "done") { if (k === " " || k === "Enter") tryAgain(); else if (k === "n" || k === "N") newExercise(); return; }
      tapDown(ev.code || k, t);
    };
    var ku = function(ev){ if (!host || host.getAttribute("data-game") !== "rhythm") return; ev.preventDefault(); ev.stopPropagation(); tapUp(ev.code || ev.key, ev.timeStamp > 0 ? ev.timeStamp : performance.now()); };
    window.addEventListener("keydown", kd, true); window.addEventListener("keyup", ku, true);
    cleanup = function(){ window.removeEventListener("keydown", kd, true); window.removeEventListener("keyup", ku, true); cancelAnimationFrame(raf); R = null; };
    drawLevels(); setLevel(last, true);
  }
  function drawLevels(){
    var res = rResults(), el = host.querySelector("#rLevels");
    el.innerHTML = levels.map(function(lv, i){
      var r = res[lv.id] || {}, ok = allowedLevel(i);
      return '<button type="button" class="ssg-item' + (i === R.lv ? " on" : "") + '" data-i="' + i + '"' + (ok ? "" : " disabled") + '>' + (i + 1) + '. ' + esc(lv.name) + '<small>' + (r.passes ? '<span class="ok">✓ ' + r.passes + ' passed</span> &middot; ' : "") + (r.best != null ? "best " + Math.round(r.best * 100) + "%" : "not tried") + '</small></button>';
    }).join("");
    [].forEach.call(el.querySelectorAll("[data-i]"), function(b){ b.onclick = function(){ if (R.phase === "count" || R.phase === "run") abortRun(); setLevel(+b.getAttribute("data-i")); }; });
  }
  function setLevel(i, first){
    R.lv = i; ls("rhythm-level", String(i)); R.tempo = levels[i].tempo || 72;
    host.querySelector("#rTempo").textContent = R.tempo;
    if (!first) drawLevels(); else drawLevels();
    newExercise();
  }
  function newExercise(){
    if (R.phase === "count" || R.phase === "run") abortRun();
    var lv = levels[R.lv], r = generateExercise(R.lv, {});
    R.ex = r && r.ex ? r.ex : null; R.err = r && r.error || "";
    R.phase = "ready"; R.taps = []; R.held = {}; R.tries = 0;
    host.querySelector("#rTitle").innerHTML = '<b>Level ' + (R.lv + 1) + ': ' + esc(lv.name) + '</b>' + (lv.teach ? ' &mdash; ' + esc(lv.teach) : "");
    if (!R.ex) { host.querySelector("#rStaff").innerHTML = '<div class="ssg-sub">Could not make a rhythm for this level (' + esc(R.err) + ').</div>'; return; }
    evt("ss-question", { title: "Rhythm: " + lv.name, mode: "practice" });
    drawStaff(); showReady();
  }
  function showReady(){
    var h = host; if (!h || !R || !R.ex) return;
    R.tickMs = tickMsOf(R.ex.ts, R.tempo);
    drawLane(); drawCount(-1);
    h.querySelector("#rMsg").innerHTML = R.tries ? "" : "Get ready: you hear one measure of counting, then play the rhythm.";
    h.querySelector("#rDet").textContent = ""; h.querySelector("#rStart").style.display = ""; h.querySelector("#rAgain").style.display = "none"; h.querySelector("#rNext").style.display = "none";
    var T = R.ex.ts; h.querySelector("#rTempo").textContent = R.tempo;
    var ph = h.querySelector("#rStaff .ssgph"); if (ph) ph.setAttribute("visibility", "hidden");
  }
  function drawCount(cur){
    var T = R.ex.ts, names = T.compound ? NAMES_68 : (NAMES_SIMPLE[T.num] || NAMES_SIMPLE[4]);
    host.querySelector("#rCount").innerHTML = names.map(function(n, i){ return '<span class="' + (i === cur ? "on" : "") + '">' + esc(n) + '</span>'; }).join("") + '<small>count-in</small>';
  }

  // ---- the staff (VexFlow), with a moving marker ----
  var DURV = { 16: { d: "w", dots: 0 }, 12: { d: "h", dots: 1 }, 8: { d: "h", dots: 0 }, 6: { d: "q", dots: 1 }, 4: { d: "q", dots: 0 }, 3: { d: "8", dots: 1 }, 2: { d: "8", dots: 0 }, 1: { d: "16", dots: 0 } };
  function drawStaff(){
    var VF = window.VexFlow, hostEl = host.querySelector("#rStaff"), ex = R.ex, T = ex.ts; hostEl.innerHTML = "";
    var maxPerRow = 4, rowAvail = 1100, clefW = 52, tsW = 38;
    function wt(ms){ var w = 70; ms.forEach(function(p){ w += (p.ticks <= 1 ? 24 : p.ticks <= 3 ? 32 : 44) + (p.ticks === 3 || p.ticks === 6 || p.ticks === 12 ? 10 : 0); }); return Math.max(w, 150); }
    var weights = ex.measures.map(wt), rows = [], cur = [];
    ex.measures.forEach(function(ms, i){ if (cur.length >= maxPerRow) { rows.push(cur); cur = []; } cur.push(i); });
    if (cur.length) rows.push(cur);
    var rowH = 120, topPad = 40, layout = [], maxRowW = 0;
    rows.forEach(function(row, r){
      var extra = clefW + (r === 0 ? tsW : 0), sumW = row.reduce(function(a, i){ return a + weights[i]; }, 0), rowW = Math.min(rowAvail, sumW * 1.5 + extra), x = 20;
      row.forEach(function(i, k){ var w = (weights[i] / sumW) * (rowW - extra) + (k === 0 ? extra : 0); layout[i] = { row: r, x: x, w: w, first: k === 0 }; x += w; });
      maxRowW = Math.max(maxRowW, x + 20);
    });
    var W = Math.max(maxRowW, 360), H = rows.length * rowH + topPad - 10;
    var renderer = new VF.Renderer(hostEl, VF.Renderer.Backends.SVG); renderer.resize(W, H);
    var ctx = renderer.getContext(), svg = hostEl.querySelector("svg");
    if (svg) { svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.removeAttribute("width"); svg.removeAttribute("height"); svg.style.width = "100%"; svg.style.height = "auto"; }
    var refs = [], mEnd = [], absBase = 0;
    ex.measures.forEach(function(ms, mi){
      var lay = layout[mi], y = topPad + lay.row * rowH, stave = new VF.Stave(lay.x, y, lay.w);
      stave.setConfigForLines([{ visible: false }, { visible: false }, { visible: true }, { visible: false }, { visible: false }]);
      if (lay.first) stave.addClef("percussion");
      if (mi === 0) stave.addTimeSignature(T.num + "/" + T.den);
      if (mi === ex.measures.length - 1) stave.setEndBarType(VF.BarlineType.END);
      stave.setContext(ctx).draw();
      var notes = [], fullRest = (ms.length === 1 && ms[0].rest && ms[0].ticks === T.ticks);
      ms.forEach(function(p){
        var d = DURV[p.ticks], note;
        if (fullRest) note = new VF.StaveNote({ keys: ["b/4"], duration: "wr", alignCenter: true });
        else { note = new VF.StaveNote({ keys: ["b/4"], duration: d.d + (p.rest ? "r" : ""), dots: d.dots, stemDirection: 1 }); if (d.dots) VF.Dot.buildAndAttach([note], { all: true }); }
        notes.push(note); refs.push({ part: p, note: note, abs: absBase + p.pos, y: y, m: mi, cx: 0 });
      });
      var voice = new VF.Voice({ numBeats: T.num, beatValue: T.den }).setMode(VF.Voice.Mode.SOFT); voice.addTickables(notes);
      var bg = {}; ms.forEach(function(p, k){ if (p.beam) (bg[p.beam] = bg[p.beam] || []).push(notes[k]); });
      var beams = Object.keys(bg).map(function(k){ return new VF.Beam(bg[k]); });
      new VF.Formatter().joinVoices([voice]).formatToStave([voice], stave); voice.draw(ctx, stave); beams.forEach(function(b){ b.setContext(ctx).draw(); });
      var base = refs.length - ms.length;
      notes.forEach(function(n, k){ var cx; try { cx = (n.getNoteHeadBeginX() + n.getNoteHeadEndX()) / 2; } catch (e) { cx = n.getAbsoluteX() + 6; } refs[base + k].cx = cx; if (fullRest) { try { var rel = n.getSVGElement(); if (rel) rel.setAttribute("transform", "translate(0,1.5)"); } catch (e) {} } });
      mEnd[mi] = stave.getNoteEndX(); absBase += T.ticks;
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
      var endTick = (nxt && nxt.m === r.m) ? nxt.abs : (r.m + 1) * T.ticks, endX = (nxt && nxt.m === r.m) ? nxt.cx : mEnd[r.m] - 8, f = (abs - r.abs) / Math.max(1, endTick - r.abs);
      return { x: r.cx + (endX - r.cx) * f, y: r.y };
    }
    var ns = "http://www.w3.org/2000/svg", ph = document.createElementNS(ns, "line"); ph.setAttribute("class", "ssgph"); ph.setAttribute("stroke", "#e9a31a"); ph.setAttribute("stroke-width", "4"); ph.setAttribute("stroke-linecap", "round"); ph.setAttribute("visibility", "hidden"); svg.appendChild(ph);
    R.geo = { posAt: posAt, ph: ph, total: T.ticks * ex.measures.length };
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
    return { evs: evs, rests: rests };
  }
  function drawLane(){
    var lane = host.querySelector("#rLane"), T = R.ex.ts, s = laneSpan(), E = expectedEvents(); R.E = E;
    var h = '<div class="cin" style="left:0;width:' + lx(0) + '%"></div>';
    for (var t = s.min; t <= s.max; t += T.beat) h += '<div class="bl' + ((t % T.ticks === 0) ? " ml" : "") + '" style="left:' + lx(t) + '%"></div>';
    E.rests.forEach(function(r){ h += '<div class="ex rest" style="left:' + lx(r.abs) + '%;width:' + (r.ticks / (s.max - s.min) * 100) + '%"></div>'; });
    E.evs.forEach(function(e, i){ h += '<div class="ex" id="rEx' + i + '" style="left:' + lx(e.abs) + '%;width:' + (e.ticks / (s.max - s.min) * 100) + '%"></div>'; });
    h += '<div class="lab" style="left:' + lx(-T.ticks / 2) + '%">count-in</div><div class="ph" id="rPh" style="left:0;display:none"></div>';
    lane.innerHTML = h; lane.querySelectorAll(".ex:not(.rest)");
  }

  // ---- the run ----
  function startRun(){
    if (!R || !R.ex || R.phase === "count" || R.phase === "run") return;
    var c = audio(); if (!c) { host.querySelector("#rMsg").textContent = "This computer cannot play sound here."; return; }
    var T = R.ex.ts; R.tickMs = tickMsOf(T, R.tempo); R.taps = []; R.held = {}; R.tries++;
    drawLane();
    var a0 = c.currentTime + 0.25, perfA0;
    try { var ts = c.getOutputTimestamp && c.getOutputTimestamp(); if (ts && ts.contextTime > 0 && ts.performanceTime > 0) perfA0 = ts.performanceTime + (a0 - ts.contextTime) * 1000; } catch (e) {}
    if (perfA0 == null) perfA0 = performance.now() + (a0 - c.currentTime) * 1000 + ((c.outputLatency || 0) + (c.baseLatency || 0)) * 1000;
    R.w0 = perfA0 + T.ticks * R.tickMs;   // when tick 0 (the first note) is heard
    var total = R.ex.measures.length * T.ticks, cstep = T.compound ? 2 : 4, bstep = T.beat, ms = R.tickMs / 1000;
    for (var x = -T.ticks; x < 0; x += cstep) blip(a0 + (x + T.ticks) * ms, (x === -T.ticks || (T.compound && (x + T.ticks) % 6 === 0)) ? 1500 : 1000, 0.07, 0.3, "square");
    if (R.click) for (var y = 0; y < total; y += bstep) blip(a0 + (y + T.ticks) * ms, (y % T.ticks === 0) ? 1500 : 1000, 0.06, 0.2, "square");
    R.endTick = total + T.beat; R.phase = "count"; R.lastCount = -2;
    var h = host; h.querySelector("#rMsg").textContent = ""; h.querySelector("#rDet").textContent = "";
    h.querySelector("#rStart").style.display = "none"; h.querySelector("#rAgain").style.display = "none"; h.querySelector("#rNext").style.display = "none";
    var ph = R.geo.ph; ph.setAttribute("visibility", "hidden"); h.querySelector("#rPh").style.display = "";
    cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
  }
  function frame(){
    if (!R || (R.phase !== "count" && R.phase !== "run")) return;
    var now = performance.now(), T = R.ex.ts, tick = (now - R.w0) / R.tickMs;
    if (R.phase === "count" && tick >= 0) R.phase = "run";
    var cstep = T.compound ? 2 : 4;
    if (tick < 0) { var ci = Math.floor((tick + T.ticks) / cstep); if (ci !== R.lastCount && ci >= 0) { R.lastCount = ci; drawCount(ci); } }
    else if (R.lastCount !== -1) { R.lastCount = -1; drawCount(-1); }
    var ph = host.querySelector("#rPh"); if (ph) ph.style.left = lx(Math.max(tick, laneSpan().min)) + "%";
    if (tick >= 0 && tick <= R.geo.total) { var p = R.geo.posAt(tick); R.geo.ph.setAttribute("x1", p.x); R.geo.ph.setAttribute("x2", p.x); R.geo.ph.setAttribute("y1", p.y + 2); R.geo.ph.setAttribute("y2", p.y + 66); R.geo.ph.setAttribute("visibility", "visible"); }
    Object.keys(R.held).forEach(function(k){ var tp = R.held[k]; if (tp && tp.el) { tp.el.style.width = Math.max(0.4, lx((now - R.w0) / R.tickMs) - lx(tp.tick)) + "%"; } });
    if (tick >= R.endTick) { finishRun(); return; }
    raf = requestAnimationFrame(frame);
  }
  function tapDown(code, t){
    if (!R || (R.phase !== "count" && R.phase !== "run")) return;
    if (R.held[code]) return;
    var T = R.ex.ts, tick = (t - R.w0) / R.tickMs, tp = { down: t, up: null, code: code, tick: tick };
    toneOn("r:" + code, 392, 0.2, "wood");
    var el = document.createElement("div"); el.className = "ac"; el.style.left = lx(tick) + "%"; el.style.width = "0.4%"; tp.el = el; host.querySelector("#rLane").appendChild(el);
    R.held[code] = tp;
    if (R.phase === "run" || tick > -T.beat * 0.5) R.taps.push(tp); else { el.style.opacity = ".35"; tp.count = true; }
  }
  function tapUp(code, t){
    toneOff("r:" + code);
    if (!R) return; var tp = R.held[code]; if (!tp) return;
    delete R.held[code]; tp.up = t;
    if (tp.el) { var tick = (t - R.w0) / R.tickMs; tp.el.style.width = Math.max(0.4, lx(tick) - lx(tp.tick)) + "%"; }
  }
  function abortRun(){
    cancelAnimationFrame(raf); toneAll(); if (!R) return;
    R.phase = "ready"; R.held = {}; var h = host; if (h) { showReady(); h.querySelector("#rMsg").textContent = "Stopped. Press Space to start again."; }
  }
  function tryAgain(){ if (!R || !R.ex) return; R.phase = "ready"; startRun(); }

  // ---- scoring: key DOWN against the expected note start, key UP against the expected note end ----
  function score(){
    var T = R.ex.ts, E = R.E, tm = R.tickMs, good = Math.max(90, Math.min(150, 0.5 * tm)), close = Math.min(260, good * 1.8), used = {}, res = [];
    var taps = R.taps.filter(function(t){ return !t.count; });
    var pts = 0, total = 0, holdN = 0, holdOk = 0, onN = 0, onOk = 0, dts = [];
    E.evs.forEach(function(e, i){
      var exp = R.w0 + e.abs * tm + R.sync, best = -1, bd = 1e9;
      taps.forEach(function(tp, j){ if (used[j]) return; var d = Math.abs(tp.down - exp); if (d < bd) { bd = d; best = j; } });
      var r = { i: i, onset: "miss", hold: "na", dt: null };
      total += 1; onN++;
      if (best >= 0 && bd <= close) {
        used[best] = true; var tp = taps[best], dt = tp.down - exp; r.dt = Math.round(dt); dts.push(dt);
        if (bd <= good) { r.onset = "good"; pts += 1; onOk++; } else { r.onset = "close"; pts += 0.5; }
        if (e.ticks >= 8) {
          total += 1; holdN++;
          var up = tp.up == null ? (R.w0 + R.endTick * tm) : tp.up, expEnd = exp + e.ticks * tm, tol = Math.max(150, 0.2 * e.ticks * tm), dd = up - expEnd;
          if (Math.abs(dd) <= tol) { r.hold = "good"; pts += 1; holdOk++; } else r.hold = dd < 0 ? "short" : "long";
          r.dh = Math.round(dd);
        }
      } else if (e.ticks >= 8) total += 1;
      res.push(r);
    });
    var extra = 0; taps.forEach(function(tp, j){ if (!used[j]) { extra++; tp.extra = true; if (tp.el) tp.el.classList.add("extra"); } });
    pts -= extra * 0.5; var ratio = total ? Math.max(0, Math.min(1, pts / total)) : 0;
    var avg = dts.length ? dts.reduce(function(a, b){ return a + b; }, 0) / dts.length : 0;
    return { res: res, ratio: ratio, pass: ratio >= 0.85, onN: onN, onOk: onOk, holdN: holdN, holdOk: holdOk, extra: extra, avg: Math.round(avg), matched: dts.length };
  }
  function finishRun(){
    cancelAnimationFrame(raf); toneAll(); if (!R) return;
    Object.keys(R.held).forEach(function(k){ tapUp(k, performance.now()); });
    R.phase = "done"; var S = score(), h = host, lv = levels[R.lv];
    S.res.forEach(function(r){
      var el = h.querySelector("#rEx" + r.i); if (!el) return;
      el.classList.add(r.onset === "good" && (r.hold === "good" || r.hold === "na") ? "good" : r.onset === "miss" ? "miss" : "close");
      el.textContent = r.onset === "miss" ? "missed" : (r.dt > 0 ? "+" : "") + r.dt + (r.hold === "short" ? " short" : r.hold === "long" ? " long" : "");
      el.title = "Start: " + (r.dt == null ? "missed" : (r.dt > 0 ? r.dt + " ms late" : (-r.dt) + " ms early")) + (r.hold === "na" ? "" : "; end: " + (r.hold === "good" ? "good" : r.hold === "short" ? "you let go too early" : "you held too long"));
    });
    var pct = Math.round(S.ratio * 100);
    h.querySelector("#rMsg").innerHTML = S.pass ? '<span class="big okc">Got it! ' + pct + '%</span>' : '<span class="big no">Not yet. ' + pct + '%</span>';
    var bits = ["Notes started on time: <b>" + S.onOk + " of " + S.onN + "</b>"];
    if (S.holdN) bits.push("Long notes held the right length: <b>" + S.holdOk + " of " + S.holdN + "</b>");
    if (S.extra) bits.push("Extra taps: <b>" + S.extra + "</b>");
    if (S.matched >= 3 && Math.abs(S.avg) >= 40) bits.push("You tapped about <b>" + Math.abs(S.avg) + " ms " + (S.avg > 0 ? "late" : "early") + "</b> on average" + (Math.abs(S.avg) >= 70 ? " (the Sync buttons at the top can shift the timing if your keyboard is slow)" : ""));
    h.querySelector("#rDet").innerHTML = bits.join("<br>");
    var res = rResults(), r = res[lv.id] || (res[lv.id] = { tries: 0, passes: 0, best: null });
    r.tries++; if (S.pass) r.passes++; if (r.best == null || S.ratio > r.best) r.best = S.ratio; ls("rhythm-results", JSON.stringify(res));
    evt("ss-attempt", { title: "Rhythm: " + lv.name, mode: "practice", ok: S.pass });
    h.querySelector("#rStart").style.display = "none"; h.querySelector("#rAgain").style.display = ""; h.querySelector("#rNext").style.display = (S.pass && R.lv < levels.length - 1 && allowedLevel(R.lv + 1)) ? "" : "none";
    drawLevels();
    var ph = h.querySelector("#rPh"); if (ph) ph.style.display = "none"; R.geo.ph.setAttribute("visibility", "hidden"); drawCount(-1);
  }
  window.ssRhythmTest = { score: function(){ return R && R.ex ? score() : null; }, state: function(){ return R; }, levels: function(){ return levels; } };

  // =====================================================================
  // SONGS: the teacher's Workbook song drawn with VexFlow + a virtual keyboard (mouse, touch, computer keys)
  // =====================================================================
  var NOTE_NAMES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
  var WHITE_IN_OCT = [0, 2, 4, 5, 7, 9, 11], BLACK_AFTER = { 0: 1, 2: 3, 5: 6, 7: 8, 9: 10 };   // semitone offsets in an octave
  var KEYMAP = { KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7, KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11, KeyK: 12, KeyO: 13, KeyL: 14, KeyP: 15, Semicolon: 16, Quote: 17 };
  var KEYLAB = { KeyA: "A", KeyW: "W", KeyS: "S", KeyD: "D", KeyE: "E", KeyF: "F", KeyT: "T", KeyG: "G", KeyY: "Y", KeyH: "H", KeyU: "U", KeyJ: "J", KeyK: "K", KeyO: "O", KeyL: "L", KeyP: "P", Semicolon: ";", Quote: "'" };
  function midiOfKey(k){   // "f#/4" -> 66 ; "bb/3" -> 58
    var m = /^([a-g])(#{1,2}|b{1,2}|n)?\/(-?\d+)$/.exec(String(k || "").toLowerCase()); if (!m) return null;
    var base = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[m[1]], acc = m[2] ? (m[2][0] === "#" ? m[2].length : m[2][0] === "b" ? -m[2].length : 0) : 0;
    return 12 * (Number(m[3]) + 1) + base + acc;
  }
  function freqOf(midi){ return 440 * Math.pow(2, (midi - 69) / 12); }
  var SG = null;
  function songBeats(n){ var b = { w: 4, h: 2, q: 1, "8": 0.5, "16": 0.25 }[String(n.d)] || 1; return n.dot ? b * 1.5 : b; }
  function songList(){ return (SC().songs || []).filter(function(s){ return s && s.notes && s.notes.length; }); }

  function openSongs(){
    var list = songList(); if (!list.length) return;
    var body = openHost("songs", "Songs", '<span class="ctl" title="Z and X move the computer keys down and up an octave">Keys octave <button type="button" class="ssg-btn sm" id="sOctM">&minus;</button><b id="sOct"></b><button type="button" class="ssg-btn sm" id="sOctP">+</button></span>');
    body.innerHTML = '<div class="ssg-side" id="sList"></div><div class="ssg-main" style="padding-bottom:6px"><div class="ssg-sub" id="sTitle"></div><div class="ssg-staff" id="sStaff"></div><div class="ssg-sub" id="sHelp">Play the keys with the mouse, your finger, or the letter keys A S D F G H J K (black keys W E T Y U O P).</div><div class="ssg-kb" id="sKb"></div></div>';
    SG = { song: null, base: 60, down: {}, ptr: {} };
    var h = host;
    h.querySelector("#sList").innerHTML = list.map(function(s, i){ return '<button type="button" class="ssg-item" data-i="' + i + '">' + esc(s.title || ("Song " + (i + 1))) + '<small>' + esc(s.time || "") + (s.key ? " &middot; key of " + esc(s.key) : "") + '</small></button>'; }).join("");
    [].forEach.call(h.querySelectorAll("#sList [data-i]"), function(b){ b.onclick = function(){ pickSong(list[+b.getAttribute("data-i")], +b.getAttribute("data-i")); }; });
    h.querySelector("#sOctM").onclick = function(){ shiftOct(-1); }; h.querySelector("#sOctP").onclick = function(){ shiftOct(1); };
    var kd = function(ev){
      if (!host || host.getAttribute("data-game") !== "songs") return;
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (ev.code === "KeyZ") { ev.preventDefault(); ev.stopPropagation(); if (!ev.repeat) shiftOct(-1); return; }
      if (ev.code === "KeyX") { ev.preventDefault(); ev.stopPropagation(); if (!ev.repeat) shiftOct(1); return; }
      var off = KEYMAP[ev.code]; if (off == null) return;
      ev.preventDefault(); ev.stopPropagation(); if (ev.repeat) return;
      var midi = SG.base + off; SG.down[ev.code] = midi; press(midi, "k:" + ev.code);
    };
    var ku = function(ev){ if (!host || host.getAttribute("data-game") !== "songs") return; var m = SG.down[ev.code]; if (m == null) return; ev.preventDefault(); ev.stopPropagation(); delete SG.down[ev.code]; release(m, "k:" + ev.code); };
    window.addEventListener("keydown", kd, true); window.addEventListener("keyup", ku, true);
    cleanup = function(){ window.removeEventListener("keydown", kd, true); window.removeEventListener("keyup", ku, true); SG = null; };
    var last = Number(lg("songs-last") || 0); if (!(last >= 0 && last < list.length)) last = 0;
    pickSong(list[last], last);
  }
  function shiftOct(d){ if (!SG) return; SG.base = Math.max(24, Math.min(84, SG.base + 12 * d)); markKeys(); }
  function press(midi, id){
    toneOn("s:" + id, freqOf(midi), 0.22, "piano");
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
    var lo = 200, hi = 0; s.notes.forEach(function(n){ if (n.rest) return; var m = midiOfKey(n.k); if (m != null) { lo = Math.min(lo, m); hi = Math.max(hi, m); } });
    if (lo > hi) { lo = 60; hi = 72; }
    var startOct = Math.max(2, Math.floor(lo / 12) - 1 - 1); if (Math.floor(hi / 12) - 1 > startOct + 2) startOct = Math.max(2, Math.floor(hi / 12) - 1 - 2);   // 3 octaves that hold the whole song
    SG.kbStart = 12 * (startOct + 1);
    SG.base = Math.max(24, Math.min(84, 12 * (Math.floor(lo / 12))));   // the computer keys start at the C below the song's lowest note
    drawScore(s); drawKeyboard(); markKeys();
  }
  function drawKeyboard(){
    var kb = host.querySelector("#sKb"), n = 21, w = 100 / n, h = "", i;
    var whites = [];
    for (i = 0; i < n; i++) { var oct = Math.floor(i / 7), idx = i % 7, m = SG.kbStart + 12 * oct + WHITE_IN_OCT[idx]; whites.push(m); h += '<div class="wk' + (m % 12 === 0 ? " c" + (Math.floor(m / 12) - 1) : "") + '" data-m="' + m + '" style="left:' + (i * w) + '%;width:' + w + '%"><span></span></div>'; }
    whites.forEach(function(m, i){ var off = m % 12; if (BLACK_AFTER[off] != null && i < n - 1) h += '<div class="bk" data-m="' + (m + 1) + '" style="left:' + ((i + 1) * w - w * 0.3) + '%;width:' + (w * 0.6) + '%"><span></span></div>'; });
    kb.innerHTML = h;
    var down = function(ev){ var k = ev.target.closest && ev.target.closest("[data-m]"); if (!k) return; ev.preventDefault(); var m = +k.getAttribute("data-m"), id = "p:" + ev.pointerId; SG.ptr[ev.pointerId] = m; press(m, id); try { kb.setPointerCapture(ev.pointerId); } catch (e) {} };
    var up = function(ev){ var m = SG.ptr[ev.pointerId]; if (m == null) return; delete SG.ptr[ev.pointerId]; release(m, "p:" + ev.pointerId); };
    kb.addEventListener("pointerdown", down); kb.addEventListener("pointerup", up); kb.addEventListener("pointercancel", up);
    kb.addEventListener("pointermove", function(ev){   // sliding a finger or the mouse over keys plays them
      var m0 = SG.ptr[ev.pointerId]; if (m0 == null) return;
      var el = document.elementFromPoint(ev.clientX, ev.clientY), k = el && el.closest && el.closest("#sKb [data-m]"); if (!k) return; var m = +k.getAttribute("data-m");
      if (m !== m0) { release(m0, "p:" + ev.pointerId); SG.ptr[ev.pointerId] = m; press(m, "p:" + ev.pointerId); }
    });
  }
  function markKeys(){   // the letters that play each key right now
    if (!host) return; var kb = host.querySelector("#sKb"); if (!kb) return;
    [].forEach.call(kb.querySelectorAll("[data-m] > span"), function(s){ s.textContent = ""; });
    Object.keys(KEYMAP).forEach(function(code){ var m = SG.base + KEYMAP[code], el = kb.querySelector('[data-m="' + m + '"] > span'); if (el) el.textContent = KEYLAB[code]; });
    var o = host.querySelector("#sOct"); if (o) o.textContent = "C" + (Math.floor(SG.base / 12) - 1);
    var c4 = kb.querySelector('[data-m="60"]'); if (c4) c4.title = "middle C";
  }
  function drawScore(s){
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
    for (var k = 0; k < all.length - 1; k++) if (all[k].n.tie && !all[k].n.rest) { try { new VF.StaveTie({ firstNote: all[k].sn, lastNote: all[k + 1].sn, firstIndexes: [0], lastIndexes: [0] }).setContext(ctx).draw(); } catch (e) {} }
  }
  window.ssSongsTest = { midiOfKey: midiOfKey };

  // =====================================================================
  window.STUDENT_READY.then(function(){ try { loadLevels(); } catch (e) { console.warn("rhythm levels", e); } watch(); });
})();
