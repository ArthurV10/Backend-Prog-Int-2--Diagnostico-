// src/routes/comodo_routes.js

const express = require('express');
const router = express.Router();
const pool = require('../config/database.js');

// Rota para gerenciar os dispositivos dentro de um cômodo
const deviceRouter = require('./device_routes.js');

// ROTAS DO TIPO GET

// Rota para LISTAR todos os cômodos de uma casa específica
// Ex: GET /api/user/1/houses/5/comodos
router.get('/', async (req, res) => {
  // Pega o ID da casa que foi injetado pelo roteador anterior (house_routes.js)
  const { casaId } = req; 

  if (!casaId) {
    return res.status(400).json({ message: 'ID da casa não fornecido na rota.' });
  }

  try {
    const { rows } = await pool.query('SELECT * FROM comodo WHERE casa_id = $1', [casaId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar cômodos da casa:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do banco' });
  }
});

// Rota para PEGAR os detalhes de um cômodo específico
// Ex: GET /api/user/1/houses/5/comodos/10
router.get('/:id', async (req, res) => {
  const { casaId } = req; // ID da casa vindo da "ponte"
  const { id } = req.params; // ID do cômodo vindo da URL

  if (!casaId) {
    return res.status(400).json({ message: 'ID da casa não fornecido na rota.' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM comodo WHERE id = $1 AND casa_id = $2', [id, casaId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cômodo não encontrado ou não pertence a esta casa.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar cômodo:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do banco' });
  }
});

// ROTAS DO TIPO POST

// Rota para ADICIONAR um novo cômodo a uma casa específica
// Ex: POST /api/user/1/houses/5/comodos
router.post('/', async (req, res) => {
  const { nome } = req.body;
  const { casaId } = req; // ID da casa vindo da "ponte"
  if (!nome) {
    return res.status(400).json({ message: 'O campo "nome" é obrigatório' });
  }
  if (!casaId) {
    return res.status(400).json({ message: 'ID da casa não fornecido na rota.' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO comodo (nome, casa_id) VALUES ($1, $2) RETURNING *',
      [nome, casaId]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar cômodo:', error);
    res.status(500).json({ message: 'Erro ao adicionar cômodo ao banco' });
  }
});

// ROTAS DO TIPO PUT
// Rota para ATUALIZAR um cômodo específico
router.put('/:id', async (req, res) => {
  const { nome } = req.body;
  const { casaId } = req; // ID da casa vindo da "ponte"
  const { id } = req.params; // ID do cômodo vindo da URL
  if (!nome) {
    return res.status(400).json({ message: 'O campo "nome" é obrigatório' });
  }
  if (!casaId) {
    return res.status(400).json({ message: 'ID da casa não fornecido na rota.' });
  }
  try {
    const { rows } = await pool.query(
      'UPDATE comodo SET nome = $1 WHERE id = $2 AND casa_id = $3 RETURNING *',
      [nome, id, casaId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cômodo não encontrado ou não pertence a esta casa.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar cômodo:', error);
    res.status(500).json({ message: 'Erro ao atualizar cômodo no banco' });
  }
});

// ROTAS DO TIPO DELETE
// Rota para DELETAR um cômodo específico
router.delete('/:id', async (req, res) => {
  const { casaId } = req;
  const { id } = req.params; // ID do cômodo vindo da URL
  if (!casaId) {
    return res.status(400).json({ message: 'ID da casa não fornecido na rota.' });
  }
  try {
    const { rows } = await pool.query(
      'DELETE FROM comodo WHERE id = $1 AND casa_id = $2 RETURNING *',
      [id, casaId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cômodo não encontrado ou não pertence a esta casa.' });
    }
    res.status(200).json({ message: 'Cômodo deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar cômodo:', error);
    res.status(500).json({ message: 'Erro ao deletar cômodo no banco' });
  }
});

// Rota para ser utilizada como "ponte" para os dispositivos
router.use('/:comodoId/dispositivos', (req, res, next) => {
  // Anexa o ID do cômodo na requisição para que o próximo roteador possa usá-lo
  req.comodoId = req.params.comodoId;
  next();
}, deviceRouter);

module.exports = router;