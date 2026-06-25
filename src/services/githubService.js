const axios = require('axios');
require('dotenv').config();

class GitHubService {
    constructor() {
        this.baseURL = process.env.GITHUB_API_URL || 'https://api.github.com';
        
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHub-Profile-Analyzer-App'
        };
        
        // Add a GitHub token if available
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }
        
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: headers,
            timeout: 10000
        });
    }

    async getUserProfile(username) {
        try {
            // Clean the username
            username = username.trim().toLowerCase();
            
            if (!username) {
                throw new Error('Username is required');
            }
            
            console.log(`🔍 Fetching GitHub user: ${username}`);
            
            // Making the API request
            const response = await this.client.get(`/users/${username}`);
            
            if (!response.data || !response.data.login) {
                throw new Error('Invalid response from GitHub API');
            }
            
            console.log(`✅ Found user: ${response.data.login}`);
            return response.data;
            
        } catch (error) {
            console.error('GitHub API Error Details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data
            });
            
            // Handling the specific error cases
            if (error.response) {
                switch (error.response.status) {
                    case 404:
                        throw new Error(`User "${username}" not found on GitHub. Please check the username spelling.`);
                    case 403:
                        throw new Error('GitHub API rate limit exceeded. Please wait a moment and try again.');
                    case 401:
                        throw new Error('GitHub API authentication failed. Please check your token.');
                    case 422:
                        throw new Error('Invalid username format. Please use a valid GitHub username.');
                    default:
                        throw new Error(`GitHub API error (${error.response.status}): ${error.response.statusText}`);
                }
            } else if (error.request) {
                throw new Error('Network error: Could not reach GitHub API. Check your internet connection.');
            } else {
                throw new Error(`Error: ${error.message}`);
            }
        }
    }

    async getUserRepositories(username) {
        try {
            username = username.trim().toLowerCase();
            
            console.log(`📦 Fetching repositories for: ${username}`);
            
            const response = await this.client.get(`/users/${username}/repos`, {
                params: {
                    sort: 'updated',
                    per_page: 100,
                    type: 'public'
                }
            });
            
            console.log(`✅ Found ${response.data.length} repositories`);
            return response.data;
            
        } catch (error) {
            console.error('Repository fetch error:', error.message);
            
            if (error.response && error.response.status === 404) {
                return []; // User exists but has no public repos
            }
            
            throw new Error(`Failed to fetch repositories: ${error.message}`);
        }
    }

    async analyzeProfile(username) {
        try {
            // Clean username
            username = username.trim().toLowerCase();
            
            if (!username) {
                throw new Error('Username is required for analysis');
            }
            
            console.log(`\n🚀 Starting analysis for: ${username}`);
            
            // Fetching the user profile
            const profile = await this.getUserProfile(username);
            
            // Fetching  repositories
            const repos = await this.getUserRepositories(username);
            
            // Calculate the insights
            const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
            const totalForks = repos.reduce((sum, repo) => sum + (repo.forks_count || 0), 0);
            const totalWatchers = repos.reduce((sum, repo) => sum + (repo.watchers_count || 0), 0);
            
            // Getting the languages used
            const languages = {};
            repos.forEach(repo => {
                if (repo.language) {
                    languages[repo.language] = (languages[repo.language] || 0) + 1;
                }
            });
            
            // Sorting the languages by frequency
            const sortedLanguages = Object.entries(languages)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([lang, count]) => `${lang}(${count})`)
                .join(', ');
            
            // Get top repositories by stars
            const topRepos = repos
                .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
                .slice(0, 5)
                .map(repo => `${repo.name}(${repo.stargazers_count || 0}⭐)`)
                .join(', ');
            
            // Calculating the account age
            const accountCreated = new Date(profile.created_at);
            const accountAgeDays = Math.floor((Date.now() - accountCreated.getTime()) / (1000 * 60 * 60 * 24));
            
            const analysisData = {
                username: profile.login,
                avatar_url: profile.avatar_url || '',
                bio: profile.bio || 'No bio available',
                public_repos: profile.public_repos || 0,
                followers: profile.followers || 0,
                following: profile.following || 0,
                total_stars: totalStars || 0,
                total_forks: totalForks || 0,
                total_watchers: totalWatchers || 0,
                languages_used: sortedLanguages || 'No languages detected',
                top_repositories: topRepos || 'No repositories',
                account_age_days: accountAgeDays || 0,
                profile_created_at: profile.created_at || new Date(),
                profile_updated_at: profile.updated_at || new Date()
            };
            
            console.log('✅ Analysis complete for:', username);
            console.log(`   Repositories: ${analysisData.public_repos}`);
            console.log(`   Followers: ${analysisData.followers}`);
            console.log(`   Languages: ${analysisData.languages_used}`);
            
            return analysisData;
            
        } catch (error) {
            console.error('❌ Analysis error:', error.message);
            throw error;
        }
    }

    // Helper method to test if a specific user exists
    async userExists(username) {
        try {
            username = username.trim().toLowerCase();
            const response = await this.client.head(`/users/${username}`);
            return response.status === 200;
        } catch (error) {
            return false;
        }
    }

    // Search for users (for debugging purposes)
    async searchUsers(query) {
        try {
            const response = await this.client.get('/search/users', {
                params: {
                    q: query,
                    per_page: 5
                }
            });
            return response.data.items;
        } catch (error) {
            console.error('Search error:', error.message);
            return [];
        }
    }
}

module.exports = new GitHubService();