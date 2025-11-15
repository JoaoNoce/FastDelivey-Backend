# FastDelivery - Sistema de Entregas Backend

API RESTful desenvolvida com Express.js, MongoDB e autenticação por sessões.

## Instalação

```bash
npm install
npm start
```

Servidor disponível em `http://localhost:3000`

## Autenticação

**Usuário padrão:**
- Username: `admin`
- Password: `admin123`

## Endpoints

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Usuário autenticado

### Lojas
- `GET /api/stores` - Listar lojas
- `POST /api/stores` 🔒 - Criar loja
- `GET /api/stores/search?name=...` - Buscar loja
- `PATCH /api/stores/:name/status` 🔒 - Atualizar status
- `DELETE /api/stores/:id` 🔒 - Deletar loja

### Entregadores
- `GET /api/couriers/available` - Listar disponíveis
- `POST /api/couriers` 🔒 - Criar entregador
- `PATCH /api/couriers/:id/availability` 🔒 - Atualizar disponibilidade
- `DELETE /api/couriers/:id` 🔒 - Deletar entregador

### Pedidos
- `GET /api/orders` - Listar pedidos
- `GET /api/orders?status=...` - Filtrar por status
- `POST /api/orders` - Criar pedido
- `POST /api/orders/:id/approve` 🔒 - Aprovar pedido
- `POST /api/orders/:id/deliver` 🔒 - Marcar como entregue
- `DELETE /api/orders/:id` 🔒 - Deletar pedido

🔒 = Requer autenticação

## Scripts

- `npm start` - Inicia o servidor
- `npm test` - Executa testes
