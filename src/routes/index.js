const express = require('express');
const { getAuth, loginAuth } = require('../util/auth');
const passport = require('passport');
const getIndexData = require('../controller/getIndexData');
const { URL_PREFIX } = require('../config/routingConstants');
const {fetch} = require('cross-fetch');


const token = "patlpOIg99GVB6Tsq.b4c842a0ff138d5791fdbc497365b0875cffb0cab2cab15592417d34dc1813f0";

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

    router.get('/register', (req, res) => {
        res.render('register');
    })
    router.get('/instructions', (req, res) => {
        res.render('instructions');
    })

    router.post('/login', passport.authenticate('local', {
        successRedirect: URL_PREFIX
    }));

    router.post('/request-account', async (req, res) => {
        console.log(req.body);
        const response = await fetch('https://api.airtable.com/v0/appRmEYChnaez5sIQ/Requests',{
            headers:{"Content-Type":"application/json", "Authorization": `Bearer ${token}`},
            body: JSON.stringify({records:[{fields: {"Names": req.body.names, "Email": req.body.email, "Message": req.body.message}}]}),
            method:'POST'
        });
        console.log((await response.json()));
        res.render('register');
        return
    });

    return router;
}

module.exports = makeRouter;
