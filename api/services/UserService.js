var bcrypt = require('bcrypt-nodejs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var constantObj = sails.config.constants;
var transport = nodemailer.createTransport(smtpTransport({
    host: sails.config.appSMTP.host,
    port: sails.config.appSMTP.port,
    debug: sails.config.appSMTP.debug,
    auth: {
        user: sails.config.appSMTP.auth.user, //access using /congig/appSMTP.js
        pass: sails.config.appSMTP.auth.pass
    }
}));

generatePassword = function () { // action are perform to generate random password for user
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-=+;:,.?",
        retVal = "";

    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
};


module.exports = {
    // emailGeneratedCode: emailGeneratedCode,
    currentUser: function (data, context) {
        return context.identity;
    },

    // editProfile
    editProfile: (data, context, req, res) => {
        try {
            var id = data.id
            if ((!data.id) || data.id == undefined) {
                res.status(404).json({ "success": false, "error": { "code": 404, "message": "Id Is required" } });
            }

            if (data.firstName) {
                data.fullName = data.firstName + ' ' + data.lastName
            }
            if (data.lat && data.lang) {
                data.location =  [
                        data.lat,
                        data.lang
                    ]
            }
            delete data.lat;
            delete data.lang;
            data.updatedBy = context.identity.id;
            Users.updateOne({ id: id }, data).then((user) => {
                res.status(200).json({
                    success: true,
                    code: 200,
                    message: constantObj.user.UPDATED_USER,
                    data:user,
                })
            })
        } catch (err) {
            console.log(err);
            res.status(400).json({ success: false, error: { "code": 400, "message": "" + err } });
        }
    },

    //   used when user forgots password & get new on mail
    webForgotPassword: function (data, context, req, res) {
        try {
            var email = data.email;
            Users.findOne({ email: data.email }).then(function (data) {
                if (data === undefined) {
                    return res.status(404).json({ "success": false, "error": { "code": 404, "message": "No such user exist" } })
                }
                else {
                    if (data.firstName) {
                        var firstName = data.firstName;
                        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
                    }
                    var verificationCode = generatePassword()
                    Users.update({ email: data.email }, { verificationCode: verificationCode })
                        .then(function (result) {

                            emailGeneratedCode({
                                email: data.email,
                                firstName: data.firstName,
                                verificationCode: verificationCode
                            })
                            return res.status(200).json({ success: true, code: 200, message: "Verification Code Has Been Sent to Email" });

                        })
                }
            })
        } catch (err) {
            return res.status(400).json({ success: false, error: { "code": 400, "message": "" + err } });
        }
    },

    resetPassword: async (data, context, req, res) => {
        try {
            var code = data.code
            var newPassword = data.newPassword
            var confirmPassword = data.confirmPassword
            if (newPassword != confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Confirm Password Not Matched"
                })
            }
            let user = await Users.findOne({ verificationCode: code })
            if (!user || user.verificationCode !== code) {
                return res.status(404).json({
                    error: {
                        success: false,
                        code: 404,
                        message: "Verification Code Wrong"
                    }
                })
            } else {
                var encryptedPassword2 = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
                Users.updateOne({ id: user.id }, { password: encryptedPassword2, verificationCode: 'null' }).then((updatedUser) => {
                    return res.status(200).json({
                        success: true,
                        code: 200,
                        message: "Password Reset Successfully."
                    })
                })
            }
        } catch (err) {
            return res.status(400).json({ success: false, error: { "code": 400, "message": "" + err } });
        }
    },

    logout: async (data, context, req, res) => {
        try {
            var user_id = context.identity.id;
            updatequery = {}
            // updatequery.logoutAt = new Date();
            Users.update({ id: user_id }, { access_token: null }).then((updatedDetail) => {
                return res.status(200).json({
                    status: 200,
                    success: true,
                    message: "Logout Successfully."
                });

            });
        } catch (err) {
            return res.status(400).json({ success: false, error: { "code": 400, "message": "" + err } });
        }
    },

    /**Contact us api */
    contactUs: function (data, context, req, res) {
        try {
            // let name = data.name;
            if ((!data.name) || data.name == undefined) {
                return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Name Is Required" } });
            }
            if ((!data.subject) || data.subject == undefined) {
                return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Subject Is Required" } });
            }
            if ((!data.number) || data.number == undefined) {
                return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Phone Number Is Required" } });
            }
            if ((!data.email) || data.email == undefined) {
                return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Email Is Required" } });
            }
            if ((!data.message) || data.message == undefined) {
                return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Message Is Required" } });
            }
            let name = data.name;
            let subject = data.subject;
            let number = data.number;
            let email = data.email;
            let message = data.message;

            if (!email) {
                return res.status(404).json({ success: false, code: 404, message: 'ALL_FIELDS_REQUIRED' })
            }
            return emailContactUs({ name, email, subject, message, number })
        } catch (err) {
            console.log(err)
            return res.status(500).json({ "success": false, "error": { "code": 500, "message": "" + err } })
        }
    },


    //For Update Email Address
    contactEmail: function (data, context, req, res) {
        try {
            var data = {};
            let contact_information = {};
            contact_information = {
                email: req.body.email,
                isEmailVerified: 'No',
            };

            data.contact_information = contact_information;
            Users.updateOne({ id: req.identity.id }, data).then((users) => {
                if (users) {
                    userVerifyEmailLink({
                        email: req.body.email,
                        fullName: users.fullName,
                        id: users.id
                    })
                }

                return res.status(200).json({
                    "success": true,
                    "code": 200,
                    "data": "Please Verified Your Email Address"
                });
            });
        } catch (err) {
            console.log(err)
            return res.status(500).json({ "success": false, "error": { "code": 500, "message": "" + err } })
        }
    },


    changePassword: function (data, context, req, res) {
        try {
            let newPassword = data.newPassword;
            let confirmPassword = data.confirmPassword;
            let currentPassword = data.currentPassword;

            let query = {};
            query.id = context.identity.id;
            Users.findOne(query).then(function (user) {
                if (!bcrypt.compareSync(currentPassword, user.password)) {
                    return res.status(404).json({ "success": false, "error": { "code": 404, "message": constantObj.user.CURRENT_PASSWORD } });
                } else {
                    if (newPassword != confirmPassword) {
                        return res.status(403).json({ "success": false, "error": { "code": 403, "message": constantObj.user.CONFIRM_PASSWORD_NOTMATCH } });
                    } else {
                        var encryptedPasswordNew = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
                        Users.update({ id: context.identity.id }, { password: encryptedPasswordNew, encryptedPassword: encryptedPasswordNew, }).then(function () {
                            res.status(200).json({
                                "success": true,
                                "message": constantObj.user.PASSWORD_CHANGED
                            });
                        });
                    }
                }
            });
        } catch (err) {
            console.log(err)
            return res.status(500).json({ "success": false, "error": { "code": 500, "message": "" + err } })
        }
    },







};


