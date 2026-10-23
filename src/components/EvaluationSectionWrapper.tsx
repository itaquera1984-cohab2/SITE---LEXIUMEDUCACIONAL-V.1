import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

import { Language, EN_STAGES, ES_STAGES } from '../translations';
import { Student, ClassRoom, EvaluationResult, NeuroSpotResult, Stage, NeuroTarget, SimulationResult } from '../types';
import { NEUROSPOT_PREDEFINED, getTargetWord } from '../utils';
import { calculateReadingClassification } from '../classification';
import DiagnosisModal from './DiagnosisModal';
import EvaluationSection from './EvaluationSection';

interface EvaluationSectionWrapperProps {
  student: Student;
  onBack: () => void;
  classes: ClassRoom[];
  setClasses: React.Dispatch<React.SetStateAction<ClassRoom[]>>;
}

export default function EvaluationSectionWrapper({
  student,
  onBack,
  classes,
  setClasses
}: EvaluationSectionWrapperProps) {
  const [appModule, setAppModule] = useState<'LIRA' | 'NEUROSPOT' | 'FIRST_STEPS'>('LIRA');
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [stageResults, setStageResults] = useState<(EvaluationResult | null)[]>([null, null, null]);
  const [neuroSpotResult, setNeuroSpotResult] = useState<NeuroSpotResult | null>(null);
  const [evaluationEngine, setEvaluationEngine] = useState<'gemini' | 'webspeech'>('webspeech');
  const [webSpeechTranscript, setWebSpeechTranscript] = useState('');
  const [webSpeechConfidence, setWebSpeechConfidence] = useState(0);
  const recognitionRef = useRef<any>(null);
  const webSpeechFinalRef = useRef('');
  const webSpeechConfidencesRef = useRef<number[]>([]);
  const [customTargets, setCustomTargets] = useState<NeuroTarget[]>([]);
  const [neuroSpotTargets, setNeuroSpotTargets] = useState<string[]>(['1', '2', '3']);
  const [gradeLevel, setGradeLevel] = useState<number>(1);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasRecordedLocal, setHasRecordedLocal] = useState(false);
  const [recordingDurationSeconds, setRecordingDurationSeconds] = useState(0);

  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');

  const stages = selectedLanguage === 'es' ? ES_STAGES : EN_STAGES;

  const [referenceText, setReferenceText] = useState(stages[0].defaultText);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [newTargetWord, setNewTargetWord] = useState('');
  const [newTargetImage, setNewTargetImage] = useState<string | null>(null);

  // Diagnostics State
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isRecordingRef = useRef(false);
  const evaluationEngineRef = useRef<'gemini' | 'webspeech'>('webspeech');
  const hasFatalErrorRef = useRef(false);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    evaluationEngineRef.current = evaluationEngine;
  }, [evaluationEngine]);

  const currentStage = stages[currentStageIndex];

  useEffect(() => {
    setReferenceText(currentStage.defaultText);
  }, [selectedLanguage, currentStageIndex, currentStage]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      hasFatalErrorRef.current = false;
      webSpeechFinalRef.current = '';
      webSpeechConfidencesRef.current = [];
      setWebSpeechTranscript('');
      setWebSpeechConfidence(0);
      setHasRecordedLocal(false);
      setRecordingDurationSeconds(0);
      setError(null);

      let stream: MediaStream | null = null;
      let mediaRecorder: MediaRecorder | null = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (userMediaErr) {
        console.warn('Microfone temporariamente indisponível no iframe:', userMediaErr);
        if (evaluationEngine === 'gemini') {
          throw new Error('Acesso ao microfone negado ou indisponível. No modo Gemini AI, gravar o áudio físico do dispositivo é mandatício.');
        } else {
          setError('⚠️ Acesso ao microfone negado/indisponível no iframe. Recomendamos abrir o app em Nova Aba para reconhecimento de voz nativo.');
        }
      }

      if (stream) {
        const formatosApoio = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
        const mimeSelecionado = formatosApoio.find(mime => MediaRecorder.isTypeSupported(mime)) || '';

        mediaRecorder = new MediaRecorder(stream, { mimeType: mimeSelecionado });
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType || 'audio/webm' });
          setAudioBlob(audioBlob);
          setAudioUrl(URL.createObjectURL(audioBlob));
        };
      }

      if (evaluationEngine === 'webspeech') {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const rec = new SpeechRecognition();

          if (selectedLanguage === 'es') {
            rec.lang = 'es-ES';
          } else {
            rec.lang = 'en-US';
          }
          rec.continuous = true;
          rec.interimResults = true;

          rec.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const alternative = event.results[i][0];
              const transcript = alternative.transcript;
              if (event.results[i].isFinal) {
                webSpeechFinalRef.current += `${transcript.trim()} `;
                if (Number.isFinite(alternative.confidence) && alternative.confidence > 0) {
                  webSpeechConfidencesRef.current.push(alternative.confidence);
                }
              } else {
                interimTranscript += `${transcript.trim()} `;
              }
            }
            const confidenceValues = webSpeechConfidencesRef.current;
            const averageConfidence = confidenceValues.length > 0
              ? confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length
              : 0;
            setWebSpeechConfidence(averageConfidence);
            setWebSpeechTranscript(`${webSpeechFinalRef.current}${interimTranscript}`.trim());
          };

          rec.onerror = (e: any) => {
            console.error('[Web Speech Error]:', e);
            if (e.error === 'not-allowed' || e.error === 'permission-denied') {
              hasFatalErrorRef.current = true;
              setError('⚠️ Permissão de voz bloqueada pelo iframe! Abra o app em Nova Aba para reconhecimento local.');
            } else if (e.error === 'language-not-supported') {
              hasFatalErrorRef.current = true;
              setError('⚠️ Idioma não suportado nativamente pelo navegador. Use o Chrome ou o Modo Gemini (Nuvem).');
            } else if (e.error !== 'no-speech') {
              hasFatalErrorRef.current = true;
              setError(`Erro temporário no mecanismo local: ${e.error}`);
            }
          };

          rec.onend = () => {
            if (isRecordingRef.current && evaluationEngineRef.current === 'webspeech' && !hasFatalErrorRef.current) {
              try {
                rec.start();
              } catch (err) {
                console.warn('Falha na re-inicialização do Web Speech:', err);
              }
            }
          };

          recognitionRef.current = rec;
          rec.start();
        } else {
          setError('Navegador incompatível com fonação local (SpeechRecognition). Use o Google Chrome ou alterne para o Modo Nuvem.');
        }
      }

      if (mediaRecorder) {
        mediaRecorder.start();
      }

      setIsRecording(true);
    } catch (err: any) {
      console.error('Audio recording init failed:', err);
      setError(err.message || 'Erro ao iniciar os canais de captação de voz.');
    }
  };

  const stopRecording = () => {
    setHasRecordedLocal(true);
    setRecordingDurationSeconds(Math.max(timer, 1));
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Stop recorder error:', e);
      }
      setIsRecording(false);
      try {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      } catch (e) {
        console.warn('Stream stop error:', e);
      }
    } else {
      setIsRecording(false);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Stop speech error:', e);
      }
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setHasRecordedLocal(false);
    setTimer(0);
    setRecordingDurationSeconds(0);
    setError(null);
    setWebSpeechTranscript('');
    setWebSpeechConfidence(0);
    webSpeechFinalRef.current = '';
    webSpeechConfidencesRef.current = [];
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        console.warn('Speech abort error:', e);
      }
    }
  };

  const changeEvaluationEngine = (engine: 'gemini' | 'webspeech') => {
    if (engine === evaluationEngine) return;
    resetRecording();
    setEvaluationEngine(engine);
  };

  const changeEvaluationLanguage = (language: Language) => {
    if (language === selectedLanguage) return;
    resetRecording();
    setSelectedLanguage(language);
    setCurrentStageIndex(0);
    setStageResults([null, null, null]);
    setNeuroSpotResult(null);
    setShowFinalResult(false);
  };

  const runKeyDiagnose = async () => {
    setIsRunningDiagnostic(true);
    setDiagnosticData(null);
    setShowDiagnosticModal(true);
    try {
      const response = await fetch('/api/debug');
      const data = await response.json();
      setDiagnosticData({
        ok: data.geminiKeyPresent,
        phase: data.geminiKeyPresent ? 'success' : 'key_detection',
        detectedEnvKeys: data.envKeys,
        error: data.geminiKeyPresent ? null : 'GEMINI_API_KEY não foi detectada'
      });
    } catch (err: any) {
      setDiagnosticData({
        ok: false,
        phase: 'fetch_failed',
        error: err.message || 'Erro do servidor'
      });
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const evaluateReading = async () => {
    if (!referenceText) return;
    if (evaluationEngine === 'gemini' && !audioBlob) {
      setError("Por favor, grave o áudio do aluno antes de iniciar a avaliação fônica.");
      return;
    }

    setIsEvaluating(true);
    setError(null);

    if (evaluationEngine === 'webspeech') {
      setTimeout(() => {
        try {
          const rawSpoken = webSpeechTranscript || "";
          if (!rawSpoken.trim()) {
            throw new Error("O mecanismo de voz local não detectou som ou fala audível.");
          }

          import('../utils').then(({ alignWords }) => {
            const parts = alignWords(referenceText, rawSpoken, webSpeechConfidence);
            const totalRef = referenceText.split(/\s+/).filter(Boolean).length;
            const totalCorrect = parts.filter(p => p.status === 'correta').length;
            const malCount = parts.filter(p => p.status === 'mal_pronunciada').length;
            const subCount = parts.filter(p => p.status === 'substituida').length;
            const omitCount = parts.filter(p => p.status === 'omitida').length;
            const insCount = parts.filter(p => p.status === 'inserida').length;

            const evaluation: EvaluationResult = {
              texto_de_referencia_utilizado: referenceText,
              transcricao_completa: rawSpoken,
              duration_seconds: recordingDurationSeconds,
              analise_por_palavra: parts,
              resumo_erros: {
                total_palavras_referencia: totalRef,
                total_palavras_lidas_corretas: totalCorrect,
                total_erros: malCount + subCount + omitCount + insCount,
                erros_por_tipo: {
                  mal_pronunciada: malCount,
                  substituida: subCount,
                  omitida: omitCount,
                  inserida: insCount
                }
              },
              engine: 'webspeech',
              recognition_confidence: webSpeechConfidence,
            };

            const newResults = [...stageResults];
            newResults[currentStageIndex] = evaluation;
            setStageResults(newResults);
            resetRecording();
          }).catch(err => {
            setError('Falha ao carregar utilitários lingüísticos.');
          }).finally(() => {
            setIsEvaluating(false);
          });
        } catch (err: any) {
          setError(err.message || 'Erro ao processar fonação local.');
          setIsEvaluating(false);
        }
      }, 500);
      return;
    }

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        try {
          const response = await fetch('/api/evaluate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              referenceText,
              base64Audio,
              mimeType: audioBlob.type || 'audio/wav',
              language: selectedLanguage,
            }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `Erro: ${response.status}`);
          }

          const evaluation = await response.json();
          evaluation.engine = 'gemini';
          evaluation.duration_seconds = recordingDurationSeconds;

          const newResults = [...stageResults];
          newResults[currentStageIndex] = evaluation;
          setStageResults(newResults);
          resetRecording();
        } catch (err: any) {
          setError(err.message || 'Falha ao processar análise fônica.');
        } finally {
          setIsEvaluating(false);
        }
      };
    } catch (err: any) {
      setError(err.message || 'Erro ao processar fonação.');
      setIsEvaluating(false);
    }
  };

  const evaluateNeuroSpot = async () => {
    if (neuroSpotTargets.length === 0) return;
    if (evaluationEngine === 'gemini' && !audioBlob) {
      setError("Por favor, grave o áudio antes de analisar.");
      return;
    }

    setIsEvaluating(true);
    setError(null);

    const allAvailable = [...NEUROSPOT_PREDEFINED, ...customTargets];
    const translatedTargetWords = neuroSpotTargets.map(id => {
      const t = allAvailable.find(item => item.id === id);
      return t ? getTargetWord(t, selectedLanguage) : '';
    }).filter(Boolean);

    if (evaluationEngine === 'webspeech') {
      setTimeout(() => {
        try {
          const rawSpoken = webSpeechTranscript || "";
          if (!rawSpoken.trim()) {
            throw new Error("O microfone não captou fonações inteligíveis.");
          }
          import('../utils').then(({ alignNeuroSpotWords }) => {
            const result = alignNeuroSpotWords(translatedTargetWords, rawSpoken);
            setNeuroSpotResult(result);
            resetRecording();
          }).finally(() => {
            setIsEvaluating(false);
          });
        } catch (err: any) {
          setError(err.message || 'Erro de processador.');
          setIsEvaluating(false);
        }
      }, 500);
      return;
    }

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        try {
          const response = await fetch('/api/evaluate-neurospot', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              targetWords: translatedTargetWords,
              base64Audio,
              mimeType: audioBlob.type || 'audio/wav',
              language: selectedLanguage,
            }),
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || `Erro: ${response.status}`);
          }

          const result = await response.json();
          setNeuroSpotResult(result);
          resetRecording();
        } catch (err: any) {
          setError(err.message || 'Falha no processador.');
        } finally {
          setIsEvaluating(false);
        }
      };
    } catch (err: any) {
      setError(err.message || 'Erro ao converter amostra.');
      setIsEvaluating(false);
    }
  };

  const handleNextStage = () => {
    if (currentStageIndex < stages.length - 1) {
      setCurrentStageIndex(currentStageIndex + 1);
    } else {
      setShowFinalResult(true);
    }
  };

  const resetAll = () => {
    setCurrentStageIndex(0);
    setStageResults([null, null, null]);
    setShowFinalResult(false);
    setNeuroSpotResult(null);
    resetRecording();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTargetImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCustomTarget = () => {
    if (!newTargetWord || !newTargetImage) return;
    const cleanWord = newTargetWord.toLowerCase().trim();
    const newTarget: NeuroTarget = {
      id: Date.now().toString(),
      word: cleanWord,
      wordEn: cleanWord,
      wordEs: cleanWord,
      imageUrl: newTargetImage,
      isCustom: true
    };
    setCustomTargets([...customTargets, newTarget]);
    setNewTargetWord('');
    setNewTargetImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeCustomTarget = (id: string) => {
    setNeuroSpotTargets(prev => prev.filter(tid => tid !== id));
    setCustomTargets(prev => prev.filter(t => t.id !== id));
  };

  const saveEvaluationResult = () => {
    if (!stageResults.every(r => r !== null)) return;
    const classification = calculateFinalClassification();
    const commonWords = Math.round((stageResults[0]!.resumo_erros.total_palavras_lidas_corretas / stageResults[0]!.resumo_erros.total_palavras_referencia) * 100);
    const complexWords = Math.round((stageResults[1]!.resumo_erros.total_palavras_lidas_corretas / stageResults[1]!.resumo_erros.total_palavras_referencia) * 100);
    const childrenStory = Math.round((stageResults[2]!.resumo_erros.total_palavras_lidas_corretas / stageResults[2]!.resumo_erros.total_palavras_referencia) * 100);

    const result: SimulationResult = { commonWords, complexWords, childrenStory, classification };

    setClasses(prev => prev.map(cls => ({
      ...cls,
      students: cls.students.map(s => s.id === student.id ? {
        ...s,
        score: Math.round((commonWords + complexWords + childrenStory) / 3),
        simulations: { ...(s.simulations || {}), s1: result }
      } : s)
    })));

    onBack();
  };

  const getStatusColor = (status: string, engine?: 'gemini' | 'webspeech') => {
    if (engine === 'webspeech') {
      if (status === 'correta') return 'text-emerald-700 bg-emerald-50 border-emerald-250 font-semibold shadow-sm';
      if (status === 'mal_pronunciada') return 'text-blue-700 bg-blue-50 border-blue-250 font-semibold shadow-sm';
      return 'text-rose-700 bg-rose-50 border-rose-250 font-semibold shadow-sm';
    }
    if (status === 'correta') return 'text-emerald-600 bg-emerald-50 border-[#10b981]/20';
    if (status === 'mal_pronunciada') return 'text-amber-600 bg-amber-50 border-[#f59e0b]/20';
    if (status === 'substituida') return 'text-orange-600 bg-orange-50 border-[#f97316]/20';
    if (status === 'omitida') return 'text-rose-600 bg-rose-50 border-[#f43f5e]/20';
    return 'text-blue-600 bg-blue-50 border-blue-100';
  };

  const getLevelColor = (level: string) => {
    if (!level || level === 'NÃO AVALIADO') return "bg-slate-100 text-slate-400 border border-slate-200 shadow-none";
    if (level === "PRE-READER") return "bg-rose-500 text-white shadow-rose-200";
    if (level === "EMERGENT") return "bg-orange-500 text-white shadow-orange-200";
    if (level === "TRANSITIONAL") return "bg-amber-500 text-white shadow-amber-200";
    return "bg-emerald-500 text-white shadow-emerald-200";
  };

  const calculateFinalClassification = () => {
    if (stageResults.some(r => r === null)) return "Aguardando conclusão...";
    const results = stageResults as EvaluationResult[];
    return calculateReadingClassification(results, gradeLevel).classification;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ClassificationBadge = ({ value }: { value?: string }) => {
    const getBadgeStyle = (val: string) => {
      if (val === 'FLUENT') return 'bg-emerald-50 text-emerald-600 border-emerald-250';
      if (val === 'TRANSITIONAL') return 'bg-amber-50 text-amber-600 border-amber-250';
      if (val === 'EMERGENT') return 'bg-orange-50 text-orange-600 border-orange-250';
      if (val === 'PRE-READER') return 'bg-rose-50 text-rose-600 border-rose-250';
      return 'bg-white text-slate-300 border-slate-100';
    };
    return (
      <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight border min-w-[120px] shadow-sm ${getBadgeStyle(value || 'NÃO AVALIADO')}`}>
        {value || 'NÃO AVALIADO'}
      </div>
    );
  };

  const allAvailable = [...NEUROSPOT_PREDEFINED, ...customTargets];

  return (
    <div className="relative animate-in fade-in slide-in-from-right duration-500">
      {appModule === 'FIRST_STEPS' && (
        <>
          {/* LADO ESQUERDO */}
          <div
            className="fixed left-0 bottom-0 pointer-events-none z-0"
            style={{
              width: "20vw",
              height: "100vh",
              backgroundImage: 'url("/firststeps.png")',
              backgroundSize: "contain",
              backgroundPosition: "left bottom",
              backgroundRepeat: "no-repeat",
              opacity: 0.15,
              filter: "brightness(1.02) saturate(0.90)",
            }}
          />
          {/* LADO DIREITO */}
          <div
            className="fixed right-0 bottom-0 pointer-events-none z-0"
            style={{
              width: "20vw",
              height: "100vh",
              backgroundImage: 'url("/firststeps.png")',
              backgroundSize: "contain",
              backgroundPosition: "right bottom",
              backgroundRepeat: "no-repeat",
              opacity: 0.15,
              filter: "brightness(1.02) saturate(0.90)",
            }}
          />
        </>
      )}

      <div className="relative z-10">
        {/* Brand Navigation */}
        <div className="flex justify-between items-center mb-8 gap-4 text-left">
          <button
            onClick={onBack}
            className="px-4 py-2 text-slate-500 hover:text-slate-800 flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] transition-colors cursor-pointer"
          >
            <ChevronRight size={18} className="rotate-180" />
            Voltar ao Painel
          </button>
          <div className="bg-[#5A5A40]/10 px-6 py-2 rounded-2xl border border-[#5A5A40]/10 shrink-0">
            <p className="text-[10px] font-black text-[#5A5A40] uppercase tracking-widest leading-relaxed">Avaliando: {student?.name || 'Novo Aluno'}</p>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-black/5 shadow-sm mr-3">
            <button
              onClick={() => changeEvaluationLanguage('en')}
              disabled={isRecording || isEvaluating}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all cursor-pointer disabled:opacity-50 ${
                selectedLanguage === 'en' ? 'bg-blue-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => changeEvaluationLanguage('es')}
              disabled={isRecording || isEvaluating}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all cursor-pointer disabled:opacity-50 ${
                selectedLanguage === 'es' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Español
            </button>
          </div>
          <div className="inline-flex p-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-black/5 shadow-sm">
            <button
              onClick={() => setAppModule('LIRA')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                appModule === 'LIRA'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              LIRA Voice AI
            </button>
            <button
              onClick={() => setAppModule('NEUROSPOT')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                appModule === 'NEUROSPOT'
                  ? 'bg-[#5A5A40] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Módulo NeuroSpot
            </button>
            <button
              onClick={() => setAppModule('FIRST_STEPS')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                appModule === 'FIRST_STEPS'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              First Steps
            </button>
          </div>
        </div>

      {appModule === 'LIRA' && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4 text-left">
          <div className="flex items-center gap-3 bg-white px-4 h-20 rounded-2xl border border-black/5 shadow-sm shrink-0">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#5A5A40] whitespace-nowrap leading-relaxed">Série / Ano</span>
            <div className="flex gap-1.5 shrink-0 items-center">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setGradeLevel(lvl)}
                  className={`w-9 h-9 rounded-xl font-bold transition-all text-sm cursor-pointer ${
                    gradeLevel === lvl
                      ? 'bg-[#5A5A40] text-white shadow-lg scale-105'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border'
                  }`}
                >
                  {lvl}º
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar flex-1 lg:justify-end">
            {stages.map((stage, idx) => {
              const isCompleted = stageResults[idx] !== null;
              const isActive = currentStageIndex === idx && !showFinalResult;
              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    setCurrentStageIndex(idx);
                    setShowFinalResult(false);
                  }}
                  className={`flex-1 min-w-[130px] h-20 px-4 rounded-2xl border transition-all text-left flex flex-col justify-center cursor-pointer ${
                    isActive
                      ? 'border-[#5A5A40] bg-[#5A5A40] text-white shadow-lg'
                      : isCompleted
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                        : 'border-black/5 bg-white text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Etapa {idx + 1}</span>
                    {isCompleted && <CheckCircle2 size={14} className="text-emerald-600" />}
                  </div>
                  <p className="text-xs font-bold truncate uppercase">{stage.name}</p>
                </button>
              );
            })}
            <button
              onClick={() => stageResults.every(r => r !== null) && setShowFinalResult(true)}
              disabled={!stageResults.every(r => r !== null)}
              className={`flex-1 min-w-[130px] h-20 px-4 rounded-2xl border transition-all text-left flex flex-col justify-center cursor-pointer ${
                showFinalResult
                  ? 'border-emerald-600 bg-emerald-650 text-white shadow-lg'
                  : 'border-black/5 bg-white text-slate-400 disabled:opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Final</span>
              </div>
              <p className="text-xs font-bold uppercase">Classificação</p>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-black rounded-2xl flex items-center gap-3">
          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full shrink-0 animate-ping" />
          <span>{error}</span>
        </div>
      )}

      {/* Renders Core Sub-layout with full variables */}
      <EvaluationSection
        selectedStudent={student}
        selectedLanguage={selectedLanguage}
        appModule={appModule}
        setAppModule={setAppModule}
        gradeLevel={gradeLevel}
        setGradeLevel={setGradeLevel}
        stages={stages}
        currentStageIndex={currentStageIndex}
        setCurrentStageIndex={setCurrentStageIndex}
        stageResults={stageResults}
        setStageResults={setStageResults}
        showFinalResult={showFinalResult}
        setShowFinalResult={setShowFinalResult}
        customTargets={customTargets}
        neuroSpotTargets={neuroSpotTargets}
        setNeuroSpotTargets={setNeuroSpotTargets}
        newTargetWord={newTargetWord}
        setNewTargetWord={setNewTargetWord}
        newTargetImage={newTargetImage}
        isRecording={isRecording}
        timer={timer}
        webSpeechTranscript={webSpeechTranscript}
        setWebSpeechTranscript={setWebSpeechTranscript}
        evaluationEngine={evaluationEngine}
        setEvaluationEngine={changeEvaluationEngine}
        audioUrl={audioUrl}
        hasRecordedLocal={hasRecordedLocal}
        isEvaluating={isEvaluating}
        startRecording={startRecording}
        stopRecording={stopRecording}
        resetRecording={resetRecording}
        evaluateReading={evaluateReading}
        evaluateNeuroSpot={evaluateNeuroSpot}
        handleNextStage={handleNextStage}
        resetAll={resetAll}
        handleImageUpload={handleImageUpload}
        addCustomTarget={addCustomTarget}
        removeCustomTarget={removeCustomTarget}
        saveEvaluationResult={saveEvaluationResult}
        runKeyDiagnose={runKeyDiagnose}
        neuroSpotResult={neuroSpotResult}
        allAvailableTargets={allAvailable}
        formatTime={formatTime}
        getStatusColor={getStatusColor}
        getLevelColor={getLevelColor}
        calculateFinalClassification={calculateFinalClassification}
        ClassificationBadge={ClassificationBadge}
        getTargetWord={getTargetWord}
        fileInputRef={fileInputRef as any}
        referenceText={referenceText}
        setReferenceText={setReferenceText}
      />

      <DiagnosisModal
        showDiagnosticModal={showDiagnosticModal}
        isRunningDiagnostic={isRunningDiagnostic}
        diagnosticData={diagnosticData}
        onClose={() => setShowDiagnosticModal(false)}
        onRunDiagnose={runKeyDiagnose}
      />
      </div>
    </div>
  );
}
export { CheckCircle2 };
