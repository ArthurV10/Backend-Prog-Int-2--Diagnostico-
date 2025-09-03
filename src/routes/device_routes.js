// src/routes/comodo_routes.js

const express = require('express');
const router = express.Router();
const pool = require('../config/database.js');

// ROTAS DO TIPO GET

// Rota para LISTAR todos os dispositivos de um cômodo específico
// Ex: GET /api/user/1/houses/5/comodos/10/devices
router.get('/', async (req, res) => {
  // Pega o ID do cômodo que foi injetado pelo roteador anterior (house_routes.js)
  const { comodoId } = req;
  if (!comodoId) {
    return res.status(400).json({ message: 'ID do cômodo não fornecido na rota.' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM dispositivo WHERE comodo_id = $1', [comodoId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar dispositivos do cômodo:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do banco' });
  }
});

// Rota para PEGAR os detalhes de um dispositivo específico
// Ex: GET /api/user/1/houses/5/comodos/10/devices/15
router.get('/:id', async (req, res) => {
  const { comodoId } = req; // ID do cômodo vindo da "ponte"
  const { id } = req.params; // ID do dispositivo vindo da URL

  if (!comodoId) {
    return res.status(400).json({ message: 'ID do cômodo não fornecido na rota.' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM dispositivo WHERE comodo_id = $1 AND dispos_id = $2', [comodoId, id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dispositivo não encontrado.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar dispositivo do cômodo:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do banco' });
  }
});

// ROTAS DO TIPO POST

// Rota para ADICIONAR um novo dispositivo a um cômodo específico
// Ex: POST /api/user/1/houses/5/comodos/10/devices
router.post('/', async (req, res) => {
  const { nome, tipo } = req.body;
  const { comodoId } = req; // ID do cômodo vindo da "ponte"
  if (!nome) {
    return res.status(400).json({ message: 'O campo "nome" é obrigatório' });
  }
  try {
    const { rows } = await pool.query('INSERT INTO dispositivo (nome, tipo, comodo_id) VALUES ($1, $2, $3) RETURNING *',
      [nome, tipo, comodoId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar dispositivo ao cômodo:', error);
    res.status(500).json({ message: 'Erro ao adicionar dados ao banco' });
  }
});

// ROTAS DO TIPO PUT

// Rota para ATUALIZAR um dispositivo específico em um cômodo
// Ex: PUT /api/user/1/houses/5/comodos/10/devices/15
// Pode receber 'nome', 'ligado', ou ambos.
router.put('/:id', async (req, res) => {
  const { comodoId } = req;     // ID do cômodo vindo da "ponte"
  const { id } = req.params;   // ID do dispositivo vindo da URL
  const { nome, ligado } = req.body; // Campos que podem ser atualizados

  // Verifica se pelo menos um campo foi enviado para atualização
  if (nome === undefined && ligado === undefined) {
    return res.status(400).json({ message: 'Nenhum dado fornecido para atualização.' });
  }

  // --- Lógica para construir a query dinâmica ---
  const camposParaAtualizar = [];
  const valores = [];
  let contadorDeParametros = 1;

  if (nome !== undefined) {
    camposParaAtualizar.push(`nome = $${contadorDeParametros}`);
    valores.push(nome);
    contadorDeParametros++;
  }

  if (ligado !== undefined) {
    camposParaAtualizar.push(`ligado = $${contadorDeParametros}`);
    valores.push(ligado);
    contadorDeParametros++;
  }
  // --- Fim da lógica da query ---

  // Adiciona os IDs para a cláusula WHERE
  valores.push(id);
  valores.push(comodoId);

  const querySQL = `
    UPDATE dispositivo 
    SET ${camposParaAtualizar.join(', ')} 
    WHERE dispos_id = $${contadorDeParametros} AND comodo_id = $${contadorDeParametros + 1} 
    RETURNING *
  `; 
  try {
    const { rows } = await pool.query(querySQL, valores);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dispositivo não encontrado ou não pertence a este cômodo.' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar dispositivo:', error);
    res.status(500).json({ message: 'Erro ao atualizar dados no banco' });
  }
});


// ROTAS DO TIPO DELETE
// Rota para DELETAR um dispositivo específico de um cômodo
// Ex: DELETE /api/user/1/houses/5/comodos/10/devices/15
router.delete('/:id', async (req, res) => {
  const { comodoId } = req; // ID do cômodo vindo da "ponte"
  const { id } = req.params; // ID do dispositivo vindo da URL
  try {
    const { rows } = await pool.query('DELETE FROM dispositivo WHERE dispos_id = $1 AND comodo_id = $2 RETURNING *', [id, comodoId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Dispositivo não encontrado ou não pertence a este cômodo.' });
    }
    res.status(204).send(); // Resposta vazia para sucesso
  } catch (error) {
    console.error('Erro ao deletar dispositivo:', error);
    res.status(500).json({ message: 'Erro ao deletar dados no banco' });
  }
});

module.exports = router;