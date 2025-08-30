// Importa o framework Express
const express = require('express');
// Cria uma aplicação Express
const app = express();
// Define a porta em que o servidor irá escutar
const PORT = process.env.PORT || 3000;

// Importa o arquivo rota de casas
const houseRoutes = require('./routes/house_routes.js');

// Requisições feitas para api/house vai para houseRoutes
app.use('/api/house', houseRoutes);

// Inicia o servidor e escuta na porta definida

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

