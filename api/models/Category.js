/**
 * Category.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  primaryKey: 'id',
  schema:true,
  attributes: {

    name: {
      type: 'string',
    },
  
    image: {
        type: 'string',
        defaultsTo: ""
    },

    parentCategory: {
      model: 'Category',      
    },

    cat_type:{
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

