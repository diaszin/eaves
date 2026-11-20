# Research: Cancelar Agendamento

## Estado atual (verificado no código)

- `Appointment` (`server/src/appointments/entities/appointment.entity.ts`): `id`, `initialDate`, `endDate`, `notes`, `created`, `createdBy`, `patient`, `professional`. **Sem status.**
- `AppointmentsService.update` é um stub (retorna uma string); o painel "cancela" com `PATCH /appointments/:id {status:'cancelled'}`, que não persiste nada.
- `create` verifica conflito do profissional com `LessThan(endDate)`/`MoreThan(initialDate)` sem considerar status.
- `findAll` (listagem de 5) e `findAllUnlimited` usam `select` explícito sem `status`; `findOneByUser` devolve a entidade inteira.
- `AppointmentsPolicy`: `view` (todos os papéis), `create` (lobby, coordinator, patient), `viewProfessionalStats` (coordinator).
- `Role` é um enum PostgreSQL (`type: 'enum'`). Migrações vivem em `server/src/migration/` (TypeORM, escritas à mão; `migrationsRun: true`). A última é `1794757315550-...`.
- Painel: `AppointmentsPage` mostra o botão "Cancelar Agendamento" (`canEdit` = coordenador ou lobby) para status `scheduled`/`confirmed`; `DashboardPage` já filtra "próximos" por status.
- App móvel: `GetRecentlyAppointments` (home) lista `GET /appointments` sem status e sem ações; o tipo `Appointment` do app não tem `status`. O app usa `@tanstack/react-query` (`useMutation`) e roda também na web.

## Decisões

### D1. Representação do status

- **Decision**: enum PostgreSQL `appointment_status_enum` (`'scheduled'`, `'cancelled'`), coluna `status` NOT NULL com default `'scheduled'`; no TypeScript, `enum AppointmentStatus { SCHEDULED = 'scheduled', CANCELLED = 'cancelled' }` exportado da entidade.
- **Rationale**: mesmo padrão de `Role`; o default garante FR-002 (existentes = agendado) e FR-003 (novos = agendado) sem reescrever dados; valores iguais aos que o painel já usa (`scheduled`, `cancelled`).
- **Alternatives considered**: `boolean cancelled` ou `cancelledAt` (não serve de status extensível e o usuário pediu status); `text` livre (sem integridade); mais valores (`confirmed`, `completed`, `no_show`) — fora do escopo (YAGNI).

### D2. Migração

- **Decision**: migração manual `1794900000000-AdicionaStatusAoAgendamento.ts`: `CREATE TYPE ... AS ENUM`, `ALTER TABLE "appointment" ADD "status" ... NOT NULL DEFAULT 'scheduled'`; `down` remove a coluna e o tipo.
- **Rationale**: Constituição IV (sem `synchronize`; migração versionada); `ADD COLUMN ... DEFAULT` preenche as linhas existentes de forma atômica.
- **Alternatives considered**: `migration:generate` (traz diff de outras mudanças pendentes, como visto na migração anterior).

### D3. Endpoint de cancelamento

- **Decision**: `PATCH /appointments/:id/cancel`, sem corpo, resposta `{ id, status }`. Painel e app passam a chamá-lo. O `PATCH :id` genérico (stub) não é alterado.
- **Rationale**: ação de domínio explícita e idempotente em intenção; não depende de um DTO de atualização geral (que hoje estende o de criação e não tem `status`); evita expor `status` como campo livre editável (evita reativar ou setar valores arbitrários).
- **Alternatives considered**: implementar `PATCH :id` com `{status}` (abre reativação e outros valores; mais validação); `DELETE` (remove o histórico, contra a spec).

### D4. Autorização

