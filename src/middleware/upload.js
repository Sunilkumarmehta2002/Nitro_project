// src/middleware/upload.js
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIRECTORY = './uploads';

// Define allowed file types
const ALLOWED_MIMETYPES = ['text/csv', 'application/pdf', 'image/jpeg', 'image/png'];

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIRECTORY);
    },
    filename: (req, file, cb) => {
        const uniquePrefix = uuidv4();
        req.fileId = uniquePrefix;
        req.originalFilename = file.originalname;
        cb(null, `${uniquePrefix}_${file.originalname}`);
    }
});

// NEW: Add the fileFilter function
const fileFilter = (req, file, cb) => {
    if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
        cb(null, true); // Accept the file
    } else {
        // Reject the file and pass an error
        cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types are: ${ALLOWED_MIMETYPES.join(', ')}`), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter // Add the fileFilter here
});

module.exports = upload;