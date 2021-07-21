const drawAllCharts = require('./chartDrawer');
const visualizations = require('../shared/visualizations');
const { getSelection } = require('./basicMultiselect');
const { getSelectionIgnoreGroups } = require('./groupedMultiselect');
const { post } = require('./httpTools');
const mapVisualization = require('../frontend-src/mapVisualization');
const d3 = require('d3');

let maps = [];

function drawVisualization(mapboxDependency, regionSelector) {
    const vizName = getVisualizationName();
    return post('./api/query', {
        visualization: vizName,
        filter: getFilterParams(regionSelector)
    }).then(async (body) => {
        const visualization = visualizations[vizName];
        await tearDownVisualizations();
        if (visualization.style === 'map') {
            // Make the containing div element visible
            document.getElementById('map-container').style.display = 'block';
            const map = await mapVisualization(mapboxDependency, body.data, visualization);
            maps.push(map);
        } else  {
            // Make the containing div element visible
            document.getElementById('chart-wrapper').style.display = 'flex';
            await drawAllCharts(body.data, body.metadata, visualization);
        }
    });
}

function getVisualizationName() {
    return document.getElementById('visualization-selector').value;
}

function getFilterParams(regionSelector) {
    return {
        regions: regionSelector.getSelectedRegions(),
        facilityTypes: getSelectionIgnoreGroups('facility-selector'),
        refrigeratorTypes: getSelectionIgnoreGroups('refrigerator-selector'),
        maintenancePriorities: getSelection('maintenance-selector')
    };
}

async function tearDownVisualizations() {
    d3.selectAll('#chart-wrapper svg').remove(); // clear previous charts/legend
    document.getElementById('map-container').style.display = 'none';
    document.getElementById('chart-wrapper').style.display = 'none';
    await Promise.all(maps.map(map => map.remove()));
    maps = [];
}

module.exports = drawVisualization;
