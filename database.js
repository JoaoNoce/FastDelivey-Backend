const { MongoClient } = require('mongodb');

class Database {
  constructor(uri, dbName) {
    if (!uri || !dbName) throw new Error("Database: URI e nome do banco são obrigatórios");
    this.uri = uri;
    this.dbName = dbName;
    this.client = new MongoClient(uri);
    this.db = null;
  }

  async connect() {
    await this.client.connect();
    this.db = this.client.db(this.dbName);
    await this._createIndexes();
    return this.db;
  }

  async _createIndexes() {
    await this.db.collection('stores').createIndex({ name: 1 }, { unique: true });
    await this.db.collection('orders').createIndex({ status: 1 });
    await this.db.collection('couriers').createIndex({ name: 1 });
  }

  collection(name) {
    return this.db.collection(name);
  }

  async close() {
    await this.client.close();
  }
}

module.exports = Database;
