"use strict";

require('dotenv').config(); // Linha de diagnóstico final:


console.log('--- VARIÁVEIS CARREGADAS DO .ENV ---');
console.log(process.env);
console.log('-----------------------------------'); // Importa o framework Express

var express = require('express'); // Cria uma aplicação Express


var app = express(); // Define a porta em que o servidor irá escutar

var PORT = process.env.PORT || 3000; // Importa os arquivos de rotas

var houseRoutes = require('./routes/house_routes.js');

var roomRoutes = require('./routes/room_routes.js');

var deviceRoutes = require('./routes/device_routes.js');

var sceneRoutes = require('./routes/scene_routes.js'); // Permite o express ler o corpo das requisições (Consegue ler JSON no body)


app.use(express.json()); // Requisições feitas para api/house vai para houseRoutes

app.use('/api/house', houseRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/device', deviceRoutes);
app.use('/api/scene', sceneRoutes); // Rota para o caminho raiz da API

app.get('/', function (req, res) {
  res.send('Bem-vindo à API Home Nexus!');
}); // Inicia o servidor e escuta na porta definida

app.listen(PORT, function () {
  console.log("Servidor rodando na porta ".concat(PORT, ". Acesse http://localhost:3000"));
});