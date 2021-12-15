var constantObj = sails.config.constants;
var ObjectID = require('mongodb').ObjectID;


module.exports = {

    /**
     * 
     * @param {*} data 
     * @param {*} context 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     * @description Used to save the category
     * @createdAt 03/09/2021
     * @createdBy : Himanshu Gupta
     */
    saveCategory: (data, context, req, res) => {
        if ((!data.name) || typeof data.name == undefined) {
            return res.status(404).json({ 'success': false, 'error': { 'message': constantObj.category.NAME_REQUIRED } });
        }
        if ((!data.cat_type) || typeof data.cat_type == undefined) {
            return res.status(404).json({ 'success': false, 'error': { 'message': "Category type required." } });
        }
        let query = {}
        query.isDeleted = false;
        query.name = data.name.toLowerCase();
        data.addedBy = context.identity.id;
        Category.findOne(query).then((typeExist) => {
            if (typeExist) {
                return res.status(404).json({ "success": false, "error": { "message": constantObj.category.CATEGORY_ALREADY_EXIST } });
            } else {
                data.name = data.name.toLowerCase()
                Category.create(data).then((savedCategory) => {
                    return res.status(200).json({
                        "success": true,
                        "message": constantObj.category.CATEGORY_SAVED
                    });
                }).catch((err) => {
                    return res.status(400).json({ "success": false, "error": { "message": " " + err } })
                });
            }
        });
    },

    /**
     * 
     * @param {*} data 
     * @param {*} context 
     * @param {*} req 
     * @param {*} res 
     * @description : Used to update the category
     * @createdAt 20/09/2021
     * @createdBy : Himanshu Gupta
     */
    updateCategory: (data, context, req, res) => {
        let query = {};
        query.id = data.id
        // query.isDeleted = false;
        Category.findOne(query).then((cat) => {
            if (cat) {
                data.updatedBy = context.identity.id
                Category.updateOne(data.id, data).then((updatedCategory) => {
                    return res.status(200).json({
                        "success": true,
                        "message": constantObj.category.UPDATED_CATEGORY
                    });
                }).catch((err) => {
                    return res.status(400).json({ "success": false, "error": { "message": " " + err } })
                });
            } else {
                return res.status(400).json({ "success": false, "error": { "code": 400, "message": constantObj.category.ISSUE_IN_UPDATE } });
            }
        });
    },


}; // End Delete service class
