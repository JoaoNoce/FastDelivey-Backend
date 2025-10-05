// courierRepository.js
class CourierRepository {
  constructor(db, logger) {
    this.collection = db.collection('couriers');
    this.logger = logger;
  }

  _validate(courier) {
    if (!courier.name) throw new Error('Nome do entregador é obrigatório');
  }

  async create(courier) {
    try {
      this._validate(courier);
      const doc = {
        name: courier.name.trim(),
        vehicle: courier.vehicle || 'moto',
        available: true,
        createdAt: new Date()
      };
      const res = await this.collection.insertOne(doc);
      return { id: res.insertedId, ...doc };
    } catch (e) {
      await this.logger.error('CourierRepository.create', e);
      throw e;
    }
  }

  async findAvailable() {
    try {
      return await this.collection.find({ available: true }).toArray();
    } catch (e) {
      await this.logger.error('CourierRepository.findAvailable', e);
      throw e;
    }
  }

  async setAvailability(id, available) {
    try {
      const { ObjectId } = require('mongodb');
      return await this.collection.updateOne({ _id: new ObjectId(id) }, { $set: { available } });
    } catch (e) {
      await this.logger.error('CourierRepository.setAvailability', e);
      throw e;
    }
  }
}

module.exports = CourierRepository;
