const schemas = require('./configSchemas');

function validateOrQuit(schema, value) {
    const { error } = schema.validate(value);
    if (error) {
        console.error(error);
        process.exit(1);
    }
}

module.exports = function(tabVisualizations, visualizations) {
    validateOrQuit(schemas.tabVisualizations, tabVisualizations);
    validateOrQuit(schemas.visualizations, visualizations);
    console.log('tabVisualizations.js and visualizations.js passed validation');
};
