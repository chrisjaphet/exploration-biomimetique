/* ================================================
   EXPLORATION BIOMIMÉTIQUE — script.js v3
   Systèmes : Points, Super Indice, Trophées,
   Classement, Tutoriel Darwin
   ================================================ */

// ============================================
// CONSTANTES
// ============================================
const TROPHEES_DATA = [
  { id:'premiere',        icon:'🎯', nom:'Première Découverte', desc:'Trouver sa première paire',        bonus:0   },
  { id:'combo2',          icon:'🌱', nom:'Bon début',           desc:'2 bonnes paires d\'affilée',        bonus:20  },
  { id:'combo3',          icon:'🔥', nom:'En feu',              desc:'3 bonnes paires d\'affilée',        bonus:30  },
  { id:'combo5',          icon:'⚡', nom:'Inarrêtable',         desc:'5 bonnes paires d\'affilée',        bonus:50  },
  { id:'combo10',         icon:'🏆', nom:'Légende vivante',     desc:'10 bonnes paires d\'affilée',       bonus:100 },
  { id:'pts100',          icon:'🔍', nom:'Explorateur',         desc:'100 points atteints',               bonus:0   },
  { id:'pts300',          icon:'🌿', nom:'Naturaliste',         desc:'300 points atteints',               bonus:0   },
  { id:'pts500',          icon:'🦋', nom:'Expert',              desc:'500 points atteints',               bonus:0   },
  { id:'pts1000',         icon:'🌍', nom:'Maître du Vivant',    desc:'1000 points atteints',              bonus:0   },
  { id:'speed',           icon:'⚡', nom:'Éclair',              desc:'Paire trouvée en moins de 8s',      bonus:0   },
  { id:'naturaliste_pur', icon:'🌿', nom:'Naturaliste Pur',     desc:'Round terminé sans Super Indice',   bonus:0   },
  { id:'stratege',        icon:'🧠', nom:'Stratège',            desc:'Super Indice utilisé',              bonus:0   },
  { id:'complet',         icon:'🌍', nom:'Explorateur Complet', desc:'Toutes les paires trouvées !',      bonus:0   },
];

const BOTS = [
  { nom:'Chris', score:1240, trophee:'Légende vivante 🏆' },
  { nom:'Ewan',  score:980,  trophee:'Inarrêtable ⚡'    },
  { nom:'Eno',   score:720,  trophee:'En feu 🔥'         },
];

const TUTORIAL_STEPS = [
  { text: 'Les cartes vertes représentent le VIVANT 🌿 (animaux, plantes). Les cartes marron représentent les APPLICATIONS humaines ⚙️ (innovations, architectures). Votre but est d\'associer les paires correspondantes !', btn: 'Suivant →', hl: 'cards-grid' },
  { text: 'Pour faire une association, vous cliquerez sur une carte Vivant (verte) puis sur sa carte Application (marron). Si l\'association est correcte, vous découvrirez le secret scientifique qui les lie et gagnerez +100 XP !', btn: 'Suivant →', hl: 'cards-grid' },
  { text: 'Vous commencez la partie avec 30 XP. Vos points s\'affichent ici. Ils vous serviront à débloquer des indices ou à utiliser des fonctionnalités spéciales.', btn: 'Suivant →', hl: 'pts-display' },
  { text: 'Dès que vous atteignez 50 XP, vous pouvez utiliser le bouton Super Indice (✨). Il révélera temporairement la paire d\'une carte sélectionnée pendant 3 secondes.', btn: 'Suivant →', hl: 'btn-super-indice' },
  { text: 'Associez rapidement les paires pour faire monter votre combo, débloquer des trophées et tenter de dépasser Chris, Ewan et Eno au classement !', btn: 'Commencer à jouer ! 🚀', hl: null },
];

// ============================================
// STATE
// ============================================
const state = {
  xp: 30,
  pairesTotal: 0,
  pairesReussies: 0,
  selectedCards: [],
  validatedPairs: [],
  indicesAchetes: [],
  inventaire: [],
  incorrectTimeout: null,
  roundSize: 8,
  currentRound: 1,
  totalRounds: 0,
  roundPairs: [],
  roundPairsRestantes: 0,
  allPairIds: [],
  superIndiceActif: false,
  combo: 0,
  trophiesUnlocked: [],
  superIndiceUsedThisRound: false,
  superIndicePenaltyTurns: 0,
  firstCardClickTime: null,
  trophyQueue: [],
  trophyShowing: false,
  sofiaReminderCount: 0,
  idleTimer: null,
  sofiaAutoCloseTimer: null,
};

