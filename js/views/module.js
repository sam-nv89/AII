/**
 * module.js — Renderer for a single module page.
 */

window.renderModule = function(id) {
  const Store = window.Store;
  const MODULES = {
    1: window.MODULE_1,
    2: window.MODULE_2,
    3: window.MODULE_3,
    4: window.MODULE_4,
    5: window.MODULE_5,
  };

  const m = MODULES[id];
  if (!m) return `<div class="container--wide">Модуль не найден</div>`;

  const done = Store.isModuleCompleted(id);
  const score = Store.get().quizScores[id];

  return `
    <div class="container--wide">
      
      <!-- MODULE HERO -->
      <div class="module-hero">
        <div class="module-hero__eyebrow">Модуль ${m.id}</div>
        <h1 class="module-hero__title">${m.title}</h1>
        <p class="module-hero__subtitle">${m.subtitle}</p>
        
        <div class="module-hero__meta">
          <div class="module-hero__meta-item">⏱️ Длительность: <strong>${m.duration}</strong></div>
          <div class="module-hero__meta-item">💎 Награда: <strong>${m.xpReward} XP</strong></div>
          ${done ? `<div class="module-hero__meta-item">✅ Завершён: <strong>${score}%</strong></div>` : ''}
        </div>
      </div>

      <!-- THEORY SECTION -->
      <section class="section">
        <div class="content-card">
          <div class="content-card__header">
            <div class="content-card__icon content-card__icon--theory">🎓</div>
            <h2 class="content-card__title">${m.theory.title}</h2>
          </div>
          <div class="content-card__body">
            ${m.theory.content}
          </div>
        </div>
      </section>

      <!-- LOGIC FLOW (if present) -->
      ${m.flowDiagram ? `
      <section class="section">
        <div class="section-header">
          <h3 class="section-header__title">📊 Схема логики</h3>
          <p class="section-header__subtitle">Визуализация потока данных в сценарии</p>
        </div>
        <div class="flow-diagram">${m.flowDiagram}</div>
      </section>
      ` : ''}

      <!-- WORKSHOP SECTION -->
      <section class="section">
        <div class="content-card">
          <div class="content-card__header">
            <div class="content-card__icon content-card__icon--workshop">🔧</div>
            <div>
              <h2 class="content-card__title">${m.workshop.title}</h2>
              <p class="text-sm text-muted">${m.workshop.subtitle}</p>
            </div>
          </div>
          <div class="workshop-steps">
            ${m.workshop.steps.map((s, idx) => `
              <div class="step">
                <div class="step__number">${idx + 1}</div>
                <div class="step__content">
                  <h4 class="step__title">${s.title}</h4>
                  <p class="step__text">${s.text}</p>
                  ${s.screenshot ? `
                    <div class="screenshot-placeholder">
                      <div class="screenshot-placeholder__icon">🖼️</div>
                      [СКРИНШОТ: ${s.screenshot}]
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- ERROR FIRST BLOCK -->
      <section class="section">
        <div class="content-card">
          <div class="content-card__header">
            <div class="content-card__icon content-card__icon--error">💥</div>
            <h2 class="content-card__title">${m.errorBlock.title}</h2>
          </div>
          <div class="error-block">
            <div class="error-block__body">${m.errorBlock.body}</div>
            <div class="error-block__fix">${m.errorBlock.fix}</div>
          </div>
        </div>
      </section>

      <!-- HOMEWORK & RESOURCES -->
      <div class="grid-2">
        <section class="section">
          <div class="content-card" style="height:100%">
            <div class="content-card__header">
              <div class="content-card__icon content-card__icon--resources">📖</div>
              <h2 class="content-card__title">Ресурсы</h2>
            </div>
            <div class="resource-list">
              ${m.resources.map(r => `
                <a href="${r.url}" target="_blank" class="resource-link">
                  <div class="resource-link__icon resource-link__icon--${r.type}">${r.icon}</div>
                  <div class="resource-link__text">
                    <div class="resource-link__title">${r.title}</div>
                    <div class="resource-link__meta">${r.meta}</div>
                  </div>
                  <div class="resource-link__arrow">→</div>
                </a>
              `).join('')}
            </div>
          </div>
        </section>

        <section class="section">
          <div class="homework-block" style="height:100%">
            <h2 class="homework-block__title">${m.homework.title}</h2>
            <p class="homework-block__subtitle">${m.homework.subtitle}</p>
            <div class="homework-list">
              ${m.homework.tasks.map(t => `
                <div class="homework-item">
                  <div class="homework-item__check"></div>
                  <span>${t}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      </div>

      <!-- QUIZ CTA -->
      <div style="text-align:center; padding:var(--space-12) 0;">
        <h2 class="text-2xl font-bold" style="margin-bottom:var(--space-4)">Готов к проверке знаний?</h2>
        <p class="text-muted" style="margin-bottom:var(--space-8); max-width:600px; margin-left:auto; margin-right:auto;">
          Пройди тест из 10 вопросов, чтобы закрепить понимание и открыть следующий модуль. 
          Нужно набрать минимум 70% верных ответов.
        </p>
        <button class="btn btn--primary btn--lg" onclick="window.location.hash='#quiz-${id}'">
          ${done ? 'Пройти тест повторно' : '🚀 Начать финальный тест'}
        </button>
      </div>

    </div>
  `;
};
