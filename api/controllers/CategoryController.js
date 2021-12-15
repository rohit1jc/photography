 /**
 * CategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var _request = require('request');
var ObjectId = require('mongodb').ObjectID;
var constantObj = sails.config.constants;

module.exports = {
    save:(req, res)=> {
        API(CategoryService.saveCategory, req, res);
    },

    update:(req, res)=> {
        API(CategoryService.updateCategory, req, res);
    },


    /**
       * 
       * @param {*} req categoryId(required)
       * @param {*} res 
       * @returns category details
       * @description To get all categories
       * @Date 29/09/2021
       * @author Vibhay
       */

     getCategories: async (req, res) => {
      try {
          const response = await Category.find({status:'active',isDeleted:false,cat_type:'services'}).sort('name ASC');;
          if (response) return res.status(200).json({
            "success": true,                      
            "data": response
        });
          else return res.status(404).json({
            "success": false,
            "error":{"message": "No category found" }                 
         });

      } catch (error) {
          return res.status(404).json({
            "success": false,
            "error":{"message": error.toString()}                 
         });
      }

  },

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @description: Used to get list of categories using filters
     * @createdAt 03/09/2021
     * @createdBy : Himanshu Gupta
     */
    getAllCategory:(req, res, next)=> {
    
        var search = req.param('search');
        var sortBy = req.param('sortBy');
        var page = req.param('page');
        if(page == undefined){  page = 1; }       
        var count = req.param('count');
        if(count == undefined){ count = 10;}
        var skipNo = (page - 1) * count;
        var status = req.param('status');
        var type = req.param('type')
        var cat_type = req.param('cat_type')
        var isDeleted = req.param('isDeleted')
        var query = {};

        if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }
        var searchQuery={};
        if(status){
          searchQuery.status = "active";
        }
        if(isDeleted){      
          if(isDeleted.toString().toLowerCase()==='true') {
            query.isDeleted = true;
            searchQuery.isDeleted = true;
          }  else{          
           query.isDeleted = false;
           searchQuery.isDeleted = false;
        }
      }
        
        if(search){
          searchQuery.name={
            'like': '%' + search.toLowerCase() + '%'
          }
        }
        if(type === 'parent_categories'){
           searchQuery.parentCategory = null
        }else if(type === 'sub_categories'){
           searchQuery.parentCategory = {"!=": null}
        }
        if(cat_type){
           searchQuery.cat_type = cat_type
        }

       Category.count(query).where(searchQuery).exec( (err, total)=> {
           if(err){
               return res.status(400).json({
                 "success": false,
                 "error": {"message": ""+err} 
               });
           } else {
         Category.find(query).where(searchQuery).populate('parentCategory').sort(sortBy).skip(skipNo).limit(count).exec( (err, category)=> {
             if (err) {
               return res.status(400).json({
                   "success": false,
                   "error": {"message": ""+err} 
                 });
             } else {
                 return res.json({
                     "success": true,                      
                     "data": category,
                     "total": total
                 });
             }
        })
       }
     })
    },
    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @description: Used to get detail of category or subcategory
     * @createdAt 03/09/2021
     * @createdBy : Himanshu Gupta
     */
    getSingleCategory: (req, res) => {
        var id = req.param('id')
        if (!id || id == undefined) {
            return res.status(404).json({
               "success": false,
               "error":{"message": constantObj.category.ID_REQUIRED }                 
            })
        } else {
            Category.findOne({ id: id }).populate('parentCategory').then(category => {
                return res.status(200).json({
                    "success": true,                  
                    "data": category
                })
            });
        }
    },

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @description: Used to get listing of all Main categories
     * @createdAt 03/09/2021
     * @createdBy : Himanshu Gupta
     */
    getAllMainCategories: function (req, res, next) {

        var search = req.param('search');
        var sortBy = req.param('sortBy');
        var page = req.param('page');
        var type = req.param('type');
        var count = req.param('count');

        if(page == undefined){  page = 1; }
        if(count == undefined){ count = 10;}      
        var skipNo = (page - 1) * count;
        // var status = req.param('status');
        var query = {};

        if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }
        if (type) { query.type = type}


        // if (!status) { query.status = 'active' }

     

        query.isDeleted = false;
        query.parentCategory = null
      

        var searchQuery={};
        if(search){
          searchQuery.name={
            'like': '%' + search.toLowerCase() + '%'
          }
        }
        if (status) {
           query.status = status;
           searchQuery.status=status
         }
       console.log(query)
     Category.count(query).exec(function (err, total) {
       if (err) {
         return res.status(400).json({
           "success": false,
           "error": {"message":""+err}
         });
       } else {
       Category.find(query).sort(sortBy).exec(function (err, category) {
           if (err) {
               return res.status(400).json({
                   "success": false,
                   "error": {"message":""+err}
               });
           } else {
               return res.status(200).json({
                   "success": true,               
                   "data":  category,
                   "total": total
               });
           }
        })
       }
     })
    },

    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @description: Used to get listing of all Sub categories of a main category
     * @createdAt 03/09/2021
     * @createdBy : Himanshu Gupta
     */
    getAllSubCategory:(req, res, next)=> {

        var search = req.param('search');
        var sortBy = req.param('sortBy');
        var page = req.param('page');      
        var count = req.param('count');
        var skipNo = (page - 1) * count;
        var categoryId = req.param('categoryId');
        var status = req.param('status');
        var isDeleted = req.param('isDeleted')
        var query = {};

        if (sortBy) {
            sortBy = sortBy.toString();
        } else {
            sortBy = 'createdAt desc';
        }
        if (type) {
            query.type = type
        }
        query.parentCategory = {'!=': null}
        if (categoryId) {
            query.parentCategory = categoryId
            
        }
        if(isDeleted){
           searchQuery.isDeleted = true;
           query.isDeleted = true;
        }else{
           searchQuery.isDeleted = false;
           query.isDeleted = false;
        }
        
        var searchQuery={};
         if(search){
           searchQuery.name={
             'like': '%' + search.toLowerCase() + '%'
           }
         }
         if (status) {
           query.status = status;
           searchQuery.status=status
         }else{
           query.status = "active";
           searchQuery.status=  "active";
         }

         console.log("query",query)
         Category.find(query).where(searchQuery).populate('parentCategory').sort(sortBy).skip(skipNo).limit(count).exec(function (err, category) {
             if (err) {
                 return res.status(400).json({
                     success: false,
                     error: err
                 });
             } else {
                 return res.json({
                   "success": true,
                   "data": category,
                   "total": category.length
                 });
             }
        })
    },



   



};