/** Email to  user after adduser from admin */
emailContactUs = function (options) {
    let email = options.email
    let user_message = options.message
    let subject = options.subject
    let number = options.number
    let name = options.name

    // if (options.firstName && options.lastName) {
    //     Name = options.name
    // } else {
    //     Name = email
    // }
    message = '';

    style = {
        body: `
        padding:15px;
        `,
        p: 'margin-top:0;margin-bottom:10px;',

        textPrimary: `color:#3e3a6e;
        `,
        h5: `font-family: Raleway, sans-serif;
        font-size: 22px;
        background:none;
        padding:0;
        color:#333;
        height:auto;
        font-weight: bold;
        line-height:normal;
        `,
        m0: `margin:0;`,
        mb3: 'margin-bottom:15px;',
        textCenter: `text-align:center;`,
        btn: `padding:10px 30px;
        font-weight:500;
        font-size:14px;
        line-height:normal;
        border:0;
        display:block;
        text-decoration:none;
        margin:auto;
        `,
        btnPrimary: `
        background-color:#3e3a6e;
        color:#fff;
        `,
        bgPrimary: `background-color:#3e3a6e;`,
        footer: `
        padding:10px 15px;
        font-weight:500;
        color:#fff;
        text-align:center;
        background-color:#000;
        `,
        img: `
      width: 100%;
      max-width:40%;
      display: block;
      margin: auto;
      `,
        box: `
        width: 600px;
      display: block;
      margin: auto;
      background: #fff;
      border: 1px solid #e0e0e0;
    `,

        center: `
        text-align:center;
        font-family:sans-serif;
        padding: 0px 20px;
    `,
        logo: `
      width: 6rem;
      padding: 10px;`
    }

    message += `
    <div style="${style.box}">
    <div> <img style="${style.logo}" src="http://74.208.206.18:4031/assets/img/logo.png"></div>
    <div><img style="${style.img}" src="http://74.208.206.18:4019/email_img/contact.jpg"></div>
    <h2 style="${style.center}">Contact us</h2>
    <h4 style="${style.center}">Hello Admin</h4>
    <table style="padding:0px 1rem; text-align:left; width:100%; font-family:sans-serif;">
                <tbody>
                  <tr style="padding-bottom: 10px">
                    <th style="width: 250px">You have a new query from</th>
                    <td>: `+ name + `</td>
                </tr>
                <tr style="padding-bottom: 10px">
                    <th>Email</th>
                    <td>: `+ email + `</td>
                </tr>
    
                <tr style="padding-bottom: 10px">
                    <th>Contact number</th>
                    <td>: `+ number + `</td>
                </tr>
    
                <tr style="padding-bottom: 10px">
                    <th>Message </th>
                    <td>: `+ user_message + `</td>
                </tr>
            </tbody></table>
    </div>`


    transport.sendMail({
        from: 'ShakaShoots! <' + sails.config.appSMTP.auth.user + '>',
        //to: 'job_admin@yopmail.com',
        cc: 'jcsoftwaresolution@gmail.com',
        subject: subject,
        html: message
    }, function (err, info) {
        console.log('err', err, info)
    });
    return {
        success: true, code: 200, message: "Mail has been sent to admin"
    }
};

