/**
 * SubscriptionPlan.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  schema:true,
  primaryKey: "id",
  attributes: {
    name: {
      type: "string",
    },
    description: {
      type: "string",
    },
    price: {
      type: "number",
    },
    totalHours: {
      type: "string",
    },
    editingPhotos: {
      type: "string",
    },
    category: {
      model: "category",
    },
    // image: {
    //   type: "string",
    // },
    // featured: {
    //   type: "string",
    //   isIn: ["Yes", "No"],
    //   defaultsTo: "No",
    // },
    // featuredDescription: {
    //   type: "json",
    //   defaultsTo: [],
    // },    
    status: {
      type: "string",
      isIn: ["active", "deactive"],
      defaultsTo: "active",
    },
    deletedBy: {
      model: "users",
    },
    deletedAt: {
      type: "ref",
      columnType: "datetime",
    },
    isDeleted: {
      type: "boolean",
      defaultsTo: false,
    },
    updatedBy: {
      model: "users",
    },
    createdAt: {
      type: "ref",
      autoCreatedAt: true,
    },  
  },
};

