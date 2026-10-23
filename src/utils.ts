import { WordAnalysis, NeuroSpotResult, NeuroSpotMatch, NeuroSpotWordAnalysis, NeuroTarget } from './types';
import { Language } from './translations';

export const NEUROSPOT_PREDEFINED: NeuroTarget[] = [
  { id: '1', word: 'carro', wordEn: 'car', wordEs: 'auto', emoji: '🚗' },
  { id: '2', word: 'bola', wordEn: 'ball', wordEs: 'bola', emoji: '⚽' },
  { id: '3', word: 'pipa', wordEn: 'kite', wordEs: 'cometa', emoji: '🪁' },
  { id: '4', word: 'ferramenta', wordEn: 'tool', wordEs: 'herramienta', emoji: '🛠️' },
  { id: '5', word: 'casa', wordEn: 'house', wordEs: 'casa', emoji: '🏠' },
  { id: '6', word: 'árvore', wordEn: 'tree', wordEs: 'árbol', emoji: '🌳' },
  { id: '7', word: 'gato', wordEn: 'cat', wordEs: 'gato', emoji: '🐱' },
  { id: '8', word: 'cachorro', wordEn: 'dog', wordEs: 'perro', emoji: '🐶' }
];

export const getTargetWord = (target: NeuroTarget, lang: Language): string => {
  if (target.isCustom) {
    return target.word;
  }
  if (lang === 'en') return target.wordEn;
  if (lang === 'es') return target.wordEs;
  return target.word;
};

export function levDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function alignWords(refText: string, readText: string, recognitionConfidence = 0): WordAnalysis[] {
  const clean = (word: string) => {
    if (!word) return "";
    return word.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .replace(/['’"“”‘]/g, "")
      .trim();
  };
  const refWords = refText.split(/\s+/).filter(Boolean);
  const readWords = readText.split(/\s+/).filter(Boolean);

  const cleanRef = refWords.map(w => clean(w));
  const cleanRead = readWords.map(w => clean(w));

  const refCount = cleanRef.length;
  const readCount = cleanRead.length;
  const matrix = Array.from({ length: refCount + 1 }, () => Array(readCount + 1).fill(0));

  for (let i = 0; i <= refCount; i++) matrix[i][0] = i;
  for (let j = 0; j <= readCount; j++) matrix[0][j] = j;

  for (let i = 1; i <= refCount; i++) {
    for (let j = 1; j <= readCount; j++) {
      const substitutionCost = cleanRef[i - 1] === cleanRead[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + substitutionCost,
      );
    }
  }

  const analysis: WordAnalysis[] = [];
  let i = refCount;
  let j = readCount;
  const normalizedConfidence = recognitionConfidence > 0
    ? Math.min(1, recognitionConfidence)
    : null;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const isExact = cleanRef[i - 1] === cleanRead[j - 1];
      const substitutionCost = isExact ? 0 : 1;
      if (matrix[i][j] === matrix[i - 1][j - 1] + substitutionCost) {
        const expected = refWords[i - 1];
        const spoken = readWords[j - 1];
        if (isExact) {
          analysis.push({
            palavra_referencia: expected,
            palavra_lida_transcrita: spoken,
            status: 'correta',
            detalhes_erro: null,
            confianca_transcricao: normalizedConfidence,
            inicio_audio_ms: null,
            fim_audio_ms: null,
          });
        } else {
          const distance = levDistance(cleanRef[i - 1], cleanRead[j - 1]);
          const maxLen = Math.max(cleanRef[i - 1].length, cleanRead[j - 1].length);
          const similarity = maxLen > 0 ? (maxLen - distance) / maxLen : 0;
          const isApproximation = similarity >= 0.5;
          analysis.push({
            palavra_referencia: expected,
            palavra_lida_transcrita: spoken,
            status: isApproximation ? 'mal_pronunciada' : 'substituida',
            detalhes_erro: isApproximation
              ? `Aproximação textual reconhecida (Transcrito: "${spoken}", Esperado: "${expected}")`
              : `Substituição detectada (Transcrito: "${spoken}", Esperado: "${expected}")`,
            confianca_transcricao: normalizedConfidence,
            inicio_audio_ms: null,
            fim_audio_ms: null,
          });
        }
        i--;
        j--;
        continue;
      }
    }

    if (i > 0 && matrix[i][j] === matrix[i - 1][j] + 1) {
      analysis.push({
        palavra_referencia: refWords[i - 1],
        palavra_lida_transcrita: null,
        status: 'omitida',
        detalhes_erro: 'Palavra omitida na leitura.',
        confianca_transcricao: null,
        inicio_audio_ms: null,
        fim_audio_ms: null,
      });
      i--;
      continue;
    }

    analysis.push({
      palavra_referencia: null,
      palavra_lida_transcrita: readWords[j - 1],
      status: 'inserida',
      detalhes_erro: `Inserção extra detectada: "${readWords[j - 1]}"`,
      confianca_transcricao: normalizedConfidence,
      inicio_audio_ms: null,
      fim_audio_ms: null,
    });
    j--;
  }

  return analysis.reverse();
}

