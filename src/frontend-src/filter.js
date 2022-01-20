require('./multiselect/multiselect.css');
require('./filter.css');
const { multiselect } = require('./basicMultiselect');
const { groupedMultiselect } = require('./groupedMultiselect');
const select = require('./selectors');
const tabs = require('../config/tabVisualizations');
const tabVisualizations = require('../config/tabVisualizations');

function setupFilters(dropdownFilters) {
    Object.keys(tabs)
        .filter(tab => !tabVisualizations[tab].multi && !tabVisualizations[tab].exportTab)
        .forEach(tabName => {
            dropdownFilters.forEach(([filterID, filter]) => {
                if (filter.grouped) {
                    groupedMultiselect(select.filterStr(tabName, filterID), filter.classes);
                } else {
                    multiselect(select.filterStr(tabName, filterID));
                }
            });
    });
}

function setFilterEnabled(tabName, filterID, enabled) {
    id = select.filterStr(tabName, filterID);
    const temp = document.multiselect(id);
    temp.setIsEnabled(enabled);
}
module.exports = {setupFilters, setFilterEnabled}
