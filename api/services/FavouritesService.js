/**
  * @DESC:  In this class/files favorites related functions (add, get)
  * @Request param: Authorization and form data values
  * @Return : Success message with required data
  * @Author: JCsoftware Solution Pvt. Ltd.
*/

var Promise = require('bluebird'),
    promisify = Promise.promisify;
var ObjectID = require('mongodb').ObjectID;
var constantObj = sails.config.constants;

module.exports = {

    // Function used to create or delete favorites
    addFavourites: (data, context,req,res) => {
     try {
            var data=req.body;
            if ((!data.prospecteId) || typeof data.prospecteId == undefined) {
              return res.status(404).json({ "success": false, "error": { "code": 404, "message":constantObj.Prospecte.PID_REQUIRED} });
            }
            
            let query = {}
            query.prospecteId = data.prospecteId;
            query.addedBy = req.identity.id;
      
            Favourites.findOne(query).then(async function (FavouritesData) {
             if (FavouritesData) {
                  var FavouritesDetails = await Favourites.destroyOne(query);
                    return res.status(200).json({success: true,code: 200,message: "Favourite Removed",});
                } else {
                  data.addedBy = req.identity.id;
                      Favourites.create(data).then(function (blog) {
                          return res.status(200).json({
                              success: true,
                              code: 200,
                              message: "Favourite Added Successfully",
                          });
                      });
                  }
              });
            }catch (err) {
              console.log(err);
              return res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
            }
    },


};