/**
 * GameScreen — Pantalla de joc: text narratiu + opcions de decisió.
 */

class GameScreen {
  constructor({ storyEngine, typewriterEffect, settingsManager, audioManager, onMenu, onSettings }) {
    this._engine = storyEngine;
    this._typewriter = typewriterEffect;
    this._settings = settingsManager;
    this._audio = audioManager;
    this._onMenu = onMenu;
    this._onSettings = onSettings;
    this._container = null;
    this._textEl = null;
    this._choicesEl = null;
    this._titleEl = null;
    this._gameEl = null;
    this._skipHandler = null;
    this._deathCount = 0;
  }

  /**
   * Reinicia el comptador de morts (cridat en començar nova aventura).
   */
  resetStats() {
    this._deathCount = 0;
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
            <button class="btn btn--icon game-screen__mute-btn" title="Silenciar/activar música"></button>
            <button class="btn btn--icon game-screen__settings-btn" title="Opcions"><i class="fa-solid fa-gear"></i></button>
            <button class="btn btn--icon game-screen__menu-btn" title="Menú principal"><i class="fa-solid fa-bars"></i></button>
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
    const muteBtn = screen.querySelector('.game-screen__mute-btn');
    this._updateMuteBtn(muteBtn);
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const enabled = this._audio.toggleMusic();
      this._settings.set('musicEnabled', enabled);
      this._updateMuteBtn(muteBtn);
    });
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

    this._gameEl = screen.querySelector('.game-screen');
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
      this._handleEnding(node);
    } else {
      this._showChoices(node.choices);
    }
  }

  /** @private — Gestiona un final inline (sense canviar de pantalla) */
  _handleEnding(node) {
    const isGood = node.endingType === 'good';

    if (!isGood) {
      this._deathCount++;
    }

    // SFX i música de final
    const type = isGood ? 'victory' : 'death';
    this._audio.playSFXThenMusic(type, type);

    // Tint de fons suau
    this._gameEl.classList.add(isGood ? 'game-screen--victory' : 'game-screen--death');

    // Bloc de resultat a sota del text narratiu
    const resultEl = document.createElement('div');
    resultEl.className = 'game-screen__ending-result';

    let html = `
      <p class="game-screen__ending-label ${isGood ? 'text-success' : 'text-danger'}">
        ${isGood ? '★ VICTÒRIA! ★' : '☠ GAME OVER ☠'}
      </p>
    `;
    if (node.endingTitle) {
      html += `<p class="game-screen__ending-title">"${node.endingTitle}"</p>`;
    }
    if (isGood) {
      html += this._getDeathSummary();
    }
    resultEl.innerHTML = html;

    this._textEl.insertAdjacentElement('afterend', resultEl);

    // Fer scroll al final del text
    const narrativeEl = this._textEl.closest('.narrative');
    if (narrativeEl) {
      setTimeout(() => { narrativeEl.scrollTop = narrativeEl.scrollHeight; }, 100);
    }

    // Botons de reinici / menú
    this._choicesEl.innerHTML = '';
    this._choicesEl.classList.remove('hidden');

    const restartBtn = document.createElement('button');
    restartBtn.className = 'btn btn--center';
    restartBtn.textContent = isGood ? 'Tornar a jugar' : 'Torna a intentar-ho';
    restartBtn.addEventListener('click', () => this._restartFromEnding());

    const menuBtn = document.createElement('button');
    menuBtn.className = 'btn btn--center';
    menuBtn.textContent = 'Tornar al menú';
    menuBtn.addEventListener('click', () => {
      if (this._onMenu) this._onMenu();
    });

    this._choicesEl.appendChild(restartBtn);
    this._choicesEl.appendChild(menuBtn);
  }

  /** @private — Reinicia la partida des d'un final */
  _restartFromEnding() {
    // Netejar estat visual de final
    this._gameEl.classList.remove('game-screen--death', 'game-screen--victory');
    const resultEl = this._gameEl.querySelector('.game-screen__ending-result');
    if (resultEl) resultEl.remove();

    // Reiniciar motor i música
    this._engine.restart();
    this._audio.playMusic('adventure');

    // Re-renderitzar
    this._renderNode();
  }

  /** @private — Genera el missatge resum de morts */
  _getDeathSummary() {
    const d = this._deathCount;
    let msg;

    if (d === 0) {
      msg = 'Has superat l\'aventura sense morir ni una sola vegada! Diga-li al teu professor/a que et posi un assoliment excel·lent en comprensió lectora! O potser és que ja has jugat mil vegades i te\'n recordes de memòria...';
    } else if (d <= 3) {
      msg = `Només ${d} mort${d > 1 ? 's' : ''}! Tens molt bona comprensió lectora, tot i que algun detall se t'ha escapat. Res que una segona lectura no arregli!`;
    } else if (d <= 7) {
      msg = `${d} morts. No està malament, però potser hauries de llegir els textos amb una mica més d'atenció. Els detalls importen!`;
    } else if (d <= 15) {
      msg = `${d} morts! Ui, que fort. Segur que llegeixes els textos sencers o vas directament als botons? Els detalls amagats estan AL TEXT, no als botons!`;
    } else {
      msg = `${d} morts! Vols dir que no has de repetir curs? T'has llegit algun text? Potser cal felicitar-te, perquè s'ha d'esmerçar força per aconseguir morir de tantes formes possibles!`;
    }

    return `
      <div class="game-screen__death-summary">
        <p class="game-screen__death-count">Morts: ${d}</p>
        <p class="game-screen__death-msg">${msg}</p>
      </div>
    `;
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
    // Diferir el registre per evitar que el click actual (selecció d'opció)
    // dispari immediatament el skip del nou typewriter
    setTimeout(() => {
      if (this._skipHandler) {
        document.addEventListener('click', this._skipHandler);
        document.addEventListener('keydown', this._skipHandler);
      }
    }, 0);
  }

  /** @private */
  _removeSkipHandler() {
    if (this._skipHandler) {
      document.removeEventListener('click', this._skipHandler);
      document.removeEventListener('keydown', this._skipHandler);
      this._skipHandler = null;
    }
  }

  /** @private — Actualitza la icona del botó mute */
  _updateMuteBtn(btn) {
    const enabled = this._audio.getMusicEnabled();
    btn.innerHTML = enabled
      ? '<i class="fa-solid fa-volume-high"></i>'
      : '<i class="fa-solid fa-volume-xmark"></i>';
    btn.title = enabled ? 'Silenciar música' : 'Activar música';
  }
}

export default GameScreen;
