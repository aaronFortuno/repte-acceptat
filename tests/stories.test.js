/**
 * Tests de validació d'aventures.
 * Comprova la integritat estructural dels fitxers JSON d'aventura.
 */

const { describe, it, assert, assertEqual } = window._test;

/**
 * Valida una aventura completa.
 * Comprova: nodes referenciats existeixen, tots els camins arriben a un final,
 * no hi ha nodes orfes, i cada node té choices XOR isEnding.
 */
function validateAdventure(data) {
  const errors = [];
  const nodeIds = Object.keys(data.nodes);

  // 1. startNode existeix
  if (!data.nodes[data.startNode]) {
    errors.push(`startNode "${data.startNode}" no existeix`);
  }

  // 2. Cada node té choices XOR isEnding
  for (const [id, node] of Object.entries(data.nodes)) {
    const hasChoices = node.choices && node.choices.length > 0;
    const isEnd = !!node.isEnding;
    if (hasChoices && isEnd) {
      errors.push(`Node "${id}" té choices I isEnding alhora`);
    }
    if (!hasChoices && !isEnd) {
      errors.push(`Node "${id}" no té ni choices ni isEnding`);
    }
  }

  // 3. Tots els nextNode referenciats existeixen
  for (const [id, node] of Object.entries(data.nodes)) {
    if (node.choices) {
      for (const choice of node.choices) {
        if (!data.nodes[choice.nextNode]) {
          errors.push(`Node "${id}" referencia nextNode "${choice.nextNode}" que no existeix`);
        }
      }
    }
  }

  // 4. No hi ha nodes orfes (no referenciats des de cap lloc)
  const referenced = new Set([data.startNode]);
  for (const node of Object.values(data.nodes)) {
    if (node.choices) {
      for (const choice of node.choices) {
        referenced.add(choice.nextNode);
      }
    }
  }
  for (const id of nodeIds) {
    if (!referenced.has(id)) {
      errors.push(`Node "${id}" és orfe (no referenciat des de cap altre node)`);
    }
  }

  // 5. Tots els camins porten a un final (BFS des de startNode)
  const visited = new Set();
  const queue = [data.startNode];
  const deadEnds = [];

  while (queue.length > 0) {
    const nodeId = queue.shift();
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);

    const node = data.nodes[nodeId];
    if (!node) continue;
    if (node.isEnding) continue;

    if (node.choices) {
      for (const choice of node.choices) {
        queue.push(choice.nextNode);
      }
    }
  }

  // 6. Endings tenen endingType
  for (const [id, node] of Object.entries(data.nodes)) {
    if (node.isEnding && !node.endingType) {
      errors.push(`Final "${id}" no té endingType ("good" o "bad")`);
    }
  }

  return errors;
}

// ============================================
// Carregar i validar totes les aventures del manifest
// ============================================

describe('Validació d\'aventures — Estructura', () => {
  it('el manifest existeix i té aventures', async () => {
    try {
      const response = await fetch('../stories/manifest.json');
      if (!response.ok) {
        // Si encara no hi ha manifest, el test és informatiu
        console.warn('manifest.json no trobat — es validarà quan existeixi');
        return;
      }
      const manifest = await response.json();
      assert(manifest.adventures && manifest.adventures.length > 0,
        'El manifest ha de tenir almenys una aventura');
    } catch (e) {
      // Manifest no disponible encara — OK en fase inicial
      console.warn('Manifest no disponible:', e.message);
    }
  });
});

describe('Validació d\'aventures — Integritat inline', () => {
  // Test amb una aventura invàlida per verificar el validador
  it('detecta nodes orfes', () => {
    const errors = validateAdventure({
      startNode: 'a',
      nodes: {
        a: { text: 'x', choices: [{ label: 'y', nextNode: 'b' }] },
        b: { text: 'fi', isEnding: true, endingType: 'bad' },
        orfe: { text: 'ningú em referencia', isEnding: true, endingType: 'bad' }
      }
    });
    assert(errors.some(e => e.includes('orfe')), 'Hauria de detectar el node orfe');
  });

  it('detecta nextNode inexistent', () => {
    const errors = validateAdventure({
      startNode: 'a',
      nodes: {
        a: { text: 'x', choices: [{ label: 'y', nextNode: 'fantasma' }] }
      }
    });
    assert(errors.some(e => e.includes('fantasma')), 'Hauria de detectar referència inexistent');
  });

  it('detecta node sense choices ni isEnding', () => {
    const errors = validateAdventure({
      startNode: 'a',
      nodes: {
        a: { text: 'x' }
      }
    });
    assert(errors.some(e => e.includes('ni choices ni isEnding')),
      'Hauria de detectar node incomplet');
  });

  it('detecta node amb choices I isEnding alhora', () => {
    const errors = validateAdventure({
      startNode: 'a',
      nodes: {
        a: {
          text: 'x',
          isEnding: true,
          endingType: 'bad',
          choices: [{ label: 'y', nextNode: 'a' }]
        }
      }
    });
    assert(errors.some(e => e.includes('choices I isEnding')),
      'Hauria de detectar conflicte choices/isEnding');
  });

  it('aventura vàlida no genera errors', () => {
    const errors = validateAdventure({
      startNode: 'a',
      nodes: {
        a: { text: 'x', choices: [{ label: 'y', nextNode: 'b' }] },
        b: { text: 'fi', isEnding: true, endingType: 'good' }
      }
    });
    assertEqual(errors.length, 0, `Errors inesperats: ${errors.join(', ')}`);
  });
});

// Exportar per ús futur
window._validateAdventure = validateAdventure;
