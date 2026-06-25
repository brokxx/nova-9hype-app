/* NOVA — Mirror runtime des profils KYC / KYB (vérification d'identité)
 * ---------------------------------------------------------------------
 * JS CLASSIQUE (pas de modules ES, doit marcher en file://).
 * Expose window.NovaData.kycProfiles = [...] pour les pages /admin/ (KYC).
 *
 * PROJET NOVA — future fintech / néobanque EN DÉVELOPPEMENT (non agréé).
 * Intention : société UAB en Lituanie + demande de licence EMI auprès de
 * Lietuvos bankas (cadre EMD2/PSD2/RGPD/AML 4e-5e-6e). Toutes les données
 * ci-dessous sont 100 % FICTIVES et servent uniquement à la maquette.
 *
 * Chaque objet :
 *   {
 *     id, type ('individual'|'business'), name, country (ISO alpha-2),
 *     status (1 des 8 statuts KYC), riskScore (0-100),
 *     pep (boolean), sanctionsHit (boolean),
 *     documents[] (libellés des pièces collectées),
 *     reasons[] (motifs/observations de l'agent ou du moteur),
 *     createdAt, updatedAt (ISO 8601 UTC, ~2026)
 *   }
 *
 * Les 8 statuts KYC du cycle de vie :
 *   'pending'         — dossier reçu, en file d'attente
 *   'in_review'       — analyse en cours par un agent conformité
 *   'documents_required' — pièces manquantes ou illisibles demandées
 *   'verified'        — identité confirmée, client onboardé
 *   'rejected'        — refusé (fraude, incohérence, doublon…)
 *   'escalated'       — escaladé à la conformité (PEP, sanctions, AML)
 *   'on_hold'         — gelé en attente d'une décision/d'un élément externe
 *   'expired'         — vérification périmée, ré-vérification requise
 */
