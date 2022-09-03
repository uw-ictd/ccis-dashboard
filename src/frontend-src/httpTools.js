const { URL_PREFIX } = require('../config/routingConstants');

function post(path, body) {
    return fetch(URL_PREFIX + path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        referrer: 'no-referrer',
        body: JSON.stringify(body),
        timeout: 0
    })
    .then(res => {
        if (res.ok) return res;
        return res.json().then(body => Promise.reject(body.msg));
    })
    .then(res => res.json());
}

module.exports = {
    post
};