subscribeMail = function (options) {
    // var url = options.verifyURL,
    let email = options.email
    // console.log("in Email subscribeMail")
    message = '';
    style = {
        header: `
        padding:30px 15px;
        text-align:center;
        background-color:#f2f2f2;
        `,
        body: `
        padding:15px;
        height: 230px;
        `,
        hTitle: `font-family: 'Raleway', sans-serif;
        font-size: 37px;
        height:auto;
        line-height: normal;
        font-weight: bold;
        background:none;
        padding:0;
        color:#333;
        `,
        maindiv: `
        width:600px;
        margin:auto;
        font-family: Lato, sans-serif;
        font-size: 14px;
        color: #333;
        line-height: 24px;
        font-weight: 300;
        border: 1px solid #eaeaea;
        `,
        textPrimary: `color:#3e3a6e;
        `,
        h5: `font-family: Raleway, sans-serif;
        font-size: 22px;
        background:none;
        padding:0;
        color:#333;
        height:auto;
        font-weight: bold;
        line-height:normal;
        `,
        m0: `margin:0;`,
        mb3: 'margin-bottom:15px;',
        textCenter: `text-align:center;`,
        btn: `padding:10px 30px;
        font-weight:500;
        font-size:14px;
        line-height:normal;
        border:0;
        display:inline-block;
        text-decoration:none;
        `,
        btnPrimary: `
        background-color:#3e3a6e;
        color:#fff;
        `,
        footer: `
        padding:10px 15px;
        font-weight:500;
        color:#fff;
        text-align:center;
        background-color:#000;`
    }

    message += `<div class="container" style="` + style.maindiv + `">
    <div class="header" style="`+ style.header + `text-align:center">
        <img src="http://74.208.206.18:4031/assets/img/logo.png" width="150" style="margin-bottom:20px;" />
        <h2 style="`+ style.hTitle + style.m0 + `">Thank You For Subscription</h2>
    </div>
    <div class="body" style="`+ style.body + `">
        <p style="`+ style.m0 + style.mb3 + style.textCenter + `margin-bottom:20px">
            Hey there,<br>
            First off, I’d like to extend a warm welcome and ‘Thank you’ for subscribing to the<b> ShakaShoots!</b> Newsletter. I recognize that your time is valuable and I’m seriously flattered that you chose to join us.
        </p>

        </div>
        <div class="footer" style="`+ style.footer + `">
        &copy 2021 ShakaShoots! All rights reserved.
        </div>
    </div>`

    transport.sendMail({
        // from: sails.config.appSMTP.auth.user,
        from: 'ShakaShoots! Subscription <' + sails.config.appSMTP.auth.user + '>',
        to: email,
        subject: 'ShakaShoots! Subscription',
        html: message
    }, function (err, info) {
        console.log('err', err, info)
        // console.log("DOne");
    });
};

