/* beta-lab.js — Nova · onglet BETA : épargne 7 % en temps réel.
   La STRATÉGIE est définie par Nova (objectif 7 % annualisé, sans exposition au
   marché → croissance régulière). L'utilisateur peut seulement : déposer, retirer,
   programmer un versement mensuel, et suivre l'évolution + la performance en direct.
   Simulation pédagogique — objectif non garanti. Script CLASSIQUE (file://).
   Expose window.NovaBeta.mount(container). */
(function (global) {
  "use strict";

  var KEY = "nova-beta-v2";
  var RATE = 0.07;          // objectif annualisé moyen (tendance, stratégie Nova)
  var VOL = 0.06;           // volatilité annualisée simulée (variations réalistes)
  var SPEED = 1;            // jours simulés par seconde réelle (rythme calme, simulation)

  /* ---------- DOM helper ---------- */
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null) return;
      if (k === "text") n.textContent = v;
      else if (k === "html") n.innerHTML = v;
      else if (k === "style" && typeof v === "object") Object.keys(v).forEach(function (s) { n.style[s] = v[s]; });
      else if (k.indexOf("on") === 0 && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) { if (c != null && c !== false) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  }
  function fmtEUR(n) { return (Number(n) || 0).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"; }
  function parseAmt(v) { var n = parseFloat(String(v).replace(/\s/g, "").replace(",", ".")); return (isNaN(n) || n <= 0) ? null : Math.round(n * 100) / 100; }
  function fmtDur(days) {
    var y = Math.floor(days / 365), m = Math.floor((days % 365) / 30), d = Math.floor(days % 30), p = [];
    if (y) p.push(y + " an" + (y > 1 ? "s" : "")); if (m) p.push(m + " mois"); p.push(d + " j");
    return p.join(" ");
  }
  function randNormal() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function defaultState() {
    return { value: 0, contributed: 0, monthly: 0, simDays: 0, twr: 1, history: [], running: true, started: false };
  }
  var st = defaultState();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
  function load() { try { var r = localStorage.getItem(KEY); if (r) { var p = JSON.parse(r); if (p && typeof p.value === "number") st = p; } } catch (e) {} }

  function gains() { return st.value - st.contributed; }
  function realizedAnnual() { var d = Math.max(10, st.simDays); return Math.pow(st.twr, 365 / d) - 1; }

  var R = {}, raf = null, lastTs = null, frameN = 0, mode = "in";

  /* ---------- moteur ---------- */
  function run() { if (raf) return; st.running = true; lastTs = null; raf = requestAnimationFrame(frame); syncStatus(); }
  function stop() { st.running = false; if (raf) cancelAnimationFrame(raf); raf = null; save(); syncStatus(); }
  function frame(ts) {
    if (!st.running) return;
    if (lastTs == null) lastTs = ts;
    var dt = Math.min(0.1, (ts - lastTs) / 1000); lastTs = ts;
    step(dt); frameN++;
    updateLive();
    if (frameN % 6 === 0) drawChart();
    if (frameN % 150 === 0) { save(); updateProjection(); }
    raf = requestAnimationFrame(frame);
  }
  function step(dtSec) {
    if (!st.started) return;                       // rien tant qu'aucun dépôt
    var dDays = SPEED * dtSec; if (dDays <= 0) return;
    if (st.value > 0) {
      var dailyTrend = Math.pow(1 + RATE, 1 / 365) - 1;     // tendance (objectif 7 %)
      var dailyVol = VOL / Math.sqrt(252);                  // variation réaliste
      var before = st.value;
      st.value *= Math.pow(1 + dailyTrend, dDays);                       // dérive haussière
      st.value *= (1 + randNormal() * dailyVol * Math.sqrt(dDays));      // aléa : monte/descend
      if (st.value < 0) st.value = 0;
      st.twr *= (st.value / before);                        // perf réalisée (hors dépôts/retraits)
    }
    var prev = st.simDays; st.simDays += dDays;
    var add = (Math.floor(st.simDays / 30) - Math.floor(prev / 30)) * (Number(st.monthly) || 0);
    if (add > 0) { st.value += add; st.contributed += add; }
    st._acc = (st._acc || 0) + dDays;
    if (st._acc >= 1.0 && st.value > 0) {
      st._acc = 0;
      st.history.push({ d: st.simDays, v: st.value });
      if (st.history.length > 520) st.history.splice(0, st.history.length - 520);
    }
  }

  /* ---------- actions utilisateur ---------- */
  function deposit(a) {
    a = parseAmt(a); if (!a) return false;
    if (!st.started) {        // 1er dépôt : on cale l'horloge et la perf à zéro
      st.started = true; st.simDays = 0; st.twr = 1; st._acc = 0;
      st.value = a; st.contributed = a; st.history = [{ d: 0, v: a }];
    } else { st.value += a; st.contributed += a; }
    save(); updateLive(); drawChart(); updateProjection(); return true;
  }
  function withdraw(a) {
    a = parseAmt(a); if (!a || st.value <= 0) return false;
    a = Math.min(a, st.value);
    var ratio = (st.value - a) / st.value;
    st.value -= a; st.contributed *= ratio;   // retrait proportionnel (capital + gains) → % de plus-value inchangé
    save(); updateLive(); drawChart(); updateProjection(); return true;
  }
  function setMonthly(a) { st.monthly = Number(parseAmt(a)) || 0; save(); if (R.monthlyEcho) R.monthlyEcho.textContent = st.monthly > 0 ? ("Versement mensuel actif : " + fmtEUR(st.monthly)) : "Aucun versement mensuel programmé."; updateProjection(); }
  function reset() { stop(); st = defaultState(); st.running = true; save(); rebuildAll(); run(); }

  /* ---------- rendu live ---------- */
  function updateLive() {
    if (!R.value) return;
    var g = gains(), gp = st.contributed > 0 ? g / st.contributed : 0;   // rendement RÉEL depuis le dépôt
    var sign = g >= 0 ? "+" : "−", green = g >= 0;
    var pct = (Math.abs(gp) * 100).toFixed(2).replace(".", ",");
    R.value.textContent = fmtEUR(st.value);
    R.contributed.textContent = fmtEUR(st.contributed);
    // plus-value : € et % cohérents et proportionnels au capital déposé
    R.gains.textContent = sign + fmtEUR(Math.abs(g));
    R.gains.style.color = green ? "#1B9E58" : "#c0392b";
    R.gainsSub.textContent = sign + pct + " % depuis le dépôt";
    // pastille = rendement réalisé cumulé (part de 0, progresse vers ~7 % sur 1 an)
    R.pill.textContent = sign + pct + " %";
    R.pill.style.color = green ? "#1B9E58" : "#c0392b";
    R.pill.style.background = green ? "rgba(47,217,110,.12)" : "rgba(192,57,43,.10)";
    R.pill.style.borderColor = green ? "rgba(47,217,110,.28)" : "rgba(192,57,43,.28)";
    R.elapsed.textContent = fmtDur(st.simDays);
    if (R.maxBtn) R.maxBtn.style.display = mode === "out" ? "" : "none";
  }
  function drawChart() {
    if (!R.svg) return;
    var h = st.history, W = 640, H = 150, pad = 6;
    if (h.length < 2) { R.svg.innerHTML = ""; return; }
    var min = Infinity, max = -Infinity;
    h.forEach(function (p) { if (p.v < min) min = p.v; if (p.v > max) max = p.v; });
    if (min === max) { min = Math.max(0, min - 1); max = max + 1; }
    var span = Math.max(1, max - min), n = h.length;
    function X(i) { return pad + (i / (n - 1)) * (W - 2 * pad); }
    function Y(v) { return pad + (1 - (v - min) / span) * (H - 2 * pad); }
    var line = "M" + h.map(function (p, i) { return X(i).toFixed(1) + " " + Y(p.v).toFixed(1); }).join(" L");
    var area = line + " L" + X(n - 1).toFixed(1) + " " + H + " L" + X(0).toFixed(1) + " " + H + " Z";
    R.svg.innerHTML =
      '<defs><linearGradient id="betaG" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#2FD96E" stop-opacity=".22"></stop>' +
      '<stop offset="1" stop-color="#2FD96E" stop-opacity="0"></stop></linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#betaG)"></path>' +
      '<path d="' + line + '" fill="none" stroke="#1B9E58" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path>' +
      '<circle cx="' + X(n - 1).toFixed(1) + '" cy="' + Y(h[n - 1].v).toFixed(1) + '" r="3.6" fill="#1B9E58"></circle>';
  }
  /* projection intérêts composés : capital capitalisé à 7 %/an composé.
     bal_{n} = (bal_{n-1} + versements de l'année) × 1,07.
     -> à 1 an le rendement sur le capital versé vaut EXACTEMENT 7 %, ~14,49 % à 2 ans, etc. */
  function projValues(years) {
    var D = Math.max(0, st.contributed || 0), M = Math.max(0, Number(st.monthly) || 0);
    var bal = D, contributed = D;
    for (var k = 1; k <= years; k++) {
      bal += 12 * M; contributed += 12 * M;   // versements de l'année
      bal *= 1.07;                             // +7 % composé
    }
    return { total: bal, contributed: contributed, interest: Math.max(0, bal - contributed) };
  }
  function updateProjection() {
    if (!R.arcC) return;
    var years = R.projYear || 10;
    var p = projValues(years), total = p.total, contributed = p.contributed, interest = p.interest;
    var C = 2 * Math.PI * 46;
    var fc = total > 0 ? contributed / total : 0, fi = total > 0 ? interest / total : 0;
    R.arcC.setAttribute("stroke-dasharray", (fc * C).toFixed(2) + " " + C.toFixed(2));
    R.arcI.setAttribute("stroke-dasharray", (fi * C).toFixed(2) + " " + C.toFixed(2));
    R.arcI.setAttribute("stroke-dashoffset", (-(fc * C)).toFixed(2));
    var has = total > 0, rend = contributed > 0 ? interest / contributed : 0;   // rendement cumulé / capital versé
    R.projTotal.textContent = has ? fmtEUR(total) : "—";
    R.legVers.textContent = has ? fmtEUR(contributed) : "Déposez pour voir";
    R.legInt.textContent = has ? (fmtEUR(interest) + "  ·  +" + (rend * 100).toFixed(1).replace(".", ",") + " %") : "—";
  }

  function syncStatus() {
    if (!R.dot) return;
    R.dot.style.background = st.running ? "#1B9E58" : "rgba(23,23,26,.28)";
    R.dot.style.boxShadow = st.running ? "0 0 0 4px rgba(47,217,110,.18)" : "none";
    R.statusTxt.textContent = st.running ? "Suivi en temps réel" : "En pause";
    R.pauseBtn.textContent = st.running ? "Pause" : "Reprendre";
  }

  /* ---------- UI ---------- */
  var mountEl = null;
  function rebuildAll() { if (mountEl) build(mountEl); }

  function segBtn(label, m) {
    var b = el("button", { class: "beta-seg" + (mode === m ? " is-on" : ""), text: label });
    b.addEventListener("click", function () { mode = m; rebuildAll(); });
    return b;
  }

  function build(container) {
    mountEl = container;
    container.innerHTML = "";

    /* — Carte solde + graphe (hero) — */
    R.pill = el("span", { class: "beta-pill", text: "+0,00 %" });
    R.dot = el("span", { class: "beta-dot" });
    R.statusTxt = el("span", { class: "beta-status-txt" });
    R.pauseBtn = el("button", { class: "beta-mini-btn", onclick: function () { st.running ? stop() : run(); } });
    var resetBtn = el("button", { class: "beta-mini-btn", text: "Réinitialiser", onclick: reset });
    R.value = el("div", { class: "beta-balance" });
    R.elapsed = el("span", null);
    var svgWrap = el("div", { class: "beta-chart", html: '<svg viewBox="0 0 640 150" preserveAspectRatio="none"></svg>' });
    R.svg = svgWrap.querySelector("svg");

    var hero = el("section", { class: "beta-card beta-hero" }, [
      el("div", { class: "beta-hero-top" }, [
        el("div", { class: "beta-row" }, [R.dot, R.statusTxt]),
        el("div", { class: "beta-row", style: { gap: "8px" } }, [R.pauseBtn, resetBtn])
      ]),
      el("div", { class: "beta-label", text: "Épargne Nova · objectif 7 % annualisé" }),
      el("div", { class: "beta-balance-row" }, [R.value, R.pill]),
      svgWrap,
      el("div", { class: "beta-elapsed" }, [el("span", { text: "Temps simulé : " }), R.elapsed])
    ]);

    /* — Stats — */
    function stat(label, key, sub) {
      R[key] = el("div", { class: "beta-stat-val" });
      var kids = [el("div", { class: "beta-stat-label", text: label }), R[key]];
      if (sub) { R[key + "Sub"] = el("div", { class: "beta-stat-sub" }); kids.push(R[key + "Sub"]); }
      return el("div", { class: "beta-stat" }, kids);
    }
    var objStat = el("div", { class: "beta-stat" }, [
      el("div", { class: "beta-stat-label", text: "Objectif annuel" }),
      el("div", { class: "beta-stat-val", style: { color: "#1B9E58" }, text: "+7 %/an" }),
      el("div", { class: "beta-stat-sub", text: "cible atteinte sur 12 mois — non garantie" })
    ]);
    var stats = el("div", { class: "beta-stats" }, [
      stat("Total déposé", "contributed"),
      stat("Plus-value (réalisée)", "gains", true),
      objStat
    ]);

    /* — Actions : déposer / retirer — */
    var input = el("input", { class: "beta-input", type: "text", inputmode: "decimal", placeholder: "0,00 €" });
    var chips = el("div", { class: "beta-chips" });
    [50, 100, 200, 500, 1000, 5000].forEach(function (q) { chips.appendChild(el("button", { class: "beta-chip", text: q.toLocaleString("fr-FR") + " €", onclick: function () { input.value = q; } })); });
    R.maxBtn = el("button", { class: "beta-chip", text: "Max", onclick: function () { input.value = Math.floor(st.value * 100) / 100; } });
    chips.appendChild(R.maxBtn);

    var confirm = el("button", { class: "beta-cta" });
    function syncConfirm() { confirm.textContent = mode === "in" ? "Déposer" : "Retirer"; }
    syncConfirm();
    confirm.addEventListener("click", function () {
      var ok = mode === "in" ? deposit(input.value) : withdraw(input.value);
      if (ok) { input.value = ""; flash(confirm, mode === "in" ? "Dépôt effectué ✓" : "Retrait effectué ✓"); if (!st.running) run(); }
      else { input.style.borderColor = "#c0392b"; setTimeout(function () { input.style.borderColor = ""; }, 900); }
    });

    var monthlyIn = el("input", { class: "beta-input", type: "text", inputmode: "decimal", placeholder: "0,00 €", value: st.monthly ? String(st.monthly) : "" });
    monthlyIn.addEventListener("input", function () { setMonthly(monthlyIn.value); });
    var monthlyChips = el("div", { class: "beta-chips" });
    [20, 50, 100, 200, 500, 1000].forEach(function (q) {
      monthlyChips.appendChild(el("button", { class: "beta-chip", text: q.toLocaleString("fr-FR") + " €", onclick: function () { monthlyIn.value = q; setMonthly(q); } }));
    });
    R.monthlyEcho = el("div", { class: "beta-stat-sub", style: { marginTop: "6px" } });

    var actions = el("section", { class: "beta-card" }, [
      el("div", { class: "beta-seg-wrap" }, [segBtn("Déposer", "in"), segBtn("Retirer", "out")]),
      el("label", { class: "beta-field-label", text: "Montant" }),
      input, chips, confirm,
      el("div", { class: "beta-divider" }),
      el("label", { class: "beta-field-label", text: "Versement mensuel automatique" }),
      monthlyIn, monthlyChips, R.monthlyEcho
    ]);

    var notice = el("div", { class: "beta-notice", html:
      "<b>Espace de démonstration.</b> La stratégie est gérée par Nova : la valeur évolue avec des <b>variations réalistes</b> — elle peut monter et descendre — autour d'un objectif moyen de <b>7 % annualisé</b> sur la durée. Les gains sont proportionnels au capital déposé. " +
      "Les montants sont <b>simulés</b> et accélérés dans le temps : aucun argent réel n'est engagé. L'objectif de 7 % est une cible, non une garantie, soumise aux autorisations réglementaires nécessaires." });

    /* — Projection : intérêts composés (camembert / donut) — */
    R.projYear = 10;
    var yearVal = el("span", { class: "beta-proj-year", text: "10 ans" });
    var yearSlider = el("input", { class: "beta-slider", type: "range", min: "1", max: "60", step: "1", value: "10" });
    function paintSlider() {
      var pct = (Number(yearSlider.value) - 1) / 59 * 100;
      yearSlider.style.background = "linear-gradient(to right, #1B9E58 0%, #1B9E58 " + pct + "%, #E7E1D6 " + pct + "%, #E7E1D6 100%)";
    }
    yearSlider.addEventListener("input", function () {
      R.projYear = Number(yearSlider.value);
      yearVal.textContent = R.projYear + (R.projYear > 1 ? " ans" : " an");
      paintSlider(); updateProjection();
    });
    // clic n'importe où sur la barre → saute à cette position (fallback cross-navigateur)
    yearSlider.addEventListener("click", function (e) {
      var rect = yearSlider.getBoundingClientRect();
      if (rect.width <= 0) return;
      var ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      var v = Math.round(1 + ratio * 59);
      if (v !== Number(yearSlider.value)) { yearSlider.value = v; yearSlider.dispatchEvent(new Event("input")); }
    });
    var ticks = el("div", { class: "beta-ticks" }, [1, 15, 30, 45, 60].map(function (t) { return el("span", { text: t + " ans" }); }));
    var control = el("div", { class: "beta-proj-control" }, [
      el("div", { class: "beta-proj-control-top" }, [
        el("span", { class: "beta-stat-label", text: "Horizon de projection" }), yearVal
      ]),
      yearSlider, ticks
    ]);

    var donutWrap = el("div", { class: "beta-donut-wrap", html:
      '<svg viewBox="0 0 120 120" class="beta-donut" aria-hidden="true">' +
        '<circle cx="60" cy="60" r="46" fill="none" stroke="#E7E1D6" stroke-width="16"></circle>' +
        '<circle class="beta-arc-c" cx="60" cy="60" r="46" fill="none" stroke="#3F3F42" stroke-width="16" stroke-dasharray="0 999" transform="rotate(-90 60 60)"></circle>' +
        '<circle class="beta-arc-i" cx="60" cy="60" r="46" fill="none" stroke="#1B9E58" stroke-width="16" stroke-dasharray="0 999" stroke-dashoffset="0" transform="rotate(-90 60 60)"></circle>' +
      '</svg>' });
    R.arcC = donutWrap.querySelector(".beta-arc-c");
    R.arcI = donutWrap.querySelector(".beta-arc-i");
    R.projTotalLabel = el("small", { text: "Patrimoine" });
    R.projTotal = el("b");
    donutWrap.appendChild(el("div", { class: "beta-donut-center" }, [R.projTotalLabel, R.projTotal]));

    R.legVers = el("div", { class: "beta-leg-val" });
    R.legInt = el("div", { class: "beta-leg-val" });
    var legend = el("div", { class: "beta-legend" }, [
      el("div", { class: "beta-leg-row" }, [
        el("span", { class: "beta-leg-dot", style: { background: "#3F3F42" } }),
        el("div", null, [el("div", { class: "beta-leg-label", text: "Vos versements" }), R.legVers])
      ]),
      el("div", { class: "beta-leg-row" }, [
        el("span", { class: "beta-leg-dot", style: { background: "#1B9E58" } }),
        el("div", null, [el("div", { class: "beta-leg-label", text: "Intérêts composés (7 %/an)" }), R.legInt])
      ])
    ]);

    var projCard = el("section", { class: "beta-card beta-proj" }, [
      el("div", { class: "beta-proj-head" }, [
        el("div", { class: "nv-section-title", style: { margin: "0" }, text: "Projection : intérêts composés" }),
        el("div", { class: "beta-stat-sub", text: "Selon votre dépôt et votre versement mensuel, capitalisés à 7 %/an composé." })
      ]),
      control,
      el("div", { class: "beta-proj-body" }, [donutWrap, legend]),
      el("div", { class: "beta-proj-caption", text: "Année après année, grâce aux intérêts composés, la part verte (intérêts) grandit pendant que celle de vos versements diminue proportionnellement. Projection simulée à 7 % annualisé — objectif non garanti." })
    ]);

    container.appendChild(el("div", { class: "beta-objective" }, [
      el("span", { class: "beta-objective-pct", text: "7 %" }),
      el("div", { class: "beta-objective-tx" }, [
        el("b", { text: "Objectif de rendement annualisé" }),
        el("small", { text: "Performance cible visée par la stratégie Nova — objectif non garanti. Projet en développement, sous réserve des autorisations nécessaires." })
      ])
    ]));
    container.appendChild(el("div", { class: "beta-grid" }, [
      el("div", null, [hero, stats]),
      actions
    ]));
    container.appendChild(projCard);
    container.appendChild(notice);

    syncConfirm();
    setMonthly(st.monthly);
    updateLive(); drawChart(); syncStatus(); updateProjection(); paintSlider();
    if (st.running) run();
  }

  function flash(btn, msg) {
    var old = btn.textContent; btn.textContent = msg; btn.classList.add("is-done");
    setTimeout(function () { btn.classList.remove("is-done"); btn.textContent = (mode === "in" ? "Déposer" : "Retirer"); }, 1200);
  }

  function mount(container) { load(); build(container); }
  global.NovaBeta = { mount: mount };
})(window);
