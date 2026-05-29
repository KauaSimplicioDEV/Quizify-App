# Quizify — Guia de integração com o backend

Este documento descreve **tudo** que o app espera do backend para que o fluxo
fim-a-fim funcione (autenticação, quiz gerado por IA, tentativas, ranking e dica
via LLM). Também tem um **checklist passo-a-passo** para implementar tanto no
backend quanto no app quando a API estiver pronta.

> O app foi escrito para operar em dois modos:
>
> - **Modo offline** (sem `EXPO_PUBLIC_API_URL`) — banco de questões local
>   (`lib/quiz/questions/*`) e persistência em SecureStore. Útil para
>   desenvolvimento e demos.
> - **Modo conectado** (com `EXPO_PUBLIC_API_URL`) — toda chamada vai para o
>   backend através de `lib/quiz/quiz-api.ts`. As funções caem para o modo
>   offline automaticamente em caso de falha, exceto para o login que sempre
>   exige o backend.

---

## 1. Visão geral

```
┌───────────────────────┐    HTTPS + JWT (Bearer)    ┌───────────────────────┐
│   App (React Native)  │ ─────────────────────────▶ │ Backend (amigo / API) │
│   - Telas, contexto   │ ◀───────────────────────── │ - Auth                │
│   - lib/quiz/*        │                            │ - OpenAI (dica/quest.)│
│   - lib/quiz/quiz-api │                            │ - DB (attempts/rank)  │
└───────────────────────┘                            └───────────────────────┘
```

- Toda chamada autenticada passa por `lib/api-client.ts → authorizedFetch`,
  que injeta `Authorization: Bearer <accessToken>`.
- O cliente **espera HTTPS** e formato **JSON**.
- O cliente envia o padrão de mix esperado (4 fáceis + 4 médias + 2 difíceis)
  para que o backend retorne as 10 questões já nessa ordem.

---

## 2. Variáveis de ambiente

