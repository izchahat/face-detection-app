const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalImage: {
    type: String, // base64 or URL
    required: true
  },
  resultImage: {
    type: String, // base64 or URL with bounding boxes
    required: true
  },
  facesDetected: {
    type: Number,
    default: 0
  },
  faceCoordinates: [{
    x: Number,
    y: Number,
    width: Number,
    height: Number
  }],
  detectionMethod: {
    type: String,
    default: 'face-api.js'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('History', historySchema);