---
description: Frontend design helper for Nexora — composants UI, CSS, animations, responsive, palette noir/blanc/or.
---

# Frontend Design — Nexora

Tu es un expert en design frontend luxe. Ce projet est un e-commerce de parfums haut de gamme (**Nexora**) avec une charte graphique stricte.

## Charte graphique

| Variable CSS       | Valeur      | Usage                        |
|--------------------|-------------|------------------------------|
| `--black`          | `#0a0a0a`   | Fond principal, texte sur blanc |
| `--white`          | `#fafafa`   | Fond secondaire, texte sur noir |
| `--gray-light`     | `#f0f0f0`   | Séparateurs, fonds de carte  |
| `--gray-mid`       | `#888`      | Textes secondaires, labels   |
| `--gold`           | `#c9a96e`   | Accents luxe, prix, CTA gold |
| `--gold-dark`      | `#a8834a`   | Hover sur éléments gold      |

**Typographies :**
- Titres : `'Playfair Display', serif` — élégance, serif classique
- Corps : `'Montserrat', sans-serif` — lisibilité, modernité

**Principes :**
- Minimalisme radical : pas de couleur en dehors de la palette
- Espacement généreux (`letter-spacing`, marges larges)
- Animations subtiles uniquement (pas d'effets tape-à-l'œil)
- Qualité perçue = Chanel, Dior, Louis Vuitton

## Quand ce skill est invoqué

L'utilisateur veut :
1. **Créer un nouveau composant** UI (section, carte, modal, bannière…)
2. **Modifier le design** d'un élément existant
3. **Améliorer** l'aspect visuel général du site
4. **Ajouter une animation** ou un effet CSS

## Processus à suivre

1. **Lire** les fichiers concernés (`index.html`, `styles.css`) avant tout
2. **Proposer** le design en une phrase (pas de long plan), puis **implémenter directement**
3. Écrire le HTML dans `index.html` et le CSS dans `styles.css` — **jamais de fichier séparé**
4. Respecter les conventions existantes : classes BEM (`.block__element--modifier`), variables CSS, unités `rem`/`clamp()`
5. **Vérifier** en prenant un screenshot via Playwright après modification
6. Committer et pousser sur `claude/bold-dirac-fc8yqx`

## Contraintes techniques

- Pas de framework CSS externe (pas de Bootstrap, Tailwind, etc.)
- Pas de JS supplémentaire sauf si vraiment nécessaire
- Responsive obligatoire : breakpoints à `768px` et `480px`
- Transitions : toujours utiliser `var(--transition)` (`0.35s cubic-bezier(0.4,0,0.2,1)`)
- Animations d'entrée : utiliser `.animate-on-scroll` + `IntersectionObserver` existant

## Exemples d'utilisation

```
/frontend-design  Ajoute une bannière promotionnelle en haut du site
/frontend-design  Crée un modal de détail produit avec galerie
/frontend-design  Améliore les cartes produits avec un effet hover plus luxueux
/frontend-design  Ajoute une section "Nouveautés" entre les bestsellers et l'univers
```
