const FileModel = require('../models/File');
const { parseFileAndUpdateDB } = require('../services/fileProcessor');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIRECTORY = './uploads';

// POST /api/files
// src/controllers/fileController.js

// In the exports.uploadFile function:
exports.uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded. Please use the "file" field.' });
    }

    try {
        const dbFile = await FileModel.create({
            id: req.fileId,
            filename: req.originalFilename,
            mimeType: req.file.mimetype, // <-- ADD THIS LINE
        });

        // Pass the entire dbFile object to the processor
        parseFileAndUpdateDB(dbFile);

        res.status(202).json({
            id: dbFile.id,
            filename: dbFile.filename,
            status: dbFile.status,
            createdAt: dbFile.createdAt,
        });
    } catch (error) {
        console.error("Error during file upload:", error);
        res.status(500).json({ message: 'Error creating file record.' });
    }
};

// GET /api/files/:file_id/progress
exports.getFileProgress = async (req, res) => {
    try {
        const dbFile = await FileModel.findByPk(req.params.file_id, {
            attributes: ['id', 'status', 'progress']
        });
        if (!dbFile) {
            return res.status(404).json({ message: 'File not found' });
        }
        res.json({
            file_id: dbFile.id,
            status: dbFile.status,
            progress: dbFile.progress
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/files/:file_id
exports.getParsedFile = async (req, res) => {
    try {
        const dbFile = await FileModel.findByPk(req.params.file_id);
        if (!dbFile) {
            return res.status(404).json({ message: 'File not found' });
        }

        if (dbFile.status === 'ready') {
            res.json({
                id: dbFile.id,
                filename: dbFile.filename,
                content: dbFile.parsedContent
            });
        } else if (dbFile.status === 'failed') {
            res.status(500).json({ message: 'File processing failed.' });
        } else {
            res.status(202).json({ message: `File processing is not complete. Status: ${dbFile.status}` });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/files
exports.getAllFiles = async (req, res) => {
    try {
        const files = await FileModel.findAll({
            attributes: ['id', 'filename', 'status', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });
        res.json(files);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/files/:file_id
exports.deleteFile = async (req, res) => {
    try {
        const dbFile = await FileModel.findByPk(req.params.file_id);
        if (!dbFile) {
            return res.status(404).json({ message: 'File not found' });
        }

        const filepath = path.join(UPLOAD_DIRECTORY, `${dbFile.id}_${dbFile.filename}`);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        await dbFile.destroy();
        res.status(200).json({ message: `File deleted successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};