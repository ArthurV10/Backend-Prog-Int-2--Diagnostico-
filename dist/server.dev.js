"use strict";

require('dotenv').config(); // console.log(process.env.USER);
// console.log(process.env.DATABASE);
// console.log(process.env.PASSWORD);
// console.log(process.env.PORT_DB);
// console.log(process.env.HOST);
// Importa o framework Express


var express = require('express'); // Cria uma aplicação Express


var app = express(); // Define a porta em que o servidor irá escutar

var PORT = process.env.PORT || 3000; // Importa os arquivos de rotas

var userRoutes = require('./src/routes/user_routes.js');

var houseRoutes = require('./src/routes/house_routes.js'); // const roomRoutes = require('./src/routes/room_routes.js');
// const deviceRoutes = require('./src/routes/device_routes.js');
// const sceneRoutes = require('./src/routes/scene_routes.js')
// Permite o express ler o corpo das requisições (Consegue ler JSON no body)


app.use(express.json()); // Requisições feitas para api/user vai para userRoutes

app.use('/api/user', userRoutes);
app.use('/api/house', houseRoutes); // app.use('/api/room', roomRoutes);
// app.use('/api/device', deviceRoutes);
// app.use('/api/scene', sceneRoutes);
// Rota para o caminho raiz da API

app.get('/', function (req, res) {
  res.send('Bem-vindo à API Home Nexus!');
}); // Inicia o servidor e escuta na porta definida

app.listen(PORT, function () {
  console.log("Servidor rodando na porta ".concat(PORT, ". Acesse http://localhost:3000"));
});