// src/models/File.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FileModel = sequelize.define('File', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // NEW: Add mimeType field to store the file's type
    mimeType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'uploading', // uploading, processing, ready, failed
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    parsedContent: {
        type: DataTypes.JSON,
        allowNull: true,
    },
});

module.exports = FileModel;