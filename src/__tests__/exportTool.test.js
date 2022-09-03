const { runSQL, dbOptionsEmpty } = require('../testUtils');
const db = require('../model/db')(dbOptionsEmpty);
const exportOptions = require('../shared/exportOptions');
const refrigeratorQuery = exportOptions[0].options['refrigerator_joined'].query;
const facilityQuery = exportOptions[0].options['facility_joined'].query;
let transaction;

beforeAll(async () => {
    // Starting the docker container can take some time
    await db.poolConnect;
}, 20000);

jest.setTimeout(15000);

beforeEach(async () => {
    transaction = await db.startTransaction();
});

afterEach(() => {
    return transaction.rollback();
});

afterAll(() => {
    return db.closeDb();
});


describe('SQL query tests for table export', () =>  {
    test('Return refrigerator big table with export query', async () => {
        await runSQL(transaction, 'seedMainTables.sql');
        const result = await transaction.query(refrigeratorQuery);
        expect(result.length).toBeGreaterThanOrEqual(1);
        const columns = Object.keys(result[0]);
        expect(columns).toEqual(expect.arrayContaining([
            'levelNumber',
            'regionLevel1',
            'regionLevel2',
            'regionLevel3',
            'regionLevel4',
            'regionLevel5',
            'regionName',
            'primary_facility_id',
            'facility_name',
            'ownership',
            'facility_level',
            'location_latitude',
            'location_longitude',
            'year_installed',
            'serial_number',
            'tracking_id',
            'power_source',
            'functional_status',
            'utilization',
            'maintenance_priority',
            'reason_not_working',
            'notes',
            'temperature_monitoring_device',
            'voltage_regulator',
            'voltage_regulator_functional_status',
            'voltage_regulator_serial_number',
            'temperature_monitoring_device_functional_status',
            'lastUpdateUser_refrigerators',
            'savepointTimestamp_refrigerators',
            'catalog_id',
            'equipment_type',
            'manufacturer',
            'model_id',
            'freezer_gross_volume',
            'freezer_net_volume',
            'refrigerator_picture_contentType',
            'refrigerator_picture_uriFragment'
        ].map(s => s.toLowerCase())));
    });

    test('Return facility big table with export query', async () => {
        await runSQL(transaction, 'seedMainTables.sql');
        const result = await transaction.query(facilityQuery);
        expect(result.length).toBeGreaterThanOrEqual(1);
        const columns = Object.keys(result[0]);
        expect(columns).toEqual(expect.arrayContaining([
            'levelNumber',
            'regionLevel1',
            'regionLevel2',
            'regionLevel3',
            'regionLevel4',
            'regionLevel5',
            'regionName',
            'lastUpdateUser_health_facilities',
            'contact_name',
            'contact_phone_number',
            'contact_title',
            'electricity_source',
            'fuel_availability',
            'grid_power_availability',
            'vaccine_supply_interval',
            'vaccine_supply_mode',
            'distance_to_supply',
            'immunization_services_offered',
            'number_of_cold_boxes',
            'number_of_vaccine_carriers',
            'number_of_l3_packs',
            'number_of_l4_packs',
            'number_of_l6_packs',
            'spare_fuel_cylinders',
            'spare_temp_monitoring_devices',
            'savepointTimestamp_health_facilities',
            'primary_facility_id',
            'secondary_facility_id',
            'facility_name',
            'ownership',
            'authority',
            'location_latitude',
            'location_longitude',
            'catchment_population',
            'facility_level',
            'facility_status',
            'facility_storage_volume',
            'facility_maintanance_priority'
        ].map(s => s.toLowerCase())));
    });
});
