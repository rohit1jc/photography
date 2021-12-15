module.exports.constants = {
  // key:{
  //     "activekey": "ace9a61712b4c64a7ede39d532c1b24269865f02a67db4cf85358958fcdad38a974a2755",
  //     "activename":"assess",
  // },

  user: {
    //Registration and Login
    USERNAME_REQUIRED: "Email is required",
    FIRSTNAME_REQUIRED: "Firstname is required",
    MOBILE_REQUIRED: "Mobile number is required.",
    LASTNAME_REQUIRED: "Lastname is required",
    PHONE_REQUIRED: "Phone number is required",
    EMAIL_REQUIRED: "Email is required",
    EMAIL_VALID: "Please enter vaild email",
    EMAIL_EXIST: "Email-Id already exists.",
    WRONG_EMAIL: "Email-Id does not exists",
    PASSWORD_REQUIRED: "Password is required",
    UNVERIFIED: "You have not verified your account. Please verify",
    USERNAME_NOT_APPROVED: "You have not approved by the admin",
    SUCCESSFULLY_REGISTERED: "Successfully Registered.Please verify your email",
    SUCCESSFULLY_LOGGEDIN: "Successfully logged in",
    WRONG_USERNAME: "Username does not exists",
    WRONG_PASSWORD: "Password is wrong!",
    CURRENT_PASSWORD: "Current Password is wrong!",
    INVALID_USER: "Invalid User. Your email does not exist to our system.",
    ALREADY_VERIFIED:
      "You have already verified your email. Please login to website.",
    ERROR_MAIL: "There is some error to send mail to your email id.",
    LINK_MAIL: "Link for reset password has been sent to your email id.",
    PASSWORD_CHANGED: "Password has been changed",
    ROLE_REQUIRED: "Role is required.",
    USERNAME_ALREADY: "Email Is Already Exists.",
    USERNAME_INACTIVE: "Your account is deactivated.",
    CONPASSWORD_REQUIRED: "Confirm Password is required",
    CURRENTPASSWORD_REQUIRED: "Current Password is required",
    CONFIRM_PASSWORD_NOTMATCH: "Confirm Password is not Match",
    ID_REQUIRED: "Id Is Required",
    UPDATED_USER: "Detail updated successfully.",
    USERNAME_VERIFIED: "User is not verified",
    USERNAME_DELETE: "This Account Is Deleted Contact To Administrator",
    EMAILORPASSWORD: "Please Check your email and Password",
    SUBSCRIBSUCCESS: "You Have Subscribed Successfully",
    subscribed_Updates: "You have already subscribed for ShakaShoots! Updates.",
    UPDATED_BUSINESS: "Business updated successfully.",
    USERNAME_ALREADY_DRIVER: "Driver Email Is Already Exists.",
    USERNAME_ALREADY_BUSINESS: "Business Email Is Already Exists.",
    SUCCESSFULLY_CLIENT: "Client added Successfully.",
    EMAIL_EXIST_BUSINESS: "Business and Driver Email-Id can not Same.",
    WRONG_USER: "User does not exists",
    ADDRESS: "Address required.",
    LATITUDE: "Please enter valid address.",
    LONGTITUDE: "Longtitude required.",
    OTP_REQUIRED:"OTP required",
    EMAIL_REQUIRED:"Email required",
    INVALID_OTP:"Please enter valid otp"
  },

  messages: {
    DATABASE_ISSUE: "There is some problem to fetch the record.",
    ISSUE: "There is some problem to add new record.",
    DELETE_RECORD: "Record deleted successfully.",
    STATUS_CHANGED: "Status has been changed successfully.",
    INVALID_STATUS: "Invalid Status",
    NOT_FOUND: "No Data Found",
    DELETE_RECORD_RCOVERD: "Record Undo successfully.",
    ADD_RECORD: "Data Added Successfully.",
    UPDATE_RECORD: "Updated Successfully.",
    STRIPE:
      "sk_test_51IHRU2BVCSlkinBB8bk0oUCxl5jMSJRPvo6uOWCWlu2pclBlYnt3Bwk0khLFa7mejeKAMB1iTOe98ahCzFMQmfCw00n9W5mSua",
    BACK_WEB_URL: "http://74.208.206.18:4030",
    // "BACK_WEB_URL": "http:///198.251.65.146:4019",
    FRONT_WEB_URL: "http://74.208.206.18:4032",
    // "STRIPE":"sk_test_51IqYnSSFp7IrswzCXNlfOd44tZCGveqbF8xmzjIcHX4Bgnhqu13SI5k9NppUXhwWjypqaCQeephVv58hSAtHNbsf00RtfEUPNQ" //Sheetal Mam Key
    SAME_RECORD: "Same Name Already Used",
    ID_REQUIRED: "Id required",
    NOT_AUTHORIZE:"You are not authorized"
  },

  category: {
    NAME_REQUIRED: "Category name required.",
    CATEGORY_ALREADY_EXIST: "Category already exist.",
    CATEGORY_SAVED: "Category saved successfully.",
    UPDATED_CATEGORY: "Category updated successfully.",
    ISSUE_IN_UPDATE: "Issue in category update.",
    ID_REQUIRED: "Category id required.",
    GET_DATA:"Category data fetch successfully",
  },

  Title: {
    NAME_REQUIRED: "Title name required.",
    TYPE_REQUIRED: "Title type required.",
    VARIETY_REQUIRED: "Variety of Title required.",
    Title_ALREADY_EXIST: "Title already exist.",
    Title_SAVED: "Title saved successfully.",
    UPDATED_Title: "Title updated successfully.",
    ISSUE_IN_UPDATE: "There is some issue with updating Title.",
    Title_DELETE: "Title deleted successfully.",
    ID_REQUIRED: "Id required",
    USERTYPE_REQUIRED: "User type is required.",
  },

  categoryType: {
    NAME_REQUIRED: "Category type name required.",
    TYPE_CATEGORY_ALREADY_EXIST: "Type of category already exist.",
    TYPE_CATEGORY_SAVED: "Type of Category saved successfully.",
    TYPE_UPDATED_CATEGORY: "Type of category updated successfully.",
    TYPE_ISSUE_IN_UPDATE: "There is some issue with updating type of category.",
    TYPE_CATEGORY_DELETE: "Type of category deleted successfully.",
  },
  feedback: {
    TYPE_UPDATED_FEEDBACK: "Feedback updated successfully.",
    TYPE_ISSUE_IN_UPDATE: "There is some issue with updating type of feedback.",
    // "TYPE_CATEGORY_DELETE": "Type of category deleted successfully."
  },

  blogs: {
    SAVED_BLOGS: "Blog saved successfully.",
    BLOG_ALREADY_EXIST: "Blog already exists.",
    DATABASE_ISSUE: "There is some problem to fetch the blog detail.",
    UPDATED_BLOG: "Blog updated successfully.",
    UPDATED_BLOG_ISSUE: "There is some issue with updating blog.",
    NOTHING_TO_UPDATE: "There is no changes to update.",
    TITLE_REQUIRED: "Blog title required.",
    DESCRIPTION_REQUIRED: "Blog description required.",
    COMMENT_REQUIRED: "comment required.",
    BLOG_ID_REQUIRED: "blog_id is required.",
  },

  Roles: {
    ROLE_ALREADY_EXIST: "Role already exists.",
    SAVED_ROLE: "Role saved successfully.",
    UPDATED_ROLE: "Role updated successfully.",
    ROLE_REQUIRED: "Role Name Is Required.",
    USERTYPE_REQUIRED: "User type is required.",
  },

  faq: {
    QUESTION_REQUIRED: "Question required.",
    ISSUE_IN_UPDATE: "There is some issue with updating faq.",
    FAQ_ALREADY_EXIST: "Faq already exist.",
    FAQ_SAVED: "Faq Saved Successfully.",
    ID_REQUIRED: "Id required",
    FAQ_UPDATE: "Faq Updated Successfully.",
  },


  twilio: {
    TWILIO_ACCOUNT_SID: "AC3632ef5d97245861c19e4b6cd40e7854",
    TWILIO_AUTH_TOKEN: "94930415756d4b374dd64711527fad4a",
  },

  plan: {
    ALREADY_EXIST: "Plan name already exist.",
    PLAN_DELETED: "Plan has been deleted successfully.",
    UPLOAD_SUCCESS: "Subscription plan saved successfully.",
    UPLOAD_ERROR_OCCUR: "There is some issue in adding subscription plan.",
    GET_DATA: "Subscription plan data fetch successfully.",
    ID_REQUIRED: "Subscription plan id required.",
    NO_RESULT: "No subscription plan found",
    UPDATED_PLAN: "Subscription features saved successfully",
    FEATURE_DESC: "Description required.",
    UPDATED_FEATURES: "Subscription features updated successfully",
  },
  booking: {
    ID_REQUIRED:"Booking id required.",
    CREATED: "Booked successfully.",
    NO_RESULT:"No booking found",
  },
  lens:{
    ID_REQUIRED:'Lens id required',
  },
  camera: {
    ID_REQUIRED:'Camera id required',
    NAME: 'Camera name required.',
    EXIST: 'This camera already exist.',
    ACCESSORIES_TYPE: 'Accessories type required.',
    ACCESSORIES_ADDED: 'Accessories added successfully.'
  },
  accessories:{
    GET_DATA:"Accessories data fetch successfully",
    NO_RESULT:"No Accessories found"
  },
  payment:{
    CARD_ID:"Card id required.",
    CARD_ADDED:"Card added successfully.",
    AMT_REQUIRED:"Payment amount required.",
    SUCCESS:"Payment successfully.",
    NO_CARD:"You have not added any card. Please add the card.",
    CARD_EXIST:"This card already exist.",
    CARD_UPDATED:"Card updated successfully.",
    CARD_UPDATION_FAIL:"You card has not been updated, due to some technical issue.",
    CARD_DELETED:"Card deleted successfully.",
    NO_TRANSACTION:"No transaction found.",
    REFUND_FAIL:"Some technical issue during the refund, Please try after some time.",
    REFUNDED:"Refunded successfully.",
    REFUND_RESTRICTED:"This can't be refund."
  },
  photography:{
    VERIFIED:'Verify successfully.',
    PENDING:"Sorry, You can't submit new request until a request pending.",
    SAME_CATEGORY:"You have already the category. Please choose another."
 
  },
  extras:{
    EXTRAS_REQUIRED:"extras required"
  },

  PhotographerAvailability:{
    ALREADY_EXIST:"Availability already added",
    AVAILABILITY_SAVED:"Availability added successfully",
    GET_DATA:"Availability data fetch successfully"
  }
};
