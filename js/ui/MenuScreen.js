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
    let adventureButtons = '';
    if (this._adventures.length === 0) {
      adventureButtons = '<p class="text-muted">Cap aventura disponible</p>';
    } else {
      adventureButtons = this._adventures.map((adv, i) => `
        <button class="btn menu-screen__adventure-btn" data-index="${i}">
          ${adv.title}
          <span class="text-muted" style="display: block; margin-top: 0.4rem; font-size: 0.45rem;">
            ${adv.description || ''}
          </span>
        </button>
      `).join('');
    }

    screen.innerHTML = `
      <div class="menu-screen">
        <h1>MENÚ PRINCIPAL</h1>
        <h2>Tria una aventura</h2>
        <div class="choices menu-screen__adventures">
          ${adventureButtons}
        </div>
        <div class="choices" style="margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
          <button class="btn menu-screen__settings-btn">Opcions</button>
        </div>
      </div>
    `;
    container.appendChild(screen);

    // Listeners aventures
    screen.querySelectorAll('.menu-screen__adventure-btn').forEach(btn => {
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
