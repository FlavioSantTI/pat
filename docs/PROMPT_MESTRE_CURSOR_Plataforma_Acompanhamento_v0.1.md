# PROMPT MESTRE PARA O CURSOR
## Plataforma de Acompanhamento Terapêutico e Desenvolvimento de Habilidades
### Implementação PWA — MVP

Você é o agente de desenvolvimento responsável por transformar os documentos anexados neste pacote em uma aplicação funcional.

NÃO trate este pedido como uma solicitação para apenas explicar arquitetura ou gerar exemplos. O objetivo é IMPLEMENTAR o produto no repositório atual, de forma incremental, testável e pronta para evolução.

---

# 1. DOCUMENTOS DE REFERÊNCIA — LEIA ANTES DE CODIFICAR

Os seguintes arquivos fazem parte deste pacote e são a fonte de verdade funcional e técnica:

1. `PRD_Plataforma_Acompanhamento_Terapeutico_v0.3.docx`
   - Fonte principal dos requisitos do produto.

2. `Especificacao_Tecnica_Plataforma_Acompanhamento_v0.1_com_SQL_RLS.docx`
   - Fonte da arquitetura, modelo de dados, SQL, RLS, permissões e critérios técnicos.

3. `Agenda BA-IACC Semanal de atividades e pequenos ganhos.docx`
   - Referência funcional original para a lógica de atividades, D/P/A, pequenos ganhos, indicadores e revisão semanal.

4. `a_clean_white_background_infographic_collage_of_mo.png`
   - Referência visual inicial dos wireframes.

IMPORTANTE:
- Leia os documentos antes de implementar.
- Preserve a terminologia e a lógica dos documentos.
- Não invente funcionalidades clínicas.
- Quando houver dúvida, priorize o PRD e a Especificação Técnica.
- A agenda original é referência funcional; não transforme o produto em uma simples cópia digital da planilha.

---

# 2. OBJETIVO DO PRODUTO

Construir uma plataforma digital para acompanhamento terapêutico e desenvolvimento de habilidades.

Fluxo central:

Objetivo
→ Atividade
→ Execução
→ Registro
→ Reflexão
→ Progresso
→ Próximo passo

O produto NÃO é uma plataforma de produtividade convencional.

O conceito de pequenos ganhos deve ser preservado.

Não transformar o acompanhamento em cobrança por produtividade.

---

# 3. RESTRIÇÕES IMPORTANTES

## 3.1 NÃO usar gamificação

Não implementar:

- XP
- pontos
- níveis
- badges
- ranking
- streaks
- recompensas
- placares
- competição

Não usar linguagem de gamificação na interface.

---

## 3.2 IA está FORA DO MVP

Não implementar neste momento:

- chatbot
- agente terapêutico
- diagnóstico automático
- recomendação automática
- geração automática de atividades
- análise automática de comportamento
- análise automática de D/P/A

A arquitetura pode permitir IA futura, mas não implementar IA agora.

---

## 3.3 ADMINISTRADOR NÃO PODE ACESSAR DADOS TERAPÊUTICOS

Esta é uma exigência arquitetural crítica.

Não basta esconder menus.

O PostgreSQL/Supabase RLS deve impedir tecnicamente que um usuário administrador consulte:

- D/P/A
- sessões
- atividades terapêuticas
- pequenos ganhos
- progresso terapêutico
- revisões
- notas profissionais
- histórico terapêutico

O administrador terá acesso somente à operação da plataforma.

---

# 4. STACK TECNOLÓGICA OBRIGATÓRIA

## Frontend

- Next.js
- App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons

Use arquitetura moderna, componentizada e tipada.

Preferir Server Components quando fizer sentido e Client Components somente quando houver interação/browser state.

---

## Backend / BaaS

### Supabase

Utilizar:

- Supabase Auth
- PostgreSQL
- Row Level Security — RLS
- Supabase Storage quando necessário
- Supabase Realtime somente onde houver necessidade real

Não criar backend paralelo desnecessariamente.

---

## PWA

A aplicação deve ser uma PWA real.

Requisitos:

- Web App Manifest
- service worker
- instalação no celular/desktop
- ícones
- splash/configuração adequada
- cache de assets
- estratégia de atualização
- suporte offline parcial
- sincronização quando a conexão retornar
- experiência mobile-first

Utilizar uma solução PWA mantida e compatível com a versão atual do Next.js, preferencialmente Serwist ou equivalente tecnicamente adequado.

NÃO usar biblioteca abandonada apenas por conveniência.

---

## Banco

PostgreSQL via Supabase.

