const { mapValues } = require('async');
const filterSpecification = require('./filterSpecification');

function getDistinctFilterOptions(db) {
    return mapValues(filterSpecification, async ({ table, column, useInDropdowns }) => {
        if (!useInDropdowns) return null;
        const rows = await db.query(`SELECT DISTINCT ${column} FROM ${table}`);
        return rows.map(row => row[column]);
    });
}

module.exports = getDistinctFilterOptions;
