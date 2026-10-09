/* Birdie Blooms — site behaviour, shared by every page. */
(function () {
  var EMAIL = "hello@birdieblooms.co.uk"; // where enquiries go

  var d = document, r = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var motion = !!window.gsap && !calm;

  /* ---- seasons: the colour follows the date; visitors can look at the others ------------ */
  var today = r.dataset.today || r.dataset.season;
  var pickers = $$(".seasons button");
  $$(".swatch").forEach(function (s) { s.classList.toggle("is-today", s.dataset.s === today); });
  var row = $(".swatches"), back = $(".pal-back");
  function syncPickers() {
    pickers.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.s === r.dataset.season));
      b.classList.toggle("is-today", b.dataset.s === today);
    });
  }
  function centre(s, smooth) {
    if (!row) return;
    var c = $(".swatch[data-s='" + s + "']");
    if (!c || row.scrollWidth <= row.clientWidth) return;
    row.scrollTo({ left: c.offsetLeft - (row.clientWidth - c.offsetWidth) / 2, behavior: smooth && !calm ? "smooth" : "auto" });
  }
  function setSeason(s) {
    if (s === r.dataset.season) return;
    r.setAttribute("data-season", s);
    var fav = $("#favicon"); if (fav) fav.href = "assets/img/favicon-" + s + ".svg?v=3";
    syncPickers();
    if (back) back.hidden = s === today;
    centre(s, true);
    if (motion) {
      var dot = $(".swatch[data-s='" + s + "'] .sw-dot");
      if (dot) gsap.fromTo(dot, { scale: 0.85 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.45)" });
      if ($(".pal-now")) gsap.fromTo(".pal-now", { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out" });
    }
  }
  pickers.forEach(function (b) { b.addEventListener("click", function () { setSeason(b.dataset.s); }); });
  if (back) back.addEventListener("click", function () { setSeason(today); });
  syncPickers();
  centre(today, false);
  window.addEventListener("load", function () { centre(r.dataset.season, false); });

  /* ---- header: sticky bar after the home hero; mobile menu ------------------------------- */
  var bar = $(".bar"), hero = $(".hero");
  if (bar && hero) {
    var onScroll = function () { bar.classList.toggle("show", window.scrollY > hero.offsetHeight - 80); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
  var menu = $(".menu");
  function openMenu(open) {
    if (!menu) return;
    menu.classList.toggle("open", open);
    d.body.classList.toggle("locked", open);
    $$(".menu-btn").forEach(function (b) { b.setAttribute("aria-expanded", String(open)); });
    if (open) { var f = $("nav a", menu); if (f) f.focus(); }
  }
  $$(".menu-btn").forEach(function (b) { b.addEventListener("click", function () {
    openMenu(true);
    if (motion) gsap.fromTo(".menu-link, .menu-side", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "power3.out", stagger: 0.05 });
  }); });
  $$(".menu-close, .menu-nav a, .menu-side a").forEach(function (b) { b.addEventListener("click", function () { openMenu(false); }); });
  d.addEventListener("keydown", function (e) { if (e.key === "Escape") openMenu(false); });

  /* ---- enquiry forms: write the email for you ----------------------------------------------- */
  var params = new URLSearchParams(location.search);
  $$("form[data-enquiry]").forEach(function (form) {
    // arriving from a bouquet's "Enquire" button fills in what it's for
    var item = params.get("bouquet");
    if (item) {
      var what = $("[name='what']", form), which = $("[name='bouquet']", form);
      if (what) what.value = "Autumn bouquets";
      if (which) which.value = item;
    }
    var kind = params.get("for");
    if (kind) { var w = $("[name='what']", form); if (w) w.value = kind; }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var lines = [];
      $$("[name]", form).forEach(function (el) {
        if (el.type === "checkbox" || el.type === "radio") { if (!el.checked) return; }
        var v = (el.value || "").trim(); if (!v || el.name === "website") return;
        var label = el.dataset.label || el.name;
        lines.push(label + ": " + v);
      });
      var nm = form.elements.namedItem("name");
      var subject = form.dataset.subject + (nm && nm.value ? " from " + nm.value.trim() : "");
      var href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      form.closest(".form-shell").classList.add("sent");
      window.location.href = href;
    });
  });

  $$("form[data-letters]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var em = $("input[type=email]", form).value.trim();
      window.location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Seasonal letters") + "&body=" + encodeURIComponent("Please add " + em + " to the seasonal letters.");
      form.classList.add("done");
    });
  });

  /* ---- kind words carousel (only when there are reviews) --------------------------------- */
  var qs = $$(".quote"), qd = $$(".q-dots i"), qi = 0, qt;
  if (qs.length > 1) {
    var showQ = function (n) {
      qi = (n + qs.length) % qs.length;
      qs.forEach(function (q, i) { q.classList.toggle("is-on", i === qi); });
      qd.forEach(function (q, i) { q.classList.toggle("is-on", i === qi); });
      clearTimeout(qt); qt = setTimeout(function () { showQ(qi + 1); }, 7000);
    };
    $(".q-prev").addEventListener("click", function () { showQ(qi - 1); });
    $(".q-next").addEventListener("click", function () { showQ(qi + 1); });
    showQ(0);
  }

  /* ---- the birdie card: stamps itself when you reach it; tap to stamp ---------------------- */
  var card = $(".bcard"), stage = $(".card-stage");
  if (card) {
    var slots = $$(".stamps li:not(.free)"), free = $(".stamps .free"), list = $(".stamps");
    var tilts = [-8, 6, -4, 9, -12];
    var isFull = function () { return free.classList.contains("won"); };
    var reset = function () {
      slots.forEach(function (li) { li.classList.remove("on"); });
      free.classList.remove("won");
      if (motion) gsap.set(slots.map(function (li) { return $(".mark", li); }), { clearProps: "all" });
    };
    var burst = function () {
      var b = free.getBoundingClientRect(), s = stage.getBoundingClientRect();
      var cx = b.left - s.left + b.width / 2, cy = b.top - s.top + b.height / 2;
      for (var i = 0; i < 22; i++) {
        var p = d.createElement("i"); p.className = "petal p" + (1 + (i % 3)); stage.appendChild(p);
        var a = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 170;
        gsap.set(p, { x: cx - 7, y: cy - 10, rotation: Math.random() * 360, scale: 0.6 + Math.random() * 0.7 });
        gsap.to(p, { x: cx + Math.cos(a) * dist, y: cy + Math.sin(a) * dist * 0.8 - 50, rotation: "+=" + (Math.random() * 300 - 150), duration: 1 + Math.random() * 0.6, ease: "power3.out" });
        gsap.to(p, { y: "+=" + (80 + Math.random() * 60), autoAlpha: 0, duration: 0.9, delay: 0.75 + Math.random() * 0.4, ease: "power1.in", onComplete: function () { this.targets()[0].remove(); } });
      }
    };
    var stamp = function () {
      var next = slots.filter(function (li) { return !li.classList.contains("on"); })[0];
      if (next) {
        next.classList.add("on");
        if (motion) {
          gsap.fromTo($(".mark", next), { scale: 2.6, rotation: -40, autoAlpha: 0 }, { scale: 1, rotation: tilts[slots.indexOf(next)], autoAlpha: 1, duration: 0.42, ease: "power4.in" });
          gsap.fromTo(card, { y: 0 }, { y: 6, duration: 0.07, yoyo: true, repeat: 1, delay: 0.38, ease: "power1.inOut" });
        }
      } else if (!isFull()) {
        free.classList.add("won");
        if (motion) { gsap.fromTo(free, { scale: 0.6 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" }); burst(); }
      } else {
        reset();
      }
      var n = slots.filter(function (li) { return li.classList.contains("on"); }).length;
      list.setAttribute("aria-label", isFull() ? "Card full: a free bunch" : n + " of five stamps collected");
    };
    card.addEventListener("click", stamp);
    card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); stamp(); } });
    if (motion) {
      reset();
      list.setAttribute("aria-label", "0 of five stamps collected");
      var autoStamp = function () {
        var tl = gsap.timeline();
        for (var i = 0; i < 6; i++) tl.call(function () { if (!isFull()) stamp(); }, null, i * 0.55);
        return tl;
      };
      gsap.registerPlugin(ScrollTrigger);
      gsap.timeline({ scrollTrigger: { trigger: card, start: "center 70%", once: true } })
        .from(card, { y: 140, rotation: -16, autoAlpha: 0, duration: 0.9, ease: "power4.out" })
        .add(autoStamp, "+=0.15");
    }
  }

  if (!motion) { r.classList.remove("m"); return; }

  /* ---- motion: confident and unfussy ------------------------------------------------------------ */
  gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

  if (hero) {
    gsap.set([".hero-mark .wm", ".hero-line", ".hero-center .btn", ".hero-top"], { visibility: "visible" });
    r.classList.remove("m");
    gsap.timeline({ defaults: { ease: "power4.out" } })
      .from(".hero-img", { scale: 1.12, duration: 2.2, ease: "power3.out" }, 0)
      .from(".hero-mark .g", { yPercent: 108, duration: 1.3, stagger: 0.05 }, 0.25)
      .from(".hero-top > *", { y: -16, autoAlpha: 0, duration: 0.8, stagger: 0.08 }, 0.7)
      .from(".hero-line", { y: 40, autoAlpha: 0, duration: 1.2 }, 0.75)
      .from(".hero-center .btn", { y: 24, autoAlpha: 0, duration: 1 }, 1.05);
    gsap.to(".hero-img", { yPercent: 12, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true } });
  } else {
    r.classList.remove("m");
    if ($(".page-hero")) gsap.from(".page-hero-in > *", { y: 40, autoAlpha: 0, duration: 1.1, ease: "power3.out", stagger: 0.1 });
  }

  ScrollTrigger.batch("[data-up]", {
    start: "top 80%", once: true,
    onEnter: function (els) { gsap.fromTo(els, { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: "power3.out", stagger: 0.12, overwrite: true }); }
  });

  $$(".collage").forEach(function (c) {
    gsap.fromTo($(".c-back", c), { yPercent: 18 }, { yPercent: -18, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
    gsap.fromTo($(".c-front", c), { yPercent: 4 }, { yPercent: -4, ease: "none", scrollTrigger: { trigger: c, start: "top bottom", end: "bottom top", scrub: true } });
  });
  if ($(".letters-art")) gsap.from(".letters-art img", { y: 80, autoAlpha: 0, duration: 1.2, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ".letters-art", start: "top 70%", once: true } });

  $$(".illo").forEach(function (svg) {
    var strokes = $$("[stroke]", svg), fills = $$("[style*='fill']", svg);
    if (!strokes.length) return;
    var tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: "top 78%", once: true } });
    tl.from(strokes, { drawSVG: 0, duration: 0.7, ease: "power2.out", stagger: 0.04 });
    if (fills.length) tl.from(fills, { autoAlpha: 0, scale: 0, transformOrigin: "50% 50%", duration: 0.4, ease: "back.out(2)", stagger: 0.03 }, "-=0.25");
  });

  if ($(".swatches")) {
    gsap.timeline({ scrollTrigger: { trigger: ".swatches", start: "top 72%", once: true } })
      .from(".swatch", { y: 50, autoAlpha: 0, duration: 0.8, ease: "power3.out", stagger: 0.12, clearProps: "transform" })
      .from(".swatch.is-today .sw-now", { scale: 0, duration: 0.5, ease: "back.out(2.5)" }, "-=0.2");
  }
  $$(".panel-dot").forEach(function (dot) {
    gsap.from(dot, { scale: 0.6, rotation: -20, autoAlpha: 0, duration: 1, ease: "back.out(1.6)", scrollTrigger: { trigger: dot, start: "top 75%", once: true } });
  });
  if ($(".steps-grid")) gsap.from(".steps-grid b", { scale: 0, duration: 0.6, ease: "back.out(2.5)", stagger: 0.15, scrollTrigger: { trigger: ".steps-grid", start: "top 72%", once: true } });

  if ($(".products")) gsap.from(".product .p-img", { clipPath: "inset(100% 0% 0% 0%)", duration: 1.3, ease: "expo.inOut", stagger: 0.15, scrollTrigger: { trigger: ".products", start: "top 70%", once: true } });
  if ($(".wm-foot")) gsap.from(".wm-foot .g", { yPercent: 108, ease: "none", stagger: 0.04, scrollTrigger: { trigger: ".foot-mark", start: "top bottom", end: "bottom bottom", scrub: 0.8 } });

  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { ScrollTrigger.refresh(); });
})();
