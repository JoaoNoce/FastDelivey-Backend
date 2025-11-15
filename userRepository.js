class UserRepository {
  constructor(db, logger) {
    this.collection = db.collection('users');
    this.logger = logger;
  }

  _validate(user) {
    if (!user.username) throw new Error('Username é obrigatório');
    if (!user.password) throw new Error('Senha é obrigatória');
    if (user.password.length < 4) throw new Error('Senha deve ter no mínimo 4 caracteres');
  }

  async create(user) {
    try {
      this._validate(user);
      const doc = {
        username: user.username.trim().toLowerCase(),
        password: String(user.password).trim(),
        role: user.role || 'user',
        createdAt: new Date()
      };
      const res = await this.collection.insertOne(doc);
      await this.logger.info('UserRepository.create', `Usuário criado: ${doc.username}, senha length: ${doc.password.length}`);
      return { id: res.insertedId, ...doc };
    } catch (e) {
      await this.logger.error('UserRepository.create', e);
      throw e;
    }
  }

  async findByUsername(username) {
    try {
      return await this.collection.findOne({ username: username.trim().toLowerCase() });
    } catch (e) {
      await this.logger.error('UserRepository.findByUsername', e);
      throw e;
    }
  }

  async authenticate(username, password) {
    try {
      const normalizedUsername = username.trim().toLowerCase();
      const user = await this.findByUsername(normalizedUsername);
      
      if (!user) {
        await this.logger.info('UserRepository.authenticate', `Usuário não encontrado: ${normalizedUsername}`);
        return null;
      }
      
      const storedPassword = String(user.password || '').trim();
      const providedPassword = String(password || '').trim();
      
      await this.logger.info('UserRepository.authenticate', 
        `Comparando senhas - Stored length: ${storedPassword.length}, Provided length: ${providedPassword.length}, Match: ${storedPassword === providedPassword}`);
      
      if (storedPassword !== providedPassword) {
        await this.logger.info('UserRepository.authenticate', `Senha incorreta para usuário: ${normalizedUsername}`);
        return null;
      }
      
      await this.logger.info('UserRepository.authenticate', `Autenticação bem-sucedida para: ${normalizedUsername}`);
      return { id: user._id.toString(), username: user.username, role: user.role };
    } catch (e) {
      await this.logger.error('UserRepository.authenticate', e);
      throw e;
    }
  }
}

module.exports = UserRepository;

