/*
 * Since this is a javascript file, you can import other data and write custom
 * logic like this for building SQL queries, if you want. This one is used for
 * the RefrigeratorClasses computed column
 */
const refrigeratorClasses = require('../model/refrigeratorClasses.json');
function makeRefrigeratorClassCases(refrigeratorClasses) {
    return Object.entries(refrigeratorClasses)
        .flatMap(([type, models]) => {
            return models.map(model => `WHEN model_id = '${model}' THEN '${type}'`)
        })
        .join('\n            ');
}

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
            TO_CHAR(CAST(savepointtimestamp_refrigerators as timestamp), 'YYYY-MM') as updatemonth_refrigerators
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
            TO_CHAR(CAST(savepointtimestamp_health_facilities as timestamp), 'YYYY-MM') as updatemonth_facilities
            FROM health_facilities2_odkx`,
        provides: [ 'updatemonth_facilities' ],
        joinOn: {
            table: 'health_facilities2_odkx',
            localColumn: 'id_health_facilities',
            foreignColumn: 'id_health_facilities'
        }
    },
    {
        name: 'ElectricitySourceGrid',
        query: `SELECT id_health_facilities,
            CASE
                WHEN electricity_source IN ('both_grid_and_solar', 'grid', 'both_grid_and_generator', 'all') THEN 'TRUE'
                WHEN electricity_source IS NULL THEN NULL
                WHEN electricity_source = '' THEN NULL
                ELSE 'FALSE'
            END AS electricity_source_grid
            FROM health_facilities2_odkx`,
        provides: [ 'electricity_source_grid' ],
        joinOn: {
            table: 'health_facilities2_odkx',
            localColumn: 'id_health_facilities',
            foreignColumn: 'id_health_facilities'
        }
    },
    {
        name: 'ElectricitySourceGrid',
        query: `SELECT id_health_facilities,
            CASE
                WHEN grid_power_availability IN ('4_to_8', '8_to_16', 'more_than_16') THEN 'TRUE'
                WHEN grid_power_availability IS NULL THEN NULL
                WHEN grid_power_availability = '' THEN NULL
                ELSE 'FALSE'
            END AS grid_power_at_least_4
            FROM health_facilities2_odkx`,
        provides: [ 'grid_power_at_least_4' ],
        joinOn: {
            table: 'health_facilities2_odkx',
            localColumn: 'id_health_facilities',
            foreignColumn: 'id_health_facilities'
        }
    },
    {
        name: 'FaultyRefrigerators',
        query: `SELECT refrigerator_id as faulty_refrigerator_id
            FROM refrigerator_temperature_data_odkx rtd
            WHERE (cast(reporting_period as timestamp) = (
                SELECT MAX(CAST(refrigerator_temperature_data_odkx.reporting_period AS timestamp))
                FROM refrigerator_temperature_data_odkx
                WHERE refrigerator_temperature_data_odkx.refrigerator_id = rtd.refrigerator_id
            ) OR reporting_period IS NULL) AND (
                cast(number_of_high_alarms_30 as integer) >= 3 OR
                cast(number_of_low_alarms_30 as integer) >= 1)`,
        provides: [ 'faulty_refrigerator_id' ],
        joinOn: {
            table: 'refrigerators_odkx',
            localColumn: 'faulty_refrigerator_id',
            foreignColumn: 'id_refrigerators'
        }
    },
    {
        name: 'FunctionalStatusFiltered',
        query: `SELECT id_refrigerators, functional_status as nonworking_functional_status, maintenance_priority as nonworking_maintenance_priority
            FROM refrigerators_odkx
            WHERE functional_status = 'not_functioning'
               OR (maintenance_priority IS NOT NULL AND maintenance_priority != 'not_applicable')`,
        provides: [ 'nonworking_functional_status', 'nonworking_maintenance_priority' ],
        joinOn: {
            table: 'refrigerators_odkx',
            localColumn: 'id_refrigerators',
            foreignColumn: 'id_refrigerators'
        }
    },
    {
        name: 'MaintenancePriorityFiltered',
        query: `SELECT id_refrigerators, maintenance_priority as maintenance_priority_filtered
            FROM refrigerators_odkx
            WHERE maintenance_priority IS NOT NULL AND maintenance_priority != 'not_applicable'`,
        provides: [ 'maintenance_priority_filtered' ],
        joinOn: {
            table: 'refrigerators_odkx',
            localColumn: 'id_refrigerators',
            foreignColumn: 'id_refrigerators'
        }
    },
    {
        name: 'CCEUpdateStatus',
        query: `SELECT id_refrigerators,
            CASE
                 WHEN lastupdateuser_refrigerators = 'init' OR
                      savepointtimestamp_refrigerators::timestamp::date < current_date - '3 months'::interval
                      THEN '> 3 months/Never'
                 WHEN savepointtimestamp_refrigerators::timestamp::date <= current_date - '1 months'::interval THEN '1-3 months'
                 WHEN savepointtimestamp_refrigerators::timestamp::date > current_date - '1 months'::interval THEN '< 1 month'
                 ELSE 'Data format error'
            END AS cce_update_status
            FROM refrigerators_odkx`,
        provides: ['cce_update_status'],
        joinOn: {
            table: 'refrigerators_odkx',
            localColumn: 'id_refrigerators',
            foreignColumn: 'id_refrigerators'
        }
    },
    {
        name: 'FacilityUpdateStatus',
        query: `SELECT id_health_facilities,
            CASE
                 WHEN lastupdateuser_health_facilities = 'init' OR
                      savepointtimestamp_health_facilities::timestamp::date < current_date - '3 months'::interval
                      THEN '> 3 months/Never'
                 WHEN savepointtimestamp_health_facilities::timestamp::date <= current_date - '1 months'::interval THEN '1-3 months'
                 WHEN savepointtimestamp_health_facilities::timestamp::date > current_date - '1 months'::interval THEN '< 1 month'
                 ELSE 'Data format error'
            END AS facility_update_status
            FROM health_facilities2_odkx`,
        provides: ['facility_update_status'],
        joinOn: {
            table: 'health_facilities2_odkx',
            localColumn: 'id_health_facilities',
            foreignColumn: 'id_health_facilities'
        }
    },
    {
        name: 'UpdatedFacilities',
        query: `SELECT id_health_facilities,
            CASE
                 WHEN lastupdateuser_health_facilities = 'init' THEN 'FALSE'
                 WHEN savepointtimestamp_health_facilities::timestamp::date <= current_date - '3 months'::interval THEN 'FALSE'
                 WHEN savepointtimestamp_health_facilities::timestamp::date > current_date - '3 months'::interval THEN 'TRUE'
                 ELSE NULL
            END AS updated_facilities
            FROM health_facilities2_odkx`,
        provides: ['updated_facilities'],
        joinOn: {
            table: 'health_facilities2_odkx',
            localColumn: 'id_health_facilities',
            foreignColumn: 'id_health_facilities'
        }
    },
    {
        name: 'FacilityStorageVolume',
        query: `
        SELECT id_health_facilities, refrigeration_volume,
                 CASE
                      WHEN vvr.refrigeration_volume_ratio < 0.7 * 0.001 THEN '>30% shortage'
                      WHEN vvr.refrigeration_volume_ratio >= 0.7 * 0.001 AND vvr.refrigeration_volume_ratio <= 1.3 * 0.001 THEN 'Within 30% of estimate'
                      WHEN vvr.refrigeration_volume_ratio > 1.3 * 0.001 THEN '>30% above estimate'
                     ELSE 'Missing data'
                  END as refrigeration_volume_ratio,
                 freezer_volume,
                 CASE
                      WHEN vvr.freezer_volume_ratio < 0.7 * 0.0005 THEN '>30% shortage'
                      WHEN vvr.freezer_volume_ratio >= 0.7 * 0.0005 AND vvr.refrigeration_volume_ratio <= 1.3 * 0.0005 THEN 'Within 30% of estimate'
                      WHEN vvr.freezer_volume_ratio > 1.3 * 0.0005 THEN '>30% above estimate'
                     ELSE 'Missing data'
                  END as freezer_volume_ratio
          FROM (
                 SELECT id_health_facilities,
                        TRIM(trailing '..' from TRIM(trailing '00' from CAST(SUM(numeric_volume.refrigerator_net_volume) as varchar))) as refrigeration_volume,
                        SUM(numeric_volume.refrigerator_net_volume / numeric_volume.catchment_population) as refrigeration_volume_ratio,
                        TRIM(trailing '..' from TRIM(trailing '00' from CAST(SUM(numeric_volume.freezer_net_volume) as varchar))) as freezer_volume,
                        SUM(freezer_net_volume / catchment_population) as freezer_volume_ratio
                 FROM (
                        SELECT id_health_facilities,
                               CAST(NULLIF(refrigerator_types_odkx.refrigerator_net_volume, '') as numeric) as refrigerator_net_volume,
                               CAST(NULLIF(refrigerator_types_odkx.freezer_net_volume, '') as numeric) as freezer_net_volume,
                               NULLIF(CAST(NULLIF(health_facilities2_odkx.catchment_population, '') as numeric), 0) as catchment_population
                        FROM health_facilities2_odkx
                        JOIN refrigerators_odkx
                             on health_facilities2_odkx.id_health_facilities = refrigerators_odkx.facility_row_id
                        JOIN refrigerator_types_odkx
                             on refrigerator_types_odkx.id_refrigerator_types = refrigerators_odkx.model_row_id
                 ) as numeric_volume
                 GROUP BY id_health_facilities, catchment_population
          ) as vvr
        `,
        provides: [ 'refrigeration_volume_ratio', 'refrigeration_volume', 'freezer_volume', 'freezer_volume_ratio' ],
        joinOn: {
            table: 'health_facilities2_odkx',
            localColumn: 'id_health_facilities',
            foreignColumn: 'id_health_facilities'
        }
    },
    {
        name: 'FacilityStorageVolumeFiltered',
        query: `
        SELECT id_health_facilities, refrigeration_volume_filtered, freezer_volume_filtered
        FROM (
               SELECT id_health_facilities,
                      TRIM(trailing '..' from TRIM(trailing '00' from CAST(SUM(numeric_volume.refrigerator_net_volume) as varchar))) as refrigeration_volume_filtered,
                      TRIM(trailing '..' from TRIM(trailing '00' from CAST(SUM(numeric_volume.freezer_net_volume) as varchar))) as freezer_volume_filtered,
                      SUM(numeric_volume.refrigerator_net_volume / numeric_volume.catchment_population) as refrigeration_volume_ratio,
                      SUM(freezer_net_volume / catchment_population) as freezer_volume_ratio
               FROM (
                      SELECT id_health_facilities,
                             CAST(NULLIF(refrigerator_types_odkx.refrigerator_net_volume, '') as numeric) as refrigerator_net_volume,
                             CAST(NULLIF(refrigerator_types_odkx.freezer_net_volume, '') as numeric) as freezer_net_volume,
                             NULLIF(CAST(NULLIF(health_facilities2_odkx.catchment_population, '') as numeric), 0) as catchment_population
                      FROM health_facilities2_odkx
                      JOIN refrigerators_odkx
                           on health_facilities2_odkx.id_health_facilities = refrigerators_odkx.facility_row_id
                      JOIN refrigerator_types_odkx
                           on refrigerator_types_odkx.id_refrigerator_types = refrigerators_odkx.model_row_id
               ) as numeric_volume
             GROUP BY id_health_facilities, catchment_population
        ) as vvr
        WHERE refrigeration_volume_ratio < 0.001
           OR freezer_volume_ratio < 0.0005
        `,
        provides: [ 'refrigeration_volume_filtered', 'freezer_volume_filtered' ],
        joinOn: {
            table: 'health_facilities2_odkx',
            localColumn: 'id_health_facilities',
            foreignColumn: 'id_health_facilities'
        }
    },
    {
        name: 'FacilitiesWithCapacity',
        query: `
           SELECT id_health_facilities,
           CASE WHEN SUM(refrigerator_net_volume) > 0.01 then 'TRUE'
                ELSE 'FALSE'
           END AS facility_has_refrigeration,
           CASE WHEN SUM(freezer_net_volume) > 0.01 then 'TRUE'
                ELSE 'FALSE'
           END AS facility_has_freezer
           FROM (
                  SELECT id_health_facilities,
                         CAST(NULLIF(refrigerator_types_odkx.refrigerator_net_volume, '') as numeric) as refrigerator_net_volume,
                         CAST(NULLIF(refrigerator_types_odkx.freezer_net_volume, '') as numeric) as freezer_net_volume
                  FROM health_facilities2_odkx
                  LEFT JOIN refrigerators_odkx
                       on health_facilities2_odkx.id_health_facilities = refrigerators_odkx.facility_row_id
                  LEFT JOIN refrigerator_types_odkx
                       on refrigerator_types_odkx.id_refrigerator_types = refrigerators_odkx.model_row_id
           ) as numeric_volume
         GROUP BY id_health_facilities`,
        provides: [ 'facility_has_refrigeration', 'facility_has_freezer' ],
        joinOn: {
            table: 'health_facilities2_odkx',
            localColumn: 'id_health_facilities',
            foreignColumn: 'id_health_facilities'
        }
    },
    {
        name: 'FacilityTimestampNice',
        query: `SELECT id_health_facilities, TO_CHAR(CAST(savepointtimestamp_health_facilities as timestamp), 'DD-MM-YYYY') as facility_savepoint
            FROM health_facilities2_odkx`,
        provides: [ 'facility_savepoint' ],
        joinOn: {
            table: 'health_facilities2_odkx',
            localColumn: 'id_health_facilities',
            foreignColumn: 'id_health_facilities'
        }
    },
    {
        name: 'TempAlarmsLastMonth',
        query: `SELECT refrigerator_id, days_temp_below_2_30, days_temp_above_8_30, number_of_high_alarms_30, number_of_low_alarms_30
            FROM refrigerator_temperature_data_odkx
            WHERE reporting_period::timestamp::date >= current_date - interval '1 month'`,
        provides: [ 'number_of_high_alarms_30',  'number_of_low_alarms_30', 'days_temp_below_2_30', 'days_temp_above_8_30'],
        joinOn: {
            table: 'refrigerators_odkx',
            localColumn: 'refrigerator_id',
            foreignColumn: 'id_refrigerators'
        }
    },
    {
        name: 'RefrigeratorClass',
        query: `
            SELECT id_refrigerator_types, CAST
            (CASE
            ${makeRefrigeratorClassCases(refrigeratorClasses)}
            WHEN model_id IS NOT NULL THEN 'No group'
            END AS varchar) AS refrigerator_class
            FROM refrigerator_types_odkx`,
        provides: [ 'refrigerator_class' ],
        joinOn: {
            table: 'refrigerator_types_odkx',
            localColumn: 'id_refrigerator_types',
            foreignColumn: 'id_refrigerator_types'
        }
    },
    {
        name: 'FacilityMaintenancePriority',
        query: `
        SELECT id_health_facilities, facility_maintenance_priority,
               CAST(priorities.high_count AS VARCHAR) AS high_count,
               CAST(priorities.medium_count AS VARCHAR) AS medium_count,
               CAST(priorities.low_count AS VARCHAR) AS low_count
        FROM (
            SELECT id_health_facilities,
            CASE
                WHEN high_count > 0 THEN 'high'
                WHEN medium_count > 0 THEN 'medium'
                WHEN low_count > 0 THEN 'low'
                ELSE NULL
            END AS facility_maintenance_priority,
            counts.high_count, counts.medium_count, counts.low_count
            FROM (
                SELECT id_health_facilities,
                SUM(CASE WHEN maintenance_priority = 'high' THEN 1 ELSE 0 END) AS high_count,
                SUM(CASE WHEN maintenance_priority = 'medium' THEN 1 ELSE 0 END) AS medium_count,
                SUM(CASE WHEN maintenance_priority = 'low' THEN 1 ELSE 0 END) AS low_count
                FROM health_facilities2_odkx
                JOIN refrigerators_odkx ON health_facilities2_odkx.id_health_facilities = refrigerators_odkx.facility_row_id
                JOIN refrigerator_types_odkx ON refrigerator_types_odkx.id_refrigerator_types = refrigerators_odkx.model_row_id
                GROUP BY id_health_facilities
            ) AS counts
        ) priorities
        WHERE facility_maintenance_priority IS NOT NULL
        `,
        provides: [ 'facility_maintenance_priority', 'high_count', 'medium_count', 'low_count' ],
        joinOn: {
            table: 'health_facilities2_odkx',
            localColumn: 'id_health_facilities',
            foreignColumn: 'id_health_facilities'
        }
    },
    {
        name: 'NonfunctionalRefrigerators',
        query: `
        SELECT id_refrigerators as nonfunctional_id,
        CASE
            WHEN functional_status = 'not_functioning' THEN 'TRUE'
            WHEN functional_status is NULL then null
            ELSE 'FALSE'
        END AS nonfunctional
        FROM refrigerators_odkx
        `,
        provides: [ 'nonfunctional_id', 'nonfunctional' ],
        joinOn: {
            table: 'refrigerators_odkx',
            localColumn: 'nonfunctional_id',
            foreignColumn: 'id_refrigerators'
        }
    }
];
