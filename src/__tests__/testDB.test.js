/*
 * This file tests that the test database is set up correctly, unlike other
 * tests which test our application code. If this test fails, other tests
 * that use the test database are expected to fail.
 */
const { dbOptionsEmpty, runSQL } = require('../testUtils');
const db = require('../model/db')(dbOptionsEmpty);

jest.setTimeout(15000);

beforeAll(async () => {
    // Starting the docker container can take some time
    return await db.poolConnect;
}, 20000);

afterAll(async () => {
    await db.closeDb();
});

let transaction;

beforeEach(async () => {
    transaction = await db.startTransaction();
});

afterEach(() => {
    return transaction.rollback();
});

describe('Test database has data', () => {
    test('Table refrigerators_odkx has data', async () => {
        await runSQL(transaction, 'seedRefrigerators.sql');
        const result = await transaction.query('SELECT id_refrigerators FROM refrigerators_odkx');
        expect(result.length).toBeGreaterThan(0);
        expect(typeof(result[0].id_refrigerators)).toBe('string');
        expect(result[0].id_refrigerators).not.toBeNull();
        expect(result[0].id_refrigerators).toBeDefined();
    });

    test('Delete query properly cleans up after a test', async () => {
        await transaction.query('DELETE FROM refrigerators_odkx');
        const result = await transaction.query('SELECT id_refrigerators FROM refrigerators_odkx');
        expect(result.length).toBe(0);
    });
});
