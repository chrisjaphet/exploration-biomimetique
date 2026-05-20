# CLAUDE.md — Instructions pour assistants IA

> Ce fichier aide les assistants IA (Claude, Copilot, Cursor, etc.) à comprendre le projet pour être plus efficaces et pertinents lors des modifications.

---

## 🧠 Contexte du projet

**Nom** : Exploration Biomimétique  
**Type** : Jeu de cartes web pédagogique — HTML/CSS/JS vanilla, aucun framework  
**Client** : STK Architecture (agence d'architecture éco-responsable, Montreuil)  
**Équipe** : 6 étudiants HETIC La Forge, promo B1, mai 2026  
**Soutenance finale** : 22 mai 2026

---

## 📁 Fichiers clés et leur rôle

| Fichier | Rôle | À modifier pour... |
|---|---|---|
| `index.html` | Structure HTML complète — 5 panels (jeu, règles, inventaire, indices, à propos) | Ajouter des éléments UI, changer la structure des pages |
| `css/style.css` | Tous les styles — palette, cartes, états, responsive, animations | Modifier l'apparence, corriger des bugs visuels |
| `js/data.js` | Données statiques — 50 cartes, 25 indices, textes des règles | Ajouter/modifier des paires, des indices |
| `js/script.js` | Logique du jeu — state, rounds, XP, modal, particules, inventaire | Modifier la mécanique du jeu |

---

## 🎯 Conventions importantes

### État global (state object dans script.js)
```js
state = {
  xp,              // Points actuels du joueur
  pairesTotal,     // Toujours 25 (nombre de pairIds uniques dans CARDS_DATA)
  pairesReussies,  // Paires trouvées au total
  selectedCards,   // Max 2 cartes sélectionnées simultanément
  validatedPairs,  // pairIds des paires validées
  indicesAchetes,  // pairIds des indices débloqués
  inventaire,      // Objets {vivant, appli} des paires trouvées
  roundPairs,      // pairIds du round actuel (8 par round)
  roundPairsRestantes, // Paires restantes dans le round
  allPairIds,      // Tous les pairIds mélangés aléatoirement
}
```

### Structure d'une carte (CARDS_DATA)
```js
{
  id: number,           // Unique, séquentiel
  pairId: number,       // Partagé entre vivant + application de même paire
  type: "vivant" | "application",
  name: string,         // UPPERCASE dans l'UI
  tagline: string,      // Affiché en italique sous la photo
  photo: string,        // URL Unsplash — format: ?auto=format&fit=crop&w=300&h=300
  explication: {        // Uniquement sur la carte type "vivant"
    titre: string,
    texte: string,
  } | null              // null pour les cartes "application"
}
```

### Classes CSS des états de carte
```css
.card                  /* Base */
.card--vivant          /* Bordure verte au repos */
.card--application     /* Bordure bleue au repos */
.card--selected        /* Cyan — sélectionnée */
.card--correcte        /* Verte — paire trouvée */
.card--incorrecte      /* Rouge + shake — mauvaise paire */
.card--validee         /* Grisée + grayscale — déjà validée */
```

### Palette de couleurs (variables CSS)
```css
--vert:       #1A5D48   /* Bloc principal */
--vert-dark:  #004432   /* Titres et textes foncés */
--mint:       #93D4B9   /* Accents clairs */
--brun:       #7C5230   /* Boutons "Débloquer" */
--fond:       #F8FAFA   /* Fond général */
--vert-ok:    #16A34A   /* État correct */
--rouge:      #DC2626   /* État incorrect */
--cyan:       #0891B2   /* État sélectionné */
--jaune:      #F5C842   /* Survol des cartes */
```

---

## 🚫 Ce qu'il ne faut PAS faire

- **Ne pas ajouter de framework** (React, Vue, etc.) — le projet est volontairement vanilla pour la légèreté et la facilité de déploiement.
- **Ne pas utiliser `localStorage`** — non supporté dans certains environnements de déploiement (GitHub Pages statique fonctionne sans). L'inventaire est en mémoire session uniquement.
- **Ne pas modifier la structure des panels HTML** sans vérifier que `navigateTo()` dans `script.js` cible bien les bons IDs (`panel-jeu`, `panel-regles`, etc.).
- **Ne pas changer les `pairId`** dans `data.js` sans mettre à jour les `INDICES_DATA` correspondants.
- **Ne pas utiliser `#` dans les couleurs CSS** des effets shadow pptxgenjs (hors scope ici, mais note générale).

---

## ✅ Bonnes pratiques pour ce projet

### Ajouter une nouvelle paire
1. Ajouter 2 entrées dans `CARDS_DATA` avec le même `pairId` (prendre le suivant disponible)
2. La carte `type: "vivant"` doit avoir l'objet `explication` complet
3. La carte `type: "application"` a `explication: null`
4. Ajouter une entrée dans `INDICES_DATA` avec le même `pairId`
5. Vérifier que `state.pairesTotal` se recalcule bien (il compte les pairIds uniques de type "vivant")

### Modifier le nombre de cartes par round
```js
// Dans script.js, ligne ~10
state.roundSize = 8;  // ← changer ici (8 paires = 16 cartes)
```

### Modifier les photos
Les photos viennent d'Unsplash. Format attendu :
```
https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=300&h=300
```
Les photos doivent avoir une **licence commerciale libre** (Unsplash = OK).

### Ajouter une animation sur une carte
Les animations CSS sont dans `style.css` sous `@keyframes`. Les appliquer via les classes `.card--correcte`, `.card--incorrecte`, etc. dans `script.js` via `classList.add()`.

---

## 🧪 Tester le jeu

```bash
# Option 1 — Ouvrir directement
open index.html

# Option 2 — Serveur local (recommandé pour éviter les erreurs CORS sur les images)
npx serve .
# puis ouvrir http://localhost:3000

# Option 3
python -m http.server 8000
# puis ouvrir http://localhost:8000
```

**Points à tester :**
- Sélectionner 2 cartes du même type → erreur attendue
- Sélectionner Martin-pêcheur + Shinkansen → paire correcte + modal
- Trouver 8 paires → banner "Round terminé" + bouton "Round suivant"
- Acheter un indice avec 0 XP → toast erreur
- Naviguer dans tous les onglets

---

## 📐 Architecture de la navigation

```
navigateTo(id)
    └── panel-jeu        → Plateau de jeu (actif par défaut)
    └── panel-regles     → Règles + buildRegles()
    └── panel-inventaire → renderInventaire()
    └── panel-indices    → renderIndices()
    └── panel-apropos    → Statique
```

---

## 🎓 Contexte pédagogique

Ce projet est noté sur 6 critères :
1. Compréhension du brief STK Architecture
2. Concept de jeu (originalité, clarté, cohérence)
3. Qualité UX/UI (lisibilité, DA, cohérence visuelle)
4. Prototype jouable (finition, fluidité, accessibilité)
5. Travail d'équipe (organisation, rôles, communication)
6. Présentation finale (clarté, argumentation, posture pro)

**Date de soutenance** : 22 mai 2026, présence de la cliente STK Architecture.
