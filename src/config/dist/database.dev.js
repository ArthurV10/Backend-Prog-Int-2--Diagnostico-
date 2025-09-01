"use strict";

// Importação biblioteca PG para BD
var _require = require('pg'),
    Pool = _require.Pool;

var pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.PORT_DB
});
module.exports = pool;