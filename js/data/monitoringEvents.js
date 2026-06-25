/* NOVA — Mirror runtime des événements de monitoring & alertes sécurité
 * ----------------------------------------------------------------------
 * JS CLASSIQUE (pas de modules ES, doit marcher en file://).
 * Expose window.NovaData.monitoringEvents = [...] pour les pages /admin/
 * (surveillance temps réel, sécurité, AML/CFT).
 *
 * PROJET NOVA — future fintech / néobanque EN DÉVELOPPEMENT (non agréé).
 * Données 100 % FICTIVES (contexte UE/Lituanie, ~2026).
 *
 * Chaque objet :
 *   {
 *     id,
 *     type      — nature de l'événement (voir ND.monitoringEventTypes),
 *     severity  — 'low' | 'medium' | 'high' | 'critical',
 *     message   — description lisible (FR),
 *     userId    — id de l'utilisateur concerné (ou null pour système),
 *     createdAt — ISO 8601 UTC,
 *     status    — 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'dismissed'
 *   }
 *
 * Couvre : connexion inhabituelle, tentatives répétées, transaction
 * inhabituelle, échec KYC répété, changement d'appareil, pays inhabituel,
 * vélocité de paiement, virement P2P suspect, structuring, etc.
 */
(function (global) {
  'use strict';

  var ND = global.NovaData = global.NovaData || {};

  ND.monitoringEventTypes = [
    'unusual_login',
    'repeated_login_failures',
    'unusual_transaction',
    'repeated_kyc_failure',
    'device_change',
    'unusual_country',
    'payment_velocity',
    'suspicious_p2p',
    'structuring',
    'card_fraud_suspected',
    'new_beneficiary',
    'sanctions_screening',
    'session_anomaly',
    'system'
  ];

  ND.monitoringStatuses = [
    'new',
    'acknowledged',
    'investigating',
    'resolved',
    'dismissed'
  ];

  ND.monitoringEvents = [
    {
      id: 'evt_0001',
      type: 'unusual_login',
      severity: 'critical',
      message: 'Connexion depuis la Russie (RU) sur un appareil non reconnu à 03:41.',
      userId: 'usr_2841',
      createdAt: '2026-06-16T03:41:00Z',
      status: 'investigating'
    },
    {
      id: 'evt_0002',
      type: 'repeated_login_failures',
      severity: 'critical',
      message: '14 échecs de connexion en 5 min depuis 6 adresses IP — credential stuffing probable.',
      userId: 'usr_1190',
      createdAt: '2026-06-15T22:08:00Z',
      status: 'investigating'
    },
    {
      id: 'evt_0003',
      type: 'sanctions_screening',
      severity: 'critical',
      message: 'Correspondance possible sur liste de sanctions UE lors du screening en temps réel.',
      userId: 'usr_3372',
      createdAt: '2026-06-15T17:55:00Z',
      status: 'new'
    },
    {
      id: 'evt_0004',
      type: 'structuring',
      severity: 'high',
      message: 'Fractionnement de virements sous le seuil de déclaration (8 opérations de 980 € en 2 h).',
      userId: 'usr_0457',
      createdAt: '2026-06-16T11:20:00Z',
      status: 'new'
    },
    {
      id: 'evt_0005',
      type: 'payment_velocity',
      severity: 'high',
      message: 'Vélocité de paiement x7 vs habitude — 5 nouveaux bénéficiaires créés en 24 h.',
      userId: 'usr_5021',
      createdAt: '2026-06-16T08:02:00Z',
      status: 'acknowledged'
    },
    {
      id: 'evt_0006',
      type: 'unusual_transaction',
      severity: 'high',
      message: 'Virement SEPA sortant de 9 400 € vers un IBAN non français jamais utilisé.',
      userId: 'usr_6688',
      createdAt: '2026-06-14T02:47:00Z',
      status: 'investigating'
    },
    {
      id: 'evt_0007',
      type: 'suspicious_p2p',
      severity: 'high',
      message: 'Réception puis renvoi quasi immédiat de fonds entre 4 utilisateurs Nova (schéma de mule).',
      userId: 'usr_4129',
      createdAt: '2026-06-16T09:36:00Z',
      status: 'investigating'
    },
    {
      id: 'evt_0008',
      type: 'card_fraud_suspected',
      severity: 'high',
      message: 'Carte virtuelle utilisée pour 3 paiements e-commerce refusés puis 1 accepté à l’étranger.',
      userId: 'usr_7411',
      createdAt: '2026-06-15T20:14:00Z',
      status: 'new'
    },
    {
      id: 'evt_0009',
      type: 'repeated_kyc_failure',
      severity: 'high',
      message: '4 tentatives de vérification KYC échouées (selfie non concordant) en 48 h.',
      userId: 'usr_8810',
      createdAt: '2026-06-13T14:10:00Z',
      status: 'acknowledged'
    },
    {
      id: 'evt_0010',
      type: 'unusual_country',
      severity: 'medium',
      message: 'Première connexion depuis l’Espagne (ES) pour un compte habituellement utilisé en France.',
      userId: 'usr_7734',
      createdAt: '2026-06-16T04:15:00Z',
      status: 'new'
    },
    {
      id: 'evt_0011',
      type: 'device_change',
      severity: 'medium',
      message: 'Changement d’appareil détecté (nouvel iPhone) sans ré-authentification forte.',
      userId: 'usr_2199',
      createdAt: '2026-06-15T19:30:00Z',
      status: 'acknowledged'
    },
    {
      id: 'evt_0012',
      type: 'new_beneficiary',
      severity: 'medium',
      message: 'Ajout d’un bénéficiaire SEPA suivi d’un virement de 2 200 € dans les 10 minutes.',
      userId: 'usr_3055',
      createdAt: '2026-06-16T13:48:00Z',
      status: 'new'
    },
    {
      id: 'evt_0013',
      type: 'unusual_login',
      severity: 'medium',
      message: 'Connexion à 04:12 — horaire inhabituel pour ce profil.',
      userId: 'usr_4412',
      createdAt: '2026-06-16T04:12:00Z',
      status: 'new'
    },
    {
      id: 'evt_0014',
      type: 'payment_velocity',
      severity: 'medium',
      message: 'Pic de 6 paiements carte en 9 minutes chez des marchands distincts.',
      userId: 'usr_9001',
      createdAt: '2026-06-16T12:05:00Z',
      status: 'acknowledged'
    },
    {
      id: 'evt_0015',
      type: 'session_anomaly',
      severity: 'medium',
      message: 'Deux sessions actives simultanées depuis deux pays différents (FR et DE).',
      userId: 'usr_5566',
      createdAt: '2026-06-15T16:48:00Z',
      status: 'investigating'
    },
    {
      id: 'evt_0016',
      type: 'unusual_transaction',
      severity: 'medium',
      message: 'Dépôt de 4 800 € sur un compte habituellement crédité par salaire mensuel.',
      userId: 'usr_6321',
      createdAt: '2026-06-14T10:22:00Z',
      status: 'acknowledged'
    },
    {
      id: 'evt_0017',
      type: 'repeated_login_failures',
      severity: 'medium',
      message: '5 échecs de connexion en 10 min puis succès au 6e essai.',
      userId: 'usr_2199',
      createdAt: '2026-06-13T19:30:00Z',
      status: 'resolved'
    },
    {
      id: 'evt_0018',
      type: 'device_change',
      severity: 'low',
      message: 'Connexion depuis un nouveau navigateur, même ville et même opérateur.',
      userId: 'usr_1287',
      createdAt: '2026-06-12T08:51:00Z',
      status: 'resolved'
    },
    {
      id: 'evt_0019',
      type: 'unusual_login',
      severity: 'low',
      message: 'Connexion à 02:31 depuis l’appareil habituel — simple horaire tardif.',
      userId: 'usr_1287',
      createdAt: '2026-06-09T02:31:00Z',
      status: 'dismissed'
    },
    {
      id: 'evt_0020',
      type: 'unusual_country',
      severity: 'low',
      message: 'Connexion depuis le Portugal (PT) pendant une période de congés déclarée.',
      userId: 'usr_6543',
      createdAt: '2026-06-08T09:44:00Z',
      status: 'dismissed'
    },
    {
      id: 'evt_0021',
      type: 'new_beneficiary',
      severity: 'low',
      message: 'Ajout d’un bénéficiaire P2P Nova (Léa Dubois) sans virement immédiat.',
      userId: 'usr_7720',
      createdAt: '2026-06-16T07:12:00Z',
      status: 'new'
    },
    {
      id: 'evt_0022',
      type: 'payment_velocity',
      severity: 'low',
      message: 'Volume de transactions x3 vs habitude — week-end de soldes.',
      userId: 'usr_9001',
      createdAt: '2026-06-10T16:22:00Z',
      status: 'resolved'
    },
    {
      id: 'evt_0023',
      type: 'session_anomaly',
      severity: 'low',
      message: 'Expiration de session forcée après inactivité prolongée — reconnexion normale.',
      userId: 'usr_3372',
      createdAt: '2026-06-11T13:05:00Z',
      status: 'dismissed'
    },
    {
      id: 'evt_0024',
      type: 'repeated_kyc_failure',
      severity: 'medium',
      message: '3 soumissions KYC rejetées pour pièce illisible avant succès.',
      userId: 'usr_4129',
      createdAt: '2026-06-07T11:18:00Z',
      status: 'resolved'
    },
    {
      id: 'evt_0025',
      type: 'card_fraud_suspected',
      severity: 'medium',
      message: 'Tentative de paiement carte bloquée par 3-D Secure sur site marchand inconnu.',
      userId: 'usr_7411',
      createdAt: '2026-06-12T21:47:00Z',
      status: 'resolved'
    },
    {
      id: 'evt_0026',
      type: 'unusual_transaction',
      severity: 'low',
      message: 'Premier virement vers un compte épargne externe — montant modéré (250 €).',
      userId: 'usr_6321',
      createdAt: '2026-06-06T10:02:00Z',
      status: 'dismissed'
    },
    {
      id: 'evt_0027',
      type: 'system',
      severity: 'medium',
      message: 'Latence élevée sur le service de screening sanctions (file d’attente > 90 s).',
      userId: null,
      createdAt: '2026-06-16T05:30:00Z',
      status: 'investigating'
    },
    {
      id: 'evt_0028',
      type: 'system',
      severity: 'high',
      message: 'Échec de réconciliation du compte de cantonnement (safeguarding) — écart de 1 240 €.',
      userId: null,
      createdAt: '2026-06-15T23:50:00Z',
      status: 'investigating'
    },
    {
      id: 'evt_0029',
      type: 'device_change',
      severity: 'medium',
      message: 'Réinitialisation du mot de passe suivie d’un changement d’appareil dans l’heure.',
      userId: 'usr_5566',
      createdAt: '2026-06-14T18:09:00Z',
      status: 'acknowledged'
    },
    {
      id: 'evt_0030',
      type: 'structuring',
      severity: 'high',
      message: 'Dépôts répétés de 1 900 € en espèces équivalent via partenaires sur 3 jours.',
      userId: 'usr_0457',
      createdAt: '2026-06-13T09:41:00Z',
      status: 'investigating'
    }
  ];

})(typeof window !== 'undefined' ? window : this);
