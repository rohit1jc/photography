/**
 * SubscriptionPlanController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var constantObj = sails.config.constants;
const db = sails.getDatastore().manager;
const sharp = require("sharp");
const fs = require("fs");
const { count } = require("console");
const { exit } = require("process");
const ObjectId = require('mongodb').ObjectID;
generateName = function () {
  // action are perform to generate random name for every file
  var uuid = require("uuid");
  var randomStr = uuid.v4();
  var date = new Date();
  var currentDate = date.valueOf();

  retVal = randomStr + currentDate;
  return retVal;
};

module.exports = {
  /**
   *
   * @reqBody  : {*}
   * @param {*} res
   * @returns
   * @description: Api Used to add subscription plan
   * @createdAt : 28/09/2021
   * @createdBy Chandra Shekhar
   */

  addPlan: async (req, res) => {
    try {
      let requiredFieldError = [];
      let requiredFileds = ["name", "category"];
      requiredFileds.forEach(function (value) {
        let data = req.body;
        if (!data.hasOwnProperty(value)) {
          REQ_NAME = value.charAt(0).toUpperCase() + value.slice(1);
          requiredFieldError.push(REQ_NAME + " is required");
        }
      });

      if (requiredFieldError.length != 0) {
        return res.status(404).json({
          success: false,
          error: { code: 404, message: requiredFieldError },
        });
      }

      var searchplan = req.body.name.toLowerCase();

      let checkplan = await SubscriptionPlan.findOne({
        name: searchplan,
        isDeleted: false,
      });

      if (checkplan) {
        return res.status(400).json({
          success: false,
          error: { code: 400, message: constantObj.plan.ALREADY_EXIST },
        });
      } else {
        req.body.name = req.body.name.toLowerCase();
        let planData = req.body;
        let createdPlan = await SubscriptionPlan.create(planData).fetch();

        if (createdPlan) {
          return res.status(200).json({
            success: true,
            message: constantObj.plan.UPLOAD_SUCCESS,
            data: createdPlan,
          });
        } else {
          return res.status(404).json({
            success: false,
            message: constantObj.plan.UPLOAD_ERROR_OCCUR,
          });
        }
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { message: error },
      });
    }
  },

  /**
   *
   * @param {*} res
   * @returns
   * @description: Api Used to get subscription plan
   * @createdAt : 28/09/2021
   * @createdBy Chandra Shekhar
   * @changedBy Vibhay
   */

  getplans: (req, res) => {
    try {
      let search = req.param('search');
      const page = req.param('page') || 1;
      const count = req.param('count') || 10;
      const skipNo = (page - 1) * count;
      const filterQ = [];
      const innerORQuery = [];
      const query = {};
      // filterQ.push({ isDeleted: false });
      // filterQ.push({ status: 'active' });

      req.param('isDeleted') && filterQ.push({ isDeleted: req.param('isDeleted').toLowerCase() == 'true' ? true : false });
      req.param('categoryId') && filterQ.push({ categoryId: ObjectId(req.param('categoryId')) });

      if (search) {
          search = search.replace(/[?]/g, '  ');
          innerORQuery.push({ name: { $regex: search, '$options': 'i' } });
          filterQ.push({ $or: innerORQuery });
      }

      if (filterQ.length > 0) {
          query.$and = filterQ;
      }
      // console.log(JSON.stringify(query));
      db.collection("subscriptionplan")
        .aggregate([
          {
            $lookup: {
              from: "category",
              localField: "category",
              foreignField: "_id",
              as: "categoryDetails",
            },
          },
          {
            $unwind: {
              path: "$categoryDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              id: "$_id",
              name: "$name",
              category: "$categoryDetails.name",
              categoryId: "$categoryDetails._id",
              price: "$price",
              description: "$description",
              totalHours: "$totalHours",
              editingPhotos: "$editingPhotos",
              status: "$status",            
              createdAt: "$createdAt",
              deletedBy: "$deletedBy",
              addedBy: "$addedBy",
              updatedBy: "$updatedBy",
              isDeleted: "$isDeleted",
              deletedAt: "$deletedAt",
              updatedAt: "$updatedAt",
            },
          },
          {
            $match: query,
          },
        ])
        .toArray((err, totalResult) => {
          db.collection("subscriptionplan")
            .aggregate([
              {
                $lookup: {
                  from: "category",
                  localField: "category",
                  foreignField: "_id",
                  as: "categoryDetails",
                },
              },
              {
                $unwind: {
                  path: "$categoryDetails",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  id: "$_id",
                  name: "$name",
                  category: "$categoryDetails.name",
                  categoryId: "$categoryDetails._id",
                  price: "$price",
                  description: "$description",
                  totalHours: "$totalHours",
                  editingPhotos: "$editingPhotos",
                  status: "$status",            
                  createdAt: "$createdAt",
                  deletedBy: "$deletedBy",
                  addedBy: "$addedBy",
                  updatedBy: "$updatedBy",
                  isDeleted: "$isDeleted",
                  deletedAt: "$deletedAt",
                  updatedAt: "$updatedAt",
                },
              },
              {
                $match: query,
              },
              { $sort: { createdAt:-1  } },
              {
                $skip: skipNo,
              },
              {
                $limit: Number(count),
              },
            ])
            .toArray((err, result) => {
              if (err) {
                return res.status(400).json({
                  success: false,
                  error: { message: "" + err },
                });
              } else {
                return res.status(200).json({
                  success: true,
                  // message: constantObj.plan.GET_DATA,
                  data: result?result:[],
                  total: totalResult?totalResult.length:0,
                });
              }
            });
        });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { message: error },
      });
    }
  },

  /**
   *
   * @param {id} req
   * @param {*} res
   * @returns
   * @description: Api Used to get single plan by ID
   * @createdAt : 28/09/2021
   * @createdBy Chandra Shekhar
   */

  getSinglePlan: async (req, res) => {
    try {
      let findPlanID = req.param("id");
      if (findPlanID == null) {
        return res.status(404).json({
          success: false,
          message: constantObj.plan.ID_REQUIRED,
        });
      } else {
        var planData = await SubscriptionPlan.findOne({
          id: findPlanID,
        }).populate("category");

        // console.log(planData);

        if (planData) {
          return res.status(200).json({
            success: true,
            message: constantObj.plan.GET_DATA,
            data: planData,
          });
        } else {
          return res.status(404).json({
            success: false,
            message: constantObj.plan.NO_RESULT,
          });
        }
      }
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { message: error },
      });
    }
  },

  /**
   *
   * @param {id} req
   * @param {*} res
   * @returns
   * @description: Api Used to update subscription plan data by ID
   * @createdAt : 28/09/2021
   * @createdBy Chandra Shekhar
   */

  updateSinglePlan: async (req, res) => {
    try {
      // let planId = req.param("id");
      let FormplanData = req.body;
      if (!FormplanData.id || FormplanData.id == undefined) {
        return res.status(400).json({
          success: false,
          error: { message: constantObj.plan.ID_REQUIRED },
        });
      }
      const planId = FormplanData.id;
      delete FormplanData.id;
      var updatedplanData = await SubscriptionPlan.updateOne({
        id: planId,
      }).set(FormplanData);

      return res.status(200).json({
        success: true,
        message: constantObj.plan.UPDATED_PLAN,
        // data: updatedplanData,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { message: error },
      });
    }
  },

  /**
   *
   * @param {id} req
   * @param {*} res
   * @returns
   * @description: Api Used to update subscription plan data by ID
   * @createdAt : 07/10/2021
   * @createdBy Vibhay
   */

  deletePlan: async (req, res) => {
    try {
      let planId = req.param("id");
      if (!planId || planId == undefined) {
        return res.status(400).json({
          success: false,
          error: { message: constantObj.plan.ID_REQUIRED },
        });
      }
      var updatedplanData = await SubscriptionPlan.updateOne({
        id: planId,
      }).set({isDeleted:true});

      return res.status(200).json({
        success: true,
        message: constantObj.plan.PLAN_DELETED,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { message: error },
      });
    }
  },

  /**
   * 
   * @param {*} req plan id
   * @param {*} res 
   * @returns Subscription feature data
   * @description To get feature and description of feature details by plan id
   * @author Vibhay
   * @date 29/09/2021
   */

  getPlanFeatureById: async (req, res) => {
    try {
      const planId = req.param('id');
      if (!planId || planId == undefined) {
        return res.status(400).json({
          success: false,
          error: { message: constantObj.plan.ID_REQUIRED },
        });
      }
      const response = await SubscriptionPlan.findOne({ where: { id: planId }, select: ['featured', 'featuredDescription'] });
      return res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { message: error.toString() },
      });
    }
  },

  /**
   *
   * @param {id} req
   * @param {*} res
   * @returns
   * @description: Api Used to update subscription plan features by ID
   * @createdAt : 28/09/2021
   * @createdBy Chandra Shekhar
   */

  updatefeaturedPlan: async (req, res) => {
    try {
      // let planId = req.param("id");
      let FormplanData = req.body;
      if (!FormplanData.id || FormplanData.id == undefined) {
        return res.status(400).json({
          success: false,
          error: { message: constantObj.plan.ID_REQUIRED },
        });
      }
      if (!FormplanData.featuredDescription || FormplanData.featuredDescription == undefined || FormplanData.featuredDescription.length == 0) {
        return res.status(400).json({
          success: false,
          error: { message: constantObj.plan.FEATURE_DESC },
        });
      }
      const response = await SubscriptionPlan.updateOne({ id: FormplanData.id }).set({
        featured: 'Yes',
        featuredDescription: FormplanData.featuredDescription
      })

      if (response)
        return res.status(200).json({
          success: true,
          message: constantObj.plan.UPDATED_FEATURES,
        });
      else {
        return res.status(404).json({
          success: false,
          error: { message: "Sorry for inconvenience, We can't proceed your request due to internal issue, Please try after some time" },
        });
      }

      // let featuredDescriptionArray = checkplan.featuredDescription;
      // let featuredData = req.body.featuredDescription.split(",");
      // featuredDescriptionArray.forEach((element) => {
      //     if (featuredData.indexOf(element) === -1) {
      //     featuredDescriptionArray.push(element);
      //     } else{

      // }
      // });
      // var updatedplanData = await SubscriptionPlan.updateOne({
      //   id: planId,
      // }).set({ featuredDescription: featuredDescriptionArray });
      // return res.status(200).json({
      //     success: true,
      //     message: constantObj.plan.UPDATED_PLAN,
      //     data: updatedplanData,
      // });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: { message: error },
      });
    }
  },
};

