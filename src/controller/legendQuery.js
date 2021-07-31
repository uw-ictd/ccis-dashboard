const tableName = require('../model/tableName');

const AGE_GROUPS_LEGEND = [
    { colorLabel: '0-5 Years' },
    { colorLabel: '6-10 Years' },
    { colorLabel: '>10 Years' },
    { colorLabel: 'Missing data' }
];

function legendQuery(db, vizSpec) {
    if (vizSpec.style === 'map') {
        return [];
    } else if (isAgeGroups(vizSpec)) {
        // age brackets hardcoded into the legend are from makeBucketByAge() CASE statement in controller/QueryTemplate.js
        return AGE_GROUPS_LEGEND;
    }
    else {
        return db.query(makeLegendQuery(vizSpec));
    }
}

function isAgeGroups(vizSpec) {
    const colName = vizSpec.colorBy;
    return colName === '"Age Groups"';
}

function makeLegendQuery(vizSpec) {
    const colName = vizSpec.colorBy;
    return `SELECT DISTINCT COALESCE(NULLIF(${colName}, ''), 'Missing data') as colorLabel
         FROM ${tableName[colName]} ORDER BY colorLabel DESC`;
}

module.exports = legendQuery;
