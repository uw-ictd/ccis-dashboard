const tabVisualizations = require('../config/tabVisualizations');
const select = require('./selectors');
const { drawVisualization, selectVisualization } = require('./visualizationController');

// Check if innerHTML of DOM object is empty
function isEmpty(domObject) {
    return domObject.innerHTML.trim() === '';
}

// Function to populate the select element with appropriate options
function tabSelector(mapboxDependency, tabs, tabName) {
    // Make all tabs inactive and hide content
    Object.keys(tabs).forEach(tabToHide => {
        select.tab(tabToHide).classList.remove('active');
        select.tabContent(tabToHide).classList.add('hidden');
    });
    // Make target tab active and show content
    select.tab(tabName).classList.add('active');
    select.tabContent(tabName).classList.remove('hidden');
    if (tabs[tabName].multi) {
        tabs[tabName].visualizations.forEach((vizName, index) => {
            if (isEmpty(select.mapContainer(tabName, index)) &&
                isEmpty(select.chartContainer(tabName, index)) &&
                isEmpty(select.legendContainer(tabName, index)) &&
                isEmpty(select.listWrapper(tabName, index))) {
                    drawVisualization(mapboxDependency, null, undefined, tabName, tabVisualizations, index, vizName);
            }
        });
    } else {
        // Show default visualization for tab is there if no viz already rendered
        if ( tabs[tabName].defaultViz &&
            isEmpty(select.mapContainer(tabName, 0)) &&
            isEmpty(select.chartContainer(tabName, 0)) &&
            isEmpty(select.legendContainer(tabName, 0)) &&
            isEmpty(select.listWrapper(tabName, 0))) {
            select.vizSelector(tabName).value = tabs[tabName].defaultViz;
            selectVisualization(tabName);
            select.displayButton(tabName).click();
        }
    }
    
}

module.exports = tabSelector;
