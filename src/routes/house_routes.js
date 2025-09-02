// Inicializa o framework Express
const express = require('express');

// Cria um roteador Express para as Casas
const router = express.Router();

// Cria comunicação com o banco de dados (Importando conexão)
const pool = require('../config/database.js');

// --- ROTAS DO TIPO GET ---

// Rota para listar todas as casas do usuário
router.get('/', async (req, res) => {
  const userId = req.userId; // Obtém o userId do objeto de requisição
  if (!userId) {
    return res.status(400).json({ message: 'User ID não fornecido' });
  }
  try {
    // AJUSTE: Padronizando para minúsculas
    const { rows } = await pool.query('SELECT * FROM casa WHERE user_id = $1', [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar casas do usuário: ', error);
    res.status(500).json({ message: 'Erro ao buscar dados do banco' });
  }
});

// Rota para ver os detalhes de uma casa
router.get('/:id', async (req, res) => {
  const userId = req.userId; // Obtém o userId do objeto de requisição
  const { id } = req.params;
  if (!userId) {
    return res.status(400).json({ message: 'User ID não fornecido' });
  }
  try {
    // AJUSTE: Selecionando todas as colunas (*) e padronizando para minúsculas
    const { rows } = await pool.query('SELECT * FROM casa WHERE id = $1 AND user_id = $2', [id, userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Casa não encontrada ou não pertence ao usuário' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.log('Erro ao buscar casa: ', error);
    res.status(500).json({ message: 'Erro ao buscar dados do banco' });
  }
});

// --- ROTAS DO TIPO POST ---

// Rota para adicionar uma nova casa
router.post('/', async (req, res) => {
  const { nome } = req.body;
  const userId = req.userId; // ÓTIMO: Usando o userId da requisição para segurança

  if (!nome) {
    return res.status(400).json({ message: 'O campo "nome" é obrigatório' });
  }
  if (!userId) {
    // Esta validação é uma segurança extra
    return res.status(400).json({ message: 'Não foi possível identificar o usuário da requisição' });
  }
  try {
    // AJUSTE: Padronizando para minúsculas
    const newHouse = await pool.query(
      'INSERT INTO casa (nome, user_id) VALUES ($1, $2) RETURNING *',
      [nome, userId]
    );
    res.status(201).json(newHouse.rows[0]);
  } catch (error) {
    console.log('Erro ao adicionar nova casa no banco: ', error);
    res.status(500).json({ message: 'Erro ao adicionar casa no banco' });
  }
});

// --- ROTAS DO TIPO PUT ---

// Rota para editar uma casa existente
router.put('/:id', async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).json({ message: 'O campo "nome" é obrigatório.' });
  }
  try {
    // AJUSTE: Padronizando para minúsculas
    const updatedHouse = await pool.query(
      'UPDATE casa SET nome = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [nome, id, userId]
    );
    if (updatedHouse.rows.length === 0) {
      return res.status(404).json({ message: 'Casa não encontrada ou não pertence ao usuário.' });
    }
    res.status(200).json(updatedHouse.rows[0]);
  } catch (error) {
    console.error('Erro ao editar casa:', error);
    res.status(500).json({ message: 'Erro ao editar casa no banco' });
  }
});

// --- ROTAS DO TIPO DELETE ---

// Rota para deletar uma casa existente
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  if (!userId) {
    return res.status(400).json({ message: 'User ID não fornecido.' });
  }
  try {
    // AJUSTE: Padronizando para minúsculas
    const deleteHouse = await pool.query('DELETE FROM casa WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
    if (deleteHouse.rows.length === 0) {
      return res.status(404).json({ message: 'Casa não encontrada ou não pertence ao usuário.' });
    }
    res.status(200).json({ message: 'Casa deletada com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar casa:', error);
    res.status(500).json({ message: 'Erro ao deletar casa no banco' });
  }
});


// Exporta o router para ser usado em outros arquivos
module.exports = router;