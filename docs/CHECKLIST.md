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

## Segurança e dados (S)

- [ ] **S-01** Comunicação com API apenas via HTTPS.
- [x] **S-02** Validação de entrada no cliente e, onde couber, no servidor. _Cliente nas telas de auth; servidor quando API existir._
- [ ] **S-03** Política de expiração e renovação de JWT documentada e implementada.
- [ ] **S-04** Dados sensíveis não persistidos em texto plano fora do secure storage.

---

## Plataforma e arquitetura — React Native (T)

- [x] **T-01** App React Native estruturado (navegação, pastas, ambientes dev/prod). _Grupo `(auth)`, `index` de roteamento, abas protegidas._
- [x] **T-02** Gerenciamento de estado global/local conforme padrão do projeto. _`AuthProvider` + contexto de sessão._
- [ ] **T-03** Persistência (preferências, tutorial visto, cache seguro conforme necessidade).
- [x] **T-04** Variáveis de ambiente para API e segredos (não commitar chaves). _Ver `.env.example` (`EXPO_PUBLIC_API_URL`)._

---

## Gameplay do quiz (G)

- [ ] **G-01** Três níveis de dificuldade: Fácil, Médio, Difícil (UI + regra de negócio).
- [ ] **G-02** **10 questões por tentativa** com fluxo claro até o fim da tentativa.
- [ ] **G-03** **Até 3 tentativas por usuário** (critério: por quiz, por dia ou global — definido e implementado).
- [ ] **G-04** Coerência com **30 questões totais** (3 × 10) no modelo de dados e na UX.
- [ ] **G-05** Feedback por questão ou apenas ao final — decisão implementada de ponta a ponta.
- [ ] **G-06** Sistema de **pontuação** com regras explícitas (nível, acerto, tempo, etc.).
- [ ] **G-07** **Persistência de resultados** no backend (tentativa, pontuação, nível, data/hora, usuário).

---

## Temas e conteúdo (C)

- [ ] **C-01** **Seleção de tema por roleta** (ou equivalente visual) integrada ao fluxo do quiz.
- [ ] **C-02** Cobertura de temas de **Tecnologia**: linguagens, lógica, estruturas de dados, redes, bancos de dados, autenticação, tokens, IA.
- [ ] **C-03** Mapeamento tema → conjunto de questões utilizável na montagem das 10 questões.

---

## Ranking (R)

- [ ] **R-01** Regra do **top 10** definida (ex.: maior pontuação, período de ranking).
- [ ] **R-02** Tela de ranking com os 10 e destaque do usuário atual quando aplicável.
- [ ] **R-03** Ranking atualizado após conclusão de tentativa válida.

---

## Integração LLM (L)

- [ ] **L-01** Integração com provedor LLM (API, modelo, limites de custo).
- [ ] **L-02** **Exatamente 1 uso de LLM por tentativa**, em qualquer nível (contador por tentativa).
- [ ] **L-03** UX do recurso LLM (dica, explicação, etc.) alinhada ao escopo acordado.
- [ ] **L-04** Tratamento de falhas (rede, timeout, quota) sem corromper a tentativa em andamento.

---

## Onboarding e tutorial (O)

- [ ] **O-01** Detecção de novo usuário (primeiro acesso ou flag persistida).
- [ ] **O-02** Tutorial guiando: auth, nível, roleta, quiz, LLM, ranking (passos acordados).
- [ ] **O-03** Opções “pular tutorial” e “rever tutorial” (ex.: em configurações).

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

## Decisões pendentes (preencher antes de fechar escopo)

Documente aqui para evitar ambiguidade:

1. **Tentativas (G-03):** limite por dia, por semana ou total por usuário?
2. **Ranking (R-01):** janela de tempo (semanal, global, por nível)?
3. **LLM (L-03):** o que exatamente o usuário pode pedir em cada uso?