Usar:

- UUID
- timestamptz
- foreign keys
- check constraints
- índices
- migrations versionadas
- RLS

Não acessar o banco diretamente pelo cliente usando credenciais privilegiadas.

A `service_role` NUNCA deve chegar ao frontend.

---

## Validação

Usar:

- Zod para validação de schemas
- React Hook Form para formulários complexos, quando apropriado

---

## Estado

Evitar gerenciamento global desnecessário.

Preferir:

- Server Components
- Server Actions ou Route Handlers quando apropriado
- React state/local state
- TanStack Query somente quando realmente necessário para estado assíncrono complexo

---

## Testes

Implementar:

- testes unitários para regras críticas
- testes de integração para operações de domínio
- testes de RLS
- testes E2E para fluxos principais

Stack sugerida:

- Vitest
- Playwright

---

# 5. ARQUITETURA DE DIRETÓRIOS

Organizar de maneira clara, por domínio.

Exemplo:

```text
src/
  app/
    (auth)/
    (patient)/
    (professional)/
    (admin)/
    api/

  components/
    ui/
    layout/
    calendar/
    activity/
    progress/
    forms/

  features/
    auth/
    patients/
    professionals/
    programs/
    activities/
    agenda/
    assessments/
    progress/
    reviews/
    notes/
    admin/

  lib/
    supabase/
    auth/
    permissions/
    validations/
    utils/

  types/

supabase/
  migrations/
  seed/
  tests/
```

Pode adaptar a estrutura se houver uma arquitetura melhor, mas preserve separação clara por domínio.

---

# 6. PERFIS

Existem três perfis:

## Paciente

Acessa somente seus próprios dados.

Pode:

- visualizar programa
- visualizar agenda
- visualizar atividades
- executar atividades
- utilizar temporizador
- registrar D/P/A
- registrar observações
- registrar pequenos ganhos
- visualizar progresso
- realizar revisão semanal
- consultar histórico
- criar/editar/arquivar/reordenar suas áreas pessoais

---

## Profissional

Pode:

- visualizar pacientes vinculados
- criar programas
- definir objetivos
- criar áreas do programa
- criar atividades
- atribuir atividades
- agendar atividades
- acompanhar execução
- visualizar D/P/A
- acompanhar indicadores
- acompanhar pequenos ganhos
- acompanhar revisões
- registrar notas profissionais

---

## Administrador

Pode:

- administrar usuários
- administrar profissionais
- administrar organizações
- administrar planos
- administrar assinaturas
- configurações
- suporte
- logs técnicos
- métricas operacionais

NÃO pode acessar dados terapêuticos.

---

# 7. MODELO DE DADOS

Implementar as entidades previstas:

```text
organizations
users
patients
professionals
professional_patients

programs
program_areas
patient_areas
patient_programs

activities
activity_progressions
activity_assignments

activity_sessions
activity_assessments

progress_metrics
gains
weekly_reviews

professional_notes
audit_logs
```

Use o SQL/RLS do documento de Especificação Técnica como base.

Não simplifique a segurança para facilitar o desenvolvimento.

---

# 8. AGENDA

A agenda é uma parte central do produto.

Ela deve ser interativa, semelhante à experiência de Google Calendar/Microsoft Outlook, porém adaptada a atividades de acompanhamento.

Visualizações:

- Dia
- Semana
- Mês

No mobile:

- priorizar Dia
- permitir navegação rápida para Semana
- Mês como visão resumida

A atividade é clicável.

Fluxo:

```text
Agenda
  ↓
Atividade
  ↓
Detalhes
  ↓
Iniciar
  ↓
Executar
  ↓
Registrar
```

---

# 9. PERÍODOS

A atividade pode utilizar:

```text
morning
afternoon
night
specific_time
```

Ou na interface:

- Manhã
- Tarde
- Noite
- Horário específico

Não obrigar o paciente a trabalhar com horários rígidos.

Se for `specific_time`, `scheduled_at` é obrigatório.

---

# 10. ATIVIDADE

A atividade deve suportar:

- título
- descrição
- objetivo
- instruções
- área
- duração sugerida
- dificuldade
- período
- data
- status

Estados:

```text
scheduled
started
completed
skipped
cancelled
rescheduled
```

Não permitir transições inválidas.

---

# 11. TEMPORIZADOR DE FOCO

O temporizador é opcional.

Na atividade:

```text
Temporizador de foco
[ OFF / ON ]
```

Se ativado:

```text
10 min
15 min
20 min
25 min
30 min
Personalizado
```

