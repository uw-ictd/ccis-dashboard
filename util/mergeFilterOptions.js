const _ = require('lodash');

/*
 * mergeFilterOptions takes knownFilterClasses and adds a "No group" class
 * containing all the values in allFilterOptions not present in
 * knownFilterClasses.
 *
 * knownFilterClasses is an object mapping Strings to Arrays of Strings. The
 *   keys are names of "Classes" -- groupings of the possible values in the
 *   arrays. The elements of the arrays should all appear only once in
 *   knownFilterOptions
 * allFilterOptions is an Array of Strings. The values should all be unique.
 *   The values will be compared with the values in the arrays in
 *   knownFilterOptions.
 * output: A new object matching the format of knownFilterClasses, with all the
 *   values in knownFilterClasses remaining untouched, but with a new "No group"
 *   class for the additional values in allFilterOptions
 */
module.exports = function(knownFilterClasses, allFilterOptions) {
    const missingValues = _.difference(
        allFilterOptions,
        ...Object.values(knownFilterClasses)
    );
    if (!missingValues.length) return knownFilterClasses;
    if (knownFilterClasses.missingValues) {
        throw new Error('Filter class config file already has a group named "No group"');
    }
    return {
        ...knownFilterClasses,
        'No group': missingValues
    };
};
