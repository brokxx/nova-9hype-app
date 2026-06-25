/* NOVA — Composants runtime de l'espace utilisateur (app-dashboard)
 * -----------------------------------------------------------------
 * JS CLASSIQUE (pas de modules ES, doit marcher en file://).
 * S'enregistre sur window.NovaComponents (créé s'il n'existe pas).
 * Dépend de window.NovaUI (helpers el, statusBadge, fmtEUR, fmtDate,
 * monitoringChart) et lit les données via window.NovaData.demoApp.
 *
 * PROJET NOVA — future fintech / néobanque EN DÉVELOPPEMENT (non agréé).
 * Données 100 % FICTIVES. DA beige #E9E4DB, vert #2FD96E pour le positif.
 *
 * API exposée (toutes retournent un HTMLElement) :
 *   NovaComponents.BalanceOverviewCard(account, opts)   -> solde + mini graphe
 *   NovaComponents.TransactionList(transactions, opts)  -> liste des opérations
 *   NovaComponents.BudgetCategoryCard(category)         -> 1 catégorie de budget
 *   NovaComponents.CardPreview(card, opts)              -> carte métal verticale
 *   NovaComponents.SecuritySettingsCard(events, opts)   -> sécurité + journal
 *   NovaComponents.ProfileSummary(user, account, opts)  -> fiche profil
 *   NovaComponents.SettingsPanel(settings, opts)        -> panneau paramètres
 *
 * Types runtime cohérents avec :
 *   DemoAccount, DemoCard, DemoTransaction, DemoBudgetCategory, DemoSecurityEvent
 * (cf. js/data/demoApp.js et le modèle TypeScript /types).
 */
