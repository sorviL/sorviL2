# sorviL

Sua estante virtual de livros. Com o sorviL, você organiza tudo o que está lendo, já leu ou quer ler em um só lugar. Registre seu progresso página por página, escreva resenhas, descubra o que outros leitores estão achando dos mesmos livros e converse com a **Lia**, nossa assistente de IA especializada em livros, para encontrar sua próxima leitura perfeita. Feito por leitores, para leitores.

## Tecnologias

- **Frontend:** React, TypeScript, SCSS, Vite
- **Backend:** Node.js, Express, TypeScript
- **Banco de dados:** MySQL
- **IA:** Google Gemini API (modelo gemini-2.5-flash) com fallback para Groq (Llama 3.3 70B)
- **Email:** Resend (email transacional de boas-vindas)
- **APIs externas:** Google Books API
- **Bibliotecas do frontend:** GSAP (animações de texto), OGL (background WebGL), react-markdown
- **Arquitetura:** modular por domínio (auth, bookshelf, reviews, chat, email)

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- [MySQL](https://dev.mysql.com/downloads/) (v8+)
- npm
- [Chave da API do Gemini](https://aistudio.google.com/apikey) (para o chat com IA)
- [Chave da API do Groq](https://console.groq.com) (fallback do chat com IA)
- [Chave da API do Resend](https://resend.com) (email de boas-vindas)

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

As dependências extras já estão no `package.json` de cada pasta e serão instaladas automaticamente com `npm install`. Para referência, as principais libs adicionadas manualmente:

**Frontend:**
```bash
npm install react-markdown    # renderização de markdown nas mensagens
npm install gsap @gsap/react  # animações de texto (SplitText)
npm install ogl               # background WebGL (SoftAurora)
npm install motion            # animações de UI
```

**Backend:**
```bash
npm install @google/generative-ai  # integração com Google Gemini
npm install resend                 # email transacional (boas-vindas)
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

Edite o `.env` com suas credenciais:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=sorvil

GEMINI_API_KEY=sua_chave_do_gemini
GROQ_API_KEY=sua_chave_do_groq
RESEND_API_KEY=sua_chave_do_resend
```

Para obter a chave do Gemini, acesse [Google AI Studio](https://aistudio.google.com/apikey) e crie uma API key.
Para obter a chave do Groq, acesse [Groq Console](https://console.groq.com) e crie uma API key gratuita.
Para obter a chave do Resend, acesse [Resend](https://resend.com), crie uma conta e gere uma API key.

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

## Endpoints da API

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cadastro de usuário |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Dados do usuário logado |
| POST | `/auth/logout` | Logout |

### Estante
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/bookshelf` | Listar livros da estante |
| POST | `/bookshelf` | Adicionar livro |
| PATCH | `/bookshelf/:id` | Atualizar status/nota |
| DELETE | `/bookshelf/:id` | Remover livro |

### Chat com IA
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/chat/conversations` | Listar conversas |
| POST | `/chat/conversations` | Criar conversa |
| GET | `/chat/conversations/:id/messages` | Listar mensagens |
| POST | `/chat/conversations/:id/messages` | Enviar mensagem |
| DELETE | `/chat/conversations/:id` | Remover conversa |

## Comandos úteis do banco

| Comando | O que faz |
|---|---|
| `npm run migrate` | Roda todas as migrations pendentes |
| `npm run migrate:rollback` | Desfaz a última migration |
| `npm run migrate:make nome_da_migration` | Cria uma nova migration |
| `npm run seed` | Popula o banco com dados de teste |

## Funcionalidades

- **Estante de livros:** organize seus livros por status (lendo, lido, quero ler, relendo, abandonado)
- **Resenhas:** escreva e leia resenhas de outros leitores, com controle de spoiler
- **Busca:** pesquise livros via Google Books API
- **Chat com IA (Lia):** converse com uma assistente especializada em livros, que conhece sua estante e recomenda leituras (Gemini com fallback automático para Groq)
- **Autenticação:** cadastro e login com JWT + cookies httpOnly
- **Email de boas-vindas:** ao criar conta, o usuário recebe um email automático via Resend

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
│   │   ├── config/           # Configuração do banco (Knex)
│   │   ├── shared/           # Helpers de validação compartilhados
│   │   ├── modules/
│   │   │   ├── auth/         # Autenticação (JWT + cookies)
│   │   │   ├── bookshelf/    # CRUD da estante de livros
│   │   │   ├── reviews/      # Resenhas de livros
│   │   │   ├── email/        # Email transacional (Resend)
│   │   │   └── chat/         # Chat com IA (Gemini + Groq fallback)
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── app.ts
│   │   └── server.ts
│   └── knexfile.ts
└── frontend/
    └── src/
        ├── assets/           # SCSS, imagens e tokens
        ├── components/       # Componentes reutilizáveis
        │   ├── chat/         # Chat com IA (sidebar, mensagens, input)
        │   ├── navbar/
        │   ├── softAurora/   # Background WebGL (OGL)
        │   ├── splitText/    # Animação de texto (GSAP)
        │   └── ...
        ├── hooks/            # Custom hooks (useChat, etc.)
        ├── services/         # Comunicação com a API
        ├── types/            # Tipos TypeScript
        ├── pages/            # Páginas da aplicação
        ├── App.tsx
        └── main.tsx
```
