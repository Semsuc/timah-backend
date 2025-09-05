const mongoose = require('mongoose');

const allowedFileTypes = [
  'pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'audio/mpeg',
  'video/mp4',
  // add more as needed
];

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation', // optional, create Conversation model if implementing groups
      default: null,
    },

    subject: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    attachments: [
      {
        fileUrl: { type: String },
        fileType: {
          type: String,
          enum: allowedFileTypes,
        },
      },
    ],

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    isImportant: {
      type: Boolean,
      default: false,
    },

    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// You can add compound indexes if needed, e.g.,
// messageSchema.index({ receiver: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
