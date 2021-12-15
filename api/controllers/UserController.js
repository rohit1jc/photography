/**
 * UserController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const bcrypt = require('bcrypt-nodejs');
var pdf = require("html-pdf");


var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var url = "http://74.208.206.18:4001";
var url2 = "http://localhost:1337";
var async = require('async');
var ObjectId = require('mongodb').ObjectID;
const http = require('http');
var twilio = require('../../config/local.js');
var client = require('twilio')(
  twilio.TWILIO_ACCOUNT_SID,
  twilio.TWILIO_AUTH_TOKEN
);

var fs = require("fs");

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

generatePassword = function (charLength) { // action are perform to generate random password for user
  var length = charLength,
      charset = "0123456789",
      retVal = "";

  for (var i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};
const db = sails.getDatastore().manager;

module.exports = {
  register: async function (req, res) {
    // console.log("In Reginster UserController");
    if (!req.body.firstName || typeof req.body.firstName == undefined) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constantObj.user.FIRSTNAME_REQUIRED },
      });
    }
    if (!req.body.lastName || typeof req.body.lastName == undefined) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constantObj.user.LASTNAME_REQUIRED },
      });
    }
    if (!req.body.email || typeof req.body.email == undefined) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constantObj.user.EMAIL_REQUIRED },
      });
    }
    if (!req.body.password || typeof req.body.password == undefined) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constantObj.user.PASSWORD_REQUIRED },
      });
    }
    if (!req.body.mobileNo || typeof req.body.mobileNo == undefined) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constantObj.user.MOBILE_REQUIRED },
      });
    }
    if (!req.body.role || typeof req.body.role == undefined) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constantObj.user.ROLE_REQUIRED },
      });
    }
    // if (!req.body.address || typeof req.body.address == undefined) {
    //   return res.status(404).json({
    //     success: false,
    //     error: { code: 404, message: constantObj.user.ADDRESS },
    //   });
    // }

    // if (!req.body.lat || typeof req.body.lat == undefined) {
    //   return res.status(404).json({
    //     success: false,
    //     error: { code: 404, message: constantObj.user.LATITUDE },
    //   });
    // }

    // if (!req.body.lang || typeof req.body.lang == undefined) {
    //   return res.status(404).json({
    //     success: false,
    //     error: { code: 404, message: constantObj.user.LANGTITUDE },
    //   });
    // }

    var date = new Date();
    try {
      var user = await Users.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constantObj.user.USERNAME_ALREADY },
        });
      } else {
        const OTP = generatePassword(4);
        req.body.otp = OTP 
        req.body["date_registered"] = date;
        req.body["date_verified"] = date;
        req.body["status"] = "active";
        // req.body["cv_id"] = Math.floor(10000000 + Math.random() * 90000000);
        // console.log(req.body.mobileNo,'req.body.mobileNo')
        req.body.fullName = `${req.body.firstName} ${req.body.lastName}`;
        await client.messages.create({
          from: twilio.TWILIO_PHONE_NUMBER,
          to: req.body.mobileNo,
          body:  `Your mobile number varification otp: `+OTP
        }).then((message) => console.log(message.sid));
        var newUser = await Users.create(req.body).fetch();
        if (newUser) {
          var number =newUser.mobileNo

          userVerifyLink({
            email: newUser.email,
            fullName: newUser.fullName,
            id: newUser.id,
          });

          return res.status(200).json({
            success: true,
            code: 200,
            data: newUser,
            message: constantObj.user.SUCCESSFULLY_REGISTERED,
          });
        }
      }
    } catch (err) {
      console.error(err);
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: "" + err } });
    }
  },
  /**
   *
   * @param {*} {"email":"","otp":""}
   * @param {*} res
   * @returns detail of use and acess token
   * @description : Used to  verifiy otp of user
   * @createdAt : 07/12/2021
   * @createdBy : Rohit Kumar
   */
   verifiyOtp: async(req, res) => {
    try {
      var otp = req.param("otp");
      var mobileno = req.param("mobileNo");

      if (!otp || typeof otp == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.OTP_REQUIRED },
        });
      }
      if (!mobileno || typeof mobileno == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: "Mobile number required" },
        });
      }
      var query = {};
      query.otp = otp;
      query.mobileNo = mobileno;
      await Users.updateOne(query, { ismobilenovarified: 'active'}).then((user) => {
        if (user) {
          

          return res.status(200).json({
            success: true,
            message: "Mobile number varify successfully"
          });
        } else {
          return res.status(400).json({
            success: false,
            error: { message: constantObj.user.INVALID_OTP },
          });
        }
      });
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: "" + err } });
    }
  },

  adminSignin: async function (req, res) {
    // console.log("In adminSignin")
     if (!req.body.email || typeof req.body.email == undefined) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constantObj.user.USERNAME_REQUIRED },
      });
    }

    if (!req.body.password || typeof req.body.password == undefined) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constantObj.user.PASSWORD_REQUIRED },
      });
    }
    var email_address = req.body.email.toLowerCase();
    var user = await Users.findOne({ email: email_address });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constantObj.user.WRONG_EMAIL },
      });
    }

    if (user && user.status == "deactive") {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constantObj.user.USERNAME_INACTIVE },
      });
    }

    if (user && user.status != "active" && user.isVerified != "Y") {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constantObj.user.USERNAME_INACTIVE },
      });
    }

    if (user.role != "admin" && user.role != "sub_admin") {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constantObj.user.EMAILORPASSWORD },
      });
    }

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(404).json({
        success: false,
        error: { code: 404, message: constantObj.user.WRONG_PASSWORD },
      });
    } else {
      // console.log("userftf", user.id, user.firstName)
      var new_date = new Date();
      var token = jwt.sign(
        { user_id: user.id, lastLogin: new_date },
        { issuer: "Jcsoftware", subject: user.email, audience: "photography" }
      );
      user.access_token = token;

      var updatedUser = await Users.updateOne({ email: email_address }).set({
        lastLogin: new_date,
      });

      return res.status(200).json({
        success: true,
        code: 200,
        message: constantObj.user.SUCCESSFULLY_LOGGEDIN,
        data: user,
      });
    }
  },
  /*
   *changePassword Create 26-05-21
   *changePassword
   */
  changePassword: async function (req, res) {
    try {
      if (!req.body.newPassword || typeof req.body.newPassword == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.PASSWORD_REQUIRED },
        });
      }

      if (
        !req.body.confirmPassword ||
        typeof req.body.confirmPassword == undefined
      ) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: constantObj.user.CONPASSWORD_REQUIRED,
          },
        });
      }

      if (
        !req.body.currentPassword ||
        typeof req.body.currentPassword == undefined
      ) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: constantObj.user.CURRENTPASSWORD_REQUIRED,
          },
        });
      }

      API(UserService.changePassword, req, res);
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, error: { code: 500, message: "" + err } });
    }
  },


  /*
   *For User  Login
   */
  userSignin: async function (req, res) {
    try {
      if (!req.body.email || typeof req.body.email == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.USERNAME_REQUIRED },
        });
      }
      if (!req.body.password || typeof req.body.password == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.PASSWORD_REQUIRED },
        });
      }
      var user = await Users.findOne({
        where: { email: req.body.email },
        select: [
          "email",
          "role",
          "status",
          "isVerified",
          "password",
          "firstName",
          "lastName",
          "fullName",
          "image",
          "isDeleted",
          "addedBy",
        ],
      });
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.WRONG_EMAIL },
        });
      }

      if (
        user.role != "user" && user.role != "photographer"
      ) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: "You are unauthorized user" },
        });
      }

      if (user && user.status == "deactive") {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.USERNAME_INACTIVE },
        });
      }

      if (user.isVerified == "N") {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.USERNAME_VERIFIED },
        });
      }

      if (user.isDeleted == true) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.USERNAME_DELETE },
        });
      }
      if (!bcrypt.compareSync(req.body.password, user.password)) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.WRONG_PASSWORD },
        });
      } else {
        // console.log("userftf", user.id, user.firstName)
        let new_date = new Date();
        var token = jwt.sign(
          { user_id: user.id, lastLogin: new_date, firstName: user.firstName },
          { issuer: "Jcsoftware", subject: user.email, audience: "photography" }
        );
        // const refreshToken = jwt.sign(
        //   { user_id: user.id,lastLogin: new_date },
        //   { issuer: "refresh", subject: "user", audience: "photography" }
        // );  
        await Users.updateOne({ id: user.id }).set({
          lastLogin: new_date,
        });

        user.access_token = token;
        // user.refresh_token = refreshToken;
        return res.status(200).json({
          success: true,
          code: 200,
          message: constantObj.user.SUCCESSFULLY_LOGGEDIN,
          data: user,
        });
      }
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: "" + error } });
    }
  },

  /*For Get User Details
   * Get Record from Login User Id
   */
  userDetails: async function (req, res) {
    try {
      var id = req.param("id");
      if (!id || typeof id == undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: "Id Is required" },
        });
      }

      var userDetails = await Users.findOne({ where: { id: id } });
      if (userDetails == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: "User Not Found" },
        });
      }
      return res
        .status(200)
        .json({ success: true, code: 200, data: userDetails });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: "" + error } });
    }
  },

  /*For Get User Base On Role
   * Param Role
   */
  userRole: async function (req, res) {
    try {
      var role = req.param("role");
      if (!role || typeof role == undefined) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: "Role is required" },
        });
      }
      var userDetails = await Users.find({
        where: { role: role, isDeleted: false },
        select: ["status", "fullName"],
      });
      return res.status(200).json({
        success: true,
        code: 200,
        data: userDetails,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: "" + error } });
    }
  },
  getPhotoGrapher: async (req, res) => {
    try {
      const id = req.param("id");
      if ((!id) || typeof id == undefined) {
        return res.status(404).json(errorMsg(constantObj.project.ID_REQUIRED));
      } else {
        const response = await Users.findOne({ id: id });
        if (response) {
          const servicesDetails = await Category.find({ status: 'active', isDeleted: false, cat_type: 'services', id: { in: response.services } });
          response.services = servicesDetails;
          return res.status(200).json({
            success: true,
            data: response
          });
        }
        else return res.status(404).json({
          success: false,
          error: {
            code: 400,
            message: "No user found."
          }
        });
      }
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: "" + error } });
    }

  },

  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * @description To search photographer
   * @date 29/09/2021
   * @author Vibhay
   */

  searchPhotoGrapher: async (req, res) => {
    try {
      let search = req.param('search');
      const page = req.param('page') || 1;
      const count = req.param('count') || 10;
      const skipNo = Math.abs((page - 1) * count);
      const filterQ = [{ isDeleted: false, role: 'photographer', status: 'active' }];
      const innerORQuery = [];
      const query = {};
      req.param('services') && filterQ.push({ $or: [{ services: { $all: req.param('services').split(',') } }] });
      if (search) {
        search = search.replace(/[?]/g, ' ');
        innerORQuery.push({ fullName: { $regex: search, '$options': 'i' } });
        // innerORQuery.push({ services:{in: { $regex: search, '$options': 'i' } }});
        filterQ.push({ $or: innerORQuery });
      }
      if (filterQ.length > 0) {
        query.$and = filterQ;
      }
      // console.log(JSON.stringify(query));
      db.collection('users').aggregate([
        {
          $project: {
            id: "$_id",
            role: "$role",
            isDeleted: "$isDeleted",
            fullName: "$fullName",
            services: "$services",
            createdAt: "$createdAt",
            updatedBy: "$updatedBy",
            deletedAt: "$deletedAt",
            updatedAt: "$updatedAt",
            status: "$status",
          }
        },
        {
          $match: query
        }

      ]).toArray((err, results) => {
        console.log(results);
        db.collection('users').aggregate([
          {
            $project: {
              id: "$_id",
              role: "$role",
              isDeleted: "$isDeleted",
              fullName: "$fullName",
              services: "$services",
              createdAt: "$createdAt",
              updatedBy: "$updatedBy",
              deletedAt: "$deletedAt",
              updatedAt: "$updatedAt",
              status: "$status",
            }
          },
          {
            $match: query
          },
          {
            $sort: { createdAt: -1 }
          },
          {
            $skip: skipNo
          },
          {
            $limit: Number(count)
          },
        ]).toArray(async (err, result) => {
          console.log(result.services);
          function* getServicesById(ids) {
            const id = ids.filter(id => id !== null)
            yield Category.find({ select: ['name'], where: { id: { in: id } } });
          }
          await (async function () {
            if (result) for await (const photographer of result) {
              if (photographer['services']) for await (const service of getServicesById(photographer['services'])) {
                photographer['services'] = service;
              }
            }
          })();
          return res.status(200).json({
            "success": true,
            "code": 200,
            "data": result ? result : [],
            "total": results ? results.length : 0,
          });
        })
      });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: " " + error } });
    }



  },

  //For get all user List
  getAllUsers: async (req, res) => {
    // console.log("In Get all user");
    try {
      var search = req.param("search");
      var role = req.param("role");
      var isDeleted = req.param("isDeleted");
      var count = req.param("count");
      var page = req.param("page");

      if (page == undefined) {
        page = 1;
      }
      if (count == undefined) {
        count = 10;
      }
      var skipNo = (page - 1) * count;

      var query = {};
      query.$and = [];
      innerORQuery = [];

      if (search) {
        innerORQuery.push({ fullName: { $regex: search, $options: "i" } });
        innerORQuery.push({ email: { $regex: search, $options: "i" } });
        query.$and.push({ $or: innerORQuery });
      }

      if (role) {
        query.$and.push({ role: role });
      }
      query.$and.push({ role: { $ne: "admin" } });
      if (isDeleted) {
        if (isDeleted === "true") {
          isDeleted = true;
          var sortBy = { updatedAt: -1 };
        } else {
          isDeleted = false;
          var sortBy = { createdAt: -1 };
        }
        query.$and.push({ isDeleted: isDeleted });
      } else {
        var sortBy = { createdAt: -1 };
      }
      db.collection("users")
        .aggregate([
          {
            $project: {
              id: "$_id",
              role: "$role",
              isDeleted: "$isDeleted",
              fullName: "$fullName",
              email: "$email",
              createdAt: "$createdAt",
              updatedBy: "$updatedBy",
              deletedAt: "$deletedAt",
              updatedAt: "$updatedAt",
              status: "$status",
            },
          },
          {
            $match: query,
          },
        ])
        .toArray((err, results) => {
          // console.log(results,'results---');
          db.collection("users")
            .aggregate([
              {
                $lookup: {
                  from: "users", //other table name
                  localField: "deletedBy", //name of car table field
                  foreignField: "_id", //name of cardetails table field
                  as: "deletedBy", //alias for cardetails table
                },
              },
              {
                $unwind: {
                  path: "$deletedBy",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  id: "$_id",
                  role: "$role",
                  isDeleted: "$isDeleted",
                  fullName: "$fullName",
                  email: "$email",
                  createdAt: "$createdAt",
                  updatedBy: "$updatedBy",
                  deletedAt: "$deletedAt",
                  updatedAt: "$updatedAt",
                  status: "$status",
                },
              },
              {
                $match: query,
              },
              { $sort: sortBy },
              {
                $skip: skipNo,
              },
              {
                $limit: Number(count),
              },
            ])
            .toArray(async (err, result_datas) => {
              return res.status(200).json({
                success: true,
                code: 200,
                data: result_datas ? result_datas : [],
                total: results ? results.length : 0,
              });
            });
        });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: " " + error } });
    }
  },

  /*
   *For Check Email Address Exit or not
   */
  checkEmail: async function (req, res) {
    var email = req.body.email;
    if (!email || typeof email == undefined) {
      return res.status(400).json({
        success: false,
        error: { code: 400, message: constantObj.user.USERNAME_REQUIRED },
      });
    }
    Users.findOne({ email: email }).then((user) => {
      if (user) {
        return res.status(200).json({
          success: false,
          error: { code: 400, message: constantObj.user.EMAIL_EXIST },
        });
      } else {
        return res.status(200).json({
          success: true,
          code: 200,
          message: "you can use this email",
        });
      }
    });
  },

  editProfile: (req, res) => {
    API(UserService.editProfile, req, res);
  },

  forgotPassword: function (req, res) { 
    console.log("in forgot password")
    API(UserService.webForgotPassword, req, res);
  },

  resetPassword: function (req, res) {
    API(UserService.resetPassword, req, res);
  },


  assignRoleToUser: async (req, res) => {
    try {
      let Id = req.param("id");

      if (!Id || typeof Id == undefined) {
        return res.status(404).json({
          success: false,
          error: { message: "User id required" },
        });
      }
      var userId = req.param("id");
      var userrole = req.body.role;
      var updatedUserData = await Users.updateOne({
        id: userId,
      }).set({ role: userrole });
      return res.status(200).json({
        success: true,
        data: updatedUserData,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { message: error },
      });
    }

  },

  addUser: async function (req, res) {
    try {
      if (!req.body.email || typeof req.body.email == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.USERNAME_REQUIRED },
        });
      }
      if (!req.body.role || typeof req.body.role == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.ROLE_REQUIRED },
        });
      }
      // if (req.body.role === 'photographer') {
      //   if (!req.body.services || typeof req.body.services == undefined) {
      //     return res.status(404).json({
      //       success: false,
      //       error: { code: 404, message: "Services required" },
      //     });
      //   }
      //   // if (Array.isArray(req.body.services)) {
      //   //   return res.status(404).json({
      //   //     success: false,
      //   //     error: { code: 404, message: "Please verify services data format" },
      //   //   });
      //   // }
      // }
      var date = new Date();

      var user = await Users.findOne({ email: req.body.email });

      if (user) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.USERNAME_ALREADY },
        });
      } else {
        data = req.body;
        var autoGenratedpassword = generatePassword();
        var encryptedPassword = bcrypt.hashSync(
          autoGenratedpassword,
          bcrypt.genSaltSync(10)
        );

        req.body["date_registered"] = date;
        req.body["date_verified"] = date;
        req.body["status"] = "active";
        req.body["password"] = autoGenratedpassword;
        req.body["fullName"] = req.body.fullName;
        req.body["isVerified"] = "Y";
        req.body["termCondition"] = true;
        // req.body["addedBy"]             = req.identity.id;

        var newUser = await Users.create(data).fetch();
        if (newUser) {
          await addUserEmail({
            email: req.body.email,
            password: autoGenratedpassword,
            firstName: req.body.firstName,
          });

          return res.status(200).json({
            success: true,
            code: 200,
            message: constantObj.user.SUCCESSFULLY_REGISTERED,
          });
        }
      }
    } catch (err) {
      return res
        .status(404)
        .json({ success: false, error: { code: 404, message: err.toString() } });
    }
  },

  logout: (req, res) => {
    API(UserService.logout, req, res);
  },

  contactus: function (req, res) {
    API(UserService.contactUs, req, res);
  },

  getAllContactEmail: function (req, res, next) {
    try {
      var query = {};
      ContactPerson.find(query)
        .select("email", "firstName", "lastName")
        .sort("createdAt desc")
        .exec(function (err, contact_data) {
          if (err) {
            return res
              .status(400)
              .json({ success: false, code: 400, error: err });
          } else {
            return res.json({
              success: true,
              code: 200,
              data: contact_data,
            });
          }
        });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: " " + error } });
    }
  },

  subscribe: function (req, res) {
    var data = req.body;
    // console.log('In Scbscrube Email')
    if (data.email == "" || data.email == null) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: constantObj.user.USERNAME_REQUIRED,
      });
    }
    let email = data.email;
    var query = {};
    query.email = email;
    Subscribers.findOne(query).then(function (subscribe) {
      if (subscribe == undefined) {
        // console.log("1");
        Subscribers.create(data).then(function (user) {
          subscribeMail({ email: email });
          return res.status(200).json({
            success: true,
            code: 200,
            message: constantObj.user.SUBSCRIBSUCCESS,
          });
        });
      } else {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constantObj.user.subscribed_Updates },
        });
      }
    });
  },

  //First Time User Verified Email Address
  verifyUser: (req, res) => {
    try {
      // console.log("In verified");
      var id = req.param("id");
      Users.findOne({ id: id }).then((user) => {
        if (user) {
          Users.updateOne({ id: id }, { isVerified: "Y" }).then((verified) => {
            if(user.role==='photographer'){
              return res.redirect(
                constantObj.messages.FRONT_WEB_URL + "/photographer/profile?id="+user.id
              );
              
            }else {
              return res.redirect(
                constantObj.messages.FRONT_WEB_URL + "/auth/login"
              ); 
            }
            
          });
        } else {
          return res.redirect(constantObj.messages.FRONT_WEB_URL);
        }
      });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: " " + err } });
    }
  },

  //For Verified Email Address
  verifyEmail: (req, res) => {
    // console.log("in verifyEmail");
    var id = req.param("id");
    Users.findOne({ id: id }).then((user) => {
      if (user) {
        var data = {};

        let contact_information = {};
        contact_information = {
          isEmailVerified: "Yes",
        };
        data.email = user.contact_information.email;
        data.contact_information = contact_information;
        // console.log(data,'data==');
        Users.updateOne({ id: req.param("id") }, data).then((verified) => {
          // console.log("DOne");
          return res.redirect(
            constantObj.messages.FRONT_WEB_URL + "/auth/login"
          );
        });
      } else {
        return res.redirect(constantObj.messages.FRONT_WEB_URL);
      }
    });
  },

  /*
   *For User auto login
   * Endited by Vibhay
   */
  userAutoLogin: async function (req, res) {
    try {
      var userId = req.body.userId;
      if (!userId || typeof userId == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.ID_REQUIRED },
        });
      }
      var user = await Users.findOne({
        where: { id: ObjectId(userId) + "" },
        select: [
          "email",
          "role",
          "status",
          "isVerified",
          "firstName",
          "lastName",
          "fullName",
          "image",
          "isDeleted",
          "addedBy",
        ],
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.WRONG_USER },
        });
      }

      if (user.role !== "photographer") {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: "You are unauthorized user" },
        });
      }

      if (user && user.status == "deactive") {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.USERNAME_INACTIVE },
        });
      }

      if (user.isDeleted == true) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.USERNAME_DELETE },
        });
      }

      let new_date = new Date();
      var token = jwt.sign(
        { user_id: user.id, lastLogin: new_date, firstName: user.firstName },
        { issuer: "Jcsoftware", subject: user.email, audience: "photography" }
      );
      await Users.updateOne({ id: user.id }).set({
        lastLogin: new_date,
      });

      user.access_token = token;
      // user.refresh_token = refreshToken;
      return res.status(200).json({
        success: true,
        code: 200,
        message: constantObj.user.SUCCESSFULLY_LOGGEDIN,
        data: user,
      });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: "" + error } });
    }
  },

  /**
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @description : Used to get user profile data for current user
   * @createdAt : 01/09/2021
   * @createdBy : Amit Kumar
   */
  userProfileData: (req, res, next) => {
    // console.log("in user profile data")
    let query = {};
    query.id = req.identity.id;
    Users.findOne(query).exec((err, userDetail) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: "" + err },
        });
      } else {
        return res.status(200).json({
          success: true,
          code: 200,
          data: userDetail,
        });
      }
    });
  },

  markPreferred: (req, res) => {
    try {
      // console.log("In verified");
      var id = req.param("id");
      var isPreferred = req.param("isPreferred");
      Users.findOne({ id: id }).then((user) => {
        if (user) {
          Users.updateOne({ id: id }, { isPreferred: isPreferred }).then((user) => {
            res.status(200).json({
              success: true,
              code: 200,
              data: user,
              message:isPreferred+" mark successfully",
            });
          });
        }
        else {
          res.status(400).json({
            success: false,
            error: { code: 400, message: "User not found"  },
          });
        }
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: { code: 400, message: " " + err } });
    }
  },
};



