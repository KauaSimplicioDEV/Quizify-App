# Quizify — Complementos por requisito

Espelho do [CHECKLIST.md](./CHECKLIST.md): mesma ordem e IDs. Cada item lista **o que ainda falta** (app, backend ou decisão) para a funcionalidade funcionar de ponta a ponta. Marque `- [ ]` como `- [x]` ao concluir.

**Legenda de IDs:** igual ao checklist principal (ex.: `A-05`, `G-02`).

---

## Autenticação e usuários (A)

- [x] **A-01** Cadastro de usuário (e-mail, senha e identificação mínima acordada).
  - [ ] Backend: `POST /auth/register` com persistência, validação e hash de senha.
  - [ ] Alinhar contrato JSON do servidor com o que `lib/auth-api.ts` envia e espera (`user`, tokens).
  - [ ] `EXPO_PUBLIC_API_URL` definida em builds que falam com a API real.

- [x] **A-02** Login com e-mail e senha; sessão associada ao usuário.
  - [ ] Backend: `POST /auth/login` emitindo JWT (e opcionalmente refresh) + objeto `user`.
  - [ ] Tratar no servidor bloqueio por tentativas (coerente com A-06 no cliente).
  - [ ] Testar fluxo com API real (sem depender só do mock `__DEV__`).

- [x] **A-03** Logout e limpeza/invalidação de credenciais locais.
  - [ ] (Opcional) Endpoint de revoke ou blacklist de token no backend, se a política de segurança exigir.
  - [ ] Garantir que `clearSession` é chamado em todos os fluxos de saída (revisar novas entradas no futuro).

- [x] **A-04** Fluxo de recuperação de senha no app (`/(auth)/forgot-password`) + `POST /auth/forgot-password` quando `EXPO_PUBLIC_API_URL` está definida. _Redefinição via link/token é responsabilidade do e-mail/backend._
  - [ ] Backend: `POST /auth/forgot-password` (e-mail com link seguro; resposta uniforme para não enumerar contas).
  - [ ] Fluxo pós-link: página web ou deep link com `POST /auth/reset-password` (ou equivalente) e expiração do token de reset.
  - [ ] Documentar para QA que sem `EXPO_PUBLIC_API_URL` a recuperação não contacta API (mensagem em dev).

- [x] **A-05** Autenticação com **JWT** (backend emite token; app em SecureStore; `authorizedFetch` em `lib/api-client.ts` para rotas protegidas). _Mock em `__DEV__` sem API; contratos `login` / `register` / `forgot-password`._
  - [ ] Usar `authorizedFetch` em todas as chamadas autenticadas futuras (quiz, ranking, perfil, etc.).
  - [ ] Backend: expiração de access token e contrato de `401` alinhados com o app.

- [x] **A-06** **Bloqueio por e-mail** após **3 tentativas falhas** de login (regra de janela tempo e desbloqueio definida e implementada). _Cliente: 15 min após 3 falhas; backend deve reforçar._
  - [ ] Backend: mesma regra (ou mais restritiva): contador por e-mail ou IP, janela e código HTTP (ex.: 423) alinhados ao cliente.

- [x] **A-07** Mensagens de erro distintas: credenciais inválidas vs. conta bloqueada.
  - [ ] Backend: mensagens ou códigos estáveis para o app mapear sem ambiguidade em novas telas.

- [x] **A-08** Tokens não expostos em logs; armazenamento em secure storage; **refresh token** persistido quando a API envia `refreshToken` / `refresh_token` no login/cadastro. _Renovação automática (S-03) ainda depende do backend e de chamada explícita futura._
  - [ ] Backend: enviar `refreshToken` ou `refresh_token` no login e cadastro, se a política incluir refresh.
  - [ ] Renovação automática (ver **S-03**) e logout limpo quando o refresh for inválido.

---

## Segurança e dados (S)

- [ ] **S-01** Comunicação com API apenas via HTTPS.
  - [ ] Hospedar API com TLS válido; proibir `http://` em `EXPO_PUBLIC_API_URL` em produção (validação no app ou na pipeline de build).
  - [ ] Certificate pinning (opcional, se exigido pelo projeto).

- [x] **S-02** Validação de entrada no cliente e, onde couber, no servidor. _Cliente nas telas de auth; servidor quando API existir._
  - [ ] Replicar regras de auth e dos restantes endpoints no servidor; limites de tamanho e sanitização.

- [ ] **S-03** Política de expiração e renovação de JWT documentada e implementada.
  - [ ] Documentar tempos de vida (access vs refresh) e rota (ex.: `POST /auth/refresh`).
  - [ ] App: interceptar `401`, tentar refresh com `getRefreshToken`, repetir o pedido ou fazer logout.
  - [ ] Backend: rotação ou invalidação de refresh, se aplicável.

- [ ] **S-04** Dados sensíveis não persistidos em texto plano fora do secure storage.
  - [ ] Auditar AsyncStorage, estado global e logs por tokens ou dados pessoais.
  - [ ] Web: `localStorage` em dev é fraco; evitar dados sensíveis ou documentar o risco.

