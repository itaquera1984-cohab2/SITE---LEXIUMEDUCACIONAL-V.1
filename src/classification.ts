import { EvaluationResult } from './types';

export type ReadingClassification = 'FLUENT' | 'TRANSITIONAL' | 'EMERGENT' | 'PRE-READER';

export interface ReadingClassificationSummary {
  classification: ReadingClassification;
  wcpm: number;
  accuracy: number;
  criticalErrors: number;
}

const STAGE_WEIGHTS = [0.2, 0.3, 0.5] as const;

const GRADE_THRESHOLDS = {
  1: { fluent: 40, transitional: 25, emergent: 10 },
  2: { fluent: 60, transitional: 40, emergent: 20 },
  3: { fluent: 80, transitional: 50, emergent: 30 },
} as const;

/**
 * Calculates the consolidated LIRA classification.
 *
 * WCPM is derived from the observed duration of each recording, not from the
 * raw word count. The three stages keep the product's established weights:
 * common words 20%, complex words 30%, and connected text 50%.
 */
export function calculateReadingClassification(
  results: EvaluationResult[],
  gradeLevel: number,
): ReadingClassificationSummary {
  const thresholds = GRADE_THRESHOLDS[gradeLevel as keyof typeof GRADE_THRESHOLDS]
    ?? GRADE_THRESHOLDS[3];

  const stageMetrics = results.slice(0, STAGE_WEIGHTS.length).map((result) => {
    const correct = Math.max(0, result.resumo_erros.total_palavras_lidas_corretas);
    const total = Math.max(0, result.resumo_erros.total_palavras_referencia);
    const durationSeconds = Math.max(0, result.duration_seconds ?? 0);
    const wcpm = durationSeconds > 0 ? (correct * 60) / durationSeconds : 0;
    const accuracy = total > 0 ? (correct / total) * 100 : 0;
    const criticalErrors = Math.max(0,
      result.resumo_erros.erros_por_tipo.omitida
      + result.resumo_erros.erros_por_tipo.substituida,
    );

    return { wcpm, accuracy, criticalErrors };
  });

  while (stageMetrics.length < STAGE_WEIGHTS.length) {
    stageMetrics.push({ wcpm: 0, accuracy: 0, criticalErrors: 0 });
  }

  const wcpm = stageMetrics.reduce(
    (sum, metric, index) => sum + metric.wcpm * STAGE_WEIGHTS[index],
    0,
  );
  const accuracy = stageMetrics.reduce(
    (sum, metric, index) => sum + metric.accuracy * STAGE_WEIGHTS[index],
    0,
  );
  const criticalErrors = stageMetrics.reduce(
    (sum, metric) => sum + metric.criticalErrors,
    0,
  );

  let classification: ReadingClassification = 'PRE-READER';
  if (wcpm >= thresholds.fluent && accuracy >= 95 && criticalErrors <= 2) {
    classification = 'FLUENT';
  } else if (wcpm >= thresholds.transitional && accuracy >= 85 && criticalErrors <= 5) {
    classification = 'TRANSITIONAL';
  } else if (wcpm >= thresholds.emergent && accuracy >= 70 && criticalErrors <= 8) {
    classification = 'EMERGENT';
  }

  return {
    classification,
    wcpm: Math.round(wcpm * 10) / 10,
    accuracy: Math.round(accuracy * 10) / 10,
    criticalErrors,
  };
}