O temporizador NÃO altera a duração sugerida da atividade.

Exemplo:

Atividade:
"Escolher uma prioridade e começar por 10 minutos."

Duração sugerida:
10 min

Paciente pode escolher:
20 min

O sistema registra o uso do temporizador na sessão, mas a atividade continua sendo a mesma.

Não transformar temporizador em pontuação ou indicador de desempenho.

---

# 12. EXECUÇÃO

Ao iniciar:

```text
Atividade
Título
Objetivo
Instruções
Duração sugerida

[Temporizador de foco]
[Iniciar atividade]
```

Durante:

```text
Temporizador
Pausar
Finalizar
Cancelar
```

Ao finalizar:

```text
Como foi?

Domínio / Realização (D)
0 1 2 3 4 5

Prazer (P)
0 1 2 3 4 5

Ansiedade (A)
0 1 2 3 4 5

Observação
[.........................]

Pequeno ganho
[.........................]

[Salvar]
```

---

# 13. D/P/A

Utilizar:

### D — Domínio ou realização

Quanto conseguiu agir ou concluir, mesmo com desconforto.

### P — Prazer

Quanto de satisfação, alívio saudável ou interesse experimentou.

### A — Ansiedade

Quanto de ansiedade esteve presente durante a atividade.

Escala:

```text
0 = nada/ausente
5 = muito alto
```

Não criar score geral.

Não calcular "nota do paciente".

Não criar ranking.

Não transformar D/P/A em desempenho competitivo.

---

# 14. PEQUENOS GANHOS

O paciente poderá registrar uma mudança observável.

Exemplo:

```text
Pequeno ganho

"Consegui começar uma tarefa sem
revisar tudo antes."
```

Pequenos ganhos não são pontos.

Eles são registros qualitativos de mudanças observáveis.

---

# 15. PROGRESSO

O progresso deve usar:

```text
Área
Direção flexível
Indicador observável
Linha de base
Esta semana / estado atual
Próximo passo pequeno
```

Exemplo:

```text
TRABALHO

Direção:
Agir por prioridade.

Indicador:
Tarefas iniciadas em blocos de 10 min.

Linha de base:
2

Atual:
4

Próximo passo:
Manter 4 e experimentar uma tarefa diferente.
```

Não criar um score global de evolução.

---

# 16. REVISÃO SEMANAL

Implementar as quatro perguntas:

1. O menor ganho que quero reconhecer foi:
2. Uma situação em que fui flexível, mesmo ansioso(a) ou triste:
3. O que aumentou meu domínio ou prazer?
4. O que manteve a ansiedade alta e merece análise funcional na sessão?

Permitir salvar e consultar histórico.

---

# 17. ÁREAS

As áreas de referência são:

- Trabalho
- Alimentação
- Consigo
- Saúde
- Filho
- Irmãs
- Social
- Lazer
- Flexibilidade

Mas o paciente também pode criar suas próprias áreas.

CRUD:

- criar
- editar
- arquivar
- excluir quando permitido
- reordenar
- definir ícone

Não confundir:

```text
program_areas
```

com:

```text
patient_areas
```

---

# 18. TELAS DO PACIENTE

Implementar:

1. Login
2. Hoje
3. Agenda
4. Detalhe da atividade
5. Execução
6. Temporizador
7. Registro D/P/A
8. Pequeno ganho
9. Conclusão
10. Progresso
11. Revisão semanal
12. Histórico
13. Minhas áreas
14. Perfil

Mobile-first.

Na tela inicial do paciente, priorizar "Hoje".

Não criar dashboard excessivamente carregado.

---

# 19. NAVEGAÇÃO MOBILE DO PACIENTE

Preferência:

```text
Hoje | Agenda | Progresso | Perfil
```

Outros recursos acessíveis a partir dessas áreas.

---

# 20. TELAS DO PROFISSIONAL

Implementar:

- Dashboard
- Pacientes
- Perfil do paciente
- Agenda do paciente
- Programa
- Objetivos
- Áreas
- Atividades
- Editor de atividade
- Atribuição/agendamento
- Indicadores
- Progresso
- Revisões
- Notas profissionais

O profissional deve conseguir realizar o ciclo:

```text
Paciente
→ Programa
→ Atividade
→ Atribuir
→ Agendar
→ Acompanhar
→ Revisar
```

---

# 21. TELAS DO ADMINISTRADOR

Implementar:

- Dashboard operacional
- Usuários
- Profissionais
- Organizações
- Planos
- Assinaturas
- Configurações
- Suporte
- Logs técnicos

