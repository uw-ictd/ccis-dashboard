/*
 * This defines the names of the tabs, and the visualizations for each tab.
 */

module.exports = {
    mainsummary: {
        tabLabel: 'Summary',
        multi: true,
        visualizations: [
            'Age by CCE type',
            'CCE utilization (bar)',
            'CCE by working status',
            'Update status by facility'
        ]
    },
    maintenanceoverview: {
        tabLabel: 'Maintenance Overview',
        multi: true,
        visualizations: [
            'Maintenance priority by facility',
            'Recent alarms map',
            'Models of CCE with maintenance needs',
            'Non-functional CCE list'
        ]
    },
    'Export': {
        tabLabel: 'Export',
        exportTab: true
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
            'CCE with Electricity availability',
            'CCE with Electricity availability (pie)',
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
            'CCE models by age group',
            'CCE models by age group (pie)',
            'Maintenance priority by model',
            'Models of CCE with maintenance needs',
            'Maintenance priority by facility',
            'CCE by type (pie)',
            'CCE model (bar)',
            'CCE utilization (bar)',
            'CCE maintenance priority (bar)',
            'CCE model by facility power availability',
            'CCE facility power availability by model',
            'CCE model by facility type',
            'CCE type by facility type',
            'Facility type by CCE model',
            'All CCE list'
        ],
        defaultViz: 'Age by CCE model'
    },
    /*
     * // Demo data
     *'Vaccines': {
     *    tabLabel: 'Vaccines',
     *    visualizations: [
     *        'Refrigeration volume vs requirements map (demo)',
     *        'Freezer volume vs requirements map (demo)',
     *        'Facilities with volume shortage (demo)'
     *    ],
     *    defaultViz: 'Refrigeration volume vs requirements map (demo)',
     *},
     */
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
            'Recent alarms map',
            'High alarms by model',
            'Low alarms by model',
            'High alarms by manufacturer',
            'Low alarms by manufacturer',
            'High alarms by facility level',
            'Low alarms by facility level'
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
