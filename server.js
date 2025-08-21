const express = require('express');
const { sequelize } = require('./src/config/database');
const fileRoutes = require('./src/routes/fileRoutes');
const fs = require('fs');

// --- Configuration ---
const PORT = process.env.PORT || 3000;
const UPLOAD_DIRECTORY = './uploads';

const app = express();

// --- Middleware ---
app.use(express.json());

// --- API Routes ---
// All file-related routes will be prefixed with /api/files
app.use('/api/files', fileRoutes);

// --- Server Start ---
const startServer = async () => {
    try {
        // Ensure upload directory exists
        if (!fs.existsSync(UPLOAD_DIRECTORY)) {
            fs.mkdirSync(UPLOAD_DIRECTORY);
        }

        await sequelize.sync({ force: false });
        console.log('Database synchronized successfully.');

        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start the server:', error);
    }
};

startServer();