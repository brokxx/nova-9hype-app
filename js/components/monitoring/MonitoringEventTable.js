/* NOVA — Composant runtime : MonitoringEventTable & MonitoringEventCard
 * ----------------------------------------------------------------------
 * JS CLASSIQUE (pas de modules ES, doit marcher en file://).
 * S'enregistre sur window.NovaComponents (créé s'il n'existe pas).
 * Dépend de window.NovaUI (dataTable, statusBadge, statusBadge sévérité, fmtDate).
 *
 * PROJET NOVA — future fintech / néobanque EN DÉVELOPPEMENT (non agréé).
 *
 * API exposée :
 *   NovaComponents.MonitoringEventTable(container, rows, opts) -> { refresh, getRows }
 *       Tableau des événements de monitoring (sévérité, type, message,
 *       utilisateur, statut, date), triable / cherchable / paginé.
 *       opts.onRowClick(event) optionnel.
 *
 *   NovaComponents.severityBadge(severity)   -> HTMLElement <span>
 *       Badge de sévérité ('low'|'medium'|'high'|'critical').
 *
 *   NovaComponents.MonitoringEventCard(event) -> HTMLElement
 *       Carte d'alerte d'un événement (réutilise la DA .nv-alert).
 *
 * Champs attendus (mirror de js/data/monitoringEvents.js) :
 *   id, type, severity, message, userId, createdAt, status
 */
(function (global, doc) {
  'use strict';

  var NC = global.NovaComponents = global.NovaComponents || {};
  var UI = global.NovaUI;

  function el(tag, attrs, children) {
    if (UI && UI.el) return UI.el(tag, attrs, children);
    var n = doc.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === "text") n.textContent = attrs[k]; else if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]); }
    if (children) (Array.isArray(children) ? children : [children]).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? doc.createTextNode(c) : c); });
    return n;
  }
  function fmtDate(v) { return (UI && UI.fmtDate) ? UI.fmtDate(v) : String(v || "—"); }

  // Libellés FR lisibles des types d'événements.
  var TYPE_LABELS = {
    unusual_login: "Connexion inhabituelle",
    repeated_login_failures: "Échecs de connexion répétés",
    unusual_transaction: "Transaction inhabituelle",
    repeated_kyc_failure: "Échec KYC répété",
    device_change: "Changement d’appareil",
    unusual_country: "Pays inhabituel",
    payment_velocity: "Vélocité de paiement",
    suspicious_p2p: "P2P suspect",
    structuring: "Fractionnement (structuring)",
    card_fraud_suspected: "Fraude carte suspectée",
    new_beneficiary: "Nouveau bénéficiaire",
    sanctions_screening: "Screening sanctions",
    session_anomaly: "Anomalie de session",
    system: "Système"
  };
  function typeLabel(t) { return TYPE_LABELS[t] || String(t || "—").replace(/_/g, " "); }

  function severityBadge(sev) {
    var v = sev || "medium";
    return el("span", { class: "nv-badge nv-badge--" + v, title: "Sévérité : " + v }, v);
  }

  function MonitoringEventTable(container, rows, opts) {
    opts = opts || {};
    if (!UI || !UI.dataTable) {
      if (typeof container === "string") container = doc.querySelector(container);
      if (container) container.appendChild(el("div", { class: "nv-state nv-error" }, "NovaUI indisponible."));
      return { refresh: function () {}, getRows: function () { return rows || []; } };
    }
    return UI.dataTable(container, {
      rows: rows || [],
      columns: [
        { key: "createdAt", label: "Date", render: function (v) { return fmtDate(v); } },
        { key: "severity", label: "Sévérité", render: function (v) { return severityBadge(v); } },
        { key: "type", label: "Type", render: function (v) { return typeLabel(v); }, raw: function (r) { return typeLabel(r.type); } },
        { key: "message", label: "Message" },
        { key: "userId", label: "Utilisateur", render: function (v) { return v ? "<code>" + v + "</code>" : "<span class='nv-muted'>système</span>"; } },
        { key: "status", label: "Statut", render: function (v) { return UI.statusBadge(v); } }
      ],
      options: {
        pageSize: opts.pageSize || 12,
        sortKey: opts.sortKey || "createdAt",
        sortDir: opts.sortDir || "desc",
        emptyText: opts.emptyText || "Aucun événement de monitoring.",
        onRowClick: opts.onRowClick || null
      }
    });
  }

  function MonitoringEventCard(event) {
    event = event || {};
    var sev = event.severity || "medium";
    var icoMap = { low: "○", medium: "△", high: "▲", critical: "✖" };
    return el("div", { class: "nv-alert is-" + sev }, [
      el("div", { class: "nv-alert-ico", text: icoMap[sev] || "△" }),
      el("div", { class: "nv-alert-body" }, [
        el("div", { class: "nv-alert-head" }, [
          el("span", { class: "nv-alert-title", text: typeLabel(event.type) }),
          severityBadge(sev),
          event.status ? UI.statusBadge(event.status) : null
        ]),
        el("p", { class: "nv-alert-desc", text: event.message || "" }),
        el("div", { class: "nv-alert-meta" }, [
          event.id ? el("span", { html: "<b>Réf.</b> " + event.id }) : null,
          event.userId ? el("span", { html: "<b>Utilisateur</b> " + event.userId }) : el("span", { html: "<b>Origine</b> système" }),
          event.createdAt ? el("span", { html: "<b>Détecté</b> " + fmtDate(event.createdAt) }) : null
        ])
      ])
    ]);
  }

  NC.MonitoringEventTable = MonitoringEventTable;
  NC.MonitoringEventCard = MonitoringEventCard;
  NC.severityBadge = severityBadge;
  NC.monitoringTypeLabel = typeLabel;

})(typeof window !== "undefined" ? window : this, document);
