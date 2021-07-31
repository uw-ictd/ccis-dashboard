const LocalStrategy = require('passport-local').Strategy;
const authorizeUser = require('./odkxAuth');

module.exports = function (db, passport) {
    passport.use(new LocalStrategy(
        async function (username, password, done) {
            const auth = await authorizeUser(username, password);
            if (auth) {
                return done(null, username);
            } else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
};
