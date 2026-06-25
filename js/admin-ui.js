/* ============================================================================
   NOVA — admin-ui.js  ·  window.NovaUI
   ----------------------------------------------------------------------------
   Bibliothèque de composants vanilla pour le backoffice/app interne Nova.
   Script CLASSIQUE (pas de module ES) : fonctionne en file://.
   Aucune dépendance externe. DA beige (cf. css/admin.css), vert #2FD96E
   pour le positif. S'appuie sur window.NovaStore pour l'export CSV.

   API PUBLIQUE
   ------------------------------------------------------------------------
   Layouts :
     mountLayout({active,title,description,breadcrumb,actions})
         -> construit sidebar + topbar + en-tête de page, retourne l'élément
            .nv-content (conteneur où injecter le contenu de la page).
     DashboardLayout(opts)      -> variante page « dashboard » (admin allégé).
     AppDashboardLayout(opts)   -> variante page utilisateur (app-dashboard),
                                   sidebar adoucie + notice de risque épargne.

   Composants :
     statsCard({label,value,delta,hint,icon})           -> HTMLElement
     dataTable(container,{columns,rows,options})         -> { refresh, getRows }
     filterBar(container, fields, onChange)              -> { values, set }
     searchBar(onInput)                                  -> HTMLElement (input)
     statusBadge(value, kind)                            -> HTMLElement <span>
     exportButton(getRows, filename)                     -> HTMLElement <button>
     riskAlertCard(alert)                                -> HTMLElement
     monitoringChart(container, series, {type})          -> SVG inline (line|bar)
     reportCard(report)                                  -> HTMLElement
     auditLogTable(container, rows)                      -> dataTable wrapper

   États :
     showLoading(container, msg)
     showEmpty(container, msg)
     showError(container, msg)

   Helpers :
     NovaUI.el(tag, attrs, children)   -> petit créateur d'éléments
     NovaUI.NAV                         -> liste de navigation de la sidebar
     NovaUI.fmtEUR(n) / fmtDate(iso) / fmtNum(n)
   ------------------------------------------------------------------------
   NAVIGATION SIDEBAR (label -> href relatif depuis /admin/) :
     Overview, Utilisateurs, Liste d'attente, Contact, Réclamations,
     Données personnelles, KYC, Risques, Monitoring, Anomalies,
     Stress tests, Reportings, Formation, Audit logs, Paramètres
     + raccourcis App dashboard et Support.
   ========================================================================== */
