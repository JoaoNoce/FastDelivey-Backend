// example.js
const Database = require('./database');
const Logger = require('./logger');
const StoreRepository = require('./repositories/storeRepository');
const OrderRepository = require('./repositories/orderRepository');
const CourierRepository = require('./repositories/courierRepository');

async function main() {
  const logger = new Logger();
  const db = new Database('mongodb://127.0.0.1:27017', 'fastdelivery_db');
  await db.connect();

  const storeRepo = new StoreRepository(db.db, logger);
  const courierRepo = new CourierRepository(db.db, logger);
  const orderRepo = new OrderRepository(db.db, logger);

  try {
    const store = await storeRepo.create({ name: 'Lanchonete da Esquina', category: 'Lanches', address: 'Rua 7, nº 42' });
    const courier = await courierRepo.create({ name: 'Carlos Entregas', vehicle: 'moto' });

    const order = await orderRepo.create({
      storeId: store.id,
      customerName: 'João Gabriel',
      items: [
        { name: 'X-Burger', qty: 2, price: 15.5 },
        { name: 'Suco Natural', qty: 1, price: 7.0 }
      ]
    });

    console.log('Pedido criado:', order);

    await orderRepo.approve(order.id, courier.id);
    console.log('Pedido aprovado e enviado para entrega');

    await orderRepo.deliver(order.id);
    console.log('Pedido entregue com sucesso!');

    const delivered = await orderRepo.findByStatus('ENTREGUE');
    console.log('Pedidos entregues:', delivered);

  } catch (err) {
    await logger.error('main', err);
  } finally {
    await db.close();
  }
}

main();
