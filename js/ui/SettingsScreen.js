/**
 * SettingsScreen — Pantalla d'opcions: tema, àudio, typewriter, mida de font.
 * Pot ser cridada des del menú o des del joc (onBack dinàmic).
 */

const FONT_SIZE_LABELS = {
  small: 'Petita',
  medium: 'Mitjana',
  large: 'Gran'
};

const FONT_SIZE_CYCLE = ['small', 'medium', 'large'];

class SettingsScreen {
  constructor({ settingsManager, audioManager, onBack }) {
    this._settings = settingsManager;
    this._audio = audioManager;
    this._defaultOnBack = onBack;
    this._activeOnBack = null;
  }

  /**
   * Mostra la pantalla d'opcions.
   * @param {HTMLElement} container
   * @param {object} params
   * @param {function} [params.onBack] — Callback personalitzat per tornar (ex: tornar al joc)
   * @param {string} [params.backLabel] — Text del botó tornar
   */
  show(container, params = {}) {
    this._activeOnBack = params.onBack || this._defaultOnBack;
    const backLabel = params.backLabel || 'Tornar al menú';
    const s = this._settings;
    const screen = document.createElement('div');
    screen.className = 'screen screen--active';

    screen.innerHTML = `
      <div class="settings-screen">
        <h1>OPCIONS</h1>
        <div class="settings-screen__options">
          ${this._renderToggle('theme', 'Tema', s.get('theme') === 'dark' ? 'Fosc' : 'Clar')}
          ${this._renderToggle('fontSize', 'Mida de lletra', FONT_SIZE_LABELS[s.get('fontSize')])}
          ${this._renderToggle('musicEnabled', 'Música', s.get('musicEnabled') ? 'ON' : 'OFF')}
          ${this._renderToggle('sfxEnabled', 'Efectes sonors', s.get('sfxEnabled') ? 'ON' : 'OFF')}
          ${this._renderToggle('typewriterEnabled', 'Efecte escriptura', s.get('typewriterEnabled') ? 'ON' : 'OFF')}
        </div>
        <div class="choices" style="margin-top: 2rem;">
          <button class="btn btn--center settings-screen__back-btn">${backLabel}</button>
        </div>
      </div>
    `;
    container.appendChild(screen);

    // Listeners toggles
    screen.querySelectorAll('.settings-screen__toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => this._handleToggle(btn));
    });

    // Listener tornar
    screen.querySelector('.settings-screen__back-btn')
      .addEventListener('click', () => {
        if (this._activeOnBack) this._activeOnBack();
      });
  }

  hide() {}
  destroy() {}

  /** @private */
  _renderToggle(key, label, valueLabel) {
    return `
      <div class="panel settings-screen__option">
        <span class="settings-screen__label">${label}</span>
        <button class="btn btn--center settings-screen__toggle-btn" data-key="${key}">
          ${valueLabel}
        </button>
      </div>
    `;
  }

  /** @private */
  _handleToggle(btn) {
    const key = btn.dataset.key;
    const s = this._settings;

    if (key === 'theme') {
      const newTheme = s.get('theme') === 'dark' ? 'light' : 'dark';
      s.set('theme', newTheme);
      s.applyTheme();
      btn.textContent = newTheme === 'dark' ? 'Fosc' : 'Clar';
    } else if (key === 'fontSize') {
      const current = s.get('fontSize');
      const idx = FONT_SIZE_CYCLE.indexOf(current);
      const next = FONT_SIZE_CYCLE[(idx + 1) % FONT_SIZE_CYCLE.length];
      s.set('fontSize', next);
      s.applyFontSize();
      btn.textContent = FONT_SIZE_LABELS[next];
    } else if (key === 'musicEnabled') {
      const val = !s.get('musicEnabled');
      s.set('musicEnabled', val);
      this._audio.setMusicEnabled(val);
      btn.textContent = val ? 'ON' : 'OFF';
    } else if (key === 'sfxEnabled') {
      const val = !s.get('sfxEnabled');
      s.set('sfxEnabled', val);
      this._audio.setSFXEnabled(val);
      btn.textContent = val ? 'ON' : 'OFF';
    } else if (key === 'typewriterEnabled') {
      const val = !s.get('typewriterEnabled');
      s.set('typewriterEnabled', val);
      btn.textContent = val ? 'ON' : 'OFF';
    }
  }
}

export default SettingsScreen;
