const Joi = require('joi');
const checkSchema = (schema, prop) => {
    return (req, res, next) => {
        const { error } = schema.validate(req[prop]);

        if (error === null || error === undefined) {
            next();
        } else {
            console.error(error);
            const { details } = error;
            const message = details.map(i => i.message).join(',');
            res.status(400).json({ error: message })
        }
    }
};
module.exports = checkSchema;
