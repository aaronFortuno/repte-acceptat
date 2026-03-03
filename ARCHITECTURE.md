# ARCHITECTURE.md — Motor d'Aventures Textuals

## Jerarquia de Carpetes

```
repte-acceptat/
├── index.html                  # Entry point — estructura HTML semàntica
├── css/
│   ├── main.css                # Estils principals, variables CSS, layout
│   ├── crt.css                 # Efectes retro: scanlines, glow, curvatura CRT
│   └── themes.css              # Temes clar/fosc (CSS custom properties)
├── js/
│   ├── app.js                  # Punt d'entrada JS — inicialitza l'aplicació
│   ├── engine/
│   │   ├── StoryEngine.js      # Motor narratiu: càrrega JSON, navega nodes, estat
│   │   ├── TypewriterEffect.js # Efecte d'escriptura lletra a lletra
│   │   ├── AudioManager.js     # Gestió d'àudio: música i SFX (Web Audio API)
│   │   └── SettingsManager.js  # Preferències d'usuari (localStorage)
│   └── ui/
│       ├── ScreenManager.js    # Gestiona transicions entre pantalles
│       ├── TitleScreen.js      # Pantalla de títol / splash
│       ├── MenuScreen.js       # Menú principal: triar aventura, opcions
│       ├── SettingsScreen.js   # Pantalla d'opcions
│       ├── GameScreen.js       # Pantalla de joc: text narratiu + opcions
│       └── EndScreen.js        # Pantalla de final: resultat + reiniciar
├── stories/
│   ├── manifest.json           # Registre de totes les aventures disponibles
│   └── quest404.json           # Aventura "Quest 404: El Tresor del Drac Pàgic"
├── audio/
│   ├── music/                  # Fitxers de música chiptune (.mp3/.ogg)
│   └── sfx/                    # Efectes sonors (.mp3/.ogg)
├── fonts/                      # Fonts pixelades (o referència a Google Fonts)
├── tests/
│   ├── test-runner.html        # Pàgina HTML per executar tests al navegador
│   ├── engine.test.js          # Tests unitaris del motor narratiu
│   └── stories.test.js         # Tests de validació d'aventures (camins, finals)
├── PLAN.md                     # Pla de desenvolupament per fases
├── README.md                   # Presentació del projecte
├── ARCHITECTURE.md             # Aquest fitxer
├── CLAUDE.md                   # Instruccions per a l'agent de desenvolupament
└── EXEMPLE1.md                 # Exemple de referència (Quest 404)
```

---

## Format JSON d'Aventura

### manifest.json
```json
{
  "adventures": [
    {
      "id": "quest404",
      "file": "quest404.json",
      "title": "Quest 404: El Tresor del Drac Pàgic",
      "author": "Equip Repte",
      "description": "Ets en Baldiri, aventurer de 3a categoria...",
      "difficulty": "fàcil",
      "endings": { "total": 10, "good": 1, "bad": 9 }
    }
  ]
}
```

### Estructura d'un fitxer d'aventura (ex: quest404.json)
```json
{
  "id": "quest404",
  "title": "Quest 404: El Tresor del Drac Pàgic",
  "startNode": "node1",
  "nodes": {
    "node1": {
      "text": "Trobes un mapa del tresor a la tovallola de paper del teu entrepà. Que fas?",
      "choices": [
        { "label": "Sortir corrent cap al castell", "nextNode": "node2" },
        { "label": "Estudiar el mapa detingudament", "nextNode": "node3" },
        { "label": "Vendre el mapa al taverner", "nextNode": "final1" }
      ]
    },
    "final1": {
      "text": "Vens el mapa per 3,50€. El taverner es fa milionari.",
      "isEnding": true,
      "endingType": "bad",
      "endingTitle": "El Millor Negoci"
    }
  }
}
```

### Propietats d'un Node

| Propietat | Tipus | Obligatori | Descripció |
|-----------|-------|------------|------------|
| `text` | string | Sí | Text narratiu mostrat al jugador |
| `choices` | array | No* | Opcions disponibles (2-4 elements) |
| `choices[].label` | string | Sí | Text del botó d'opció |
| `choices[].nextNode` | string | Sí | ID del node destí |
| `isEnding` | boolean | No | `true` si és un node final |
| `endingType` | string | No* | `"good"` o `"bad"` (obligatori si isEnding) |
| `endingTitle` | string | No | Títol del final (ex: "El Millor Negoci") |

*Un node ha de tenir `choices` O `isEnding: true`, mai ambdós.

---

## Components Principals

