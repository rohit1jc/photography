/**
 * BlogsController
 *
 * @description :: Server-side logic for managing Blog
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


const db = sails.getDatastore().manager;
const { ObjectId } = require('mongodb');
module.exports = {

  save: function (req, res) {
    API(BlogService.saveBlog, req, res);

  },
  edit: function (req, res) {
    API(BlogService.updateBlog, req, res);

  },

  getAllBlog: function (req, res, next) {
    try {
      let search = req.param('search');
      const page = req.param('page') || 1;
      const count = req.param('count') || 10;
      const skipNo = (page - 1) * count;
      const filterQ = [];
      const innerORQuery = [];
      const query = {};

      req.param('isDeleted') && filterQ.push({ isDeleted: req.param('isDeleted').toLowerCase() == 'true' ? true : false });

      req.param('categoryId') && filterQ.push({ categoryId: ObjectId(req.param('categoryId')) });
      req.param('status') && filterQ.push({ status: req.param('status') });

      if (search) {
          search = search.replace(/[?*`~!%&=,./"'^()]/g, '  ');
          innerORQuery.push({ title: { $regex: search, '$options': 'i' } },);
          innerORQuery.push({ description: { $regex: search, '$options': 'i' } });
          filterQ.push({ $or: innerORQuery });
      }

      if (filterQ.length > 0) {
          query.$and = filterQ;
      }      
      // console.log("andQuery 3", JSON.stringify(query))
      db.collection('blogs').aggregate([
        {
          '$lookup': {
            'from': 'users',
            'localField': 'deletedBy',
            'foreignField': '_id',
            'as': 'deletedBy'
          }
        }, {
          '$unwind': {
            'path': '$deletedBy',
            "preserveNullAndEmptyArrays": true
          }
        },

        {
          '$lookup': {
            'from': 'category',
            'localField': 'categoryID',
            'foreignField': '_id',
            'as': 'categoriesDetails'
          }
        }, {
          '$unwind': {
            'path': '$categoriesDetails',
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          $project: {
            id: '$_id',
            isDeleted: "$isDeleted",
            title: "$title",
            description: "$description",
            image: "$image",
            categoryId: "$categoriesDetails._id",
            categoryName: "$categoriesDetails.name",
            createdAt: "$createdAt",
            updatedAt: "$updatedAt",
            status: "$status",
            slug: "$slug",
            deletedBy: {
              fullName: "$deletedBy.fullName",
            },
            deletedAt: "$deletedAt",
            updatedBy: "$updatedBy",
          }
        },
        {
          $match: query
        },
      ]).toArray((err, total) => {
        db.collection('blogs').aggregate([
          {
            '$lookup': {
              'from': 'users',
              'localField': 'deletedBy',
              'foreignField': '_id',
              'as': 'deletedBy'
            }
          }, {
            '$unwind': {
              'path': '$deletedBy',
              "preserveNullAndEmptyArrays": true
            }
          },

          {
            '$lookup': {
              'from': 'category',
              'localField': 'categoryID',
              'foreignField': '_id',
              'as': 'categoriesDetails'
            }
          }, {
            '$unwind': {
              'path': '$categoriesDetails',
              "preserveNullAndEmptyArrays": true
            }
          },
          {
            $project: {
              id: '$_id',
              isDeleted: "$isDeleted",
              title: "$title",
              description: "$description",
              image: "$image",
              categoryId: "$categoriesDetails._id",
              categoryName: "$categoriesDetails.name",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
              status: "$status",
              slug: "$slug",
              deletedBy: {
                fullName: "$deletedBy.fullName",
              },
              deletedAt: "$deletedAt",
              updatedBy: "$updatedBy",
            }
          },
          {
            $match: query,
          },
          { $sort: { createdAt: -1 } },
          {
            $skip: skipNo,
          },
          {
            $limit: Number(count),
          },
        ]).toArray((err, result) => {
          return res.status(200).json({
            "success": true,
            "code": 200,
            "data": result ? result : [],
            "total": total ? total.length : 0,
          });
        })
      })
    } catch (error) {
      return res.status(400).json({ success: false, error: { "code": 400, "message": " " + error } });
    }
  },


  commentBlog: function (req, res) {
    try {
      // console.log("In Blog comment");
      var data = req.body;
      if ((!data.comment) || typeof data.comment == undefined) {
        return res.status(404).json({ "success": false, "error": { "code": 404, "message": constantObj.blogs.COMMENT_REQUIRED } });
      }

      if ((!data.blog_id) || typeof data.blog_id == undefined) {
        return res.status(404).json({ "success": false, "error": { "code": 404, "message": constantObj.blogs.BLOG_ID_REQUIRED } });
      }
      if (req.body.user_id == undefined) {
        return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Please Login for Comments" } });
      }
      data.addedBy = req.body.user_id;
      BlogComments.create(data).then(function (blog) {

        return res.status(200).json({
          success: true,
          code: 200,
          message: "Comment Added Successfully",
        });
      });
    } catch (error) {
      return res.status(400).json({ success: false, error: { "code": 400, "message": " " + error } });
    }
  },

  getSingleBlog: (req, res) => {
    try {
      var id = req.param('id');
      Blogs.findOne({ id: id }).populate('categoryID').then(blogs => {
        return res.status(200).json({
          success: true,
          code: 200,
          data: blogs,
        });
        // var commentQuery = {};
        // commentQuery.blog_id = blogs['id'];
        // BlogComments.find(commentQuery).populate('addedBy').exec((err, comments) => {
        //   if (err) {
        //     return res.status(400).json({ success: false, error: err });
        //   } else {
        //     Blogs.find().populate("categoryID").sort('createdAt desc').limit(3).then(latest_blog => {
        //       blogs['comments'] = comments;
        //       return res.status(200).json({
        //         success: true,
        //         code: 200,
        //         data: blogs,
        //         latest_blog: latest_blog,
        //       });
        //     });
        //   }
        // })
      })
    } catch (error) {
      return res.status(400).json({ success: false, error: { "code": 400, "message": " " + error } });
    }
  }


};
