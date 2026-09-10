const sql = require('mssql');
const config = require('./config');

let poolPromise = null;

async function connect() {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(config)
            .connect()
            .then((pool) => {
                console.log('Connected to SQL Server');
                pool.on('error', (err) => {
                    console.error('SQL pool error:', err);
                    poolPromise = null;
                });
                return pool;
            })
            .catch((err) => {
                poolPromise = null;
                console.error('Database connection failed:', err);
                throw err;
            });
    }
    return poolPromise;
}

function q(strings, ...values) {
    let text = '';
    strings.forEach((chunk, i) => {
        text += chunk;
        if (i < values.length) {
            text += `@p${i}`;
        }
    });
    return { text, values: [...values], isParamQuery: true };
}

async function query(input) {
    const pool = await connect();
    const request = pool.request();

    if (input && input.isParamQuery) {
        input.values.forEach((value, i) => {
            if (value === undefined) {
                request.input(`p${i}`, 'undefined');
            } else if (value === null) {
                request.input(`p${i}`, null);
            } else if (typeof value === 'object') {
                request.input(`p${i}`, JSON.stringify(value));
            } else {
                request.input(`p${i}`, value);
            }
        });
        return request.query(input.text);
    }

    return request.query(input);
}

module.exports = { sql, connect, query, q };