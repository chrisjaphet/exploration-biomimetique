/* ================================================
   EXPLORATION BIOMIMÉTIQUE — script.js v2
   Basé sur le Figma de l'équipe
   ================================================ */

const state = {
  xp: 0,
  pairesTotal: CARDS_DATA.filter(c => c.type === 'vivant').length,
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
};

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  const pairIds = [...new Set(CARDS_DATA.map(c => c.pairId))].sort(() => Math.random() - 0.5);
  state.allPairIds = pairIds;
  state.totalRounds = Math.ceil(pairIds.length / state.roundSize);

  buildRegles();
  bindNav();
  bindModal();
  bindBurger();
  bindSearch();
  document.getElementById('btn-next-round').addEventListener('click', () => startRound(state.currentRound + 1));
  document.getElementById('btn-magasin').addEventListener('click', () => navigateTo('indices'));
  document.getElementById('btn-voir-indices').addEventListener('click', () => navigateTo('indices'));

  startRound(1);
  updateXP();
  updateScore();
});

// ============================================
// NAV
// ============================================
function bindNav() {
  document.querySelectorAll('.navbar-links button').forEach(btn => {
    btn.addEventListener('click', () => { navigateTo(btn.dataset.panel); document.querySelector('.navbar-links').classList.remove('open'); });
  });
}

function navigateTo(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.navbar-links button').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + id)?.classList.add('active');
  document.querySelector(`[data-panel="${id}"]`)?.classList.add('active');
  if (id === 'inventaire') renderInventaire();
  if (id === 'indices') renderIndices();
}

function bindBurger() {
  document.getElementById('burger').addEventListener('click', () => document.querySelector('.navbar-links').classList.toggle('open'));
}

// ============================================
// ROUNDS
// ============================================
function startRound(n) {
  document.getElementById('round-banner').classList.remove('show');
  document.getElementById('btn-next-round').classList.remove('visible');
  state.currentRound = n;
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
  grid.innerHTML = '';

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

  // Restaurer états validés
  state.validatedPairs.forEach(pid => {
    if (state.roundPairs.includes(pid)) {
      document.querySelectorAll(`.card[data-pid="${pid}"]`).forEach(el => {
        el.classList.remove('card--selected','card--correcte','card--incorrecte');
        el.classList.add('card--correcte','card--validee');
        const badge = el.querySelector('.card-badge');
        if (badge) { badge.style.display = 'flex'; badge.textContent = '✓'; badge.style.background = 'var(--vert-ok)'; }
      });
    }
  });
}

function makeCard(card) {
  const div = document.createElement('div');
  div.className = `card card--${card.type}`;
  div.dataset.id = card.id;
  div.dataset.pid = card.pairId;

  div.innerHTML = `
    <div class="card-badge"></div>
    <div class="card-title">${card.name}</div>
    <div class="card-photo-wrap">
      <img src="${card.photo}" alt="${card.name}" loading="lazy" onerror="this.parentElement.style.background='var(--mint-pale)';this.style.display='none'"/>
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
  document.getElementById('search-input').addEventListener('input', e => {
    clearTimeout(t);
    t = setTimeout(() => renderCards(e.target.value.trim()), 200);
  });
}

// ============================================
// LOGIQUE JEU
// ============================================
function onCardClick(card, el) {
  if (el.classList.contains('card--validee')) return;
  if (el.classList.contains('card--incorrecte')) return;
  if (state.incorrectTimeout) return;

  if (el.classList.contains('card--selected')) {
    el.classList.remove('card--selected');
    state.selectedCards = state.selectedCards.filter(c => c.id !== card.id);
    return;
  }

  if (state.selectedCards.length >= 2) return;

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
    badge.textContent = '✓'; badge.style.background = 'var(--vert-ok)';
    setTimeout(() => el.classList.add('card--validee'), 900);
  });

  state.xp += 100;
  state.pairesReussies++;
  state.validatedPairs.push(a.card.pairId);
  state.roundPairsRestantes--;
  state.inventaire.push({ vivant, appli });
  state.selectedCards = [];

  spawnParticles(a.el);
  spawnParticles(b.el);
  updateXP();
  updateScore();

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
// ROUND COMPLETE
// ============================================
function onRoundComplete() {
  const banner = document.getElementById('round-banner');
  banner.classList.add('show');
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
  const cy = r.top + r.height / 2;
  const colors = ['#1A5D48','#93D4B9','#004432','#F5C842','#16A34A','#fff'];

  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const s = 5 + Math.random() * 7;
    const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.6;
    const d = 50 + Math.random() * 70;
    p.style.cssText = `
      left:${cx-s/2}px;top:${cy-s/2}px;width:${s}px;height:${s}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      --tx:${Math.cos(angle)*d}px;--ty:${Math.sin(angle)*d-30}px;
      animation-duration:${.65+Math.random()*.35}s;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 1100);
  }
}

// ============================================
// MODAL
// ============================================
function bindModal() {
  const ov = document.getElementById('modal-overlay');
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
  document.getElementById('modal-close').addEventListener('click', closeModal);
}

function openModal(vivant, appli) {
  document.getElementById('modal-title').textContent = vivant.explication.titre;
  document.getElementById('modal-pair-a-img').src = vivant.photo;
  document.getElementById('modal-pair-a-img').alt = vivant.name;
  document.getElementById('modal-pair-a-name').textContent = vivant.name;
  document.getElementById('modal-pair-b-img').src = appli.photo;
  document.getElementById('modal-pair-b-img').alt = appli.name;
  document.getElementById('modal-pair-b-name').textContent = appli.name;
  document.getElementById('modal-text').textContent = vivant.explication.texte;
  document.getElementById('modal-overlay').classList.add('open');
}

