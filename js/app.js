// GoDZ – Shared App Logic

// ---- Navbar scroll effect ----
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.navbar');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // Active nav link
  const current = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || (current === 'index.html' && href === './') || href === './' + current) {
      a.classList.add('active');
    }
  });

  // Mobile menu toggle
  const menuBtn = document.querySelector('.navbar-menu-btn');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  if (menuBtn && mobileDrawer) {
    menuBtn.addEventListener('click', () => mobileDrawer.classList.toggle('open'));
  }

  // Update fav counters in nav
  updateFavBadge();
});

// ---- Toast ----
let toastContainer = null;
function showToast(msg, type = '') {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  const t = document.createElement('div');
  t.className = `toast${type ? ' ' + type : ''}`;
  const icon = type === 'success'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
  t.innerHTML = icon + '<span>' + msg + '</span>';
  toastContainer.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastIn 250ms ease reverse forwards';
    setTimeout(() => t.remove(), 250);
  }, 2800);
}

// ---- Update fav badge in nav ----
function updateFavBadge() {
  const count = getFavorites().length;
  document.querySelectorAll('.fav-count').forEach(el => {
    el.textContent = count > 0 ? count : '';
    el.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

// ---- Place card component ----
function renderPlaceCard(place, opts = {}) {
  const isFav = isFavorite(place.id);
  const catImg = CAT_IMAGES[place.category] || 'assets/decouvrez_algerie.jpg';
  const imgSrc = place.photo || catImg;
  return `
    <a class="card" href="lieu.html?id=${place.id}" data-id="${place.id}">
      <div style="position:relative;overflow:hidden">
        <img class="card-img" src="${imgSrc}" alt="${place.nameFr}" loading="lazy" onerror="this.src='${catImg}'" />
        <div style="position:absolute;top:10px;left:10px">
          <span class="card-tag" style="color:${CAT_COLORS[place.category]}">${CAT_LABELS[place.category] || place.category}</span>
        </div>
        ${place.isFeatured ? '<span style="position:absolute;bottom:10px;left:10px;background:#FFD700;color:#111;font-size:0.63rem;font-weight:800;padding:3px 10px;border-radius:20px;letter-spacing:0.04em">★ Vedette</span>' : ''}
        <button class="card-fav${isFav ? ' active' : ''}" onclick="handleFav(event,'${place.id}')" aria-label="${isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}" style="position:absolute;top:10px;right:10px">
          <svg viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div class="card-body">
        <h3 class="card-title">${place.nameFr}</h3>
        <p class="card-subtitle" style="display:flex;align-items:center;gap:4px;margin-top:4px">
          <svg style="width:12px;height:12px;color:var(--muted);flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${place.wilaya}
        </p>
        <div class="card-meta" style="margin-top:10px">
          <div class="card-rating">
            <span class="stars">${renderStars(place.googleRating)}</span>
            <span style="font-weight:700">${place.googleRating}</span>
            <span style="color:var(--muted);font-weight:400;font-size:0.76rem">(${fmtReviews(place.googleReviewCount)})</span>
          </div>
        </div>
      </div>
    </a>`;
}

// ---- Handle fav toggle ----
function handleFav(event, placeId) {
  event.preventDefault();
  event.stopPropagation();
  const btn = event.currentTarget;
  const added = toggleFavorite(placeId);
  btn.classList.toggle('active', added);
  btn.querySelector('svg').setAttribute('fill', added ? 'currentColor' : 'none');
  showToast(added ? 'Ajouté aux favoris' : 'Retiré des favoris', added ? 'success' : '');
  updateFavBadge();
}

// ---- Render places grid ----
function renderGrid(places, container) {
  if (!container) return;
  if (!places.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <h3>Aucun lieu trouvé</h3>
        <p>Essayez d'autres filtres ou termes de recherche.</p>
      </div>`;
    return;
  }
  container.innerHTML = places.map(p => renderPlaceCard(p)).join('');
}

// ---- URL Params ----
function getParam(key) {
  return new URLSearchParams(location.search).get(key);
}

// ---- Audio Guide (TTS) ----
let ttsUtterance = null;
function startAudioGuide(text, lang = 'fr-FR') {
  if (!window.speechSynthesis) return showToast('Guide audio non disponible sur ce navigateur');
  stopAudioGuide();
  ttsUtterance = new SpeechSynthesisUtterance(text);
  ttsUtterance.lang = lang;
  ttsUtterance.rate = 0.9;
  window.speechSynthesis.speak(ttsUtterance);
}
function stopAudioGuide() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ---- Itinerary generator ----
function generateItinerary(wilaya, days) {
  const pool = PLACES.filter(p => p.wilaya === wilaya);
  const visits = pool.filter(p => ['monuments','culture','plages','montagnes','desert','artisanat'].includes(p.category));
  const eats = pool.filter(p => p.category === 'restaurants');
  const cafes = pool.filter(p => p.category === 'salons');

  const score = p => p.popularity * 0.4 + p.googleRating * 10;
  visits.sort((a,b) => score(b) - score(a));
  eats.sort((a,b) => score(b) - score(a));
  cafes.sort((a,b) => score(b) - score(a));

  const slots = ['08:00','10:00','12:30','14:30','16:30','19:00','20:30'];
  const slotLabels = ['Matin','Matinée','Déjeuner','Après-midi','Fin d\'après-midi','Dîner','Soirée'];
  const itinerary = [];
  let vi = 0, ei = 0, ci = 0;

  for (let d = 0; d < days; d++) {
    const dayPlaces = [];
    slots.forEach((time, i) => {
      let place = null;
      if (i === 2 && ei < eats.length) { place = eats[ei++]; }
      else if (i === 5 && ei < eats.length) { place = eats[ei++]; }
      else if (i === 6 && ci < cafes.length) { place = cafes[ci++]; }
      else if (vi < visits.length) { place = visits[vi++]; }
      if (place) dayPlaces.push({ time, label: slotLabels[i], place });
    });
    itinerary.push({ day: d + 1, places: dayPlaces });
  }
  return itinerary;
}
