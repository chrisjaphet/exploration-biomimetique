# 🌿 Exploration Biomimétique

> Jeu de cartes en ligne développé pour **STK Architecture** — Agence d'architecture éco-responsable basée à Montreuil.

---

## 📋 À propos du projet

**Exploration Biomimétique** est un jeu pédagogique interactif qui permet de découvrir les liens entre le monde vivant et les innovations humaines. Les joueurs associent des cartes « Vivant » (animaux, plantes, phénomènes naturels) à des cartes « Application » (innovations technologiques, architecturales, médicales qui s'en inspirent).

**Client** : STK Architecture  
**École** : HETIC La Forge — B1  
**Promotion** : Mai 2026  
**Intervenant** : Travis de Rogez

---

## 👥 Équipe

| Membre | Rôle |
|---|---|
| **Chris** | Chef de projet / Product Owner |
| **Ewan** | UI Designer / Direction Artistique |
| **Eno** | UX Designer / Game Designer |
| **Nessim** | Développeur Front / Intégration |
| **Juldonnis** | Content Designer / Storytelling |
| **Ali & Nel** | Tests & Documentation |

---

## 🗂️ Structure du projet

```
exploration-biomimetique/
│
├── index.html          # Point d'entrée — structure HTML complète
│
├── css/
│   └── style.css       # Tous les styles (palette, composants, états des cartes, responsive)
│
├── js/
│   ├── data.js         # Données du jeu (25 paires, indices, règles)
│   └── script.js       # Logique du jeu (rounds, XP, modal, particules, inventaire)
│
├── README.md           # Documentation du projet (ce fichier)
├── CLAUDE.md           # Instructions pour les assistants IA
└── .gitignore          # Fichiers ignorés par Git
```

---

## 🎮 Mécaniques du jeu

### Comment jouer
1. Le plateau affiche **16 cartes** par round (8 paires)
2. Cliquer sur une carte **Vivant** (bordure verte) puis une carte **Application** (bordure bleue)
3. Bonne paire → explication pédagogique + **+100 XP**
4. Mauvaise paire → les cartes tremblent et restent disponibles
5. Round complet → passer au round suivant (25 paires au total = ~4 rounds)

### Système XP & Indices
- **+100 XP** par bonne paire trouvée
- XP utilisable pour acheter des **indices** (prix variables : 15, 20, 35, 50, 200 XP)
- Inventaire des paires trouvées consultable à tout moment

---

## 🎨 Design System

### Palette de couleurs
| Rôle | Hex | Usage |
|---|---|---|
| Vert principal | `#1A5D48` | Blocs, boutons actifs |
| Vert foncé | `#004432` | Titres, textes page |
| Mint clair | `#93D4B9` | Accents navbar |
| Brun | `#7C5230` | Boutons "Débloquer" indices |
| Fond | `#F8FAFA` | Fond général |
| Blanc | `#FFFFFF` | Cartes, modals |

### Typographie
- **Inter** — textes courants, boutons, titres de cartes (16px / 24px / 40px)
- **Newsreader** — logo navbar

### États des cartes
| État | Bordure | Badge |
|---|---|---|
| Normal | Noire fine (vivant: verte, appli: bleue) | — |
| Survol | Jaune `#F5C842` | — |
| Sélectionnée | Cyan `#0891B2` épaisse | — |
| Correcte | Verte `#16A34A` | ✓ vert |
| Incorrecte | Rouge `#DC2626` | ✕ rouge |
| Validée | Gris, opacité 35%, grayscale | — |

---

## ⚙️ Stack technique

| Techno | Usage |
|---|---|
| **HTML5** | Structure sémantique |
| **CSS3** | Styles, animations, responsive |
| **JavaScript Vanilla** | Logique du jeu, DOM, events |
| **Google Fonts** | Inter + Newsreader |
| **Unsplash** | Photos libres de droits commerciaux |

> ⚠️ Aucun framework, aucune dépendance externe. Le projet fonctionne en ouvrant simplement `index.html` dans un navigateur.

---

## 🚀 Lancer le projet

### En local
```bash
# Cloner le repo
git clone https://github.com/votre-username/exploration-biomimetique.git

# Ouvrir dans le navigateur
# Double-cliquer sur index.html
# OU utiliser un serveur local :
npx serve .
# OU
python -m http.server 8000
```

### Déploiement GitHub Pages
```bash
# 1. Créer le repo sur GitHub
# 2. Pousser le code
git init
git add .
git commit -m "feat: initial commit — Exploration Biomimétique v1"
git remote add origin https://github.com/votre-username/exploration-biomimetique.git
git push -u origin main

# 3. Activer GitHub Pages
# Settings → Pages → Branch: main → Save
# URL : https://votre-username.github.io/exploration-biomimetique
```

---

## 📝 Données du jeu (`js/data.js`)

Le fichier `data.js` contient trois exports :

| Variable | Contenu |
|---|---|
| `CARDS_DATA` | Tableau de 50 cartes (25 paires) avec id, type, nom, tagline, photo, explication |
| `INDICES_DATA` | Tableau de 25 indices avec pairId, texte, coût en XP |
| `REGLES_DATA` | Objet contenant les textes des règles (objectif, étapes, XP, indices) |

### Ajouter une nouvelle paire
```js
// Dans CARDS_DATA, ajouter les 2 cartes avec le même pairId
{ id: 51, pairId: 26, type: "vivant",      name: "NOM VIVANT",       tagline: "Tagline...",
  photo: "https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=300&h=300",
  explication: { titre: "Vivant & Application", texte: "Explication pédagogique..." }},
{ id: 52, pairId: 26, type: "application", name: "NOM APPLICATION",  tagline: "Tagline...",
  photo: "https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=300&h=300",
  explication: null },

// Dans INDICES_DATA, ajouter l'indice correspondant
{ id: 26, pairId: 26, titre: "Titre de l'indice", texte: "Indice...", cout: 50 },
```

---

## 🗓️ Calendrier

| Date | Étape |
|---|---|
| 04/05/2026 | Kick-off + constitution des équipes |
| 06/05/2026 | Suivi & progression |
| 09/05/2026 | **Point client intermédiaire** (présentation DA + démo) |
| 11/05/2026 | Point d'avancée avec la cliente |
| 22/05/2026 | **Soutenance finale** — dépôt 23h59 |

**Lien de dépôt** : [Google Drive](https://drive.google.com/drive/folders/1dCtr8EmtIRcE5oKZjPJdCQiT_77kMD34)

---

## 📌 Liens utiles

- [Figma — Design System & Maquettes](https://www.figma.com/design/BrlIupRaJxVPj1wPMPFSGG/)
- [Notion — Suivi du projet](https://www.notion.so/356f8f41391381cb81e7d2f978a81da1)
- [Google Drive — Dépôt des livrables](https://drive.google.com/drive/folders/1dCtr8EmtIRcE5oKZjPJdCQiT_77kMD34)
- [Présentation client (.pptx)](https://docs.google.com/presentation)
