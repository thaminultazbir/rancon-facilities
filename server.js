const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static Files
app.use(express.static('public')); // CSS, JS, Uploads
app.use(express.static('pages'));  // HTML Pages

// Routes
app.use('/api', require('./routes/ticketRoutes'));
app.use('/api', require('./routes/staffRoutes'));
app.use('/api', require('./routes/buildingRoutes'));
app.use('/api', require('./routes/adminRoutes'));

// Serve Pages explicitly (Optional but good for cleanliness)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'pages/index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'pages/admin.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});