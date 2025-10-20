// orderRepository.js
const { ObjectId } = require('mongodb');

class OrderRepository {
  constructor(db, logger) {
    this.collection = db.collection('orders');
    this.logger = logger;
  }

  _validate(order) {
    if (!order.storeId) throw new Error('storeId obrigatório');
    if (!order.customerName) throw new Error('Nome do cliente obrigatório');
    if (!Array.isArray(order.items) || order.items.length === 0) throw new Error('Itens obrigatórios');
  }

  async create(order) {
    try {
      this._validate(order);
      const doc = {
        storeId: typeof order.storeId === 'string' ? new ObjectId(order.storeId) : order.storeId,
        customerName: order.customerName.trim(),
        items: order.items,
        total: order.items.reduce((sum, i) => sum + (i.price * i.qty), 0),
        status: 'PENDENTE',
        createdAt: new Date()
      };
      const res = await this.collection.insertOne(doc);
      return { id: res.insertedId, ...doc };
    } catch (e) {
      await this.logger.error('OrderRepository.create', e);
      throw e;
    }
  }

  async approve(orderId, courierId) {
    try {
      const res = await this.collection.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { status: 'EM ENTREGA', courierId } }
      );
      return res.modifiedCount > 0;
    } catch (e) {
      await this.logger.error('OrderRepository.approve', e);
      throw e;
    }
  }

  async deliver(orderId) {
    try {
      const res = await this.collection.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: { status: 'ENTREGUE', deliveredAt: new Date() } }
      );
      return res.modifiedCount > 0;
    } catch (e) {
      await this.logger.error('OrderRepository.deliver', e);
      throw e;
    }
  }

  async findByStatus(status) {
    return await this.collection.find({ status }).toArray();
  }

  async deleteById(orderId) {
    try {
      const res = await this.collection.deleteOne({ _id: new ObjectId(orderId) });
      return res.deletedCount === 1;
    } catch (e) {
      await this.logger.error('OrderRepository.deleteById', e);
      throw e;
    }
  }
}

module.exports = OrderRepository;
