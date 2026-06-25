/* NOVA — Mirror runtime des projections financières (3 ans, 3 scénarios)
 * ----------------------------------------------------------------------------
 * JS CLASSIQUE (pas de modules ES, doit marcher en file://).
 * Expose window.NovaData.financialProjections = {...} pour les pages internes
 * (ex. /admin/financials.html, /app-dashboard/*). MÊMES CHIFFRES que le modèle
 * canonique typé `data/financialProjections.ts` (mêmes hypothèses, même logique
 * de génération, mêmes noms de champs).
 *
 * ⚠️ Données 100 % fictives / hypothèses de travail. Projet Nova EN DÉVELOPPEMENT,
 * NON agréé auprès de la Banque de Lituanie. Aucun revenu réel.
 * Épargne « 7 % annualisé, sans exposition au marché » = OBJECTIF / hypothèse,
 * JAMAIS une garantie ; mécanisme à définir ; sous réserve des autorisations ;
 * NON intégrée aux revenus du modèle. Montants en EUR (€).
 *
 * Structure exposée :
 *   window.NovaData.financialProjections = {
 *     meta: { currency, horizonMonths, startMonthLabel, version, lastUpdated,
 *             disclaimer, savingsDisclaimer },
 *     scenarios: { prudent, central, ambitieux }
 *   }
 *   Chaque scénario : { scenario, label, assumptions[], monthly[], yearly[], funding }
 *   monthly[i] : { month, year, phase, endUsers, newUsers, activeUsers,
 *                  premiumShare, revenue{}, costs{}, ebitda, netCashFlow,
 *                  cumulativeCash, unitEconomics{} }
 *   yearly[i]  : { year, label, endUsers, activeUsers, revenue{}, costs{},
 *                  ebitda, netCashFlow, endCash, fundingRaised }
 *   funding    : { regulatoryCapital, totalFunding, avgMonthlyBurn, lowestCash,
 *                  lowestCashMonth, runwayMonthsAfterLastRaise, breakEvenMonth,
 *                  totalFundingNeed }
 */
