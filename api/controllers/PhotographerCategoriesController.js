
/**
 * PhotographerCategoriesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
 const constantObj = sails.config.constants;
 const db = sails.getDatastore().manager;
 const ObjectId = require('mongodb').ObjectID;
 module.exports = {
    /**
     * 
     * @param {*} data 
     * @param {*} context 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     * @description Used to save the Photographercategory
     * @createdAt 01/12/2021
     * @createdBy : Rohit kumar
     */
     savephotographerCategory: (req, res) => {
        const data = req.body;
        let query = {}
        query.isDeleted = false;
        query.categoryId = data.categoryId
        query.addedBy = req.identity.id;
        data.addedBy = req.identity.id;
        PhotographerCategories.findOne(query).then((typeExist) => {
            if (typeExist) {
                res.status(404).json({ "success": false, "error": {code: 400, "message": constantObj.category.CATEGORY_ALREADY_EXIST } });
            } else {
                data.isVerified = "pending";
                PhotographerCategories.create(data).then((savedCategory) => {
                    res.status(200).json({
                        "success": true,
                        "message": constantObj.category.CATEGORY_SAVED
                    });
                });
            }
        });
    },

    /**
    * 
    * @param {*} req 
    * @param {*} res 
    * @returns data
    * @description To get list of photographer categories by photographerID
    * @author Rohit Kumar
    * @date 01/12/2021
    */
     getcategoriesListById: async (req, res) => {
        try {
            let search = req.param('search');
            const page = req.param('page') || 1;
            const count = req.param('count') || 10;
            const skipNo = (page - 1) * count;

            var addedBy= req.identity.id;
            var PhotographerCategoriesData = await PhotographerCategories.find({ addedBy: addedBy,isDeleted:false }).populate("categoryId").populate("photographerId").skip(skipNo).limit(count);
            if (PhotographerCategoriesData) {
                return res.status(200).json({
                    success: true,
                    message: constantObj.category.GET_DATA,
                    data: PhotographerCategoriesData,
                });
            }else {
                return res.status(404).json({
                  success: false,
                  error: { code: 400, message: constantObj.messages.NOT_FOUND }
                });
              }
        } catch (error) {
            return res
                .status(400)
                .json({ success: false, error: { code: 400, message: " " + error.toString() } });
        }
    },
    /**
    * 
    * @param {*} req 
    * @param {*} res 
    * @returns data
    * @description To get list for admin of photographer categories by photographerID
    * @author Rohit Kumar
    * @date 01/12/2021
    */
     getPhotographerCategory: async (req, res) => {
        // try {
        //     let search = req.param('search');
        //     let id = req.param('id');
        //     const page = req.param('page') || 1;
        //     const count = req.param('count') || 10;
        //     const skipNo = (page - 1) * count;

        //     var PhotographerCategoriesData = await PhotographerCategories.find({ addedBy: id,isDeleted:false }).populate("categoryId").populate("photographerId").skip(skipNo).limit(count);
        //     if (PhotographerCategoriesData) {
        //         return res.status(200).json({
        //             success: true,
        //             message: constantObj.category.GET_DATA,
        //             data: PhotographerCategoriesData,
        //         });
        //     }else {
        //         return res.status(404).json({
        //           success: false,
        //           error: { code: 400, message: constantObj.messages.NOT_FOUND }
        //         });
        //       }
        // }
        try {
          let search = req.param('search');
          let id = req.param('id');
          const page = req.param('page') || 1;
          const count = req.param('count') || 10;
          const skipNo = (page - 1) * count;
          PhotographerCategories.count({ addedBy: id,isDeleted:false }).exec(async function (err, total) {
            if (err) {
              return res.status(400).json({
                "success": false,
                "error": {"message":""+err}
              });
            } else {
              var PhotographerCategoriesData = await PhotographerCategories.find({ addedBy: id,isDeleted:false }).populate("categoryId").populate("photographerId").skip(skipNo).limit(count);
                if (PhotographerCategoriesData) {
                    return res.status(200).json({
                        success: true,
                        message: constantObj.category.GET_DATA,
                        data: PhotographerCategoriesData,
                        total:total
                    });
                }else {
                    return res.status(404).json({
                      success: false,
                      error: { code: 400, message: constantObj.messages.NOT_FOUND }
                    });
                }
               
            }
          })
        }
         catch (error) {
            return res
                .status(400)
                .json({ success: false, error: { code: 400, message: " " + error.toString() } });
        }
    },

    /**
 * 
 * @param {*} req id for update
 * @param {*} res 
 * @returns photographercategory verified,
 * @description To verify photogrphercategory by admin
 * @Date 10/12/2021
 * @author Rohir Kumar
 */
  verifycategory: async (req, res) => {
    try {
      if (req.identity.role !== 'admin') {
        return res.status(400).json({ success: false, error: { code: 400, message: constantObj.messages.NOT_AUTHORIZE } });
      }
      const data = { id: req.body.id,isVerified: req.body.isVerified };
      if (!data.id || data.id == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.ID_REQUIRED },
        });
      }
      if (!data.isVerified || data.isVerified == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: "Verified status required." },
        });
      }
      const id = data.id;
      delete data.id;
      if (data.isVerified === 'accepted') {
        data.isVerified = 'accepted';
      } else if (data.isVerified === 'rejected') {
        data.isVerified = 'rejected';
      } else {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: "isVerified must be either accepted or rejected." },
        });
      }
      data.verifiedBy = req.identity.id;
      data.updatedAt = new Date();
      const response = await PhotographerCategories.updateOne({ id: id }, data);
      if (response)
        return res.status(200).json({ success: true, message: constantObj.photography.VERIFIED });
      else return res.status(400).json({ success: false, error: { code: 400, message: constantObj.messages.NOT_FOUND } });
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: " " + err.toString() } });
    }

  },
}