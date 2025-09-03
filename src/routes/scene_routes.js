// Inicializa o framework Express
const express = require('express');

// Cria um roteador Express para as Casas
const router = express.Router();

// Cria comunicação com o banco de dados (Importando conxeão)
const pool = require('../config/database.js');
const { errorMonitor } = require('events');

// Rotas do tipo GET

// Rota para listar todas as cenas de um usuário específico em uma casa específica
// Ex: GET /api/user/1/houses/5/scenes
router.get('/', async (req, res) => {
  const { casaId } = req; // Pega o ID da casa que foi injetado pelo roteador anterior (house_routes.js)
  if (!casaId) {
    return res.status(400).json({ message: 'ID da casa não fornecido na rota.' });
  }
  const querySQL = `
    SELECT DISTINCT cena.*
    FROM cena
    INNER JOIN acao_cena ON cena.cena_id = acao_cena.cena_id
    INNER JOIN dispositivo ON acao_cena.dispos_id = dispositivo.dispos_id
    INNER JOIN comodo ON dispositivo.comodo_id = comodo.comodo_id
    WHERE comodo.casa_id = $1;
  `;
  try {
    const { rows } = await pool.query(querySQL, [casaId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Erro ao buscar cenas: ', error);
    res.status(500).json({ message: 'Erro ao buscar dados do banco' });
  }
});

// Rota para ver os detalhes de uma cena específica
// Ex: GET /api/user/1/houses/5/scenes/10
router.get('/:id', async (req, res) => {
    const { id } = req.params; // ID da cena vindo da URL

    try {
        // 1. Busca os dados da cena
        const cenaQuery = 'SELECT * FROM cena WHERE cena_id = $1';
        const cenaResult = await pool.query(cenaQuery, [id]);

        if (cenaResult.rows.length === 0) {
            return res.status(404).json({ message: 'Cena não encontrada.' });
        }

        // 2. Busca as ações associadas a essa cena
        const acoesQuery = 'SELECT * FROM acao_cena WHERE cena_id = $1 ORDER BY ordem ASC';
        const acoesResult = await pool.query(acoesQuery, [id]);

        // 3. Monta o objeto final da cena com o array de ações dentro dele
        const cena = cenaResult.rows[0];
        cena.acoes = acoesResult.rows;


        // 4. Retorna o objeto completo
        res.status(200).json(cena);

    } catch (error) {
        console.error('Erro ao buscar detalhes da cena:', error);
        res.status(500).json({ message: 'Erro ao buscar dados do banco' });
    }
});

// Rotas do Tipo POST

// Rota para CRIAR uma nova cena com suas ações
// Ex: POST /api/user/1/houses/5/scenes
router.post('/', async (req, res) => {
  const { casaId } = req;
  // O body da requisição deve ter o nome da cena e um array de ações
  const { nome, ativa, acoes } = req.body;

  if (!nome || !acoes || !Array.isArray(acoes)) {
    return res.status(400).json({ message: 'Dados inválidos. É preciso fornecer nome e um array de ações.' });
  }

  const client = await pool.connect(); // Pega uma conexão do pool para a transação

  try {
    await client.query('BEGIN'); // Inicia a transação

    // 1. Insere a cena principal na tabela 'cena'
    const cenaQuery = 'INSERT INTO cena (nome, ativa) VALUES ($1, $2) RETURNING cena_id';
    const cenaResult = await client.query(cenaQuery, [nome, ativa]);
    const novaCenaId = cenaResult.rows[0].cena_id;

    // 2. Itera sobre o array de ações e insere cada uma na tabela 'acao_cena'
    const acaoQuery = 'INSERT INTO acao_cena (cena_id, dispos_id, ordem, ligado_desejado, delay_ms) VALUES ($1, $2, $3, $4, $5)';
    for (const [index, acao] of acoes.entries()) {
      await client.query(acaoQuery, [novaCenaId, acao.dispos_id, index, acao.ligado_desejado, acao.delay_ms]);
    }

    await client.query('COMMIT'); // Se tudo deu certo, salva as alterações permanentemente

    res.status(201).json({ cena_id: novaCenaId, nome, ativa, casa_id: casaId, acoes });

  } catch (error) {
    await client.query('ROLLBACK'); // Se algo deu errado, desfaz todas as alterações
    console.error('Erro ao criar cena:', error);
    res.status(500).json({ message: 'Erro ao salvar dados no banco' });
  } finally {
    client.release(); // Libera a conexão de volta para o pool
  }
});

// Rotas do Tipo PUT

// Rota para EDITAR uma cena e suas ações
// Ex: PUT /api/user/1/houses/5/scenes/10
router.put('/:id', async (req, res) => {
    const { casaId } = req;
    const { id } = req.params; // ID da cena
    const { nome, ativa, acoes } = req.body;

    if (!nome || !acoes || !Array.isArray(acoes)) {
        return res.status(400).json({ message: 'Dados inválidos. É preciso fornecer nome e um array de ações.' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Atualiza os dados da cena principal
        const cenaQuery = 'UPDATE cena SET nome = $1, ativa = $2 WHERE cena_id = $3 AND casa_id = $4 RETURNING *';
        const cenaResult = await client.query(cenaQuery, [nome, ativa, id, casaId]);

        if (cenaResult.rows.length === 0) {
            throw new Error('Cena não encontrada ou não pertence a esta casa.');
        }

        // 2. Deleta todas as ações antigas associadas a esta cena
        await client.query('DELETE FROM acao_cena WHERE cena_id = $1', [id]);

        // 3. Insere as novas ações
        const acaoQuery = 'INSERT INTO acao_cena (cena_id, dispos_id, ordem, ligado_desejado, delay_ms) VALUES ($1, $2, $3, $4, $5)';
        for (const [index, acao] of acoes.entries()) {
            await client.query(acaoQuery, [id, acao.dispos_id, index, acao.ligado_desejado, acao.delay_ms]);
        }
        
        await client.query('COMMIT');
        
        res.status(200).json({ cena_id: id, nome, ativa, casa_id: casaId, acoes });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao editar cena:', error);
        if (error.message.includes('Cena não encontrada')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Erro ao salvar dados no banco' });
    } finally {
        client.release();
    }
});

// Rotas do Tipo DELETE
// Rota para DELETAR uma cena específica de uma casa específica
// Ex: DELETE /api/user/1/houses/5/scenes/10
router.delete('/:id', async (req, res) => {
  const { casaId } = req; // ID da casa vindo da "ponte"
  const { id } = req.params; // ID da cena vindo da URL
  if (!casaId) {
    return res.status(400).json({ message: 'ID da casa não fornecido na rota.' });
  }
  try {
    const { rows } = await pool.query(
      'DELETE FROM cena WHERE cena_id = $1 RETURNING *',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Cena não encontrada ou não pertence a esta casa.' });
    }
    res.status(200).json({ message: 'Cena deletada com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar cena: ', error);
    res.status(500).json({ message: 'Erro ao deletar dados do banco' });
  }
});

module.exports = router;