var constantObj = sails.config.constants;
var fs = require('fs');
var url = require('url');


let Country = require('country-state-city').Country;
let State = require('country-state-city').State;
let City = require('country-state-city').City;


const NodeGeocoder = require('node-geocoder');
var zipcodes = require('zipcodes');
const multer = require('multer');
var async = require('async')

var express = require('express');
var app = express();
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({     // to support URL-encoded bodies
    limit: '150mb',
    extended: true
}));
var sharp = require('sharp');
const db = sails.getDatastore().manager;

var smtpTransport = require('nodemailer-smtp-transport');
var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport(smtpTransport({
    host: sails.config.appSMTP.host,
    port: sails.config.appSMTP.port,
    debug: sails.config.appSMTP.debug,
    auth: {
        user: sails.config.appSMTP.auth.user, //access using /congig/appSMTP.js
        pass: sails.config.appSMTP.auth.pass
    }
}));
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images/users')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const videoStorage = multer.diskStorage({
    destination: 'videos', // Destination to store video
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now()
            + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

const { ObjectId } = require('mongodb');
const CommonService = require('../services/CommonService');


module.exports = {

    uploadImages: async (req, res) => {
        try {
            // console.log("In Upload Image");
            // var modelName = 'users';
            var modelName = req.query.modelName;
            if ((!modelName) || typeof modelName == undefined) {
                return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Please Add Model Name" } });
            }

            req.file('data').upload({ maxBytes: 5000000, dirname: '../../assets/images' }, async (err, file) => {
                if (err) {
                    if (err.code == 'E_EXCEEDS_UPLOAD_LIMIT') {
                        return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Please Select Image Below 5Mb" } });
                    }
                }
                let fullpath = []
                let resImagePath = []
                file.forEach(async (element, index) => {
                    var name = generateName()
                    // console.log(element.fd)
                    typeArr = element.type.split("/");
                    fileExt = typeArr[1]
                    fs.readFile(file[index].fd, async (err, data) => {
                        if (err) {
                            return res.status(403).json({ "success": false, "error": { "code": 403, "message": err }, });
                        } else {
                            if (data) {
                                var path = file[index].fd
                                fs.writeFile('assets/images/' + modelName + '/' + name + '.' + fileExt, data, function (err, image) {
                                    if (err) {
                                        console.log(err)
                                        return res.status(400).json({ "success": false, "error": { "code": 400, "message": err }, });
                                    }
                                })

                                fullpath.push(name + '.' + fileExt)
                                resImagePath.push('assets/images/' + modelName + '/' + name + '.' + fileExt)
                                var thumbpath = 'assets/images/' + modelName + '/thumbnail/200/' + name + '.' + fileExt;
                                sharp(path).resize({ height: 200, width: 200 }).toFile(thumbpath).then(function (newFileInfo) { })
                                    .catch(function (err) { console.log("Got Error", err); });
                                var thumbpath1 = 'assets/images/' + modelName + '/thumbnail/300/' + name + '.' + fileExt;
                                var thumbpath2 = 'assets/images/' + modelName + '/thumbnail/500/' + name + '.' + fileExt;
                                sharp(path).resize({ height: 300, width: 300 }).toFile(thumbpath1)
                                    .then(function (newFileInfo) { })
                                    .catch(function (err) { console.log("Got Error", err); });
                                sharp(path).resize({ height: 500, width: 500 }).toFile(thumbpath2)
                                    .then(function (newFileInfo) {
                                    }).catch(function (err) { console.log("Got Error"); });

                                await new Promise(resolve => setTimeout(resolve, 1000));
                                var fullpathnew = resImagePath[0].replace("assets/", "");
                                if (index == file.length - 1) {
                                    return res.json({
                                        success: true,
                                        code: 200,
                                        data: {
                                            fullPath: fullpathnew,
                                            imagePath: fullpath[0],
                                        },
                                    });
                                }
                            }
                        }
                    });//end of loop
                })
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({ "success": false, "error": { "code": 500, "message": "" + err } })
        }
    },


    multipleImages: async (req, res) => {
        try {
            //    console.log("In Upload multipleImages");
            // var modelName = 'users';
            var modelName = req.query.modelName;
            if ((!modelName) || typeof modelName == undefined) {
                return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Please Add Model Name" } });
            }
            req.file('data').upload({ maxBytes: 5000000, dirname: '../../assets/images' }, async (err, file) => {
                if (err) {
                    if (err.code == 'E_EXCEEDS_UPLOAD_LIMIT') {
                        return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Please Select Image Below 5Mb" } });
                    }
                }
                let fullpath = []
                let resImagePath = []
                file.forEach(async (element, index) => {
                    var name = generateName()
                    // console.log(element.fd)
                    typeArr = element.type.split("/");
                    fileExt = typeArr[1]
                    fs.readFile(file[index].fd, async (err, data) => {
                        if (err) {
                            return res.status(403).json({ "success": false, "error": { "code": 403, "message": err }, });
                        } else {
                            if (data) {
                                var path = file[index].fd
                                fs.writeFile('assets/images/' + modelName + '/' + name + '.' + fileExt, data, function (err, image) {
                                    if (err) {
                                        console.log(err)
                                        return res.status(400).json({ "success": false, "error": { "code": 400, "message": err }, });
                                    }
                                })

                                fullpath.push(name + '.' + fileExt)
                                resImagePath.push('assets/images/' + modelName + '/' + name + '.' + fileExt)
                                var thumbpath = 'assets/images/' + modelName + '/thumbnail/200/' + name + '.' + fileExt;
                                sharp(path).resize({ height: 200, width: 200 }).toFile(thumbpath).then(function (newFileInfo) { })
                                    .catch(function (err) { console.log("Got Error", err); });
                                var thumbpath1 = 'assets/images/' + modelName + '/thumbnail/300/' + name + '.' + fileExt;
                                var thumbpath2 = 'assets/images/' + modelName + '/thumbnail/500/' + name + '.' + fileExt;
                                sharp(path).resize({ height: 300, width: 300 }).toFile(thumbpath1)
                                    .then(function (newFileInfo) { })
                                    .catch(function (err) { console.log("Got Error", err); });
                                sharp(path).resize({ height: 500, width: 500 }).toFile(thumbpath2)
                                    .then(function (newFileInfo) {
                                    }).catch(function (err) { console.log("Got Error"); });

                                await new Promise(resolve => setTimeout(resolve, 1000));

                                if (index == file.length - 1) {
                                    await new Promise((resolve) => setTimeout(resolve, 2000));
                                    return res.json({
                                        "success": true,
                                        "code": 200,
                                        "data": {
                                            "fullPath": resImagePath,
                                            "imagePath": fullpath,
                                        },
                                    });
                                }
                            }
                        }
                    });//end of loop
                })
            })
        } catch (err) {
            console.log(err)
            return res.status(500).json({ "success": false, "error": { "code": 500, "message": "" + err } })
        }
    },

    delete: function (req, res) {
        API(CommonService.delete, req, res);
    },

    deleteUndo: function (req, res) {
        API(CommonService.deleteUndo, req, res);
    },


    // permanentDeleteCategoryType: function (req, res) {
    //     API(CommonService.permanentDeleteCategoryType, req, res);
    // },

    // permanentDeleteModel: function (req, res) {
    //     API(CommonService.permanentDeleteModel, req, res);
    // },

    // permanentDeleteCategory: function (req, res) {
    //     API(CommonService.permanentDeleteCategory, req, res);
    // },

    async findAllCounrty(req, res) {
        var details = Country.getAllCountries();
        let skills = [];
        for (var index = 0; index < details.length; index++) {
            let obj = {};
            obj['shortName'] = details[index].isoCode;
            obj['name'] = details[index].name
            skills.push(obj);
        }
        return res.status(200).json({
            success: true,
            code: 200,
            data: skills,
        });
    },

    async findAllState(req, res) {
        var shortName = req.param('shortName')
        if (((!shortName) || typeof shortName == undefined)) {
            return res.status(404).json({ "success": false, "error": { "code": 404, "message": "short Name is required" } });
        }
        var details = State.getStatesOfCountry(shortName);

        let skills = [];
        for (var index = 0; index < details.length; index++) {
            let obj = {};
            obj['name'] = details[index].name;
            obj['shortName'] = details[index].isoCode;
            skills.push(obj);
        }
        return res.status(200).json({
            success: true,
            code: 200,
            data: skills,
        });
    },

    async findAllCities(req, res) {
        // console.log("In Getcountry");
        var shortName = req.param('shortName')
        if (((!shortName) || typeof shortName == undefined)) {
            return res.status(404).json({ "success": false, "error": { "code": 404, "message": "short Name is required" } });
        }

        var state = req.param('state')
        if (((!state) || typeof state == undefined)) {
            return res.status(404).json({ "success": false, "error": { "code": 404, "message": "State Name is required" } });
        }
        var details = City.getCitiesOfState(shortName, state)

        let skills = [];
        for (var index = 0; index < details.length; index++) {
            let obj = {};
            obj['name'] = details[index].name;
            skills.push(obj);
        }

        return res.status(200).json({
            success: true,
            code: 200,
            data: skills,
        });
    },

    async getCurrencyList(req, res) {
        // console.log("In getCurrencyList");
        var detaildata = require('currency-codes');
        // console.log(cc.codes());
        var details = detaildata['data'];
        let skills = [];
        for (var index = 0; index < details.length; index++) {
            let obj = {};
            obj['code'] = details[index].code;
            obj['countries'] = details[index].countries
            skills.push(obj);
        }
        return res.status(200).json({
            success: true,
            code: 200,
            data: skills,
        });
    },

    removeImage: (req, res) => {
        var Imagename = req.param('Imagename')
        modelName = req.param('type')
        // console.log('In image remove')
        var fs = require('fs');
        var thumbpath = 'assets/images/' + modelName + '/thumbnail/200/' + Imagename;
        var thumbpath1 = 'assets/images/' + modelName + '/thumbnail/300/' + Imagename;
        var thumbpath2 = 'assets/images/' + modelName + '/thumbnail/500/' + Imagename;

        fs.unlink('assets/images/' + modelName + '/' + Imagename, function (err) {
            if (err) throw err;
        });
        fs.unlink(thumbpath, function (err) {
            if (err) throw err;
        });
        fs.unlink(thumbpath1, function (err) {
            if (err) throw err;
        });
        fs.unlink(thumbpath2, function (err) {
            if (err) throw err;
        });

        return res.status(200).json({
            code: 200,
            success: true,
            message: "Image Deleted Successfully."
        })

    },

    /*
    For Send Email to all active 
    */
    sendMailToAllSubscribers: function (req, res) {
        try {
            let query = {};
            query.status = "active";

            Subscribers.find(query).then(function (subscribers) {
                if (subscribers.length > 0) {
                    async.each(subscribers, function (subscriber, callback) {
                        let desc = req.body.description
                        let subject = req.body.subject
                        url = 'http://198.251.65.146:4019'
                        style = {
                            body: `
                            padding:15px;
                            `,
                            p: 'margin-top:0;margin-bottom:10px;',

                            textPrimary: `color:#3e3a6e;
                            `,
                            h5: `font-family: Raleway, sans-serif;
                            font-size: 22px;
                            background:none;
                            padding:0;
                            color:#333;
                            height:auto;
                            font-weight: bold;
                            line-height:normal;
                            `,
                            m0: `margin:0;`,
                            mb3: 'margin-bottom:15px;',
                            textCenter: `text-align:center;`,
                            btn: `padding:10px 30px;
                            font-weight:500;
                            font-size:14px;
                            line-height:normal;
                            border:0;
                            display:block;
                            text-decoration:none;
                            margin:auto;
                            `,
                            btnPrimary: `
                            background-color:#3e3a6e;
                            color:#fff;
                            `,
                            bgPrimary: `background-color:#3e3a6e;`,
                            footer: `
                            padding:10px 15px;
                            font-weight:500;
                            color:#fff;
                            text-align:center;
                            background-color:#000;
                            `,
                            img: `
                          width: 100%;
                          max-width:30%;
                          display: block;
                          margin: auto;
                          `,
                            box: `
                           width: 800px;
                           display: block;
                           margin: auto;
                           background: #fff;
                           border: 1px solid #e0e0e0;`,
                            center: `
                            text-align:center;
                            font-family:sans-serif;
                            padding: 0px 20px;
                        `,
                            logo: `
                          width: 6rem;
                          padding: 10px;`
                        }


                        message = ''
                        message += `<div style="${style.box}">
                        <div > <img style="${style.logo}" src="http://74.208.206.18:4031/assets/img/logo.png"></div>
                        <div ><img style="${style.img}" src="http://74.208.206.18:4031/email_img/like.png"></div>
                        <h2 style="${style.center}">Hello Subscriber</h2>
                        <p style="${style.center}">` + desc + `</p>
                        </div>`

                        transport.sendMail({
                            from: sails.config.appSMTP.auth.user,
                            to: subscriber.email,
                            subject: subject,
                            html: message
                        }, function (err, info) {
                            if (err) {
                                callback(err)
                            } else { callback(); }
                        });
                    }, function (error) {
                        if (error) {
                            return res.status(400).json({ success: false, error: { message: error } });
                        } else {
                            return res.status(200).json({
                                success: true,
                                code: 200,
                                message: "Email Sent To Subscribers"
                            });
                        }
                    });
                } else {
                    return res.status(400).json({ success: false, error: { message: "No subsciber exist" } });
                }
            })
        } catch (err) {
            console.log(err);
            return res.status(400).json({
                success: false,
                error: err,
                message: "Server Error",
            });
        }
    },



    changeStatus: function (req, res) {
        try {
            var modelName = req.param('model');
            var Model = sails.models[modelName];
            var itemId = req.param('id');
            var updated_status = req.param('status');

            if ((!itemId) || itemId == undefined) {
                return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Id Is Required" } });
            }

            if ((!modelName) || modelName == undefined) {
                return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Model Name Is Required" } });
            }

            if ((!updated_status) || updated_status == undefined) {
                return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Status Is Required" } });
            }

            let query = {};
            query.id = itemId;

            Model.findOne(query).exec(function (err, data) {

                if (err) {
                    return res.json({
                        success: false,
                        error: {
                            code: 400,
                            message: constantObj.messages.DATABASE_ISSUE
                        }
                    });
                } else {
                    Model.update({
                        id: itemId
                    }, {
                        status: updated_status,
                        description: req.body.description,
                    }, function (err, response) {
                        if (err) {
                            return res.json({
                                success: false,
                                error: {
                                    code: 400,
                                    message: constantObj.messages.DATABASE_ISSUE
                                }
                            });

                        } else {
                            return res.json({
                                success: true,
                                code: 200,
                                message: constantObj.messages.STATUS_CHANGED
                            });
                        }
                    });
                }
            })
        } catch (err) {
            console.log(err);
            return res.status(400).json({ success: false, error: { "code": 400, "message": "" + err } });
        }
    },


    saveRecord: function (req, res) {
        API(CommonService.saveRecord, req, res);
    },

    getRecord: function (req, res) {
        try {
            var modelName = req.param('model');
            var status = req.param('status');
            if ((!modelName) || modelName == undefined) {
                return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Model Name Is Required" } });
            }
            var Model = sails.models[modelName];
            var search = req.param('search');
            var isDeleted = req.param('isDeleted');
            var count = req.param('count');
            var page = req.param('page');

            if (page == undefined) { page = 1; }
            if (count == undefined) { count = 10; }
            var skipNo = (page - 1) * count;

            var query = {};
            query.$and = [];
            innerORQuery = [];

            if (search) {
                innerORQuery.push({ name: { $regex: search, '$options': 'i' } },)
                innerORQuery.push({ email: { $regex: search, '$options': 'i' } },)
                query.$and.push({ $or: innerORQuery });
            }

            if (status) {
                query.$and.push({ status: status });
            }

            if (isDeleted === 'true') {
                isDeleted = true;
                var sortBy = { updatedAt: -1 };
            } else {
                isDeleted = false;
                var sortBy = { createdAt: -1 };
            }
            query.$and.push({ isDeleted: isDeleted });

            // console.log("andQuery 3", JSON.stringify(query))
            db.collection(modelName).aggregate([
                {
                    $project: {
                        id: '$_id',
                        isDeleted: "$isDeleted",
                        name: "$name",
                        createdAt: "$createdAt",
                        updatedBy: "$updatedBy",
                        deletedAt: "$deletedAt",
                        updatedAt: "$updatedAt",
                        status: "$status",
                        email: "$email",
                        headline: "$headline",
                        description: "$description",
                        type: "$type",
                    }
                },
                {
                    $match: query
                }
            ]).toArray((err, results) => {
                //   console.log(results,'results---');
                db.collection(modelName).aggregate([
                    {
                        $project: {
                            id: '$_id',
                            isDeleted: "$isDeleted",
                            name: "$name",
                            createdAt: "$createdAt",
                            updatedBy: "$updatedBy",
                            deletedAt: "$deletedAt",
                            updatedAt: "$updatedAt",
                            status: "$status",
                            email: "$email",
                            cost: "$cost",
                            countryFor: "$countryFor",
                            headline: "$headline",
                            description: "$description",
                            type: "$type",
                        }
                    },
                    {
                        $match: query
                    },
                    {
                        $sort: sortBy
                    },
                    {
                        $skip: skipNo
                    },
                    {
                        $limit: Number(count)
                    },
                ]).toArray(async (err, result) => {
                    return res.status(200).json({
                        success: true,
                        code: 200,
                        data: result ? result : [],
                        total: results ? results.length : 0
                    });
                })
            })
        } catch (err) {
            console.log(err);
            return res.status(400).json({ success: false, error: { "code": 400, "message": "" + err } });
        }
    },

    updateRecord: function (req, res) {
        API(CommonService.updateRecord, req, res);
    },

    getSingleRecord: function (req, res) {
        API(CommonService.getSingleRecord, req, res);
    },

    colors: function (req, res) {
        try {
            var search = req.param('search');
            var count = req.param('count');
            var page = req.param('page');

            if (page == undefined) { page = 1; }
            if (count == undefined) { count = 10; }
            var skipNo = (page - 1) * count;

            var query = {};
            query.$and = [];
            innerORQuery = [];

            if (search) {
                innerORQuery.push({ name: { $regex: search, '$options': 'i' } },)
                query.$and.push({ $or: innerORQuery });
            }
            query.$and.push({ status: 'active' });

            // console.log("andQuery 3", JSON.stringify(query))
            db.collection('colors').aggregate([
                {
                    $project: {
                        id: '$_id',
                        name: "$name",
                        status: "$status",
                    }
                },
                {
                    $match: query
                }
            ]).toArray((err, results) => {
                //   console.log(results,'results---');
                db.collection('colors').aggregate([
                    {
                        $project: {
                            id: '$_id',
                            name: "$name",
                            status: "$status",
                        }
                    },
                    {
                        $match: query
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $skip: skipNo
                    },
                    {
                        $limit: Number(count)
                    },
                ]).toArray(async (err, result) => {
                    return res.status(200).json({
                        success: true,
                        code: 200,
                        data: result,
                        total: results.length
                    });
                })
            })
        } catch (err) {
            console.log(err);
            return res.status(400).json({ success: false, error: { "code": 400, "message": "" + err } });
        }
    },

    exterionColors: function (req, res) {
        try {
            var search = req.param('search');
            var colorId = req.param('colorId');
            if ((!colorId) || typeof colorId == undefined) {
                return res.status(400).json({ "success": false, "error": { "code": 400, "message": "color Id Is Required" } });
            }

            var count = req.param('count');
            var page = req.param('page');

            if (page == undefined) { page = 1; }
            if (count == undefined) { count = 100; }
            var skipNo = (page - 1) * count;

            var query = {};
            query.$and = [];
            innerORQuery = [];

            if (search) {
                innerORQuery.push({ name: { $regex: search, '$options': 'i' } },)
                query.$and.push({ $or: innerORQuery });
            }

            query.$and.push({ colorId: ObjectId(colorId) });
            // console.log("andQuery 3", JSON.stringify(query))
            db.collection('exterioncolors').aggregate([
                {
                    $project: {
                        id: '$_id',
                        name: "$name",
                        colorId: "$colorId",
                    }
                },
                {
                    $match: query
                }
            ]).toArray((err, results) => {
                //   console.log(results,'results---');
                db.collection('exterioncolors').aggregate([
                    {
                        $project: {
                            id: '$_id',
                            name: "$name",
                            colorId: "$colorId",
                        }
                    },
                    {
                        $match: query
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $skip: skipNo
                    },
                    {
                        $limit: Number(count)
                    },
                ]).toArray(async (err, result) => {
                    return res.status(200).json({
                        success: true,
                        code: 200,
                        data: result ? result : [],
                        total: results ? results.length : 0
                    });
                })
            })
        } catch (err) {
            console.log(err);
            return res.status(400).json({ success: false, error: { "code": 400, "message": "" + err } });
        }
    },


    addexterionColors: function (req, res) {
        try {
            var data = req.body;

            if ((!data.colorId) || typeof data.colorId == undefined) {
                return res.status(404).json({ "success": false, "error": { "code": 404, "message": "Color Id Is Required" } });
            }


            let query = {}
            query.name = data.name;
            query.colorId = data.colorId;
            ExterionColors.findOne(query).then((typeExist) => {
                if (typeExist) {
                    return res.status(404).json({ success: false, error: { code: 404, message: "Name Already Save" } });
                } else {
                    ExterionColors.create(data).then((savedCategory) => {
                        return res.status(200).json({
                            success: true,
                            code: 200,
                            message: "Color Name Save Successfully",
                        });
                    });
                }
            });
        } catch (err) {
            console.log(err);
            return res.status(400).json({ success: false, error: { "code": 400, "message": "" + err } });
        }
    },


}; // End of module export




generateName = function () { // action are perform to generate random name for every file
    var uuid = require('uuid');
    var randomStr = uuid.v4();
    var date = new Date();
    var currentDate = date.valueOf();

    retVal = randomStr + currentDate
    return retVal;
};
