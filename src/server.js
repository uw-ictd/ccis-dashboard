const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const cookieSession = require('cookie-session');
const passport = require('passport');
const configPassport = require('./util/configPassport');
const index = require('./routes/index');
const api = require('./routes/api');
const connectDB = require('./model/db');
const { URL_PREFIX } = require('./config/routingConstants');
require('./util/env');

// error and exit if .env file doesn't exist
if ((!process.env.PRODUCTION || process.env.PRODUCTION.toLowerCase === 'false')
    && !fs.existsSync('.env')) {
    console.error('.env file not found. Please refer to README.md for .env setup instructions');
    process.exit(1);
}

function createApp(db) {
    const app = express();

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.set('trust proxy', 1);

    // called before every request
    // set path for static assets
    app.use(URL_PREFIX, express.static(path.join(__dirname, 'public')));

    // parse form data client
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());

    app.use(cookieSession({
        name: 'session',
        keys: [process.env.COOKIE_KEY],
        maxAge: 24 * 60 * 60 * 1000 // 24 hrs
    }));

    // Setup authentication
    configPassport(db, passport);
    app.use(passport.initialize());
    app.use(passport.session());

    // these routes use the database
    // router middleware for POST requests to /api
    app.use(URL_PREFIX + '/api', api(db));
    // registering router middleware for the home page & login page
    app.use(URL_PREFIX, index(db));

    return app;
}

let server;
let db;

async function getServer(port, dbOptions) {
    db = connectDB(dbOptions);
    const app = createApp(db);
    return new Promise(function (resolve, reject) {
        if (server === null || server === undefined) {
            // server starts listening on port 8000 by default
            port = port || process.env.PORT || 8000;
            server = app.listen(port, (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(`App listening on port ${port}`);
                    db.poolConnect.then(() => resolve(server));
                }
            });
        } else {
            resolve(server);
        }
    });
}

async function closeServer() {
    const dbPromise = db.closeDb();
    const serverPromise = new Promise(function(resolve, reject) {
        if (server) {
            server.close();

            server.on('close', function(err) {
                if (err) {
                    console.error(err);
                    server = null;
                    reject(err);
                } else {
                    console.log('Server closed');
                    server = null;
                    resolve(server);
                }
            });
        } else {
            resolve(server);
        }
    });
    return Promise.all([ dbPromise, serverPromise ]);
}

if (require.main === module) {
    // This file was called directly, not as a module
    getServer();
}

module.exports = {
    getServer,
    closeServer
};
