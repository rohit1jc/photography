/**
 * Transactions.js
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

    userId: {
      model: 'users',
      required: true
    },
    bookingId: {
      model: 'bookings',
      required: true
    },
    refund: {
      type: "string",
      isIn: ["no", "yes","request","decline"],
      defaultsTo: "no",
    },
    chargeId: {
      type: 'string',
    },
    transactionId: {
      type: 'string',
    },
    amount: {
      type: 'string',
    },
    transactionStatus: {
      type: 'string',
    },
    currency: {
      type: 'string'
    },
    // transactionDate: {
    //   type: 'string',
    // },
    description: {
      type: 'string'
    },
    receiptUrl: {
      type: 'string',
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

