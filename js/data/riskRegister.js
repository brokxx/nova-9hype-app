/* NOVA — Mirror runtime du registre des risques (risk register)
 * --------------------------------------------------------------
 * JS CLASSIQUE (pas de modules ES, doit marcher en file://).
 * Expose window.NovaData.riskRegister = [...] pour la page /admin/risk.html.
 *
 * PROJET NOVA — future fintech / néobanque EN DÉVELOPPEMENT (non agréé).
 * Intention : société UAB en Lituanie + demande de licence EMI auprès de
 * Lietuvos bankas (cadre EMD2/PSD2/RGPD/AML 4e-5e-6e). Données 100 % FICTIVES,
 * destinées uniquement à la maquette du backoffice.
 *
 * Le registre suit une logique classique de gestion des risques :
 *   score = likelihood (1-5) x impact (1-5)  -> de 1 (négligeable) à 25 (extrême).
 *
 * Chaque objet :
 *   {
 *     id,
 *     title          — intitulé court du risque,
 *     category       — 'compliance' | 'aml' | 'financial' | 'operational' |
 *                      'security' | 'tech' | 'legal' | 'reputational',
 *     description    — description du risque (FR),
 *     likelihood     — probabilité (1-5),
 *     impact         — gravité (1-5),
 *     score          — likelihood x impact (1-25),
 *     level          — 'low' | 'medium' | 'high' | 'critical' (dérivé du score),
 *     status         — 'open' | 'mitigating' | 'monitoring' | 'accepted' | 'closed',
 *     owner          — fonction responsable (MLRO, DPO, CISO, Finance…),
 *     mitigation     — mesure d'atténuation prévue / en place,
 *     createdAt, updatedAt (ISO 8601 UTC, ~2026)
 *   }
 */
