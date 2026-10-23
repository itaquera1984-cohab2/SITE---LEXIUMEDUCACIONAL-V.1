import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, TrendingUp } from 'lucide-react';
import { ClassRoom, Student } from '../types';

interface EvolutionSectionProps {
  selectedEvolutionClassId: string | null;
  setSelectedEvolutionClassId: (id: string | null) => void;
  classes: ClassRoom[];
  currentSimCycle: number;
  setManagementTab: (tab: 'TURMAS' | 'EVOLUTION') => void;
  getLevelColor: (level: string) => string;
  ClassificationBadge: React.ComponentType<{ value?: string }>;
}

export default function EvolutionSection({
  selectedEvolutionClassId,
  setSelectedEvolutionClassId,
  classes,
  currentSimCycle,
  setManagementTab,
  getLevelColor,
  ClassificationBadge
}: EvolutionSectionProps) {
  const selectedClass = classes.find(c => c.id === selectedEvolutionClassId);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      {!selectedEvolutionClassId ? (
        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setManagementTab('TURMAS')}
              className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400 hover:text-slate-600 transition-colors"
            >
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <TrendingUp size={24} />
                 </div>
                 <h2 className="text-3xl font-black text-slate-900 tracking-tight">Evolução dos Estudantes</h2>
              </div>
              <p className="text-slate-400 font-bold mt-1">Monitore o progresso e registre as classificações externas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(cls => (
              <motion.button
                key={cls.id}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedEvolutionClassId(cls.id)}
                className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-all text-left"
              >
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{cls.name}</h3>
                  <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{cls.students.length} ESTUDANTES</span>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <ChevronRight size={20} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSelectedEvolutionClassId(null)}
                className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm text-slate-400 hover:text-slate-600 transition-colors"
              >
                <ChevronRight size={20} className="rotate-180" />
              </button>
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">
                {selectedClass?.name}
              </h3>
            </div>
            <div className="bg-blue-50 text-blue-700 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl border border-blue-100 shadow-sm">
              Tabela de Acompanhamento
            </div>
          </div>

          <div className="bg-white rounded-[48px] border border-slate-100 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Estudante</th>
                    <th className="px-6 py-6 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Simulado 1</th>
                    <th className="px-6 py-6 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Simulado 2</th>
                    <th className="px-6 py-6 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Simulado 3</th>
                    <th className="px-6 py-6 text-[10px] font-black text-[#5A5A40] uppercase tracking-[0.2em] border-b border-slate-100 text-center">Simulado 4</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-800 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Classificação Final</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedClass?.students.map((student) => {
                    const sims = student.simulations || {};
                    const finalClass = sims.s4?.classification && sims.s4?.classification !== 'NÃO AVALIADO' ? sims.s4?.classification : (sims.s3?.classification && sims.s3?.classification !== 'NÃO AVALIADO' ? sims.s3?.classification : (sims.s2?.classification && sims.s2?.classification !== 'NÃO AVALIADO' ? sims.s2?.classification : (sims.s1?.classification || 'NÃO AVALIADO')));

                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-8 py-4 border-b border-slate-50 last:border-b-0">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black border border-blue-100">
                              {student.name.charAt(0)}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-black text-slate-800">{student.name}</span>
                              {student.indicators.PPI && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-[8px] font-black uppercase tracking-tighter border border-emerald-100">PPI</span>}
                              {student.indicators.BA && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-black uppercase tracking-tighter border border-indigo-100">BA</span>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50 last:border-b-0 text-center">
                          <ClassificationBadge value={sims.s1?.classification} />
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50 last:border-b-0 text-center">
                          <ClassificationBadge value={sims.s2?.classification} />
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50 last:border-b-0 text-center">
                          <ClassificationBadge value={sims.s3?.classification} />
                        </td>
                        <td className="px-6 py-4 border-b border-slate-50 last:border-b-0 text-center">
                          <ClassificationBadge value={sims.s4?.classification} />
                        </td>
                        <td className="px-8 py-4 border-b border-slate-50 last:border-b-0 text-center">
                          <div className={`inline-flex px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${getLevelColor(finalClass)}`}>
                            {finalClass}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
