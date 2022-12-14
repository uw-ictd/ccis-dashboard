const express = require('express');
const { getAuth, loginAuth } = require('../util/auth');
const passport = require('passport');
const getIndexData = require('../controller/getIndexData');
const { URL_PREFIX } = require('../config/routingConstants');
const { fetch } = require('cross-fetch');
const { PrismaClient } = require('@prisma/client');


const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;

const prisma = new PrismaClient()

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
        // const response = await fetch('https://api.airtable.com/v0/appRmEYChnaez5sIQ/Requests', {
        //     headers: { "Content-Type": "application/json", "Authorization": `Bearer ${AIRTABLE_TOKEN}` },
        //     body: JSON.stringify({ records: [{ fields: { "Names": req.body.names, "Email": req.body.email, "Organization": req.body.organization, "Message": req.body.message } }] }),
        //     method: 'POST'
        // });
        const signUp = await prisma.registration.create({
            data: {
                names: body.names, email: body.email, organization: body.organization, message: body.message
            }
        })
        // console.log((await ));
        console.log(signUp.id);
        res.render('register');
        return
    });

    return router;
}

module.exports = makeRouter;
