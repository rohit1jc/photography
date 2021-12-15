/**
 * PhotographerDetails.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  schema: true,
  attributes: {

    //  ╔═╗╦═╗╦╔╦╗╦╔╦╗╦╦  ╦╔═╗╔═╗
    //  ╠═╝╠╦╝║║║║║ ║ ║╚╗╔╝║╣ ╚═╗
    //  ╩  ╩╚═╩╩ ╩╩ ╩ ╩ ╚╝ ╚═╝╚═╝


    //  ╔═╗╔╦╗╔╗ ╔═╗╔╦╗╔═╗
    //  ║╣ ║║║╠╩╗║╣  ║║╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝═╩╝╚═╝


    //  ╔═╗╔═╗╔═╗╔═╗╔═╗╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣╚═╗╚═╗║ ║║  ║╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╚═╝╚═╝╩╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝

    cameraId: {
      model: 'accessories'
    },
    lensId: {
      model: 'accessories'
    },
    categoryId:{
      model:'category'
    },
    images: {
      type: 'json',
      defaultsTo:[]
    },
    accessories: {
      type: 'json',
      defaultsTo:[]
    },
    isVerified: {
      type: "string",
      isIn: ["accepted", "rejected","pending","incomplete"],
      defaultsTo: "incomplete",
    }, 
    verifiedBy:{
      model:'users'
    },
    isDeleted: {
      type: "Boolean",
      defaultsTo: false,
    },
    addedBy: {
      model: "users",
    },

    deletedBy: {
      model: "users",
    },

    deletedAt: {
      type: "ref",
      columnType: "datetime",
    },

    updatedBy: {
      model: "users",
    },

    createdAt: {
      type: "ref",
      autoCreatedAt: true,
    },

    updatedAt: {
      type: "ref",
      autoUpdatedAt: true,
    },

  },

};

