import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe } from 'lucide-react';
import { Language } from '../translations';

interface LanguageTransitionModalProps {
  pendingLanguageChange: Language | null;
  selectedLanguage: Language;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LanguageTransitionModal({
  pendingLanguageChange,
  selectedLanguage,
  onCancel,
  onConfirm
}: LanguageTransitionModalProps) {
  return (
    <AnimatePresence>
      {pendingLanguageChange && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 font-sans"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-white rounded-[32px] p-8 md:p-10 max-w-md w-full border border-slate-100 shadow-2xl relative overflow-hidden text-center space-y-6"
          >
            {/* Upper decorative color stripe */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#5A5A40] via-amber-400 to-[#5A5A40]" />

            {/* Globe/Language icon and flags badge */}
            <div className="mx-auto w-16 h-16 bg-[#5A5A40]/10 rounded-full flex items-center justify-center text-[#5A5A40] mb-2">
              <Globe size={32} className="animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                {pendingLanguageChange === 'es'
                  ? 'Confirmar Alteração de Idioma'
                  : 'Confirm Language Change'}
              </h3>
              <p className="text-sm font-bold text-slate-500 max-w-sm mx-auto leading-relaxed">
                {pendingLanguageChange === 'es'
                  ? 'Deseja realmente alterar o idioma do sistema para Espanhol?'
                  : 'Do you really want to change the system language to English?'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                {pendingLanguageChange === 'es'
                  ? 'A interface será traduzida e as avaliações de áudio do LIRA serão ajustadas para o idioma Espanhol.'
                  : 'The interface will be translated and LIRA audio evaluations will be adjusted for English.'}
              </p>
            </div>

            {/* Flags Preview row */}
            <div className="flex items-center justify-center gap-6 py-2 bg-slate-50 rounded-2xl p-4 border border-slate-150">
              <div className="flex flex-col items-center gap-1">
                <img
                  src="/usuk.png"
                  alt="USA UK Flag"
                  className={`w-12 h-8 object-cover rounded-md border shadow-sm ${selectedLanguage === 'en' ? 'opacity-100 border-[#5A5A40] scale-105 ring-2 ring-[#5A5A40]/20' : 'opacity-40'}`}
                  referrerPolicy="no-referrer"
                />
                <span className="text-[9px] font-black uppercase text-slate-500">English</span>
              </div>
              <div className="text-slate-300 text-lg font-black">➔</div>
              <div className="flex flex-col items-center gap-1 font-sans">
                <img
                  src="/esp.png"
                  alt="Spain Flag"
                  className={`w-12 h-8 object-cover rounded-md border shadow-sm ${selectedLanguage === 'es' || pendingLanguageChange === 'es' ? 'opacity-100 border-[#5A5A40] scale-105 ring-2 ring-[#5A5A40]/20' : 'opacity-40'}`}
                  referrerPolicy="no-referrer"
                />
                <span className="text-[9px] font-black uppercase text-slate-500">Español</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                id="confirm-lang-cancel"
                onClick={onCancel}
                className="py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                {pendingLanguageChange === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                id="confirm-lang-confirm"
                onClick={onConfirm}
                className="py-3.5 bg-[#5A5A40] hover:bg-[#4E4E37] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#5A5A40]/20 transition-all cursor-pointer"
              >
                {pendingLanguageChange === 'es' ? 'Confirmar' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
