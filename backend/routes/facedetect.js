const express = require('express');
const { detectFaces, getHistory, deleteDetection } = require('../controllers/faceController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/detect', verifyToken, detectFaces);
router.get('/history/:userId', verifyToken, getHistory);
router.delete('/delete/:detectionId', verifyToken, deleteDetection);

module.exports = router;