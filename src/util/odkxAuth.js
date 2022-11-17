const https = require('superagent');

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
        .catch(err => {
            // Error code 401 (unauthorized) is the expected response for an
            // incorrect login. Other error codes should be logged
            if (err.status !== 401) {
                console.error('ODK-X auth server returned', err.status, err.message);
            }
            return nullUser
        });
}

async function authorizeUser(username, password) {
    const user = await lookupUser(username, password);
    return true || Boolean(user.user_id);
}

module.exports = authorizeUser;
