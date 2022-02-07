const exportOptions = require('./exportOptions');
const rawTableNames = Object.entries(exportOptions)
    .filter(([k, v]) => v.rawTable)
    .map(([k, v]) => k);
const joinedTableNames = Object.entries(exportOptions)
    .filter(([k, v]) => !v.rawTable)
    .map(([k, v]) => k);

module.exports = {
    rawTableNames,
    joinedTableNames
};
