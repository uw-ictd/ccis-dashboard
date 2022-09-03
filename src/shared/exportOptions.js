const genericGeographyColumns = 'g.levelNumber, g.regionLevel1, g.regionLevel2, g.regionLevel3, g.regionLevel4, g.regionLevel5, g.regionName,';
const genericFacilityColumns = 'h.primary_facility_id, h.secondary_facility_id, h.facility_name, h.ownership, h.facility_level, h.location_latitude, h.location_longitude,';
const genericRefrigeratorTypeColumns = 'rt.catalog_id, rt.equipment_type, rt.manufacturer, rt.model_id,'
const genericRefrigeratorColumns = 'r.year_installed, r.serial_number, r.power_source, r.functional_status, r.utilization, r.maintenance_priority, r.reason_not_working, r.notes,';
const genericColdRoomColumns = 'c.manufacturer, c.model, c.year, c.serial_number, c.functional_status, c.utilization, c.maintenance_priority, c.reason_not_working, c.notes,'

/**
 * This is an array of export groups. Each export group has:
 *     options: [array] list of options, where each option is:
 *         name: [string] name to display
 *         query: [string] if a query, the query text
 *         usesVaccineStores: [boolean] whether it requires the list
 *                      of vaccine stores (only valid for reports)
 *         rawTable: [boolean] whether this is a raw table export
 *         table: [string] if a raw table export, which table
 *     buttonText: [string] what to display on the export button
 *     inputFields: [array] where each element is an input field. Input fields are only allowed on reports
 *          label: [string] the label to display for the input field
 *          id: [string] the id of the <input> html element
 *          type: ["number" or "string"] the type of the input
 *          lowerBound: [number] if type = "number", this enforces a lower bound
 *          upperBound: [number] if type = "number", this enforces an upper bound
 *     report: [boolean] whether or not this input group is a report and uses input fields
 */
