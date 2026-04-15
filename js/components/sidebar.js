/**
 * sidebar.js — Sidebar navigation component renderer.
 */

window.renderSidebar = function() {
  const Store = window.Store;
  const info = Store.getLevelInfo();
  const xpPercent = info.progress;

  const MODULE_META = [
    { id: 1, icon: '🧠', title: 'Мышление Интегратора',   short: 'Основы AI & API' },
    { id: 2, icon: '🔗', title: 'Первые связи в Make',     short: 'HTTP + Sheets → TG' },
    { id: 3, icon: '🤖', title: 'Мозги для робота',        short: 'OpenAI & промпты' },
    { id: 4, icon: '💾', title: 'AI-Агенты и Память',      short: 'RAG + файлы' },
    { id: 5, icon: '💰', title: 'Бизнес и Продажи',        short: 'Клиенты и доход' },
  ];

  const navItems = MODULE_META.map(m => {
    const unlocked  = Store.isModuleUnlocked(m.id);
    const completed = Store.isModuleCompleted(m.id);
    const lockAttr  = unlocked ? '' : 'nav-item--locked';
    const badge     = completed ? '<span class="nav-item__badge">✓</span>' : '';
    const lockIcon  = unlocked ? '' : '<span class="nav-item__lock-icon" style="margin-left:auto;opacity:.5;font-size:12px;">🔒</span>';

    return `
      <div class="nav-item ${lockAttr}" 
           data-nav="module-${m.id}" 
           ${unlocked ? `onclick="window.location.hash='#module-${m.id}'"` : ''}
           title="${unlocked ? m.title : 'Сначала пройди предыдущий модуль'}">
        <div class="nav-item__icon">${m.icon}</div>
        <div class="nav-item__text">
          <div style="font-size:0.8rem;font-weight:600;color:inherit;line-height:1.2">${m.title}</div>
          <div style="font-size:0.7rem;color:var(--color-text-faint);margin-top:2px">${m.short}</div>
        </div>
        ${badge}${lockIcon}
      </div>`;
  }).join('');

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
        ${info.nextXP ? `<div style="font-size:0.7rem;color:var(--color-text-faint);margin-top:4px;text-align:right">До уровня: ${info.nextXP - info.xp} XP</div>` : ''}
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-nav__label">Навигация</div>
        <div class="nav-item" data-nav="home" onclick="window.location.hash='#home'">
          <div class="nav-item__icon">🏠</div>
          <div class="nav-item__text">
            <div style="font-size:0.8rem;font-weight:600;line-height:1.2">Главная</div>
            <div style="font-size:0.7rem;color:var(--color-text-faint);margin-top:2px">Дашборд прогресса</div>
          </div>
        </div>

        <div class="sidebar-nav__label" style="margin-top:var(--space-4)">Модули курса</div>
        ${navItems}
      </nav>

      <div style="padding:var(--space-4) var(--space-5);border-top:1px solid var(--color-border-light);margin-top:auto">
        <div style="font-size:0.7rem;color:var(--color-text-faint);text-align:center;line-height:1.6">
          🚀 Make.com + OpenAI<br>
          Путь к первому доходу
        </div>
      </div>
    </aside>`;
};
