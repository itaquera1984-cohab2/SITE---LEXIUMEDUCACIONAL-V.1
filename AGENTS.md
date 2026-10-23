# Lexium Bilingue — repository instructions

## Product purpose

Lexium Bilingue is a bilingual educational-management and reading-fluency application for early-years students. It combines class and student management, English/Spanish reading assessment, NeuroSpot phonetic analysis, progress and equity indicators, and PDF reporting.

## Architecture

- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4, Motion and Lucide icons.
- Backend: Express in `server.ts`, bundled with esbuild for production.
- AI: `@google/genai` runs only on the server. Browser code calls the local API and must never receive an API key.
- Voice evaluation: Web Speech is the default engine for both English and Spanish in LIRA, NeuroSpot and First Steps. Gemini remains an explicit user-selected cloud alternative, never a silent automatic fallback.
- Entry points: `src/main.tsx` for the browser and `server.ts` for the HTTP server.
- Main application state and seeded classroom data currently live in `src/App.tsx`; there is no database or durable client persistence.
- Evaluation orchestration and microphone/browser speech handling live in `src/components/EvaluationSectionWrapper.tsx`.
- Shared domain contracts are in `src/types.ts`; bilingual stages and UI translations are in `src/translations.ts`.
- `src/data.ts` and the compiler-oriented components model an embedded workspace/compiler simulation. Do not assume they are production build infrastructure.

## Runtime and commands

- Requires Node.js and npm.
- Install exact dependencies with `npm ci` when `node_modules/` is absent.
- Development server: `npm run dev` (Express with Vite middleware on port 3000).
- Type check/lint command: `npm run lint` (`tsc --noEmit`).
- Production build: `npm run build`.
- Production start after a build: `npm start`.
- No automated test suite is currently configured. Do not claim tests passed; report type-check and build evidence separately.
- `npm run clean` uses a Unix-style `rm` command and may not work in plain Windows PowerShell. Do not run it unless cleanup is necessary and the exact target has been verified.

## Environment and API contracts

- Local environment is loaded from `.env.local`, falling back to `.env`.
- `GEMINI_API_KEY` is the documented credential name. Preserve server-side secret handling and never commit real keys.
- The server exposes each handler both with and without the `/api` prefix for deployment compatibility.
- Public API routes are `GET /api/health`, `GET /api/debug`, `POST /api/evaluate`, and `POST /api/evaluate-neurospot`.
- Preserve the JSON response shapes defined by `EvaluationResult` and `NeuroSpotResult`; the UI and reporting flows depend on their Portuguese field names.
- Audio requests can be large base64 payloads. Maintain explicit size handling and validate MIME types and required fields when changing endpoints.
- Do not expose environment values through logs or diagnostic endpoints. Key names and presence may be reported only when required for diagnostics; key values must remain secret.

## Privacy and safeguarding

- Treat student names, voice recordings, performance history, race/ethnicity, Bolsa Família status, neurodivergence and special-education indicators as sensitive educational data.
- Do not include real student data, audio or identifiers in tests, logs, screenshots, prompts, generated fixtures or bug reports. Use clearly synthetic examples.
- Minimize data sent to external AI services and preserve informed-consent/LGPD messaging where the product presents it.
- Avoid persisting raw audio or AI responses unless an explicit, reviewed requirement defines retention, access control and deletion behavior.
- Changes to classification, equity/VAAR calculations or pedagogical feedback require focused review because they can affect educational decisions.

## Code-change conventions

- Read the affected component, its wrapper/consumer and the relevant types before editing.
- Keep domain types centralized in `src/types.ts`; avoid parallel ad-hoc response types in components.
- Preserve the English/Spanish language flow. Update `src/translations.ts`, stage content and any language-dependent AI prompt together when terminology changes.
- Keep language selection independent from voice-engine selection: both English and Spanish must offer Web Speech and Gemini in every evaluation module.
- Keep the Gemini integration server-side and preserve graceful errors for unavailable models, invalid AI JSON, denied microphone access and unsupported browser speech recognition.
- Prefer focused changes over broad rewrites. Large files such as `App.tsx`, `EvaluationSection.tsx` and `EvaluationSectionWrapper.tsx` need extra regression checks when touched.
- Preserve accessibility: keyboard operation, readable focus states, labels for controls, non-color-only status cues and clear loading/error states.
- Do not add dependencies unless the existing stack cannot reasonably satisfy the requirement; explain the tradeoff when adding one.

## Verification

For ordinary code changes, use the smallest applicable checks and then broaden as warranted:

1. Run `npm run lint`.
2. Run `npm run build` for changes affecting runtime code, bundling or dependencies.
3. Manually exercise the affected flow when browser, microphone, PDF or Gemini behavior changes.
4. For API changes, verify both prefixed and unprefixed routes when deployment compatibility is in scope.
5. Report exact commands, observed results and any checks that could not be run.

Do not call Gemini merely to validate unrelated UI work. Live AI checks consume an external service, require a configured credential and must use synthetic content.

## Repository boundaries

- Preserve user changes and inspect the working tree before editing when Git metadata is available.
- Do not commit, push, deploy, delete data or change external services without explicit authorization.
- Do not treat the generated README from Google AI Studio as a complete product specification; the live source is the primary technical reference.
- Record uncertainty instead of inventing requirements. Ask before changing product rules, classification thresholds, legal text or handling of sensitive student information.

## Current known limitations

- This directory was not a Git repository when initialized on 23 October 2026.
- No automated tests, database, authentication service or durable storage are present.
- Login credentials and seeded classroom/student records are currently embedded in the frontend and should be treated as prototype/demo behavior, not a secure production design.
