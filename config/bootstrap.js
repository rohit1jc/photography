/**
 * Seed Function
 * (sails.config.bootstrap)
 *
 * A function that runs just before your Sails app gets lifted.
 * > Need more flexibility?  You can also create a hook.
 *
 * For more information on seeding your app with fake data, check out:
 * https://sailsjs.com/config/bootstrap
 */
 const cron = require('node-cron');
 var client = require('twilio')(
  "ACa12d75672b18ac175431de84c62078c6",
  "4fe3c3dab8189fe3b7004a4d1e6535bf"
);
module.exports.bootstrap = async function(cb) {

  // By convention, this is a good place to set up fake data during development.
  //
  // For example:
  // ```
  // // Set up fake development data (or if we already have some, avast)
  // if (await User.count() > 0) {
  //   return;
  // }
  //
  // await User.createEach([
  //   { emailAddress: 'ry@example.com', fullName: 'Ryan Dahl', },
  //   { emailAddress: 'rachael@example.com', fullName: 'Rachael Shaw', },
  //   // etc.
  // ]);
  // ```
  process.env.TZ = 'Asia/Kolkata';
  ( () => cron.schedule('* * * * *', async() =>{  
    await Bookings.find().populate("acceptedBy").then(bookings => {
      bookings.forEach(async (booking,index) =>{
        Date.prototype.addHours= function(h){
          this.setHours(this.getHours()+h);
          return this;
      }
      
      var addeddate=new Date().addHours(72);

      var compairdate = new Date(addeddate)
      console.log(compairdate);
      var bookingdate = new Date(booking.dateForBooking)
      function datetime(d){
      var date = d.getDate();
      var month = d.getMonth(); //Be careful! January is 0 not 1
      var year = d.getFullYear();
      var hour = d.getHours();
      var minutes = d.getMinutes();
      return date + "-" +(month + 1) + "-" + year + " " + hour + ":" + minutes; 
      
      }
      var compairdatetime = datetime(compairdate);
      var bookdate = datetime(bookingdate);
      if(compairdatetime==bookdate){
        if(booking.acceptedBy!=null){
          await client.messages.create({
          from: +18733002624,
          to: booking.acceptedBy.mobileNo,
          body:  `You have a booking !.Please click on the link to check booking http://74.208.206.18:4032/bookings/track/`+booking.rendomId
          }).then((message) => console.log(message.sid));
        }
      }
        
      });

    });
    }))(null, true, 'IST');

    cb();

};