// ============================================
// SPLASH SCREEN
// ============================================
function initSplash() {
  const splash = document.getElementById('splash-screen');
  if (!splash) return;

  const citations = [
    "La nature n'invente pas — elle perfectionne depuis 3,8 milliards d'années.",
    "Chaque espèce est une solution éprouvée à un problème que nous n'avons pas encore résolu.",
    "Le génie humain imite. La nature crée.",
    "Observer le vivant, c'est lire le manuel d'instructions de l'univers.",
    "La biodiversité est notre plus grande bibliothèque d'inventions."
  ];
  const citEl = document.getElementById('splash-citation');
  if (citEl) citEl.textContent = citations[Math.floor(Math.random() * citations.length)];

  const loaderTexts = [
    "Observation du vivant...",
    "Analyse des structures naturelles...",
    "Cartographie des innovations...",
    "Connexion entre espèces et inventions...",
    "Préparation de vos 25 découvertes...",
    "Le jeu est prêt."
  ];
  const loaderEl = document.getElementById('splash-loader-text');
  let loaderIdx = 0;
  const loaderInterval = setInterval(() => {
    loaderIdx = (loaderIdx + 1) % loaderTexts.length;
    if (loaderEl) {
      loaderEl.style.opacity = '0';
      setTimeout(() => {
        loaderEl.textContent = loaderTexts[loaderIdx];
        loaderEl.style.opacity = '1';
      }, 280);
    }
  }, 1200);

  const progressBar = document.getElementById('splash-progress-bar');
  const percentEl   = document.getElementById('splash-percent');
  const splashBtn   = document.getElementById('splash-btn');
  let progress = 0;
  let imagesLoaded = 0;
  let minTimeElapsed = false;

  function setProgress(pct) {
    pct = Math.min(100, Math.max(progress, pct));
    progress = pct;
    if (progressBar) progressBar.style.width = pct + '%';
    if (percentEl)   percentEl.textContent   = Math.round(pct) + '%';
  }

  function showBtn() {
    setProgress(100);
    clearInterval(loaderInterval);
    if (loaderEl) loaderEl.textContent = loaderTexts[loaderTexts.length - 1];
    if (splashBtn && !splashBtn.classList.contains('visible')) {
      splashBtn.classList.add('visible');
    }
  }

  function checkDone() {
    const total = typeof CARDS_DATA !== 'undefined' ? CARDS_DATA.length : 1;
    if (imagesLoaded >= total && minTimeElapsed) showBtn();
  }

  // Toujours afficher le bouton après 3.5s, peu importe les images
  setTimeout(() => { minTimeElapsed = true; showBtn(); }, 3500);

  if (splashBtn) splashBtn.addEventListener('click', dismissSplash);

  if (typeof CARDS_DATA !== 'undefined' && CARDS_DATA.length) {
    const total = CARDS_DATA.length;
    CARDS_DATA.forEach(card => {
      const img = new Image();
      img.onload = img.onerror = () => {
        imagesLoaded++;
        setProgress(Math.min(94, (imagesLoaded / total) * 94));
        if (imagesLoaded >= total) checkDone();
      };
      img.src = card.photo;
    });
  } else {
    const iv = setInterval(() => {
      setProgress(progress + Math.random() * 7);
      if (progress >= 95) { clearInterval(iv); imagesLoaded = 1; checkDone(); }
    }, 200);
  }
}

function dismissSplash() {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.classList.add('hide');
    setTimeout(() => {
      if (splash.parentNode) splash.parentNode.removeChild(splash);
      setTimeout(showSofiaIntro, 600);
    }, 850);
  }
}

// ============================================
// IDLE TIMER — Sofia rappels
// ============================================
function startIdleTimer() {
  stopIdleTimer();
  state.idleTimer = setTimeout(sofiaIdleReminder, 20000);
}

function stopIdleTimer() {
  if (state.idleTimer) { clearTimeout(state.idleTimer); state.idleTimer = null; }
  if (state.sofiaAutoCloseTimer) { clearTimeout(state.sofiaAutoCloseTimer); state.sofiaAutoCloseTimer = null; }
}

function sofiaIdleReminder() {
  if (state.sofiaReminderCount >= 2) return;
  const overlay = document.getElementById('tutorial-overlay');
  if (!overlay) return;
  // Ne pas interrompre un tuto en cours
  if (overlay.style.display !== 'none' && overlay.classList.contains('show')) return;

  state.sofiaReminderCount++;

  const textEl  = document.getElementById('darwin-text');
  const nextBtn = document.getElementById('darwin-next');
  const skipBtn = document.getElementById('darwin-skip');
  const spotEl  = document.getElementById('tutorial-spotlight');

  let msg;
  if (state.sofiaReminderCount === 1) {
    msg = 'Tu galères un peu ? 😅 N\'oublie pas que tu peux acheter des **Indices** dans l\'onglet Indices en haut — ils te donnent des pistes pour trouver une paire !';
  } else {
    msg = 'Dernier conseil 🌟 : si tu as 50 pts ou plus, utilise le bouton ✨ Super Indice là-haut à droite — il révèle la paire exacte d\'une carte pendant 3 secondes !';
    // Highlight super indice button
    setTimeout(() => {
      const btn = document.getElementById('btn-super-indice');
      if (btn) {
        btn.classList.add('highlight-pulse');
        setTimeout(() => btn.classList.remove('highlight-pulse'), 3700);
      }
    }, 400);
  }

  if (textEl) textEl.textContent = msg.replace(/\*\*(.*?)\*\*/g, '$1');
  if (nextBtn) nextBtn.textContent = 'Compris ! 👍';
  if (skipBtn) skipBtn.textContent = 'Fermer';
  if (spotEl)  spotEl.style.cssText = 'display:none';

  overlay.classList.add('idle-mode');
  overlay.style.display = 'flex';
  void overlay.offsetWidth;
  overlay.classList.add('show');

  // Shake d'attention 1.5s après l'apparition
  setTimeout(sofiaShake, 1500);

  // Fermeture auto après 12s si le joueur ne réagit pas
  state.sofiaAutoCloseTimer = setTimeout(() => {
    closeTutorial();
    overlay.classList.remove('idle-mode');
    // Relancer le timer si encore des rappels dispo
    if (state.sofiaReminderCount < 2) startIdleTimer();
  }, 12000);

  // Override boutons pour fermer sans lancer le tuto
  if (nextBtn) {
    const onNext = () => {
      closeTutorial();
      overlay.classList.remove('idle-mode');
      nextBtn.removeEventListener('click', onNext);
      if (state.sofiaReminderCount < 2) startIdleTimer();
    };
    nextBtn.addEventListener('click', onNext, { once: true });
  }
}

