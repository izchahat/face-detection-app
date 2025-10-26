const History = require('../models/History');
const axios = require('axios');

// Detect faces (uses Python service or client-side data)
exports.detectFaces = async (req, res) => {
  try {
    const { userId } = req.user || {};
    const { originalImage, resultImage, facesDetected, faceCoordinates } = req.body;

    if (!userId || !originalImage || !resultImage) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save detection to database
    const history = new History({
      userId,
      originalImage,
      resultImage,
      facesDetected: facesDetected || 0,
      faceCoordinates: faceCoordinates || []
    });

    await history.save();

    res.status(201).json({
      message: 'Face detection saved',
      detection: history
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user detection history
exports.getHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const history = await History.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      count: history.length,
      history
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a detection record
exports.deleteDetection = async (req, res) => {
  try {
    const { detectionId } = req.params;
    const { userId } = req.user || {};

    const detection = await History.findById(detectionId);
    if (!detection) {
      return res.status(404).json({ error: 'Detection not found' });
    }

    if (detection.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await History.findByIdAndDelete(detectionId);

    res.json({ message: 'Detection deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};