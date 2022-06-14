const mergeFilterOptions = require('../util/mergeFilterOptions');
const visualizations = require('../config/visualizations');
const tabVisualizations = require('../config/tabVisualizations');
const getDistinctFilterOptions = require('../controller/filterOptions');
const exportOptions = require('../shared/exportOptions');
const filterSpecification = require('../config/filterSpecification');
const buildDropdownData = require('../controller/filterOptions');
const { version } = require('../../package.json'); // Note: don't import package.json client-side
const validate = require('../util/configValidation')
validate('tabVisualizations', tabVisualizations);
validate('visualizations', visualizations);
validate('filterSpecification', filterSpecification);
validate('exportOptions', exportOptions);

async function getIndexData(db)  {
    // buildDropdownData runs simple database queries. To optimize
    // page loading, these results could potentially be cached
    const filters = await buildDropdownData(db, filterSpecification);
    return {
        version,
        visualizations,
        tabVisualizations,
        filters,
        exportOptions: exportOptions
    };
}

module.exports = getIndexData;
