// Em routes/usuario.routes.js
const express = require('express');
const router = express.Router();
const houseRouter = require('./house_routes.js');

// Redireciona requisições para /api/usuarios/:usuarioId/casas para o roteador de casas
router.use('/:userId/houses', (req, res, next) => {
  // Adiciona o userId ao objeto de requisição para que o próximo roteador possa usá-lo
  req.userId = req.params.userId;
  next();
}, houseRouter);

module.exports = router;