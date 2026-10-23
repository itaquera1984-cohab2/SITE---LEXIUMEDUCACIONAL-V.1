import React from 'react';
import { motion } from 'motion/react';
import { Mic, Square, Play, RotateCcw, CheckCircle2, Volume2, Trash2, Plus, X, Globe, Cpu, Sparkles } from 'lucide-react';
import { Language } from '../translations';
import { Student, Stage, EvaluationResult, NeuroTarget, NeuroSpotResult } from '../types';
import NeuroSpotClassification from './NeuroSpotClassification';
import { alignWords, alignNeuroSpotWords } from '../utils';

interface EvaluationSectionProps {
  selectedStudent: Student | null;
  selectedLanguage: Language;
  appModule: 'LIRA' | 'NEUROSPOT' | 'FIRST_STEPS';
  setAppModule: (mode: 'LIRA' | 'NEUROSPOT' | 'FIRST_STEPS') => void;
  gradeLevel: number;
  setGradeLevel: (lvl: number) => void;
  stages: Stage[];
  currentStageIndex: number;
  setCurrentStageIndex: (idx: number) => void;
  stageResults: (EvaluationResult | null)[];
  setStageResults: React.Dispatch<React.SetStateAction<(EvaluationResult | null)[]>>;
  showFinalResult: boolean;
  setShowFinalResult: (show: boolean) => void;
  customTargets: NeuroTarget[];
  neuroSpotTargets: string[];
  setNeuroSpotTargets: React.Dispatch<React.SetStateAction<string[]>>;
  newTargetWord: string;
  setNewTargetWord: (word: string) => void;
  newTargetImage: string | null;
  isRecording: boolean;
  timer: number;
  webSpeechTranscript: string;
  setWebSpeechTranscript: (text: string) => void;
  evaluationEngine: 'gemini' | 'webspeech';
  setEvaluationEngine: (eng: 'gemini' | 'webspeech') => void;
  audioUrl: string | null;
  hasRecordedLocal: boolean;
  isEvaluating: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
  evaluateReading: () => void;
  evaluateNeuroSpot: () => void;
  handleNextStage: () => void;
  resetAll: () => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  addCustomTarget: () => void;
  removeCustomTarget: (id: string) => void;
  saveEvaluationResult: () => void;
  runKeyDiagnose: () => void;
  neuroSpotResult: NeuroSpotResult | null;
  allAvailableTargets: NeuroTarget[];
  formatTime: (sec: number) => string;
  getStatusColor: (status: string, engine?: 'gemini' | 'webspeech') => string;
  getLevelColor: (level: string) => string;
  calculateFinalClassification: () => string;
  ClassificationBadge: React.ComponentType<{ value?: string }>;
  getTargetWord: (target: NeuroTarget, lang: Language) => string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  referenceText: string;
  setReferenceText: (text: string) => void;
}

