---
description: Web Design Guidelines — règles UX/UI, accessibilité, performance et bonnes pratiques pour le site Nexora. À consulter avant toute modification structurelle.
---

# Web Design Guidelines — Nexora

Ce skill s'assure que chaque modification du site respecte les standards professionnels du web design : UX, accessibilité, performance, typographie, hiérarchie visuelle.

## 1. Hiérarchie visuelle

- **Un seul `<h1>` par page** — actuellement : "L'ART DU PARFUM" dans le hero
- Titres `<h2>` pour les sections, `<h3>` pour les titres de cartes
- Ordre logique : h1 → h2 → h3, jamais de saut
- Taille minimale du texte de corps : **14px (0.875rem)**
- Contraste minimum WCAG AA : **4.5:1** pour le texte normal, **3:1** pour les grands titres

## 2. Espacement & Rythme

- Padding sections : `clamp(4rem, 8vw, 8rem)` vertical
- Gouttières de grille : `2rem` minimum
- `letter-spacing` sur les labels : **0.12em à 0.5em** (jamais au-delà)
- `line-height` corps : **1.6 à 1.8**
- `line-height` titres : **1.0 à 1.2**

## 3. Charte typographique

| Élément           | Police               | Taille             | Poids |
|-------------------|----------------------|--------------------|-------|
| Titre hero (h1)   | Playfair Display     | clamp(3rem, 8vw, 7rem) | 700 |
| Titres sections (h2) | Playfair Display  | clamp(2rem, 4vw, 3.2rem) | 600 |
| Titres cartes (h3)| Playfair Display     | 1.25rem            | 500   |
| Corps             | Montserrat           | 1rem               | 400   |
| Labels / eyebrow  | Montserrat           | 0.65–0.75rem       | 500   |
| Prix              | Montserrat           | 1–1.1rem           | 600   |

## 4. Couleurs & Contraste

```
Texte blanc sur fond noir   → ✅ 21:1 (parfait)
Texte noir sur fond blanc   → ✅ 21:1 (parfait)
Or #c9a96e sur noir         → ✅ 5.8:1 (AA valide)
Or #c9a96e sur blanc        → ⚠️  2.4:1 (décoratif uniquement, pas de texte critique)
Texte gris #888 sur blanc   → ✅ 3.5:1 (AA grands textes)
```

## 5. Responsive — Breakpoints

| Breakpoint | Contexte         | Règles clés |
|------------|------------------|-------------|
| > 1200px   | Desktop large    | Layout complet, flacons hero visibles |
| 768–1200px | Tablette/laptop  | Grille 2 colonnes, flacons réduits |
| 640–768px  | Tablette portrait| Flacons hero masqués |
| < 480px    | Mobile           | Grille 1 colonne, textes réduits |

- Toujours tester : header fixe + sticky (ne pas masquer le contenu)
- Images/SVG : `max-width: 100%` obligatoire
- Touch targets : **minimum 44×44px** pour tous les boutons interactifs

## 6. Performance

- Animations : utiliser uniquement `transform` et `opacity` (pas de `width`, `height`, `top`, `left`)
- Toujours `will-change: transform` sur les éléments animés en continu
- `pointer-events: none` sur tous les éléments décoratifs (flacons, particules)
- Pas d'images lourdes sans `loading="lazy"`
- Fonts Google : déjà optimisées via `preconnect` + `display=swap`

## 7. Accessibilité

- `aria-hidden="true"` sur tous les éléments purement décoratifs ✅ (déjà fait)
- `aria-label` sur tous les boutons icônes ✅ (cart, menu)
- Focus visible sur tous les éléments interactifs : `outline: 2px solid var(--gold)`
- Navigation au clavier fonctionnelle
- Respecter `prefers-reduced-motion` :

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 8. Composants — Règles spécifiques

**Boutons :**
- Padding minimum : `0.875rem 2.5rem`
- Toujours un état `:hover` et `:focus-visible` distinct
- Taille minimum : 44px de hauteur

**Cartes produits :**
- Ratio image fixe (ne pas distordre les SVGs)
- Hover : `transform: translateY(-4px)` + shadow (pas de changement de couleur de fond abrupt)

**Header fixe :**
- Z-index : 1000 (ne pas dépasser 1300 sauf cart sidebar)
- Hauteur : auto (ne pas fixer en px pour l'accessibilité)

**Formulaires :**
- `label` ou `aria-label` obligatoire sur chaque `input`
- État d'erreur visible (border rouge, message textuel)

## 9. SEO de base

- `<title>` unique et descriptif ✅
- `<meta description>` présente ✅
- Pas de contenu important uniquement en CSS (pseudo-elements)
- Liens internes avec texte descriptif (pas "cliquez ici")

## Processus à suivre

1. Lire `index.html` et `styles.css`
2. Identifier les violations des guidelines ci-dessus
3. Corriger en priorité : contraste → accessibilité → performance → typographie
4. Screenshot pour vérifier
5. Committer sur `claude/bold-dirac-fc8yqx`
