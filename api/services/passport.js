var passport = require('passport'),
    BearerStrategy = require('passport-http-bearer').Strategy;

/**
 * BearerStrategy
 *
 * This strategy is used to authenticate either users or clients based on an access token
 * (aka a bearer token).  If a user, they must have previously authorized a client
 * application, which is issued an access token to make requests on behalf of
 * the authorizing user.
 */
passport.use('bearer', new BearerStrategy(
    function (accessToken, done) {
        Tokens.findOne({ access_token: accessToken }, function (err, token) {
            if (err) return done(err);
            if (!token) return done(null, false);
            if (token.user_id != null) {
                Users.find(token.user_id, function (err, user) {
                    if (err) return done(err);
                    if (!user) return done(null, false);
                    // to keep this example simple, restricted scopes are not implemented,
                    // and this is just for illustrative purposes
                    var info = { scope: '*' }
                    done(null, user, info);
                });
            }
            else {
                //The request came from a client only since userId is null
                //therefore the client is passed back instead of a user
                Clients.find({ clientId: token.clientId }, function (err, client) {
                    if (err) return done(err);
                    if (!client) return done(null, false);
                    // to keep this example simple, restricted scopes are not implemented,
                    // and this is just for illustrative purposes
                    var info = { scope: '*' }
                    done(null, client, info);
                });
            }
        });
    }
));