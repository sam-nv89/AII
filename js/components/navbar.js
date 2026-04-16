/**
 * navbar.js — Top navigation bar component. v2.0
 * Responsive: shows compact progress dot on mobile, full info on desktop.
 */

window.renderTopbar = function() {
  const Store = window.Store;
  const daysRemaining = Store.getDaysRemaining();
  const progress = Store.getProgressPercent();

  return `
    <header class="topbar">
      <button class="menu-toggle" id="menu-toggle" aria-label="Открыть меню">☰</button>
      <span class="topbar__title" id="topbar-title">Главная</span>

      <div class="topbar__meta">
        <div class="topbar__progress-badge">
          <div class="topbar__progress-dot"></div>
          <span>${progress}% курса</span>
        </div>

        <div class="topbar__days">
          <div class="dot"></div>
          <span>${daysRemaining} дней</span>
        </div>
      </div>
    </header>`;
};
