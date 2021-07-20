// Exports document.multiselect
require('./multiselect/multiselect.min');

function multiselect(id) {
    document.multiselect(id).selectAll();
}

/*
 * Returns the value of all checked descendents of the given id
 * When called on a multiple-select dropdown, this returns all the selected
 * values.
 */
function getSelection(id) {
    const selectedElements = document.querySelectorAll(`#${id} :checked`);
    return Array.from(selectedElements).map(element => element.value);
}

module.exports = {
    multiselect,
    getSelection
};
