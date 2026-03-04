/**
 * SettingsManager — Gestiona preferències d'usuari amb localStorage.
 * No emmagatzema dades d'usuari, només configuració de UI.
 */

const STORAGE_KEY = 'aventures-retro-settings';

const DEFAULTS = {
  theme: 'dark',
  musicEnabled: true,
  sfxEnabled: true,
  typewriterEnabled: true,
  typewriterSpeed: 30,
  fontSize: 'medium',
  fontFamily: 'retro'
};

class SettingsManager {
  constructor() {
    this._settings = this._load();
  }

  /**
   * Retorna el valor d'una preferència.
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    if (!(key in DEFAULTS)) {
      throw new Error(`Clau de configuració desconeguda: "${key}"`);
    }
    return this._settings[key];
  }

  /**
   * Estableix el valor d'una preferència i persisteix.
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    if (!(key in DEFAULTS)) {
      throw new Error(`Clau de configuració desconeguda: "${key}"`);
    }
    this._settings[key] = value;
    this._save();
  }

  /**
   * Retorna una còpia de totes les preferències.
   * @returns {object}
   */
  getAll() {
    return { ...this._settings };
  }

  /**
   * Restaura valors per defecte i persisteix.
   */
  reset() {
    this._settings = { ...DEFAULTS };
    this._save();
  }

  /**
   * Aplica el tema al DOM (atribut data-theme al body).
   */
  applyTheme() {
    document.body.setAttribute('data-theme', this._settings.theme);
  }

  /**
   * Aplica la mida de font al DOM (atribut data-font-size al body).
   */
  applyFontSize() {
    document.body.setAttribute('data-font-size', this._settings.fontSize);
  }

  /**
   * Aplica la tipografia al DOM (atribut data-font-family al body).
   */
  applyFontFamily() {
    document.body.setAttribute('data-font-family', this._settings.fontFamily);
  }

  /**
   * Aplica totes les preferències visuals al DOM.
   */
  applyAll() {
    this.applyTheme();
    this.applyFontSize();
    this.applyFontFamily();
  }

  /** @private */
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULTS, ...parsed };
      }
    } catch (e) {
      // localStorage no disponible o dades corruptes — usar defaults
    }
    return { ...DEFAULTS };
  }

  /** @private */
  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._settings));
    } catch (e) {
      // localStorage no disponible — ignorar silenciosament
    }
  }
}

export default SettingsManager;
