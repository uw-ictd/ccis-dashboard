const express = require('express');
const visualizations = require('../shared/visualizations');
const vizQuery = require('../controller/queryTemplate');
const formatResponse = require('../controller/formatResponse');
const { getRefrigeratorQuery, getFacilityQuery } = require('../controller/exportQueries');
const { getIndicatorsQuery } = require('../controller/indicatorQueries');
const legendQuery = require('../controller/legendQuery');
const checkSchema = require('./schemaValidator');
const schemas = require('./schemas');
const { postAuth } = require('../util/auth');

module.exports = function makeQueryRouter(db) {
    const router = express.Router();
    router.use('/', postAuth);

    router.post('/query', checkSchema(schemas.queryProps, 'body'), async (req, res) => {
        try {
            const visualizationSpec = {
                filter: req.body.filter,
                ...visualizations[req.body.visualization]
            };
            const [ data, legendData ] = await Promise.all([
                vizQuery(db, visualizationSpec),
                legendQuery(db, visualizationSpec)
            ]);
            const response = formatResponse(visualizationSpec, data, legendData);
            res.status(200).send(response);
        } catch(err) {
            console.error(err);
            res.status(400).send(err.message);
        }
    });

    router.post('/rawTable', checkSchema(schemas.rawTableProps, 'body'), async (req, res) => {
        try {
            const data = await db.query(`SELECT * FROM ${req.body.table}`);
            res.status(200).send(data);
        } catch(err) {
            console.error(err);
            res.status(400).send(err.message);
        }
    });

    router.post('/bigTable', checkSchema(schemas.bigTableProps, 'body'), async (req, res) => {
        try {
            let data;
            if (req.body.table === 'refrigerator_big_table') {
                data = await db.query(getRefrigeratorQuery());
            } else if (req.body.table === 'facility_big_table') {
                data = await db.query(getFacilityQuery());
            } else {
                throw new Error('Did not input a valid table. Expected refrigerator_big_table or facility_big_table');
            }
            res.status(200).send(data);
        } catch(err) {
            console.error(err);
            res.status(400).send(err.message);
        }
    });

    router.post('/keyIndicators', async (req, res) => {
        try {
            const data = await db.query(getIndicatorsQuery());
            res.status(200).send(data);
        } catch(err) {
            console.error(err);
            res.status(400).send(err.message);
        }
    });

    return router;
};
