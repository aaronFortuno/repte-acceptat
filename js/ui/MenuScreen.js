/**
 * MenuScreen — Menú principal: triar aventura, opcions, crèdits.
 */

import i18n from '../engine/I18nManager.js';

class MenuScreen {
  constructor({ settingsManager, onSelectAdventure, onSettings, onEditor }) {
    this._settings = settingsManager;
    this._onSelectAdventure = onSelectAdventure;
    this._onSettings = onSettings;
    this._onEditor = onEditor;
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

    // Idioma actiu per al filtre
    const currentLang = i18n.lang;

    // Extreure dificultats úniques per al filtre
    const difficulties = [...new Set(
      this._adventures.map(a => a.difficulty).filter(Boolean)
    )];

    // Construir llista d'aventures
    let adventureCards = '';
    if (this._adventures.length === 0) {
      adventureCards = `<p class="text-muted">${i18n.t('menu_no_adventures')}</p>`;
    } else {
      adventureCards = this._adventures.map((adv, i) => {
        const author = adv.author || i18n.t('menu_author_anonymous');
        const diffKey = `difficulty_${adv.difficulty || 'easy'}`;
        const diffLabel = i18n.t(diffKey);
        const nodes = adv.nodes || '?';
        const endings = adv.endings || {};
        const endingsTotal = endings.total || '?';
        const endingsGood = endings.good || 0;
        const endingsBad = endings.bad || 0;
        const lang = adv.language || 'ca';

        return `
          <button class="menu-screen__card" data-index="${i}" data-difficulty="${adv.difficulty}" data-lang="${lang}">
            <div class="menu-screen__card-header">
              <span class="menu-screen__card-title">${adv.title}</span>
              <span class="menu-screen__card-difficulty menu-screen__card-difficulty--${adv.difficulty}">${diffLabel}</span>
            </div>
            <p class="menu-screen__card-desc">${adv.description || ''}</p>
            <div class="menu-screen__card-meta">
              <span class="menu-screen__card-author"><i class="fa-solid fa-user-pen"></i> ${author}</span>
              <span><i class="fa-solid fa-map-signs"></i> ${i18n.t('menu_scenes', { n: nodes })}</span>
              <span><i class="fa-solid fa-flag-checkered"></i> ${i18n.t('menu_endings', { total: endingsTotal, good: endingsGood, bad: endingsBad })}</span>
            </div>
          </button>
        `;
      }).join('');
    }

    // Barra de filtre per idioma
    const langFilterBar = `
      <div class="menu-screen__filter menu-screen__lang-filter">
        ${['ca', 'es', 'en', 'eu', 'gl'].map(l => {
          const active = l === currentLang ? ' menu-screen__filter-btn--active' : '';
          return `<button class="menu-screen__filter-btn${active}" data-lang-filter="${l}">${i18n.t('lang_' + l)}</button>`;
        }).join('')}
      </div>
    `;

    // Barra de filtre per dificultat
    const diffFilterBar = difficulties.length > 0 ? `
      <div class="menu-screen__filter">
        <button class="menu-screen__filter-btn menu-screen__filter-btn--active" data-filter="all">${i18n.t('menu_filter_all')}</button>
        ${difficulties.map(d => {
          const diffKey = `difficulty_${d}`;
          return `<button class="menu-screen__filter-btn" data-filter="${d}">${i18n.t(diffKey)}</button>`;
        }).join('')}
      </div>
    ` : '';

    screen.innerHTML = `
      <div class="menu-screen">
        <div class="menu-screen__header">
          <h1>${i18n.t('menu_title')}</h1>
          <button class="btn btn--icon menu-screen__settings-btn" title="${i18n.t('game_settings_btn')}"><i class="fa-solid fa-gear"></i></button>
        </div>
        <h2>${i18n.t('menu_choose')}</h2>
        ${langFilterBar}
        ${diffFilterBar}
        <div class="menu-screen__adventures">
          ${adventureCards}
        </div>
        <div class="menu-screen__cta">
          <div class="menu-screen__cta-content">
            <p class="menu-screen__cta-text">${i18n.t('menu_cta_text')}</p>
            <div class="menu-screen__cta-actions">
              <button class="btn menu-screen__cta-editor">
                <i class="fa-solid fa-pencil-ruler"></i> ${i18n.t('menu_cta_editor')}
              </button>
              <button class="btn menu-screen__cta-email">
                <i class="fa-solid fa-envelope"></i> ${i18n.t('menu_cta_email')}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    container.appendChild(screen);

    // Aplicar filtre d'idioma inicial
    this._applyLangFilter(currentLang, screen);

    // Listeners aventures
    screen.querySelectorAll('.menu-screen__card').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index, 10);
        if (this._onSelectAdventure) {
          this._onSelectAdventure(this._adventures[index]);
        }
      });
    });

    // Listener filtre d'idioma
    screen.querySelectorAll('[data-lang-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        screen.querySelectorAll('[data-lang-filter]').forEach(b => {
          b.classList.remove('menu-screen__filter-btn--active');
        });
        btn.classList.add('menu-screen__filter-btn--active');
        this._applyLangFilter(btn.dataset.langFilter, screen);
      });
    });

    // Listener filtre de dificultat
    screen.querySelectorAll('.menu-screen__filter-btn[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._handleFilter(btn, screen);
      });
    });

    // Listener editor (CTA)
    screen.querySelector('.menu-screen__cta-editor')
      .addEventListener('click', () => {
        if (this._onEditor) this._onEditor();
      });

    // Listener enviar per correu (CTA)
    screen.querySelector('.menu-screen__cta-email')
      .addEventListener('click', () => this._showSubmitOverlay(screen));

    // Listener opcions
    screen.querySelector('.menu-screen__settings-btn')
      .addEventListener('click', () => {
        if (this._onSettings) this._onSettings();
      });
  }

  hide() {}
  destroy() {}

  /** @private — Filtra aventures per idioma */
  _applyLangFilter(lang, screen) {
    screen.querySelectorAll('.menu-screen__card').forEach(card => {
      if (card.dataset.lang === lang) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  /** @private — Filtra aventures per dificultat */
  _handleFilter(btn, screen) {
    const filter = btn.dataset.filter;

    // Actualitzar estat actiu dels botons
    screen.querySelectorAll('.menu-screen__filter-btn[data-filter]').forEach(b => {
      b.classList.remove('menu-screen__filter-btn--active');
    });
    btn.classList.add('menu-screen__filter-btn--active');

    // Obtenir l'idioma actiu
    const activeLangBtn = screen.querySelector('[data-lang-filter].menu-screen__filter-btn--active');
    const activeLang = activeLangBtn ? activeLangBtn.dataset.langFilter : i18n.lang;

    // Mostrar/ocultar cards (combinar amb filtre d'idioma)
    screen.querySelectorAll('.menu-screen__card').forEach(card => {
      const matchLang = card.dataset.lang === activeLang;
      const matchDiff = filter === 'all' || card.dataset.difficulty === filter;
      if (matchLang && matchDiff) {
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
        <h2>${i18n.t('menu_submit_title')}</h2>
        <div class="menu-screen__overlay-content">
          <p>${i18n.t('menu_submit_intro')}</p>
          <p><strong>${i18n.t('menu_submit_how')}</strong></p>
          <ul>
            <li>${i18n.t('menu_submit_step1')} <span class="text-accent">afortun8@xtec.cat</span></li>
            <li>${i18n.t('menu_submit_step2')}</li>
            <li>${i18n.t('menu_submit_step3')}</li>
          </ul>
        </div>
        <div class="menu-screen__overlay-actions">
          <a class="btn btn--center" href="mailto:afortun8@xtec.cat?subject=Nova aventura textual&body=Hola! Vull enviar-vos una aventura.%0A%0ATítol:%0ADescripció:%0A%0ANodes i accions:">
            <i class="fa-solid fa-envelope"></i> ${i18n.t('menu_submit_email_btn')}
          </a>
          <button class="btn btn--center menu-screen__overlay-close">${i18n.t('menu_submit_close')}</button>
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
