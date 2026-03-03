# PLAN.MD — QUEST 404: El Tresor del Drac Pàgic

Joc textual estil "tria la teva aventura" amb estètica pixel art anys 80.
Motor: Godot 4.6 | Llenguatge: C#

---

## 1. CONCEPT I TEMATICA

Ets en **Baldiri**, aventurer de 3a categoria (llicència caducada), que ha trobat un
mapa del tresor en un got de cervesa. El tresor llegendari del Drac Pàgic t'espera...
o potser no. Probablement no.

**To**: Irònic, absurd i autoparodic. El joc es ria del gènere d'aventures i del
jugador per igual. Cada final desastrós és ridícul i merescut.

---

## 2. ARBRE DE DECISIONS I FINALS

### NODE 1 — INICI (La Taverna)
> "Trobes un mapa del tresor a la tovallola de paper del teu entrepà. Que fas?"

- **A)** Sortir corrent cap al castell sense pensar → **NODE 2**
- **B)** Estudiar el mapa detingudament → **NODE 3**
- **C)** Vendre el mapa al taverner per pagar l'entrepà → **FINAL 1** ☠️

---

### NODE 2 — El Camí del Bosc
> "El GPS no funciona. Hi ha un llop enorme al mig del camí mirant-te fixament."

- **A)** Lluitar contra el llop amb les mans nues → **FINAL 2** ☠️
- **B)** Intentar esquivar-lo pels arbustos → **NODE 4**
- **C)** Fer-li una foto per xarxes socials → **FINAL 3** ☠️

---

### NODE 3 — La Biblioteca
> "Estudiant el mapa, descobreixes una ruta alternativa per les clavegueres de la ciutat."

- **A)** Anar per les clavegueres → **NODE 5**
- **B)** Ignorar-ho i anar pel camí normal de totes formes → **NODE 2**
- **C)** Quedar-te a llegir llibres d'aventures en lloc de viure-les → **FINAL 4** ☠️

---

### NODE 4 — L'Entrada del Castell
> "El castell! Un guàrdia dorm profundament recolzat a la llança. Ronca fort."

- **A)** Eliminar el guàrdia silenciosament → **FINAL 5** ☠️
- **B)** Passar de puntetes molt lentament → **NODE 6**
- **C)** Despertar el guàrdia i demanar-li permís educadament → **FINAL 6** ☠️

---

### NODE 5 — Les Clavegueres
> "Les clavegueres estan habitades per una confraria de rates gegants amb sindicat."

- **A)** Lluitar contra les rates → **FINAL 7** ☠️
- **B)** Oferir-los el teu entrepà com a ofrena de pau → **NODE 6**
- **C)** Tornar enrere → **NODE 3**

---

### NODE 6 — La Sala del Tresor
> "El cofre daurat és allà! Al costat, un drac enorme dorm sobre un munt de monedes.
> Ronca. Fins i tot adormit fa pudor."

- **A)** Agafar el tresor sense fer soroll → **NODE 7**
- **B)** Matar el drac primer per seguretat → **FINAL 8** ☠️
- **C)** Despertar el drac per negociar una comissió → **FINAL 9** ☠️

---

### NODE 7 — La Fugida
> "Tens el cofre! Pesa el que pesa un cotxe petit. L'alarma del castell sona.
> El drac s'ha despertat. Tens 10 segons."

- **A)** Córrer amb tot el que tens cap a la sortida → **FINAL 10** ✅ (L'ÚNIC BO)
- **B)** Tornar a buscar un carretó per no fer-te mal a l'esquena → **FINAL 10-B** ☠️

---

## 3. DESCRIPCIO DELS 10 FINALS

