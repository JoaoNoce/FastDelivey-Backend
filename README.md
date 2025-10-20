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

