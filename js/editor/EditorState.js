/**
 * EditorState.js — Gestor d'estat centralitzat per a l'editor visual d'aventures.
 *
 * Gestiona: metadades, nodes, connexions, startNodeId, selecció, dirty flag.
 * Proporciona undo/redo amb snapshots (límit ~50 passos).
 * Emet CustomEvents quan l'estat canvia perquè el canvas pugui reaccionar.
 */

// Comptador intern per generar IDs únics
let _idCounter = 0;

/**
 * Genera un identificador únic.
 * @param {string} prefix - 'node' o 'conn'
 * @returns {string}
 */
function generateId(prefix) {
  _idCounter += 1;
  return `${prefix}-${Date.now()}-${_idCounter}`;
}

/**
 * Crea una còpia profunda d'un objecte serialitzable.
 * @param {*} obj
 * @returns {*}
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Nombre màxim de passos d'undo/redo
const MAX_HISTORY = 50;

// Nombre màxim de connexions de sortida per node
const MAX_OUTGOING = 4;

/**
 * Metadades per defecte d'una aventura nova.
 */
function defaultMetadata() {
  return {
    id: '',
    title: '',
    author: '',
    description: '',
    difficulty: 'easy',
    language: 'ca'
  };
}

/**
 * Estat buit inicial.
 */
function emptyState() {
  return {
    metadata: defaultMetadata(),
    startNodeId: null,
    nodes: {},
    connections: {}
  };
}

