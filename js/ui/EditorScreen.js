/**
 * EditorScreen — Pantalla principal de l'editor visual d'aventures.
 *
 * Integra la toolbar, el canvas SVG, panell de validació, panell de metadades,
 * menú contextual i la sincronització amb EditorState.
 */

import i18n from '../engine/I18nManager.js';
import EditorState from '../editor/EditorState.js';
import EditorCanvas from '../editor/EditorCanvas.js';
import EditorConnection from '../editor/EditorConnection.js';
import EditorSerializer from '../editor/EditorSerializer.js';
import EditorStorage from '../editor/EditorStorage.js';

class EditorScreen {
  /**
   * @param {object} opts
   * @param {object} opts.settingsManager — Gestor d'opcions
   * @param {object} opts.storyEngine — Motor d'aventures (StoryEngine)
   * @param {object} opts.audioManager — Gestor d'àudio
   * @param {function} opts.onMenu — Callback per tornar al menú
   * @param {function} opts.onTestAdventure — Callback per provar l'aventura al GameScreen
   */
  constructor({ settingsManager, storyEngine, audioManager, onMenu, onTestAdventure }) {
    this._settings = settingsManager;
    this._storyEngine = storyEngine;
    this._audio = audioManager;
    this._onMenu = onMenu;
    this._onTestAdventure = onTestAdventure;

    this._container = null;
    this._screenEl = null;

    // Components de l'editor
    this._editorState = new EditorState();
    this._editorCanvas = new EditorCanvas();
    this._editorStorage = null;
    this._dragCleanup = null;

    // Mapa de connexions visuals: connectionId → EditorConnection
    this._connections = new Map();

    // Referència als panells
    this._validationPanelEl = null;
    this._metadataPanelEl = null;
    this._contextMenuEl = null;
    this._projectsDropdownEl = null;

    // Estat del toggle de música
    this._musicEnabled = false;

    // Handlers lligats
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onContextMenu = this._handleContextMenu.bind(this);
    this._onClickOutside = this._handleClickOutside.bind(this);

    // Handlers d'events d'estat
    this._onStateChange = this._handleStateChange.bind(this);
    this._onNodeAdd = this._handleNodeAdd.bind(this);
    this._onNodeRemove = this._handleNodeRemove.bind(this);
    this._onNodeUpdate = this._handleNodeUpdate.bind(this);
    this._onConnectionAdd = this._handleConnectionAdd.bind(this);
    this._onConnectionRemove = this._handleConnectionRemove.bind(this);

    // Handlers d'events del canvas
    this._onCanvasCreateNode = this._handleCanvasCreateNode.bind(this);
    this._onConnectionLabelChanged = this._handleConnectionLabelChanged.bind(this);
    this._onConnectionSelectRequested = this._handleConnectionSelectRequested.bind(this);
    this._onConnectionDeleteRequested = this._handleConnectionDeleteRequested.bind(this);
  }

  // ---------------------------------------------------------------------------
  // Interfície de pantalla: show / hide / destroy
  // ---------------------------------------------------------------------------

  /**
   * Mostra l'editor dins del contenidor.
   * @param {HTMLElement} container
   * @param {object} [params={}]
   */
  show(container, params = {}) {
    this._container = container;

    const screen = document.createElement('div');
    screen.className = 'screen screen--active editor-screen';

    screen.innerHTML = this._buildHTML();
    container.appendChild(screen);
    this._screenEl = screen;

    // Obtenir referències als elements
    this._titleInputEl = screen.querySelector('.editor-toolbar__title');
    this._canvasContainerEl = screen.querySelector('.editor-canvas-container');
    this._validationPanelEl = screen.querySelector('.editor-validation-panel');
    this._metadataPanelEl = screen.querySelector('.editor-metadata');

    // Inicialitzar el canvas SVG
    this._editorCanvas.init(this._canvasContainerEl, this._editorState);

    // Inicialitzar el drag handler per a connexions
    this._dragCleanup = EditorConnection.initDragHandler(
      this._editorCanvas.svgElement,
      this._editorCanvas.connectionsGroup,
      this._editorState,
      (nodeId) => this._editorCanvas.nodes.get(nodeId)
    );

    // Inicialitzar l'EditorStorage (autosave reactiu en cada canvi d'estat)
    this._editorStorage = new EditorStorage(this._editorState);
    this._editorStorage.stopAutosave(); // No usem interval, usem debounce

    // Sincronitzar el títol amb l'input
    this._titleInputEl.value = this._editorState.metadata.title || '';

    // Registrar events
    this._attachToolbarEvents();
    this._attachStateEvents();
    this._attachCanvasEvents();
    this._attachGlobalEvents();

    // Silenciar música en entrar a l'editor
    this._audio.stopMusic();

    // Si l'estat és buit (projecte nou), crear un node inicial al centre
    if (Object.keys(this._editorState.nodes).length === 0) {
      this._createInitialNode();
    } else {
      // Restaurar nodes i connexions visuals des de l'estat
      this._rebuildCanvasFromState();
    }
  }

