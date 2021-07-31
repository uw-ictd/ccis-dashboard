const { dbOptionsEmpty, runSQL } = require('../testUtils');
const db = require('../model/db')(dbOptionsEmpty);

beforeAll(async () => {
    // Starting the docker container can take some time
    return await db.poolConnect;
}, 20000);

jest.setTimeout(15000);

afterAll(async () => {
    await db.closeDb();
});

/*
 * These tests run against the local test database (running in docker).
 */
describe('Database raw query tests against local test database', () =>  {
    test('Return refrigerators with raw query', async () => {
        const transaction = await db.startTransaction();
        await runSQL(transaction, 'seedRefrigerators.sql');
        const result = await transaction.query('SELECT id_refrigerators FROM refrigerators_odkx');
        expect(result.length).toBeGreaterThan(0);
        expect(typeof(result[0].id_refrigerators)).toBe('string');
        expect(result[0].id_refrigerators).not.toBeNull();
        expect(result[0].id_refrigerators).toBeDefined();
        await transaction.rollback();
    });

    test('Return nothing with empty query', () => {
        // Result is []
        return expect(db.query('')).resolves.toHaveLength(0);
    });
});

