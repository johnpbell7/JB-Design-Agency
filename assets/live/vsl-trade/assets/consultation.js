
(function () {
  'use strict';

  
  var API = null;
  
  var PREVIEW = !API && /^(localhost|127\.0\.0\.1)$|\.workers\.dev$/.test(location.hostname);
  var DHSC_URL = 'https://consultations.dhsc.gov.uk/tobacco-and-vapes-packaging-appearance-and-display';
  var FORM_VERSION = '2026-09-14';
  var SAVE_KEY = 'vsl-consultation-v1';
  var SENT_KEY = 'vsl-consultation-sent-v1';
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  
  var ORIGINAL = window.VSL_CONSULT_SCREENS || [];
  function isTobDisplay(id) { return /^5\.([0-9]|10)$/.test(id); }
  var SCREENS = (function () {
    var main = ORIGINAL.filter(function (s) { return !isTobDisplay(s.id); });
    var tob = ORIGINAL.filter(function (s) { return isTobDisplay(s.id); });
    var at = main.map(function (s) { return s.id; }).indexOf('G6');
    if (at === -1) at = main.length;
    return main.slice(0, at).concat(tob, main.slice(at));
  })();
  
  var OWN_WORDS = {
    id: 'W', topic: 'about', title: 'How will this affect you and your store?',
    intro: 'This is the part the Government can’t hear from anyone but you. Every other question, you’re checking or changing an answer - this one, you’re writing it yourself. Tell them, in your own words, what these changes would really mean: your sales, your customers, your staff, your family and your time. Write it the way you’d say it across the counter.',
    questions: [{
      key: 'W.q1', type: 'textarea', required: true, rows: 7, maxLength: 1500,
      text: 'In your own words',
      placeholder: 'e.g. I’ll lose loyal customers and sales. Vapes are a big part of what keeps my shop open. If they go behind the counter in plain packs, the customers who come in for them and buy other things too will go elsewhere. This could cause my shop to close.',
      hint: 'One paragraph is plenty. It’s the one box on this form that has to be typed rather than ticked. Be honest about the impact, it’s what makes a response count.', reqTag: true
    }]
  };
  (function () {
    var at = SCREENS.map(function (s) { return s.id; }).indexOf('A3');
    SCREENS.splice(at === -1 ? 0 : at + 1, 0, OWN_WORDS);
  })();
  function groupOf(s) { return isTobDisplay(s.id) ? 't5tob' : s.topic; }
  var startForm = document.getElementById('cfStart');
  var flow = document.getElementById('cfFlow');
  var resume = document.getElementById('cfResume');
  var nameIn = document.getElementById('storeName');
  var emailIn = document.getElementById('contactEmail');
  if (!SCREENS.length || !startForm || !flow) return;

  var BY_ID = {};
  SCREENS.forEach(function (s) { BY_ID[s.id] = s; });

  
  function opt(id, i) {
    var q = BY_ID[id] && BY_ID[id].questions[0];
    return q && q.options ? q.options[i] : null;
  }
  var INDIVIDUAL = [opt('A1', 0), opt('A1', 1)];
  var NATION_EWNI = opt('5.0', 0), NATION_SCOT = opt('5.0', 1), NATION_NONE = opt('5.0', 2);
  var X0_T1 = opt('X0', 0), X0_T2 = opt('X0', 1), X0_T6 = opt('X0', 2);
  
  var X0_TD = 'Tobacco display in your shop';
  (function () {
    var x = BY_ID.X0, q = x && x.questions[0];
    if (q) {
      
      x.intro = 'You have answered every question in the consultation that covers vapes. You can finish here and your response is complete.\nThe consultation also covers tobacco, if you want to have your say on that too.';
      q.text = 'Optional extras';
      q.hint = 'Left unticked, so you’ll finish sooner. Tick any that apply to your shop.';
      q.noTag = true;
      
      q.options = [X0_T1, X0_T2, X0_TD, X0_T6];
      q.exclusive = null;
      q.required = false;
    }
    
    var d = BY_ID['5.0'] && BY_ID['5.0'].questions[0];
    if (d) d.required = true;
  })();

  var TOPIC_LABEL = {
    about: 'About you',
    t3: 'Vape and nicotine packaging and flavours',
    t4: 'Vape device appearance',
    t5: 'Vape and nicotine display',
    t5tob: 'Tobacco display',
    x0: 'Anything else that affects you?',
    t1: 'Tobacco packaging',
    t2: 'Heated tobacco device appearance',
    t6: 'Evidence for the impact assessments'
  };
  var SCALE = (function () {
    for (var i = 0; i < SCREENS.length; i++) for (var j = 0; j < SCREENS[i].questions.length; j++) {
      var o = SCREENS[i].questions[j].options;
      if (o && o[0] === 'Agree') return o;
    }
    return [];
  })();
  
  var FRAME = /^Do you agree(?: or disagree)? (?:with our proposal (?:to |that )|that |with our (?=proposed ))/;
  function short(q) {
    if (q.type !== 'radio' || !q.options || q.options[0] !== 'Agree') return null;
    var r = q.text.replace(FRAME, '');
    if (r === q.text) return null;
    r = r.replace(/\?$/, '');
    return r.charAt(0).toUpperCase() + r.slice(1);
  }
  function label(q) { return short(q) || q.text; }
  
  var KEYS = window.VSL_CONSULT_KEYS || {};
  var REC = window.VSL_CONSULT_RECOMMENDED || {};
  var OWN = 'No suggested answer here - this one&rsquo;s in your own words';
  function markHTML(text, keys) {
    var r = [], m, re = /\bshould not\b/g;
    (keys || []).forEach(function (k) {
      var i = text.indexOf(k);
      if (i !== -1) r.push([i, i + k.length]);
    });
    while ((m = re.exec(text))) r.push([m.index + 7, m.index + 10]);
    r.sort(function (x, y) { return x[0] - y[0]; });
    var merged = [];
    r.forEach(function (x) {
      var last = merged[merged.length - 1];
      if (last && x[0] <= last[1]) last[1] = Math.max(last[1], x[1]);
      else merged.push(x.slice());
    });
    var html = '', at = 0;
    merged.forEach(function (x) {
      html += esc(text.slice(at, x[0])) + '<mark>' + esc(text.slice(x[0], x[1])) + '</mark>';
      at = x[1];
    });
    return html + esc(text.slice(at));
  }
  var CONSENT_TEXT = 'I am happy for VSL to submit this response to the DHSC consultation on my behalf, exactly as shown below.';

  
  var X0_DESC = {};
  X0_DESC[X0_T1] = 'Plain packs, text and picture warnings and inserts for cigarettes, hand rolling tobacco, cigars, heated tobacco, herbal smoking products and cigarette papers.';
  X0_DESC[X0_T2] = 'Colour, lights, branding and screens on heated tobacco devices.';
  X0_DESC[X0_TD] = 'Where tobacco, cigarette papers, heated tobacco and herbal smoking products can be shown and priced in store. Questions differ for Scotland.';
  X0_DESC[X0_T6] = 'Written evidence on costs, benefits and effects, for anyone with figures to share.';
  
  var X0_NEXT = {};
  X0_NEXT[X0_T1] = 'tobacco packaging';
  X0_NEXT[X0_T2] = 'heated tobacco devices';
  X0_NEXT[X0_TD] = 'tobacco display';
  X0_NEXT[X0_T6] = 'impact assessment evidence';

  
  var INTRO = {
    G3: { d: 'Questions on the proposals for vape and nicotine packs: pack colour, imagery and branding, pack shape, flavour names, the information on and inside the pack, and how long the trade would have to comply.' },
    G4: { d: 'Questions on the proposals for how vape devices look: colour, finish and lights, branding on the device, displays on the device, devices made to look like other things, and how long the trade would have to comply.' },
    '5.11': { t: 'Vape and nicotine display', d: 'Questions on the proposals for displaying vape and nicotine products in shops: keeping them out of sight, how prices are shown, exemptions for trade premises and pharmacies, and how long the trade would have to comply.' },
    G1: { d: 'Questions on plain packs, text and picture health warnings and pack inserts for tobacco products, heated tobacco devices, herbal smoking products and cigarette papers.' },
    G2: { d: 'Questions on the colour, lights, branding and displays of heated tobacco devices.' },
    G6: { d: 'Written evidence on costs, benefits and effects, for anyone with figures to share.' }
  };

  
  function fresh() {
    return { v: 1, store: { name: '', email: '' }, ans: {}, cur: null, started: null, returnTo: null };
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      return s && s.v === 1 ? s : null;
    } catch (e) { return null; }
  }
  function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {} }
  var saveTimer;
  function saveSoon() { clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); }
  function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} }

  var state = load() || fresh();
  var lastSent = null;
  
  var floor = 0;

  
  function A(k) { return state.ans[k]; }
  function has(k, v) { var a = A(k); return Array.isArray(a) && a.indexOf(v) !== -1; }
  function show(s, optimistic) {
    var id = s.id;
    
    if (id === 'W') return true;
    if (id === 'A3') return A('A1.q1') ? INDIVIDUAL.indexOf(A('A1.q1')) !== -1 : !!optimistic;
    if (id === '5.0') return has('X0.q1', X0_TD);
    if (/^5\.[1-5]$/.test(id)) return has('X0.q1', X0_TD) && has('5.0.q1', NATION_EWNI);
    if (/^5\.(6|7|8|9|10)$/.test(id)) return has('X0.q1', X0_TD) && has('5.0.q1', NATION_SCOT);
    if (id === 'G1') return has('X0.q1', X0_T1);
    if (/^1\./.test(id)) return has('X0.q1', X0_T1);
    if (id === 'G2') return has('X0.q1', X0_T2);
    if (/^2\./.test(id)) return has('X0.q1', X0_T2);
    if (id === 'G6') return has('X0.q1', X0_T6);
    if (/^6\./.test(id)) return has('X0.q1', X0_T6);
    return true;
  }
  function path() {
    var p = SCREENS.filter(function (s) { return show(s, true); }).map(function (s) { return s.id; });
    
    var lastAbout = -1;
    p.forEach(function (id, i) { if (BY_ID[id] && BY_ID[id].topic === 'about') lastAbout = i; });
    p.splice(lastAbout + 1, 0, 'P');
    p.push('C');
    return p;
  }
  function progress(id) {
    if (id === 'D') return 100;
    var p = path(), i = p.indexOf(id);
    return Math.max(2, Math.round((i < 0 ? 0 : i) / p.length * 100));
  }

  function answered(q) {
    if (q.type === 'gate') return true;               
    var v = A(q.key);
    return q.type === 'checkbox' ? Array.isArray(v) && v.length > 0 : typeof v === 'string' && v.trim() !== '';
  }
  function complete(s) {
    return s.questions.every(function (q) { return !q.required || answered(q); });
  }
  function firstIncomplete() {
    var p = path();
    for (var i = 0; i < p.length; i++) {
      var s = BY_ID[p[i]];
      if (s && !complete(s)) return s.id;
    }
    return null;
  }

  
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function num(n) { return Number(n).toLocaleString('en-GB'); }
  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return ''; }
  }
  function qid(key) { return 'q-' + key.replace(/[^a-z0-9]/gi, '-'); }
  function navH() {
    return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 66;
  }
  function reduced() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  function scrollToEl(el, force) {
    if (!el) return;
    var top = el.getBoundingClientRect().top, head = navH() + (force ? 28 : 12);
    if (force ? Math.abs(top - head) < 8 : (top >= head && top <= window.innerHeight * 0.4)) return;
    window.scrollTo({ top: Math.max(0, top + window.pageYOffset - head), behavior: 'instant' });
  }
  var card = flow.closest('.cf-card') || flow;
  
  function holdStill(el, fn) {
    var before = el ? el.getBoundingClientRect().top : 0;
    fn();
    if (!el) return;
    var d = el.getBoundingClientRect().top - before;
    if (Math.abs(d) > 1) window.scrollBy({ top: d, behavior: 'instant' });
  }

  
  
  function stepText(id) {
    var p = path(), i = p.indexOf(id), r = p.indexOf('P');
    if (i < 0 || r < 0 || i > r) return '';
    return i === r ? 'Last step' : 'Step ' + (i + 1) + ' of ' + (r + 1);
  }
  function clicksHTML(id) {
    return '<div class="cf-prog cf-clicks"><p class="cf-clicks-l" aria-live="polite"><b>' + stepText(id) + '</b></p>' +
      (id === 'A1' ? '<p class="cf-legwork">The official form is 55 pages and around ninety questions. We read it, shaped it and submit it for you. <b>Your voice, our legwork.</b></p>' : '') +
      '</div>';
  }
  function frame(id) {
    var body = id === 'R' ? reviewHTML() : id === 'C' ? consentHTML() : id === 'D' ? doneHTML() : id === 'P' ? readyHTML() : screenHTML(BY_ID[id]);
    if (id === 'D') return '<div class="cf-screen cf-screen-done">' + body + '</div>';
    if (id === 'P') return clicksHTML(id) + '<div class="cf-screen cf-screen-ready">' + body + '</div>';
    if (BY_ID[id] && BY_ID[id].topic === 'about' && state.returnTo !== 'R') return clicksHTML(id) + '<div class="cf-screen">' + body + '</div>';
    var s = BY_ID[id], pct = Math.max(progress(id), floor);
    floor = pct;
    var where = id === 'R' ? 'Your answers' : id === 'C' ? 'Submit it for me' : (s ? TOPIC_LABEL[groupOf(s)] : '');
    return '<div class="cf-prog">' +
        '<div class="cf-prog-row"><p class="cf-prog-l"><b>' + pct + '%</b> done</p></div>' +
        '<p class="cf-prog-sec">' + esc(where) + '</p>' +
        '<div class="cf-prog-bar" role="progressbar" aria-label="How far through you are" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
          '<span style="width:' + pct + '%"></span></div>' +
        (id === 'A1' ? '<p class="cf-legwork">The official form is 55 pages and around ninety questions. We read it, shaped it and submit it for you. <b>Your voice, our legwork.</b></p>' : '') +
      '</div>' +
      '<div class="cf-screen">' + body + '</div>';
  }

  
  function sectionCount(s) {
    var n = { req: 0, opt: 0 };
    for (var i = SCREENS.indexOf(s) + 1; i < SCREENS.length && SCREENS[i].topic === s.topic; i++) {
      if (!show(SCREENS[i], true)) continue;
      SCREENS[i].questions.forEach(function (q) { n[q.required ? 'req' : 'opt']++; });
    }
    return n;
  }
  function introHTML(s) {
    var i = INTRO[s.id], n = sectionCount(s);
    var count = n.req
      ? '<b>' + n.req + ' questions</b>, each answered with a tap.' + (n.opt ? ' The boxes to explain your answers are optional.' : '')
      : '<b>' + n.opt + ' boxes</b>, all optional. Fill in any you have something to say on.';
    return '<h3 class="cf-title" tabindex="-1">' + esc(i.t || s.title) + '</h3>' +
      '<p class="cf-lede">' + esc(i.d) + '</p>' +
      '<p class="cf-intro-n">' + count + '</p>' + navHTML();
  }

  function screenHTML(s) {
    if (INTRO[s.id]) return introHTML(s);
    var h = '<h3 class="cf-title" tabindex="-1">' + esc(s.title) + '</h3>';
    if (s.intro) h += '<p class="cf-lede">' + esc(s.intro) + '</p>';
    
    if (s.id === 'X0') h += navHTML('cf-nav-top');
    
    var shorts = s.questions.map(short).filter(Boolean), asked = false;
    s.questions.forEach(function (q) {
      var t = short(q);
      if (t && !asked) {
        h += '<p class="cf-ask">Do you agree or disagree with ' + (shorts.length > 1 ? 'each proposal?' : 'this proposal?') +
          (state.pre && s.questions.some(function (x) { return REC[x.key]; })
            ? '<span class="cf-ask-sub">We&rsquo;ve filled in VSL&rsquo;s recommended answers. Tap Change on any you don&rsquo;t agree with.</span>' : '') +
          '</p>';
        asked = true;
      }
      h += questionHTML(q, t ? markHTML(t, KEYS[q.key]) : null);
    });
    if (s.id === 'X0') {
      
      var anyExtra = (A('X0.q1') || []).length > 0;
      return h + '<div class="cf-nav-end"' + (anyExtra ? '' : ' hidden') + '>' + navHTML() + '</div>';
    }
    return h + navHTML();
  }

  function questionHTML(q, shortH) {
    var id = qid(q.key), v = A(q.key);
    var tag = q.reqTag ? ' <span class="cf-opt-tag cf-req-tag">Required</span>' : (q.required || q.noTag) ? '' : ' <span class="cf-opt-tag">Optional</span>';

    if (q.type === 'textarea') {
      var val = typeof v === 'string' ? v : '', max = q.maxLength || 4500, left = max - val.length;
      var shut = !q.required && val === '';
      return '<div class="cf-q cf-q-ta' + (shut ? ' is-shut' : '') + '" data-key="' + esc(q.key) + '" id="' + id + '">' +
        (shut ? '<button type="button" class="cf-add" data-add="1" aria-controls="' + id + '-in">' +
          '<span class="cf-add-ic" aria-hidden="true">+</span><span class="cf-add-t">' + esc(q.text) + '<small class="cf-own">' + OWN + '</small></span>' +
          '<span class="cf-opt-tag">Optional</span></button>' : '') +
        '<label class="cf-qt" for="' + id + '-in">' + esc(q.text) + tag + '</label>' +
        (q.required ? '<p class="cf-err" id="' + id + '-e" hidden></p>' : '') +
        (q.key === 'W.q1' ? '' : '<p class="cf-own cf-own-open">' + OWN + '</p>') +
        
        '<textarea class="cf-ta" id="' + id + '-in" name="' + esc(q.key) + '" rows="' + (q.rows || 5) + '" maxlength="' + max + '"' +
          (q.placeholder ? ' placeholder="' + esc(q.placeholder) + '"' : '') +
          ' aria-describedby="' + id + '-h ' + id + '-c">' + esc(val) + '</textarea>' +
        '<div class="cf-ta-foot">' +
          (q.hint ? '<p class="cf-hint" id="' + id + '-h">' + esc(q.hint) + '</p>' : '<span id="' + id + '-h"></span>') +
          '<p class="cf-count' + (left <= 200 ? ' is-low' : '') + '" id="' + id + '-c" aria-live="polite">' + num(left) + ' characters left</p>' +
        '</div></div>';
    }

    var multi = q.type === 'checkbox', gate = q.type === 'gate';
    var folded = !multi && typeof v === 'string' && v !== '';
    var h = '<fieldset class="cf-q' + (gate ? ' cf-q-gate' : '') + (folded ? ' is-done' : '') + '" data-key="' + esc(q.key) + '" id="' + id + '"' +
      ' aria-describedby="' + (q.hint ? id + '-h ' : '') + id + '-e">' +
      '<legend class="cf-qt">' + (shortH ? '<span aria-hidden="true">' + shortH + '</span><span class="cf-sr">' + esc(q.text) + '</span>' : markHTML(q.text, KEYS[q.key])) + tag + '</legend>';
    if (q.hint) h += '<p class="cf-hint" id="' + id + '-h">' + esc(q.hint) + '</p>';
    h += '<p class="cf-err" id="' + id + '-e" hidden></p>';
    var grid = q.type === 'radio' && q.options.length >= 3 && q.options.every(function (o) { return o.length <= 26; });
    h += '<div class="' + (gate ? 'cf-gate' : 'cf-opts' + (grid ? ' cf-opts-grid' : '')) + '">';
    q.options.forEach(function (o) {
      var on = multi ? Array.isArray(v) && v.indexOf(o) !== -1 : v === o;
      if (multi && q.exclusive === o) h += '<p class="cf-or">Or</p>';
      h += '<label class="' + (gate ? 'cf-gate-btn' : 'cf-opt') + '">' +
        '<input type="' + (multi ? 'checkbox' : 'radio') + '" name="' + esc(q.key) + '" value="' + esc(o) + '"' +
          (on ? ' checked' : '') + (q.exclusive === o ? ' data-exclusive="1"' : '') + '>' +
        '<span class="cf-ctl" aria-hidden="true"></span>' +
        '<span class="cf-opt-t">' + esc(o) + (multi && X0_DESC[o] ? '<small>' + esc(X0_DESC[o]) + '</small>' : '') + '</span>' +
        '</label>';
    });
    h += '</div>';
    
    if (gate) h += '<p class="cf-gate-note">Yes shows this section&rsquo;s questions. No skips them.</p>';
    
    if (!multi) {
      h += '<div class="cf-picked">' +
        '<span class="cf-picked-ic" aria-hidden="true"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>' +
        '<span class="cf-picked-t">' + (folded ? esc(v) : '') + '</span>' +
        '<button type="button" class="cf-rec" data-edit="1"' + (folded && REC[q.key] === v ? '' : ' hidden') + '>Pre-selected, tap to change</button>' +
        '<button type="button" class="cf-change" data-edit="1">Change<span class="cf-sr"> your answer to: ' + esc(q.text) + '</span></button>' +
        '</div>';
    }
    return h + '</fieldset>';
  }

  
  function nextLabel() {
    if (state.cur !== 'X0') return 'Next';
    var picked = [X0_T1, X0_T2, X0_TD, X0_T6].filter(function (o) { return has('X0.q1', o); });
    return picked.length ? 'Next: ' + X0_NEXT[picked[0]] : 'Finish and send';
  }
  function navHTML(extra) {
    var ret = state.returnTo === 'R';
    return '<div class="cf-nav' + (extra ? ' ' + extra : '') + '">' +
      '<button type="button" class="cf-back" data-act="back">' + (ret ? 'Back to your answers' : 'Back') + '</button>' +
      '<button type="button" class="ce-btn ce-btn-lg cf-next" data-act="next">' + (ret ? 'Save and go back' : nextLabel()) + '</button>' +
      '</div>';
  }

  function storeHTML(editable) {
    return '<section class="cf-rv-group"><div class="cf-rv-h"><h4>Your store</h4>' +
      (editable ? '<button type="button" class="cf-change" data-store="1">Change<span class="cf-sr"> your store details</span></button>' : '') +
      '</div><dl class="cf-rv-dl"><dt>Store name</dt><dd>' + esc(state.store.name) + '</dd>' +
      '<dt>Email for your copy</dt><dd>' + esc(state.store.email) + '</dd></dl></section>';
  }

  function changeBtn(id, label) {
    return '<button type="button" class="cf-change" data-go="' + esc(id) + '">Change<span class="cf-sr"> ' + esc(label) + '</span></button>';
  }

  
  var REVIEW_ORDER = ['about', 't3', 't4', 't5', 't1', 't2', 't5tob', 't6'];
  
  function answersHTML(editable) {
    var h = '';
    REVIEW_ORDER.forEach(function (t) {
      var pick = t === 't1' ? X0_T1 : t === 't2' ? X0_T2 : t === 't5tob' ? X0_TD : t === 't6' ? X0_T6 : null;
      if (pick && !has('X0.q1', pick)) {
        h += '<section class="cf-rv-group cf-rv-off"><div class="cf-rv-sum"><span class="cf-rv-name">' + esc(TOPIC_LABEL[t]) + '</span>' +
          '<span class="cf-rv-tally">Not chosen</span></div>' + (editable ? changeBtn('X0', TOPIC_LABEL[t]) : '') + '</section>';
        return;
      }
      var rows = '', n = 0, notes = 0, tally = {};
      SCREENS.forEach(function (s) {
        if (groupOf(s) !== t || INTRO[s.id] || !show(s, false)) return;
        var dl = '';
        s.questions.forEach(function (q) {
          var v = A(q.key), text = Array.isArray(v) ? v.join(', ') : (v || '');
          if (q.type === 'textarea') {
            if (!text) return;                                  
            notes++;
          } else if (text) {
            n++;
            if (SCALE.indexOf(text) !== -1) tally[text] = (tally[text] || 0) + 1;
          }
          dl += '<dt>' + esc(label(q)) + '</dt><dd class="' + (q.type === 'textarea' ? 'cf-rv-free' : 'cf-rv-pick') + '">' +
            (text ? esc(text) : '<i>' + (q.type === 'checkbox' ? 'Nothing ticked' : 'Not answered') + '</i>') + '</dd>';
        });
        rows += '<div class="cf-rv-screen"><div class="cf-rv-h"><b>' + esc(s.title) + '</b>' +
          (editable ? changeBtn(s.id, s.title) : '') + '</div><dl class="cf-rv-dl">' + dl + '</dl></div>';
      });
      var line = n + (n === 1 ? ' answer' : ' answers') + (notes ? ', ' + notes + (notes === 1 ? ' explanation' : ' explanations') : '');
      var bits = SCALE.filter(function (o) { return tally[o]; }).map(function (o) { return esc(o) + ' ' + tally[o]; });
      h += '<details class="cf-rv-group"><summary class="cf-rv-sum"><span class="cf-rv-name">' + esc(TOPIC_LABEL[t]) + '</span>' +
        '<span class="cf-rv-tally">' + line + (bits.length ? ' &middot; ' + bits.join(' &middot; ') : '') + '</span></summary>' +
        rows + '</details>';
    });
    return h;
  }

  function reviewHTML() {
    return '<h3 class="cf-title" tabindex="-1">Your answers</h3>' +
      '<p class="cf-lede">This is everything that goes forward, exactly as it will be submitted. Change anything you like. Nothing is submitted until you say so at the next step.</p>' +
      storeHTML(true) + answersHTML(true) +
      '<div class="cf-nav"><button type="button" class="cf-back" data-act="back">Back</button>' +
      '<button type="button" class="ce-btn ce-btn-lg cf-next" data-act="continue">Continue</button></div>';
  }

  
  function consentHTML() {
    return '<h3 class="cf-title" tabindex="-1">You have done the hard part. We do the rest.</h3>' +
      '<div class="cf-consent">' +
        (state.pre ? '<p class="cf-pre-consent">Your answers started from VSL&rsquo;s recommendations. What you kept and what you changed is exactly what will be sent.</p>' : '') +
        '<label class="cf-tick"><input type="checkbox" id="cfConsent" autocomplete="off">' +
          '<span class="cf-ctl cf-ctl-sq" aria-hidden="true"></span><span>' + esc(CONSENT_TEXT) + '</span></label>' +
        
        '<div class="cf-hp" aria-hidden="true"><input type="checkbox" name="confirm" value="" tabindex="-1"></div>' +
        '<p class="cf-send-err" id="cfSendErr" role="alert" hidden></p>' +
        '<button type="button" class="ce-btn ce-btn-lg cf-submit" data-act="submit" disabled>Submit my response</button>' +
        '<p class="cf-after">We submit it to the official DHSC survey as your response, one response for your store, and keep a record that you asked us to. ' +
          '<a href="' + DHSC_URL + '" target="_blank" rel="noopener">DHSC consultation page<span class="cf-sr"> (opens in a new tab)</span></a></p>' +
      '</div>' +
      '<p class="cf-rv-intro">Your answers. Open a section to check it, or change anything you like.</p>' +
      storeHTML(true) + answersHTML(true);
  }

  
  function readyHTML() {
    return '<h3 class="cf-title" tabindex="-1">Your response is ready. We&rsquo;ve done the hard part.</h3>' +
      '<div class="cf-ready">' +
        '<p>We&rsquo;ve read all 55 pages of the Government&rsquo;s proposals and worked out exactly what each one would mean for your shop. ' +
          'Every answer is already selected to protect <b>your sales, your shelf space and your time</b>.</p>' +
        '<p class="cf-ready-own">It&rsquo;s still your response! Open anything you want to check, and change it if you see it differently.</p>' +
      '</div>' +
      
      '<div class="cf-consent">' +
        '<label class="cf-tick"><input type="checkbox" id="cfConsent" autocomplete="off">' +
          '<span class="cf-ctl cf-ctl-sq" aria-hidden="true"></span><span>' + esc(CONSENT_TEXT) + '</span></label>' +
        '<div class="cf-hp" aria-hidden="true"><input type="checkbox" name="confirm" value="" tabindex="-1"></div>' +
        '<p class="cf-send-err" id="cfSendErr" role="alert" hidden></p>' +
        '<button type="button" class="ce-btn ce-btn-lg cf-submit" data-act="submit" disabled>Submit my response</button>' +
        '<p class="cf-after">VSL Trade will submit your answers to the <a href="' + DHSC_URL + '" target="_blank" rel="noopener">official DHSC survey<span class="cf-sr"> (opens in a new tab)</span></a> on behalf of your store. ' +
          'We&rsquo;ll do the hard part, so you don&rsquo;t need to.</p>' +
      '</div>' +
      '<div class="cf-review-offer">' +
        '<div class="cf-nav"><button type="button" class="cf-back" data-act="back">Back</button>' +
          '<button type="button" class="ce-btn ce-btn-lg cf-review-go" data-act="review">Review and change the answers</button></div>' +
      '</div>' +
      '<p class="cf-rv-intro">Every answer, exactly as it will be sent. Open a section to see it.</p>' +
      storeHTML(true) + answersHTML(true);
  }

  function doneHTML() {
    var s = lastSent || {};
    return '<div class="cf-done">' +
      '<span class="cf-done-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' +
      '<h3 class="cf-title" tabindex="-1">Done.</h3>' +
      
      '<p class="cf-done-p">We will submit your response to the official DHSC survey exactly as you saw it.' +
        (s.copySent ? ' Your copy is on its way to you.' : '') + ' Thank you for having your say.</p>' +
      '<dl class="cf-ref"><dt>Reference</dt><dd>' + esc(s.ref) + '</dd>' +
        '<dt>Date</dt><dd>' + esc(fmtDate(s.at)) + '</dd>' +
        '<dt>Store</dt><dd>' + esc(s.store) + '</dd></dl>' +
      '<button type="button" class="ce-btn cf-again" data-restart="now">Start a response for another store</button>' +
      '</div>';
  }

  
  function go(id) {
    if (id === 'R') id = 'C';                  
    state.cur = id;
    save();
    flow.innerHTML = frame(id);
    scrollToEl(card);
    var t = flow.querySelector('.cf-title');
    if (t) { try { t.focus({ preventScroll: true }); } catch (e) { t.focus(); } }
  }
  function openFlow(id) {
    floor = 0;
    startForm.hidden = true;
    flow.hidden = false;
    go(id);
  }
  function closeFlow() {
    flow.hidden = true;
    startForm.hidden = false;
    paintStart();
    scrollToEl(card);
  }

  function next() {
    var s = BY_ID[state.cur];
    if (s && !validate(s)) return;
    var target;
    if (state.returnTo === 'R') {
      floor = 0;
      
      target = firstIncomplete() || 'C';
    } else {
      var p = path();
      target = p[p.indexOf(state.cur) + 1] || 'C';
    }
    if (target === 'R' || target === 'C') state.returnTo = null;
    go(target);
  }
  function back() {
    floor = 0;
    if (state.returnTo === 'R') { state.returnTo = null; go('R'); return; }
    if (state.cur === 'A1') { closeFlow(); return; }
    var p = path(), i = p.indexOf(state.cur);
    go(i > 0 ? p[i - 1] : 'A1');
  }

  
  function setErr(box, q) {
    if (!box) return;
    box.classList.add('is-err');
    var e = box.querySelector('.cf-err');
    if (e) { e.textContent = q.type === 'checkbox' ? 'Tick at least one to carry on.' : q.type === 'textarea' ? 'Write a few words about how this would affect you to carry on.' : 'Choose an answer to carry on.'; e.hidden = false; }
  }
  function clearErr(box) {
    if (!box) return;
    box.classList.remove('is-err');
    var e = box.querySelector('.cf-err');
    if (e) { e.hidden = true; e.textContent = ''; }
  }
  function validate(s) {
    var missing = [];
    s.questions.forEach(function (q) {
      var box = flow.querySelector('[data-key="' + q.key + '"]');
      if (q.required && !answered(q)) { missing.push(q); setErr(box, q); } else clearErr(box);
    });
    
    if (missing.length) {
      var target = flow.querySelector('[data-key="' + missing[0].key + '"]');
      scrollToEl(target, true);
      var inp = target && target.querySelector('input');
      if (inp) { try { inp.focus({ preventScroll: true }); } catch (e) {} }
    }
    return missing.length === 0;
  }

  function refreshProgress() {
    var cl = flow.querySelector('.cf-clicks-l b'), st = stepText(state.cur);
    if (cl && st) cl.textContent = st;
    var bar = flow.querySelector('.cf-prog-bar'), fill = bar && bar.querySelector('span'), l = flow.querySelector('.cf-prog-l b');
    if (!bar) return;
    var pct = Math.max(progress(state.cur), floor);
    fill.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', pct);
    if (l) l.textContent = pct + '%';
  }

  
  var DHSC_ORDER = ['about', 't1', 't2', 't3', 't4', 't5', 't6'];
  function payload(hp) {
    var answers = [];
    DHSC_ORDER.forEach(function (t) {
      var chosen = t === 't1' ? has('X0.q1', X0_T1) : t === 't2' ? has('X0.q1', X0_T2) : t === 't6' ? has('X0.q1', X0_T6) : true;
      ORIGINAL.forEach(function (s) {
        if (s.topic !== t) return;
        if (!chosen) {
          if (s.gate) answers.push(entry(s, s.questions[0], 'No', 'Topic not chosen on screen X0'));
          return;
        }
        if (!show(s, false)) {
          
          if (s.id === '5.0') answers.push(entry(s, s.questions[0], [NATION_NONE], 'Tobacco display not chosen on screen X0'));
          return;
        }
        s.questions.forEach(function (q) {
          if (q.type === 'gate') {
            answers.push(entry(s, q, 'Yes', 'Not asked on the VSL form: the retailer answered this section, so the gate is Yes'));
            return;
          }
          var v = A(q.key);
          if (v === undefined) v = q.type === 'checkbox' ? [] : '';
          answers.push(entry(s, q, v));
        });
      });
    });
    return {
      schema: 'vsl-dhsc-consultation/1',
      formVersion: FORM_VERSION,
      dhscConsultation: DHSC_URL,
      store: { name: state.store.name, email: state.store.email },
      consent: { given: true, text: CONSENT_TEXT, at: new Date().toISOString() },
      startedAt: state.started,
      submittedAt: new Date().toISOString(),
      optionalTopicsChosen: A('X0.q1') || [],
      
      storeImpact: { question: OWN_WORDS.title, value: (A('W.q1') || '').trim() },
      prefilledWithVslRecommendations: !!state.pre,
      
      reviewedBeforeSending: !!state.reviewed,
      answers: answers,
      hp: hp ? '1' : ''
    };
  }
  function entry(s, q, v, note) {
    var e = { screen: s.id, key: q.key, topic: s.topic === 't5' ? 'Retail display' : TOPIC_LABEL[s.topic], question: q.text,
      control: q.type === 'gate' ? 'radio' : q.type, value: v };
    if (REC[q.key] !== undefined && typeof v === 'string' && v) e.source = v === REC[q.key] ? 'vsl-recommended' : 'changed-by-retailer';
    if (note) e.note = note;
    return e;
  }

  function submit() {
    var tick = document.getElementById('cfConsent'), err = document.getElementById('cfSendErr');
    if (!tick) return;
    
    var inc = firstIncomplete();
    if (inc) { state.returnTo = 'R'; go(inc); return; }
    if (!tick.checked) {
      err.textContent = 'Tick the box to say we can submit your response for you.';
      err.hidden = false;
      scrollToEl(flow.querySelector('.cf-consent'), true);
      try { tick.focus({ preventScroll: true }); } catch (e) {}
      return;
    }
    var btns = [].slice.call(flow.querySelectorAll('.cf-submit'));
    var hp = flow.querySelector('input[name="confirm"]');
    var body = payload(hp && hp.checked);
    err.hidden = true;

    if (!API && PREVIEW) {
      window.VSL_PREVIEW_PAYLOAD = body;
      lastSent = { ref: 'Preview', store: state.store.name, at: new Date().toISOString(), copySent: false, preview: true };
      clearSave();
      state = fresh();
      go('D');
      return;
    }
    if (!API) {
      err.textContent = 'Submitting isn’t switched on yet, so nothing has been sent. Your answers are saved on this device and nothing is lost.';
      err.hidden = false;
      return;
    }
    btns.forEach(function (b) { b.disabled = true; b.textContent = 'Submitting…'; });
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) {
        return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; });
      })
      .then(function (res) {
        if (!res.ok || !res.j || !res.j.reference) throw res;
        lastSent = { ref: res.j.reference, store: state.store.name, at: new Date().toISOString(), copySent: !!res.j.copySent };
        try { localStorage.setItem(SENT_KEY, JSON.stringify(lastSent)); } catch (e) {}
        clearSave();
        state = fresh();
        go('D');
      })
      .catch(function (res) {
        if (res && res.status === 409 && res.j && res.j.reference) {
          err.textContent = 'We already have a response for this store (reference ' + res.j.reference + '). One store, one response.';
        } else {
          err.textContent = 'That didn’t go through. Try again, or email sales@vapesupplier.co.uk and we’ll take it from there.';
        }
        err.hidden = false;
        btns.forEach(function (b) { b.disabled = false; b.textContent = 'Submit my response'; });
      });
  }

  
  flow.addEventListener('change', function (e) {
    var t = e.target;
    if (t.id === 'cfConsent') {
      var b = flow.querySelector('.cf-consent .cf-submit'), er = document.getElementById('cfSendErr');
      if (b) b.disabled = !t.checked;
      if (t.checked && er) er.hidden = true;
      return;
    }
    if (!t.name || t.name === 'confirm') return;
    var box = t.closest('.cf-q'), anchor = t.closest('.cf-opt, .cf-gate-btn');
    if (t.type === 'radio') {
      state.ans[t.name] = t.value;
      
      if (lastPointer && box) {
        box.querySelector('.cf-picked-t').textContent = t.value;
        var rec = box.querySelector('.cf-rec');
        if (rec) rec.hidden = REC[t.name] !== t.value;
        box.classList.add('is-done');
        anchor = box;
      }
    } else if (t.type === 'checkbox') {
      var all = [].slice.call(box.querySelectorAll('input[type="checkbox"]'));
      
      if (t.checked && t.dataset.exclusive) all.forEach(function (c) { if (c !== t) c.checked = false; });
      else if (t.checked) all.forEach(function (c) { if (c.dataset.exclusive) c.checked = false; });
      state.ans[t.name] = all.filter(function (c) { return c.checked; }).map(function (c) { return c.value; });
      if (t.name === 'X0.q1') {
        if (state.returnTo !== 'R') {
          [].forEach.call(flow.querySelectorAll('[data-act="next"]'), function (b) { b.textContent = nextLabel(); });
        }
        var end = flow.querySelector('.cf-nav-end');
        if (end) end.hidden = !state.ans['X0.q1'].length;
      }
    }
    holdStill(anchor, function () {
      clearErr(t.closest('.cf-q'));
      var sum = flow.querySelector('.cf-summary');
      if (sum && !flow.querySelector('.cf-q.is-err')) { sum.hidden = true; sum.innerHTML = ''; }
    });
    save();
    refreshProgress();
  });

  var lastPointer = false;
  flow.addEventListener('pointerdown', function () { lastPointer = true; });
  flow.addEventListener('keydown', function () { lastPointer = false; });

  flow.addEventListener('input', function (e) {
    var t = e.target;
    if (!t.classList || !t.classList.contains('cf-ta')) return;
    state.ans[t.name] = t.value;
    if (t.value.trim()) clearErr(t.closest('.cf-q'));
    var c = document.getElementById(t.id.replace(/-in$/, '') + '-c');
    var left = (parseInt(t.getAttribute('maxlength'), 10) || 4500) - t.value.length;
    if (c) { c.textContent = num(left) + ' characters left'; c.classList.toggle('is-low', left <= 200); }
    saveSoon();
  });

  flow.addEventListener('click', function (e) {
    var link = e.target.closest('.cf-summary a');
    if (link) {
      e.preventDefault();
      var el = document.getElementById(link.getAttribute('href').slice(1));
      scrollToEl(el);
      var inp = el && el.querySelector('input,textarea');
      if (inp) { try { inp.focus({ preventScroll: true }); } catch (x) {} }
      return;
    }
    if (e.target.closest('[data-store]')) { state.returnTo = 'R'; save(); closeFlow(); nameIn.focus(); return; }
    var rs = e.target.closest('[data-restart]');
    if (rs) {
      clearSave();
      state = fresh();
      floor = 0;
      closeFlow();
      try { nameIn.focus({ preventScroll: true }); } catch (x) { nameIn.focus(); }
      return;
    }
    var add = e.target.closest('[data-add]');
    if (add) {
      var tq = add.closest('.cf-q-ta');
      tq.classList.remove('is-shut');
      var ta = tq.querySelector('textarea');
      if (ta) { try { ta.focus({ preventScroll: true }); } catch (x) { ta.focus(); } }
      return;
    }
    var ed = e.target.closest('[data-edit]');
    if (ed) {
      var q = ed.closest('.cf-q');
      q.classList.remove('is-done');
      var on = q.querySelector('input:checked') || q.querySelector('input');
      if (on) { try { on.focus({ preventScroll: true }); } catch (x) { on.focus(); } }
      return;
    }
    var g = e.target.closest('[data-go]');
    if (g) { floor = 0; state.returnTo = 'R'; go(g.getAttribute('data-go')); return; }
    var a = e.target.closest('[data-act]');
    if (!a) return;
    var act = a.getAttribute('data-act');
    if (act === 'next') next();
    else if (act === 'back') back();
    else if (act === 'continue') {
      floor = 0;
      var inc = firstIncomplete();
      if (inc) { state.returnTo = 'R'; go(inc); } else go('C');
    }
    else if (act === 'submit') submit();
    else if (act === 'review') { state.reviewed = true; next(); }
  });

  
  function fieldErr(input, msg) {
    var f = input.closest('.cf-fld'), e = f.querySelector('.cf-err');
    f.classList.add('is-err');
    input.setAttribute('aria-invalid', 'true');
    e.textContent = msg;
    e.hidden = false;
  }
  function fieldOk(input) {
    var f = input.closest('.cf-fld'), e = f.querySelector('.cf-err');
    f.classList.remove('is-err');
    input.removeAttribute('aria-invalid');
    e.hidden = true;
    e.textContent = '';
  }

  function paintStart() {
    nameIn.value = state.store.name || '';
    emailIn.value = state.store.email || '';
    var sent = null;
    try { sent = JSON.parse(localStorage.getItem(SENT_KEY) || 'null'); } catch (e) {}
    var h = '';
    if (state.started && state.cur) {
      h = '<p><b>Welcome back' + (state.store.name ? ', ' + esc(state.store.name) : '') + '.</b> ' +
        'You were part way through. Your answers are saved on this device.</p>' +
        '<div class="cf-resume-act"><button type="button" class="ce-btn cf-resume-go" data-resume="go">Carry on</button>' +
        '<button type="button" class="cf-back" data-resume="reset">Start again</button></div>';
    } else if (sent && sent.ref) {
      h = '<p>You sent a response for <b>' + esc(sent.store) + '</b> on ' + esc(fmtDate(sent.at)) +
        ' (reference ' + esc(sent.ref) + '). Responding for a different store? Start a new response below.</p>';
    }
    resume.innerHTML = h;
    resume.hidden = !h;
  }

  resume.addEventListener('click', function (e) {
    var b = e.target.closest('[data-resume]');
    if (!b) return;
    if (b.getAttribute('data-resume') === 'go') { openFlow(state.cur || 'A1'); return; }
    if (window.confirm('Clear your saved answers and start again?')) {
      clearSave();
      state = fresh();
      paintStart();
      nameIn.focus();
    }
  });

  [nameIn, emailIn].forEach(function (i) {
    i.addEventListener('input', function () { if (i.closest('.cf-fld').classList.contains('is-err')) fieldOk(i); });
  });

  startForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var n = nameIn.value.trim(), m = emailIn.value.trim(), ok = true;
    if (!n) { fieldErr(nameIn, 'Tell us your store name, so your response goes in for your store.'); ok = false; }
    else fieldOk(nameIn);
    if (!m) { fieldErr(emailIn, 'We need an email to send you a copy of what we submit for you.'); ok = false; }
    else if (!EMAIL_RE.test(m)) { fieldErr(emailIn, 'That email doesn’t look right. Check it and try again.'); ok = false; }
    else fieldOk(emailIn);
    if (!ok) { (n ? emailIn : nameIn).focus(); return; }
    state.store = { name: n, email: m };
    if (!state.started) {
      state.started = new Date().toISOString();
      
      Object.keys(REC).forEach(function (k) { if (state.ans[k] === undefined) state.ans[k] = REC[k]; });
      state.pre = true;
    }
    var target = state.returnTo === 'R' ? 'R' : (state.cur || 'A1');
    if (target === 'R' || target === 'C') state.returnTo = null;
    save();
    openFlow(target);
  });

  paintStart();
})();
