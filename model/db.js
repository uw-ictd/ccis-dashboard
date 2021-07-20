/*
 * Example usage:
 *   const db = require('../models/db')();
 *   await db.query(...);
 *   db.closeDb();
 */
const sql = require('mssql')
const retry = require('retry');
require('dotenv').config();
const startTransaction = require('./dbTransactions');

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
            pool.connect().then(result => resolve(result))
                .catch(err => {
                    if (!operation.retry(err)) reject(operation.mainError());
                });
        });
    });
}

function DBConnection(config) {
    this.pool = new sql.ConnectionPool(config);
    this.poolConnect = faultTolerantConnect(this.pool);
    this.poolConnect.then(() => {
        console.log(`Connected to database server ${config.server}`);
    });
    this.pool.on('error', err => {
        // When running a query this can double-log an error since the query
        // will also fail
        console.error(err);
    });

    this.query = query.bind(this);
    this.closeDb = closeDb.bind(this);
    this.startTransaction = startTransaction.bind(this);
}

function connect(options) {
    const config = {
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        server: process.env.DB_SERVER,
        database: process.env.DB_NAME,
        options: {
            encrypt: true,
            enableArithAbort: true
        },
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 2*60000 // 45s - 2min
        }
    };
    if (options && options.useTestDB) {
        config.user = 'tester';
        config.password = 'UnsafeLocalTestPassword!';
        config.server = 'localhost';
        config.options.trustServerCertificate = true;
    }
    return new DBConnection(config);
}

/*
 * queryStr: String The text of a SQL query
 * transaction: [optional] the mssql transaction object this requests should be
 *   part of
 */
async function query(queryStr, transactionRequest) {
    await this.poolConnect; // ensures that the pool has been created
    let result;
    try {
        let request;
        if (transactionRequest) {
            request = transactionRequest;
        } else {
            request = this.pool.request();
        }
        result = request.query(queryStr);
        return (await result).recordset;
    } catch (err) {
        console.error('SQL error', err);
        return result;
    }
}

async function closeDb() {
    await this.poolConnect; // Can't close the pool until it's finished connecting
    return this.pool.close();
}

module.exports = connect;
