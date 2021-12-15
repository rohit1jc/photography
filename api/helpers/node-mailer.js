"use strict";
const nodemailer = require("nodemailer");

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  host: sails.config.appSMTP.host,
  port: sails.config.appSMTP.port,
  debug: sails.config.appSMTP.debug,
  secure: false, // true for 465, false for other ports
  auth: {
    user: sails.config.appSMTP.auth.user, // generated ethereal user
    pass: sails.config.appSMTP.auth.pass // generated ethereal password
  }
});

async function mailer(inputs, exits) {

  // console.log("opgj", inputs)

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'Job Portal <' + sails.config.appSMTP.auth.user + '>', // sender address
    to: inputs.email,
    subject: inputs.subject, // Subject line
    html: inputs.message // html body
  })
  if (info) {
    console.log("info", info)
    return exits.success();
  }
}

module.exports = {

  friendlyName: 'node-mailer',


  description: 'To send Email to users',

  inputs: {

    email: {
      friendlyName: 'email',
      description: 'whom to send mail',
      type: 'string',
    },

    subject: {
      description: 'Subject of Email',
      type: 'string'
    },

    message: {
      description: 'HTML Body',
      type: 'string'
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'Recent users',
      outputDescription: 'An array of users who recently logged in.',
    },

    noUsersFound: {
      description: 'Could not find any users who logged in during the specified time frame.'
    }

  },

  fn: mailer


};

