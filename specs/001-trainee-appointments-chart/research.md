# Research: Gráfico de Agendamentos do Estagiário

Todos os itens abaixo foram resolvidos; não restam `NEEDS CLARIFICATION`.

## 1. Onde calcular a contagem mensal

- **Decision**: no servidor, com uma consulta agregada (`GROUP BY` mês) sobre `Appointment` filtrando por `professional.id`.
- **Rationale**: Princípio I; evita enviar todos os agendamentos (com dados de pacientes) ao navegador. O endpoint atual `GET /appointments` devolve todos os agendamentos a qualquer perfil não paciente, então filtrar no cliente também violaria o Princípio III.
- **Alternatives considered**: reutilizar `GET /appointments` e contar no cliente (rejeitado: expõe dados de pacientes e escala mal).

## 2. Agrupamento por mês e fuso horário

- **Decision**: agrupar por mês de `initialDate` no fuso `America/Bahia` (`date_trunc('month', "initialDate" AT TIME ZONE 'America/Bahia')`), janela dos últimos 6 meses incluindo o corrente; o serviço preenche com zero os meses sem registro.
- **Rationale**: `data-source.ts` já fixa `timezone=America/Bahia`; um agendamento às 23h do último dia do mês não pode cair no mês seguinte. O preenchimento com zero fica no serviço, e não no SQL, para manter a consulta simples e testável.
- **Alternatives considered**: agrupar em UTC (rejeitado: erra a borda de mês); `generate_series` no SQL (rejeitado: mais complexo sem ganho).

## 3. Autorização

- **Decision**: nova regra `viewProfessionalStats` em `AppointmentsPolicy`, permitindo apenas `coordinator`, aplicada com `@Can`. No cliente, o gráfico só é renderizado para coordenador (a navegação "Estagiários" já é restrita a `coordinator` e `lobby`; o `lobby` não carrega o detalhe pois `EmployeesPolicy` o nega).
- **Rationale**: a decisão de esclarecimento limita o gráfico ao coordenador. A regra `view` existente inclui paciente, recepcionista e estagiário, então não serve. `EmployeesPolicy.view` (que alimenta a lista de estagiários) também permite `patient`, mas a nova regra é independente dela.
- **Alternatives considered**: reutilizar `view` (rejeitado: contradiz FR-009).

## 4. Biblioteca de gráfico

- **Decision**: gráfico de barras em SVG feito à mão com Tailwind, sem biblioteca nova.
- **Rationale**: são no máximo 6 barras, sem zoom nem séries; o Princípio V pede a solução mais simples. Evita aumentar o bundle da plataforma. Tooltip nativo via `<title>` do SVG mais `aria-label`/tabela oculta atendem FR-005 e acessibilidade.
- **Alternatives considered**: Recharts ou Chart.js (rejeitados: dependência pesada para um gráfico trivial; podem entrar depois se surgirem mais gráficos).

## 5. Posição e ciclo de vida no cliente

- **Decision**: o gráfico é renderizado em `UserDetail` (`UsersPage.tsx`) quando `user.role === 'trainee'`, com `useQuery` de chave `['appointments', 'monthly', professionalId]`.
- **Rationale**: a rota `/trainees/:id` já usa `UsersPage`; a chave de consulta por id garante que a troca de estagiário não mostre dados do anterior (FR-006); estados de carregando, vazio e erro ficam isolados do restante do detalhe (FR-007, FR-008).
- **Alternatives considered**: nova rota ou aba (rejeitado: o pedido é exibir ao selecionar).

## 6. Testes

- **Decision**: Vitest no servidor para a policy (perfis permitidos e negados) e o serviço (preenchimento de zeros, janela de 6 meses, só `professional`); na plataforma, roteiro manual do quickstart, pois não há runner de testes.
- **Rationale**: Princípio V; não introduzir infraestrutura de teste de frontend só para esta feature.
- **Alternatives considered**: adicionar Vitest + Testing Library à plataforma (fora do escopo).
