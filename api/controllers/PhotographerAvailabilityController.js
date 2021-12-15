/**
 * PhotographerAvailabilityController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
 const constantObj = sails.config.constants;
 const db = sails.getDatastore().manager;
 const ObjectId = require('mongodb').ObjectID;
 module.exports = {
    /**
     * 
     * @param {*} data 
     * @param {*} context 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     * @description Used to save the PhotographerAvailability
     * @createdAt 06/12/2021
     * @createdBy : Rohit kumar
     */
     savephotographeravailability: (req, res) => {
         console.log("dsfcds");
        const data = req.body;
        let query = {}
        query.isDeleted = false;
        query.addedBy = req.identity.id;
        query.date = data.date
        data.addedBy = req.identity.id;
        PhotographerAvailability.findOne(query).then((typeExist) => {
            if (typeExist) {
                res.status(404).json({ "success": false, "error": {code: 400, "message": constantObj.PhotographerAvailability.ALREADY_EXIST } });
            } else {
                PhotographerAvailability.create(data).then((savedCategory) => {
                    res.status(200).json({
                        "success": true,
                        "message": constantObj.PhotographerAvailability.AVAILABILITY_SAVED
                    });
                });
            }
        });
    },

    /**
    * 
    * @param {*} req 
    * @param {*} res 
    * @returns data
    * @description To get list of PhotographerAvailability by photographerID
    * @author Rohit Kumar
    * @date 06/12/2021
    */
     getavailabilityListById: async (req, res) => {
        try {
            console.log("jjj");
            let search = req.param('search');
            const page = req.param('page') || 1;
            const count = req.param('count') || 10;
            const skipNo = (page - 1) * count;

            var addedBy= req.identity.id;
            var PhotographerAvailabilityData = await PhotographerAvailability.find({ addedBy: addedBy,isDeleted:false }).populate("addedBy").skip(skipNo).limit(count);
            if (PhotographerAvailabilityData) {
                return res.status(200).json({
                    success: true,
                    message: constantObj.category.GET_DATA,
                    data: PhotographerAvailabilityData,
                });
            }else {
                return res.status(404).json({
                  success: false,
                  error: { code: 400, message: constantObj.messages.NOT_FOUND }
                });
              }
        } catch (error) {
            return res
                .status(400)
                .json({ success: false, error: { code: 400, message: " " + error.toString() } });
        }
    },
    
}