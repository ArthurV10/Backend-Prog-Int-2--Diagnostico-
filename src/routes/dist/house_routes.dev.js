"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// Inicializa o framework Express
var express = require('express'); // Cria um roteador Express para as Casas


var router = express.Router(); // Cria comunicação com o banco de dados (Importando conxeão)

var pool = require('../config/database.js');

var _require = require('events'),
    errorMonitor = _require.errorMonitor; // Rotas do tipo GET
// Rota para listar todas as casas


router.get('/', function _callee(req, res) {
  var _ref, rows;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          _context.next = 3;
          return regeneratorRuntime.awrap(pool.query('SELECT * FROM casa'));

        case 3:
          _ref = _context.sent;
          rows = _ref.rows;
          res.status(200).json(rows);
          _context.next = 12;
          break;

        case 8:
          _context.prev = 8;
          _context.t0 = _context["catch"](0);
          console.error('Erro ao buscar casas: ', _context.t0);
          res.status(500).json({
            message: 'Erro ao buscar dados do banco'
          });

        case 12:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[0, 8]]);
}); // Rota para ver os detalhes de uma casa

router.get('/:id', function _callee2(req, res) {
  var id, _ref2, rows;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          id = req.params.id;
          _context2.prev = 1;
          _context2.next = 4;
          return regeneratorRuntime.awrap(pool.query('SELECT CASA_ID FROM CASA WHERE ID = $1', [id]));

        case 4:
          _ref2 = _context2.sent;
          rows = _ref2.rows;

          if (!(rows.length === 0)) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", res.status(404).json({
            message: 'Casa não encontrada'
          }));

        case 8:
          res.status(200).json(rows[0]);
          _context2.next = 15;
          break;

        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](1);
          console.log('Erro ao buscar casa: ', _context2.t0);
          res.status(500).json({
            message: 'Erro ao buscar dados do banco'
          });

        case 15:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 11]]);
}); // Rotas do Tipo POST
// Rota para adicionar uma nova casa

router.post('/', function _callee3(req, res) {
  var _req$body, nome, user_id, newHouse;

  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // Pega os dados da requisição, JSON no body
          _req$body = req.body, nome = _req$body.nome, user_id = _req$body.user_id;

          if (nome) {
            _context3.next = 3;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: 'O campo "nome" é obrigatório'
          }));

        case 3:
          if (user_id) {
            _context3.next = 5;
            break;
          }

          return _context3.abrupt("return", res.status(400).json({
            message: 'O campo "user_id" é obrigatório'
          }));

        case 5:
          _context3.prev = 5;
          _context3.next = 8;
          return regeneratorRuntime.awrap(pool.query('INSERT INTO CASA (NOME, USER_ID) VALUES ($1, $2) RETURNING *', [nome, user_id]));

        case 8:
          newHouse = _context3.sent;
          res.status(201).json(newHouse.rows[0]);
          _context3.next = 16;
          break;

        case 12:
          _context3.prev = 12;
          _context3.t0 = _context3["catch"](5);
          console.log('Erro ao adicionar nova casa no banco: ', _context3.t0);
          res.status(500).json({
            message: 'Erro ao adicionar casa no banco'
          });

        case 16:
        case "end":
          return _context3.stop();
      }
    }
  }, null, null, [[5, 12]]);
}); // Rotas do Tipo PUT
// Editar informações de casa

router.put('/', function _callee4(req, res) {
  var _req$body2, newName, casa_id, updatedHouse;

  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _req$body2 = _slicedToArray(req.body, 2), newName = _req$body2[0], casa_id = _req$body2[1];

          if (!newName) {
            _context4.next = 3;
            break;
          }

          return _context4.abrupt("return", res.status(400).json({
            message: 'O campo "Novo Nome" é obrigatório'
          }));

        case 3:
          _context4.next = 5;
          return regeneratorRuntime.awrap(pool.query('UPDATE CASA SET NOME = $1 WHERE CASA_ID = $2 RETURNIG NOME', [newName, casa_id]));

        case 5:
          updatedHouse = _context4.sent;
          res.status(200).json(updatedHouse.rows[0]);

        case 7:
        case "end":
          return _context4.stop();
      }
    }
  });
}); // Rotas do Tipo DELETE
// Exporta o router para ser usado em outros arquivos

module.exports = router;