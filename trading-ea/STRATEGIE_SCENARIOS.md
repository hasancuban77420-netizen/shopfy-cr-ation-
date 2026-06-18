# 📊 XAU Grid 15 — Stratégie & Schéma de TOUS les scénarios (v2 — projet)

> Document de travail. **Le code n'est PAS encore modifié.**
> On valide d'abord ensemble cette logique, puis je l'implémente dans le `.mq5`.

---

## ✍️ Les 3 modifications demandées

| # | Modification | Avant (v1.1) | Après (v2) |
|---|---|---|---|
| **1** | **Supprimer les gaps** | Si le prix saute ≥ 2 paliers d'un coup → **ignoré**, aucun trade | On **suit le mouvement** : un saut de 2 paliers (ou plus) déclenche quand même un trade dans le sens du mouvement |
| **2** | **Trades "de plus en plus haut" (achats) et "de plus en plus bas" (ventes)** | Blocage **seulement après une perte**, au même niveau | Après **chaque** trade (gagnant OU perdant), le prochain trade du même sens doit être **au moins 1 palier au-delà du plus loin atteint** par le trade précédent |
| **3** | **1er trade de la journée libre dans les 2 sens** | (déjà le cas) | Confirmé : le 1er achat ET la 1ère vente du jour sont libres, ensuite le système "cliquet" s'applique |

---

## 🔤 Notation

| Symbole | Signification |
|---|---|
| `P` | Prix actuel (Bid) |
| `s` | Pas de grille = **15** |
| **Palier** | Un multiple de 15 (… 4050, 4065, 4080, 4095 …) |
| `Entrée` | Prix d'ouverture du trade |
| `SL` | Stop Loss (pas de Take Profit) |

> ⚠️ **Note importante sur les chiffres** : dans tes exemples tu utilises 4060 / 4075 / 4090.
> Le code actuel pose la grille sur les **multiples exacts de 15** (donc 4050, 4065, 4080, 4095…).
> J'utilise quand même TES chiffres dans les schémas pour rester clair, mais **voir la question Q1 en bas** : veux-tu décaler la grille pour qu'elle passe sur tes niveaux ?

---

## 🧠 Nouvelles variables d'état (remises à zéro chaque jour)

| Variable | Rôle | Valeur de départ (chaque matin) |
|---|---|---|
| `PlusHautAchat` | Palier le plus haut atteint par le dernier achat | `−∞` (1er achat libre) |
| `PlusBasVente` | Palier le plus bas atteint par la dernière vente | `+∞` (1ère vente libre) |

**Règle cliquet :**

```
Prochain ACHAT autorisé  SEULEMENT si   palier ≥ PlusHautAchat + s
Prochaine VENTE autorisée SEULEMENT si   palier ≤ PlusBasVente − s
```

Pendant qu'un trade est ouvert, on suit en continu le plus haut / plus bas atteint.
À la clôture, ce plus haut / plus bas devient la nouvelle référence.

---

## ⚙️ Règles de décision (résumé)

1. **Détection du mouvement** : `delta = palier(P_maintenant) − palier(P_avant)`
   - `delta ≥ +1` → mouvement haussier → **ACHAT** (même si saut de 2+ : *plus de gap ignoré*)
   - `delta ≤ −1` → mouvement baissier → **VENTE**
   - `delta = 0` → rien
2. **Filtre cliquet** : l'achat n'est pris que si le palier ≥ `PlusHautAchat + s` ; la vente seulement si palier ≤ `PlusBasVente − s`.
3. **SL initial** : achat → `Entrée − s` ; vente → `Entrée + s`. **Pas de TP.**
4. **Trailing** : le SL suit **1 palier derrière** le prix (inchangé par rapport à v1.1).
5. **1 seule position à la fois.**
6. **Reset quotidien** : à minuit, `PlusHautAchat = −∞`, `PlusBasVente = +∞`, mémoire effacée.

---

# 🎬 TOUS LES SCÉNARIOS

Légende des schémas :
`○` = référence/minuit · `▲` = ACHAT · `▼` = VENTE · `■` = SL · `✗` = SL touché (clôture) · `⛔` = trade refusé par le cliquet

---

## Scénario A — 1er trade du jour, le prix MONTE → ACHAT

