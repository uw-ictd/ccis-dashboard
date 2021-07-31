const tableName = require('../model/tableName');
const filterSpecification = require('./filterSpecification');
const AGE_GROUPS_COLUMN_NAME = '"Age Groups"';
const MAP_SEPARATOR = '$';

function toSQLList(array) {
    return '(' + array.map(str => `'${str}'`).join(', ') + ')';
}

const labelName = {
    groupBy: 'xlabel',
    colorBy: 'colorLabel',
    repeatBy: 'repeatLabel'
};

function referToColumn(columnName) {
    if (columnName === AGE_GROUPS_COLUMN_NAME) {
        return AGE_GROUPS_COLUMN_NAME;
    }
    return tableName[columnName] + '.' + columnName;
}

// Adds the following clause if fieldValue is the empty string (which is how we
// represent the SQL NULL) or if fieldValue is an array containing the empty
// string
//   OR fieldName IS NULL
function handleNull(precedingClause, fieldName, fieldValue, mapType) {
    if (fieldValue === '' ||
        (fieldValue.length && fieldValue.indexOf('') > -1)
        || (mapType && mapType === 'facility_details' &&
            fieldName === 'health_facilities2_odkx.facility_level')) {
        return `(${precedingClause} OR ${fieldName} IS NULL)`;
    }
    return precedingClause;
}

function missingDataClause(columnName) {
    return `COALESCE(NULLIF(${referToColumn(columnName)}, ''), 'Missing data')`;
}

// Example:
//   t.model_id as xlabel, r.utilization as colorLabel
function makeSelect(vizSpec) {
    if (vizSpec.style == 'map') {
        return makeMapSelect(vizSpec);
    }
    return [ 'groupBy', 'colorBy', 'repeatBy' ]
        .map(param => [ param, vizSpec[param] ])
        // Ignore those that weren't included in vizSpec
        .filter(([ , columnName ]) => Boolean(columnName))
        .map(([ param, columnName ]) => {
            // Replace empty string with 'Missing data'
            return `${missingDataClause(columnName)} as ${labelName[param]}`;
        })
        .join(', ')
        + ", COUNT(*) as count";
}

// Based on the defined options in the spec, adds column aggregates
// and facility info to select.
// Example:
//   SUM(CASE WHEN COALESCE(NULLIF(refrigerators_odkx.maintenance_priority, ''), 'Missing data') = 'Missing data' THEN 1 ELSE 0 END) as "maintenance_priority.missing_data",
//   SUM(CASE WHEN refrigerators_odkx.maintenance_priority = 'high' THEN 1 ELSE 0 END) as "maintenance_priority.high",
//   SUM(CASE WHEN refrigerators_odkx.maintenance_priority = 'low' THEN 1 ELSE 0 END) as "maintenance_priority.low",
//   SUM(CASE WHEN refrigerators_odkx.maintenance_priority = 'medium' THEN 1 ELSE 0 END) as "maintenance_priority.medium",
//   SUM(CASE WHEN refrigerators_odkx.maintenance_priority = 'not_applicable' THEN 1 ELSE 0 END) as "maintenance_priority.not_applicable"
//   h.Location_longitude, h.Location_latitude, h.facility_name, h.id_health_facilities
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
                    .map(option => {
                        return `SUM(CASE WHEN ${referToColumn(col)} = '${option}' THEN 1 ELSE 0 END) as "${col}${MAP_SEPARATOR}${option}"`;
                    })
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
    return 'WHERE ' + Object.keys(filterSpecification).filter(varName =>
            !(vizSpec.style === 'map' && vizSpec.mapType === 'facility_details' &&
            (varName === 'refrigeratorTypes' || varName === 'maintenancePriorities')))
        .map(varName => {
            const thisFilterSpec = filterSpecification[varName];
            if (thisFilterSpec.multiColumn) {
                // filter.regions looks like:
                //   [ [ 'Uganda' ], [ 'Uganda', 'Kampala' ] ]
                const subclauses = filter[varName].map(
                    makeMultiColumnMatch.bind({}, thisFilterSpec)
                );
                return `(${subclauses.join('\nOR ')})`;
            } else {
                const { table, column } = thisFilterSpec;
                const clause = `${table}.${column} IN ${toSQLList(filter[varName])}`;
                return handleNull(clause, `${table}.${column}`, filter[varName], vizSpec.mapType);
            }
    }).join('\nAND ');
}

// Example:
//   t.model_id, r.utilization
function makeGroupBy(vizSpec) {
    if (vizSpec.style === 'map') {
        return makeMapGroupBy(vizSpec) + Object.keys(vizSpec.facilityPopup)
            .filter((col) => vizSpec.facilityPopup[col] === 'BY_FACILITY')
            .map(col => `, ${referToColumn(col)}`)
            .join('');
    }
    return [ 'groupBy', 'colorBy', 'repeatBy' ]
        .map(param => vizSpec[param])
        // Ignore those that weren't included in vizSpec
        .filter(columnName => Boolean(columnName))
        .map(referToColumn)
        .join(', ');
}