function sofiaShake() {
  const container = document.querySelector('.darwin-container');
  if (!container) return;
  container.classList.add('sofia-shake');
  setTimeout(() => container.classList.remove('sofia-shake'), 600);
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initSplash();

  state.xp = 30;

  try {
    const saved = localStorage.getItem('biomimetique_trophies');
    if (saved) state.trophiesUnlocked = JSON.parse(saved);
  } catch(e) {}

  if (typeof CARDS_DATA !== 'undefined') {
    state.pairesTotal = CARDS_DATA.filter(c => c.type === 'vivant').length;
    const pairIds = [...new Set(CARDS_DATA.map(c => c.pairId))].sort(() => Math.random() - 0.5);
    state.allPairIds = pairIds;
    state.totalRounds = Math.ceil(pairIds.length / state.roundSize);
  }

  buildRegles();
  bindNav();
  bindModal();
  bindBurger();
  bindSearch();

  document.getElementById('btn-next-round')?.addEventListener('click', () => startRound(state.currentRound + 1));

  const btnSI = document.getElementById('btn-super-indice');
  if (btnSI) {
    btnSI.addEventListener('click', e => {
      e.stopPropagation();
      if (state.superIndiceActif) { cancelSuperIndice(); return; }
      if (state.xp < 50) {
        showToast('Pas assez de points pour un Super Indice (50 pts requis)', 'error');
      } else {
        activateSuperIndice();
      }
    });
  }

  document.getElementById('btn-tuto')?.addEventListener('click', showSofiaIntro);

  const nextBtn = document.getElementById('darwin-next');
  const skipBtn = document.getElementById('darwin-skip');
  if (nextBtn) nextBtn.addEventListener('click', () => {
    if (tutorialStep === -1) showTutorialStep(0);
    else showTutorialStep(tutorialStep + 1);
  });
  if (skipBtn) skipBtn.addEventListener('click', closeTutorial);

  startRound(1);
  updatePoints();
  updateScore();
  // Lancer le timer idle dès que le jeu est prêt
  setTimeout(startIdleTimer, 3000);
});

// ============================================
// NAV
// ============================================
function bindNav() {
  document.querySelectorAll('.navbar-links button[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.panel);
      document.querySelector('.navbar-links').classList.remove('open');
    });
  });
}

function navigateTo(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.navbar-links button').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + id)?.classList.add('active');
  document.querySelector(`[data-panel="${id}"]`)?.classList.add('active');
  if (id === 'inventaire') { renderInventaire(); renderTrophees(); }
  if (id === 'indices')    renderIndices();
  if (id === 'classement') renderClassement();
}

function bindBurger() {
  document.getElementById('burger')?.addEventListener('click', () =>
    document.querySelector('.navbar-links').classList.toggle('open'));
}

// ============================================
// ROUNDS
// ============================================
function startRound(n) {
  document.getElementById('round-banner')?.classList.remove('show');
  document.getElementById('btn-next-round')?.classList.remove('visible');
  state.currentRound = n;
  state.superIndiceUsedThisRound = false;
  state.firstCardClickTime = null;
  const start = (n - 1) * state.roundSize;
  state.roundPairs = state.allPairIds.slice(start, start + state.roundSize);
  state.roundPairsRestantes = state.roundPairs.length;
  renderCards();
}

// ============================================
// CARTES
// ============================================
function renderCards(filter = '') {
  const grid = document.getElementById('cards-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (typeof CARDS_DATA === 'undefined') return;

  let cards = CARDS_DATA.filter(c => state.roundPairs.includes(c.pairId));
  if (filter) {
    const q = filter.toLowerCase();
    cards = cards.filter(c => c.name.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q));
  }
  const shuffled = [...cards].sort(() => Math.random() - 0.5);

  if (!shuffled.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--texte-doux);font-style:italic">Aucune carte ne correspond à votre recherche.</div>`;
    return;
  }
  shuffled.forEach(card => grid.appendChild(makeCard(card)));

  state.validatedPairs.forEach(pid => {
    if (!state.roundPairs.includes(pid)) return;
    document.querySelectorAll(`.card[data-pid="${pid}"]`).forEach(el => {
      el.classList.remove('card--selected','card--correcte','card--incorrecte');
      el.classList.add('card--correcte','card--validee');
      const badge = el.querySelector('.card-badge');
      if (badge) { badge.style.display='flex'; badge.textContent='✓'; badge.style.background='#16A34A'; }
    });
  });
}

function makeCard(card) {
  const div = document.createElement('div');
  div.className = `card card--${card.type}`;
  div.dataset.id  = card.id;
  div.dataset.pid = card.pairId;
  const typeLabel = card.type === 'vivant' ? '🌿 Vivant' : '⚙️ Application';
  div.innerHTML = `
    <div class="card-badge"></div>
    <div class="card-type-pill">${typeLabel}</div>
    <div class="card-title">${card.name}</div>
    <div class="card-photo-wrap">
      <img src="${card.photo}" alt="${card.name}" loading="lazy"
           onerror="this.parentElement.style.background='var(--beige-fonce)';this.style.display='none'"/>
    </div>
    <div class="card-tagline">"${card.tagline}"</div>
  `;
  div.addEventListener('click', () => onCardClick(card, div));
  return div;
}

