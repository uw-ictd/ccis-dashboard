/*
 * Example usage:
 *   const db = require('../models/db')();
 *   await db.query(...);
 *   db.closeDb();
 */
const sql = require('pg')
const retry = require('retry');
require('../util/env');
const startTransaction = require('./dbTransactions');

// Cast SQL integers to Javscript integers
sql.types.setTypeParser(sql.types.builtins.INT8, str => {
    const num = Number.parseInt(str);
    if (!Number.isSafeInteger(num)) console.warn(`${num} is too large to safely cast to a javscript Number`);
    return num;
});

/*
 * When running tests, we may have to wait for the docker container to start
 */
function faultTolerantConnect(pool) {
    return new Promise((resolve, reject) => {
        const operation = retry.operation({
            retries: 10,
            factor: 1.3,
            minTimeout: 1000,
            maxTimeout: 5000
        });
        operation.attempt(function(currentAttempt) {
            // We check out a postgres client just to check if the connection is
            // configured
            pool.connect()
                .then(client => {
                    client.release();
                    resolve(pool);
                })
                .catch(err => {
                    console.error(currentAttempt, err);
                    if (!operation.retry(err)) reject(operation.mainError());
                })
        });
    });
}

function DBConnection(config) {
    this.pool = new sql.Pool(config);
    this.poolConnect = faultTolerantConnect(this.pool);
    this.poolConnect.then(() => {
        console.log(`Connected to database server ${config.host}`);
    });
    this.pool.on('error', err => {
        // the pool will emit an error on behalf of any idle clients
        // it contains if a backend error or network partition happens
        console.error('Error from connection pool:', err);
    });

    this.query = query.bind(this);
    this.closeDb = closeDb.bind(this);
    this.startTransaction = startTransaction.bind(this);
}

function connect(options) {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        host: process.env.DB_SERVER,
        database: process.env.DB_NAME,
        ssl: process.env.DB_SSL,
        // configuring the pool
        max: 10,
        idleTimeoutMillis: 2*60000 // 45s - 2min
    };
    // Override defaults with those from options
    if (options) Object.assign(config, options);
    return new DBConnection(config);
}

/*
 * queryStr: String The text of a SQL query
 * transaction: [optional] the mssql transaction object this requests should be
 *   part of
 * parameters: [optional] list of query params to insert into queryStr
 */
async function query(queryStr, transactionRequest, parameters=[]) {
    await this.poolConnect; // ensures that the pool has been created
    let result;
    try {
        let request;
        if (transactionRequest) {
            request = transactionRequest;
        } else {
            request = this.pool;
        }
        result = request.query(queryStr, parameters);
        return (await result).rows;
    } catch (err) {
        console.error('SQL error for query:', queryStr);
        console.error(err);
        return result; // This is returned so tests have access to the error
    }
}

async function closeDb() {
    await this.poolConnect; // Can't close the pool until it's finished connecting
    return this.pool.end();
}

module.exports = connect;
