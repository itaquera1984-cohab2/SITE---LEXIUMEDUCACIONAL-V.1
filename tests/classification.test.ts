import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateReadingClassification } from '../src/classification';
import { EvaluationResult } from '../src/types';

function result(correct: number, total: number, durationSeconds: number, omissions = 0, substitutions = 0): EvaluationResult {
  return {
    texto_de_referencia_utilizado: '',
    transcricao_completa: '',
    duration_seconds: durationSeconds,
    analise_por_palavra: [],
    resumo_erros: {
      total_palavras_referencia: total,
      total_palavras_lidas_corretas: correct,
      total_erros: omissions + substitutions,
      erros_por_tipo: {
        mal_pronunciada: 0,
        substituida: substitutions,
        omitida: omissions,
        inserida: 0,
      },
    },
  };
}

test('classifies a fluent first-grade reading using real recording time', () => {
  const summary = calculateReadingClassification([
    result(8, 8, 10),
    result(8, 8, 10),
    result(20, 20, 25),
  ], 1);

  assert.equal(summary.classification, 'FLUENT');
  assert.equal(summary.wcpm, 48);
  assert.equal(summary.accuracy, 100);
});

test('applies the selected grade thresholds to the same reading', () => {
  const results = [
    result(8, 8, 10),
    result(8, 8, 10),
    result(20, 20, 25),
  ];

  assert.equal(calculateReadingClassification(results, 2).classification, 'TRANSITIONAL');
  assert.equal(calculateReadingClassification(results, 3).classification, 'EMERGENT');
});

test('does not award fluency when duration is missing', () => {
  const results = [result(8, 8, 0), result(8, 8, 0), result(20, 20, 0)];
  assert.equal(calculateReadingClassification(results, 1).classification, 'PRE-READER');
});

test('critical omissions cap the classification', () => {
  const results = [
    result(8, 8, 10, 1),
    result(8, 8, 10, 1),
    result(20, 20, 25, 1),
  ];

  assert.equal(calculateReadingClassification(results, 1).classification, 'TRANSITIONAL');
});
