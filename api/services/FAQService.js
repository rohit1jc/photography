/**
  * @DESC:  In this class/files FAQ related functions (add, update, delete)
  * @Request param: Authorization and form data values
  * @Return : Success message with required data
  * @Author: JCsoftware Solution Pvt. Ltd.
*/

var Promise = require('bluebird'),
    promisify = Promise.promisify;
var constantObj = sails.config.constants;
var ObjectID = require('mongodb').ObjectID;


module.exports = {

    // Used to save FAQ
    saveFAQ: (data, context,req,res)=> {
      // console.log("In Save Faq");
        if ((!data.question) || typeof data.question == undefined) {
            return res.status(404).json({ 'success': false, 'code': 404, 'message': constantObj.faq.QUESTION_REQUIRED  });
        }

        let query = {}
        query.isDeleted = false;
        query.question = data.question;
        data.addedBy = context.identity.id
          FAQ.findOne(query).then((typeExist)=> {
            if (typeExist) {
                return res.status(404).json({ success: false, error: { code: 404, message: constantObj.faq.FAQ_ALREADY_EXIST} });
            } else {
                 FAQ.create(data).then( (savedFAQ)=> {
                    return res.status(200).json({
                        success: true,
                        code: 200,
                        message: constantObj.faq.FAQ_SAVED
                    });
                });
            }
        });
    },

    // Used to update FAQ
    updateFAQ:  (data, context, req, res)=> {
        //console.log("In FAQ Update")
        let query = {};
        query.id = data.id
        query.isDeleted = false;
        data.updatedBy = context.identity.id

         FAQ.findOne(query).then( (userExist)=> {
            if (userExist) {
                 FAQ.update(data.id, data).then((updatedFAQ)=> {
                    return res.json({
                        success: true,
                        code: 200,
                        message: constantObj.faq.FAQ_UPDATE
                    });
                });
            } else {
                return res.status(400).json({ success: false, code: 400, message: constantObj.faq.ISSUE_IN_UPDATE  });
            }
        });
    },



}; // End Delete service class
