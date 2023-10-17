const { Pool } = require('pg');

const pool = new Pool({
  user: 'me',     
  host: 'localhost',
  database: 'movies-database',
  password: '', 
  port: 5433          
});

module.exports = pool;
