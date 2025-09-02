"use strict";

// Inicializa o framework Express
var express = require('express'); // Cria um roteador Express para as Casas


var router = express.Router(); // Cria comunicação com o banco de dados (Importando conexão)

var pool = require('../config/database.js'); // Rota para gerenciar os cômodos (rooms) dentro de uma casa


var roomRouter = require('./room_routes.js'); // --- ROTAS DO TIPO GET ---
// Rota para listar todas as casas do usuário


router.get('/', function _callee(req, res) {
  var userId, _ref, rows;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          userId = req.userId; // Obtém o userId do objeto de requisição

          if (userId) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'User ID não fornecido'
          }));

        case 3:
          _context.prev = 3;
          _context.next = 6;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM casa WHERE user_id = $1', [userId]));

        case 6:
          _ref = _context.sent;
          rows = _ref.rows;
          res.status(200).json(rows);
          _context.next = 15;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](3);
          console.error('Erro ao buscar casas do usuário: ', _context.t0);
          res.status(500).json({
            message: 'Erro ao buscar dados do banco'
          });

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[3, 11]]);
}); // Rota para ver os detalhes de uma casa

router.get('/:id', function _callee2(req, res) {
  var userId, id, _ref2, rows;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          userId = req.userId; // Obtém o userId do objeto de requisição

          id = req.params.id;

          if (userId) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: 'User ID não fornecido'
          }));

        case 4:
          _context2.prev = 4;
          _context2.next = 7;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM casa WHERE casa_id = $1 AND user_id = $2', [id, userId]));

        case 7:
          _ref2 = _context2.sent;
          rows = _ref2.rows;

          if (!(rows.length === 0)) {
            _context2.next = 11;
            break;
          }

          return _context2.abrupt("return", res.status(404).json({
            message: 'Casa não encontrada ou não pertence ao usuário'
          }));

        case 11:
          res.status(200).json(rows[0]);
          _context2.next = 18;
          break;

        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](4);
          console.log('Erro ao buscar casa: ', _context2.t0);
          res.status(500).json({
            message: 'Erro ao buscar dados do banco'
          });

        case 18:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[4, 14]]);
}); // --- ROTAS DO TIPO POST ---
// Rota para adicionar uma nova casa

router.post('/', function _callee3(req, res) {
  var nome, userId, newHouse;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          nome = req.body.nome;
          userId = req.userId; // ÓTIMO: Usando o userId da requisição para segurança

          if (nome) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: 'O campo "nome" é obrigatório'
          }));

        case 4:
          if (userId) {
            _context3.next = 6;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: 'Não foi possível identificar o usuário da requisição'
          }));

        case 6:
          _context3.prev = 6;
          _context3.next = 9;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO casa (nome, user_id) VALUES ($1, $2) RETURNING *', [nome, userId]));

        case 9:
          newHouse = _context3.sent;
          res.status(201).json(newHouse.rows[0]);
          _context3.next = 17;
          break;

        case 13:
          _context3.prev = 13;
          _context3.t0 = _context3["catch"](6);
          console.log('Erro ao adicionar nova casa no banco: ', _context3.t0);
          res.status(500).json({
            message: 'Erro ao adicionar casa no banco'
          });

        case 17:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[6, 13]]);
}); // --- ROTAS DO TIPO PUT ---
// Rota para editar uma casa existente

router.put('/:id', function _callee4(req, res) {
  var userId, id, nome, updatedHouse;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          userId = req.userId;
          id = req.params.id;
          nome = req.body.nome;

          if (nome) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: 'O campo "nome" é obrigatório.'
          }));

        case 5:
          _context4.prev = 5;
          _context4.next = 8;
          return regeneratorRuntime.awrap(pool.query('UPDATE casa SET nome = $1 WHERE casa_id = $2 AND user_id = $3 RETURNING *', [nome, id, userId]));

        case 8:
          updatedHouse = _context4.sent;

          if (!(updatedHouse.rows.length === 0)) {
            _context4.next = 11;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            message: 'Casa não encontrada ou não pertence ao usuário.'
          }));

        case 11:
          res.status(200).json(updatedHouse.rows[0]);
          _context4.next = 18;
          break;

        case 14:
          _context4.prev = 14;
          _context4.t0 = _context4["catch"](5);
          console.error('Erro ao editar casa:', _context4.t0);
          res.status(500).json({
            message: 'Erro ao editar casa no banco'
          });

        case 18:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[5, 14]]);
}); // --- ROTAS DO TIPO DELETE ---
// Rota para deletar uma casa existente

router["delete"]('/:id', function _callee5(req, res) {
  var id, userId, deleteHouse;
  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          id = req.params.id;
          userId = req.userId;

          if (userId) {
            _context5.next = 4;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: 'User ID não fornecido.'
          }));

        case 4:
          _context5.prev = 4;
          _context5.next = 7;
          return regeneratorRuntime.awrap(pool.query('DELETE FROM casa WHERE casa_id = $1 AND user_id = $2 RETURNING *', [id, userId]));

        case 7:
          deleteHouse = _context5.sent;

          if (!(deleteHouse.rows.length === 0)) {
            _context5.next = 10;
            break;
          }

          return _context5.abrupt("return", res.status(404).json({
            message: 'Casa não encontrada ou não pertence ao usuário.'
          }));

        case 10:
          res.status(200).json({
            message: 'Casa deletada com sucesso!'
          });
          _context5.next = 17;
          break;

        case 13:
          _context5.prev = 13;
          _context5.t0 = _context5["catch"](4);
          console.error('Erro ao deletar casa:', _context5.t0);
          res.status(500).json({
            message: 'Erro ao deletar casa no banco'
          });

        case 17:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[4, 13]]);
}); // Rota para ser utilizada como "ponte" para os cômodos

router.use('/:casaId/comodos', function (req, res, next) {
  // Anexa o ID da casa na requisição para que o próximo roteador possa usá-lo
  req.casaId = req.params.casaId;
  next();
}, roomRouter); // Exporta o router para ser usado em outros arquivos

module.exports = router;