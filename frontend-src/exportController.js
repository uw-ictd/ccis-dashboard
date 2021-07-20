const converter = require('json-2-csv');
const exportOptions = require('../shared/exportOptions');
const { post } = require('./httpTools');
const API_RAW = '/api/rawTable';
const API_BIG = '/api/bigTable';

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
        jsonToCsv(body, tableName);
    });
}

function getTableName() {
    return document.getElementById('export-selector').value;
}

function jsonToCsv(rowArray, fileName) {
    converter.json2csv(rowArray, (err, csv) => {
    if (err) return console.error(err);
        download(csv, fileName);
    });
}

function download(csv, fileName) {
    const csvBlob = new Blob([csv], { type: 'text/csv' });
    // empty element a that when clicked downloads csv to computer
    const a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(csvBlob);
    a.download = fileName + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

module.exports = exportTables;
