/* ============================================================
   INDEX.JS — Landing Page Logic
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Particles ─────────────────────────────────────────── */
  const container = document.getElementById('heroParticles');
  if (container) {
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'hero__particle';
      const size = Math.random() * 4 + 2;
      const color = Math.random() > 0.5
        ? 'rgba(232,184,109,0.6)'
        : 'rgba(232,69,69,0.4)';
      p.style.cssText = `
        width:${size}px; height:${size}px;
        left:${Math.random() * 100}%;
        background:${color};
        animation-duration:${Math.random() * 15 + 10}s;
        animation-delay:${Math.random() * 10}s;
      `;
      container.appendChild(p);
    }
  }

  ['filmCol1', 'filmCol2', 'filmCol3'].forEach(id => {
    const col = document.getElementById(id);
    if (!col) return;
    for (let i = 0; i < 12; i++) {
      const f = document.createElement('div');
      f.className = 'hero__filmframe';
      col.appendChild(f);
    }
  });

  const grid = document.getElementById('nowShowingGrid');
  if (grid) {
    getMoviesAsync().then(allMovies => {
      const movies = allMovies.slice(0, 8);
      grid.innerHTML = movies.map(m => movieCardHTML(m)).join('');
      document.querySelectorAll('#nowShowingGrid .movie-card').forEach(el => {
        el.classList.add('reveal');
      });
      initReveal();
    });
  }

  /* ── Genre pills: mark active from URL ─────────────────── */
  const genre = getParam('genre');
  if (genre) {
    document.querySelectorAll('.genre-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.genre === genre);
    });
  }

});