NÃO criar telas administrativas que exibam conteúdo terapêutico.

---

# 22. SEGURANÇA

Obrigatório implementar RLS.

Testar:

### Teste 1

Admin tenta acessar D/P/A.

Resultado:
NEGADO.

### Teste 2

Admin tenta acessar notas profissionais.

Resultado:
NEGADO.

### Teste 3

Profissional A tenta acessar paciente do profissional B.

Resultado:
NEGADO.

### Teste 4

Paciente A tenta acessar paciente B.

Resultado:
NEGADO.

### Teste 5

Profissional tenta atribuir atividade a paciente sem vínculo.

Resultado:
NEGADO.

### Teste 6

Paciente tenta criar/alterar nota profissional.

Resultado:
NEGADO.

### Teste 7

Paciente acessa seus próprios dados.

Resultado:
PERMITIDO.

### Teste 8

Profissional acessa D/P/A de paciente vinculado.

Resultado:
PERMITIDO.

Esses testes devem fazer parte do projeto e da documentação.

---

# 23. SERVICE ROLE

NUNCA colocar:

```text
SUPABASE_SERVICE_ROLE_KEY
```

no frontend.

Nunca expor secrets no código cliente.

Utilizar apenas ambiente server-side quando absolutamente necessário.

---

# 24. DESIGN SYSTEM

Visual:

- moderno
- limpo
- acolhedor
- profissional
- minimalista
- mobile-first

Evitar aparência de aplicativo infantil.

Evitar aparência excessivamente hospitalar.

Evitar elementos que remetam a gamificação.

Utilizar:

- cards
- espaçamento generoso
- tipografia legível
- estados claros
- acessibilidade
- feedback visual discreto

O design deve transmitir acompanhamento e clareza, não cobrança.

---

# 25. ACESSIBILIDADE

Implementar:

- navegação por teclado
- labels
- contraste adequado
- foco visível
- aria-label quando necessário
- áreas de toque adequadas
- mensagens de erro claras
- suporte a leitores de tela quando aplicável

---

# 26. PWA E OFFLINE

No MVP:

Permitir offline parcial para:

- shell da aplicação
- navegação básica
- dados recentemente consultados, quando seguro
- rascunhos locais de registros

Ao retornar a conexão:

```text
local
  ↓
fila de sincronização
  ↓
Supabase
```

Não fazer cache indiscriminado de dados terapêuticos sensíveis.

Projetar cuidadosamente a estratégia de armazenamento local.

---

# 27. NOTIFICAÇÕES

A arquitetura deve permitir notificações futuras.

No MVP, implementar apenas se necessário para o fluxo básico.

Não criar excesso de notificações.

---

# 28. PRINCÍPIO DE PRIVACIDADE

Dados terapêuticos devem ser tratados como dados sensíveis.

Não registrar conteúdo terapêutico em:

- console.log
- analytics público
- logs de erro externos
- URLs
- parâmetros públicos desnecessários

Sanitizar erros.

---

# 29. AUDITORIA

Registrar operações relevantes:

- criação
- alteração
- arquivamento
- exclusão lógica
- vínculo profissional-paciente
- alteração de programa
- atribuição
- reagendamento
- alterações administrativas

O audit log não deve ser usado para dar ao administrador acesso ao conteúdo terapêutico.

---

# 30. CRITÉRIOS DE ACEITE

O MVP será considerado funcional quando:

1. Paciente consegue entrar.
2. Paciente vê "Hoje".
3. Paciente vê sua agenda.
4. Paciente abre uma atividade.
5. Paciente inicia atividade.
6. Paciente pode usar ou não o temporizador.
7. Paciente escolhe duração do temporizador.
8. Paciente finaliza atividade.
9. Paciente registra D/P/A.
10. Paciente registra observação.
11. Paciente registra pequeno ganho.
12. Paciente visualiza progresso.
13. Paciente realiza revisão semanal.
14. Profissional cria programa.
15. Profissional cria atividade.
16. Profissional atribui atividade.
17. Profissional acompanha paciente vinculado.
18. Profissional registra nota.
19. Administrador administra a plataforma.
20. Administrador NÃO acessa dados terapêuticos.
21. RLS passa nos testes.
22. PWA instala e funciona em celular.
23. Não existe gamificação.
24. Não existe IA no MVP.

---

# 31. ORDEM DE IMPLEMENTAÇÃO

NÃO tente construir tudo de uma vez.

Execute nesta ordem:

## Fase 1 — Fundação

- configurar Next.js
- TypeScript
- Tailwind
- shadcn/ui
- Supabase
- ambiente
- lint
- testes
- estrutura de pastas

