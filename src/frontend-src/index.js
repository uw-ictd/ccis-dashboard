require('./main.css');
require('tippy.js/dist/tippy.css');
const mapboxDependency = require('./map');
const RegionSelector = require('./RegionSelector');
const { drawVisualization, selectVisualization } = require('./visualizationController');
const tabSelector = require('./tabSelector');
const tabVisualizations = require('../config/tabVisualizations');
const makeMap = mapboxDependency.makeMap;
const mapDisplay = require('../config/mapDisplay').regionSelector;
const { getIndicators } = require('./indicatorsController');
const select = require('./selectors');
const { setupFilters } = require('./filter');
const browserWarning = require('./browserWarning');
const { exportClicked, exportOptionChanged } = require('./exportController');
const { exportFieldChanged } = require('./inputField');

function tabToRegionSelector(tabName) {
    const geographicBoundaries = import('../config/geographicBoundaries');
    const map = makeMap(mapDisplay, select.mapSelector(tabName));
    const regionNamesContainer = select.regionNamesContainer(tabName);
    const regionSelector = Promise.all([mapboxDependency, map, geographicBoundaries, regionNamesContainer])
        .then(([mapboxDependency, map, geographicBoundaries, regionNamesContainer]) => new RegionSelector(mapboxDependency, map, geographicBoundaries, regionNamesContainer));
    return [tabName, regionSelector];
}

document.addEventListener('DOMContentLoaded', function() {
    browserWarning.display();
    window.dismissAlert = browserWarning.dismiss;

    getIndicators();
    window.exportClicked = exportClicked;
    window.exportFieldChanged = exportFieldChanged;
    window.exportOptionChanged = exportOptionChanged; 

    setupFilters(window._dropdownFilters, tabVisualizations);

    // Create a region selector for each tab
    const regionSelectorPromises = Object.fromEntries(
        Object.keys(tabVisualizations)
            .filter(tabName => !tabVisualizations[tabName].multi && !tabVisualizations[tabName].exportTab)
            .map(tabToRegionSelector)
    );

    window.drawVisualization = async function(tabName) {
        drawVisualization(mapboxDependency, window._dropdownFilters, await regionSelectorPromises[tabName], tabName, tabVisualizations, 0);
    };
    window.tabSelector = function (tabName) {
        tabSelector(mapboxDependency, tabVisualizations, tabName);
        // Manually trigger a resize event so that the map selector shows properly
        window.dispatchEvent(new Event('resize'));
    };
    window.selectVisualization = async function(tabName) {
        selectVisualization(tabName);
    }
    // Start with first tab
    // Warning: this relies on Object.values giving a consistent order, but
    // objects are not ordered! It does seem to work, but it's a bad pattern
    select.tab(Object.keys(tabVisualizations)[0]).click();
});