| # | Nom | Causa | To |
|---|-----|-------|----|
| ☠️ F1 | "El Millor Negoci" | Vens el mapa per €3,50 | El taverner es fa milionari |
| ☠️ F2 | "Proteïna Natural" | LluitesS contra el llop | El llop guanya per K.O. tècnic |
| ☠️ F3 | "Viral, però Mort" | Foto al llop | Caus d'un precipici mirant la pantalla |
| ☠️ F4 | "Carrera Acadèmica" | Quedes llegint | Et doctores en "Tresors Hipotètics" |
| ☠️ F5 | "Drama Familiar" | Mates el guàrdia | Era el germà bessó del rei. Guerra. |
| ☠️ F6 | "Sospitós Habitual" | Demanes permís | T'empresonen per "excés de cortesia" |
| ☠️ F7 | "Derrota Democràtica" | Lluites les rates | Perds per votació 47 a 1 |
| ☠️ F8 | "Error de Diagnòstic" | Mates el drac | Era de peluix encantat. El tresor s'evapora |
| ☠️ F9 | "Menú Degustació" | Negocies amb el drac | T'ofereix de primer, segon i postres |
| ✅ F10 | "Contra Tot Pronòstic" | Corres amb el cofre | Surts just a temps. Ets ric. Fi. |
| ☠️ F10-B | "Ergonomia Mortal" | Busques carretó | El drac t'agafa. La seva quiropraxista t'agraeïx la feina. |

> **Nota**: F10-B és el final nº 10 desastrós (10è de 10). El BO és un bonus secret.
> Total: **10 finals jugables** (9 desastrosos + 1 exitós).

---

## 4. ESTRUCTURA TECNICA — GODOT 4.6 C#

### 4.1 Estructura de Fitxers
```
godot-test/
├── scenes/
│   ├── Main.tscn              # Escena principal / entry point
│   ├── GameScreen.tscn        # Pantalla de joc (text + botons)
│   └── EndScreen.tscn         # Pantalla de final
├── scripts/
│   ├── GameManager.cs         # Controlador principal de l'arbre de nodes
│   ├── GameScreen.cs          # Lògica UI de la pantalla de joc
│   ├── EndScreen.cs           # Lògica UI de la pantalla de final
│   └── StoryData.cs           # Dades de tots els nodes i finals (data-driven)
├── resources/
│   └── story.json             # (opcional) Dades de la història en JSON
├── fonts/
│   └── pixel_font.ttf         # Font pixel art per als textos
├── shaders/
│   └── scanlines.gdshader     # Efecte CRT / scanlines anys 80
├── audio/
│   ├── music_loop.ogg         # Música chiptune en bucle
│   └── sfx_choice.wav         # So al triar opció
└── PLAN.md
```

### 4.2 Arquitectura de Dades (StoryData.cs)
Cada node de la història és un objecte `StoryNode` amb:
- `id`: identificador únic (string)
- `text`: text narratiu que es mostra al jugador
- `choices`: llista de `Choice` (màx. 3)
  - `label`: text del botó
  - `nextNodeId`: a quin node porta
- `isEnding`: bool — si és un final
- `endingType`: `"bad"` o `"good"`

### 4.3 Flux de GameManager
```
GameManager.cs
  ├── LoadNode(nodeId)         → Carrega i mostra un StoryNode
  ├── OnChoiceSelected(index)  → Navega al node següent
  ├── ShowEnding(node)         → Activa EndScreen amb el text del final
  └── RestartGame()            → Torna al NODE 1
```

---

## 5. DISSENY VISUAL — ESTETICA PIXEL ART ANYS 80

