function getRefrigeratorQuery() {
    return `SELECT g.levelNumber, g.regionLevel1, g.regionLevel2, g.regionLevel3, g.regionLevel4, g.regionLevel5, g.regionName,

         h.id_health_facilities, h.admin_region_id, h.primary_facility_id, h.facility_name, h.ownership, h.facility_level,
         h.Location_latitude, h.Location_longitude,

         r.year_installed, r.serial_number, r.tracking_id, r.power_source, r.functional_status,
         r.utilization, r.maintenance_priority, r.reason_not_working, r.notes, r.temperature_monitoring_device,
         r.voltage_regulator, r.voltage_regulator_functional_status, r.voltage_regulator_serial_number,
         r.temperature_monitoring_device_functional_status,

         rt.id_refrigerator_types, rt.lastUpdateUser_refrigerator_types, rt.savepointTimestamp_refrigerator_types,
         rt.catalog_id, rt.equipment_type, rt.manufacturer, rt.power_source,
         rt.model_id, rt.freezer_gross_volume, rt.freezer_net_volume, rt.refrigerator_picture_contentType,
         rt.refrigerator_picture_uriFragment
        FROM geographic_regions_odkx as g,
             health_facilities2_odkx as h,
             refrigerators_odkx as r,
             refrigerator_types_odkx as rt
        WHERE g.id_geographic_regions = h.admin_region_id
        AND h.id_health_facilities = r.facility_row_id
        AND r.model_row_id = rt.id_refrigerator_types`;
}

function getFacilityQuery() {
    return `SELECT g.levelNumber, g.regionLevel1, g.regionLevel2, g.regionLevel3, g.regionLevel4, g.regionLevel5, g.regionName,

         h.id_health_facilities, h.lastUpdateUser_health_facilities, h.contact_name, h.contact_phone_number, h.contact_title,
         h.electricity_source, h.fuel_availability, h.grid_power_availability, h.vaccine_supply_interval,
         h.vaccine_supply_mode, h.distance_to_supply, h.immunization_services_offered, h.number_of_cold_boxes,
         h.number_of_vaccine_carriers, h.number_of_l3_packs, h.number_of_l4_packs, h.number_of_l6_packs,
         h.spare_fuel_cylinders, h.spare_temp_monitoring_devices, h.savepointTimestamp_health_facilities, h.primary_facility_id, h.secondary_facility_id,
         h.facility_name,
         h.ownership, h.authority, h.Location_latitude, h.Location_longitude, h.catchment_population, h.facility_level, h.facility_status,
         (CAST(h.catchment_population as int) *  0.06) as facility_storage_requirement,
         (SELECT COUNT(*) FROM refrigerators_odkx WHERE refrigerators_odkx.facility_row_id = h.id_health_facilities
         AND refrigerators_odkx.functional_status = 'functioning')
         as facility_storage_volume,
         (SELECT
            CASE MAX(case maintenance_priority when 'high' then 3 when 'medium' then 2 when 'low' then 1 else 0 end)
                when 3 then 'high' when 2 then 'medium' when 1 then 'low' else 'na'
            END FROM refrigerators_odkx WHERE refrigerators_odkx.facility_row_id = h.id_health_facilities) as facility_maintanance_priority
        FROM geographic_regions_odkx as g,
             health_facilities2_odkx as h
        WHERE g.id_geographic_regions = h.admin_region_id`;
}

module.exports = {
    getRefrigeratorQuery,
    getFacilityQuery
};
