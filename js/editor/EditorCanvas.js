/**
 * EditorCanvas — Canvas SVG principal de l'editor visual.
 *
 * Gestiona:
 *   - Creació i manipulació de l'element SVG amb viewBox
 *   - Pan (arrossegar fons) i zoom (roda del ratolí)
 *   - Creació, eliminació i actualització de nodes visuals (EditorNode)
 *   - Selecció de nodes i gestió del teclat (Delete)
 *   - Doble clic per crear nous nodes
 *   - Conversió de coordenades pantalla ↔ SVG
 */

import EditorNode from './EditorNode.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

// Límits de zoom
const ZOOM_MIN = 0.25;
const ZOOM_MAX = 2.0;
const ZOOM_STEP = 0.1;

// Dimensions inicials del viewBox
const DEFAULT_VIEWBOX_WIDTH = 1200;
const DEFAULT_VIEWBOX_HEIGHT = 800;

class EditorCanvas {
  constructor() {
    this._containerEl = null;
    this._svgEl = null;
    this._editorState = null;

    // Mapa de nodes visuals: nodeId → EditorNode
    this._nodes = new Map();

    // Estat del viewBox (pan/zoom)
    this._viewBox = {
      x: 0,
      y: 0,
      width: DEFAULT_VIEWBOX_WIDTH,
      height: DEFAULT_VIEWBOX_HEIGHT
    };
    this._zoom = 1.0;

    // Estat del pan
    this._panning = false;
    this._panStartX = 0;
    this._panStartY = 0;
    this._panViewBoxStartX = 0;
    this._panViewBoxStartY = 0;

    // Node seleccionat
    this._selectedNodeId = null;

    // Handlers lligats
    this._onMouseDown = this._handleMouseDown.bind(this);
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseUp = this._handleMouseUp.bind(this);
    this._onWheel = this._handleWheel.bind(this);
    this._onDblClick = this._handleDblClick.bind(this);
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onNodeMoved = this._handleNodeMoved.bind(this);
    this._onNodeTextChanged = this._handleNodeTextChanged.bind(this);
    this._onNodeDeleteRequested = this._handleNodeDeleteRequested.bind(this);
    this._onNodeSelectRequested = this._handleNodeSelectRequested.bind(this);
    this._onNodePortDragStart = this._handleNodePortDragStart.bind(this);
    this._onNodeIdChanged = this._handleNodeIdChanged.bind(this);
    this._onNodeColorChanged = this._handleNodeColorChanged.bind(this);
    this._onNodeEndingTypeToggled = this._handleNodeEndingTypeToggled.bind(this);
  }