(function (global) {
  'use strict';

  var ND = (global.NovaData = global.NovaData || {});

  /* --------------------------------------------------------------------------
   * Helpers de génération (identiques au modèle .ts)
   * ------------------------------------------------------------------------ */
  function interpUsers(prevEnd, targetEnd, monthInYear) {
    var ratio = targetEnd / Math.max(prevEnd, 1);
    var g = Math.pow(ratio, 1 / 12);
    return Math.round(prevEnd * Math.pow(g, monthInYear));
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function round(n) {
    return Math.round(n);
  }

  function buildScenario(id, p) {
    var monthly = [];
    var cum = 0;
    var prevEnd = 0;
    var yearStarts = [0, p.endUsersByYear[0], p.endUsersByYear[1]];

    for (var m = 1; m <= 36; m++) {
      var year = Math.ceil(m / 12);
      var miy = ((m - 1) % 12) + 1;
      var yIdx = year - 1;
      var t = miy / 12;

      var phase;
      if (m <= 9) phase = 'pre-agrement';
      else if (m <= 12) phase = 'soft-launch';
      else if (m <= 24) phase = 'lancement-fr';
      else phase = 'expansion-eee';

      var baseStart = yearStarts[yIdx];
      var endUsers = interpUsers(yIdx === 0 ? 1 : baseStart, p.endUsersByYear[yIdx], miy);
      var cappedEnd = Math.max(endUsers, prevEnd);
      var newUsers = Math.max(cappedEnd - prevEnd, 0);
      var activeRatio = lerp(
        yIdx === 0 ? 0 : p.activeRatioByYear[yIdx - 1],
        p.activeRatioByYear[yIdx],
        t
      );
      var activeUsers = round(cappedEnd * activeRatio);
      var premiumShare = lerp(
        yIdx === 0 ? 0 : p.premiumShareByYear[yIdx - 1],
        p.premiumShareByYear[yIdx],
        t
      );

      var cac = p.cacByYear[yIdx];
      var arpu = lerp(yIdx === 0 ? 0 : p.arpuByYear[yIdx - 1], p.arpuByYear[yIdx], t);

      // Revenus
      var gross = activeUsers * arpu;
      var subs = round(activeUsers * premiumShare * 7.99);
      var rem = Math.max(gross - subs, 0);
      var card = round(rem * 0.5);
      var fx = round(rem * 0.22);
      var sf = round(rem * 0.2);
      var float = round((Math.max(cum, 0) * 0.025) / 12);
      var revTotal = subs + card + fx + sf + float;

      // Coûts
      var fixed = p.fixedCostByYear[yIdx];
      var kyc = round(newUsers * 1.6);
      var infra = round(fixed * 0.18 + activeUsers * 0.12);
      var support = round(fixed * 0.12 + activeUsers * 0.05);
      var comp = round(fixed * 0.22 + activeUsers * 0.02);
      var fraud = round(gross * 0.012 + activeUsers * 0.01);
      var mkt = round(newUsers * cac + fixed * 0.1);
      var payroll = round(fixed * 0.32);
      var other = round(fixed * 0.06);
      var costTotal = kyc + infra + support + comp + fraud + mkt + payroll + other;

      var ebitda = revTotal - costTotal;
      var ncf = ebitda;

      var r = null;
      for (var fi = 0; fi < p.fundingRounds.length; fi++) {
        if (p.fundingRounds[fi].month === m) {
          r = p.fundingRounds[fi];
          break;
        }
      }
      var inj = r ? r.amount : 0;
      cum = round(cum + ncf + inj);

      var variableCost = kyc + mkt + fraud;
      var grossMarginPct = revTotal > 0 ? (revTotal - variableCost) / revTotal : 0;
      var ltv = round(arpu * p.avgLifetimeMonths * Math.max(grossMarginPct, 0.2));
      var ltvToCac = cac > 0 ? +(ltv / cac).toFixed(2) : 0;

      monthly.push({
        month: m,
        year: year,
        phase: phase,
        endUsers: cappedEnd,
        newUsers: newUsers,
        activeUsers: activeUsers,
        premiumShare: +premiumShare.toFixed(3),
        revenue: {
          subscriptions: subs,
          cardInterchange: card,
          fx: fx,
          serviceFees: sf,
          treasuryFloat: float,
          total: revTotal,
        },
        costs: {
          kyc: kyc,
          infrastructure: infra,
          support: support,
          compliance: comp,
          fraud: fraud,
          marketing: mkt,
          payroll: payroll,
          other: other,
          total: costTotal,
        },
        ebitda: ebitda,
        netCashFlow: ncf,
        cumulativeCash: cum,
        unitEconomics: {
          cac: cac,
          arpuMonthly: +arpu.toFixed(2),
          ltv: ltv,
          ltvToCac: ltvToCac,
          grossMarginPct: +grossMarginPct.toFixed(3),
        },
      });

      prevEnd = cappedEnd;
    }

    // Agrégats annuels
    var yearLabels = {
      1: 'An 1 (pré-agrément + soft-launch FR)',
      2: 'An 2 (lancement FR)',
      3: 'An 3 (expansion EEE)',
    };
    var yearly = [1, 2, 3].map(function (y) {
      var rows = monthly.filter(function (rr) {
        return rr.year === y;
      });
      var last = rows[rows.length - 1];
      function sumRev(k) {
        return round(
          rows.reduce(function (s, rr) {
            return s + rr.revenue[k];
          }, 0)
        );
      }
      function sumCost(k) {
        return round(
          rows.reduce(function (s, rr) {
            return s + rr.costs[k];
          }, 0)
        );
      }
      var revenue = {
        subscriptions: sumRev('subscriptions'),
        cardInterchange: sumRev('cardInterchange'),
        fx: sumRev('fx'),
        serviceFees: sumRev('serviceFees'),
        treasuryFloat: sumRev('treasuryFloat'),
        total: sumRev('total'),
      };
      var costs = {
        kyc: sumCost('kyc'),
        infrastructure: sumCost('infrastructure'),
        support: sumCost('support'),
        compliance: sumCost('compliance'),
        fraud: sumCost('fraud'),
        marketing: sumCost('marketing'),
        payroll: sumCost('payroll'),
        other: sumCost('other'),
        total: sumCost('total'),
      };
      var fundingRaised = round(
        p.fundingRounds
          .filter(function (rr) {
            return rr.month >= (y - 1) * 12 + 1 && rr.month <= y * 12;
          })
          .reduce(function (s, rr) {
            return s + rr.amount;
          }, 0)
      );
      return {
        year: y,
        label: yearLabels[y],
        endUsers: last.endUsers,
        activeUsers: last.activeUsers,
        revenue: revenue,
        costs: costs,
        ebitda: revenue.total - costs.total,
        netCashFlow: revenue.total - costs.total,
        endCash: last.cumulativeCash,
        fundingRaised: fundingRaised,
      };
    });

    // Profil de financement
    var lowest = monthly.reduce(function (mn, rr) {
      return rr.cumulativeCash < mn.cumulativeCash ? rr : mn;
    }, monthly[0]);
    var breakEven = null;
    for (var bi = 0; bi < monthly.length; bi++) {
      if (monthly[bi].ebitda >= 0) {
        breakEven = monthly[bi];
        break;
      }
    }
    var burnMonths = monthly.filter(function (rr) {
      return rr.netCashFlow < 0;
    });
    var avgMonthlyBurn = burnMonths.length
      ? round(
          burnMonths.reduce(function (s, rr) {
            return s + rr.netCashFlow;
          }, 0) / burnMonths.length
        )
      : 0;
    var totalFunding = round(
      p.fundingRounds.reduce(function (s, rr) {
        return s + rr.amount;
      }, 0)
    );
    var lastRaiseMonth = Math.max.apply(
      null,
      p.fundingRounds.map(function (rr) {
        return rr.month;
      })
    );
    var afterLast = monthly.filter(function (rr) {
      return rr.month >= lastRaiseMonth && rr.netCashFlow < 0;
    });
    var burnAfter = afterLast.length
      ? Math.abs(
          afterLast.reduce(function (s, rr) {
            return s + rr.netCashFlow;
          }, 0) / afterLast.length
        )
      : 0;
    var cashAtLastRaise = 0;
    for (var ci = 0; ci < monthly.length; ci++) {
      if (monthly[ci].month === lastRaiseMonth) {
        cashAtLastRaise = monthly[ci].cumulativeCash;
        break;
      }
    }
    var runwayMonthsAfterLastRaise = burnAfter > 0 ? round(cashAtLastRaise / burnAfter) : 99;

    var funding = {
      regulatoryCapital: p.regulatoryCapital,
      totalFunding: totalFunding,
      avgMonthlyBurn: avgMonthlyBurn,
      lowestCash: lowest.cumulativeCash,
      lowestCashMonth: lowest.month,
      runwayMonthsAfterLastRaise: runwayMonthsAfterLastRaise,
      breakEvenMonth: breakEven ? breakEven.month : null,
      totalFundingNeed: round(Math.max(-lowest.cumulativeCash, 0)),
    };

    return {
      scenario: id,
      label: p.label,
      assumptions: p.assumptions,
      monthly: monthly,
      yearly: yearly,
      funding: funding,
    };
  }

  /* --------------------------------------------------------------------------
   * Hypothèses paramétriques (IDENTIQUES au modèle .ts)
   * ------------------------------------------------------------------------ */
  var CENTRAL = {
    label: 'Central (cas de base)',
    assumptions: [
      'Agrément EMI obtenu en fin An 1 ; soft-launch FR M10–M12 sous réserve.',
      'Acquisition FR portée par bouche-à-oreille + marketing maîtrisé An 2.',
      'Passporting EEE activé An 3 (libre prestation de services dans l’EEE).',
      'Part premium croissante : carte métal + fonctionnalités avancées.',
      'Épargne « 7 % » NON intégrée aux revenus (objectif conditionnel, hors P&L).',
      'Capital réglementaire EMI immobilisé : 350 000 € (minimum EMD2).',
    ],
    endUsersByYear: [12000, 95000, 340000],
    activeRatioByYear: [0.6, 0.65, 0.68],
    premiumShareByYear: [0.1, 0.16, 0.22],
    cacByYear: [22, 26, 24],
    arpuByYear: [4.2, 6.1, 7.4],
    avgLifetimeMonths: 36,
    regulatoryCapital: 350000,
    fundingRounds: [
      { amount: 2200000, month: 1, label: 'Pre-seed / Seed (constitution, dossier EMI, capital)' },
      { amount: 7000000, month: 15, label: 'Série A (lancement FR, marketing, fonds propres)' },
      { amount: 18000000, month: 28, label: 'Série B (expansion EEE, scale)' },
    ],
    fixedCostByYear: [205000, 470000, 980000],
  };

  var PRUDENT = {
    label: 'Prudent (downside)',
    assumptions: [
      'Agrément EMI décalé ; soft-launch repoussé, burn pré-revenus prolongé.',
      'Acquisition plus lente et CAC plus élevé (marché concurrentiel).',
      'Expansion EEE prudente An 3 (un ou deux pays seulement).',
      'Part premium plus faible ; ARPU sous pression.',
      'Épargne « 7 % » hors revenus (objectif conditionnel, prudence renforcée).',
      'Besoin de runway supplémentaire pour absorber le retard d’agrément.',
    ],
    endUsersByYear: [6000, 42000, 150000],
    activeRatioByYear: [0.55, 0.6, 0.63],
    premiumShareByYear: [0.07, 0.11, 0.15],
    cacByYear: [30, 34, 31],
    arpuByYear: [3.4, 4.9, 6.0],
    avgLifetimeMonths: 30,
    regulatoryCapital: 350000,
    fundingRounds: [
      { amount: 2600000, month: 1, label: 'Pre-seed / Seed (allongé pour le retard d’agrément)' },
      { amount: 6000000, month: 18, label: 'Série A (lancement FR retardé)' },
      { amount: 12000000, month: 31, label: 'Série B (expansion prudente)' },
    ],
    fixedCostByYear: [195000, 410000, 760000],
  };

  var AMBITIEUX = {
    label: 'Ambitieux (upside)',
    assumptions: [
      'Agrément EMI rapide ; soft-launch FR dès M9, lancement plein An 2.',
      'Forte viralité (P2P Nova), CAC en baisse grâce au bouche-à-oreille.',
      'Expansion EEE multi-pays agressive An 3 (passporting large).',
      'Part premium élevée ; ARPU soutenu par carte métal + change.',
      'Épargne « 7 % » toujours hors revenus tant que le modèle n’est pas soutenable.',
      'Break-even mensuel atteignable en fin d’horizon dans ce scénario.',
    ],
    endUsersByYear: [22000, 180000, 720000],
    activeRatioByYear: [0.64, 0.7, 0.72],
    premiumShareByYear: [0.13, 0.2, 0.28],
    cacByYear: [18, 21, 19],
    arpuByYear: [4.9, 7.0, 8.6],
    avgLifetimeMonths: 42,
    regulatoryCapital: 350000,
    fundingRounds: [
      { amount: 2000000, month: 1, label: 'Pre-seed / Seed (efficient)' },
      { amount: 9000000, month: 13, label: 'Série A (lancement FR accéléré)' },
      { amount: 26000000, month: 26, label: 'Série B (scale EEE agressif)' },
    ],
    fixedCostByYear: [215000, 540000, 1180000],
  };

  /* --------------------------------------------------------------------------
   * Dataset exposé
   * ------------------------------------------------------------------------ */
  ND.financialProjections = {
    meta: {
      currency: 'EUR',
      horizonMonths: 36,
      startMonthLabel: '2026-09',
      version: '1.0 (draft)',
      lastUpdated: '2026-06-16',
      disclaimer:
        'Hypothèses de travail illustratives — projet Nova en développement, NON agréé auprès de la Banque de Lituanie. Ne constitue ni une prévision engageante ni un avis financier. À valider par un conseil qualifié.',
      savingsDisclaimer:
        'Épargne « 7 % annualisé, sans exposition au marché » = OBJECTIF / hypothèse, JAMAIS une garantie. Mécanisme à définir, sous réserve des autorisations. NON intégrée aux revenus du modèle tant que son modèle économique n’est pas soutenable.',
    },
    scenarios: {
      prudent: buildScenario('prudent', PRUDENT),
      central: buildScenario('central', CENTRAL),
      ambitieux: buildScenario('ambitieux', AMBITIEUX),
    },
  };

  /* --------------------------------------------------------------------------
   * Helpers runtime (optionnels, attachés au dataset)
   * ------------------------------------------------------------------------ */
  ND.financialProjectionsHelpers = {
    getScenario: function (id) {
      return ND.financialProjections.scenarios[id];
    },
    getYearly: function (id) {
      return ND.financialProjections.scenarios[id].yearly;
    },
    formatEUR: function (amount) {
      try {
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(amount);
      } catch (e) {
        return amount + ' €';
      }
    },
    totalRevenue: function (id) {
      return ND.financialProjections.scenarios[id].yearly.reduce(function (s, y) {
        return s + y.revenue.total;
      }, 0);
    },
    totalCosts: function (id) {
      return ND.financialProjections.scenarios[id].yearly.reduce(function (s, y) {
        return s + y.costs.total;
      }, 0);
    },
    fundingNeed: function (id) {
      return ND.financialProjections.scenarios[id].funding.totalFundingNeed;
    },
  };
})(typeof window !== 'undefined' ? window : this);
