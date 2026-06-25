-- Created a Database
CREATE DATABASE github_analyzer;
USE github_analyzer;

-- Created a Users Table (for storing GitHub profiles)
CREATE TABLE github_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    avatar_url VARCHAR(500),
    bio TEXT,
    public_repos INT DEFAULT 0,
    followers INT DEFAULT 0,
    following INT DEFAULT 0,
    total_stars INT DEFAULT 0,
    total_forks INT DEFAULT 0,
    total_watchers INT DEFAULT 0,
    languages_used TEXT,
    top_repositories TEXT,
    account_age_days INT,
    profile_created_at DATETIME,
    profile_updated_at DATETIME,
    last_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_last_analyzed (last_analyzed)
);

-- Created a Analysis History Table
CREATE TABLE analysis_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    repository_count INT,
    follower_count INT,
    following_count INT,
    stars_count INT,
    forks_count INT,
    watchers_count INT,
    languages VARCHAR(1000),
    top_repos VARCHAR(1000),
    analysis_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (username) REFERENCES github_profiles(username) ON DELETE CASCADE,
    INDEX idx_username (username),
    INDEX idx_analysis_timestamp (analysis_timestamp)
);

-- Data for testing purposes
INSERT INTO github_profiles (username, avatar_url, bio, public_repos, followers, following) 
VALUES ('octocat', 'https://avatars.githubusercontent.com/u/583231?v=4', 'GitHub mascot', 8, 1000, 10);

Select * FROM github_profiles;

SELECT id, username, public_repos, followers, profile_created_at, profile_updated_at 
FROM github_profiles 
WHERE username = 'octocat';

SELECT id, username, public_repos, followers, following, total_stars, last_analyzed 
FROM github_profiles;

SELECT * FROM github_profiles WHERE username = 'octocat';
SELECT * FROM analysis_history WHERE username = 'octocat';

SELECT COUNT(*) as total_profiles FROM github_profiles;
SELECT DISTINCT username FROM github_profiles;

SELECT username, public_repos, followers, total_stars 
FROM github_profiles;