  /**
   * Inicialitza el canvas dins d'un contenidor HTML.
   * @param {HTMLElement} containerEl — Element contenidor
   * @param {object} editorState — Instància d'EditorState
   */
  init(containerEl, editorState) {
    this._containerEl = containerEl;
    this._editorState = editorState;

    // Crear l'element SVG
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.classList.add('editor-canvas__svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    this._updateViewBox(svg);

    // Quadrícula de fons (patró SVG)
    const defs = document.createElementNS(SVG_NS, 'defs');

    const pattern = document.createElementNS(SVG_NS, 'pattern');
    pattern.setAttribute('id', 'editor-grid');
    pattern.setAttribute('width', 40);
    pattern.setAttribute('height', 40);
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');

    const gridLine1 = document.createElementNS(SVG_NS, 'path');
    gridLine1.setAttribute('d', 'M 40 0 L 0 0 0 40');
    gridLine1.setAttribute('fill', 'none');
    gridLine1.setAttribute('stroke', 'rgba(255,255,255,0.05)');
    gridLine1.setAttribute('stroke-width', '0.5');
    pattern.appendChild(gridLine1);

    defs.appendChild(pattern);

    // Marcador de fletxa per a connexions (per a ús futur)
    const marker = document.createElementNS(SVG_NS, 'marker');
    marker.setAttribute('id', 'editor-arrowhead');
    marker.setAttribute('markerWidth', 10);
    marker.setAttribute('markerHeight', 7);
    marker.setAttribute('refX', 10);
    marker.setAttribute('refY', 3.5);
    marker.setAttribute('orient', 'auto');
    const arrowPath = document.createElementNS(SVG_NS, 'polygon');
    arrowPath.setAttribute('points', '0 0, 10 3.5, 0 7');
    arrowPath.setAttribute('fill', '#8af');
    marker.appendChild(arrowPath);
    defs.appendChild(marker);

    svg.appendChild(defs);

    // Rectangle de fons amb quadrícula
    const bgRect = document.createElementNS(SVG_NS, 'rect');
    bgRect.setAttribute('x', -10000);
    bgRect.setAttribute('y', -10000);
    bgRect.setAttribute('width', 20000);
    bgRect.setAttribute('height', 20000);
    bgRect.setAttribute('fill', 'url(#editor-grid)');
    bgRect.classList.add('editor-canvas__bg');
    svg.appendChild(bgRect);

    // Grup per a connexions (sota els nodes)
    this._connectionsGroupEl = document.createElementNS(SVG_NS, 'g');
    this._connectionsGroupEl.classList.add('editor-canvas__connections');
    svg.appendChild(this._connectionsGroupEl);

    // Grup per a nodes (sobre les connexions)
    this._nodesGroupEl = document.createElementNS(SVG_NS, 'g');
    this._nodesGroupEl.classList.add('editor-canvas__nodes');
    svg.appendChild(this._nodesGroupEl);

    this._svgEl = svg;
    containerEl.appendChild(svg);

    // Registrar events
    this._attachEvents();

    // Escoltar canvis d'estat (si EditorState emet events)
    this._attachStateListeners();
  }

  /**
   * Afegeix un node visual al canvas.
   * @param {object} nodeData — Dades del node (id, x, y, text, isEnding, etc.)
   * @returns {EditorNode} — La instància creada
   */
  addNode(nodeData) {
    if (this._nodes.has(nodeData.id)) {
      this.updateNode(nodeData);
      return this._nodes.get(nodeData.id);
    }

    const node = new EditorNode(nodeData, this._nodesGroupEl);
    this._nodes.set(nodeData.id, node);
    return node;
  }

  /**
   * Elimina un node visual del canvas.
   * @param {string} nodeId — Identificador del node
   */
  removeNode(nodeId) {
    const node = this._nodes.get(nodeId);
    if (!node) return;

    if (this._selectedNodeId === nodeId) {
      this._selectedNodeId = null;
    }

    node.destroy();
    this._nodes.delete(nodeId);
  }

  /**
   * Actualitza les propietats visuals d'un node.
   * @param {object} nodeData — Dades del node (ha de contenir id)
   */
  updateNode(nodeData) {
    const node = this._nodes.get(nodeData.id);
    if (!node) return;

    if (nodeData.x !== undefined && nodeData.y !== undefined) {
      node.updatePosition(nodeData.x, nodeData.y);
    }
    node.updateVisuals(nodeData);
  }

  /**
   * Converteix coordenades de pantalla (mouse event) a coordenades SVG.
   * @param {number} screenX — Coordenada X de pantalla
   * @param {number} screenY — Coordenada Y de pantalla
   * @returns {{ x: number, y: number }} — Coordenades SVG
   */
  screenToSVGCoords(screenX, screenY) {
    const svgRect = this._svgEl.getBoundingClientRect();

    // Posició relativa dins l'SVG (0-1)
    const relX = (screenX - svgRect.left) / svgRect.width;
    const relY = (screenY - svgRect.top) / svgRect.height;

    // Convertir a coordenades del viewBox
    return {
      x: this._viewBox.x + relX * this._viewBox.width,
      y: this._viewBox.y + relY * this._viewBox.height
    };
  }

  /** Retorna l'element SVG del canvas */
  get svgElement() { return this._svgEl; }

  /** Retorna el Map de nodes visuals */
  get nodes() { return this._nodes; }

  /** Retorna l'ID del node seleccionat (o null) */
  get selectedNodeId() { return this._selectedNodeId; }

  /** Retorna el grup SVG de connexions (per a EditorConnection) */
  get connectionsGroup() { return this._connectionsGroupEl; }

  /** Destrueix el canvas i allibera recursos */
  destroy() {
    this._detachEvents();

    // Destruir tots els nodes
    for (const node of this._nodes.values()) {
      node.destroy();
    }
    this._nodes.clear();

    if (this._svgEl && this._svgEl.parentNode) {
      this._svgEl.parentNode.removeChild(this._svgEl);
    }
    this._svgEl = null;
    this._containerEl = null;
    this._editorState = null;
  }

  // ─── ViewBox i Zoom ───────────────────────────────────────

  /** @private — Actualitza l'atribut viewBox de l'SVG */
  _updateViewBox(svgEl) {
    const svg = svgEl || this._svgEl;
    if (!svg) return;
    const { x, y, width, height } = this._viewBox;
    svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
  }

  /** @private — Aplica un canvi de zoom centrat en un punt */
  _applyZoom(newZoom, centerX, centerY) {
    const clampedZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));
    if (clampedZoom === this._zoom) return;

