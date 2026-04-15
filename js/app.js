/**
 * app.js — SPA router and application bootstrap (No-module version for file:// compatibility).
 * Hash-based routing: #home | #module-1..5 | #quiz-1..5
 */

(function() {
  const appEl = document.getElementById('app');

  // ── Toast System ─────────────────────────────────────────────────

  window.showToast = function(message, type = 'info', icon = '✨') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(40px)';
      toast.style.transition = '0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  // ── Confetti ─────────────────────────────────────────────────────

  window.launchConfetti = function() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 100,
      r: 4 + Math.random() * 6,
      color: ['#7c3aed','#a855f7','#06b6d4','#10b981','#f59e0b','#ef4444'][Math.floor(Math.random()*6)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.2,
      opacity: 1,
    }));

    let frame;
    let startTime = performance.now();

    function animate(now) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = now - startTime;
      const fade = Math.max(0, 1 - (elapsed - 2500) / 1000);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.vy += 0.1; // gravity

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 2.5);
        ctx.restore();
      });

      if (elapsed < 3500) {
        frame = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(animate);
  };

  // ── Routing ──────────────────────────────────────────────────────

  function parseRoute(hash) {
    if (!hash || hash === '#' || hash === '#home') return { view: 'home' };

    const moduleMatch = hash.match(/^#module-(\d)$/);
    if (moduleMatch) return { view: 'module', id: Number(moduleMatch[1]) };

    const quizMatch = hash.match(/^#quiz-(\d)$/);
    if (quizMatch) return { view: 'quiz', id: Number(quizMatch[1]) };

    return { view: 'home' };
  }

  function getTopbarTitle(route) {
    const titles = {
      home: 'Главная',
      module: `Модуль ${route.id}`,
      quiz: `Тест — Модуль ${route.id}`,
    };
    return titles[route.view] || 'AI-Интегратор 2026';
  }

  function navigate() {
    const route = parseRoute(window.location.hash);
    const contentEl = document.getElementById('page-content');
    const Store = window.Store;

    if (!contentEl || !Store) return;

    // Block locked modules
    if (route.view === 'module' && !Store.isModuleUnlocked(route.id)) {
      window.showToast('🔒 Сначала пройди предыдущий модуль!', 'error', '🔒');
      window.location.hash = '#home';
      return;
    }
    if (route.view === 'quiz' && !Store.isModuleUnlocked(route.id)) {
      window.showToast('🔒 Сначала пройди предыдущий модуль!', 'error', '🔒');
      window.location.hash = '#home';
      return;
    }

    // Update topbar title
    const topTitle = document.getElementById('topbar-title');
    if (topTitle) topTitle.textContent = getTopbarTitle(route);

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('is-active'));
    const activeSelector = route.view === 'home'
      ? '[data-nav="home"]'
      : `[data-nav="module-${route.id}"]`;
    document.querySelector(activeSelector)?.classList.add('is-active');

    // Track current module
    if (route.view === 'module') Store.setCurrentModule(route.id);

    // Render view
    if (route.view === 'home')   contentEl.innerHTML = window.renderHome();
    if (route.view === 'module') contentEl.innerHTML = window.renderModule(route.id);
    if (route.view === 'quiz')   contentEl.innerHTML = window.renderQuiz(route.id);

    // Reinitialize quiz if needed
    if (route.view === 'quiz') {
      window.initQuiz(route.id);
    }

    // Animate XP bar update
    updateSidebarXP();

    // Scroll to top
    contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updateSidebarXP() {
    const Store = window.Store;
    const info = Store.getLevelInfo();
    const fillEl = document.querySelector('.xp-bar__fill');
    const valueEl = document.querySelector('.sidebar-xp__value');
    const levelEl = document.getElementById('sidebar-level');

    if (fillEl) fillEl.style.width = info.progress + '%';
    if (valueEl) valueEl.textContent = info.xp + ' XP';
    if (levelEl) levelEl.textContent = info.level;
  }

  // ── Sidebar Toggle (mobile) ───────────────────────────────────────

  function initSidebarToggle() {
    const toggle  = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    function open()  { sidebar.classList.add('is-open');    overlay.classList.add('is-visible'); }
    function close() { sidebar.classList.remove('is-open'); overlay.classList.remove('is-visible'); }

    toggle?.addEventListener('click', open);
    overlay?.addEventListener('click', close);

    // Close on nav item click (mobile UX)
    sidebar?.addEventListener('click', e => {
      if (e.target.closest('.nav-item')) close();
    });
  }

  // ── Bootstrap ────────────────────────────────────────────────────

  function bootstrap() {
    if (!appEl) return;
    appEl.innerHTML = `
      ${window.renderSidebar()}
      <div id="sidebar-overlay" class="sidebar-overlay"></div>
      <div class="main-content">
        ${window.renderTopbar()}
        <main class="page" id="page-content"></main>
      </div>
      <canvas id="confetti-canvas"></canvas>
      <div id="toast-container"></div>
    `;

    initSidebarToggle();
    navigate();

    window.addEventListener('hashchange', navigate);
    window.addEventListener('resize', () => {
      const canvas = document.getElementById('confetti-canvas');
      if (canvas) { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    });
  }

  document.addEventListener('DOMContentLoaded', bootstrap);
})();
