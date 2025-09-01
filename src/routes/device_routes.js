const express = require('express');
const router = express.Router();

// Rotas do tipo GET

// Rota para listar todos os dispositivos
router.get('/', (req, res) => {
  res.json({message: 'Aqui estarão todos os dispositivos!'});
});

// Rotas do Tipo POST

// Rotas do Tipo PUT

// Rotas do Tipo DELETE

// Exporta o router para ser usado em outros arquivos
module.exports = router;