const https = require('superagent');
require('dotenv').config();

async function lookupUser(username, password) {
    const SERVER_URL = process.env.ODKX_AUTH_URL;
    const nullUser = {
        user_id: null,
        full_name: null,
        defaultGroup: null,
        roles: []
    };
    return await https.get(SERVER_URL)
        .set('X-OpenDataKit-Version', '2.0')
        .auth(username, password)
        .then(response => response.body || nullUser)
        .catch(err => nullUser);
}

async function authorizeUser(username, password) {
    const user = await lookupUser(username, password);
    return Boolean(user.user_id);
}

module.exports = authorizeUser;
