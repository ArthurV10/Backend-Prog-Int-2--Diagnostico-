// Inicializa o framework Express
const express = require('express');

// Cria um roteador Express para as Casas
const router = express.Router();

// Rotas do tipo GET

// Rota para listar todas as casas
router.get('/', (req, res) => {
  res.json({message: 'Aqui estarão todas as casas!'});
});

// Rotas do Tipo POST

// Rotas do Tipo PUT


// Rotas do Tipo DELETE

// Exporta o router para ser usado em outros arquivos
module.exports = router;