### 5.1 Paleta de Colors
Paleta limitada de 16 colors estil CGA/EGA:
- Fons: Negre (#000000) o blau fosc (#0000AA)
- Text principal: Blanc (#FFFFFF) o verd fosforescent (#00FF00)
- Text accent/títols: Groc (#FFFF00) o cian (#00FFFF)
- Botons normals: Gris (#AAAAAA) fons, text negre
- Botons hover: Blanc (#FFFFFF) fons, text negre

### 5.2 Font
- Font pixelada tipus "Press Start 2P" o similar (Google Fonts / itch.io)
- Mida base: 12-14px per al text narratiu
- Mida botons: 10px

### 5.3 Efectes Visuals
- **Typewriter effect**: El text apareix lletra a lletra (velocitat configurable)
- **Scanlines shader**: Línies horitzontals semi-transparents sobre tot
- **CRT curvature**: Lleu distorsió de barel als cantons (opcional)
- **Blink cursor**: Cursor parpellejant al final del text (estil terminal)
- **Screen flash**: Flash breu en blanc en triar opció

### 5.4 Layout UI
```
+------------------------------------------+
|  QUEST 404: EL TRESOR DEL DRAC PÀGIC     |  <- Títol (top bar)
+------------------------------------------+
|                                           |
|  [TEXT DE LA NARRATIVA]                   |  <- Àrea de text (60% alçada)
|  Apareix lletra a lletra...               |
|  _                                        |  <- Cursor parpellejant
|                                           |
+------------------------------------------+
|  > [OPCIO A]                              |  <- Botons d'opció
|  > [OPCIO B]                              |     (apareixen quan acaba el text)
|  > [OPCIO C]                              |
+------------------------------------------+
```

---

## 6. AUDIO

- **Música de fons**: Chiptune en bucle (estil NES/C64). Buscar asset lliure a
  OpenGameArt.org o generar amb BeepBox.co
- **SFX selecció**: Bip curt en confirmar opció
- **SFX final bo**: Fanfara pixel art curta
- **SFX final dolent**: So descendent trist (wah-wah)

---

## 7. PASSOS D'IMPLEMENTACIO (ordre d'execució)

### Pas 1 — Configuració del Projecte
- [ ] Configurar resolució: 640×360 (escala ×2 = 1280×720) amb filtre "Nearest"
- [ ] Importar font pixelada
- [ ] Configurar color de fons base

### Pas 2 — Dades de la Història
- [ ] Implementar `StoryNode` i `Choice` com a classes C#
- [ ] Codificar tots els nodes i finals a `StoryData.cs`
- [ ] Verificar que l'arbre és coherent (tots els camins porten a un final)

### Pas 3 — Escena GameScreen
- [ ] Crear layout UI (Label per text, VBoxContainer per botons)
- [ ] Implementar efecte typewriter (Timer + text progressiu)
- [ ] Mostrar botons d'opció quan acaba el typewriter
- [ ] Connectar botons al GameManager

### Pas 4 — Escena EndScreen
- [ ] Pantalla de final amb el text del final
- [ ] Indicador visual BO / DOLENT (color, icona)
- [ ] Botó "Torna a intentar-ho, perdedor" → reinici

### Pas 5 — GameManager
- [ ] Lògica de navegació entre nodes
- [ ] Gestió d'estat de la partida actual

### Pas 6 — Estètica Visual
- [ ] Shader de scanlines
- [ ] Paleta de colors aplicada a tots els elements UI
- [ ] Animació de cursor parpellejant
- [ ] Flash de pantalla en seleccionar opció

### Pas 7 — Audio
- [ ] Importar/generar música chiptune
- [ ] Afegir SFX de selecció i finals
- [ ] Implementar AudioManager bàsic

### Pas 8 — Poliment i Test
- [ ] Jugar tots els camins i verificar els 10 finals
- [ ] Revisar textos (to irònic consistent)
- [ ] Ajustar velocitat del typewriter
- [ ] Test a resolució 1280×720

---

## 8. FITES (Milestones)

| Fita | Contingut | Estat |
|------|-----------|-------|
| M1 | Arbre de decisions funcional (sense estètica) | ⬜ Pendent |
| M2 | UI pixelada + typewriter effect | ⬜ Pendent |
| M3 | Tots els 10 finals implementats | ⬜ Pendent |
| M4 | Shader CRT + paleta de colors | ⬜ Pendent |
| M5 | Audio integrat | ⬜ Pendent |
| M6 | Joc complet i jugable | ⬜ Pendent |

---

*"El millor tresor és la mort que trobes pel camí."*
*— En Baldiri, aventurer de 3a categoria (llicència caducada)*
