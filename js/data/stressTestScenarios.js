/* NOVA — Mirror runtime des scénarios de stress tests (résilience & conformité)
 * ----------------------------------------------------------------------------
 * JS CLASSIQUE (pas de modules ES, doit marcher en file://).
 * Expose window.NovaData.stressTestScenarios = [...] pour /admin/stress-tests.html.
 *
 * Chaque objet : {
 *   id, name, category, description,
 *   impact,            // description de l'impact business / fonds clients
 *   probability,       // 'low' | 'medium' | 'high'
 *   severity,          // 'low' | 'medium' | 'high' | 'critical'
 *   impactScore,       // 1..5 (ampleur)
 *   likelihoodScore,   // 1..5 (vraisemblance)
 *   actions,           // mesures d'atténuation / plan de continuité
 *   owner, status,     // status: 'planned' | 'running' | 'passed' | 'failed' | 'review'
 *   lastRunAt
 * }
 * Données 100 % fictives — projet NOVA en développement, sous réserve des
 * autorisations nécessaires (EMI auprès de la Banque de Lituanie).
 */
(function (global) {
  'use strict';

  var ND = global.NovaData = global.NovaData || {};

  ND.stressTestCategories = [
    'liquidite', 'safeguarding', 'operationnel', 'aml', 'cyber', 'marche', 'continuite'
  ];

  ND.stressTestCategoryLabels = {
    liquidite: 'Liquidité',
    safeguarding: 'Cantonnement des fonds',
    operationnel: 'Opérationnel',
    aml: 'AML / CFT',
    cyber: 'Cybersécurité',
    marche: 'Marché / épargne',
    continuite: 'Continuité d\'activité'
  };

  ND.stressTestScenarios = [
    {
      id: 'STR-0001',
      name: 'Retraits massifs simultanés (bank run)',
      category: 'liquidite',
      description: 'Demande de retrait de 60 % des fonds clients sur 48 h suite à une rumeur de marché.',
      impact: 'Tension de trésorerie sur les comptes de cantonnement ; risque de retard de règlement SEPA.',
      probability: 'low',
      severity: 'critical',
      impactScore: 5,
      likelihoodScore: 2,
      actions: 'Maintenir 100 % des fonds clients cantonnés et liquides ; lignes de liquidité de secours ; communication de crise.',
      owner: 'finance',
      status: 'passed',
      lastRunAt: '2026-05-28T09:00:00Z'
    },
    {
      id: 'STR-0002',
      name: 'Défaillance de la banque de cantonnement',
      category: 'safeguarding',
      description: 'Indisponibilité de l\'établissement teneur du compte de safeguarding pendant 72 h.',
      impact: 'Fonds clients momentanément inaccessibles ; obligation de continuité du safeguarding (règles EMI).',
      probability: 'low',
      severity: 'critical',
      impactScore: 5,
      likelihoodScore: 1,
      actions: 'Diversifier sur 2 banques partenaires ; convention de bascule ; reporting quotidien des soldes cantonnés.',
      owner: 'finance',
      status: 'review',
      lastRunAt: '2026-06-02T10:30:00Z'
    },
    {
      id: 'STR-0003',
      name: 'Panne majeure du cœur de paiement',
      category: 'operationnel',
      description: 'Indisponibilité du moteur de paiements (cartes + virements) pendant 4 h en heure de pointe.',
      impact: 'Paiements refusés, virements en file d\'attente, pic de contacts support.',
      probability: 'medium',
      severity: 'high',
      impactScore: 4,
      likelihoodScore: 3,
      actions: 'Architecture redondante multi-zone ; bascule automatique ; file de rejeu ; statut public.',
      owner: 'cto',
      status: 'passed',
      lastRunAt: '2026-06-08T14:00:00Z'
    },
    {
      id: 'STR-0004',
      name: 'Afflux d\'alertes AML (faux positifs)',
      category: 'aml',
      description: 'Multiplication par 10 du volume d\'alertes de monitoring sur 24 h.',
      impact: 'Saturation de l\'équipe MLRO ; risque de dépassement des délais de traitement et de déclaration.',
      probability: 'medium',
      severity: 'high',
      impactScore: 4,
      likelihoodScore: 3,
      actions: 'Priorisation par score de risque ; renfort d\'astreinte ; revue des règles pour réduire les faux positifs.',
      owner: 'mlro',
      status: 'running',
      lastRunAt: '2026-06-14T08:00:00Z'
    },
    {
      id: 'STR-0005',
      name: 'Attaque par déni de service (DDoS)',
      category: 'cyber',
      description: 'DDoS volumétrique ciblant l\'API et l\'application pendant 2 h.',
      impact: 'Indisponibilité de l\'app et de l\'espace client ; dégradation de l\'expérience.',
      probability: 'medium',
      severity: 'high',
      impactScore: 3,
      likelihoodScore: 3,
      actions: 'CDN + protection anti-DDoS ; limitation de débit ; WAF ; plan de réponse incident.',
      owner: 'security',
      status: 'passed',
      lastRunAt: '2026-06-10T11:00:00Z'
    },
    {
      id: 'STR-0006',
      name: 'Fuite de données personnelles',
      category: 'cyber',
      description: 'Exfiltration suspectée d\'un jeu de données clients (RGPD).',
      impact: 'Obligation de notification CNIL/autorité sous 72 h ; atteinte à la confiance ; sanctions possibles.',
      probability: 'low',
      severity: 'critical',
      impactScore: 5,
      likelihoodScore: 2,
      actions: 'Chiffrement au repos et en transit ; cloisonnement ; procédure de notification 72 h ; DPO mobilisé.',
      owner: 'dpo',
      status: 'review',
      lastRunAt: '2026-06-05T09:30:00Z'
    },
    {
      id: 'STR-0007',
      name: 'Choc sur l\'hypothèse de rendement épargne',
      category: 'marche',
      description: 'Le mécanisme visant l\'objectif « 7 % annualisé » ne tient pas ses hypothèses.',
      impact: 'Objectif (non garanti) non atteint ; risque de réclamations et d\'incompréhension client.',
      probability: 'medium',
      severity: 'medium',
      impactScore: 3,
      likelihoodScore: 3,
      actions: 'Communication claire « objectif, pas garantie » ; avertissement de risque systématique ; mécanisme à finaliser avant lancement.',
      owner: 'compliance',
      status: 'planned',
      lastRunAt: null
    },
    {
      id: 'STR-0008',
      name: 'Indisponibilité d\'un prestataire KYC',
      category: 'operationnel',
      description: 'Panne du fournisseur de vérification d\'identité (Veriff/Onfido) pendant 12 h.',
      impact: 'Onboarding bloqué ; accumulation de sessions KYC en attente.',
      probability: 'medium',
      severity: 'medium',
      impactScore: 3,
      likelihoodScore: 3,
      actions: 'Double fournisseur KYC ; file d\'attente persistante ; bascule manuelle de secours.',
      owner: 'compliance',
      status: 'passed',
      lastRunAt: '2026-06-09T15:00:00Z'
    },
    {
      id: 'STR-0009',
      name: 'Pic d\'inscriptions sur la liste d\'attente',
      category: 'continuite',
      description: 'Campagne virale : x7 d\'inscriptions sur 24 h.',
      impact: 'Charge sur l\'infrastructure de la landing et la file d\'onboarding.',
      probability: 'high',
      severity: 'low',
      impactScore: 2,
      likelihoodScore: 4,
      actions: 'Autoscaling ; mise en file d\'invitations progressive ; cache statique de la landing.',
      owner: 'growth',
      status: 'passed',
      lastRunAt: '2026-05-20T12:00:00Z'
    },
    {
      id: 'STR-0010',
      name: 'Perte d\'un site / sinistre majeur',
      category: 'continuite',
      description: 'Perte totale d\'une région cloud hébergeant les services principaux.',
      impact: 'Bascule du plan de reprise (PRA) ; objectif RTO/RPO à respecter.',
      probability: 'low',
      severity: 'high',
      impactScore: 4,
      likelihoodScore: 2,
      actions: 'Réplication multi-région ; sauvegardes testées ; PRA documenté et répété ; RTO < 4 h.',
      owner: 'cto',
      status: 'review',
      lastRunAt: '2026-06-01T07:00:00Z'
    },
    {
      id: 'STR-0011',
      name: 'Hausse soudaine de la fraude P2P',
      category: 'aml',
      description: 'Vague de fraude sur les virements P2P entre utilisateurs Nova.',
      impact: 'Pertes potentielles ; litiges ; risque réputationnel.',
      probability: 'medium',
      severity: 'high',
      impactScore: 4,
      likelihoodScore: 3,
      actions: 'Limites P2P dynamiques ; scoring temps réel ; gel automatique des comptes signalés ; 3-D Secure renforcé.',
      owner: 'mlro',
      status: 'failed',
      lastRunAt: '2026-06-12T16:00:00Z'
    },
    {
      id: 'STR-0012',
      name: 'Tension de capital réglementaire',
      category: 'liquidite',
      description: 'Croissance plus rapide que prévu nécessitant un renforcement des fonds propres EMI.',
      impact: 'Besoin de capital pour rester conforme aux exigences de l\'agrément visé.',
      probability: 'low',
      severity: 'medium',
      impactScore: 3,
      likelihoodScore: 2,
      actions: 'Suivi mensuel des fonds propres ; plan de financement ; trajectoire alignée sur les exigences EMI.',
      owner: 'finance',
      status: 'planned',
      lastRunAt: null
    }
  ];

})(typeof window !== 'undefined' ? window : this);
