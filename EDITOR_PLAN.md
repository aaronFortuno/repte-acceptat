# EDITOR_PLAN.md — Editor Visual d'Aventures

## Visió

Editor visual integrat a la web on els alumnes poden crear aventures arrossegant nodes i
connectant-los amb fletxes. L'editor genera el JSON compatible amb el motor existent,
permet provar l'aventura in situ, i exportar-la quan estigui llesta.

---

## Tecnologia

**SVG dins d'un contenidor HTML** (no `<canvas>`):
- SVG permet interacció DOM nativa (events per element, CSS styling)
- Cada node és un `<g>` amb `<rect>` + `<foreignObject>` (per inputs editables)
- Les connexions són `<path>` amb marcadors de fletxa SVG
- Pan/zoom via `viewBox` manipulation
- Coherent amb l'estil "zero dependències" del projecte

---

## Estructura de Carpetes

```
js/
├── editor/
│   ├── EditorCanvas.js        # Canvas SVG, pan/zoom, events globals
│   ├── EditorNode.js          # Nodes visuals (normal/final)
│   ├── EditorConnection.js    # Connexions/fletxes entre nodes
│   ├── EditorState.js         # Estat centralitzat + undo/redo
│   ├── EditorSerializer.js    # JSON ↔ graf visual
│   └── EditorStorage.js       # localStorage per projectes
├── ui/
│   └── EditorScreen.js        # Pantalla de l'editor (toolbar + canvas)
css/
│   └── editor.css             # Estils de l'editor
tests/
│   └── editor.test.js         # Tests de l'editor
```

---

## Format de Dades Intern (EditorState)

```js
{
  metadata: {
    id: 'my-adventure',
    title: 'La meva aventura',
    author: 'Alumne',
    description: '...',
    difficulty: 'easy',
    language: 'ca'
  },
  startNodeId: 'node-1',
  nodes: {
    'node-1': {
      id: 'node-1',
      x: 100, y: 200,         // posició al canvas
      text: 'Text narratiu...',
      isEnding: false,
      endingType: null,        // 'good' | 'bad' | null
      endingTitle: null
    }
  },
  connections: {
    'conn-1': {
      id: 'conn-1',
      fromNodeId: 'node-1',
      toNodeId: 'node-2',
      label: 'Anar al nord'   // text de l'opció/choice
    }
  }
}
```

---

## Format JSON de Sortida (Compatible amb StoryEngine)

L'exportació genera exactament el format que ja consumeix el motor:

```json
{
  "id": "my-adventure",
  "title": "La meva aventura",
  "author": "Alumne",
  "description": "...",
  "difficulty": "easy",
  "language": "ca",
  "startNode": "node-1",
  "nodes": {
    "node-1": {
      "text": "Text narratiu...",
      "choices": [
        { "label": "Anar al nord", "nextNode": "node-2" },
        { "label": "Anar al sud", "nextNode": "node-3" }
      ]
    },
    "node-final": {
      "text": "Has guanyat!",
      "isEnding": true,
      "endingType": "good",
      "endingTitle": "Victòria"
    }
  }
}
```

---

## Fases de Desenvolupament

### Fase E1 — Canvas i Nodes Bàsics

**Fitxers**: `EditorCanvas.js`, `EditorNode.js`, `EditorState.js`

Funcionalitats:
- [x] Canvas SVG amb pan (arrossegar fons) i zoom (roda ratolí)
- [x] Crear node normal (doble clic al canvas o botó "+")
- [x] Crear node final (toggle dins del node)
- [x] Editar text del node inline (clic al text)
- [x] Moure nodes arrossegant-los (drag & drop)
- [x] Eliminar node seleccionat (tecla Delete o botó ×)
- [x] Seleccionar node (clic → vora ressaltada)
- [x] Marcar node com a startNode (clic dret o botó)

Tests:
- [ ] Crear node → apareix a l'estat
- [ ] Eliminar node → desapareix de l'estat
- [ ] Moure node → coordenades actualitzades
- [ ] Toggle ending → canvia propietat isEnding

---

### Fase E2 — Connexions (Fletxes)

**Fitxers**: `EditorConnection.js` (+ modificar EditorCanvas, EditorState)

