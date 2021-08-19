const { mapValues } = require('async');
const mergeFilterOptions = require('../util/mergeFilterOptions');

async function buildDropdownData(db, filterSpecification) {
    const completeFilterPromises = Object.entries(filterSpecification)
        .filter(([_, filter]) => filter.useInDropdowns)
        .map(async ([key, filter]) => {
            const rows = await db.query(`SELECT DISTINCT ${filter.column} FROM ${filter.table}`);
            const valuesFromDB = rows.map(row => row[filter.column]);
            // Clone the filter specification
            const newFilter = Object.assign({}, filter);
            // If this filter is grouping options into classes, populate the
            // `classes:` field instead of the `options:` one
            if (filter.grouped) {
                newFilter.classes = mergeFilterOptions(filter.classes, valuesFromDB);
            } else {
                newFilter.options = valuesFromDB;
            }
            return [key, newFilter];
        });
    return await Promise.all(completeFilterPromises);
}


module.exports = buildDropdownData;