(function (global, doc) {
  'use strict';

  var NC = global.NovaComponents = global.NovaComponents || {};
  var UI = global.NovaUI;

  /* ---------------------------------------------------------- helpers DOM -- */
  function el(tag, attrs, children) {
    if (UI && UI.el) return UI.el(tag, attrs, children);
    var n = doc.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "text") n.textContent = v;
      else if (k === "html") n.innerHTML = v;
      else if (k === "class" || k === "className") n.className = v;
      else if (k === "style" && typeof v === "object") { for (var s in v) n.style[s] = v[s]; }
      else if (k.indexOf("on") === 0 && typeof v === "function") n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    if (children != null) (Array.isArray(children) ? children : [children]).forEach(function (c) {
      if (c == null || c === false) return;
      n.appendChild(typeof c === "string" || typeof c === "number" ? doc.createTextNode(String(c)) : c);
    });
    return n;
  }
  function fmtEUR(n) { return (UI && UI.fmtEUR) ? UI.fmtEUR(n) : (Number(n).toFixed(2) + " €"); }
  function fmtDate(v) { return (UI && UI.fmtDate) ? UI.fmtDate(v) : String(v || "—"); }
  function statusBadge(v, kind) { return (UI && UI.statusBadge) ? UI.statusBadge(v, kind) : el("span", { text: String(v || "") }); }

  function pct(spent, budget) {
    if (!budget || budget <= 0) return 0;
    return Math.min(100, Math.round((spent / budget) * 100));
  }

  /* glyphes simples par catégorie / type (sans dépendance icône) */
  var CAT_GLYPH = {
    home: "⌂", cart: "🛒", coffee: "☕", card: "▭", wallet: "👛",
    logement: "⌂", courses: "🛒", cafes_restaurants: "☕", transport: "🚇",
    abonnements: "↻", shopping: "👜", salaire: "＋", epargne: "✦",
    virement_p2p: "⇄"
  };
  function catGlyph(cat) { return CAT_GLYPH[cat] || "•"; }

  /* signe / couleur d'un montant de transaction */
  function txAmountNode(tx) {
    var amt = Number(tx.amountEUR || 0);
    var positive = amt > 0;
    var cls = positive ? "nv-pos-text" : (amt < 0 ? "nv-neg-text" : "nv-muted");
    var sign = positive ? "+" : "";
    return el("span", { class: cls, style: { fontVariantNumeric: "tabular-nums" },
      text: sign + fmtEUR(amt) });
  }

  /* =========================================================== BalanceCard == */
  /* account : DemoAccount. opts.spark : [number] (série mini-graphe).        */
  function BalanceOverviewCard(account, opts) {
    account = account || {};
    opts = opts || {};

    var spark = opts.spark || account.spark || [7900, 8120, 8050, 8300, 8210, 8412.5];

    var head = el("div", { class: "nv-row", style: { justifyContent: "space-between", alignItems: "flex-start", gap: "12px" } }, [
      el("div", null, [
        el("span", { class: "nv-stat-label", text: "Solde disponible" }),
        el("div", { class: "nv-app-balance" }, [
          fmtEUR(account.balanceEUR),
          el("small", { text: " " + (account.currency || "EUR") })
        ])
      ]),
      statusBadge(account.type || "courant", "neutral")
    ]);

    var meta = el("div", { class: "nv-row", style: { gap: "18px", flexWrap: "wrap", marginTop: "10px", fontSize: "13px", color: "var(--nv-ink3)" } }, [
      el("span", { html: "<b style='color:var(--nv-ink2)'>IBAN</b> " + (account.iban || "—") }),
      el("span", { html: "<b style='color:var(--nv-ink2)'>BIC</b> " + (account.bic || "—") }),
      account.updatedAt ? el("span", { html: "<b style='color:var(--nv-ink2)'>Mis à jour</b> " + fmtDate(account.updatedAt) }) : null
    ]);

    var chartBox = el("div", { style: { marginTop: "16px" } });
    if (UI && UI.monitoringChart) {
      UI.monitoringChart(chartBox, [{ label: "Solde (30 j)", color: "#2FD96E", data: spark }], {
        type: "line", title: "Évolution du solde", height: 180
      });
    }

    /* tuile épargne avec notice de risque 7 % */
    var savings = el("div", { class: "nv-card", style: { marginTop: "16px", background: "var(--nv-surface2)" } }, [
      el("div", { class: "nv-row", style: { justifyContent: "space-between", alignItems: "baseline", gap: "10px" } }, [
        el("div", null, [
          el("span", { class: "nv-stat-label", text: "Épargne Nova" }),
          el("div", { class: "nv-stat-value", style: { fontSize: "22px" }, text: fmtEUR(account.savingsEUR) })
        ]),
        el("span", { class: "nv-badge nv-badge--success", title: account.savingsRateLabel || "",
          text: (account.savingsRateLabel || "7 % annualisé (objectif)") })
      ]),
      el("p", { class: "nv-notice", style: { marginTop: "10px" }, html:
        "<b>Information importante.</b> " + (account.savingsDisclaimer ||
        "Objectif indicatif, non garanti. Mécanisme à définir, sous réserve des autorisations nécessaires.") +
        " Capital exposé à un risque." })
    ]);

    return el("div", { class: "nv-app-hero" }, [head, meta, chartBox, savings]);
  }

  /* ============================================================ TransactionList */
  /* transactions : [DemoTransaction]. opts.limit, opts.title, opts.cards (map) */
  function TransactionList(transactions, opts) {
    opts = opts || {};
    transactions = (transactions || []).slice();

    transactions.sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
    if (opts.limit) transactions = transactions.slice(0, opts.limit);

    var list = el("div", { class: "nv-tx-list" });

    if (!transactions.length) {
      list.appendChild(el("div", { class: "nv-state", style: { border: "0", padding: "28px 12px" } }, [
        el("div", { class: "nv-state-ico", text: "∅" }),
        el("div", { class: "nv-state-msg", text: opts.emptyText || "Aucune opération à afficher." })
      ]));
    } else {
      transactions.forEach(function (tx) {
        var pending = tx.status === "pending";
        var row = el("div", { class: "nv-tx-row", style: {
          display: "flex", alignItems: "center", gap: "12px",
          padding: "12px 4px", borderBottom: "1px solid var(--nv-line)"
        } }, [
          el("span", { class: "nv-tx-ico", "aria-hidden": "true", style: {
            width: "38px", height: "38px", flex: "0 0 auto", borderRadius: "11px",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "var(--nv-surface2)", fontSize: "16px"
          }, text: catGlyph(tx.category) }),
          el("div", { style: { flex: "1 1 auto", minWidth: "0" } }, [
            el("div", { class: "nv-row", style: { gap: "8px", alignItems: "center" } }, [
              el("span", { style: { fontWeight: "700", color: "var(--nv-ink)" }, text: tx.merchant || tx.label || "Opération" }),
              pending ? statusBadge("pending") : null
            ]),
            el("div", { style: { fontSize: "12.5px", color: "var(--nv-ink3)" },
              text: (tx.label || "") + " · " + fmtDate(tx.createdAt) })
          ]),
          txAmountNode(tx)
        ]);
        list.appendChild(row);
      });
    }

    var card = el("div", { class: "nv-card" });
    if (opts.title !== false) {
      card.appendChild(el("div", { class: "nv-row", style: { justifyContent: "space-between", alignItems: "baseline", marginBottom: "6px" } }, [
        el("div", { class: "nv-card-title", text: opts.title || "Transactions récentes" }),
        opts.action || null
      ]));
    }
    card.appendChild(list);
    return card;
  }

  /* ========================================================= BudgetCategoryCard */
  /* category : DemoBudgetCategory                                              */
  function BudgetCategoryCard(category) {
    category = category || {};
    var p = pct(category.spentEUR, category.budgetEUR);
    var over = Number(category.spentEUR || 0) > Number(category.budgetEUR || 0);
    var barColor = over ? "var(--nv-danger)" : (category.color || "#2FD96E");

    return el("div", { class: "nv-card" }, [
      el("div", { class: "nv-row", style: { justifyContent: "space-between", alignItems: "center", gap: "10px" } }, [
        el("div", { class: "nv-row", style: { gap: "10px" } }, [
          el("span", { "aria-hidden": "true", style: {
            width: "32px", height: "32px", borderRadius: "9px", flex: "0 0 auto",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            background: "var(--nv-surface2)", fontSize: "15px"
          }, text: catGlyph(category.icon || category.category) }),
          el("div", { class: "nv-card-title", style: { fontSize: "15px" }, text: category.label || category.category || "Catégorie" })
        ]),
        el("span", { class: over ? "nv-neg-text" : "nv-muted", style: { fontSize: "12.5px", fontWeight: "700" },
          text: p + " %" })
      ]),
      el("div", { class: "nv-budget-track", style: {
        marginTop: "12px", height: "9px", borderRadius: "999px",
        background: "var(--nv-surface2)", overflow: "hidden"
      } }, [
        el("div", { style: {
          width: p + "%", height: "100%", borderRadius: "999px",
          background: barColor, transition: "width .3s ease"
        } })
      ]),
      el("div", { class: "nv-row", style: { justifyContent: "space-between", marginTop: "8px", fontSize: "13px", color: "var(--nv-ink3)" } }, [
        el("span", { html: "Dépensé <b style='color:var(--nv-ink)'>" + fmtEUR(category.spentEUR) + "</b>" }),
        el("span", { html: "Budget <b style='color:var(--nv-ink2)'>" + fmtEUR(category.budgetEUR) + "</b>" })
      ]),
      over ? el("p", { class: "nv-notice", style: { marginTop: "10px" },
        html: "<b>Dépassement.</b> Cette catégorie dépasse l'enveloppe prévue." }) : null
    ]);
  }

  /* =============================================================== CardPreview */
  /* card : DemoCard. opts.onFreeze(card), opts.onReveal(card)                 */
  function CardPreview(card, opts) {
    card = card || {};
    opts = opts || {};
    var physical = card.type === "physical";

    /* carte métal miroir verticale (physique) vs carte virtuelle verte */
    var faceBg = physical
      ? "linear-gradient(155deg,#2a2a2e 0%,#0e0e10 38%,#3a3a40 60%,#101012 100%)"
      : "linear-gradient(155deg,#1c4d34 0%,#0f1f17 45%,#2FD96E 130%)";

    var face = el("div", { class: "nv-card-metal", style: {
      position: "relative", width: "210px", aspectRatio: "0.63",
      borderRadius: "16px", padding: "18px 16px",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      color: "#F2EEE6", background: faceBg,
      boxShadow: "0 24px 50px -28px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.18)",
      overflow: "hidden", opacity: card.frozen ? "0.55" : "1"
    } }, [
      el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" } }, [
        el("span", { style: { fontFamily: "var(--font-display, Archivo, sans-serif)", fontWeight: "700", letterSpacing: "-0.04em", fontSize: "18px" }, text: "nova" }),
        el("span", { style: { fontSize: "10px", letterSpacing: ".14em", textTransform: "uppercase", opacity: ".8" },
          text: physical ? "Métal" : "Virtuelle" })
      ]),
      el("div", null, [
        el("div", { style: { fontVariantNumeric: "tabular-nums", letterSpacing: ".12em", fontSize: "15px", marginBottom: "8px" },
          text: "•••• •••• •••• " + (card.last4 || "0000") }),
        el("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "11px", opacity: ".85" } }, [
          el("span", { text: (card.network || "Mastercard") }),
          el("span", { text: "Exp. " + (card.expiry || "—") })
        ])
      ]),
      card.frozen ? el("div", { style: {
        position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "12px", fontWeight: "700", letterSpacing: ".1em", textTransform: "uppercase",
        background: "rgba(15,15,18,.35)"
      }, text: "❄ Gelée" }) : null
    ]);

    var limitP = pct(card.monthlySpentEUR, card.monthlyLimitEUR);

    var info = el("div", { style: { flex: "1 1 220px", minWidth: "0" } }, [
      el("div", { class: "nv-row", style: { gap: "8px", alignItems: "center", marginBottom: "4px" } }, [
        el("div", { class: "nv-card-title", style: { fontSize: "16px" }, text: card.label || "Carte" }),
        statusBadge(card.frozen ? "suspended" : (card.status || "active"))
      ]),
      el("div", { class: "nv-card-sub", text: (physical ? "Carte physique" : "Carte virtuelle") + " · " + (card.network || "Mastercard") + " · •••• " + (card.last4 || "0000") }),
      el("div", { style: { marginTop: "12px" } }, [
        el("div", { class: "nv-row", style: { justifyContent: "space-between", fontSize: "12.5px", color: "var(--nv-ink3)" } }, [
          el("span", { text: "Dépenses du mois" }),
          el("span", { html: "<b style='color:var(--nv-ink)'>" + fmtEUR(card.monthlySpentEUR) + "</b> / " + fmtEUR(card.monthlyLimitEUR) })
        ]),
        el("div", { style: { marginTop: "6px", height: "8px", borderRadius: "999px", background: "var(--nv-surface2)", overflow: "hidden" } }, [
          el("div", { style: { width: limitP + "%", height: "100%", background: "var(--nv-pos)", borderRadius: "999px" } })
        ])
      ]),
      el("div", { class: "nv-row", style: { gap: "8px", marginTop: "14px", flexWrap: "wrap" } }, [
        el("button", { class: "nv-btn nv-btn--sm " + (card.frozen ? "nv-btn--primary" : "nv-btn--ghost"),
          text: card.frozen ? "Dégeler la carte" : "❄ Geler la carte",
          onclick: function () { if (opts.onFreeze) opts.onFreeze(card); } }),
        el("button", { class: "nv-btn nv-btn--sm nv-btn--ghost", text: "Voir les détails",
          onclick: function () { if (opts.onReveal) opts.onReveal(card); } }),
        el("span", { class: "nv-muted", style: { fontSize: "12px", alignSelf: "center" },
          text: card.contactless ? "Sans contact activé" : "Sans contact désactivé" })
      ])
    ]);

    return el("div", { class: "nv-card", style: { display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "flex-start" } }, [face, info]);
  }

  /* ========================================================= SecuritySettingsCard */
  /* events : [DemoSecurityEvent]. opts.settings (objet état des toggles)       */
  function SecuritySettingsCard(events, opts) {
    opts = opts || {};
    events = (events || []).slice();
    events.sort(function (a, b) { return new Date(b.createdAt || 0) - new Date(a.createdAt || 0); });

    var settings = opts.settings || {
      faceId: true, twoFactor: true, contactlessLimit: true, notifyLogins: true, lockOnline: false
    };

    function statusKind(s) {
      if (s === "warning") return "warning";
      if (s === "info") return "info";
      return "success";
    }

    function toggleRow(label, hint, key) {
      var on = !!settings[key];
      var sw = el("button", {
        class: "nv-switch" + (on ? " is-on" : ""), role: "switch",
        "aria-checked": on ? "true" : "false", "aria-label": label,
        style: {
          width: "42px", height: "24px", borderRadius: "999px", flex: "0 0 auto",
          border: "1px solid var(--nv-line2)", cursor: "pointer", position: "relative",
          background: on ? "var(--nv-pos)" : "var(--nv-surface2)", transition: "background .16s"
        }
      });
      sw.appendChild(el("span", { style: {
        position: "absolute", top: "2px", left: on ? "20px" : "2px",
        width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,.3)", transition: "left .16s"
      } }));
      sw.addEventListener("click", function () {
        settings[key] = !settings[key];
        var nowOn = settings[key];
        sw.classList.toggle("is-on", nowOn);
        sw.setAttribute("aria-checked", nowOn ? "true" : "false");
        sw.style.background = nowOn ? "var(--nv-pos)" : "var(--nv-surface2)";
        sw.firstChild.style.left = nowOn ? "20px" : "2px";
        if (opts.onToggle) opts.onToggle(key, nowOn, settings);
      });
      return el("div", { class: "nv-row", style: { justifyContent: "space-between", gap: "12px", padding: "11px 0", borderBottom: "1px solid var(--nv-line)" } }, [
        el("div", null, [
          el("div", { style: { fontWeight: "700", color: "var(--nv-ink)" }, text: label }),
          hint ? el("div", { style: { fontSize: "12.5px", color: "var(--nv-ink3)" }, text: hint }) : null
        ]),
        sw
      ]);
    }

    var togglesCard = el("div", { class: "nv-card" }, [
      el("div", { class: "nv-card-title", text: "Protections du compte" }),
      el("div", { class: "nv-card-sub", style: { marginBottom: "8px" }, text: "Réglages de sécurité — démonstration." }),
      toggleRow("Déverrouillage biométrique", "Face ID / empreinte pour ouvrir l'app", "faceId"),
      toggleRow("Double authentification (2FA)", "Code à usage unique à la connexion", "twoFactor"),
      toggleRow("Limite paiement sans contact", "Plafonner les paiements sans contact", "contactlessLimit"),
      toggleRow("Alertes de connexion", "Notification à chaque nouvelle connexion", "notifyLogins"),
      toggleRow("Bloquer les paiements en ligne", "Refuser les paiements e-commerce", "lockOnline")
    ]);

    var journal = el("div", { class: "nv-card" }, [
      el("div", { class: "nv-card-title", text: "Activité de sécurité récente" }),
      el("div", { class: "nv-card-sub", style: { marginBottom: "6px" }, text: "Connexions, 3-D Secure, appareils." })
    ]);
    if (!events.length) {
      journal.appendChild(el("div", { class: "nv-state", style: { border: "0", padding: "24px 8px" } }, [
        el("div", { class: "nv-state-ico", text: "∅" }),
        el("div", { class: "nv-state-msg", text: "Aucun événement de sécurité." })
      ]));
    } else {
      events.forEach(function (ev) {
        journal.appendChild(el("div", { class: "nv-row", style: { justifyContent: "space-between", gap: "12px", padding: "11px 0", borderBottom: "1px solid var(--nv-line)" } }, [
          el("div", null, [
            el("div", { style: { fontWeight: "700", color: "var(--nv-ink)" }, text: ev.label || ev.type || "Événement" }),
            el("div", { style: { fontSize: "12.5px", color: "var(--nv-ink3)" }, text: (ev.detail || "") + " · " + fmtDate(ev.createdAt) })
          ]),
          statusBadge(ev.status === "ok" ? "verified" : (ev.status === "warning" ? "pending" : "open"), statusKind(ev.status))
        ]));
      });
    }

    return el("div", { class: "nv-grid-2" }, [togglesCard, journal]);
  }

  /* ============================================================ ProfileSummary */
  function ProfileSummary(user, account, opts) {
    user = user || {};
    account = account || {};
    opts = opts || {};

    var initials = ((user.firstName || "?").charAt(0) + (user.lastName || "").charAt(0)).toUpperCase();

    function field(label, value) {
      return el("div", { class: "nv-row", style: { justifyContent: "space-between", gap: "12px", padding: "10px 0", borderBottom: "1px solid var(--nv-line)" } }, [
        el("span", { class: "nv-stat-label", text: label }),
        el("span", { style: { fontWeight: "700", color: "var(--nv-ink)", textAlign: "right" }, text: value == null || value === "" ? "—" : String(value) })
      ]);
    }

    var head = el("div", { class: "nv-row", style: { gap: "16px", alignItems: "center", marginBottom: "10px" } }, [
      el("span", { style: {
        width: "60px", height: "60px", borderRadius: "50%", flex: "0 0 auto",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        background: "var(--nv-ink)", color: "var(--nv-bg2)",
        fontFamily: "var(--font-display, Archivo, sans-serif)", fontWeight: "700", fontSize: "22px"
      }, text: initials }),
      el("div", null, [
        el("div", { class: "nv-card-title", style: { fontSize: "20px" }, text: (user.firstName || "") + " " + (user.lastName || "") }),
        el("div", { class: "nv-card-sub", text: user.email || "—" }),
        el("div", { class: "nv-row", style: { gap: "6px", marginTop: "6px" } }, [
          statusBadge(user.plan || "standard", "info"),
          statusBadge("verified")
        ])
      ])
    ]);

    return el("div", { class: "nv-card" }, [
      head,
      field("Pays de résidence", user.country),
      field("Profil", user.segment),
      field("Formule", user.plan),
      field("Client depuis", fmtDate(user.memberSince)),
      field("IBAN", account.iban),
      field("BIC / SWIFT", account.bic),
      el("p", { class: "nv-muted", style: { fontSize: "11.5px", marginTop: "12px" },
        text: "Données de démonstration — projet Nova en développement, non agréé. Identité vérifiée à titre fictif." })
    ]);
  }

  /* ============================================================ SettingsPanel */
  /* settings : objet { language, currency, notifications, theme, ... }        */
  function SettingsPanel(settings, opts) {
    settings = settings || {};
    opts = opts || {};

    var values = {
      language: settings.language || "fr",
      currency: settings.currency || "EUR",
      statements: settings.statements || "mensuel",
      notifPush: settings.notifPush !== false,
      notifEmail: settings.notifEmail !== false,
      marketing: !!settings.marketing
    };

    function selectRow(label, key, options) {
      var sel = el("select", { class: "nv-select" });
      options.forEach(function (o) {
        var val = typeof o === "object" ? o.value : o;
        var lab = typeof o === "object" ? o.label : o;
        sel.appendChild(el("option", { value: val, text: lab, selected: values[key] === val ? "selected" : null }));
      });
      sel.addEventListener("change", function () { values[key] = sel.value; if (opts.onChange) opts.onChange(key, sel.value, values); });
      return el("div", { class: "nv-row", style: { justifyContent: "space-between", gap: "12px", padding: "12px 0", borderBottom: "1px solid var(--nv-line)" } }, [
        el("span", { style: { fontWeight: "700", color: "var(--nv-ink)" }, text: label }),
        sel
      ]);
    }

    function checkRow(label, hint, key) {
      var box = el("input", { type: "checkbox", checked: values[key] ? "checked" : null,
        style: { width: "18px", height: "18px", accentColor: "#2FD96E", cursor: "pointer" } });
      box.addEventListener("change", function () { values[key] = box.checked; if (opts.onChange) opts.onChange(key, box.checked, values); });
      return el("label", { class: "nv-row", style: { justifyContent: "space-between", gap: "12px", padding: "12px 0", borderBottom: "1px solid var(--nv-line)", cursor: "pointer" } }, [
        el("div", null, [
          el("div", { style: { fontWeight: "700", color: "var(--nv-ink)" }, text: label }),
          hint ? el("div", { style: { fontSize: "12.5px", color: "var(--nv-ink3)" }, text: hint }) : null
        ]),
        box
      ]);
    }

    var prefs = el("div", { class: "nv-card" }, [
      el("div", { class: "nv-card-title", text: "Préférences" }),
      el("div", { class: "nv-card-sub", style: { marginBottom: "6px" }, text: "Affichage et relevés." }),
      selectRow("Langue", "language", [{ value: "fr", label: "Français" }, { value: "en", label: "English" }, { value: "lt", label: "Lietuvių" }]),
      selectRow("Devise d'affichage", "currency", [{ value: "EUR", label: "Euro (€)" }]),
      selectRow("Relevés", "statements", [{ value: "mensuel", label: "Mensuel" }, { value: "trimestriel", label: "Trimestriel" }])
    ]);

    var notifs = el("div", { class: "nv-card" }, [
      el("div", { class: "nv-card-title", text: "Notifications & confidentialité" }),
      el("div", { class: "nv-card-sub", style: { marginBottom: "6px" }, text: "Choisissez ce que Nova peut vous envoyer." }),
      checkRow("Notifications push", "Paiements, virements, alertes", "notifPush"),
      checkRow("E-mails de service", "Confirmations et relevés", "notifEmail"),
      checkRow("Communications marketing", "Nouveautés et offres (optionnel)", "marketing"),
      el("p", { class: "nv-muted", style: { fontSize: "11.5px", marginTop: "12px" },
        text: "Vos données sont traitées conformément au RGPD. Projet en développement — réglages de démonstration." })
    ]);

    var danger = el("div", { class: "nv-card", style: { marginTop: "0" } }, [
      el("div", { class: "nv-card-title", text: "Compte" }),
      el("div", { class: "nv-row", style: { gap: "8px", flexWrap: "wrap", marginTop: "8px" } }, [
        el("button", { class: "nv-btn nv-btn--ghost", text: "Exporter mes données (RGPD)",
          onclick: function () { if (opts.onAction) opts.onAction("export"); } }),
        el("button", { class: "nv-btn nv-btn--ghost", text: "Se déconnecter",
          onclick: function () { if (opts.onAction) opts.onAction("logout"); } }),
        el("button", { class: "nv-btn nv-btn--danger", text: "Clôturer le compte",
          onclick: function () { if (opts.onAction) opts.onAction("close"); } })
      ])
    ]);

    return el("div", null, [
      el("div", { class: "nv-grid-2", style: { marginBottom: "18px" } }, [prefs, notifs]),
      danger
    ]);
  }

  /* ================================================================ AppTabs == */
  /* Barre d'onglets en haut de l'espace utilisateur (Aperçu, Cartes, …).      */
  /* active : clé courante. Liens relatifs au dossier /app-dashboard/.         */
  var APP_TABS = [
    { key: "overview",     label: "Aperçu",       href: "overview.html" },
    { key: "cards",        label: "Cartes",       href: "cards.html" },
    { key: "transactions", label: "Transactions", href: "transactions.html" },
    { key: "budget",       label: "Budget",       href: "budget.html" },
    { key: "beta",         label: "Beta",         href: "beta.html" },
    { key: "security",     label: "Sécurité",     href: "security.html" },
    { key: "profile",      label: "Profil",       href: "profile.html" },
    { key: "settings",     label: "Paramètres",   href: "settings.html" }
  ];
  function AppTabs(active) {
    var bar = el("nav", { class: "nv-app-tabs", "aria-label": "Navigation de l'espace",
      style: {
        display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "22px",
        background: "var(--nv-surface)", border: "1px solid var(--nv-line)",
        borderRadius: "999px", padding: "5px", boxShadow: "var(--nv-shadow-sm)"
      } });
    APP_TABS.forEach(function (t) {
      var on = active === t.key;
      bar.appendChild(el("a", {
        href: t.href,
        "aria-current": on ? "page" : null,
        style: {
          padding: "8px 15px", borderRadius: "999px", fontSize: "13.5px", fontWeight: "700",
          textDecoration: "none", whiteSpace: "nowrap", transition: "background .16s, color .16s",
          color: on ? "var(--nv-bg2)" : "var(--nv-ink2)",
          background: on ? "var(--nv-ink)" : "transparent"
        },
        text: t.label
      }));
    });
    return bar;
  }
  NC.APP_TABS = APP_TABS;
  NC.AppTabs = AppTabs;

  NC.BalanceOverviewCard = BalanceOverviewCard;
  NC.TransactionList = TransactionList;
  NC.BudgetCategoryCard = BudgetCategoryCard;
  NC.CardPreview = CardPreview;
  NC.SecuritySettingsCard = SecuritySettingsCard;
  NC.ProfileSummary = ProfileSummary;
  NC.SettingsPanel = SettingsPanel;

})(typeof window !== "undefined" ? window : this, document);
