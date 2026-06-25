/* ============================================================================
   NOVA — store.js  ·  window.NovaStore
   ----------------------------------------------------------------------------
   Couche de données du backoffice/app interne Nova (PROJET en développement).
   Script CLASSIQUE (pas de module ES) : fonctionne en file://.

   Modèle : mock en mémoire, persisté en localStorage (clé 'nova-backoffice-v1'),
   pattern repository — remplaçable plus tard par une vraie API/DB. Les noms de
   champs sont alignés sur le modèle TypeScript canonique (/types, /data).

   À l'init :
     1. si window.NovaData est présent, ses jeux de référence sont FUSIONNÉS
        dans le seed (par entité, déduplication par id) ;
     2. si localStorage contient des données, on bootstrap depuis là ;
        sinon on sème (seed) chaque entité avec des enregistrements mock.

   ENTITÉS :
     users, waitlist, contact, complaints, dataRights, cookieConsents, kyc,
     riskAlerts, monitoringEvents, anomalies, auditLogs, reports

   API GÉNÉRIQUE (repository) :
     NovaStore.list(entity, criteria?)   -> Array (criteria = objet d'égalité partielle)
     NovaStore.get(entity, id)           -> objet | null
     NovaStore.create(entity, obj)       -> objet créé (id auto si absent)
     NovaStore.update(entity, id, patch) -> objet mis à jour | null
     NovaStore.remove(entity, id)        -> bool
     NovaStore.filter(entity, predicate) -> Array (predicate = fonction)
     NovaStore.toCSV(entityOrRows)       -> string CSV
     NovaStore.reset()                   -> ré-amorce le store (efface localStorage)

   FONCTIONS NOMMÉES (chacune passe par create/update ET écrit un auditLog) :
     createUser(data)
     createWaitlistEntry(data)
     createContactMessage(data)
     createComplaint(data)
     createDataRightsRequest(data)
     saveCookieConsent(data)
     createKycSession(data)
     updateKycStatus(id, status, opts?)
     createRiskAlert(data)
     createMonitoringEvent(data)
     createAuditLog(data)
     generateReport(type, opts?)

   HELPERS UTILES :
     NovaStore.entities()      -> liste des noms d'entités
     NovaStore.count(entity)   -> nombre d'enregistrements
     NovaStore.save()          -> force la persistance localStorage
     NovaStore.export()        -> objet brut { entity: rows[] }
   ========================================================================== */
