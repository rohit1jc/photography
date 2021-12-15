/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {
  'post /signup': 'UserController.register',
  "post /admin/signin": "UserController.adminSignin",
  "post /change/password": "UserController.changePassword",

  "get /users": "UserController.getAllUsers",
  "put /user": "UserController.editProfile",
  "post /logout": "UserController.logout",
  "post /forgot/password": "UserController.forgotPassword",
  "put /reset/password": "UserController.resetPassword",
  "post /add/users": "UserController.addUser",
  "put /assign/user/role": "UserController.assignRoleToUser",

  "post /user/signin": "UserController.userSignin",
  "post /user/auto/login": "UserController.userAutoLogin",
  "post /add/user": "UserController.addUser",
  "get /search/photographer": "UserController.searchPhotoGrapher",

  "post /contactus": "UserController.contactus",
  // 'post /subscribe': 'UserController.subscribe',
  // 'get /subscribers': 'UserController.subscribeList',
  'get /verifyUser': 'UserController.verifyUser',
  'get /verifyEmail': 'UserController.verifyEmail',
  "post /check/email": "UserController.checkEmail",
  "get /user/details/:id": "UserController.userDetails",
  "get /photographer": "UserController.getPhotoGrapher",
  "put /markPreferred": "UserController.markPreferred",
  "put /verifiyotp": "UserController.verifiyOtp",

  /**Roles and permission Routes */
  // 'post /role': 'RolesController.save',
  "put /role": "RolesController.edit",
  "get /role": "RolesController.getRole",
  "get /roles": "RolesController.getAllRoles",
  // 'get /role/name': 'RolesController.getAllRolesName',

  //Common API's
  "post /uploadImages": "CommonController.uploadImages",
  "post /multiple/images": "CommonController.multipleImages",
  "put /change/status": "CommonController.changeStatus",
  "delete /delete": "CommonController.delete",
  "delete /deleteImage": "CommonController.removeImage",

  // 'post /record': 'CommonController.saveRecord',
  // 'get /records': 'CommonController.getRecord',
  // 'put /record': 'CommonController.updateRecord',
  // 'get /record': 'CommonController.getSingleRecord',

  // 'post /email/subscribers': 'CommonController.sendMailToAllSubscribers',

  /**Blogs Routes */
  "post /blog": "BlogsController.save",
  "get /blogs": "BlogsController.getAllBlog",
  "put /blog": "BlogsController.edit",
  "get /blog": "BlogsController.getSingleBlog",
  // 'post /comment/blog': 'BlogsController.commentBlog',

  /**Content Managment routes */
  "put /content": "ContentManagmentController.update",
  "get /contents": "ContentManagmentController.getAllContentList",
  "get /content": "ContentManagmentController.getSingleContent",

  /**Favourites Routes */
  // 'post /favourite': 'FavouritesController.addFavourites',
  // 'get /favourites': 'FavouritesController.Favourites',

  //For Country And city
  "get /countrys": "CommonController.findAllCounrty",
  "get /states": "CommonController.findAllState",
  "get /cities": "CommonController.findAllCities",

  /**Setting Routes */
  "get /setting": "SettingsController.setting",
  "put /setting": "SettingsController.updateSetting",

  /**Category Routes */
  "post /category": "CategoryController.save",
  "put /category": "CategoryController.update",
  "get /categories": "CategoryController.getAllCategory",
  "get /category": "CategoryController.getSingleCategory",
  "get /all/category": "CategoryController.getCategories",
  "get /subCategories": "CategoryController.getAllSubCategory",
  "get /mainCategories": "CategoryController.getAllMainCategories",

  /**Subscription plan Routes */
  "post /add/plan": "SubscriptionPlanController.addPlan",
  "get /plans": "SubscriptionPlanController.getplans",
  "get /plan": "SubscriptionPlanController.getSinglePlan",
  "put /plan": "SubscriptionPlanController.updateSinglePlan",
  "get /plan/feature": "SubscriptionPlanController.getPlanFeatureById",
  "post /add/plan/features": "SubscriptionPlanController.updatefeaturedPlan",
  "delete /delete/plan": "SubscriptionPlanController.deletePlan",

  /**Payment Controller */
  "post /save/card": "PaymentController.saveCard",
  "put /make/default": "PaymentController.makeDefaultToCard",
  "get /cards": "PaymentController.getAllCards",
  "delete /card": "PaymentController.deleteCard",
  "post /checkout": "PaymentController.checkoutPayment",
  "post /paynow": "PaymentController.payNow",
  "post /refund": "PaymentController.refund",
  "get /transactions": "PaymentController.getAllTransactions",

  /**Booking Controller */
  "post /book": "BookingController.booked",
  'get /book': 'BookingController.getSingleBooked',
  'get /booking/request': 'BookingController.getBookingRequest',
  'get /booked/list': 'BookingController.getBookingList',
  'get /trackbooking': 'BookingController.getBookingListById',
  'get /accept/list': 'BookingController.getAcceptedBooking',
  'put /photographer/action': 'BookingController.photographerAction',


  /**Accessories Controller */
  "post /accessories": "AccessoriesController.addAccessories",
  'get /accessories': 'AccessoriesController.getAccessories',
  'get /accessoriesbyuserid': 'AccessoriesController.getAccessoriesById',

  /**Photography Controller */
  "post /photography": "PhotographerDetailsController.addPhotography",
  "put /photography/verify": "PhotographerDetailsController.verifyPhotographer",
  "get /photographies": "PhotographerDetailsController.getAllPhotography",
  "get /photography": "PhotographerDetailsController.getPhotography",
  "get /photographer/equipments":"PhotographerDetailsController.getPhotographerEquipments",

  /**PhotographerCategories */
  "post /savephotographercategory": "PhotographerCategoriesController.savephotographerCategory",
  "get /getcategoriesListById": "PhotographerCategoriesController.getcategoriesListById",
  "put /verifycategory": "PhotographerCategoriesController.verifycategory",
  "get /getPhotographerCategory": "PhotographerCategoriesController.getPhotographerCategory",

  /**PhotographerAvailability */
  "post /saveavailability": "PhotographerAvailabilityController.savephotographeravailability",
  "get /getavailabilityListById": "PhotographerAvailabilityController.getavailabilityListById",
};


