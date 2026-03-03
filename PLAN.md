# PLAN.md — Motor d'Aventures Textuals Web

## Visió General

Motor d'aventures textuals estil anys 70-80 per a navegador web, allotjat a GitHub Pages.
Cada aventura es defineix en un fitxer JSON independent. El motor és genèric i reutilitzable.

---

## Fase 0 — Fonaments (Infraestructura)

- [x] Inicialitzar repositori Git amb estructura de carpetes
- [x] Crear `index.html` amb estructura base semàntica
- [x] Crear `css/main.css` amb variables CSS per tematització (clar/fosc)
- [x] Crear `css/crt.css` amb efectes visuals retro (scanlines, glow)
- [x] Crear font pixelada (Google Fonts: "Press Start 2P")
- [ ] Verificar que la pàgina es carrega correctament en local

**Lliurable**: Pàgina en blanc amb estètica retro i font pixelada.

---

## Fase 1 — Motor de Joc (Engine)

- [x] `js/engine/StoryEngine.js` — Carrega JSON, gestiona estat, navega nodes
- [x] `js/engine/TypewriterEffect.js` — Efecte d'escriptura lletra a lletra
- [x] `js/engine/AudioManager.js` — Reproducció de música i SFX (Web Audio API)
- [x] `js/engine/SettingsManager.js` — Preferències (localStorage només per settings)
- [x] Tests unitaris per a StoryEngine (navegació, finals, camins)

**Lliurable**: Motor funcional que pot carregar i recórrer qualsevol aventura JSON.

---

## Fase 2 — Interfície d'Usuari

- [x] Pantalla de títol / splash screen amb animació retro
- [x] Menú principal: Triar aventura, Opcions, Crèdits
- [x] Pantalla d'opcions: música on/off, SFX on/off, mode clar/fosc, typewriter on/off
- [x] Pantalla de joc: àrea de text + botons d'opció
- [x] Pantalla de final: missatge + botó reiniciar / tornar al menú
- [x] Transicions entre pantalles (fade in/out)

**Lliurable**: UI completa i navegable amb totes les pantalles.

---

## Fase 3 — Primera Aventura (Quest 404)

- [ ] Crear `stories/quest404.json` amb tots els nodes i finals d'EXEMPLE1.md
- [ ] Adaptar textos i to irònic al format JSON
- [ ] Verificar manualment tots els 10 finals (9 dolents + 1 bo)
- [ ] Tests automatitzats: tots els camins porten a un final

**Lliurable**: Aventura "Quest 404" completament jugable.

---

## Fase 4 — Audio

- [ ] Música chiptune de fons en bucle (assets lliures o generats amb BeepBox)
- [ ] SFX: selecció d'opció, final bo, final dolent, typewriter tick
- [ ] Integrar amb AudioManager i respectar settings de l'usuari
- [ ] Botó mute/unmute accessible a la UI de joc

**Lliurable**: Experiència sonora completa.

---

## Fase 5 — Poliment i Desplegament

- [ ] Responsive design (mòbil, tauleta, escriptori)
- [ ] Accessibilitat bàsica (aria-labels, navegació per teclat, contrast)
- [ ] Optimització de càrrega (assets mínims, lazy loading d'àudio)
- [ ] Configurar GitHub Pages (branca `main`, carpeta arrel)
- [ ] Test cross-browser (Chrome, Firefox, Safari)
- [ ] README actualitzat amb URL de GitHub Pages

**Lliurable**: Joc publicat i accessible a GitHub Pages.

---

## Fase 6 — Extensibilitat (Futur)

- [ ] Documentar format JSON per a noves aventures
- [ ] Sistema de metadades per aventura (títol, autor, dificultat, descripció)
- [ ] Suport per a imatges opcionals als nodes
- [ ] Sistema de desbloqueig de finals (tracking local)
- [ ] Localització (i18n) per a interfície en múltiples idiomes

---

## Principis Tècnics

1. **Zero dependències externes** — HTML/CSS/JS vanilla, sense frameworks ni bundlers
2. **Data-driven** — Tota la narrativa viu en fitxers JSON, el motor no conté contingut
3. **Sense BD ni dades d'usuari** — localStorage només per preferències de UI
4. **Modular** — Cada component en el seu fitxer, responsabilitat única
5. **Testable** — Tests unitaris per al motor, tests d'integració per als camins narratius
