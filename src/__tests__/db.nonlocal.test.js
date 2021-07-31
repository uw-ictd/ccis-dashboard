const { silenceErrors, dbOptionsSeeded } = require('../testUtils');
const { query, closeDb } = require('../model/db')(dbOptionsSeeded);

afterAll(() => {
    return closeDb();
});

/*
 * The following tests check that the dockerized database is configured
 * properly. These tests are only meaningful if the test-db-seeded container,
 * a.k.a. seededDB, has the same user configuration as the real deployment
 * container. The local `.env` file is ignored here
 */
describe('Database configuration tests', () =>  {
    test('Ensure drop table not allowed', () => {
         silenceErrors();
         return expect(query('DROP TABLE geographic_regions_odkx'))
             .rejects.toThrow('must be owner of table');
     });

     test('Ensure delete not allowed', () => {
         silenceErrors();
         return expect(query(`DELETE FROM refrigerators_odkx
             WHERE deleted=\'true\'`))
             .rejects.toThrow('permission denied');
     });

     test('Ensure update not allowed', () => {
         silenceErrors();
         return expect(query(`UPDATE refrigerators_odkx
             SET deleted = \'false\'`))
             .rejects.toThrow('permission denied');
     });
});
