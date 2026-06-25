const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testDebugEndpoints() {
    console.log('🧪 Testing GitHub Profile Analyzer API\n');
    
    // Test the usernames - these are known to exist
    const testUsers = ['octocat', 'torvalds', 'google'];
    
    try {
        // 1. Testing the Connection
        console.log('1️⃣ Testing GitHub API Connection...');
        const connection = await axios.get(`${BASE_URL}/api/debug/connection`);
        console.log('✅ Connection:', connection.data.message);
        console.log();
        
        // 2. Testing the each user 
        for (const username of testUsers) {
            console.log(`2️⃣ Testing user: ${username}...`);
            try {
                const result = await axios.get(`${BASE_URL}/api/debug/test/${username}`);
                console.log(`✅ User found: ${result.data.data.username}`);
                console.log(`   📊 Repos: ${result.data.data.public_repos}`);
                console.log(`   👥 Followers: ${result.data.data.followers}`);
                console.log();
            } catch (error) {
                if (error.response) {
                    console.log(`❌ ${error.response.data.message}`);
                    console.log(`   Suggestion: ${error.response.data.suggestion || ''}`);
                    console.log();
                }
            }
        }
        
        // 3. Testing the Search
        console.log('3️⃣ Testing GitHub Search...');
        const search = await axios.get(`${BASE_URL}/api/debug/search?q=octo`);
        console.log(`✅ Found ${search.data.data.length} users`);
        search.data.data.slice(0, 3).forEach((user, i) => {
            console.log(`   ${i+1}. ${user.username}`);
        });
        console.log();
        
        // 4. Testing the Analyze (with real user)
        console.log('4️⃣ Testing Analyze with octocat...');
        try {
            const analyze = await axios.get(`${BASE_URL}/api/analyze/octocat`);
            console.log('✅ Analysis successful!');
            console.log(`   Profile saved: ${analyze.data.data.profile.username}`);
            console.log(`   Languages: ${analyze.data.data.profile.languages_used}`);
        } catch (error) {
            console.log('❌ Analysis failed:', error.response?.data?.message || error.message);
        }
        console.log();
        
        // 5. Testing the Get Profiles
        console.log('5️⃣ Fetching all profiles...');
        const profiles = await axios.get(`${BASE_URL}/api/profiles`);
        console.log(`✅ Found ${profiles.data.count} profiles in database`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('\n📌 Make sure the server is running:');
            console.log('   npm run dev');
        }
    }
}

// Running the tests
testDebugEndpoints();