(function (global) {
  'use strict';

  var ND = global.NovaData = global.NovaData || {};

  ND.riskCategories = [
    'compliance',
    'aml',
    'financial',
    'operational',
    'security',
    'tech',
    'legal',
    'reputational'
  ];

  ND.riskStatuses = [
    'open',
    'mitigating',
    'monitoring',
    'accepted',
    'closed'
  ];

  // Libellés FR lisibles des catégories (pour l'UI / filtres).
  ND.riskCategoryLabels = {
    compliance: 'Conformité',
    aml: 'AML / CFT',
    financial: 'Financier',
    operational: 'Opérationnel',
    security: 'Sécurité',
    tech: 'Technique',
    legal: 'Juridique',
    reputational: 'Réputation'
  };

  // Dérive le niveau à partir du score (1-25).
  ND.riskLevelFromScore = function (score) {
    if (score >= 16) return 'critical';
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  };

  function risk(id, title, category, description, likelihood, impact, status, owner, mitigation, createdAt, updatedAt) {
    var score = likelihood * impact;
    return {
      id: id,
      title: title,
      category: category,
      description: description,
      likelihood: likelihood,
      impact: impact,
      score: score,
      level: ND.riskLevelFromScore(score),
      status: status,
      owner: owner,
      mitigation: mitigation,
      createdAt: createdAt,
      updatedAt: updatedAt
    };
  }

  ND.riskRegister = [
    risk('RR-0001', 'Retard d’obtention de la licence EMI', 'compliance',
      'La demande de licence EMI auprès de la Banque de Lituanie pourrait être retardée ou exiger des compléments, repoussant le lancement commercial.',
      4, 5, 'mitigating', 'Compliance',
      'Dossier réglementaire préparé en amont avec un conseil spécialisé ; jalons suivis avec Lietuvos bankas ; communication « sous réserve des autorisations ».',
      '2026-01-20T09:00:00Z', '2026-06-14T10:30:00Z'),

    risk('RR-0002', 'Correspondance liste de sanctions non détectée', 'aml',
      'Un client ou un bénéficiaire figurant sur une liste de sanctions UE/OFAC pourrait passer le screening en raison d’un paramétrage trop permissif.',
      3, 5, 'monitoring', 'MLRO',
      'Screening temps réel à l’onboarding et sur chaque transaction ; revue périodique des seuils de correspondance ; escalade systématique au MLRO.',
      '2026-02-03T11:15:00Z', '2026-06-15T08:05:00Z'),

    risk('RR-0003', 'Mécanisme d’épargne « 7 % » non finalisé', 'financial',
      'L’objectif de rendement « 7 % annualisé » communiqué comme cible n’a pas encore de mécanisme financier défini ni validé ; risque de promesse intenable.',
      4, 4, 'open', 'Finance',
      'Traitement strict comme OBJECTIF non garanti ; avertissement de risque sur toutes les surfaces ; modélisation en cours, sous réserve des autorisations.',
      '2026-02-10T14:00:00Z', '2026-06-10T09:00:00Z'),

    risk('RR-0004', 'Défaillance du cantonnement des fonds (safeguarding)', 'financial',
      'Un écart de réconciliation entre les fonds clients et le compte de cantonnement dédié exposerait Nova à un manquement réglementaire majeur.',
      2, 5, 'monitoring', 'Finance',
      'Comptes de cantonnement ségrégés ; réconciliation quotidienne automatisée ; alerte en cas d’écart ; rapport safeguarding mensuel.',
      '2026-02-18T10:20:00Z', '2026-06-15T23:55:00Z'),

    risk('RR-0005', 'Credential stuffing / prise de contrôle de compte', 'security',
      'Des attaques automatisées par réutilisation d’identifiants pourraient compromettre des comptes utilisateurs faute d’authentification forte généralisée.',
      4, 4, 'mitigating', 'CISO',
      'SCA (PSD2) imposée pour les opérations sensibles ; détection de vélocité d’échecs ; limitation de débit et captcha ; alertes monitoring.',
      '2026-03-01T08:45:00Z', '2026-06-16T03:50:00Z'),

    risk('RR-0006', 'Fuite de données personnelles (RGPD)', 'security',
      'Une compromission exposant des données personnelles (KYC, IBAN) entraînerait une notification CNIL/autorité sous 72 h et un risque réputationnel fort.',
      2, 5, 'mitigating', 'DPO',
      'Chiffrement au repos et en transit ; minimisation des données ; cloisonnement ; procédure de notification de violation ; registre des traitements.',
      '2026-03-08T13:30:00Z', '2026-06-12T16:40:00Z'),

    risk('RR-0007', 'Mules financières via virements P2P', 'aml',
      'Le P2P instantané entre utilisateurs Nova pourrait être détourné pour des schémas de mules (réception puis renvoi immédiat de fonds).',
      3, 4, 'monitoring', 'MLRO',
      'Détection des schémas de transit rapide ; plafonds P2P ; scoring de risque par bénéficiaire ; gel et escalade en cas de schéma suspect.',
      '2026-03-15T09:10:00Z', '2026-06-16T09:40:00Z'),

    risk('RR-0008', 'Dépendance à un prestataire KYC unique', 'operational',
      'Une indisponibilité ou rupture contractuelle avec le prestataire de vérification d’identité bloquerait l’onboarding de nouveaux clients.',
      3, 3, 'open', 'Operations',
      'Intégration multi-fournisseurs (Veriff/Onfido) ; bascule automatique ; file d’attente de vérification manuelle en secours.',
      '2026-03-22T15:00:00Z', '2026-06-08T11:00:00Z'),

    risk('RR-0009', 'Fraude à la carte (e-commerce / sans contact)', 'financial',
      'L’usage frauduleux des cartes virtuelles et physiques pourrait générer des pertes et des contestations (chargebacks).',
      3, 3, 'monitoring', 'Risk',
      '3-D Secure systématique ; scoring transactionnel ; gel/dégel instantané depuis l’app ; plafonds paramétrables.',
      '2026-04-02T10:05:00Z', '2026-06-15T20:20:00Z'),

    risk('RR-0010', 'Indisponibilité de la plateforme (panne majeure)', 'tech',
      'Une panne d’infrastructure prolongée empêcherait l’accès aux comptes et aux paiements, dégradant fortement la confiance.',
      2, 4, 'mitigating', 'CISO',
      'Architecture redondante multi-zone ; supervision 24/7 ; plan de continuité et de reprise (PCA/PRA) ; tests de bascule réguliers.',
      '2026-04-10T08:30:00Z', '2026-06-11T14:00:00Z'),

    risk('RR-0011', 'Communication trompeuse sur le statut bancaire', 'reputational',
      'Une communication laissant croire que Nova est déjà une banque/EMI agréée exposerait à des sanctions réglementaires et à une perte de crédibilité.',
      2, 4, 'monitoring', 'Compliance',
      'Mentions « projet en développement » et « sous réserve des autorisations » obligatoires ; revue conformité de tout support de communication.',
      '2026-04-18T11:45:00Z', '2026-06-13T09:30:00Z'),

    risk('RR-0012', 'Non-respect des délais de réponse RGPD', 'legal',
      'Le non-traitement des demandes d’exercice de droits (accès, effacement…) dans le délai d’un mois constituerait un manquement RGPD.',
      3, 3, 'mitigating', 'DPO',
      'Suivi des demandes avec échéance ; alertes d’approche de délai ; workflow d’instruction ; rapport RGPD mensuel.',
      '2026-04-25T14:20:00Z', '2026-06-15T09:10:00Z'),

    risk('RR-0013', 'Structuring / fractionnement sous seuils', 'aml',
      'Des dépôts ou virements fractionnés sous les seuils de déclaration pourraient être utilisés pour contourner la surveillance AML.',
      3, 4, 'monitoring', 'MLRO',
      'Règles de détection de fractionnement (cumul glissant) ; agrégation par contrepartie ; déclaration de soupçon (SAR) si confirmé.',
      '2026-05-02T09:55:00Z', '2026-06-16T11:25:00Z'),

    risk('RR-0014', 'Erreur de réconciliation comptable (double écriture)', 'operational',
      'Une anomalie de grand livre (double débit/crédit) fausserait les soldes affichés et la réconciliation des fonds.',
      2, 3, 'closed', 'Finance',
      'Contrôles de double écriture automatisés ; rapprochement quotidien ; piste d’audit complète (audit logs).',
      '2026-05-09T10:40:00Z', '2026-06-13T09:50:00Z'),

    risk('RR-0015', 'Dépendance réglementaire au passporting EEE', 'legal',
      'L’ambition de passporting dans l’EEE dépend de l’obtention préalable de la licence EMI ; un refus limiterait la couverture géographique.',
      3, 3, 'open', 'Compliance',
      'Lancement initial centré sur la France ; expansion EEE conditionnée à la licence et au passporting ; communication prudente.',
      '2026-05-16T13:15:00Z', '2026-06-09T15:30:00Z'),

    risk('RR-0016', 'Surcharge du support face à la croissance', 'operational',
      'Un afflux d’inscriptions (pic liste d’attente) pourrait saturer le support et dégrader les délais de traitement des réclamations.',
      3, 2, 'accepted', 'Operations',
      'Dimensionnement progressif des équipes ; base de connaissances ; priorisation par SLA ; automatisation des réponses fréquentes.',
      '2026-05-23T16:00:00Z', '2026-06-10T12:00:00Z'),

    risk('RR-0017', 'Profils PEP insuffisamment suivis', 'aml',
      'Les personnes politiquement exposées (PEP) nécessitent une vigilance renforcée continue ; un suivi insuffisant exposerait à un manquement AML.',
      2, 4, 'monitoring', 'MLRO',
      'Marquage PEP à l’onboarding ; due diligence renforcée (EDD) ; revue périodique ; origine des fonds documentée.',
      '2026-05-30T09:25:00Z', '2026-06-13T15:30:00Z'),

    risk('RR-0018', 'Dette technique du runtime sans build', 'tech',
      'Le runtime statique en JS classique facilite la maquette mais pourrait freiner l’évolutivité lors du branchement d’une vraie API/DB.',
      3, 2, 'accepted', 'Tech',
      'Modèle TypeScript canonique maintenu en parallèle (/types, /data, /backend) ; mirrors JS alignés sur les mêmes champs ; migration planifiée.',
      '2026-06-02T11:30:00Z', '2026-06-14T18:00:00Z')
  ];

})(typeof window !== 'undefined' ? window : this);
