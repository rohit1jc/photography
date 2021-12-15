/**
 * isAuthorized
 *
 * @description :: Policy to check if user is authorized with JSON web token
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Policies
 */

module.exports = async function (req, res, next) {
    // console.log("kndvjdfjgj", req)
    // console.log("in isAuthorizied");
    var token;

    if (req.headers && req.headers.authorization) {
        var parts = req.headers.authorization.split(' ');
        if (parts.length == 2) {
            var scheme = parts[0],
                credentials = parts[1];

            if (/^Bearer$/i.test(scheme)) {
                token = credentials;
            }
        } else {
            return res.status(401).json({
                "success": false,
                "code": 401,
                "message": "authorization"
            });
        }
    } else if (req.query.access_token) {
        token = req.query.access_token;
        // We delete the token from param to not mess with blueprints
        delete req.query.access_token;
    } else {
        return res.status(401).json({
            "success": false,
            "code": 401,
            "message": "authorization"
        });
    }
    var jwtObj = jwt.decode(token)
    jwt.verify(token, jwtObj, async function (err, token) {
        if (err) {
            return res.status(401).json({
                "success": false,
                "code": 401,
                "message": "Your Session Has Expired. Please logIn"
            });
        } else if (token && token.user_id) {
            // console.log(token,'token==');
            var user = await Users.findOne({ id: token.user_id });
            var tempuser = await TempUserData.findOne({ id: token.user_id });
            if(user){
                var date1=new Date(user.lastLogin);
                var date2=new Date(token.lastLogin);
            }
            if(tempuser){
                var date1=new Date(tempuser.lastLogin);
                var date2=new Date(token.lastLogin);
            }
            // const date1=new Date(user.lastLogin);
            // const date2=new Date(token.lastLogin);
            // console.log(date1,date2,"=========in auth");
            if(date1.getTime()==date2.getTime()){
                req.identity = user;
            }else{
                return res.status(401).json({
                    "success": false,
                    "code": 401,
                    "message": "Your Session Has Expired"
                });
            }
        }
        // console.log("token", token)
        // req.token = token; // This is the decrypted token or the payload you provided
        next();
    });
    // console.log("in djvjdfbnjn", verifyJwt)




};
