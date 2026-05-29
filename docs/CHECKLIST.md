# Quizify — Checklist de desenvolvimento

Guia de acompanhamento prático derivado dos requisitos do projeto. Marque `- [ ]` como `- [x]` ao concluir.

**Legenda de IDs:** use em commits, issues e PRs (ex.: `feat(auth): A-05 JWT`).

---

## Autenticação e usuários (A)

- [x] **A-01** Cadastro de usuário (e-mail, senha e identificação mínima acordada).
- [x] **A-02** Login com e-mail e senha; sessão associada ao usuário.
- [x] **A-03** Logout e limpeza/invalidação de credenciais locais.
- [x] **A-04** Fluxo de recuperação de senha no app (`/(auth)/forgot-password`) + `POST /auth/forgot-password` quando `EXPO_PUBLIC_API_URL` está definida. _Redefinição via link/token é responsabilidade do e-mail/backend._
- [x] **A-05** Autenticação com **JWT** (backend emite token; app em SecureStore; `authorizedFetch` em `lib/api-client.ts` para rotas protegidas). _Mock em `__DEV__` sem API; contratos `login` / `register` / `forgot-password`._
- [x] **A-06** **Bloqueio por e-mail** após **3 tentativas falhas** de login (regra de janela tempo e desbloqueio definida e implementada). _Cliente: 15 min após 3 falhas; backend deve reforçar._
- [x] **A-07** Mensagens de erro distintas: credenciais inválidas vs. conta bloqueada.
- [x] **A-08** Tokens não expostos em logs; armazenamento em secure storage; **refresh token** persistido quando a API envia `refreshToken` / `refresh_token` no login/cadastro. _Renovação automática (S-03) ainda depende do backend e de chamada explícita futura._

---
<!--
## Segurança e dados (S)

- [ ] **S-01** Comunicação com API apenas via HTTPS.
- [x] **S-02** Validação de entrada no cliente e, onde couber, no servidor. _Cliente nas telas de auth; servidor quando API existir._
- [ ] **S-03** Política de expiração e renovação de JWT documentada e implementada.
- [ ] **S-04** Dados sensíveis não persistidos em texto plano fora do secure storage.

--- -->

<!-- ## Plataforma e arquitetura — React Native (T)

