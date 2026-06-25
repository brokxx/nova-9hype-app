/* NOVA — Composant runtime : KycRiskScoreBadge & panneau de revue KYC
 * --------------------------------------------------------------------
 * JS CLASSIQUE (pas de modules ES, doit marcher en file://).
 * S'enregistre sur window.NovaComponents (créé s'il n'existe pas).
 * Dépend de window.NovaUI (helper el, statusBadge, fmtDate).
 *
 * PROJET NOVA — future fintech / néobanque EN DÉVELOPPEMENT (non agréé).
 *
 * API exposée :
 *   NovaComponents.KycRiskScoreBadge(score)         -> HTMLElement <span>
 *       Badge coloré du score de risque KYC (0-100) :
 *         0-24  faible (vert)   · 25-49 modéré (ambre)
 *         50-74 élevé (rouge)   · 75-100 critique (rouge plein)
 *
 *   NovaComponents.kycFlagsBadges(profile)          -> [HTMLElement]
 *       Petits badges PEP / Sanctions si présents sur le profil.
 *
 *   NovaComponents.KycReviewPanel(profile, opts)    -> HTMLElement
 *       Panneau de revue d'un profil KYC : identité, score, drapeaux,
 *       documents, motifs, et actions de décision (vérifier / refuser /
 *       documents requis / escalader). opts.onDecision(profile, decision).
 *
 * Champs attendus (mirror de js/data/kycProfiles.js) :
 *   id, type ('individual'|'business'), name, country, status, riskScore,
 *   pep, sanctionsHit, documents[], reasons[], createdAt, updatedAt
 */
