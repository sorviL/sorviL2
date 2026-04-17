# sorviL

Sua estante virtual de livros. Com o sorviL, você organiza tudo o que está lendo, já leu ou quer ler em um só lugar. Registre seu progresso página por página, escreva resenhas, descubra o que outros leitores estão achando dos mesmos livros e use nossa I.A. para encontrar sua próxima leitura perfeita. Feito por leitores, para leitores.

## Tecnologias

- **Frontend:** React, TypeScript, SCSS, Vite
- **Backend:** Node.js, Express, TypeScript
- **Banco de dados:** MySQL
- **APIs externas:** Google Books API, OpenAI (ChatGPT)
- **Arquitetura:** MVC

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- [MySQL](https://dev.mysql.com/downloads/) (v8+)
- npm

## Setup inicial

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd sorviL2
```

### 2. Instalar dependências

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 3. Configurar o banco de dados

#### 3.1. Criar o banco no MySQL

Abra o terminal do MySQL (ou use o MySQL Workbench) e execute:

```sql
CREATE DATABASE sorvil;
```

#### 3.2. Configurar as variáveis de ambiente

Na pasta `backend/`, copie o arquivo de exemplo e preencha com seus dados:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=sorvil
```

#### 3.3. Rodar as migrations

Ainda na pasta `backend/`:

```bash
npm run migrate
```

Isso cria todas as tabelas automaticamente no banco `sorvil`.

#### 3.4. (Opcional) Popular com dados de teste

```bash
npm run seed
```

## Rodando o projeto

Abra dois terminais:

**Terminal 1 — Backend (porta 3000):**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (porta 5173):**

```bash
cd frontend
npm run dev
```

Acesse http://localhost:5173

## Comandos úteis do banco

| Comando | O que faz |
|---|---|
| `npm run migrate` | Roda todas as migrations pendentes |
| `npm run migrate:rollback` | Desfaz a última migration |
| `npm run migrate:make nome_da_migration` | Cria uma nova migration |
| `npm run seed` | Popula o banco com dados de teste |

## Atualizando o banco (para todos os devs)

Quando alguém da equipe criar uma migration nova e subir pro Git:

1. Faça `git pull`
2. Na pasta `backend/`, rode `npm run migrate`

O Knex controla quais migrations já foram executadas no seu banco local e roda apenas as novas. Assim todos os devs ficam sincronizados.

## Estrutura do projeto

```
sorviL2/
├── backend/
│   ├── src/
│   │   ├── config/        # Configuração do banco (Knex)
│   │   ├── controllers/   # Controllers da API
│   │   ├── database/
│   │   │   ├── migrations/  # Migrations do banco
│   │   │   └── seeds/       # Dados de teste
│   │   ├── dtos/          # Data Transfer Objects
│   │   ├── middlewares/   # Middlewares (auth, etc)
│   │   ├── models/        # Models (acesso ao banco)
│   │   ├── routes/        # Rotas da API
│   │   ├── services/      # Lógica de negócio
│   │   ├── app.ts
│   │   └── server.ts
│   └── knexfile.ts        # Configuração do Knex
└── frontend/
    └── src/
        ├── assets/        # SCSS e recursos estáticos
        ├── components/    # Componentes React reutilizáveis
        ├── pages/         # Páginas da aplicação
        ├── App.tsx
        └── main.tsx
```
