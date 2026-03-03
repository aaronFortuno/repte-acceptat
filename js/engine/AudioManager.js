/**
 * AudioManager — Gestió d'àudio: música de fons i efectes sonors.
 * Usa HTMLAudioElement per simplicitat (sense Web Audio API complex).
 */

// Rutes centralitzades dels fitxers d'àudio
const TRACKS = {
  menu: 'audio/music/menu.wav',
  adventure: 'audio/music/adventure.wav',
  tension: 'audio/music/tension.wav',
  victory: 'audio/music/victory.wav',
  death: 'audio/music/death.wav'
};

const SFX = {
  choice: 'audio/sfx/choice.wav',
  victory: 'audio/sfx/victory.wav',
  death: 'audio/sfx/death.wav'
};

class AudioManager {
  constructor() {
    this._musicEnabled = true;
    this._sfxEnabled = true;
    this._currentTrack = null;
    this._musicElement = null;
    this._initialized = false;
  }

  /**
   * Inicialitza el sistema d'àudio.
   * Cridar després d'una interacció d'usuari (click/keypress).
   */
  init() {
    if (this._initialized) return;
    this._initialized = true;
  }

  /**
   * Reprodueix una pista de música per nom.
   * Si la mateixa pista ja sona, no la reinicia.
   * @param {string} trackName — Clau de TRACKS (menu, adventure, tension, victory, death)
   */
  playMusic(trackName) {
    const src = TRACKS[trackName];
    if (!src) {
      console.warn(`Pista desconeguda: "${trackName}"`);
      return;
    }

    // No reiniciar si ja sona la mateixa pista
    if (this._currentTrack === trackName && this._musicElement && !this._musicElement.paused) {
      return;
    }

    this.stopMusic();

    if (!this._musicEnabled) {
      // Guardar la pista per si es reactiva la música
      this._currentTrack = trackName;
      return;
    }

    this._musicElement = new Audio(src);
    this._musicElement.loop = true;
    this._musicElement.volume = 0.4;
    this._currentTrack = trackName;

    this._musicElement.play().catch(() => {
      // Autoplay bloquejat
    });
  }

  /**
   * Reprodueix un SFX seguit d'una pista de música de fons.
   * Útil per a finals: primer sona el SFX, després la música ambient.
   * @param {string} sfxName — Clau de SFX (choice, victory, death)
   * @param {string} trackName — Clau de TRACKS per reproduir després
   */
  playSFXThenMusic(sfxName, trackName) {
    const sfxSrc = SFX[sfxName];
    if (!sfxSrc) return;

    this.stopMusic();

    if (this._sfxEnabled) {
      const audio = new Audio(sfxSrc);
      audio.volume = 0.6;
      audio.addEventListener('ended', () => {
        this.playMusic(trackName);
      });
      audio.play().catch(() => {
        // Si falla el SFX, reproduir directament la música
        this.playMusic(trackName);
      });
    } else {
      this.playMusic(trackName);
    }
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
    this._currentTrack = null;
  }

  /**
   * Reprodueix un efecte sonor (una vegada, sense bucle).
   * @param {string} sfxName — Clau de SFX (choice, victory, death)
   */
  playSFX(sfxName) {
    if (!this._sfxEnabled) return;
    const src = SFX[sfxName];
    if (!src) {
      console.warn(`SFX desconegut: "${sfxName}"`);
      return;
    }
    const audio = new Audio(src);
    audio.volume = 0.6;
    audio.play().catch(() => {});
  }

  /**
   * Activa o desactiva la música.
   * Si es reactiva i hi havia una pista pendent, la reprodueix.
   * @param {boolean} enabled
   */
  setMusicEnabled(enabled) {
    this._musicEnabled = enabled;
    if (!enabled) {
      if (this._musicElement) {
        this._musicElement.pause();
      }
    } else if (this._currentTrack) {
      // Reprendre la pista que estava assignada
      this.playMusic(this._currentTrack);
    }
  }

  /**
   * Alterna música on/off. Retorna el nou estat.
   * @returns {boolean}
   */
  toggleMusic() {
    this.setMusicEnabled(!this._musicEnabled);
    return this._musicEnabled;
  }

  /**
   * Activa o desactiva els efectes sonors.
   * @param {boolean} enabled
   */
  setSFXEnabled(enabled) {
    this._sfxEnabled = enabled;
  }

  /** @returns {boolean} */
  getMusicEnabled() {
    return this._musicEnabled;
  }

  /** @returns {boolean} */
  getSFXEnabled() {
    return this._sfxEnabled;
  }

  /** @returns {string|null} — Nom de la pista actual */
  getCurrentTrack() {
    return this._currentTrack;
  }
}

export default AudioManager;
