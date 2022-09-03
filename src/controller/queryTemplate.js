const tableName = require('../model/tableName');
const computedColumns = require('../config/computedColumns');
const filterSpecification = require('../config/filterSpecification');
const findQueryForColumn = require('../util/searchComputedColumns');
const validate = require('../util/configValidation');
const geographicBoundaries = require('../config/geographicBoundaries');
const enableDropdownForViz = require('../shared/filterDisable');
validate('computedColumns', computedColumns);
validate('regionBoundaries', geographicBoundaries);

const MAP_SEPARATOR = '$';

function toSQLList(array) {
    return '(' + array.map(str => `'${str}'`).join(', ') + ')';
}

const labelName = {
    groupBy: 'xlabel',
    colorBy: 'colorlabel',
    repeatBy: 'repeatlabel'
};

function referToColumn(columnName) {
    // If the column is in the base database, use that. Otherwise, look it up in
    // computedColumns
    if (tableName[columnName]) {
        return tableName[columnName] + '.' + columnName;
    } else {
        const { name } = findQueryForColumn(computedColumns, columnName);
        return `${name}.${columnName}`;
    }
}

// Adds the following clause if fieldValue is the empty string (which is how we
// represent the SQL NULL) or if fieldValue is an array containing the empty
// string
//   OR fieldName IS NULL
function handleNull(precedingClause, fieldName, fieldValue, mapType) {
    if (fieldValue === '' ||
        (Array.isArray(fieldValue) && fieldValue.indexOf('') > -1)) {
        return `(${precedingClause} OR ${fieldName} IS NULL)`;
    }
    return precedingClause;
}

function missingDataClause(columnName) {
    return `COALESCE(NULLIF(${referToColumn(columnName)}, ''), 'Missing data')`;
}

function makeHeatMapSelect(vizSpec) {
    if (vizSpec.style !== 'heatmap') return;
    const index = geographicBoundaries.levels
        .map(level => level.levelName)
        .indexOf(vizSpec.regionLevel);
    const regionColumn = referToColumn(geographicBoundaries.levels[index].dbLevelName);
    let idColumn;
    if (vizSpec.type === 'facility') {
        idColumn = referToColumn('id_health_facilities');
    } else if (vizSpec.type === 'refrigerator') {
        idColumn = referToColumn('id_refrigerators');
    }
    return `${regionColumn}, ${idColumn}`;
}

function sumColumn(columnName) {
    return `SUM(CAST(${referToColumn(columnName)} as INTEGER))`;
}

function makeAggregate(vizSpec) {
    if (vizSpec.sum) {
        return `${sumColumn(vizSpec.sum)} as count`;
    } else {
        return 'COUNT(*) as count';
    }
}

// Example:
//   t.model_id as xlabel, r.utilization as colorlabel
function makeSelect(vizSpec) {
    if (vizSpec.style === 'map') {
        return makeMapSelect(vizSpec);
    }
    if (vizSpec.style === 'list') {
        return makeListSelect(vizSpec);
    }
    return [ 'groupBy', 'colorBy', 'repeatBy' ]
        .map(param => [ param, vizSpec[param] ])
        // Ignore those that weren't included in vizSpec
        .filter(([ , columnName ]) => Boolean(columnName))
        .map(([ param, columnName ]) => {
            // Replace empty string with 'Missing data'
            return `${missingDataClause(columnName)} as ${labelName[param]}`;
        })
        .concat(makeHeatMapSelect(vizSpec))
        .concat(makeAggregate(vizSpec))
        .filter(param => Boolean(param))
        .join(', ');
}

function makeListSelect(vizSpec) {
    if (vizSpec.style === 'list') {
        return vizSpec.columns
            .map(columnName => `${missingDataClause(columnName)} as ${columnName}`)
            .join(', ');
    }
    return '';
}

