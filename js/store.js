/**
 * store.js — Persistent state management via localStorage.
 * Single source of truth for all user progress data.
 */

window.Store = {
  STORAGE_KEY: 'ai_integrator_2026_progress',
  
  DEFAULT_STATE: {
    xp: 0,
    completedModules: [],   // Array of module IDs [1,2,3...]
    quizScores: {},         // { 1: 80, 2: 90, ... }
    currentModule: 1,
    startDate: Date.now(),
    lastVisited: Date.now(),
  },

  load() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return { ...this.DEFAULT_STATE };
      const saved = JSON.parse(raw);
      return { ...this.DEFAULT_STATE, ...saved };
    } catch {
      return { ...this.DEFAULT_STATE };
    }
  },

  save(state) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('[Store] Failed to persist state:', e);
    }
  },

  get() {
    return this.load();
  },

  /** Days elapsed since the user started the course */
  getDaysElapsed() {
    const state = load();
    const elapsed = Math.floor((Date.now() - state.startDate) / (1000 * 60 * 60 * 24));
    return Math.max(0, elapsed);
  },

  /** Days remaining out of 90 */
  getDaysRemaining() {
    return Math.max(0, 90 - this.getDaysElapsed());
  },

  /** Check if a module is accessible */
  isModuleUnlocked(moduleId) {
    if (moduleId === 1) return true; // First module always open
    const state = load();
    return state.completedModules.includes(moduleId - 1);
  },

  /** Check if a module is fully completed */
  isModuleCompleted(moduleId) {
    return load().completedModules.includes(moduleId);
  },

  /** Save quiz score and unlock next module if passed (≥70%) */
  saveQuizScore(moduleId, score) {
    const state = load();
    state.quizScores[moduleId] = score;
    state.lastVisited = Date.now();

    if (score >= 70 && !state.completedModules.includes(moduleId)) {
      state.completedModules.push(moduleId);
      // Award XP: 500 per module completion
      state.xp += 500 + Math.round((score - 70) * 10);
    }

    save(state);
    return state;
  },

  /** Award arbitrary XP (for reading sections, etc.) */
  awardXP(amount) {
    const state = load();
    state.xp += amount;
    save(state);
    return state.xp;
  },

  /** Set current module being viewed */
  setCurrentModule(moduleId) {
    const state = load();
    state.currentModule = moduleId;
    state.lastVisited = Date.now();
    save(state);
  },

  /** Overall progress percentage (0-100) */
  getProgressPercent() {
    const state = load();
    return Math.round((state.completedModules.length / 5) * 100);
  },

  /** XP level info */
  getLevelInfo() {
    const state = load();
    const levels = [
      { name: 'Новичок',      xpNeeded: 0    },
      { name: 'Ученик',       xpNeeded: 500  },
      { name: 'Практик',      xpNeeded: 1200 },
      { name: 'Интегратор',   xpNeeded: 2200 },
      { name: 'Архитектор',   xpNeeded: 3500 },
      { name: 'AI Мастер',    xpNeeded: 5000 },
    ];

    let current = levels[0];
    let next = levels[1];

    for (let i = 0; i < levels.length; i++) {
      if (state.xp >= levels[i].xpNeeded) {
        current = levels[i];
        next = levels[i + 1] || null;
      } else {
        break;
      }
    }

    const progress = next
      ? Math.round(((state.xp - current.xpNeeded) / (next.xpNeeded - current.xpNeeded)) * 100)
      : 100;

    return { level: current.name, xp: state.xp, nextXP: next?.xpNeeded ?? null, progress };
  },

  /** Reset all progress (used in dev) */
  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
  },
};