function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }

// ============================================
// XP & SCORE
// ============================================
function updateXP() {
  const pct = Math.min(100, (state.xp / (state.pairesTotal * 100)) * 100);
  document.getElementById('xp-bar').style.width = pct + '%';
  document.getElementById('xp-count').textContent = state.xp + ' XP';
}

function updateScore() {
  document.getElementById('score-badge').textContent = `${state.pairesReussies} / ${state.pairesTotal} paires`;
}

// ============================================
// INVENTAIRE
// ============================================
function renderInventaire() {
  document.getElementById('inv-xp-val').textContent = state.xp;
  document.getElementById('inv-pairs-val').textContent = state.pairesReussies;
  document.getElementById('inv-indices-val').textContent = state.indicesAchetes.length;

  // Dots paires
  const dots = document.getElementById('inv-pairs-dots');
  dots.innerHTML = '';
  for (let i = 0; i < Math.min(state.pairesTotal, 5); i++) {
    const d = document.createElement('div');
    d.className = 'dot' + (i < state.pairesReussies ? ' active' : '');
    dots.appendChild(d);
  }

  const grid = document.getElementById('collection-grid');
  grid.innerHTML = '';

  // Cartes trouvées
  state.inventaire.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'collection-card';
    div.innerHTML = `
      <img src="${item.vivant.photo}" alt="${item.vivant.name}" loading="lazy"/>
      <div class="collection-card-info">
        <span class="collection-card-tag">BIO-${String(i+1).padStart(2,'0')}</span>
        <div class="collection-card-name">${item.vivant.explication.titre.split('&')[0].trim()}</div>
        <div class="collection-card-desc">Inspiration ${item.appli.name.toLowerCase()}</div>
      </div>
    `;
    div.addEventListener('click', () => {
      openModal(item.vivant, item.appli);
    });
    grid.appendChild(div);
  });

  // Slots vides
  const slotsRestants = Math.min(4 - state.inventaire.length, 4);
  for (let i = 0; i < slotsRestants; i++) {
    const slot = document.createElement('div');
    slot.className = 'collection-slot';
    const prices = [null, 250, 500, 1000];
    if (prices[i] === null) {
      slot.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><span>Emplacement vide</span>`;
    } else {
      slot.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg><div class="slot-price">Débloquez à ${prices[i]} XP</div>`;
    }
    grid.appendChild(slot);
  }
}

// ============================================
// INDICES
// ============================================
function renderIndices() {
  const grid = document.getElementById('indices-grid');
  grid.innerHTML = '';

  INDICES_DATA.forEach(indice => {
    const bought    = state.indicesAchetes.includes(indice.pairId);
    const validated = state.validatedPairs.includes(indice.pairId);
    const div = document.createElement('div');
    div.className = 'indice-card';

    const isUnlocked = bought || validated;

    let footerHTML = '';
    if (validated) {
      footerHTML = `<span class="indice-analyse">@ Analysé</span>`;
    } else if (bought) {
      footerHTML = `<button class="consulter-link" onclick="void(0)">Consulter l'indice ›</button>`;
    } else {
      footerHTML = `<div class="indice-lock">
        <div class="lock-icon">🔒</div>
        <button class="btn-debloquer" onclick="acheterIndice(${indice.pairId})" ${state.xp < indice.cout ? 'disabled' : ''}>
          Débloquer (${indice.cout} XP)
        </button>
      </div>`;
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
      <div class="indice-footer">${footerHTML}</div>
    `;
    grid.appendChild(div);
  });
}

function acheterIndice(pairId) {
  const i = INDICES_DATA.find(x => x.pairId === pairId);
  if (!i || state.xp < i.cout) { showToast('Pas assez de XP !', 'error'); return; }
  state.xp -= i.cout;
  state.indicesAchetes.push(pairId);
  updateXP();
  renderIndices();
  showToast('💡 Indice débloqué !', 'info');
}

// ============================================
// RÈGLES
// ============================================
function buildRegles() {
  const steps = document.getElementById('regles-steps');
  REGLES_DATA.etapes.forEach((text, i) => {
    const step = document.createElement('div');
    step.className = 'regles-step';
    // Colorize "Vivant" and "Application"
    const colored = text
      .replace(/Vivant/g, '<strong>Vivant</strong>')
      .replace(/Application/g, '<strong class="app">Application</strong>');
    step.innerHTML = `<div class="step-num">0${i+1}</div><div class="step-text">${colored}</div>`;
    steps.appendChild(step);
  });
  document.getElementById('regles-objectif').textContent = REGLES_DATA.objectif;
  document.getElementById('regles-xp').textContent = REGLES_DATA.xp;
  document.getElementById('regles-indices').textContent = REGLES_DATA.indices;
}

// ============================================
// VICTOIRE
// ============================================
function showVictoire() {
  document.getElementById('victoire-banner').classList.add('show');
  document.getElementById('victoire-xp').textContent = state.xp + ' XP';
  launchConfetti();
  showToast('🎉 Toutes les paires trouvées !', 'success');
}

function launchConfetti() {
  const colors = ['#1A5D48','#93D4B9','#F5C842','#004432','#5BBFB9','#fff'];
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      const s = 7 + Math.random() * 9;
      const dur = 1.6 + Math.random() * 2;
      p.style.cssText = `
        left:${Math.random()*window.innerWidth}px;top:-20px;
        width:${s}px;height:${s}px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        border-radius:${Math.random()>.5?'50%':'3px'};
        --cx:${(Math.random()-.5)*220}px;--cr:${(Math.random()-.5)*720}deg;
        animation-duration:${dur}s;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), dur*1000+100);
    }, i * 28);
  }
}

// ============================================
// TOAST
// ============================================
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}
