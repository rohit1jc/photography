/**
 * @DESC:  In this class/files Blogs related functions (save, update, add comment)
 * @Request param: Authorization and form data values
 * @Return : Success message with required data
 * @Author: JCsoftware Solution Pvt. Ltd.
*/

var Promise = require('bluebird'),
  promisify = Promise.promisify;
var constantObj = sails.config.constants;
var async = require('async');

slugify = function (string) {
  return string
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

module.exports = {

  delete: function (data, context, req, res) {
    try {

  
      var modelName = req.param('model');
      if ((!modelName) || modelName == undefined) {
        return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Model Name Is Required" } });
      }
      var Model = sails.models[modelName];
      var itemId = req.param('id');
      let query = {};
      var searchQuery = {};
      searchQuery.id = itemId

      
      Model.findOne(query).where(searchQuery).exec(function (err, data) {

        if (err) {
          return res.status(200).json({
            success: false,
            error: {
              code: 400,
              message: constantObj.messages.DATABASE_ISSUE
            }
          });
        } else {
          data.isDeleted = true;
          data.deletedBy = req.identity.id;

var deleteddate = new Date();
          Model.updateOne({ id: itemId })
            .set({
              isDeleted: true,
              deletedBy: req.identity.id,
              deletedAt: deleteddate,
            })
            .then(function (userdata) {
              console.log(userdata);
              return res.status(200).json({
                success: true,
                code: 200,
                message: constantObj.messages.DELETE_RECORD,
              });
            });
        }
      })
    } catch (err) {
      console.log(err);
      return res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
    }
  },

  deleteUndo: function (data, context, req, res) {
    try {
      var modelName = req.param('model');
      if ((!modelName) || modelName == undefined) {
        return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Model Name Is Required" } });
      }
      var Model = sails.models[modelName];
      var itemId = req.param('id');
      let query = {};
      var searchQuery = {};
      searchQuery.id = itemId
      Model.find(query).where(searchQuery).exec(function (err, data) {
        if (err) {
          return res.status(200).json({
            success: false,
            error: {
              code: 400,
              message: constantObj.messages.DATABASE_ISSUE
            }
          });
        } else {
          Model.updateOne({ id: itemId }).set({ isDeleted: false, deletedBy: null }).then(function (vacancie) {
            return res.status(200).json({
              success: true,
              code: 200,
              message: constantObj.messages.DELETE_RECORD_RCOVERD,
            });
          });
        }
      })
    } catch (err) {
      console.log(err);
      return res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
    }
  },

  permanentDeleteCategoryType:async function (data, context, req, res) {
    try {
      // console.log("In permanent Delete Category Type");
      var itemId = req.param('id');

      var categoryQuery = {};
      categoryQuery.type =  itemId;
      // categoryQuery.isDeleted  =  true;
      Category.find(categoryQuery).exec(async function (err, categorydata) {
        // console.log(categorydata,'categorydata==');
        if (categorydata.length != 0) {
          return res.status(400).json({
            success: false,
            code:400,
            message: "This CategoryType is used in Category and Blog"
          });
        } else {
            await CategoryType.destroyOne({_id:itemId});
            await Category.destroy({type:itemId});
            await Blogs.destroy({categoryID:itemId});

            res.header("Access-Control-Allow-Origin", "*");
              return res.status(200).json({
                success: true,
                code: 200,
                message: constantObj.messages.DELETE_RECORD,
              });
        }
      })

      } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
      }
   },


   permanentDeleteCategory:async function (data, context, req, res) {
    try {
      // console.log("In permanentDeleteCategory");
        var itemId = req.param('id');
        var blogQuery = {};
        blogQuery.categoryID =  itemId;
        // blogQuery.isDeleted  =  true;
        Blogs.find(blogQuery).exec(async function (err, blogdata) {
          // console.log(blogdata,'blogdata==');
          if (blogdata.length != 0) {
            return res.status(400).json({
              success: false,
              code:400,
              message: "This Category is used in blog"
            });

          } else {
            await Category.destroy({id:itemId});
            await Blogs.destroy({categoryID:itemId});

            res.header("Access-Control-Allow-Origin", "*");
            return res.status(200).json({
              success: true,
              code: 200,
              message: constantObj.messages.DELETE_RECORD,
            });
          }
        })
        }catch (err) {
          console.log(err);
          return res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
        }
   },

  permanentDeleteModel: function (data, context, req, res) {
    try {
      // console.log("In permanent Delete Model");
      var modelName = req.param('model');
      var Model = sails.models[modelName];
      var itemId = req.param('id');
      let query = {};
      var searchQuery = {};
      searchQuery.id = itemId
      Model.find(query).where(searchQuery).exec(function (err, data) {
        if (err) {
          return res.status(200).json({
            success: false,
            error: {
              code: 400,
              message: constantObj.messages.DATABASE_ISSUE
            }
          });
        } else {
          Model.destroy({ id: itemId }).then(function (vacancie) {
            return res.status(200).json({
              success: true,
              code: 200,
              message: constantObj.messages.DELETE_RECORD,
            });
          });
        }
      })
    } catch (err) {
      console.log(err);
      return res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
    }
  },


  // Used to save Common Data
  saveRecord: function (data, context, req, res) {
    try {
      // console.log("In Save Record");
      var modelName = data.model;
      if ((!modelName) || modelName == undefined) {
         res.status(404).json({ "success": false, "error": { "code": 404, "message": "Model Name Is Required" } });
      }
      var Model = sails.models[modelName];
      data.addedBy = context.identity.id
      
      var query={};
      
      if( data.model == "expensetemplates"){
        query.countryFor=data.countryFor;
      }

      if( data.model == "contracttemplates"){
        if ((!data.headline) || data.headline == undefined) {
           res.status(404).json({ "success": false, "error": { "code": 404, "message": "Headline Is Required" } });
        }
        query.headline=data.headline;  
      }else{
        query.name=data.name;
      }
      
      query.addedBy=context.identity.id;
      Model.findOne(query).then(dataCKh=>{
      if(dataCKh){
           res.status(404).json({ "success": false, "error": { "code": 404, "message": constantObj.messages.SAME_RECORD } });
        }else{
          delete data.model;
            Model.create(data).then(function (vacancie) {
               res.status(200).json({
                success: true,
                code: 200,
                message: constantObj.messages.ADD_RECORD,
              });
            });
        }
      });
    } catch (err) {
      console.log(err);
       res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
    }
  },

    // Used to update blog
    updateRecord: function (data, context, req, res) {
    try{
      var modelName = data.model;
      if ((!modelName) || modelName == undefined) {
         res.status(404).json({ "success": false, "error": { "code": 404, "message": "Model Name Is Required" } });
      }

      var id = data.id;
      if ((!id) || id == undefined) {
         res.status(404).json({ "success": false, "error": { "code": 404, "message": constantObj.messages.ID_REQUIRED } });
      }
      var Model = sails.models[modelName];
      data.updatedBy = context.identity.id
      Model.update({ id: id }, data).then(function (blog) {
         res.status(200).json({
          success: true,
          code: 200,
          data: blog,
          message: constantObj.messages.UPDATE_RECORD,
        });
      });
    } catch (err) {
      console.log(err);
       res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
    }
    },

    // Used to update blog
    getSingleRecord: function (data, context, req, res) {
      try{
        var modelName = data.model;
        if ((!modelName) || modelName == undefined) {
           res.status(404).json({ "success": false, "error": { "code": 404, "message": "Model Name Is Required" } });
        }
  
        var id = data.id;
        if ((!id) || id == undefined) {
           res.status(404).json({ "success": false, "error": { "code": 404, "message": constantObj.messages.ID_REQUIRED } });
        }
        var Model = sails.models[modelName];
        data.updatedBy = context.identity.id

        Model.findOne({id:id}).exec((err , blog)=>{
           res.status(200).json({
            success: true,
            code: 200,
            data: blog,
          });
        });
      } catch (err) {
        console.log(err);
         res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
      }
      },

};
