/**
 * quiz.js — Quiz engine renderer and logic. v2.0
 * Fixes:
 *  - Timer cleanup on navigation (no more global window._quizTimer leak)
 *  - Keyboard navigation (1-5 to select, Enter/Space to advance, Backspace to go back)
 *  - Animated score ring (counts up from 0)
 *  - Deduplicated quiz result rendering
 */

(function() {
  const Store = window.Store;

  // ── Quiz State (module-scoped, not global) ───────────────────────
  let currentQuizData   = null;
  let currentQuestion   = 0;
  let userAnswers       = [];
  let quizStartTime     = 0;
  let _timerInterval    = null; // scoped — not window-level

  // ── Cleanup (called on any navigation away from quiz) ─────────────
  function cleanupQuiz() {
    if (_timerInterval) {
      clearInterval(_timerInterval);
      _timerInterval = null;
    }
    document.removeEventListener('keydown', _keyHandler);
  }

  // ── Keyboard Handler ──────────────────────────────────────────────
  function _keyHandler(e) {
    const total = currentQuizData?.quiz?.length ?? 0;
    if (!total) return;

    // 1-5 / numpad 1-5 → select option
    const num = e.key >= '1' && e.key <= '5' ? parseInt(e.key) - 1 : -1;
    if (num >= 0 && num < currentQuizData.quiz[currentQuestion].options.length) {
      e.preventDefault();
      const opts = document.querySelectorAll('.quiz-option:not(.is-disabled)');
      if (opts[num]) opts[num].click();
      return;
    }

    // Enter / Space → next question (if answered)
    if ((e.key === 'Enter' || e.key === ' ') && !e.target.matches('button')) {
      e.preventDefault();
      document.getElementById('quiz-next')?.click();
      return;
    }

    // Backspace / ArrowLeft → previous question
    if (e.key === 'Backspace' || e.key === 'ArrowLeft') {
      e.preventDefault();
      document.getElementById('quiz-prev')?.click();
    }
  }

  // ── Public render entry ───────────────────────────────────────────
  window.renderQuiz = function(moduleId) {
    const MODULES = {
      1: window.MODULE_1, 2: window.MODULE_2, 3: window.MODULE_3,
      4: window.MODULE_4, 5: window.MODULE_5,
    };
    const m = MODULES[moduleId];
    if (!m || !m.quiz) return `<div class="container--wide"><p class="text-muted">Тест не найден.</p></div>`;

    // Reset state
    currentQuizData  = m;
    currentQuestion  = 0;
    userAnswers      = [];
    quizStartTime    = Date.now();

    cleanupQuiz(); // Ensure no leftover timers

    return `
      <div class="container" id="quiz-root">
        <div id="quiz-container">
          <div style="text-align:center; padding:80px 0; color:var(--color-text-faint)">
            Подготовка теста…
          </div>
        </div>
      </div>`;
  };

  window.initQuiz = function() {
    renderQuestion();
    document.addEventListener('keydown', _keyHandler);
  };

  // ── Render a single question ──────────────────────────────────────
  function renderQuestion() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    const q     = currentQuizData.quiz[currentQuestion];
    const total = currentQuizData.quiz.length;
    const pct   = ((currentQuestion + 1) / total) * 100;
    const isLast = currentQuestion === total - 1;

    container.innerHTML = `
      <div class="quiz-header">
        <div class="quiz-progress-text">Вопрос ${currentQuestion + 1} из ${total}</div>
        <div class="quiz-timer" id="quiz-time-display">00:00</div>
      </div>

      <div class="progress-bar" style="margin-bottom:var(--space-8); height:5px;">
        <div class="progress-bar__fill progress-bar__fill--primary"
             style="width:${pct}%; transition: width 0.4s ease;"></div>
      </div>

      <div class="quiz-question">
        <div class="quiz-question__type">${q.type || 'Вопрос на понимание'}</div>
        <div class="quiz-question__text">${q.question}</div>
        ${q.context ? `<div class="quiz-question__context">${q.context}</div>` : ''}

        <div class="quiz-options">
          ${q.options.map((opt, idx) => `
            <div class="quiz-option" data-idx="${idx}" tabindex="0" role="button" aria-label="Вариант ${String.fromCharCode(65 + idx)}">
              <div class="quiz-option__letter">${String.fromCharCode(65 + idx)}</div>
              <span>${opt}</span>
              <div class="quiz-option__key-hint">${idx + 1}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="quiz-nav">
        <button class="btn btn--secondary" id="quiz-prev"
          ${currentQuestion === 0 ? 'disabled' : ''}>← Назад</button>
        <button class="btn btn--primary" id="quiz-next" style="margin-left:auto">
          ${isLast ? 'Завершить тест ✓' : 'Дальше →'}
        </button>
      </div>
    `;

    // Restore previous answer highlight
    if (userAnswers[currentQuestion] !== undefined) {
      const prev = container.querySelector(`.quiz-option[data-idx="${userAnswers[currentQuestion]}"]`);
      prev?.classList.add('is-selected');
    }

    // Click-select an option
    container.querySelectorAll('.quiz-option').forEach(el => {
      el.onclick = () => {
        container.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('is-selected'));
        el.classList.add('is-selected');
        userAnswers[currentQuestion] = parseInt(el.dataset.idx);
      };
    });

    // Navigation
    document.getElementById('quiz-prev').onclick = () => {
      if (currentQuestion > 0) { currentQuestion--; renderQuestion(); }
    };

    document.getElementById('quiz-next').onclick = () => {
      if (userAnswers[currentQuestion] === undefined) {
        window.showToast('⚠️ Выбери вариант ответа!', 'error', '🤔');
        return;
      }
      if (currentQuestion < total - 1) {
        currentQuestion++;
        renderQuestion();
      } else {
        finishQuiz();
      }
    };

    // Start or maintain timer
    _startTimer();
  }

  // ── Timer ─────────────────────────────────────────────────────────
  function _startTimer() {
    if (_timerInterval) return; // Already running
    _timerInterval = setInterval(() => {
      const el = document.getElementById('quiz-time-display');
      if (!el) { cleanupQuiz(); return; }
      const diff = Math.floor((Date.now() - quizStartTime) / 1000);
      const mm = Math.floor(diff / 60).toString().padStart(2, '0');
      const ss = (diff % 60).toString().padStart(2, '0');
      el.textContent = `${mm}:${ss}`;
    }, 1000);
  }

  // ── Finish Quiz ───────────────────────────────────────────────────
  function finishQuiz() {
    cleanupQuiz(); // Stop timer and keyboard listener

    const total = currentQuizData.quiz.length;
    let correct = 0;

    userAnswers.forEach((ans, idx) => {
      if (ans === currentQuizData.quiz[idx].correct) correct++;
    });

    const score  = Math.round((correct / total) * 100);
    const passed = score >= 70;

    Store.saveQuizScore(currentQuizData.id, score);
    renderResult(score, passed, correct, total);
  }

  // ── Render Result ─────────────────────────────────────────────────
  function renderResult(score, passed, correct, total) {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    if (passed) window.launchConfetti();

    // Build error review data
    const errors = userAnswers.reduce((acc, ans, idx) => {
      const q = currentQuizData.quiz[idx];
      if (ans !== q.correct) {
        acc.push({
          num: idx + 1,
          question: q.question,
          options: q.options,
          userAnswerIdx: ans,
          correctAnswerIdx: q.correct,
          context: q.context,
        });
      }
      return acc;
    }, []);

    // Error review slider HTML
    let reviewHtml = '';
    if (errors.length > 0) {
      const cards = errors.map(err => {
        const opts = err.options.map((opt, oIdx) => {
          let cls = '', icon = '', label = '';
          if (oIdx === err.correctAnswerIdx) { cls = 'is-correct'; icon = '✅'; label = 'Правильный ответ'; }
          else if (oIdx === err.userAnswerIdx)   { cls = 'is-wrong';   icon = '❌'; label = 'Ваш выбор'; }

          const statusHtml = label
            ? `<div class="review-card__status-msg review-card__status-msg--${cls === 'is-correct' ? 'correct' : 'wrong'}">${icon} ${label}</div>`
            : '';

          return `
            <div class="quiz-option is-disabled ${cls}" style="--delay:${oIdx * 90}ms">
              <div class="quiz-option__letter">${String.fromCharCode(65 + oIdx)}</div>
              <div style="flex:1">
                <div style="font-weight:500">${opt}</div>
                ${statusHtml}
              </div>
            </div>`;
        }).join('');

        return `
          <div class="review-card">
            <div class="review-card__header">
              <span class="review-card__num">Вопрос ${err.num}</span>
              <div class="review-card__question">${err.question}</div>
            </div>
            ${err.context ? `<div class="quiz-question__context">${err.context}</div>` : ''}
            <div class="quiz-options">${opts}</div>
          </div>`;
      }).join('');

      reviewHtml = `
        <div class="quiz-review">
          <div class="quiz-review__header">
            <h3 class="quiz-review__title">Разбор ошибок</h3>
            <p class="quiz-review__subtitle">Изучай вопросы по одному — нажимай ← → или клавиши со стрелками</p>
          </div>

          <div class="review-slider-window">
            <div class="review-slider-track" id="review-track">
              ${cards}
            </div>
          </div>

          <div class="review-controls">
            <button class="review-nav-btn" id="review-prev"
              onclick="window.switchReviewSlide(-1)" disabled>←</button>
            <div class="review-progress">
              <span id="review-current">1</span> / ${errors.length}
            </div>
            <button class="review-nav-btn" id="review-next"
              onclick="window.switchReviewSlide(1)"
              ${errors.length <= 1 ? 'disabled' : ''}>→</button>
          </div>
        </div>`;

      // Initialize review slider state
      window.__reviewState = { current: 0, total: errors.length };

      window.switchReviewSlide = (dir) => {
        const st = window.__reviewState;
        const idx = st.current + dir;
        if (idx < 0 || idx >= st.total) return;

        st.current = idx;
        const track   = document.getElementById('review-track');
        const prevBtn = document.getElementById('review-prev');
        const nextBtn = document.getElementById('review-next');
        const counter = document.getElementById('review-current');
        const winEl   = document.querySelector('.review-slider-window');

        if (track) {
          track.style.transform = `translateX(-${idx * 100}%)`;

          // Dynamic height sync
          const card = track.querySelectorAll('.review-card')[idx];
          if (card && winEl) winEl.style.height = card.offsetHeight + 'px';

          // Re-trigger stagger animation on new card
          if (card) {
            card.style.animation = 'none';
            void card.offsetWidth;
            card.style.animation = 'fadeInScale 0.4s ease-out both';
            card.querySelectorAll('.quiz-option').forEach(o => {
              o.style.animation = 'none';
              void o.offsetWidth;
              o.style.animation = 'slideInUp 0.35s ease-out forwards';
            });
          }
        }

        if (counter) counter.textContent = idx + 1;
        if (prevBtn) prevBtn.disabled = idx === 0;
        if (nextBtn) nextBtn.disabled = idx === st.total - 1;
      };
    }

    // Action buttons
    const nextModuleBtn = passed
      ? (currentQuizData.id < 5
        ? `<button class="btn btn--primary" onclick="window.location.hash='#module-${currentQuizData.id + 1}'">К следующему модулю →</button>`
        : `<button class="btn btn--success" onclick="window.location.hash='#home'">🏆 Вернуться на главную</button>`)
      : `<button class="btn btn--primary" onclick="window.location.hash='#quiz-${currentQuizData.id}'">🔁 Попробовать снова</button>`;

    const scoreColor = passed ? '#10b981' : '#ef4444';

    container.innerHTML = `
      <div class="quiz-result">
        <div class="quiz-result__score-ring">
          <canvas id="score-canvas" width="160" height="160"></canvas>
          <div class="quiz-result__score-num" style="color:${scoreColor}" id="score-num">0%</div>
          <div class="quiz-result__score-label">${correct}/${total} верно</div>
        </div>

        <h2 class="quiz-result__title">${passed ? '🎉 Потрясающе!' : '📚 Нужно повторить'}</h2>
        <p class="quiz-result__desc">
          ${passed
            ? `Вы успешно прошли тест и получили <strong>${currentQuizData.xpReward} XP</strong>. Теперь вам доступен следующий модуль программы.`
            : `К сожалению, набрано меньше 70%. Перечитайте теорию модуля и попробуйте ещё раз.`}
        </p>

        <div class="quiz-result__actions">
          <button class="btn btn--secondary"
            onclick="window.location.hash='#module-${currentQuizData.id}'">К теории модуля</button>
          ${nextModuleBtn}
        </div>

        ${reviewHtml}
      </div>
    `;

    // Animate score ring + counter
    animateScoreResult(score, passed);

    // Initial height for review slider
    if (errors.length > 0) {
      setTimeout(() => {
        const track = document.getElementById('review-track');
        const winEl = document.querySelector('.review-slider-window');
        if (track && winEl) {
          const first = track.querySelector('.review-card');
          if (first) winEl.style.height = first.offsetHeight + 'px';
        }
      }, 80);
    }
  }

  // ── Animated Score Ring + Counter ────────────────────────────────
  function animateScoreResult(targetScore, passed) {
    const canvas = document.getElementById('score-canvas');
    const numEl  = document.getElementById('score-num');
    if (!canvas || !numEl) return;

    const ctx     = canvas.getContext('2d');
    const cx      = canvas.width  / 2;
    const cy      = canvas.height / 2;
    const radius  = 68;
    const start   = -0.5 * Math.PI; // Top of circle
    const arcColor   = passed ? '#10b981' : '#ef4444';
    const trackColor = 'rgba(255,255,255,0.04)';
    const glow    = passed ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)';

    let current = 0;
    const duration   = 1200; // ms
    const startTime  = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function draw(now) {
      const elapsed = now - startTime;
      const t       = Math.min(elapsed / duration, 1);
      current       = Math.round(easeOutExpo(t) * targetScore);

      // Clear & draw track
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
      ctx.lineWidth = 10;
      ctx.strokeStyle = trackColor;
      ctx.stroke();

      // Draw progress arc
      const endAngle = start + (current / 100) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, start, endAngle);
      ctx.lineWidth = 10;
      ctx.lineCap   = 'round';
      ctx.shadowColor  = glow;
      ctx.shadowBlur   = 16;
      ctx.strokeStyle  = arcColor;
      ctx.stroke();
      ctx.shadowBlur   = 0;

      // Update counter text
      numEl.textContent = current + '%';
      numEl.style.color = arcColor;

      if (t < 1) requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }
})(window);