| Variável                   | Onde usar | Para que serve                                                                                |
| -------------------------- | --------- | --------------------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`      | app       | URL base do backend (sem `/` no fim). Quando vazia, o app entra em modo offline.              |
| `EXPO_PUBLIC_LLM_API_KEY`  | app       | (Opcional / dev) chave Gemini local. **Em produção, mantenha vazia** e use o proxy `/quiz/hint`. |
| `OPENAI_API_KEY`           | backend   | Chave do provedor de IA usado pelo backend para gerar questões e dicas.                       |
| `JWT_SECRET` / cert. RS256 | backend   | Para assinar/validar tokens.                                                                  |

> ⚠️ **Nunca** coloque `OPENAI_API_KEY` no cliente. Use o proxy `/quiz/hint`.

---

## 3. Endpoints obrigatórios

> Todas as respostas usam JSON (`Content-Type: application/json`).
> Status `4xx`/`5xx` devem retornar `{ "message": string, "code": string }`.

### 3.1 Autenticação (já contratada nos arquivos `lib/auth-api.ts`)

| Método | Rota                    | Auth | Descrição                                                |
| ------ | ----------------------- | ---- | -------------------------------------------------------- |
| POST   | `/auth/register`        | não  | Criar usuário (`name`, `email`, `password`).             |
| POST   | `/auth/login`           | não  | Autenticar e emitir JWT (`accessToken`, opcional `refreshToken`). |
| POST   | `/auth/forgot-password` | não  | Disparar e-mail de recuperação. Resposta neutra.         |
| POST   | `/auth/refresh` *(rec.)* | não | Renovar `accessToken` a partir do `refreshToken`. *(usado quando S-03 for implementado)* |

**Bloqueio por 3 falhas (A-06)**: o backend deve responder com `423` ou
`{ code: "blocked" }` quando estourar o limite. O app já trata esses casos em
`lib/auth-api.ts` e `lib/login-attempts.ts`.

---

### 3.2 Quiz — montar tentativa (consumido por `quiz-api.startQuiz`)

`POST /quiz/start` (auth obrigatória)

**Request** — o backend sorteia/gera as questões (OpenAI); **não** há `themeId` no cliente. O assunto fica no texto de cada pergunta.

```json
{
  "count": 10,
  "pattern": ["easy", "easy", "medium", "medium", "hard", "hard", "easy", "easy", "medium", "medium"]
}
```

**Response 200**
```json
{
  "attemptId": "att_2026-01-01_abc",
  "questions": [
    {
      "id": "openai-q-001",
      "themeId": "languages",
      "level": "easy",
      "prompt": "Qual destes é um tipo primitivo em JavaScript?",
      "options": ["Array", "string", "Map", "Set"],
      "correctIndex": 1,
      "explanation": "string, number, boolean… são primitivos.",
      "hint": "Pense em algo que armazena apenas um valor."
    }
    // … 9 outras questões, **na mesma ordem do pattern**
  ]
}
```

**Regras esperadas**
- `questions.length === count` (default 10).
- A ordem das questões **deve seguir o `pattern`**.
- O backend pode armazenar o gabarito (`correctIndex`) e/ou enviar para o
  cliente — o cliente já valida no client; idealmente o backend revalida o
  envio em `POST /attempts`.
- `attemptId` é opcional; quando enviado, o app guarda no `quiz-context` como
  `remoteAttemptId` e devolve em `POST /attempts` para correlacionar.
- Status `429` ⇒ limite diário atingido (G-03).

**Codes de erro a respeitar**
- `401` sessão inválida.
- `403` sem permissão.
- `429` limite de tentativas diário atingido.

---

### 3.3 Tentativas — gravar resultado (G-07)

`POST /attempts` (auth obrigatória)

**Request** — campos espelham `StoredAttempt` (ver `lib/quiz/attempts.ts`).

```json
{
  "userId": "u_123",
  "themeId": "languages",
  "level": "mixed",
  "score": 920,
  "correctCount": 8,
  "totalQuestions": 10,
  "durationMs": 142000,
  "llmUsed": true,
  "attemptId": "att_2026-01-01_abc"
}
```

**Response 200**
```json
{
  "id": "att_db_1",
  "finishedAt": "2026-01-01T16:42:00.000Z"
}
```

> O cliente **confia** no `score` enviado, mas o backend **deve recalcular**
> com base no gabarito + `secondsTaken` para evitar manipulação (regras em
> `lib/quiz/scoring.ts`: `100 × multiplicador_de_nivel × fator_de_tempo`).

---

### 3.4 Tentativas — consultas auxiliares

| Método | Rota                   | Auth | Resposta                                                          |
| ------ | ---------------------- | ---- | ----------------------------------------------------------------- |
| GET    | `/attempts/status`     | sim  | `{ used, remaining, limit, canPlay, resetsAtMs }` (ou `resetsAt` ISO) |
| GET    | `/attempts/me`         | sim  | `{ attempts: StoredAttempt[] }` ordenado do mais recente.         |
| GET    | `/attempts/me/stats`   | sim  | `{ attempts, bestScore, totalScore, averageScore, correctRate }`  |

Detalhe `correctRate` é em **porcentagem inteira** (0..100).

---

### 3.5 Ranking (R-01..R-03)

| Método | Rota                       | Auth | Resposta                                                                |
| ------ | -------------------------- | ---- | ----------------------------------------------------------------------- |
| GET    | `/ranking/top?limit=10`    | sim  | `{ ranking: RankEntry[] }` ordenado por score desc, tempo asc.          |
| GET    | `/ranking/me`              | sim  | `{ rank: number \| null, entry: RankEntry \| null, total: number }`     |

**`RankEntry`** (do app, `lib/quiz/ranking.ts`):
```ts
{
  attemptId: string;
  userId: string;
  userName: string;
  themeId: string;       // ex. "languages"
  level: "mixed" | "easy" | "medium" | "hard";
  score: number;
  durationMs: number;
  finishedAt: string;    // ISO
}
```

> O backend pode (e deve) recalcular o ranking ao receber `POST /attempts` —
> o cliente não envia mais `POST /ranking`; ele apenas lê `GET /ranking/me`.

---

### 3.6 Dica via LLM (L-01..L-04)

`POST /quiz/hint` (auth obrigatória)

**Request**
```json
{ "questionId": "openai-q-001" }
```

**Response 200**
```json
{ "hint": "Pense no que NÃO é uma coleção." }
```

**Regras**
- A dica deve ter ≤ 25 palavras (PT-BR).
- **Não deve conter** a alternativa correta ou o índice/letra correspondente.
- Timeout sugerido: 8s. O cliente também tem timeout de 8s; mais que isso
  cai no fallback local (`question.hint`).
- O contador "1 dica por tentativa" (L-02) **deve ser reforçado no servidor**
  amarrando ao `attemptId` (ou `userId + dia`).

---

## 4. Onde o app consome cada endpoint

| Endpoint                | Chamado por                                  |
| ----------------------- | -------------------------------------------- |
| `POST /quiz/start`      | `lib/quiz/quiz-api.ts → startQuiz`           |
| `POST /attempts`        | `lib/quiz/quiz-api.ts → recordAttempt`       |
| `GET  /attempts/status` | `lib/quiz/quiz-api.ts → getAttemptsStatus`   |
| `GET  /attempts/me`     | `lib/quiz/quiz-api.ts → getUserAttempts`     |
| `GET  /attempts/me/stats` | `lib/quiz/quiz-api.ts → getUserStats`      |
| `GET  /ranking/top`     | `lib/quiz/quiz-api.ts → getTopRanking`       |
| `GET  /ranking/me`      | `lib/quiz/quiz-api.ts → getUserRankPosition` / `submitToRanking` |
| `POST /quiz/hint`       | `lib/quiz/quiz-api.ts → requestRemoteHint` (usado em `app/quiz/play.tsx`) |

---

## 5. Erros comuns e como o app os interpreta

| Status | Como o app age                                                              |
| ------ | --------------------------------------------------------------------------- |
| 401    | Mostra "Sessão expirada" e direciona ao login.                              |
| 403    | Mostra mensagem de acesso negado.                                            |
| 429    | Mostra "Limite de tentativas atingido"; atualiza `attempts/status`.          |
| 5xx    | Mensagem genérica + fallback offline quando possível.                        |

---

## 6. Checklist passo-a-passo

### 6.1 Para o backend (lista para o amigo)

- [ ] **Auth**
  - [ ] Implementar `POST /auth/register` com hash bcrypt/argon2.
  - [ ] Implementar `POST /auth/login` emitindo JWT (≤ 1h).
  - [ ] Bloquear conta por 15min após 3 falhas (A-06): retornar `423` com `code:"blocked"`.
  - [ ] (Opcional) `POST /auth/refresh` + emissão de `refreshToken`.
  - [ ] `POST /auth/forgot-password` com resposta neutra (sempre `204` ou genérica).

- [ ] **Quiz**
  - [ ] `POST /quiz/start`: gera 10 questões via OpenAI respeitando o `pattern`.
  - [ ] Garantir cache/idempotência por tentativa (não gerar duas vezes para o mesmo `attemptId`).
  - [ ] Persistir gabarito + `attemptId` para auditoria.

- [ ] **Tentativas e Ranking**
  - [ ] `POST /attempts`: validar score (recalcular no servidor), gravar e atualizar ranking.
  - [ ] `GET /attempts/status`: contar tentativas do **dia local do usuário** (definir `Time-Zone`).
  - [ ] `GET /attempts/me`, `/attempts/me/stats`.
  - [ ] `GET /ranking/top`, `/ranking/me` ordenados conforme R-01.

- [ ] **Dica LLM**
  - [ ] `POST /quiz/hint`: proxy da OpenAI; valida `attemptId` e marca uso (L-02).
  - [ ] Filtrar e remover a alternativa correta da resposta (regra de prompt).

- [ ] **Operacional**
  - [ ] Servir tudo via **HTTPS** com certificado válido.
  - [ ] Tratar CORS para os domínios do app web.
  - [ ] Limites de taxa por usuário/IP em rotas sensíveis (`/quiz/hint`, `/auth/login`).
  - [ ] Documentar com OpenAPI/Swagger (recomendado).

### 6.2 Para o app (o que você precisa fazer quando o backend estiver pronto)

> Tudo já está implementado **atrás de** `lib/quiz/quiz-api.ts`. Em modo
> offline a chamada cai no banco local. Para ativar o modo conectado:

- [ ] Definir `EXPO_PUBLIC_API_URL` no `.env` apontando para a URL do backend.
      Ex.: `EXPO_PUBLIC_API_URL=https://api.quizify.exemplo.com`.
