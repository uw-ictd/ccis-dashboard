const { runSQL, dbOptionsEmpty } = require('../testUtils');
const db = require('../model/db')(dbOptionsEmpty);
const vizQuery = require('../controller/queryTemplate');
const visualizations = require('../shared/visualizations');

const barChart1 = visualizations['Refrigerator/freezer utilization'];
const facilityChart = visualizations['Electricity availability'];

const basicFilter = {
    // seedMainTables has 'public_hcii' and 'public_hciv'
    facilityTypes: [ '', 'public_hcii', 'public_hciv', 'private clinic' ],
    // seedMainTables has 'Unknown Freezer', 'VLS 054 SDD Greenline'
    refrigeratorTypes: [ 'Unknown Freezer', 'VLS 054 SDD Greenline' ],
    // seedMainTables has 'low' and ' '
    maintenancePriorities: [ 'high', 'medium', 'low', ' ', 'not_applicable' ],
    regions: [
        [ 'SOUTH CENTRAL', 'WAKISO DISTRICT' ],
        [ 'ANKOLE', 'NTUNGAMO DISTRICT' ],
        [ 'LANGO', 'APAC DISTRICT']
    ]
};

const regionFilter = {
    ...basicFilter,
    // seedMainTables has UGANDA/ANKOLE/NTUNGAMO DISTRICT and UGANDA/SOUTH CENTRAL/WAKISO
    regions: [
        [ 'SOUTH CENTRAL', 'WAKISO DISTRICT' ],
        [ 'LANGO', 'APAC DISTRICT']
    ]
};

beforeAll(async () => {
    // Starting the docker container can take some time
    await db.poolConnect;
}, 20000);

jest.setTimeout(15000);

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

describe('QueryTemplate makeQueryStr tests', () => {
    test('Query for basic bar chart returns without error', () => {
        const promise = vizQuery(transaction, {
            ...barChart1,
            filter: null
        });
        return expect(promise).resolves.toBeDefined();
    });

    test('Query with loose filter has the full data', async () => {
        await runSQL(transaction, 'seedMainTables.sql');
        const result = await vizQuery(transaction, {
            ...barChart1,
            filter: basicFilter
        });
        expect(result.length).toBe(2);
        expect(result[0].count).toBe(1);
        expect(result[1].count).toBe(1);
    });

    test('Query with filter has partial data', async () => {
        await runSQL(transaction, 'seedMainTables.sql');
        const result = await vizQuery(transaction, {
            ...barChart1,
            filter: {
                ...basicFilter,
                facilityTypes: [ 'public_hcii' ]
            }
        });
        expect(result.length).toBe(1);
        expect(result[0].count).toBe(1);
    });

    test('vizQuery implements region filter', async () => {
        await runSQL(transaction, 'seedMainTables.sql');
        const result = await vizQuery(transaction, {
            ...barChart1,
            filter: regionFilter
        });
        expect(result.length).toBe(1);
        expect(result[0].count).toBe(1);
    });

    test.skip('Facility chart counts facilities', async () => {
        await runSQL(transaction, 'oneFacilityManyRefrigerators.sql');
        const refrigerators = await transaction.query('SELECT COUNT(*) as count FROM refrigerators_odkx;');
        expect(refrigerators.length).toBe(1);
        expect(refrigerators[0].count).toBe(14);
        const facilities = await vizQuery(transaction, {
            ...facilityChart,
            filter: null
        });
        // In the inserted data, the facility has 14 refrigerators!
        expect(facilities.length).toBe(1);
        expect(facilities[0].count).toBe(1); // fails
    });

    test('vizQuery ignores refrigerators without proper type', async () => {
        // Dataset has 2 refrigerators: one with a matching refrigerator type
        // and one without
        await runSQL(transaction, 'refrigeratorWithoutType.sql');
        const result = await vizQuery(transaction, {
            ...barChart1,
            filter: null
        });
        expect(result.length).toBe(1);
        expect(result[0].count).toBe(1);
    });

    test('vizQuery filters for NULL values properly', async () => {
        // Dataset has 2 refrigerators: one with a maintenance priority and one
        // without
        await runSQL(transaction, 'refrigeratorNullMaintenance.sql');
        const result = await vizQuery(transaction, {
            ...barChart1,
            filter: {
                ...basicFilter,
                maintenancePriorities: [ '' ],
            }
        });
        expect(result.length).toBe(1);
        expect(result[0].count).toBe(1);
    });
});
