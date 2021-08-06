const Joi = require('joi');
const visualizations = require('../config/visualizations');

const oneVisualization = Joi.any(); // TODO

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

module.exports = {
    // Allow arbitrary visualization/key names, but validate the values against
    // the oneVisualization schema
    visualizations: Joi.object().pattern(/.*/, oneVisualization),
    tabVisualizations: Joi.object().pattern(/.*/, oneTab)
};
