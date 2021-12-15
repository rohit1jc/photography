
module.exports.appSMTP = { //appSmtp use in EndUserService.js
  service: "Gmail",
  host: 'smtp.gmail.com',
  port: 587,
  debug: true,
  sendmail: true,
  requiresAuth: true,
  domains: ["gmail.com", "googlemail.com"],

  // auth: {
  //   user: 'jcgdeeds@gmail.com',
  //   pass: 'jcsoftware!234'
  // }

  auth: {
    user: 'aimanshugupta@gmail.com',
    pass: 'rushjkbyyeyfymkc'
  }
}
