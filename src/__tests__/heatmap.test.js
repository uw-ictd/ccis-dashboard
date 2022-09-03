const { runSQL, dbOptionsEmpty } = require('../testUtils');
const db = require('../model/db')(dbOptionsEmpty);
const vizQuery = require('../controller/queryTemplate');
const visualizations = require('../config/visualizations');

const quantityHeatmap = visualizations['Number of nonfunctional equipment'];


const basicFilter = {
    // seedMainTables has 'public_hcii' and 'public_hciv'
    facilityTypes: [ '', 'hcii', 'hciv', 'private clinic' ],
    // seedMainTables has 'Unknown Freezer', 'VLS 054 SDD Greenline'
    refrigeratorTypes: [ 'Unknown Freezer', 'VLS 054 SDD Greenline' ],
    // seedMainTables has 'low' and ' '
    maintenancePriorities: [ 'high', 'medium', 'low', ' ', 'not_applicable' ],
    regions: [
        [ 'UGANDA', 'SOUTH CENTRAL' ],
        [ 'UGANDA', 'ANKOLE' ],
        [ 'UGANDA', 'LANGO' ]
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

describe('Heatmap visualization tests', () => {
    test('Query for quantity heatmap has proper data', async () => {
        await runSQL(transaction, 'seedMainTables.sql');
        const result = await vizQuery(transaction, {
            ...quantityHeatmap,
            filter: basicFilter
        });
        expect(result.length).toBe(2);
        expect(result[0].count).toBe(1);
        expect(result[1].count).toBe(1);
        expect([ 'TRUE', 'FALSE' ]).toContain(result[0].colorlabel);
        expect([ 'TRUE', 'FALSE' ]).toContain(result[1].colorlabel);
        expect(result[0].colorlabel).not.toEqual(result[1].colorlabel);        
    });

    
});
