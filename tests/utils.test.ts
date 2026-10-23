import assert from 'node:assert/strict';
import test from 'node:test';

import { alignNeuroSpotWords, alignWords } from '../src/utils';

test('alignWords preserves an insertion between correct words', () => {
  const analysis = alignWords('the quick fox', 'the very quick fox', 0.9);

  assert.deepEqual(
    analysis.map((item) => [item.palavra_lida_transcrita, item.status]),
    [
      ['the', 'correta'],
      ['very', 'inserida'],
      ['quick', 'correta'],
      ['fox', 'correta'],
    ],
  );
});

test('alignWords distinguishes omissions and substitutions', () => {
  const analysis = alignWords('the quick brown fox', 'the slow fox');

  assert.equal(analysis.filter((item) => item.status === 'omitida').length, 1);
  assert.equal(analysis.filter((item) => item.status === 'substituida').length, 1);
});

test('NeuroSpot does not reuse one spoken token for duplicate targets', () => {
  const result = alignNeuroSpotWords(['cat', 'cat'], 'cat');
  assert.equal(result.resumo_deteccao.total_palavras_detectadas_com_sucesso, 1);
});
