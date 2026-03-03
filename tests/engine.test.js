/**
 * Tests unitaris per a StoryEngine i SettingsManager.
 */

import StoryEngine from '../js/engine/StoryEngine.js';
import SettingsManager from '../js/engine/SettingsManager.js';

const { describe, it, assert, assertEqual, assertThrows } = window._test;

// ============================================
// Aventura de test mínima
// ============================================
const MINI_ADVENTURE = {
  id: 'test',
  title: 'Aventura de Test',
  startNode: 'start',
  nodes: {
    start: {
      text: 'Ets a l\'inici. Què fas?',
      choices: [
        { label: 'Anar al nord', nextNode: 'north' },
        { label: 'Anar al sud', nextNode: 'deadEnd' }
      ]
    },
    north: {
      text: 'Trobes un tresor!',
      choices: [
        { label: 'Agafar-lo', nextNode: 'goodEnd' },
        { label: 'Deixar-lo', nextNode: 'badEnd' }
      ]
    },
    deadEnd: {
      text: 'Has caigut a un forat.',
      isEnding: true,
      endingType: 'bad',
      endingTitle: 'Final del Forat'
    },
    goodEnd: {
      text: 'Ets ric!',
      isEnding: true,
      endingType: 'good',
      endingTitle: 'Victòria'
    },
    badEnd: {
      text: 'El tresor era una trampa.',
      isEnding: true,
      endingType: 'bad',
      endingTitle: 'Trampa'
    }
  }
};

// ============================================
// StoryEngine
// ============================================

describe('StoryEngine — Càrrega', () => {
  it('carrega una aventura correctament', () => {
    const engine = new StoryEngine();
    engine.loadAdventure(MINI_ADVENTURE);
    assertEqual(engine.getTitle(), 'Aventura de Test');
  });

  it('rebutja aventura sense startNode', () => {
    const engine = new StoryEngine();
    assertThrows(() => engine.loadAdventure({ nodes: {} }));
  });

  it('rebutja aventura sense nodes', () => {
    const engine = new StoryEngine();
    assertThrows(() => engine.loadAdventure({ startNode: 'x' }));
  });

  it('rebutja aventura amb startNode inexistent', () => {
    const engine = new StoryEngine();
    assertThrows(() => engine.loadAdventure({
      startNode: 'noExisteix',
      nodes: { start: { text: 'hola', choices: [] } }
    }));
  });

  it('rebutja dades nul·les', () => {
    const engine = new StoryEngine();
    assertThrows(() => engine.loadAdventure(null));
  });
});

describe('StoryEngine — Navegació', () => {
  it('startGame posa el node actual al startNode', () => {
    const engine = new StoryEngine();
    engine.loadAdventure(MINI_ADVENTURE);
    engine.startGame();
    assertEqual(engine.getCurrentNodeId(), 'start');
  });

  it('getCurrentNode retorna el node complet', () => {
    const engine = new StoryEngine();
    engine.loadAdventure(MINI_ADVENTURE);
    engine.startGame();
    const node = engine.getCurrentNode();
    assertEqual(node.text, 'Ets a l\'inici. Què fas?');
    assertEqual(node.choices.length, 2);
  });

  it('selectChoice navega al node correcte', () => {
    const engine = new StoryEngine();
    engine.loadAdventure(MINI_ADVENTURE);
    engine.startGame();
    engine.selectChoice(0); // Anar al nord
    assertEqual(engine.getCurrentNodeId(), 'north');
  });

  it('selectChoice amb índex invàlid llança error', () => {
    const engine = new StoryEngine();
    engine.loadAdventure(MINI_ADVENTURE);
    engine.startGame();
    assertThrows(() => engine.selectChoice(5));
    assertThrows(() => engine.selectChoice(-1));
  });

  it('selectChoice en un node final llança error', () => {
    const engine = new StoryEngine();
    engine.loadAdventure(MINI_ADVENTURE);
    engine.startGame();
    engine.selectChoice(1); // deadEnd
    assertThrows(() => engine.selectChoice(0));
  });

  it('navega un camí complet fins a un final bo', () => {
    const engine = new StoryEngine();
    engine.loadAdventure(MINI_ADVENTURE);
    engine.startGame();
    engine.selectChoice(0); // north
    engine.selectChoice(0); // goodEnd
    assert(engine.isEnding());
    assertEqual(engine.getEndingType(), 'good');
    assertEqual(engine.getEndingTitle(), 'Victòria');
  });

  it('navega un camí complet fins a un final dolent', () => {
    const engine = new StoryEngine();
    engine.loadAdventure(MINI_ADVENTURE);
    engine.startGame();
    engine.selectChoice(1); // deadEnd
    assert(engine.isEnding());
    assertEqual(engine.getEndingType(), 'bad');
  });
});

