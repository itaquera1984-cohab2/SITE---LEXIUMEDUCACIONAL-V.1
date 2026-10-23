import React, { useState, useEffect } from 'react';
import { Mic, Search, Trash2, Plus, Users, AlertCircle, TrendingUp, GraduationCap, Laptop, ChevronRight, LogOut, CheckCircle2, Volume2, Globe, Cpu, Sparkles, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Language, t } from './translations';
import { ClassRoom, Student } from './types';
import LanguageTransitionModal from './components/LanguageTransitionModal';
import DiagnosisModal from './components/DiagnosisModal';
import EvolutionSection from './components/EvolutionSection';

// We import the Evaluation wrapper we created for the fonic evaluations
import EvaluationSectionWrapper from './components/EvaluationSectionWrapper';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState('Lexium@Bilingue2026');
  const [loginPass, setLoginPass] = useState('Lex@123');
  const [loginError, setLoginError] = useState('');

  const [logoAnimKey, setLogoAnimKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLogoAnimKey(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const [selectedLanguage, setSelectedLanguage] = useState<Language>('pt' as any); // fallback language or just 'en'/'es'
  const [pendingLanguageChange, setPendingLanguageChange] = useState<Language | null>(null);

  const [appView, setAppView] = useState<'MANAGEMENT' | 'EVALUATION'>('MANAGEMENT');
  const [managementTab, setManagementTab] = useState<'TURMAS' | 'EVOLUTION'>('TURMAS');
  const [schoolName, setSchoolName] = useState('Trails School Bilingue');
  const [isEditingSchoolName, setIsEditingSchoolName] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [selectedEvolutionClassId, setSelectedEvolutionClassId] = useState<string | null>(null);
  const [currentSimCycle, setCurrentSimCycle] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [closedVaarAlertClassIds, setClosedVaarAlertClassIds] = useState<string[]>([]);
  const [shownAutoAlertClassIds, setShownAutoAlertClassIds] = useState<string[]>([]);
  const [temporaryVaarAlert, setTemporaryVaarAlert] = useState<{ classId: string; className: string; diff: number } | null>(null);
  const [activeVaarModalClassId, setActiveVaarModalClassId] = useState<string | null>(null);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  // Diagnostic
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const [isRunningDiagnostic, setIsRunningDiagnostic] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);

  const [classes, setClasses] = useState<ClassRoom[]>([
    {
      id: '1',
      name: '2° ANO A',
      students: [
        { id: '101', name: 'ESTUDANTE DEMO 01', score: 85, indicators: { BF: false, NEE: false, PPI: false, BA: true }, simulations: { s1: { commonWords: 95, complexWords: 88, childrenStory: 92, classification: 'FLUENT' } } },
        { id: '102', name: 'ESTUDANTE DEMO 02', score: 90, indicators: { BF: false, NEE: false, PPI: false, BA: true }, simulations: { s1: { commonWords: 45, complexWords: 30, childrenStory: 25, classification: 'EMERGENT' } } },
        { id: '103', name: 'ESTUDANTE DEMO 03', score: 40, indicators: { BF: false, NEE: false, PPI: true, BA: false }, simulations: { s1: { commonWords: 75, complexWords: 60, childrenStory: 65, classification: 'TRANSITIONAL' } } },
        { id: '104', name: 'ESTUDANTE DEMO 04', score: 45, indicators: { BF: false, NEE: false, PPI: true, BA: false }, simulations: { s1: { commonWords: 40, complexWords: 35, childrenStory: 30, classification: 'EMERGENT' } } },
        { id: '105', name: 'ESTUDANTE DEMO 05', score: 88, indicators: { BF: false, NEE: false, PPI: false, BA: true }, simulations: { s1: { commonWords: 50, complexWords: 40, childrenStory: 45, classification: 'EMERGENT' } } },
        { id: '106', name: 'ESTUDANTE DEMO 06', score: 30, indicators: { BF: true, NEE: false, PPI: true, BA: false }, simulations: { s1: { commonWords: 0, complexWords: 0, childrenStory: 0, classification: 'NÃO AVALIADO' } } },
        { id: '107', name: 'ESTUDANTE DEMO 07', score: 70, indicators: { BF: true, NEE: true, PPI: false, BA: false }, simulations: { s1: { commonWords: 80, complexWords: 70, childrenStory: 75, classification: 'TRANSITIONAL' } } },
        { id: '108', name: 'ESTUDANTE DEMO 08', score: 35, indicators: { BF: true, NEE: false, PPI: true, BA: false }, simulations: { s1: { commonWords: 15, complexWords: 10, childrenStory: 5, classification: 'PRE-READER' } } },
      ]
    },
    {
      id: '2',
      name: '2° ANO B',
      students: [
        { id: '201', name: 'ESTUDANTE DEMO 09', score: 75, indicators: { BF: false, NEE: false, PPI: false, BA: false }, simulations: { s1: { commonWords: 85, complexWords: 80, childrenStory: 82, classification: 'FLUENT' } } },
        { id: '202', name: 'ESTUDANTE DEMO 10', score: 80, indicators: { BF: false, NEE: false, PPI: false, BA: false }, simulations: { s1: { commonWords: 90, complexWords: 85, childrenStory: 88, classification: 'FLUENT' } } },
        { id: '203', name: 'ESTUDANTE DEMO 11', score: 78, indicators: { BF: false, NEE: false, PPI: false, BA: false }, simulations: { s1: { commonWords: 82, complexWords: 78, childrenStory: 80, classification: 'FLUENT' } } },
      ]
    }
  ]);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [addingToClassId, setAddingToClassId] = useState<string | null>(null);
  const [newStudentName, setNewStudentName] = useState('');
  const [studentIndicators, setStudentIndicators] = useState({ BF: false, NEE: false, PPI: false, BA: false });

  const [deletingId, setDeletingId] = useState<{ type: 'CLASS' | 'STUDENT', id: string, parentId?: string } | null>(null);

  const getLevelColor = (level: string) => {
    if (!level || level === 'NÃO AVALIADO') return "bg-slate-100 text-slate-400 border border-slate-200 shadow-none";
    if (level === "PRE-READER") return "bg-rose-500 text-white shadow-rose-250";
    if (level === "EMERGENT") return "bg-orange-500 text-white shadow-orange-250";
    if (level === "TRANSITIONAL") return "bg-amber-500 text-white shadow-amber-250";
    return "bg-emerald-555 bg-emerald-500 text-white shadow-emerald-250";
  };

  const ClassificationBadge = ({ value }: { value?: string }) => {
    const getBadgeStyle = (val: string) => {
      if (val === 'FLUENT') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      if (val === 'TRANSITIONAL') return 'bg-amber-50 text-amber-600 border-amber-200';
      if (val === 'EMERGENT') return 'bg-orange-50 text-orange-600 border-orange-200';
      if (val === 'PRE-READER') return 'bg-rose-50 text-rose-600 border-rose-200';
      return 'bg-white text-slate-300 border-slate-100';
    };
    return (
      <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight border min-w-[120px] shadow-sm ${getBadgeStyle(value || 'NÃO AVALIADO')}`}>
        {value || 'NÃO AVALIADO'}
      </div>
    );
  };

  useEffect(() => {
    // Find all class IDs currently meeting the discrepancy
    const currentDiscrepantClasses = classes.filter(cls => {
      const evaluatedBA = cls.students.filter(s => s.indicators.BA && s.simulations?.s1);
      const evaluatedPPI = cls.students.filter(s => s.indicators.PPI && s.simulations?.s1);
      if (evaluatedBA.length === 0 || evaluatedPPI.length === 0) return false;

      const getScore = (s: Student) => {
        if (s.score !== undefined) return s.score;
        const sim = s.simulations?.s1;
        if (!sim) return 0;
        return (sim.commonWords + sim.complexWords + sim.childrenStory) / 3;
      };

      const avgBA = evaluatedBA.reduce((acc, s) => acc + getScore(s), 0) / evaluatedBA.length;
      const avgPPI = evaluatedPPI.reduce((acc, s) => acc + getScore(s), 0) / evaluatedPPI.length;
      return (avgBA - avgPPI >= 25);
    });

    // We only trigger temporary alert if we find a class with discrepancy that we haven't tracked yet
    currentDiscrepantClasses.forEach(cls => {
      setShownAutoAlertClassIds(prev => {
        if (!prev.includes(cls.id)) {
          const evaluatedBA = cls.students.filter(s => s.indicators.BA && s.simulations?.s1);
          const evaluatedPPI = cls.students.filter(s => s.indicators.PPI && s.simulations?.s1);
          const getScore = (s: Student) => {
            if (s.score !== undefined) return s.score;
            const sim = s.simulations?.s1;
            if (!sim) return 0;
            return (sim.commonWords + sim.complexWords + sim.childrenStory) / 3;
          };
          const avgBA = evaluatedBA.reduce((acc, s) => acc + getScore(s), 0) / evaluatedBA.length;
          const avgPPI = evaluatedPPI.reduce((acc, s) => acc + getScore(s), 0) / evaluatedPPI.length;
          const diff = avgBA - avgPPI;

          setTemporaryVaarAlert({
            classId: cls.id,
            className: cls.name,
            diff: diff
          });

          // Dismiss after 2.5 seconds (2500ms)
          setTimeout(() => {
            setTemporaryVaarAlert(current => {
              if (current && current.classId === cls.id) {
                return null;
              }
              return current;
            });
          }, 2500);

          return [...prev, cls.id];
        }
        return prev;
      });
    });

    // Reset tracking for class IDs that no longer have a discrepancy
    setShownAutoAlertClassIds(prev => {
      const activeIds = currentDiscrepantClasses.map(c => c.id);
      return prev.filter(id => activeIds.includes(id));
    });
  }, [classes]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (loginUser === 'admin' && loginPass === 'admin') ||
      (loginUser === 'Lexium@Bilingue2026' && loginPass === 'Lex@123')
    ) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Credenciais incorretas. Usuário padrão: Lexium@Bilingue2026 / Lex@123');
    }
  };

  // Class Management logic
  const addClass = () => {
    if (!newClassName.trim()) return;
    const newClass: ClassRoom = {
      id: Date.now().toString(),
      name: newClassName.toUpperCase().trim(),
      students: []
    };
    setClasses([...classes, newClass]);
    setNewClassName('');
    setIsAddingClass(false);
  };

  const deleteClass = (classId: string) => {
    setClasses(classes.filter(c => c.id !== classId));
    setDeletingId(null);
  };

  const addStudent = (classId: string) => {
    if (!newStudentName.trim()) return;
    const newStudent: Student = {
      id: Date.now().toString(),
      name: newStudentName.toUpperCase().trim(),
      score: 50,
      indicators: { ...studentIndicators }
    };
    setClasses(classes.map(cls => cls.id === classId ? {
      ...cls,
      students: [...cls.students, newStudent]
    } : cls));
    setNewStudentName('');
    setStudentIndicators({ BF: false, NEE: false, PPI: false, BA: false });
    setAddingToClassId(null);
  };

  const deleteStudent = (classId: string, studentId: string) => {
    setClasses(classes.map(cls => cls.id === classId ? {
      ...cls,
      students: cls.students.filter(s => s.id !== studentId)
    } : cls));
    setDeletingId(null);
  };

  const toggleStudentIndicator = (classId: string, studentId: string, indicator: 'BF' | 'NEE' | 'PPI' | 'BA') => {
    setClasses(classes.map(cls => cls.id === classId ? {
      ...cls,
      students: cls.students.map(s => s.id === studentId ? {
        ...s,
        indicators: {
          ...s.indicators,
          [indicator]: !s.indicators[indicator]
        }
      } : s)
    } : cls));
  };

  const runDiagnostics = async () => {
    setIsRunningDiagnostic(true);
    setDiagnosticData(null);
    setShowDiagnosticModal(true);
    try {
      const res = await fetch('/api/debug');
      const data = await res.json();
      setDiagnosticData({
        ok: data.geminiKeyPresent,
        phase: data.geminiKeyPresent ? 'success' : 'key_detection',
        detectedEnvKeys: data.envKeys,
        error: data.geminiKeyPresent ? null : 'Chave de segurança ausente no ambiente'
      });
    } catch (err: any) {
      setDiagnosticData({
        ok: false,
        phase: 'fetch_failed',
        error: err.message || 'Erro ao conectar ao servidor'
      });
    } finally {
      setIsRunningDiagnostic(false);
    }
  };

  const generateReportPdf = (classroom: ClassRoom) => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(90, 90, 64);
    doc.text(`RELATÓRIO DA TURMA - ${classroom.name}`, 14, 20);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Centro Escolar: ${schoolName}`, 14, 27);
    doc.text(`Critério de Equalização: Bolsa Família (BA) / PPI / Educação Especial (NEE)`, 14, 32);

    const tableRows: any[] = [];
    classroom.students.forEach(student => {
      const activeIndicators: string[] = [];
      if (student.indicators.BF) activeIndicators.push("BF");
      if (student.indicators.NEE) activeIndicators.push("NEE");
      if (student.indicators.PPI) activeIndicators.push("PPI");
      if (student.indicators.BA) activeIndicators.push("BA");

      const s1Res = student.simulations?.s1;
      const statusText = s1Res ? `${s1Res.classification} (Comum: ${s1Res.commonWords}%, Comp: ${s1Res.complexWords}%)` : 'NÃO AVALIADO';

      tableRows.push([
        student.name,
        activeIndicators.join(", ") || "Sem Restrições",
        statusText
      ]);
    });

    autoTable(doc, {
      startY: 40,
      head: [['Nome Completo do Aluno', 'Marcadores Sociais / Apoio', 'Etapa 1 Simulado']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [90, 90, 64] },
      styles: { fontSize: 9 }
    });

    doc.save(`relatorio_${classroom.name.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFDFB] flex items-center justify-center p-4 selection:bg-[#5A5A40]/10 font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[40px] p-10 md:p-12 border border-slate-200/60 shadow-xl flex flex-col items-center gap-8 relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-[#5A5A40] via-teal-150 to-slate-900" />

          <div className="flex flex-col items-center gap-3">
            <img
              alt="Lexium Logo"
              className="h-20 w-auto object-contain transition-all hover:scale-105"
              referrerPolicy="no-referrer"
              src="/lexium.png"
            />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">
              LIRA Voice AI Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="w-full space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block font-sans">
                Usuário / Login
              </label>
              <input
                id="login-username"
                required
                placeholder="Ex: Lexium@Bilingue2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] transition-all text-sm"
                type="text"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
              />
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block font-sans">
                Senha / Password
              </label>
              <input
                id="login-password"
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-slate-900 placeholder:text-slate-305 outline-none focus:ring-4 focus:ring-[#5A5A40]/10 focus:border-[#5A5A40] transition-all text-sm"
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
              />
            </div>

            {loginError && (
              <p className="text-xs font-bold text-rose-500 text-center animate-pulse">{loginError}</p>
            )}

            <button
              id="login-submit-button"
              type="submit"
              className="w-full py-4 bg-[#5A5A40] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4E4E37] hover:shadow-xl hover:shadow-[#5A5A40]/30 transition-all cursor-pointer text-center"
            >
              Acessar Sistema
            </button>
          </form>

          <footer className="text-center">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">
              Developed by HENRIQUE MORAIS © 2026
            </span>
          </footer>
        </motion.div>
      </div>
    );
  }

  // Active evaluation view
  if (appView === 'EVALUATION' && selectedStudent) {
    return (
      <div className="min-h-screen bg-[#FDFDFB] p-4 md:p-8 font-sans transition-colors duration-500">
        <div className="max-w-6xl mx-auto">
          <EvaluationSectionWrapper
            // Evaluates using the bilingue simulator wrapper
            student={selectedStudent}
            onBack={() => {
              setAppView('MANAGEMENT');
              setSelectedStudent(null);
            }}
            classes={classes}
            setClasses={setClasses}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFB] p-0 font-sans selection:bg-[#5A5A40]/15">
      {/* CUSTOM BRAND HEADER */}
      <div className="w-full px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between bg-white border-b border-slate-200 print:hidden">
        <div className="flex items-center w-40">
          <motion.img
            key={logoAnimKey}
            alt="Trails School Bilingue Logo"
            referrerPolicy="no-referrer"
            src="/Lexbilingueuk.png"
            style={{ height: "85px", width: "auto", objectFit: "contain", cursor: "pointer" }}
            initial={{ filter: "grayscale(100%) contrast(1.2)" }}
            animate={{ filter: "grayscale(0%) contrast(1)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            onMouseEnter={() => setLogoAnimKey(prev => prev + 1)}
          />
        </div>
        <div className="flex flex-col justify-center flex-1 px-4 text-center">
          <div className="inline-flex flex-col items-center">
            <p style={{ fontFamily: "sans-serif", fontSize: "14px", color: "rgb(100, 116, 139)", letterSpacing: "1px", margin: "0px", fontWeight: 600 }}>
              PAINEL DE GESTÃO EDUCACIONAL
            </p>
            <h1 style={{ fontFamily: "sans-serif", fontSize: "28px", fontWeight: "bold", color: "rgb(30, 41, 59)", margin: "0px", lineHeight: 1.2 }}>
              Trails School Bilingue
            </h1>
            <p style={{ fontFamily: "sans-serif", fontSize: "16px", color: "rgb(71, 85, 105)", margin: "4px 0px 0px" }}>
              Sistema de Acompanhamento de Aprendizagem
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end w-48">
          <img
            alt="Logo Lexium"
            referrerPolicy="no-referrer"
            className="h-20 md:h-28 w-auto object-contain transition-transform hover:scale-105"
            src="/lexium.png"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-10">
        {/* SLEEK ACTIONS BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/80 px-6 py-4 rounded-2xl border border-slate-150 text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Unidade Escolar:</span>
            {isEditingSchoolName ? (
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                onBlur={() => setIsEditingSchoolName(false)}
                className="font-bold text-slate-800 border-b border-slate-400 focus:outline-none w-48 uppercase bg-transparent text-xs"
                autoFocus
              />
            ) : (
              <button
                onClick={() => setIsEditingSchoolName(true)}
                className="font-bold text-slate-800 uppercase hover:text-[#5A5A40] transition-colors flex items-center gap-1.5"
              >
                {schoolName} <Pencil size={12} className="text-slate-400" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={runDiagnostics}
              className="py-2 px-4 bg-white border border-slate-200 rounded-xl flex items-center gap-1.5 text-[9px] text-slate-600 font-bold uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
            >
              <Cpu size={12} className="text-[#5A5A40] animate-pulse" /> Diagnosticar Conexão
            </button>
            <div className="h-4 w-px bg-slate-200" />
            <button
              onClick={() => setIsAuthenticated(false)}
              className="py-2 px-4 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider transition-colors cursor-pointer border border-rose-100"
              title="Logout"
            >
              <LogOut size={12} /> Sair
            </button>
          </div>
        </div>

        {/* CLOCK & SEARCH BAR */}
        <section className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-left">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
            <input
              type="text"
              placeholder="Pesquisar discentes ou marcadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-4 bg-[#5A5A40]/5 rounded-2xl border border-[#5A5A40]/10 px-6 py-3 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#5A5A40] animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#5A5A40]">Avaliador Ativo</span>
          </div>
        </section>

        {/* MAIN VIEWS SWITCH */}
        <div className="flex mb-4">
          <div className="inline-flex p-1 bg-white/50 backdrop-blur-sm rounded-2xl border border-black/5 shadow-sm">
            <button
              onClick={() => setManagementTab('TURMAS')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                managementTab === 'TURMAS'
                  ? 'bg-[#5A5A40] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Gerenciar Turmas
            </button>
            <button
              onClick={() => setManagementTab('EVOLUTION')}
              className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all cursor-pointer ${
                managementTab === 'EVOLUTION'
                  ? 'bg-[#5A5A40] text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Evolução e Simulação S1-S4
            </button>
          </div>
        </div>

        {/* EVOLUTION OR TABLES */}
        <AnimatePresence mode="wait">
          {managementTab === 'EVOLUTION' ? (
            <EvolutionSection
              {...({
                key: "evolution-tab",
                selectedEvolutionClassId,
                setSelectedEvolutionClassId,
                classes,
                currentSimCycle,
                setManagementTab: setManagementTab as any,
                getLevelColor,
                ClassificationBadge
              } as any)}
            />
          ) : (
            <motion.div
              key="management-tab"
              className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[28px] border border-black/5">
                <div>
                  <h2 className="text-xl font-serif font-black tracking-tight text-slate-800 uppercase">Salas Cadastradas</h2>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">Cadastre turmas e discentes para triagem fônica.</p>
                </div>
                <button
                  onClick={() => setIsAddingClass(true)}
                  className="py-3 px-6 bg-[#5A5A40] hover:bg-[#4E4E37] text-white rounded-2xl flex items-center gap-2 text-xs font-black uppercase tracking-widest cursor-pointer hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#5A5A40]/10"
                >
                  <Plus size={16} /> Nova Turma
                </button>
              </div>

              {isAddingClass && (
                <div className="p-6 bg-white rounded-3xl border border-black/5 shadow-inner flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Nome da Sala (ex: 2° ANO C)"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border rounded-2xl"
                  />
                  <button onClick={addClass} className="py-3 px-6 bg-emerald-600 text-white rounded-xl text-xs uppercase font-black cursor-pointer">Confirmar</button>
                  <button onClick={() => setIsAddingClass(false)} className="py-3 px-6 bg-slate-200 rounded-xl text-xs uppercase font-black cursor-pointer">Cancelar</button>
                </div>
              )}

              {/* CLASSROOMS LIST */}
              <div className="grid grid-cols-1 gap-8">
                {classes.map((classroom) => {
                  const filteredStudents = classroom.students.filter(student =>
                    student.name.toLowerCase().includes(searchTerm.toLowerCase())
                  );

                  const totalStudents = classroom.students.length;
                  const bfCount = classroom.students.filter(s => s.indicators.BF).length;
                  const neeCount = classroom.students.filter(s => s.indicators.NEE).length;
                  const ppiCount = classroom.students.filter(s => s.indicators.PPI).length;
                  const baCount = classroom.students.filter(s => s.indicators.BA).length;

                  const bfPct = totalStudents > 0 ? (bfCount / totalStudents) * 100 : 0;
                  const neePct = totalStudents > 0 ? (neeCount / totalStudents) * 100 : 0;
                  const ppiPct = totalStudents > 0 ? (ppiCount / totalStudents) * 100 : 0;
                  const baPct = totalStudents > 0 ? (baCount / totalStudents) * 100 : 0;

                  let vulnerabilityLevel = 'Baixa';
                  let vulnerabilityColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                  if (bfPct > 35) {
                    vulnerabilityLevel = 'ALTA (Turma Vulnerável)';
                    vulnerabilityColor = 'text-rose-700 bg-rose-50 border-rose-300 animate-pulse';
                  } else if (bfPct >= 15) {
                    vulnerabilityLevel = 'MÉDIA';
                    vulnerabilityColor = 'text-amber-700 bg-amber-50 border-amber-300';
                  }

                  const evaluatedBA = classroom.students.filter(s => s.indicators.BA && s.simulations?.s1);
                  const evaluatedPPI = classroom.students.filter(s => s.indicators.PPI && s.simulations?.s1);

                  const getStudentCalcScore = (s: Student) => {
                    if (s.score !== undefined) return s.score;
                    const sim = s.simulations?.s1;
                    if (!sim) return 0;
                    return (sim.commonWords + sim.complexWords + sim.childrenStory) / 3;
                  };

                  const avgBA = evaluatedBA.length > 0
                    ? evaluatedBA.reduce((acc, s) => acc + getStudentCalcScore(s), 0) / evaluatedBA.length
                    : 0;
                  const avgPPI = evaluatedPPI.length > 0
                    ? evaluatedPPI.reduce((acc, s) => acc + getStudentCalcScore(s), 0) / evaluatedPPI.length
                    : 0;

                  const hasVaarDiscrepancy = evaluatedBA.length > 0 && evaluatedPPI.length > 0 && (avgBA - avgPPI >= 25);

                  return (
                    <div key={classroom.id} className="bg-white rounded-[36px] border border-slate-100 shadow-xl overflow-hidden text-left relative">
                      <div className="px-8 py-6 bg-slate-50/50 border-b border-slate-100/60 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#5A5A40] text-white rounded-xl flex items-center justify-center">
                            <Users size={20} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">{classroom.name}</h3>
                              {hasVaarDiscrepancy && (
                                <button
                                  onClick={() => setActiveVaarModalClassId(classroom.id)}
                                  className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-[9px] font-black uppercase tracking-wider cursor-pointer animate-pulse flex items-center gap-1 shrink-0 shadow-sm border border-amber-600"
                                  title="Clique para ver Detalhes da Condicionalidade VAAR 3"
                                >
                                  <AlertCircle size={10} /> VAAR 3
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{classroom.students.length} estudantes cadastrados</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => generateReportPdf(classroom)}
                            className="bg-white border text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            Exportar Turma (PDF)
                          </button>
                          <button
                            onClick={() => setAddingToClassId(classroom.id)}
                            className="px-4 py-2 bg-[#5A5A40]/10 text-[#5A5A40] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#5A5A40]/25 transition-all cursor-pointer"
                          >
                            + Discente
                          </button>
                          <button
                            onClick={() => setDeletingId({ type: 'CLASS', id: classroom.id })}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* STATS AND EQUALIZATION RIBBON */}
                      <div className="px-8 py-4 bg-slate-50/20 border-b border-slate-150 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
                        <div className="space-y-1 bg-white p-3 rounded-2xl border border-black/[0.03] shadow-xs">
                          <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-slate-400">
                            <span>Vulnerabilidade (BF)</span>
                            <span className={bfPct > 35 ? "text-rose-600 font-extrabold" : "text-[#5A5A40] font-bold"}>{bfPct.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-500 ${bfPct > 35 ? 'bg-rose-500' : 'bg-[#5A5A40]'}`} style={{ width: `${bfPct}%` }} />
                          </div>
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border ${vulnerabilityColor}`}>
                            Escala: {vulnerabilityLevel}
                          </span>
                        </div>

                        <div className="space-y-1 bg-white p-3 rounded-2xl border border-black/[0.03] shadow-xs">
                          <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-slate-400">
                            <span>Neuro Divergente (NEE)</span>
                            <span className="text-slate-600 font-bold">{neePct.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${neePct}%` }} />
                          </div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{neeCount} discentes</span>
                        </div>

                        <div className="space-y-1 bg-white p-3 rounded-2xl border border-black/[0.03] shadow-xs">
                          <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-slate-400">
                            <span>Preto/Pardo/Índig. (PPI)</span>
                            <span className="text-emerald-605 text-emerald-600 font-bold">{ppiPct.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${ppiPct}%` }} />
                          </div>
                          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">{ppiCount} discentes</span>
                        </div>

                        <div className="space-y-1 bg-white p-3 rounded-2xl border border-black/[0.03] shadow-xs">
                          <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-wider text-slate-400">
                            <span>Branco/Amarelo (BA)</span>
                            <span className="text-indigo-600 font-bold">{baPct.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${baPct}%` }} />
                          </div>
                          <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">{baCount} discentes</span>
                        </div>
                      </div>

                      {hasVaarDiscrepancy && (
                        <div
                          onClick={() => setActiveVaarModalClassId(classroom.id)}
                          className="mx-8 mt-4 p-4 bg-orange-50/60 border border-orange-200 hover:bg-orange-100/65 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 animate-pulse cursor-pointer transition-colors"
                          title="Clique para abrir detalhes da Condicionalidade VAAR 3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full shrink-0" />
                            <div>
                              <p className="text-xs font-black text-orange-850 uppercase tracking-wider">Desequilíbrio de Equidade de Notas (Condicionalidade VAAR 3 - Equidade)</p>
                              <p className="text-[10px] text-orange-650 font-bold leading-relaxed mt-0.5">
                                Estudantes BA superaram PPI em {(avgBA - avgPPI).toFixed(1)} pontos (Média BA: {avgBA.toFixed(1)}% | Média PPI: {avgPPI.toFixed(1)}%). Clique para abrir o plano pedagógico de equidade e relatório.
                              </p>
                            </div>
                          </div>
                          <span className="bg-orange-100 hover:bg-orange-200 text-orange-850 px-3 py-1.5 rounded-xl text-[9px] font-black tracking-widest uppercase shrink-0 text-center border border-orange-250">
                            Ver Diretiva VAAR 3
                          </span>
                        </div>
                      )}

                      {addingToClassId === classroom.id && (
                        <div className="p-6 bg-slate-50/50 border-b flex flex-col gap-4 animate-in slide-in-from-top duration-300">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              placeholder="Nome Completo do Aluno"
                              value={newStudentName}
                              onChange={(e) => setNewStudentName(e.target.value)}
                              className="flex-1 px-4 py-3 bg-white border rounded-2xl uppercase"
                            />
                            <button onClick={() => addStudent(classroom.id)} className="py-3 px-6 bg-emerald-600 text-white rounded-xl text-xs uppercase font-black cursor-pointer">Adicionar</button>
                            <button onClick={() => setAddingToClassId(null)} className="py-3 px-6 bg-slate-200 rounded-xl text-xs uppercase font-black cursor-pointer">Cancelar</button>
                          </div>

                          <div className="flex items-center gap-6">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Atribuir Marcadores Sociais / Equalizadores:</span>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase">
                                <input
                                  type="checkbox"
                                  checked={studentIndicators.BF}
                                  onChange={(e) => setStudentIndicators({ ...studentIndicators, BF: e.target.checked })}
                                  className="w-4 h-4 text-[#5A5A40] border-gray-300 rounded focus:ring-[#5A5A40]"
                                />
                                Bolsa Família (BF)
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase">
                                <input
                                  type="checkbox"
                                  checked={studentIndicators.NEE}
                                  onChange={(e) => setStudentIndicators({ ...studentIndicators, NEE: e.target.checked })}
                                  className="w-4 h-4 text-[#5A5A40] border-gray-300 rounded focus:ring-[#5A5A40]"
                                />
                                NEE (Neuro Divergente)
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase">
                                <input
                                  type="checkbox"
                                  checked={studentIndicators.PPI}
                                  onChange={(e) => setStudentIndicators({ ...studentIndicators, PPI: e.target.checked })}
                                  className="w-4 h-4 text-[#5A5A40] border-gray-300 rounded focus:ring-[#5A5A40]"
                                />
                                PPI (Preto, Pardo, Indígena)
                              </label>

                              <label className="flex items-center gap-2 cursor-pointer text-xs font-black uppercase">
                                <input
                                  type="checkbox"
                                  checked={studentIndicators.BA}
                                  onChange={(e) => setStudentIndicators({ ...studentIndicators, BA: e.target.checked })}
                                  className="w-4 h-4 text-[#5A5A40] border-gray-300 rounded focus:ring-[#5A5A40]"
                                />
                                BA (Branco, Amarelo)
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="divide-y divide-slate-100/60 max-h-[350px] overflow-y-auto custom-scrollbar">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => {
                            const lastClassification = student.simulations?.s1?.classification || 'NÃO AVALIADO';
                            return (
                              <div key={student.id} className="px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/45 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center text-xs font-black border border-[#5A5A40]/20 shrink-0">
                                    {student.name.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-black text-slate-800 leading-tight uppercase font-sans tracking-wide flex items-center gap-2">
                                      {student.indicators.NEE && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 border border-blue-300 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 animate-pulse">
                                          Apoio Pedagógico Necessário
                                        </span>
                                      )}
                                      <span>{student.name}</span>
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      <button
                                        onClick={() => toggleStudentIndicator(classroom.id, student.id, 'BF')}
                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border transition-all cursor-pointer ${
                                          student.indicators.BF
                                            ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                        }`}
                                        title="Bolsa Família"
                                      >
                                        BF {student.indicators.BF ? '●' : '○'}
                                      </button>
                                      <button
                                        onClick={() => toggleStudentIndicator(classroom.id, student.id, 'NEE')}
                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border transition-all cursor-pointer ${
                                          student.indicators.NEE
                                            ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                        }`}
                                        title="Neuro Divergente"
                                      >
                                        NEE {student.indicators.NEE ? '●' : '○'}
                                      </button>
                                      <button
                                        onClick={() => toggleStudentIndicator(classroom.id, student.id, 'PPI')}
                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border transition-all cursor-pointer ${
                                          student.indicators.PPI
                                            ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                        }`}
                                        title="Preto, Pardo, Indígena"
                                      >
                                        PPI {student.indicators.PPI ? '●' : '○'}
                                      </button>
                                      <button
                                        onClick={() => toggleStudentIndicator(classroom.id, student.id, 'BA')}
                                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border transition-all cursor-pointer ${
                                          student.indicators.BA
                                            ? 'bg-indigo-500 text-white border-indigo-600 shadow-sm'
                                            : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                                        }`}
                                        title="Branco, Amarelo"
                                      >
                                        BA {student.indicators.BA ? '●' : '○'}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 self-end sm:self-auto">
                                  <ClassificationBadge value={lastClassification} />
                                  <button
                                    onClick={() => {
                                      setSelectedStudent(student);
                                      setAppView('EVALUATION');
                                    }}
                                    className="px-6 py-3 bg-[#5A5A40] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] shadow-sm transform cursor-pointer border border-[#5A5A40]"
                                  >
                                    AVALIAR FLUÊNCIA
                                  </button>
                                  <button
                                    onClick={() => setDeletingId({ type: 'STUDENT', id: student.id, parentId: classroom.id })}
                                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-8 text-center text-slate-400 italic text-sm">Nenhum discente corresponde à busca ou cadastro.</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CUSTOM BRAND FOOTER */}
        <div className="container mx-auto px-6 pb-4 mt-6 pt-4 border-t border-slate-150 print:hidden flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center shrink-0">
            <img
              alt="Altbit Logo"
              className="h-8 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
              referrerPolicy="no-referrer"
              src="/logoaltbit.jpeg"
            />
          </div>
          <div className="text-center space-y-1 max-w-lg">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em] leading-tight">
              PIPA Voice AI: Tecnologia a serviço da equidade e da redução de desigualdades na alfabetização.
            </p>
            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em] mt-1">
              Desenvolvido por HENRIQUE MORAIS © 2026 - vPlus
            </p>
          </div>
          <div className="flex items-center shrink-0">
            <img
              alt="HCC Logo"
              className="h-6 w-auto opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
              src="/logo_empresa.png"
            />
          </div>
        </div>
      </div>

      {/* CONFIRMATION DELETE MODAL */}
      <AnimatePresence>
        {deletingId && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-6 max-w-sm w-full rounded-2xl border shadow-xl text-center space-y-4"
            >
              <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-800 uppercase">Confirmar Exclusão</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Você está prestes a excluir este registro permanentemente. Esta ação é irreversível.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  id="confirm-delete-cancel"
                  onClick={() => setDeletingId(null)}
                  className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase"
                >
                  Cancelar
                </button>
                <button
                  id="confirm-delete-confirm"
                  onClick={() => {
                    if (deletingId.type === 'CLASS') deleteClass(deletingId.id);
                    else if (deletingId.type === 'STUDENT' && deletingId.parentId) deleteStudent(deletingId.parentId, deletingId.id);
                  }}
                  className="py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs uppercase shadow-md shadow-rose-200"
                >
                  Excluir
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LanguageTransitionModal
        pendingLanguageChange={pendingLanguageChange}
        selectedLanguage={selectedLanguage}
        onCancel={() => setPendingLanguageChange(null)}
        onConfirm={() => {
          if (pendingLanguageChange) {
            setSelectedLanguage(pendingLanguageChange);
            setPendingLanguageChange(null);
          }
        }}
      />

      <DiagnosisModal
        showDiagnosticModal={showDiagnosticModal}
        isRunningDiagnostic={isRunningDiagnostic}
        diagnosticData={diagnosticData}
        onClose={() => setShowDiagnosticModal(false)}
        onRunDiagnose={runDiagnostics}
      />

      {/* TEMPORARY COMPACT VAAR 3 TOAST (MAX 2.5 SECONDS) */}
      <AnimatePresence>
        {temporaryVaarAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-[60] bg-amber-500 text-white rounded-[24px] p-5 shadow-2.5xl border border-amber-400 max-w-sm flex items-start gap-4"
          >
            <div className="bg-white text-amber-500 rounded-full p-2 shrink-0 shadow-sm">
              <AlertCircle size={18} />
            </div>
            <div className="space-y-1 text-left">
              <span className="bg-amber-600 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                Aviso VAAR 3 (Equidade)
              </span>
              <h4 className="text-xs font-black uppercase tracking-tight mt-1 leading-snug text-white">
                Disparidade de Equidade na Turma: {temporaryVaarAlert.className}
              </h4>
              <p className="text-[10px] text-white/95 leading-relaxed leading-snug">
                Estudantes BA superaram PPI em {temporaryVaarAlert.diff.toFixed(1)} pontos. Clique no marcador ao lado do nome da turma para ver ações pedagógicas.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CENTRAL VAAR 3 EQUIDADE ALERT MODAL (Triggered manually on click) */}
      <AnimatePresence>
        {(() => {
          if (!activeVaarModalClassId) return null;
          const classWithVaarAlert = classes.find(cls => cls.id === activeVaarModalClassId);
          if (!classWithVaarAlert) return null;

          const evaluatedBA = classWithVaarAlert.students.filter(s => s.indicators.BA && s.simulations?.s1);
          const evaluatedPPI = classWithVaarAlert.students.filter(s => s.indicators.PPI && s.simulations?.s1);

          const getScore = (s: Student) => {
            if (s.score !== undefined) return s.score;
            const sim = s.simulations?.s1;
            if (!sim) return 0;
            return (sim.commonWords + sim.complexWords + sim.childrenStory) / 3;
          };

          const avgBA = evaluatedBA.length > 0 ? evaluatedBA.reduce((acc, s) => acc + getScore(s), 0) / evaluatedBA.length : 0;
          const avgPPI = evaluatedPPI.length > 0 ? evaluatedPPI.reduce((acc, s) => acc + getScore(s), 0) / evaluatedPPI.length : 0;
          const diff = avgBA - avgPPI;

          return (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[32px] border-4 border-amber-400 p-8 max-w-lg w-full shadow-2xl relative text-center space-y-6 text-left"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                  <AlertCircle size={44} />
                </div>

                <div className="pt-6">
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                    CONDICIONALIDADE VAAR 3 (EQUIDADE)
                  </span>
                  <h3 className="text-xl font-serif font-black text-slate-800 uppercase tracking-tight mt-4 leading-snug">
                    ALERTA DE SEGMENTAÇÃO DE RESULTADOS: {classWithVaarAlert.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2 max-w-md mx-auto">
                    Foi identificado que o subgrupo de estudantes autodeterminados como Branco/Amarelo (BA) superou o subgrupo de estudantes Preto/Pardo/Indígena (PPI) por mais de 25% na avaliação de fluência leitora.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-sans">
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Desempenho Médio BA</span>
                    <p className="text-xl font-extrabold text-indigo-600">{avgBA.toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider block">Desempenho Médio PPI</span>
                    <p className="text-xl font-extrabold text-emerald-600">{avgPPI.toFixed(1)}%</p>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/60 pt-2 mt-1">
                    <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Disparidade Identificada (Excesso)</span>
                    <span className="text-xs font-black text-rose-600 uppercase">+{diff.toFixed(1)} pontos percentuais</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl text-left text-[11px] text-amber-900 leading-relaxed space-y-1">
                  <p className="font-extrabold uppercase text-[9px] tracking-wide text-amber-850 block">Diretiva de Repasse Geral do Fundeb:</p>
                  <p className="font-medium text-slate-600">
                    A condicionalidade do **VAAR 3** impõe o estreitamento das disparidades socioeconômicas e raciais na alfabetização. É necessária a elaboração urgente de um plano pedagógico reparatório específico para o grupo PPI a fim de restaurar os critérios de equidade da turma e assegurar os recursos do município.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        const confirmPrint = window.confirm("Deseja exportar as métricas de disparidade racial antes de prosseguir?");
                        if (confirmPrint) {
                          generateReportPdf(classWithVaarAlert);
                        }
                      }
                    }}
                    className="flex-1 py-3.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center"
                  >
                    Exportar Relatório
                  </button>
                  <button
                    onClick={() => {
                      setActiveVaarModalClassId(null);
                    }}
                    className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-amber-200 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-center"
                  >
                    Fechar Alerta
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
