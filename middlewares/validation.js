function validateStore(req, res, next) {
  const { name, category } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Nome da loja é obrigatório');
  }
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Categoria é obrigatória');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
}

function validateCourier(req, res, next) {
  const { name } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Nome do entregador é obrigatório');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
}

function validateOrder(req, res, next) {
  const { storeId, customerName, items } = req.body;
  const errors = [];

  if (!storeId) {
    errors.push('storeId é obrigatório');
  }
  if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
    errors.push('Nome do cliente é obrigatório');
  }
  if (!Array.isArray(items) || items.length === 0) {
    errors.push('Itens são obrigatórios e devem ser um array não vazio');
  } else {
    items.forEach((item, index) => {
      if (!item.name) errors.push(`Item ${index + 1}: nome é obrigatório`);
      if (!item.qty || item.qty <= 0) errors.push(`Item ${index + 1}: quantidade deve ser maior que zero`);
      if (!item.price || item.price <= 0) errors.push(`Item ${index + 1}: preço deve ser maior que zero`);
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
}

function validateLogin(req, res, next) {
  const { username, password } = req.body;
  const errors = [];

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    errors.push('Username é obrigatório');
  }
  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Senha é obrigatória');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
}

module.exports = {
  validateStore,
  validateCourier,
  validateOrder,
  validateLogin
};

