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
      
      isEditable: {
          type: 'boolean',
          defaultsTo: true
      },

      permission:{
          type:'json',
          defaultsTo:[]
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
      addedBy: {
          model: 'Users'
      },
      status: {
        type: 'string',
        isIn: ['active', 'deactive'],
        defaultsTo: 'active'
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