- [ ] **Apagar** ou esvaziar `EXPO_PUBLIC_LLM_API_KEY` (em produção a dica vem do servidor).
- [ ] (Recomendado) Rodar `npx expo start --clear` para garantir que o bundler pegue o env novo.
- [ ] Testar:
  - [ ] Login e cadastro → 401 expulsam do app, 423 mostra "conta bloqueada".
  - [ ] `Jogar` → splash → `POST /quiz/start` → 10 questões na ordem `pattern`.
  - [ ] Concluir tentativa → `POST /attempts` → resultado mostra rank atualizado.
  - [ ] Aba **Ranking** consome `GET /ranking/top` (top 10) e `GET /ranking/me` (sua posição).
  - [ ] Aba **Perfil** mostra stats vindos de `GET /attempts/me/stats` e tentativas em `/attempts/status`.
  - [ ] Botão **💡 Dica** chama `POST /quiz/hint` e mostra o texto sem revelar a resposta.
- [ ] Validar o status `429`: depois de 3 tentativas no dia, a Home/Roleta devem desabilitar o botão.
- [ ] (Opcional) Quando o backend tiver `POST /auth/refresh`, completar **S-03** no app:
  interceptar `401`, tentar refresh com `getRefreshToken()` e repetir a requisição.

### 6.3 Pontos de decisão a alinhar com o amigo

