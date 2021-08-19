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
            'Facility type by CCE model'
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
            'Facility type by CCE model'
        ],
        defaultViz: 'Age by CCE model'
    },
    'Vaccines': {
        tabLabel: 'Vaccines',
        visualizations: [
            'CCE utilization (bar)',
        ],
        defaultViz: 'CCE utilization (bar)'
    },
    'System-Use': {
        tabLabel: 'System Use',
        visualizations: [
            'Refrigerator last update month',
            'Facility last update month',
            'Facility updates by user'
        ],
        defaultViz: 'Refrigerator last update month'
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
            'CCE models by age group'
        ],
        defaultViz: 'CCE models by age group'
    }
};
