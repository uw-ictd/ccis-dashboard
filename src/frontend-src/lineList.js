const downloadAsCSV = require('./downloadAsCSV');
const select = require('./selectors');
const tableTemplate = require('./views/lineListTable.ejs');
const List = require('list.js');
require('./lineList.css');

function getDataName(tabName, columnName) {
    return `${tabName}-list-${columnName}`;
}

function initTable(columns, tabName, id) {
    new List(id, {
        valueNames: columns.map(getDataName.bind({}, tabName))
    });
}

async function drawLineList(rows, { columns }, tabName, vizName, vizIndex) {
    const id = `${tabName}-list`;
    const container = select.listWrapper(tabName, vizIndex);
    container.innerHTML = tableTemplate({ rows, columns, tabName, id, getDataName });
    select.lineListButton(tabName).onclick = function() {
        downloadAsCSV(rows, vizName + '.csv');
    };
    initTable(columns, tabName, id);
}

module.exports = drawLineList;
