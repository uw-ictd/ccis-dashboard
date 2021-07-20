require('./multiselect/multiselect.css');
require('./filter.css');
const { multiselect } = require('./basicMultiselect');
const { groupedMultiselect } = require('./groupedMultiselect');

// The maintenance selector does not use any grouping
multiselect('#maintenance-selector');

// These 2 ___Classes variables are attached to the window object through
// views/index.ejs
groupedMultiselect('#facility-selector', facilityClasses);
groupedMultiselect('#refrigerator-selector', refrigeratorClasses);
