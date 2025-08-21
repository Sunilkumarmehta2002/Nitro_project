// src/services/fileProcessor.js
const fs = require('fs');
const path = require('path');
const FileModel = require('../models/File');
const pdf = require('pdf-parse'); // <-- NEW: Import pdf-parse

const UPLOAD_DIRECTORY = './uploads';

// The function now accepts the full database file object
const parseFileAndUpdateDB = async (dbFile) => {
    const { id, filename, mimeType } = dbFile;
    const filepath = path.join(UPLOAD_DIRECTORY, `${id}_${filename}`);
    
    console.log(`[Background Task] Started processing for file ID: ${id} (${mimeType})`);
    
    try {
        await FileModel.update({ status: 'processing', progress: 50 }, { where: { id } });
        
        let parsedContent = {};

        // NEW: Use a switch statement to handle different file types
        switch (mimeType) {
            case 'text/csv':
                console.log(`[Background Task] Parsing CSV file: ${id}`);
                const fileContent = fs.readFileSync(filepath, 'utf8');
                const rows = fileContent.split('\n').filter(Boolean);
                const headers = rows.shift().split(',');
                const jsonData = rows.map(row => {
                    const values = row.split(',');
                    return headers.reduce((obj, header, index) => {
                        obj[header.trim()] = values[index] ? values[index].trim() : '';
                        return obj;
                    }, {});
                });
                parsedContent = { type: 'csv_data', data: jsonData };
                break;

            case 'application/pdf':
                console.log(`[Background Task] Parsing PDF file: ${id}`);
                const dataBuffer = fs.readFileSync(filepath);
                const pdfData = await pdf(dataBuffer);
                parsedContent = {
                    type: 'pdf_data',
                    info: pdfData.info, // PDF Metadata
                    text: pdfData.text.substring(0, 2000) // Store first 2000 chars of text
                };
                break;
            
            // You can add more cases here for images, etc.
            // case 'image/jpeg':
            //     // Use a library like 'sharp' to get image dimensions
            //     break;

            default:
                console.warn(`[Background Task] Unsupported file type: ${mimeType} for file ${id}`);
                throw new Error(`Unsupported file type: ${mimeType}`);
        }
        
        await FileModel.update({
            parsedContent: parsedContent,
            status: 'ready',
            progress: 100,
        }, { where: { id } });

        console.log(`[Background Task] Successfully processed file ID: ${id}`);
    } catch (error) {
        console.error(`[Background Task] Error processing file ${id}:`, error);
        await FileModel.update({ status: 'failed', progress: 0, parsedContent: { error: error.message } }, { where: { id } });
    }
};

module.exports = { parseFileAndUpdateDB };