(function (global, doc) {
  "use strict";

  /* ----------------------------------------------------------- mini DOM dsl */
  function el(tag, attrs, children) {
    var node = doc.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v == null || v === false) continue;
        if (k === "class" || k === "className") node.className = v;
        else if (k === "html") node.innerHTML = v;
        else if (k === "text") node.textContent = v;
        else if (k === "style" && typeof v === "object") { for (var s in v) node.style[s] = v[s]; }
        else if (k.indexOf("on") === 0 && typeof v === "function") node.addEventListener(k.slice(2), v);
        else if (k === "dataset" && typeof v === "object") { for (var d in v) node.dataset[d] = v[d]; }
        else node.setAttribute(k, v);
      }
    }
    appendChildren(node, children);
    return node;
  }
  function appendChildren(node, children) {
    if (children == null) return;
    if (!Array.isArray(children)) children = [children];
    for (var i = 0; i < children.length; i++) {
      var c = children[i];
      if (c == null || c === false) continue;
      node.appendChild(typeof c === "string" || typeof c === "number" ? doc.createTextNode(String(c)) : c);
    }
  }
  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }
  function resolve(container) {
    if (typeof container === "string") return doc.querySelector(container);
    return container;
  }

  /* ------------------------------------------------------------- formatters */
  function fmtEUR(n) {
    if (n == null || n === "") return "—";
    try {
      return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(Number(n));
    } catch (e) { return Number(n).toFixed(2) + " €"; }
  }
  function fmtNum(n) {
    if (n == null || n === "") return "—";
    try { return new Intl.NumberFormat("fr-FR").format(Number(n)); }
    catch (e) { return String(n); }
  }
  function fmtDate(isoStr) {
    if (!isoStr) return "—";
    var d = new Date(isoStr);
    if (isNaN(d.getTime())) return String(isoStr);
    try {
      return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
    } catch (e) { return d.toISOString().slice(0, 16).replace("T", " "); }
  }

  /* =========================================================== NAVIGATION == */
  // label -> href relatif depuis /admin/
  var NAV = [
    { group: "Pilotage", items: [
      { label: "Overview", href: "overview.html", icon: "▦", key: "overview" },
      { label: "Utilisateurs", href: "users.html", icon: "◍", key: "users" },
      { label: "Liste d'attente", href: "waitlist.html", icon: "◷", key: "waitlist" }
    ]},
    { group: "Relation client", items: [
      { label: "Contact", href: "contact.html", icon: "✉", key: "contact" },
      { label: "Réclamations", href: "complaints.html", icon: "⚑", key: "complaints" },
      { label: "Données personnelles", href: "data-rights.html", icon: "⚖", key: "data-rights" }
    ]},
    { group: "Conformité & risque", items: [
      { label: "KYC", href: "kyc.html", icon: "⛉", key: "kyc" },
      { label: "Risques", href: "risk.html", icon: "△", key: "risk" },
      { label: "Monitoring", href: "monitoring.html", icon: "∿", key: "monitoring" },
      { label: "Anomalies", href: "anomalies.html", icon: "⊘", key: "anomalies" },
      { label: "Stress tests", href: "stress-tests.html", icon: "◴", key: "stress-tests" }
    ]},
    { group: "Reporting", items: [
      { label: "Reportings", href: "reports.html", icon: "▤", key: "reports" },
      { label: "Formation", href: "training.html", icon: "✓", key: "training" },
      { label: "Audit logs", href: "audit-logs.html", icon: "≣", key: "audit-logs" },
      { label: "Paramètres", href: "settings.html", icon: "⚙", key: "settings" }
    ]}
  ];
  // raccourcis hors backoffice (chemins relatifs depuis /admin/)
  var SHORTCUTS = [
    { label: "Accueil (site)", href: "../index.html", icon: "⌂", key: "home" },
    { label: "Mon espace", href: "../app-dashboard/overview.html", icon: "❖", key: "app-dashboard" },
    { label: "Support", href: "../support/index.html", icon: "☎", key: "support" }
  ];

  /* -------------------------------------------------- icône SVG dans badge -- */
  function navIco(glyph) {
    return el("span", { class: "nv-nav-ico", "aria-hidden": "true", text: glyph });
  }

  /* =============================================================== SIDEBAR == */
  function buildSidebar(active, opts) {
    opts = opts || {};
    var nav = el("nav", { class: "nv-nav" });

    NAV.forEach(function (grp) {
      nav.appendChild(el("div", { class: "nv-nav-group-label", text: grp.group }));
      grp.items.forEach(function (it) {
        nav.appendChild(el("a", {
          class: "nv-nav-link" + (active === it.key ? " is-active" : ""),
          href: it.href,
          "aria-current": active === it.key ? "page" : null
        }, [navIco(it.icon), el("span", { text: it.label })]));
      });
    });

    nav.appendChild(el("div", { class: "nv-nav-group-label", text: "Raccourcis" }));
    SHORTCUTS.forEach(function (it) {
      nav.appendChild(el("a", {
        class: "nv-nav-link" + (active === it.key ? " is-active" : ""),
        href: it.href
      }, [navIco(it.icon), el("span", { text: it.label })]));
    });

    var sidebar = el("aside", { class: "nv-sidebar", id: "nvSidebar" }, [
      el("div", { class: "nv-sidebar-head" }, [
        el("span", { class: "nv-wordmark", text: "nova" }),
        el("span", { class: "nv-sidebar-tag", text: opts.tag || "Backoffice" })
      ]),
      nav,
      el("div", { class: "nv-sidebar-foot", html:
        "Projet en développement — sous réserve des autorisations nécessaires. UAB (Lituanie), licence EMI visée auprès de la Banque de Lituanie." })
    ]);
    return sidebar;
  }

  /* ================================================================ TOPBAR == */
  function buildTopbar(breadcrumb, sidebar, isApp) {
    var bc = el("div", { class: "nv-breadcrumb" });
    var crumbs = breadcrumb || [];
    if (!Array.isArray(crumbs)) crumbs = [crumbs];
    crumbs.forEach(function (c, i) {
      if (i > 0) bc.appendChild(el("span", { class: "nv-bc-sep", text: "/" }));
      bc.appendChild(i === crumbs.length - 1 ? el("b", { text: c }) : el("span", { text: c }));
    });

    var left = [];
    if (!isApp) {
      left.push(el("button", {
        class: "nv-menu-toggle", "aria-label": "Menu", text: "☰",
        onclick: function () { if (sidebar) sidebar.classList.toggle("is-open"); }
      }));
    }
    // le wordmark ramène toujours à l'accueil du site
    left.push(el("a", { class: "nv-topbar-word", href: "../index.html", title: "Accueil Nova", text: "nova" }));

    var actions = [];
    if (isApp) {
      actions.push(el("a", { class: "nv-quit-link", href: "../index.html", text: "Accueil" }));
      actions.push(el("a", { class: "nv-quit-link", href: "../admin/index.html", text: "Backoffice" }));
      actions.push(el("span", { class: "nv-avatar", title: "Camille Martin", text: "CM" }));
    } else {
      actions.push(el("a", { class: "nv-quit-link", href: "../index.html", text: "Quitter" }));
      actions.push(el("span", { class: "nv-avatar", title: "Admin Manao", text: "AM" }));
    }

    return el("header", { class: "nv-topbar" }, left.concat([
      bc,
      el("div", { class: "nv-topbar-spacer" }),
      el("div", { class: "nv-topbar-actions" }, actions)
    ]));
  }

  /* ============================================================ PAGE HEAD == */
  function buildPageHead(title, description, actions) {
    var head = el("div", { class: "nv-page-head" });
    head.appendChild(el("div", { class: "nv-ph-text" }, [
      el("h1", { class: "nv-page-title", text: title || "" }),
      description ? el("p", { class: "nv-page-desc", text: description }) : null
    ]));
    var act = el("div", { class: "nv-page-actions", id: "nvPageActions" });
    if (actions) appendChildren(act, actions);
    head.appendChild(act);
    return head;
  }

  /* ============================================================ mountLayout */
  function mountLayout(opts) {
    opts = opts || {};
    if (doc.body && !doc.body.classList.contains("nv-body")) doc.body.classList.add("nv-body");

    // espaces client (app / dashboard) : pas de sidebar backoffice → nav par
    // onglets (AppTabs) + topbar ; le backoffice garde sa sidebar.
    var noSidebar = (opts.shell === "app" || opts.shell === "dashboard");
    var layout = el("div", { class: "nv-layout" + (opts.shell === "app" ? " nv-app-shell" : "") + (noSidebar ? " nv-no-sidebar" : "") });
    var sidebar = noSidebar ? null : buildSidebar(opts.active, { tag: "Backoffice" });
    var topbar = buildTopbar(opts.breadcrumb || [opts.title || "Nova"], sidebar, noSidebar);
    var content = el("main", { class: "nv-content", id: "nvContent" });

    if (opts.title || opts.description || opts.actions) {
      content.appendChild(buildPageHead(opts.title, opts.description, opts.actions));
    }

    var main = el("div", { class: "nv-main" }, [topbar, content]);
    if (sidebar) layout.appendChild(sidebar);
    layout.appendChild(main);

    var mount = opts.mount ? resolve(opts.mount) : doc.body;
    mount.appendChild(layout);
    return content;        // conteneur où la page injecte son contenu
  }

  function DashboardLayout(opts) {
    opts = opts || {};
    opts.shell = "dashboard";
    return mountLayout(opts);
  }

  function AppDashboardLayout(opts) {
    opts = opts || {};
    opts.shell = "app";
    var content = mountLayout(opts);
    if (opts.savingsNotice !== false) {
      content.appendChild(el("div", { class: "nv-notice", html:
        "<b>Information importante.</b> L'objectif « 7 % annualisé » est une cible, " +
        "non une garantie. Le mécanisme reste à définir et toute mise en œuvre est " +
        "soumise à l'obtention des autorisations nécessaires. Capital exposé à un risque." }));
    }
    return content;
  }

  /* =============================================================== navCard == */
  /* Tuile cliquable vers une page/module (navigation interne, même fenêtre). */
  function navCard(opts) {
    opts = opts || {};
    return el("a", { class: "nv-navcard", href: opts.href || "#", "aria-label": opts.label || "" }, [
      el("span", { class: "nv-navcard-ico", "aria-hidden": "true", text: opts.icon || "▸" }),
      el("span", { class: "nv-navcard-body" }, [
        el("span", { class: "nv-navcard-label", text: opts.label || "" }),
        opts.desc ? el("span", { class: "nv-navcard-desc", text: opts.desc }) : null
      ]),
      el("span", { class: "nv-navcard-arrow", "aria-hidden": "true", text: "→" })
    ]);
  }

  /* ============================================================== statsCard */
  function statsCard(opts) {
    opts = opts || {};
    var top = el("div", { class: "nv-stat-top" }, [
      el("span", { class: "nv-stat-label", text: opts.label || "" }),
      opts.icon ? el("span", { class: "nv-stat-ico", text: opts.icon }) : null
    ]);
    var value = el("div", { class: "nv-stat-value", text: opts.value == null ? "—" : String(opts.value) });
    var foot = el("div", { class: "nv-stat-foot" });
    if (opts.delta != null && opts.delta !== "") {
      var num = typeof opts.delta === "number" ? opts.delta : parseFloat(String(opts.delta).replace(/[^\d.\-]/g, ""));
      var dir = num > 0 ? "is-up" : (num < 0 ? "is-down" : "is-flat");
      var arrow = num > 0 ? "▲" : (num < 0 ? "▼" : "■");
      var label = typeof opts.delta === "string" ? opts.delta : (num > 0 ? "+" : "") + num + " %";
      foot.appendChild(el("span", { class: "nv-delta " + dir, html: "<span aria-hidden='true'>" + arrow + "</span> " + label }));
    }
    if (opts.hint) foot.appendChild(el("span", { text: opts.hint }));
    return el("div", { class: "nv-stat" }, [top, value, foot]);
  }

  /* =============================================================== dataTable */
  function dataTable(container, config) {
    container = resolve(container);
    config = config || {};
    var columns = config.columns || [];
    var allRows = (config.rows || []).slice();
    var options = config.options || {};
    var pageSize = options.pageSize || 10;
    var searchable = options.searchable !== false;
    var paginated = options.paginated !== false;

    var state = { sortKey: options.sortKey || null, sortDir: options.sortDir || "asc", query: "", page: 1 };

    function getVisibleRows() {
      var rows = allRows.slice();
      if (state.query) {
        var q = state.query.toLowerCase();
        rows = rows.filter(function (r) {
          for (var c = 0; c < columns.length; c++) {
            var raw = columns[c].raw ? columns[c].raw(r) : r[columns[c].key];
            if (raw != null && String(raw).toLowerCase().indexOf(q) !== -1) return true;
          }
          return false;
        });
      }
      if (state.sortKey) {
        var col = columns.filter(function (c) { return c.key === state.sortKey; })[0];
        rows.sort(function (a, b) {
          var va = col && col.raw ? col.raw(a) : a[state.sortKey];
          var vb = col && col.raw ? col.raw(b) : b[state.sortKey];
          if (va == null) va = "";
          if (vb == null) vb = "";
          var na = parseFloat(va), nb = parseFloat(vb);
          var cmp;
          if (!isNaN(na) && !isNaN(nb) && String(va).trim() !== "" && String(vb).trim() !== "") cmp = na - nb;
          else cmp = String(va).localeCompare(String(vb), "fr");
          return state.sortDir === "asc" ? cmp : -cmp;
        });
      }
      return rows;
    }

    var wrap = el("div", { class: "nv-table-wrap" });
    var toolbar = null;
    if (searchable || options.toolbarRight) {
      toolbar = el("div", { class: "nv-filters", style: { marginBottom: "0", borderRadius: "0", borderLeft: "0", borderRight: "0", borderTop: "0", boxShadow: "none" } });
      if (searchable) {
        toolbar.appendChild(searchBar(function (v) { state.query = v; state.page = 1; render(); }));
      }
      toolbar.appendChild(el("div", { class: "nv-filters-spacer" }));
      if (options.toolbarRight) appendChildren(toolbar, options.toolbarRight);
      wrap.appendChild(toolbar);
    }

    var scroll = el("div", { class: "nv-table-scroll" });
    var table = el("table", { class: "nv-table" });
    scroll.appendChild(table);
    wrap.appendChild(scroll);

    var pager = paginated ? el("div", { class: "nv-pager" }) : null;
    if (pager) wrap.appendChild(pager);

    container.appendChild(wrap);

    function render() {
      clear(table);
      var visible = getVisibleRows();

      // head
      var thead = el("thead");
      var tr = el("tr");
      columns.forEach(function (col) {
        var sortable = col.sortable !== false && !col.actions;
        var cls = "";
        if (sortable) cls += " is-sortable";
        if (state.sortKey === col.key) cls += state.sortDir === "asc" ? " sort-asc" : " sort-desc";
        var th = el("th", { class: cls.trim() || null }, [
          col.label || col.key || "",
          sortable ? el("span", { class: "nv-sort-ico", text: state.sortKey === col.key ? (state.sortDir === "asc" ? "▲" : "▼") : "↕" }) : null
        ]);
        if (sortable) {
          th.addEventListener("click", function () {
            if (state.sortKey === col.key) state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
            else { state.sortKey = col.key; state.sortDir = "asc"; }
            render();
          });
        }
        tr.appendChild(th);
      });
      thead.appendChild(tr);
      table.appendChild(thead);

      var tbody = el("tbody");

      if (!visible.length) {
        tbody.appendChild(el("tr", null, el("td", { colspan: columns.length },
          el("div", { class: "nv-state", style: { border: "0", padding: "32px 16px" } }, [
            el("div", { class: "nv-state-ico", text: "∅" }),
            el("div", { class: "nv-state-msg", text: options.emptyText || "Aucun résultat." })
          ]))));
        table.appendChild(tbody);
        if (pager) clear(pager);
        return;
      }

      var pageRows = visible;
      var totalPages = 1;
      if (paginated) {
        totalPages = Math.max(1, Math.ceil(visible.length / pageSize));
        if (state.page > totalPages) state.page = totalPages;
        var start = (state.page - 1) * pageSize;
        pageRows = visible.slice(start, start + pageSize);
      }

      pageRows.forEach(function (row) {
        var rtr = el("tr");
        columns.forEach(function (col) {
          var td = el("td", { class: col.cellClass || (col.numeric ? "nv-num" : null) });
          if (col.actions) {
            var box = el("div", { class: "nv-row-actions" });
            col.actions.forEach(function (a) {
              box.appendChild(el("button", {
                class: "nv-btn nv-btn--sm " + (a.variant === "primary" ? "nv-btn--primary" : a.variant === "danger" ? "nv-btn--danger" : "nv-btn--ghost"),
                text: a.label,
                onclick: function () { if (a.onClick) a.onClick(row); }
              }));
            });
            td.appendChild(box);
          } else if (col.render) {
            var out = col.render(row[col.key], row);
            if (out instanceof Node) td.appendChild(out);
            else td.innerHTML = (out == null ? "" : out);
          } else {
            td.textContent = row[col.key] == null ? "—" : String(row[col.key]);
          }
          rtr.appendChild(td);
        });
        if (options.onRowClick) {
          rtr.style.cursor = "pointer";
          rtr.addEventListener("click", function (e) {
            if (e.target.closest && e.target.closest(".nv-row-actions")) return;
            options.onRowClick(row);
          });
        }
        tbody.appendChild(rtr);
      });
      table.appendChild(tbody);

      // pager
      if (pager) {
        clear(pager);
        pager.appendChild(el("span", { text: visible.length + " résultat" + (visible.length > 1 ? "s" : "") +
          (paginated ? " · page " + state.page + "/" + totalPages : "") }));
        var ctrl = el("div", { class: "nv-pager-controls" });
        ctrl.appendChild(el("button", {
          class: "nv-pager-btn", text: "‹ Préc.", disabled: state.page <= 1,
          onclick: function () { if (state.page > 1) { state.page--; render(); } }
        }));
        ctrl.appendChild(el("button", {
          class: "nv-pager-btn", text: "Suiv. ›", disabled: state.page >= totalPages,
          onclick: function () { if (state.page < totalPages) { state.page++; render(); } }
        }));
        pager.appendChild(ctrl);
      }
    }

    render();

    return {
      refresh: function (newRows) { if (newRows) allRows = newRows.slice(); state.page = 1; render(); },
      getRows: function () { return getVisibleRows(); },
      element: wrap
    };
  }

  /* =============================================================== filterBar */
  function filterBar(container, fields, onChange) {
    container = resolve(container);
    fields = fields || [];
    var values = {};
    var bar = el("div", { class: "nv-filters" });

    function emit() { if (onChange) onChange(Object.assign({}, values)); }

    fields.forEach(function (f) {
      if (f.default != null) values[f.key] = f.default;
      var field = el("div", { class: "nv-filter-field" });
      if (f.label) field.appendChild(el("label", { class: "nv-filter-label", text: f.label }));
      var control;
      if (f.type === "search") {
        control = searchBar(function (v) { values[f.key] = v; emit(); });
      } else if (f.options) {
        control = el("select", { class: "nv-select" });
        (f.options || []).forEach(function (o) {
          var val = typeof o === "object" ? o.value : o;
          var lab = typeof o === "object" ? o.label : o;
          control.appendChild(el("option", { value: val, text: lab, selected: f.default === val ? "selected" : null }));
        });
        control.addEventListener("change", function () { values[f.key] = control.value; emit(); });
      } else {
        control = el("input", { class: "nv-input", type: f.type || "text", placeholder: f.placeholder || "" });
        control.addEventListener("input", function () { values[f.key] = control.value; emit(); });
      }
      field.appendChild(control);
      bar.appendChild(field);
    });

    bar.appendChild(el("div", { class: "nv-filters-spacer" }));
    container.appendChild(bar);
    return { element: bar, values: values, set: function (k, v) { values[k] = v; emit(); } };
  }

  /* =============================================================== searchBar */
  function searchBar(onInput, placeholder) {
    var input = el("input", { class: "nv-input", type: "search", placeholder: placeholder || "Rechercher…" });
    var ico = el("span", { class: "nv-search-ico", "aria-hidden": "true", text: "⌕" });
    input.addEventListener("input", function () { if (onInput) onInput(input.value.trim()); });
    var wrap = el("div", { class: "nv-search" }, [ico, input]);
    wrap.input = input;
    return wrap;
  }

  /* ============================================================= statusBadge */
  var BADGE_MAP = {
    // statuts génériques
    active: "success", verified: "verified", completed: "success", resolved: "success",
    converted: "success", final: "success", invited: "info", answered: "success",
    pending: "pending", waiting: "neutral", open: "info", draft: "neutral",
    in_progress: "info", in_review: "review", review: "review", investigating: "warning",
    escalated: "danger", rejected: "rejected", expired: "expired", suspended: "danger",
    closed: "neutral",
    // niveaux de risque / sévérité
    low: "low", medium: "medium", high: "high", critical: "critical"
  };
  function statusBadge(value, kind) {
    var v = value == null ? "" : String(value);
    var variant = kind || BADGE_MAP[v] || BADGE_MAP[v.toLowerCase()] || "neutral";
    var label = v.replace(/_/g, " ");
    return el("span", { class: "nv-badge nv-badge--" + variant, text: label || "—" });
  }

  /* ============================================================ exportButton */
  function exportButton(getRows, filename) {
    return el("button", { class: "nv-btn nv-btn--export", text: "⤓ Exporter CSV", onclick: function () {
      var rows = typeof getRows === "function" ? getRows() : getRows;
      var csv = (global.NovaStore && global.NovaStore.toCSV) ? global.NovaStore.toCSV(rows) : "";
      var blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      var url = URL.createObjectURL(blob);
      var a = el("a", { href: url, download: (filename || "nova-export") + ".csv" });
      doc.body.appendChild(a); a.click();
      setTimeout(function () { doc.body.removeChild(a); URL.revokeObjectURL(url); }, 0);
    }});
  }

  /* =========================================================== riskAlertCard */
  function riskAlertCard(alert) {
    alert = alert || {};
    var sev = alert.severity || "medium";
    var icoMap = { low: "○", medium: "△", high: "▲", critical: "✖" };
    return el("div", { class: "nv-alert is-" + sev }, [
      el("div", { class: "nv-alert-ico", text: icoMap[sev] || "△" }),
      el("div", { class: "nv-alert-body" }, [
        el("div", { class: "nv-alert-head" }, [
          el("span", { class: "nv-alert-title", text: alert.title || "Alerte" }),
          statusBadge(sev, sev),
          alert.status ? statusBadge(alert.status) : null
        ]),
        el("p", { class: "nv-alert-desc", text: alert.description || "" }),
        el("div", { class: "nv-alert-meta" }, [
          alert.id ? el("span", { html: "<b>Réf.</b> " + alert.id }) : null,
          alert.userId ? el("span", { html: "<b>Utilisateur</b> " + alert.userId }) : null,
          alert.type ? el("span", { html: "<b>Type</b> " + alert.type }) : null,
          (alert.amountEUR != null && alert.amountEUR > 0) ? el("span", { html: "<b>Montant</b> " + fmtEUR(alert.amountEUR) }) : null,
          alert.assignedTo ? el("span", { html: "<b>Assigné</b> " + alert.assignedTo }) : null,
          alert.createdAt ? el("span", { html: "<b>Détecté</b> " + fmtDate(alert.createdAt) }) : null
        ])
      ])
    ]);
  }

  /* ========================================================== monitoringChart */
  // series : [{ label, color, data:[{x,y}] | [y,...] }] ou un simple [y,...]
  function monitoringChart(container, series, opts) {
    container = resolve(container);
    opts = opts || {};
    var type = opts.type || "line";

    if (!Array.isArray(series)) series = [];
    if (series.length && typeof series[0] === "number") series = [{ label: "Série", data: series }];

    // normaliser en points {x,y}
    var norm = series.map(function (s, si) {
      var pts = (s.data || []).map(function (d, i) {
        return typeof d === "number" ? { x: i, y: d } : { x: d.x != null ? d.x : i, y: d.y };
      });
      return { label: s.label || ("Série " + (si + 1)), color: s.color || (si === 0 ? "#2FD96E" : "#17171A"), pts: pts };
    });

    var W = opts.width || 640, H = opts.height || 240;
    var pad = { l: 38, r: 14, t: 14, b: 26 };
    var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;

    var maxY = 0, n = 0;
    norm.forEach(function (s) {
      s.pts.forEach(function (p) { if (p.y > maxY) maxY = p.y; });
      if (s.pts.length > n) n = s.pts.length;
    });
    if (maxY <= 0) maxY = 1;
    if (n < 1) n = 1;
    var niceMax = Math.ceil(maxY * 1.1);

    function sx(i) { return pad.l + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw); }
    function sy(v) { return pad.t + ih - (v / niceMax) * ih; }

    var NS = "http://www.w3.org/2000/svg";
    function svgEl(tag, attrs) {
      var e = doc.createElementNS(NS, tag);
      for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k) && attrs[k] != null) e.setAttribute(k, attrs[k]);
      return e;
    }

    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, preserveAspectRatio: "none", role: "img", "aria-label": opts.title || "Graphe monitoring" });

    // gridlines + axe Y (4 lignes)
    var grid = svgEl("g", { class: "nv-chart-grid" });
    for (var g = 0; g <= 4; g++) {
      var yy = pad.t + (g / 4) * ih;
      grid.appendChild(svgEl("line", { x1: pad.l, y1: yy, x2: W - pad.r, y2: yy }));
      var lbl = svgEl("text", { x: pad.l - 6, y: yy + 3, "text-anchor": "end", class: "nv-chart-axis" });
      lbl.textContent = fmtNum(Math.round(niceMax * (1 - g / 4)));
      grid.appendChild(lbl);
    }
    svg.appendChild(grid);

    if (type === "bar") {
      var groups = norm.length;
      var bandW = iw / n;
      var barW = Math.max(2, (bandW * 0.62) / Math.max(1, groups));
      norm.forEach(function (s, si) {
        s.pts.forEach(function (p, i) {
          var x = pad.l + i * bandW + (bandW - barW * groups) / 2 + si * barW;
          var y = sy(p.y);
          var rect = svgEl("rect", {
            x: x, y: y, width: barW, height: Math.max(0, pad.t + ih - y),
            rx: 2, fill: s.color
          });
          svg.appendChild(rect);
        });
      });
    } else {
      norm.forEach(function (s) {
        if (!s.pts.length) return;
        var dLine = "", dArea = "";
        s.pts.forEach(function (p, i) {
          var X = sx(i), Y = sy(p.y);
          dLine += (i === 0 ? "M" : "L") + X.toFixed(1) + " " + Y.toFixed(1) + " ";
        });
        // aire
        dArea = dLine + "L" + sx(s.pts.length - 1).toFixed(1) + " " + (pad.t + ih) + " L" + sx(0).toFixed(1) + " " + (pad.t + ih) + " Z";
        svg.appendChild(svgEl("path", { d: dArea, fill: s.color, "fill-opacity": "0.12" }));
        svg.appendChild(svgEl("path", { d: dLine.trim(), fill: "none", stroke: s.color, "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }));
        // points
        s.pts.forEach(function (p, i) {
          svg.appendChild(svgEl("circle", { cx: sx(i), cy: sy(p.y), r: 2.6, fill: s.color }));
        });
      });
    }

    // axe X (labels)
    if (opts.labels && opts.labels.length) {
      var ax = svgEl("g", null);
      opts.labels.forEach(function (lab, i) {
        if (i >= n) return;
        var t = svgEl("text", { x: sx(i), y: H - 8, "text-anchor": "middle", class: "nv-chart-axis" });
        t.textContent = lab;
        ax.appendChild(t);
      });
      svg.appendChild(ax);
    }

    var card = el("div", { class: "nv-chart" }, [
      el("div", { class: "nv-chart-head" }, [
        el("span", { class: "nv-chart-title", text: opts.title || "Monitoring" }),
        el("div", { class: "nv-chart-legend" }, norm.map(function (s) {
          return el("span", { html: "<i style='background:" + s.color + "'></i>" + s.label });
        }))
      ])
    ]);
    card.appendChild(svg);
    if (container) container.appendChild(card);
    return card;
  }

  /* ============================================================== reportCard */
  function reportCard(report) {
    report = report || {};
    var metricsEl = el("div", { class: "nv-report-meta" });
    if (report.metrics && typeof report.metrics === "object") {
      for (var k in report.metrics) {
        if (!Object.prototype.hasOwnProperty.call(report.metrics, k)) continue;
        var val = report.metrics[k];
        if (typeof val === "boolean") val = val ? "oui" : "non";
        metricsEl.appendChild(el("span", { html: "<b>" + k + "</b> " + val }));
      }
    }
    return el("div", { class: "nv-report" }, [
      el("div", { class: "nv-report-head" }, [
        el("div", null, [
          el("div", { class: "nv-report-title", text: report.title || "Rapport" }),
          el("div", { class: "nv-report-sub", text: (report.type ? report.type.toUpperCase() : "") + (report.period ? " · " + report.period : "") })
        ]),
        report.status ? statusBadge(report.status) : null
      ]),
      metricsEl,
      el("div", { class: "nv-report-foot" }, [
        report.format ? el("span", { class: "nv-muted", text: "Format " + report.format }) : null,
        report.generatedBy ? el("span", { class: "nv-muted", text: "· par " + report.generatedBy }) : null,
        report.createdAt ? el("span", { class: "nv-muted", text: "· " + fmtDate(report.createdAt) }) : null
      ])
    ]);
  }

  /* =========================================================== auditLogTable */
  function auditLogTable(container, rows) {
    return dataTable(container, {
      rows: rows || [],
      columns: [
        { key: "createdAt", label: "Date", render: function (v) { return fmtDate(v); } },
        { key: "actor", label: "Acteur" },
        { key: "action", label: "Action", render: function (v) { return "<code>" + (v || "") + "</code>"; } },
        { key: "entity", label: "Entité" },
        { key: "entityId", label: "Réf." },
        { key: "details", label: "Détails" },
        { key: "ip", label: "IP", cellClass: "nv-mono" }
      ],
      options: { pageSize: 12, emptyText: "Aucun événement journalisé.", sortKey: "createdAt", sortDir: "desc" }
    });
  }

  /* ================================================================= états == */
  function showLoading(container, msg) {
    container = resolve(container); if (!container) return;
    clear(container);
    container.appendChild(el("div", { class: "nv-state nv-loading" }, [
      el("div", { class: "nv-spinner", "aria-hidden": "true" }),
      el("div", { class: "nv-state-title", text: "Chargement…" }),
      el("div", { class: "nv-state-msg", text: msg || "Récupération des données en cours." })
    ]));
  }
  function showEmpty(container, msg) {
    container = resolve(container); if (!container) return;
    clear(container);
    container.appendChild(el("div", { class: "nv-state" }, [
      el("div", { class: "nv-state-ico", text: "∅" }),
      el("div", { class: "nv-state-title", text: "Rien à afficher" }),
      el("div", { class: "nv-state-msg", text: msg || "Aucune donnée disponible pour le moment." })
    ]));
  }
  function showError(container, msg) {
    container = resolve(container); if (!container) return;
    clear(container);
    container.appendChild(el("div", { class: "nv-state nv-error" }, [
      el("div", { class: "nv-state-ico", text: "⚠" }),
      el("div", { class: "nv-state-title", text: "Une erreur est survenue" }),
      el("div", { class: "nv-state-msg", text: msg || "Impossible de charger les données. Réessayez." })
    ]));
  }

  /* ===================================================== EXPOSITION GLOBALE */
  global.NovaUI = {
    // helpers
    el: el,
    clear: clear,
    NAV: NAV,
    SHORTCUTS: SHORTCUTS,
    fmtEUR: fmtEUR,
    fmtNum: fmtNum,
    fmtDate: fmtDate,
    // layouts
    mountLayout: mountLayout,
    DashboardLayout: DashboardLayout,
    AppDashboardLayout: AppDashboardLayout,
    // composants
    statsCard: statsCard,
    navCard: navCard,
    dataTable: dataTable,
    filterBar: filterBar,
    searchBar: searchBar,
    statusBadge: statusBadge,
    exportButton: exportButton,
    riskAlertCard: riskAlertCard,
    monitoringChart: monitoringChart,
    reportCard: reportCard,
    auditLogTable: auditLogTable,
    // états
    showLoading: showLoading,
    showEmpty: showEmpty,
    showError: showError
  };

})(typeof window !== "undefined" ? window : this, document);