---

## Plataforma e arquitetura — React Native (T)

- [x] **T-01** App React Native estruturado (navegação, pastas, ambientes dev/prod). _Grupo `(auth)`, `index` de roteamento, abas protegidas, grupo `quiz/*` para o gameplay._
  - [ ] Revisar proteção de rotas `quiz/*` vs. convidado (redirecionar quando sessão expirar).
  - [ ] Perfis de build EAS e variáveis por canal (staging vs produção).

- [x] **T-02** Gerenciamento de estado global/local conforme padrão do projeto. _`AuthProvider` + `QuizProvider` (estado da tentativa em curso); estado por tela com hooks locais._
  - [ ] Introduzir store ou camada de dados (ex.: TanStack Query) quando o volume de API crescer, se o time acordar.

- [x] **T-03** Persistência (preferências, tutorial visto, cache seguro conforme necessidade). _Tutorial em `lib/tutorial.ts`; tentativas em `lib/quiz/attempts.ts`; ranking em `lib/quiz/ranking.ts` — tudo via SecureStore._
  - [ ] Considerar AsyncStorage para dados não sensíveis (histórico de questões) quando o volume crescer.
  - [ ] Estratégia de invalidação/migração quando esquemas mudarem.

- [x] **T-04** Variáveis de ambiente para API e segredos (não commitar chaves). _Ver `.env.example` (`EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_LLM_API_KEY`)._
  - [ ] Garantir que segredos de servidor nunca usam o prefixo `EXPO_PUBLIC_`.
  - [ ] CI/CD injeta `.env` ou secrets sem commit.
  - [ ] Mover `EXPO_PUBLIC_LLM_API_KEY` para proxy no backend em produção (L-01).

---

## Gameplay do quiz (G)

> Detalhes finos de contrato em [`BACKEND-INTEGRATION.md`](./BACKEND-INTEGRATION.md).

- [x] **G-01** Botão de jogar geral na tela inicial. _`PlayNowCard` em `(tabs)/index.tsx`. Botão único, sem escolha de nível._
  - [ ] (Opcional) Atalho "última tentativa" para retomar tema anterior.

- [x] **G-02** **10 questões por tentativa** com fluxo claro até o fim da tentativa. _`startQuiz` (em `lib/quiz/quiz-api.ts`) devolve 10 questões; `quiz-context` controla `index/answers/score`._
  - [ ] Backend: respeitar `pattern` e devolver exatamente `count` questões.
  - [ ] Confirmação opcional ao tentar voltar/recarregar durante a tentativa (atual: `Alert` no botão físico de Android).

- [x] **G-03** **Até 3 tentativas por usuário** (critério: por quiz, por dia ou global — definido e implementado). _Decisão: 3 por dia, reset local. App + servidor devem alinhar fuso._
  - [ ] Backend: replicar limite por usuário considerando fuso do usuário; retornar `429` em `POST /quiz/start` quando estourar.

- [x] **G-04** Coerência com **30 questões totais** (3 × 10) no modelo de dados e na UX. _Cada tentativa é **mista** (4 fáceis + 4 médias + 2 difíceis na ordem `QUIZ_LEVEL_PATTERN`). Banco local com 30 por tema para fallback offline._
  - [ ] Backend: gerar 10 questões via OpenAI seguindo o `pattern` recebido.
  - [ ] Validação no CI: cada (tema, nível) precisa ter ≥ 10 questões no banco local.

- [x] **G-05** Feedback por questão ou apenas ao final — decisão implementada de ponta a ponta. _Feedback imediato (correto/errado + explicação) + resultado final consolidado._
  - [ ] Telemetria: registrar tempos e erros por questão (futuro analytics).

- [x] **G-06** Sistema de **pontuação** com regras explícitas (nível, acerto, tempo, etc.). _`scoring.ts`: 100 × nível da questão × tempo. Bônus máximo 1.0; mínimo 0.5._
  - [ ] Backend: recalcular no servidor com o mesmo algoritmo (impede manipulação do cliente).

- [x] **G-07** **Persistência de resultados** no backend (tentativa, pontuação, nível, data/hora, usuário). _`recordAttempt` em `quiz-api.ts` chama `POST /attempts` quando há API; senão SecureStore._
  - [ ] Backend: implementar `POST /attempts`, `GET /attempts/me`, `/attempts/me/stats` e `/attempts/status` conforme contrato.

---

## Temas e conteúdo (C)

- [x] **C-01** **Seleção de tema por roleta** (ou equivalente visual) integrada ao fluxo do quiz. _Roleta animada em `components/quiz/theme-wheel.tsx`._
  - [ ] Permitir override ("escolher manualmente") em uma futura iteração?

- [x] **C-02** Cobertura de temas de **Tecnologia**: linguagens, lógica, estruturas de dados, redes, bancos de dados, autenticação, tokens, IA. _7 temas em `lib/quiz/themes.ts`._
  - [ ] Revisar/expandir banco de questões com curadoria periódica (se houver backend, conteúdo administrado).

