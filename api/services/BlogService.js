/**
 * @DESC:  In this class/files Blogs related functions (save, update, add comment)
 * @Request param: Authorization and form data values
 * @Return : Success message with required data
 * @Author: JCsoftware Solution Pvt. Ltd.
*/

var Promise = require('bluebird'),
	promisify = Promise.promisify;
var constantObj = sails.config.constants;


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

	// Used to save blog
	saveBlog: function (data, context, req, res) {
	 try {
		if ((!data.title) || typeof data.title == undefined) {
			return res.status(404).json({ "success": false, "error": { "code": 404, "message": constantObj.blogs.TITLE_REQUIRED } });
		}
		if ((!data.description) || typeof data.description == undefined) {
			return res.status(404).json({ "success": false, "error": { "code": 404, "message": constantObj.blogs.DESCRIPTION_REQUIRED } });
		}
		data.slug = slugify(data.title);
		data.addedBy = context.identity.id;
		let query = {}
		query.title = data.title;
		query.isDeleted = false;
		Blogs.findOne(query).then(function (blog) {
		if (blog) {
	        return res.status(404).json({ "success": false, "error": { "code": 404, "message":constantObj.blogs.BLOG_ALREADY_EXIST } });
		} else {
				 Blogs.create(data).then(function (blog) {
					return res.status(200).json({
						success: true,
						code: 200,
						data: blog,
						message: "Blog Added Successfully",
					});
				});
			}
		});
	}catch (error) {
		return res.status(400).json({ success: false, error: {"code": 400, "message":" "+error} });
	}

	},



	// Used to update blog
	updateBlog: function (data, context,req, res) {
	try {
		data.slug = slugify(data.title);
		data.updatedBy =context.identity.id
		let _id = data.id;
		Blogs.update({ id: _id }, data).then(function (blog) {

		return res.status(200).json({
			success: true,
			code: 200,
			data: blog,
			message: "Blog Updated Successfully",
		});
	});
	}catch (error) {
		return res.status(400).json({ success: false, error: {"code": 400, "message":" "+error} });
	   }
	},



};