Funcionalitats:
- [ ] Port de sortida visible a cada node (cercle petit a la dreta)
- [ ] Arrossegar des del port per crear connexió → snap al node destí
- [ ] Fletxa SVG amb punta de fletxa (marker-end)
- [ ] Etiqueta editable a la connexió (text de l'opció)
- [ ] Fletxes es redibuixen quan es mouen nodes
- [ ] Eliminar connexió (selecció + Delete)
- [ ] Màxim 4 connexions de sortida per node
- [ ] Nodes finals no permeten connexions de sortida

Tests:
- [ ] Crear connexió → apareix a l'estat
- [ ] Eliminar node → elimina connexions associades
- [ ] Node final → no permet connexions de sortida
- [ ] Màxim 4 sortides per node

---

### Fase E3 — Serialització JSON

**Fitxers**: `EditorSerializer.js`

Funcionalitats:
- [ ] Exportar graf → JSON vàlid (format StoryEngine)
- [ ] Importar JSON → reconstruir graf amb layout automàtic
- [ ] Descarregar fitxer .json (botó "Exportar")
- [ ] Carregar fitxer .json (input file)
- [ ] Metadades editables: títol, autor, descripció, dificultat, idioma

Tests:
- [ ] Serialitzar → deserialitzar → mateix graf
- [ ] JSON generat passa validació de stories.test.js
- [ ] Importar quest404.json → re-exportar → JSON equivalent

---

### Fase E4 — Validació i Previsualització

**Funcionalitats** (modifica fitxers existents):
- [ ] Validació en temps real amb warnings visuals:
  - Nodes sense sortida que no són finals → vora vermella
  - Nodes orfes (inaccessibles des de startNode) → vora taronja
  - Falta startNode → avís global
  - Nodes sense text → warning
  - Connexions sense etiqueta → warning
- [ ] Botó "Provar aventura":
  - Serialitza graf → carrega al StoryEngine en memòria
  - Obre GameScreen amb l'aventura generada
  - Al sortir → torna a l'editor amb estat intacte
- [ ] Marcadors d'error al canvas (icones o colors)

Tests:
- [ ] Detectar nodes orfes
- [ ] Detectar nodes sense sortida no-finals
- [ ] Detectar falta startNode
- [ ] Provar aventura → funciona al GameScreen

---

### Fase E5 — Persistència localStorage

**Fitxers**: `EditorStorage.js`

Funcionalitats:
- [ ] Autoguardat cada 30 segons
- [ ] Llista de projectes guardats (títol + data)
- [ ] Guardar / carregar / eliminar projectes
- [ ] Avís beforeunload si hi ha canvis no guardats
- [ ] Límit d'emmagatzematge amb avís

Tests:
- [ ] Guardar → carregar → mateix estat
- [ ] Llista projectes correcta
- [ ] Eliminar projecte funciona

---

### Fase E6 — Integració UI i Poliment

**Fitxers**: `EditorScreen.js`, `css/editor.css`, modificar `MenuScreen.js` i `app.js`

Funcionalitats:
- [ ] Botó "Crear aventura" al menú principal
- [ ] Toolbar: Nou, Obrir, Guardar, Exportar, Provar, Tornar
- [ ] Undo/Redo (Ctrl+Z / Ctrl+Y)
- [ ] Estil visual retro coherent amb el joc
- [ ] i18n de la interfície de l'editor
- [ ] Responsive bàsic (funcional en tauleta, avís en mòbil)

Tests d'integració:
- [ ] Flux complet: crear → nodes → connectar → provar → exportar
- [ ] Editor no afecta el joc normal
- [ ] Navegar entre editor i joc no perd estat

---

## Ordre d'Implementació

```
E1 (Canvas+Nodes) → E2 (Connexions) → E3 (Serialització)
                                            ↓
                              E4 (Validació+Preview) → E5 (localStorage) → E6 (UI+Poliment)
```

## Dependències entre Fases

- E2 depèn de E1 (necessita nodes per connectar)
- E3 depèn de E1+E2 (necessita graf complet per serialitzar)
- E4 depèn de E3 (necessita serialització per provar)
- E5 depèn de E1 (necessita estat per guardar)
- E6 depèn de E1-E4 (integra tot)

## Riscos i Mitigació

| Risc | Mitigació |
|------|-----------|
| SVG rendiment amb molts nodes | Limitar a ~100 nodes |
| Drag & drop complex | Implementar pas a pas |
| localStorage ple | Avís a 80% capacitat |
| UX confusa | Provar amb alumne real a E4 |
