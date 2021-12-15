module.exports = {
  primaryKey: 'id',
  autocreatedAt : true,
  autoupdatedAt : true,

  attributes: {
      name:{
          type: 'json',
          required: true
      },
      status: {
          type: 'string',
          isIn: ['active', 'deactive'],
          defaultsTo: 'active'
      },

  }
};

