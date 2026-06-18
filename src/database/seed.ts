import "dotenv/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import * as bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seed() {
  console.log("Limpando dados existentes...");
  await db.delete(schema.systemLogs);
  await db.delete(schema.attachments);
  await db.delete(schema.checklists);
  await db.delete(schema.tasks);
  await db.delete(schema.workspaceMembers);
  await db.delete(schema.workspaces);
  await db.delete(schema.users);

  console.log("Criando usuários...");
  const hashedPassword = await bcrypt.hash("123456", 10);

  const usersData = [
    { name: "Admin", email: "admin@email.com", password: hashedPassword, role: "ADMIN" },
    { name: "Carlos Magno", email: "carlos@email.com", password: hashedPassword, role: "USER" },
    { name: "Ana Silva", email: "ana@email.com", password: hashedPassword, role: "USER" },
    { name: "Bruno Costa", email: "bruno@email.com", password: hashedPassword, role: "USER" },
    { name: "Mariana Souza", email: "mariana@email.com", password: hashedPassword, role: "USER" },
    { name: "Rafael Oliveira", email: "rafael@email.com", password: hashedPassword, role: "USER" },
  ];

  // Add extra faker users
  for (let i = 0; i < 4; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    usersData.push({
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      password: hashedPassword,
      role: "USER",
    });
  }

  const createdUsers = await db.insert(schema.users).values(usersData).returning();
  console.log(`  ${createdUsers.length} usuários criados`);

  console.log("Criando workspaces...");
  const workspacesData = [
    { name: "Projeto Alpha", ownerId: createdUsers[0].id },
    { name: "Marketing Digital", ownerId: createdUsers[1].id },
    { name: "Desenvolvimento Web", ownerId: createdUsers[2].id },
    { name: "Design System", ownerId: createdUsers[0].id },
    { name: "Infraestrutura", ownerId: createdUsers[3].id },
    { name: "Mobile App", ownerId: createdUsers[4].id },
  ];

  for (let i = 0; i < 4; i++) {
    const randomUser = faker.helpers.arrayElement(createdUsers);
    workspacesData.push({
      name: faker.company.name(),
      ownerId: randomUser.id,
    });
  }

  const createdWorkspaces = await db.insert(schema.workspaces).values(workspacesData).returning();
  console.log(`  ${createdWorkspaces.length} workspaces criados`);

  console.log("Criando membros dos workspaces...");
  const membersData: (typeof schema.workspaceMembers.$inferInsert)[] = [];
  for (const ws of createdWorkspaces) {
    // Owner is automatically a member
    const ownerId = workspacesData.find(w => w.name === ws.name)!.ownerId;
    membersData.push({ workspaceId: ws.id, userId: ownerId, role: "OWNER" });

    // Add 2-4 random members
    const otherUsers = createdUsers.filter(u => u.id !== ownerId);
    const numMembers = faker.number.int({ min: 2, max: Math.min(4, otherUsers.length) });
    const selectedMembers = faker.helpers.arrayElements(otherUsers, numMembers);
    for (const member of selectedMembers) {
      membersData.push({
        workspaceId: ws.id,
        userId: member.id,
        role: faker.helpers.arrayElement(["MEMBER", "MEMBER", "MEMBER", "VIEWER"]),
      });
    }
  }
  const createdMembers = await db.insert(schema.workspaceMembers).values(membersData).returning();
  console.log(`  ${createdMembers.length} membros adicionados`);

  console.log("Criando tasks...");
  const priorities = ["LOW", "MEDIUM", "HIGH"] as const;
  const statuses = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as const;
  const taskTemplates = [
    { title: "Configurar ambiente de desenvolvimento", desc: "Instalar e configurar todas as ferramentas necessárias para o projeto, incluindo Docker, banco de dados e dependências." },
    { title: "Implementar autenticação JWT", desc: "Criar fluxo de login com JWT, incluindo refresh token e proteção de rotas." },
    { title: "Criar CRUD de usuários", desc: "Implementar endpoints para criação, listagem, atualização e remoção de usuários do sistema." },
    { title: "Desenvolver dashboard", desc: "Criar dashboard com gráficos e métricas principais do sistema usando dados em tempo real." },
    { title: "Testes de integração", desc: "Escrever testes de integração para todos os endpoints da API." },
    { title: "Documentação da API", desc: "Documentar todos os endpoints usando Swagger/OpenAPI." },
    { title: "Otimizar consultas SQL", desc: "Revisar e otimizar queries lentas, adicionar índices e melhorar performance." },
    { title: "Implementar notificações", desc: "Sistema de notificações em tempo real via WebSocket para alertas e atualizações." },
    { title: "Criar pipeline CI/CD", desc: "Configurar GitHub Actions para testes automatizados, lint e deploy." },
    { title: "Migração de banco de dados", desc: "Planejar e executar migração do banco de dados para nova versão do schema." },
    { title: "Implementar upload de arquivos", desc: "Sistema de upload com validação de tipo, tamanho e armazenamento em cloud." },
    { title: "Configurar logging centralizado", desc: "Implementar sistema de logs estruturados com correlação entre serviços." },
    { title: "Criar sistema de permissões", desc: "RBAC com permissões granulares por workspace e recurso." },
    { title: "Desenvolver modo offline", desc: "Suporte a operações offline com sincronização quando a conexão for restabelecida." },
    { title: "Implementar busca full-text", desc: "Busca textual em tasks, workspaces e usuários com suporte a filtros." },
    { title: "Configurar backup automático", desc: "Backup diário do banco de dados com retenção de 30 dias." },
    { title: "Criar API pública", desc: "Expor API pública com rate limiting e chaves de acesso para integrações externas." },
    { title: "Implementar soft delete", desc: "Adicionar soft delete em todas as entidades principais com restauração." },
    { title: "Auditoria de segurança", desc: "Revisar vulnerabilidades, atualizar dependências e corrigir falhas." },
    { title: "Criar relatórios exportáveis", desc: "Gerar relatórios em PDF e Excel com dados filtrados por período." },
    { title: "Configurar cache Redis", desc: "Implementar cache distribuído para reduzir carga no banco de dados." },
    { title: "Desenvolver webhooks", desc: "Sistema de webhooks para notificar sistemas externos sobre eventos." },
    { title: "Refatorar módulo de tasks", desc: "Reorganizar código do módulo de tasks seguindo princípios SOLID." },
    { title: "Implementar rate limiting", desc: "Proteger API contra abuso com rate limiting por IP e por usuário." },
  ];

  const tasksData: (typeof schema.tasks.$inferInsert)[] = [];
  for (const template of taskTemplates) {
    const ws = faker.helpers.arrayElement(createdWorkspaces);
    const startDate = faker.date.between({ from: new Date("2026-01-01"), to: new Date("2026-06-30") });
    const endDate = faker.datatype.boolean(0.7)
      ? faker.date.between({ from: startDate, to: new Date("2026-07-31") })
      : null;

    tasksData.push({
      workspaceId: ws.id,
      title: template.title,
      description: template.desc,
      priority: faker.helpers.arrayElement(priorities),
      status: faker.helpers.arrayElement(statuses),
      startDate,
      endDate,
    });
  }
  const createdTasks = await db.insert(schema.tasks).values(tasksData).returning();
  console.log(`  ${createdTasks.length} tasks criadas`);

  console.log("Criando checklists...");
  const checklistTemplates = [
    ["Analisar requisitos", "Criar protótipo", "Revisar com equipe", "Implementar", "Testar"],
    ["Preparar ambiente", "Escrever código", "Code review", "QA", "Deploy"],
    ["Pesquisar soluções", "Escolher tecnologia", "Implementar PoC", "Documentar"],
    ["Coletar dados", "Analisar resultados", "Apresentar para stakeholders"],
    ["Criar tasks menores", "Distribuir para equipe", "Acompanhar progresso"],
  ];

  const checklistsData: (typeof schema.checklists.$inferInsert)[] = [];
  for (const task of createdTasks) {
    const template = faker.helpers.arrayElement(checklistTemplates);
    for (const item of template) {
      checklistsData.push({
        taskId: task.id,
        title: item,
        isCompleted: faker.datatype.boolean(0.5),
      });
    }
  }
  const createdChecklists = await db.insert(schema.checklists).values(checklistsData).returning();
  console.log(`  ${createdChecklists.length} checklists criados`);

  console.log("Criando anexos...");
  const fileTypes = ["pdf", "docx", "xlsx", "png", "jpg", "txt", "zip"];
  const attachmentsData: (typeof schema.attachments.$inferInsert)[] = [];
  for (const task of faker.helpers.arrayElements(createdTasks, Math.floor(createdTasks.length * 0.6))) {
    const numFiles = faker.number.int({ min: 1, max: 3 });
    for (let i = 0; i < numFiles; i++) {
      const ext = faker.helpers.arrayElement(fileTypes);
      attachmentsData.push({
        taskId: task.id,
        fileName: `${faker.system.commonFileName(ext)}`,
        filePath: `uploads/${task.id}/${faker.string.alphanumeric(8)}.${ext}`,
      });
    }
  }
  const createdAttachments = await db.insert(schema.attachments).values(attachmentsData).returning();
  console.log(`  ${createdAttachments.length} anexos criados`);

  console.log("Criando logs do sistema...");
  const actions = ["TASK_CREATED", "TASK_UPDATED", "TASK_DELETED", "USER_JOINED", "USER_LEFT", "STATUS_CHANGED", "PRIORITY_CHANGED"];
  const logsData: (typeof schema.systemLogs.$inferInsert)[] = [];
  for (const task of faker.helpers.arrayElements(createdTasks, Math.floor(createdTasks.length * 0.8))) {
    const numLogs = faker.number.int({ min: 1, max: 4 });
    for (let i = 0; i < numLogs; i++) {
      logsData.push({
        taskId: task.id,
        userId: faker.helpers.arrayElement(createdUsers).id,
        action: faker.helpers.arrayElement(actions),
        details: faker.lorem.sentence(),
      });
    }
  }
  const createdLogs = await db.insert(schema.systemLogs).values(logsData).returning();
  console.log(`  ${createdLogs.length} logs criados`);

  console.log("\n✅ Seed concluído com sucesso!");
  console.log("📧 Emails de acesso (senha: 123456):");
  for (const u of createdUsers) {
    console.log(`   ${u.email} (${u.role})`);
  }

  await pool.end();
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
