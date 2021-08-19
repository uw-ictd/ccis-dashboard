const tableName = require('../model/tableName');
const findQueryForColumn = require('../util/searchComputedColumns');
const computedColumns = require('../config/computedColumns');

function legendQuery(db, vizSpec) {
    if (vizSpec.style === 'map') return [];
    return db.query(makeLegendQuery(vizSpec));
}

function makeLegendQuery(vizSpec) {
    const colName = vizSpec.colorBy;
    let table = tableName[colName];
    if (!table) {
        const subQueryDefn = findQueryForColumn(computedColumns, colName);
        table = `(${subQueryDefn.query}) as ${subQueryDefn.name}`;
    }
    return `SELECT DISTINCT COALESCE(NULLIF(${colName}, ''), 'Missing data') as colorlabel
         FROM ${table} ORDER BY colorlabel DESC`;
}

module.exports = legendQuery;
