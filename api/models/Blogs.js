/**
 * Crops.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */


 module.exports = {
  attributes: {
    title: {
          type: 'string',
          required: true
      },
      description : {
          type:'string',
          required: true
      },
      categoryID :{
          model:'category'
      },
      image:{
          type:'string'
      },
      status: {
          type: 'string',
          isIn: ['active', 'deactive'],
          defaultsTo:'active'
      },
      createdAt: {
        type: 'ref',
        autoCreatedAt: true
      },
        updatedAt: {
          type: 'ref',
          autoUpdatedAt: true
      },
      addedBy:{
        model:'users'
      },
      updatedBy:{
        model:'users'
      },
      isDeleted: {
          type: 'Boolean',
          defaultsTo: false
      },
      deletedBy : {
          model:'users'
      },
      deletedAt:{
        type: 'ref',
        columnType: 'datetime'
      }
}
};
