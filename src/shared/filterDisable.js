module.exports = function enableDropdownForViz(vizSpec, tableName) {
    return !(
        vizSpec.type === 'facility' &&
        (tableName === 'refrigerator_types_odkx' || tableName === 'refrigerators_odkx')
    );
}
