module.exports = {
  primaryKey: 'id',

  attributes: {
    email: {
      type: 'string',
    },
    message: {
      type: 'string',
    },
    title: {
      type: 'string',
    },

    is_reply: {
      type: 'string',
      isIn: ['no', 'yes'],
      defaultsTo: 'no'
    },
    // feedback_id: {
    //   model: 'Feedback'
    // },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false
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

