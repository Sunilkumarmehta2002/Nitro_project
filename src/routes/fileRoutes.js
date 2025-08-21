const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const upload = require('../middleware/upload');

// Route to handle file uploads
router.post('/', upload.single('file'), fileController.uploadFile);

// Route to get a list of all files
router.get('/', fileController.getAllFiles);

// Route to check the progress of a specific file
router.get('/:file_id/progress', fileController.getFileProgress);

// Route to get the content of a specific file
router.get('/:file_id', fileController.getParsedFile);

// Route to delete a specific file
router.delete('/:file_id', fileController.deleteFile);

module.exports = router;