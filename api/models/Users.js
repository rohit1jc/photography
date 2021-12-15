var promisify = require('bluebird').promisify;
var bcrypt = require('bcrypt-nodejs');

module.exports = {
  schema: true,
  primaryKey: "id",
  attributes: {
    firstName: {
      type: "string",
    },
    lastName: {
      type: "string",
    },
    fullName: {
      type: "string",
    },
    email: {
      type: "string",
      isEmail: true,
      unique: true,
    },
    mobileNo: {
      type: "ref",
      columnType: "bigint",
    },

    image: {
      type: "json",
    },
    password: {
      type: "string",
      columnName: "encryptedPassword",
      minLength: 8,
    },
    gender: {
      type: "string",
      isIn: ["male", "female","other"],
      defaultsTo: "male",
    },
    date_verified: {
      type: "ref",
      columnType: "datetime",
    },
    isVerified: {
      type: "string",
      isIn: ["Y", "N"],
      defaultsTo: "N",
    },
    role: {
      type: "string",
      isIn: ["photographer", "admin","user","guestuser"],
      defaultsTo: "photographer",
    },

    isDeleted: {
      type: "Boolean",
      defaultsTo: false,
    },
    isPreferred: { //To photgrapher
      type: "string",
      isIn: ["active", "deactive","pending"],
      defaultsTo: 'deactive',
    },
    lastLogin: {
      type: "ref",
      columnType: "datetime",
    },
    dob:{
      type: "ref",
      columnType: "datetime",
    },
    startedPhotography:{
      type: "ref",
      columnType: "datetime",
    },
    vatNumber:{
      type: "string",
    },
    bibliography:{
      type: "string",
    },
    addedBy: {
      model: "users",
    },

    deletedBy: {
      model: "users",
    },

    deletedAt: {
      type: "ref",
      columnType: "datetime",
    },

    updatedBy: {
      model: "users",
    },

    createdAt: {
      type: "ref",
      autoCreatedAt: true,
    },

    updatedAt: {
      type: "ref",
      autoUpdatedAt: true,
    },

    termCondition: {
      type: "Boolean",
      required:true,
    },

    verificationCode: {
      type: "string",
    },

    address: {
      type: "string",
    },
    location: {
      type: "json",
    },
    status: {
      type: "string",
      isIn: ["active", "deactive"],
      defaultsTo: "active",
    },
    website: {
      type: "string",
    },
    // services:{
    //   type:'json',
    //   defaultsTo:[]
    // },
    // category: {
    //   type: "string",
    // },
    profileImage: {
      type: "string",
    },

    logoImage: {
      type: "string",
    },
    customerId:{
      type: "string",
      defaultsTo: "",
    },
    cards:{
      type: "json",
      columnType: 'array'
    },
    country:{
      type: "string",
    },
    area:{
      type: "string",
    },
    state:{
      type: "string",
    },
    postcode:{
      type: "string",
    },
    otp:{
      type: "string",
    },
    ismobilenovarified: { 
      type: "string",
      isIn: ["active", "deactive","pending"],
      defaultsTo: 'pending',
    },
  },

  beforeCreate: function (user, next) {
    if (user.firstName && user.lastName) {
      user.fullName = user.firstName + " " + user.lastName;
    }

    if (user.hasOwnProperty("password")) {
      user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
      next(false, user);
    } else {
      next(null, user);
    }
  },
  authenticate: function (email, password) {
    // console.log("in auth    ")
    var query = {};
    query.email = email;
    query.$or = [{ roles: ["SA", "A"] }];

    return Users.findOne(query)
      .populate("roleId")
      .then(function (user) {
        //return API.Model(Users).findOne(query).then(function(user){
        return user && user.date_verified && user.comparePassword(password)
          ? user
          : null;
      });
  },
  customToJSON: function () {
    // Return a shallow copy of this record with the password and ssn removed.
    return _.omit(this, ["password", "verificationCode"]);
  },
};