export default function EvaluationSection({
  selectedStudent,
  selectedLanguage,
  appModule,
  setAppModule,
  gradeLevel,
  setGradeLevel,
  stages,
  currentStageIndex,
  setCurrentStageIndex,
  stageResults,
  setStageResults,
  showFinalResult,
  setShowFinalResult,
  customTargets,
  neuroSpotTargets,
  setNeuroSpotTargets,
  newTargetWord,
  setNewTargetWord,
  newTargetImage,
  isRecording,
  timer,
  webSpeechTranscript,
  setWebSpeechTranscript,
  evaluationEngine,
  setEvaluationEngine,
  audioUrl,
  hasRecordedLocal,
  isEvaluating,
  startRecording,
  stopRecording,
  resetRecording,
  evaluateReading,
  evaluateNeuroSpot,
  handleNextStage,
  resetAll,
  handleImageUpload,
  addCustomTarget,
  removeCustomTarget,
  saveEvaluationResult,
  runKeyDiagnose,
  neuroSpotResult,
  allAvailableTargets,
  formatTime,
  getStatusColor,
  getLevelColor,
  calculateFinalClassification,
  ClassificationBadge,
  getTargetWord,
  fileInputRef,
  referenceText,
  setReferenceText
}: EvaluationSectionProps) {
  const currentStage = stages[currentStageIndex];
  const currentNeuroSpotTranslatedWords = neuroSpotTargets.map(id => {
    const t = allAvailableTargets.find(item => item.id === id);
    return t ? getTargetWord(t, selectedLanguage) : '';
  }).filter(Boolean);

  const renderEngineSelector = () => (
    <div className="w-full max-w-md bg-slate-50/80 p-3 rounded-2xl border border-dashed border-slate-200/60 mb-6 flex flex-col gap-2">
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider text-center flex items-center justify-center gap-1.5">
        <Cpu size={12} className="text-[#5A5A40]" /> Motor de voz ({selectedLanguage === 'en' ? 'EN-US' : 'ES-ES'})
      </span>
      <div className="grid grid-cols-2 gap-1 bg-white p-1 rounded-xl border border-black/5">
        <button
          onClick={() => setEvaluationEngine('webspeech')}
          disabled={isRecording || isEvaluating}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50 ${
            evaluationEngine === 'webspeech'
              ? 'bg-[#5A5A40] text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Web Speech (Navegador)
        </button>
        <button
          onClick={() => setEvaluationEngine('gemini')}
          disabled={isRecording || isEvaluating}
          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-50 ${
            evaluationEngine === 'gemini'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Gemini AI (Nuvem)
        </button>
      </div>
      {evaluationEngine === 'webspeech' && (
        <p className="text-[10px] text-amber-700 bg-amber-50/60 p-2 rounded-xl text-center leading-normal border border-amber-100/40">
          O reconhecimento depende do suporte do navegador e pode usar um serviço remoto do próprio navegador. Para melhor compatibilidade, utilize Chrome em HTTPS ou localhost e abra o sistema fora de iframes.
        </p>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
      {/* Sidebar (NEUROSPOT / FIRST_STEPS ONLY) */}
      {(appModule === 'NEUROSPOT' || appModule === 'FIRST_STEPS') && (
        <div className="lg:col-span-4 space-y-6">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-[32px] p-6 shadow-sm border border-black/5"
          >
            <div className="mb-6">
              <h3 className="text-lg font-serif font-bold mb-1">Banco de Imagens</h3>
              <p className="text-xs text-slate-500 font-medium">Adicione figuras customizadas para o teste.</p>
            </div>

            <div className="space-y-4 mb-6 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Significado (ex: Carro)"
                  value={newTargetWord}
                  onChange={(e) => setNewTargetWord(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative h-24 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors overflow-hidden"
                >
                  {newTargetImage ? (
                    <img src={newTargetImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Plus size={20} className="text-slate-400 mb-1" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Upload Imagem</span>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <button
                  onClick={addCustomTarget}
                  disabled={!newTargetWord || !newTargetImage}
                  className="w-full py-2 bg-[#5A5A40] text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50 hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  Adicionar Figura
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Selecione para o Teste</p>
              <div className="grid grid-cols-2 gap-2">
                {allAvailableTargets.map((target) => {
                  const isSelected = neuroSpotTargets.includes(target.id);
                  return (
                    <div key={target.id} className="relative group">
                      <button
                        onClick={() => {
                          setNeuroSpotTargets(prev =>
                            isSelected ? prev.filter(id => id !== target.id) : [...prev, target.id]
                          );
                        }}
                        className={`w-full p-2 rounded-xl border transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'border-[#5A5A40] bg-[#5A5A40]/5 shadow-sm'
                            : 'border-slate-100 bg-white hover:border-slate-200 text-slate-400'
                        }`}
                      >
                        <div className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-lg overflow-hidden shrink-0">
                          {target.emoji ? (
                            <span className="text-2xl">{target.emoji}</span>
                          ) : (
                            <img src={target.imageUrl} alt={target.word} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-tight truncate w-full text-center">
                          {getTargetWord(target, selectedLanguage)}
                        </span>
                      </button>
                      {target.isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCustomTarget(target.id);
                          }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.section>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`${(appModule === 'NEUROSPOT' || appModule === 'FIRST_STEPS') ? 'lg:col-span-8' : 'lg:col-span-12'} space-y-8`}>
        {appModule === 'LIRA' ? (
          !showFinalResult ? (
            <>
              <motion.section
                key={currentStage.id + 'input'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-serif font-bold mb-1">{currentStage.name}</h3>
                  <p className="text-sm text-slate-500">{currentStage.description}</p>
                </div>
                <div className="flex items-center justify-between mb-4 mt-6">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">Reference Text</label>
                  <button
                    onClick={() => setReferenceText('')}
                    className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <textarea
                  value={referenceText}
                  onChange={(e) => setReferenceText(e.target.value)}
                  className="w-full h-32 p-4 bg-[#F9F9F7] border border-[#1A1A1A]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all font-serif text-lg leading-relaxed resize-none"
                />

                {evaluationEngine === 'webspeech' && referenceText && (
                  <div className="mt-6 p-6 bg-slate-50/50 rounded-[24px] border border-slate-250/60 shadow-inner">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 border-b pb-3 border-slate-200/50">
                      <span className="text-[11px] font-black uppercase text-[#5A5A40] tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        Acompanhamento Fonético (Web Speech)
                      </span>
                      <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Correto</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Desvio Leve</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Desvio Grave</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5 leading-relaxed text-lg font-serif antialiased select-none font-normal">
                      {referenceText.split(/\s+/).filter(Boolean).map((refWord, idx) => {
                        const clean = (w: string) => {
                          if (!w) return "";
                          return w.toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "")
                            .replace(/['’"“”‘]/g, "")
                            .trim();
                        };
                        const cleanRefW = clean(refWord);

                        let status: 'correta' | 'mal_pronunciada' | 'substituida' | 'omitida' | 'inserida' | null = null;

                        const finalizedResult = stageResults[currentStageIndex];
                        const alignmentArray = finalizedResult
                          ? finalizedResult.analise_por_palavra
                          : (webSpeechTranscript.trim() ? alignWords(referenceText, webSpeechTranscript) : []);

                        if (alignmentArray && alignmentArray.length > 0) {
                          const match = alignmentArray.find(item => item.palavra_referencia && clean(item.palavra_referencia) === cleanRefW);
                          if (match) {
                            status = match.status;
                          }
                        }

                        let pillColor = "text-slate-500 bg-[#F9F9F7] border-slate-200";
                        if (status === 'correta') {
                          pillColor = "text-emerald-700 bg-emerald-50/80 border-emerald-300 font-semibold shadow-sm shadow-emerald-100";
                        } else if (status === 'mal_pronunciada') {
                          pillColor = "text-blue-700 bg-blue-50/80 border-blue-300 font-semibold shadow-sm shadow-blue-100";
                        } else if (status === 'substituida' || status === 'inserida') {
                          pillColor = "text-rose-700 bg-rose-50/80 border-rose-300 font-semibold shadow-sm shadow-rose-100";
                        } else if (status === 'omitida') {
                          pillColor = finalizedResult
                            ? "text-rose-700 bg-rose-50/80 border-rose-300 font-semibold shadow-sm shadow-rose-100"
                            : "text-slate-500 bg-[#F9F9F7] border-slate-200";
                        }

                        return (
                          <span
                            key={idx}
                            className={`px-3 py-1 rounded-xl border text-lg transition-all transform hover:scale-[1.02] cursor-default ${pillColor}`}
                            title={status ? `Pronúncia: ${status}` : "Aguardando leitura"}
                          >
                            {refWord}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.section>

              <motion.section
                key={currentStage.id + 'recorder'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden"
              >
                {/* Engine Selector */}
                {renderEngineSelector()}

                <div className="mb-8 text-center w-full flex flex-col items-center justify-center">
                  {isRecording ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-4 h-4 bg-rose-500 rounded-full animate-ping mb-2" />
                      <span className="text-4xl font-mono font-medium tracking-tighter">{formatTime(timer)}</span>
                      <p className="text-sm font-medium text-slate-500">Gravando áudio do aluno...</p>

                      {webSpeechTranscript && (
                        <div className="mt-4 p-3 bg-violet-50/50 border border-violet-100 rounded-xl text-xs font-mono text-violet-700 max-w-sm">
                          <span className="font-bold">Live:</span> "{webSpeechTranscript}"
                        </div>
                      )}
                    </div>
                  ) : (audioUrl || (evaluationEngine === 'webspeech' && hasRecordedLocal)) ? (
                    <div className="flex flex-col items-center gap-4 w-full max-w-md">
                      {audioUrl && (
                        <div className="bg-[#F9F9F7] p-4 rounded-2xl border border-black/5 w-full flex justify-center">
                          <audio src={audioUrl} controls className="w-full h-10 max-w-sm" />
                        </div>
                      )}

                      {selectedLanguage === 'es' && evaluationEngine === 'webspeech' && (
                        <div className="w-full text-left bg-slate-50/50 p-4 rounded-2xl border border-slate-100 animate-fadeIn">
                          <label className="text-[10px] uppercase font-black tracking-widest text-[#5A5A40] flex items-center justify-between gap-1 mb-2">
                            <span className="flex items-center gap-1">
                              <Sparkles size={12} />
                              Transcripción Capturada (Web Speech)
                            </span>
                            <span className="text-[9px] bg-[#5A5A40]/10 text-[#5A5A40] px-2 py-0.5 rounded-full font-black">
                              ESPAÑOL (ES)
                            </span>
                          </label>
                          <textarea
                            value={webSpeechTranscript}
                            onChange={(e) => setWebSpeechTranscript(e.target.value)}
                            placeholder="Inicie a gravação e fale. O áudio transcrito localmente aparecerá aqui. Se o microfone falhar ou o navegador silenciar por restrições do iframe, você pode digitar ou colar diretamente a transcrição do aluno neste quadro."
                            className="w-full h-24 p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-mono text-slate-700 resize-none"
                          />
                          <p className="text-[9px] text-slate-400 mt-1">
                            💡 Você pode editar a transcrição acima manualmente para corrigir pequenos erros de fonética antes de enviar para análise.
                          </p>
                        </div>
                      )}
                      <p className="text-sm font-medium text-slate-500">Áudio pronto para análise</p>
                    </div>
                  ) : stageResults[currentStageIndex] ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={32} />
                      </div>
                      <p className="text-sm font-medium text-slate-500">Etapa concluída. Analisado com sucesso.</p>
                      <button
                        onClick={() => {
                          setStageResults(prev => {
                            const clone = [...prev];
                            clone[currentStageIndex] = null;
                            return clone;
                          });
                        }}
                        className="text-xs font-bold text-rose-500 uppercase tracking-widest hover:underline cursor-pointer"
                      >
                        Refazer esta etapa
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-[#F9F9F7] rounded-full flex items-center justify-center text-[#5A5A40]/30">
                        <Volume2 size={40} />
                      </div>
                      <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Pressione para iniciar a leitura</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {!isRecording && !(audioUrl || (evaluationEngine === 'webspeech' && hasRecordedLocal)) && !stageResults[currentStageIndex] ? (
                    <button
                      onClick={startRecording}
                      className="w-20 h-20 bg-[#5A5A40] text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-[#5A5A40]/20 group cursor-pointer"
                    >
                      <Mic size={32} className="group-hover:scale-110 transition-transform" />
                    </button>
                  ) : isRecording ? (
                    <button
                      onClick={stopRecording}
                      className="w-20 h-20 bg-rose-500 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-rose-500/20 group cursor-pointer"
                    >
                      <Square size={32} className="group-hover:scale-110 transition-transform" />
                    </button>
                  ) : (audioUrl || (evaluationEngine === 'webspeech' && hasRecordedLocal)) ? (
                    <div className="flex gap-4">
                      <button
                        onClick={resetRecording}
                        className="px-6 py-3 border border-[#1A1A1A]/10 rounded-full flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:bg-[#F9F9F7] transition-colors cursor-pointer"
                      >
                        <RotateCcw size={18} />
                        Descartar
                      </button>
                      <button
                        onClick={evaluateReading}
                        disabled={isEvaluating}
                        className="px-10 py-3 bg-[#5A5A40] text-white rounded-full flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#5A5A40]/20 disabled:opacity-50 disabled:scale-100 cursor-pointer"
                      >
                        {isEvaluating ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analisando...
                          </>
                        ) : (
                          <>
                            <Play size={18} fill="currentColor" />
                            Analisar Leitura
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <button
                        onClick={handleNextStage}
                        className="px-10 py-4 bg-[#5A5A40] text-white rounded-full flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl cursor-pointer"
                      >
                        {currentStageIndex === stages.length - 1 ? 'Ver Resultado Final' : 'Próxima Etapa'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.section>

              {/* Individual Stage Result (if exists) */}
              {stageResults[currentStageIndex] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-[#5A5A40]">Análise da Etapa</h3>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Precisão</p>
                           <p className="text-xl font-mono">
                             {Math.round((stageResults[currentStageIndex]!.resumo_erros.total_palavras_lidas_corretas / stageResults[currentStageIndex]!.resumo_erros.total_palavras_referencia) * 100)}%
                           </p>
                        </div>
                      </div>
                    </div>

                    {stageResults[currentStageIndex]?.engine === 'webspeech' && (
                      <div className="mb-6 p-4 bg-slate-50/55 rounded-2xl border border-dashed border-slate-200 flex flex-wrap gap-4 items-center justify-around">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Verde (Correto):</span>
                          <span className="text-sm font-extrabold text-[#059669] font-mono">
                            {Math.round((stageResults[currentStageIndex]!.resumo_erros.total_palavras_lidas_corretas / stageResults[currentStageIndex]!.resumo_erros.total_palavras_referencia) * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Azul (Desvio Leve):</span>
                          <span className="text-sm font-extrabold text-[#2563EB] font-mono">
                            {Math.round((stageResults[currentStageIndex]!.resumo_erros.erros_por_tipo.mal_pronunciada / stageResults[currentStageIndex]!.resumo_erros.total_palavras_referencia) * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Vermelho (Desvio Grave):</span>
                          <span className="text-sm font-extrabold text-[#E11D48] font-mono">
                            {Math.round(((stageResults[currentStageIndex]!.resumo_erros.erros_por_tipo.substituida + stageResults[currentStageIndex]!.resumo_erros.erros_por_tipo.omitida) / stageResults[currentStageIndex]!.resumo_erros.total_palavras_referencia) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 leading-relaxed mb-8">
                      {stageResults[currentStageIndex]!.analise_por_palavra.map((word, idx) => (
                        <div
                          key={idx}
                          className={`group relative px-2 py-1 rounded-lg border cursor-help transition-all ${getStatusColor(word.status, stageResults[currentStageIndex]?.engine)}`}
                        >
                          <span className="text-lg font-serif">
                            {word.palavra_referencia || word.palavra_lida_transcrita}
                          </span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#1A1A1A] text-white p-3 rounded-xl text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl pointer-events-none">
                            <p className="font-bold mb-1 opacity-50 uppercase text-[8px]">{word.status}</p>
                            <p>{word.detalhes_erro || 'Palavra lida corretamente'}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#F9F9F7] p-6 rounded-2xl border border-black/5">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Transcrição Detectada</p>
                      <p className="font-serif italic text-slate-600">"{stageResults[currentStageIndex]!.transcricao_completa}"</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            // Final Consolidated LIRA Result View
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div
                className={`p-12 rounded-[48px] shadow-2xl flex flex-col items-center justify-center text-center gap-6 ${getLevelColor(calculateFinalClassification())}`}
              >
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md animate-pulse">
                  <CheckCircle2 size={56} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.4em] opacity-80 mb-3">Nível de Proficiência Consolidado</p>
                  <h2 className="text-5xl font-serif font-bold tracking-tight mb-4">{calculateFinalClassification()}</h2>
                  <p className="max-w-md text-white/80 leading-relaxed font-semibold">
                    O aluno completou todas as 3 etapas de avaliação bilingue. O sistema LIRA Voice AI calculou este nível com base em precisão, fluência e gravidade dos erros detectados.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <button
                    onClick={saveEvaluationResult}
                    className="flex-1 px-8 py-4 bg-white text-emerald-600 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 size={18} />
                    Salvar e Finalizar Simulado
                  </button>
                  <button
                    onClick={resetAll}
                    className="px-8 py-4 bg-white/20 text-white rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/30 transition-all cursor-pointer"
                  >
                    Nova Avaliação
                  </button>
                </div>
              </div>

              {/* Consolidated metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stageResults.map((res, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#5A5A40] mb-4">Etapa {idx + 1}: {stages[idx].name}</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium font-sans">Precisão</span>
                        <span className="text-lg font-mono font-bold">
                          {res ? Math.round((res.resumo_erros.total_palavras_lidas_corretas / res.resumo_erros.total_palavras_referencia) * 100) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500 font-medium">Erros Totais</span>
                        <span className="text-lg font-mono font-bold text-rose-500">{res?.resumo_erros.total_erros || 0}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-1000"
                          style={{ width: `${res ? (res.resumo_erros.total_palavras_lidas_corretas / res.resumo_erros.total_palavras_referencia) * 100 : 0}%` }}
                        />
                      </div>

                      {res?.engine === 'webspeech' && (
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-[11px] font-sans antialiased text-left w-full">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Sinalizações Fonéticas</p>
                          <div className="flex justify-between items-center text-slate-600">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Verde (Correto)</span>
                            <span className="font-mono font-bold text-emerald-600">
                              {Math.round((res.resumo_erros.total_palavras_lidas_corretas / res.resumo_erros.total_palavras_referencia) * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Azul (Erro Leve)</span>
                            <span className="font-mono font-bold text-blue-600">
                              {Math.round((res.resumo_erros.erros_por_tipo.mal_pronunciada / res.resumo_erros.total_palavras_referencia) * 100)}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-600">
                            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Vermelho (Erro Grave)</span>
                            <span className="font-mono font-bold text-rose-600">
                              {Math.round(((res.resumo_erros.erros_por_tipo.substituida + res.resumo_erros.erros_por_tipo.omitida) / res.resumo_erros.total_palavras_referencia) * 100)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div className="bg-white/50 border border-black/5 rounded-[32px] p-8 text-center animate-in fade-in">
                 <p className="text-xs text-slate-400 font-medium max-w-lg mx-auto">
                   Esta classificação é gerada automaticamente por inteligência artificial baseada em parâmetros pedagógicos de leitura bilingue. Recomendamos a revisão periódica por fonoaudiólogos e educadores corporativos de apoio.
                 </p>
              </div>
            </motion.div>
          )
        ) : (
          /* NEUROSPOT MODULE UI */
          <div className="space-y-8 animate-in fade-in">
            <motion.section
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 text-left"
            >
              <div className="mb-6">
                <h3 className="text-xl font-serif font-bold mb-1">
                  {appModule === 'FIRST_STEPS' ? 'First Steps - Infantil (Até 5 anos)' : 'Módulo NeuroSpot'}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {appModule === 'FIRST_STEPS'
                    ? 'Mapeamento fônico do desenvolvimento bilíngue para crianças de até 5 anos. Identifica o pareamento fonológico de palavras-alvo de forma lúdica.'
                    : 'Detector de palavras-alvo. Os itens selecionados abaixo serão os únicos monitorados e validados pelo sistema.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {neuroSpotTargets.length > 0 ? (
                  allAvailableTargets.filter(t => neuroSpotTargets.includes(t.id)).map((target) => {
                    const targetWord = getTargetWord(target, selectedLanguage);
                    const cleanWord = (w: string) => w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
                    const cleanTargetW = cleanWord(targetWord);
                    let status: any = null;
                    let motivo: string | null = null;

                    const activeResult = neuroSpotResult
                      ? neuroSpotResult
                      : (webSpeechTranscript.trim() ? alignNeuroSpotWords(currentNeuroSpotTranslatedWords, webSpeechTranscript) : null);

                    if (activeResult && activeResult.analise_palavras) {
                      const match = activeResult.analise_palavras.find(
                        item => item.palavra && cleanWord(item.palavra) === cleanTargetW
                      );
                      if (match) {
                        status = match.status;
                        motivo = match.motivo || null;
                      }
                    }

                    let cardClass = "bg-[#5A5A40]/5 border-[#5A5A40]/20 text-[#5A5A40]";
                    let badgeText = "";
                    let badgeColor = "";
                    if (status === 'correto' || status === 'correta') {
                      cardClass = "bg-emerald-50/95 border-emerald-300 text-emerald-800 ring-4 ring-emerald-100/50 shadow-md transform hover:scale-[1.02] transition-all";
                      badgeText = "Correto";
                      badgeColor = "bg-emerald-505 bg-emerald-500 text-white";
                    } else if (
                      status === 'mal_pronunciada' ||
                      (status === 'incorreto' && motivo && motivo.toLowerCase().includes('pronúncia incorreta'))
                    ) {
                      cardClass = "bg-blue-50/95 border-blue-300 text-blue-800 ring-4 ring-blue-100/50 shadow-md transform hover:scale-[1.02] transition-all";
                      badgeText = "Desvio Leve";
                      badgeColor = "bg-blue-500 text-white";
                    } else if (status === 'incorreto' || status === 'substituida' || status === 'omitida' || status === 'inserida') {
                      if (!neuroSpotResult && motivo && (motivo.toLowerCase().includes('omitida') || motivo.toLowerCase().includes('não identificada'))) {
                        cardClass = "bg-[#5A5A40]/5 border-[#5A5A40]/20 text-[#5A5A40]";
                        badgeText = "";
                        badgeColor = "";
                      } else {
                        cardClass = "bg-rose-50/95 border-rose-300 text-rose-800 ring-4 ring-rose-100/50 shadow-md transform hover:scale-[1.02] transition-all";
                        badgeText = "Desvio Grave";
                        badgeColor = "bg-rose-500 text-white";
                      }
                    }
                    return (
                      <div
                        key={target.id}
                        className={`p-6 rounded-[24px] border flex flex-col items-center gap-4 shadow-sm relative transition-all duration-300 ${cardClass}`}
                      >
                        {badgeText && <span className={`absolute -top-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm ${badgeColor}`}>{badgeText}</span>}
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-sm overflow-hidden border border-black/5">
                          {target.emoji ? (
                            <span className="text-5xl">{target.emoji}</span>
                          ) : (
                            <img src={target.imageUrl} alt={target.word} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-center">{getTargetWord(target, selectedLanguage)}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Nenhuma figura selecionada no painel esquerdo</p>
                  </div>
                )}
              </div>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden text-center"
            >
              {/* Engine Selector (NeuroSpot / First Steps) */}
              {renderEngineSelector()}

              <div className="mb-8 text-center w-full flex flex-col items-center justify-center">
                {isRecording ? (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-4 h-4 bg-rose-500 rounded-full animate-ping mb-2" />
                    <span className="text-4xl font-mono font-medium tracking-tighter">{formatTime(timer)}</span>
                    <p className="text-sm font-medium text-slate-500">Gravando fala do aluno...</p>

                    {webSpeechTranscript && (
                      <div className="mt-4 p-3 bg-violet-50/50 border border-violet-100 rounded-xl text-xs font-mono text-violet-700 max-w-sm">
                        <span className="font-bold">Live:</span> "{webSpeechTranscript}"
                      </div>
                    )}
                  </div>
                ) : (audioUrl || (evaluationEngine === 'webspeech' && hasRecordedLocal)) ? (
                  <div className="flex flex-col items-center gap-4 w-full max-w-md">
                    {audioUrl && (
                      <div className="bg-[#F9F9F7] p-4 rounded-2xl border border-black/5 w-full flex justify-center">
                        <audio src={audioUrl} controls className="w-full h-10 max-w-sm" />
                      </div>
                    )}

                    {selectedLanguage === 'es' && evaluationEngine === 'webspeech' && (
                      <div className="w-full text-left bg-slate-50/50 p-4 rounded-2xl border border-slate-100 animate-fadeIn">
                        <label className="text-[10px] uppercase font-black tracking-widest text-[#5A5A40] flex items-center justify-between gap-1 mb-2 font-sans">
                          <span className="flex items-center gap-1">
                            <Sparkles size={12} />
                            Transcripción Capturada (Web Speech)
                          </span>
                          <span className="text-[9px] bg-[#5A5A40]/10 text-[#5A5A40] px-2 py-0.5 rounded-full font-black">
                            ESPAÑOL (ES)
                          </span>
                        </label>
                        <textarea
                          value={webSpeechTranscript}
                          onChange={(e) => setWebSpeechTranscript(e.target.value)}
                          placeholder="Inicie a gravação e fale. O áudio transcrito localmente aparecerá aqui. Se o microfone falhar ou o navegador silenciar por restrições do iframe, você pode digitar ou colar diretamente a transcrição do aluno neste quadro."
                          className="w-full h-24 p-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-mono text-slate-700 resize-none font-sans"
                        />
                        <p className="text-[9px] text-slate-400 mt-1">
                          💡 Você pode editar a transcrição acima manualmente para corrigir pequenos erros de fonética antes de enviar para análise.
                        </p>
                      </div>
                    )}
                    <p className="text-sm font-medium text-slate-500 font-sans">Áudio pronto para identificação</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-[#F9F9F7] rounded-full flex items-center justify-center text-[#5A5A40]/30 animate-pulse">
                      <Mic size={40} />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400 font-sans">Pressione para iniciar a detecção</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                {!isRecording && !(audioUrl || (evaluationEngine === 'webspeech' && hasRecordedLocal)) ? (
                  <button
                    onClick={startRecording}
                    className="w-20 h-20 bg-[#5A5A40] text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-[#5A5A40]/20 group cursor-pointer"
                  >
                    <Mic size={32} className="group-hover:scale-110 transition-transform" />
                  </button>
                ) : isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="w-20 h-20 bg-rose-500 text-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-rose-500/20 group cursor-pointer"
                  >
                    <Square size={32} className="group-hover:scale-110 transition-transform" />
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button
                      onClick={resetRecording}
                      className="px-6 py-3 border border-[#1A1A1A]/10 rounded-full flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:bg-[#F9F9F7] transition-colors cursor-pointer"
                    >
                      <RotateCcw size={18} />
                      Descartar
                    </button>
                    <button
                      onClick={evaluateNeuroSpot}
                      disabled={isEvaluating}
                      className="px-10 py-3 bg-[#5A5A40] text-white rounded-full flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[#5A5A40]/20 disabled:opacity-50 disabled:scale-100 cursor-pointer"
                    >
                      {isEvaluating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Detectando...
                        </>
                      ) : (
                        <>
                          <Play size={18} fill="currentColor" />
                          Iniciar Análise
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.section>

            {/* NEUROSPOT RESULTS display */}
            {neuroSpotResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 text-left">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#5A5A40] font-sans">Relatório de Reconhecimento</h3>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold font-sans">
                      <CheckCircle2 size={12} />
                      {neuroSpotResult.resumo_deteccao.total_palavras_detectadas_com_sucesso} palavras identificadas
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Ocorrências Detectadas</p>
                      <div className="space-y-2">
                        {neuroSpotResult.palavras_reconhecidas.length > 0 ? (
                          neuroSpotResult.palavras_reconhecidas.map((match, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-[#F9F9F7] rounded-xl border border-black/5 shadow-xs">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#5A5A40]/10 flex items-center justify-center overflow-hidden">
                                  {(() => {
                                    const t = allAvailableTargets.find(item =>
                                      item.word.toLowerCase() === match.palavra.toLowerCase() ||
                                      (item.wordEn && item.wordEn.toLowerCase() === match.palavra.toLowerCase()) ||
                                      (item.wordEs && item.wordEs.toLowerCase() === match.palavra.toLowerCase())
                                    );
                                    if (t?.emoji) return <span className="text-lg">{t.emoji}</span>;
                                    if (t?.imageUrl) return <img src={t.imageUrl} alt="" className="w-full h-full object-cover" />;
                                    return <span className="text-lg text-[#5A5A40]">🗣️</span>;
                                  })()}
                                </div>
                                <div>
                                  <p className="text-sm font-bold capitalize">{match.palavra}</p>
                                  <p className="text-[10px] text-slate-500 font-sans">Confiança: {Math.round(match.confianca * 100)}%</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                {match.timestamp_inicio_ms ? `${(match.timestamp_inicio_ms/1000).toFixed(1)}s` : ''}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 text-slate-400 italic text-sm font-sans">Nenhuma palavra-alvo identificada no áudio.</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 font-sans">Resumo por Alvo</p>
                        <div className="space-y-3">
                          {Object.entries(neuroSpotResult.resumo_deteccao?.palavras_detectadas_por_tipo || {}).map(([word, count]) => (
                            <div key={word} className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${(count as number) > 0 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                              <span className="text-xs font-bold capitalize w-20 truncate">{word}:</span>
                              <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#5A5A40] h-full" style={{ width: `${Math.min((count as number) * 25, 100)}%` }} />
                              </div>
                              <span className="text-xs font-mono text-slate-500">{count as number}x</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {neuroSpotResult.texto_proferido && (
                        <div className="p-4 bg-[#5A5A40]/5 rounded-2xl border border-[#5A5A40]/15 space-y-3">
                          <p className="text-[10px] font-black text-[#5A5A40] uppercase tracking-widest flex items-center gap-2 font-sans">
                            <Volume2 size={12} /> Quadro de Descrição Fônica
                          </p>
                          <div className="p-3.5 bg-white rounded-xl border border-black/5 shadow-inner">
                            <p className="text-sm font-extrabold text-[#1A1A1A] font-mono leading-relaxed">
                              "{neuroSpotResult.texto_proferido}"
                            </p>
                            <p className="text-[9px] text-slate-400 mt-1.5 font-sans leading-normal">
                              * Transcrição linear literal sem autocorreção. Utilizado pelo aplicador para auditar desvios de fonação do discentes.
                            </p>
                          </div>

                          {neuroSpotResult.analise_palavras && neuroSpotResult.analise_palavras.length > 0 && (
                            <div className="space-y-2 pt-1 text-left">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Matriz de Validação Fonológica:</p>
                              <div className="flex flex-wrap gap-2">
                                {neuroSpotResult.analise_palavras.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-sm transition-all ${
                                      item.status === 'correto'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                                        : 'bg-rose-50/80 text-rose-800 border-rose-100'
                                    }`}
                                    title={item.motivo || undefined}
                                  >
                                    <span className={`w-2 h-2 rounded-full ${item.status === 'correto' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                    <span>{item.palavra}</span>
                                    {item.status === 'incorreto' && item.motivo && (
                                      <span className="text-[9px] opacity-75 font-normal">({item.motivo})</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <AlertCircle size={12} /> Observações
                        </p>
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                          "{neuroSpotResult.observacoes_adicionais}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ethical and Legal compliance classification */}
                <NeuroSpotClassification
                  totalWords={neuroSpotResult.resumo_deteccao.total_palavras_alvo_esperadas}
                  detectedCount={neuroSpotResult.resumo_deteccao.total_palavras_detectadas_com_sucesso}
                  studentName={selectedStudent?.name}
                  language="pt"
                />
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple legacy wrapper for imports
import { AlertCircle } from 'lucide-react';