subscribeMailTest = function (options) {
    // var url = options.verifyURL,
    let email = options.email
    // console.log("in Email subscribeMail")
    message = '';
    style = {
        header: `
        padding:30px 15px;
        text-align:center;
        background-color:#f2f2f2;
        `,
        body: `
        padding:15px;
        height: 230px;
        `,
        hTitle: `font-family: 'Raleway', sans-serif;
        font-size: 37px;
        height:auto;
        line-height: normal;
        font-weight: bold;
        background:none;
        padding:0;
        color:#333;
        `,
        maindiv: `
        width:600px;
        margin:auto;
        font-family: Lato, sans-serif;
        font-size: 14px;
        color: #333;
        line-height: 24px;
        font-weight: 300;
        border: 1px solid #eaeaea;
        `,
        textPrimary: `color:#3e3a6e;
        `,
        h5: `font-family: Raleway, sans-serif;
        font-size: 22px;
        background:none;
        padding:0;
        color:#333;
        height:auto;
        font-weight: bold;
        line-height:normal;
        `,
        m0: `margin:0;`,
        mb3: 'margin-bottom:15px;',
        textCenter: `text-align:center;`,
        btn: `padding:10px 30px;
        font-weight:500;
        font-size:14px;
        line-height:normal;
        border:0;
        display:inline-block;
        text-decoration:none;
        `,
        btnPrimary: `
        background-color:#3e3a6e;
        color:#fff;
        `,
        footer: `
        padding:10px 15px;
        font-weight:500;
        color:#fff;
        text-align:center;
        background-color:#000;`
    }

    message += `<div class="container" style="` + style.maindiv + `">
    <div class="header" style="`+ style.header + `text-align:center">
        <img src="http://74.208.206.18:4031/assets/img/logo.png" width="150" style="margin-bottom:20px;" />
        <h2 style="`+ style.hTitle + style.m0 + `">Thank You For Subscription</h2>
    </div>
    <div class="body" style="`+ style.body + `">
        <p style="`+ style.m0 + style.mb3 + style.textCenter + `margin-bottom:20px">
            Hey there,<br>
            First off, I’d like to extend a warm welcome and ‘Thank you’ for subscribing to the<b> ShakaShoots!</b> Newsletter. I recognize that your time is valuable and I’m seriously flattered that you chose to join us.
        </p>

        </div>
        <div class="footer" style="`+ style.footer + `">
        &copy 2021 ShakaShoots! All rights reserved.
        </div>
    </div>`

    transport.sendMail({
        // from: sails.config.appSMTP.auth.user,
        from: 'ShakaShoots! Subscription <' + sails.config.appSMTP.auth.user + '>',
        to: email,
        subject: 'ShakaShoots! Subscription 22',
        html: message
    }, function (err, info) {
        console.log('err', err, info)
        // console.log("DOne");
    });
};

