# 🚚 FastDelivery Backend

Sistema simples para gerenciamento de entregas, desenvolvido com **Node.js**, **Express** e **MongoDB**.  
Permite cadastrar, listar, atualizar e remover entregas.

---

## ⚙️ Tecnologias
- Node.js 
- MongoDB
- Docker (opcional)

---

## 📂 Estrutura
fastdelivery-backend/
├─ package.json
├─ README.md
├─ src/
│  ├─ database.js
│  ├─ logger.js
│  ├─ repositories/
│  │  ├─ storeRepository.js
│  │  ├─ orderRepository.js
│  │  └─ courierRepository.js
│  └─ example.js
└─ logs/
   └─ errors.log

---

## ▶️ Como rodar

### 1️⃣ Clonar o projeto
```bash
git clone https://github.com/JoaoNoce/FastDelivey-Backend.git
cd fastdelivery-backend
```

### 2️⃣ Subir o MongoDB (com Docker)
```bash
docker run --name mongodb-local -p 27017:27017 -d mongo:6
```

### 3️⃣ Instalar dependências e iniciar
```bash
npm install
npm start
```

---

👨‍💻 Autor

João Gabriel Noce Laureano
UTFPR - Engenharia da Computação
📍 Bauru/SP
📧 joaolaureano@alunos.utfpr.edu.br
