/**
 * module.js — Renderer for a single module page. v2.0
 * Improvements: CSS classes instead of inline styles, improved CTA block.
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
  if (!m) return `<div class="container--wide"><p class="text-muted">Модуль не найден.</p></div>`;

  const done  = Store.isModuleCompleted(id);
  const score = Store.get().quizScores[id];

  const completedBadge = done
    ? `<div class="module-hero__meta-item">✅ Завершён: <strong>${score}%</strong></div>`
    : '';

  const workshopSteps = m.workshop.steps.map((s, idx) => `
    <div class="step">
      <div class="step__number">${idx + 1}</div>
      <div class="step__content">
        <h4 class="step__title">${s.title}</h4>
        <p class="step__text">${s.text}</p>
        ${s.screenshot ? `
          <div class="screenshot-placeholder">
            <span class="screenshot-placeholder__icon">🖼️</span>
            ${s.screenshot}
          </div>
        ` : ''}
      </div>
    </div>`).join('');

  const resourceItems = m.resources.map(r => `
    <a href="${r.url}" target="_blank" rel="noopener" class="resource-link">
      <div class="resource-link__icon resource-link__icon--${r.type}">${r.icon}</div>
      <div class="resource-link__text">
        <div class="resource-link__title">${r.title}</div>
        <div class="resource-link__meta">${r.meta}</div>
      </div>
      <div class="resource-link__arrow">→</div>
    </a>`).join('');

  const homeworkItems = m.homework.tasks.map(t => `
    <div class="homework-item">
      <div class="homework-item__check"></div>
      <span>${t}</span>
    </div>`).join('');

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
          ${completedBadge}
        </div>
      </div>

      <!-- THEORY -->
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

      <!-- WORKSHOP -->
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
            ${workshopSteps}
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

      <!-- RESOURCES & HOMEWORK -->
      <div class="grid-2">
        <section class="section">
          <div class="content-card" style="height:100%">
            <div class="content-card__header">
              <div class="content-card__icon content-card__icon--resources">📖</div>
              <h2 class="content-card__title">Ресурсы</h2>
            </div>
            <div class="resource-list">
              ${resourceItems}
            </div>
          </div>
        </section>

        <section class="section">
          <div class="homework-block" style="height:100%">
            <h2 class="homework-block__title">${m.homework.title}</h2>
            <p class="homework-block__subtitle">${m.homework.subtitle}</p>
            <div class="homework-list">
              ${homeworkItems}
            </div>
          </div>
        </section>
      </div>

      <!-- QUIZ CTA -->
      <div class="module-cta">
        <h2 class="module-cta__title">Готов к проверке знаний?</h2>
        <p class="module-cta__text">
          Пройди тест из 10 вопросов, чтобы закрепить понимание и открыть следующий модуль.
          Нужно набрать минимум <strong>70%</strong> верных ответов.
        </p>
        <button class="btn btn--primary btn--lg" onclick="window.location.hash='#quiz-${id}'">
          ${done ? '🔁 Пройти тест повторно' : '🚀 Начать финальный тест'}
        </button>
      </div>

    </div>
  `;
};
