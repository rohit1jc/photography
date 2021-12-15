/**
 * Favorites Controller
 *
 * @description :: Server-side logic for managing Favorites
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const db = sails.getDatastore().manager;
const { ObjectId } = require('mongodb');

module.exports = {
    addFavourites: function (req, res) {
        API(FavouritesService.addFavourites, req, res);
    },


    Favourites: function (req, res) {
        try {
           var search = req.param('search');
            var count = req.param('count');
            var page = req.param('page');
      
            var make = req.param('make');
            var year = req.param('year');
            // var minCost = req.param('minCost');
            // var maxCost = req.param('maxCost');
            // var heightlight = req.param('heightlight');


            if (page == undefined) { page = 1; }
            if (count == undefined) { count = 10; }
            var skipNo = (page - 1) * count;
      
            var query = {};
            query.$and=[];
            innerORQuery = [];
      
            if (search) {
              innerORQuery.push({ makeName:{$regex: search, '$options' : 'i'}},)
              innerORQuery.push({ model:{$regex: search, '$options' : 'i'}},)
              innerORQuery.push({ vin:{$regex: search, '$options' : 'i'}},)
              query.$and.push({ $or: innerORQuery });
            }
            var sortBy={createdAt: -1};
            query.$and.push({addedBy :ObjectId(req.identity.id)});


            if(make){
              query.$and.push({make :ObjectId(make)});
            }
    
            if(year){
              query.$and.push({year :year});
            }
    
            // if(minCost){
            //   query.$and.push({  estimatedTotalCost: { $gte: minCost }})
            // }
    
            // if(maxCost){
            //   query.$and.push({  estimatedTotalCost: { $lte: maxCost }})
            //   // query.$and.push({  estimatedTotalCost: { $gte: Number(1),$lte: Number(2) }})
            // }
    
            // if(heightlight){
            //   if(heightlight == 'new'){
            //     var sortBy={createdAt: -1};
            //   }else{
            //     var sortBy={updatedAt: -1};
            //   }
            // }else{
            //   var sortBy={createdAt: -1};
            // }

            // console.log("andQuery 3", JSON.stringify(query))
            db.collection('favourites').aggregate([
              {
                '$lookup': {
                    'from': 'prospectes', 
                    'localField': 'prospecteId',
                    'foreignField': '_id',
                    'as': 'prospecteDetails' 
                }
              },{
                '$unwind': {
                    'path': '$prospecteDetails',
                    "preserveNullAndEmptyArrays": true
                }
              },
              {
                '$lookup': {
                    'from': 'makes', 
                    'localField': 'prospecteDetails.make',
                    'foreignField': '_id',
                    'as': 'makeDetails' 
                }
              },{
                '$unwind': {
                    'path': '$makeDetails',
                    "preserveNullAndEmptyArrays": true
                }
              },
              {
                  $project: {
                    id:'$_id',
                    isDeleted: "$isDeleted",
                    createdAt:"$createdAt",
                    addedBy:"$addedBy",
                    prospecteId:"$prospecteId",
                    prospecteDetails:"$prospecteDetails",
                    model:"$prospecteDetails.model",
                    vin:"$prospecteDetails.vin",
                    makeName:"$makeDetails.name",
                    year:"$prospecteDetails.year",
                    make:"$prospecteDetails.make",
                    
                }
              },
              {
                $match: query
              }
            ]).toArray((err, results) => {
              // console.log(results,'results---');
              db.collection('favourites').aggregate([
                {
                    '$lookup': {
                        'from': 'prospectes', 
                        'localField': 'prospecteId',
                        'foreignField': '_id',
                        'as': 'prospecteDetails' 
                    }
                  },{
                    '$unwind': {
                        'path': '$prospecteDetails',
                        "preserveNullAndEmptyArrays": true
                    }
                  },
                  {
                    '$lookup': {
                        'from': 'makes', 
                        'localField': 'prospecteDetails.make',
                        'foreignField': '_id',
                        'as': 'makeDetails' 
                    }
                  },{
                    '$unwind': {
                        'path': '$makeDetails',
                        "preserveNullAndEmptyArrays": true
                    }
                  },
                {
                  $project: {
                    id:'$_id',
                    isDeleted: "$isDeleted",
                    createdAt:"$createdAt",
                    addedBy:"$addedBy",
                    prospecteId:"$prospecteId",
                    prospecteDetails:"$prospecteDetails",
                    model:"$prospecteDetails.model",
                    vin:"$prospecteDetails.vin",
                    makeName:"$makeDetails.name",
                    year:"$prospecteDetails.year",
                    make:"$prospecteDetails.make",
                  }
                },
                  {
                    $match: query
                  },
                  { 
                    $skip: skipNo
                  },
                  { 
                    $sort: sortBy
                  },
                  {
                    $limit: Number(count)
                  },
                ]).toArray(async(err, result) => {   

                  for (let index = 0; index < result.length; index++) {
                    delete result[index].prospecteDetails.businessClient;
                    delete result[index].prospecteDetails.businessClientValue;
                    delete result[index].prospecteDetails.includeCostList;
                    delete result[index].prospecteDetails.clientCostList;
                    delete result[index].prospecteDetails.expenseList;
                 
                    // console.log(result[index].prospecteId,'p id');

                    var prospectesDetails = await Prospectes.findOne({prospecte_original_id:result[index].prospecteId+ '' });
                    if(prospectesDetails){
                      // console.log(prospectesDetails,'prospectesDetails');
                      result[index]['shareProspecteId']=prospectesDetails.id;
                      result[index]['shareProspecteEmail']=prospectesDetails.businessClient;
                    }
                   }

                    return res.status(200).json({
                      success: true,
                      code: 200,
                      data: result,
                      total: results.length
                    });


                })
              })
          }catch (err) {
            console.log(err);
            return res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
          }
    },

    
};