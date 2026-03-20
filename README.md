# Aventures Textuals Retro

Motor d'aventures textuals estil anys 70-80 per a navegador web, disponible a [http://aaronfortuno.github.io/repte-acceptat/](aquí).

Tria la teva aventura, pren decisions i descobreix finals absurds, tràgics o —amb molta sort— victoriosos.

## Característiques

- Estètica retro CRT amb font pixelada i efectes scanline
- Efecte typewriter configurable (text lletra a lletra)
- Múltiples aventures independents carregades des de fitxers JSON
- Mode clar / fosc
- Música chiptune i efectes sonors (activables/desactivables)
- Navegació per teclat i ratolí
- Responsive (mòbil, tauleta, escriptori)
- Sense base de dades ni emmagatzematge de dades d'usuari

## Aventures Disponibles

| Aventura | Descripció | Finals |
|----------|------------|--------|
| Quest 404: El Tresor del Drac Pàgic | Ets en Baldiri, aventurer de 3a categoria amb una llicència caducada i un mapa trobat en un got de cervesa. | 10 (9 desastrosos + 1 bo) |

## Tecnologia

- HTML5 / CSS3 / JavaScript vanilla (ES6+)
- Sense frameworks ni dependències externes
- Allotjat a GitHub Pages
- Dades narratives en format JSON

## Executar en Local

```bash
# Clonar el repositori
git clone <url-del-repo>
cd repte-acceptat

# Servir amb qualsevol servidor HTTP estàtic
npx serve .
# o bé
python -m http.server 8000
```

Obrir `http://localhost:8000` al navegador.

## Afegir una Nova Aventura

1. Crear un fitxer JSON a `stories/` seguint el format documentat a `ARCHITECTURE.md`
2. Registrar l'aventura al manifest `stories/manifest.json`
3. L'aventura apareixerà automàticament al menú de selecció

## Estructura del Projecte

Veure `ARCHITECTURE.md` per a la documentació completa de l'arquitectura.

## Llicència

MIT
