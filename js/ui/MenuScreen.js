/**
 * MenuScreen — Menú principal: triar aventura, opcions, crèdits.
 */

class MenuScreen {
  constructor({ onSelectAdventure, onSettings }) {
    this._onSelectAdventure = onSelectAdventure;
    this._onSettings = onSettings;
    this._adventures = [];
  }

  /**
   * Mostra el menú principal.
   * @param {HTMLElement} container
   * @param {object} params
   * @param {Array} params.adventures — Llista d'aventures del manifest
   */
  show(container, params = {}) {
    this._adventures = params.adventures || [];

    const screen = document.createElement('div');
    screen.className = 'screen screen--active';

    // Construir llista d'aventures
    let adventureCards = '';
    if (this._adventures.length === 0) {
      adventureCards = '<p class="text-muted">Cap aventura disponible</p>';
    } else {
      adventureCards = this._adventures.map((adv, i) => {
        const author = adv.author || 'Anònim';
        const difficulty = adv.difficulty || '—';
        const nodes = adv.nodes || '?';
        const endings = adv.endings || {};
        const endingsTotal = endings.total || '?';
        const endingsGood = endings.good || 0;
        const endingsBad = endings.bad || 0;

        return `
          <button class="menu-screen__card" data-index="${i}">
            <div class="menu-screen__card-header">
              <span class="menu-screen__card-title">${adv.title}</span>
              <span class="menu-screen__card-difficulty menu-screen__card-difficulty--${difficulty}">${difficulty}</span>
            </div>
            <p class="menu-screen__card-desc">${adv.description || ''}</p>
            <div class="menu-screen__card-meta">
              <span class="menu-screen__card-author"><i class="fa-solid fa-user-pen"></i> ${author}</span>
              <span><i class="fa-solid fa-map-signs"></i> ${nodes} escenes</span>
              <span><i class="fa-solid fa-flag-checkered"></i> ${endingsTotal} finals (${endingsGood} <i class="fa-solid fa-star"></i> / ${endingsBad} <i class="fa-solid fa-skull"></i>)</span>
            </div>
          </button>
        `;
      }).join('');
    }

    screen.innerHTML = `
      <div class="menu-screen">
        <h1>MENÚ PRINCIPAL</h1>
        <h2>Tria una aventura</h2>
        <div class="menu-screen__adventures">
          ${adventureCards}
        </div>
        <div class="menu-screen__footer">
          <button class="btn btn--center menu-screen__settings-btn">Opcions</button>
        </div>
      </div>
    `;
    container.appendChild(screen);

    // Listeners aventures
    screen.querySelectorAll('.menu-screen__card').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index, 10);
        if (this._onSelectAdventure) {
          this._onSelectAdventure(this._adventures[index]);
        }
      });
    });

    // Listener opcions
    screen.querySelector('.menu-screen__settings-btn')
      .addEventListener('click', () => {
        if (this._onSettings) this._onSettings();
      });
  }

  hide() {}
  destroy() {}
}

export default MenuScreen;
