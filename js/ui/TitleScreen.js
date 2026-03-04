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
        <button class="title-screen__version text-muted text-center" title="Historial de versions">v0.2</button>
      </div>
    `;
    container.appendChild(screen);

    // Listener del botó de versió (obre changelog)
    const versionBtn = screen.querySelector('.title-screen__version');
    versionBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._showChangelog(screen);
    });

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

  /** @private — Mostra l'overlay de changelog */
  _showChangelog(screen) {
    // Evitar duplicats
    if (screen.querySelector('.title-screen__changelog')) return;

    // Pausar listeners d'avançar mentre l'overlay és obert
    this._removeListeners();

    const overlay = document.createElement('div');
    overlay.className = 'title-screen__changelog';
    overlay.innerHTML = `
      <div class="title-screen__changelog-box panel">
        <h2>Historial de versions</h2>
        <div class="title-screen__changelog-entry">
          <p class="text-accent">v0.2</p>
          <ul>
            <li>Nova aventura: El Castell de les Mil Portes</li>
            <li>Comptador de morts amb missatge final</li>
            <li>Finals integrats a la pantalla de joc</li>
            <li>Selector de tipografia (retro / llegible)</li>
            <li>Dues mides de lletra addicionals</li>
            <li>Icones millorades a la toolbar</li>
          </ul>
        </div>
        <div class="title-screen__changelog-entry">
          <p class="text-accent">v0.1</p>
          <ul>
            <li>Motor d'aventures textuals amb navegació de nodes</li>
            <li>Aventura inclosa: Missió 404</li>
            <li>Efecte màquina d'escriure</li>
            <li>Temes clar i fosc</li>
            <li>Música i efectes de so</li>
            <li>Selector de mida de lletra</li>
          </ul>
        </div>
        <button class="btn btn--center title-screen__changelog-close">Tancar</button>
      </div>
    `;

    overlay.querySelector('.title-screen__changelog-close')
      .addEventListener('click', (e) => {
        e.stopPropagation();
        overlay.remove();
        // Restaurar listeners d'avançar
        this._handleKey = () => this._advance();
        this._handleClick = () => this._advance();
        setTimeout(() => {
          document.addEventListener('keydown', this._handleKey);
          screen.addEventListener('click', this._handleClick);
        }, 100);
      });

    // Tancar amb click fora de la caixa
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.querySelector('.title-screen__changelog-close').click();
      }
    });

    screen.querySelector('.title-screen').appendChild(overlay);
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
