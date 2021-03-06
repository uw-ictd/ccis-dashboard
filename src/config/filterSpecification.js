const refrigeratorClasses = require('../model/refrigeratorClasses.json');
const facilityClasses = require('../model/facilityClasses.json');
const geographicBoundaries = require('../config/geographicBoundaries');

// This file defines what options the user can select for a filter and where
// the application looks for them in the database
// This object is validated by the filterSpecification schema in
// util/configSchemas.js
// `table` [String] required
// `column` [String] required
// `useInDropdowns: true` requires `title`
// `grouped: true` requires `classes`
// `multiColumn: true` requires `columns`
module.exports = {
    facilityTypes: {
        title: 'Facilty type:',
        table: 'health_facilities2_odkx',
        column: 'facility_level',
        grouped: true,
        classes: facilityClasses,
        useInDropdowns: true
    },
    facilityElectricity: {
        title: 'Facility electricity source:',
        table: 'health_facilities2_odkx',
        column: 'electricity_source',
        useInDropdowns: true
    },
    facilityGridPower: {
        title: 'Facility grid power availability:',
        table: 'health_facilities2_odkx',
        column: 'grid_power_availability',
        useInDropdowns: true
    },
    facilityOwnership: {
        title: 'Facility ownership:',
        table: 'health_facilities2_odkx',
        column: 'ownership',
        useInDropdowns: true
    },
    facilityAuthority: {
        title: 'Facility authority:',
        table: 'health_facilities2_odkx',
        column: 'authority',
        useInDropdowns: true
    },
    facilityStatus: {
        title: 'Facility status:',
        table: 'health_facilities2_odkx',
        column: 'facility_status',
        useInDropdowns: true
    },
    refrigeratorTypes: {
        title: 'CCE type:',
        table: 'refrigerator_types_odkx',
        column: 'model_id',
        grouped: true,
        classes: refrigeratorClasses,
        useInDropdowns: true
    },
    maintenancePriorities: {
        title: 'CCE maintenance priority:',
        table: 'refrigerators_odkx',
        column: 'maintenance_priority',
        useInDropdowns: true
    },
    lastUpdateUserFacilities: {
        title: 'Last Update User (Facility):',
        table: 'health_facilities2_odkx',
        column: 'lastupdateuser_health_facilities',
        useInDropdowns: true
    },
    lastUpdateUserRefrigerators: {
        title: 'Last Update User (CCE):',
        table: 'refrigerators_odkx',
        column: 'lastupdateuser_refrigerators',
        useInDropdowns: true
    },
    // There is a special case on the frontend for handling the `regions`
    // filter, since it uses a map
    regions: {
        table: 'geographic_regions_odkx',
        useInDropdowns: false,
        multiColumn: true,
        columns: geographicBoundaries.levels.map(level => level.dbLevelName)
    }
};
