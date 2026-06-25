const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 GitHub Profile Analyzer API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`👤 Analyze profile: http://localhost:${PORT}/api/analyze/:username`);
    console.log(`📋 All profiles: http://localhost:${PORT}/api/profiles`);
});