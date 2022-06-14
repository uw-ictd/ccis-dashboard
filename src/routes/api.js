const express = require('express');
const visualizations = require('../config/visualizations');
const vizQuery = require('../controller/queryTemplate');
const formatResponse = require('../controller/formatResponse');
const exportOptions = require('../shared/exportOptions');
const { getIndicatorsQuery } = require('../controller/indicatorQueries');
const legendQuery = require('../controller/legendQuery');
const checkSchema = require('./schemaValidator');
const schemas = require('./schemas');
const { postAuth } = require('../util/auth');

module.exports = function makeQueryRouter(db) {
    const router = express.Router();
    router.use('/', postAuth);

    function filterIsNonEmpty(filter) {
        if (!filter) {
            return true;
        }
        return Object.entries(filter).every(([key, value]) => value.length > 0);
    }

    router.post('/query', checkSchema(schemas.queryProps, 'body'), async (req, res) => {
        try {
            if (!filterIsNonEmpty(req.body.filter)) {
                const response = {data: [], metadata: {fullColorDomain: [], fullDomain: []}};
                res.status(200).send(response);
                return;
            }
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

    router.post('/joinedTable', checkSchema(schemas.joinedTableProps, 'body'), async (req, res) => {
        try {
            const query = exportOptions[req.body.index].options[req.body.table].query;
            // functionName is not null because the schema checks that the input
            // table matches exportOptions.joinedTables
            const data = await db.query(query);
            res.status(200).send(data);
        } catch(err) {
            console.error(err);
            res.status(400).send(err.message);
        }
    });

    router.post('/report',  async (req, res) => {
        // returns a report (like an export but with parameters)
        try {
            const index = req.body.index;
            const table = req.body.table;
            const query = exportOptions[index].options[table].query;
            const data = await db.query(query, undefined, req.body.params);
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
