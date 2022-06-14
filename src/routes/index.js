const express = require('express');
const { getAuth, loginAuth } = require('../util/auth');
const passport = require('passport');
const getIndexData = require('../controller/getIndexData');
const { URL_PREFIX } = require('../config/routingConstants');

function makeRouter(db) {
    const router = express.Router();
    router.get('/', getAuth, async (req, res) => {
        // buildDropdownData runs some simple database queries. To optimize
        // page loading, these results could potentially be cached
        const indexData = await getIndexData(db);
        res.render('index', indexData);
    });

    router.get('/login', loginAuth, (req, res) => {
        res.render('login');
    })

    router.post('/login', passport.authenticate('local', {
        successRedirect: URL_PREFIX
    }));

    return router;
}

module.exports = makeRouter;
