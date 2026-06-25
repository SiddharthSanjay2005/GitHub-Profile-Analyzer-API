const mysql = require('mysql2/promise');
const axios = require('axios');
require('dotenv').config();

async function testMySQLConnection() {
    console.log('🔄 Testing MySQL connection...');
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'github_analyzer'
        });
        
        console.log('✅ MySQL connection successful!');
        
        // Checking if a tables exist
        const [tables] = await connection.query(
            "SHOW TABLES LIKE 'github_profiles'"
        );
        
        if (tables.length > 0) {
            console.log('✅ Table "github_profiles" exists');
            
            // Check if there's any data
            const [count] = await connection.query(
                "SELECT COUNT(*) as total FROM github_profiles"
            );
            console.log(`📊 Total profiles in database: ${count[0].total}`);
            
        } else {
            console.log('⚠️  Table "github_profiles" does not exist. Please run the SQL script.');
        }
        
        await connection.end();
        return true;
    } catch (error) {
        console.error('❌ MySQL connection failed:', error.message);
        console.log('\n📌 Troubleshooting tips:');
        console.log('1. Is MySQL running? (Check in Task Manager/Services)');
        console.log('2. Check your .env file for correct credentials');
        console.log('3. Verify the database name "github_analyzer" exists');
        console.log('4. Try connecting with: mysql -u root -p');
        return false;
    }
}

async function testGitHubAPI(username) {
    console.log(`\n🔄 Testing GitHub API for user: ${username}...`);
    try {
        const response = await axios.get(`https://api.github.com/users/${username}`, {
            headers: {
                'User-Agent': 'GitHub-Profile-Analyzer-Test',
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        console.log(`✅ User found: ${response.data.login}`);
        console.log(`📊 Public repos: ${response.data.public_repos}`);
        console.log(`👥 Followers: ${response.data.followers}`);
        console.log(`👤 Following: ${response.data.following}`);
        console.log(`📅 Account created: ${response.data.created_at}`);
        return true;
    } catch (error) {
        console.error(`❌ GitHub API error for "${username}":`, error.message);
        if (error.response && error.response.status === 404) {
            console.log(`📌 User "${username}" does not exist on GitHub.`);
            console.log('Try these usernames: octocat, torvalds, google, microsoft, facebook');
        } else if (error.response && error.response.status === 403) {
            console.log('📌 GitHub API rate limit exceeded. Please wait a moment.');
        }
        return false;
    }
}

async function testAPIEndpoints(baseURL) {
    console.log('\n🔄 Testing API endpoints...');
    
    const endpoints = [
        { name: 'Health Check', url: '/health' },
        { name: 'Analyze octocat', url: '/api/analyze/octocat' },
        { name: 'Get All Profiles', url: '/api/profiles' },
        { name: 'Get octocat Profile', url: '/api/profile/octocat' },
        { name: 'Get octocat Stats', url: '/api/stats/octocat' },
        { name: 'Debug Test octocat', url: '/api/debug/test/octocat' },
        { name: 'Debug Connection', url: '/api/debug/connection' }
    ];
    
    let successCount = 0;
    
    for (const endpoint of endpoints) {
        try {
            const response = await axios.get(`${baseURL}${endpoint.url}`);
            console.log(`✅ ${endpoint.name}: ${response.status} - Success`);
            successCount++;
        } catch (error) {
            if (error.response) {
                console.log(`❌ ${endpoint.name}: ${error.response.status} - ${error.response.data?.message || error.message}`);
            } else if (error.code === 'ECONNREFUSED') {
                console.log(`❌ ${endpoint.name}: Server not running`);
                console.log('📌 Make sure the server is running: npm run dev');
                break;
            } else {
                console.log(`❌ ${endpoint.name}: ${error.message}`);
            }
        }
    }
    
    console.log(`\n📊 Endpoints tested: ${successCount}/${endpoints.length} successful`);
    return successCount === endpoints.length;
}

async function runTests() {
    console.log('🚀 Running Setup Tests...\n');
    console.log('📋 Current Configuration:');
    console.log(`DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
    console.log(`DB_USER: ${process.env.DB_USER || 'root'}`);
    console.log(`DB_NAME: ${process.env.DB_NAME || 'github_analyzer'}`);
    console.log(`PORT: ${process.env.PORT || 5000}\n`);
    
    // Testing MySQL
    const dbOk = await testMySQLConnection();
    
    // Testing the GitHub API with known good user
    const gitOk = await testGitHubAPI('octocat');
    
    // Testing the API endpoints
    const baseURL = `http://localhost:${process.env.PORT || 5000}`;
    console.log(`\n📡 Testing API at: ${baseURL}`);
    const apiOk = await testAPIEndpoints(baseURL);
    
    // Summary results
    console.log('\n' + '='.repeat(50));
    console.log('📋 Test Results Summary:');
    console.log('='.repeat(50));
    console.log(`MySQL Connection    : ${dbOk ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`GitHub API          : ${gitOk ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`API Endpoints       : ${apiOk ? '✅ PASSED' : '⚠️  PARTIAL'}`);
    console.log('='.repeat(50));
    
    if (dbOk && gitOk && apiOk) {
        console.log('\n🎉 All tests passed! Your API is ready to use! 🎉');
        console.log('\n📌 Next Steps:');
        console.log('1. Analyze more users: GET /api/analyze/username');
        console.log('2. View all profiles: GET /api/profiles');
        console.log('3. Check MySQL data: SELECT * FROM github_profiles;');
        console.log('4. Deploy to production (optional)');
    } else if (dbOk && gitOk) {
        console.log('\n⚠️  MySQL and GitHub API are working, but some API endpoints failed.');
        console.log('📌 Make sure the server is running: npm run dev');
    } else if (dbOk) {
        console.log('\n⚠️  MySQL is working but GitHub API has issues.');
        console.log('📌 Check:');
        console.log('1. Internet connection');
        console.log('2. GitHub API status');
        console.log('3. Username exists on GitHub');
    } else if (gitOk) {
        console.log('\n⚠️  GitHub API is working but MySQL has issues.');
        console.log('📌 Check:');
        console.log('1. MySQL is running');
        console.log('2. Credentials in .env file');
        console.log('3. Database "github_analyzer" exists');
    } else {
        console.log('\n❌ Multiple issues detected. Please fix the problems above.');
        console.log('📌 Common solutions:');
        console.log('1. Check MySQL installation and credentials');
        console.log('2. Check internet connection for GitHub API');
        console.log('3. Verify .env file configuration');
        console.log('4. Run: npm install to reinstall dependencies');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('🏁 Tests Complete!');
    console.log('='.repeat(50));
}

// Running the tests
runTests().catch(error => {
    console.error('❌ Test runner error:', error);
});