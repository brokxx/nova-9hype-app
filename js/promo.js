/* promo.js — Nova "Première page" behaviour (vanilla port of the prototype).
   Handles: loading screen, stock-chart random walk, typewriter headline,
   3D mouse parallax, and the FR/EN language toggle. */
(function () {
  "use strict";

  var DICT = window.NOVA_I18N;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     1. Loading screen — "nova" blurs in letter by letter, then
        propels forward (scale-up) to reveal the page.
  --------------------------------------------------------------- */
  (function loader() {
    var el = document.getElementById("nova-loader");
    if (!el) return;
    var word = el.querySelector(".nl-word");
    "nova".split("").forEach(function (ch, i) {
      var s = document.createElement("span");
      s.textContent = ch;
      s.style.animationDelay = (i * 0.15) + "s";
      word.appendChild(s);
    });
    var t0 = Date.now();
    var MIN = reduced ? 700 : 2100;   // entrée (~1.2s) + lecture courte
    var MAX = 8000;                   // garde-fou
    var iv = setInterval(function () {
      var ready = !!document.querySelector(".promo");
      var elapsed = Date.now() - t0;
      if ((ready && elapsed > MIN) || elapsed > MAX) {
        clearInterval(iv);
        word.classList.add("zoom");   // propulsion vers l'écran
        setTimeout(function () {
          el.style.opacity = "0";
          el.style.pointerEvents = "none";
        }, reduced ? 120 : 480);
        setTimeout(function () { el.remove(); }, reduced ? 360 : 1150);
      }
    }, 100);
  })();

  /* ---------------------------------------------------------------
     2. Stock chart — irregular upward random walk, fresh each load.
  --------------------------------------------------------------- */
  function paintChart() {
    var area = document.getElementById("ps-area");
    var line = document.getElementById("ps-line");
    var dotA = document.getElementById("ps-dot-a");
    var dotB = document.getElementById("ps-dot-b");
    if (!area || !line) return;

    var N = 52, v = 95, pts = [];
    for (var i = 0; i <= N; i++) {
      var x = (260 / N) * i;
      var drift = -0.6;
      var shock = (Math.random() - 0.46) * 10;
      var spike = Math.random() < 0.08 ? (Math.random() - 0.5) * 22 : 0;
      v = Math.max(10, Math.min(106, v + drift + shock + spike));
      pts.push([x, v]);
    }
    // redresse la tendance sans pic artificiel : montée répartie sur la courbe
    var lift = pts[N][1] - 20;
    if (lift > 0) {
      for (var j = 0; j <= N; j++) {
        pts[j][1] = Math.max(8, Math.min(106, pts[j][1] - lift * Math.pow(j / N, 1.25)));
      }
    }
    var d = "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L");
    line.setAttribute("d", d);
    area.setAttribute("d", d + " V112 H0 Z");
    var end = pts[N];
    [dotA, dotB].forEach(function (c) {
      if (c) { c.setAttribute("cx", end[0].toFixed(1)); c.setAttribute("cy", end[1].toFixed(1)); }
    });
  }

  /* ---------------------------------------------------------------
     3. Typewriter headline — rotates through the localised phrases.
  --------------------------------------------------------------- */
  function makeTypewriter(el, getLines, opts) {
    var txt = el.querySelector(".tw-txt");
    var rest = el.querySelector(".tw-rest");
    var hold = (opts.hold || 5) * 1000;
    var k = Math.max(0.2, opts.speed || 1);
    var lines = getLines();
    var v = { i: 0, len: lines[0].length, mode: null };
    var timer = null;

    function render() {
      var cur = lines[v.i];
      txt.textContent = cur.slice(0, v.len);
      rest.textContent = cur.slice(v.len);
      el.setAttribute("aria-label", cur);
    }
    function step() {
      var cur = lines[v.i];
      if (v.mode === "del") {
        if (v.len > 0) {
          v.len--; render();
          timer = setTimeout(step, (13 + Math.random() * 11) / k);
        } else {
          v.i = (v.i + 1) % lines.length; v.len = 0; v.mode = "type"; render();
          timer = setTimeout(step, 260 / k);
        }
      } else {
        if (v.len < cur.length) {
          var ch = cur[v.len];
          v.len++; render();
          var pause = ch === " " ? 18 : (ch === "," || ch === ".") ? 120 : 0;
          timer = setTimeout(step, (28 + Math.random() * 42 + pause) / k);
        } else {
          timer = setTimeout(function () { v.mode = "del"; step(); }, hold);
        }
      }
    }
    function stop() { clearTimeout(timer); clearInterval(timer); }
    function start() {
      stop();
      lines = getLines();
      v = { i: 0, len: lines[0].length, mode: null };
      render();
      if (reduced) {
        timer = setInterval(function () {
          v.i = (v.i + 1) % lines.length; v.len = lines[v.i].length; render();
        }, hold);
        return;
      }
      timer = setTimeout(function () { v.mode = "del"; step(); }, hold);
    }
    return { start: start, stop: stop };
  }

  /* ---------------------------------------------------------------
     4. 3D mouse parallax — phone + card tilt towards the cursor.
  --------------------------------------------------------------- */
  function initParallax() {
    var host = document.querySelector(".promo");
    var scene = document.querySelector(".promo-scene");
    if (!host || !scene) return;
    if (reduced) { scene.style.setProperty("--mx", 0); scene.style.setProperty("--my", 0); return; }
    var tilt = 1, tx = 0, ty = 0, cx = 0, cy = 0;
    function loop() {
      cx += (tx - cx) * 0.07;
      cy += (ty - cy) * 0.07;
      scene.style.setProperty("--mx", (cx * tilt).toFixed(4));
      scene.style.setProperty("--my", (cy * tilt).toFixed(4));
      requestAnimationFrame(loop);
    }
    host.addEventListener("mousemove", function (e) {
      var r = host.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
    });
    host.addEventListener("mouseleave", function () { tx = 0; ty = 0; });
    requestAnimationFrame(loop);
  }

  /* ---------------------------------------------------------------
     5. Language (FR / EN) — swap copy + restart the typewriter.
  --------------------------------------------------------------- */
  var typer = null;
  var lang = localStorage.getItem("nova-lang") || "fr";

  function setText(sel, val) {
    var el = document.querySelector(sel);
    if (el) el.textContent = val;
  }

  function applyLang(l) {
    lang = (l === "en") ? "en" : "fr";
    localStorage.setItem("nova-lang", lang);
    document.documentElement.lang = lang;
    var p = DICT[lang].promo;

    setText(".js-login", p.login);
    setText(".js-open", p.open);
    setText(".promo-body", p.body);
    setText(".promo-hint", p.hint);
    setText(".po-pct", p.offer.pct);
    setText(".po-post", p.offer.post);
    setText(".po-sub", p.offer.sub);
    setText(".ps-acc-label", p.savings);

    var statSpans = document.querySelectorAll(".ps-stat > span");
    p.stats.forEach(function (s, idx) {
      var span = statSpans[idx];
      if (!span) return;
      span.textContent = "";
      span.appendChild(document.createTextNode(s[0]));
      var b = document.createElement("b");
      b.className = "ps-pct";
      b.textContent = s[1];
      span.appendChild(b);
      span.appendChild(document.createTextNode(s[2]));
    });

    setText(".cards-title", p.cards.title);
    setText(".cards-body", p.cards.body);
    setText(".cards-cta", p.cards.cta);
    setText(".cards-small", p.cards.small);

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.classList.toggle("on", btn.dataset.lang === lang);
    });

    if (typer) typer.start();
  }

  /* ---------------------------------------------------------------
     Init
  --------------------------------------------------------------- */
  function init() {
    paintChart();
    var title = document.querySelector(".promo-title.tw");
    if (title) {
      typer = makeTypewriter(title, function () { return DICT[lang].promo.lines; }, { speed: 1, hold: 5 });
    }
    applyLang(lang);   // sets copy + starts the typewriter
    initParallax();
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () { applyLang(btn.dataset.lang); });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
