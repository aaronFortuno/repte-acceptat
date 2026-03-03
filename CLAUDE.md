# CLAUDE.md — Instruccions per a l'Agent de Desenvolupament

## Context del Projecte

Motor d'aventures textuals retro (estil anys 70-80) per a web, allotjat a GitHub Pages.
Stack: HTML5 + CSS3 + JavaScript vanilla (ES6+ amb mòduls). Zero dependències externes.
No hi ha base de dades ni emmagatzematge de dades d'usuari (localStorage només per preferències).

## Fitxers de Referència Obligatoris

Abans de fer qualsevol canvi, llegir:
- `ARCHITECTURE.md` — Estructura de carpetes, format JSON, components, flux
- `PLAN.md` — Fases de desenvolupament i estat actual
- `EXEMPLE1.md` — Aventura de referència per a tests

## Regles de Desenvolupament

### Organització del Treball

1. **Regla de 3 fitxers**: Si una tasca requereix canvis a **més de 3 fitxers**, ATURA el procés. Descompon la tasca en subtasques més petites i executa-les seqüencialment.
2. **Un commit per tasca**: Cada tasca completada ha de resultar en un commit amb missatge descriptiu en català.
3. **Commit i push en acabar**: En acabar una sessió de treball, fer sempre commit i push dels canvis.

### Actualització de Documentació

4. **ARCHITECTURE.md**: Actualitzar SEMPRE que hi hagi canvis substancials (nous fitxers, nous mètodes públics, canvi d'estructura de carpetes, canvi de format JSON).
5. **PLAN.md**: Marcar tasques completades (canviar `[ ]` per `[x]`) quan es finalitzi un lliurable.
6. **README.md**: Actualitzar si s'afegeix una nova aventura o canvia la forma d'executar el projecte.

### Tests

7. **Tests obligatoris**: Cada component del motor (`js/engine/`) ha de tenir tests unitaris a `tests/`.
8. **Verificar tests**: Executar TOTS els tests després de cada canvi i ABANS de fer commit. No fer commit si hi ha tests fallant.
9. **Tests d'aventures**: Cada fitxer JSON d'aventura ha de passar validació automàtica:
   - Tots els nodes referenciats existeixen
   - Tots els camins porten a un node final
   - No hi ha nodes orfes (no referenciats des de cap altre node ni com a startNode)
   - Cada node té `choices` XOR `isEnding: true`
10. **Executar tests**: Obrir `tests/test-runner.html` en un navegador, o usar un servidor local amb `npx serve .` i navegar a `/tests/test-runner.html`.

### Codi

11. **Mòduls ES6**: Usar `import`/`export` (type="module" a l'HTML). No usar require/CommonJS.
12. **Sense dependències**: No instal·lar npm packages ni CDNs externs (excepció: Google Fonts per a la tipografia).
13. **Responsabilitat única**: Cada fitxer/classe té una sola responsabilitat. No barrejar lògica de motor amb UI.
14. **DOM**: No manipular DOM directament des dels fitxers d'engine. Només els fitxers de `js/ui/` toquen el DOM.
15. **Sense globals**: No usar variables globals (`window.xxx`). Comunicar via imports, events (`CustomEvent`) o injecció.

### Estil de Codi

16. **Idioma del codi**: Noms de variables, funcions i classes en **anglès**. Comentaris i documentació en **català**.
17. **Format**: 2 espais d'indentació, semicolons obligatoris, cometes simples per a strings JS.
18. **CSS**: Usar custom properties (`--var-name`) per a tot valor que variï entre temes o sigui reutilitzat.

### Git

19. **Branques**: Treballar a `main` per ara. Crear branca només si es fa un canvi experimental gran.
20. **Commits**: Format `[fase] descripció curta` — ex: `[fase1] Implementa StoryEngine amb navegació de nodes`
21. **No cometre**: Mai cometre fitxers generats, secrets, o `.DS_Store`/`Thumbs.db`.

## Ordre de Prioritats

En cas de conflicte, prioritzar en aquest ordre:
1. **Funcionalitat correcta** — El joc ha de funcionar
2. **Tests verds** — Els tests han de passar
3. **Documentació actualitzada** — ARCHITECTURE.md ha de reflectir l'estat real
4. **Estètica** — L'aspecte visual és important però secundari

## Com Afegir una Nova Aventura

1. Crear `stories/nova-aventura.json` seguint el format a ARCHITECTURE.md
2. Afegir entrada a `stories/manifest.json`
3. Executar tests de validació per assegurar coherència de l'arbre
4. L'aventura apareixerà automàticament al menú

## Servidor de Desenvolupament

```bash
# Opció 1: npx serve
npx serve . -p 8000

# Opció 2: Python
python -m http.server 8000

# Opció 3: PHP
php -S localhost:8000
```

Navegador: `http://localhost:8000`
Tests: `http://localhost:8000/tests/test-runner.html`
