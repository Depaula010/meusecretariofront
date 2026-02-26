# Manifesto de Execução (Frontend)

## Contexto Atual
* **Estado do Projeto:** Em Desenvolvimento (Tela de Configurações)
* **Última Atualização:** 2026-02-26

## Tarefa em Andamento
* **Objetivo:** Refatorar e completar a tela `/settings` com aba Perfil, integração real com backend, AuthService e toast notifications
* **Solicitante:** Rafael

## Plano de Execução
- [x] Plano elaborado e aprovado
- [ ] **Model** — `src/app/core/models/settings.model.ts`: Adicionar `UserProfile`, `ProfileUpdateRequest`, `ProfileResponse`
- [ ] **Service** — `src/app/core/services/settings.service.ts`: Atualizar URLs → `/api/user/*`, adicionar métodos de perfil
- [ ] **Component TS** — `settings.component.ts`: Injetar `AuthService`, aba `'profile'`, `profileForm` signal, toast substituindo `alert()`
- [ ] **Component HTML** — `settings.component.html`: Nova aba Perfil (1ª), toast UI, reordenar abas
- [ ] **QA** — `ng build` sem erros, testar no browser

## Status dos Subagentes
| Agente | Status | Última Saída |
| :--- | :--- | :--- |
| Tech Lead (Arch) | Ativo | Arquitetura definida: novos endpoints /api/user/* sem IDOR |
| UX/UI Designer | Ativo | Aba Perfil projetada (mobile-first, Tailwind), toast component |
| Frontend Specialist | Pendente | - |
| QA Engineer | Pendente | - |
| Sec Ops | Ocioso | JWT userId via AuthService, sem hardcode |
| DevOps Engineer | Ocioso | Proxy Angular já cobre /api/user/* |

## Notas Recentes
* **2026-02-26:** Iniciada implementação. Settings component existente tinha userId hardcoded como 'user-demo' e usava alert() — ambos serão corrigidos. Adicionando aba Perfil (nome, email, cidade, estado, fuso horário, meses de reserva de emergência).