/**
 * AccessoriesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const constantObj = sails.config.constants;
const db = sails.getDatastore().manager;
module.exports = {

  /**
         * 
         * @param {name} req 
         * @param {*} res 
         * @returns message
         * @description To add new camera
         * @author Vibhay
         * @date 25/10/2021
         */
  addAccessories: async (req, res) => {
    try {
      const data = req.body;
      if (!data.name || typeof data.name == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.camera.NAME },
        });
      }
      if (!data.type || typeof data.type == undefined) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: constantObj.camera.ACCESSORIES_TYPE },
        });
      }
      data.name = data.name.toLowerCase();
      const existAccessories = await Accessories.find({ name: data.name, isDeleted: false }).limit(1);
      if (existAccessories && existAccessories.length > 0)
        return res.status(404).json({ success: false, error: { code: 400, message: constantObj.camera.EXIST } });
      data.addedBy = req.identity.id;
      const response = await Accessories.create(data).fetch();
      if (response)
        return res.status(200).json({ success: true, message: constantObj.camera.ACCESSORIES_ADDED,data: response});
      else return res.status(400).json({ success: false, error: { code: 400, message: constantObj.messages.ISSUE } });
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, error: { code: 400, message: " " + err.toString() } });
    }
  },


  /**
  * 
  * @param {*} req 
  * @param {*} res 
  * @returns Accessories ,
  * @description To get Accessories and search
  * @Date 25/10/2021
  * @author Vibhay
  */

  getAccessories: async (req, res) => {
    try {
      let search = req.param('search');
      const page = req.param('page') || 1;
      const count = req.param('count') || 10;
      let sortBy = req.param('sortBy') || -1;
      let fieldName = 'createdAt';
      const skipNo = (page - 1) * count;
      const filterQ = [];
      const innerORQuery = [];
      const query = {};
      // filterQ.push({ isDeleted: false });
      if (sortBy) {
        fieldName = 'name';
        sortBy === 1 ? sortBy = 1 : sortBy = -1;
      }

      req.param('isDeleted') && filterQ.push({ isDeleted: req.param('isDeleted').toLowerCase() == 'true' ? true : false });

      req.param('type') && filterQ.push({ type: req.param('type') });

      if (search) {
        search = search.replace(/[?]/g, '  ');
        innerORQuery.push({ name: { $regex: search, '$options': 'i' } });
        filterQ.push({ $or: innerORQuery });
      }

      if (filterQ.length > 0) {
        query.$and = filterQ;
      }

      // console.log("andQuery 3", JSON.stringify(query))

      db.collection('accessories').aggregate([{
        $lookup: {
          from: "users",
          localField: "addedBy",
          foreignField: "_id",
          as: "userDetails",
        },

      },
      { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          id: '$_id',
          name: "$name",
          type: "$type",
          isDeleted: "$isDeleted",
          createdAt: "$createdAt",
          addedBy: '$userDetails.fullName',
        }
      },
      {
        $match: query
      },
      ]).toArray((err, totalResult) => {
        db.collection('accessories').aggregate([
          {
            $lookup: {
              from: "users",
              localField: "addedBy",
              foreignField: "_id",
              as: "userDetails",
            },

          },
          { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
          {
            $project: {
              id: '$_id',
              name: "$name",
              type: "$type",
              isDeleted: "$isDeleted",
              createdAt: "$createdAt",
              addedBy: '$userDetails.fullName',
            }
          },
          {
            $match: query
          },
          { $sort: { [fieldName]: sortBy } },
          {
            $skip: skipNo
          },
          {
            $limit: Number(count)
          },
        ]).toArray((err, result) => {
          return res.status(200).json({
            "success": true,
            "data": result ? result : [],
            "total": totalResult ? totalResult.length : 0,
          });
        })
      })
    } catch (error) {
      return res.status(404).json({ success: false, error: { "code": 400, "message": " " + error } });

    }
  },

  /**
        * 
        * @param {*} req 
        * @param {*} res 
        * @returns data
        * @description To get  by Accessories by user id
        * @author Rohit Kumar
        * @date 25/11/2021
        */
   getAccessoriesById: async (req, res) => {
    try {
        var id = req.param('id');
        var sortBy = "createdAt desc";
        var AccessoriesData = await PhotographerDetails.findOne({ addedBy: id,isDeleted:false }).populate("cameraId").populate("lensId");
        if (AccessoriesData) {
            return res.status(200).json({
                success: true,
                message: constantObj.accessories.GET_DATA,
                data: AccessoriesData,
            });
        }else {
            return res.status(404).json({
              success: false,
              error: { code: 400, message: constantObj.accessories.NO_RESULT }
            });
          }
    } catch (error) {
        return res
            .status(400)
            .json({ success: false, error: { code: 400, message: " " + error.toString() } });
    }
},

};