describe('StoryEngine — Historial', () => {
  it('registra els nodes visitats', () => {
    const engine = new StoryEngine();
    engine.loadAdventure(MINI_ADVENTURE);
    engine.startGame();
    engine.selectChoice(0);
    engine.selectChoice(1);
    const history = engine.getHistory();
    assertEqual(history.length, 3);
    assertEqual(history[0], 'start');
    assertEqual(history[1], 'north');
    assertEqual(history[2], 'badEnd');
  });

  it('restart neteja l\'historial', () => {
    const engine = new StoryEngine();
    engine.loadAdventure(MINI_ADVENTURE);
    engine.startGame();
    engine.selectChoice(0);
    engine.restart();
    assertEqual(engine.getCurrentNodeId(), 'start');
    assertEqual(engine.getHistory().length, 1);
  });
});

describe('StoryEngine — Estat', () => {
  it('isEnding retorna false en nodes normals', () => {
    const engine = new StoryEngine();
    engine.loadAdventure(MINI_ADVENTURE);
    engine.startGame();
    assert(!engine.isEnding());
  });

  it('getEndingType retorna null en nodes normals', () => {
    const engine = new StoryEngine();
    engine.loadAdventure(MINI_ADVENTURE);
    engine.startGame();
    assertEqual(engine.getEndingType(), null);
  });

  it('getCurrentNode retorna null sense partida iniciada', () => {
    const engine = new StoryEngine();
    assertEqual(engine.getCurrentNode(), null);
  });

  it('startGame sense aventura llança error', () => {
    const engine = new StoryEngine();
    assertThrows(() => engine.startGame());
  });
});

// ============================================
// SettingsManager
// ============================================

describe('SettingsManager — Valors per defecte', () => {
  it('retorna tema fosc per defecte', () => {
    // Netejar localStorage per assegurar defaults
    localStorage.removeItem('aventures-retro-settings');
    const settings = new SettingsManager();
    assertEqual(settings.get('theme'), 'dark');
  });

  it('retorna música activada per defecte', () => {
    localStorage.removeItem('aventures-retro-settings');
    const settings = new SettingsManager();
    assertEqual(settings.get('musicEnabled'), true);
  });

  it('retorna typewriter activat per defecte', () => {
    localStorage.removeItem('aventures-retro-settings');
    const settings = new SettingsManager();
    assertEqual(settings.get('typewriterEnabled'), true);
    assertEqual(settings.get('typewriterSpeed'), 30);
  });
});

describe('SettingsManager — Get/Set', () => {
  it('set canvia el valor i get el retorna', () => {
    localStorage.removeItem('aventures-retro-settings');
    const settings = new SettingsManager();
    settings.set('theme', 'light');
    assertEqual(settings.get('theme'), 'light');
  });

  it('get amb clau desconeguda llança error', () => {
    const settings = new SettingsManager();
    assertThrows(() => settings.get('noExisteix'));
  });

  it('set amb clau desconeguda llança error', () => {
    const settings = new SettingsManager();
    assertThrows(() => settings.set('noExisteix', 'valor'));
  });

  it('getAll retorna una còpia de totes les preferències', () => {
    localStorage.removeItem('aventures-retro-settings');
    const settings = new SettingsManager();
    const all = settings.getAll();
    assertEqual(all.theme, 'dark');
    assertEqual(all.musicEnabled, true);
    // Modificar la còpia no afecta l'original
    all.theme = 'light';
    assertEqual(settings.get('theme'), 'dark');
  });
});

describe('SettingsManager — Persistència', () => {
  it('persisteix valors a localStorage', () => {
    localStorage.removeItem('aventures-retro-settings');
    const s1 = new SettingsManager();
    s1.set('theme', 'light');
    s1.set('musicEnabled', false);
    // Crear nova instància que llegeixi de localStorage
    const s2 = new SettingsManager();
    assertEqual(s2.get('theme'), 'light');
    assertEqual(s2.get('musicEnabled'), false);
  });

  it('reset restaura defaults i persisteix', () => {
    localStorage.removeItem('aventures-retro-settings');
    const settings = new SettingsManager();
    settings.set('theme', 'light');
    settings.reset();
    assertEqual(settings.get('theme'), 'dark');
    // Verificar persistència del reset
    const s2 = new SettingsManager();
    assertEqual(s2.get('theme'), 'dark');
  });
});
