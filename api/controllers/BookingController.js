/**
 * BookingController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */


const constantObj = sails.config.constants;
const db = sails.getDatastore().manager;
const ObjectId = require('mongodb').ObjectID;
const toBooking = (response, res) => {
    if (response)
        return res.status(200).json({ success: true, message: "success", data: response });
    else return res.status(400).json({ success: false, error: { code: 400, message: "Some problem" } });

}
module.exports = {
    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns message
     * @description To book photographer
     * @author Rohit Kumar
     * @date 22/10/2021
     */
    booked: async (req, res) => {
        try {
            const data = req.body;
            switch (data.addFor) {
                case 'category':
                    if (!data.categoryId || data.categoryId == undefined) {
                        return res.status(400).json({
                            success: false,
                            error: { code: 400, message: constantObj.category.ID_REQUIRED }
                        });
                    }
                    const responseC = await Bookings.create({ categoryId: data.categoryId }).fetch();
                    toBooking(responseC, res);
                    break;
                case 'plan':
                    if (!data.id || data.id == undefined) {
                        return res.status(400).json({
                            success: false,
                            error: { code: 400, message: constantObj.booking.ID_REQUIRED }
                        });
                    }
                    if (!data.planId || data.planId == undefined) {
                        return res.status(400).json({
                            success: false,
                            error: { code: 400, message: constantObj.plan.ID_REQUIRED }
                        });
                    }
                    const responseP = await Bookings.updateOne({ id: data.id }, { planId: data.planId });
                    toBooking(responseP, res);
                    break;

                case 'user':
                    if (!data.id || data.id == undefined) {
                        return res.status(400).json({
                            success: false,
                            error: { code: 400, message: constantObj.booking.ID_REQUIRED }
                        });
                    }
                    if (!data.firstName || typeof data.firstName == undefined) {
                        return res.status(404).json({
                            success: false,
                            error: { code: 404, message: constantObj.user.FIRSTNAME_REQUIRED },
                        });
                    }
                    if (!data.lastName || typeof data.lastName == undefined) {
                        return res.status(404).json({
                            success: false,
                            error: { code: 404, message: constantObj.user.LASTNAME_REQUIRED },
                        });
                    }
                    if (!data.mobileNo || typeof data.mobileNo == undefined) {
                        return res.status(404).json({
                            success: false,
                            error: { code: 404, message: constantObj.user.MOBILE_REQUIRED },
                        });
                    }
                    if (!data.email || typeof data.email == undefined) {
                        return res.status(404).json({
                            success: false,
                            error: { code: 404, message: constantObj.user.EMAIL_REQUIRED },
                        });
                    }
                    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    var testemail = re.test(String(data.email).toLowerCase());

                    if (testemail == false) {
                        return res.status(404).json({
                            success: false,
                            error: { code: 404, message: constantObj.user.EMAIL_VALID },
                        });
                    }

                    // const tempuser = await TempUserData.findOne({ email: data.email });
                    const user = await Users.findOne({ email: data.email });
                    const dataToUser = Object.assign({}, (({ firstName, lastName, email, mobileNo }) => ({ firstName, lastName, email, mobileNo }))(data));
                    if (user) {
                        await Users.updateOne({ email: data.email }, { ...dataToUser })
                        await Bookings.updateOne({ id: data.id  }, { bookBy: user.id})
                        const responseU = await Bookings.findOne({ id: data.id }).populate("categoryId");
                        toBooking(responseU, res);
                    }
                    else {
                        // if (tempuser) {
                        //     let fullName =data.firstName + ' ' + data.lastName;
                        //     var tempuserdata = await TempUserData.updateOne({ email: data.email }, { ...dataToUser, bookingId: data.id, fullName:fullName})
                        //     await Bookings.updateOne({ id: data.id  }, { bookBy: tempuser.id});
                        //     var new_date = new Date();
                        //     var token = await jwt.sign(
                        //         { user_id: tempuserdata.id, lastLogin: new_date,firstName: tempuserdata.firstName },
                        //         { issuer: "Jcsoftware", subject: tempuserdata.email, audience: "photography" }
                        //     );
                        //     let updateddata=await TempUserData.updateOne({ id: tempuserdata.id }).set({
                        //         lastLogin: new_date,
                        //       });
                        //     const responseU = await Bookings.findOne({ id: data.id }).populate("categoryId");
                        //     responseU.bookBy=updateddata;
                        //     responseU.access_token=token;
                        //     toBooking(responseU, res);
                        // } else {
                            // dataToUser["date_registered"] = date;
                            // dataToUser["date_verified"] = date;
                            // dataToUser["status"] = "active";
                            // dataToUser["termCondition"] = true;
                            // const password = new Date().getTime();
                            // dataToUser["password"] = password.toString().substr(1, 10);
                            // // console.log(req.body.mobileNo,'req.body.mobileNo')
                            // dataToUser.fullName = `${data.firstName} ${data.lastName}`;
                            // const newUser = await Users.create(dataToUser).fetch();
                            // const responseU = await Bookings.updateOne({ id: data.id }, { bookBy: newUser.id });
                            let fullName =data.firstName + ' ' + data.lastName;
                            // var newtempuser= await TempUserData.create({ ...dataToUser, bookingId: data.id, fullName:fullName }).fetch();
                            var newtempuser= await Users.create({ ...dataToUser, bookingId: data.id, fullName:fullName ,role:'guestuser',"termCondition":false}).fetch();
                            var new_date = new Date();
                            var token = await jwt.sign(
                                { user_id: newtempuser.id, lastLogin: new_date, firstName: newtempuser.firstName },
                                { issuer: "Jcsoftware", subject: newtempuser.email, audience: "photography" }
                            );
                            // let updateddata=await TempUserData.updateOne({ id: newtempuser.id }).set({
                            //     lastLogin: new_date,
                            //   });
                            let updateddata=await Users.updateOne({ id: newtempuser.id }).set({
                               lastLogin: new_date,
                            });
                            await Bookings.updateOne({ id: data.id  }, { bookBy: newtempuser.id})
                            const responseU = await Bookings.findOne({ id: data.id }).populate("categoryId").populate("bookBy");
                            responseU.access_token=token;
                            responseU.bookBy=updateddata;
                            toBooking(responseU, res);
                        // }
                    }
                    break;

                case 'location':
                    if (!data.id || data.id == undefined) {
                        return res.status(400).json({
                            success: false,
                            error: { code: 400, message: constantObj.booking.ID_REQUIRED }
                        });
                    }
                    if (!data.address || data.address == undefined) {
                        return res.status(400).json({
                            success: false,
                            error: { code: 400, message: constantObj.user.ADDRESS }
                        });
                    }
                    if (!data.lat || data.lat == undefined) {
                        return res.status(400).json({
                            success: false,
                            error: { code: 400, message: constantObj.user.LATITUDE }
                        });
                    }
                    if (!data.long || data.long == undefined) {
                        return res.status(400).json({
                            success: false,
                            error: { code: 400, message: constantObj.user.LONGTITUDE }
                        });
                    }
                    console.log(data);

                    const responseL = await Bookings.updateOne({ id: data.id }, { address: data.address, lat: data.lat, long: data.long, description: data.description });

                    //This photographer notification will be send after payment start here
                    const filterQ = [];
                    const query = {};
                    filterQ.push({ isDeleted: false });
                    filterQ.push({ isVerified: 'Y' });
                    filterQ.push({ status: 'active' });
                    // filterQ.push({ photograpy: 'accepted' });
                    if (filterQ.length > 0) {
                        query.$and = filterQ;
                    }
                    // console.log(JSON.stringify(query));
                    db.collection("users").aggregate([
                        {
                            "$geoNear": {
                                near: { type: "Point", coordinates: [responseL.lat, responseL.long] },
                                distanceField: "dist",
                                maxDistance: 160934, //distance 100 miles
                                //   distanceMultiplier: 1 / 1000,
                                query: { role: 'photographer' },
                                spherical: true,
                            }
                        },
                        {
                            $lookup: {
                                from: "photographerdetails", localField: "_id", foreignField: "addedBy", as: "photographer"
                            }
                        },
                        { $unwind: '$photographer' },
                        {
                            $project: {
                                id: '$_id',
                                fullName: "$fullName",
                                isDeleted: "$isDeleted",
                                isVerified: "$isVerified",
                                status: "$status",
                                isPreferred: "$isPreferred",
                                photograpy: "$photographer.isVerified"
                            }
                        },
                        {
                            $match: query,
                        },
                    ])
                        .toArray((err, result) => {

                            if (err) {
                                return res.status(400).json({
                                    success: false,
                                    error: { code: 400, message: "There is no photographar in this location please select another location" }
                                });
                            } else {

                                // const profileCompletedPhotographers = [];
                                // function* getPhotographerDetailsById(id) {
                                //     yield PhotographerDetails.find({ addedBy: id + '' });
                                // }
                                // await (async function () {
                                //     if (result) for await (const photographer of result) {
                                //         for await (const details of getPhotographerDetailsById(photographer['id'])) {
                                //             if (details && details.length > 0) {
                                //                 profileCompletedPhotographers.push(photographer['id']);
                                //             }
                                //         }
                                //     }
                                // })();
                                // result = result.filter(photographer => profileCompletedPhotographers.some(item => item === photographer.id));

                                //this filter also apply by after payment to avoid duplicate request if 
                                // Photographer have more than one photography
                                console.log(result);
                                if (result.length > 0) {
                                    toBooking(responseL, res);
                                    // return res.status(200).json({
                                    //     success: true,
                                    //     message: "success",
                                    // });
                                }
                                else
                                    return res.status(400).json({
                                        success: false,
                                        error: { code: 400, message: "There is no photographar in this location please select another location" }
                                    });
                            }
                        });
                    break;
                    case 'date':
                        if (!data.id || data.id == undefined) {
                            return res.status(400).json({
                                success: false,
                                error: { code: 400, message: constantObj.booking.ID_REQUIRED }
                            });
                        }
                        if (!data.date || data.date == undefined) {
                            return res.status(400).json({
                                success: false,
                                error: { code: 400, message: "Date required." }
                            });
                        }
                        if (!data.time || data.time == undefined) {
                            return res.status(400).json({
                                success: false,
                                error: { code: 400, message: "Time required." }
                            });
                        }

                        var minutes = data.time.split(":").pop()
                        var hours = data.time.split(':').shift();
                        const hour = hours.trim().slice(-2).toLowerCase() === 'pm' ? +(hours.trim().substr(0, 2)) % 12 === 0 ? '00' : +(hours.trim().substr(0, 2)) + 12 + '' : hours.trim().substr(0, 2);
                        const dateForBooking = new Date(data.date);
                        dateForBooking.setHours(hour);
                        dateForBooking.setMinutes(minutes);
                        var update = await Bookings.updateOne({ id: data.id }, { dateForBooking: dateForBooking});
                        const responseq =await Bookings.findOne({ id: data.id }).populate("categoryId");
                        
                        toBooking(responseq, res);
                    break;
                    case 'person':
                    if (!data.id || data.id == undefined) {
                        return res.status(400).json({
                            success: false,
                            error: { code: 400, message: constantObj.booking.ID_REQUIRED }
                        });
                    }
                    var update = await Bookings.updateOne({ id: data.id }, { totalperson: data.person });
                    const responseS =await Bookings.findOne({ id: data.id }).populate("categoryId");
                    toBooking(responseS, res);
                    break;
                    case 'extras':
                    if (!data.id || data.id == undefined) {
                        return res.status(400).json({
                            success: false,
                            error: { code: 400, message: constantObj.booking.ID_REQUIRED }
                        });
                    }
                    if (!data.extras || data.extras == undefined) {
                        return res.status(400).json({
                            success: false,
                            error: { code: 400, message: constantObj.extras.EXTRAS_REQUIRED }
                        });
                    }
                    var update = await Bookings.updateOne({ id: data.id }, { extras: data.extras });
                    const responseT =await Bookings.findOne({ id: data.id }).populate("categoryId");
                    toBooking(responseT, res);
                    break;
                default:
                    return res.status(400).json({
                        success: false,
                        error: { code: 400, message: "Please enter valid data" }
                    });

            }
        } catch (error) {
            return res.status(400).json({ success: false, error: { code: 400, message: error.toString() } });
        }
    },
    /**
      * 
      * @param {*} req 
      * @param {*} res 
      * @returns message
      * @description To accept or reject booking request by photographer
      * @author Vibhay
      * @date 28/10/2021
      */

    photographerAction: async (req, res) => {
        try {
            if (req.identity.role !== 'photographer') {
                return res.status(400).json({ success: false, error: { code: 400, message: "You are not authorized" } });
            }
            const data = req.body;
            if (!data.id || data.id == undefined) {
                return res.status(404).json({
                    success: false,
                    error: { code: 404, message: constantObj.booking.ID_REQUIRED },
                });
            }
            if (!data.status || data.status == undefined) {
                return res.status(404).json({
                    success: false,
                    error: { code: 404, message: "Status required." },
                });
            }
            const id = data.id;
            delete data.id;
            if (data.status === 'accepted') {
                data.status = 'accepted';
            } else if (data.status === 'rejected') {
                data.status = 'rejected';
            } else {
                return res.status(404).json({
                    success: false,
                    error: { code: 404, message: "Status must be either accepted or rejected." },
                });
            }
            data.acceptedBy = req.identity.id;
            data.updatedAt = new Date();
            if (data.status === 'accepted') {
                const response = await Bookings.updateOne({ id: id }, { bookStatus: data.status , acceptedBy:data.acceptedBy});
                await BookingNotifications.updateOne({ bookingId: id, photographerId: data.acceptedBy }, { status: 'accepted' });
                // console.log(data.acceptedBy, "=====", data);
                await BookingNotifications.update({ bookingId: id, photographerId: { '!=': data.acceptedBy } }, { status: 'deactive' });
                if (response)
                    return res.status(200).json({ success: true, message: constantObj.photography.VERIFIED });
                else return res.status(400).json({ success: false, error: { code: 400, message: constantObj.messages.NOT_FOUND } });
            } else {
                const response = await BookingNotifications.updateOne({ bookingId: id, photographerId: data.acceptedBy }, { status: 'rejected' });
                const noNotifications = await BookingNotifications.findOne({ bookingId: id, status: 'active' });
                // if (!noNotifications) {
                //     // do some action if there are no photographer for accept this proposal
                // }
                if (response)
                    return res.status(200).json({ success: true, message: constantObj.photography.VERIFIED });
                else return res.status(400).json({ success: false, error: { code: 400, message: constantObj.messages.NOT_FOUND } });
            }
        } catch (err) {
            return res
                .status(400)
                .json({ success: false, error: { code: 400, message: " " + err.toString() } });
        }
    },

    /**
        * 
        * @param {*} req 
        * @param {*} res 
        * @returns data
        * @description To get list of booking request by user
        * @author Vibhay
        * @date 27/10/2021
        */
    getBookingList: async (req, res) => {
        console.log("dfdfgdf");
        try {
            let search = req.param('search');
            let userid = req.param('id');
            const page = req.param('page') || 1;
            const count = req.param('count') || 10;
            const skipNo = (page - 1) * count;
            const filterQ = [];
            const innerORQuery = [];
            const query = {};
            filterQ.push({ isDeleted: false });
            filterQ.push({ bookBy: ObjectId(userid) });
            // req.param('isDeleted') && filterQ.push({ isDeleted: req.param('isDeleted').toLowerCase() == 'true' ? true : false });
            // req.param('categoryId') && filterQ.push({ categoryId: ObjectId(req.param('categoryId')) });

            if (search) {
                search = search.replace(/[?]/g, '  ');
                innerORQuery.push({ categoryName: { $regex: search, '$options': 'i' } });
                filterQ.push({ $or: innerORQuery });
            }

            if (filterQ.length > 0) {
                query.$and = filterQ;
            }
            console.log(query);
            db.collection("bookings").aggregate([
                {
                    $lookup: {
                        from: "category",
                        localField: "categoryId",
                        foreignField: "_id",
                        as: "categoryDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$categoryDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: "subscriptionplan",
                        localField: "planId",
                        foreignField: "_id",
                        as: "planDetails",
                    },
                },
                {
                    $lookup: {
                        from: "transactions",
                        localField: "transactionId",
                        foreignField: "_id",
                        as: "transactionDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$transactionDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $unwind: {
                        path: "$planDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        id: "$_id",
                        categoryName: "$categoryDetails.name",
                        categoryId: "$categoryDetails._id",
                        planDetails: "$planDetails",
                        rendomId:"$rendomId",
                        transactionId:"$transactionId",
                        dateForBooking: "$dateForBooking",
                        description: "$description",
                        bookStatus: "$bookStatus",
                        isDeleted: "$isDeleted",
                        bookBy: "$bookBy",
                        createdAt: "$createdAt",
                    },
                },
                {
                    $match: query,
                },
            ])
                .toArray((err, totalResult) => {
                    db.collection("bookings").aggregate([
                        {
                            $lookup: {
                                from: "category",
                                localField: "categoryId",
                                foreignField: "_id",
                                as: "categoryDetails",
                            },
                        },
                        {
                            $unwind: {
                                path: "$categoryDetails",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "subscriptionplan",
                                localField: "planId",
                                foreignField: "_id",
                                as: "planDetails",
                            },
                        },
                        {
                            $unwind: {
                                path: "$planDetails",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "transactions",
                                localField: "transactionId",
                                foreignField: "_id",
                                as: "transactionDetails",
                            },
                        },
                        {
                            $unwind: {
                                path: "$transactionDetails",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $project: {
                                id: "$_id",
                                categoryName: "$categoryDetails.name",
                                categoryId: "$categoryDetails._id",
                                planDetails: "$planDetails",
                                rendomId:"$rendomId",
                                transactionId:"$transactionId",
                                dateForBooking: "$dateForBooking",
                                description: "$description",
                                bookStatus: "$bookStatus",
                                isDeleted: "$isDeleted",
                                bookBy: "$bookBy",
                                createdAt: "$createdAt",
                            },
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
                    ])
                        .toArray((err, result) => {
                            if (err) {
                                return res.status(400).json({
                                    success: false,
                                    error: { message: "" + err },
                                });
                            } else {
                                return res.status(200).json({
                                    success: true,
                                    // message: constantObj.plan.GET_DATA,
                                    data: result ? result : [],
                                    total: totalResult ? totalResult.length : 0,
                                });
                            }
                        });
                });
        } catch (error) {
            return res
                .status(400)
                .json({ success: false, error: { code: 400, message: " " + error.toString() } });
        }
    },

    /**
        * 
        * @param {*} req 
        * @param {*} res 
        * @returns data
        * @description To get list of booking request by rendomID
        * @author Rohit Kumar
        * @date 25/11/2021
        */
     getBookingListById: async (req, res) => {
        try {
            let search = req.param('search');
            var id = req.param('id');
            const page = req.param('page') || 1;
            const count = req.param('count') || 10;
            const skipNo = (page - 1) * count;
            const filterQ = [];
            const innerORQuery = [];
            const query = {};
            filterQ.push({ isDeleted: false });
            filterQ.push({ rendomId:id  });
            // req.param('isDeleted') && filterQ.push({ isDeleted: req.param('isDeleted').toLowerCase() == 'true' ? true : false });
            // req.param('categoryId') && filterQ.push({ categoryId: ObjectId(req.param('categoryId')) });

            if (search) {
                search = search.replace(/[?]/g, '  ');
                innerORQuery.push({ categoryName: { $regex: search, '$options': 'i' } });
                filterQ.push({ $or: innerORQuery });
            }

            if (filterQ.length > 0) {
                query.$and = filterQ;
            }
            console.log(query);

            var BookingData = await Bookings.findOne({ rendomId: id,isDeleted:false }).populate("categoryId").populate("planId").populate("transactionId").populate("bookBy");
            if (BookingData) {
                return res.status(200).json({
                    success: true,
                    message: constantObj.booking.GET_DATA,
                    data: BookingData,
                });
            }else {
                return res.status(404).json({
                  success: false,
                  error: { code: 400, message: constantObj.booking.NO_RESULT }
                });
              }
        } catch (error) {
            return res
                .status(400)
                .json({ success: false, error: { code: 400, message: " " + error.toString() } });
        }
    },
    /**
        * 
        * @param {*} req 
        * @param {*} res 
        * @returns data
        * @description To get list of photographer have recieved booking request
        * @author Vibhay
        * @date 22/10/2021
        */
    getBookingRequest: async (req, res) => {
        try {
            let search = req.param('search');
            const page = req.param('page') || 1;
            const count = req.param('count') || 10;
            const skipNo = (page - 1) * count;
            const filterQ = [];
            const innerORQuery = [];
            const query = {};
            filterQ.push({ isDeleted: false });
            filterQ.push({ photographerId: ObjectId(req.identity.id) });
            filterQ.push({ status: 'active' });
            // req.param('isDeleted') && filterQ.push({ isDeleted: req.param('isDeleted').toLowerCase() == 'true' ? true : false });
            // req.param('categoryId') && filterQ.push({ categoryId: ObjectId(req.param('categoryId')) });

            if (search) {
                search = search.replace(/[?]/g, '  ');
                innerORQuery.push({ categoryName: { $regex: search, '$options': 'i' } });
                filterQ.push({ $or: innerORQuery });
            }

            if (filterQ.length > 0) {
                query.$and = filterQ;
            }

            db.collection("bookingnotifications").aggregate([
                {
                    $lookup: {
                        from: "category",
                        localField: "categoryId",
                        foreignField: "_id",
                        as: "categoryDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$categoryDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "userDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$userDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: "bookings",
                        localField: "bookingId",
                        foreignField: "_id",
                        as: "bookingDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$bookingDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        id: "$_id",
                        categoryName: "$categoryDetails.name",
                        categoryId: "$categoryDetails._id",
                        customerName: "$userDetails.fullName",
                        customerId: "$userDetails._id",
                        bookingId: "$bookingDetails._id",
                        dateForBooking: "$bookingDetails.dateForBooking",
                        description: "$bookingDetails.description",
                        bookStatus: "$bookingDetails.bookStatus",
                        bookBy: "$bookingDetails.bookBy",
                        status: "$status",
                        photographerId: "$photographerId",
                        isDeleted: "$isDeleted",

                        createdAt: "$createdAt",
                    },
                },
                {
                    $match: query,
                },
            ])
                .toArray((err, totalResult) => {
                    db.collection("bookingnotifications").aggregate([
                        {
                            $lookup: {
                                from: "category",
                                localField: "categoryId",
                                foreignField: "_id",
                                as: "categoryDetails",
                            },
                        },
                        {
                            $unwind: {
                                path: "$categoryDetails",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "userId",
                                foreignField: "_id",
                                as: "userDetails",
                            },
                        },
                        {
                            $unwind: {
                                path: "$userDetails",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "bookings",
                                localField: "bookingId",
                                foreignField: "_id",
                                as: "bookingDetails",
                            },
                        },
                        {
                            $unwind: {
                                path: "$bookingDetails",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $project: {
                                id: "$_id",
                                categoryName: "$categoryDetails.name",
                                categoryId: "$categoryDetails._id",
                                customerName: "$userDetails.fullName",
                                customerId: "$userDetails._id",
                                bookingId: "$bookingDetails._id",
                                dateForBooking: "$bookingDetails.dateForBooking",
                                description: "$bookingDetails.description",
                                bookStatus: "$bookingDetails.bookStatus",
                                bookBy: "$bookingDetails.bookBy",
                                status: "$status",
                                photographerId: "$photographerId",
                                isDeleted: "$isDeleted",
                                createdAt: "$createdAt",
                            },
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
                    ])
                        .toArray((err, result) => {
                            if (err) {
                                return res.status(400).json({
                                    success: false,
                                    error: { message: "" + err },
                                });
                            } else {
                                return res.status(200).json({
                                    success: true,
                                    // message: constantObj.plan.GET_DATA,
                                    data: result ? result : [],
                                    total: totalResult ? totalResult.length : 0,
                                });
                            }
                        });
                });
        } catch (error) {
            return res
                .status(400)
                .json({ success: false, error: { code: 400, message: " " + error.toString() } });
        }
    },
    /**
        * 
        * @param {*} req 
        * @param {*} res 
        * @returns data
        * @description To get list of booked photographer
        * @author Vibhay
        * @date 28/10/2021
        */
    getAcceptedBooking: async (req, res) => {
        try {
            let search = req.param('search');
            const page = req.param('page') || 1;
            const count = req.param('count') || 10;
            const skipNo = (page - 1) * count;
            const filterQ = [];
            const innerORQuery = [];
            const query = {};
            filterQ.push({ isDeleted: false });
            filterQ.push({ acceptedBy: ObjectId(req.identity.id) });
            filterQ.push({ bookStatus: 'accepted' });
            // req.param('isDeleted') && filterQ.push({ isDeleted: req.param('isDeleted').toLowerCase() == 'true' ? true : false });
            // req.param('categoryId') && filterQ.push({ categoryId: ObjectId(req.param('categoryId')) });

            if (search) {
                search = search.replace(/[?]/g, '  ');
                innerORQuery.push({ categoryName: { $regex: search, '$options': 'i' } });
                filterQ.push({ $or: innerORQuery });
            }

            if (filterQ.length > 0) {
                query.$and = filterQ;
            }

            db.collection("bookings").aggregate([
                {
                    $lookup: {
                        from: "category",
                        localField: "categoryId",
                        foreignField: "_id",
                        as: "categoryDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$categoryDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "bookBy",
                        foreignField: "_id",
                        as: "userDetails",
                    },
                },
                {
                    $unwind: {
                        path: "$userDetails",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $project: {
                        id: "$_id",
                        categoryName: "$categoryDetails.name",
                        categoryId: "$categoryDetails._id",
                        customerName: "$userDetails.fullName",
                        dateForBooking: "$dateForBooking",
                        description: "$description",
                        bookStatus: "$bookStatus",
                        bookBy: "$bookBy",
                        acceptedBy: "$acceptedBy",
                        isDeleted: "$isDeleted",
                        createdAt: "$createdAt",
                    },
                },
                {
                    $match: query,
                },
            ])
                .toArray((err, totalResult) => {
                    db.collection("bookings").aggregate([
                        {
                            $lookup: {
                                from: "category",
                                localField: "categoryId",
                                foreignField: "_id",
                                as: "categoryDetails",
                            },
                        },
                        {
                            $unwind: {
                                path: "$categoryDetails",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "bookBy",
                                foreignField: "_id",
                                as: "userDetails",
                            },
                        },
                        {
                            $unwind: {
                                path: "$userDetails",
                                preserveNullAndEmptyArrays: true,
                            },
                        },
                        {
                            $project: {
                                id: "$_id",
                                categoryName: "$categoryDetails.name",
                                categoryId: "$categoryDetails._id",
                                customerName: "$userDetails.fullName",
                                dateForBooking: "$dateForBooking",
                                description: "$description",
                                bookStatus: "$bookStatus",
                                bookBy: "$bookBy",
                                acceptedBy: "$acceptedBy",
                                isDeleted: "$isDeleted",
                                createdAt: "$createdAt",
                            },
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
                    ])
                        .toArray((err, result) => {
                            if (err) {
                                return res.status(400).json({
                                    success: false,
                                    error: { message: "" + err },
                                });
                            } else {
                                return res.status(200).json({
                                    success: true,
                                    // message: constantObj.plan.GET_DATA,
                                    data: result ? result : [],
                                    total: totalResult ? totalResult.length : 0,
                                });
                            }
                        });
                });
        } catch (error) {
            return res
                .status(400)
                .json({ success: false, error: { code: 400, message: " " + error.toString() } });
        }
    },
    /**
        * 
        * @param {*} req 
        * @param {*} res 
        * @returns message
        * @description To get booked photographer
        * @author Vibhay
        * @date 22/10/2021
        */
    getSingleBooked: async (req, res) => {
        try {
            const id = req.param('id');
            if (!id || id == undefined) {
                return res.status(400).json({
                    success: false,
                    error: { code: 400, message: constantObj.user.ID_REQUIRED }
                });
            }
            const response = await Bookings.findOne({ id: id }).populate('acceptedBy').populate('planId').populate('bookBy');
            // if(response.bookBy == null){
            //     const userDetails = await TempUserData.findOne({ bookingId:id })
            //     response.bookBy=userDetails;
            // }
            if (response)
                return res.status(200).json({ success: true, data: response });
            else return res.status(400).json({ success: false, error: { code: 400, message: constantObj.messages.NOT_FOUND } });

        } catch (error) {
            return res
                .status(400)
                .json({ success: false, error: { code: 400, message: " " + error.toString() } });
        }
    },
};

