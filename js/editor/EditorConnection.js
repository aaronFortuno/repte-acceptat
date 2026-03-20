/**
 * EditorConnection — Representació visual de connexions (fletxes) entre nodes
 * al canvas SVG de l'editor d'aventures.
 *
 * Gestiona:
 *   - Dibuix de paths bezier corbats entre ports de sortida i entrades de nodes
 *   - Etiquetes editables sobre cada connexió
 *   - Selecció i eliminació de connexions
 *   - Interacció de drag-to-connect (arrossegar des d'un port de sortida)
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';

// Nombre màxim de connexions de sortida per node
const MAX_OUTGOING = 4;

class EditorConnection {
  /**
   * Crea una connexió visual entre dos nodes.
   * @param {object} connectionData — { id, fromNodeId, toNodeId, label }
   * @param {SVGGElement} connectionsGroupEl — Grup SVG <g> on afegir la connexió
   * @param {function} getNodeVisual — Funció(nodeId) => EditorNode (per obtenir posicions)
   */
  constructor(connectionData, connectionsGroupEl, getNodeVisual) {
    this._id = connectionData.id;
    this._fromNodeId = connectionData.fromNodeId;
    this._toNodeId = connectionData.toNodeId;
    this._label = connectionData.label || '';
    this._connectionsGroupEl = connectionsGroupEl;
    this._getNodeVisual = getNodeVisual;
    this._selected = false;

    // Handlers lligats
    this._onPathClick = this._handlePathClick.bind(this);
    this._onLabelClick = this._handleLabelClick.bind(this);
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onNodeMoved = this._handleNodeMoved.bind(this);

    this._createElement();
    this._attachEvents();
  }

  /** Retorna l'identificador de la connexió */
  get id() { return this._id; }

  /** Retorna l'ID del node origen */
  get fromNodeId() { return this._fromNodeId; }

  /** Retorna l'ID del node destí */
  get toNodeId() { return this._toNodeId; }

  // ─── Construcció del DOM SVG ──────────────────────────────

  /** @private — Crea els elements SVG de la connexió */
  _createElement() {
    // Grup contenidor
    this._groupEl = document.createElementNS(SVG_NS, 'g');
    this._groupEl.classList.add('editor-connection');
    this._groupEl.setAttribute('data-connection-id', this._id);

    // Path corbat (bezier cúbic)
    this._pathEl = document.createElementNS(SVG_NS, 'path');
    this._pathEl.classList.add('editor-connection__path');
    this._pathEl.setAttribute('fill', 'none');
    this._pathEl.setAttribute('stroke', '#8af');
    this._pathEl.setAttribute('stroke-width', '2');
    this._pathEl.setAttribute('marker-end', 'url(#editor-arrowhead)');
    this._groupEl.appendChild(this._pathEl);

    // Zona de clic invisible (més ampla) per facilitar la selecció
    this._hitAreaEl = document.createElementNS(SVG_NS, 'path');
    this._hitAreaEl.classList.add('editor-connection__hit-area');
    this._hitAreaEl.setAttribute('fill', 'none');
    this._hitAreaEl.setAttribute('stroke', 'transparent');
    this._hitAreaEl.setAttribute('stroke-width', '12');
    this._hitAreaEl.style.cursor = 'pointer';
    this._groupEl.appendChild(this._hitAreaEl);

    // Fons de l'etiqueta (rect darrere del text)
    this._labelBgEl = document.createElementNS(SVG_NS, 'rect');
    this._labelBgEl.classList.add('editor-connection__label-bg');
    this._labelBgEl.setAttribute('fill', '#1a1a2e');
    this._labelBgEl.setAttribute('stroke', '#334');
    this._labelBgEl.setAttribute('stroke-width', '0.5');
    this._labelBgEl.setAttribute('rx', 3);
    this._labelBgEl.setAttribute('ry', 3);
    this._groupEl.appendChild(this._labelBgEl);

    // Text de l'etiqueta
    this._labelEl = document.createElementNS(SVG_NS, 'text');
    this._labelEl.classList.add('editor-connection__label');
    this._labelEl.setAttribute('text-anchor', 'middle');
    this._labelEl.setAttribute('dominant-baseline', 'central');
    this._labelEl.setAttribute('font-size', '11');
    this._labelEl.setAttribute('fill', '#ccc');
    this._labelEl.style.cursor = 'pointer';
    this._renderLabelTspans(this._label);
    this._groupEl.appendChild(this._labelEl);

    // Dibuixar el path i posicionar l'etiqueta
    this.updatePath();

    // Afegir al DOM
    this._connectionsGroupEl.appendChild(this._groupEl);
  }

  // ─── Càlcul del Path ──────────────────────────────────────

  /**
   * Calcula el string 'd' del path bezier cúbic entre els dos nodes.
   * @returns {{ d: string, midX: number, midY: number }} — Path i punt mig
   */
  _calculatePath() {
    const fromNode = this._getNodeVisual(this._fromNodeId);
    const toNode = this._getNodeVisual(this._toNodeId);

    if (!fromNode || !toNode) {
      return { d: '', midX: 0, midY: 0 };
    }

    const start = fromNode.outputPortCenter;
    const end = toNode.inputCenter;

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const offset = Math.min(100, distance / 3);

    // Punts de control per a la corba bezier cúbica
    const cp1X = start.x + offset;
    const cp1Y = start.y;
    const cp2X = end.x - offset;
    const cp2Y = end.y;

    const d = `M ${start.x},${start.y} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${end.x},${end.y}`;

    // Punt mig de la corba (aproximació amb t=0.5)
    const midX = 0.125 * start.x + 0.375 * cp1X + 0.375 * cp2X + 0.125 * end.x;
    const midY = 0.125 * start.y + 0.375 * cp1Y + 0.375 * cp2Y + 0.125 * end.y;

    return { d, midX, midY };
  }

  /**
   * Recalcula i redibuixa el path de la connexió.
   * Cridar quan els nodes es mouen.
   */
  updatePath() {
    const { d, midX, midY } = this._calculatePath();

    if (!d) return;

    this._pathEl.setAttribute('d', d);
    this._hitAreaEl.setAttribute('d', d);

    // Posicionar l'etiqueta al punt mig
    this._labelEl.setAttribute('x', midX);
    this._labelEl.setAttribute('y', midY);

    // Actualitzar x de cada tspan per centrar-los al punt mig
    const tspans = this._labelEl.querySelectorAll('tspan');
    for (const tspan of tspans) {
      tspan.setAttribute('x', midX);
    }

    // Ajustar el fons de l'etiqueta al voltant del text
    this._updateLabelBackground(midX, midY);
  }

  /**
   * @private — Ajusta el rectangle de fons de l'etiqueta.
   * @param {number} cx — Centre X
   * @param {number} cy — Centre Y
   */
  _updateLabelBackground(cx, cy) {
    const lines = this._wrapText(this._label || '(sense text)');
    const lineHeight = 14;
    const maxLineLen = Math.max(...lines.map(l => l.length));
    const approxWidth = maxLineLen * 6.5 + 12;
    const height = lines.length * lineHeight + 4;

    this._labelBgEl.setAttribute('x', cx - approxWidth / 2);
    this._labelBgEl.setAttribute('y', cy - height / 2);
    this._labelBgEl.setAttribute('width', approxWidth);
    this._labelBgEl.setAttribute('height', height);
  }

  /**
   * @private — Divideix el text en línies per a la visualització multilínia.
   * @param {string} text
   * @param {number} [maxChars=20]
   * @returns {string[]}
   */
  _wrapText(text, maxChars = 20) {
    if (!text || text.length <= maxChars) return [text || ''];
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
      if (currentLine.length + word.length + 1 > maxChars && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  /**
   * @private — Renderitza l'etiqueta amb <tspan> per a suport multilínia.
   * @param {string} text
   */
  _renderLabelTspans(text) {
    // Netejar tspans existents
    while (this._labelEl.firstChild) {
      this._labelEl.removeChild(this._labelEl.firstChild);
    }

    const lines = this._wrapText(text || '(sense text)');
    const lineHeight = 14;
    // Desplaçament vertical per centrar el bloc de línies
    const startDy = -((lines.length - 1) * lineHeight) / 2;

    for (let i = 0; i < lines.length; i++) {
      const tspan = document.createElementNS(SVG_NS, 'tspan');
      tspan.setAttribute('x', this._labelEl.getAttribute('x') || '0');
      tspan.setAttribute('dy', i === 0 ? `${startDy}` : `${lineHeight}`);
      tspan.textContent = lines[i];
      this._labelEl.appendChild(tspan);
    }
  }

  // ─── Selecció ─────────────────────────────────────────────

  /** Marca la connexió com a seleccionada */
  select() {
    this._selected = true;
    this._groupEl.classList.add('editor-connection--selected');
    this._pathEl.setAttribute('stroke', '#ff0');
    this._pathEl.setAttribute('stroke-width', '3');
  }

  /** Desmarca la connexió */
  deselect() {
    this._selected = false;
    this._groupEl.classList.remove('editor-connection--selected');
    this._pathEl.setAttribute('stroke', '#8af');
    this._pathEl.setAttribute('stroke-width', '2');
  }

  // ─── Etiqueta ─────────────────────────────────────────────

  /**
   * Actualitza el text de l'etiqueta.
   * @param {string} newLabel — Nou text
   */
  updateLabel(newLabel) {
    this._label = newLabel;
    this._renderLabelTspans(newLabel);

    // Recalcular fons
    const cx = parseFloat(this._labelEl.getAttribute('x')) || 0;
    const cy = parseFloat(this._labelEl.getAttribute('y')) || 0;
    this._updateLabelBackground(cx, cy);
  }

  // ─── Edició inline de l'etiqueta ──────────────────────────

  /**
   * @private — Obre un camp d'edició inline sobre l'etiqueta.
   */
  _openLabelEditor() {
    // Evitar obrir múltiples editors
    if (this._editingLabel) return;
    this._editingLabel = true;

    const cx = parseFloat(this._labelEl.getAttribute('x')) || 0;
    const cy = parseFloat(this._labelEl.getAttribute('y')) || 0;

    const inputWidth = 140;
    const inputHeight = 22;

    // Crear foreignObject per a l'input
    const fo = document.createElementNS(SVG_NS, 'foreignObject');
    fo.setAttribute('x', cx - inputWidth / 2);
    fo.setAttribute('y', cy - inputHeight / 2);
    fo.setAttribute('width', inputWidth);
    fo.setAttribute('height', inputHeight);

    const input = document.createElementNS(XHTML_NS, 'input');
    input.setAttribute('xmlns', XHTML_NS);
    input.setAttribute('type', 'text');
    input.value = this._label;
    input.style.cssText = `
      width: 100%;
      height: 100%;
      border: 1px solid #8af;
      background: #1a1a2e;
      color: #eee;
      font-family: inherit;
      font-size: 11px;
      text-align: center;
      outline: none;
      padding: 0 4px;
      box-sizing: border-box;
      border-radius: 3px;
    `;

    fo.appendChild(input);
    this._groupEl.appendChild(fo);
    this._editorFoEl = fo;

    // Amagar l'etiqueta i el fons durant l'edició
    this._labelEl.style.display = 'none';
    this._labelBgEl.style.display = 'none';

    // Focus a l'input
    requestAnimationFrame(() => {
      input.focus();
      input.select();
    });

    // Confirmar amb Enter o blur
    const confirm = () => {
      const newLabel = input.value.trim();
      this._finishLabelEdit(newLabel);
    };

    // Cancel·lar amb Escape
    const cancel = () => {
      this._finishLabelEdit(null);
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancel();
      }
      // Evitar que la tecla Delete arribi al handler del canvas
      e.stopPropagation();
    });

    input.addEventListener('blur', () => {
      // Confirmar en perdre el focus
      confirm();
    });

    // Evitar que el clic a l'input propagui
    input.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
  }

  /**
   * @private — Tanca l'editor d'etiqueta i aplica o descarta el canvi.
   * @param {string|null} newLabel — Nou text, o null per cancel·lar
   */
  _finishLabelEdit(newLabel) {
    if (!this._editingLabel) return;
    this._editingLabel = false;

    // Eliminar el foreignObject de l'editor
    if (this._editorFoEl && this._editorFoEl.parentNode) {
      this._editorFoEl.parentNode.removeChild(this._editorFoEl);
    }
    this._editorFoEl = null;

    // Mostrar etiqueta i fons
    this._labelEl.style.display = '';
    this._labelBgEl.style.display = '';

    if (newLabel !== null && newLabel !== this._label) {
      this.updateLabel(newLabel);

      // Notificar l'EditorState del canvi
      document.dispatchEvent(new CustomEvent('editor-connection-label-changed', {
        detail: { connectionId: this._id, label: newLabel }
      }));
    }
  }

  // ─── Events ───────────────────────────────────────────────

  /** @private — Registra els event listeners */
  _attachEvents() {
    this._hitAreaEl.addEventListener('click', this._onPathClick);
    this._pathEl.addEventListener('click', this._onPathClick);
    this._labelEl.addEventListener('click', this._onLabelClick);
    this._labelBgEl.addEventListener('click', this._onLabelClick);
    document.addEventListener('keydown', this._onKeyDown);
    document.addEventListener('node-moved', this._onNodeMoved);
  }

  /** @private — Elimina els event listeners */
  _detachEvents() {
    this._hitAreaEl.removeEventListener('click', this._onPathClick);
    this._pathEl.removeEventListener('click', this._onPathClick);
    this._labelEl.removeEventListener('click', this._onLabelClick);
    this._labelBgEl.removeEventListener('click', this._onLabelClick);
    document.removeEventListener('keydown', this._onKeyDown);
    document.removeEventListener('node-moved', this._onNodeMoved);
  }

  /** @private — Clic al path: seleccionar la connexió */
  _handlePathClick(e) {
    e.stopPropagation();

    // Deseleccionar tot primer
    document.dispatchEvent(new CustomEvent('editor-connection-select-requested', {
      detail: { connectionId: this._id }
    }));
  }

  /** @private — Clic a l'etiqueta: obrir editor inline */
  _handleLabelClick(e) {
    e.stopPropagation();

    // Seleccionar la connexió si no ho està
    if (!this._selected) {
      document.dispatchEvent(new CustomEvent('editor-connection-select-requested', {
        detail: { connectionId: this._id }
      }));
    }

    this._openLabelEditor();
  }

  /** @private — Teclat: Delete per eliminar la connexió seleccionada */
  _handleKeyDown(e) {
    if (!this._selected) return;

    // Ignorar si el focus és a un input/textarea
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
      return;
    }

    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      e.stopPropagation();

      document.dispatchEvent(new CustomEvent('editor-connection-delete-requested', {
        detail: { connectionId: this._id }
      }));
    }
  }

  /** @private — Un node s'ha mogut: recalcular el path */
  _handleNodeMoved(e) {
    const { nodeId } = e.detail;
    if (nodeId === this._fromNodeId || nodeId === this._toNodeId) {
      this.updatePath();
    }
  }

  // ─── Destrucció ───────────────────────────────────────────

  /** Elimina la connexió del DOM i allibera recursos */
  destroy() {
    this._detachEvents();

    if (this._groupEl && this._groupEl.parentNode) {
      this._groupEl.parentNode.removeChild(this._groupEl);
    }
    this._groupEl = null;
    this._pathEl = null;
    this._hitAreaEl = null;
    this._labelEl = null;
    this._labelBgEl = null;
  }

  // ─── Drag-to-connect (estàtic) ────────────────────────────

  /**
   * Inicialitza els listeners globals per a la interacció de drag-to-connect.
   * Cridar una sola vegada durant la inicialització del canvas.
   *
   * @param {SVGElement} svgEl — Element SVG del canvas
   * @param {SVGGElement} connectionsGroupEl — Grup SVG de connexions
   * @param {EditorState} editorState — Instància d'EditorState
   * @param {function} getNodeVisual — Funció(nodeId) => EditorNode
   */
  static initDragHandler(svgEl, connectionsGroupEl, editorState, getNodeVisual) {
    let dragging = false;
    let sourceNodeId = null;
    let startX = 0;
    let startY = 0;
    let previewPath = null;

    /**
     * Converteix coordenades de pantalla a coordenades SVG.
     */
    function screenToSVG(clientX, clientY) {
      const rect = svgEl.getBoundingClientRect();
      const viewBox = svgEl.viewBox.baseVal;
      const relX = (clientX - rect.left) / rect.width;
      const relY = (clientY - rect.top) / rect.height;
      return {
        x: viewBox.x + relX * viewBox.width,
        y: viewBox.y + relY * viewBox.height
      };
    }

    /**
     * Calcula un path bezier des d'un punt d'inici a un punt final.
     */
    function calcPreviewPath(sx, sy, ex, ey) {
      const dx = ex - sx;
      const dy = ey - sy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const offset = Math.min(100, distance / 3);
      return `M ${sx},${sy} C ${sx + offset},${sy} ${ex - offset},${ey} ${ex},${ey}`;
    }

    /**
     * Troba el node destí sota el cursor.
     * @returns {string|null} — ID del node o null
     */
    function findTargetNode(clientX, clientY) {
      const elements = document.elementsFromPoint(clientX, clientY);
      for (const el of elements) {
        // Buscar un ancestre amb classe 'editor-node-group'
        const nodeGroup = el.closest('.editor-node-group');
        if (nodeGroup) {
          return nodeGroup.getAttribute('data-node-id');
        }
      }
      return null;
    }

    /**
     * Handler per a l'inici del drag des d'un port de sortida.
     */
    function onPortDragStart(e) {
      const { nodeId, portX, portY } = e.detail;

      // Verificar que el node no és final
      const nodeData = editorState.getNode(nodeId);
      if (!nodeData || nodeData.isEnding) return;

      // Verificar que no supera el màxim de connexions
      const outgoing = editorState.getOutgoingConnections(nodeId);
      if (outgoing.length >= MAX_OUTGOING) return;

      dragging = true;
      sourceNodeId = nodeId;
      startX = portX;
      startY = portY;

      // Crear path de previsualització
      previewPath = document.createElementNS(SVG_NS, 'path');
      previewPath.classList.add('editor-connection--preview');
      previewPath.setAttribute('fill', 'none');
      previewPath.setAttribute('stroke', '#8af');
      previewPath.setAttribute('stroke-width', '2');
      previewPath.setAttribute('stroke-dasharray', '6 4');
      previewPath.setAttribute('opacity', '0.6');
      previewPath.setAttribute('d', calcPreviewPath(startX, startY, startX, startY));
      connectionsGroupEl.appendChild(previewPath);

      // Registrar listeners de moviment i final
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    }

    /**
     * Handler de moviment durant el drag.
     */
    function onDragMove(e) {
      if (!dragging || !previewPath) return;

      const svgCoords = screenToSVG(e.clientX, e.clientY);
      const d = calcPreviewPath(startX, startY, svgCoords.x, svgCoords.y);
      previewPath.setAttribute('d', d);
    }

    /**
     * Handler de final del drag.
     */
    function onDragEnd(e) {
      if (!dragging) return;

      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);

      // Eliminar la previsualització
      if (previewPath && previewPath.parentNode) {
        previewPath.parentNode.removeChild(previewPath);
      }
      previewPath = null;

      // Buscar node destí
      const targetNodeId = findTargetNode(e.clientX, e.clientY);

      if (targetNodeId && targetNodeId !== sourceNodeId) {
        // Intentar crear la connexió a l'EditorState
        try {
          editorState.addConnection(sourceNodeId, targetNodeId, '');
        } catch (err) {
          // Validació fallida (node final, màxim connexions, etc.)
          console.warn('[EditorConnection] No s\'ha pogut crear la connexió:', err.message);
        }
      }

      dragging = false;
      sourceNodeId = null;
    }

    // Escoltar l'event d'inici de drag des d'un port
    document.addEventListener('editor-canvas-port-drag-start', onPortDragStart);

    // Retornar funció de cleanup per a poder destruir els listeners
    return function cleanup() {
      document.removeEventListener('editor-canvas-port-drag-start', onPortDragStart);
      document.removeEventListener('mousemove', onDragMove);
      document.removeEventListener('mouseup', onDragEnd);
      if (previewPath && previewPath.parentNode) {
        previewPath.parentNode.removeChild(previewPath);
      }
    };
  }
}

export default EditorConnection;
