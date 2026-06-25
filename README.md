# 🚀 GitHub Profile Analyzer API

A powerful RESTful API that analyzes GitHub user profiles, extracts valuable insights, and stores them in a MySQL database. Built with Node.js, Express, and MySQL.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This API connects to the GitHub Public API to fetch user profile data, analyzes it to extract meaningful insights (repository count, followers, top languages, popular repositories, account age, etc.), and stores everything in a MySQL database. It provides RESTful endpoints to access this data.

**What Makes This API Special:**
- 📊 **Comprehensive Analysis**: Extracts 15+ data points from GitHub profiles
- 🗄️ **Persistent Storage**: Stores all data in MySQL with history tracking
- 🔍 **Smart Insights**: Calculates popularity scores, language distribution, and more
- 🛠️ **Debug Tools**: Built-in endpoints for testing and troubleshooting
- 🔒 **Secure**: Uses environment variables for sensitive data

---

## ✨ Features

### Core Features (Required)
- ✅ Fetch public GitHub profile data using username
- ✅ Store public repository count
- ✅ Store followers/following count
- ✅ Store analysis results in MySQL database
- ✅ API to fetch all analyzed profiles
- ✅ API to fetch data of a single profile

### Extra Features (Added)
- 🎯 **Total Stars & Forks**: Aggregate counts from all repositories
- 🌐 **Language Analysis**: Identifies most used programming languages
- ⭐ **Top Repositories**: Lists repositories with most stars
- 📅 **Account Age**: Calculates days since account creation
- 📊 **Popularity Score**: Algorithm-based scoring (followers, repos, stars, forks)
- 📝 **Analysis History**: Tracks every profile analysis with timestamps
- 🔧 **Debug Endpoints**: Test GitHub API connectivity and user existence
- 🔍 **User Search**: Search GitHub for users
- 💚 **Health Check**: API status monitoring
- 🛡️ **Error Handling**: Comprehensive error responses for all scenarios

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v14+ | JavaScript runtime |
| Express.js | 4.18.2 | Web framework |
| MySQL | 8.0+ | Database |
| GitHub API | v3 | External data source |
| Axios | 1.6.0 | HTTP client |
| mysql2 | 3.6.0 | MySQL driver |
| dotenv | 16.3.0 | Environment variables |
| cors | 2.8.5 | CORS middleware |
| Nodemon | 3.0.1 | Development auto-reload |

---

## 📁 Project Structure

```
github-profile-analyzer/
│
├── src/
│   ├── config/
│   │   └── database.js          # MySQL connection pool
│   │
│   ├── controllers/
│   │   ├── profileController.js # Main business logic
│   │   └── debugController.js   # Debug/test endpoints
│   │
│   ├── models/
│   │   └── profileModel.js      # Database operations
│   │
│   ├── routes/
│   │   └── profileRoutes.js     # API route definitions
│   │
│   ├── services/
│   │   └── githubService.js     # GitHub API integration
│   │
│   ├── app.js                   # Express app configuration
│   └── server.js                # Server entry point
│
├── .env                         # Environment variables (NOT committed)
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Locked dependencies
├── Github project.sql           # Database schema
├── README.md                    # Project documentation
├── test.js                      # Test script
└── test-api.js                  # API test script
```

---

## 🗄️ Database Schema

### Table 1: github_profiles
Stores main profile data with unique username constraint.

```sql
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
```

### Table 2: analysis_history
Tracks every profile analysis with timestamp.

```sql
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
```

---

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/github-profile-analyzer.git
cd github-profile-analyzer
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Then edit `.env` with your credentials:
```env
PORT=5000

# MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=github_analyzer

# GitHub API
GITHUB_API_URL=https://api.github.com
# Optional: GITHUB_TOKEN=your_github_personal_access_token
```

### Step 4: Set Up Database
Import the database schema:
```bash
mysql -u root -p < Github\ project.sql
```

Or manually in MySQL Workbench:
```sql
CREATE DATABASE github_analyzer;
USE github_analyzer;
-- Run all CREATE TABLE statements from Github project.sql
```

### Step 5: Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

### Step 6: Verify Installation
Open your browser and navigate to:
```
http://localhost:5000/health
```
You should see:
```json
{
    "status": "OK",
    "message": "GitHub Profile Analyzer API is running"
}
```

---

## 🌐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `DB_HOST` | MySQL host | Yes | localhost |
| `DB_USER` | MySQL username | Yes | root |
| `DB_PASSWORD` | MySQL password | Yes | - |
| `DB_NAME` | Database name | Yes | github_analyzer |
| `GITHUB_API_URL` | GitHub API URL | No | https://api.github.com |
| `GITHUB_TOKEN` | GitHub personal access token | No | - |

