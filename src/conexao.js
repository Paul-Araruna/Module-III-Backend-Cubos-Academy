const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'dindin',
    password: 'papai25081308',
    port: 5432
});

const query = (text, param) => {
    return pool.query(text, param);
};

module.exports = {
    query
};