```
4090 ┤                  ●  P monte → SL trail à 4075
4075 ┤        ▲ ACHAT   (SL initial = 4060)
4060 ┤  ○ minuit (référence)
     └──────────────────────────────► temps
```
- À minuit, référence = 4060.
- Le prix franchit 4075 → **1er ACHAT** (libre). SL = 4060.
- Le prix atteint 4090 → SL trail à 4075.

---

## Scénario B — 1er trade du jour, le prix BAISSE → VENTE

```
4060 ┤  ○ minuit (référence)
4045 ┤        ▼ VENTE   (SL initial = 4060)
4030 ┤                  ●  P baisse → SL trail à 4045
     └──────────────────────────────► temps
```
- Le prix franchit 4045 vers le bas → **1ère VENTE** (libre). SL = 4060.
- Le prix atteint 4030 → SL trail à 4045.

---

## Scénario C — Achats "de plus en plus haut" (ton exemple BUY)

```
4105 ┤                              ▲ ACHAT #2 autorisé (≥ 4090 + 15)
4090 ┤            ● PlusHaut atteint = 4090   ✗ clôture, on devient flat
4075 ┤   ▲ ACHAT #1 (SL 4060) → trail → SL 4075
4060 ┤ ○ minuit
     └──────────────────────────────────────► temps
```
1. Achat #1 à 4075, le prix monte à 4090, SL trail à 4075.
2. Le prix redescend, touche SL 4075 → **clôture**. `PlusHautAchat = 4090`.
3. On est flat. **Le prochain achat ne sera PAS à 4090** mais **1 palier au-dessus = 4105**.
4. Le prix doit remonter et franchir 4105 → **ACHAT #2**.

➡️ Chaque nouvel achat est **strictement plus haut** que le précédent. ✅

---

## Scénario D — Ventes "de plus en plus bas" (ton exemple SELL)

```
4045 ┤   ✗ SL touché (perte)   ← VENTE #1 entrée 4030, SL 4045
4030 ┤ ▼ VENTE #1   ● PlusBas atteint = 4030
4015 ┤                       ▼ VENTE #2 autorisée (≤ 4030 − 15)
     └──────────────────────────────────────► temps
```
1. Vente #1 à 4030, SL = 4045.
2. Le prix monte à 4045 → **SL touché, perte**. Le plus bas atteint = 4030.
   → `PlusBasVente = 4030`.
3. La prochaine vente sera **1 palier en dessous = 4015**.
4. Le prix redescend, franchit 4015 → **VENTE #2**.

➡️ Chaque nouvelle vente est **strictement plus basse** que la précédente. ✅

---

## Scénario E — SUPPRESSION DES GAPS (saut de 2 paliers)

### E1 — Gap haussier
```
4095 ┤            ▲ on suit le mouvement → ACHAT
4080 ┤        (palier traversé sans s'arrêter)
4065 ┤  ○ P avant
     └──────────────────────────────► 1 seul tick (saut)
```
- Avant : 4065. Le tick suivant : 4095 (saut de **2 paliers**).
- **v1.1** : ignoré (gap). **v2** : on **suit le mouvement → ACHAT**.

### E2 — Gap baissier
```
4065 ┤  ○ P avant
4050 ┤        (palier traversé)
4035 ┤            ▼ on suit le mouvement → VENTE
     └──────────────────────────────► 1 seul tick (saut)
```
- Même logique vers le bas → **VENTE**.

> ❓ **Question Q2** : sur un saut de 2 paliers, le "niveau déclencheur" (qui sert au cliquet) doit-il être :
> (a) le **1er palier** traversé (4080 en E1), ou
> (b) le **dernier palier** atteint (4095 en E1) ?
> *Ça change à partir de quel niveau le prochain trade sera autorisé.*

---

## Scénario F — Montée puis bascule en vente (ton 2e exemple)

```
4090 ┤        ▲▲  achats qui montent... puis le prix retombe
4075 ┤    ▲
4060 ┤ ○ minuit
4045 ┤              ▼ 1ère VENTE du jour (libre) sur le 1er −15
4030 ┤                  ▼ VENTE suivante, plus bas (cliquet)
     └──────────────────────────────────────► temps
```
- Après minuit, le prix **ne fait que monter** → des achats s'enchaînent vers le haut, puis se clôturent quand ça redescend.
- Quand le prix **baisse de 15** pour la 1ère fois → **1ère VENTE du jour** (libre, car `PlusBasVente = +∞`).
- Ensuite, les ventes suivent le système **de plus en plus bas**.

