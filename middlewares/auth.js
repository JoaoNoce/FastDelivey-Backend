function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ 
      error: 'Não autenticado. Faça login para acessar este recurso.' 
    });
  }
  next();
}

module.exports = { requireAuth };

