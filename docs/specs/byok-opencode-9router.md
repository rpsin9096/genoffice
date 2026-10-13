# Spec plan: usar OpenCode e 9Router no GenOffice (fork)

Status: **rascunho para decisão** — a maior parte do caminho já existe no código; o fork só precisa de código se quisermos UX de primeiro nível ou tirar o fallback silencioso para Genspark.

Público: dono do fork que já usa OpenCode e/ou 9Router como backend de IA, e quer que a **parte generativa** do GenOffice (painel de chat/agente dentro do Docs/Sheets/Slides/…) fale com esses backends em vez da nuvem Genspark.

## 1. Duas coisas diferentes (não misturar)

| Caminho | O que é | Já existe? |
|---|---|---|
| **A. GenOffice chama a sua IA** | O painel AI do app gera/edita documentos. Quem responde é o LLM. | Sim: Settings → AI. |
| **B. A sua IA chama o GenOffice** | OpenCode (agente de código) cria/edita `.docx`/`.xlsx`/`.pptx` via skill ou MCP. | Sim: Settings → Integrations. |

Este spec é o **caminho A**. O B já está documentado no README (skill + MCP). OpenCode como *agente* não substitui o modelo do painel interno.

## 2. Como a IA entra hoje no código

Camada única: `packages/ai-provider`.

- Catálogo: `AI_PROVIDERS` em `packages/ai-provider/src/providers.ts`.
- Roteamento de protocolo/URL: `packages/ai-provider/src/registry.ts`.
- Chat stream: `streamForProvider` → IPC `ai:stream` no processo **main** do Electron (não no renderer). Por isso `http://localhost:…` não esbarra em CSP do painel.
- UI: Settings → AI (`apps/shell/src/renderer/src/SettingsModal.tsx`) + chip de modelo (`packages/ui/src/AiModelPicker.tsx`).

Default de instalação: `provider: 'genspark'` (login Genspark, sem chave). Qualquer outro provider só fica ativo se `activeProvider()` considerar a config **usável**.

Regra crítica de `activeProvider()` (`providers.ts`):

- `custom`: precisa de **base URL + model**. Chave **opcional** (servidor local anônimo, tipo Ollama / 9Router).
- OpenCode Zen/Go e demais BYOK: precisam de **apiKey + model**.
- Se a seleção não for usável, **cai de volta para `genspark`** sem erro de config. Isso é o principal pé-de-coelho do fork: a pessoa acha que apontou para 9Router e o app ainda fala com a nuvem Genspark.

## 3. O que já cobre OpenCode

IDs de primeiro nível:

- `opencode-zen` → `https://opencode.ai/zen` (pay-as-you-go).
- `opencode-go` → `https://opencode.ai/zen/go` (assinatura de modelos open-weight). Mesma chave que o Zen.

Detalhes que o adapter já trata (não reimplementar):

- Header `x-opencode-session` em `https://opencode.ai/…` (`opencodeSessionHeaders`).
- Protocolo **por modelo**: Claude/Qwen no Zen vão para Anthropic Messages; Gemini para o path nativo; o resto é OpenAI-compatible.
- Lista de modelos pinada no catálogo (não é o `/models` ao vivo).
- `baseUrl` armazenado pode substituir o root (espelho / proxy).

**Como usar hoje (zero código):**

