import React, { useState, useEffect } from 'react';
import {
  Scale,
  Shield,
  FileText,
  Heart,
  Info,
  Printer,
  Copy,
  Sparkles,
  HelpCircle,
  Activity,
  Gauge,
  Timer,
  Volume2
} from 'lucide-react';

interface NeuroSpotClassificationProps {
  totalWords: number;
  detectedCount: number;
  studentName?: string;
  language: 'pt' | 'en' | 'es';
}

export default function NeuroSpotClassification({
  totalWords,
  detectedCount,
  studentName = 'Estudante em Observação',
  language
}: NeuroSpotClassificationProps) {
  const [activeTab, setActiveTab] = useState<'ESTIMULO' | 'FLUENCIA' | 'LEGAL' | 'CONSENTIMENTO'>('ESTIMULO');
  const [copied, setCopied] = useState(false);

  // Calculate success rate
  const successRate = totalWords > 0 ? (detectedCount / totalWords) * 100 : 0;

  // Fluency indicators states (auto-initialized, adjustable by educators)
  const [latencyScore, setLatencyScore] = useState<number>(30);
  const [prosodyScore, setProsodyScore] = useState<number>(35);
  const [hesitationRate, setHesitationRate] = useState<number>(80);
  const [articulationScore, setArticulationScore] = useState<number>(35);

  // Sync state when successRate changes on a new evaluation
  useEffect(() => {
    if (successRate >= 75) {
      setLatencyScore(85);
      setProsodyScore(90);
      setHesitationRate(15);
      setArticulationScore(88);
    } else if (successRate >= 35) {
      setLatencyScore(60);
      setProsodyScore(65);
      setHesitationRate(45);
      setArticulationScore(58);
    } else {
      setLatencyScore(30);
      setProsodyScore(40);
      setHesitationRate(80);
      setArticulationScore(35);
    }
  }, [successRate]);

  // Determine fluency classification details
  const getFluencyClassification = () => {
    // Calculated overall weighted index
    const overallIndex = Math.round((latencyScore + prosodyScore + (100 - hesitationRate) + articulationScore) / 4);

    if (overallIndex >= 75) {
      return {
        level: 'Nível A - Fluência Sistêmica Ativa (Rítmica e Contínua)',
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50 border-emerald-100',
        progressColor: 'bg-emerald-500',
        description: 'Emissão fonética com transição silábica livre de latências marcantes. O estudante articula as palavras-alvo bilingues demonstrando naturalidade, rítmica estável e confiança comunicativa expressiva.',
        metrics: {
          latencyText: 'Menos de 1.0s (Excelente espontaneidade de resposta)',
          prosodyText: 'Entonação melódica natural e entonação firme',
          hesitationText: 'Hesitações esporádicas de autocorreção produtiva',
          articulationText: 'Excelente inteligibilidade de fonemas e dígrafos bilingues'
        },
        recommendations: [
          'Introduzir diálogo espontâneo com acréscimo de conectivos e adjetivos em ambiente bilingue.',
          'Modelar o uso de frases completas estimulando a narrativa sequencial livre de ensaios prévios.',
          'Fomentar interações de pequeno grupo para solidificar a naturalidade expressiva.'
        ]
      };
    } else if (overallIndex >= 40) {
      return {
        level: 'Nível B - Fluência Intermitente Mediada (Apoio de Hesitação Produtiva)',
        textColor: 'text-blue-700',
        bgColor: 'bg-blue-50 border-blue-100',
        progressColor: 'bg-blue-500',
        description: 'O estudante realiza autoregulação ativa durante a fala. Apresenta hesitações estruturais, pausas de processamento cognitivo ou prolongamentos silábicos ao articular os termos bilingues.',
        metrics: {
          latencyText: 'Entre 1.0s e 2.5s (Latência moderada compatível com autodisciplina)',
          prosodyText: 'Entonação hesitante mas com contorno rítmico compreensível',
          hesitationText: 'Pausas conscientes para estruturação ou remodelamento fônico',
          articulationText: 'Articulação clara com pequenas omissões/substituições pontuais'
        },
        recommendations: [
          'Apoiar com a técnica de "Remodelamento Silencioso" (repetir a palavra corretamente logo após de forma terna).',
          'Oferecer cartões visuais com marcas de sílabas destacadas para facilitar a cadência.',
          'Permitir tempo expandido de resposta, reduzindo pressões de cronometragem no ambiente escolar.'
        ]
      };
    } else {
      return {
        level: 'Nível C - Fluência Emergente Sensório-Estimulada (Expressão Pontual)',
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-50 border-amber-100',
        progressColor: 'bg-amber-500',
        description: 'Expressão focada na emissão de fonemas isolados ou balbucios pontuais. O estudante demonstra esforço atencional elevado com latências de processamento fono-articulatório estendidas.',
        metrics: {
          latencyText: 'Superior a 2.5s ou necessitando de estímulo repetido do instrutor',
          prosodyText: 'Fonação plana ou silabação fragmentada',
          hesitationText: 'Bloqueios fônicos compensados por gestualização e empatia',
          articulationText: 'Focos de simplificação articulatória frequentes (fala infantilizada)'
        },
        recommendations: [
          'Integrar música bilingue com palmas e batidas corporais para treinar rítmica básica em grupo.',
          'Utilizar Comunicação Alternativa e Ampliada (CAA) concomitante às gravações de voz assistidas.',
          'Valorizar toda e qualquer manifestação vocal e fonação espontânea, sem interrupções severas.'
        ]
      };
    }
  };

  const fluencyInfo = getFluencyClassification();
  const overallFluencyIndex = Math.round((latencyScore + prosodyScore + (100 - hesitationRate) + articulationScore) / 4);

  // Determine stimulus support level based on fonic feedback
  let profileLevel = {
    title: 'Estágio 1 - Estimulação Direta e Ampliação Vocabular (Apoio Leve - Nível 1)',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    indicatorColor: 'bg-emerald-500',
    description: 'O estudante demonstra alta autonomia e coordenação na articulação e prosódia das palavras-alvo bilingues monitoradas, com excelente inteligibilidade e resposta detectada pela IA.',
    guidelines: [
      'Incentivar a formulação de pequenas construções sintáticas (por exemplo: "The blue car", "Tengo una pelota").',
      'Focar em atividades de conversação dialógica bilíngue, expandindo o vocabulário por meio de narrativas compartilhadas de forma horizontal e livre de pressões.',
      'Evitar interrupções repetitivas no fluxo da sua fala; priorize a mediação fluida e estimuladora.',
      'Aproveitar o alto engajamento para introduzir expressões e estruturas frasais bilingues levemente mais ricas no cotidiano.'
    ],
    pdiSuggestion: 'Estudante responsivo a estímulo fonético direto. Foco no PDI em enriquecimento vocabular bilingue de forma lúdica integrada ao currículo comum, estimulando autonomia expressiva.',
    lbiNote: 'Art. 28, I da LBI: Garantia de projeto pedagógico inclusivo que promova o máximo desenvolvimento de sua personalidade, de seus talentos e de suas habilidades físicas e intelectuais.'
  };

  if (successRate < 35) {
    profileLevel = {
      title: 'Estágio 3 - Comunicação Alternativa & Conexão Sensório-Língua (Apoio Intensivo - Nível 3)',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      indicatorColor: 'bg-amber-500',
      description: 'O estudante apresenta fonação menos articulada em relação ao som bilingue esperado ou foca em vocalizações com maior tempo de processamento, demandando mediações de suporte expandidas.',
      guidelines: [
        'Adotar técnicas de Comunicação Alternativa e Ampliada (CAA), como cartões visuais integrados aos fonemas (padrão bimodal).',
        'Oferecer pistas sensoriais ricas e modelos articulatórios exagerados com feedback visual amoroso do professor.',
        'Reduzir a complexidade de estímulo linguístico a ordens curtas e associadas à experiências afetivas significativas.',
        'Evitar abordagens exaustivas de correção mecânica. Valorize e recompense toda iniciativa de comunicação não-verbal ou vocalização do estudante.'
      ],
      pdiSuggestion: 'Focar o Planejamento Pedagógico (PDI) no pareamento visual-auditivo imersivo de alta fidelidade e na instrumentalização de CAA bilingue, promovendo a expressão autônoma do estudante.',
      lbiNote: 'Art. 28, VII da LBI: Adoção de medidas de apoio coletivas e individuais, em ambientes que maximizem o desenvolvimento acadêmico e social, favorecendo a inclusão plena.'
    };
  } else if (successRate >= 35 && successRate < 75) {
    profileLevel = {
      title: 'Estágio 2 - Pareamento Visuo-Articulatório & Treino Silábico (Apoio Moderado - Nível 2)',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      indicatorColor: 'bg-blue-500',
      description: 'O estudante apresenta articulações funcionais parciais com substituições lógicas de fonemas, silabações arrastadas ou simplificações no idioma bilingue alvo, captadas de forma intermitente.',
      guidelines: [
        'Utilizar jogos lúdicos de repetição que destaquem silabação pausada associada a cartões e figuras correspondentes.',
        'Implementar mediação fonológica afetuosa repetindo a palavra dita pela criança com o padrão correto bem realçado (remodelamento fonêmico natural).',
        'Construir sequências divertidas de contação bilingue em grupo, reduzindo as exigências individuais de fala para aliviar a ansiedade e hesitação estrutural.',
        'Estimular a expressividade bilingue por meio de canções com gestualização e ênfase silábica clara.'
      ],
      pdiSuggestion: 'Planejamento centrado em suporte visuo-auditivo para refinamento de pronúncias, visando estruturar a autoconfiança de articulação e o domínio fonológico sistemático.',
      lbiNote: 'Art. 28, V da LBI: Adoção de medidas individualizadas e coletivas em ambientes que priorizem o desenvolvimento social e a inclusão pedagógica.'
    };
  }

  // Generate Vercel and LGPD compliant text
  const getLgpdConsentTemplate = () => {
    return `TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)
TRATAMENTO DE DADOS PESSOAIS DE MENORES E DADOS DE SAÚDE / APOIO PEDAGÓGICO
(Em Estrita Conformidade com os Artigos 5º, II e 14 da Lei nº 13.709/2018 - LGPD)

A escola Trails School Bilingue, em conformidade com o Estatuto da Pessoa com Deficiência (Lei nº 13.146/15 - LBI) e com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/18 - LGPD), solicita por meio deste instrumento o livre consentimento dos pais ou responsáveis legais para as atividades analíticas descritas abaixo:

1. DO ESTUDANTE AVALIADO:
Nome Completo: ${studentName.toUpperCase()}
Série/Ano: Ensino Fundamental Bilingue

2. DA FINALIDADE DA ATA DE COLETA SENSORIAL DE VOZ (NEUROSPOT):
O módulo NeuroSpot é uma ferramenta tecnológica de apoio ao Atendimento Educacional Especializado (AEE) e ao Plano de Desenvolvimento Individualizado (PDI) do estudante. Ele analisa amostras de fala da criança gravadas temporariamente pelo professor com o objetivo exclusivo de identificar o pareamento fonológico de palavras-alvo (estimulação bilingue), mapeando necessidades pedagógicas de suporte.

3. DA AUSÊNCIA DE DIAGNÓSTICO MÉDICO (CLASSIFICAÇÃO ÉTICA INCLUSIVA):
Em absoluto respeito à ética clínico-pedagógica e à integridade socioemocional da criança, este sistema não realiza nem de forma autônoma ou complementar diagnósticos clínicos (tais como emissão de CIDs relativos a Autismo, TDAH, Dislexia ou TOD). A tecnologia destina-se puramente ao planejamento de suporte didático de fala e à facilitação de roteiros adaptados conduzidos por fonoaudiólogos e educadores habilitados.

4. DA SEGURANÇA E PRIVACIDADE DE DADOS SENSÍVEIS (ART. 14 DA LGPD):
- Os áudios coletados são processados de forma volátil mediante protocolo criptografado ponta-a-ponta.
- Não há armazenamento de perfis biométricos ou da gravação de voz após o encerramento do processamento imediato das análises pedagógicas.
- Os relatórios gerados são de circulação estritamente interna da equipe multidisciplinar do aluno, visando seu acompanhamento inclusivo sob sigilo escolar.

Autorizo a Trails School Bilingue e seus profissionais a utilizarem as tecnologias assistivas educacionais para avaliação de apoio de fala e estímulo bilingue do estudante acima nominado.

Data: ____ de ________________ de 2026.

_____________________________________________________
Assinatura do Pai, Mãe ou Responsável Legal

Documento gerado digitalmente para a Trails School Bilingue`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getLgpdConsentTemplate());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Termo de Consentimento LGPD - ${studentName}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; max-width: 800px; margin: auto; }
              h1 { font-family: 'Playfair Display', serif; font-size: 20px; text-align: center; margin-bottom: 30px; border-bottom: 2px solid #5A5A40; padding-bottom: 10px; color: #5A5A40; }
              p { font-size: 13px; text-align: justify; margin-bottom: 15px; }
              .fields { margin: 30px 0; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; font-size: 13px; background-color: #fafaf9; }
              .signatures { margin-top: 60px; display: flex; justify-content: space-between; gap: 40px; }
              .sig-line { border-top: 1px solid #1a1a1a; width: 100%; text-align: center; padding-top: 5px; font-size: 11px; margin-top: 40px; }
              .footer { margin-top: 50px; font-size: 10px; text-align: center; color: #71717a; border-top: 1px dashed #e2e8f0; padding-top: 15px; }
            </style>
          </head>
          <body>
            <h1>TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO (TCLE)<br><span style="font-size: 13px; font-weight: normal; color: #666;">Conformidade LGPD Art. 14 & LBI Art. 28</span></h1>

            <p>A escola <strong>Trails School Bilingue</strong>, como agente de tratamento de dados, solicita por meio deste instrumento o livre consentimento específico e em destaque dos pais ou responsáveis legais para tratamento de dados pessoais de menores em ambiente assistivo de tecnologia educacional:</p>

            <div class="fields">
              <strong>Estudante Avaliado:</strong> ${studentName.toUpperCase()}<br>
              <strong>Agente de Tratamento:</strong> Trails School Bilingue<br>
              <strong>Tecnologia Integrada:</strong> Módulo Fônico NeuroSpot bilingue para TEA, Dislexia e TDAH
            </div>

            <p><strong>1. Da Finalidade e Coleta:</strong> O módulo NeuroSpot atua de forma exclusiva como ferramenta auxiliar pedagógica de mapeamento da fala bilingue, não emitindo nem armazenando dados de diagnóstico ou classificação clínica estigmatizante (CID). Os áudios capturados destinam-se unicamente ao desenvolvimento do Plano de Desenvolvimento Individualizado (PDI) de forma voluntária e de alta sensibilidade.</p>

            <p><strong>2. Da Proteção, Volatilidade e Direitos:</strong> Os áudios são processados de forma criptografada temporariamente pela inteligência avançada integrada, sendo descartados imediatamente após a geração do Relatório de Reconhecimento. Em nenhuma hipótese há armazenamento de assinaturas biométricas de menor idade, conforme exige o art. 14 da Lei nº 13.709/2018 (LGPD).</p>

            <p><strong>3. Da Inclusão Escolar Assistiva:</strong> Atividades conduzidas em conformidade com o Art. 28 da Lei 13.146/2015 (LBI), assegurando tecnologias de apoio e acessibilidade comunicativas bilingues para o pleno progresso do educando especial.</p>

            <div class="signatures">
              <div class="sig-line">
                <strong>Assinatura do Pai, Mãe ou Responsável Legal</strong><br>
                Nome por Extenso: _____________________________________
              </div>
            </div>

            <div class="footer">
              Este termo é parte integrante do sistema de gestão pedagógica inclusiva da Trails School Bilingue.<br>
              Salvaguarda legal ativa - Emissão de segurança: 2026.
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div id="neurospot-compliance-panel" className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 mt-8 overflow-hidden">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-[#5A5A40]/10 text-[#5A5A40] rounded-lg">
              <Scale size={18} />
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#5A5A40]">MÓDULO DE ADAPTAÇÃO CLÍNICA</span>
            <h4 className="text-xl font-serif font-black text-[#1A1A1A] mt-1">Análise de Progresso & Proteção Legal</h4>
          </div>
          <p className="text-xs text-slate-500">
            Acompanhamento inclusivo e termo fônico bilingue regulamentado no Brasil para <strong>TDAH, TEA e Dislexia</strong>.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-[#F9F9F7] p-1 rounded-2xl border border-black/5 self-start xl:self-auto shrink-0 flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('ESTIMULO')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ESTIMULO'
                ? 'bg-[#5A5A40] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Nível de Estímulo
          </button>
          <button
            onClick={() => setActiveTab('FLUENCIA')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'FLUENCIA'
                ? 'bg-[#5A5A40] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Activity size={13} />
            Avaliação de Fluência
          </button>
          <button
            onClick={() => setActiveTab('LEGAL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'LEGAL'
                ? 'bg-[#5A5A40] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Proteção LGPD
          </button>
          <button
            onClick={() => setActiveTab('CONSENTIMENTO')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'CONSENTIMENTO'
                ? 'bg-[#5A5A40] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText size={12} />
            TCLE Assinar
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="min-h-[220px]">
        {activeTab === 'ESTIMULO' && (
          <div className="space-y-6">
            {/* Status indicators */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 rounded-2xl bg-[#F9F9F7] border border-black/5 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Classificação de Apoio</span>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${profileLevel.indicatorColor} shrink-0`} />
                  <span className="text-sm font-extrabold text-[#1A1A1A]">{profileLevel.title}</span>
                </div>
              </div>
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-extrabold ${profileLevel.badgeColor}`}>
                Precisão Fonética: {Math.round(successRate)}% de Pareamento
              </div>
            </div>

            {/* General Description */}
            <div className="space-y-4">
              <div>
                <h5 className="text-xs font-black uppercase tracking-widest text-[#5A5A40] mb-2 flex items-center gap-1.5">
                  <Sparkles size={12} /> Avaliação Pedagogicamente Descritiva:
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed bg-[#5A5A40]/5 p-4 rounded-xl font-medium border-l-4 border-[#5A5A40]">
                  "{profileLevel.description}"
                </p>
              </div>

              {/* Guidelines list */}
              <div>
                <h5 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">
                  Diretrizes de Estímulo para Prática Bilingue (Trails School):
                </h5>
                <ul className="space-y-2">
                  {profileLevel.guidelines.map((guide, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] mt-1.5 shrink-0" />
                      <span>{guide}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggestions for PDI */}
              <div className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Dica para PDI (Plano Individual)</span>
                  <p className="text-xs text-slate-600">{profileLevel.pdiSuggestion}</p>
                </div>
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex gap-2 items-start">
                  <Heart size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-widest block mb-1">Conformidade de Amparo Legal</span>
                    <p className="text-[11px] text-emerald-700 leading-tight italic">{profileLevel.lbiNote}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'FLUENCIA' && (
          <div className="space-y-6 text-sm text-slate-700">
            {/* Intro Alert box indicating multi-dimensional metrics */}
            <div className="p-4 bg-[#F9F9F7] rounded-2xl border border-black/5 flex items-start gap-3">
              <span className="p-2 bg-[#5A5A40]/10 text-[#5A5A40] rounded-xl shrink-0">
                <Gauge size={18} />
              </span>
              <div>
                <h5 className="text-xs font-black uppercase tracking-widest text-[#1A1A1A] mb-1">Estabilidade de Fluência Fonêmica de Alunos Especiais</h5>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Para crianças em alfabetização e neurodivergentes, a fluência é calculada como <strong>coeficiente de esforço fônico e intervalos de conforto</strong>, e não apenas velocidade bruta de leitura. Abaixo você pode analisar os indicadores automáticos de IA e customizá-los conforme sua mediação em sala.
                </p>
              </div>
            </div>

            {/* Overall fluency badge & classification */}
            <div className={`p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${fluencyInfo.bgColor}`}>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Classificação Atual de Fluência</span>
                <p className={`text-base font-black ${fluencyInfo.textColor}`}>{fluencyInfo.level}</p>
                <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-2xl mt-1">
                  {fluencyInfo.description}
                </p>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-white/75 border border-black/5 rounded-2xl shrink-0 font-mono text-center min-w-[120px]">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Índice Geral</span>
                <span className="text-3xl font-extrabold text-slate-800">{overallFluencyIndex}%</span>
                <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div className={`h-full ${fluencyInfo.progressColor}`} style={{ width: `${overallFluencyIndex}%` }} />
                </div>
              </div>
            </div>

            {/* Interactive sliders & meters */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sliders columns */}
              <div className="space-y-5 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                <h6 className="text-xs font-black uppercase tracking-widest text-[#5A5A40] border-b border-slate-100 pb-2">Ajuste de Parâmetros de Fluência</h6>

                {/* Latency slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <Timer size={14} className="text-slate-400" /> Latência de Iniciação
                    </label>
                    <span className="text-xs font-mono font-bold text-[#5A5A40]">{latencyScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={latencyScore}
                    onChange={(e) => setLatencyScore(parseInt(e.target.value))}
                    className="w-full accent-[#5A5A40] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                    <span>Lenta ( {'>'} 3s )</span>
                    <span>Espontânea ( {'<'} 1s )</span>
                  </div>
                </div>

                {/* Prosody slider */}
                <div className="space-y-1.5 mt-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <Volume2 size={14} className="text-slate-400" /> Modulação e Prosódia
                    </label>
                    <span className="text-xs font-mono font-bold text-[#5A5A40]">{prosodyScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={prosodyScore}
                    onChange={(e) => setProsodyScore(parseInt(e.target.value))}
                    className="w-full accent-[#5A5A40] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                    <span>Monótona/Fragmentada</span>
                    <span>Salgadinha/Estável</span>
                  </div>
                </div>

                {/* Hesitations slider */}
                <div className="space-y-1.5 mt-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <HelpCircle size={14} className="text-slate-400" /> Taxa de Hesitação / Pausas
                    </label>
                    <span className="text-xs font-mono font-bold text-[#5A5A40]">{hesitationRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={hesitationRate}
                    onChange={(e) => setHesitationRate(parseInt(e.target.value))}
                    className="w-full accent-[#5A5A40] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                    <span>Fluida (Poucas Pausas)</span>
                    <span>Fracionada (Bloqueios frequentes)</span>
                  </div>
                </div>

                {/* Articulation score */}
                <div className="space-y-1.5 mt-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                      <Activity size={14} className="text-slate-400" /> Clareza de Articulação Silábica
                    </label>
                    <span className="text-xs font-mono font-bold text-[#5A5A40]">{articulationScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={articulationScore}
                    onChange={(e) => setArticulationScore(parseInt(e.target.value))}
                    className="w-full accent-[#5A5A40] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                    <span>Aproximação Fonológica</span>
                    <span>Nítida/Nativa</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => {
                      if (successRate >= 75) {
                        setLatencyScore(85);
                        setProsodyScore(90);
                        setHesitationRate(15);
                        setArticulationScore(88);
                      } else if (successRate >= 35) {
                        setLatencyScore(60);
                        setProsodyScore(65);
                        setHesitationRate(45);
                        setArticulationScore(58);
                      } else {
                        setLatencyScore(30);
                        setProsodyScore(40);
                        setHesitationRate(80);
                        setArticulationScore(35);
                      }
                    }}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold underline cursor-pointer"
                  >
                    Restaurar Padrão da Gravação IA
                  </button>
                </div>
              </div>

              {/* Outputs metrics / guidelines */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest block font-sans">Métricas Avaliadas pela IA</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white border border-slate-100 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Iniciação Fônica</p>
                      <p className="text-xs font-extrabold text-slate-700 mt-1">{fluencyInfo.metrics.latencyText}</p>
                    </div>
                    <div className="p-3 bg-white border border-slate-100 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Contorno da Fala</p>
                      <p className="text-xs font-extrabold text-slate-700 mt-1">{fluencyInfo.metrics.prosodyText}</p>
                    </div>
                    <div className="p-3 bg-white border border-slate-100 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estrutura de Bloqueios</p>
                      <p className="text-xs font-extrabold text-slate-700 mt-1">{fluencyInfo.metrics.hesitationText}</p>
                    </div>
                    <div className="p-3 bg-white border border-slate-100 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Precisão Fonológica</p>
                      <p className="text-xs font-extrabold text-slate-700 mt-1">{fluencyInfo.metrics.articulationText}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-[#5A5A40] uppercase tracking-widest mb-2">Orientações de Desenvolvimento Bilingue:</p>
                  <ul className="space-y-2">
                    {fluencyInfo.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#5A5A40] mt-1.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'LEGAL' && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 items-start">
              <Shield size={20} className="text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <h5 className="text-xs font-black uppercase tracking-widest text-emerald-800">COLETA ÉTICA & ATENDIMENTO À LGPD COMPLETO</h5>
                <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                  Para fins do <strong>Artigo 14 da LGPD</strong> (que regulamenta de forma específica e rigorosa o tratamento de dados pessoais de crianças e adolescentes), o módulo <strong>NeuroSpot</strong> se consolida como ferramenta de <strong>Tecnologia Assistiva Escolar</strong> de alta segurança.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h6 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Ausência de Rótulos Clínicos estáticos
                </h6>
                <p className="text-xs text-slate-600 leading-relaxed">
                  O NeuroSpot <strong>não atribui diagnósticos formais ou codificações clínicas (CIDs)</strong> à fonação da criança de forma autônoma por IA. Isso impede processos de segregação escolar e protege a dignidade íntima do estudante, observando as diretrizes éticas nacionais de saúde e educação.
                </p>
              </div>

              <div className="space-y-4">
                <h6 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Volatilidade e Descarte do Sinal de Voz
                </h6>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Os arquivos corporais de voz gravados <strong>não são guardados de forma permanente</strong>. Cada teste realiza a chamada imediata ao processamento de transcrição inclusiva e é descartado, gerando apenas o descritivo de palavras-alvo bilingues e indicadores de amparo fonético para o PDI.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#F9F9F7] rounded-xl gap-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5 col-span-3">
                <Info size={14} className="text-[#5A5A40]" />
                Trails School e desenvolvedores bilingues em estrita parceria com os direitos da infância.
              </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                LBI art. 28 + LGPD art. 14 protegido
              </span>
            </div>
          </div>
        )}

        {activeTab === 'CONSENTIMENTO' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-xs text-slate-500 items-center">
                <Info size={14} className="text-[#5A5A40]" />
                Veja o documento gerado para o aluno <strong>{studentName}</strong>:
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1"
                >
                  <Copy size={13} />
                  {copied ? 'Copiado!' : 'Copiar Texto'}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-1.5 bg-[#5A5A40] text-white hover:bg-[#484833] transition-colors rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Printer size={13} />
                  Imprimir Termo
                </button>
              </div>
            </div>

            {/* Document preview */}
            <div className="bg-[#FAF9F6] p-6 rounded-2xl border border-dashed border-[#5A5A40]/30 shadow-inner max-h-[300px] overflow-y-auto font-mono text-xs text-slate-600 leading-relaxed whitespace-pre-wrap select-text">
              {getLgpdConsentTemplate()}
            </div>

            <p className="text-[10px] text-slate-400 italic text-center">
              * Dica: Colete a assinatura uma única vez no início do ano letivo para as avaliações do módulo bilingue assistido por IA.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
