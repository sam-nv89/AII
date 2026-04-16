/**
 * sidebar.js — Sidebar navigation component renderer. v2.0
 * Removed all inline styles — using CSS classes exclusively.
 */

window.renderSidebar = function() {
  const Store = window.Store;
  const info = Store.getLevelInfo();
  const xpPercent = info.progress;
  const daysRemaining = Store.getDaysRemaining();

  const MODULE_META = [
    { id: 1, icon: '🧠', title: 'Мышление Интегратора', short: 'Основы AI & API' },
    { id: 2, icon: '🔗', title: 'Первые связи в Make',   short: 'HTTP + Sheets → TG' },
    { id: 3, icon: '🤖', title: 'Мозги для робота',      short: 'OpenAI & промпты' },
    { id: 4, icon: '💾', title: 'AI-Агенты и Память',    short: 'RAG + файлы' },
    { id: 5, icon: '💰', title: 'Бизнес и Продажи',      short: 'Клиенты и доход' },
  ];

  const navItems = MODULE_META.map(m => {
    const unlocked  = Store.isModuleUnlocked(m.id);
    const completed = Store.isModuleCompleted(m.id);
    const lockClass = unlocked ? '' : 'nav-item--locked';
    const badge     = completed ? '<span class="nav-item__badge">✓</span>' : '';
    const lockIcon  = unlocked ? '' : '<span class="nav-item__lock-icon">🔒</span>';
    const clickAttr = unlocked ? `onclick="window.location.hash='#module-${m.id}'"` : '';
    const titleAttr = unlocked ? m.title : 'Сначала пройди предыдущий модуль';

    return `
      <div class="nav-item ${lockClass}"
           data-nav="module-${m.id}"
           ${clickAttr}
           title="${titleAttr}">
        <div class="nav-item__icon">${m.icon}</div>
        <div class="nav-item__text">
          <div class="nav-item__title">${m.title}</div>
          <div class="nav-item__subtitle">${m.short}</div>
        </div>
        ${badge}${lockIcon}
      </div>`;
  }).join('');

  const nextXpText = info.nextXP
    ? `<div class="xp-bar__next">До следующего: ${info.nextXP - info.xp} XP</div>`
    : '';

  return `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo__icon">⚡</div>
        <div>
          <div class="sidebar-logo__title">AI-Интегратор</div>
          <div class="sidebar-logo__subtitle">2026 · 90 дней</div>
        </div>
      </div>

      <div class="sidebar-xp">
        <div class="sidebar-xp__label">
          <span id="sidebar-level">${info.level}</span>
          <span class="sidebar-xp__value">${info.xp} XP</span>
        </div>
        <div class="xp-bar">
          <div class="xp-bar__fill" style="width:${xpPercent}%"></div>
        </div>
        ${nextXpText}
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-nav__label">Навигация</div>
        <div class="nav-item" data-nav="home" onclick="window.location.hash='#home'">
          <div class="nav-item__icon">🏠</div>
          <div class="nav-item__text">
            <div class="nav-item__title">Главная</div>
            <div class="nav-item__subtitle">Дашборд прогресса</div>
          </div>
        </div>

        <div class="sidebar-nav__label" style="margin-top:var(--space-3)">Модули курса</div>
        ${navItems}
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-footer__text">
          🚀 Make.com + OpenAI<br>
          ${daysRemaining > 0 ? `${daysRemaining} дней до финиша` : '🏆 Курс завершён!'}
        </div>
      </div>
    </aside>`;
};
