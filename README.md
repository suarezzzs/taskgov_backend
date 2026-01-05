# Task Gov System - Backend API

A robust, enterprise-grade RESTful API designed for corporate task management. This system focuses on data integrity, auditability, and hierarchical project organization using modern technologies.

Built with **NestJS**, **Drizzle ORM**, and **PostgreSQL**.

## 🚀 Features

- **Authentication & Security**
  - Secure Login & Registration with JWT (JSON Web Tokens).
  - Password hashing using Bcrypt.
  - Role-Based Access Control (RBAC) and Guard protection.

- **Workspace Management**
  - Create and manage multiple workspaces.
  - Invite members via email with specific roles (Admin/Member).
  - Workspace ownership validation.

- **Task Management**
  - CRUD operations for tasks with Priority (Low, Medium, High) and Status (Todo, In Progress, Done).
  - **Checklists**: Add, remove, and toggle sub-items within tasks.
  - **Attachments**: File upload support for tasks.

- **Audit Logs & Data Integrity**
  - **Activity History**: Tracks user actions (creation, updates, deletions) automatically.
  - **Cascading Deletes**: Ensures database cleanliness by removing associated logs, attachments, and checklists before deleting a task or workspace.

## 🛠️ Tech Stack

- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Validation:** Zod (via `nestjs-zod`)
- **Testing:** Jest (Unit Testing)
- **Environment:** Docker & Docker Compose

## ⚙️ Prerequisites

Before running this project, ensure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- Docker & Docker Compose (for the database)

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/task-gov-backend.git](https://github.com/your-username/task-gov-backend.git)
   cd task-gov-backend
