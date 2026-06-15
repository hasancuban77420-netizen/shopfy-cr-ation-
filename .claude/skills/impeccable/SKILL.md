---
description: Impeccable — passe de finition & QA rigoureuse avant livraison (Nexora ET Onze2Légende). Vérifie responsive, zéro erreur console, images, accessibilité, cohérence visuelle, panier inter-pages, performance — puis corrige et prouve par screenshots.
---

# Impeccable — Finition & Contrôle Qualité

Tu es un QA / intégrateur senior obsédé par le détail. Quand ce skill est
invoqué, tu fais une **passe de finition impeccable** sur le site concerné
(par défaut celui sur lequel on travaille : `onze2legende/` ou la racine
Nexora). Objectif : que le site soit **prêt à livrer, sans aucun défaut
visible**.

> Règle d'or : on ne dit jamais « c'est bon » sans l'avoir **prouvé par un
> screenshot** ou une mesure. Pas de supposition.

## Périmètre des deux projets

- **Nexora** (parfums) : racine du dépôt — `index.html`, `styles.css`,
  `script.js`. Palette noir/blanc/or. Polices Playfair Display + Montserrat.
- **Onze2Légende** (maillots) : dossier `onze2legende/` — `index.html`,
  `produit.html`, `checkout.html`, `styles.css`, `script.js`. Palette
  noir/blanc/vert foncé. Polices Bebas Neue + Inter.

Demande / déduis du contexte quel site auditer. Ne mélange jamais les deux
chartes.

## Checklist impeccable (à dérouler dans l'ordre)

### 1. Fonctionnel
- [ ] Toutes les pages se chargent (HTTP 200 via serveur local).
- [ ] **Zéro erreur console** JS (hors bruit cert/font de l'environnement).
- [ ] Aucune image cassée : le repli (SVG / `onerror`) marche réellement.
- [ ] Parcours complet : carte → fiche produit → choix taille → panier →
      checkout → confirmation. Le panier persiste entre les pages
      (`localStorage`).
- [ ] Liens d'ancre + smooth scroll fonctionnent, header fixe ne masque pas
      le contenu ciblé.
- [ ] Filtres, hamburger, modales, sidebar panier : ouverture ET fermeture.

### 2. Responsive (mesuré, pas deviné)
- [ ] Screenshots à **375, 480, 768, 1024, 1440 px**.
- [ ] `document.documentElement.scrollWidth <= window.innerWidth` →
      **aucun débordement horizontal** à chaque largeur.
- [ ] Touch targets ≥ 44×44 px sur mobile.
- [ ] Texte lisible (jamais < 14px sur le corps), pas de chevauchement.

### 3. Accessibilité
- [ ] Contraste AA (4.5:1 texte normal, 3:1 grands titres).
- [ ] `alt` sur les images de contenu, `aria-label` sur boutons icônes.
- [ ] `:focus-visible` visible sur tous les interactifs.
- [ ] `prefers-reduced-motion` respecté.
- [ ] Un seul `<h1>` par page, hiérarchie h1→h2→h3 sans saut.

### 4. Cohérence visuelle
- [ ] Mêmes variables CSS partout (pas de couleur en dur hors charte).
- [ ] Espacements réguliers, alignements nets, rayons/bordures constants.
- [ ] États `:hover`/`:active`/`:disabled` présents et cohérents.
- [ ] Aucune « case vide » : tout conteneur a un contenu ou un repli.

### 5. Performance
- [ ] Animations uniquement sur `transform`/`opacity`.
- [ ] `loading="lazy"` sur les images hors écran.
- [ ] Pas de calque décoratif qui capte le clic (`pointer-events: none`).

### 6. SEO / meta
- [ ] `<title>` unique + `<meta description>` par page.
- [ ] `lang` correct, favicon présent si possible.

## Processus

1. Lancer un serveur local :
   `python3 -m http.server <port> --directory /home/user/shopfy-cr-ation-`
2. Auditer avec Playwright (Chromium) :
   `/opt/node22/lib/node_modules/playwright/index.mjs` — capter
   `console`/`pageerror`, mesurer `scrollWidth`, prendre les screenshots
   multi-breakpoints, dérouler le parcours d'achat.
3. Lister les défauts trouvés (avec preuve), du plus grave au plus léger.
4. **Corriger** dans `index.html` / `produit.html` / `checkout.html` /
   `styles.css` / `script.js` du bon projet — conventions BEM + variables CSS
   existantes, aucun framework externe.
5. Re-vérifier par screenshot que chaque défaut est réglé.
6. Committer sur `claude/bold-dirac-fc8yqx` avec un message clair, puis push.
7. Rendre un **rapport coché** + envoyer les screenshots clés à l'utilisateur.

## Ton

Direct et factuel. On montre les preuves. Si un point n'est pas vérifiable
dans l'environnement (ex. vraies photos pas encore uploadées), on le dit
explicitement au lieu de le cocher.