  /** Amaga l'editor */
  hide() {
    if (this._autosaveTimer) {
      clearTimeout(this._autosaveTimer);
      this._autosaveTimer = null;
    }
    if (this._editorStorage) {
      this._editorStorage.stopAutosave();
      // Guardar immediatament en sortir si hi ha canvis
      if (this._editorState.dirty) {
        try { this._editorStorage.save(); } catch (e) { /* silenci */ }
      }
    }
    this._detachGlobalEvents();
    this._closeContextMenu();
    this._closeProjectsDropdown();
  }

  /** Destrueix l'editor i allibera recursos */
  destroy() {
    this.hide();

    this._detachStateEvents();
    this._detachCanvasEvents();

    // Destruir connexions visuals
    for (const conn of this._connections.values()) {
      conn.destroy();
    }
    this._connections.clear();

    // Destruir el canvas
    if (this._editorCanvas) {
      this._editorCanvas.destroy();
    }

    // Destruir l'storage
    if (this._editorStorage) {
      this._editorStorage.destroy();
    }

    // Cleanup del drag handler
    if (this._dragCleanup) {
      this._dragCleanup();
      this._dragCleanup = null;
    }

    // Eliminar l'element del DOM
    if (this._screenEl && this._screenEl.parentNode) {
      this._screenEl.parentNode.removeChild(this._screenEl);
    }
    this._screenEl = null;
    this._container = null;
  }

  // ---------------------------------------------------------------------------
  // Construcció de l'HTML
  // ---------------------------------------------------------------------------

  /** @private — Genera l'HTML complet de l'editor */
  _buildHTML() {
    return `
      <div class="editor-layout">
        ${this._buildToolbarHTML()}
        <div class="editor-canvas-wrapper">
          <div class="editor-canvas-container"></div>
          <div class="editor-zoom-controls">
            <button class="btn editor-zoom-controls__btn" data-action="zoom-in" title="Zoom in">
              <i class="fa-solid fa-plus"></i>
            </button>
            <button class="btn editor-zoom-controls__btn" data-action="zoom-out" title="Zoom out">
              <i class="fa-solid fa-minus"></i>
            </button>
            <button class="btn editor-zoom-controls__btn" data-action="zoom-fit" title="Fit all">
              <i class="fa-solid fa-expand"></i>
            </button>
            <button class="btn editor-zoom-controls__btn" data-action="zoom-100" title="100%">
              <i class="fa-solid fa-compress"></i>
            </button>
          </div>
        </div>
        ${this._buildValidationPanelHTML()}
        ${this._buildMetadataPanelHTML()}
      </div>
    `;
  }

  /** @private — HTML de la toolbar (una sola fila, grups separats) */
  _buildToolbarHTML() {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    return `
      <div class="editor-toolbar">
        <button class="editor-toolbar__btn" data-action="back" title="${i18n.t('editor_back')}">
          <i class="fa-solid fa-arrow-left"></i>
        </button>
        <span class="editor-toolbar__sep"></span>
        <button class="editor-toolbar__btn" data-action="new" title="${i18n.t('editor_new')}">
          <i class="fa-solid fa-file"></i>
        </button>
        <button class="editor-toolbar__btn" data-action="open" title="${i18n.t('editor_open')}">
          <i class="fa-solid fa-folder-open"></i>
        </button>
        <button class="editor-toolbar__btn" data-action="import" title="${i18n.t('editor_import')}">
          <i class="fa-solid fa-upload"></i>
        </button>
        <span class="editor-toolbar__sep"></span>
        <button class="editor-toolbar__btn" data-action="metadata" title="${i18n.t('editor_metadata')}">
          <i class="fa-solid fa-tags"></i>
        </button>
        <button class="editor-toolbar__btn" data-action="export" title="${i18n.t('editor_export')}">
          <i class="fa-solid fa-download"></i>
        </button>
        <div class="editor-toolbar__spacer"></div>
        <input type="text" class="editor-toolbar__title"
          placeholder="${i18n.t('editor_title_placeholder')}"
          value="" />
        <div class="editor-toolbar__spacer"></div>
        <button class="editor-toolbar__btn" data-action="toggle-theme" title="Theme">
          <i class="fa-solid ${isDark ? 'fa-sun' : 'fa-moon'}"></i>
        </button>
        <button class="editor-toolbar__btn" data-action="toggle-music" title="Music">
          <i class="fa-solid fa-volume-xmark"></i>
        </button>
        <span class="editor-toolbar__sep"></span>
        <button class="editor-toolbar__btn" data-action="validate">
          <i class="fa-solid fa-check-circle"></i> ${i18n.t('editor_validate')}
        </button>
        <button class="editor-toolbar__btn editor-toolbar__btn--primary" data-action="test">
          <i class="fa-solid fa-play"></i> ${i18n.t('editor_test')}
        </button>
      </div>
    `;
  }

