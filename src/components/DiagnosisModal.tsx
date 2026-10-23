import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface DiagnosisModalProps {
  showDiagnosticModal: boolean;
  isRunningDiagnostic: boolean;
  diagnosticData: any;
  onClose: () => void;
  onRunDiagnose: () => void;
}

export default function DiagnosisModal({
  showDiagnosticModal,
  isRunningDiagnostic,
  diagnosticData,
  onClose,
  onRunDiagnose
}: DiagnosisModalProps) {
  return (
    <AnimatePresence>
      {showDiagnosticModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto flex flex-col gap-6"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="text-indigo-600 animate-pulse" size={24} />
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Diagnóstico do Motor Gemini</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {isRunningDiagnostic ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <p className="text-sm font-black text-indigo-700 uppercase tracking-widest animate-pulse">Testando Conexão e API Key...</p>
                  <p className="text-xs text-slate-500 mt-1">Conectando ao backend Express e validando credenciais de nuvem</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {diagnosticData?.ok ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle2 size={20} className="shrink-0" />
                      <h4 className="font-bold text-sm">Painel Online e Chave 100% Funcional!</h4>
                    </div>
                    <p className="text-xs text-green-800 leading-relaxed">
                      Nossa simulação rápida gerou resposta do modelo <strong>gemini-2.5-flash</strong> perfeitamente em {diagnosticData.apiResponse ? `"${diagnosticData.apiResponse}"` : 'segundos'}.
                    </p>
                    <ul className="text-xs text-green-700 space-y-1.5 mt-1 border-t pt-2 border-green-200 list-disc list-inside">
                      <li><strong>Origem Ativa:</strong> Chave encontrada nas variáveis do servidor</li>
                      <li><strong>Região/Billing:</strong> Servidor do Gemini respondeu sem barreira</li>
                    </ul>
                    <div className="p-3 bg-white border border-green-200 rounded-xl text-[11px] text-slate-600 mt-1 leading-relaxed">
                      💡 <strong>Dica de Prontidão:</strong> Se o motor passou neste teste, mas a análise de áudio fonação continua dando erro 500 noutros áudios, o arquivo de som do discente pode ser muito volumoso para o limite de Upload do Plano Vercel Serverless (4.5 MB).
                      Tente gravar leituras levemente menores ou configure o botão do topo da tela para <strong>Web Speech (Local offline instantâneo)</strong> para testar sem limites!
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col gap-3">
                    <div className="flex items-center gap-2 text-rose-700">
                      <AlertCircle size={20} className="shrink-0" />
                      <h4 className="font-bold text-sm">Falha no Diagnóstico do Motor</h4>
                    </div>

                    {diagnosticData?.phase === 'key_detection' ? (
                      <div className="space-y-2">
                        <p className="text-xs text-rose-900 font-bold">⚠️ STATUS: Chave não detectada pelo Servidor!</p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          O servidor Express não encontrou nenhuma das chaves prioritárias recomendadas (como <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-bold">GEMINI_API_KEY</code> ou <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-bold">Gemini_API_Key</code>) na inicialização.
                        </p>
                        <div className="p-3 bg-white border border-rose-100 rounded-xl text-xs space-y-1.5 text-slate-700 mt-1">
                          <p className="font-bold text-slate-800">Como corrigir na Vercel:</p>
                          <ol className="list-decimal list-inside space-y-1 leading-relaxed text-[11px]">
                            <li>Acesse o painel do seu projeto na Vercel.</li>
                            <li>Vá em <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.</li>
                            <li>Adicione uma chave chamada <code className="bg-slate-100 px-1 py-0.5 rounded font-black text-rose-600">GEMINI_API_KEY</code>.</li>
                            <li>Insira a chave secreta gerada em AI Studio como Value.</li>
                            <li>Certifique-se de que as caixas <strong>Production</strong>, <strong>Preview</strong> e <strong>Development</strong> estão marcadas.</li>
                            <li><strong>Importante:</strong> Vá na aba <strong>Deployments</strong> da Vercel, clique nos três pontinhos do último deploy e selecione <strong>Redeploy</strong> para recompilar a aplicação com as variáveis ativas!</li>
                          </ol>
                        </div>
                      </div>
                    ) : diagnosticData?.phase === 'gemini_api_test' ? (
                      <div className="space-y-2">
                        <p className="text-xs text-rose-900 font-bold">⚠️ STATUS: Chave detectada, mas rejeitada pelo Google Gemini!</p>
                        <p className="text-xs text-rose-800 font-bold bg-white p-2 border border-rose-100 rounded-lg">
                          Erro original da API: <span className="font-mono text-[11px] text-rose-600 break-words">{diagnosticData.error}</span>
                        </p>
                        <div className="p-3 bg-white border border-rose-100 rounded-xl text-xs space-y-1.5 text-slate-700 mt-1">
                          <p className="font-bold text-slate-800">Possíveis causadores:</p>
                          <ul className="list-disc list-inside space-y-1 leading-relaxed text-[11px]">
                            <li>A chave copiada pode estar fragmentada ou com caracteres faltantes.</li>
                            <li>A conta do AI Studio associada à chave pode estar com restrições regionais ou falta de saldo/billing.</li>
                            <li>Verifique em <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">aistudio.google.com</a> se uma nova chave funciona.</li>
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-rose-800 font-bold">Erro desconhecido de conexão com a Vercel:</p>
                        <p className="text-xs text-slate-600 font-mono bg-white p-2 border rounded break-words">{diagnosticData?.error}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t pt-4 text-xs text-slate-500 flex flex-col gap-1">
                  <p><strong>Nível de Escopo:</strong> NeuroSpot / LIRA Acessibilidade Multilíngue</p>
                  <p><strong>Variáveis de Ambiente rastreadas no servidor:</strong> {diagnosticData?.detectedEnvKeys?.length > 0 ? diagnosticData.detectedEnvKeys.join(', ') : 'Nenhuma contendo marcas conhecidas'}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end border-t pt-3">
              <button
                onClick={onRunDiagnose}
                disabled={isRunningDiagnostic}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors uppercase tracking-wider"
              >
                Re-testar Conexão
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors uppercase tracking-wider"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
