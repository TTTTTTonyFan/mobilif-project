# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a macOS development environment containing the MobiLiF project - a gamified social platform for CrossFit training communities. The project consists of:

- Backend API (NestJS/Node.js)
- Mini-program frontend
- Admin dashboard
- Deployment scripts for cloud servers

## Project Structure

```
~/Desktop/mobilif-project/
├── src/                     # Backend source code
├── scripts/                 # Utility and deployment scripts
├── mobile-simulator/        # Mobile device simulator
├── config/                  # Configuration files
├── docs/                    # Documentation
├── tests/                   # Test files
├── prisma/                  # Database schema
├── frontend/                # Frontend code
├── UI Design/               # UI design files
└── 需求文档/                # Requirements documents

~/Desktop/MobiLiF项目/
├── 后端代码/       # Backend API code
├── 小程序代码/     # WeChat mini-program code
├── 管理后台/       # Admin dashboard
└── 启动项目.command  # Local startup script

~/Downloads/
├── mobilif_prd.md           # Product requirements document
├── function_flows_prd.md    # Function flow documentation
└── mobilif_app_prototype.html  # App prototype
```

## Common Commands

### Backend Development
```bash
# Navigate to project directory
cd ~/Desktop/mobilif-project

# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Start with PM2
pm2 start dist/main.js --name mobilif-api
```

### Mobile Simulator
```bash
# Run web-based mobile simulator
npm run mobile-simulator

# Run iOS simulator with Xcode
npm run ios
npm run xcode
npm run ios-simulator
```

### Mini-program Development
```bash
# Navigate to mini-program directory
cd ~/Desktop/MobiLiF项目/小程序代码

# Install dependencies (if using npm)
npm install

# Open in WeChat DevTools for development
# WeChat AppID: wx0a950fd30b3c2146
```

### Database Operations
```bash
# Connect to MySQL (if installed locally)
mysql -u root -p

# Common database commands
USE mobilif_db;
SHOW TABLES;

# Run database tests
npm run test:db-connection
```

## High-Level Architecture

### Backend Architecture
- **Framework**: NestJS with TypeScript
- **Database**: MySQL for persistent data, Redis for caching/sessions
- **Authentication**: JWT-based with passport
- **API Style**: RESTful API with potential GraphQL support

### Key Business Domains
1. **User Management**: Registration, authentication, profiles
2. **Gym/Box Management**: Location-based discovery, facility info
3. **Class Booking**: Real-time scheduling, payment integration
4. **Gamification System**: Points, achievements, skill trees
5. **Social Features**: Community challenges, leaderboards
6. **Drop-in Support**: Easy access for traveling CrossFit enthusiasts

### Frontend Architecture
- **Mini-program**: WeChat mini-program for mobile access
- **Admin Dashboard**: Web-based management interface
- **Real-time Features**: WebSocket for live updates during classes
- **Mobile Simulator**: Local development tool for testing mobile UI

## Deployment Information

The project includes deployment scripts for cloud servers:
- `deploy_mobilif_yum.sh`: Complete deployment script for CentOS/RHEL
- `install_mysql.sh`: MySQL installation and configuration
- Target server: Alibaba Cloud (8.147.235.48)
- Database password: MobiLiF@2025!

## Important Notes

1. **Project Location**: Main project is now at `~/Desktop/mobilif-project`
2. **WeChat Integration**: The mini-program uses WeChat AppID `wx0a950fd30b3c2146`
3. **Database Naming**: Primary database is `mobilif_db` with UTF-8 encoding
4. **Security**: Always use environment variables for sensitive data
5. **API Endpoints**: Follow RESTful conventions with `/api/` prefix

## Development Workflow

1. Check current git status before making changes
2. Create feature branches for new development
3. Test locally before deploying
4. Use PM2 for production process management
5. Monitor logs in `/var/www/mobilif/logs/` on production

## Mobile Testing

### iOS Simulator (Xcode)
```bash
# Quick start
npm run ios

# Interactive device selection
bash scripts/start-xcode-simulator.sh

# Quick test
bash scripts/quick-ios-test.sh
```

### Web-based Simulator
```bash
# Start local simulator
npm run mobile-simulator

# Access at http://localhost:8080
```