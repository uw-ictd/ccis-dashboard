require('./main.css');
require('tippy.js/dist/tippy.css');
const mapboxDependency = require('./map');
const RegionSelector = require('./RegionSelector');
const drawVisualization = require('./visualizationController');
const tabSelector = require('./tabSelector');
const tabVisualizations = require('../config/tabVisualizations');
const makeMap = mapboxDependency.makeMap;
const mapDisplay = require('../config/mapDisplay').regionSelector;
const { getIndicators } = require('./indicatorsController');
const select = require('./selectors');

function tabToRegionSelector(tabName) {
    const shapefiles = import('../config/shapefiles');
    const map = makeMap(mapDisplay, select.mapSelector(tabName));
    const regionSelector = Promise.all([map, shapefiles])
        .then(([map, shapefiles]) => new RegionSelector(map, shapefiles));
    return [tabName, regionSelector];
}

document.addEventListener('DOMContentLoaded', function() {
    getIndicators();
    window.exportTables = require('./exportController');
    require('./filter');

    // Create a region selector for each tab
    const regionSelectorPromises = Object.fromEntries(Object.keys(tabVisualizations).map(tabToRegionSelector));

    window.drawVisualization = async function(tabName) {
        drawVisualization(mapboxDependency, await regionSelectorPromises[tabName], tabName);
    };
    window.tabSelector = function (tabName) {
        tabSelector(tabVisualizations, tabName);
        // Manually trigger a resize event so that the map selector shows properly
        window.dispatchEvent(new Event('resize'));
    };
    // Start with export tab as default
    select.tab('Export').click();
});
