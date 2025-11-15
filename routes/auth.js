const express = require('express');
const router = express.Router();
const { validateLogin } = require('../middlewares/validation');

function createAuthRoutes(userRepo, logger) {
  router.post('/login', validateLogin, async (req, res) => {
    try {
      const { username, password } = req.body;
      
      await logger.info('Auth.login', `Tentativa de login: username=${username}`);
      
      const user = await userRepo.authenticate(username, password);
      
      if (!user) {
        await logger.info('Auth.login', `Falha no login para: ${username}`);
        return res.status(401).json({ 
          error: 'Credenciais inválidas. Username ou senha incorretos.' 
        });
      }

      req.session.user = user;
      await logger.info('Auth.login', `Usuário ${user.username} fez login com sucesso`);
      
      res.json({ 
        message: 'Login realizado com sucesso',
        user: { id: user.id, username: user.username, role: user.role }
      });
    } catch (error) {
      await logger.error('Auth.login', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Erro ao fazer logout' });
      }
      res.json({ message: 'Logout realizado com sucesso' });
    });
  });

  router.get('/me', (req, res) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: 'Não autenticado' });
    }
    res.json({ user: req.session.user });
  });

  router.get('/debug/user/:username', async (req, res) => {
    try {
      const { username } = req.params;
      const user = await userRepo.findByUsername(username);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.json({ 
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        hasPassword: !!user.password,
        passwordLength: user.password ? user.password.length : 0
      });
    } catch (error) {
      await logger.error('Auth.debug', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  });

  return router;
}

module.exports = createAuthRoutes;

