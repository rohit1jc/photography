/**
 * Bookings.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

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

    categoryId: {
      model: 'category',
    },
    rendomId:{
      type: 'string',
    },
    planId: {
      model: 'subscriptionplan',
    },
    address: {
      type: 'string',
    },
    lat: {
      type: 'number',
    },
    long: {
      type: 'number',
    },
    dateForBooking:{
      type: "ref",
      columnType: "datetime",
    },
    description: {
      type: 'string',
    },
    acceptedBy: {
      model: 'users',
    },
    transactionId: {
      model: 'transactions',
    },
    totalperson:{
      type:"number"
    },
    extras:{
      type: "json",
      defaultsTo: [],
    },
    bookStatus: {
      type: 'string',
      isIn: ["accepted", "rejected","pending","incomplete","cancel"],
      defaultsTo: 'incomplete'
    },
    isDeleted: {
      type: 'Boolean',
      defaultsTo: false
    },
    bookBy: {
      model: 'users',
    },
    deletedBy: {
      model: "users",
    },
    deletedAt: {
      type: "ref",
      columnType: "datetime",
    },
    updatedAt: {
      type: "ref",
      autoUpdatedAt: true,
    },
    createdAt: {
      type: 'ref',
      autoCreatedAt: true
    },


  },

};

