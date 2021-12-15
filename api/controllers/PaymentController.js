
/**
 * PaymentController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
 const stripe = require('stripe')('sk_test_51Gs5ogKT6enLyQclqAihwfJKt4yLF3FXl1GtixInYKBmgNtzQ00HUPEZcHqlpVfJ135BZbjc0ag9LEefXlLPuudq00XP0xdszk');
 // const ACCOUNT_ID = 'acct_1JiBsYSJZAQWzLYa';
 const db = sails.getDatastore().manager;
 const constantObj = sails.config.constants;
 var ObjectId = require("mongodb").ObjectID;
 var nodemailer = require('nodemailer');
 var smtpTransport = require('nodemailer-smtp-transport');
 var async = require("async");
 var twilio = require('../../config/local.js');
var client = require('twilio')(
  twilio.TWILIO_ACCOUNT_SID,
  twilio.TWILIO_AUTH_TOKEN
);
var transport = nodemailer.createTransport(smtpTransport({
    host: sails.config.appSMTP.host,
    port: sails.config.appSMTP.port,
    debug: sails.config.appSMTP.debug,
    auth: {
        user: sails.config.appSMTP.auth.user, //access using /congig/appSMTP.js
        pass: sails.config.appSMTP.auth.pass
    }
}));
 
 module.exports = {
 
     /**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns message
 * @description To get all transactions
 * @createdBy Vibhay
 * @date 20/10/2021
 */
 
     getAllTransactions: async (req, res) => {
 
         try {
             let search = req.param('search');
             const page = req.param('page') || 1;
             const count = req.param('count') || 10;
             const skipNo = (page - 1) * count;
             const filterQ = [];
             const innerORQuery = [];
             const query = {};
             if (req.identity.role !== 'admin') {
                 filterQ.push({ userId: req.identity.id });
             }
             if (search) {
                 search = search.replace(/[?]/g, '  ');
                 innerORQuery.push({ userName: { $regex: search, '$options': 'i' } });
                 innerORQuery.push({ amount: { $regex: search, '$options': 'i' } });
                 innerORQuery.push({ currency: { $regex: search, '$options': 'i' } });
                 filterQ.push({ $or: innerORQuery });
             }
 
             if (filterQ.length > 0) {
                 query.$and = filterQ;
             }
             // console.log(JSON.stringify(query));
 
             db.collection('transactions').aggregate([{
                 $lookup: {
                     from: "users",
                     localField: "userId",
                     foreignField: "_id",
                     as: "userDetails",
                 },
 
             },
             { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
             {
                 $project: {
                     id: '$_id',
                     userName: "$userDetails.fullName",
                     chargeId: "$chargeId",
                     txnId: "$transactionId",
                     amount: "$amount",
                     currency: "$currency",
                     txnStatus: "$transactionStatus",
                     description: "$description",
                     txnDate: "$createdAt"
                 }
             },
             {
                 $match: query
             },
             ]).toArray((err, totalResult) => {
                 db.collection('transactions').aggregate([{
                     $lookup: {
                         from: "users",
                         localField: "userId",
                         foreignField: "_id",
                         as: "userDetails",
                     },
 
                 },
                 { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
                 {
                     $project: {
                         id: '$_id',
                         userName: "$userDetails.fullName",
                         chargeId: "$chargeId",
                         txnId: "$transactionId",
                         amount: "$amount",
                         currency: "$currency",
                         txnStatus: "$transactionStatus",
                         description: "$description",
                         txnDate: "$createdAt"
                     }
                 },
                 {
                     $match: query
                 },
                 { $sort: { txnDate: -1 } },
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
                         "data": result,
                         "total": totalResult.length,
                     });
                 })
             })
         } catch (err) {
             return res.status(404).json({
                 "success": false,
                 "error": {
                     "code": 404,
                     "message": err.toString()
                 }
             });
         }
     },
 
     /**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns message
 * @description To get card list
 * @createdBy Vibhay
 * @date 20/10/2021
 */
 
     getAllCards: async (req, res) => {
         try {
             const response = await Users.findOne({ select: ['fullName', 'customerId', 'cards'], where: { id: req.identity.id } });
             return res.status(200).json({
                 success: true,
                 data: response,
             });
 
         } catch (err) {
             return res.status(404).json({
                 "success": false,
                 "error": {
                     "code": 404,
                     "message": err.toString()
                 }
             });
         }
     },
 
     /**
      * 
      * @param {*} req 
      * @param {*} res 
      * @returns message
      * @description Pay now
      * @createdBy Vibhay
      * @date 02/11/2021
      */
     payNow: async (req, res) => {
         const { bookingId } = req.body;
         try {
             if ((!bookingId) || bookingId == undefined) {
                 return res.status(404).json({
                     "success": false,
                     "error": {
                         "code": 404,
                         "message": constantObj.booking.ID_REQUIRED
                     }
                 });
             }
             const tmpUser = await TempUserData.findOne({ bookingId: bookingId });
             var users = await Users.findOne({ email: tmpUser.email })
             if (users && tmpUser) {
                 await Bookings.updateOne({ id: bookingId }, { bookBy: users.id });
             }
             else if (tmpUser) {
                 const date = new Date();
                 tmpUser["date_registered"] = date;
                 tmpUser["date_verified"] = date;
                 tmpUser["status"] = "active";
                 tmpUser["termCondition"] = true;
                 tmpUser["role"] = 'user';
                 const password = new Date().getTime();
                 tmpUser["password"] = password.toString().substr(1, 10);
                 delete tmpUser.id;
                 delete tmpUser.bookingId;
                 delete tmpUser.createdAt;
                 delete tmpUser.updatedAt;
                 // console.log(req.body.mobileNo,'req.body.mobileNo')
                 tmpUser.fullName = `${tmpUser.firstName} ${tmpUser.lastName}`;
                 users = await Users.create(tmpUser).fetch();
                 await Bookings.updateOne({ id: bookingId }, { bookBy: users.id });
 
             }
             delete users.password;
             delete users.customerId;
             delete users.cards;
             let new_date = new Date();
             var token = jwt.sign(
                 { user_id: users.id, lastLogin: new_date, firstName: users.firstName },
                 { issuer: "Jcsoftware", subject: users.email, audience: "photography" }
             );
             await Users.updateOne({ id: users.id }).set({
                 lastLogin: new_date,
             });
 
             users.access_token = token;
             // user.refresh_token = refreshToken;
 
             return res.status(200).json({
                 success: true,
                 code: 200,
                 message: constantObj.user.SUCCESSFULLY_LOGGEDIN,
                 data: users,
                 booking: bookingId
             });
 
 
         } catch (err) {
             return res.status(404).json({
                 "success": false,
                 "error": {
                     "code": 404,
                     "message": err.toString()
                 }
             });
         }
 
 
 
     },
 
     /**
  * 
  * @param {*} req 
  * @param {*} res 
  * @returns message
  * @description To refund request
  * @createdBy Vibhay
  * @date 02/11/2021
  */
     refund: async (req, res) => {
         const { bookingId } = req.body;
         try {
             if ((!bookingId) || bookingId == undefined) {
                 return res.status(404).json({
                     "success": false,
                     "error": {
                         "code": 404,
                         "message": constantObj.booking.ID_REQUIRED
                     }
                 });
             }
             const bookStatus = await Bookings.findOne({ id: bookingId, bookStatus: "accepted" });
             if (bookStatus) {
                 return res.status(404).json({
                     "success": false,
                     "error": {
                         "code": 404,
                         "message": constantObj.payment.REFUND_RESTRICTED
                     }
                 });
             }
             const transaction = await Transactions.findOne({ bookingId: bookingId, userId: req.identity.id })
             if (transaction) {
                 const refund = await stripe.refunds.create({
                     charge: transaction.chargeId,
                 });
                 if (refund && refund.status === "succeeded") {
                     await Transactions.updateOne({ bookingId: bookingId, chargeId: transaction.chargeId }, { refund: "yes" })
                     return res.status(200).json({
                         success: true,
                         message: constantObj.payment.REFUNDED,
                     });
                 } else {
                     return res.status(404).json({
                         "success": false,
                         "error": {
                             "code": 404,
                             "message": constantObj.payment.REFUND_FAIL
                         }
                     });
                 }
 
 
             } else {
                 return res.status(404).json({
                     "success": false,
                     "error": {
                         "code": 404,
                         "message": constantObj.payment.NO_TRANSACTION
                     }
                 });
             }
 
 
         } catch (err) {
             return res.status(404).json({
                 "success": false,
                 "error": {
                     "code": 404,
                     "message": err.toString()
                 }
             });
         }
 
 
 
     },
     /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns message
     * @description To checkout payment
     * @createdBy Vibhay
     * @date 20/10/2021
     */
 
     checkoutPayment: async (req, res) => {
         const { cardId, amount, bookingId, description } = req.body;
         try {
             if ((!bookingId) || bookingId == undefined) {
                 return res.status(404).json({
                     "success": false,
                     "error": {
                         "code": 404,
                         "message": constantObj.booking.ID_REQUIRED
                     }
                 });
             }
             if ((!cardId) || cardId == undefined) {
                 return res.status(404).json({
                     "success": false,
                     "error": {
                         "code": 404,
                         "message": constantObj.payment.CARD_ID
                     }
                 });
             }
             if ((!amount) || amount == undefined) {
                 return res.status(404).json({
                     "success": false,
                     "error": {
                         "code": 404,
                         "message":constantObj.payment.AMT_REQUIRED
                     }
                 });
             }
             const bookingDetails = await Bookings.findOne({ id: bookingId }).populate("planId");
 
 
             // return res.status(200).json({
             //     success: true,
             //     message: "Payment successfully.",
             //     data: bookingDetails
             // });
             if (bookingDetails) {
                 var users= await Users.findOne({ id: bookingDetails.bookBy });
                //  if (!users) {
                //      users = await TempUserData.findOne({ id: bookingDetails.bookBy });
                //  }
                //  const users = bookingDetails.bookBy;
                 const address = bookingDetails.address.split(",");
                //  if (users.cards && users.cards.length > 0) {
                //      const checkExist = users.cards.filter(item => item.cardId === req.body.cardId);
                //      if (checkExist && checkExist.length > 0) {
                         const charge = await stripe.charges.create({
                             customer: users.customerId,
                             amount: Number(amount) * 100,
                             currency: 'USD',
                             source: cardId,
                             description: description ? description : null,
                         });
                         var transactions =await Transactions.create({
                             userId: users.id,
                             bookingId: bookingDetails.id,
                             chargeId: charge.id,
                             transactionId: charge.balance_transaction,
                             amount: charge.amount / 100,
                             transactionStatus: charge.status,
                             currency: charge.currency,
                             description: charge.description,
                             receiptUrl: charge.receipt_url
                         }).fetch();
                         // const filterQ = [];
                         var rendomId= Math.floor(100000 + Math.random() * 900000);
                         await Bookings.updateOne({ id: bookingId  },{transactionId: transactions.id,rendomId:rendomId});
                         await bookingEmail({
                            email: users.email,
                            id: rendomId,
                            firstName: users.firstName,
                          });
                        await client.messages.create({
                            from: twilio.TWILIO_PHONE_NUMBER,
                            to: users.mobileNo,
                            body:  `Your booking has been successfully created!.Please click on the link to track order http://74.208.206.18:4032/bookings/track/`+rendomId
                          }).then((message) => console.log(message.sid));
                         const query = {
                             $and: [
                                 { isDeleted: false },
                                 { isVerified: 'Y' },
                                 { status: 'active' },
                                 { photograpy: 'accepted' }
                             ]
                         };
                         // filterQ.push({ isDeleted: false });
                         // filterQ.push({ isVerified: 'Y' });
                         // filterQ.push({ status: 'active' });
                         // filterQ.push({ photograpy: 'accepted' });
                         // if (filterQ.length > 0) {
                         //     query.$and = filterQ;
                         // }
                         // console.log(JSON.stringify(query));
                         db.collection("users").aggregate([
                             {
                                 "$geoNear": {
                                     near: { type: "Point", coordinates: [bookingDetails.lat, bookingDetails.long] },
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
                                $lookup: {
                                    from: "photographeravailability", localField: "_id", foreignField: "addedBy", as: "availability"
                                }
                             },
                             { $unwind: '$availability' },
                             {
                                $lookup: {
                                    from: "photographercategories", localField: "_id", foreignField: "addedBy", as: "categories"
                                }
                             },
                            { $unwind: '$categories' },
                             {
                                 $project: {
                                     id: '$_id',
                                     fullName: "$fullName",
                                     isDeleted: "$isDeleted",
                                     isVerified: "$isVerified",
                                     status: "$status",
                                     isPreferred: "$isPreferred",
                                     photograpy: "$photographer.isVerified",
                                     availability:"$availability",
                                     categories:"$categories",
                                 }
                             },
                             {
                                 $match: query,
                             },
                         ])
                             .toArray(async (err, result) => {
                                //  console.log(result);
                                //  console.log(bookingDetails);
 
                                 if (err) {
                                     return res.status(400).json({
                                         success: false,
                                         error: { message: "" + err },
                                     });
                                 } else {
                                     result = result.filter((v, i, a) => a.findIndex(t => (JSON.stringify(t) === JSON.stringify(v))) === i);
                                     const preferredPhotographerIds = [], unPreferredPhotographerIds = [];
                                     async.each(result, async(photographer) =>{
                                         var date=new Date(photographer.availability.date);
                                         var availabilitydate=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
                                         var date1=new Date(bookingDetails.dateForBooking);
                                         var bookingdate=date1.getFullYear()+'-'+(date1.getMonth()+1)+'-'+date1.getDate();
                                         if(photographer.categories.categoryId == bookingDetails.categoryId && availabilitydate==bookingdate){
                                             
                                            if (photographer.isPreferred && photographer.isPreferred == 'active'){
                                                preferredPhotographerIds.push({ bookingId: bookingDetails.id, photographerId: "" + photographer.id, userId: bookingDetails.bookBy, categoryId: bookingDetails.categoryId });
                                            }else{
                                                unPreferredPhotographerIds.push({ bookingId: bookingDetails.id, photographerId: "" + photographer.id, userId: bookingDetails.bookBy, categoryId: bookingDetails.categoryId });
                                            }
                                        }       
                                     });
                                     if (preferredPhotographerIds.length)
                                         await BookingNotifications.createEach(preferredPhotographerIds);
                                     else
                                         await BookingNotifications.createEach(unPreferredPhotographerIds);
                                     // console.log(preferredPhotographerIds,"preferredPhotographerIds",unPreferredPhotographerIds);
                                     let myGreeting = setTimeout(async function sayHi() {
                                        var bookingstatus = await Bookings.findOne({ id: bookingId });
                                        if(bookingstatus.acceptedBy==null){
                                           await BookingNotifications.createEach(unPreferredPhotographerIds);
                                        }   
                                      }, 900000);
                                     return res.status(200).json({
                                         success: true,
                                         message: constantObj.payment.SUCCESS
                                     });
 
 
                                 }
                             });
                //      } else {
                //          return res.status(404).json({
                //              "success": false,
                //              "error": {
                //                  "code": 404,
                //                  "message": constantObj.messages.NOT_AUTHORIZE
                //              }
                //          });
                //      }
                //  }
                //  else {
                //      return res.status(404).json({
                //          "success": false,
                //          "error": {
                //              "code": 404,
                //              "message": constantObj.payment.NO_CARD
                //          }
                //      });
                //  }
 
             }
             else {
                 return res.status(404).json({
                     "success": false,
                     "error": {
                         "code": 404,
                         "message": constantObj.messages.NOT_AUTHORIZE
                     }
                 });
             }
         } catch (err) {
             return res.status(404).json({
                 "success": false,
                 "error": {
                     "code": 404,
                     "message": err.toString()
                 }
             });
         }
     },
 
 
     /**
      * 
      * @param {*} req 
      * @param {*} res 
      * @returns message
      * @description To save card
      * @createdBy Vibhay
      * @date 08/10/2021
      */
     saveCard: async (req, res) => {
         try {
             var userid =req.body.id
             const users = await Users.findOne({ id: userid });
            //  const tempusers = await TempUserData.findOne({ id: userid });
             if (users) {
                 let customerId = users.customerId;
                 const cardDetails = {
                     number: req.body.cardNumber,
                     exp_month: req.body.expMonth,
                     exp_year: req.body.expYear,
                     cvc: req.body.cvc
                 }
                //  if (users.cards && users.cards.length > 0) {
                //      let last4Digit = cardDetails.number.slice(-4);
                //      const checkExist = users.cards.filter(item => item.last4 === last4Digit);
                //      if (checkExist && checkExist.length > 0) {
                //          return res.status(404).json({
                //              "success": false,
                //              "error": {
                //                  "code": 404,
                //                  "message": constantObj.payment.CARD_EXIST
                //              }
                //          });
                //      }
                //  }
                 if (!customerId || users.customerId === "") {
                     const stripeCustomer = await stripe.customers.create({
                         // source: 'tok_mastercard', // For card type
                         name: users.fullName,
                         email: users.email,
                         address: {
                             country: 'India',
                             postal_code: '274304',
                         },
                         description: `This is ${users.firstName} details`,
 
                         // payment_method: '{{PAYMENT_METHOD_ID}}',
                     });
                     customerId = stripeCustomer.id;
                     await Users.updateOne({ id: users.id }, { customerId: stripeCustomer.id });
                 }
                 // console.log(customerId);
 
                 const token = await stripe.tokens.create({
                     card: cardDetails
                 },
                     // {
                     //     stripeAccount: ACCOUNT_ID
                     // }
                 );
 
                 const response = await stripe.customers.createSource(
                     customerId,
                     { source: token.id }// Use this to make this token id card default This always default first card
                 );
                 await stripe.customers.update(  // To make default added card
                     customerId,
                     {
                         default_source: response.id
                     }
                 );
                 if (response) {
                     let cardsToUpdate = [];
                     if (users.cards && users.cards.length > 0)
                         cardsToUpdate = users.cards.map(item => {
                             return { ...item, isDefault: false }
                         });
                     cardsToUpdate.push({
                         cardId: token.card.id,
                         last4: token.card.last4,
                         exp_month: token.card.exp_month,
                         exp_year: token.card.exp_year,
                         isDefault: true
                     })
                     await Users.updateOne({ id: users.id }, { cards: cardsToUpdate });
                     return res.status(200).json({
                         success: true,
                         message: constantObj.payment.CARD_ADDED, 
                         cardId:cardsToUpdate[0].cardId
                     });
                 }
 
 
            } 
            // if (tempusers) {
            //     let customerId = tempusers.customerId;
            //     const cardDetails = {
            //         number: req.body.cardNumber,
            //         exp_month: req.body.expMonth,
            //         exp_year: req.body.expYear,
            //         cvc: req.body.cvc
            //     }
            //     // if (tempusers.cards && tempusers.cards.length > 0) {
            //     //     let last4Digit = cardDetails.number.slice(-4);
            //     //     const checkExist = tempusers.cards.filter(item => item.last4 === last4Digit);
            //     //     if (checkExist && checkExist.length > 0) {
            //     //         return res.status(404).json({
            //     //             "success": false,
            //     //             "error": {
            //     //                 "code": 404,
            //     //                 "message": constantObj.payment.CARD_EXIST
            //     //             }
            //     //         });
            //     //     }
            //     // }
            //     if (!customerId || tempusers.customerId === "") {
            //         const stripeCustomer = await stripe.customers.create({
            //             // source: 'tok_mastercard', // For card type
            //             name: tempusers.fullName,
            //             email: tempusers.email,
            //             address: {
            //                 country: 'India',
            //                 postal_code: '274304',
            //             },
            //             description: `This is ${tempusers.firstName} details`,

            //             // payment_method: '{{PAYMENT_METHOD_ID}}',
            //         });
            //         customerId = stripeCustomer.id;
            //         await TempUserData.updateOne({ id: tempusers.id }, { customerId: stripeCustomer.id });
            //     }
            //     // console.log(customerId);

            //     const token = await stripe.tokens.create({
            //         card: cardDetails
            //     },
            //         // {
            //         //     stripeAccount: ACCOUNT_ID
            //         // }
            //     );

            //     const response = await stripe.customers.createSource(
            //         customerId,
            //         { source: token.id }// Use this to make this token id card default This always default first card
            //     );
            //     await stripe.customers.update(  // To make default added card
            //         customerId,
            //         {
            //             default_source: response.id
            //         }
            //     );
            //     if (response) {
            //         let cardsToUpdate = [];
            //         if (tempusers.cards && tempusers.cards.length > 0)
            //             cardsToUpdate = tempusers.cards.map(item => {
            //                 return { ...item, isDefault: false }
            //             });
            //         cardsToUpdate.push({
            //             cardId: token.card.id,
            //             last4: token.card.last4,
            //             exp_month: token.card.exp_month,
            //             exp_year: token.card.exp_year,
            //             isDefault: true
            //         })
            //         await TempUserData.updateOne({ id: tempusers.id }, { cards: cardsToUpdate });
            //         return res.status(200).json({
            //             success: true,
            //             message: constantObj.payment.CARD_ADDED, 
            //             cardId:cardsToUpdate[0].cardId
            //         });
            //     }


            // }
            else {
                 return res.status(404).json({
                     "success": false,
                     "error": {
                         "code": 404,
                         "message": constantObj.messages.NOT_AUTHORIZE
                     }
                 });
             }
         } catch (err) {
             return res.status(404).json({
                 "success": false,
                 "error": {
                     "code": 404,
                     "message": err.toString()
                 }
             });
         }
 
 
 
     },
     /**
   * 
   * @param {*} req 
   * @param {*} res 
   * @returns message
   * @description To set make card default
   * @createdBy Vibhay
   * @date 08/10/2021
   */
 
     makeDefaultToCard: async (req, res) => {
         try {
             if ((!req.body.cardId) || req.body.cardId == undefined) {
                 return res.status(404).json({
                     "success": false,
                     "error": {
                         "code": 404,
                         "message": constantObj.payment.CARD_ID
                     }
                 });
             }
             const users = await Users.findOne({ id: req.identity.id });
             if (users) {
                 if (users.cards && users.cards.length > 0) {
                     const checkExist = users.cards.filter(item => item.cardId === req.body.cardId);
                     if (checkExist && checkExist.length > 0) {
                         const response = await stripe.customers.update(
                             users.customerId,
                             { default_source: req.body.cardId }
                         );
                         if (response) {
                             const cardsToUpdate = users.cards.map(item => {
                                 if (item.cardId === req.body.cardId)
                                     return { ...item, isDefault: true }
                                 else
                                     return { ...item, isDefault: false }
                             });
                             await Users.updateOne({ id: users.id }, { cards: cardsToUpdate });
                             return res.status(200).json({
                                 success: true,
                                 message:constantObj.payment.CARD_UPDATED,
                             });
                         } else {
                             return res.status(404).json({
                                 "success": false,
                                 "error": {
                                     "code": 404,
                                     "message": constantObj.payment.CARD_UPDATION_FAIL
                                 }
                             });
                         }
 
                     } else {
                         return res.status(404).json({
                             "success": false,
                             "error": {
                                 "code": 404,
                                 "message": constantObj.messages.NOT_AUTHORIZE
                             }
                         });
                     }
                 }
                 else {
                     return res.status(404).json({
                         "success": false,
                         "error": {
                             "code": 404,
                             "message": constantObj.payment.NO_CARD
                         }
                     });
                 }
 
             } else {
                 return res.status(404).json({
                     "success": false,
                     "error": {
                         "code": 404,
                         "message": constantObj.messages.NOT_AUTHORIZE
                     }
                 });
             }
         } catch (err) {
             return res.status(404).json({
                 "success": false,
                 "error": {
                     "code": 404,
                     "message": err.toString()
                 }
             });
         }
     },
 
 
     /**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns message
 * @description To delete card
 * @createdBy Vibhay
 * @date 19/10/2021
 */
 
     deleteCard: async (req, res) => {
         try {
             if ((!req.body.cardId) || req.body.cardId == undefined) {
                 return res.status(404).json({
                     "success": false,
                     "error": {
                         "code": 404,
                         "message": constantObj.payment.CARD_ID
                     }
                 });
             }
             const users = await Users.findOne({ id: req.identity.id });
             if (users) {
                 const filterCard = users.cards.filter((card, i) => card.cardId === req.body.cardId);
                 await stripe.customers.deleteSource(
                     users.customerId,
                     filterCard[0].cardId
                 );
                 const freshCardList = users.cards.filter((card, i) => card.cardId !== filterCard[0].cardId);
                 if (filterCard[0].isDefault === true && freshCardList.length > 0) {
                     freshCardList[freshCardList.length - 1].isDefault = true;
                 }
                 const response = await Users.updateOne({ id: users.id }, { cards: freshCardList });
                 return res.status(200).json({
                     success: true,
                     message: constantObj.payment.CARD_DELETED,
                 });
             } else {
                 return res.status(404).json({
                     "success": false,
                     "error": {
                         "code": 404,
                         "message": constantObj.messages.NOT_AUTHORIZE
                     }
                 });
             }
         } catch (err) {
             return res.status(404).json({
                 "success": false,
                 "error": {
                     "code": 404,
                     "message": err.toString()
                 }
             });
         }
     },
 
 
 };

 var bookingEmail = function (options) { //email generated code
    var email = options.email,
      id = options.id;
  
    message = '';
    style = {
      header: `
        padding:30px 15px;
        text-align:center;
        background-color:#f2f2f2;
        `,
      body: `
        padding:15px;
        height: 140px;
        `,
      hTitle: `font-family: 'Raleway', sans-serif;
        font-size: 37px;
        height:auto;
        line-height: normal;
        font-weight: bold;
        background:none;
        padding:0;
        color:#333;
        `,
      maindiv: `
        width:600px;
        margin:auto;
        font-family: Lato, sans-serif;
        font-size: 14px;
        color: #333;
        line-height: 24px;
        font-weight: 300;
        border: 1px solid #eaeaea;
        `,
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
        display:inline-block;
        text-decoration:none;
        `,
      btnPrimary: `
        background-color:#3e3a6e;
        color:#fff;
        `,
      footer: `
        padding:10px 15px;
        font-weight:500;
        color:#fff;
        text-align:center;
        background-color:#000;`
    }
  
    message += `<div class="container" style="` + style.maindiv + `">
    <div class="header" style="`+ style.header + `text-align:center">
        <img src="http://74.208.206.18:4031/assets/img/logo.png" width="150" style="margin-bottom:20px;" />
        <h2 style="`+ style.hTitle + style.m0 + `">Welcome to ShakaShoots!</h2>
    </div>
    <div class="body" style="`+ style.body + `">
        <h5 style="`+ style.h5 + style.m0 + style.mb3 + style.textCenter + `">Hello ` + options.firstName + `</h5>
        <p style="`+ style.m0 + style.mb3 + style.textCenter + `margin-bottom:20px">Your booking has been successfully created!.Please click on the link to track order <br>
        Link :  <a style="text-decoration:none" href="http://74.208.206.18:4032/bookings/track/`+id+`">http://74.208.206.18:4032/bookings/track/`+id+`</a> <br></p>
  
        </div>
        <div class="footer" style="`+ style.footer + `">
        &copy 2021 ShakaShoots! All rights reserved.
        </div>
    </div>`
  
    transport.sendMail({
      from: 'ShakaShoots! <' + sails.config.appSMTP.auth.user + '>',
      to: email,
      subject: 'Registration Verification',
      html: message
    }, function (err, info) {
      console.log(err, "error", info, "info")
    });
  };

