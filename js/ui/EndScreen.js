/**
 * EndScreen — Pantalla de final: mostra resultat i opcions per continuar.
 * L'àudio (SFX + música de fons) es gestiona des d'app.js.
 */

class EndScreen {
  constructor({ onRestart, onMenu }) {
    this._onRestart = onRestart;
    this._onMenu = onMenu;
  }

  /**
   * Mostra la pantalla de final.
   * @param {HTMLElement} container
   * @param {object} params
   * @param {object} params.node — Node final amb text, endingType, endingTitle
   */
  show(container, params = {}) {
    const node = params.node || {};
    const isGood = node.endingType === 'good';

    const screen = document.createElement('div');
    screen.className = 'screen screen--active';

    screen.innerHTML = `
      <div class="end-screen">
        <div class="end-screen__banner ${isGood ? 'end-screen__banner--good' : 'end-screen__banner--bad'}">
          <p class="end-screen__icon">${isGood ? '★' : '☠'}</p>
          <h1 class="end-screen__result">${isGood ? 'VICTÒRIA!' : 'GAME OVER'}</h1>
          ${node.endingTitle ? `<h2 class="end-screen__title">"${node.endingTitle}"</h2>` : ''}
        </div>
        <div class="narrative" style="padding: 1.5rem 0;">
          <p class="narrative-text">${node.text || ''}</p>
        </div>
        <div class="choices">
          <button class="btn btn--center end-screen__restart-btn">
            ${isGood ? 'Tornar a jugar' : 'Torna a intentar-ho, perdedor'}
          </button>
          <button class="btn btn--center end-screen__menu-btn">Tornar al menú</button>
        </div>
      </div>
    `;
    container.appendChild(screen);

    screen.querySelector('.end-screen__restart-btn')
      .addEventListener('click', () => {
        if (this._onRestart) this._onRestart();
      });

    screen.querySelector('.end-screen__menu-btn')
      .addEventListener('click', () => {
        if (this._onMenu) this._onMenu();
      });
  }

  hide() {}
  destroy() {}
}

export default EndScreen;
