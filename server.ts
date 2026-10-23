import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

const envPath = path.resolve(process.cwd(), ".env.local");
const fallbackPath = path.resolve(process.cwd(), ".env");
const envResult = dotenv.config({ path: envPath });
if (envResult.error) {
  dotenv.config({ path: fallbackPath });
}

const app = express();
const PORT = 3000;

// Increase JSON limit for base64 audio
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Shared Gemini client helper
let aiClient: GoogleGenAI | null = null;
let lastUsedApiKey: string | null = null;

console.log(`[Server] NODE_ENV=${process.env.NODE_ENV}, VERCEL=${process.env.VERCEL}`);

function attachApiRoute(method: "get" | "post", path: string, handler: any) {
  app[method](`/api${path}`, handler);
  app[method](path, handler);
}

function getGenAI() {
  const envKeys = Object.keys(process.env);
  let usedKeyName = "";
  let apiKey = "";

  // 1. Exact priority lookup (preferring the new Gemini_API_Key and GEMINI_API_KEY)
  const priorityKeysOrder = [
    "Gemini_API_Key",
    "GEMINI_API_KEY",
    "GENAI_API_KEY",
    "lexiumbilingue",
    "LEXIUMBILINGUE",
    "GEMINI_SERVICE_KEY",
    "GOOGLE_API_KEY",
    "API_KEY_GEMINI",
    "NEXT_PUBLIC_GEMINI_API_KEY"
  ];

  for (const key of priorityKeysOrder) {
    if (process.env[key] && process.env[key]?.trim()) {
      apiKey = process.env[key]!.trim();
      usedKeyName = key;
      break;
    }
  }

  // 2. Case-insensitive fallback lookup
  if (!apiKey) {
    const matchedKeyName = envKeys.find(k => {
      const lower = k.toLowerCase();
      return lower === "gemini_api_key" || lower === "genai_api_key" || lower === "lexiumbilingue" || lower === "gemini_service_key" || lower === "google_api_key";
    });
    if (matchedKeyName && process.env[matchedKeyName]?.trim()) {
      apiKey = process.env[matchedKeyName]!.trim();
      usedKeyName = matchedKeyName;
    }
  }

  // 3. Last-resort fallback: any key mentioning gemini/genai/google and key/api
  if (!apiKey) {
    const fallbackKeyName = envKeys.find(k => {
      const lower = k.toLowerCase();
      return (lower.includes("gemini") || lower.includes("genai") || lower.includes("google")) && (lower.includes("key") || lower.includes("api"));
    });
    if (fallbackKeyName && process.env[fallbackKeyName]?.trim()) {
      apiKey = process.env[fallbackKeyName]!.trim();
      usedKeyName = fallbackKeyName;
    }
  }

  if (!apiKey) {
    const errorMsg = "A chave de API não foi detectada. Por favor, certifique-se de que você adicionou a Secret com o nome 'Gemini_API_Key' ou 'lexiumbilingue' no menu Secrets do AI Studio e salvou corretamente.";
    console.error(errorMsg, "Env Keys found:", Object.keys(process.env).filter(k => k.toLowerCase().includes("key") || k.toLowerCase().includes("gemini") || k.toLowerCase() === "lexiumbilingue"));
    throw new Error(errorMsg);
  }

  // Safe logs showing which key is being initialized
  const maskedKey = apiKey.length > 8
    ? `${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`
    : "***";
  console.log(`[Gemini Auth] Inicializando cliente com a chave da variável de ambiente: "${usedKeyName}" (Valor: ${maskedKey})`);

  // Reinitialize if the API key changes or if it's the first initialization
  if (!aiClient || apiKey !== lastUsedApiKey) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    lastUsedApiKey = apiKey;
  }
  return aiClient;
}

// Robust JSON parsing utility to deal with any comments or malformed trailing characters from AI
function cleanAndParseJSON(rawText: string) {
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Keep trying with matching blocks
  }

  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return JSON.parse(trimmed);
  }
  let str = jsonMatch[0];

  try {
    return JSON.parse(str);
  } catch (e) {
    // Keep trying with custom cleanups
  }

  // Strip out single-line comments // but avoid breaking inside URL schemes (http:// or https://)
  str = str.replace(/(?:^|[^:])\/\/.*$/gm, (match) => {
    if (match.includes("http://") || match.includes("https://")) {
      return match;
    }
    return "";
  });

  // Strip out multi-line block comments /* ... */
  str = str.replace(/\/\*[\s\S]*?\*\//g, "");

  // Clean up trailing commas in objects or arrays
  str = str.replace(/,(\s*[\]}])/g, "$1");

  return JSON.parse(str);
}

