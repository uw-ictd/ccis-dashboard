const express = require('express');
const { getAuth, loginAuth } = require('../util/auth');
const passport = require('passport');
const getIndexData = require('../controller/getIndexData');
const { URL_PREFIX } = require('../config/routingConstants');
const { fetch } = require('cross-fetch');
const { PrismaClient } = require('@prisma/client');



const prisma = new PrismaClient()

function makeRouter(db) {
    const router = express.Router();
    router.get('/', getAuth, async (req, res) => {
        // buildDropdownData runs some simple database queries. To optimize
        // page loading, these results could potentially be cached
        const indexData = await getIndexData(db);
        res.render('index', indexData);
        return;
    });

    router.get('/login', loginAuth, (req, res) => {
        res.render('login');
        return;
    })

    router.get('/register', (req, res) => {
        res.render('register', {
            success: false
        });
        return;
    })
    router.get('/instructions', (req, res) => {
        res.render('instructions');
        return;
    })

    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/dashboard');
        return;
    })

    router.get('/signups', async (req, res) => {
        let _users = await prisma.registration.findMany({
            select: {
                names: true, organization: true, message: true, updatedAt: true, email: true
            }
        })
        let users = _users.map((user) => {
            return { names: user.names, updatedAt: new Date(user.updatedAt).toDateString(), email: user.email, message: user.message, organization: user.organization }
        })
        res.render('signups', {
            users: users
        });
        return;
    })

    router.post('/login', passport.authenticate('local', {
        successRedirect: URL_PREFIX
    }));

    router.post('/request-account', async (req, res) => {
        console.log(req.body);
        const body = req.body;
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
        res.render('register', {
            success: true
        });
        return
    });

    return router;
}

module.exports = makeRouter;
