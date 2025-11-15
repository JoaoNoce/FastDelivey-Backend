const express = require('express');
const session = require('express-session');
const Database = require('./database');
const Logger = require('./logger');
const StoreRepository = require('./storeRepository');
const OrderRepository = require('./orderRepository');
const CourierRepository = require('./courierRepository');
const UserRepository = require('./userRepository');

const createAuthRoutes = require('./routes/auth');
const createStoreRoutes = require('./routes/stores');
const createCourierRoutes = require('./routes/couriers');
const createOrderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'fastdelivery-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

let db, logger, userRepo, storeRepo, courierRepo, orderRepo;

async function initializeApp() {
  try {
    logger = new Logger();
    db = new Database(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
      process.env.DB_NAME || 'fastdelivery_db'
    );
    await db.connect();
    await logger.info('App', 'Conectado ao banco de dados');

    userRepo = new UserRepository(db.db, logger);
    storeRepo = new StoreRepository(db.db, logger);
    courierRepo = new CourierRepository(db.db, logger);
    orderRepo = new OrderRepository(db.db, logger);

    try {
      const admin = await userRepo.findByUsername('admin');
      if (!admin) {
        const newAdmin = await userRepo.create({
          username: 'admin',
          password: 'admin123',
          role: 'admin'
        });
        await logger.info('App', `Usuário admin padrão criado: ${JSON.stringify({ username: newAdmin.username, role: newAdmin.role })}`);
      } else {
        await logger.info('App', `Usuário admin já existe no banco de dados`);
        const storedPassword = String(admin.password || '').trim();
        const expectedPassword = 'admin123';
        if (storedPassword !== expectedPassword) {
          const { ObjectId } = require('mongodb');
          await db.db.collection('users').updateOne(
            { _id: admin._id },
            { $set: { password: expectedPassword } }
          );
          await logger.info('App', `Senha do usuário admin atualizada. Antes: length=${storedPassword.length}, Depois: admin123`);
        } else {
          await logger.info('App', 'Senha do usuário admin está correta');
        }
      }
    } catch (err) {
      await logger.error('App.initAdmin', err);
    }

    app.use('/api/auth', createAuthRoutes(userRepo, logger));
    app.use('/api/stores', createStoreRoutes(storeRepo, logger));
    app.use('/api/couriers', createCourierRoutes(courierRepo, logger));
    app.use('/api/orders', createOrderRoutes(orderRepo, logger));

    app.get('/', (req, res) => {
      res.json({
        message: 'FastDelivery API - Sistema de Entregas',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          stores: '/api/stores',
          couriers: '/api/couriers',
          orders: '/api/orders'
        }
      });
    });

    app.get('/login', (req, res) => {
      res.status(200).json({
        message: 'Esta é uma API REST. Use POST /api/auth/login para fazer login.',
        info: 'Para fazer login, envie uma requisição POST para /api/auth/login com o body:',
        example: {
          method: 'POST',
          url: '/api/auth/login',
          body: {
            username: 'admin',
            password: 'admin123'
          }
        },
        endpoints: {
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          me: 'GET /api/auth/me'
        }
      });
    });

    app.post('/login', (req, res) => {
      res.status(200).json({
        message: 'Use a rota /api/auth/login para fazer login',
        correctEndpoint: '/api/auth/login',
        example: {
          method: 'POST',
          url: '/api/auth/login',
          body: {
            username: 'admin',
            password: 'admin123'
          }
        }
      });
    });

    app.use((err, req, res, next) => {
      logger.error('App.errorHandler', err);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    app.use((req, res) => {
      res.status(404).json({ error: 'Rota não encontrada' });
    });

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
      console.log(`Acesse http://localhost:${PORT}`);
      logger.info('App', `Servidor iniciado na porta ${PORT}`);
    });

  } catch (error) {
    console.error('Erro ao inicializar aplicação:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\nEncerrando servidor...');
  if (db) await db.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nEncerrando servidor...');
  if (db) await db.close();
  process.exit(0);
});

initializeApp();

module.exports = app;

