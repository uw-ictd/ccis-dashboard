const Joi = require('joi');
const visualizations = require('../config/visualizations');

// TODO make this more strict: some options require other options
const oneVisualization = Joi.object({
    type: Joi.string().valid('refrigerator', 'facility').required(),
    style: Joi.string().valid('bar', 'pie', 'map', 'list' ,'heatmap').required(),
    groupBy: Joi.string().optional(),
    colorBy: Joi.string().optional(),
    repeatBy: Joi.string().optional(),
    colorMap: Joi.object().pattern(/.*/, Joi.string()).optional(),
    mapType: Joi.string().optional(),
    facilityPopup: Joi.object().optional(),
    columns: Joi.array().items(Joi.string()).optional(),
    sort: Joi.string().valid('ASC', 'DESC').optional(),
    disableLegend: Joi.bool().optional(),
    legendNonzeroOnly: Joi.bool().optional(),
    legendOrder: Joi.array().optional(),
    regionLevel: Joi.string().valid('Region (Level 2)', 'District (Level 3)').optional(),
    fill_specs: Joi.object().optional(),
    sum: Joi.string().optional()
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
    includeExport: Joi.boolean(),
    defaultViz: Joi.string()
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

module.exports = {
    // Allow arbitrary visualization/key names, but validate the values against
    // the oneVisualization schema
    visualizations: Joi.object().pattern(/.*/, oneVisualization),
    tabVisualizations: Joi.object().pattern(/.*/, oneTab),
    filterSpecification: Joi.object().pattern(/.*/, oneFilter),
    computedColumns: Joi.array().items(oneSubQueryDefn)
};
