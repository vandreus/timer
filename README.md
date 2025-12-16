# MOLCOM INC. Time Tracker

A comprehensive time tracking system for managing work hours across multiple worksites and projects.

## Features

### Core Features
- ✅ **User Authentication** - JWT-based secure login
- ✅ **Time Tracking** - Clock in/out or manual entry with 15-minute rounding
- ✅ **Worksite Management** - Google Maps integration for addresses
- ✅ **Project Management** - Multiple projects per worksite
- ✅ **Task Management** - Assignable tasks to time entries
- ✅ **Photo Upload** - Optional photos with time entries
- ✅ **Geolocation** - Automatic worksite suggestion (100m radius)
- ✅ **Break Tracking** - Preset break options (0, 15, 30, 60 minutes)
- ✅ **Calendar View** - Interactive calendar with daily/weekly totals
- ✅ **Reporting** - Advanced filtering and PDF/CSV export
- ✅ **Admin Portal** - Complete management interface
- 🚧 **Weekly Reminders** - Automated missing hours notifications (planned)

### Technology Stack

**Backend:**
- Node.js 18+ with Express.js
- PostgreSQL 15+ database
- Sequelize ORM
- JWT authentication
- Google Maps API integration
- Image processing with Sharp
- PDF generation with PDFKit

**Frontend:**
- React 18+ with Vite
- TailwindCSS for styling
- React Router for navigation
- FullCalendar for calendar views
- Axios for API communication

