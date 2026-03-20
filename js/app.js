/**
 * app.js — Punt d'entrada de l'aplicació.
 * Inicialitza tots els components i connecta les pantalles.
 */

import ScreenManager from './ui/ScreenManager.js';
import TitleScreen from './ui/TitleScreen.js';
import MenuScreen from './ui/MenuScreen.js';
import SettingsScreen from './ui/SettingsScreen.js';
import GameScreen from './ui/GameScreen.js';
import EndScreen from './ui/EndScreen.js';
import EditorScreen from './ui/EditorScreen.js';

import StoryEngine from './engine/StoryEngine.js';
import TypewriterEffect from './engine/TypewriterEffect.js';
import AudioManager from './engine/AudioManager.js';
import SettingsManager from './engine/SettingsManager.js';
import i18n from './engine/I18nManager.js';

// Instàncies dels serveis (engine)
const settings = new SettingsManager();
i18n.init(settings);
document.title = i18n.t('page_title');
const audio = new AudioManager();
const engine = new StoryEngine();
const typewriter = new TypewriterEffect();

// Aplicar preferències visuals guardades
settings.applyAll();

// Sincronitzar estat d'àudio amb les preferències
audio.setMusicEnabled(settings.get('musicEnabled'));
audio.setSFXEnabled(settings.get('sfxEnabled'));

// Contenidor principal
const appEl = document.getElementById('app');
const screens = new ScreenManager(appEl);

// Manifest d'aventures (es carrega al iniciar)
let adventures = [];

// ============================================
// Definició de pantalles
// ============================================

const titleScreen = new TitleScreen({
  onStart: () => {
    audio.init();
    showMenu();
  }
});

const menuScreen = new MenuScreen({
  settingsManager: settings,
  onSelectAdventure: (adv) => startAdventure(adv),
  onSettings: () => screens.showScreen('settings'),
  onEditor: () => screens.showScreen('editor')
});

const settingsScreen = new SettingsScreen({
  settingsManager: settings,
  audioManager: audio,
  onBack: () => showMenu()
});

const gameScreen = new GameScreen({
  storyEngine: engine,
  typewriterEffect: typewriter,
  settingsManager: settings,
  audioManager: audio,
  onMenu: () => showMenu(),
  onSettings: () => {
    screens.showScreen('settings', {
      onBack: () => screens.showScreen('game')
    });
  }
});

const endScreen = new EndScreen({
  onRestart: () => {
    engine.restart();
    audio.playMusic('adventure');
    screens.showScreen('game');
  },
  onMenu: () => {
    // Si estem en mode test de l'editor, tornar a l'editor
    if (gameScreen._editorTestMode) {
      gameScreen._editorTestMode = false;
      document.dispatchEvent(new CustomEvent('editor-return-from-test'));
    } else {
      showMenu();
    }
  }
});

const editorScreen = new EditorScreen({
  settingsManager: settings,
  storyEngine: engine,
  audioManager: audio,
  onMenu: () => showMenu(),
  onTestAdventure: () => {
    engine.startGame();
    audio.playMusic('adventure');
    // Activar mode test per tornar a l'editor en lloc del menú
    gameScreen._editorTestMode = true;
    screens.showScreen('game');
  }
});

// Registrar pantalles
screens.registerScreen('title', titleScreen);
screens.registerScreen('menu', menuScreen);
screens.registerScreen('settings', settingsScreen);
screens.registerScreen('game', gameScreen);
screens.registerScreen('end', endScreen);
screens.registerScreen('editor', editorScreen);

// ============================================
// Funcions de navegació
// ============================================

async function loadManifest() {
  try {
    const response = await fetch('stories/manifest.json');
    if (!response.ok) throw new Error('Manifest no trobat');
    const data = await response.json();
    adventures = data.adventures || [];
  } catch (e) {
    console.warn('No s\'ha pogut carregar el manifest:', e.message);
    adventures = [];
  }
}

function showMenu() {
  audio.playMusic('menu');
  screens.showScreen('menu', { adventures });
}

async function startAdventure(adv) {
  try {
    await engine.loadAdventureFromUrl(`stories/${adv.file}`);
    engine.startGame();
    gameScreen.loadStats(adv.id);
    audio.playMusic('adventure');
    screens.showScreen('game');
    if (adv.timeLimit) {
      gameScreen.startTimer(adv.timeLimit);
    }
  } catch (e) {
    console.error('Error carregant aventura:', e);
    alert(i18n.t('error_loading_adventure', { msg: e.message }));
  }
}

// Listener per tornar a l'editor des del mode test
document.addEventListener('editor-return-from-test', () => {
  audio.stopMusic();
  screens.showScreen('editor');
});

// ============================================
// Inicialització
// ============================================

async function init() {
  await loadManifest();
  screens.showScreen('title');
}

init();
