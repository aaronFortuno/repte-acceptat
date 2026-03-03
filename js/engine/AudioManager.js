/**
 * AudioManager — Gestió d'àudio: música de fons i efectes sonors.
 * Usa HTMLAudioElement per simplicitat (sense Web Audio API complex).
 */

class AudioManager {
  constructor() {
    this._musicEnabled = true;
    this._sfxEnabled = true;
    this._currentMusic = null;
    this._musicElement = null;
    this._initialized = false;
  }

  /**
   * Inicialitza el sistema d'àudio.
   * Cridar després d'una interacció d'usuari (click/keypress)
   * per complir amb les polítiques d'autoplay dels navegadors.
   */
  init() {
    if (this._initialized) return;
    this._initialized = true;
  }

  /**
   * Reprodueix música de fons en bucle.
   * @param {string} src — Ruta al fitxer d'àudio
   */
  playMusic(src) {
    if (!this._musicEnabled) return;

    this.stopMusic();
    this._musicElement = new Audio(src);
    this._musicElement.loop = true;
    this._musicElement.volume = 0.4;
    this._currentMusic = src;

    this._musicElement.play().catch(() => {
      // Autoplay bloquejat — es reintentarà amb la propera interacció
    });
  }

  /**
   * Atura la música de fons.
   */
  stopMusic() {
    if (this._musicElement) {
      this._musicElement.pause();
      this._musicElement.currentTime = 0;
      this._musicElement = null;
    }
    this._currentMusic = null;
  }

  /**
   * Reprodueix un efecte sonor (una vegada, sense bucle).
   * @param {string} src — Ruta al fitxer d'àudio
   */
  playSFX(src) {
    if (!this._sfxEnabled) return;

    const audio = new Audio(src);
    audio.volume = 0.6;
    audio.play().catch(() => {
      // Autoplay bloquejat — ignorar
    });
  }

  /**
   * Activa o desactiva la música.
   * @param {boolean} enabled
   */
  setMusicEnabled(enabled) {
    this._musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  /**
   * Activa o desactiva els efectes sonors.
   * @param {boolean} enabled
   */
  setSFXEnabled(enabled) {
    this._sfxEnabled = enabled;
  }

  /**
   * Retorna si la música està activada.
   * @returns {boolean}
   */
  getMusicEnabled() {
    return this._musicEnabled;
  }

  /**
   * Retorna si els SFX estan activats.
   * @returns {boolean}
   */
  getSFXEnabled() {
    return this._sfxEnabled;
  }
}

export default AudioManager;
