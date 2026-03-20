/**
 * EditorSerializer.js — Conversió entre l'estat intern de l'editor i el format JSON del motor.
 *
 * Mètodes principals:
 *   serialize(editorState)       → objecte JSON compatible amb StoryEngine
 *   deserialize(json)            → snapshot compatible amb EditorState.restoreFromSnapshot()
 *   toDownloadableJSON(state)    → string JSON formatejat
 *   downloadAsFile(state, name?) → dispara descàrrega al navegador
 *   importFromFile()             → Promise<snapshot>
 *   validate(editorState)        → array de {type, message, nodeId?}
 */

// Constants per al layout automàtic durant la deserialització
const COLUMN_GAP = 450;   // més espai horitzontal per veure etiquetes de connexions
const ROW_GAP = 200;      // més espai vertical entre nodes
const ORIGIN_X = 80;      // marge esquerre inicial
const ORIGIN_Y = 80;      // marge superior inicial

/**
 * Genera un ID únic per a connexions reconstruïdes.
 * @param {number} index
 * @returns {string}
 */
function connId(index) {
  return `conn-imported-${index}`;
}

const EditorSerializer = {

  // ---------------------------------------------------------------------------
  // serialize: EditorState → JSON del motor
  // ---------------------------------------------------------------------------

  /**
   * Converteix l'estat de l'editor al format JSON que consumeix StoryEngine.
   * @param {import('./EditorState.js').default} editorState
   * @returns {object} JSON compatible amb el motor d'aventures
   */
  serialize(editorState) {
    const { metadata, startNodeId, nodes, connections } = editorState;

    // Agrupar connexions per node origen
    const outgoing = {};
    for (const conn of Object.values(connections)) {
      if (!outgoing[conn.fromNodeId]) {
        outgoing[conn.fromNodeId] = [];
      }
      outgoing[conn.fromNodeId].push(conn);
    }

    // Construir el mapa de nodes pel motor
    const engineNodes = {};
    for (const node of Object.values(nodes)) {
      const engineNode = { text: node.text };

      if (node.isEnding) {
        // Nodes finals: propietats d'ending, sense choices
        engineNode.isEnding = true;
        if (node.endingType) {
          engineNode.endingType = node.endingType;
        }
        if (node.endingTitle) {
          engineNode.endingTitle = node.endingTitle;
        }
      } else {
        // Nodes normals: choices construïdes des de les connexions
        const nodeConnections = outgoing[node.id] || [];
        engineNode.choices = nodeConnections.map(c => ({
          label: c.label,
          nextNode: c.toNodeId
        }));
      }

      engineNodes[node.id] = engineNode;
    }

    // Construir l'objecte final
    const result = {};
    if (metadata.id) result.id = metadata.id;
    if (metadata.title) result.title = metadata.title;
    if (metadata.author) result.author = metadata.author;
    if (metadata.description) result.description = metadata.description;
    if (metadata.difficulty) result.difficulty = metadata.difficulty;
    if (metadata.language) result.language = metadata.language;
    result.startNode = startNodeId;
    result.nodes = engineNodes;

    return result;
  },

  // ---------------------------------------------------------------------------
  // deserialize: JSON del motor → snapshot per a EditorState
  // ---------------------------------------------------------------------------

  /**
   * Converteix un JSON del motor a un snapshot compatible amb EditorState.restoreFromSnapshot().
   * Calcula posicions automàtiques amb BFS des del startNode.
   * @param {object} json - Objecte JSON del format StoryEngine
   * @returns {object} Snapshot: { state: { metadata, startNodeId, nodes, connections }, selectedId, dirty }
   */
  deserialize(json) {
    const metadata = {
      id: json.id || '',
      title: json.title || '',
      author: json.author || '',
      description: json.description || '',
      difficulty: json.difficulty || 'easy',
      language: json.language || 'ca'
    };

    const startNodeId = json.startNode || null;
    const jsonNodes = json.nodes || {};
    const allNodeIds = Object.keys(jsonNodes);

    // Calcular posicions amb BFS des del startNode
    const positions = this._autoLayout(jsonNodes, startNodeId);

    // Construir nodes de l'editor
    const editorNodes = {};
    for (const nodeId of allNodeIds) {
      const jn = jsonNodes[nodeId];
      const pos = positions[nodeId] || { x: ORIGIN_X, y: ORIGIN_Y };
      editorNodes[nodeId] = {
        id: nodeId,
        x: pos.x,
        y: pos.y,
        text: jn.text || '',
        isEnding: jn.isEnding || false,
        endingType: jn.endingType || null,
        endingTitle: jn.endingTitle || null
      };
    }

    // Reconstruir connexions des dels choices
    const editorConnections = {};
    let connIndex = 0;
    for (const nodeId of allNodeIds) {
      const jn = jsonNodes[nodeId];
      if (jn.choices && Array.isArray(jn.choices)) {
        for (const choice of jn.choices) {
          const id = connId(connIndex++);
          editorConnections[id] = {
            id,
            fromNodeId: nodeId,
            toNodeId: choice.nextNode,
            label: choice.label || ''
          };
        }
      }
    }

    return {
      state: {
        metadata,
        startNodeId,
        nodes: editorNodes,
        connections: editorConnections
      },
      selectedId: null,
      dirty: false
    };
  },

  // ---------------------------------------------------------------------------
  // Auto-layout: BFS per assignar posicions (x, y) als nodes
  // ---------------------------------------------------------------------------

  /**
   * Calcula les posicions dels nodes fent BFS des del startNode.
   * Distribueix nodes per columnes (profunditat) i files dins de cada columna.
   * @param {object} jsonNodes - Mapa de nodes del JSON
   * @param {string|null} startNodeId
   * @returns {object} Mapa nodeId → { x, y }
   * @private
   */
  _autoLayout(jsonNodes, startNodeId) {
    const allNodeIds = Object.keys(jsonNodes);
    const positions = {};

    if (allNodeIds.length === 0) return positions;

    // BFS per assignar profunditats
    const depth = {};
    const visited = new Set();
    const queue = [];

    if (startNodeId && jsonNodes[startNodeId]) {
      queue.push(startNodeId);
      visited.add(startNodeId);
      depth[startNodeId] = 0;
    }

    while (queue.length > 0) {
      const current = queue.shift();
      const node = jsonNodes[current];
      if (node.choices && Array.isArray(node.choices)) {
        for (const choice of node.choices) {
          if (!visited.has(choice.nextNode) && jsonNodes[choice.nextNode]) {
            visited.add(choice.nextNode);
            depth[choice.nextNode] = depth[current] + 1;
            queue.push(choice.nextNode);
          }
        }
      }
    }

    // Nodes orfes: els que no s'han visitat amb BFS
    let orphanDepth = 0;
    for (const nodeId of allNodeIds) {
      if (!visited.has(nodeId)) {
        // Calcular la profunditat màxima per col·locar orfes a la dreta
        const maxDepth = Math.max(0, ...Object.values(depth));
        depth[nodeId] = maxDepth + 1 + orphanDepth;
        orphanDepth++;
      }
    }

    // Agrupar per columna (profunditat)
    const columns = {};
    for (const nodeId of allNodeIds) {
      const d = depth[nodeId] || 0;
      if (!columns[d]) columns[d] = [];
      columns[d].push(nodeId);
    }

    // Assignar posicions: centrar cada columna verticalment
    for (const [col, nodeIds] of Object.entries(columns)) {
      const colIndex = parseInt(col, 10);
      const totalHeight = (nodeIds.length - 1) * ROW_GAP;
      const startY = ORIGIN_Y + (totalHeight > 0 ? 0 : 0);
      // Centrar verticalment (base + offset per centrar el grup)

      for (let i = 0; i < nodeIds.length; i++) {
        positions[nodeIds[i]] = {
          x: ORIGIN_X + colIndex * COLUMN_GAP,
          y: ORIGIN_Y + i * ROW_GAP
        };
      }
    }

    return positions;
  },

  // ---------------------------------------------------------------------------
  // toDownloadableJSON: estat → string JSON formatejat
  // ---------------------------------------------------------------------------

  /**
   * Serialitza l'estat i retorna un string JSON amb 2 espais d'indentació.
   * @param {import('./EditorState.js').default} editorState
   * @returns {string}
   */
  toDownloadableJSON(editorState) {
    const json = this.serialize(editorState);
    return JSON.stringify(json, null, 2);
  },

  // ---------------------------------------------------------------------------
  // downloadAsFile: dispara descàrrega .json al navegador
  // ---------------------------------------------------------------------------

  /**
   * Crea un fitxer .json descarregable amb l'aventura serialitzada.
   * @param {import('./EditorState.js').default} editorState
   * @param {string} [filename] - Nom del fitxer (sense extensió). Per defecte usa metadata.id.
   */
  downloadAsFile(editorState, filename) {
    const jsonString = this.toDownloadableJSON(editorState);
    const name = filename || editorState.metadata.id || 'aventura';
    const fullName = name.endsWith('.json') ? name : `${name}.json`;

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fullName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();

    // Netejar recursos
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  },

  // ---------------------------------------------------------------------------
  // importFromFile: selecció de fitxer → Promise<snapshot>
  // ---------------------------------------------------------------------------

  /**
   * Obre un diàleg de selecció de fitxer i retorna un snapshot deserialitzat.
   * @returns {Promise<object>} Snapshot compatible amb EditorState.restoreFromSnapshot()
   */
  importFromFile() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.style.display = 'none';
      document.body.appendChild(input);

      input.addEventListener('change', () => {
        const file = input.files[0];
        document.body.removeChild(input);

        if (!file) {
          reject(new Error('No s\'ha seleccionat cap fitxer.'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const json = JSON.parse(e.target.result);
            const snapshot = EditorSerializer.deserialize(json);
            resolve(snapshot);
          } catch (err) {
            reject(new Error(`Error en llegir el fitxer: ${err.message}`));
          }
        };
        reader.onerror = () => {
          reject(new Error('Error en llegir el fitxer.'));
        };
        reader.readAsText(file);
      });

      // Si l'usuari cancel·la el diàleg, netejar
      input.addEventListener('cancel', () => {
        document.body.removeChild(input);
        reject(new Error('Importació cancel·lada.'));
      });

      input.click();
    });
  },

  // ---------------------------------------------------------------------------
  // validate: comprovacions de coherència de l'aventura
  // ---------------------------------------------------------------------------

  /**
   * Valida l'estat de l'editor i retorna una llista de problemes.
   * @param {import('./EditorState.js').default} editorState
   * @returns {Array<{type: string, message: string, nodeId?: string}>}
   */
  validate(editorState) {
    const issues = [];
    const { metadata, startNodeId, nodes, connections } = editorState;
    const nodeIds = Object.keys(nodes);
    const connList = Object.values(connections);

    // 1. startNode no establert
    if (!startNodeId) {
      issues.push({
        type: 'error',
        message: 'No s\'ha establert cap node inicial (startNode).'
      });
    }

    // 2. startNode no existeix
    if (startNodeId && !nodes[startNodeId]) {
      issues.push({
        type: 'error',
        message: `El node inicial '${startNodeId}' no existeix.`
      });
    }

    // 3. Nodes sense text
    for (const node of Object.values(nodes)) {
      if (!node.text || node.text.trim() === '') {
        issues.push({
          type: 'warning',
          message: `El node '${node.id}' no té text.`,
          nodeId: node.id
        });
      }
    }

    // 4. Nodes no-finals sense connexions de sortida
    const outgoingMap = {};
    for (const conn of connList) {
      if (!outgoingMap[conn.fromNodeId]) {
        outgoingMap[conn.fromNodeId] = [];
      }
      outgoingMap[conn.fromNodeId].push(conn);
    }

    for (const node of Object.values(nodes)) {
      if (!node.isEnding) {
        const out = outgoingMap[node.id] || [];
        if (out.length === 0) {
          issues.push({
            type: 'warning',
            message: `El node '${node.id}' no és final i no té connexions de sortida.`,
            nodeId: node.id
          });
        }
      }
    }

    // 5. Connexions amb etiqueta buida
    for (const conn of connList) {
      if (!conn.label || conn.label.trim() === '') {
        issues.push({
          type: 'warning',
          message: `La connexió '${conn.id}' (${conn.fromNodeId} → ${conn.toNodeId}) no té etiqueta.`
        });
      }
    }

    // 6. Nodes orfes (inaccessibles des de startNode via BFS)
    if (startNodeId && nodes[startNodeId]) {
      const reachable = new Set();
      const queue = [startNodeId];
      reachable.add(startNodeId);

      while (queue.length > 0) {
        const current = queue.shift();
        const outConns = outgoingMap[current] || [];
        for (const conn of outConns) {
          if (!reachable.has(conn.toNodeId) && nodes[conn.toNodeId]) {
            reachable.add(conn.toNodeId);
            queue.push(conn.toNodeId);
          }
        }
      }

      for (const nodeId of nodeIds) {
        if (!reachable.has(nodeId)) {
          issues.push({
            type: 'warning',
            message: `El node '${nodeId}' és orfe (inaccessible des del node inicial).`,
            nodeId
          });
        }
      }
    }

    // 7. No existeixen nodes finals
    const hasEnding = Object.values(nodes).some(n => n.isEnding);
    if (!hasEnding && nodeIds.length > 0) {
      issues.push({
        type: 'error',
        message: 'L\'aventura no té cap node final.'
      });
    }

    // 8. Nodes finals sense endingType
    for (const node of Object.values(nodes)) {
      if (node.isEnding && !node.endingType) {
        issues.push({
          type: 'warning',
          message: `El node final '${node.id}' no té endingType definit.`,
          nodeId: node.id
        });
      }
    }

    return issues;
  }
};

export default EditorSerializer;
