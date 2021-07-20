// This file defines what options the user can select for a filter and where
// the application looks for them in the database
module.exports = {
    facilityTypes: {
        table: 'health_facilities2_odkx',
        column: 'facility_level',
        useInDropdowns: true
    },
    refrigeratorTypes: {
        table: 'refrigerator_types_odkx',
        column: 'model_id',
        useInDropdowns: true
    },
    maintenancePriorities: {
        table: 'refrigerators_odkx',
        column: 'maintenance_priority',
        useInDropdowns: true
    },
    regions: {
        table: 'geographic_regions_odkx',
        useInDropdowns: false,
        multiColumn: true,
        columns: [
            // Order matters here: the input will be something like
            //   [ 'Uganda', 'Kampala', 'Kampala' ]
            // and each of those needs to get matched up to the right column
            // of geographic_regions_odkx. If only some columns are included,
            // it's okay: only the ones specified in the filter must match.
            // So [ 'Uganda' ] will match any region within Uganda.
            'regionLevel2', 'regionLevel3'
        ]
    }
};
