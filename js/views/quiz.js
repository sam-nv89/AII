/**
 * quiz.js — Quiz engine renderer and logic.
 */

(function() {
  const Store = window.Store;
  
  // Quiz State
  let currentQuizData = null;
  let currentQuestionIdx = 0;
  let userAnswers = [];
  let quizStartTime = 0;

  window.renderQuiz = function(moduleId) {
    const MODULES = { 1: window.MODULE_1, 2: window.MODULE_2, 3: window.MODULE_3, 4: window.MODULE_4, 5: window.MODULE_5 };
    const m = MODULES[moduleId];
    if (!m || !m.quiz) return `<div class="container--wide">Тест не найден</div>`;

    currentQuizData = m;
    currentQuestionIdx = 0;
    userAnswers = [];
    quizStartTime = Date.now();

    return `
      <div class="container">
        <div id="quiz-container">
          <div style="text-align:center; padding: 100px 0;">Инициализация теста...</div>
        </div>
      </div>
    `;
  };

  window.initQuiz = function(moduleId) {
    renderQuestion();
  };

  function renderQuestion() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    const q = currentQuizData.quiz[currentQuestionIdx];
    const total = currentQuizData.quiz.length;

    container.innerHTML = `
      <div class="quiz-header">
        <div class="quiz-progress-text">Вопрос ${currentQuestionIdx + 1} из ${total}</div>
        <div class="quiz-timer" id="quiz-time-display">00:00</div>
      </div>

      <div class="progress-bar" style="margin-bottom: var(--space-8); height: 6px;">
        <div class="progress-bar__fill progress-bar__fill--primary" style="width: ${((currentQuestionIdx + 1) / total) * 100}%"></div>
      </div>

      <div class="quiz-question">
        <div class="quiz-question__type">${q.type || 'Вопрос на понимание логики'}</div>
        <div class="quiz-question__text">${q.question}</div>
        ${q.context ? `<div class="quiz-question__context">${q.context}</div>` : ''}
        
        <div class="quiz-options">
          ${q.options.map((opt, idx) => `
            <div class="quiz-option" data-idx="${idx}">
              <div class="quiz-option__letter">${String.fromCharCode(65 + idx)}</div>
              <span>${opt}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="quiz-nav">
         <button class="btn btn--secondary" id="quiz-prev" ${currentQuestionIdx === 0 ? 'disabled' : ''}>← Назад</button>
         <button class="btn btn--primary" id="quiz-next" style="margin-left:auto;">
           ${currentQuestionIdx === total - 1 ? 'Завершить тест' : 'Дальше →'}
         </button>
      </div>
    `;

    // Restore previous answer if any
    if (userAnswers[currentQuestionIdx] !== undefined) {
      const prevOption = container.querySelector(`.quiz-option[data-idx="${userAnswers[currentQuestionIdx]}"]`);
      prevOption?.classList.add('is-selected');
    }

    // Event Listeners
    container.querySelectorAll('.quiz-option').forEach(el => {
      el.onclick = () => {
        container.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('is-selected'));
        el.classList.add('is-selected');
        userAnswers[currentQuestionIdx] = parseInt(el.dataset.idx);
      };
    });

    document.getElementById('quiz-prev').onclick = () => {
      if (currentQuestionIdx > 0) {
        currentQuestionIdx--;
        renderQuestion();
      }
    };

    document.getElementById('quiz-next').onclick = () => {
      if (userAnswers[currentQuestionIdx] === undefined) {
        window.showToast('⚠️ Выбери вариант ответа!', 'error', '🤔');
        return;
      }
      if (currentQuestionIdx < total - 1) {
        currentQuestionIdx++;
        renderQuestion();
      } else {
        finishQuiz();
      }
    };

    // Timer update
    if (!window._quizTimer) {
      window._quizTimer = setInterval(() => {
        const el = document.getElementById('quiz-time-display');
        if (!el) {
          clearInterval(window._quizTimer);
          window._quizTimer = null;
          return;
        }
        const diff = Math.floor((Date.now() - quizStartTime) / 1000);
        const m = Math.floor(diff / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        el.textContent = `${m}:${s}`;
      }, 1000);
    }
  }

  function finishQuiz() {
    clearInterval(window._quizTimer);
    window._quizTimer = null;

    const total = currentQuizData.quiz.length;
    let correctCount = 0;

    userAnswers.forEach((ans, idx) => {
      if (ans === currentQuizData.quiz[idx].correct) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / total) * 100);
    const passed = scorePercent >= 70;

    // Save progress
    Store.saveQuizScore(currentQuizData.id, scorePercent);

    renderResult(scorePercent, passed, correctCount, total);
  }

  function renderResult(score, passed, correct, total) {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    if (passed) window.launchConfetti();

    container.innerHTML = `
      <div class="quiz-result">
        <div class="quiz-result__score-ring">
          <canvas id="score-canvas" width="140" height="140"></canvas>
          <div class="quiz-result__score-num">${score}%</div>
          <div class="quiz-result__score-label">${correct}/${total} верно</div>
        </div>

        <h2 class="quiz-result__title">${passed ? '🎉 Потрясающе!' : '📚 Нужно повторить'}</h2>
        <p class="quiz-result__desc">
          ${passed 
            ? `Вы успешно прошли тест и получили <strong>${currentQuizData.xpReward} XP</strong>. Теперь вам доступен следующий модуль программы.` 
            : `К сожалению, вы набрали меньше 70%. Перечитайте теорию модуля и попробуйте еще раз.`
          }
        </p>

        <div style="display:flex; justify-content:center; gap:var(--space-4);">
          <button class="btn btn--secondary" onclick="window.location.hash='#module-${currentQuizData.id}'">К теории модуля</button>
          ${passed 
            ? (currentQuizData.id < 5 
                ? `<button class="btn btn--primary" onclick="window.location.hash='#module-${currentQuizData.id + 1}'">К следующему модулю →</button>`
                : `<button class="btn btn--success" onclick="window.location.hash='#home'">Вернуться на главную</button>`)
            : `<button class="btn btn--primary" onclick="window.location.hash='#quiz-${currentQuizData.id}'">Попробовать снова</button>`
          }
        </div>
      </div>
    `;

    drawScoreRing(score, passed);
  }

  function drawScoreRing(score, passed) {
    const canvas = document.getElementById('score-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    const radius = 60;
    const startAngle = -0.5 * Math.PI;
    const endAngle = (score / 50 - 0.5) * Math.PI;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.strokeStyle = passed ? '#10b981' : '#ef4444';
    ctx.stroke();
  }
})();
