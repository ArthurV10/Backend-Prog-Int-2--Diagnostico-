const express = require('express');
const router = express.Router();
const pool = require('../config/database.js');
const houseRouter = require('./house_routes.js');
const bcrypt = require('bcrypt');

// --- ROTAS CRUD PARA O USUÁRIO ---

// ROTA POST: Criar um novo usuário (com senha segura)
router.post('/', async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Os campos nome, email e senha são obrigatórios.' });
    }

    try {
        // Criptografa a senha antes de salvar
        const saltRounds = 10;
        const senhaHash = await bcrypt.hash(senha, saltRounds);

        const newUser = await pool.query(
            'INSERT INTO usuario (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING user_id, nome, email, criado_em',
            [nome, email, senhaHash] // Salva o hash da senha, não a senha original
        );
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ message: 'Erro ao salvar usuário no banco' });
    }
});  

// ROTA GET: Visualizar detalhes de um usuário específico
// Ex: GET /api/user/1
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Selecionamos colunas específicas para não retornar a senha
    const { rows } = await pool.query('SELECT user_id, nome, email, criado_em FROM usuario WHERE user_id = $1', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do banco' });
  }
});

// ROTA POST: Autenticar (Login) um usuário
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        const { rows } = await pool.query('SELECT * FROM usuario WHERE email = $1', [email]);
        const user = rows[0];

        // Se o usuário não for encontrado, retorne um erro genérico
        if (!user) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // Compara a senha enviada com o hash salvo no banco
        const senhaValida = await bcrypt.compare(senha, user.senha_hash);

        if (!senhaValida) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // Se o login for bem-sucedido, retorne os dados do usuário (sem a senha)
        const { senha_hash, ...userData } = user;
        res.status(200).json(userData);

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno no servidor.' });
    }
});

// ROTA PUT: Atualizar um usuário existente (nome e email)
// Ex: PUT /api/user/1
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  if (!nome && !email) {
    return res.status(400).json({ message: 'Forneça pelo menos um campo (nome ou email) para atualizar.' });
  }

  // Lógica para construir a query dinâmica (igual fizemos para dispositivos)
  const camposParaAtualizar = [];
  const valores = [];
  let contador = 1;

  if (nome) {
    camposParaAtualizar.push(`nome = $${contador++}`);
    valores.push(nome);
  }
  if (email) {
    camposParaAtualizar.push(`email = $${contador++}`);
    valores.push(email);
  }

  valores.push(id); // Adiciona o ID do usuário como último parâmetro

  const querySQL = `UPDATE usuario SET ${camposParaAtualizar.join(', ')} WHERE user_id = $${contador} RETURNING user_id, nome, email, criado_em`;

  try {
    const updatedUser = await pool.query(querySQL, valores);
    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(200).json(updatedUser.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar dados do banco' });
  }
});

// ROTA DELETE: Apagar um usuário
// Ex: DELETE /api/user/1
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await pool.query('DELETE FROM usuario WHERE user_id = $1 RETURNING *', [id]);
    if (deletedUser.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }
    res.status(200).json({ message: 'Usuário deletado com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro ao deletar dados do banco' });
  }
});


// --- PONTE PARA AS ROTAS DE CASAS ---
// Esta rota deve vir DEPOIS das rotas específicas de usuário (/api/user/:id) para não haver conflito.

// Redireciona requisições para /api/user/:userId/houses para o roteador de casas
router.use('/:userId/house', (req, res, next) => {
  // Adiciona o userId ao objeto de requisição para que o próximo roteador possa usá-lo
  req.userId = req.params.userId;
  next();
}, houseRouter);


module.exports = router;