## Fase 2 — Banco

- migrations
- tabelas
- índices
- constraints
- funções
- RLS
- seed

## Fase 3 — Autenticação

- login
- sessão
- proteção de rotas
- roles

## Fase 4 — Paciente

- Hoje
- Agenda
- Atividade
- Execução
- Temporizador
- D/P/A
- Pequeno ganho
- Progresso
- Revisão

## Fase 5 — Profissional

- Dashboard
- Pacientes
- Programa
- Atividades
- Agenda
- Progresso
- Notas

## Fase 6 — Admin

- Dashboard
- Usuários
- Profissionais
- Organizações
- Assinaturas
- Logs

## Fase 7 — PWA

- manifest
- service worker
- instalação
- offline parcial
- sincronização

## Fase 8 — Segurança

Executar todos os testes RLS.

## Fase 9 — Refinamento UX

- responsividade
- acessibilidade
- loading
- empty states
- erros
- feedback

---

# 32. SEED PARA DESENVOLVIMENTO

Criar dados fictícios para desenvolvimento:

```text
1 organização
2 profissionais
3 pacientes

1 programa por paciente

Áreas:
Trabalho
Alimentação
Consigo
Saúde
Social
Lazer

Atividades variadas
```

Todos os dados devem ser claramente fictícios.

Nunca utilizar dados reais de pacientes no desenvolvimento.

---

# 33. COMO VOCÊ DEVE TRABALHAR

Antes de codificar:

1. Leia os documentos anexados.
2. Inspecione o repositório atual.
3. Identifique o que já existe.
4. Não destrua funcionalidades existentes sem necessidade.
5. Crie um plano de implementação.
6. Implemente por fases.
7. Execute testes após cada fase importante.
8. Corrija erros antes de avançar.
9. Mantenha migrations versionadas.
10. Documente decisões técnicas importantes.

Não fique apenas apresentando código no chat.

Faça as alterações no projeto.

---

# 34. REGRAS PARA DECISÕES TÉCNICAS

Quando houver mais de uma solução:

1. Segurança
2. Simplicidade
3. Manutenibilidade
4. Performance
5. UX
6. Custo

nessa ordem.

Não adicionar bibliotecas sem necessidade.

Não criar microserviços para o MVP.

Não criar backend separado se Supabase/Next.js resolverem adequadamente.

Não introduzir IA.

Não introduzir n8n no núcleo do produto.

---

# 35. O QUE NÃO FAZER

Não:

- transformar em aplicativo de produtividade;
- adicionar gamificação;
- criar score geral do paciente;
- criar ranking;
- adicionar IA;
- criar diagnóstico;
- criar recomendações clínicas automáticas;
- permitir acesso administrativo a dados terapêuticos;
- colocar service role no frontend;
- armazenar dados sensíveis indiscriminadamente no localStorage;
- criar uma agenda rígida obrigatória;
- substituir o profissional por automação.

---

# 36. RESULTADO ESPERADO

Ao final do MVP deve existir uma PWA funcional onde:

```text
PROFISSIONAL
    ↓
cria programa
    ↓
cria atividade
    ↓
atribui ao paciente
    ↓
agenda

PACIENTE
    ↓
vê atividade
    ↓
inicia
    ↓
opcionalmente usa temporizador
    ↓
executa
    ↓
registra D/P/A
    ↓
registra pequeno ganho
    ↓
conclui

PROFISSIONAL
    ↓
acompanha
    ↓
analisa indicadores
    ↓
revisa
    ↓
define próximo passo
```

O produto deve permanecer simples, seguro e orientado ao acompanhamento.

---

# 37. PRIMEIRA TAREFA DO CURSOR

Comece agora.

Primeiro:

1. Leia todos os documentos anexados.
2. Inspecione o projeto.
3. Faça um diagnóstico do estado atual do código.
4. Apresente um plano curto de implementação.
5. Depois comece a implementar a Fase 1.
6. Não avance para funcionalidades terapêuticas antes de estabelecer a fundação técnica.
7. Depois da fundação, implemente banco + RLS.
8. Rode os testes de segurança.
9. Só então avance para as telas.

Ao terminar cada fase, informe:

- o que foi implementado;
- arquivos principais alterados;
- migrations criadas;
- testes executados;
- problemas encontrados;
- próxima fase.

PRIORIDADE ABSOLUTA:
SEGURANÇA DOS DADOS TERAPÊUTICOS + RLS + EXPERIÊNCIA MOBILE/PWA.

