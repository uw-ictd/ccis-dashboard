require('./multiselect/multiselect.css');
require('./filter.css');
const { multiselect } = require('./basicMultiselect');
const { groupedMultiselect } = require('./groupedMultiselect');
const select = require('./selectors');
const tabs = require('../config/tabVisualizations');

Object.keys(tabs).forEach(tabName => {
    // The maintenance selector does not use any grouping
    multiselect(select.maintenanceSelectorStr(tabName));

    // These 2 ___Classes variables are attached to the window object through
    // views/index.ejs
    groupedMultiselect(select.facilitySelectorStr(tabName), facilityClasses);
    groupedMultiselect(select.refrigeratorSelectorStr(tabName), refrigeratorClasses);
});
