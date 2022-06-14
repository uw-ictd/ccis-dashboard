/*
 * This defines the names of the tabs, and the visualizations for each tab.
 * Schema:
 *   tabLabel String [required], a unique identifier for the tab, will be displayed on the tab
 *   multi boolean [optional], whether this is a multi-tab, containing multiple visualizations
 *   visualizations [required iff !exportTab], the list of visualizations on this tab
 *   exportTab boolean [optional], whether this tab only exports data
 *   defaultViz [required iff !exportTab & !multi] the default visualization displayed for a regular tab
 *   enabledFilters [required iff !exportTab & !multi] the filters enabled on this tab, not including "regions"
 *                                    * must match a filter in filterSpecification.js
 */

module.exports = {
    mainsummary: {
        tabLabel: 'Summary',
        multi: true,
        visualizations: [
            'CCE by working status',
            'CCE utilization (bar)',
            'Age by manufacturer',
            'Update status by facility'
        ]
    },
    maintenanceoverview: {
        tabLabel: 'Maintenance Overview',
        multi: true,
        visualizations: [
            'Maintenance priority by facility',
            'Recent alarms map',
            'Make of CCE with maintenance needs',
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
            'Percentage of facilities with freezer capacity',
            'Percentage of facilities with refrigerator capacity',
            'Catchment population',
            'CCE model by facility power availability',
            'CCE facility power availability by model',
            'CCE model by facility type',
            'Facility type by CCE model',
            'Percentage of facilities with power source: grid (region)',
            'Percentage of facilities with 4+ hours of grid power (region)',
            'CCE with Electricity availability',
            'CCE with Electricity availability (pie)',
            'All facilities list'
        ],
        defaultViz: 'Facility details map',
        enabledFilters: [
            'facilityTypes',
            'facilityElectricity',
            'facilityGridPower',
            'facilityOwnership',
            'facilityAuthority',
            'facilityStatus',
            'lastUpdateUserFacilities'
        ]
    },
    'CCE': {
        tabLabel: 'CCE',
        visualizations: [
            'Working status by CCE manufacturer',
            'Working status by CCE model',
            'Age by manufacturer',
            'Age by CCE model',
            'Age by CCE model (normalized)',
            'Age by CCE type',
            'Age by CCE type (normalized)',
            'Age by facility type (normalized)',
            'CCE by working status',
            'CCE by working status (pie)',
            'CCE utilization',
            'CCE models by age group',
            'CCE models by age group (pie)',
            'Make of CCE with maintenance needs',
            'Models of CCE with maintenance needs',
            'Maintenance priority by model',
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
        defaultViz: 'Working status by CCE manufacturer',
        enabledFilters: [
            'facilityTypes',
            'facilityElectricity',
            'facilityGridPower',
            'facilityOwnership',
            'facilityAuthority',
            'facilityStatus',
            'maintenancePriorities',
            'refrigeratorTypes',
            'lastUpdateUserFacilities',
            'lastUpdateUserRefrigerators'
        ]
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
            'CCE update status by region',
            'Facility update status by region',
            'CCE update status by district (use map to filter by region)',
            'Facility update status by district (use map to filter by region)',
            'Update status by facility',
            'Percentage of facilities updated within 3 months',
            'Refrigerator last update month',
            'Facility last update month',
            'Refrigerator updates by user',
            'Facility updates by user',
        ],
        defaultViz: 'CCE update status by region',
        enabledFilters: [
            'facilityTypes',
            'facilityElectricity',
            'facilityGridPower',
            'facilityOwnership',
            'facilityAuthority',
            'facilityStatus',
            'maintenancePriorities',
            'refrigeratorTypes',
            'lastUpdateUserFacilities',
            'lastUpdateUserRefrigerators'
        ]
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
        defaultViz: 'Recent alarms map',
        enabledFilters: [
            'facilityTypes',
            'facilityElectricity',
            'facilityGridPower',
            'facilityOwnership',
            'facilityAuthority',
            'facilityStatus',
            'maintenancePriorities',
            'refrigeratorTypes',
            'lastUpdateUserFacilities',
            'lastUpdateUserRefrigerators'
        ]
    },
    'Maintenance': {
        tabLabel: 'Maintenance',
        visualizations: [
            'Non-functional CCE list',
            'Number of nonfunctional equipment'
        ],
        defaultViz: 'Non-functional CCE list',
        enabledFilters: [
            'facilityTypes',
            'facilityElectricity',
            'facilityGridPower',
            'facilityOwnership',
            'facilityAuthority',
            'facilityStatus',
            'maintenancePriorities',
            'refrigeratorTypes',
            'lastUpdateUserFacilities',
            'lastUpdateUserRefrigerators'
        ]
    }
};
