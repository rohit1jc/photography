/**
 * Settings.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

    // autoCreatedAt: true,
    // autoUpdatedAt: true,
    attributes: {
      bankDetails:{
        type:'json'  
      },

    createdAt: {
        type: 'ref',
        autoCreatedAt: true
      },
      updatedAt: {
        type: 'ref',
        autoUpdatedAt: true
      },
    },
  
  };
  
  