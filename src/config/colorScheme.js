const d3 = require('d3');

module.exports = {
    colorScheme: d3.schemeTableau10,
    // These are our internal names for the colors from d3.schemeSet1
    // `colorMap` in visualizations.js should use these color names
    colorNameToIndex: {
        blue:      0,
        orange:    1,
        red:       2,
        lightblue: 3,
        green:     4,
        yellow:    5,
        purple:    6,
        pink:      7,
        brown:     8,
        gray:      9
    }
};
