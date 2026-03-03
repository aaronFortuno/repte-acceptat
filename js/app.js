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

import StoryEngine from './engine/StoryEngine.js';
import TypewriterEffect from './engine/TypewriterEffect.js';
import AudioManager from './engine/AudioManager.js';
import SettingsManager from './engine/SettingsManager.js';

// Instàncies dels serveis (engine)
const settings = new SettingsManager();
const audio = new AudioManager();
const engine = new StoryEngine();
const typewriter = new TypewriterEffect();

// Aplicar preferències visuals guardades
settings.applyAll();

// Contenidor principal
const appEl = document.getElementById('app');
const screens = new ScreenManager(appEl);

// Manifest d'aventures (es carrega al iniciar)
let adventures = [];

// ============================================
// Definició de pantalles
// ============================================

const titleScreen = new TitleScreen({
  onStart: () => showMenu()
});

const menuScreen = new MenuScreen({
  onSelectAdventure: (adv) => startAdventure(adv),
  onSettings: () => screens.showScreen('settings')
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
  onEnd: (node) => screens.showScreen('end', { node }),
  onMenu: () => {
    audio.stopMusic();
    showMenu();
  },
  onSettings: () => {
    screens.showScreen('settings', {
      onBack: () => screens.showScreen('game'),
      backLabel: 'Tornar al joc'
    });
  }
});

const endScreen = new EndScreen({
  audioManager: audio,
  onRestart: () => {
    engine.restart();
    audio.playMusic('audio/music/music_loop.wav');
    screens.showScreen('game');
  },
  onMenu: () => {
    audio.stopMusic();
    showMenu();
  }
});

// Registrar pantalles
screens.registerScreen('title', titleScreen);
screens.registerScreen('menu', menuScreen);
screens.registerScreen('settings', settingsScreen);
screens.registerScreen('game', gameScreen);
screens.registerScreen('end', endScreen);

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
  screens.showScreen('menu', { adventures });
}

async function startAdventure(adv) {
  try {
    await engine.loadAdventureFromUrl(`stories/${adv.file}`);
    engine.startGame();
    audio.init();
    audio.playMusic('audio/music/music_loop.wav');
    screens.showScreen('game');
  } catch (e) {
    console.error('Error carregant aventura:', e);
    alert(`Error carregant l'aventura: ${e.message}`);
  }
}

// ============================================
// Inicialització
// ============================================

async function init() {
  await loadManifest();
  screens.showScreen('title');
}

init();
