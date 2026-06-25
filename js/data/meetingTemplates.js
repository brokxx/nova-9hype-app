/* NOVA — Mirror runtime des modèles de réunion (ordres du jour & comptes rendus)
 * ----------------------------------------------------------------------------
 * JS CLASSIQUE (pas de modules ES, doit marcher en file://).
 * Expose window.NovaData.meetingTemplates = [...] pour les pages internes
 * (gouvernance, préparation régulateur, comités risque/conformité).
 *
 * Chaque modèle : {
 *   id,                 // identifiant stable (ex. 'MTG-REGULATOR')
 *   type,               // 'generic'|'regulator'|'investor'|'partner'|'risk'|'compliance'
 *   title,              // titre lisible (FR)
 *   objective,          // objectif de la réunion (le « pourquoi »)
 *   audience,           // public / instance destinataire
 *   cadence,            // cadence de tenue
 *   durationMin,        // durée totale indicative (minutes)
 *   owner,              // fonction qui anime
 *   confidentiality,    // sensibilité documentaire
 *   participants,       // [{ role, required, side, reason }]
 *   agendaItems,        // [{ order, title, purpose, kind, durationMin, presenter }]  (points à discuter)
 *   decisions,          // [{ topic, decisionMaker, rationale }]
 *   documentsToPrepare, // [{ name, owner, reference }]
 *   questions,          // [string]  (questions clés)
 *   postMeetingActions, // [{ description, owner, dueInDays }]
 *   agendaDoc,          // gabarit Markdown d'ordre du jour
 *   minutesDoc          // modèle de compte rendu
 * }
 *
 * PROJET NOVA — future fintech / néobanque EN DÉVELOPPEMENT, NON AGRÉÉE.
 * Intention : UAB en Lituanie + licence EMI auprès de la Banque de Lituanie
 * (Lietuvos bankas), cadre UE EMD2/PSD2, RGPD, AML 4e/5e/6e + loi AML/CFT
 * lituanienne, safeguarding. L'épargne « 7 % annualisé, sans exposition au
 * marché » est traitée comme un OBJECTIF/hypothèse avec avertissement de
 * risque, jamais une garantie. Données fictives — maquette de backoffice.
 */
