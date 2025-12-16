# Coolify Deployment Guide

Complete step-by-step guide for deploying MOLCOM INC. Time Tracker on Coolify.

## Prerequisites

- Coolify installed on your VPS
- Domain name (timer.molcom.ca) pointing to your VPS IP
- GitHub repository access
- Google Maps API key

## Step-by-Step Deployment

### 1. Prepare GitHub Repository

**Push code to GitHub:**
```bash
git add .
git commit -m "Initial commit - MOLCOM INC. Time Tracker"
git remote add origin https://github.com/vandreus/timer.git
git push -u origin main
```

### 2. Create New Project in Coolify

1. Login to Coolify dashboard
2. Click "Projects"
3. Click "New Project"
4. Name: `MOLCOM Timer`
5. Click "Create"

### 3. Add Git Source

1. In your project, click "New Resource"
2. Select "Git Repository"
3. Connect your GitHub account (if not already)
4. Select repository: `vandreus/timer`
5. Branch: `main`
6. Auto-deploy: ✅ Enable
7. Click "Continue"

### 4. Configure Deployment Type

Coolify should automatically detect `docker-compose.yml`

1. Deployment type: **Docker Compose**
2. Build pack: Auto-detected
3. Click "Continue"

### 5. Configure Domain

1. Domain settings:
   - Primary domain: `timer.molcom.ca`
   - Enable HTTPS: ✅
   - Force HTTPS: ✅
2. SSL Certificate: Let's Encrypt (automatic)
3. Click "Save"

### 6. Environment Variables

Click "Environment Variables" and add these:

**Database Configuration:**
```env
DB_NAME=timetracker
DB_USER=timetracker
DB_PASSWORD=YourSecurePassword123!
```

**Security:**
```env
JWT_SECRET=Your-Super-Secret-JWT-Key-Change-This-In-Production-abcdef123456
JWT_EXPIRES_IN=24h
```

**Google Maps:**
```env
GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Application:**
```env
NODE_ENV=production
CORS_ORIGIN=https://timer.molcom.ca
VITE_API_URL=https://timer.molcom.ca/api
```

**File Upload:**
```env
MAX_FILE_SIZE=5242880
UPLOAD_DIR=/app/uploads
```

**Reminders:**
```env
REMINDER_ENABLED=true
REMINDER_CRON_SCHEDULE=0 8 * * 1
```

### 7. Configure Volumes

Coolify should automatically detect volumes from docker-compose.yml:

Ensure these are created:
- `postgres_data` - Database persistence
- `uploads_data` - Photos and logos

Check in "Volumes" tab:
- ✅ postgres_data → `/var/lib/postgresql/data`
- ✅ uploads_data → `/app/uploads`

### 8. Deploy

1. Review all settings
2. Click "Deploy"
3. Watch build logs in real-time
4. Wait for "Deployment successful" message

Expected build time: 3-5 minutes

### 9. Verify Deployment

**Check service health:**

1. In Coolify, go to "Services" tab
2. Verify all containers are running:
   - ✅ database (healthy)
   - ✅ backend (running)
   - ✅ frontend (running)

**Test endpoints:**

Open browser and verify:
- https://timer.molcom.ca → Should show login page
- https://timer.molcom.ca/api/health → Should return `{"status":"ok"}`

**Check SSL:**
- ✅ Green padlock in browser
- ✅ Valid Let's Encrypt certificate

### 10. Create Admin Account

**Option A: Using Coolify Terminal**

1. Go to "Services" → backend container
2. Click "Terminal"
3. Run:
```bash
npm run setup-admin
```
4. Follow prompts:
   - Username: `admin`
   - Password: (your secure password)
   - Full Name: Your Name

**Option B: Using Docker CLI**

From your VPS:
```bash
docker ps | grep backend
docker exec -it <container-id> npm run setup-admin
```

### 11. First Login

1. Go to https://timer.molcom.ca
2. Login with admin credentials
3. You should see the dashboard
4. Navigate to Admin panel to start adding:
   - Users
   - Worksites
   - Projects
   - Tasks

## Post-Deployment Configuration

### Configure Nginx (if needed)

If you need custom Nginx configuration:

1. In Coolify, go to frontend service
2. Click "Nginx Configuration"
3. Add custom rules (usually not needed)

### Setup Automatic Backups

1. Go to "Volumes" in Coolify
2. Select `postgres_data`
3. Enable "Automated Backups"
4. Set schedule (e.g., daily at 2 AM)
5. Configure backup retention (e.g., keep 7 days)

Repeat for `uploads_data` volume.

### Monitoring

**Enable health checks:**

1. Go to backend service settings
2. Enable "Health Check"
3. Endpoint: `/health`
4. Expected response: `200 OK`
5. Interval: `30s`
6. Timeout: `10s`
7. Retries: `3`

**Set up notifications:**

1. Go to Project settings
2. "Notifications" tab
3. Add webhook or email for deployment failures

### Scaling (Optional)

For high traffic, you can scale services:

1. Go to backend service
2. "Resources" tab
3. Increase:
   - CPU limit
   - Memory limit
4. For database:
   - Increase PostgreSQL resources
   - Consider dedicated database server

## Updating the Application

### Automatic Updates (Recommended)

With auto-deploy enabled:

1. Push changes to GitHub `main` branch
2. Coolify automatically detects changes
3. Builds and deploys new version
4. Zero-downtime deployment

### Manual Update

1. Go to your project in Coolify
2. Click "Redeploy"
3. Select "Force rebuild"
4. Click "Deploy"

### Rollback

If deployment fails:

1. Go to "Deployments" history
2. Find last working version
3. Click "Rollback to this version"
4. Confirm

## Troubleshooting

### Deployment Fails

**Check build logs:**
1. Click on failed deployment
2. Review build logs
3. Look for error messages

**Common issues:**
- Missing environment variables
- Docker build errors
- Network issues

**Solution:**
- Verify all env vars are set
- Check docker-compose.yml syntax
- Retry deployment

### Application Won't Start

**Check container logs:**

1. Go to Services → backend
2. Click "Logs"
3. Look for errors

**Common issues:**
- Database connection failed
- Missing environment variables
- Port conflicts

**Solutions:**
```bash
# Check database is ready
docker ps | grep postgres

