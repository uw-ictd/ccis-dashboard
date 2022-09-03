const select = require('./selectors');
const exportOptions = require('../shared/exportOptions');

/**
 * Returns the values of the input fields for an export group.
 * @param {*} index of export group
 * @returns list of values from input fields
 */
function getValues(index) {
    return exportOptions[index].inputFields.map(field => select.inputField(field.id).value);
}

/**
 * Returns whether an input field is valid
 * @param {*} value of input field
 * @param {*} fieldObj config object for this field
 * @returns boolean for field validity
 */
function exportFieldValid(value, fieldObj) {
    if (value == "") {
        return false;
    }
    if (fieldObj.type == "number") {
        return !isNaN(value) && (fieldObj.lowerBound == undefined || Number(value) >= fieldObj.lowerBound)
               && (fieldObj.upperBound == undefined || Number(value) <= fieldObj.upperBound);
    }
    return true;
}

/*
* enables the export button if all fields 
* are valid
*/
function exportFieldChanged(dropdownIndex) {
    const selectedTable = select.exportDropdown(dropdownIndex).value;
    if (exportOptions[dropdownIndex].options[selectedTable].usesParams) {
        select.exportButton(dropdownIndex).disabled = !exportOptions[dropdownIndex].inputFields.reduce((accumulator, fieldObj) => {
            return accumulator && exportFieldValid(select.inputField(fieldObj.id).value, fieldObj)
        }, true);
    }
}

module.exports = { exportFieldChanged, getValues };