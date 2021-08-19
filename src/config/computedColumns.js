module.exports = [
    {
        // name must be unique and not the same as any table names
        name: 'BucketedAge',
        query: `SELECT id_refrigerators,
            CASE
                 WHEN AGE BETWEEN 0 and  5 THEN '0-5 Years'
                 WHEN AGE BETWEEN 6 AND 10 THEN '6-10 Years'
                 WHEN AGE > 10 THEN '>10 Years'
                 ELSE 'Missing data'
             END AS AgeGroups
            FROM (
                 SELECT id_refrigerators,
                 CAST(CASE
                        WHEN year_installed = '0' or year_installed = ''
                          THEN -1
                        ELSE  (date_part('year', now()) - CAST(year_installed as integer))
                      END as integer
                 ) as AGE
                 FROM refrigerators_odkx
            ) as Ages`,
        provides: [ 'AgeGroups' ], // Look for these columns from this subquery
        joinOn: {
            table: 'refrigerators_odkx',
            // The localColumn should be one selected by this `query`
            localColumn: 'id_refrigerators',
            foreignColumn: 'id_refrigerators'
        }
    },
    {
        name: 'BucketedPopulation',
        query: `SELECT id_health_facilities,
            CASE
                 WHEN CAST(catchment_population as integer) = 0 THEN '0'
                 WHEN CAST(catchment_population as integer) BETWEEN 1 AND 9999 THEN '<10k'
                 WHEN CAST(catchment_population as integer) BETWEEN 10000 AND 100000 THEN '10k-100k'
                 WHEN CAST(catchment_population as integer) > 100000 THEN '>100k'
                 ELSE 'Missing data'
             END AS catchment_pop_bucket
            FROM health_facilities2_odkx`,
        provides: [ 'catchment_pop_bucket' ],
        joinOn: {
            table: 'health_facilities2_odkx',
            localColumn: 'id_health_facilities',
            foreignColumn: 'id_health_facilities'
        }
    },
    {
        name: 'BucketedRefrigeratorUpdate',
        query: `SELECT id_refrigerators,
            TO_CHAR(CAST(savepointtimestamp_refrigerators as timestamp), 'Month') as updatemonth_refrigerators
            FROM refrigerators_odkx`,
        provides: [ 'updatemonth_refrigerators' ],
        joinOn: {
            table: 'refrigerators_odkx',
            localColumn: 'id_refrigerators',
            foreignColumn: 'id_refrigerators'
        }
    },
    {
        name: 'BucketedFacilityUpdate',
        query: `SELECT id_health_facilities,
            TO_CHAR(CAST(savepointtimestamp_health_facilities as timestamp), 'Month') as updatemonth_facilities
            FROM health_facilities2_odkx`,
        provides: [ 'updatemonth_facilities' ],
        joinOn: {
            table: 'health_facilities2_odkx',
            localColumn: 'id_health_facilities',
            foreignColumn: 'id_health_facilities'
        }
    }
];
