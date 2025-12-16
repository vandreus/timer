import dotenv from 'dotenv';

dotenv.config();

export default {
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'database',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'timetracker',
    user: process.env.DB_USER || 'timetracker',
    password: process.env.DB_PASSWORD || 'password',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  server: {
    port: parseInt(process.env.PORT || '3000'),
    env: process.env.NODE_ENV || 'development',
  },
  googleMaps: {
    apiKey: process.env.GOOGLE_MAPS_API_KEY || '',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },
  reminder: {
    cronSchedule: process.env.REMINDER_CRON_SCHEDULE || '0 8 * * 1',
    enabled: process.env.REMINDER_ENABLED === 'true',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
};