# Restart backend
# In Coolify: Services → backend → Restart

# Check environment variables
# In Coolify: Environment Variables tab
```

### SSL Certificate Issues

**Symptoms:**
- "Not secure" warning
- Certificate errors

**Solutions:**

1. Verify domain DNS points to VPS:
   ```bash
   dig timer.molcom.ca
   ```

2. In Coolify:
   - Go to Domain settings
   - Click "Regenerate SSL Certificate"
   - Wait for Let's Encrypt validation

3. Check A record:
   - timer.molcom.ca → Your VPS IP
   - Wait for DNS propagation (up to 48 hours)

### Database Connection Issues

**Check:**

1. Database container is running
2. Environment variables match:
   - DB_USER, DB_PASSWORD, DB_NAME
3. Database health check passes

**Reset database (WARNING: deletes all data):**

1. Stop all services
2. Delete postgres_data volume
3. Redeploy (fresh database)
4. Run setup-admin again

### Can't Upload Photos

**Check:**

1. uploads_data volume is mounted
2. Backend has write permissions
3. File size under 5MB limit

**Solution:**
```bash
# Check volume
docker volume ls | grep uploads

# Check backend logs for upload errors
# Coolify: Services → backend → Logs
```

### Performance Issues

**Symptoms:**
- Slow page loads
- Timeout errors

**Solutions:**

1. **Increase resources:**
   - Coolify → Service settings → Resources
   - Increase CPU/Memory

2. **Database optimization:**
   - Add indexes (already done in code)
   - Increase PostgreSQL connections
   - Scale database resources

3. **Check logs:**
   - Look for slow queries
   - Check error rates

4. **Monitor:**
   - Coolify provides basic metrics
   - Add external monitoring (optional)

## Maintenance

### Regular Tasks

**Weekly:**
- ✅ Check deployment logs
- ✅ Verify backups are running
- ✅ Review error logs

**Monthly:**
- ✅ Update dependencies (if needed)
- ✅ Review and clear old backups
- ✅ Check disk space usage

**Quarterly:**
- ✅ Review security updates
- ✅ Update Docker images
- ✅ Audit user access

### Database Maintenance

**Vacuum database (monthly):**

1. Access database container terminal
2. Run:
```bash
psql -U timetracker timetracker -c "VACUUM ANALYZE;"
```

**Check database size:**
```bash
psql -U timetracker timetracker -c "SELECT pg_size_pretty(pg_database_size('timetracker'));"
```

### Log Rotation

Coolify handles log rotation automatically, but you can configure:

1. Services → backend → Advanced
2. Set "Log Retention" (e.g., 7 days)
3. Logs are automatically compressed and deleted

## Advanced Configuration

### Custom Domain Setup

To add multiple domains:

1. Coolify → Domain settings
2. Add additional domains
3. Each gets its own SSL certificate

Example:
- timer.molcom.ca (primary)
- time.molcom.ca (alias)
- molcom-timer.com (different domain)

### Environment-Specific Configs

Create different configs for staging/production:

1. Create `staging` branch
2. Add separate Coolify project
3. Use different environment variables
4. Test changes before deploying to main

### Database Backups to External Storage

1. Enable Coolify backup
2. Configure S3-compatible storage:
   - AWS S3
   - DigitalOcean Spaces
   - MinIO
3. Backups automatically upload to cloud

### Monitoring & Alerts

Integrate with external monitoring:

1. **Uptime monitoring:**
   - UptimeRobot
   - Pingdom
   - Monitor: https://timer.molcom.ca/health

2. **Log aggregation:**
   - Papertrail
   - Logtail
   - Integrate via syslog

3. **Error tracking:**
   - Sentry (add to frontend/backend)
   - Track crashes and errors

## Security Best Practices

### Environment Variables

- ✅ Use strong, unique passwords
- ✅ Rotate JWT_SECRET periodically
- ✅ Never commit .env to git
- ✅ Use Coolify's secret management

### SSL/TLS

- ✅ Always use HTTPS
- ✅ Force HTTPS redirect
- ✅ Keep certificates auto-renewed
- ✅ Use HSTS headers (Helmet.js handles this)

### Database

- ✅ Strong database password
- ✅ Database only accessible from backend
- ✅ Regular backups
- ✅ Test restore procedures

### Access Control

- ✅ Limit Coolify dashboard access
- ✅ Use SSH keys (not passwords)
- ✅ Enable 2FA for GitHub
- ✅ Audit admin users regularly

## Support

**Coolify Issues:**
- Coolify Documentation: https://coolify.io/docs
- Coolify Discord: https://discord.gg/coolify

**Application Issues:**
- GitHub: https://github.com/vandreus/timer/issues
- Check logs in Coolify dashboard

**VPS Issues:**
- Contact your hosting provider
- Check VPS resource usage

## Checklist

Before going live:

- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] All environment variables set
- [ ] Admin account created
- [ ] Test login works
- [ ] Google Maps API working
- [ ] Photo upload working
- [ ] Backups configured
- [ ] Health checks passing
- [ ] Monitoring setup
- [ ] Documentation reviewed
- [ ] Team trained on system

Congratulations! Your MOLCOM INC. Time Tracker is now live! 🎉
