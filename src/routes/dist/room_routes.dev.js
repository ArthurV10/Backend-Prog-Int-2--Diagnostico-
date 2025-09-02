"use strict";

// src/routes/comodo_routes.js
var express = require('express');

var router = express.Router();

var pool = require('../config/database.js'); // Rota para gerenciar os dispositivos dentro de um cômodo


var deviceRouter = require('./device_routes.js'); // ROTAS DO TIPO GET
// Rota para LISTAR todos os cômodos de uma casa específica
// Ex: GET /api/user/1/houses/5/comodos


router.get('/', function _callee(req, res) {
  var casaId, _ref, rows;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // Pega o ID da casa que foi injetado pelo roteador anterior (house_routes.js)
          casaId = req.casaId;

          if (casaId) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", res.status(400).json({
            message: 'ID da casa não fornecido na rota.'
          }));

        case 3:
          _context.prev = 3;
          _context.next = 6;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM comodo WHERE casa_id = $1', [casaId]));

        case 6:
          _ref = _context.sent;
          rows = _ref.rows;
          res.status(200).json(rows);
          _context.next = 15;
          break;

        case 11:
          _context.prev = 11;
          _context.t0 = _context["catch"](3);
          console.error('Erro ao buscar cômodos da casa:', _context.t0);
          res.status(500).json({
            message: 'Erro ao buscar dados do banco'
          });

        case 15:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[3, 11]]);
}); // Rota para PEGAR os detalhes de um cômodo específico
// Ex: GET /api/user/1/houses/5/comodos/10

router.get('/:id', function _callee2(req, res) {
  var casaId, id, _ref2, rows;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          casaId = req.casaId; // ID da casa vindo da "ponte"

          id = req.params.id; // ID do cômodo vindo da URL

          if (casaId) {
            _context2.next = 4;
            break;
          }

          return _context2.abrupt("return", res.status(400).json({
            message: 'ID da casa não fornecido na rota.'
          }));

        case 4:
          _context2.prev = 4;
          _context2.next = 7;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM comodo WHERE id = $1 AND casa_id = $2', [id, casaId]));

        case 7:
          _ref2 = _context2.sent;
          rows = _ref2.rows;

          if (!(rows.length === 0)) {
            _context2.next = 11;
            break;
          }

          return _context2.abrupt("return", res.status(404).json({
            message: 'Cômodo não encontrado ou não pertence a esta casa.'
          }));

        case 11:
          res.status(200).json(rows[0]);
          _context2.next = 18;
          break;

        case 14:
          _context2.prev = 14;
          _context2.t0 = _context2["catch"](4);
          console.error('Erro ao buscar cômodo:', _context2.t0);
          res.status(500).json({
            message: 'Erro ao buscar dados do banco'
          });

        case 18:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[4, 14]]);
}); // ROTAS DO TIPO POST
// Rota para ADICIONAR um novo cômodo a uma casa específica
// Ex: POST /api/user/1/houses/5/comodos

router.post('/', function _callee3(req, res) {
  var nome, casaId, _ref3, rows;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          nome = req.body.nome;
          casaId = req.casaId; // ID da casa vindo da "ponte"

          if (nome) {
            _context3.next = 4;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: 'O campo "nome" é obrigatório'
          }));

        case 4:
          if (casaId) {
            _context3.next = 6;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: 'ID da casa não fornecido na rota.'
          }));

        case 6:
          _context3.prev = 6;
          _context3.next = 9;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO comodo (nome, casa_id) VALUES ($1, $2) RETURNING *', [nome, casaId]));

        case 9:
          _ref3 = _context3.sent;
          rows = _ref3.rows;
          res.status(201).json(rows[0]);
          _context3.next = 18;
          break;

        case 14:
          _context3.prev = 14;
          _context3.t0 = _context3["catch"](6);
          console.error('Erro ao adicionar cômodo:', _context3.t0);
          res.status(500).json({
            message: 'Erro ao adicionar cômodo ao banco'
          });

        case 18:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[6, 14]]);
}); // ROTAS DO TIPO PUT
// Rota para ATUALIZAR um cômodo específico

router.put('/:id', function _callee4(req, res) {
  var nome, casaId, id, _ref4, rows;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          nome = req.body.nome;
          casaId = req.casaId; // ID da casa vindo da "ponte"

          id = req.params.id; // ID do cômodo vindo da URL

          if (nome) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: 'O campo "nome" é obrigatório'
          }));

        case 5:
          if (casaId) {
            _context4.next = 7;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: 'ID da casa não fornecido na rota.'
          }));

        case 7:
          _context4.prev = 7;
          _context4.next = 10;
          return regeneratorRuntime.awrap(pool.query('UPDATE comodo SET nome = $1 WHERE id = $2 AND casa_id = $3 RETURNING *', [nome, id, casaId]));

        case 10:
          _ref4 = _context4.sent;
          rows = _ref4.rows;

          if (!(rows.length === 0)) {
            _context4.next = 14;
            break;
          }

          return _context4.abrupt("return", res.status(404).json({
            message: 'Cômodo não encontrado ou não pertence a esta casa.'
          }));

        case 14:
          res.status(200).json(rows[0]);
          _context4.next = 21;
          break;

        case 17:
          _context4.prev = 17;
          _context4.t0 = _context4["catch"](7);
          console.error('Erro ao atualizar cômodo:', _context4.t0);
          res.status(500).json({
            message: 'Erro ao atualizar cômodo no banco'
          });

        case 21:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[7, 17]]);
}); // ROTAS DO TIPO DELETE
// Rota para DELETAR um cômodo específico

router["delete"]('/:id', function _callee5(req, res) {
  var casaId, id, _ref5, rows;

  return regeneratorRuntime.async(function _callee5$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          casaId = req.casaId;
          id = req.params.id; // ID do cômodo vindo da URL

          if (casaId) {
            _context5.next = 4;
            break;
          }

          return _context5.abrupt("return", res.status(400).json({
            message: 'ID da casa não fornecido na rota.'
          }));

        case 4:
          _context5.prev = 4;
          _context5.next = 7;
          return regeneratorRuntime.awrap(pool.query('DELETE FROM comodo WHERE id = $1 AND casa_id = $2 RETURNING *', [id, casaId]));

        case 7:
          _ref5 = _context5.sent;
          rows = _ref5.rows;

          if (!(rows.length === 0)) {
            _context5.next = 11;
            break;
          }

          return _context5.abrupt("return", res.status(404).json({
            message: 'Cômodo não encontrado ou não pertence a esta casa.'
          }));

        case 11:
          res.status(200).json({
            message: 'Cômodo deletado com sucesso!'
          });
          _context5.next = 18;
          break;

        case 14:
          _context5.prev = 14;
          _context5.t0 = _context5["catch"](4);
          console.error('Erro ao deletar cômodo:', _context5.t0);
          res.status(500).json({
            message: 'Erro ao deletar cômodo no banco'
          });

        case 18:
        case "end":
          return _context5.stop();
      }
    }
  }, null, null, [[4, 14]]);
}); // Rota para ser utilizada como "ponte" para os dispositivos

router.use('/:comodoId/dispositivos', function (req, res, next) {
  // Anexa o ID do cômodo na requisição para que o próximo roteador possa usá-lo
  req.comodoId = req.params.comodoId;
  next();
}, deviceRouter);
module.exports = router;