const drawAllCharts = require('./chartDrawer');
const visualizations = require('../config/visualizations');
const { getSelection } = require('./basicMultiselect');
const { getSelectionIgnoreGroups } = require('./groupedMultiselect');
const { post } = require('./httpTools');
const { mapVisualization, removeMap } = require('../frontend-src/mapVisualization');
const d3 = require('d3');
const select = require('./selectors');
const writeTextInsteadOfChart = require('./resultText');


function drawVisualization(mapboxDependency, dropdownFilters, regionSelector, tabName) {
    const vizName = getVisualizationName(tabName);
    const visualization = visualizations[vizName];
    if (visualization.style != 'map' || select.mapContainer(tabName).style.display == 'none') {
        tearDownVisualizations(tabName);
        writeTextInsteadOfChart('Visualization is loading...', tabName);
    }
    return post('./api/query', {
        visualization: vizName,
        filter: getFilterParams(dropdownFilters, regionSelector, tabName)
    }).then(async (body) => {
        if (visualization.style != 'map' || select.mapContainer(tabName).style.display == 'none') {
            removeText(tabName);
            tearDownVisualizations(tabName);
        }
        if (visualization.style === 'map') {
            // Make the containing div element visible
            select.mapContainer(tabName).style.display = 'block';
            await mapVisualization(mapboxDependency, body.data, visualization, tabName);
        } else  {;
            if (!body.data.length) {
                writeTextInsteadOfChart('No data match your chosen filters', tabName);
                select.vizTitleElt(tabName).innerText = vizName;
                return;
            }
            // Make the containing div element visible
            select.chartWrapper(tabName).style.display = 'flex';
            await drawAllCharts(body.data, body.metadata, visualization, tabName);
        }
        select.vizTitleElt(tabName).innerText = vizName;
    }).catch(async (error) => {
        console.log(error);
        await removeText(tabName);
        writeTextInsteadOfChart('Error attempting to retrieve data', tabName);
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
    removeText(tabName);
    removeMap(tabName);
}

module.exports = drawVisualization;
