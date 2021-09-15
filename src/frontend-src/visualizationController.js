const drawAllCharts = require('./chartDrawer');
const visualizations = require('../config/visualizations');
const { getSelection } = require('./basicMultiselect');
const { getSelectionIgnoreGroups } = require('./groupedMultiselect');
const { post } = require('./httpTools');
const { mapVisualization, heatmapVisualization, removeMap } = require('../frontend-src/mapVisualization');
const drawLineList = require('./lineList');
const d3 = require('d3');
const select = require('./selectors');
const writeTextInsteadOfChart = require('./resultText');

function drawVisualization(mapboxDependency, dropdownFilters, regionSelector, tabName) {
    const vizName = getVisualizationName(tabName);
    const visualization = visualizations[vizName];
    if ((visualization.style != 'map' && visualization.style != 'heatmap') || select.mapContainer(tabName).style.display == 'none') {
        tearDownVisualizations(tabName);
        writeTextInsteadOfChart('Visualization is loading...', tabName);
    }
    return post('./api/query', {
        visualization: vizName,
        filter: getFilterParams(dropdownFilters, regionSelector, tabName)
    }).then(async (body) => {
        // Clean up, unless  we're drawing a map when there was a map before
        if ((visualization.style != 'map' && visualization.style != 'heatmap') ||
            select.mapContainer(tabName).style.display == 'none') {
            removeText(tabName);
            tearDownVisualizations(tabName);
        }
        // Alert for empty result
        if (!body.data.length) {
            writeTextInsteadOfChart('No data match your chosen filters', tabName);
            select.vizTitleElt(tabName).innerText = vizName;
            return;
        }
        // Draw the proper visualization type
        if (visualization.style === 'map') {
            // Make the containing div element visible
            select.mapContainer(tabName).style.display = 'block';
            await mapVisualization(mapboxDependency, body.data, body.metadata, visualization, tabName);
        } else if (visualization.style === 'heatmap') {
            // Make the containing div element visible
            select.mapContainer(tabName).style.display = 'block';
            await heatmapVisualization(mapboxDependency, body.data, visualization, tabName);
        } else if (visualization.style === 'list') {
            select.listWrapper(tabName).style.display = 'flex';
            drawLineList(body.data, visualization, tabName, vizName);
        } else {
            // Make the containing div element visible
            select.chartWrapper(tabName).style.display = 'flex';
            await drawAllCharts(body.data, body.metadata, visualization, tabName);
        }
    }).catch(async (error) => {
        console.log(error);
        await removeText(tabName);
        writeTextInsteadOfChart('Error attempting to retrieve data', tabName);
    }).finally(() => {
        select.vizTitleElt(tabName).innerText = vizName;
    });
}

function getVisualizationName(tabName) {
    return select.vizSelector(tabName).value;
}

function getFilterParams(dropdownFilters, regionSelector, tabName) {
    const params = Object.fromEntries(dropdownFilters.map(([filterID, filter]) => {
        const selector = select.filterStr(tabName, filterID);
        let selection;
        if (filter.grouped) {
            selection = getSelectionIgnoreGroups(selector);
        } else {
            selection = getSelection(selector);
        }
        return [filterID, selection];
    }));
    params.regions = regionSelector.getSelectedRegions();
    return params;
}

function removeText(tabName) {
    select.resultTextContainer(tabName).style.display = 'none';
    const resultTextContainerSvgStr = select.resultTextContainerStr(tabName) + ' svg';
    d3.selectAll(resultTextContainerSvgStr).remove();
}

function tearDownVisualizations(tabName) {
    const chartWrapperSvgStr = select.chartWrapperStr(tabName) + ' svg';
    d3.selectAll(chartWrapperSvgStr).remove(); // clear previous charts/legend
    select.mapContainer(tabName).style.display = 'none';
    select.chartWrapper(tabName).style.display = 'none';
    select.listWrapper(tabName).style.display = 'none';
    removeText(tabName);
    removeMap(tabName);
}

module.exports = drawVisualization;
