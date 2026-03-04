/**
 * SettingsScreen — Pantalla d'opcions: tema, àudio, typewriter, mida de font, idioma.
 * Pot ser cridada des del menú o des del joc (onBack dinàmic).
 */

import i18n from '../engine/I18nManager.js';

const FONT_SIZES = [
  { key: 'small', css: 'settings-screen__font-btn--small' },
  { key: 'medium', css: 'settings-screen__font-btn--medium' },
  { key: 'large', css: 'settings-screen__font-btn--large' },
  { key: 'x-large', css: 'settings-screen__font-btn--x-large' },
  { key: 'xx-large', css: 'settings-screen__font-btn--xx-large' }
];

const FONT_FAMILIES = [
  { key: 'retro', labelKey: 'settings_font_retro', css: 'settings-screen__fontfamily-btn--retro' },
  { key: 'accessible', labelKey: 'settings_font_accessible', css: 'settings-screen__fontfamily-btn--accessible' }
];

const LANGUAGES = [
  { key: 'ca', label: 'CA' },
  { key: 'es', label: 'ES' },
  { key: 'en', label: 'EN' },
  { key: 'eu', label: 'EU' },
  { key: 'gl', label: 'GL' }
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
   */
  show(container, params = {}) {
    this._activeOnBack = params.onBack || this._defaultOnBack;
    const s = this._settings;
    const screen = document.createElement('div');
    screen.className = 'screen screen--active';

    screen.innerHTML = `
      <div class="settings-screen">
        <div class="settings-screen__header">
          <h1>${i18n.t('settings_title')}</h1>
          <button class="btn btn--icon settings-screen__back-btn" title="${i18n.t('settings_back')}"><i class="fa-solid fa-bars"></i></button>
        </div>
        <div class="settings-screen__options">
          ${this._renderToggle('theme', i18n.t('settings_theme'), s.get('theme') === 'dark' ? i18n.t('settings_theme_dark') : i18n.t('settings_theme_light'))}
          ${this._renderFontSize(s.get('fontSize'))}
          ${this._renderFontFamily(s.get('fontFamily'))}
          ${this._renderLanguage(i18n.lang)}
          ${this._renderToggle('musicEnabled', i18n.t('settings_music'), s.get('musicEnabled') ? 'ON' : 'OFF')}
          ${this._renderToggle('sfxEnabled', i18n.t('settings_sfx'), s.get('sfxEnabled') ? 'ON' : 'OFF')}
          ${this._renderToggle('typewriterEnabled', i18n.t('settings_typewriter'), s.get('typewriterEnabled') ? 'ON' : 'OFF')}
          ${this._renderToggle('timerEnabled', i18n.t('settings_timer'), s.get('timerEnabled') ? 'ON' : 'OFF')}
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

    // Listeners tipografia
    screen.querySelectorAll('.settings-screen__fontfamily-btn').forEach(btn => {
      btn.addEventListener('click', () => this._handleFontFamily(btn, screen));
    });

    // Listeners idioma
    screen.querySelectorAll('.settings-screen__lang-btn').forEach(btn => {
      btn.addEventListener('click', () => this._handleLanguage(btn, screen));
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

  /** @private — Renderitza els 2 botons de tipografia */
  _renderFontFamily(currentFamily) {
    const buttons = FONT_FAMILIES.map(({ key, labelKey, css }) => {
      const active = key === currentFamily ? ' settings-screen__fontfamily-btn--active' : '';
      return `<button class="settings-screen__fontfamily-btn ${css}${active}" data-family="${key}">${i18n.t(labelKey)}</button>`;
    }).join('');

    return `
      <div class="panel settings-screen__option">
        <span class="settings-screen__label">${i18n.t('settings_font_family')}</span>
        <div class="settings-screen__font-sizes">
          ${buttons}
        </div>
      </div>
    `;
  }

  /** @private — Renderitza els 5 botons "Aa" per a la mida de font */
  _renderFontSize(currentSize) {
    const buttons = FONT_SIZES.map(({ key, css }) => {
      const active = key === currentSize ? ' settings-screen__font-btn--active' : '';
      return `<button class="settings-screen__font-btn ${css}${active}" data-size="${key}">Aa</button>`;
    }).join('');

    return `
      <div class="panel settings-screen__option">
        <span class="settings-screen__label">${i18n.t('settings_font_size')}</span>
        <div class="settings-screen__font-sizes">
          ${buttons}
        </div>
      </div>
    `;
  }

  /** @private — Renderitza els 3 botons d'idioma (CA/ES/EN) */
  _renderLanguage(currentLang) {
    const buttons = LANGUAGES.map(({ key, label }) => {
      const active = key === currentLang ? ' settings-screen__lang-btn--active' : '';
      return `<button class="settings-screen__lang-btn${active}" data-lang="${key}">${label}</button>`;
    }).join('');

    return `
      <div class="panel settings-screen__option">
        <span class="settings-screen__label">${i18n.t('settings_language')}</span>
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

    screen.querySelectorAll('.settings-screen__font-btn').forEach(b => {
      b.classList.remove('settings-screen__font-btn--active');
    });
    btn.classList.add('settings-screen__font-btn--active');
  }

  /** @private */
  _handleFontFamily(btn, screen) {
    const family = btn.dataset.family;
    this._settings.set('fontFamily', family);
    this._settings.applyFontFamily();

    screen.querySelectorAll('.settings-screen__fontfamily-btn').forEach(b => {
      b.classList.remove('settings-screen__fontfamily-btn--active');
    });
    btn.classList.add('settings-screen__fontfamily-btn--active');
  }

  /** @private — Canvia l'idioma i re-renderitza la pantalla */
  _handleLanguage(btn, screen) {
    const lang = btn.dataset.lang;
    i18n.setLanguage(lang);
    document.title = i18n.t('page_title');

    // Re-renderitzar la pantalla sencera per reflectir el nou idioma
    const container = screen.parentElement;
    screen.remove();
    this.show(container, { onBack: this._activeOnBack !== this._defaultOnBack ? this._activeOnBack : undefined });
  }

  /** @private */
  _handleToggle(btn) {
    const key = btn.dataset.key;
    const s = this._settings;

    if (key === 'theme') {
      const newTheme = s.get('theme') === 'dark' ? 'light' : 'dark';
      s.set('theme', newTheme);
      s.applyTheme();
      btn.textContent = newTheme === 'dark' ? i18n.t('settings_theme_dark') : i18n.t('settings_theme_light');
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
    } else if (key === 'timerEnabled') {
      const val = !s.get('timerEnabled');
      s.set('timerEnabled', val);
      btn.textContent = val ? 'ON' : 'OFF';
    }
  }
}

export default SettingsScreen;
