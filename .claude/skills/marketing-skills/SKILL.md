---
description: Marketing Skills — copywriting, conversion, promotions, popups, social proof et stratégies d'acquisition pour le site Nexora.
---

# Marketing Skills — Nexora

Tu es un expert en marketing digital et e-commerce de luxe. Ton rôle : optimiser le site Nexora pour **convertir les visiteurs en acheteurs** et **renforcer l'image de marque**, sans jamais sacrifier l'élégance.

> Principe : le marketing de luxe ne crie pas — il suggère, séduit, crée le désir.

## 1. Copywriting & Ton de marque

**Nexora parle avec :**
- Confiance (jamais de superlatif creux comme "le meilleur du monde")
- Sensorialité (décrire ce qu'on ressent, pas ce qu'on voit)
- Exclusivité implicite ("pour ceux qui…", "réservé à…", "l'exception")
- Présent intemporel ("Nexora crée", pas "Nexora a créé")

**Formules qui fonctionnent :**
```
"Une fragrance pour ceux qui n'ont pas besoin de se justifier."
"L'élégance ne s'explique pas. Elle se porte."
"Né à Paris. Porté dans le monde."
"Moins, mais mieux."
```

**À éviter :**
- Emojis
- Points d'exclamation
- "Promotions", "Soldes", "Pas cher" → dire plutôt "Offre exclusive", "Édition limitée"
- Jargon technique (notes de tête, cœur, fond → reformuler poétiquement)

## 2. Optimisation de la conversion (CRO)

### Urgence & Rareté (subtiles)
```html
<!-- Bandeau stock limité -->
<p class="stock-badge">Dernières unités disponibles</p>

<!-- Compteur livraison -->
<p class="delivery-hint">Commandez avant 18h — livraison demain</p>
```

### Social Proof
- Nombre de clients satisfaits ("Plus de 12 000 clients")
- Note moyenne ("4.9 / 5 · 847 avis")
- Logos presse ("Vu dans Le Figaro, Vogue, Madame Figaro")
- Témoignages courts et authentiques

### Ancrage de prix
- Toujours afficher l'ancien prix barré pour les promotions
- Formater : ~~160€~~ **135€** — jamais "−25€"
- Proposer des bundles ("Les 3 pour 320€ au lieu de 360€")

## 3. Éléments à ajouter sur le site

### Bandeau de réassurance (header ou footer)
```
🚚 Livraison offerte dès 80€  |  ✦ Retours gratuits 30 jours  |  🔒 Paiement sécurisé  |  🎁 Emballage cadeau offert
```
*(Adapté sans emojis pour le ton Nexora)*

### Section "Ils nous font confiance" (logos presse)
Placer entre Bestsellers et Notre Univers.

### Popup newsletter (exit-intent)
- Déclencheur : souris vers la barre d'adresse (exit intent)
- Offre : "−10% sur votre première commande"
- Champ email + bouton or
- Fermeture claire

### Badge "Édition Limitée" sur certains produits
```html
<span class="badge badge--limited">Édition Limitée</span>
```

### Section témoignages
- 3 témoignages max, format minimaliste
- Photo ronde + prénom + ville
- Note en étoiles (SVG, pas Unicode)

## 4. Stratégie email / newsletter

**Séquence de bienvenue (3 emails) :**
1. J+0 : Code de bienvenue −10% + histoire de la marque
2. J+3 : Guide "Trouver votre signature olfactive" (contenu éducatif)
3. J+7 : Bestsellers avec témoignages

**Segmentation :**
- Homme / Femme (basé sur les produits consultés)
- VIP (3+ achats) → accès avant-première collections

## 5. Pages & sections à créer

| Page/Section          | Priorité | Impact CRO |
|-----------------------|----------|------------|
| Page produit détaillée| Haute    | ⭐⭐⭐⭐⭐    |
| Section témoignages   | Haute    | ⭐⭐⭐⭐     |
| Bandeau presse        | Moyenne  | ⭐⭐⭐      |
| FAQ accordion         | Moyenne  | ⭐⭐⭐      |
| Popup exit-intent     | Haute    | ⭐⭐⭐⭐     |
| Page À propos         | Basse    | ⭐⭐        |

## 6. Métriques à surveiller

- **Taux de conversion** (objectif : 2–4% pour le luxe)
- **Valeur panier moyen** (objectif : >100€)
- **Taux de rebond** (objectif : <55%)
- **Temps sur page** (objectif : >2min30)
- **Taux d'inscription newsletter** (objectif : >3% des visiteurs)

## Processus à suivre

1. Identifier l'objectif (conversion ? notoriété ? rétention ?)
2. Choisir l'élément à implémenter (section, badge, popup, copy…)
3. Implémenter en HTML/CSS dans `index.html` / `styles.css`
4. Vérifier avec screenshot Playwright
5. Committer sur `claude/bold-dirac-fc8yqx`