// ============================================
// RECHERCHE
// ============================================
function bindSearch() {
  let t;
  document.getElementById('search-input')?.addEventListener('input', e => {
    clearTimeout(t);
    t = setTimeout(() => renderCards(e.target.value.trim()), 200);
  });
}

// ============================================
// LOGIQUE JEU
// ============================================
function onCardClick(card, el) {
  if (el.classList.contains('card--validee')) return;

  if (state.superIndiceActif) { triggerSuperIndice(card, el); return; }
  if (el.classList.contains('card--incorrecte')) return;
  if (state.incorrectTimeout) return;

  if (el.classList.contains('card--selected')) {
    el.classList.remove('card--selected');
    state.selectedCards = state.selectedCards.filter(c => c.card.id !== card.id);
    return;
  }
  if (state.selectedCards.length >= 2) return;

  if (state.selectedCards.length === 0) state.firstCardClickTime = Date.now();

  el.classList.add('card--selected');
  state.selectedCards.push({ card, el });
  if (state.selectedCards.length === 2) setTimeout(checkPair, 280);
}

function checkPair() {
  const [a, b] = state.selectedCards;
  if (a.card.type === b.card.type) { markIncorrect(a.el, b.el); return; }
  if (a.card.pairId === b.card.pairId) markCorrect(a, b);
  else markIncorrect(a.el, b.el);
}

function markCorrect(a, b) {
  const vivant = [a.card, b.card].find(c => c.type === 'vivant');
  const appli  = [a.card, b.card].find(c => c.type === 'application');

  [a.el, b.el].forEach(el => {
    el.classList.remove('card--selected');
    el.classList.add('card--correcte');
    const badge = el.querySelector('.card-badge');
    badge.textContent = '✓'; badge.style.background = '#16A34A';
    setTimeout(() => el.classList.add('card--validee'), 900);
  });

  const oldPts = state.xp;
  const penaltyActive = state.superIndicePenaltyTurns > 0;

  if (penaltyActive) {
    state.superIndicePenaltyTurns--;
    showFloatingScore(a.el, '🔒 +0', '#8B3A3A');
    if (state.superIndicePenaltyTurns > 0) {
      showToast(`🔒 Pas de points (Super Indice) — encore ${state.superIndicePenaltyTurns} paire(s)`);
    } else {
      showToast('✅ Pénalité terminée — les points reprennent !');
    }
  } else {
    state.xp += 100;
    showFloatingScore(a.el, '+100', '#2D5A3D');
  }

  state.pairesReussies++;
  state.validatedPairs.push(a.card.pairId);
  state.roundPairsRestantes--;
  state.inventaire.push({ vivant, appli });
  state.selectedCards = [];
  state.combo++;

  // Reset idle timer à chaque bonne réponse
  startIdleTimer();

  if (state.firstCardClickTime) {
    const elapsed = (Date.now() - state.firstCardClickTime) / 1000;
    if (elapsed < 8) checkAndUnlockTrophy('speed');
    state.firstCardClickTime = null;
  }

  spawnParticles(a.el);
  spawnParticles(b.el);
  updatePoints();
  updateScore();

  if (state.pairesReussies === 1) checkAndUnlockTrophy('premiere');
  if (state.combo >= 2)  checkAndUnlockTrophy('combo2');
  if (state.combo >= 3)  checkAndUnlockTrophy('combo3');
  if (state.combo >= 5)  checkAndUnlockTrophy('combo5');
  if (state.combo >= 10) checkAndUnlockTrophy('combo10');
  if (state.xp >= 100)   checkAndUnlockTrophy('pts100');
  if (state.xp >= 300)   checkAndUnlockTrophy('pts300');
  if (state.xp >= 500)   checkAndUnlockTrophy('pts500');
  if (state.xp >= 1000)  checkAndUnlockTrophy('pts1000');

  checkLeaderboardMessages(oldPts, state.xp);

  setTimeout(() => openModal(vivant, appli), 650);
  if (state.roundPairsRestantes === 0) setTimeout(onRoundComplete, 2200);
}

function markIncorrect(elA, elB) {
  [elA, elB].forEach(el => {
    el.classList.remove('card--selected');
    el.classList.add('card--incorrecte');
    const badge = el.querySelector('.card-badge');
    badge.textContent = '✕'; badge.style.background = 'var(--rouge)';
  });
  state.combo = 0;
  state.firstCardClickTime = null;

  state.incorrectTimeout = setTimeout(() => {
    [elA, elB].forEach(el => {
      el.classList.remove('card--incorrecte');
      const badge = el.querySelector('.card-badge');
      badge.textContent = ''; badge.style.background = '';
    });
    state.selectedCards = [];
    state.incorrectTimeout = null;
  }, 800);
}

// ============================================
// FLOATING SCORE
// ============================================
function showFloatingScore(el, text, color) {
  const rect = el.getBoundingClientRect();
  const f = document.createElement('div');
  f.className = 'floating-score';
  f.textContent = text;
  if (color) f.style.color = color;
  f.style.left = (rect.left + rect.width / 2 + window.scrollX) + 'px';
  f.style.top  = (rect.top  + window.scrollY) + 'px';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 1100);
}

