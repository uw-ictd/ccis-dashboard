const { runSQL, dbOptionsEmpty } = require('../testUtils');
const db = require('../model/db')(dbOptionsEmpty);
const { getIndicatorsQuery } = require('../controller/indicatorQueries');

jest.setTimeout(15000);

beforeAll(async () => {
    // Starting the docker container can take some time
    return await db.poolConnect;
}, 20000);

afterAll(() => {
    return db.closeDb();
});

let transaction;

beforeEach(async () => {
    transaction = await db.startTransaction();
});

afterEach(() => {
    return transaction.rollback();
});


describe('SQL query tests for key indicators', () =>  {
    test('Return indicators with getIndicators() query', async () => {
        await runSQL(transaction, 'seedMainTables.sql');
        const result = await transaction.query(getIndicatorsQuery());
        expect(result.length).toBe(1);
        expect(result[0].num_hf).toBe(2);
        expect(result[0].num_ref).toBe(2);
        expect(Date(result[0].last_updated_fac)).toBe(Date('2020-09-30T17:39:02.346Z'));
        expect(result[0].need_maintanance).toBe(1);
    });
});
