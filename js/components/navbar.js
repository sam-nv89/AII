/**
 * navbar.js — Top navigation bar component.
 */

window.renderTopbar = function() {
  const Store = window.Store;
  const daysRemaining = Store.getDaysRemaining();
  const progress = Store.getProgressPercent();

  return `
    <header class="topbar">
      <button class="menu-toggle" id="menu-toggle" aria-label="Открыть меню">☰</button>
      <span class="topbar__title" id="topbar-title">Главная</span>

      <div style="display:flex;align-items:center;gap:var(--space-3);margin-left:auto">
        <div style="display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-size-xs);color:var(--color-text-muted)">
          <div style="width:6px;height:6px;border-radius:50%;background:var(--color-success);animation:pulse 2s infinite"></div>
          <span>${progress}% курса</span>
        </div>

        <div class="topbar__days">
          <div class="dot"></div>
          <span>${daysRemaining} дней до дедлайна</span>
        </div>
      </div>
    </header>`;
};
