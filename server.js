const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const employeeRoutes = require('./routes/employees');
const authRoutes = require('./routes/auth');
const { requireAuth } = require('./middleware/auth');
const redisClient = require('./config/redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Session configuration with Redis store
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'employee_management'
};

// Initialize database connection and store in app locals
const initDB = async () => {
    try {
        const db = await mysql.createConnection(dbConfig);
        app.locals.db = db;
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
};

// Auth routes
app.use('/', authRoutes);

// API routes (authentication handled within routes)
app.use('/api/employees', employeeRoutes);

app.get('/', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const startServer = async () => {
    try {
        await initDB();
        await redisClient.connect();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();