/*
 * This module is used for testing purposes. It wraps a database connection (db)
 * to implement the following transaction pattern:
 *   transaction = await db.startTransaction();
 *   result1 = await transaction.query(...);
 *   result2 = await transaction.query(...);
 *   result3 = await transaction.query(...);
 *   await transaction.rollback(); // Undoes all 3 queries
 * This allows tests to modify the database without conflicts
 */
const retry = require('retry');
const DEADLOCK = 1205; // Error 1205 is deadlock: the one we may want to retry

function retryDeadlocks(fn) {
    return new Promise((resolve, reject) => {
        const operation = retry.operation({
            retries: 10,
            factor: 1.5,
            minTimeout: 50,
            maxTimeout: 500
        });
        operation.attempt(function(currentAttempt) {
            fn().then(result => resolve(result))
                .catch(err => {
                    if (err.number !== DEADLOCK ||
                        !operation.retry(err)) {
                        reject(operation.mainError());
                    }
                });
        });
    });
}

// Statefully changes objToModify (a database connection object) to add a
// .rollback function and some .transaction metadata
async function initTransaction(dbToModify) {
    await dbToModify.poolConnect;
    const client = await dbToModify.pool.connect();
    await client.query('BEGIN');
    dbToModify.transaction = {
        request: client,
        queries: []
    };
    dbToModify.rollback = function() {
        const client = this.transaction.request;
        client.query('ROLLBACK')
            .finally(() => client.release());
    }
}

async function retryAll(request, queries) {
    let args, status, result;
    for (let i = 0; i < queries.length; i++) {
        let { args, status } = queries[i];
        if (status !== 'complete' && i !== queries.length - 1) {
            throw new Error(`Queries in a transaction must be added in series. Got transaction ${status} on query ${i+1} of ${queries.length}`);
        }
        result = await request.query(...args);
    }
    return result;
}

function wrapQuery(wrappedDB, origFn) {
    return function (...args) {
        const thisStatus = {
            status: 'pending',
            args
        };
        wrappedDB.transaction.queries.push(thisStatus);
        // If the query would deadlock, instead we start a new transaction and replay
        // all of the previous queries in that one, then return the result of the
        // failing query in the new transaction
        return origFn(...args)
            .then(result => {
                thisStatus.status = 'complete';
                return result;
            })
            .catch(err => {
                thisStatus.status = 'failed';
                if (err.number !== DEADLOCK) return Promise.reject(err);
                // Fix the queries array once for the whole retry sequence
                // so we don't shorten it as we go
                const queries = wrappedDB.transaction.queries;
                return retryDeadlocks(async function () {
                    // start a new transaction
                    await initTransaction(wrappedDB);
                    return retryAll(wrappedDB.transaction.request, queries);
                });
            });
    };
}

/*
 * The returned object has the transaction.rollback() method in addition to the
 * usual database methods. transaction.commit() is not implemented since this is
 * just used for testing
 *
 * transaction.rollback() return a Promise
 */
async function startTransaction() {
    // This function is called as db.startTransaction, so `this` is a
    // DBConnection (defined in db.js)
    const self = this;
    const wrappedDB = Object.assign({}, self);
    await initTransaction(wrappedDB); // stateful
    // Wrapping the request.query function
    const request = wrappedDB.transaction.request;
    request.query = wrapQuery(wrappedDB, request.query.bind(request));
    wrappedDB.query = arg => self.query(arg, wrappedDB.transaction.request);
    return wrappedDB;
}

module.exports = startTransaction;