    // Coordenades SVG del punt de focus
    const svgPoint = this.screenToSVGCoords(centerX, centerY);

    const oldZoom = this._zoom;
    this._zoom = clampedZoom;

    // Calcular noves dimensions del viewBox
    const newWidth = DEFAULT_VIEWBOX_WIDTH / clampedZoom;
    const newHeight = DEFAULT_VIEWBOX_HEIGHT / clampedZoom;

    // Mantenir el punt de focus en la mateixa posició de pantalla
    const ratio = 1 - (oldZoom / clampedZoom);
    this._viewBox.x += (svgPoint.x - this._viewBox.x) * ratio;
    this._viewBox.y += (svgPoint.y - this._viewBox.y) * ratio;
    this._viewBox.width = newWidth;
    this._viewBox.height = newHeight;

    this._updateViewBox();
  }

  /** Zoom in un pas */
  zoomIn() {
    const centerX = this._containerEl.clientWidth / 2;
    const centerY = this._containerEl.clientHeight / 2;
    this._applyZoom(this._zoom + 0.15, centerX, centerY);
  }

  /** Zoom out un pas */
  zoomOut() {
    const centerX = this._containerEl.clientWidth / 2;
    const centerY = this._containerEl.clientHeight / 2;
    this._applyZoom(this._zoom - 0.15, centerX, centerY);
  }

  /** Reset zoom a 100% */
  zoomReset() {
    this._zoom = 1.0;
    this._viewBox.width = DEFAULT_VIEWBOX_WIDTH;
    this._viewBox.height = DEFAULT_VIEWBOX_HEIGHT;
    this._viewBox.x = 0;
    this._viewBox.y = 0;
    this._updateViewBox();
  }

  /** Zoom per encabir tots els nodes */
  zoomToFit(nodes) {
    if (!nodes || nodes.length === 0) {
      this.zoomReset();
      return;
    }

    // Trobar el bounding box de tots els nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const node of nodes) {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + 280); // amplada aprox. del node
      maxY = Math.max(maxY, node.y + 120); // alçada aprox. del node
    }

    // Afegir marge
    const margin = 100;
    minX -= margin;
    minY -= margin;
    maxX += margin;
    maxY += margin;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Calcular zoom necessari
    const containerRect = this._containerEl.getBoundingClientRect();
    const scaleX = containerRect.width / contentWidth;
    const scaleY = containerRect.height / contentHeight;
    const newZoom = Math.min(scaleX, scaleY, 2.0);
    const clampedZoom = Math.max(0.25, Math.min(2.0, newZoom));

    this._zoom = clampedZoom;
    this._viewBox.x = minX;
    this._viewBox.y = minY;
    this._viewBox.width = containerRect.width / clampedZoom;
    this._viewBox.height = containerRect.height / clampedZoom;
    this._updateViewBox();
  }

  // ─── Events del Canvas ────────────────────────────────────

  /** @private — Registra tots els event listeners */
  _attachEvents() {
    this._svgEl.addEventListener('mousedown', this._onMouseDown);
    this._svgEl.addEventListener('wheel', this._onWheel, { passive: false });
    this._svgEl.addEventListener('dblclick', this._onDblClick);
    document.addEventListener('keydown', this._onKeyDown);

    // Events dels nodes (via document, CustomEvent)
    document.addEventListener('node-moved', this._onNodeMoved);
    document.addEventListener('node-text-changed', this._onNodeTextChanged);
    document.addEventListener('node-delete-requested', this._onNodeDeleteRequested);
    document.addEventListener('node-select-requested', this._onNodeSelectRequested);
    document.addEventListener('node-port-drag-start', this._onNodePortDragStart);
    document.addEventListener('node-id-changed', this._onNodeIdChanged);
    document.addEventListener('node-color-changed', this._onNodeColorChanged);
    document.addEventListener('node-ending-type-toggled', this._onNodeEndingTypeToggled);
  }

  /** @private — Elimina tots els event listeners */
  _detachEvents() {
    if (this._svgEl) {
      this._svgEl.removeEventListener('mousedown', this._onMouseDown);
      this._svgEl.removeEventListener('wheel', this._onWheel);
      this._svgEl.removeEventListener('dblclick', this._onDblClick);
    }
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('node-moved', this._onNodeMoved);
    document.removeEventListener('node-text-changed', this._onNodeTextChanged);
    document.removeEventListener('node-delete-requested', this._onNodeDeleteRequested);
    document.removeEventListener('node-select-requested', this._onNodeSelectRequested);
    document.removeEventListener('node-port-drag-start', this._onNodePortDragStart);
    document.removeEventListener('node-id-changed', this._onNodeIdChanged);
    document.removeEventListener('node-color-changed', this._onNodeColorChanged);
    document.removeEventListener('node-ending-type-toggled', this._onNodeEndingTypeToggled);
  }

  /** @private — Escolta events d'EditorState per sincronitzar visuals */
  _attachStateListeners() {
    if (!this._editorState) return;
    const target = this._editorState._eventTarget || document;

    // Nodes: sincronitzar visuals quan l'estat canvia
    target.addEventListener('state:node:add', (e) => {
      this.addNode(e.detail.node);
    });
    target.addEventListener('state:node:remove', (e) => {
      this.removeNode(e.detail.nodeId);
    });
    target.addEventListener('state:node:update', (e) => {
      this.updateNode(e.detail.node);
    });

    // Connexions: gestió delegada a EditorScreen (capa d'integració),
    // però escoltem els events per evitar errors si cal reaccionar en el futur.
    target.addEventListener('state:connection:add', (e) => {
      // Gestionat per EditorScreen
    });
    target.addEventListener('state:connection:remove', (e) => {
      // Gestionat per EditorScreen
    });
  }

  /**
   * @private — Mousedown al canvas: iniciar pan si es clica al fons,
   * o deseleccionar si no es clica cap node.
   */
  _handleMouseDown(e) {
    if (e.button !== 0) return;

    // Comprovar si el clic és directament al fons (no a un node)
    const target = e.target;
    const isBackground = target === this._svgEl
      || target.classList.contains('editor-canvas__bg')
      || target === this._connectionsGroupEl;

    if (isBackground) {
      // Deseleccionar qualsevol node
      this._deselectAll();

      // Iniciar pan
      this._panning = true;
      this._panStartX = e.clientX;
      this._panStartY = e.clientY;
      this._panViewBoxStartX = this._viewBox.x;
      this._panViewBoxStartY = this._viewBox.y;

      document.addEventListener('mousemove', this._onMouseMove);
      document.addEventListener('mouseup', this._onMouseUp);
      e.preventDefault();
    }
  }

  /** @private — Mousemove: actualitzar pan si està actiu */
  _handleMouseMove(e) {
    if (!this._panning) return;

    const svgRect = this._svgEl.getBoundingClientRect();
    const scaleX = this._viewBox.width / svgRect.width;
    const scaleY = this._viewBox.height / svgRect.height;

    const dx = (e.clientX - this._panStartX) * scaleX;
    const dy = (e.clientY - this._panStartY) * scaleY;

    this._viewBox.x = this._panViewBoxStartX - dx;
    this._viewBox.y = this._panViewBoxStartY - dy;

    this._updateViewBox();
  }

  /** @private — Mouseup: finalitzar pan */
  _handleMouseUp() {
    this._panning = false;
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
  }

  /** @private — Wheel: zoom in/out */
  _handleWheel(e) {
    e.preventDefault();

    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = this._zoom + delta;
    this._applyZoom(newZoom, e.clientX, e.clientY);
  }

  /** @private — Doble clic al fons: crear nou node */
  _handleDblClick(e) {
    // Només si es clica al fons
    const target = e.target;
    const isBackground = target === this._svgEl
      || target.classList.contains('editor-canvas__bg');

    if (!isBackground) return;

    const coords = this.screenToSVGCoords(e.clientX, e.clientY);

    // Emetre event perquè EditorState creï el node
    document.dispatchEvent(new CustomEvent('editor-canvas-create-node', {
      detail: { x: coords.x, y: coords.y }
    }));
  }

  /** @private — Teclat: Delete per eliminar node seleccionat */
  _handleKeyDown(e) {
    // Ignorar si el focus és a un input/textarea (edició de text)
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this._selectedNodeId) {
        document.dispatchEvent(new CustomEvent('node-delete-requested', {
          detail: { nodeId: this._selectedNodeId }
        }));
      }
    }
  }

  // ─── Gestió de la selecció ────────────────────────────────

  /** @private — Deselecciona tots els nodes */
  _deselectAll() {
    if (this._selectedNodeId) {
      const prevNode = this._nodes.get(this._selectedNodeId);
      if (prevNode) prevNode.deselect();
      this._selectedNodeId = null;
    }
  }

  /** @private — Selecciona un node i deselecciona els altres */
  _selectNode(nodeId) {
    this._deselectAll();
    const node = this._nodes.get(nodeId);
    if (node) {
      node.select();
      this._selectedNodeId = nodeId;
    }
  }

  // ─── Handlers d'events de nodes ───────────────────────────

  /** @private — Un node s'ha mogut */
  _handleNodeMoved(e) {
    const { nodeId, x, y } = e.detail;
    if (this._editorState && typeof this._editorState.updateNode === 'function') {
      this._editorState.updateNode(nodeId, { x, y });
    }
  }

  /** @private — El text d'un node ha canviat */
  _handleNodeTextChanged(e) {
    const { nodeId, text } = e.detail;
    if (this._editorState && typeof this._editorState.updateNode === 'function') {
      this._editorState.updateNode(nodeId, { text });
    }
  }

  /** @private — S'ha demanat eliminar un node */
  _handleNodeDeleteRequested(e) {
    const { nodeId } = e.detail;
    if (this._editorState && typeof this._editorState.removeNode === 'function') {
      this._editorState.removeNode(nodeId);
    }
  }

  /** @private — S'ha clicat un node per seleccionar-lo */
  _handleNodeSelectRequested(e) {
    const { nodeId } = e.detail;
    this._selectNode(nodeId);
  }

  /** @private — S'ha iniciat un drag des d'un port de sortida */
  _handleNodePortDragStart(e) {
    // Emetre event per a EditorConnection (fase E2)
    document.dispatchEvent(new CustomEvent('editor-canvas-port-drag-start', {
      detail: e.detail
    }));
  }

  /** @private — S'ha canviat l'ID d'un node */
  _handleNodeIdChanged(e) {
    const { nodeId: oldId, newId } = e.detail;
    if (!this._editorState || !this._nodes.has(oldId)) return;

    try {
      // Renomenar a l'estat
      this._editorState.renameNode(oldId, newId);

      // Actualitzar el Map del canvas
      const editorNode = this._nodes.get(oldId);
      this._nodes.delete(oldId);
      editorNode.id = newId;
      this._nodes.set(newId, editorNode);

      // Actualitzar selecció del canvas
      if (this._selectedNodeId === oldId) {
        this._selectedNodeId = newId;
      }
    } catch (err) {
      console.warn('[EditorCanvas] Error renomenant node:', err.message);
      // Restaurar el text de l'etiqueta a l'ID original
      const editorNode = this._nodes.get(oldId);
      if (editorNode) {
        editorNode.id = oldId;
      }
    }
  }

  /** @private — S'ha canviat el color d'un node */
  _handleNodeColorChanged(e) {
    const { nodeId, color } = e.detail;
    if (!this._editorState) return;

    try {
      this._editorState.updateNode(nodeId, { color });
    } catch (err) {
      console.warn('[EditorCanvas] Error actualitzant color:', err.message);
    }
  }

  /** @private — S'ha alternat el tipus de final d'un node (good/bad) */
  _handleNodeEndingTypeToggled(e) {
    const { nodeId, endingType } = e.detail;
    if (!this._editorState) return;

    try {
      this._editorState.updateNode(nodeId, { endingType });
    } catch (err) {
      console.warn('[EditorCanvas] Error alternant endingType:', err.message);
    }
  }
}

export default EditorCanvas;
