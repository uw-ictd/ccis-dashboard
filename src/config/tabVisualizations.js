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
            'Working status by CCE model',
            'Age by CCE model',
            'CCE by working status',
            'CCE by working status (pie)'
        ],
        defaultViz: 'Working status by CCE model'
    },
    'CCE': {
        tabLabel: 'CCE',
        visualizations: [
            'CCE utilization',
            'Electricity availability',
            'Electricity availability (pie)',
            'CCE models by age group'
        ],
        defaultViz: 'CCE models by age group'
    },
    'Vaccines': {
        tabLabel: 'Vaccines',
        visualizations: [
            'CCE models by age group (pie)',
            'Maintenance priority by facility',
            'CCE by type (pie)',
            'CCE model (bar)',
            'CCE utilization (bar)',
            'CCE maintenance priority (bar)'
        ],
        defaultViz: 'CCE utilization (bar)'
    },
    'System-Use': {
        tabLabel: 'System Use',
        visualizations: [
            'Maintence priority by model',
            'CCE facility power availability by model',
            'CCE model by facility power availability',
            'CCE model by facility type',
            'Facility type by CCE model'
        ],
        defaultViz: 'CCE facility power availability by model'
    },
    'Temp-Alarms': {
        tabLabel: 'Temp Alarms',
        visualizations: [
            'Recent alarms map',
            'CCE models by age group (pie)',
            'Maintenance priority by facility',
            'CCE by type (pie)',
            'CCE model (bar)',
            'CCE utilization (bar)',
            'CCE maintenance priority (bar)'
        ],
        defaultViz: 'Recent alarms map'
    },
    'Maintenance': {
        tabLabel: 'Maintenance',
        visualizations: [
            'CCE utilization',
            'Electricity availability',
            'Electricity availability (pie)',
            'CCE models by age group'
        ],
        defaultViz: 'CCE models by age group'
    }
};