async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  prompt: string,
  base64Audio: string,
  mimeType: string,
  temperature: number = 1.0
): Promise<string> {
  const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  const maxRetriesPerModel = 2;
  let lastError: any = null;

  const normalizedMimeType = mimeType?.trim() || "audio/webm";
  const mimeCandidates = [normalizedMimeType];
  if (normalizedMimeType.startsWith("audio/webm") && !mimeCandidates.includes("audio/webm")) {
    mimeCandidates.push("audio/webm");
  }
  if (normalizedMimeType.startsWith("audio/webm") && !mimeCandidates.includes("audio/webm;codecs=opus")) {
    mimeCandidates.push("audio/webm;codecs=opus");
  }
  if (normalizedMimeType.startsWith("audio/ogg") && !mimeCandidates.includes("audio/ogg;codecs=opus")) {
    mimeCandidates.push("audio/ogg;codecs=opus");
  }
  if (!mimeCandidates.includes("audio/wav")) {
    mimeCandidates.push("audio/wav");
  }

  for (const model of modelsToTry) {
    for (const candidateMimeType of mimeCandidates) {
      let delay = 1000;
      for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
        try {
          console.log(`[Gemini API] Tentando modelo "${model}" com mimeType "${candidateMimeType}" (Tentativa ${attempt}/${maxRetriesPerModel})`);

          const response = await ai.models.generateContent({
            model: model,
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: candidateMimeType,
                      data: base64Audio,
                    },
                  },
                ],
              },
            ],
            config: {
              responseMimeType: "application/json",
              temperature: temperature,
            },
          });

          const outputText = (response?.text || response?.data || "").toString().trim();
          if (outputText) {
            console.log(`[Gemini API] Sucesso utilizando o modelo: "${model}" na tentativa ${attempt}! Saída: ${outputText.slice(0, 120)}`);
            return outputText;
          }
          throw new Error("Resposta de texto vazia retornada do modelo.");
        } catch (err: any) {
          lastError = err;

          let statusCode = 500;
          let errorMessage = err.message || "";

          if (err.status) {
            statusCode = err.status;
          } else if (err.error && err.error.code) {
            statusCode = err.error.code;
          } else if (err.code) {
            statusCode = err.code;
          }

          console.warn(`[Gemini API Warning] Falha com modelo "${model}" na tentativa ${attempt}. Status Code: ${statusCode}. Mensagem: ${errorMessage}`);

          const isTransient =
            statusCode === 503 ||
            statusCode === 429 ||
            statusCode === 500 ||
            errorMessage.toLowerCase().includes("high demand") ||
            errorMessage.toLowerCase().includes("unavailable") ||
            errorMessage.toLowerCase().includes("busy") ||
            errorMessage.toLowerCase().includes("rate limit") ||
            !err.status;

          if (isTransient && attempt < maxRetriesPerModel) {
            console.log(`[Gemini API] Aguardando ${delay}ms antes da re-tentativa...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 1.5; // backoff exponencial leve
          } else {
            console.log(`[Gemini API] Pulando o modelo "${model}" devido a falhas persistentes ou erro crítico.`);
            break;
          }
        }
      }
    }
  }

  const finalErrorMsg = lastError?.message || JSON.stringify(lastError);
  throw new Error(`Infelizmente a Inteligência Artificial do Google Gemini está sob alta demanda temporária mundial de áudio (${finalErrorMsg}). Por favor, tente novamente em alguns instantes.`);
}

// API Routes
const healthHandler = (req: any, res: any) => {
  res.json({ status: "ok", time: new Date().toISOString(), env: process.env.NODE_ENV });
};
attachApiRoute("get", "/health", healthHandler);

const debugHandler = (req: any, res: any) => {
  res.json({
    geminiKeyPresent: Boolean(process.env.GEMINI_API_KEY?.trim()),
    envKeys: Object.keys(process.env).filter(k => /gemini|genai|google/i.test(k)),
    nodeVersion: process.version,
    runtime: process.env.VERCEL ? 'vercel' : 'local',
  });
};
attachApiRoute("get", "/debug", debugHandler);

const evaluateHandler = async (req: any, res: any) => {
  try {
    const { referenceText, base64Audio, mimeType, language } = req.body;
    console.log(`[Evaluate Route] Received audio len=${base64Audio?.length || 0} mimeType=${mimeType}`);
    if (!base64Audio) return res.status(400).json({ error: "Áudio não fornecido." });

    const ai = getGenAI();
    const isSpanish = language === 'es';
    const targetLang = isSpanish ? 'espanhol' : 'inglês';

    const prompt = `
      Você é um avaliador de proficiência em leitura de ${targetLang} para alunos do ensino fundamental 1 (anos iniciais). Sua principal tarefa é analisar gravações de áudio de crianças lendo e fornecer uma transcrição extremamente precisa, juntamente com uma análise detalhada dos erros de leitura.

      Input:
      1. Arquivo de áudio (incluído na mensagem).
      2. Texto de Referência do que a criança devia ler: "${referenceText}"

      Instruções para a Análise:
      1. Transcrição Precisa: Transcreva o áudio lido pelo aluno para texto em ${targetLang} (transcricao_completa) com a maior precisão possível.
      2. Comparação e Detecção de Erros de Leitura de Crianças:
         - Compare a transcricao_completa com o texto de referência fornecido.
         - Identifique palavras do texto de referência que foram omitidas ("omitida"), substituídas por outra palavra falada ("substituida"), ou se a criança inseriu palavras extras não presentes no texto de referência ("inserida").
         - Caso a criança tenha lido a palavra correta, mas com desvios significativos de pronúncia (por exemplo, gagueira, silabação pesada, ou pronúncia errada dos fonemas), marque o status como "mal_pronunciada" e explique o ocorrido com detalhes amigáveis em "detalhes_erro".
         - Se a palavra foi lida corretamente sem desvios, marque como "correta".
         - Se a criança gaguejar ou pausar e repetir a mesma palavra múltiplas vezes, considere a melhor tentativa da criança para avaliar o status (correta ou mal_pronunciada) e não marque duplicatas repetitivas como erros de inserção desnecessários, focando na proficiência geral da leitura.
      3. Segmentação por Palavra: Para cada palavra correspondente, indique uma aproximação razoável de tempo de início e fim no áudio (inicio_audio_ms, fim_audio_ms) baseado em fonação.
      4. Confiança: Forneça um nível de confiança realista para cada transcrição (0.0 a 1.0).
      5. Considerações Infantis: A voz e dicção de crianças do ensino fundamental 1 variam muito. Seja robusto a sotaques, timbres infantis finos e pequenas hesitações.

      Retorne obrigatoriamente um objeto JSON com esta estrutura exata de chaves e tipos:
      {
        "texto_de_referencia_utilizado": string,
        "transcricao_completa": string,
        "analise_por_palavra": [
          {
            "palavra_referencia": string | null,
            "palavra_lida_transcrita": string | null,
            "status": "correta" | "mal_pronunciada" | "substituida" | "omitida" | "inserida",
            "detalhes_erro": string | null,
            "confianca_transcricao": number | null,
            "inicio_audio_ms": number | null,
            "fim_audio_ms": number | null
          }
        ],
        "resumo_erros": {
          "total_palavras_referencia": number,
          "total_palavras_lidas_corretas": number,
          "total_erros": number,
          "erros_por_tipo": {
            "mal_pronunciada": number,
            "substituida": number,
            "omitida": number,
            "inserida": number
          }
        }
      }
    `;

    const text = await generateContentWithRetryAndFallback(ai, prompt, base64Audio, mimeType, 1.0);

    if (!text) {
      console.error("Evaluate: AI returned empty response");
      throw new Error("O modelo AI não retornou resposta.");
    }

    try {
      res.json(cleanAndParseJSON(text));
    } catch (parseError) {
      console.error("Evaluate: JSON Parse Error. Raw text:", text);
      res.status(500).json({
        error: "Erro ao processar a resposta da AI.",
        details: text.length > 200 ? text.substring(0, 200) + "..." : text
      });
    }
  } catch (error: any) {
    console.error("Evaluate Route Error:", error);
    res.status(500).json({ error: error.message || "Erro na avaliação." });
  }
};
attachApiRoute("post", "/evaluate", evaluateHandler);

const neuroSpotHandler = async (req: any, res: any) => {
  try {
    const { targetWords, base64Audio, mimeType, language } = req.body;
    if (!base64Audio) return res.status(400).json({ error: "Áudio não fornecido." });

    const ai = getGenAI();
    const isSpanish = language === 'es';
    const targetLang = isSpanish ? 'Espanhol' : 'Inglês';

    const prompt = `
      Você é o motor de auditoria fonética do sistema bilíngue LIRA / Reading Buddy, operando especificamente no "Modo NeuroSpot" (Aba de Acessibilidade/Neurodivergentes). Ajuste seu comportamento operacional para seguir as seguintes regras estritas:

      1. Rigor Fonético e Transcrição Literal (Sem Autocorreção):
         Ao analisar a entrada de voz do aluno no áudio fornecido, desligue qualquer mecanismo de autocorreção contextual ou gramatical. Se o aluno pronunciar "ROUSE" em vez de "HOUSE", ou "DOG" com fonema invertido, você deve transcrever EXCLUSIVAMENTE a palavra fonética literal exata que foi dita no campo "texto_proferido".

      2. Alimentação Obrigatória do Quadro de Descrição:
         No seu JSON de resposta, você deve obrigatoriamente preencher o campo "texto_proferido" com a transcrição literal exata do que o aluno falou. Esse texto será renderizado diretamente na caixa de descrição da tela para que o aplicador veja o erro de pronúncia do discente.

      3. Lógica de Validação de Palavras Corretas:
         Compare a string literal gerada com o gabarito textual esperado da atividade em inglês/espanhol: "${targetWords.join(" ")}".
         - Se o aluno errar a pronúncia (ex: falou "rouse" para o gabarito "house"), a palavra deve ser marcada como "incorreta" no campo "status".
         - Não faça inferências criativas.

      4. Estrutura Exata do Objeto de Saída (JSON):
         Retorne estritamente o objeto contendo a transcrição para a caixa de descrição, a matriz de validação e as propriedades de compatibilidade para renderização no dashboard:

         {
           "modo": "NEUROSPOT_BILINGUE",
           "texto_proferido": string, // Transcrição fonética literal exata dita pelo aluno
           "gabarito_esperado": "${targetWords.join(" ")}",
           "analise_palavras": [
             {
               "palavra": string, // palavra do gabarito correspondente
               "status": "correto" | "incorreto", // "correto" ou "incorreto"
               "motivo": string // motivo se incorreto (ex: "Pronúncia incorreta detectada (Rouse)"), omitir ou deixar vazio se correto
             }
           ],
           "resultado_final": "CONCLUIDO_COM_ERROS_FONETICOS" | "CONCLUIDO_SEM_ERROS_FONETICOS", // "CONCLUIDO_COM_ERROS_FONETICOS" se houver algum status "incorreto", senão "CONCLUIDO_SEM_ERROS_FONETICOS"

           // Propriedades Legadas adicionais de retrocompatibilidade para o dashboard não quebrar:
           "palavras_alvo_esperadas": [${targetWords.map(w => `"${w}"`).join(", ")}],
           "palavras_reconhecidas": [
             // Liste as fonações do aluno correspondentes
             {
               "palavra": string,
               "confianca": number, // Ex: 0.95
               "timestamp_inicio_ms": number, // Ex: 500
               "timestamp_fim_ms": number // Ex: 1200
             }
           ],
           "resumo_deteccao": {
             "total_palavras_alvo_esperadas": ${targetWords.length},
             "total_palavras_detectadas_com_sucesso": number, // Quantidade de palavras marcadas como "status": "correto"
             "palavras_detectadas_por_tipo": {
               // Chave-valor para cada palavra de [${targetWords.map(w => `"${w}"`).join(", ")}] mapeando para a quantidade de vezes que a palavra foi pronunciada corretamente (1 se "correto", 0 se "incorreto")
             }
           },
           "observacoes_adicionais": string // Nota pedagógica inclusiva resumida e com amparo legal sobre a fonação
         }
    `;

    const text = await generateContentWithRetryAndFallback(ai, prompt, base64Audio, mimeType, 0.0);

    if (!text) {
      console.error("NeuroSpot: AI returned empty response");
      throw new Error("O modelo AI não retornou resposta.");
    }

    try {
      res.json(cleanAndParseJSON(text));
    } catch (parseError) {
      console.error("NeuroSpot: JSON Parse Error. Raw text:", text);
      res.status(500).json({
        error: "Erro ao processar a resposta NeuroSpot.",
        details: text.length > 200 ? text.substring(0, 200) + "..." : text
      });
    }
  } catch (error: any) {
    console.error("NeuroSpot Route Error:", error);
    res.status(500).json({ error: error.message || "Erro no NeuroSpot." });
  }
};
attachApiRoute("post", "/evaluate-neurospot", neuroSpotHandler);

// Global Error Handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Global Server Error:", err);
  res.status(err.status || 500).json({
    error: "Erro interno no servidor.",
    message: err.message || "Unknown error"
  });
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.VERCEL !== "1") {
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api")) return next();
        res.sendFile(path.join(distPath, "index.html"), (err) => {
          if (err) res.status(404).send("Not found");
        });
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server started on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer().catch((err) => {
  console.error("Fatal server startup error:", err);
});

export default app;
