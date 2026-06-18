# TaskGov - Backend API

Sistema de gerenciamento de tarefas corporativo com workspaces, checklists, anexos e logs de auditoria.

## Frontend

Repositório: [github.com/suarezzzs/taskgov_frontend](https://github.com/suarezzzs/taskgov_frontend)

## Funcionalidades

- **Autenticação JWT** com login seguro e bcrypt
- **Workspaces** com membros e permissões
- **Tasks** com prioridade (Low/Medium/High), status (Todo/In Progress/Done), checklists e anexos
- **Logs de auditoria** com rastreamento de ações
- **RBAC** (Role-Based Access Control)

## Tecnologias

- **NestJS 11** + TypeScript
- **PostgreSQL 16** + Drizzle ORM
- **Autenticação JWT** (Passport + bcrypt)
- **Validação** Zod (nestjs-zod)
- **Testes** Jest
- **Docker** & Docker Compose

## Setup

```bash
# clonar
git clone https://github.com/suarezzzs/taskgov.git
cd taskgov

# configurar ambiente
cp .env.example .env

# iniciar banco
docker compose up -d

# instalar dependencias
npm install

# rodar migrations
npx drizzle-kit push

# popular com dados de teste
npm run db:seed

# iniciar servidor
npm run start:dev
```

Servidor em `http://localhost:3000`.

## Usuários de teste (seed)

| Email | Senha | Role |
|-------|-------|------|
| admin@email.com | 123456 | ADMIN |
| carlos@email.com | 123456 | USER |

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Login |
| POST | `/users` | Criar conta |
| GET | `/users/profile` | Perfil (auth) |
| PATCH | `/users/me` | Atualizar perfil (auth) |
| GET | `/workspaces` | Listar workspaces (auth) |
| POST | `/workspaces` | Criar workspace (auth) |
| GET | `/workspaces/:id` | Detalhes do workspace (auth) |
| PATCH | `/workspaces/:id` | Atualizar workspace (auth) |
| DELETE | `/workspaces/:id` | Remover workspace (auth) |
| GET | `/tasks` | Listar tasks (auth) |
| POST | `/tasks` | Criar task (auth) |
| GET | `/tasks/:id` | Detalhes da task (auth) |
| PATCH | `/tasks/:id` | Atualizar task (auth) |
| DELETE | `/tasks/:id` | Remover task (auth) |
| GET | `/tasks/:id/checklists` | Listar checklists (auth) |
| POST | `/tasks/:id/checklists` | Criar checklist (auth) |
| GET | `/attachments/:taskId` | Listar anexos (auth) |
| GET | `/logs/:taskId` | Listar logs (auth) |
| GET | `/dashboard` | Dashboard (auth) |
