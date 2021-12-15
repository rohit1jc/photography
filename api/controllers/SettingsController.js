/**
 * SettingsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */



var constantObj = sails.config.constants;
module.exports = {

    setting:  (req, res)=> {
        Settings.find().exec(function (err, data) {
        // Settings.find().exec(function (err, data) {
            if (err) {
                return res.status(400).json({success: false,message : err })
            } else {
                return res.status(200).json({
                    success: true,
                    data: data
                })
            }
        })
    },

    
   updateSetting : (req,res)=>{
       var id = req.param('id')
       req.body.updatedBy = req.identity.id
        data = req.body
       Settings.update({id:id},data).then(updatedSetting=>{
           return res.status(200).json({
               success:true,
               code :200,
               data:updatedSetting,
               message: "Setting updated successfully"
           })
       })
   }

};

