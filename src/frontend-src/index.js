require('./main.css');
require('tippy.js/dist/tippy.css');
const mapboxDependency = require('./map');
const RegionSelector = require('./RegionSelector');
const drawVisualization = require('./visualizationController');
const makeMap = mapboxDependency.makeMap;
const { getIndicators } = require('./indicatorsController');

document.addEventListener('DOMContentLoaded', function() {
    getIndicators();
    window.exportTables = require('./exportController');
    require('./filter');
    const map = makeMap({
        center: [32, 1], // starting position [lng, lat]
        zoom: 6 // starting zoom
    }, 'map');
    const shapefiles = import('./ugandaShapefiles');
    const regionSelectorPromise = Promise.all([map, shapefiles])
        .then(([map, shapefiles]) => {
        return new RegionSelector(map, shapefiles, {
            // The map will only show boundaries between these two levels
            // Each must be an element of shapefiles.levelNames
            // `topLevel` must come before `bottomLevel` in
            // `shapefiles.levelNames` and `shapefiles.levels`
            topLevel: 'Region (Level 2)',
            bottomLevel: 'District (Level 3)'
        });
    });
    window.drawVisualization = async function() {
        drawVisualization(mapboxDependency, await regionSelectorPromise);
    };
});
