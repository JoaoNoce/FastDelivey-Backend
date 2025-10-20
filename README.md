# FastDelivery - Backend

Descrição
- Backend RESTful para o sistema FastDelivery, responsável por gerenciar usuários, entregas, pedidos e rastreamento.

Principais tecnologias
- Node.js (ou outra runtime indicada)
- Framework HTTP (Express, Fastify ou similar)
- Banco de dados relacional (Postgres recomendado)
- ORM (TypeORM, Prisma ou equivalente)
- Docker (opcional)

Pré-requisitos
- Node.js >= 16
- npm ou yarn
- Docker & docker-compose (opcional)
- Banco de dados (Postgres recomendado)

Instalação (local)
1. Clone o repositório:
    git clone <URL-do-repositório>
2. Instale dependências:
    npm install
    # ou
    yarn install
3. Configure variáveis de ambiente (veja abaixo).
4. Rode migrações (se houver):
    npm run migrate
5. Inicie a aplicação:
    npm run dev
    # ou
    yarn dev

Executando com Docker
- Iniciar via docker-compose (exemplo):
  docker-compose up --build

Variáveis de ambiente (exemplo)
- PORT=3000
- NODE_ENV=development
- DATABASE_URL=postgres://user:password@localhost:5432/fastdelivery
- JWT_SECRET=seu_segredo_aqui
- LOG_LEVEL=info

Scripts úteis (exemplos)
- npm run dev — modo desenvolvimento com reload
- npm run start — iniciar em produção
- npm run build — compilar/transpilar código
- npm run test — executar testes
- npm run migrate — executar migrações do banco

Testes
- Escreva testes unitários e de integração em /tests
- Execute: npm run test

Estrutura sugerida
- src/
  - controllers/
  - services/
  - repositories/
  - models/
  - routes/
  - middlewares/
  - config/
- tests/
- docker/
- scripts/

Endpoints principais (exemplo)
- POST /auth/login — autenticação
- POST /users — criar usuário
- GET /deliveries — listar entregas
- POST /orders — criar pedido
- PATCH /deliveries/:id/status — atualizar status

Boas práticas
- Validar entradas (DTOs / schemas)
- Tratar erros e retornar respostas consistentes
- Registrar logs estruturados
- Usar migrações para alterações no banco
- Proteger endpoints com autenticação e autorização

Contribuição
- Abra issues para bugs ou sugestões.
- Envie Pull Requests com descrições claras e tests quando aplicável.
- Siga o guia de estilo do projeto (linters e formatação).

Licença
- Informe a licença do projeto (ex.: MIT) no arquivo LICENSE.

Contato
- Adicione informações de contato ou link do repositório para suporte ou dúvidas.
