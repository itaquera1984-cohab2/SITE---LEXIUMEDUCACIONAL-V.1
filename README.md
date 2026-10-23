# Lexium Bilingue

Ambiente de avaliação de fluência leitora bilíngue para inglês e espanhol.

## Recursos

- LIRA: leitura de palavras comuns, palavras complexas e texto conectado.
- NeuroSpot: reconhecimento de palavras-alvo e apoio pedagógico.
- First Steps: atividades bilíngues para a educação infantil.
- Web Speech como motor padrão no navegador.
- Gemini AI como alternativa de análise em nuvem.
- Acompanhamento de turmas, evolução e relatórios em PDF.

Os estudantes incluídos no código são registros inteiramente demonstrativos. Não publique dados reais de estudantes, gravações ou indicadores pessoais neste repositório.

## Desenvolvimento

Requisitos: Node.js e npm.

```bash
npm ci
npm run dev
```

O servidor local é disponibilizado em `http://localhost:3000`.

## Verificação

```bash
npm test
npm run lint
npm run build
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e configure:

```dotenv
GEMINI_API_KEY="sua-chave"
```

A chave é utilizada somente pelo servidor Express e nunca deve ser adicionada ao Git.

## Deploy na Vercel

O frontend é compilado pelo Vite. As rotas do Express são disponibilizadas como função serverless por `api/[...path].ts`.

Configure `GEMINI_API_KEY` nos ambientes da Vercel para habilitar o modo Gemini. O modo Web Speech não depende dessa variável.
