/**
 * TitleScreen — Pantalla de títol amb animació retro.
 * Mostra el nom del joc i "Prem qualsevol tecla".
 */

class TitleScreen {
  constructor({ onStart }) {
    this._onStart = onStart;
    this._handleKey = null;
    this._handleClick = null;
  }

  /**
   * Mostra la pantalla de títol al contenidor.
   * @param {HTMLElement} container
   */
  show(container) {
    const screen = document.createElement('div');
    screen.className = 'screen screen--active';
    screen.innerHTML = `
      <div class="title-screen">
        <div class="title-screen__logo">
          <h1 class="title-screen__title">AVENTURES<br>TEXTUALS<br>RETRO</h1>
          <p class="title-screen__subtitle text-muted">Motor d'aventures textuals estil anys 80</p>
        </div>
        <p class="title-screen__prompt text-accent text-center">
          Prem qualsevol tecla<span class="cursor"></span>
        </p>
        <p class="title-screen__version text-muted text-center">v0.1</p>
      </div>
    `;
    container.appendChild(screen);

    // Listeners per avançar
    this._handleKey = () => this._advance();
    this._handleClick = () => this._advance();

    // Petit delay per evitar que un click anterior passi la pantalla
    setTimeout(() => {
      document.addEventListener('keydown', this._handleKey);
      screen.addEventListener('click', this._handleClick);
    }, 300);
  }

  hide() {
    this._removeListeners();
  }

  destroy() {
    this._removeListeners();
  }

  /** @private */
  _advance() {
    this._removeListeners();
    if (this._onStart) this._onStart();
  }

  /** @private */
  _removeListeners() {
    if (this._handleKey) {
      document.removeEventListener('keydown', this._handleKey);
      this._handleKey = null;
    }
    if (this._handleClick) {
      document.removeEventListener('click', this._handleClick);
      this._handleClick = null;
    }
  }
}

export default TitleScreen;
