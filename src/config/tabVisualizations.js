/*
 * This defines the names of the tabs, and the visualizations for each tab.
 */

module.exports = {
    'Export': {
        tabLabel: 'Export',
        includeExport: true
    },
    'Facilities': {
        tabLabel: 'Facilities',
        visualizations: [
            'Facility details map',
            'Catchment population',
            'CCE model by facility power availability',
            'CCE facility power availability by model',
            'CCE model by facility type',
            'Facility type by CCE model',
            'Percentage of facilities with power source: grid (district)',
            'Percentage of facilities with power source: grid (region)',
            'Percentage of facilities with 4+ hours of grid power (district)',
            'Percentage of facilities with 4+ hours of grid power (region)',
            'All facilities list'
        ],
        defaultViz: 'Facility details map'
    },
    'CCE': {
        tabLabel: 'CCE',
        visualizations: [
            'Working status by CCE model',
            'Age by CCE model',
            'CCE by working status',
            'CCE by working status (pie)',
            'CCE utilization',
            'Electricity availability',
            'Electricity availability (pie)',
            'CCE models by age group',
            'CCE models by age group (pie)',
            'Maintence priority by model',
            'Maintenance priority by facility',
            'CCE by type (pie)',
            'CCE model (bar)',
            'CCE utilization (bar)',
            'CCE maintenance priority (bar)',
            'CCE model by facility power availability',
            'CCE facility power availability by model',
            'CCE model by facility type',
            'Facility type by CCE model',
            'All CCE list'
        ],
        defaultViz: 'Age by CCE model'
    },
    'Vaccines': {
        tabLabel: 'Vaccines',
        visualizations: [
            'Refrigeration volume vs requirements map (demo)',
            'Freezer volume vs requirements map (demo)',
            'Facilities with volume shortage (demo)'
        ],
        defaultViz: 'Refrigeration volume vs requirements map (demo)',
    },
    'System-Use': {
        tabLabel: 'System Use',
        visualizations: [
            'Update status by facility',
            'Percentage of facilities updated within 3 months',
            'Refrigerator last update month',
            'Facility last update month',
            'Refrigerator updates by user',
            'Facility updates by user',
        ],
        defaultViz: 'Update status by facility'
    },
    'Temp-Alarms': {
        tabLabel: 'Temp Alarms',
        visualizations: [
            'Recent alarms map'
        ],
        defaultViz: 'Recent alarms map'
    },
    'Maintenance': {
        tabLabel: 'Maintenance',
        visualizations: [
            'Non-functional CCE list'
        ],
        defaultViz: 'Non-functional CCE list'
    }
};
