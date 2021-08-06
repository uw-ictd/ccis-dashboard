const express = require('express');
const mergeFilterOptions = require('../util/mergeFilterOptions');
const visualizations = require('../config/visualizations');
const tabVisualizations = require('../config/tabVisualizations');
const getDistinctFilterOptions = require('../controller/filterOptions');
const exportOptions = require('../shared/exportOptions');
const knownRefrigeratorClasses = require('../model/refrigeratorClasses.json');
const knownFacilityClasses = require('../model/facilityClasses.json');
const { getAuth, loginAuth } = require('../util/auth');
const passport = require('passport');
require('../util/configValidation')(tabVisualizations, visualizations);

function makeRouter(db) {
    const router = express.Router();
    router.get('/', getAuth, async (req, res) => {
        // getDistinctFilterOptions runs 3 simple database queries. To optimize
        // page loading, these results could potentially be cached
        const filterOptions = await getDistinctFilterOptions(db);
        const facilityClasses = mergeFilterOptions(knownFacilityClasses,
            filterOptions.facilityClasses);
        const refrigeratorClasses = mergeFilterOptions(knownRefrigeratorClasses,
            filterOptions.refrigeratorClasses);
        res.render('index', {
            visualizations,
            facilityClasses,
            refrigeratorClasses,
            maintenancePriorities: filterOptions.maintenancePriorities,
            exportOptions: exportOptions.dropdownNames,
            tabVisualizations
        });
    });

    router.get('/login', loginAuth, (req, res) => {
        res.render('login');
    })

    router.post('/login', passport.authenticate('local', {
        successRedirect: '/'
    }));

    return router;
}

module.exports = makeRouter;
