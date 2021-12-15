/**
 * FAQController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

 var _request = require('request');
 var ObjectId = require('mongodb').ObjectID;
 var constantObj = sails.config.constants;
 const db = sails.getDatastore().manager;

 module.exports = {
     save: function (req, res) {
         API(FAQService.saveFAQ, req, res);
     },

     update: function (req, res) {
         API(FAQService.updateFAQ, req, res);
     },

     getAllFAQs: function (req, res, next) {
        try {
            var search = req.param('search');
            var count = req.param('count');
            var page = req.param('page');
            if (page == undefined) {
              page = 1;
            }
      
            if (count == undefined) {
              count = 10;
            }
            var skipNo = (page - 1) * count;
            var isDeleted = req.param('isDeleted');

            var query = {};
            query.$and=[];
            innerORQuery = [];
            if (search) {
              query.$or = [
                { question:{$regex: search, '$options' : 'i'}},
                {  answer: {$regex: search, '$options' : 'i'}}
              ]
            }
          
            if (isDeleted) {
              if(isDeleted === 'true'){
                isDeleted = true;
               var sortBy={updatedAt: -1};
              }else{
                isDeleted = false;
                var sortBy={createdAt: -1};
              }
              query.$and.push({isDeleted :isDeleted});
            }else{
              var sortBy={createdAt: -1};
            }

              db.collection('faq').aggregate([
                {
                  '$lookup': {
                      'from': 'users', //other table name
                      'localField': 'deletedBy',//name of car table field
                      'foreignField': '_id',//name of cardetails table field
                      'as': 'deletedBy' //alias for cardetails table
                  }
              },{
                '$unwind': {
                    'path': '$deletedBy',
                    "preserveNullAndEmptyArrays": true
                }
            },
            {
                    $project: {
                        id:'$_id',
                        isDeleted: "$isDeleted",
                        question: "$question",
                        answer: "$answer",
                        createdAt: "$createdAt",
                        updatedAt:"$updatedAt",
                        status:"$status",
                    }
                },
                {
                  $match: query
                },
              ]).toArray((err, results) => {
                db.collection('faq').aggregate([
                  {
                    '$lookup': {
                        'from': 'users', //other table name
                        'localField': 'deletedBy',//name of car table field
                        'foreignField': '_id',//name of cardetails table field
                        'as': 'deletedBy' //alias for cardetails table
                    }
                },{
                  '$unwind': {
                      'path': '$deletedBy',
                      "preserveNullAndEmptyArrays": true
                  }
              },
              {
                      $project: {
                          id:'$_id',
                          isDeleted: "$isDeleted",
                          question: "$question",
                          answer: "$answer",
                          createdAt: "$createdAt",
                          updatedAt:"$updatedAt",
                          status:"$status",
                      }
                  },
                  {
                    $match: query
                  },
                  { $sort: sortBy},
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
                    "data": result,
                    "total": results.length,
                  });

                })  
              })
        } catch (error) {
        return res.status(400).json({ success: false, error: {"code": 400, "message":" "+error} });
        }
    },

     getSingleFAQ: (req,res)=>{
         var id = req.param('id')
         if(!id || id == undefined){
             return res.status(404).json({
                 success:false,
                 "error": {code:404, message: "ID required"}
             })
         }else{
             FAQ.findOne({id:id}).then(faq=>{
                 return res.json({
                     success:true,
                     code:200,
                     data:faq
                 })
             });
         }
     }



 };
