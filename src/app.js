const express = require('express');
const cors = require('cors');
const profileRoutes = require('./routes/profileRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', profileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'GitHub Profile Analyzer API is running'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        name: 'GitHub Profile Analyzer API',
        version: '1.0.0',
        endpoints: {
            analyze: '/api/analyze/:username',
            allProfiles: '/api/profiles',
            singleProfile: '/api/profile/:username',
            stats: '/api/stats/:username',
            health: '/health'
        }
    });
});

// TO handle errors in middleware (Error Handling)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

module.exports = app;