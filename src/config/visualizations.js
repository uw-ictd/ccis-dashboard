const refrigeratorClasses = require('../model/refrigeratorClasses.json');

/*
 * groupBy String [optional], required if style = 'bar'
 *   either the name of a column in the database or one provided by
 *   computedColumns.js
 * colorBy String [optional], required if style = 'pie'
 *   either the name of a column in the database or one provided by
 *   computedColumns.js
 * repeatBy String [optional], either the name of a column in the database or
 *   one provided by computedColumns.js
 * sort 'ASC'|'DESC' [optional], ascending or descending
 * style 'pie'|'bar'|'map', choose a chart type; `map` will automatically send
 *     location_latitude and location_longitude
 * mapType String [optional] is only
 *     supported for `style: 'map'`. 'maintenance_priority' is the only
 *     supported value so far.
 * facilityPopup Object [optional] should be used iff style is map
 *     can map a database column to one of the following:
 *          'COUNT': counts the number of nonempty values for that column
 *          'SUM': sums the values of that column (note: column values must be able to be cast to an int)
 *          'BY_FACILITY': for columns that are in health_facilities2_odkx, i.e. an attribute specific to
 *               each facility. Examples include 'facility_level' and 'ownership'. These will be included
 *               with the other aggregated data.
 * type String, either 'refrigerator' or 'facility'. Refrigerator visualizations will count refrigerators
 *     (refrigerator maps will still aggregate them by facility). Facility visualizations will
 *     1. Count facilities instead of CCE (in bar/pie charts)
 *     2. Include facilities without any CCE
 *     3. Disable the filter options that use the refrigerators or refrigerator_types tables
 */
