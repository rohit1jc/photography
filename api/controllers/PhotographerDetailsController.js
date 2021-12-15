
/**
 * PhotographerDetailsController
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
* @param {*} req id for update
* @param {*} res 
* @returns photography details,
* @description To create or update photography
* @Date 25/10/2021
* @author Vibhay
*/
  addPhotography: async (req, res) => {
    try {
      const data = req.body;
      const addedBy = req.identity.id;
      const pendingRequest = await PhotographerDetails.findOne({ addedBy: addedBy, isVerified: "pending" });
      if (pendingRequest) {
        return res.status(400).json({ success: false, error: { code: 400, message: constantObj.photography.PENDING } });
      }
      const existPhotography = await PhotographerDetails.findOne({ addedBy: addedBy });
      if (existPhotography) {
        // const id = data.id;
        delete data.id;

        const response = await PhotographerDetails.updateOne({ addedBy: addedBy }, data);
        if (response)
          return res.status(200).json({ success: true, message: constantObj.camera.ACCESSORIES_ADDED, data: response });
        else return res.status(400).json({ success: false, error: { code: 400, message: constantObj.messages.ISSUE } });
      } else {
        if (!data.cameraId || typeof data.cameraId == undefined) {
          return res.status(404).json({
            success: false,
            error: { code: 404, message: constantObj.camera.ID_REQUIRED },
          });
        }
        if (!data.lensId || typeof data.lensId == undefined) {
          return res.status(404).json({
            success: false,
            error: { code: 404, message: constantObj.lens.ID_REQUIRED },
          });
        }

        data.addedBy = req.identity.id;
        delete data.id;
        const response = await PhotographerDetails.create(data).fetch();
        if (response)
          return res.status(200).json({ success: true, data: response, message: constantObj.camera.ACCESSORIES_ADDED });
        else return res.status(400).json({ success: false, error: { code: 400, message: constantObj.messages.ISSUE } });
      }

    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: " " + err.toString() } });
    }

  },

  /**
 * 
 * @param {*} req id for update
 * @param {*} res 
 * @returns photographer verified,
 * @description To verify photogrpher by admin
 * @Date 28/10/2021
 * @author Vibhay
 */
  verifyPhotographer: async (req, res) => {
    try {
      if (req.identity.role !== 'admin') {
        return res.status(400).json({ success: false, error: { code: 400, message: constantObj.messages.NOT_AUTHORIZE } });
      }
      const data = { id: req.param('id'),isVerified: req.param('isVerified') };
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
      const response = await PhotographerDetails.updateOne({ id: id }, data);
      if (response)
        return res.status(200).json({ success: true, message: constantObj.photography.VERIFIED });
      else return res.status(400).json({ success: false, error: { code: 400, message: constantObj.messages.NOT_FOUND } });
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: " " + err.toString() } });
    }

  },


  /**
 * 
 * @param {*} req id for get details
 * @returns photography details ,
 * @description To get single photography details
 * @Date 26/10/2021
 * @author Vibhay
 */
  getPhotography: async (req, res) => {
    try {
      const data = { id: req.param('id') };
      if (!data.id || typeof data.id == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.user.ID_REQUIRED },
        });
      }
      const response = await PhotographerDetails.findOne({ id: data.id }).populate("cameraId").populate('lensId').populate('categoryId').populate('addedBy');
      if (response) {
        const filterUserDetails = (({ fullName, gender ,id}) => ({ fullName, gender ,id}))(response['addedBy']);
        response.addedBy = filterUserDetails;
        return res.status(200).json({ success: true, data: response });
      }
      else return res.status(400).json({ success: false, error: { code: 400, message: constantObj.messages.NOT_FOUND } });
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: " " + err.toString() } });
    }

  },
 /**
 * 
 * @param {*} req id for get details
 * @returns photography details ,
 * @description To get single photography details
 * @Date 03/12/2021
 * @author sheetal
 */
  getPhotographerEquipments: async (req, res) => {
    try {
      let search = req.param('search');
      const id=req.param('id');
      const page = req.param('page') || 1;
      const count = req.param('count') || 10;
      console.log(page,count)
      const skipNo = (page - 1) * count;
      const filterQ = [];
      const innerORQuery = [];
      const query = {};
      filterQ.push({ isDeleted: false,addedById: ObjectId(id)});
      req.param('isVerified') && filterQ.push({ isVerified: req.param('isVerified').toLowerCase() });

      if (search) {
        search = search.replace(/[?]/g, '  ');
        innerORQuery.push({ categoryName: { $regex: search, '$options': 'i' } });
        innerORQuery.push({ addedBy: { $regex: search, '$options': 'i' } });
        filterQ.push({ $or: innerORQuery });
      }

      if (filterQ.length > 0) {
        query.$and = filterQ;
      }
      console.log(JSON.stringify(query));
      db.collection('photographerdetails').aggregate([
        {
        $lookup: {
          from: "users",
          localField: "addedBy",
          foreignField: "_id",
          as: "userDetails",
        },

      },
      { $unwind: { path: "$userDetails"} },
      {
        $lookup: {
          from: "accessories",
          localField: "lensId",
          foreignField: "_id",
          as: "lensDetails",
        },

      },
      { $unwind: { path: "$lensDetails"} },
      {
        $lookup: {
          from: "accessories",
          localField: "cameraId",
          foreignField: "_id",
          as: "cameraDetails",
        },

      },
      { $unwind: { path: "$cameraDetails"} },
      {
        $project: {
          id: '$_id',
          cameraId: "$cameraId",
          lensId: "$lensId",
          isVerified: "$isVerified",
          isDeleted: "$isDeleted",
          createdAt: "$createdAt",
          
          cameraId:"$cameraDetails._id",
          cameraName:"$cameraDetails.name",
          lensId:"$lensDetails._id",
          lensName:"$lensDetails.name",
          // categoryName: "$categoriesDetails.name",
          // categoryId: "$categoriesDetails._id",
          // addedBy: "$userDetails.id",
        }
      },
      {
        $match:query
      },
      ]).toArray((err, totalResult) => {
        db.collection('photographerdetails').aggregate([
          {
          $lookup: {
            from: "users",
            localField: "addedBy",
            foreignField: "_id",
            as: "userDetails",
          },

        },
        { $unwind: { path: "$userDetails"} },
        {
          $lookup: {
            from: "accessories",
            localField: "lensId",
            foreignField: "_id",
            as: "lensDetails",
          },

        },
        { $unwind: { path: "$lensDetails"} },
        {
          $lookup: {
            from: "accessories",
            localField: "cameraId",
            foreignField: "_id",
            as: "cameraDetails",
          },

        },
        { $unwind: { path: "$cameraDetails"} },
        {
          $project: {
            id: '$_id',
            cameraId: "$cameraId",
            lensId: "$lensId",
            isVerified: "$isVerified",
            isDeleted: "$isDeleted",
            createdAt: "$createdAt",
            images:"$images",
            // categoryName: "$categoriesDetails.name",
            // categoryId: "$categoriesDetails._id",
            cameraId:"$cameraDetails._id",
            cameraName:"$cameraDetails.name",
            lensId:"$lensDetails._id",
            lensName:"$lensDetails.name",
            // addedBy: "$userDetails",
            addedById:"$userDetails._id",
            addedByName:"$userDetails.fullName"
          }
        },
        {
          $match: query
        },
        { $sort: { createdAt: -1 } },
        {
          $skip: skipNo
        },
        {
          $limit: Number(count)
        },
        ]).toArray((err, result) => {
          console.log(result,"result")
          return res.status(200).json({
            "success": true,
            "code": 200,
            "data": result ? result : [],
            "total": totalResult ? totalResult.length : 0,
          });
        })
      })
    } catch (error) {
      return res.status(404).json(errorMsg(error.toString()));
    }
  },
  //   /**
  // * 
  // * @param {*} req id 
  // * @returns message,
  // * @description To update preferred of photographer
  // * @Date 26/10/2021
  // * @author Vibhay
  // */
  //   preferredChange: async (req, res) => {
  //     try {
  //       const data = { id: req.param('id') };
  //       if (!data.id || typeof data.id == undefined) {
  //         return res.status(404).json({
  //           success: false,
  //           error: { code: 404, message: constantObj.user.ID_REQUIRED },
  //         });
  //       }
  //       const checkExist= await Users.findOne({id:data.id});

  //     } catch (err) {
  //       return res
  //         .status(400)
  //         .json({ success: false, error: { code: 400, message: " " + err.toString() } });
  //     }

  //   },



  /**
* 
* @param {*} req 
* @param {*} res 
* @returns photography details,
* @description To get photography details
* @Date 25/10/2021
* @author Vibhay
*/

  getAllPhotography: async (req, res) => {
    try {
      let search = req.param('search');
      const page = req.param('page') || 1;
      const count = req.param('count') || 10;
      const skipNo = (page - 1) * count;
      const filterQ = [];
      const innerORQuery = [];
      const query = {};
      filterQ.push({ isDeleted: false });
      if (req.identity.role !== 'admin') {
        filterQ.push({ addedBy: req.identity.id });
      }

      req.param('isVerified') && filterQ.push({ isVerified: req.param('isVerified').toLowerCase() });
      // req.param('projectId') && filterQ.push({ projectId: ObjectId(req.param('projectId')) });

      // req.param('id') && filterQ.push({ id: { $in: [req.param('id')] } });

      if (search) {
        search = search.replace(/[?]/g, '  ');
        innerORQuery.push({ categoryName: { $regex: search, '$options': 'i' } });
        innerORQuery.push({ addedBy: { $regex: search, '$options': 'i' } });
        filterQ.push({ $or: innerORQuery });
      }

      if (filterQ.length > 0) {
        query.$and = filterQ;
      }
      // console.log(JSON.stringify(query));
      db.collection('photographerdetails').aggregate([{
        $lookup: {
          from: "users",
          localField: "addedBy",
          foreignField: "_id",
          as: "userDetails",
        },

      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "category",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryDetails",
        },

      },
      { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: '$_id',
          cameraId: "$cameraId",
          lensId: "$lensId",
          isVerified: "$isVerified",
          isDeleted: "$isDeleted",
          createdAt: "$createdAt",
          categoryName: "$categoriesDetails.name",
          categoryId: "$categoriesDetails._id",
          addedBy: "$userDetails.fullName",
        }
      },
      {
        $match: query
      },
      ]).toArray((err, totalResult) => {
        db.collection('photographerdetails').aggregate([{
          $lookup: {
            from: "users",
            localField: "addedBy",
            foreignField: "_id",
            as: "userDetails",
          },

        },
        { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "category",
            localField: "categoryId",
            foreignField: "_id",
            as: "categoryDetails",
          },

        },
        { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            id: '$_id',
            cameraId: "$cameraId",
            lensId: "$lensId",
            isVerified: "$isVerified",
            isDeleted: "$isDeleted",
            createdAt: "$createdAt",
            categoryName: "$categoriesDetails.name",
            categoryId: "$categoriesDetails._id",
            addedBy: "$userDetails.fullName",

          }
        },
        {
          $match: query
        },
        { $sort: { createdAt: -1 } },
        {
          $skip: skipNo
        },
        {
          $limit: Number(count)
        },
        ]).toArray((err, result) => {
          return res.status(200).json({
            "success": true,
            "code": 200,
            "data": result ? result : [],
            "total": totalResult ? totalResult.length : 0,
          });
        })
      })
    } catch (error) {
      return res.status(404).json(errorMsg(error.toString()));
    }
  },

};

