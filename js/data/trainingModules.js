/* NOVA — Mirror runtime des modules de formation conformité
 * ----------------------------------------------------------------------------
 * JS CLASSIQUE (pas de modules ES, doit marcher en file://).
 * Expose window.NovaData.trainingModules = [...] pour /admin/training.html.
 *
 * Chaque module : {
 *   id, title, category, description,
 *   durationMin,        // durée estimée
 *   status,             // 'not_started' | 'in_progress' | 'completed' (fictif)
 *   progress,           // 0..100 (fictif)
 *   required,           // formation obligatoire ?
 *   quiz: {             // quiz fictif
 *     passScore,        // score minimal (sur 100)
 *     questions: [ { q, options[], answer } ]   // answer = index de la bonne réponse
 *   }
 * }
 * Données 100 % fictives — projet NOVA en développement. La progression et les
 * scores sont simulés et persistés localement (localStorage) côté page.
 */
(function (global) {
  'use strict';

  var ND = global.NovaData = global.NovaData || {};

  ND.trainingModules = [
    {
      id: 'TRN-0001',
      title: 'Fondamentaux AML / CFT',
      category: 'Conformité',
      description: 'Lutte contre le blanchiment et le financement du terrorisme : obligations, vigilance, déclaration de soupçon.',
      durationMin: 45,
      status: 'completed',
      progress: 100,
      required: true,
      quiz: {
        passScore: 70,
        questions: [
          {
            q: 'Que signifie l\'acronyme AML ?',
            options: ['Anti-Money Laundering', 'Account Management Layer', 'Annual Monetary Limit'],
            answer: 0
          },
          {
            q: 'À qui une déclaration de soupçon doit-elle remonter en interne ?',
            options: ['Au service marketing', 'Au MLRO (responsable conformité AML)', 'Au support client'],
            answer: 1
          },
          {
            q: 'Le fractionnement de montants sous un seuil de déclaration s\'appelle :',
            options: ['Le netting', 'Le structuring (schtroumpfage)', 'Le scoring'],
            answer: 1
          }
        ]
      }
    },
    {
      id: 'TRN-0002',
      title: 'KYC / KYB et vérification d\'identité',
      category: 'Conformité',
      description: 'Procédures d\'entrée en relation, niveaux de vigilance, vigilance renforcée (PEP, sanctions).',
      durationMin: 35,
      status: 'in_progress',
      progress: 60,
      required: true,
      quiz: {
        passScore: 70,
        questions: [
          {
            q: 'Un client PEP nécessite :',
            options: ['Aucune vigilance particulière', 'Une vigilance renforcée', 'Une clôture automatique'],
            answer: 1
          },
          {
            q: 'KYB concerne :',
            options: ['Les personnes physiques uniquement', 'Les entreprises (Know Your Business)', 'Les cartes virtuelles'],
            answer: 1
          }
        ]
      }
    },
    {
      id: 'TRN-0003',
      title: 'RGPD & protection des données',
      category: 'Données personnelles',
      description: 'Bases légales, droits des personnes, délais de réponse, notification de violation sous 72 h.',
      durationMin: 40,
      status: 'in_progress',
      progress: 25,
      required: true,
      quiz: {
        passScore: 70,
        questions: [
          {
            q: 'Délai de notification d\'une violation de données à l\'autorité :',
            options: ['72 heures', '30 jours', 'Immédiatement par voie de presse'],
            answer: 0
          },
          {
            q: 'Le droit à l\'effacement correspond à :',
            options: ['Article 15 RGPD', 'Article 17 RGPD', 'Article 6 RGPD'],
            answer: 1
          }
        ]
      }
    },
    {
      id: 'TRN-0004',
      title: 'Cadre EMI & PSD2 / EMD2',
      category: 'Réglementaire',
      description: 'Monnaie électronique, services de paiement, safeguarding des fonds, ambition de passporting UE.',
      durationMin: 50,
      status: 'not_started',
      progress: 0,
      required: true,
      quiz: {
        passScore: 70,
        questions: [
          {
            q: 'Une EMI est un établissement :',
            options: ['De Monnaie Électronique', 'd\'Investissement Mobilier', 'd\'Émission Monétaire d\'État'],
            answer: 0
          },
          {
            q: 'Le safeguarding consiste à :',
            options: ['Investir les fonds clients en bourse', 'Cantonner / ségréger les fonds clients', 'Garantir un rendement fixe'],
            answer: 1
          }
        ]
      }
    },
    {
      id: 'TRN-0005',
      title: 'Communication responsable sur l\'épargne',
      category: 'Conformité',
      description: 'Présenter l\'objectif « 7 % annualisé » comme une cible non garantie, avec avertissement de risque.',
      durationMin: 20,
      status: 'not_started',
      progress: 0,
      required: true,
      quiz: {
        passScore: 80,
        questions: [
          {
            q: 'L\'objectif « 7 % annualisé » doit être présenté comme :',
            options: ['Un rendement garanti', 'Une cible / hypothèse non garantie', 'Un taux réglementé'],
            answer: 1
          },
          {
            q: 'Toute communication épargne doit inclure :',
            options: ['Un avertissement de risque clair', 'Une promesse de gain', 'Rien de particulier'],
            answer: 0
          }
        ]
      }
    },
    {
      id: 'TRN-0006',
      title: 'Sécurité de l\'information',
      category: 'Sécurité',
      description: 'Hygiène numérique, phishing, gestion des accès, réponse à incident et anomalies.',
      durationMin: 30,
      status: 'completed',
      progress: 100,
      required: false,
      quiz: {
        passScore: 70,
        questions: [
          {
            q: 'Face à un e-mail suspect, il faut :',
            options: ['Cliquer pour vérifier', 'Le signaler à l\'équipe sécurité', 'Le transférer à tous'],
            answer: 1
          },
          {
            q: 'L\'authentification forte (SCA) sert à :',
            options: ['Accélérer les paiements', 'Renforcer la sécurité des accès et paiements', 'Réduire les frais'],
            answer: 1
          }
        ]
      }
    }
  ];

})(typeof window !== 'undefined' ? window : this);
