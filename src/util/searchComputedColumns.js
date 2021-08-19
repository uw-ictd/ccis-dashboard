module.exports = function findQueryForColumn(computedColumns, columnName) {
    const providedBy = computedColumns
        .filter(subQueryDefn => subQueryDefn.provides.indexOf(columnName) > -1);
    if (providedBy.length === 0) {
        throw new Error(`Column ${columnName} not provided by tableName.js or computedColumns.js`);
    } else if (providedBy.length > 1) {
        throw new Error(`Column ${columnName} provided by multiple options in computedColumns.js`);
    }
    return providedBy[0];
};
