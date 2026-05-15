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

- [x] **T-01** App React Native estruturado (navegação, pastas, ambientes dev/prod). _Grupo `(auth)`, `index` de roteamento, abas protegidas._
  - [ ] Revisar proteção de rotas `(tabs)` vs. convidado (redirecionamento centralizado, se necessário).
  - [ ] Perfis de build EAS e variáveis por canal (staging vs produção).

- [x] **T-02** Gerenciamento de estado global/local conforme padrão do projeto. _`AuthProvider` + contexto de sessão._
  - [ ] Introduzir store ou camada de dados (ex.: TanStack Query) quando o volume de API crescer, se o time acordar.

- [ ] **T-03** Persistência (preferências, tutorial visto, cache seguro conforme necessidade).
  - [ ] Escolher API (`expo-secure-store` vs AsyncStorage) por tipo de dado.
  - [ ] Implementar flags (tutorial visto, preferências) e invalidação.

- [x] **T-04** Variáveis de ambiente para API e segredos (não commitar chaves). _Ver `.env.example` (`EXPO_PUBLIC_API_URL`)._
  - [ ] Garantir que segredos de servidor nunca usam o prefixo `EXPO_PUBLIC_`.
  - [ ] CI/CD injeta `.env` ou secrets sem commit.

---

## Gameplay do quiz (G)

- [ ] **G-01** Três níveis de dificuldade: Fácil, Médio, Difícil (UI + regra de negócio).
  - [ ] Telas e estado de nível; regra no motor do quiz e/ou na API.

- [ ] **G-02** **10 questões por tentativa** com fluxo claro até o fim da tentativa.
  - [ ] Modelo de “tentativa” e fluxo de telas até resultado final.

- [ ] **G-03** **Até 3 tentativas por usuário** (critério: por quiz, por dia ou global — definido e implementado).
  - [ ] Fechar decisão do checklist (por dia / por quiz / global) e implementar no cliente e no servidor.

- [ ] **G-04** Coerência com **30 questões totais** (3 × 10) no modelo de dados e na UX.
  - [ ] Esquema de dados e cópia de interface coerentes com o modelo.

- [ ] **G-05** Feedback por questão ou apenas ao final — decisão implementada de ponta a ponta.
  - [ ] Decisão de produto escrita e implementada em UI + API.

- [ ] **G-06** Sistema de **pontuação** com regras explícitas (nível, acerto, tempo, etc.).
  - [ ] Fórmula documentada; cálculo no cliente para preview e confirmação no servidor.

- [ ] **G-07** **Persistência de resultados** no backend (tentativa, pontuação, nível, data/hora, usuário).
  - [ ] Endpoint autenticado (ex.: `authorizedFetch`) gravando tentativa, pontuação, nível, timestamp, `userId`.

---

## Temas e conteúdo (C)

- [ ] **C-01** **Seleção de tema por roleta** (ou equivalente visual) integrada ao fluxo do quiz.
  - [ ] Componente de UI + integração no fluxo antes de iniciar o quiz.

- [ ] **C-02** Cobertura de temas de **Tecnologia**: linguagens, lógica, estruturas de dados, redes, bancos de dados, autenticação, tokens, IA.
  - [ ] Base de questões ou geração alinhada às subáreas listadas no checklist.

- [ ] **C-03** Mapeamento tema → conjunto de questões utilizável na montagem das 10 questões.
  - [ ] Dados ou API que devolvem 10 questões por tema/nível; validação de existência mínima.

---

## Ranking (R)

- [ ] **R-01** Regra do **top 10** definida (ex.: maior pontuação, período de ranking).
  - [ ] Fechar janela temporal e critério de desempate (ver decisões pendentes no checklist principal).

- [ ] **R-02** Tela de ranking com os 10 e destaque do usuário atual quando aplicável.
  - [ ] API `GET` (ou similar) + UI em `rank` (ou rota acordada) com destaque do usuário atual.

- [ ] **R-03** Ranking atualizado após conclusão de tentativa válida.
  - [ ] Backend recalcula ou invalida cache ao concluir `G-07`; app refresca lista ao voltar ao separador.

---

## Integração LLM (L)

- [ ] **L-01** Integração com provedor LLM (API, modelo, limites de custo).
  - [ ] Chaves no servidor (nunca só no cliente); limites de custo e modelo escolhido.

- [ ] **L-02** **Exatamente 1 uso de LLM por tentativa**, em qualquer nível (contador por tentativa).
  - [ ] Contador no estado da tentativa e enforcement no backend.

- [ ] **L-03** UX do recurso LLM (dica, explicação, etc.) alinhada ao escopo acordado.
  - [ ] Fechar escopo do checklist principal (o que o usuário pode pedir por uso).

- [ ] **L-04** Tratamento de falhas (rede, timeout, quota) sem corromper a tentativa em andamento.
  - [ ] Timeouts, retries limitados, mensagens de erro e recuperação de estado da tentativa após falha do LLM.

---

## Onboarding e tutorial (O)

- [ ] **O-01** Detecção de novo usuário (primeiro acesso ou flag persistida).
  - [ ] Flag persistida (ligar a **T-03**) após primeiro login ou registro.

- [ ] **O-02** Tutorial guiando: auth, nível, roleta, quiz, LLM, ranking (passos acordados).
  - [ ] Fluxo de telas ou modal; depende de **G**, **C**, **R**, **L** existirem ou de placeholders honestos.

- [ ] **O-03** Opções “pular tutorial” e “rever tutorial” (ex.: em configurações).
  - [ ] Entrada nas configurações / perfil e reset da flag de “já visto”.

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

## Decisões pendentes (copiar do checklist principal ao fechar)

1. **Tentativas (G-03):** limite por dia, por semana ou total por usuário?
2. **Ranking (R-01):** janela de tempo (semanal, global, por nível)?
3. **LLM (L-03):** o que exatamente o usuário pode pedir em cada uso?

---

## Como usar os dois ficheiros

| Ficheiro                    | Uso principal                                      |
| --------------------------- | -------------------------------------------------- |
| `CHECKLIST.md`              | Estado “feito / por fazer” do requisito.           |
| `CHECKLIST-COMPLEMENTOS.md` | Lista de trabalhos para **ligar** cada requisito à realidade (API, decisões, integração). |