> **⚠️ Important**: Never commit `.env` file to version control. `.env.example` is provided as a template.

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5000
```

### 1. Health Check
Check if the API is running.
```
GET /health
```
**Response:**
```json
{
    "status": "OK",
    "message": "GitHub Profile Analyzer API is running"
}
```

### 2. Analyze GitHub Profile
Fetches and analyzes a GitHub user profile, then saves it to the database.
```
GET /api/analyze/:username
```
**Example:**
```
GET /api/analyze/octocat
```
**Response:**
```json
{
    "success": true,
    "message": "Profile for octocat analyzed successfully",
    "data": {
        "profile": {
            "username": "octocat",
            "avatar_url": "https://avatars.githubusercontent.com/u/583231?v=4",
            "bio": "No bio available",
            "public_repos": 8,
            "followers": 23072,
            "following": 9,
            "total_stars": 21600,
            "total_forks": 165069,
            "total_watchers": 21600,
            "languages_used": "CSS(1), HTML(1), Ruby(1)",
            "top_repositories": "Spoon-Knife(13856⭐), Hello-World(3654⭐), octocat.github.io(1116⭐), hello-worId(759⭐), linguist(725⭐)",
            "account_age_days": 5628,
            "profile_created_at": "2011-01-26 00:14:36",
            "profile_updated_at": "2026-06-22 17:02:20"
        },
        "history": [...]
    }
}
```

### 3. Get All Profiles
Retrieves all analyzed profiles from the database.
```
GET /api/profiles
```
**Response:**
```json
{
    "success": true,
    "count": 3,
    "data": [
        {
            "id": 1,
            "username": "octocat",
            "avatar_url": "...",
            "public_repos": 8,
            "followers": 23072,
            "following": 9,
            "total_stars": 21600,
            "account_age_days": 5628,
            "last_analyzed": "2026-06-24T..."
        }
    ]
}
```

### 4. Get Single Profile
Retrieves a specific profile with analysis history.
```
GET /api/profile/:username
```
**Example:**
```
GET /api/profile/octocat
```
**Response:**
```json
{
    "success": true,
    "data": {
        "profile": { ... },
        "recent_analysis": [ ... ]
    }
}
```

### 5. Get Profile Statistics
Retrieves statistics including popularity score.
```
GET /api/stats/:username
```
**Example:**
```
GET /api/stats/octocat
```
**Response:**
```json
{
    "success": true,
    "data": {
        "username": "octocat",
        "total_repos": 8,
        "total_followers": 23072,
        "total_following": 9,
        "total_stars": 21600,
        "total_forks": 165069,
        "total_watchers": 21600,
        "account_age_days": 5628,
        "languages": "CSS(1), HTML(1), Ruby(1)",
        "top_repositories": "Spoon-Knife(13856⭐), Hello-World(3654⭐), octocat.github.io(1116⭐), hello-worId(759⭐), linguist(725⭐)",
        "popularity_score": 278080,
        "last_analyzed": "2026-06-24T..."
    }
}
```

### 6. Debug: Test GitHub User
Check if a GitHub user exists.
```
GET /api/debug/test/:username
```
**Example:**
```
GET /api/debug/test/octocat
```

### 7. Debug: Test Connection
Test GitHub API connectivity.
```
GET /api/debug/connection
```

### 8. Debug: Search GitHub
Search for GitHub users.
```
GET /api/debug/search?q=octo
```

---

## 🧪 Testing

### Using cURL Commands
```bash
# Health Check
curl http://localhost:5000/health

# Analyze Profile
curl http://localhost:5000/api/analyze/octocat

# Analyze Multiple Users
curl http://localhost:5000/api/analyze/torvalds
curl http://localhost:5000/api/analyze/google
curl http://localhost:5000/api/analyze/microsoft

# Get All Profiles
curl http://localhost:5000/api/profiles

# Get Single Profile
curl http://localhost:5000/api/profile/octocat

# Get Statistics
curl http://localhost:5000/api/stats/octocat

# Debug: Test User
curl http://localhost:5000/api/debug/test/octocat

# Debug: Search
curl http://localhost:5000/api/debug/search?q=octo
```

### Using Postman
1. Import the Postman collection
2. Test each endpoint with sample requests
3. Save responses for verification

### Using Browser
Simply type the URLs in your browser:
```
http://localhost:5000/api/analyze/octocat
http://localhost:5000/api/profiles
```

### MySQL Verification
```sql
-- Check all profiles in database
USE github_analyzer;
SELECT * FROM github_profiles;

-- Check specific user
SELECT * FROM github_profiles WHERE username = 'octocat';

-- Check analysis history
SELECT * FROM analysis_history;

-- Check history for specific user
SELECT * FROM analysis_history WHERE username = 'octocat';

-- Get summary stats
SELECT 
    COUNT(*) as total_users,
    AVG(followers) as avg_followers,
    AVG(public_repos) as avg_repos,
    SUM(total_stars) as total_stars
FROM github_profiles;
```

### Run Test Scripts
```bash
# Run the test script
node test.js

