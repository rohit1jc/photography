module.exports.cron = {
  myFirstJob: {
    schedule: '* */10 * * * *',
    onTick: function () {
      // var query={};
      // query.role='employee'
      // Users.find(query).exec((err, users) => {
      //   console.log(users,'users====');
      // });



      // console.log('You will see this every second');

    }
  }
};
