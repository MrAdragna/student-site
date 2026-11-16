/* STUDENT BUILD generated from NoteID.js by build_student.py; do not edit by hand */
// NoteID.js
// Note identification drill modules, docked persistent tab (Piano class "2" for now).
//
/*
  HANDOFF — NoteID.js
  Version: 26 (c12, X89b): a blank one-word skill stays blank (autosave no longer refills it). Version: 25 (c12, X89): level editor autosaves every edit; Save/Cancel moved to the header (Save just closes, Cancel restores the levels as they were when the editor opened and saves that); clicking outside = Save. Version: 24 (c12, X88b): the Preview Student Site tab no longer reloads / re-renders on every window focus (that swallowed the next click, so leaving the preview needed two clicks); tabs are not rebuilt when unchanged. Version: 23 (prior: 22, see "NoteID (revert).js"; pairs with NoteID.html v23). EDITED BY c12 at the user's request (X88, 13 Nov 2026), not by c11: (1) `typeof DataStore` instead of `window.DataStore` (the storage library declares `const DataStore`, which is NOT a window property, so the Plan tab said "The storage helper (lib/storage.js) has no loadJSON"); (2) new tab "Preview Student Site" (view "site": an iframe to ../StudentSite/StudentSite.html?view=student, handed this app's folder handle); (3) Plan > options column: grey = known from the previous level, blue "+" = added, red "-" = removed (newVsPrevious).
  Version: 22 (prior: 21, see "NoteID (revert).js"; pairs with NoteID.html v22)
  Conversation: "c11: NoteID (2)"  |  History: c10: NoteID (1) <- the original NoteID conversation (Round 1, 2026-10-28)  |  Helper docs: claude/NoteID-Handoff.md, claude/Game-Style-Guide.md, claude/NoteID-Progress-Integration-Plan.md
  Last updated: 2026-11-11 (v20)

  This round changed (v22, the user's points of 2026-11-12 09:02): the seam handle is thinner and sits where none of the selected module's own handles are (lsSeams picks the spot). Nothing else.

  This round changed (v21, the user's points of 2026-11-11 15:41): slide thumbnails are REAL copies of the stage (lsSnap1 clones #gameRoot when a slide is left / edited, lsPrime snapshots every slide when the editor opens, lsThumb / lsFitThumbs scale them; slides never visited fall back to the schematic lsMini). Two modules that touch along a side get a shared SEAM handle (.lseam, lsSeams; drag mode "seam": one grows, the other shrinks, containers scale their contents, honours Overlap). The dotted links are redrawn live during moves / resizes / seam drags (lsLinksLive) and take the SHORTEST path between the two rectangles (any point on the edges, not edge centres).

  This round changed (v20, the user's points of 2026-11-11 12:47): OVERLAP IS A MANUAL CHOICE: slide flag `overlap` (toolbar "Overlap: off/on"; new slides copy it). Off = nothing may land on another module: a move / resize / nudge / numeric edit that would newly overlap a sibling is undone with a message (live red outline while dragging); Add, paste, duplicate and a drop into a DIFFERENT container are FITTED instead (lsFit: bumpPairs / repackAdd, shrink toward each module's minimum, a container's contents scale). Stacking order = order of `boxes` (lsRenderOrder walks the tree, so a container and its contents stay together; lsZ = Bring to front / forward / backward / Send to back, Ctrl+] / Ctrl+[); Tab / Shift+Tab and Alt+click select the next module in the stack / under the pointer. Containers scale their contents by removing EMPTY space first, then scaling (lsAxis / lsLim / lsScaleKids). Ctrl/Cmd+C / X / V copy a module or group (also to another slide / level; a one-only module becomes a placeholder if the slide already has one); right-click on the stage adds a container or any module AT that spot (inside the container under the pointer). Selected-by-proxy (everything inside a selected container) gets a dashed outline (.lproxy). Dotted lines tie question -> answer -> feedback in the editor (lsLinksHtml). The "message" kind is now labelled Feedback. slideFrom now remaps `parent` ids when a slide is copied (v19 bug: copied slides lost their container links).

  This round changed (v19, the user's points of 2026-11-11 09:49): ONE MAIN WALK PER GAME TYPE: `noteid-lessons-v1` is now v:6 { lessons, layouts, walks:{ typeId:{ mode:"auto"|"custom"|"both", steps:[{t,x}] } } } (v18 per-box walk steps migrate into it). A helper / game box with `walk` uses a RANGE of that walk: wFrom, wTo (0 = end), wPlace "restart"|"continue" (continue = from where the previous slides stopped, worked out statically by lsWalkPlan), wNext "normal"|"range" (range = finishing the range moves to the next slide; the slide then needs only the walk). Lessons never skip steps. CONTAINERS NEST (any depth); dragging a module onto a container puts it inside (drop target highlight), dragging out takes it out; resizing a container scales what is inside (limits from the children's min / max sizes, lsLim / lsScaleKids); right-click menu (Group, Release, Duplicate, Align, Remove); selection rules for containers (shift-click inside a selected container takes that one out; shift-click a container over selected children selects the container); marquee fixed for the stage scale and picks a container only when fully enclosed; guides while moving / resizing (centred on the stage or container, equal gaps between neighbours); Alt resize snaps to half cells symmetrically; duplicating turns one-only modules in the copy into placeholders; full screen fills the window in the lesson editor.

  This round changed (v18, the user's 11 points of 2026-11-10 20:39): lesson boxes gain `parent` (container id), `walkMode` ("auto"|"custom"|"both"), `walkSteps [{t,x}]`, `style`. New kind `container` (children keep ABSOLUTE grid coords, are kept inside the parent's inner rect lsInner(), move with it; min size = children bbox; Add module with a container selected adds inside it; Group / Ungroup). `next` is single:true (kindTaken). Selection = lessonEd.ids (+ lessonEd.box = last); marquee drag, Shift/Cmd/Ctrl toggle; Shift = half-cell steps, Alt/Option = resize from centre (proportional on corners), arrows nudge, Ctrl+D duplicate, Ctrl+A, Ctrl+G, Esc. Positions may be .5. Slide list shows schematic thumbnails (lsMini, not pixel snapshots). Saved layouts: `noteid-lessons-v1` is now {v:5, lessons, layouts:[{id,name,boxes}]}; built-ins in lsBuiltinLayouts(). The walk is authored in the Helper/Game inspector (lsWalkSteps) and via the "Step-by-step walk" entry in Add module.

  This round changed (v17, the user's 22 lesson-editor points of 2026-11-10 15:43; slice agreed: foundations): SLIDES ARE STILL PICTURES OF THE STAGE (no animation inside a slide). A NEW SLIDE STARTS AS A COPY OF THE PREVIOUS ONE, ITS MODULES LINKED (same `lid`); going to the next slide animates only the change: a kept module glides (or jumps), a new one plays its In animation, a dropped one plays its Out (module.anim {in,out,change:"glide"|"none"}). `noteid-lessons-v1` is v:4 (v3 and older convert on load, `migrateLesson`).
    Lesson stage has no score row (HUD hidden; a small Stop button for students). New module "Practice game" = the whole game (question + message + helper + answers) as one module of any size. "Question" / "Answer" are labelled Note question / Note answer (the first of a coming family). Add module = toolbar menu, standard place, bumps what it overlaps (shrinking toward each kind's smallest size) and is refused with a message when nothing fits; each kind has default / min / max size. Alignment inside the module (Left / Center / Right, Top / Middle / Bottom; centred by default). Piano module fills the module's height (fewer keys when taller), starts on C or Shuffle, looks like the question piano. Undo / redo (Ctrl+Z, Ctrl+Shift+Z) and Delete key. Clicking the empty stage deselects (the inspector then lists the slide's modules). Layout in Edit: left = slide list (replaces the level column), toolbar above the stage, right = details. One cursor (move / resize) for every module.
    Not built: more module kinds (musical alphabet, doghouses, black-key brackets, shapes, arrows, curves, buttons, text styles), grouping modules into new modules, other question / answer types, other progression rules and non-linear jumps, slide groups, helper creation inside the editor, interactions beyond touching keys (drag and drop, click a place, typing).
    (v16 below.)

  Earlier (v16):
  This round changed (v16, the user's six lesson-editor points of 2026-11-10 12:46; slice agreed: layout + preview + piano options + moves-on-when): A SLIDE IS A STAGE LAYOUT OF FREE BOXES on a 16 x 12 snap grid. `noteid-lessons-v1` is v:3: slides:[{ id, title, flag, note, sq, adv:{mode:"auto"|"button"}, boxes:[{ id, kind, x,y,w,h (grid), title,text,label,plain, helper,walk, count, pk:{target:"none"|"question",names,shuffle,goal:"none"|"touch",n}, anim:{in,out,move:boolean} }] }].
    Kinds: question, text, piano, message, helper, answer (Answers), next, blank. question / message / helper / answer are one each per slide (they keep the ids promptArea / feedbackRow / helperArea / answerArea, so the game machinery is unchanged; missing ones get hidden stand-ins).
    Edit: drag a module (mouse events), 8 resize handles, numeric Left / Top / Wide / High, palette (drag or click) to add modules, Reset module positions. Preview: Play in / Play out per module, Preview this slide, clicking an animation chip previews it. Move = glide from the previous slide's box of the same kind.
    Piano module: no highlighted note by default (or the question's note), names when touched, slides on arrival, goal "N different keys touched". Slide "Moves on when": Everything is done (answers reached / piano touched / walk finished) or the Next arrow once done; nothing to meet = a Next arrow.
    v15 parts and v12 steps convert on load. Not built yet: answer types per module (the Answers box uses the game's), drag-and-drop / click-a-place / typing interactions, conditional jumps, helper creation inside the editor, dynamic auto-fit layout.
    (v15 below.)

  Earlier (v15):
  This round changed (v15, the user's lesson-editor points of 2026-11-10 12:30): LESSONS ARE NOW SLIDES. `noteid-lessons-v1` is v:2: { lessons: { "<typeId>:<levelId>": { slides:[{ id, title, flag, note, sq, parts:{ prompt, message, helper, answer } }] } } }.
    Each part holds one item or nothing: prompt = question | text | sliding piano | blank; message = text | blank; helper = text | helper | walk | blank; answer = ask (N right) | next arrow | blank.
    Everything in a slide appears, changes and animates together ("linked"); "Unlink" puts a part in its own slide, "Link the next slide into this one" does the opposite. Items have In / Out animations (fade, pop, from left / right / above / below) and Move (glides from where another part's item sat on the previous slide).
    Edit (default): the stage shows the slide with answering off; click a part on the stage or in the inspector map to edit it. Present: play it, jump with the slide list. "Show a helper" no longer has a title + text: the Helper item only picks the helper (a Text item is separate).
    v12 step lists are converted to slides on load. Blank items are placeholders (the slide shows amber until you set a flag). Not built: dragging slides (arrows), more item kinds (graphics), per-item flags.
    (v14 below.)

  Earlier (v14):
  This round changed (v14, the user's points of 2026-11-10 12:24): the Practice Hint shows in the message bar (centered, where right / wrong shows); the lesson Piano shuffler always slides to a DIFFERENT place (before, the random place was often the same, so it looked like it only snapped); NoteID now QUEUES link / state messages (note-id-open-*, -set-state, -current, -link, -set-mode) that arrive before its saved data has loaded and replays them when it is ready (a possible cause of "Note ID links don't work"; the Progress side and the tab behaviour are c9's: see the board).

  Earlier (v13):
  This round changed (v13, the user's points of 2026-11-10 11:51): Practice has a Hint button (one hint = the first step of the walk, shown in the helper row, then no more hints for that question) beside "Walk me through it", which now switches the session to Learn and starts this level's LESSON (without a lesson it starts the built-in walk as before). Lesson step "Piano shuffler" is real: the interactive piano slides to a new position (once on arrival, then "Shuffle again"); games without a piano show a plain Next. The lesson editor button on a level card is the word "Lesson" (the Tabler icon font is not installed, so the icon showed nothing).

  Earlier (v12):
  This round changed (v12): LEARN LESSONS + LESSON EDITOR v1. Each level can have a lesson (`noteid-lessons-v1`: { v:1, lessons:{ "<typeId>:<levelId>": { steps:[{id,type,title,text,slot,count,helpers[],flag,note}] } } }).
    A level WITH a lesson plays it in Learn mode (the old staged walk / helper fading is used only when there is no lesson). Step types: say (text in the prompt card, message bar or helper row), walk (the built-in
    explain() steps), ask (N right answers, ticked helpers showing), helper (a helper on a sample question), and placeholders (piano shuffler, animation, placeholder: play as a Next arrow). Flags: done / placeholder / idea.
    Editor: the presentation icon on a level card (teacher) opens the lesson ON the game stage with an inspector at the right; Edit (default: answering off, click a slot to put a Say-it text there, add / move / copy / remove steps,
    settings, flags) vs Present (play it, or jump with the flow list). Lesson questions do not write class scores or Learn stages (recordAttempt / learnAdjust skip when s.lesson). Not built: dragging steps (arrows for now),
    free placement, animations, the piano shuffler, a knowledge estimate from helper use, "Walk me through it" in Practice starting the lesson.
    (v11 below.)

  Earlier (v11):
  This round changed (v11, the user's points of 2026-11-10 09:23): CSS only in NoteID.html (selected level card's thick edge runs under the whole card; a missed piano key is opaque so white keys no longer show through a black one). NoteID.js has only this header change. The lesson design decisions are in claude/NoteID-Lesson-Editor-Design.md.

  Earlier (v10):
  This round changed (v10, the user's points of 2026-11-10 07:45):
    - Piano-key questions: when the helper row opens (Help menu, helper cards, Walk me through it), the note-name buttons shrink instead of the piano (.game.pk on #gameRoot).
    - Level cards: the gap beside the status bar is now a 1px white hairline (CSS).
    - New level: the validation message ("Set at least one note ...", "These asked notes cannot be answered ...") now sits in the editor footer beside Save (it was at the top of a scrolling body, so a blocked Save looked like nothing happened). Could not reproduce a failed Save with default data in headless Chrome; if it still fails, tell c11 what the footer says.
    - Practice: "Walk me through it" is a persistent button at the right of the feedback row (Help stays at the left). It starts Learn's step-by-step walk for the current question (not scored). "Show me the answer" is removed (handler too; v9 has it in the revert copy).

  Earlier (v9, the user's points of 2026-11-09 14:54):
  This round changed (v9, the user's points of 2026-11-09 14:54):
    - Feedback pill: the neutral ("Try that one again") pill no longer has an empty white bubble; a second miss that ends the round now says "Out of lives".
    - The Practice Help button moved into the left of the feedback row, so the helper row exists only while a helper or the Help menu is showing (no empty row in Learn / Practice). Clicking anywhere that is not a helper closes the Help menu.
    - "Show me the answer" is a red give-up chip; using it turns the question card red and the pill red ("Here's the answer").
    - The full-screen button floats over the top-right corner of the game (translucent until hovered); the HUD keeps room for it. No bar above the game any more.
    - Grand staff: the brace was clipped at the left edge; the drawing's view box now starts left of the stave.
    - Game card: ONE dot when the game has anything learning / testing / catch-up (colour = most urgent: catch-up, testing, learning); hover says how many.
    - Game buttons press like before again (the thick edge is a shadow that shrinks on press, so nothing moves).
    - Score chip is text again and clicking it flips Counting for real <-> Teacher testing only (flipping back to what automatic would be clears the override; a game in progress follows the chip from the next answer).
    - History: whole rows tinted (green counted, yellow teacher testing).
    - Level cards: the drag grip is a handle on the LEFT edge; while dragging, a purple line lights up in the gap the card would drop into (no more rim light).

  Earlier (v8, the user's 19 points of 2026-11-09 14:18):
    - Game bar: one small dot per level (colour = its status; dashed = Not yet) instead of numbers. A pressed game button no longer changes height (no shift).
    - SCORE COUNTING: no more Auto / Save / Practice toggle. Counting is always automatic (class in session = counts for real, otherwise "Teacher testing only: scores not counted").
      A small flask / school button (top right, hidden in student view) opens a menu to override it for ONE game (Count for real / Teacher testing only); the override is never saved,
      goes back to automatic when the game ends or is left (and after 20 minutes). Messages: IN note-id-set-score-mode {mode: auto|real|test}, note-id-score-mode-request;
      OUT note-id-score-mode {override, effective, classInSession} on every change (so ClassroomScreen can dock the toggle).
    - Full screen fills the window: the stage's design size grows with the window (height 640 or width 800 stays; the other side grows up to 1600 x 1200), redrawn on change.
    - History: every row now says Counted (green) or Teacher testing (yellow, not counted); click the chip to flip it, trash to delete a row (this does not change saved class scores). Keeps 200 rows.
    - Level cards: the status colour bar on the left, a white gap, then the card, the same selected or not; the status icon is the same in both states (thick status-colour ring, white inside).
      The up / down arrows are gone: press and HOLD the grip (about half a second), then drag; a chip at the bottom confirms the move with Undo (12 s). Not shown in student view.
    - Windows (level editor, game settings, look, status) keep their scroll place when a choice redraws them (this was jumping to the top).
    - The demo cursor sits under the Start / mode overlay (part of the simulated game). The Help chips collapse as soon as you click anywhere else (chosen helpers stay as cards).
    - History entries gain counted (bool); note-id-session already carried scoreKind.

  Earlier (v7, the user's 27 points of 2026-11-09 12:49; details in claude/NoteID-Handoff.md):
    - NOTE STATES: every note name has ONE of four states (criteria.ns): vis (visible only: clickable, never asked), ask (available as answer),
      grey (greyed out), hide (not shown; a hidden note in a row keeps its space, a fully hidden row is dropped and the others grow). Click a chip to cycle.
      Shortcuts: All accidentals asked / No accidentals asked / Only black keys; per-row "whole row" swatches; naturals All / None asked.
      criteria.notes stays as the derived "asked" flags; criteria.show is gone (v6 levels migrate: asked -> ask, row show/grey/hide -> vis/grey/hide).
    - HELP: in Practice a Help button opens the helper ROW (every offered helper as a chip; tap to turn on, its card replaces the chip; x turns it off; "Show me the answer").
      The helper row now takes only the height it needs (none / one line / two lines; .game.h0 / h1 / h2), so Test and helper-free Learn give the room to the question and answers.
    - HELPERS: own helpers are a Message (Plain / Callout / Big / Steps), a Click-to-reveal hint, or a multiple-choice Question; order and on / off per game as before.
    - LEVEL CARDS: always-visible status icon (strong colour, dashed ring for "Not yet"), big bold number, one-word skill, "What's new" text; no previews or chips.
      Hover a status icon for what it means; the status names, icons, colours and hover texts are editable (config.stateDefs, pencil beside the legend).
    - GAMES: groups (config.groups, type.group) drawn as colour-tinted boxes in the game bar; "Games, groups and look" window (list button beside the gear):
      drag games between and within groups, recolour / rename / add / delete groups, choose Words / Pictures / Both on the game buttons, design the staff picture
      (presets + lines, bars, clef, note) and pick the note-name picture. The v6 "Piano -> Staff" game was removed from the defaults (the teacher had one that does this).
    - START is above the modes and nothing moves when a mode is chosen. Test shows Correct, Goal (the number to reach) and Lives only. Humanised demo cursor (curved paths,
      overshoot, off-centre clicks, drifting after a click). Level delete asks you to type "delete". History gets a Time column.
    - NEW message out: note-id-session {studentId?, typeId, levelId, assignmentId, mode, seconds, correct, total, result, date, scoreKind} when a real session ends;
      note-id-result now also carries assignmentScore {1,1} when passed.

  Storage keys (hyphens only, under NoteID/Data/): noteid-levels-v1, noteid-classscores-v1, noteid-testscores-v1, noteid-results-v1,
    noteid-config-v1 ({v:7, types[] (with group), groups[{id,name,color}], mode, learn, formatIcons, icons{staff{},name}, cardLabel, states, stateDefs, customHelpers[{id,label,icon,kind,style,text,ask,right,wrong}], scoreMode, period}),
    noteid-catalog-v1 (v:2, for Progress), noteid-history-v1. Reads (never writes): Progress/Data/progress-curriculum-v1.

  Messages in: note-id-open-student, note-id-open-level, note-id-open-assignment {assignmentId|typeId+levelId, studentId?, studentName?, mode?},
    note-id-set-score-mode {mode}, note-id-score-mode-request, class-in-session {value}, marking-period-changed {id}, note-id-current (sets that level to "learning"), note-id-set-mode {mode} (preselects only),
    note-id-set-state {assignmentId|typeId+levelId, state: learning|testing|catchup|future}, note-id-link {typeId, levelId, assignmentId, unitId?, unitName?, assignmentName?}.
  Messages out: note-id-result {studentId, studentName, typeId, levelId, assignmentId, correct, total, passed, assignmentScore}, note-id-session (above), note-id-score-mode {override, effective, classInSession}. None wired in CS / Progress yet (board row to c9).

  Known issues / deferred: no sound; forced full-screen + score invalidation (roadmap); student profiles / unlock paths (roadmap); the lesson / helper editor and the smart
    adjustment system (plan in claude/NoteID-Progress-Integration-Plan.md); the enharmonic game (to brainstorm); not tested docked or on the real Progress file.

  ---- Version 2 (2026-09-10), still current ----
  Storage Phase 2: data lives at NoteID/Data/ via DataStore.forRootMigrating(handle, "NoteID/Data", "NoteID") with the verified move
  and sweepThenLoadAll(); dataReady guards every save so a real read error can never be mistaken for "nothing saved yet".
*/
(function(){
  "use strict";

  var APP_NAME = "NoteID";
  var FILE_STORAGE_SUBFOLDER = "NoteID/Data";
  var FILE_STORAGE_LEGACY_SUBFOLDER = "NoteID";
  var CURRICULUM_SUBFOLDER = "Progress/Data";
  var CURRICULUM_KEY = "progress-curriculum-v1";

  // ---------- Storage ----------
  var db = null;
  var rootDirHandle = null;      // the shared folder handle, kept for the read-only Progress curriculum read
  var storageMode = "unknown";   // "file" | "indexeddb" | "localstorage" | "loading" | "load-error"
  var embedded = false;
  var parentOrigin = "*";
  var dataReady = false;         // guards every save until a load has really completed

  function useHandle(handle){
    rootDirHandle = handle;
    db = DataStore.forRootMigrating(handle, FILE_STORAGE_SUBFOLDER, FILE_STORAGE_LEGACY_SUBFOLDER);
    storageMode = "file";
  }

  function makeIndexedDBBackend(){
    var DB_NAME = "noteid-store", STORE_NAME = "kv", dbPromise = null;
    function openDb(){
      if (dbPromise) return dbPromise;
      dbPromise = new Promise(function(resolve, reject){
        var req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = function(){ req.result.createObjectStore(STORE_NAME); };
        req.onsuccess = function(){ resolve(req.result); };
        req.onerror = function(){ reject(req.error || new Error("IndexedDB failed to open")); };
      });
      return dbPromise;
    }
    return {
      get: function(key){
        return openDb().then(function(idb){
          return new Promise(function(resolve, reject){
            var req = idb.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
            req.onsuccess = function(){ resolve(req.result != null ? req.result : null); };
            req.onerror = function(){ reject(req.error); };
          });
        });
      },
      set: function(key, value){
        return openDb().then(function(idb){
          return new Promise(function(resolve, reject){
            var tx = idb.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).put(value, key);
            tx.oncomplete = function(){ resolve(true); };
            tx.onerror = function(){ reject(tx.error); };
          });
        });
      }
    };
  }

  function buildFallbackBackend(){
    var usingIndexedDB = !!window.indexedDB;
    storageMode = usingIndexedDB ? "indexeddb" : "localstorage";
    return usingIndexedDB ? makeIndexedDBBackend() : {
      get: function(key){ try { return Promise.resolve(localStorage.getItem(key)); } catch(e){ return Promise.resolve(null); } },
      set: function(key, value){ try { localStorage.setItem(key, value); return Promise.resolve(true); } catch(e){ return Promise.reject(e); } }
    };
  }

  function renderStorageModeUI(){
    var label = document.getElementById("storageModeLabel");
    var btn = document.getElementById("connectFolderBtn");
    var banner = document.getElementById("storageBanner");
    if (!label || !btn || !banner) return;
    if (storageMode === "file") {
      label.innerHTML = '<i class="ti ti-folder-check" aria-hidden="true"></i> Saving to a local folder';
      btn.style.display = "none";
      banner.classList.remove("show");
    } else if (storageMode === "loading") {
      label.innerHTML = '<i class="ti ti-loader" aria-hidden="true"></i> Loading…';
      btn.style.display = "none";
      banner.classList.remove("show");
    } else if (storageMode === "load-error") {
      label.innerHTML = '<i class="ti ti-alert-triangle" aria-hidden="true"></i> Couldn’t load saved data — not saving until this is resolved';
      btn.style.display = "";
      banner.textContent = "Note ID couldn’t read its saved data from the connected folder. Nothing has been overwritten — try reconnecting, or check the folder’s permissions.";
      banner.classList.add("show");
    } else {
      label.innerHTML = storageMode === "indexeddb"
        ? '<i class="ti ti-database" aria-hidden="true"></i> Saving in this browser'
        : '<i class="ti ti-database" aria-hidden="true"></i> Saving in this browser (limited storage)';
      btn.style.display = embedded ? "none" : "";
      if (embedded) {
        banner.textContent = "Couldn’t get the shared folder from the dock — saving in this browser only for now.";
        banner.classList.add("show");
      } else {
        banner.classList.remove("show");
      }
    }
  }

  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function escapeHtml(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function pretty(name){ return String(name).replace("#", "♯").replace(/b$/, "♭"); }   // F# -> F sharp sign, Bb -> B flat sign
  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

  // ---------- Note-name model ----------
  // Rows are shown A..G (the musical alphabet). LETTERS (C first) is only used for staff / piano geometry.
  var SHARPS_ROW = ["A#","B#","C#","D#","E#","F#","G#"];
  var NATURALS_ROW = ["A","B","C","D","E","F","G"];
  var FLATS_ROW = ["Ab","Bb","Cb","Db","Eb","Fb","Gb"];
  var ALL_NOTE_NAMES = SHARPS_ROW.concat(NATURALS_ROW).concat(FLATS_ROW);
  var ROWS = [["sharps", SHARPS_ROW, "Sharps"], ["naturals", NATURALS_ROW, "Naturals"], ["flats", FLATS_ROW, "Flats"]];
  var LETTERS = ["C","D","E","F","G","A","B"];
  var LETTER_SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var PC_WHITE = { 0: "C", 2: "D", 4: "E", 5: "F", 7: "G", 9: "A", 11: "B" };

  function rowOf(name){ return SHARPS_ROW.indexOf(name) !== -1 ? "sharps" : FLATS_ROW.indexOf(name) !== -1 ? "flats" : "naturals"; }
  function accOf(name){ return name.length > 1 ? name.charAt(1) : ""; }
  function noteSemitoneClass(name){
    var base = LETTER_SEMITONE[name.charAt(0)];
    var acc = accOf(name);
    if (acc === "#") base += 1; else if (acc === "b") base -= 1;
    return ((base % 12) + 12) % 12;
  }

  // ---------- Staff model: clef + range -> the staff positions a note can sit on ----------
  var CLEF_RANGE = {
    treble: { staff: ["E4", "F5"], ledger1: ["C4", "A5"], ledger2: ["A3", "C6"] },
    bass:   { staff: ["G2", "A3"], ledger1: ["E2", "C4"], ledger2: ["C2", "E4"] }
  };
  var RANGE_LABEL = { staff: "On the staff (no ledger lines)", ledger1: "Up to 1 ledger line", ledger2: "Up to 2 ledger lines" };
  var CLEF_LABEL = { treble: "Treble", bass: "Bass", both: "Both (random)" };
  var STYLE_LABEL = { single: "Single staff", grand: "Grand staff" };
  var MIDDLE_LINE = { treble: "B4", bass: "D3" };
  var CLEF_INFO = {
    treble: { anchor: "E", octave: 4, lines: "E G B D F", spaces: "F A C E", word: "Treble" },
    bass:   { anchor: "G", octave: 2, lines: "G B D F A", spaces: "A C E G", word: "Bass" }
  };
  var ACC_POLICY = { either: "Either name", sharp: "The sharp name", flat: "The flat name", both: "Both names" };

  function posIndex(p){ return parseInt(p.slice(1), 10) * 7 + LETTERS.indexOf(p.charAt(0)); }
  function posFromIndex(i){ return { letter: LETTERS[((i % 7) + 7) % 7], octave: Math.floor(i / 7) }; }
  function rangePositions(lowHigh){
    var out = [];
    for (var i = posIndex(lowHigh[0]); i <= posIndex(lowHigh[1]); i++) out.push(posFromIndex(i));
    return out;
  }
  function positionsFor(clef, range){
    return rangePositions((CLEF_RANGE[clef] || CLEF_RANGE.treble)[range] || CLEF_RANGE.treble.staff);
  }
  // low / high note of a level on one clef: a custom range wins over the preset
  function clefBounds(lv, clef){
    var c = lv.criteria, cu = c.custom && c.custom[clef];
    if (cu && cu.length === 2) return cu;
    return (CLEF_RANGE[clef] || CLEF_RANGE.treble)[c.range] || CLEF_RANGE.treble.staff;
  }
  function lvPositions(lv, clef){ return rangePositions(clefBounds(lv, clef)); }
  // how many 10px ledger steps the drawing needs beyond the staff (for the grand-staff crop)
  function rangeExt(lv){
    // grand staff: only the treble's top and the bass's bottom need room (notes between the two staves share the gap)
    var tb = clefBounds(lv, "treble"), bb = clefBounds(lv, "bass"), ts = CLEF_RANGE.treble.staff, bs = CLEF_RANGE.bass.staff;
    var top = lv.criteria.clef === "bass" ? 0 : Math.max(posIndex(tb[1]) - posIndex(ts[1]), 0);
    var bot = lv.criteria.clef === "treble" ? 0 : Math.max(posIndex(bs[0]) - posIndex(bb[0]), 0);
    return Math.min(Math.ceil(Math.max(top, bot) / 2) * 10, 30);
  }
  var C4_INDEX = posIndex("C4");
  function grandClefFor(pos){ return (pos.octave * 7 + LETTERS.indexOf(pos.letter)) >= C4_INDEX ? "treble" : "bass"; }
  // Positions the student can move through when answering on a staff.
  function answerPositions(lv){
    var c = lv.criteria;
    if (c.staffStyle !== "grand") return lvPositions(lv, c.clef === "both" ? "treble" : c.clef);
    var lo, hi;
    if (c.clef === "treble") { lo = clefBounds(lv, "treble")[0]; hi = clefBounds(lv, "treble")[1]; }
    else if (c.clef === "bass") { lo = clefBounds(lv, "bass")[0]; hi = clefBounds(lv, "bass")[1]; }
    else { lo = clefBounds(lv, "bass")[0]; hi = clefBounds(lv, "treble")[1]; }
    return rangePositions([lo, hi]);
  }

  // ---------- Exercise types (editable data) ----------
  var FORMATS = {
    staff: { label: "Note on staff", icon: "ti-music", d: "a note on the staff" },
    name:  { label: "Note name",     icon: "ti-abc",   d: "a letter name" },
    key:   { label: "Piano key",     icon: "ti-piano", d: "a piano key" }
  };
  // Default games and groups, in the teacher's order. (v7: "Piano -> Staff" is gone; the teacher already had a game that does this.)
  var GROUP_COLORS = ["#7b5cf0", "#2d9cdb", "#f08a24", "#2fb067", "#d6459b", "#14a39a", "#e5534b", "#8a6d3b"];
  var DEFAULT_GROUPS = [
    { id: "g-piano-note", name: "Piano \u2194 Note", color: "#7b5cf0" },
    { id: "g-staff-piano", name: "Staff \u2192 Piano", color: "#2d9cdb" },
    { id: "g-note-staff", name: "Note \u2194 Staff", color: "#f08a24" }
  ];
  var DEFAULT_TYPES = [
    { id: "keyToName",   name: "Piano \u2192 Note",  prompt: "key",   answer: "name",  group: "g-piano-note",  old: "Piano Key \u2192 Note Name" },
    { id: "nameToKey",   name: "Note \u2192 Piano",  prompt: "name",  answer: "key",   group: "g-piano-note",  old: "Note Name \u2192 Piano Key" },
    { id: "staffToKey",  name: "Staff \u2192 Piano", prompt: "staff", answer: "key",   group: "g-staff-piano", old: "Note on Staff \u2192 Piano Key" },
    { id: "nameToStaff", name: "Note \u2192 Staff",  prompt: "name",  answer: "staff", group: "g-note-staff",  old: "Note Name \u2192 Note on Staff" },
    { id: "staffToName", name: "Staff \u2192 Note",  prompt: "staff", answer: "name",  group: "g-note-staff",  old: "Note on Staff \u2192 Note Name" }
  ];
  var MODES = [
    { id: "practice", label: "Practice", icon: "ti-barbell" },
    { id: "test",     label: "Test",     icon: "ti-flag" }
  ];
  function modeById(id){ return MODES.filter(function(m){ return m.id === id; })[0] || MODES[1]; }
  var MODULE_TYPES = [];
  var levels = {};            // levels[typeId] = [level, ...] in ladder order
  var classScores = {};       // real class scores: "<typeId>:<levelId>" -> {correct, total}
  var testScores = {};        // practice / test-drive scores, same shape (clearable)
  var results = {};           // per student: studentId -> {"<type>:<level>": {best:{correct,total}, passed, last:{correct,total,passed}, updated}}
  var config = { v: 7, types: null, groups: [], mode: null, learn: {}, formatIcons: {}, icons: {}, cardLabel: "text", states: {}, stateDefs: {}, customHelpers: [], scoreMode: "auto", period: "" };
  var lessons = {};           // v12: Learn lessons per level: { "<typeId>:<levelId>": { steps:[...] } }
  var history = [];           // this device's session history (newest last), capped
  // Level statuses. The four ids are fixed (Progress uses them); the teacher edits the name, icon, colour and hover text.
  var STATE_DEFAULTS = [
    { id: "learning", label: "Learning", icon: "ti-bulb", color: "#2fb067", tip: "The class is learning and practicing this level now." },
    { id: "testing", label: "Testing", icon: "ti-flag", color: "#e9a31a", tip: "This level is being tested now." },
    { id: "catchup", label: "Catch-up", icon: "ti-clock-exclamation", color: "#e5534b", tip: "Past due: anyone who missed it should catch up on it." },
    { id: "future", label: "Not yet", icon: "ti-lock", color: "#8a8a9a", tip: "Coming later. Not in use yet." }
  ];
  function stateList(){
    return STATE_DEFAULTS.map(function(d){
      var o = (config.stateDefs && config.stateDefs[d.id]) || {};
      return { id: d.id, label: o.label || d.label, icon: o.icon || d.icon, color: o.color || d.color, tip: o.tip || d.tip };
    });
  }
  function stateById(id){ return stateList().filter(function(x){ return x.id === id; })[0] || stateList()[3]; }
  function stateIdOk(id){ return STATE_DEFAULTS.some(function(x){ return x.id === id; }); }
  function groupById(id){ return (config.groups || []).filter(function(g){ return g.id === id; })[0] || null; }
  var classInSession = false;

  function moduleTypeById(id){ return MODULE_TYPES.filter(function(m){ return m.id === id; })[0] || null; }
  function defaultTypeById(id){ return DEFAULT_TYPES.filter(function(m){ return m.id === id; })[0] || null; }
  function usesStaff(m){ return m.prompt === "staff" || m.answer === "staff"; }
  function usesKey(m){ return m.prompt === "key" || m.answer === "key"; }
  function levelIndex(m, lv){ return levels[m.id].indexOf(lv); }

  // ---- format icons: our own inline-SVG drawings (no font needed), designable; any Tabler icon can still be chosen per format ----
  var STAFF_ICON_DEFAULT = { lines: 5, left: "single", right: "none", clef: "none", note: "quarter" };
  var STAFF_ICON_PRESETS = [
    { label: "Lines + note", o: { lines: 5, left: "single", right: "none", clef: "none", note: "quarter" } },
    { label: "Lines only", o: { lines: 5, left: "none", right: "none", clef: "none", note: "none" } },
    { label: "Treble clef + note", o: { lines: 5, left: "single", right: "none", clef: "treble", note: "quarter" } },
    { label: "Bass clef + note", o: { lines: 5, left: "single", right: "none", clef: "bass", note: "whole" } },
    { label: "Closed staff", o: { lines: 5, left: "single", right: "final", clef: "none", note: "whole" } },
    { label: "Three lines", o: { lines: 3, left: "none", right: "none", clef: "none", note: "quarter" } },
    { label: "One line + note", o: { lines: 1, left: "none", right: "none", clef: "none", note: "quarter" } }
  ];
  var NAME_ICON_KINDS = [["sharp", "A\u266F"], ["tag", "Name tag"], ["abc", "C D E"], ["bubble", "Speech bubble"], ["letter", "Plain A"]];
  function staffIconOpts(){ var o = {}, c = (config.icons && config.icons.staff) || {}; Object.keys(STAFF_ICON_DEFAULT).forEach(function(k){ o[k] = c[k] !== undefined ? c[k] : STAFF_ICON_DEFAULT[k]; }); return o; }
  function staffIconSvg(o, cls){
    o = o || staffIconOpts();
    var W = 38, H = 24, sp = o.lines === 5 ? 3.6 : o.lines === 3 ? 4.6 : 0, mid = 12, ys = [];
    if (o.lines === 5) for (var i = 0; i < 5; i++) ys.push(mid - 2 * sp + i * sp); else if (o.lines === 3) for (var j = 0; j < 3; j++) ys.push(mid - sp + j * sp); else ys.push(mid);
    var top = ys[0], bot = ys[ys.length - 1], x1 = 3, x2 = W - 3, s = '<g stroke="currentColor" fill="none" stroke-width="1.2">';
    ys.forEach(function(y){ s += '<line x1="' + x1 + '" x2="' + x2 + '" y1="' + y + '" y2="' + y + '"/>'; });
    var bt = o.lines === 1 ? mid - 5 : top, bb = o.lines === 1 ? mid + 5 : bot;
    if (o.left && o.left !== "none") s += '<line x1="' + x1 + '" x2="' + x1 + '" y1="' + bt + '" y2="' + bb + '" stroke-width="1.6"/>';
    if (o.right === "single") s += '<line x1="' + x2 + '" x2="' + x2 + '" y1="' + bt + '" y2="' + bb + '" stroke-width="1.6"/>';
    if (o.right === "double") s += '<line x1="' + (x2 - 3) + '" x2="' + (x2 - 3) + '" y1="' + bt + '" y2="' + bb + '" stroke-width="1.2"/><line x1="' + x2 + '" x2="' + x2 + '" y1="' + bt + '" y2="' + bb + '" stroke-width="1.6"/>';
    if (o.right === "final") s += '<line x1="' + (x2 - 4) + '" x2="' + (x2 - 4) + '" y1="' + bt + '" y2="' + bb + '" stroke-width="1.2"/><line x1="' + (x2 - 0.5) + '" x2="' + (x2 - 0.5) + '" y1="' + bt + '" y2="' + bb + '" stroke-width="3.2"/>';
    s += '</g>';
    var nx = 21;
    if (o.lines === 5 && o.clef === "treble") { s += '<text x="5.5" y="' + (ys[3] + 0.6) + '" font-family="Bravura,serif" font-size="' + (4 * sp) + '" fill="currentColor">\uE050</text>'; nx = 24; }
    if (o.lines === 5 && o.clef === "bass") { s += '<text x="5.5" y="' + (ys[1]) + '" font-family="Bravura,serif" font-size="' + (4 * sp) + '" fill="currentColor">\uE062</text>'; nx = 24; }
    if (o.note && o.note !== "none") {
      var ny = o.lines === 5 ? ys[3] - sp / 2 : o.lines === 3 ? ys[1] : mid;   // a space (or the line) in the lower middle
      var rx = o.lines === 5 ? 3.5 : 4, ry = o.lines === 5 ? 2.5 : 3;
      if (o.note === "whole") s += '<ellipse cx="' + nx + '" cy="' + ny + '" rx="' + (rx + 0.6) + '" ry="' + ry + '" fill="none" stroke="currentColor" stroke-width="1.8"/>';
      else {
        s += '<ellipse cx="' + nx + '" cy="' + ny + '" rx="' + rx + '" ry="' + ry + '" fill="' + (o.note === "half" ? "none" : "currentColor") + '" stroke="currentColor" stroke-width="' + (o.note === "half" ? 1.5 : 1) + '" transform="rotate(-20 ' + nx + ' ' + ny + ')"/>' +
          '<line x1="' + (nx + rx - 0.4) + '" x2="' + (nx + rx - 0.4) + '" y1="' + ny + '" y2="' + (ny - 11) + '" stroke="currentColor" stroke-width="1.4"/>';
      }
    }
    return '<svg class="fmtsvg ' + (cls || "") + '" viewBox="0 0 ' + W + ' ' + H + '" height="1.15em" aria-hidden="true">' + s + '</svg>';
  }
  function nameIconSvg(kind){
    var A = 'font-family="system-ui,sans-serif" font-weight="700" fill="currentColor" text-anchor="middle"';
    var inner = {
      sharp: '<text x="19" y="18.5" font-size="17" ' + A + '>A\u266F</text>',
      letter: '<text x="12" y="19" font-size="19" ' + A + '>A</text>',
      abc: '<text x="19" y="17" font-size="11.5" ' + A + ' letter-spacing="1">C D E</text>',
      tag: '<rect x="5" y="5" width="28" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="15" y="2.5" width="8" height="5" rx="2" fill="currentColor"/><text x="19" y="18" font-size="11" ' + A + '>A</text>',
      bubble: '<path d="M6 4h26a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H17l-6 4.5V19H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><text x="19" y="15.2" font-size="10.5" ' + A + '>A\u266F</text>'
    };
    var w = kind === "letter" ? 24 : 38;
    return '<svg class="fmtsvg" viewBox="0 0 ' + w + ' 24" height="1.15em" aria-hidden="true">' + (inner[kind] || inner.sharp) + '</svg>';
  }
  var KEY_SVG = '<svg class="fmtsvg" viewBox="0 0 24 24" height="1.15em" aria-hidden="true"><rect x="2.5" y="4" width="19" height="16" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/><line x1="8.8" y1="4" x2="8.8" y2="20" stroke="currentColor" stroke-width="1.1"/><line x1="15.2" y1="4" x2="15.2" y2="20" stroke="currentColor" stroke-width="1.1"/><rect x="7" y="4" width="3.6" height="9.5" fill="currentColor"/><rect x="13.4" y="4" width="3.6" height="9.5" fill="currentColor"/></svg>';
  function fmtDrawing(fmt){ return fmt === "staff" ? staffIconSvg() : fmt === "name" ? nameIconSvg((config.icons && config.icons.name) || "sharp") : KEY_SVG; }
  function fmtIconHtml(fmt, override){
    var v = override !== undefined ? override : (config.formatIcons && config.formatIcons[fmt]);
    if (v && v !== "svg") return '<i class="ti ' + escapeHtml(v) + '" aria-hidden="true"></i>';
    return fmtDrawing(fmt);
  }
  function typeIconsHtml(m){
    return '<span class="gicons">' + fmtIconHtml(m.prompt) + '<i class="ti ti-arrow-right garrow" aria-hidden="true"></i>' + fmtIconHtml(m.answer) + '</span>';
  }

  // ---------- Helpers (interactive on-screen aids; they replace the old listed steps) ----------
  // kind: overlay (drawn on the staff / keys), question (the student answers it), stepper (the student steps it), strip (a reference bar)
  // Order here = the order they fade out in Learn (first goes first); Practice adds the LAST ones first.
  var HELPERS = [
    { id: "lineSpace",   label: "Line or space?", short: "Line or space?", icon: "ti-help-circle",  kind: "question", applies: function(m){ return m.prompt === "staff"; } },
    { id: "countUp",     label: "Count up from the bottom line", short: "Count up", icon: "ti-stairs-up", kind: "stepper",  applies: function(m){ return usesStaff(m); } },
    { id: "alphabet",    label: "Musical alphabet", short: "Alphabet", icon: "ti-abc",          kind: "strip",    applies: function(){ return true; } },
    { id: "findC",       label: "Find C (the 2-black-key group)", short: "Find C", icon: "ti-search",    kind: "overlay",  applies: function(m){ return usesKey(m); } },
    { id: "keyNames",    label: "White-key names", short: "Key names", icon: "ti-letter-case",  kind: "overlay",  applies: function(m){ return usesKey(m); } },
    { id: "staffLetters", label: "Line and space letters", short: "Staff letters", icon: "ti-list-letters", kind: "overlay",  applies: function(m){ return usesStaff(m); } }
  ];
  function customHelpers(){
    return (config.customHelpers || []).map(function(c){
      return { id: c.id, label: c.label || "Helper", short: c.label || "Helper", icon: c.icon || "ti-bulb", kind: ["text", "reveal", "question"].indexOf(c.kind) !== -1 ? c.kind : "text", style: c.style || "plain",
        text: c.text || "", ask: c.ask || "", right: c.right || "", wrong: c.wrong || "", custom: true, applies: function(){ return true; } };
    });
  }
  function allHelpers(){ return HELPERS.concat(customHelpers()); }
  function helperById(id){ return allHelpers().filter(function(h){ return h.id === id; })[0] || null; }
  function defaultHelperIds(m){ return HELPERS.filter(function(h){ return h.applies(m); }).map(function(h){ return h.id; }); }   // custom (text) helpers are added per game in settings
  // the helpers this game offers (in fade order)
  function offeredHelpers(m){
    return (m.helpers || defaultHelperIds(m)).map(helperById).filter(function(h){ return h && h.applies(m); });
  }

  function typeLabel(m){ return m.name; }
  // "Piano ID 2 (Sharps)"
  function levelTitle(m, idxOrLevel, withFocus){
    var i = typeof idxOrLevel === "number" ? idxOrLevel : levelIndex(m, idxOrLevel);
    var base = m.name + " " + (i + 1);
    if (withFocus === false) return base;
    var lv = typeof idxOrLevel === "number" ? (levels[m.id] || [])[i] : idxOrLevel;
    var fn = lv ? focusName(lv) : "";
    return fn ? base + " (" + fn + ")" : base;
  }
  function focusName(lv){ var n = (lv.name || "").trim(); return /^level\s*\d*$/i.test(n) ? "" : n; }

  function normalizeType(t){
    var d = defaultTypeById(t && t.id);
    var o = { id: (t && t.id) || uid(), name: "", prompt: "staff", answer: "name", learnStreak: 3, strikes: 2, testGoal: 10, helpers: null, group: "", defaults: { clef: "treble", staffStyle: "single", accidentals: "either" } };
    if (d) { o.name = d.name; o.prompt = d.prompt; o.answer = d.answer; o.group = d.group || ""; }
    if (t) {
      if (t.name && String(t.name).trim()) o.name = String(t.name).trim();
      if (FORMATS[t.prompt]) o.prompt = t.prompt;
      if (FORMATS[t.answer]) o.answer = t.answer;
      if (t.learnStreak >= 1 && t.learnStreak <= 20) o.learnStreak = Math.round(t.learnStreak);
      if (t.strikes >= 1 && t.strikes <= 5) o.strikes = Math.round(t.strikes);
      if (t.testGoal >= 3 && t.testGoal <= 50) o.testGoal = Math.round(t.testGoal);
      if (typeof t.group === "string") o.group = t.group;
      if (t.defaults && typeof t.defaults === "object") { var df = t.defaults; if (["treble", "bass", "both"].indexOf(df.clef) !== -1) o.defaults.clef = df.clef; if (["single", "grand"].indexOf(df.staffStyle) !== -1) o.defaults.staffStyle = df.staffStyle; if (ACC_POLICY[df.accidentals]) o.defaults.accidentals = df.accidentals; }
      if (Array.isArray(t.helpers)) o.helpers = t.helpers.filter(function(id){ return helperById(id); });
    }
    if (o.prompt === o.answer) o.answer = o.prompt === "name" ? "staff" : "name";
    if (!o.name) o.name = "Exercise";
    if (!o.helpers) o.helpers = defaultHelperIds(o);
    return o;
  }
  // v6: short two-word names; v7: games belong to groups (a colour-tinted box in the game bar)
  function migrateTypesV6(list){
    var byId = {};
    list.forEach(function(t){ byId[t.id] = t; });
    var out = [];
    DEFAULT_TYPES.forEach(function(d){
      var t = byId[d.id] || { id: d.id };
      if (!t.name || t.name === d.old) t.name = d.name;
      t.group = d.group;
      out.push(t); delete byId[d.id];
    });
    list.forEach(function(t){ if (byId[t.id]) out.push(t); });   // the teacher's own games stay at the end
    return out;
  }
  // v6 -> v7: the old "break before" marks (type.gap) become groups, keeping the teacher's order
  function migrateGroupsV7(list){
    config.groups = [];
    var used = {}, blocks = [], cur = null;
    list.forEach(function(t){ if (cur === null || t.gap) { cur = []; blocks.push(cur); } cur.push(t); });
    blocks.forEach(function(b, bi){
      var dg = null;
      b.forEach(function(t){ var d = defaultTypeById(t.id); if (!dg && d && d.group && !used[d.group]) dg = d.group; });
      var gid, def = dg ? DEFAULT_GROUPS.filter(function(g){ return g.id === dg; })[0] : null;
      if (def) { gid = dg; used[gid] = true; config.groups.push({ id: gid, name: def.name, color: def.color }); }
      else { gid = "g" + uid(); config.groups.push({ id: gid, name: "Group " + (bi + 1), color: GROUP_COLORS[bi % GROUP_COLORS.length] }); }
      b.forEach(function(t){ t.group = gid; });
    });
  }
  // games sit in the order of their groups (config.groups); games with no group come last
  function sortByGroups(){
    var order = {};
    (config.groups || []).forEach(function(g, i){ order[g.id] = i; });
    MODULE_TYPES.forEach(function(t){ if (t.group && order[t.group] === undefined) t.group = ""; });
    var idx = MODULE_TYPES.map(function(t, i){ return { t: t, i: i, g: t.group ? order[t.group] : 9999 }; });
    idx.sort(function(a, b){ return a.g - b.g || a.i - b.i; });
    MODULE_TYPES = idx.map(function(x){ return x.t; });
    config.types = MODULE_TYPES;
  }
  // the game bar's blocks: a group (tinted box) or a lone game
  function typeBlocks(){
    var out = [], cur = null;
    MODULE_TYPES.forEach(function(m){
      var g = m.group ? groupById(m.group) : null;
      if (!g) { out.push({ group: null, types: [m] }); cur = null; }
      else if (cur && cur.group && cur.group.id === g.id) cur.types.push(m);
      else { cur = { group: g, types: [m] }; out.push(cur); }
    });
    return out;
  }
  function buildTypes(){
    var list = null, fromV = config.v || 0;
    if (config.types && config.types.length) list = config.types;
    else {
      list = DEFAULT_TYPES.map(function(d){
        var c = { id: d.id };
        if (config.typeNames && config.typeNames[d.id]) c.name = config.typeNames[d.id];   // v3 renames
        return c;
      });
      fromV = Math.min(fromV, 5);
    }
    if (fromV < 6) list = migrateTypesV6(list);
    if (fromV < 7) {
      if (fromV < 6 || !config.groups || !config.groups.length) {
        if (fromV < 6) config.groups = JSON.parse(JSON.stringify(DEFAULT_GROUPS)); else migrateGroupsV7(list);
      }
    }
    MODULE_TYPES = list.map(normalizeType);
    config.types = MODULE_TYPES;
    sortByGroups();
    if (window.STUDENT_CONFIG && STUDENT_CONFIG.games) { MODULE_TYPES = MODULE_TYPES.filter(function(m){ return STUDENT_CONFIG.games[m.id] !== false; }); config.types = MODULE_TYPES; }   // STUDENT: games the teacher switched off
    MODULE_TYPES.forEach(function(m){ if (!levels[m.id]) levels[m.id] = []; });
    if (!moduleTypeById(hubTypeId)) hubTypeId = MODULE_TYPES.length ? MODULE_TYPES[0].id : null;
    if (!moduleTypeById(planTypeId)) planTypeId = hubTypeId;
  }

  // ---------- Levels ----------
  // Each note name has one of four states (v7): vis = visible only (shown and clickable, never asked), ask = available as an answer
  // (can be asked), grey = greyed out (shown, not clickable, never asked), hide = not shown (its space stays when part of a row).
  var NS_STATES = ["vis", "ask", "grey", "hide"];
  var NS_INFO = {
    vis:  { label: "Visible only", tip: "Visible only: shown and clickable, but never asked (a distractor)" },
    ask:  { label: "Available as answer", tip: "Available as answer: can be asked, and is clickable" },
    grey: { label: "Greyed out", tip: "Greyed out: shown but not clickable, never asked" },
    hide: { label: "Hidden", tip: "Hidden: not shown in the game" }
  };
  function defaultNs(){
    var ns = {};
    ALL_NOTE_NAMES.forEach(function(n){ ns[n] = NATURALS_ROW.indexOf(n) !== -1 ? "ask" : "vis"; });
    return ns;
  }
  function syncNotes(c){ c.notes = {}; ALL_NOTE_NAMES.forEach(function(n){ c.notes[n] = c.ns[n] === "ask"; }); }
  function setNs(c, n, st){ c.ns[n] = st; c.notes[n] = st === "ask"; }
  function nextNs(st){ return NS_STATES[(NS_STATES.indexOf(st) + 1) % 4]; }
  function newLevelShell(name, mt){
    var df = (mt && mt.defaults) || {};
    var lv = { id: uid(), name: name || "", blurb: "", instructions: "", icon: "ti-star", link: null, isNew: false,
      criteria: { ns: defaultNs(), clef: df.clef || "treble", staffStyle: df.staffStyle || "single", range: "staff", custom: null, accidentals: df.accidentals || "either" } };
    syncNotes(lv.criteria);
    return lv;
  }
  // a copy of a level placed after it, flagged so it shows as new until it is edited
  function cloneLevel(lv){
    var c = JSON.parse(JSON.stringify(lv));
    c.id = uid(); c.name = "New level"; c.isNew = true; c.link = null; c.blurb = "";
    return c;
  }
  var OLD_SEED_TEXTS = ["Read the note on the staff and pick its name.", "Read the note on the staff and click the matching piano key."];
  function normalizeLevel(lv){
    if (!lv || typeof lv !== "object") return newLevelShell("");
    if (typeof lv.id !== "string" || !lv.id) lv.id = uid();
    lv.name = lv.name ? String(lv.name) : "";
    lv.blurb = lv.blurb ? String(lv.blurb) : "";
    lv.instructions = lv.instructions ? String(lv.instructions) : "";
    if (OLD_SEED_TEXTS.indexOf(lv.instructions) !== -1) lv.instructions = "";   // instructions are optional now; drop the old starter text
    lv.icon = lv.icon ? String(lv.icon) : "ti-star";
    lv.isNew = !!lv.isNew;
    if (!lv.criteria || typeof lv.criteria !== "object") lv.criteria = {};
    var c = lv.criteria;
    if (!c.ns || typeof c.ns !== "object") {   // v6 and older: "asked" flags plus a show / grey / hide mode per row
      var oldNotes = (c.notes && typeof c.notes === "object") ? c.notes : null, oldShow = (c.show && typeof c.show === "object") ? c.show : {};
      c.ns = {};
      ALL_NOTE_NAMES.forEach(function(n){
        var asked = oldNotes ? !!oldNotes[n] : NATURALS_ROW.indexOf(n) !== -1, mode = oldShow[rowOf(n)] || "show";
        c.ns[n] = asked ? "ask" : mode === "grey" ? "grey" : mode === "hide" ? "hide" : "vis";
      });
    }
    ALL_NOTE_NAMES.forEach(function(n){ if (NS_STATES.indexOf(c.ns[n]) === -1) c.ns[n] = "vis"; });
    syncNotes(c); delete c.show;
    if (c.clef !== "treble" && c.clef !== "bass" && c.clef !== "both") c.clef = "treble";
    if (c.staffStyle !== "single" && c.staffStyle !== "grand") c.staffStyle = "single";
    if (!RANGE_LABEL[c.range]) c.range = "staff";
    if (c.custom && typeof c.custom === "object") {
      ["treble", "bass"].forEach(function(cl){
        var v = c.custom[cl];
        if (!(v && v.length === 2 && /^[A-G]\d$/.test(v[0]) && /^[A-G]\d$/.test(v[1]) && posIndex(v[0]) <= posIndex(v[1]))) delete c.custom[cl];
      });
      if (!c.custom.treble && !c.custom.bass) c.custom = null;
    } else c.custom = null;
    if (!ACC_POLICY[c.accidentals]) c.accidentals = "either";
    if (!lv.link || typeof lv.link !== "object" || (!lv.link.assignmentId && !lv.link.assignmentName)) lv.link = null;
    return lv;
  }
  function seedDefaultLevels(){
    MODULE_TYPES.forEach(function(m){
      var a = newLevelShell("Naturals", m); a.blurb = "Naturals only, no ledger lines.";
      levels[m.id] = [a];
    });
  }

  function parseJSON(v){ if (typeof v === "string") { try { return JSON.parse(v); } catch(e){ return null; } } return v; }

  function sweepThenLoadAll(){
    var sweep = (db && typeof db.sweep === "function") ? db.sweep() : Promise.resolve();
    return sweep.catch(function(e){
      console.warn("NoteID: eager migration sweep failed (non-fatal, individual key reads still migrate normally)", e);
    }).then(function(){ return loadAll(); });
  }

  function loadAll(){
    return Promise.all([
      db.get("noteid-levels-v1"),
      db.get("noteid-classscores-v1"),
      db.get("noteid-config-v1"),
      db.get("noteid-testscores-v1"),
      db.get("noteid-results-v1"),
      db.get("noteid-history-v1"),
      db.get("noteid-lessons-v1")
    ]).then(function(r){
      var cf = parseJSON(r[2]) || {};
      config = { v: cf.v || 0, types: Array.isArray(cf.types) ? cf.types : null, typeNames: cf.typeNames || {},
        groups: Array.isArray(cf.groups) ? cf.groups.filter(function(g){ return g && typeof g.id === "string" && g.id; }).map(function(g){ return { id: g.id, name: String(g.name || "Group"), color: /^#[0-9a-f]{6}$/i.test(g.color || "") ? g.color : GROUP_COLORS[0] }; }) : [],
        icons: (cf.icons && typeof cf.icons === "object") ? cf.icons : {}, cardLabel: ["text", "icons", "both"].indexOf(cf.cardLabel) !== -1 ? cf.cardLabel : "text",
        stateDefs: (cf.stateDefs && typeof cf.stateDefs === "object") ? cf.stateDefs : {},
        mode: (cf.mode === "learn" || cf.mode === "practice" || cf.mode === "test") && cf.v >= 6 ? cf.mode : null, learn: (cf.learn && typeof cf.learn === "object") ? cf.learn : {},
        formatIcons: (cf.formatIcons && typeof cf.formatIcons === "object") ? cf.formatIcons : {}, states: (cf.states && typeof cf.states === "object") ? cf.states : {},
        customHelpers: Array.isArray(cf.customHelpers) ? cf.customHelpers : [], oldCurrent: cf.current || {},
        scoreMode: ["auto", "real", "test"].indexOf(cf.scoreMode) !== -1 ? cf.scoreMode : "auto", period: cf.period ? String(cf.period) : "" };
      levels = {};
      buildTypes();
      config.v = 7;
      Object.keys(config.oldCurrent || {}).forEach(function(t){ var k = t + ":" + config.oldCurrent[t]; if (!config.states[k]) config.states[k] = "learning"; });   // v5 pin -> v6 state
      delete config.oldCurrent;
      var loadedLevels = parseJSON(r[0]);
      if (loadedLevels && typeof loadedLevels === "object") {
        MODULE_TYPES.forEach(function(m){ levels[m.id] = (Array.isArray(loadedLevels[m.id]) ? loadedLevels[m.id] : []).map(normalizeLevel); });
      } else { loadedLevels = null; seedDefaultLevels(); }
      MODULE_TYPES.forEach(function(m){ if (!levels[m.id].length) { var f = newLevelShell("Naturals", m); f.blurb = "Naturals only, no ledger lines."; levels[m.id] = [f]; if (loadedLevels) loadedLevels.__changed = true; } });
      var cs = parseJSON(r[1]); classScores = (cs && typeof cs === "object") ? cs : {};
      var ts = parseJSON(r[3]); testScores = (ts && typeof ts === "object") ? ts : {};
      var rs = parseJSON(r[4]); results = (rs && typeof rs === "object") ? rs : {};
      var hs = parseJSON(r[5]); history = Array.isArray(hs) ? hs : [];
      var lsn = parseJSON(r[6]); lessons = (lsn && lsn.lessons && typeof lsn.lessons === "object") ? lsn.lessons : {}; walks = (lsn && lsn.walks && typeof lsn.walks === "object") ? lsn.walks : {};
      lsLayouts = (lsn && Array.isArray(lsn.layouts)) ? lsn.layouts : [];
      Object.keys(lessons).forEach(function(k){ lessons[k] = migrateLesson(lessons[k]); });
      Object.keys(lessons).forEach(function(k){ var tid = k.split(":")[0]; ((lessons[k] || {}).slides || []).forEach(function(sl2){ boxesOf(sl2).forEach(function(b){ if (b.walkSteps && b.walkSteps.length && b.walkMode && b.walkMode !== "auto" && !(walks[tid] && walks[tid].steps && walks[tid].steps.length)) walks[tid] = { mode: b.walkMode, steps: b.walkSteps.slice() }; delete b.walkMode; delete b.walkSteps; }); }); });   // v18 per-box walks -> the game's one walk   // v12 step lists / v15 parts -> v16 boxes
      dataReady = true;
      if (!loadedLevels || loadedLevels.__changed) saveLevels();
      saveConfig();
      curriculumLoad();
      renderApp();
      pendingMsgs.splice(0).forEach(function(e){ try { handleMessage(e); } catch (err) { console.error("NoteID: queued message failed", err); } });
    }).catch(function(err){
      console.error("NoteID: loading saved data failed", err);
      storageMode = "load-error";
      renderStorageModeUI();
    });
  }
  function dbSet(key, val){
    if (!dataReady) return;
    db.set(key, JSON.stringify(val)).catch(function(err){ console.error("NoteID: failed to save " + key + ":", err); });
  }
  function saveLevels(){ dbSet("noteid-levels-v1", levels); publishCatalog(); }
  function saveClassScores(){ dbSet("noteid-classscores-v1", classScores); }
  function saveTestScores(){ dbSet("noteid-testscores-v1", testScores); }
  function saveHistory(){ dbSet("noteid-history-v1", history); }
  function addHistory(e){ history.push(e); if (history.length > 200) history = history.slice(-200); saveHistory(); }
  function levelState(m, lv){ return config.states[m.id + ":" + lv.id] || "future"; }
  function typeStateSummary(m){
    var out = { learning: 0, testing: 0, catchup: 0 };
    (levels[m.id] || []).forEach(function(lv){ var st = levelState(m, lv); if (out[st] !== undefined) out[st]++; });
    return out;
  }
  function saveResults(){ dbSet("noteid-results-v1", results); }
  function saveConfig(noCatalog){
    dbSet("noteid-config-v1", { v: 7, types: config.types, groups: config.groups, mode: config.mode, learn: config.learn, formatIcons: config.formatIcons, icons: config.icons, cardLabel: config.cardLabel, states: config.states, stateDefs: config.stateDefs, customHelpers: config.customHelpers, scoreMode: config.scoreMode, period: config.period });
    if (!noCatalog) publishCatalog();
  }
  // NoteID's own read-only listing for Progress.
  function publishCatalog(){
    if (!dataReady || !db) return;
    var cat = { v: 2, updated: new Date().toISOString(), types: [], levels: [] };
    MODULE_TYPES.forEach(function(m){
      cat.types.push({ id: m.id, name: m.name, prompt: m.prompt, answer: m.answer, testGoal: m.testGoal, strikes: m.strikes });
      (levels[m.id] || []).forEach(function(lv, i){
        cat.levels.push({ typeId: m.id, typeName: m.name, levelId: lv.id, n: i + 1, title: levelTitle(m, i, false), name: lv.name || "",
          assignmentId: (lv.link && lv.link.assignmentId) || null, state: levelState(m, lv), classScore: classScores[m.id + ":" + lv.id] || null });
      });
    });
    dbSet("noteid-catalog-v1", cat);
  }

  // ---------- Scores: class (real) / practice (test) / student ----------
  var scoreOverride = null, scoreOverrideAt = 0;      // teacher override, never saved: null = automatic
  function autoScoring(){ return classInSession ? "real" : "test"; }
  function overrideActive(){ if (scoreOverride && Date.now() - scoreOverrideAt > 20 * 60 * 1000) scoreOverride = null; return scoreOverride; }
  function currentScoring(){ return overrideActive() || autoScoring(); }
  function postScoreMode(){
    if (window.parent && window.parent !== window) window.parent.postMessage({ type: "note-id-score-mode", app: APP_NAME, override: overrideActive(), effective: currentScoring(), classInSession: !!classInSession }, parentOrigin);
  }
  function setScoreOverride(m){
    scoreOverride = (m === "real" || m === "test") ? m : null; scoreOverrideAt = Date.now();
    postScoreMode(); renderScoreChip(); applyScoreToSession(); if (view === "plan") renderPlan();
  }
  // clicking the chip flips between counting for real and teacher testing; flipping back to what automatic would be clears the override
  function toggleScoreMode(){
    var next = currentScoring() === "real" ? "test" : "real";
    setScoreOverride(next === autoScoring() ? null : next);
  }
  // a game already running follows the chip from the next answer on
  function applyScoreToSession(){
    var s = currentSession; if (!s || s.demo || s.scoreKind === "student") return;
    s.scoreKind = currentScoring();
    var c = document.getElementById("hudScore");
    if (c) { c.className = "hud-chip" + (s.scoreKind === "real" ? " real" : ""); c.textContent = scoreKindText(s); }
  }
  function scoreChipHtml(){
    var eff = currentScoring(), ov = overrideActive();
    var txt = eff === "real" ? "Counting for real" : "Teacher testing only: scores not counted";
    var other = eff === "real" ? "teacher testing only" : "counting for real";
    return '<button type="button" class="scorechip ' + (eff === "real" ? "real" : "test") + (ov ? " ov" : "") + '" data-action="score-toggle" title="' + escapeHtml(txt + (ov ? " (set by you; automatic again when the game ends)" : " (automatic)") + ". Click to switch to " + other) + '" aria-label="Score counting"><i class="ti ' + (eff === "real" ? "ti-school" : "ti-flask") + '" aria-hidden="true"></i><span>' + escapeHtml(txt) + '</span>' + (ov ? '<em>set by you</em>' : "") + '</button>';
  }
  function scoreBucket(kind){ return kind === "real" ? classScores : testScores; }
  function scoreLabel(typeId, levelId, kind){
    var s = scoreBucket(kind || "real")[typeId + ":" + levelId];
    return s && s.total ? (s.correct + "/" + s.total + " (" + Math.round(100 * s.correct / s.total) + "%)") : "none yet";
  }
  function setPeriod(id){
    id = String(id || ""); if (!id) return;
    if (config.period && config.period !== id) { classScores = {}; saveClassScores(); }
    if (config.period !== id) { config.period = id; saveConfig(true); }
  }

  // ---------- Progress curriculum (read-only mirror) ----------
  var mirror = { ok: false, loaded: false, units: [], types: [], why: "", tried: [] };
  var CURRICULUM_PLACES = [CURRICULUM_SUBFOLDER, "Progress", ""];
  function curriculumLoad(){
    mirror.loaded = false; mirror.tried = [];
    if (!(typeof DataStore !== "undefined" && typeof DataStore.loadJSON === "function")) { mirror.loaded = true; mirror.why = "The storage helper (lib/storage.js) has no loadJSON."; return afterMirror(); }
    if (!rootDirHandle) { mirror.loaded = true; mirror.ok = false; mirror.why = "No shared folder is connected (the dock did not hand over a folder, or this page is running on its own)."; return afterMirror(); }
    var i = 0;
    function next(){
      if (i >= CURRICULUM_PLACES.length) {
        mirror.ok = false; mirror.loaded = true;
        mirror.why = "Looked for " + CURRICULUM_KEY + " in " + mirror.tried.join(", ") + " and found nothing readable.";
        return afterMirror();
      }
      var place = CURRICULUM_PLACES[i++];
      mirror.tried.push(place || "(folder root)");
      Promise.resolve().then(function(){ return DataStore.loadJSON(CURRICULUM_KEY, place, rootDirHandle); })
        .then(parseJSON)
        .then(function(c){
          if (c && Array.isArray(c.units)) { mirror.units = c.units; mirror.types = Array.isArray(c.exerciseTypes) ? c.exerciseTypes : []; mirror.ok = true; mirror.why = ""; mirror.loaded = true; mirror.where = place; afterMirror(); }
          else next();
        })
        .catch(function(){ next(); });
    }
    next();
  }
  window.noteIdDebug = function(){ return { mirror: mirror, hasHandle: !!rootDirHandle, storageMode: storageMode, config: config, session: currentSession, levels: levels, results: results, classScores: classScores, testScores: testScores, staff: (typeof staffAnswer !== "undefined" ? staffAnswer : null) }; };
  function afterMirror(){
    if (currentSession) return;
    if (editing) { syncDraft(); renderLevelEditorModal(); }
    else if (!typeEdit) renderApp();
  }
  function noteIdTypeIds(){
    return mirror.types.filter(function(t){ return /note\s*-?\s*id/i.test(String(t && t.name || "")); }).map(function(t){ return t.id; });
  }
  function findAssignment(assignmentId){
    for (var i = 0; i < mirror.units.length; i++) {
      var u = mirror.units[i], list = u.assignments || [];
      for (var j = 0; j < list.length; j++) if (list[j].id === assignmentId) return { unit: u, a: list[j] };
    }
    return null;
  }
  function linkFrom(unit, a){ return { unitId: unit.id || "", unitName: unit.name || "", assignmentId: a.id, assignmentName: a.name || "" }; }
  function linkInfo(lv){
    var l = lv.link; if (!l) return null;
    var unit = l.unitName || "", name = l.assignmentName || "", missing = false;
    if (mirror.ok && l.assignmentId) {
      var f = findAssignment(l.assignmentId);
      if (f) { unit = f.unit.name || unit; name = f.a.name || name; } else { missing = true; }
    }
    return { text: (unit ? unit + " · " : "") + (name || "(unnamed)"), missing: missing };
  }
  function linkChipHtml(lv){
    var li = linkInfo(lv);
    if (!li) return '<span class="chip warn"><i class="ti ti-unlink" aria-hidden="true"></i> Not linked to Progress</span>';
    return '<span class="chip ' + (li.missing ? "warn" : "link") + '" title="' + (li.missing ? "This assignment is no longer in Progress’s curriculum" : "Progress curriculum") + '"><i class="ti ti-link" aria-hidden="true"></i> ' + escapeHtml(li.text) + (li.missing ? " (not found)" : "") + '</span>';
  }
  function normName(s){ return String(s || "").toLowerCase().replace(/\s+/g, " ").trim(); }

  // ---------- Level rules: what is shown, greyed, clickable, accepted (per note name: vis / ask / grey / hide) ----------
  function nsOf(lv, n){ return lv.criteria.ns[n] || "vis"; }
  function poolFor(lv){ return ALL_NOTE_NAMES.filter(function(n){ return nsOf(lv, n) === "ask"; }); }
  function nameClickable(lv, n){ var s = nsOf(lv, n); return s === "vis" || s === "ask"; }
  function nameGreyed(lv, n){ return nsOf(lv, n) === "grey"; }
  function nameHidden(lv, n){ return nsOf(lv, n) === "hide"; }
  function rowNamesOf(acc){ return acc === "#" ? SHARPS_ROW : acc === "b" ? FLATS_ROW : NATURALS_ROW; }
  function pianoEnabled(lv, cls){ return ALL_NOTE_NAMES.some(function(n){ return noteSemitoneClass(n) === cls && nameClickable(lv, n); }); }
  function accEnabled(lv, acc){ return rowNamesOf(acc).some(function(n){ return nameClickable(lv, n); }); }
  function accVisible(lv, acc){ return rowNamesOf(acc).some(function(n){ return !nameHidden(lv, n); }); }
  // Names accepted when a piano key is the QUESTION and a name is the answer.
  function acceptedKeyNames(lv, pc){
    var pol = lv.criteria.accidentals;
    return ALL_NOTE_NAMES.filter(function(n){
      if (noteSemitoneClass(n) !== pc || !nameClickable(lv, n)) return false;
      if (pol === "sharp") return accOf(n) !== "b";
      if (pol === "flat") return accOf(n) !== "#";
      return true;
    });
  }
  // spellings the student may place on the staff for a piano key (respecting the level's sign buttons and sharp / flat choice)
  function keyStaffNames(lv, pc){
    var pol = lv.criteria.accidentals;
    return ALL_NOTE_NAMES.filter(function(n){
      if (noteSemitoneClass(n) !== pc || !accEnabled(lv, accOf(n))) return false;
      if (pol === "sharp") return accOf(n) !== "b";
      if (pol === "flat") return accOf(n) !== "#";
      return true;
    });
  }
  function isBlackPc(pc){ return !PC_WHITE.hasOwnProperty(pc); }
  function keyNameOk(lv, pc){
    var names = acceptedKeyNames(lv, pc);
    if (!names.length) return false;
    if (lv.criteria.accidentals === "both" && isBlackPc(pc)) return names.some(function(n){ return accOf(n) === "#"; }) && names.some(function(n){ return accOf(n) === "b"; });
    return true;
  }
  function answerable(lv, mt, name){
    if (mt.answer === "key") return pianoEnabled(lv, noteSemitoneClass(name));
    if (mt.prompt === "key" && mt.answer === "staff") return keyStaffNames(lv, noteSemitoneClass(name)).length > 0;
    if (mt.prompt === "key") return keyNameOk(lv, noteSemitoneClass(name));
    if (mt.answer === "staff") return accEnabled(lv, accOf(name) || "");
    return nameClickable(lv, name);
  }
  function unanswerableNotes(lv, mt){ return poolFor(lv).filter(function(n){ return !answerable(lv, mt, n); }); }

  function clefChip(lv, mt){
    if (!usesStaff(mt)) return "";
    var c = lv.criteria;
    return '<span class="chip info">' + escapeHtml(CLEF_LABEL[c.clef]) + (c.staffStyle === "grand" ? " · grand" : "") + (c.range !== "staff" ? " · " + (c.range === "ledger1" ? "1 ledger" : "2 ledgers") : "") + '</span>';
  }
  // A ONE-WORD name from the level's settings: "Naturals", "Sharps", "Flats", "Mixed".
  function suggestName(lv){
    var c = lv.criteria, rows = ROWS.filter(function(r){ return r[1].some(function(n){ return c.notes[n]; }); }).map(function(r){ return r[0]; });
    var s = rows.indexOf("sharps") !== -1, f = rows.indexOf("flats") !== -1, n = rows.indexOf("naturals") !== -1;
    if (s && f) return n ? "Mixed" : "Accidentals";
    if (s) return "Sharps";
    if (f) return "Flats";
    return "Naturals";
  }

  // ---------- Icon picker ----------
  var ICONS = ("star stars heart bolt flame trophy medal crown rocket target bulb puzzle brain eye ear microphone headphones music notes piano " +
    "guitar-pick playlist bell clock calendar book books pencil abc flag mountain compass map key lock shield sword wand sparkles confetti " +
    "balloon ice-cream cherry apple pizza coffee cookie planet ufo leaf sun moon cloud snowflake diamond gift ghost cat dog bug fish feather " +
    "paw bone flower plant droplet rainbow umbrella home school ruler writing hash abacus calculator chart-bar trending-up award certificate " +
    "badge thumb-up mood-smile mood-happy pointer click device-gamepad device-gamepad-2 dice chess cards player-play player-skip-forward " +
    "repeat refresh arrows-shuffle arrow-up volume wave-sine metronome vinyl drum triangle square circle hexagon pentagon octagon lamp candle " +
    "pig bird butterfly ladder letter-a letter-b letter-c letter-d letter-e letter-f letter-g number-1 number-2 number-3 number-4 number-5 " +
    "number-6 number-7 number-8 number-9 list-numbers layout-grid category tools palette brush photo camera video movie sunglasses glasses " +
    "bike car plane ship train tent campfire beach swimming run walk yoga").split(" ").map(function(n){ return "ti-" + n; });
  var picker = { open: false, q: "", target: "" };
  function iconGridHtml(current, q){
    var qq = (q || "").toLowerCase().replace(/^ti-/, "");
    var list = ICONS.filter(function(n){ return !qq || n.indexOf(qq) !== -1; });
    if (!list.length) return '<div class="hint">No icon with that name. Try “music”, “star” or “piano”.</div>';
    return '<div class="icongrid">' + list.map(function(n){
      return '<button type="button" class="iconbtn' + (n === current ? " on" : "") + '" data-action="pick-icon" data-icon="' + n + '" title="' + n.slice(3) + '"><i class="ti ' + n + '" aria-hidden="true"></i></button>';
    }).join("") + '</div>';
  }
  function pickerBlockHtml(current){
    return picker.open ? '<div class="iconpicker"><input type="text" id="iconSearch" value="' + escapeHtml(picker.q) + '" placeholder="Search icons (music, star, piano…)" /><div id="iconGridHost">' + iconGridHtml(current, picker.q) + '</div></div>' : "";
  }
  function iconFieldHtml(current){
    return '<span class="field-label">Icon</span><div class="iconfield"><span class="iconcur"><i class="ti ' + escapeHtml(current) + '" aria-hidden="true"></i></span>' +
      '<button type="button" class="btn" data-action="toggle-icons" data-target="level"><i class="ti ti-icons" aria-hidden="true"></i> ' + (picker.open ? "Close icons" : "Choose icon") + '</button></div>' +
      (picker.target === "level" ? pickerBlockHtml(current) : "");
  }

  // ---------- View state ----------
  var view = "hub";                       // "hub" | "plan" | "history"
  var hubTypeId = null;
  var hubLevelId = null;
  var hubMode = null;                     // the mode picked under Start (null = not picked yet)
  var hubModeInit = false;
  var hubNote = "";
  var maximized = false;
  var planTypeId = null;
  var planMsg = "";
  var currentSession = null;              // the live game OR the preview's demo game (session.demo)
  var selectedStudent = null;
  var editing = null;
  var typeEdit = null;
  var demoSeq = 0;
  var fontsReady = false;
  var fontsPromise = Promise.race([
    (document.fonts && document.fonts.load ? document.fonts.load("30px Bravura") : Promise.resolve()).catch(function(){}),
    new Promise(function(r){ setTimeout(r, 2500); })
  ]).then(function(){ return document.fonts && document.fonts.ready ? document.fonts.ready : null; }).catch(function(){}).then(function(){ fontsReady = true; });
  function $(id){ return document.getElementById(id); }

  function renderStudentChip(){
    var wrap = $("studentChipWrap");
    if (!wrap) return;
    wrap.innerHTML = selectedStudent
      ? '<span class="student-chip"><i class="ti ti-user" aria-hidden="true"></i> ' + escapeHtml(selectedStudent.name) +
        '<button type="button" data-action="clear-student" title="Clear"><i class="ti ti-x" aria-hidden="true"></i></button></span>'
      : "";
  }
  function renderScoreChip(){ var wrap = $("scoreChipWrap"); if (wrap) wrap.innerHTML = scoreChipHtml(); }
  function renderTabs(){
    var host = $("viewTabs");
    if (!host) return;
    var html = [["hub", "Practice", "ti-player-play"], ["history", "History", "ti-history"]].map(function(t){
      return '<button type="button" class="viewtab' + (view === t[0] ? " active" : "") + '" data-action="show-view" data-view="' + t[0] + '"><i class="ti ' + t[2] + '" aria-hidden="true"></i> ' + t[1] + '</button>';
    }).join("");
    if (host.getAttribute("data-html") === html) return;   // X88b: never rebuild identical tabs (a rebuild between mouse-down and mouse-up swallowed the click)
    host.setAttribute("data-html", html); host.innerHTML = html;
  }

  function dropSession(){
    if (currentSession && currentSession.timer) clearTimeout(currentSession.timer);
    if (currentSession && !currentSession.demo) { logSession(currentSession, "left"); if (scoreOverride) { scoreOverride = null; postScoreMode(); renderScoreChip(); } }
    botStop();
    currentSession = null; staffAnswer = null;
  }
  // X88: the student site preview lives in a tab here (the Student Site panel in its student-only view, handed this app's storage folder)
  var siteFrame = null, siteShown = false;
  function renderSiteView(){
    var host = $("siteView"); if (!host) return;
    if (!siteFrame) { siteFrame = document.createElement("iframe"); siteFrame.setAttribute("title", "Student site preview"); siteFrame.setAttribute("allow", "autoplay"); host.appendChild(siteFrame); }
    if (siteShown) return;   // X88b: reload only when the tab is OPENED (a window focus used to re-render the app and reload the preview, losing the next click)
    siteShown = true; siteFrame.setAttribute("src", "../StudentSite/StudentSite.html?view=student&t=" + Date.now());
  }
  function renderApp(){
    document.body.classList.toggle("student", !!selectedStudent);
    renderStorageModeUI();
    renderStudentChip();
    renderScoreChip();
    renderTabs();
    $("hubView").style.display = view === "hub" ? "" : "none";
    $("planView").style.display = view === "plan" ? "" : "none";
    $("historyView").style.display = view === "history" ? "" : "none";
    $("siteView").style.display = view === "site" ? "" : "none";
    if (view !== "site") siteShown = false;
    if (view === "hub") renderHub();
    else if (view === "site") { if (currentSession) { dropSession(); maximized = false; document.body.classList.remove("maxed"); } renderSiteView(); }
    else { if (currentSession) { dropSession(); maximized = false; document.body.classList.remove("maxed"); } if (view === "plan") renderPlan(); else renderHistory(); }
  }

  // ---------- Hub: game bar, level column, the stage (preview or the real game) ----------
  function typeCardHtml(m, on){
    var sm = typeStateSummary(m), active = sm.learning + sm.testing + sm.catchup;
    var lvs = levels[m.id] || [];
    var tip = ["learning", "testing", "catchup"].filter(function(id){ return sm[id]; }).map(function(id){ return sm[id] + " " + stateById(id).label.toLowerCase(); }).join(", ");
    var top = sm.catchup ? "catchup" : sm.testing ? "testing" : "learning";
    var dots = active ? '<span class="gdot" data-tip="' + escapeHtml(tip) + '" style="--c:' + stateById(top).color + '"></span>' : "";
    var lab = config.cardLabel || "text";
    return '<button type="button" class="gcard' + (on ? " on" : "") + (active ? "" : " idle") + '" data-action="hub-type" data-type="' + m.id + '" title="' + escapeHtml(m.name) + '">' +
      (lab !== "text" ? typeIconsHtml(m) : "") + (lab !== "icons" ? '<span class="gname">' + escapeHtml(m.name) + '</span>' : "") + dots + '</button>';
  }
  var GRIP_SVG = '<svg viewBox="0 0 10 16" width="10" height="16" aria-hidden="true"><g fill="currentColor"><circle cx="2.5" cy="3" r="1.5"/><circle cx="7.5" cy="3" r="1.5"/><circle cx="2.5" cy="8" r="1.5"/><circle cx="7.5" cy="8" r="1.5"/><circle cx="2.5" cy="13" r="1.5"/><circle cx="7.5" cy="13" r="1.5"/></g></svg>';
  function levelCardHtml(mt, lvl, i, selId){
    var st = levelState(mt, lvl), si = stateById(st);
    return '<div class="lcard st-' + st + (lvl.id === selId ? " on" : "") + (lvl.isNew ? " isnew" : "") + '" style="--c:' + si.color + '" data-action="select-level" data-level="' + lvl.id + '"><div class="lc-in">' +
      '<span class="lgrip" data-lgrip="' + lvl.id + '" title="Press and hold, then drag, to move this level" aria-label="Move level">' + GRIP_SVG + '</span>' +
      '<button type="button" class="lc-state" style="--c:' + si.color + '" data-action="cycle-state" data-level="' + lvl.id + '" data-tip="' + escapeHtml(si.label + ": " + si.tip + " (click to change)") + '" aria-label="' + escapeHtml(si.label) + '"><i class="ti ' + si.icon + '" aria-hidden="true"></i></button>' +
      '<span class="lc-num">' + (i + 1) + '</span>' +
      '<span class="lc-body"><span class="lc-name">' + escapeHtml(focusName(lvl) || "Level") + (lvl.isNew ? ' <span class="newtag">NEW</span>' : "") + '</span>' + (lvl.blurb ? '<span class="lc-new">' + escapeHtml(lvl.blurb) + '</span>' : "") + '</span>' +
      '<span class="lc-tools">' +
        '<button type="button" class="lc-btn lesson-btn" data-action="open-lesson" data-type="' + mt.id + '" data-level="' + lvl.id + '" title="Learn lesson: the steps the class goes through in Learn (open the editor)">Lesson</button>' +
        '<button type="button" class="lc-btn" data-action="add-after" data-level="' + lvl.id + '" title="Add a copy of this level after it">＋</button>' +
        '<button type="button" class="lc-btn" data-action="edit-level" data-type="' + mt.id + '" data-level="' + lvl.id + '" title="Edit level">✎</button>' +
      '</span></div></div>';
  }
  function currentLevelIdForCompat(){ return null; }
  function hubSelectedLevel(mt){
    var list = levels[mt.id] || [];
    var sel = list.filter(function(l){ return l.id === hubLevelId; })[0];
    if (!sel) {   // start on the level the class is learning / testing now
      sel = list.filter(function(l){ return levelState(mt, l) === "testing"; })[0] || list.filter(function(l){ return levelState(mt, l) === "learning"; })[0] || list[0] || null;
    }
    hubLevelId = sel ? sel.id : null;
    return sel;
  }
  function renderHub(){
    demoSeq++;
    if (!hubModeInit && dataReady) { hubModeInit = true; if (!hubMode) hubMode = config.mode || null; }
    if (currentSession && currentSession.demo) dropSession();
    if (lessonEd && !(currentSession && currentSession.lesson)) lessonEd = null;
    var hub = $("hubView");
    if (!MODULE_TYPES.length) { hub.innerHTML = '<div class="card">No games yet. <button type="button" class="btn" data-action="add-type">Add one</button></div>'; return; }
    var mt = moduleTypeById(hubTypeId) || MODULE_TYPES[0];
    hubTypeId = mt.id;
    var list = levels[mt.id] || [], sel = hubSelectedLevel(mt);
    var bar = '<div class="gamebar">' + typeBlocks().map(function(b){
        var cards = b.types.map(function(m){ return typeCardHtml(m, m.id === mt.id); }).join("");
        return b.group ? '<div class="ggroup" style="--gc:' + b.group.color + '" title="' + escapeHtml(b.group.name) + '">' + cards + '</div>' : cards;
      }).join("") +
      '<button type="button" class="gcard add" data-action="add-type" title="Add a game" aria-label="Add a game"><i class="ti ti-plus" aria-hidden="true"></i></button>' +
      '<span class="spacer"></span>' +
      '<button type="button" class="gear" data-action="arrange-games" title="Order, groups and look of the game buttons" aria-label="Order, groups and look"><i class="ti ti-layout-list" aria-hidden="true"></i></button>' +
      '<button type="button" class="gear" data-action="edit-type" data-type="' + mt.id + '" title="Game settings" aria-label="Game settings"><i class="ti ti-settings" aria-hidden="true"></i></button></div>';
    var legend = '<div class="slegend">' + stateList().map(function(x){ return '<span class="sl" style="--c:' + x.color + '" data-tip="' + escapeHtml(x.tip) + '"><i class="ti ' + x.icon + '" aria-hidden="true"></i>' + escapeHtml(x.label) + '</span>'; }).join("") +
      '<button type="button" class="lc-btn" data-action="edit-states" title="Change what the status icons mean" aria-label="Edit statuses">✎</button></div>';
    var cards = list.map(function(lvl, i){ return levelCardHtml(mt, lvl, i, sel && sel.id); }).join("");
    var lessoning = !!(lessonEd && currentSession && currentSession.lesson);
    hub.innerHTML = bar +
      '<div class="hub-main' + (lessoning ? " lessoning" : "") + '">' +
      (lessoning ? '<div class="lcol lslist" id="lessonSlides">' + lessonLeftHtml() + '</div>' : '<div class="lcol">' + legend + cards + '<button type="button" class="add-level-btn" data-action="add-level" data-type="' + mt.id + '"><i class="ti ti-plus" aria-hidden="true"></i> Add level</button></div>') +
      (lessoning ? '<div class="lcenter"><div class="lbar" id="lessonBar">' + lessonBarHtml() + '</div>' : "") +
      '<div class="stagecard' + (maximized ? " max" : "") + '" id="stageCard"><div class="preview-stage" id="previewStage"><div class="preview-inner" id="previewInner"></div><div class="preview-over" id="previewOver"></div>' +
        '<button type="button" class="maxbtn" data-action="toggle-max" id="maxBtn" title="Fill the window / back to normal"></button></div></div>' + (lessoning ? '</div>' : "") +
      (lessoning ? '<div class="lpanel" id="lessonPanel">' + lessonPanelHtml() + '</div>' : "") + '</div>';
    document.body.classList.toggle("maxed", maximized && !!currentSession && !currentSession.demo);
    renderOverlay();
    if (currentSession) mountGame(); else startDemo();
    fitStage();
  }
  var ICON_MAX = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  var ICON_MIN = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
  function renderOverlay(){
    var over = $("previewOver"); if (!over) return;
    var mt = moduleTypeById(hubTypeId), sel = mt && hubSelectedLevel(mt);
    var hint = hubNote ? hubNote : hubMode ? "" : "Choose how to play";
    over.innerHTML = '<div class="over-card">' +
      (sel ? '<button type="button" class="startbig" data-action="start-practice" data-type="' + mt.id + '" data-level="' + sel.id + '"' + (hubMode ? "" : " disabled") + '><i class="ti ti-player-play-filled" aria-hidden="true"></i> Start</button>' : '<span class="empty-note">Add a level first</span>') +
      '<div class="modepick">' + MODES.map(function(m){ return '<button type="button" class="mbtn' + (hubMode === m.id ? " on" : "") + '" data-action="pick-mode" data-mode="' + m.id + '"><i class="ti ' + m.icon + '" aria-hidden="true"></i><span>' + m.label + '</span></button>'; }).join("") + '</div>' +
      '<div class="pickhint' + (hubNote ? " warn" : "") + '" style="visibility:' + (hint ? "visible" : "hidden") + '">' + escapeHtml(hint || "x") + '</div></div>';
    var mb = $("maxBtn"); if (mb) mb.innerHTML = maximized ? ICON_MIN : ICON_MAX;
  }
  function fitStage(){
    var card = $("stageCard"), stage = $("previewStage"), inner = $("previewInner");
    if (!card || !stage || !inner) return;
    var sc, W = 800, H = 640;
    if (maximized) {
      var w = card.clientWidth - 24, h = card.clientHeight - 20, asp = w / Math.max(1, h);
      // fill the window: keep the design height (or width) and let the other side grow, within limits
      if (asp >= 1.25) W = Math.min(1600, Math.round(640 * asp)); else H = Math.min(1200, Math.round(800 / asp));
      sc = Math.min(w / W, h / H);
      stage.style.width = Math.floor(W * sc) + "px"; stage.style.height = Math.floor(H * sc) + "px";
    } else { stage.style.width = ""; stage.style.height = ""; sc = stage.clientWidth / 800; }
    inner.style.width = W + "px"; inner.style.height = H + "px";
    inner.style.transform = "scale(" + sc + ")";
    card.style.setProperty("--sc", sc);
    if (inner._w !== W || inner._h !== H) { inner._w = W; inner._h = H; if (currentSession && typeof relayoutGame === "function") relayoutGame(); }
  }
  window.addEventListener("resize", fitStage);
  document.addEventListener("keydown", function(ev){ if (ev.key === "Escape" && maximized) { maximized = false; document.body.classList.remove("maxed"); var c = $("stageCard"); if (c) c.classList.remove("max"); renderOverlay(); fitStage(); } });
  function toggleMax(){
    maximized = !maximized;
    var c = $("stageCard"); if (c) c.classList.toggle("max", maximized);
    document.body.classList.toggle("maxed", maximized && !!currentSession && !currentSession.demo);
    renderOverlay(); fitStage();
  }

  function startDemo(){
    var mt = moduleTypeById(hubTypeId), lv = mt && hubSelectedLevel(mt), seq = demoSeq;
    if (!mt || !lv) return;
    fontsPromise.then(function(){
      if (seq !== demoSeq || currentSession || view !== "hub" || !$("previewInner")) return;
      if (!beginSession(mt.id, lv.id, { demo: true, mode: hubMode || "practice" })) return;
      mountGame();
    });
  }
  function restartDemo(){ if (currentSession && currentSession.demo) { dropSession(); demoSeq++; startDemo(); } }
  function mountGame(){
    var s = currentSession, card = $("stageCard"), over = $("previewOver"); if (!s || !card) return;
    card.classList.toggle("playing", !s.demo); card.classList.toggle("demo", !!s.demo);
    if (over) over.style.display = s.demo ? "" : "none";
    renderExerciseView(); fitStage();
    if (s.demo) botStart(s);
  }

  // ---------- History (this device) ----------
  function fmtDuration(sec){ sec = Math.round(sec); var m = Math.floor(sec / 60), s = sec % 60; return m ? m + " min" + (s >= 10 ? " " + s + " s" : "") : s + " s"; }
  function renderHistory(){
    var host = $("historyView");
    var rows = history.slice().reverse().map(function(h){
      var d = new Date(h.t), when = isNaN(d) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
      var kind = h.counted === true ? '<button type="button" class="chip link kindchip" data-action="hist-toggle" data-t="' + h.t + '" title="Counted for the class or student. Click to mark as teacher testing">Counted</button>'
        : h.counted === false ? '<button type="button" class="chip warn kindchip" data-action="hist-toggle" data-t="' + h.t + '" title="Teacher testing only: scores not counted. Click to mark as counted">Teacher testing</button>' : '<span class="chip">Before tracking</span>';
      return '<tr class="' + (h.counted === false ? "h-test" : h.counted === true ? "h-real" : "") + '"><td>' + escapeHtml(when) + '</td><td>' + escapeHtml(h.title || "") + '</td><td>' + escapeHtml((modeById(h.mode) || {}).label || h.mode) + '</td><td>' + (h.sec ? fmtDuration(h.sec) : '') + '</td><td>' + h.correct + '/' + h.total + '</td><td>' +
        (h.result === "passed" ? '<span class="chip link">Passed</span>' : h.result === "lost" ? '<span class="chip warn">Out of lives</span>' : '<span class="chip">Practice</span>') + (h.student ? ' <span class="chip info">' + escapeHtml(h.student) + '</span>' : "") + '</td><td>' + kind + '</td>' +
        '<td><button type="button" class="lc-btn hdel" data-action="hist-del" data-t="' + h.t + '" title="Delete this row" aria-label="Delete this row"><i class="ti ti-trash" aria-hidden="true"></i></button></td></tr>';
    }).join("");
    host.innerHTML = '<div class="card"><div class="sec-label">History: every Learn, Practice and Test session played on this computer</div>' +
      '<div class="warnbox"><i class="ti ti-alert-triangle" aria-hidden="true"></i> This list and the Learn progress are saved only in this browser. Clearing browsing data, resetting or switching the Chromebook, or using a different computer can erase them at any time. Do not count on them being permanent.</div>' +
      '<div class="muted small" style="margin:6px 0">Green rows counted for the class or a student. Yellow rows were teacher testing only (not counted). Changing or deleting a row here does not change the saved class scores.</div>' +
      (rows ? '<div class="tablewrap"><table class="lvtable histtable"><thead><tr><th>When</th><th>Game</th><th>Mode</th><th>Time</th><th>Score</th><th>Result</th><th>Scores</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' : '<div class="muted" style="padding:10px">No sessions yet.</div>') +
      (rows ? '<div style="margin-top:8px"><button type="button" class="btn small danger" data-action="clear-history"><i class="ti ti-trash" aria-hidden="true"></i> Clear history</button></div>' : "") + '</div>';
  }

  // ---------- Plan view ----------
  // X88: grey = options already known from the previous level (carried over, or brought back), blue "+" = added, red "\u2212" = removed
  function newVsPrevious(lv, prev){
    var now = poolFor(lv), before = prev ? poolFor(prev) : [];
    var known = now.filter(function(n){ return before.indexOf(n) !== -1; });
    var added = now.filter(function(n){ return before.indexOf(n) === -1; });
    var dropped = before.filter(function(n){ return now.indexOf(n) === -1; });
    function chips(arr, cls, sign, max){ var out = arr.slice(0, max).map(function(n){ return '<span class="nchip ' + cls + '">' + sign + escapeHtml(pretty(n)) + '</span>'; }).join(""); return out + (arr.length > max ? '<span class="muted small">+' + (arr.length - max) + ' more</span>' : ""); }
    var l1 = known.length ? '<div class="nvp-line">' + chips(known, "nk", "", 30) + '</div>' : "";
    var l2 = chips(added, "na", "+ ", 30) + chips(dropped, "nr", "\u2212 ", 30);
    if (prev) {
      if (prev.criteria.clef !== lv.criteria.clef) l2 += '<span class="chip info">' + escapeHtml(CLEF_LABEL[lv.criteria.clef]) + ' clef</span>';
      if (prev.criteria.staffStyle !== lv.criteria.staffStyle) l2 += '<span class="chip info">' + escapeHtml(STYLE_LABEL[lv.criteria.staffStyle]) + '</span>';
      if (prev.criteria.range !== lv.criteria.range) l2 += '<span class="chip info">' + escapeHtml(RANGE_LABEL[lv.criteria.range]) + '</span>';
      if (prev.criteria.accidentals !== lv.criteria.accidentals) l2 += '<span class="chip info">' + escapeHtml(ACC_POLICY[lv.criteria.accidentals]) + '</span>';
    }
    l2 = l2 ? '<div class="nvp-line">' + l2 + '</div>' : "";
    return (l1 + l2) || '<span class="muted small">nothing yet</span>';
  }
  function insertRowHtml(i, label){
    return '<tr class="insertrow"><td colspan="6"><button type="button" class="insbtn" data-action="insert-at" data-type="' + planTypeId + '" data-idx="' + i + '" title="Insert a new level here"><i class="ti ti-plus" aria-hidden="true"></i><span>' + label + '</span></button></td></tr>';
  }
  function renderPlan(){
    var host = document.getElementById("planView");
    var mt = moduleTypeById(planTypeId) || MODULE_TYPES[0];
    if (!mt) { host.innerHTML = '<div class="card">No games yet.</div>'; return; }
    planTypeId = mt.id;
    var list = levels[mt.id] || [];
    var html = '<div class="card"><div class="sec-label">Game</div><div class="typepick">' +
      MODULE_TYPES.map(function(m){
        return '<button type="button" class="typechip' + (m.id === planTypeId ? " on" : "") + '" data-action="plan-type" data-type="' + m.id + '">' + typeIconsHtml(m) + ' ' + escapeHtml(m.name) + ' <span class="n">' + (levels[m.id] || []).length + '</span></button>';
      }).join("") +
      '<button type="button" class="btn small" data-action="edit-type" data-type="' + planTypeId + '"><i class="ti ti-settings" aria-hidden="true"></i> Game settings</button>' +
      '<button type="button" class="btn small" data-action="add-type"><i class="ti ti-plus" aria-hidden="true"></i> New game</button></div>' +
      '<div class="muted small" style="margin-bottom:8px">Each row is one level, in the order students meet them. Click a row to edit it. Drag the grip to re-order; hover between rows for a + line to insert a level.</div>' +
      '<div class="tablewrap"><table class="lvtable"><thead><tr><th class="gripcol"></th><th>#</th><th>Level</th><th>Options: <span class="nchip nk">known</span> <span class="nchip na">+ new</span> <span class="nchip nr">\u2212 removed</span></th><th>Progress curriculum</th><th>Scores (class / practice)</th></tr></thead><tbody id="planBody">';
    list.forEach(function(lv, idx){
      html += insertRowHtml(idx, idx === 0 ? "Insert a level at the start" : "Insert a level here");
      html += '<tr class="lvrow" data-action="edit-level" data-type="' + planTypeId + '" data-level="' + lv.id + '" data-idx="' + idx + '">' +
        '<td class="gripcell"><span class="grip" data-grip="' + lv.id + '" title="Drag to re-order"><i class="ti ti-grip-vertical" aria-hidden="true"></i></span></td>' +
        '<td class="num">' + (idx + 1) + '</td>' +
        '<td><div class="lvname">' + escapeHtml(levelTitle(mt, idx)) + '</div>' + (lv.blurb ? '<div class="muted small">' + escapeHtml(lv.blurb) + '</div>' : "") + (lv.instructions ? '<div class="muted small">' + escapeHtml(lv.instructions) + '</div>' : "") + (usesStaff(mt) ? '<div style="margin-top:3px">' + clefChip(lv, mt) + '</div>' : "") + '</td>' +
        '<td class="intro">' + newVsPrevious(lv, idx > 0 ? list[idx - 1] : null) + '</td>' +
        '<td>' + linkChipHtml(lv) + '</td>' +
        '<td class="small">' + escapeHtml(scoreLabel(planTypeId, lv.id, "real")) + ' / ' + escapeHtml(scoreLabel(planTypeId, lv.id, "test")) + '</td></tr>';
    });
    if (!list.length) html += '<tr><td colspan="6" class="muted" style="padding:14px">No levels yet for this game.</td></tr>';
    html += insertRowHtml(list.length, "Add a level at the end");
    html += '</tbody></table></div></div>';
    html += renderCurriculumCard(mt);
    html += '<div class="card"><div class="sec-label">Scores and data</div>' +
      '<div class="muted small" style="margin-bottom:8px">Class scores count for real while a class is in session. Everything else is teacher testing only (not counted). Use the small flask / school button to change this for one game; it goes back to automatic afterwards. A new marking period clears the class scores by itself.</div>' +
      '<div class="status-line">' + scoreChipHtml() +
      '<button type="button" class="btn small" data-action="clear-practice"><i class="ti ti-eraser" aria-hidden="true"></i> Clear practice data</button>' +
      '<button type="button" class="btn small danger" data-action="clear-class"><i class="ti ti-trash" aria-hidden="true"></i> Clear class data</button>' +
      (planMsg ? '<span class="chip info">' + escapeHtml(planMsg) + '</span>' : "") + '</div></div>';
    host.innerHTML = html;
  }

  function levelOptionsHtml(excludeAid){
    var out = "";
    MODULE_TYPES.forEach(function(m){
      var opts = (levels[m.id] || []).map(function(lv, i){
        if (excludeAid && lv.link && lv.link.assignmentId === excludeAid) return "";
        return '<option value="' + m.id + '|' + lv.id + '">' + escapeHtml(levelTitle(m, i)) + '</option>';
      }).join("");
      if (opts) out += '<optgroup label="' + escapeHtml(m.name) + '">' + opts + '</optgroup>';
    });
    return out;
  }
  function mirrorStatusLine(){
    var tried = mirror.tried && mirror.tried.length ? ' <span class="muted">Tried: ' + escapeHtml(mirror.tried.join(" → ")) + '.</span>' : "";
    return '<span class="chip warn"><i class="ti ti-plug-connected-x" aria-hidden="true"></i> Not connected</span><span class="muted">' + escapeHtml(mirror.loaded ? mirror.why : "Reading Progress’s curriculum…") + '</span>' + tried +
      ' <button type="button" class="btn small" data-action="refresh-curriculum"><i class="ti ti-refresh" aria-hidden="true"></i> Try again</button>';
  }
  function renderCurriculumCard(mt){
    var h = '<div class="card"><div class="sec-label">Progress curriculum — Note ID assignments</div>';
    if (!mirror.ok) {
      return h + '<div class="status-line">' + mirrorStatusLine() + '</div>' +
        '<div class="muted small" style="margin-top:4px">Level links keep the names they were saved with.</div></div>';
    }
    var ids = noteIdTypeIds();
    var assignments = [];
    mirror.units.forEach(function(u){ (u.assignments || []).forEach(function(a){ assignments.push({ u: u, a: a }); }); });
    var noteIdOnes = assignments.filter(function(x){ return ids.indexOf(x.a.typeId) !== -1; });
    var where = mirror.where === undefined ? "" : ' <span class="muted">(read from ' + escapeHtml(mirror.where || "the folder root") + ')</span>';
    if (!ids.length || !noteIdOnes.length) {
      return h + '<div class="status-line"><span class="chip link"><i class="ti ti-plug-connected" aria-hidden="true"></i> Connected</span><span class="muted">' + (!ids.length ? "Progress has no exercise type called “Note ID”." : "Progress’s curriculum has no assignment of type Note ID yet.") + '</span>' + where + '</div></div>';
    }
    var linkedTo = {};
    MODULE_TYPES.forEach(function(m){
      (levels[m.id] || []).forEach(function(lv, i){
        if (lv.link && lv.link.assignmentId) (linkedTo[lv.link.assignmentId] = linkedTo[lv.link.assignmentId] || []).push({ m: m, lv: lv, i: i });
      });
    });
    var total = 0, covered = 0, body = "";
    mirror.units.forEach(function(u){
      var rows = (u.assignments || []).filter(function(a){ return ids.indexOf(a.typeId) !== -1; });
      if (!rows.length) return;
      body += '<div class="cur-unit">' + escapeHtml(u.name || "Unit") + (u.active ? ' <span class="chip info">active</span>' : "") + '</div>';
      rows.forEach(function(a){
        total++;
        var ls = linkedTo[a.id] || [];
        if (ls.length) covered++;
        body += '<div class="cur-row"><div class="cur-name">' + escapeHtml(a.name || "(unnamed)") + (a.extra ? ' <span class="chip">extra</span>' : "") + (a.skipped ? ' <span class="chip">skipped</span>' : "") + '</div>' +
          (ls.length ? ls.map(function(x){ return '<span class="chip link">' + escapeHtml(levelTitle(x.m, x.i)) + '<button type="button" class="level-tile-edit" style="font-size:11px" data-action="unlink-level" data-type="' + x.m.id + '" data-level="' + x.lv.id + '" title="Unlink"><i class="ti ti-x" aria-hidden="true"></i></button></span>'; }).join("") : '<span class="chip warn">No level yet</span>') +
          '<span class="cur-ctl"><select data-change="link-assignment" data-aid="' + escapeHtml(a.id) + '" data-uid="' + escapeHtml(u.id || "") + '"><option value="">Link a level…</option>' + levelOptionsHtml(a.id) +
          '<option value="__new">➕ New ' + escapeHtml(mt.name) + ' level for this</option></select></span></div>';
      });
    });
    return h + '<div class="status-line" style="margin-bottom:6px"><span class="chip link"><i class="ti ti-plug-connected" aria-hidden="true"></i> Connected</span><span>' + covered + ' of ' + total + ' Note ID assignments have a level.</span>' + where +
      '<button type="button" class="btn small" data-action="auto-link"><i class="ti ti-wand" aria-hidden="true"></i> Link by matching names</button>' +
      '<button type="button" class="btn small" data-action="refresh-curriculum"><i class="ti ti-refresh" aria-hidden="true"></i> Refresh</button></div>' +
      '<div class="hint">Linking works both ways: NoteID saves a list of its levels (noteid-catalog-v1) that Progress can read, and this page reads Progress’s curriculum. Neither app writes the other’s files.</div>' + body + '</div>';
  }
  function linkLevel(typeId, levelId, unit, a){
    var lv = (levels[typeId] || []).filter(function(l){ return l.id === levelId; })[0];
    if (!lv) return;
    lv.link = linkFrom(unit, a);
    saveLevels();
  }
  function autoLink(){
    var count = 0, byName = {};
    mirror.units.forEach(function(u){ (u.assignments || []).forEach(function(a){ var k = normName(a.name); if (k && !byName[k]) byName[k] = { u: u, a: a }; }); });
    MODULE_TYPES.forEach(function(m){
      (levels[m.id] || []).forEach(function(lv, i){
        var hit = byName[normName(levelTitle(m, i, false))] || byName[normName(levelTitle(m, i))];
        if (hit && (!lv.link || lv.link.assignmentId !== hit.a.id)) { lv.link = linkFrom(hit.u, hit.a); count++; }
      });
    });
    if (count) saveLevels();
    planMsg = count ? (count + " level" + (count === 1 ? "" : "s") + " linked") : "No level title matches an assignment name (a level “Piano ID 1” matches an assignment named “Piano ID 1”)";
    renderPlan();
  }

  // Drag to re-order the plan rows (plain mouse events, never native drag and drop).
  var drag = null;
  function clearDropMarks(){
    [].forEach.call(document.querySelectorAll("#planBody tr.lvrow"), function(r){ r.classList.remove("drop-above", "drop-below", "dragging-row"); });
  }
  document.addEventListener("mousedown", function(ev){
    var g = ev.target.closest ? ev.target.closest("[data-grip]") : null;
    if (!g || currentSession) return;
    ev.preventDefault(); ev.stopPropagation();
    drag = { id: g.getAttribute("data-grip"), type: planTypeId, to: -1, after: false };
    document.body.classList.add("dragging");
    var row = g.closest("tr"); if (row) row.classList.add("dragging-row");
  }, true);
  document.addEventListener("mousemove", function(ev){
    if (!drag) return;
    clearDropMarks();
    var rows = [].slice.call(document.querySelectorAll("#planBody tr.lvrow"));
    var ownRow = rows.filter(function(r){ return r.querySelector('[data-grip="' + drag.id + '"]'); })[0];
    if (ownRow) ownRow.classList.add("dragging-row");
    drag.to = -1;
    for (var i = 0; i < rows.length; i++) {
      var rc = rows[i].getBoundingClientRect();
      if (ev.clientY >= rc.top && ev.clientY <= rc.bottom) {
        drag.to = i; drag.after = ev.clientY > (rc.top + rc.height / 2);
        rows[i].classList.add(drag.after ? "drop-below" : "drop-above");
        break;
      }
    }
  });
  document.addEventListener("mouseup", function(){
    if (!drag) return;
    var d = drag; drag = null;
    document.body.classList.remove("dragging");
    clearDropMarks();
    if (d.to < 0) return;
    var list = levels[d.type], from = -1;
    for (var i = 0; i < list.length; i++) if (list[i].id === d.id) from = i;
    if (from < 0) return;
    var target = d.to + (d.after ? 1 : 0);
    var item = list.splice(from, 1)[0];
    if (from < target) target--;
    list.splice(Math.max(0, Math.min(list.length, target)), 0, item);
    saveLevels();
    renderPlan();
  });

  // ---------- Clearing data ----------
  function clearScoresFor(bucket, typeId){
    Object.keys(bucket).forEach(function(k){ if (!typeId || k.indexOf(typeId + ":") === 0) delete bucket[k]; });
  }
  function clearPracticeData(typeId){
    if (!confirm("Clear the practice scores" + (typeId ? " for this game" : "") + " and the Learn progress? Class scores and student results stay.")) return;
    clearScoresFor(testScores, typeId); clearScoresFor(config.learn, typeId);
    saveTestScores(); saveConfig(true);
    planMsg = "Practice data cleared"; renderApp();
  }
  function clearClassData(typeId){
    if (!confirm("Clear the class scores" + (typeId ? " for this game" : "") + "? This can’t be undone. Student results stay.")) return;
    clearScoresFor(classScores, typeId);
    saveClassScores();
    planMsg = "Class data cleared"; renderApp();
  }

  // ---------- Level editor modal ----------
  function openLevelEditor(typeId, levelId, insertIdx, preset){
    var isNew = !levelId;
    var lvl = isNew ? null : levels[typeId].filter(function(l){ return l.id === levelId; })[0];
    if (!isNew && !lvl) return;
    var src = lvl ? JSON.parse(JSON.stringify(lvl)) : newLevelShell("", moduleTypeById(typeId));
    if (preset && preset.link) src.link = preset.link;
    normalizeLevel(src);
    picker = { open: false, q: "", target: "" };
    editing = { rangePick: {}, typeId: typeId, isNew: isNew, id: isNew ? null : levelId, insertIdx: (typeof insertIdx === "number" ? insertIdx : null), draft: src, error: "", snap: JSON.stringify(levels[typeId] || []) };
    renderLevelEditorModal();
  }
  function closeLevelEditor(){ editing = null; picker.open = false; document.getElementById("modalRoot").innerHTML = ""; }

  // X89: every edit in the level editor saves itself. Save only confirms and closes; Cancel restores the list as it was when the editor opened.
  var autosaveTimer = null;
  function autosaveLevel(){
    if (!editing || editing.confirmDel) return false;
    syncDraft();
    var d = editing.draft, mt = moduleTypeById(editing.typeId);
    if (!poolFor(d).length || unanswerableNotes(d, mt).length) return false;
    var c = JSON.parse(JSON.stringify(d));
    c.name = (c.name || "").trim();   // a blank one-word skill stays blank (the Suggest button fills it)
    c.isNew = false;
    c.blurb = (c.blurb || "").trim(); c.instructions = (c.instructions || "").trim(); c.icon = (c.icon || "").trim() || "ti-star";
    var list = levels[editing.typeId], found = -1, i;
    for (i = 0; i < list.length; i++) if (list[i].id === c.id) found = i;
    if (found >= 0) list[found] = normalizeLevel(c);
    else { var at = editing.insertIdx; list.splice(at == null ? list.length : Math.max(0, Math.min(list.length, at)), 0, normalizeLevel(c)); }
    editing.id = c.id; editing.isNew = false; editing.autoSaved = true;
    saveLevels();
    var sv = document.getElementById("editSaved"); if (sv) sv.textContent = "Saved";
    return true;
  }
  function autosaveSoon(){ clearTimeout(autosaveTimer); autosaveTimer = setTimeout(function(){ autosaveLevel(); }, 350); }
  function cancelLevelEditor(){
    clearTimeout(autosaveTimer);
    if (editing && editing.snap != null) { levels[editing.typeId] = JSON.parse(editing.snap); saveLevels(); }
    closeLevelEditor();
    renderApp();
  }
  function syncDraft(){
    if (!editing) return;
    var d = editing.draft, el;
    if ((el = document.getElementById("editLevelName"))) d.name = el.value;
    if ((el = document.getElementById("editLevelBlurb"))) d.blurb = el.value;
    if ((el = document.getElementById("editLevelInstructions"))) d.instructions = el.value;
    if ((el = document.getElementById("editLink"))) {
      var v = el.value;
      if (v === "") d.link = null;
      else if (v === "__keep") { /* keep the existing (missing) link */ }
      else {
        var parts = v.split("|"), f = findAssignment(parts[1]);
        if (f) d.link = linkFrom(f.unit, f.a);
      }
    }
    if ((el = document.getElementById("editLinkText"))) {
      var t = el.value.trim();
      d.link = t ? { unitId: (d.link && d.link.unitId) || "", unitName: (d.link && d.link.unitName) || "", assignmentId: (d.link && d.link.assignmentId) || "", assignmentName: t } : null;
    }
  }

  function linkFieldHtml(d){
    if (!mirror.ok) {
      return '<span class="field-label">Progress curriculum assignment</span><div class="status-line" style="margin-bottom:4px">' + mirrorStatusLine() + '</div><input type="text" id="editLinkText" value="' + escapeHtml(d.link ? d.link.assignmentName : "") + '" placeholder="Only until Progress is connected: the assignment’s name" />';
    }
    var status = '<span class="chip link"><i class="ti ti-plug-connected" aria-hidden="true"></i> Connected to Progress</span>';
    var ids = noteIdTypeIds(), cur = d.link && d.link.assignmentId ? d.link.assignmentId : "";
    var groupA = "", groupB = "", found = false;
    mirror.units.forEach(function(u){
      (u.assignments || []).forEach(function(a){
        var opt = '<option value="' + escapeHtml((u.id || "") + "|" + a.id) + '"' + (a.id === cur ? " selected" : "") + '>' + escapeHtml((u.name || "Unit") + " · " + (a.name || "(unnamed)")) + '</option>';
        if (a.id === cur) found = true;
        if (ids.indexOf(a.typeId) !== -1) groupA += opt; else groupB += opt;
      });
    });
    var keep = (cur && !found) ? '<option value="__keep" selected>' + escapeHtml((d.link.unitName ? d.link.unitName + " · " : "") + d.link.assignmentName) + ' (no longer in Progress)</option>' : "";
    return '<span class="field-label">Progress curriculum assignment</span><div class="status-line" style="margin-bottom:4px">' + status + '</div><select id="editLink"><option value=""' + (!d.link ? " selected" : "") + '>— not linked —</option>' + keep +
      (groupA ? '<optgroup label="Note ID assignments">' + groupA + '</optgroup>' : "") +
      (groupB ? '<optgroup label="Other assignments">' + groupB + '</optgroup>' : "") + '</select>';
  }

  // ---- picture buttons (inline SVG, same idea as the Workbook's picture buttons) ----
  var G_TREBLE = "𝄞", G_BASS = "𝄢";
  function staffLines(y0, gap, x1, x2){ var d = ""; for (var i = 0; i < 5; i++) d += "M" + x1 + " " + (y0 + i * gap) + "H" + x2; return '<path d="' + d + '" stroke="currentColor" stroke-width="1.2" fill="none"/>'; }
  var PIC = {
    treble: '<svg viewBox="0 0 48 34">' + staffLines(7, 5, 3, 45) + '<text x="5" y="22" font-family="Bravura, serif" font-size="20" fill="currentColor"></text></svg>',
    bass:   '<svg viewBox="0 0 48 34">' + staffLines(7, 5, 3, 45) + '<text x="5" y="17" font-family="Bravura, serif" font-size="20" fill="currentColor"></text></svg>',
    both:   '<svg viewBox="0 0 48 34">' + staffLines(2, 3, 3, 45) + staffLines(19, 3, 3, 45) + '<text x="4" y="8" font-family="Bravura, serif" font-size="12" fill="currentColor"></text><text x="4" y="22" font-family="Bravura, serif" font-size="12" fill="currentColor"></text></svg>',
    single: '<svg viewBox="0 0 48 34">' + staffLines(7, 5, 6, 44) + '<ellipse cx="26" cy="17" rx="4.5" ry="3.2" fill="currentColor"/></svg>',
    grand:  '<svg viewBox="0 0 48 34">' + staffLines(2, 3, 9, 45) + staffLines(19, 3, 9, 45) + '<path d="M9 2V31" stroke="currentColor" stroke-width="1.2"/><path d="M7 2C3 8 7 13 5 16.5 7 20 3 26 7 31" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>',
    show: '<svg viewBox="0 0 48 34"><rect x="6" y="7" width="36" height="20" rx="5" fill="currentColor"/></svg>',
    grey: '<svg viewBox="0 0 48 34"><rect x="6" y="7" width="36" height="20" rx="5" fill="currentColor" opacity=".28"/><rect x="6" y="7" width="36" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="1.4" opacity=".6"/></svg>',
    hide: '<svg viewBox="0 0 48 34"><rect x="6" y="7" width="36" height="20" rx="5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-dasharray="3 3" opacity=".6"/><path d="M10 28L38 6" stroke="currentColor" stroke-width="1.6"/></svg>',
    either: '<svg viewBox="0 0 48 34"><text x="24" y="25" text-anchor="middle" font-family="Bravura, serif" font-size="22" fill="currentColor">/</text></svg>',
    sharp:  '<svg viewBox="0 0 48 34"><text x="24" y="25" text-anchor="middle" font-family="Bravura, serif" font-size="24" fill="currentColor"></text></svg>',
    flat:   '<svg viewBox="0 0 48 34"><text x="24" y="25" text-anchor="middle" font-family="Bravura, serif" font-size="24" fill="currentColor"></text></svg>',
    both2:  '<svg viewBox="0 0 48 34"><text x="24" y="25" text-anchor="middle" font-family="Bravura, serif" font-size="22" fill="currentColor"></text></svg>',
    ledger0: '<svg viewBox="0 0 48 34">' + staffLines(7, 5, 3, 45) + '</svg>',
    ledger1: '<svg viewBox="0 0 48 34">' + staffLines(10, 4, 3, 45) + '<path d="M18 5H30M18 31H30" stroke="currentColor" stroke-width="1.2"/></svg>',
    ledger2: '<svg viewBox="0 0 48 34">' + staffLines(12, 3.4, 3, 45) + '<path d="M18 5H30M18 8.4H30M18 30H30M18 33H30" stroke="currentColor" stroke-width="1.1"/></svg>'
  };
  function picBtn(on, action, attrs, pic, label, dis){
    return '<button type="button" class="picbtn' + (on ? " on" : "") + '" data-action="' + action + '" ' + attrs + (dis ? " disabled" : "") + ' title="' + escapeHtml(label) + '"><span class="pic">' + pic + '</span><span class="cap">' + escapeHtml(label) + '</span></button>';
  }
  function picsHtml(items, cur, action, attr){
    return '<div class="picrow">' + items.map(function(it){ return picBtn(cur === it[0], action, 'data-' + attr + '="' + it[0] + '"', it[2], it[1]); }).join("") + '</div>';
  }
  var BLACK_NAMES = ["C#", "D#", "F#", "G#", "A#", "Db", "Eb", "Gb", "Ab", "Bb"];

  function nsLegendHtml(){
    return '<div class="nslegend">' + NS_STATES.map(function(st){ return '<span class="nsl"><i class="criteria-chip ns-' + st + ' demo">A</i>' + NS_INFO[st].label + '</span>'; }).join("") + '</div>';
  }
  function noteRowHtml(d, r){
    var rowId = r[0], notes = r[1];
    var setAll = NS_STATES.map(function(st){ return '<button type="button" class="nsbtn criteria-chip ns-' + st + '" data-action="set-row-ns" data-row="' + rowId + '" data-st="' + st + '" data-tip="Set the whole row: ' + escapeHtml(NS_INFO[st].label) + '"></button>'; }).join("");
    return '<div class="noterow"><div class="noterow-head"><b>' + r[2] + '</b>' +
      '<span class="setrow"><span class="muted small">Whole row:</span>' + setAll + '</span>' +
      '<span class="spacer"></span>' +
      (rowId === "naturals" ? '<button type="button" class="btn small" data-action="group-on" data-row="naturals">All asked</button><button type="button" class="btn small" data-action="group-off" data-row="naturals">None asked</button>' : "") + '</div>' +
      '<div class="criteria-grid">' + notes.map(function(n){
        var st = nsOf(d, n);
        return '<button type="button" class="criteria-chip ns-' + st + '" data-action="cycle-ns" data-note="' + n + '" data-tip="' + escapeHtml(NS_INFO[st].tip + " — click to change") + '">' + escapeHtml(pretty(n)) + '</button>';
      }).join("") + '</div></div>';
  }

  // ---- range picker: click the lowest and the highest note on a little staff ----
  function posName(i){ var p = posFromIndex(i); return p.letter + p.octave; }
  function rangePickerHtml(d, clef){
    var full = CLEF_RANGE[clef].ledger2, lo = posIndex(full[0]), hi = posIndex(full[1]);
    var cur = clefBounds(d, clef), cl = posIndex(cur[0]), ch = posIndex(cur[1]);
    var pend = editing.rangePick ? editing.rangePick[clef] : undefined;
    var step = 6, pad = 12, W = 300, H = (hi - lo) * step + 2 * pad;
    function y(i){ return pad + (hi - i) * step; }
    var sl = posIndex(CLEF_RANGE[clef].staff[0]), s = "";
    s += '<rect x="0" y="' + (y(ch) - step / 2) + '" width="' + W + '" height="' + ((ch - cl) * step + step) + '" class="rp-band"/>';
    for (var i = lo; i <= hi; i++) {
      var onStaff = i >= sl && i <= sl + 8, line = (i - sl) % 2 === 0;
      if (line && (onStaff || (i >= cl && i <= ch) || true)) {
        var inSel = i >= cl && i <= ch;
        s += onStaff ? '<line x1="50" x2="250" y1="' + y(i) + '" y2="' + y(i) + '" class="rp-line"/>' : '<line x1="130" x2="170" y1="' + y(i) + '" y2="' + y(i) + '" class="rp-ledger' + (inSel ? " in" : "") + '"/>';
      }
    }
    s += '<text x="10" y="' + y(sl + (clef === "treble" ? 2 : 6)) + '" class="rp-clef">' + (clef === "treble" ? "" : "") + '</text>';
    [cl, ch].forEach(function(i, k){
      if (k === 1 && ch === cl) return;
      s += '<ellipse cx="150" cy="' + y(i) + '" rx="8" ry="5.4" class="rp-head"/><text x="268" y="' + (y(i) + 4) + '" class="rp-lab">' + posName(i) + '</text>';
    });
    if (typeof pend === "number") s += '<ellipse cx="150" cy="' + y(pend) + '" rx="10" ry="7" class="rp-pend"/>';
    for (var j = lo; j <= hi; j++) s += '<rect x="0" y="' + (y(j) - step / 2) + '" width="' + W + '" height="' + step + '" class="rp-hit" data-action="range-pick" data-clef="' + clef + '" data-idx="' + j + '"/>';
    var custom = !!(d.criteria.custom && d.criteria.custom[clef]);
    return '<div class="rp"><div class="rp-title">' + (clef === "treble" ? "Treble" : "Bass") + ' range <span class="chip ' + (custom ? "info" : "") + '">' + (custom ? "Custom" : RANGE_LABEL[d.criteria.range]) + '</span></div>' +
      '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">' + s + '</svg>' +
      '<div class="hint">' + (typeof pend === "number" ? "Now click the other end of the range." : "Click the lowest note, then the highest.") + '</div></div>';
  }
  function rangeBlockHtml(d){
    var clefs = d.criteria.clef === "both" ? ["treble", "bass"] : [d.criteria.clef];
    var presets = [["staff", "On the staff", PIC.ledger0], ["ledger1", "1 ledger line", PIC.ledger1], ["ledger2", "2 ledger lines", PIC.ledger2]];
    return '<div class="field-row"><span class="field-label">Range</span>' +
      '<div class="picrow">' + presets.map(function(p){ return picBtn(!d.criteria.custom && d.criteria.range === p[0], "range-preset", 'data-range="' + p[0] + '"', p[2], p[1]); }).join("") +
      (d.criteria.custom ? picBtn(true, "range-clear", "", '<svg viewBox="0 0 48 34"><path d="M12 26L36 8M12 8l24 18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>', "Clear custom") : "") + '</div>' +
      '<div class="rpwrap">' + clefs.map(function(c){ return rangePickerHtml(d, c); }).join("") + '</div></div>';
  }
  function segHtml(items, cur, action, attr){
    return '<span class="seg">' + items.map(function(it){ return '<button type="button" class="' + (cur === it[0] ? "on" : "") + '" data-action="' + action + '" data-' + attr + '="' + it[0] + '">' + escapeHtml(it[1]) + '</button>'; }).join("") + '</span>';
  }
  var CLEF_ITEMS = [["treble", "Treble", PIC.treble], ["bass", "Bass", PIC.bass], ["both", "Both (random)", PIC.both]];
  var STYLE_ITEMS = [["single", "Single staff", PIC.single], ["grand", "Grand staff", PIC.grand]];
  var ACC_ITEMS = [["either", "Either name", PIC.either], ["sharp", "Sharp name", PIC.sharp], ["flat", "Flat name", PIC.flat], ["both", "Both names", PIC.both2]];

  function renderLevelEditorModal(){
    var root = document.getElementById("modalRoot");
    if (!editing) { root.innerHTML = ""; return; }
    if (!editing.confirmDel) autosaveLevel();
    var d = editing.draft, mt = moduleTypeById(editing.typeId);
    var idx = editing.isNew ? (editing.insertIdx == null ? levels[mt.id].length : editing.insertIdx) : levelIndex(mt, levels[mt.id].filter(function(l){ return l.id === editing.id; })[0]);
    var staffOpts = usesStaff(mt) ?
      '<div class="two"><div class="field-row"><span class="field-label">Clef</span>' + picsHtml(CLEF_ITEMS, d.criteria.clef, "set-clef", "clef") + '</div>' +
        '<div class="field-row"><span class="field-label">Staff</span>' + picsHtml(STYLE_ITEMS, d.criteria.staffStyle, "set-style", "style") + '</div></div>' +
      rangeBlockHtml(d) +
      '<div class="hint">Clef picks which notes are used; Staff picks how they are drawn. A grand staff draws each note by its pitch (C4 and up on the treble staff).</div>' : "";
    var accOpts = mt.prompt === "key" ?
      '<div class="field-row"><span class="field-label">A black key as the question: which name counts?</span>' + picsHtml(ACC_ITEMS, d.criteria.accidentals, "set-acc", "acc") +
        '<div class="hint">“Both”: the student presses the sharp name and the flat name (the first one turns blue while they find the other).</div></div>' : "";
    root.innerHTML =
      '<div class="modal-overlay" data-action="close-editor">' +
        '<div class="modal-panel" data-action="stop-modal-click">' +
          '<div class="modal-header"><i class="ti ti-adjustments" aria-hidden="true"></i> ' +
            (editing.isNew ? "New level" : "Edit") + ' — ' + escapeHtml(levelTitle(mt, idx, false)) +
            '<div class="spacer"></div><span id="editSaved" class="hint" style="margin-right:6px">' + (editing.autoSaved ? "Saved" : "") + '</span>' +
            (editing.isNew ? "" : '<button type="button" class="btn small" data-action="reset-score"><i class="ti ti-refresh" aria-hidden="true"></i> Reset scores</button>' +
              '<button type="button" class="btn small danger" data-action="delete-level"><i class="ti ti-trash" aria-hidden="true"></i> Delete…</button>') +
            '<button type="button" class="btn small" data-action="cancel-editor" title="Undo everything changed since this window opened">Cancel</button>' +
            '<button type="button" class="btn small accent" data-action="save-level" title="Everything is already saved; this just closes"><i class="ti ti-check" aria-hidden="true"></i> Save</button>' +
          '</div>' +
          (editing.error ? '<div class="editerr footerr" style="margin:6px 12px 0">' + escapeHtml(editing.error) + '</div>' : "") +
          '<div class="modal-body">' +
            (editing.confirmDel ? '<div class="delbox"><b>Delete “' + escapeHtml(levelTitle(mt, idx)) + '” for good?</b> Its class and practice scores and Learn progress go with it, and this cannot be undone. Type <b>delete</b> to unlock the button.' +
              '<div style="display:flex;gap:8px;margin-top:8px"><input type="text" id="delConfirm" placeholder="delete" autocomplete="off" /><button type="button" class="btn danger" id="delGo" data-action="delete-level-go" disabled>Delete for good</button><button type="button" class="btn" data-action="delete-level-cancel">Keep it</button></div></div>' : "") +
            '<div class="field-row"><span class="field-label">One-word skill (the title becomes “' + escapeHtml(levelTitle(mt, idx, false)) + ' (Sharps)”)</span>' +
              '<div style="display:flex;gap:6px"><input type="text" id="editLevelName" value="' + escapeHtml(d.name) + '" placeholder="e.g. Sharps" /><button type="button" class="btn" data-action="suggest-name" title="Name it from the notes below"><i class="ti ti-wand" aria-hidden="true"></i> Suggest</button></div></div>' +
            '<div class="field-row">' + iconFieldHtml(d.icon) + '</div>' +
            '<div class="field-row"><span class="field-label">What’s new (optional, shown on the level card and in Plan)</span><input type="text" id="editLevelBlurb" value="' + escapeHtml(d.blurb) + '" placeholder="e.g. Adds sharps" /></div>' +
            '<div class="field-row"><span class="field-label">Notes for you (optional, shown in Plan, never in the game)</span><textarea id="editLevelInstructions" placeholder="Empty is fine">' + escapeHtml(d.instructions) + '</textarea></div>' +
            '<div class="field-row">' + linkFieldHtml(d) + '</div>' +
            staffOpts + accOpts +
            '<div><span class="field-label">Every note name, one click at a time</span>' +
              '<div class="hint" style="margin-bottom:6px">Click a note to step it through the four states. The buttons below are shortcuts for the accidentals (naturals have their own All / None).</div>' +
              nsLegendHtml() +
              '<div class="askrow"><button type="button" class="btn small" data-action="acc-all"><i class="ti ti-checks" aria-hidden="true"></i> All accidentals asked</button><button type="button" class="btn small" data-action="acc-none"><i class="ti ti-square" aria-hidden="true"></i> No accidentals asked</button><button type="button" class="btn small" data-action="acc-black"><i class="ti ti-square-filled" aria-hidden="true"></i> Only black keys (the normal accidentals)</button></div>' +
              '<div style="display:flex;flex-direction:column;gap:8px">' + ROWS.map(function(r){ return noteRowHtml(d, r); }).join("") + '</div></div>' +
          '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function saveLevelFromEditor(){
    clearTimeout(autosaveTimer);
    syncDraft();
    var d = editing.draft, mt = moduleTypeById(editing.typeId);
    if (!poolFor(d).length) { editing.error = "Set at least one note to “Available as answer” (blue). Nothing is saved until this is fixed; Cancel puts the level back as it was."; renderLevelEditorModal(); return; }
    var bad = unanswerableNotes(d, mt);
    if (bad.length) {
      editing.error = "These asked notes cannot be answered with the current settings (a needed button is greyed out or hidden, or for “both names” one spelling is missing): " + bad.map(pretty).join(" ") + ". Nothing is saved until this is fixed; Cancel puts the level back as it was.";
      renderLevelEditorModal(); return;
    }
    autosaveLevel();
    closeLevelEditor();
    renderApp();
  }
  function deleteLevelFromEditor(){
    var typeId = editing.typeId, id = editing.id, k = typeId + ":" + id;
    levels[typeId] = levels[typeId].filter(function(l){ return l.id !== id; });
    delete classScores[k]; delete testScores[k]; delete config.learn[k];
    delete config.states[k];
    saveLevels(); saveClassScores(); saveTestScores(); saveConfig();
    closeLevelEditor();
    renderApp();
  }
  function resetScoreFromEditor(){
    if (!confirm("Reset the class and practice scores for this level to zero?")) return;
    var k = editing.typeId + ":" + editing.id;
    delete classScores[k]; delete testScores[k]; delete config.learn[k];
    saveClassScores(); saveTestScores(); saveConfig(true);
    closeLevelEditor();
    renderApp();
  }

  // ---------- Game settings (whole-game settings) ----------
  function openTypeEditor(typeId){
    var m = typeId ? moduleTypeById(typeId) : null;
    picker = { open: false, q: "", target: "" };
    var draft = m ? JSON.parse(JSON.stringify(m)) : normalizeType({ id: "__new", name: "New game", prompt: "staff", answer: "name" });
    typeEdit = { id: m ? m.id : null, error: "", draft: draft, fmt: JSON.parse(JSON.stringify(config.formatIcons || {})), chOrig: JSON.parse(JSON.stringify(config.customHelpers || [])), saved: false };
    renderTypeEditor();
  }
  function closeTypeEditor(){ if (typeEdit && !typeEdit.saved && typeEdit.chOrig) config.customHelpers = typeEdit.chOrig; typeEdit = null; picker.open = false; document.getElementById("modalRoot").innerHTML = ""; }
  function syncTypeDraft(){
    if (!typeEdit) return;
    var d = typeEdit.draft, el;
    if ((el = document.getElementById("typeName"))) d.name = el.value;
    if ((el = document.getElementById("typeStreak"))) { var n = parseInt(el.value, 10); if (n >= 1 && n <= 20) d.learnStreak = n; }
    if ((el = document.getElementById("typeStrikes"))) { var k = parseInt(el.value, 10); if (k >= 1 && k <= 5) d.strikes = k; }
    if ((el = document.getElementById("typeGoal"))) { var g = parseInt(el.value, 10); if (g >= 3 && g <= 50) d.testGoal = g; }
    if ((el = document.getElementById("typeGroup"))) d.group = el.value;
    [].forEach.call(document.querySelectorAll("[data-chf]"), function(inp){
      var h = (config.customHelpers || []).filter(function(c){ return c.id === inp.getAttribute("data-id"); })[0];
      if (h) h[inp.getAttribute("data-chf")] = inp.value;
    });
  }
  function fmtButtons(which, d){
    return '<div class="fmt-grid">' + ["staff", "name", "key"].map(function(f){
      var other = which === "prompt" ? d.answer : d.prompt;
      return '<button type="button" class="fmtbtn' + (d[which] === f ? " on" : "") + '" data-action="set-fmt" data-which="' + which + '" data-fmt="' + f + '"' + (other === f ? " disabled" : "") + '>' + fmtIconHtml(f, typeEdit.fmt[f]) + FORMATS[f].label + '<span class="d">' + FORMATS[f].d + '</span></button>';
    }).join("") + '</div>';
  }
  function helperRowsHtml(d){
    var on = (d.helpers || []).filter(function(id){ var h = helperById(id); return h && h.applies(d); });
    var off = allHelpers().filter(function(h){ return h.applies(d) && on.indexOf(h.id) === -1; }).map(function(h){ return h.id; });
    return on.concat(off).map(function(id){
      var h = helperById(id), isOn = on.indexOf(id) !== -1;
      return '<div class="hrow' + (isOn ? "" : " off") + '"><button type="button" class="hcheck' + (isOn ? " on" : "") + '" data-action="helper-toggle" data-id="' + id + '" title="' + (isOn ? "Offered" : "Not offered") + '"><i class="ti ' + (isOn ? "ti-check" : "ti-plus") + '" aria-hidden="true"></i></button>' +
        '<i class="ti ' + h.icon + '" aria-hidden="true"></i><span class="hname">' + escapeHtml(h.label) + '</span><span class="hkind">' + h.kind + '</span>' +
        (isOn ? '<button type="button" class="lc-btn" data-action="helper-up" data-id="' + id + '" title="Earlier (fades first in Learn, added last in Practice)"><i class="ti ti-arrow-up" aria-hidden="true"></i></button><button type="button" class="lc-btn" data-action="helper-down" data-id="' + id + '" title="Later"><i class="ti ti-arrow-down" aria-hidden="true"></i></button>' : "") + '</div>';
    }).join("");
  }
  var CH_KINDS = [["text", "Message"], ["reveal", "Click to reveal"], ["question", "Question"]];
  var CH_STYLES = [["plain", "Plain"], ["callout", "Callout"], ["big", "Big"], ["steps", "Steps"]];
  function customHelperEditHtml(){
    var list = config.customHelpers || [];
    return list.map(function(c){
      var kind = c.kind || "text", id = c.id;
      var fields = kind === "text" ?
        '<textarea data-chf="text" data-id="' + id + '" placeholder="What the student reads, e.g. This note is {name}">' + escapeHtml(c.text || "") + '</textarea>' +
          '<div class="chline"><span class="muted small">Look:</span>' + segHtmlRaw(CH_STYLES, c.style || "plain", "ch-style", id) + '<span class="muted small">Steps: separate them with |</span></div>' :
        kind === "reveal" ?
        '<input type="text" data-chf="ask" data-id="' + id + '" value="' + escapeHtml(c.ask || "") + '" placeholder="Button text, e.g. Need a hint?" />' +
          '<textarea data-chf="text" data-id="' + id + '" placeholder="Shown when the student clicks the button, e.g. It is {letter}">' + escapeHtml(c.text || "") + '</textarea>' :
        '<input type="text" data-chf="ask" data-id="' + id + '" value="' + escapeHtml(c.ask || "") + '" placeholder="The question, e.g. Does {name} have a sign?" />' +
          '<input type="text" data-chf="right" data-id="' + id + '" value="' + escapeHtml(c.right || "") + '" placeholder="The right answer, e.g. No" />' +
          '<input type="text" data-chf="wrong" data-id="' + id + '" value="' + escapeHtml(c.wrong || "") + '" placeholder="Wrong answers, separated by commas, e.g. Yes" />' +
          '<input type="text" data-chf="text" data-id="' + id + '" value="' + escapeHtml(c.text || "") + '" placeholder="Shown after a right answer (optional)" />';
      return '<div class="chcard"><div class="chline">' + segHtmlRaw(CH_KINDS, kind, "ch-kind", id) +
        '<button type="button" class="btn small" data-action="toggle-icons" data-target="ch:' + id + '" title="Choose the icon"><i class="ti ' + escapeHtml(c.icon || "ti-bulb") + '" aria-hidden="true"></i></button>' +
        '<input type="text" data-chf="label" data-id="' + id + '" value="' + escapeHtml(c.label) + '" placeholder="Name on the helper button" />' +
        '<button type="button" class="lc-btn" data-action="del-chelper" data-id="' + id + '" title="Delete this helper"><i class="ti ti-trash" aria-hidden="true"></i></button></div>' +
        fields + (picker.open && picker.target === "ch:" + id ? pickerBlockHtml(c.icon) : "") + '</div>';
    }).join("") + '<button type="button" class="btn small" data-action="add-chelper"><i class="ti ti-plus" aria-hidden="true"></i> New helper</button>' +
      '<div class="hint">{name} = the note’s name (C♯), {letter} = its letter. Built-in helpers (line or space, count up, key names…) are written in code; your own helpers can be a message, a click-to-reveal hint, or a question. A full lesson editor is the next big step.</div>';
  }
  function segHtmlRaw(items, cur, action, id){
    return '<span class="seg">' + items.map(function(it){ return '<button type="button" class="' + (cur === it[0] ? "on" : "") + '" data-action="' + action + '" data-id="' + id + '" data-v="' + it[0] + '">' + escapeHtml(it[1]) + '</button>'; }).join("") + '</span>';
  }
  function formatIconRowsHtml(){
    return ["staff", "name", "key"].map(function(f){
      var cur = typeEdit.fmt[f] && typeEdit.fmt[f] !== "svg" ? typeEdit.fmt[f] : "";
      return '<div class="frow"><span class="iconcur">' + fmtIconHtml(f, typeEdit.fmt[f]) + '</span><span class="hname">' + FORMATS[f].label + '</span>' +
        '<button type="button" class="btn small" data-action="toggle-icons" data-target="fmt:' + f + '"><i class="ti ti-icons" aria-hidden="true"></i> Choose icon</button>' +
        '<button type="button" class="btn small" data-action="fmt-default" data-fmt="' + f + '"' + (cur ? "" : " disabled") + '>Use the drawing</button></div>';
    }).join("");
  }
  function layoutHtml(d, isNew){
    var opts = '<option value="">No group</option>' + (config.groups || []).map(function(g){ return '<option value="' + g.id + '"' + (d.group === g.id ? " selected" : "") + '>' + escapeHtml(g.name) + '</option>'; }).join("");
    return '<div class="field-row"><span class="field-label">Group in the game bar</span><div class="numrow"><select id="typeGroup">' + opts + '</select>' +
      '<span class="muted small">Order, colours and new groups: the list button beside the gear in the game bar.</span></div></div>';
  }
  function defaultsHtml(d){
    if (!usesStaff(d) && d.prompt !== "key") return "";
    var df = d.defaults || {};
    return '<div class="field-row"><span class="field-label">Defaults for new levels in this game</span>' +
      (usesStaff(d) ? '<div class="two"><div>' + picsHtml(CLEF_ITEMS, df.clef, "def-clef", "v") + '</div><div>' + picsHtml(STYLE_ITEMS, df.staffStyle, "def-style", "v") + '</div></div>' : "") +
      (d.prompt === "key" ? picsHtml(ACC_ITEMS, df.accidentals, "def-acc", "v") : "") + '</div>';
  }
  function renderTypeEditor(){
    var root = document.getElementById("modalRoot");
    if (!typeEdit) { root.innerHTML = ""; return; }
    var d = typeEdit.draft, isNew = !typeEdit.id, isDefault = !!defaultTypeById(typeEdit.id);
    var nLevels = typeEdit.id ? (levels[typeEdit.id] || []).length : 0;
    var pickFmt = picker.open && picker.target.indexOf("fmt:") === 0 ? picker.target.slice(4) : "";
    root.innerHTML =
      '<div class="modal-overlay" data-action="close-type"><div class="modal-panel" data-action="stop-modal-click" style="width:min(600px,94vw)">' +
        '<div class="modal-header"><i class="ti ti-settings" aria-hidden="true"></i> ' + (isNew ? "New game" : "Game settings") + '<div class="spacer"></div>' +
          (isNew ? "" : '<button type="button" class="btn small danger" data-action="delete-type"><i class="ti ti-trash" aria-hidden="true"></i> Delete game</button>') + '</div>' +
        '<div class="modal-body">' +
          (typeEdit.error ? '<div class="editerr">' + escapeHtml(typeEdit.error) + '</div>' : "") +
          '<div class="field-row"><span class="field-label">Game name (levels are titled “' + escapeHtml((d.name || "Name").trim() || "Name") + ' 1 (Naturals)”…)</span><input type="text" id="typeName" value="' + escapeHtml(d.name) + '" /></div>' +
          '<div class="field-row"><span class="field-label">Question format (what the student sees)</span>' + fmtButtons("prompt", d) + '</div>' +
          '<div class="field-row"><span class="field-label">Answer format (how the student answers)</span>' + fmtButtons("answer", d) + '</div>' +
          (nLevels ? '<div class="hint">This game has ' + nLevels + ' level' + (nLevels === 1 ? "" : "s") + '. Changing the formats keeps their notes, clefs and show / grey / hide settings; check each level afterwards.</div>' : "") +
          '<div class="two"><div class="field-row"><span class="field-label">Learn mode</span><div class="numrow">Fade help after <input type="text" id="typeStreak" value="' + d.learnStreak + '" /> right in a row</div></div>' +
          '<div class="field-row"><span class="field-label">Test mode</span><div class="numrow">Goal <input type="text" id="typeGoal" value="' + d.testGoal + '" /> right &middot; lives <input type="text" id="typeStrikes" value="' + d.strikes + '" /></div></div></div>' +
          '<div class="hint">Test: the student shows only their correct answers and their lives. A miss costs a life (the heart drops) and the same question is asked again; losing the last life ends the round. Reaching the goal with a life left passes (with 2 lives that is 10/10 or 10/11).</div>' +
          layoutHtml(d, isNew) + defaultsHtml(d) +
          '<div class="field-row"><span class="field-label">Helpers this game offers (in order)</span><div class="hlist">' + helperRowsHtml(d) + '</div>' +
            '<div class="field-label" style="margin-top:8px">Your own helpers</div>' + customHelperEditHtml() +
            '<div class="hint">Learn starts with all of them and removes the top ones first as answers are right. Practice offers them in a Help menu and adds the bottom one after a miss. Test shows none.</div></div>' +
          '<div class="field-row"><span class="field-label">Format icons (shared by every game)</span><div class="flist">' + formatIconRowsHtml() + '</div>' +
            (pickFmt ? pickerBlockHtml(typeEdit.fmt[pickFmt]) : "") + '</div>' +
          (isNew ? "" : '<div class="field-row"><span class="field-label">Data for this game</span><div class="status-line"><button type="button" class="btn small" data-action="clear-practice-type"><i class="ti ti-eraser" aria-hidden="true"></i> Clear practice data</button><button type="button" class="btn small danger" data-action="clear-class-type"><i class="ti ti-trash" aria-hidden="true"></i> Clear class data</button></div></div>') +
        '</div>' +
        '<div class="modal-footer">' + (isDefault ? '<button type="button" class="btn" data-action="type-default">Use defaults</button>' : "") + '<span class="spacer"></span>' +
          '<button type="button" class="btn" data-action="close-type">Cancel</button>' +
          '<button type="button" class="btn accent" data-action="save-type"><i class="ti ti-check" aria-hidden="true"></i> Save</button></div>' +
      '</div></div>';
  }
  function saveTypeFromEditor(){
    syncTypeDraft();
    var d = typeEdit.draft;
    d.name = (d.name || "").trim();
    if (!d.name) { typeEdit.error = "Give the game a name."; renderTypeEditor(); return; }
    if (d.prompt === d.answer) { typeEdit.error = "The question and the answer need different formats."; renderTypeEditor(); return; }
    config.formatIcons = typeEdit.fmt;
    typeEdit.saved = true;
    if (typeEdit.id) {
      for (var i = 0; i < MODULE_TYPES.length; i++) if (MODULE_TYPES[i].id === typeEdit.id) { d.id = typeEdit.id; MODULE_TYPES[i] = normalizeType(d); }
      config.types = MODULE_TYPES;
    } else {
      var nt = normalizeType({ id: uid(), name: d.name, prompt: d.prompt, answer: d.answer, learnStreak: d.learnStreak, strikes: d.strikes, testGoal: d.testGoal, helpers: d.helpers, group: d.group, defaults: d.defaults });
      MODULE_TYPES.push(nt); config.types = MODULE_TYPES;
      levels[nt.id] = [];
      var first = newLevelShell("Naturals", nt); first.blurb = "Naturals only."; levels[nt.id].push(first);
      hubTypeId = nt.id; planTypeId = nt.id; hubLevelId = null;
      saveLevels();
    }
    saveConfig();
    closeTypeEditor();
    renderApp();
  }
  function deleteTypeFromEditor(){
    var id = typeEdit.id, m = moduleTypeById(id), n = (levels[id] || []).length;
    if (!confirm("Delete “" + m.name + "”" + (n ? " and its " + n + " level" + (n === 1 ? "" : "s") : "") + "? This can’t be undone.")) return;
    MODULE_TYPES = MODULE_TYPES.filter(function(x){ return x.id !== id; });
    config.types = MODULE_TYPES;
    delete levels[id]; Object.keys(config.states).forEach(function(k){ if (k.indexOf(id + ":") === 0) delete config.states[k]; });
    clearScoresFor(classScores, id); clearScoresFor(testScores, id); clearScoresFor(config.learn, id);
    hubTypeId = MODULE_TYPES.length ? MODULE_TYPES[0].id : null; planTypeId = hubTypeId; hubLevelId = null;
    saveLevels(); saveClassScores(); saveTestScores(); saveConfig();
    closeTypeEditor();
    renderApp();
  }

  // ---------- Status editor (what the level status icons mean) ----------
  var stateEdit = null;
  var SWATCHES = ["#2fb067", "#e9a31a", "#e5534b", "#8a8a9a", "#7b5cf0", "#2d9cdb", "#d6459b", "#14a39a", "#f08a24", "#8a6d3b"];
  function swatchRowHtml(cur, action, extra){
    return '<span class="swatches">' + SWATCHES.map(function(c){ return '<button type="button" class="swatch' + (c.toLowerCase() === String(cur).toLowerCase() ? " on" : "") + '" style="background:' + c + '" data-action="' + action + '" data-color="' + c + '" ' + (extra || "") + ' aria-label="Colour ' + c + '"></button>'; }).join("") + '</span>';
  }
  function syncStateEdit(){
    [].forEach.call(document.querySelectorAll("[data-stf]"), function(inp){
      var id = inp.getAttribute("data-id"), k = inp.getAttribute("data-stf"), def = STATE_DEFAULTS.filter(function(x){ return x.id === id; })[0];
      config.stateDefs[id] = config.stateDefs[id] || {};
      if (inp.value.trim() && inp.value !== def[k]) config.stateDefs[id][k] = inp.value; else delete config.stateDefs[id][k];
    });
  }
  function openStateEditor(){ picker = { open: false, q: "", target: "" }; stateEdit = { dirty: true }; renderStateEditor(); }
  function closeStateEditor(){ syncStateEdit(); stateEdit = null; picker.open = false; document.getElementById("modalRoot").innerHTML = ""; saveConfig(); renderApp(); }
  function renderStateEditor(){
    var root = document.getElementById("modalRoot");
    if (!stateEdit) { root.innerHTML = ""; return; }
    var rows = stateList().map(function(x){
      var pk = picker.open && picker.target === "state:" + x.id;
      return '<div class="strow"><div class="chline"><span class="st-prev" style="--c:' + x.color + '"><i class="ti ' + x.icon + '" aria-hidden="true"></i></span>' +
        '<button type="button" class="btn small" data-action="toggle-icons" data-target="state:' + x.id + '"><i class="ti ti-icons" aria-hidden="true"></i> Icon</button>' +
        '<input type="text" data-stf="label" data-id="' + x.id + '" value="' + escapeHtml(x.label) + '" placeholder="Name" />' + swatchRowHtml(x.color, "st-color", 'data-id="' + x.id + '"') +
        '<button type="button" class="btn small" data-action="st-reset" data-id="' + x.id + '">Reset</button></div>' +
        '<input type="text" data-stf="tip" data-id="' + x.id + '" value="' + escapeHtml(x.tip) + '" placeholder="What hovering over it says" />' + (pk ? pickerBlockHtml(x.icon) : "") + '</div>';
    }).join("");
    root.innerHTML = '<div class="modal-overlay" data-action="close-states"><div class="modal-panel" data-action="stop-modal-click" style="width:min(620px,94vw)">' +
      '<div class="modal-header"><i class="ti ti-flag-3" aria-hidden="true"></i> What the level status icons mean</div>' +
      '<div class="modal-body"><div class="hint">There are four statuses (Progress sets them from its schedule). Change the name, icon, colour and the sentence that appears when you hover over the icon. Click the icon on a level card to step through them.</div>' + rows + '</div>' +
      '<div class="modal-footer"><span class="spacer"></span><button type="button" class="btn accent" data-action="close-states"><i class="ti ti-check" aria-hidden="true"></i> Done</button></div></div></div>';
  }

  // ---------- Order, groups and look of the game buttons ----------
  var arrange = null, mdrag = null;
  function openArrange(){ picker = { open: false, q: "", target: "" }; arrange = { dirty: false }; renderArrange(); }
  function closeArrange(){ syncArrange(); arrange = null; document.getElementById("modalRoot").innerHTML = ""; renderApp(); }
  function syncArrange(){
    [].forEach.call(document.querySelectorAll("[data-gname]"), function(inp){ var g = groupById(inp.getAttribute("data-gname")); if (g) g.name = inp.value.trim() || "Group"; });
  }
  function arrSave(){ arrange.dirty = true; sortByGroups(); saveConfig(true); renderArrange(); }
  function mgMove(id, gid, beforeId, after){
    var m = moduleTypeById(id); if (!m) return;
    var arr = MODULE_TYPES.filter(function(x){ return x !== m; });
    m.group = gid || "";
    var at;
    if (beforeId && beforeId !== id) { at = arr.map(function(x){ return x.id; }).indexOf(beforeId); if (at < 0) at = arr.length; else if (after) at++; }
    else { var last = -1; arr.forEach(function(x, i){ if ((x.group || "") === (m.group || "")) last = i; }); at = last >= 0 ? last + 1 : arr.length; }
    arr.splice(at, 0, m);
    MODULE_TYPES = arr; config.types = arr; arrSave();
  }
  function mgRowHtml(m, i, n){
    var opts = '<option value="">No group</option>' + (config.groups || []).map(function(g){ return '<option value="' + g.id + '"' + (m.group === g.id ? " selected" : "") + '>' + escapeHtml(g.name) + '</option>'; }).join("");
    return '<div class="mg-row" data-trow="' + m.id + '"><span class="grip" data-mgrip="' + m.id + '" title="Drag to move this game (to another spot or group)"><i class="ti ti-grip-vertical" aria-hidden="true"></i></span>' +
      '<span class="mg-name">' + typeIconsHtml(m) + ' ' + escapeHtml(m.name) + '</span>' +
      '<select data-change="mg-group" data-type="' + m.id + '" title="Move to a group">' + opts + '</select>' +
      '<button type="button" class="lc-btn" data-action="mg-up" data-type="' + m.id + '" title="Earlier"><i class="ti ti-arrow-up" aria-hidden="true"></i></button>' +
      '<button type="button" class="lc-btn" data-action="mg-down" data-type="' + m.id + '" title="Later"><i class="ti ti-arrow-down" aria-hidden="true"></i></button></div>';
  }
  function lookHtml(){
    var so = staffIconOpts(), curName = (config.icons && config.icons.name) || "sharp", lab = config.cardLabel || "text";
    function seg(items, cur, key){ return '<span class="seg">' + items.map(function(it){ return '<button type="button" class="' + (cur === it[0] ? "on" : "") + '" data-action="icon-staff" data-k="' + key + '" data-v="' + it[0] + '">' + it[1] + '</button>'; }).join("") + '</span>'; }
    var ovr = ["staff", "name"].filter(function(f){ return config.formatIcons && config.formatIcons[f] && config.formatIcons[f] !== "svg"; });
    var demo = MODULE_TYPES.filter(function(m){ return m.prompt === "name" && m.answer === "staff"; })[0] || MODULE_TYPES[0];
    return '<div class="mg-sec"><b>Game buttons show</b>' + segHtmlRaw([["text", "Words only"], ["icons", "Pictures only"], ["both", "Both"]], lab, "set-label", "x") +
        '<div class="hint">Words only is the clearest in class (each game name is two short words). Pictures read best when students already know them.</div></div>' +
      '<div class="mg-sec"><b>Staff picture</b><div class="iconpresets">' + STAFF_ICON_PRESETS.map(function(p, i){ return '<button type="button" class="iconpre" data-action="icon-preset" data-i="' + i + '" title="' + escapeHtml(p.label) + '">' + staffIconSvg(p.o, "big") + '<span>' + escapeHtml(p.label) + '</span></button>'; }).join("") + '</div>' +
        '<div class="icfine"><span>Lines</span>' + seg([[5, "5"], [3, "3"], [1, "1"]], so.lines, "lines") + '<span>Start bar</span>' + seg([["none", "None"], ["single", "Bar"]], so.left, "left") +
        '<span>End bar</span>' + seg([["none", "None"], ["single", "Bar"], ["double", "Double"], ["final", "Final"]], so.right, "right") + '<span>Clef</span>' + seg([["none", "None"], ["treble", "Treble"], ["bass", "Bass"]], so.clef, "clef") +
        '<span>Note</span>' + seg([["none", "None"], ["whole", "Whole"], ["half", "Half"], ["quarter", "Quarter"]], so.note, "note") + '</div></div>' +
      '<div class="mg-sec"><b>Note-name picture</b><div class="iconpresets">' + NAME_ICON_KINDS.map(function(k){ return '<button type="button" class="iconpre' + (curName === k[0] ? " on" : "") + '" data-action="icon-name" data-v="' + k[0] + '" title="' + escapeHtml(k[1]) + '">' + nameIconSvg(k[0]) + '<span>' + escapeHtml(k[1]) + '</span></button>'; }).join("") + '</div></div>' +
      (ovr.length ? '<div class="hint">A picture chosen from the icon list in Game settings overrides the drawing for: ' + ovr.map(function(f){ return FORMATS[f].label; }).join(", ") + '. <button type="button" class="btn small" data-action="icon-clear-override">Use the drawings</button></div>' : "") +
      '<div class="mg-sec"><b>Preview</b><div class="gprev"><span class="gcard on" style="pointer-events:none">' + (lab !== "text" ? typeIconsHtml(demo) : "") + (lab !== "icons" ? '<span class="gname">' + escapeHtml(demo.name) + '</span>' : "") + '</span></div></div>';
  }
  function renderArrange(){
    var root = document.getElementById("modalRoot");
    if (!arrange) { root.innerHTML = ""; return; }
    var gi = {}, body = "";
    (config.groups || []).forEach(function(g, gidx){
      var list = MODULE_TYPES.filter(function(m){ return m.group === g.id; });
      body += '<div class="mg-group" style="--gc:' + g.color + '"><div class="mg-head"><input type="text" data-gname="' + g.id + '" value="' + escapeHtml(g.name) + '" />' + swatchRowHtml(g.color, "mg-color", 'data-g="' + g.id + '"') +
        '<button type="button" class="lc-btn" data-action="mg-gup" data-g="' + g.id + '" title="Move the group earlier"' + (gidx === 0 ? " disabled" : "") + '><i class="ti ti-arrow-up" aria-hidden="true"></i></button>' +
        '<button type="button" class="lc-btn" data-action="mg-gdown" data-g="' + g.id + '" title="Move the group later"' + (gidx === config.groups.length - 1 ? " disabled" : "") + '><i class="ti ti-arrow-down" aria-hidden="true"></i></button>' +
        '<button type="button" class="lc-btn" data-action="mg-gdel" data-g="' + g.id + '" title="Delete the group (its games stay, ungrouped)"><i class="ti ti-x" aria-hidden="true"></i></button></div>' +
        '<div class="mg-body" data-gbody="' + g.id + '">' + (list.map(mgRowHtml).join("") || '<div class="mg-empty">Drag a game here</div>') + '</div></div>';
    });
    var loose = MODULE_TYPES.filter(function(m){ return !m.group || !groupById(m.group); });
    body += '<div class="mg-group none"><div class="mg-head"><b>No group</b></div><div class="mg-body" data-gbody="">' + (loose.map(mgRowHtml).join("") || '<div class="mg-empty">Drag a game here to take it out of its group</div>') + '</div></div>';
    root.innerHTML = '<div class="modal-overlay" data-action="close-arrange"><div class="modal-panel" data-action="stop-modal-click" style="width:min(680px,95vw)">' +
      '<div class="modal-header"><i class="ti ti-layout-list" aria-hidden="true"></i> Games, groups and look<span class="spacer"></span></div>' +
      '<div class="modal-body"><div class="mg-sec"><b>Order and groups</b><div class="hint">Drag a game by its grip to move it, even into another group. A group is the coloured box around its games in the game bar; pick its colour in its header.</div>' + body +
        '<button type="button" class="btn small" data-action="mg-gadd"><i class="ti ti-plus" aria-hidden="true"></i> New group</button></div>' + lookHtml() + '</div>' +
      '<div class="modal-footer"><span class="spacer"></span><button type="button" class="btn accent" data-action="close-arrange"><i class="ti ti-check" aria-hidden="true"></i> Done</button></div></div></div>';
  }
  // drag games between rows and groups (plain mouse events, never native drag and drop)
  document.addEventListener("mousedown", function(ev){
    var g = ev.target.closest ? ev.target.closest("[data-mgrip]") : null;
    if (!g || !arrange) return;
    ev.preventDefault(); ev.stopPropagation();
    mdrag = { id: g.getAttribute("data-mgrip"), gid: null, before: null, after: false };
    document.body.classList.add("dragging");
    var r = g.closest(".mg-row"); if (r) r.classList.add("dragging-row");
  }, true);
  function clearMg(){ [].forEach.call(document.querySelectorAll(".mg-row, .mg-body"), function(e){ e.classList.remove("drop-above", "drop-below", "drop-in"); }); }
  document.addEventListener("mousemove", function(ev){
    if (!mdrag) return;
    clearMg(); mdrag.gid = null; mdrag.before = null;
    var hit = false;
    [].forEach.call(document.querySelectorAll(".mg-row"), function(r){
      if (hit || r.getAttribute("data-trow") === mdrag.id) return;
      var rc = r.getBoundingClientRect();
      if (ev.clientY >= rc.top && ev.clientY <= rc.bottom && ev.clientX >= rc.left && ev.clientX <= rc.right) {
        hit = true; mdrag.before = r.getAttribute("data-trow"); mdrag.after = ev.clientY > rc.top + rc.height / 2;
        mdrag.gid = r.parentNode.getAttribute("data-gbody"); r.classList.add(mdrag.after ? "drop-below" : "drop-above");
      }
    });
    if (!hit) [].forEach.call(document.querySelectorAll(".mg-body"), function(b){
      if (hit) return;
      var rc = b.getBoundingClientRect();
      if (ev.clientY >= rc.top - 6 && ev.clientY <= rc.bottom + 6 && ev.clientX >= rc.left && ev.clientX <= rc.right) { hit = true; mdrag.gid = b.getAttribute("data-gbody"); b.classList.add("drop-in"); }
    });
  });
  document.addEventListener("mouseup", function(){
    if (!mdrag) return;
    var d = mdrag; mdrag = null;
    document.body.classList.remove("dragging"); clearMg();
    if (d.gid === null) { if (arrange) renderArrange(); return; }
    mgMove(d.id, d.gid, d.before, d.after);
  });

  // ---------- Piano: a long strip seen through an 11-white-key window that rolls like a wheel ----------
  // Rules (see HANDOFF): the window starts only on C, E, F, G or B, so it never starts on A and never ends on G. That means a
  // group of 3 black keys can never show exactly 2 whole keys at an edge, and a lone cut-off black key is always the first or
  // last key of its group (students know a black key is never alone). Edges are cropped at white-key boundaries, so a white key
  // is never half cut; a black key sitting on the edge is simply cut by the window. The key being asked about is always fully
  // visible, and only ONE instance of it (random octave) is highlighted.
  var PW = 30, PH = 120, BW = 19, BH = 74, WIN = 11, STRIP = 35;
  var START_LETTERS = ["C", "E", "F", "G", "B"];
  var lastPianoJ0 = -1;
  function whitePc(j){ return LETTER_SEMITONE[LETTERS[j % 7]]; }
  function hasBlackAfter(j){ return [0, 1, 3, 4, 5].indexOf(j % 7) !== -1 && j < STRIP - 1; }
  function pianoStarts(){
    var out = [];
    for (var j = 7; j <= 20; j++) if (START_LETTERS.indexOf(LETTERS[j % 7]) !== -1) out.push(j);
    return out;
  }
  function keyInstances(pc, j0){
    var out = [], j;
    for (j = j0; j <= j0 + WIN - 1; j++) if (whitePc(j) === pc) out.push("w" + j);
    for (j = j0; j <= j0 + WIN - 2; j++) if (hasBlackAfter(j) && (whitePc(j) + 1) % 12 === pc) out.push("b" + j);
    return out;
  }
  // -> { j0, key }  (key = the one instance to highlight / reveal)
  function choosePianoWindow(pc){
    var opts = pianoStarts().filter(function(j0){ return keyInstances(pc, j0).length > 0; });
    var moved = opts.filter(function(j0){ return j0 !== lastPianoJ0; });
    var j0 = pick(moved.length ? moved : opts);
    lastPianoJ0 = j0;
    return { j0: j0, key: pick(keyInstances(pc, j0)) };
  }
  // Devtools: window.noteIdVerifyPianoWindows() -> every allowed start with its start / end letters and edge keys.
  window.noteIdVerifyPianoWindows = function(){
    var rows = pianoStarts().map(function(j0){
      var endJ = j0 + WIN - 1, s = LETTERS[j0 % 7], e = LETTERS[endJ % 7];
      return { j0: j0, start: s, end: e, leftCut: hasBlackAfter(j0 - 1) ? "black key cut on the left" : "", rightCut: hasBlackAfter(endJ) ? "black key cut on the right" : "" };
    });
    var ok = rows.every(function(r){ return r.start !== "A" && r.start !== "D" && r.end !== "G" && r.end !== "D"; });
    console.log("Piano windows:", rows, "rules hold:", ok);
    return { rows: rows, ok: ok };
  };

  function pianoSvgHtml(win){
    win = win || WIN;
    var whites = "", blacks = "", extras = "", j;
    for (j = 0; j < STRIP; j++) {
      var pc = whitePc(j);
      whites += '<rect class="piano-key white" data-k="w' + j + '" data-cls="' + pc + '" x="' + (j * PW) + '" y="0" width="' + PW + '" height="' + PH + '" rx="3"></rect>';
      extras += '<text class="pk-label" x="' + (j * PW + PW / 2) + '" y="' + (PH - 9) + '" text-anchor="middle">' + LETTERS[j % 7] + '</text>';
      if (j % 7 === 0) {
        extras += '<circle class="pk-cmark" cx="' + (j * PW + PW / 2) + '" cy="' + (PH - 34) + '" r="9"></circle><text class="pk-ctext" x="' + (j * PW + PW / 2) + '" y="' + (PH - 30) + '" text-anchor="middle">C</text>';
        if (j + 2 < STRIP) extras += '<rect class="pk-grp" x="' + ((j + 1) * PW - BW / 2 - 3) + '" y="-1" width="' + (PW + BW + 6) + '" height="' + (BH + 4) + '" rx="5"></rect>';
      }
      if (hasBlackAfter(j)) blacks += '<rect class="piano-key black" data-k="b' + j + '" data-cls="' + ((pc + 1) % 12) + '" x="' + ((j + 1) * PW - BW / 2) + '" y="0" width="' + BW + '" height="' + BH + '" rx="2"></rect>';
    }
    return '<div class="piano-wrap"><svg class="piano-svg" viewBox="0 0 ' + (win * PW) + ' ' + PH + '" xmlns="http://www.w3.org/2000/svg"><g class="pk-strip">' + whites + blacks + extras + '</g></svg></div>';
  }

  // o: { j0, target (key id or null), interactive, onKey(pc, el, keyId), enabledFn(pc) }
  // Calling it again on the same container rolls the strip to the new window instead of redrawing.
  function renderPiano(container, o){
    var st = container.__pk, win = o.win || WIN;
    if (!st || !container.contains(st.el) || st.win !== win) {
      container.innerHTML = pianoSvgHtml(win);
      st = { el: container.querySelector(".pk-strip"), j0: null, spinning: false, o: o, win: win };
      container.__pk = st;
      container.querySelector(".piano-svg").addEventListener("click", function(ev){
        var k = ev.target.closest ? ev.target.closest(".piano-key") : null;
        if (!k || !st.o.interactive || st.spinning) return;
        if (k.classList.contains("grey") || k.classList.contains("locked") || k.classList.contains("wrong-dim")) return;
        st.o.onKey(parseInt(k.getAttribute("data-cls"), 10), k, k.getAttribute("data-k"));
      });
    }
    st.o = o;
    [].forEach.call(container.querySelectorAll(".piano-key"), function(k){
      k.classList.remove("target", "right", "wrong", "wrong-dim", "locked", "grey", "picked");
      var cls = parseInt(k.getAttribute("data-cls"), 10);
      if (o.target && k.getAttribute("data-k") === o.target) k.classList.add("target");
      if (o.enabledFn && !o.enabledFn(cls)) k.classList.add("grey");
    });
    var tx = "translateX(" + (-o.j0 * PW) + "px)";
    if (st.j0 === null) {
      st.el.style.transition = "none"; st.el.style.transform = tx; void st.el.getBoundingClientRect(); st.el.style.transition = "";
    } else if (st.j0 !== o.j0) {
      st.spinning = true; st.el.style.transform = tx;
      setTimeout(function(){ st.spinning = false; }, 780);
    }
    st.j0 = o.j0;
    return st;
  }
  function wireMidiInputStub(){ /* intentionally empty for now: a MIDI note-on would call the same onKey with pitch class ((note % 12) + 12) % 12 */ }

  // ---------- Staff rendering (VexFlow 5) ----------
  var STAFF_W = 340;
  var STAFF_COLOR = { good: "#1f8a4c", bad: "#d23a31" };
    var SVGNS = "http://www.w3.org/2000/svg";
  function noteClef(lv, q){ return lv.criteria.staffStyle === "grand" ? grandClefFor(q.pos) : q.clef; }
  // o = { clef, style: "single"|"grand", pos: {letter, octave}, acc: ""|"#"|"b", color: null|"good"|"bad" }
  // The accidental sits right beside the note: the stave's note start is moved so the note AND its sign are centred together.
  function drawStaff(container, o){
    container.innerHTML = "";
    var grand = o.style === "grand";
    var renderer = new VexFlow.Renderer(container, VexFlow.Renderer.Backends.SVG);
    renderer.resize(STAFF_W, grand ? 270 : 170);
    var ctx = renderer.getContext();
    var staves = [];
    if (!grand) {
      var s1 = new VexFlow.Stave(10, 50, 300); s1.addClef(o.clef); staves.push({ s: s1, clef: o.clef });
    } else {
      var t = new VexFlow.Stave(10, 30, 300); t.addClef("treble");
      var b = new VexFlow.Stave(10, 115, 300); b.addClef("bass");
      staves.push({ s: t, clef: "treble" }, { s: b, clef: "bass" });
    }
    var nclef = grand ? grandClefFor(o.pos) : o.clef;
    var target = staves.filter(function(x){ return x.clef === nclef; })[0];
    staves.forEach(function(x){ x.s.setContext(ctx).draw(); });
    if (grand) {
      try {
        var ct = VexFlow.StaveConnector.type || {};
        new VexFlow.StaveConnector(staves[0].s, staves[1].s).setType(ct.BRACE || "brace").setContext(ctx).draw();
        new VexFlow.StaveConnector(staves[0].s, staves[1].s).setType(ct.SINGLE_LEFT || "singleLeft").setContext(ctx).draw();
      } catch(e){ /* the brace is cosmetic */ }
    }
    var st = target.s;
    var note = new VexFlow.StaveNote({ clef: nclef, keys: [o.pos.letter.toLowerCase() + "/" + o.pos.octave], duration: "w" });
    var accMod = null;
    if (o.acc) { accMod = new VexFlow.Accidental(o.acc); note.addModifier(accMod, 0); }
    if (o.color && STAFF_COLOR[o.color]) {
      var sty = { fillStyle: STAFF_COLOR[o.color], strokeStyle: STAFF_COLOR[o.color] };
      try { note.setStyle(sty); if (accMod) accMod.setStyle(sty); } catch(e){ /* colour is cosmetic */ }
    }
    var voice = new VexFlow.Voice({ numBeats: 4, beatValue: 4 });
    voice.addTickables([note]);
    var room = st.getNoteEndX() - st.getNoteStartX();
    st.setNoteStartX(st.getNoteStartX() + room / 2 - (o.acc ? 34 : 20));
    new VexFlow.Formatter().joinVoices([voice]).formatToStave([voice], st);
    voice.draw(ctx, st);
    var svg = container.querySelector("svg");
    if (svg) {
      // letters on the lines and spaces (shown only when that helper is on)
      staves.forEach(function(x){
        var bottom = x.s.getYForLine(4), anchor = LETTERS.indexOf(CLEF_INFO[x.clef].anchor);
        for (var p = 0; p <= 8; p++) {
          var tx = document.createElementNS(SVGNS, "text");
          tx.setAttribute("class", "stf-letter"); tx.setAttribute("x", p % 2 === 0 ? "315" : "329"); tx.setAttribute("y", String(bottom - p * 5 + 3.5)); tx.setAttribute("text-anchor", "middle");
          tx.textContent = LETTERS[(anchor + p) % 7];
          svg.appendChild(tx);
        }
      });
      var ext = o.ext || 0;
      svg.setAttribute("viewBox", grand ? "-18 " + (40 - ext) + " 358 " + (190 + 2 * ext) : "0 52 340 116");
      svg.removeAttribute("width"); svg.removeAttribute("height"); svg.style.cssText = "";
    }
  }

  // ---------- Staff answer widget (arrows + sign buttons + Submit) ----------
  var staffAnswer = null;   // the live widget of the real game (the hub preview's widget is never stored here)
  function answerPositionsQ(lv, q){ return lv.criteria.staffStyle === "grand" ? answerPositions(lv) : lvPositions(lv, q.clef); }
  function renderStaffAnswerWidget(container, q, lv, onSubmit, idPrefix){
    var positions = answerPositionsQ(lv, q), grand = lv.criteria.staffStyle === "grand";
    var startKey = grand ? "C4" : MIDDLE_LINE[q.clef];
    var mid = positions.map(function(p){ return p.letter + p.octave; }).indexOf(startKey);
    var startAcc = ["", "#", "b"].filter(function(a){ return accEnabled(lv, a); })[0] || "";
    var sa = { ext: rangeExt(lv), positions: positions, idx: mid < 0 ? Math.floor(positions.length / 2) : mid, acc: startAcc, clef: q.clef, style: lv.criteria.staffStyle, color: null };
    var accButtons = [["b", "♭"], ["", "♮"], ["#", "♯"]].filter(function(a){ return accVisible(lv, a[0]); }).map(function(a){
      return '<button type="button" data-acc="' + a[0] + '"' + (accEnabled(lv, a[0]) ? "" : " disabled") + (a[0] === startAcc ? ' class="active"' : "") + '>' + a[1] + '</button>';
    }).join("");
    var hostId = (idPrefix || "") + "staffAnswerStaff";
    container.innerHTML =
      '<div class="staff-answer-card" id="' + (idPrefix || "") + 'staffCard"><div class="staff-host" id="' + hostId + '"></div></div>' +
      '<div class="staff-controls">' +
        '<button type="button" class="staff-arrow-btn" data-staff="down" title="Lower (Down arrow)">▼</button>' +
        '<button type="button" class="staff-arrow-btn" data-staff="up" title="Raise (Up arrow)">▲</button>' +
        (accButtons ? '<div class="acc-toggle">' + accButtons + '</div>' : "") +
        '<button type="button" class="staff-submit-btn" data-staff="submit" title="Enter">Submit</button>' +
      '</div>';
    var host = document.getElementById(hostId), card = document.getElementById((idPrefix || "") + "staffCard");
    function redraw(){ drawStaff(host, { clef: sa.clef, style: sa.style, pos: sa.positions[sa.idx], acc: sa.acc, color: sa.color, ext: sa.ext }); }
    function touched(){ sa.color = null; card.classList.remove("good", "bad"); }
    redraw();
    container.querySelector('[data-staff="up"]').addEventListener("click", function(){ touched(); sa.idx = Math.min(sa.positions.length - 1, sa.idx + 1); redraw(); });
    container.querySelector('[data-staff="down"]').addEventListener("click", function(){ touched(); sa.idx = Math.max(0, sa.idx - 1); redraw(); });
    container.querySelectorAll("[data-acc]").forEach(function(btn){
      btn.addEventListener("click", function(){
        if (btn.disabled) return;
        touched();
        sa.acc = btn.getAttribute("data-acc");
        container.querySelectorAll("[data-acc]").forEach(function(b){ b.classList.toggle("active", b === btn); });
        redraw();
      });
    });
    sa.submit = function(){ onSubmit(sa.positions[sa.idx].letter + sa.acc); };
    container.querySelector('[data-staff="submit"]').addEventListener("click", sa.submit);
    sa.redraw = redraw; sa.touched = touched; sa.card = card;
    return sa;
  }
  document.addEventListener("keydown", function(ev){
    if (!currentSession || currentSession.demo) return;
    var tag = (ev.target && ev.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (currentSession.phase === "walk" && (ev.key === "Enter" || ev.key === " ")) {
      var b = document.querySelector('[data-action="coach-next"]'); if (b) { ev.preventDefault(); b.click(); }
      return;
    }
    if (!staffAnswer || currentSession.phase !== "answer" || currentSession.type.answer !== "staff") return;
    if (ev.key === "ArrowUp") { ev.preventDefault(); staffAnswer.touched(); staffAnswer.idx = Math.min(staffAnswer.positions.length - 1, staffAnswer.idx + 1); staffAnswer.redraw(); }
    else if (ev.key === "ArrowDown") { ev.preventDefault(); staffAnswer.touched(); staffAnswer.idx = Math.max(0, staffAnswer.idx - 1); staffAnswer.redraw(); }
    else if (ev.key === "Enter") { ev.preventDefault(); staffAnswer.submit(); }
  });

  // ---------- Questions and the two sides of a question ----------
  function makeQuestion(mt, lv, pool, prevName){
    var name = pick(pool);
    if (pool.length > 1 && prevName) { while (name === prevName) name = pick(pool); }
    var c = lv.criteria, clef = c.clef === "both" ? pick(["treble", "bass"]) : c.clef;
    var cand = c.staffStyle === "grand" ? answerPositions(lv) : lvPositions(lv, clef);
    var spots = cand.filter(function(p){ return p.letter === name.charAt(0); });
    if (!spots.length) spots = cand;
    return { name: name, clef: clef, pos: pick(spots), pk: usesKey(mt) ? choosePianoWindow(noteSemitoneClass(name)) : null };
  }
  function renderPromptDomain(mt, container, q, lv, idPrefix){
    var id = (idPrefix || "") + "promptStaff";
    if (mt.prompt === "staff") {
      container.innerHTML = '<div class="staff-host" id="' + id + '"></div>';
      drawStaff(document.getElementById(id), { clef: q.clef, style: lv.criteria.staffStyle, pos: q.pos, acc: accOf(q.name), color: null, ext: rangeExt(lv) });
    } else if (mt.prompt === "name") {
      container.innerHTML = '<div class="prompt-name-big">' + escapeHtml(pretty(q.name)) + '</div>';
    } else {
      renderPiano(container, { j0: q.pk.j0, target: q.pk.key, interactive: false });
    }
  }
  function renderAnswerDomain(mt, container, q, lv, onAnswer, idPrefix){
    if (mt.answer === "name") {
      container.innerHTML = '<div class="name-rows">' + ROWS.filter(function(r){ return r[1].some(function(n){ return !nameHidden(lv, n); }); }).map(function(r){
        return '<div class="name-row">' + r[1].map(function(n){
          if (nameHidden(lv, n)) return '<span class="name-btn ghost" aria-hidden="true"></span>';
          var grey = nameGreyed(lv, n);
          return '<button type="button" class="name-btn r-' + r[0] + (grey ? " grey" : "") + '" data-answer-name="' + n + '"' + (grey ? " disabled" : "") + '>' + escapeHtml(pretty(n)) + '</button>';
        }).join("") + '</div>';
      }).join("") + '</div>';
      container.querySelectorAll("button.name-btn:not(.grey)").forEach(function(btn){
        btn.addEventListener("click", function(){ onAnswer(btn.getAttribute("data-answer-name"), btn); });
      });
      return null;
    }
    if (mt.answer === "key") {
      renderPiano(container, { j0: q.pk.j0, target: null, interactive: true, onKey: function(pc, el){ onAnswer(pc, el); }, enabledFn: function(cls){ return pianoEnabled(lv, cls); } });
      return null;
    }
    return renderStaffAnswerWidget(container, q, lv, function(selected){ onAnswer(selected, null); }, idPrefix);
  }
  function isAnswerCorrect(mt, lv, q, selected){
    if (mt.answer === "key") return selected === noteSemitoneClass(q.name);
    if (mt.prompt === "key" && mt.answer === "staff") return keyStaffNames(lv, noteSemitoneClass(q.name)).indexOf(selected) !== -1;
    if (mt.prompt === "key" && mt.answer === "name") return acceptedKeyNames(lv, noteSemitoneClass(q.name)).indexOf(selected) !== -1;
    return selected === q.name;
  }
  function needsBothNames(mt, lv, q){ return mt.prompt === "key" && mt.answer === "name" && lv.criteria.accidentals === "both" && isBlackPc(noteSemitoneClass(q.name)); }

  function lockAnswers(){
    var area = document.getElementById("answerArea"); if (!area) return;
    area.querySelectorAll(".name-btn").forEach(function(b){ b.classList.add("locked"); if (!b.classList.contains("wrong-dim") && !b.classList.contains("right") && !b.classList.contains("grey") && !b.classList.contains("picked")) b.classList.add("dim"); });
    area.querySelectorAll(".piano-key").forEach(function(k){ k.classList.add("locked"); });
    var ctl = area.querySelector(".staff-controls"); if (ctl) ctl.classList.add("locked");
  }
  function unlockAnswers(){
    var area = document.getElementById("answerArea"); if (!area) return;
    area.querySelectorAll(".name-btn").forEach(function(b){ b.classList.remove("locked", "dim"); });
    area.querySelectorAll(".piano-key").forEach(function(k){ k.classList.remove("locked"); });
    var ctl = area.querySelector(".staff-controls"); if (ctl) ctl.classList.remove("locked");
  }
  // Shows the right answer in `area` (the game's answer panel, or the preview's).
  function revealAnswer(area, mt, q, lv, sa, simulate){
    if (!area) return;
    if (mt.answer === "name") {
      var pc = noteSemitoneClass(q.name);
      area.querySelectorAll("[data-answer-name]").forEach(function(b){
        var n = b.getAttribute("data-answer-name");
        var ok = mt.prompt === "key" ? acceptedKeyNames(lv, pc).indexOf(n) !== -1 : n === q.name;
        if (ok) { b.classList.remove("dim", "wrong", "picked"); b.classList.add("right"); }
      });
    } else if (mt.answer === "key") {
      var k = q.pk && area.querySelector('.piano-key[data-k="' + q.pk.key + '"]');
      if (k) { k.classList.remove("wrong"); k.classList.add("right"); }
    } else if (mt.answer === "staff" && sa) {
      var want = sa.positions.map(function(p){ return p.letter + p.octave; }).indexOf(q.pos.letter + q.pos.octave);
      if (want >= 0) sa.idx = want;
      sa.acc = accOf(q.name); sa.color = "good";
      area.querySelectorAll("[data-acc]").forEach(function(b){ b.classList.toggle("active", b.getAttribute("data-acc") === sa.acc); });
      if (sa.card) { sa.card.classList.remove("bad"); sa.card.classList.add("good"); }
      sa.redraw();
    }
  }

  // ---------- Step-by-step explanation (the guided walk at the start of Learn) ----------
  function lidx(letter, oct){ return oct * 7 + LETTERS.indexOf(letter); }
  function seqLetters(fromLetter, count, up){
    var out = [], i0 = LETTERS.indexOf(fromLetter);
    for (var i = 0; i <= count; i++) out.push(LETTERS[(((up ? i0 + i : i0 - i) % 7) + 7) % 7]);
    return out;
  }
  function placeText(p){
    if (p >= 0 && p <= 8) return p % 2 === 0 ? "on line " + (p / 2 + 1) : "in space " + ((p + 1) / 2);
    if (p < 0) { if (p === -1) return "in the space just below the staff"; return p % 2 === 0 ? "on ledger line " + (-p / 2) + " below the staff" : "in the space below ledger line " + ((-p - 1) / 2); }
    var u = p - 8;
    if (u === 1) return "in the space just above the staff";
    return u % 2 === 0 ? "on ledger line " + (u / 2) + " above the staff" : "in the space above ledger line " + ((u - 1) / 2);
  }
  function explain(mt, q, lv){
    var steps = [], name = q.name, letter = name.charAt(0), acc = accOf(name), pc = noteSemitoneClass(name);
    if (mt.prompt === "staff") {
      var nc = noteClef(lv, q), info = CLEF_INFO[nc], p = lidx(q.pos.letter, q.pos.octave) - lidx(info.anchor, info.octave);
      steps.push({ t: "Name the clef", x: info.word + " clef. Its bottom line is " + info.anchor + ". Lines: " + info.lines + ". Spaces: " + info.spaces + "." });
      steps.push({ t: "Find where it sits", x: "The note is " + placeText(p) + " (lines and spaces are counted up from the bottom line)." });
      steps.push({ t: "Count the letters", x: "From " + info.anchor + (p >= 0 ? " going up: " : " going down: ") + seqLetters(info.anchor, Math.abs(p), p >= 0).join(" ") + ". The note is " + letter + "." });
      if (acc) steps.push({ t: "Check the sign", x: "A " + (acc === "#" ? "sharp (♯) raises" : "flat (♭) lowers") + " the note, so it is " + pretty(name) + "." });
    } else if (mt.prompt === "name") {
      steps.push({ t: "Read the name", x: "The note is " + pretty(name) + "." });
    } else {
      var w = PC_WHITE[pc];
      steps.push({ t: "Find the black-key groups", x: "Look for a group of 2 black keys. The white key just left of it is C." });
      if (w) steps.push({ t: "Count from C", x: "Counting white keys from C: " + seqLetters("C", LETTERS.indexOf(w), true).join(" ") + ". This key is " + w + "." });
      else steps.push({ t: "It is a black key", x: "It sits between " + PC_WHITE[(pc + 11) % 12] + " and " + PC_WHITE[(pc + 1) % 12] + ": " + PC_WHITE[(pc + 11) % 12] + "♯ and " + PC_WHITE[(pc + 1) % 12] + "♭ are two names for it." });
    }
    if (mt.answer === "name") {
      steps.push({ t: "Press the name", x: needsBothNames(mt, lv, q) ? "Press both names of the key." : "Press " + pretty(name) + ".", answer: true });
    } else if (mt.answer === "key") {
      steps.push({ t: "Find the white key", x: "Find the 2-black-key group; C is just left of it. Count up to " + letter + ": " + seqLetters("C", LETTERS.indexOf(letter), true).join(" ") + "." });
      if (acc) steps.push({ t: "Use the sign", x: acc === "#" ? "A sharp (♯) is the very next key to the right." : "A flat (♭) is the very next key to the left." });
      steps.push({ t: "Click the key", x: "Click that key.", answer: true });
    } else {
      var ai = CLEF_INFO[q.clef];
      steps.push({ t: "Move the note", x: "Use the arrows to put the note on a " + letter + ". The bottom line is " + (lv.criteria.staffStyle === "grand" ? "E (treble) or G (bass)" : ai.anchor) + "; count up from there." });
      if (acc) steps.push({ t: "Choose the sign", x: "Press " + (acc === "#" ? "♯" : "♭") + "." });
      steps.push({ t: "Submit", x: "Press Submit.", answer: true });
    }
    return steps;
  }

  // ---------- Helpers: interactive aids, chosen per game ----------
  var STAGE_LABEL = ["None", "A little", "Some", "Full"];
  function learnState(s){
    if (s.demo) return s.demoLearn;
    var k = s.type.id + ":" + s.level.id;
    if (!config.learn[k]) config.learn[k] = { stage: 3, run: 0 };
    return config.learn[k];
  }
  function activeFor(s){
    var offered = offeredHelpers(s.type).map(function(h){ return h.id; });
    if (s.mode === "learn") { var keep = Math.round(offered.length * learnState(s).stage / 3); return offered.slice(offered.length - keep); }
    return [];
  }
  function hasHelper(s, id){ return s.active.indexOf(id) !== -1; }
  // the target of the count-up helper: how many steps from the bottom line, and in which direction
  function countInfo(s){
    var q = s.q, lv = s.level;
    var nc = s.type.prompt === "staff" ? noteClef(lv, q) : (lv.criteria.clef === "both" || lv.criteria.staffStyle === "grand" ? "treble" : lv.criteria.clef);
    var info = CLEF_INFO[nc], letter = q.name.charAt(0), p;
    if (s.type.prompt === "staff") p = lidx(q.pos.letter, q.pos.octave) - lidx(info.anchor, info.octave);
    else p = (LETTERS.indexOf(letter) - LETTERS.indexOf(info.anchor) + 7) % 7;
    return { info: info, p: p, letter: letter };
  }
  function fillRaw(txt, s){ return String(txt || "").replace(/\{name\}/g, pretty(s.q.name)).replace(/\{letter\}/g, s.q.name.charAt(0)); }
  function fillText(txt, s){ return escapeHtml(fillRaw(txt, s)); }
  function hx(s, id){ return s.mode === "practice" ? '<button type="button" class="hx" data-action="toggle-helper" data-id="' + id + '" title="Hide this helper" aria-label="Hide this helper">×</button>' : ""; }
  // one active helper, drawn as a card (or a chip for the overlay kinds)
  function helperCardHtml(s, h){
    var id = h.id, x = hx(s, id), ic = '<i class="ti ' + h.icon + '" aria-hidden="true"></i>';
    if (id === "lineSpace") {
      if (s.type.prompt !== "staff") return "";
      var p0 = countInfo(s).p, isLine = Math.abs(p0) % 2 === 0, r = s.h.ls;
      return '<div class="hcard"><b>Line or space?</b> <button type="button" class="hbtn' + (r === "line" ? (isLine ? " ok" : " no") : "") + '" data-action="ls-pick" data-v="line">Line</button><button type="button" class="hbtn' + (r === "space" ? (!isLine ? " ok" : " no") : "") + '" data-action="ls-pick" data-v="space">Space</button>' +
        (r ? '<span class="hres">' + ((r === "line") === isLine ? "Yes!" : "Look again") + '</span>' : "") + x + '</div>';
    }
    if (id === "countUp") {
      var ci = countInfo(s), steps = Math.abs(ci.p), n = Math.min(s.h.count || 0, steps), up = ci.p >= 0, letters = seqLetters(ci.info.anchor, n, up);
      return '<div class="hcard"><b>Count ' + (up ? "up" : "down") + ' from ' + ci.info.anchor + '</b> ' + letters.map(function(l, i){ return '<span class="hl' + (i === letters.length - 1 ? " now" : "") + '">' + l + '</span>'; }).join("") +
        (n < steps ? '<button type="button" class="hbtn" data-action="count-step">' + (up ? "Up ▲" : "Down ▼") + '</button>' : '<span class="hres">' + (s.type.prompt === "staff" ? "It is " + ci.letter + "." : "Put the note on " + ci.letter + ".") + '</span>') + x + '</div>';
    }
    if (id === "alphabet") return '<div class="hcard alpha"><b>Alphabet</b> ' + "A B C D E F G A B C D E F G".split(" ").map(function(l){ return '<span class="hl">' + l + '</span>'; }).join("") + x + '</div>';
    if (h.kind === "overlay") return '<span class="hchip">' + ic + ' ' + escapeHtml(h.short || h.label) + x + '</span>';
    if (h.kind === "text") {
      var body = h.style === "steps" ? fillRaw(h.text, s).split("|").map(function(t, i){ return '<span class="stp"><i>' + (i + 1) + '</i>' + escapeHtml(t.trim()) + '</span>'; }).join("") : fillText(h.text, s);
      return '<div class="hcard txt st-' + escapeHtml(h.style || "plain") + '">' + ic + ' ' + body + x + '</div>';
    }
    if (h.kind === "reveal") {
      return '<div class="hcard">' + (s.h["rv" + id] ? ic + ' <span class="hres">' + fillText(h.text, s) + '</span>' :
        '<button type="button" class="hbtn" data-action="reveal" data-id="' + id + '">' + ic + ' ' + fillText(h.ask || h.short, s) + '</button>') + x + '</div>';
    }
    if (h.kind === "question") {
      var opts = s.h["qo" + id];
      if (!opts) { opts = [h.right].concat(String(h.wrong || "").split(",").map(function(t){ return t.trim(); }).filter(Boolean)).filter(Boolean); opts.sort(function(){ return Math.random() - 0.5; }); s.h["qo" + id] = opts; }
      var ans = s.h["qa" + id];
      return '<div class="hcard"><b>' + fillText(h.ask, s) + '</b> ' + opts.map(function(o){ return '<button type="button" class="hbtn' + (ans === o ? (o === h.right ? " ok" : " no") : "") + '" data-action="hq-pick" data-id="' + id + '" data-v="' + escapeHtml(o) + '">' + fillText(o, s) + '</button>'; }).join("") +
        (ans !== undefined ? '<span class="hres">' + (ans === h.right ? (h.text ? fillText(h.text, s) : "Yes!") : "Look again") + '</span>' : "") + x + '</div>';
    }
    return "";
  }
  // Learn's walk, or the helper row. Practice: a Help button opens the row of helpers (choose which ones you want); Test: nothing.
  function helpersHtml(s){
    if (s.mode === "test") return "";
    if (s.phase === "walk") {
      var isLast = s.stepIdx >= s.steps.length - 1, st = s.steps[s.stepIdx];
      return '<div class="coach"><div class="coach-dots">' + s.steps.map(function(_, i){ return '<span class="cd' + (i < s.stepIdx ? " done" : i === s.stepIdx ? " now" : "") + '">' + (i + 1 + (s.lesson ? s.stepNum0 || 0 : 0)) + '</span>'; }).join("") + '</div>' +
        '<div class="coach-now"><b>' + escapeHtml(st.t) + '.</b> <span class="tx">' + escapeHtml(st.x) + '</span></div>' +
        '<button type="button" class="coach-btn' + (isLast ? " go" : "") + '" data-action="coach-next">' + (isLast ? (s.lesson && (!lessonHasAsk(s) || s.walkTrig) ? "Continue ▶" : "Now you try ▶") : "Next ▶") + '</button></div>';
    }
    var items = [];
    if (s.mode === "practice" && s.menuOpen) {
      offeredHelpers(s.type).forEach(function(h){
        items.push(hasHelper(s, h.id) ? helperCardHtml(s, h) : '<button type="button" class="hchipbtn" data-action="toggle-helper" data-id="' + h.id + '"><i class="ti ' + h.icon + '" aria-hidden="true"></i> ' + escapeHtml(h.short || h.label) + '</button>');
      });
    } else {
      s.active.forEach(function(id){ var h = helperById(id); if (h) items.push(helperCardHtml(s, h)); });
      if (s.lesson && s.lesson.helperText) items.unshift('<div class="hcard txt st-callout">' + escapeHtml(s.lesson.helperText) + '</div>');
    }
    return items.length ? '<div class="hcards">' + items.join("") + '</div>' : "";
  }
  // Practice: the Help button sits at the left of the feedback row, so the helper row only exists while a helper or the menu is showing
  function helpBtnHtml(s){
    if (s.mode !== "practice" || s.phase === "walk") return "";
    return '<button type="button" class="helpbtn' + (s.menuOpen ? " on" : "") + '" data-action="help-menu"><i class="ti ti-lifebuoy" aria-hidden="true"></i> Help' + (s.menuOpen ? " ▴" : "") + '</button>' +
      '<span class="helpbtn-r">' + (s.h && s.h.hint ? "" : '<button type="button" class="helpbtn" data-action="hint"><i class="ti ti-bulb" aria-hidden="true"></i> Hint</button>') +
      '<button type="button" class="helpbtn walkbtn" data-action="walk-me"><i class="ti ti-route" aria-hidden="true"></i> Walk me through it</button></span>';
  }
  // the helper row takes only the height it needs: none (h0), one line (h1) or two (h2)
  function fitHelperRow(){
    var root = $g("gameRoot"), host = $g("helperArea"); if (!root || !host) return;
    root.classList.remove("h0", "h1", "h2");
    if (!host.firstElementChild) { root.classList.add("h0"); return; }
    if (host.querySelector(".coach")) { root.classList.add("h2"); return; }
    root.classList.add("h2");   // measure at the tall size
    var hc = host.querySelector(".hcards"), need = 0;
    if (hc) [].forEach.call(hc.children, function(c){ need = Math.max(need, c.offsetTop + c.offsetHeight); });
    if (!hc || !hc.children.length) { root.classList.remove("h2"); root.classList.add("h0"); return; }
    if (need <= 40) { root.classList.remove("h2"); root.classList.add("h1"); }
  }
  function renderHelpers(){
    var s = currentSession; if (!s) return;
    var host = document.getElementById("helperArea"), root = document.getElementById("gameRoot");
    if (host) host.innerHTML = helpersHtml(s);
    if (root) root.classList.toggle("pk", s.type.prompt === "key");   // piano-key questions: the answer buttons give up height, not the keys
    var hb = document.getElementById("helpBtnHost"); if (hb) hb.innerHTML = helpBtnHtml(s);
    fitHelperRow();
    if (root) {
      root.classList.toggle("h-letters", hasHelper(s, "staffLetters") && s.mode !== "test");
      root.classList.toggle("h-keynames", hasHelper(s, "keyNames") && s.mode !== "test");
      root.classList.toggle("h-findc", hasHelper(s, "findC") && s.mode !== "test");
    }
    var aa = document.getElementById("answerArea"); if (aa) aa.classList.toggle("gated", s.phase === "walk");
  }
  // ---------- Session ----------
  function $g(id){ return document.getElementById(id); }
  // Builds a session (no drawing). opts: { student, mode, demo }.
  function beginSession(typeId, levelId, opts){
    opts = opts || {};
    var type = moduleTypeById(typeId);
    var level = (levels[typeId] || []).filter(function(l){ return l.id === levelId; })[0];
    if (!type || !level || !dataReady) return false;
    var pool = poolFor(level).filter(function(n){ return answerable(level, type, n); });
    hubNote = "";
    if (!pool.length) { hubNote = "This level has no notes that can be asked and answered — edit it first."; return false; }
    var student = opts.student || null;
    currentSession = { type: type, level: level, pool: pool, demo: !!opts.demo, mode: student ? "test" : (opts.mode || "practice"), q: null, phase: "answer", qid: 0,
      correct: 0, attempts: 0, misses: 0, streak: 0, best: 0, timer: null, goal: type.testGoal, strikes: type.strikes, student: student,
      scoreKind: student ? "student" : currentScoring(), active: [], h: {}, picked: [], firstTry: true, menuOpen: false, steps: [], stepIdx: 0, faded: false,
      justLost: null, demoLearn: { stage: 3, run: 0 }, plan: null, logged: false, ms: 0, lastT: Date.now() };
    if (opts.studentPractice) { currentSession.studentPractice = true; currentSession.goal = 1e9; currentSession.strikes = 1e9; }   // STUDENT practice: like a test, but no lives and no automatic pass
    nextQuestion();
    return true;
  }
  function startPractice(typeId, levelId, opts){
    if (!dataReady) return;
    dropSession();
    fontsPromise.then(function(){
      view = "hub"; hubTypeId = typeId; hubLevelId = levelId;
      if (beginSession(typeId, levelId, opts || {})) attachLesson(currentSession);
      renderApp();
    });
  }
  function endPractice(){ lessonEd = null; dropSession(); maximized = false; document.body.classList.remove("maxed"); renderApp(); }
  function touchTime(s){ var n = Date.now(); s.ms += Math.min(n - s.lastT, 45000); s.lastT = n; }
  function logSession(s, result){
    if (!s || s.demo || s.logged || !s.attempts) return;
    s.logged = true; touchTime(s);
    var sec = Math.max(1, Math.round(s.ms / 1000)), d = new Date();
    addHistory({ t: Date.now(), title: levelTitle(s.type, s.level), mode: s.studentPractice ? "practice" : s.mode, correct: s.correct, total: s.attempts, sec: sec, result: result, counted: s.scoreKind !== "test", student: s.student && s.student.name ? s.student.name : "" });
    // for Progress: how long, and how it went (Learn minutes per day, review history). Nothing listens yet.
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "note-id-session", app: APP_NAME, studentId: s.student ? s.student.id : null, studentName: s.student ? s.student.name : "", typeId: s.type.id, levelId: s.level.id,
        assignmentId: (s.level.link && s.level.link.assignmentId) || null, mode: s.mode, seconds: sec, correct: s.correct, total: s.attempts, result: result,
        date: d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2), scoreKind: s.scoreKind }, parentOrigin);
    }
    if (scoreOverride) { scoreOverride = null; postScoreMode(); renderScoreChip(); }   // the teacher override only lasts for one game
  }

  function nextQuestion(){
    var s = currentSession;
    s.q = makeQuestion(s.type, s.level, s.pool, s.q && s.q.name);
    s.qid++; s.plan = null;
    try { window.dispatchEvent(new CustomEvent("ss-question", { detail: { title: levelTitle(s.type, s.level), mode: s.studentPractice ? "practice" : s.mode, demo: !!(s.demo || s.lesson) } })); } catch (e) {}
    s.phase = "answer"; s.h = {}; s.picked = []; s.firstTry = true; s.menuOpen = false; s.stepIdx = 0; s.steps = [];
    s.active = activeFor(s);
    if (s.mode === "learn" && learnState(s).stage === 3) {   // the first stage is a guided walk before the student may answer
      s.steps = explain(s.type, s.q, s.level).filter(function(x){ return !x.answer; });
      if (s.steps.length) s.phase = "walk";
    }
  }
  function recordAttempt(s, ok){
    if (!s.demo && !s.lesson) { try { window.dispatchEvent(new CustomEvent("ss-attempt", { detail: { title: levelTitle(s.type, s.level), mode: s.studentPractice ? "practice" : s.mode, ok: !!ok } })); } catch (e) {} }
    if (s.studentPractice) { window.ssAttempts.push(s.student && (s.student.id || s.student.name), s.type.id + ":" + s.level.id, ok); return; }
    if (s.demo || s.lesson || s.scoreKind === "student") return;
    var bucket = scoreBucket(s.scoreKind), key = s.type.id + ":" + s.level.id;
    if (!bucket[key]) bucket[key] = { correct: 0, total: 0 };
    bucket[key].total++;
    if (ok) bucket[key].correct++;
    if (s.scoreKind === "real") saveClassScores(); else saveTestScores();
  }
  function learnAdjust(s, ok){
    if (s.demo || s.lesson) return;
    var st = learnState(s);
    if (ok) { st.run++; if (st.run >= s.type.learnStreak && st.stage > 0) { st.stage--; st.run = 0; s.faded = true; } }
    else { st.run = 0; st.stage = Math.min(3, st.stage + 1); }
    saveConfig(true);
  }

  function hudStatsHtml(s){
    if (s.studentPractice) {   // STUDENT practice: round score, all-time and last-10 accuracy for this level
      var ss = window.ssAttempts.stats(s.student && (s.student.id || s.student.name), s.type.id + ":" + s.level.id), up = ss.n10 >= 10 && ss.pct10 > ss.pctAll ? " \u25b2" : "";
      return '<div class="hud-stat"><b>' + s.correct + '/' + s.attempts + '</b><span>This round</span></div>' +
        '<div class="hud-stat" title="All the questions you have answered on this level"><b>' + (ss.nAll ? ss.pctAll + '%' : '-') + '</b><span>All time (' + ss.nAll + ')</span></div>' +
        '<div class="hud-stat" title="Your last 10 questions on this level"><b>' + (ss.n10 ? ss.pct10 + '%' + up : '-') + '</b><span>Last 10</span></div>';
    }
    if (s.mode === "test") {
      var hearts = "";
      for (var i = 0; i < s.strikes; i++) {
        var alive = i < s.strikes - s.misses;
        hearts += alive ? '<span class="heart"><i class="hh">♥</i></span>'
          : '<span class="heart lost"><i class="hh">♡</i>' + (s.justLost === i ? '<i class="fall">♥</i>' : "") + '</span>';
      }
      s.justLost = null;
      return '<div class="hud-stat"><b>' + s.correct + '</b><span>Correct</span></div>' +
        '<div class="hud-stat"><b>' + s.goal + '</b><span>Goal</span></div>' +
        '<div class="hud-stat hearts" title="Lives left"><span class="hearts-row">' + hearts + '</span></div>';
    }
    var pct = s.attempts ? Math.round(100 * s.correct / s.attempts) : 0;
    return '<div class="hud-stat"><b>' + s.correct + '/' + s.attempts + '</b><span>Score</span></div>' +
      '<div class="hud-stat"><b>' + pct + '%</b><span>Correct</span></div>' +
      '<div class="hud-stat"><b>' + s.streak + '</b><span>Streak</span></div>';
  }
  function modeChipText(s){
    var m = modeById(s.studentPractice ? "practice" : s.mode);
    return '<i class="ti ' + m.icon + '" aria-hidden="true"></i> ' + m.label + (s.mode === "learn" ? " · help: " + STAGE_LABEL[learnState(s).stage] : "");
  }
  function scoreKindText(s){
    return s.scoreKind === "student" ? "Saving to " + (s.student && s.student.name ? s.student.name : "the student") : (s.scoreKind === "real" ? "Class score" : "Practice score");
  }
  function updateHud(s){
    var a = $g("hudStats"), d = $g("hudMode");
    if (a) a.innerHTML = hudStatsHtml(s);
    if (d) d.innerHTML = modeChipText(s);
  }
  function setFeedback(kind, text){
    var row = $g("feedbackRow"); if (!row) return;
    if (!kind) { row.innerHTML = ""; return; }
    var ico = kind === "correct" ? "✓" : kind === "incorrect" ? "✕" : "";
    row.innerHTML = '<span class="fb-pill ' + kind + '">' + (ico ? '<span class="fb-ico">' + ico + '</span>' : "") + escapeHtml(text) + '</span>';
  }

  function postResult(s, passed){
    if (s.demo || !s.student || !window.parent || window.parent === window) return;
    var assignmentId = (s.level.link && s.level.link.assignmentId) || null;
    window.parent.postMessage({ type: "note-id-result", app: APP_NAME, studentId: s.student.id, studentName: s.student.name, typeId: s.type.id, levelId: s.level.id,
      assignmentId: assignmentId, correct: s.correct, total: s.attempts, passed: passed, assignmentScore: passed ? { correct: 1, total: 1 } : null }, parentOrigin);
  }
  function saveStudentResult(s, passed){
    if (s.demo || !s.student || s.studentPractice) return;
    var sid = String(s.student.id || s.student.name), key = s.type.id + ":" + s.level.id;
    var r = results[sid] || (results[sid] = {});
    var e = r[key] || (r[key] = { best: null, passed: false, last: null, updated: "" });
    e.last = { correct: s.correct, total: s.attempts, passed: passed };
    var better = !e.best || (passed && !e.passed) || (s.attempts && s.correct / s.attempts > (e.best.total ? e.best.correct / e.best.total : -1));
    if (better) e.best = { correct: s.correct, total: s.attempts };
    if (passed) e.passed = true;
    e.updated = new Date().toISOString();
    saveResults();
  }
  function resetRound(s){ s.correct = 0; s.attempts = 0; s.misses = 0; s.streak = 0; s.best = 0; s.logged = false; }

  function finishCorrectTimer(s, ms){
    s.timer = setTimeout(function(){ if (currentSession !== s) return; if (s.lesson) { lessonAnswered(s); return; } nextQuestion(); renderQuestion(); }, ms);
  }
  // The same question stays on screen; the wrong pick stays red and dimmed. Only the other answers wake up again.
  function retrySameQuestion(s, ms){
    s.timer = setTimeout(function(){
      if (currentSession !== s) return;
      s.phase = "answer"; unlockAnswers();
      setFeedback("neutral", s.mode === "test" ? "Try that one again" : "Try again");
    }, ms);
  }

  function handleAnswer(selected, el){
    var s = currentSession; if (!s || s.phase !== "answer") return;
    var mt = s.type, q = s.q, lv = s.level, promptArea = $g("promptArea");
    var correct = isAnswerCorrect(mt, lv, q, selected);
    var test = s.mode === "test"; touchTime(s);
    // black key as the question, "both names" wanted: the first right name turns blue, the other one finishes it
    if (correct && needsBothNames(mt, lv, q)) {
      if (s.picked.indexOf(selected) === -1) {
        var kinds = s.picked.map(accOf);
        if (kinds.indexOf(accOf(selected)) === -1) {
          s.picked.push(selected);
          if (el && el.classList) el.classList.add("picked");
          if (s.picked.length < 2) { setFeedback("neutral", "Yes! That key has another name — find it too"); return; }
        } else { return; }
      } else { return; }
    }
    if (correct) {
      s.phase = "between";
      if (test) { s.attempts++; s.correct++; s.streak++; recordAttempt(s, true); }
      else if (s.firstTry) { s.attempts++; s.correct++; s.streak++; recordAttempt(s, true); if (s.mode === "learn") learnAdjust(s, true); }
      if (s.streak > s.best) s.best = s.streak;
      if (el && el.classList) { el.classList.remove("wrong", "picked"); el.classList.add("right"); }
      if (mt.answer === "staff" && staffAnswer) { staffAnswer.color = "good"; staffAnswer.card.classList.remove("bad"); staffAnswer.card.classList.add("good"); staffAnswer.redraw(); }
      if (mt.answer === "key" && !(el && el.classList && el.classList.contains("piano-key"))) revealAnswer($g("answerArea"), mt, q, lv, staffAnswer);   // X97: a key the student clicked is the only key lit (the same note in another octave is not)
      if (needsBothNames(mt, lv, q)) revealAnswer($g("answerArea"), mt, q, lv, staffAnswer);
      promptArea.classList.remove("bad"); promptArea.classList.add("good");
      lockAnswers();
      setFeedback("correct", s.firstTry ? (s.streak >= 3 ? "Correct! " + s.streak + " in a row" : "Correct!") : "Got it!");
      updateHud(s); renderHelpers();
      if (test && s.correct >= s.goal) { finishRound(s, true); return; }
      finishCorrectTimer(s, 1000);
      return;
    }
    // wrong: the wrong answer stays on screen (red, dimmed, disabled) and nothing is redrawn
    s.phase = "between";
    if (test) { s.attempts++; s.misses++; s.streak = 0; s.justLost = s.strikes - s.misses; recordAttempt(s, false); }
    else if (s.firstTry) { s.attempts++; s.streak = 0; recordAttempt(s, false); if (s.mode === "learn") learnAdjust(s, false); }
    s.firstTry = false;
    if (el && el.classList) { el.classList.remove("right", "picked"); el.classList.add("wrong", "wrong-dim"); if (el.tagName === "BUTTON") el.disabled = true; }
    if (mt.answer === "staff" && staffAnswer) { staffAnswer.color = "bad"; staffAnswer.card.classList.remove("good"); staffAnswer.card.classList.add("bad"); staffAnswer.redraw(); }
    promptArea.classList.remove("good", "bad"); void promptArea.offsetWidth; promptArea.classList.add("bad");
    lockAnswers();
    if (test) {
      updateHud(s);
      if (s.misses >= s.strikes) { setFeedback("incorrect", "Out of lives"); finishRound(s, false); return; }
      setFeedback("incorrect", "Not quite — same question again");
      retrySameQuestion(s, 1300);
      return;
    }
    if (s.mode === "practice") {   // Practice: a helper joins after a miss
      var offered = offeredHelpers(mt).map(function(h){ return h.id; }).filter(function(id){ return !hasHelper(s, id); });
      if (offered.length) s.active.push(offered[offered.length - 1]);
    }
    setFeedback("incorrect", s.mode === "practice" ? "Not quite — here’s a little help, try again" : "Not quite — try again");
    updateHud(s); renderHelpers();
    retrySameQuestion(s, 1100);
  }

  function finishRound(s, passed){
    if (s.timer) clearTimeout(s.timer);
    saveStudentResult(s, passed);
    if (passed) postResult(s, true);
    logSession(s, passed ? "passed" : "lost");
    if (passed) updateHud(s);
    s.phase = passed ? "won" : "lost";
    var game = $g("gameRoot");
    s.timer = setTimeout(function(){
      if (currentSession !== s) return;
      if (game && game.parentNode) {
        if (passed) {
          game.insertAdjacentHTML("beforeend", '<div class="lost-overlay won"><div class="big">Passed!</div><div class="sub">' + s.correct + ' correct' + (s.student ? ' — ' + escapeHtml(s.student.name || "") + ': this lesson is complete.' : ' — nice work.') + '</div>' +
            '<div class="ov-btns"><button type="button" class="coach-btn" data-action="play-again">Play again</button><button type="button" class="coach-btn go" data-action="end-practice">Done</button></div></div>');
        } else {
          game.insertAdjacentHTML("beforeend", '<div class="lost-overlay"><div class="big">Round over</div><div class="sub">' + s.correct + ' correct — out of lives. Starting over…</div></div>');
          s.timer = setTimeout(function(){ if (currentSession !== s) return; resetRound(s); nextQuestion(); renderExerciseView(); }, 2000);
        }
      }
    }, 900);
  }

  // Draws the current question. Nothing new appears until the piano has finished rolling to its new place.
  function renderQuestion(){
    var s = currentSession; if (!s) return;
    var mt = s.type, lv = s.level, q = s.q, after = s.phase;
    var promptArea = $g("promptArea"), answerArea = $g("answerArea"), helperArea = $g("helperArea");
    if (!promptArea || !answerArea) return;
    var ph = usesKey(mt) ? (mt.prompt === "key" ? promptArea : answerArea) : null;
    var willRoll = !!(ph && ph.__pk && ph.contains(ph.__pk.el) && ph.__pk.j0 !== q.pk.j0);
    function draw(){
      if (currentSession !== s) return;
      s.phase = after;
      promptArea.classList.remove("good", "bad", "pending"); answerArea.classList.remove("pending"); if (helperArea) helperArea.classList.remove("pending");
      renderPromptDomain(mt, promptArea, q, lv, "");
      staffAnswer = renderAnswerDomain(mt, answerArea, q, lv, handleAnswer, "");
      if (s.picked.length) answerArea.querySelectorAll("[data-answer-name]").forEach(function(b){ if (s.picked.indexOf(b.getAttribute("data-answer-name")) !== -1) b.classList.add("picked"); });
      if (s.faded) { s.faded = false; setFeedback("neutral", "Nice — a little less help now"); }
      else if (s.phase === "walk") setFeedback("neutral", "Follow the steps, then answer");
      else setFeedback(null);
      updateHud(s);
      renderHelpers();
      if (s.lesson) lessonAfterDraw(s);
    }
    if (willRoll) {
      s.phase = "anim";
      promptArea.classList.remove("good", "bad");
      (ph === promptArea ? answerArea : promptArea).classList.add("pending");
      if (helperArea) helperArea.classList.add("pending");
      setFeedback(null);
      renderPiano(ph, { j0: q.pk.j0, target: null, interactive: false, enabledFn: mt.answer === "key" ? function(cls){ return pianoEnabled(lv, cls); } : null });
      s.timer = setTimeout(draw, 850);
    } else draw();
  }

  function renderExerciseView(){
    var host = $g("previewInner");
    var s = currentSession, mt = s.type, lvl = s.level;
    host.innerHTML =
      '<div class="game h0' + (s.demo ? " demo" : "") + '" id="gameRoot">' +
        '<div class="hud">' +
          (s.demo ? "" : '<button type="button" class="hud-btn" data-action="end-practice" title="Stop and go back"><i class="ti ti-player-stop" aria-hidden="true"></i> Stop</button>') +
          '<div class="hud-title">' + escapeHtml(levelTitle(mt, lvl)) + '</div>' +
          '<div class="hud-mode" id="hudMode">' + modeChipText(s) + '</div>' +
          (s.demo ? "" : '<div class="hud-chip ' + (s.scoreKind === "real" || s.scoreKind === "student" ? "real" : "") + '" id="hudScore">' + escapeHtml(scoreKindText(s)) + '</div>') +
          '<div class="spacer"></div><div class="hud-stats" id="hudStats"></div>' +
        '</div>' +
        '<div class="prompt-card" id="promptArea"></div>' +
        '<div class="fbwrap"><div class="feedback" id="feedbackRow"></div><div class="helpbtnhost" id="helpBtnHost"></div></div>' +
        '<div id="helperArea" class="helpers"></div>' +
        '<div class="answer-panel" id="answerArea"></div>' +
      '</div>';
    staffAnswer = null;
    if (s.lesson) lessonRender(s); else renderQuestion();
  }

  // ---------- The demo bot: a slightly human cursor that plays the preview ----------
  // (x, y) is the cursor TIP. Paths are curved, speed varies, the target is never the exact centre, a long move may overshoot a
  // little and settle, and after a click the cursor drifts off a bit. A slow sway keeps it alive between moves.
  var bot = { el: null, x: 80, y: 80, seq: 0, busy: false, anim: 0, moving: false };
  var CURSOR_SVG = '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 2l15 9.5-6.6 1.4 3.7 6.9-3 1.6-3.7-6.9L4.8 19z" fill="#fff" stroke="#1b1840" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  function botRender(x, y){ if (bot.el) bot.el.style.transform = "translate(" + (x - 5) + "px," + (y - 3) + "px)"; }
  function botStop(){
    bot.seq++; bot.anim++; bot.busy = false; bot.moving = false;
    if (bot.el && bot.el.parentNode) bot.el.parentNode.removeChild(bot.el);
    bot.el = null;
  }
  function botStart(s){
    botStop();
    var stage = $g("previewStage"); if (!stage) return;
    var el = document.createElement("div"); el.className = "bot-cursor"; el.innerHTML = CURSOR_SVG; stage.appendChild(el);
    bot.el = el; bot.x = stage.clientWidth * (0.7 + Math.random() * 0.2); bot.y = stage.clientHeight * (0.82 + Math.random() * 0.1);
    botRender(bot.x, bot.y);
    var my = bot.seq;
    (function sway(){
      if (my !== bot.seq || !bot.el) return;
      if (!bot.moving) { var t = performance.now(); botRender(bot.x + 2.4 * Math.sin(t / 830) + 1.2 * Math.sin(t / 311 + 1), bot.y + 2 * Math.sin(t / 970 + 2) + 1 * Math.sin(t / 407)); }
      requestAnimationFrame(sway);
    })();
    setTimeout(function(){ botTick(s, my); }, 700);
  }
  function botAlive(s, my){ return my === bot.seq && currentSession === s; }
  function botLater(s, my, ms, fn){ setTimeout(function(){ if (botAlive(s, my)) fn(); }, ms * (0.85 + Math.random() * 0.3)); }
  function botTick(s, my){
    if (!botAlive(s, my)) return;
    if (!bot.busy) {
      var act = botDecide(s, my);
      if (act) { bot.busy = true; act(function(){ bot.busy = false; }); }
    }
    setTimeout(function(){ botTick(s, my); }, 250);
  }
  function easeHuman(t){ var u = Math.pow(t, 0.9); return u * u * u * (u * (u * 6 - 15) + 10); }   // slow start, quick middle, soft landing
  function easeOut(t){ return 1 - Math.pow(1 - t, 3); }
  function bez(p, t, k){ var u = 1 - t; return u * u * u * p[0][k] + 3 * u * u * t * p[1][k] + 3 * u * t * t * p[2][k] + t * t * t * p[3][k]; }
  // glide along a cubic curve from the current spot to (tx, ty)
  function botGlide(s, my, tx, ty, ms, arc, ease, done){
    var id = ++bot.anim, x0 = bot.x, y0 = bot.y, dx = tx - x0, dy = ty - y0, d = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / d, ny = dx / d;
    var sgn = Math.random() < 0.5 ? -1 : 1, a1 = sgn * d * arc, a2 = -sgn * d * arc * 0.35;
    var p = [{ x: x0, y: y0 }, { x: x0 + dx * 0.3 + nx * a1, y: y0 + dy * 0.3 + ny * a1 }, { x: x0 + dx * 0.72 + nx * a2, y: y0 + dy * 0.72 + ny * a2 }, { x: tx, y: ty }];
    var t0 = performance.now(); bot.moving = true;
    function step(now){
      if (id !== bot.anim || !botAlive(s, my)) return;
      var t = Math.min(1, (now - t0) / ms), e = ease(t);
      bot.x = bez(p, e, "x"); bot.y = bez(p, e, "y"); botRender(bot.x, bot.y);
      if (t < 1) requestAnimationFrame(step); else { bot.moving = false; if (done) done(); }
    }
    requestAnimationFrame(step);
  }
  function botMove(s, my, getEl, done){
    var stage = $g("previewStage"), el = getEl();
    if (!stage || !el || !botAlive(s, my)) { done(false); return; }
    var sr = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    var tx = r.left - sr.left + r.width * (0.27 + Math.random() * 0.46), ty = r.top - sr.top + r.height * (0.27 + Math.random() * 0.46);
    var dx = tx - bot.x, dy = ty - bot.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
    var ms = (d < 50 ? 240 + d * 2 : 430 + Math.min(d, 700) * 0.95) * (0.92 + Math.random() * 0.16);
    var over = d > 150 && Math.random() < 0.65;
    if (over) {
      var k = 6 + Math.random() * 9;
      botGlide(s, my, tx + dx / d * k, ty + dy / d * k, ms, 0.07 + Math.random() * 0.07, easeHuman, function(){
        botLater(s, my, 70, function(){ botGlide(s, my, tx, ty, 170, 0.12, easeOut, function(){ botLater(s, my, 90, function(){ done(true); }); }); });
      });
    } else botGlide(s, my, tx, ty, ms, 0.06 + Math.random() * 0.09, easeHuman, function(){ botLater(s, my, 100, function(){ done(true); }); });
  }
  function botPress(s, my, getEl, done){
    var el = getEl(); if (!el) { done(false); return; }
    var stage = $g("previewStage");
    if (bot.el) bot.el.classList.add("press");
    if (stage) {
      var rip = document.createElement("div"); rip.className = "bot-ripple"; rip.style.left = bot.x + "px"; rip.style.top = bot.y + "px"; stage.appendChild(rip);
      setTimeout(function(){ if (rip.parentNode) rip.parentNode.removeChild(rip); }, 650);
    }
    botLater(s, my, 110, function(){
      if (bot.el) bot.el.classList.remove("press");
      var live = getEl(); if (live) live.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
      // move off a little after the click (down and to the side), slowly, while the sequence carries on
      var ang = (Math.random() * 100 - 25) * Math.PI / 180, dist = 40 + Math.random() * 60, sw = stage ? stage.clientWidth : 800, sh = stage ? stage.clientHeight : 640;
      var gx = Math.max(20, Math.min(sw - 30, bot.x + Math.cos(ang) * dist)), gy = Math.max(20, Math.min(sh - 30, bot.y + Math.sin(ang) * dist));
      var a0 = bot.anim;
      botLater(s, my, 140, function(){ if (bot.anim === a0) botGlide(s, my, gx, gy, 700 + Math.random() * 350, 0.1, easeHuman, null); });
      botLater(s, my, 190, function(){ done(true); });
    });
  }
  function botClick(s, my, getEl, done){ botMove(s, my, getEl, function(ok){ if (!ok) { done(false); return; } botPress(s, my, getEl, done); }); }
  function botSeq(s, my, steps, done){   // steps: [getEl | {wait:ms} | {fn:function(next)}]
    var i = 0;
    (function next(){
      if (!botAlive(s, my)) return;
      if (i >= steps.length) { done(); return; }
      var st = steps[i++];
      if (typeof st === "function") botClick(s, my, st, function(){ next(); });
      else if (st.wait) botLater(s, my, st.wait, next);
      else if (st.fn) st.fn(next);
      else next();
    })();
  }
  function qsel(sel){ return function(){ return document.querySelector(sel); }; }

  function botDecide(s, my){
    if (s.phase === "walk") return function(done){ botSeq(s, my, [{ wait: 1500 }, qsel('[data-action="coach-next"]')], done); };
    if (s.phase !== "answer") return null;
    if (!s.plan) {
      var wrongNow = s.mode === "practice" ? s.qid % 2 === 1 : s.mode === "test" ? (s.attempts === 2 || s.attempts === 5) : false;
      s.plan = { wrong: wrongNow, wrongDone: false, helpDone: false };
    }
    var p = s.plan;
    if (p.wrong && !p.wrongDone) return function(done){ botSeq(s, my, [{ wait: 1100 }, { fn: function(next){ p.wrongDone = true; botAnswer(s, my, false, next); } }], done); };
    if (s.mode === "practice" && p.wrong && !p.helpDone) {
      return function(done){
        p.helpDone = true;
        botSeq(s, my, [{ wait: 1100 }, qsel('[data-action="help-menu"]'), { wait: 700 }, qsel('.hcards .hchipbtn:not(.show)'), { wait: 900 }, qsel('[data-action="help-menu"]'), { wait: 500 }], done);
      };
    }
    return function(done){ botSeq(s, my, [{ wait: 1000 }, { fn: function(next){ botAnswer(s, my, true, next); } }], done); };
  }
  // answer the current question (right or deliberately wrong) the way a student would
  function botAnswer(s, my, right, done){
    var mt = s.type, q = s.q, lv = s.level, area = $g("answerArea");
    if (!area) { done(); return; }
    if (mt.answer === "name") {
      var btns = [].slice.call(area.querySelectorAll("[data-answer-name]:not(.grey):not([disabled])"));
      var good = btns.filter(function(b){ return isAnswerCorrect(mt, lv, q, b.getAttribute("data-answer-name")); });
      var bad = btns.filter(function(b){ return !isAnswerCorrect(mt, lv, q, b.getAttribute("data-answer-name")); });
      var pickOne = right ? good : (bad.length ? bad : good);
      if (!pickOne.length) { done(); return; }
      var first = pickOne[Math.floor(Math.random() * pickOne.length)], steps = [function(){ return first; }];
      if (right && needsBothNames(mt, lv, q)) {
        var other = good.filter(function(b){ return accOf(b.getAttribute("data-answer-name")) !== accOf(first.getAttribute("data-answer-name")); })[0];
        if (other) steps.push({ wait: 500 }, function(){ return other; });
      }
      botSeq(s, my, steps, done); return;
    }
    if (mt.answer === "key") {
      var pc = noteSemitoneClass(q.name), j0 = q.pk.j0, cands = [];
      for (var j = j0 + 1; j <= j0 + WIN - 2; j++) { cands.push("w" + j); if (hasBlackAfter(j) && j <= j0 + WIN - 3) cands.push("b" + j); }
      var sel = right ? q.pk.key : cands.filter(function(id){
        var k = area.querySelector('.piano-key[data-k="' + id + '"]');
        return k && parseInt(k.getAttribute("data-cls"), 10) !== pc && !k.classList.contains("grey");
      })[Math.floor(Math.random() * 6)] || cands.filter(function(id){ var k = area.querySelector('.piano-key[data-k="' + id + '"]'); return k && parseInt(k.getAttribute("data-cls"), 10) !== pc; })[0];
      botSeq(s, my, [function(){ return area.querySelector('.piano-key[data-k="' + sel + '"]'); }], done); return;
    }
    botStaff(s, my, right, done);
  }
  function botStaff(s, my, right, done){
    var sa = staffAnswer, q = s.q, mt = s.type, lv = s.level;
    if (!sa) { done(); return; }
    var ids = sa.positions.map(function(p){ return p.letter + p.octave; });
    var want = ids.indexOf(q.pos.letter + q.pos.octave); if (want < 0) want = sa.idx;
    var tIdx = want, tAcc = accOf(q.name);
    if (!right) {
      var offs = [2, -2, 3, -3, 1, -1];
      for (var i = 0; i < offs.length; i++) {
        var c = want + offs[i];
        if (c < 0 || c >= sa.positions.length) continue;
        if (!isAnswerCorrect(mt, lv, q, sa.positions[c].letter + sa.acc)) { tIdx = c; tAcc = sa.acc; break; }
      }
    }
    var diff = tIdx - sa.idx, dir = diff >= 0 ? "up" : "down", n = Math.abs(diff);
    var steps = [{ wait: 400 }];
    if (n) {
      steps.push(qsel('[data-staff="' + dir + '"]'));
      for (var k = 1; k < n; k++) steps.push({ fn: (function(){ return function(next){ var b = document.querySelector('[data-staff="' + dir + '"]'); if (b) b.dispatchEvent(new MouseEvent("click", { bubbles: true })); botLater(s, my, 190, next); }; })() });
    }
    if (tAcc !== sa.acc) steps.push({ wait: 300 }, qsel('[data-acc="' + tAcc + '"]'));
    steps.push({ wait: 500 }, qsel('[data-staff="submit"]'));
    botSeq(s, my, steps, done);
  }
  // ---------- Delegated clicks ----------
  function openLevelByLink(typeId, levelId, opts){
    var m = moduleTypeById(typeId);
    if (!m || !(levels[typeId] || []).some(function(l){ return l.id === levelId; })) return false;
    dropSession();
    view = "hub"; hubTypeId = typeId; hubLevelId = levelId; maximized = true;
    var md = opts.student ? "test" : (opts.mode || null);
    if (md) hubMode = md;
    if (md) startPractice(typeId, levelId, { student: opts.student || null, mode: md }); else renderApp();
    return true;
  }
  function findLevelByAssignment(aid){
    var hit = null;
    MODULE_TYPES.forEach(function(m){ (levels[m.id] || []).forEach(function(lv){ if (!hit && lv.link && lv.link.assignmentId === aid) hit = { m: m, lv: lv }; }); });
    return hit;
  }
  document.getElementById("app").addEventListener("click", function(ev){
    var s0 = currentSession;
    if (s0 && !s0.demo && s0.menuOpen && !ev.target.closest(".hchipbtn, .hcard, .hchip, [data-action=help-menu]")) { s0.menuOpen = false; renderHelpers(); }
  });
  document.getElementById("app").addEventListener("click", function(ev){
    var t = ev.target.closest("[data-action]");
    if (!t) return;
    var action = t.getAttribute("data-action");
    if (ev.target.closest("[data-lgrip]") || Date.now() < suppressClickUntil) return;
    if (action === "score-toggle") { toggleScoreMode(); return; }
    if (action === "hist-del") { var ht = parseInt(t.getAttribute("data-t"), 10); history = history.filter(function(h){ return h.t !== ht; }); saveHistory(); renderHistory(); return; }
    if (action === "hist-toggle") { var ht2 = parseInt(t.getAttribute("data-t"), 10); history.forEach(function(h){ if (h.t === ht2) h.counted = !h.counted; }); saveHistory(); renderHistory(); return; }
    if (action === "edit-level" && !drag) { ev.stopPropagation(); openLevelEditor(t.getAttribute("data-type"), t.getAttribute("data-level")); return; }
    var s = currentSession;
    if (s && s.demo && (action === "help-menu" || action === "toggle-helper" || action === "coach-next" || action === "ls-pick" || action === "count-step" || action === "reveal" || action === "hq-pick")) { /* the demo bot drives these */ }
    else if (view === "hub" && s && !s.demo && (action === "cycle-state" || action === "move-level" || action === "add-after")) { dropSession(); }
    if (action === "start-practice") { if (hubMode) startPractice(t.getAttribute("data-type"), t.getAttribute("data-level"), selectedStudent ? { student: selectedStudent, studentPractice: hubMode === "practice" } : { mode: hubMode }); }
    else if (action === "pick-mode") { hubMode = t.getAttribute("data-mode"); hubNote = ""; renderOverlay(); restartDemo(); }
    else if (action === "toggle-max") toggleMax();
    else if (action === "select-level") { var nl = t.getAttribute("data-level"); if (nl !== hubLevelId || (s && s.demo)) { dropSession(); hubLevelId = nl; hubNote = ""; renderHub(); } }
    else if (action === "cycle-state") {
      var lvS = (levels[hubTypeId] || []).filter(function(l){ return l.id === t.getAttribute("data-level"); })[0], mtS = moduleTypeById(hubTypeId);
      if (lvS && mtS) { var ord = ["learning", "testing", "catchup", "future"], nxt = ord[(ord.indexOf(levelState(mtS, lvS)) + 1) % 4]; config.states[mtS.id + ":" + lvS.id] = nxt; saveConfig(); }
      renderHub();
    }
    else if (action === "move-level") {
      var arr = levels[hubTypeId] || [], at0 = arr.map(function(l){ return l.id; }).indexOf(t.getAttribute("data-level")), to = at0 + parseInt(t.getAttribute("data-dir"), 10);
      if (at0 >= 0 && to >= 0 && to < arr.length) { var mv = arr.splice(at0, 1)[0]; arr.splice(to, 0, mv); saveLevels(); }
      renderHub();
    }
    else if (action === "add-after") {
      var arr2 = levels[hubTypeId] || [], at1 = arr2.map(function(l){ return l.id; }).indexOf(t.getAttribute("data-level"));
      if (at1 >= 0) { var cl = cloneLevel(arr2[at1]); arr2.splice(at1 + 1, 0, cl); hubLevelId = cl.id; saveLevels(); }
      renderHub();
    }
    else if (action === "arrange-games") openArrange();
    else if (action === "edit-states") openStateEditor();
    else if (action === "clear-history") { history = []; saveHistory(); renderHistory(); }
    else if (action === "add-level") openLevelEditor(t.getAttribute("data-type"), null, null);
    else if (action === "insert-at") openLevelEditor(t.getAttribute("data-type"), null, parseInt(t.getAttribute("data-idx"), 10));
    else if (action === "end-practice") endPractice();
    else if (action === "play-again") { if (s) { var ov = document.querySelector(".lost-overlay"); if (ov) ov.remove(); resetRound(s); nextQuestion(); renderQuestion(); } }
    else if (action === "clear-student") { selectedStudent = null; renderStudentChip(); }
    else if (action === "show-view") { view = t.getAttribute("data-view"); renderApp(); }
    else if (action === "plan-type") { planTypeId = t.getAttribute("data-type"); renderPlan(); }
    else if (action === "hub-type") { dropSession(); hubTypeId = t.getAttribute("data-type"); hubLevelId = null; hubNote = ""; renderHub(); }
    
    else if (action === "clear-practice") clearPracticeData(null);
    else if (action === "clear-class") clearClassData(null);
    else if (action === "edit-type") openTypeEditor(t.getAttribute("data-type"));
    else if (action === "add-type") openTypeEditor(null);
    else if (action === "refresh-curriculum") { planMsg = ""; curriculumLoad(); }
    else if (action === "auto-link") autoLink();
    else if (action === "unlink-level") {
      var lv = (levels[t.getAttribute("data-type")] || []).filter(function(l){ return l.id === t.getAttribute("data-level"); })[0];
      if (lv) { lv.link = null; saveLevels(); renderPlan(); }
    }
    else if (s && action === "coach-next") {
      if (s.phase !== "walk") return;
      if (s.stepIdx < s.steps.length - 1) { s.stepIdx++; renderHelpers(); }
      else if (s.lesson) { s.lesson.walked = true; (s.lesson.met = s.lesson.met || {}).walk = true; if (s.walkTrig && !lsEdit()) lessonAdvance(s); else if (lessonHasAsk(s)) { s.phase = "answer"; renderHelpers(); lessonAfterDraw(s); } else lessonCheck(s); }
      else { s.phase = "answer"; renderHelpers(); setFeedback(null); }
    }
    else if (s && action === "help-menu") { s.menuOpen = !s.menuOpen; renderHelpers(); }
    else if (s && action === "toggle-helper") {
      var id = t.getAttribute("data-id"), at = s.active.indexOf(id);
      if (at === -1) s.active.push(id); else s.active.splice(at, 1);
      renderHelpers();
    }
    else if (s && action === "ls-pick") { s.h.ls = t.getAttribute("data-v"); renderHelpers(); }
    else if (s && action === "reveal") { s.h["rv" + t.getAttribute("data-id")] = true; renderHelpers(); }
    else if (s && action === "hq-pick") { s.h["qa" + t.getAttribute("data-id")] = t.getAttribute("data-v"); renderHelpers(); }
    else if (s && action === "count-step") { s.h.count = (s.h.count || 0) + 1; renderHelpers(); }
    else if (s && action === "hint" && s.phase === "answer" && s.mode === "practice") {   // one hint: the first step of the walk, then no more help of this kind for this question
      var hs = explain(s.type, s.q, s.level).filter(function(x){ return !x.answer; });
      if (hs.length) { s.h.hint = hs[0]; s.menuOpen = false; renderHelpers(); setFeedback("neutral", "Hint: " + hs[0].t + ". " + hs[0].x); }   // shows where the right / wrong message shows
    }
    else if (s && action === "walk-me" && s.phase === "answer" && s.mode === "practice") {   // Practice -> this level's Learn lesson; with no lesson, the built-in walk (not scored)
      if (lessonSlides(s.type.id, s.level.id).length) {
        if (s.timer) clearTimeout(s.timer);
        s.mode = "learn"; s.lesson = { idx: 0, done: 0 }; s.phase = "lesson"; s.menuOpen = false; s.h = {}; s.active = [];
        renderExerciseView();
      } else {
        s.steps = explain(s.type, s.q, s.level).filter(function(x){ return !x.answer; });
        if (!s.steps.length) return;
        s.stepIdx = 0; s.phase = "walk"; s.menuOpen = false; renderHelpers();
      }
    }
  });
  document.getElementById("app").addEventListener("change", function(ev){
    var t = ev.target;
    if (t.getAttribute && t.getAttribute("data-change") === "link-assignment") {
      var v = t.value; if (!v) return;
      var aid = t.getAttribute("data-aid"), found = findAssignment(aid);
      if (!found) return;
      if (v === "__new") {
        var mt = moduleTypeById(planTypeId);
        openLevelEditor(mt.id, null, null, { link: linkFrom(found.unit, found.a) });
        return;
      }
      var parts = v.split("|");
      linkLevel(parts[0], parts[1], found.unit, found.a);
      planMsg = "";
      renderPlan();
    }
  });
  document.getElementById("modalRoot").addEventListener("change", function(ev){
    var t = ev.target;
    if (editing && t && t.id === "editLink") autosaveLevel();
    if (t.getAttribute && t.getAttribute("data-change") === "mg-group") { syncArrange(); mgMove(t.getAttribute("data-type"), t.value, null, false); }
    else if (t.getAttribute && t.getAttribute("data-gname")) { syncArrange(); saveConfig(true); }
  });
  document.getElementById("modalRoot").addEventListener("input", function(ev){
    if (editing && ev.target && /^(editLevelName|editLevelBlurb|editLevelInstructions|editLinkText)$/.test(ev.target.id || "")) autosaveSoon();
    if (ev.target && ev.target.id === "delConfirm") { var go = document.getElementById("delGo"); if (go) go.disabled = ev.target.value.trim().toLowerCase() !== "delete"; }
    if (ev.target && ev.target.id === "iconSearch") {
      picker.q = ev.target.value;
      var cur = picker.target.indexOf("fmt:") === 0 && typeEdit ? typeEdit.fmt[picker.target.slice(4)] : (editing ? editing.draft.icon : "");
      var h = document.getElementById("iconGridHost"); if (h) h.innerHTML = iconGridHtml(cur, picker.q);
    }
  });
  function rerenderModal(){ if (editing) renderLevelEditorModal(); else if (typeEdit) renderTypeEditor(); else if (stateEdit) renderStateEditor(); if (picker.open) { var el = document.getElementById("iconSearch"); if (el) el.focus(); } }
  function moveInList(arr, id, delta){
    var i = arr.indexOf(id), j = i + delta;
    if (i < 0 || j < 0 || j >= arr.length) return;
    arr.splice(i, 1); arr.splice(j, 0, id);
  }
  document.getElementById("modalRoot").addEventListener("click", function(ev){
    var t = ev.target.closest("[data-action]");
    if (!t) return;
    var action = t.getAttribute("data-action");
    if (action === "stop-modal-click") return;
    if (arrange && (/^(close-arrange|mg-|icon-|set-label)/.test(action))) { handleArrange(t, action, ev); return; }
    if (stateEdit && (action === "close-states" || action === "st-color" || action === "st-reset" || action === "toggle-icons" || action === "pick-icon")) {
      if (action === "close-states") { if (ev.target === t || t.classList.contains("btn")) closeStateEditor(); return; }
      if (action === "st-color") { syncStateEdit(); var sc = t.getAttribute("data-id"); config.stateDefs[sc] = config.stateDefs[sc] || {}; config.stateDefs[sc].color = t.getAttribute("data-color"); renderStateEditor(); return; }
      if (action === "st-reset") { syncStateEdit(); delete config.stateDefs[t.getAttribute("data-id")]; renderStateEditor(); return; }
    }
    if (action === "close-editor") { if (ev.target === t) saveLevelFromEditor(); return; }
    if (action === "cancel-editor") { cancelLevelEditor(); return; }
    if (action === "close-type") { if (ev.target === t || t.classList.contains("btn")) closeTypeEditor(); return; }
    if (action === "refresh-curriculum") { curriculumLoad(); return; }
    if (action === "toggle-icons") {
      if (editing) syncDraft(); if (typeEdit) syncTypeDraft(); if (stateEdit) syncStateEdit();
      var target = t.getAttribute("data-target") || "level";
      picker.open = !(picker.open && picker.target === target); picker.target = target; picker.q = "";
      rerenderModal(); return;
    }
    if (action === "pick-icon") {
      var ic = t.getAttribute("data-icon");
      if (picker.target.indexOf("ch:") === 0 && typeEdit) { syncTypeDraft(); var chp = (config.customHelpers || []).filter(function(x){ return x.id === picker.target.slice(3); })[0]; if (chp) chp.icon = ic; }
      else if (picker.target.indexOf("state:") === 0 && stateEdit) { syncStateEdit(); var sid = picker.target.slice(6); config.stateDefs[sid] = config.stateDefs[sid] || {}; config.stateDefs[sid].icon = ic; }
      else if (picker.target.indexOf("fmt:") === 0 && typeEdit) { syncTypeDraft(); typeEdit.fmt[picker.target.slice(4)] = ic; }
      else if (editing) { syncDraft(); editing.draft.icon = ic; }
      picker.open = false; rerenderModal(); return;
    }
    if (typeEdit) {
      if (action === "save-type") saveTypeFromEditor();
      else if (action === "delete-type") deleteTypeFromEditor();
      else if (action === "type-default") {
        var dt = defaultTypeById(typeEdit.id); if (dt) { typeEdit.draft = normalizeType({ id: dt.id }); typeEdit.error = ""; renderTypeEditor(); }
      }
      else if (action === "set-fmt") {
        syncTypeDraft();
        var which = t.getAttribute("data-which"), f = t.getAttribute("data-fmt");
        if (typeEdit.draft[which === "prompt" ? "answer" : "prompt"] !== f) {
          typeEdit.draft[which] = f; typeEdit.error = "";
          typeEdit.draft.helpers = defaultHelperIds(typeEdit.draft);   // the helpers that make sense depend on the formats
        }
        renderTypeEditor();
      }
      else if (action === "fmt-default") { syncTypeDraft(); typeEdit.fmt[t.getAttribute("data-fmt")] = "svg"; renderTypeEditor(); }
      else if (action === "helper-toggle") {
        syncTypeDraft();
        var hid = t.getAttribute("data-id"), hl = typeEdit.draft.helpers || [], at = hl.indexOf(hid);
        if (at === -1) hl.push(hid); else hl.splice(at, 1);
        typeEdit.draft.helpers = hl; renderTypeEditor();
      }
      else if (action === "helper-up" || action === "helper-down") { syncTypeDraft(); moveInList(typeEdit.draft.helpers, t.getAttribute("data-id"), action === "helper-up" ? -1 : 1); renderTypeEditor(); }
      else if (action === "def-clef") { syncTypeDraft(); typeEdit.draft.defaults.clef = t.getAttribute("data-v"); renderTypeEditor(); }
      else if (action === "def-style") { syncTypeDraft(); typeEdit.draft.defaults.staffStyle = t.getAttribute("data-v"); renderTypeEditor(); }
      else if (action === "def-acc") { syncTypeDraft(); typeEdit.draft.defaults.accidentals = t.getAttribute("data-v"); renderTypeEditor(); }
      else if (action === "add-chelper") {
        syncTypeDraft();
        var nh = { id: "ch" + uid(), label: "New helper", icon: "ti-bulb", kind: "text", style: "plain", text: "This note is {name}.", ask: "", right: "", wrong: "" };
        config.customHelpers = (config.customHelpers || []).concat([nh]);
        typeEdit.draft.helpers = (typeEdit.draft.helpers || defaultHelperIds(typeEdit.draft)).concat([nh.id]);
        renderTypeEditor();
      }
      else if (action === "ch-kind" || action === "ch-style") {
        syncTypeDraft();
        var chx = (config.customHelpers || []).filter(function(x){ return x.id === t.getAttribute("data-id"); })[0];
        if (chx) { if (action === "ch-kind") chx.kind = t.getAttribute("data-v"); else chx.style = t.getAttribute("data-v"); }
        renderTypeEditor();
      }
      else if (action === "del-chelper") {
        syncTypeDraft();
        var did = t.getAttribute("data-id");
        config.customHelpers = (config.customHelpers || []).filter(function(x){ return x.id !== did; });
        typeEdit.draft.helpers = (typeEdit.draft.helpers || []).filter(function(x){ return x !== did; });
        MODULE_TYPES.forEach(function(m){ if (m.helpers) m.helpers = m.helpers.filter(function(x){ return x !== did; }); });
        renderTypeEditor();
      }
      else if (action === "clear-practice-type") clearPracticeData(typeEdit.id);
      else if (action === "clear-class-type") clearClassData(typeEdit.id);
      return;
    }
    if (!editing) return;
    if (action === "save-level") saveLevelFromEditor();
    else if (action === "delete-level") { syncDraft(); editing.confirmDel = true; renderLevelEditorModal(); var dc = document.getElementById("delConfirm"); if (dc) dc.focus(); }
    else if (action === "delete-level-cancel") { editing.confirmDel = false; renderLevelEditorModal(); }
    else if (action === "delete-level-go") { var dcf = document.getElementById("delConfirm"); if (dcf && dcf.value.trim().toLowerCase() === "delete") deleteLevelFromEditor(); }
    else if (action === "reset-score") resetScoreFromEditor();
    else if (action === "suggest-name") { syncDraft(); editing.draft.name = suggestName(editing.draft); renderLevelEditorModal(); }
    else if (action === "cycle-ns") { syncDraft(); var nn = t.getAttribute("data-note"), cc = editing.draft.criteria; setNs(cc, nn, nextNs(nsOf(editing.draft, nn))); editing.error = ""; renderLevelEditorModal(); }
    else if (action === "set-row-ns") { syncDraft(); var rw = ROWS.filter(function(r){ return r[0] === t.getAttribute("data-row"); })[0]; rw[1].forEach(function(nm){ setNs(editing.draft.criteria, nm, t.getAttribute("data-st")); }); editing.error = ""; renderLevelEditorModal(); }
    else if (action === "group-on" || action === "group-off") {
      syncDraft();
      NATURALS_ROW.forEach(function(nm){ var cs = nsOf(editing.draft, nm); setNs(editing.draft.criteria, nm, action === "group-on" ? "ask" : (cs === "ask" ? "vis" : cs)); });
      editing.error = ""; renderLevelEditorModal();
    }
    else if (action === "acc-all") { syncDraft(); SHARPS_ROW.concat(FLATS_ROW).forEach(function(nm){ setNs(editing.draft.criteria, nm, "ask"); }); editing.error = ""; renderLevelEditorModal(); }
    else if (action === "acc-none") { syncDraft(); SHARPS_ROW.concat(FLATS_ROW).forEach(function(nm){ if (nsOf(editing.draft, nm) === "ask") setNs(editing.draft.criteria, nm, "vis"); }); editing.error = ""; renderLevelEditorModal(); }
    else if (action === "acc-black") { syncDraft(); SHARPS_ROW.concat(FLATS_ROW).forEach(function(nm){ if (BLACK_NAMES.indexOf(nm) !== -1) setNs(editing.draft.criteria, nm, "ask"); else if (nsOf(editing.draft, nm) === "ask") setNs(editing.draft.criteria, nm, "vis"); }); editing.error = ""; renderLevelEditorModal(); }
    else if (action === "range-preset") { syncDraft(); editing.draft.criteria.range = t.getAttribute("data-range"); editing.draft.criteria.custom = null; editing.rangePick = {}; renderLevelEditorModal(); }
    else if (action === "range-clear") { syncDraft(); editing.draft.criteria.custom = null; editing.rangePick = {}; renderLevelEditorModal(); }
    else if (action === "range-pick") {
      syncDraft();
      var rc = t.getAttribute("data-clef"), ri = parseInt(t.getAttribute("data-idx"), 10), rp = editing.rangePick || (editing.rangePick = {});
      if (typeof rp[rc] !== "number") rp[rc] = ri;
      else {
        var ra = Math.min(rp[rc], ri), rb = Math.max(rp[rc], ri);
        delete rp[rc];
        var cu = editing.draft.criteria.custom || { treble: null, bass: null };
        cu[rc] = [posName(ra), posName(rb)]; editing.draft.criteria.custom = cu;
      }
      renderLevelEditorModal();
    }
    else if (action === "set-clef") { syncDraft(); editing.draft.criteria.clef = t.getAttribute("data-clef"); renderLevelEditorModal(); }
    else if (action === "set-style") { syncDraft(); editing.draft.criteria.staffStyle = t.getAttribute("data-style"); renderLevelEditorModal(); }
    else if (action === "set-acc") { syncDraft(); editing.draft.criteria.accidentals = t.getAttribute("data-acc"); editing.error = ""; renderLevelEditorModal(); }
  });

  function handleArrange(t, action, ev){
    if (action === "close-arrange") { if (ev.target === t || t.classList.contains("btn")) closeArrange(); return; }
    syncArrange();
    var id = t.getAttribute("data-type"), g = t.getAttribute("data-g");
    if (action === "mg-up" || action === "mg-down") {
      var m = moduleTypeById(id), same = MODULE_TYPES.filter(function(x){ return (x.group || "") === (m.group || ""); }), i = same.indexOf(m), j = i + (action === "mg-up" ? -1 : 1);
      if (j >= 0 && j < same.length) { var other = same[j]; mgMove(id, m.group, other.id, action === "mg-down"); } return;
    }
    if (action === "mg-color") { var gg = groupById(g); if (gg) { gg.color = t.getAttribute("data-color"); arrSave(); } return; }
    if (action === "mg-gadd") { config.groups.push({ id: "g" + uid(), name: "New group", color: GROUP_COLORS[config.groups.length % GROUP_COLORS.length] }); arrSave(); return; }
    if (action === "mg-gdel") { MODULE_TYPES.forEach(function(x){ if (x.group === g) x.group = ""; }); config.groups = config.groups.filter(function(x){ return x.id !== g; }); arrSave(); return; }
    if (action === "mg-gup" || action === "mg-gdown") { var gi = config.groups.map(function(x){ return x.id; }).indexOf(g), gj = gi + (action === "mg-gup" ? -1 : 1); if (gi >= 0 && gj >= 0 && gj < config.groups.length) { var gm = config.groups.splice(gi, 1)[0]; config.groups.splice(gj, 0, gm); arrSave(); } return; }
    if (action === "set-label") { config.cardLabel = t.getAttribute("data-v"); saveConfig(true); renderArrange(); return; }
    if (action === "icon-preset") { config.icons.staff = JSON.parse(JSON.stringify(STAFF_ICON_PRESETS[parseInt(t.getAttribute("data-i"), 10)].o)); saveConfig(true); renderArrange(); return; }
    if (action === "icon-staff") { var so = staffIconOpts(), v = t.getAttribute("data-v"); so[t.getAttribute("data-k")] = t.getAttribute("data-k") === "lines" ? parseInt(v, 10) : v; config.icons.staff = so; saveConfig(true); renderArrange(); return; }
    if (action === "icon-name") { config.icons.name = t.getAttribute("data-v"); saveConfig(true); renderArrange(); return; }
    if (action === "icon-clear-override") { config.formatIcons.staff = "svg"; config.formatIcons.name = "svg"; saveConfig(true); renderArrange(); return; }
  }

  // ---------- Docked-app embedding contract (Project-Instructions.md section 7) ----------
  var gotHandle = false;
  function studentFrom(d){ return d.studentName ? { id: d.studentId, name: d.studentName } : null; }
  var pendingMsgs = [];   // v13: link / state messages that arrive before the saved data has loaded are replayed once it has
  window.addEventListener("message", function(ev){
    if (!ev.data || !ev.data.type) return;
    if (!dataReady && /^note-id-(open|set-state|current|link|set-mode)/.test(ev.data.type)) { pendingMsgs.push(ev); return; }
    handleMessage(ev);
  });
  function handleMessage(ev){
    var d = ev.data;
    if ((d.type === "app-ready" || d.type === "storage-handle-request") && siteFrame && ev.source === siteFrame.contentWindow) { if (rootDirHandle) { try { ev.source.postMessage({ type: "storage-handle-response", handle: rootDirHandle }, "*"); } catch (e) {} } return; }   // X88
    if (d.type === "storage-handle-response" && d.handle) {
      gotHandle = true;
      embedded = true;
      useHandle(d.handle);
      renderStorageModeUI();
      sweepThenLoadAll();
    } else if (d.type === "active-class-changed" || d.type === "view-mode-changed") {
      /* nothing to do for NoteID today */
    } else if (d.type === "note-id-set-score-mode") {
      setScoreOverride(d.mode);
    } else if (d.type === "note-id-score-mode-request") {
      postScoreMode();
    } else if (d.type === "class-in-session") {
      classInSession = !!d.value; renderScoreChip(); postScoreMode(); if (view === "plan") renderPlan();
    } else if (d.type === "marking-period-changed") {
      if (dataReady) { setPeriod(d.id); if (!currentSession || currentSession.demo) renderApp(); }
    } else if (d.type === "note-id-set-mode") {
      if (modeById(d.mode).id === d.mode) { config.mode = d.mode; hubMode = d.mode; saveConfig(true); if (!currentSession || currentSession.demo) renderApp(); }
    } else if (d.type === "note-id-link") {
      var lkL = (levels[d.typeId] || []).filter(function(l){ return l.id === d.levelId; })[0];
      if (lkL && d.assignmentId) {
        var lkF = findAssignment(d.assignmentId);
        lkL.link = lkF ? linkFrom(lkF.unit, lkF.a) : { unitId: d.unitId || "", unitName: d.unitName || "", assignmentId: d.assignmentId, assignmentName: d.assignmentName || "" };
        saveLevels(); if (!currentSession || currentSession.demo) renderApp();
      }
    } else if (d.type === "note-id-set-state") {
      var hs = d.assignmentId ? findLevelByAssignment(d.assignmentId) : null;
      var tidS = hs ? hs.m.id : d.typeId, lidS = hs ? hs.lv.id : d.levelId;
      if (moduleTypeById(tidS) && (levels[tidS] || []).some(function(l){ return l.id === lidS; }) && stateIdOk(d.state)) { config.states[tidS + ":" + lidS] = d.state; saveConfig(); if (!currentSession || currentSession.demo) renderApp(); }
    } else if (d.type === "note-id-current") {
      var cur = d.assignmentId ? findLevelByAssignment(d.assignmentId) : null;
      var tid = cur ? cur.m.id : d.typeId, lid = cur ? cur.lv.id : d.levelId;
      if (moduleTypeById(tid) && (levels[tid] || []).some(function(l){ return l.id === lid; })) { config.states[tid + ":" + lid] = "learning"; saveConfig(); if (!currentSession || currentSession.demo) renderApp(); }
    } else if (d.type === "note-id-open-student") {
      selectedStudent = { id: d.studentId, name: d.studentName };
      renderStudentChip();
    } else if (d.type === "note-id-open-level") {
      var st = studentFrom(d); if (st) { selectedStudent = st; renderStudentChip(); }
      openLevelByLink(d.typeId, d.levelId, { student: st, mode: modeById(d.mode).id === d.mode ? d.mode : undefined });
    } else if (d.type === "note-id-open-assignment") {
      var st2 = studentFrom(d); if (st2) { selectedStudent = st2; renderStudentChip(); }
      var hit = findLevelByAssignment(d.assignmentId);
      if (hit) openLevelByLink(hit.m.id, hit.lv.id, { student: st2, mode: modeById(d.mode).id === d.mode ? d.mode : undefined });
    }
  }
  window.addEventListener("focus", function(){ if (dataReady && (!currentSession || currentSession.demo)) curriculumLoad(); });

  function announceReady(){
    if (window.parent && window.parent !== window) window.parent.postMessage({ type: "app-ready", app: APP_NAME }, parentOrigin);
  }
  function requestStorageHandle(){
    if (window.parent && window.parent !== window) window.parent.postMessage({ type: "storage-handle-request", app: APP_NAME }, parentOrigin);
  }

  document.getElementById("connectFolderBtn").addEventListener("click", function(){
    DataStore.connect().then(function(handle){
      useHandle(handle);
      renderStorageModeUI();
      sweepThenLoadAll();
    }).catch(function(err){ console.error("NoteID: folder connect failed:", err); });
  });

  wireMidiInputStub();

  // ---------- v17: Learn lessons = SLIDES of free modules on a 16 x 12 snap grid ----------
  // A slide is one still picture of the stage: modules (boxes) placed on the grid. NOTHING animates inside a slide. When a slide is made from the previous one,
  // its modules are LINKED (same `lid`); moving to the next slide animates only what changed: a linked module glides / stays, a new one comes in, a dropped one goes out.
  // Edit: toolbar (add module, undo / redo, preview transition) over the stage, slide list at the left, details at the right.
  var GC = 16, GR = 12;
  // dw/dh default size, mw/mh smallest, xw/xh biggest (grid cells); x,y = standard place (null = centred / bottom by rule); cat = Add-menu group
  var LS_KINDS = [
    { id: "game", label: "Practice game", short: "G", cat: "Game", els: ["promptArea", "feedbackRow", "helperArea", "answerArea"], dw: 16, dh: 12, mw: 8, mh: 6, xw: 16, xh: 12, y: 0, d: "The whole game as one module (question, message, helper and answers), like Practice mode. Fills all or part of the screen." },
    { id: "question", label: "Note question", short: "Q", cat: "Questions and answers", els: ["promptArea"], cls: "prompt-card", dw: 16, dh: 6, mw: 4, mh: 2, xw: 16, xh: 12, y: 0, d: "A question about a note, shown the way the game shows it (piano, staff or note name). One per slide." },
    { id: "answer", label: "Note answer", short: "A", cat: "Questions and answers", els: ["answerArea"], cls: "answer-panel", dw: 16, dh: 4, mw: 6, mh: 3, xw: 16, xh: 6, y: "bottom", d: "The answer buttons for the note question, the way the game answers it. Counts right answers. One per slide." },
    { id: "message", label: "Feedback", short: "F", cat: "Questions and answers", els: ["feedbackRow"], cls: "feedback", dw: 16, dh: 1, mw: 3, mh: 1, xw: 16, xh: 2, y: 6, d: "THE feedback for the question and answer: where right / wrong (and your own message) shows. One per slide, because it belongs to the question-answer loop." },
    { id: "helper", label: "Helper", short: "H", cat: "Questions and answers", els: ["helperArea"], cls: "helpers", dw: 16, dh: 2, mw: 4, mh: 1, xw: 16, xh: 3, y: 7, d: "A helper from this game and / or a step-by-step walk. One per slide." },
    { id: "text", label: "Text", short: "T", cat: "Content", dw: 10, dh: 4, mw: 2, mh: 1, xw: 16, xh: 12, y: 0, d: "A title and some words." },
    { id: "piano", label: "Piano", short: "P", cat: "Content", dw: 16, dh: 5, mw: 4, mh: 2, xw: 16, xh: 12, y: 0, d: "An interactive piano that fills the module's height. It shows no note unless you ask." },
    { id: "container", label: "Container", short: "C", cat: "Layout", dw: 10, dh: 6, mw: 2, mh: 2, xw: 16, xh: 12, y: 0, d: "A box that holds other modules, and other containers. Drag modules onto it, select it and use Add module, or select several modules and Group them. Resizing it resizes what is inside." },
    { id: "next", label: "Next arrow", short: "N", cat: "Controls", single: true, dw: 4, dh: 2, mw: 2, mh: 1, xw: 8, xh: 3, y: "bottom", d: "A big Next arrow button. One per slide." },
    { id: "blank", label: "Blank", short: "B", cat: "Other", dw: 4, dh: 3, mw: 1, mh: 1, xw: 16, xh: 12, y: 0, d: "Placeholder: nothing yet." }
  ];
  var LS_ANIMS = [ { id: "none", label: "None" }, { id: "fade", label: "Fade" }, { id: "pop", label: "Pop" }, { id: "left", label: "From left" }, { id: "right", label: "From right" }, { id: "up", label: "From above" }, { id: "down", label: "From below" } ];
  var LS_OUTS = [ { id: "none", label: "None" }, { id: "fade", label: "Fade" }, { id: "pop", label: "Shrink" }, { id: "left", label: "To left" }, { id: "right", label: "To right" }, { id: "up", label: "Up" }, { id: "down", label: "Down" } ];
  var LS_FLAGS = [ { id: "", label: "No flag" }, { id: "done", label: "Done" }, { id: "placeholder", label: "Placeholder" }, { id: "idea", label: "Idea" } ];
  var PK_NAMES = ["C", "C♯ / D♭", "D", "D♯ / E♭", "E", "F", "F♯ / G♭", "G", "G♯ / A♭", "A", "A♯ / B♭", "B"];
  var HA = { left: "flex-start", center: "center", right: "flex-end" }, VA = { top: "flex-start", middle: "center", bottom: "flex-end" };
  function lsKind(id){ return LS_KINDS.filter(function(k){ return k.id === id; })[0] || { id: id, label: id, short: "?", dw: 4, dh: 3, mw: 1, mh: 1, xw: GC, xh: GR }; }
  function lessonKey(typeId, levelId){ return typeId + ":" + levelId; }
  function lessonSlides(typeId, levelId){ var l = lessons[lessonKey(typeId, levelId)]; return l && Array.isArray(l.slides) ? l.slides : []; }
  function saveLessons(){ dbSet("noteid-lessons-v1", { v: 6, lessons: lessons, layouts: lsLayouts, walks: walks }); }
  function boxesOf(sl){ return (sl && sl.boxes) || []; }
  function boxOfKind(sl, kind){ return boxesOf(sl).filter(function(b){ return b.kind === kind; })[0] || null; }
  // the box that holds the answers / helper / message settings: the single module, or the whole Practice game
  function ansBox(sl){ return boxOfKind(sl, "answer") || boxOfKind(sl, "game"); }
  function helpBox(sl){ return boxOfKind(sl, "helper") || boxOfKind(sl, "game"); }
  function msgBox(sl){ return boxOfKind(sl, "message") || boxOfKind(sl, "game"); }
  function qBox(sl){ return boxOfKind(sl, "question") || boxOfKind(sl, "game"); }
  function overlap(a, b){ return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h; }
  function cy(b){ return b.y + b.h / 2; }
  function lsGridR(){ return { x0: 0, y0: 0, x1: GC, y1: GR }; }
  function lsInner(p){ return { x0: p.x + 0.5, y0: p.y + (p.title ? 1.5 : 0.5), x1: p.x + p.w - 0.5, y1: p.y + p.h - 0.5 }; }
  function lsChildren(sl, id){ return boxesOf(sl).filter(function(b){ return b.parent === id; }); }
  function lsBBox(list){
    if (!list.length) return null; var r = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
    list.forEach(function(b){ r.x0 = Math.min(r.x0, b.x); r.y0 = Math.min(r.y0, b.y); r.x1 = Math.max(r.x1, b.x + b.w); r.y1 = Math.max(r.y1, b.y + b.h); }); return r;
  }
  function lsBounds(sl, b){ var p = b.parent ? boxesOf(sl).filter(function(x){ return x.id === b.parent; })[0] : null; return p ? lsInner(p) : lsGridR(); }
  function lsById(sl, id){ return boxesOf(sl).filter(function(b){ return b.id === id; })[0] || null; }
  function lsDepth(sl, b){ var d = 0, p = b; while (p && p.parent && d < 30) { p = lsById(sl, p.parent); d++; } return d; }
  function lsIsAnc(sl, a, b){ var p = b, n = 0; while (p && p.parent && n < 30) { if (p.parent === a.id) return true; p = lsById(sl, p.parent); n++; } return false; }
  function lsDesc(sl, ids){ var out = ids.slice(), grew = true; while (grew) { grew = false; boxesOf(sl).forEach(function(b){ if (b.parent && out.indexOf(b.parent) !== -1 && out.indexOf(b.id) === -1) { out.push(b.id); grew = true; } }); } return out; }
  function lsNorm(sl, ids){ return ids.filter(function(id, i){ if (ids.indexOf(id) !== i) return false; var b = lsById(sl, id); if (!b) return false; return !ids.some(function(o){ var a = lsById(sl, o); return a && a !== b && lsIsAnc(sl, a, b); }); }); }
  function lsOneOnly(b){ var k = lsKind(b.kind); return !!(k.els || k.single); }
  function lsMinW(sl, b){ var k = lsKind(b.kind); if (b.kind === "container") return lsLim(b, lsKidsSnap(sl, b)).Wmin; return k.mw; }
  function lsMinH(sl, b){ var k = lsKind(b.kind); if (b.kind === "container") return lsLim(b, lsKidsSnap(sl, b)).Hmin; return k.mh; }
  function newBox(kind, R){
    var k = lsKind(kind); R = R || lsGridR();
    var rw = R.x1 - R.x0, rh = R.y1 - R.y0, w = Math.min(k.dw, rw), h = Math.min(k.dh, rh);
    var b = { id: uid(), lid: uid(), kind: kind, parent: "", x: R.x0 + Math.floor((rw - w) / 2 * 2) / 2, y: k.y === "bottom" ? R.y1 - h : R.y0 + Math.min(k.y || 0, rh - h), w: w, h: h, ha: "center", va: "middle", title: "", text: "", helper: "", walk: false, wFrom: 1, wTo: 0, wPlace: "restart", wNext: "normal", count: 5, label: "Next", plain: false, style: "card",
      pk: { target: "none", names: true, start: "c", goal: "none", n: 3 }, anim: { "in": "none", out: "none", change: "glide" } };
    if (kind === "text") { b.title = "New text"; b.text = "Say something here."; }
    return b;
  }
  function kindTaken(sl, kind){
    var k = lsKind(kind), bx = boxesOf(sl);
    if (k.single && bx.some(function(b){ return b.kind === kind; })) return "Only one per slide";
    if (!k.els) return "";
    for (var i = 0; i < bx.length; i++) { var o = lsKind(bx[i].kind); if (o.els && o.els.some(function(e){ return k.els.indexOf(e) !== -1; })) return "Already on this slide (" + o.label + ")"; }
    return "";
  }
  // Adding a module: it takes its standard place; whatever it overlaps is bumped away (shrinking toward its smallest size) so everything still fits. Returns null when there is no room.
  // when pushing pairs apart is not enough: stack everything top to bottom and shrink the roomiest modules until it fits
  function repackAdd(sl, sib, nb, R){
    var W = sib.map(function(b){ return { id: b.id, kind: b.kind, x: b.x, y: b.y, w: b.w, h: b.h, ref: b }; }), N = { id: nb.id, kind: nb.kind, x: nb.x, y: nb.y, w: nb.w, h: nb.h, ref: null };
    W.push(N); var order = W.slice().sort(function(a, b){ return a.y !== b.y ? a.y - b.y : (a === N ? -1 : b === N ? 1 : 0); });
    function mh(b){ return b.ref ? lsMinH(sl, b.ref) : lsKind(b.kind).mh; }
    var room = R.y1 - R.y0, total = order.reduce(function(t, b){ return t + b.h; }, 0), minSum = order.reduce(function(t, b){ return t + mh(b); }, 0);
    if (minSum > room) return null;
    while (total > room) {
      var best = null; order.forEach(function(b){ var slack = b.h - mh(b); if (slack > 0 && (!best || slack > best.h - mh(best))) best = b; });
      if (!best) return null; best.h--; total--;
    }
    var y = R.y0; order.forEach(function(b){ b.y = y; y += b.h; });
    return W;
  }
  function bumpPairs(sl, sib, nb, R){
    var W = sib.map(function(b){ return { id: b.id, kind: b.kind, x: b.x, y: b.y, w: b.w, h: b.h, ref: b }; });
    var N = { id: nb.id, kind: nb.kind, x: nb.x, y: nb.y, w: nb.w, h: nb.h, ref: null }; W.push(N);
    var pinned = {}; pinned[N.id] = true;
    function minh(b){ return b.ref ? lsMinH(sl, b.ref) : lsKind(b.kind).mh; }
    for (var guard = 0; guard < 300; guard++) {
      var pair = null;
      for (var i = 0; i < W.length && !pair; i++) for (var j = i + 1; j < W.length; j++) if (overlap(W[i], W[j]) && !(pinned[W[i].id] && pinned[W[j].id])) { pair = [W[i], W[j]]; break; }
      if (!pair) break;
      var a = pair[0], b = pair[1], mover = pinned[a.id] ? b : pinned[b.id] ? a : (cy(a) >= cy(b) ? a : b), other = mover === a ? b : a, down = cy(mover) >= cy(other);
      var tryDown = function(){ var y = other.y + other.h; if (y + mover.h <= R.y1) { mover.y = y; return true; } var h = R.y1 - y; if (h >= minh(mover)) { mover.y = y; mover.h = h; return true; } return false; };
      var tryUp = function(){ var y = other.y - mover.h; if (y >= R.y0) { mover.y = y; return true; } var h = other.y - R.y0; if (h >= minh(mover)) { mover.y = R.y0; mover.h = h; return true; } return false; };
      if (!(down ? (tryDown() || tryUp()) : (tryUp() || tryDown()))) return null;
      pinned[mover.id] = true;
    }
    for (var p = 0; p < W.length; p++) for (var q = p + 1; q < W.length; q++) if (overlap(W[p], W[q])) return null;
    return W;
  }
  // a new slide starts as the previous one: every module is copied and LINKED (same lid)
  function lsMiniBox(b){
    var inner = "";
    if (b.kind === "game") inner = '<i class="lmg1"></i><i class="lmg2"></i><i class="lmg3"></i>';
    else if (b.kind === "text") inner = '<i class="lmt"></i><i class="lmt s"></i>';
    else if (b.kind === "next") inner = '<i class="lmn"></i>';
    return '<span class="lmb lmk-' + b.kind + '" style="left:' + (b.x / GC * 100) + '%;top:' + (b.y / GR * 100) + '%;width:' + (b.w / GC * 100) + '%;height:' + (b.h / GR * 100) + '%">' + inner + '</span>';
  }
  // real thumbnails: a copy of what the slide looks like on the stage, taken when the slide is left / edited
  function lsSnap1(sl){
    if (!lessonEd || !lsEdit() || !sl) return; var g = $g("gameRoot"); if (!g || !g.querySelector("#lcv")) return;
    var c = g.cloneNode(true); [].forEach.call(c.querySelectorAll(".llinks,.lframe,.lmarq,.lseam,.lexit,.lguide,.lg-v,.lg-h"), function(x){ x.remove(); });
    [].forEach.call(c.querySelectorAll(".lsel,.lproxy,.lbad,.ldrop,.grid,.ledit"), function(x){ ["lsel", "lproxy", "lbad", "ldrop", "grid", "ledit"].forEach(function(k){ x.classList.remove(k); }); });
    c.classList.remove("ledit"); if (!lessonEd.snaps) lessonEd.snaps = {};
    lessonEd.snaps[sl.id] = { w: g.offsetWidth, h: g.offsetHeight, html: c.innerHTML.replace(/ id="[^"]*"/g, "").replace(/ data-action="[^"]*"/g, "").replace(/ data-bid="[^"]*"/g, "") };
  }
  function lsThumb(sl, live){
    if (live) lsSnap1(sl);
    var n = lessonEd && lessonEd.snaps && lessonEd.snaps[sl.id]; if (!n || !n.w) return lsMini(boxesOf(sl));
    return '<span class="lm real" style="aspect-ratio:' + n.w + ' / ' + n.h + '"><div class="game lcvmode lmr" data-w="' + n.w + '" style="width:' + n.w + 'px;height:' + n.h + 'px">' + n.html + '</div></span>';
  }
  function lsFitThumbs(){
    [].forEach.call(document.querySelectorAll(".lm.real"), function(m){ var r = m.firstElementChild; if (!r) return; var w = m.clientWidth, k = parseFloat(r.getAttribute("data-w")) || 800; if (w) r.style.transform = "scale(" + (w / k) + ")"; });
  }
  function lsPrime(){
    var s = currentSession; if (!s || !lessonEd || !s.lesson || !lsEdit()) return;
    var sl = lessonSlides(lessonEd.typeId, lessonEd.levelId), keep = lessonEd.sel;
    for (var i = 0; i < sl.length; i++) if (i !== keep) { lessonGo(s, i); lsSnap1(sl[i]); }
    lessonGo(s, keep);
  }
  function lsMini(boxes){
    var ord = boxes.filter(function(b){ return b.kind === "container"; }).concat(boxes.filter(function(b){ return b.kind !== "container"; }));
    return '<span class="lm">' + ord.map(lsMiniBox).join("") + '</span>';
  }
  function lsGlyph(kind){ var k = lsKind(kind), h = Math.max(k.dh, 2.5), w = Math.max(k.dw, 4); return lsMini([{ kind: kind, x: (GC - w) / 2, y: (GR - h) / 2, w: w, h: h }]); }
  function lsWalkSteps(s, hb){
    var w = lsWalk(s.type.id), out = [];
    if (w.mode !== "custom") out = explain(s.type, s.q, s.level).filter(function(x){ return !x.answer; });
    if (w.mode !== "auto") w.steps.forEach(function(st){ out.push({ t: fillRaw(st.t || "", s), x: fillRaw(st.x || "", s) }); });
    return out;
  }
  var lsLayouts = [];
  function lsBuiltinLayouts(){
    function bx(kind, x, y, w, h, o){ var b = newBox(kind); b.x = x; b.y = y; b.w = w; b.h = h; return Object.assign(b, o || {}); }
    return [
      { id: "b-text", name: "Title and text", builtin: true, boxes: [ bx("text", 3, 2, 10, 6, { title: "Title", text: "Words go here." }), bx("next", 6, 9, 4, 2) ] },
      { id: "b-qa", name: "Question and answers", builtin: true, boxes: [ bx("question", 0, 0, 16, 6), bx("message", 0, 6, 16, 1), bx("helper", 0, 7, 16, 1), bx("answer", 0, 8, 16, 4) ] },
      { id: "b-walk", name: "Walk, question and answers", builtin: true, boxes: [ bx("question", 0, 0, 16, 5), bx("message", 0, 5, 16, 1), bx("helper", 0, 6, 16, 2, { walk: true }), bx("answer", 0, 8, 16, 4) ] },
      { id: "b-game", name: "Full game", builtin: true, boxes: [ bx("game", 0, 0, 16, 12) ] },
      { id: "b-piano", name: "Piano and words", builtin: true, boxes: [ bx("text", 0, 0, 16, 3, { title: "Explore", text: "Press some keys." }), bx("piano", 0, 3, 16, 7), bx("message", 0, 10, 16, 1) ] }
    ];
  }
  // copy a layout's modules into a slide with fresh ids (parents re-pointed)
  function lsLayoutBoxes(lay){
    var map = {}, copy = JSON.parse(JSON.stringify(lay.boxes));
    copy.forEach(function(b){ map[b.id] = uid(); });
    copy.forEach(function(b){ b.id = map[b.id]; b.lid = uid(); b.parent = b.parent ? (map[b.parent] || "") : ""; });
    return copy;
  }
  function lsFindLayout(id){ return lsBuiltinLayouts().concat(lsLayouts).filter(function(l){ return l.id === id; })[0] || null; }
  var walks = {};
  function lsWalk(typeId){ var w = walks[typeId]; if (!w) w = walks[typeId] = { mode: "auto", steps: [] }; if (!Array.isArray(w.steps)) w.steps = []; if (!w.mode) w.mode = "auto"; return w; }
  function lsWalkPlan(slides, idx, total){
    var pos = 0, plan = null;
    for (var i = 0; i <= idx && i < slides.length; i++) {
      var hb = helpBox(slides[i]); if (!hb || !hb.walk) continue;
      var from = Math.max(1, parseInt(hb.wFrom, 10) || 1) - 1, to = parseInt(hb.wTo, 10) || 0, last = Math.min(to || total, total) - 1, base = hb.wPlace === "continue" ? Math.max(from, pos) : from;
      if (i === idx) plan = { base: base, first: from, last: last };
      pos = last + 1;
    }
    return plan;
  }
  function lsSnapStr(){ var k = lessonKey(lessonEd.typeId, lessonEd.levelId); return JSON.stringify({ l: lessons[k], w: walks[lessonEd.typeId] || null }); }
  function slideFrom(prev){
    var sl = { id: uid(), title: "", flag: "", note: "", sq: true, adv: { mode: prev && prev.adv ? prev.adv.mode : "auto" }, overlap: !!(prev && prev.overlap), boxes: [] };
    if (prev) { var idm = {}, cp = JSON.parse(JSON.stringify(prev.boxes)); cp.forEach(function(b){ idm[b.id] = uid(); }); sl.boxes = cp.map(function(b){ b.id = idm[b.id]; b.parent = b.parent ? (idm[b.parent] || "") : ""; return b; }); }
    return sl;
  }
  function starterLesson(){
    var a = { id: uid(), title: "Introduction", flag: "", note: "", sq: false, adv: { mode: "auto" }, boxes: [] }, t = newBox("text");
    t.title = "Today"; t.text = "Describe the new skill here."; t.x = 3; t.y = 3; t.w = 10; t.h = 5; a.boxes.push(t);
    var g = { id: uid(), title: "Practice", flag: "", note: "", sq: false, adv: { mode: "auto" }, boxes: [ newBox("game") ] };
    return { slides: [a, g] };
  }
  // v12 steps -> v15 parts -> v16 / v17 boxes
  function convertOldLesson(old){
    var slides = (old.steps || []).map(function(st){
      var sl = { id: uid(), title: st.title || "", flag: st.flag || "", note: st.note || "", sq: false, parts: { prompt: null, message: null, helper: null, answer: null } };
      var P = sl.parts; function it(type, o){ return Object.assign({ type: type, title: "", text: "", helper: "", count: 5, shuffle: true, anim: { "in": "none", out: "none", move: "" } }, o || {}); }
      if (st.type === "say") { var slot = st.slot === "feedback" ? "message" : st.slot === "helper" ? "helper" : "prompt"; if (slot !== "prompt") P.prompt = it("question"); P[slot] = it("text", { title: st.title || "", text: st.text || "" }); P.answer = it("next"); }
      else if (st.type === "walk") { P.prompt = it("question"); P.helper = it("walk"); P.answer = it("ask", { count: 1 }); }
      else if (st.type === "ask") { P.prompt = it("question"); P.answer = it("ask", { count: parseInt(st.count, 10) || 5 }); if (st.helpers && st.helpers[0]) P.helper = it("helper", { helper: st.helpers[0] }); }
      else if (st.type === "helper") { P.prompt = it("question"); if (st.helpers && st.helpers[0]) P.helper = it("helper", { helper: st.helpers[0] }); P.answer = it("next"); }
      else if (st.type === "shuffle") { P.prompt = it("piano"); P.answer = it("next"); }
      else { P.prompt = it("blank"); P.answer = it("next"); }
      return sl;
    });
    return { slides: slides };
  }
  function partsToBoxes(sl){
    var P = sl.parts, boxes = [];
    function mk(kind, g, it){ var b = newBox(kind); b.x = g[0]; b.y = g[1]; b.w = g[2]; b.h = g[3]; if (it) { b.title = it.title || ""; b.text = it.text || ""; b.count = parseInt(it.count, 10) || 5; if (it.anim) b.anim = { "in": it.anim["in"] || "none", out: it.anim.out || "none", change: "glide" }; } boxes.push(b); return b; }
    var p = P.prompt, m = P.message, h = P.helper, a = P.answer, b;
    if (p) { if (p.type === "question") mk("question", [0, 0, 16, 6], p); else if (p.type === "text") mk("text", [0, 0, 16, 6], p); else if (p.type === "piano") { b = mk("piano", [0, 0, 16, 6], p); b.pk.start = p.shuffle !== false ? "shuffle" : "c"; } else mk("blank", [0, 0, 16, 6], p); }
    if (m) { if (m.type === "text") mk("message", [0, 6, 16, 1], m); else mk("blank", [0, 6, 16, 1], m); }
    if (h) { if (h.type === "helper") { b = mk("helper", [0, 7, 16, 2], h); b.helper = h.helper || ""; } else if (h.type === "walk") { b = mk("helper", [0, 7, 16, 2], h); b.walk = true; } else if (h.type === "text") mk("text", [0, 7, 16, 2], h); else mk("blank", [0, 7, 16, 2], h); }
    if (a) { if (a.type === "ask") mk("answer", [0, 8, 16, 4], a); else if (a.type === "next") mk("next", [6, 9, 4, 2], a); else mk("blank", [0, 8, 16, 4], a); }
    sl.boxes = boxes; sl.adv = { mode: "auto" }; delete sl.parts; return sl;
  }
  function migrateLesson(l){
    if (l && !l.slides && Array.isArray(l.steps)) l = convertOldLesson(l);
    if (l && Array.isArray(l.slides)) l.slides.forEach(function(sl){
      if (sl.parts && !sl.boxes) partsToBoxes(sl); if (!sl.boxes) sl.boxes = []; if (!sl.adv) sl.adv = { mode: "auto" };
      sl.boxes.forEach(function(b){
        if (!b.lid) b.lid = b.id; if (!b.ha) b.ha = "center"; if (!b.va) b.va = "middle"; if (b.parent === undefined) b.parent = "";
        if (!b.wFrom) b.wFrom = 1; if (!b.wTo) b.wTo = 0; if (!b.wPlace) b.wPlace = "restart"; if (!b.wNext) b.wNext = "normal"; if (!b.style) b.style = "card";
        if (!b.anim) b.anim = { "in": "none", out: "none", change: "glide" }; if (!b.anim.change) b.anim.change = (b.anim.move === false ? "none" : "glide"); delete b.anim.move;
        if (!b.pk) b.pk = { target: "none", names: true, start: "c", goal: "none", n: 3 }; if (!b.pk.start) b.pk.start = b.pk.shuffle ? "shuffle" : "c"; delete b.pk.shuffle;
      });
    });
    return l;
  }
  function slideFlag(sl){ if (sl.flag) return sl.flag; return boxesOf(sl).some(function(b){ return b.kind === "blank"; }) ? "placeholder" : ""; }
  function openFlagCount(slides){ return slides.filter(function(s){ var f = slideFlag(s); return f === "placeholder" || f === "idea"; }).length; }
  function slideHasAsk(sl){ return !!ansBox(sl); }
  function lessonHasAsk(s){ var sl = lessonSlides(s.type.id, s.level.id)[s.lesson.idx]; return slideHasAsk(sl); }
  function slideWalks(sl){ var h = helpBox(sl); return !!(h && h.walk); }
  function slideNeeds(sl){
    var n = [], hb = helpBox(sl), trig = !!(hb && hb.walk && hb.wNext === "range");
    if (slideHasAsk(sl) && !trig) n.push("ask");
    boxesOf(sl).forEach(function(b){ if (b.kind === "piano" && b.pk && b.pk.goal === "touch") n.push("touch:" + b.id); });
    if (slideWalks(sl) && (!slideHasAsk(sl) || trig)) n.push("walk");
    return n;
  }

  var lessonEd = null;   // { typeId, levelId, mode: "edit" | "present", sel: slide index, box: box id | "", hist: {undo, redo}, menu, warn, previewing }
  function lsEdit(){ return !!(lessonEd && lessonEd.mode === "edit" && !lessonEd.previewing); }
  function attachLesson(s){
    if (s.demo || s.student || s.mode !== "learn") return false;
    if (!lessonSlides(s.type.id, s.level.id).length) return false;
    s.lesson = { idx: 0, done: 0 }; s.phase = "lesson";
    return true;
  }
  function openLesson(typeId, levelId){
    if (!dataReady) return;
    var k = lessonKey(typeId, levelId);
    if (!lessons[k] || !lessons[k].slides || !lessons[k].slides.length) { lessons[k] = starterLesson(); saveLessons(); }
    dropSession();
    view = "hub"; hubTypeId = typeId; hubLevelId = levelId;
    fontsPromise.then(function(){
      if (!beginSession(typeId, levelId, { mode: "learn" })) { renderApp(); return; }
      var s = currentSession; s.lesson = { idx: 0, done: 0 }; s.phase = "lesson";
      lessonEd = { typeId: typeId, levelId: levelId, mode: "edit", sel: 0, box: "", ids: [], hist: { undo: [], redo: [] }, menu: false, lmenu: false, lname: "", warn: "", previewing: false };
      renderApp(); setTimeout(lsPrime, 60);
    });
  }
  // ----- undo / redo: whole-lesson snapshots -----
  function lsPush(){ if (!lessonEd) return; var h = lessonEd.hist; h.undo.push(lsSnapStr()); if (h.undo.length > 150) h.undo.shift(); h.redo = []; }
  function lsRestore(from, to){
    var s = currentSession; if (!lessonEd || !s || !from.length) return;
    var k = lessonKey(lessonEd.typeId, lessonEd.levelId); to.push(lsSnapStr());
    var o = JSON.parse(from.pop()); lessons[k] = o.l; if (o.w) walks[lessonEd.typeId] = o.w; else delete walks[lessonEd.typeId]; saveLessons();
    var n = lessons[k].slides.length; lessonEd.sel = Math.min(lessonEd.sel, n - 1); lsPrune();
    lessonGo(s, lessonEd.sel);
  }
  function lsUndo(){ if (lessonEd) lsRestore(lessonEd.hist.undo, lessonEd.hist.redo); }
  function lsRedo(){ if (lessonEd) lsRestore(lessonEd.hist.redo, lessonEd.hist.undo); }
  function lcvEl(){ return document.getElementById("lcv"); }
  function boxEl(id){ var c = lcvEl(); return c ? c.querySelector('[data-bid="' + id + '"]') : null; }
  function geomStyle(b){ return "left:calc(" + (b.x * 100 / GC) + "% + 3px);top:calc(" + (b.y * 100 / GR) + "% + 3px);width:calc(" + (b.w * 100 / GC) + "% - 6px);height:calc(" + (b.h * 100 / GR) + "% - 6px)"; }
  function alignStyle(b){ return "justify-content:" + (HA[b.ha] || "center") + ";align-items:" + (VA[b.va] || "center") + ";text-align:" + (b.ha || "center") + ";"; }
  function lessonGo(s, idx, opts){
    opts = opts || {};
    var slides = lessonSlides(s.type.id, s.level.id), prevSlide = slides[s.lesson.idx];
    if (s.timer) clearTimeout(s.timer);
    if (lessonEd && prevSlide) lsSnap1(prevSlide);
    s.lesson.idx = Math.max(0, Math.min(idx, Math.max(0, slides.length - 1))); s.lesson.done = 0; s.lesson.walked = false; s.lesson.met = {}; s.lesson.touched = {}; s.lesson.pk = {};
    s.picked = []; s.firstTry = true;
    if (lessonEd) { lessonEd.sel = s.lesson.idx; var sl = slides[s.lesson.idx]; lsPrune(); }
    lessonRender(s, opts.trans ? { trans: prevSlide } : {});
    lessonPanelRefresh();
  }
  function lsClearAnim(el){ if (!el) return; el.className = el.className.replace(/\bla-(in|out)[-\w]*/g, "").replace(/\s+/g, " ").trim(); el.style.transition = ""; el.style.transform = ""; el.style.transformOrigin = ""; }
  function lsPlayIn(el, kind){ if (!el || !kind || kind === "none") return; lsClearAnim(el); void el.offsetWidth; el.classList.add("la-in", "la-in-" + kind); }
  function lsPlayOut(el, kind){ if (!el || !kind || kind === "none") return; lsClearAnim(el); void el.offsetWidth; el.classList.add("la-out-" + kind); }
  // a module that stays: glide (move + resize) from where it was on the previous slide
  function lsMove(el, from, to){
    var c = lcvEl(); if (!el || !c || !from) return;
    if (from.x === to.x && from.y === to.y && from.w === to.w && from.h === to.h) return;
    var cw = c.offsetWidth / GC, ch = c.offsetHeight / GR;
    el.style.transition = "none"; el.style.transformOrigin = "top left";
    el.style.transform = "translate(" + ((from.x - to.x) * cw) + "px," + ((from.y - to.y) * ch) + "px) scale(" + (from.w / to.w) + "," + (from.h / to.h) + ")";
    void el.offsetWidth; el.style.transition = "transform .6s ease"; el.style.transform = "";
    setTimeout(function(){ el.style.transition = ""; el.style.transformOrigin = ""; }, 700);
  }
  function byLid(sl, lid){ return boxesOf(sl).filter(function(b){ return b.lid === lid; })[0] || null; }
  // leaving a slide (Present): the modules the next slide drops go out first, then the next slide arrives
  function lessonAdvance(s){
    var slides = lessonSlides(s.type.id, s.level.id), sl = slides[s.lesson.idx], next = slides[s.lesson.idx + 1], any = false;
    if (!lsEdit() && sl && next) boxesOf(sl).forEach(function(b){ if (!byLid(next, b.lid) && b.anim && b.anim.out && b.anim.out !== "none") { lsPlayOut(boxEl(b.id), b.anim.out); any = true; } });
    if (!any) { lessonNext(s); return; }
    s.phase = "leaving";
    s.timer = setTimeout(function(){ if (currentSession !== s) return; lessonNext(s); }, 430);
  }
  function lessonNext(s){
    var slides = lessonSlides(s.type.id, s.level.id);
    if (s.lesson.idx >= slides.length - 1) {
      if (lsEdit()) { s.phase = "lesson"; setFeedback("neutral", "That was the last slide"); return; }
      s.phase = "lesson-done"; lessonRender(s); return;
    }
    lessonGo(s, s.lesson.idx + 1, { trans: !lsEdit() });
  }
  function lessonQuestion(s){
    s.q = makeQuestion(s.type, s.level, s.pool, s.q && s.q.name);
    if (!s.q.pk) s.q.pk = choosePianoWindow(noteSemitoneClass(s.q.name));
    s.qid++; s.h = {}; s.picked = []; s.firstTry = true; s.menuOpen = false; s.stepIdx = 0; s.steps = [];
  }
  function lessonShowNext(s){
    var c = lcvEl(); if (!c || c.querySelector(".lnext-float")) return;
    c.insertAdjacentHTML("beforeend", '<button type="button" class="coach-btn go lnext-float" data-action="lesson-next">Next ▶</button>');
  }
  function lessonCheck(s){
    var slides = lessonSlides(s.type.id, s.level.id), sl = slides[s.lesson.idx], L = s.lesson;
    if (!sl || lsEdit()) return;
    var need = slideNeeds(sl), done = need.every(function(k){ return L.met && L.met[k]; });
    if (!need.length || !done) return;
    if (sl.adv && sl.adv.mode === "button") { if (!boxOfKind(sl, "next")) lessonShowNext(s); } else lessonAdvance(s);
  }
  // the piano module: fills the module's height; the width follows (taller = fewer keys). Starts on C or somewhere shuffled.
  function lsPianoPlan(b, W, H, s, prev){
    var Hin = Math.max(40, H - 19), n = Math.max(3, Math.min(22, Math.floor((W - 28) * 4 / Hin))), pc = b.pk.target === "question" ? noteSemitoneClass(s.q.name) : null, j;
    function insts(j0, nn){ var out = []; if (pc === null) return out; for (j = j0; j < j0 + nn; j++) if (whitePc(j) === pc) out.push("w" + j); for (j = j0; j < j0 + nn - 1; j++) if (hasBlackAfter(j) && (whitePc(j) + 1) % 12 === pc) out.push("b" + j); return out; }
    var cands = []; for (j = 0; j + n <= STRIP; j++) if (START_LETTERS.indexOf(LETTERS[j % 7]) !== -1) cands.push(j);
    var j0 = b.pk.start === "c" ? 7 : (prev && prev.j0 !== undefined && prev.j0 + n <= STRIP ? prev.j0 : pick(cands.length ? cands : [7]));
    if (pc !== null && !insts(j0, n).length) { var ok = cands.filter(function(c){ return insts(c, n).length; }); if (ok.length) j0 = pick(ok); }
    while (n > 3 && j0 + n - 1 < STRIP && hasBlackAfter(j0 + n - 1)) n--;
    var ins = insts(j0, n); return { j0: j0, n: n, key: ins.length ? (prev && prev.key && ins.indexOf(prev.key) !== -1 ? prev.key : pick(ins)) : null, Hin: Hin };
  }
  function lessonDrawPiano(s, b){
    var el = boxEl(b.id); if (!el) return; var card = el.querySelector(".lpk-card"), inner = el.querySelector(".lpk-in"), cap = el.querySelector(".lpk-cap"), L = s.lesson, edit = lsEdit();
    var W = el.clientWidth, H = el.clientHeight; if (!W || !H) return;
    var pl = L.pk[b.id] = lsPianoPlan(b, W, H, s, L.pk[b.id]);
    card.style.height = H + "px"; card.style.width = Math.min(W, Math.ceil(pl.Hin * pl.n / 4) + 28) + "px";
    renderPiano(inner, { j0: pl.j0, win: pl.n, target: pl.key, interactive: !edit, onKey: function(cls, kel, kid){
      kel.classList.add("picked");
      var set = (L.touched[b.id] = L.touched[b.id] || {}); set[kid] = true; var cnt = Object.keys(set).length;
      if (cap && b.pk.names !== false) cap.textContent = PK_NAMES[cls] || "";
      if (b.pk.goal === "touch") { var need = Math.max(1, parseInt(b.pk.n, 10) || 3); if (cap && b.pk.names === false) cap.textContent = cnt + " / " + need; if (cnt >= need) { L.met["touch:" + b.id] = true; lessonCheck(s); } }
    } });
  }
  function lessonBoxHtml(b){
    var k = lsKind(b.kind), id = (k.els && k.els.length === 1) ? ' id="' + k.els[0] + '"' : "", inner = "", cls = "lbox k-" + b.kind + (k.cls ? " " + k.cls : "");
    if (b.kind === "text") { cls += b.plain ? " lplain" : " lcard"; inner = '<div class="lsay"><div class="lsay-t">' + escapeHtml(b.title || "") + '</div><div class="lsay-x">' + escapeHtml(b.text || "") + '</div></div>'; }
    else if (b.kind === "next") inner = '<button type="button" class="coach-btn go lnextbtn" data-action="lesson-next">' + escapeHtml(b.label || "Next") + ' ▶</button>';
    else if (b.kind === "piano") inner = '<div class="lpk-card prompt-card"><div class="lpk-in"></div><div class="lpk-cap"></div></div>';
    else if (b.kind === "container") { cls += " lc-" + (b.style || "card"); inner = b.title ? '<div class="lcont-t">' + escapeHtml(b.title) + '</div>' : ""; }
    else if (b.kind === "game") inner = '<div class="prompt-card" id="promptArea"></div><div class="fbwrap"><div class="feedback" id="feedbackRow"></div></div><div id="helperArea" class="helpers"></div><div class="answer-panel" id="answerArea"></div>';
    return '<div class="' + cls + '"' + id + ' data-bid="' + b.id + '" data-label="' + k.label + '" style="' + geomStyle(b) + ";" + (b.kind === "game" || b.kind === "container" ? "" : alignStyle(b)) + '">' + inner + '</div>';
  }
  function lessonRender(s, o){
    o = o || {};
    var game = $g("gameRoot"); if (!game || !s.lesson) return;
    var slides = lessonSlides(s.type.id, s.level.id), L = s.lesson, sl = slides[L.idx], edit = lsEdit();
    if (!L.met) { L.met = {}; L.touched = {}; L.pk = {}; }
    [].slice.call(game.children).forEach(function(c){ if (!c.classList.contains("hud")) c.remove(); });
    game.classList.add("lcvmode"); game.classList.toggle("ledit", edit);
    if (s.phase === "lesson-done" || !sl) {
      game.insertAdjacentHTML("beforeend", '<div class="lost-overlay won"><div class="big">Lesson complete</div><div class="sub">' + (s.correct || 0) + ' right in the questions.</div>' +
        '<div class="ov-btns"><button type="button" class="coach-btn" data-action="lesson-restart">Again</button><button type="button" class="coach-btn go" data-action="end-practice">Done</button></div></div>');
      return;
    }
    if (!o.again && !(sl.sq && s.q)) lessonQuestion(s);
    if (!s.q) lessonQuestion(s);
    var bx = boxesOf(sl), have = {}; bx.forEach(function(b){ lsKind(b.kind).els && lsKind(b.kind).els.forEach(function(e){ have[e] = true; }); });
    var html = '<div class="lcv' + (edit ? " grid" : "") + '" id="lcv">' + lsRenderOrder(sl).map(lessonBoxHtml).join("");
    ["promptArea", "feedbackRow", "helperArea", "answerArea"].forEach(function(e){ if (!have[e]) html += '<div id="' + e + '" style="display:none"></div>'; });
    html += '</div>' + (lessonEd ? "" : '<button type="button" class="lexit" data-action="end-practice" title="Stop the lesson">✕ Stop</button>');
    game.insertAdjacentHTML("beforeend", html);
    var promptArea = $g("promptArea"), answerArea = $g("answerArea"), hb = helpBox(sl), ab = ansBox(sl), mb = msgBox(sl);
    s.active = []; s.steps = []; s.phase = "lesson"; staffAnswer = null;
    if (hb && hb.helper) { var hh = helperById(hb.helper); if (hh && hh.applies(s.type)) s.active = [hb.helper]; }
    var skipWalk = false; s.walkTrig = !!(hb && hb.walk && hb.wNext === "range"); s.stepNum0 = 0;
    if (hb && hb.walk && !L.walked) {
      var allSteps = lsWalkSteps(s, hb), plan = lsWalkPlan(slides, L.idx, allSteps.length);
      if (plan && allSteps.length && plan.base <= plan.last && plan.first <= plan.last) { s.steps = allSteps.slice(plan.first, plan.last + 1); s.stepNum0 = plan.first; s.stepIdx = plan.base - plan.first; s.phase = "walk"; }
      else { L.walked = true; L.met.walk = true; skipWalk = true; }
    }
    if (ab && s.phase !== "walk") s.phase = "answer";
    if (have.promptArea) { try { renderPromptDomain(s.type, promptArea, s.q, s.level, ""); } catch (e) { promptArea.innerHTML = ""; } }
    if (have.answerArea) { try { staffAnswer = renderAnswerDomain(s.type, answerArea, s.q, s.level, handleAnswer, ""); } catch (e) { answerArea.innerHTML = ""; } }
    bx.forEach(function(b){ if (b.kind === "piano") lessonDrawPiano(s, b); });
    updateHud(s); renderHelpers();
    if (mb && mb.text) setFeedback("neutral", mb.text);
    var needs = slideNeeds(sl), hasNext = !!boxOfKind(sl, "next");
    if (!edit && !hasNext && (!needs.length || (sl.adv && sl.adv.mode === "button" && needs.every(function(k){ return L.met[k]; })))) lessonShowNext(s);
    // moving on from the previous slide: what stayed glides, what is new comes in (never while editing or inside a slide)
    if (o.trans && !edit) bx.forEach(function(b){
      var el = boxEl(b.id), cp = byLid(o.trans, b.lid);
      if (cp) { if (b.anim && b.anim.change !== "none") lsMove(el, cp, b); } else if (b.anim) lsPlayIn(el, b.anim["in"]);
    });
    if (skipWalk && !edit) setTimeout(function(){ if (currentSession === s && s.lesson && s.lesson.idx === L.idx) lessonCheck(s); }, 0);
    if (edit) { var cvx = lcvEl(); if (cvx) cvx.insertAdjacentHTML("beforeend", lsLinksHtml(sl)); lessonFrame(); }
  }
  function lessonAfterDraw(s){ var L = s.lesson; if (!L) return; var m = msgBox(lessonSlides(s.type.id, s.level.id)[L.idx]); if (m && m.text) setFeedback("neutral", m.text); }
  // two modules that touch along a side share a handle on that seam
  function lsSeams(){
    var sl = curSlide(), sel = selBoxes(), out = [], seen = {}; if (!sl) return out;
    var all = boxesOf(sl), E = 1e-6;
    sel.forEach(function(a){
      all.forEach(function(b){
        if (b === a || (b.parent || "") !== (a.parent || "")) return;
        var key = [a.id, b.id].sort().join("|"); if (seen[key]) return;
        var ylo = Math.max(a.y, b.y), yhi = Math.min(a.y + a.h, b.y + b.h), xlo = Math.max(a.x, b.x), xhi = Math.min(a.x + a.w, b.x + b.w), L = null;
        if (Math.abs(a.x + a.w - b.x) < E && yhi - ylo >= 0.5) L = { dir: "v", a: a, b: b, at: b.x, mid: ylo + (yhi - ylo) * 0.25 };
        else if (Math.abs(b.x + b.w - a.x) < E && yhi - ylo >= 0.5) L = { dir: "v", a: b, b: a, at: a.x, mid: ylo + (yhi - ylo) * 0.25 };
        else if (Math.abs(a.y + a.h - b.y) < E && xhi - xlo >= 0.5) L = { dir: "h", a: a, b: b, at: b.y, mid: xlo + (xhi - xlo) * 0.25 };
        else if (Math.abs(b.y + b.h - a.y) < E && xhi - xlo >= 0.5) L = { dir: "h", a: b, b: a, at: a.y, mid: xlo + (xhi - xlo) * 0.25 };
        if (L) {
          // put the handle where none of the selected module's own handles (corners, middle) are
          var vv = L.dir === "v", lo = vv ? ylo : xlo, hi = vv ? yhi : xhi, s0 = vv ? a.y : a.x, sl2 = vv ? a.h : a.w, pos = [s0, s0 + sl2 / 2, s0 + sl2], best = (lo + hi) / 2, bd = -1;
          if (hi - lo > 1.2) for (var t = lo + 0.6; t <= hi - 0.6 + 1e-9; t += 0.25) { var dm = Math.min.apply(null, pos.map(function(p){ return Math.abs(p - t); })); if (dm > bd) { bd = dm; best = t; } }
          L.mid = best; seen[key] = 1; out.push(L);
        }
      });
    });
    return out;
  }
  function lessonFrame(){
    var c = lcvEl(), old = c && c.querySelector(".lframe"); if (old) old.remove();
    if (c) [].forEach.call(c.querySelectorAll(".lseam"), function(x){ x.remove(); });
    if (c) [].forEach.call(c.querySelectorAll(".lsel, .lproxy"), function(x){ x.classList.remove("lsel"); x.classList.remove("lproxy"); });
    if (!c || !lsEdit()) return;
    var sel = selBoxes(); if (!sel.length) return;
    sel.forEach(function(b){ var e = boxEl(b.id); if (e) e.classList.add("lsel"); });
    lsDesc(curSlide(), sel.map(function(b){ return b.id; })).forEach(function(i){ if (sel.every(function(b){ return b.id !== i; })) { var e = boxEl(i); if (e) e.classList.add("lproxy"); } });
    lsSeams().forEach(function(m){ c.insertAdjacentHTML("beforeend", '<span class="lseam ' + m.dir + '" data-a="' + m.a.id + '" data-b="' + m.b.id + '" data-dir="' + m.dir + '" title="Drag to resize both modules at once" style="' + geomStyle(m.dir === "v" ? { x: m.at - 0.15, y: m.mid - 0.5, w: 0.3, h: 1 } : { x: m.mid - 0.5, y: m.at - 0.15, w: 1, h: 0.3 }) + '"></span>'); });
    var bb = lsBBox(sel), g = { x: bb.x0, y: bb.y0, w: bb.x1 - bb.x0, h: bb.y1 - bb.y0 };
    c.insertAdjacentHTML("beforeend", '<div class="lframe' + (sel.length > 1 ? " multi" : "") + '" style="' + geomStyle(g) + '">' + (sel.length === 1 ? ["nw", "n", "ne", "e", "se", "s", "sw", "w"].map(function(d){ return '<span class="lh lh-' + d + '" data-h="' + d + '"></span>'; }).join("") : "") + '</div>');
  }
  function lessonAnswered(s){
    var slides = lessonSlides(s.type.id, s.level.id), sl = slides[s.lesson.idx], L = s.lesson, ab = ansBox(sl);
    L.done++; L.walked = true;
    if (ab && L.done < (parseInt(ab.count, 10) || 5)) {
      lessonQuestion(s); s.phase = "answer"; s.steps = [];
      var hb = helpBox(sl); s.active = (hb && hb.helper) ? [hb.helper] : [];
      lessonRender(s, { again: true }); return;
    }
    L.met.ask = true; lessonCheck(s);
  }

  // ----- toolbar, left inspector (slides), right inspector (details) -----
  function lessonBarHtml(){
    if (!lessonEd) return "";
    var edit = lessonEd.mode === "edit", h = lessonEd.hist, s = currentSession, sl = s && s.lesson ? lessonSlides(lessonEd.typeId, lessonEd.levelId)[lessonEd.sel] : null;
    var out = '<span class="lp-seg"><button type="button" class="' + (edit ? "on" : "") + '" data-action="lesson-mode" data-m="edit">Edit</button><button type="button" class="' + (!edit ? "on" : "") + '" data-action="lesson-mode" data-m="present">Present</button></span>';
    if (edit) {
      var groups = {}, order = [], items = [];
      LS_KINDS.forEach(function(k){ items.push({ id: k.id, kind: k.id, label: k.label, d: k.d, cat: k.cat }); if (k.id === "helper") items.push({ id: "walk", kind: "helper", label: "Step-by-step walk", d: "A walk-through you can write yourself or take from the game, one step at a time. Shares the helper space.", cat: k.cat, preset: "walk" }); });
      items.forEach(function(k){ if (!groups[k.cat]) { groups[k.cat] = []; order.push(k.cat); } groups[k.cat].push(k); });
      out += '<span class="lbar-menu"><button type="button" class="lbar-btn" data-action="lesson-menu">+ Add module ▾</button>' + (lessonEd.menu ? '<div class="lbar-pop">' + order.map(function(c){
        return '<div class="lbar-cat">' + c + '</div>' + groups[c].map(function(k){ var why = sl ? kindTaken(sl, k.kind) : ""; return '<button type="button" class="lbar-item" data-action="lesson-addmod" data-k="' + k.kind + '"' + (k.preset ? ' data-p="' + k.preset + '"' : "") + (why ? " disabled" : "") + ' title="' + escapeHtml(why || k.d) + '">' + lsGlyph(k.kind) + '<span class="lbi-t"><b>' + k.label + '</b><span>' + escapeHtml(why || k.d) + '</span></span></button>'; }).join("");
      }).join("") + '</div>' : "") + '</span>' +
        '<span class="lbar-menu"><button type="button" class="lbar-btn" data-action="lesson-lmenu">Layouts ▾</button>' + (lessonEd.lmenu ? '<div class="lbar-pop">' +
          '<div class="lbar-cat">Save this slide as a layout</div><div class="lay-save"><input type="text" data-lf="lay.name" value="' + escapeHtml(lessonEd.lname || "") + '" placeholder="Layout name" /><button type="button" class="lbar-btn" data-action="lesson-lay-save">Save</button></div>' +
          '<div class="lbar-cat">Layouts</div>' + lsBuiltinLayouts().concat(lsLayouts).map(function(l){
            return '<div class="lay-row">' + lsMini(l.boxes) + '<b>' + escapeHtml(l.name) + '</b><span class="lay-btns"><button type="button" class="lbar-btn" data-action="lesson-lay-apply" data-id="' + l.id + '" title="Replace this slide\'s modules with this layout">This slide</button><button type="button" class="lbar-btn" data-action="lesson-lay-new" data-id="' + l.id + '" title="A new slide after this one">New slide</button>' + (l.builtin ? "" : '<button type="button" class="lbar-btn" data-action="lesson-lay-del" data-id="' + l.id + '" title="Delete this layout">✕</button>') + '</span></div>';
          }).join("") + '</div>' : "") + '</span>' +
        '<button type="button" class="lbar-btn' + (sl && sl.overlap ? ' on' : '') + '" data-action="lesson-overlap" title="Off: modules can never land on each other. On: you may stack them (then use Order, Tab or Alt+click to reach the ones underneath).">Overlap: ' + (sl && sl.overlap ? 'on' : 'off') + '</button>' +
        '<button type="button" class="lbar-btn" data-action="lesson-undo" title="Undo (Ctrl+Z)"' + (h.undo.length ? "" : " disabled") + '>↶ Undo</button><button type="button" class="lbar-btn" data-action="lesson-redo" title="Redo (Ctrl+Shift+Z)"' + (h.redo.length ? "" : " disabled") + '>↷ Redo</button>' +
        '<button type="button" class="lbar-btn" data-action="lesson-preview" title="Play the change from the previous slide to this one">▶ Preview transition</button>';
    }
    out += '<span class="spacer"></span>' + (lessonEd.warn ? '<span class="lbar-warn">' + escapeHtml(lessonEd.warn) + '</span>' : "") + '<button type="button" class="lbar-btn" data-action="end-practice">Close</button>';
    return out;
  }
  function lessonLeftHtml(){
    var s = currentSession; if (!s || !s.lesson || !lessonEd) return "";
    var slides = lessonSlides(lessonEd.typeId, lessonEd.levelId), edit = lessonEd.mode === "edit", open = openFlagCount(slides);
    var rows = slides.map(function(x, i){
      var f = slideFlag(x);
      return '<div class="lsrow' + (i === lessonEd.sel ? " on" : "") + ' fl-' + (f || "none") + '" data-action="lesson-sel" data-i="' + i + '"><div class="lsr-top"><b>Slide ' + (i + 1) + '</b>' + (f ? '<span class="lp-flag fl-' + f + '" title="' + escapeHtml(f) + '"></span>' : "") +
        (edit && i === lessonEd.sel ? '<span class="lp-btns"><button type="button" data-action="lesson-up" data-i="' + i + '" title="Move up">▲</button><button type="button" data-action="lesson-down" data-i="' + i + '" title="Move down">▼</button><button type="button" data-action="lesson-del" data-i="' + i + '" title="Remove this slide">✕</button></span>' : "") + '</div>' +
        lsThumb(x, i === lessonEd.sel) + '<div class="lsr-t">' + escapeHtml(x.title || "No title") + '</div></div>';
    }).join("");
    return '<div class="lp-h">Slides' + (open ? ' <span class="lp-open">' + open + ' not finished</span>' : "") + '</div><div class="lp-sub">' + escapeHtml(levelTitle(s.type, s.level)) + '</div>' + rows +
      (edit ? '<button type="button" class="lp-addbtn big" data-action="lesson-newslide" title="A new slide starts as a copy of the selected one, every module linked">+ New slide</button>' : "");
  }
  function lessonPanelHtml(){
    var s = currentSession; if (!s || !s.lesson || !lessonEd) return "";
    var slides = lessonSlides(lessonEd.typeId, lessonEd.levelId), edit = lessonEd.mode === "edit", sl = slides[lessonEd.sel];
    if (!edit) return '<div class="lp-h">Present</div><div class="lp-hint">Play it like a student. Click a slide at the left to jump there.</div>';
    if (!sl) return "";
    var n = (lessonEd.ids || []).length;
    if (n > 1) return lessonMultiHtml(sl, n);
    var b = curBox();
    return b ? lessonBoxEditHtml(sl, b, s, slides) : lessonSlideEditHtml(sl, s);
  }
  function lessonNeedsText(sl){
    var n = slideNeeds(sl), t = [];
    n.forEach(function(k){ if (k === "ask") t.push("the right answers"); else if (k === "walk") t.push("the walk-through finished"); else t.push("the piano touched"); });
    return t.length ? "Needs: " + t.join(", ") + "." : "Nothing to meet, so a Next arrow shows.";
  }
  // nothing selected: this slide's details and its active modules
  function lessonSlideEditHtml(sl, s){
    var bx = boxesOf(sl), tops = bx.filter(function(b){ return !b.parent; }), rows = [];
    (function add(list, d){ list.forEach(function(b){ rows.push([b, d]); add(lsChildren(sl, b.id), d + 1); }); })(tops, 0);
    return '<div class="lp-h">Slide ' + (lessonEd.sel + 1) + '</div><label class="lp-f">Title<input type="text" data-lf="s.title" value="' + escapeHtml(sl.title || "") + '" placeholder="No title" /></label>' +
      '<div class="lp-f">Modules on this slide' + (bx.length ? '<span class="lp-mods">' + rows.map(function(r){ var b = r[0]; return '<button type="button" class="lp-mod" style="margin-left:' + (r[1] * 14) + 'px;width:calc(100% - ' + (r[1] * 14) + 'px)" data-action="lesson-box" data-id="' + b.id + '"><b>' + lsKind(b.kind).label + '</b><span>' + ((b.kind === "text" || b.kind === "container") ? escapeHtml(b.title || "") : "") + '</span></button>'; }).join("") + '</span>' : '<span class="lp-d">Nothing yet. Use + Add module in the toolbar, or Layouts.</span>') + '<span class="lp-d">Click a module on the stage or here to edit it. Click empty stage to come back to this list.</span></div>' +
      '<div class="lp-f">Moves on when <span class="lp-slots"><button type="button" class="' + (!sl.adv || sl.adv.mode !== "button" ? "on" : "") + '" data-action="lesson-adv" data-v="auto">Everything is done</button><button type="button" class="' + (sl.adv && sl.adv.mode === "button" ? "on" : "") + '" data-action="lesson-adv" data-v="button">Next arrow once done</button></span><span class="lp-d">' + escapeHtml(lessonNeedsText(sl)) + '</span></div>' +
      '<div class="lp-f"><span class="lp-slots"><button type="button" class="' + (sl.sq ? "on" : "") + '" data-action="lesson-sq">Same question as the previous slide</button></span></div>' +
      '<div class="lp-f">Flag <span class="lp-slots">' + LS_FLAGS.map(function(o){ return '<button type="button" class="' + (slideFlag(sl) === o.id ? "on" : "") + '" data-action="lesson-flag" data-v="' + o.id + '">' + o.label + '</button>'; }).join("") + '</span></div>' +
      '<label class="lp-f">Note to myself<textarea data-lf="s.note" rows="2" placeholder="What is missing or planned">' + escapeHtml(sl.note || "") + '</textarea></label>';
  }
  function lessonBoxEditHtml(sl, b, s, slides){
    var k = lsKind(b.kind), pk = b.pk, cp = lessonEd.sel > 0 ? byLid(slides[lessonEd.sel - 1], b.lid) : null, par = b.parent ? boxesOf(sl).filter(function(x){ return x.id === b.parent; })[0] : null;
    var h = '<div class="lp-h">' + k.label + '</div><div class="lp-d">' + escapeHtml(k.d) + '</div>' + (par ? '<div class="lp-d">Inside a container.</div>' : "") +
      '<div class="lp-geo">' + [["x", "Left", 0, GC - 0.5], ["y", "Top", 0, GR - 0.5], ["w", "Wide", lsMinW(sl, b), k.xw], ["h", "High", lsMinH(sl, b), k.xh]].map(function(g){ return '<label>' + g[1] + '<input type="number" step="0.5" min="' + g[2] + '" max="' + g[3] + '" data-lf="b.' + g[0] + '" value="' + b[g[0]] + '" /></label>'; }).join("") + '</div>' +
      '<div class="lp-d">Drag to move, handles to resize (' + lsMinW(sl, b) + '–' + k.xw + ' wide, ' + lsMinH(sl, b) + '–' + k.xh + ' high). Shift = half-cell steps. Alt / Option + a handle = resize from the centre in half-cell steps. Drag onto a container to put it inside; drag it out to take it out.</div>';
    if (b.kind !== "container" && b.kind !== "game") h += '<div class="lp-f">Inside its space <span class="lp-slots">' + [["left", "Left"], ["center", "Center"], ["right", "Right"]].map(function(o){ return '<button type="button" class="' + (b.ha === o[0] ? "on" : "") + '" data-action="lesson-al" data-k="ha" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join("") + '</span><span class="lp-slots">' +
      [["top", "Top"], ["middle", "Middle"], ["bottom", "Bottom"]].map(function(o){ return '<button type="button" class="' + (b.va === o[0] ? "on" : "") + '" data-action="lesson-al" data-k="va" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join("") + '</span></div>';
    if (b.kind === "container") {
      h += '<label class="lp-f">Title (optional)<input type="text" data-lf="b.title" value="' + escapeHtml(b.title || "") + '" /></label><div class="lp-f">Look <span class="lp-slots">' + [["card", "Card"], ["soft", "Soft"], ["outline", "Outline"], ["none", "None"]].map(function(o){ return '<button type="button" class="' + ((b.style || "card") === o[0] ? "on" : "") + '" data-action="lesson-cstyle" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join("") + '</span></div>' +
        '<div class="lp-d">With the container selected, + Add module puts the new module inside it. ' + lsChildren(sl, b.id).length + ' module(s) inside now.</div><div class="lp-f"><span class="lp-slots"><button type="button" data-action="lesson-ungroup">Release the modules inside</button></span></div>';
    }
    if (b.kind === "text") h += '<label class="lp-f">Title<input type="text" data-lf="b.title" value="' + escapeHtml(b.title || "") + '" /></label><label class="lp-f">Text<textarea data-lf="b.text" rows="3">' + escapeHtml(b.text || "") + '</textarea></label><div class="lp-f"><span class="lp-slots"><button type="button" class="' + (b.plain ? "on" : "") + '" data-action="lesson-tog" data-k="plain">No card behind it</button></span></div>';
    if (b.kind === "message" || b.kind === "game") h += '<label class="lp-f">Message<input type="text" data-lf="b.text" value="' + escapeHtml(b.text || "") + '" placeholder="Shows until right / wrong replaces it" /></label>';
    if (b.kind === "answer" || b.kind === "game") h += '<label class="lp-f">Right answers needed<input type="number" min="1" max="30" data-lf="b.count" value="' + (parseInt(b.count, 10) || 5) + '" /></label>';
    if (b.kind === "next") h += '<label class="lp-f">Label<input type="text" data-lf="b.label" value="' + escapeHtml(b.label || "Next") + '" /></label>';
    if (b.kind === "piano") {
      h += '<div class="lp-f">Starts on <span class="lp-slots"><button type="button" class="' + (pk.start !== "shuffle" ? "on" : "") + '" data-action="lesson-pk" data-k="start" data-v="c">C</button><button type="button" class="' + (pk.start === "shuffle" ? "on" : "") + '" data-action="lesson-pk" data-k="start" data-v="shuffle">Shuffle</button></span></div>' +
        '<div class="lp-f">Highlighted note <span class="lp-slots"><button type="button" class="' + (pk.target !== "question" ? "on" : "") + '" data-action="lesson-pk" data-k="target" data-v="none">Nothing</button><button type="button" class="' + (pk.target === "question" ? "on" : "") + '" data-action="lesson-pk" data-k="target" data-v="question">The question\'s note</button></span></div>' +
        '<div class="lp-f"><span class="lp-slots"><button type="button" class="' + (pk.names !== false ? "on" : "") + '" data-action="lesson-pk" data-k="names" data-v="' + (pk.names !== false ? "0" : "1") + '">Say the key\'s name when touched</button></span></div>' +
        '<div class="lp-f">Moves on when <span class="lp-slots"><button type="button" class="' + (pk.goal !== "touch" ? "on" : "") + '" data-action="lesson-pk" data-k="goal" data-v="none">Nothing needed</button><button type="button" class="' + (pk.goal === "touch" ? "on" : "") + '" data-action="lesson-pk" data-k="goal" data-v="touch">N different keys touched</button></span></div>' +
        (pk.goal === "touch" ? '<label class="lp-f">Keys to touch<input type="number" min="1" max="30" data-lf="b.n" value="' + (parseInt(pk.n, 10) || 3) + '" /></label>' : "");
    }
    if (b.kind === "helper" || b.kind === "game") {
      var offered = allHelpers().filter(function(x){ return x.applies(s.type); });
      h += '<div class="lp-f">Helper<span class="lp-checks"><button type="button" class="' + (!b.helper ? "on" : "") + '" data-action="lesson-help" data-id="">None</button>' + offered.map(function(x){ return '<button type="button" class="' + (b.helper === x.id ? "on" : "") + '" data-action="lesson-help" data-id="' + x.id + '">' + escapeHtml(x.short || x.label) + '</button>'; }).join("") + '</span></div>' +
        '<div class="lp-f"><span class="lp-slots"><button type="button" class="' + (b.walk ? "on" : "") + '" data-action="lesson-tog" data-k="walk">Step-by-step walk first</button></span></div>' + (b.walk ? lessonWalkEditHtml(b, s) : "");
    }
    if (b.kind !== "blank") {
      var a = b.anim;
      h += '<div class="lp-sec"><div class="lp-h">Between slides</div><div class="lp-d">' + (lessonEd.sel === 0 ? "This is the first slide." : cp ? "This module is also on the previous slide (linked)." : "This module is new on this slide.") + ' Nothing moves inside a slide; changes play when the lesson goes to the next one.</div>' +
        '<div class="lp-f">Comes in (when new on a slide) <span class="lp-slots">' + LS_ANIMS.map(function(o){ return '<button type="button" class="' + (a["in"] === o.id ? "on" : "") + '" data-action="lesson-anim" data-k="in" data-v="' + o.id + '">' + o.label + '</button>'; }).join("") + '</span></div>' +
        '<div class="lp-f">Goes out (when the next slide drops it) <span class="lp-slots">' + LS_OUTS.map(function(o){ return '<button type="button" class="' + (a.out === o.id ? "on" : "") + '" data-action="lesson-anim" data-k="out" data-v="' + o.id + '">' + o.label + '</button>'; }).join("") + '</span></div>' +
        '<div class="lp-f">Moved or resized (when kept) <span class="lp-slots"><button type="button" class="' + (a.change !== "none" ? "on" : "") + '" data-action="lesson-anim" data-k="change" data-v="glide">Glide</button><button type="button" class="' + (a.change === "none" ? "on" : "") + '" data-action="lesson-anim" data-k="change" data-v="none">Jump</button></span></div></div>';
    }
    h += '<div class="lp-f">Order <span class="lp-slots"><button type="button" data-action="lesson-z" data-v="back">To back</button><button type="button" data-action="lesson-z" data-v="bwd">Back</button><button type="button" data-action="lesson-z" data-v="fwd">Forward</button><button type="button" data-action="lesson-z" data-v="front">To front</button></span><span class="lp-d">Only matters where modules overlap. Tab and Alt + click select the one underneath.</span></div>' +
      '<div class="lp-f"><span class="lp-slots"><button type="button" data-action="lesson-copy">Copy</button><button type="button" data-action="lesson-dupsel">Duplicate (Ctrl+D)</button><button type="button" data-action="lesson-boxdel">Remove (Delete key)</button></span></div>';
    return h;
  }
  function lessonMultiHtml(sl, n){
    function al(v, t){ return '<button type="button" data-action="lesson-align" data-v="' + v + '">' + t + '</button>'; }
    return '<div class="lp-h">' + n + ' modules selected</div><div class="lp-d">Shift, Cmd or Ctrl + click adds or removes one. Drag to move them together. Drag on empty stage to select several.</div>' +
      '<div class="lp-f">Align <span class="lp-slots">' + al("left", "Left") + al("hcenter", "Center") + al("right", "Right") + '</span><span class="lp-slots">' + al("top", "Top") + al("vmiddle", "Middle") + al("bottom", "Bottom") + '</span></div>' +
      '<div class="lp-f"><span class="lp-slots"><button type="button" data-action="lesson-group">Group into a container</button><button type="button" data-action="lesson-dupsel">Duplicate</button><button type="button" data-action="lesson-boxdel">Remove</button></span></div>';
  }
  function lessonWalkEditHtml(b, s){
    var w = lsWalk(s.type.id), m = w.mode, total = lsWalkSteps(s, b).length;
    function seg(act, cur, opts){ return '<span class="lp-slots">' + opts.map(function(o){ return '<button type="button" class="' + (cur === o[0] ? "on" : "") + '" data-action="' + act + '" data-v="' + o[0] + '">' + o[1] + '</button>'; }).join("") + '</span>'; }
    var h = '<div class="lp-sec"><div class="lp-h">This slide\'s part of the walk</div><div class="lp-d">The walk has ' + total + ' step' + (total === 1 ? "" : "s") + ' for this question. Students can\'t skip steps in a lesson.</div>' +
      '<div class="lp-geo"><label>From step<input type="number" min="1" max="' + Math.max(1, total) + '" data-lf="b.wFrom" value="' + (parseInt(b.wFrom, 10) || 1) + '" /></label><label>To step (0 = the end)<input type="number" min="0" max="' + Math.max(1, total) + '" data-lf="b.wTo" value="' + (parseInt(b.wTo, 10) || 0) + '" /></label></div>' +
      '<div class="lp-f">Starts ' + seg("lesson-wplace", b.wPlace || "restart", [["restart", "At \"From\" (restart)"], ["continue", "Where the last slide stopped"]]) + '</div>' +
      '<div class="lp-f">Next slide when ' + seg("lesson-wnext", b.wNext || "normal", [["normal", "This slide\'s usual rule"], ["range", "These steps are done"]]) + '</div></div>' +
      '<div class="lp-sec"><div class="lp-h">The walk for ' + escapeHtml(s.type.name || s.type.id) + '</div><div class="lp-d">One walk for the whole game: every slide and level uses these steps.</div>' +
      seg("lesson-wmode", m, [["auto", "Built in"], ["custom", "My own"], ["both", "Built in, then mine"]]);
    if (m === "auto") h += '<div class="lp-d">The game explains its own question step by step. Pick "My own" to write steps.</div>';
    else {
      h += '<div class="lp-d">Each step shows a title and some words. Use {name} for the note\'s name and {letter} for its letter.</div>' + w.steps.map(function(st, j){
        return '<div class="wk-step"><div class="wk-top"><b>' + (m === "both" ? "My step " : "Step ") + (j + 1) + '</b><span class="lp-btns"><button type="button" data-action="lesson-wup" data-j="' + j + '" title="Move up">▲</button><button type="button" data-action="lesson-wdown" data-j="' + j + '" title="Move down">▼</button><button type="button" data-action="lesson-wdel" data-j="' + j + '" title="Remove step">✕</button></span></div>' +
          '<input type="text" data-lf="w.t.' + j + '" value="' + escapeHtml(st.t || "") + '" placeholder="Step title" /><textarea data-lf="w.x.' + j + '" rows="2" placeholder="What to say">' + escapeHtml(st.x || "") + '</textarea></div>';
      }).join("") + '<button type="button" class="lp-addbtn" data-action="lesson-wadd">+ Add a step</button>';
    }
    return h + '</div>';
  }
  function lessonPanelRefresh(){
    var p = $("lessonPanel"); if (p) p.innerHTML = lessonPanelHtml();
    var l = $("lessonSlides"); if (l) l.innerHTML = lessonLeftHtml();
    var b = $("lessonBar"); if (b) b.innerHTML = lessonBarHtml();
    lsFitThumbs();
  }
  function lessonSlidesMut(){ return lessonEd ? lessonSlides(lessonEd.typeId, lessonEd.levelId) : []; }
  function curSlide(){ return lessonSlidesMut()[lessonEd ? lessonEd.sel : 0]; }
  function lsWarn(msg){ if (!lessonEd) return; lessonEd.warn = msg; lessonPanelRefresh(); clearTimeout(lsWarn.t); lsWarn.t = setTimeout(function(){ if (lessonEd) { lessonEd.warn = ""; lessonPanelRefresh(); } }, 3500); }
  // Preview: show the previous slide, then play the change to this one
  function lessonPreview(){
    var s = currentSession; if (!s || !lessonEd || lessonEd.previewing) return;
    if (lessonEd.sel === 0) { lsWarn("This is the first slide: nothing comes before it."); return; }
    var idx = lessonEd.sel; lessonEd.previewing = true; s.lesson.idx = idx - 1; lessonRender(s, { again: true });
    clearTimeout(lessonEd.pt);
    lessonEd.pt = setTimeout(function(){
      if (currentSession !== s || !lessonEd) return;
      lessonAdvance(s);   // the dropped modules go out, then this slide arrives with its transition
      lessonEd.pt = setTimeout(function(){ if (currentSession !== s || !lessonEd) return; lessonEd.previewing = false; lessonGo(s, idx); }, 430 + 1100);
    }, 700);
  }
  // ----- selection (lessonEd.ids = the tops that are selected; a selected container carries everything inside it) -----
  var LS_MAC = /Mac/.test(navigator.platform || "");
  function lsSetSel(ids){ var sl = curSlide(); lessonEd.ids = sl ? lsNorm(sl, ids) : []; lessonEd.box = lessonEd.ids.length ? lessonEd.ids[lessonEd.ids.length - 1] : ""; }
  function lsPrune(){ var sl = curSlide(); lsSetSel(sl ? (lessonEd.ids || []).filter(function(i){ return !!lsById(sl, i); }) : []); }
  function selBoxes(){ var sl = curSlide(); return boxesOf(sl).filter(function(b){ return lessonEd && (lessonEd.ids || []).indexOf(b.id) !== -1; }); }
  function curBox(){ var sel = selBoxes(); return sel.length === 1 ? sel[0] : null; }
  // shift / cmd + click: inside a selected container = take that one out of the selection; a container over selected things = the container takes over
  function lsToggleSel(sl, id){
    var ids = lessonEd.ids.slice(), t = lsById(sl, id), at = ids.indexOf(id);
    if (at !== -1) { ids.splice(at, 1); return ids; }
    var anc = ids.map(function(i){ return lsById(sl, i); }).filter(function(a){ return a && lsIsAnc(sl, a, t); })[0];
    if (anc) { ids = ids.filter(function(i){ return i !== anc.id; }); (function ex(n){ lsChildren(sl, n.id).forEach(function(k){ if (k.id === id) return; if (lsIsAnc(sl, k, t)) ex(k); else ids.push(k.id); }); })(anc); return ids; }
    ids = ids.filter(function(i){ var o = lsById(sl, i); return !(o && lsIsAnc(sl, t, o)); }); ids.push(id); return ids;
  }
  function lessonChanged(redraw){ saveLessons(); lessonPanelRefresh(); if (redraw && currentSession && currentSession.lesson) lessonRender(currentSession, { again: true }); }
  function lsAfter(){ saveLessons(); var s = currentSession; if (s && lessonEd) lessonRender(s, { again: true }); lessonPanelRefresh(); }
  function lsShiftTree(sl, b, dx, dy){ lsDesc(sl, [b.id]).forEach(function(i){ var o = lsById(sl, i); if (o && o !== b) { o.x += dx; o.y += dy; } }); }
  function lsMoveBox(sl, b, nx, ny){ var dx = nx - b.x, dy = ny - b.y; lsShiftTree(sl, b, dx, dy); b.x = nx; b.y = ny; }
  function lsTopSel(sl){ return selBoxes(); }
  function lsShift(dx, dy){
    var sl = curSlide(), tops = lsTopSel(sl); if (!tops.length) return;
    tops.forEach(function(m){ var bd = lsBounds(sl, m); dx = Math.max(bd.x0 - m.x, Math.min(bd.x1 - m.x - m.w, dx)); dy = Math.max(bd.y0 - m.y, Math.min(bd.y1 - m.y - m.h, dy)); });
    tops.forEach(function(m){ lsMoveBox(sl, m, m.x + dx, m.y + dy); });
  }
  function lsDeleteSel(){
    var sl = curSlide(); if (!sl || !lessonEd.ids.length) return; lsPush();
    var kill = lsDesc(sl, lessonEd.ids); sl.boxes = sl.boxes.filter(function(b){ return kill.indexOf(b.id) === -1; }); lsSetSel([]); lsAfter();
  }
  // duplicate: one-only modules in the copy become placeholders of the same size
  function lsDupSel(){
    var sl = curSlide(), tops = lsTopSel(sl); if (!tops.length) return;
    if (tops.length === 1 && lsOneOnly(tops[0])) { lsWarn("That kind of module can only be on a slide once."); return; }
    var snap = lsSnapStr(), made = [], holes = 0, bad = false;
    function copyTree(t, parent, dx, dy){
      var c = JSON.parse(JSON.stringify(t)); c.id = uid(); c.lid = uid(); c.parent = parent; c.x += dx; c.y += dy;
      if (lsOneOnly(c)) { c.kind = "blank"; c.title = ""; c.text = ""; c.helper = ""; c.walk = false; holes++; }
      sl.boxes.push(c); lsChildren(sl, t.id).forEach(function(k){ if (k.id !== c.id) copyTree(k, c.id, dx, dy); }); return c;
    }
    tops.forEach(function(t){
      var bd = lsBounds(sl, t), dx = Math.max(0, Math.min(1, bd.x1 - t.x - t.w)), dy = Math.max(0, Math.min(1, bd.y1 - t.y - t.h)), c = copyTree(t, t.parent || "", dx, dy);
      if (!sl.overlap && !lsFit(sl, c, t.parent ? lsInner(lsById(sl, t.parent)) : lsGridR(), t.parent || "")) bad = true;
      made.push(c.id);
    });
    if (bad) { lsApplySnap(snap); lsAfter(); lsWarn("No room for the copy. Remove or shrink something first, or turn Overlap on."); return; }
    lessonEd.hist.undo.push(snap); lessonEd.hist.redo = []; lsSetSel(made); lsAfter(); if (holes) lsWarn(holes + " one-only module" + (holes === 1 ? "" : "s") + " in the copy became placeholder" + (holes === 1 ? "" : "s") + ".");
  }
  function lsGroup(){
    var sl = curSlide(), sel = selBoxes(); if (!sel.length) return;
    var p0 = sel[0].parent || ""; if (sel.some(function(b){ return (b.parent || "") !== p0; })) { lsWarn("Select modules that are all at the same level."); return; }
    lsPush(); var bb = lsBBox(sel), R = p0 ? lsInner(lsById(sl, p0)) : lsGridR(), c = newBox("container", R);
    c.x = Math.max(R.x0, bb.x0 - 0.5); c.y = Math.max(R.y0, bb.y0 - 0.5); c.w = Math.min(R.x1, bb.x1 + 0.5) - c.x; c.h = Math.min(R.y1, bb.y1 + 0.5) - c.y; c.parent = p0;
    var at = sl.boxes.indexOf(sel[0]); sl.boxes.splice(at, 0, c); sel.forEach(function(b){ b.parent = c.id; }); lsSetSel([c.id]); lsAfter();
  }
  function lsUngroup(){
    var sl = curSlide(), b = curBox(); if (!b || b.kind !== "container") return; lsPush();
    lsChildren(sl, b.id).forEach(function(c){ c.parent = b.parent || ""; }); sl.boxes = sl.boxes.filter(function(x){ return x !== b; }); lsSetSel([]); lsAfter();
  }
  function lsAlign(v){
    var sl = curSlide(), sel = lsTopSel(sl); if (sel.length < 2) return; lsPush(); var bb = lsBBox(sel);
    sel.forEach(function(b){
      var nx = b.x, ny = b.y;
      if (v === "left") nx = bb.x0; else if (v === "right") nx = bb.x1 - b.w; else if (v === "hcenter") nx = Math.round(((bb.x0 + bb.x1) / 2 - b.w / 2) * 2) / 2;
      else if (v === "top") ny = bb.y0; else if (v === "bottom") ny = bb.y1 - b.h; else if (v === "vmiddle") ny = Math.round(((bb.y0 + bb.y1) / 2 - b.h / 2) * 2) / 2;
      var bd = lsBounds(sl, b); nx = Math.max(bd.x0, Math.min(bd.x1 - b.w, nx)); ny = Math.max(bd.y0, Math.min(bd.y1 - b.h, ny)); lsMoveBox(sl, b, nx, ny);
    });
    lsAfter();
  }
  function lsLimitGeo(sl, b){
    var k = lsKind(b.kind), bd = lsBounds(sl, b);
    b.w = Math.max(lsMinW(sl, b), Math.min(k.xw, Math.min(bd.x1 - bd.x0, b.w))); b.h = Math.max(lsMinH(sl, b), Math.min(k.xh, Math.min(bd.y1 - bd.y0, b.h)));
    b.x = Math.max(bd.x0, Math.min(bd.x1 - b.w, b.x)); b.y = Math.max(bd.y0, Math.min(bd.y1 - b.h, b.y));
  }
  // ----- guides: centred on the screen (or its container), and equal gaps between neighbours -----
  function lsGuides(sl, rect, skip, par){
    var cv = lcvEl(); if (!cv) return; var g = cv.querySelector(".lguides"); if (!g) { cv.insertAdjacentHTML("beforeend", '<div class="lguides"></div>'); g = cv.querySelector(".lguides"); }
    var out = [], EPS = 0.01, cx = (rect.x0 + rect.x1) / 2, cyy = (rect.y0 + rect.y1) / 2;
    function vl(x, y0, y1, c){ return '<i class="lg v ' + c + '" style="left:' + (x / GC * 100) + '%;top:' + (y0 / GR * 100) + '%;height:' + ((y1 - y0) / GR * 100) + '%"></i>'; }
    function hl(y, x0, x1, c){ return '<i class="lg h ' + c + '" style="top:' + (y / GR * 100) + '%;left:' + (x0 / GC * 100) + '%;width:' + ((x1 - x0) / GC * 100) + '%"></i>'; }
    var refs = [lsGridR()]; if (par) refs.push(lsInner(par));
    refs.forEach(function(R, i){ var c = i ? "g-box" : "g-screen"; if (Math.abs(cx - (R.x0 + R.x1) / 2) < EPS) out.push(vl(cx, R.y0, R.y1, c)); if (Math.abs(cyy - (R.y0 + R.y1) / 2) < EPS) out.push(hl(cyy, R.x0, R.x1, c)); });
    var sib = boxesOf(sl).filter(function(b){ return skip.indexOf(b.id) === -1 && (b.parent || "") === (par ? par.id : ""); });
    var rowN = sib.filter(function(b){ return b.y < rect.y1 - EPS && b.y + b.h > rect.y0 + EPS; }), colN = sib.filter(function(b){ return b.x < rect.x1 - EPS && b.x + b.w > rect.x0 + EPS; });
    var L = null, Rr = null, T = null, B = null;
    rowN.forEach(function(b){ if (b.x + b.w <= rect.x0 + EPS && (!L || b.x + b.w > L.x + L.w)) L = b; if (b.x >= rect.x1 - EPS && (!Rr || b.x < Rr.x)) Rr = b; });
    colN.forEach(function(b){ if (b.y + b.h <= rect.y0 + EPS && (!T || b.y + b.h > T.y + T.h)) T = b; if (b.y >= rect.y1 - EPS && (!B || b.y < B.y)) B = b; });
    if (L && Rr && Math.abs((rect.x0 - (L.x + L.w)) - (Rr.x - rect.x1)) < EPS) { out.push(hl(cyy, L.x + L.w, rect.x0, "g-gap")); out.push(hl(cyy, rect.x1, Rr.x, "g-gap")); }
    if (T && B && Math.abs((rect.y0 - (T.y + T.h)) - (B.y - rect.y1)) < EPS) { out.push(vl(cx, T.y + T.h, rect.y0, "g-gap")); out.push(vl(cx, rect.y1, B.y, "g-gap")); }
    g.innerHTML = out.join("");
  }
  function lsGuidesOff(){ var g = lcvEl() && lcvEl().querySelector(".lguides"); if (g) g.remove(); }
  // ----- moving, resizing, marquee -----
  var lsDrag = null, lsNudgeAt = 0, lsFocus = null;
  function lsCell(ev){ var c = lcvEl(); if (!c) return null; var r = c.getBoundingClientRect(); return { fx: (ev.clientX - r.left) / (r.width / GC), fy: (ev.clientY - r.top) / (r.height / GR), r: r }; }
  function lsApplyEl(b){ var e = boxEl(b.id); if (e) geomStyle(b).split(";").forEach(function(p){ var kv = p.split(":"); e.style[kv[0]] = kv.slice(1).join(":"); }); }
  function lsFramePos(){ var f = lcvEl() && lcvEl().querySelector(".lframe"), sel = selBoxes(); if (!f || !sel.length) return; var bb = lsBBox(sel); geomStyle({ x: bb.x0, y: bb.y0, w: bb.x1 - bb.x0, h: bb.y1 - bb.y0 }).split(";").forEach(function(p){ var kv = p.split(":"); f.style[kv[0]] = kv.slice(1).join(":"); }); }
  function lsSnap(v, unit){ return Math.round(v / unit) * unit; }
  // the container the pointer is over (deepest), ignoring what is being dragged
  function lsDropTarget(sl, fx, fy, excl){
    var best = null, bd = -1;
    boxesOf(sl).forEach(function(b){ if (b.kind !== "container" || excl.indexOf(b.id) !== -1) return; if (fx >= b.x && fx <= b.x + b.w && fy >= b.y && fy <= b.y + b.h) { var d = lsDepth(sl, b); if (d > bd) { best = b; bd = d; } } });
    return best;
  }
  // drop: each dragged top goes into the target (or onto the stage). Into a different parent it is fitted (others bump / shrink, a container's contents scale); in the same place it may not land on another module unless Overlap is on.
  function lsDrop(sl, d, tgt){
    var pid = tgt ? tgt.id : "", R = tgt ? lsInner(tgt) : lsGridR(), plans = [];
    for (var i = 0; i < d.tops.length; i++) {
      var b = d.tops[i].b, w = b.w, h = b.h;
      if (w > R.x1 - R.x0 || h > R.y1 - R.y0) { if (b.kind === "container") return "fit"; w = Math.min(w, R.x1 - R.x0); h = Math.min(h, R.y1 - R.y0); if (w < lsKind(b.kind).mw || h < lsKind(b.kind).mh) return "fit"; }
      plans.push({ b: b, m: d.tops[i], w: w, h: h, x: Math.max(R.x0, Math.min(R.x1 - w, b.x)), y: Math.max(R.y0, Math.min(R.y1 - h, b.y)) });
    }
    plans.forEach(function(p){ lsShiftTree(sl, p.b, p.x - p.b.x, p.y - p.b.y); p.b.x = p.x; p.b.y = p.y; p.b.w = p.w; p.b.h = p.h; p.b.parent = pid; });
    if (sl.overlap) return "";
    for (var j = 0; j < plans.length; j++) {
      var p = plans[j];
      if (p.m.par !== pid) { if (!lsFit(sl, p.b, R, pid)) return "fit"; }
      else if (lsNewHits(sl, p.b, p.m.hit0, d.excl).length) return "overlap";
    }
    return "";
  }
  var lsCtx = null;
  function lsCtxClose(){ var m = document.querySelector(".lctx"); if (m) m.remove(); lsCtx = null; }
  document.getElementById("app").addEventListener("contextmenu", function(ev){
    if (!lsEdit()) return;
    var cv = ev.target.closest && ev.target.closest("#lcv"); if (!cv) return;
    ev.preventDefault(); lsCtxClose();
    var sl = curSlide(), box = ev.target.closest(".lbox"), c = lsCell(ev);
    if (box) { var id = box.getAttribute("data-bid"); if (lsDesc(sl, lessonEd.ids).indexOf(id) === -1) { lsSetSel([id]); lessonFrame(); lessonPanelRefresh(); } }
    var tgt = c ? lsDropTarget(sl, c.fx, c.fy, []) : null; lessonEd.ctxAt = { x: c ? c.fx : 8, y: c ? c.fy : 6, parent: tgt ? tgt.id : "" };
    var sel = selBoxes(), n = sel.length, one = n === 1 ? sel[0] : null, items = [];
    function it(a, t, k, v){ return '<button type="button" data-action="' + a + '"' + (v ? ' data-v="' + v + '"' : "") + '>' + t + (k ? '<span>' + k + '</span>' : "") + '</button>'; }
    var mod = LS_MAC ? "⌘" : "Ctrl+";
    var add = '<div class="lctx-sub"><button type="button" class="lctx-subbtn">Add module here<span>▸</span></button><div class="lctx lctx-fly">' + LS_KINDS.map(function(k){
      var why = kindTaken(sl, k.id), out = '<button type="button" data-action="lesson-addat" data-k="' + k.id + '"' + (why ? " disabled" : "") + ' title="' + escapeHtml(why || k.d) + '">' + k.label + '</button>';
      if (k.id === "helper") out += '<button type="button" data-action="lesson-addat" data-k="helper" data-p="walk"' + (why ? " disabled" : "") + '>Step-by-step walk</button>'; return out; }).join("") + '</div></div>';
    if (n) {
      items.push(it("lesson-group", n === 1 && one.kind === "container" ? "Put it inside a new container" : "Group into a container", mod + "G"));
      if (one && one.kind === "container") items.push(it("lesson-ungroup", "Release the modules inside", ""));
      items.push(it("lesson-copy", "Copy", mod + "C")); items.push(it("lesson-cut", "Cut", mod + "X"));
    }
    if (lsClip) items.push(it("lesson-paste-at", "Paste here", mod + "V"));
    if (n) {
      items.push(it("lesson-dupsel", "Duplicate", mod + "D"));
      items.push(it("lesson-z", "Bring to front", "", "front")); items.push(it("lesson-z", "Bring forward", mod + "]", "fwd")); items.push(it("lesson-z", "Send backward", mod + "[", "bwd")); items.push(it("lesson-z", "Send to back", "", "back"));
      if (n > 1) ["left|Align left", "hcenter|Align centre", "right|Align right", "top|Align top", "vmiddle|Align middle", "bottom|Align bottom"].forEach(function(a){ var p = a.split("|"); items.push(it("lesson-align", p[1], "", p[0])); });
      items.push(it("lesson-boxdel", "Remove", "Delete"));
    }
    items.unshift(it("lesson-addat-c", "Add container here", ""), add);
    if (!n) items.push(it("lesson-selall", "Select all", mod + "A"));
    var app = document.getElementById("app");
    app.insertAdjacentHTML("beforeend", '<div class="lctx" style="left:' + ev.clientX + 'px;top:' + ev.clientY + 'px">' + items.join("") + '</div>');
    var m = app.querySelector(".lctx:last-child"), r = m.getBoundingClientRect(); if (r.bottom > innerHeight - 6) m.style.top = Math.max(6, innerHeight - r.height - 6) + "px"; if (r.right > innerWidth - 6) m.style.left = Math.max(6, innerWidth - r.width - 6) + "px";
    lsCtx = true;
  });
  document.getElementById("app").addEventListener("mousedown", function(ev){
    if (ev.target.closest && ev.target.closest(".lctx")) return;
    lsCtxClose();
    if (!lsEdit() || ev.button !== 0) return;
    var sm = ev.target.closest && ev.target.closest(".lseam");
    if (sm && lsEdit()) {
      var sl0 = curSlide(), A = lsById(sl0, sm.getAttribute("data-a")), B = lsById(sl0, sm.getAttribute("data-b")), c0 = lsCell(ev);
      if (A && B && c0) {
        lsPush(); var sA = A.kind === "container" ? lsKidsSnap(sl0, A) : null, sB = B.kind === "container" ? lsKidsSnap(sl0, B) : null;
        lsDrag = { mode: "seam", dir: sm.getAttribute("data-dir"), a: A, b: B, fx: c0.fx, fy: c0.fy, oa: { x: A.x, y: A.y, w: A.w, h: A.h }, ob: { x: B.x, y: B.y, w: B.w, h: B.h }, sa: sA, sb: sB, la: sA ? lsLim(A, sA) : null, lb: sB ? lsLim(B, sB) : null, ha: lsOverlapIds(sl0, A), hb: lsOverlapIds(sl0, B), moved: false };
        document.body.classList.add("ls-dragging"); document.body.setAttribute("data-lsh", lsDrag.dir === "v" ? "e" : "s"); ev.preventDefault(); return;
      }
    }
    var h = ev.target.closest && ev.target.closest(".lh"), box = ev.target.closest && ev.target.closest(".lbox"), cv = ev.target.closest && ev.target.closest("#lcv"), add = ev.shiftKey || ev.metaKey || (ev.ctrlKey && !LS_MAC), sl = curSlide();
    if (!sl) return;
    if (cv && !h && !box) { lsDrag = { mode: "marq", x0: ev.clientX, y0: ev.clientY, add: add, base: add ? lessonEd.ids.slice() : [], moved: false }; ev.preventDefault(); return; }
    if (!h && !box) return;
    var c = lsCell(ev); if (!c) return;
    if (h) {
      var b = curBox(); if (!b) return; lsPush();
      var sn = lsKidsSnap(sl, b);
      lsDrag = { mode: "size", b: b, h: h.getAttribute("data-h"), fx: c.fx, fy: c.fy, o: { x: b.x, y: b.y, w: b.w, h: b.h }, moved: false, hit0: lsOverlapIds(sl, b), snap: b.kind === "container" ? sn : null, lim: b.kind === "container" ? lsLim(b, sn) : null };
    } else {
      if (ev.altKey && !add) { lsCycleAt(ev, sl); ev.preventDefault(); return; }
      var id = box.getAttribute("data-bid"), eff = lsDesc(sl, lessonEd.ids), wasEff = eff.indexOf(id) !== -1, wasDirect = lessonEd.ids.indexOf(id) !== -1;
      if (add && (!wasEff || !wasDirect)) { lsSetSel(lsToggleSel(sl, id)); lessonFrame(); lessonPanelRefresh(); ev.preventDefault(); return; }
      if (!wasEff) { lsSetSel([id]); lessonFrame(); lessonPanelRefresh(); }
      lsPush();
      var all = lsDesc(sl, lessonEd.ids), tops = selBoxes();
      lsDrag = { mode: "move", items: boxesOf(sl).filter(function(x){ return all.indexOf(x.id) !== -1; }).map(function(x){ return { b: x, x: x.x, y: x.y }; }), tops: tops.map(function(m){ return { b: m, x: m.x, y: m.y, par: m.parent || "", hit0: lsOverlapIds(sl, m) }; }), excl: all, fx: c.fx, fy: c.fy, moved: false,
        toggleOff: add && wasDirect ? id : "", clickSel: !add && wasEff && (lessonEd.ids.length > 1 || !wasDirect) ? id : "", tgt: null };
    }
    document.body.classList.add("ls-dragging"); document.body.setAttribute("data-lsh", lsDrag.h || "move"); ev.preventDefault();
  });
  document.addEventListener("mousemove", function(ev){
    if (!lsDrag) return;
    var unit = (ev.shiftKey || ev.altKey) ? 0.5 : 1, sl = curSlide();
    if (lsDrag.mode === "marq") {
      var cv = lcvEl(); if (!cv) return;
      if (!lsDrag.moved && Math.abs(ev.clientX - lsDrag.x0) + Math.abs(ev.clientY - lsDrag.y0) < 5) return;
      lsDrag.moved = true; var r = cv.getBoundingClientRect(), sc = r.width / (cv.offsetWidth || r.width), mq = cv.querySelector(".lmarq");
      if (!mq) { cv.insertAdjacentHTML("beforeend", '<div class="lmarq"></div>'); mq = cv.querySelector(".lmarq"); }
      var l = Math.min(ev.clientX, lsDrag.x0), t = Math.min(ev.clientY, lsDrag.y0), rr = Math.max(ev.clientX, lsDrag.x0), bb = Math.max(ev.clientY, lsDrag.y0);
      mq.style.left = ((l - r.left) / sc) + "px"; mq.style.top = ((t - r.top) / sc) + "px"; mq.style.width = ((rr - l) / sc) + "px"; mq.style.height = ((bb - t) / sc) + "px";
      var hit = [];
      (function walk(list){ list.forEach(function(b){ var e = boxEl(b.id); if (!e) return; var q = e.getBoundingClientRect();
        if (b.kind === "container") { if (q.left >= l && q.right <= rr && q.top >= t && q.bottom <= bb) hit.push(b.id); else walk(lsChildren(sl, b.id)); }
        else if (q.left < rr && q.right > l && q.top < bb && q.bottom > t) hit.push(b.id); }); })(boxesOf(sl).filter(function(b){ return !b.parent; }));
      lsSetSel(lsDrag.base.concat(hit.filter(function(i){ return lsDrag.base.indexOf(i) === -1; })));
      var eff = lsDesc(sl, lessonEd.ids);
      [].forEach.call(cv.querySelectorAll(".lbox"), function(e){ var i = e.getAttribute("data-bid"); e.classList.toggle("lsel", lessonEd.ids.indexOf(i) !== -1); e.classList.toggle("lproxy", eff.indexOf(i) !== -1 && lessonEd.ids.indexOf(i) === -1); });
      return;
    }
    var c = lsCell(ev); if (!c) return;
    if (lsDrag.mode === "seam") {
      var D = lsDrag, v = D.dir === "v", ka = lsKind(D.a.kind), kb = lsKind(D.b.kind), ua = (ev.shiftKey || ev.altKey) ? 0.5 : 1;
      var wa = v ? D.oa.w : D.oa.h, wb = v ? D.ob.w : D.ob.h;
      var amin = D.la ? (v ? D.la.Wmin : D.la.Hmin) : (v ? ka.mw : ka.mh), amax = D.la ? (v ? D.la.Wmax : D.la.Hmax) : (v ? ka.xw : ka.xh), bmin = D.lb ? (v ? D.lb.Wmin : D.lb.Hmin) : (v ? kb.mw : kb.mh), bmax = D.lb ? (v ? D.lb.Wmax : D.lb.Hmax) : (v ? kb.xw : kb.xh);
      var lo = Math.max(amin - wa, wb - bmax), hi = Math.min(amax - wa, wb - bmin), dd = lsSnap(v ? c.fx - D.fx : c.fy - D.fy, ua);
      dd = lo > hi ? 0 : Math.max(lo, Math.min(hi, dd));
      if (v) { D.a.w = D.oa.w + dd; D.b.x = D.ob.x + dd; D.b.w = D.ob.w - dd; } else { D.a.h = D.oa.h + dd; D.b.y = D.ob.y + dd; D.b.h = D.ob.h - dd; }
      if (D.sa) { lsScaleKids(D.a, D.sa); D.sa.kids.forEach(function(q){ lsApplyEl(q.b); }); }
      if (D.sb) { lsScaleKids(D.b, D.sb); D.sb.kids.forEach(function(q){ lsApplyEl(q.b); }); }
      if (dd !== 0) D.moved = true;
      lsApplyEl(D.a); lsApplyEl(D.b); lsLinksLive(); lsFramePos();
      var sm2 = lcvEl().querySelector('.lseam[data-a="' + D.a.id + '"][data-b="' + D.b.id + '"]'); if (sm2) { var at = v ? D.b.x : D.b.y; geomStyle(v ? { x: at - 0.15, y: 0, w: 0.3, h: 1 } : { x: 0, y: at - 0.15, w: 1, h: 0.3 }).split(";").forEach(function(p){ var kv = p.split(":"); if ((v && kv[0] === "left") || (!v && kv[0] === "top")) sm2.style[kv[0]] = kv.slice(1).join(":"); }); }
      lsFeedback(sl, [D.a, D.b], [{ b: D.a, par: D.a.parent || "", hit0: D.ha }, { b: D.b, par: D.b.parent || "", hit0: D.hb }], D.a.parent || "");
      return;
    }
    if (lsDrag.mode === "move") {
      var dx = lsSnap(c.fx - lsDrag.fx, unit), dy = lsSnap(c.fy - lsDrag.fy, unit);
      lsDrag.tops.forEach(function(m){ dx = Math.max(-m.x, Math.min(GC - m.x - m.b.w, dx)); dy = Math.max(-m.y, Math.min(GR - m.y - m.b.h, dy)); });
      if (dx !== 0 || dy !== 0) lsDrag.moved = true;
      lsDrag.items.forEach(function(i){ i.b.x = i.x + dx; i.b.y = i.y + dy; lsApplyEl(i.b); }); lsFramePos(); lsLinksLive();
      var tgt = lsDropTarget(sl, c.fx, c.fy, lsDrag.excl); lsDrag.tgt = tgt;
      [].forEach.call(lcvEl().querySelectorAll(".ldrop"), function(e){ e.classList.remove("ldrop"); }); if (tgt && lsDrag.moved) { var te = boxEl(tgt.id); if (te) te.classList.add("ldrop"); }
      var bbx = lsBBox(lsDrag.tops.map(function(m){ return m.b; }));
      if (!lsDrag.excl) lsDrag.excl = []; lsFeedback(sl, lsDrag.tops.map(function(m){ return m.b; }), lsDrag.tops, tgt ? tgt.id : "");
      if (lsDrag.moved && bbx) lsGuides(sl, { x0: bbx.x0, y0: bbx.y0, x1: bbx.x1, y1: bbx.y1 }, lsDrag.excl, tgt);
      return;
    }
    var b = lsDrag.b, o = lsDrag.o, hd = lsDrag.h, k = lsKind(b.kind), bd = lsBounds(sl, b), lim = lsDrag.lim;
    var mw = lim ? lim.Wmin : k.mw, mh = lim ? lim.Hmin : k.mh, kw = lim ? lim.Wmax : k.xw, kh = lim ? lim.Hmax : k.xh;
    var rx = lsSnap(c.fx - lsDrag.fx, unit), ry = lsSnap(c.fy - lsDrag.fy, unit), x1 = o.x, y1 = o.y, x2 = o.x + o.w, y2 = o.y + o.h;
    if (ev.altKey) {
      // from the centre, in half-cell steps; corners keep the proportions
      var cx = o.x + o.w / 2, cyy = o.y + o.h / 2, sx = hd.indexOf("e") !== -1 ? 1 : hd.indexOf("w") !== -1 ? -1 : 0, sy = hd.indexOf("s") !== -1 ? 1 : hd.indexOf("n") !== -1 ? -1 : 0;
      var maxW = Math.min(kw, 2 * Math.min(cx - bd.x0, bd.x1 - cx)), maxH = Math.min(kh, 2 * Math.min(cyy - bd.y0, bd.y1 - cyy)), gx = sx * rx, gy = sy * ry;
      if (sx && sy) {
        var f = Math.abs(gx / o.w) >= Math.abs(gy / o.h) ? 1 + 2 * gx / o.w : 1 + 2 * gy / o.h, fmin = Math.max(mw / o.w, mh / o.h), fmax = Math.max(fmin, Math.min(maxW / o.w, maxH / o.h));
        f = Math.max(fmin, Math.min(fmax, f)); gx = Math.round((f - 1) * o.w / 2 / unit) * unit; gy = Math.round((f - 1) * o.h / 2 / unit) * unit;
      }
      if (sx) gx = Math.max((mw - o.w) / 2, Math.min((maxW - o.w) / 2, gx)); else gx = 0;
      if (sy) gy = Math.max((mh - o.h) / 2, Math.min((maxH - o.h) / 2, gy)); else gy = 0;
      x1 = o.x - gx; x2 = o.x + o.w + gx; y1 = o.y - gy; y2 = o.y + o.h + gy;
    } else {
      if (hd.indexOf("w") !== -1) x1 = Math.max(bd.x0, Math.min(x2 - mw, o.x + rx));
      if (hd.indexOf("e") !== -1) x2 = Math.min(bd.x1, Math.max(x1 + mw, o.x + o.w + rx));
      if (hd.indexOf("n") !== -1) y1 = Math.max(bd.y0, Math.min(y2 - mh, o.y + ry));
      if (hd.indexOf("s") !== -1) y2 = Math.min(bd.y1, Math.max(y1 + mh, o.y + o.h + ry));
      if (x2 - x1 > kw) { if (hd.indexOf("w") !== -1) x1 = x2 - kw; else x2 = x1 + kw; }
      if (y2 - y1 > kh) { if (hd.indexOf("n") !== -1) y1 = y2 - kh; else y2 = y1 + kh; }
    }
    b.x = x1; b.y = y1; b.w = x2 - x1; b.h = y2 - y1;
    if (lsDrag.snap) { lsScaleKids(b, lsDrag.snap); lsDrag.snap.kids.forEach(function(q){ lsApplyEl(q.b); }); }
    if (b.x !== o.x || b.y !== o.y || b.w !== o.w || b.h !== o.h) lsDrag.moved = true;
    lsApplyEl(b); lsFramePos(); lsLinksLive(); lsFeedback(sl, [b], [{ b: b, par: b.parent || "", hit0: lsDrag.hit0 }], b.parent || "");
    if (lsDrag.moved) lsGuides(sl, { x0: b.x, y0: b.y, x1: b.x + b.w, y1: b.y + b.h }, lsDesc(sl, [b.id]), lsById(sl, b.parent));
  });
  document.addEventListener("mouseup", function(){
    if (!lsDrag) return; var d = lsDrag; lsDrag = null; document.body.classList.remove("ls-dragging"); document.body.removeAttribute("data-lsh"); lsGuidesOff();
    var cv = lcvEl(); if (cv) [].forEach.call(cv.querySelectorAll(".ldrop"), function(e){ e.classList.remove("ldrop"); });
    if (d.mode === "marq") { var mq = cv && cv.querySelector(".lmarq"); if (mq) mq.remove(); if (!d.moved && !d.add) lsSetSel([]); lessonFrame(); lessonPanelRefresh(); return; }
    if (!d.moved) {
      if (lessonEd) lessonEd.hist.undo.pop();
      if (d.toggleOff) { lsSetSel(lessonEd.ids.filter(function(i){ return i !== d.toggleOff; })); lessonFrame(); lessonPanelRefresh(); }
      else if (d.clickSel) { lsSetSel([d.clickSel]); lessonFrame(); lessonPanelRefresh(); }
      return;
    }
    if (d.mode === "move") {
      var sl = curSlide(), why = lsDrop(sl, d, d.tgt);
      if (why) { lsRevert(); lsAfter(); lsWarn(why === "overlap" ? "That would land on another module. Turn Overlap on in the toolbar to stack modules." : "It doesn't fit there. Make the container bigger or remove something first."); return; }
    } else if (d.mode === "seam") {
      var sl3 = curSlide();
      if (!sl3.overlap && (lsNewHits(sl3, d.a, d.ha, lsDesc(sl3, [d.a.id, d.b.id])).length || lsNewHits(sl3, d.b, d.hb, lsDesc(sl3, [d.a.id, d.b.id])).length)) { lsRevert(); lsAfter(); lsWarn("That would land on another module. Turn Overlap on in the toolbar to stack modules."); return; }
    } else if (d.mode === "size") {
      var sl2 = curSlide();
      if (!sl2.overlap && lsNewHits(sl2, d.b, d.hit0, lsDesc(sl2, [d.b.id])).length) { lsRevert(); lsAfter(); lsWarn("That would land on another module. Turn Overlap on in the toolbar to stack modules."); return; }
    }
    lsAfter();
  });
  document.addEventListener("keydown", function(ev){
    if (ev.key === "Escape" && lsCtx) { lsCtxClose(); return; }
    if (ev.key === "Escape" && lessonEd && (lessonEd.menu || lessonEd.lmenu)) { lessonEd.menu = lessonEd.lmenu = false; lessonPanelRefresh(); return; }
    if (!lsEdit() || !currentSession || !currentSession.lesson) return;
    var tg = ev.target, typing = tg && (tg.tagName === "INPUT" || tg.tagName === "TEXTAREA" || tg.tagName === "SELECT" || tg.isContentEditable);
    if (typing) return;
    var mod = ev.ctrlKey || ev.metaKey, key = (ev.key || "").toLowerCase();
    if (mod && key === "z") { ev.preventDefault(); if (ev.shiftKey) lsRedo(); else lsUndo(); return; }
    if (mod && key === "y") { ev.preventDefault(); lsRedo(); return; }
    if (mod && key === "d") { ev.preventDefault(); lsDupSel(); return; }
    if (mod && key === "g") { ev.preventDefault(); lsGroup(); return; }
    if (mod && key === "c") { ev.preventDefault(); lsCopy(false); return; }
    if (mod && key === "x") { ev.preventDefault(); lsCopy(true); return; }
    if (mod && key === "v") { ev.preventDefault(); lsPaste(null); return; }
    if (mod && (ev.key === "]" || ev.key === "}")) { ev.preventDefault(); lsZ(ev.shiftKey ? "front" : "fwd"); return; }
    if (mod && (ev.key === "[" || ev.key === "{")) { ev.preventDefault(); lsZ(ev.shiftKey ? "back" : "bwd"); return; }
    if (ev.key === "Tab" && !mod) { ev.preventDefault(); lsTabSel(ev.shiftKey ? -1 : 1); return; }
    if (mod && key === "a") { ev.preventDefault(); lsSetSel(boxesOf(curSlide()).map(function(b){ return b.id; })); lessonFrame(); lessonPanelRefresh(); return; }
    if (ev.key === "Escape") { lsSetSel([]); lessonFrame(); lessonPanelRefresh(); return; }
    if (!mod && (ev.key === "Delete" || ev.key === "Backspace")) { if (lessonEd.ids.length) { ev.preventDefault(); lsDeleteSel(); } return; }
    var st = ev.shiftKey ? 0.5 : 1, dir = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[ev.key];
    if (dir && lessonEd.ids.length) {
      ev.preventDefault(); var sl = curSlide(), tops = lsTopSel(sl), pre = lsSnapStr(), h0 = tops.map(function(b){ return lsOverlapIds(sl, b); }), ex = lsDesc(sl, lessonEd.ids);
      lsShift(dir[0], dir[1]);
      if (!sl.overlap && tops.some(function(b, i){ return lsNewHits(sl, b, h0[i], ex).length; })) { lsApplySnap(pre); lsAfter(); lsWarn("That would land on another module. Turn Overlap on in the toolbar to stack modules."); return; }
      var now = Date.now(); if (now - lsNudgeAt > 700) { lessonEd.hist.undo.push(pre); lessonEd.hist.redo = []; } lsNudgeAt = now; lsAfter();
    }
  });
  document.addEventListener("focusin", function(ev){
    var f = ev.target.getAttribute && ev.target.getAttribute("data-lf"); if (!lessonEd || !f) return;
    if (f !== "lay.name") lsPush();
    var b = curBox(); lsFocus = (b && b.kind === "container" && /^b\.[wh]$/.test(f)) ? { id: b.id, snap: lsKidsSnap(curSlide(), b) } : null;
  });
  document.getElementById("app").addEventListener("click", function(ev){
    var s = currentSession;
    if (lessonEd && (lessonEd.menu || lessonEd.lmenu) && !ev.target.closest(".lbar-menu")) { lessonEd.menu = lessonEd.lmenu = false; lessonPanelRefresh(); }
    if (ev.target.closest && ev.target.closest(".lctx-subbtn")) return;
    if (lsCtx) lsCtxClose();
    var t = ev.target.closest("[data-action]");
    if (!t) return;
    var a = t.getAttribute("data-action");
    if (a === "open-lesson") { ev.stopPropagation(); openLesson(t.getAttribute("data-type"), t.getAttribute("data-level")); return; }
    if (!s || !s.lesson) return;
    if (lessonEd && lessonEd.previewing) return;
    var slides = lessonSlidesMut(), i = parseInt(t.getAttribute("data-i"), 10), sl = lessonEd ? slides[lessonEd.sel] : null, b = lessonEd ? curBox() : null;
    if (lessonEd && lessonEd.mode === "edit" && t.closest(".lbox")) return;   // stage buttons do nothing while editing
    var edit = lsEdit();
    if (edit && /^lesson-(flag|sq|adv|tog|pk|help|anim|al|del|up|down|newslide|cstyle|wmode|wadd|wdel|wup|wdown|wplace|wnext|lay-apply|lay-new)$/.test(a)) lsPush();
    if (a === "lesson-next") { if (s.phase === "lesson" || s.phase === "answer" || s.phase === "walk") lessonAdvance(s); }
    else if (a === "lesson-restart") { s.correct = 0; s.attempts = 0; s.streak = 0; s.phase = "lesson"; lessonGo(s, 0); }
    else if (a === "lesson-mode" && lessonEd) { lessonEd.mode = t.getAttribute("data-m"); lessonEd.menu = lessonEd.lmenu = false; lessonGo(s, s.lesson.idx); }
    else if (a === "lesson-sel") { if (!isNaN(i)) lessonGo(s, i); }
    else if (a === "lesson-box" && lessonEd) { lsSetSel([t.getAttribute("data-id")]); lessonFrame(); lessonPanelRefresh(); }
    else if (a === "lesson-selall" && lessonEd) { lsSetSel(boxesOf(sl).map(function(x){ return x.id; })); lessonFrame(); lessonPanelRefresh(); }
    else if (a === "lesson-menu" && lessonEd) { lessonEd.menu = !lessonEd.menu; lessonEd.lmenu = false; lessonPanelRefresh(); }
    else if (a === "lesson-lmenu" && lessonEd) { lessonEd.lmenu = !lessonEd.lmenu; lessonEd.menu = false; lessonPanelRefresh(); }
    else if (a === "lesson-addmod" && sl) {
      lessonEd.menu = false; var kind = t.getAttribute("data-k"), sel1 = curBox(), parent = null;
      if (sel1) parent = sel1.kind === "container" ? sel1 : (sel1.parent ? lsById(sl, sel1.parent) : null);
      var snap = lsSnapStr(), nb = addModule(sl, kind, parent || null, t.getAttribute("data-p") === "walk" ? { walk: true } : null, null);
      if (!nb) { lessonPanelRefresh(); lsWarn(parent ? "No room inside the container. Make it bigger or remove something." : "No room for another module here. Remove or shrink one first, or turn Overlap on."); return; }
      lessonEd.hist.undo.push(snap); lessonEd.hist.redo = []; lsSetSel([nb.id]); lsAfter();
    }
    else if (a === "lesson-lay-save" && sl) { var nm = (lessonEd.lname || "").trim() || "Layout " + (lsLayouts.length + 1); lsLayouts.push({ id: uid(), name: nm, boxes: JSON.parse(JSON.stringify(sl.boxes)) }); lessonEd.lname = ""; saveLessons(); lessonPanelRefresh(); lsWarn("Saved the layout “" + nm + "”."); }
    else if (a === "lesson-lay-apply" && sl) { var lay = lsFindLayout(t.getAttribute("data-id")); if (lay) { sl.boxes = lsLayoutBoxes(lay); lessonEd.lmenu = false; lsSetSel([]); lsAfter(); } }
    else if (a === "lesson-lay-new" && lessonEd) { var lay2 = lsFindLayout(t.getAttribute("data-id")); if (lay2) { var ns = slideFrom(null); ns.boxes = lsLayoutBoxes(lay2); ns.sq = false; slides.splice(lessonEd.sel + 1, 0, ns); lessonEd.lmenu = false; saveLessons(); lessonGo(s, lessonEd.sel + 1); } }
    else if (a === "lesson-lay-del") { lsLayouts = lsLayouts.filter(function(l){ return l.id !== t.getAttribute("data-id"); }); saveLessons(); lessonPanelRefresh(); }
    else if (a === "lesson-undo") lsUndo();
    else if (a === "lesson-redo") lsRedo();
    else if (a === "lesson-preview") lessonPreview();
    else if (a === "lesson-newslide" && lessonEd) { slides.splice(lessonEd.sel + 1, 0, slideFrom(slides[lessonEd.sel])); saveLessons(); lessonGo(s, lessonEd.sel + 1); }
    else if (a === "lesson-del" && slides.length > 1) { ev.stopPropagation(); slides.splice(i, 1); saveLessons(); lessonGo(s, Math.min(lessonEd.sel, slides.length - 1)); }
    else if (a === "lesson-up" || a === "lesson-down") { ev.stopPropagation(); var j = a === "lesson-up" ? i - 1 : i + 1; if (j >= 0 && j < slides.length) { var tmp = slides[i]; slides[i] = slides[j]; slides[j] = tmp; saveLessons(); lessonGo(s, j); } }
    else if (a === "lesson-flag" && sl) { sl.flag = t.getAttribute("data-v"); lessonChanged(false); }
    else if (a === "lesson-sq" && sl) { sl.sq = !sl.sq; lessonChanged(true); }
    else if (a === "lesson-adv" && sl) { sl.adv = { mode: t.getAttribute("data-v") }; lessonChanged(false); }
    else if (a === "lesson-tog" && b) { b[t.getAttribute("data-k")] = !b[t.getAttribute("data-k")]; lessonChanged(true); }
    else if (a === "lesson-al" && b) { b[t.getAttribute("data-k")] = t.getAttribute("data-v"); lessonChanged(true); }
    else if (a === "lesson-cstyle" && b) { b.style = t.getAttribute("data-v"); lessonChanged(true); }
    else if (a === "lesson-pk" && b) { var pv = t.getAttribute("data-v"), kk = t.getAttribute("data-k"); b.pk[kk] = kk === "names" ? pv === "1" : pv; s.lesson.pk = {}; lessonChanged(true); }
    else if (a === "lesson-help" && b) { b.helper = t.getAttribute("data-id"); lessonChanged(true); }
    else if (a === "lesson-anim" && b) { b.anim[t.getAttribute("data-k")] = t.getAttribute("data-v"); lessonChanged(false); }
    else if (a === "lesson-wplace" && b) { b.wPlace = t.getAttribute("data-v"); lessonChanged(true); }
    else if (a === "lesson-wnext" && b) { b.wNext = t.getAttribute("data-v"); lessonChanged(true); }
    else if (a === "lesson-wmode" && lessonEd) { var wk0 = lsWalk(lessonEd.typeId); wk0.mode = t.getAttribute("data-v"); if (wk0.mode !== "auto" && !wk0.steps.length) wk0.steps = [{ t: "Look at the note", x: "This note is {name}." }]; lessonChanged(true); }
    else if (a === "lesson-wadd" && lessonEd) { lsWalk(lessonEd.typeId).steps.push({ t: "", x: "" }); lessonChanged(true); }
    else if (a === "lesson-wdel" && lessonEd) { lsWalk(lessonEd.typeId).steps.splice(parseInt(t.getAttribute("data-j"), 10), 1); lessonChanged(true); }
    else if ((a === "lesson-wup" || a === "lesson-wdown") && lessonEd) { var ws = lsWalk(lessonEd.typeId).steps, wj = parseInt(t.getAttribute("data-j"), 10), wk = a === "lesson-wup" ? wj - 1 : wj + 1; if (wk >= 0 && wk < ws.length) { var wt = ws[wj]; ws[wj] = ws[wk]; ws[wk] = wt; lessonChanged(true); } }
    else if (a === "lesson-overlap" && sl) { sl.overlap = !sl.overlap; lessonChanged(false); lsWarn(sl.overlap ? "Overlap is on for this slide: modules can be stacked." : "Overlap is off: modules are kept apart."); }
    else if (a === "lesson-z") lsZ(t.getAttribute("data-v"));
    else if (a === "lesson-copy") lsCopy(false);
    else if (a === "lesson-cut") lsCopy(true);
    else if (a === "lesson-paste-at") lsPaste(lessonEd.ctxAt);
    else if ((a === "lesson-addat" || a === "lesson-addat-c") && sl) {
      var at = lessonEd.ctxAt || { x: 8, y: 6, parent: "" }, par = at.parent ? lsById(sl, at.parent) : null, kd = a === "lesson-addat-c" ? "container" : t.getAttribute("data-k"), sn0 = lsSnapStr();
      var nb2 = addModule(sl, kd, par, t.getAttribute("data-p") === "walk" ? { walk: true } : null, at);
      if (!nb2) { lsWarn(par ? "No room inside the container. Make it bigger or remove something." : "No room for another module here. Remove or shrink one first, or turn Overlap on."); return; }
      lessonEd.hist.undo.push(sn0); lessonEd.hist.redo = []; lsSetSel([nb2.id]); lsAfter();
    }
    else if (a === "lesson-group") lsGroup();
    else if (a === "lesson-ungroup") lsUngroup();
    else if (a === "lesson-align") lsAlign(t.getAttribute("data-v"));
    else if (a === "lesson-dupsel") lsDupSel();
    else if (a === "lesson-boxdel") lsDeleteSel();
  });
  document.getElementById("app").addEventListener("input", function(ev){
    var f = ev.target.getAttribute && ev.target.getAttribute("data-lf"); if (!f || !lessonEd) return;
    if (f === "lay.name") { lessonEd.lname = ev.target.value; return; }
    var sl = curSlide(); if (!sl) return; var b = curBox(), v = ev.target.value, wm = /^w\.([tx])\.(\d+)$/.exec(f), wsteps = lsWalk(lessonEd.typeId).steps, geo = /^b\.[xywh]$/.test(f);
    if (f === "s.title") sl.title = v; else if (f === "s.note") sl.note = v;
    else if (wm && wsteps[+wm[2]]) wsteps[+wm[2]][wm[1]] = v;
    else if (b && f === "b.title") b.title = v; else if (b && f === "b.text") b.text = v; else if (b && f === "b.label") b.label = v;
    else if (b && f === "b.count") b.count = Math.max(1, Math.min(30, parseInt(v, 10) || 5));
    else if (b && f === "b.n") b.pk.n = Math.max(1, Math.min(30, parseInt(v, 10) || 3));
    else if (b && f === "b.wFrom") b.wFrom = Math.max(1, parseInt(v, 10) || 1);
    else if (b && f === "b.wTo") b.wTo = Math.max(0, parseInt(v, 10) || 0);
    else if (b && geo) {
      var key = f.charAt(2), n = parseFloat(v); if (isNaN(n)) return; n = Math.round(n * 2) / 2; var pre = lsSnapStr(), hit0 = lsOverlapIds(sl, b), exb = lsDesc(sl, [b.id]), bid = b.id;
      if (b.kind === "container" && (key === "w" || key === "h")) {
        var sn = lsFocus && lsFocus.id === b.id ? lsFocus.snap : lsKidsSnap(sl, b), lim = lsLim(b, sn), bd = lsBounds(sl, b);
        if (key === "w") b.w = Math.max(lim.Wmin, Math.min(lim.Wmax, Math.min(bd.x1 - bd.x0, n))); else b.h = Math.max(lim.Hmin, Math.min(lim.Hmax, Math.min(bd.y1 - bd.y0, n)));
        b.x = Math.max(bd.x0, Math.min(bd.x1 - b.w, b.x)); b.y = Math.max(bd.y0, Math.min(bd.y1 - b.h, b.y));
        lsScaleKids(b, sn); sn.kids.forEach(function(q){ lsApplyEl(q.b); });
      } else {
        var ox = b.x, oy = b.y; b[key] = n; lsLimitGeo(sl, b);
        if (b.kind === "container" && (b.x !== ox || b.y !== oy)) { lsShiftTree(sl, b, b.x - ox, b.y - oy); lsDesc(sl, [b.id]).forEach(function(i){ var q = lsById(sl, i); if (q) lsApplyEl(q); }); }
      }
      if (!sl.overlap && lsNewHits(sl, b, hit0, exb).length) { lsApplySnap(pre); saveLessons(); var s0 = currentSession; if (s0 && s0.lesson) lessonRender(s0, { again: true }); lsWarn("That would land on another module. Turn Overlap on in the toolbar to stack modules."); return; }
      lsApplyEl(b); lsFramePos();
    }
    saveLessons();
    var s = currentSession; if (s && s.lesson && f !== "s.note" && f !== "s.title" && !geo) lessonRender(s, { again: true });
    if (f === "s.title") { var row = document.querySelector(".lsrow.on .lsr-t"); if (row) row.textContent = v || "No title"; }
  });

  // ----- fitting: put a box into a parent (or the stage) at its place; what it touches is bumped away and shrunk toward its smallest, a container's contents scale with it -----
  function lsFit(sl, nb, R, pid){
    var sib = boxesOf(sl).filter(function(b){ return b !== nb && (b.parent || "") === pid; });
    var nsn = nb.kind === "container" ? lsKidsSnap(sl, nb) : null;
    var W = bumpPairs(sl, sib, nb, R) || repackAdd(sl, sib, nb, R); if (!W) return false;
    var todo = [];
    W.forEach(function(w){ if (!w.ref) { nb.x = w.x; nb.y = w.y; nb.w = w.w; nb.h = w.h; } else todo.push({ b: w.ref, w: w, sn: w.ref.kind === "container" ? lsKidsSnap(sl, w.ref) : null }); });
    todo.forEach(function(t){ t.b.x = t.w.x; t.b.y = t.w.y; t.b.h = t.w.h; if (t.sn) lsScaleKids(t.b, t.sn); });
    if (nsn) lsScaleKids(nb, nsn);
    return true;
  }
  // A new module takes its place (where you right-clicked, or the standard place, inside the selected container if there is one). With Overlap off nothing may end up on top of anything else.
  function addModule(sl, kind, parent, preset, at){
    var k = lsKind(kind), R = parent ? lsInner(parent) : lsGridR();
    if (R.x1 - R.x0 < k.mw || R.y1 - R.y0 < k.mh) return null;
    var nb = newBox(kind, R); if (preset) Object.assign(nb, preset);
    if (at) { nb.x = Math.max(R.x0, Math.min(R.x1 - nb.w, Math.round((at.x - nb.w / 2) * 2) / 2)); nb.y = Math.max(R.y0, Math.min(R.y1 - nb.h, Math.round((at.y - nb.h / 2) * 2) / 2)); }
    var pid = parent ? parent.id : "";
    if (!sl.overlap && !lsFit(sl, nb, R, pid)) return null;
    nb.parent = pid; sl.boxes.push(nb); return nb;
  }
  // ----- a container's contents follow it: empty space inside goes first, then the contents scale (never below half a cell, never past a module's own smallest / biggest) -----
  function lsKidsSnap(sl, b){
    var ids = lsDesc(sl, [b.id]).filter(function(i){ return i !== b.id; });
    var kids = boxesOf(sl).filter(function(k){ return ids.indexOf(k.id) !== -1; }).map(function(k){ return { b: k, x: k.x, y: k.y, w: k.w, h: k.h }; });
    return { oi: lsInner(b), top: b.title ? 1.5 : 0.5, kids: kids, bb: kids.length ? lsBBox(kids.map(function(q){ return q.b; })) : null };
  }
  function lsLim(b, sn){
    var k = lsKind(b.kind), top = sn.top, a = { Wmin: k.mw, Wmax: k.xw, Hmin: k.mh, Hmax: k.xh };
    if (!sn.kids.length) return a;
    var ow = sn.oi.x1 - sn.oi.x0, oh = sn.oi.y1 - sn.oi.y0, cw = sn.bb.x1 - sn.bb.x0, ch = sn.bb.y1 - sn.bb.y0, sx0 = 0, sx1 = 99, sy0 = 0, sy1 = 99;
    sn.kids.forEach(function(q){ var kk = lsKind(q.b.kind); sx0 = Math.max(sx0, kk.mw / q.w); sx1 = Math.min(sx1, kk.xw / q.w); sy0 = Math.max(sy0, kk.mh / q.h); sy1 = Math.min(sy1, kk.xh / q.h); });
    a.Wmin = Math.max(k.mw, Math.ceil(cw * Math.min(1, sx0) * 2) / 2 + 1); a.Wmax = Math.max(a.Wmin, Math.min(k.xw, ow * sx1 + 1));
    a.Hmin = Math.max(k.mh, Math.ceil(ch * Math.min(1, sy0) * 2) / 2 + top + 0.5); a.Hmax = Math.max(a.Hmin, Math.min(k.xh, oh * sy1 + top + 0.5));
    return a;
  }
  function lsAxis(i0, i1, n0, n1, c0, c1){
    var ow = i1 - i0, nw = n1 - n0, cw = c1 - c0;
    if (nw >= ow - 1e-9) { var s = ow > 0 ? nw / ow : 1; return { sc: s, f: function(p){ return n0 + (p - i0) * s; } }; }
    if (nw >= cw - 1e-9) { var slack = ow - cw, ml = (c0 - i0) * (slack > 0 ? (nw - cw) / slack : 0); return { sc: 1, f: function(p){ return n0 + ml + (p - c0); } }; }
    var t = cw > 0 ? nw / cw : 1; return { sc: t, f: function(p){ return n0 + (p - c0) * t; } };
  }
  function lsScaleKids(b, sn){
    if (!sn.kids.length) return;
    var ni = lsInner(b), ax = lsAxis(sn.oi.x0, sn.oi.x1, ni.x0, ni.x1, sn.bb.x0, sn.bb.x1), ay = lsAxis(sn.oi.y0, sn.oi.y1, ni.y0, ni.y1, sn.bb.y0, sn.bb.y1);
    sn.kids.forEach(function(q){
      var kk = lsKind(q.b.kind), w = Math.max(kk.mw, Math.min(kk.xw, Math.round(q.w * ax.sc * 2) / 2)), h = Math.max(kk.mh, Math.min(kk.xh, Math.round(q.h * ay.sc * 2) / 2));
      w = Math.min(w, ni.x1 - ni.x0); h = Math.min(h, ni.y1 - ni.y0);
      var x = Math.round(ax.f(q.x) * 2) / 2, y = Math.round(ay.f(q.y) * 2) / 2;
      q.b.w = w; q.b.h = h; q.b.x = Math.max(ni.x0, Math.min(ni.x1 - w, x)); q.b.y = Math.max(ni.y0, Math.min(ni.y1 - h, y));
    });
  }
  // stacking order = the order in the list; a container and what is inside it stay together
  function lsRenderOrder(sl){
    var all = boxesOf(sl), out = [];
    (function add(list){ list.forEach(function(b){ out.push(b); add(all.filter(function(k){ return k.parent === b.id; })); }); })(all.filter(function(b){ return !b.parent || !lsById(sl, b.parent); }));
    return out;
  }
  function lsOverlapIds(sl, b){ return boxesOf(sl).filter(function(o){ return o !== b && (o.parent || "") === (b.parent || "") && overlap(o, b); }).map(function(o){ return o.id; }); }
  function lsNewHits(sl, b, hit0, excl){ return lsOverlapIds(sl, b).filter(function(i){ return hit0.indexOf(i) === -1 && (!excl || excl.indexOf(i) === -1); }); }
  function lsApplySnap(str){
    var o = JSON.parse(str), k = lessonKey(lessonEd.typeId, lessonEd.levelId); lessons[k] = o.l; if (o.w) walks[lessonEd.typeId] = o.w; else delete walks[lessonEd.typeId]; lsPrune();
  }
  function lsRevert(){ if (lessonEd && lessonEd.hist.undo.length) { lsApplySnap(lessonEd.hist.undo.pop()); } }
  function lsZ(act){
    var sl = curSlide(), sel = selBoxes(); if (!sel.length) return; lsPush(); var arr = sl.boxes;
    (act === "fwd" || act === "front" ? sel.slice().reverse() : sel).forEach(function(b){
      var sib = arr.filter(function(o){ return (o.parent || "") === (b.parent || ""); }), at = sib.indexOf(b), i = arr.indexOf(b);
      if (act === "front") { var last = sib[sib.length - 1]; if (last === b) return; arr.splice(i, 1); arr.splice(arr.indexOf(last) + 1, 0, b); }
      else if (act === "back") { var first = sib[0]; if (first === b) return; arr.splice(i, 1); arr.splice(arr.indexOf(first), 0, b); }
      else if (act === "fwd") { var nx = sib[at + 1]; if (!nx) return; arr.splice(i, 1); arr.splice(arr.indexOf(nx) + 1, 0, b); }
      else { var pv = sib[at - 1]; if (!pv) return; arr.splice(i, 1); arr.splice(arr.indexOf(pv), 0, b); }
    });
    lsAfter();
  }
  // select what is under the pointer, one deeper each time (Alt + click), or the next / previous module in stacking order (Tab)
  function lsCycleAt(ev, sl){
    var order = lsRenderOrder(sl).slice().reverse(), at = order.filter(function(b){ var e = boxEl(b.id); if (!e) return false; var q = e.getBoundingClientRect(); return ev.clientX >= q.left && ev.clientX <= q.right && ev.clientY >= q.top && ev.clientY <= q.bottom; });
    if (!at.length) return; var cur = curBox(), i = cur ? at.indexOf(cur) : -1; lsSetSel([at[(i + 1) % at.length].id]); lessonFrame(); lessonPanelRefresh();
  }
  function lsTabSel(dir){
    var order = lsRenderOrder(curSlide()); if (!order.length) return; var cur = curBox(), i = cur ? order.indexOf(cur) : (dir > 0 ? -1 : 0);
    lsSetSel([order[(i + dir + order.length) % order.length].id]); lessonFrame(); lessonPanelRefresh();
  }
  // ----- copy / cut / paste (a module or a group, also onto another slide or level) -----
  var lsClip = null, lsPasteN = 0;
  function lsCopy(cut){
    var sl = curSlide(), tops = selBoxes(); if (!tops.length) { lsWarn("Select something to copy first."); return; }
    var ids = lsDesc(sl, tops.map(function(b){ return b.id; }));
    lsClip = { src: sl.id, roots: tops.map(function(b){ return b.id; }), boxes: JSON.parse(JSON.stringify(boxesOf(sl).filter(function(b){ return ids.indexOf(b.id) !== -1; }))) }; lsPasteN = 0;
    if (cut) lsDeleteSel(); else lsWarn("Copied " + tops.length + " module" + (tops.length === 1 ? "" : "s") + ". Ctrl+V pastes.");
  }
  function lsPaste(at){
    if (!lsClip || !lsClip.boxes.length) { lsWarn("Nothing copied yet."); return; }
    var sl = curSlide(), sel1 = curBox(), parent = at && at.parent ? lsById(sl, at.parent) : (sel1 ? (sel1.kind === "container" ? sel1 : lsById(sl, sel1.parent)) : null);
    var R = parent ? lsInner(parent) : lsGridR(), pid = parent ? parent.id : "", snap = lsSnapStr(), map = {}, copy = JSON.parse(JSON.stringify(lsClip.boxes)), holes = 0, roots = [];
    copy.forEach(function(b){ map[b.id] = uid(); });
    var rootOld = lsClip.roots, off = (lsClip.src === sl.id && !at ? 1 : 0) + (at ? 0 : lsPasteN);
    var rb = lsBBox(copy.filter(function(b){ return rootOld.indexOf(b.id) !== -1; }));
    if (rb.x1 - rb.x0 > R.x1 - R.x0 || rb.y1 - rb.y0 > R.y1 - R.y0) { lsWarn("That doesn't fit here. Make the container bigger first."); return; }
    var dx, dy; if (at) { dx = Math.round((at.x - (rb.x1 - rb.x0) / 2 - rb.x0) * 2) / 2; dy = Math.round((at.y - (rb.y1 - rb.y0) / 2 - rb.y0) * 2) / 2; } else { dx = off; dy = off; }
    dx = Math.max(R.x0 - rb.x0, Math.min(R.x1 - rb.x1, dx)); dy = Math.max(R.y0 - rb.y0, Math.min(R.y1 - rb.y1, dy));
    copy.forEach(function(b){
      var isRoot = rootOld.indexOf(b.id) !== -1, old = b.id; b.id = map[old]; b.lid = uid(); b.parent = isRoot ? pid : (map[b.parent] || pid); b.x += dx; b.y += dy;
      if (lsOneOnly(b) && kindTaken(sl, b.kind)) { b.kind = "blank"; b.title = ""; b.text = ""; b.helper = ""; b.walk = false; holes++; }
      if (isRoot) roots.push(b); sl.boxes.push(b);
    });
    if (!sl.overlap) for (var i = 0; i < roots.length; i++) if (!lsFit(sl, roots[i], R, pid)) { lsApplySnap(snap); lsAfter(); lsWarn("No room to paste here. Remove or shrink something first, or turn Overlap on."); return; }
    lessonEd.hist.undo.push(snap); lessonEd.hist.redo = []; lsPasteN++; lsSetSel(roots.map(function(b){ return b.id; })); lsAfter();
    if (holes) lsWarn(holes + " one-only module" + (holes === 1 ? "" : "s") + " became placeholder" + (holes === 1 ? "" : "s") + " (the slide already has one).");
  }
  // dotted lines between the question, its answer and its feedback (editor only)
  function lsLinksHtml(sl){
    var q = boxOfKind(sl, "question"), a = boxOfKind(sl, "answer"), m = boxOfKind(sl, "message"), pairs = [];
    if (q && a) pairs.push([q, a]); if (a && m) pairs.push([a, m]); if (q && m && !a) pairs.push([q, m]);
    function seg(a0, a1, b0, b1){ var lo = Math.max(a0, b0), hi = Math.min(a1, b1); if (lo <= hi) { var m = (lo + hi) / 2; return [m, m]; } return a1 < b0 ? [a1, b0] : [a0, b1]; }
    var lines = [];
    pairs.forEach(function(p){
      var X = seg(p[0].x, p[0].x + p[0].w, p[1].x, p[1].x + p[1].w), Y = seg(p[0].y, p[0].y + p[0].h, p[1].y, p[1].y + p[1].h);
      if (Math.abs(X[0] - X[1]) < 1e-6 && Math.abs(Y[0] - Y[1]) < 1e-6) return;
      lines.push('<line x1="' + X[0] + '" y1="' + Y[0] + '" x2="' + X[1] + '" y2="' + Y[1] + '" />');
    });
    return lines.length ? '<svg class="llinks" viewBox="0 0 ' + GC + ' ' + GR + '" preserveAspectRatio="none">' + lines.join("") + '</svg>' : "";
  }
  function lsLinksLive(){ var cv = lcvEl(), sl = curSlide(); if (!cv || !sl) return; var o = cv.querySelector(".llinks"); if (o) o.remove(); cv.insertAdjacentHTML("beforeend", lsLinksHtml(sl)); }
  function lsFeedback(sl, bs, tops, pid){
    var cv = lcvEl(); if (!cv) return;
    [].forEach.call(cv.querySelectorAll(".lbad"), function(e){ e.classList.remove("lbad"); });
    if (sl.overlap) return; var ex = lsDrag && lsDrag.excl ? lsDrag.excl : bs.map(function(b){ return b.id; });
    bs.forEach(function(b, i){ var t = tops[i]; if (!t || (t.par || "") !== pid) return; if (lsNewHits(sl, b, t.hit0 || [], ex).length) { var e = boxEl(b.id); if (e) e.classList.add("lbad"); } });
  }

  // ---------- Boot (STUDENT SITE: published settings, this Chromebook's own scores) ----------
  db = window.StudentBackend; storageMode = "indexeddb";
  window.STUDENT_READY.then(function(){ renderStorageModeUI(); sweepThenLoadAll(); });
  try { announceReady(); } catch (e) {}   // X89: tells a docking parent (Progress Learning / review) the student screen can take messages

  // ---------- v8: drag a level to move it (press and hold the grip, then drag), with an undo chip ----------
  var ldrag = null, suppressClickUntil = 0, undoFn = null, undoTimer = null;
  function showUndo(text, fn){
    var c = document.getElementById("undoChip");
    if (!c) { c = document.createElement("div"); c.id = "undoChip"; c.className = "undochip"; document.body.appendChild(c);
      c.addEventListener("click", function(ev){ var b = ev.target.closest("[data-u]"); if (!b) return; if (b.getAttribute("data-u") === "undo" && undoFn) undoFn(); undoFn = null; c.style.display = "none"; }); }
    undoFn = fn; c.innerHTML = '<i class="ti ti-check" aria-hidden="true"></i><span>' + escapeHtml(text) + '</span><button type="button" data-u="undo">Undo</button><button type="button" data-u="x" aria-label="Dismiss"><i class="ti ti-x" aria-hidden="true"></i></button>';
    c.style.display = ""; clearTimeout(undoTimer); undoTimer = setTimeout(function(){ c.style.display = "none"; undoFn = null; }, 12000);
  }
  function applyLevelMove(id, beforeId){
    var arr = levels[hubTypeId] || [], ids = arr.map(function(l){ return l.id; }), from = ids.indexOf(id); if (from < 0) return;
    var mv = arr.splice(from, 1)[0], to = beforeId ? arr.map(function(l){ return l.id; }).indexOf(beforeId) : arr.length; if (to < 0) to = arr.length;
    arr.splice(to, 0, mv);
    if (arr.map(function(l){ return l.id; }).join() === ids.join()) { renderHub(); return; }
    saveLevels(); var tid = hubTypeId;
    showUndo("Moved " + (focusName(mv) || "level") + " to position " + (to + 1), function(){
      var cur = levels[tid] || [], byId = {}; cur.forEach(function(l){ byId[l.id] = l; });
      var back = ids.map(function(i){ return byId[i]; }).filter(Boolean); cur.length = 0; back.forEach(function(l){ cur.push(l); }); saveLevels(); if (view === "hub") renderHub();
    });
    renderHub();
  }
  function clearLdrag(){ [].forEach.call(document.querySelectorAll(".lcard"), function(e){ e.classList.remove("drop-above", "drop-below", "lifted"); }); document.body.classList.remove("dragging"); }
  document.addEventListener("mousedown", function(ev){
    var g = ev.target.closest ? ev.target.closest("[data-lgrip]") : null;
    if (!g || selectedStudent) return;
    ev.preventDefault(); ev.stopPropagation();
    ldrag = { id: g.getAttribute("data-lgrip"), armed: false, before: undefined, card: g.closest(".lcard") };
    ldrag.timer = setTimeout(function(){ if (!ldrag) return; ldrag.armed = true; if (ldrag.card) ldrag.card.classList.add("lifted"); document.body.classList.add("dragging"); }, 450);
  }, true);
  document.addEventListener("mousemove", function(ev){
    if (!ldrag || !ldrag.armed) return;
    var cards = [].slice.call(document.querySelectorAll(".lcard")).filter(function(c){ return c.getAttribute("data-level") !== ldrag.id; });
    cards.forEach(function(e){ e.classList.remove("drop-above", "drop-below"); });
    ldrag.before = null;
    for (var i = 0; i < cards.length; i++) { var r = cards[i].getBoundingClientRect(); if (ev.clientY < r.top + r.height / 2) { ldrag.before = cards[i].getAttribute("data-level"); cards[i].classList.add("drop-above"); break; } }
    if (ldrag.before === null && cards.length) cards[cards.length - 1].classList.add("drop-below");
  });
  document.addEventListener("mouseup", function(){
    if (!ldrag) return;
    var d = ldrag; ldrag = null; clearTimeout(d.timer); clearLdrag();
    if (d.armed) { suppressClickUntil = Date.now() + 300; if (d.before !== undefined) applyLevelMove(d.id, d.before); }
  });
  document.addEventListener("keydown", function(ev){ if (ev.key === "Escape" && ldrag) { clearTimeout(ldrag.timer); ldrag = null; clearLdrag(); } });

  // v8: modal windows keep their scroll place when a choice redraws them
  (function(){
    var root = document.getElementById("modalRoot"), last = 0;
    root.addEventListener("scroll", function(ev){ if (ev.target.classList && ev.target.classList.contains("modal-body")) last = ev.target.scrollTop; }, true);
    new MutationObserver(function(){
      var b = root.querySelector(".modal-body");
      if (!b) { last = 0; return; }
      if (last && b.scrollTop !== last) b.scrollTop = last;
    }).observe(root, { childList: true });
  })();

  // v8: the maximized stage changes its design size to fill the window; redraw the question for the new size
  function relayoutGame(){ var s = currentSession; if (s && !s.demo && s.phase !== "anim") { try { if (s.lesson) lessonRender(s, { again: true }); else renderQuestion(); } catch (e) {} } }
})();