# Run API test script
node test-api.js
```

---

## 🚀 Deployment

### Deploy to Render
1. Push your code to GitHub
2. Create an account at [render.com](https://render.com)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure environment variables
6. Click "Create Web Service"

### Deploy to Railway
1. Push your code to GitHub
2. Create an account at [railway.app](https://railway.app)
3. Click "Deploy from GitHub"
4. Select your repository
5. Add MySQL plugin
6. Configure environment variables
7. Deploy

### Deploy to Heroku
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create Heroku app
heroku create github-profile-analyzer

# Add MySQL add-on
heroku addons:create cleardb:ignite

# Set environment variables
heroku config:set DB_HOST=...
heroku config:set DB_USER=...
heroku config:set DB_PASSWORD=...
heroku config:set DB_NAME=...

# Deploy
git push heroku main
```

---

## 🔍 Troubleshooting

### Common Issues & Solutions

#### 1. MySQL Connection Error
```
Error: ER_ACCESS_DENIED_ERROR
```
**Solution**: Check `.env` credentials and ensure MySQL is running.
```bash
# Check MySQL status
sudo systemctl status mysql  # Linux
brew services list            # Mac

# Test connection
mysql -u root -p
```

#### 2. GitHub API Rate Limit
```
Error: GitHub API rate limit exceeded
```
**Solution**: Wait 60 minutes or add a GitHub token.
```env
GITHUB_TOKEN=your_personal_access_token
```

#### 3. User Not Found
```
Error: User "username" not found on GitHub
```
**Solution**: Use valid GitHub usernames like `octocat`, `torvalds`, `google`, `microsoft`.

#### 4. Port Already in Use
```
Error: EADDRINUSE: address already in use :::5000
```
**Solution**: Change port in `.env` file.
```env
PORT=5001
```

#### 5. Date Format Error
```
Error: Incorrect datetime value
```
**Solution**: This is automatically handled by the model's date conversion method.

#### 6. Node Modules Not Found
```
Error: Cannot find module 'express'
```
**Solution**: Reinstall dependencies.
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Package.json Scripts

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  }
}
```

---

## 🔒 Git & .env Protection

### .gitignore File
```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Node modules
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Operating system files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Logs
logs/
*.log

# Database files
*.sqlite
*.db

# Build files
dist/
build/
```

### Pushing to GitHub
```bash
# Initialize git
git init

# Add all files (except those in .gitignore)
git add .

# Check .env is NOT included
git status

# Commit
git commit -m "Initial commit: GitHub Profile Analyzer API"

# Create repository on GitHub
# Then push
git remote add origin https://github.com/YOUR_USERNAME/github-profile-analyzer.git
git branch -M main
git push -u origin main
```

---

## 📊 Sample API Response

### Complete Analysis Response
```json
{
    "success": true,
    "message": "Profile for octocat analyzed successfully",
    "data": {
        "profile": {
            "username": "octocat",
            "avatar_url": "https://avatars.githubusercontent.com/u/583231?v=4",
            "bio": "No bio available",
            "public_repos": 8,
            "followers": 23072,
            "following": 9,
            "total_stars": 21600,
            "total_forks": 165069,
            "total_watchers": 21600,
            "languages_used": "CSS(1), HTML(1), Ruby(1)",
            "top_repositories": "Spoon-Knife(13856⭐), Hello-World(3654⭐), octocat.github.io(1116⭐), hello-worId(759⭐), linguist(725⭐)",
            "account_age_days": 5628,
            "profile_created_at": "2011-01-26 00:14:36",
            "profile_updated_at": "2026-06-22 17:02:20"
        },
        "history": [
            {
                "id": 1,
                "username": "octocat",
                "repository_count": 8,
                "follower_count": 23072,
                "following_count": 9,
                "stars_count": 21600,
                "forks_count": 165069,
                "watchers_count": 21600,
                "languages": "CSS(1), HTML(1), Ruby(1)",
                "top_repos": "Spoon-Knife(13856⭐), Hello-World(3654⭐), octocat.github.io(1116⭐), hello-worId(759⭐), linguist(725⭐)",
                "analysis_timestamp": "2026-06-24T..."
            }
        ]
    }
}
```

---

## 🎯 Project Deliverables Checklist

- ✅ Source code repository with complete API implementation
- ✅ Live API endpoints accessible for testing
- ✅ Postman collection shared via email or accessible through a shared link
- ✅ README file with setup instructions
- ✅ Database schema/export (Github project.sql)
- ✅ All required features implemented
- ✅ Extra features added for improvement
- ✅ Proper error handling
- ✅ Environment variables for security
- ✅ Debug endpoints for testing

---

## 📞 Support & Contact

For any issues or questions, please:
1. Check the troubleshooting section above
2. Review the code documentation
3. Create an issue on GitHub
4. Contact the developer

---

## 📄 License

This project is licensed under the ISC License.

---

## 🙏 Acknowledgments

- GitHub API for providing the data
- Node.js and Express communities
- MySQL for reliable database management

---

**🎉 Thank you for using GitHub Profile Analyzer API!**