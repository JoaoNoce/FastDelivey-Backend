// storeRepository.js
class StoreRepository {
  constructor(db, logger) {
    this.collection = db.collection('stores');
    this.logger = logger;
  }

  _validate(store) {
    if (!store.name || typeof store.name !== 'string') throw new Error('Nome da loja é obrigatório');
    if (!store.category) throw new Error('Categoria é obrigatória');
  }

  async create(store) {
    try {
      this._validate(store);
      const doc = {
        name: store.name.trim(),
        category: store.category.trim(),
        address: store.address || '',
        isOpen: true,
        createdAt: new Date()
      };
      const res = await this.collection.insertOne(doc);
      return { id: res.insertedId, ...doc };
    } catch (e) {
      await this.logger.error('StoreRepository.create', e);
      throw e;
    }
  }

  async findByName(name) {
    try {
      return await this.collection.findOne({ name });
    } catch (e) {
      await this.logger.error('StoreRepository.findByName', e);
      throw e;
    }
  }

  async setStatus(name, isOpen) {
    try {
      return await this.collection.updateOne({ name }, { $set: { isOpen } });
    } catch (e) {
      await this.logger.error('StoreRepository.setStatus', e);
      throw e;
    }
  }

  async listAll() {
    return await this.collection.find().toArray();
  }

  async deleteById(id) {
    try {
      const { ObjectId } = require('mongodb');
      const res = await this.collection.deleteOne({ _id: new ObjectId(id) });
      return res.deletedCount === 1;
    } catch (e) {
      await this.logger.error('StoreRepository.deleteById', e);
      throw e;
    }
  }
}

module.exports = StoreRepository;
