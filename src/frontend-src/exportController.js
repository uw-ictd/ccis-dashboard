const exportOptions = require('../shared/exportOptions');
const { rawTableNames } = require('../shared/exportOptionsMetadata');
const downloadAsCSV = require('./downloadAsCSV');
const { post } = require('./httpTools');
const API_RAW = './api/rawTable';
const API_JOINED = './api/joinedTable';

function exportTables() {
    const tableName = getTableName();
    if (tableName === 'all_odkx_tables') { // all odk tables
        rawTableNames.forEach(table => {
            getTableData(API_RAW, table);
        });
    } else if (!exportOptions[tableName].rawTable) {
        // Joined tables
        getTableData(API_JOINED, tableName);
    } else { // individual tables
        getTableData(API_RAW, tableName)
    }
}

function getTableData(apiPath, tableName) {
    post(apiPath, {
        table: tableName
    }).then(body => {
        downloadAsCSV(body, tableName + '.csv');
    });
}

function getTableName() {
    return document.getElementById('export-selector').value;
}

module.exports = exportTables;
