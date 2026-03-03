/**
 * ScreenManager — Gestiona quina pantalla és visible i les transicions.
 */

class ScreenManager {
  constructor(containerEl) {
    this._container = containerEl;
    this._screens = {};
    this._currentName = null;
  }

  /**
   * Registra un objecte pantalla amb un nom.
   * @param {string} name
   * @param {object} screen — Ha de tenir show(container), hide(), destroy()
   */
  registerScreen(name, screen) {
    this._screens[name] = screen;
  }

  /**
   * Mostra una pantalla amb transició fade.
   * @param {string} name — Nom de la pantalla registrada
   * @param {object} [params] — Paràmetres opcionals per passar a show()
   */
  showScreen(name, params = {}) {
    if (!this._screens[name]) {
      throw new Error(`Pantalla "${name}" no registrada.`);
    }

    // Amagar pantalla actual
    if (this._currentName && this._screens[this._currentName]) {
      this._screens[this._currentName].hide();
    }

    // Netejar contenidor
    this._container.innerHTML = '';

    // Mostrar nova pantalla
    this._currentName = name;
    this._screens[name].show(this._container, params);
  }

  /**
   * Retorna el nom de la pantalla activa.
   * @returns {string|null}
   */
  getCurrentScreen() {
    return this._currentName;
  }
}

export default ScreenManager;