- [x] **C-03** Mapeamento tema → conjunto de questões utilizável na montagem das 10 questões. _Filtro por `themeId + level` em `pickQuestions`._
  - [ ] Validação automática no CI: cada (tema, nível) precisa ter ≥ 10 questões.

---

## Ranking (R)

- [x] **R-01** Regra do **top 10** definida (ex.: maior pontuação, período de ranking). _Top 10 global por melhor tentativa, desempate por tempo. `RankEntry.level` agora é `'mixed'` por padrão (preserva nível para dados antigos)._
  - [ ] Considerar variantes: por tema (segmentar `getTopRanking`).

- [x] **R-02** Tela de ranking com os 10 e destaque do usuário atual quando aplicável. _Tela `rank.tsx` + componente `RankRow` com `isCurrentUser`. Linha mostra "🎲 Mista" no lugar do nível único._
  - [ ] Quando integrar API, mostrar avatares / IDs anônimos com privacidade adequada.

- [x] **R-03** Ranking atualizado após conclusão de tentativa válida. _`submitToRanking` em `quiz-api.ts` (modo offline atualiza local; modo conectado apenas consulta posição porque o servidor já recalculou no `POST /attempts`)._
  - [ ] Backend: invalidar cache / publicar evento quando uma tentativa elevar o ranking.

---

## Integração LLM (L)

- [x] **L-01** Integração com provedor LLM (API, modelo, limites de custo). _Backend usará **OpenAI** e exporá `POST /quiz/hint` (proxy). O app chama via `requestRemoteHint` em `quiz-api.ts`; mantém Gemini Flash local (`lib/quiz/llm.ts`) como fallback de desenvolvimento._
  - [ ] Backend: definir budget mensal e alertas no provedor.
  - [ ] Em produção, esvaziar `EXPO_PUBLIC_LLM_API_KEY` para forçar o uso do proxy.

- [x] **L-02** **Exatamente 1 uso de LLM por tentativa**, em qualquer nível (contador por tentativa). _Cliente: `llmUsed` no `quiz-context`. Servidor: deve validar `attemptId` para reforçar a regra._
  - [ ] Backend: registrar uso em `attempt_hint_usage` e bloquear 2º pedido.

- [x] **L-03** UX do recurso LLM (dica, explicação, etc.) alinhada ao escopo acordado. _Dica curta (≤ 25 palavras) sem revelar resposta; UI em `hint-modal.tsx`._
  - [ ] (Opcional) Avaliar usuários gostarem ou não da dica (👍 / 👎) para tuning.

- [x] **L-04** Tratamento de falhas (rede, timeout, quota) sem corromper a tentativa em andamento. _Timeout de 8s, cadeia `remoto → Gemini → local`, sem propagar erro à UI._
  - [ ] Backend: logar falhas para monitoramento; manter SLA do recurso.

---

## Onboarding e tutorial (O)

- [x] **O-01** Detecção de novo usuário (primeiro acesso ou flag persistida). _Flag por `userId` em `lib/tutorial.ts`; checagem em `identify` redireciona para `/onboarding`._
  - [ ] Quando houver backend, considerar persistir a flag no perfil do usuário para multi-dispositivo.

- [x] **O-02** Tutorial guiando: auth, nível, roleta, quiz, LLM, ranking (passos acordados). _7 passos em `components/onboarding/tutorial-modal.tsx`._
  - [ ] Tornar dinâmico: textos no backend permitem ajustes sem nova build.

- [x] **O-03** Opções "pular tutorial" e "rever tutorial" (ex.: em configurações). _Botão "Pular" no modal; botão "↻ Rever tutorial" no Perfil._
  - [ ] Métricas: % de usuários que pulam vs. completam.

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

## Decisões pendentes (copiadas do checklist principal — agora fechadas)

1. **Tentativas (G-03):** **3 por dia, por usuário** (reset à meia-noite local).
2. **Mix de dificuldade (G-04):** **2 fáceis → 2 médias → 2 difíceis → 2 fáceis → 2 médias** (10 questões, sem escolha do usuário).
3. **Ranking (R-01):** **Top 10 global**, melhor pontuação por usuário, desempate por menor `durationMs`.
4. **LLM (L-03):** **1 dica curta sobre a questão atual**, sem revelar a alternativa correta.
5. **Backend (integração):** contratos detalhados em [`BACKEND-INTEGRATION.md`](./BACKEND-INTEGRATION.md). Toggle por `EXPO_PUBLIC_API_URL`.

---

## Como usar os dois ficheiros

| Ficheiro                    | Uso principal                                      |
| --------------------------- | -------------------------------------------------- |
| `CHECKLIST.md`              | Estado "feito / por fazer" do requisito.           |
| `CHECKLIST-COMPLEMENTOS.md` | Lista de trabalhos para **ligar** cada requisito à realidade (API, decisões, integração). |
