const Joi = require('joi');
const exportOptions = require('../shared/exportOptions');

// As an added security measure, every string in this schema could be checked
// against a list of allowed values. As long as the database user only has read
// access, it shouldn't matter, but that would be an easy safeguard
const schemas = {
    queryProps: Joi.object().keys({
        visualization: Joi.string().required(),
        filter: Joi.object({
            facilityTypes: Joi.array().items(Joi.string().allow('')),
            refrigeratorTypes: Joi.array().items(Joi.string().allow('')),
            maintenancePriorities: Joi.array().items(Joi.string().allow('')),
            // The ODK-X database only has 5 region name columns
            regions: Joi.array().items(Joi.array().items(Joi.string()).max(5))
        }).allow(null).required()
    }),

    rawTableProps: Joi.object().keys({
        // This string is used as part of a SQL query, so we check it strictly to avoid SQL injection
        table: Joi.any().valid(...exportOptions.rawTables)
    }),

    bigTableProps: Joi.object().keys({
        table: Joi.string().required()
    })
};

module.exports = schemas;
