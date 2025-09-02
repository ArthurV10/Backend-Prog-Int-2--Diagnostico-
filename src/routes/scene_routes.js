// Inicializa o framework Express
const express = require('express');

// Cria um roteador Express para as Casas
const router = express.Router();

// Cria comunicação com o banco de dados (Importando conxeão)
const pool = require('../config/database.js');
const { errorMonitor } = require('events');


// Rotas do tipo GET

// Rota para listar todas as casas
router.get('/', async (req, res) => {
  try {
    const {rows} = await pool.query('SELECT * FROM casa');
    res.status(200).json(rows);
  }
  catch (error) {
    console.error('Erro ao buscar casas: ', error);
    res.status(500).json({message: 'Erro ao buscar dados do banco'});
  }
});

// Rota para ver os detalhes de uma casa
// GET /api/casas/:id
router.get('/:id', async(req, res) => {
  const {id} = req.params;
  try{
    const {rows} = await pool.query('SELECT CASA_ID FROM CASA WHERE ID = $1', [id]);
    if (rows.length === 0){
      return res.status(404).json({message: 'Casa não encontrada'});
    }

    res.status(200).json(rows[0]);
  }
  catch (error){
    console.log('Erro ao buscar casa: ', error);
    res.status(500).json({message: 'Erro ao buscar dados do banco'});
  }
});


// Rotas do Tipo POST

// Rota para adicionar uma nova casa
router.post('/', async(req, res) =>{
  // Pega os dados da requisição, JSON no body
  const {nome, user_id} = req.body;
  
  if(!nome){
    return res.status(400).json({message: 'O campo "nome" é obrigatório'});
  }
  if(!user_id){
    return res.status(400).json({message: 'O campo "user_id" é obrigatório'});
  }
  try{
    const newHouse = await pool.query('INSERT INTO CASA (NOME, USER_ID) VALUES ($1, $2) RETURNING *',
      [nome, user_id]
    );
    res.status(201).json(newHouse.rows[0]);
  }
  catch (error){
    console.log('Erro ao adicionar nova casa no banco: ', error);
    res.status(500).json({message: 'Erro ao adicionar casa no banco'});
  }
});

// Rotas do Tipo PUT

// EDITAR (atualizar) uma casa existente
// PUT /api/casas/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body; 

  if (!nome) {
    return res.status(400).json({ message: 'O campo "nome" é obrigatório.' });
  }

  try {
    const updatedHouse = await pool.query(
      'UPDATE Casa SET nome = $1 WHERE id = $2 RETURNING *',
      [nome, id]
    );

    if (updatedHouse.rows.length === 0) {
      return res.status(404).json({ message: 'Casa não encontrada.' });
    }

    res.status(200).json(updatedHouse.rows[0]);

  } catch (error) {
    console.error('Erro ao editar casa:', error);
    res.status(500).json({ message: 'Erro ao editar casa no banco' });
  }
});

// Rotas do Tipo DELETE

// Rota para deletar uma casa existente
// DELETE /api/casas/:id
router.delete('/:id', async (req, res) =>{
  const {id} = req.params;
  try{
    const deleteHouse = await pool.query('DELETE FROM CASA WHERE ID = $1 RETURNING *', [id]);
    if (deleteHouse.rows.length === 0){
      return res.status(404).json({message: 'Casa não encontrada'});
    }
    res.status(200).json({message: 'Casa deletada com sucesso!'});
  } catch (error) {
    console.error('Erro ao deletar casa:', error);
    res.status(500).json({ message: 'Erro ao deletar casa no banco' });
  }
});