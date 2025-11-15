const express = require('express');
const router = express.Router();
const { validateCourier } = require('../middlewares/validation');
const { requireAuth } = require('../middlewares/auth');

function createCourierRoutes(courierRepo, logger) {
  router.get('/available', async (req, res) => {
    try {
      const couriers = await courierRepo.findAvailable();
      res.json({ couriers });
    } catch (error) {
      await logger.error('Couriers.findAvailable', error);
      res.status(500).json({ error: 'Erro ao listar entregadores disponíveis' });
    }
  });

  router.post('/', requireAuth, validateCourier, async (req, res) => {
    try {
      const courier = await courierRepo.create(req.body);
      await logger.info('Couriers.create', `Entregador criado: ${courier.name}`);
      res.status(201).json({ 
        message: 'Entregador criado com sucesso',
        courier 
      });
    } catch (error) {
      await logger.error('Couriers.create', error);
      if (error.message.includes('obrigatório')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao criar entregador' });
    }
  });

  router.patch('/:id/availability', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { available } = req.body;
      
      if (typeof available !== 'boolean') {
        return res.status(400).json({ error: 'Campo "available" deve ser um booleano' });
      }

      const result = await courierRepo.setAvailability(id, available);
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Entregador não encontrado' });
      }
      
      await logger.info('Couriers.setAvailability', `Entregador ${id} ${available ? 'disponível' : 'indisponível'}`);
      res.json({ 
        message: `Disponibilidade atualizada com sucesso` 
      });
    } catch (error) {
      await logger.error('Couriers.setAvailability', error);
      res.status(500).json({ error: 'Erro ao atualizar disponibilidade' });
    }
  });

  router.delete('/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await courierRepo.deleteById(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Entregador não encontrado' });
      }
      await logger.info('Couriers.delete', `Entregador ${id} deletado`);
      res.json({ message: 'Entregador deletado com sucesso' });
    } catch (error) {
      await logger.error('Couriers.delete', error);
      res.status(500).json({ error: 'Erro ao deletar entregador' });
    }
  });

  return router;
}

module.exports = createCourierRoutes;