(function (global, doc) {
  'use strict';

  var NC = global.NovaComponents = global.NovaComponents || {};
  var UI = global.NovaUI;

  function el(tag, attrs, children) {
    if (UI && UI.el) return UI.el(tag, attrs, children);
    // fallback minimal si NovaUI absent
    var n = doc.createElement(tag);
    if (attrs) for (var k in attrs) { if (k === "text") n.textContent = attrs[k]; else if (k === "class") n.className = attrs[k]; else n.setAttribute(k, attrs[k]); }
    if (children) (Array.isArray(children) ? children : [children]).forEach(function (c) { if (c != null) n.appendChild(typeof c === "string" ? doc.createTextNode(c) : c); });
    return n;
  }
  function fmtDate(v) { return (UI && UI.fmtDate) ? UI.fmtDate(v) : String(v || "—"); }

  // Niveau de risque dérivé d'un score 0-100 -> variant de badge admin.css.
  function levelFromScore(score) {
    if (score == null || isNaN(score)) return "neutral";
    if (score >= 75) return "critical";
    if (score >= 50) return "high";
    if (score >= 25) return "medium";
    return "low";
  }
  function labelFromScore(score) {
    if (score == null || isNaN(score)) return "n/c";
    if (score >= 75) return "critique";
    if (score >= 50) return "élevé";
    if (score >= 25) return "modéré";
    return "faible";
  }

  function KycRiskScoreBadge(score) {
    var variant = levelFromScore(score);
    var val = (score == null || isNaN(score)) ? "—" : String(score);
    return el("span", {
      class: "nv-badge nv-badge--" + variant,
      title: "Score de risque KYC : " + val + "/100 (" + labelFromScore(score) + ")"
    }, val + " · " + labelFromScore(score));
  }

  function kycFlagsBadges(profile) {
    profile = profile || {};
    var out = [];
    if (profile.pep) out.push(el("span", { class: "nv-badge nv-badge--warning", title: "Personne politiquement exposée" }, "PEP"));
    if (profile.sanctionsHit) out.push(el("span", { class: "nv-badge nv-badge--critical", title: "Correspondance liste de sanctions" }, "Sanctions"));
    if (!out.length) out.push(el("span", { class: "nv-muted", text: "Aucun" }));
    return out;
  }

  function metaRow(label, valueNode) {
    return el("div", { class: "nv-row", style: { gap: "8px", flexWrap: "wrap", marginBottom: "8px" } }, [
      el("span", { class: "nv-stat-label", style: { minWidth: "120px" }, text: label }),
      valueNode
    ]);
  }

  function chip(txt) {
    return el("span", {
      class: "nv-badge nv-badge--neutral",
      style: { textTransform: "none", letterSpacing: "0" }
    }, txt);
  }

  // Panneau de revue. opts.onDecision(profile, decision) où decision ∈
  // 'verified' | 'rejected' | 'documents_required' | 'escalated'.
  function KycReviewPanel(profile, opts) {
    opts = opts || {};
    if (!profile) {
      return el("div", { class: "nv-card" }, [
        el("div", { class: "nv-state", style: { border: "0", padding: "24px 8px" } }, [
          el("div", { class: "nv-state-ico", text: "⛉" }),
          el("div", { class: "nv-state-msg", text: "Sélectionnez un profil dans la liste pour ouvrir sa revue KYC." })
        ])
      ]);
    }

    var typeLabel = profile.type === "business" ? "KYB · personne morale" : "KYC · personne physique";

    var docs = el("div", { class: "nv-row", style: { gap: "6px", flexWrap: "wrap" } },
      (profile.documents && profile.documents.length)
        ? profile.documents.map(function (d) { return chip(String(d).replace(/_/g, " ")); })
        : [el("span", { class: "nv-muted", text: "Aucune pièce collectée" })]);

    var reasons = el("ul", { style: { margin: "6px 0 0", paddingLeft: "18px", color: "var(--nv-ink2)", fontSize: "13.5px" } },
      (profile.reasons && profile.reasons.length)
        ? profile.reasons.map(function (r) { return el("li", { style: { marginBottom: "4px" }, text: r }); })
        : [el("li", { class: "nv-muted", text: "Aucune observation enregistrée." })]);

    function decisionBtn(label, variant, decision) {
      return el("button", {
        class: "nv-btn nv-btn--sm " + variant,
        text: label,
        onclick: function () { if (opts.onDecision) opts.onDecision(profile, decision); }
      });
    }

    var actions = el("div", { class: "nv-row", style: { gap: "8px", flexWrap: "wrap", marginTop: "14px" } }, [
      decisionBtn("Vérifier", "nv-btn--primary", "verified"),
      decisionBtn("Documents requis", "nv-btn--ghost", "documents_required"),
      decisionBtn("Escalader", "nv-btn--ghost", "escalated"),
      decisionBtn("Refuser", "nv-btn--danger", "rejected")
    ]);

    return el("div", { class: "nv-card" }, [
      el("div", { class: "nv-row", style: { justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "12px" } }, [
        el("div", null, [
          el("div", { class: "nv-card-title", text: profile.name || "Profil" }),
          el("div", { class: "nv-card-sub", text: typeLabel + " · " + (profile.country || "—") + " · " + (profile.id || "") })
        ]),
        UI && UI.statusBadge ? UI.statusBadge(profile.status) : el("span", { text: profile.status })
      ]),
      metaRow("Score de risque", KycRiskScoreBadge(profile.riskScore)),
      metaRow("Drapeaux", el("div", { class: "nv-row", style: { gap: "6px", flexWrap: "wrap" } }, kycFlagsBadges(profile))),
      metaRow("Documents", docs),
      metaRow("Reçu le", el("span", { text: fmtDate(profile.createdAt) })),
      metaRow("Mis à jour", el("span", { text: fmtDate(profile.updatedAt) })),
      el("div", { class: "nv-section-title", style: { fontSize: "14px", margin: "10px 0 0" }, text: "Observations" }),
      reasons,
      actions,
      el("p", { class: "nv-muted", style: { fontSize: "11.5px", marginTop: "12px" },
        text: "Projet en développement — décisions de démonstration sur données fictives, sous réserve des autorisations nécessaires (cadre AML/CFT)." })
    ]);
  }

  NC.KycRiskScoreBadge = KycRiskScoreBadge;
  NC.kycFlagsBadges = kycFlagsBadges;
  NC.KycReviewPanel = KycReviewPanel;

})(typeof window !== "undefined" ? window : this, document);
