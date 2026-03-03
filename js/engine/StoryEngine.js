/**
 * StoryEngine — Motor narratiu principal.
 * Carrega aventures JSON, gestiona l'estat de la partida
 * i permet navegar entre nodes.
 */

class StoryEngine {
  constructor() {
    this._adventure = null;
    this._currentNodeId = null;
    this._history = [];
  }

  /**
   * Carrega una aventura des d'un objecte JSON ja parsejat.
   * @param {object} adventureData — Objecte amb { id, title, startNode, nodes }
   */
  loadAdventure(adventureData) {
    this._validate(adventureData);
    this._adventure = adventureData;
    this._currentNodeId = null;
    this._history = [];
  }

  /**
   * Carrega una aventura des d'un fitxer JSON via fetch.
   * @param {string} url — Ruta al fitxer JSON
   * @returns {Promise<void>}
   */
  async loadAdventureFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`No s'ha pogut carregar l'aventura: ${response.status}`);
    }
    const data = await response.json();
    this.loadAdventure(data);
  }

  /**
   * Inicia la partida al node inicial.
   */
  startGame() {
    if (!this._adventure) {
      throw new Error('Cap aventura carregada. Crida loadAdventure() primer.');
    }
    this._currentNodeId = this._adventure.startNode;
    this._history = [this._currentNodeId];
  }

  /**
   * Retorna el node actual complet.
   * @returns {object|null}
   */
  getCurrentNode() {
    if (!this._currentNodeId || !this._adventure) return null;
    return this._adventure.nodes[this._currentNodeId] || null;
  }

  /**
   * Retorna l'ID del node actual.
   * @returns {string|null}
   */
  getCurrentNodeId() {
    return this._currentNodeId;
  }

  /**
   * Retorna el títol de l'aventura carregada.
   * @returns {string|null}
   */
  getTitle() {
    return this._adventure ? this._adventure.title : null;
  }

  /**
   * Selecciona una opció i navega al node següent.
   * @param {number} choiceIndex — Índex de l'opció (0-based)
   * @returns {object} El nou node actual
   */
  selectChoice(choiceIndex) {
    const node = this.getCurrentNode();
    if (!node) {
      throw new Error('No hi ha node actual.');
    }
    if (node.isEnding) {
      throw new Error('El node actual és un final. No es pot triar opció.');
    }
    if (!node.choices || choiceIndex < 0 || choiceIndex >= node.choices.length) {
      throw new Error(`Índex d'opció invàlid: ${choiceIndex}`);
    }

    const nextNodeId = node.choices[choiceIndex].nextNode;
    if (!this._adventure.nodes[nextNodeId]) {
      throw new Error(`Node destí no trobat: "${nextNodeId}"`);
    }

    this._currentNodeId = nextNodeId;
    this._history.push(nextNodeId);
    return this.getCurrentNode();
  }

  /**
   * Comprova si el node actual és un final.
   * @returns {boolean}
   */
  isEnding() {
    const node = this.getCurrentNode();
    return node ? !!node.isEnding : false;
  }

  /**
   * Retorna el tipus de final ("good", "bad") o null si no és final.
   * @returns {string|null}
   */
  getEndingType() {
    const node = this.getCurrentNode();
    if (!node || !node.isEnding) return null;
    return node.endingType || null;
  }

  /**
   * Retorna el títol del final o null.
   * @returns {string|null}
   */
  getEndingTitle() {
    const node = this.getCurrentNode();
    if (!node || !node.isEnding) return null;
    return node.endingTitle || null;
  }

  /**
   * Retorna l'historial de nodes visitats.
   * @returns {string[]}
   */
  getHistory() {
    return [...this._history];
  }

  /**
   * Reinicia la partida al node inicial.
   */
  restart() {
    this.startGame();
  }

  /**
   * Validació bàsica de l'estructura de l'aventura.
   * @private
   */
  _validate(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Dades d\'aventura invàlides.');
    }
    if (!data.startNode) {
      throw new Error('Falta "startNode" a l\'aventura.');
    }
    if (!data.nodes || typeof data.nodes !== 'object') {
      throw new Error('Falta "nodes" a l\'aventura.');
    }
    if (!data.nodes[data.startNode]) {
      throw new Error(`El startNode "${data.startNode}" no existeix als nodes.`);
    }
  }
}

export default StoryEngine;
