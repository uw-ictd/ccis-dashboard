const exportOptions = require('./exportOptions');
const rawTableNames = exportOptions.map((obj, index) => 
    Object.entries(exportOptions[index].options)
        .filter(([k, v]) => v.rawTable)
        .map(([k, v]) => k))
    .reduce((prevArray, newArray) => prevArray.concat(newArray), []);

const joinedTableNames = exportOptions.map((obj, index) => 
    Object.entries(exportOptions[index].options)
        .filter(([k, v]) => !v.rawTable)
        .map(([k, v]) => k))
    .reduce((prevArray, newArray) => prevArray.concat(newArray), []);

module.exports = {
    rawTableNames,
    joinedTableNames
};
