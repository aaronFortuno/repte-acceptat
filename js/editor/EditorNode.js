/**
 * EditorNode — Representació visual d'un node al canvas SVG.
 *
 * Cada node és un <g> SVG que conté:
 *   - <rect> de fons amb vora de color segons tipus
 *   - <foreignObject> amb textarea editable per al text
 *   - Indicador de tipus (normal/final) i startNode
 *   - Port de sortida (cercle a la dreta) per a connexions
 *   - Botó d'eliminar (×)
 *   - Tirador de redimensionament a la cantonada inferior dreta
 *
 * Emet CustomEvents: node-moved, node-text-changed,
 * node-delete-requested, node-port-drag-start, node-resized.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const XHTML_NS = 'http://www.w3.org/1999/xhtml';

// Dimensions per defecte del node
const NODE_WIDTH = 280;
const NODE_MIN_HEIGHT = 120;
const PORT_RADIUS = 7;
const DELETE_BTN_SIZE = 18;
const HEADER_HEIGHT = 22;

class EditorNode {
  /**
   * Crea un nou node visual.
   * @param {object} params
   * @param {string} params.id — Identificador únic del node
   * @param {number} params.x — Posició X al canvas
   * @param {number} params.y — Posició Y al canvas
   * @param {string} params.text — Text narratiu del node
   * @param {boolean} params.isEnding — Si és un node final
   * @param {string|null} params.endingType — 'good' | 'bad' | null
   * @param {string|null} params.endingTitle — Títol del final
   * @param {boolean} params.isStart — Si és el node inicial
   * @param {SVGElement} svgEl — Element SVG pare on afegir el node
   */
  constructor({ id, x, y, text, isEnding, endingType, endingTitle, isStart }, svgEl) {
    this._id = id;
    this._x = x;
    this._y = y;
    this._text = text || '';
    this._isEnding = !!isEnding;
    this._endingType = endingType || null;
    this._endingTitle = endingTitle || null;
    this._isStart = !!isStart;
    this._svgEl = svgEl;
    this._selected = false;
    this._height = NODE_MIN_HEIGHT;
    this._width = NODE_WIDTH;
    this._warningMsg = null;

    // Trobar l'SVG arrel per al càlcul de coordenades
    this._rootSvgEl = svgEl;
    while (this._rootSvgEl && this._rootSvgEl.tagName !== 'svg') {
      this._rootSvgEl = this._rootSvgEl.parentElement || this._rootSvgEl.parentNode;
    }

    // Estat de drag
    this._dragging = false;
    this._dragStartX = 0;
    this._dragStartY = 0;
    this._dragNodeStartX = 0;
    this._dragNodeStartY = 0;

    // Handlers lligats (per poder-los treure)
    this._onMouseMove = this._handleMouseMove.bind(this);
    this._onMouseUp = this._handleMouseUp.bind(this);
    this._onResizeMove = this._handleResizeMove.bind(this);
    this._onResizeUp = this._handleResizeUp.bind(this);

    this._createElement();
  }

  /** Retorna l'identificador del node */
  get id() { return this._id; }

  /** Retorna la posició X */
  get x() { return this._x; }

  /** Retorna la posició Y */
  get y() { return this._y; }

  /** Retorna l'amplada del node */
  get width() { return this._width; }

  /** Retorna l'alçada actual del node */
  get height() { return this._height; }

  /** Retorna el centre del port de sortida (per dibuixar connexions) */
  get outputPortCenter() {
    return {
      x: this._x + this._width,
      y: this._y + this._height / 2
    };
  }

  /** Retorna el punt d'entrada (costat esquerre, per a connexions entrants) */
  get inputCenter() {
    return {
      x: this._x,
      y: this._y + this._height / 2
    };
  }

  /**
   * Actualitza la posició del node.
   * @param {number} x
   * @param {number} y
   */
  updatePosition(x, y) {
    this._x = x;
    this._y = y;
    this._groupEl.setAttribute('transform', `translate(${x}, ${y})`);
  }

  /**
   * Actualitza les propietats visuals del node.
   * @param {object} nodeData — Dades parcials o completes del node
   */
  updateVisuals(nodeData) {
    if (nodeData.text !== undefined) {
      this._text = nodeData.text;
      if (this._textareaEl && this._textareaEl.value !== nodeData.text) {
        this._textareaEl.value = nodeData.text;
      }
    }
    if (nodeData.isEnding !== undefined) {
      this._isEnding = nodeData.isEnding;
    }
    if (nodeData.endingType !== undefined) {
      this._endingType = nodeData.endingType;
    }
    if (nodeData.endingTitle !== undefined) {
      this._endingTitle = nodeData.endingTitle;
    }
    if (nodeData.isStart !== undefined) {
      this._isStart = nodeData.isStart;
    }

    this._applyStyles();
    this._updateTypeIndicator();
    this._updateStartIndicator();
    this._updatePortVisibility();
  }

  /** Marca el node com a seleccionat */
  select() {
    this._selected = true;
    this._rectEl.classList.add('editor-node--selected');
  }

  /** Desmarca el node */
  deselect() {
    this._selected = false;
    this._rectEl.classList.remove('editor-node--selected');
  }

  /**
   * Mostra un avís visual al node.
   * @param {string} msg — Missatge d'avís
   */
  showWarning(msg) {
    this._warningMsg = msg;
    if (this._warningEl) {
      this._warningEl.textContent = msg;
      this._warningEl.style.display = 'block';
    }
  }

  /** Amaga l'avís visual */
  clearWarning() {
    this._warningMsg = null;
    if (this._warningEl) {
      this._warningEl.style.display = 'none';
    }
  }

  /** Elimina el node del DOM i allibera recursos */
  destroy() {
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('mousemove', this._onResizeMove);
    document.removeEventListener('mouseup', this._onResizeUp);

    if (this._groupEl && this._groupEl.parentNode) {
      this._groupEl.parentNode.removeChild(this._groupEl);
    }
    this._groupEl = null;
  }

  // ─── Construcció del DOM SVG ──────────────────────────────

  /** @private — Crea tots els elements SVG del node */
  _createElement() {
    // Grup principal
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('transform', `translate(${this._x}, ${this._y})`);
    g.setAttribute('data-node-id', this._id);
    g.classList.add('editor-node-group');
    this._groupEl = g;

    // Rectangle de fons
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('width', NODE_WIDTH);
    rect.setAttribute('height', NODE_MIN_HEIGHT);
    rect.setAttribute('rx', 6);
    rect.setAttribute('ry', 6);
    rect.classList.add('editor-node__bg');
    this._rectEl = rect;
    g.appendChild(rect);

    // Indicador de startNode (estrella)
    const startIndicator = document.createElementNS(SVG_NS, 'text');
    startIndicator.setAttribute('x', 8);
    startIndicator.setAttribute('y', HEADER_HEIGHT - 5);
    startIndicator.setAttribute('font-size', '14');
    startIndicator.classList.add('editor-node__start-indicator');
    startIndicator.textContent = '\u2605'; // ★
    this._startIndicatorEl = startIndicator;
    g.appendChild(startIndicator);

    // Indicador de tipus (normal/final)
    const typeIndicator = document.createElementNS(SVG_NS, 'text');
    typeIndicator.setAttribute('x', NODE_WIDTH - 8);
    typeIndicator.setAttribute('y', HEADER_HEIGHT - 5);
    typeIndicator.setAttribute('text-anchor', 'end');
    typeIndicator.setAttribute('font-size', '10');
    typeIndicator.classList.add('editor-node__type-indicator');
    this._typeIndicatorEl = typeIndicator;
    g.appendChild(typeIndicator);

    // ID del node (petit, a la capçalera)
    const idLabel = document.createElementNS(SVG_NS, 'text');
    idLabel.setAttribute('x', this._isStart ? 24 : 8);
    idLabel.setAttribute('y', HEADER_HEIGHT - 5);
    idLabel.setAttribute('font-size', '9');
    idLabel.setAttribute('fill', '#8888aa');
    idLabel.classList.add('editor-node__id-label');
    idLabel.textContent = this._id;
    this._idLabelEl = idLabel;
    g.appendChild(idLabel);

    // Línia separadora sota la capçalera
    const headerLine = document.createElementNS(SVG_NS, 'line');
    headerLine.setAttribute('x1', 0);
    headerLine.setAttribute('y1', HEADER_HEIGHT);
    headerLine.setAttribute('x2', NODE_WIDTH);
    headerLine.setAttribute('y2', HEADER_HEIGHT);
    headerLine.setAttribute('stroke', 'rgba(255,255,255,0.15)');
    headerLine.classList.add('editor-node__header-line');
    this._headerLineEl = headerLine;
    g.appendChild(headerLine);

    // ForeignObject per al textarea editable
    const fo = document.createElementNS(SVG_NS, 'foreignObject');
    fo.setAttribute('x', 4);
    fo.setAttribute('y', HEADER_HEIGHT + 4);
    fo.setAttribute('width', NODE_WIDTH - 8);
    fo.setAttribute('height', NODE_MIN_HEIGHT - HEADER_HEIGHT - 8);
    this._foreignObjectEl = fo;

    const textarea = document.createElementNS(XHTML_NS, 'textarea');
    textarea.setAttribute('xmlns', XHTML_NS);
    textarea.className = 'editor-node__textarea';
    textarea.value = this._text;
    textarea.placeholder = 'Text del node...';
    textarea.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      color: #c8c8e0;
      font-family: inherit;
      font-size: 12px;
      resize: none;
      outline: none;
      padding: 2px;
      box-sizing: border-box;
      overflow: hidden;
    `;
    this._textareaEl = textarea;
    fo.appendChild(textarea);
    g.appendChild(fo);

    // Avís visual (sota el node)
    const warningFo = document.createElementNS(SVG_NS, 'foreignObject');
    warningFo.setAttribute('x', 0);
    warningFo.setAttribute('y', NODE_MIN_HEIGHT + 2);
    warningFo.setAttribute('width', NODE_WIDTH);
    warningFo.setAttribute('height', 20);

    const warningDiv = document.createElementNS(XHTML_NS, 'div');
    warningDiv.setAttribute('xmlns', XHTML_NS);
    warningDiv.className = 'editor-node__warning';
    warningDiv.style.cssText = `
      font-size: 10px;
      color: #ff6;
      text-align: center;
      display: none;
    `;
    this._warningEl = warningDiv;
    warningFo.appendChild(warningDiv);
    g.appendChild(warningFo);

    // Port de sortida (cercle a la dreta)
    const outputPort = document.createElementNS(SVG_NS, 'circle');
    outputPort.setAttribute('cx', NODE_WIDTH);
    outputPort.setAttribute('cy', NODE_MIN_HEIGHT / 2);
    outputPort.setAttribute('r', PORT_RADIUS);
    outputPort.setAttribute('fill', '#334');
    outputPort.setAttribute('stroke', '#6af');
    outputPort.classList.add('editor-node__output-port');
    this._outputPortEl = outputPort;
    g.appendChild(outputPort);

    // Tirador de redimensionament (cantonada inferior dreta)
    const resizeHandle = document.createElementNS(SVG_NS, 'rect');
    resizeHandle.setAttribute('width', 12);
    resizeHandle.setAttribute('height', 12);
    resizeHandle.setAttribute('rx', 2);
    resizeHandle.setAttribute('ry', 2);
    resizeHandle.classList.add('editor-node__resize-handle');
    this._resizeHandleEl = resizeHandle;
    g.appendChild(resizeHandle);

    // Botó d'eliminar (×) a la cantonada superior dreta
    const deleteBtnG = document.createElementNS(SVG_NS, 'g');
    deleteBtnG.classList.add('editor-node__delete-btn');
    deleteBtnG.setAttribute('transform',
      `translate(${NODE_WIDTH - DELETE_BTN_SIZE / 2 + 4}, ${-DELETE_BTN_SIZE / 2 + 4})`);

    const deleteBg = document.createElementNS(SVG_NS, 'circle');
    deleteBg.setAttribute('cx', 0);
    deleteBg.setAttribute('cy', 0);
    deleteBg.setAttribute('r', DELETE_BTN_SIZE / 2);
    deleteBg.setAttribute('fill', 'rgba(0,0,0,0.5)');
    deleteBg.classList.add('editor-node__delete-bg');
    deleteBtnG.appendChild(deleteBg);

    const deleteX = document.createElementNS(SVG_NS, 'text');
    deleteX.setAttribute('x', 0);
    deleteX.setAttribute('y', 0);
    deleteX.setAttribute('text-anchor', 'middle');
    deleteX.setAttribute('dominant-baseline', 'central');
    deleteX.setAttribute('font-size', '12');
    deleteX.setAttribute('fill', '#ff4444');
    deleteX.classList.add('editor-node__delete-x');
    deleteX.textContent = '\u00d7'; // ×
    deleteBtnG.appendChild(deleteX);

    this._deleteBtnEl = deleteBtnG;
    g.appendChild(deleteBtnG);

    // Aplicar estils inicials
    this._applyStyles();
    this._updateTypeIndicator();
    this._updateStartIndicator();
    this._updatePortVisibility();
    this._updateResizeHandle();

    // Registrar events
    this._attachEvents();

    // Afegir al SVG pare
    this._svgEl.appendChild(g);

    // Ajustar alçada inicial segons el text
    this._adjustHeight();
  }

  /** @private — Aplica estils visuals segons l'estat del node */
  _applyStyles() {
    const rect = this._rectEl;

    // Netejar classes de tipus
    rect.classList.remove(
      'editor-node--normal',
      'editor-node--ending-good',
      'editor-node--ending-bad',
      'editor-node--start'
    );

    if (this._isEnding) {
      if (this._endingType === 'good') {
        rect.classList.add('editor-node--ending-good');
      } else {
        rect.classList.add('editor-node--ending-bad');
      }
    } else {
      rect.classList.add('editor-node--normal');
    }

    // Vora especial per startNode
    if (this._isStart) {
      rect.classList.add('editor-node--start');
    }
  }

  /** @private — Actualitza l'indicador de tipus (text) */
  _updateTypeIndicator() {
    if (this._isEnding) {
      const label = this._endingType === 'good' ? 'FI \u2713' : 'FI \u2717';
      this._typeIndicatorEl.textContent = label;
      this._typeIndicatorEl.setAttribute('fill',
        this._endingType === 'good' ? '#4a4' : '#c44');
    } else {
      this._typeIndicatorEl.textContent = '';
    }
  }

  /** @private — Actualitza la visibilitat de l'indicador startNode */
  _updateStartIndicator() {
    this._startIndicatorEl.style.display = this._isStart ? 'block' : 'none';
    this._startIndicatorEl.setAttribute('fill', '#fd0');

    // Ajustar posició de l'etiqueta ID
    this._idLabelEl.setAttribute('x', this._isStart ? 24 : 8);
  }

  /** @private — Amaga el port de sortida si és un node final */
  _updatePortVisibility() {
    this._outputPortEl.style.display = this._isEnding ? 'none' : 'block';
  }

  /** @private — Posiciona el tirador de redimensionament */
  _updateResizeHandle() {
    if (!this._resizeHandleEl) return;
    this._resizeHandleEl.setAttribute('x', this._width - 12);
    this._resizeHandleEl.setAttribute('y', this._height - 12);
  }

  /** @private — Ajusta l'alçada del node al contingut del textarea */
  _adjustHeight() {
    if (!this._textareaEl) return;

    // Calcular alçada necessària basant-se en el text
    const lineHeight = 16;
    const lines = Math.max(1, (this._text.match(/\n/g) || []).length + 1);
    const textHeight = Math.max(lines * lineHeight, 40);
    const totalHeight = Math.max(NODE_MIN_HEIGHT, HEADER_HEIGHT + textHeight + 12);

    this._height = totalHeight;

    // Actualitzar elements
    this._rectEl.setAttribute('height', totalHeight);
    this._foreignObjectEl.setAttribute('height', totalHeight - HEADER_HEIGHT - 8);
    this._outputPortEl.setAttribute('cy', totalHeight / 2);

    // Reposicionar avís
    const warningFo = this._warningEl?.closest('foreignObject');
    if (warningFo) {
      warningFo.setAttribute('y', totalHeight + 2);
    }

    // Actualitzar tirador de redimensionament
    this._updateResizeHandle();
  }

  /** @private — Aplica les dimensions actuals a tots els elements del node */
  _applySize() {
    this._rectEl.setAttribute('width', this._width);
    this._rectEl.setAttribute('height', this._height);
    this._foreignObjectEl.setAttribute('width', this._width - 8);
    this._foreignObjectEl.setAttribute('height', this._height - HEADER_HEIGHT - 8);
    this._outputPortEl.setAttribute('cx', this._width);
    this._outputPortEl.setAttribute('cy', this._height / 2);
    if (this._headerLineEl) {
      this._headerLineEl.setAttribute('x2', this._width);
    }
    this._updateResizeHandle();

    // Reposicionar avís
    const warningFo = this._warningEl?.closest('foreignObject');
    if (warningFo) {
      warningFo.setAttribute('y', this._height + 2);
      warningFo.setAttribute('width', this._width);
    }

    // Reposicionar botó d'eliminar
    if (this._deleteBtnEl) {
      this._deleteBtnEl.setAttribute('transform',
        `translate(${this._width - DELETE_BTN_SIZE / 2 + 4}, ${-DELETE_BTN_SIZE / 2 + 4})`);
    }

    // Reposicionar indicador de tipus
    if (this._typeIndicatorEl) {
      this._typeIndicatorEl.setAttribute('x', this._width - 8);
    }

    // Redibuixar connexions
    this._dispatchEvent('node-moved', {
      nodeId: this._id,
      x: this._x,
      y: this._y
    });
  }

  // ─── Events ───────────────────────────────────────────────

  /** @private — Registra els event listeners */
  _attachEvents() {
    const g = this._groupEl;

    // Drag: mousedown al rectangle o al grup (però no al textarea ni al port)
    this._rectEl.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      this._startDrag(e);
    });

    // Textarea: canvi de text
    this._textareaEl.addEventListener('input', () => {
      this._text = this._textareaEl.value;
      this._adjustHeight();
      this._dispatchEvent('node-text-changed', {
        nodeId: this._id,
        text: this._text
      });
    });

    // Evitar que el drag s'activi quan es clica al textarea
    this._textareaEl.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });

    // Botó d'eliminar
    this._deleteBtnEl.addEventListener('mousedown', (e) => {
      e.stopPropagation();
    });
    this._deleteBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this._dispatchEvent('node-delete-requested', { nodeId: this._id });
    });

    // Port de sortida: inici de connexió
    this._outputPortEl.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      if (e.button !== 0) return;
      this._dispatchEvent('node-port-drag-start', {
        nodeId: this._id,
        portX: this._x + this._width,
        portY: this._y + this._height / 2,
        mouseEvent: e
      });
    });

    // Selecció: clic al grup
    g.addEventListener('mousedown', () => {
      this._dispatchEvent('node-select-requested', { nodeId: this._id });
    });

    // Redimensionament
    this._resizing = false;
    this._resizeStartX = 0;
    this._resizeStartY = 0;
    this._resizeStartWidth = 0;
    this._resizeStartHeight = 0;

    this._resizeHandleEl.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      if (e.button !== 0) return;
      this._resizing = true;
      this._resizeStartX = e.clientX;
      this._resizeStartY = e.clientY;
      this._resizeStartWidth = this._width;
      this._resizeStartHeight = this._height;
      document.addEventListener('mousemove', this._onResizeMove);
      document.addEventListener('mouseup', this._onResizeUp);
      e.preventDefault();
    });
  }

  /** @private — Inicia el drag del node */
  _startDrag(e) {
    this._dragging = true;
    this._dragStartX = e.clientX;
    this._dragStartY = e.clientY;
    this._dragNodeStartX = this._x;
    this._dragNodeStartY = this._y;

    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    e.preventDefault();
  }

  /** @private — Gestiona el moviment durant el drag */
  _handleMouseMove(e) {
    if (!this._dragging) return;

    let dx = e.clientX - this._dragStartX;
    let dy = e.clientY - this._dragStartY;

    // Compensar el zoom amb l'SVG arrel
    if (this._rootSvgEl) {
      const svgRect = this._rootSvgEl.getBoundingClientRect();
      const viewBox = this._rootSvgEl.viewBox.baseVal;
      const scaleX = viewBox.width / svgRect.width;
      const scaleY = viewBox.height / svgRect.height;
      dx *= scaleX;
      dy *= scaleY;
    }

    const newX = this._dragNodeStartX + dx;
    const newY = this._dragNodeStartY + dy;

    this.updatePosition(newX, newY);

    this._dispatchEvent('node-moved', {
      nodeId: this._id,
      x: newX,
      y: newY
    });
  }

  /** @private — Finalitza el drag */
  _handleMouseUp() {
    if (!this._dragging) return;
    this._dragging = false;

    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
  }

  /** @private — Gestiona el moviment durant el redimensionament */
  _handleResizeMove(e) {
    if (!this._resizing) return;

    let dx = e.clientX - this._resizeStartX;
    let dy = e.clientY - this._resizeStartY;

    // Compensar el zoom amb l'SVG arrel
    if (this._rootSvgEl) {
      const svgRect = this._rootSvgEl.getBoundingClientRect();
      const viewBox = this._rootSvgEl.viewBox.baseVal;
      const scaleX = viewBox.width / svgRect.width;
      const scaleY = viewBox.height / svgRect.height;
      dx *= scaleX;
      dy *= scaleY;
    }

    this._width = Math.max(180, this._resizeStartWidth + dx);
    this._height = Math.max(80, this._resizeStartHeight + dy);
    this._applySize();

    this._dispatchEvent('node-resized', {
      nodeId: this._id,
      width: this._width,
      height: this._height
    });
  }

  /** @private — Finalitza el redimensionament */
  _handleResizeUp() {
    if (!this._resizing) return;
    this._resizing = false;

    document.removeEventListener('mousemove', this._onResizeMove);
    document.removeEventListener('mouseup', this._onResizeUp);
  }

  /**
   * @private — Emet un CustomEvent al document.
   * @param {string} name — Nom de l'event
   * @param {object} detail — Dades de l'event
   */
  _dispatchEvent(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
  }
}

export default EditorNode;
