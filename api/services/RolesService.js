/**
 * @DESC:  In this class/files Roles related functions (save, update, add comment)
 * @Request param: Authorization and form data values
 * @Return : Success message with required data
 * @Author: JCsoftware Solution Pvt. Ltd.
*/

var Promise = require('bluebird'),
	promisify = Promise.promisify;
var constantObj = sails.config.constants;



module.exports = {

	// Used to save Role
	saveRoles: function (data, context, req, res) {
	try{
		data.createdBy = context.identity.id;
		let query = {}
		if ((!data.name) || data.name == undefined) {
		  return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Name Is Required" } });
		}

		if ((!data.userType) || typeof data.userType == undefined) {
            return res.status(404).json({ success: false, error: { code: 404, message: constantObj.Title.USERTYPE_REQUIRED} });
        }

		query.name		 = data.name;
		query.isDeleted  = false;
		query.userType   =data.userType;

		 Roles.findOne(query).then(function (roleExist) {
			if (roleExist) {
				return res.status(400).json({ success: false,code: 400, message: constantObj.Roles.ROLE_ALREADY_EXIST, key: 'ROLE_ALREADY_EXIST',  });
			} else {
				Roles.create(data).then(function (role) {
					return res.status(200).json({
						success: true,
						code: 200,
						message: constantObj.Roles.SAVED_ROLE,
					});
				});
			}
		});
	 }catch (err) {
		return res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
	 }
	},



	// Used to update Role
	updateRoles: function (data, context, req, res) {
	try{
		data.updatedBy = context.identity.id
		let _id = data.id;
		if ((!data.name) || data.name == undefined) {
			return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Name Is Required" } });
		}
		 Roles.update({ id: _id }, data).then(function (role) {
			return res.status(200).json({
				success: true,
				code: 200,
				role: role,
				message: constantObj.Roles.UPDATED_ROLE,
			});
		});
	  }catch (err) {
		return res.status(400).json({ success: false, error: {"code": 400, "message":""+err} });
	 }
	},



};
