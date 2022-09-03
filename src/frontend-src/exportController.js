const exportOptions = require('../shared/exportOptions');
const { rawTableNames } = require('../shared/exportOptionsMetadata');
const downloadAsCSV = require('./downloadAsCSV');
const { post } = require('./httpTools');
const API_RAW = '/api/rawTable';
const API_JOINED = '/api/joinedTable';
const API_REPORT = '/api/report';
const { exportFieldChanged, getValues } = require('./inputField');
const vaccineStores = require('../config/vaccineStores');
const select = require('./selectors');

/**
 * Clicks the button for a particular export group
 * @param {*} index into exportOptions.js
 */
function exportClicked(index) {
    if (exportOptions[index].report) {
        getReport(index);
    } else {
        exportTables(index);
    }
}

/**
 * Export table as CSV
 * @param {*} index into exportOptions.js
 */
function exportTables(index) {
    const tableName = getTableName(index);
    if (tableName === 'all_odkx_tables') { // all odk tables
        rawTableNames.forEach(table => {
            getTableData(API_RAW, table);
        });
    } else if (!exportOptions[index].options[tableName].rawTable) {
        // Joined tables
        getTableData(API_JOINED, tableName, index);
    } else { // individual tables
        getTableData(API_RAW, tableName, index)
    }
}

/**
 * Perform a report, using input fields
 * @param {*} index into exportOptions.js
 */
function getReport(index) {
    tableName = getTableName(index);
    params = exportOptions[index].options[tableName].usesParams ? getValues(index): [];
    if (exportOptions[index].options[tableName].usesVaccineStores) {
        params.push(vaccineStores);
    }
    getTableData(API_REPORT, tableName, index, additionalParams={params});
}

function getTableData(apiPath, tableName, index, additionalParams={}) {
    post(apiPath, {
        table: tableName,
        index,
        ...additionalParams
    }).then(body => {
        downloadAsCSV(body, tableName + '.csv');
    });
}

function getTableName(index) {
    return select.exportDropdown(index).value;
}

function exportOptionChanged(index) {
    const tableName = getTableName(index);
    select.exportButton(index).disabled = exportOptions[index].options[tableName].usesParams;
    if (exportOptions[index].options[tableName].usesParams) exportFieldChanged(index)
}

module.exports = { exportClicked, exportOptionChanged };
