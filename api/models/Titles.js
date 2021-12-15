/**
  * Title.js
*/
module.exports = {
  schema: true,
  primaryKey: 'id',
  attributes: {
      name: {
          type: 'string',
      },
      userType:{
        type: 'string',
      },
      status: {
          type: 'string',
          isIn: ['active', 'deactive'],
          defaultsTo: 'active'
      },
      isDeleted: {
          type: 'Boolean',
          defaultsTo: false
      },
      deletedBy:{
        model:'users'
      },
      deletedAt:{
        type: 'ref',
         columnType: 'datetime'
      },
      updatedBy:{
        model:'users'
      },
      addedBy: {
          model: 'Users'
      },
      createdAt: {
        type: 'ref',
        autoCreatedAt: true
      },
      updatedAt: {
        type: 'ref',
        autoUpdatedAt: true
      },

  }
};