// Based on the defined options in the spec, adds column aggregates
// and facility info to select.
// Example:
//   SUM(CASE WHEN COALESCE(NULLIF(refrigerators_odkx.maintenance_priority, ''), 'Missing data') = 'Missing data' THEN 1 ELSE 0 END) as "maintenance_priority.missing_data",
//   SUM(CASE WHEN refrigerators_odkx.maintenance_priority = 'high' THEN 1 ELSE 0 END) as "maintenance_priority.high",
//   SUM(CASE WHEN refrigerators_odkx.maintenance_priority = 'low' THEN 1 ELSE 0 END) as "maintenance_priority.low",
//   SUM(CASE WHEN refrigerators_odkx.maintenance_priority = 'medium' THEN 1 ELSE 0 END) as "maintenance_priority.medium",
//   SUM(CASE WHEN refrigerators_odkx.maintenance_priority = 'not_applicable' THEN 1 ELSE 0 END) as "maintenance_priority.not_applicable"
//   h.location_longitude, h.location_latitude, h.facility_name, h.id_health_facilities
function makeMapSelect(vizSpec) {
    if (vizSpec.style === 'map') {
        return Object.entries(vizSpec.facilityPopup).map(([col, options]) => {
            if (options === 'BY_FACILITY') {
                return `${missingDataClause(col)} as ${col}`;
            } else if (options === 'COUNT') {
                return `COUNT(${referToColumn(col)}) as ${col}`;
            } else if (options === 'SUM') {
                return `SUM(CAST(${referToColumn(col)} as int)) as ${col}`;
            } else {
                // options is an Array
                return `SUM(CASE WHEN ${missingDataClause(col)} = 'Missing data' THEN 1 ELSE 0 END) as "${col}${MAP_SEPARATOR}missing_data", `
                + options
                    .map(option => `SUM(CASE WHEN ${referToColumn(col)} = '${option}' THEN 1 ELSE 0 END) as "${col}${MAP_SEPARATOR}${option}"`)
                    .join(', ');
            }
        }).join(', ')
            + (', ' + makeMapGroupBy(vizSpec));
    }
    return '';
}

// regionArray represents one single region (or other thing we want to filter
// that takes the same array format). e.g. [ 'Uganda', 'Apac' ]
// Returns a string like:
//   g.regionLevel1 = Uganda AND g.regionLevel2 = Apac
function makeMultiColumnMatch({ table, columns }, regionArray) {
    const multiColumnMatch = regionArray.map((adminLevelName, i) => {
        const clause = `${table}.${columns[i]} = '${adminLevelName}'`;
        return handleNull(clause, `${table}.${columns[i]}`, adminLevelName);
    }).join(' AND ');
    return `(${multiColumnMatch})`;
}

// Example 1:
//   AND ((g.regionLevel1 = Uganda AND g.regionLevel2 = Apac)
//        OR (g.regionLevel1 = Uganda AND g.regionLevel2 = Kampala))
// Example 2:
//   AND r.maintenance_priority IN (' ', 'high', 'low', 'medium')
function makeFilterStr(vizSpec) {
    const filter = vizSpec.filter;
    if (!filter) return '';
    return 'WHERE ' + Object.entries(filterSpecification)
        .filter(([_, { table }]) => enableDropdownForViz(vizSpec, table))
        .filter(([filterName, _]) => Boolean(filter[filterName]))
        .map(([filterName, thisFilterSpec]) => {
            if (thisFilterSpec.multiColumn) {
                // filter.regions looks like:
                //   [ [ 'Uganda' ], [ 'Uganda', 'Kampala' ] ]
                const subclauses = filter[filterName].map(
                    makeMultiColumnMatch.bind({}, thisFilterSpec)
                );
                return `(${subclauses.join('\n            OR ')})`;
            } else {
                const { table, column } = thisFilterSpec;
                const clause = `${table}.${column} IN ${toSQLList(filter[filterName])}`;
                return handleNull(clause, `${table}.${column}`, filter[filterName], vizSpec.mapType);
            }
    }).join('\n        AND ');
}

