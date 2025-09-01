require('dotenv').config();

// Linha de diagnóstico final:
console.log('--- VARIÁVEIS CARREGADAS DO .ENV ---');
console.log(process.env);
console.log('-----------------------------------');

// Importa o framework Express
const express = require('express');

// Cria uma aplicação Express
const app = express();

// Define a porta em que o servidor irá escutar
const PORT = process.env.PORT || 3000;

// Importa os arquivos de rotas
const houseRoutes = require('./src/routes/house_routes.js');
const roomRoutes = require('./src/routes/room_routes.js');
const deviceRoutes = require('./src/routes/device_routes.js');
const sceneRoutes = require('./src/routes/scene_routes.js');

// Permite o express ler o corpo das requisições (Consegue ler JSON no body)
app.use(express.json());

// Requisições feitas para api/house vai para houseRoutes
app.use('/api/house', houseRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/scene', sceneRoutes);

// Rota para o caminho raiz da API
app.get('/', (req, res) => {
  res.send('Bem-vindo à API Home Nexus!');
});

// Inicia o servidor e escuta na porta definida
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}. Acesse http://localhost:3000`);
});

