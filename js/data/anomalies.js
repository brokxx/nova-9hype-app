/* NOVA — Mirror runtime des anomalies de sécurité / fraude
 * --------------------------------------------------------
 * JS CLASSIQUE (pas de modules ES, doit marcher en file://).
 * Expose window.NovaData.anomalies = [...] pour la page /admin/anomalies.html.
 *
 * Chaque objet reflète 1:1 le type AnomalyRecord (lib/anomaly-detection/types.ts) :
 *   { id, userId, type, score, level, reasons[], recommendedAction, status, createdAt }
 *
 * Niveaux : 'low' | 'medium' | 'high' | 'critical'
 * Statuts : 'open' | 'reviewing' | 'resolved' | 'dismissed'
 * Données 100 % fictives — projet NOVA en développement.
 */
(function (global) {
  'use strict';

  // Garantit l'existence du conteneur partagé sans écraser l'existant.
  var ND = global.NovaData = global.NovaData || {};

  ND.anomalies = [
    {
      id: 'anom_0001',
      userId: 'usr_2841',
      type: 'unusual_login',
      score: 85,
      level: 'critical',
      reasons: [
        'Connexion depuis un pays inhabituel (RU).',
        'Connexion depuis un appareil non reconnu.',
        'Connexion à une heure inhabituelle (3h).'
      ],
      recommendedAction: 'Bloquer le compte immédiatement et escalader à la conformité (AML/CFT).',
      status: 'open',
      createdAt: '2026-06-16T03:41:00Z'
    },
    {
      id: 'anom_0002',
      userId: 'usr_1190',
      type: 'repeated_failures',
      score: 80,
      level: 'critical',
      reasons: [
        '14 échecs de connexion en 5 min.',
        'Échecs répartis sur 6 adresses IP distinctes.',
        'Captcha déclenché — comportement automatisé probable.'
      ],
      recommendedAction: 'Bloquer le compte immédiatement et escalader à la conformité (AML/CFT).',
      status: 'reviewing',
      createdAt: '2026-06-15T22:08:00Z'
    },
    {
      id: 'anom_0003',
      userId: 'usr_3372',
      type: 'high_risk_profile',
      score: 92,
      level: 'critical',
      reasons: [
        'Correspondance possible avec une liste de sanctions.',
        'Identité non vérifiée (KYC incomplet).',
        'Résidence/opérations dans un pays à haut risque AML.'
      ],
      recommendedAction: 'Geler les fonds, signaler à la cellule de renseignement financier et escalader à la conformité.',
      status: 'open',
      createdAt: '2026-06-15T17:55:00Z'
    },
    {
      id: 'anom_0004',
      userId: 'usr_0457',
      type: 'suspicious_pattern',
      score: 78,
      level: 'high',
      reasons: [
        'Fractionnement de montants sous le seuil de déclaration (structuring).',
        '8 virements P2P rapides vers de nouveaux utilisateurs.',
        'Pic soudain de vélocité de paiement.'
      ],
      recommendedAction: 'Suspendre les opérations sensibles et exiger une ré-authentification forte.',
      status: 'open',
      createdAt: '2026-06-16T11:20:00Z'
    },
    {
      id: 'anom_0005',
      userId: 'usr_5021',
      type: 'unusual_activity',
      score: 64,
      level: 'high',
      reasons: [
        'Volume de transactions x7.0 vs habitude.',
        'Montant cumulé x8.4 vs habitude.',
        '5 nouveaux bénéficiaires créés en 24 h.'
      ],
      recommendedAction: 'Suspendre les opérations sensibles et exiger une ré-authentification forte.',
      status: 'reviewing',
      createdAt: '2026-06-16T08:02:00Z'
    },
    {
      id: 'anom_0006',
      userId: 'usr_6688',
      type: 'unusual_activity',
      score: 58,
      level: 'high',
      reasons: [
        'Montant cumulé x6.1 vs habitude.',
        'Majorité des transactions effectuées de nuit.'
      ],
      recommendedAction: 'Suspendre les opérations sensibles et exiger une ré-authentification forte.',
      status: 'open',
      createdAt: '2026-06-14T02:47:00Z'
    },
    {
      id: 'anom_0007',
      userId: 'usr_7734',
      type: 'unusual_login',
      score: 45,
      level: 'medium',
      reasons: [
        'Connexion depuis un pays inhabituel (ES).',
        'Connexion à une heure inhabituelle (4h).'
      ],
      recommendedAction: 'Demander une vérification supplémentaire (3-D Secure / OTP) et surveiller.',
      status: 'open',
      createdAt: '2026-06-16T04:15:00Z'
    },
    {
      id: 'anom_0008',
      userId: 'usr_2199',
      type: 'repeated_failures',
      score: 35,
      level: 'medium',
      reasons: [
        '5 échecs de connexion en 10 min.'
      ],
      recommendedAction: 'Demander une vérification supplémentaire (3-D Secure / OTP) et surveiller.',
      status: 'resolved',
      createdAt: '2026-06-13T19:30:00Z'
    },
    {
      id: 'anom_0009',
      userId: 'usr_8810',
      type: 'high_risk_profile',
      score: 49,
      level: 'medium',
      reasons: [
        'Personne politiquement exposée (PEP) — vigilance renforcée.',
        'Compte créé il y a moins de 7 jours.',
        '2 litiges/rejets antérieurs.'
      ],
      recommendedAction: 'Demander une vérification supplémentaire (3-D Secure / OTP) et surveiller.',
      status: 'reviewing',
      createdAt: '2026-06-12T14:10:00Z'
    },
    {
      id: 'anom_0010',
      userId: 'usr_3055',
      type: 'suspicious_pattern',
      score: 38,
      level: 'medium',
      reasons: [
        'Compte dormant soudainement très actif.',
        'Pic soudain de vélocité de paiement.'
      ],
      recommendedAction: 'Demander une vérification supplémentaire (3-D Secure / OTP) et surveiller.',
      status: 'open',
      createdAt: '2026-06-16T13:48:00Z'
    },
    {
      id: 'anom_0011',
      userId: 'usr_4412',
      type: 'unusual_login',
      score: 30,
      level: 'medium',
      reasons: [
        'Connexion depuis un appareil non reconnu.'
      ],
      recommendedAction: 'Demander une vérification supplémentaire (3-D Secure / OTP) et surveiller.',
      status: 'dismissed',
      createdAt: '2026-06-11T10:05:00Z'
    },
    {
      id: 'anom_0012',
      userId: 'usr_9001',
      type: 'unusual_activity',
      score: 22,
      level: 'low',
      reasons: [
        'Volume de transactions x3.0 vs habitude.'
      ],
      recommendedAction: 'Aucune action requise — journaliser pour suivi.',
      status: 'resolved',
      createdAt: '2026-06-10T16:22:00Z'
    },
    {
      id: 'anom_0013',
      userId: 'usr_1287',
      type: 'unusual_login',
      score: 15,
      level: 'low',
      reasons: [
        'Connexion à une heure inhabituelle (2h).'
      ],
      recommendedAction: 'Aucune action requise — journaliser pour suivi.',
      status: 'dismissed',
      createdAt: '2026-06-09T02:31:00Z'
    },
    {
      id: 'anom_0014',
      userId: 'usr_6543',
      type: 'high_risk_profile',
      score: 12,
      level: 'low',
      reasons: [
        'Compte créé il y a moins de 7 jours.'
      ],
      recommendedAction: 'Aucune action requise — journaliser pour suivi.',
      status: 'resolved',
      createdAt: '2026-06-08T09:44:00Z'
    },
    {
      id: 'anom_0015',
      userId: 'usr_7720',
      type: 'suspicious_pattern',
      score: 18,
      level: 'low',
      reasons: [
        'Pic soudain de vélocité de paiement.'
      ],
      recommendedAction: 'Aucune action requise — journaliser pour suivi.',
      status: 'open',
      createdAt: '2026-06-16T07:12:00Z'
    }
  ];

})(typeof window !== 'undefined' ? window : this);
