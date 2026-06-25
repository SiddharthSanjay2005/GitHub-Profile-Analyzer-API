const githubService = require('../services/githubService');

class DebugController {
    async testGitHubUser(req, res) {
        try {
            const { username } = req.params;
            
            if (!username) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is required'
                });
            }

            const cleanUsername = username.trim().toLowerCase();
            
            console.log(`🔍 Debug: Checking user "${cleanUsername}" on GitHub...`);
            
            try {
                const profile = await githubService.getUserProfile(cleanUsername);
                
                return res.status(200).json({
                    success: true,
                    message: `User "${cleanUsername}" exists on GitHub`,
                    data: {
                        username: profile.login,
                        name: profile.name,
                        avatar_url: profile.avatar_url,
                        public_repos: profile.public_repos,
                        followers: profile.followers,
                        following: profile.following,
                        created_at: profile.created_at,
                        bio: profile.bio,
                        location: profile.location,
                        email: profile.email,
                        blog: profile.blog,
                        company: profile.company,
                        html_url: profile.html_url
                    }
                });
            } catch (error) {
                return res.status(404).json({
                    success: false,
                    message: `User "${cleanUsername}" not found on GitHub`,
                    error: error.message,
                    suggestion: 'Try these test usernames: octocat, torvalds, google, microsoft, facebook'
                });
            }
            
        } catch (error) {
            console.error('Debug error:', error);
            return res.status(500).json({
                success: false,
                message: 'Debug error occurred',
                error: error.message
            });
        }
    }

    async testConnection(req, res) {
        try {
            // Test the GitHub API connection
            const testResult = await githubService.getUserProfile('octocat');
            
            return res.status(200).json({
                success: true,
                message: 'GitHub API connection successful',
                data: {
                    test_user: 'octocat',
                    status: 'connected',
                    rate_limit_remaining: 'Check headers for details'
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'GitHub API connection failed',
                error: error.message
            });
        }
    }

    async searchGitHub(req, res) {
        try {
            const { q } = req.query;
            
            if (!q) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required',
                    example: '/api/debug/search?q=octo'
                });
            }

            const results = await githubService.searchUsers(q);
            
            return res.status(200).json({
                success: true,
                message: `Found ${results.length} users matching "${q}"`,
                data: results.map(user => ({
                    username: user.login,
                    avatar: user.avatar_url,
                    type: user.type,
                    score: user.score
                }))
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Search failed',
                error: error.message
            });
        }
    }
}

module.exports = new DebugController();