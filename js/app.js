/**
 * app.js — SPA router and application bootstrap. v2.0
 * Improvements:
 *  - Centralized route guard (no duplication)
 *  - Directional page slide transitions
 *  - Animated counters on home page
 *  - Brand-synced confetti colors
 *  - Proper quiz cleanup on navigation
 */

(function() {
  const appEl = document.getElementById('app');

  // Track previous route for directional transitions
  let prevRouteId = null;

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
    }, 3200);
  };

  // ── Confetti (brand-synced colors) ───────────────────────────────
  window.launchConfetti = function() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    // Brand palette: violet, cyan, emerald, amber + white
    const COLORS = ['#8b5cf6', '#c4b5fd', '#06b6d4', '#67e8f9', '#10b981', '#6ee7b7', '#f59e0b', '#ffffff'];

    const particles = Array.from({ length: 130 }, () => ({
      x:      Math.random() * canvas.width,
      y:      -10 - Math.random() * 120,
      r:      3 + Math.random() * 7,
      color:  COLORS[Math.floor(Math.random() * COLORS.length)],
      vx:     (Math.random() - 0.5) * 4,
      vy:     2 + Math.random() * 4,
      angle:  Math.random() * Math.PI * 2,
      spin:   (Math.random() - 0.5) * 0.18,
    }));

    let frame;
    const startTime = performance.now();

    function animate(now) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = now - startTime;
      const fade    = Math.max(0, 1 - (elapsed - 2400) / 1000);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.vy += 0.09; // gravity

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalAlpha = fade;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 2.4);
        ctx.restore();
      });

      if (elapsed < 3500) {
        frame = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(frame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    cancelAnimationFrame(frame);
    requestAnimationFrame(animate);
  };

  // ── Routing ──────────────────────────────────────────────────────
  function parseRoute(hash) {
    if (!hash || hash === '#' || hash === '#home') return { view: 'home', id: 0 };

    const moduleMatch = hash.match(/^#module-(\d)$/);
    if (moduleMatch) return { view: 'module', id: Number(moduleMatch[1]) };

    const quizMatch = hash.match(/^#quiz-(\d)$/);
    if (quizMatch) return { view: 'quiz', id: Number(quizMatch[1]) };

    return { view: 'home', id: 0 };
  }

  function getRouteNumericId(route) {
    // Used for directional transitions:
    // home=0, module-1=1, module-2=2, quiz-1=11, quiz-2=12, etc.
    if (route.view === 'home')   return 0;
    if (route.view === 'module') return route.id;
    if (route.view === 'quiz')   return 10 + route.id;
    return 0;
  }

  function getTopbarTitle(route) {
    if (route.view === 'home')   return 'Главная';
    if (route.view === 'module') return `Модуль ${route.id}`;
    if (route.view === 'quiz')   return `Тест — Модуль ${route.id}`;
    return 'AI-Интегратор 2026';
  }

  // ── Centralized route guard ───────────────────────────────────────
  function isRouteAllowed(route) {
    if (route.view === 'module' || route.view === 'quiz') {
      return window.Store.isModuleUnlocked(route.id);
    }
    return true;
  }

  // ── Navigate ─────────────────────────────────────────────────────
  function navigate() {
    const route    = parseRoute(window.location.hash);
    const contentEl = document.getElementById('page-content');

    if (!contentEl || !window.Store) return;

    // Guard — redirect locked routes
    if (!isRouteAllowed(route)) {
      window.showToast('🔒 Сначала пройди предыдущий модуль!', 'error', '🔒');
      window.location.hash = '#home';
      return;
    }

    // Cleanup quiz (if navigating away from it)
    if (typeof window._quizCleanup === 'function') {
      window._quizCleanup();
      window._quizCleanup = null;
    }

    // Determine transition direction
    const currentId = getRouteNumericId(route);
    let slideClass  = '';
    if (prevRouteId !== null) {
      slideClass = currentId > prevRouteId ? 'page--slide-left' : 'page--slide-right';
    }
    prevRouteId = currentId;

    // Update topbar title
    const topTitle = document.getElementById('topbar-title');
    if (topTitle) topTitle.textContent = getTopbarTitle(route);

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('is-active'));
    const navSelector = route.view === 'home'
      ? '[data-nav="home"]'
      : `[data-nav="module-${route.id}"]`;
    document.querySelector(navSelector)?.classList.add('is-active');

    // Track current module
    if (route.view === 'module') window.Store.setCurrentModule(route.id);

    // Render view
    const pageEl = document.getElementById('page-content');
    if (pageEl) {
      // Remove old animation class before re-rendering
      pageEl.className = `page ${slideClass}`;
    }

    if (route.view === 'home')   contentEl.innerHTML = window.renderHome();
    if (route.view === 'module') contentEl.innerHTML = window.renderModule(route.id);
    if (route.view === 'quiz')   contentEl.innerHTML = window.renderQuiz(route.id);

    // Post-render hooks
    if (route.view === 'quiz') {
      window.initQuiz(route.id);
    }

    if (route.view === 'home') {
      animateCounters();
    }

    // Animate XP bar
    updateSidebarXP();

    // Scroll to top
    contentEl.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  // ── Animated Counters (Home page hero stats) ──────────────────────
  function animateCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach(el => {
      const target   = parseInt(el.dataset.counter, 10);
      const suffix   = el.dataset.max ? `/${el.dataset.max}` : (el.textContent.includes('%') ? '%' : '');
      const duration = 1200;
      const start    = performance.now();

      function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

      function tick(now) {
        const t   = Math.min((now - start) / duration, 1);
        const val = Math.round(easeOut(t) * target);
        el.textContent = val + suffix;
        if (t < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
    });
  }

  // ── XP Bar Update ─────────────────────────────────────────────────
  function updateSidebarXP() {
    const Store  = window.Store;
    Store.invalidate(); // Force fresh read after score save
    const info   = Store.getLevelInfo();
    const fillEl = document.querySelector('.xp-bar__fill');
    const valEl  = document.querySelector('.sidebar-xp__value');
    const lvlEl  = document.getElementById('sidebar-level');

    if (fillEl) fillEl.style.width = info.progress + '%';
    if (valEl)  valEl.textContent  = info.xp + ' XP';
    if (lvlEl)  lvlEl.textContent  = info.level;
  }

  // ── Sidebar Toggle (mobile) ────────────────────────────────────────
  function initSidebarToggle() {
    const toggle  = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    const open  = () => { sidebar.classList.add('is-open');    overlay.classList.add('is-visible'); };
    const close = () => { sidebar.classList.remove('is-open'); overlay.classList.remove('is-visible'); };

    toggle?.addEventListener('click', open);
    overlay?.addEventListener('click', close);

    // Close on nav item click (mobile UX)
    sidebar?.addEventListener('click', e => {
      if (e.target.closest('.nav-item')) close();
    });
  }

  // ── Bootstrap ─────────────────────────────────────────────────────
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
      if (canvas) {
        canvas.width  = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', bootstrap);
})();