userVerifyEmailLink = function (options) {
    var email = options.email
    message = '';
    style = {
        header: `
      padding:30px 15px;
      text-align:center;
      background-color:#f2f2f2;
      `,
        body: `
      padding:15px;
      height: 230px;
      `,
        hTitle: `font-family: 'Raleway', sans-serif;
      font-size: 37px;
      height:auto;
      line-height: normal;
      font-weight: bold;
      background:none;
      padding:0;
      color:#333;
      `,
        maindiv: `
      width:600px;
      margin:auto;
      font-family: Lato, sans-serif;
      font-size: 14px;
      color: #333;
      line-height: 24px;
      font-weight: 300;
      border: 1px solid #eaeaea;
      `,
        textPrimary: `color:#3e3a6e;
      `,
        h5: `font-family: Raleway, sans-serif;
      font-size: 22px;
      background:none;
      padding:0;
      color:#333;
      height:auto;
      font-weight: bold;
      line-height:normal;
      `,
        m0: `margin:0;`,
        mb3: 'margin-bottom:15px;',
        textCenter: `text-align:center;`,
        btn: `padding:10px 30px;
      font-weight:500;
      font-size:14px;
      line-height:normal;
      border:0;
      display:inline-block;
      text-decoration:none;
      `,
        btnPrimary: `
      background-color:#3e3a6e;
      color:#fff;
      `,
        footer: `
      padding:10px 15px;
      font-weight:500;
      color:#fff;
      text-align:center;
      background-color:#000;
      `
    }

    message += `<div class="container" style="` + style.maindiv + `">
  <div class="header" style="`+ style.header + `text-align:center">
      <img src="http://74.208.206.18:4031/assets/img/logo.png" width="150" style="margin-bottom:20px;" />
      <h2 style="`+ style.hTitle + style.m0 + `">ShakaShoots! </h2>
  </div>
  <div class="body" style="`+ style.body + `">
      <h5 style="`+ style.h5 + style.m0 + style.mb3 + style.textCenter + `">Hello ` + options.fullName + `</h5>
      <p style="`+ style.m0 + style.mb3 + style.textCenter + `margin-bottom:20px;font-weight: 600">You are one step away from verifying your email and joining the ShakaShoots!  community.
      Please verify your account by clicking the link below.</p>
      <div style="`+ style.textCenter + `">
          <a style="text-decoration:none" href="` + constantObj.messages.BACK_WEB_URL + "/verifyEmail?id=" + options.id + `"><span style="` + style.btn + style.btnPrimary + `">Verify Email</span></a>
      </div>
  </div>
  <div class="footer" style="`+ style.footer + `">
  &copy 2021 ShakaShoots!  All rights reserved.
  </div>
</div>`

    transport.sendMail({
        from: 'ShakaShoots!  <' + sails.config.appSMTP.auth.user + '>',
        to: email,
        subject: 'Email Verification',
        html: message
    }, function (err, info) {
        console.log(err, info)
    });
}

emailGeneratedCode = function (options) { //email generated code
    email = options.email,
        verificationCode = options.verificationCode;
    message = '';
    style = {
        header: `
        padding:30px 15px;
        text-align:center;
        background-color:#f2f2f2;
        `,
        body: `
        padding:15px;
        height: 100px;
        `,
        hTitle: `font-family: 'Raleway', sans-serif;
        font-size: 25px;
        height:auto;
        line-height: normal;
        font-weight: bold;
        background:none;
        padding:0;
        color:#333;
        `,
        maindiv: `
        width:600px;
        margin:auto;
        font-family: Lato, sans-serif;
        font-size: 14px;
        color: #333;
        line-height: 24px;
        font-weight: 300;
        border: 1px solid #eaeaea;
        `,
        textPrimary: `color:#3e3a6e;
        `,
        h5: `font-family: Raleway, sans-serif;
        font-size: 22px;
        background:none;
        padding:0;
        color:#333;
        height:auto;
        font-weight: bold;
        line-height:normal;
        `,
        m0: `margin:0;`,
        mb3: 'margin-bottom:15px;',
        textCenter: `text-align:center;`,
        btn: `padding:10px 30px;
        font-weight:500;
        font-size:14px;
        line-height:normal;
        border:0;
        display:inline-block;
        text-decoration:none;
        `,
        btnPrimary: `
        background-color:#3e3a6e;
        color:#fff;
        `,
        footer: `
        padding:10px 15px;
        font-weight:500;
        color:#fff;
        text-align:center;
        background-color:#000;
        `
    }

    message += `<div class="container" style="` + style.maindiv + `">
    <div class="header" style="`+ style.header + `text-align:center">
        <img src="http://74.208.206.18:4031/assets/img/logo.png" width="150" style="margin-bottom:20px;" />
        <h3 style="`+ style.hTitle + style.m0 + `">Reset Password</h3>
    </div>
    <div class="body" style="`+ style.body + `">
        <h5 style="`+ style.h5 + style.m0 + style.mb3 + style.textCenter + `">Hello ` + email + `</h5>
        <p style="`+ style.m0 + style.mb3 + style.textCenter + `margin-bottom:20px">Your verification code for reset password is: <b>` + verificationCode + `</b></p>
    </div>
    <div class="footer" style="`+ style.footer + `">
    &copy 2021 ShakaShoots! All rights reserved.
    </div>
</div>
    `
    transport.sendMail({
        from: 'ShakaShoots! <' + sails.config.appSMTP.auth.user + '>',
        to: email,
        subject: 'Reset Password',
        html: message
    }, function (err, info) {
        console.log('err', err, info)
    });


};
