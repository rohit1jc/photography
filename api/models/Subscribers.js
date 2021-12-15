module.exports = {
  primaryKey: 'id',
  attributes: {

    email: {
      type: 'string',
      isEmail: true,
    },

    status: {
      type: 'string',
      isIn: ['active', 'deactive'],
      defaultsTo: 'active'
    },
    deletedBy: {
      model: 'users'
    },
    deletedAt: {
      type: 'ref',
      columnType: 'datetime'
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    },
    updatedBy: {
      model: 'users'
    },
    createdAt: {
      type: 'ref',
      autoCreatedAt: true
    },

    updatedAt: {
      type: 'ref',
      autoUpdatedAt: true
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

