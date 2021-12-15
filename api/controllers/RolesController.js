/**
 * RolesController
 *
 * @description :: Server-side logic for managing Roles
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var constantObj = sails.config.constants;
 const db = sails.getDatastore().manager;
 module.exports = {

	save: function (req, res) {
		API(RolesService.saveRoles, req, res);
	},

	 edit: function (req, res) {
    	API(RolesService.updateRoles, req, res);
   },


   //For Get all role in admin with search
    getAllRoles : (req,res)=>{
    try{
      var search = req.param('search');
      var sortBy = req.param('sortBy');
      var page = req.param('page');
      var count = req.param('count');

      if(page == undefined){ page = 1; }

      if(count == undefined){
        count = 10;
      }

      var skipNo = (page - 1) * count;
      var query = {};
      query.$and=[];
      innerORQuery = [];

      if (sortBy) {
          sortBy ={updatedAt: -1};
      } else {
          sortBy = {createdAt: -1};
      }

      if (search) {
        query.$or = [
          { name: {$regex: search, '$options' : 'i'}},
        ]
      }

      var isDeleted = req.param('isDeleted');
      if(isDeleted === 'true'){
        isDeleted = true;
        var sortBy={updatedAt: -1};
      }else{
        isDeleted = false;
        var sortBy={createdAt: -1};
      }
      query.$and.push({isDeleted :isDeleted});


      db.collection('roles').aggregate([
      {
        $project: {
            id:'$_id',
            name: "$name",
            isEditable: "$isEditable",
            permission: "$permission",
            status:"$status",
            personal_details:"$personal_details",
            deletedBy:"$deletedBy",
            contact_information:"$contact_information",
            addedBy:"$addedBy",
            updatedBy:"$updatedBy",
            isDeleted: "$isDeleted",
            deletedAt:"$deletedAt",
            updatedAt:"$updatedAt",
            createdAt:"$createdAt",
        }
        },
        {
          $match: query
        },
      ]).toArray((err, totalResult) => {
        db.collection('roles').aggregate([
          {
            $project: {
                id:'$_id',
                name: "$name",
                isEditable: "$isEditable",
                permission: "$permission",
                status:"$status",
                personal_details:"$personal_details",
                deletedBy:"$deletedBy",
                contact_information:"$contact_information",
                addedBy:"$addedBy",
                updatedBy:"$updatedBy",
                isDeleted: "$isDeleted",
                deletedAt:"$deletedAt",
                updatedAt:"$updatedAt",
                createdAt:"$createdAt",
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
                "data": result ?result :[],
                "total": totalResult ? totalResult.length :0,
              });
          })
      })
    } catch (err) {
      return res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
    }
    },


    getAllRolesName: function (req, res, next) {
      try{
        var userType = req.param('userType');
        if ((!userType) || typeof userType == undefined) {
            return res.status(404).json({ success: false, error: { code: 404, message: constantObj.Roles.USERTYPE_REQUIRED} });
        }
        var query = {};
        query.isDeleted = 'false';
        query.userType = userType;

        Roles.find(query).select('name').sort('createdAt desc').exec(function (err, roles) {
            if (err) {
                return res.status(400).json({success: false,code:400,error: err});
            } else {
                return res.json({
                    success: true,
                    code:200,
                    data: roles,
                });
            }
        })
        } catch (error) {
        return res.status(400).json({ success: false, error: {"code": 400, "message":" "+error} });
        }
      },


    //For Get role details
    getRole : (req,res)=>{
    try{
        var id = req.param('id');
        Roles.findOne({id:id}).then(role=>{
            return res.status(200).json({
                success: true,
                code:200,
                data:role,
            })
        });
     }catch (err) {
       return res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
     }
    },

    
};
