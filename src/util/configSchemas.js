const Joi = require('joi');
const visualizations = require('../config/visualizations');

// TODO make this more strict: some options require other options
const oneVisualization = Joi.object({
    type: Joi.string().valid('refrigerator', 'facility').required(),
    style: Joi.string().valid('normalized-bar','bar', 'pie', 'map', 'list' ,'heatmap').required(),
    groupBy: Joi.string().optional(),
    colorBy: Joi.string().optional(),
    repeatBy: Joi.string().optional(),
    colorMap: Joi.object().pattern(/.*/, Joi.string()).optional(),
    mapType: Joi.string().optional(),
    facilityPopup: Joi.object().optional(),
    columns: Joi.array().items(Joi.string()).optional(),
    sort: Joi.string().valid('ASC', 'DESC').optional(),
    disableLegend: Joi.bool().optional(),
    disableBarNumbers: Joi.bool().optional(),
    legendNonzeroOnly: Joi.bool().optional(),
    legendOrder: Joi.array().optional(),
    regionLevel: Joi.string().valid('Region (Level 2)', 'District (Level 3)').optional(),
    fill_specs: Joi.object({ // for heatmaps
        min_opacity: Joi.number().optional(),
        max_opacity: Joi.number().optional(),
        fill_color: Joi.string().optional(),
        fill_outline_color: Joi.string().optional(),
    }).optional(),
    colorSpecs: Joi.object({ // for colored_facilities maps
        opacity: Joi.number().optional(),
        singleColor: Joi.string().optional()
    }).optional(),
    sum: Joi.string().optional(),
    heatmapType: Joi.string().valid('proportion','quantity').optional()
});

const oneTab = Joi.object({
    tabLabel: Joi.string(),
    visualizations: Joi.array().items(
        // Tabs must only contain visualizations defined in
        // visualizations.js
        Joi.any().valid(...Object.keys(visualizations))
    ).when('defaultViz', {
        is: Joi.required(),
        then: Joi.array().has(Joi.ref('...defaultViz'))
    }),
    exportTab: Joi.boolean(),
    defaultViz: Joi.string(),
    multi: Joi.boolean().optional(),
    enabledFilters: Joi.array().optional()
});

const oneFilter = Joi.object({
    title: Joi.any().when('useInDropdowns', {
        is: Joi.boolean().valid(true).required(),
        then: Joi.string()
    }),
    table: Joi.string(),
    column: Joi.string(),
    grouped: Joi.boolean().optional(),
    classes: Joi.any().when('grouped', {
        is: Joi.boolean().valid(true).required(),
        then: Joi.object().required()
    }),
    useInDropdowns: Joi.boolean().optional(),
    multiColumn: Joi.boolean().optional(),
    columns: Joi.any().when('multiColumn', {
        is: Joi.boolean().valid(true).required(),
        then: Joi.array().required()
    })
});

const oneSubQueryDefn = Joi.object({
    name: Joi.string(),
    query: Joi.string(),
    provides: Joi.array().items(Joi.string()),
    joinOn: Joi.object({
        table: Joi.string(),
        foreignColumn: Joi.string(),
        localColumn: Joi.string()
    })
});

const regionBoundariesDefn = Joi.object({
    topLevelName: Joi.string(),
    topLevel: Joi.string(),
    bottomLevel: Joi.string(),
    levels: Joi.array().items(Joi.object({
        dbLevelName: Joi.string(),
        levelName: Joi.string(),
        geoJson: Joi.object({
            // Should follow the GeoJSON spec
            features: Joi.array().required()
        }).unknown(true).allow(null),
        regionNameKey: Joi.string().allow(null)
    }))
});

const oneExportOptionsDefn = Joi.object({
    options: Joi.object().pattern(Joi.string(), Joi.object({
        name: Joi.string(),
        query: Joi.string().optional(),
        usesVaccineStores: Joi.boolean().optional(),
        rawTable: Joi.boolean().optional(),
        table: Joi.string().optional(),
        usesParams: Joi.boolean().optional()
    })),
    buttonText: Joi.string(),
    inputFields: Joi.array().items(Joi.object({
        label: Joi.string(),
        id: Joi.string(),
        type: Joi.string().valid("number", "string"),
        lowerBound: Joi.number().optional(),
        upperBound: Joi.number().optional()
    })).optional(),
    report: Joi.boolean().optional()
});

module.exports = {
    // Allow arbitrary visualization/key names, but validate the values against
    // the oneVisualization schema
    visualizations: Joi.object().pattern(/.*/, oneVisualization),
    tabVisualizations: Joi.object().pattern(/.*/, oneTab),
    filterSpecification: Joi.object().pattern(/.*/, oneFilter),
    computedColumns: Joi.array().items(oneSubQueryDefn),
    regionBoundaries: regionBoundariesDefn,
    exportOptions: Joi.array().items(oneExportOptionsDefn)
};
