const drawAllCharts = require('./chartDrawer');
const visualizations = require('../config/visualizations');
const { getSelection } = require('./basicMultiselect');
const { getSelectionIgnoreGroups } = require('./groupedMultiselect');
const { post } = require('./httpTools');
const mapVisualization = require('../frontend-src/mapVisualization');
const d3 = require('d3');
const select = require('./selectors');


function drawVisualization(mapboxDependency, regionSelector, tabName) {
    const vizName = getVisualizationName(tabName);
    return post('/api/query', {
        visualization: vizName,
        filter: getFilterParams(regionSelector, tabName)
    }).then(async (body) => {
        const visualization = visualizations[vizName];
        await tearDownVisualizations(tabName);
        if (visualization.style === 'map') {
            // Make the containing div element visible
            select.mapContainer(tabName).style.display = 'block';
            await mapVisualization(mapboxDependency, body.data, visualization, tabName);
        } else  {
            // Make the containing div element visible
            select.chartWrapper(tabName).style.display = 'flex';
            await drawAllCharts(body.data, body.metadata, visualization, tabName);
        }
        select.vizTitleElt(tabName).innerText = vizName;
    });
}

function getVisualizationName(tabName) {
    return select.vizSelector(tabName).value;
}

function getFilterParams(regionSelector, tabName) {
    return {
        regions: regionSelector.getSelectedRegions(),
        facilityTypes: getSelectionIgnoreGroups(select.facilitySelectorStr(tabName)),
        refrigeratorTypes: getSelectionIgnoreGroups(select.refrigeratorSelectorStr(tabName)),
        maintenancePriorities: getSelection(select.maintenanceSelectorStr(tabName))
    };
}

async function tearDownVisualizations(tabName) {
    const chartWrapperSvgStr = select.chartWrapperStr(tabName) + ' svg';
    d3.selectAll(chartWrapperSvgStr).remove(); // clear previous charts/legend
    select.mapContainer(tabName).style.display = 'none';
    select.chartWrapper(tabName).style.display = 'none';
}

module.exports = drawVisualization;
