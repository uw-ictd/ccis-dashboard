// Exports document.multiselect
require('./multiselect/multiselect.min');

// In the current implementation, this separator must unfortunately be defined
// twice: here and in views/partials/dropdownOptions.js, and they must agree.
const SEPARATOR = '|';

function groupedMultiselect(id, groups) {
    validate(groups);
    const dropdown = document.multiselect(id);
    dropdown.selectAll();
    // This is a workaround.
    // Since the multiselect library uses global selectors for <option>s,
    // we make sure each <option> has a globally unique value
    groups = addPrefix(groups, id);

    Object.keys(groups).forEach(group => {
        const subTypes = groups[group]

        // Update all the children when a parent is clicked
        dropdown.setCheckBoxClick(group, (_, args) => {
            subTypes.forEach(subType => {
                if (args.checked) {
                    dropdown.select(subType);
                } else {
                    dropdown.deselect(subType);
                }
            });
        });

        // Update the parent when the children are the same
        subTypes.forEach(subType => {
            dropdown.setCheckBoxClick(subType, (_, args) => {
                if (allChecked(id, subTypes)) {
                    dropdown.select(group);
                } else if (noneChecked(id, subTypes)) {
                    dropdown.deselect(group);
                }
            });
        });
    });
}

/*
 * id: string
 * values: Array of strings
 * none: (Optional) boolean
 */
function allChecked(id, values, none) {
    const checked = Array.from(document.querySelectorAll(`${id} :checked`)).map(x => x.value);
    if (none) {
        return values.every(value => !checked.includes(value));
    }
    return values.every(value => checked.includes(value));
}

function noneChecked(id, values) {
    return allChecked(id, values, true);
}

function addPrefixToStr(prefix, str) {
    if (str === null) str = '';
    return prefix + SEPARATOR + str;
}

function addPrefix(classes, prefix) {
    if (prefix.indexOf(SEPARATOR) >= 0) {
        throw new Error(`The '${SEPARATOR}' character is not allowed in prefix (${prefix})`);
    }
    const addPref = addPrefixToStr.bind({}, prefix);
    return Object.fromEntries(Object.entries(classes)
        .map(([key, group]) => [addPref(key), group.map(addPref)])
    );
}

/*
 * Requirement: groups should be an object mapping Strings to Arrays of Strings.
 * All of the strings involved, both keys and elements of the arrays, should be
 * unique.
 */
function validate(groups) {
    const allStrings = Object.keys(groups).concat(Object.values(groups).flat());
    // Check that every string appears in the list exactly once
    const repeats = allStrings.filter((str, index) => {
        return allStrings.indexOf(str) !== index;
    });
    if (repeats.length) {
        throw new Error(`Groups passed to multiselect have repeat identifiers.
            Repeated identifiers are: ${repeats}`);
    }
}

function removePrefix(str) {
    if (str.indexOf(SEPARATOR) < 0) {
        throw new Error(`'${SEPARATOR}' must be in the string (${str})`);
    }
    return str.substring(str.indexOf(SEPARATOR) + SEPARATOR.length);
}

/*
 * Returns an array of strings: the values of all checked options in the
 * selection with the given ID. Options representing groups of <option>s are not
 * included.
 */
function getSelectionIgnoreGroups(selectorStr) {
    const selectedElements = document.querySelectorAll(`${selectorStr} .child:checked`);
    return Array.from(selectedElements)
        .map(element => removePrefix(element.value));
}

module.exports = {
    groupedMultiselect,
    getSelectionIgnoreGroups
};