// Example:
//   h.Location_longitude, h.Location_latitude, h.facility_name, h.id_health_facilities
function makeMapGroupBy(vizSpec) {
    return [ 'Location_latitude', 'Location_longitude', 'facility_name', 'id_health_facilities']
        .map(referToColumn)
        .join(', ');
}

function makeOrderBy(vizSpec) {
    if (vizSpec.sort === 'ASC') {
        return 'ORDER BY count ASC';
    } else if (vizSpec.sort === 'DESC') {
        return 'ORDER BY count DESC';
    } else {
        return '';
    }
}

// if using refrigerator class, will join refrigerators classes on the model id's
function makeRefClassJoin(vizSpec) {
    if (vizSpec.colorBy === 'refrigerator_class' ||
        vizSpec.groupBy === 'refrigerator_class' ||
        vizSpec.repeatBy === 'refrigerator_class' ||
        (vizSpec.facilityPopup && 'refrigerator_class' in vizSpec.facilityPopup)) {
            return "vw_ref_type_class.model_id = refrigerator_types_odkx.model_id";
    }
    return "";
};

// includes view for refrigerator class if needed
function makeRefClassification(vizSpec) {
    if (vizSpec.colorBy === 'refrigerator_class' ||
        vizSpec.groupBy === 'refrigerator_class' ||
        vizSpec.repeatBy === 'refrigerator_class' ||
        (vizSpec.facilityPopup && 'refrigerator_class' in vizSpec.facilityPopup)) {
            return `JOIN vw_ref_type_class ON ${makeRefClassJoin(vizSpec)}`;
    }
    return "";
};


// age brackets within CASE statement are hardcoded as a constant in routes/index.js for legend display
function makeBucketByAge(vizSpec) {
    if (vizSpec.colorBy === AGE_GROUPS_COLUMN_NAME ||
        vizSpec.groupBy === AGE_GROUPS_COLUMN_NAME ||
        vizSpec.repeatBy === AGE_GROUPS_COLUMN_NAME) {
        return `JOIN (SELECT year_installed,
                 id_refrigerators,
                 CASE
                     WHEN AGE BETWEEN 0 and  5 THEN '0-5 Years'
                     WHEN AGE BETWEEN 6 AND 10 THEN '6-10 Years'
                     WHEN AGE > 10 THEN '>10 Years'
                     ELSE 'Missing data'
                 END AS ${AGE_GROUPS_COLUMN_NAME}
          FROM (
          SELECT year_installed,
                 id_refrigerators,
                 CAST(case
                 WHEN year_installed = '0' or year_installed = ''
                   THEN -1
                 ELSE  (date_part('year', now()) - CAST(year_installed as integer))
                  END as integer) as AGE
          FROM refrigerators_odkx
        ) as computedAge ) as BucketedAge ON ${makeAgeGroupJoin(vizSpec)}`;
    } else {
        return '';
    }
}

function makeAgeGroupJoin(vizSpec) {
    if (vizSpec.colorBy === AGE_GROUPS_COLUMN_NAME ||
        vizSpec.groupBy === AGE_GROUPS_COLUMN_NAME ||
        vizSpec.repeatBy === AGE_GROUPS_COLUMN_NAME) {
        return 'refrigerators_odkx.id_refrigerators = BucketedAge.id_refrigerators';
    }
    return '';
}

function makeFacilityJoin(vizSpec) {
    if (vizSpec.style === 'map' && vizSpec.mapType === 'facility_details') {
        return 'RIGHT JOIN health_facilities2_odkx ON health_facilities2_odkx.id_health_facilities = refrigerators_odkx.facility_row_id';
    } else {
        return 'JOIN health_facilities2_odkx ON health_facilities2_odkx.id_health_facilities = refrigerators_odkx.facility_row_id';
    }
}

function makeQueryStr(vizSpec) {
    return `SELECT ${makeSelect(vizSpec)}
    FROM refrigerator_types_odkx
         JOIN refrigerators_odkx ON
            refrigerator_types_odkx.id_refrigerator_types = refrigerators_odkx.model_row_id
         ${makeRefClassification(vizSpec)}
         ${makeBucketByAge(vizSpec)}
         ${makeFacilityJoin(vizSpec)}
         JOIN geographic_regions_odkx ON
            geographic_regions_odkx.id_geographic_regions = health_facilities2_odkx.admin_region_id
      ${makeFilterStr(vizSpec)}
    GROUP BY ${makeGroupBy(vizSpec)}
    ${makeOrderBy(vizSpec)}`;
};

function vizQuery(db, vizSpec) {
    return db.query(makeQueryStr(vizSpec));
}
// This is exposed only for testing purposes
vizQuery._makeQueryStr = makeQueryStr;

module.exports = vizQuery;