// ============================================
// ROUND COMPLETE
// ============================================
function onRoundComplete() {
  if (!state.superIndiceUsedThisRound) checkAndUnlockTrophy('naturaliste_pur');

  const banner = document.getElementById('round-banner');
  if (banner) banner.classList.add('show');
  document.getElementById('round-banner-title').textContent = `Round ${state.currentRound} terminé ! 🎉`;
  document.getElementById('round-banner-sub').textContent =
    state.currentRound < state.totalRounds
      ? `${state.roundPairs.length} paires trouvées. Prêt pour le round suivant ?`
      : `Vous avez complété tous les ${state.totalRounds} rounds !`;

  if (state.currentRound < state.totalRounds) {
    document.getElementById('btn-next-round').classList.add('visible');
  } else {
    setTimeout(showVictoire, 800);
  }
}

// ============================================
// PARTICULES
// ============================================
function spawnParticles(el) {
  const r = el.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top  + r.height / 2;
  const colors = ['#2D5A3D','#93D4B9','#C4952A','#1A3A2A','#5BBFB9','#fff'];
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const s = 5 + Math.random() * 7;
    const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.6;
    const d = 50 + Math.random() * 70;
    p.style.cssText = `left:${cx-s/2}px;top:${cy-s/2}px;width:${s}px;height:${s}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      --tx:${Math.cos(angle)*d}px;--ty:${Math.sin(angle)*d-30}px;
      animation-duration:${.65+Math.random()*.35}s;`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }
}

// ============================================
// MODAL
// ============================================
function bindModal() {
  const ov = document.getElementById('modal-overlay');
  if (!ov) return;
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
  document.getElementById('modal-close')?.addEventListener('click', closeModal);
}

function openModal(vivant, appli) {
  document.getElementById('modal-title').textContent = vivant.explication.titre;
  document.getElementById('modal-pair-a-img').src  = vivant.photo;
  document.getElementById('modal-pair-a-img').alt  = vivant.name;
  document.getElementById('modal-pair-a-name').textContent = vivant.name;
  document.getElementById('modal-pair-b-img').src  = appli.photo;
  document.getElementById('modal-pair-b-img').alt  = appli.name;
  document.getElementById('modal-pair-b-name').textContent = appli.name;
  document.getElementById('modal-text').textContent = vivant.explication.texte;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// ============================================
// POINTS
// ============================================
function updatePoints() {
  const pTotal = state.pairesTotal || 1;
  const pct = Math.min(100, (state.xp / (pTotal * 100 + 30)) * 100);
  const xpBar = document.getElementById('xp-bar');
  if (xpBar) xpBar.style.width = pct + '%';

  const ptsVal = document.getElementById('pts-val');
  if (ptsVal) {
    ptsVal.textContent = state.xp;
    ptsVal.classList.remove('pts-bump');
    void ptsVal.offsetWidth;
    ptsVal.classList.add('pts-bump');
  }

  document.getElementById('btn-super-indice')?.classList.toggle('available', state.xp >= 50);

  const prev = parseInt(localStorage.getItem('biomimetique_highscore') || '0');
  if (state.xp > prev) localStorage.setItem('biomimetique_highscore', state.xp);
}

const updateXP = updatePoints;

function updateScore() {
  const badge = document.getElementById('score-badge');
  if (badge) {
    badge.textContent = `${state.pairesReussies} / ${state.pairesTotal} PAIRES`;
  }

  const pTotal = state.pairesTotal || 25;
  const pct = Math.min(100, (state.pairesReussies / pTotal) * 100);

  const fillEl = document.getElementById('completion-progress-fill');
  if (fillEl) {
    fillEl.style.width = pct + '%';
  }

  const leafEl = document.getElementById('completion-progress-leaf');
  if (leafEl) {
    leafEl.style.left = pct + '%';
    leafEl.classList.remove('leaf-active');
    void leafEl.offsetWidth; // trigger reflow
    leafEl.classList.add('leaf-active');
  }
}

// ============================================
// INVENTAIRE
// ============================================
function renderInventaire() {
  document.getElementById('inv-xp-val')?.textContent && (document.getElementById('inv-xp-val').textContent = state.xp);
  document.getElementById('inv-pairs-val')?.textContent && (document.getElementById('inv-pairs-val').textContent = state.pairesReussies);
  document.getElementById('inv-indices-val')?.textContent && (document.getElementById('inv-indices-val').textContent = state.indicesAchetes.length);

  if (document.getElementById('inv-xp-val')) document.getElementById('inv-xp-val').textContent = state.xp;
  if (document.getElementById('inv-pairs-val')) document.getElementById('inv-pairs-val').textContent = state.pairesReussies;
  if (document.getElementById('inv-indices-val')) document.getElementById('inv-indices-val').textContent = state.indicesAchetes.length;

  const dots = document.getElementById('inv-pairs-dots');
  if (dots) {
    dots.innerHTML = '';
    for (let i = 0; i < Math.min(state.pairesTotal, 5); i++) {
      const d = document.createElement('div');
      d.className = 'dot' + (i < state.pairesReussies ? ' active' : '');
      dots.appendChild(d);
    }
  }

  const grid = document.getElementById('collection-grid');
  if (!grid) return;
  grid.innerHTML = '';
  state.inventaire.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'collection-card';
    div.innerHTML = `
      <img src="${item.vivant.photo}" alt="${item.vivant.name}" loading="lazy"/>
      <div class="collection-card-info">
        <span class="collection-card-tag">BIO-${String(i+1).padStart(2,'0')}</span>
        <div class="collection-card-name">${item.vivant.explication.titre.split('&')[0].trim()}</div>
        <div class="collection-card-desc">Inspiration ${item.appli.name.toLowerCase()}</div>
      </div>`;
    div.addEventListener('click', () => openModal(item.vivant, item.appli));
    grid.appendChild(div);
  });
  const slotsRestants = Math.max(0, Math.min(4, 4 - state.inventaire.length));
  for (let i = 0; i < slotsRestants; i++) {
    const slot = document.createElement('div');
    slot.className = 'collection-slot';
    slot.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>Emplacement vide</span>`;
    grid.appendChild(slot);
  }
}

// ============================================
// INDICES
// ============================================
function renderIndices() {
  const grid = document.getElementById('indices-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (typeof INDICES_DATA === 'undefined') return;

  INDICES_DATA.forEach(indice => {
    const bought    = state.indicesAchetes.includes(indice.pairId);
    const validated = state.validatedPairs.includes(indice.pairId);
    const isUnlocked = bought || validated;
    const div = document.createElement('div');
    div.className = 'indice-card';
    let footerHTML = '';
    if (validated) {
      footerHTML = `<span class="indice-analyse">@ Analysé</span>`;
    } else if (bought) {
      footerHTML = `<button class="consulter-link">Consulter l'indice ›</button>`;
    } else {
      footerHTML = `<div class="indice-lock">
        <div class="lock-icon">🔒</div>
        <button class="btn-debloquer" onclick="acheterIndice(${indice.pairId})" ${state.xp < indice.cout ? 'disabled' : ''}>
          Débloquer (${indice.cout} pts)
        </button></div>`;
    }
    div.innerHTML = `
      <div class="indice-header">
        <div>
          <div class="indice-icon">🌿</div>
          <div class="indice-titre">${indice.titre}</div>
        </div>
        ${isUnlocked ? '<span class="badge-debloque">Débloqué</span>' : ''}
      </div>
      <div class="indice-texte ${isUnlocked ? '' : 'locked'}">${indice.texte}</div>
      <div class="indice-footer">${footerHTML}</div>`;
    grid.appendChild(div);
  });
}

