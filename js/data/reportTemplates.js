/* NOVA — Mirror runtime des modèles de rapports (reporting de conformité)
 * ----------------------------------------------------------------------------
 * JS CLASSIQUE (pas de modules ES, doit marcher en file://).
 * Expose window.NovaData.reportTemplates = [...] pour /admin/reports.html.
 *
 * Chaque modèle : {
 *   type,             // clé alignée sur NovaStore.generateReport(type)
 *   label,            // libellé lisible
 *   description,      // à quoi sert le rapport
 *   defaultPeriod,    // période par défaut (YYYY-MM, YYYY-Qn, YYYY-Wnn)
 *   defaultFormat,    // 'PDF' | 'CSV'
 *   audience,         // destinataire (régulateur, conseil, interne…)
 *   metricKeys        // métriques attendues (libellés)
 * }
 * Les rapports réels sont générés via window.NovaStore.generateReport(type, opts)
 * et persistés dans l'entité 'reports'. Données fictives — projet en développement.
 */
(function (global) {
  'use strict';

  var ND = global.NovaData = global.NovaData || {};

  ND.reportTemplates = [
    {
      type: 'aml',
      label: 'Rapport AML / CFT',
      description: 'Synthèse des alertes, escalades et déclarations de soupçon (SAR) sur la période.',
      defaultPeriod: '2026-06',
      defaultFormat: 'PDF',
      audience: 'Banque de Lituanie (visé) / MLRO',
      metricKeys: ['alerts', 'escalations', 'sars']
    },
    {
      type: 'kyc',
      label: 'Activité KYC / KYB',
      description: 'Sessions ouvertes, vérifiées, rejetées et en attente sur la période.',
      defaultPeriod: '2026-06',
      defaultFormat: 'CSV',
      audience: 'Conformité',
      metricKeys: ['sessions', 'verified', 'rejected', 'pending']
    },
    {
      type: 'complaints',
      label: 'Réclamations clients',
      description: 'Volume, taux de résolution et réclamations restées ouvertes.',
      defaultPeriod: '2026-06',
      defaultFormat: 'CSV',
      audience: 'Relation client / Conformité',
      metricKeys: ['total', 'resolved', 'open']
    },
    {
      type: 'rgpd',
      label: 'Demandes RGPD',
      description: 'Demandes d\'exercice de droits (accès, effacement, portabilité…) et délais.',
      defaultPeriod: '2026-06',
      defaultFormat: 'PDF',
      audience: 'DPO / autorité de protection des données',
      metricKeys: ['requests', 'completed', 'open']
    },
    {
      type: 'monitoring',
      label: 'Monitoring des transactions',
      description: 'Événements surveillés et événements marqués (flagged) sur la période.',
      defaultPeriod: '2026-W24',
      defaultFormat: 'PDF',
      audience: 'MLRO',
      metricKeys: ['events', 'flagged']
    },
    {
      type: 'growth',
      label: 'Croissance liste d\'attente',
      description: 'Inscriptions et conversions de la liste d\'attente (landing).',
      defaultPeriod: '2026-Q2',
      defaultFormat: 'PDF',
      audience: 'Direction / Growth',
      metricKeys: ['signups', 'converted']
    },
    {
      type: 'safeguarding',
      label: 'Cantonnement des fonds',
      description: 'État du safeguarding des fonds clients (ségrégation, écart éventuel).',
      defaultPeriod: '2026-06',
      defaultFormat: 'PDF',
      audience: 'Finance / régulateur visé',
      metricKeys: ['clientFundsEUR', 'segregated', 'shortfallEUR']
    },
    {
      type: 'board',
      label: 'Synthèse conformité (Conseil)',
      description: 'Vue d\'ensemble des risques, réclamations et demandes RGPD ouverts.',
      defaultPeriod: '2026-06',
      defaultFormat: 'PDF',
      audience: 'Conseil d\'administration',
      metricKeys: ['openRisks', 'openComplaints', 'openDsr']
    }
  ];

})(typeof window !== 'undefined' ? window : this);
