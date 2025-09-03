"use strict";

// Em routes/usuario.routes.js
var express = require('express');

var router = express.Router();

var houseRouter = require('./house_routes.js'); // Redireciona requisições para /api/usuarios/:usuarioId/casas para o roteador de casas


router.use('/:userId/house', function (req, res, next) {
  // Adiciona o userId ao objeto de requisição para que o próximo roteador possa usá-lo
  req.userId = req.params.userId;
  next();
}, houseRouter);
module.exports = router;