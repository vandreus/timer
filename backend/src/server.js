import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.js';
import sequelize, { testConnection, syncDatabase } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import worksiteRoutes from './routes/worksites.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import timeEntryRoutes from './routes/timeEntries.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
  origin: env.cors.origin,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/worksites', worksiteRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/time-entries', timeEntryRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting MOLCOM INC. Time Tracker Server...');
    
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Sync database (create tables if they don't exist)
    await syncDatabase(false);

    // Start listening
    app.listen(env.server.port, () => {
      console.log(`✅ Server running on port ${env.server.port}`);
      console.log(`📊 Environment: ${env.server.env}`);
      console.log(`🌐 CORS origin: ${env.cors.origin}`);
      console.log(`🗄️  Database: ${env.database.name}`);
      console.log('');
      console.log('Available endpoints:');
      console.log('  GET  /health');
      console.log('  POST /api/auth/login');
      console.log('  GET  /api/auth/me');
      console.log('  ... (see routes for full list)');
      console.log('');
      console.log('📝 Run "npm run setup-admin" to create your admin account');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
