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
const filterSpecification = require('../config/filterSpecification');
const enableDropdownForViz = require('../shared/filterDisable');
const { setFilterEnabled } = require('./filter');

function drawVisualization(mapboxDependency, dropdownFilters, regionSelector, tabName, tabToFilters, index, visualizationName) {
    const vizName = tabVisualizations[tabName].multi ? visualizationName: getVisualizationName(tabName);
    const mapConfig = tabVisualizations[tabName].multi ? mapDisplay.smallMapMultiviz : mapDisplay.mapVisualization;
    const visualization = visualizations[vizName];
    tearDownVisualizationsNonMap(tabName, index);
    if ((visualization.style != 'map' && visualization.style != 'heatmap') || select.mapContainer(tabName, index).style.display == 'none') {
        tearDownMap(tabName, index);
        writeTextInsteadOfChart('Visualization is loading...', tabName, index);
    }
    return post('/api/query', {
        visualization: vizName,
        filter: getFilterParams(dropdownFilters, regionSelector, tabName, tabToFilters)
    }).then(async (body) => {
        // Clean up, unless  we're drawing a map when there was a map before
        tearDownVisualizationsNonMap(tabName, index);
        if ((visualization.style != 'map' && visualization.style != 'heatmap') ||
            select.mapContainer(tabName, index).style.display == 'none' ||
            !body.data.length) {
            tearDownMap(tabName, index);
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
            select.chartContainer(tabName, index).style.display = 'block';
            const multi = tabVisualizations[tabName].multi;
            await drawAllCharts(body.data, body.metadata, visualization, {tabName, multi, index});
        }
    }).catch(async (error) => {
        console.log(error);
        await removeTextContainer(tabName, index);
        writeTextInsteadOfChart('Error attempting to retrieve data', tabName, index);
    }).finally(() => {
        select.vizTitleElt(tabName, index).innerText = vizName;
    });
}

function getVisualizationName(tabName) {
    return select.vizSelector(tabName).value;
}

function getFilterParams(dropdownFilters, regionSelector, tabName, tabToFilters) {
    if (!dropdownFilters) {
        return null;
    }
    const params = Object.fromEntries(tabToFilters[tabName].enabledFilters
        .map(filterID => {
            const selector = select.filterStr(tabName, filterID);
            let selection;
            if (dropdownFilters[filterID].grouped) {
                selection = getSelectionIgnoreGroups(selector);
            } else {
                selection = getSelection(selector);
            }
            return [filterID, selection];
        }));
    params.regions = regionSelector.getSelectedRegions();
    return params;
}

function removeTextContainer(tabName, index) {
    const resultTextContainerResultStr = select.chartWrapperStr(tabName, index) + ' .result-text';
    d3.selectAll(resultTextContainerResultStr).remove();
}

function tearDownVisualizationsNonMap(tabName, index) {
    const chartWrapperSvgStr = select.chartWrapperStr(tabName, index) + ' svg';
    d3.selectAll(chartWrapperSvgStr).remove(); // clear previous charts/legend
    select.chartContainer(tabName, index).style.display = 'none';
    select.listWrapper(tabName, index).style.display = 'none';
    select.showBarNumsContainer(tabName).innerHTML = '';
    removeTextContainer(tabName, index);
}

function tearDownMap(tabName, index) {
    select.mapContainer(tabName, index).style.display = 'none';
    removeMap(tabName, index);
}

function selectVisualization(tabName) {
    const vizName = getVisualizationName(tabName);
    Object.entries(filterSpecification)
        .filter(([filterID, filterObj]) => filterObj.useInDropdowns)
        .forEach(([filterID, filterObj]) => {
            setFilterEnabled(tabName, filterID, enableDropdownForViz(visualizations[vizName], filterObj.table));
        })
}

module.exports = {drawVisualization, selectVisualization};