// Example:
//   t.model_id, r.utilization
function makeGroupBy(vizSpec) {
    const basicGroupBy = [ 'groupBy', 'colorBy', 'repeatBy' ]
        .map(param => vizSpec[param])
        // Ignore those that weren't included in vizSpec
        .filter(columnName => Boolean(columnName))
        .map(referToColumn)
        .join(', ');
    const facilityGroupBy = makeMapGroupBy(vizSpec);
    const popupGroupBy = makePopupGroupBy(vizSpec);
    const heatMapGroupBy = makeHeatMapSelect(vizSpec);
    const result = [ basicGroupBy, facilityGroupBy, popupGroupBy, heatMapGroupBy ]
        .filter(str => Boolean(str))
        .join(', ');
    if (!result) return '';
    return 'GROUP BY ' + result;
}

// Example:
//   h.location_longitude, h.location_latitude, h.facility_name, h.id_health_facilities
function makeMapGroupBy(vizSpec) {
    if (vizSpec.style === 'map') {
        return [ 'location_latitude', 'location_longitude', 'facility_name', 'id_health_facilities']
            .map(referToColumn)
            .join(', ');
    }
    return '';
}

function makePopupGroupBy(vizSpec) {
    if (!vizSpec.facilityPopup) return '';
    return Object.keys(vizSpec.facilityPopup)
        .filter((col) => vizSpec.facilityPopup[col] === 'BY_FACILITY')
        .map(referToColumn)
        .join(', ');
}

function makeHaving(vizSpec) {
    if (vizSpec.sum) {
        return `HAVING ${sumColumn(vizSpec.sum)} > 0`;
    }
    return '';
}

function makeOrderBy(vizSpec) {
    if (vizSpec.sort === 'ASC') {
        return 'ORDER BY count ASC';
    } else if (vizSpec.sort === 'DESC') {
        return 'ORDER BY count DESC';
    } else if (vizSpec.groupBy) {
        // Default to alphabetical order, useful when each bar is a month in YYYY-MM format
        return `ORDER BY ${vizSpec.groupBy}`;
    } else {
        return '';
    }
}

function usesColumn(vizSpec, columnName) {
    return (vizSpec.colorBy === columnName ||
        vizSpec.groupBy === columnName ||
        vizSpec.repeatBy === columnName ||
        vizSpec.sum === columnName ||
        (vizSpec.columns && vizSpec.columns.indexOf(columnName) > -1) ||
        (vizSpec.facilityPopup && columnName in vizSpec.facilityPopup));
}

function joinComputedColumns(vizSpec) {
    return computedColumns
        // Get definitions for all subqueries needed for this visualization
        .filter(({ provides }) =>
            provides.some(columnName => usesColumn(vizSpec, columnName))
        )
        // Produce a join for each
        .map(({ query, name, joinOn }) => {
            const { table, foreignColumn, localColumn } = joinOn;
            return `JOIN (${query}) as ${name} ON ${table}.${foreignColumn} = ${name}.${localColumn}`;
        })
        .join('        \n ');
}

function makeRefrigeratorJoin(vizSpec) {
    if (vizSpec.type === 'facility' && vizSpec.style !== 'map') return '';
    let joinType;
    if (vizSpec.type === 'facility' && vizSpec.style === 'map') {
        joinType = 'LEFT JOIN';
    } else {
        joinType = 'JOIN';
    }
    return `${joinType} refrigerators_odkx ON health_facilities2_odkx.id_health_facilities = refrigerators_odkx.facility_row_id
        ${joinType} refrigerator_types_odkx ON refrigerator_types_odkx.id_refrigerator_types = refrigerators_odkx.model_row_id`;
}

function makeQueryStr(vizSpec) {
    return `SELECT ${makeSelect(vizSpec)}
    FROM health_facilities2_odkx
         JOIN geographic_regions_odkx ON
            geographic_regions_odkx.id_geographic_regions = health_facilities2_odkx.admin_region_id
         ${makeRefrigeratorJoin(vizSpec)}
         ${joinComputedColumns(vizSpec)}
      ${makeFilterStr(vizSpec)}
    ${makeGroupBy(vizSpec)}
    ${makeHaving(vizSpec)}
    ${makeOrderBy(vizSpec)}`;
}

function vizQuery(db, vizSpec) {
    return db.query(makeQueryStr(vizSpec));
}
// This is exposed only for testing purposes
vizQuery._makeQueryStr = makeQueryStr;

module.exports = vizQuery;