➡️ Les deux cliquets (achat ↑ et vente ↓) tournent **indépendamment** dans la même journée.

---

## Scénario G — Achat perdant tout de suite

```
4075 ┤ ▲ ACHAT (SL 4060)
4060 ┤        ✗ SL touché (perte)   PlusHaut atteint = 4075
     ...
4090 ┤                    ▲ prochain achat seulement ≥ 4075 + 15 = 4090
```
- L'achat perd immédiatement (n'est jamais monté). Plus haut atteint = son palier d'entrée (4075).
- `PlusHautAchat = 4075` → prochain achat autorisé à partir de **4090**.

➡️ Même un achat perdant **pousse le prochain achat vers le haut** (symétrique de ta vente perdante en D).

---

## Scénario H — Refus par le cliquet

```
4105 ┤  (PlusHautAchat = 4105 après un gros achat gagnant)
4090 ┤        ▲ tentative d'achat ⛔ REFUSÉ (4090 < 4105 + 15)
     ...
4120 ┤                    ▲ achat autorisé (≥ 4120)
```
- Tant que le prix ne dépasse pas `PlusHautAchat + s`, **aucun nouvel achat**.

---

## Scénario I — Reset quotidien (minuit)

```
Jour 1 (soir)         |  Jour 2 (00:00)
PlusHautAchat = 4200  |  PlusHautAchat = −∞   (libre)
PlusBasVente  = 3900  |  PlusBasVente  = +∞   (libre)
mémoire = pleine      |  mémoire = effacée
```
- À chaque nouveau jour, tout repart à zéro. Le 1er trade du Jour 2 est de nouveau **libre dans les 2 sens**.

---

## 🔁 Trailing du SL (inchangé) — rappel visuel

```
ACHAT entrée 4075 :
 prix 4075 → SL 4060   (initial, −1 palier)
 prix 4090 → SL 4075   (suit 1 palier derrière)
 prix 4105 → SL 4090
 prix 4120 → SL 4105
```
Le SL **monte** avec le prix (achat) ou **descend** avec le prix (vente), toujours **1 palier derrière**. Il ne recule jamais.

---

## 📋 Tableau récapitulatif des décisions

| Situation | Condition | Action |
|---|---|---|
| Flat + mouvement ↑ ≥ 1 palier | palier ≥ `PlusHautAchat + s` | **ACHAT** |
| Flat + mouvement ↑ ≥ 1 palier | palier < `PlusHautAchat + s` | ⛔ refusé |
| Flat + mouvement ↓ ≥ 1 palier | palier ≤ `PlusBasVente − s` | **VENTE** |
| Flat + mouvement ↓ ≥ 1 palier | palier > `PlusBasVente − s` | ⛔ refusé |
| Saut de 2+ paliers | (plus de filtre gap) | trade dans le sens du saut |
| Position ouverte | prix avance d'1 palier | SL trail +1 palier |
| Clôture d'un achat | — | `PlusHautAchat` = plus haut atteint |
| Clôture d'une vente | — | `PlusBasVente` = plus bas atteint |
| Nouveau jour | minuit | reset complet |

---

## ❓ Questions à confirmer AVANT de coder

- **Q1 — Ancrage de la grille** : tes exemples (4060/4075/4090) ne sont pas des multiples exacts de 15 (la grille du code passe par 4050/4065/4080/4095). Veux-tu **décaler la grille** pour qu'elle tombe sur tes niveaux, ou on garde les multiples purs de 15 ?

- **Q2 — Niveau déclencheur sur un gap** : voir scénario E. Sur un saut de 2+ paliers, le cliquet doit se baser sur le **1er** palier traversé ou le **dernier** atteint ?

- **Q3 — Le cliquet s'applique-t-il aux 2 sens en parallèle ?** Dans une même journée, peut-on avoir des achats qui montent ET des ventes qui descendent en même temps (chacun son cliquet) ? *(C'est ce que j'ai supposé, scénario F.)*

- **Q4 — Référence "plus haut atteint"** : on prend bien le **palier le plus haut touché par le prix** pendant le trade (et non le prix d'entrée, ni le niveau du SL) ? *(Confirmé par ton exemple : entrée 4075, atteint 4090, prochain achat 4105.)*

- **Q5 — Trailing** : on garde exactement le trailing actuel (SL 1 palier derrière, avec le décalage actuel) ? Ou tu veux le verrouiller plus serré ?
