import { Language } from './translations';

export type AppView = 'MANAGEMENT' | 'EVALUATION';

export interface SimulationResult {
  commonWords: number;
  complexWords: number;
  childrenStory: number;
  classification: string;
}

export interface Student {
  id: string;
  name: string;
  score?: number; // 0 to 100 for VAAR calculation
  indicators: {
    BF: boolean;
    NEE: boolean;
    PPI: boolean;
    BA: boolean;
  };
  simulations?: {
    s1?: SimulationResult;
    s2?: SimulationResult;
    s3?: SimulationResult;
    s4?: SimulationResult;
  };
}

export interface ClassRoom {
  id: string;
  name: string;
  students: Student[];
  vaarAlert?: boolean;
}

export interface WordAnalysis {
  palavra_referencia: string | null;
  palavra_lida_transcrita: string | null;
  status: 'correta' | 'mal_pronunciada' | 'substituida' | 'omitida' | 'inserida';
  detalhes_erro: string | null;
  confianca_transcricao: number | null;
  inicio_audio_ms: number | null;
  fim_audio_ms: number | null;
}

export interface EvaluationResult {
  texto_de_referencia_utilizado: string;
  transcricao_completa: string;
  duration_seconds?: number;
  analise_por_palavra: WordAnalysis[];
  resumo_erros: {
    total_palavras_referencia: number;
    total_palavras_lidas_corretas: number;
    total_erros: number;
    erros_por_tipo: {
      mal_pronunciada: number;
      substituida: number;
      omitida: number;
      inserida: number;
    };
  };
  engine?: 'gemini' | 'webspeech';
  recognition_confidence?: number;
}

export interface NeuroSpotMatch {
  palavra: string;
  confianca: number;
  timestamp_inicio_ms?: number;
  timestamp_fim_ms?: number;
}

export interface NeuroSpotWordAnalysis {
  palavra: string;
  status: 'correto' | 'incorreto';
  motivo?: string;
}

export interface NeuroSpotResult {
  palavras_alvo_esperadas: string[];
  palavras_reconhecidas: NeuroSpotMatch[];
  resumo_deteccao: {
    total_palavras_alvo_esperadas: number;
    total_palavras_detectadas_com_sucesso: number;
    palavras_detectadas_por_tipo: Record<string, number>;
  };
  observacoes_adicionais: string;
  modo?: string;
  texto_proferido?: string;
  gabarito_esperado?: string;
  analise_palavras?: NeuroSpotWordAnalysis[];
  resultado_final?: string;
}

export interface Stage {
  id: string;
  name: string;
  description: string;
  defaultText: string;
}

export interface NeuroTarget {
  id: string;
  word: string;
  wordEn: string;
  wordEs: string;
  emoji?: string;
  imageUrl?: string;
  isCustom?: boolean;
}

// RESTORED OLD COMPILER TEMPLATE TYPES
export interface WorkspaceFile {
  name: string;
  path: string;
  content: string;
  language: string;
  sizeBytes: number;
  linesOfCode: number;
}

export interface CompilerLog {
  id: string;
  time: string;
  message: string;
  type: 'info' | 'success' | 'warn' | 'error' | string;
}

export interface CompilerMetrics {
  status: 'idle' | 'compiling' | 'success' | 'error' | 'aborted' | string;
  latencyMs: number;
  ramUsageMb: number;
  progress: number;
  diskFreeGb: number;
}

export interface BridgeConfig {
  throughputMbps: number;
  optimizationLevel: 'O0' | 'O1' | 'O2' | 'O3';
  minify: boolean;
  lintCheck: boolean;
  sourceUrl: string;
  targetId: string;
}
