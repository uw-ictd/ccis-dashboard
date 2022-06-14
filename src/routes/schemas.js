const Joi = require('joi');
const exportOptions = require('../shared/exportOptions');
const { rawTableNames, joinedTableNames } = require('../shared/exportOptionsMetadata');

// As an added security measure, every string in this schema could be checked
// against a list of allowed values. As long as the database user only has read
// access, it shouldn't matter, but that would be an easy safeguard
const schemas = {
    queryProps: Joi.object().keys({
        visualization: Joi.string().required(),
        filter: Joi.object()
            .pattern(/.*/, Joi.array())
            .allow(null).required()
    }),

    rawTableProps: Joi.object().keys({
        // This string is used as part of a SQL query, so we check it strictly to avoid SQL injection
        table: Joi.any().valid(...rawTableNames),
        index: Joi.number().optional()
    }),

    joinedTableProps: Joi.object().keys({
        table: Joi.string().valid(...joinedTableNames).required(),
        index: Joi.number().optional()
    })
};

module.exports = schemas;
