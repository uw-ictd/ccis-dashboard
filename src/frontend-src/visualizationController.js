const drawAllCharts = require('./chartDrawer');
const visualizations = require('../config/visualizations');
const { getSelection } = require('./basicMultiselect');
const { getSelectionIgnoreGroups } = require('./groupedMultiselect');
const { post } = require('./httpTools');
const mapDisplay = require('../config/mapDisplay');
const { mapVisualization, heatmapVisualization, removeMap } = require('../frontend-src/mapVisualization');
const drawLineList = require('./lineList');
const d3 = require('d3');
const select = require('./selectors');
const writeTextInsteadOfChart = require('./resultText');
const tabVisualizations = require('../config/tabVisualizations');

function drawVisualization(mapboxDependency, dropdownFilters, regionSelector, tabName, index, visualizationName) {
    const vizName = tabVisualizations[tabName].multi ? visualizationName: getVisualizationName(tabName);
    const mapConfig = tabVisualizations[tabName].multi ? mapDisplay.smallMapMultiviz : mapDisplay.mapVisualization;
    const visualization = visualizations[vizName];
    if ((visualization.style != 'map' && visualization.style != 'heatmap') || select.mapContainer(tabName, index).style.display == 'none') {
        tearDownVisualizations(tabName, index);
        writeTextInsteadOfChart('Visualization is loading...', tabName, index);
    }
    return post('./api/query', {
        visualization: vizName,
        filter: getFilterParams(dropdownFilters, regionSelector, tabName)
    }).then(async (body) => {
        // Clean up, unless  we're drawing a map when there was a map before
        if ((visualization.style != 'map' && visualization.style != 'heatmap') ||
            select.mapContainer(tabName, index).style.display == 'none' ||
            !body.data.length) {
            removeText(tabName, index);
            tearDownVisualizations(tabName, index);
        }
        // Alert for empty result
        if (!body.data.length) {
            writeTextInsteadOfChart('No data match your chosen filters', tabName, index);
            select.vizTitleElt(tabName, index).innerText = vizName;
            return;
        }
        // Draw the proper visualization type
        if (visualization.style === 'map') {
            // Make the containing div element visible
            select.mapContainer(tabName, index).style.display = 'block';
            await mapVisualization(mapboxDependency, body.data, body.metadata, visualization, tabName, mapConfig, index);
        } else if (visualization.style === 'heatmap') {
            // Make the containing div element visible
            select.mapContainer(tabName, index).style.display = 'block';
            await heatmapVisualization(mapboxDependency, body.data, visualization, tabName, mapConfig, index);
        } else if (visualization.style === 'list') {
            select.listWrapper(tabName, index).style.display = 'flex';
            drawLineList(body.data, visualization, tabName, vizName, index);
        } else {
            // Make the containing div element visible
            select.chartWrapper(tabName, index).style.display = 'flex';
            await drawAllCharts(body.data, body.metadata, visualization, tabName, index);
        }
    }).catch(async (error) => {
        console.log(error);
        await removeText(tabName, index);
        writeTextInsteadOfChart('Error attempting to retrieve data', tabName, index);
    }).finally(() => {
        select.vizTitleElt(tabName, index).innerText = vizName;
    });
}

function getVisualizationName(tabName) {
    return select.vizSelector(tabName).value;
}

function getFilterParams(dropdownFilters, regionSelector, tabName) {
    if (!dropdownFilters) {
        return null;
    }
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

function removeText(tabName, index) {
    select.resultTextContainer(tabName, index).style.display = 'none';
    const resultTextContainerSvgStr = select.resultTextContainerStr(tabName, index) + ' svg';
    d3.selectAll(resultTextContainerSvgStr).remove();
}

function tearDownVisualizations(tabName, index) {
    const chartWrapperSvgStr = select.chartWrapperStr(tabName, index) + ' svg';
    d3.selectAll(chartWrapperSvgStr).remove(); // clear previous charts/legend
    select.mapContainer(tabName, index).style.display = 'none';
    select.chartWrapper(tabName, index).style.display = 'none';
    select.listWrapper(tabName, index).style.display = 'none';
    removeText(tabName, index);
    removeMap(tabName, index);
}

module.exports = drawVisualization;
