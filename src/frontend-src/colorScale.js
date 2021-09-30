const d3 = require('d3');
const { colorNameToIndex, colorScheme } = require('../config/colorScheme');

function makeColorScale(fullColorDomain, colorMap) {
    if (!colorMap) return d3.scaleOrdinal(fullColorDomain, colorScheme);

    const valuesWithoutColors = fullColorDomain.filter(value => {
        return !Boolean(colorMap[value]);
    });
    let unusedColors = Object.keys(colorNameToIndex).filter(color => {
        return !Object.values(colorMap).includes(color);
    });

    // If all colors are used in colorMap, just reuse them if fullColorDomain is
    // too long
    if (unusedColors.length === 0) {
        unusedColors = Object.keys(colorNameToIndex);
    }

    return function(value) {
        let color;
        if (colorMap[value]) {
            color = colorMap[value];
        } else {
            // Now assign all values without colors to colors from unusedColors
            // The mod operation lets us accept inputs where fullColorDomain has
            // more than 10 elements; we only reuse the colors not specified in
            // colorMap, unless colorMap uses all 10 colors. (This is useful if,
            // for example, you want to assign colors 1-9 and make all other
            // values grey.)
            const index = valuesWithoutColors.indexOf(value);
            color = unusedColors[index % unusedColors.length]
        }
        return getColorFromName(color);
    }
};

function getColorFromName(colorName) {
    return d3.schemeTableau10[colorNameToIndex[colorName]];
}

module.exports = {makeColorScale, getColorFromName};
