const pool = require('../config/database');

class ProfileModel {
    // Helper method to convert ISO date to MySQL datetime format
    formatDateForMySQL(dateString) {
        if (!dateString) return null;
        
        try {
            // Handle the ISO format: '2011-01-25T18:44:36Z'
            // Convert to MySQL format: '2011-01-25 18:44:36'
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                console.warn('Invalid date:', dateString);
                return null;
            }
            
            // Format as ('YYYY-MM-DD HH:MM:SS')
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return null;
        }
    }

    async saveProfile(profileData) {
        try {
            // Formating the dates for MySQL
            const created_at = this.formatDateForMySQL(profileData.profile_created_at);
            const updated_at = this.formatDateForMySQL(profileData.profile_updated_at);

            // Logs for debugging
            console.log('📝 Saving profile data:', {
                username: profileData.username,
                created_at: created_at,
                updated_at: updated_at
            });

            const query = `
                INSERT INTO github_profiles 
                (username, avatar_url, bio, public_repos, followers, following, 
                 total_stars, total_forks, total_watchers, languages_used, 
                 top_repositories, account_age_days, profile_created_at, profile_updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                avatar_url = VALUES(avatar_url),
                bio = VALUES(bio),
                public_repos = VALUES(public_repos),
                followers = VALUES(followers),
                following = VALUES(following),
                total_stars = VALUES(total_stars),
                total_forks = VALUES(total_forks),
                total_watchers = VALUES(total_watchers),
                languages_used = VALUES(languages_used),
                top_repositories = VALUES(top_repositories),
                account_age_days = VALUES(account_age_days),
                profile_created_at = VALUES(profile_created_at),
                profile_updated_at = VALUES(profile_updated_at),
                last_analyzed = CURRENT_TIMESTAMP
            `;

            const values = [
                profileData.username || 'unknown',
                profileData.avatar_url || '',
                profileData.bio || '',
                profileData.public_repos || 0,
                profileData.followers || 0,
                profileData.following || 0,
                profileData.total_stars || 0,
                profileData.total_forks || 0,
                profileData.total_watchers || 0,
                profileData.languages_used || '',
                profileData.top_repositories || '',
                profileData.account_age_days || 0,
                created_at,
                updated_at
            ];

            const [result] = await pool.query(query, values);
            console.log('✅ Profile saved successfully:', profileData.username);
            return profileData.username;
            
        } catch (error) {
            console.error('❌ Error in saveProfile:', error);
            console.error('Data that caused error:', profileData);
            throw error;
        }
    }

    async saveAnalysisHistory(username, analysisData) {
        try {
            const query = `
                INSERT INTO analysis_history 
                (username, repository_count, follower_count, following_count, 
                 stars_count, forks_count, watchers_count, languages, top_repos)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                username || 'unknown',
                analysisData.public_repos || 0,
                analysisData.followers || 0,
                analysisData.following || 0,
                analysisData.total_stars || 0,
                analysisData.total_forks || 0,
                analysisData.total_watchers || 0,
                analysisData.languages_used || '',
                analysisData.top_repositories || ''
            ];

            await pool.query(query, values);
            console.log('✅ Analysis history saved for:', username);
            
        } catch (error) {
            console.error('❌ Error in saveAnalysisHistory:', error);
            throw error;
        }
    }

    async getAllProfiles() {
        try {
            const query = `
                SELECT id, username, avatar_url, public_repos, followers, 
                       following, total_stars, account_age_days, last_analyzed,
                       languages_used, top_repositories
                FROM github_profiles
                ORDER BY last_analyzed DESC
            `;
            const [rows] = await pool.query(query);
            return rows;
            
        } catch (error) {
            console.error('❌ Error in getAllProfiles:', error);
            throw error;
        }
    }

    async getProfileByUsername(username) {
        try {
            const query = `
                SELECT * FROM github_profiles 
                WHERE username = ?
            `;
            const [rows] = await pool.query(query, [username]);
            return rows[0];
            
        } catch (error) {
            console.error('❌ Error in getProfileByUsername:', error);
            throw error;
        }
    }

    async getProfileAnalysisHistory(username) {
        try {
            const query = `
                SELECT * FROM analysis_history 
                WHERE username = ?
                ORDER BY analysis_timestamp DESC
                LIMIT 10
            `;
            const [rows] = await pool.query(query, [username]);
            return rows;
            
        } catch (error) {
            console.error('❌ Error in getProfileAnalysisHistory:', error);
            throw error;
        }
    }

    // Get profiles with filters (optional)
    async getProfilesWithFilters(filters = {}) {
        try {
            let query = `
                SELECT id, username, avatar_url, public_repos, followers, 
                       following, total_stars, account_age_days, last_analyzed
                FROM github_profiles
                WHERE 1=1
            `;
            
            const values = [];
            
            if (filters.minFollowers) {
                query += ' AND followers >= ?';
                values.push(filters.minFollowers);
            }
            
            if (filters.minRepos) {
                query += ' AND public_repos >= ?';
                values.push(filters.minRepos);
            }
            
            if (filters.language) {
                query += ' AND languages_used LIKE ?';
                values.push(`%${filters.language}%`);
            }
            
            query += ' ORDER BY last_analyzed DESC LIMIT 50';
            
            const [rows] = await pool.query(query, values);
            return rows;
            
        } catch (error) {
            console.error('❌ Error in getProfilesWithFilters:', error);
            throw error;
        }
    }

    // Delete the old profiles (cleanup if required)
    async deleteOldProfiles(daysOld = 30) {
        try {
            const query = `
                DELETE FROM github_profiles 
                WHERE last_analyzed < DATE_SUB(NOW(), INTERVAL ? DAY)
                AND id NOT IN (
                    SELECT id FROM analysis_history 
                    WHERE analysis_timestamp > DATE_SUB(NOW(), INTERVAL 7 DAY)
                    LIMIT 1
                )
            `;
            const [result] = await pool.query(query, [daysOld]);
            console.log(`🗑️ Deleted ${result.affectedRows} old profiles`);
            return result.affectedRows;
            
        } catch (error) {
            console.error('❌ Error in deleteOldProfiles:', error);
            throw error;
        }
    }
}

module.exports = new ProfileModel();