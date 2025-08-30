// Importação biblioteca PG para BD
const {Pool} = require('pg');

const poll = new Pool({
    user : 'nome do usuario',
    host : 'localhost ou server',
    database : 'nome do banco',
    password: 'senha do banco',
    port : 5432
});

module.exports = poll;