(function (global) {
  'use strict';

  var ND = global.NovaData = global.NovaData || {};

  ND.meetingTemplates = [
    {
      id: 'MTG-GENERIC',
      type: 'generic',
      title: 'Réunion — gabarit générique',
      objective: 'Cadre réutilisable pour toute réunion Nova : objectif clair, points à discuter, décisions et actions de suivi traçables, en cohérence avec la gouvernance d\'un futur EMI lituanien.',
      audience: 'internal',
      cadence: 'on-demand',
      durationMin: 60,
      owner: 'COO',
      confidentiality: 'internal',
      participants: [
        { role: 'Animateur / propriétaire', required: true, side: 'internal', reason: 'Cadre l\'objectif, tient le temps, conclut.' },
        { role: 'Secrétaire de séance', required: true, side: 'internal', reason: 'Rédige le compte rendu (décisions + actions).' },
        { role: 'Responsables des points', required: true, side: 'internal', reason: 'Présentent et répondent aux questions.' }
      ],
      agendaItems: [
        { order: 1, title: 'Ouverture & objectif', purpose: 'Rappeler le « pourquoi » et le résultat attendu.', kind: 'info', durationMin: 5, presenter: 'COO' },
        { order: 2, title: 'Revue des actions précédentes', purpose: 'Vérifier l\'avancement des actions de la dernière réunion.', kind: 'info', durationMin: 10, presenter: 'COO' },
        { order: 3, title: 'Points à discuter', purpose: 'Traiter les sujets de fond inscrits à l\'ordre du jour.', kind: 'discussion', durationMin: 30, presenter: 'Responsables' },
        { order: 4, title: 'Décisions', purpose: 'Acter les décisions et leurs responsables.', kind: 'decision', durationMin: 10, presenter: 'COO' },
        { order: 5, title: 'Actions & clôture', purpose: 'Assigner les actions de suivi avec échéances.', kind: 'decision', durationMin: 5, presenter: 'COO' }
      ],
      decisions: [
        { topic: 'Validation des actions de suivi', decisionMaker: 'Animateur', rationale: 'Garantir un suivi traçable et responsabilisé.' }
      ],
      documentsToPrepare: [
        { name: 'Ordre du jour diffusé en amont', owner: 'COO', reference: 'docs/meetings/meeting-agenda-template.md' },
        { name: 'Relevé d\'actions de la réunion précédente', owner: 'Secrétaire de séance' }
      ],
      questions: [
        'Quel est le résultat concret attendu de cette réunion ?',
        'Les actions précédentes sont-elles soldées ? Sinon, quel blocage ?',
        'Chaque décision a-t-elle un responsable et une échéance ?'
      ],
      postMeetingActions: [
        { description: 'Diffuser le compte rendu (décisions + actions).', owner: 'Secrétaire de séance', dueInDays: 2 },
        { description: 'Mettre à jour le suivi d\'actions.', owner: 'COO', dueInDays: 2 }
      ],
      agendaDoc: 'docs/meetings/meeting-agenda-template.md',
      minutesDoc: 'docs/meetings/meeting-minutes-template.md'
    },
    {
      id: 'MTG-REGULATOR',
      type: 'regulator',
      title: 'Réunion régulateur — Banque de Lituanie (visé)',
      objective: 'Présenter le projet Nova et l\'avancement du dossier EMI à la Banque de Lituanie, recueillir ses attentes (EMD2/PSD2/AML/safeguarding). Projet non agréé : échange préparatoire / pré-application.',
      audience: 'regulator',
      cadence: 'on-demand',
      durationMin: 90,
      owner: 'CEO',
      confidentiality: 'confidential',
      participants: [
        { role: 'CEO Nova', required: true, side: 'internal', reason: 'Porte la vision et l\'engagement de l\'organe de direction.' },
        { role: 'Compliance Officer', required: true, side: 'internal', reason: 'Répond sur le dispositif de conformité et le dossier EMI.' },
        { role: 'MLRO', required: true, side: 'internal', reason: 'Présente le dispositif AML/CFT.' },
        { role: 'CFO', required: true, side: 'internal', reason: 'Présente le capital, le safeguarding et les projections.' },
        { role: 'Représentant Banque de Lituanie (Lietuvos bankas)', required: true, side: 'external', reason: 'Exprime les attentes et exigences réglementaires.' }
      ],
      agendaItems: [
        { order: 1, title: 'Présentation du projet Nova', purpose: 'Positionnement, périmètre, cible (particuliers UE). Rappeler que Nova est non agréé.', kind: 'info', durationMin: 10, presenter: 'CEO' },
        { order: 2, title: 'Structure & gouvernance', purpose: 'UAB lituanienne, organe de direction, fit & proper.', kind: 'info', durationMin: 10, presenter: 'CEO' },
        { order: 3, title: 'Dispositif de conformité', purpose: 'Cartographie EMD2/PSD2/RGPD, politiques, contrôle interne.', kind: 'discussion', durationMin: 15, presenter: 'Compliance Officer' },
        { order: 4, title: 'Dispositif AML/CFT', purpose: 'KYC/KYB, monitoring, filtrage sanctions/PEP, SAR, approche par les risques.', kind: 'discussion', durationMin: 15, presenter: 'MLRO' },
        { order: 5, title: 'Capital & safeguarding', purpose: 'Capital initial, cantonnement des fonds clients, projections.', kind: 'discussion', durationMin: 15, presenter: 'CFO' },
        { order: 6, title: 'Produit épargne « 7 % »', purpose: 'OBJECTIF/hypothèse avec avertissement de risque, mécanisme à définir, jamais garanti.', kind: 'discussion', durationMin: 10, presenter: 'Compliance Officer' },
        { order: 7, title: 'Calendrier & attentes', purpose: 'Jalons de pré-application, pièces attendues, prochaines étapes.', kind: 'discussion', durationMin: 15, presenter: 'CEO' }
      ],
      decisions: [
        { topic: 'Périmètre de la demande EMI (services PSD2)', decisionMaker: 'Conseil Nova (à acter en interne)', rationale: 'Cadrer le périmètre de licence avant dépôt.' },
        { topic: 'Calendrier de pré-application', decisionMaker: 'CEO / Banque de Lituanie', rationale: 'Fixer jalons et liste des pièces.' }
      ],
      documentsToPrepare: [
        { name: 'Note de présentation du projet (deck)', owner: 'CEO' },
        { name: 'Programme d\'activités & business plan', owner: 'CFO', reference: 'docs/business-plan' },
        { name: 'Cartographie réglementaire & politiques', owner: 'Compliance Officer', reference: 'docs/policies' },
        { name: 'Programme AML/CFT', owner: 'MLRO', reference: 'docs/kyc' },
        { name: 'Note safeguarding & projections', owner: 'CFO', reference: 'docs/financial-projections' },
        { name: 'Questions anticipées du régulateur', owner: 'Compliance Officer', reference: 'docs/regulator-preparation/regulator-questions.md' }
      ],
      questions: [
        'Quelles pièces la Banque de Lituanie attend-elle à la pré-application ?',
        'Quel périmètre de services de paiement (PSD2) est cohérent ?',
        'Quelles attentes sur le safeguarding et le capital initial ?',
        'Comment présenter l\'objectif « 7 % » sans risque de message trompeur ?',
        'Quel délai d\'instruction et quels points de vigilance fréquents ?'
      ],
      postMeetingActions: [
        { description: 'Rédiger un compte rendu factuel et l\'archiver au dossier EMI.', owner: 'Compliance Officer', dueInDays: 2 },
        { description: 'Mettre à jour la liste des pièces et le calendrier de pré-application.', owner: 'CEO', dueInDays: 5 },
        { description: 'Lancer la remédiation des écarts identifiés.', owner: 'Compliance Officer', dueInDays: 10 }
      ],
      agendaDoc: 'docs/meetings/regulator-meeting-agenda.md',
      minutesDoc: 'docs/meetings/meeting-minutes-template.md'
    },
    {
      id: 'MTG-INVESTOR',
      type: 'investor',
      title: 'Réunion investisseurs',
      objective: 'Présenter la thèse, la traction et la trajectoire réglementaire de Nova (UAB, EMI visé), aligner sur le financement et les jalons. Honnêteté : projet non agréé, épargne « 7 % » = objectif avec avertissement de risque.',
      audience: 'investors',
      cadence: 'quarterly',
      durationMin: 75,
      owner: 'CEO',
      confidentiality: 'confidential',
      participants: [
        { role: 'CEO Nova', required: true, side: 'internal', reason: 'Porte la vision et la stratégie.' },
        { role: 'CFO', required: true, side: 'internal', reason: 'Présente chiffres, financement et projections.' },
        { role: 'Compliance Officer', required: false, side: 'internal', reason: 'Répond sur le statut réglementaire.' },
        { role: 'Investisseurs / actionnaires', required: true, side: 'external', reason: 'Évaluent l\'opportunité et la trajectoire.' }
      ],
      agendaItems: [
        { order: 1, title: 'Vision & problème adressé', purpose: 'Mission et cible (particuliers UE).', kind: 'info', durationMin: 10, presenter: 'CEO' },
        { order: 2, title: 'Produit & traction', purpose: 'Périmètre, liste d\'attente, métriques.', kind: 'info', durationMin: 15, presenter: 'CEO' },
        { order: 3, title: 'Statut réglementaire', purpose: 'UAB, EMI visé — projet non agréé, jalons.', kind: 'discussion', durationMin: 10, presenter: 'Compliance Officer' },
        { order: 4, title: 'Modèle économique & projections', purpose: 'Revenus, unit economics, runway, hypothèses.', kind: 'discussion', durationMin: 15, presenter: 'CFO' },
        { order: 5, title: 'Épargne « 7 % » — cadrage honnête', purpose: 'Objectif/hypothèse avec avertissement de risque, mécanisme à définir, jamais garanti.', kind: 'discussion', durationMin: 10, presenter: 'CFO' },
        { order: 6, title: 'Financement & jalons', purpose: 'Montant, valorisation, usage des fonds, jalons jusqu\'à l\'agrément.', kind: 'decision', durationMin: 15, presenter: 'CEO' }
      ],
      decisions: [
        { topic: 'Conditions indicatives du tour', decisionMaker: 'CEO / investisseurs (term sheet à formaliser)', rationale: 'Aligner avant due diligence.' },
        { topic: 'Étapes de due diligence', decisionMaker: 'CEO / investisseurs', rationale: 'Cadrer accès aux données et calendrier.' }
      ],
      documentsToPrepare: [
        { name: 'Pitch deck investisseurs', owner: 'CEO' },
        { name: 'Modèle financier & projections', owner: 'CFO', reference: 'docs/financial-projections' },
        { name: 'Note de statut réglementaire (rappel : non agréé)', owner: 'Compliance Officer' },
        { name: 'Cap table & plan de financement', owner: 'CFO' }
      ],
      questions: [
        'Quel usage des fonds et quel runway jusqu\'à l\'agrément ?',
        'Comment les hypothèses des projections sont-elles étayées ?',
        'Quels risques d\'exécution et réglementaires majeurs ?',
        'Comment l\'objectif « 7 % » est-il financé et pourquoi pas garanti ?',
        'Quels jalons conditionnent la prochaine étape de financement ?'
      ],
      postMeetingActions: [
        { description: 'Envoyer le suivi (deck, data room, réponses).', owner: 'CEO', dueInDays: 3 },
        { description: 'Mettre à jour le modèle financier selon les retours.', owner: 'CFO', dueInDays: 7 },
        { description: 'Préparer la data room de due diligence.', owner: 'CFO', dueInDays: 10 }
      ],
      agendaDoc: 'docs/meetings/investor-meeting-agenda.md',
      minutesDoc: 'docs/meetings/meeting-minutes-template.md'
    },
    {
      id: 'MTG-PARTNER',
      type: 'partner',
      title: 'Réunion partenaire',
      objective: 'Cadrer une relation partenaire (BaaS/BIN sponsor, KYC, processeur, carte…) : périmètre, conformité, sécurité, SLA et responsabilités, en cohérence avec les exigences d\'externalisation d\'un futur EMI.',
      audience: 'partners',
      cadence: 'on-demand',
      durationMin: 60,
      owner: 'Head of Partnerships',
      confidentiality: 'confidential',
      participants: [
        { role: 'Head of Partnerships', required: true, side: 'internal', reason: 'Pilote la relation et la négociation.' },
        { role: 'Compliance Officer', required: true, side: 'internal', reason: 'Évalue la conformité et la due diligence.' },
        { role: 'CISO', required: false, side: 'internal', reason: 'Évalue la sécurité et la protection des données.' },
        { role: 'DPO', required: false, side: 'internal', reason: 'Cadre le traitement des données (RGPD).' },
        { role: 'Représentants du partenaire', required: true, side: 'external', reason: 'Présentent leur offre et engagements.' }
      ],
      agendaItems: [
        { order: 1, title: 'Présentation mutuelle', purpose: 'Contexte Nova (non agréé) et offre du partenaire.', kind: 'info', durationMin: 10, presenter: 'Head of Partnerships' },
        { order: 2, title: 'Périmètre de la collaboration', purpose: 'Services, intégration, dépendances, calendrier.', kind: 'discussion', durationMin: 15, presenter: 'Head of Partnerships' },
        { order: 3, title: 'Conformité & due diligence', purpose: 'Agréments du partenaire, AML, sanctions, sous-traitance.', kind: 'discussion', durationMin: 10, presenter: 'Compliance Officer' },
        { order: 4, title: 'Sécurité & données', purpose: 'Sécurité, RGPD, localisation, continuité, réversibilité.', kind: 'discussion', durationMin: 10, presenter: 'CISO' },
        { order: 5, title: 'SLA & responsabilités', purpose: 'SLA, support, responsabilités, audit, sortie.', kind: 'decision', durationMin: 10, presenter: 'Head of Partnerships' },
        { order: 6, title: 'Prochaines étapes', purpose: 'Pilote, contractualisation, points ouverts.', kind: 'decision', durationMin: 5, presenter: 'Head of Partnerships' }
      ],
      decisions: [
        { topic: 'Poursuite vers contractualisation / pilote', decisionMaker: 'Head of Partnerships + Compliance Officer', rationale: 'Valider adéquation et conformité avant engagement.' },
        { topic: 'Clauses critiques (audit, réversibilité, données)', decisionMaker: 'Compliance Officer / DPO', rationale: 'Sécuriser l\'externalisation (exigences EMI).' }
      ],
      documentsToPrepare: [
        { name: 'Fiche de cadrage du besoin', owner: 'Head of Partnerships' },
        { name: 'Questionnaire de due diligence partenaire', owner: 'Compliance Officer', reference: 'docs/policies' },
        { name: 'Exigences sécurité & RGPD (annexe sous-traitance)', owner: 'CISO' },
        { name: 'Grille SLA / réversibilité', owner: 'Head of Partnerships' }
      ],
      questions: [
        'Le partenaire est-il agréé / habilité pour les services concernés ?',
        'Comment les données clients sont-elles traitées et localisées (RGPD) ?',
        'Quelles garanties d\'audit, de continuité et de réversibilité ?',
        'Comment les responsabilités AML/sanctions se répartissent-elles ?',
        'L\'externalisation respecte-t-elle les attentes d\'un futur EMI ?'
      ],
      postMeetingActions: [
        { description: 'Compléter la due diligence et l\'évaluation des risques fournisseur.', owner: 'Compliance Officer', dueInDays: 10 },
        { description: 'Rédiger / réviser le contrat et l\'annexe sous-traitance.', owner: 'Head of Partnerships', dueInDays: 14 },
        { description: 'Documenter la décision (go/no-go) et l\'archiver.', owner: 'Head of Partnerships', dueInDays: 5 }
      ],
      agendaDoc: 'docs/meetings/partner-meeting-agenda.md',
      minutesDoc: 'docs/meetings/meeting-minutes-template.md'
    },
    {
      id: 'MTG-RISK',
      type: 'risk',
      title: 'Comité des risques (interne)',
      objective: 'Piloter le profil de risque Nova : registre des risques, dépassements d\'appétence, stress tests et actions de mitigation, en préfiguration de la fonction de gestion des risques d\'un futur EMI.',
      audience: 'internal',
      cadence: 'monthly',
      durationMin: 60,
      owner: 'Risk Officer',
      confidentiality: 'confidential',
      participants: [
        { role: 'Risk Officer', required: true, side: 'internal', reason: 'Anime le comité et présente le registre des risques.' },
        { role: 'COO', required: true, side: 'internal', reason: 'Arbitre les actions opérationnelles.' },
        { role: 'Compliance Officer', required: true, side: 'internal', reason: 'Couvre les risques de conformité et AML.' },
        { role: 'CISO', required: false, side: 'internal', reason: 'Couvre les risques cyber et de continuité.' },
        { role: 'CFO', required: false, side: 'internal', reason: 'Couvre les risques financiers et de safeguarding.' }
      ],
      agendaItems: [
        { order: 1, title: 'Synthèse du profil de risque', purpose: 'Évolution mois sur mois, top risques, RAG status.', kind: 'info', durationMin: 10, presenter: 'Risk Officer' },
        { order: 2, title: 'Revue du registre des risques', purpose: 'Risques par catégorie (AML/KYC, cyber, données, opérationnel, financier, vendor, produit…).', kind: 'discussion', durationMin: 15, presenter: 'Risk Officer' },
        { order: 3, title: 'Appétence & dépassements', purpose: 'Indicateurs vs seuils, dépassements et causes.', kind: 'discussion', durationMin: 10, presenter: 'Risk Officer' },
        { order: 4, title: 'Stress tests & scénarios', purpose: 'Résultats (run, fraude, panne IT, sanctions) et impacts safeguarding.', kind: 'discussion', durationMin: 10, presenter: 'Risk Officer' },
        { order: 5, title: 'Risque produit épargne « 7 % »', purpose: 'Risque de mécompréhension, contrôle des messages (objectif, pas garantie), mécanisme à définir.', kind: 'discussion', durationMin: 5, presenter: 'Compliance Officer' },
        { order: 6, title: 'Décisions & actions de mitigation', purpose: 'Acter actions, responsables et échéances.', kind: 'decision', durationMin: 10, presenter: 'Risk Officer' }
      ],
      decisions: [
        { topic: 'Acceptation / mitigation des risques résiduels', decisionMaker: 'Comité des risques', rationale: 'Statuer sur les risques hors appétence.' },
        { topic: 'Priorisation des actions de mitigation', decisionMaker: 'Risk Officer / COO', rationale: 'Allouer les ressources aux risques majeurs.' }
      ],
      documentsToPrepare: [
        { name: 'Registre des risques à jour', owner: 'Risk Officer', reference: 'docs/risk' },
        { name: 'Résultats des stress tests', owner: 'Risk Officer', reference: 'docs/stress-tests' },
        { name: 'Tableau de bord des indicateurs d\'appétence', owner: 'Risk Officer' },
        { name: 'Rapport mensuel des risques (RPT-RISK)', owner: 'Risk Officer', reference: 'docs/reporting/risk-reporting.md' }
      ],
      questions: [
        'Quels risques sont sortis de l\'appétence ce mois-ci et pourquoi ?',
        'Les actions de mitigation avancent-elles selon le plan ?',
        'Les stress tests révèlent-ils une vulnérabilité du safeguarding ?',
        'Le contrôle des messages sur l\'épargne « 7 % » est-il effectif ?',
        'Quels risques émergents (vendor, cyber, réglementaire) anticiper ?'
      ],
      postMeetingActions: [
        { description: 'Mettre à jour le registre des risques et le statut des actions.', owner: 'Risk Officer', dueInDays: 3 },
        { description: 'Diffuser le compte rendu au COO et au Conseil (synthèse).', owner: 'Risk Officer', dueInDays: 3 },
        { description: 'Escalader au Conseil les risques hors appétence majeurs.', owner: 'Risk Officer', dueInDays: 5 }
      ],
      agendaDoc: 'docs/meetings/internal-risk-meeting-agenda.md',
      minutesDoc: 'docs/meetings/meeting-minutes-template.md'
    },
    {
      id: 'MTG-COMPLIANCE',
      type: 'compliance',
      title: 'Comité conformité / AML / RGPD',
      objective: 'Piloter la posture de conformité Nova : dossier EMI, AML/CFT (alertes, SAR), demandes RGPD, constats et remédiation, revue des communications (dont épargne « 7 % »), en préfiguration de la fonction conformité d\'un futur EMI.',
      audience: 'internal',
      cadence: 'monthly',
      durationMin: 60,
      owner: 'Compliance Officer',
      confidentiality: 'restricted',
      participants: [
        { role: 'Compliance Officer', required: true, side: 'internal', reason: 'Anime le comité et présente la posture de conformité.' },
        { role: 'MLRO', required: true, side: 'internal', reason: 'Présente le dispositif AML/CFT (alertes, SAR).' },
        { role: 'DPO', required: true, side: 'internal', reason: 'Présente les demandes RGPD et la protection des données.' },
        { role: 'COO', required: false, side: 'internal', reason: 'Arbitre les remédiations opérationnelles.' },
        { role: 'CEO', required: false, side: 'internal', reason: 'Engage l\'organe de direction sur les sujets majeurs.' }
      ],
      agendaItems: [
        { order: 1, title: 'Posture de conformité & dossier EMI', purpose: 'Avancement de la demande auprès de la Banque de Lituanie, jalons, dépendances.', kind: 'info', durationMin: 10, presenter: 'Compliance Officer' },
        { order: 2, title: 'AML/CFT', purpose: 'Alertes, escalades, SAR, filtrage sanctions/PEP.', kind: 'discussion', durationMin: 15, presenter: 'MLRO' },
        { order: 3, title: 'Protection des données (RGPD)', purpose: 'Demandes de droits, incidents, registre des traitements.', kind: 'discussion', durationMin: 10, presenter: 'DPO' },
        { order: 4, title: 'Constats & remédiation', purpose: 'Constats ouverts/fermés, plans d\'action, échéances.', kind: 'discussion', durationMin: 10, presenter: 'Compliance Officer' },
        { order: 5, title: 'Revue des communications', purpose: 'Conformité des messages, dont épargne « 7 % » (objectif, avertissement, jamais garanti).', kind: 'discussion', durationMin: 10, presenter: 'Compliance Officer' },
        { order: 6, title: 'Décisions & actions', purpose: 'Acter les remédiations, responsables et échéances.', kind: 'decision', durationMin: 5, presenter: 'Compliance Officer' }
      ],
      decisions: [
        { topic: 'Validation des escalades AML / décisions SAR', decisionMaker: 'MLRO (compétence propre) / Comité', rationale: 'Respecter les obligations de déclaration de soupçon.' },
        { topic: 'Priorisation de la remédiation des constats', decisionMaker: 'Compliance Officer / COO', rationale: 'Réduire les écarts avant l\'agrément.' }
      ],
      documentsToPrepare: [
        { name: 'Rapport mensuel de conformité (RPT-COMPLIANCE)', owner: 'Compliance Officer', reference: 'docs/reporting/compliance-reporting.md' },
        { name: 'Rapport AML/CFT (RPT-AML)', owner: 'MLRO', reference: 'docs/reporting/aml-reporting.md' },
        { name: 'Rapport demandes RGPD (RPT-DSR)', owner: 'DPO', reference: 'docs/reporting/data-protection-reporting.md' },
        { name: 'Registre des constats & plan de remédiation', owner: 'Compliance Officer', reference: 'docs/policies' }
      ],
      questions: [
        'Quels jalons du dossier EMI sont en retard et pourquoi ?',
        'Y a-t-il des SAR à déclarer ce mois-ci ? Le filtrage est-il à jour ?',
        'Les demandes RGPD sont-elles traitées dans les délais ?',
        'Les communications restent-elles conformes (épargne « 7 % » = objectif) ?',
        'Quels constats bloquent la trajectoire d\'agrément ?'
      ],
      postMeetingActions: [
        { description: 'Mettre à jour le registre des constats et le plan de remédiation.', owner: 'Compliance Officer', dueInDays: 3 },
        { description: 'Traiter / escalader les SAR et demandes RGPD en attente.', owner: 'MLRO / DPO', dueInDays: 5 },
        { description: 'Diffuser la synthèse de conformité au Conseil.', owner: 'Compliance Officer', dueInDays: 5 }
      ],
      agendaDoc: 'docs/meetings/compliance-meeting-agenda.md',
      minutesDoc: 'docs/meetings/meeting-minutes-template.md'
    }
  ];

})(typeof window !== 'undefined' ? window : this);
