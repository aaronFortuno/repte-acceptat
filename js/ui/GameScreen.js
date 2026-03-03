/**
 * GameScreen — Pantalla de joc: text narratiu + opcions de decisió.
 */

class GameScreen {
  constructor({ storyEngine, typewriterEffect, settingsManager, audioManager, onEnd, onMenu, onSettings }) {
    this._engine = storyEngine;
    this._typewriter = typewriterEffect;
    this._settings = settingsManager;
    this._audio = audioManager;
    this._onEnd = onEnd;
    this._onMenu = onMenu;
    this._onSettings = onSettings;
    this._container = null;
    this._textEl = null;
    this._choicesEl = null;
    this._titleEl = null;
    this._skipHandler = null;
  }

  /**
   * Mostra la pantalla de joc i renderitza el node actual.
   * @param {HTMLElement} container
   */
  show(container) {
    this._container = container;

    const screen = document.createElement('div');
    screen.className = 'screen screen--active';
    screen.innerHTML = `
      <div class="game-screen">
        <div class="game-screen__header">
          <h2 class="game-screen__title"></h2>
          <div class="game-screen__toolbar">
            <button class="btn btn--icon game-screen__settings-btn" title="Opcions">&#9881;</button>
            <button class="btn btn--icon game-screen__menu-btn" title="Menú principal">&#9776;</button>
          </div>
        </div>
        <div class="narrative">
          <p class="narrative-text game-screen__text"></p>
          <span class="cursor game-screen__cursor hidden"></span>
        </div>
        <div class="choices game-screen__choices hidden"></div>
      </div>
    `;
    container.appendChild(screen);

    // Botons de la toolbar
    screen.querySelector('.game-screen__settings-btn')
      .addEventListener('click', (e) => {
        e.stopPropagation();
        if (this._onSettings) this._onSettings();
      });
    screen.querySelector('.game-screen__menu-btn')
      .addEventListener('click', (e) => {
        e.stopPropagation();
        if (this._onMenu) this._onMenu();
      });

    this._titleEl = screen.querySelector('.game-screen__title');
    this._textEl = screen.querySelector('.game-screen__text');
    this._choicesEl = screen.querySelector('.game-screen__choices');
    this._cursorEl = screen.querySelector('.game-screen__cursor');

    this._titleEl.textContent = this._engine.getTitle() || '';
    this._renderNode();
  }

  hide() {
    this._typewriter.stop();
    this._removeSkipHandler();
  }

  destroy() {
    this.hide();
  }

  /** @private — Renderitza el node actual */
  _renderNode() {
    const node = this._engine.getCurrentNode();
    if (!node) return;

    // Amagar opcions i cursor mentre es mostra el text
    this._choicesEl.classList.add('hidden');
    this._choicesEl.innerHTML = '';
    this._cursorEl.classList.remove('hidden');

    // Efecte typewriter o text directe
    if (this._settings.get('typewriterEnabled')) {
      const speed = this._settings.get('typewriterSpeed');
      this._typewriter.onComplete(() => this._onTextComplete(node));
      this._typewriter.start(node.text, this._textEl, speed);

      // Click/tecla per fer skip del typewriter
      this._addSkipHandler();
    } else {
      this._textEl.textContent = node.text;
      this._onTextComplete(node);
    }
  }

  /** @private — Quan el text ha acabat de mostrar-se */
  _onTextComplete(node) {
    this._removeSkipHandler();
    this._cursorEl.classList.add('hidden');

    if (node.isEnding) {
      // Transició a EndScreen
      if (this._onEnd) {
        this._onEnd(node);
      }
    } else {
      // Mostrar opcions
      this._showChoices(node.choices);
    }
  }

  /** @private — Mostra els botons d'opció */
  _showChoices(choices) {
    this._choicesEl.innerHTML = '';
    this._choicesEl.classList.remove('hidden');

    choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.className = 'btn game-screen__choice-btn';
      btn.textContent = choice.label;
      btn.addEventListener('click', () => this._selectChoice(index));
      this._choicesEl.appendChild(btn);
    });

    // Focus al primer botó per accessibilitat
    const firstBtn = this._choicesEl.querySelector('.btn');
    if (firstBtn) firstBtn.focus();
  }

  /** @private — Processa la selecció d'una opció */
  _selectChoice(index) {
    // Flash de pantalla
    const crt = document.querySelector('.crt');
    if (crt) {
      crt.classList.add('screen-flash');
      setTimeout(() => crt.classList.remove('screen-flash'), 200);
    }

    // SFX
    this._audio.playSFX('choice');

    // Navegar al node següent
    this._engine.selectChoice(index);
    this._renderNode();
  }

  /** @private */
  _addSkipHandler() {
    this._removeSkipHandler();
    this._skipHandler = () => {
      if (this._typewriter.isRunning()) {
        this._typewriter.skip();
      }
    };
    document.addEventListener('click', this._skipHandler);
    document.addEventListener('keydown', this._skipHandler);
  }

  /** @private */
  _removeSkipHandler() {
    if (this._skipHandler) {
      document.removeEventListener('click', this._skipHandler);
      document.removeEventListener('keydown', this._skipHandler);
      this._skipHandler = null;
    }
  }
}

export default GameScreen;
