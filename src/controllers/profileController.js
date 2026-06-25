const githubService = require('../services/githubService');
const profileModel = require('../models/profileModel');

class ProfileController {
    async analyzeAndSaveProfile(req, res) {
        try {
            const { username } = req.params;
            
            if (!username) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username is required.' 
                });
            }

            const cleanUsername = username.trim().toLowerCase();
            console.log(`📊 Analyzing profile for: ${cleanUsername}`);

            const exists = await githubService.userExists(cleanUsername);
            if (!exists) {
                return res.status(404).json({
                    success: false,
                    message: `User "${cleanUsername}" not found on GitHub.`,
                    suggestion: 'Try usernames like: octocat, torvalds, google'
                });
            }

            const analysisData = await githubService.analyzeProfile(cleanUsername);
            await profileModel.saveProfile(analysisData);
            await profileModel.saveAnalysisHistory(cleanUsername, analysisData);
            const history = await profileModel.getProfileAnalysisHistory(cleanUsername);
            
            res.status(200).json({
                success: true,
                message: `Profile for ${cleanUsername} analyzed successfully`,
                data: {
                    profile: analysisData,
                    history: history
                }
            });
            
        } catch (error) {
            console.error('❌ Error in analyzeAndSaveProfile:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to analyze profile.'
            });
        }
    }

    async getAllProfiles(req, res) {
        try {
            const profiles = await profileModel.getAllProfiles();
            
            if (profiles.length === 0) {
                return res.status(200).json({
                    success: true,
                    message: 'No profiles found.',
                    count: 0,
                    data: []
                });
            }
            
            res.status(200).json({
                success: true,
                count: profiles.length,
                data: profiles
            });
        } catch (error) {
            console.error('❌ Error in getAllProfiles:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profiles.'
            });
        }
    }

    async getSingleProfile(req, res) {
        try {
            const { username } = req.params;
            
            if (!username) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is required'
                });
            }

            const cleanUsername = username.trim().toLowerCase();
            const profile = await profileModel.getProfileByUsername(cleanUsername);
            
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: `Profile for "${cleanUsername}" not found.`,
                    suggestion: `Use GET /api/analyze/${cleanUsername} to analyze this user`
                });
            }

            const history = await profileModel.getProfileAnalysisHistory(cleanUsername);

            res.status(200).json({
                success: true,
                data: {
                    profile: profile,
                    recent_analysis: history
                }
            });
            
        } catch (error) {
            console.error('❌ Error in getSingleProfile:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profile.'
            });
        }
    }

    async getProfileStats(req, res) {
        try {
            const { username } = req.params;
            
            if (!username) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is required'
                });
            }

            const cleanUsername = username.trim().toLowerCase();
            console.log(`📊 Fetching stats for: ${cleanUsername}`);
            
            const profile = await profileModel.getProfileByUsername(cleanUsername);
            
            if (!profile) {
                return res.status(404).json({
                    success: false,
                    message: `Profile for "${cleanUsername}" not found`,
                    suggestion: `Use GET /api/analyze/${cleanUsername} to analyze this user first`
                });
            }

            // Calculate popularity score directly here (no separate method)
            let popularityScore = 0;
            popularityScore += (profile.followers || 0) * 10;
            popularityScore += (profile.public_repos || 0) * 5;
            popularityScore += (profile.total_stars || 0) * 2;
            popularityScore += (profile.total_forks || 0) * 3;
            popularityScore = Math.min(1000, popularityScore);

            // Calculate the additional stats
            const stats = {
                username: profile.username,
                total_repos: profile.public_repos || 0,
                total_followers: profile.followers || 0,
                total_following: profile.following || 0,
                total_stars: profile.total_stars || 0,
                total_forks: profile.total_forks || 0,
                total_watchers: profile.total_watchers || 0,
                account_age_days: profile.account_age_days || 0,
                languages: profile.languages_used || 'No languages detected',
                top_repositories: profile.top_repositories || 'No repositories',
                popularity_score: popularityScore,
                last_analyzed: profile.last_analyzed
            };

            res.status(200).json({
                success: true,
                data: stats
            });
            
        } catch (error) {
            console.error('❌ Error in getProfileStats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch profile stats',
                error: error.message
            });
        }
    }
}

module.exports = new ProfileController();