/**
 * EditorStorage.js — Gestió de persistència de projectes de l'editor a localStorage.
 *
 * Proporciona: guardar, carregar, eliminar projectes, autoguardat periòdic,
 * avís de canvis no guardats (beforeunload), i control d'ús d'emmagatzematge.
 */

// Prefix per a totes les claus de localStorage de l'editor
const KEY_PREFIX = 'adventure-editor-';
const PROJECTS_KEY = `${KEY_PREFIX}projects`;
const PROJECT_KEY_PREFIX = `${KEY_PREFIX}project-`;
const AUTOSAVE_KEY = `${KEY_PREFIX}autosave`;

// Límit aproximat de localStorage (~5 MB)
const STORAGE_LIMIT_BYTES = 5 * 1024 * 1024;

// Llindar d'avís d'ús (80%)
const USAGE_WARNING_THRESHOLD = 0.8;

/**
 * Genera un identificador únic per a projectes.
 * @returns {string}
 */
function generateProjectId() {
  return `project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

class EditorStorage {
  /**
   * Crea una instància d'EditorStorage.
   * @param {import('./EditorState.js').default} editorState - Instància d'EditorState
   */
  constructor(editorState) {
    this._editorState = editorState;
    this._autosaveInterval = null;

    // Listener de beforeunload per avisar de canvis no guardats
    this._beforeUnloadHandler = (e) => {
      if (this._editorState.dirty) {
        e.preventDefault();
        // Missatge estàndard del navegador (el text personalitzat s'ignora en navegadors moderns)
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', this._beforeUnloadHandler);

    // Iniciar autoguardat per defecte (30 segons)
    this.startAutosave();
  }

  // ---------------------------------------------------------------------------
  // Guardar / Carregar / Eliminar projectes
  // ---------------------------------------------------------------------------

  /**
   * Guarda l'estat actual com a projecte a localStorage.
   * @param {string} [projectId] - ID del projecte. Si no es proporciona, s'usa metadata.id o se'n genera un.
   * @returns {string} L'ID del projecte usat
   */
  save(projectId) {
    const metadata = this._editorState.metadata;
    const id = projectId || metadata.id || generateProjectId();

    // Actualitzar metadata.id si no coincideix
    if (metadata.id !== id) {
      metadata.id = id;
    }

    const snapshot = this._editorState.getSnapshot();
    const projectKey = `${PROJECT_KEY_PREFIX}${id}`;

    try {
      localStorage.setItem(projectKey, JSON.stringify(snapshot));
    } catch (err) {
      console.warn(`[EditorStorage] Error en guardar el projecte '${id}':`, err);
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        console.warn('[EditorStorage] Quota de localStorage excedida.');
      }
      throw err;
    }

    // Actualitzar la llista de projectes
    const now = new Date().toISOString();
    const list = this._getProjectList();
    const existing = list.find(p => p.projectId === id);

    if (existing) {
      existing.title = metadata.title || '';
      existing.author = metadata.author || '';
      existing.lastModified = now;
    } else {
      list.push({
        projectId: id,
        title: metadata.title || '',
        author: metadata.author || '',
        lastModified: now,
        createdAt: now
      });
    }

    this._saveProjectList(list);
    this._editorState.markClean();

    return id;
  }

  /**
   * Carrega un projecte des de localStorage i el restaura a l'EditorState.
   * @param {string} projectId
   * @returns {boolean} true si s'ha carregat correctament
   */
  load(projectId) {
    const projectKey = `${PROJECT_KEY_PREFIX}${projectId}`;
    const raw = localStorage.getItem(projectKey);

    if (!raw) {
      console.warn(`[EditorStorage] Projecte '${projectId}' no trobat.`);
      return false;
    }

    try {
      const snapshot = JSON.parse(raw);
      this._editorState.restoreFromSnapshot(snapshot);
      return true;
    } catch (err) {
      console.warn(`[EditorStorage] Error en parsejar el projecte '${projectId}':`, err);
      return false;
    }
  }

  /**
   * Elimina un projecte de localStorage.
   * @param {string} projectId
   * @returns {boolean} true si s'ha eliminat correctament
   */
  delete(projectId) {
    const projectKey = `${PROJECT_KEY_PREFIX}${projectId}`;
    const existed = localStorage.getItem(projectKey) !== null;

    if (!existed) {
      return false;
    }

    localStorage.removeItem(projectKey);

    // Actualitzar la llista de projectes
    const list = this._getProjectList();
    const filtered = list.filter(p => p.projectId !== projectId);
    this._saveProjectList(filtered);

    return true;
  }

  // ---------------------------------------------------------------------------
  // Llista de projectes
  // ---------------------------------------------------------------------------

  /**
   * Retorna la llista de projectes ordenada per data de modificació (més recent primer).
   * @returns {Array<{projectId: string, title: string, author: string, lastModified: string, createdAt: string}>}
   */
  getProjectList() {
    const list = this._getProjectList();
    // Ordenar per lastModified descendent
    list.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
    return list;
  }

  /**
   * Comprova si existeix un projecte amb l'ID donat.
   * @param {string} projectId
   * @returns {boolean}
   */
  hasProject(projectId) {
    const projectKey = `${PROJECT_KEY_PREFIX}${projectId}`;
    return localStorage.getItem(projectKey) !== null;
  }

  // ---------------------------------------------------------------------------
  // Autoguardat
  // ---------------------------------------------------------------------------

  /**
   * Inicia l'autoguardat periòdic.
   * Només guarda si l'estat és dirty.
   * @param {number} [intervalMs=30000] - Interval en mil·lisegons
   */
  startAutosave(intervalMs = 30000) {
    this.stopAutosave();
    this._autosaveInterval = setInterval(() => {
      if (this._editorState.dirty) {
        this._saveAutosave();
      }
    }, intervalMs);
  }

  /**
   * Atura l'autoguardat.
   */
  stopAutosave() {
    if (this._autosaveInterval !== null) {
      clearInterval(this._autosaveInterval);
      this._autosaveInterval = null;
    }
  }

  /**
   * Carrega l'autoguardat des de localStorage.
   * @returns {boolean} true si s'ha carregat correctament
   */
  loadAutosave() {
    const raw = localStorage.getItem(AUTOSAVE_KEY);

    if (!raw) {
      return false;
    }

    try {
      const snapshot = JSON.parse(raw);
      this._editorState.restoreFromSnapshot(snapshot);
      return true;
    } catch (err) {
      console.warn('[EditorStorage] Error en parsejar l\'autoguardat:', err);
      return false;
    }
  }

  /**
   * Comprova si existeix un autoguardat.
   * @returns {boolean}
   */
  hasAutosave() {
    return localStorage.getItem(AUTOSAVE_KEY) !== null;
  }

  // ---------------------------------------------------------------------------
  // Ús d'emmagatzematge
  // ---------------------------------------------------------------------------

  /**
   * Estima l'ús de localStorage per a dades de l'editor.
   * @returns {{ used: number, available: number, percentage: number }}
   */
  getStorageUsage() {
    let used = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(KEY_PREFIX)) {
        const value = localStorage.getItem(key);
        // Cada caràcter ocupa 2 bytes en UTF-16
        used += (key.length + (value ? value.length : 0)) * 2;
      }
    }

    const available = STORAGE_LIMIT_BYTES - used;
    const percentage = used / STORAGE_LIMIT_BYTES;

    if (percentage >= USAGE_WARNING_THRESHOLD) {
      console.warn(
        `[EditorStorage] Ús d'emmagatzematge elevat: ${(percentage * 100).toFixed(1)}% ` +
        `(${(used / 1024).toFixed(1)} KB de ~${(STORAGE_LIMIT_BYTES / 1024).toFixed(0)} KB)`
      );
    }

    return {
      used,
      available: Math.max(0, available),
      percentage
    };
  }

  // ---------------------------------------------------------------------------
  // Destrucció
  // ---------------------------------------------------------------------------

  /**
   * Neteja intervals i listeners. Cridar quan l'editor es tanca.
   */
  destroy() {
    this.stopAutosave();
    window.removeEventListener('beforeunload', this._beforeUnloadHandler);
  }

  // ---------------------------------------------------------------------------
  // Mètodes privats
  // ---------------------------------------------------------------------------

  /**
   * Llegeix la llista de projectes des de localStorage.
   * Si no existeix o està corrupta, retorna un array buit.
   * @returns {Array}
   * @private
   */
  _getProjectList() {
    const raw = localStorage.getItem(PROJECTS_KEY);

    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        console.warn('[EditorStorage] Llista de projectes corrupta (no és un array). Reinicialitzant.');
        return [];
      }
      return parsed;
    } catch (err) {
      console.warn('[EditorStorage] Error en parsejar la llista de projectes. Reinicialitzant.', err);
      return [];
    }
  }

  /**
   * Guarda la llista de projectes a localStorage.
   * @param {Array} list
   * @private
   */
  _saveProjectList(list) {
    try {
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(list));
    } catch (err) {
      console.warn('[EditorStorage] Error en guardar la llista de projectes:', err);
    }
  }

  /**
   * Guarda un snapshot a la ranura d'autoguardat.
   * @private
   */
  _saveAutosave() {
    const snapshot = this._editorState.getSnapshot();
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(snapshot));
    } catch (err) {
      console.warn('[EditorStorage] Error en autoguardar:', err);
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        console.warn('[EditorStorage] Quota de localStorage excedida durant autoguardat.');
      }
    }
  }
}

export default EditorStorage;
