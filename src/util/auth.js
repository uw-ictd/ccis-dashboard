module.exports = {
    loginAuth: function(req, res, next) {
        if (req.isAuthenticated()) {
            res.redirect('/');
        } else {
            next();
        }
    },
    getAuth: function(req, res, next) {
        if (!req.isAuthenticated()) {
            res.redirect('/login');
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
