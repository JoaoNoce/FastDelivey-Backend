const express = require('express');
const router = express.Router();
const { validateStore } = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');

function createStoreRoutes(storeRepo, logger) {
  router.get('/', async (req, res) => {
    try {
      const stores = await storeRepo.listAll();
      res.json({ stores });
    } catch (error) {
      await logger.error('Stores.listAll', error);
      res.status(500).json({ error: 'Erro ao listar lojas' });
    }
  });

  router.post('/', requireAuth, validateStore, async (req, res) => {
    try {
      const store = await storeRepo.create(req.body);
      await logger.info('Stores.create', `Loja criada: ${store.name}`);
      res.status(201).json({ 
        message: 'Loja criada com sucesso',
        store 
      });
    } catch (error) {
      await logger.error('Stores.create', error);
      if (error.message.includes('obrigatório') || error.message.includes('obrigatória')) {
        return res.status(400).json({ error: error.message });
      }
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Já existe uma loja com este nome' });
      }
      res.status(500).json({ error: 'Erro ao criar loja' });
    }
  });

  router.get('/search', async (req, res) => {
    try {
      const { name } = req.query;
      if (!name) {
        return res.status(400).json({ error: 'Parâmetro "name" é obrigatório' });
      }
      const store = await storeRepo.findByName(name);
      if (!store) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }
      res.json({ store });
    } catch (error) {
      await logger.error('Stores.findByName', error);
      res.status(500).json({ error: 'Erro ao buscar loja' });
    }
  });

  router.patch('/:name/status', requireAuth, async (req, res) => {
    try {
      const { name } = req.params;
      const { isOpen } = req.body;
      
      if (typeof isOpen !== 'boolean') {
        return res.status(400).json({ error: 'Campo "isOpen" deve ser um booleano' });
      }

      const result = await storeRepo.setStatus(name, isOpen);
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }
      
      await logger.info('Stores.setStatus', `Loja ${name} ${isOpen ? 'aberta' : 'fechada'}`);
      res.json({ 
        message: `Loja ${isOpen ? 'aberta' : 'fechada'} com sucesso` 
      });
    } catch (error) {
      await logger.error('Stores.setStatus', error);
      res.status(500).json({ error: 'Erro ao atualizar status da loja' });
    }
  });

  router.delete('/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storeRepo.deleteById(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Loja não encontrada' });
      }
      await logger.info('Stores.delete', `Loja ${id} deletada`);
      res.json({ message: 'Loja deletada com sucesso' });
    } catch (error) {
      await logger.error('Stores.delete', error);
      res.status(500).json({ error: 'Erro ao deletar loja' });
    }
  });

  return router;
}

module.exports = createStoreRoutes;

