const express = require('express');
const router = express.Router();
const { validateOrder } = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');

function createOrderRoutes(orderRepo, logger) {
  router.get('/', async (req, res) => {
    try {
      const { status } = req.query;
      let orders;
      
      if (status) {
        orders = await orderRepo.findByStatus(status);
      } else {
        orders = await orderRepo.findAll();
      }
      
      res.json({ orders });
    } catch (error) {
      await logger.error('Orders.list', error);
      res.status(500).json({ error: 'Erro ao listar pedidos' });
    }
  });

  router.post('/', validateOrder, async (req, res) => {
    try {
      const order = await orderRepo.create(req.body);
      await logger.info('Orders.create', `Pedido criado: ${order.id}`);
      res.status(201).json({ 
        message: 'Pedido criado com sucesso',
        order 
      });
    } catch (error) {
      await logger.error('Orders.create', error);
      if (error.message.includes('obrigatório') || error.message.includes('obrigatórios')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao criar pedido' });
    }
  });

  router.post('/:id/approve', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { courierId } = req.body;
      
      if (!courierId) {
        return res.status(400).json({ error: 'courierId é obrigatório' });
      }

      const approved = await orderRepo.approve(id, courierId);
      if (!approved) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      await logger.info('Orders.approve', `Pedido ${id} aprovado e atribuído ao entregador ${courierId}`);
      res.json({ 
        message: 'Pedido aprovado e enviado para entrega com sucesso' 
      });
    } catch (error) {
      await logger.error('Orders.approve', error);
      res.status(500).json({ error: 'Erro ao aprovar pedido' });
    }
  });

  router.post('/:id/deliver', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const delivered = await orderRepo.deliver(id);
      
      if (!delivered) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      await logger.info('Orders.deliver', `Pedido ${id} marcado como entregue`);
      res.json({ 
        message: 'Pedido marcado como entregue com sucesso' 
      });
    } catch (error) {
      await logger.error('Orders.deliver', error);
      res.status(500).json({ error: 'Erro ao marcar pedido como entregue' });
    }
  });

  router.delete('/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await orderRepo.deleteById(id);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      await logger.info('Orders.delete', `Pedido ${id} deletado`);
      res.json({ message: 'Pedido deletado com sucesso' });
    } catch (error) {
      await logger.error('Orders.delete', error);
      res.status(500).json({ error: 'Erro ao deletar pedido' });
    }
  });

  return router;
}

module.exports = createOrderRoutes;