function acheterIndice(pairId) {
  const i = INDICES_DATA.find(x => x.pairId === pairId);
  if (!i || state.xp < i.cout) { showToast('Pas assez de points !', 'error'); return; }
  state.xp -= i.cout;
  state.indicesAchetes.push(pairId);
  updatePoints();
  renderIndices();
  showToast('💡 Indice débloqué !', 'info');
}

// ============================================
// RÈGLES
// ============================================
function buildRegles() {
  const steps = document.getElementById('regles-steps');
  if (steps && typeof REGLES_DATA !== 'undefined' && REGLES_DATA.etapes) {
    steps.innerHTML = '';
    REGLES_DATA.etapes.forEach((text, i) => {
      const step = document.createElement('div');
      step.className = 'regles-step';
      const colored = text
        .replace(/Vivant/g, '<strong>Vivant</strong>')
        .replace(/Application/g, '<strong class="app">Application</strong>');
      step.innerHTML = `<div class="step-num">0${i+1}</div><div class="step-text">${colored}</div>`;
      steps.appendChild(step);
    });
  }
  if (typeof REGLES_DATA !== 'undefined') {
    const obj = document.getElementById('regles-objectif');
    if (obj) obj.textContent = REGLES_DATA.objectif;
    const rxp = document.getElementById('regles-xp');
    if (rxp) rxp.textContent = REGLES_DATA.xp;
    const rind = document.getElementById('regles-indices');
    if (rind) rind.textContent = REGLES_DATA.indices;
  }
}

// ============================================
// VICTOIRE
// ============================================
function showVictoire() {
  checkAndUnlockTrophy('complet');
  const banner = document.getElementById('victoire-banner');
  if (banner) banner.classList.add('show');
  const vicXp = document.getElementById('victoire-xp');
  if (vicXp) vicXp.textContent = state.xp + ' pts';
  launchConfetti();
  showToast('🎉 Toutes les paires trouvées !', 'success');
}

function launchConfetti() {
  const colors = ['#2D5A3D','#93D4B9','#C4952A','#1A3A2A','#5BBFB9','#fff'];
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      const s = 7 + Math.random() * 9;
      const dur = 1.6 + Math.random() * 2;
      p.style.cssText = `left:${Math.random()*window.innerWidth}px;top:-20px;
        width:${s}px;height:${s}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        border-radius:${Math.random()>.5?'50%':'3px'};
        --cx:${(Math.random()-.5)*220}px;--cr:${(Math.random()-.5)*720}deg;
        animation-duration:${dur}s;`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), dur * 1000 + 100);
    }, i * 28);
  }
}

// ============================================
// TOAST
// ============================================
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

// ============================================
// SUPER INDICE
// ============================================
function activateSuperIndice() {
  state.superIndiceActif = true;
  document.getElementById('btn-super-indice')?.classList.add('active');
  document.getElementById('cards-grid')?.classList.add('super-indice-active');
  showToast('Clique sur une carte pour révéler sa paire ✨');
  setTimeout(() => document.addEventListener('click', onDocClickSI), 0);
}

function cancelSuperIndice() {
  state.superIndiceActif = false;
  document.getElementById('btn-super-indice')?.classList.remove('active');
  document.getElementById('cards-grid')?.classList.remove('super-indice-active');
  document.removeEventListener('click', onDocClickSI);
  showToast('Super Indice annulé');
}