module.exports = {
    // CCEM table 3.3
    'Working status by CCE model': {
        type: 'refrigerator',
        groupBy: 'model_id',
        colorBy: 'functional_status',
        colorMap: {
            'functioning': 'blue',
            'not_functioning': 'red',
            'Missing data': 'gray'
        },
        style: 'bar'
    },
    // Richard says this is also a CCEM chart
    'Age by CCE model': {
        type: 'refrigerator',
        groupBy: 'model_id',
        colorBy: 'AgeGroups',
        colorMap: {
            '0-5 Years': 'green',
            '6-10 Years': 'yellow',
            '>10 Years': 'red',
            'Missing data': 'gray'
        },
        style: 'bar'
    },
    // CCEM chart 3.4
    'CCE by working status': {
        type: 'refrigerator',
        groupBy: 'functional_status',
        colorBy: 'functional_status',
        colorMap: {
            'functioning': 'blue',
            'not_functioning': 'red',
            'Missing data': 'gray'
        },
        style: 'bar'
    },
    // CCEM chart 3.4
    'CCE by working status (pie)': {
        type: 'refrigerator',
        colorBy: 'functional_status',
        colorMap: {
            'functioning': 'blue',
            'not_functioning': 'red',
            'Missing data': 'gray'
        },
        style: 'pie'
    },
    // CCEM table 3.6b
    'CCE utilization': {
        type: 'refrigerator',
        groupBy: 'model_id',
        colorBy: 'utilization',
        sort: 'DESC',
        colorMap: {
            'Missing data': 'gray'
        },
        style: 'bar'
    },
    // CCEM table 1.8
    'Electricity availability': {
        type: 'refrigerator',
        groupBy: 'grid_power_availability',
        colorBy: 'grid_power_availability',
        colorMap: {
            'more_than_16': 'green',
            '8_to_16': 'yellow',
            '4_to_8': 'red',
            'Missing data': 'gray'
        },
        style: 'bar'
    },
    // CCEM table 1.8
    'Electricity availability (pie)': {
        type: 'refrigerator',
        colorBy: 'grid_power_availability',
        colorMap: {
            'more_than_16': 'green',
            '8_to_16': 'yellow',
            '4_to_8': 'red',
            'Missing data': 'gray'
        },
        style: 'pie'
    },
    // CCEM table 3.5a
    'CCE models by age group': {
        type: 'refrigerator',
        groupBy: 'AgeGroups',
        colorBy: 'AgeGroups',
        sort: 'DESC',
        colorMap: {
            '0-5 Years': 'green',
            '6-10 Years': 'yellow',
            '>10 Years': 'red',
            'Missing data': 'gray'
        },
        style: 'bar'
    },
    // CCEM table 3.5a
    'CCE models by age group (pie)': {
        type: 'refrigerator',
        colorBy: 'AgeGroups',
        sort: 'DESC',
        colorMap: {
            '0-5 Years': 'green',
            '6-10 Years': 'yellow',
            '>10 Years': 'red',
            'Missing data': 'gray'
        },
        style: 'pie'
    },
    // Maintenance priority map
    'Maintenance priority by facility': {
        type: 'refrigerator',
        mapType: 'maintenance_priority',
        style: 'map',
        facilityPopup: {
            'maintenance_priority': [ 'high', 'low', 'medium', 'not_applicable' ]
        }
    },
    // count of refrigerators for each classification
    // Note: Uses view in database, which will need to be updated if new ref types are added
    'CCE by type (pie)': {
        type: 'refrigerator',
        colorBy: 'refrigerator_class',
        colorMap: {
            'ILR': 'blue',
            'Absorption' : 'red',
            'Freezer' : 'green',
            'Solar' : 'yellow',
            'Other' : 'purple',
            'Missing data' : 'gray'
        },
        style: 'pie'
    },
    'CCE model (bar)': {
        type: 'refrigerator',
        groupBy: 'model_id',
        colorBy: 'model_id',
        style: 'bar'
    },
    'CCE utilization (bar)': {
        type: 'refrigerator',
        groupBy: 'utilization',
        colorBy: 'utilization',
        colorMap: {
            'Missing data': 'gray'
        },
        style: 'bar'
    },
    'CCE maintenance priority (bar)': {
        type: 'refrigerator',
        groupBy: 'maintenance_priority',
        colorBy: 'maintenance_priority',
        colorMap: {
            'not_applicable': 'blue',
            'low': 'yellow',
            'medium': 'orange',
            'high': 'red',
            'Missing data': 'gray'
        },
        style: 'bar'
    },
    'Maintence priority by model': {
        type: 'refrigerator',
        groupBy: 'model_id',
        colorBy: 'maintenance_priority',
        colorMap: {
            'not_applicable': 'blue',
            'low': 'yellow',
            'medium': 'orange',
            'high': 'red',
            'Missing data': 'gray'
        },
        style: 'bar'
    },
    'CCE facility power availability by model': {
        type: 'refrigerator',
        groupBy: 'model_id',
        colorBy: 'grid_power_availability',
        colorMap: {
            'more_than_16': 'green',
            '8_to_16': 'yellow',
            '4_to_8': 'red',
            'Missing data': 'gray'
        },
        style: 'bar'
    },
    'CCE model by facility power availability': {
        type: 'refrigerator',
        groupBy: 'grid_power_availability',
        colorBy: 'model_id',
        style: 'bar'
    },
    'CCE model by facility type': {
        type: 'refrigerator',
        groupBy: 'facility_level',
        colorBy: 'model_id',
        style: 'bar'
    },
    'Facility type by CCE model': {
        type: 'refrigerator',
        groupBy: 'model_id',
        colorBy: 'facility_level',
        colorMap: {
            'Missing data': 'gray'
        },
        style: 'bar'
    },
    // Facility details map
    'Facility details map': {
        type: 'facility',
        mapType: 'facility_details',
        style: 'map',
        facilityPopup: {
            'refrigerator_class': Object.keys(refrigeratorClasses),
            'facility_level': 'BY_FACILITY',
            'ownership': 'BY_FACILITY'
        }
    },
    'Recent alarms map': {
        type: 'refrigerator',
        mapType: 'alarm_counts',
        style: 'map',
        facilityPopup: {
            'id_refrigerators': 'COUNT'
        }
    },
    'Catchment population': {
        type: 'facility', // with this we count facilities instead of refrigerators
        groupBy: 'catchment_pop_bucket',
        colorBy: 'catchment_pop_bucket',
        style: 'bar'
    },
    'Facility last update month': {
        type: 'facility',
        groupBy: 'updatemonth_facilities',
        colorBy: 'updatemonth_facilities',
        style: 'bar'
    },
    'Refrigerator last update month': {
        type: 'refrigerator',
        groupBy: 'updatemonth_refrigerators',
        colorBy: 'updatemonth_refrigerators',
        style: 'bar'
    },
    'Facility updates by user': {
        type: 'facility',
        groupBy: 'lastupdateuser_health_facilities',
        colorBy: 'lastupdateuser_health_facilities',
        style: 'bar'
    }
};