- **Decision**: duas camadas. (1) `@Can(AppointmentsPolicy, 'cancel')` permite `coordinator`, `lobby` e `patient`; professor e trainee levam 403 no guard. (2) No serviço: se o usuário é `patient` e o `patient.id` do agendamento é diferente do dele, `ForbiddenException`.
- **Rationale**: a policy do projeto recebe só o usuário (sem o recurso), então a posse do agendamento precisa ser checada no serviço, onde o agendamento já é carregado. Atende FR-006 e SC-004.
- **Alternatives considered**: devolver 404 para agendamento alheio (esconde a existência, mas diverge do FR-006 que fala em "recusar"); checar só na tela (proibido pela constituição).

### D5. Regras de negócio e concorrência

- **Decision**: no `AppointmentsService.cancel(user, id)`: carregar o agendamento com `patient`; 404 se não existir; checar posse (D4); 400 "O agendamento já está cancelado" se `status = cancelled`; 400 "Não é possível cancelar um agendamento já encerrado" se `endDate <= agora`; então um `UPDATE appointment SET status='cancelled' WHERE id=:id AND status='scheduled'` e, se `affected = 0`, responder como "já cancelado" (corrida entre dois usuários, sem erro 500). Devolve `{ id, status: 'cancelled' }`.
- **Rationale**: o `UPDATE` condicional torna a transição atômica (edge case de dois cancelamentos simultâneos); instantes de `endDate` e "agora" são comparáveis sem fuso.
- **Alternatives considered**: transação com lock pessimista (mais pesado para o ganho); `save` da entidade (corrida de leitura-escrita).

### D6. Conflito de horário

- **Decision**: em `create`, a busca de conflito passa a filtrar `status: AppointmentStatus.SCHEDULED`.
- **Rationale**: FR-012/US3: cancelado libera o horário; ativo continua bloqueando.

### D7. Status nas respostas

- **Decision**: adicionar `status: true` ao `select` de `queryAppointments` (usado por `findAll` e `findAllUnlimited`); `findOneByUser` e `create` já devolvem a entidade completa.
- **Rationale**: FR-008; campo extra é compatível com clientes antigos.

### D8. Painel

- **Decision**: `cancel()` do `appointmentsService` chama o endpoint novo. No detalhe, o selo usa `STATUS_LABELS`/`STATUS_COLORS` já existentes; a ação "Cancelar Agendamento" só aparece se `status = scheduled` e `endDate` ainda no futuro; ao clicar, aparece confirmação **inline** ("Confirmar cancelamento" / "Voltar") em vez de `window.confirm`; a mutation exibe a mensagem de erro da API; ao concluir, invalida `['appointments']`. O histórico mostra o selo de status por item; o painel inicial exclui cancelados dos indicadores de hoje e dos próximos.
- **Rationale**: FR-005/009/010/011/013/014; confirmação inline funciona igual em qualquer navegador e é testável; a invalidação por prefixo atualiza lista, histórico, detalhe e painel inicial (SC-003).
- **Alternatives considered**: `window.confirm` (visual inconsistente); modal novo (componente a mais sem necessidade).

### D9. Aplicativo móvel

- **Decision**: `Appointment` do app ganha `status`; `AppointmentService.cancel(id)` chama o endpoint; `GetRecentlyAppointments` mostra o selo "Agendado"/"Cancelado" e, para ativos ainda não encerrados, um botão "Cancelar" com **confirmação inline** (estado local) e `useMutation` que invalida `["appointments"]`, com mensagem de erro. Sem `Alert.alert` (não funciona na web do Expo) e sem novas dependências.
- **Rationale**: FR-015/016; mantém o app funcionando nas plataformas em que roda. Antes de implementar, consultar a documentação do Expo v57 conforme `app/AGENTS.md` (nenhuma API nova do Expo é usada, apenas componentes do React Native).
- **Alternatives considered**: `Alert.alert` nativo (sem efeito na web); nova tela de detalhe (escopo maior que o necessário).

### D10. Indicadores do painel inicial

- **Decision**: `DashboardPage` exclui `status === 'cancelled'` de "hoje" e mantém o filtro de "próximos" (já considera apenas `scheduled`/`confirmed`).
- **Rationale**: FR-011/SC-007.

## Questões abertas

Nenhuma.