function onDocClickSI(e) {
  if (!state.superIndiceActif) return;
  const cardEl = e.target.closest('.card');
  if (cardEl && !cardEl.classList.contains('card--validee')) return;
  cancelSuperIndice();
}

function triggerSuperIndice(card, el) {
  state.superIndiceActif = false;
  state.superIndiceUsedThisRound = true;
  state.superIndicePenaltyTurns = 3;
  document.getElementById('btn-super-indice')?.classList.remove('active');
  document.getElementById('cards-grid')?.classList.remove('super-indice-active');
  document.removeEventListener('click', onDocClickSI);

  state.xp -= 50;
  updatePoints();
  showFloatingScore(el, '-50 pts', '#8B3A3A');
  showToast('✨ Super Indice activé ! Pas de points pendant 3 paires 🔒');
  checkAndUnlockTrophy('stratege');

  const cardsInDOM = document.querySelectorAll(`#cards-grid .card[data-pid="${card.pairId}"]`);
  cardsInDOM.forEach(c => c.classList.add('card--illuminated'));
  setTimeout(() => cardsInDOM.forEach(c => c.classList.remove('card--illuminated')), 3000);
}

// ============================================
// TROPHÉES
// ============================================
function checkAndUnlockTrophy(id) {
  if (state.trophiesUnlocked.includes(id)) return;
  const trophy = TROPHEES_DATA.find(t => t.id === id);
  if (!trophy) return;

  state.trophiesUnlocked.push(id);
  try { localStorage.setItem('biomimetique_trophies', JSON.stringify(state.trophiesUnlocked)); } catch(e) {}

  if (trophy.bonus > 0) {
    state.xp += trophy.bonus;
    updatePoints();
  }

  state.trophyQueue.push(trophy);
  if (!state.trophyShowing) showNextTrophy();
}

function showNextTrophy() {
  if (!state.trophyQueue.length) { state.trophyShowing = false; return; }
  state.trophyShowing = true;
  const trophy = state.trophyQueue.shift();

  const popup = document.getElementById('trophy-popup');
  if (!popup) { state.trophyShowing = false; return; }

  document.getElementById('trophy-popup-icon').textContent = trophy.icon;
  document.getElementById('trophy-popup-nom').textContent  = trophy.nom;
  document.getElementById('trophy-popup-desc').textContent = trophy.desc;
  const bonusEl = document.getElementById('trophy-popup-bonus');
  if (bonusEl) {
    bonusEl.textContent = trophy.bonus > 0 ? `+${trophy.bonus} pts bonus !` : '';
    bonusEl.style.display = trophy.bonus > 0 ? 'block' : 'none';
  }

  popup.style.display = 'flex';
  void popup.offsetWidth;
  popup.classList.add('show');

  setTimeout(() => {
    popup.classList.remove('show');
    setTimeout(() => {
      popup.style.display = 'none';
      setTimeout(showNextTrophy, 300);
    }, 400);
  }, 3000);
}

function renderTrophees() {
  const grid = document.getElementById('trophees-grid');
  if (!grid) return;
  grid.innerHTML = '';
  TROPHEES_DATA.forEach(trophy => {
    const unlocked = state.trophiesUnlocked.includes(trophy.id);
    const div = document.createElement('div');
    div.className = 'trophee-card' + (unlocked ? ' unlocked' : ' locked');
    div.innerHTML = `
      <div class="trophee-icon">${unlocked ? trophy.icon : '🔒'}</div>
      <div class="trophee-nom">${trophy.nom}</div>
      <div class="trophee-desc">${trophy.desc}</div>
      ${trophy.bonus > 0 ? `<div class="trophee-bonus">+${trophy.bonus} pts</div>` : ''}`;
    grid.appendChild(div);
  });
}

// ============================================
// CLASSEMENT
// ============================================
function renderClassement() {
  const wrap = document.getElementById('classement-wrap');
  if (!wrap) return;

  const playerScore = state.xp;
  const highScore   = Math.max(playerScore, parseInt(localStorage.getItem('biomimetique_highscore') || '0'));

  const allPlayers = [
    ...BOTS.map(b => ({ ...b, isBot: true })),
    { nom:'Vous', score:playerScore, trophee:getBestTrophee(), isBot:false },
  ].sort((a, b) => b.score - a.score);

  const ranks = ['🥇','🥈','🥉'];

  wrap.innerHTML = `
    <div class="classement-hs">
      <span class="hs-label">Votre meilleur score</span>
      <span class="hs-val">⭐ ${highScore} pts</span>
    </div>
    <div class="classement-table">
      ${allPlayers.map((p, i) => `
        <div class="classement-row ${!p.isBot ? 'player-row' : ''}">
          <div class="classement-rang">${ranks[i] || '#'+(i+1)}</div>
          <div class="classement-nom">${p.nom}</div>
          <div class="classement-score">⭐ ${p.score}</div>
          <div class="classement-trophee">${p.trophee || '—'}</div>
        </div>`).join('')}
    </div>
    <div class="classement-msg ${playerScore > 720 ? 'success' : 'muted'}">
      ${getLeaderboardMessage(playerScore)}
    </div>`;
}

function getBestTrophee() {
  const order = ['combo10','combo5','combo3','combo2','pts1000','pts500','pts300','pts100','premiere'];
  for (const id of order) {
    if (state.trophiesUnlocked.includes(id)) {
      const t = TROPHEES_DATA.find(x => x.id === id);
      return t ? t.nom + ' ' + t.icon : '';
    }
  }
  return '—';
}