  /** @private — HTML del panell de validació */
  _buildValidationPanelHTML() {
    return `
      <div class="editor-validation-panel hidden">
        <div class="editor-validation-panel__header">
          <h3>${i18n.t('editor_validation_title')}</h3>
          <button class="btn btn--icon editor-validation-panel__close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="editor-validation-panel__list"></div>
      </div>
    `;
  }

  /** @private — HTML del panell de metadades */
  _buildMetadataPanelHTML() {
    return `
      <div class="editor-metadata hidden">
        <div class="editor-metadata__header">
          <h3>${i18n.t('editor_metadata_title')}</h3>
          <button class="btn btn--icon editor-metadata__close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="editor-metadata__form">
          <label>
            ${i18n.t('editor_metadata_id')}
            <input type="text" data-meta="id" />
          </label>
          <label>
            ${i18n.t('editor_metadata_title')}
            <input type="text" data-meta="title" />
          </label>
          <label>
            ${i18n.t('editor_metadata_author')}
            <input type="text" data-meta="author" />
          </label>
          <label>
            ${i18n.t('editor_metadata_description')}
            <textarea data-meta="description" rows="3"></textarea>
          </label>
          <label>
            ${i18n.t('editor_metadata_difficulty')}
            <select data-meta="difficulty">
              <option value="easy">${i18n.t('difficulty_easy')}</option>
              <option value="hard">${i18n.t('difficulty_hard')}</option>
            </select>
          </label>
          <label>
            ${i18n.t('editor_metadata_language')}
            <select data-meta="language">
              <option value="ca">${i18n.t('lang_ca')}</option>
              <option value="es">${i18n.t('lang_es')}</option>
              <option value="en">${i18n.t('lang_en')}</option>
              <option value="eu">${i18n.t('lang_eu')}</option>
              <option value="gl">${i18n.t('lang_gl')}</option>
            </select>
          </label>
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // Events de la toolbar
  // ---------------------------------------------------------------------------

  /** @private — Registra els events de la toolbar */
  _attachToolbarEvents() {
    if (!this._screenEl) return;

    // Botons de la toolbar i controls de zoom
    this._screenEl.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = btn.dataset.action;
        this._handleToolbarAction(action);
      });
    });

    // Canvi de títol
    this._titleInputEl.addEventListener('input', () => {
      this._editorState.updateMetadata({ title: this._titleInputEl.value });
    });

    // Tancar panell de validació
    const valClose = this._screenEl.querySelector('.editor-validation-panel__close');
    if (valClose) {
      valClose.addEventListener('click', () => {
        this._validationPanelEl.classList.add('hidden');
      });
    }

    // Tancar panell de metadades
    const metaClose = this._screenEl.querySelector('.editor-metadata__close');
    if (metaClose) {
      metaClose.addEventListener('click', () => {
        this._metadataPanelEl.classList.add('hidden');
      });
    }

    // Canvis al formulari de metadades
    this._screenEl.querySelectorAll('[data-meta]').forEach(input => {
      const handler = () => {
        const field = input.dataset.meta;
        const value = input.tagName === 'SELECT' ? input.value : input.value;
        this._editorState.updateMetadata({ [field]: value });

        // Sincronitzar el títol amb l'input de la toolbar
        if (field === 'title') {
          this._titleInputEl.value = value;
        }
      };
      input.addEventListener('input', handler);
      input.addEventListener('change', handler);
    });
  }

  /** @private — Processa una acció de la toolbar */
  _handleToolbarAction(action) {
    switch (action) {
      case 'back':
        this._handleBack();
        break;
      case 'new':
        this._handleNew();
        break;
      case 'open':
        this._handleOpen();
        break;
      case 'import':
        this._handleImport();
        break;
      case 'metadata':
        this._toggleMetadataPanel();
        break;
      case 'export':
        this._handleExport();
        break;
      case 'validate':
        this._handleValidate();
        break;
      case 'test':
        this._handleTest();
        break;
      case 'toggle-music':
        this._handleToggleMusic();
        break;
      case 'toggle-theme':
        this._handleToggleTheme();
        break;
      case 'zoom-in':
        this._editorCanvas.zoomIn();
        break;
      case 'zoom-out':
        this._editorCanvas.zoomOut();
        break;
      case 'zoom-fit':
        this._editorCanvas.zoomToFit(this._editorState.getAllNodes());
        break;
      case 'zoom-100':
        this._editorCanvas.zoomReset();
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // Accions de la toolbar
  // ---------------------------------------------------------------------------

  /** @private — Tornar al menú (amb avís si hi ha canvis) */
  _handleBack() {
    if (this._editorState.dirty) {
      if (!confirm(i18n.t('editor_confirm_unsaved'))) {
        return;
      }
    }
    if (this._onMenu) this._onMenu();
  }

  /** @private — Nou projecte (amb avís si hi ha canvis) */
  _handleNew() {
    if (this._editorState.dirty) {
      if (!confirm(i18n.t('editor_confirm_new'))) {
        return;
      }
    }

    // Netejar visuals
    this._clearCanvasVisuals();

    // Reiniciar estat
    this._editorState.reset();

    // Netejar títol
    this._titleInputEl.value = '';

    // Crear un node inicial al centre
    this._createInitialNode();
  }

  /** @private — Obrir projecte (dropdown amb llista) */
  _handleOpen() {
    this._closeProjectsDropdown();

    const projects = this._editorStorage.getProjectList();
    const hasAutosave = this._editorStorage.hasAutosave();

    const dropdown = document.createElement('div');
    dropdown.className = 'editor-projects-dropdown';

    let html = '<div class="editor-projects-dropdown__list">';

    // Opció d'autoguardat
    if (hasAutosave) {
      html += `
        <button class="editor-projects-dropdown__item editor-projects-dropdown__item--autosave"
                data-action="autosave">
          <span class="editor-projects-dropdown__item-title">
            <i class="fa-solid fa-clock-rotate-left"></i> ${i18n.t('editor_load_autosave')}
          </span>
          <span class="editor-projects-dropdown__item-meta">
            ${i18n.t('editor_autosave_available')}
          </span>
        </button>
      `;
    }

    // Llista de projectes
    if (projects.length === 0 && !hasAutosave) {
      html += `<p class="editor-projects-dropdown__empty">${i18n.t('editor_no_projects')}</p>`;
    } else {
      for (const proj of projects) {
        const date = new Date(proj.lastModified).toLocaleString();
        html += `
          <button class="editor-projects-dropdown__item" data-project-id="${proj.projectId}">
            <span class="editor-projects-dropdown__item-title">
              ${proj.title || proj.projectId}
            </span>
            <span class="editor-projects-dropdown__item-meta">
              ${proj.author ? proj.author + ' — ' : ''}${date}
            </span>
          </button>
        `;
      }
    }

    html += '</div>';
    dropdown.innerHTML = html;

    // Posicionar el dropdown sota el botó "Obrir"
    const openBtn = this._screenEl.querySelector('[data-action="open"]');
    if (openBtn) {
      const rect = openBtn.getBoundingClientRect();
      dropdown.style.position = 'fixed';
      dropdown.style.top = `${rect.bottom + 4}px`;
      dropdown.style.left = `${rect.left}px`;
    }

    document.body.appendChild(dropdown);
    this._projectsDropdownEl = dropdown;

    // Events dels ítems
    dropdown.querySelectorAll('.editor-projects-dropdown__item').forEach(item => {
      item.addEventListener('click', () => {
        const projectId = item.dataset.projectId;
        const action = item.dataset.action;

        if (this._editorState.dirty) {
          if (!confirm(i18n.t('editor_confirm_unsaved'))) {
            this._closeProjectsDropdown();
            return;
          }
        }

        this._clearCanvasVisuals();

        if (action === 'autosave') {
          this._editorStorage.loadAutosave();
        } else if (projectId) {
          this._editorStorage.load(projectId);
        }

        // Reconstruir visuals
        this._rebuildCanvasFromState();
        this._titleInputEl.value = this._editorState.metadata.title || '';
        this._closeProjectsDropdown();
      });
    });
  }

  /** @private — Importar fitxer JSON */
  async _handleImport() {
    if (this._editorState.dirty) {
      if (!confirm(i18n.t('editor_confirm_unsaved'))) {
        return;
      }
    }

    try {
      const snapshot = await EditorSerializer.importFromFile();
      this._clearCanvasVisuals();
      this._editorState.restoreFromSnapshot(snapshot);
      this._rebuildCanvasFromState();
      this._titleInputEl.value = this._editorState.metadata.title || '';
    } catch (err) {
      // L'usuari pot haver cancel·lat el diàleg — no cal fer res
      if (!err.message.includes('cancel')) {
        console.warn('[EditorScreen] Error en importar:', err.message);
      }
    }
  }

  /** @private — Guardar projecte */
  _handleSave() {
    try {
      this._editorStorage.save();
      this._showToast(i18n.t('editor_saved'));
    } catch (err) {
      console.warn('[EditorScreen] Error en guardar:', err);
    }
  }

  /** @private — Exportar com a fitxer JSON */
  _handleExport() {
    EditorSerializer.downloadAsFile(this._editorState);
    this._showToast(i18n.t('editor_exported'));
  }

  /** @private — Mostrar panell de validació */
  _handleValidate() {
    const issues = EditorSerializer.validate(this._editorState);
    this._showValidationPanel(issues);
  }

  /** @private — Provar l'aventura al GameScreen */
  _handleTest() {
    // Primer, validar
    const issues = EditorSerializer.validate(this._editorState);
    const errors = issues.filter(i => i.type === 'error');

    if (errors.length > 0) {
      // Mostrar panell de validació amb els errors i bloquejar
      this._showValidationPanel(issues);
      return;
    }

    // Serialitzar i carregar al motor
    const adventureData = EditorSerializer.serialize(this._editorState);
    this._storyEngine.loadAdventure(adventureData);

    // Cridar el callback per mostrar el GameScreen
    if (this._onTestAdventure) {
      this._onTestAdventure();
    }
  }

  /** @private — Alterna la música de fons */
  _handleToggleMusic() {
    this._musicEnabled = !this._musicEnabled;
    if (this._musicEnabled) {
      this._audio.playMusic('menu');
    } else {
      this._audio.stopMusic();
    }
    // Actualitzar icona
    const btn = this._screenEl.querySelector('[data-action="toggle-music"] i');
    if (btn) {
      btn.className = this._musicEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
    }
  }

  /** @private — Alterna entre tema fosc i clar */
  _handleToggleTheme() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') !== 'light';
    const newTheme = isDark ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    this._settings.set('theme', newTheme);
    // Actualitzar icona
    const btn = this._screenEl.querySelector('[data-action="toggle-theme"] i');
    if (btn) {
      btn.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  // ---------------------------------------------------------------------------
  // Panell de validació
  // ---------------------------------------------------------------------------

  /** @private — Mostra el panell de validació amb els problemes */
  _showValidationPanel(issues) {
    if (!this._validationPanelEl) return;

    const listEl = this._validationPanelEl.querySelector('.editor-validation-panel__list');
    listEl.innerHTML = '';

    if (issues.length === 0) {
      listEl.innerHTML = '<p class="editor-validation-panel__ok">Cap problema detectat!</p>';
    } else {
      for (const issue of issues) {
        const item = document.createElement('button');
        item.className = `editor-validation-panel__item editor-validation-panel__item--${issue.type}`;
        item.innerHTML = `
          <i class="fa-solid ${issue.type === 'error' ? 'fa-circle-xmark' : 'fa-triangle-exclamation'}"></i>
          <span>${issue.message}</span>
        `;

        // Si té nodeId, seleccionar el node en fer clic
        if (issue.nodeId) {
          item.addEventListener('click', () => {
            this._editorState.select(issue.nodeId);
            const nodeVisual = this._editorCanvas.nodes.get(issue.nodeId);
            if (nodeVisual) {
              nodeVisual.select();
            }
          });
        }

        listEl.appendChild(item);
      }
    }

    this._validationPanelEl.classList.remove('hidden');
  }

  // ---------------------------------------------------------------------------
  // Panell de metadades
  // ---------------------------------------------------------------------------

  /** @private — Mostra/amaga el panell de metadades, sincronitzant els valors */
  _toggleMetadataPanel() {
    if (!this._metadataPanelEl) return;

    const isHidden = this._metadataPanelEl.classList.contains('hidden');

    if (isHidden) {
      // Sincronitzar valors del formulari amb l'estat
      const meta = this._editorState.metadata;
      this._metadataPanelEl.querySelector('[data-meta="id"]').value = meta.id || '';
      this._metadataPanelEl.querySelector('[data-meta="title"]').value = meta.title || '';
      this._metadataPanelEl.querySelector('[data-meta="author"]').value = meta.author || '';
      this._metadataPanelEl.querySelector('[data-meta="description"]').value = meta.description || '';
      this._metadataPanelEl.querySelector('[data-meta="difficulty"]').value = meta.difficulty || 'easy';
      this._metadataPanelEl.querySelector('[data-meta="language"]').value = meta.language || 'ca';
    }

    this._metadataPanelEl.classList.toggle('hidden');
  }

  // ---------------------------------------------------------------------------
  // Menú contextual
  // ---------------------------------------------------------------------------

  /** @private — Gestiona el menú contextual (clic dret) */
  _handleContextMenu(e) {
    // Només si el clic és dins del canvas
    if (!this._canvasContainerEl || !this._canvasContainerEl.contains(e.target)) {
      return;
    }

    e.preventDefault();
    this._closeContextMenu();

    const menu = document.createElement('div');
    menu.className = 'editor-context-menu';

    // Determinar si s'ha clicat sobre un node
    const nodeGroup = e.target.closest('.editor-node-group');
    const nodeId = nodeGroup ? nodeGroup.getAttribute('data-node-id') : null;

    // Comprovar si s'ha clicat sobre una connexió
    const connPath = e.target.closest('.editor-connection__path') ||
                     e.target.closest('.editor-connection__hit-area');

    let html = '';
    let connectionId = null;

    if (nodeId) {
      // Menú contextual per a un node
      const node = this._editorState.getNode(nodeId);
      html = `
        <button class="editor-context-menu__item" data-ctx="set-start">
          <i class="fa-solid fa-flag"></i> ${i18n.t('editor_ctx_set_start')}
        </button>
        <button class="editor-context-menu__item" data-ctx="toggle-ending">
          <i class="fa-solid fa-flag-checkered"></i> ${i18n.t('editor_ctx_toggle_ending')}
        </button>
        <button class="editor-context-menu__item editor-context-menu__item--danger" data-ctx="delete">
          <i class="fa-solid fa-trash"></i> ${i18n.t('editor_ctx_delete')}
        </button>
      `;
    } else if (connPath) {
      // Menú contextual per a una connexió
      const connGroup = connPath.closest('g');
      connectionId = connGroup ? connGroup.getAttribute('data-connection-id') : null;
      if (connectionId) {
        html = `
          <button class="editor-context-menu__item editor-context-menu__item--danger" data-ctx="delete-connection" data-conn-id="${connectionId}">
            <i class="fa-solid fa-trash"></i> ${i18n.t('editor_ctx_delete')}
          </button>
        `;
      }
    } else {
      // Menú contextual per al fons del canvas
      html = `
        <button class="editor-context-menu__item" data-ctx="create-node">
          <i class="fa-solid fa-plus"></i> ${i18n.t('editor_ctx_create_node')}
        </button>
      `;
    }

    if (!html) return;

    menu.innerHTML = html;
    menu.style.position = 'fixed';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    document.body.appendChild(menu);
    this._contextMenuEl = menu;

    // Events dels ítems del menú contextual
    menu.querySelectorAll('.editor-context-menu__item').forEach(item => {
      item.addEventListener('click', () => {
        const ctx = item.dataset.ctx;
        if (ctx === 'delete-connection') {
          const connId = item.dataset.connId;
          try {
            this._editorState.removeConnection(connId);
          } catch (err) {
            console.warn('[EditorScreen] Error eliminant connexió:', err.message);
          }
        } else {
          this._handleContextAction(ctx, nodeId, e);
        }
        this._closeContextMenu();
      });
    });
  }

  /** @private — Processa una acció del menú contextual */
  _handleContextAction(action, nodeId, originalEvent) {
    switch (action) {
      case 'create-node': {
        const coords = this._editorCanvas.screenToSVGCoords(
          originalEvent.clientX,
          originalEvent.clientY
        );
        this._editorState.addNode(coords.x, coords.y);
        break;
      }
      case 'set-start':
        if (nodeId) {
          this._editorState.setStartNode(nodeId);
        }
        break;
      case 'toggle-ending':
        if (nodeId) {
          const node = this._editorState.getNode(nodeId);
          if (node) {
            const newIsEnding = !node.isEnding;
            this._editorState.updateNode(nodeId, {
              isEnding: newIsEnding,
              endingType: newIsEnding ? 'bad' : null,
              endingTitle: newIsEnding ? '' : null
            });
          }
        }
        break;
      case 'delete':
        if (nodeId) {
          this._editorState.removeNode(nodeId);
        }
        break;
    }
  }

  /** @private — Tanca el menú contextual */
  _closeContextMenu() {
    if (this._contextMenuEl && this._contextMenuEl.parentNode) {
      this._contextMenuEl.parentNode.removeChild(this._contextMenuEl);
    }
    this._contextMenuEl = null;
  }

  /** @private — Tanca el dropdown de projectes */
  _closeProjectsDropdown() {
    if (this._projectsDropdownEl && this._projectsDropdownEl.parentNode) {
      this._projectsDropdownEl.parentNode.removeChild(this._projectsDropdownEl);
    }
    this._projectsDropdownEl = null;
  }

  /** @private — Tanca menús quan es clica fora */
  _handleClickOutside(e) {
    // Tancar menú contextual
    if (this._contextMenuEl && !this._contextMenuEl.contains(e.target)) {
      this._closeContextMenu();
    }
    // Tancar dropdown de projectes
    if (this._projectsDropdownEl && !this._projectsDropdownEl.contains(e.target)) {
      const openBtn = this._screenEl ? this._screenEl.querySelector('[data-action="open"]') : null;
      if (!openBtn || !openBtn.contains(e.target)) {
        this._closeProjectsDropdown();
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Events globals (teclat, etc.)
  // ---------------------------------------------------------------------------

  /** @private — Registra events globals */
  _attachGlobalEvents() {
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('contextmenu', this._onContextMenu);
    document.addEventListener('click', this._onClickOutside);
  }

  /** @private — Elimina events globals */
  _detachGlobalEvents() {
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('contextmenu', this._onContextMenu);
    document.removeEventListener('click', this._onClickOutside);
  }

  /** @private — Handler de teclat per undo/redo */
  _handleKeyDown(e) {
    // Ignorar si el focus és a un input/textarea
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
      return;
    }

    // Ctrl+Z: undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this._editorState.undo();
    }

    // Ctrl+Y o Ctrl+Shift+Z: redo
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      this._editorState.redo();
    }
  }

  // ---------------------------------------------------------------------------
  // Sincronització amb EditorState (events d'estat)
  // ---------------------------------------------------------------------------

  /** @private — Registra els listeners d'events d'EditorState */
  _attachStateEvents() {
    document.addEventListener('state:change', this._onStateChange);
    document.addEventListener('state:node:add', this._onNodeAdd);
    document.addEventListener('state:node:remove', this._onNodeRemove);
    document.addEventListener('state:node:update', this._onNodeUpdate);
    document.addEventListener('state:connection:add', this._onConnectionAdd);
    document.addEventListener('state:connection:remove', this._onConnectionRemove);
  }

  /** @private — Elimina els listeners d'events d'EditorState */
  _detachStateEvents() {
    document.removeEventListener('state:change', this._onStateChange);
    document.removeEventListener('state:node:add', this._onNodeAdd);
    document.removeEventListener('state:node:remove', this._onNodeRemove);
    document.removeEventListener('state:node:update', this._onNodeUpdate);
    document.removeEventListener('state:connection:add', this._onConnectionAdd);
    document.removeEventListener('state:connection:remove', this._onConnectionRemove);
  }

  /** @private — Handler per a state:change (undo/redo/restore/reset + autosave) */
  _handleStateChange(e) {
    const { action } = e.detail;

    if (action === 'undo' || action === 'redo' || action === 'restore' || action === 'reset') {
      // Reconstruir tot el canvas
      this._clearCanvasVisuals();
      this._rebuildCanvasFromState();

      // Sincronitzar el títol
      this._titleInputEl.value = this._editorState.metadata.title || '';
    }

    // Autosave reactiu amb debounce (guarda 1s després de l'últim canvi)
    if (this._autosaveTimer) {
      clearTimeout(this._autosaveTimer);
    }
    this._autosaveTimer = setTimeout(() => {
      if (this._editorStorage && this._editorState.dirty) {
        try {
          this._editorStorage.save();
        } catch (err) {
          console.warn('[EditorScreen] Autosave error:', err.message);
        }
      }
    }, 1000);
  }

  /** @private — Handler per a state:node:add */
  _handleNodeAdd(e) {
    const { node } = e.detail;
    this._editorCanvas.addNode(node);
  }

  /** @private — Handler per a state:node:remove */
  _handleNodeRemove(e) {
    const { nodeId, removedConnections } = e.detail;

    // Eliminar connexions visuals associades
    if (removedConnections) {
      for (const conn of removedConnections) {
        this._removeConnectionVisual(conn.id);
      }
    }

    // Eliminar node visual
    this._editorCanvas.removeNode(nodeId);
  }

  /** @private — Handler per a state:node:update */
  _handleNodeUpdate(e) {
    const { node } = e.detail;
    this._editorCanvas.updateNode(node);

    // Actualitzar connexions connectades a aquest node
    for (const conn of this._connections.values()) {
      if (conn.fromNodeId === node.id || conn.toNodeId === node.id) {
        conn.updatePath();
      }
    }
  }

  /** @private — Handler per a state:connection:add */
  _handleConnectionAdd(e) {
    const { connection } = e.detail;
    this._addConnectionVisual(connection);
  }

  /** @private — Handler per a state:connection:remove */
  _handleConnectionRemove(e) {
    const { connectionId } = e.detail;
    this._removeConnectionVisual(connectionId);
  }

  // ---------------------------------------------------------------------------
  // Events del canvas (CustomEvents emesos pels components del canvas)
  // ---------------------------------------------------------------------------

  /** @private — Registra els listeners d'events del canvas */
  _attachCanvasEvents() {
    document.addEventListener('editor-canvas-create-node', this._onCanvasCreateNode);
    document.addEventListener('editor-connection-label-changed', this._onConnectionLabelChanged);
    document.addEventListener('editor-connection-select-requested', this._onConnectionSelectRequested);
    document.addEventListener('editor-connection-delete-requested', this._onConnectionDeleteRequested);
  }

  /** @private — Elimina els listeners d'events del canvas */
  _detachCanvasEvents() {
    document.removeEventListener('editor-canvas-create-node', this._onCanvasCreateNode);
    document.removeEventListener('editor-connection-label-changed', this._onConnectionLabelChanged);
    document.removeEventListener('editor-connection-select-requested', this._onConnectionSelectRequested);
    document.removeEventListener('editor-connection-delete-requested', this._onConnectionDeleteRequested);
  }

  /** @private — Doble clic al canvas: crear node */
  _handleCanvasCreateNode(e) {
    const { x, y } = e.detail;
    this._editorState.addNode(x, y);
  }

  /** @private — Etiqueta d'una connexió ha canviat */
  _handleConnectionLabelChanged(e) {
    const { connectionId, label } = e.detail;
    try {
      this._editorState.updateConnection(connectionId, { label });
    } catch (err) {
      console.warn('[EditorScreen] Error actualitzant etiqueta:', err.message);
    }
  }

  /** @private — Sol·licitud de selecció d'una connexió */
  _handleConnectionSelectRequested(e) {
    const { connectionId } = e.detail;

    // Deseleccionar totes les connexions
    for (const conn of this._connections.values()) {
      conn.deselect();
    }

    // Seleccionar la connexió sol·licitada
    const conn = this._connections.get(connectionId);
    if (conn) {
      conn.select();
      this._editorState.select(connectionId);
    }
  }

  /** @private — Sol·licitud d'eliminació d'una connexió */
  _handleConnectionDeleteRequested(e) {
    const { connectionId } = e.detail;
    try {
      this._editorState.removeConnection(connectionId);
    } catch (err) {
      console.warn('[EditorScreen] Error eliminant connexió:', err.message);
    }
  }

  // ---------------------------------------------------------------------------
  // Gestió de connexions visuals
  // ---------------------------------------------------------------------------

  /**
   * @private — Afegeix una connexió visual al canvas.
   * @param {object} connectionData — { id, fromNodeId, toNodeId, label }
   */
  _addConnectionVisual(connectionData) {
    if (this._connections.has(connectionData.id)) return;

    const conn = new EditorConnection(
      connectionData,
      this._editorCanvas.connectionsGroup,
      (nodeId) => this._editorCanvas.nodes.get(nodeId)
    );
    this._connections.set(connectionData.id, conn);
  }

  /**
   * @private — Elimina una connexió visual del canvas.
   * @param {string} connectionId
   */
  _removeConnectionVisual(connectionId) {
    const conn = this._connections.get(connectionId);
    if (conn) {
      conn.destroy();
      this._connections.delete(connectionId);
    }
  }

  // ---------------------------------------------------------------------------
  // Reconstrucció del canvas
  // ---------------------------------------------------------------------------

  /** @private — Elimina tots els elements visuals del canvas */
  _clearCanvasVisuals() {
    // Eliminar connexions visuals
    for (const conn of this._connections.values()) {
      conn.destroy();
    }
    this._connections.clear();

    // Eliminar nodes visuals
    const nodeIds = [...this._editorCanvas.nodes.keys()];
    for (const nodeId of nodeIds) {
      this._editorCanvas.removeNode(nodeId);
    }
  }

  /** @private — Reconstrueix tots els visuals des de l'estat actual */
  _rebuildCanvasFromState() {
    // Afegir tots els nodes
    const allNodes = this._editorState.getAllNodes();
    for (const node of allNodes) {
      this._editorCanvas.addNode(node);
    }

    // Afegir totes les connexions
    const allConnections = this._editorState.getAllConnections();
    for (const conn of allConnections) {
      this._addConnectionVisual(conn);
    }
  }

  /** @private — Crea un node inicial al centre del canvas */
  _createInitialNode() {
    // Centre aproximat del viewBox per defecte (1200x800)
    this._editorState.addNode(600, 400, { text: '' });
  }

  // ---------------------------------------------------------------------------
  // Utilitats
  // ---------------------------------------------------------------------------

  /**
   * @private — Mostra un missatge breu (toast) de confirmació.
   * @param {string} message
   */
  _showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'editor-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animar entrada
    requestAnimationFrame(() => {
      toast.classList.add('editor-toast--visible');
    });

    // Eliminar després de 2 segons
    setTimeout(() => {
      toast.classList.remove('editor-toast--visible');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 2000);
  }
}

export default EditorScreen;
