const express = require('express');
const router = express.Router();

// Rotas do tipo GET

// Rota para listar todos os cômodos
router.get('/', (req, res) => {
  res.send('Aqui estarão todos os cômodos!');
});

// Rotas do Tipo POST

// Rotas do Tipo PUT

// Rotas do Tipo DELETE

// Exporta o router para ser usado em outros arquivos
module.exports = router