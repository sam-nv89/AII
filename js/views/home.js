/**
 * home.js — Dashboard / landing view. v2.0
 * Improvements: data-module attrs for CSS glow, animated counters, CSS class structure.
 */

window.renderHome = function() {
  const Store = window.Store;
  const state     = Store.get();
  const info      = Store.getLevelInfo();
  const progress  = Store.getProgressPercent();
  const daysElapsed = Store.getDaysElapsed();
  const completed = state.completedModules.length;

  const MODULE_META = [
    {
      id: 1,
      icon: '🧠',
      title: 'Мышление Интегратора',
      desc: 'Как работают нейросети, API и как превратить текст в живую команду для машины.',
      duration: '~3 часа',
      lessons: 6,
    },
    {
      id: 2,
      icon: '🔗',
      title: 'Первые связи в Make',
      desc: 'Регистрация в Make.com, первый HTTP-запрос, отправка данных из Google Sheets в Telegram.',
      duration: '~4 часа',
      lessons: 7,
    },
    {
      id: 3,
      icon: '🤖',
      title: 'Мозги для робота',
      desc: 'Интеграция OpenAI в Make. Мастерство промптов. Маппинг переменных и условная логика.',
      duration: '~5 часов',
      lessons: 8,
    },
    {
      id: 4,
      icon: '💾',
      title: 'AI-Агенты и Память',
      desc: 'Системы с контекстом (RAG). Обработка PDF и изображений. Airtable как база знаний.',
      duration: '~6 часов',
      lessons: 9,
    },
    {
      id: 5,
      icon: '💰',
      title: 'Бизнес и Продажи',
      desc: 'Как найти первого клиента, провести аудит бизнеса и назначить правильную цену.',
      duration: '~4 часа',
      lessons: 6,
    },
  ];

  const moduleCards = MODULE_META.map(m => {
    const unlocked  = Store.isModuleUnlocked(m.id);
    const done      = Store.isModuleCompleted(m.id);
    const score     = state.quizScores[m.id];
    const clickAttr = unlocked ? `onclick="window.location.hash='#module-${m.id}'"` : '';

    const statusBadge = done
      ? `<span class="badge badge--success">✓ Завершён · ${score}%</span>`
      : unlocked
        ? `<span class="badge badge--primary">Доступен</span>`
        : `<span class="badge" style="background:rgba(71,85,105,0.12);color:var(--color-text-faint);border-color:rgba(71,85,105,0.18)">🔒 Заблокирован</span>`;

    return `
      <div class="module-card ${!unlocked ? 'module-card--locked' : ''} ${done ? 'module-card--completed' : ''}"
           data-module="${m.id}"
           ${clickAttr}>
        <div class="module-card__number">Модуль ${m.id}</div>
        <div class="module-card__icon">${m.icon}</div>
        <div class="module-card__title">${m.title}</div>
        <div class="module-card__desc">${m.desc}</div>
        <div class="module-card__meta">
          ${statusBadge}
          <span class="text-xs text-faint">${m.duration} · ${m.lessons} тем</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar__fill progress-bar__fill--${done ? 'success' : unlocked ? 'primary' : 'secondary'}"
               style="width:${done ? 100 : 0}%"></div>
        </div>
      </div>`;
  }).join('');

  const STACK_ITEMS = [
    ['⚙️', 'Make.com',          'Визуальная автоматизация'],
    ['🧠', 'OpenAI GPT-4o',     'Интеллект сценариев'],
    ['🤖', 'Claude / DeepSeek', 'Альтернативные LLM'],
    ['📊', 'Google Sheets',     'База данных / Память'],
    ['📱', 'Telegram Bot API',  'Интерфейс клиента'],
    ['🗄️', 'Airtable',          'Структурированные данные'],
  ];

  const stackItems = STACK_ITEMS.map(([icon, name, desc]) => `
    <div class="stack-item">
      <span class="stack-item__icon">${icon}</span>
      <div>
        <div class="stack-item__name">${name}</div>
        <div class="stack-item__desc">${desc}</div>
      </div>
    </div>`).join('');

  return `
    <div class="container--wide">

      <!-- HERO -->
      <div class="hero">
        <div class="hero__eyebrow">⚡ 90-дневная программа · Старт прямо сейчас</div>
        <h1 class="hero__title">AI-Интегратор 2026</h1>
        <p class="hero__subtitle">
          От нуля до первых денег на AI-автоматизациях. Ты научишься создавать
          умных ботов и продавать их бизнесу — без единой строчки кода.
        </p>

        <div class="hero__stats">
          <div class="hero__stat">
            <span class="hero__stat-value" data-counter="${completed}" data-max="5">${completed}/5</span>
            <span class="hero__stat-label">Модулей пройдено</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value" data-counter="${info.xp}">${info.xp}</span>
            <span class="hero__stat-label">Очков опыта</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value" data-counter="${daysElapsed}">${daysElapsed}</span>
            <span class="hero__stat-label">Дней в обучении</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value" data-counter="${progress}">${progress}%</span>
            <span class="hero__stat-label">Прогресс курса</span>
          </div>
        </div>

        <div class="hero__progress">
          <div class="hero__progress-labels">
            <span>Общий прогресс</span><span>${progress}%</span>
          </div>
          <div class="progress-bar progress-bar--tall">
            <div class="progress-bar__fill progress-bar__fill--primary" style="width:${progress}%"></div>
          </div>
        </div>
      </div>

      <!-- MODULES SECTION -->
      <div class="section-header">
        <h2 class="section-header__title">📚 Модули курса</h2>
        <p class="section-header__subtitle">Каждый модуль включает теорию, практику и финальный тест из 10 вопросов.</p>
      </div>

      <div class="module-grid">
        ${moduleCards}
      </div>

      <!-- TECH STACK -->
      <div class="content-card" style="margin-top:var(--space-8)">
        <div class="content-card__header">
          <div class="content-card__icon content-card__icon--resources">🛠️</div>
          <div>
            <div class="content-card__title">Технологический стек</div>
            <div class="text-sm text-muted">Инструменты, которые ты освоишь за 90 дней</div>
          </div>
        </div>
        <div class="stack-grid">
          ${stackItems}
        </div>
      </div>

    </div>`;
};
