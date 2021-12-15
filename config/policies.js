/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/
  '*': 'isAuthorized',
  UserController: {
    'adminSignin': true,
    'register': true,
    'forgotPassword': true,
    'resetPassword': true,
    'userSignin': true,
    'subscribe': true,
    'contactus': true,
    'verifyUser': true,
    'verifyEmail': true,
    'checkEmail': true,
    'userDetails': true,
    'userAutoLogin': true,
    'searchPhotoGrapher': true,
    'verifiyOtp':true
  },

  BlogsController: {
    'getAllBlog': true,
    'getSingleBlog': true,
    'commentBlog': true,
  },
  FAQController: {
    'getAllFAQs': true,
    'getSingleFAQ': true,
  },
  ContentManagmentController: {
    'getSingleContent': true
  },
  CategoryController: {
    'getAllMainCategories': true
  },
  BookingController: {
    'booked': true,
    "getSingleBooked":true
  },
  CategoryController: {
    'getAllCategory': true
  },
  SubscriptionPlanController: {
    'getplans': true
  },
  PaymentController: {
    'payNow': true
  }

  // CommonController: {
  //   'findAllCounrty': true,
  //   'findAllState': true,
  //   'findAllCities': true,
  //   'getCurrencyList': true,
  //   'uploadImages':true,
  // },
  // feedbackController: {
  //   'feedback': true,
  //   'replyFeedback': true,
  //   'feedbacks': true,
  // },

  // '*': true,

};