function getLeaderboardMessage(score) {
  if (score > 1240) return '🏆 Tu as dépassé Chris ! Tu es le meilleur !';
  if (score > 980)  return '💪 Tu as dépassé Ewan !';
  if (score > 720)  return '👏 Tu as dépassé Eno !';
  return 'Continue pour grimper dans le classement !';
}

function checkLeaderboardMessages(oldPts, newPts) {
  if (oldPts <= 720  && newPts > 720)  { launchConfetti(); showToast('🎉 Tu as dépassé Eno !', 'success'); }
  if (oldPts <= 980  && newPts > 980)  { launchConfetti(); showToast('🎉 Tu as dépassé Ewan !', 'success'); }
  if (oldPts <= 1240 && newPts > 1240) { launchConfetti(); showToast('🏆 Tu as dépassé Chris ! Tu es le meilleur !', 'success'); }
}

// ============================================
// TUTORIEL SOFIA
// ============================================
let tutorialStep = -1;

function showSofiaIntro() {
  tutorialStep = -1;
  const overlay = document.getElementById('tutorial-overlay');
  if (!overlay) return;

  const textEl = document.getElementById('darwin-text');
  if (textEl) textEl.textContent = 'Bonjour ! Je m\'appelle Sofia, votre guide biomimétique. 🌿 Souhaitez-vous que je vous explique le jeu et toutes ses fonctionnalités ?';

  const nextBtn = document.getElementById('darwin-next');
  if (nextBtn) nextBtn.textContent = 'Oui, guide-moi ! →';

  const skipBtn = document.getElementById('darwin-skip');
  if (skipBtn) skipBtn.textContent = 'Non merci';

  const spotEl = document.getElementById('tutorial-spotlight');
  if (spotEl) spotEl.style.cssText = 'display:none';

  overlay.style.display = 'flex';
  void overlay.offsetWidth;
  overlay.classList.add('show');
}

function startTutorial() {
  showTutorialStep(0);
}

function showTutorialStep(step) {
  if (step >= TUTORIAL_STEPS.length) { closeTutorial(); return; }
  tutorialStep = step;
  const data = TUTORIAL_STEPS[step];

  const textEl = document.getElementById('darwin-text');
  if (textEl) {
    textEl.style.opacity = '0';
    setTimeout(() => { textEl.textContent = data.text; textEl.style.opacity = '1'; }, 200);
  }

  const nextBtn = document.getElementById('darwin-next');
  if (nextBtn) nextBtn.textContent = data.btn;

  const skipBtn2 = document.getElementById('darwin-skip');
  if (skipBtn2) skipBtn2.textContent = 'Passer';

  const spotEl = document.getElementById('tutorial-spotlight');
  if (!spotEl) return;

  // Add temp class for smooth animation between tutorial steps
  spotEl.classList.add('animate-step');
  setTimeout(() => {
    spotEl.classList.remove('animate-step');
  }, 400);

  if (data.hl) {
    const target = document.getElementById(data.hl);
    if (target) {
      const rect = target.getBoundingClientRect();
      const pad = 14;
      spotEl.style.cssText = `
        position: fixed;
        top: ${rect.top - pad}px;
        left: ${rect.left - pad}px;
        width: ${rect.width + pad * 2}px;
        height: ${rect.height + pad * 2}px;
        border-radius: 14px;
        box-shadow: 0 0 0 9999px rgba(0,0,0,0.68);
        pointer-events: none;
        z-index: 10001;`;
      
      // Center the highlighted element on screen smoothly
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
  }
  
  spotEl.style.cssText = 'position: fixed; top: 50%; left: 50%; width: 0; height: 0; border-radius: 50%; box-shadow: 0 0 0 9999px rgba(0,0,0,0.65); pointer-events: none; z-index: 10001;';
}

function repositionSpotlight() {
  if (tutorialStep === -1) return;
  const data = TUTORIAL_STEPS[tutorialStep];
  const spotEl = document.getElementById('tutorial-spotlight');
  if (!spotEl) return;

  if (!data || !data.hl) {
    spotEl.style.cssText = 'position: fixed; top: 50%; left: 50%; width: 0; height: 0; border-radius: 50%; box-shadow: 0 0 0 9999px rgba(0,0,0,0.65); pointer-events: none; z-index: 10001;';
    return;
  }

  const target = document.getElementById(data.hl);
  if (!target) return;

  const rect = target.getBoundingClientRect();
  const pad = 14;
  spotEl.style.top = `${rect.top - pad}px`;
  spotEl.style.left = `${rect.left - pad}px`;
  spotEl.style.width = `${rect.width + pad * 2}px`;
  spotEl.style.height = `${rect.height + pad * 2}px`;
}

// Bind resize and scroll to keep spotlight aligned in real time
window.addEventListener('scroll', repositionSpotlight);
window.addEventListener('resize', repositionSpotlight);

function closeTutorial() {
  const overlay = document.getElementById('tutorial-overlay');
  if (!overlay) return;
  overlay.classList.remove('show');
  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.classList.remove('idle-mode');
  }, 400);
  document.getElementById('tutorial-spotlight').style.cssText = 'display:none';
  localStorage.setItem('biomimetique_tuto_done', '1');

  // Pulse le bouton ? pendant 10s pour que le joueur le repère
  const tutoBtn = document.getElementById('btn-tuto');
  if (tutoBtn) {
    tutoBtn.classList.add('pulse-ring');
    setTimeout(() => tutoBtn.classList.remove('pulse-ring'), 10000);
  }
}