**Deployment:**
- Docker & Docker Compose
- Coolify compatible
- Nginx for frontend
- Persistent volumes for data

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Google Maps API key ([Get one here](https://developers.google.com/maps/documentation/javascript/get-api-key))
- Domain name pointing to your server (timer.molcom.ca)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/vandreus/timer.git
cd timer
```

2. **Configure environment variables:**

Create a `.env` file in the root directory:

```env
# Database
DB_NAME=timetracker
DB_USER=timetracker
DB_PASSWORD=your_secure_password_here

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRES_IN=24h

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Application
NODE_ENV=production
CORS_ORIGIN=https://timer.molcom.ca

# File Upload
MAX_FILE_SIZE=5242880
REMINDER_ENABLED=true
REMINDER_CRON_SCHEDULE=0 8 * * 1
```

3. **Build and start services:**
```bash
docker-compose up -d
```

4. **Check service health:**
```bash
docker-compose ps
docker-compose logs -f backend
```

5. **Create admin account:**
```bash
docker-compose exec backend npm run setup-admin
```

Follow the prompts to create your admin user.

6. **Access the application:**
- Frontend: http://localhost (or your domain)
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

## Coolify Deployment

### Step 1: Connect GitHub Repository

1. Log in to your Coolify instance
2. Create a new project or select existing
3. Add a new resource → Git Repository
4. Connect to `https://github.com/vandreus/timer`
5. Select `main` branch

### Step 2: Configure Application

1. Coolify will detect `docker-compose.yml`
2. Select "Docker Compose" as deployment type
3. Set your domain: `timer.molcom.ca`

### Step 3: Environment Variables

Add these environment variables in Coolify:

**Required:**
```
DB_PASSWORD=your_secure_database_password
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**Optional:**
```
CORS_ORIGIN=https://timer.molcom.ca
NODE_ENV=production
REMINDER_ENABLED=true
```

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Coolify will automatically:
   - Build Docker images
   - Create database with persistent volume
   - Setup SSL certificate (Let's Encrypt)
   - Configure reverse proxy

### Step 5: Create Admin Account

After successful deployment:

1. Access Coolify terminal for backend container
2. Run: `npm run setup-admin`
3. Enter your admin credentials
4. Login at https://timer.molcom.ca

## Configuration

### Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable these APIs:
   - Geocoding API
   - Maps JavaScript API (for future features)
4. Create credentials → API Key
5. Restrict API key:
   - Application restrictions: HTTP referrers
   - Add your domain: `timer.molcom.ca/*`
   - API restrictions: Select only Geocoding API
6. Copy API key to `.env` file

### Time Entry Settings

- **Time Rounding:** All entries rounded to nearest 15 minutes (0.25 hours)
- **Break Options:** None (0), 15 minutes, 30 minutes, 1 hour
- **Geolocation Radius:** 100 meters for worksite suggestions
- **Overlap Prevention:** System prevents overlapping time entries
- **Active Timer:** Only one active timer allowed per user

### Date & Time Formats

- **Date Format:** DD/MM/YYYY
- **Time Format:** 24-hour (HH:MM)
- **Timezone:** Server timezone (configure in Docker if needed)

## Usage

### Admin Tasks

**User Management:**
1. Login as admin
2. Navigate to Admin → Users
3. Click "Add User"
4. Enter username, password, full name
5. Set admin status if needed
6. Users can only be managed by admins

**Worksite Setup:**
1. Navigate to Admin → Worksites
2. Click "Add Worksite"
3. Enter name and start typing address
4. Google Maps will autocomplete and geocode
5. Save worksite

**Project Management:**
1. Navigate to Admin → Projects
2. Select a worksite
3. Click "Add Project"
4. Enter project name and description
5. Toggle active/inactive status

**Task Library:**
1. Navigate to Admin → Tasks
2. Create reusable task types
3. Examples: "Installation", "Maintenance", "Inspection"
4. Tasks can be assigned to any time entry

### Employee Tasks

**Clock In/Out:**
1. Login to dashboard
2. Click "Clock In"
3. Select worksite (or use geolocation suggestion)
4. Select project
5. Start timer
6. When done, click "Clock Out"
7. Select break time
8. Choose tasks performed
9. Add notes and photo (optional)

**Manual Entry:**
1. Navigate to Time Entries
2. Click "Add Entry"
3. Fill in date, start time, end time
4. Select break duration
5. Choose worksite and project
6. Select tasks and add notes
7. Upload photo if needed
8. Submit

**View History:**
1. Navigate to Calendar
2. View entries by month/week/day
3. Click entry to see details
4. Edit or delete your own entries

### Reporting

**Generate Reports:**
1. Login as admin
2. Navigate to Reports
3. Set filters:
   - Date range
   - User
   - Worksite
   - Project
   - Task
4. Click "Generate Report"
5. View summary statistics
6. Export as PDF or CSV

**PDF Export:**
- Includes MOLCOM INC. header
- Shows all filtered entries
- Summary statistics
- Optional: Include photos

**CSV Export:**
- Raw data for Excel/Google Sheets
- All time entry details
- Easy for further analysis

## API Documentation

### Authentication

**POST** `/api/auth/login`
```json
{
  "username": "admin",
  "password": "password"
}
```

**GET** `/api/auth/me` (requires auth token)

### Time Entries

**GET** `/api/time-entries`
- Query params: `userId`, `startDate`, `endDate`

**POST** `/api/time-entries`
```json
{
  "worksiteId": "uuid",
  "projectId": "uuid",
  "startTime": "2025-12-16T08:00:00Z",
  "endTime": "2025-12-16T16:00:00Z",
  "breakMinutes": 30,
  "notes": "Completed foundation work",
  "taskIds": ["uuid1", "uuid2"],
  "photo": "file upload"
}
```

**GET** `/api/time-entries/active`
- Returns current active timer

**PUT** `/api/time-entries/:id/clock-out`
**PUT** `/api/time-entries/:id`
**DELETE** `/api/time-entries/:id`

See backend code for complete API documentation.

## Data Backup

### Automatic Backups (Coolify)

Coolify can automatically backup Docker volumes. Configure in Coolify settings.

### Manual Backup

**Database:**
```bash
docker-compose exec database pg_dump -U timetracker timetracker > backup.sql
```

**Restore:**
```bash
cat backup.sql | docker-compose exec -T database psql -U timetracker timetracker
```

**Uploads (Photos/Logos):**
```bash
docker cp molcom-timer-backend:/app/uploads ./uploads-backup
```

### Export All Data (Admin Portal)

1. Login as admin
2. Navigate to Settings
3. Click "Export All Data"
4. Download JSON file
5. Store securely

## Troubleshooting

### Backend won't start

**Check logs:**
```bash
docker-compose logs backend
```

**Common issues:**
- Database not ready: Wait a few seconds and restart
- Invalid DATABASE_URL: Check environment variables
- Port 3000 in use: Change PORT in .env

### Frontend can't connect to backend

**Check:**
1. `VITE_API_URL` in frontend .env
2. CORS_ORIGIN in backend .env matches frontend URL
3. Both containers are running: `docker-compose ps`

### Photos not uploading

**Check:**
1. uploads volume is mounted correctly
2. File size under 5MB
3. File type is image (jpg, png, gif, heic)
4. Disk space available

### Google Maps not working

**Verify:**
1. API key is correct
2. Geocoding API is enabled
3. Billing is enabled in Google Cloud
4. API key restrictions allow your domain

### Database connection issues

**Solutions:**
1. Verify database container is healthy:
   ```bash
   docker-compose ps database
   ```
2. Check credentials in .env match docker-compose.yml
3. Restart database:
   ```bash
   docker-compose restart database
   ```

## Development

### Local Development Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with local database credentials
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with VITE_API_URL=http://localhost:3000/api
npm run dev
```

### Run Tests

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## Project Structure

```
timer/
├── backend/
│   ├── src/
│   │   ├── config/          # Database & environment config
│   │   ├── models/          # Sequelize models
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, upload, error handling
│   │   ├── utils/           # Helper functions
│   │   ├── jobs/            # Cron jobs (reminders)
│   │   └── scripts/         # Setup scripts
│   └── uploads/             # File storage
├── frontend/
│   └── src/
│       ├── components/      # React components
│       ├── contexts/        # React context (auth)
│       ├── services/        # API service layer
│       └── utils/           # Helper functions
├── docker-compose.yml       # Orchestration
└── README.md               # This file
```

## Security

- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ HTTPS only (via Coolify/Let's Encrypt)
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ XSS prevention (React escaping)
- ✅ CORS configured
- ✅ Helmet.js security headers
- ✅ File upload validation
- ✅ Image sanitization
- ✅ Admin-only routes protected

## Support

For issues or questions:
1. Check this README
2. Review logs: `docker-compose logs -f`
3. Check GitHub issues: https://github.com/vandreus/timer/issues

## License

MIT License - MOLCOM INC.

## Changelog

### v1.0.0 (Initial Release)
- Core time tracking functionality
- Admin portal
- User management
- Worksite and project management
- Task assignment
- Photo uploads
- Calendar view
- Basic reporting
- Docker deployment

### Planned Features (v1.1.0)
- Weekly reminder system
- Email notifications
- Advanced analytics
- Mobile PWA
- Dark mode
- Multi-language support