/** Email to  user after adduser from admin */
var addUserEmail = function (options) { //email generated code
  var email = options.email,
    password = options.password;

  message = '';
  style = {
    header: `
      padding:30px 15px;
      text-align:center;
      background-color:#f2f2f2;
      `,
    body: `
      padding:15px;
      height: 140px;
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
      <h2 style="`+ style.hTitle + style.m0 + `">Welcome to ShakaShoots!</h2>
  </div>
  <div class="body" style="`+ style.body + `">
      <h5 style="`+ style.h5 + style.m0 + style.mb3 + style.textCenter + `">Hello ` + options.firstName + `</h5>
      <p style="`+ style.m0 + style.mb3 + style.textCenter + `margin-bottom:20px">Your account has been created on ShakaShoots!. Please login with the following credentials.<br> Email : ` + email + ` <br>
      Password :  ` + password + ` <br></p>

      </div>
      <div class="footer" style="`+ style.footer + `">
      &copy 2021 ShakaShoots! All rights reserved.
      </div>
  </div>`

  transport.sendMail({
    from: 'ShakaShoots! <' + sails.config.appSMTP.auth.user + '>',
    to: email,
    subject: 'Registration Verification',
    html: message
  }, function (err, info) {
    console.log(err, "error", info, "info")
  });
};


userVerifyLink = function (options) {
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
      <img src="http://74.208.206.18:4031/assets/img/logo.png width="150" style="margin-bottom:20px;" />
      <h2 style="`+ style.hTitle + style.m0 + `">Welcome to ShakaShoots! </h2>
  </div>
  <div class="body" style="`+ style.body + `">
      <h5 style="`+ style.h5 + style.m0 + style.mb3 + style.textCenter + `">Hello ` + options.fullName + `</h5>
      <p style="`+ style.m0 + style.mb3 + style.textCenter + `margin-bottom:20px;font-weight: 600">You are one step away from verifying your account and joining the ShakaShoots!  community.
      Please verify your account by clicking the link below.</p>
      <div style="`+ style.textCenter + `">
          <a style="text-decoration:none" href="` + constantObj.messages.BACK_WEB_URL + "/verifyUser?id=" + options.id + `"><span style="` + style.btn + style.btnPrimary + `">Verify Email</span></a>
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
};