1. Abrir GenOffice → Settings → AI.
2. Provider: **OpenCode Zen** ou **OpenCode Go**.
3. Colar a API key de [opencode.ai/auth](https://opencode.ai/auth).
4. Escolher o model id da lista.
5. Conferir no chip do compositor que o provider ativo **não** é Genspark.

OpenCode **local** (`opencode serve` / gateway na máquina) **não** é o mesmo que Zen/Go. Esse caso entra na seção 4 (custom / 9Router).

## 4. O que já cobre 9Router

9Router é um proxy OpenAI-compatible. Contrato relevante:

- Endpoint: `http://localhost:20128/v1` (default da literatura do produto).
- Chat: `POST /v1/chat/completions` (SSE).
- Catálogo: `GET /v1/models` → `{ data: [{ id }] }`.
- Auth: frequentemente nenhuma, ou Bearer opcional do dashboard local.
- Ele mesmo traduz OpenAI ↔ Claude ↔ Gemini **do lado do proxy**. O cliente (GenOffice) só precisa falar **um** protocolo.

Isso casa com o provider `custom`:

- `needsBaseUrl: true`
- `protocol: 'openai-compatible'`
- `normalizeBaseUrl` aceita `http` e `https` (localhost HTTP é válido).
- `listCustomModels(baseUrl, apiKey?)` já faz `GET {baseUrl}/models` (timeout 5s, falha silenciosa → caixa de texto livre).

**Como usar hoje (zero código):**

1. Subir o 9Router (`http://localhost:20128` responde).
2. GenOffice → Settings → AI → provider **Custom**.
3. Add endpoint. Nome: `9Router`. Base URL: `http://localhost:20128/v1`.
4. API key: vazio, salvo se o dashboard do 9Router exigir uma.
5. Model: o id **exato** que o 9Router anuncia (não o id da Anthropic/OpenAI por trás). Se o probe `/models` funcionar, o dropdown preenche sozinho.
6. Confirmar no chip do compositor o host `localhost:20128`.

Mídia (gerar imagem / analisar vídeo) e busca web são **providers separados** (`AiMediaSettings`, `AiSearchSettings`). 9Router no chat **não** liga automaticamente Seedream/Serper. Sem Genspark, search cai no Parallel free / DuckDuckGo; image gen precisa de outro BYOK em **AI Media & Search**.

## 5. Gaps reais (por que um fork ainda pode querer código)

Ordenados por valor / custo.

| # | Gap | Impacto | Esforço |
|---|---|---|---|
| G1 | Fallback silencioso para Genspark quando Custom/OpenCode está pela metade (URL sem model, Zen sem key). | Usuário acha que está no 9Router e a nuvem Genspark ainda recebe o prompt. | Baixo |
| G2 | Custom não tem preset “9Router”; URL e model são digitados. | Fricção; erro de `/v1` duplicado ou porta errada. | Baixo |
| G3 | Probe `/models` falha em silêncio (servidor off). | Caixa vazia, sem “9Router não está rodando na :20128”. | Médio |
| G4 | OpenCode local ≠ Zen. Quem usa OpenCode só como TUI/local gateway precisa de custom, não do card Zen. | Confusão de produto. | Docs / baixo |
| G5 | Default da instalação continua `genspark`. | Fork “sem Genspark” ainda tenta o proxy até o usuário mudar Settings. | Baixo, mas político |
| G6 | Media/search ainda orbitam Genspark. | Painel de chat BYOK, mas “gerar imagem” pede login. | Fora do escopo de chat |
| G7 | Provider de primeiro nível `9router` (logo, default URL, `/models` ao vivo). | Simetria com OpenCode Zen. Só vale se 9Router for o default do fork. | Médio |

Fora de escopo deste spec: reimplementar o roteamento de 40+ labs *dentro* do GenOffice. 9Router já faz isso.

## 6. Decisão de arquitetura (ADR)

**ADR-1 — Não duplicar o 9Router como segundo gateway interno.**
GenOffice continua cliente OpenAI-compatible. 9Router (ou OpenCode Zen) é o gateway. Um adapter a mais só se justifica como *preset de URL + UX*, não como tradutor de protocolo.

**ADR-2 — Preferir preset Custom a um `AiProviderId` novo, na Fase 1.**
Um id novo (`9router`) toca `types.ts`, registry, logos, i18n, picker, testes de catálogo. Um endpoint Custom pré-preenchido reutiliza `upsertCustomEndpoint` e `listCustomModels`. Só promover a id de primeiro nível se o fork quiser 9Router como default visível na lista ao lado de Claude.

**ADR-3 — Seleção explícita não pode cair em Genspark.**
Se `settings.provider !== 'genspark'` e a config for inválida, falhar no compositor (“falta model / 9Router offline / falta API key”), não chamar `www.genspark.ai`. Isso é o único bug de *comportamento* que o zero-código não resolve.

**ADR-4 — Caminho B (skill/MCP) fica intocado.**
Integrar OpenCode como agente de código não muda `ai-provider`.

## 7. Fases

### Fase 0 — Só configuração (recomendado começar aqui)

Nenhum commit. Validar:

1. OpenCode Zen/Go com chave real: um turno no Docs que edite o documento.
2. Custom → `http://localhost:20128/v1` com 9Router no ar: o mesmo turno.
3. 9Router desligado: o turno tem de falhar de rede, **não** devolver resposta Genspark.
4. Anotar o model id que o 9Router serviu (vai para o preset da Fase 1).

Critério de saída: se 1–3 passam, o fork **não precisa de código** para “usar minhas IAs”. As fases seguintes são conforto e segurança contra o fallback.

### Fase 1 — Fork UX mínimo (se Fase 0 doer)

Escopo de arquivos (estreito):

- `packages/ai-provider/src/providers.ts` — `activeProvider()`: não degradar para genspark quando o usuário escolheu outro id.
- `packages/ai-provider/tests/providers.test.ts` — casos: custom com URL sem model; zen sem key.
- `apps/shell/src/renderer/src/SettingsModal.tsx` — botão/preset “9Router” que chama `upsertCustomEndpoint` com `baseUrl: 'http://localhost:20128/v1'`.
- Strings em `apps/shell/src/renderer/src/strings.ts` (pt + en no mínimo).
- Teste de settings: preset grava endpoint e seleciona `provider: 'custom'`.

Fora: logos novos, id novo, media/search, default global.

CHECK de comportamento (quando formos implementar):

- `activeProvider({ provider: 'custom', providers: { custom: { baseUrl: 'http://localhost:20128/v1', model: '', apiKey: '' } } })` **não** retorna `'genspark'`.
- Preset 9Router deixa `customEndpoints[].baseUrl` contendo `localhost:20128`.

### Fase 2 — Saúde do endpoint (opcional)

- Distinguir no Settings: “sem `/models`” vs “connection refused :20128”.
- Hoje `listCustomModels` engole tudo. Expor um `testCustomEndpoint` que o main já quase tem via `ai:custom-models`.
- Mensagem: “Ligue o 9Router (porta 20128) e tente de novo.”

### Fase 3 — Identidade do fork (só se quiser sumir com Genspark)

- Default `provider` ≠ `genspark` (ex.: `custom` vazio ou `opencode-zen`).
- Esconder o card Genspark / login gsk.
- Revisar `cloudToolsEnabled` / tools que assumem proxy Genspark.
- Media/search: escolher defaults BYOK ou deixar Parallel free.

Isso é um fork de produto, não um adapter.

## 8. Mapa de configuração (referência rápida)

### OpenCode Zen (hosted)

```
provider: opencode-zen
providers.opencode-zen.apiKey: <OPENCODE_API_KEY>
providers.opencode-zen.model: claude-sonnet-5   # ou outro da lista
# baseUrl vazio → https://opencode.ai/zen
```

### OpenCode Go (hosted)

```
provider: opencode-go
providers.opencode-go.apiKey: <mesma chave>
providers.opencode-go.model: kimi-k2.7-code
```

### 9Router (local OpenAI-compatible)

```
provider: custom
customEndpoint: <id>
customEndpoints:
  - id: <id>
    name: 9Router
    baseUrl: http://localhost:20128/v1
    apiKey: ""          # ou a chave do dashboard
    model: <id do GET /v1/models>
```

Se o 9Router estiver em outro host/porta (VPS, AMI), só muda o `baseUrl` (`https://seu-host/v1`). O resto é igual.

### OpenCode local como gateway

Se o que você chama de “usar via OpenCode” for um servidor local OpenAI-compatible (não Zen), use o **mesmo slot custom** que o 9Router, com o `baseUrl` que o OpenCode expõe. Não use o card Zen — ele manda `x-opencode-session` só para `https://opencode.ai/`.

## 9. Riscos

- **Model id errado.** 9Router e OpenCode Zen não compartilham slugs. `claude-sonnet-5` no Zen ≠ o que o 9Router anuncia para o mesmo laboratório.
- **Protocolo.** Custom **sempre** manda chat-completions. Se alguém apontar o card Custom para `https://opencode.ai/zen` e escolher um Claude, o Zen pode 500 (o adapter Zen é que troca de protocolo). 9Router traduz; o Zen hosted, não, quando o cliente erra a rota.
- **`/v1` duplicado.** `normalizeBaseUrl` + `endpointUrl` já lidam com trailing slash; ainda assim o placeholder da UI pede `https://…/v1`. Preset deve gravar exatamente `http://localhost:20128/v1`.
- **Electron e loopback.** Chamadas passam pelo main; HTTP local é permitido. Se no futuro o fetch migrar para o renderer, reavaliar.
- **Ferramentas de nuvem.** Web search / image gen / video analysis não andam no mesmo fio do chat. BYOK de chat sozinho não “desliga a nuvem” nesses botões.

## 10. Recomendação

1. **Fazer a Fase 0 agora** nos dois backends. Se o documento edita, o objetivo original está cumprido.
2. **Implementar Fase 1 no fork** mesmo assim: o fallback `activeProvider → genspark` é a única armadilha que faz o app “parecer” ligado na sua IA e não estar.
3. **Não** criar `AiProviderId = 9router` até o preset Custom ficar curto demais.
4. Tratar OpenCode Zen e 9Router como **dois clientes**, não como um só: Zen = gateway hosted com chave; 9Router = proxy local OpenAI-compatible.

## 11. Próximo passo de implementação (quando você mandar)

Gate de produto da Fase 1, CHECK honesto:

```
activeProvider não retorna genspark para provider custom incompleto
CHECK: vitest no teste novo de providers
EXPECT: 1 passed
SCOPE: packages/ai-provider/src/providers.ts, packages/ai-provider/tests/providers.test.ts
```

Não começa até a Fase 0 estar validada ou você pedir para pular.
