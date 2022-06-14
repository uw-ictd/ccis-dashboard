const { URL_PREFIX } = require('../config/routingConstants');

module.exports = {
    loginAuth: function(req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect(URL_PREFIX);
        } else {
            next();
        }
    },
    getAuth: function(req, res, next) {
        if (!req.isAuthenticated()) {
            res.redirect(URL_PREFIX + '/login');
        } else {
            next();
        }
    },
    postAuth: function(req, res, next) {
        if (!req.isAuthenticated()){
            res.status(401).send('Unauthorized');
        } else {
            next();
        }
    }
};
