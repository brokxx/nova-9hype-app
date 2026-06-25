/* site.js — en-tête (menu) + pied de page partagés du site vitrine Nova.
   Script CLASSIQUE (file://). Une seule source pour la navigation publique :
   toutes les pages appellent NovaSite.mountHeader(active) + NovaSite.mountFooter().
   Liens relatifs depuis la racine du site (pages publiques à la racine). */
(function (global) {
  "use strict";

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  // Menu principal (clé -> libellé -> page). Pages publiques à la racine.
  var MENU = [
    { key: "features", label: "Fonctionnalités", href: "features.html" },
    { key: "savings",  label: "Épargne",         href: "savings.html" },
    { key: "security", label: "Sécurité",        href: "security.html" },
    { key: "pricing",  label: "Tarifs",          href: "pricing.html" },
    { key: "about",    label: "À propos",         href: "about.html" }
  ];

  function buildHeader(active, base) {
    base = base || "";
    var word = el("a", { class: "ns-word", href: base + "index.html", text: "nova", title: "Accueil Nova" });

    var menu = el("nav", { class: "ns-menu", id: "nsMenu", "aria-label": "Navigation principale" });
    MENU.forEach(function (m) {
      menu.appendChild(el("a", {
        class: "ns-link-menu" + (active === m.key ? " is-active" : ""),
        href: base + m.href,
        "aria-current": active === m.key ? "page" : null,
        text: m.label
      }));
    });
    // (classe utilitaire pour le style .ns-menu a)
    Array.prototype.forEach.call(menu.children, function (a) { a.className = a.className.replace("ns-link-menu", "").trim(); });

    var actions = el("div", { class: "ns-actions" }, [
      el("a", { class: "ns-link ghost ns-desktop", href: base + "support/index.html", text: "Support" }),
      el("a", { class: "ns-link ns-desktop", href: base + "App.html", text: "Se connecter" }),
      el("a", { class: "ns-link solid", href: base + "App.html", text: "Ouvrir un compte" })
    ]);

    var burger = el("button", { class: "ns-burger", "aria-label": "Menu", text: "☰" });
    burger.addEventListener("click", function () { menu.classList.toggle("is-open"); });

    return el("header", { class: "ns-header" }, [burger, word, menu, actions]);
  }

  function buildFooter(base) {
    base = base || "";
    function col(title, links) {
      return el("div", null, [el("h4", { text: title })].concat(links.map(function (l) {
        return el("a", { href: base + l[1], text: l[0] });
      })));
    }
    var cols = el("div", { class: "ns-footer-cols" }, [
      el("div", null, [
        el("div", { class: "ns-footer-word", text: "nova" }),
        el("p", { class: "ns-footer-tag", text: "La future plateforme pour mieux comprendre, organiser et faire évoluer votre argent." })
      ]),
      col("Produit", [["Fonctionnalités", "features.html"], ["Épargne 7 %", "savings.html"], ["Sécurité", "security.html"], ["Tarifs", "pricing.html"]]),
      col("Entreprise", [["À propos", "about.html"], ["Contact", "contact.html"], ["Support", "support/index.html"]]),
      col("Accès", [["Mon espace", "App.html"], ["Backoffice", "admin/index.html"], ["Documentation", "docs/_project-context.md"]])
    ]);
    var legal = el("div", { class: "ns-footer-legal", text:
      "Projet en développement. Nova n'est pas un établissement bancaire agréé. Certains services financiers pourront être soumis à autorisation réglementaire ou fournis via des partenaires agréés, sous réserve des autorisations nécessaires. Structure visée : UAB (Lituanie), licence d'Établissement de Monnaie Électronique auprès de la Banque de Lituanie. L'objectif « 7 % annualisé » est une cible, non une garantie — capital exposé à un risque. © 2026 Nova — nom de marque temporaire." });
    return el("footer", { class: "ns-footer" }, [el("div", { class: "ns-footer-in" }, [cols, legal])]);
  }

  function mountHeader(active, base) {
    if (document.body && !document.body.classList.contains("ns-body")) {
      document.body.classList.add("ns", "ns-body");
    }
    var header = buildHeader(active, base);
    var slot = document.getElementById("ns-header");
    if (slot) slot.replaceWith(header); else document.body.insertBefore(header, document.body.firstChild);
    return header;
  }
  function mountFooter(base) {
    var footer = buildFooter(base);
    var slot = document.getElementById("ns-footer");
    if (slot) slot.replaceWith(footer); else document.body.appendChild(footer);
    return footer;
  }

  global.NovaSite = { mountHeader: mountHeader, mountFooter: mountFooter, MENU: MENU, el: el };
})(window);
