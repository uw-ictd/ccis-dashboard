const schemas = require('./configSchemas');

function validateOrQuit(schema, value) {
    const { error } = schema.validate(value);
    if (error) {
        console.error(error);
        process.exit(1);
    }
}

module.exports = function(schemaName, obj) {
    validateOrQuit(schemas[schemaName], obj);
    console.log(schemaName, 'passed validation');
};