class EditorState {
  /**
   * Crea una instància d'EditorState.
   * @param {EventTarget} [eventTarget=document] - On es disparen els events.
   */
  constructor(eventTarget) {
    this._eventTarget = eventTarget || document;
    this._state = emptyState();
    this._selectedId = null;       // id del node o connexió seleccionat
    this._dirty = false;           // indica si hi ha canvis sense guardar

    // Pila d'undo/redo
    this._undoStack = [];
    this._redoStack = [];
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  /**
   * Emet un CustomEvent amb detalls opcionals.
   * @param {string} name - Nom de l'event (ex: 'state:change')
   * @param {object} [detail={}]
   */
  _emit(name, detail = {}) {
    this._eventTarget.dispatchEvent(
      new CustomEvent(name, { detail })
    );
  }

  // ---------------------------------------------------------------------------
  // Historial (undo / redo)
  // ---------------------------------------------------------------------------

  /**
   * Guarda un snapshot de l'estat actual a la pila d'undo.
   * Buida la pila de redo (qualsevol futur alternatiu es descarta).
   */
  _pushUndo() {
    this._undoStack.push(deepClone(this._state));
    if (this._undoStack.length > MAX_HISTORY) {
      this._undoStack.shift();
    }
    this._redoStack = [];
  }

  /**
   * Desfà l'últim canvi.
   * @returns {boolean} true si s'ha desfet alguna cosa
   */
  undo() {
    if (this._undoStack.length === 0) return false;
    this._redoStack.push(deepClone(this._state));
    if (this._redoStack.length > MAX_HISTORY) {
      this._redoStack.shift();
    }
    this._state = this._undoStack.pop();
    this._dirty = true;
    this._emit('state:change', { action: 'undo' });
    return true;
  }

  /**
   * Refà l'últim canvi desfet.
   * @returns {boolean} true si s'ha refet alguna cosa
   */
  redo() {
    if (this._redoStack.length === 0) return false;
    this._undoStack.push(deepClone(this._state));
    if (this._undoStack.length > MAX_HISTORY) {
      this._undoStack.shift();
    }
    this._state = this._redoStack.pop();
    this._dirty = true;
    this._emit('state:change', { action: 'redo' });
    return true;
  }

  /**
   * @returns {boolean} Si es pot desfer
   */
  get canUndo() {
    return this._undoStack.length > 0;
  }

  /**
   * @returns {boolean} Si es pot refer
   */
  get canRedo() {
    return this._redoStack.length > 0;
  }

  // ---------------------------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------------------------

  /** @returns {object} Metadades de l'aventura */
  get metadata() {
    return this._state.metadata;
  }

  /** @returns {string|null} ID del node inicial */
  get startNodeId() {
    return this._state.startNodeId;
  }

  /** @returns {object} Diccionari de nodes (keyed by id) */
  get nodes() {
    return this._state.nodes;
  }

  /** @returns {object} Diccionari de connexions (keyed by id) */
  get connections() {
    return this._state.connections;
  }

  /** @returns {string|null} ID de l'element seleccionat */
  get selectedId() {
    return this._selectedId;
  }

  /** @returns {boolean} Si hi ha canvis no guardats */
  get dirty() {
    return this._dirty;
  }

  // ---------------------------------------------------------------------------
  // Metadades
  // ---------------------------------------------------------------------------

  /**
   * Actualitza les metadades de l'aventura (merge parcial).
   * @param {object} partial - Camps a actualitzar
   */
  updateMetadata(partial) {
    this._pushUndo();
    Object.assign(this._state.metadata, partial);
    this._dirty = true;
    this._emit('state:change', { action: 'updateMetadata' });
  }

  // ---------------------------------------------------------------------------
  // Start Node
  // ---------------------------------------------------------------------------

  /**
   * Estableix quin node és l'inici de l'aventura.
   * @param {string} nodeId
   */
  setStartNode(nodeId) {
    if (!this._state.nodes[nodeId]) {
      throw new Error(`Node '${nodeId}' no existeix.`);
    }
    this._pushUndo();
    this._state.startNodeId = nodeId;
    this._dirty = true;
    this._emit('state:change', { action: 'setStartNode', nodeId });
  }

  // ---------------------------------------------------------------------------
  // Selecció
  // ---------------------------------------------------------------------------

  /**
   * Selecciona un node o connexió (o null per deseleccionar).
   * @param {string|null} id
   */
  select(id) {
    const prev = this._selectedId;
    this._selectedId = id;
    this._emit('state:select', { id, previousId: prev });
  }

  /**
   * Deselecciona l'element actual.
   */
  deselect() {
    this.select(null);
  }

  // ---------------------------------------------------------------------------
  // CRUD de Nodes
  // ---------------------------------------------------------------------------

  /**
   * Crea un node nou i el retorna.
   * @param {number} x - Posició X al canvas
   * @param {number} y - Posició Y al canvas
   * @param {object} [opts={}] - Propietats opcionals (text, isEnding, etc.)
   * @returns {object} El node creat
   */
  addNode(x, y, opts = {}) {
    const id = opts.id || generateId('node');
    const node = {
      id,
      x,
      y,
      text: opts.text || '',
      isEnding: opts.isEnding || false,
      endingType: opts.endingType || null,
      endingTitle: opts.endingTitle || null,
      color: opts.color || null
    };

    this._pushUndo();
    this._state.nodes[id] = node;

    // Si és el primer node, el marquem com a startNode automàticament
    if (Object.keys(this._state.nodes).length === 1) {
      this._state.startNodeId = id;
    }

    this._dirty = true;
    this._emit('state:node:add', { node: deepClone(node) });
    this._emit('state:change', { action: 'addNode', nodeId: id });
    return deepClone(node);
  }

  /**
   * Actualitza propietats d'un node existent (merge parcial).
   * @param {string} nodeId
   * @param {object} partial - Camps a actualitzar (x, y, text, isEnding, etc.)
   * @returns {object} El node actualitzat
   */
  updateNode(nodeId, partial) {
    const node = this._state.nodes[nodeId];
    if (!node) {
      throw new Error(`Node '${nodeId}' no existeix.`);
    }

    // Si es marca com a ending, eliminar connexions de sortida existents
    if (partial.isEnding && !node.isEnding) {
      const outgoing = this._getOutgoingConnections(nodeId);
      for (const conn of outgoing) {
        delete this._state.connections[conn.id];
      }
    }

    this._pushUndo();
    Object.assign(node, partial);
    // No permetre canviar l'id
    node.id = nodeId;

    this._dirty = true;
    this._emit('state:node:update', { node: deepClone(node) });
    this._emit('state:change', { action: 'updateNode', nodeId });
    return deepClone(node);
  }

  /**
   * Elimina un node i totes les connexions associades.
   * @param {string} nodeId
   */
  removeNode(nodeId) {
    if (!this._state.nodes[nodeId]) {
      throw new Error(`Node '${nodeId}' no existeix.`);
    }

    this._pushUndo();

    // Eliminar totes les connexions relacionades amb aquest node
    const connIds = Object.keys(this._state.connections);
    const removedConnections = [];
    for (const cid of connIds) {
      const conn = this._state.connections[cid];
      if (conn.fromNodeId === nodeId || conn.toNodeId === nodeId) {
        removedConnections.push(deepClone(conn));
        delete this._state.connections[cid];
      }
    }

    delete this._state.nodes[nodeId];

    // Si era el startNode, netejar la referència
    if (this._state.startNodeId === nodeId) {
      this._state.startNodeId = null;
    }

    // Si estava seleccionat, deseleccionar
    if (this._selectedId === nodeId) {
      this._selectedId = null;
    }

    this._dirty = true;
    this._emit('state:node:remove', { nodeId, removedConnections });
    this._emit('state:change', { action: 'removeNode', nodeId });
  }

  /**
   * Renomena un node canviant el seu ID a tot arreu.
   * Actualitza connexions, startNodeId i selecció.
   * @param {string} oldId — ID actual del node
   * @param {string} newId — Nou ID desitjat
   */
  renameNode(oldId, newId) {
    if (!newId || newId.trim() === '') {
      throw new Error('El nou ID no pot ser buit.');
    }
    if (this._state.nodes[newId]) {
      throw new Error(`Ja existeix un node amb l'ID '${newId}'.`);
    }
    if (!this._state.nodes[oldId]) {
      throw new Error(`El node '${oldId}' no existeix.`);
    }

    this._pushUndo();

    // Copiar el node amb el nou ID
    const nodeData = this._state.nodes[oldId];
    nodeData.id = newId;
    this._state.nodes[newId] = nodeData;
    delete this._state.nodes[oldId];

    // Actualitzar totes les connexions que referenciïn l'antic ID
    for (const conn of Object.values(this._state.connections)) {
      if (conn.fromNodeId === oldId) {
        conn.fromNodeId = newId;
      }
      if (conn.toNodeId === oldId) {
        conn.toNodeId = newId;
      }
    }

    // Actualitzar startNodeId si cal
    if (this._state.startNodeId === oldId) {
      this._state.startNodeId = newId;
    }

    // Actualitzar selecció si cal
    if (this._selectedId === oldId) {
      this._selectedId = newId;
    }

    this._dirty = true;
    this._emit('state:node:rename', { oldId, newId, node: deepClone(nodeData) });
    this._emit('state:change', { action: 'renameNode', oldId, newId });
  }

  /**
   * Retorna un node per id (còpia).
   * @param {string} nodeId
   * @returns {object|null}
   */
  getNode(nodeId) {
    const node = this._state.nodes[nodeId];
    return node ? deepClone(node) : null;
  }

  /**
   * Retorna tots els nodes com a array (còpies).
   * @returns {object[]}
   */
  getAllNodes() {
    return Object.values(this._state.nodes).map(n => deepClone(n));
  }

  // ---------------------------------------------------------------------------
  // CRUD de Connexions
  // ---------------------------------------------------------------------------

  /**
   * Retorna les connexions de sortida d'un node.
   * @param {string} nodeId
   * @returns {object[]}
   */
  _getOutgoingConnections(nodeId) {
    return Object.values(this._state.connections)
      .filter(c => c.fromNodeId === nodeId);
  }

  /**
   * Crea una connexió entre dos nodes.
   * @param {string} fromNodeId - Node origen
   * @param {string} toNodeId - Node destí
   * @param {string} [label=''] - Text de l'opció
   * @param {object} [opts={}] - Propietats opcionals (id)
   * @returns {object} La connexió creada
   */
  addConnection(fromNodeId, toNodeId, label = '', opts = {}) {
    const fromNode = this._state.nodes[fromNodeId];
    const toNode = this._state.nodes[toNodeId];

    if (!fromNode) {
      throw new Error(`Node origen '${fromNodeId}' no existeix.`);
    }
    if (!toNode) {
      throw new Error(`Node destí '${toNodeId}' no existeix.`);
    }

    // Validació: els nodes finals no poden tenir connexions de sortida
    if (fromNode.isEnding) {
      throw new Error(`El node '${fromNodeId}' és un node final i no pot tenir connexions de sortida.`);
    }

    // Validació: màxim 4 connexions de sortida per node
    const outgoing = this._getOutgoingConnections(fromNodeId);
    if (outgoing.length >= MAX_OUTGOING) {
      throw new Error(`El node '${fromNodeId}' ja té ${MAX_OUTGOING} connexions de sortida (màxim permès).`);
    }

    const id = opts.id || generateId('conn');
    const connection = {
      id,
      fromNodeId,
      toNodeId,
      label
    };

    this._pushUndo();
    this._state.connections[id] = connection;

    this._dirty = true;
    this._emit('state:connection:add', { connection: deepClone(connection) });
    this._emit('state:change', { action: 'addConnection', connectionId: id });
    return deepClone(connection);
  }

  /**
   * Actualitza propietats d'una connexió existent (merge parcial).
   * @param {string} connectionId
   * @param {object} partial - Camps a actualitzar (label, etc.)
   * @returns {object} La connexió actualitzada
   */
  updateConnection(connectionId, partial) {
    const conn = this._state.connections[connectionId];
    if (!conn) {
      throw new Error(`Connexió '${connectionId}' no existeix.`);
    }

    this._pushUndo();
    Object.assign(conn, partial);
    // No permetre canviar l'id
    conn.id = connectionId;

    this._dirty = true;
    this._emit('state:connection:update', { connection: deepClone(conn) });
    this._emit('state:change', { action: 'updateConnection', connectionId });
    return deepClone(conn);
  }

  /**
   * Elimina una connexió.
   * @param {string} connectionId
   */
  removeConnection(connectionId) {
    if (!this._state.connections[connectionId]) {
      throw new Error(`Connexió '${connectionId}' no existeix.`);
    }

    this._pushUndo();
    delete this._state.connections[connectionId];

    // Si estava seleccionada, deseleccionar
    if (this._selectedId === connectionId) {
      this._selectedId = null;
    }

    this._dirty = true;
    this._emit('state:connection:remove', { connectionId });
    this._emit('state:change', { action: 'removeConnection', connectionId });
  }

  /**
   * Retorna una connexió per id (còpia).
   * @param {string} connectionId
   * @returns {object|null}
   */
  getConnection(connectionId) {
    const conn = this._state.connections[connectionId];
    return conn ? deepClone(conn) : null;
  }

  /**
   * Retorna totes les connexions com a array (còpies).
   * @returns {object[]}
   */
  getAllConnections() {
    return Object.values(this._state.connections).map(c => deepClone(c));
  }

  /**
   * Retorna les connexions de sortida d'un node (còpies).
   * @param {string} nodeId
   * @returns {object[]}
   */
  getOutgoingConnections(nodeId) {
    return this._getOutgoingConnections(nodeId).map(c => deepClone(c));
  }

  /**
   * Retorna les connexions d'entrada d'un node (còpies).
   * @param {string} nodeId
   * @returns {object[]}
   */
  getIncomingConnections(nodeId) {
    return Object.values(this._state.connections)
      .filter(c => c.toNodeId === nodeId)
      .map(c => deepClone(c));
  }

  // ---------------------------------------------------------------------------
  // Snapshot (per a localStorage / serialització)
  // ---------------------------------------------------------------------------

  /**
   * Retorna un snapshot complet de l'estat (còpia profunda).
   * Inclou selecció i dirty flag.
   * @returns {object}
   */
  getSnapshot() {
    return {
      state: deepClone(this._state),
      selectedId: this._selectedId,
      dirty: this._dirty
    };
  }

  /**
   * Restaura l'estat des d'un snapshot (obtingut amb getSnapshot).
   * Neteja les piles d'undo/redo.
   * @param {object} snapshot
   */
  restoreFromSnapshot(snapshot) {
    if (!snapshot || !snapshot.state) {
      throw new Error('Snapshot invàlid.');
    }
    this._state = deepClone(snapshot.state);
    this._selectedId = snapshot.selectedId || null;
    this._dirty = snapshot.dirty || false;
    this._undoStack = [];
    this._redoStack = [];
    this._emit('state:change', { action: 'restore' });
  }

  // ---------------------------------------------------------------------------
  // Reset / Nou projecte
  // ---------------------------------------------------------------------------

  /**
   * Reinicia l'estat a un projecte buit. Neteja historial.
   */
  reset() {
    this._state = emptyState();
    this._selectedId = null;
    this._dirty = false;
    this._undoStack = [];
    this._redoStack = [];
    this._emit('state:change', { action: 'reset' });
  }

  // ---------------------------------------------------------------------------
  // Dirty flag
  // ---------------------------------------------------------------------------

  /**
   * Marca l'estat com a net (just guardat).
   */
  markClean() {
    this._dirty = false;
  }

  /**
   * Marca l'estat com a modificat.
   */
  markDirty() {
    this._dirty = true;
  }
}

export default EditorState;
