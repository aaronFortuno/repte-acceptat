/**
 * SettingsScreen — Pantalla d'opcions: tema, àudio, typewriter, mida de font.
 * Pot ser cridada des del menú o des del joc (onBack dinàmic).
 */

const FONT_SIZES = [
  { key: 'small', css: 'settings-screen__font-btn--small' },
  { key: 'medium', css: 'settings-screen__font-btn--medium' },
  { key: 'large', css: 'settings-screen__font-btn--large' },
  { key: 'x-large', css: 'settings-screen__font-btn--x-large' },
  { key: 'xx-large', css: 'settings-screen__font-btn--xx-large' }
];

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
   * @param {function} [params.onBack] — Callback personalitzat per tornar
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
          ${this._renderFontSize(s.get('fontSize'))}
          ${this._renderToggle('musicEnabled', 'Música', s.get('musicEnabled') ? 'ON' : 'OFF')}
          ${this._renderToggle('sfxEnabled', 'Efectes sonors', s.get('sfxEnabled') ? 'ON' : 'OFF')}
          ${this._renderToggle('typewriterEnabled', 'Efecte escriptura', s.get('typewriterEnabled') ? 'ON' : 'OFF')}
        </div>
        <div class="settings-screen__footer">
          <button class="btn btn--center settings-screen__back-btn">${backLabel}</button>
        </div>
      </div>
    `;
    container.appendChild(screen);

    // Listeners toggles
    screen.querySelectorAll('.settings-screen__toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => this._handleToggle(btn));
    });

    // Listeners mida de font
    screen.querySelectorAll('.settings-screen__font-btn').forEach(btn => {
      btn.addEventListener('click', () => this._handleFontSize(btn, screen));
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

  /** @private — Renderitza els 3 botons "Aa" per a la mida de font */
  _renderFontSize(currentSize) {
    const buttons = FONT_SIZES.map(({ key, css }) => {
      const active = key === currentSize ? ' settings-screen__font-btn--active' : '';
      return `<button class="settings-screen__font-btn ${css}${active}" data-size="${key}">Aa</button>`;
    }).join('');

    return `
      <div class="panel settings-screen__option">
        <span class="settings-screen__label">Mida de lletra</span>
        <div class="settings-screen__font-sizes">
          ${buttons}
        </div>
      </div>
    `;
  }

  /** @private */
  _handleFontSize(btn, screen) {
    const size = btn.dataset.size;
    this._settings.set('fontSize', size);
    this._settings.applyFontSize();

    // Actualitzar estat actiu
    screen.querySelectorAll('.settings-screen__font-btn').forEach(b => {
      b.classList.remove('settings-screen__font-btn--active');
    });
    btn.classList.add('settings-screen__font-btn--active');
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
