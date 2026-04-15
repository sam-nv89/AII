/**
 * home.js — Dashboard / landing view.
 */

window.renderHome = function() {
  const Store = window.Store;
  const state       = Store.get();
  const info        = Store.getLevelInfo();
  const progress    = Store.getProgressPercent();
  const daysElapsed = Store.getDaysElapsed();
  const completed   = state.completedModules.length;

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

    const statusBadge = done
      ? `<span class="badge badge--success">✓ Завершён · ${score}%</span>`
      : unlocked
        ? `<span class="badge badge--primary">Доступен</span>`
        : `<span class="badge" style="background:rgba(71,85,105,0.15);color:var(--color-text-faint);border-color:rgba(71,85,105,0.2)">🔒 Заблокирован</span>`;

    return `
      <div class="module-card ${!unlocked ? 'module-card--locked' : ''} ${done ? 'module-card--completed' : ''}"
           ${unlocked ? `onclick="window.location.hash='#module-${m.id}'"` : ''}>
        <div class="module-card__number">Модуль ${m.id}</div>
        <div class="module-card__icon">${m.icon}</div>
        <div class="module-card__title">${m.title}</div>
        <div class="module-card__desc">${m.desc}</div>
        <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3);">
          ${statusBadge}
          <span style="font-size:var(--font-size-xs);color:var(--color-text-faint)">${m.duration} · ${m.lessons} тем</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar__fill progress-bar__fill--${done ? 'success' : unlocked ? 'primary' : 'secondary'}" 
               style="width:${done ? 100 : 0}%"></div>
        </div>
      </div>`;
  }).join('');

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
            <span class="hero__stat-value">${completed}/5</span>
            <span class="hero__stat-label">Модулей пройдено</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">${info.xp}</span>
            <span class="hero__stat-label">Очков опыта</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">${daysElapsed}</span>
            <span class="hero__stat-label">Дней в обучении</span>
          </div>
          <div class="hero__stat">
            <span class="hero__stat-value">${progress}%</span>
            <span class="hero__stat-label">Прогресс курса</span>
          </div>
        </div>

        <!-- Overall progress bar -->
        <div style="margin-top:var(--space-6)">
          <div style="display:flex;justify-content:space-between;font-size:var(--font-size-xs);color:var(--color-text-faint);margin-bottom:var(--space-2)">
            <span>Общий прогресс</span><span>${progress}%</span>
          </div>
          <div class="progress-bar" style="height:8px">
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

      <!-- STACK INFO -->
      <div class="content-card" style="margin-top:var(--space-8)">
        <div class="content-card__header">
          <div class="content-card__icon content-card__icon--resources">🛠️</div>
          <div>
            <div class="content-card__title">Технологический стек</div>
            <div style="font-size:var(--font-size-sm);color:var(--color-text-muted)">Инструменты, которые ты освоишь</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:var(--space-4)">
          ${[
            ['⚙️', 'Make.com', 'Визуальная автоматизация'],
            ['🧠', 'OpenAI GPT-4o', 'Интеллект сценариев'],
            ['🤖', 'Claude / DeepSeek', 'Альтернативные LLM'],
            ['📊', 'Google Sheets', 'База данных / Память'],
            ['📱', 'Telegram Bot API', 'Интерфейс клиента'],
            ['🗄️', 'Airtable', 'Структурированные данные'],
          ].map(([icon, name, desc]) => `
            <div style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:rgba(255,255,255,0.02);border:1px solid var(--color-border-light);border-radius:var(--radius-md)">
              <span style="font-size:24px">${icon}</span>
              <div>
                <div style="font-size:var(--font-size-sm);font-weight:600">${name}</div>
                <div style="font-size:var(--font-size-xs);color:var(--color-text-faint)">${desc}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>

    </div>`;
};