module.exports = [
    {
        options: {
            refrigerator_joined: {
                name: 'CCE Table (joined format)',
                query: `SELECT ${genericGeographyColumns} ${genericFacilityColumns}
                    r.year_installed, r.serial_number, r.tracking_id, r.power_source, r.functional_status,
                    r.utilization, r.maintenance_priority, r.reason_not_working, r.notes, r.temperature_monitoring_device,
                    r.voltage_regulator, r.voltage_regulator_functional_status, r.voltage_regulator_serial_number,
                    r.temperature_monitoring_device_functional_status,
                    r.lastUpdateUser_refrigerators, r.savepointTimestamp_refrigerators,
    
                    rt.catalog_id, rt.equipment_type, rt.manufacturer, rt.power_source,
                    rt.model_id, rt.freezer_gross_volume, rt.freezer_net_volume, rt.refrigerator_picture_contentType,
                    rt.refrigerator_picture_uriFragment
                    FROM geographic_regions_odkx as g,
                        health_facilities2_odkx as h,
                        refrigerators_odkx as r,
                        refrigerator_types_odkx as rt
                    WHERE g.id_geographic_regions = h.admin_region_id
                    AND h.id_health_facilities = r.facility_row_id
                    AND r.model_row_id = rt.id_refrigerator_types`
            },
    
            facility_joined: {
                name: 'Facility Table (joined format)',
                query: `SELECT ${genericGeographyColumns}
                    h.id_health_facilities, h.lastUpdateUser_health_facilities, h.contact_name, h.contact_phone_number, h.contact_title,
                    h.electricity_source, h.fuel_availability, h.grid_power_availability, h.vaccine_supply_interval,
                    h.vaccine_supply_mode, h.distance_to_supply, h.immunization_services_offered, h.number_of_cold_boxes,
                    h.number_of_vaccine_carriers, h.number_of_l3_packs, h.number_of_l4_packs, h.number_of_l6_packs,
                    h.spare_fuel_cylinders, h.spare_temp_monitoring_devices, h.savepointTimestamp_health_facilities, h.primary_facility_id, h.secondary_facility_id,
                    h.facility_name,
                    h.ownership, h.authority, h.location_latitude, h.location_longitude, h.catchment_population, h.facility_level, h.facility_status,
                    (SELECT COUNT(*) FROM refrigerators_odkx WHERE refrigerators_odkx.facility_row_id = h.id_health_facilities
                    AND refrigerators_odkx.functional_status = 'functioning')
                    as facility_storage_volume,
                    (SELECT
                        CASE MAX(case maintenance_priority when 'high' then 3 when 'medium' then 2 when 'low' then 1 else 0 end)
                            when 3 then 'high' when 2 then 'medium' when 1 then 'low' else 'na'
                        END FROM refrigerators_odkx WHERE refrigerators_odkx.facility_row_id = h.id_health_facilities) as facility_maintanance_priority
                    FROM geographic_regions_odkx as g,
                        health_facilities2_odkx as h
                    WHERE g.id_geographic_regions = h.admin_region_id`
            },
    
            maintenance_log_joined: {
                name: 'Maintenance logs (joined format)',
                query: `SELECT ${genericGeographyColumns} ${genericFacilityColumns}
                    ${genericRefrigeratorTypeColumns} ${genericRefrigeratorColumns}
                    ml.lastUpdateUser_maintenance_logs, ml.savepointTimestamp_maintenance_logs, ml.actions_taken,
                    ml.date_serviced, ml.other_maintenance_notes, ml.other_repair_notes, ml.other_spare_parts,
                    ml.preventative_notes, ml.repair_notes, ml.serviced_by, ml.spare_parts_electrical,
                    ml.spare_parts_hardware, ml.spare_parts_monitoring, ml.spare_parts_power, ml.spare_parts_refrigeration,
                    ml.spare_parts_solar, ml.technician_name, ml.technician_phone, ml.type_of_maintenance,
                    ml.type_of_preventative_maintenance, ml.type_of_repair
                    FROM geographic_regions_odkx as g,
                        health_facilities2_odkx as h,
                        refrigerators_odkx as r,
                        refrigerator_types_odkx as rt,
                        maintenance_logs_odkx as ml
                    WHERE g.id_geographic_regions = h.admin_region_id
                    AND h.id_health_facilities = r.facility_row_id
                    AND r.model_row_id = rt.id_refrigerator_types
                    AND ml.refrigerator_id = r.id_refrigerators`
            },
    
            cold_rooms_joined: {
                name: 'Cold Rooms Table (joined format)',
                query: `SELECT ${genericGeographyColumns} ${genericFacilityColumns}
                    c.backup_generator, c.backup_generator_functional_status, c.dimensions, c.functional_status, c.gross_volume,
                    c.maintenance_priority, c.manufacturer, c.model, c.net_volume, c.notes, c.reason_not_working,
                    c.serial_number, c.storage_temperature, c.temperature_monitoring_device,
                    c.temperature_monitoring_device_functional_status, c.temperature_monitoring_device_type,
                    c.tracking_id, c.type, c.utilization, c.year, c.id_cold_rooms
                    FROM geographic_regions_odkx as g,
                        health_facilities2_odkx as h,
                        cold_rooms_odkx as c
                    WHERE g.id_geographic_regions = h.admin_region_id
                    AND h.id_health_facilities = c.facility_row_id`
            },
    
            cold_room_maintenance_joined: {
                name: 'Cold room maintenance logs (joined format)',
                query: `SELECT ${genericGeographyColumns} ${genericFacilityColumns} ${genericColdRoomColumns}
                    cml.lastUpdateUser_cold_room_maintenance_logs,
                    cml.savepointTimestamp_cold_room_maintenance_logs,
                    cml.actions_taken,
                    cml.date_serviced,
                    cml.other_maintenance_notes,
                    cml.other_repair_notes,
                    cml.other_spare_parts,
                    cml.preventative_notes,
                    cml.repair_notes,
                    cml.serviced_by,
                    cml.spare_parts,
                    cml.technician_name,
                    cml.technician_phone,
                    cml.total_hrs_of_operation_unit1,
                    cml.total_hrs_of_operation_unit2,
                    cml.type_of_maintenance,
                    cml.type_of_preventative_maintenance,
                    cml.type_of_repair
                    FROM geographic_regions_odkx as g,
                        health_facilities2_odkx as h,
                        cold_rooms_odkx as c,
                        cold_room_maintenance_logs_odkx as cml
                    WHERE g.id_geographic_regions = h.admin_region_id
                    AND h.id_health_facilities = c.facility_row_id
                    AND cml.cold_room_id = c.id_cold_rooms`
            },
    
            refrigerator_moves_joined: {
                name: 'CCE moves (joined format)',
                query: `SELECT ${genericRefrigeratorTypeColumns} ${genericRefrigeratorColumns}
                    m.lastUpdateUser_refrigerator_moves, m.savepointTimestamp_refrigerator_moves, m.move_date,
                    gold.levelNumber as old_levelNumber, gold.regionLevel1 as old_regionLevel1,
                    gold.regionLevel2 as old_regionLevel2, gold.regionLevel3 as old_regionLevel3,
                    gold.regionLevel4 as old_regionLevel4, gold.regionLevel5 as old_regionLevel5, gold.regionName as old_regionName,
                    gnew.levelNumber as new_levelNumber, gnew.regionLevel1 as new_regionLevel1,
                    gnew.regionLevel2 as new_regionLevel2, gnew.regionLevel3 as new_regionLevel3,
                    gnew.regionLevel4 as new_regionLevel4, gnew.regionLevel5 as new_regionLevel5, gnew.regionName as new_regionName,
                    hold.primary_facility_id as old_primary_facility_id,
                    hold.secondary_facility_id as old_secondary_facility_id,
                    hold.facility_name as old_facility_name,
                    hold.ownership as old_ownership, hold.facility_level as old_facility_level,
                    hnew.primary_facility_id as new_primary_facility_id,
                    hnew.secondary_facility_id as new_secondary_facility_id,
                    hnew.facility_name as new_facility_name,
                    hnew.ownership as new_ownership, hnew.facility_level as new_facility_level
                    FROM refrigerator_moves_odkx AS m
                    LEFT JOIN health_facilities2_odkx AS hold ON m.old_facility_id = hold.id_health_facilities
                    LEFT JOIN health_facilities2_odkx AS hnew ON m.new_facility_id = hnew.id_health_facilities
                    LEFT JOIN geographic_regions_odkx AS gold ON hold.admin_region_id = gold.id_geographic_regions
                    LEFT JOIN geographic_regions_odkx AS gnew ON hnew.admin_region_id = gnew.id_geographic_regions
                    LEFT JOIN refrigerators_odkx AS r ON m.refrigerator_id = r.id_refrigerators
                    LEFT JOIN refrigerator_types_odkx AS rt ON r.model_row_id = rt.id_refrigerator_types`
            },
    
            temperature_data_joined: {
                name: 'CCE temperature data (joined format)',
                query: `SELECT ${genericGeographyColumns} ${genericFacilityColumns}
                    ${genericRefrigeratorTypeColumns} ${genericRefrigeratorColumns}
                    temp.lastUpdateUser_refrigerator_temperature_data, temp.savepointTimestamp_refrigerator_temperature_data,
                    temp.days_temp_above_8_30, temp.days_temp_below_2_30, temp.number_of_high_alarms_30, temp.number_of_low_alarms_30,
                    temp.reporting_period, temp.ft_serial_number
                    FROM geographic_regions_odkx as g,
                        health_facilities2_odkx as h,
                        refrigerators_odkx as r,
                        refrigerator_types_odkx as rt,
                        refrigerator_temperature_data_odkx as temp
                    WHERE g.id_geographic_regions = h.admin_region_id
                    AND h.id_health_facilities = r.facility_row_id
                    AND r.model_row_id = rt.id_refrigerator_types
                    AND temp.refrigerator_id = r.id_refrigerators`
            },
    
            daily_temperature_joined: {
                name: 'Fridge tag daily temperature data (joined format)',
                query: `SELECT ${genericGeographyColumns} ${genericFacilityColumns}
                    ${genericRefrigeratorTypeColumns} ${genericRefrigeratorColumns}
                    fdtr.lastUpdateUser_ft_daily_temp_records, fdtr.savepointTimestamp_ft_daily_temp_records,
                    fdtr.android_sys_time, fdtr.avg_temp, fdtr.battery, fdtr.checked_time, fdtr.data_source,
                    fdtr.date, fdtr.date_read, fdtr.ft_serial_number, fdtr.h_cond, fdtr.high_alarm,
                    fdtr.high_duration, fdtr.high_trigger_time, fdtr.l_cond, fdtr.low_alarm,
                    fdtr.low_duration, fdtr.low_trigger_time, fdtr.max_temp, fdtr.max_temp_time,
                    fdtr.min_temp, fdtr.min_temp_time, fdtr.units
                    FROM geographic_regions_odkx as g,
                        health_facilities2_odkx as h,
                        refrigerators_odkx as r,
                        refrigerator_types_odkx as rt,
                        ft_daily_temp_records_odkx as fdtr
                    WHERE g.id_geographic_regions = h.admin_region_id
                    AND h.id_health_facilities = r.facility_row_id
                    AND r.model_row_id = rt.id_refrigerator_types
                    AND fdtr.refrigerator_id = r.id_refrigerators`
            },  
            refrigerators_odkx: {
                name: 'CCE Table (raw format)',
                table: 'refrigerators_odkx',
                rawTable: true
            },
            health_facilities2_odkx: {
                name: 'Facility Table (raw format)',
                table: 'health_facilities2_odkx',
                rawTable: true
            },
            refrigerator_types_odkx: {
                name: 'CCE models (raw format)',
                table: 'refrigerator_types_odkx',
                rawTable: true
            },
            geographic_regions_odkx: {
                name: 'Geographic regions (raw format)',
                table: 'geographic_regions_odkx',
                rawTable: true
            },
            maintenance_logs_odkx: {
                name: 'Maintenance logs (raw format)',
                table: 'maintenance_logs_odkx',
                rawTable: true
            },
            cold_rooms_odkx: {
                name: 'Cold rooms (raw format)',
                table: 'cold_rooms_odkx',
                rawTable: true
            },
            cold_room_maintenance_logs_odkx: {
                name: 'Cold room maintenance logs (raw format)',
                table: 'cold_room_maintenance_logs_odkx',
                rawTable: true
            },
            refrigerator_moves_odkx: {
                name: 'CCE moves (raw format)',
                table: 'refrigerator_moves_odkx',
                rawTable: true
            },
            refrigerator_temperature_data_odkx: {
                name: 'CCE temperature data (raw format)',
                table: 'refrigerator_temperature_data_odkx',
                rawTable: true
            },
            ft_daily_temp_records_odkx: {
                name: 'Fridge tag daily temperature data (raw format)',
                table: 'ft_daily_temp_records_odkx',
                rawTable: true
            },
            all_odkx_tables: {
                // This has a special case in frontend-src/exportController.js
                name: 'All raw ODK-X tables'
            }
        },
        buttonText: "Export",
        inputFields: []
    },
    {
        options: {            
            capacity_by_facility: {
                name: 'Report: CCE (not cold room) capacity by facility',
                query: `SELECT ${genericGeographyColumns} ${genericFacilityColumns}
                        SUM(CAST(rt.refrigerator_net_volume as numeric)) as "sum(refrigerator_net_volume)",
                        SUM(CAST(rt.freezer_net_volume AS numeric)) as "sum(freezer_net_volume)",
                        h.catchment_population as "catchment_population"
                    FROM health_facilities2_odkx AS h
                    JOIN geographic_regions_odkx AS g ON g.id_geographic_regions = h.admin_region_id
                    JOIN refrigerators_odkx AS r ON h.id_health_facilities = r.facility_row_id
                    JOIN refrigerator_types_odkx AS rt ON r.model_row_id = rt.id_refrigerator_types
                    GROUP BY ${genericGeographyColumns} ${genericFacilityColumns} h.id_health_facilities, h.catchment_population`,
                usesParams: false
            },

            capacity_by_district: {
                name: 'Report: CCE (not cold room) capacity by district',
                query: `SELECT g.regionLevel1, g.regionLevel2, g.regionLevel3,
                        SUM(CAST(rt.refrigerator_net_volume as numeric)) as "sum(refrigerator_net_volume)",
                        SUM(CAST(rt.freezer_net_volume AS numeric)) as "sum(freezer_net_volume)",
                        SUM(CAST(h.catchment_population AS numeric)) as "sum(catchment_population)"
                    FROM health_facilities2_odkx AS h
                    JOIN geographic_regions_odkx AS g ON g.id_geographic_regions = h.admin_region_id
                    JOIN refrigerators_odkx AS r ON h.id_health_facilities = r.facility_row_id
                    JOIN refrigerator_types_odkx AS rt ON r.model_row_id = rt.id_refrigerator_types
                    GROUP BY g.regionLevel1, g.regionLevel2, g.regionLevel3`,
                usesParams: false
            },

            capacity_by_region: {
                name: 'Report: CCE (not cold room) capacity by region',
                query: `SELECT g.regionLevel1, g.regionLevel2,
                        SUM(CAST(rt.refrigerator_net_volume as numeric)) as "sum(refrigerator_net_volume)",
                        SUM(CAST(rt.freezer_net_volume AS numeric)) as "sum(freezer_net_volume)",
                        SUM(CAST(h.catchment_population AS numeric)) as "sum(catchment_population)"
                    FROM health_facilities2_odkx AS h
                    JOIN geographic_regions_odkx AS g ON g.id_geographic_regions = h.admin_region_id
                    JOIN refrigerators_odkx AS r ON h.id_health_facilities = r.facility_row_id
                    JOIN refrigerator_types_odkx AS rt ON r.model_row_id = rt.id_refrigerator_types
                    GROUP BY g.regionLevel1, g.regionLevel2`,
                usesParams: false
            },

            capacity_by_country: {
                name: 'Report: CCE (not cold room) capacity by country',
                query: `SELECT g.regionLevel1,
                        SUM(CAST(rt.refrigerator_net_volume as numeric)) as "sum(refrigerator_net_volume)",
                        SUM(CAST(rt.freezer_net_volume AS numeric)) as "sum(freezer_net_volume)",
                        SUM(CAST(h.catchment_population AS numeric)) as "sum(catchment_population)"
                    FROM health_facilities2_odkx AS h
                    JOIN geographic_regions_odkx AS g ON g.id_geographic_regions = h.admin_region_id
                    JOIN refrigerators_odkx AS r ON h.id_health_facilities = r.facility_row_id
                    JOIN refrigerator_types_odkx AS rt ON r.model_row_id = rt.id_refrigerator_types
                    GROUP BY g.regionLevel1`,
                usesParams: false
            },
            capacity_facility_level_and_district: {
                name: 'Report: CCE Capacity by facility level and district',
                query: `SELECT facility_level, regionlevel3 as district,
                        SUM(CAST(NULLIF(refrigerator_net_volume, '') as numeric)) as "sum(refrigerator_net_volume)",
                        SUM(CAST(NULLIF(freezer_net_volume, '') as numeric)) as "sum(freezer_net_volume)",
                        SUM(CAST(catchment_population AS numeric)) as "sum(catchment_population)"
                        FROM refrigerator_types_odkx, refrigerators_odkx, health_facilities2_odkx, geographic_regions_odkx
                        WHERE admin_region_id = id_geographic_regions
                        AND model_row_id = id_refrigerator_types
                        AND facility_row_id = id_health_facilities
                        GROUP BY facility_level, regionlevel3;`,
                usesParams: false
            },
            capacity_facility_level_and_region: {
                name: 'Report: CCE Capacity by facility level and region',
                query: `SELECT facility_level, regionlevel2 as region,
                        SUM(CAST(NULLIF(refrigerator_net_volume, '') as numeric)) as "sum(refrigerator_net_volume)",
                        SUM(CAST(NULLIF(freezer_net_volume, '') as numeric)) as "sum(freezer_net_volume)",
                        SUM(CAST(catchment_population AS numeric)) as "sum(catchment_population)"
                        FROM refrigerator_types_odkx, refrigerators_odkx, health_facilities2_odkx, geographic_regions_odkx
                        WHERE admin_region_id = id_geographic_regions
                        AND model_row_id = id_refrigerator_types
                        AND facility_row_id = id_health_facilities
                        GROUP BY facility_level, regionlevel2;`,
                usesParams: false
            },
            capacity_facility_level: {
                name: 'Report: CCE Capacity by facility level',
                query: `SELECT facility_level,
                        SUM(CAST(NULLIF(refrigerator_net_volume, '') as numeric))  as "sum(refrigerator_net_volume)",
                        SUM(CAST(NULLIF(freezer_net_volume, '') as numeric)) as "sum(freezer_net_volume)",
                        SUM(CAST(catchment_population AS numeric)) as "sum(catchment_population)"
                        FROM refrigerator_types_odkx, refrigerators_odkx, health_facilities2_odkx, geographic_regions_odkx
                        WHERE admin_region_id = id_geographic_regions
                        AND model_row_id = id_refrigerator_types
                        AND facility_row_id = id_health_facilities
                        GROUP BY facility_level;`,
                        usesParams: false
            },    
            /*
             * These next three reports calcualte the required refrigerator capacity across a 5-year horizon.
             *    The calculation for the nth year is as follows:
             *          required_capacity(n) = vaccine_volume_per_person / 1000 * population 
             *                                 * e ^ (annual_growth / 100 * n)
             *                                 * supply_interval / 52
             *    Let us break down each piece:
             *        - vaccine_volume_per_person / 1000 * population (amount of CCE volume across entire year)
             *           - the vaccine volume per person is in mL but our capacities are in L, so 
             *             we decide by 1000 to make that conversion.
             *           - we multiply by population to get the total amount of volume needed
             *        -  e ^ (annual_growth / 100 * n)
             *           - annual growth is a percentage, so 5% growth would be represented by 5. We
             *             need to divide by 100 to get the proportion grown each year.
             *           - n is the number of years in the future (i.e. the number of years to grow)
             *        - supply_interval / 52 (proportion of total needed to be stored at once)
             *           - supply interval is the number of weeks between receiving supplies. For instance,
             *             if the supply interval is 4, that means there are 52 / 4 = 13 resupplies throughout
             *             the year. Thus, we need to be able to store 1/13 of the total amount needed
             *             throughout the year (hence dividing supply interval by 52).
             */
            by_facility_report: {
                name: 'Report: Capacity planning by facility',
                usesVaccineStores: true,
                query: `
                SELECT h.id_health_facilities, g.regionLevel2, g.regionLevel3, h.facility_level, h.facility_name,
                SUM(CAST(rt.refrigerator_net_volume as numeric)) as "sum(refrigerator_net_volume)",
                SUM(CAST(h.catchment_population AS numeric)) as "sum(catchment_population)",
                SUM(stats.population_factor *  stats.resupply_factor) as zero_years,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 1) *
                    stats.resupply_factor) as one_year,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 2) *
                    stats.resupply_factor) as two_years,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 3) *
                    stats.resupply_factor) as three_years,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 4) *
                    stats.resupply_factor) as four_years,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 5) *
                    stats.resupply_factor) as five_years
                FROM health_facilities2_odkx AS h
                JOIN geographic_regions_odkx AS g ON g.id_geographic_regions = h.admin_region_id
                JOIN refrigerators_odkx AS r ON h.id_health_facilities = r.facility_row_id
                JOIN refrigerator_types_odkx AS rt ON r.model_row_id = rt.id_refrigerator_types
                JOIN
                    (SELECT CAST($1 AS numeric) / 1000 * CAST(h.catchment_population AS numeric) as population_factor,
                            (CASE
                                WHEN h.facility_level IN ($5) THEN CAST($3 AS numeric)
                                ELSE CAST($4 AS numeric)
                                END) / 52 as resupply_factor,
                            id_health_facilities FROM health_facilities2_odkx AS h) AS stats
                    ON stats.id_health_facilities = h.id_health_facilities
                GROUP BY h.id_health_facilities, h.facility_level, h.facility_name, g.regionLevel2, g.regionLevel3`,
                usesParams: true
            }, 
            by_district_report: {
                name: 'Report: Capacity planning by district',
                usesVaccineStores: true,
                query: `
                SELECT g.regionLevel2, g.regionLevel3,
                SUM(CAST(rt.refrigerator_net_volume as numeric)) as "sum(refrigerator_net_volume)",
                SUM(CAST(h.catchment_population AS numeric)) as "sum(catchment_population)",
                SUM(stats.population_factor *  stats.resupply_factor) as zero_years,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 1) *
                    stats.resupply_factor) as one_year,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 2) *
                    stats.resupply_factor) as two_years,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 3) *
                    stats.resupply_factor) as three_years,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 4) *
                    stats.resupply_factor) as four_years,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 5) *
                    stats.resupply_factor) as five_years
                FROM health_facilities2_odkx AS h
                JOIN geographic_regions_odkx AS g ON g.id_geographic_regions = h.admin_region_id
                JOIN refrigerators_odkx AS r ON h.id_health_facilities = r.facility_row_id
                JOIN refrigerator_types_odkx AS rt ON r.model_row_id = rt.id_refrigerator_types
                JOIN
                    (SELECT CAST($1 AS numeric) / 1000 * CAST(h.catchment_population AS numeric) as population_factor,
                        (CASE
                            WHEN h.facility_level IN ($5) THEN CAST($3 AS numeric)
                            ELSE CAST($4 AS numeric)
                            END) / 52 as resupply_factor,
                        id_health_facilities FROM health_facilities2_odkx AS h) AS stats
                    ON stats.id_health_facilities = h.id_health_facilities
                WHERE g.regionLevel3 IS NOT null
                GROUP BY g.regionLevel3, g.regionLevel2`,
                usesParams: true
            }, 
            by_region_report: {
                name: 'Report: Capacity planning by region',
                usesVaccineStores: true,
                query: `
                SELECT g.regionLevel2,
                SUM(CAST(rt.refrigerator_net_volume as numeric)) as "sum(refrigerator_net_volume)",
                SUM(CAST(h.catchment_population AS numeric)) as "sum(catchment_population)",
                SUM(stats.population_factor *  stats.resupply_factor) as zero_years,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 1) *
                    stats.resupply_factor) as one_year,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 2) *
                    stats.resupply_factor) as two_years,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 3) *
                    stats.resupply_factor) as three_years,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 4) *
                    stats.resupply_factor) as four_years,
                SUM(stats.population_factor * EXP((CAST($2 AS numeric) / 100) * 5) *
                    stats.resupply_factor) as five_years
                FROM health_facilities2_odkx AS h
                JOIN geographic_regions_odkx AS g ON g.id_geographic_regions = h.admin_region_id
                JOIN refrigerators_odkx AS r ON h.id_health_facilities = r.facility_row_id
                JOIN refrigerator_types_odkx AS rt ON r.model_row_id = rt.id_refrigerator_types
                JOIN
                    (SELECT CAST($1 AS numeric) / 1000 * CAST(h.catchment_population AS numeric) as population_factor,
                        (CASE
                            WHEN h.facility_level IN ($5) THEN CAST($3 AS numeric)
                            ELSE CAST($4 AS numeric)
                            END) / 52 as resupply_factor,
                        id_health_facilities FROM health_facilities2_odkx AS h) AS stats
                    ON stats.id_health_facilities = h.id_health_facilities
                GROUP BY g.regionLevel2`,
                usesParams: true
            }, 
        },
        buttonText: "Generate Report",
        report: true,
        inputFields: [
            {label: "Vaccine volume (mL) per person per year", id: "vaccine-volume", type:"number", lowerBound:0},
            {label: "Annual population growth rate (%)", id: "pop-growth", type:"number"},
            {label: "Supply interval (weeks) for vaccine stores", id: "vaccine-store-supply-interval", type:"number", lowerBound:0},
            {label: "Supply interval (weeks) for health facilities", id: "health-facility-supply-interval", type:"number", lowerBound:0}
        ]
    }
];