### StoryEngine.js
```
Responsabilitat: Carregar aventures JSON, gestionar l'estat de la partida,
                 navegar entre nodes.

Mètodes públics:
  loadAdventure(adventureId)    → Carrega JSON de l'aventura
  startGame()                   → Inicialitza partida al startNode
  getCurrentNode()              → Retorna el node actual
  selectChoice(choiceIndex)     → Navega al node següent segons l'opció triada
  isEnding()                    → Retorna si el node actual és un final
  getEndingType()               → Retorna "good" | "bad" | null
  restart()                     → Reinicia la partida al startNode

Estat intern:
  currentAdventure              → Dades JSON de l'aventura carregada
  currentNodeId                 → ID del node actual
  history                       → Array de nodeIds visitats (per si cal backtrack)
```

### TypewriterEffect.js
```
Responsabilitat: Mostrar text caràcter a caràcter amb velocitat configurable.

Mètodes públics:
  start(text, element, speed)   → Comença efecte typewriter a l'element DOM
  skip()                        → Mostra tot el text immediatament
  isRunning()                   → Retorna si l'efecte està en curs
  onComplete(callback)          → Registra callback per quan acaba

Configuració:
  speed                         → Mil·lisegons entre caràcters (default: 30ms)
  enabled                       → Si és false, mostra tot el text d'un cop
```

### AudioManager.js
```
Responsabilitat: Reproduir música de fons i efectes sonors.

Mètodes públics:
  init()                        → Inicialitza context d'àudio (requereix interacció)
  playMusic(trackName)          → Reprodueix música en bucle
  stopMusic()                   → Atura la música
  playSFX(sfxName)              → Reprodueix un efecte sonor
  setMusicEnabled(bool)         → Activa/desactiva música
  setSFXEnabled(bool)           → Activa/desactiva SFX
  getMusicEnabled()             → Retorna estat de música
  getSFXEnabled()               → Retorna estat de SFX
```

### SettingsManager.js
```
Responsabilitat: Gestionar preferències d'usuari amb localStorage.

Mètodes públics:
  get(key)                      → Retorna valor d'una preferència
  set(key, value)               → Estableix valor d'una preferència
  getAll()                      → Retorna totes les preferències
  reset()                       → Restaura valors per defecte

Preferències (claus):
  theme                         → "dark" | "light" (default: "dark")
  musicEnabled                  → boolean (default: true)
  sfxEnabled                    → boolean (default: true)
  typewriterEnabled             → boolean (default: true)
  typewriterSpeed               → number en ms (default: 30)
```

### ScreenManager.js
```
Responsabilitat: Gestionar quina pantalla és visible i les transicions.

Mètodes públics:
  showScreen(screenName)        → Mostra una pantalla amb transició
  getCurrentScreen()            → Retorna la pantalla activa
  registerScreen(name, screen)  → Registra un objecte pantalla

Pantalles registrades:
  "title"                       → TitleScreen
  "menu"                        → MenuScreen
  "settings"                    → SettingsScreen
  "game"                        → GameScreen
  "end"                         → EndScreen
```

### Pantalles UI (TitleScreen, MenuScreen, etc.)
```
Interfície comuna:
  show()                        → Mostra la pantalla (popula DOM)
  hide()                        → Amaga la pantalla
  destroy()                     → Neteja event listeners

Cada pantalla gestiona el seu propi fragment de DOM dins de
l'element contenidor principal (#app).
```

---

## Flux de l'Aplicació

```
[Càrrega pàgina]
    ↓
[TitleScreen] — Animació títol retro, "Press any key"
    ↓
[MenuScreen] — Triar aventura | Opcions | Crèdits
    ↓                ↓
    ↓         [SettingsScreen] — Tema, àudio, typewriter
    ↓
[GameScreen] — Carrega aventura → Mostra node → Espera opció
    ↓              ↑                    |
    ↓              +--------------------+  (bucle fins a final)
    ↓
[EndScreen] — Mostra resultat → Reiniciar | Tornar al menú
```

---

## Convencions de Codi

- **Mòduls ES6**: Cada fitxer exporta una classe o objecte amb `export default`
- **Noms de fitxers**: PascalCase per a classes (`StoryEngine.js`), camelCase per a utilitats
- **CSS**: BEM-like (`screen__element--modifier`), custom properties per a temes
- **IDs HTML**: kebab-case (`#game-screen`, `#choice-container`)
- **Events**: CustomEvent per a comunicació entre components
- **Sense globals**: Tot comunicat via imports, events o injecció de dependències
