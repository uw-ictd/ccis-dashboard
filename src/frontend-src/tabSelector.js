const select = require('./selectors');

// Check if innerHTML of DOM object is empty
function isEmpty(domObject) {
    return domObject.innerHTML.trim() === '';
}

// Function to populate the select element with appropriate options
function tabSelector(tabs, tabName) {
    // Make all tabs inactive and hide content
    Object.keys(tabs).forEach(tabToHide => {
        select.tab(tabToHide).classList.remove('active');
        select.tabContent(tabToHide).classList.add('hidden');
    });
    // Make target tab active and show content
    select.tab(tabName).classList.add('active');
    select.tabContent(tabName).classList.remove('hidden');

    // Show default visualization for tab is there if no viz already rendered
    if (isEmpty(select.mapContainer(tabName)) &&
        isEmpty(select.chartContainer(tabName)) &&
        isEmpty(select.legendContainer(tabName)) &&
        tabs[tabName].defaultViz) {
        select.vizSelector(tabName).value = tabs[tabName].defaultViz;
        select.displayButton(tabName).click();
    }
}

module.exports = tabSelector;
