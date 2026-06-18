# 📑 CAHIER DES CHARGES — EA XAU Grid 15 (v2)

> Document de référence. Le code sera écrit **strictement** d'après ce cahier des charges.
> Statut : **en attente du feu vert** pour coder.

---

## 1. Objet

Robot de trading (Expert Advisor) pour MetaTrader 5, sur l'or (XAUUSD), basé sur une
**grille fixe de 15 points**. Le robot suit le mouvement du prix de palier en palier,
se retourne à chaque inversion (stop-and-reverse), et utilise une **mémoire journalière**
qui force les achats à se faire « de plus en plus haut » et les ventes « de plus en plus bas ».

---

## 2. Périmètre technique

| Élément | Choix |
|---|---|
| Plateforme | **MetaTrader 5** (MQL5, classe `CTrade`) |
| Instrument | **XAUUSD uniquement** (refus à l'init si autre symbole) |
| Take Profit | **Aucun** |
| Positions simultanées | **1 maximum**, jamais achat + vente en même temps |
| Identification des trades | **Magic Number dédié** (l'EA ne gère QUE ses propres trades) |

---

## 3. Notation

| Symbole | Signification |
|---|---|
| `P` | Prix courant (Bid) |
| `s` | Pas de grille = **15** |
| **Palier / quinzaine** | Un multiple exact de 15 (… 4470, 4485, 4500 …) |
| `niveau(P)` | Le palier obtenu par `arrondi(P / s) × s` |
| `Haut` | Palier le plus haut atteint pendant un achat |
| `Bas` | Palier le plus bas atteint pendant une vente |

---

## 4. Paramètres (inputs)

| Paramètre | Valeur défaut | Rôle |
|---|---|---|
| `StepPrice` | 15.0 | Pas de grille |
| `RiskPct` | 8.0 | Risque par trade (% de l'equity) |
| `LotMaxCap` | 100.0 | Plafond de sécurité du lot |
| `SlippageFrac` | 0.33 | Déviation autorisée (fraction du pas) |
| `MagicNumber` | 150015 | Identifiant des trades de l'EA |

---

## 5. Règles fonctionnelles

### 5.1 La grille
- Niveaux = **multiples purs de 15** depuis 0 (…, 4470, 4485, 4500, …).
- Aucun décalage / ancrage personnalisé.

### 5.2 Détection d'entrée
- On compare le palier d'avant et le palier de maintenant à chaque tick.
- `delta = niveau(P_maintenant) − niveau(P_avant)`
  - `delta ≥ +1` → **mouvement haussier**
  - `delta ≤ −1` → **mouvement baissier**
  - `delta = 0` → rien

### 5.3 Sens du trade
- Mouvement haussier + on est flat → **ACHAT**
- Mouvement baissier + on est flat → **VENTE**

### 5.4 Gestion des gaps (⚠️ modif. v2)
- **Plus de filtre gap.** Un saut de 2 paliers ou plus **ne bloque pas** le trade.
- On suit le mouvement : on entre au **premier palier autorisé** (cf. mémoire §5.8)
  dans le sens du mouvement.

### 5.5 Stop Loss initial / pas de TP
- **Achat** : `SL = Entrée − s`
- **Vente** : `SL = Entrée + s`
- **Pas de Take Profit.** Une position ne se ferme **que** par son SL.

### 5.6 Trailing du SL
- Le SL suit **1 palier derrière** l'extrême atteint :
  - **Achat** : `SL = Haut − s`
  - **Vente** : `SL = Bas + s`
- Le SL **ne recule jamais** (monotone : monte pour un achat, descend pour une vente).

### 5.7 Stop-and-reverse (⚠️ modif. v2)
Quand le SL est touché (le prix s'inverse d'1 palier) :
1. On **ferme** la position courante.
2. On **enregistre** son extrême en mémoire (§5.8).
3. On tente d'**ouvrir immédiatement la position opposée**, au **même palier**, pour suivre le mouvement.
4. **Si la mémoire l'interdit → on reste FLAT** et on attend qu'un palier autorisé soit franchi.

> La fermeture et la ré-ouverture inverse se font sur **le même palier** (pas d'attente d'une quinzaine).

### 5.8 Mémoire journalière (le « cliquet »)
Deux variables, valables **toute la journée** :

| Variable | Init (chaque matin) | Mise à jour |
|---|---|---|
| `PlusHautAchat` | `−∞` | à la clôture d'un achat : `max(PlusHautAchat, Haut)` |
| `PlusBasVente` | `+∞` | à la clôture d'une vente : `min(PlusBasVente, Bas)` |

**Conditions d'entrée :**
```
ACHAT autorisé  ⇔  palier ≥ PlusHautAchat + s
VENTE autorisée ⇔  palier ≤ PlusBasVente − s
```
- Le **1er achat** et la **1ère vente** de la journée sont **libres** (mémoire à l'infini).
- **Tout** trade enregistre son extrême (gagnant OU perdant).
- Conséquence : les achats montent toujours, les ventes descendent toujours, dans la journée.

### 5.9 Reset journalier
- À chaque **nouveau jour** :
  - `PlusHautAchat = −∞`, `PlusBasVente = +∞`
  - mémoire du dernier trade effacée
  - prix de référence ré-initialisé sur le prix courant
- **On oublie tout d'hier.**

### 5.10 Gestion du risque / taille de lot
```
ArgentRisqué = Equity × (RiskPct / 100)
PerteParLot  = |Entrée − SL| convertie en argent pour 1 lot
Lot          = ArgentRisqué / PerteParLot
```
- Arrondi au pas de volume, borné par min/max du symbole et `LotMaxCap`.
- Réduction automatique si la marge libre est insuffisante.

### 5.11 Une position max / Magic Number
- Jamais plus d'une position ouverte.
- L'EA ne lit/modifie/ferme **que** les positions portant son `MagicNumber`.

---

## 6. Machine à états

```
        ┌─────────────────────────────────────────────┐
        │                   FLAT                       │
        │  cherche un franchissement de palier         │
        └───────────────┬───────────────┬─────────────┘
        haussier +      │               │   baissier +
        achat autorisé  │               │   vente autorisée
                        ▼               ▼
                 ┌──────────┐     ┌──────────┐
                 │  ACHAT   │     │  VENTE   │
                 │ trailing │     │ trailing │
                 └────┬─────┘     └────┬─────┘
              SL touché│                │SL touché
                       ▼                ▼
            ferme + enregistre Haut/Bas en mémoire
                       │
          tente la position opposée au même palier
            ┌──────────┴───────────┐
       autorisée                interdite
            │                       │
            ▼                       ▼
     ouvre l'opposée            reste FLAT (attend)
```

---

## 7. Scénarios de référence

Le détail (schémas quinzaine par quinzaine) est dans **`STRATEGIE_SCENARIOS.md`**.
Cas validés ensemble :

1. **+2 puis −4** : achat → trail → au 1er retour, ferme (break-even) **et** ouvre la 1ère vente sur le même palier → vente qui descend.
2. **−2 puis +4** : miroir exact.
3. **Saut de 2 paliers** : on entre au 1er palier autorisé dans le sens du mouvement.
4. **Trade perdant** : enregistre quand même son extrême → pousse le prochain trade du même sens plus loin.
5. **Consolidation** : si les paliers sont déjà « consommés » par la mémoire → on reste flat (anti-whipsaw).

---

## 8. Cas limites & décisions

| Cas | Décision |
|---|---|
| Retournement mais opposé interdit par la mémoire | Rester **FLAT**, attendre un palier autorisé |
| Break-even touché (SL trailé = entrée) | Clôture à ~0 (− spread/commission), puis retournement normal |
| Plusieurs paliers franchis en 1 tick (gap) | Entrée au 1er palier autorisé ; trailing rattrape le reste |
| Trade ouvert manuellement par l'utilisateur | **Ignoré** (filtre Magic Number) |
| Trading non autorisé (marché fermé, etc.) | Aucune action |

---

## 9. Points encore à confirmer (avant codage)

- **C1** — Au retournement bloqué par la mémoire : on attend bien le **prochain palier autorisé** (et pas une réinitialisation) ? *(supposé OUI)*
- **C2** — `MagicNumber` : valeur `150015` te convient, ou tu en veux une précise ?
- **C3** — `RiskPct` : on garde **8 %** par défaut ?
- **C4** — Définition du jour : on se base sur l'heure du **serveur du broker** (TimeCurrent) pour le reset de minuit ? *(supposé OUI)*

---

## 10. Hors périmètre (ce qu'on ne fait PAS)

- Pas de Take Profit.
- Pas de multi-positions / pas de grille de positions empilées.
- Pas d'autres symboles que XAUUSD.
- Pas de filtre horaire / sessions (sauf demande).
- Pas de news filter, pas de martingale.
