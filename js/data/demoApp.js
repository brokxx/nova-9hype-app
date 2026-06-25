/* NOVA — Mirror runtime des données de DÉMO de l'espace utilisateur
 * -----------------------------------------------------------------
 * JS CLASSIQUE (pas de modules ES, doit marcher en file://).
 * Expose window.NovaData.demoApp = { ... } pour les pages /app-dashboard/
 * et /dashboard/ (aperçu read-only du compte d'un utilisateur de démo).
 *
 * PROJET NOVA — future fintech / néobanque EN DÉVELOPPEMENT (non agréé).
 * Données 100 % FICTIVES. Cohérentes avec la DA et l'app cliquable
 * existante (js/bank.js) : solde ~8 412,50 €, épargne 12 480 €, objectif
 * « 7 % annualisé, sans exposition au marché » (HYPOTHÈSE, non garanti),
 * carte métal miroir verticale, virements P2P entre utilisateurs Nova.
 *
 * Structure :
 *   demoApp = {
 *     user, account, cards[], transactions[],
 *     budgetCategories[], securityEvents[], meta
 *   }
 * Montants en euros (number), horodatages ISO 8601 UTC (~2026).
 */
(function (global) {
  'use strict';

  var ND = global.NovaData = global.NovaData || {};

  ND.demoApp = {
    /* ---- titulaire de démo ---- */
    user: {
      id: 'usr_demo_0001',
      firstName: 'Camille',
      lastName: 'Moreau',
      email: 'camille.moreau@example.fr',
      country: 'FR',
      segment: 'salarie',
      plan: 'premium',
      memberSince: '2026-01-14T11:40:00Z'
    },

    /* ---- compte courant ---- */
    account: {
      id: 'acc_demo_0001',
      type: 'courant',
      currency: 'EUR',
      iban: 'LT60 3250 0000 0123 4567',
      bic: 'NOVALT2XXXX',
      balanceEUR: 8412.50,
      availableEUR: 8412.50,
      /* épargne — objectif 7 % annualisé, HYPOTHÈSE / non garanti */
      savingsEUR: 12480.00,
      savingsRate: 0.07,
      savingsRateLabel: '7 % annualisé (objectif, sans exposition au marché)',
      savingsDisclaimer: 'Objectif indicatif, non garanti. Mécanisme à définir, sous réserve des autorisations nécessaires.',
      updatedAt: '2026-06-16T08:00:00Z'
    },

    /* ---- cartes ---- */
    cards: [
      {
        id: 'card_demo_phys',
        type: 'physical',
        label: 'Carte Nova Métal',
        network: 'Mastercard',
        last4: '4417',
        expiry: '08/29',
        status: 'active',
        frozen: false,
        contactless: true,
        monthlyLimitEUR: 3000,
        monthlySpentEUR: 1240.18,
        design: 'metal-mirror-vertical',
        createdAt: '2026-01-16T10:00:00Z'
      },
      {
        id: 'card_demo_virt',
        type: 'virtual',
        label: 'Carte virtuelle — Abonnements',
        network: 'Mastercard',
        last4: '9082',
        expiry: '03/28',
        status: 'active',
        frozen: false,
        contactless: false,
        monthlyLimitEUR: 200,
        monthlySpentEUR: 42.98,
        design: 'virtual-green',
        createdAt: '2026-02-04T09:30:00Z'
      }
    ],

    /* ---- transactions récentes (cohérentes avec les seeds de bank.js) ---- */
    transactions: [
      {
        id: 'tx_demo_0001',
        kind: 'income',
        category: 'salaire',
        merchant: 'Acme Corp',
        label: 'Salaire',
        amountEUR: 3250.00,
        channel: 'sepa_in',
        cardId: null,
        status: 'completed',
        createdAt: '2026-06-13T07:02:00Z'
      },
      {
        id: 'tx_demo_0002',
        kind: 'expense',
        category: 'courses',
        merchant: 'Bio Market',
        label: 'Courses',
        amountEUR: -24.90,
        channel: 'card_payment',
        cardId: 'card_demo_phys',
        status: 'completed',
        createdAt: '2026-06-12T18:21:00Z'
      },
      {
        id: 'tx_demo_0003',
        kind: 'expense',
        category: 'cafes_restaurants',
        merchant: 'Café Lumen',
        label: 'Café',
        amountEUR: -4.20,
        channel: 'card_payment',
        cardId: 'card_demo_phys',
        status: 'completed',
        createdAt: '2026-06-12T09:14:00Z'
      },
      {
        id: 'tx_demo_0004',
        kind: 'transfer_out',
        category: 'virement_p2p',
        merchant: 'Léa Dubois',
        label: 'Virement envoyé · @lea',
        amountEUR: -40.00,
        channel: 'p2p_out',
        cardId: null,
        status: 'completed',
        createdAt: '2026-06-10T20:45:00Z'
      },
      {
        id: 'tx_demo_0005',
        kind: 'transfer_in',
        category: 'virement_p2p',
        merchant: 'Tom Garnier',
        label: 'Virement reçu · @tom',
        amountEUR: 1200.00,
        channel: 'p2p_in',
        cardId: null,
        status: 'completed',
        createdAt: '2026-06-05T12:30:00Z'
      },
      {
        id: 'tx_demo_0006',
        kind: 'expense',
        category: 'abonnements',
        merchant: 'Lumen Stream',
        label: 'Abonnement Streaming',
        amountEUR: -12.99,
        channel: 'card_payment',
        cardId: 'card_demo_virt',
        status: 'completed',
        createdAt: '2026-06-03T06:00:00Z'
      },
      {
        id: 'tx_demo_0007',
        kind: 'savings_out',
        category: 'epargne',
        merchant: 'Épargne Nova 7 %',
        label: 'Placement épargne',
        amountEUR: -500.00,
        channel: 'savings_deposit',
        cardId: null,
        status: 'completed',
        createdAt: '2026-06-02T08:10:00Z'
      },
      {
        id: 'tx_demo_0008',
        kind: 'expense',
        category: 'transport',
        merchant: 'RATP Mobilités',
        label: 'Navigo mensuel',
        amountEUR: -88.80,
        channel: 'card_payment',
        cardId: 'card_demo_phys',
        status: 'completed',
        createdAt: '2026-06-01T07:45:00Z'
      },
      {
        id: 'tx_demo_0009',
        kind: 'expense',
        category: 'logement',
        merchant: 'SCI Beaumarchais',
        label: 'Loyer juin',
        amountEUR: -1150.00,
        channel: 'sepa_out',
        cardId: null,
        status: 'completed',
        createdAt: '2026-06-01T06:05:00Z'
      },
      {
        id: 'tx_demo_0010',
        kind: 'expense',
        category: 'cafes_restaurants',
        merchant: 'Le Comptoir',
        label: 'Déjeuner',
        amountEUR: -18.50,
        channel: 'card_payment',
        cardId: 'card_demo_phys',
        status: 'completed',
        createdAt: '2026-05-30T13:02:00Z'
      },
      {
        id: 'tx_demo_0011',
        kind: 'expense',
        category: 'shopping',
        merchant: 'Atelier Lumen',
        label: 'Vêtements',
        amountEUR: -64.00,
        channel: 'card_payment',
        cardId: 'card_demo_phys',
        status: 'pending',
        createdAt: '2026-06-15T17:40:00Z'
      },
      {
        id: 'tx_demo_0012',
        kind: 'expense',
        category: 'abonnements',
        merchant: 'Spotiqo',
        label: 'Abonnement musique',
        amountEUR: -9.99,
        channel: 'card_payment',
        cardId: 'card_demo_virt',
        status: 'completed',
        createdAt: '2026-06-04T06:00:00Z'
      }
    ],

    /* ---- budget mensuel par catégorie (mois en cours) ---- */
    budgetCategories: [
      { id: 'bud_logement',  category: 'logement',           label: 'Logement',           icon: 'home',   budgetEUR: 1200, spentEUR: 1150.00, color: '#17171A' },
      { id: 'bud_courses',   category: 'courses',            label: 'Courses',            icon: 'cart',   budgetEUR: 400,  spentEUR: 286.40,  color: '#2FD96E' },
      { id: 'bud_resto',     category: 'cafes_restaurants',  label: 'Cafés & restaurants',icon: 'coffee', budgetEUR: 250,  spentEUR: 188.20,  color: '#C98A2B' },
      { id: 'bud_transport', category: 'transport',          label: 'Transport',          icon: 'card',   budgetEUR: 120,  spentEUR: 88.80,   color: '#3A6FF0' },
      { id: 'bud_abos',      category: 'abonnements',        label: 'Abonnements',        icon: 'card',   budgetEUR: 60,   spentEUR: 42.98,   color: '#8A5BD6' },
      { id: 'bud_shopping',  category: 'shopping',           label: 'Shopping',           icon: 'wallet', budgetEUR: 200,  spentEUR: 64.00,   color: '#D6605B' }
    ],

    /* ---- journal de sécurité du compte (côté utilisateur) ---- */
    securityEvents: [
      {
        id: 'sec_demo_0001',
        type: 'login',
        label: 'Connexion réussie',
        detail: 'iPhone 15 · Paris, FR · 192.168.x via Orange',
        status: 'ok',
        createdAt: '2026-06-16T07:58:00Z'
      },
      {
        id: 'sec_demo_0002',
        type: 'card_freeze',
        label: 'Carte virtuelle gelée',
        detail: 'Gel manuel depuis l’application',
        status: 'info',
        createdAt: '2026-06-14T22:10:00Z'
      },
      {
        id: 'sec_demo_0003',
        type: '3ds',
        label: 'Authentification 3-D Secure',
        detail: 'Validation d’un paiement de 64,00 € chez Atelier Lumen',
        status: 'ok',
        createdAt: '2026-06-15T17:41:00Z'
      },
      {
        id: 'sec_demo_0004',
        type: 'new_device',
        label: 'Nouvel appareil reconnu',
        detail: 'MacBook Air · Paris, FR — ajouté aux appareils de confiance',
        status: 'info',
        createdAt: '2026-06-11T09:25:00Z'
      },
      {
        id: 'sec_demo_0005',
        type: 'login_failed',
        label: 'Échec de connexion',
        detail: 'Mot de passe incorrect · 1 tentative · Paris, FR',
        status: 'warning',
        createdAt: '2026-06-09T19:03:00Z'
      },
      {
        id: 'sec_demo_0006',
        type: 'password_change',
        label: 'Mot de passe modifié',
        detail: 'Depuis les paramètres de sécurité',
        status: 'ok',
        createdAt: '2026-05-28T14:47:00Z'
      }
    ],

    /* ---- méta ---- */
    meta: {
      currency: 'EUR',
      locale: 'fr-FR',
      asOf: '2026-06-16T08:00:00Z',
      disclaimer: 'Espace de démonstration — projet NOVA en développement, non agréé. Données fictives.'
    }
  };

})(typeof window !== 'undefined' ? window : this);
