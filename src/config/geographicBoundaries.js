const level2Uganda = require('./Uganda_Regions_2020.json');

// `geographicBoundaries.regionNameKeys` and `geographicBoundaries.levels` have the same length.
// `regionNameKeys[i]` corresponds to `levels[i]` and to `levelNames[i]`.
// Unfortunately, the levels here are also coupled to the backend file
// config/filterSpecification.js which describes how to look up these levels
// in the database
module.exports = {
    topLevelName: 'UGANDA',
    // The map will only show boundaries between these two levels
    // Each must be an value of levelName in one of the objects below
    // `topLevel` must come before `bottomLevel` in `levels`
    topLevel: 'Country (Level 1)',
    bottomLevel: 'Region (Level 2)',
    levels: [
        {
            // The name of the column in the geographic_regions table that
            // corresponds to this level of the administrative hierarchy
            dbLevelName: 'regionlevel1',
            levelName: 'Country (Level 1)',
            // These two parameters are ignored for the first element of this array
            geoJson: null,
            regionNameKey: null
        },
        {
            dbLevelName: 'regionlevel2',
            levelName: 'Region (Level 2)',
            geoJson: level2Uganda,
            // This defines where to look up the level names: the strings here are keys
            // to the `properties` object of an individual geoJSON Feature
            regionNameKey: 'ccisRegionName'
        }
    ]
};
