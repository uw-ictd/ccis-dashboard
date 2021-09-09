const exportOptions = require('../shared/exportOptions');
const downloadAsCSV = require('./downloadAsCSV');
const { post } = require('./httpTools');
const API_RAW = './api/rawTable';
const API_BIG = './api/bigTable';

function exportTables() {
    const tableName = getTableName();
    if (tableName === 'all_odkx_tables') { // all odk tables
        exportOptions.rawTables.forEach(table => {
            getTableData(API_RAW, table);
        });
    } else if (exportOptions.bigTables.includes(tableName)) {
        // Joined tables
        getTableData(API_BIG, tableName);
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