- [x] **T-01** App React Native estruturado (navegação, pastas, ambientes dev/prod). _Grupo `(auth)`, `index` de roteamento, abas protegidas._
- [x] **T-02** Gerenciamento de estado global/local conforme padrão do projeto. _`AuthProvider` + contexto de sessão._
- [x] **T-03** Persistência (preferências, tutorial visto, cache seguro conforme necessidade). _Flag de tutorial por usuário em `lib/tutorial.ts` via SecureStore; tentativas e ranking persistidos em SecureStore._
- [x] **T-04** Variáveis de ambiente para API e segredos (não commitar chaves). _Ver `.env.example` (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_LLM_API_KEY`)._

--- -->

## Gameplay do quiz (G)

- [x] **G-01** Botão de jogar geral na tela inicial. _`PlayNowCard` → `app/quiz/start.tsx` (splash + carregamento) → `play.tsx`. Sem roleta nem escolha de tema._
- [x] **G-02** **10 questões por tentativa** com fluxo claro até o fim da tentativa. _`startQuiz` em `lib/quiz/quiz-api.ts` devolve 10 questões (do backend ou fallback local); `app/quiz/play.tsx` percorre `questions[index]` com timer e feedback._
- [x] **G-03** **Até 3 tentativas por usuário** (critério: por quiz, por dia ou global — definido e implementado). _Decisão: **3 tentativas por dia**, reset à meia-noite local. No app, `lib/quiz/attempts.ts` + UI em Home/Roleta/Perfil. No backend, `GET /attempts/status` e `429` em `POST /quiz/start`._
- [x] **G-04** Coerência com **30 questões totais** (3 × 10) no modelo de dados e na UX. _Banco em `lib/quiz/questions/*` mantém 30 por tema. **Cada tentativa é mista**: padrão `QUIZ_LEVEL_PATTERN` = 2 fáceis → 2 médias → 2 difíceis → 2 fáceis → 2 médias (4f + 4m + 2d). `pickMixedQuestions` faz o sorteio local; o backend deve respeitar o mesmo `pattern` em `POST /quiz/start`._
- [x] **G-05** Feedback por questão ou apenas ao final — decisão implementada de ponta a ponta. _Decisão: **feedback imediato após cada questão** (acerto/erro + explicação curta) + tela `result.tsx` consolidada ao final._
- [x] **G-06** Sistema de **pontuação** com regras explícitas (nível, acerto, tempo, etc.). _Fórmula em `lib/quiz/scoring.ts`: 100 × multiplicador do nível **da questão** (1.0/1.5/2.0) × fator de tempo (1.0 a 0.5 em 25s). O nível agora é por questão, não por tentativa._
- [x] **G-07** **Persistência de resultados** no backend (tentativa, pontuação, nível, data/hora, usuário). _Camada `quiz-api.ts` chama `POST /attempts` quando `EXPO_PUBLIC_API_URL` está definida; senão usa SecureStore. Contratos em `docs/BACKEND-INTEGRATION.md`._

---

## Temas e conteúdo (C)

- [x] **C-01** ~~Roleta de temas~~ **Removido** — assunto no texto da pergunta. Fluxo: `app/quiz/start.tsx` (splash) → `play.tsx`._
- [x] **C-02** Cobertura de temas de **Tecnologia**: linguagens, lógica, estruturas de dados, redes, bancos de dados, autenticação, tokens, IA. _Definidos em `lib/quiz/themes.ts` (7 temas)._
- [x] **C-03** Mapeamento tema → conjunto de questões utilizável na montagem das 10 questões. _Banco em `lib/quiz/questions/*` indexado por `themeId` + `level`; `pickQuestions` seleciona 10 aleatórias._

---

## Ranking (R)

- [x] **R-01** Regra do **top 10** definida (ex.: maior pontuação, período de ranking). _Decisão: **Top 10 global**, por melhor pontuação em uma única tentativa. Desempate por menor `durationMs`. Implementado em `lib/quiz/ranking.ts`._
- [x] **R-02** Tela de ranking com os 10 e destaque do usuário atual quando aplicável. _`app/(tabs)/rank.tsx` consome `getTopRanking` e usa `RankRow` com flag `isCurrentUser`; usuário fora do top é exibido em seção "…sua posição"._
- [x] **R-03** Ranking atualizado após conclusão de tentativa válida. _`app/quiz/result.tsx` chama `submitToRanking` após `recordAttempt`; a tela de ranking lê via `useFocusEffect`._

---

## Integração LLM (L)

- [x] **L-01** Integração com provedor LLM (API, modelo, limites de custo). _O backend usa OpenAI (criado pelo amigo) e expõe `POST /quiz/hint` (proxy). O app chama via `requestRemoteHint` em `lib/quiz/quiz-api.ts`. Em dev, há fallback opcional Gemini via `EXPO_PUBLIC_LLM_API_KEY`. Contratos em `docs/BACKEND-INTEGRATION.md`._
- [x] **L-02** **Exatamente 1 uso de LLM por tentativa**, em qualquer nível (contador por tentativa). _No cliente: `llmUsed` no `quiz-context.tsx`. No servidor: o backend valida via `attemptId`._
- [x] **L-03** UX do recurso LLM (dica, explicação, etc.) alinhada ao escopo acordado. _Decisão: **uma dica curta (≤ 25 palavras) sobre a questão atual, sem revelar a resposta**. UI em `components/quiz/hint-modal.tsx`._
- [x] **L-04** Tratamento de falhas (rede, timeout, quota) sem corromper a tentativa em andamento. _Timeout de 8s + `AbortController` + cadeia de fallback: backend (`/quiz/hint`) → Gemini direto (dev) → `question.hint` local. A tentativa segue normalmente em caso de falha._

---

## Onboarding e tutorial (O)

- [x] **O-01** Detecção de novo usuário (primeiro acesso ou flag persistida). _Flag por `userId` em `lib/tutorial.ts`; `auth-context.tsx` redireciona para `/onboarding` quando a flag está ausente._
- [x] **O-02** Tutorial guiando: auth, jogar, quiz, LLM, ranking. _`components/onboarding/tutorial-modal.tsx` (6 passos, sem roleta)._
- [x] **O-03** Opções "pular tutorial" e "rever tutorial" (ex.: em configurações). _Botão "Pular tutorial" no próprio modal; "↻ Rever tutorial" disponível no Perfil._

---

## Matriz de rastreabilidade

| Prefixo | Categoria        |
| ------- | ---------------- |
| A       | Autenticação     |
| S       | Segurança        |
| T       | Técnico / RN     |
| G       | Gameplay         |
| C       | Conteúdo / temas |
| R       | Ranking          |
| L       | LLM              |
| O       | Onboarding       |

---

## Decisões tomadas

1. **Tentativas (G-03):** 3 tentativas **por dia**, por usuário, com reset automático à meia-noite local. Compartilhado entre todos os temas.
2. **Mix de dificuldade (G-04):** Cada tentativa tem 10 questões na ordem **2 fáceis → 2 médias → 2 difíceis → 2 fáceis → 2 médias** (4 fáceis + 4 médias + 2 difíceis). Padrão exportado em `QUIZ_LEVEL_PATTERN` e enviado no `POST /quiz/start`. Não há mais seleção de nível pelo usuário.
3. **Ranking (R-01):** Top 10 **global**, ordenado pela **melhor pontuação em uma única tentativa**. Critério de desempate: menor `durationMs`. Mantém apenas a melhor entrada por usuário.
4. **LLM (L-03):** O usuário pode pedir **uma dica curta** (≤ 25 palavras) sobre a questão atual. A dica **não pode revelar a alternativa correta** — o prompt enviado ao modelo já omite a resposta. Em produção, o app chama `POST /quiz/hint` no backend (que fala com OpenAI).
5. **Backend (integração):** documentado em [`docs/BACKEND-INTEGRATION.md`](./BACKEND-INTEGRATION.md). O app opera em **modo offline** quando `EXPO_PUBLIC_API_URL` está vazia e em **modo conectado** quando definida — toda a alternância está em `lib/quiz/quiz-api.ts`.