1. **Fuso horário**: a regra de "3/dia" usa o dia local do dispositivo no app.
   No servidor, é melhor armazenar UTC e definir `timezone` por usuário (ou
   aceitar o fuso enviado no header `X-Tz`). Combinar a regra antes.
2. **Mock vs IA real**: o backend pode começar com um pool fixo e migrar para
   geração on-the-fly via OpenAI — a interface `POST /quiz/start` não muda.
3. **Refresh tokens**: se a política exigir, definir TTL access (≤ 1h) e
   refresh (dias). O app já persiste `refreshToken` em SecureStore quando o
   backend o envia.
4. **CORS para web**: o app roda em Expo Web; configurar `Access-Control-Allow-Origin`.

---

## 7. Arquivos relevantes no app

- `lib/api-client.ts` — `authorizedFetch` (injeta Bearer).
- `lib/api-config.ts` — leitura de `EXPO_PUBLIC_API_URL`.
- `lib/auth-api.ts` — chamadas de autenticação.
- `lib/auth-storage.ts` — `SecureStore` (tokens + usuário).
- `lib/quiz/quiz-api.ts` — **camada principal de integração com o backend do quiz**.
- `lib/quiz/questions/*` — banco local (fallback offline).
- `lib/quiz/{attempts,ranking,scoring,llm}.ts` — regras locais reutilizadas no offline.
- `contexts/quiz-context.tsx` — estado da tentativa em curso.

Qualquer mudança de contrato deve começar por **atualizar `quiz-api.ts`** e
manter este documento como fonte da verdade.
