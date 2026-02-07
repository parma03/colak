const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const sequelize = require('./src/config/database');
const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);

// Home route redirect
app.get('/', (req, res) => {
    res.redirect('/login');
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        message: 'Halaman tidak ditemukan',
        user: req.user || null
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: 'Terjadi kesalahan server',
        user: req.user || null
    });
});

// Start server
async function startServer() {
    try {
        // Test database connection
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully');

        // Sync database
        await sequelize.sync();
        console.log('✅ Database synchronized');

        // Start listening
        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 Server is running on port ${PORT}        ║
║                                               ║
║   📍 URL: http://localhost:${PORT}            ║
║                                               ║
║   🔐 Default Accounts:                        ║
║   Admin: admin@example.com / admin123         ║
║   User:  user@example.com / user123           ║
║                                               ║
╚═══════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
}

startServer();
