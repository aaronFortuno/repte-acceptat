/**
 * TypewriterEffect — Mostra text caràcter a caràcter amb velocitat configurable.
 */

class TypewriterEffect {
  constructor() {
    this._timerId = null;
    this._isRunning = false;
    this._completeCallback = null;
    this._currentIndex = 0;
    this._text = '';
    this._element = null;
  }

  /**
   * Comença l'efecte typewriter a l'element DOM indicat.
   * @param {string} text — Text complet a mostrar
   * @param {HTMLElement} element — Element DOM on escriure
   * @param {number} speed — Mil·lisegons entre caràcters (default: 30)
   */
  start(text, element, speed = 30) {
    this.stop();
    this._text = text;
    this._element = element;
    this._currentIndex = 0;
    this._isRunning = true;
    this._element.textContent = '';

    this._tick(speed);
  }

  /**
   * Mostra tot el text immediatament i crida el callback.
   */
  skip() {
    if (!this._isRunning) return;
    this._clearTimer();
    if (this._element) {
      this._element.textContent = this._text;
    }
    this._isRunning = false;
    this._fireComplete();
  }

  /**
   * Atura l'efecte sense completar el text.
   */
  stop() {
    this._clearTimer();
    this._isRunning = false;
    this._completeCallback = null;
  }

  /**
   * Retorna si l'efecte està en curs.
   * @returns {boolean}
   */
  isRunning() {
    return this._isRunning;
  }

  /**
   * Registra callback per quan l'efecte acaba (naturalment o amb skip).
   * @param {function} callback
   */
  onComplete(callback) {
    this._completeCallback = callback;
  }

  /** @private */
  _tick(speed) {
    if (this._currentIndex >= this._text.length) {
      this._isRunning = false;
      this._fireComplete();
      return;
    }

    this._timerId = setTimeout(() => {
      this._currentIndex++;
      this._element.textContent = this._text.substring(0, this._currentIndex);
      this._tick(speed);
    }, speed);
  }

  /** @private */
  _clearTimer() {
    if (this._timerId !== null) {
      clearTimeout(this._timerId);
      this._timerId = null;
    }
  }

  /** @private */
  _fireComplete() {
    if (this._completeCallback) {
      this._completeCallback();
    }
  }
}

export default TypewriterEffect;
