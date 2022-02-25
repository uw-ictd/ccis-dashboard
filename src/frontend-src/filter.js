require('./multiselect/multiselect.css');
require('./filter.css');
const { multiselect } = require('./basicMultiselect');
const { groupedMultiselect } = require('./groupedMultiselect');
const select = require('./selectors');
const tabs = require('../config/tabVisualizations');
const tabVisualizations = require('../config/tabVisualizations');

function setupFilters(dropdownFilters, tabToFilters) {
    Object.keys(tabs)
        .filter(tab => !tabVisualizations[tab].multi && !tabVisualizations[tab].exportTab)
        .forEach(tabName => {
            tabToFilters[tabName].enabledFilters
            .forEach(filterID => {
                if (dropdownFilters[filterID].grouped) {
                    groupedMultiselect(select.filterStr(tabName, filterID), dropdownFilters[filterID].classes);
                } else {
                    multiselect(select.filterStr(tabName, filterID));
                }
            });
    });
}

function setFilterEnabled(tabName, filterID, enabled) {
    if (tabVisualizations[tabName].enabledFilters.includes(filterID)) {
        const id = select.filterStr(tabName, filterID);
        document.multiselect(id).setIsEnabled(enabled);
    }

}
module.exports = {setupFilters, setFilterEnabled}
