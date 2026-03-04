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

    // Extreure dificultats úniques per al filtre
    const difficulties = [...new Set(
      this._adventures.map(a => a.difficulty).filter(Boolean)
    )];

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
          <button class="menu-screen__card" data-index="${i}" data-difficulty="${difficulty}">
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

    // Barra de filtre per dificultat
    const filterBar = difficulties.length > 0 ? `
      <div class="menu-screen__filter">
        <button class="menu-screen__filter-btn menu-screen__filter-btn--active" data-filter="totes">Totes</button>
        ${difficulties.map(d => `<button class="menu-screen__filter-btn" data-filter="${d}">${d.charAt(0).toUpperCase() + d.slice(1)}</button>`).join('')}
      </div>
    ` : '';

    screen.innerHTML = `
      <div class="menu-screen">
        <h1>MENÚ PRINCIPAL</h1>
        <h2>Tria una aventura</h2>
        ${filterBar}
        <div class="menu-screen__adventures">
          ${adventureCards}
        </div>
        <div class="menu-screen__submit">
          <button class="menu-screen__submit-btn">
            <i class="fa-solid fa-plus"></i> Envia'ns la teva aventura
          </button>
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

    // Listener filtre de dificultat
    screen.querySelectorAll('.menu-screen__filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._handleFilter(btn, screen);
      });
    });

    // Listener botó enviar aventura
    screen.querySelector('.menu-screen__submit-btn')
      .addEventListener('click', () => this._showSubmitOverlay(screen));

    // Listener opcions
    screen.querySelector('.menu-screen__settings-btn')
      .addEventListener('click', () => {
        if (this._onSettings) this._onSettings();
      });
  }

  hide() {}
  destroy() {}

  /** @private — Filtra aventures per dificultat */
  _handleFilter(btn, screen) {
    const filter = btn.dataset.filter;

    // Actualitzar estat actiu dels botons
    screen.querySelectorAll('.menu-screen__filter-btn').forEach(b => {
      b.classList.remove('menu-screen__filter-btn--active');
    });
    btn.classList.add('menu-screen__filter-btn--active');

    // Mostrar/ocultar cards
    screen.querySelectorAll('.menu-screen__card').forEach(card => {
      if (filter === 'totes' || card.dataset.difficulty === filter) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  /** @private — Mostra l'overlay per enviar aventura */
  _showSubmitOverlay(screen) {
    const overlay = document.createElement('div');
    overlay.className = 'menu-screen__overlay';
    overlay.innerHTML = `
      <div class="menu-screen__overlay-box panel">
        <h2>Envia'ns la teva aventura!</h2>
        <div class="menu-screen__overlay-content">
          <p>Tens una idea per a una aventura? Ens encantaria rebre-la!</p>
          <p><strong>Com fer-ho:</strong></p>
          <ul>
            <li>Envia un correu a <span class="text-accent">afortun8@xtec.cat</span></li>
            <li>Adjunta un document amb els textos dels nodes i les accions</li>
            <li>No cal format JSON, nosaltres ens encarreguem de la part tècnica</li>
          </ul>
        </div>
        <div class="menu-screen__overlay-actions">
          <a class="btn btn--center" href="mailto:afortun8@xtec.cat?subject=Nova aventura textual&body=Hola! Vull enviar-vos una aventura.%0A%0ATítol:%0ADescripció:%0A%0ANodes i accions:">
            <i class="fa-solid fa-envelope"></i> Enviar correu
          </a>
          <button class="btn btn--center menu-screen__overlay-close">Tancar</button>
        </div>
      </div>
    `;
    screen.appendChild(overlay);

    // Tancar amb el botó o clicant fora
    overlay.querySelector('.menu-screen__overlay-close')
      .addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }
}

export default MenuScreen;