(function (global) {
  'use strict';

  var ND = global.NovaData = global.NovaData || {};

  ND.kycStatuses = [
    'pending',
    'in_review',
    'documents_required',
    'verified',
    'rejected',
    'escalated',
    'on_hold',
    'expired'
  ];

  ND.kycProfiles = [
    {
      id: 'kyc_0001',
      type: 'individual',
      name: 'Camille Moreau',
      country: 'FR',
      status: 'verified',
      riskScore: 8,
      pep: false,
      sanctionsHit: false,
      documents: ['passeport', 'selfie', 'justificatif_domicile'],
      reasons: [
        'Pièce d’identité lisible et non expirée.',
        'Selfie concordant (correspondance faciale 0,97).',
        'Aucune correspondance sur listes de sanctions ou PEP.'
      ],
      createdAt: '2026-01-14T09:22:00Z',
      updatedAt: '2026-01-14T11:40:00Z'
    },
    {
      id: 'kyc_0002',
      type: 'individual',
      name: 'Lucas Fontaine',
      country: 'FR',
      status: 'pending',
      riskScore: 22,
      pep: false,
      sanctionsHit: false,
      documents: ['carte_identite'],
      reasons: [
        'Dossier reçu, en file d’attente d’examen.',
        'Selfie non encore soumis.'
      ],
      createdAt: '2026-06-15T18:05:00Z',
      updatedAt: '2026-06-15T18:05:00Z'
    },
    {
      id: 'kyc_0003',
      type: 'individual',
      name: 'Inès Lefèvre',
      country: 'FR',
      status: 'in_review',
      riskScore: 41,
      pep: false,
      sanctionsHit: false,
      documents: ['carte_identite', 'selfie', 'justificatif_domicile'],
      reasons: [
        'Adresse déclarée différente de l’adresse du justificatif.',
        'Vérification manuelle de la concordance en cours.'
      ],
      createdAt: '2026-06-14T10:11:00Z',
      updatedAt: '2026-06-16T08:30:00Z'
    },
    {
      id: 'kyc_0004',
      type: 'individual',
      name: 'Mehdi Benali',
      country: 'MA',
      status: 'documents_required',
      riskScore: 47,
      pep: false,
      sanctionsHit: false,
      documents: ['passeport'],
      reasons: [
        'Justificatif de domicile manquant.',
        'Photo de la pièce floue — nouvelle capture demandée.'
      ],
      createdAt: '2026-06-12T14:48:00Z',
      updatedAt: '2026-06-15T09:12:00Z'
    },
    {
      id: 'kyc_0005',
      type: 'individual',
      name: 'Sofia Marchetti',
      country: 'IT',
      status: 'verified',
      riskScore: 14,
      pep: false,
      sanctionsHit: false,
      documents: ['carte_identite', 'selfie', 'justificatif_domicile'],
      reasons: [
        'Identité confirmée par le prestataire de vérification.',
        'Résidence dans un État membre de l’UE (faible risque).'
      ],
      createdAt: '2026-03-02T16:20:00Z',
      updatedAt: '2026-03-02T17:05:00Z'
    },
    {
      id: 'kyc_0006',
      type: 'individual',
      name: 'Yann Le Goff',
      country: 'FR',
      status: 'rejected',
      riskScore: 73,
      pep: false,
      sanctionsHit: false,
      documents: ['carte_identite', 'selfie'],
      reasons: [
        'Document d’identité suspecté d’altération.',
        'Selfie non concordant (correspondance faciale 0,38).',
        'Doublon probable avec un compte existant.'
      ],
      createdAt: '2026-05-21T11:33:00Z',
      updatedAt: '2026-05-22T09:48:00Z'
    },
    {
      id: 'kyc_0007',
      type: 'individual',
      name: 'Andrei Popescu',
      country: 'RO',
      status: 'escalated',
      riskScore: 88,
      pep: true,
      sanctionsHit: false,
      documents: ['passeport', 'selfie', 'justificatif_domicile'],
      reasons: [
        'Personne politiquement exposée (PEP) — vigilance renforcée.',
        'Origine des fonds à documenter (EDD requise).',
        'Escaladé à la conformité (AML/CFT).'
      ],
      createdAt: '2026-06-10T13:02:00Z',
      updatedAt: '2026-06-13T15:27:00Z'
    },
    {
      id: 'kyc_0008',
      type: 'individual',
      name: 'Dmitri Volkov',
      country: 'RU',
      status: 'escalated',
      riskScore: 96,
      pep: false,
      sanctionsHit: true,
      documents: ['passeport'],
      reasons: [
        'Correspondance possible sur liste de sanctions (UE/OFAC).',
        'Pays de résidence à haut risque AML.',
        'Gel préventif et signalement à la cellule de renseignement financier.'
      ],
      createdAt: '2026-06-09T07:14:00Z',
      updatedAt: '2026-06-09T08:01:00Z'
    },
    {
      id: 'kyc_0009',
      type: 'individual',
      name: 'Léa Dubois',
      country: 'FR',
      status: 'verified',
      riskScore: 11,
      pep: false,
      sanctionsHit: false,
      documents: ['carte_identite', 'selfie', 'justificatif_domicile'],
      reasons: [
        'Vérification standard validée sans réserve.',
        'Profil étudiant — flux financiers cohérents.'
      ],
      createdAt: '2026-02-18T19:40:00Z',
      updatedAt: '2026-02-18T20:02:00Z'
    },
    {
      id: 'kyc_0010',
      type: 'individual',
      name: 'Tomasz Kowalski',
      country: 'PL',
      status: 'on_hold',
      riskScore: 55,
      pep: false,
      sanctionsHit: false,
      documents: ['carte_identite', 'selfie'],
      reasons: [
        'Justificatif de domicile en cours de traduction certifiée.',
        'Dossier gelé en attente de l’élément externe.'
      ],
      createdAt: '2026-05-30T12:25:00Z',
      updatedAt: '2026-06-11T10:55:00Z'
    },
    {
      id: 'kyc_0011',
      type: 'individual',
      name: 'Marta Silva',
      country: 'PT',
      status: 'expired',
      riskScore: 19,
      pep: false,
      sanctionsHit: false,
      documents: ['carte_identite', 'selfie', 'justificatif_domicile'],
      reasons: [
        'Vérification de plus de 24 mois — ré-vérification périodique requise.',
        'Pièce d’identité arrivée à expiration.'
      ],
      createdAt: '2024-04-09T08:30:00Z',
      updatedAt: '2026-06-01T06:00:00Z'
    },
    {
      id: 'kyc_0012',
      type: 'individual',
      name: 'Hannah Müller',
      country: 'DE',
      status: 'in_review',
      riskScore: 33,
      pep: false,
      sanctionsHit: false,
      documents: ['passeport', 'selfie'],
      reasons: [
        'Contrôle de vivacité (liveness) à confirmer manuellement.',
        'Aucun signal négatif sur les listes de surveillance.'
      ],
      createdAt: '2026-06-13T09:50:00Z',
      updatedAt: '2026-06-16T07:18:00Z'
    },
    {
      id: 'kyc_0013',
      type: 'business',
      name: 'Atelier Lumen SAS',
      country: 'FR',
      status: 'verified',
      riskScore: 26,
      pep: false,
      sanctionsHit: false,
      documents: ['extrait_kbis', 'statuts', 'registre_ubo', 'piece_dirigeant'],
      reasons: [
        'Immatriculation vérifiée au registre du commerce.',
        'Bénéficiaires effectifs (UBO) identifiés et contrôlés.',
        'Activité (studio de design) cohérente avec les flux attendus.'
      ],
      createdAt: '2026-03-27T10:05:00Z',
      updatedAt: '2026-03-28T14:22:00Z'
    },
    {
      id: 'kyc_0014',
      type: 'business',
      name: 'Vilnius Trade UAB',
      country: 'LT',
      status: 'in_review',
      riskScore: 52,
      pep: false,
      sanctionsHit: false,
      documents: ['registre_societe', 'statuts', 'registre_ubo'],
      reasons: [
        'Structure d’actionnariat à clarifier (société holding intermédiaire).',
        'Justificatif de l’activité commerciale demandé.'
      ],
      createdAt: '2026-06-08T11:40:00Z',
      updatedAt: '2026-06-15T16:09:00Z'
    },
    {
      id: 'kyc_0015',
      type: 'business',
      name: 'Nordic Freelance OÜ',
      country: 'EE',
      status: 'documents_required',
      riskScore: 44,
      pep: false,
      sanctionsHit: false,
      documents: ['registre_societe', 'piece_dirigeant'],
      reasons: [
        'Registre des bénéficiaires effectifs (UBO) manquant.',
        'Statuts à jour non fournis.'
      ],
      createdAt: '2026-06-05T15:13:00Z',
      updatedAt: '2026-06-12T13:47:00Z'
    },
    {
      id: 'kyc_0016',
      type: 'business',
      name: 'Global Crypto Holdings Ltd',
      country: 'CY',
      status: 'escalated',
      riskScore: 91,
      pep: false,
      sanctionsHit: false,
      documents: ['registre_societe', 'statuts'],
      reasons: [
        'Secteur à haut risque (actifs numériques) — vigilance renforcée.',
        'Structure opaque, UBO non clairement identifiés.',
        'Escaladé à la conformité pour due diligence renforcée (EDD).'
      ],
      createdAt: '2026-05-19T09:28:00Z',
      updatedAt: '2026-06-04T10:33:00Z'
    },
    {
      id: 'kyc_0017',
      type: 'business',
      name: 'Café Lumen SARL',
      country: 'FR',
      status: 'pending',
      riskScore: 17,
      pep: false,
      sanctionsHit: false,
      documents: ['extrait_kbis'],
      reasons: [
        'Dossier d’entreprise reçu, en attente d’examen.',
        'Pièces UBO et dirigeant à venir.'
      ],
      createdAt: '2026-06-16T08:55:00Z',
      updatedAt: '2026-06-16T08:55:00Z'
    },
    {
      id: 'kyc_0018',
      type: 'business',
      name: 'Garnier Consulting EURL',
      country: 'FR',
      status: 'on_hold',
      riskScore: 38,
      pep: false,
      sanctionsHit: false,
      documents: ['extrait_kbis', 'statuts', 'piece_dirigeant'],
      reasons: [
        'Vérification de l’adresse du siège en cours auprès d’un tiers.',
        'Dossier gelé temporairement.'
      ],
      createdAt: '2026-06-02T17:36:00Z',
      updatedAt: '2026-06-10T12:14:00Z'
    }
  ];

})(typeof window !== 'undefined' ? window : this);