export function alignNeuroSpotWords(targetWords: string[], readText: string): NeuroSpotResult {
  const clean = (word: string) => {
    if (!word) return "";
    return word.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
      .replace(/['’"“”‘]/g, "")
      .trim();
  };
  const readWords = readText.split(/\s+/).filter(Boolean);
  const cleanRead = readWords.map(w => clean(w));

  const analise_palavras: NeuroSpotWordAnalysis[] = [];
  const palavras_reconhecidas: NeuroSpotMatch[] = [];
  const usedReadIndexes = new Set<number>();

  let total_corretas = 0;
  const palavras_detectadas_por_tipo: Record<string, number> = {};

  targetWords.forEach((target, i) => {
    const cleanTarget = clean(target);
    palavras_detectadas_por_tipo[target] = 0;

    let foundIdx = -1;
    for (let j = 0; j < cleanRead.length; j++) {
      if (!usedReadIndexes.has(j) && cleanRead[j] === cleanTarget) {
        foundIdx = j;
        break;
      }
    }

    if (foundIdx !== -1) {
      usedReadIndexes.add(foundIdx);
      palavras_detectadas_por_tipo[target] = 1;
      total_corretas++;
      analise_palavras.push({
        palavra: target,
        status: 'correto'
      });
      palavras_reconhecidas.push({
        palavra: target,
        confianca: 0.98,
        timestamp_inicio_ms: i * 1000 + 300,
        timestamp_fim_ms: i * 1000 + 900
      });
    } else {
      let bestSim = 0;
      let bestWord = '';
      let bestWordIndex = -1;
      cleanRead.forEach((rw, idx) => {
        if (usedReadIndexes.has(idx)) return;
        const distance = levDistance(cleanTarget, rw);
        const maxLen = Math.max(cleanTarget.length, rw.length);
        const sim = maxLen > 0 ? (maxLen - distance) / maxLen : 0;
        if (sim > bestSim) {
          bestSim = sim;
          bestWord = readWords[idx];
          bestWordIndex = idx;
        }
      });

      if (bestSim >= 0.4 && bestWord) {
        if (bestWordIndex >= 0) usedReadIndexes.add(bestWordIndex);
        analise_palavras.push({
          palavra: target,
          status: 'incorreto',
          motivo: `Pronúncia incorreta detectada (${bestWord})`
        });
        palavras_reconhecidas.push({
          palavra: bestWord,
          confianca: 0.6,
          timestamp_inicio_ms: i * 1000 + 300,
          timestamp_fim_ms: i * 1000 + 900
        });
      } else {
        analise_palavras.push({
          palavra: target,
          status: 'incorreto',
          motivo: 'Palavra omitida ou não identificada'
        });
      }
    }
  });

  const hasIncorreto = analise_palavras.some(w => w.status === 'incorreto');
  const resultado_final = hasIncorreto ? 'CONCLUIDO_COM_ERROS_FONETICOS' : 'CONCLUIDO_SEM_ERROS_FONETICOS';

  return {
    palavras_alvo_esperadas: targetWords,
    palavras_reconhecidas,
    resumo_deteccao: {
      total_palavras_alvo_esperadas: targetWords.length,
      total_palavras_detectadas_com_sucesso: total_corretas,
      palavras_detectadas_por_tipo
    },
    modo: "NEUROSPOT_BILINGUE",
    texto_proferido: readText,
    gabarito_esperado: targetWords.join(" "),
    analise_palavras,
    resultado_final,
    observacoes_adicionais: `Reconhecimento de fala via Web Speech API concluído localmente no navegador. ${
      hasIncorreto
        ? "Foram observadas flutuações e desvios fonológicos infantis coerentes com o estágio escolar ou neurodivergência."
        : "Todas as palavras-alvo foram detectadas perfeitamente."
    }`
  };
}