(function (global) {
  "use strict";

  var STORAGE_KEY = "nova-backoffice-v1";

  var ENTITIES = [
    "users", "waitlist", "contact", "complaints", "dataRights",
    "cookieConsents", "kyc", "riskAlerts", "monitoringEvents",
    "anomalies", "auditLogs", "reports"
  ];

  /* ---- état en mémoire ---- */
  var db = null;          // { entity: [rows] }
  var counters = {};      // compteurs d'id par préfixe

  /* ------------------------------------------------------------------ utils */
  function iso(y, mo, d, h, mi) {
    return new Date(Date.UTC(y, (mo || 1) - 1, d || 1, h || 0, mi || 0, 0)).toISOString();
  }
  function nowISO() { return new Date().toISOString(); }

  function pad(n, len) {
    n = String(n);
    while (n.length < (len || 4)) n = "0" + n;
    return n;
  }
  function nextId(prefix) {
    counters[prefix] = (counters[prefix] || 0) + 1;
    return prefix + "-" + pad(counters[prefix], 4);
  }
  // synchronise les compteurs sur les ids existants (ex: "USR-0012" -> 12)
  function syncCounter(prefix, rows) {
    var max = counters[prefix] || 0;
    for (var i = 0; i < rows.length; i++) {
      var id = String(rows[i].id || "");
      if (id.indexOf(prefix + "-") === 0) {
        var num = parseInt(id.slice(prefix.length + 1), 10);
        if (!isNaN(num) && num > max) max = num;
      }
    }
    counters[prefix] = max;
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function deepMergeRows(base, extra) {
    // fusionne extra dans base par id (extra prioritaire), conserve l'ordre
    var byId = {}, out = [], i;
    for (i = 0; i < base.length; i++) { out.push(base[i]); byId[base[i].id] = out.length - 1; }
    for (i = 0; i < extra.length; i++) {
      var r = extra[i];
      if (r && r.id != null && byId[r.id] != null) {
        out[byId[r.id]] = r;
      } else {
        out.push(r);
        if (r && r.id != null) byId[r.id] = out.length - 1;
      }
    }
    return out;
  }

  /* préfixe d'id par entité */
  var PREFIX = {
    users: "USR", waitlist: "WL", contact: "MSG", complaints: "CMP",
    dataRights: "DSR", cookieConsents: "CNS", kyc: "KYC", riskAlerts: "RSK",
    monitoringEvents: "MON", anomalies: "ANO", auditLogs: "LOG", reports: "REP"
  };

  /* ============================================================ SEED DATA == */
  function seedUsers() {
    return [
      { id: "USR-0001", firstName: "Camille", lastName: "Lefèvre", email: "camille.lefevre@example.fr", country: "FR", segment: "salarie", status: "active", kycStatus: "verified", balanceEUR: 4280.55, savingsEUR: 12480, plan: "premium", createdAt: iso(2026,1,8,9,12), lastLoginAt: iso(2026,6,15,7,41), riskLevel: "low" },
      { id: "USR-0002", firstName: "Lucas", lastName: "Moreau", email: "lucas.moreau@example.fr", country: "FR", segment: "freelance", status: "active", kycStatus: "verified", balanceEUR: 1890.10, savingsEUR: 3000, plan: "standard", createdAt: iso(2026,1,14,11,3), lastLoginAt: iso(2026,6,14,18,9), riskLevel: "low" },
      { id: "USR-0003", firstName: "Inès", lastName: "Garnier", email: "ines.garnier@example.fr", country: "FR", segment: "etudiant", status: "pending", kycStatus: "pending", balanceEUR: 0, savingsEUR: 0, plan: "standard", createdAt: iso(2026,2,2,16,40), lastLoginAt: null, riskLevel: "low" },
      { id: "USR-0004", firstName: "Tomás", lastName: "Almeida", email: "tomas.almeida@example.pt", country: "PT", segment: "entrepreneur", status: "active", kycStatus: "review", balanceEUR: 15230.00, savingsEUR: 40000, plan: "premium", createdAt: iso(2026,2,9,8,15), lastLoginAt: iso(2026,6,16,6,2), riskLevel: "medium" },
      { id: "USR-0005", firstName: "Sofia", lastName: "Rossi", email: "sofia.rossi@example.it", country: "IT", segment: "salarie", status: "active", kycStatus: "verified", balanceEUR: 920.40, savingsEUR: 1500, plan: "standard", createdAt: iso(2026,2,21,13,25), lastLoginAt: iso(2026,6,13,21,12), riskLevel: "low" },
      { id: "USR-0006", firstName: "Mehdi", lastName: "Benali", email: "mehdi.benali@example.fr", country: "FR", segment: "freelance", status: "suspended", kycStatus: "review", balanceEUR: 230.00, savingsEUR: 0, plan: "standard", createdAt: iso(2026,3,1,10,0), lastLoginAt: iso(2026,5,28,9,30), riskLevel: "high" },
      { id: "USR-0007", firstName: "Anna", lastName: "Kowalski", email: "anna.kowalski@example.pl", country: "PL", segment: "etudiant", status: "active", kycStatus: "verified", balanceEUR: 410.25, savingsEUR: 800, plan: "standard", createdAt: iso(2026,3,7,15,50), lastLoginAt: iso(2026,6,12,12,4), riskLevel: "low" },
      { id: "USR-0008", firstName: "Hugo", lastName: "Petit", email: "hugo.petit@example.fr", country: "FR", segment: "salarie", status: "active", kycStatus: "verified", balanceEUR: 6700.00, savingsEUR: 22000, plan: "premium", createdAt: iso(2026,3,18,9,9), lastLoginAt: iso(2026,6,16,5,55), riskLevel: "low" },
      { id: "USR-0009", firstName: "Laura", lastName: "Schmidt", email: "laura.schmidt@example.de", country: "DE", segment: "entrepreneur", status: "active", kycStatus: "verified", balanceEUR: 28400.00, savingsEUR: 60000, plan: "premium", createdAt: iso(2026,3,29,17,30), lastLoginAt: iso(2026,6,15,22,18), riskLevel: "medium" },
      { id: "USR-0010", firstName: "Yanis", lastName: "Cherif", email: "yanis.cherif@example.fr", country: "FR", segment: "freelance", status: "pending", kycStatus: "rejected", balanceEUR: 0, savingsEUR: 0, plan: "standard", createdAt: iso(2026,4,3,11,20), lastLoginAt: null, riskLevel: "high" },
      { id: "USR-0011", firstName: "Chloé", lastName: "Dubois", email: "chloe.dubois@example.fr", country: "FR", segment: "salarie", status: "active", kycStatus: "verified", balanceEUR: 3120.80, savingsEUR: 9000, plan: "standard", createdAt: iso(2026,4,11,8,45), lastLoginAt: iso(2026,6,14,7,11), riskLevel: "low" },
      { id: "USR-0012", firstName: "Diego", lastName: "Fernández", email: "diego.fernandez@example.es", country: "ES", segment: "entrepreneur", status: "active", kycStatus: "review", balanceEUR: 9870.00, savingsEUR: 31000, plan: "premium", createdAt: iso(2026,4,22,14,2), lastLoginAt: iso(2026,6,16,8,30), riskLevel: "medium" },
      { id: "USR-0013", firstName: "Emma", lastName: "Laurent", email: "emma.laurent@example.fr", country: "FR", segment: "etudiant", status: "active", kycStatus: "verified", balanceEUR: 150.00, savingsEUR: 300, plan: "standard", createdAt: iso(2026,5,2,19,15), lastLoginAt: iso(2026,6,11,16,40), riskLevel: "low" },
      { id: "USR-0014", firstName: "Nora", lastName: "Haddad", email: "nora.haddad@example.fr", country: "FR", segment: "freelance", status: "active", kycStatus: "verified", balanceEUR: 5400.00, savingsEUR: 14000, plan: "premium", createdAt: iso(2026,5,12,10,33), lastLoginAt: iso(2026,6,15,20,5), riskLevel: "low" },
      { id: "USR-0015", firstName: "Viktor", lastName: "Novak", email: "viktor.novak@example.lt", country: "LT", segment: "entrepreneur", status: "active", kycStatus: "verified", balanceEUR: 41200.00, savingsEUR: 80000, plan: "premium", createdAt: iso(2026,5,20,12,12), lastLoginAt: iso(2026,6,16,9,1), riskLevel: "medium" }
    ];
  }

  function seedWaitlist() {
    return [
      { id: "WL-0001", email: "nathalie.roche@example.fr", country: "FR", segment: "salarie", source: "landing", referral: "instagram", position: 1, status: "invited", createdAt: iso(2026,1,3,10,2) },
      { id: "WL-0002", email: "paul.girard@example.fr", country: "FR", segment: "freelance", source: "landing", referral: "ami", position: 2, status: "invited", createdAt: iso(2026,1,5,14,30) },
      { id: "WL-0003", email: "marie.fontaine@example.fr", country: "FR", segment: "etudiant", source: "landing", referral: "tiktok", position: 3, status: "waiting", createdAt: iso(2026,1,9,9,15) },
      { id: "WL-0004", email: "antoine.bernard@example.fr", country: "FR", segment: "entrepreneur", source: "referral", referral: "WL-0001", position: 4, status: "waiting", createdAt: iso(2026,1,12,18,40) },
      { id: "WL-0005", email: "julia.santos@example.pt", country: "PT", segment: "salarie", source: "landing", referral: "google", position: 5, status: "waiting", createdAt: iso(2026,1,15,11,5) },
      { id: "WL-0006", email: "marco.bianchi@example.it", country: "IT", segment: "freelance", source: "landing", referral: "linkedin", position: 6, status: "waiting", createdAt: iso(2026,1,20,16,22) },
      { id: "WL-0007", email: "sophie.muller@example.de", country: "DE", segment: "salarie", source: "landing", referral: "presse", position: 7, status: "converted", createdAt: iso(2026,1,24,8,50) },
      { id: "WL-0008", email: "karim.toubib@example.fr", country: "FR", segment: "freelance", source: "referral", referral: "WL-0002", position: 8, status: "waiting", createdAt: iso(2026,2,1,13,33) },
      { id: "WL-0009", email: "elena.popescu@example.ro", country: "RO", segment: "etudiant", source: "landing", referral: "tiktok", position: 9, status: "waiting", createdAt: iso(2026,2,6,19,10) },
      { id: "WL-0010", email: "thomas.leroy@example.fr", country: "FR", segment: "salarie", source: "landing", referral: "instagram", position: 10, status: "waiting", createdAt: iso(2026,2,11,7,45) },
      { id: "WL-0011", email: "agnes.lambert@example.fr", country: "FR", segment: "entrepreneur", source: "landing", referral: "google", position: 11, status: "waiting", createdAt: iso(2026,2,17,15,0) },
      { id: "WL-0012", email: "david.cohen@example.fr", country: "FR", segment: "salarie", source: "referral", referral: "WL-0007", position: 12, status: "waiting", createdAt: iso(2026,2,23,10,28) },
      { id: "WL-0013", email: "lina.haddou@example.fr", country: "FR", segment: "etudiant", source: "landing", referral: "tiktok", position: 13, status: "waiting", createdAt: iso(2026,3,2,12,12) },
      { id: "WL-0014", email: "robert.kelly@example.ie", country: "IE", segment: "freelance", source: "landing", referral: "linkedin", position: 14, status: "waiting", createdAt: iso(2026,3,9,9,40) },
      { id: "WL-0015", email: "valentina.ruiz@example.es", country: "ES", segment: "salarie", source: "landing", referral: "instagram", position: 15, status: "waiting", createdAt: iso(2026,3,15,17,55) },
      { id: "WL-0016", email: "florian.weber@example.de", country: "DE", segment: "entrepreneur", source: "landing", referral: "presse", position: 16, status: "waiting", createdAt: iso(2026,3,22,8,5) },
      { id: "WL-0017", email: "amelie.roussel@example.fr", country: "FR", segment: "salarie", source: "landing", referral: "google", position: 17, status: "waiting", createdAt: iso(2026,4,1,14,18) },
      { id: "WL-0018", email: "jonas.berg@example.lt", country: "LT", segment: "entrepreneur", source: "landing", referral: "linkedin", position: 18, status: "waiting", createdAt: iso(2026,4,8,11,33) }
    ];
  }

  function seedContact() {
    return [
      { id: "MSG-0001", name: "Patrick Vidal", email: "patrick.vidal@example.fr", subject: "Question sur l'épargne 7 %", topic: "epargne", message: "Bonjour, comment fonctionne l'objectif de 7 % ? Est-ce garanti ?", status: "answered", assignedTo: "support.fr", createdAt: iso(2026,5,3,9,20), answeredAt: iso(2026,5,3,11,4) },
      { id: "MSG-0002", name: "Sandrine Picard", email: "sandrine.picard@example.fr", subject: "Carte physique", topic: "carte", message: "Quand la carte métal sera-t-elle disponible ?", status: "open", assignedTo: null, createdAt: iso(2026,5,8,14,55), answeredAt: null },
      { id: "MSG-0003", name: "Olivier Marchand", email: "olivier.marchand@example.fr", subject: "Disponibilité du compte", topic: "compte", message: "Le projet est-il déjà agréé par la Banque de Lituanie ?", status: "answered", assignedTo: "support.fr", createdAt: iso(2026,5,12,10,10), answeredAt: iso(2026,5,12,15,30) },
      { id: "MSG-0004", name: "Céline Roy", email: "celine.roy@example.fr", subject: "Virement SEPA", topic: "paiements", message: "Les virements SEPA seront-ils gratuits ?", status: "open", assignedTo: "support.fr", createdAt: iso(2026,5,18,8,40), answeredAt: null },
      { id: "MSG-0005", name: "Bruno Faure", email: "bruno.faure@example.fr", subject: "Partenariat presse", topic: "presse", message: "Je suis journaliste, j'aimerais en savoir plus sur Nova.", status: "answered", assignedTo: "comms", createdAt: iso(2026,5,22,16,2), answeredAt: iso(2026,5,23,9,11) },
      { id: "MSG-0006", name: "Aurélie Gauthier", email: "aurelie.gauthier@example.fr", subject: "Sécurité des données", topic: "rgpd", message: "Où sont stockées mes données personnelles ?", status: "open", assignedTo: null, createdAt: iso(2026,5,29,11,25), answeredAt: null },
      { id: "MSG-0007", name: "Maxime Renard", email: "maxime.renard@example.fr", subject: "Cashback", topic: "carte", message: "Le cashback 2 % concerne quelles dépenses ?", status: "answered", assignedTo: "support.fr", createdAt: iso(2026,6,2,13,48), answeredAt: iso(2026,6,2,18,5) },
      { id: "MSG-0008", name: "Léa Mercier", email: "lea.mercier@example.fr", subject: "Étudiant", topic: "compte", message: "Y a-t-il une offre dédiée aux étudiants ?", status: "open", assignedTo: "support.fr", createdAt: iso(2026,6,7,9,0), answeredAt: null },
      { id: "MSG-0009", name: "Frédéric Lopez", email: "frederic.lopez@example.fr", subject: "Investisseur", topic: "investisseur", message: "Comment investir dans le projet Nova ?", status: "open", assignedTo: "comms", createdAt: iso(2026,6,10,15,33), answeredAt: null },
      { id: "MSG-0010", name: "Nadia Brun", email: "nadia.brun@example.fr", subject: "P2P entre utilisateurs", topic: "paiements", message: "Pourra-t-on s'envoyer de l'argent entre utilisateurs Nova ?", status: "answered", assignedTo: "support.fr", createdAt: iso(2026,6,13,10,12), answeredAt: iso(2026,6,13,14,20) }
    ];
  }

  function seedComplaints() {
    return [
      { id: "CMP-0001", userId: "USR-0006", channel: "email", category: "kyc", subject: "Compte suspendu sans explication", description: "Mon compte a été suspendu, je veux comprendre pourquoi.", priority: "high", status: "open", assignedTo: "compliance", slaDueAt: iso(2026,6,20,0,0), createdAt: iso(2026,6,1,9,30), resolvedAt: null },
      { id: "CMP-0002", userId: "USR-0002", channel: "app", category: "paiement", subject: "Virement non reçu", description: "Un virement SEPA n'est pas arrivé.", priority: "medium", status: "in_progress", assignedTo: "support.fr", slaDueAt: iso(2026,6,18,0,0), createdAt: iso(2026,6,4,11,15), resolvedAt: null },
      { id: "CMP-0003", userId: "USR-0011", channel: "email", category: "carte", subject: "Carte refusée à l'étranger", description: "Paiement refusé en voyage.", priority: "low", status: "resolved", assignedTo: "support.fr", slaDueAt: iso(2026,6,12,0,0), createdAt: iso(2026,6,2,14,0), resolvedAt: iso(2026,6,5,10,2) },
      { id: "CMP-0004", userId: "USR-0004", channel: "phone", category: "epargne", subject: "Doute sur le 7 %", description: "Le client pense que le 7 % était garanti.", priority: "high", status: "in_progress", assignedTo: "compliance", slaDueAt: iso(2026,6,19,0,0), createdAt: iso(2026,6,6,16,40), resolvedAt: null },
      { id: "CMP-0005", userId: "USR-0009", channel: "app", category: "rgpd", subject: "Demande de suppression refusée", description: "Souhaite la suppression de ses données.", priority: "medium", status: "open", assignedTo: "dpo", slaDueAt: iso(2026,6,21,0,0), createdAt: iso(2026,6,9,8,55), resolvedAt: null },
      { id: "CMP-0006", userId: "USR-0010", channel: "email", category: "kyc", subject: "KYC rejeté", description: "Documents refusés, demande de réexamen.", priority: "medium", status: "in_progress", assignedTo: "compliance", slaDueAt: iso(2026,6,22,0,0), createdAt: iso(2026,6,10,10,5), resolvedAt: null },
      { id: "CMP-0007", userId: "USR-0005", channel: "app", category: "appli", subject: "Bug solde affiché", description: "Le solde n'est pas à jour dans l'app.", priority: "low", status: "resolved", assignedTo: "support.fr", slaDueAt: iso(2026,6,14,0,0), createdAt: iso(2026,6,8,12,30), resolvedAt: iso(2026,6,11,9,0) },
      { id: "CMP-0008", userId: "USR-0014", channel: "email", category: "carte", subject: "Délai carte physique", description: "La carte n'est pas encore arrivée.", priority: "low", status: "open", assignedTo: null, slaDueAt: iso(2026,6,24,0,0), createdAt: iso(2026,6,12,15,12), resolvedAt: null },
      { id: "CMP-0009", userId: "USR-0001", channel: "app", category: "paiement", subject: "Double prélèvement", description: "Une dépense apparaît deux fois.", priority: "high", status: "in_progress", assignedTo: "support.fr", slaDueAt: iso(2026,6,17,0,0), createdAt: iso(2026,6,13,9,45), resolvedAt: null },
      { id: "CMP-0010", userId: "USR-0012", channel: "phone", category: "epargne", subject: "Information manquante risque", description: "Estime ne pas avoir été averti du risque.", priority: "medium", status: "open", assignedTo: "compliance", slaDueAt: iso(2026,6,23,0,0), createdAt: iso(2026,6,15,11,0), resolvedAt: null }
    ];
  }

  function seedDataRights() {
    return [
      { id: "DSR-0001", userId: "USR-0001", type: "access", basis: "RGPD art.15", status: "completed", requestedAt: iso(2026,5,4,9,0), dueAt: iso(2026,6,3,0,0), completedAt: iso(2026,5,20,14,0), handledBy: "dpo" },
      { id: "DSR-0002", userId: "USR-0009", type: "erasure", basis: "RGPD art.17", status: "in_review", requestedAt: iso(2026,6,9,8,55), dueAt: iso(2026,7,9,0,0), completedAt: null, handledBy: "dpo" },
      { id: "DSR-0003", userId: "USR-0004", type: "portability", basis: "RGPD art.20", status: "open", requestedAt: iso(2026,6,11,10,20), dueAt: iso(2026,7,11,0,0), completedAt: null, handledBy: null },
      { id: "DSR-0004", userId: "USR-0008", type: "rectification", basis: "RGPD art.16", status: "completed", requestedAt: iso(2026,5,28,16,0), dueAt: iso(2026,6,27,0,0), completedAt: iso(2026,6,4,11,0), handledBy: "dpo" },
      { id: "DSR-0005", userId: "USR-0010", type: "access", basis: "RGPD art.15", status: "open", requestedAt: iso(2026,6,13,12,0), dueAt: iso(2026,7,13,0,0), completedAt: null, handledBy: null },
      { id: "DSR-0006", userId: "USR-0006", type: "objection", basis: "RGPD art.21", status: "in_review", requestedAt: iso(2026,6,5,9,30), dueAt: iso(2026,7,5,0,0), completedAt: null, handledBy: "dpo" },
      { id: "DSR-0007", userId: "USR-0014", type: "restriction", basis: "RGPD art.18", status: "open", requestedAt: iso(2026,6,14,15,10), dueAt: iso(2026,7,14,0,0), completedAt: null, handledBy: null },
      { id: "DSR-0008", userId: "USR-0002", type: "access", basis: "RGPD art.15", status: "completed", requestedAt: iso(2026,4,18,10,0), dueAt: iso(2026,5,18,0,0), completedAt: iso(2026,5,2,13,0), handledBy: "dpo" },
      { id: "DSR-0009", userId: "USR-0012", type: "erasure", basis: "RGPD art.17", status: "open", requestedAt: iso(2026,6,15,9,0), dueAt: iso(2026,7,15,0,0), completedAt: null, handledBy: null }
    ];
  }

  function seedCookieConsents() {
    return [
      { id: "CNS-0001", anonId: "anon-9f2a", necessary: true, analytics: true, marketing: false, region: "FR", policyVersion: "v1.2", createdAt: iso(2026,6,1,8,0), userAgent: "Chrome/Mac" },
      { id: "CNS-0002", anonId: "anon-3c7b", necessary: true, analytics: false, marketing: false, region: "FR", policyVersion: "v1.2", createdAt: iso(2026,6,2,9,30), userAgent: "Safari/iOS" },
      { id: "CNS-0003", anonId: "anon-7d11", necessary: true, analytics: true, marketing: true, region: "DE", policyVersion: "v1.2", createdAt: iso(2026,6,3,11,15), userAgent: "Firefox/Win" },
      { id: "CNS-0004", anonId: "anon-aa42", necessary: true, analytics: true, marketing: false, region: "IT", policyVersion: "v1.2", createdAt: iso(2026,6,4,14,0), userAgent: "Chrome/Android" },
      { id: "CNS-0005", anonId: "anon-1b88", necessary: true, analytics: false, marketing: false, region: "FR", policyVersion: "v1.1", createdAt: iso(2026,6,5,16,40), userAgent: "Edge/Win" },
      { id: "CNS-0006", anonId: "anon-5e09", necessary: true, analytics: true, marketing: true, region: "ES", policyVersion: "v1.2", createdAt: iso(2026,6,7,10,5), userAgent: "Chrome/Mac" },
      { id: "CNS-0007", anonId: "anon-cc31", necessary: true, analytics: true, marketing: false, region: "FR", policyVersion: "v1.2", createdAt: iso(2026,6,9,8,22), userAgent: "Safari/Mac" },
      { id: "CNS-0008", anonId: "anon-ff67", necessary: true, analytics: false, marketing: false, region: "PT", policyVersion: "v1.2", createdAt: iso(2026,6,11,12,55), userAgent: "Chrome/Win" },
      { id: "CNS-0009", anonId: "anon-2d4e", necessary: true, analytics: true, marketing: false, region: "LT", policyVersion: "v1.2", createdAt: iso(2026,6,13,9,40), userAgent: "Firefox/Mac" },
      { id: "CNS-0010", anonId: "anon-8a90", necessary: true, analytics: true, marketing: true, region: "FR", policyVersion: "v1.2", createdAt: iso(2026,6,15,17,12), userAgent: "Chrome/Android" }
    ];
  }

  function seedKyc() {
    return [
      { id: "KYC-0001", userId: "USR-0001", type: "KYC", level: "standard", provider: "Veriff", status: "verified", riskScore: 12, pep: false, sanctions: false, documents: ["passport","selfie"], country: "FR", createdAt: iso(2026,1,8,9,30), reviewedAt: iso(2026,1,8,10,5), reviewer: "kyc.team" },
      { id: "KYC-0002", userId: "USR-0002", type: "KYC", level: "standard", provider: "Veriff", status: "verified", riskScore: 18, pep: false, sanctions: false, documents: ["id_card","selfie"], country: "FR", createdAt: iso(2026,1,14,11,20), reviewedAt: iso(2026,1,14,12,0), reviewer: "kyc.team" },
      { id: "KYC-0003", userId: "USR-0003", type: "KYC", level: "standard", provider: "Onfido", status: "pending", riskScore: null, pep: false, sanctions: false, documents: ["id_card"], country: "FR", createdAt: iso(2026,2,2,16,45), reviewedAt: null, reviewer: null },
      { id: "KYC-0004", userId: "USR-0004", type: "KYB", level: "enhanced", provider: "Onfido", status: "review", riskScore: 54, pep: true, sanctions: false, documents: ["company_reg","ubo","selfie"], country: "PT", createdAt: iso(2026,2,9,8,30), reviewedAt: null, reviewer: "compliance" },
      { id: "KYC-0005", userId: "USR-0005", type: "KYC", level: "standard", provider: "Veriff", status: "verified", riskScore: 21, pep: false, sanctions: false, documents: ["id_card","selfie"], country: "IT", createdAt: iso(2026,2,21,13,40), reviewedAt: iso(2026,2,21,14,10), reviewer: "kyc.team" },
      { id: "KYC-0006", userId: "USR-0006", type: "KYC", level: "enhanced", provider: "Onfido", status: "review", riskScore: 78, pep: false, sanctions: false, documents: ["passport","proof_address"], country: "FR", createdAt: iso(2026,3,1,10,15), reviewedAt: null, reviewer: "compliance" },
      { id: "KYC-0007", userId: "USR-0007", type: "KYC", level: "standard", provider: "Veriff", status: "verified", riskScore: 9, pep: false, sanctions: false, documents: ["id_card","selfie"], country: "PL", createdAt: iso(2026,3,7,16,0), reviewedAt: iso(2026,3,7,16,40), reviewer: "kyc.team" },
      { id: "KYC-0008", userId: "USR-0008", type: "KYC", level: "standard", provider: "Veriff", status: "verified", riskScore: 14, pep: false, sanctions: false, documents: ["passport","selfie"], country: "FR", createdAt: iso(2026,3,18,9,20), reviewedAt: iso(2026,3,18,10,0), reviewer: "kyc.team" },
      { id: "KYC-0009", userId: "USR-0009", type: "KYB", level: "enhanced", provider: "Onfido", status: "verified", riskScore: 41, pep: false, sanctions: false, documents: ["company_reg","ubo","id_card"], country: "DE", createdAt: iso(2026,3,29,17,45), reviewedAt: iso(2026,3,30,11,0), reviewer: "compliance" },
      { id: "KYC-0010", userId: "USR-0010", type: "KYC", level: "standard", provider: "Onfido", status: "rejected", riskScore: 88, pep: false, sanctions: true, documents: ["id_card"], country: "FR", createdAt: iso(2026,4,3,11,30), reviewedAt: iso(2026,4,3,15,0), reviewer: "compliance" },
      { id: "KYC-0011", userId: "USR-0011", type: "KYC", level: "standard", provider: "Veriff", status: "verified", riskScore: 16, pep: false, sanctions: false, documents: ["id_card","selfie"], country: "FR", createdAt: iso(2026,4,11,9,0), reviewedAt: iso(2026,4,11,9,40), reviewer: "kyc.team" },
      { id: "KYC-0012", userId: "USR-0012", type: "KYB", level: "enhanced", provider: "Onfido", status: "review", riskScore: 49, pep: true, sanctions: false, documents: ["company_reg","ubo"], country: "ES", createdAt: iso(2026,4,22,14,15), reviewedAt: null, reviewer: "compliance" },
      { id: "KYC-0013", userId: "USR-0013", type: "KYC", level: "standard", provider: "Veriff", status: "verified", riskScore: 11, pep: false, sanctions: false, documents: ["id_card","selfie"], country: "FR", createdAt: iso(2026,5,2,19,30), reviewedAt: iso(2026,5,2,20,0), reviewer: "kyc.team" },
      { id: "KYC-0014", userId: "USR-0014", type: "KYC", level: "standard", provider: "Veriff", status: "verified", riskScore: 19, pep: false, sanctions: false, documents: ["passport","selfie"], country: "FR", createdAt: iso(2026,5,12,10,45), reviewedAt: iso(2026,5,12,11,20), reviewer: "kyc.team" },
      { id: "KYC-0015", userId: "USR-0015", type: "KYB", level: "enhanced", provider: "Onfido", status: "verified", riskScore: 37, pep: false, sanctions: false, documents: ["company_reg","ubo","id_card"], country: "LT", createdAt: iso(2026,5,20,12,30), reviewedAt: iso(2026,5,21,9,0), reviewer: "compliance" }
    ];
  }

  function seedRiskAlerts() {
    return [
      { id: "RSK-0001", userId: "USR-0006", type: "velocity", severity: "high", title: "Vitesse de transactions inhabituelle", description: "12 paiements en 4 minutes depuis l'app.", amountEUR: 2400, status: "open", assignedTo: "mlro", createdAt: iso(2026,6,10,9,12) },
      { id: "RSK-0002", userId: "USR-0010", type: "sanctions", severity: "critical", title: "Correspondance liste de sanctions", description: "Nom correspondant à une liste OFAC/UE à vérifier.", amountEUR: 0, status: "escalated", assignedTo: "mlro", createdAt: iso(2026,6,12,8,5) },
      { id: "RSK-0003", userId: "USR-0004", type: "pep", severity: "medium", title: "Profil PEP détecté", description: "Personne politiquement exposée — vigilance renforcée.", amountEUR: 0, status: "in_review", assignedTo: "compliance", createdAt: iso(2026,6,9,11,40) },
      { id: "RSK-0004", userId: "USR-0009", type: "large_transfer", severity: "medium", title: "Virement entrant élevé", description: "Virement SEPA entrant de 28 000 € à justifier.", amountEUR: 28000, status: "in_review", assignedTo: "compliance", createdAt: iso(2026,6,11,14,30) },
      { id: "RSK-0005", userId: "USR-0012", type: "geo", severity: "medium", title: "Connexion depuis pays inhabituel", description: "Connexion depuis une IP hors UE.", amountEUR: 0, status: "open", assignedTo: "mlro", createdAt: iso(2026,6,13,7,20) },
      { id: "RSK-0006", userId: "USR-0001", type: "device", severity: "low", title: "Nouvel appareil", description: "Connexion depuis un nouvel appareil non reconnu.", amountEUR: 0, status: "closed", assignedTo: "mlro", createdAt: iso(2026,6,8,18,50) },
      { id: "RSK-0007", userId: "USR-0015", type: "structuring", severity: "high", title: "Possible fractionnement", description: "Plusieurs dépôts juste sous le seuil de déclaration.", amountEUR: 9500, status: "in_review", assignedTo: "mlro", createdAt: iso(2026,6,14,10,5) },
      { id: "RSK-0008", userId: "USR-0002", type: "chargeback", severity: "low", title: "Litige de paiement", description: "Demande de remboursement marchand.", amountEUR: 120, status: "closed", assignedTo: "support.fr", createdAt: iso(2026,6,5,12,0) },
      { id: "RSK-0009", userId: "USR-0014", type: "velocity", severity: "low", title: "Pic de paiements", description: "Activité plus élevée que d'habitude, probablement légitime.", amountEUR: 600, status: "closed", assignedTo: "mlro", createdAt: iso(2026,6,6,16,15) },
      { id: "RSK-0010", userId: "USR-0006", type: "p2p", severity: "high", title: "P2P vers compte signalé", description: "Virement P2P vers un utilisateur déjà sous surveillance.", amountEUR: 800, status: "escalated", assignedTo: "mlro", createdAt: iso(2026,6,15,9,55) }
    ];
  }

  function seedMonitoringEvents() {
    return [
      { id: "MON-0001", userId: "USR-0001", category: "transaction", action: "sepa_out", amountEUR: 320.00, channel: "app", country: "FR", ip: "82.64.10.3", flagged: false, score: 8, createdAt: iso(2026,6,15,8,12) },
      { id: "MON-0002", userId: "USR-0006", category: "transaction", action: "card_payment", amountEUR: 199.99, channel: "card", country: "FR", ip: "176.10.99.4", flagged: true, score: 71, createdAt: iso(2026,6,15,9,1) },
      { id: "MON-0003", userId: "USR-0009", category: "transaction", action: "sepa_in", amountEUR: 28000.00, channel: "sepa", country: "DE", ip: "91.66.2.8", flagged: true, score: 64, createdAt: iso(2026,6,11,14,29) },
      { id: "MON-0004", userId: "USR-0004", category: "login", action: "login", amountEUR: 0, channel: "app", country: "PT", ip: "188.37.5.2", flagged: false, score: 22, createdAt: iso(2026,6,16,6,2) },
      { id: "MON-0005", userId: "USR-0012", category: "login", action: "login", amountEUR: 0, channel: "app", country: "MA", ip: "105.99.1.6", flagged: true, score: 58, createdAt: iso(2026,6,13,7,19) },
      { id: "MON-0006", userId: "USR-0002", category: "transaction", action: "p2p_out", amountEUR: 45.00, channel: "app", country: "FR", ip: "92.184.3.1", flagged: false, score: 5, createdAt: iso(2026,6,14,18,4) },
      { id: "MON-0007", userId: "USR-0015", category: "transaction", action: "deposit", amountEUR: 9500.00, channel: "sepa", country: "LT", ip: "78.61.8.9", flagged: true, score: 76, createdAt: iso(2026,6,14,10,3) },
      { id: "MON-0008", userId: "USR-0008", category: "card", action: "card_freeze", amountEUR: 0, channel: "app", country: "FR", ip: "82.66.7.7", flagged: false, score: 3, createdAt: iso(2026,6,12,20,30) },
      { id: "MON-0009", userId: "USR-0011", category: "transaction", action: "card_payment", amountEUR: 78.50, channel: "card", country: "ES", ip: "85.50.2.2", flagged: false, score: 18, createdAt: iso(2026,6,9,13,40) },
      { id: "MON-0010", userId: "USR-0010", category: "kyc", action: "kyc_reject", amountEUR: 0, channel: "system", country: "FR", ip: "127.0.0.1", flagged: true, score: 88, createdAt: iso(2026,4,3,15,0) },
      { id: "MON-0011", userId: "USR-0014", category: "transaction", action: "sepa_out", amountEUR: 1200.00, channel: "sepa", country: "FR", ip: "92.90.1.5", flagged: false, score: 12, createdAt: iso(2026,6,15,20,2) },
      { id: "MON-0012", userId: "USR-0001", category: "savings", action: "savings_deposit", amountEUR: 500.00, channel: "app", country: "FR", ip: "82.64.10.3", flagged: false, score: 4, createdAt: iso(2026,6,16,7,41) }
    ];
  }

  function seedAnomalies() {
    return [
      { id: "ANO-0001", source: "monitoring", relatedId: "MON-0002", metric: "card_velocity", expected: "< 5/h", observed: "12/4min", deviation: 240, severity: "high", status: "open", detectedAt: iso(2026,6,15,9,2) },
      { id: "ANO-0002", source: "monitoring", relatedId: "MON-0007", metric: "deposit_threshold", expected: "< 10000", observed: "9500 x3", deviation: 185, severity: "high", status: "investigating", detectedAt: iso(2026,6,14,10,4) },
      { id: "ANO-0003", source: "savings", relatedId: null, metric: "yield_assumption", expected: "7% objectif", observed: "modèle non finalisé", deviation: 0, severity: "medium", status: "open", detectedAt: iso(2026,6,10,9,0) },
      { id: "ANO-0004", source: "monitoring", relatedId: "MON-0005", metric: "geo_login", expected: "UE", observed: "MA", deviation: 100, severity: "medium", status: "investigating", detectedAt: iso(2026,6,13,7,20) },
      { id: "ANO-0005", source: "ledger", relatedId: "USR-0001", metric: "double_entry", expected: "1 débit", observed: "2 débits", deviation: 100, severity: "high", status: "resolved", detectedAt: iso(2026,6,13,9,46) },
      { id: "ANO-0006", source: "kyc", relatedId: "KYC-0004", metric: "review_sla", expected: "< 48h", observed: "96h", deviation: 100, severity: "medium", status: "open", detectedAt: iso(2026,6,12,8,0) },
      { id: "ANO-0007", source: "monitoring", relatedId: "MON-0010", metric: "sanctions_hit", expected: "0", observed: "1", deviation: 100, severity: "critical", status: "investigating", detectedAt: iso(2026,4,3,15,0) },
      { id: "ANO-0008", source: "waitlist", relatedId: null, metric: "signup_spike", expected: "~20/j", observed: "140/j", deviation: 600, severity: "low", status: "resolved", detectedAt: iso(2026,3,2,12,0) },
      { id: "ANO-0009", source: "monitoring", relatedId: "MON-0003", metric: "inbound_size", expected: "< 5000", observed: "28000", deviation: 460, severity: "medium", status: "open", detectedAt: iso(2026,6,11,14,30) }
    ];
  }

  function seedAuditLogs() {
    return [
      { id: "LOG-0001", actor: "kyc.team", action: "kyc.verify", entity: "kyc", entityId: "KYC-0001", details: "KYC vérifié", ip: "10.0.0.5", createdAt: iso(2026,1,8,10,5) },
      { id: "LOG-0002", actor: "compliance", action: "kyc.reject", entity: "kyc", entityId: "KYC-0010", details: "Correspondance sanctions", ip: "10.0.0.7", createdAt: iso(2026,4,3,15,0) },
      { id: "LOG-0003", actor: "mlro", action: "risk.escalate", entity: "riskAlerts", entityId: "RSK-0002", details: "Escaladé pour SAR", ip: "10.0.0.9", createdAt: iso(2026,6,12,8,30) },
      { id: "LOG-0004", actor: "dpo", action: "dataRights.complete", entity: "dataRights", entityId: "DSR-0001", details: "Accès données fourni", ip: "10.0.0.4", createdAt: iso(2026,5,20,14,0) },
      { id: "LOG-0005", actor: "admin", action: "user.suspend", entity: "users", entityId: "USR-0006", details: "Suspension pour vigilance AML", ip: "10.0.0.2", createdAt: iso(2026,6,1,9,30) },
      { id: "LOG-0006", actor: "support.fr", action: "complaint.resolve", entity: "complaints", entityId: "CMP-0003", details: "Réclamation résolue", ip: "10.0.0.11", createdAt: iso(2026,6,5,10,2) },
      { id: "LOG-0007", actor: "system", action: "report.generate", entity: "reports", entityId: "REP-0001", details: "Rapport AML mensuel généré", ip: "127.0.0.1", createdAt: iso(2026,6,1,2,0) },
      { id: "LOG-0008", actor: "compliance", action: "risk.review", entity: "riskAlerts", entityId: "RSK-0003", details: "Revue PEP en cours", ip: "10.0.0.7", createdAt: iso(2026,6,9,12,0) },
      { id: "LOG-0009", actor: "admin", action: "settings.update", entity: "settings", entityId: "consent-policy", details: "Politique cookies passée en v1.2", ip: "10.0.0.2", createdAt: iso(2026,5,30,16,40) },
      { id: "LOG-0010", actor: "dpo", action: "dataRights.open", entity: "dataRights", entityId: "DSR-0002", details: "Demande d'effacement ouverte", ip: "10.0.0.4", createdAt: iso(2026,6,9,9,0) },
      { id: "LOG-0011", actor: "kyc.team", action: "kyc.verify", entity: "kyc", entityId: "KYC-0014", details: "KYC vérifié", ip: "10.0.0.5", createdAt: iso(2026,5,12,11,20) },
      { id: "LOG-0012", actor: "mlro", action: "monitoring.flag", entity: "monitoringEvents", entityId: "MON-0007", details: "Événement marqué (fractionnement)", ip: "10.0.0.9", createdAt: iso(2026,6,14,10,5) }
    ];
  }

  function seedReports() {
    return [
      { id: "REP-0001", type: "aml", title: "Rapport AML — mai 2026", period: "2026-05", status: "final", format: "PDF", metrics: { alerts: 14, sars: 1, escalations: 3 }, generatedBy: "system", createdAt: iso(2026,6,1,2,0) },
      { id: "REP-0002", type: "kyc", title: "Activité KYC — mai 2026", period: "2026-05", status: "final", format: "CSV", metrics: { sessions: 9, verified: 6, rejected: 1, pending: 2 }, generatedBy: "system", createdAt: iso(2026,6,1,2,5) },
      { id: "REP-0003", type: "growth", title: "Croissance liste d'attente — Q1 2026", period: "2026-Q1", status: "final", format: "PDF", metrics: { signups: 412, converted: 38, conversion: 9.2 }, generatedBy: "growth", createdAt: iso(2026,4,2,9,0) },
      { id: "REP-0004", type: "complaints", title: "Réclamations — mai 2026", period: "2026-05", status: "final", format: "CSV", metrics: { total: 22, resolved: 17, slaBreaches: 1 }, generatedBy: "support.fr", createdAt: iso(2026,6,2,10,0) },
      { id: "REP-0005", type: "rgpd", title: "Demandes RGPD — mai 2026", period: "2026-05", status: "final", format: "PDF", metrics: { requests: 8, completed: 5, overdue: 0 }, generatedBy: "dpo", createdAt: iso(2026,6,3,11,0) },
      { id: "REP-0006", type: "monitoring", title: "Monitoring transactions — S22 2026", period: "2026-W22", status: "draft", format: "PDF", metrics: { events: 1240, flagged: 47, falsePositives: 31 }, generatedBy: "mlro", createdAt: iso(2026,6,8,9,0) },
      { id: "REP-0007", type: "safeguarding", title: "Cantonnement des fonds — mai 2026", period: "2026-05", status: "final", format: "PDF", metrics: { clientFundsEUR: 1284500, segregated: true, shortfallEUR: 0 }, generatedBy: "finance", createdAt: iso(2026,6,4,8,0) },
      { id: "REP-0008", type: "aml", title: "Rapport AML — avril 2026", period: "2026-04", status: "final", format: "PDF", metrics: { alerts: 11, sars: 0, escalations: 2 }, generatedBy: "system", createdAt: iso(2026,5,1,2,0) },
      { id: "REP-0009", type: "board", title: "Synthèse conformité — Conseil juin 2026", period: "2026-06", status: "draft", format: "PDF", metrics: { openRisks: 5, openComplaints: 6, openDsr: 4 }, generatedBy: "compliance", createdAt: iso(2026,6,15,18,0) }
    ];
  }

  function buildSeed() {
    return {
      users: seedUsers(),
      waitlist: seedWaitlist(),
      contact: seedContact(),
      complaints: seedComplaints(),
      dataRights: seedDataRights(),
      cookieConsents: seedCookieConsents(),
      kyc: seedKyc(),
      riskAlerts: seedRiskAlerts(),
      monitoringEvents: seedMonitoringEvents(),
      anomalies: seedAnomalies(),
      auditLogs: seedAuditLogs(),
      reports: seedReports()
    };
  }

  /* =================================================== PERSISTENCE / INIT == */
  function hasStorage() {
    try {
      var k = "__nv_test__";
      global.localStorage.setItem(k, "1");
      global.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  }

  function persist() {
    if (!hasStorage()) return;
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify({ db: db, counters: counters }));
    } catch (e) { /* quota / file:// — on reste en mémoire */ }
  }

  function mergeNovaData(target) {
    // fusionne les jeux de référence éventuels de window.NovaData (par entité, par id)
    var ND = global.NovaData;
    if (!ND) return;
    for (var i = 0; i < ENTITIES.length; i++) {
      var e = ENTITIES[i];
      var ref = ND[e];
      if (ref && ref.length) target[e] = deepMergeRows(target[e] || [], ref);
    }
  }

  function syncAllCounters() {
    for (var i = 0; i < ENTITIES.length; i++) {
      var e = ENTITIES[i];
      syncCounter(PREFIX[e], db[e] || []);
    }
  }

  function init() {
    var loaded = null;
    if (hasStorage()) {
      try {
        var raw = global.localStorage.getItem(STORAGE_KEY);
        if (raw) loaded = JSON.parse(raw);
      } catch (e) { loaded = null; }
    }

    if (loaded && loaded.db) {
      db = loaded.db;
      counters = loaded.counters || {};
      // garantir que toutes les entités existent
      for (var i = 0; i < ENTITIES.length; i++) {
        if (!db[ENTITIES[i]]) db[ENTITIES[i]] = [];
      }
    } else {
      db = buildSeed();
      counters = {};
    }

    // fusion des données de référence (NovaData prioritaire sur le seed)
    mergeNovaData(db);
    syncAllCounters();

    if (!loaded) persist();   // première initialisation : on sème en localStorage
  }

  /* =========================================================== API GÉNÉRIQUE */
  function assertEntity(entity) {
    if (!db[entity]) throw new Error("NovaStore: entité inconnue « " + entity + " »");
    return db[entity];
  }

  function matchesCriteria(row, criteria) {
    for (var k in criteria) {
      if (!Object.prototype.hasOwnProperty.call(criteria, k)) continue;
      if (row[k] !== criteria[k]) return false;
    }
    return true;
  }

  function list(entity, criteria) {
    var rows = assertEntity(entity);
    if (!criteria) return rows.slice();
    return rows.filter(function (r) { return matchesCriteria(r, criteria); });
  }

  function get(entity, id) {
    var rows = assertEntity(entity);
    for (var i = 0; i < rows.length; i++) if (rows[i].id === id) return rows[i];
    return null;
  }

  function create(entity, obj) {
    var rows = assertEntity(entity);
    var rec = clone(obj || {});
    if (rec.id == null) rec.id = nextId(PREFIX[entity] || "REC");
    else syncCounter(PREFIX[entity] || "REC", [rec]);
    if (rec.createdAt == null) rec.createdAt = nowISO();
    rows.push(rec);
    persist();
    return rec;
  }

  function update(entity, id, patch) {
    var rows = assertEntity(entity);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id === id) {
        for (var k in patch) {
          if (Object.prototype.hasOwnProperty.call(patch, k)) rows[i][k] = patch[k];
        }
        rows[i].updatedAt = nowISO();
        persist();
        return rows[i];
      }
    }
    return null;
  }

  function remove(entity, id) {
    var rows = assertEntity(entity);
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].id === id) { rows.splice(i, 1); persist(); return true; }
    }
    return false;
  }

  function filter(entity, predicate) {
    var rows = assertEntity(entity);
    return rows.filter(predicate);
  }

  /* ------------------------------------------------------------------ CSV -- */
  function csvCell(v) {
    if (v == null) return "";
    if (typeof v === "object") v = JSON.stringify(v);
    v = String(v);
    if (/[",\n;]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
    return v;
  }
  function rowsToCSV(rows) {
    if (!rows || !rows.length) return "";
    // colonnes = union des clés
    var cols = [], seen = {};
    for (var i = 0; i < rows.length; i++) {
      for (var k in rows[i]) {
        if (Object.prototype.hasOwnProperty.call(rows[i], k) && !seen[k]) { seen[k] = true; cols.push(k); }
      }
    }
    var out = [cols.join(",")];
    for (var r = 0; r < rows.length; r++) {
      var line = [];
      for (var c = 0; c < cols.length; c++) line.push(csvCell(rows[r][cols[c]]));
      out.push(line.join(","));
    }
    return out.join("\n");
  }
  function toCSV(entityOrRows) {
    if (typeof entityOrRows === "string") return rowsToCSV(list(entityOrRows));
    if (Array.isArray(entityOrRows)) return rowsToCSV(entityOrRows);
    return "";
  }

  /* ----------------------------------------------------------------- reset */
  function reset() {
    if (hasStorage()) {
      try { global.localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    }
    db = buildSeed();
    counters = {};
    mergeNovaData(db);
    syncAllCounters();
    persist();
    return true;
  }

  /* ==================================================== FONCTIONS NOMMÉES == */
  // Chaque fonction écrit un auditLog (sauf createAuditLog lui-même).
  function audit(actor, action, entity, entityId, details) {
    var rows = assertEntity("auditLogs");
    var rec = {
      id: nextId(PREFIX.auditLogs),
      actor: actor || "system",
      action: action,
      entity: entity,
      entityId: entityId,
      details: details || "",
      ip: "127.0.0.1",
      createdAt: nowISO()
    };
    rows.push(rec);
    persist();
    return rec;
  }

  function createAuditLog(data) {
    data = data || {};
    return create("auditLogs", {
      actor: data.actor || "system",
      action: data.action || "log",
      entity: data.entity || null,
      entityId: data.entityId || null,
      details: data.details || "",
      ip: data.ip || "127.0.0.1"
    });
  }

  function createUser(data) {
    data = data || {};
    var rec = create("users", {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      email: data.email || "",
      country: data.country || "FR",
      segment: data.segment || "salarie",
      status: data.status || "pending",
      kycStatus: data.kycStatus || "pending",
      balanceEUR: data.balanceEUR || 0,
      savingsEUR: data.savingsEUR || 0,
      plan: data.plan || "standard",
      lastLoginAt: data.lastLoginAt || null,
      riskLevel: data.riskLevel || "low",
      createdAt: data.createdAt || nowISO()
    });
    audit(data.actor || "system", "user.create", "users", rec.id, "Création utilisateur " + rec.email);
    return rec;
  }

  function createWaitlistEntry(data) {
    data = data || {};
    var position = data.position || (list("waitlist").length + 1);
    var rec = create("waitlist", {
      email: data.email || "",
      country: data.country || "FR",
      segment: data.segment || "salarie",
      source: data.source || "landing",
      referral: data.referral || null,
      position: position,
      status: data.status || "waiting",
      createdAt: data.createdAt || nowISO()
    });
    audit(data.actor || "system", "waitlist.create", "waitlist", rec.id, "Inscription liste d'attente " + rec.email);
    return rec;
  }

  function createContactMessage(data) {
    data = data || {};
    var rec = create("contact", {
      name: data.name || "",
      email: data.email || "",
      subject: data.subject || "",
      topic: data.topic || "compte",
      message: data.message || "",
      status: data.status || "open",
      assignedTo: data.assignedTo || null,
      answeredAt: data.answeredAt || null,
      createdAt: data.createdAt || nowISO()
    });
    audit(data.actor || "system", "contact.create", "contact", rec.id, "Nouveau message contact");
    return rec;
  }

  function createComplaint(data) {
    data = data || {};
    var rec = create("complaints", {
      userId: data.userId || null,
      channel: data.channel || "app",
      category: data.category || "appli",
      subject: data.subject || "",
      description: data.description || "",
      priority: data.priority || "medium",
      status: data.status || "open",
      assignedTo: data.assignedTo || null,
      slaDueAt: data.slaDueAt || null,
      resolvedAt: data.resolvedAt || null,
      createdAt: data.createdAt || nowISO()
    });
    audit(data.actor || "system", "complaint.create", "complaints", rec.id, "Nouvelle réclamation : " + rec.subject);
    return rec;
  }

  function createDataRightsRequest(data) {
    data = data || {};
    var rec = create("dataRights", {
      userId: data.userId || null,
      type: data.type || "access",
      basis: data.basis || "RGPD",
      status: data.status || "open",
      requestedAt: data.requestedAt || nowISO(),
      dueAt: data.dueAt || null,
      completedAt: data.completedAt || null,
      handledBy: data.handledBy || null,
      createdAt: data.createdAt || nowISO()
    });
    audit(data.actor || "system", "dataRights.create", "dataRights", rec.id, "Demande RGPD " + rec.type);
    return rec;
  }

  function saveCookieConsent(data) {
    data = data || {};
    var rec = create("cookieConsents", {
      anonId: data.anonId || ("anon-" + Math.random().toString(16).slice(2, 6)),
      necessary: data.necessary !== false,
      analytics: !!data.analytics,
      marketing: !!data.marketing,
      region: data.region || "FR",
      policyVersion: data.policyVersion || "v1.2",
      userAgent: data.userAgent || "",
      createdAt: data.createdAt || nowISO()
    });
    audit(data.actor || "system", "consent.save", "cookieConsents", rec.id, "Consentement enregistré");
    return rec;
  }

  function createKycSession(data) {
    data = data || {};
    var rec = create("kyc", {
      userId: data.userId || null,
      type: data.type || "KYC",
      level: data.level || "standard",
      provider: data.provider || "Veriff",
      status: data.status || "pending",
      riskScore: (data.riskScore == null ? null : data.riskScore),
      pep: !!data.pep,
      sanctions: !!data.sanctions,
      documents: data.documents || [],
      country: data.country || "FR",
      reviewedAt: data.reviewedAt || null,
      reviewer: data.reviewer || null,
      createdAt: data.createdAt || nowISO()
    });
    audit(data.actor || "system", "kyc.create", "kyc", rec.id, "Ouverture session " + rec.type);
    return rec;
  }

  function updateKycStatus(id, status, opts) {
    opts = opts || {};
    var patch = { status: status };
    if (status === "verified" || status === "rejected") {
      patch.reviewedAt = opts.reviewedAt || nowISO();
      patch.reviewer = opts.reviewer || "kyc.team";
    }
    if (opts.riskScore != null) patch.riskScore = opts.riskScore;
    if (opts.pep != null) patch.pep = opts.pep;
    if (opts.sanctions != null) patch.sanctions = opts.sanctions;
    var rec = update("kyc", id, patch);
    if (rec) {
      // refléter sur l'utilisateur lié
      if (rec.userId) update("users", rec.userId, { kycStatus: status });
      audit(opts.actor || "kyc.team", "kyc." + status, "kyc", id, "KYC -> " + status);
    }
    return rec;
  }

  function createRiskAlert(data) {
    data = data || {};
    var rec = create("riskAlerts", {
      userId: data.userId || null,
      type: data.type || "velocity",
      severity: data.severity || "medium",
      title: data.title || "",
      description: data.description || "",
      amountEUR: data.amountEUR || 0,
      status: data.status || "open",
      assignedTo: data.assignedTo || "mlro",
      createdAt: data.createdAt || nowISO()
    });
    audit(data.actor || "system", "risk.create", "riskAlerts", rec.id, "Alerte risque : " + rec.title);
    return rec;
  }

  function createMonitoringEvent(data) {
    data = data || {};
    var rec = create("monitoringEvents", {
      userId: data.userId || null,
      category: data.category || "transaction",
      action: data.action || "card_payment",
      amountEUR: data.amountEUR || 0,
      channel: data.channel || "app",
      country: data.country || "FR",
      ip: data.ip || "0.0.0.0",
      flagged: !!data.flagged,
      score: (data.score == null ? 0 : data.score),
      createdAt: data.createdAt || nowISO()
    });
    audit(data.actor || "system", "monitoring.event", "monitoringEvents", rec.id, "Événement " + rec.action);
    return rec;
  }

  function generateReport(type, opts) {
    type = type || "aml";
    opts = opts || {};
    var period = opts.period || nowISO().slice(0, 7);
    var titles = {
      aml: "Rapport AML", kyc: "Activité KYC", growth: "Croissance",
      complaints: "Réclamations", rgpd: "Demandes RGPD",
      monitoring: "Monitoring transactions", safeguarding: "Cantonnement des fonds",
      board: "Synthèse conformité"
    };
    var metrics = opts.metrics || computeReportMetrics(type);
    var rec = create("reports", {
      type: type,
      title: opts.title || ((titles[type] || "Rapport") + " — " + period),
      period: period,
      status: opts.status || "draft",
      format: opts.format || "PDF",
      metrics: metrics,
      generatedBy: opts.generatedBy || "system",
      createdAt: nowISO()
    });
    audit(opts.actor || "system", "report.generate", "reports", rec.id, "Génération rapport " + type);
    return rec;
  }

  // calcule des métriques plausibles à partir des données présentes
  function computeReportMetrics(type) {
    switch (type) {
      case "aml":
        return {
          alerts: list("riskAlerts").length,
          escalations: filter("riskAlerts", function (r) { return r.status === "escalated"; }).length,
          sars: filter("riskAlerts", function (r) { return r.severity === "critical"; }).length
        };
      case "kyc":
        return {
          sessions: list("kyc").length,
          verified: filter("kyc", function (r) { return r.status === "verified"; }).length,
          rejected: filter("kyc", function (r) { return r.status === "rejected"; }).length,
          pending: filter("kyc", function (r) { return r.status === "pending" || r.status === "review"; }).length
        };
      case "complaints":
        return {
          total: list("complaints").length,
          resolved: filter("complaints", function (r) { return r.status === "resolved"; }).length,
          open: filter("complaints", function (r) { return r.status === "open"; }).length
        };
      case "rgpd":
        return {
          requests: list("dataRights").length,
          completed: filter("dataRights", function (r) { return r.status === "completed"; }).length,
          open: filter("dataRights", function (r) { return r.status === "open"; }).length
        };
      case "monitoring":
        return {
          events: list("monitoringEvents").length,
          flagged: filter("monitoringEvents", function (r) { return r.flagged; }).length
        };
      case "growth":
        return {
          signups: list("waitlist").length,
          converted: filter("waitlist", function (r) { return r.status === "converted"; }).length
        };
      default:
        return { generatedAt: nowISO() };
    }
  }

  /* ===================================================== EXPOSITION GLOBALE */
  init();

  global.NovaStore = {
    STORAGE_KEY: STORAGE_KEY,
    // générique
    list: list,
    get: get,
    create: create,
    update: update,
    remove: remove,
    filter: filter,
    toCSV: toCSV,
    reset: reset,
    // helpers
    entities: function () { return ENTITIES.slice(); },
    count: function (entity) { return assertEntity(entity).length; },
    save: persist,
    export: function () { return clone(db); },
    // fonctions nommées
    createUser: createUser,
    createWaitlistEntry: createWaitlistEntry,
    createContactMessage: createContactMessage,
    createComplaint: createComplaint,
    createDataRightsRequest: createDataRightsRequest,
    saveCookieConsent: saveCookieConsent,
    createKycSession: createKycSession,
    updateKycStatus: updateKycStatus,
    createRiskAlert: createRiskAlert,
    createMonitoringEvent: createMonitoringEvent,
    createAuditLog: createAuditLog,
    generateReport: generateReport
  };

})(typeof window !== "undefined" ? window : this);
